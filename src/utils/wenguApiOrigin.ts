/**
 * 前端 API 根地址。
 * 默认同源：Cloudflare Pages（functions）或家庭 serve:install 均一步到位。
 * 仅高级场景才用 localStorage / VITE_WENGU_API_ORIGIN 覆盖。
 * 成员账号必须填写自定义地址，不能使用本站默认接口。
 */
const BUILD_ORIGIN =
  (import.meta.env.VITE_WENGU_API_ORIGIN as string | undefined)?.trim().replace(/\/$/, '') ?? ''

export const WENGU_API_ORIGIN_STORAGE_KEY = 'wengu-api-origin-v1'

export const WENGU_MEMBER_CUSTOM_API_HINT =
  '成员账号不能使用本站默认 API。请到「导览 → 安装」登录后填写你自己的 API 地址并重新登录。'

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

/** 是否已在本机保存「自定义 API」覆盖（不含构建期默认） */
export function hasWenguApiOriginOverride(): boolean {
  return Boolean(readStoredOrigin())
}

/**
 * 成员是否已配置可用的自定义 API（非空，且不是当前页同源 / 构建默认地址）。
 */
export function isMemberCustomApiOriginValid(): boolean {
  const stored = readStoredOrigin()
  if (!stored || !/^https?:\/\//i.test(stored)) return false
  if (typeof location !== 'undefined' && stored === location.origin) return false
  if (BUILD_ORIGIN && stored === BUILD_ORIGIN) return false
  return true
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
