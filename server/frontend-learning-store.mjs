/**
 * 前端学习：Node 本地为真相源。
 * 目录/正文在 server/data/frontend-learning，插图拆成 media 文件，讲义用 /api/media/... 引用。
 */
import { requireAdmin } from './auth-core.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, 'data', 'frontend-learning')
const CATALOG_FILE = path.join(ROOT, 'catalog.json')
const ITEMS_DIR = path.join(ROOT, 'items')
const MEDIA_DIR = path.join(ROOT, 'media')
const SEED_FILE = path.join(__dirname, 'seeds', 'frontend-learning-seed.json')
const SEED_MEDIA_DIR = path.join(__dirname, 'seeds', 'frontend-learning-media')
const PUBLIC_MIRROR = path.join(__dirname, '..', 'public', 'fl-data')

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

function ensureDirs() {
  fs.mkdirSync(ITEMS_DIR, { recursive: true })
  fs.mkdirSync(MEDIA_DIR, { recursive: true })
}

function extFromMime(mime) {
  const key = String(mime || '').toLowerCase()
  return MIME_TO_EXT[key] || 'bin'
}

function nextMediaIndex(itemId) {
  if (!fs.existsSync(MEDIA_DIR)) return 0
  let index = 0
  for (const f of fs.readdirSync(MEDIA_DIR)) {
    const m = f.match(new RegExp(`^${itemId}-(\\d+)\\.`))
    if (m) index = Math.max(index, Number(m[1]))
  }
  return index
}

function writeMediaFile(itemId, index, mime, b64) {
  const ext = extFromMime(mime)
  const file = `${itemId}-${index}.${ext}`
  const abs = path.join(MEDIA_DIR, file)
  fs.writeFileSync(abs, Buffer.from(b64, 'base64'))
  mirrorPublicFile(abs, `media/${file}`)
  return `/api/media/frontend-learning/${file}`
}

function extractDataImages(content, itemId) {
  let index = nextMediaIndex(itemId)
  let out = String(content || '')
  out = out.replace(
    /!\[([^\]]*)]\(data:image\/([a-zA-Z0-9.+-]+);base64,([^)]+)\)/g,
    (_all, alt, mime, b64) => {
      index += 1
      return `![${alt}](${writeMediaFile(itemId, index, mime, b64)})`
    },
  )
  out = out.replace(
    /<img\b([^>]*?)src=(["'])data:image\/([a-zA-Z0-9.+-]+);base64,([^"']+)\2([^>]*)>/gi,
    (_all, pre, _q, mime, b64, post) => {
      index += 1
      const src = writeMediaFile(itemId, index, mime, b64)
      return `<img${pre}src="${src}"${post}>`
    },
  )
  return out
}

function itemFile(id) {
  return path.join(ITEMS_DIR, `${id}.json`)
}

function writeItemRecord(id, rec) {
  ensureDirs()
  const file = itemFile(id)
  atomicWriteFile(file, `${JSON.stringify({ ...rec, id }, null, 2)}\n`)
  mirrorPublicFile(file, `items/${id}.json`)
}

function applyReadyFlags(tree) {
  const walk = (nodes) => {
    for (const node of nodes) {
      if (!Array.isArray(node.entries)) node.entries = []
      if (!Array.isArray(node.children)) node.children = []
      for (const entry of node.entries) {
        entry.ready = fs.existsSync(itemFile(String(entry.id)))
      }
      walk(node.children)
    }
  }
  walk(tree)
  return tree
}

function copySeedMedia() {
  if (!fs.existsSync(SEED_MEDIA_DIR)) return
  ensureDirs()
  for (const name of fs.readdirSync(SEED_MEDIA_DIR)) {
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) continue
    const src = path.join(SEED_MEDIA_DIR, name)
    if (!fs.statSync(src).isFile()) continue
    fs.copyFileSync(src, path.join(MEDIA_DIR, name))
    mirrorPublicFile(path.join(MEDIA_DIR, name), `media/${name}`)
  }
}

function seedFromFrontendJson() {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(
      '前端学习尚未入库，且找不到种子文件 server/seeds/frontend-learning-seed.json。请先放入讲义数据。',
    )
  }
  const pack = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'))
  ensureDirs()
  copySeedMedia()
  const items = pack.items && typeof pack.items === 'object' ? pack.items : {}
  let imageCount = 0
  for (const [id, raw] of Object.entries(items)) {
    const before = String(raw.content ?? '')
    const content = extractDataImages(before, id)
    imageCount += (before.match(/!\[[^\]]*]\(data:image\//g) || []).length
    const item = {
      id: String(raw.id || id),
      title: String(raw.title || id),
      type: String(raw.type || 'handout'),
      learningPath: Array.isArray(raw.learningPath) ? raw.learningPath.map(String) : [],
      tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
      content,
    }
    fs.writeFileSync(itemFile(item.id), `${JSON.stringify(item, null, 2)}\n`, 'utf8')
  }
  const catalog = {
    tree: Array.isArray(pack.tree) ? pack.tree : [],
    seededAt: new Date().toISOString(),
  }
  fs.writeFileSync(CATALOG_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  mirrorToPublic()
  // eslint-disable-next-line no-console
  console.log(
    `[frontend-learning] 已从种子入库：${Object.keys(items).length} 条讲义，${imageCount} 张插图 → ${ROOT}`,
  )
}

let seeded = false

export function ensureFrontendLearningStore() {
  if (seeded && fs.existsSync(CATALOG_FILE)) return
  ensureDirs()
  // 只在本机目录还不存在时灌种子；绝不要用 public/fl-data 覆盖 server/data
  if (!fs.existsSync(CATALOG_FILE)) seedFromFrontendJson()
  seeded = true
}

export function readFrontendLearningCatalog() {
  ensureFrontendLearningStore()
  const raw = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))
  const tree = applyReadyFlags(Array.isArray(raw.tree) ? raw.tree : [])
  return { tree }
}

export function readFrontendLearningItem(id) {
  ensureFrontendLearningStore()
  const safeId = String(id || '')
  if (!/^[a-zA-Z0-9._-]+$/.test(safeId)) return null
  const file = itemFile(safeId)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function resolveFrontendLearningMedia(fileName) {
  ensureFrontendLearningStore()
  const name = String(fileName || '')
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null
  const root = path.resolve(MEDIA_DIR)
  const full = path.resolve(MEDIA_DIR, name)
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`
  if (!full.startsWith(prefix) || !fs.existsSync(full) || !fs.statSync(full).isFile()) return null
  const ext = path.extname(name).slice(1).toLowerCase()
  return { full, mime: EXT_TO_MIME[ext] || 'application/octet-stream' }
}

function readRawCatalog() {
  ensureFrontendLearningStore()
  const raw = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))
  if (!Array.isArray(raw.tree)) raw.tree = []
  return raw
}

function atomicWriteFile(file, text) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, text, 'utf8')
  try {
    fs.renameSync(tmp, file)
  } catch {
    fs.copyFileSync(tmp, file)
    fs.unlinkSync(tmp)
  }
}

function writeCatalog(tree) {
  const prev = fs.existsSync(CATALOG_FILE) ? JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) : {}
  const nextTree = applyReadyFlags(Array.isArray(tree) ? tree : [])
  atomicWriteFile(
    CATALOG_FILE,
    `${JSON.stringify(
      { ...prev, tree: nextTree, updatedAt: new Date().toISOString(), userOwned: true },
      null,
      2,
    )}\n`,
  )
  mirrorPublicFile(CATALOG_FILE, 'catalog.json')
}

function mirrorPublicFile(absSrc, rel) {
  try {
    if (!fs.existsSync(absSrc)) return
    const dest = path.join(PUBLIC_MIRROR, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(absSrc, dest)
  } catch (e) {
    console.warn('[frontend-learning] 同步 public/fl-data 失败：', e instanceof Error ? e.message : e)
  }
}

/** 构建/pages.dev 只读这份快照；不要反过来覆盖 Node 目录。 */
function mirrorToPublic() {
  try {
    if (!fs.existsSync(CATALOG_FILE)) return
    fs.mkdirSync(PUBLIC_MIRROR, { recursive: true })
    fs.cpSync(ROOT, PUBLIC_MIRROR, { recursive: true })
  } catch (e) {
    console.warn('[frontend-learning] 同步 public/fl-data 失败：', e instanceof Error ? e.message : e)
  }
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function sanitizeName(raw) {
  const name = String(raw ?? '').trim()
  if (!name || name.length > 80) return null
  return name
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

function rewriteLearningPath(tree, itemId) {
  const rec = readFrontendLearningItem(itemId)
  if (!rec) return
  const hit = findEntry(tree, itemId)
  rec.learningPath = hit ? pathNamesTo(tree, hit.node.id) ?? [hit.node.name] : rec.learningPath
  writeItemRecord(itemId, rec)
}

function deletePublicFile(rel) {
  try {
    const dest = path.join(PUBLIC_MIRROR, rel)
    if (fs.existsSync(dest)) fs.unlinkSync(dest)
  } catch {
    /* ignore */
  }
}

function deleteItemFiles(id) {
  const file = itemFile(id)
  if (fs.existsSync(file)) fs.unlinkSync(file)
  deletePublicFile(`items/${id}.json`)
  if (!fs.existsSync(MEDIA_DIR)) return
  for (const name of fs.readdirSync(MEDIA_DIR)) {
    if (name.startsWith(`${id}-`)) {
      fs.unlinkSync(path.join(MEDIA_DIR, name))
      deletePublicFile(`media/${name}`)
    }
  }
}

function sendStoreError(res, e, fallback) {
  res.status(500).json({
    ok: false,
    message: e instanceof Error ? e.message : fallback,
  })
}

const BANK_TYPE_NODE_IDS = {
  12: 'part-1',
  13: 'app-basics',
  14: 'security',
  15: 'part-2',
  16: 'win10',
  17: 'excel',
  18: 'word',
  19: 'ppt',
}

const BANK_ITEM_IDS = {
  20: 'overview',
}

function bankNodeId(typeId) {
  return BANK_TYPE_NODE_IDS[typeId] || `t-${typeId}`
}

function bankItemId(questionId) {
  return BANK_ITEM_IDS[questionId] || `q-${questionId}`
}

function collectTreeIds(nodes, out = new Set()) {
  for (const n of nodes || []) {
    if (n?.id) out.add(n.id)
    for (const e of n.entries || []) {
      if (e?.id) out.add(e.id)
    }
    collectTreeIds(n.children, out)
  }
  return out
}

/** 题库包整树导入时，保留用户后来加的分类/讲义，避免又被种子目录盖掉。 */
function graftUserCatalog(packTree, prevTree) {
  if (!Array.isArray(prevTree) || !prevTree.length) return packTree
  const packIds = collectTreeIds(packTree)
  const walk = (nodes, parentId) => {
    for (const n of nodes || []) {
      if (!packIds.has(n.id)) {
        if (!parentId) packTree.push(n)
        else {
          const p = findNode(packTree, parentId)
          if (p) p.node.children.push(n)
          else packTree.push(n)
        }
        continue
      }
      const extraEntries = (n.entries || []).filter((e) => e?.id && !packIds.has(e.id))
      if (extraEntries.length) {
        const p = findNode(packTree, n.id)
        if (p) p.node.entries.push(...extraEntries)
      }
      walk(n.children, n.id)
    }
  }
  walk(prevTree, null)
  return packTree
}

/**
 * 从题库包导入「前端学习内容」整棵树（第一部分 + 第二部分 WIN10/Excel）。
 * 已存在的讲义默认跳过，避免重复拆图。
 */
export function importFrontendLearningFromBankPack(packPath, { skipExisting = true } = {}) {
  if (!fs.existsSync(packPath)) {
    throw new Error(`找不到题库包：${packPath}`)
  }
  const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'))
  const types = Array.isArray(pack?.data?.learningTypes) ? pack.data.learningTypes : []
  const banks = Array.isArray(pack?.data?.questionBanks) ? pack.data.questionBanks : []
  const rootTypeId = 10
  const childTypes = types
    .filter((t) => t.parentId === rootTypeId)
    .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))

  const buildNode = (type) => {
    const kids = types
      .filter((t) => t.parentId === type.id)
      .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
    const qs = banks
      .filter((q) => q.learningTypeId === type.id)
      .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
    return {
      id: bankNodeId(type.id),
      name: String(type.name),
      children: kids.map(buildNode),
      entries: qs.map((q) => ({
        id: bankItemId(q.id),
        title: String(q.title || q.id),
        ready: true,
        type: String(q.type || 'handout'),
      })),
    }
  }

  let prevTree = []
  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))
      if (Array.isArray(prev.tree)) prevTree = prev.tree
    } catch {
      /* 旧目录读失败时仍导入题库包，不要整库停掉 */
    }
  }
  const tree = graftUserCatalog(childTypes.map(buildNode), prevTree)
  ensureDirs()

  const byId = new Map(types.map((t) => [t.id, t]))
  const pathOf = (typeId) => {
    const names = []
    let cur = byId.get(typeId)
    while (cur && cur.id !== rootTypeId) {
      names.unshift(String(cur.name))
      cur = cur.parentId != null ? byId.get(cur.parentId) : null
    }
    return names
  }

  let wrote = 0
  let skipped = 0
  let imageCount = 0
  const computerQs = banks.filter((q) => {
    let cur = byId.get(q.learningTypeId)
    while (cur) {
      if (cur.id === rootTypeId || cur.parentId === rootTypeId) return true
      cur = cur.parentId != null ? byId.get(cur.parentId) : null
    }
    return false
  })

  for (const q of computerQs) {
    const id = bankItemId(q.id)
    const file = itemFile(id)
    if (skipExisting && fs.existsSync(file)) {
      skipped += 1
      continue
    }
    const before = String(q.content ?? '')
    const content = extractDataImages(before, id)
    imageCount += (before.match(/!\[[^\]]*]\(data:image\//g) || []).length
    imageCount += (before.match(/<img\b[^>]*src=["']data:image\//gi) || []).length
    const item = {
      id,
      title: String(q.title || id),
      type: String(q.type || 'handout'),
      learningPath: pathOf(q.learningTypeId),
      tags: ['讲义', String(byId.get(q.learningTypeId)?.name || '')].filter(Boolean),
      content,
    }
    writeItemRecord(id, item)
    wrote += 1
  }

  writeCatalog(tree)
  mirrorToPublic()
  seeded = true
  // eslint-disable-next-line no-console
  console.log(
    `[frontend-learning] 已导入前端学习内容：新增 ${wrote} 条，跳过 ${skipped} 条，拆出约 ${imageCount} 张插图`,
  )
  return { wrote, skipped, imageCount, tree }
}

export function attachFrontendLearningRoutes(app) {
  app.get('/api/frontend-learning/tree', (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.json({ ok: true, ...readFrontendLearningCatalog() })
    } catch (e) {
      res.status(500).json({
        ok: false,
        message: e instanceof Error ? e.message : '读取前端学习目录失败',
      })
    }
  })

  app.get('/api/frontend-learning/items/:id', (req, res) => {
    try {
      const item = readFrontendLearningItem(req.params.id)
      if (!item) {
        res.status(404).json({ ok: false, message: '未找到该讲义' })
        return
      }
      res.json({ ok: true, item })
    } catch (e) {
      res.status(500).json({
        ok: false,
        message: e instanceof Error ? e.message : '读取讲义失败',
      })
    }
  })

  app.get('/api/media/frontend-learning/:file', (req, res) => {
    try {
      const media = resolveFrontendLearningMedia(req.params.file)
      if (!media) {
        res.status(404).type('text/plain').send('not found')
        return
      }
      res.setHeader('Cache-Control', 'public, max-age=86400')
      res.type(media.mime).sendFile(media.full)
    } catch (e) {
      sendStoreError(res, e, '读取插图失败')
    }
  })

  app.post('/api/frontend-learning/nodes', requireAdmin, (req, res) => {
    try {
      const name = sanitizeName(req.body?.name)
      if (!name) {
        res.status(400).json({ ok: false, message: '名称不能为空（最多 80 字）' })
        return
      }
      const catalog = readRawCatalog()
      const parentId = req.body?.parentId == null || req.body?.parentId === '' ? null : String(req.body.parentId)
      const node = { id: newId('n'), name, children: [], entries: [] }
      if (!parentId) {
        catalog.tree.push(node)
      } else {
        const hit = findNode(catalog.tree, parentId)
        if (!hit) {
          res.status(404).json({ ok: false, message: '未找到父分类' })
          return
        }
        hit.node.children.push(node)
      }
      writeCatalog(catalog.tree)
      res.json({ ok: true, node })
    } catch (e) {
      sendStoreError(res, e, '新增分类失败')
    }
  })

  app.patch('/api/frontend-learning/nodes/:id', requireAdmin, (req, res) => {
    try {
      const catalog = readRawCatalog()
      const body = req.body || {}
      const moving = Object.prototype.hasOwnProperty.call(body, 'parentId') || body.index != null
      if (moving) {
        const parentId = body.parentId == null || body.parentId === '' ? null : String(body.parentId)
        const moved = moveNodeInTree(catalog.tree, String(req.params.id), parentId, body.index)
        if (moved.error) {
          res.status(moved.status || 400).json({ ok: false, message: moved.error })
          return
        }
        if (body.name != null) {
          const name = sanitizeName(body.name)
          if (!name) {
            res.status(400).json({ ok: false, message: '名称不能为空（最多 80 字）' })
            return
          }
          moved.node.name = name
        }
        writeCatalog(catalog.tree)
        for (const entryId of collectEntryIds(moved.node)) rewriteLearningPath(catalog.tree, entryId)
        res.json({ ok: true, node: moved.node })
        return
      }
      const name = sanitizeName(body.name)
      if (!name) {
        res.status(400).json({ ok: false, message: '名称不能为空（最多 80 字）' })
        return
      }
      const hit = findNode(catalog.tree, String(req.params.id))
      if (!hit) {
        res.status(404).json({ ok: false, message: '未找到该分类' })
        return
      }
      hit.node.name = name
      writeCatalog(catalog.tree)
      res.json({ ok: true, node: hit.node })
    } catch (e) {
      sendStoreError(res, e, '重命名失败')
    }
  })

  app.delete('/api/frontend-learning/nodes/:id', requireAdmin, (req, res) => {
    try {
      const catalog = readRawCatalog()
      const hit = findNode(catalog.tree, String(req.params.id))
      if (!hit) {
        res.status(404).json({ ok: false, message: '未找到该分类' })
        return
      }
      for (const entryId of collectEntryIds(hit.node)) deleteItemFiles(entryId)
      const idx = hit.siblings.findIndex((n) => n.id === hit.node.id)
      if (idx >= 0) hit.siblings.splice(idx, 1)
      writeCatalog(catalog.tree)
      res.json({ ok: true })
    } catch (e) {
      sendStoreError(res, e, '删除分类失败')
    }
  })

  app.post('/api/frontend-learning/items', requireAdmin, (req, res) => {
    try {
      const title = sanitizeName(req.body?.title)
      const parentId = String(req.body?.parentId ?? '')
      if (!title) {
        res.status(400).json({ ok: false, message: '标题不能为空（最多 80 字）' })
        return
      }
      if (!parentId) {
        res.status(400).json({ ok: false, message: '请选择所属分类' })
        return
      }
      const catalog = readRawCatalog()
      const hit = findNode(catalog.tree, parentId)
      if (!hit) {
        res.status(404).json({ ok: false, message: '未找到所属分类' })
        return
      }
      const id = newId('q')
      const learningPath = pathNamesTo(catalog.tree, parentId) ?? [hit.node.name]
      const type = String(req.body?.type || 'handout')
      const content = extractDataImages(String(req.body?.content ?? ''), id)
      const item = {
        id,
        title,
        type,
        learningPath,
        tags: Array.isArray(req.body?.tags) ? req.body.tags.map(String) : ['讲义', hit.node.name],
        content,
      }
      writeItemRecord(id, item)
      hit.node.entries.push({ id, title, ready: true, type })
      writeCatalog(catalog.tree)
      res.json({ ok: true, item })
    } catch (e) {
      sendStoreError(res, e, '新增讲义失败')
    }
  })

  app.patch('/api/frontend-learning/items/:id', requireAdmin, (req, res) => {
    try {
      const id = String(req.params.id)
      const current = readFrontendLearningItem(id)
      if (!current) {
        res.status(404).json({ ok: false, message: '未找到该讲义' })
        return
      }
      const body = req.body || {}
      const moving = Object.prototype.hasOwnProperty.call(body, 'parentId') || body.index != null
      if (moving && body.parentId) {
        const catalog = readRawCatalog()
        const moved = moveEntryInTree(catalog.tree, id, String(body.parentId), body.index)
        if (moved.error) {
          res.status(moved.status || 400).json({ ok: false, message: moved.error })
          return
        }
        if (body.title != null) {
          const title = sanitizeName(body.title)
          if (!title) {
            res.status(400).json({ ok: false, message: '标题不能为空（最多 80 字）' })
            return
          }
          moved.entry.title = title
        }
        writeCatalog(catalog.tree)
        rewriteLearningPath(catalog.tree, id)
        const item = readFrontendLearningItem(id)
        res.json({ ok: true, item })
        return
      }
      const title = body.title == null ? current.title : sanitizeName(body.title)
      if (!title) {
        res.status(400).json({ ok: false, message: '标题不能为空（最多 80 字）' })
        return
      }
      const content =
        body.content == null ? current.content : extractDataImages(String(body.content), id)
      const item = {
        ...current,
        title,
        content,
        tags: Array.isArray(body.tags) ? body.tags.map(String) : current.tags,
      }
      writeItemRecord(id, item)
      const catalog = readRawCatalog()
      const hit = findEntry(catalog.tree, id)
      if (hit) {
        hit.entry.title = title
        hit.entry.ready = true
        writeCatalog(catalog.tree)
      }
      res.json({ ok: true, item })
    } catch (e) {
      sendStoreError(res, e, '保存讲义失败')
    }
  })

  app.delete('/api/frontend-learning/items/:id', requireAdmin, (req, res) => {
    try {
      const id = String(req.params.id)
      const catalog = readRawCatalog()
      const hit = findEntry(catalog.tree, id)
      if (!hit) {
        deleteItemFiles(id)
        res.status(404).json({ ok: false, message: '未找到该讲义' })
        return
      }
      hit.node.entries.splice(hit.idx, 1)
      deleteItemFiles(id)
      writeCatalog(catalog.tree)
      res.json({ ok: true })
    } catch (e) {
      sendStoreError(res, e, '删除讲义失败')
    }
  })
}
