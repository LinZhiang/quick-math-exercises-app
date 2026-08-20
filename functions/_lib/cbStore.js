/**
 * 计算机基础云端持久化：只用 Cloudflare KV（WENGU_KV）。
 * 不要用 Cache API 当数据库——会过期，点「检查并更新」后目录会被静态快照盖掉。
 * 未绑定 KV 时，讲义只读 /cb-data（本机 Node 构建时拷过去的快照）。
 */
export function rememberCbStoreOrigin() {
  /* 不再按 origin 拆缓存键 */
}

export function getCbStore(env) {
  return env?.WENGU_KV || null
}

export async function hydrateCbStoreFromAssets(store, env, request, helpers) {
  if (!store) return
  const existing = await store.get(helpers.catalogKey, { type: 'json' })
  if (existing && typeof existing === 'object' && Array.isArray(existing.tree)) return
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
      const had = await store.get(helpers.itemKey(id))
      if (had) continue
      await store.put(helpers.itemKey(id), JSON.stringify({ ...item, id }))
    } catch {
      /* 单篇失败不影响目录 */
    }
  }
}
