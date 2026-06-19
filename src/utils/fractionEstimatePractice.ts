/** 估算分数：百分数转分数、分数大小比较 */

export type FractionEstimateMode = 'fraction-easy' | 'fraction-hard'

export type FractionEstimateModeConfig = {
  id: FractionEstimateMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const FRACTION_ESTIMATE_MODES: FractionEstimateModeConfig[] = [
  {
    id: 'fraction-easy',
    label: '简单题',
    durationSec: 25,
    optionCount: 3,
    correctDelta: 4,
    wrongDelta: -8,
    maxScore: 100,
    desc: '25 秒 · 常见百分数转分数 / 同分母或简单分数比大小 · 3 选项 · 对 +4 / 错 -8 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'fraction-hard',
    label: '高难题',
    durationSec: 35,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '35 秒 · 含 12.5%、33% 等 / 异分母接近分数比大小 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
]

export type FractionEstimateAnswer = string

export type FractionEstimateQuestion = {
  id: number
  expression: string
  correctAnswer: FractionEstimateAnswer
  options: FractionEstimateAnswer[]
  correctIndex: number
}

type Fraction = { n: number; d: number }

type PercentEntry = { label: string; frac: Fraction }

const EASY_PERCENTS: PercentEntry[] = [
  { label: '50%', frac: { n: 1, d: 2 } },
  { label: '25%', frac: { n: 1, d: 4 } },
  { label: '75%', frac: { n: 3, d: 4 } },
  { label: '20%', frac: { n: 1, d: 5 } },
  { label: '40%', frac: { n: 2, d: 5 } },
  { label: '60%', frac: { n: 3, d: 5 } },
  { label: '80%', frac: { n: 4, d: 5 } },
  { label: '10%', frac: { n: 1, d: 10 } },
  { label: '30%', frac: { n: 3, d: 10 } },
  { label: '70%', frac: { n: 7, d: 10 } },
  { label: '5%', frac: { n: 1, d: 20 } },
  { label: '15%', frac: { n: 3, d: 20 } },
  { label: '100%', frac: { n: 1, d: 1 } },
]

const HARD_EXTRA_PERCENTS: PercentEntry[] = [
  { label: '12.5%', frac: { n: 1, d: 8 } },
  { label: '37.5%', frac: { n: 3, d: 8 } },
  { label: '62.5%', frac: { n: 5, d: 8 } },
  { label: '87.5%', frac: { n: 7, d: 8 } },
  { label: '33%', frac: { n: 1, d: 3 } },
  { label: '67%', frac: { n: 2, d: 3 } },
  { label: '17%', frac: { n: 1, d: 6 } },
  { label: '83%', frac: { n: 5, d: 6 } },
  { label: '22%', frac: { n: 2, d: 9 } },
  { label: '44%', frac: { n: 4, d: 9 } },
  { label: '56%', frac: { n: 5, d: 9 } },
  { label: '78%', frac: { n: 7, d: 9 } },
  { label: '35%', frac: { n: 7, d: 20 } },
  { label: '65%', frac: { n: 13, d: 20 } },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
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

function simplify(frac: Fraction): Fraction {
  const g = gcd(frac.n, frac.d)
  return { n: frac.n / g, d: frac.d / g }
}

function fracValue(frac: Fraction): number {
  return frac.n / frac.d
}

function formatFraction(frac: Fraction): string {
  const s = simplify(frac)
  if (s.d === 1) return String(s.n)
  return `${s.n}/${s.d}`
}

function pickDistinctStrings(correct: string, count: number, pool: string[]): string[] {
  const wrong: string[] = []
  const used = new Set<string>([correct])
  for (const item of shuffle(pool)) {
    if (wrong.length >= count) break
    if (used.has(item)) continue
    used.add(item)
    wrong.push(item)
  }
  return wrong
}

function buildOptions(
  correct: string,
  wrongPool: string[],
  optionCount: number,
): { options: FractionEstimateAnswer[]; correctIndex: number } {
  const wrong = pickDistinctStrings(correct, optionCount - 1, wrongPool)
  while (wrong.length < optionCount - 1) {
    const bump = wrong.length + 1
    const filler = `${bump}/${bump + 2}`
    if (!wrong.includes(filler) && filler !== correct) wrong.push(filler)
    if (wrong.length >= optionCount - 1) break
  }
  const options = shuffle([...wrong.slice(0, optionCount - 1), correct])
  const correctIndex = options.findIndex((o) => o === correct)
  return { options, correctIndex: correctIndex >= 0 ? correctIndex : 0 }
}

function percentWrongPool(correct: Fraction): string[] {
  const pool: string[] = []
  const correctStr = formatFraction(correct)
  for (const entry of EASY_PERCENTS) {
    const s = formatFraction(entry.frac)
    if (s !== correctStr) pool.push(s)
  }
  for (const delta of [1, 2]) {
    pool.push(formatFraction({ n: Math.max(1, correct.n + delta), d: correct.d }))
    pool.push(formatFraction({ n: Math.max(1, correct.n - delta), d: correct.d }))
    pool.push(formatFraction({ n: correct.n, d: correct.d + delta }))
    if (correct.d - delta > 0) {
      pool.push(formatFraction({ n: correct.n, d: correct.d - delta }))
    }
  }
  return pool
}

/** 高难百分题：干扰项取数值上最接近正确答案的分数 */
function pickNearWrongFractions(correct: Fraction, count: number): string[] {
  const correctStr = formatFraction(correct)
  const target = fracValue(correct)
  const seen = new Set<string>([correctStr])
  const candidates: { s: string; dist: number }[] = []

  const push = (frac: Fraction) => {
    const s = formatFraction(frac)
    if (seen.has(s)) return
    seen.add(s)
    const dist = Math.abs(fracValue(frac) - target)
    if (dist < 0.004) return
    candidates.push({ s, dist })
  }

  for (const delta of [-3, -2, -1, 1, 2, 3]) {
    push({ n: Math.max(1, correct.n + delta), d: correct.d })
    if (correct.d + delta > 1) push({ n: correct.n, d: correct.d + delta })
    if (correct.d - delta > 1) push({ n: correct.n, d: correct.d - delta })
  }
  for (const entry of [...EASY_PERCENTS, ...HARD_EXTRA_PERCENTS]) {
    push(entry.frac)
  }
  for (let d = 2; d <= 24; d++) {
    for (let n = 1; n < d; n++) {
      push({ n, d })
    }
  }

  const maxDist = 0.09
  let close = candidates.filter((c) => c.dist <= maxDist).sort((a, b) => a.dist - b.dist)
  if (close.length < count + 1) {
    close = candidates.sort((a, b) => a.dist - b.dist)
  }

  const wrong: string[] = []
  const used = new Set<string>()
  for (const c of close) {
    if (wrong.length >= count) break
    if (used.has(c.s)) continue
    used.add(c.s)
    wrong.push(c.s)
  }
  return wrong
}

/** 比较题：选项必含两个候选分数，题干只问「哪个更大」（分数在选项里） */
function buildFractionCompareQuestion(
  f1: Fraction,
  f2: Fraction,
  optionCount: number,
  extraDistractors: string[] = [],
): FractionEstimateQuestion {
  const s1 = formatFraction(f1)
  const s2 = formatFraction(f2)
  const larger = fracValue(f1) >= fracValue(f2) ? s1 : s2
  const smaller = larger === s1 ? s2 : s1

  const wrongCount = optionCount - 1
  const wrong: string[] = []
  const used = new Set<string>([larger])
  wrong.push(smaller)
  used.add(smaller)

  const pool = shuffle([
    ...extraDistractors.filter((d) => d !== larger && d !== smaller),
    formatFraction({ n: Math.max(1, f1.n), d: f1.d + 2 }),
    formatFraction({ n: Math.max(1, f2.n + 1), d: f2.d }),
  ])
  for (const d of pool) {
    if (wrong.length >= wrongCount) break
    if (used.has(d)) continue
    used.add(d)
    wrong.push(d)
  }
  while (wrong.length < wrongCount) {
    const filler = formatFraction({ n: randInt(1, 5), d: randInt(4, 11) })
    if (used.has(filler)) continue
    used.add(filler)
    wrong.push(filler)
  }

  const options = shuffle([larger, ...wrong.slice(0, wrongCount)])
  const correctIndex = options.findIndex((o) => o === larger)
  return {
    id: 0,
    expression: '哪个更大？',
    correctAnswer: larger,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function buildPercentToFraction(mode: FractionEstimateMode, optionCount: number): FractionEstimateQuestion {
  const easy = mode === 'fraction-easy'
  const pool = easy ? EASY_PERCENTS : [...EASY_PERCENTS, ...HARD_EXTRA_PERCENTS]
  const entry = pool[randInt(0, pool.length - 1)]!
  const correct = formatFraction(entry.frac)

  let options: FractionEstimateAnswer[]
  let correctIndex: number
  if (easy) {
    const built = buildOptions(correct, percentWrongPool(entry.frac), optionCount)
    options = built.options
    correctIndex = built.correctIndex
  } else {
    const wrong = pickNearWrongFractions(entry.frac, optionCount - 1)
    options = shuffle([correct, ...wrong])
    correctIndex = options.findIndex((o) => o === correct)
    if (correctIndex < 0) correctIndex = 0
  }

  return {
    id: 0,
    expression: `${entry.label} = ?`,
    correctAnswer: correct,
    options,
    correctIndex,
  }
}

function buildFractionCompareEasy(optionCount: number): FractionEstimateQuestion {
  if (Math.random() < 0.55) {
    const d = [2, 3, 4, 5, 6, 8, 10][randInt(0, 6)]!
    let n1 = randInt(1, d - 1)
    let n2 = randInt(1, d - 1)
    while (n2 === n1) n2 = randInt(1, d - 1)
    const f1 = simplify({ n: n1, d })
    const f2 = simplify({ n: n2, d })
    return buildFractionCompareQuestion(f1, f2, optionCount, [
      formatFraction({ n: 1, d: d + 1 }),
      formatFraction({ n: d - 1, d }),
    ])
  }

  const easyPairs: [Fraction, Fraction][] = [
    [{ n: 1, d: 2 }, { n: 1, d: 3 }],
    [{ n: 1, d: 2 }, { n: 2, d: 5 }],
    [{ n: 2, d: 3 }, { n: 3, d: 5 }],
    [{ n: 3, d: 4 }, { n: 2, d: 3 }],
    [{ n: 1, d: 4 }, { n: 1, d: 5 }],
    [{ n: 1, d: 3 }, { n: 1, d: 6 }],
  ]
  const [a, b] = easyPairs[randInt(0, easyPairs.length - 1)]!
  return buildFractionCompareQuestion(a, b, optionCount, [
    formatFraction({ n: a.n + b.n, d: a.d + b.d }),
  ])
}

function buildFractionCompareHard(optionCount: number): FractionEstimateQuestion {
  for (let attempt = 0; attempt < 40; attempt++) {
    const d1 = [5, 6, 7, 8, 9, 11, 12][randInt(0, 6)]!
    const d2 = [5, 6, 7, 8, 9, 11, 12][randInt(0, 6)]!
    const n1 = randInt(2, d1 - 1)
    const n2 = randInt(2, d2 - 1)
    const f1 = simplify({ n: n1, d: d1 })
    const f2 = simplify({ n: n2, d: d2 })
    const v1 = fracValue(f1)
    const v2 = fracValue(f2)
    const diff = Math.abs(v1 - v2)
    if (diff < 0.03 || diff > 0.22) continue

    return buildFractionCompareQuestion(f1, f2, optionCount, [
      formatFraction({ n: n1, d: n2 }),
      formatFraction({ n: n2, d: n1 }),
      formatFraction({ n: n1 + 1, d: d1 }),
      formatFraction({ n: n2 + 1, d: d2 }),
    ])
  }

  return buildFractionCompareEasy(optionCount)
}

export function generateFractionEstimateQuestion(
  mode: FractionEstimateMode,
  id: number,
  optionCount: number,
): FractionEstimateQuestion {
  const builders = [
    () => buildPercentToFraction(mode, optionCount),
    () =>
      mode === 'fraction-easy'
        ? buildFractionCompareEasy(optionCount)
        : buildFractionCompareHard(optionCount),
  ]
  const q = builders[randInt(0, builders.length - 1)]!()
  return { ...q, id }
}

export function getFractionEstimateQuestionFingerprint(q: FractionEstimateQuestion): string {
  return q.expression
}

export function getFractionEstimateModeConfig(
  mode: FractionEstimateMode,
): FractionEstimateModeConfig {
  return FRACTION_ESTIMATE_MODES.find((m) => m.id === mode) ?? FRACTION_ESTIMATE_MODES[0]!
}
