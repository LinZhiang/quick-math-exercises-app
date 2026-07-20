/**
 * 其他运算 · 分段问题（分段计算）
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材要点：不同区间有不同计价关系；「标准界限」划分各段。
 * 基本做法：
 * - 求费用：各段用量 × 单价累加
 * - 固定费用求最大用量：优先填满低价段，再用剩余预算 ÷ 当前段单价
 *
 * 【简单】比经典真题更易（两段、单年）
 * 【普通】对齐经典真题（三年阶梯气价、多年合计求最大用量）
 * 【困难】高于例题；≥6 变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SectionalDifficulty = 'easy' | 'medium' | 'hard'

export const SECTIONAL_QUESTION_COUNT = 5

export const SECTIONAL_MODES: {
  id: SectionalDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '分段 · 简单',
    desc: '每轮 5 题 · 比经典真题更易（两段计价）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '分段 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（阶梯气价求最大用量）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '分段 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const SECTIONAL_HARD_EXAM_TYPES = [
  { id: 'cost-high', name: '高用量求费', note: '跨多段求总费用' },
  { id: 'max-volume', name: '固定费用最大量', note: '经典加强：段数/年数更大' },
  { id: 'find-boundary', name: '反推界限', note: '已知用量与费用推界限' },
  { id: 'break-even', name: '两方案比较', note: '两套分段方案求更优' },
  { id: 'tax-bracket', name: '累进税率', note: '分段税率求应纳税额' },
  { id: 'excess-luggage', name: '超重加价', note: '免费额+超额单价' },
  { id: 'season-tiers', name: '分季分段', note: '不同季节不同界限' },
  { id: 'two-meters', name: '两表合计', note: '两户/两年分段再合计' },
] as const

export type SectionalHardTypeId = (typeof SECTIONAL_HARD_EXAM_TYPES)[number]['id']

export type SectionalQuestion = {
  id: string
  topic: 'sectional'
  difficulty: SectionalDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: SectionalHardTypeId
}

export function sectionalTopicLabel(): string {
  return '分段问题'
}

export function sectionalDifficultyLabel(d: SectionalDifficulty): string {
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

function uniqueStr(correct: string, cands: string[]): string[] {
  const out: string[] = []
  const seen = new Set([correct])
  for (const c of cands) {
    if (!c || seen.has(c)) continue
    seen.add(c)
    out.push(c)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3 && g < 50) {
    const fake = String(Number(correct) + g * 10)
    g++
    if (seen.has(fake) || fake === 'NaN') continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function numDistractors(correct: number, extras: number[] = []): string[] {
  const base = [
    correct - 100,
    correct + 100,
    correct - 50,
    correct + 50,
    correct - 200,
    correct + 200,
    Math.round(correct * 1.1),
    Math.round(correct * 0.9),
    ...extras,
  ]
    .filter((x) => Number.isFinite(x) && x !== correct && x > 0)
    .map((x) => String(Math.round(x)))
  return uniqueStr(String(correct), base)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function isNearInt(n: number, eps = 1e-6): boolean {
  return Math.abs(n - Math.round(n)) < eps
}

function buildQuestion(input: {
  difficulty: SectionalDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: SectionalHardTypeId
}): SectionalQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'sectional',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `sg-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'sectional',
    difficulty: input.difficulty,
    term: input.term,
    passage: input.passage.trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method.trim(),
    explanation: input.explanation.trim(),
    fingerprint,
    hardTypeId: input.hardTypeId,
  }
}

/** 两段：≤bound 用 p1，超出用 p2 */
function costTwoTier(usage: number, bound: number, p1: number, p2: number): number {
  if (usage <= bound) return usage * p1
  return bound * p1 + (usage - bound) * p2
}

/**
 * 三段气价（每年）：[0,b1] p1；(b1,b2] p2；>b2 p3
 * years 年合计预算 budget，求最大用量（优先填满低价段）
 */
function maxVolumeThreeTier(input: {
  years: number
  b1: number
  b2: number
  p1: number
  p2: number
  p3: number
  budget: number
}): { volume: number; method: string } | null {
  const { years, b1, b2, p1, p2, p3, budget } = input
  const cap1 = b1 * years
  const cap2 = (b2 - b1) * years
  const cost1 = round2(cap1 * p1)
  if (budget < cost1) {
    const v = budget / p1
    if (!isNearInt(v)) return null
    return {
      volume: Math.round(v),
      method: [
        `预算不足以填满一档。最大用量 = ${budget}÷${p1} = ${Math.round(v)}。`,
      ].join('\n'),
    }
  }
  let rem = round2(budget - cost1)
  const cost2full = round2(cap2 * p2)
  if (rem <= cost2full) {
    const v2 = rem / p2
    if (!isNearInt(v2)) return null
    const vol = cap1 + Math.round(v2)
    return {
      volume: vol,
      method: [
        `一档 ${cap1}×${p1}=${cost1}，剩余 ${rem}。`,
        `二档未满：${rem}÷${p2}=${Math.round(v2)}，总量 ${vol}。`,
      ].join('\n'),
    }
  }
  rem = round2(rem - cost2full)
  const v3 = rem / p3
  if (!isNearInt(v3)) return null
  const vol = b2 * years + Math.round(v3)
  return {
    volume: vol,
    method: [
      '固定预算想买尽可能多：先把便宜档用满，再用剩下的钱买贵档。',
      `一档容量 ${b1}×${years}=${cap1}（${years} 年额度合计），费用 ${cap1}×${p1}=${cost1}。`,
      `二档容量 (${b2}−${b1})×${years}=${cap2}，费用 ${cap2}×${p2}=${cost2full}；前两档累计 ${round2(cost1 + cost2full)}。`,
      `剩余预算 ${rem}÷${p3}=${Math.round(v3)}（进入三档）。`,
      `最大用量 = ${b2}×${years}+${Math.round(v3)}=${vol}。`,
    ].join('\n'),
  }
}

function costThreeTierYear(usage: number, b1: number, b2: number, p1: number, p2: number, p3: number): number {
  if (usage <= b1) return usage * p1
  if (usage <= b2) return b1 * p1 + (usage - b1) * p2
  return b1 * p1 + (b2 - b1) * p2 + (usage - b2) * p3
}

// ——— 简单 ———

function genEasyElecCost(seq: number): SectionalQuestion | null {
  const bound = pickOne([50, 60, 80, 100])
  const p1 = pickOne([1.2, 1.5, 0.8])
  const p2 = pickOne([2, 2.5, 1.8])
  const usage = pickOne([bound + 20, bound + 30, bound + 40, bound - 10].filter((u) => u > 0))
  const cost = round2(costTwoTier(usage, bound, p1, p2))
  // 答案用整数元若可，否则保留一位/两位合理显示
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'easy',
    term: '电费·两段求费',
    passage: `居民用电：每月不超过 ${bound} 度按 ${p1} 元/度计，超过部分按 ${p2} 元/度计。某户本月用电 ${usage} 度。`,
    stem: '本月电费多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [
      Math.round(usage * p1),
      Math.round(usage * p2),
      Math.round(bound * p1),
    ]),
    method:
      usage <= bound
        ? [`未超界限：费用 = ${usage}×${p1} = ${ans}。`]
        : [
            `标准界限 ${bound} 度。`,
            `费用 = ${bound}×${p1} + (${usage}−${bound})×${p2} = ${ans}。`,
          ].join('\n'),
    explanation: `答案 ${ans}。书中电费例同型（两段）。`,
    seq,
  })
}

function genEasyWaterCost(seq: number): SectionalQuestion | null {
  const bound = pickOne([10, 12, 15])
  const p1 = pickOne([2, 2.5, 3])
  const p2 = pickOne([4, 5, 4.5])
  const usage = pickOne([bound + 5, bound + 8, bound + 10])
  const cost = round2(costTwoTier(usage, bound, p1, p2))
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'easy',
    term: '水费·两段求费',
    passage: `用水：不超过 ${bound} 吨单价 ${p1} 元，超出部分 ${p2} 元/吨。本月用水 ${usage} 吨。`,
    stem: '水费多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [Math.round(usage * p1), Math.round(usage * p2)]),
    method: [`费用 = ${bound}×${p1}+(${usage}−${bound})×${p2} = ${ans}。`].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genEasyBelowBound(seq: number): SectionalQuestion | null {
  const bound = pickOne([50, 80, 100])
  const p1 = pickOne([1, 1.2, 1.5])
  const p2 = pickOne([2, 2.5])
  const usage = pickOne([20, 30, 40, Math.min(45, bound - 5)])
  const cost = round2(usage * p1)
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'easy',
    term: '未超界限',
    passage: `不超过 ${bound} 按 ${p1} 元计，超过按 ${p2} 元计。用量 ${usage}（未超界限）。`,
    stem: '费用多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [
      Math.round(costTwoTier(usage + bound, bound, p1, p2)),
      Math.round(usage * p2),
    ]),
    method: [`用量 ≤ ${bound}，整段按一档：${usage}×${p1} = ${ans}。`].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genEasyMaxByBudget(seq: number): SectionalQuestion | null {
  const bound = pickOne([50, 60, 80])
  const p1 = pickOne([1, 1.2, 1.5])
  const p2 = pickOne([2, 2.5, 3])
  // 构造整数：满一档后剩余预算刚好整除 p2
  const extra = pickOne([10, 20, 30, 40])
  const budget = round2(bound * p1 + extra * p2)
  const vol = bound + extra
  return buildQuestion({
    difficulty: 'easy',
    term: '两段·最大用量',
    passage: `分段计价：≤${bound} 按 ${p1} 元，超出按 ${p2} 元。现有预算正好 ${budget} 元，希望用量尽可能多。`,
    stem: '最多可用多少（单位量）？',
    correct: String(vol),
    distractors: numDistractors(vol, [bound, Math.round(budget / p1), Math.round(budget / p2)]),
    method: [
      `先用满低价段 ${bound}，花费 ${bound}×${p1}=${round2(bound * p1)}。`,
      `剩余 ${round2(budget - bound * p1)}÷${p2}=${extra}，总量 ${vol}。`,
    ].join('\n'),
    explanation: `答案 ${vol}。求最大用量：优先填低价段。`,
    seq,
  })
}

function genEasyTaxi(seq: number): SectionalQuestion | null {
  const baseKm = pickOne([3, 5])
  const baseFare = pickOne([10, 12, 14])
  const p = pickOne([2, 2.5, 3])
  const km = pickOne([baseKm + 4, baseKm + 6, baseKm + 8])
  const cost = round2(baseFare + (km - baseKm) * p)
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'easy',
    term: '打车分段',
    passage: `出租车：起步 ${baseKm} 公里 ${baseFare} 元，超出部分每公里 ${p} 元。行程 ${km} 公里。`,
    stem: '车费多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [Math.round(km * p), baseFare]),
    method: [`费用 = ${baseFare}+(${km}−${baseKm})×${p} = ${ans}。`].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

// ——— 普通（对齐经典气价） ———

function genMediumGasClassic(seq: number): SectionalQuestion | null {
  // 经典：500/700，1.89/2.27/2.84，2年，3082 → 1500
  // 生成同构：保证三档有剩余且整除
  for (let t = 0; t < 40; t++) {
    const years = pickOne([2, 2, 3])
    const b1 = pickOne([400, 500, 600])
    const b2 = b1 + pickOne([150, 200, 250])
    const p1 = pickOne([1.8, 1.89, 2])
    const p2 = pickOne([2.2, 2.27, 2.4])
    const p3 = pickOne([2.8, 2.84, 3])
    const v3 = pickOne([50, 80, 100, 120])
    const cost1 = round2(b1 * years * p1)
    const cost2 = round2((b2 - b1) * years * p2)
    const cost3 = round2(v3 * p3)
    const budget = round2(cost1 + cost2 + cost3)
    const volume = b2 * years + v3
    const check = maxVolumeThreeTier({ years, b1, b2, p1, p2, p3, budget })
    if (!check || check.volume !== volume) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '阶梯气价·最大用量',
      passage: `某市居民用气按年阶梯计价：年用气量 0～${b1} 立方米，单价 ${p1} 元；${b1 + 1}～${b2} 立方米，单价 ${p2} 元；${b2 + 1} 立方米以上，单价 ${p3} 元。某用户 ${years} 年共用气费 ${budget} 元。`,
      stem: '该用户这期间用气量最多为多少立方米？',
      correct: String(volume),
      distractors: numDistractors(volume, [b1 * years, b2 * years, b2 * years + v3 + 100, 1400, 1600]),
      method: check.method,
      explanation: `答案 ${volume}。对齐书中经典真题思路（先填满低价段）。`,
      seq,
    })
  }
  // fallback classic numbers
  const check = maxVolumeThreeTier({
    years: 2,
    b1: 500,
    b2: 700,
    p1: 1.89,
    p2: 2.27,
    p3: 2.84,
    budget: 3082,
  })
  if (!check) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '阶梯气价·经典',
    passage:
      '某市居民用气按年阶梯计价：0～500 立方米单价 1.89 元；501～700 立方米单价 2.27 元；701 立方米以上单价 2.84 元。某用户两年气费共 3082 元。',
    stem: '用气量最多为多少立方米？',
    correct: String(check.volume),
    distractors: ['1400', '1600', '1700'],
    method: check.method,
    explanation: `答案 ${check.volume}。书中经典真题。`,
    seq,
  })
}

function genMediumGasCost(seq: number): SectionalQuestion | null {
  const b1 = pickOne([400, 500])
  const b2 = b1 + pickOne([200, 250])
  const p1 = pickOne([1.8, 2])
  const p2 = pickOne([2.2, 2.5])
  const p3 = pickOne([2.8, 3])
  const usage = b2 + pickOne([50, 100, 150])
  const cost = round2(costThreeTierYear(usage, b1, b2, p1, p2, p3))
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'medium',
    term: '阶梯气价·求费',
    passage: `年阶梯气价：0～${b1} 为 ${p1} 元，${b1 + 1}～${b2} 为 ${p2} 元，超过 ${b2} 为 ${p3} 元。某年用气 ${usage} 立方米。`,
    stem: '应缴气费多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [
      Math.round(usage * p1),
      Math.round(b2 * p2),
    ]),
    method: [
      `一档 ${b1}×${p1}=${round2(b1 * p1)}；`,
      `二档 (${b2}−${b1})×${p2}=${round2((b2 - b1) * p2)}；`,
      `三档 (${usage}−${b2})×${p3}=${round2((usage - b2) * p3)}；`,
      `合计 ${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genMediumElecYears(seq: number): SectionalQuestion | null {
  const bound = pickOne([200, 240, 300])
  const p1 = pickOne([0.5, 0.6])
  const p2 = pickOne([0.8, 0.9])
  const years = 2
  const extra = pickOne([40, 60, 80])
  const budget = round2(bound * years * p1 + extra * p2)
  const vol = bound * years + extra
  return buildQuestion({
    difficulty: 'medium',
    term: '电费·两年最大量',
    passage: `电价：年用电量不超过 ${bound} 度按 ${p1} 元/度，超出按 ${p2} 元/度。某户 ${years} 年电费共 ${budget} 元，希望用电量尽可能多。`,
    stem: '两年用电量最多多少度？',
    correct: String(vol),
    distractors: numDistractors(vol, [bound * years, Math.round(budget / p1)]),
    method: [
      `两年一档容量 ${bound}×${years}=${bound * years}，花费 ${round2(bound * years * p1)}。`,
      `剩余 ${round2(budget - bound * years * p1)}÷${p2}=${extra}，总量 ${vol}。`,
    ].join('\n'),
    explanation: `答案 ${vol}。`,
    seq,
  })
}

function genMediumComparePlans(seq: number): SectionalQuestion | null {
  const usage = pickOne([80, 100, 120])
  const aBound = 50
  const a1 = 1.2
  const a2 = 2
  const bFlat = pickOne([1.5, 1.6, 1.8])
  const costA = round2(costTwoTier(usage, aBound, a1, a2))
  const costB = round2(usage * bFlat)
  const cheaper = costA <= costB ? 'A' : 'B'
  const save = Math.abs(costA - costB)
  const ans = isNearInt(save) ? String(Math.round(save)) : String(round2(save))
  return buildQuestion({
    difficulty: 'medium',
    term: '两方案差价',
    passage: `方案A：不超过 ${aBound} 按 ${a1} 元，超出按 ${a2} 元。方案B：统一 ${bFlat} 元。用量 ${usage}。`,
    stem: `更省的方案比另一方案少花多少元？（答案填差额）`,
    correct: ans,
    distractors: numDistractors(Number(ans), [Math.round(costA), Math.round(costB)]),
    method: [
      `A 费用 = ${costA}；B 费用 = ${costB}。`,
      `更省的是方案${cheaper}，差额 |${costA}−${costB}|=${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genMediumFindUsageFromCost(seq: number): SectionalQuestion | null {
  const bound = pickOne([50, 60, 80])
  const p1 = pickOne([1, 1.2])
  const p2 = pickOne([2, 2.5])
  const extra = pickOne([15, 20, 25, 30])
  const cost = round2(bound * p1 + extra * p2)
  const usage = bound + extra
  return buildQuestion({
    difficulty: 'medium',
    term: '已知费用求用量',
    passage: `分段：≤${bound} 为 ${p1} 元，超出为 ${p2} 元。某次费用恰好 ${cost} 元，且已超过一档界限。`,
    stem: '用量是多少？',
    correct: String(usage),
    distractors: numDistractors(usage, [bound, Math.round(cost / p1)]),
    method: [
      `一档花费 ${bound}×${p1}=${round2(bound * p1)}，剩余 ${round2(cost - bound * p1)}÷${p2}=${extra}。`,
      `用量 = ${bound}+${extra}=${usage}。`,
    ].join('\n'),
    explanation: `答案 ${usage}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardCostHigh(seq: number): SectionalQuestion | null {
  const b1 = pickOne([100, 150])
  const b2 = b1 + pickOne([100, 150])
  const b3 = b2 + pickOne([100, 200])
  const p1 = 1
  const p2 = 1.5
  const p3 = 2
  const p4 = 3
  const usage = b3 + pickOne([50, 80, 100])
  const cost = round2(
    b1 * p1 + (b2 - b1) * p2 + (b3 - b2) * p3 + (usage - b3) * p4,
  )
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  return buildQuestion({
    difficulty: 'hard',
    term: '高用量求费',
    hardTypeId: 'cost-high',
    passage: `四段计价：0～${b1} 为 ${p1} 元；${b1 + 1}～${b2} 为 ${p2} 元；${b2 + 1}～${b3} 为 ${p3} 元；超过 ${b3} 为 ${p4} 元。用量 ${usage}。`,
    stem: '总费用多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [Math.round(usage * p1), Math.round(usage * p4)]),
    method: [
      `${b1}×${p1} + (${b2}−${b1})×${p2} + (${b3}−${b2})×${p3} + (${usage}−${b3})×${p4} = ${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。跨四段累加。`,
    seq,
  })
}

function genHardMaxVolume(seq: number): SectionalQuestion | null {
  for (let t = 0; t < 40; t++) {
    const years = pickOne([3, 4])
    const b1 = pickOne([500, 600])
    const b2 = b1 + pickOne([200, 250])
    const p1 = pickOne([1.5, 1.8])
    const p2 = pickOne([2.0, 2.2])
    const p3 = pickOne([2.5, 2.8])
    const v3 = pickOne([60, 80, 100, 120])
    const budget = round2(b1 * years * p1 + (b2 - b1) * years * p2 + v3 * p3)
    const check = maxVolumeThreeTier({ years, b1, b2, p1, p2, p3, budget })
    if (!check || check.volume !== b2 * years + v3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '固定费用最大量',
      hardTypeId: 'max-volume',
      passage: `年阶梯：0～${b1} 单价 ${p1}；${b1 + 1}～${b2} 单价 ${p2}；超过 ${b2} 单价 ${p3}。${years} 年费用共 ${budget} 元。`,
      stem: '用量最多多少？',
      correct: String(check.volume),
      distractors: numDistractors(check.volume, [b1 * years, b2 * years]),
      method: check.method,
      explanation: `答案 ${check.volume}。比经典年数更多。`,
      seq,
    })
  }
  return null
}

function genHardFindBoundary(seq: number): SectionalQuestion | null {
  const bound = pickOne([40, 50, 60, 80])
  const p1 = pickOne([1, 1.2, 1.5])
  const p2 = pickOne([2, 2.5, 3])
  const extra = pickOne([20, 30, 40])
  const usage = bound + extra
  const cost = round2(bound * p1 + extra * p2)
  // 已知 usage、cost、p1、p2，求 bound
  // cost = bound*p1 + (usage-bound)*p2 = usage*p2 + bound*(p1-p2)
  // bound = (cost - usage*p2) / (p1-p2)
  return buildQuestion({
    difficulty: 'hard',
    term: '反推界限',
    hardTypeId: 'find-boundary',
    passage: `两段计价：不超过某界限按 ${p1} 元，超出按 ${p2} 元。用量 ${usage}，费用 ${cost} 元。`,
    stem: '该标准界限是多少？',
    correct: String(bound),
    distractors: numDistractors(bound, [usage, extra, Math.round(usage / 2)]),
    method: [
      `设界限为 x：x×${p1}+(${usage}−x)×${p2}=${cost}。`,
      `x(${p1}−${p2})=${cost}−${usage}×${p2} ⇒ x=${bound}。`,
    ].join('\n'),
    explanation: `答案 ${bound}。`,
    seq,
  })
}

function genHardBreakEven(seq: number): SectionalQuestion | null {
  // 方案A两段 vs 方案B统价，求用量相等费用时的临界用量（在二档区）
  const bound = pickOne([50, 60])
  const p1 = 1
  const p2 = 2
  const flat = pickOne([1.4, 1.5, 1.6])
  // bound*p1 + (x-bound)*p2 = x*flat
  // bound*p1 - bound*p2 = x*flat - x*p2
  // bound(p1-p2) = x(flat-p2)
  // x = bound(p1-p2)/(flat-p2)
  const x = (bound * (p1 - p2)) / (flat - p2)
  if (!isNearInt(x) || x <= bound) return null
  const ans = Math.round(x)
  return buildQuestion({
    difficulty: 'hard',
    term: '两方案比较',
    hardTypeId: 'break-even',
    passage: `方案甲：≤${bound} 按 ${p1} 元，超出按 ${p2} 元。方案乙：统一 ${flat} 元。`,
    stem: '两种方案费用相等时，用量是多少？（答案取整数）',
    correct: String(ans),
    distractors: numDistractors(ans, [bound, Math.round(bound * flat)]),
    method: [
      `设用量 x>${bound}：${bound}×${p1}+(x−${bound})×${p2}=x×${flat}。`,
      `解得 x=${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genHardTaxBracket(seq: number): SectionalQuestion | null {
  // 简化累进：0-3000 3%；3000-12000 10%；超过 20%。应税所得 income
  const b1 = 3000
  const b2 = 12000
  const r1 = 0.03
  const r2 = 0.1
  const r3 = 0.2
  const income = pickOne([8000, 10000, 15000, 20000])
  let tax: number
  if (income <= b1) tax = income * r1
  else if (income <= b2) tax = b1 * r1 + (income - b1) * r2
  else tax = b1 * r1 + (b2 - b1) * r2 + (income - b2) * r3
  tax = round2(tax)
  const ans = isNearInt(tax) ? String(Math.round(tax)) : String(tax)
  return buildQuestion({
    difficulty: 'hard',
    term: '累进税率',
    hardTypeId: 'tax-bracket',
    passage: `个人所得税（简化）：不超过 ${b1} 按 ${r1 * 100}%；${b1 + 1}～${b2} 按 ${r2 * 100}%；超过 ${b2} 按 ${r3 * 100}%。应纳税所得额 ${income} 元。`,
    stem: '应纳税额多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [
      Math.round(income * r1),
      Math.round(income * r2),
    ]),
    method: [
      income <= b1
        ? `${income}×${r1}=${ans}`
        : income <= b2
          ? `${b1}×${r1}+(${income}−${b1})×${r2}=${ans}`
          : `${b1}×${r1}+(${b2}−${b1})×${r2}+(${income}−${b2})×${r3}=${ans}`,
    ].join('\n'),
    explanation: `答案 ${ans}。分段税率累加。`,
    seq,
  })
}

function genHardExcessLuggage(seq: number): SectionalQuestion | null {
  const free = pickOne([20, 23, 30])
  const p = pickOne([50, 80, 100])
  const weight = free + pickOne([5, 8, 10, 12])
  const cost = (weight - free) * p
  return buildQuestion({
    difficulty: 'hard',
    term: '超重加价',
    hardTypeId: 'excess-luggage',
    passage: `行李免费额 ${free} kg，超出部分每 kg 收费 ${p} 元。旅客行李 ${weight} kg。`,
    stem: '超重费多少元？',
    correct: String(cost),
    distractors: numDistractors(cost, [weight * p, free * p]),
    method: [`超重 ${weight}−${free}=${weight - free} kg，费用 = ${weight - free}×${p}=${cost}。`].join(
      '\n',
    ),
    explanation: `答案 ${cost}。`,
    seq,
  })
}

function genHardSeasonTiers(seq: number): SectionalQuestion | null {
  // 夏：界限 100，p1=1 p2=2；冬：界限 150，p1=1 p2=2。夏用 a 冬用 b，求总费
  const summerBound = 100
  const winterBound = 150
  const p1 = 1
  const p2 = 2
  const summer = pickOne([120, 140, 160])
  const winter = pickOne([130, 160, 180])
  const cost =
    round2(costTwoTier(summer, summerBound, p1, p2) + costTwoTier(winter, winterBound, p1, p2))
  const ans = String(Math.round(cost))
  return buildQuestion({
    difficulty: 'hard',
    term: '分季分段',
    hardTypeId: 'season-tiers',
    passage: `夏季用电：≤${summerBound} 度 ${p1} 元，超出 ${p2} 元；冬季：≤${winterBound} 度 ${p1} 元，超出 ${p2} 元。某户夏用电 ${summer} 度、冬用电 ${winter} 度。`,
    stem: '夏冬电费合计多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [
      Math.round((summer + winter) * p1),
      Math.round((summer + winter) * p2),
    ]),
    method: [
      `夏：${summerBound}×${p1}+(${summer}−${summerBound})×${p2}=${round2(costTwoTier(summer, summerBound, p1, p2))}；`,
      `冬：${winterBound}×${p1}+(${winter}−${winterBound})×${p2}=${round2(costTwoTier(winter, winterBound, p1, p2))}；`,
      `合计 ${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genHardTwoMeters(seq: number): SectionalQuestion | null {
  const bound = pickOne([50, 60])
  const p1 = 1.2
  const p2 = 2
  const u1 = bound + pickOne([10, 20])
  const u2 = bound + pickOne([15, 25])
  const cost = round2(costTwoTier(u1, bound, p1, p2) + costTwoTier(u2, bound, p1, p2))
  const ans = isNearInt(cost) ? String(Math.round(cost)) : String(cost)
  // 干扰：合并计量
  const merged = round2(costTwoTier(u1 + u2, bound, p1, p2))
  return buildQuestion({
    difficulty: 'hard',
    term: '两表合计',
    hardTypeId: 'two-meters',
    passage: `两户各自按「≤${bound} 为 ${p1} 元，超出 ${p2} 元」计价。甲用电 ${u1} 度，乙用电 ${u2} 度。`,
    stem: '两户电费合计多少元？',
    correct: ans,
    distractors: numDistractors(Number(ans), [Math.round(merged), Math.round((u1 + u2) * p1)]),
    method: [
      `甲：${round2(costTwoTier(u1, bound, p1, p2))}；乙：${round2(costTwoTier(u2, bound, p1, p2))}；合计 ${ans}。`,
      `注意：不可先把用电量相加再分段（合并计量会得到 ${Math.round(merged)}，一般更少）。`,
    ].join('\n'),
    explanation: `答案 ${ans}。分户分段后再加总。`,
    seq,
  })
}

const HARD_BUILDERS: Record<SectionalHardTypeId, (seq: number) => SectionalQuestion | null> = {
  'cost-high': genHardCostHigh,
  'max-volume': genHardMaxVolume,
  'find-boundary': genHardFindBoundary,
  'break-even': genHardBreakEven,
  'tax-bracket': genHardTaxBracket,
  'excess-luggage': genHardExcessLuggage,
  'season-tiers': genHardSeasonTiers,
  'two-meters': genHardTwoMeters,
}

function tryBuild(factory: () => SectionalQuestion | null, maxTry = 40): SectionalQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type Factory = { key: string; build: (seq: number) => SectionalQuestion | null }

export function generateSectionalPaper(difficulty: SectionalDifficulty): SectionalQuestion[] {
  const out: SectionalQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: SectionalQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: Factory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= SECTIONAL_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < SECTIONAL_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'elec', build: genEasyElecCost },
      { key: 'water', build: genEasyWaterCost },
      { key: 'below', build: genEasyBelowBound },
      { key: 'max2', build: genEasyMaxByBudget },
      { key: 'taxi', build: genEasyTaxi },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'gas-max', build: genMediumGasClassic },
      { key: 'gas-cost', build: genMediumGasCost },
      { key: 'elec-years', build: genMediumElecYears },
      { key: 'compare', build: genMediumComparePlans },
      { key: 'from-cost', build: genMediumFindUsageFromCost },
    ])
  } else {
    const used = new Set<SectionalHardTypeId>()
    const types = shuffleInPlace([...SECTIONAL_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= SECTIONAL_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = SECTIONAL_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < SECTIONAL_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : SECTIONAL_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30), typeId)
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, SECTIONAL_QUESTION_COUNT)
}
