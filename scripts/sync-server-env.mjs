/**
 * 同步 DeepSeek 密钥：server/.env + 前端 .env.local（家庭自用，构建进 App，手机直连 DeepSeek）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const serverEnv = path.join(root, 'server', '.env')
const localEnv = path.join(root, '.env.local')

const sources = [
  serverEnv,
  path.join(root, '..', 'my-learning-app', 'server', '.env'),
  path.join(root, '..', 'my-learning-app', '.env'),
]

function readKeyFromEnvFile(file) {
  if (!fs.existsSync(file)) return ''
  const text = fs.readFileSync(file, 'utf8')
  const m = text.match(/^DEEPSEEK_API_KEY=(.+)$/m)
  return m?.[1]?.trim() ?? ''
}

if (!fs.existsSync(serverEnv)) {
  for (const src of sources.slice(1)) {
    if (!fs.existsSync(src)) continue
    fs.copyFileSync(src, serverEnv)
    console.log(`[sync:env] 已从 ${src} 复制 server/.env`)
    break
  }
}

const key = readKeyFromEnvFile(serverEnv)
if (!key || key.includes('your-deepseek')) {
  console.warn('[sync:env] 未找到有效 DEEPSEEK_API_KEY，请编辑 server/.env')
  process.exit(1)
}

const localContent = [
  '# 家庭自用：构建时写入，手机/PWA 直连 DeepSeek，无需再开代理',
  `VITE_DEEPSEEK_API_KEY=${key}`,
  'VITE_DEEPSEEK_MODEL=deepseek-v4-flash',
  '',
].join('\n')
fs.writeFileSync(localEnv, localContent, 'utf8')
console.log('[sync:env] 已同步密钥到 .env.local（npm start 会自动 build）')
