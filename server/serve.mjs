/**
 * 生产/局域网：同一端口提供静态站点 + DeepSeek 代理（手机 PWA 可直接用 AI）
 */
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAiProxyApp, logStartup, onListenError, PORT, warnIfMissingEnv } from './ai-proxy-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  // eslint-disable-next-line no-console
  console.error('[quick-math-serve] 未找到 dist/index.html，请先执行 npm run build')
  process.exit(1)
}

warnIfMissingEnv()

const app = createAiProxyApp()
app.use(express.static(distDir, { index: false }))

app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/v1/') ||
    req.path.startsWith('/api/ai/') ||
    req.path === '/health' ||
    req.path.startsWith('/status/')
  ) {
    return next()
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

const httpServer = app.listen(PORT, '0.0.0.0', () => {
  logStartup()
  // eslint-disable-next-line no-console
  console.log('[quick-math-serve] 手机/家人可访问：http://<本机局域网IP>:' + PORT)
})
httpServer.on('error', onListenError)
