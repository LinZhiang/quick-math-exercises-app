import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const target = path.join(root, 'server', '.env')

const sources = [
  path.join(root, 'server', '.env'),
  path.join(root, '..', 'my-learning-app', 'server', '.env'),
  path.join(root, '..', 'my-learning-app', '.env'),
]

if (fs.existsSync(target)) {
  // eslint-disable-next-line no-console
  console.log('[sync:env] server/.env 已存在，跳过同步')
  process.exit(0)
}

for (const src of sources.slice(1)) {
  if (!fs.existsSync(src)) continue
  fs.copyFileSync(src, target)
  // eslint-disable-next-line no-console
  console.log(`[sync:env] 已从 ${src} 同步到 server/.env`)
  process.exit(0)
}

// eslint-disable-next-line no-console
console.warn(
  '[sync:env] 未找到可同步的 .env。请复制 server/.env.example 为 server/.env 并填写 DEEPSEEK_API_KEY。',
)
process.exit(1)
