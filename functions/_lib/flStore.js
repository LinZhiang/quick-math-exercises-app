/**
 * 前端学习云端持久化：只用 Cloudflare KV（WENGU_KV）。
 * 不要用 Cache API 当数据库——会过期，灌 /fl-data 快照会把用户新加的目录盖掉。
 * 未绑定 KV 时，讲义只读构建快照；增删改请用本机 Node（npm run dev:full）。
 */
import { getWenguKv } from './kvBinding.js'
import { kvPutIfChanged } from './kvWrite.js'

const USER_OWNED_KEY = 'fl:user-owned'

export { USER_OWNED_KEY as FL_USER_OWNED_KEY }

export function rememberFlStoreOrigin() {
  /* 不再按 origin 拆缓存键，也不再用边缘 Cache 当库 */
}

export function getFlStore(env) {
  return getWenguKv(env)
}

function catalogLooksSaved(raw) {
  return Boolean(raw && typeof raw === 'object' && Array.isArray(raw.tree))
}

export async function hydrateFlStoreFromAssets(store, env, request, helpers) {
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

  const snap = await helpers.readJsonAsset(env, request, '/fl-data/catalog.json')
  if (!snap || !Array.isArray(snap.tree) || !snap.tree.length) return

  // 只写目录一份。正文按需从静态快照读，禁止在这里把每一篇都 put 进 KV。
  try {
    await kvPutIfChanged(
      store,
      helpers.catalogKey,
      JSON.stringify({ ...snap, updatedAt: new Date().toISOString(), userOwned: false }),
    )
  } catch {
    /* 额度用尽时继续读静态快照，不要把打开页面变成失败 */
  }
}

let ownedMarked = false

export async function markFlStoreUserOwned(store) {
  if (!store || ownedMarked) return
  try {
    const had = await store.get(USER_OWNED_KEY)
    if (had) {
      ownedMarked = true
      return
    }
    await kvPutIfChanged(store, USER_OWNED_KEY, '1')
    ownedMarked = true
  } catch (e) {
    if (e?.code === 'KV_QUOTA') throw e
  }
}
