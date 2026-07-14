/** 整除及其性质：整除判定、质合数与质因数分解、公因数与公倍数（本地出题） */

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
    durationSec: 30,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '30 秒 · 整除判定（3/9/6）· 质合数入门 · 小公因数 · 3 选项 · 对 +5 / 错 -10 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-distractor',
    label: '简单题（干扰型）',
    durationSec: 30,
    optionCount: 3,
    correctDelta: 7,
    wrongDelta: -14,
    maxScore: 100,
    desc: '30 秒 · 与简单题同考点 · 干扰更强（易混整除陷阱、GCD/LCM 对调、错指数分解等）· 3 选项 · 对 +7 / 错 -14 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 整除判定（含 7/11）· 质因数分解 · 公倍数 · 4 选项 · 对 +8 / 错 -15 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'divisibility-hard',
    label: '高难题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 较大数整除/质因数 · GCD/LCM 综合 · 5 选项 · 对 +10 / 错 -20 · 对 +1 秒 / 错 -1 秒',
  },
]

export type DivisibilityQuestion = {
  id: number
  expression: string
  correctAnswer: string | number
  options: (string | number)[]
  correctIndex: number
}

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

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

/** 质因数分解标准写法，如 2²×3×5 */
function formatPrimeFactorization(n: number): string {
  if (n < 2) return String(n)
  const parts: string[] = []
  let x = n
  let p = 2
  while (p * p <= x) {
    if (x % p === 0) {
      let exp = 0
      while (x % p === 0) {
        x /= p
        exp++
      }
      parts.push(exp === 1 ? String(p) : `${p}^${exp}`)
    }
    p = p === 2 ? 3 : p + 2
  }
  if (x > 1) parts.push(String(x))
  return parts.join('×')
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
const EASY_COMPOSITES = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 28]
const NORMAL_FACTOR_NS = [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 54, 56, 60, 63, 72, 75, 84, 90]
const HARD_FACTOR_NS = [
  96, 108, 120, 126, 132, 140, 144, 150, 168, 180, 196, 210, 216, 240, 252, 280, 315, 336, 360,
]

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

/** 强干扰：满足整除判定中某一条、却不满足完整条件（尤其 6=2∧3） */
function makeNearMissNotDivisibleBy(d: number, min: number, max: number): number {
  for (let t = 0; t < 60; t++) {
    const n = randInt(min, max)
    if (n % d === 0) continue
    if (d === 6) {
      const even = n % 2 === 0
      const by3 = digitSum(n) % 3 === 0
      if (even !== by3) return n // 只满足一半
    } else if (d === 9) {
      if (digitSum(n) % 3 === 0 && digitSum(n) % 9 !== 0) return n // 能被 3 不能被 9
    } else if (d === 3) {
      if (Math.abs(digitSum(n) % 3 - 0) === 1 || n % 9 === 0) return n
    } else if (d === 11) {
      const alt = Math.abs(altDigitSum(n))
      if (alt === 1 || alt === 10 || alt === 12) return n // 交替和接近 0/11
    } else if (d === 7) {
      if (n % 7 === 1 || n % 7 === 6) return n // 余 1 或接近
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
  return 'easy' // easy + distractor 用量纲接近简单/略扩
}

function genDivisibilityCheck(
  id: number,
  optionCount: number,
  mode: DivisibilityMode,
): DivisibilityQuestion {
  const strong = isStrongDistract(mode)
  const band = modeBand(mode)
  const divisors =
    band === 'easy' && !strong
      ? ([3, 9, 6] as const)
      : ([3, 9, 6, 7, 11] as const)
  const d = pickFrom([...divisors])
  const range =
    band === 'easy' ? [12, 99] : band === 'normal' ? [40, 399] : [100, 999]

  const style = Math.random()
  if (style < 0.5) {
    const correct = makeNumberDivisibleBy(d, range[0]!, range[1]!, true)
    const wrongs: number[] = []
    while (wrongs.length < optionCount - 1) {
      const w = strong
        ? makeNearMissNotDivisibleBy(d, range[0]!, range[1]!)
        : makeNumberDivisibleBy(d, range[0]!, range[1]!, false)
      if (!wrongs.includes(w) && w !== correct) wrongs.push(w)
    }
    return buildMcq({
      id,
      expression: `下列哪个数能被 ${d} 整除？`,
      correct,
      distractors: wrongs,
    })
  }

  if (style < 0.78) {
    const yes = Math.random() < 0.5
    const n = strong && !yes
      ? makeNearMissNotDivisibleBy(d, range[0]!, range[1]!)
      : makeNumberDivisibleBy(d, range[0]!, range[1]!, yes)
    const actually = n % d === 0
    const correct = actually ? '能' : '不能'
    const distractors = strong
      ? fillDistractors(correct, optionCount - 1, [
          actually ? '不能' : '能',
          d === 6 ? '能被 2 整除即可' : '看个位即可',
          d === 9 ? '能被 3 整除即可' : '余数不为 0 也能整除',
          '无法判断',
        ])
      : fillDistractors(correct, optionCount - 1, ['能', '不能', '无法判断', '不一定'])
    return buildMcq({
      id,
      expression: `${n} 能否被 ${d} 整除？`,
      correct,
      distractors,
    })
  }

  if (d === 3 || d === 9) {
    const n = makeNumberDivisibleBy(d, range[0]!, range[1]!, Math.random() < 0.5)
    const sum = digitSum(n)
    const correct = sum
    const distractors = fillDistractors(
      correct,
      optionCount - 1,
      strong
        ? [sum + 9, sum - 9 || sum + 3, n % 10, digitSum(n + 9), Math.floor(n / 10) % 10 + (n % 10)]
        : [sum + 1, sum - 1, sum + 3, sum + 9, digitSum(n + 1), n % 10],
    )
    return buildMcq({
      id,
      expression: `判断 ${n} 能否被 ${d} 整除时，各位数字之和是？`,
      correct,
      distractors,
    })
  }

  if (d === 11) {
    const n = makeNumberDivisibleBy(11, Math.max(100, range[0]!), range[1]!, Math.random() < 0.55)
    const correct = n % 11 === 0 ? '能' : '不能'
    return buildMcq({
      id,
      expression: `用「奇偶位数字交替和」法判断：${n} 能否被 11 整除？`,
      correct,
      distractors: fillDistractors(correct, optionCount - 1, [
        correct === '能' ? '不能' : '能',
        '交替和为 1 就能整除',
        '看个位是 1 即可',
        '无法判断',
      ]),
    })
  }

  const n = makeNumberDivisibleBy(d, range[0]!, range[1]!, true)
  return buildMcq({
    id,
    expression: `${n} ÷ ${d} 的商是整数。下列说法正确的是？`,
    correct: `${n} 能被 ${d} 整除`,
    distractors: fillDistractors(`${n} 能被 ${d} 整除`, optionCount - 1, [
      `${n} 不能被 ${d} 整除`,
      `${d} 能被 ${n} 整除`,
      `${n} 是 ${d} 的约数`,
      strong ? `${n} 与 ${d} 互质` : `${n + d} 不能被 ${d} 整除`,
    ]),
  })
}

function strongFactorizationWrongs(n: number, correct: string): string[] {
  const wrongs: string[] = []
  const bump = correct.replace(/\^(\d+)/g, (_, e) => `^${Number(e) + 1}`)
  const drop = correct.replace(/\^(\d+)/g, (_, e) => (Number(e) <= 2 ? '' : `^${Number(e) - 1}`)).replace(/××/g, '×').replace(/^×|×$/g, '')
  if (bump !== correct) wrongs.push(bump)
  if (drop && drop !== correct) wrongs.push(drop.replace(/\^1/g, '').replace(/×+/g, '×'))
  // 把某个质因数改成相邻质数
  wrongs.push(correct.replace(/3/, '5').replace(/2/, '3'))
  wrongs.push(formatPrimeFactorization(n * 2))
  wrongs.push(formatPrimeFactorization(Math.max(4, Math.floor(n / 2))))
  wrongs.push(`${n}`)
  // 写成连乘但漏指数含义：2×2×3 等价错误展示
  if (n % 4 === 0) wrongs.push(correct.replace('2^2', '2×2'))
  return wrongs.filter((w) => w && w !== correct)
}

function genPrimeComposite(id: number, optionCount: number, mode: DivisibilityMode): DivisibilityQuestion {
  const strong = isStrongDistract(mode)
  const band = modeBand(mode)
  const style = Math.random()
  if (style < 0.4) {
    const correct = pickFrom(SMALL_PRIMES.filter((p) => (band === 'easy' ? p <= 19 : p <= 31)))
    const wrongPool = strong
      ? [1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 77, 87, 91]
      : band === 'easy'
        ? EASY_COMPOSITES
        : [...EASY_COMPOSITES, 32, 33, 34, 35, 38, 39, 44, 45, 49, 51]
    return buildMcq({
      id,
      expression: '下列哪个数是质数？',
      correct,
      distractors: fillDistractors(correct, optionCount - 1, wrongPool),
    })
  }

  if (style < 0.7) {
    const correct = pickFrom(
      band === 'hard'
        ? [...EASY_COMPOSITES, 33, 34, 35, 38, 39, 44, 45, 49, 51, 55, 57]
        : EASY_COMPOSITES,
    )
    const wrongPool = strong
      ? [...SMALL_PRIMES, 1]
      : SMALL_PRIMES.concat(band === 'easy' ? [1] : [1, 91])
    return buildMcq({
      id,
      expression: '下列哪个数是合数？',
      correct,
      distractors: fillDistractors(correct, optionCount - 1, wrongPool),
    })
  }

  if (Math.random() < 0.35 && band !== 'hard') {
    return buildMcq({
      id,
      expression: '关于数字 1，下列说法正确的是？',
      correct: '既不是质数也不是合数',
      distractors: fillDistractors('既不是质数也不是合数', optionCount - 1, [
        '是质数',
        '是合数',
        '既是质数又是合数',
        '是偶数质数',
      ]),
    })
  }

  const pool =
    band === 'easy'
      ? NORMAL_FACTOR_NS.filter((n) => n <= 36)
      : band === 'normal'
        ? NORMAL_FACTOR_NS
        : HARD_FACTOR_NS
  const n = pickFrom(pool)
  const correct = formatPrimeFactorization(n)
  const wrongForms = strong
    ? strongFactorizationWrongs(n, correct)
    : [
        formatPrimeFactorization(n + 2),
        formatPrimeFactorization(Math.max(4, n - 2)),
        formatPrimeFactorization(n * 2 > 400 ? Math.floor(n / 2) || 4 : n * 2),
        String(n),
        `${n}=${n}`,
        correct.replace(/\^(\d+)/, (_, e) => `^${Number(e) + 1}`),
      ]
  return buildMcq({
    id,
    expression: `${n} 的质因数分解是？`,
    correct,
    distractors: fillDistractors(correct, optionCount - 1, wrongForms),
  })
}

function genGcdLcm(id: number, optionCount: number, mode: DivisibilityMode): DivisibilityQuestion {
  const strong = isStrongDistract(mode)
  const band = modeBand(mode)
  const ranges =
    band === 'easy'
      ? { a: [4, 24], b: [4, 24] }
      : band === 'normal'
        ? { a: [6, 48], b: [6, 48] }
        : { a: [12, 90], b: [12, 90] }

  let a = randInt(ranges.a[0]!, ranges.a[1]!)
  let b = randInt(ranges.b[0]!, ranges.b[1]!)
  if (a === b) b += 2
  if (Math.random() < 0.55) {
    const g =
      band === 'easy' ? pickFrom([2, 3, 4, 5, 6]) : pickFrom([2, 3, 4, 5, 6, 7, 8, 9])
    a = g * randInt(2, band === 'hard' ? 12 : 8)
    b = g * randInt(2, band === 'hard' ? 12 : 8)
    if (a === b) b += g
  }

  const askGcd = Math.random() < 0.55
  const g = gcd(a, b)
  const l = lcm(a, b)
  // 非最大的公因数，用于强干扰
  const properFactors: number[] = []
  for (let i = 1; i < g; i++) {
    if (a % i === 0 && b % i === 0) properFactors.push(i)
  }

  if (askGcd) {
    const correct = g
    const distractors = fillDistractors(
      correct,
      optionCount - 1,
      strong
        ? [l, a * b, Math.min(a, b), ...properFactors, Math.floor(l / 2) || l + a]
        : [l, a, b, correct + 1, Math.max(1, correct - 1), gcd(a, b + 1), a + b, Math.min(a, b)],
    )
    return buildMcq({
      id,
      expression: `${a} 和 ${b} 的最大公约数是？`,
      correct,
      distractors,
    })
  }

  const correct = l
  const distractors = fillDistractors(
    correct,
    optionCount - 1,
    strong
      ? [g, a * b, Math.max(a, b), a + b, Math.floor((a * b) / Math.max(1, g * 2))]
      : [g, a * b, a + b, Math.max(a, b), correct + a, correct - b, (a * b) / Math.max(1, g * 2)],
  )
  return buildMcq({
    id,
    expression: `${a} 和 ${b} 的最小公倍数是？`,
    correct,
    distractors,
  })
}

export function generateDivisibilityQuestion(
  mode: DivisibilityMode,
  id: number,
  optionCount: number,
): DivisibilityQuestion {
  const roll = Math.random()
  // 题型比重：整除判定约 40%，质合数/分解约 30%，GCD/LCM 约 30%
  if (roll < 0.4) return genDivisibilityCheck(id, optionCount, mode)
  if (roll < 0.7) return genPrimeComposite(id, optionCount, mode)
  return genGcdLcm(id, optionCount, mode)
}

export function isDivisibilityMode(mode: string): mode is DivisibilityMode {
  return (
    mode === 'divisibility-easy' ||
    mode === 'divisibility-distractor' ||
    mode === 'divisibility-normal' ||
    mode === 'divisibility-hard'
  )
}
