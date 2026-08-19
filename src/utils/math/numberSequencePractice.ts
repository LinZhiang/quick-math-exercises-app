/**
 * 口算·数列：找下一项；每题只考一个考点（等差/等比/机械/分数/多次方/质数/组合/数字排序/运算关系）。
 * 简单/复杂仅数字规模与参数难度不同。分数项用 (n)/(d) 以便渲染成上下分式。
 */

export type NumberSequenceMode = 'number-sequence-easy' | 'number-sequence-hard'

export type NumberSequenceModeConfig = {
  id: NumberSequenceMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const NUMBER_SEQUENCE_MODES: NumberSequenceModeConfig[] = [
  {
    id: 'number-sequence-easy',
    label: '简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 12,
    wrongDelta: -24,
    maxScore: 100,
    desc: '30 秒 · 找下一项（等差/等比/机械/质数等基础考点）· 4 选项 · 对 +12 / 错 −24',
  },
  {
    id: 'number-sequence-hard',
    label: '复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 16,
    wrongDelta: -32,
    maxScore: 100,
    desc: '40 秒 · 含分数/多次方/组合/排序/运算等进阶考点，数字更大 · 5 选项 · 对 +16 / 错 −32',
  },
]

export type NumberSequenceKind =
  | 'arithmetic'
  | 'geometric'
  | 'mechanical'
  | 'fraction'
  | 'power'
  | 'prime'
  | 'combine'
  | 'digit-sort'
  | 'op-relation'

export type NumberSequenceQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
  kind: NumberSequenceKind
}

const KIND_LABEL: Record<NumberSequenceKind, string> = {
  arithmetic: '等差数列',
  geometric: '等比数列',
  mechanical: '机械数列',
  fraction: '分数数列',
  power: '多次方数列',
  prime: '质数数列',
  combine: '组合数列',
  'digit-sort': '数字排序',
  'op-relation': '运算关系',
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

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function simplifyFrac(n: number, d: number): { n: number; d: number } {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

/** 整数或最简分数的展示串（分数用上下结构标记） */
function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return String(n)
}

function fmtFrac(n: number, d: number): string {
  const s = simplifyFrac(n, d)
  if (s.d === 1) return String(s.n)
  return `(${s.n})/(${s.d})`
}

function joinSeq(terms: string[]): string {
  return `${terms.join('，')}，？`
}

function buildOptions(
  correct: string,
  wrongs: string[],
  optionCount: number,
): { options: string[]; correctIndex: number } {
  const need = Math.max(1, optionCount - 1)
  const uniq = [...new Set(wrongs.map((w) => w.trim()).filter((w) => w && w !== correct))]
  while (uniq.length < need) {
    uniq.push(`干扰${uniq.length + 1}`)
  }
  const options = shuffle([correct, ...shuffle(uniq).slice(0, need)])
  const correctIndex = options.findIndex((x) => x === correct)
  return { options, correctIndex: correctIndex >= 0 ? correctIndex : 0 }
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]

function genArithmetic(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  const len = hard ? randInt(5, 6) : randInt(4, 5)
  const d = hard ? (randInt(0, 1) ? randInt(6, 14) : -randInt(6, 14)) : randInt(1, 5)
  const a = hard ? randInt(12, 60) : randInt(1, 20)
  const nums: number[] = []
  for (let i = 0; i < len; i++) nums.push(a + i * d)
  const correct = fmtNum(a + len * d)
  const wrongs = [
    fmtNum(a + (len + 1) * d),
    fmtNum(a + len * d + (d > 0 ? 1 : -1)),
    fmtNum(a + len * d - d),
    fmtNum(a + len * (d + (d > 0 ? 1 : -1))),
    fmtNum(nums[nums.length - 1]! + d * 2),
  ]
  const shown = nums.map(fmtNum)
  const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
  return {
    expression: joinSeq(shown),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'arithmetic',
    explanation: `${KIND_LABEL.arithmetic}：公差 d=${d}，下一项 = ${nums[nums.length - 1]}+${d}=${correct}。`,
  }
}

function genGeometric(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  const r = hard ? pick([2, 3, 4, 5]) : pick([2, 3])
  const a = hard ? randInt(2, 8) : randInt(1, 5)
  const len = hard ? 4 : 3
  const nums: number[] = []
  let cur = a
  for (let i = 0; i < len; i++) {
    nums.push(cur)
    cur *= r
  }
  const correct = fmtNum(cur)
  const wrongs = [
    fmtNum(cur * r),
    fmtNum(cur + r),
    fmtNum(cur / r),
    fmtNum(nums[nums.length - 1]! * (r + 1)),
    fmtNum(a * r ** (len + 1) + 1),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
  return {
    expression: joinSeq(nums.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'geometric',
    explanation: `${KIND_LABEL.geometric}：公比 r=${r}，下一项 = ${nums[nums.length - 1]}×${r}=${correct}。`,
  }
}

function isMonotoneTriple(a: number, b: number, c: number): boolean {
  return (a < b && b < c) || (a > b && b > c)
}

function genMechanical(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  if (!hard) {
    if (randInt(0, 1) === 0) {
      const x = randInt(1, 9)
      const y = randInt(1, 9)
      if (x === y) return genMechanical(hard)
      const len = 5
      const nums: number[] = []
      for (let i = 0; i < len; i++) nums.push(i % 2 === 0 ? x : y)
      const correct = fmtNum(len % 2 === 0 ? x : y)
      const wrongs = [fmtNum(x), fmtNum(y), fmtNum(x + 1), fmtNum(y + 1), fmtNum(x + y)]
      const { options, correctIndex } = buildOptions(correct, wrongs, 4)
      return {
        expression: joinSeq(nums.map(fmtNum)),
        correctAnswer: correct,
        options,
        correctIndex,
        kind: 'mechanical',
        explanation: `${KIND_LABEL.mechanical}：${x} 与 ${y} 交替出现，下一项是 ${correct}。`,
      }
    }
    const a = randInt(1, 6)
    const b = a + randInt(1, 3)
    const c = b + randInt(1, 3)
    const cycle = [a, b, c]
    const len = 5
    const nums: number[] = []
    for (let i = 0; i < len; i++) nums.push(cycle[i % 3]!)
    const correct = fmtNum(cycle[len % 3]!)
    const wrongs = cycle.map(fmtNum).concat([fmtNum(a + 1), fmtNum(c + 1)])
    const { options, correctIndex } = buildOptions(correct, wrongs, 4)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'mechanical',
      explanation: `${KIND_LABEL.mechanical}：${a}、${b}、${c} 循环，下一项是 ${correct}。`,
    }
  }

  // 复杂题：只出交替/分组重复，禁止「从小到大再循环」这类排序感
  const style = randInt(0, 2)
  if (style === 0) {
    const x = randInt(10, 40)
    let y = randInt(10, 40)
    while (y === x) y = randInt(10, 40)
    const len = 6
    const nums: number[] = []
    for (let i = 0; i < len; i++) nums.push(i % 2 === 0 ? x : y)
    const correct = fmtNum(len % 2 === 0 ? x : y)
    const wrongs = [fmtNum(x), fmtNum(y), fmtNum(x + 1), fmtNum(y + 1), fmtNum(x + y)]
    const { options, correctIndex } = buildOptions(correct, wrongs, 5)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'mechanical',
      explanation: `${KIND_LABEL.mechanical}：${x} 与 ${y} 交替出现，下一项是 ${correct}。`,
    }
  }
  if (style === 1) {
    let a = randInt(5, 28)
    let b = randInt(5, 28)
    let c = randInt(5, 28)
    let guard = 0
    while ((new Set([a, b, c]).size < 3 || isMonotoneTriple(a, b, c)) && guard < 24) {
      a = randInt(5, 28)
      b = randInt(5, 28)
      c = randInt(5, 28)
      guard += 1
    }
    if (isMonotoneTriple(a, b, c)) {
      const tmp = a
      a = c
      c = tmp
    }
    const cycle = [a, b, c]
    const len = 7
    const nums: number[] = []
    for (let i = 0; i < len; i++) nums.push(cycle[i % 3]!)
    const correct = fmtNum(cycle[len % 3]!)
    const wrongs = cycle.map(fmtNum).concat([fmtNum(a + 1), fmtNum(c + 1)])
    const { options, correctIndex } = buildOptions(correct, wrongs, 5)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'mechanical',
      explanation: `${KIND_LABEL.mechanical}：${a}、${b}、${c} 循环出现，下一项是 ${correct}。`,
    }
  }
  const a = randInt(8, 30)
  let b = randInt(8, 30)
  while (b === a) b = randInt(8, 30)
  const pairFirst = randInt(0, 1) === 0
  const cycle = pairFirst ? [a, a, b] : [a, b, b]
  const len = 7
  const nums: number[] = []
  for (let i = 0; i < len; i++) nums.push(cycle[i % 3]!)
  const correct = fmtNum(cycle[len % 3]!)
  const wrongs = [fmtNum(a), fmtNum(b), fmtNum(a + 1), fmtNum(b + 1), fmtNum(a + b)]
  const { options, correctIndex } = buildOptions(correct, wrongs, 5)
  return {
    expression: joinSeq(nums.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'mechanical',
    explanation: pairFirst
      ? `${KIND_LABEL.mechanical}：${a}、${a}、${b} 成组重复，下一项是 ${correct}。`
      : `${KIND_LABEL.mechanical}：${a}、${b}、${b} 成组重复，下一项是 ${correct}。`,
  }
}

function genFraction(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  const variant = hard ? randInt(0, 2) : randInt(0, 1)
  if (variant === 0) {
    // 1/2, 1/3, 1/4, 1/5 → 1/6
    const start = hard ? randInt(2, 5) : 2
    const len = hard ? 5 : 4
    const terms: string[] = []
    for (let i = 0; i < len; i++) terms.push(fmtFrac(1, start + i))
    const correct = fmtFrac(1, start + len)
    const wrongs = [
      fmtFrac(1, start + len + 1),
      fmtFrac(1, start + len - 1),
      fmtFrac(2, start + len),
      fmtNum(start + len),
      fmtFrac(1, start * 2),
    ]
    const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
    return {
      expression: joinSeq(terms),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'fraction',
      explanation: `${KIND_LABEL.fraction}：分子为 1，分母依次 +1，下一项是 ${correct}。`,
    }
  }
  if (variant === 1) {
    // 1/2, 2/3, 3/4, 4/5 → 5/6
    const start = hard ? randInt(2, 4) : 1
    const len = hard ? 5 : 4
    const terms: string[] = []
    for (let i = 0; i < len; i++) {
      const n = start + i
      terms.push(fmtFrac(n, n + 1))
    }
    const n = start + len
    const correct = fmtFrac(n, n + 1)
    const wrongs = [
      fmtFrac(n + 1, n + 2),
      fmtFrac(n, n + 2),
      fmtFrac(n - 1, n),
      fmtNum(n),
      fmtFrac(1, n + 1),
    ]
    const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
    return {
      expression: joinSeq(terms),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'fraction',
      explanation: `${KIND_LABEL.fraction}：形如 n/(n+1) 递增，下一项是 ${correct}。`,
    }
  }
  // hard only: 1/2, 1/4, 1/8, 1/16 → 1/32
  const len = 4
  const terms: string[] = []
  for (let i = 1; i <= len; i++) terms.push(fmtFrac(1, 2 ** i))
  const correct = fmtFrac(1, 2 ** (len + 1))
  const wrongs = [
    fmtFrac(1, 2 ** (len + 2)),
    fmtFrac(1, 2 ** len),
    fmtFrac(1, 2 ** len + 2),
    fmtNum(2 ** (len + 1)),
    fmtFrac(2, 2 ** (len + 1)),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, 5)
  return {
    expression: joinSeq(terms),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'fraction',
    explanation: `${KIND_LABEL.fraction}：分母按 2 的幂递增，下一项是 ${correct}。`,
  }
}

function genPower(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  if (!hard || randInt(0, 1) === 0) {
    // 平方：1,4,9,16,?
    const start = hard ? randInt(3, 6) : 1
    const len = hard ? 5 : 4
    const nums: number[] = []
    for (let i = 0; i < len; i++) {
      const n = start + i
      nums.push(n * n)
    }
    const nextN = start + len
    const correct = fmtNum(nextN * nextN)
    const wrongs = [
      fmtNum((nextN + 1) * (nextN + 1)),
      fmtNum(nextN * nextN + nextN),
      fmtNum(nums[nums.length - 1]! + 2 * nextN - 1 + 2),
      fmtNum(nextN * nextN - 1),
      fmtNum(nextN * nextN * nextN),
    ]
    const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'power',
      explanation: `${KIND_LABEL.power}：连续整数的平方，下一项是 ${nextN}²=${correct}。`,
    }
  }
  // 立方：1,8,27,64,?
  const start = randInt(1, 3)
  const len = 4
  const nums: number[] = []
  for (let i = 0; i < len; i++) {
    const n = start + i
    nums.push(n * n * n)
  }
  const nextN = start + len
  const correct = fmtNum(nextN * nextN * nextN)
  const wrongs = [
    fmtNum((nextN + 1) ** 3),
    fmtNum(nextN * nextN),
    fmtNum(nums[nums.length - 1]! + nextN * nextN),
    fmtNum(nextN ** 3 + 1),
    fmtNum((nextN - 1) ** 3),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, 5)
  return {
    expression: joinSeq(nums.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'power',
    explanation: `${KIND_LABEL.power}：连续整数的立方，下一项是 ${nextN}³=${correct}。`,
  }
}

function genPrime(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  const start = hard ? randInt(3, 8) : 0
  const len = hard ? 5 : 4
  const slice = PRIMES.slice(start, start + len)
  const correct = fmtNum(PRIMES[start + len]!)
  const wrongs = [
    fmtNum(PRIMES[start + len + 1]!),
    fmtNum(PRIMES[start + len]! + 1),
    fmtNum(PRIMES[start + len]! - 1),
    fmtNum(slice[slice.length - 1]! + 2),
    fmtNum(PRIMES[start + len]! + 2),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
  return {
    expression: joinSeq(slice.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'prime',
    explanation: `${KIND_LABEL.prime}：质数依次排列，下一项是 ${correct}。`,
  }
}

function genCombine(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  // 斐波那契型：每项=前两项之和
  let a = hard ? randInt(2, 8) : 1
  let b = hard ? randInt(3, 10) : 1
  const len = hard ? 6 : 5
  const nums: number[] = [a, b]
  for (let i = 2; i < len; i++) {
    const n = a + b
    nums.push(n)
    a = b
    b = n
  }
  const correct = fmtNum(a + b)
  const wrongs = [
    fmtNum(a + b + 1),
    fmtNum(b + b),
    fmtNum(a + a),
    fmtNum(nums[nums.length - 1]! + nums[nums.length - 2]! - 1),
    fmtNum(nums[nums.length - 1]! * 2),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
  return {
    expression: joinSeq(nums.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'combine',
    explanation: `${KIND_LABEL.combine}：从第三项起，每项等于前两项之和，下一项是 ${nums[nums.length - 2]}+${nums[nums.length - 1]}=${correct}。`,
  }
}

function genDigitSort(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  // 三位数数字全排列按字典序
  const digits = hard
    ? shuffle([randInt(1, 4), randInt(5, 7), randInt(8, 9)]).slice(0, 3)
    : [1, 2, 3]
  const [x, y, z] = [...digits].sort((a, b) => a - b)
  const perms = [
    `${x}${y}${z}`,
    `${x}${z}${y}`,
    `${y}${x}${z}`,
    `${y}${z}${x}`,
    `${z}${x}${y}`,
    `${z}${y}${x}`,
  ]
  const start = hard ? randInt(0, 1) : 0
  const len = hard ? 4 : 3
  const shown = perms.slice(start, start + len)
  const correct = perms[start + len]!
  const wrongs = perms.filter((p) => p !== correct).slice(0, 5)
  const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
  return {
    expression: joinSeq(shown),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'digit-sort',
    explanation: `${KIND_LABEL['digit-sort']}：由数字 ${x}、${y}、${z} 组成的三位数按字典序排列，下一项是 ${correct}。`,
  }
}

function genOpRelation(hard: boolean): Omit<NumberSequenceQuestion, 'id'> {
  const variant = hard ? randInt(0, 2) : randInt(0, 1)
  if (variant === 0) {
    // ×2+1
    let cur = hard ? randInt(3, 8) : randInt(2, 5)
    const len = hard ? 4 : 3
    const nums: number[] = []
    for (let i = 0; i < len; i++) {
      nums.push(cur)
      cur = cur * 2 + 1
    }
    const correct = fmtNum(cur)
    const wrongs = [
      fmtNum(cur + 1),
      fmtNum(cur - 1),
      fmtNum(nums[nums.length - 1]! * 2),
      fmtNum(nums[nums.length - 1]! * 2 + 2),
      fmtNum(cur * 2 + 1),
    ]
    const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'op-relation',
      explanation: `${KIND_LABEL['op-relation']}：后项 = 前项×2+1，下一项是 ${nums[nums.length - 1]}×2+1=${correct}。`,
    }
  }
  if (variant === 1) {
    // ×3−1
    let cur = hard ? randInt(2, 5) : randInt(2, 4)
    const len = hard ? 4 : 3
    const nums: number[] = []
    for (let i = 0; i < len; i++) {
      nums.push(cur)
      cur = cur * 3 - 1
    }
    const correct = fmtNum(cur)
    const wrongs = [
      fmtNum(cur + 1),
      fmtNum(nums[nums.length - 1]! * 3),
      fmtNum(nums[nums.length - 1]! * 3 + 1),
      fmtNum(cur - 2),
      fmtNum(nums[nums.length - 1]! + 3),
    ]
    const { options, correctIndex } = buildOptions(correct, wrongs, hard ? 5 : 4)
    return {
      expression: joinSeq(nums.map(fmtNum)),
      correctAnswer: correct,
      options,
      correctIndex,
      kind: 'op-relation',
      explanation: `${KIND_LABEL['op-relation']}：后项 = 前项×3−1，下一项是 ${nums[nums.length - 1]}×3−1=${correct}。`,
    }
  }
  // hard: +质数递推 或 ×2−3
  let cur = randInt(5, 12)
  const len = 4
  const nums: number[] = []
  for (let i = 0; i < len; i++) {
    nums.push(cur)
    cur = cur * 2 - 3
  }
  const correct = fmtNum(cur)
  const wrongs = [
    fmtNum(cur + 1),
    fmtNum(nums[nums.length - 1]! * 2),
    fmtNum(nums[nums.length - 1]! * 2 - 1),
    fmtNum(cur - 3),
    fmtNum(nums[nums.length - 1]! + 2),
  ]
  const { options, correctIndex } = buildOptions(correct, wrongs, 5)
  return {
    expression: joinSeq(nums.map(fmtNum)),
    correctAnswer: correct,
    options,
    correctIndex,
    kind: 'op-relation',
    explanation: `${KIND_LABEL['op-relation']}：后项 = 前项×2−3，下一项是 ${nums[nums.length - 1]}×2−3=${correct}。`,
  }
}

/** 简单题只保留基础考点；复杂题覆盖全部九类 */
const EASY_KINDS: NumberSequenceKind[] = [
  'arithmetic',
  'geometric',
  'mechanical',
  'prime',
]

const HARD_KINDS: NumberSequenceKind[] = [
  'arithmetic',
  'geometric',
  'mechanical',
  'fraction',
  'fraction',
  'power',
  'power',
  'prime',
  'combine',
  'digit-sort',
  'digit-sort',
  'op-relation',
]

function pickKind(hard: boolean): NumberSequenceKind {
  return hard ? pick(HARD_KINDS) : pick(EASY_KINDS)
}

function generateByKind(
  kind: NumberSequenceKind,
  hard: boolean,
): Omit<NumberSequenceQuestion, 'id'> {
  switch (kind) {
    case 'arithmetic':
      return genArithmetic(hard)
    case 'geometric':
      return genGeometric(hard)
    case 'mechanical':
      return genMechanical(hard)
    case 'fraction':
      return genFraction(hard)
    case 'power':
      return genPower(hard)
    case 'prime':
      return genPrime(hard)
    case 'combine':
      return genCombine(hard)
    case 'digit-sort':
      return genDigitSort(hard)
    case 'op-relation':
      return genOpRelation(hard)
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export function generateNumberSequenceQuestion(
  mode: NumberSequenceMode,
  id: number,
  optionCount: number,
  _avoidFingerprints: Set<string> = new Set(),
): NumberSequenceQuestion {
  const hard = mode === 'number-sequence-hard'
  let last: Omit<NumberSequenceQuestion, 'id'> | null = null
  for (let attempt = 0; attempt < 8; attempt++) {
    const kind = pickKind(hard)
    const q = generateByKind(kind, hard)
    // 选项数不足时补生成
    if (q.options.length >= optionCount) {
      last = {
        ...q,
        options: q.options.slice(0, optionCount),
        correctIndex: q.options.slice(0, optionCount).indexOf(q.correctAnswer),
      }
      if (last.correctIndex < 0) {
        const rebuilt = buildOptions(q.correctAnswer, q.options.filter((o) => o !== q.correctAnswer), optionCount)
        last = { ...q, ...rebuilt }
      }
      break
    }
    last = q
  }
  const base = last ?? generateByKind('arithmetic', hard)
  const rebuilt = buildOptions(
    base.correctAnswer,
    base.options.filter((o) => o !== base.correctAnswer),
    optionCount,
  )
  return {
    id,
    expression: base.expression,
    correctAnswer: base.correctAnswer,
    options: rebuilt.options,
    correctIndex: rebuilt.correctIndex,
    explanation: base.explanation,
    kind: base.kind,
  }
}

export function isNumberSequenceMode(mode: string): mode is NumberSequenceMode {
  return mode === 'number-sequence-easy' || mode === 'number-sequence-hard'
}

export function getNumberSequenceModeConfig(mode: NumberSequenceMode): NumberSequenceModeConfig {
  const hit = NUMBER_SEQUENCE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知数列模式: ${mode}`)
  return hit
}
