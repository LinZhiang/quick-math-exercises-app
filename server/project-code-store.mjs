/**
 * 项目管理源码查阅（仅管理员）。正文在 server/data/project-code，不进 Git。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAdmin } from './auth-core.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'project-code', '0521')
const FILES_BATCH_LIMIT = 80

function safeResolve(rel) {
  const raw = String(rel || '').replace(/\\/g, '/').replace(/^\/+/, '')
  if (!raw || raw.includes('\0') || raw.split('/').some((p) => p === '..')) return null
  const abs = path.resolve(ROOT, raw)
  const base = path.resolve(ROOT)
  if (abs !== base && !abs.startsWith(base + path.sep)) return null
  return abs
}

function langOf(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase()
  if (ext === 'mjs' || ext === 'cjs') return 'js'
  return ext || 'txt'
}

function readFilePayload(abs) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/')
  return {
    path: rel,
    name: path.basename(abs),
    lang: langOf(abs),
    content: fs.readFileSync(abs, 'utf8'),
  }
}

function listDir(absDir, relDir) {
  const children = []
  if (!fs.existsSync(absDir)) return children
  const ents = fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return a.name.localeCompare(b.name, 'zh')
  })
  for (const ent of ents) {
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      const kids = listDir(path.join(absDir, ent.name), rel)
      if (!kids.length) continue
      children.push({ id: rel, name: ent.name, kind: 'dir', path: rel, children: kids })
    } else if (ent.isFile()) {
      children.push({ id: rel, name: ent.name, kind: 'file', path: rel })
    }
  }
  return children
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
}

export function attachProjectCodeRoutes(app) {
  app.get('/api/project-code/tree', requireAdmin, (_req, res) => {
    try {
      noStore(res)
      if (!fs.existsSync(ROOT)) {
        res.json({
          ok: true,
          tree: [],
          count: 0,
          message: '还没有源码。本机先 npm run sync:project-code；要在网页上查看再 npm run sync:cf-project-code。',
        })
        return
      }
      const tree = listDir(ROOT, '')
      let count = 0
      const walk = (nodes) => {
        for (const n of nodes) {
          if (n.kind === 'file') count += 1
          else if (n.children) walk(n.children)
        }
      }
      walk(tree)
      res.json({ ok: true, tree, count })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : '读取目录失败' })
    }
  })

  app.get('/api/project-code/file', requireAdmin, (req, res) => {
    try {
      noStore(res)
      const abs = safeResolve(req.query.path)
      if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
        res.status(404).json({ ok: false, message: '未找到该文件' })
        return
      }
      res.json({ ok: true, ...readFilePayload(abs) })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : '读取文件失败' })
    }
  })

  app.post('/api/project-code/files', requireAdmin, (req, res) => {
    try {
      noStore(res)
      const raw = Array.isArray(req.body?.paths) ? req.body.paths : []
      const files = []
      const seen = new Set()
      for (const item of raw.slice(0, FILES_BATCH_LIMIT)) {
        const key = String(item || '').replace(/\\/g, '/').trim()
        if (!key || seen.has(key)) continue
        seen.add(key)
        const abs = safeResolve(key)
        if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue
        files.push(readFilePayload(abs))
      }
      res.json({ ok: true, files })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : '读取文件失败' })
    }
  })
}
