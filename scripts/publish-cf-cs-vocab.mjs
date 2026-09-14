/**
 * 把本机计算机单词题库同步到 Cloudflare KV。
 * 用法：npm run sync:cf-cs-vocab
 * 也会在 npm run sync:cf-computer 成功后自动尝试一次。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, 'server', '.env')
const DATA_FILE = path.join(root, 'server', 'data', 'cs-vocab', 'bank.json')
const SRC_FILE = path.join(root, 'src', 'utils', 'cs-vocab', 'bank.generated.json')
const PROJECT = process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app'
const HOST =
  (process.env.CF_PAGES_URL || '').trim().replace(/\/$/, '') ||
  `https://${PROJECT}.pages.dev`

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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

function loadItems() {
  for (const file of [DATA_FILE, SRC_FILE]) {
    if (!fs.existsSync(file)) continue
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
      const items = Array.isArray(raw) ? raw : raw.items
      if (Array.isArray(items) && items.length) return items
    } catch {
      /* skip */
    }
  }
  return []
}

export async function publishCsVocabBank(host, token) {
  const items = loadItems()
  if (!items.length) {
    console.log('[sync:cf-cs-vocab] 本机没有题库文件，已跳过')
    return { skipped: true }
  }
  const res = await fetch(`${host}/api/cs-vocab/bank`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'X-Wengu-Client': 'app',
    },
    body: JSON.stringify({ items }),
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`接口不是 JSON（HTTP ${res.status}）：${text.slice(0, 240)}`)
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.message || text.slice(0, 240))
  }
  console.log(`[sync:cf-cs-vocab] 已上传 ${data.count} 题`)
  return data
}

async function main() {
  const env = readEnvFile(envPath)
  const username = (env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    console.error('[sync:cf-cs-vocab] 请先在 server/.env 填写 WENGU_ADMIN_PASSWORD')
    process.exit(1)
  }
  const items = loadItems()
  if (!items.length) {
    console.error('[sync:cf-cs-vocab] 找不到题库。请先在本机生成 src/utils/cs-vocab/bank.generated.json')
    process.exit(1)
  }
  console.log(`[sync:cf-cs-vocab] 目标：${HOST}，${items.length} 题`)
  const loginRes = await fetch(`${HOST}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Wengu-Client': 'app' },
    body: JSON.stringify({ username, password }),
  })
  const loginText = await loginRes.text()
  let login
  try {
    login = JSON.parse(loginText)
  } catch {
    console.error('[sync:cf-cs-vocab] 登录接口不是 JSON。请先部署带 Functions 的版本。')
    console.error(loginText.slice(0, 240))
    process.exit(1)
  }
  if (!loginRes.ok || !login.ok || !login.token) {
    console.error('[sync:cf-cs-vocab] 登录失败：', login.message || loginText.slice(0, 240))
    process.exit(1)
  }
  await publishCsVocabBank(HOST, login.token)
  console.log(`手机打开 ${HOST} → 计算机单词和语法 即可用。若仍是旧页，请强刷或去掉主屏幕旧图标后重开。`)
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) {
  main().catch((e) => {
    console.error('[sync:cf-cs-vocab]', e instanceof Error ? e.message : e)
    process.exit(1)
  })
}
