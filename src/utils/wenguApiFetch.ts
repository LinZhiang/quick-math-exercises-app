/**
 * 登录 / AI 相关 API 请求（同源 family serve :8790）
 */

export class WenguApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'WenguApiError'
    this.status = status
  }
}

function offlineHint(): string {
  const origin = typeof location !== 'undefined' ? location.origin : ''
  const port = typeof location !== 'undefined' ? location.port : ''
  if (port && port !== '8790') {
    return `当前页面地址为 ${origin}，登录需要家庭 Node 服务（端口 8790）。请在电脑执行 npm run serve:install，用手机打开 https://电脑WiFiIP:8790`
  }
  return '无法连接登录服务：请确认电脑已执行 npm run serve:install，手机与电脑在同一 WiFi，且地址为 https://电脑IP:8790'
}

export async function readWenguJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text.trim()) {
    if (!res.ok) {
      throw new WenguApiError(
        `${offlineHint()}（HTTP ${res.status}，空响应）`,
        res.status,
      )
    }
    throw new WenguApiError(offlineHint())
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new WenguApiError(
      `服务器返回了非 JSON 内容（HTTP ${res.status}）。${offlineHint()}`,
      res.status,
    )
  }
}

export async function wenguApiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(path, {
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
}

export async function probeWenguAuthServer(): Promise<WenguServerProbe> {
  try {
    const res = await wenguApiFetch('/auth/config')
    const data = await readWenguJsonResponse<{
      ok?: boolean
      authEnabled?: boolean
    }>(res)
    if (!res.ok || !data.ok) {
      return { ok: false, message: `服务端异常（HTTP ${res.status}）` }
    }
    if (!data.authEnabled) {
      return {
        ok: false,
        message: '服务端未配置登录：请在 server/.env 填写 WENGU_ADMIN_PASSWORD 并重启服务',
        authEnabled: false,
      }
    }
    return { ok: true, message: '已连接家庭登录服务', authEnabled: true }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : offlineHint(),
    }
  }
}
