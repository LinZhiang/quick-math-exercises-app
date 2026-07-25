/** 口算·圈出所有语法：圈出句中全部主谓宾定状补 */

import {
  ALL_GRAMMAR_ROLES,
  GRAMMAR_JUDGMENT_BANK,
  GRAMMAR_ROLE_LABELS,
  isCircleGrammarBankReady,
  type GrammarPart,
  type GrammarRole,
  type GrammarSentence,
} from '@/utils/grammarJudgmentBank'

export type CircleGrammarMode = 'circle-grammar-easy' | 'circle-grammar-hard'

export type CircleGrammarModeConfig = {
  id: CircleGrammarMode
  label: string
  /** 0 = 不计倒计时，只累计用时 */
  durationSec: number
  questionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
  bankDifficulty: 'normal' | 'hard'
}

export const CIRCLE_GRAMMAR_MODES: CircleGrammarModeConfig[] = [
  {
    id: 'circle-grammar-easy',
    label: '简单题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -5,
    maxScore: 100,
    desc: '5 题 · 普通句式 · 圈出全部成分 · 不计时 · 对 +20 / 错 -5',
    bankDifficulty: 'normal',
  },
  {
    id: 'circle-grammar-hard',
    label: '困难题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -5,
    maxScore: 100,
    desc: '5 题 · 复杂句式 · 圈出全部成分 · 不计时 · 对 +20 / 错 -5',
    bankDifficulty: 'hard',
  },
]

export type CircleGrammarMark = {
  text: string
  role: GrammarRole
  /** 在原句中的起始下标（用于高亮；手动输入可无） */
  start?: number
  end?: number
}

export type CircleGrammarQuestion = {
  id: number
  sentence: GrammarSentence
  prompt: string
  expected: GrammarPart[]
  explanation: string
}

const CURSOR_KEY = 'mental-circle-grammar-cursor-v1'

type CursorMap = Record<'easy' | 'hard', number>

let memoryCursors: CursorMap = { easy: 0, hard: 0 }
let memoryHydrated = false

/** 标点空白：不参与按字角色比对 */
const SKIP_CHARS = new Set(
  '，。！？、；： \t,.!?;:()（）【】《》…—""\'\'“”‘’'.split(''),
)

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

export function isCircleGrammarMode(mode: string): mode is CircleGrammarMode {
  return mode === 'circle-grammar-easy' || mode === 'circle-grammar-hard'
}

export function getCircleGrammarModeConfig(mode: CircleGrammarMode): CircleGrammarModeConfig {
  const hit = CIRCLE_GRAMMAR_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`Unknown circle grammar mode: ${mode}`)
  return hit
}

export function clampCircleGrammarScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

function poolFor(mode: CircleGrammarMode): GrammarSentence[] {
  const diff = getCircleGrammarModeConfig(mode).bankDifficulty
  return GRAMMAR_JUDGMENT_BANK.filter(
    (s) => s.difficulty === diff && isCircleGrammarBankReady(s),
  )
}

function cursorKey(mode: CircleGrammarMode): 'easy' | 'hard' {
  return mode === 'circle-grammar-hard' ? 'hard' : 'easy'
}

function takeNextSentence(mode: CircleGrammarMode): GrammarSentence {
  const pool = poolFor(mode)
  const key = cursorKey(mode)
  const cursors = readCursors()
  const idx = ((cursors[key] % pool.length) + pool.length) % pool.length
  cursors[key] = idx + 1
  writeCursors(cursors)
  return pool[idx]!
}

function uniqueParts(parts: GrammarPart[]): GrammarPart[] {
  const seen = new Set<string>()
  const out: GrammarPart[] = []
  for (const p of parts) {
    const key = `${p.role}|${p.text.trim()}`
    if (!p.text.trim() || seen.has(key)) continue
    seen.add(key)
    out.push({ text: p.text.trim(), role: p.role })
  }
  return out
}

function formatExplanation(sentence: GrammarSentence, parts: GrammarPart[]): string {
  const base = `整句：${sentence.sentence} 成分：${parts
    .map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`)
    .join('、')}。相邻且同为一种成分的，可分开圈也可合并圈。`
  const alts = sentence.alternateParts?.filter((a) => a?.length) ?? []
  if (!alts.length) return base
  const altText = alts
    .map(
      (scheme, i) =>
        `方案${i + 2}：${uniqueParts(scheme)
          .map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`)
          .join('、')}`,
    )
    .join('；')
  return `${base}另有可接受切分——${altText}。`
}

export function generateCircleGrammarQuestion(
  mode: CircleGrammarMode,
  id: number,
): CircleGrammarQuestion {
  const sentence = takeNextSentence(mode)
  const expected = uniqueParts(sentence.parts)
  return {
    id,
    sentence,
    prompt:
      '请圈出句中全部主语、谓语、宾语、定语、状语、补语（可滑动圈选或手动输入）。相邻相同成分可合并圈选。',
    expected,
    explanation: formatExplanation(sentence, expected),
  }
}

export function getCircleGrammarQuestionFingerprint(q: CircleGrammarQuestion): string {
  return `circle-grammar:${q.sentence.id}`
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, '').trim()
}

/**
 * 将成分落到原句上（非重叠贪心），得到每字角色。
 * 找不到的成分忽略（与覆盖率审计一致，题库应保证可落位）。
 */
export function buildGrammarRoleMap(
  sentence: string,
  parts: GrammarPart[],
): (GrammarRole | null)[] {
  const roles: (GrammarRole | null)[] = Array.from({ length: sentence.length }, () => null)
  const covered = new Array(sentence.length).fill(false)
  for (const p of uniqueParts(parts)) {
    const t = p.text
    if (!t) continue
    let idx = sentence.indexOf(t)
    while (idx >= 0) {
      let overlap = false
      for (let i = idx; i < idx + t.length; i++) {
        if (covered[i]) {
          overlap = true
          break
        }
      }
      if (!overlap) {
        for (let i = idx; i < idx + t.length; i++) {
          covered[i] = true
          if (!SKIP_CHARS.has(sentence[i]!)) roles[i] = p.role
        }
        break
      }
      idx = sentence.indexOf(t, idx + 1)
    }
  }
  return roles
}

/** 用户圈选落到原句：优先用 start/end，否则按文本查找 */
function buildUserRoleMap(
  sentence: string,
  marks: CircleGrammarMark[],
): (GrammarRole | null)[] {
  const roles: (GrammarRole | null)[] = Array.from({ length: sentence.length }, () => null)
  for (const m of marks) {
    const t = normalizeText(m.text)
    if (!t) continue
    let start = typeof m.start === 'number' ? m.start : -1
    let end = typeof m.end === 'number' ? m.end : -1
    if (start < 0 || end <= start || sentence.slice(start, end).replace(/\s+/g, '') !== t) {
      start = sentence.indexOf(t)
      end = start >= 0 ? start + t.length : -1
      // 若原文含空白导致 indexOf 失败，再扫一遍去空白对齐
      if (start < 0) {
        const compact = sentence.replace(/\s+/g, '')
        const cIdx = compact.indexOf(t)
        if (cIdx >= 0) {
          let seen = 0
          start = -1
          end = -1
          for (let i = 0; i < sentence.length; i++) {
            if (/\s/.test(sentence[i]!)) continue
            if (seen === cIdx) start = i
            seen += 1
            if (seen === cIdx + t.length) {
              end = i + 1
              break
            }
          }
        }
      }
    }
    if (start < 0 || end <= start) continue
    for (let i = start; i < end && i < sentence.length; i++) {
      if (SKIP_CHARS.has(sentence[i]!)) continue
      roles[i] = m.role
    }
  }
  return roles
}

type SchemeCheck = {
  ok: boolean
  missing: GrammarPart[]
  extra: CircleGrammarMark[]
}

function rolesMatch(
  sentence: string,
  gold: (GrammarRole | null)[],
  user: (GrammarRole | null)[],
): boolean {
  for (let i = 0; i < sentence.length; i++) {
    if (SKIP_CHARS.has(sentence[i]!)) continue
    if (gold[i] !== user[i]) return false
  }
  return true
}

function checkAgainstScheme(
  sentence: string,
  expected: GrammarPart[],
  marks: CircleGrammarMark[],
): SchemeCheck {
  const gold = buildGrammarRoleMap(sentence, expected)
  const user = buildUserRoleMap(sentence, marks)
  const ok = rolesMatch(sentence, gold, user)

  const missing: GrammarPart[] = []
  for (const p of uniqueParts(expected)) {
    const t = p.text
    if (!t) continue
    // 找到该成分在金标角色图中的落位（与 buildGrammarRoleMap 一致的非重叠贪心）
    let idx = sentence.indexOf(t)
    let span: { start: number; end: number } | null = null
    while (idx >= 0) {
      let matchesGold = true
      for (let i = idx; i < idx + t.length; i++) {
        if (SKIP_CHARS.has(sentence[i]!)) continue
        if (gold[i] !== p.role) {
          matchesGold = false
          break
        }
      }
      if (matchesGold) {
        span = { start: idx, end: idx + t.length }
        break
      }
      idx = sentence.indexOf(t, idx + 1)
    }
    if (!span) {
      missing.push(p)
      continue
    }
    let covered = true
    for (let i = span.start; i < span.end; i++) {
      if (SKIP_CHARS.has(sentence[i]!)) continue
      if (user[i] !== p.role) {
        covered = false
        break
      }
    }
    if (!covered) missing.push(p)
  }

  const extra: CircleGrammarMark[] = []
  for (const m of marks) {
    const t = normalizeText(m.text)
    if (!t) continue
    let start = typeof m.start === 'number' ? m.start : -1
    let end = typeof m.end === 'number' ? m.end : -1
    if (start < 0 || end <= start || normalizeText(sentence.slice(start, end)) !== t) {
      start = sentence.indexOf(t)
      end = start >= 0 ? start + t.length : -1
    }
    if (start < 0) {
      extra.push({ ...m, text: t })
      continue
    }
    let bad = false
    let hasContent = false
    for (let i = start; i < end && i < sentence.length; i++) {
      if (SKIP_CHARS.has(sentence[i]!)) continue
      hasContent = true
      if (gold[i] !== m.role) {
        bad = true
        break
      }
    }
    if (!hasContent || bad) extra.push({ ...m, text: t })
  }

  return { ok, missing, extra }
}

export type CircleGrammarValidateOptions = {
  /** 原句；用于按字比对与相邻同成分合并 */
  sentence?: string
  /** 其他可接受切分方案 */
  alternateParts?: GrammarPart[][]
}

/**
 * 判定圈选是否正确。
 * - 按字比对角色：相邻同成分合并圈选算对，不必按金标边界拆开
 * - 角色标错、漏标、多标到无金标字上仍算错
 * - alternateParts 任一方案通过即可
 */
export function validateCircleGrammarAnswer(
  expected: GrammarPart[],
  marks: CircleGrammarMark[],
  options?: CircleGrammarValidateOptions,
): { ok: boolean; missing: GrammarPart[]; extra: CircleGrammarMark[]; detail: string } {
  const sentence = options?.sentence?.trim() ? options.sentence : ''
  const schemes: GrammarPart[][] = [
    uniqueParts(expected),
    ...(options?.alternateParts ?? []).map((s) => uniqueParts(s)),
  ].filter((s) => s.length)

  if (!sentence) {
    // 无原句时退回旧的集合全等（兼容）
    return validateCircleGrammarAnswerLegacy(schemes[0] ?? [], marks, schemes.slice(1))
  }

  let matchedOk = false
  let primaryFail: SchemeCheck | null = null
  for (let i = 0; i < schemes.length; i++) {
    const result = checkAgainstScheme(sentence, schemes[i]!, marks)
    if (result.ok) {
      matchedOk = true
      break
    }
    if (i === 0) primaryFail = result
  }

  if (matchedOk) {
    return {
      ok: true,
      missing: [],
      extra: [],
      detail: '全部成分圈选正确',
    }
  }

  const missing = primaryFail?.missing ?? []
  const extra = primaryFail?.extra ?? []
  const detail = [
    missing.length
      ? `漏标或不匹配：${missing.map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`).join('、')}`
      : '',
    extra.length
      ? `多标/错标：${extra.map((m) => `${m.text}（${GRAMMAR_ROLE_LABELS[m.role]}）`).join('、')}`
      : '',
  ]
    .filter(Boolean)
    .join('；')

  return { ok: false, missing, extra, detail: detail || '圈选与参考答案不一致' }
}

/** 无原句时的集合匹配；仍允许「同角色文本拼接」等价于若干金标片段 */
function validateCircleGrammarAnswerLegacy(
  expected: GrammarPart[],
  marks: CircleGrammarMark[],
  alternates: GrammarPart[][],
): { ok: boolean; missing: GrammarPart[]; extra: CircleGrammarMark[]; detail: string } {
  const tryOne = (exp: GrammarPart[]) => {
    const expList = uniqueParts(exp)
    const act = new Map<string, CircleGrammarMark>()
    for (const m of marks) {
      const t = normalizeText(m.text)
      if (!t) continue
      act.set(`${m.role}|${t}`, { ...m, text: t })
    }
    const usedAct = new Set<string>()
    const missing: GrammarPart[] = []

    // 先消耗精确匹配
    for (const p of expList) {
      const k = `${p.role}|${normalizeText(p.text)}`
      if (act.has(k)) usedAct.add(k)
    }

    // 再尝试用「同角色合并圈选」覆盖未命中金标
    const uncovered = expList.filter((p) => !usedAct.has(`${p.role}|${normalizeText(p.text)}`))
    const uncoveredByRole = new Map<GrammarRole, GrammarPart[]>()
    for (const p of uncovered) {
      const list = uncoveredByRole.get(p.role) ?? []
      list.push(p)
      uncoveredByRole.set(p.role, list)
    }

    for (const [k, m] of act) {
      if (usedAct.has(k)) continue
      const pool = uncoveredByRole.get(m.role) ?? []
      if (!pool.length) continue
      // 子集拼接（保持相对顺序）能否等于用户文本
      const matched = findConcatSubset(
        pool.map((p) => normalizeText(p.text)),
        m.text,
      )
      if (!matched) continue
      usedAct.add(k)
      for (const text of matched) {
        const part = pool.find((p) => normalizeText(p.text) === text)
        if (part) {
          usedAct.add(`${part.role}|${text}`)
          const idx = pool.indexOf(part)
          if (idx >= 0) pool.splice(idx, 1)
        }
      }
    }

    for (const p of expList) {
      if (!usedAct.has(`${p.role}|${normalizeText(p.text)}`)) missing.push(p)
    }
    const extra: CircleGrammarMark[] = []
    for (const [k, m] of act) {
      if (!usedAct.has(k)) extra.push(m)
    }
    return { ok: missing.length === 0 && extra.length === 0, missing, extra }
  }

  for (const scheme of [expected, ...alternates]) {
    const r = tryOne(scheme)
    if (r.ok) {
      return { ok: true, missing: [], extra: [], detail: '全部成分圈选正确' }
    }
  }
  const fallback = tryOne(expected)
  const detail = [
    fallback.missing.length
      ? `漏标或不匹配：${fallback.missing.map((p) => `${p.text}（${GRAMMAR_ROLE_LABELS[p.role]}）`).join('、')}`
      : '',
    fallback.extra.length
      ? `多标/错标：${fallback.extra.map((m) => `${m.text}（${GRAMMAR_ROLE_LABELS[m.role]}）`).join('、')}`
      : '',
  ]
    .filter(Boolean)
    .join('；')
  return { ok: false, missing: fallback.missing, extra: fallback.extra, detail }
}

/** 在 texts 中找一组保序子序列，拼接后等于 target */
function findConcatSubset(texts: string[], target: string): string[] | null {
  const n = texts.length
  for (let mask = 1; mask < 1 << n; mask++) {
    let concat = ''
    const picked: string[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        concat += texts[i]
        picked.push(texts[i]!)
      }
    }
    if (concat === target) return picked
  }
  return null
}

export function formatCircleGrammarMarks(marks: CircleGrammarMark[]): string {
  if (!marks.length) return '（未圈选）'
  return marks.map((m) => `${m.text}=${GRAMMAR_ROLE_LABELS[m.role]}`).join('、')
}

export function formatCircleGrammarExpected(parts: GrammarPart[]): string {
  return parts.map((p) => `${p.text}=${GRAMMAR_ROLE_LABELS[p.role]}`).join('、')
}

export { ALL_GRAMMAR_ROLES, GRAMMAR_ROLE_LABELS }
