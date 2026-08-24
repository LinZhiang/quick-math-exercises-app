/**
 * 前端学习云端存储（与本机 Node 目录结构对齐）
 * 读写只走 WENGU_KV；没有 KV 时 GET 读 /fl-data 快照（只读）。
 * 禁止用边缘 Cache API 当库，否则用户新加的目录会被静态快照盖掉。
 */
import { json, requireAdmin } from './wenguCloudAuth.js'
import {
  getFlStore,
  hydrateFlStoreFromAssets,
  markFlStoreUserOwned,
  rememberFlStoreOrigin,
  FL_USER_OWNED_KEY,
} from './flStore.js'

const CATALOG_KEY = 'fl:catalog'
const MIME_TO_EXT = {
  jpeg: 'jpg',
  jpg: 'jpg',
  png: 'png',
  gif: 'gif',
  webp: 'webp',
  'svg+xml': 'svg',
}
const EXT_TO_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

function getStore(env) {
  return getFlStore(env)
}

async function ensureStore(env, request) {
  const store = getStore(env)
  if (!store) return null
  try {
    await hydrateFlStoreFromAssets(store, env, request, {
      catalogKey: CATALOG_KEY,
      itemKey,
      mediaKey,
      fetchAsset,
      readJsonAsset,
      guessMime,
    })
  } catch {
    /* 快照灌库失败时仍允许写入，目录会从静态资源回填 */
  }
  return store
}

async function fetchAsset(env, request, pathname) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function' || !request) return null
  try {
    const url = new URL(pathname, request.url)
    const res = await env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }))
    if (!res.ok) return null
    return res
  } catch {
    return null
  }
}

async function readJsonAsset(env, request, pathname) {
  const res = await fetchAsset(env, request, pathname)
  if (!res) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

function noStore() {
  return json(
    {
      ok: false,
      message:
        '请在本机用 npm run dev:full 增删改讲义（写入 server/data）。云端未绑定 KV 时不会把改动写进缓存，以免目录被构建快照盖掉。出门要看到新目录，请重新部署，或绑定 WENGU_KV 后执行 npm run sync:cf-frontend。',
    },
    503,
  )
}

function itemKey(id) {
  return `fl:item:${id}`
}

function mediaKey(file) {
  return `fl:media:${file}`
}

function safeId(raw) {
  const id = String(raw || '')
  return /^[a-zA-Z0-9._-]+$/.test(id) ? id : ''
}

function sanitizeName(raw) {
  const name = String(raw ?? '').trim()
  if (!name || name.length > 80) return null
  return name
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function guessMime(file) {
  const ext = String(file).split('.').pop()?.toLowerCase() || ''
  return EXT_TO_MIME[ext] || 'application/octet-stream'
}

function b64ToBytes(b64) {
  const bin = atob(String(b64 || '').replace(/\s+/g, ''))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function readRawCatalog(env, request) {
  const store = getStore(env)
  if (store) {
    const raw = await store.get(CATALOG_KEY, { type: 'json' })
    if (raw && typeof raw === 'object' && Array.isArray(raw.tree)) {
      return raw
    }
    let owned = false
    try {
      owned = Boolean(await store.get(FL_USER_OWNED_KEY))
    } catch {
      /* ignore */
    }
    if (owned || raw?.userOwned) {
      const err = new Error('USER_CATALOG_UNAVAILABLE')
      err.code = 'USER_CATALOG_UNAVAILABLE'
      throw err
    }
  }
  const snap = request ? await readJsonAsset(env, request, '/fl-data/catalog.json') : null
  if (snap && typeof snap === 'object' && Array.isArray(snap.tree)) {
    return { ...snap, tree: snap.tree }
  }
  return { tree: [] }
}

async function writeCatalog(env, tree) {
  const store = getStore(env)
  if (!store) throw new Error('云端存储不可用')
  const prev = await store.get(CATALOG_KEY, { type: 'json' })
  const base = prev && typeof prev === 'object' ? prev : {}
  await store.put(
    CATALOG_KEY,
    JSON.stringify({ ...base, tree, updatedAt: new Date().toISOString(), userOwned: true }),
  )
  await markFlStoreUserOwned(store)
}

async function putRecord(env, key, value, opts) {
  const store = getStore(env)
  if (!store) throw new Error('云端存储不可用')
  await store.put(key, value, opts)
}

async function itemExists(env, id) {
  const store = getStore(env)
  if (!store) return false
  const hit = await store.get(itemKey(id))
  return Boolean(hit)
}

async function applyReadyFlags(env, tree) {
  const walk = async (nodes) => {
    for (const node of nodes) {
      if (!Array.isArray(node.entries)) node.entries = []
      if (!Array.isArray(node.children)) node.children = []
      for (const entry of node.entries) {
        if (await itemExists(env, String(entry.id))) entry.ready = true
      }
      await walk(node.children)
    }
  }
  await walk(tree)
  return tree
}

function findNode(nodes, id, parent = null) {
  for (const node of nodes) {
    if (node.id === id) return { node, parent, siblings: nodes }
    const hit = findNode(node.children || [], id, node)
    if (hit) return hit
  }
  return null
}

function findEntry(nodes, id) {
  for (const node of nodes) {
    const list = node.entries || []
    const idx = list.findIndex((e) => e.id === id)
    if (idx >= 0) return { node, idx, entry: list[idx] }
    const hit = findEntry(node.children || [], id)
    if (hit) return hit
  }
  return null
}

function pathNamesTo(nodes, id, acc = []) {
  for (const node of nodes) {
    const next = [...acc, node.name]
    if (node.id === id) return next
    const hit = pathNamesTo(node.children || [], id, next)
    if (hit) return hit
  }
  return null
}

function collectNodeIds(node, out = []) {
  out.push(node.id)
  for (const child of node.children || []) collectNodeIds(child, out)
  return out
}

function clampIndex(index, len) {
  const n = Number(index)
  if (!Number.isFinite(n)) return len
  return Math.max(0, Math.min(Math.round(n), len))
}

function moveNodeInTree(tree, id, parentId, index) {
  const hit = findNode(tree, id)
  if (!hit) return { error: '未找到该分类', status: 404 }
  const desc = collectNodeIds(hit.node)
  if (parentId && (parentId === id || desc.includes(parentId))) {
    return { error: '不能挪到自己或下属分类里', status: 400 }
  }
  const fromIdx = hit.siblings.findIndex((n) => n.id === hit.node.id)
  if (fromIdx < 0) return { error: '目录结构异常', status: 500 }
  hit.siblings.splice(fromIdx, 1)
  let dest
  if (parentId == null || parentId === '') dest = tree
  else {
    const p = findNode(tree, parentId)
    if (!p) {
      hit.siblings.splice(fromIdx, 0, hit.node)
      return { error: '未找到目标分类', status: 404 }
    }
    dest = p.node.children
  }
  dest.splice(clampIndex(index, dest.length), 0, hit.node)
  return { ok: true, node: hit.node }
}

function moveEntryInTree(tree, id, parentId, index) {
  const hit = findEntry(tree, id)
  if (!hit) return { error: '未找到该讲义', status: 404 }
  const p = findNode(tree, parentId)
  if (!p) return { error: '未找到目标分类', status: 404 }
  const entry = hit.entry
  hit.node.entries.splice(hit.idx, 1)
  p.node.entries.splice(clampIndex(index, p.node.entries.length), 0, entry)
  return { ok: true, entry, parent: p.node }
}

function collectEntryIds(node, out = []) {
  for (const e of node.entries || []) out.push(e.id)
  for (const child of node.children || []) collectEntryIds(child, out)
  return out
}

async function rewriteLearningPath(env, request, tree, itemId) {
  const rec = await readItem(env, itemId, request)
  if (!rec) return
  const hit = findEntry(tree, itemId)
  rec.learningPath = hit ? pathNamesTo(tree, hit.node.id) ?? [hit.node.name] : rec.learningPath
  await putRecord(env, itemKey(itemId), JSON.stringify({ ...rec, id: itemId }))
}

async function nextMediaIndex(env, itemId) {
  const store = getStore(env)
  if (!store) return 0
  const listed = await store.list({ prefix: mediaKey(`${itemId}-`) })
  let index = 0
  for (const k of listed.keys) {
    const name = String(k.name).slice('fl:media:'.length)
    const m = name.match(new RegExp(`^${itemId}-(\\d+)\\.`))
    if (m) index = Math.max(index, Number(m[1]))
  }
  return index
}

async function writeMediaFile(env, itemId, index, mime, b64) {
  const ext = MIME_TO_EXT[String(mime || '').toLowerCase()] || 'bin'
  const file = `${itemId}-${index}.${ext}`
  const contentType = EXT_TO_MIME[ext] || 'application/octet-stream'
  const store = getStore(env)
  if (!store) throw new Error('云端存储不可用')
  await store.put(mediaKey(file), b64ToBytes(b64), { metadata: { mime: contentType } })
  return `/api/media/frontend-learning/${file}`
}

async function extractDataImages(env, content, itemId) {
  let index = await nextMediaIndex(env, itemId)
  let out = String(content || '')
  const mdRe = /!\[([^\]]*)]\(data:image\/([a-zA-Z0-9.+-]+);base64,([^)]+)\)/g
  const mdHits = [...out.matchAll(mdRe)]
  for (const hit of mdHits) {
    index += 1
    const url = await writeMediaFile(env, itemId, index, hit[2], hit[3])
    out = out.replace(hit[0], `![${hit[1]}](${url})`)
  }
  const htmlRe = /<img\b([^>]*?)src=(["'])data:image\/([a-zA-Z0-9.+-]+);base64,([^"']+)\2([^>]*)>/gi
  const htmlHits = [...out.matchAll(htmlRe)]
  for (const hit of htmlHits) {
    index += 1
    const url = await writeMediaFile(env, itemId, index, hit[3], hit[4])
    out = out.replace(hit[0], `<img${hit[1]}src="${url}"${hit[5]}>`)
  }
  return out
}

async function deleteItemFiles(env, id) {
  const store = getStore(env)
  if (!store) return
  await store.delete(itemKey(id))
  const listed = await store.list({ prefix: mediaKey(`${id}-`) })
  await Promise.all(listed.keys.map((k) => store.delete(k.name)))
}

async function readItem(env, id, request) {
  const safe = safeId(id)
  if (!safe) return null
  const store = getStore(env)
  if (store) {
    const rec = await store.get(itemKey(safe), { type: 'json' })
    if (rec && typeof rec === 'object') return rec
  }
  const snap = await readJsonAsset(env, request, `/fl-data/items/${safe}.json`)
  if (snap && typeof snap === 'object') return snap
  return null
}

function pathSegs(pathParam) {
  if (pathParam == null) return []
  if (Array.isArray(pathParam)) return pathParam.map(String).filter(Boolean)
  return String(pathParam)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function handleFrontendLearning(env, request, pathParam) {
  rememberFlStoreOrigin(request)
  const segs = pathSegs(pathParam)
  const method = request.method.toUpperCase()
  try {
    if (method === 'GET' && segs[0] === 'tree' && segs.length === 1) {
      await ensureStore(env, request)
      const raw = await readRawCatalog(env, request)
      const tree = Array.isArray(raw.tree) ? raw.tree : []
      if (tree.length && getStore(env)) {
        return json({ ok: true, tree: await applyReadyFlags(env, tree) })
      }
      return json({ ok: true, tree })
    }

    if (method === 'GET' && segs[0] === 'items' && segs.length === 2) {
      const item = await readItem(env, segs[1], request)
      if (!item) return json({ ok: false, message: '未找到该讲义' }, 404)
      return json({ ok: true, item })
    }

    if (method === 'POST' && segs[0] === 'import' && segs.length === 1) {
      return handleImport(env, request)
    }

    if (method === 'POST' && segs[0] === 'nodes' && segs.length === 1) {
      return handleCreateNode(env, request)
    }
    if ((method === 'PATCH' || method === 'DELETE') && segs[0] === 'nodes' && segs.length === 2) {
      return method === 'PATCH' ? handleRenameNode(env, request, segs[1]) : handleDeleteNode(env, segs[1], request)
    }

    if (method === 'POST' && segs[0] === 'items' && segs.length === 1) {
      return handleCreateItem(env, request)
    }
    if ((method === 'PATCH' || method === 'DELETE') && segs[0] === 'items' && segs.length === 2) {
      return method === 'PATCH' ? handlePatchItem(env, request, segs[1]) : handleDeleteItem(env, segs[1], request)
    }

    return json({ ok: false, message: '未找到该接口' }, 404)
  } catch (e) {
    if (e?.code === 'USER_CATALOG_UNAVAILABLE') {
      return json(
        {
          ok: false,
          message: '用户目录暂时读不到，已拒绝用旧快照覆盖。请稍后重试，以免新加的分类消失。',
        },
        503,
      )
    }
    return json({ ok: false, message: e instanceof Error ? e.message : '前端学习接口失败' }, 500)
  }
}

export async function handleFrontendLearningMedia(env, fileName, request) {
  rememberFlStoreOrigin(request)
  const name = safeId(fileName)
  if (!name) return new Response('not found', { status: 404 })
  const store = getStore(env)
  if (store) {
    const rec = await store.getWithMetadata(mediaKey(name), { type: 'arrayBuffer' })
    if (rec.value) {
      const mime = rec.metadata?.mime || guessMime(name)
      return new Response(rec.value, {
        headers: {
          'content-type': mime,
          'cache-control': 'public, max-age=86400',
        },
      })
    }
  }
  const asset = await fetchAsset(env, request, `/fl-data/media/${name}`)
  if (asset) {
    return new Response(asset.body, {
      headers: {
        'content-type': guessMime(name),
        'cache-control': 'public, max-age=86400',
      },
    })
  }
  return new Response('not found', { status: 404 })
}

async function handleImport(env, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  const store = await ensureStore(env, request)
  if (!store) return noStore()
  const body = await request.json().catch(() => ({}))
  const tree = Array.isArray(body.tree) ? body.tree : []
  const items = body.items && typeof body.items === 'object' ? body.items : {}
  const media = body.media && typeof body.media === 'object' ? body.media : {}
  for (const [id, item] of Object.entries(items)) {
    const safe = safeId(id)
    if (!safe || !item || typeof item !== 'object') continue
    await store.put(itemKey(safe), JSON.stringify({ ...item, id: safe }))
  }
  for (const [file, b64] of Object.entries(media)) {
    const name = safeId(file)
    if (!name || !b64) continue
    await store.put(mediaKey(name), b64ToBytes(String(b64)), { metadata: { mime: guessMime(name) } })
  }
  await writeCatalog(env, tree)
  return json({
    ok: true,
    items: Object.keys(items).length,
    media: Object.keys(media).length,
  })
}

async function handleCreateNode(env, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const body = await request.json().catch(() => ({}))
  const name = sanitizeName(body.name)
  if (!name) return json({ ok: false, message: '名称不能为空（最多 80 字）' }, 400)
  const catalog = await readRawCatalog(env, request)
  const parentId = body.parentId == null || body.parentId === '' ? null : String(body.parentId)
  const node = { id: newId('n'), name, children: [], entries: [] }
  if (!parentId) {
    catalog.tree.push(node)
  } else {
    const hit = findNode(catalog.tree, parentId)
    if (!hit) return json({ ok: false, message: '未找到父分类' }, 404)
    hit.node.children.push(node)
  }
  await writeCatalog(env, catalog.tree)
  return json({ ok: true, node })
}

async function handleRenameNode(env, request, id) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const body = await request.json().catch(() => ({}))
  const catalog = await readRawCatalog(env, request)
  const moving = Object.prototype.hasOwnProperty.call(body, 'parentId') || body.index != null
  if (moving) {
    const parentId = body.parentId == null || body.parentId === '' ? null : String(body.parentId)
    const moved = moveNodeInTree(catalog.tree, String(id), parentId, body.index)
    if (moved.error) return json({ ok: false, message: moved.error }, moved.status || 400)
    if (body.name != null) {
      const name = sanitizeName(body.name)
      if (!name) return json({ ok: false, message: '名称不能为空（最多 80 字）' }, 400)
      moved.node.name = name
    }
    await writeCatalog(env, catalog.tree)
    for (const entryId of collectEntryIds(moved.node)) {
      await rewriteLearningPath(env, request, catalog.tree, entryId)
    }
    return json({ ok: true, node: moved.node })
  }
  const name = sanitizeName(body.name)
  if (!name) return json({ ok: false, message: '名称不能为空（最多 80 字）' }, 400)
  const hit = findNode(catalog.tree, String(id))
  if (!hit) return json({ ok: false, message: '未找到该分类' }, 404)
  hit.node.name = name
  await writeCatalog(env, catalog.tree)
  return json({ ok: true, node: hit.node })
}

async function handleDeleteNode(env, id, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const catalog = await readRawCatalog(env, request)
  const hit = findNode(catalog.tree, String(id))
  if (!hit) return json({ ok: false, message: '未找到该分类' }, 404)
  for (const entryId of collectEntryIds(hit.node)) await deleteItemFiles(env, entryId)
  const idx = hit.siblings.findIndex((n) => n.id === hit.node.id)
  if (idx >= 0) hit.siblings.splice(idx, 1)
  await writeCatalog(env, catalog.tree)
  return json({ ok: true })
}

async function handleCreateItem(env, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const body = await request.json().catch(() => ({}))
  const title = sanitizeName(body.title)
  const parentId = String(body.parentId ?? '')
  if (!title) return json({ ok: false, message: '标题不能为空（最多 80 字）' }, 400)
  if (!parentId) return json({ ok: false, message: '请选择所属分类' }, 400)
  const catalog = await readRawCatalog(env, request)
  const hit = findNode(catalog.tree, parentId)
  if (!hit) return json({ ok: false, message: '未找到所属分类' }, 404)
  const id = newId('q')
  const learningPath = pathNamesTo(catalog.tree, parentId) ?? [hit.node.name]
  const type = String(body.type || 'handout')
  const content = await extractDataImages(env, String(body.content ?? ''), id)
  const item = {
    id,
    title,
    type,
    learningPath,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : ['讲义', hit.node.name],
    content,
  }
  await putRecord(env, itemKey(id), JSON.stringify(item))
  hit.node.entries.push({ id, title, ready: true, type })
  await writeCatalog(env, catalog.tree)
  return json({ ok: true, item })
}

async function handlePatchItem(env, request, idRaw) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const id = String(idRaw)
  const current = await readItem(env, id, request)
  if (!current) return json({ ok: false, message: '未找到该讲义' }, 404)
  const body = await request.json().catch(() => ({}))
  const moving = Object.prototype.hasOwnProperty.call(body, 'parentId') || body.index != null
  if (moving && body.parentId) {
    const catalog = await readRawCatalog(env, request)
    const moved = moveEntryInTree(catalog.tree, id, String(body.parentId), body.index)
    if (moved.error) return json({ ok: false, message: moved.error }, moved.status || 400)
    if (body.title != null) {
      const title = sanitizeName(body.title)
      if (!title) return json({ ok: false, message: '标题不能为空（最多 80 字）' }, 400)
      moved.entry.title = title
    }
    await writeCatalog(env, catalog.tree)
    await rewriteLearningPath(env, request, catalog.tree, id)
    const item = await readItem(env, id, request)
    if (!item) return json({ ok: false, message: '未找到该讲义' }, 404)
    return json({ ok: true, item })
  }
  const title = body.title == null ? current.title : sanitizeName(body.title)
  if (!title) return json({ ok: false, message: '标题不能为空（最多 80 字）' }, 400)
  const content =
    body.content == null ? current.content : await extractDataImages(env, String(body.content), id)
  const item = {
    ...current,
    title,
    content,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : current.tags,
  }
  await putRecord(env, itemKey(id), JSON.stringify(item))
  const catalog = await readRawCatalog(env, request)
  const hit = findEntry(catalog.tree, id)
  if (hit) {
    hit.entry.title = title
    hit.entry.ready = true
    await writeCatalog(env, catalog.tree)
  }
  return json({ ok: true, item })
}

async function handleDeleteItem(env, idRaw, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!(await ensureStore(env, request))) return noStore()
  const id = String(idRaw)
  const catalog = await readRawCatalog(env, request)
  const hit = findEntry(catalog.tree, id)
  if (!hit) {
    await deleteItemFiles(env, id)
    return json({ ok: false, message: '未找到该讲义' }, 404)
  }
  hit.node.entries.splice(hit.idx, 1)
  await deleteItemFiles(env, id)
  await writeCatalog(env, catalog.tree)
  return json({ ok: true })
}
