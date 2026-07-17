/**
 * 前端 API 根地址。
 * - 空：与页面同源（npm run serve:install / 局域网 :8790）
 * - 有值：Cloudflare Pages 等静态托管，请求打到公网/隧道后的家庭 Node 服务
 */
const configured = (import.meta.env.VITE_WENGU_API_ORIGIN as string | undefined)?.trim().replace(/\/$/, '') ?? ''

export function getWenguApiOrigin(): string {
  return configured
}

export function usesRemoteWenguApi(): boolean {
  if (!configured) return false
  if (typeof location === 'undefined') return true
  return configured !== location.origin
}

export function resolveWenguApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (!configured) return p
  return `${configured}${p}`
}

export function describeWenguApiTarget(): string {
  if (!configured) {
    const origin = typeof location !== 'undefined' ? location.origin : '同源'
    return origin
  }
  return configured
}
