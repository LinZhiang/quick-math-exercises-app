/**
 * 运算技巧 · 十字交叉法
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【简单】对齐「示例」：已知 a、b、混合 c，直接交叉求份数比
 * 【中等】对齐经典真题：先算混合率 c（可含亏损负值），再交叉求成本/份量比
 * 【困难】比经典更难，登记 ≥8 种；每轮抽 5 种且互不重复
 * 1. ask-amount：已知总投入与盈亏，求某一份量金额
 * 2. find-rate：已知份量与混合率，反求某一分量率
 * 3. dilute-water：加水稀释后求原液:水 或终浓度
 * 4. three-step：三组分两步交叉
 * 5. add-to-target：已知目标浓度，求应加多少
 * 6. reverse-part：已知比与 a、c，反求 b
 * 7. double-mix：两批混合再并批
 * 8. alloy-ask：合金/溶液求某一金属质量
 * 9. age-change：调入/调出后平均年龄交叉
 * 10. profit-compound：先涨后跌或两阶段盈亏再交叉
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type CrossMethodDifficulty = 'easy' | 'medium' | 'hard'

export const CROSS_METHOD_QUESTION_COUNT = 5

export const CROSS_METHOD_MODES: {
  id: CrossMethodDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '十字交叉法 · 简单',
    desc: '每轮 5 题 · 对齐示例（已知 a、b、c 直接交叉）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '十字交叉法 · 中等',
    desc: '每轮 5 题 · 对齐经典真题（先算混合率再交叉，可含亏损）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '十字交叉法 · 困难',
    desc: '每轮 5 题 · 比经典更难的 10 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const CROSS_METHOD_HARD_EXAM_TYPES = [
  {
    id: 'ask-amount',
    name: '交叉后求金额',
    note: '已知总投入与盈亏，交叉得比后再求某一份量金额',
  },
  {
    id: 'find-rate',
    name: '反求分量率',
    note: '已知份量与混合率，反求某一分量的百分率',
  },
  {
    id: 'dilute-water',
    name: '加水稀释',
    note: '浓度与纯水（0%）交叉，求原液与水之比或终浓度',
  },
  {
    id: 'three-step',
    name: '三组分两步交叉',
    note: '先交叉两组，再与第三组交叉',
  },
  {
    id: 'add-to-target',
    name: '加到目标浓度',
    note: '已知现有溶液与目标浓度，求应加多少另一溶液',
  },
  {
    id: 'reverse-part',
    name: '已知比反求分量',
    note: '已知份量比与 a、c，反求 b',
  },
  {
    id: 'double-mix',
    name: '两批再并批',
    note: '两批各自有混合率，再并批求总比或总量',
  },
  {
    id: 'alloy-ask',
    name: '合金求质量',
    note: '两种合金混合，交叉后求某一金属质量',
  },
  {
    id: 'age-change',
    name: '调人后平均年龄',
    note: '调入/调出改变平均年龄，用交叉还原人数比',
  },
  {
    id: 'profit-compound',
    name: '两阶段盈亏交叉',
    note: '两种商品经历不同涨跌后再交叉求成本比',
  },
] as const

export type CrossMethodHardTypeId = (typeof CROSS_METHOD_HARD_EXAM_TYPES)[number]['id']

export type CrossMethodQuestion = {
  id: string
  topic: 'cross-method'
  difficulty: CrossMethodDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: CrossMethodHardTypeId
}

export function crossMethodTopicLabel(): string {
  return '十字交叉法'
}

export function crossMethodDifficultyLabel(d: CrossMethodDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
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
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function reduceRatio(x: number, y: number): [number, number] {
  const g = gcd(x, y)
  return [x / g, y / g]
}

function ratioStr(x: number, y: number): string {
  const [a, b] = reduceRatio(x, y)
  return `${a}:${b}`
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
    const fake = `${correct}+${g}`
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(String(Number(correct) + g || `${g}:${g + 1}`))
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && Number.isInteger(x) && x !== correct).map(String),
  )
}

function uniqueOpt(correct: string, cands: (string | number)[]): string[] {
  return uniqueStr(correct, cands.map(String))
}

function buildQuestion(input: {
  difficulty: CrossMethodDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: CrossMethodHardTypeId
  seq: number
}): CrossMethodQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'cross-method',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `cross-method-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'cross-method',
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

function crossParts(a: number, b: number, c: number): [number, number] | null {
  const x = c - b
  const y = a - c
  if (x <= 0 || y <= 0) return null
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    // allow scaled integers later via common denominator approach for rates in 0.01
  }
  return [x, y]
}

// ——— 简单 ———

function genEasyScore(seq: number): CrossMethodQuestion | null {
  const pool = [
    { a: 92, b: 87, c: 89 },
    { a: 90, b: 80, c: 84 },
    { a: 95, b: 85, c: 89 },
    { a: 88, b: 82, c: 85 },
    { a: 96, b: 84, c: 90 },
  ]
  const t = pickOne(pool)
  const parts = crossParts(t.a, t.b, t.c)
  if (!parts) return null
  const ans = ratioStr(parts[0], parts[1])
  return buildQuestion({
    difficulty: 'easy',
    term: '平均分交叉（示例）',
    passage: `某班期末考试平均分 ${t.c} 分，男生平均 ${t.a} 分，女生平均 ${t.b} 分。`,
    stem: '男生人数与女生人数之比是？',
    correct: ans,
    distractors: uniqueOpt(ans, [
      ratioStr(parts[1], parts[0]),
      `${t.a - t.c}:${t.c - t.b}`,
      '1:1',
      '2:3',
      '3:2',
      '5:3',
    ]),
    method: '十字交叉：高分在上、低分在下，中间写全班平均；交叉相减得人数比。',
    explanation: `交叉得男:女 = (${t.c}-${t.b}):(${t.a}-${t.c}) = ${parts[0]}:${parts[1]} = ${ans}。`,
    seq,
  })
}

function genEasyConcentration(seq: number): CrossMethodQuestion | null {
  const pool = [
    { a: 50, b: 20, c: 35 },
    { a: 40, b: 10, c: 25 },
    { a: 60, b: 30, c: 45 },
    { a: 80, b: 20, c: 50 },
  ]
  const t = pickOne(pool)
  const parts = crossParts(t.a, t.b, t.c)
  if (!parts) return null
  const ans = ratioStr(parts[0], parts[1])
  return buildQuestion({
    difficulty: 'easy',
    term: '浓度交叉',
    passage: `把浓度为 ${t.a}% 与 ${t.b}% 的两种溶液混合，得到浓度为 ${t.c}% 的溶液。`,
    stem: '两种溶液的质量之比是？',
    correct: ans,
    distractors: uniqueOpt(ans, [ratioStr(parts[1], parts[0]), '1:1', '2:1', '3:2', '4:3']),
    method: '浓度交叉后右侧比为溶液质量比（分母量之比）。',
    explanation: `交叉：(${t.c}-${t.b}):(${t.a}-${t.c}) = ${parts[0]}:${parts[1]} = ${ans}。`,
    seq,
  })
}

function genEasyAge(seq: number): CrossMethodQuestion | null {
  const pool = [
    { a: 40, b: 20, c: 28 },
    { a: 50, b: 30, c: 38 },
    { a: 36, b: 24, c: 30 },
  ]
  const t = pickOne(pool)
  const parts = crossParts(t.a, t.b, t.c)
  if (!parts) return null
  const ans = ratioStr(parts[0], parts[1])
  return buildQuestion({
    difficulty: 'easy',
    term: '平均年龄交叉',
    passage: `甲组平均年龄 ${t.a} 岁，乙组平均年龄 ${t.b} 岁，两组合计平均年龄 ${t.c} 岁。`,
    stem: '甲、乙两组人数之比是？',
    correct: ans,
    distractors: uniqueOpt(ans, [ratioStr(parts[1], parts[0]), '1:1', '2:3', '3:2']),
    method: '平均量交叉，右侧为人数比。',
    explanation: `交叉得甲:乙 = ${parts[0]}:${parts[1]} = ${ans}。`,
    seq,
  })
}

function genEasyPrice(seq: number): CrossMethodQuestion | null {
  const pool = [
    { a: 12, b: 8, c: 10 },
    { a: 15, b: 9, c: 12 },
    { a: 20, b: 10, c: 14 },
  ]
  const t = pickOne(pool)
  const parts = crossParts(t.a, t.b, t.c)
  if (!parts) return null
  const ans = ratioStr(parts[0], parts[1])
  return buildQuestion({
    difficulty: 'easy',
    term: '单价交叉',
    passage: `甲种商品单价 ${t.a} 元，乙种单价 ${t.b} 元，按某种数量搭配后平均单价 ${t.c} 元。`,
    stem: '甲、乙商品数量之比是？',
    correct: ans,
    distractors: uniqueOpt(ans, [ratioStr(parts[1], parts[0]), '1:1', '2:1', '3:1']),
    method: '单价交叉，右侧为数量比。',
    explanation: `交叉得甲:乙 = ${ans}。`,
    seq,
  })
}

// ——— 中等（经典：先算 c，再交叉；可含负盈亏） ———

function genMediumStock(seq: number): CrossMethodQuestion | null {
  // Classic: A +15%, B -10%, total 24000, profit 1350 → c=1350/24000=9/160
  // Generalize with integer-friendly numbers
  const templates = [
    { total: 24000, profit: 1350, up: 15, down: 10 }, // 5:3
    { total: 20000, profit: 1000, up: 20, down: 10 }, // 3:2
    { total: 16000, profit: 400, up: 15, down: 5 }, // 2:1
    { total: 30000, profit: 1500, up: 20, down: 10 }, // 1:1
    { total: 12000, profit: 600, up: 25, down: 5 }, // 1:2
  ]

  for (const t of shuffleInPlace([...templates])) {
    const a = t.up / 100
    const b = -t.down / 100
    const c = t.profit / t.total
    // scale by 10000 for integer cross
    const scale = 10000
    const A = Math.round(a * scale)
    const B = Math.round(b * scale)
    const C = Math.round(c * scale)
    const x = C - B
    const y = A - C
    if (x <= 0 || y <= 0) continue
    const ans = ratioStr(x, y)
    // verify against template ans if provided for classic
    return buildQuestion({
      difficulty: 'medium',
      term: '股票盈亏交叉（经典型）',
      passage: `小孙用 ${t.total} 元购买甲、乙两种股票。当甲股票上涨 ${t.up}%、乙股票下跌 ${t.down}% 时全部卖出，共获利 ${t.profit} 元。`,
      stem: '购买甲、乙股票的资金之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, ['5:3', '8:5', '8:3', '3:5', '2:1', '3:2', ratioStr(y, x)]),
      method: '先算总收益率 c=利润/成本，再对 a、b、c 做十字交叉；右侧为成本之比。',
      explanation: `c=${t.profit}/${t.total}。交叉：(${fractionish(c)}−(${-t.down}%)) : (${t.up}%−${fractionish(c)}) = ${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '股票盈亏交叉（经典型）',
    passage:
      '小孙用 24000 元购买甲、乙两种股票。当甲上涨 15%、乙下跌 10% 时全部卖出，共获利 1350 元。',
    stem: '购买甲、乙股票的资金之比是？',
    correct: '5:3',
    distractors: uniqueOpt('5:3', ['8:5', '8:3', '3:5']),
    method: 'c=1350/24000=9/160；交叉得成本比 5:3。',
    explanation: 'c−b=25/160，a−c=15/160 ⇒ 25:15=5:3。',
    seq,
  })
}

function fractionish(c: number): string {
  // display as percent-ish or simplified
  const pct = Math.round(c * 10000) / 100
  return `${pct}%`
}

function genMediumProfitGoods(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const up = pickOne([10, 15, 20, 25])
    const down = pickOne([5, 10, 15])
    const rx = pickOne([2, 3, 4, 5])
    const ry = pickOne([2, 3, 4])
    // construct c from ratio so numbers work
    // x/y = (c-b)/(a-c) ⇒ x(a-c)=y(c-b) ⇒ c(x+y)=xa+yb
    const a = up
    const b = -down
    const cNum = a * rx + b * ry
    const cDen = rx + ry
    if (cNum % cDen !== 0 && (cNum * 100) % cDen !== 0) {
      // allow one decimal percent
    }
    const c = cNum / cDen
    const total = pickOne([10000, 12000, 15000, 20000])
    const profit = Math.round((c / 100) * total)
    if (Math.abs((profit / total) * 100 - c) > 1e-6) {
      // force exact: profit = total * c / 100
    }
    const profitExact = (total * cNum) / (cDen * 100)
    if (!Number.isInteger(profitExact)) continue
    const ans = ratioStr(rx, ry)
    return buildQuestion({
      difficulty: 'medium',
      term: '商品盈亏交叉',
      passage: `某店购进甲、乙两种商品共花费 ${total} 元。甲按 ${up}% 利润售出，乙按 ${down}% 亏损售出，共获利 ${profitExact} 元。`,
      stem: '甲、乙两种商品的进价之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, [ratioStr(ry, rx), '1:1', '2:1', '3:2', '5:3']),
      method: '总收益率 c=利润/成本，再对利润率、亏损率做十字交叉。',
      explanation: `c=${profitExact}/${total}；交叉得进价比 ${ans}。`,
      seq,
    })
  }
  return null
}

function genMediumConcNeedC(seq: number): CrossMethodQuestion | null {
  // Two solutions mixed by known masses? Actually medium should compute c from totals
  // Or: given solute amounts and solution masses → c, then ask something else
  // Better: known a,b and total mass + total solute → c → verify ratio... circular.
  // Medium: salt solutions — A 20% mass m1 unknown; give final mass and salt → find ratio via cross after computing c
  for (let t = 0; t < 30; t++) {
    const a = pickOne([40, 50, 60])
    const b = pickOne([10, 20, 30])
    const rx = pickOne([1, 2, 3])
    const ry = pickOne([1, 2, 3])
    if (rx === ry && Math.random() < 0.3) continue
    const unit = pickOne([10, 20, 25])
    const ma = rx * unit
    const mb = ry * unit
    const total = ma + mb
    const salt = (a * ma + b * mb) / 100
    if (!Number.isInteger(salt)) continue
    const c = (salt / total) * 100
    if (!Number.isInteger(c)) continue
    const ans = ratioStr(rx, ry)
    return buildQuestion({
      difficulty: 'medium',
      term: '溶液混合交叉',
      passage: `把 ${a}% 与 ${b}% 的盐溶液混合，得到 ${total} 克、含盐 ${salt} 克的溶液。`,
      stem: '两种溶液的质量之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, [ratioStr(ry, rx), '1:1', '2:1', '3:2']),
      method: '先算混合浓度 c=含盐÷总质量，再十字交叉得质量比。',
      explanation: `c=${c}%；交叉 (${c}-${b}):(${a}-${c}) = ${ans}。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardAskAmount(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const up = pickOne([15, 20, 25])
    const down = pickOne([5, 10])
    const rx = pickOne([3, 4, 5])
    const ry = pickOne([2, 3])
    const a = up
    const b = -down
    const cNum = a * rx + b * ry
    const cDen = rx + ry
    const unit = pickOne([2000, 3000, 4000])
    const total = (rx + ry) * unit
    const profit = (total * cNum) / (cDen * 100)
    if (!Number.isInteger(profit)) continue
    const askA = Math.random() < 0.5
    const ans = askA ? rx * unit : ry * unit
    return buildQuestion({
      difficulty: 'hard',
      term: '交叉后求金额',
      hardTypeId: 'ask-amount',
      passage: `购进甲、乙两种商品共花费 ${total} 元。甲按 ${up}% 利润售出，乙按 ${down}% 亏损售出，共获利 ${profit} 元。`,
      stem: askA ? '甲商品进价是多少元？' : '乙商品进价是多少元？',
      correct: String(ans),
      distractors: uniqueNum(ans, [ry * unit, rx * unit, total / 2, unit, ans + unit]),
      method: '先算总收益率，十字交叉得进价比，再按总价分配。',
      explanation: `交叉得甲:乙=${rx}:${ry}；每份 ${unit} 元；所求=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardFindRate(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([40, 50, 60, 70])
    const ma = pickOne([20, 30, 40])
    const mb = pickOne([20, 30, 40, 50])
    const c = pickOne([30, 35, 40, 45])
    // (c-b)/(a-c) = ma/mb ⇒ mb(c-b)=ma(a-c) ⇒ b = c - ma(a-c)/mb
    const num = ma * (a - c)
    if (num % mb !== 0) continue
    const b = c - num / mb
    if (b <= 0 || b >= c || !Number.isInteger(b)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '反求分量率',
      hardTypeId: 'find-rate',
      passage: `把 ${ma} 克、浓度 ${a}% 的溶液与 ${mb} 克另一溶液混合，得到浓度 ${c}% 的溶液。`,
      stem: '另一溶液的浓度是多少？',
      correct: String(b),
      distractors: uniqueNum(b, [c, a, b + 5, b - 5, Math.round((a + c) / 2)].filter((x) => x > 0)),
      method: '由质量比反推交叉差：已知 (c−b):(a−c)=质量比，解出 b。',
      explanation: `(${c}−b):(${a}−${c})=${ma}:${mb} ⇒ ${c}−b=${num / mb} ⇒ b=${b}%。`,
      seq,
    })
  }
  return null
}

function genHardDiluteWater(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([40, 50, 60, 80])
    const c = pickOne([20, 25, 30, 40])
    if (c >= a) continue
    const b = 0
    const parts = crossParts(a, b, c)
    if (!parts) continue
    const ask = pickOne(['ratio', 'water'] as const)
    if (ask === 'ratio') {
      const ans = ratioStr(parts[0], parts[1])
      return buildQuestion({
        difficulty: 'hard',
        term: '加水稀释',
        hardTypeId: 'dilute-water',
        passage: `把浓度为 ${a}% 的溶液加水稀释到 ${c}%。`,
        stem: '原溶液与所加水的质量之比是？',
        correct: ans,
        distractors: uniqueOpt(ans, [ratioStr(parts[1], parts[0]), '1:1', '2:1', '1:2']),
        method: '水看作 0% 溶液，与原浓度、目标浓度做十字交叉。',
        explanation: `交叉 (${c}-0):(${a}-${c}) = ${parts[0]}:${parts[1]} = ${ans}。`,
        seq,
      })
    }
    const orig = pickOne([40, 50, 60, 80])
    const waterParts = parts[1]
    const origParts = parts[0]
    const unit = pickOne([2, 5, 10])
    const water = waterParts * unit
    const ans = water
    return buildQuestion({
      difficulty: 'hard',
      term: '加水稀释',
      hardTypeId: 'dilute-water',
      passage: `有 ${origParts * unit} 克、浓度 ${a}% 的溶液，要稀释到 ${c}%。`,
      stem: '需要加水多少克？',
      correct: String(ans),
      distractors: uniqueNum(ans, [orig, water + unit, origParts * unit, ans * 2]),
      method: '0% 与 a%、c% 交叉得原液:水，再按已知原液求水。',
      explanation: `原液:水=${origParts}:${waterParts}；原液 ${origParts * unit} 克 ⇒ 加水 ${ans} 克。`,
      seq,
    })
  }
  return null
}

function genHardThreeStep(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([60, 70, 80])
    const b = pickOne([20, 30])
    const d = pickOne([10, 20])
    const c1 = pickOne([40, 45, 50])
    const c2 = pickOne([30, 35, 40])
    if (c1 <= b || c1 >= a || c2 <= d || c2 >= c1) continue
    const p1 = crossParts(a, b, c1)
    const p2 = crossParts(c1, d, c2)
    if (!p1 || !p2) continue
    // Ask ratio of first solution to third among final mix — harder
    // Masses: A:B = p1, then (A+B):D = p2
    const mAB_unit = p2[0]
    const mD = p2[1]
    const mA = (p1[0] * mAB_unit) / (p1[0] + p1[1])
    const mB = (p1[1] * mAB_unit) / (p1[0] + p1[1])
    if (!Number.isInteger(mA) || !Number.isInteger(mB)) {
      // scale
      const scale = p1[0] + p1[1]
      const mA2 = p1[0] * mAB_unit
      const mB2 = p1[1] * mAB_unit
      const mD2 = mD * scale
      const ans = ratioStr(mA2, mD2)
      return buildQuestion({
        difficulty: 'hard',
        term: '三组分两步交叉',
        hardTypeId: 'three-step',
        passage: `先将 ${a}% 与 ${b}% 的溶液混合成 ${c1}% 的溶液，再与 ${d}% 的溶液混合成 ${c2}% 的溶液。`,
        stem: '第一次所用高浓度溶液与最后加入的低浓度溶液质量之比是？',
        correct: ans,
        distractors: uniqueOpt(ans, [
          ratioStr(mB2, mD2),
          ratioStr(mAB_unit, mD),
          '1:1',
          '2:1',
          '3:1',
        ]),
        method: '先对 a、b、c1 交叉，再对 c1、d、c2 交叉，统一份数后求所问之比。',
        explanation: `第一步 ${p1[0]}:${p1[1]}；第二步 ${p2[0]}:${p2[1]}；统一后高浓度:第三溶液=${ans}。`,
        seq,
      })
    }
    const ans = ratioStr(mA, mD)
    return buildQuestion({
      difficulty: 'hard',
      term: '三组分两步交叉',
      hardTypeId: 'three-step',
      passage: `先将 ${a}% 与 ${b}% 的溶液混合成 ${c1}% ，再与 ${d}% 混合成 ${c2}%。`,
      stem: '第一次高浓度溶液与第三次加入溶液的质量之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, [ratioStr(mB, mD), '1:1', '2:1', '3:2']),
      method: '两步十字交叉后统一份数。',
      explanation: `所求比=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardAddToTarget(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([10, 20, 30])
    const b = pickOne([50, 60, 70, 80])
    const c = pickOne([35, 40, 45, 50])
    if (c <= a || c >= b) continue
    const have = pickOne([20, 30, 40, 50])
    const parts = crossParts(b, a, c) // adding b into a? Wait: have solution a, add solution b to get c
    // Cross: top b, bottom a, mid c → mass_b : mass_a = (c-a):(b-c)
    const x = c - a
    const y = b - c
    if (x <= 0 || y <= 0) continue
    // mass_a = have corresponds to y parts
    if ((have * x) % y !== 0) continue
    const add = (have * x) / y
    if (!Number.isInteger(add)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '加到目标浓度',
      hardTypeId: 'add-to-target',
      passage: `现有 ${have} 克、浓度 ${a}% 的溶液，要配成浓度 ${c}% 的溶液，可加入浓度 ${b}% 的溶液。`,
      stem: '应加入多少克？',
      correct: String(add),
      distractors: uniqueNum(add, [have, x, y, add + have, Math.round(have * (c / a))]),
      method: '对高浓度、低浓度与目标浓度做十字交叉，按已知质量求应加量。',
      explanation: `应加:现有 = (${c}-${a}):(${b}-${c}) = ${x}:${y}；现有 ${have} ⇒ 应加 ${add}。`,
      seq,
    })
  }
  return null
}

function genHardReversePart(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([90, 92, 95, 96])
    const c = pickOne([85, 88, 89, 90])
    const rx = pickOne([2, 3, 4])
    const ry = pickOne([3, 4, 5])
    // (c-b)/(a-c)=rx/ry ⇒ ry(c-b)=rx(a-c) ⇒ b=c - rx(a-c)/ry
    const num = rx * (a - c)
    if (num % ry !== 0) continue
    const b = c - num / ry
    if (!Number.isInteger(b) || b <= 0 || b >= c) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '已知比反求分量',
      hardTypeId: 'reverse-part',
      passage: `某班平均分 ${c} 分，男生平均 ${a} 分，男生与女生人数比为 ${rx}:${ry}。`,
      stem: '女生平均分是多少？',
      correct: String(b),
      distractors: uniqueNum(b, [c, a, b + 2, b - 2, Math.round((a + c) / 2)]),
      method: '由人数比等于交叉差之比，反解女生平均分。',
      explanation: `(${c}−b):(${a}−${c})=${rx}:${ry} ⇒ b=${b}。`,
      seq,
    })
  }
  return null
}

function genHardDoubleMix(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a1 = pickOne([80, 90])
    const b1 = pickOne([60, 70])
    const c1 = pickOne([70, 75])
    const a2 = pickOne([50, 60])
    const b2 = pickOne([20, 30])
    const c2 = pickOne([35, 40])
    const p1 = crossParts(a1, b1, c1)
    const p2 = crossParts(a2, b2, c2)
    if (!p1 || !p2) continue
    const m1 = pickOne([20, 30, 40])
    // batch1 mass m1 with conc c1; batch2 mass m2 with c2; final c
    const c = pickOne([50, 55, 60])
    if (c <= Math.min(c1, c2) || c >= Math.max(c1, c2)) continue
    const x = Math.abs(c - c2)
    const y = Math.abs(c1 - c)
    if (x <= 0 || y <= 0) continue
    // m1:m2 = x:y if c1>c2 and c between, with top=c1 bottom=c2
    if (c1 < c2) continue
    if ((m1 * y) % x !== 0) continue
    const m2 = (m1 * y) / x
    if (!Number.isInteger(m2)) continue
    const ans = m1 + m2
    return buildQuestion({
      difficulty: 'hard',
      term: '两批再并批',
      hardTypeId: 'double-mix',
      passage: `第一批溶液浓度 ${c1}% 共 ${m1} 克，第二批浓度 ${c2}%。两批混合后浓度为 ${c}%。`,
      stem: '混合后溶液总质量是多少克？',
      correct: String(ans),
      distractors: uniqueNum(ans, [m1, m2, m1 + m1, ans + 10]),
      method: '两批浓度与终浓度交叉得质量比，再求总量。',
      explanation: `第一批:第二批 = (${c}-${c2}):(${c1}-${c}) = ${x}:${y}；第二批 ${m2} 克；总量 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardAlloyAsk(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([70, 80, 90])
    const b = pickOne([30, 40, 50])
    const c = pickOne([50, 55, 60])
    const parts = crossParts(a, b, c)
    if (!parts) continue
    const unit = pickOne([10, 20, 25])
    const total = (parts[0] + parts[1]) * unit
    const metal = (c * total) / 100
    if (!Number.isInteger(metal)) continue
    const ask = pickOne(['metal', 'high'] as const)
    if (ask === 'metal') {
      return buildQuestion({
        difficulty: 'hard',
        term: '合金求质量',
        hardTypeId: 'alloy-ask',
        passage: `把含铜 ${a}% 与含铜 ${b}% 的两种合金熔化，得到含铜 ${c}% 的合金共 ${total} 克。`,
        stem: '所得合金中铜的质量是多少克？',
        correct: String(metal),
        distractors: uniqueNum(metal, [total, parts[0] * unit, (a * total) / 100, metal / 2].map(Math.round)),
        method: '可直接用混合浓度×总质量；交叉可用于验算份量。',
        explanation: `铜质量=${c}%×${total}=${metal} 克。`,
        seq,
      })
    }
    const highMass = parts[0] * unit
    return buildQuestion({
      difficulty: 'hard',
      term: '合金求质量',
      hardTypeId: 'alloy-ask',
      passage: `把含铜 ${a}% 与含铜 ${b}% 的两种合金熔化，得到含铜 ${c}% 的合金共 ${total} 克。`,
      stem: '含铜较高的那种合金用了多少克？',
      correct: String(highMass),
      distractors: uniqueNum(highMass, [parts[1] * unit, total / 2, metal, highMass + unit]),
      method: '十字交叉得两种合金质量比，再按总量分配。',
      explanation: `质量比 ${parts[0]}:${parts[1]}；高铜合金 ${highMass} 克。`,
      seq,
    })
  }
  return null
}

function genHardAgeChange(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    const oldAvg = pickOne([30, 32, 35, 40])
    const newAvg = pickOne([28, 30, 33, 36])
    if (newAvg >= oldAvg) continue
    const joinAvg = pickOne([20, 22, 24, 25])
    if (joinAvg >= newAvg) continue
    // After joining, average drops: cross oldAvg (existing) and joinAvg with newAvg
    // existing:newcomers = (newAvg-joinAvg):(oldAvg-newAvg)
    const x = newAvg - joinAvg
    const y = oldAvg - newAvg
    if (x <= 0 || y <= 0) continue
    const exist = pickOne([20, 25, 30, 40])
    if ((exist * y) % x !== 0) continue
    // Wait: ratio existing:join = x:y
    if ((exist * y) % x !== 0) continue
    const join = (exist * y) / x
    if (!Number.isInteger(join)) continue
    const ans = exist + join
    return buildQuestion({
      difficulty: 'hard',
      term: '调人后平均年龄',
      hardTypeId: 'age-change',
      passage: `某单位原平均年龄 ${oldAvg} 岁。调入若干平均年龄 ${joinAvg} 岁的新人后，全单位平均年龄变为 ${newAvg} 岁。已知原有 ${exist} 人。`,
      stem: '调入后全单位共有多少人？',
      correct: String(ans),
      distractors: uniqueNum(ans, [exist, join, exist + exist, ans + 5]),
      method: '原平均与新人平均对调后平均做十字交叉，得人数比。',
      explanation: `原有:新人 = (${newAvg}-${joinAvg}):(${oldAvg}-${newAvg}) = ${x}:${y}；新人 ${join}；合计 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardProfitCompound(seq: number): CrossMethodQuestion | null {
  for (let t = 0; t < 40; t++) {
    // A: first +p1% then +p2% effective; B: -d%
    // Simpler hard: A rises r1%, B rises r2% then falls — use effective rates
    const rA = pickOne([21, 32, 44]) // effective like 10% then 10% ≈ 21
    const rB = pickOne([-19, -28, -10])
    const rx = pickOne([2, 3, 5])
    const ry = pickOne([2, 3, 4])
    const cNum = rA * rx + rB * ry
    const cDen = rx + ry
    const total = (rx + ry) * pickOne([2000, 3000, 4000])
    const profit = (total * cNum) / (cDen * 100)
    if (!Number.isInteger(profit)) continue
    const ans = ratioStr(rx, ry)
    const labelA =
      rA === 21 ? '先上涨 10% 再上涨 10%' : rA === 32 ? '先上涨 20% 再上涨 10%' : '先上涨 20% 再上涨 20%'
    const labelB =
      rB === -19
        ? '先下跌 10% 再下跌 10%'
        : rB === -28
          ? '先下跌 20% 再下跌 10%'
          : '下跌 10%'
    return buildQuestion({
      difficulty: 'hard',
      term: '两阶段盈亏交叉',
      hardTypeId: 'profit-compound',
      passage: `购进甲、乙两种商品共 ${total} 元。甲${labelA}后售出，乙${labelB}后售出，共获利 ${profit} 元。`,
      stem: '甲、乙进价之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, [ratioStr(ry, rx), '1:1', '2:1', '5:3', '3:2']),
      method: '先把两阶段涨跌合成等效收益率，再与总收益率做十字交叉。',
      explanation: `甲等效约 ${rA}%，乙等效约 ${rB}%；交叉得 ${ans}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  CrossMethodHardTypeId,
  (seq: number) => CrossMethodQuestion | null
> = {
  'ask-amount': genHardAskAmount,
  'find-rate': genHardFindRate,
  'dilute-water': genHardDiluteWater,
  'three-step': genHardThreeStep,
  'add-to-target': genHardAddToTarget,
  'reverse-part': genHardReversePart,
  'double-mix': genHardDoubleMix,
  'alloy-ask': genHardAlloyAsk,
  'age-change': genHardAgeChange,
  'profit-compound': genHardProfitCompound,
}

function tryBuild(
  factory: () => CrossMethodQuestion | null,
  maxTry = 40,
): CrossMethodQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateCrossMethodPaper(
  difficulty: CrossMethodDifficulty,
): CrossMethodQuestion[] {
  const out: CrossMethodQuestion[] = []
  const seen = new Set<string>()

  const push = (q: CrossMethodQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyScore, genEasyConcentration, genEasyAge, genEasyPrice]
    let guard = 0
    while (out.length < CROSS_METHOD_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumStock(0),
      () => genMediumProfitGoods(1),
      () => genMediumConcNeedC(2),
      () => genMediumStock(3),
      () => genMediumProfitGoods(4),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < CROSS_METHOD_QUESTION_COUNT && guard++ < 50) {
      push(
        tryBuild(() =>
          pickOne([genMediumStock, genMediumProfitGoods, genMediumConcNeedC])(out.length),
        ),
      )
    }
  } else {
    const types = shuffleInPlace([...CROSS_METHOD_HARD_EXAM_TYPES.map((t) => t.id)])
    for (const typeId of types) {
      if (out.length >= CROSS_METHOD_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 55))
    }
    if (out.length < CROSS_METHOD_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= CROSS_METHOD_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 70)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < CROSS_METHOD_QUESTION_COUNT) {
    throw new Error(`十字交叉法组卷不足：仅 ${out.length}/${CROSS_METHOD_QUESTION_COUNT}`)
  }
  return out.slice(0, CROSS_METHOD_QUESTION_COUNT)
}
