/**
 * 登录 / AI 相关 API 请求（默认同源：Pages Functions 或家庭 Node）
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
  if (usesRemoteWenguApi()) {
    return `无法连接自定义 API（${describeWenguApiTarget()}）。可在安装页清除自定义地址，改用本站同源服务。`
  }
  if (typeof location !== 'undefined' && location.hostname.includes('pages.dev')) {
    return (
      '无法连接本站登录服务。请确认 Cloudflare Pages 已配置 Secrets：' +
      'DEEPSEEK_API_KEY、WENGU_ADMIN_PASSWORD，并重新部署。'
    )
  }
  return '无法连接登录服务。本地请运行 npm run serve:install；公网请用已配置 Secrets 的 pages.dev。'
}

export async function readWenguJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text.trim()) {
    throw new WenguApiError(`${offlineHint()}（HTTP ${res.status}，空响应）`, res.status)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new WenguApiError(
      `服务器返回了非 JSON（HTTP ${res.status}）。${offlineHint()}`,
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
        message: '未配置管理员密码：请在 Cloudflare Secrets / server/.env 设置 WENGU_ADMIN_PASSWORD',
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
