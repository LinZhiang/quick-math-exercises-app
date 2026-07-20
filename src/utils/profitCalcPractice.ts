/**
 * 高频运算 · 利润计算
 * 本地程序出题（不调用 AI）。每轮 4 题四选一。仅简单 / 困难。
 *
 * 教材（利润计算）公式：
 * - 利润 = 售价(收入) − 成本(支出)
 *
 * 考察重点：算「赚了多少钱」，把收入、进货支出、仓储等支出拆开相减。
 * 不考察利润率、百分点（归「利润率计算」）。
 *
 * 【简单】不高于经典真题 1（囤货涨价+仓储费+损耗，求存放天数或总利润）
 * 【困难】比真题 1 更高阶；≥5 种变式，每轮抽 4 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ProfitCalcDifficulty = 'easy' | 'hard'

export const PROFIT_CALC_QUESTION_COUNT = 4

export const PROFIT_CALC_MODES: {
  id: ProfitCalcDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '利润计算 · 简单',
    desc: '每轮 4 题 · 对齐/略低于经典真题 1（利润=收入−支出）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '利润计算 · 困难',
    desc: '每轮 4 题 · 比经典真题 1 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PROFIT_CALC_HARD_EXAM_TYPES = [
  {
    id: 'storage-find-days',
    name: '囤货求存放天数',
    note: '经典真题 1 加强：日涨价+日仓储+日损耗，已知总利润反推天数',
  },
  {
    id: 'storage-find-profit',
    name: '囤货求总利润',
    note: '给定存放天数，求总利润（收入−进货−仓储）',
  },
  {
    id: 'storage-find-rise',
    name: '反推日涨价幅度',
    note: '已知天数与总利润，反推每天涨价多少',
  },
  {
    id: 'storage-find-spoil',
    name: '反推日损耗量',
    note: '已知天数与总利润，反推每天损耗多少',
  },
  {
    id: 'compare-two-days',
    name: '两日方案比利润',
    note: '比较存放 a 天与 b 天哪种总利润更大（或差额）',
  },
  {
    id: 'extra-expense',
    name: '多项支出求利润',
    note: '收入减去进货、仓储、运费等多项支出求利润',
  },
] as const

export type ProfitCalcHardTypeId = (typeof PROFIT_CALC_HARD_EXAM_TYPES)[number]['id']

export type ProfitCalcQuestion = {
  id: string
  topic: 'profit-calc'
  difficulty: ProfitCalcDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ProfitCalcHardTypeId
}

export function profitCalcTopicLabel(): string {
  return '利润计算'
}

export function profitCalcDifficultyLabel(d: ProfitCalcDifficulty): string {
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
  if (Math.abs(n - r) > 1e-6) return null
  return r
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
    const n = Number(correct)
    const fake = Number.isFinite(n) ? String(Math.round(n) + g + 1) : `${correct}+${g}`
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && x !== correct).map((x) => String(Math.round(x))),
  )
}

function buildQuestion(input: {
  difficulty: ProfitCalcDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: ProfitCalcHardTypeId
  seq: number
}): ProfitCalcQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'profit-calc',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `pc-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'profit-calc',
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

/** 囤货模型：利润 = (进价+日涨×天)×(总量−日耗×天) − 进价×总量 − 日仓储×天 */
function storageProfit(p: {
  qty: number
  buy: number
  rise: number
  store: number
  spoil: number
  days: number
}): number {
  const sellPrice = p.buy + p.rise * p.days
  const sellQty = p.qty - p.spoil * p.days
  const revenue = sellPrice * sellQty
  const buyCost = p.buy * p.qty
  const storeCost = p.store * p.days
  return revenue - buyCost - storeCost
}

// ——— 简单 ———

/** 利润 = 售价 − 成本（单件或总量） */
function genEasyBasicProfit(seq: number): ProfitCalcQuestion | null {
  if (Math.random() < 0.5) {
    const cost = pickOne([80, 100, 120, 150, 200])
    const sell = pickOne([100, 120, 150, 180, 240])
    if (sell <= cost) return null
    const profit = sell - cost
    return buildQuestion({
      difficulty: 'easy',
      term: '售价减成本求利润',
      passage: `某商品进价（成本）${cost} 元，售价（收入）${sell} 元。`,
      stem: '利润是多少元？',
      correct: String(profit),
      distractors: uniqueNum(profit, [sell, cost, sell + cost, Math.round(profit / 2)]),
      method: '利润 = 售价(收入) − 成本(支出)。',
      explanation: `${sell}−${cost}=${profit}。`,
      seq,
    })
  }
  const unitCost = pickOne([20, 25, 30, 40])
  const unitSell = pickOne([30, 35, 40, 50])
  if (unitSell <= unitCost) return null
  const n = pickOne([10, 20, 50, 100])
  const profit = (unitSell - unitCost) * n
  return buildQuestion({
    difficulty: 'easy',
    term: '批量收入减支出求总利润',
    passage: `购进 ${n} 件商品，进价每件 ${unitCost} 元，全部按每件 ${unitSell} 元售出。`,
    stem: '总利润是多少元？',
    correct: String(profit),
    distractors: uniqueNum(profit, [unitSell * n, unitCost * n, unitSell - unitCost, profit / 2]),
    method: '总利润 = 总收入 − 总支出 = (售价−进价)×件数。',
    explanation: `(${unitSell}−${unitCost})×${n}=${profit}。`,
    seq,
  })
}

/** 收入 − 进货 − 固定费用 */
function genEasyRevenueMinusCosts(seq: number): ProfitCalcQuestion | null {
  const revenue = pickOne([5000, 8000, 10000, 12000])
  const buy = pickOne([3000, 4000, 5000, 6000])
  const fee = pickOne([200, 400, 500, 800])
  if (buy + fee >= revenue) return null
  const profit = revenue - buy - fee
  return buildQuestion({
    difficulty: 'easy',
    term: '收入减多项支出求利润',
    passage: `一批货销售收入 ${revenue} 元，进货支出 ${buy} 元，另付仓储（或运费）${fee} 元。`,
    stem: '利润是多少元？',
    correct: String(profit),
    distractors: uniqueNum(profit, [revenue - buy, revenue - fee, buy + fee, revenue]),
    method: '利润 = 收入 − 各项支出之和。',
    explanation: `${revenue}−${buy}−${fee}=${profit}。`,
    seq,
  })
}

/** 经典真题 1 同构：已知天数求利润（比反推天数更易） */
function genEasyStorageProfit(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 40; i++) {
    const qty = pickOne([2000, 3000, 4000, 5000])
    const buy = pickOne([2, 3, 4])
    const rise = pickOne([0.5, 1])
    const store = pickOne([200, 300, 400])
    const spoil = pickOne([5, 10])
    const days = pickOne([10, 15, 20, 24])
    if (spoil * days >= qty) continue
    const profit = storageProfit({ qty, buy, rise, store, spoil, days })
    const p = asNiceInt(profit)
    if (p == null || p <= 0) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '囤货已知天数求总利润',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。存放期间售价每天上涨 ${rise} 元/千克，每天仓储费共 ${store} 元，且每天损耗 ${spoil} 千克不能出售。存放 ${days} 天后一次性售出。`,
      stem: '总利润是多少元？',
      correct: String(p),
      distractors: uniqueNum(p, [
        asNiceInt((buy + rise * days) * (qty - spoil * days) - buy * qty) ?? p + 100,
        store * days,
        buy * qty,
        p + store * days,
      ]),
      method: '利润 = 销售收入 − 进货支出 − 仓储支出。',
      explanation: `售价 ${buy + rise * days} 元/千克，可售 ${qty - spoil * days} 千克；利润 ${p} 元。`,
      seq,
    })
  }
  return null
}

/** 经典真题 1：已知总利润反推天数（对齐教材） */
function genEasyClassic1Days(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 50; i++) {
    const qty = pickOne([4000, 5000])
    const buy = pickOne([2, 2.5, 3])
    const rise = pickOne([0.5, 1])
    const store = pickOne([300, 400, 500])
    const spoil = pickOne([8, 10])
    const maxDays = 60
    // 构造整数天，使利润为整数，再作为题干给出
    const days = pickOne([16, 20, 24, 28, 30])
    if (spoil * days >= qty || days > maxDays) continue
    const profit = storageProfit({ qty, buy, rise, store, spoil, days })
    const p = asNiceInt(profit)
    if (p == null || p <= 0) continue
    // 确保选项中其他天数利润不同
    const alts = [16, 20, 24, 28].filter((d) => d !== days)
    return buildQuestion({
      difficulty: 'easy',
      term: '囤货已知利润求存放天数（经典真题 1）',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克，放入冷库。市价每天上涨 ${rise} 元/千克，每天仓储费共 ${store} 元，且每天有 ${spoil} 千克损耗不能出售。最多可存放 ${maxDays} 天。最终一次性售出，总利润 ${p} 元。`,
      stem: '这批货存放了多少天后售出？',
      correct: String(days),
      distractors: uniqueNum(days, alts),
      method: '设存放 x 天：利润=(进价+日涨×x)×(总量−日耗×x)−进价×总量−日仓储×x，代入求 x（可带选项验算）。',
      explanation: `存放 ${days} 天时总利润为 ${p} 元。`,
      seq,
    })
  }
  // 教材原题数字
  return buildQuestion({
    difficulty: 'easy',
    term: '囤货已知利润求存放天数（经典真题 1）',
    passage:
      '购进 5000 千克大蒜，进价 2 元/千克，放入冷库。市价每天上涨 0.5 元/千克，每天仓储费共 400 元，且每天有 10 千克损耗不能出售。最多可存放 60 天。最终一次性售出，总利润 39600 元。',
    stem: '这批大蒜存放了多少天后售出？',
    correct: '20',
    distractors: uniqueNum(20, [16, 24, 28]),
    method: '设 x 天：(2+0.5x)(5000−10x)−2×5000−400x=39600，化简后带入选项，x=20。',
    explanation: '存放 20 天。',
    seq,
  })
}

// ——— 困难 ———

function genHardFindDays(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 60; i++) {
    const qty = pickOne([3000, 4000, 5000, 6000])
    const buy = pickOne([2, 3, 4, 5])
    const rise = pickOne([0.5, 1, 1.5])
    const store = pickOne([200, 300, 400, 500, 600])
    const spoil = pickOne([5, 8, 10, 12])
    const days = pickOne([12, 15, 18, 20, 24, 25, 30])
    if (spoil * days >= qty) continue
    const profit = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days }))
    if (profit == null || profit <= 0) continue
    // 验证邻近天数利润不同
    const near = [days - 4, days - 2, days + 2, days + 4].filter((d) => d > 0 && spoil * d < qty)
    if (near.some((d) => asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days: d })) === profit)) {
      continue
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '囤货求存放天数',
      hardTypeId: 'storage-find-days',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。存放期间售价每天上涨 ${rise} 元/千克，每天仓储费共 ${store} 元，每天损耗 ${spoil} 千克。一次性售出后总利润为 ${profit} 元。`,
      stem: '存放了多少天？',
      correct: String(days),
      distractors: uniqueNum(days, near.length ? near : [days + 2, days - 2, days + 4]),
      method: '利润=收入−进货−仓储。设天数 x，列式后带入选项验算。',
      explanation: `存放 ${days} 天时利润恰好为 ${profit} 元。`,
      seq,
    })
  }
  return null
}

function genHardFindProfit(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 40; i++) {
    const qty = pickOne([2500, 3500, 4500, 5500])
    const buy = pickOne([2, 3, 4])
    const rise = pickOne([0.5, 1])
    const store = pickOne([250, 350, 450])
    const spoil = pickOne([5, 10])
    const days = pickOne([12, 16, 18, 22, 25])
    if (spoil * days >= qty) continue
    const profit = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days }))
    if (profit == null || profit <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '囤货求总利润',
      hardTypeId: 'storage-find-profit',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。售价每天上涨 ${rise} 元/千克，每天仓储费 ${store} 元，每天损耗 ${spoil} 千克。存放 ${days} 天后售出。`,
      stem: '总利润是多少元？',
      correct: String(profit),
      distractors: uniqueNum(profit, [
        asNiceInt((buy + rise * days) * qty - buy * qty - store * days) ?? profit + 500,
        asNiceInt((buy + rise * days) * (qty - spoil * days) - buy * qty) ?? profit + 200,
        store * days,
        buy * qty,
      ]),
      method: '收入=(进价+日涨×天)×(总量−日耗×天)；利润=收入−进货−仓储。',
      explanation: `售价 ${buy + rise * days}，可售 ${qty - spoil * days}；利润 ${profit}。`,
      seq,
    })
  }
  return null
}

function genHardFindRise(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 50; i++) {
    const qty = pickOne([4000, 5000])
    const buy = pickOne([2, 3, 4])
    const rise = pickOne([0.5, 1, 1.5, 2])
    const store = pickOne([300, 400, 500])
    const spoil = pickOne([8, 10])
    const days = pickOne([10, 15, 20])
    if (spoil * days >= qty) continue
    const profit = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days }))
    if (profit == null || profit <= 0) continue
    // 题干给出利润与天数，问日涨价
    const riseText = Number.isInteger(rise) ? String(rise) : String(rise)
    return buildQuestion({
      difficulty: 'hard',
      term: '反推每天涨价多少',
      hardTypeId: 'storage-find-rise',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。存放 ${days} 天一次性售出，每天仓储费 ${store} 元，每天损耗 ${spoil} 千克。已知总利润 ${profit} 元，且售价每天均匀上涨。`,
      stem: '售价每天上涨多少元/千克？',
      correct: riseText,
      distractors: uniqueStr(riseText, ['0.5', '1', '1.5', '2', '2.5', '3'].filter((s) => s !== riseText)),
      method: '设日涨价为 r：利润=(进价+r×天)×(总量−日耗×天)−进货−仓储，解 r。',
      explanation: `日涨价 ${riseText} 元/千克时利润为 ${profit}。`,
      seq,
    })
  }
  return null
}

function genHardFindSpoil(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 50; i++) {
    const qty = pickOne([4000, 5000, 6000])
    const buy = pickOne([2, 3])
    const rise = pickOne([0.5, 1])
    const store = pickOne([400, 500])
    const spoil = pickOne([5, 8, 10, 12, 15])
    const days = pickOne([10, 16, 20])
    if (spoil * days >= qty) continue
    const profit = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days }))
    if (profit == null || profit <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '反推每天损耗量',
      hardTypeId: 'storage-find-spoil',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。存放 ${days} 天售出，售价每天上涨 ${rise} 元/千克，每天仓储费 ${store} 元。总利润 ${profit} 元。`,
      stem: '每天损耗多少千克？',
      correct: String(spoil),
      distractors: uniqueNum(spoil, [spoil + 2, spoil - 2, spoil + 5, 10].filter((x) => x > 0)),
      method: '设日损耗 s：可售量=总量−s×天，代入利润公式解 s。',
      explanation: `每天损耗 ${spoil} 千克。`,
      seq,
    })
  }
  return null
}

function genHardCompareDays(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 40; i++) {
    const qty = pickOne([4000, 5000])
    const buy = pickOne([2, 3])
    const rise = pickOne([0.5, 1])
    const store = pickOne([300, 400, 500])
    const spoil = pickOne([8, 10])
    const d1 = pickOne([10, 12, 15])
    const d2 = pickOne([20, 24, 25, 30])
    if (d2 <= d1) continue
    if (spoil * d2 >= qty) continue
    const p1 = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days: d1 }))
    const p2 = asNiceInt(storageProfit({ qty, buy, rise, store, spoil, days: d2 }))
    if (p1 == null || p2 == null || p1 === p2) continue
    const diff = Math.abs(p2 - p1)
    return buildQuestion({
      difficulty: 'hard',
      term: '两日方案比利润',
      hardTypeId: 'compare-two-days',
      passage: `购进 ${qty} 千克货物，进价 ${buy} 元/千克。售价每天上涨 ${rise} 元/千克，每天仓储费 ${store} 元，每天损耗 ${spoil} 千克。可选择存放 ${d1} 天或 ${d2} 天后一次性售出。`,
      stem: '利润较高的方案比另一方案多赚多少元？',
      correct: String(diff),
      distractors: uniqueNum(diff, [p1, p2, Math.abs(d2 - d1), diff + store]),
      method: '分别算两天方案的利润=收入−进货−仓储，再作差。',
      explanation: `存放 ${d1} 天利润 ${p1}，存放 ${d2} 天利润 ${p2}；差额 ${diff}。`,
      seq,
    })
  }
  return null
}

function genHardExtraExpense(seq: number): ProfitCalcQuestion | null {
  for (let i = 0; i < 40; i++) {
    const qty = pickOne([100, 200, 250])
    const buy = pickOne([40, 50, 60])
    const sell = pickOne([70, 80, 90])
    if (sell <= buy) continue
    const store = pickOne([500, 800, 1000])
    const freight = pickOne([200, 300, 400])
    const tax = pickOne([100, 150, 200])
    const profit = asNiceInt(sell * qty - buy * qty - store - freight - tax)
    if (profit == null || profit <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '多项支出求总利润',
      hardTypeId: 'extra-expense',
      passage: `购进 ${qty} 件商品，进价每件 ${buy} 元，全部按每件 ${sell} 元售出。另支付仓储费 ${store} 元、运费 ${freight} 元、杂费 ${tax} 元。`,
      stem: '总利润是多少元？',
      correct: String(profit),
      distractors: uniqueNum(profit, [
        (sell - buy) * qty,
        (sell - buy) * qty - store,
        sell * qty - buy * qty,
        profit + tax,
      ]),
      method: '利润 = 销售收入 − 进货支出 − 仓储 − 运费 − 杂费。',
      explanation: `${sell}×${qty}−${buy}×${qty}−${store}−${freight}−${tax}=${profit}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  ProfitCalcHardTypeId,
  (seq: number) => ProfitCalcQuestion | null
> = {
  'storage-find-days': genHardFindDays,
  'storage-find-profit': genHardFindProfit,
  'storage-find-rise': genHardFindRise,
  'storage-find-spoil': genHardFindSpoil,
  'compare-two-days': genHardCompareDays,
  'extra-expense': genHardExtraExpense,
}

function tryBuild(factory: () => ProfitCalcQuestion | null, maxTry = 50): ProfitCalcQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateProfitCalcPaper(difficulty: ProfitCalcDifficulty): ProfitCalcQuestion[] {
  const out: ProfitCalcQuestion[] = []
  const seen = new Set<string>()
  const push = (q: ProfitCalcQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyBasicProfit,
      genEasyRevenueMinusCosts,
      genEasyStorageProfit,
      genEasyClassic1Days,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PROFIT_CALC_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PROFIT_CALC_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<ProfitCalcHardTypeId>()
    const types = shuffleInPlace([...PROFIT_CALC_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= PROFIT_CALC_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = PROFIT_CALC_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < PROFIT_CALC_QUESTION_COUNT && guard++ < 40) {
      const pool = remain.length ? remain : PROFIT_CALC_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, PROFIT_CALC_QUESTION_COUNT)
}
