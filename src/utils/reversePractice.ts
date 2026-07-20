/**
 * 其他运算 · 逆推问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材方法：从最终结果分步还原初始量（操作还原）。
 * 基本逆运算：
 * - 正向「加 a」→ 逆向减 a；「减 a」→ 加 a；「×k」→ ÷k；「÷k」→ ×k
 * - 正向「剩量的 1/n 再加上 b」：剩后 = ((n−1)/n)·剩前 − b
 *   ⇒ 剩前 = (剩后 + b)·n/(n−1)
 * - 正向「剩量的 1/n 再减去 b」：剩后 = ((n−1)/n)·剩前 + b
 *   ⇒ 剩前 = (剩后 − b)·n/(n−1)
 *
 * 【简单】比经典真题更易（整步加减乘除、一两步还原）
 * 【普通】对齐经典真题（多日修路：分数剩量 ± 常数）
 * 【困难】高于例题；≥6 变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ReverseDifficulty = 'easy' | 'medium' | 'hard'

export const REVERSE_QUESTION_COUNT = 5

export const REVERSE_MODES: {
  id: ReverseDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '逆推 · 简单',
    desc: '每轮 5 题 · 比经典真题更易（整步还原）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '逆推 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（多日分数剩量±常数）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '逆推 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const REVERSE_HARD_EXAM_TYPES = [
  { id: 'road-plus', name: '修路加强', note: '经典同构，天数/分数更复杂' },
  { id: 'spend-money', name: '连续花钱', note: '剩钱的分数 ± 定数' },
  { id: 'inventory', name: '库存售卖', note: '剩货的分数 ± 定数' },
  { id: 'number-chain', name: '数变换链', note: '加减乘除多步逆推' },
  { id: 'double-halve', name: '倍增折半', note: '翻倍/减半再加减' },
  { id: 'equal-share', name: '折半多一', note: '每天吃一半再多1（桃题型）' },
  { id: 'four-steps', name: '四步分数', note: '四天分数剩量' },
  { id: 'mixed-offset', name: '正负混合', note: '有加有减的多日还原' },
] as const

export type ReverseHardTypeId = (typeof REVERSE_HARD_EXAM_TYPES)[number]['id']

export type ReverseQuestion = {
  id: string
  topic: 'reverse'
  difficulty: ReverseDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ReverseHardTypeId
}

export function reverseTopicLabel(): string {
  return '逆推问题'
}

export function reverseDifficultyLabel(d: ReverseDifficulty): string {
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
    const fake = String(Number(correct) + g)
    g++
    if (seen.has(fake) || fake === 'NaN') continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function numDistractors(correct: number, extras: number[] = []): string[] {
  const base = [
    correct - 10,
    correct + 10,
    correct - 20,
    correct + 20,
    correct - 5,
    correct + 5,
    Math.round(correct * 1.1),
    Math.round(correct * 0.9),
    ...extras,
  ]
    .filter((x) => Number.isFinite(x) && x !== correct && x > 0)
    .map((x) => String(Math.round(x)))
  return uniqueStr(String(correct), base)
}

function isPosInt(n: number): boolean {
  return Number.isInteger(n) && n > 0
}

/** 正向：用掉剩量的 1/n 再加 b → 逆向 */
function undoTakeFracPlus(after: number, n: number, b: number): number | null {
  const before = ((after + b) * n) / (n - 1)
  return isPosInt(before) ? before : null
}

/** 正向：用掉剩量的 1/n 再减 b → 逆向 */
function undoTakeFracMinus(after: number, n: number, b: number): number | null {
  const before = ((after - b) * n) / (n - 1)
  return isPosInt(before) ? before : null
}

function buildQuestion(input: {
  difficulty: ReverseDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: ReverseHardTypeId
}): ReverseQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'reverse',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `rv-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'reverse',
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

// ——— 简单 ———

function genEasyAddMul(seq: number): ReverseQuestion | null {
  const x = pickOne([8, 10, 12, 15, 20, 25])
  const a = pickOne([3, 4, 5, 6])
  const k = pickOne([2, 3, 4])
  const result = (x + a) * k
  return buildQuestion({
    difficulty: 'easy',
    term: '加减乘还原',
    passage: `某数先加 ${a}，再乘以 ${k}，结果是 ${result}。`,
    stem: '原来的数是多少？',
    correct: String(x),
    distractors: numDistractors(x, [result / k, result - a]),
    method: [
      '从结果逆推：先÷再−。',
      `${result} ÷ ${k} = ${result / k}，再减 ${a} 得 ${x}。`,
    ].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genEasyDivSub(seq: number): ReverseQuestion | null {
  const x = pickOne([24, 30, 36, 40, 48])
  const k = pickOne([2, 3, 4])
  const a = pickOne([2, 3, 4, 5])
  if (x % k !== 0) return null
  const result = x / k - a
  if (!isPosInt(result)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '除减还原',
    passage: `某数先除以 ${k}，再减去 ${a}，结果是 ${result}。`,
    stem: '原来的数是多少？',
    correct: String(x),
    distractors: numDistractors(x, [(result + a) * k + k, result * k]),
    method: [
      '逆推：先加再乘。',
      `(${result} + ${a}) × ${k} = ${x}。`,
    ].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genEasyTwoStep(seq: number): ReverseQuestion | null {
  const x = pickOne([16, 18, 20, 24, 30])
  const a = pickOne([2, 4, 5])
  const b = pickOne([3, 4, 6])
  const mid = x - a
  const result = mid * b
  return buildQuestion({
    difficulty: 'easy',
    term: '两步还原',
    passage: `某数先减去 ${a}，再乘以 ${b}，得到 ${result}。`,
    stem: '原来的数是多少？',
    correct: String(x),
    distractors: numDistractors(x, [result / b, result / b + a + 1]),
    method: [`${result} ÷ ${b} = ${mid}，再加 ${a} 得 ${x}。`].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genEasyHalfRemain(seq: number): ReverseQuestion | null {
  // 花掉一半再花掉 b，剩 r
  const r = pickOne([10, 12, 15, 20, 25])
  const b = pickOne([4, 5, 6, 8])
  // 正向：剩前 half 再减 b → after = before/2 - b；逆：before = 2*(after+b)
  const x = 2 * (r + b)
  return buildQuestion({
    difficulty: 'easy',
    term: '一半再减',
    passage: `小明有一笔钱，先花掉一半，再花掉 ${b} 元，还剩 ${r} 元。`,
    stem: '小明原来有多少元？',
    correct: String(x),
    distractors: numDistractors(x, [r + b, 2 * r + b]),
    method: [
      '从剩余逆推：先加回花掉的定数，再还原「一半」。',
      `${r} + ${b} = ${r + b}，这是花一半后的剩余；原来 = 2×${r + b} = ${x}。`,
    ].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genEasyFracRemain(seq: number): ReverseQuestion | null {
  // 一天：修「当时剩余」的 1/n + b，剩 r → 开始时的剩余（即全长）
  const n = pickOne([3, 4, 5])
  const b = pickOne([6, 8, 10, 12])
  const r = pickOne([18, 20, 24, 30, 36])
  const total = undoTakeFracPlus(r, n, b)
  if (total == null) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '一日分数',
    passage: `修路一天：完成当时剩余长度的 1/${n}，还多修了 ${b} 米，这时还剩 ${r} 米未修。`,
    stem: '开始修之前，路全长多少米？',
    correct: String(total),
    distractors: numDistractors(total, [r + b, r * n]),
    method: [
      '把「修完后的剩余」当作已知，往回还原「修之前的剩余」。',
      `正向：剩后 = 剩前×(${n}−1)/${n} − ${b}。`,
      `逆向：剩前 = (剩后 + ${b}) × ${n}/${n - 1} = (${r}+${b})×${n}/${n - 1}=${total}。`,
      '（只有一天时，修之前的剩余就是全长。）',
    ].join('\n'),
    explanation: `答案 ${total}。口诀：加回多修的米数，再按「留下的几分之几」放大回去。`,
    seq,
  })
}

// ——— 普通（对齐经典修路） ———

type DayOp = { n: number; b: number; sign: 1 | -1 } // sign 1: +b, -1: -b in "take 1/n ± b"

function buildRoadPassage(days: DayOp[], finalRemain: number): string {
  const lines = days.map((d, i) => {
    const ord = ['第一天', '第二天', '第三天', '第四天'][i] ?? `第${i + 1}天`
    if (d.sign === 1) {
      return `${ord}修了当时剩余的 1/${d.n} 还多修 ${d.b} 米`
    }
    return `${ord}修了当时剩余的 1/${d.n} 少修 ${d.b} 米`
  })
  return `某工程队修路。${lines.join('；')}。此时还剩 ${finalRemain} 米未修。`
}

function solveRoadBackward(days: DayOp[], finalRemain: number): number | null {
  let rem = finalRemain
  const steps: string[] = []
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i]!
    const before =
      d.sign === 1 ? undoTakeFracPlus(rem, d.n, d.b) : undoTakeFracMinus(rem, d.n, d.b)
    if (before == null) return null
    if (d.sign === 1) {
      steps.push(
        `第${i + 1}天逆推：剩前 = (${rem}+${d.b})×${d.n}/${d.n - 1} = ${before}`,
      )
    } else {
      steps.push(
        `第${i + 1}天逆推：剩前 = (${rem}−${d.b})×${d.n}/${d.n - 1} = ${before}`,
      )
    }
    rem = before
  }
  return rem
}

function methodRoadBackward(days: DayOp[], finalRemain: number, total: number): string {
  const lines: string[] = [
    '从最后剩下的米数往回倒推，一天天「还原」修路前的剩余（像倒放录像）。',
  ]
  let rem = finalRemain
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i]!
    const before =
      d.sign === 1 ? undoTakeFracPlus(rem, d.n, d.b)! : undoTakeFracMinus(rem, d.n, d.b)!
    if (d.sign === 1) {
      lines.push(
        `倒推第${i + 1}天（当天多修了 ${d.b} 米）：先加回 ${d.b}，再÷留下的比例 → (${rem}+${d.b})×${d.n}/${d.n - 1}=${before}`,
      )
    } else {
      lines.push(
        `倒推第${i + 1}天（当天少修了 ${d.b} 米）：先减掉 ${d.b}，再÷留下的比例 → (${rem}−${d.b})×${d.n}/${d.n - 1}=${before}`,
      )
    }
    rem = before
  }
  lines.push(`倒推到第一天开始，就是全长 ${total} 米。`)
  return lines.join('\n')
}

function genMediumRoadClassic(seq: number): ReverseQuestion | null {
  // 经典结构：1/5+12, 1/4+15, 1/3-5, remain 65 → 190；换参数保持同构
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: 5, b: pickOne([10, 12, 15]), sign: 1 },
      { n: 4, b: pickOne([12, 15, 18]), sign: 1 },
      { n: 3, b: pickOne([4, 5, 6]), sign: -1 },
    ]
    const finalRemain = pickOne([60, 65, 70, 75, 80])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 100 || total > 400) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '修路·经典同构',
      passage: buildRoadPassage(days, finalRemain),
      stem: '这条路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total, [200, 210, 220, finalRemain * 3]),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。对齐书中经典真题结构（三日分数 ± 常数）。`,
      seq,
    })
  }
  return null
}

function genMediumRoadAllPlus(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: pickOne([4, 5]), b: pickOne([8, 10, 12]), sign: 1 },
      { n: pickOne([3, 4]), b: pickOne([6, 9, 12]), sign: 1 },
      { n: pickOne([3, 4]), b: pickOne([5, 8, 10]), sign: 1 },
    ]
    const finalRemain = pickOne([40, 48, 50, 60])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 80 || total > 500) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '修路·三日皆加',
      passage: buildRoadPassage(days, finalRemain),
      stem: '路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。`,
      seq,
    })
  }
  return null
}

function genMediumSpend(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: 5, b: pickOne([10, 20]), sign: 1 },
      { n: 4, b: pickOne([15, 20]), sign: 1 },
      { n: 3, b: pickOne([5, 10]), sign: 1 },
    ]
    const finalRemain = pickOne([30, 40, 50])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 100) continue
    const lines = days.map((d, i) => {
      const ord = ['第一次', '第二次', '第三次'][i]
      return `${ord}花掉当时剩余的 1/${d.n} 还多花 ${d.b} 元`
    })
    return buildQuestion({
      difficulty: 'medium',
      term: '花钱·三日',
      passage: `小华购物：${lines.join('；')}。此时还剩 ${finalRemain} 元。`,
      stem: '小华原来有多少元？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。与修路同一逆推公式。`,
      seq,
    })
  }
  return null
}

function genMediumTwoDay(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: pickOne([3, 4, 5]), b: pickOne([10, 12, 15]), sign: 1 },
      { n: pickOne([3, 4]), b: pickOne([5, 8, 10]), sign: pickOne([1, -1] as const) },
    ]
    const finalRemain = pickOne([45, 50, 55, 60])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 80) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '修路·两日',
      passage: buildRoadPassage(days, finalRemain),
      stem: '路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。`,
      seq,
    })
  }
  return null
}

function genMediumChainOps(seq: number): ReverseQuestion | null {
  const x = pickOne([12, 15, 16, 18, 20])
  const a = pickOne([2, 3, 4])
  const k = pickOne([2, 3])
  const b = pickOne([5, 6, 8])
  const mid = (x + a) * k
  const res = mid - b
  return buildQuestion({
    difficulty: 'medium',
    term: '三步运算',
    passage: `某数先加 ${a}，再乘以 ${k}，再减去 ${b}，结果是 ${res}。`,
    stem: '原来的数是多少？',
    correct: String(x),
    distractors: numDistractors(x, [res + b, (res + b) / k]),
    method: [
      `逆推：先加 ${b} 得 ${res + b}，再÷${k} 得 ${(res + b) / k}，再减 ${a} 得 ${x}。`,
    ].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardRoadPlus(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 50; t++) {
    const days: DayOp[] = [
      { n: pickOne([5, 6]), b: pickOne([12, 15, 18]), sign: 1 },
      { n: pickOne([4, 5]), b: pickOne([10, 15, 20]), sign: 1 },
      { n: pickOne([3, 4]), b: pickOne([6, 8, 10]), sign: -1 },
      { n: 3, b: pickOne([4, 5]), sign: 1 },
    ]
    const finalRemain = pickOne([40, 48, 50, 60])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 150 || total > 800) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '修路加强',
      hardTypeId: 'road-plus',
      passage: buildRoadPassage(days, finalRemain),
      stem: '路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total, [190, 200, 220]),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。比经典多一天。`,
      seq,
    })
  }
  return null
}

function genHardSpendMoney(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: 4, b: pickOne([20, 30]), sign: 1 },
      { n: 3, b: pickOne([10, 15]), sign: 1 },
      { n: 3, b: pickOne([5, 8]), sign: -1 },
    ]
    const finalRemain = pickOne([36, 45, 54])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 120) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '连续花钱',
      hardTypeId: 'spend-money',
      passage: `第一次花掉剩余的 1/${days[0]!.n} 还多花 ${days[0]!.b} 元；第二次花掉剩余的 1/${days[1]!.n} 还多花 ${days[1]!.b} 元；第三次花掉剩余的 1/${days[2]!.n} 少花 ${days[2]!.b} 元。最后剩 ${finalRemain} 元。`,
      stem: '原来有多少元？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardInventory(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 40; t++) {
    const days: DayOp[] = [
      { n: 5, b: pickOne([20, 30]), sign: 1 },
      { n: 4, b: pickOne([15, 25]), sign: 1 },
      { n: 3, b: pickOne([10, 15]), sign: 1 },
    ]
    const finalRemain = pickOne([50, 60, 80])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 200) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '库存售卖',
      hardTypeId: 'inventory',
      passage: `仓库连续三天出货：每天卖出当时库存的 1/${days[0]!.n}、1/${days[1]!.n}、1/${days[2]!.n}，并分别额外多卖 ${days[0]!.b}、${days[1]!.b}、${days[2]!.b} 件。三天后库存剩 ${finalRemain} 件。`,
      stem: '最初库存多少件？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardNumberChain(seq: number): ReverseQuestion | null {
  const x = pickOne([7, 8, 9, 11, 12])
  const ops = [
    { kind: 'add' as const, v: pickOne([3, 4, 5]) },
    { kind: 'mul' as const, v: pickOne([2, 3]) },
    { kind: 'sub' as const, v: pickOne([6, 8, 10]) },
    { kind: 'div' as const, v: pickOne([2, 3]) },
  ]
  let cur = x
  const forward: string[] = []
  for (const op of ops) {
    if (op.kind === 'add') {
      cur += op.v
      forward.push(`加 ${op.v}`)
    } else if (op.kind === 'mul') {
      cur *= op.v
      forward.push(`乘 ${op.v}`)
    } else if (op.kind === 'sub') {
      cur -= op.v
      forward.push(`减 ${op.v}`)
    } else {
      if (cur % op.v !== 0) return null
      cur /= op.v
      forward.push(`除以 ${op.v}`)
    }
  }
  if (!isPosInt(cur)) return null
  // reverse method
  let back = cur
  const backLines: string[] = ['从结果逆推：']
  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]!
    if (op.kind === 'add') {
      back -= op.v
      backLines.push(`减 ${op.v} → ${back}`)
    } else if (op.kind === 'mul') {
      back /= op.v
      backLines.push(`÷${op.v} → ${back}`)
    } else if (op.kind === 'sub') {
      back += op.v
      backLines.push(`加 ${op.v} → ${back}`)
    } else {
      back *= op.v
      backLines.push(`×${op.v} → ${back}`)
    }
  }
  if (back !== x) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '数变换链',
    hardTypeId: 'number-chain',
    passage: `某数依次：${forward.join('，')}，结果是 ${cur}。`,
    stem: '原来的数是多少？',
    correct: String(x),
    distractors: numDistractors(x, [cur, cur + 1]),
    method: backLines.join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genHardDoubleHalve(seq: number): ReverseQuestion | null {
  const a = pickOne([2, 3, 4])
  const final = pickOne([20, 28, 36, 44])
  let cur = final
  const lines: string[] = []
  for (let d = 3; d >= 1; d--) {
    if ((cur + a) % 2 !== 0) return null
    const next = (cur + a) / 2
    if (!isPosInt(next)) return null
    lines.push(`逆第${d}天：(${cur}+${a})÷2 = ${next}`)
    cur = next
  }
  const x = cur
  return buildQuestion({
    difficulty: 'hard',
    term: '倍增折半',
    hardTypeId: 'double-halve',
    passage: `某种细菌每天数量先翻倍再减少 ${a} 个。连续 3 天后有 ${final} 个。`,
    stem: '最初有多少个？',
    correct: String(x),
    distractors: numDistractors(x, [Math.floor(final / 2), final + a]),
    method: [
      '正向：每天 new = 2·old − a；逆向：old = (new + a) ÷ 2。',
      ...lines,
      `最初为 ${x}。`,
    ].join('\n'),
    explanation: `答案 ${x}。`,
    seq,
  })
}

function genHardEqualShare(seq: number): ReverseQuestion | null {
  // 经典变体：甲乙丙有桃，甲给乙若干使乙翻倍… 简化为：
  // 三人最终各有 m；丙先给甲乙使二人翻倍（丙拿出 a+b），逆推
  // 更常见：猴子吃桃逆推 —— 每天吃一半多半个，10 天剩 1
  // 这里用：连续 3 天，每天吃掉「当时的一半再多 1 个」，最后剩 1，求最初
  const days = pickOne([3, 4, 5])
  const final = 1
  let cur = final
  const lines: string[] = []
  for (let d = days; d >= 1; d--) {
    // forward: eat half + 1, remain = x/2 - 1 = (x - 2)/2 → x = 2*(remain+1)
    cur = 2 * (cur + 1)
    lines.push(`逆第${d}天：剩前 = 2×(剩后+1) = ${cur}`)
  }
  const x = cur
  return buildQuestion({
    difficulty: 'hard',
    term: '折半多一',
    hardTypeId: 'equal-share',
    passage: `一堆桃，连续 ${days} 天：每天先吃掉当时的一半，再多吃 1 个。第 ${days} 天吃完后还剩 ${final} 个。`,
    stem: '最初有多少个桃？',
    correct: String(x),
    distractors: numDistractors(x, [2 ** days, days * 2]),
    method: [
      '想象录像倒放：每天的操作反过来做。',
      '正向：剩后 = 剩前÷2 − 1；倒放：先加回那多吃的 1 个，再「还原一半」→ 剩前 = 2×(剩后+1)。',
      ...lines,
    ].join('\n'),
    explanation: `答案 ${x}。这类题贵在耐心，一天天倒回去即可。`,
    seq,
  })
}

function genHardFourSteps(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 50; t++) {
    const days: DayOp[] = [
      { n: 6, b: pickOne([10, 12]), sign: 1 },
      { n: 5, b: pickOne([10, 15]), sign: 1 },
      { n: 4, b: pickOne([8, 12]), sign: 1 },
      { n: 3, b: pickOne([5, 6]), sign: -1 },
    ]
    const finalRemain = pickOne([36, 40, 45])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 200 || total > 1000) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '四步分数',
      hardTypeId: 'four-steps',
      passage: buildRoadPassage(days, finalRemain),
      stem: '路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardMixedOffset(seq: number): ReverseQuestion | null {
  for (let t = 0; t < 50; t++) {
    const days: DayOp[] = [
      { n: 5, b: pickOne([12, 16]), sign: 1 },
      { n: 4, b: pickOne([8, 10]), sign: -1 },
      { n: 3, b: pickOne([6, 9]), sign: 1 },
      { n: 3, b: pickOne([3, 5]), sign: -1 },
    ]
    const finalRemain = pickOne([30, 35, 42])
    const total = solveRoadBackward(days, finalRemain)
    if (total == null || total < 150) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '正负混合',
      hardTypeId: 'mixed-offset',
      passage: buildRoadPassage(days, finalRemain),
      stem: '路全长多少米？',
      correct: String(total),
      distractors: numDistractors(total, [190]),
      method: methodRoadBackward(days, finalRemain, total),
      explanation: `答案 ${total}。加减偏移交替，逆推时符号勿反。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<ReverseHardTypeId, (seq: number) => ReverseQuestion | null> = {
  'road-plus': genHardRoadPlus,
  'spend-money': genHardSpendMoney,
  inventory: genHardInventory,
  'number-chain': genHardNumberChain,
  'double-halve': genHardDoubleHalve,
  'equal-share': genHardEqualShare,
  'four-steps': genHardFourSteps,
  'mixed-offset': genHardMixedOffset,
}

function tryBuild(factory: () => ReverseQuestion | null, maxTry = 40): ReverseQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type Factory = { key: string; build: (seq: number) => ReverseQuestion | null }

export function generateReversePaper(difficulty: ReverseDifficulty): ReverseQuestion[] {
  const out: ReverseQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: ReverseQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: Factory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= REVERSE_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < REVERSE_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'add-mul', build: genEasyAddMul },
      { key: 'div-sub', build: genEasyDivSub },
      { key: 'two-step', build: genEasyTwoStep },
      { key: 'half', build: genEasyHalfRemain },
      { key: 'frac-day', build: genEasyFracRemain },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'road-classic', build: genMediumRoadClassic },
      { key: 'road-plus-all', build: genMediumRoadAllPlus },
      { key: 'spend', build: genMediumSpend },
      { key: 'two-day', build: genMediumTwoDay },
      { key: 'chain', build: genMediumChainOps },
    ])
  } else {
    const used = new Set<ReverseHardTypeId>()
    const types = shuffleInPlace([...REVERSE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= REVERSE_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = REVERSE_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < REVERSE_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : REVERSE_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, REVERSE_QUESTION_COUNT)
}
