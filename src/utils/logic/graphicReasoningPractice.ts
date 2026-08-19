/** 简单图形推理：程序化 SVG 图元（viewBox 0 0 100 100） */

export type GraphicReasoningMode = 'graphic'

export const GRAPHIC_REASONING_TIME_CORRECT_BONUS_SEC = 1
export const GRAPHIC_REASONING_TIME_WRONG_PENALTY_SEC = 1

const WRONG_OPTION_COUNT = 3

export type GraphicReasoningModeConfig = {
  id: GraphicReasoningMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const GRAPHIC_REASONING_MODES: GraphicReasoningModeConfig[] = [
  {
    id: 'graphic',
    label: '图形推理',
    durationSec: 35,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '35 秒 · 旋转 / 形状循环 / 数量递增 / 填色交替 / 放射线 / 双标记 / 图形自转 / 四宫格填色 / 圆点平移 / 四角标记 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
]

export type GfxPrimitive = {
  type: 'circle' | 'rect' | 'triangle' | 'line' | 'dot'
  cx?: number
  cy?: number
  r?: number
  w?: number
  h?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  rotate?: number
  filled?: boolean
}

export type GfxCell = {
  primitives: GfxPrimitive[]
}

export type GraphicReasoningQuestion = {
  id: number
  ruleLabel: string
  sequence: GfxCell[]
  options: GfxCell[]
  correctIndex: number
}

export type GraphicReasoningAnswerRecord = {
  questionId: number
  ruleLabel: string
  chosenIndex: number
  correctIndex: number
  correct: boolean
  scoreAfter: number
  elapsedMs: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

function circle(cx: number, cy: number, r: number, filled = false): GfxPrimitive {
  return { type: 'circle', cx, cy, r, filled }
}

function dot(cx: number, cy: number, r = 5): GfxPrimitive {
  return { type: 'dot', cx, cy, r, filled: true }
}

function markerOnRing(angleDeg: number): GfxPrimitive {
  const rad = (angleDeg * Math.PI) / 180
  return dot(50 + 28 * Math.sin(rad), 50 - 28 * Math.cos(rad), 6)
}

function ringWithMarker(angleDeg: number): GfxCell {
  return { primitives: [circle(50, 50, 32, false), markerOnRing(angleDeg)] }
}

function shapeCell(shapeIndex: number, scale = 1): GfxCell {
  const i = ((shapeIndex % 3) + 3) % 3
  if (i === 0) {
    return { primitives: [circle(50, 50, 28 * scale, true)] }
  }
  if (i === 1) {
    const side = 44 * scale
    return { primitives: [{ type: 'rect', cx: 50, cy: 50, w: side, h: side, filled: true }] }
  }
  return {
    primitives: [{ type: 'triangle', cx: 50, cy: 50, r: 30 * scale, filled: true }],
  }
}

function dotCountCell(count: number): GfxCell {
  const n = Math.max(1, Math.min(6, count))
  const primitives: GfxPrimitive[] = []
  const startX = 50 - ((n - 1) * 14) / 2
  for (let i = 0; i < n; i++) {
    primitives.push(dot(startX + i * 14, 50, 5))
  }
  return { primitives }
}

function fillCircleCell(filled: boolean, r = 30): GfxCell {
  return { primitives: [circle(50, 50, r, filled)] }
}

function fillToggleCell(step: number): GfxCell {
  return fillCircleCell(step % 2 === 0, 30)
}

function radialLinesCell(count: number): GfxCell {
  const n = Math.max(2, Math.min(8, count))
  const primitives: GfxPrimitive[] = [circle(50, 50, 32, false)]
  for (let i = 0; i < n; i++) {
    const rad = (i * 360 / n) * (Math.PI / 180)
    primitives.push({
      type: 'line',
      x1: 50,
      y1: 50,
      x2: 50 + 30 * Math.sin(rad),
      y2: 50 - 30 * Math.cos(rad),
    })
  }
  return { primitives }
}

function dualMarkerCell(angle1: number, angle2: number): GfxCell {
  return {
    primitives: [
      circle(50, 50, 32, false),
      markerOnRing(angle1),
      markerOnRing(angle2),
    ],
  }
}

function rotatedShapeCell(kind: 'triangle' | 'rect', angleDeg: number): GfxCell {
  const angle = ((angleDeg % 360) + 360) % 360
  if (kind === 'triangle') {
    return {
      primitives: [
        { type: 'triangle', cx: 50, cy: 50, r: 28, filled: true, rotate: angle },
      ],
    }
  }
  return {
    primitives: [{ type: 'rect', cx: 50, cy: 50, w: 40, h: 40, filled: true, rotate: angle }],
  }
}

/** 四宫格按「左上→右上→左下→右下」逐格填色 */
function gridFillCell(filledCount: number): GfxCell {
  const slots: [number, number][] = [
    [36, 36],
    [64, 36],
    [36, 64],
    [64, 64],
  ]
  const n = Math.max(0, Math.min(4, filledCount))
  const primitives: GfxPrimitive[] = [
    { type: 'rect', cx: 50, cy: 50, w: 54, h: 54, filled: false },
    { type: 'line', x1: 50, y1: 23, x2: 50, y2: 77 },
    { type: 'line', x1: 23, y1: 50, x2: 77, y2: 50 },
  ]
  for (let i = 0; i < n; i++) {
    const [cx, cy] = slots[i]!
    primitives.push({ type: 'rect', cx, cy, w: 20, h: 20, filled: true })
  }
  return { primitives }
}

/** 单个圆点沿水平轨迹每次右移一格 */
function shiftDotCell(position: number): GfxCell {
  const xs = [22, 34, 46, 58, 70]
  const idx = Math.max(0, Math.min(xs.length - 1, position))
  return {
    primitives: [
      { type: 'line', x1: 18, y1: 50, x2: 82, y2: 50 },
      dot(xs[idx]!, 50, 6),
    ],
  }
}

/** 方框四角黑点，从左上顺时针逐格增加 */
function cornerDotsCell(count: number): GfxCell {
  const n = Math.max(0, Math.min(4, count))
  const corners: [number, number][] = [
    [28, 28],
    [72, 28],
    [72, 72],
    [28, 72],
  ]
  const primitives: GfxPrimitive[] = [
    { type: 'rect', cx: 50, cy: 50, w: 52, h: 52, filled: false },
  ]
  for (let i = 0; i < n; i++) {
    const [cx, cy] = corners[i]!
    primitives.push(dot(cx, cy, 6))
  }
  return { primitives }
}

function gfxCellKey(cell: GfxCell): string {
  return JSON.stringify(cell)
}

function cellsEqual(a: GfxCell, b: GfxCell): boolean {
  return gfxCellKey(a) === gfxCellKey(b)
}

/** 按图形外观去重，保证与正确答案不同 */
function pickDistinctWrongCells(correct: GfxCell, count: number, pool: GfxCell[]): GfxCell[] {
  const wrong: GfxCell[] = []
  const usedKeys = new Set<string>([gfxCellKey(correct)])
  for (const cell of shuffle(pool)) {
    const key = gfxCellKey(cell)
    if (usedKeys.has(key)) continue
    wrong.push(cell)
    usedKeys.add(key)
    if (wrong.length >= count) break
  }
  return wrong
}

function buildOptions(
  correctCell: GfxCell,
  wrongCells: GfxCell[],
): { options: GfxCell[]; correctIndex: number } | null {
  const distinctWrong = pickDistinctWrongCells(
    correctCell,
    wrongCells.length,
    wrongCells,
  )
  if (distinctWrong.length !== wrongCells.length) return null

  const options = shuffle([...distinctWrong, correctCell])
  const keys = options.map(gfxCellKey)
  if (new Set(keys).size !== keys.length) return null

  const correctIndex = options.findIndex((o) => cellsEqual(o, correctCell))
  if (correctIndex < 0) return null
  return { options, correctIndex }
}

function isValidQuestion(q: GraphicReasoningQuestion | null, optionCount: number): boolean {
  if (!q || q.options.length !== optionCount) return false
  const keys = q.options.map(gfxCellKey)
  return new Set(keys).size === keys.length
}

type RuleBuilder = () => GraphicReasoningQuestion | null

function buildRotate45(): GraphicReasoningQuestion | null {
  const step = 45
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 3) * step
  const correctAngle = start + 3 * step
  const correctCell = ringWithMarker(correctAngle)

  const anglePool: number[] = []
  for (let d = 1; d <= 8; d++) {
    anglePool.push(correctAngle + d * (step / 2))
    anglePool.push(correctAngle - d * step)
    anglePool.push(correctAngle + d * step)
  }
  const cellPool = anglePool.map((a) => ringWithMarker(((a % 360) + 360) % 360))
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, cellPool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: `圆环上标记每次顺时针转 ${step}°`,
    sequence: [start, start + step, start + 2 * step].map((a) => ringWithMarker(a)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildShapeCycle(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 2)
  const correctIdx = start + 3
  const correctShape = ((correctIdx % 3) + 3) % 3
  const correctCell = shapeCell(correctIdx)

  const pool: GfxCell[] = []
  for (const i of [0, 1, 2]) {
    if (i !== correctShape) pool.push(shapeCell(i))
  }
  if (correctShape === 0) {
    pool.push(fillCircleCell(false), shapeCell(1, 0.72), shapeCell(2, 0.72))
  } else if (correctShape === 1) {
    pool.push(fillCircleCell(false), shapeCell(0, 0.72), shapeCell(2, 0.72))
  } else {
    pool.push(fillCircleCell(false), shapeCell(0, 0.72), shapeCell(1, 0.72))
  }

  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '图形按圆 → 方 → 三角循环',
    sequence: [start, start + 1, start + 2].map((i) => shapeCell(i)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildDotCount(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(1, 2)
  const correctN = start + 3
  const correctCell = dotCountCell(correctN)

  const pool: GfxCell[] = []
  for (let n = 1; n <= 6; n++) {
    if (n !== correctN) pool.push(dotCountCell(n))
  }
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '圆点数量每次 +1',
    sequence: [start, start + 1, start + 2].map((n) => dotCountCell(n)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildFillToggle(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 1)
  const correctStep = start + 3
  const correctFilled = correctStep % 2 === 0
  const correctCell = fillCircleCell(correctFilled, 30)

  const pool: GfxCell[] = [
    fillCircleCell(!correctFilled, 30),
    fillCircleCell(!correctFilled, 24),
    fillCircleCell(!correctFilled, 36),
    fillCircleCell(correctFilled, 24),
    fillCircleCell(correctFilled, 36),
    shapeCell(1),
    shapeCell(2),
  ]
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '实心圆与空心圆交替',
    sequence: [start, start + 1, start + 2].map((s) => fillToggleCell(s)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildRadialLines(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(2, 3)
  const correctN = start + 3
  const correctCell = radialLinesCell(correctN)

  const pool: GfxCell[] = []
  for (let n = 2; n <= 8; n++) {
    if (n !== correctN) pool.push(radialLinesCell(n))
  }
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '圆内放射线条数每次 +1',
    sequence: [start, start + 1, start + 2].map((n) => radialLinesCell(n)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildDualRotate(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const step = 90
  const a0 = randInt(0, 3) * step
  const b0 = randInt(0, 3) * step
  const correctCell = dualMarkerCell(a0 + 3 * step, b0 + 3 * step)

  const pool: GfxCell[] = [
    dualMarkerCell(a0 + 3 * step, b0 + 2 * step),
    dualMarkerCell(a0 + 2 * step, b0 + 3 * step),
    dualMarkerCell(a0 + step, b0 + 3 * step),
    dualMarkerCell(a0 + 3 * step, b0 + step),
    dualMarkerCell(a0 + 2 * step, b0 + 2 * step),
    dualMarkerCell(a0 + step, b0 + step),
  ]
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '双标记同时顺时针转 90°',
    sequence: [
      dualMarkerCell(a0, b0),
      dualMarkerCell(a0 + step, b0 + step),
      dualMarkerCell(a0 + 2 * step, b0 + 2 * step),
    ],
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildShapeSelfRotate(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const step = 90
  const kind: 'triangle' | 'rect' = Math.random() < 0.6 ? 'triangle' : 'rect'
  const start = randInt(0, 3) * step
  const correctAngle = start + 3 * step
  const correctCell = rotatedShapeCell(kind, correctAngle)

  const anglePool: number[] = []
  for (let d = 1; d <= 4; d++) {
    anglePool.push(correctAngle + d * step, correctAngle - d * step)
    anglePool.push(correctAngle + d * (step / 2))
  }
  const cellPool = anglePool.map((a) => rotatedShapeCell(kind, a))
  cellPool.push(rotatedShapeCell(kind === 'triangle' ? 'rect' : 'triangle', correctAngle))
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, cellPool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: `图形自身每次顺时针转 ${step}°`,
    sequence: [start, start + step, start + 2 * step].map((a) => rotatedShapeCell(kind, a)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildGridFill(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 1)
  const correctN = start + 3
  const correctCell = gridFillCell(correctN)

  const pool: GfxCell[] = []
  for (let n = 0; n <= 4; n++) {
    if (n !== correctN) pool.push(gridFillCell(n))
  }
  pool.push(cornerDotsCell(2), dotCountCell(3))
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '四宫格按左上→右上→左下→右下逐格填色',
    sequence: [start, start + 1, start + 2].map((n) => gridFillCell(n)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildDotShift(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 1)
  const correctPos = start + 3
  const correctCell = shiftDotCell(correctPos)

  const pool: GfxCell[] = []
  for (let p = 0; p <= 4; p++) {
    if (p !== correctPos) pool.push(shiftDotCell(p))
  }
  pool.push(dotCountCell(3), ringWithMarker(0))
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '圆点沿横线每次向右平移一格',
    sequence: [start, start + 1, start + 2].map((p) => shiftDotCell(p)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

function buildCornerDots(): GraphicReasoningQuestion | null {
  const wrongCount = WRONG_OPTION_COUNT
  const start = randInt(0, 1)
  const correctN = start + 3
  const correctCell = cornerDotsCell(correctN)

  const pool: GfxCell[] = []
  for (let n = 0; n <= 4; n++) {
    if (n !== correctN) pool.push(cornerDotsCell(n))
  }
  pool.push(dotCountCell(4), radialLinesCell(4))
  const wrongCells = pickDistinctWrongCells(correctCell, wrongCount, pool)
  const built = buildOptions(correctCell, wrongCells)
  if (!built) return null

  const q: GraphicReasoningQuestion = {
    id: 0,
    ruleLabel: '方框四角黑点顺时针逐增',
    sequence: [start, start + 1, start + 2].map((n) => cornerDotsCell(n)),
    options: built.options,
    correctIndex: built.correctIndex,
  }
  return isValidQuestion(q, wrongCount + 1) ? q : null
}

const RULE_BUILDERS: RuleBuilder[] = [
  buildRotate45,
  buildShapeCycle,
  buildDotCount,
  buildFillToggle,
  buildRadialLines,
  buildDualRotate,
  buildShapeSelfRotate,
  buildGridFill,
  buildDotShift,
  buildCornerDots,
]

export function getGraphicReasoningQuestionFingerprint(q: GraphicReasoningQuestion): string {
  const seqKey = q.sequence.map((cell) => gfxCellKey(cell)).join('|')
  return `${q.ruleLabel}|${seqKey}`
}

function tryBuildGraphicQuestion(
  id: number,
  optionCount: number,
): GraphicReasoningQuestion | null {
  for (let attempt = 0; attempt < 40; attempt++) {
    const builder = RULE_BUILDERS[randInt(0, RULE_BUILDERS.length - 1)]!
    const q = builder()
    if (q && isValidQuestion(q, optionCount)) {
      return { ...q, id }
    }
  }
  for (const builder of RULE_BUILDERS) {
    const q = builder()
    if (q && isValidQuestion(q, optionCount)) {
      return { ...q, id }
    }
  }
  return null
}

export function generateGraphicReasoningQuestion(
  _mode: GraphicReasoningMode,
  id: number,
  optionCount: number,
  avoidFingerprint?: string | null,
): GraphicReasoningQuestion {
  for (let attempt = 0; attempt < 28; attempt++) {
    const q = tryBuildGraphicQuestion(id, optionCount)
    if (q) {
      const fp = getGraphicReasoningQuestionFingerprint(q)
      if (!avoidFingerprint || fp !== avoidFingerprint) {
        return q
      }
    }
  }

  const forced = tryBuildGraphicQuestion(id, optionCount)
  if (forced) return forced
  const fallback = buildDotCount()
  if (fallback && isValidQuestion(fallback, optionCount)) {
    return { ...fallback, id }
  }
  return {
    id,
    ruleLabel: '圆点数量每次 +1',
    sequence: [dotCountCell(1), dotCountCell(2), dotCountCell(3)],
    options: [dotCountCell(2), dotCountCell(4), dotCountCell(5), dotCountCell(6)].slice(
      0,
      optionCount,
    ),
    correctIndex: 1,
  }
}

export function clampGraphicReasoningScore(score: number, max = 100): number {
  return Math.min(max, Math.max(0, Math.round(score)))
}

export function getGraphicReasoningModeConfig(
  mode: GraphicReasoningMode,
): GraphicReasoningModeConfig {
  return GRAPHIC_REASONING_MODES.find((m) => m.id === mode) ?? GRAPHIC_REASONING_MODES[0]!
}
