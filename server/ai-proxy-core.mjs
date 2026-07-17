/**
 * 口算练习 — AI 转发核心（DeepSeek / 豆包双上游，手动切换，不自动降级）
 */
import './load-env.mjs'
import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { attachAuthRoutes, isAuthConfigured, noStoreCacheMiddleware, requireAuth } from './auth-core.mjs'
import {
  appendAiRequestLog,
  readRecentAiRequestLogs,
  summarizeRecentLogs,
} from './ai-request-log.mjs'
import {
  mapUpstreamErrorMeta,
  normalizeAiProvider,
  resolveAiUpstream,
  stripProxyOnlyFields,
} from './ai-upstream.mjs'
import { Agent, fetch as undiciFetch } from 'undici'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '.env')

export const PORT = Number(process.env.PORT || 8790)

/** 豆包出题可能较慢：拉长等响应头/正文超时（默认 undici ~5min 仍可能不够） */
const UPSTREAM_AGENT = new Agent({
  connectTimeout: 60_000,
  headersTimeout: 900_000,
  bodyTimeout: 900_000,
})

function envBag() {
  return process.env
}

export function hasDeepseekApiKey() {
  return Boolean(String(process.env.DEEPSEEK_API_KEY || '').trim())
}

export function hasDoubaoApiKey() {
  return Boolean(
    String(process.env.DOUBAO_API_KEY || '').trim() &&
      String(process.env.DOUBAO_MODEL_ID || '').trim(),
  )
}

export function warnIfMissingEnv() {
  if (!fs.existsSync(envFile)) {
    // eslint-disable-next-line no-console
    console.warn(
      '[quick-math-ai] 未找到 server/.env。请执行 npm run sync:env，或复制 server/.env.example 为 server/.env 并填写密钥。',
    )
  } else {
    if (!hasDeepseekApiKey()) {
      // eslint-disable-next-line no-console
      console.warn('[quick-math-ai] 警告：server/.env 中未配置 DEEPSEEK_API_KEY')
    }
    if (!hasDoubaoApiKey()) {
      // eslint-disable-next-line no-console
      console.warn(
        '[quick-math-ai] 提示：未完整配置豆包（DOUBAO_API_KEY + DOUBAO_MODEL_ID）；选择 doubao 时将不可用',
      )
    }
    if (!isAuthConfigured()) {
      // eslint-disable-next-line no-console
      console.warn(
        '[quick-math-ai] 警告：未配置 WENGU_ADMIN_PASSWORD，语文 AI 登录不可用。请在 server/.env 设置管理员密码。',
      )
    }
  }
}

const CORS_ORIGIN_RAW = (process.env.CORS_ORIGIN || '').trim()

export function createAiProxyApp() {
  const app = express()
  app.disable('x-powered-by')

  const corsMiddleware =
    CORS_ORIGIN_RAW ?
      cors({
        origin: CORS_ORIGIN_RAW.split(',').map((s) => s.trim()).filter(Boolean),
        credentials: false,
      })
    : cors({ origin: true })

  app.use(corsMiddleware)
  app.use(noStoreCacheMiddleware)
  app.use(express.json({ limit: '32mb' }))

  attachAuthRoutes(app)

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      hasApiKey: hasDeepseekApiKey() || hasDoubaoApiKey(),
      hasDeepseekApiKey: hasDeepseekApiKey(),
      hasDoubaoApiKey: hasDoubaoApiKey(),
      authEnabled: isAuthConfigured(),
      providers: ['deepseek', 'doubao'],
    })
  })

  app.get('/status/summary', (_req, res) => {
    const recent = readRecentAiRequestLogs(50)
    const summary = summarizeRecentLogs(recent)
    res.json({
      ok: true,
      hasApiKey: hasDeepseekApiKey() || hasDoubaoApiKey(),
      hasDeepseekApiKey: hasDeepseekApiKey(),
      hasDoubaoApiKey: hasDoubaoApiKey(),
      port: PORT,
      recentCount: recent.length,
      lastRequestAt: recent.at(-1)?.at ?? null,
      ...summary,
      recent: recent.slice(-10),
    })
  })

  async function handleChatCompletions(req, res) {
    if (!isAuthConfigured()) {
      res.status(503).json({
        error: {
          message: '服务端未配置登录：请在 server/.env 填写 WENGU_ADMIN_PASSWORD',
          type: 'auth_config',
          code: 'AUTH_CONFIG',
        },
      })
      return
    }

    const rawBody = { ...(req.body ?? {}) }
    const provider = normalizeAiProvider(
      rawBody.provider ?? req.headers['x-wengu-ai-provider'],
    )
    const upstream = resolveAiUpstream(envBag(), provider, String(rawBody.model ?? ''))

    if (!upstream.configured) {
      res.status(503).json({
        error: {
          message: upstream.missingHint || `服务端未配置 ${provider}`,
          type: 'proxy_config',
          code: 'PROXY_CONFIG',
          provider,
        },
      })
      return
    }

    const body = stripProxyOnlyFields(rawBody)
    body.model = upstream.model
    // 结构化出题：默认关闭深度思考，避免 reasoning 拖到 HeadersTimeout
    if (provider === 'doubao' && body.thinking == null) {
      const mode = String(process.env.DOUBAO_THINKING || 'disabled').trim().toLowerCase()
      body.thinking = {
        type: mode === 'enabled' || mode === 'auto' ? mode : 'disabled',
      }
    }

    const user = req.wenguUser
    const source = String(req.headers['x-wengu-ai-source'] ?? 'unknown').slice(0, 64)
    // eslint-disable-next-line no-console
    console.log(
      `[quick-math-ai] provider=${provider} model=${upstream.model} thinking=${body.thinking?.type ?? '-'} source=${source} user=${user?.username ?? '?'}`,
    )

    let upstreamStatus = 0
    let usage = null

    try {
      const upstreamRes = await undiciFetch(`${upstream.base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${upstream.apiKey}`,
        },
        body: JSON.stringify(body),
        dispatcher: UPSTREAM_AGENT,
      })

      upstreamStatus = upstreamRes.status
      const ct = upstreamRes.headers.get('content-type') || 'application/json'
      const buf = Buffer.from(await upstreamRes.arrayBuffer())

      const mapped = mapUpstreamErrorMeta(upstreamStatus, provider)
      if (mapped && ct.includes('json')) {
        appendAiRequestLog({
          model: `${provider}:${upstream.model}`,
          source,
          status: upstreamStatus,
          ok: false,
          promptTokens: null,
          completionTokens: null,
          totalTokens: null,
        })
        res.status(upstreamStatus).json({
          error: {
            message: mapped.message,
            type: mapped.type,
            code: mapped.code,
            provider,
          },
        })
        return
      }

      if (ct.includes('json') && body.stream !== true) {
        try {
          const parsed = JSON.parse(buf.toString('utf8'))
          usage = parsed.usage ?? null
        } catch {
          /* ignore */
        }
      }

      appendAiRequestLog({
        model: `${provider}:${upstream.model}`,
        source,
        status: upstreamStatus,
        ok: upstreamStatus >= 200 && upstreamStatus < 300,
        promptTokens: usage?.prompt_tokens ?? null,
        completionTokens: usage?.completion_tokens ?? null,
        totalTokens: usage?.total_tokens ?? null,
      })

      res.status(upstreamRes.status).type(ct).send(buf)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'upstream fetch failed'
      const isTimeout =
        /timeout|aborted|ETIMEDOUT|TimeoutError|HeadersTimeout|BodyTimeout|UND_ERR_/i.test(msg) ||
        (e && typeof e === 'object' && e.cause && /Timeout/i.test(String(e.cause.code || e.cause)))

      appendAiRequestLog({
        model: `${provider}:${upstream.model}`,
        source,
        status: isTimeout ? 504 : 502,
        ok: false,
        error: msg,
      })
      // eslint-disable-next-line no-console
      console.error('[quick-math-ai] 访问上游失败:', e)
      res.status(isTimeout ? 504 : 502).json({
        error: {
          message: isTimeout
            ? `${provider} 上游超时，请稍后重试。不会自动切换其他模型，请手动切换。`
            : `AI 代理转发失败：${msg}`,
          type: isTimeout ? 'upstream_timeout' : 'proxy_fetch',
          code: isTimeout ? 'UPSTREAM_504' : 'PROXY_FETCH',
          provider,
          hint:
            provider === 'doubao'
              ? '请确认 server/.env 已配置 DOUBAO_API_KEY、DOUBAO_MODEL_ID，且可访问 ark.cn-beijing.volces.com。'
              : '请确认 server/.env 已配置 DEEPSEEK_API_KEY，且本机可访问 api.deepseek.com。',
        },
      })
    }
  }

  app.post('/v1/chat/completions', requireAuth, handleChatCompletions)
  app.post('/api/ai/chat/completions', requireAuth, handleChatCompletions)

  return app
}

export function logStartup() {
  // eslint-disable-next-line no-console
  console.log(
    `[quick-math-ai] http://0.0.0.0:${PORT}  →  deepseek|doubao /chat/completions（手动切换，无自动降级）`,
  )
}

export function onListenError(err) {
  if (err && err.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(`[quick-math-ai] 端口 ${PORT} 已被占用，请关闭占用进程后重试。`)
    process.exit(1)
  }
  throw err
}
