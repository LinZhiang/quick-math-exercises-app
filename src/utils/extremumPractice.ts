/**
 * 其他运算 · 最值问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式/方法：
 * 【一元二次最值】
 * - f(x)=ax²+bx+c，极值在 x=−b/(2a)
 * - f(x)=a(x−m)(x−n)，极值在 x=(m+n)/2（对称轴）
 * 【最不利原则】保证数 = 最不利数 + 1
 * 【和定最值】
 * - 相等型：尽量均等（商与余数）
 * - 不等型：尽量连续整数后再微调
 *
 * 【简单】比经典真题 1 略易；对齐真题 2、示例 1、示例 2
 * 【普通】对齐经典真题 1（二次利润）、真题 3（多层约束分配）
 * 【困难】高于全部例题；≥8 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ExtremumDifficulty = 'easy' | 'medium' | 'hard'

export const EXTREMUM_QUESTION_COUNT = 6

export const EXTREMUM_MODES: {
  id: ExtremumDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '最值 · 简单',
    desc: '每轮 6 题 · 对齐真题 2、示例 1/2（最不利、和定）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '最值 · 普通',
    desc: '每轮 6 题 · 对齐真题 1（二次利润）、真题 3（约束分配）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '最值 · 困难',
    desc: '每轮 6 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

export const EXTREMUM_HARD_EXAM_TYPES = [
  {
    id: 'quad-profit-plus',
    name: '二次利润加强',
    note: '降价步进 + 求最大利润或增额，参数更大',
  },
  {
    id: 'quad-vertex-formula',
    name: '顶点公式 −b/2a',
    note: '展开后用 x=−b/(2a) 求极值',
  },
  {
    id: 'worst-multi-color',
    name: '最不利多色加强',
    note: '保证某类或某组合，最不利+1',
  },
  {
    id: 'worst-pair-guarantee',
    name: '保证同色对/配对',
    note: '最不利取尽异类后再+1 的变形',
  },
  {
    id: 'sum-equal-min-max',
    name: '和定相等型加强',
    note: '最小化最大值：尽量均等',
  },
  {
    id: 'sum-unequal-min-max',
    name: '和定不等型加强',
    note: '必须互不相同：连续整数微调',
  },
  {
    id: 'sum-max-one-min-others',
    name: '和定最大化某一项',
    note: '其余取最小允许值',
  },
  {
    id: 'constraint-floor-dept',
    name: '楼层部门双约束加强',
    note: '真题 3 变式：双层最小值约束',
  },
  {
    id: 'quad-ask-x',
    name: '二次最值问自变量',
    note: '不求函数值，只求对称轴处的 x',
  },
  {
    id: 'mixed-worst-and-sum',
    name: '最不利与和定综合',
    note: '先最不利再和定，或反之',
  },
] as const

export type ExtremumHardTypeId = (typeof EXTREMUM_HARD_EXAM_TYPES)[number]['id']

export type ExtremumQuestion = {
  id: string
  topic: 'extremum'
  difficulty: ExtremumDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ExtremumHardTypeId
}

export function extremumTopicLabel(): string {
  return '最值问题'
}

export function extremumDifficultyLabel(d: ExtremumDifficulty): string {
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

function uniqueNum(correct: number, cands: number[]): string[] {
  const out: string[] = []
  const seen = new Set([String(correct)])
  for (const c of cands) {
    if (!Number.isFinite(c) || c === correct || c < 0) continue
    const s = String(Math.round(c))
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3 && g < 50) {
    const fake = String(correct + g)
    g++
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: ExtremumDifficulty
  term: string
  passage: string
  stem: string
  correct: number
  distractors: number[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: ExtremumHardTypeId
}): ExtremumQuestion | null {
  const assembled = assembleFourChoiceMcq(
    String(input.correct),
    uniqueNum(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'extremum',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ext-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'extremum',
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

/** 和定相等型：最小化最大值 */
function minMaxEqual(total: number, n: number): number {
  return Math.ceil(total / n)
}

/** 和定不等型：最小化最大值（互不相同正整数，尽量连续） */
function minMaxUnequal(total: number, n: number): number | null {
  // 以 avg 附近连续 n 个数，和为 n*mid 型，再把差额加到最大项
  // 标准做法：取连续 n 个使和 ≤ total 且尽量接近，最大项再吸收差额
  const avg = total / n
  let start = Math.max(1, Math.floor(avg - (n - 1) / 2))
  for (let t = 0; t < 20; t++) {
    const arr: number[] = []
    for (let i = 0; i < n; i++) arr.push(start + i)
    const sum = arr.reduce((a, b) => a + b, 0)
    if (sum === total) return arr[n - 1]!
    if (sum < total) {
      const rem = total - sum
      return arr[n - 1]! + rem
    }
    start--
    if (start < 1) return null
  }
  return null
}

// ——— 简单 ———

function genEasyWorstBall(seq: number): ExtremumQuestion | null {
  // 经典真题 2
  const black = pickOne([8, 10, 12])
  const white = pickOne([5, 6, 7])
  const red = pickOne([3, 4, 5])
  const worst = black + red
  const ans = worst + 1
  return buildQuestion({
    difficulty: 'easy',
    term: '最不利原则取球（经典真题 2）',
    passage: `袋中有黑球 ${black} 个、白球 ${white} 个、红球 ${red} 个。`,
    stem: '至少取出多少个球才能保证有白球？',
    correct: ans,
    distractors: [worst, ans + 1, black + white, red + 1],
    method: [
      '最不利原则：保证数 = 最不利数 + 1。',
      `① 最不利：先拿光所有非白球 = ${black}+${red}=${worst}。`,
      `② 再拿 1 个必为白球：${worst}+1=${ans}。`,
    ].join('\n'),
    explanation: `至少取出 ${ans} 个。`,
    seq,
  })
}

function genEasySumEqual(seq: number): ExtremumQuestion | null {
  // 示例 1
  const total = pickOne([21, 23, 26, 30])
  const n = pickOne([5, 4, 6])
  const ans = minMaxEqual(total, n)
  return buildQuestion({
    difficulty: 'easy',
    term: '和定相等型（示例 1）',
    passage: `把 ${total} 朵花分给 ${n} 个人（人数可以为相同）。`,
    stem: '分得最多的人至少分到多少朵？',
    correct: ans,
    distractors: [Math.floor(total / n), ans + 1, total - n + 1, ans - 1].filter((x) => x > 0),
    method: [
      '和定最值·相等型：要使「最多的人」尽量少，应尽量分得均匀。',
      `${total}÷${n}=${Math.floor(total / n)}……${total % n}，余数再分给最多的人。`,
      `故最少的「最大份」= ${Math.floor(total / n)}+${total % n > 0 ? 1 : 0} = ${ans}（即向上取整）。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genEasySumUnequal(seq: number): ExtremumQuestion | null {
  // 示例 2：21 朵 5 人互不相同 → 7
  for (let i = 0; i < 30; i++) {
    const total = pickOne([21, 25, 28, 30])
    const n = pickOne([5, 4, 6])
    const ans = minMaxUnequal(total, n)
    if (ans == null || ans < n) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '和定不等型（示例 2）',
      passage: `把 ${total} 朵花分给 ${n} 个人，且每人分得朵数互不相同。`,
      stem: '分得最多的人至少分到多少朵？',
      correct: ans,
      distractors: [minMaxEqual(total, n), ans + 1, ans - 1, total - (n * (n - 1)) / 2],
      method: [
        '和定最值·不等型：人数互不相同，尽量取连续整数再微调。',
        `先取尽量靠近平均数的连续 ${n} 个数，和不足部分补给最大项。`,
        `可得最大项至少为 ${ans}。`,
      ].join('\n'),
      explanation: `答案 ${ans}。`,
      seq,
    })
  }
  return null
}

function genEasyWorstSocks(seq: number): ExtremumQuestion | null {
  const colors = pickOne([3, 4, 5])
  // 保证至少一双同色：最不利每种 1 只，再 +1
  const ans = colors + 1
  return buildQuestion({
    difficulty: 'easy',
    term: '最不利保证同色一双',
    passage: `抽屉里有 ${colors} 种颜色的袜子，每种足够多。`,
    stem: '至少取出多少只才能保证有一双同色袜子？',
    correct: ans,
    distractors: [colors, 2 * colors, colors + 2, 2],
    method: [
      `最不利：${colors} 种颜色各取 1 只，仍无同色双。`,
      `再取 1 只必与某色成双：保证数=${colors}+1=${ans}。`,
    ].join('\n'),
    explanation: `至少 ${ans} 只。`,
    seq,
  })
}

function genEasyQuadSimple(seq: number): ExtremumQuestion | null {
  // 比真题 1 简单：直接给 (p-ax)(q+bx) 求对称轴
  const p = pickOne([20, 24, 30])
  const q = pickOne([8, 10, 12])
  const a = pickOne([2, 4, 5])
  const b = pickOne([1, 2])
  // y=(p-a x)(q+b x)=0 => x=p/a or x=-q/b
  const m = p / a
  const n = -q / b
  if (!Number.isInteger(m)) return null
  const xStar = (m + n) / 2
  if (!Number.isInteger(xStar) || xStar < 1) return null
  const maxY = (p - a * xStar) * (q + b * xStar)
  return buildQuestion({
    difficulty: 'easy',
    term: '二次对称轴求最值',
    passage: `日利润 y=(${p}−${a}x)(${q}+${b}x)，其中 x 为非负整数（表示降价次数）。`,
    stem: '日利润最大时，x 取多少？',
    correct: xStar,
    distractors: [m, Math.floor(m / 2), xStar + 1, 0],
    method: [
      '因式型二次：y=a(x−m)(x−n) 型，极值在对称轴 x=(m+n)/2。',
      `令 y=0 得 x=${m} 或 x=${n}，故 x=(${m}+${n})/2=${xStar}。`,
    ].join('\n'),
    explanation: `此时最大日利润为 ${maxY}（本题问 x）。`,
    seq,
  })
}

function genEasySumMaxOne(seq: number): ExtremumQuestion | null {
  const total = pickOne([20, 24, 30, 35])
  const n = pickOne([4, 5, 6])
  if (n >= total) return null
  const ans = total - (n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '和定最大化某一份（下限 1）',
    passage: `把 ${total} 本书分给 ${n} 人，每人至少 1 本。`,
    stem: '其中一人最多能分到多少本？',
    correct: ans,
    distractors: [total - n, Math.floor(total / n), ans - 1, total],
    method: [
      '其余人尽量少拿：各取下限 1 本。',
      `其余 ${n - 1} 人共 ${n - 1} 本，该人最多 ${total}−${n - 1}=${ans}。`,
    ].join('\n'),
    explanation: `最多 ${ans} 本。`,
    seq,
  })
}

// ——— 普通 ———

function genMediumProfitClassic1(seq: number): ExtremumQuestion | null {
  // 经典真题 1 结构
  for (let i = 0; i < 40; i++) {
    const cost = pickOne([500, 600, 650])
    const price = pickOne([800, 850, 900])
    const sales0 = pickOne([10, 12, 15])
    const cut = pickOne([20, 25, 30])
    const salesUp = pickOne([2, 3, 4])
    const unit0 = price - cost
    if (unit0 <= 0 || unit0 % cut !== 0) continue
    // y = (unit0 - cut*x)(sales0 + salesUp*x)
    const m = unit0 / cut // root when unit=0
    const n = -sales0 / salesUp
    if (!Number.isInteger(n)) continue
    const xStar = (m + n) / 2
    if (!Number.isInteger(xStar) || xStar < 1) continue
    const profit0 = unit0 * sales0
    const profitMax = (unit0 - cut * xStar) * (sales0 + salesUp * xStar)
    const ans = profitMax - profit0
    if (ans <= 0 || ans > 5000) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '二次利润最值（经典真题 1）',
      passage: `某商品成本 ${cost} 元，售价 ${price} 元，日销 ${sales0} 件。每降价 ${cut} 元，日销量增加 ${salesUp} 件。`,
      stem: '当日利润最大时，比原来日利润增加多少元？',
      correct: ans,
      distractors: [profitMax, profit0, ans + cut * salesUp, Math.abs(ans - 50)],
      method: [
        `原单件利润 ${unit0}，原日利润 ${profit0}。`,
        `设降价 ${cut} 元共 x 次，日利润 y=(${unit0}−${cut}x)(${sales0}+${salesUp}x)。`,
        `令 y=0 得 x=${m} 或 x=${n}，对称轴 x=(${m}+${n})/2=${xStar}。`,
        `最大日利润=${profitMax}，增加 ${profitMax}−${profit0}=${ans}。`,
      ].join('\n'),
      explanation: `增加 ${ans} 元。`,
      seq,
    })
  }
  return null
}

function genMediumConstraintClassic3(seq: number): ExtremumQuestion | null {
  // 经典真题 3 简化/变体：总量、楼层最少、部门最少 → 最大化某一部门
  for (let i = 0; i < 40; i++) {
    const floors = 3
    const depts = pickOne([8, 10, 12])
    const floorMin = pickOne([80, 100, 120])
    const deptMin = pickOne([10, 15, 20])
    const total = pickOne([300, 335, 360, 400])
    if (floors * floorMin > total) continue
    // Method 2: other floors take floorMin each, remaining depts share those floors with deptMin ok
    // Target alone on one floor: other floors = (floors-1)*floorMin, target = total - that
    const otherFloors = (floors - 1) * floorMin
    const otherDepts = depts - 1
    if (otherFloors / otherDepts < deptMin) continue
    const ans = total - otherFloors
    if (ans < floorMin || ans < deptMin) continue
    if (ans > total - (depts - 1) * deptMin) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '约束分配最大化（经典真题 3）',
      passage: `共有杂志 ${total} 本，发给 ${floors} 个楼层共 ${depts} 个部门。每个楼层至少 ${floorMin} 本，每个部门至少 ${deptMin} 本。`,
      stem: '发得最多的那个部门最多能发多少本？',
      correct: ans,
      distractors: [
        total - depts * deptMin,
        total - floors * floorMin + floorMin,
        ans - 10,
        floorMin + (total - floors * floorMin),
      ],
      method: [
        '要最大化某一部门：让它所在楼层尽量「独享」剩余，其他楼层只给下限。',
        `① 其余 ${floors - 1} 个楼层各给下限 ${floorMin}，共 ${otherFloors} 本。`,
        `② 这 ${otherFloors} 本分给其余 ${otherDepts} 个部门，人均 ${otherFloors}/${otherDepts}≥${deptMin}，可行。`,
        `③ 目标部门最多 = ${total}−${otherFloors}=${ans}。`,
      ].join('\n'),
      explanation: `最多 ${ans} 本。`,
      seq,
    })
  }
  return null
}

function genMediumWorstGuaranteeTwo(seq: number): ExtremumQuestion | null {
  const white = pickOne([5, 6, 7])
  const b = pickOne([4, 5, 6])
  const c = pickOne([3, 4, 5])
  const others = b + c
  // 保证至少 2 个白球：最不利 = 非白全部 + 1 个白，再 +1
  const ans = others + 1 + 1
  return buildQuestion({
    difficulty: 'medium',
    term: '最不利保证两个',
    passage: `袋中白球 ${white} 个、黑球 ${b} 个、红球 ${c} 个。`,
    stem: '至少取出多少个才能保证有 2 个白球？',
    correct: ans,
    distractors: [others + 1, others + 2 + 1, white + 2, ans - 1],
    method: [
      `保证 2 个白球：最不利 = 拿光非白(${others}) + 只拿到 1 个白，共 ${others}+1。`,
      `再拿 1 个必再得白球：${others}+1+1=${ans}。`,
    ].join('\n'),
    explanation: `至少 ${ans} 个。`,
    seq,
  })
}

function genMediumSumMaxOne(seq: number): ExtremumQuestion | null {
  const total = pickOne([50, 60, 80])
  const n = pickOne([5, 6, 8])
  const minEach = pickOne([3, 4, 5])
  if (n * minEach >= total) return null
  const ans = total - (n - 1) * minEach
  return buildQuestion({
    difficulty: 'medium',
    term: '和定最大化某一份',
    passage: `把 ${total} 本书分给 ${n} 人，每人至少 ${minEach} 本。`,
    stem: '其中一人最多能分到多少本？',
    correct: ans,
    distractors: [total - n * minEach, ans - minEach, Math.floor(total / n), ans + 1],
    method: [
      '其余人尽量少拿（取下限）：',
      `其余 ${n - 1} 人各 ${minEach} 本，共 ${(n - 1) * minEach}。`,
      `该人最多 = ${total}−${(n - 1) * minEach}=${ans}。`,
    ].join('\n'),
    explanation: `最多 ${ans} 本。`,
    seq,
  })
}

function genMediumQuadAskProfit(seq: number): ExtremumQuestion | null {
  // Ask max profit value not the increase
  for (let i = 0; i < 30; i++) {
    const unit0 = pickOne([100, 120, 150, 200])
    const sales0 = pickOne([8, 10, 12])
    const cut = pickOne([10, 20, 25])
    const salesUp = pickOne([2, 3])
    if (unit0 % cut !== 0) continue
    const m = unit0 / cut
    const nRoot = -sales0 / salesUp
    if (!Number.isInteger(nRoot)) continue
    const xStar = (m + nRoot) / 2
    if (!Number.isInteger(xStar) || xStar < 1) continue
    const ans = (unit0 - cut * xStar) * (sales0 + salesUp * xStar)
    if (ans <= 0) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '二次利润求最大值',
      passage: `单件现利润 ${unit0} 元，日销 ${sales0} 件。每降价 ${cut} 元，日销量增 ${salesUp} 件。`,
      stem: '日利润最大可达多少元？',
      correct: ans,
      distractors: [unit0 * sales0, ans + cut, (unit0 - cut) * (sales0 + salesUp), ans - 50],
      method: [
        `y=(${unit0}−${cut}x)(${sales0}+${salesUp}x)，零点 x=${m}、${nRoot}。`,
        `x=(${m}+${nRoot})/2=${xStar}，代入得最大利润 ${ans}。`,
      ].join('\n'),
      explanation: `最大日利润 ${ans} 元。`,
      seq,
    })
  }
  return null
}

function genMediumSumUnequal(seq: number): ExtremumQuestion | null {
  for (let i = 0; i < 30; i++) {
    const total = pickOne([36, 40, 45, 52])
    const n = pickOne([5, 6, 7])
    const ans = minMaxUnequal(total, n)
    if (ans == null || ans < n) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '和定不等型（加强）',
      passage: `把 ${total} 个名额分给 ${n} 个组，各组名额互不相同。`,
      stem: '名额最多的组至少分到多少个？',
      correct: ans,
      distractors: [minMaxEqual(total, n), ans + 1, ans - 1, total - ((n * (n - 1)) / 2)],
      method: [
        '不等型：尽量取连续整数，差额补给最大项。',
        `可得「最大组」至少为 ${ans}。`,
      ].join('\n'),
      explanation: `至少 ${ans} 个。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardQuadProfitPlus(seq: number): ExtremumQuestion | null {
  for (let i = 0; i < 40; i++) {
    const cost = pickOne([400, 500, 700])
    const price = pickOne([700, 800, 1000])
    const sales0 = pickOne([20, 24, 30])
    const cut = pickOne([20, 25, 40])
    const salesUp = pickOne([4, 5, 6])
    const unit0 = price - cost
    if (unit0 <= cut || unit0 % cut !== 0) continue
    const m = unit0 / cut
    const nRoot = -sales0 / salesUp
    if (!Number.isInteger(nRoot)) continue
    const xStar = (m + nRoot) / 2
    if (!Number.isInteger(xStar) || xStar < 2) continue
    const profit0 = unit0 * sales0
    const profitMax = (unit0 - cut * xStar) * (sales0 + salesUp * xStar)
    const ans = profitMax - profit0
    if (ans < 100) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '二次利润加强',
      hardTypeId: 'quad-profit-plus',
      passage: `成本 ${cost} 元，售价 ${price} 元，日销 ${sales0} 件。每降价 ${cut} 元，日销量增加 ${salesUp} 件。`,
      stem: '日利润最大时比原来增加多少元？',
      correct: ans,
      distractors: [profitMax, profit0, ans + cut * sales0, Math.round(ans * 1.1)],
      method: [
        `y=(${unit0}−${cut}x)(${sales0}+${salesUp}x)，对称轴 x=(${m}+${nRoot})/2=${xStar}。`,
        `最大利润 ${profitMax}，原利润 ${profit0}，增加 ${ans}。`,
      ].join('\n'),
      explanation: `增加 ${ans} 元。`,
      seq,
    })
  }
  return null
}

function genHardQuadVertex(seq: number): ExtremumQuestion | null {
  // Expand to ax^2+bx+c and use -b/2a
  // y = (p - a x)(q + b x) = -a b x^2 + (p b - a q)x + p q
  const p = pickOne([40, 50, 60])
  const q = pickOne([6, 8, 10])
  const a = pickOne([5, 8, 10])
  const b = pickOne([2, 4])
  const A = -a * b
  const B = p * b - a * q
  const xStar = -B / (2 * A)
  if (!Number.isInteger(xStar) || xStar < 1) return null
  const ans = (p - a * xStar) * (q + b * xStar)
  return buildQuestion({
    difficulty: 'hard',
    term: '顶点公式 −b/2a',
    hardTypeId: 'quad-vertex-formula',
    passage: `函数 y=(${p}−${a}x)(${q}+${b}x)（x 为非负实数）。`,
    stem: 'y 的最大值是多少？',
    correct: ans,
    distractors: [p * q, ans + a, Math.round((-B * B) / (4 * A) + p * q), xStar],
    method: [
      `展开：y=${A}x²+${B}x+${p * q}。`,
      `顶点横坐标 x=−b/(2a)=−(${B})/(2×${A})=${xStar}。`,
      `代入得 y_max=${ans}。`,
    ].join('\n'),
    explanation: `最大值为 ${ans}。`,
    seq,
  })
}

function genHardWorstMulti(seq: number): ExtremumQuestion | null {
  const types = pickOne([4, 5])
  const each = pickOne([6, 8, 10])
  // 保证某一指定颜色至少 1：最不利 = 其他颜色全拿完 +1
  const others = (types - 1) * each
  const ans = others + 1
  return buildQuestion({
    difficulty: 'hard',
    term: '最不利多色加强',
    hardTypeId: 'worst-multi-color',
    passage: `盒中有 ${types} 种颜色的球，每种各 ${each} 个。`,
    stem: '至少取出多少个才能保证一定有红色球？（红色是其中一种）',
    correct: ans,
    distractors: [types * each, others, each + 1, ans + each],
    method: [
      `最不利：先取光其余 ${types - 1} 种 = ${others} 个，仍无红球。`,
      `再取 1 个必为红：${others}+1=${ans}。`,
    ].join('\n'),
    explanation: `至少 ${ans} 个。`,
    seq,
  })
}

function genHardWorstPair(seq: number): ExtremumQuestion | null {
  // 保证至少一双同色：n 色，最不利 n 只各异色 +1
  const colors = pickOne([6, 7, 8])
  const ans = colors + 1
  return buildQuestion({
    difficulty: 'hard',
    term: '保证同色配对加强',
    hardTypeId: 'worst-pair-guarantee',
    passage: `有 ${colors} 种颜色手套，每种左右手都很多。每次随机摸一只（不分左右，只看颜色成双）。`,
    stem: '至少摸多少只才能保证有一双同色？',
    correct: ans,
    distractors: [2 * colors, colors, colors + 2, 2],
    method: `最不利每种颜色各 1 只共 ${colors} 只；再摸 1 只必成同色双：${colors}+1=${ans}。`,
    explanation: `至少 ${ans} 只。`,
    seq,
  })
}

function genHardSumEqual(seq: number): ExtremumQuestion | null {
  const total = pickOne([100, 120, 150, 200])
  const n = pickOne([7, 8, 9, 11])
  const ans = minMaxEqual(total, n)
  return buildQuestion({
    difficulty: 'hard',
    term: '和定相等型加强',
    hardTypeId: 'sum-equal-min-max',
    passage: `${total} 个名额分给 ${n} 个组（各组人数可以相同）。`,
    stem: '名额最多的组至少分到多少个？',
    correct: ans,
    distractors: [Math.floor(total / n), ans + 1, total - n + 1, ans - 1],
    method: `相等型尽量均匀：向上取整 ⌈${total}/${n}⌉=${ans}。`,
    explanation: `至少 ${ans} 个。`,
    seq,
  })
}

function genHardSumUnequal(seq: number): ExtremumQuestion | null {
  for (let i = 0; i < 30; i++) {
    const total = pickOne([45, 55, 66, 78])
    const n = pickOne([6, 7, 8])
    const ans = minMaxUnequal(total, n)
    if (ans == null || ans < n) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '和定不等型加强',
      hardTypeId: 'sum-unequal-min-max',
      passage: `把 ${total} 个座位分给 ${n} 个班，各班座位数互不相同。`,
      stem: '座位数最多的班至少有多少个座位？',
      correct: ans,
      distractors: [minMaxEqual(total, n), ans + 1, ans - 1, n + Math.floor(total / n)],
      method: [
        '不等型：取尽量靠近平均的连续正整数，差额补给最大项。',
        `可得最大班至少 ${ans} 个座位。`,
      ].join('\n'),
      explanation: `至少 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardSumMaxOne(seq: number): ExtremumQuestion | null {
  const total = pickOne([200, 250, 300])
  const n = pickOne([10, 12, 15])
  const minEach = pickOne([5, 8, 10])
  if ((n - 1) * minEach >= total) return null
  const ans = total - (n - 1) * minEach
  return buildQuestion({
    difficulty: 'hard',
    term: '最大化某一项加强',
    hardTypeId: 'sum-max-one-min-others',
    passage: `${total} 件奖品分给 ${n} 人，每人至少 ${minEach} 件。`,
    stem: '其中一人最多能拿多少件？',
    correct: ans,
    distractors: [total - n * minEach, ans - minEach, Math.floor(total / 2), ans + minEach],
    method: `其余 ${n - 1} 人各取下限 ${minEach}，该人最多 ${total}−${(n - 1) * minEach}=${ans}。`,
    explanation: `最多 ${ans} 件。`,
    seq,
  })
}

function genHardConstraintFloor(seq: number): ExtremumQuestion | null {
  for (let i = 0; i < 40; i++) {
    const floors = pickOne([3, 4])
    const depts = pickOne([10, 12, 15])
    const floorMin = pickOne([90, 100, 120])
    const deptMin = pickOne([12, 15, 18])
    const total = pickOne([400, 450, 500, 520])
    if (floors * floorMin > total) continue
    const otherFloors = (floors - 1) * floorMin
    const otherDepts = depts - 1
    if (otherFloors / otherDepts < deptMin) continue
    const ans = total - otherFloors
    if (ans < Math.max(floorMin, deptMin)) continue
    // also check target floor alone is ok
    return buildQuestion({
      difficulty: 'hard',
      term: '楼层部门双约束加强',
      hardTypeId: 'constraint-floor-dept',
      passage: `共 ${total} 本资料，发到 ${floors} 个楼层共 ${depts} 个科室。每楼层至少 ${floorMin} 本，每科室至少 ${deptMin} 本。`,
      stem: '发得最多的科室最多能发多少本？',
      correct: ans,
      distractors: [
        total - (depts - 1) * deptMin,
        total - floors * floorMin + floorMin,
        ans - 15,
        floorMin + total - floors * floorMin,
      ],
      method: [
        `其余 ${floors - 1} 楼层各给 ${floorMin}，共 ${otherFloors}；分给其余 ${otherDepts} 科室仍 ≥${deptMin}。`,
        `目标科室最多 = ${total}−${otherFloors}=${ans}。`,
      ].join('\n'),
      explanation: `最多 ${ans} 本。`,
      seq,
    })
  }
  return null
}

function genHardQuadAskX(seq: number): ExtremumQuestion | null {
  const p = pickOne([30, 40, 50, 80])
  const q = pickOne([10, 12, 16])
  const a = pickOne([4, 5, 8])
  const b = pickOne([2, 4])
  const m = p / a
  const n = -q / b
  if (!Number.isInteger(m) || !Number.isInteger(n)) return null
  const xStar = (m + n) / 2
  if (!Number.isInteger(xStar) || xStar < 1) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '二次最值问自变量',
    hardTypeId: 'quad-ask-x',
    passage: `日销量相关利润 y=(${p}−${a}x)(${q}+${b}x)，x 为降价档次数。`,
    stem: '利润最大时，降价档次数 x 是多少？',
    correct: xStar,
    distractors: [m, Math.abs(n), xStar + 1, 0],
    method: `零点 x=${m}、${n}，对称轴 x=(${m}+${n})/2=${xStar}。`,
    explanation: `x=${xStar}。`,
    seq,
  })
}

function genHardMixed(seq: number): ExtremumQuestion | null {
  const total = pickOne([40, 50, 60])
  const n = pickOne([5, 6])
  // 互不相同且每人至少 1，最大化最大者：其余取 1,2,...,n-1
  const minSumOthers = ((n - 1) * n) / 2
  if (minSumOthers >= total) return null
  const ans = total - minSumOthers
  return buildQuestion({
    difficulty: 'hard',
    term: '不等约束下最大化一项',
    hardTypeId: 'mixed-worst-and-sum',
    passage: `把 ${total} 个苹果分给 ${n} 人，每人至少一个且人数互不相同。`,
    stem: '其中一人最多能分到多少个？',
    correct: ans,
    distractors: [total - (n - 1), ans - 1, minMaxUnequal(total, n) ?? ans + 2, ans + n],
    method: [
      '要最大化某人：其余人取尽可能小的互异正整数 1,2,…,n−1。',
      `其余共 ${minSumOthers}，该人最多 ${total}−${minSumOthers}=${ans}。`,
    ].join('\n'),
    explanation: `最多 ${ans} 个。`,
    seq,
  })
}

const HARD_BUILDERS: Record<ExtremumHardTypeId, (seq: number) => ExtremumQuestion | null> = {
  'quad-profit-plus': genHardQuadProfitPlus,
  'quad-vertex-formula': genHardQuadVertex,
  'worst-multi-color': genHardWorstMulti,
  'worst-pair-guarantee': genHardWorstPair,
  'sum-equal-min-max': genHardSumEqual,
  'sum-unequal-min-max': genHardSumUnequal,
  'sum-max-one-min-others': genHardSumMaxOne,
  'constraint-floor-dept': genHardConstraintFloor,
  'quad-ask-x': genHardQuadAskX,
  'mixed-worst-and-sum': genHardMixed,
}

function tryBuild(
  factory: () => ExtremumQuestion | null,
  maxTry = 40,
): ExtremumQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type ExtremumFactory = {
  key: string
  build: (seq: number) => ExtremumQuestion | null
}

export function generateExtremumPaper(difficulty: ExtremumDifficulty): ExtremumQuestion[] {
  const out: ExtremumQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: ExtremumQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: ExtremumFactory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= EXTREMUM_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < EXTREMUM_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'worst-ball', build: genEasyWorstBall },
      { key: 'sum-equal', build: genEasySumEqual },
      { key: 'sum-unequal', build: genEasySumUnequal },
      { key: 'worst-socks', build: genEasyWorstSocks },
      { key: 'quad-simple', build: genEasyQuadSimple },
      { key: 'sum-max-one', build: genEasySumMaxOne },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'profit-classic1', build: genMediumProfitClassic1 },
      { key: 'constraint-classic3', build: genMediumConstraintClassic3 },
      { key: 'worst-two', build: genMediumWorstGuaranteeTwo },
      { key: 'sum-max-one', build: genMediumSumMaxOne },
      { key: 'quad-max-profit', build: genMediumQuadAskProfit },
      { key: 'sum-unequal', build: genMediumSumUnequal },
    ])
  } else {
    const used = new Set<ExtremumHardTypeId>()
    const types = shuffleInPlace([...EXTREMUM_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= EXTREMUM_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = EXTREMUM_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < EXTREMUM_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : EXTREMUM_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, EXTREMUM_QUESTION_COUNT)
}
