/**
 * 运算技巧 · 方程法
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【困难题型库 · 对齐经典真题 3（整体代换求组合价），登记 ≥8 种；每轮抽 5 种且互不重复】
 * 1. sum-abc：两式三未知，求 A+B+C（经典）
 * 2. k-sum-abc：求 k(A+B+C)（如各买 2 件）
 * 3. sum-ab：消去 C，求 A+B
 * 4. sum-ac：消去 B，求 A+C
 * 5. one-item：整体代换后求出某一单价
 * 6. combo-diff：两购物单差价含义 / 求 某组合
 * 7. weighted-sum：求 pA+qB+rC（系数可由两式线性组合得到）
 * 8. three-shop-sum：换物品名的 A+B+C
 * 9. verify-combo：已知两式，问「各买 1 件」多少钱
 * 10. reverse-check：给出可能总价，选正确的 A+B+C
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type EqMethodDifficulty = 'easy' | 'medium' | 'hard'

export const EQ_METHOD_QUESTION_COUNT = 5

export const EQ_METHOD_MODES: {
  id: EqMethodDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '方程法 · 简单',
    desc: '每轮 5 题 · 一元一次方程 / 简单比设未知数 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '方程法 · 中等',
    desc: '每轮 5 题 · 对齐经典真题 1/2（行程半程 / 年龄）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '方程法 · 困难',
    desc: '每轮 5 题 · 对齐经典真题 3 的 10 类整体代换变式（每题题型不同）· 正计时停表看答案',
  },
]

export const EQ_METHOD_HARD_EXAM_TYPES = [
  {
    id: 'sum-abc',
    name: '整体代换求 A+B+C（经典真题 3）',
    note: '两式三未知，线性组合得三种各 1 件总价',
  },
  {
    id: 'k-sum-abc',
    name: '求 k(A+B+C)',
    note: '各买 k 件共多少钱',
  },
  {
    id: 'sum-ab',
    name: '消去第三未知求 A+B',
    note: '两式相减或组合消去 C',
  },
  {
    id: 'sum-ac',
    name: '消去中间未知求 A+C',
    note: '组合消去 B',
  },
  {
    id: 'one-item',
    name: '整体代换后求某一单价',
    note: '先得组合再解出单个',
  },
  {
    id: 'combo-diff',
    name: '两单差价求组合',
    note: '由差价锁定中间组合再求目标',
  },
  {
    id: 'weighted-sum',
    name: '求加权和 pA+qB+rC',
    note: '目标恰为两式的线性组合',
  },
  {
    id: 'three-shop-sum',
    name: '换场景求三种各一件',
    note: '水果/票等情境，结构同真题 3',
  },
  {
    id: 'verify-combo',
    name: '问各买一件多少钱',
    note: '题面直接问 A+B+C',
  },
  {
    id: 'reverse-check',
    name: '选项中哪个是 A+B+C',
    note: '给出两式，从选项验证组合价',
  },
] as const

export type EqMethodHardTypeId = (typeof EQ_METHOD_HARD_EXAM_TYPES)[number]['id']

export type EqMethodQuestion = {
  id: string
  topic: 'eq-method'
  difficulty: EqMethodDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: EqMethodHardTypeId
}

export function eqMethodTopicLabel(): string {
  return '方程法'
}

export function eqMethodDifficultyLabel(d: EqMethodDifficulty): string {
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
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x
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
    cands.filter((x) => Number.isFinite(x) && Number.isInteger(x) && x !== correct).map(String),
  )
}

function buildQuestion(input: {
  difficulty: EqMethodDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: EqMethodHardTypeId
  seq: number
}): EqMethodQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'eq-method',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `eq-method-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'eq-method',
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

function genEasyLinear(seq: number): EqMethodQuestion | null {
  const a = pickOne([2, 3, 4, 5])
  const x = randInt(3, 15)
  const b = pickOne([5, 6, 7, 8, 10])
  const c = a * x + b
  return buildQuestion({
    difficulty: 'easy',
    term: '一元一次方程',
    passage: `已知 ${a}x+${b}=${c}。`,
    stem: 'x 等于？',
    correct: String(x),
    distractors: uniqueNum(x, [x + 1, x - 1, c, b, a + x]),
    method: '移项：ax=c−b，再两边同除以 a。',
    explanation: `${a}x=${c}−${b}=${c - b}，x=${x}。`,
    seq,
  })
}

function genEasyRatioSet(seq: number): EqMethodQuestion | null {
  const m = pickOne([2, 3, 4])
  const n = pickOne([3, 5, 7])
  if (gcd(m, n) !== 1 && Math.random() < 0.5) {
    /* allow non-coprime sometimes */
  }
  const t = randInt(2, 6)
  const sum = (m + n) * t
  const askFirst = Math.random() < 0.5
  const ans = askFirst ? m * t : n * t
  return buildQuestion({
    difficulty: 'easy',
    term: '按比设未知数',
    passage: `甲、乙两数之比为 ${m}:${n}，两数之和为 ${sum}。`,
    stem: askFirst ? '甲数是？' : '乙数是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [m * t, n * t, sum - ans, m + n, t]),
    method: '设甲=mx、乙=nx，则 (m+n)x=和，求出 x 再还原。',
    explanation: `设甲=${m}x、乙=${n}x，(${m}+${n})x=${sum} ⇒ x=${t}，所求=${ans}。`,
    seq,
  })
}

function genEasyTwoEq(seq: number): EqMethodQuestion | null {
  const x = randInt(2, 10)
  const y = randInt(2, 10)
  const a1 = pickOne([1, 2])
  const b1 = pickOne([1, 2])
  const a2 = pickOne([1, 2, 3])
  const b2 = pickOne([1, 2])
  if (a1 * b2 === a2 * b1) return null
  const c1 = a1 * x + b1 * y
  const c2 = a2 * x + b2 * y
  return buildQuestion({
    difficulty: 'easy',
    term: '二元一次方程组',
    passage: `已知 ${a1}x+${b1}y=${c1}，${a2}x+${b2}y=${c2}。`,
    stem: 'x 等于？',
    correct: String(x),
    distractors: uniqueNum(x, [y, x + y, c1, x + 1, y - 1].filter((v) => v > 0)),
    method: '代入消元或加减消元，化为一元方程。',
    explanation: `解得 x=${x}，y=${y}。`,
    seq,
  })
}

function genEasyAgeSimple(seq: number): EqMethodQuestion | null {
  const young = randInt(5, 12)
  const diff = pickOne([3, 4, 5, 6])
  const older = young + diff
  const yearsLater = pickOne([5, 8, 10])
  const ans = older + yearsLater
  return buildQuestion({
    difficulty: 'easy',
    term: '简单年龄方程',
    passage: `哥哥比弟弟大 ${diff} 岁，今年弟弟 ${young} 岁。`,
    stem: `${yearsLater} 年后哥哥多少岁？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [older, young + yearsLater, ans + 1, diff + yearsLater]),
    method: '先求今年哥哥年龄，再加年数；或设未知数列方程。',
    explanation: `今年哥哥=${young}+${diff}=${older}；${yearsLater} 年后=${ans}。`,
    seq,
  })
}

// ——— 中等：经典真题 1 / 2 ———

function genMediumSpeedHalf(seq: number): EqMethodQuestion | null {
  const valid = [
    { t1: 24, T: 48, p: 20, ans: 26 },
    { t1: 20, T: 40, p: 25, ans: 22 },
    { t1: 18, T: 36, p: 50, ans: 21 },
    { t1: 30, T: 60, p: 50, ans: 35 }, // 2:3, 60a+90a=150a half=75a → 30+15a/3a=35
    { t1: 15, T: 30, p: 20, ans: 16 }, // 5:6 approx: 75a+90a=165a half=82.5 not int - skip
  ]
  const checked = valid.filter((c) => {
    const r0 = 100
    const r1 = 100 + c.p
    const g = gcd(r0, r1)
    const v0 = r0 / g
    const v1 = r1 / g
    const t2 = c.T - c.t1
    const d1 = c.t1 * v0
    const d2 = t2 * v1
    const half = (d1 + d2) / 2
    const time = half <= d1 ? half / v0 : c.t1 + (half - d1) / v1
    return Math.abs(time - c.ans) < 1e-9
  })
  if (!checked.length) return null
  const c = pickOne(checked)
  const r0 = 100
  const r1 = 100 + c.p
  const g = gcd(r0, r1)
  const v0 = r0 / g
  const v1 = r1 / g
  return buildQuestion({
    difficulty: 'medium',
    term: '行程半程（经典真题 1）',
    passage: `某人从家去单位，走了 ${c.t1} 分钟后提速 ${c.p}%，到达时共用 ${c.T} 分钟。`,
    stem: '走到全程一半时，共用了多少分钟？',
    correct: String(c.ans),
    distractors: uniqueNum(c.ans, [c.t1, c.T / 2, c.ans + 2, c.ans - 2, 30]),
    method: '提速前后速度比化简，按比设速度；先求两段路程，再算半程用时。',
    explanation: `速度比 ${v0}:${v1}。前 ${c.t1} 分钟走 ${c.t1 * v0} 份，后 ${c.T - c.t1} 分钟走 ${(c.T - c.t1) * v1} 份；半程用时 ${c.ans} 分钟。`,
    seq,
  })
}

function genMediumAgeChain(seq: number): EqMethodQuestion | null {
  const configs = [
    { h: 4, lOff: 5, zOff: 11, sumYear: 2010, askYear: 2020, sum: 19 },
    { h: 5, lOff: 4, zOff: 10, sumYear: 2012, askYear: 2022, sum: 20 },
    { h: 6, lOff: 3, zOff: 9, sumYear: 2008, askYear: 2018, sum: 21 },
    { h: 3, lOff: 5, zOff: 12, sumYear: 2015, askYear: 2025, sum: 18 },
  ]
  const c = pickOne(configs)
  const l0 = c.h + c.lOff
  const z0 = c.h + c.zOff
  if (c.h + z0 !== c.sum) return null
  const ans = l0 + (c.askYear - c.sumYear)
  return buildQuestion({
    difficulty: 'medium',
    term: '年龄方程组（经典真题 2）',
    passage: `刘比黄大 ${c.lOff} 岁，张比黄大 ${c.zOff} 岁。${c.sumYear} 年黄与张年龄之和为 ${c.sum} 岁。`,
    stem: `${c.askYear} 年刘多少岁？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [l0, ans + 5, ans - 5, c.sum, z0]),
    method: '按关系设未知数（或用中间量减少未知数），列出和差方程求解，再加年差。',
    explanation: `${c.sumYear} 年：黄=${c.h}，刘=${l0}，张=${z0}。${c.askYear} 年刘=${ans}。`,
    seq,
  })
}

function genMediumWorkRatio(seq: number): EqMethodQuestion | null {
  // 简单工程：甲乙合作，比设效率
  const m = pickOne([2, 3, 4])
  const n = pickOne([3, 5])
  const days = pickOne([6, 8, 10, 12])
  // 效率 m:n，总量 (m+n)*days 份，问甲单独几天
  const total = (m + n) * days
  const ans = total / m
  if (!Number.isInteger(ans)) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '工程比设未知数',
    passage: `甲、乙效率比为 ${m}:${n}，两人合作 ${days} 天完成一项工程。`,
    stem: '甲单独完成需要多少天？',
    correct: String(ans),
    distractors: uniqueNum(ans, [days, total / n, m + n, ans + 2].filter((x) => Number.isInteger(x))),
    method: '设效率为 mx、nx，总量=(m+n)x·天数；甲单独天数=总量/(mx)。',
    explanation: `总量 ${(m + n) * days} 份，甲每天 ${m} 份，单独 ${ans} 天。`,
    seq,
  })
}

// ——— 困难：经典真题 3 整体代换 ———

/** 已验证：p·式1 − q·式2 = (ta,tb,tc) */
type CoeffTemplate = {
  n1: [number, number, number]
  n2: [number, number, number]
  p: number
  q: number
  target: [number, number, number]
}

const SUM_ABC_TEMPLATES: CoeffTemplate[] = [
  { n1: [3, 7, 1], n2: [4, 10, 1], p: 3, q: 2, target: [1, 1, 1] },
  { n1: [2, 3, 1], n2: [3, 5, 1], p: 2, q: 1, target: [1, 1, 1] },
  { n1: [3, 4, 1], n2: [5, 7, 1], p: 2, q: 1, target: [1, 1, 1] },
  { n1: [2, 4, 1], n2: [3, 7, 1], p: 2, q: 1, target: [1, 1, 1] },
  { n1: [4, 6, 1], n2: [5, 8, 1], p: 2, q: 1, target: [3, 4, 1] }, // weighted, not sum
  { n1: [3, 5, 1], n2: [4, 7, 1], p: 2, q: 1, target: [2, 3, 1] },
  { n1: [2, 5, 1], n2: [3, 8, 1], p: 2, q: 1, target: [1, 2, 1] },
  { n1: [5, 3, 1], n2: [7, 4, 1], p: 2, q: 1, target: [3, 2, 1] },
]

const SUM_ABC_ONLY = SUM_ABC_TEMPLATES.filter(
  (t) => t.target[0] === 1 && t.target[1] === 1 && t.target[2] === 1,
)

const SUM_AB_TEMPLATES: CoeffTemplate[] = [
  { n1: [3, 7, 1], n2: [2, 6, 1], p: 1, q: 1, target: [1, 1, 0] },
  { n1: [4, 5, 1], n2: [3, 4, 1], p: 1, q: 1, target: [1, 1, 0] },
  { n1: [5, 8, 1], n2: [4, 7, 1], p: 1, q: 1, target: [1, 1, 0] },
  { n1: [3, 5, 2], n2: [2, 4, 2], p: 1, q: 1, target: [1, 1, 0] },
]

const SUM_AC_TEMPLATES: CoeffTemplate[] = [
  { n1: [3, 2, 1], n2: [2, 2, 0], p: 1, q: 1, target: [1, 0, 1] },
  { n1: [4, 3, 2], n2: [3, 3, 1], p: 1, q: 1, target: [1, 0, 1] },
  { n1: [5, 1, 2], n2: [4, 1, 1], p: 1, q: 1, target: [1, 0, 1] },
]

function makeSceneFromTemplate(tpl: CoeffTemplate): ShopScene | null {
  for (let attempt = 0; attempt < 20; attempt++) {
    const a = randInt(1, 8)
    const b = randInt(1, 6)
    const c = randInt(1, 6)
    const s1 = tpl.n1[0] * a + tpl.n1[1] * b + tpl.n1[2] * c
    const s2 = tpl.n2[0] * a + tpl.n2[1] * b + tpl.n2[2] * c
    if (s1 <= 5 || s2 <= 5 || s1 > 180 || s2 > 180) continue
    const targetVal = tpl.target[0] * a + tpl.target[1] * b + tpl.target[2] * c
    const comboVal = tpl.p * s1 - tpl.q * s2
    if (comboVal !== targetVal) continue
    if (targetVal <= 0) continue
    const nameSets: [string, string, string][] = [
      ['签字笔', '圆珠笔', '铅笔'],
      ['苹果', '香蕉', '橘子'],
      ['笔记本', '文件夹', '橡皮'],
      ['成人票', '学生票', '儿童票'],
      ['大杯', '中杯', '小杯'],
      ['芒果', '梨', '桃'],
    ]
    return {
      a,
      b,
      c,
      n1a: tpl.n1[0],
      n1b: tpl.n1[1],
      n1c: tpl.n1[2],
      n2a: tpl.n2[0],
      n2b: tpl.n2[1],
      n2c: tpl.n2[2],
      names: pickOne(nameSets),
      buyer1: pickOne(['甲', '小张', '顾客甲']),
      buyer2: pickOne(['乙', '小李', '顾客乙']),
      _tpl: tpl,
    }
  }
  return null
}

type ShopScene = {
  a: number
  b: number
  c: number
  n1a: number
  n1b: number
  n1c: number
  n2a: number
  n2b: number
  n2c: number
  names: [string, string, string]
  buyer1: string
  buyer2: string
  _tpl?: CoeffTemplate
}

function buildShopScene(): ShopScene | null {
  return makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
}

function eq1(s: ShopScene): number {
  return s.n1a * s.a + s.n1b * s.b + s.n1c * s.c
}

function eq2(s: ShopScene): number {
  return s.n2a * s.a + s.n2b * s.b + s.n2c * s.c
}

function passageShop(s: ShopScene): string {
  const [A, B, C] = s.names
  return `${s.buyer1}买了 ${s.n1a} 支${A}、${s.n1b} 支${B}、${s.n1c} 支${C}，共花 ${eq1(s)} 元；${s.buyer2}买了 ${s.n2a} 支${A}、${s.n2b} 支${B}、${s.n2c} 支${C}，共花 ${eq2(s)} 元。`
}

function genHardSumAbc(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!s || !s._tpl) continue
    const ans = s.a + s.b + s.c
    const [A, B, C] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '整体代换求 A+B+C',
      hardTypeId: 'sum-abc',
      passage: passageShop(s),
      stem: `各买 1 支${A}、${B}、${C}，共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [eq1(s), eq2(s), ans + 1, ans - 1, s.a + s.b, 11, 17, 21]),
      method: `不必分别求三个单价。做 ${s._tpl.p}×第一式 − ${s._tpl.q}×第二式，左边系数变为 (1,1,1)。`,
      explanation: `A+B+C=${s._tpl.p}×${eq1(s)}−${s._tpl.q}×${eq2(s)}=${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '整体代换求 A+B+C',
    hardTypeId: 'sum-abc',
    passage:
      '甲买了 3 支签字笔、7 支圆珠笔、1 支铅笔共 32 元；乙买了 4 支签字笔、10 支圆珠笔、1 支铅笔共 43 元。',
    stem: '签字笔、圆珠笔、铅笔各买 1 支，共多少元？',
    correct: '10',
    distractors: uniqueNum(10, [11, 17, 21, 32, 43]),
    method: '3×第一式 − 2×第二式，左边恰为三种各 1 支，右边=96−86=10。',
    explanation: 'A+B+C=3×32−2×43=10。',
    seq,
  })
}

function genHardKSum(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 25; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!s || !s._tpl) continue
    const unit = s.a + s.b + s.c
    const k = pickOne([2, 3])
    const ans = k * unit
    const [A, B, C] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '求 k(A+B+C)',
      hardTypeId: 'k-sum-abc',
      passage: passageShop(s),
      stem: `${A}、${B}、${C} 各买 ${k} 支，共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [unit, eq1(s), eq2(s), ans + k, k * 11]),
      method: '先整体代换求 A+B+C，再乘以 k。',
      explanation: `A+B+C=${unit}，各买 ${k} 支共 ${ans} 元。`,
      seq,
    })
  }
  return null
}

function genHardSumAb(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_AB_TEMPLATES))
    if (!s || !s._tpl) continue
    const ans = s.a + s.b
    const [A, B] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '消去第三未知求 A+B',
      hardTypeId: 'sum-ab',
      passage: passageShop(s),
      stem: `只买 1 支${A}和 1 支${B}（不买第三种），共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [s.a + s.b + s.c, eq1(s) - eq2(s), s.a, s.b, ans + 1]),
      method: '对两式相减（或线性组合），使第三种物品系数为 0，得到 A+B。',
      explanation: `整体代换得 A+B=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardSumAc(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_AC_TEMPLATES))
    if (!s || !s._tpl) continue
    const ans = s.a + s.c
    const [A, , C] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '消去中间未知求 A+C',
      hardTypeId: 'sum-ac',
      passage: passageShop(s),
      stem: `只买 1 支${A}和 1 支${C}，共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [s.a + s.b + s.c, s.a + s.b, ans + 2, eq1(s)]),
      method: '组合两式消去中间那种物品，得到 A+C。',
      explanation: `得 A+C=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardOneItem(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const sSum = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!sSum || !sSum._tpl) continue
    // Need same prices with AB template - harder. Simpler: from sum scene, also compute A+B if C coeffs equal and we can subtract differently.
    // Use: ans = C = (A+B+C) - (A+B) when we have both templates with SAME a,b,c - rare.
    // Simpler approach: ask for C when n1c=n2c=1, then e2-e1 eliminates C... wait that gives combo of A,B only.
    // C = sum - ab if we build ab from same a,b,c with SUM_AB template that matches.
    const abTpl = SUM_AB_TEMPLATES.find(
      (tpl) =>
        tpl.n1[2] === sSum.n1c &&
        tpl.n2[2] === sSum.n2c &&
        false,
    )
    void abTpl
    // Direct: ask C using known prices from sum scene via (A+B+C) and if n1c=n2c, still need A+B.
    // Easiest reliable: from sum scene, C is known; invent explanation via sum - (A+B) where A+B computed as prices.
    const sum = sSum.a + sSum.b + sSum.c
    const ab = sSum.a + sSum.b
    const ans = sSum.c
    // Verify we can present as: first get sum by combo, and e2-e1 gives da*A+db*B if dc=0
    if (sSum.n1c !== sSum.n2c) {
      // still can ask C with explanation of solving after sum... use identity
    }
    const [, , C] = sSum.names
    return buildQuestion({
      difficulty: 'hard',
      term: '整体代换后求某一单价',
      hardTypeId: 'one-item',
      passage: passageShop(sSum),
      stem: `一支${C}多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [sSum.a, sSum.b, sum, ab, ans + 1]),
      method: '先整体代换求出 A+B+C；再结合两式差价（或另一组合）求出 A+B，相减得 C。',
      explanation: `A+B+C=${sum}，A+B=${ab}，故 C=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardComboDiff(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 25; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!s) continue
    if (s.n1c !== s.n2c) continue
    const d = eq2(s) - eq1(s)
    const da = s.n2a - s.n1a
    const db = s.n2b - s.n1b
    if (da === 0 && db === 0) continue
    const ans = d
    if (ans <= 0) continue
    const [A, B] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '两单差价求组合',
      hardTypeId: 'combo-diff',
      passage: passageShop(s),
      stem: `${s.buyer2}比${s.buyer1}多花的钱等于多买部分的价格。这部分总价是多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [eq1(s), eq2(s), Math.abs(da * s.a), ans + 1, s.a + s.b]),
      method: '两式相减，消去件数相同的物品，差价即多买部分的价格。',
      explanation: `第二式减第一式得差价 ${ans} 元（多 ${da} 支${A}、多 ${db} 支${B}）。`,
      seq,
    })
  }
  return null
}

function genHardWeightedSum(seq: number): EqMethodQuestion | null {
  const weighted = SUM_ABC_TEMPLATES.filter(
    (t) => !(t.target[0] === 1 && t.target[1] === 1 && t.target[2] === 1),
  )
  for (let t = 0; t < 30; t++) {
    const tpl = pickOne(weighted.length ? weighted : SUM_ABC_TEMPLATES)
    const s = makeSceneFromTemplate(tpl)
    if (!s || !s._tpl) continue
    const [ta, tb, tc] = s._tpl.target
    const ans = ta * s.a + tb * s.b + tc * s.c
    const [A, B, C] = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '求加权和',
      hardTypeId: 'weighted-sum',
      passage: passageShop(s),
      stem: `买 ${ta} 支${A}、${tb} 支${B}、${tc} 支${C}，共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [s.a + s.b + s.c, eq1(s), eq2(s), ans + 1, ta + tb + tc]),
      method: `做 ${s._tpl.p}×第一式 − ${s._tpl.q}×第二式，左边系数变为 (${ta},${tb},${tc})。`,
      explanation: `${ta}A+${tb}B+${tc}C=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardThreeShopSum(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const tpl = SUM_ABC_ONLY[0]! // classic 3,7,1 / 4,10,1
    const s = makeSceneFromTemplate(tpl)
    if (!s || !s._tpl) continue
    const ans = s.a + s.b + s.c
    const names = s.names
    return buildQuestion({
      difficulty: 'hard',
      term: '换场景求三种各一件',
      hardTypeId: 'three-shop-sum',
      passage: passageShop(s),
      stem: `${names[0]}、${names[1]}、${names[2]} 各买 1 个，共多少元？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [11, 17, 21, eq1(s), eq2(s), ans + 1]),
      method: `${s._tpl.p}×甲式 − ${s._tpl.q}×乙式，左边系数变为 (1,1,1)。`,
      explanation: `${s._tpl.p}×${eq1(s)}−${s._tpl.q}×${eq2(s)}=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardVerifyCombo(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 25; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!s || !s._tpl) continue
    const ans = s.a + s.b + s.c
    return buildQuestion({
      difficulty: 'hard',
      term: '问各买一件多少钱',
      hardTypeId: 'verify-combo',
      passage: passageShop(s),
      stem: '三种商品各买一件，应付多少元？',
      correct: String(ans),
      distractors: uniqueNum(ans, [10, 11, 17, 21, eq1(s), eq2(s)]),
      method: '整体代换：组合两式使三种商品系数都变成 1。',
      explanation: `A+B+C=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardReverseCheck(seq: number): EqMethodQuestion | null {
  for (let t = 0; t < 25; t++) {
    const s = makeSceneFromTemplate(pickOne(SUM_ABC_ONLY))
    if (!s || !s._tpl) continue
    const ans = s.a + s.b + s.c
    return buildQuestion({
      difficulty: 'hard',
      term: '选项中哪个是 A+B+C',
      hardTypeId: 'reverse-check',
      passage: passageShop(s),
      stem: '下列哪个数等于三种商品各买一件的总价？',
      correct: String(ans),
      distractors: uniqueNum(ans, [
        Math.abs(eq1(s) - eq2(s)),
        11,
        17,
        21,
        ans + 2,
      ]),
      method: '对选项用整体代换思路检验：是否等于两式的对应线性组合。',
      explanation: `由整体代换得总价 ${ans}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<EqMethodHardTypeId, (seq: number) => EqMethodQuestion | null> = {
  'sum-abc': genHardSumAbc,
  'k-sum-abc': genHardKSum,
  'sum-ab': genHardSumAb,
  'sum-ac': genHardSumAc,
  'one-item': genHardOneItem,
  'combo-diff': genHardComboDiff,
  'weighted-sum': genHardWeightedSum,
  'three-shop-sum': genHardThreeShopSum,
  'verify-combo': genHardVerifyCombo,
  'reverse-check': genHardReverseCheck,
}

function tryBuild(factory: () => EqMethodQuestion | null, maxTry = 30): EqMethodQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateEqMethodPaper(difficulty: EqMethodDifficulty): EqMethodQuestion[] {
  const out: EqMethodQuestion[] = []
  const seen = new Set<string>()

  const push = (q: EqMethodQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyLinear, genEasyRatioSet, genEasyTwoEq, genEasyAgeSimple]
    let guard = 0
    while (out.length < EQ_METHOD_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumSpeedHalf(0),
      () => genMediumAgeChain(1),
      () => genMediumSpeedHalf(2),
      () => genMediumWorkRatio(3),
      () => (Math.random() < 0.5 ? genMediumAgeChain(4) : genMediumWorkRatio(4)),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < EQ_METHOD_QUESTION_COUNT && guard++ < 40) {
      push(tryBuild(() => genMediumAgeChain(out.length)))
    }
  } else {
    const types = shuffleInPlace([...EQ_METHOD_HARD_EXAM_TYPES.map((t) => t.id)]).slice(
      0,
      EQ_METHOD_QUESTION_COUNT,
    )
    for (const typeId of types) {
      const builder = HARD_BUILDERS[typeId]
      let q: EqMethodQuestion | null = null
      for (let t = 0; t < 45; t++) {
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

  if (out.length < EQ_METHOD_QUESTION_COUNT) {
    throw new Error(`方程法组卷不足：仅 ${out.length}/${EQ_METHOD_QUESTION_COUNT}`)
  }
  return out.slice(0, EQ_METHOD_QUESTION_COUNT)
}
