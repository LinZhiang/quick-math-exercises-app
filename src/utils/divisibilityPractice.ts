/** 整除及其性质：仅「哪个是质数/合数」与「哪个能被 3～12 整除」 */

export type DivisibilityMode =
  | 'divisibility-easy'
  | 'divisibility-distractor'
  | 'divisibility-normal'
  | 'divisibility-hard'

export type DivisibilityModeConfig = {
  id: DivisibilityMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const DIVISIBILITY_MODES: DivisibilityModeConfig[] = [
  {
    id: 'divisibility-easy',
    label: '简单题',
    durationSec: 35,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '35 秒 · 质数/合数（小数）· 能被 3～12 整除 · 3 选项 · 对 +5 / 错 -10 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-distractor',
    label: '简单题（干扰型）',
    durationSec: 35,
    optionCount: 3,
    correctDelta: 7,
    wrongDelta: -14,
    maxScore: 100,
    desc: '35 秒 · 与简单题同量级 · 易混陷阱干扰更强 · 3 选项 · 对 +7 / 错 -14 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 质数/合数 · 能被 3～12 整除 · 4 选项 · 对 +8 / 错 -15 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-hard',
    label: '高难题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 稍大数质合数 · 能被 3～12 整除 · 5 选项 · 对 +10 / 错 -20 · 对 +1 秒 / 错 -1 秒',
  },
]

export type DivisibilityQuestion = {
  id: number
  expression: string
  correctAnswer: string | number
  options: (string | number)[]
  correctIndex: number
}

/** 题目只考 3～12 的整除判定 */
const DIVISORS_3_TO_12 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }
  return a
}

function digitSum(n: number): number {
  return String(Math.abs(n))
    .split('')
    .reduce((s, c) => s + Number(c), 0)
}

function altDigitSum(n: number): number {
  const digits = String(Math.abs(n)).split('').map(Number)
  let s = 0
  for (let i = 0; i < digits.length; i++) {
    s += i % 2 === 0 ? digits[i]! : -digits[i]!
  }
  return s
}

function pickFrom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
/** 简单题合数：不超过 20 */
const EASY_COMPOSITES = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20]
const NORMAL_COMPOSITES = [...EASY_COMPOSITES, 21, 22, 24, 25, 27, 28]
const HARD_COMPOSITES = [...NORMAL_COMPOSITES, 32, 33, 35, 39, 45, 49]

function buildMcq(input: {
  id: number
  expression: string
  correct: string | number
  distractors: (string | number)[]
}): DivisibilityQuestion {
  const unique = [input.correct, ...input.distractors].filter(
    (v, i, arr) => arr.findIndex((x) => String(x) === String(v)) === i,
  )
  const options = shuffle(unique)
  const correctIndex = options.findIndex((v) => String(v) === String(input.correct))
  return {
    id: input.id,
    expression: input.expression,
    correctAnswer: input.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function fillDistractors(
  correct: string | number,
  need: number,
  candidates: (string | number)[],
): (string | number)[] {
  const out: (string | number)[] = []
  const seen = new Set([String(correct)])
  for (const c of shuffle(candidates)) {
    const key = String(c)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
    if (out.length >= need) break
  }
  let guard = 0
  while (out.length < need && guard < 40) {
    guard++
    const n = typeof correct === 'number' ? correct + randInt(-12, 12) || correct + 1 : `干扰${guard}`
    const key = String(n)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(n)
  }
  return out.slice(0, need)
}

/** 生成能/不能被 d 整除的数 */
function makeNumberDivisibleBy(d: number, min: number, max: number, wantDivisible: boolean): number {
  for (let t = 0; t < 40; t++) {
    let n = randInt(min, max)
    if (wantDivisible) {
      n = Math.floor(n / d) * d
      if (n < min) n += d
      if (n >= min && n <= max && n % d === 0) return n
    } else if (n % d !== 0) {
      return n
    }
  }
  return wantDivisible ? d * randInt(Math.ceil(min / d), Math.floor(max / d)) : min + 1
}

/** 强干扰：满足整除判定中某一条、却不满足完整条件 */
function makeNearMissNotDivisibleBy(d: number, min: number, max: number): number {
  for (let t = 0; t < 60; t++) {
    const n = randInt(min, max)
    if (n % d === 0) continue
    if (d === 6) {
      const even = n % 2 === 0
      const by3 = digitSum(n) % 3 === 0
      if (even !== by3) return n
    } else if (d === 4) {
      // 末一位是偶数但不被 4 整除
      if (n % 2 === 0 && n % 4 !== 0) return n
    } else if (d === 8) {
      if (n % 4 === 0 && n % 8 !== 0) return n
    } else if (d === 9) {
      if (digitSum(n) % 3 === 0 && digitSum(n) % 9 !== 0) return n
    } else if (d === 3) {
      if (digitSum(n) % 9 === 0 && n % 3 !== 0) continue
      if (digitSum(n) % 3 !== 0) return n
    } else if (d === 10) {
      if (n % 5 === 0 && n % 2 !== 0) return n
      if (n % 2 === 0 && n % 5 !== 0) return n
    } else if (d === 12) {
      const by3 = digitSum(n) % 3 === 0
      const by4 = n % 4 === 0
      if (by3 !== by4) return n
    } else if (d === 11) {
      const alt = Math.abs(altDigitSum(n))
      if (alt === 1 || alt === 10 || alt === 12) return n
    } else if (d === 7) {
      if (n % 7 === 1 || n % 7 === 6) return n
    }
  }
  return makeNumberDivisibleBy(d, min, max, false)
}

function isStrongDistract(mode: DivisibilityMode): boolean {
  return mode === 'divisibility-distractor'
}

function modeBand(mode: DivisibilityMode): 'easy' | 'normal' | 'hard' {
  if (mode === 'divisibility-hard') return 'hard'
  if (mode === 'divisibility-normal') return 'normal'
  return 'easy'
}

/** 下列哪个数能被 3～12 整除？ */
function genDivisibilityCheck(
  id: number,
  optionCount: number,
  mode: DivisibilityMode,
): DivisibilityQuestion {
  const strong = isStrongDistract(mode)
  const band = modeBand(mode)
  const d = pickFrom([...DIVISORS_3_TO_12])
  const range =
    band === 'easy' ? [12, 72] : band === 'normal' ? [20, 144] : [36, 240]

  const correct = makeNumberDivisibleBy(d, range[0]!, range[1]!, true)
  const wrongs: number[] = []
  let guard = 0
  while (wrongs.length < optionCount - 1 && guard < 80) {
    guard++
    const w = strong
      ? makeNearMissNotDivisibleBy(d, range[0]!, range[1]!)
      : makeNumberDivisibleBy(d, range[0]!, range[1]!, false)
    if (!wrongs.includes(w) && w !== correct && w % d !== 0) wrongs.push(w)
  }
  return buildMcq({
    id,
    expression: `下列哪个数能被 ${d} 整除？`,
    correct,
    distractors: wrongs,
  })
}

/** 下列哪个数是质数 / 合数？ */
function genPrimeComposite(
  id: number,
  optionCount: number,
  mode: DivisibilityMode,
): DivisibilityQuestion {
  const strong = isStrongDistract(mode)
  const band = modeBand(mode)

  const primePool =
    band === 'easy'
      ? SMALL_PRIMES.filter((p) => p <= 19)
      : band === 'normal'
        ? SMALL_PRIMES.filter((p) => p <= 23)
        : SMALL_PRIMES
  const compositePool =
    band === 'easy' ? EASY_COMPOSITES : band === 'normal' ? NORMAL_COMPOSITES : HARD_COMPOSITES
  const strongCompositeWrongs = [1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49]

  if (Math.random() < 0.5) {
    const correct = pickFrom(primePool)
    const wrongPool = strong
      ? band === 'easy'
        ? [1, 9, 15, 21, 25, 27]
        : strongCompositeWrongs
      : compositePool
    return buildMcq({
      id,
      expression: '下列哪个数是质数？',
      correct,
      distractors: fillDistractors(correct, optionCount - 1, wrongPool),
    })
  }

  const correct = pickFrom(compositePool)
  const wrongPool = strong ? [...primePool, 1] : [...primePool, 1]
  return buildMcq({
    id,
    expression: '下列哪个数是合数？',
    correct,
    distractors: fillDistractors(correct, optionCount - 1, wrongPool),
  })
}

export function generateDivisibilityQuestion(
  mode: DivisibilityMode,
  id: number,
  optionCount: number,
): DivisibilityQuestion {
  // 两类题约各半
  if (Math.random() < 0.5) return genDivisibilityCheck(id, optionCount, mode)
  return genPrimeComposite(id, optionCount, mode)
}

export function isDivisibilityMode(mode: string): mode is DivisibilityMode {
  return (
    mode === 'divisibility-easy' ||
    mode === 'divisibility-distractor' ||
    mode === 'divisibility-normal' ||
    mode === 'divisibility-hard'
  )
}
