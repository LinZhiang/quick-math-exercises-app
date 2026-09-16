/**
 * 把本机 server/data/project-code/0521 同步到 Cloudflare KV（不进 Git）。
 * 用法：先部署带查阅接口的 Functions，再 npm run sync:cf-project-code
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, 'server', '.env')
const DATA_ROOT = path.join(root, 'server', 'data', 'project-code', '0521')
const PROJECT = process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app'
const HOST =
  (process.env.CF_PAGES_URL || '').trim().replace(/\/$/, '') ||
  `https://${PROJECT}.pages.dev`
const FILES_PER_CHUNK = 40
const MAX_CHUNK_BYTES = 900_000

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

function langOf(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  if (ext === 'mjs' || ext === 'cjs') return 'js'
  return ext || 'txt'
}

function listDir(absDir, relDir) {
  const children = []
  if (!fs.existsSync(absDir)) return children
  const ents = fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return a.name.localeCompare(b.name, 'zh')
  })
  for (const ent of ents) {
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      const kids = listDir(path.join(absDir, ent.name), rel)
      if (!kids.length) continue
      children.push({ id: rel, name: ent.name, kind: 'dir', path: rel, children: kids })
    } else if (ent.isFile()) {
      children.push({ id: rel, name: ent.name, kind: 'file', path: rel })
    }
  }
  return children
}

function collectFiles(absDir, relDir, out) {
  if (!fs.existsSync(absDir)) return
  for (const ent of fs.readdirSync(absDir, { withFileTypes: true })) {
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name
    const abs = path.join(absDir, ent.name)
    if (ent.isDirectory()) {
      collectFiles(abs, rel, out)
      continue
    }
    if (!ent.isFile()) continue
    out.push({
      path: rel,
      name: ent.name,
      lang: langOf(abs),
      content: fs.readFileSync(abs, 'utf8'),
    })
  }
}

function chunkFiles(files) {
  const chunks = []
  let current = {}
  let n = 0
  let bytes = 2
  const flush = () => {
    if (!n) return
    chunks.push(current)
    current = {}
    n = 0
    bytes = 2
  }
  for (const file of files) {
    const rec = { name: file.name, lang: file.lang, content: file.content }
    const piece = JSON.stringify(file.path) + JSON.stringify(rec) + 2
    if (n && (n >= FILES_PER_CHUNK || bytes + piece > MAX_CHUNK_BYTES)) flush()
    current[file.path] = rec
    n += 1
    bytes += piece
  }
  flush()
  return chunks
}

async function readJson(res) {
  const text = await res.text()
  try {
    return { status: res.status, data: JSON.parse(text), text }
  } catch {
    return { status: res.status, data: null, text }
  }
}

async function main() {
  const env = readEnvFile(envPath)
  const username = (env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    console.error('[sync:cf-project-code] 请先在 server/.env 填写 WENGU_ADMIN_PASSWORD')
    process.exit(1)
  }
  if (!fs.existsSync(DATA_ROOT)) {
    console.error('[sync:cf-project-code] 本机没有源码。请先 npm run sync:project-code')
    process.exit(1)
  }

  const tree = listDir(DATA_ROOT, '')
  const files = []
  collectFiles(DATA_ROOT, '', files)
  const chunks = chunkFiles(files)
  console.log(`[sync:cf-project-code] 目标：${HOST}`)
  console.log(`[sync:cf-project-code] ${files.length} 个文件，分 ${chunks.length} 批上传`)

  const loginRes = await fetch(`${HOST}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Wengu-Client': 'app' },
    body: JSON.stringify({ username, password }),
  })
  const login = await readJson(loginRes)
  if (!loginRes.ok || !login.data?.ok || !login.data.token) {
    console.error('[sync:cf-project-code] 登录失败：', login.data?.message || login.text.slice(0, 240))
    process.exit(1)
  }

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${login.data.token}`,
    'X-Wengu-Client': 'app',
  }

  const importOnce = async (body) => {
    const res = await fetch(`${HOST}/api/project-code/import`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const pack = await readJson(res)
    if (!res.ok || !pack.data?.ok) {
      const msg = pack.data?.message || pack.data?.error?.message || pack.text.slice(0, 240)
      if (res.status === 404) {
        throw new Error(
          `${msg}\n请先把本仓库部署到 Pages（云端查阅接口），再重试 npm run sync:cf-project-code。`,
        )
      }
      if (res.status === 503) {
        throw new Error(`${msg}\n请到 Pages → Settings → Functions 绑定 WENGU_KV 后重新部署。`)
      }
      throw new Error(msg || `导入失败（HTTP ${res.status}）`)
    }
    return pack.data
  }

  await importOnce({ reset: true, tree, files: chunks[0] || {}, done: chunks.length <= 1 })
  for (let i = 1; i < chunks.length; i += 1) {
    const last = i === chunks.length - 1
    const data = await importOnce({ files: chunks[i], done: last })
    console.log(`[sync:cf-project-code] 已上传 ${data.count}/${files.length}`)
  }
  console.log(`[sync:cf-project-code] 完成：${files.length} 个文件`)
  console.log(`手机打开 ${HOST}/project-code 即可查阅。若仍是旧页，请强刷。`)
}

main().catch((e) => {
  console.error('[sync:cf-project-code]', e instanceof Error ? e.message : e)
  process.exit(1)
})
