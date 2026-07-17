/**
 * 同步 DeepSeek 密钥到 server/.env，并生成前端 .env.local（仅模型名，不含密钥）
 * 优先级：环境变量（Cloudflare CI）> server/.env > 主 App 的 .env
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

function readKeyFromEnvFile(file) {
  if (!fs.existsSync(file)) return ''
  const text = fs.readFileSync(file, 'utf8')
  const m = text.match(/^DEEPSEEK_API_KEY=(.+)$/m)
  return m?.[1]?.trim() ?? ''
}

function keyFromProcessEnv() {
  return (process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim()
}

function modelFromProcessEnv() {
  return (process.env.VITE_DEEPSEEK_MODEL || 'deepseek-v4-flash').trim()
}

function writeLocalEnv(model, source) {
  const localContent = [
    `# 由 sync-server-env.mjs 生成（来源：${source}）`,
    '# DeepSeek 密钥仅在 server/.env；前端登录后走服务端代理',
    `VITE_DEEPSEEK_MODEL=${model}`,
    '',
  ].join('\n')
  fs.writeFileSync(localEnv, localContent, 'utf8')
  console.log(`[sync:env] 已写入 .env.local（${source}，仅模型名）`)
}

const envKey = keyFromProcessEnv()
if (!isPlaceholderKey(envKey)) {
  writeLocalEnv(modelFromProcessEnv(), '环境变量')
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
if (!isPlaceholderKey(fileKey)) {
  writeLocalEnv(modelFromProcessEnv(), 'server/.env')
  process.exit(0)
}

if (isCi) {
  console.error(
    '[sync:env] 云端构建未找到 DeepSeek 密钥。\n' +
      '静态托管无法使用服务端登录代理；请改用家庭 HTTPS 服务（npm run serve:install），\n' +
      '或在 Cloudflare Pages 配置 VITE_DEEPSEEK_API_KEY（仅开发/自用，密钥会打进前端包）。',
  )
} else {
  console.error(
    '[sync:env] 未找到 DEEPSEEK_API_KEY。请编辑 server/.env 并填写：\n' +
      '  DEEPSEEK_API_KEY=sk-...\n' +
      '  WENGU_ADMIN_USERNAME=admin\n' +
      '  WENGU_ADMIN_PASSWORD=你的强密码',
  )
}
process.exit(1)
