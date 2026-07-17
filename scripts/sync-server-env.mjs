/**
 * 同步前端 .env.local（仅模型名；密钥在服务端 / Cloudflare Secrets）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const serverEnv = path.join(root, 'server', '.env')
const localEnv = path.join(root, '.env.local')

const isCi = Boolean(
  process.env.CI ||
    process.env.CF_PAGES ||
    process.env.CLOUDFLARE_PAGES ||
    process.env.NETLIFY,
)

function isPlaceholderKey(key) {
  return !key || /your-deepseek|sk-your|placeholder/i.test(key)
}

function readEnvVarFromFile(file, name) {
  if (!fs.existsSync(file)) return ''
  const text = fs.readFileSync(file, 'utf8')
  const m = text.match(new RegExp(`^${name}=(.+)$`, 'm'))
  return m?.[1]?.trim().replace(/^["']|["']$/g, '') ?? ''
}

function modelFromProcessEnv() {
  return (process.env.VITE_DEEPSEEK_MODEL || 'deepseek-v4-flash').trim()
}

function writeLocalEnv({ model, source }) {
  const lines = [
    `# 由 sync-server-env.mjs 生成（来源：${source}）`,
    '# 密钥不进前端：本地用 server/.env；公网用 Cloudflare Pages Secrets + Functions',
    `VITE_DEEPSEEK_MODEL=${model}`,
    '',
  ]
  fs.writeFileSync(localEnv, lines.join('\n'), 'utf8')
  console.log(`[sync:env] 已写入 .env.local（${source}）`)
}

// Cloudflare Pages：前端无需密钥，Functions 使用 Secrets
if (isCi) {
  writeLocalEnv({ model: modelFromProcessEnv(), source: 'Cloudflare CI' })
  process.exit(0)
}

const envKey = (process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim()
if (!isPlaceholderKey(envKey)) {
  writeLocalEnv({ model: modelFromProcessEnv(), source: '环境变量' })
  process.exit(0)
}

if (!fs.existsSync(serverEnv)) {
  const fileSources = [
    path.join(root, '..', 'my-learning-app', 'server', '.env'),
    path.join(root, '..', 'my-learning-app', '.env'),
  ]
  for (const src of fileSources) {
    if (!fs.existsSync(src)) continue
    fs.mkdirSync(path.dirname(serverEnv), { recursive: true })
    fs.copyFileSync(src, serverEnv)
    console.log(`[sync:env] 已从 ${src} 复制 server/.env`)
    break
  }
}

const fileKey = readEnvVarFromFile(serverEnv, 'DEEPSEEK_API_KEY')
if (!isPlaceholderKey(fileKey)) {
  writeLocalEnv({ model: modelFromProcessEnv(), source: 'server/.env' })
  process.exit(0)
}

console.error(
  '[sync:env] 未找到 DEEPSEEK_API_KEY。本地请编辑 server/.env：\n' +
    '  DEEPSEEK_API_KEY=sk-...\n' +
    '  WENGU_ADMIN_USERNAME=admin\n' +
    '  WENGU_ADMIN_PASSWORD=你的强密码\n' +
    '公网（一步到位）：在 Cloudflare Pages Secrets 配置同名变量，无需隧道。',
)
process.exit(1)
