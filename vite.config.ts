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

  const serverCommon = {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    https,
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
