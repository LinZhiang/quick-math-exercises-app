/**
 * 登录 / AI 相关 API 请求
 */
import {
  describeWenguApiTarget,
  getWenguApiOrigin,
  resolveWenguApiUrl,
  usesRemoteWenguApi,
} from '@/utils/wenguApiOrigin'

export class WenguApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'WenguApiError'
    this.status = status
  }
}

function offlineHint(): string {
  const pageOrigin = typeof location !== 'undefined' ? location.origin : ''
  const apiTarget = describeWenguApiTarget()

  if (usesRemoteWenguApi()) {
    return `无法连接 API 服务（${apiTarget}）。请确认电脑已运行 npm run serve:install，且 Cloudflare 隧道/公网映射正常。`
  }

  if (pageOrigin.includes('pages.dev')) {
    return (
      '当前为 Cloudflare 静态页，未配置后端 API。请在 server/.env 设置 WENGU_PUBLIC_API_URL（家庭服务公网地址），' +
      'Cloudflare Pages 环境变量 VITE_WENGU_API_ORIGIN 与之相同，然后重新部署。'
    )
  }

  const port = typeof location !== 'undefined' ? location.port : ''
  if (port && port !== '8790') {
    return `当前页面 ${pageOrigin}，请用手机打开 https://电脑WiFiIP:8790，或在配置中填写 WENGU_PUBLIC_API_URL。`
  }

  return '无法连接登录服务：请确认电脑已执行 npm run serve:install，手机与电脑在同一 WiFi，地址为 https://电脑IP:8790'
}

export async function readWenguJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text.trim()) {
    if (!res.ok) {
      throw new WenguApiError(`${offlineHint()}（HTTP ${res.status}，空响应）`, res.status)
    }
    throw new WenguApiError(offlineHint())
  }
  try {
    return JSON.parse(text) as T
  } catch {
    const looksHtml = /^\s*</.test(text)
    const extra = looksHtml && !getWenguApiOrigin() && typeof location !== 'undefined' && location.hostname.includes('pages.dev')
      ? ' 检测到 HTML 页面：静态托管未配置 VITE_WENGU_API_ORIGIN。'
      : ''
    throw new WenguApiError(
      `服务器返回了非 JSON 内容（HTTP ${res.status}）。${offlineHint()}${extra}`,
      res.status,
    )
  }
}

export async function wenguApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = resolveWenguApiUrl(path)
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
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
}

export async function probeWenguAuthServer(): Promise<WenguServerProbe> {
  const apiTarget = describeWenguApiTarget()
  try {
    const res = await wenguApiFetch('/auth/config')
    const data = await readWenguJsonResponse<{
      ok?: boolean
      authEnabled?: boolean
    }>(res)
    if (!res.ok || !data.ok) {
      return { ok: false, message: `服务端异常（HTTP ${res.status}）`, apiTarget }
    }
    if (!data.authEnabled) {
      return {
        ok: false,
        message: '服务端未配置登录：请在 server/.env 填写 WENGU_ADMIN_PASSWORD 并重启服务',
        authEnabled: false,
        apiTarget,
      }
    }
    return {
      ok: true,
      message: usesRemoteWenguApi()
        ? `已连接远程 API：${apiTarget}`
        : '已连接家庭登录服务',
      authEnabled: true,
      apiTarget,
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
