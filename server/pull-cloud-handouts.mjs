/**
 * 从 pages.dev 把讲义目录/正文拉回本机 Node，只并入本地没有的篇，不覆盖已有正文。
 * 云端整树 GET 会按篇去 KV 探正文，篇数一多容易超时；这里按层 ?parent= 拉全目录。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { catalogTreeLooksLikeStub, stripCatalogClientFlags } from '../functions/_lib/catalogProtect.js'

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

async function cloudFetch(url, init = {}, timeoutMs = 20000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: 'no-store' })
  } catch (e) {
    if (e && typeof e === 'object' && e.name === 'AbortError') {
      throw new Error('读取云端超时')
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

async function cloudJson(url, headers, timeoutMs = 20000) {
  const res = await cloudFetch(url, { headers }, timeoutMs)
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

async function mapPool(items, limit, fn) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return
  let i = 0
  const n = Math.max(1, Math.min(limit, list.length))
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < list.length) {
        const idx = i
        i += 1
        await fn(list[idx], idx)
      }
    }),
  )
}

export async function loginCloudAdmin() {
  const host = cloudPagesHost()
  const username = (process.env.WENGU_ADMIN_USERNAME || 'admin').trim()
  const password = (process.env.WENGU_ADMIN_PASSWORD || '').trim()
  if (!password) {
    throw new Error('本机 server/.env 未配置管理员密码，无法从云端拉取讲义')
  }
  const res = await cloudFetch(
    `${host}/auth/login`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-Wengu-Client': 'app' },
      body: JSON.stringify({ username, password }),
    },
    15000,
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok || !data.token) {
    throw new Error(data?.message || `云端登录失败（HTTP ${res.status}）`)
  }
  return { host, token: String(data.token) }
}

async function fetchCloudLayer(host, apiPrefix, auth, parentId) {
  const q = encodeURIComponent(parentId || '__root__')
  const { res, data } = await cloudJson(
    `${host}${apiPrefix}/tree?parent=${q}&skipReady=1`,
    auth,
    20000,
  )
  if (!res.ok || !data?.ok || !Array.isArray(data.tree)) {
    throw new Error(data?.message || `读取云端目录失败（HTTP ${res.status}）`)
  }
  return {
    tree: data.tree,
    entries: Array.isArray(data.entries) ? data.entries : [],
  }
}

async function fetchCloudTreeByLayers(host, apiPrefix, auth) {
  const root = await fetchCloudLayer(host, apiPrefix, auth, '__root__')
  async function fill(nodes) {
    if (!Array.isArray(nodes) || !nodes.length) return
    await mapPool(nodes, 8, async (n) => {
      if (n.hasBody === false) {
        n.children = Array.isArray(n.children) ? n.children : []
        n.entries = Array.isArray(n.entries) ? n.entries : []
        n.loaded = true
        return
      }
      const layer = await fetchCloudLayer(host, apiPrefix, auth, n.id)
      n.children = layer.tree
      n.entries = layer.entries
      n.loaded = true
      await fill(n.children)
    })
  }
  await fill(root.tree)
  return root.tree
}

async function fetchCloudTree(host, apiPrefix, auth) {
  try {
    const { res, data } = await cloudJson(`${host}${apiPrefix}/tree?skipReady=1`, auth, 8000)
    if (res.ok && data?.ok && Array.isArray(data.tree) && !catalogTreeLooksLikeStub(data.tree)) {
      return stripCatalogClientFlags(data.tree)
    }
  } catch {
    /* 整树超时或残片时改按层拉 */
  }
  const tree = await fetchCloudTreeByLayers(host, apiPrefix, auth)
  return stripCatalogClientFlags(tree)
}

export async function fetchCloudHandoutPack({
  apiPrefix,
  mediaPrefix,
  skipItemIds = [],
  skipMediaNames = [],
}) {
  const { host, token } = await loginCloudAdmin()
  const auth = { authorization: `Bearer ${token}`, 'X-Wengu-Client': 'app' }
  const tree = await fetchCloudTree(host, apiPrefix, auth)
  const allIds = [...new Set(collectAllEntryIds(tree))]
  const skipItems = new Set((skipItemIds || []).map(String))
  const skipMedia = new Set((skipMediaNames || []).map(String))
  const ids = allIds.filter((id) => !skipItems.has(id))
  const items = {}
  await mapPool(ids, 10, async (id) => {
    try {
      const { res, data } = await cloudJson(
        `${host}${apiPrefix}/items/${encodeURIComponent(id)}`,
        auth,
        20000,
      )
      if (!res.ok || !data?.ok || !data.item) return
      items[id] = data.item
    } catch {
      /* 单篇失败不中断整包 */
    }
  })
  const media = {}
  const names = new Set()
  for (const item of Object.values(items)) {
    for (const name of collectMediaNames(item.content, mediaPrefix)) {
      if (!skipMedia.has(name)) names.add(name)
    }
  }
  await mapPool([...names], 6, async (name) => {
    try {
      const res = await cloudFetch(`${host}${mediaPrefix}/${encodeURIComponent(name)}`, { headers: auth }, 20000)
      if (!res.ok) return
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length) media[name] = buf
    } catch {
      /* 插图失败不影响目录合并 */
    }
  })
  return { tree, items, media, host, remoteCount: allIds.length, fetchedCount: ids.length }
}
