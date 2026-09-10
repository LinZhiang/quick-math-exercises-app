/**
 * 写接口要求自定义头 + 合法 Origin，减轻 CSRF（鉴权仍靠 Bearer）。
 */
function originHost(url) {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

export async function onRequest(context) {
  const { request, next } = context
  const method = String(request.method || '').toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next()

  const client = String(request.headers.get('x-wengu-client') || '')
  if (client !== 'app') {
    return new Response(JSON.stringify({ ok: false, message: '非法请求来源' }), {
      status: 403,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    })
  }

  const origin = String(request.headers.get('origin') || '')
  if (origin) {
    const host = originHost(origin)
    const self = originHost(request.url)
    const extra = String(context.env?.CORS_ORIGIN || '')
      .split(',')
      .map((s) => originHost(s.trim()) || s.trim())
      .filter(Boolean)
    const ok =
      host === self ||
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.endsWith('.pages.dev') ||
      extra.includes(host)
    if (!ok) {
      return new Response(JSON.stringify({ ok: false, message: '跨站请求已拒绝' }), {
        status: 403,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      })
    }
  }

  return next()
}
