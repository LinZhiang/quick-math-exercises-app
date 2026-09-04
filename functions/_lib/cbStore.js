/**
 * 计算机基础云端持久化：只用 Cloudflare KV（WENGU_KV）。
 * 不要用 Cache API 当数据库——会过期，灌 /cb-data 快照会把用户新加的目录盖掉。
 * 未绑定 KV 时，讲义只读构建快照；增删改请用本机 Node（npm run dev:full）。
 */
import { getWenguKv } from './kvBinding.js'

const USER_OWNED_KEY = 'cb:user-owned'

export { USER_OWNED_KEY as CB_USER_OWNED_KEY }

export function rememberCbStoreOrigin() {
  /* 不再按 origin 拆缓存键，也不再用边缘 Cache 当库 */
}

export function getCbStore(env) {
  return getWenguKv(env)
}

function catalogLooksSaved(raw) {
  return Boolean(raw && typeof raw === 'object' && Array.isArray(raw.tree))
}

export async function hydrateCbStoreFromAssets(store, env, request, helpers) {
  if (!store) return
  try {
    const owned = await store.get(USER_OWNED_KEY)
    if (owned) return
  } catch {
    /* 标记读失败时仍按目录键判断，避免误灌快照 */
  }

  const existing = await store.get(helpers.catalogKey, { type: 'json' })
  if (existing && existing.userOwned) return
  if (catalogLooksSaved(existing)) return

  try {
    if (typeof store.list === 'function') {
      const listed = await store.list({ prefix: helpers.catalogKey })
      const names = (listed?.keys || []).map((k) => k.name)
      if (names.includes(helpers.catalogKey)) return
    }
  } catch {
    /* 无 list 的存储忽略 */
  }

  const snap = await helpers.readJsonAsset(env, request, '/cb-data/catalog.json')
  if (!snap || !Array.isArray(snap.tree) || !snap.tree.length) return

  await store.put(
    helpers.catalogKey,
    JSON.stringify({ ...snap, updatedAt: new Date().toISOString(), userOwned: false }),
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
      const had = await store.get(helpers.itemKey(id))
      if (had) continue
      await store.put(helpers.itemKey(id), JSON.stringify({ ...item, id }))
    } catch {
      /* 单篇失败不影响目录 */
    }
  }
}

export async function markCbStoreUserOwned(store) {
  if (!store) return
  try {
    await store.put(USER_OWNED_KEY, '1')
  } catch {
    /* KV 写入失败时仍以 catalog.userOwned 为准 */
  }
}
