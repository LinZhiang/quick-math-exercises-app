/**
 * 计算机单词和语法题库：Cloudflare KV，供手机 App 拉取。
 */
import { json, requireAdmin } from './wenguCloudAuth.js'
import { getWenguKv, kvMissingMessage } from './kvBinding.js'

const BANK_KEY = 'cs-vocab:bank'

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
  let h = 2166136261
  const s = `${items.length}\n${keys}`
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

async function readBankFromAssets(env, request) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function' || !request) return []
  try {
    const url = new URL('/cs-vocab/bank.json', request.url)
    const res = await env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }))
    if (!res.ok) return []
    return normalizeItems(await res.json())
  } catch {
    return []
  }
}

async function readBank(kv, env, request) {
  const fromKv = kv ? normalizeItems(await kv.get(BANK_KEY, { type: 'json' }).catch(() => null)) : []
  if (fromKv.length) return fromKv
  return readBankFromAssets(env, request)
}

export async function handleCsVocab(env, request, path) {
  const segs = String(path || '')
    .split('/')
    .filter(Boolean)
  const method = request.method.toUpperCase()
  const kv = getWenguKv(env)

  if (method === 'GET' && (segs.length === 0 || segs[0] === 'bank')) {
    const items = await readBank(kv, env, request)
    return json({ ok: true, items, revision: revisionOf(items), count: items.length })
  }

  if (method === 'GET' && segs[0] === 'revision') {
    const items = await readBank(kv, env, request)
    return json({ ok: true, revision: revisionOf(items), count: items.length })
  }

  if (method === 'PUT' && (segs.length === 0 || segs[0] === 'bank')) {
    const auth = await requireAdmin(env, request)
    if (auth.error) return auth.error
    if (!kv) return json({ ok: false, message: kvMissingMessage() }, 503)
    const body = await request.json().catch(() => null)
    const items = normalizeItems(body)
    if (!items.length) return json({ ok: false, message: '题库为空' }, 400)
    await kv.put(BANK_KEY, JSON.stringify({ items }))
    return json({ ok: true, count: items.length, revision: revisionOf(items) })
  }

  return json({ ok: false, message: '未知接口' }, 404)
}
