/**
 * 计算机基础持久化：优先 Cloudflare KV（WENGU_KV），
 * 未绑定时用 Cache API 兜底，出门在 pages.dev 也能改讲义。
 */
const INDEX_KEY = 'cb:__index__'
let storeOrigin = 'https://qmea-cb.internal'

export function rememberCbStoreOrigin(request) {
  try {
    if (request?.url) storeOrigin = new URL(request.url).origin
  } catch {
    /* keep */
  }
}

export function getCbStore(env) {
  if (env?.WENGU_KV) return env.WENGU_KV
  try {
    if (typeof caches !== 'undefined' && caches.default) return new CacheCbStore()
  } catch {
    /* ignore */
  }
  return null
}

class CacheCbStore {
  constructor() {
    this.cache = caches.default
    this.indexMemo = null
  }

  req(key) {
    return new Request(`${storeOrigin}/__cb-store/${encodeURIComponent(key)}`, { method: 'GET' })
  }

  async get(key, opts = {}) {
    try {
      const res = await this.cache.match(this.req(key))
      if (!res) return null
      const type = opts.type || 'text'
      if (type === 'json') {
        try {
          return await res.clone().json()
        } catch {
          return null
        }
      }
      if (type === 'arrayBuffer') return res.arrayBuffer()
      return res.text()
    } catch {
      return null
    }
  }

  async getWithMetadata(key, opts = {}) {
    try {
      const res = await this.cache.match(this.req(key))
      if (!res) return { value: null, metadata: null }
      const mime = res.headers.get('x-cb-mime') || res.headers.get('content-type') || ''
      const type = opts.type || 'text'
      const value = type === 'arrayBuffer' ? await res.arrayBuffer() : await res.text()
      return { value, metadata: { mime } }
    } catch {
      return { value: null, metadata: null }
    }
  }

  async put(key, value, opts = {}) {
    const mime = opts.metadata?.mime || (typeof value === 'string' ? 'application/json; charset=utf-8' : 'application/octet-stream')
    const body = value instanceof Uint8Array ? value : value
    const res = new Response(body, {
      headers: {
        'content-type': mime,
        'x-cb-mime': mime,
        'cache-control': 'max-age=31536000, immutable',
      },
    })
    await this.cache.put(this.req(key), res)
    if (key !== INDEX_KEY) await this.touchIndex(key, mime)
  }

  async delete(key) {
    await this.cache.delete(this.req(key))
    if (key === INDEX_KEY) {
      this.indexMemo = { keys: {} }
      return
    }
    const index = await this.readIndex()
    if (index.keys[key]) {
      delete index.keys[key]
      await this.writeIndex(index)
    }
  }

  async list(opts = {}) {
    const prefix = String(opts.prefix || '')
    const index = await this.readIndex()
    const keys = Object.keys(index.keys)
      .filter((name) => !prefix || name.startsWith(prefix))
      .map((name) => ({ name }))
    return { keys }
  }

  async readIndex() {
    if (this.indexMemo) return this.indexMemo
    const raw = await this.get(INDEX_KEY, { type: 'json' })
    this.indexMemo = raw && typeof raw === 'object' && raw.keys ? raw : { keys: {} }
    return this.indexMemo
  }

  async writeIndex(index) {
    this.indexMemo = index
    const res = new Response(JSON.stringify(index), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'max-age=31536000',
      },
    })
    await this.cache.put(this.req(INDEX_KEY), res)
  }

  async touchIndex(key, mime) {
    const index = await this.readIndex()
    index.keys[key] = { mime: mime || '' }
    await this.writeIndex(index)
  }
}

export async function hydrateCbStoreFromAssets(store, env, request, helpers) {
  if (!store) return
  const existing = await store.get(helpers.catalogKey, { type: 'json' })
  if (existing && Array.isArray(existing.tree) && existing.tree.length) return
  const snap = await helpers.readJsonAsset(env, request, '/cb-data/catalog.json')
  if (!snap || !Array.isArray(snap.tree) || !snap.tree.length) return

  await store.put(
    helpers.catalogKey,
    JSON.stringify({ ...snap, updatedAt: new Date().toISOString() }),
  )

  const ids = []
  const walk = (nodes) => {
    for (const node of nodes || []) {
      for (const entry of node.entries || []) {
        if (entry?.id) ids.push(String(entry.id))
      }
      walk(node.children)
    }
  }
  walk(snap.tree)

  for (const id of ids) {
    try {
      const item = await helpers.readJsonAsset(env, request, `/cb-data/items/${id}.json`)
      if (!item || typeof item !== 'object') continue
      await store.put(helpers.itemKey(id), JSON.stringify({ ...item, id }))
    } catch {
      /* 单篇失败不影响目录；正文仍可从 /cb-data 读 */
    }
  }
}
