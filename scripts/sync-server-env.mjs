/**
 * 把 server/.env 或主 App 的 DEEPSEEK_API_KEY 同步到 .env.local（构建进 App，手机出门也能用）
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
    fs.mkdirSync(path.dirname(serverEnv), { recursive: true })
    fs.copyFileSync(src, serverEnv)
    console.log(`[sync:env] 已从 ${src} 复制 server/.env`)
    break
  }
}

const key = readKeyFromEnvFile(serverEnv)
if (!key || key.includes('your-deepseek')) {
  console.error('[sync:env] 未找到 DEEPSEEK_API_KEY。请编辑 server/.env 或先配置主学习 App 的密钥。')
  process.exit(1)
}

const localContent = [
  '# 家庭自用：密钥打进 App，手机/PWA 直连 DeepSeek，出门无需开电脑',
  `VITE_DEEPSEEK_API_KEY=${key}`,
  'VITE_DEEPSEEK_MODEL=deepseek-v4-flash',
  '',
].join('\n')
fs.writeFileSync(localEnv, localContent, 'utf8')
console.log('[sync:env] 已写入 .env.local')
