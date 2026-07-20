/**
 * 高频运算 · 几何问题
 * 豆包出题干/选项/解析；图形为本地结构化 SVG（项目无文生图 API）。
 * 每轮 10 题，覆盖教材平面/立体基本公式。
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type GeometryDifficulty = 'easy' | 'medium' | 'hard'

export const GEOMETRY_QUESTION_COUNT = 10

export const GEOMETRY_MODES: {
  id: GeometryDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '几何问题 · 简单',
    desc: '每轮 10 题 · 直接套基本公式 · 略低于经典真题 · 豆包出题+几何图 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '几何问题 · 普通',
    desc: '每轮 10 题 · 对齐经典真题 1（割补）/真题 2（长方体变正方体）· 豆包出题+几何图 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '几何问题 · 困难',
    desc: '每轮 10 题 · 高于经典真题：组合割补/勾股/多步立体 · 豆包出题+几何图 · 正计时停表看答案',
  },
]

/** 教材表中的公式考点（出题库全覆盖） */
export const GEOMETRY_FORMULA_CATALOG = [
  { id: 'tri-c', shape: 'triangle', name: '三角形周长', formula: 'C=a+b+c' },
  { id: 'tri-s', shape: 'triangle', name: '三角形面积', formula: 'S=½ah' },
  { id: 'sq-c', shape: 'square', name: '正方形周长', formula: 'C=4a' },
  { id: 'sq-s', shape: 'square', name: '正方形面积', formula: 'S=a²' },
  { id: 'rect-c', shape: 'rectangle', name: '长方形周长', formula: 'C=2(a+b)' },
  { id: 'rect-s', shape: 'rectangle', name: '长方形面积', formula: 'S=ab' },
  { id: 'trap-c', shape: 'trapezoid', name: '梯形周长', formula: 'C=a+b+c+d' },
  { id: 'trap-s', shape: 'trapezoid', name: '梯形面积', formula: 'S=½(a+b)h' },
  { id: 'cir-c', shape: 'circle', name: '圆周长', formula: 'C=2πr=πd' },
  { id: 'cir-s', shape: 'circle', name: '圆面积', formula: 'S=πr²' },
  { id: 'cube-s', shape: 'cube', name: '正方体表面积', formula: 'S=6a²' },
  { id: 'cube-v', shape: 'cube', name: '正方体体积', formula: 'V=a³' },
  { id: 'box-s', shape: 'cuboid', name: '长方体表面积', formula: 'S=2(ab+bc+ac)' },
  { id: 'box-v', shape: 'cuboid', name: '长方体体积', formula: 'V=abc' },
  { id: 'sph-s', shape: 'sphere', name: '球表面积', formula: 'S=4πr²' },
  { id: 'sph-v', shape: 'sphere', name: '球体积', formula: 'V=⁴⁄₃πr³' },
  { id: 'cyl-s', shape: 'cylinder', name: '圆柱表面积', formula: 'S=2πr²+2πrh' },
  { id: 'cyl-v', shape: 'cylinder', name: '圆柱体积', formula: 'V=πr²h' },
  { id: 'cone-v', shape: 'cone', name: '圆锥体积', formula: 'V=⅓πr²h' },
  { id: 'cut-fill', shape: 'cut-fill', name: '割补求阴影', formula: '割补法' },
  { id: 'box-change', shape: 'box-change', name: '长方体变正方体', formula: '表面积差→棱长' },
  { id: 'pythagorean', shape: 'right-triangle', name: '勾股定理', formula: 'a²+b²=c²' },
] as const

export type GeometryFormulaId = (typeof GEOMETRY_FORMULA_CATALOG)[number]['id']

export type GeometryFigureKind =
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'trapezoid'
  | 'circle'
  | 'cube'
  | 'cuboid'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'cut-fill'
  | 'box-change'
  | 'right-triangle'
  | 'similar-a'
  | 'similar-x'
  | 'similar-measure'
  | 'cube-paint-net'

export type GeometryFigureSpec = {
  kind: GeometryFigureKind
  /** 标注用数字/文字 */
  labels: Record<string, string>
  /** 可选：阴影/高亮描述 */
  note?: string
}

export type GeometrySeed = {
  formulaId: GeometryFormulaId
  kind: GeometryFigureKind
  term: string
  figure: GeometryFigureSpec
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  /** 给豆包的锚定说明 */
  anchorHint: string
}

export type GeometryQuestion = {
  id: string
  topic: 'geometry'
  difficulty: GeometryDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  formulaId: GeometryFormulaId
  figure: GeometryFigureSpec
}

export function geometryTopicLabel(): string {
  return '几何问题'
}

export function geometryDifficultyLabel(d: GeometryDifficulty): string {
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
    if (!Number.isFinite(c)) continue
    const s = Number.isInteger(c) ? String(c) : String(Math.round(c * 10) / 10)
    if (seen.has(s) || s === String(correct)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3) {
    const s = String(correct + g)
    if (!seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
    g++
  }
  return out
}

function fmtPi(n: number): string {
  if (Number.isInteger(n)) return `${n}π`
  return `${n}π`
}

export function buildGeometryQuestionFromSeed(
  seed: GeometrySeed,
  difficulty: GeometryDifficulty,
  seq: number,
  overrides?: Partial<Pick<GeometrySeed, 'passage' | 'stem' | 'method' | 'explanation' | 'term'>>,
): GeometryQuestion | null {
  const assembled = assembleFourChoiceMcq(
    seed.correct.trim(),
    seed.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const passage = (overrides?.passage ?? seed.passage).trim()
  const stem = (overrides?.stem ?? seed.stem).trim()
  const fingerprint = [
    'geometry',
    difficulty,
    seed.formulaId,
    stem,
    passage,
    [...assembled.options].sort().join('|'),
  ].join('\u001e')
  return {
    id: `geometry-${difficulty}-${seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'geometry',
    difficulty,
    term: (overrides?.term ?? seed.term).trim(),
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: (overrides?.method ?? seed.method).trim(),
    explanation: (overrides?.explanation ?? seed.explanation).trim(),
    fingerprint,
    formulaId: seed.formulaId,
    figure: seed.figure,
  }
}

// ——— Seeds ———

function seedTriangle(easy: boolean): GeometrySeed {
  const a = pickOne([6, 8, 10, 12])
  const h = pickOne([4, 5, 6, 8])
  // 周长题：保证能构成三角形，且边长差明显便于成图
  let b = a + pickOne([1, 2, 3])
  let c = pickOne([a - 1, a, a + 1].filter((x) => x >= 3))
  // 三角不等式微调
  if (b + c <= a) c = a - b + 2
  if (a + c <= b) b = a + c - 1
  if (a + b <= c) c = a + b - 1
  const askArea = Math.random() < 0.55
  if (askArea) {
    const correct = (a * h) / 2
    return {
      formulaId: 'tri-s',
      kind: 'triangle',
      term: '三角形面积',
      figure: { kind: 'triangle', labels: { a: String(a), h: String(h) } },
      passage: `如图，三角形底边长 ${a}，高为 ${h}。`,
      stem: easy ? '该三角形的面积是多少？' : '求图中三角形的面积。',
      correct: String(correct),
      distractors: uniqueNum(correct, [a * h, a + h, correct * 2, a * h + 2]),
      method: '认准「底」与「对应高」，面积 S=½×底×高。',
      explanation: `已知底边 a=${a}，对应高 h=${h}。\n代入公式：S=½×底×高=½×${a}×${h}=${correct}。`,
      anchorHint: `底=${a}，高=${h}，面积必须=${correct}；用公式 S=1/2·a·h。`,
    }
  }
  const peri = a + b + c
  return {
    formulaId: 'tri-c',
    kind: 'triangle',
    term: '三角形周长',
    figure: { kind: 'triangle', labels: { a: String(a), b: String(b), c: String(c) } },
    passage: `如图，三角形三边长分别为 ${a}、${b}、${c}。`,
    stem: '该三角形的周长是多少？',
    correct: String(peri),
    distractors: uniqueNum(peri, [a + b, peri + 2, a * b, peri - c]),
    method: '周长等于三边之和：C=a+b+c。',
    explanation: `把三边相加即可。\nC=${a}+${b}+${c}=${peri}。`,
    anchorHint: `三边 ${a},${b},${c}，周长必须=${peri}。`,
  }
}

function seedSquare(): GeometrySeed {
  const a = pickOne([4, 5, 6, 8, 10])
  const askArea = Math.random() < 0.5
  if (askArea) {
    const correct = a * a
    return {
      formulaId: 'sq-s',
      kind: 'square',
      term: '正方形面积',
      figure: { kind: 'square', labels: { a: String(a) } },
      passage: `如图，正方形边长为 ${a}。`,
      stem: '该正方形的面积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [4 * a, a * 2, correct + a, a * a + 4]),
      method: '正方形面积 S=a²（边长的平方）。',
      explanation: `边长 a=${a}。\nS=a²=${a}×${a}=${correct}。\n注意不要与周长 4a 混淆。`,
      anchorHint: `边长 ${a}，面积=${correct}。`,
    }
  }
  const correct = 4 * a
  return {
    formulaId: 'sq-c',
    kind: 'square',
    term: '正方形周长',
    figure: { kind: 'square', labels: { a: String(a) } },
    passage: `如图，正方形边长为 ${a}。`,
    stem: '该正方形的周长是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [a * a, 2 * a, correct + 4, a * 3]),
    method: '正方形四边相等，周长 C=4a。',
    explanation: `边长 a=${a}。\nC=4×${a}=${correct}。\n注意不要与面积 a² 混淆。`,
    anchorHint: `边长 ${a}，周长=${correct}。`,
  }
}

function seedRectangle(): GeometrySeed {
  const a = pickOne([8, 10, 12, 15])
  const b = pickOne([4, 5, 6, 7])
  const askArea = Math.random() < 0.5
  if (askArea) {
    const correct = a * b
    return {
      formulaId: 'rect-s',
      kind: 'rectangle',
      term: '长方形面积',
      figure: { kind: 'rectangle', labels: { a: String(a), b: String(b) } },
      passage: `如图，长方形长 ${a}、宽 ${b}。`,
      stem: '面积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [2 * (a + b), a + b, a * b + a, (a + b) * 2]),
      method: '长方形面积 S=长×宽=ab。',
      explanation: `长 a=${a}，宽 b=${b}。\nS=ab=${a}×${b}=${correct}。\n若误用周长公式 2(a+b)，会得到 ${2 * (a + b)}，可排除。`,
      anchorHint: `长${a}宽${b}，面积=${correct}。`,
    }
  }
  const correct = 2 * (a + b)
  return {
    formulaId: 'rect-c',
    kind: 'rectangle',
    term: '长方形周长',
    figure: { kind: 'rectangle', labels: { a: String(a), b: String(b) } },
    passage: `如图，长方形长 ${a}、宽 ${b}。`,
    stem: '周长是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [a * b, a + b, 2 * a + b, correct + 2]),
    method: '长方形周长 C=2(a+b)=2×(长+宽)。',
    explanation: `长 a=${a}，宽 b=${b}。\n先算长+宽：${a}+${b}=${a + b}。\n再×2：C=2×${a + b}=${correct}。`,
    anchorHint: `长${a}宽${b}，周长=${correct}。`,
  }
}

function seedTrapezoid(): GeometrySeed {
  const a = pickOne([4, 5, 6])
  const b = pickOne([10, 12, 14])
  const h = pickOne([4, 5, 6, 8])
  const c = pickOne([5, 6, 7])
  const d = pickOne([5, 6, 8])
  const askArea = Math.random() < 0.65
  if (askArea) {
    const correct = ((a + b) * h) / 2
    return {
      formulaId: 'trap-s',
      kind: 'trapezoid',
      term: '梯形面积',
      figure: { kind: 'trapezoid', labels: { a: String(a), b: String(b), h: String(h) } },
      passage: `如图，梯形上底 ${a}、下底 ${b}、高 ${h}。`,
      stem: '梯形面积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [(a + b) * h, a * b, correct + h, (b - a) * h]),
      method: '梯形面积 S=½×(上底+下底)×高。',
      explanation: `上底 a=${a}，下底 b=${b}，高 h=${h}。\n先算两底之和：${a}+${b}=${a + b}。\n再代入：S=½×${a + b}×${h}=${correct}。`,
      anchorHint: `上底${a}下底${b}高${h}，面积=${correct}。`,
    }
  }
  const correct = a + b + c + d
  return {
    formulaId: 'trap-c',
    kind: 'trapezoid',
    term: '梯形周长',
    figure: {
      kind: 'trapezoid',
      labels: { a: String(a), b: String(b), c: String(c), d: String(d) },
    },
    passage: `如图，梯形四边长分别为 ${a}、${b}、${c}、${d}。`,
    stem: '周长是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [a + b, correct - d, (a + b) * 2]),
    method: '梯形周长等于四边之和：C=a+b+c+d。',
    explanation: `把四条边全部相加。\nC=${a}+${b}+${c}+${d}=${correct}。\n求周长时不需要高。`,
    anchorHint: `四边之和=${correct}。`,
  }
}

function seedCircle(): GeometrySeed {
  const r = pickOne([3, 4, 5, 6, 7])
  const askArea = Math.random() < 0.5
  if (askArea) {
    const coef = r * r
    return {
      formulaId: 'cir-s',
      kind: 'circle',
      term: '圆面积',
      figure: { kind: 'circle', labels: { r: String(r) } },
      passage: `如图，圆的半径为 ${r}（结果用 π 表示）。`,
      stem: '圆的面积是多少？',
      correct: fmtPi(coef),
      distractors: [fmtPi(2 * r), fmtPi(r), fmtPi(coef * 2)].filter((x) => x !== fmtPi(coef)).slice(0, 3),
      method: '圆面积 S=πr²。',
      explanation: `半径 r=${r}。\n先算 r²=${r}×${r}=${coef}。\n再乘 π：S=π×${coef}=${fmtPi(coef)}。\n结果保留 π，不必再乘近似值。`,
      anchorHint: `半径${r}，面积=${fmtPi(coef)}（必须带π）。`,
    }
  }
  const coef = 2 * r
  return {
    formulaId: 'cir-c',
    kind: 'circle',
    term: '圆周长',
    figure: { kind: 'circle', labels: { r: String(r), d: String(2 * r) } },
    passage: `如图，圆的半径为 ${r}（结果用 π 表示）。`,
    stem: '圆的周长是多少？',
    correct: fmtPi(coef),
    distractors: [fmtPi(r), fmtPi(r * r), fmtPi(coef + 2)].slice(0, 3),
    method: '圆周长 C=2πr（也等于 πd，d 为直径）。',
    explanation: `半径 r=${r}，直径 d=2r=${2 * r}。\nC=2πr=2π×${r}=${fmtPi(coef)}。\n也可写成 C=πd=π×${2 * r}=${fmtPi(coef)}。`,
    anchorHint: `半径${r}，周长=${fmtPi(coef)}。`,
  }
}

function seedCube(): GeometrySeed {
  const a = pickOne([3, 4, 5, 6])
  const askV = Math.random() < 0.5
  if (askV) {
    const correct = a * a * a
    return {
      formulaId: 'cube-v',
      kind: 'cube',
      term: '正方体体积',
      figure: { kind: 'cube', labels: { a: String(a) } },
      passage: `如图，正方体棱长为 ${a}。`,
      stem: '体积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [6 * a * a, a * a, correct + a, 4 * a * a]),
      method: '正方体体积 V=a³（棱长的立方）。',
      explanation: `棱长 a=${a}。\nV=a³=${a}×${a}×${a}=${correct}。\n不要与表面积 6a²=${6 * a * a} 混淆。`,
      anchorHint: `棱长${a}，体积=${correct}。`,
    }
  }
  const correct = 6 * a * a
  return {
    formulaId: 'cube-s',
    kind: 'cube',
    term: '正方体表面积',
    figure: { kind: 'cube', labels: { a: String(a) } },
    passage: `如图，正方体棱长为 ${a}。`,
    stem: '表面积是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [a * a * a, 4 * a * a, correct + 6, a * a]),
    method: '正方体有 6 个全等正方形面，表面积 S=6a²。',
    explanation: `棱长 a=${a}，一个面面积 a²=${a * a}。\n共 6 个面：S=6×${a * a}=${correct}。`,
    anchorHint: `棱长${a}，表面积=${correct}。`,
  }
}

function seedCuboid(): GeometrySeed {
  const a = pickOne([4, 5, 6, 8])
  const b = pickOne([3, 4, 5])
  const c = pickOne([2, 3, 4, 6])
  const askV = Math.random() < 0.5
  if (askV) {
    const correct = a * b * c
    return {
      formulaId: 'box-v',
      kind: 'cuboid',
      term: '长方体体积',
      figure: { kind: 'cuboid', labels: { a: String(a), b: String(b), c: String(c) } },
      passage: `如图，长方体长 ${a}、宽 ${b}、高 ${c}。`,
      stem: '体积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [2 * (a * b + b * c + a * c), a * b, correct + a]),
      method: '长方体体积 V=长×宽×高=abc。',
      explanation: `长 a=${a}，宽 b=${b}，高 c=${c}。\nV=abc=${a}×${b}×${c}=${correct}。`,
      anchorHint: `长宽高 ${a},${b},${c}，体积=${correct}。`,
    }
  }
  const correct = 2 * (a * b + b * c + a * c)
  return {
    formulaId: 'box-s',
    kind: 'cuboid',
    term: '长方体表面积',
    figure: { kind: 'cuboid', labels: { a: String(a), b: String(b), c: String(c) } },
    passage: `如图，长方体长 ${a}、宽 ${b}、高 ${c}。`,
    stem: '表面积是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [a * b * c, a * b + b * c + a * c, correct / 2]),
    method: '长方体表面积 S=2(ab+bc+ac)，即三组对面面积之和再×2。',
    explanation: `长宽 ab=${a}×${b}=${a * b}；宽高 bc=${b}×${c}=${b * c}；长高 ac=${a}×${c}=${a * c}。\n三组面积和=${a * b}+${b * c}+${a * c}=${a * b + b * c + a * c}。\nS=2×${a * b + b * c + a * c}=${correct}。`,
    anchorHint: `表面积必须=${correct}。`,
  }
}

function seedSphere(): GeometrySeed {
  const r = pickOne([3, 4, 5, 6])
  const askV = Math.random() < 0.45
  if (askV) {
    const num = 4 * r * r * r
    const correct = num % 3 === 0 ? fmtPi(num / 3) : `(${num}/3)π`
    return {
      formulaId: 'sph-v',
      kind: 'sphere',
      term: '球体积',
      figure: { kind: 'sphere', labels: { r: String(r) } },
      passage: `如图，球的半径为 ${r}（结果用 π 表示）。`,
      stem: '球的体积是多少？',
      correct,
      distractors: [fmtPi(4 * r * r), fmtPi(r * r * r), fmtPi(2 * r * r)].slice(0, 3),
      method: '球体积 V=⁴⁄₃πr³。',
      explanation: `半径 r=${r}。\n先算 r³=${r}×${r}×${r}=${r * r * r}。\n再代入：V=⁴⁄₃π×${r * r * r}=${correct}。\n结果保留 π。`,
      anchorHint: `半径${r}，体积=${correct}。`,
    }
  }
  const coef = 4 * r * r
  return {
    formulaId: 'sph-s',
    kind: 'sphere',
    term: '球表面积',
    figure: { kind: 'sphere', labels: { r: String(r) } },
    passage: `如图，球的半径为 ${r}（结果用 π 表示）。`,
    stem: '球的表面积是多少？',
    correct: fmtPi(coef),
    distractors: [fmtPi(2 * r * r), fmtPi(r * r), fmtPi(coef / 2)].slice(0, 3),
    method: '球表面积 S=4πr²。',
    explanation: `半径 r=${r}。\nr²=${r * r}。\nS=4π×${r * r}=${fmtPi(coef)}。\n不要与体积公式 ⁴⁄₃πr³ 混淆。`,
    anchorHint: `半径${r}，表面积=${fmtPi(coef)}。`,
  }
}

function seedCylinder(): GeometrySeed {
  const r = pickOne([2, 3, 4, 5])
  const h = pickOne([4, 5, 6, 8, 10])
  const askV = Math.random() < 0.5
  if (askV) {
    const coef = r * r * h
    return {
      formulaId: 'cyl-v',
      kind: 'cylinder',
      term: '圆柱体积',
      figure: { kind: 'cylinder', labels: { r: String(r), h: String(h) } },
      passage: `如图，圆柱底面半径 ${r}、高 ${h}（结果用 π 表示）。`,
      stem: '体积是多少？',
      correct: fmtPi(coef),
      distractors: [fmtPi(2 * r * h), fmtPi(r * r), fmtPi(coef + r)].slice(0, 3),
      method: '圆柱体积 V=底面积×高=πr²h。',
      explanation: `底面半径 r=${r}，高 h=${h}。\n底面积 πr²=π×${r * r}。\nV=πr²h=π×${r * r}×${h}=${fmtPi(coef)}。`,
      anchorHint: `r=${r},h=${h}，体积=${fmtPi(coef)}。`,
    }
  }
  const coef = 2 * r * (r + h)
  const twoBase = 2 * r * r
  const side = 2 * r * h
  return {
    formulaId: 'cyl-s',
    kind: 'cylinder',
    term: '圆柱表面积',
    figure: { kind: 'cylinder', labels: { r: String(r), h: String(h) } },
    passage: `如图，圆柱底面半径 ${r}、高 ${h}（结果用 π 表示）。`,
    stem: '表面积是多少？',
    correct: fmtPi(coef),
    distractors: [fmtPi(r * r * h), fmtPi(2 * r * h), fmtPi(2 * r * r)].slice(0, 3),
    method: '圆柱表面积=两个底面圆面积+侧面展开长方形面积，即 S=2πr²+2πrh。',
    explanation: `底面半径 r=${r}，高 h=${h}。\n两个底面：2πr²=2π×${r * r}=${fmtPi(twoBase)}。\n侧面（展开为长方形）：2πrh=2π×${r}×${h}=${fmtPi(side)}。\n合计：S=${fmtPi(twoBase)}+${fmtPi(side)}=${fmtPi(coef)}。`,
    anchorHint: `表面积=${fmtPi(coef)}。`,
  }
}

function seedCone(): GeometrySeed {
  const r = pickOne([3, 4, 5, 6])
  const h = pickOne([3, 6, 9, 12])
  const num = r * r * h
  const correct = num % 3 === 0 ? fmtPi(num / 3) : `(${num}/3)π`
  return {
    formulaId: 'cone-v',
    kind: 'cone',
    term: '圆锥体积',
    figure: { kind: 'cone', labels: { r: String(r), h: String(h) } },
    passage: `如图，圆锥底面半径 ${r}、高 ${h}（结果用 π 表示）。`,
    stem: '体积是多少？',
    correct,
    distractors: [fmtPi(r * r * h), fmtPi((r * r * h) / 2), fmtPi(2 * r * h)].slice(0, 3),
    method: '圆锥体积 V=⅓πr²h（是「同底同高圆柱体积」的三分之一）。',
    explanation: `底面半径 r=${r}，高 h=${h}。\n若先算同底同高圆柱体积：πr²h=π×${r * r}×${h}=${fmtPi(num)}。\n圆锥体积为其 1/3：V=⅓×${fmtPi(num)}=${correct}。`,
    anchorHint: `圆锥体积=${correct}（公式 V=1/3 π r² h）。`,
  }
}

/** 经典真题 1：两正方形割补阴影 */
function seedCutFill(harder: boolean): GeometrySeed {
  const big = harder ? pickOne([9, 10, 12]) : pickOne([6, 8, 10])
  const small = harder ? pickOne([4, 5, 6]) : pickOne([3, 4, 5])
  if (small >= big) return seedCutFill(harder)
  const correct =
    Math.round(
      ((big + small) * big - 0.5 * (big + small) * (big - small) - 0.5 * big * big) * 10,
    ) / 10
  const part1 = (big * small) / 2
  const part2 = ((big + small) * small) / 2
  return {
    formulaId: 'cut-fill',
    kind: 'cut-fill',
    term: '两正方形阴影面积',
    figure: {
      kind: 'cut-fill',
      labels: { big: String(big), small: String(small) },
      note: '阴影为连接顶点形成的区域',
    },
    passage: `如图，并排两个正方形边长分别为 ${big} 与 ${small}。求阴影部分面积。`,
    stem: '阴影部分的面积是多少？',
    correct: String(correct),
    distractors: uniqueNum(correct, [
      big * big,
      small * small,
      big * small,
      (big + small) * big / 2,
      correct + 2.5,
    ]),
    method: '不规则阴影优先割补：可拆成两个三角形求和，或补成长方形再减空白。',
    explanation: `法一（拆分）：阴影可看成两个三角形面积之和。\n① ½×${big}×${small}=${part1}；② ½×(${big}+${small})×${small}=${part2}。\n合计：${part1}+${part2}=${correct}。\n法二（补形）：补成长 ${big + small}、宽 ${big} 的长方形，再减去空白三角形，同样得 ${correct}。`,
    anchorHint: `大正方形边${big}、小正方形边${small}，阴影面积必须=${correct}。不可改边长。`,
  }
}

/** 经典真题 2：高减 3 成正方体 */
function seedBoxChange(harder: boolean): GeometrySeed {
  const side = harder ? pickOne([6, 8, 10, 12]) : pickOne([5, 6, 8])
  const cut = harder ? pickOne([2, 4, 5]) : pickOne([2, 3, 4])
  const drop = 4 * side * cut
  const h = side + cut
  const volume = side * side * h
  return {
    formulaId: 'box-change',
    kind: 'box-change',
    term: '长方体变正方体',
    figure: {
      kind: 'box-change',
      labels: { a: String(side), h: String(h), cut: String(cut) },
      note: `高减少 ${cut} 后成正方体`,
    },
    passage: `一个长方体，高减少 ${cut} 后变成正方体，此时表面积比原来少 ${drop}。`,
    stem: '原长方体的体积是多少？',
    correct: String(volume),
    distractors: uniqueNum(volume, [side * side * side, drop, side * side * cut, volume + side]),
    method: '高变短成正方体 ⇒ 底面为正方形；减少的表面积来自四个侧面。',
    explanation: `设底面边长为 x。高减少 ${cut} 后成棱长为 x 的正方体。\n四个侧面各少掉一条宽为 ${cut} 的长方形，面积共减少 4×x×${cut}=${drop}。\n解得 x=${side}。\n原高=正方体棱长+减少量=${side}+${cut}=${h}。\n原体积 V=${side}×${side}×${h}=${volume}。`,
    anchorHint: `减少高${cut}、表面积少${drop}，原体积必须=${volume}。`,
  }
}

function seedPythagorean(harder: boolean): GeometrySeed {
  const triples = harder
    ? [
        [5, 12, 13],
        [6, 8, 10],
        [7, 24, 25],
        [9, 12, 15],
      ]
    : [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
      ]
  const [a, b, c] = pickOne(triples)
  const ask = pickOne(['c', 'a', 'area'] as const)
  if (ask === 'area') {
    const correct = (a * b) / 2
    return {
      formulaId: 'pythagorean',
      kind: 'right-triangle',
      term: '直角三角形面积',
      figure: { kind: 'right-triangle', labels: { a: String(a), b: String(b), c: String(c) } },
      passage: `如图，直角三角形两直角边为 ${a}、${b}。`,
      stem: '面积是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, [a * b, c * c, (a + b) / 2, correct * 2]),
      method: '直角边互相垂直，可直接作底与高：S=½×直角边₁×直角边₂。',
      explanation: `两直角边 a=${a}、b=${b}（互相垂直）。\nS=½×${a}×${b}=${correct}。\n可用勾股验证斜边：${a}²+${b}²=${a * a}+${b * b}=${c * c}=${c}²。`,
      anchorHint: `直角边${a},${b}，面积=${correct}。`,
    }
  }
  if (ask === 'c') {
    return {
      formulaId: 'pythagorean',
      kind: 'right-triangle',
      term: '勾股求斜边',
      figure: { kind: 'right-triangle', labels: { a: String(a), b: String(b) } },
      passage: `如图，直角三角形两直角边为 ${a}、${b}。`,
      stem: '斜边长是多少？',
      correct: String(c),
      distractors: uniqueNum(c, [a + b, a * b, c + 1, Math.abs(a - b)]),
      method: '勾股定理：直角边平方和等于斜边平方，a²+b²=c²。',
      explanation: `已知直角边 ${a}、${b}。\n${a}²+${b}²=${a * a}+${b * b}=${c * c}。\n斜边 c=√${c * c}=${c}。\n也可直接识别勾股数 (${a},${b},${c})。`,
      anchorHint: `直角边${a},${b}，斜边必须=${c}。`,
    }
  }
  return {
    formulaId: 'pythagorean',
    kind: 'right-triangle',
    term: '勾股求直角边',
    figure: { kind: 'right-triangle', labels: { b: String(b), c: String(c) } },
    passage: `如图，直角三角形一直角边为 ${b}，斜边为 ${c}。`,
    stem: '另一直角边长是多少？',
    correct: String(a),
    distractors: uniqueNum(a, [b, c, c - b, a + 1]),
    method: '由 a²+b²=c² 变形得 a=√(c²−b²)。',
    explanation: `斜边 c=${c}，已知直角边 b=${b}。\nc²−b²=${c * c}−${b * b}=${c * c - b * b}。\na=√${c * c - b * b}=${a}。`,
    anchorHint: `斜边${c}、一直角边${b}，另一直角边=${a}。`,
  }
}

type ShapeSlot =
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'trapezoid'
  | 'circle'
  | 'cube'
  | 'cuboid'
  | 'sphere'
  | 'cylinder'
  | 'cone'

const BASE_SLOTS: ShapeSlot[] = [
  'triangle',
  'square',
  'rectangle',
  'trapezoid',
  'circle',
  'cube',
  'cuboid',
  'sphere',
  'cylinder',
  'cone',
]

function seedForSlot(slot: ShapeSlot, difficulty: GeometryDifficulty): GeometrySeed {
  const easy = difficulty === 'easy'
  const hard = difficulty === 'hard'
  switch (slot) {
    case 'triangle':
      return seedTriangle(easy)
    case 'square':
      return seedSquare()
    case 'rectangle':
      return seedRectangle()
    case 'trapezoid':
      return seedTrapezoid()
    case 'circle':
      return seedCircle()
    case 'cube':
      return seedCube()
    case 'cuboid':
      // medium/hard: sometimes classic box-change
      if (difficulty !== 'easy' && Math.random() < (hard ? 0.55 : 0.4)) return seedBoxChange(hard)
      return seedCuboid()
    case 'sphere':
      return seedSphere()
    case 'cylinder':
      return seedCylinder()
    case 'cone':
      // medium/hard: sometimes cut-fill or pythagorean instead of cone to hit classic styles
      if (difficulty === 'medium' && Math.random() < 0.5) return seedCutFill(false)
      if (hard && Math.random() < 0.45) return seedPythagorean(true)
      if (hard && Math.random() < 0.35) return seedCutFill(true)
      return seedCone()
  }
}

/** 组一份覆盖 10 类图形/公式的种子（保证教材主要公式轮换覆盖） */
export function pickGeometrySeeds(difficulty: GeometryDifficulty): GeometrySeed[] {
  const slots = shuffleInPlace([...BASE_SLOTS])
  // Ensure medium has at least one cut-fill and one box-change somewhere
  const seeds = slots.map((s) => seedForSlot(s, difficulty))
  if (difficulty === 'medium') {
    seeds[0] = seedCutFill(false)
    seeds[1] = seedBoxChange(false)
  }
  if (difficulty === 'hard') {
    seeds[0] = seedCutFill(true)
    seeds[1] = seedBoxChange(true)
    seeds[2] = seedPythagorean(true)
  }
  return seeds
}

export function buildLocalGeometryPaper(difficulty: GeometryDifficulty): GeometryQuestion[] {
  const seeds = pickGeometrySeeds(difficulty)
  const out: GeometryQuestion[] = []
  const seen = new Set<string>()
  seeds.forEach((seed, i) => {
    const q = buildGeometryQuestionFromSeed(seed, difficulty, i)
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  })
  // pad if needed
  let guard = 0
  while (out.length < GEOMETRY_QUESTION_COUNT && guard++ < 30) {
    const seed = seedForSlot(pickOne(BASE_SLOTS), difficulty)
    const q = buildGeometryQuestionFromSeed(seed, difficulty, out.length)
    if (!q || seen.has(q.fingerprint)) continue
    seen.add(q.fingerprint)
    out.push(q)
  }
  if (out.length < GEOMETRY_QUESTION_COUNT) {
    throw new Error(`几何问题本地组卷不足：${out.length}/${GEOMETRY_QUESTION_COUNT}`)
  }
  return out.slice(0, GEOMETRY_QUESTION_COUNT)
}

export function geometryFormulaLabel(id: GeometryFormulaId): string {
  return GEOMETRY_FORMULA_CATALOG.find((f) => f.id === id)?.name ?? id
}
