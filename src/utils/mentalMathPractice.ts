import {
  FRACTION_ESTIMATE_MODES,
  generateFractionEstimateQuestion,
  type FractionEstimateMode,
} from '@/utils/fractionEstimatePractice'
import {
  DIVISIBILITY_MODES,
  generateDivisibilityQuestion,
  type DivisibilityMode,
} from '@/utils/divisibilityPractice'
import {
  assertNonTrivialPair,
  buildExamStyleNumberWrongs,
  tryBuildHardCompositeQuestion,
  type CompositeBuilt,
} from '@/utils/mentalMathCompositePractice'

export type MentalMathMode =
  | 'easy'
  | 'easy-distractor'
  | 'normal'
  | 'hard'
  | 'power-easy'
  | 'power-hard'
  | 'square-cube-easy'
  | 'square-cube-hard'
  | FractionEstimateMode
  | DivisibilityMode

export type MentalMathModeCategory =
  | 'arithmetic'
  | 'power'
  | 'square-cube'
  | 'fraction'
  | 'divisibility'

export type MentalMathAnswerValue = number | string

/** 答对加时、答错扣时的秒数 */
export const MENTAL_MATH_TIME_CORRECT_BONUS_SEC = 1
export const MENTAL_MATH_TIME_WRONG_PENALTY_SEC = 1

export type MentalMathModeConfig = {
  id: MentalMathMode
  category: MentalMathModeCategory
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const MENTAL_MATH_ARITHMETIC_MODES: MentalMathModeConfig[] = [
  {
    id: 'easy',
    category: 'arithmetic',
    label: '简单模式',
    durationSec: 20,
    optionCount: 3,
    correctDelta: 4,
    wrongDelta: -8,
    maxScore: 100,
    desc: '20 秒 · 个位数加减乘除（含负数）· 3 选项 · 对 +4 / 错 -8 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'easy-distractor',
    category: 'arithmetic',
    label: '简单模式（干扰型）',
    durationSec: 20,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '20 秒 · 与简单模式同题量纲 · 干扰含运算符错位、结果符号错位（等概率）· 3 选项 · 对 +5 / 错 -10',
  },
  {
    id: 'normal',
    category: 'arithmetic',
    label: '普通模式',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '30 秒 · 两数运算（十位+个位、百位+十位等，无个位+个位）· 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'hard',
    category: 'arithmetic',
    label: '高难模式',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 14,
    wrongDelta: -28,
    maxScore: 100,
    desc: '40 秒 · 多因子组合速算（容量估算、连乘连除等）· 考场风格选项 · 对 +14 / 错 -28 · 对 +1 秒 / 错 -1 秒',
  },
]

export const MENTAL_MATH_POWER_MODES: MentalMathModeConfig[] = [
  {
    id: 'power-easy',
    category: 'power',
    label: '简单题',
    durationSec: 25,
    optionCount: 3,
    correctDelta: 4,
    wrongDelta: -8,
    maxScore: 100,
    desc: '25 秒 · 2ⁿ（含 2⁻¹～2⁻³ 与 2⁰～2¹²）· 3 选项 · 对 +4 / 错 -8 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'power-hard',
    category: 'power',
    label: '复杂题',
    durationSec: 35,
    optionCount: 4,
    correctDelta: 12,
    wrongDelta: -24,
    maxScore: 100,
    desc: '35 秒 · 2ⁿ（2⁻²～2⁻⁶ 与 2¹⁰～2²⁴）· 4 选项 · 对 +12 / 错 -24 · 对 +1 秒 / 错 -1 秒',
  },
]

export const MENTAL_MATH_SQUARE_CUBE_MODES: MentalMathModeConfig[] = [
  {
    id: 'square-cube-easy',
    category: 'square-cube',
    label: '简单题',
    durationSec: 25,
    optionCount: 3,
    correctDelta: 4,
    wrongDelta: -8,
    maxScore: 100,
    desc: '25 秒 · n²（n≤11，不含 10²）或 n³（n≤6）随机 · 3 选项 · 对 +4 / 错 -8 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'square-cube-hard',
    category: 'square-cube',
    label: '复杂题',
    durationSec: 35,
    optionCount: 4,
    correctDelta: 12,
    wrongDelta: -24,
    maxScore: 100,
    desc: '35 秒 · n²（7～20，不含 10²）或 n³（3～9）随机 · 4 选项 · 对 +12 / 错 -24 · 对 +1 秒 / 错 -1 秒',
  },
]

export const MENTAL_MATH_FRACTION_MODES: MentalMathModeConfig[] = FRACTION_ESTIMATE_MODES.map(
  (m) => ({
    ...m,
    category: 'fraction' as const,
  }),
)

export const MENTAL_MATH_DIVISIBILITY_MODES: MentalMathModeConfig[] = DIVISIBILITY_MODES.map(
  (m) => ({
    ...m,
    category: 'divisibility' as const,
  }),
)

/** 复杂题次幂：仅考察 2⁻²～2⁻⁶ 与 2¹⁰～2²⁴ */
const POWER_HARD_EXPONENTS: number[] = [
  -6,
  -5,
  -4,
  -3,
  -2,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
]

/** 四则口算 + 2 的次幂 + 平方/立方 + 估算分数 + 整除及其性质全部模式 */
export const MENTAL_MATH_MODES: MentalMathModeConfig[] = [
  ...MENTAL_MATH_ARITHMETIC_MODES,
  ...MENTAL_MATH_POWER_MODES,
  ...MENTAL_MATH_SQUARE_CUBE_MODES,
  ...MENTAL_MATH_FRACTION_MODES,
  ...MENTAL_MATH_DIVISIBILITY_MODES,
]

export type MentalMathQuestion = {
  id: number
  expression: string
  correctAnswer: MentalMathAnswerValue
  options: MentalMathAnswerValue[]
  correctIndex: number
}

export type MentalMathAnswerRecord = {
  questionId: number
  expression: string
  correctAnswer: MentalMathAnswerValue
  chosenAnswer: MentalMathAnswerValue
  chosenIndex: number
  correct: boolean
  scoreAfter: number
  elapsedMs: number
}

export function isFractionEstimateMode(mode: MentalMathMode): mode is FractionEstimateMode {
  return mode === 'fraction-easy' || mode === 'fraction-hard'
}

export function isDivisibilityPracticeMode(mode: MentalMathMode): mode is DivisibilityMode {
  return (
    mode === 'divisibility-easy' ||
    mode === 'divisibility-distractor' ||
    mode === 'divisibility-normal' ||
    mode === 'divisibility-hard'
  )
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickNonZero(min: number, max: number): number {
  let n = randInt(min, max)
  while (n === 0) n = randInt(min, max)
  return n
}

/** 简单：个位数 -9～9 */
function pickEasyOperand(): number {
  return randInt(-9, 9)
}

function pickSign(): number {
  return Math.random() < 0.5 ? -1 : 1
}

/** 个位：-9～9 */
function pickOnesDigit(allowZero = true): number {
  const n = randInt(0, 9)
  if (!allowZero && n === 0) return pickOnesDigit(false)
  return n === 0 ? 0 : n * pickSign()
}

function pickOnesNonZero(): number {
  return pickNonZero(-9, 9)
}

/** 十位：10～99（带符号） */
function pickTens(): number {
  return pickSign() * randInt(10, 99)
}

/** 普通模式用较简单的百位：100～199 */
function pickSimpleHundreds(): number {
  return pickSign() * randInt(100, 199)
}

/** 百位：100～999 */
function pickHundreds(): number {
  return pickSign() * randInt(100, 999)
}

/** 普通：以「十位+个位」为主，少量「百位+十位」（禁止个位+个位） */
function pickNormalOperandPair(): [number, number] {
  for (let i = 0; i < 12; i++) {
    let pair: [number, number]
    if (Math.random() < 0.78) {
      const tens = pickTens()
      const ones = pickOnesNonZero()
      pair = Math.random() < 0.5 ? [tens, ones] : [ones, tens]
    } else {
      const hundreds = pickSimpleHundreds()
      const tens = pickTens()
      pair = Math.random() < 0.5 ? [hundreds, tens] : [tens, hundreds]
    }
    if (assertNonTrivialPair(pair[0], pair[1])) return pair
  }
  return [pickTens(), pickOnesNonZero()]
}

/** 高难加减：百位 ± 百位/十位 */
function pickHardAddSubPair(): [number, number] {
  const a = pickHundreds()
  const b = Math.random() < 0.55 ? pickTens() : pickHundreds()
  return [a, b]
}

/** 高难乘法：百位 × 十位/个位 */
function pickHardMulPair(): [number, number] {
  const hundreds = pickHundreds()
  const other = Math.random() < 0.55 ? pickOnesNonZero() : pickTens()
  return Math.random() < 0.5 ? [hundreds, other] : [other, hundreds]
}

function isEasyArithmeticMode(mode: MentalMathMode): boolean {
  return mode === 'easy' || mode === 'easy-distractor'
}

function pickOperands(mode: MentalMathMode, op: ArithmeticOpKind): [number, number] {
  if (isEasyArithmeticMode(mode)) {
    return [pickEasyOperand(), pickEasyOperand()]
  }
  if (mode === 'normal') {
    return pickNormalOperandPair()
  }
  if (op === 'add' || op === 'sub') {
    return pickHardAddSubPair()
  }
  return pickHardMulPair()
}

type ArithmeticOpKind = 'add' | 'sub' | 'mul' | 'div'

type BuiltQuestion = {
  expression: string
  answer: MentalMathAnswerValue
  hasNegativeInCalculation: boolean
  opKind: ArithmeticOpKind
  operandA?: number
  operandB?: number
}

function hasNegativeInValues(...values: number[]): boolean {
  return values.some((v) => v < 0)
}

function buildAdd(a: number, b: number): BuiltQuestion {
  const answer = a + b
  return {
    expression: `${a} + ${b} = ?`,
    answer,
    hasNegativeInCalculation: hasNegativeInValues(a, b, answer),
    opKind: 'add',
    operandA: a,
    operandB: b,
  }
}

function buildSub(a: number, b: number): BuiltQuestion {
  const answer = a - b
  return {
    expression: `${a} − ${b} = ?`,
    answer,
    hasNegativeInCalculation: hasNegativeInValues(a, b, answer),
    opKind: 'sub',
    operandA: a,
    operandB: b,
  }
}

function buildMul(a: number, b: number): BuiltQuestion {
  const answer = a * b
  return {
    expression: `${a} × ${b} = ?`,
    answer,
    hasNegativeInCalculation: hasNegativeInValues(a, b, answer),
    opKind: 'mul',
    operandA: a,
    operandB: b,
  }
}

function buildDivEasy(): BuiltQuestion | null {
  for (let i = 0; i < 24; i++) {
    const divisor = pickNonZero(-9, 9)
    const quotient = pickNonZero(-9, 9)
    const dividend = divisor * quotient
    if (Math.abs(dividend) > 99) continue
    return {
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      hasNegativeInCalculation: hasNegativeInValues(dividend, divisor, quotient),
      opKind: 'div',
      operandA: dividend,
      operandB: divisor,
    }
  }
  return null
}

/** 普通除法：十位/个位 ÷ 个位，或十位 ÷ 十位 */
function buildDivNormal(): BuiltQuestion | null {
  for (let i = 0; i < 32; i++) {
    const divisor = pickOnesNonZero()
    const quotient = Math.random() < 0.55 ? pickOnesNonZero() : pickTens()
    const dividend = divisor * quotient
    if (Math.abs(dividend) > 999) continue
    if (Math.abs(dividend) < 30 && Math.abs(quotient) < 10) continue
    return {
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      hasNegativeInCalculation: hasNegativeInValues(dividend, divisor, quotient),
      opKind: 'div',
      operandA: dividend,
      operandB: divisor,
    }
  }
  for (let i = 0; i < 16; i++) {
    const divisor = pickTens()
    const quotient = pickOnesNonZero()
    const dividend = divisor * quotient
    if (Math.abs(dividend) > 999) continue
    if (Math.abs(dividend) < 30 && Math.abs(quotient) < 10) continue
    return {
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      hasNegativeInCalculation: hasNegativeInValues(dividend, divisor, quotient),
      opKind: 'div',
      operandA: dividend,
      operandB: divisor,
    }
  }
  return null
}

/** 高难除法：百位数量级 ÷ 十位/个位 */
function buildDivHard(): BuiltQuestion | null {
  for (let i = 0; i < 40; i++) {
    const divisor = Math.random() < 0.55 ? pickOnesNonZero() : pickTens()
    let quotient: number
    if (Math.abs(divisor) <= 9) {
      quotient = Math.random() < 0.65 ? pickTens() : pickHundreds()
    } else {
      quotient = Math.random() < 0.7 ? pickOnesNonZero() : pickTens()
    }
    const dividend = divisor * quotient
    if (Math.abs(dividend) < 100) continue
    if (Math.abs(dividend) > 999999) continue
    return {
      expression: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      hasNegativeInCalculation: hasNegativeInValues(dividend, divisor, quotient),
      opKind: 'div',
      operandA: dividend,
      operandB: divisor,
    }
  }
  return null
}

function buildDiv(mode: MentalMathMode): BuiltQuestion | null {
  if (isEasyArithmeticMode(mode)) return buildDivEasy()
  if (mode === 'normal') return buildDivNormal()
  if (mode === 'hard') return buildDivHard()
  return null
}

function buildRandomQuestion(mode: MentalMathMode): BuiltQuestion {
  for (let attempt = 0; attempt < 20; attempt++) {
    const ops: ArithmeticOpKind[] = ['add', 'sub', 'mul', 'div']
    const opKind = ops[randInt(0, ops.length - 1)]!
    if (opKind === 'div') {
      const div = buildDiv(mode)
      if (div) return div
      continue
    }
    const [a, b] = pickOperands(mode, opKind)
    if (mode === 'normal' && !assertNonTrivialPair(a, b)) continue
    if (opKind === 'add') return buildAdd(a, b)
    if (opKind === 'sub') return buildSub(a, b)
    return buildMul(a, b)
  }
  return buildAdd(pickTens(), pickOnesNonZero())
}

/** 错误选项与正确答案相差 1～4；运算含负数时混入小正数干扰项 */
function distinctWrongAnswers(
  correct: number,
  count: number,
  hasNegativeInCalculation: boolean,
): number[] {
  const wrong: number[] = []
  const used = new Set<number>([correct])
  const candidates: number[] = []

  for (let delta = 1; delta <= 4; delta++) {
    candidates.push(correct + delta, correct - delta)
  }

  if (hasNegativeInCalculation) {
    for (let p = 1; p <= 9; p++) {
      candidates.push(p)
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = candidates[i]!
    candidates[i] = candidates[j]!
    candidates[j] = tmp
  }

  for (const candidate of candidates) {
    if (wrong.length >= count) break
    if (used.has(candidate)) continue
    used.add(candidate)
    wrong.push(candidate)
  }

  for (let delta = 1; wrong.length < count && delta <= 4; delta++) {
    for (const sign of [-1, 1]) {
      const candidate = correct + sign * delta
      if (used.has(candidate)) continue
      used.add(candidate)
      wrong.push(candidate)
      if (wrong.length >= count) break
    }
  }

  return wrong
}

function isDistractorCloseEnough(correct: number, candidate: number): boolean {
  if (candidate === correct) return false
  if (correct === 0) return Math.abs(candidate) <= 4
  return Math.abs(candidate - correct) <= 2 * Math.abs(correct)
}

/** 符号错位不可用（超距）时，在正确答案附近、且仍在 2|答案| 内挑替补 */
function collectNearbySignSubstitutes(correct: number, seen: Set<number>): number[] {
  const limit = correct === 0 ? 4 : 2 * Math.abs(correct)
  const opposite: number[] = []
  const same: number[] = []
  for (let d = 1; d <= 6; d++) {
    for (const v of [correct + d, correct - d]) {
      if (!Number.isFinite(v) || !Number.isInteger(v)) continue
      if (seen.has(v)) continue
      if (Math.abs(v - correct) > limit) continue
      if (correct !== 0 && v !== 0 && Math.sign(v) !== Math.sign(correct)) {
        opposite.push(v)
      } else {
        same.push(v)
      }
    }
  }
  return [...opposite, ...same]
}

function offerSignDistractorsToPool(
  correct: number,
  trickPool: number[],
  seen: Set<number>,
  offer: (v: number, bucket: number[]) => void,
): void {
  if (correct === 0) return

  let placedSign = false
  const signCandidates: number[] = [-correct]
  if (correct < 0) signCandidates.push(Math.abs(correct))

  for (const v of signCandidates) {
    if (!isDistractorCloseEnough(correct, v)) continue
    const before = trickPool.length
    offer(v, trickPool)
    if (trickPool.length > before) placedSign = true
  }

  if (placedSign) return

  const nearby = collectNearbySignSubstitutes(correct, seen)
  for (let i = nearby.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = nearby[i]!
    nearby[i] = nearby[j]!
    nearby[j] = tmp
  }
  for (const v of nearby) {
    const before = trickPool.length
    offer(v, trickPool)
    if (trickPool.length > before) break
  }
}

/** 简单干扰型：运算符错位与结果符号错位同一池、打乱后等概率抽取 */
function distinctEasyDistractorWrongAnswers(built: BuiltQuestion, count: number): number[] {
  const correct = built.answer
  if (typeof correct !== 'number') return []
  const a = built.operandA
  const b = built.operandB
  if (a == null || b == null) {
    return distinctWrongAnswers(correct, count, built.hasNegativeInCalculation)
  }

  const op = built.opKind
  const trickPool: number[] = []
  const fallback: number[] = []
  const seen = new Set<number>([correct])

  const offer = (v: number, bucket: number[]) => {
    if (!Number.isFinite(v) || !Number.isInteger(v)) return
    if (seen.has(v)) return
    if (!isDistractorCloseEnough(correct, v)) return
    seen.add(v)
    bucket.push(v)
  }

  // 运算符错位（如 5×7 误选 5+7、5−7）
  if (op !== 'add') offer(a + b, trickPool)
  if (op !== 'sub') {
    offer(a - b, trickPool)
    offer(b - a, trickPool)
  }
  if (op !== 'mul') offer(a * b, trickPool)
  if (op !== 'div') {
    if (b !== 0 && a % b === 0) offer(a / b, trickPool)
    if (a !== 0 && b % a === 0) offer(b / a, trickPool)
  }

  // 结果符号错位（负结果混入正数、正结果混入负数；与上列同池、等概率）
  offerSignDistractorsToPool(correct, trickPool, seen, offer)

  for (let d = 1; d <= 4; d++) {
    offer(correct + d, fallback)
    offer(correct - d, fallback)
  }

  const wrong: number[] = []
  const shuffledTricks = [...trickPool]
  for (let i = shuffledTricks.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = shuffledTricks[i]!
    shuffledTricks[i] = shuffledTricks[j]!
    shuffledTricks[j] = tmp
  }
  for (const v of shuffledTricks) {
    if (wrong.length >= count) break
    wrong.push(v)
  }

  if (wrong.length < count) {
    const shuffledFallback = [...fallback]
    for (let i = shuffledFallback.length - 1; i > 0; i--) {
      const j = randInt(0, i)
      const tmp = shuffledFallback[i]!
      shuffledFallback[i] = shuffledFallback[j]!
      shuffledFallback[j] = tmp
    }
    for (const v of shuffledFallback) {
      if (wrong.length >= count) break
      if (wrong.includes(v)) continue
      wrong.push(v)
    }
  }

  if (wrong.length < count && correct !== 0) {
    const nearby = collectNearbySignSubstitutes(correct, new Set([correct, ...wrong]))
    for (const v of nearby) {
      if (wrong.length >= count) break
      if (wrong.includes(v)) continue
      wrong.push(v)
    }
  }

  return wrong
}

const POWER_SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const POWER_SUPERSCRIPT_MINUS = '⁻'

function formatPowerSuperscriptDigits(n: number): string {
  return String(n)
    .split('')
    .map((ch) => POWER_SUPERSCRIPT_DIGITS[Number(ch)] ?? ch)
    .join('')
}

function normalizeAvoidFingerprints(
  avoid?: string | string[] | Set<string> | null,
): Set<string> {
  if (!avoid) return new Set()
  if (avoid instanceof Set) return avoid
  if (typeof avoid === 'string') return new Set([avoid])
  return new Set(avoid)
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
}

/** 底数为 10 的平方/立方（100、1000 等）不出题 */
const NAT_POWER_EXCLUDED_BASES = new Set([10])

function integersInRange(min: number, max: number, exclude: ReadonlySet<number> = new Set()): number[] {
  const out: number[] = []
  for (let n = min; n <= max; n++) {
    if (!exclude.has(n)) out.push(n)
  }
  return out
}

function pickFromPool(pool: number[]): number {
  return pool[randInt(0, pool.length - 1)]!
}

function assembleUniqueNumericOptions(
  correctAnswer: number,
  wrongValues: number[],
  optionCount: number,
): { options: number[]; correctIndex: number } | null {
  const distinctWrong: number[] = []
  const seen = new Set<number>([correctAnswer])
  for (const v of wrongValues) {
    if (!Number.isFinite(v) || seen.has(v)) continue
    seen.add(v)
    distinctWrong.push(v)
  }
  if (distinctWrong.length < optionCount - 1) return null

  const options = [...distinctWrong.slice(0, optionCount - 1), correctAnswer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctAnswer)
  if (correctIndex < 0) return null
  return { options, correctIndex }
}

function formatPowerOfTwoExpression(exponent: number): string {
  const expStr =
    exponent < 0
      ? POWER_SUPERSCRIPT_MINUS + formatPowerSuperscriptDigits(-exponent)
      : formatPowerSuperscriptDigits(exponent)
  return `2${expStr} = ?`
}

/** 错误选项为相邻次幂的 2^n，差距不超过 ±2（复杂题 ±3）；按结果值去重 */
function distinctPowerWrongExponents(
  exponent: number,
  count: number,
  minExp: number,
  maxExp: number,
  maxNeighbor: number,
  valueOf: (e: number) => number = (e) => 2 ** e,
): number[] {
  const wrong: number[] = []
  const usedExponents = new Set<number>([exponent])
  const usedValues = new Set<number>([valueOf(exponent)])

  for (let delta = 1; wrong.length < count && delta <= maxNeighbor; delta++) {
    const neighbors = [exponent - delta, exponent + delta]
    shuffleInPlace(neighbors)
    for (const e of neighbors) {
      if (e < minExp || e > maxExp || usedExponents.has(e)) continue
      const v = valueOf(e)
      if (usedValues.has(v)) continue
      usedExponents.add(e)
      usedValues.add(v)
      wrong.push(e)
      if (wrong.length >= count) break
    }
  }

  if (wrong.length < count) {
    const extended: number[] = []
    for (let e = minExp; e <= maxExp; e++) {
      if (usedExponents.has(e)) continue
      extended.push(e)
    }
    shuffleInPlace(extended)
    for (const e of extended) {
      if (wrong.length >= count) break
      const v = valueOf(e)
      if (usedValues.has(v)) continue
      usedExponents.add(e)
      usedValues.add(v)
      wrong.push(e)
    }
  }

  return wrong
}

/** 从允许次幂池中取相邻干扰项；按结果值去重 */
function distinctPowerWrongExponentsFromAllowed(
  exponent: number,
  count: number,
  allowed: readonly number[],
  maxNeighbor: number,
  valueOf: (e: number) => number = (e) => 2 ** e,
): number[] {
  const wrong: number[] = []
  const usedExponents = new Set<number>([exponent])
  const usedValues = new Set<number>([valueOf(exponent)])
  const allowedSet = new Set(allowed)

  for (let delta = 1; wrong.length < count && delta <= maxNeighbor; delta++) {
    const neighbors = [exponent - delta, exponent + delta]
    shuffleInPlace(neighbors)
    for (const e of neighbors) {
      if (!allowedSet.has(e) || usedExponents.has(e)) continue
      const v = valueOf(e)
      if (usedValues.has(v)) continue
      usedExponents.add(e)
      usedValues.add(v)
      wrong.push(e)
      if (wrong.length >= count) break
    }
  }

  if (wrong.length < count) {
    const extended = allowed.filter((e) => !usedExponents.has(e))
    shuffleInPlace(extended)
    for (const e of extended) {
      if (wrong.length >= count) break
      const v = valueOf(e)
      if (usedValues.has(v)) continue
      usedExponents.add(e)
      usedValues.add(v)
      wrong.push(e)
    }
  }

  return wrong
}

function generatePowerOfTwoQuestion(
  mode: 'power-easy' | 'power-hard',
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string>,
): MentalMathQuestion | null {
  const maxNeighbor = mode === 'power-easy' ? 2 : 3
  const minExp = -3
  const maxExp = 12
  const easyPool = integersInRange(minExp, maxExp)
  const hardPool = [...POWER_HARD_EXPONENTS]

  for (let attempt = 0; attempt < 48; attempt++) {
    const pool = mode === 'power-hard' ? hardPool : easyPool
    const fresh = pool.filter((e) => !avoidFingerprints.has(formatPowerOfTwoExpression(e)))
    const exponent = fresh.length ? pickFromPool(fresh) : pickFromPool(pool)

    const wrongExponents =
      mode === 'power-hard'
        ? distinctPowerWrongExponentsFromAllowed(
            exponent,
            optionCount - 1,
            hardPool,
            maxNeighbor,
          )
        : distinctPowerWrongExponents(
            exponent,
            optionCount - 1,
            minExp,
            maxExp,
            maxNeighbor,
          )

    const correctAnswer = 2 ** exponent
    const wrongValues = wrongExponents.map((e) => 2 ** e)
    const built = assembleUniqueNumericOptions(correctAnswer, wrongValues, optionCount)
    if (!built) continue

    const expression = formatPowerOfTwoExpression(exponent)
    if (avoidFingerprints.has(expression)) continue

    return {
      id,
      expression,
      correctAnswer,
      options: built.options,
      correctIndex: built.correctIndex,
    }
  }

  return null
}

type NatPowerKind = 'square' | 'cube'

function natPowerBasePool(kind: NatPowerKind, hard: boolean): number[] {
  const { min, max } = natPowerExponentRange(kind, hard)
  return integersInRange(min, max, NAT_POWER_EXCLUDED_BASES)
}

function natPowerExponentRange(kind: NatPowerKind, hard: boolean): { min: number; max: number } {
  if (!hard) {
    return kind === 'square' ? { min: 1, max: 11 } : { min: 1, max: 6 }
  }
  return kind === 'square' ? { min: 7, max: 20 } : { min: 3, max: 9 }
}

function formatNatPowerExpression(base: number, kind: NatPowerKind): string {
  return `${base}${kind === 'square' ? '²' : '³'} = ?`
}

function computeNatPower(base: number, kind: NatPowerKind): number {
  return kind === 'square' ? base * base : base * base * base
}

function generateSquareCubeQuestion(
  mode: 'square-cube-easy' | 'square-cube-hard',
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string>,
): MentalMathQuestion | null {
  const hard = mode === 'square-cube-hard'
  const maxNeighbor = hard ? 3 : 2
  const kinds: NatPowerKind[] = ['square', 'cube']

  for (let attempt = 0; attempt < 48; attempt++) {
    shuffleInPlace(kinds)
    let picked: {
      kind: NatPowerKind
      base: number
      expression: string
    } | null = null

    for (const kind of kinds) {
      const pool = natPowerBasePool(kind, hard)
      if (!pool.length) continue
      const fresh = pool.filter((b) => !avoidFingerprints.has(formatNatPowerExpression(b, kind)))
      const base = fresh.length ? pickFromPool(fresh) : pickFromPool(pool)
      const expression = formatNatPowerExpression(base, kind)
      if (!avoidFingerprints.has(expression)) {
        picked = { kind, base, expression }
        break
      }
      if (!picked) picked = { kind, base, expression }
    }

    if (!picked) continue
    const { kind, base, expression } = picked
    const { min, max } = natPowerExponentRange(kind, hard)
    const valueOf = (b: number) => computeNatPower(b, kind)
    const wrongBases = distinctPowerWrongExponents(
      base,
      optionCount - 1,
      min,
      max,
      maxNeighbor,
      valueOf,
    ).filter((b) => !NAT_POWER_EXCLUDED_BASES.has(b))

    const correctAnswer = valueOf(base)
    const wrongValues = wrongBases.map((b) => valueOf(b))
    const built = assembleUniqueNumericOptions(correctAnswer, wrongValues, optionCount)
    if (!built) continue
    if (avoidFingerprints.has(expression)) continue

    return {
      id,
      expression,
      correctAnswer,
      options: built.options,
      correctIndex: built.correctIndex,
    }
  }

  return null
}

export function getMentalMathQuestionFingerprint(q: MentalMathQuestion): string {
  return q.expression
}

export function generateMentalMathQuestion(
  mode: MentalMathMode,
  id: number,
  optionCount: number,
  avoidFingerprints?: string | string[] | Set<string> | null,
): MentalMathQuestion {
  const avoid = normalizeAvoidFingerprints(avoidFingerprints)
  const maxAttempts =
    mode === 'power-easy' ||
    mode === 'power-hard' ||
    mode === 'square-cube-easy' ||
    mode === 'square-cube-hard'
      ? 64
      : 28
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const q = buildMentalMathQuestionOnce(mode, id, optionCount, avoid)
    const fp = getMentalMathQuestionFingerprint(q)
    if (!avoid.has(fp)) return q
  }
  return buildMentalMathQuestionOnce(mode, id, optionCount, new Set())
}

function buildQuestionFromComposite(
  composite: CompositeBuilt,
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const wrong = composite.buildWrongOptions(optionCount - 1)
  const options = [...wrong, composite.answer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === composite.answer)
  return {
    id,
    expression: composite.expression,
    correctAnswer: composite.answer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function buildMentalMathQuestionOnce(
  mode: MentalMathMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): MentalMathQuestion {
  if (isFractionEstimateMode(mode)) {
    return generateFractionEstimateQuestion(mode, id, optionCount)
  }

  if (isDivisibilityPracticeMode(mode)) {
    return generateDivisibilityQuestion(mode, id, optionCount)
  }

  if (mode === 'power-easy' || mode === 'power-hard') {
    return (
      generatePowerOfTwoQuestion(mode, id, optionCount, avoidFingerprints) ??
      generatePowerOfTwoQuestion(mode, id, optionCount, new Set())!
    )
  }

  if (mode === 'square-cube-easy' || mode === 'square-cube-hard') {
    return (
      generateSquareCubeQuestion(mode, id, optionCount, avoidFingerprints) ??
      generateSquareCubeQuestion(mode, id, optionCount, new Set())!
    )
  }

  if (mode === 'hard' && Math.random() < 0.65) {
    const composite = tryBuildHardCompositeQuestion()
    if (composite) return buildQuestionFromComposite(composite, id, optionCount)
  }

  const built = buildRandomQuestion(mode)
  const wrong =
    typeof built.answer === 'number'
      ? mode === 'easy-distractor'
        ? distinctEasyDistractorWrongAnswers(built, optionCount - 1)
        : mode === 'easy'
          ? distinctWrongAnswers(
              built.answer,
              optionCount - 1,
              built.hasNegativeInCalculation,
            )
          : buildExamStyleNumberWrongs(built.answer, optionCount - 1)
      : []
  const options = [...wrong, built.answer]
  for (let i = options.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = options[i]!
    options[i] = options[j]!
    options[j] = tmp
  }
  const correctIndex = options.findIndex((v) => v === built.answer)
  return {
    id,
    expression: built.expression,
    correctAnswer: built.answer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

export function clampMentalMathScore(score: number, max = 100): number {
  return Math.min(max, Math.max(0, Math.round(score)))
}

export function getMentalMathModeConfig(mode: MentalMathMode): MentalMathModeConfig {
  return MENTAL_MATH_MODES.find((m) => m.id === mode) ?? MENTAL_MATH_MODES[0]!
}
