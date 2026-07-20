/**
 * 运算技巧 · 整除及其性质 · 公因数与公倍数
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。
 *
 * 【困难题型库 · 对齐经典真题 4（等差连乘末尾 0），登记 7 种；每轮抽 6 种且互不重复】
 * 1. min-n-zeros：乘积末尾至少 k 个 0，求最小 n（经典）
 * 2. zeros-at-n：已知首项、公差、末项 n，问末尾几个 0
 * 3. term-count：至少几个因数相乘才能末尾 ≥k 个 0
 * 4. first-five-term：数列中第一个含质因数 5 的项
 * 5. five-count-of-term：某一项对「5 的个数」贡献几个
 * 6. five-step：相邻两个含 5 的项相差多少
 * 7. cumul-at-term：乘到某一含 5 的项时，累计几个 5
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type GcdLcmDifficulty = 'easy' | 'medium' | 'hard'

export const GCD_LCM_QUESTION_COUNT = 6

export const GCD_LCM_MODES: {
  id: GcdLcmDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '公因数与公倍数 · 简单',
    desc: '每轮 6 题 · 两数最大公约数 / 最小公倍数 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '公因数与公倍数 · 普通',
    desc: '每轮 6 题 · 多数 GCD/LCM · 周期相遇（经典真题 3）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '公因数与公倍数 · 困难',
    desc: '每轮 6 题 · 对齐经典真题 4 的 7 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const GCD_LCM_HARD_EXAM_TYPES = [
  {
    id: 'min-n-zeros',
    name: '等差连乘求最小 n（经典真题 4）',
    note: '乘积末尾至少 k 个 0，用数 5 的个数求最小末项 n',
  },
  {
    id: 'zeros-at-n',
    name: '已知乘到 n 问末尾几个 0',
    note: '给定首项、公差、n，累计质因数 5 的个数',
  },
  {
    id: 'term-count',
    name: '至少几个因数才能满 k 个 0',
    note: '问数列中需要乘到第几个因数',
  },
  {
    id: 'first-five-term',
    name: '第一个含质因数 5 的项',
    note: '在等差数列中找最小的含 5 的项',
  },
  {
    id: 'five-count-of-term',
    name: '某一项贡献几个 5',
    note: '如 200=2³×5² 贡献 2 个质因数 5',
  },
  {
    id: 'five-step',
    name: '相邻含 5 项的步长',
    note: '含 5 的项每隔 LCM(公差,5)/… 出现，问相邻差',
  },
  {
    id: 'cumul-at-term',
    name: '乘到某项时累计几个 5',
    note: '给出含 5 的项，问乘到该项时累计 5 的个数',
  },
] as const

export type GcdLcmHardTypeId = (typeof GCD_LCM_HARD_EXAM_TYPES)[number]['id']

export type GcdLcmQuestion = {
  id: string
  topic: 'gcd-lcm'
  difficulty: GcdLcmDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: GcdLcmHardTypeId
}

export function gcdLcmTopicLabel(): string {
  return '公因数与公倍数'
}

export function gcdLcmDifficultyLabel(d: GcdLcmDifficulty): string {
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

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x
}

function lcm2(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(a / gcd(a, b)) * Math.abs(b)
}

function lcmMany(nums: number[]): number {
  return nums.reduce((acc, n) => lcm2(acc, n), 1)
}

function gcdMany(nums: number[]): number {
  return nums.reduce((acc, n) => gcd(acc, n))
}

/** 质因数分解 → 形如 2³×3×5 */
function factorPretty(n: number): string {
  if (n <= 1) return String(n)
  const parts: string[] = []
  let x = n
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue
    let e = 0
    while (x % p === 0) {
      x = Math.floor(x / p)
      e++
    }
    parts.push(e === 1 ? String(p) : `${p}^${e}`)
  }
  if (x > 1) parts.push(String(x))
  return parts.join('×')
}

function valuation(n: number, p: number): number {
  if (n === 0) return 0
  let c = 0
  let x = Math.abs(n)
  while (x % p === 0) {
    x = Math.floor(x / p)
    c++
  }
  return c
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
  while (out.length < need && g++ < 40) {
    const fake = String(Number(correct) + g + 1)
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.map(String),
  )
}

function buildQuestion(input: {
  difficulty: GcdLcmDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: GcdLcmHardTypeId
  seq: number
}): GcdLcmQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'gcd-lcm',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `gcd-lcm-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'gcd-lcm',
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

/** 由质因数「取小/取大」解释 GCD/LCM */
function explainGcdLcm(a: number, b: number, kind: 'gcd' | 'lcm'): string {
  const g = gcd(a, b)
  const l = lcm2(a, b)
  return `${a}=${factorPretty(a)}，${b}=${factorPretty(b)}。${
    kind === 'gcd'
      ? `公有质因数取较低次幂，得最大公因数 ${g}。`
      : `全部质因数取较高次幂，得最小公倍数 ${l}。`
  }`
}

// ——— 简单：两数 GCD / LCM ———

function genEasyGcd(seq: number): GcdLcmQuestion | null {
  const pairs: [number, number][] = [
    [24, 36],
    [18, 30],
    [16, 24],
    [20, 28],
    [45, 60],
    [12, 18],
    [48, 60],
    [14, 35],
    [21, 28],
    [32, 48],
  ]
  const [a, b] = pickOne(pairs)
  const ans = gcd(a, b)
  const distractors = uniqueNum(ans, [lcm2(a, b), Math.min(a, b), Math.abs(a - b), ans * 2, ans / 2].filter((x) => x > 0 && Number.isInteger(x)))
  return buildQuestion({
    difficulty: 'easy',
    term: '求最大公因数',
    stem: `${a} 与 ${b} 的最大公因数是？`,
    correct: String(ans),
    distractors,
    method: '质因数分解后，公有质因数取较低次幂相乘。',
    explanation: explainGcdLcm(a, b, 'gcd'),
    seq,
  })
}

function genEasyLcm(seq: number): GcdLcmQuestion | null {
  const pairs: [number, number][] = [
    [6, 8],
    [9, 12],
    [10, 15],
    [8, 12],
    [14, 21],
    [16, 24],
    [18, 24],
    [20, 30],
    [12, 18],
    [15, 25],
  ]
  const [a, b] = pickOne(pairs)
  const ans = lcm2(a, b)
  const distractors = uniqueNum(ans, [gcd(a, b), a * b, a + b, ans / 2, ans * 2].filter((x) => x > 0 && Number.isInteger(x)))
  return buildQuestion({
    difficulty: 'easy',
    term: '求最小公倍数',
    stem: `${a} 与 ${b} 的最小公倍数是？`,
    correct: String(ans),
    distractors,
    method: '质因数分解后，全部质因数取较高次幂相乘；或用 a×b÷gcd。',
    explanation: `${explainGcdLcm(a, b, 'lcm')} 也可：${a}×${b}÷${gcd(a, b)}=${ans}。`,
    seq,
  })
}

function genEasyCoprime(seq: number): GcdLcmQuestion | null {
  const pairs: [number, number][] = [
    [8, 9],
    [14, 15],
    [25, 36],
    [9, 16],
    [21, 22],
    [35, 48],
  ]
  const [a, b] = pickOne(pairs)
  const askGcd = Math.random() < 0.5
  if (askGcd) {
    return buildQuestion({
      difficulty: 'easy',
      term: '互质判定',
      stem: `${a} 与 ${b} 的最大公因数是？`,
      correct: '1',
      distractors: uniqueStr('1', [String(Math.min(a, b)), String(gcd(a, a)), '2', String(a)]),
      method: '只有公因数 1 时两数互质，最大公因数为 1。',
      explanation: `${a}=${factorPretty(a)}，${b}=${factorPretty(b)}，无公共质因数，故最大公因数为 1（互质）。`,
      seq,
    })
  }
  const ans = lcm2(a, b)
  return buildQuestion({
    difficulty: 'easy',
    term: '互质与最小公倍数',
    stem: `已知 ${a} 与 ${b} 互质，则它们的最小公倍数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [a + b, Math.max(a, b), a * b + 1, gcd(a, b)]),
    method: '互质时最小公倍数等于两数之积。',
    explanation: `互质 ⇒ gcd=1，lcm=${a}×${b}=${ans}。`,
    seq,
  })
}

// ——— 中等：多数 GCD/LCM + 经典真题 3 周期相遇 ———

function genMediumMultiGcd(seq: number): GcdLcmQuestion | null {
  const triples: number[][] = [
    [12, 18, 30],
    [16, 24, 40],
    [15, 25, 35],
    [14, 21, 35],
    [18, 27, 45],
  ]
  const nums = pickOne(triples)
  const ans = gcdMany(nums)
  const distractors = uniqueNum(ans, [
    lcmMany(nums),
    Math.min(...nums),
    gcd(nums[0]!, nums[1]!),
    ans * 2,
  ])
  return buildQuestion({
    difficulty: 'medium',
    term: '三数最大公因数',
    stem: `${nums.join('、')} 的最大公因数是？`,
    correct: String(ans),
    distractors,
    method: '先求两两最大公因数，再与第三个数求最大公因数。',
    explanation: `gcd(${nums[0]},${nums[1]})=${gcd(nums[0]!, nums[1]!)}，再与 ${nums[2]} 得 ${ans}。也可分别分解：${nums.map((n) => `${n}=${factorPretty(n)}`).join('；')}。`,
    seq,
  })
}

function genMediumMultiLcm(seq: number): GcdLcmQuestion | null {
  const triples: number[][] = [
    [4, 6, 8],
    [6, 9, 12],
    [8, 12, 18],
    [5, 10, 15],
    [9, 12, 18],
  ]
  const nums = pickOne(triples)
  const ans = lcmMany(nums)
  const distractors = uniqueNum(ans, [
    gcdMany(nums),
    nums.reduce((a, b) => a * b, 1),
    Math.max(...nums),
    ans / 2,
    ans * 2,
  ].filter((x) => x > 0 && Number.isInteger(x)))
  return buildQuestion({
    difficulty: 'medium',
    term: '三数最小公倍数',
    stem: `${nums.join('、')} 的最小公倍数是？`,
    correct: String(ans),
    distractors,
    method: '质因数取各数中出现的最高次幂；或两两求 lcm。',
    explanation: `${nums.map((n) => `${n}=${factorPretty(n)}`).join('，')}，取最高次幂得 ${ans}。`,
    seq,
  })
}

/** 经典真题 3：周期相遇 = LCM */
function genMediumMeetAgain(seq: number): GcdLcmQuestion | null {
  const scenarios: {
    names: [string, string, string]
    days: [number, number, number]
    place: string
  }[] = [
    { names: ['小凡', '小徐', '老刘'], days: [5, 9, 12], place: '健身房' },
    { names: ['甲', '乙', '丙'], days: [4, 6, 10], place: '图书馆' },
    { names: ['小张', '小李', '小王'], days: [3, 5, 7], place: '游泳馆' },
    { names: ['阿杰', '阿强', '阿明'], days: [6, 8, 9], place: '篮球场' },
    { names: ['小陈', '小周', '小吴'], days: [4, 5, 6], place: '公园' },
    { names: ['小刘', '小赵', '小孙'], days: [8, 10, 12], place: '羽毛球馆' },
  ]
  const s = pickOne(scenarios)
  const [d1, d2, d3] = s.days
  const ans = lcmMany([d1, d2, d3])
  const distractors = uniqueNum(ans, [
    d1 * d2 * d3,
    lcm2(d1, d2),
    lcm2(d2, d3),
    d1 + d2 + d3,
    gcdMany([d1, d2, d3]) * ans,
    ans / 2,
  ].filter((x) => x > 0 && Number.isInteger(x) && x !== ans))
  const passage = `${s.names[0]}每隔 ${d1} 天去一次${s.place}，${s.names[1]}每隔 ${d2} 天去一次，${s.names[2]}每隔 ${d3} 天去一次。三人今天在${s.place}相遇。`
  return buildQuestion({
    difficulty: 'medium',
    term: '周期相遇（经典真题 3）',
    passage,
    stem: '至少再过多少天三人再次相遇？',
    correct: String(ans),
    distractors,
    method: '再次同时出现的间隔 = 各周期的最小公倍数。',
    explanation: `求 LCM(${d1},${d2},${d3})。${d1}=${factorPretty(d1)}，${d2}=${factorPretty(d2)}，${d3}=${factorPretty(d3)}，故 LCM=${ans}。`,
    seq,
  })
}

function genMediumPairGcdLcm(seq: number): GcdLcmQuestion | null {
  const pairs: [number, number][] = [
    [24, 60],
    [36, 48],
    [28, 42],
    [45, 75],
    [32, 56],
  ]
  const [a, b] = pickOne(pairs)
  const g = gcd(a, b)
  const l = lcm2(a, b)
  const askGcd = Math.random() < 0.5
  const ans = askGcd ? g : l
  return buildQuestion({
    difficulty: 'medium',
    term: askGcd ? '两数最大公因数' : '两数最小公倍数',
    stem: askGcd
      ? `已知 ${a}=${factorPretty(a)}，${b}=${factorPretty(b)}，则最大公因数是？`
      : `已知 ${a}=${factorPretty(a)}，${b}=${factorPretty(b)}，则最小公倍数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [askGcd ? l : g, a, b, g * 2, l / 2].filter((x) => x > 0 && Number.isInteger(x))),
    method: askGcd
      ? '公有质因数取较低次幂。'
      : '全部质因数取较高次幂。',
    explanation: explainGcdLcm(a, b, askGcd ? 'gcd' : 'lcm'),
    seq,
  })
}

// ——— 困难：等差连乘末尾 0（经典真题 4 变式） ———

type FiveHit = { term: number; v5: number; index: number }

/** 生成「末尾 0 由 5 决定」的等差数列场景 */
function buildZeroScene(opts?: {
  first?: number
  diff?: number
  targetK?: number
}): {
  first: number
  diff: number
  targetK: number
  hits: FiveHit[]
  /** 使累计 v5 首次 ≥ targetK 的末项 */
  minN: number
  /** 该项在数列中的序号（从 1 起） */
  minTermCount: number
  /** 前缀到每个 hit 的累计 v5 */
  cumulAtHits: number[]
} | null {
  for (let attempt = 0; attempt < 80; attempt++) {
    const first = opts?.first ?? pickOne([17, 19, 23, 29, 31, 37, 41])
    const diff = opts?.diff ?? pickOne([6, 8, 9, 12, 14, 15])
    const targetK = opts?.targetK ?? randInt(6, 12)

    const hits: FiveHit[] = []
    let cumul = 0
    let cumul2 = 0
    let minN = 0
    let minTermCount = 0
    const cumulAtHits: number[] = []

    // 最多扫约 120 项
    for (let i = 0; i < 120; i++) {
      const term = first + i * diff
      const v5 = valuation(term, 5)
      const v2 = valuation(term, 2)
      cumul2 += v2
      if (v5 > 0) {
        hits.push({ term, v5, index: i })
        cumul += v5
        cumulAtHits.push(cumul)
        if (minN === 0 && cumul >= targetK) {
          minN = term
          minTermCount = i + 1
        }
      }
    }

    if (hits.length < 4) continue
    if (minN === 0) continue
    // 保证 2 够用（末尾 0 由 5 决定）
    if (cumul2 < targetK) continue

    return { first, diff, targetK, hits, minN, minTermCount, cumulAtHits }
  }
  return null
}

function productPassage(first: number, diff: number, endHint: string): string {
  const t1 = first
  const t2 = first + diff
  const t3 = first + 2 * diff
  const t4 = first + 3 * diff
  return `设 M = ${t1}×${t2}×${t3}×${t4}×…×${endHint}（相邻两因数之差恒为 ${diff}）。`
}

function genHardMinNZeros(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene()
  if (!scene) return null
  const { first, diff, targetK, minN, hits, cumulAtHits } = scene
  const ans = minN
  const distractors = uniqueNum(ans, [
    hits[hits.length - 1]!.term,
    ans - diff,
    ans + diff,
    first + diff * targetK,
    lcm2(diff, 5) * targetK,
  ].filter((x) => x > 0))
  const reachIdx = cumulAtHits.findIndex((c) => c >= targetK)
  const hitLines = hits
    .slice(0, reachIdx + 1)
    .map((h, i) => `${h.term}（贡献 ${h.v5} 个 5，累计 ${cumulAtHits[i]}）`)
    .join('；')
  return buildQuestion({
    difficulty: 'hard',
    term: '等差连乘求最小 n',
    hardTypeId: 'min-n-zeros',
    passage: productPassage(first, diff, 'n'),
    stem: `已知 M 的末尾有连续 ${targetK} 个 0，则 n 的最小值是？`,
    correct: String(ans),
    distractors,
    method: '末尾 0 由 2×5 产生；数列中偶数充足，数质因数 5 的个数，累计首次 ≥k 时的末项即最小 n。',
    explanation: `公差 ${diff}。含 5 的项依次：${hitLines}。累计首次达到 ${targetK} 时末项为 ${ans}。`,
    seq,
  })
}

function genHardZerosAtN(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene({ targetK: randInt(8, 12) })
  if (!scene) return null
  const { first, diff, hits, cumulAtHits } = scene
  // 选一个中间 hit 作为给定的 n
  const pickIdx = randInt(Math.min(3, hits.length - 1), Math.min(hits.length - 1, 8))
  const n = hits[pickIdx]!.term
  const ans = cumulAtHits[pickIdx]!
  // 验证到 n 为止的 v2
  let v2 = 0
  for (let t = first; t <= n; t += diff) v2 += valuation(t, 2)
  if (v2 < ans) return null
  const distractors = uniqueNum(ans, [
    ans - 1,
    ans + 1,
    hits.filter((h) => h.term <= n).length,
    ans + hits[pickIdx]!.v5,
    pickIdx + 1,
  ].filter((x) => x > 0))
  return buildQuestion({
    difficulty: 'hard',
    term: '已知乘到 n 问末尾 0',
    hardTypeId: 'zeros-at-n',
    passage: productPassage(first, diff, String(n)),
    stem: `当乘积取到末项 ${n} 时，M 的末尾连续 0 的个数是？`,
    correct: String(ans),
    distractors,
    method: '数乘积中质因数 5 的个数（2 通常够用）。注意 25、125 等贡献多个 5。',
    explanation: `≤${n} 的含 5 项：${hits
      .filter((h) => h.term <= n)
      .map((h) => `${h.term}(+${h.v5})`)
      .join('、')}，合计 ${ans} 个 5，故末尾 ${ans} 个 0。`,
    seq,
  })
}

function genHardTermCount(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene()
  if (!scene) return null
  const { first, diff, targetK, minTermCount, minN } = scene
  const ans = minTermCount
  const distractors = uniqueNum(ans, [
    ans - 1,
    ans + 1,
    Math.floor((minN - first) / diff),
    targetK,
    ans + 2,
  ].filter((x) => x > 0))
  return buildQuestion({
    difficulty: 'hard',
    term: '至少几个因数满 k 个 0',
    hardTypeId: 'term-count',
    passage: productPassage(first, diff, 'n'),
    stem: `要使 M 末尾至少有 ${targetK} 个连续 0，至少需要从首项起连续相乘多少个因数？`,
    correct: String(ans),
    distractors,
    method: '累计质因数 5 首次 ≥k 时，对应项是数列第几个（从首项数起）。',
    explanation: `最小末项 n=${minN}=${first}+(${ans}-1)×${diff}，故共 ${ans} 个因数。`,
    seq,
  })
}

function genHardFirstFiveTerm(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene({ targetK: 6 })
  if (!scene) return null
  const { first, diff, hits } = scene
  const ans = hits[0]!.term
  const distractors = uniqueNum(ans, [
    ans + diff,
    first,
    first + diff,
    lcm2(diff, 5),
    ans - diff > 0 ? ans - diff : ans + 2 * diff,
  ])
  return buildQuestion({
    difficulty: 'hard',
    term: '第一个含质因数 5 的项',
    hardTypeId: 'first-five-term',
    passage: productPassage(first, diff, 'n'),
    stem: '该等差数列中，第一个含有质因数 5 的项是？',
    correct: String(ans),
    distractors,
    method: '从首项起按公差推进，检查能否被 5 整除（或含 5 的幂）。',
    explanation: `首项 ${first}，公差 ${diff}。依次检验：… 得 ${ans}（${factorPretty(ans)}）为第一个含 5 的项。`,
    seq,
  })
}

function genHardFiveCountOfTerm(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene({ targetK: 8 })
  if (!scene) return null
  const high = scene.hits.filter((h) => h.v5 >= 2)
  const pick = high.length ? pickOne(high) : pickOne(scene.hits)
  const ans = pick.v5
  const distractors = uniqueNum(ans, [1, 2, 3, ans + 1, 0].filter((x) => x !== ans && x >= 0))
  return buildQuestion({
    difficulty: 'hard',
    term: '某一项贡献几个 5',
    hardTypeId: 'five-count-of-term',
    passage: productPassage(scene.first, scene.diff, 'n'),
    stem: `因数 ${pick.term} 对乘积中「质因数 5 的个数」贡献几个？`,
    correct: String(ans),
    distractors,
    method: '对该项做质因数分解，看 5 的指数；25、125、625 分别贡献 2、3、4 个。',
    explanation: `${pick.term}=${factorPretty(pick.term)}，质因数 5 的指数为 ${ans}。`,
    seq,
  })
}

function genHardFiveStep(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene({ targetK: 6 })
  if (!scene || scene.hits.length < 2) return null
  const { first, diff, hits } = scene
  // 相邻两个「至少含一个 5」的项之差（通常恒定 = LCM(diff,5) 在同余类上的步长）
  const step = hits[1]!.term - hits[0]!.term
  // 验证前几项是否等步
  const consistent = hits.slice(0, Math.min(4, hits.length - 1)).every((h, i) => {
    if (i === 0) return true
    return hits[i]!.term - hits[i - 1]!.term === step
  })
  if (!consistent || step <= 0) return null
  const ans = step
  const distractors = uniqueNum(ans, [diff, 5, lcm2(diff, 5), diff * 5, step * 2, Math.abs(diff - 5)])
  return buildQuestion({
    difficulty: 'hard',
    term: '相邻含 5 项的步长',
    hardTypeId: 'five-step',
    passage: productPassage(first, diff, 'n'),
    stem: '数列中相邻两个「含质因数 5」的项，它们的差通常是多少？',
    correct: String(ans),
    distractors,
    method: '含 5 的项需同时落在原等差数列与 5 的倍数上，相邻间隔由公差与 5 的最小公倍数决定。',
    explanation: `前几个含 5 的项：${hits
      .slice(0, 4)
      .map((h) => h.term)
      .join('、')}…，相邻差为 ${ans}（与 LCM(${diff},5)=${lcm2(diff, 5)} 相关）。`,
    seq,
  })
}

function genHardCumulAtTerm(seq: number): GcdLcmQuestion | null {
  const scene = buildZeroScene({ targetK: 10 })
  if (!scene) return null
  const { first, diff, hits, cumulAtHits } = scene
  const pickIdx = randInt(2, Math.min(hits.length - 1, 7))
  const term = hits[pickIdx]!.term
  const ans = cumulAtHits[pickIdx]!
  const distractors = uniqueNum(ans, [
    ans - hits[pickIdx]!.v5,
    ans - 1,
    ans + 1,
    pickIdx + 1,
    hits[pickIdx]!.v5,
  ].filter((x) => x > 0))
  return buildQuestion({
    difficulty: 'hard',
    term: '乘到某项累计几个 5',
    hardTypeId: 'cumul-at-term',
    passage: productPassage(first, diff, 'n'),
    stem: `当乘积乘到因数 ${term}（含）时，乘积中质因数 5 的个数累计为？`,
    correct: String(ans),
    distractors,
    method: '列出 ≤ 该项的所有含 5 的因数，把各自贡献的 5 相加。',
    explanation: `${hits
      .slice(0, pickIdx + 1)
      .map((h, i) => `${h.term}(+${h.v5}→累计${cumulAtHits[i]})`)
      .join('；')}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  GcdLcmHardTypeId,
  (seq: number) => GcdLcmQuestion | null
> = {
  'min-n-zeros': genHardMinNZeros,
  'zeros-at-n': genHardZerosAtN,
  'term-count': genHardTermCount,
  'first-five-term': genHardFirstFiveTerm,
  'five-count-of-term': genHardFiveCountOfTerm,
  'five-step': genHardFiveStep,
  'cumul-at-term': genHardCumulAtTerm,
}

function tryBuild(
  factory: () => GcdLcmQuestion | null,
  maxTry = 25,
): GcdLcmQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateGcdLcmPaper(difficulty: GcdLcmDifficulty): GcdLcmQuestion[] {
  const out: GcdLcmQuestion[] = []
  const seen = new Set<string>()

  const push = (q: GcdLcmQuestion | null) => {
    if (!q) return
    const key = q.fingerprint
    if (seen.has(key)) return
    seen.add(key)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyGcd, genEasyLcm, genEasyCoprime]
    let guard = 0
    while (out.length < GCD_LCM_QUESTION_COUNT && guard++ < 80) {
      const f = pickOne(factories)
      push(tryBuild(() => f(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan: Array<() => GcdLcmQuestion | null> = [
      () => genMediumMeetAgain(0),
      () => genMediumMeetAgain(1),
      () => genMediumMultiGcd(2),
      () => genMediumMultiLcm(3),
      () => genMediumPairGcdLcm(4),
      () => (Math.random() < 0.5 ? genMediumMeetAgain(5) : genMediumPairGcdLcm(5)),
    ]
    for (let i = 0; i < plan.length; i++) {
      const factory = plan[i]!
      push(tryBuild(() => factory()))
    }
    let guard = 0
    while (out.length < GCD_LCM_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => genMediumMeetAgain(out.length)))
    }
  } else {
    const types = shuffleInPlace([...GCD_LCM_HARD_EXAM_TYPES.map((t) => t.id)]).slice(
      0,
      GCD_LCM_QUESTION_COUNT,
    )
    for (const typeId of types) {
      const builder = HARD_BUILDERS[typeId]
      let q: GcdLcmQuestion | null = null
      for (let t = 0; t < 30; t++) {
        q = builder(out.length)
        if (q && !seen.has(q.fingerprint)) break
        q = null
      }
      if (q) {
        seen.add(q.fingerprint)
        out.push(q)
      }
    }
  }

  if (out.length < GCD_LCM_QUESTION_COUNT) {
    throw new Error(`公因数与公倍数组卷不足：仅 ${out.length}/${GCD_LCM_QUESTION_COUNT}`)
  }
  return out.slice(0, GCD_LCM_QUESTION_COUNT)
}
