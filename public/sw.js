const CACHE = 'quick-math-v6'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const assets = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']
      await Promise.all(
        assets.map(async (url) => {
          try {
            await cache.add(url)
          } catch {
            /* 个别资源失败不阻断 SW 安装 */
          }
        }),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

function shouldBypassCache(url) {
  const p = url.pathname
  return (
    p.startsWith('/api/') ||
    p.startsWith('/v1/') ||
    p.startsWith('/auth/') ||
    p.startsWith('/admin/') ||
    p === '/health' ||
    p.startsWith('/status/') ||
    p.startsWith('/cb-data/')
  )
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (shouldBypassCache(url)) return

  event.respondWith(
    (async () => {
      try {
        const network = await fetch(event.request)
        if (network.ok && url.protocol.startsWith('http')) {
          const cache = await caches.open(CACHE)
          void cache.put(event.request, network.clone())
        }
        return network
      } catch {
        const cached = await caches.match(event.request)
        if (cached) return cached
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/index.html')
          if (fallback) return fallback
        }
        throw new Error('offline')
      }
    })(),
  )
})
