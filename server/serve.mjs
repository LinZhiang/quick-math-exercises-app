/**
 * 生产/局域网：静态站点 + DeepSeek 代理。
 * 有 server/certs 时自动启用 HTTPS（手机才能真正「安装应用」）。
 */
import express from 'express'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAiProxyApp, onListenError, PORT, warnIfMissingEnv } from './ai-proxy-core.mjs'
import { noStoreCacheMiddleware } from './auth-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const certDir = path.join(__dirname, 'certs')
const keyPath = path.join(certDir, 'key.pem')
const certPath = path.join(certDir, 'cert.pem')

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  // eslint-disable-next-line no-console
  console.error('[quick-math-serve] 未找到 dist/index.html，请先执行 npm run build')
  process.exit(1)
}

warnIfMissingEnv()

const app = createAiProxyApp()

app.use((req, res, next) => {
  if (/\.(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|map)$/i.test(req.path)) {
    return next()
  }
  noStoreCacheMiddleware(req, res, next)
})

app.use(express.static(distDir, { index: false, maxAge: '1h' }))

app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/v1/') ||
    req.path.startsWith('/api/ai/') ||
    req.path.startsWith('/auth/') ||
    req.path.startsWith('/admin/') ||
    req.path === '/health' ||
    req.path.startsWith('/status/')
  ) {
    return next()
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

function preferredLanIPs() {
  const nets = os.networkInterfaces()
  const preferred = []
  const others = []
  for (const [name, list] of Object.entries(nets)) {
    if (!list) continue
    for (const n of list) {
      if (n.family !== 'IPv4' || n.internal) continue
      const skip =
        /virtual|vmware|vbox|hyper-v|docker|vethernet/i.test(name) ||
        n.address.startsWith('192.168.137.')
      ;(skip ? others : preferred).push(n.address)
    }
  }
  return preferred.length ? preferred : others
}

const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath)
const server = useHttps
  ? https.createServer(
      {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      app,
    )
  : http.createServer(app)

const scheme = useHttps ? 'https' : 'http'

server.listen(PORT, '0.0.0.0', () => {
  const ips = preferredLanIPs()
  // eslint-disable-next-line no-console
  console.log(`[quick-math-serve] ${scheme}://0.0.0.0:${PORT}`)
  if (!useHttps) {
    // eslint-disable-next-line no-console
    console.warn(
      '[quick-math-serve] 未检测到证书：手机无法「安装应用」。请先执行 npm run certs，再重新 npm run serve',
    )
  } else {
    // eslint-disable-next-line no-console
    console.log('[quick-math-serve] 已启用 HTTPS。手机首次会提示证书不安全 → 点「高级/继续前往」')
  }
  for (const ip of ips) {
    // eslint-disable-next-line no-console
    console.log(`  手机打开：${scheme}://${ip}:${PORT}/`)
  }
})

server.on('error', onListenError)
