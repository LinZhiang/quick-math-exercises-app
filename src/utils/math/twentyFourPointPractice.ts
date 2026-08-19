export type TwentyFourPointMode = 'twentyfour-easy' | 'twentyfour-hard'

export type TwentyFourPointModeConfig = {
  id: TwentyFourPointMode
  label: string
  durationSec: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  timeCorrectBonusSec: number
  timeWrongPenaltySec: number
  desc: string
}

export type TwentyFourPointQuestion = {
  id: number
  nums: number[]
  prompt: string
  sampleSolution: string
}

export const TWENTY_FOUR_POINT_MODES: TwentyFourPointModeConfig[] = [
  {
    id: 'twentyfour-easy',
    label: '简单模式',
    durationSec: 60,
    correctDelta: 20,
    wrongDelta: -40,
    maxScore: 100,
    timeCorrectBonusSec: 5,
    timeWrongPenaltySec: 10,
    desc: '1 分钟 · 四数 1～5、经典易题、解法多 · 自行拼算式 · 对 +20 / 错 -40 · 对 +5 秒 / 错 -10 秒',
  },
  {
    id: 'twentyfour-hard',
    label: '高难模式',
    durationSec: 90,
    correctDelta: 40,
    wrongDelta: -80,
    maxScore: 100,
    timeCorrectBonusSec: 10,
    timeWrongPenaltySec: 20,
    desc: '1 分 30 秒 · 四数组合更刁钻 · 自行拼算式 · 对 +40 / 错 -80 · 对 +10 秒 / 错 -20 秒',
  },
]

type Op = '+' | '-' | '*' | '/'

const OP_CHAR: Record<Op, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

const ALL_OPS: Op[] = ['+', '-', '*', '/']
const TARGET = 24
const EPS = 1e-5

/** 简单模式题库：数字小、解法多，或可直接相加凑 24 */
const EASY_CURATED: number[][] = [
  [1, 2, 3, 4],
  [1, 2, 3, 5],
  [1, 2, 4, 4],
  [1, 3, 3, 4],
  [1, 3, 3, 5],
  [1, 3, 4, 5],
  [1, 4, 4, 5],
  [1, 1, 4, 5],
  [1, 1, 4, 6],
  [1, 2, 2, 4],
  [2, 2, 4, 5],
  [2, 3, 4, 4],
  [2, 3, 4, 5],
  [2, 3, 4, 6],
  [3, 3, 3, 3],
  [2, 2, 2, 6],
  [2, 2, 10, 10],
  [1, 1, 12, 12],
]

const EASY_FALLBACK: number[][] = EASY_CURATED

const HARD_FALLBACK: number[][] = [
  [3, 3, 8, 8],
  [1, 5, 5, 5],
  [3, 3, 7, 7],
  [1, 3, 4, 6],
  [4, 4, 10, 10],
  [6, 6, 6, 6],
  [2, 2, 11, 11],
  [1, 2, 7, 10],
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function permutations(nums: number[]): number[][] {
  if (nums.length <= 1) return [nums]
  const out: number[][] = []
  for (let i = 0; i < nums.length; i++) {
    const rest = [...nums.slice(0, i), ...nums.slice(i + 1)]
    for (const p of permutations(rest)) {
      out.push([nums[i], ...p])
    }
  }
  return out
}

function nearTarget(n: number): boolean {
  return Math.abs(n - TARGET) < EPS
}

function applyOp(a: number, b: number, op: Op): number | null {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      if (b === 0) return null
      return a / b
    default:
      return null
  }
}

function isAtomic(s: string): boolean {
  return /^\d+$/.test(s)
}

function wrapExpr(s: string): string {
  return isAtomic(s) ? s : `(${s})`
}

function combine(
  va: number,
  sa: string,
  vb: number,
  sb: string,
  op: Op,
): { v: number; s: string } | null {
  const v = applyOp(va, vb, op)
  if (v === null || !Number.isFinite(v)) return null
  const s = `${wrapExpr(sa)}${OP_CHAR[op]}${wrapExpr(sb)}`
  return { v, s }
}

function solve24(nums: number[]): string[] {
  const solutions = new Set<string>()
  const perms = permutations(nums)

  for (const [a, b, c, d] of perms) {
    const sa = String(a)
    const sb = String(b)
    const sc = String(c)
    const sd = String(d)

    for (const o1 of ALL_OPS) {
      for (const o2 of ALL_OPS) {
        for (const o3 of ALL_OPS) {
          const ab = combine(a, sa, b, sb, o1)
          if (!ab) continue

          const ab_c = combine(ab.v, ab.s, c, sc, o2)
          if (ab_c) {
            const abcd = combine(ab_c.v, ab_c.s, d, sd, o3)
            if (abcd && nearTarget(abcd.v)) solutions.add(abcd.s)
          }

          const bc = combine(b, sb, c, sc, o2)
          if (bc) {
            const abc = combine(a, sa, bc.v, bc.s, o1)
            if (abc) {
              const abcd = combine(abc.v, abc.s, d, sd, o3)
              if (abcd && nearTarget(abcd.v)) solutions.add(abcd.s)
            }
          }

          if (bc) {
            const bcd = combine(bc.v, bc.s, d, sd, o3)
            if (bcd) {
              const abcd = combine(a, sa, bcd.v, bcd.s, o1)
              if (abcd && nearTarget(abcd.v)) solutions.add(abcd.s)
            }
          }

          const cd = combine(c, sc, d, sd, o3)
          if (cd) {
            const ab_cd = combine(ab.v, ab.s, cd.v, cd.s, o2)
            if (ab_cd && nearTarget(ab_cd.v)) solutions.add(ab_cd.s)
          }

          if (cd) {
            const b_cd = combine(b, sb, cd.v, cd.s, o2)
            if (b_cd) {
              const abcd = combine(a, sa, b_cd.v, b_cd.s, o1)
              if (abcd && nearTarget(abcd.v)) solutions.add(abcd.s)
            }
          }
        }
      }
    }
  }

  return [...solutions]
}

const EASY_MIN_SOLUTIONS = 4
const EASY_RANDOM_MAX_DIGIT = 5
const EASY_MAX_DIGIT = 6
const EASY_MAX_SUM = 16

function isEasyPuzzle(nums: number[], solutionCount: number): boolean {
  if (solutionCount === 0) return false
  const sum = nums.reduce((a, b) => a + b, 0)
  if (sum === TARGET) return true
  const max = Math.max(...nums)
  return solutionCount >= EASY_MIN_SOLUTIONS && max <= EASY_MAX_DIGIT && sum <= EASY_MAX_SUM
}

function pickFourNumbers(mode: TwentyFourPointMode): number[] {
  if (mode === 'twentyfour-easy') {
    if (Math.random() < 0.55) {
      return shuffle(EASY_CURATED)[0]
    }
    return [
      randInt(1, EASY_RANDOM_MAX_DIGIT),
      randInt(1, EASY_RANDOM_MAX_DIGIT),
      randInt(1, EASY_RANDOM_MAX_DIGIT),
      randInt(1, EASY_RANDOM_MAX_DIGIT),
    ]
  }
  const max = randInt(6, 13)
  return [randInt(1, max), randInt(1, max), randInt(1, max), randInt(1, max)]
}

function pickPuzzle(mode: TwentyFourPointMode): number[] {
  const fallbacks = mode === 'twentyfour-easy' ? EASY_FALLBACK : HARD_FALLBACK
  const attempts = mode === 'twentyfour-easy' ? 120 : 80
  for (let i = 0; i < attempts; i++) {
    const nums = pickFourNumbers(mode)
    const solutions = solve24(nums)
    if (solutions.length === 0) continue
    if (mode === 'twentyfour-easy' && !isEasyPuzzle(nums, solutions.length)) continue
    if (mode === 'twentyfour-hard' && solutions.length > 2) continue
    return shuffle(nums)
  }
  return shuffle(fallbacks)[0]
}

export function formatTwentyFourPrompt(nums: number[]): string {
  return `用 ${nums.join('、')} 凑二十四点（仅 + − × ÷，四数各用一次）`
}

export function getTwentyFourQuestionFingerprint(q: TwentyFourPointQuestion): string {
  return q.prompt
}

export function isTwentyFourPointMode(mode: string): mode is TwentyFourPointMode {
  return mode === 'twentyfour-easy' || mode === 'twentyfour-hard'
}

export function getTwentyFourPointModeConfig(mode: TwentyFourPointMode): TwentyFourPointModeConfig {
  const cfg = TWENTY_FOUR_POINT_MODES.find((m) => m.id === mode)
  if (!cfg) throw new Error(`unknown twenty-four mode: ${mode}`)
  return cfg
}

export function clampTwentyFourPointScore(score: number, max = 100): number {
  return Math.max(0, Math.min(max, score))
}

export function generateTwentyFourPointPuzzle(
  mode: TwentyFourPointMode,
  id: number,
  avoidFingerprint?: string | null,
): TwentyFourPointQuestion {
  for (let attempt = 0; attempt < 32; attempt++) {
    const nums = pickPuzzle(mode)
    const prompt = formatTwentyFourPrompt(nums)
    if (avoidFingerprint && prompt === avoidFingerprint) continue
    const solutions = solve24(nums)
    if (solutions.length === 0) continue
    return {
      id,
      nums,
      prompt,
      sampleSolution: solutions[0],
    }
  }

  const fallbacks = mode === 'twentyfour-easy' ? EASY_FALLBACK : HARD_FALLBACK
  const nums = shuffle(fallbacks)[0]
  const solutions = solve24(nums)
  return {
    id,
    nums,
    prompt: formatTwentyFourPrompt(nums),
    sampleSolution: solutions[0],
  }
}

/** 显示用算式 → 可计算的 JS 表达式 */
export function normalizeTwentyFourExpression(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '')
}

export type TwentyFourParsedChip =
  | { kind: 'num'; slotIndex: number }
  | { kind: 'op'; value: '+' | '−' | '×' | '÷' }
  | { kind: 'paren'; value: '(' | ')' }

function normalizeOpChar(ch: string): '+' | '−' | '×' | '÷' | null {
  if (ch === '+' || ch === '＋') return '+'
  if (ch === '-' || ch === '−' || ch === '－') return '−'
  if (ch === '*' || ch === '×' || ch === '＊') return '×'
  if (ch === '/' || ch === '÷' || ch === '／') return '÷'
  return null
}

/** 将显示算式解析为牌序列（与题目四数各用一次匹配）；空串返回 []，非法返回 null */
export function parseTwentyFourDisplayExpression(
  expr: string,
  nums: number[],
): TwentyFourParsedChip[] | null {
  const trimmed = expr.trim()
  if (!trimmed) return []

  const tokens: TwentyFourParsedChip[] = []
  const usedSlots = nums.map(() => false)
  let i = 0

  while (i < trimmed.length) {
    const ch = trimmed[i]
    if (/\s/.test(ch)) {
      i += 1
      continue
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ kind: 'paren', value: ch })
      i += 1
      continue
    }
    const op = normalizeOpChar(ch)
    if (op) {
      tokens.push({ kind: 'op', value: op })
      i += 1
      continue
    }
    if (/\d/.test(ch)) {
      let numStr = ''
      while (i < trimmed.length && /\d/.test(trimmed[i])) {
        numStr += trimmed[i]
        i += 1
      }
      const value = Number(numStr)
      const slotIndex = nums.findIndex((n, idx) => n === value && !usedSlots[idx])
      if (slotIndex < 0) return null
      usedSlots[slotIndex] = true
      tokens.push({ kind: 'num', slotIndex })
      continue
    }
    return null
  }

  return tokens
}

/** 根据算式文本统计各数字牌是否已使用（支持未输完的式子） */
export function getUsedSlotsFromExpression(expr: string, nums: number[]): boolean[] {
  const used = nums.map(() => false)
  const trimmed = expr.trim()
  if (!trimmed) return used

  const parsed = parseTwentyFourDisplayExpression(trimmed, nums)
  if (parsed) {
    for (const token of parsed) {
      if (token.kind === 'num') used[token.slotIndex] = true
    }
    return used
  }

  const numbers = trimmed.match(/\d+/g)?.map((m) => Number(m)) ?? []
  for (const value of numbers) {
    const slotIndex = nums.findIndex((n, idx) => n === value && !used[idx])
    if (slotIndex < 0) break
    used[slotIndex] = true
  }
  return used
}

function extractNumbers(expr: string): number[] {
  const matches = expr.match(/\d+/g)
  return matches ? matches.map((m) => Number(m)) : []
}

function multisetEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

function evaluateNormalized(expr: string): number | null {
  if (!expr || !/^[0-9+\-*/().]+$/.test(expr)) return null
  try {
    const val = Function(`"use strict"; return (${expr})`)() as number
    if (typeof val !== 'number' || !Number.isFinite(val)) return null
    return val
  } catch {
    return null
  }
}

export function validateTwentyFourExpression(
  nums: number[],
  rawExpression: string,
): { ok: boolean; reason?: string } {
  const trimmed = rawExpression.trim()
  if (!trimmed) return { ok: false, reason: '请先拼出算式' }

  const normalized = normalizeTwentyFourExpression(trimmed)
  const used = extractNumbers(trimmed)
  if (!multisetEqual(used, nums)) {
    return { ok: false, reason: '须恰好使用题目中的四个数各一次' }
  }

  const val = evaluateNormalized(normalized)
  if (val === null) return { ok: false, reason: '算式格式有误' }
  if (!nearTarget(val)) return { ok: false, reason: '结果不是 24' }

  return { ok: true }
}
