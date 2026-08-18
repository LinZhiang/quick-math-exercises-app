/**
 * 计算机基础：Cloudflare KV 存储（与本机 Node 目录结构对齐）
 * 绑定：WENGU_KV
 */
import { json, requireAdmin } from './wenguCloudAuth.js'

const CATALOG_KEY = 'cb:catalog'
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

function kv(env) {
  return env.WENGU_KV || null
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

function noKv() {
  return json(
    {
      ok: false,
      message:
        '云端未绑定 KV（WENGU_KV），无法存放计算机基础讲义。请在 Cloudflare Pages → Settings → Functions → KV bindings 绑定 WENGU_KV，部署后再执行 npm run sync:cf-computer。',
    },
    503,
  )
}

function itemKey(id) {
  return `cb:item:${id}`
}

function mediaKey(file) {
  return `cb:media:${file}`
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

async function readRawCatalog(env) {
  const store = kv(env)
  if (!store) return { tree: [] }
  const raw = await store.get(CATALOG_KEY, { type: 'json' })
  if (!raw || typeof raw !== 'object') return { tree: [] }
  if (!Array.isArray(raw.tree)) raw.tree = []
  return raw
}

async function writeCatalog(env, tree) {
  const store = kv(env)
  const prev = await readRawCatalog(env)
  await store.put(
    CATALOG_KEY,
    JSON.stringify({ ...prev, tree, updatedAt: new Date().toISOString() }),
  )
}

async function itemExists(env, id) {
  const store = kv(env)
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
        entry.ready = await itemExists(env, String(entry.id))
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

function collectEntryIds(node, out = []) {
  for (const e of node.entries || []) out.push(e.id)
  for (const child of node.children || []) collectEntryIds(child, out)
  return out
}

async function nextMediaIndex(env, itemId) {
  const store = kv(env)
  if (!store) return 0
  const listed = await store.list({ prefix: mediaKey(`${itemId}-`) })
  let index = 0
  for (const k of listed.keys) {
    const name = String(k.name).slice('cb:media:'.length)
    const m = name.match(new RegExp(`^${itemId}-(\\d+)\\.`))
    if (m) index = Math.max(index, Number(m[1]))
  }
  return index
}

async function writeMediaFile(env, itemId, index, mime, b64) {
  const ext = MIME_TO_EXT[String(mime || '').toLowerCase()] || 'bin'
  const file = `${itemId}-${index}.${ext}`
  const contentType = EXT_TO_MIME[ext] || 'application/octet-stream'
  await kv(env).put(mediaKey(file), b64ToBytes(b64), { metadata: { mime: contentType } })
  return `/api/media/computer-basics/${file}`
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
  const store = kv(env)
  await store.delete(itemKey(id))
  const listed = await store.list({ prefix: mediaKey(`${id}-`) })
  await Promise.all(listed.keys.map((k) => store.delete(k.name)))
}

async function readItem(env, id, request) {
  const safe = safeId(id)
  if (!safe) return null
  const store = kv(env)
  if (store) {
    const rec = await store.get(itemKey(safe), { type: 'json' })
    if (rec && typeof rec === 'object') return rec
  }
  const snap = await readJsonAsset(env, request, `/cb-data/items/${safe}.json`)
  return snap && typeof snap === 'object' ? snap : null
}

function pathSegs(pathParam) {
  if (pathParam == null) return []
  if (Array.isArray(pathParam)) return pathParam.map(String).filter(Boolean)
  return String(pathParam)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function handleComputerBasics(env, request, pathParam) {
  const segs = pathSegs(pathParam)
  const method = request.method.toUpperCase()
  try {
    if (method === 'GET' && segs[0] === 'tree' && segs.length === 1) {
      const store = kv(env)
      if (store) {
        const raw = await readRawCatalog(env)
        if (Array.isArray(raw.tree) && raw.tree.length) {
          return json({ ok: true, tree: await applyReadyFlags(env, raw.tree) })
        }
      }
      const snap = await readJsonAsset(env, request, '/cb-data/catalog.json')
      if (snap && Array.isArray(snap.tree)) {
        return json({ ok: true, tree: snap.tree })
      }
      return json({ ok: true, tree: [] })
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
    return json({ ok: false, message: e instanceof Error ? e.message : '计算机基础接口失败' }, 500)
  }
}

export async function handleComputerBasicsMedia(env, fileName, request) {
  const name = safeId(fileName)
  if (!name) return new Response('not found', { status: 404 })
  const store = kv(env)
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
  const asset = await fetchAsset(env, request, `/cb-data/media/${name}`)
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
  if (!kv(env)) return noKv()
  const body = await request.json().catch(() => ({}))
  const tree = Array.isArray(body.tree) ? body.tree : []
  const items = body.items && typeof body.items === 'object' ? body.items : {}
  const media = body.media && typeof body.media === 'object' ? body.media : {}
  const store = kv(env)
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
  if (!kv(env)) return noKv()
  const body = await request.json().catch(() => ({}))
  const name = sanitizeName(body.name)
  if (!name) return json({ ok: false, message: '名称不能为空（最多 80 字）' }, 400)
  const catalog = await readRawCatalog(env)
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
  if (!kv(env)) return noKv()
  const body = await request.json().catch(() => ({}))
  const name = sanitizeName(body.name)
  if (!name) return json({ ok: false, message: '名称不能为空（最多 80 字）' }, 400)
  const catalog = await readRawCatalog(env)
  const hit = findNode(catalog.tree, String(id))
  if (!hit) return json({ ok: false, message: '未找到该分类' }, 404)
  hit.node.name = name
  await writeCatalog(env, catalog.tree)
  return json({ ok: true, node: hit.node })
}

async function handleDeleteNode(env, id, request) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!kv(env)) return noKv()
  const catalog = await readRawCatalog(env)
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
  if (!kv(env)) return noKv()
  const body = await request.json().catch(() => ({}))
  const title = sanitizeName(body.title)
  const parentId = String(body.parentId ?? '')
  if (!title) return json({ ok: false, message: '标题不能为空（最多 80 字）' }, 400)
  if (!parentId) return json({ ok: false, message: '请选择所属分类' }, 400)
  const catalog = await readRawCatalog(env)
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
  await kv(env).put(itemKey(id), JSON.stringify(item))
  hit.node.entries.push({ id, title, ready: true, type })
  await writeCatalog(env, catalog.tree)
  return json({ ok: true, item })
}

async function handlePatchItem(env, request, idRaw) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  if (!kv(env)) return noKv()
  const id = String(idRaw)
  const current = await readItem(env, id)
  if (!current) return json({ ok: false, message: '未找到该讲义' }, 404)
  const body = await request.json().catch(() => ({}))
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
  await kv(env).put(itemKey(id), JSON.stringify(item))
  const catalog = await readRawCatalog(env)
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
  if (!kv(env)) return noKv()
  const id = String(idRaw)
  const catalog = await readRawCatalog(env)
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
