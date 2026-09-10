/**
 * 登录用户的错题集等 JSON：按账号落盘，供本机 Node 与云端 KV 对齐。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth } from './auth-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, 'data', 'user-kv')

const ALLOWED = new Set([
  'mental-math-wrong-book-v1',
  'mental-math-favorite-book-v1',
  'mental-math-wrong-notes-v1',
  'wrong-book-review-stats-v1',
  'chinese-key-question-notes-v1',
  'chinese-practice-wrong-v1',
  'chinese-practice-favorite-v1',
  'chinese-word-memorization-wrong-v1',
  'chinese-word-memorization-favorite-v1',
  'chinese-char-literacy-wrong-v1',
  'chinese-char-literacy-favorite-v1',
  'chinese-poetry-wrong-v1',
  'chinese-poetry-favorite-v1',
  'chinese-classical-chinese-wrong-v1',
  'chinese-classical-chinese-favorite-v1',
  'chinese-rhetoric-usage-wrong-v1',
  'chinese-rhetoric-usage-favorite-v1',
  'chinese-reading-comprehension-wrong-v1',
  'chinese-reading-comprehension-favorite-v1',
  'chinese-history-common-sense-wrong-v1',
  'chinese-history-common-sense-favorite-v1',
  'chinese-party-history-wrong-v1',
  'chinese-party-history-favorite-v1',
  'chinese-theory-policy-wrong-v1',
  'chinese-theory-policy-favorite-v1',
  'chinese-legal-common-sense-wrong-v1',
  'chinese-legal-common-sense-favorite-v1',
  'chinese-economy-common-sense-wrong-v1',
  'chinese-economy-common-sense-favorite-v1',
  'chinese-life-common-sense-wrong-v1',
  'chinese-life-common-sense-favorite-v1',
  'chinese-geography-common-sense-wrong-v1',
  'chinese-geography-common-sense-favorite-v1',
  'chinese-memorization-wrong-v1',
  'computer-handout-quiz-wrong-v1',
  'computer-handout-quiz-favorite-v1',
  'computer-handout-quiz-notes-v1',
  'frontend-handout-quiz-wrong-v1',
  'frontend-handout-quiz-favorite-v1',
  'frontend-handout-quiz-notes-v1',
])

const MAX_JSON_BYTES = 1_500_000

function safeSegment(raw, fallback = '') {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return s || fallback
}

function userDir(username) {
  const name = safeSegment(username, 'user')
  return path.join(ROOT, name)
}

function keyFile(username, key) {
  return path.join(userDir(username), `${safeSegment(key)}.json`)
}

function atomicWrite(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, text, 'utf8')
  try {
    fs.renameSync(tmp, file)
  } catch {
    fs.copyFileSync(tmp, file)
    fs.unlinkSync(tmp)
  }
}

function readKey(username, key) {
  const file = keyFile(username, key)
  if (!fs.existsSync(file)) return undefined
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return undefined
  }
}

function writeKey(username, key, value) {
  const text = `${JSON.stringify(value)}\n`
  if (Buffer.byteLength(text, 'utf8') > MAX_JSON_BYTES) {
    const err = new Error('单份错题数据过大')
    err.status = 413
    throw err
  }
  atomicWrite(keyFile(username, key), text)
}

export function attachUserKvRoutes(app) {
  app.get('/api/user-kv', requireAuth, (req, res) => {
    try {
      const username = req.wenguUser?.username
      const entries = {}
      for (const key of ALLOWED) {
        const value = readKey(username, key)
        if (value !== undefined) entries[key] = value
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.json({ ok: true, entries })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : '读取失败' })
    }
  })

  app.get('/api/user-kv/:key', requireAuth, (req, res) => {
    try {
      const key = String(req.params.key || '')
      if (!ALLOWED.has(key)) {
        res.status(400).json({ ok: false, message: '不支持的键' })
        return
      }
      const value = readKey(req.wenguUser?.username, key)
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.json({ ok: true, key, value: value === undefined ? null : value })
    } catch (e) {
      res.status(500).json({ ok: false, message: e instanceof Error ? e.message : '读取失败' })
    }
  })

  app.put('/api/user-kv', requireAuth, (req, res) => {
    try {
      const entries = req.body?.entries
      if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
        res.status(400).json({ ok: false, message: 'entries 必须是对象' })
        return
      }
      const username = req.wenguUser?.username
      let wrote = 0
      for (const [key, value] of Object.entries(entries)) {
        if (!ALLOWED.has(key)) continue
        writeKey(username, key, value)
        wrote += 1
      }
      res.json({ ok: true, wrote })
    } catch (e) {
      const status = Number(e?.status) || 500
      res.status(status).json({ ok: false, message: e instanceof Error ? e.message : '保存失败' })
    }
  })

  app.put('/api/user-kv/:key', requireAuth, (req, res) => {
    try {
      const key = String(req.params.key || '')
      if (!ALLOWED.has(key)) {
        res.status(400).json({ ok: false, message: '不支持的键' })
        return
      }
      if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'value')) {
        res.status(400).json({ ok: false, message: '缺少 value' })
        return
      }
      writeKey(req.wenguUser?.username, key, req.body.value)
      res.json({ ok: true })
    } catch (e) {
      const status = Number(e?.status) || 500
      res.status(status).json({ ok: false, message: e instanceof Error ? e.message : '保存失败' })
    }
  })
}
