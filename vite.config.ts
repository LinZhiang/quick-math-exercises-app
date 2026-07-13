import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const aiProxyTarget = (env.VITE_AI_PROXY_TARGET || 'http://127.0.0.1:8790').replace(/\/$/, '')

  const certKey = fileURLToPath(new URL('./server/certs/key.pem', import.meta.url))
  const certFile = fileURLToPath(new URL('./server/certs/cert.pem', import.meta.url))
  const https =
    existsSync(certKey) && existsSync(certFile)
      ? { key: readFileSync(certKey), cert: readFileSync(certFile) }
      : undefined

  const aiProxy = {
    target: aiProxyTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/ai/, '/v1'),
  }

  const healthProxy = {
    target: aiProxyTarget,
    changeOrigin: true,
  }

  const serverCommon = {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    https,
    proxy: {
      '/api/ai': aiProxy,
      '/health': healthProxy,
      '/status': healthProxy,
    },
  }

  return {
    plugins: [vue()],
    server: serverCommon,
    preview: serverCommon,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
