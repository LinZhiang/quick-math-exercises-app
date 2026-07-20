/**
 * 其他运算 · 函数图象问题
 * 豆包改写题干；曲线图为本地 SVG（选项四图择一）。每轮 5 题。
 *
 * 教材四点：增减、周期、直线/曲线（y=kx+b / y=k/x）、状态变化点。
 * 【简单】比经典真题更易（常速增减、认直线/反比例）
 * 【普通】对齐经典真题（库存加速下降→开口向下且越来越陡）
 * 【困难】≥6 变式，每轮题型不重复
 */

export type FunctionGraphDifficulty = 'easy' | 'medium' | 'hard'

export const FUNCTION_GRAPH_QUESTION_COUNT = 5

export const FUNCTION_GRAPH_MODES: {
  id: FunctionGraphDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '函数图象 · 简单',
    desc: '每轮 5 题 · 比经典真题更易 · 豆包改写+曲线图 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '函数图象 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（加速下降抛物线）· 豆包改写+曲线图 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '函数图象 · 困难',
    desc: '每轮 5 题 · 高于例题的变式（每题题型不同）· 豆包改写+曲线图 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const FUNCTION_GRAPH_HARD_EXAM_TYPES = [
  { id: 'accel-decline-plus', name: '加速下降加强', note: '经典库存同构，参数更大' },
  { id: 'periodic', name: '周期变化', note: '温度/潮汐等周期曲线' },
  { id: 'inverse', name: '反比例模型', note: 'y=k/x 型下降支' },
  { id: 'piecewise', name: '分段状态', note: '先匀速再加速/平台' },
  { id: 'decel-growth', name: '减速增长', note: '上升且越来越平' },
  { id: 'absolute-v', name: '折线/绝对值', note: '先降后升或先升后降' },
  { id: 'step', name: '阶梯变化', note: '分段常值阶梯' },
  { id: 'inflection-match', name: '拐点匹配', note: '最高/最低/拐点与题意对应' },
] as const

export type FunctionGraphHardTypeId = (typeof FUNCTION_GRAPH_HARD_EXAM_TYPES)[number]['id']

/** 选项曲线类型（本地 SVG 绘制） */
export type FunctionGraphKind =
  | 'linear-down'
  | 'linear-up'
  | 'curve-down-steepen'
  | 'curve-down-flatten'
  | 'curve-up-steepen'
  | 'curve-up-flatten'
  | 'hyperbola-down'
  | 'periodic'
  | 'piecewise-flat-then-down'
  | 'piecewise-down-then-flat'
  | 'step-down'
  | 'absolute-v'

export const FUNCTION_GRAPH_KIND_LABEL: Record<FunctionGraphKind, string> = {
  'linear-down': '直线下降',
  'linear-up': '直线上升',
  'curve-down-steepen': '下降且越来越陡',
  'curve-down-flatten': '下降且越来越平',
  'curve-up-steepen': '上升且越来越陡',
  'curve-up-flatten': '上升且越来越平',
  'hyperbola-down': '反比例型下降',
  periodic: '周期波动',
  'piecewise-flat-then-down': '先平后降',
  'piecewise-down-then-flat': '先降后平',
  'step-down': '阶梯下降',
  'absolute-v': '折线 V 形',
}

export type FunctionGraphSeed = {
  difficulty: FunctionGraphDifficulty
  term: string
  hardTypeId?: FunctionGraphHardTypeId
  passage: string
  stem: string
  /** 四个选项对应的曲线，correctIndex 指向正确项 */
  optionKinds: [FunctionGraphKind, FunctionGraphKind, FunctionGraphKind, FunctionGraphKind]
  correctIndex: number
  method: string
  explanation: string
  anchorHint: string
}

export type FunctionGraphQuestion = {
  id: string
  topic: 'function-graph'
  difficulty: FunctionGraphDifficulty
  term: string
  passage: string
  stem: string
  /** 文本占位，实际作答看 optionKinds 图 */
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  optionKinds: FunctionGraphKind[]
  hardTypeId?: FunctionGraphHardTypeId
}

export function functionGraphTopicLabel(): string {
  return '函数图象问题'
}

export function functionGraphDifficultyLabel(d: FunctionGraphDifficulty): string {
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

function optionLetters(kinds: FunctionGraphKind[]): string[] {
  return kinds.map((k, i) => `${'ABCD'[i]}（${FUNCTION_GRAPH_KIND_LABEL[k]}）`)
}

export function buildFunctionGraphQuestionFromSeed(
  seed: FunctionGraphSeed,
  seq: number,
  override?: Partial<Pick<FunctionGraphSeed, 'passage' | 'stem' | 'method' | 'explanation' | 'term'>>,
): FunctionGraphQuestion | null {
  const kinds = [...seed.optionKinds] as FunctionGraphKind[]
  if (kinds.length !== 4) return null
  const indexed = kinds.map((k, i) => ({ k, i }))
  shuffleInPlace(indexed)
  const optionKinds = indexed.map((x) => x.k)
  const correctIndex = indexed.findIndex((x) => x.i === seed.correctIndex)
  if (correctIndex < 0) return null
  const options = optionLetters(optionKinds)
  const passage = (override?.passage ?? seed.passage).trim()
  const stem = (override?.stem ?? seed.stem).trim()
  const method = (override?.method ?? seed.method).trim()
  const explanation = (override?.explanation ?? seed.explanation).trim()
  const term = (override?.term ?? seed.term).trim()
  const fingerprint = [
    'function-graph',
    seed.difficulty,
    seed.hardTypeId ?? '',
    passage,
    stem,
    optionKinds.join('|'),
    String(correctIndex),
  ].join('\u001e')
  return {
    id: `fg-${seed.difficulty}-${seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'function-graph',
    difficulty: seed.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
    method,
    explanation,
    fingerprint,
    optionKinds,
    hardTypeId: seed.hardTypeId,
  }
}

function packOptions(
  correct: FunctionGraphKind,
  distractors: FunctionGraphKind[],
): { optionKinds: [FunctionGraphKind, FunctionGraphKind, FunctionGraphKind, FunctionGraphKind]; correctIndex: number } {
  const pool = [correct, ...distractors.filter((d) => d !== correct)].slice(0, 4)
  while (pool.length < 4) {
    const fill = pickOne([
      'linear-down',
      'linear-up',
      'curve-down-steepen',
      'curve-down-flatten',
      'hyperbola-down',
      'periodic',
    ] as FunctionGraphKind[])
    if (!pool.includes(fill)) pool.push(fill)
  }
  const optionKinds = pool as [FunctionGraphKind, FunctionGraphKind, FunctionGraphKind, FunctionGraphKind]
  return { optionKinds, correctIndex: 0 }
}

// ——— seeds ———

function seedEasyLinearDown(): FunctionGraphSeed {
  const stock = pickOne([800, 1000, 1200])
  const daily = pickOne([40, 50, 60])
  const { optionKinds, correctIndex } = packOptions('linear-down', [
    'curve-down-steepen',
    'curve-down-flatten',
    'linear-up',
  ])
  return {
    difficulty: 'easy',
    term: '匀速消耗直线下降',
    passage: `某仓库原有存货 ${stock} 件，此后每天固定卖出 ${daily} 件（卖完为止前）。`,
    stem: '下列哪幅图最能表示存货量 y 随天数 x 的变化？',
    optionKinds,
    correctIndex,
    method: [
      '每天卖出量恒定 ⇒ 存货随时间匀速减少。',
      '对应一次函数 y = kx+b（k<0），图象为直线下降。',
    ].join('\n'),
    explanation: '匀速下降对应直线下降图象。',
    anchorHint: '常速消耗→线性下降；勿改成加速/减速。',
  }
}

function seedEasyLinearUp(): FunctionGraphSeed {
  const v = pickOne([30, 40, 50])
  const { optionKinds, correctIndex } = packOptions('linear-up', [
    'curve-up-steepen',
    'curve-up-flatten',
    'linear-down',
  ])
  return {
    difficulty: 'easy',
    term: '匀速行驶直线上升',
    passage: `汽车以每小时 ${v} 千米的速度匀速行驶。`,
    stem: '路程 y 与时间 x 的关系最接近哪幅图？',
    optionKinds,
    correctIndex,
    method: ['匀速 ⇒ y=vx，一次函数 k>0，直线上升。'].join('\n'),
    explanation: '匀速路程是直线上升。',
    anchorHint: '匀速路程→线性上升。',
  }
}

function seedEasyHyperbola(): FunctionGraphSeed {
  const k = pickOne([60, 120, 240])
  const { optionKinds, correctIndex } = packOptions('hyperbola-down', [
    'linear-down',
    'curve-down-steepen',
    'curve-down-flatten',
  ])
  return {
    difficulty: 'easy',
    term: '反比例认图',
    passage: `完成一件工作的总量一定。若工作效率为 x，所需时间 y 满足 y=${k}/x（x>0）。`,
    stem: 'y 随 x 变化的图象最接近？',
    optionKinds,
    correctIndex,
    method: ['y=k/x（k≠0）是反比例函数，在第一象限单调递减且弯曲（越来越平）。'].join('\n'),
    explanation: '反比例下降支。',
    anchorHint: '反比例 y=k/x，不是直线也不是开口向下抛物线。',
  }
}

function seedEasyMonoUp(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('curve-up-flatten', [
    'linear-down',
    'curve-down-steepen',
    'periodic',
  ])
  return {
    difficulty: 'easy',
    term: '单调递增认图',
    passage: '某指标随时间持续增加，但增加得越来越慢。',
    stem: '下列哪幅图符合描述？',
    optionKinds,
    correctIndex,
    method: ['持续增加 ⇒ 上升；越来越慢 ⇒ 斜率绝对值变小，上升越来越平。'].join('\n'),
    explanation: '上升且越来越平。',
    anchorHint: '上升且减速→curve-up-flatten。',
  }
}

function seedEasyConstantDown(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('linear-down', [
    'periodic',
    'step-down',
    'curve-up-steepen',
  ])
  return {
    difficulty: 'easy',
    term: '水位匀速下降',
    passage: '水池放水，水面高度每分钟下降同样的高度。',
    stem: '高度 y 与时间 x 的图象最接近？',
    optionKinds,
    correctIndex,
    method: ['匀速下降 ⇒ 一次函数直线下降。'].join('\n'),
    explanation: '直线下降。',
    anchorHint: '匀速下降→linear-down。',
  }
}

function seedMediumClassicInventory(): FunctionGraphSeed {
  const init = pickOne([800, 1000, 1200])
  const a1 = pickOne([8, 10, 12])
  const d = pickOne([4, 5, 6])
  const days = pickOne([12, 15, 18])
  const { optionKinds, correctIndex } = packOptions('curve-down-steepen', [
    'curve-down-flatten',
    'linear-down',
    'curve-up-steepen',
  ])
  return {
    difficulty: 'medium',
    term: '库存加速下降（经典真题）',
    passage: `某商品初始库存 ${init} 件。第 1 天卖出 ${a1} 件，从第 2 天起每天比前一天多卖 ${d} 件。`,
    stem: `前 ${days} 天内，库存 y 与天数 x 的关系最接近哪幅图？`,
    optionKinds,
    correctIndex,
    method: [
      '每天卖得越来越多（等差递增），像滚雪球。',
      `日销量：第 1 天 ${a1}，以后每天多 ${d}，是等差数列。`,
      `n 天总共卖掉的量 Sₙ 里带有 n² 项，所以库存 y=${init}−Sₙ 是开口朝下的抛物线。`,
      '卖得越来越快 ⇒ 库存曲线下降得越来越陡（不要选「越来越平」或直线）。',
    ].join('\n'),
    explanation: '下降且越来越陡——对应选项里「先缓后陡」的那条。',
    anchorHint: '经典：等差加速销售→库存二次下降且越来越陡；答案必须是 curve-down-steepen。',
  }
}

function seedMediumDecelFill(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('curve-up-flatten', [
    'curve-up-steepen',
    'linear-up',
    'hyperbola-down',
  ])
  return {
    difficulty: 'medium',
    term: '注水减速上升',
    passage: '向桶中注水：开始较快，之后注水速度逐渐变慢，但水位一直在上升。',
    stem: '水位 y 随时间 x 的图象最接近？',
    optionKinds,
    correctIndex,
    method: ['一直上升但速度变慢 ⇒ 上升且越来越平。'].join('\n'),
    explanation: '上升越来越平。',
    anchorHint: '减速上升→curve-up-flatten。',
  }
}

function seedMediumAccelCost(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('curve-up-steepen', [
    'linear-up',
    'curve-up-flatten',
    'curve-down-steepen',
  ])
  return {
    difficulty: 'medium',
    term: '费用加速上升',
    passage: '某业务第 1 天费用较低，之后每天费用比前一天增加固定金额（费用累计）。',
    stem: '累计费用 y 与天数 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['日费用等差递增 ⇒ 累计为二次且开口向上，上升越来越陡。'].join('\n'),
    explanation: '上升越来越陡。',
    anchorHint: '累计加速→curve-up-steepen。',
  }
}

function seedMediumLinearVsCurve(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('linear-down', [
    'curve-down-steepen',
    'hyperbola-down',
    'periodic',
  ])
  return {
    difficulty: 'medium',
    term: '辨别直线变化',
    passage: '列车进站前以恒定减速度刹车，速度随时间均匀减小（可视为匀变速至停下前的一段）。若将「速度均匀减小」近似为速度对时间的一次关系。',
    stem: '速度 y 与时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['匀变速 ⇒ v=v₀+at，一次函数，直线下降。'].join('\n'),
    explanation: '直线下降。',
    anchorHint: '匀变速速度→linear-down。',
  }
}

function seedMediumStatePoint(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('piecewise-down-then-flat', [
    'linear-down',
    'curve-down-steepen',
    'piecewise-flat-then-down',
  ])
  return {
    difficulty: 'medium',
    term: '状态变化点',
    passage: '水库先持续放水使水位下降，一段时间后停止放水，水位保持不变。',
    stem: '水位 y 随时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['先下降后水平 ⇒ 先降后平的分段图；拐点为停止放水时刻。'].join('\n'),
    explanation: '先降后平。',
    anchorHint: '先降后平→piecewise-down-then-flat。',
  }
}

function seedHardAccelPlus(): FunctionGraphSeed {
  const init = pickOne([2000, 2500, 3000])
  const a1 = pickOne([15, 20, 25])
  const d = pickOne([5, 8, 10])
  const { optionKinds, correctIndex } = packOptions('curve-down-steepen', [
    'curve-down-flatten',
    'linear-down',
    'step-down',
  ])
  return {
    difficulty: 'hard',
    term: '加速下降加强',
    hardTypeId: 'accel-decline-plus',
    passage: `库存 ${init}。首日售 ${a1}，之后每天比前一天多售 ${d}。`,
    stem: '库存 y 与天数 x（售完前）最接近？',
    optionKinds,
    correctIndex,
    method: [
      `Sₙ 为二次，y=${init}−Sₙ 开口向下；日销量递增 ⇒ 下降越来越陡。`,
    ].join('\n'),
    explanation: '下降越来越陡。',
    anchorHint: 'hard accel-decline-plus：必须 curve-down-steepen。',
  }
}

function seedHardPeriodic(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('periodic', [
    'linear-up',
    'curve-down-steepen',
    'hyperbola-down',
  ])
  return {
    difficulty: 'hard',
    term: '周期变化',
    hardTypeId: 'periodic',
    passage: '某地昼夜气温呈近似周期性变化：白天升高、夜晚降低，多日重复相似形态。',
    stem: '气温 y 与时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['存在周期变化 ⇒ 图象可分成若干段形状相近的波。'].join('\n'),
    explanation: '周期波动。',
    anchorHint: '周期→periodic。',
  }
}

function seedHardInverse(): FunctionGraphSeed {
  const k = pickOne([100, 200, 360])
  const { optionKinds, correctIndex } = packOptions('hyperbola-down', [
    'linear-down',
    'curve-down-flatten',
    'curve-down-steepen',
  ])
  return {
    difficulty: 'hard',
    term: '反比例模型',
    hardTypeId: 'inverse',
    passage: `矩形面积为 ${k}，一边长为 x，邻边 y=${k}/x（x>0）。`,
    stem: 'y 随 x 的图象最接近？',
    optionKinds,
    correctIndex,
    method: ['y=k/x 反比例，第一象限递减弯曲。'].join('\n'),
    explanation: '反比例下降。',
    anchorHint: 'inverse→hyperbola-down。',
  }
}

function seedHardPiecewise(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('piecewise-flat-then-down', [
    'piecewise-down-then-flat',
    'linear-down',
    'curve-down-steepen',
  ])
  return {
    difficulty: 'hard',
    term: '分段状态',
    hardTypeId: 'piecewise',
    passage: '某账户余额在促销前保持不变；促销开始后每天定额支出，余额下降。',
    stem: '余额 y 随时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['先水平后下降 ⇒ 先平后降；变化点为促销开始。'].join('\n'),
    explanation: '先平后降。',
    anchorHint: 'piecewise→piecewise-flat-then-down。',
  }
}

function seedHardDecelGrowth(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('curve-up-flatten', [
    'curve-up-steepen',
    'linear-up',
    'periodic',
  ])
  return {
    difficulty: 'hard',
    term: '减速增长',
    hardTypeId: 'decel-growth',
    passage: '学习成绩随练习次数提高，但提高幅度逐渐变小（仍在提高）。',
    stem: '成绩 y 与练习次数 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['递增但边际递减 ⇒ 上升越来越平。'].join('\n'),
    explanation: '上升越来越平。',
    anchorHint: 'decel-growth→curve-up-flatten。',
  }
}

function seedHardAbsoluteV(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('absolute-v', [
    'linear-up',
    'curve-up-steepen',
    'periodic',
  ])
  return {
    difficulty: 'hard',
    term: '折线/绝对值',
    hardTypeId: 'absolute-v',
    passage:
      '某天室外温度相对「舒适温度」的偏差（取绝对值）：上午越来越接近舒适温度，午后越来越远离。横轴为时间，纵轴为偏差大小。',
    stem: '偏差 y 随时间 x 最接近哪幅图？',
    optionKinds,
    correctIndex,
    method: [
      '偏差先变小、再变大，像字母 V：最低点表示「最接近舒适温度」的时刻。',
      '不是「先走远再回来」（那种距离会先升后降，形状相反）。',
    ].join('\n'),
    explanation: '先降后升的 V 形折线。',
    anchorHint: 'absolute-v→absolute-v（偏差绝对值：先靠近再远离）。',
  }
}

function seedHardStep(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('step-down', [
    'linear-down',
    'curve-down-steepen',
    'piecewise-down-then-flat',
  ])
  return {
    difficulty: 'hard',
    term: '阶梯变化',
    hardTypeId: 'step',
    passage: '停车场余位按「整小时」结算显示：每个整点突然减少固定车位（示意阶梯）。',
    stem: '显示余位 y 随时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['整点突变、段内不变 ⇒ 阶梯下降。'].join('\n'),
    explanation: '阶梯下降。',
    anchorHint: 'step→step-down。',
  }
}

function seedHardInflection(): FunctionGraphSeed {
  const { optionKinds, correctIndex } = packOptions('curve-down-steepen', [
    'curve-down-flatten',
    'absolute-v',
    'linear-down',
  ])
  return {
    difficulty: 'hard',
    term: '拐点匹配',
    hardTypeId: 'inflection-match',
    passage: '疫情扩散早期新增病例增速加快，累计确诊曲线应越来越陡地上升；若改画「剩余易感人数」则对应越来越陡地下降。',
    stem: '剩余易感人数 y 随时间 x 最接近？',
    optionKinds,
    correctIndex,
    method: ['剩余人数加速减少 ⇒ 下降且越来越陡；注意与「上升越来越陡」镜像。'].join('\n'),
    explanation: '下降越来越陡。',
    anchorHint: 'inflection-match→curve-down-steepen。',
  }
}

const EASY_BUILDERS = [
  seedEasyLinearDown,
  seedEasyLinearUp,
  seedEasyHyperbola,
  seedEasyMonoUp,
  seedEasyConstantDown,
]

const MEDIUM_BUILDERS = [
  seedMediumClassicInventory,
  seedMediumDecelFill,
  seedMediumAccelCost,
  seedMediumLinearVsCurve,
  seedMediumStatePoint,
]

const HARD_BUILDERS: Record<FunctionGraphHardTypeId, () => FunctionGraphSeed> = {
  'accel-decline-plus': seedHardAccelPlus,
  periodic: seedHardPeriodic,
  inverse: seedHardInverse,
  piecewise: seedHardPiecewise,
  'decel-growth': seedHardDecelGrowth,
  'absolute-v': seedHardAbsoluteV,
  step: seedHardStep,
  'inflection-match': seedHardInflection,
}

export function pickFunctionGraphSeeds(difficulty: FunctionGraphDifficulty): FunctionGraphSeed[] {
  if (difficulty === 'easy') {
    return shuffleInPlace([...EASY_BUILDERS]).map((f) => f())
  }
  if (difficulty === 'medium') {
    return shuffleInPlace([...MEDIUM_BUILDERS]).map((f) => f())
  }
  const types = shuffleInPlace([...FUNCTION_GRAPH_HARD_EXAM_TYPES.map((x) => x.id)])
  return types.slice(0, FUNCTION_GRAPH_QUESTION_COUNT).map((id) => HARD_BUILDERS[id]())
}

export function buildLocalFunctionGraphPaper(difficulty: FunctionGraphDifficulty): FunctionGraphQuestion[] {
  const seeds = pickFunctionGraphSeeds(difficulty)
  const out: FunctionGraphQuestion[] = []
  const seen = new Set<string>()
  for (let i = 0; i < seeds.length && out.length < FUNCTION_GRAPH_QUESTION_COUNT; i++) {
    const q = buildFunctionGraphQuestionFromSeed(seeds[i]!, i)
    if (!q || seen.has(q.fingerprint)) continue
    // hard: unique hardTypeId
    if (difficulty === 'hard' && q.hardTypeId) {
      if (out.some((x) => x.hardTypeId === q.hardTypeId)) continue
    }
    // easy/medium: unique term
    if (out.some((x) => x.term === q.term)) continue
    seen.add(q.fingerprint)
    out.push(q)
  }
  return out.slice(0, FUNCTION_GRAPH_QUESTION_COUNT)
}
