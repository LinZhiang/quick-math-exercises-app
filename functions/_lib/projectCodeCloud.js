/**
 * 项目管理源码：只给管理员。正文在 WENGU_KV，不进 Git、不进静态资源。
 */
import { json, requireAdmin } from './wenguCloudAuth.js'
import { getWenguKv } from './kvBinding.js'

const TREE_KEY = 'pc:tree'
const INDEX_KEY = 'pc:index'
const META_KEY = 'pc:meta'
const CHUNK_PREFIX = 'pc:chunk:'
const FILES_BATCH_LIMIT = 80
const IMPORT_FILES_LIMIT = 80

function missingKv() {
  return json(
    {
      ok: false,
      message: '云端源码库还没接上（WENGU_KV）。本机执行 npm run setup:cf-storage，部署后再 npm run sync:cf-project-code。',
    },
    503,
  )
}

function pathSegs(pathParam) {
  if (pathParam == null) return []
  if (Array.isArray(pathParam)) return pathParam.map(String).filter(Boolean)
  return String(pathParam)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

function safePath(raw) {
  const rel = String(raw || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .trim()
  if (!rel || rel.includes('\0')) return ''
  const parts = rel.split('/')
  if (parts.some((p) => !p || p === '.' || p === '..')) return ''
  if (rel.length > 400) return ''
  return rel
}

function langOf(filePath) {
  const ext = String(filePath || '').split('.').pop()?.toLowerCase() || ''
  if (ext === 'mjs' || ext === 'cjs') return 'js'
  return ext || 'txt'
}

function filePayload(rel, rec) {
  const name = rec?.name || rel.split('/').pop() || rel
  return {
    path: rel,
    name,
    lang: rec?.lang || langOf(name),
    content: String(rec?.content ?? ''),
  }
}

async function listKeys(kv, prefix) {
  const names = []
  let cursor
  for (let i = 0; i < 20; i += 1) {
    const page = await kv.list({ prefix, cursor })
    for (const row of page.keys || []) names.push(row.name)
    if (page.list_complete || !page.cursor) break
    cursor = page.cursor
  }
  return names
}

async function clearPack(kv) {
  const keys = [
    TREE_KEY,
    INDEX_KEY,
    META_KEY,
    ...(await listKeys(kv, CHUNK_PREFIX)),
    ...(await listKeys(kv, 'pc:file:')),
  ]
  for (const key of [...new Set(keys)]) {
    await kv.delete(key)
  }
}

async function readJson(kv, key) {
  try {
    const value = await kv.get(key, { type: 'json' })
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

async function readTree(kv) {
  const rec = await readJson(kv, TREE_KEY)
  if (Array.isArray(rec)) return rec
  if (Array.isArray(rec?.tree)) return rec.tree
  return []
}

async function handleTree(kv) {
  const tree = await readTree(kv)
  const meta = await readJson(kv, META_KEY)
  const count = Number(meta?.count) || 0
  if (!tree.length) {
    return json({
      ok: true,
      tree: [],
      count: 0,
      message: '云端还没有源码。在已同步过 0521 的电脑上执行 npm run sync:cf-project-code，手机刷新即可查阅。',
    })
  }
  return json({ ok: true, tree, count })
}

async function loadIndex(kv) {
  const index = await readJson(kv, INDEX_KEY)
  return index && typeof index === 'object' ? index : {}
}

async function readFileRec(kv, rel, cache) {
  const index = cache.index || (cache.index = await loadIndex(kv))
  const chunkId = index[rel]
  if (chunkId == null) return null
  const key = `${CHUNK_PREFIX}${chunkId}`
  const chunk = cache.chunks.get(key) || (await readJson(kv, key))
  if (chunk && typeof chunk === 'object') cache.chunks.set(key, chunk)
  const rec = chunk?.[rel]
  return rec && typeof rec === 'object' ? rec : null
}

async function handleFile(kv, request) {
  const rel = safePath(new URL(request.url).searchParams.get('path'))
  if (!rel) return json({ ok: false, message: '未找到该文件' }, 404)
  const rec = await readFileRec(kv, rel, { chunks: new Map() })
  if (!rec) return json({ ok: false, message: '未找到该文件' }, 404)
  return json({ ok: true, ...filePayload(rel, rec) })
}

async function handleFiles(kv, request) {
  const body = await request.json().catch(() => null)
  const raw = Array.isArray(body?.paths) ? body.paths : []
  const cache = { chunks: new Map() }
  const files = []
  const seen = new Set()
  for (const item of raw.slice(0, FILES_BATCH_LIMIT)) {
    const rel = safePath(item)
    if (!rel || seen.has(rel)) continue
    seen.add(rel)
    const rec = await readFileRec(kv, rel, cache)
    if (!rec) continue
    files.push(filePayload(rel, rec))
  }
  return json({ ok: true, files })
}

async function handleImport(kv, request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return json({ ok: false, message: '请使用 JSON 提交' }, 400)
  }
  if (body.reset) {
    await clearPack(kv)
    const tree = Array.isArray(body.tree) ? body.tree : []
    await kv.put(TREE_KEY, JSON.stringify(tree))
    await kv.put(INDEX_KEY, JSON.stringify({}))
    await kv.put(META_KEY, JSON.stringify({ count: 0, chunks: 0 }))
  }

  const incoming = body.files && typeof body.files === 'object' ? body.files : null
  let wrote = 0
  if (incoming) {
    const meta = (await readJson(kv, META_KEY)) || { count: 0, chunks: 0 }
    const index = (await loadIndex(kv)) || {}
    const chunk = {}
    const chunkId = Number(meta.chunks) || 0
    for (const [rawPath, rec] of Object.entries(incoming)) {
      if (wrote >= IMPORT_FILES_LIMIT) break
      const rel = safePath(rawPath)
      if (!rel || !rec || typeof rec !== 'object') continue
      chunk[rel] = {
        name: String(rec.name || rel.split('/').pop() || rel).slice(0, 180),
        lang: String(rec.lang || langOf(rel)).slice(0, 16),
        content: String(rec.content ?? ''),
      }
      index[rel] = chunkId
      wrote += 1
    }
    if (wrote) {
      await kv.put(`${CHUNK_PREFIX}${chunkId}`, JSON.stringify(chunk))
      await kv.put(INDEX_KEY, JSON.stringify(index))
      await kv.put(
        META_KEY,
        JSON.stringify({
          count: Object.keys(index).length,
          chunks: chunkId + 1,
        }),
      )
    }
  }

  if (Array.isArray(body.tree) && !body.reset) {
    await kv.put(TREE_KEY, JSON.stringify(body.tree))
  }

  const meta = (await readJson(kv, META_KEY)) || { count: 0, chunks: 0 }
  return json({
    ok: true,
    wrote,
    count: Number(meta.count) || 0,
    chunks: Number(meta.chunks) || 0,
    done: Boolean(body.done),
  })
}

export async function handleProjectCode(env, request, pathParam) {
  const gate = await requireAdmin(env, request)
  if (gate.error) return gate.error
  const kv = getWenguKv(env)
  if (!kv) return missingKv()
  const segs = pathSegs(pathParam)
  const method = request.method.toUpperCase()
  const action = segs[0] || ''

  if (method === 'GET' && action === 'tree' && segs.length === 1) return handleTree(kv)
  if (method === 'GET' && action === 'file' && segs.length === 1) return handleFile(kv, request)
  if (method === 'POST' && action === 'files' && segs.length === 1) return handleFiles(kv, request)
  if (method === 'POST' && action === 'import' && segs.length === 1) return handleImport(kv, request)

  return json({ ok: false, message: '未找到该接口' }, 404)
}
