/**
 * 把 server/.env 里的密钥推到 Cloudflare Pages Secrets（公网一步到位）
 * 用法：npx wrangler login 后执行 npm run sync:cf-secrets
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, 'server', '.env')
const PROJECT = process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app'

const KEYS = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_API_BASE',
  'DOUBAO_API_KEY',
  'DOUBAO_API_BASE',
  'DOUBAO_MODEL_ID',
  'WENGU_ADMIN_USERNAME',
  'WENGU_ADMIN_PASSWORD',
  'WENGU_SESSION_SECRET',
]

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

const env = readEnvFile(envPath)
if (!env.DEEPSEEK_API_KEY || !env.WENGU_ADMIN_PASSWORD) {
  console.error('[sync:cf-secrets] 请先在 server/.env 填写 DEEPSEEK_API_KEY 与 WENGU_ADMIN_PASSWORD')
  process.exit(1)
}

console.log(`[sync:cf-secrets] 项目：${PROJECT}`)
console.log('[sync:cf-secrets] 将写入 Cloudflare Pages Secrets（Production）…')

for (const key of KEYS) {
  const value = (env[key] || '').trim()
  if (!value) {
    console.log(`  skip ${key}（未设置）`)
    continue
  }
  const r = spawnSync(
    'npx',
    ['wrangler', 'pages', 'secret', 'put', key, `--project-name=${PROJECT}`],
    {
      cwd: root,
      input: value,
      encoding: 'utf8',
      shell: true,
    },
  )
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || `写入 ${key} 失败`)
    console.error(
      '\n若未登录，请先执行：npx wrangler login\n' +
        '或到 Cloudflare 仪表盘 → Pages → 本项目 → Settings → Variables and secrets 手动添加。',
    )
    process.exit(r.status || 1)
  }
  console.log(`  ok ${key}`)
}

console.log(`
[sync:cf-secrets] 完成。请到 Cloudflare Pages 对该项目点「Retry deployment」，
或再推一次空提交触发部署，Secrets 才会进运行中的 Functions。

手机若仍显示旧提示：Chrome 清缓存 / 删掉主屏幕旧图标后重新打开 pages.dev。
`)
