/**
 * 运算技巧 · 整除及其性质 · 质数与合数
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。
 *
 * 【困难题型库 · 对齐经典真题 2，登记 7 种；每轮抽 6 种且互不重复】
 * 1. abc-from-sums：a+b+c 与 ab+bc+ac 求 abc（经典）
 * 2. bc-from-sums：同上条件求 bc（或 ab）
 * 3. sum-squares：求 a²+b²+c²
 * 4. must-have-two：由奇偶性判断必含质数 2
 * 5. find-primes：由 a+b+c 与 abc 还原三个质数
 * 6. pair-sum-from-abc：由 a+b+c 与 abc（其一为 2）求 ab+bc+ac
 * 7. which-is-two：给出三质数及相关式，问哪一个是 2
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type PrimeCompDifficulty = 'easy' | 'medium' | 'hard'

export const PRIME_COMP_QUESTION_COUNT = 6

export const PRIME_COMP_MODES: {
  id: PrimeCompDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '质数与合数 · 简单',
    desc: '每轮 6 题 · 小数内质合判断 · 简单质因数分解 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '质数与合数 · 普通',
    desc: '每轮 6 题 · 易混合数/质数 · 短除法分解 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '质数与合数 · 困难',
    desc: '每轮 6 题 · 对齐经典真题 2 的 7 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PRIME_COMP_HARD_EXAM_TYPES = [
  {
    id: 'abc-from-sums',
    name: '三质数求积 abc（经典真题 2）',
    note: 'a+b+c 与 ab+bc+ac 已知，用「和为偶⇒含 2」求 abc',
  },
  {
    id: 'bc-from-sums',
    name: '求两质数之积 bc',
    note: '同经典条件，问 bc（或 ab）',
  },
  {
    id: 'sum-squares',
    name: '求 a²+b²+c²',
    note: '用 (a+b+c)²−2(ab+bc+ac)',
  },
  {
    id: 'must-have-two',
    name: '奇偶性必含 2',
    note: '三质数之和为偶数 ⇒ 必有一个是 2',
  },
  {
    id: 'find-primes',
    name: '由和与积还原三质数',
    note: '已知 a+b+c 与 abc，写出三个质数',
  },
  {
    id: 'pair-sum-from-abc',
    name: '由和与积求两两积之和',
    note: '已知 a+b+c、abc（含 2），求 ab+bc+ac',
  },
  {
    id: 'which-is-two',
    name: '判断哪个是 2',
    note: '材料给出三质数与和/积关系，问哪一个必为 2',
  },
] as const

export type PrimeCompHardTypeId = (typeof PRIME_COMP_HARD_EXAM_TYPES)[number]['id']

export type PrimeCompQuestion = {
  id: string
  topic: 'prime-comp'
  difficulty: PrimeCompDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: PrimeCompHardTypeId
}

export function primeCompTopicLabel(): string {
  return '质数与合数'
}

export function primeCompDifficultyLabel(d: PrimeCompDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function isPrime(n: number): boolean {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
}

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
const MED_PRIMES = [
  ...SMALL_PRIMES,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
]

/** 常见易混合数 */
const TRAP_COMPOSITES = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 65, 77, 85, 87, 91, 93, 95]

function factorize(n: number): number[] {
  const factors: number[] = []
  let x = n
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factors.push(p)
      x = Math.floor(x / p)
    }
  }
  if (x > 1) factors.push(x)
  return factors
}

function formatFactorization(factors: number[]): string {
  const counts = new Map<number, number>()
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e}`))
    .join('×')
}

function buildQ(input: {
  difficulty: PrimeCompDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: PrimeCompHardTypeId
  seq: number
}): PrimeCompQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'prime-comp',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `prime-comp-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'prime-comp',
    difficulty: input.difficulty,
    term: input.term,
    passage: (input.passage ?? '').trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method,
    explanation: input.explanation.trim(),
    fingerprint,
    hardTypeId: input.hardTypeId,
  }
}

function uniqueStr(correct: string, cands: string[], need = 3): string[] {
  const out: string[] = []
  const seen = new Set([correct.replace(/\s+/g, '')])
  for (const c of cands) {
    const k = c.trim().replace(/\s+/g, '')
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(c.trim())
    if (out.length >= need) break
  }
  let g = 0
  while (out.length < need && g++ < 30) {
    const fake = `${correct}·${g}`
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(`无法确定${g}`)
  }
  return out.slice(0, need)
}

/** —— 简单 / 中等 —— */

function genWhichIsPrime(difficulty: 'easy' | 'medium', seq: number): PrimeCompQuestion | null {
  const primes = difficulty === 'easy' ? SMALL_PRIMES.filter((p) => p <= 30) : MED_PRIMES
  const correct = pickOne(primes)
  const comps =
    difficulty === 'easy'
      ? [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28]
      : TRAP_COMPOSITES
  const distractors = shuffleInPlace([...comps.filter((c) => c !== correct)])
    .slice(0, 3)
    .map(String)
  // 中等偶尔混入 1
  if (difficulty === 'medium' && Math.random() < 0.35) {
    distractors[2] = '1'
  }
  return buildQ({
    difficulty,
    term: '哪个是质数',
    stem: '下列哪个数是质数？',
    correct: String(correct),
    distractors,
    method: '质数只有 1 和自身两个正因数；1 既不是质数也不是合数',
    explanation: `${correct} 只能被 1 和 ${correct} 整除，是质数。其余为合数或 1。答案为 ${correct}。`,
    seq,
  })
}

function genWhichIsComposite(difficulty: 'easy' | 'medium', seq: number): PrimeCompQuestion | null {
  const comps =
    difficulty === 'easy'
      ? [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25, 27]
      : shuffleInPlace([...TRAP_COMPOSITES]).slice(0, 12)
  const correct = pickOne(comps)
  const primes = difficulty === 'easy' ? SMALL_PRIMES.filter((p) => p <= 29) : MED_PRIMES
  const distractors = shuffleInPlace([...primes])
    .slice(0, 3)
    .map(String)
  if (difficulty === 'medium' && Math.random() < 0.4) distractors[0] = '1'
  return buildQ({
    difficulty,
    term: '哪个是合数',
    stem: '下列哪个数是合数？',
    correct: String(correct),
    distractors,
    method: '合数除 1 和自身外还有其他正因数；1 不是合数',
    explanation: `${correct}=${formatFactorization(factorize(correct))}，有多于两个正因数，是合数。答案为 ${correct}。`,
    seq,
  })
}

function genClassifyNumber(difficulty: 'easy' | 'medium', seq: number): PrimeCompQuestion | null {
  const pool =
    difficulty === 'easy'
      ? [1, 2, 4, 7, 9, 11, 15, 17]
      : [1, 2, 51, 57, 87, 91, 97, 49]
  const n = pickOne(pool)
  let correct: string
  if (n === 1) correct = '既不是质数也不是合数'
  else if (isPrime(n)) correct = '质数'
  else correct = '合数'
  return buildQ({
    difficulty,
    term: `判断${n}`,
    stem: `${n} 是？`,
    correct,
    distractors: ['质数', '合数', '既不是质数也不是合数', '既是质数又是合数'].filter(
      (s) => s !== correct,
    ).slice(0, 3),
    method: '先看是否为 1；再看正因数个数',
    explanation:
      n === 1
        ? '1 既不是质数也不是合数。答案为既不是质数也不是合数。'
        : isPrime(n)
          ? `${n} 是质数。答案为质数。`
          : `${n}=${formatFactorization(factorize(n))}，是合数。答案为合数。`,
    seq,
  })
}

function genFactorization(difficulty: 'easy' | 'medium', seq: number): PrimeCompQuestion | null {
  const easyNs = [12, 18, 20, 24, 30, 36, 40, 42, 48, 60, 72, 90]
  const medNs = [84, 96, 108, 120, 144, 180, 210, 240, 280, 315, 336, 420, 504, 720]
  const n = pickOne(difficulty === 'easy' ? easyNs : medNs)
  const factors = factorize(n)
  const correct = formatFactorization(factors)
  // 干扰：漏指数、多一个因子、写成连加等
  const wrongForms: string[] = []
  const counts = new Map<number, number>()
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1)
  wrongForms.push(
    [...counts.entries()]
      .map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e + 1}`))
      .join('×'),
  )
  wrongForms.push(
    [...counts.entries()]
      .map(([p, e]) => (e <= 1 ? `${p}` : `${p}^${e - 1}`))
      .filter((s) => !s.endsWith('^0'))
      .join('×'),
  )
  wrongForms.push(factors.join('×')) // 不合并指数，有时与 correct 相同则后面 unique 会跳过
  wrongForms.push(formatFactorization(factorize(n * 2)))
  wrongForms.push(formatFactorization(factorize(Math.max(4, n - 2))))
  wrongForms.push(String(n))
  wrongForms.push(factors.join('+'))
  return buildQ({
    difficulty,
    term: `质因数分解·${n}`,
    stem: `${n} 的质因数分解是？`,
    correct,
    distractors: uniqueStr(
      correct,
      wrongForms.filter((s) => s && s !== correct),
    ),
    method: '短除法：从最小质数 2 起依次整除，直到商为质数',
    explanation: `用短除法得 ${n}=${correct}。答案为 ${correct}。`,
    seq,
  })
}

function genOnlyEvenPrime(seq: number): PrimeCompQuestion | null {
  return buildQ({
    difficulty: 'easy',
    term: '唯一偶质数',
    stem: '下列说法正确的是？',
    correct: '2 是唯一的偶质数',
    distractors: [
      '1 是最小的质数',
      '所有偶数都是合数',
      '9 是质数',
    ],
    method: '偶质数只有 2；其余偶数都能被 2 整除故为合数（大于 2 时）',
    explanation: '大于 2 的偶数都有因数 2，必为合数，故唯一偶质数是 2。1 不是质数。答案为「2 是唯一的偶质数」。',
    seq,
  })
}

function genEasyMediumPaper(difficulty: 'easy' | 'medium'): PrimeCompQuestion[] {
  const out: PrimeCompQuestion[] = []
  let seq = 1
  if (difficulty === 'easy') {
    const plan = shuffleInPlace([
      'prime',
      'composite',
      'classify',
      'factor',
      'factor',
      'even',
    ] as const)
    for (const kind of plan) {
      if (out.length >= PRIME_COMP_QUESTION_COUNT) break
      let q: PrimeCompQuestion | null = null
      if (kind === 'prime') q = genWhichIsPrime('easy', seq++)
      else if (kind === 'composite') q = genWhichIsComposite('easy', seq++)
      else if (kind === 'classify') q = genClassifyNumber('easy', seq++)
      else if (kind === 'factor') q = genFactorization('easy', seq++)
      else q = genOnlyEvenPrime(seq++)
      if (q) out.push(q)
    }
  } else {
    const plan = shuffleInPlace([
      'prime',
      'prime',
      'composite',
      'classify',
      'factor',
      'factor',
    ] as const)
    for (const kind of plan) {
      if (out.length >= PRIME_COMP_QUESTION_COUNT) break
      let q: PrimeCompQuestion | null = null
      if (kind === 'prime') q = genWhichIsPrime('medium', seq++)
      else if (kind === 'composite') q = genWhichIsComposite('medium', seq++)
      else if (kind === 'classify') q = genClassifyNumber('medium', seq++)
      else q = genFactorization('medium', seq++)
      if (q) out.push(q)
    }
  }
  while (out.length < PRIME_COMP_QUESTION_COUNT) {
    const q = genFactorization(difficulty, seq++)
    if (q) out.push(q)
    else break
  }
  return out.slice(0, PRIME_COMP_QUESTION_COUNT)
}

/** —— 困难：经典真题 2 变式 —— */

type Triple = { a: number; b: number; c: number; sum: number; pair: number; prod: number }

function makeTriple(): Triple {
  // a=2，b、c 为不同奇质数，控制 sum、pair 在合理范围
  const odds = MED_PRIMES.filter((p) => p >= 3 && p <= 47)
  for (let t = 0; t < 40; t++) {
    const b = pickOne(odds)
    let c = pickOne(odds)
    while (c === b) c = pickOne(odds)
    const a = 2
    const sum = a + b + c
    const pair = a * b + b * c + a * c
    const prod = a * b * c
    if (sum >= 20 && sum <= 120 && pair >= 50 && pair <= 2500) {
      return { a, b, c, sum, pair, prod }
    }
  }
  // fallback 真题数字附近
  return { a: 2, b: 31, c: 61, sum: 94, pair: 2075, prod: 3782 }
}

function genHardAbcFromSums(seq: number, t: Triple): PrimeCompQuestion | null {
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'abc-from-sums',
    term: '三质数求 abc',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}，且 ab+bc+ac=${t.pair}。`,
    stem: 'abc 等于？',
    correct: String(t.prod),
    distractors: uniqueStr(String(t.prod), [
      String(t.prod + 54),
      String(t.prod - 54),
      String(t.pair * 2),
      String(t.sum * t.pair),
      String(Math.floor(t.pair / 2) * t.sum),
      String(t.b * t.c),
    ]),
    method: '和为偶数 ⇒ 必有一个为 2；设 a=2，则 bc=pair−2(sum−2)，abc=2·bc',
    explanation: `${t.sum} 为偶数，三质数之和为偶 ⇒ 必含唯一偶质数 2。设 a=2，则 b+c=${t.sum - 2}，ab+bc+ac=2(b+c)+bc=${t.pair} ⇒ bc=${t.pair - 2 * (t.sum - 2)}=${t.b * t.c}，故 abc=2×${t.b * t.c}=${t.prod}。答案为 ${t.prod}。`,
    seq,
  })
}

function genHardBcFromSums(seq: number, t: Triple): PrimeCompQuestion | null {
  const bc = t.b * t.c
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'bc-from-sums',
    term: '求 bc',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}，ab+bc+ac=${t.pair}。已知其中一个质数为 2。`,
    stem: '其余两个质数的乘积是？',
    correct: String(bc),
    distractors: uniqueStr(String(bc), [
      String(t.prod),
      String(t.pair),
      String(t.sum - 2),
      String(bc + 2),
      String(bc - 10),
      String(t.a * t.b),
    ]),
    method: '设 a=2，则 2(b+c)+bc=pair，b+c=sum−2 ⇒ bc=pair−2(sum−2)',
    explanation: `b+c=${t.sum - 2}，bc=${t.pair}−2×${t.sum - 2}=${bc}。答案为 ${bc}。`,
    seq,
  })
}

function genHardSumSquares(seq: number, t: Triple): PrimeCompQuestion | null {
  const ss = t.a * t.a + t.b * t.b + t.c * t.c
  // (a+b+c)^2 - 2(ab+bc+ac)
  const check = t.sum * t.sum - 2 * t.pair
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'sum-squares',
    term: '求平方和',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}，ab+bc+ac=${t.pair}。`,
    stem: 'a²+b²+c² 等于？',
    correct: String(check),
    distractors: uniqueStr(String(check), [
      String(ss + 4),
      String(t.sum * t.sum),
      String(t.pair),
      String(t.prod),
      String(check + 2),
      String(Math.abs(check - 20)),
    ]),
    method: 'a²+b²+c²=(a+b+c)²−2(ab+bc+ac)',
    explanation: `a²+b²+c²=${t.sum}²−2×${t.pair}=${check}。答案为 ${check}。`,
    seq,
  })
}

function genHardMustHaveTwo(seq: number, t: Triple): PrimeCompQuestion | null {
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'must-have-two',
    term: '必含质数 2',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}（${t.sum} 为偶数）。`,
    stem: '下列一定正确的是？',
    correct: 'a、b、c 中必有一个等于 2',
    distractors: [
      'a、b、c 可以都是奇质数',
      'a、b、c 中必有一个等于 1',
      'a、b、c 中必有两个等于 2',
    ],
    method: '奇+奇+奇=奇；要得到偶数和，必须掺入唯一偶质数 2',
    explanation: `三个奇质数之和为奇数，与 ${t.sum} 为偶数矛盾，故其中必有一个是 2。答案为「a、b、c 中必有一个等于 2」。`,
    seq,
  })
}

function genHardFindPrimes(seq: number, t: Triple): PrimeCompQuestion | null {
  const sorted = [t.a, t.b, t.c].sort((x, y) => x - y)
  const correct = sorted.join('、')
  const d1 = [2, sorted[1]!, sorted[2]! + 2].sort((x, y) => x - y).join('、')
  const d2 = [3, sorted[1]!, t.sum - 3 - sorted[1]!].filter((x) => x > 1).sort((x, y) => x - y).join('、')
  const d3 = [2, 2, t.sum - 4].sort((x, y) => x - y).join('、')
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'find-primes',
    term: '还原三质数',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}，abc=${t.prod}。`,
    stem: '从小到大写出 a、b、c 为？',
    correct,
    distractors: uniqueStr(correct, [d1, d2, d3, `${sorted[0]}、${sorted[1]}、${sorted[2]! + 6}`]),
    method: '和为偶 ⇒ 含 2；则另两数之和为 sum−2、积为 prod/2，解二次方程',
    explanation: `必有一个为 2，另两数之和 ${t.sum - 2}、积 ${t.prod / 2}，得 ${t.b} 与 ${t.c}。故为 ${correct}。答案为 ${correct}。`,
    seq,
  })
}

function genHardPairFromAbc(seq: number, t: Triple): PrimeCompQuestion | null {
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'pair-sum-from-abc',
    term: '由和积求 pair',
    passage: `质数 a、b、c 中有一个为 2，且 a+b+c=${t.sum}，abc=${t.prod}。`,
    stem: 'ab+bc+ac 等于？',
    correct: String(t.pair),
    distractors: uniqueStr(String(t.pair), [
      String(t.prod),
      String(t.sum * 2),
      String(t.b * t.c),
      String(t.pair + 10),
      String(t.pair - 14),
      String((t.sum - 2) * 2),
    ]),
    method: 'a=2 时，b+c=sum−2，bc=prod/2，则 ab+bc+ac=2(b+c)+bc',
    explanation: `b+c=${t.sum - 2}，bc=${t.prod / 2}，ab+bc+ac=2×${t.sum - 2}+${t.prod / 2}=${t.pair}。答案为 ${t.pair}。`,
    seq,
  })
}

function genHardWhichIsTwo(seq: number, t: Triple): PrimeCompQuestion | null {
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'which-is-two',
    term: '必为哪一质数',
    passage: `质数 a、b、c 满足 a+b+c=${t.sum}，ab+bc+ac=${t.pair}。`,
    stem: '其中一个质数一定是？',
    correct: '2',
    distractors: uniqueStr('2', ['1', '3', String(t.b), String(t.c), '5', '奇数']),
    method: '三质数之和为偶数 ⇒ 必含唯一偶质数 2',
    explanation: `${t.sum} 为偶数，三个奇质数之和为奇，矛盾，故必有一个是 2。进一步可解得另两数为 ${t.b}、${t.c}。答案为 2。`,
    seq,
  })
}

const HARD_GENERATORS: Record<
  PrimeCompHardTypeId,
  (seq: number, t: Triple) => PrimeCompQuestion | null
> = {
  'abc-from-sums': genHardAbcFromSums,
  'bc-from-sums': genHardBcFromSums,
  'sum-squares': genHardSumSquares,
  'must-have-two': genHardMustHaveTwo,
  'find-primes': genHardFindPrimes,
  'pair-sum-from-abc': genHardPairFromAbc,
  'which-is-two': genHardWhichIsTwo,
}

function genHardPaper(): PrimeCompQuestion[] {
  const types = shuffleInPlace([...PRIME_COMP_HARD_EXAM_TYPES.map((x) => x.id)]).slice(
    0,
    PRIME_COMP_QUESTION_COUNT,
  )
  const out: PrimeCompQuestion[] = []
  let seq = 1
  for (const id of types) {
    let q: PrimeCompQuestion | null = null
    for (let attempt = 0; attempt < 8 && !q; attempt++) {
      q = HARD_GENERATORS[id](seq, makeTriple())
    }
    seq += 1
    if (q) out.push(q)
  }
  shuffleInPlace(out)
  while (out.length < PRIME_COMP_QUESTION_COUNT) {
    const q = genHardAbcFromSums(seq++, makeTriple())
    if (!q) break
    out.push(q)
  }
  return out.slice(0, PRIME_COMP_QUESTION_COUNT)
}

export function generatePrimeCompositePaper(
  difficulty: PrimeCompDifficulty,
): PrimeCompQuestion[] {
  if (difficulty === 'hard') return genHardPaper()
  return genEasyMediumPaper(difficulty)
}
