/**
 * 同步 server/.env → .env.local（构建时注入 VITE_ 变量）
 * 优先级：CI 环境变量 > server/.env > 主 App
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

function readKeyFromEnvFile(file) {
  return readEnvVarFromFile(file, 'DEEPSEEK_API_KEY')
}

function keyFromProcessEnv() {
  return (process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim()
}

function modelFromProcessEnv() {
  return (process.env.VITE_DEEPSEEK_MODEL || 'deepseek-v4-flash').trim()
}

function apiOriginFromProcessEnv() {
  return (process.env.VITE_WENGU_API_ORIGIN || process.env.WENGU_PUBLIC_API_URL || '').trim().replace(/\/$/, '')
}

function writeLocalEnv({ model, apiOrigin, source }) {
  const lines = [
    `# 由 sync-server-env.mjs 生成（来源：${source}）`,
    '# DeepSeek 密钥仅在 server/.env；前端登录后走服务端代理',
    `VITE_DEEPSEEK_MODEL=${model}`,
  ]
  if (apiOrigin) {
    lines.push(`VITE_WENGU_API_ORIGIN=${apiOrigin}`)
  }
  lines.push('')
  fs.writeFileSync(localEnv, lines.join('\n'), 'utf8')
  console.log(`[sync:env] 已写入 .env.local（${source}）`)
  if (apiOrigin) console.log(`[sync:env] API 根地址：${apiOrigin}`)
}

const envKey = keyFromProcessEnv()
const envApiOrigin = apiOriginFromProcessEnv()
if (!isPlaceholderKey(envKey) || envApiOrigin) {
  writeLocalEnv({
    model: modelFromProcessEnv(),
    apiOrigin: envApiOrigin,
    source: '环境变量',
  })
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

const fileKey = readKeyFromEnvFile(serverEnv)
const fileApiOrigin = readEnvVarFromFile(serverEnv, 'WENGU_PUBLIC_API_URL')
if (!isPlaceholderKey(fileKey) || fileApiOrigin) {
  writeLocalEnv({
    model: modelFromProcessEnv(),
    apiOrigin: fileApiOrigin,
    source: 'server/.env',
  })
  process.exit(0)
}

if (isCi) {
  console.error(
    '[sync:env] Cloudflare 构建缺少配置。请在 Pages → Settings → Environment variables 添加：\n' +
      '  VITE_WENGU_API_ORIGIN = 家庭 Node 服务的公网地址（Cloudflare Tunnel 等）\n' +
      '并在 server/.env 设置 CORS_ORIGIN 包含你的 pages.dev 域名。\n' +
      '本地 server/.env 还需 DEEPSEEK_API_KEY 与 WENGU_ADMIN_PASSWORD。',
  )
} else {
  console.error(
    '[sync:env] 未找到 DEEPSEEK_API_KEY。请编辑 server/.env：\n' +
      '  DEEPSEEK_API_KEY=sk-...\n' +
      '  WENGU_ADMIN_USERNAME=admin\n' +
      '  WENGU_ADMIN_PASSWORD=你的强密码\n' +
      '若用 Cloudflare Pages 静态前端，另加：\n' +
      '  WENGU_PUBLIC_API_URL=https://你的隧道或公网API地址\n' +
      '  CORS_ORIGIN=https://你的项目.pages.dev',
  )
}
process.exit(1)
