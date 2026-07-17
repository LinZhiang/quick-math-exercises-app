/**
 * 口算练习 — DeepSeek 转发核心（密钥仅在 server/.env）
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '.env')

export const PORT = Number(process.env.PORT || 8790)
const DEEPSEEK_KEY = (process.env.DEEPSEEK_API_KEY || '').trim()
const UPSTREAM = (process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com').replace(/\/$/, '')
const FLASH_FALLBACK = 'deepseek-v4-flash'

export function hasDeepseekApiKey() {
  return Boolean(DEEPSEEK_KEY)
}

export function warnIfMissingEnv() {
  if (!fs.existsSync(envFile)) {
    // eslint-disable-next-line no-console
    console.warn(
      '[quick-math-ai] 未找到 server/.env。请执行 npm run sync:env，或复制 server/.env.example 为 server/.env 并填写 DEEPSEEK_API_KEY。',
    )
  } else {
    if (!DEEPSEEK_KEY) {
      // eslint-disable-next-line no-console
      console.warn('[quick-math-ai] 警告：server/.env 中未配置 DEEPSEEK_API_KEY')
    }
    if (!isAuthConfigured()) {
      // eslint-disable-next-line no-console
      console.warn(
        '[quick-math-ai] 警告：未配置 WENGU_ADMIN_PASSWORD，语文 AI 登录不可用。请在 server/.env 设置管理员密码。',
      )
    }
  }
}

function normalizeOutboundModel(model) {
  const m = String(model ?? '').trim()
  return m || FLASH_FALLBACK
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
      hasApiKey: hasDeepseekApiKey(),
      authEnabled: isAuthConfigured(),
      upstream: UPSTREAM,
    })
  })

  app.get('/status/summary', (_req, res) => {
    const recent = readRecentAiRequestLogs(50)
    const summary = summarizeRecentLogs(recent)
    res.json({
      ok: true,
      hasApiKey: hasDeepseekApiKey(),
      upstream: UPSTREAM,
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
        },
      })
      return
    }

    if (!DEEPSEEK_KEY) {
      res.status(503).json({
        error: {
          message: '服务端未配置 DEEPSEEK_API_KEY，请在 server/.env 填写密钥',
          type: 'proxy_config',
        },
      })
      return
    }

    const body = { ...(req.body ?? {}) }
    const user = req.wenguUser
    const source = String(req.headers['x-wengu-ai-source'] ?? 'unknown').slice(0, 64)
    const model = normalizeOutboundModel(body.model)
    body.model = model
    // eslint-disable-next-line no-console
    console.log(`[quick-math-ai] model=${model} source=${source} user=${user?.username ?? '?'}`)

    let upstreamStatus = 0
    let usage = null

    try {
      const upstreamRes = await fetch(`${UPSTREAM}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_KEY}`,
        },
        body: JSON.stringify(body),
      })

      upstreamStatus = upstreamRes.status
      const ct = upstreamRes.headers.get('content-type') || 'application/json'
      const buf = Buffer.from(await upstreamRes.arrayBuffer())

      if (ct.includes('json')) {
        try {
          const parsed = JSON.parse(buf.toString('utf8'))
          usage = parsed.usage ?? null
        } catch {
          /* ignore */
        }
      }

      appendAiRequestLog({
        model,
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
      appendAiRequestLog({
        model,
        source,
        status: 502,
        ok: false,
        error: msg,
      })
      // eslint-disable-next-line no-console
      console.error('[quick-math-ai] 访问上游失败:', e)
      res.status(502).json({
        error: {
          message: `AI 代理转发失败：${msg}`,
          type: 'proxy_fetch',
          hint: '请确认 server/.env 已配置 DEEPSEEK_API_KEY，且本机可访问 api.deepseek.com。',
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
  console.log(`[quick-math-ai] http://0.0.0.0:${PORT}  →  ${UPSTREAM}/chat/completions`)
}

export function onListenError(err) {
  if (err && err.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(`[quick-math-ai] 端口 ${PORT} 已被占用，请关闭占用进程后重试。`)
    process.exit(1)
  }
  throw err
}
