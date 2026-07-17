/** 口算·语法判断：按句序出题，考察成分随机（找成分 / 判成分） */

import {
  ALL_GRAMMAR_ROLES,
  GRAMMAR_JUDGMENT_BANK,
  GRAMMAR_ROLE_LABELS,
  type GrammarPart,
  type GrammarRole,
  type GrammarSentence,
} from '@/utils/grammarJudgmentBank'

export type GrammarJudgmentMode =
  | 'grammar-judgment-easy'
  | 'grammar-judgment-normal'
  | 'grammar-judgment-hard'

export type GrammarJudgmentModeConfig = {
  id: GrammarJudgmentMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const GRAMMAR_JUDGMENT_MODES: GrammarJudgmentModeConfig[] = [
  {
    id: 'grammar-judgment-easy',
    label: '简单题',
    durationSec: 30,
    optionCount: 3,
    correctDelta: 7,
    wrongDelta: -14,
    maxScore: 100,
    desc: '30 秒 · 短句成分 · 句序出题 · 考察对象随机 · 对 +7 / 错 -14',
  },
  {
    id: 'grammar-judgment-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '40 秒 · 主谓宾定状补齐全 · 句序出题 · 考察对象随机 · 对 +10 / 错 -20',
  },
  {
    id: 'grammar-judgment-hard',
    label: '复杂题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 15,
    wrongDelta: -30,
    maxScore: 100,
    desc: '50 秒 · 超长单句 · 多层定状补与把被兼语 · 句序出题 · 对 +15 / 错 -30',
  },
]

export type GrammarJudgmentQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

type QuestionKind = 'find' | 'name'

const CURSOR_KEY = 'mental-grammar-judgment-cursor-v1'
const RECENT_ROLES_KEY = 'mental-grammar-judgment-recent-roles-v1'
const RECENT_ROLES_LIMIT = 18

type CursorMap = Record<'easy' | 'normal' | 'hard', number>

/** 内存游标：保证同会话内句序前进；有 localStorage 时再持久化 */
let memoryCursors: CursorMap = { easy: 0, normal: 0, hard: 0 }
let memoryHydrated = false

function hydrateCursorsOnce() {
  if (memoryHydrated) return
  memoryHydrated = true
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(CURSOR_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<CursorMap>
    memoryCursors = {
      easy: typeof parsed.easy === 'number' ? parsed.easy : 0,
      normal: typeof parsed.normal === 'number' ? parsed.normal : 0,
      hard: typeof parsed.hard === 'number' ? parsed.hard : 0,
    }
  } catch {
    /* ignore */
  }
}

function readCursors(): CursorMap {
  hydrateCursorsOnce()
  return { ...memoryCursors }
}

function writeCursors(map: CursorMap) {
  memoryCursors = { ...map }
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CURSOR_KEY, JSON.stringify(memoryCursors))
  } catch {
    /* ignore */
  }
}

let memoryRecentRoles: GrammarRole[] = []
let recentRolesHydrated = false

function hydrateRecentRolesOnce() {
  if (recentRolesHydrated) return
  recentRolesHydrated = true
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(RECENT_ROLES_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    memoryRecentRoles = parsed.filter((x): x is GrammarRole =>
      ALL_GRAMMAR_ROLES.includes(x as GrammarRole),
    ).slice(-RECENT_ROLES_LIMIT)
  } catch {
    /* ignore */
  }
}

function readRecentRoles(): GrammarRole[] {
  hydrateRecentRolesOnce()
  return [...memoryRecentRoles]
}

function appendRecentRole(role: GrammarRole) {
  hydrateRecentRolesOnce()
  memoryRecentRoles = [...memoryRecentRoles, role].slice(-RECENT_ROLES_LIMIT)
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(RECENT_ROLES_KEY, JSON.stringify(memoryRecentRoles))
  } catch {
    /* ignore */
  }
}

/** 按近期考察次数均衡六种成分，避免总盯主谓宾或总考定状补 */
function orderTargetsByBalance(parts: GrammarPart[]): GrammarPart[] {
  const recent = readRecentRoles()
  const recentCount = new Map<GrammarRole, number>()
  for (const r of recent) recentCount.set(r, (recentCount.get(r) ?? 0) + 1)

  const scored = parts.map((p, idx) => {
    const seen = recentCount.get(p.role) ?? 0
    const score = 30 - seen * 5 + Math.random() * 2
    return { p, score, idx }
  })
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx)
  return scored.map((x) => x.p)
}

function roleFromQuestion(q: GrammarJudgmentQuestion): GrammarRole | null {
  const find = q.expression.match(/下列哪个是(.+)？/)
  if (find?.[1]) {
    const label = find[1]
    const hit = ALL_GRAMMAR_ROLES.find((r) => GRAMMAR_ROLE_LABELS[r] === label)
    return hit ?? null
  }
  const name = ALL_GRAMMAR_ROLES.find((r) => GRAMMAR_ROLE_LABELS[r] === q.correctAnswer)
  return name ?? null
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function pickOne<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function difficultyOf(mode: GrammarJudgmentMode): 'easy' | 'normal' | 'hard' {
  if (mode === 'grammar-judgment-hard') return 'hard'
  if (mode === 'grammar-judgment-normal') return 'normal'
  return 'easy'
}

function poolFor(mode: GrammarJudgmentMode): GrammarSentence[] {
  const d = difficultyOf(mode)
  return GRAMMAR_JUDGMENT_BANK.filter((s) => s.difficulty === d)
}

/** 按难度顺序取下一句（循环），不随机跳句 */
function takeNextSentence(mode: GrammarJudgmentMode): GrammarSentence {
  const d = difficultyOf(mode)
  const pool = poolFor(mode)
  const cursors = readCursors()
  const idx = ((cursors[d] % pool.length) + pool.length) % pool.length
  cursors[d] = idx + 1
  writeCursors(cursors)
  return pool[idx]!
}

function uniqueParts(sentence: GrammarSentence): GrammarPart[] {
  const seen = new Set<string>()
  const out: GrammarPart[] = []
  for (const p of sentence.parts) {
    const key = p.text.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

/** 找成分题：该角色在句中只出现一次，避免多解 */
function findableParts(parts: GrammarPart[]): GrammarPart[] {
  const counts = new Map<GrammarRole, number>()
  for (const p of parts) counts.set(p.role, (counts.get(p.role) ?? 0) + 1)
  return parts.filter((p) => (counts.get(p.role) ?? 0) === 1)
}

function buildFindQuestion(
  id: number,
  sentence: GrammarSentence,
  target: GrammarPart,
  optionCount: number,
): GrammarJudgmentQuestion | null {
  const parts = uniqueParts(sentence)
  const correct = target.text
  const distractors = shuffle(
    parts.filter((p) => p.text !== correct).map((p) => p.text),
  )
  const need = Math.max(2, optionCount - 1)
  if (distractors.length < Math.min(2, need)) return null

  const picked = distractors.slice(0, need)
  while (picked.length < need) {
    const filler = `${GRAMMAR_ROLE_LABELS[pickOne(ALL_GRAMMAR_ROLES)]}对应成分`
    if (!picked.includes(filler) && filler !== correct) picked.push(filler)
    else break
  }
  if (picked.length < need) return null

  const options = shuffle([correct, ...picked.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === correct)
  const roleLabel = GRAMMAR_ROLE_LABELS[target.role]
  return {
    id,
    expression: `句子：${sentence.sentence}\n下列哪个是${roleLabel}？`,
    correctAnswer: correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: `「${correct}」在句中作${roleLabel}。整句成分：${parts
      .map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`)
      .join('、')}。`,
  }
}

function buildNameQuestion(
  id: number,
  sentence: GrammarSentence,
  target: GrammarPart,
  optionCount: number,
): GrammarJudgmentQuestion {
  const correct = GRAMMAR_ROLE_LABELS[target.role]
  const distractors = shuffle(
    ALL_GRAMMAR_ROLES.filter((r) => r !== target.role).map((r) => GRAMMAR_ROLE_LABELS[r]),
  )
  const need = Math.max(2, optionCount - 1)
  const picked = distractors.slice(0, need)
  const options = shuffle([correct, ...picked])
  const correctIndex = options.findIndex((x) => x === correct)
  const parts = uniqueParts(sentence)
  return {
    id,
    expression: `句子：${sentence.sentence}\n「${target.text}」是什么句子成分？`,
    correctAnswer: correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: `「${target.text}」是${correct}。整句成分：${parts
      .map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`)
      .join('、')}。`,
  }
}

function fingerprintOf(q: GrammarJudgmentQuestion): string {
  return `${q.expression}\u001e${[...q.options].sort().join('\u001f')}`
}

function tryBuild(
  id: number,
  sentence: GrammarSentence,
  optionCount: number,
  avoidFingerprints: Set<string>,
): GrammarJudgmentQuestion | null {
  const parts = uniqueParts(sentence)
  if (parts.length === 0) return null

  const findTargets = findableParts(parts)
  const kinds: QuestionKind[] = []
  if (findTargets.length > 0 && parts.length >= 3) kinds.push('find')
  kinds.push('name')
  const kind = pickOne(kinds)

  const attempts = orderTargetsByBalance(kind === 'find' ? findTargets : parts)

  for (const target of attempts) {
    const q =
      kind === 'find'
        ? buildFindQuestion(id, sentence, target, optionCount)
        : buildNameQuestion(id, sentence, target, optionCount)
    if (!q) continue
    if (avoidFingerprints.has(fingerprintOf(q))) continue
    return q
  }

  // 同句换题型再试
  const fallbackKind: QuestionKind = kind === 'find' ? 'name' : 'find'
  const fallbackTargets = orderTargetsByBalance(
    fallbackKind === 'find' ? findTargets : parts,
  )
  for (const target of fallbackTargets) {
    const q =
      fallbackKind === 'find'
        ? buildFindQuestion(id, sentence, target, optionCount)
        : buildNameQuestion(id, sentence, target, optionCount)
    if (!q) continue
    if (avoidFingerprints.has(fingerprintOf(q))) continue
    return q
  }

  return null
}

export function generateGrammarJudgmentQuestion(
  mode: GrammarJudgmentMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): GrammarJudgmentQuestion {
  const pool = poolFor(mode)
  let last: GrammarJudgmentQuestion | null = null
  // 句序推进；若本句题型撞指纹，再往后扫几句
  for (let i = 0; i < Math.min(8, pool.length); i++) {
    const sentence = takeNextSentence(mode)
    const q = tryBuild(id, sentence, optionCount, avoidFingerprints)
    if (!q) continue
    last = q
    if (!avoidFingerprints.has(fingerprintOf(q))) {
      const role = roleFromQuestion(q)
      if (role) appendRecentRole(role)
      return q
    }
  }
  if (last) {
    const role = roleFromQuestion(last)
    if (role) appendRecentRole(role)
    return last
  }
  const fallback = pool[0]!
  const q = buildNameQuestion(id, fallback, uniqueParts(fallback)[0]!, optionCount)
  const role = roleFromQuestion(q)
  if (role) appendRecentRole(role)
  return q
}

export function isGrammarJudgmentMode(mode: string): mode is GrammarJudgmentMode {
  return (
    mode === 'grammar-judgment-easy' ||
    mode === 'grammar-judgment-normal' ||
    mode === 'grammar-judgment-hard'
  )
}

export function getGrammarJudgmentBankStats() {
  return {
    easy: GRAMMAR_JUDGMENT_BANK.filter((x) => x.difficulty === 'easy').length,
    normal: GRAMMAR_JUDGMENT_BANK.filter((x) => x.difficulty === 'normal').length,
    hard: GRAMMAR_JUDGMENT_BANK.filter((x) => x.difficulty === 'hard').length,
    total: GRAMMAR_JUDGMENT_BANK.length,
  }
}
