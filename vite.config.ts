import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const certKey = fileURLToPath(new URL('./server/certs/key.pem', import.meta.url))
const certFile = fileURLToPath(new URL('./server/certs/cert.pem', import.meta.url))
const https =
  existsSync(certKey) && existsSync(certFile)
    ? { key: readFileSync(certKey), cert: readFileSync(certFile) }
    : undefined

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    https,
    proxy: {
      '/api/ai': {
        target: 'http://127.0.0.1:8790',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, '/v1'),
      },
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    https,
    proxy: {
      '/api/ai': {
        target: 'http://127.0.0.1:8790',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, '/v1'),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
