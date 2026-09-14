/**
 * 计算机单词和语法题库：本机 Node 提供给 App 拉取。
 * 源文件 git 忽略；优先 server/data/cs-vocab/bank.json，其次 src 下生成稿。
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAdmin } from './auth-core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(__dirname, 'data', 'cs-vocab', 'bank.json')
const SRC_FILE = path.join(ROOT, 'src', 'utils', 'cs-vocab', 'bank.generated.json')

function isItem(row) {
  return Boolean(
    row &&
      typeof row === 'object' &&
      typeof row.stem === 'string' &&
      typeof row.correct === 'string' &&
      Array.isArray(row.distractors) &&
      typeof row.key === 'string' &&
      typeof row.topic === 'string',
  )
}

function normalizeItems(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : []
  return list.filter(isItem).map((row) => ({
    difficulty: row.difficulty === 'easy' || row.difficulty === 'hard' ? row.difficulty : 'normal',
    topic: String(row.topic),
    stem: String(row.stem),
    correct: String(row.correct),
    distractors: row.distractors.map((d) => String(d)),
    explanation: String(row.explanation ?? ''),
    key: String(row.key),
  }))
}

function revisionOf(items) {
  const keys = items.map((it) => it.key).join('\n')
  return crypto.createHash('sha1').update(`${items.length}\n${keys}`).digest('hex').slice(0, 16)
}

function readJsonFile(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function writeDataFile(items) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, `${JSON.stringify({ items }, null, 2)}\n`, 'utf8')
}

function loadBank() {
  const data = normalizeItems(readJsonFile(DATA_FILE) || [])
  if (data.length) return data
  const src = normalizeItems(readJsonFile(SRC_FILE) || [])
  if (src.length) {
    try {
      writeDataFile(src)
    } catch {
      /* 只读环境忽略 */
    }
    return src
  }
  return []
}

export function attachCsVocabRoutes(app) {
  app.get('/api/cs-vocab/bank', (_req, res) => {
    const items = loadBank()
    res.json({ ok: true, items, revision: revisionOf(items), count: items.length })
  })

  app.get('/api/cs-vocab/revision', (_req, res) => {
    const items = loadBank()
    res.json({ ok: true, revision: revisionOf(items), count: items.length })
  })

  app.put('/api/cs-vocab/bank', requireAdmin, (req, res) => {
    const items = normalizeItems(req.body)
    if (!items.length) {
      res.status(400).json({ ok: false, message: '题库为空' })
      return
    }
    writeDataFile(items)
    res.json({ ok: true, count: items.length, revision: revisionOf(items) })
  })
}
