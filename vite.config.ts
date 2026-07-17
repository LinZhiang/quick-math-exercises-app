import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
  const certKey = fileURLToPath(new URL('./server/certs/key.pem', import.meta.url))
  const certFile = fileURLToPath(new URL('./server/certs/cert.pem', import.meta.url))
  const https =
    existsSync(certKey) && existsSync(certFile)
      ? { key: readFileSync(certKey), cert: readFileSync(certFile) }
      : undefined

  const aiProxyTarget = process.env.VITE_AI_PROXY_TARGET || 'http://127.0.0.1:8790'

  const serverCommon = {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    https,
    proxy: {
      '/api': { target: aiProxyTarget, changeOrigin: true },
      '/auth': { target: aiProxyTarget, changeOrigin: true },
      '/admin': { target: aiProxyTarget, changeOrigin: true },
      '/health': { target: aiProxyTarget, changeOrigin: true },
      '/status': { target: aiProxyTarget, changeOrigin: true },
      '/v1': { target: aiProxyTarget, changeOrigin: true },
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
    build: {
      chunkSizeWarningLimit: 3500,
      rollupOptions: {
        onwarn(warning, warn) {
          const msg = String(warning?.message ?? '')
          if (msg.includes('annotation that Rollup cannot interpret')) return
          if (warning?.code === 'INVALID_ANNOTATION') return
          warn(warning)
        },
      },
    },
  }
})
