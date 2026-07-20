/**
 * 高频运算 · 排列组合 · 概率问题
 * 简单/普通：本地组卷（不调用 AI）。困难：本地锚定种子 + 豆包改写题干（失败回退本地）。
 * 每轮 6 题四选一。
 *
 * 教材公式：
 * - 古典概率：P(A)=m/n
 * - 分类相加、分步相乘
 * - 几何概率：P = 有利区域度量 / 总区域度量（长度/面积/体积）
 *
 * 【简单】对齐经典真题 1（枚举 + 古典概率）
 * 【普通】对齐经典真题 2（分类 + 分步概率）
 * 【困难】对齐经典真题 3（几何概率）；≥8 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ProbabilityDifficulty = 'easy' | 'medium' | 'hard'

export const PROBABILITY_QUESTION_COUNT = 6

export const PROBABILITY_MODES: {
  id: ProbabilityDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '概率 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 1（枚举 + 古典概率）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '概率 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 2（分类相加 + 分步相乘）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '概率 · 困难',
    desc: '每轮 6 题 · 对齐经典真题 3（几何概率）· 豆包改写题干 · 正计时停表看答案',
  },
]

/** 困难 · 几何概率变式（≥8） */
export const PROBABILITY_HARD_EXAM_TYPES = [
  {
    id: 'asymm-wait',
    name: '非对称到达等候',
    note: '经典真题 3：一方全时段、另一方半时段，等候时限 → 面积比',
  },
  {
    id: 'symm-meet',
    name: '对称会面问题',
    note: '两人在 [0,T] 到达、互等 w 分钟 → 正方形阴影',
  },
  {
    id: 'bus-interval',
    name: '等公交车',
    note: '到达时刻均匀，班次间隔固定 → 线段比',
  },
  {
    id: 'stick-triangle',
    name: '木棒折三段成三角',
    note: '几何概率经典：两点断开成三角条件 → 面积 1/4',
  },
  {
    id: 'square-region',
    name: '正方形内区域',
    note: '随机点落入多边形/不等式区域 → 面积比',
  },
  {
    id: 'circle-in-square',
    name: '方内圆/靶心',
    note: '正方形内随机点落入内切圆 → π/4',
  },
  {
    id: 'two-window',
    name: '双窗口错峰',
    note: '两段到达窗口不同，错开超过时限才失败',
  },
  {
    id: 'segment-overlap',
    name: '随机时段重叠',
    note: '两段等长随机时段是否相交 → 面积比',
  },
  {
    id: 'triangle-pick',
    name: '三角形内取点',
    note: '等腰直角三角形内随机点落入小区域',
  },
  {
    id: 'rain-catch',
    name: '降雨窗口拦截',
    note: '降雨起点均匀，在出门窗口内才淋到 → 面积/长度比',
  },
] as const

export type ProbabilityHardTypeId = (typeof PROBABILITY_HARD_EXAM_TYPES)[number]['id']

export type ProbabilityDiagramPreset =
  | 'courier-wait'
  | 'meet-square'
  | 'bus-line'
  | 'stick-triangle'
  | 'square-region'
  | 'square-region-small'
  | 'circle-square'

export type ProbabilityQuestion = {
  id: string
  topic: 'probability'
  difficulty: ProbabilityDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ProbabilityHardTypeId
  /** 攻略/解析可用的几何示意预设 */
  diagramPreset?: ProbabilityDiagramPreset
  /** 图下简短读图说明 */
  diagramCaption?: string
}

export type ProbabilitySeed = {
  hardTypeId: ProbabilityHardTypeId
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  anchorHint: string
  diagramPreset?: ProbabilityDiagramPreset
  diagramCaption?: string
}

export function probabilityTopicLabel(): string {
  return '概率问题'
}

export function probabilityDifficultyLabel(d: ProbabilityDifficulty): string {
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
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function fmtFrac(num: number, den: number): string {
  if (den === 0) return String(num)
  const g = gcd(num, den)
  const n = num / g
  const d = den / g
  if (d === 1) return String(n)
  if (n < 0) return `-${Math.abs(n)}/${d}`
  return `${n}/${d}`
}

function fmtPct1(p: number): string {
  const v = Math.round(p * 1000) / 10
  return Number.isInteger(v) ? `${v}%` : `${v}%`
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
    const fake = `${correct}·${g}`
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

export function buildProbabilityQuestionFromSeed(
  seed: ProbabilitySeed,
  difficulty: ProbabilityDifficulty,
  seq: number,
  overrides?: Partial<
    Pick<ProbabilitySeed, 'passage' | 'stem' | 'method' | 'explanation' | 'term'>
  >,
): ProbabilityQuestion | null {
  const passage = (overrides?.passage ?? seed.passage).trim()
  const stem = (overrides?.stem ?? seed.stem).trim()
  const term = (overrides?.term ?? seed.term).trim()
  const method = (overrides?.method ?? seed.method).trim()
  const explanation = (overrides?.explanation ?? seed.explanation).trim()
  const assembled = assembleFourChoiceMcq(
    seed.correct.trim(),
    seed.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'probability',
    difficulty,
    seed.hardTypeId,
    passage,
    stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `prob-${difficulty}-${seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'probability',
    difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method,
    explanation,
    fingerprint,
    hardTypeId: seed.hardTypeId,
    diagramPreset: seed.diagramPreset,
    diagramCaption: seed.diagramCaption,
  }
}

function buildLocalQuestion(input: {
  difficulty: ProbabilityDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: ProbabilityHardTypeId
  diagramPreset?: ProbabilityDiagramPreset
  diagramCaption?: string
}): ProbabilityQuestion | null {
  if (input.hardTypeId) {
    return buildProbabilityQuestionFromSeed(
      {
        hardTypeId: input.hardTypeId,
        term: input.term,
        passage: input.passage,
        stem: input.stem,
        correct: input.correct,
        distractors: input.distractors,
        method: input.method,
        explanation: input.explanation,
        anchorHint: '',
        diagramPreset: input.diagramPreset,
        diagramCaption: input.diagramCaption,
      },
      input.difficulty,
      input.seq,
    )
  }
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'probability',
    input.difficulty,
    input.stem,
    input.passage,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `prob-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'probability',
    difficulty: input.difficulty,
    term: input.term,
    passage: input.passage.trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method,
    explanation: input.explanation.trim(),
    fingerprint,
  }
}

// ——— 简单 · 真题 1 古典概率 ———

function genEasyBreakfast(seq: number): ProbabilityQuestion | null {
  // 对齐真题 1：固定为教材结构变体，保证百分数干净
  const porridge = 3
  const steamed = pickOne([2, 2])
  const baoPrice = 3
  const steamedPrice = 2
  const porridgePrice = 1
  const target = 4
  const caseA = ((porridge * (porridge - 1)) / 2) * steamed
  const caseB = (steamed * (steamed - 1)) / 2
  const caseC = porridge
  const total = caseA + caseB + caseC
  const fav = caseC
  const ans = fmtPct1(fav / total)
  return buildLocalQuestion({
    difficulty: 'easy',
    term: '早餐凑价古典概率（经典真题 1）',
    passage: `早餐店只卖粥、馒头、包子。粥有 ${porridge} 种，各 ${porridgePrice} 元；馒头有 ${steamed} 种，各 ${steamedPrice} 元；包子 1 种，${baoPrice} 元。小陈花 ${target} 元买早餐，且所买口味互不相同。`,
    stem: '他吃到包子的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, ['35%', '40%', '45%', '50%', '25%']),
    method: '古典概率 P=m/n：先枚举花满金额的全部买法，再统计含包子的买法。',
    explanation: `2粥+1馒：C_${porridge}^2×${steamed}=${caseA}；2馒：${caseB}；1粥+1包：${caseC}；共 ${total} 种。含包子 ${fav} 种。P=${fav}/${total}=${ans}。`,
    seq,
  })
}

function genEasyBalls(seq: number): ProbabilityQuestion | null {
  const red = pickOne([3, 4, 5])
  const blue = pickOne([2, 3, 4])
  const total = red + blue
  const draw = 2
  // 抽 2 个都是红
  const fav = (red * (red - 1)) / 2
  const all = (total * (total - 1)) / 2
  const ans = fmtFrac(fav, all)
  return buildLocalQuestion({
    difficulty: 'easy',
    term: '摸球古典概率',
    passage: `袋中有红球 ${red} 个、蓝球 ${blue} 个，共 ${total} 个。一次摸出 ${draw} 个球（不放回）。`,
    stem: '两个都是红球的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(red, total),
      fmtFrac(blue * (blue - 1), total * (total - 1)),
      fmtFrac(red * blue, all),
      fmtFrac(2 * fav, all),
    ]),
    method: 'P=有利组合数/总组合数 = C_红^2 / C_总^2。',
    explanation: `C_${red}^2=${fav}，C_${total}^2=${all}，P=${ans}。`,
    seq,
  })
}

function genEasyDice(seq: number): ProbabilityQuestion | null {
  const mode = pickOne(['sum7', 'even', 'at-least5'] as const)
  if (mode === 'sum7') {
    const fav = 6
    const ans = fmtFrac(fav, 36)
    return buildLocalQuestion({
      difficulty: 'easy',
      term: '掷骰古典概率',
      passage: '同时掷两枚均匀骰子，观察点数之和。',
      stem: '点数之和为 7 的概率是多少？',
      correct: ans,
      distractors: uniqueStr(ans, [fmtFrac(5, 36), fmtFrac(1, 6), fmtFrac(7, 36), '1/7']),
      method: '总共 6×6=36 种等可能结果；和为 7 有 6 种。',
      explanation: `P=${ans}。`,
      seq,
    })
  }
  if (mode === 'even') {
    const ans = '1/2'
    return buildLocalQuestion({
      difficulty: 'easy',
      term: '单骰偶数',
      passage: '掷一枚均匀骰子一次。',
      stem: '点数为偶数的概率是多少？',
      correct: ans,
      distractors: uniqueStr(ans, ['1/3', '2/3', '1/6', '3/5']),
      method: '偶数 2、4、6 共 3 种，P=3/6=1/2。',
      explanation: 'P=1/2。',
      seq,
    })
  }
  const fav = 2
  const ans = fmtFrac(fav, 6)
  return buildLocalQuestion({
    difficulty: 'easy',
    term: '单骰至少五点',
    passage: '掷一枚均匀骰子一次。',
    stem: '点数不小于 5 的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, ['1/2', '1/3', '5/6', '2/5']),
    method: '有利：5、6 共 2 种；P=2/6=1/3。',
    explanation: `P=${ans}。`,
    seq,
  })
}

function genEasyCards(seq: number): ProbabilityQuestion | null {
  const n = pickOne([5, 6, 8])
  const good = pickOne([2, 3])
  if (good >= n) return null
  const ans = fmtFrac(good, n)
  return buildLocalQuestion({
    difficulty: 'easy',
    term: '抽签古典概率',
    passage: `${n} 张卡片中有 ${good} 张写有「中奖」，其余空白。随机抽 1 张。`,
    stem: '抽到中奖卡的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(1, n),
      fmtFrac(good, n - 1),
      fmtFrac(n - good, n),
      '1/2',
    ]),
    method: '古典概率 P=m/n。',
    explanation: `P=${good}/${n}=${ans}。`,
    seq,
  })
}

function genEasyComboMenu(seq: number): ProbabilityQuestion | null {
  // 简化：3 种饮料、2 种点心，随机各选 1，求选到某饮料概率
  const drinks = pickOne([3, 4])
  const snacks = pickOne([2, 3])
  const targetDrink = 1
  const total = drinks * snacks
  const fav = targetDrink * snacks
  const ans = fmtFrac(fav, total)
  return buildLocalQuestion({
    difficulty: 'easy',
    term: '套餐枚举古典概率',
    passage: `饮料 ${drinks} 种、点心 ${snacks} 种，每种套餐=1 饮料+1 点心，等可能随机选一套。`,
    stem: '恰好选中某一指定饮料的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(1, drinks),
      fmtFrac(1, snacks),
      fmtFrac(1, total),
      fmtFrac(snacks, drinks),
    ]),
    method: '总套餐数=drinks×snacks；指定饮料对应 snacks 种套餐。',
    explanation: `P=${fav}/${total}=${ans}。`,
    seq,
  })
}

// ——— 普通 · 真题 2 分类分步 ———

function genMediumBestOfThree(seq: number): ProbabilityQuestion | null {
  // 对齐真题 2：三局两胜，各局胜率不同
  const p1 = pickOne([0.7, 0.8, 0.75])
  const p2 = pickOne([0.8, 0.9, 0.85])
  const p3 = pickOne([0.5, 0.6, 0.55])
  const q1 = 1 - p1
  const q2 = 1 - p2
  const win12 = p1 * p2
  const win132 = p1 * q2 * p3
  const win231 = q1 * p2 * p3
  const p = win12 + win132 + win231
  const ans = fmtPct1(p)
  return buildLocalQuestion({
    difficulty: 'medium',
    term: '三局两胜分类分步（经典真题 2）',
    passage: `网球决赛采用三局两胜。甲第 1 局胜率 ${fmtPct1(p1)}，第 2 局 ${fmtPct1(p2)}，第 3 局 ${fmtPct1(p3)}（各局独立）。`,
    stem: '甲获得冠军的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtPct1(win12),
      fmtPct1(p1 * p2 * p3),
      fmtPct1(win12 + win132),
      fmtPct1((p1 + p2 + p3) / 3),
      '72%',
    ]),
    method: '分类：①连胜前两局；②一胜一负后再胜第三局（两种顺序）。同类内分步相乘，类间相加。',
    explanation: `${fmtPct1(win12)}+${fmtPct1(win132)}+${fmtPct1(win231)}=${ans}。`,
    seq,
  })
}

function genMediumTwoStep(seq: number): ProbabilityQuestion | null {
  const pPass1 = pickOne([0.6, 0.7, 0.8])
  const pPass2 = pickOne([0.5, 0.6, 0.75])
  const p = pPass1 * pPass2
  const ans = fmtPct1(p)
  return buildLocalQuestion({
    difficulty: 'medium',
    term: '分步相乘概率',
    passage: `某考试分两关，独立进行。通过第一关概率 ${fmtPct1(pPass1)}，通过第二关概率 ${fmtPct1(pPass2)}。`,
    stem: '两关都通过的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtPct1(pPass1 + pPass2 - p),
      fmtPct1((pPass1 + pPass2) / 2),
      fmtPct1(pPass1),
      fmtPct1(1 - (1 - pPass1) * (1 - pPass2)),
    ]),
    method: '分步事件：P=P₁×P₂。',
    explanation: `${fmtPct1(pPass1)}×${fmtPct1(pPass2)}=${ans}。`,
    seq,
  })
}

function genMediumClassifyOr(seq: number): ProbabilityQuestion | null {
  // 抽奖：一等奖或二等奖（互斥）
  const p1 = pickOne([0.05, 0.1, 0.08])
  const p2 = pickOne([0.15, 0.2, 0.12])
  const p = p1 + p2
  const ans = fmtPct1(p)
  return buildLocalQuestion({
    difficulty: 'medium',
    term: '分类相加概率',
    passage: `抽奖中，获一等奖概率 ${fmtPct1(p1)}，获二等奖概率 ${fmtPct1(p2)}，二者互斥。`,
    stem: '获一等奖或二等奖的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtPct1(p1 * p2),
      fmtPct1(Math.max(p1, p2)),
      fmtPct1(1 - (1 - p1) * (1 - p2)),
      fmtPct1(p1),
    ]),
    method: '分类互斥事件：P=P₁+P₂。',
    explanation: `${fmtPct1(p1)}+${fmtPct1(p2)}=${ans}。`,
    seq,
  })
}

function genMediumSeriesFail(seq: number): ProbabilityQuestion | null {
  // 至少赢一局：1-(全输)
  const p = pickOne([0.4, 0.5, 0.6])
  const n = pickOne([2, 3])
  const allLose = Math.pow(1 - p, n)
  const ans = fmtPct1(1 - allLose)
  return buildLocalQuestion({
    difficulty: 'medium',
    term: '至少一次成功',
    passage: `某选手每局独立获胜概率为 ${fmtPct1(p)}，共打 ${n} 局。`,
    stem: '至少获胜一局的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtPct1(n * p),
      fmtPct1(Math.pow(p, n)),
      fmtPct1(allLose),
      fmtPct1(1 - Math.pow(p, n)),
    ]),
    method: '对立事件：P(至少一胜)=1−P(全败)=1−(1−p)^n。',
    explanation: `1−(${fmtPct1(1 - p)})^${n}=${ans}。`,
    seq,
  })
}

function genMediumPathWin(seq: number): ProbabilityQuestion | null {
  // 两条晋级路径分类
  const a = pickOne([0.3, 0.4])
  const b = pickOne([0.5, 0.6])
  const c = pickOne([0.2, 0.25])
  const d = pickOne([0.7, 0.8])
  // 路径1: a*b；路径2: c*d；互斥近似（简化为直接相加，题面声明两条互斥路径）
  const p = a * b + c * d
  const ans = fmtPct1(p)
  return buildLocalQuestion({
    difficulty: 'medium',
    term: '双路径分类分步',
    passage: `晋级有两条互斥路径：路径甲需连续过两关（概率分别为 ${fmtPct1(a)}、${fmtPct1(b)}）；路径乙需连续过两关（概率分别为 ${fmtPct1(c)}、${fmtPct1(d)}）。`,
    stem: '最终晋级的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtPct1(a * b),
      fmtPct1(c * d),
      fmtPct1(a * b * c * d),
      fmtPct1((a + c) * (b + d) / 4),
    ]),
    method: '每条路径内分步相乘，路径之间分类相加。',
    explanation: `${fmtPct1(a * b)}+${fmtPct1(c * d)}=${ans}。`,
    seq,
  })
}

// ——— 困难 · 几何概率种子 ———

function seedAsymmWait(): ProbabilitySeed {
  // 仅使用已手算核验的参数（对齐经典真题 3 及等比变体）
  const pick = pickOne([
    {
      T: 60,
      L0: 30,
      w: 10,
      ans: '7/12',
      failNote: '失败区梯形面积 / (60×30) = 7/12',
      stem: '需要去寄存柜取件的概率是多少？',
    },
    {
      T: 90,
      L0: 45,
      w: 15,
      ans: '7/12',
      failNote: '与经典真题 3 同比放大，面积比仍为 7/12',
      stem: '需要去寄存柜取件的概率是多少？',
    },
    {
      T: 60,
      L0: 30,
      w: 20,
      ans: '5/12',
      failNote: '失败区面积 / (60×30) = 5/12',
      stem: '需要去寄存柜取件的概率是多少？',
    },
    {
      T: 60,
      L0: 30,
      w: 10,
      ans: '5/12',
      failNote: '成功接收 = 1 − 7/12 = 5/12',
      stem: '能够当面签收（不必去寄存柜）的概率是多少？',
    },
  ])
  const { T, L0, w, ans, failNote, stem } = pick
  return {
    hardTypeId: 'asymm-wait',
    term: '非对称到达·寄存柜',
    passage: `快递员在 ${T} 分钟时段内均匀随机送达；收件人只在后 ${T - L0} 分钟内均匀随机到家。若快递员先到且收件人超过 ${w} 分钟仍未到，则放入寄存柜。`,
    stem,
    correct: ans,
    distractors: uniqueStr(ans, ['1/9', '8/9', '1/2', '2/3', '1/3', '7/12', '5/12']),
    method: [
      '几何概率：把「送达时刻、到家时刻」画成平面上的点 (x,y)。',
      `① 样本空间：x 在 0～${T}，y 在 ${L0}～${T}，是一个宽 ${T}、高 ${T - L0} 的矩形。`,
      `② 进寄存柜的条件：快递员先到且收件人迟到超过 ${w} 分钟，即 y > x+${w}（图中虚线上方的阴影）。`,
      '③ P = 阴影面积 ÷ 矩形总面积。',
    ].join('\n'),
    explanation: `${failNote}。对照示意图：横轴 x=送达，纵轴 y=到家；虚线为 y=x+${w}。最终 P=${ans}。`,
    anchorHint: `T=${T},L0=${L0},w=${w}；题干问法已定；答案必须是 ${ans}。解析须分「建坐标→定阴影→面积比」三步写清。`,
    diagramPreset: 'courier-wait',
    diagramCaption: `读图：矩形是全部可能；橙色阴影是「y>x+${w}」进寄存柜的情形。`,
  }
}

function seedSymmMeet(): ProbabilitySeed {
  const T = pickOne([60, 30, 45])
  const w = pickOne([15, 10, 20].filter((x) => x < T))
  // P(meet)=1-((T-w)^2)/T^2
  const miss = (T - w) * (T - w)
  const total = T * T
  const meet = total - miss
  const ans = fmtFrac(meet, total)
  return {
    hardTypeId: 'symm-meet',
    term: '对称会面几何概率',
    passage: `甲、乙约定在 ${T} 分钟内到达某地，到达时刻在时段内均匀分布、相互独立。先到者等候 ${w} 分钟，逾期即离去。`,
    stem: '两人能够会面的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(miss, total),
      fmtFrac(w, T),
      fmtFrac(2 * w * T - w * w, total),
      '1/2',
      fmtFrac(w * w, total),
    ]),
    method: [
      '几何概率（会面问题）：',
      `① 设甲到达时刻为 x、乙为 y，都在 0～${T}，样本空间是边长 ${T} 的正方形，面积 ${T}²。`,
      `② 能会面 ⟺ |x−y|≤${w}（图中中间带状区域）。`,
      `③ 两角空白是错过区，每个直角边长 ${T - w}，合计面积 (${T}−${w})²。`,
      `④ 会面概率 = 1 − 错过面积/总面积 = 1−(${T}−${w})²/${T}²。`,
    ].join('\n'),
    explanation: `代入：1−(${T}−${w})²/${T}² = 1−${miss}/${total} = ${ans}。`,
    anchorHint: `T=${T},w=${w}；会面概率必须=${ans}。解析须说明正方形样本与带状会面区。`,
    diagramPreset: 'meet-square',
    diagramCaption: `读图：大正方形=全部到达组合；中间色带=|x−y|≤${w} 能会面。`,
  }
}

function seedBusInterval(): ProbabilitySeed {
  const interval = pickOne([10, 12, 15])
  const maxWaitOk = pickOne([3, 4, 5, 6])
  if (maxWaitOk >= interval) return seedBusInterval()
  // 到达均匀落在班距内，等待时间 = 距下一班；等待≤maxWaitOk 的概率 = maxWaitOk/interval
  const ans = fmtFrac(maxWaitOk, interval)
  return {
    hardTypeId: 'bus-interval',
    term: '等公交车几何概率',
    passage: `公交车每隔 ${interval} 分钟一班，你在任意时刻到达车站（在班距内均匀）。`,
    stem: `等待时间不超过 ${maxWaitOk} 分钟的概率是多少？`,
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(interval - maxWaitOk, interval),
      fmtFrac(1, interval),
      fmtFrac(maxWaitOk, interval - maxWaitOk),
      '1/2',
    ]),
    method: [
      '几何概率（一维线段）：',
      `① 两班车间隔 ${interval} 分钟，你的到达时刻在这 ${interval} 分钟内均匀，可看成长度为 ${interval} 的线段。`,
      `② 等车时间 = 距下一班的剩余时间。要「等待≤${maxWaitOk} 分钟」，只能落在下一班前 ${maxWaitOk} 分钟那段（图中加粗段）。`,
      `③ P = 有利长度 ÷ 总长度 = ${maxWaitOk}/${interval}。`,
    ].join('\n'),
    explanation: `有利长 ${maxWaitOk}，总长 ${interval}，P=${ans}。`,
    anchorHint: `班距=${interval}，时限=${maxWaitOk}，答案=${ans}。`,
    diagramPreset: 'bus-line',
    diagramCaption: `读图：整段=一个班距；加粗段=还能赶上「等待≤${maxWaitOk} 分钟」。`,
  }
}

function seedStickTriangle(): ProbabilitySeed {
  // 固定答案 1/4，改写长度叙述
  const L = pickOne([1, 6, 12])
  return {
    hardTypeId: 'stick-triangle',
    term: '木棒折三段成三角',
    passage: `一根长 ${L} 的木棒在任意两点处折断（断点在棒上均匀独立），折成三段。`,
    stem: '三段能构成三角形的概率是多少？',
    correct: '1/4',
    distractors: uniqueStr('1/4', ['1/2', '1/3', '1/6', '3/4', '1/8']),
    method: [
      '几何概率（折棒成三角）：',
      `① 两断点可表示成平面上的点，样本空间是一个三角形区域（见图）。`,
      `② 三段能围成三角形 ⟺ 每一段都短于全长的一半（即每段 < ${L}/2）。`,
      '③ 满足条件的点落在样本三角形正中间的小区域，面积恰好是样本的 1/4。',
      '④ 因此 P=1/4。',
    ].join('\n'),
    explanation: `无论棒长取 ${L} 还是其他正数，面积比不变，P=1/4。`,
    anchorHint: '无论 L 取值，答案必须是 1/4。解析须提到「每段<半长」与面积比 1/4。',
    diagramPreset: 'stick-triangle',
    diagramCaption: '读图：大三角=全部折法；中间小色块=能围成三角形（面积比 1/4）。',
  }
}

function seedSquareRegion(): ProbabilitySeed {
  const side = pickOne([1, 2, 4])
  const mode = pickOne(['half', 'eighth'] as const)
  if (mode === 'half') {
    return {
      hardTypeId: 'square-region',
      term: '正方形内不等式区域',
      passage: `在边长为 ${side} 的正方形内均匀随机取一点。设左下角为原点，横、纵坐标分别记为 x、y（均在 0～${side}）。`,
      stem: `该点落在「x+y ≤ ${side}」区域内的概率是多少？`,
      correct: '1/2',
      distractors: uniqueStr('1/2', ['1/4', '1/3', '2/3', '1/8']),
      method: [
        '几何概率（面积比）：',
        `① 全部可能：边长 ${side} 的正方形，总面积 = ${side}×${side} = ${side * side}。`,
        `② 有利条件 x+y≤${side}：在坐标平面上，这是直线 x+y=${side}（连结 (${side},0) 与 (0,${side})）左下方的直角三角形，直角顶点在原点 (0,0)。`,
        `③ 该直角三角形两条直角边都是 ${side}，面积 = 1/2×${side}×${side} = ${side * side / 2}。`,
        `④ P = 有利面积 / 总面积 = ${side * side / 2}/${side * side} = 1/2。`,
        '（直观：对角线把正方形一分为二，阴影刚好半块。）',
      ].join('\n'),
      explanation: `对照示意图：橙色三角 = { (x,y) | x+y≤${side} }；白三角 = { x+y>${side} }。两块一样大，故 P=1/2。`,
      anchorHint: `边长=${side}，区域 x+y≤${side}，答案=1/2。解析必须用具体数字 ${side}，禁止写英文 side；须说明「对角线平分正方形」。`,
      diagramPreset: 'square-region',
      diagramCaption: `读图：左下角为 (0,0)；斜边是 x+y=${side}；橙色三角是有利区，正好占正方形一半。`,
    }
  }
  const half = side / 2
  const favArea = (half * half) / 2
  const totalArea = side * side
  return {
    hardTypeId: 'square-region',
    term: '正方形内小三角区域',
    passage: `在边长为 ${side} 的正方形内均匀随机取一点。设左下角为原点，横、纵坐标为 x、y。`,
    stem: `该点落在「x+y ≤ ${half}」区域内的概率是多少？`,
    correct: '1/8',
    distractors: uniqueStr('1/8', ['1/4', '1/2', '1/16', '1/6']),
    method: [
      '几何概率（面积比）：',
      `① 总面积 = ${side}×${side} = ${totalArea}。`,
      `② 有利区 x+y≤${half}：是直角边为 ${half} 的小直角三角形（仍以原点为直角顶点）。`,
      `③ 有利面积 = 1/2×${half}×${half} = ${favArea}。`,
      `④ P = ${favArea}/${totalArea} = 1/8。`,
      `（相对整个正方形：小三角直角边是大边的 1/2，面积比是 (1/2)²×1/2÷1 = 1/8。）`,
    ].join('\n'),
    explanation: `小直角边 ${half}，面积 ${favArea}；大正方形面积 ${totalArea}；P=1/8。`,
    anchorHint: `边长=${side}，x+y≤${half}，答案=1/8。须用数字计算，禁止写 side。`,
    diagramPreset: 'square-region-small',
    diagramCaption: `读图：大正方形边长 ${side}；紧贴原点的小橙色三角是 x+y≤${half}，面积只占 1/8。`,
  }
}

function seedCircleInSquare(): ProbabilitySeed {
  const side = pickOne([2, 4, 6])
  // 内切圆：P = π(r^2)/(side^2) = π/4
  return {
    hardTypeId: 'circle-in-square',
    term: '方内圆靶心',
    passage: `边长为 ${side} 的正方形靶内有一个内切圆，飞镖均匀随机落在正方形内。`,
    stem: '飞镖落在圆内的概率是多少？',
    correct: 'π/4',
    distractors: uniqueStr('π/4', ['1/2', 'π/2', '1/π', 'π/6', '2/π']),
    method: [
      '几何概率（面积比）：',
      `① 正方形边长 ${side}，总面积 = ${side}² = ${side * side}。`,
      `② 内切圆半径 r = ${side}/2 = ${side / 2}，圆面积 = πr² = π×(${side / 2})² = ${((side / 2) * (side / 2))}π。`,
      `③ P = 圆面积 / 正方形面积 = ${((side / 2) * (side / 2))}π / ${side * side} = π/4。`,
      '（结论与边长无关：内切圆总是占正方形的 π/4。）',
    ].join('\n'),
    explanation: `代入边长 ${side}：P = π(${side / 2})² / ${side}² = π/4。`,
    anchorHint: '内切圆，答案必须是 π/4。解析用具体边长算出后再约简。',
    diagramPreset: 'circle-square',
    diagramCaption: '读图：外框是正方形靶；内圆是内切圆；落点在圆内的面积比恒为 π/4。',
  }
}

function seedTwoWindowReal(): ProbabilitySeed {
  // 用对称会面的「错过」表述作双窗口变体，保证分数干净
  const T = pickOne([60, 30, 45])
  const w = pickOne([15, 10, 20].filter((x) => x < T))
  const miss = (T - w) * (T - w)
  const total = T * T
  const ans = fmtFrac(miss, total)
  return {
    hardTypeId: 'two-window',
    term: '双窗口错峰',
    passage: `甲、乙各自在 ${T} 分钟窗口内均匀随机到达（相互独立）。若到达时刻相差超过 ${w} 分钟则错过。`,
    stem: '两人错过的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(total - miss, total),
      fmtFrac(w, T),
      '1/2',
      fmtFrac(1, 3),
    ]),
    method: [
      '几何概率（错过 = 会面的对立面）：',
      `① 样本空间：边长 ${T} 的正方形，面积 ${total}。`,
      `② 错过 ⟺ |x−y|>${w}，对应正方形两角的空白直角三角形，合计面积 (${T}−${w})² = ${miss}。`,
      `③ P(错过) = ${miss}/${total} = ${ans}。`,
    ].join('\n'),
    explanation: `P=(${T}−${w})²/${T}²=${ans}。若问会面则再算 1−该值。`,
    anchorHint: `T=${T},w=${w}；错过概率必须=${ans}。`,
    diagramPreset: 'meet-square',
    diagramCaption: `读图：两角空白 = 错过；中间色带 = 能遇上（|x−y|≤${w}）。本题问空白占比。`,
  }
}

function seedSegmentOverlap(): ProbabilitySeed {
  const S = pickOne([60, 90])
  const dur = pickOne([20, 30])
  const miss = (S - dur) * (S - dur)
  const total = S * S
  const hit = total - miss
  const ans = fmtFrac(hit, total)
  return {
    hardTypeId: 'segment-overlap',
    term: '随机时段重叠',
    passage: `甲、乙各自在 ${S} 分钟内均匀随机选择开始时刻，并连续占用 ${dur} 分钟。若时间段有交集则冲突。`,
    stem: '发生冲突的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(miss, total),
      fmtFrac(dur, S),
      '1/2',
      fmtFrac(2 * dur * S - dur * dur, total),
    ]),
    method: [
      '与会面问题同构：',
      `① 甲、乙开始时刻 (x,y) 落在边长 ${S} 的正方形内。`,
      `② 两段各长 ${dur} 分钟有交集 ⟺ |x−y|<${dur}（中间带状）。`,
      `③ 不冲突面积 = (${S}−${dur})² = ${miss}；冲突概率 = 1−${miss}/${total} = ${ans}。`,
    ].join('\n'),
    explanation: `P=1−(${S}−${dur})²/${S}²=${ans}。`,
    anchorHint: `S=${S},dur=${dur}；答案=${ans}。`,
    diagramPreset: 'meet-square',
    diagramCaption: `读图：色带表示 |x−y|<${dur} 会发生时段冲突。`,
  }
}

function seedTrianglePick(): ProbabilitySeed {
  // 等腰直角三角形直角边 a，小相似三角形直角边 a/2，面积比 1/4
  const a = pickOne([2, 4, 6])
  return {
    hardTypeId: 'triangle-pick',
    term: '三角形内取点',
    passage: `在直角边为 ${a} 的等腰直角三角形内均匀随机取一点。`,
    stem: `该点落在「以直角顶点为公共顶点、直角边为 ${a / 2} 的小等腰直角三角形」内的概率是多少？`,
    correct: '1/4',
    distractors: uniqueStr('1/4', ['1/2', '1/8', '1/3', '√2/4']),
    method: [
      '几何概率（相似三角形面积比）：',
      `① 大三角形直角边 ${a}，面积记为 S。`,
      `② 小三角形与它相似，直角边 ${a / 2}，相似比 = 1/2。`,
      '③ 面积比 = (相似比)² = 1/4。',
      '④ 点均匀落在大三角形内，落在小三角形内的概率 = 面积比 = 1/4。',
    ].join('\n'),
    explanation: `相似比 1/2 → 面积比 1/4 → P=1/4。`,
    anchorHint: `大直角边=${a}，小直角边=${a / 2}，答案=1/4。`,
    diagramPreset: 'square-region-small',
    diagramCaption: `读图：大区域是大直角三角形；贴着直角顶点的小色块相似比为 1/2，面积占 1/4。`,
  }
}

function seedRainCatch(): ProbabilitySeed {
  const day = pickOne([60, 120])
  const window = pickOne([10, 15, 20])
  if (window >= day) return seedRainCatch()
  const ans = fmtFrac(window, day)
  return {
    hardTypeId: 'rain-catch',
    term: '降雨窗口拦截',
    passage: `未来 ${day} 分钟内会下一次短时雨，降雨开始时刻在该时段内均匀分布。你只在其中连续 ${window} 分钟出门。`,
    stem: '恰好在出门时段内开始下雨的概率是多少？',
    correct: ans,
    distractors: uniqueStr(ans, [
      fmtFrac(day - window, day),
      fmtFrac(1, day),
      '1/2',
      fmtFrac(window, day - window),
    ]),
    method: [
      '几何概率（一维线段）：',
      `① 降雨开始时刻在 0～${day} 分钟内均匀，样本是长 ${day} 的线段。`,
      `② 「正好在出门时段开始下」：有利长度 = 出门窗口 ${window} 分钟。`,
      `③ P = ${window}/${day} = ${ans}。`,
    ].join('\n'),
    explanation: `有利长 ${window}，总长 ${day}，P=${ans}。`,
    anchorHint: `总时长=${day}，窗口=${window}，答案=${ans}。`,
    diagramPreset: 'bus-line',
    diagramCaption: `读图：整段=${day} 分钟；加粗段=你的 ${window} 分钟出门窗口。`,
  }
}

const HARD_SEED_BUILDERS: Record<ProbabilityHardTypeId, () => ProbabilitySeed> = {
  'asymm-wait': seedAsymmWait,
  'symm-meet': seedSymmMeet,
  'bus-interval': seedBusInterval,
  'stick-triangle': seedStickTriangle,
  'square-region': seedSquareRegion,
  'circle-in-square': seedCircleInSquare,
  'two-window': seedTwoWindowReal,
  'segment-overlap': seedSegmentOverlap,
  'triangle-pick': seedTrianglePick,
  'rain-catch': seedRainCatch,
}

export function pickProbabilityHardSeeds(count = PROBABILITY_QUESTION_COUNT): ProbabilitySeed[] {
  const types = shuffleInPlace([...PROBABILITY_HARD_EXAM_TYPES.map((x) => x.id)])
  const out: ProbabilitySeed[] = []
  for (const id of types) {
    if (out.length >= count) break
    try {
      out.push(HARD_SEED_BUILDERS[id]())
    } catch {
      /* skip */
    }
  }
  let guard = 0
  while (out.length < count && guard++ < 30) {
    const id = pickOne(PROBABILITY_HARD_EXAM_TYPES.map((x) => x.id))
    if (out.some((s) => s.hardTypeId === id)) continue
    out.push(HARD_SEED_BUILDERS[id]())
  }
  return out.slice(0, count)
}

export function buildLocalProbabilityHardPaper(
  count = PROBABILITY_QUESTION_COUNT,
): ProbabilityQuestion[] {
  const seeds = pickProbabilityHardSeeds(count)
  const out: ProbabilityQuestion[] = []
  const seen = new Set<string>()
  seeds.forEach((seed, i) => {
    const q = buildProbabilityQuestionFromSeed(seed, 'hard', i)
    if (q && !seen.has(q.fingerprint)) {
      seen.add(q.fingerprint)
      out.push(q)
    }
  })
  return out
}

function tryBuild(
  factory: () => ProbabilityQuestion | null,
  maxTry = 40,
): ProbabilityQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

/** 简单/普通本地组卷；困难请用 requestProbabilityHardMcqs（AI）或 buildLocalProbabilityHardPaper */
export function generateProbabilityPaper(
  difficulty: ProbabilityDifficulty,
): ProbabilityQuestion[] {
  const out: ProbabilityQuestion[] = []
  const seen = new Set<string>()
  const push = (q: ProbabilityQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'hard') {
    return buildLocalProbabilityHardPaper()
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyBreakfast,
      genEasyBalls,
      genEasyDice,
      genEasyCards,
      genEasyComboMenu,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PROBABILITY_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PROBABILITY_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const factories = [
      genMediumBestOfThree,
      genMediumTwoStep,
      genMediumClassifyOr,
      genMediumSeriesFail,
      genMediumPathWin,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PROBABILITY_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PROBABILITY_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  }

  return out.slice(0, PROBABILITY_QUESTION_COUNT)
}
