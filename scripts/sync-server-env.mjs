/**
 * 同步 DeepSeek 密钥到 .env.local（构建进 App，手机出门也能用）
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

function writeLocalEnv(key, model, source) {
  const localContent = [
    `# 由 sync-server-env.mjs 生成（来源：${source}）`,
    '# 密钥打进 App，手机/PWA 直连 DeepSeek，出门无需开电脑',
    `VITE_DEEPSEEK_API_KEY=${key}`,
    `VITE_DEEPSEEK_MODEL=${model}`,
    '',
  ].join('\n')
  fs.writeFileSync(localEnv, localContent, 'utf8')
  console.log(`[sync:env] 已写入 .env.local（${source}）`)
}

const envKey = keyFromProcessEnv()
if (!isPlaceholderKey(envKey)) {
  writeLocalEnv(envKey, modelFromProcessEnv(), '环境变量')
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
  writeLocalEnv(fileKey, modelFromProcessEnv(), 'server/.env')
  process.exit(0)
}

if (isCi) {
  console.error(
    '[sync:env] 云端构建未找到 DeepSeek 密钥。\n' +
      '请在 Cloudflare Pages 项目 → Settings → Variables and secrets → + Add：\n' +
      '  变量名：VITE_DEEPSEEK_API_KEY\n' +
      '  类型：Secret（推荐）\n' +
      '  值：与主学习 App server/.env 里的 DEEPSEEK_API_KEY 相同\n' +
      '  环境：勾选 Production（Preview 也勾上）\n' +
      '保存后到 Deployments 点 Retry deployment。',
  )
} else {
  console.error(
    '[sync:env] 未找到 DEEPSEEK_API_KEY。请编辑 server/.env 或先配置主学习 App 的密钥，\n' +
      '也可设置环境变量 VITE_DEEPSEEK_API_KEY。',
  )
}
process.exit(1)
