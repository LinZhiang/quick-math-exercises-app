import { json, requireAuth } from './wenguCloudAuth.js'
import { getWenguKv } from './kvBinding.js'

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

function kvKey(username, key) {
  return `ukv:${String(username || '').trim()}:${key}`
}

export async function handleUserKv(env, request, path) {
  const auth = await requireAuth(env, request)
  if (auth.error) return auth.error
  const username = auth.user?.username
  const kv = getWenguKv(env)
  if (!kv) return json({ ok: false, message: '未配置存储' }, 503)

  const segs = String(path || '')
    .split('/')
    .filter(Boolean)
  const method = request.method.toUpperCase()

  if (method === 'GET' && segs.length === 0) {
    const entries = {}
    for (const key of ALLOWED) {
      const raw = await kv.get(kvKey(username, key))
      if (raw) {
        try {
          entries[key] = JSON.parse(raw)
        } catch {
          /* skip */
        }
      }
    }
    return json({ ok: true, entries })
  }

  if (method === 'PUT' && segs.length === 0) {
    const body = await request.json().catch(() => null)
    const pack = body?.entries
    if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
      return json({ ok: false, message: 'entries 必须是对象' }, 400)
    }
    let wrote = 0
    for (const [key, value] of Object.entries(pack)) {
      if (!ALLOWED.has(key)) continue
      await kv.put(kvKey(username, key), JSON.stringify(value))
      wrote += 1
    }
    return json({ ok: true, wrote })
  }

  const key = segs[0]
  if (!ALLOWED.has(key)) return json({ ok: false, message: '不支持的键' }, 400)

  if (method === 'GET') {
    const raw = await kv.get(kvKey(username, key))
    return json({ ok: true, key, value: raw ? JSON.parse(raw) : null })
  }

  if (method === 'PUT') {
    const body = await request.json().catch(() => null)
    if (!body || !Object.prototype.hasOwnProperty.call(body, 'value')) {
      return json({ ok: false, message: '缺少 value' }, 400)
    }
    await kv.put(kvKey(username, key), JSON.stringify(body.value))
    return json({ ok: true })
  }

  return json({ ok: false, message: '方法不允许' }, 405)
}
