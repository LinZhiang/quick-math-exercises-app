/**
 * 从 pages.dev 把讲义目录/正文拉回本机 Node，只并入本地没有的篇，不覆盖已有正文。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env'), override: false })

export function cloudPagesHost() {
  const fromEnv = (process.env.CF_PAGES_URL || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const project = (process.env.CF_PAGES_PROJECT || 'quick-math-exercises-app').trim()
  return `https://${project}.pages.dev`
}

function collectAllEntryIds(nodes, out = []) {
  for (const n of nodes || []) {
    for (const e of n.entries || []) {
      if (e?.id) out.push(String(e.id))
    }
    collectAllEntryIds(n.children, out)
  }
  return out
}

function collectMediaNames(content, mediaPrefix) {
  const names = new Set()
  const escaped = String(mediaPrefix || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`${escaped}/([a-zA-Z0-9._-]+)`, 'g')
  const text = String(content || '')
  let m
  while ((m = re.exec(text))) names.add(m[1])
  return [...names]
}

export async function loginCloudAdmin() {
  const host = cloudPagesHost()
  const username = (process.env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (process.env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    throw new Error('本机 server/.env 未配置管理员密码，无法从云端拉取讲义')
  }
  const res = await fetch(`${host}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok || !data.token) {
    throw new Error(data?.message || `云端登录失败（HTTP ${res.status}）`)
  }
  return { host, token: String(data.token) }
}

export async function fetchCloudHandoutPack({ apiPrefix, mediaPrefix }) {
  const { host, token } = await loginCloudAdmin()
  const auth = { authorization: `Bearer ${token}` }
  const treeRes = await fetch(`${host}${apiPrefix}/tree`, { headers: auth, cache: 'no-store' })
  const treeData = await treeRes.json().catch(() => ({}))
  if (!treeRes.ok || !treeData?.ok || !Array.isArray(treeData.tree)) {
    throw new Error(treeData?.message || `读取云端目录失败（HTTP ${treeRes.status}）`)
  }
  const tree = treeData.tree
  const ids = [...new Set(collectAllEntryIds(tree))]
  const items = {}
  for (const id of ids) {
    const res = await fetch(`${host}${apiPrefix}/items/${encodeURIComponent(id)}`, {
      headers: auth,
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok || !data.item) continue
    items[id] = data.item
  }
  const media = {}
  const names = new Set()
  for (const item of Object.values(items)) {
    for (const name of collectMediaNames(item.content, mediaPrefix)) names.add(name)
  }
  for (const name of names) {
    const res = await fetch(`${host}${mediaPrefix}/${encodeURIComponent(name)}`, {
      headers: auth,
      cache: 'no-store',
    })
    if (!res.ok) continue
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length) media[name] = buf
  }
  return { tree, items, media, host, remoteCount: ids.length }
}
