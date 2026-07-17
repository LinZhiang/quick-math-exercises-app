/**
 * 前端 API 根地址。
 * 默认同源：Cloudflare Pages（functions）或家庭 serve:install 均一步到位。
 * 仅高级场景才用 localStorage / VITE_WENGU_API_ORIGIN 覆盖。
 */
const BUILD_ORIGIN =
  (import.meta.env.VITE_WENGU_API_ORIGIN as string | undefined)?.trim().replace(/\/$/, '') ?? ''

export const WENGU_API_ORIGIN_STORAGE_KEY = 'wengu-api-origin-v1'

function readStoredOrigin(): string {
  try {
    if (typeof localStorage === 'undefined') return ''
    const v = (localStorage.getItem(WENGU_API_ORIGIN_STORAGE_KEY) || '').trim().replace(/\/$/, '')
    // 清除误填的示例占位
    if (/xxxx\.trycloudflare\.com/i.test(v)) {
      localStorage.removeItem(WENGU_API_ORIGIN_STORAGE_KEY)
      return ''
    }
    return v
  } catch {
    return ''
  }
}

export function getWenguApiOrigin(): string {
  return readStoredOrigin() || BUILD_ORIGIN
}

export function setWenguApiOriginOverride(raw: string | null): string {
  const next = (raw ?? '').trim().replace(/\/$/, '')
  try {
    if (typeof localStorage === 'undefined') return next
    if (!next) localStorage.removeItem(WENGU_API_ORIGIN_STORAGE_KEY)
    else localStorage.setItem(WENGU_API_ORIGIN_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  return next
}

export function clearWenguApiOriginOverride(): void {
  setWenguApiOriginOverride(null)
}

export function usesRemoteWenguApi(): boolean {
  const configured = getWenguApiOrigin()
  if (!configured) return false
  if (typeof location === 'undefined') return true
  return configured !== location.origin
}

export function resolveWenguApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const origin = getWenguApiOrigin()
  if (!origin) return p
  return `${origin}${p}`
}

export function describeWenguApiTarget(): string {
  const origin = getWenguApiOrigin()
  if (!origin) {
    return typeof location !== 'undefined' ? location.origin : '同源'
  }
  return origin
}

export function getBuildTimeWenguApiOrigin(): string {
  return BUILD_ORIGIN
}
