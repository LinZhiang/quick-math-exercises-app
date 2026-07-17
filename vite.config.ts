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
  /** Cloudflare Pages：去掉 10MB+ 满分音效，避免部署 internal error */
  const lightAssets = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE_PAGES || process.env.VITE_LIGHT_ASSETS)

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
      alias: [
        ...(lightAssets
          ? [
              {
                find: '@/utils/qb-perfect-sound',
                replacement: fileURLToPath(
                  new URL('./src/utils/qb-perfect-sound.lite.ts', import.meta.url),
                ),
              },
            ]
          : []),
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url)),
        },
      ],
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
