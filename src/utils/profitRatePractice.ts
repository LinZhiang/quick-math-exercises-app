/**
 * 高频运算 · 利润率计算
 * 本地程序出题（不调用 AI）。每轮 4 题四选一。仅简单 / 困难。
 *
 * 教材公式：
 * - 利润率 = 利润 / 成本 = (售价 − 成本) / 成本 = 售价 / 成本 − 1
 *
 * 【简单】不高于经典真题 2（售价不变、成本变动导致利润率百分点变化，求原利润率；或公式直算）
 * 【困难】比真题 2 更高阶；≥5 种变式，每轮抽 4 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ProfitRateDifficulty = 'easy' | 'hard'

export const PROFIT_RATE_QUESTION_COUNT = 4

export const PROFIT_RATE_MODES: {
  id: ProfitRateDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '利润率计算 · 简单',
    desc: '每轮 4 题 · 对齐/略低于经典真题 2（利润率公式、成本变动+售价不变）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '利润率计算 · 困难',
    desc: '每轮 4 题 · 比经典真题 2 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PROFIT_RATE_HARD_EXAM_TYPES = [
  {
    id: 'cost-drop-pp',
    name: '成本下降求原利润率',
    note: '经典真题 2 加强：出厂价下降、售价不变、利润率升若干百分点',
  },
  {
    id: 'cost-up-pp',
    name: '成本上升求原利润率',
    note: '成本上升、售价不变，利润率下降若干百分点，反推原利润率',
  },
  {
    id: 'sell-change-pp',
    name: '售价变动求原利润率',
    note: '成本不变、售价变动，利润率变化若干百分点',
  },
  {
    id: 'both-change-new-rate',
    name: '成本售价双变求新利润率',
    note: '成本与售价同时按比例变化，求变化后利润率',
  },
  {
    id: 'find-cost-drop',
    name: '反推成本下降幅度',
    note: '已知原/新利润率与售价不变，求成本下降百分之几',
  },
  {
    id: 'two-goods-rate',
    name: '两商品利润率比较',
    note: '两件商品成本售价不同，求利润率之差（百分点）',
  },
] as const

export type ProfitRateHardTypeId = (typeof PROFIT_RATE_HARD_EXAM_TYPES)[number]['id']

export type ProfitRateQuestion = {
  id: string
  topic: 'profit-rate'
  difficulty: ProfitRateDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ProfitRateHardTypeId
}

export function profitRateTopicLabel(): string {
  return '利润率计算'
}

export function profitRateDifficultyLabel(d: ProfitRateDifficulty): string {
  if (d === 'easy') return '简单'
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

function asNiceInt(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n)
  if (Math.abs(n - r) > 1e-8) return null
  return r
}

/** 允许整数或一位小数（如 6.4） */
function asNiceDec1(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n * 10) / 10
  if (Math.abs(n - r) > 1e-8 || r <= 0) return null
  return r
}

function fmtPctNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n)
}

/** 成本降 p%、售价不变、利润率升 δ 个百分点 ⇒ 原利润率 x = (100-p)δ/p − 100 */
function originalRateAfterCostDrop(p: number, deltaPp: number): number | null {
  if (p <= 0 || p >= 100) return null
  return asNiceInt(((100 - p) * deltaPp) / p - 100)
}

/** 成本升 p%、售价不变、利润率降 δ 个百分点 ⇒ 原利润率
 * 100(1+r) = 100(1+p)(1+r−d)
 * 1+r = (1+p)(1+r-d)
 * 1+r = (1+p)(1+r) - (1+p)d
 * (1+p)d = (1+p)(1+r) - (1+r) = p(1+r)
 * 1+r = (1+p)d/p
 * r = (1+p)d/p - 1
 * x = (100+p)δ/p - 100
 */
function originalRateAfterCostUp(p: number, deltaPp: number): number | null {
  if (p <= 0) return null
  return asNiceInt(((100 + p) * deltaPp) / p - 100)
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
  while (out.length < need && g++ < 50) {
    const n = Number(String(correct).replace(/%/g, ''))
    const fake = Number.isFinite(n)
      ? `${Math.round(n) + g + 1}${correct.includes('%') ? '%' : ''}`
      : `${correct}+${g}`
    const key = fake.replace(/\s+/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniquePct(correct: number, cands: number[]): string[] {
  return uniqueStr(
    `${correct}%`,
    cands.filter((x) => Number.isFinite(x) && x !== correct).map((x) => `${Math.round(x)}%`),
  )
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && x !== correct).map((x) => String(Math.round(x))),
  )
}

function buildQuestion(input: {
  difficulty: ProfitRateDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: ProfitRateHardTypeId
  seq: number
}): ProfitRateQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'profit-rate',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `pr-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'profit-rate',
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

// ——— 简单 ———

/** 利润率 = (售价−成本)/成本 */
function genEasyBasicRate(seq: number): ProfitRateQuestion | null {
  const cost = pickOne([80, 100, 120, 150, 200])
  const sell = pickOne([100, 120, 150, 180, 240])
  if (sell <= cost) return null
  const rate = asNiceInt(((sell - cost) * 100) / cost)
  if (rate == null || rate <= 0) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '由售价成本求利润率',
    passage: `某商品成本 ${cost} 元，售价 ${sell} 元。`,
    stem: '利润率是多少？',
    correct: `${rate}%`,
    distractors: uniquePct(rate, [
      asNiceInt(((sell - cost) * 100) / sell) ?? rate + 5,
      sell - cost,
      rate + 10,
      Math.round((sell / cost) * 100),
    ]),
    method: '利润率 = (售价 − 成本) / 成本 = 售价/成本 − 1。',
    explanation: `(${sell}−${cost})/${cost}=${rate}%。`,
    seq,
  })
}

/** 售价 = 成本×(1+利润率) 的逆用：已知利润率求售价或成本 */
function genEasyRateLink(seq: number): ProfitRateQuestion | null {
  if (Math.random() < 0.5) {
    const cost = pickOne([100, 200, 250, 400])
    const rate = pickOne([10, 20, 25, 40])
    const sell = asNiceInt(cost * (1 + rate / 100))
    if (sell == null) return null
    return buildQuestion({
      difficulty: 'easy',
      term: '成本与利润率求售价',
      passage: `某商品成本 ${cost} 元，利润率 ${rate}%。`,
      stem: '售价是多少元？',
      correct: String(sell),
      distractors: uniqueNum(sell, [cost + rate, cost * (rate / 100), cost, sell + rate]),
      method: '售价 = 成本 × (1 + 利润率)。',
      explanation: `${cost}×(1+${rate}%)=${sell}。`,
      seq,
    })
  }
  const sell = pickOne([120, 150, 180, 240])
  const rate = pickOne([20, 25, 50])
  const cost = asNiceInt(sell / (1 + rate / 100))
  if (cost == null) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '售价与利润率求成本',
    passage: `某商品售价 ${sell} 元，利润率 ${rate}%。`,
    stem: '成本是多少元？',
    correct: String(cost),
    distractors: uniqueNum(cost, [sell, asNiceInt(sell * (1 - rate / 100)) ?? cost + 10, sell - rate, cost + 20]),
    method: '成本 = 售价 ÷ (1 + 利润率)。',
    explanation: `${sell}÷(1+${rate}%)=${cost}。`,
    seq,
  })
}

/** 经典真题 2 同构：出厂价下降、售价不变、利润率升 δ 个百分点 */
function genEasyClassic2(seq: number): ProfitRateQuestion | null {
  for (let i = 0; i < 60; i++) {
    // 选用能得到整数原利润率的 (p, δ)
    const pairs: [number, number][] = [
      [6.4, 8], // 真题：17%
      [8, 10], // (92)*10/8 - 100 = 15
      [5, 6], // 95*6/5 - 100 = 14
      [10, 12], // 90*12/10 - 100 = 8
      [4, 5], // 96*5/4 - 100 = 20
      [20, 25], // 80*25/20 - 100 = 0 → skip
      [8, 12], // 92*12/8 - 100 = 38
      [16, 20], // 84*20/16 - 100 = 5
    ]
    const [p, delta] = pickOne(pairs)
    const x = originalRateAfterCostDrop(p, delta)
    if (x == null || x <= 0) continue
    const pText = Number.isInteger(p) ? String(p) : String(p)
    return buildQuestion({
      difficulty: 'easy',
      term: '成本下降售价不变求原利润率（经典真题 2）',
      passage: `某商品出厂价下降 ${pText}% 后，经销商售价不变，利润率提高了 ${delta} 个百分点。`,
      stem: '原来的利润率是多少？',
      correct: `${x}%`,
      distractors: uniquePct(x, [delta, asNiceInt(p) ?? 10, x + delta, x - delta].filter((n) => n != null) as number[]),
      method: '赋值原成本 100，售价不变：100(1+原利润率)=(100−降幅)(1+原利润率+提高的百分点)。',
      explanation: `原利润率 = (100−${pText})×${delta}÷${pText} − 100 = ${x}%。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '成本下降售价不变求原利润率（经典真题 2）',
    passage: '某商品出厂价下降 6.4% 后，经销商售价不变，利润率提高了 8 个百分点。',
    stem: '原来的利润率是多少？',
    correct: '17%',
    distractors: uniquePct(17, [5, 10, 23]),
    method: '赋值原成本 100：100(1+x%)=93.6(1+x%+8%) ⇒ x=17。',
    explanation: '原来的利润率为 17%。',
    seq,
  })
}

/** 略简：直接给成本变化前后的利润率关系中的部分量 */
function genEasyRateDiff(seq: number): ProfitRateQuestion | null {
  const cost = pickOne([100, 200])
  const sell = pickOne([120, 150, 180])
  if (sell <= cost) return null
  const rate1 = asNiceInt(((sell - cost) * 100) / cost)
  if (rate1 == null) return null
  const newCost = asNiceInt(cost * pickOne([0.8, 0.9, 0.75]))
  if (newCost == null || newCost >= sell) return null
  const rate2 = asNiceInt(((sell - newCost) * 100) / newCost)
  if (rate2 == null) return null
  const diff = rate2 - rate1
  if (diff <= 0) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '成本下降后利润率提高多少',
    passage: `某商品售价 ${sell} 元不变。成本由 ${cost} 元降为 ${newCost} 元。`,
    stem: '利润率提高了多少个百分点？',
    correct: String(diff),
    distractors: uniqueNum(diff, [rate1, rate2, rate2 - rate1 + 2, Math.abs(cost - newCost)]),
    method: '分别算变化前后利润率，再作差（单位：百分点）。',
    explanation: `原 ${rate1}% → 新 ${rate2}% ，提高 ${diff} 个百分点。`,
    seq,
  })
}

// ——— 困难 ———

function genHardCostDropPp(seq: number): ProfitRateQuestion | null {
  for (let i = 0; i < 50; i++) {
    const p = pickOne([4, 5, 6.4, 8, 10, 12.5, 16, 20])
    const delta = pickOne([5, 6, 8, 10, 12, 15, 16, 20, 25])
    const x = originalRateAfterCostDrop(p, delta)
    if (x == null || x <= 0 || x >= 80) continue
    // 加强：问「改革后利润率」而非原利润率
    const askNew = Math.random() < 0.5
    if (askNew) {
      const neu = x + delta
      return buildQuestion({
        difficulty: 'hard',
        term: '成本下降求改革后利润率',
        hardTypeId: 'cost-drop-pp',
        passage: `出厂价下降 ${p}% 后，经销商售价不变，利润率比原来提高 ${delta} 个百分点。`,
        stem: '改革后该商品的利润率是多少？',
        correct: `${neu}%`,
        distractors: uniquePct(neu, [x, delta, x + Math.round(p), neu + 5]),
        method: '先求原利润率 x=(100−p)δ/p−100，再加提高的百分点。',
        explanation: `原利润率 ${x}%，改革后 ${neu}%。`,
        seq,
      })
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '成本下降求原利润率',
      hardTypeId: 'cost-drop-pp',
      passage: `某商品进价下降 ${p}% ，经销商仍按原价销售，利润率提高了 ${delta} 个百分点。`,
      stem: '原来的利润率是多少？',
      correct: `${x}%`,
      distractors: uniquePct(x, [delta, asNiceInt(p) ?? 10, x + delta, Math.round(delta / (p / 100))]),
      method: '赋值原成本 100，售价不变列方程；或用 x=(100−p)δ/p−100。',
      explanation: `原利润率=${x}%。`,
      seq,
    })
  }
  return null
}

function genHardCostUpPp(seq: number): ProfitRateQuestion | null {
  for (let i = 0; i < 50; i++) {
    const p = pickOne([4, 5, 8, 10, 16, 20, 25])
    const delta = pickOne([4, 5, 6, 8, 10, 12])
    const x = originalRateAfterCostUp(p, delta)
    if (x == null || x <= 0 || x >= 100) continue
    // 新利润率须为正：x - delta > 0
    if (x - delta <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '成本上升求原利润率',
      hardTypeId: 'cost-up-pp',
      passage: `某商品进价上涨 ${p}% 后，经销商售价不变，利润率下降了 ${delta} 个百分点。`,
      stem: '原来的利润率是多少？',
      correct: `${x}%`,
      distractors: uniquePct(x, [delta, p, x - delta, x + delta]),
      method: '赋值原成本 100：100(1+原)=(100+涨幅)(1+原−下降百分点)。',
      explanation: `原利润率 = (100+${p})×${delta}÷${p} − 100 = ${x}%。`,
      seq,
    })
  }
  return null
}

function genHardSellChangePp(seq: number): ProfitRateQuestion | null {
  // 成本不变，售价涨 q%，利润率提高 δ 个百分点，求原利润率
  // cost=100, sell0=100(1+r), sell1=100(1+r)(1+q)
  // new rate: sell1/100 - 1 = (1+r)(1+q) - 1 = r + q + rq
  // new - old = q + rq = q(1+r) = δ/100 (δ in pp as decimal... δ pp means δ/100)
  // q(1+r) = d where d=δ/100, q in decimal
  // 1+r = d/q, r = d/q - 1
  // x = 100*δ_decimal/q_decimal - 100 = δ/q_pct * 100? 
  // q_pct = q*100, δ = delta pp
  // q(1+r) = δ/100
  // 1+r = (δ/100)/q = δ/(q_pct)
  // r = δ/q_pct - 1
  // x = 100*(δ/q_pct - 1) = 100*δ/q_pct - 100
  for (let i = 0; i < 50; i++) {
    const q = pickOne([5, 8, 10, 12.5, 16, 20, 25])
    const delta = pickOne([6, 8, 10, 12, 15, 16, 20])
    const x = asNiceInt((100 * delta) / q - 100)
    if (x == null || x <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '售价上涨求原利润率',
      hardTypeId: 'sell-change-pp',
      passage: `某商品成本不变，售价上涨 ${q}% 后，利润率提高了 ${delta} 个百分点。`,
      stem: '原来的利润率是多少？',
      correct: `${x}%`,
      distractors: uniquePct(x, [delta, asNiceInt(q) ?? 10, x + delta, delta - Math.round(q)]),
      method: '赋值成本 100。利润率提高量 = 售价涨幅 × (1+原利润率)。',
      explanation: `原利润率 = 100×${delta}÷${q} − 100 = ${x}%。`,
      seq,
    })
  }
  return null
}

function genHardBothChangeNewRate(seq: number): ProfitRateQuestion | null {
  for (let i = 0; i < 40; i++) {
    const cost = pickOne([100, 200, 250])
    const rate0 = pickOne([20, 25, 40, 50])
    const sell = asNiceInt(cost * (1 + rate0 / 100))
    if (sell == null) continue
    const costFactor = pickOne([0.8, 0.9, 1.1, 1.2])
    const sellFactor = pickOne([0.9, 0.95, 1.05, 1.1])
    if (costFactor === 1 && sellFactor === 1) continue
    const c2 = asNiceInt(cost * costFactor)
    const s2 = asNiceInt(sell * sellFactor)
    if (c2 == null || s2 == null || s2 <= c2) continue
    const rate1 = asNiceInt(((s2 - c2) * 100) / c2)
    if (rate1 == null) continue
    const cPct = asNiceInt((costFactor - 1) * 100)
    const sPct = asNiceInt((sellFactor - 1) * 100)
    if (cPct == null || sPct == null) continue
    const cDesc = cPct >= 0 ? `上升 ${cPct}%` : `下降 ${-cPct}%`
    const sDesc = sPct >= 0 ? `上升 ${sPct}%` : `下降 ${-sPct}%`
    return buildQuestion({
      difficulty: 'hard',
      term: '成本售价双变求新利润率',
      hardTypeId: 'both-change-new-rate',
      passage: `某商品原成本 ${cost} 元，原利润率 ${rate0}%。现成本${cDesc}，售价${sDesc}。`,
      stem: '变化后的利润率是多少？',
      correct: `${rate1}%`,
      distractors: uniquePct(rate1, [rate0, rate0 + cPct, rate0 + sPct, rate1 + 5]),
      method: '先求原售价，再算新成本、新售价，最后用利润率=(售价−成本)/成本。',
      explanation: `原售价 ${sell}；新成本 ${c2}、新售价 ${s2}；利润率 ${rate1}%。`,
      seq,
    })
  }
  return null
}

function genHardFindCostDrop(seq: number): ProfitRateQuestion | null {
  // 已知原利润率 x%、提高 δ 个百分点，售价不变，求成本下降 p%
  // p = 100δ / (x+100+δ)
  for (let i = 0; i < 50; i++) {
    const x = pickOne([10, 15, 17, 20, 25, 30])
    const delta = pickOne([5, 6, 8, 10, 12, 15])
    const p = asNiceDec1((100 * delta) / (x + 100 + delta))
    if (p == null || p >= 50) continue
    const check = originalRateAfterCostDrop(p, delta)
    if (check !== x) continue
    const pText = fmtPctNum(p)
    const distractorNums = [delta, x, asNiceDec1((100 * delta) / (x + 100)) ?? p + 2, p + 4]
      .map((n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : n))
    return buildQuestion({
      difficulty: 'hard',
      term: '反推成本下降幅度',
      hardTypeId: 'find-cost-drop',
      passage: `经销商售价不变。进价下降后，利润率由 ${x}% 提高到 ${x + delta}%（即提高 ${delta} 个百分点）。`,
      stem: '进价下降了百分之几？',
      correct: `${pText}%`,
      distractors: uniqueStr(
        `${pText}%`,
        distractorNums.filter((n) => n !== p).map((n) => `${fmtPctNum(n as number)}%`),
      ),
      method: '售价不变：原成本×(1+原利润率)=新成本×(1+新利润率)，新成本=原成本×(1−降幅)。',
      explanation: `降幅 p=100×${delta}÷(${x}+100+${delta})=${pText}%。`,
      seq,
    })
  }
  return null
}

function genHardTwoGoodsRate(seq: number): ProfitRateQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c1 = pickOne([80, 100, 120])
    const c2 = pickOne([90, 100, 150, 200])
    const r1 = pickOne([20, 25, 30, 40])
    const r2 = pickOne([10, 15, 20, 50])
    if (r1 === r2) continue
    const s1 = asNiceInt(c1 * (1 + r1 / 100))
    const s2 = asNiceInt(c2 * (1 + r2 / 100))
    if (s1 == null || s2 == null) continue
    const diff = Math.abs(r1 - r2)
    const higher = r1 > r2 ? '甲' : '乙'
    return buildQuestion({
      difficulty: 'hard',
      term: '两商品利润率之差',
      hardTypeId: 'two-goods-rate',
      passage: `甲商品成本 ${c1} 元、售价 ${s1} 元；乙商品成本 ${c2} 元、售价 ${s2} 元。`,
      stem: `${higher}商品的利润率比另一件高多少个百分点？`,
      correct: String(diff),
      distractors: uniqueNum(diff, [r1, r2, Math.abs(s1 - s2), Math.abs(c1 - c2)]),
      method: '分别用利润率=(售价−成本)/成本计算，再作差。',
      explanation: `甲 ${r1}%、乙 ${r2}% ，差 ${diff} 个百分点。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  ProfitRateHardTypeId,
  (seq: number) => ProfitRateQuestion | null
> = {
  'cost-drop-pp': genHardCostDropPp,
  'cost-up-pp': genHardCostUpPp,
  'sell-change-pp': genHardSellChangePp,
  'both-change-new-rate': genHardBothChangeNewRate,
  'find-cost-drop': genHardFindCostDrop,
  'two-goods-rate': genHardTwoGoodsRate,
}

function tryBuild(factory: () => ProfitRateQuestion | null, maxTry = 50): ProfitRateQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateProfitRatePaper(difficulty: ProfitRateDifficulty): ProfitRateQuestion[] {
  const out: ProfitRateQuestion[] = []
  const seen = new Set<string>()
  const push = (q: ProfitRateQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyBasicRate, genEasyRateLink, genEasyClassic2, genEasyRateDiff]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PROFIT_RATE_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PROFIT_RATE_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<ProfitRateHardTypeId>()
    const types = shuffleInPlace([...PROFIT_RATE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= PROFIT_RATE_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = PROFIT_RATE_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < PROFIT_RATE_QUESTION_COUNT && guard++ < 40) {
      const pool = remain.length ? remain : PROFIT_RATE_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, PROFIT_RATE_QUESTION_COUNT)
}
