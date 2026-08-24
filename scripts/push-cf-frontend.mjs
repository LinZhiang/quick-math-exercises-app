/**
 * 把本机 server/data/frontend-learning 同步到 Cloudflare Pages（KV）
 * 用法：先部署带 Functions 的版本，并绑定 WENGU_KV，再执行 npm run sync:cf-frontend
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, 'server', '.env')
const dataRoot = path.join(root, 'server', 'data', 'frontend-learning')
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

function loadPack() {
  const catalogFile = path.join(dataRoot, 'catalog.json')
  if (!fs.existsSync(catalogFile)) {
    throw new Error(`找不到 ${catalogFile}。请先在本机导入讲义。`)
  }
  const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'))
  const itemsDir = path.join(dataRoot, 'items')
  const mediaDir = path.join(dataRoot, 'media')
  const items = {}
  if (fs.existsSync(itemsDir)) {
    for (const name of fs.readdirSync(itemsDir)) {
      if (!name.endsWith('.json')) continue
      const rec = JSON.parse(fs.readFileSync(path.join(itemsDir, name), 'utf8'))
      const id = String(rec.id || name.replace(/\.json$/i, ''))
      items[id] = rec
    }
  }
  const media = {}
  if (fs.existsSync(mediaDir)) {
    for (const name of fs.readdirSync(mediaDir)) {
      if (!/^[a-zA-Z0-9._-]+$/.test(name)) continue
      const buf = fs.readFileSync(path.join(mediaDir, name))
      media[name] = buf.toString('base64')
    }
  }
  return { tree: Array.isArray(catalog.tree) ? catalog.tree : [], items, media }
}

async function main() {
  const env = readEnvFile(envPath)
  const username = (env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    console.error('[sync:cf-frontend] 请先在 server/.env 填写 WENGU_ADMIN_PASSWORD')
    process.exit(1)
  }
  const pack = loadPack()
  console.log(`[sync:cf-frontend] 目标：${HOST}`)
  console.log(
    `[sync:cf-frontend] 目录 ${pack.tree.length} 个根类，讲义 ${Object.keys(pack.items).length} 条，插图 ${Object.keys(pack.media).length} 张`,
  )

  const loginRes = await fetch(`${HOST}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const loginText = await loginRes.text()
  let login
  try {
    login = JSON.parse(loginText)
  } catch {
    console.error('[sync:cf-frontend] 登录接口不是 JSON。请先部署本仓库的 Functions，再重试。')
    console.error(loginText.slice(0, 240))
    process.exit(1)
  }
  if (!loginRes.ok || !login.ok || !login.token) {
    console.error('[sync:cf-frontend] 登录失败：', login.message || loginText.slice(0, 240))
    process.exit(1)
  }

  const importRes = await fetch(`${HOST}/api/frontend-learning/import`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${login.token}`,
    },
    body: JSON.stringify(pack),
  })
  const importText = await importRes.text()
  let data
  try {
    data = JSON.parse(importText)
  } catch {
    console.error('[sync:cf-frontend] 导入接口不是 JSON（HTTP', importRes.status, '）')
    console.error(importText.slice(0, 240))
    process.exit(1)
  }
  if (!importRes.ok || !data.ok) {
    console.error('[sync:cf-frontend] 导入失败：', data.message || importText.slice(0, 240))
    if (importRes.status === 503) {
      console.error('请到 Cloudflare Pages → Settings → Functions → KV bindings 绑定变量名 WENGU_KV 后重新部署。')
    }
    process.exit(1)
  }
  console.log(`[sync:cf-frontend] 完成：讲义 ${data.items}，插图 ${data.media}`)
  console.log(`手机打开 ${HOST} → 前端学习 即可看到。若仍是旧页，请强刷或去掉主屏幕旧图标后重开。`)
}

main().catch((e) => {
  console.error('[sync:cf-frontend]', e instanceof Error ? e.message : e)
  process.exit(1)
})
