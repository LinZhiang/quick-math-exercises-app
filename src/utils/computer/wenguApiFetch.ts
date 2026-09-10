/**
 * 登录 / AI 相关 API 请求（默认同源：Pages Functions 或家庭 Node）
 */
import {
  describeWenguApiTarget,
  getWenguApiOrigin,
  resolveWenguApiUrl,
  usesRemoteWenguApi,
} from '@/utils/computer/wenguApiOrigin'

export class WenguApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'WenguApiError'
    this.status = status
  }
}

function offlineHint(): string {
  if (usesRemoteWenguApi()) {
    return `无法连接自定义 API（${describeWenguApiTarget()}）。可在安装页清除自定义地址，改用本站同源服务。`
  }
  if (typeof location !== 'undefined' && location.hostname.includes('pages.dev')) {
    return (
      '无法连接本站登录服务。请确认 Cloudflare Pages 已配置 Secrets：' +
      'DEEPSEEK_API_KEY、WENGU_ADMIN_PASSWORD，并重新部署。'
    )
  }
  return (
    '无法连接本地 AI/登录代理（默认 8790）。请确认已运行 npm run dev:full，' +
    '终端出现 [quick-math-ai] http://0.0.0.0:8790 后再生成题目；不是豆包方舟主动封禁。'
  )
}

function looksLikeHtml(text: string): boolean {
  const head = text.trimStart().slice(0, 96).toLowerCase()
  return head.startsWith('<!doctype') || head.startsWith('<html') || head.startsWith('<head')
}

function nonJsonMessage(res: Response, text: string): string {
  if (looksLikeHtml(text)) {
    let path = ''
    try {
      path = new URL(res.url).pathname
    } catch {
      path = ''
    }
    if (res.status === 413) {
      return '这篇讲义太大，云端拒绝保存。请把超大图改成「拍照上传」插入，不要把原图整段塞进正文。'
    }
    if (res.status === 500) {
      return '云端保存失败（HTTP 500）。多半是这篇正文或配图把接口撑崩了。请先点取消，把大图改成拍照上传后再保存，不要连续猛点保存。'
    }
    if (res.status === 504 || res.status === 524 || res.status === 502) {
      return '云端接口超时或暂时读不到。不是没部署 Pages Functions，请稍后重试；若总失败，把这篇里的大图改成插入照片再保存。'
    }
    if (path.includes('computer-basics') || path.includes('/api/media/computer-basics')) {
      return (
        '云端计算机基础接口返回了网页而不是数据（HTTP ' +
        res.status +
        '）。先确认开的是 pages.dev 本站，不要填错自定义 API。这与 DEEPSEEK_API_KEY 无关。'
      )
    }
    if (path.includes('frontend-learning') || path.includes('/api/media/frontend-learning')) {
      return (
        '云端前端学习接口返回了网页而不是数据（HTTP ' +
        res.status +
        '）。先确认开的是 pages.dev 本站，不要填错自定义 API。这与 DEEPSEEK_API_KEY 无关。'
      )
    }
    return `接口返回了网页而不是数据（${path || `HTTP ${res.status}`}）。${offlineHint()}`
  }
  return `服务器返回了非 JSON（HTTP ${res.status}）。${offlineHint()}`
}

export async function readWenguJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text.trim()) {
    throw new WenguApiError(`${offlineHint()}（HTTP ${res.status}，空响应）`, res.status)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new WenguApiError(nonJsonMessage(res, text), res.status)
  }
}

export async function wenguApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = resolveWenguApiUrl(path)
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        'X-Wengu-Client': 'app',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new WenguApiError(offlineHint())
  }
}

export type WenguServerProbe = {
  ok: boolean
  message: string
  authEnabled?: boolean
  apiTarget?: string
  hosting?: string
}

export async function probeWenguAuthServer(): Promise<WenguServerProbe> {
  const apiTarget = describeWenguApiTarget()
  try {
    const res = await wenguApiFetch('/auth/config')
    const data = await readWenguJsonResponse<{
      ok?: boolean
      authEnabled?: boolean
      hosting?: string
      alwaysOn?: boolean
    }>(res)
    if (!res.ok || !data.ok) {
      return { ok: false, message: `服务端异常（HTTP ${res.status}）`, apiTarget }
    }
    if (!data.authEnabled) {
      return {
        ok: false,
        message:
          '云端尚未配置管理员密码。本地 server/.env 不会自动同步到 Cloudflare；请执行 npm run sync:cf-secrets，或在 Pages → Settings → Secrets 添加 WENGU_ADMIN_PASSWORD、DEEPSEEK_API_KEY（及可选 DOUBAO_*）后重新部署。',
        authEnabled: false,
        apiTarget,
        hosting: data.hosting,
      }
    }
    const onPages = data.hosting === 'cloudflare-pages' || data.alwaysOn
    return {
      ok: true,
      message: onPages
        ? '已连接云端登录服务（出门可直接用本站，无需开电脑）'
        : usesRemoteWenguApi()
          ? `已连接远程 API：${apiTarget}`
          : '已连接登录服务',
      authEnabled: true,
      apiTarget,
      hosting: data.hosting,
    }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : offlineHint(),
      apiTarget,
    }
  }
}

export { describeWenguApiTarget, getWenguApiOrigin, usesRemoteWenguApi }
