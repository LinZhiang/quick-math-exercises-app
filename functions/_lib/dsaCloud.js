/**
 * 编程题练习：题面进 WENGU_KV，不进 Git。GET 公开，PUT 仅管理员灌库。
 */
import { json, requireAdmin } from './wenguCloudAuth.js'
import { getWenguKv, kvMissingMessage } from './kvBinding.js'

const BANK_KEY = 'dsa:bank'

function isTest(row) {
  return Boolean(row && typeof row === 'object' && Array.isArray(row.args) && typeof row.label === 'string' && 'expect' in row)
}

function isComplexity(row) {
  return Boolean(
    row &&
      typeof row === 'object' &&
      Array.isArray(row.steps) &&
      typeof row.total === 'string' &&
      typeof row.time === 'string' &&
      Array.isArray(row.spaceSteps) &&
      typeof row.spaceTotal === 'string' &&
      typeof row.space === 'string',
  )
}

function normalizeProblems(raw) {
  const list = Array.isArray(raw) ? raw : []
  return list.filter(
    (row) =>
      row &&
      typeof row === 'object' &&
      typeof row.id === 'string' &&
      typeof row.title === 'string' &&
      Array.isArray(row.intro) &&
      typeof row.fileName === 'string' &&
      typeof row.functionName === 'string' &&
      typeof row.starter === 'string' &&
      typeof row.solution === 'string' &&
      Array.isArray(row.tests) &&
      row.tests.every(isTest) &&
      isComplexity(row.complexity),
  )
}

function emptyMessage() {
  return '云端还没有编程题。在已保存题目的电脑上执行 npm run sync:cf-dsa，刷新即可练习。'
}

async function readBank(kv) {
  if (!kv) return { iteration: [], recursion: [] }
  const raw = await kv.get(BANK_KEY, { type: 'json' }).catch(() => null)
  return {
    iteration: normalizeProblems(raw?.iteration),
    recursion: normalizeProblems(raw?.recursion),
  }
}

export async function handleDsa(env, request, path) {
  const segs = String(path || '')
    .split('/')
    .filter(Boolean)
  const method = request.method.toUpperCase()
  const kv = getWenguKv(env)

  if (method === 'GET' && (segs.length === 0 || segs[0] === 'bank')) {
    if (!kv) return json({ ok: true, iteration: [], recursion: [], count: 0, message: kvMissingMessage() })
    const pack = await readBank(kv)
    const count = pack.iteration.length + pack.recursion.length
    return json({
      ok: true,
      ...pack,
      count,
      message: count ? '' : emptyMessage(),
    })
  }

  if (method === 'PUT' && (segs.length === 0 || segs[0] === 'bank')) {
    const auth = await requireAdmin(env, request)
    if (auth.error) return auth.error
    if (!kv) return json({ ok: false, message: kvMissingMessage() }, 503)
    const body = await request.json().catch(() => null)
    const iteration = normalizeProblems(body?.iteration)
    const recursion = normalizeProblems(body?.recursion)
    const count = iteration.length + recursion.length
    if (!count) return json({ ok: false, message: '题库为空' }, 400)
    await kv.put(BANK_KEY, JSON.stringify({ iteration, recursion }))
    return json({ ok: true, count, iteration: iteration.length, recursion: recursion.length })
  }

  return json({ ok: false, message: '未知接口' }, 404)
}
