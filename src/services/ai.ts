/**
 * 通用 AI Chat Completions（OpenAI 兼容）
 * 手动选择 provider：doubao | deepseek（默认 deepseek）
 * capability：text | vision（vision 仅 doubao）
 */
import {
  getAiProvider,
  providerSupportsVision,
  type AiCapability,
  type AiProvider,
  AI_VISION_UNSUPPORTED_HINT,
} from '@/utils/aiProviderStore'
import {
  getWenguAuthToken,
  hydrateWenguAuthStore,
  WENGU_ACCOUNT_DISABLED_HINT,
  WENGU_LOGIN_REQUIRED_HINT,
} from '@/utils/wenguAuthStore'
import { wenguApiFetch } from '@/utils/wenguApiFetch'
import { resolveDeepSeekApiKey } from '@/utils/deepseekApiKeyStore'

export type { AiCapability, AiProvider }
export {
  getAiProvider,
  setAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
  aiRequestProgressText,
  providerSupportsVision,
  assertVisionAllowed,
  AI_VISION_UNSUPPORTED_HINT,
  aiProviderTick,
} from '@/utils/aiProviderStore'

const WENGU_AI_SOURCE = 'quick-math-exercises-app'
const DEEPSEEK_DIRECT_API = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_DEFAULT_MODEL = 'deepseek-v4-flash'

export type AiTextPart = { type: 'text'; text: string }
export type AiImageUrlPart = {
  type: 'image_url'
  image_url: { url: string; detail?: 'auto' | 'low' | 'high' }
}
export type AiContentPart = AiTextPart | AiImageUrlPart

export type AiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string | AiContentPart[]
}

export type AiChatCompletionOptions = {
  /** 默认取本地手动选择；也可单次覆盖 */
  provider?: AiProvider
  /** 默认 text；vision 仅 doubao */
  capability?: AiCapability
  temperature?: number
  maxTokens?: number
  /** 透传上游；true 时请用 aiChatCompletionStream */
  stream?: boolean
  /** 可选覆盖模型（deepseek 有效；doubao 由服务端 DOUBAO_MODEL_ID 决定） */
  model?: string
}

export class AiUpstreamError extends Error {
  readonly status: number
  readonly code: string
  readonly provider: AiProvider
  readonly type: string

  constructor(input: {
    message: string
    status: number
    code: string
    provider: AiProvider
    type?: string
  }) {
    super(input.message)
    this.name = 'AiUpstreamError'
    this.status = input.status
    this.code = input.code
    this.provider = input.provider
    this.type = input.type ?? 'upstream_error'
  }
}

/** 去掉 image_url，仅保留文本（DeepSeek 上游不接受多模态） */
export function stripVisionFromMessages(messages: AiMessage[]): AiMessage[] {
  return messages.map((m) => {
    if (typeof m.content === 'string') return m
    const texts = m.content
      .filter((p): p is AiTextPart => p.type === 'text')
      .map((p) => p.text)
      .filter(Boolean)
    const joined = texts.join('\n').trim()
    return { ...m, content: joined || '（已移除图片内容）' }
  })
}

function resolveModel(provider: AiProvider, override?: string): string {
  if (override?.trim()) return override.trim()
  if (provider === 'deepseek') {
    return import.meta.env.VITE_DEEPSEEK_MODEL?.trim() || DEEPSEEK_DEFAULT_MODEL
  }
  // doubao：占位即可，服务端强制使用 DOUBAO_MODEL_ID
  return 'doubao-seed-2-1-pro-260628'
}

function buildRequestBody(
  messages: AiMessage[],
  provider: AiProvider,
  options?: AiChatCompletionOptions,
) {
  const capability = options?.capability ?? 'text'
  let outbound = messages
  if (provider === 'deepseek') {
    outbound = stripVisionFromMessages(messages)
  }
  return {
    provider,
    capability,
    model: resolveModel(provider, options?.model),
    messages: outbound,
    temperature: options?.temperature ?? 0.35,
    max_tokens: options?.maxTokens ?? 8192,
    stream: Boolean(options?.stream),
  }
}

async function parseErrorResponse(
  res: Response,
  provider: AiProvider,
): Promise<never> {
  const status = res.status
  const errText = await res.text().catch(() => '')
  let payload: {
    error?: { message?: string; type?: string; code?: string; provider?: string }
  } = {}
  try {
    payload = JSON.parse(errText) as typeof payload
  } catch {
    throw new AiUpstreamError({
      message: `AI 请求失败 (${status})：${errText.slice(0, 200)}`,
      status,
      code: status === 429 ? 'UPSTREAM_429' : status === 504 ? 'UPSTREAM_504' : `HTTP_${status}`,
      provider,
    })
  }
  const err = payload.error
  const code =
    err?.code ||
    (status === 429 ? 'UPSTREAM_429' : status === 504 ? 'UPSTREAM_504' : `HTTP_${status}`)
  const message =
    err?.message ||
    (status === 429
      ? `${provider} 上游限流（429），请稍后重试或手动切换其他模型`
      : status === 504
        ? `${provider} 上游超时（504），请稍后重试或手动切换其他模型`
        : `AI 请求失败 (${status})`)
  throw new AiUpstreamError({
    message,
    status,
    code,
    provider,
    type: err?.type,
  })
}

async function extractAssistantText(res: Response): Promise<string> {
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | AiContentPart[]; reasoning_content?: string } }>
  }
  const msg = data.choices?.[0]?.message
  const raw = msg?.content ?? msg?.reasoning_content ?? ''
  const text =
    typeof raw === 'string'
      ? raw.trim()
      : Array.isArray(raw)
        ? raw
            .filter((p): p is AiTextPart => p?.type === 'text')
            .map((p) => p.text)
            .join('')
            .trim()
        : ''
  if (!text) throw new Error('AI 未返回有效内容')
  return text
}

/**
 * 通用非流式对话。返回 choices[0].message.content 文本。
 * 业务出题 / JSON 解析逻辑无需改动，继续消费本函数返回的字符串即可。
 */
export async function aiChatCompletion(
  messages: AiMessage[],
  options?: AiChatCompletionOptions,
): Promise<string> {
  if (options?.stream) {
    throw new Error('流式请求请使用 aiChatCompletionStream')
  }
  const provider = options?.provider ?? getAiProvider()
  const capability = options?.capability ?? 'text'

  if (capability === 'vision' && !providerSupportsVision(provider)) {
    throw new Error(AI_VISION_UNSUPPORTED_HINT)
  }

  await hydrateWenguAuthStore()
  const sessionToken = getWenguAuthToken()
  const body = JSON.stringify(buildRequestBody(messages, provider, options))

  if (sessionToken) {
    const res = await wenguApiFetch('/api/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'X-Wengu-Ai-Source': WENGU_AI_SOURCE,
        'X-Wengu-Ai-Provider': provider,
      },
      body,
    })
    if (res.status === 401) {
      const errText = await res.text().catch(() => '')
      let serverMsg = ''
      try {
        serverMsg = String((JSON.parse(errText) as { error?: { message?: string } })?.error?.message || '')
      } catch {
        /* ignore */
      }
      throw new Error(serverMsg || WENGU_LOGIN_REQUIRED_HINT)
    }
    if (res.status === 403) throw new Error(WENGU_ACCOUNT_DISABLED_HINT)
    if (!res.ok) await parseErrorResponse(res, provider)
    return extractAssistantText(res)
  }

  // 无登录会话时：仅允许 DeepSeek 直连（开发/旧授权）；豆包必须走代理
  if (provider === 'doubao') {
    throw new Error(
      '豆包需通过已登录的服务端代理调用。安装页虽可能曾显示登录，请到「导览 → 安装」重新登录后再试。',
    )
  }

  const key = await resolveDeepSeekApiKey()
  if (!key) throw new Error(WENGU_LOGIN_REQUIRED_HINT)

  const directPayload = buildRequestBody(messages, 'deepseek', options)
  const { provider: _p, capability: _c, ...directBody } = directPayload

  const res = await fetch(DEEPSEEK_DIRECT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'X-Wengu-Ai-Source': WENGU_AI_SOURCE,
    },
    body: JSON.stringify(directBody),
  })
  if (!res.ok) await parseErrorResponse(res, 'deepseek')
  return extractAssistantText(res)
}

/**
 * 流式透传：返回上游 Response（SSE）。不自动降级到另一提供商。
 */
export async function aiChatCompletionStream(
  messages: AiMessage[],
  options?: Omit<AiChatCompletionOptions, 'stream'>,
): Promise<Response> {
  const provider = options?.provider ?? getAiProvider()
  const capability = options?.capability ?? 'text'
  if (capability === 'vision' && !providerSupportsVision(provider)) {
    throw new Error(AI_VISION_UNSUPPORTED_HINT)
  }

  await hydrateWenguAuthStore()
  const sessionToken = getWenguAuthToken()
  if (!sessionToken) {
    throw new Error(WENGU_LOGIN_REQUIRED_HINT)
  }

  const body = JSON.stringify(
    buildRequestBody(messages, provider, { ...options, stream: true }),
  )
  const res = await wenguApiFetch('/api/ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
      'X-Wengu-Ai-Source': WENGU_AI_SOURCE,
      'X-Wengu-Ai-Provider': provider,
    },
    body,
  })
  if (res.status === 401) throw new Error(WENGU_LOGIN_REQUIRED_HINT)
  if (res.status === 403) throw new Error(WENGU_ACCOUNT_DISABLED_HINT)
  if (!res.ok) await parseErrorResponse(res, provider)
  return res
}
