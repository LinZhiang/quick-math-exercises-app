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
  LIFE_SENSE_MODES,
  generateLifeSenseQuestion,
  type LifeSenseMode,
} from '@/utils/lifeSensePractice'
import {
  GRAMMAR_JUDGMENT_MODES,
  generateGrammarJudgmentQuestion,
  type GrammarJudgmentMode,
} from '@/utils/grammarJudgmentPractice'
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
  | 'cumsum-easy'
  | 'cumsum-hard'
  | 'threedigit-easy'
  | 'threedigit-hard'
  | 'pct-addsub-easy'
  | 'pct-addsub-hard'
  | 'mulcalc-easy'
  | 'mulcalc-hard'
  | 'mixchain-easy'
  | 'mixchain-hard'
  | 'power-easy'
  | 'power-hard'
  | 'square-cube-easy'
  | 'square-cube-hard'
  | FractionEstimateMode
  | DivisibilityMode
  | LifeSenseMode
  | GrammarJudgmentMode

export type MentalMathModeCategory =
  | 'arithmetic'
  | 'power'
  | 'square-cube'
  | 'fraction'
  | 'divisibility'
  | 'life-sense'
  | 'grammar-judgment'

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
  {
    id: 'cumsum-easy',
    category: 'arithmetic',
    label: '累加/减数 · 简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '30 秒 · 个位连加减（3～4 个数，如 7+2−5+1）· 4 选项 · 对 +10 / 错 -20 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'cumsum-hard',
    category: 'arithmetic',
    label: '累加/减数 · 复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 15,
    wrongDelta: -30,
    maxScore: 100,
    desc: '40 秒 · 个位连加减（4～5 个数）· 强干扰（错位加减/近邻）· 5 选项 · 对 +15 / 错 -30 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'threedigit-easy',
    category: 'arithmetic',
    label: '三位数加减法 · 简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '30 秒 · 三位数加减 · 干扰项个位与正解一致 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'threedigit-hard',
    category: 'arithmetic',
    label: '三位数加减法 · 复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 16,
    wrongDelta: -32,
    maxScore: 100,
    desc: '40 秒 · 三位数加减（含进退位）· 强干扰且个位一致 · 5 选项 · 对 +16 / 错 -32 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'pct-addsub-easy',
    category: 'arithmetic',
    label: '百分比加减运算 · 简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '30 秒 · 百分数加减（如 35%+28%）· 近邻/错位加减干扰 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'pct-addsub-hard',
    category: 'arithmetic',
    label: '百分比加减运算 · 复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 16,
    wrongDelta: -32,
    maxScore: 100,
    desc: '40 秒 · 百分数加减（更大数字/易错位）· 强干扰 · 5 选项 · 对 +16 / 错 -32 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'mulcalc-easy',
    category: 'arithmetic',
    label: '乘法计算 · 简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -16,
    maxScore: 100,
    desc: '30 秒 · 两位数 × 一位数 · 干扰项个位与正解一致 · 4 选项 · 对 +8 / 错 -16 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'mulcalc-hard',
    category: 'arithmetic',
    label: '乘法计算 · 复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 13,
    wrongDelta: -26,
    maxScore: 100,
    desc: '40 秒 · 三位数 × 一位数 · 强干扰且个位一致 · 5 选项 · 对 +13 / 错 -26 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'mixchain-easy',
    category: 'arithmetic',
    label: '累加/减数（乘除）· 简单题',
    durationSec: 30,
    optionCount: 4,
    correctDelta: 12,
    wrongDelta: -24,
    maxScore: 100,
    desc: '30 秒 · 个位乘 + 十位÷个位，再连加减（如 3×4−24÷6+2）· 4 选项 · 对 +12 / 错 −24 · 对 +1 秒 / 错 −1 秒',
  },
  {
    id: 'mixchain-hard',
    category: 'arithmetic',
    label: '累加/减数（乘除）· 复杂题',
    durationSec: 40,
    optionCount: 5,
    correctDelta: 16,
    wrongDelta: -32,
    maxScore: 100,
    desc: '40 秒 · 两组乘+一组除 或 两组除+一组乘，再连加减 · 强干扰 · 5 选项 · 对 +16 / 错 −32 · 对 +1 秒 / 错 −1 秒',
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

export const MENTAL_MATH_LIFE_SENSE_MODES: MentalMathModeConfig[] = LIFE_SENSE_MODES.map((m) => ({
  ...m,
  category: 'life-sense' as const,
}))

export const MENTAL_MATH_GRAMMAR_JUDGMENT_MODES: MentalMathModeConfig[] = GRAMMAR_JUDGMENT_MODES.map(
  (m) => ({
    ...m,
    category: 'grammar-judgment' as const,
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

/** 四则口算 + 2 的次幂 + 平方/立方 + 估算分数 + 整除及其性质 + 生活常识 + 语法判断全部模式 */
export const MENTAL_MATH_MODES: MentalMathModeConfig[] = [
  ...MENTAL_MATH_ARITHMETIC_MODES,
  ...MENTAL_MATH_POWER_MODES,
  ...MENTAL_MATH_SQUARE_CUBE_MODES,
  ...MENTAL_MATH_FRACTION_MODES,
  ...MENTAL_MATH_DIVISIBILITY_MODES,
  ...MENTAL_MATH_LIFE_SENSE_MODES,
  ...MENTAL_MATH_GRAMMAR_JUDGMENT_MODES,
]

export type MentalMathQuestion = {
  id: number
  expression: string
  correctAnswer: MentalMathAnswerValue
  options: MentalMathAnswerValue[]
  correctIndex: number
  /** 可选错因：结算页展示，作答过程中不展示 */
  explanation?: string
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
  explanation?: string
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

export function isLifeSensePracticeMode(mode: MentalMathMode): mode is LifeSenseMode {
  return mode === 'life-sense-easy' || mode === 'life-sense-normal' || mode === 'life-sense-hard'
}

export function isGrammarJudgmentPracticeMode(mode: MentalMathMode): mode is GrammarJudgmentMode {
  return (
    mode === 'grammar-judgment-easy' ||
    mode === 'grammar-judgment-normal' ||
    mode === 'grammar-judgment-hard'
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

function isCumsumMode(mode: MentalMathMode): mode is 'cumsum-easy' | 'cumsum-hard' {
  return mode === 'cumsum-easy' || mode === 'cumsum-hard'
}

function isThreeDigitMode(mode: MentalMathMode): mode is 'threedigit-easy' | 'threedigit-hard' {
  return mode === 'threedigit-easy' || mode === 'threedigit-hard'
}

function isPctAddSubMode(mode: MentalMathMode): mode is 'pct-addsub-easy' | 'pct-addsub-hard' {
  return mode === 'pct-addsub-easy' || mode === 'pct-addsub-hard'
}

function isMulCalcMode(mode: MentalMathMode): mode is 'mulcalc-easy' | 'mulcalc-hard' {
  return mode === 'mulcalc-easy' || mode === 'mulcalc-hard'
}

function isMixChainMode(mode: MentalMathMode): mode is 'mixchain-easy' | 'mixchain-hard' {
  return mode === 'mixchain-easy' || mode === 'mixchain-hard'
}

/** 强制与正解相同的个位（负值按绝对值改个位后再还原符号） */
function forceSameOnesDigit(value: number, onesDigit: number): number {
  const ones = ((onesDigit % 10) + 10) % 10
  const neg = value < 0
  const abs = Math.trunc(Math.abs(value) / 10) * 10 + ones
  return neg ? -abs : abs
}

function pickThreeDigit(hard: boolean): number {
  if (hard) return randInt(100, 999)
  // 简单：偏小、少极端进退位
  return randInt(100, 599)
}

/** 三位数加减；干扰项个位与正确答案保持一致 */
function generateThreeDigitQuestion(
  mode: 'threedigit-easy' | 'threedigit-hard',
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const hard = mode === 'threedigit-hard'
  let a = 0
  let b = 0
  let op: '+' | '-' = '+'
  let correctAnswer = 0

  for (let attempt = 0; attempt < 40; attempt++) {
    a = pickThreeDigit(hard)
    b = pickThreeDigit(hard)
    op = Math.random() < 0.55 ? '+' : '-'
    if (op === '-') {
      if (a === b) continue
      if (a < b) {
        const t = a
        a = b
        b = t
      }
      // 复杂题提高「需退位」比例
      if (hard && a % 10 >= b % 10 && Math.random() < 0.55) {
        const onesA = a % 10
        const onesB = randInt(onesA + 1, 9)
        b = Math.trunc(b / 10) * 10 + onesB
        if (b < 100 || b > 999 || a <= b) continue
      }
    } else if (hard && a % 10 + (b % 10) < 10 && Math.random() < 0.5) {
      // 复杂题提高「个位进位」比例
      const onesA = a % 10
      const onesB = randInt(10 - onesA, 9)
      b = Math.trunc(b / 10) * 10 + onesB
      if (b < 100 || b > 999) continue
    }
    correctAnswer = op === '+' ? a + b : a - b
    if (correctAnswer < 0) continue
    break
  }

  const expression = op === '+' ? `${a} + ${b} = ?` : `${a} − ${b} = ?`
  const wrong = distinctThreeDigitWrongAnswers(a, b, op, correctAnswer, optionCount - 1)
  const options: number[] = [...wrong, correctAnswer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctAnswer)
  return {
    id,
    expression,
    correctAnswer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function distinctThreeDigitWrongAnswers(
  a: number,
  b: number,
  op: '+' | '-',
  correct: number,
  count: number,
): number[] {
  const ones = ((correct % 10) + 10) % 10
  const scored: { value: number; priority: number }[] = []
  const seen = new Set<number>([correct])

  const offer = (raw: number, priority: number) => {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) return
    const value = forceSameOnesDigit(raw, ones)
    if (value === correct || seen.has(value)) return
    // 结果量级仍像三位数加减，避免离谱
    if (value < 0 || value > 1998) return
    seen.add(value)
    scored.push({ value, priority })
  }

  // 加减错位
  if (op === '+') offer(a - b, 0)
  else offer(a + b, 0)
  offer(b - a, 1)
  offer(Math.abs(a - b), 1)

  // 进退位常见错：±10 / ±100（个位强制对齐后仍很近）
  for (const d of [10, 20, 30, 100, 200, 110, 90]) {
    offer(correct + d, d <= 30 ? 0 : 1)
    offer(correct - d, d <= 30 ? 0 : 1)
  }

  // 某一位算错：十位或百位 ±1（再对齐个位）
  offer(correct + 10, 0)
  offer(correct - 10, 0)
  offer(correct + 100, 1)
  offer(correct - 100, 1)

  // 交换加减数再算
  if (op === '+') offer(b + a, 2)
  else if (b > a) offer(b - a, 1)

  scored.sort((x, y) => {
    if (x.priority !== y.priority) return x.priority - y.priority
    return Math.abs(x.value - correct) - Math.abs(y.value - correct)
  })

  const wrong: number[] = []
  for (const item of scored) {
    if (wrong.length >= count) break
    wrong.push(item.value)
  }

  for (let step = 1; wrong.length < count && step <= 40; step++) {
    for (const sign of [-1, 1]) {
      const raw = correct + sign * step * 10
      const value = forceSameOnesDigit(raw, ones)
      if (value === correct || seen.has(value) || value < 0 || value > 1998) continue
      seen.add(value)
      wrong.push(value)
      if (wrong.length >= count) break
    }
  }

  return wrong
}

/** 百分比加减：选项带 %；干扰为近邻与加减错位 */
function generatePctAddSubQuestion(
  mode: 'pct-addsub-easy' | 'pct-addsub-hard',
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const hard = mode === 'pct-addsub-hard'
  let a = 0
  let b = 0
  let op: '+' | '-' = '+'
  let correct = 0

  for (let attempt = 0; attempt < 40; attempt++) {
    if (hard) {
      a = randInt(15, 95)
      b = randInt(8, 85)
    } else {
      a = randInt(5, 60)
      b = randInt(3, 45)
    }
    op = Math.random() < 0.55 ? '+' : '-'
    if (op === '-') {
      if (a === b) continue
      if (a < b) {
        const t = a
        a = b
        b = t
      }
      correct = a - b
    } else {
      correct = a + b
      // 简单题结果别过大；复杂题允许超过 100 以增加干扰
      if (!hard && correct > 100) continue
      if (hard && correct > 160) continue
    }
    if (correct < 0) continue
    break
  }

  const expression = op === '+' ? `${a}% + ${b}% = ?` : `${a}% − ${b}% = ?`
  const wrongNums = distinctPctAddSubWrongAnswers(a, b, op, correct, optionCount - 1)
  const correctLabel = `${correct}%`
  const options: string[] = [...wrongNums.map((n) => `${n}%`), correctLabel]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctLabel)
  return {
    id,
    expression,
    correctAnswer: correctLabel,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function distinctPctAddSubWrongAnswers(
  a: number,
  b: number,
  op: '+' | '-',
  correct: number,
  count: number,
): number[] {
  const scored: { value: number; priority: number }[] = []
  const seen = new Set<number>([correct])

  const offer = (value: number, priority: number) => {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return
    if (value === correct || seen.has(value)) return
    if (value < 0 || value > 200) return
    seen.add(value)
    scored.push({ value, priority })
  }

  // 加减错位
  if (op === '+') offer(a - b, 0)
  else offer(a + b, 0)
  offer(Math.abs(a - b), 1)
  offer(b - a, 2)

  // 近邻百分数
  for (const d of [1, 2, 3, 5, 10]) {
    offer(correct + d, d <= 2 ? 0 : 1)
    offer(correct - d, d <= 2 ? 0 : 1)
  }

  // 把其中一个百分数算错 ±1 / ±2 / ±5 / ±10
  for (const d of [1, 2, 5, 10]) {
    if (op === '+') {
      offer(a + d + b, 1)
      offer(a + (b + d), 1)
      offer(a - d + b, 1)
      offer(a + (b - d), 1)
    } else {
      offer(a - d - b, 1)
      offer(a - (b + d), 1)
      offer(a + d - b, 1)
      offer(a - (b - d), 1)
    }
  }

  scored.sort((x, y) => {
    if (x.priority !== y.priority) return x.priority - y.priority
    return Math.abs(x.value - correct) - Math.abs(y.value - correct)
  })

  const wrong: number[] = []
  for (const item of scored) {
    if (wrong.length >= count) break
    wrong.push(item.value)
  }

  for (let d = 4; wrong.length < count && d <= 30; d++) {
    for (const sign of [-1, 1]) {
      const v = correct + sign * d
      if (v === correct || seen.has(v) || v < 0 || v > 200) continue
      seen.add(v)
      wrong.push(v)
      if (wrong.length >= count) break
    }
  }

  return wrong
}

/** 乘法计算：简单两位数×一位数，复杂三位数×一位数；干扰个位与正解一致 */
function generateMulCalcQuestion(
  mode: 'mulcalc-easy' | 'mulcalc-hard',
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const hard = mode === 'mulcalc-hard'
  const multiplicant = hard ? randInt(100, 999) : randInt(12, 99)
  const multiplier = randInt(2, 9)
  const correctAnswer = multiplicant * multiplier
  const expression = `${multiplicant} × ${multiplier} = ?`
  const wrong = distinctMulCalcWrongAnswers(
    multiplicant,
    multiplier,
    correctAnswer,
    optionCount - 1,
    hard,
  )
  const options: number[] = [...wrong, correctAnswer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctAnswer)
  return {
    id,
    expression,
    correctAnswer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function distinctMulCalcWrongAnswers(
  a: number,
  b: number,
  correct: number,
  count: number,
  hard: boolean,
): number[] {
  const ones = ((correct % 10) + 10) % 10
  const maxVal = hard ? 999 * 9 : 99 * 9
  const scored: { value: number; priority: number }[] = []
  const seen = new Set<number>([correct])

  const offer = (raw: number, priority: number) => {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) return
    const value = forceSameOnesDigit(raw, ones)
    if (value === correct || seen.has(value)) return
    if (value <= 0 || value > maxVal + 200) return
    seen.add(value)
    scored.push({ value, priority })
  }

  // 乘数 ±1
  for (const db of [-1, 1, -2, 2]) {
    const nb = b + db
    if (nb >= 2 && nb <= 9) offer(a * nb, Math.abs(db) === 1 ? 0 : 1)
  }

  // 被乘数 ±1 / ±10 / ±100（常见口算位移错）
  for (const da of [-1, 1, -2, 2, -10, 10, -20, 20]) {
    const na = a + da
    if (hard ? na >= 100 && na <= 999 : na >= 10 && na <= 99) {
      offer(na * b, Math.abs(da) <= 2 ? 0 : 1)
    }
  }
  if (hard) {
    for (const da of [-100, 100, -200, 200]) {
      const na = a + da
      if (na >= 100 && na <= 999) offer(na * b, 1)
    }
  }

  // 只乘个位 / 只乘十位（漏乘另一位）
  const onesA = a % 10
  const tensA = Math.trunc(a / 10) % 10
  const hundredsA = hard ? Math.trunc(a / 100) : 0
  offer(onesA * b, 2)
  offer(tensA * b * 10, 1)
  if (hard) offer(hundredsA * b * 100, 1)
  offer((Math.trunc(a / 10) * 10) * b, 1) // 个位当 0
  offer((a - onesA + ((onesA + 1) % 10)) * b, 1)

  // 进位相关近邻：±10 / ±20 / ±100（再对齐个位）
  for (const d of [10, 20, 30, 100, 200]) {
    offer(correct + d, d <= 30 ? 0 : 1)
    offer(correct - d, d <= 30 ? 0 : 1)
  }

  scored.sort((x, y) => {
    if (x.priority !== y.priority) return x.priority - y.priority
    return Math.abs(x.value - correct) - Math.abs(y.value - correct)
  })

  const wrong: number[] = []
  for (const item of scored) {
    if (wrong.length >= count) break
    wrong.push(item.value)
  }

  for (let step = 1; wrong.length < count && step <= 50; step++) {
    for (const sign of [-1, 1]) {
      const value = forceSameOnesDigit(correct + sign * step * 10, ones)
      if (value === correct || seen.has(value) || value <= 0 || value > maxVal + 200) continue
      seen.add(value)
      wrong.push(value)
      if (wrong.length >= count) break
    }
  }

  return wrong
}

type MixChainPiece =
  | { kind: 'mul'; text: string; value: number; factors: [number, number] }
  | { kind: 'div'; text: string; value: number; dividend: number; divisor: number }
  | { kind: 'ones'; text: string; value: number }

function pickOnesDigit(): number {
  return randInt(2, 9)
}

function pickMulPiece(): MixChainPiece {
  const a = pickOnesDigit()
  const b = pickOnesDigit()
  return { kind: 'mul', text: `${a} × ${b}`, value: a * b, factors: [a, b] }
}

/** 十位数 ÷ 个位数，整除 */
function pickDivPiece(): MixChainPiece {
  for (let t = 0; t < 40; t++) {
    const d = pickOnesDigit()
    const q = randInt(2, Math.min(12, Math.floor(99 / d)))
    const c = d * q
    if (c >= 10 && c <= 99) {
      return { kind: 'div', text: `${c} ÷ ${d}`, value: q, dividend: c, divisor: d }
    }
  }
  return { kind: 'div', text: `36 ÷ 6`, value: 6, dividend: 36, divisor: 6 }
}

function pickOnesPiece(): MixChainPiece {
  const e = pickOnesDigit()
  return { kind: 'ones', text: String(e), value: e }
}

function evalSignedPieces(pieces: MixChainPiece[], ops: Array<'+' | '-'>): number {
  let acc = pieces[0]!.value
  for (let i = 0; i < ops.length; i++) {
    const v = pieces[i + 1]!.value
    acc = ops[i] === '+' ? acc + v : acc - v
  }
  return acc
}

function formatMixChainExpression(pieces: MixChainPiece[], ops: Array<'+' | '-'>): string {
  let expr = pieces[0]!.text
  for (let i = 0; i < ops.length; i++) {
    expr += ops[i] === '+' ? ` + ${pieces[i + 1]!.text}` : ` − ${pieces[i + 1]!.text}`
  }
  return `${expr} = ?`
}

/** 累加/减数（乘除）：个位乘、十位÷个位，再连加减 */
function generateMixChainQuestion(
  mode: 'mixchain-easy' | 'mixchain-hard',
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const hard = mode === 'mixchain-hard'
  let pieces: MixChainPiece[] = []

  if (!hard) {
    // 简单：乘法一组 + 除法一组 + 个位一项（对齐 a×b−c÷d−e）
    pieces = [pickMulPiece(), pickDivPiece(), pickOnesPiece()]
  } else if (Math.random() < 0.5) {
    // 复杂：乘法两组 + 除法一组
    pieces = [pickMulPiece(), pickMulPiece(), pickDivPiece()]
  } else {
    // 复杂：除法两组 + 乘法一组
    pieces = [pickMulPiece(), pickDivPiece(), pickDivPiece()]
  }

  shuffleInPlace(pieces)

  const ops: Array<'+' | '-'> = []
  for (let i = 1; i < pieces.length; i++) {
    ops.push(Math.random() < 0.5 ? '+' : '-')
  }
  if (ops.length >= 2 && ops.every((o) => o === ops[0])) {
    ops[randInt(0, ops.length - 1)] = ops[0] === '+' ? '-' : '+'
  }

  const correctAnswer = evalSignedPieces(pieces, ops)
  const wrong = distinctMixChainWrongAnswers(pieces, ops, correctAnswer, optionCount - 1)
  const options: number[] = [...wrong, correctAnswer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctAnswer)
  return {
    id,
    expression: formatMixChainExpression(pieces, ops),
    correctAnswer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function distinctMixChainWrongAnswers(
  pieces: MixChainPiece[],
  ops: Array<'+' | '-'>,
  correct: number,
  count: number,
): number[] {
  const scored: { value: number; priority: number }[] = []
  const seen = new Set<number>([correct])

  const offer = (value: number, priority: number) => {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return
    if (value === correct || seen.has(value)) return
    if (Math.abs(value) > 400) return
    seen.add(value)
    scored.push({ value, priority })
  }

  // 单步加减错位
  for (let i = 0; i < ops.length; i++) {
    const flipped = ops.map((o, j) => (j === i ? (o === '+' ? '-' : '+') : o))
    offer(evalSignedPieces(pieces, flipped), 0)
  }

  // 某一乘积/商算错 ±1、±2
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i]!
    for (const delta of [-2, -1, 1, 2]) {
      const alt = pieces.map((x, j) =>
        j === i ? ({ ...x, value: x.value + delta } as MixChainPiece) : x,
      )
      offer(evalSignedPieces(alt, ops), Math.abs(delta) === 1 ? 0 : 1)
    }
    if (p.kind === 'mul') {
      const [a, b] = p.factors
      // 加减错位成 a+b / a−b
      for (const wrongVal of [a + b, Math.abs(a - b), a * (b + 1), (a + 1) * b]) {
        const alt = pieces.map((x, j) =>
          j === i ? ({ ...x, value: wrongVal } as MixChainPiece) : x,
        )
        offer(evalSignedPieces(alt, ops), 1)
      }
    }
    if (p.kind === 'div') {
      // 商差 1，或误用余数/除数
      for (const wrongVal of [p.value + 1, p.value - 1, p.divisor, p.dividend % 10]) {
        const alt = pieces.map((x, j) =>
          j === i ? ({ ...x, value: wrongVal } as MixChainPiece) : x,
        )
        offer(evalSignedPieces(alt, ops), 1)
      }
    }
  }

  // 近邻
  for (const d of [1, 2, 3, 4, 5]) {
    offer(correct + d, d <= 2 ? 0 : 1)
    offer(correct - d, d <= 2 ? 0 : 1)
  }

  scored.sort((x, y) => {
    if (x.priority !== y.priority) return x.priority - y.priority
    return Math.abs(x.value - correct) - Math.abs(y.value - correct)
  })

  const wrong: number[] = []
  for (const item of scored) {
    if (wrong.length >= count) break
    wrong.push(item.value)
  }

  for (let d = 6; wrong.length < count && d <= 40; d++) {
    for (const sign of [-1, 1]) {
      const v = correct + sign * d
      if (seen.has(v)) continue
      seen.add(v)
      wrong.push(v)
      if (wrong.length >= count) break
    }
  }

  return wrong
}

function evalCumsumChain(digits: number[], ops: Array<'+' | '-'>): number {
  let acc = digits[0]!
  for (let i = 0; i < ops.length; i++) {
    const d = digits[i + 1]!
    acc = ops[i] === '+' ? acc + d : acc - d
  }
  return acc
}

function formatCumsumExpression(digits: number[], ops: Array<'+' | '-'>): string {
  let expr = String(digits[0])
  for (let i = 0; i < ops.length; i++) {
    expr += ops[i] === '+' ? ` + ${digits[i + 1]}` : ` − ${digits[i + 1]}`
  }
  return `${expr} = ?`
}

/** 累加/减数：个位连加减；干扰侧重近邻与单步符号错位 */
function generateCumsumQuestion(
  mode: 'cumsum-easy' | 'cumsum-hard',
  id: number,
  optionCount: number,
): MentalMathQuestion {
  const termCount =
    mode === 'cumsum-easy' ? randInt(3, 4) : randInt(4, 5)
  const digits: number[] = []
  for (let i = 0; i < termCount; i++) digits.push(randInt(1, 9))

  const ops: Array<'+' | '-'> = []
  for (let i = 1; i < termCount; i++) {
    ops.push(Math.random() < 0.5 ? '+' : '-')
  }
  // 至少含一种加、一种减，避免变成纯连加/连减
  if (ops.length >= 2 && ops.every((o) => o === ops[0])) {
    ops[randInt(0, ops.length - 1)] = ops[0] === '+' ? '-' : '+'
  }

  const correctAnswer = evalCumsumChain(digits, ops)
  const wrong = distinctCumsumWrongAnswers(digits, ops, correctAnswer, optionCount - 1)
  const options: number[] = [...wrong, correctAnswer]
  shuffleInPlace(options)
  const correctIndex = options.findIndex((v) => v === correctAnswer)
  return {
    id,
    expression: formatCumsumExpression(digits, ops),
    correctAnswer,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

function distinctCumsumWrongAnswers(
  digits: number[],
  ops: Array<'+' | '-'>,
  correct: number,
  count: number,
): number[] {
  const scored: { value: number; priority: number }[] = []
  const seen = new Set<number>([correct])

  const offer = (value: number, priority: number) => {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return
    if (seen.has(value)) return
    seen.add(value)
    scored.push({ value, priority })
  }

  // 单步加减错位：某一处 +/− 反了（等价于答案偏移 ±2×该数）
  for (let i = 0; i < ops.length; i++) {
    const flipped = ops.map((o, j) => (j === i ? (o === '+' ? '-' : '+') : o))
    offer(evalCumsumChain(digits, flipped), 0)
  }

  // 连续两步同时反号（更易误判）
  if (ops.length >= 2) {
    for (let i = 0; i < ops.length - 1; i++) {
      const flipped = ops.map((o, j) =>
        j === i || j === i + 1 ? (o === '+' ? '-' : '+') : o,
      )
      offer(evalCumsumChain(digits, flipped), 1)
    }
  }

  // 全加 / 全减
  offer(
    digits.reduce((a, b) => a + b, 0),
    2,
  )
  offer(
    digits.slice(1).reduce((a, b) => a - b, digits[0]!),
    2,
  )

  // 漏算最后一项 / 多算最后一项
  if (digits.length >= 3) {
    const last = digits[digits.length - 1]!
    const lastOp = ops[ops.length - 1]!
    offer(lastOp === '+' ? correct - last : correct + last, 1)
  }

  // 某一位数 ±1 后按原符号重算
  for (let i = 0; i < digits.length; i++) {
    for (const delta of [-1, 1]) {
      const next = digits[i]! + delta
      if (next < 1 || next > 9) continue
      const alt = digits.slice()
      alt[i] = next
      offer(evalCumsumChain(alt, ops), 2)
    }
  }

  // 近邻答案（强干扰）
  for (let d = 1; d <= 4; d++) {
    offer(correct + d, d === 1 ? 0 : 1)
    offer(correct - d, d === 1 ? 0 : 1)
  }

  scored.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return Math.abs(a.value - correct) - Math.abs(b.value - correct)
  })

  const wrong: number[] = []
  for (const item of scored) {
    if (wrong.length >= count) break
    wrong.push(item.value)
  }

  for (let d = 5; wrong.length < count && d <= 12; d++) {
    for (const sign of [-1, 1]) {
      const v = correct + sign * d
      if (seen.has(v)) continue
      seen.add(v)
      wrong.push(v)
      if (wrong.length >= count) break
    }
  }

  return wrong
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

  if (isLifeSensePracticeMode(mode)) {
    return generateLifeSenseQuestion(mode, id, optionCount, avoidFingerprints)
  }

  if (isGrammarJudgmentPracticeMode(mode)) {
    return generateGrammarJudgmentQuestion(mode, id, optionCount, avoidFingerprints)
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

  if (isCumsumMode(mode)) {
    return generateCumsumQuestion(mode, id, optionCount)
  }

  if (isThreeDigitMode(mode)) {
    return generateThreeDigitQuestion(mode, id, optionCount)
  }

  if (isPctAddSubMode(mode)) {
    return generatePctAddSubQuestion(mode, id, optionCount)
  }

  if (isMulCalcMode(mode)) {
    return generateMulCalcQuestion(mode, id, optionCount)
  }

  if (isMixChainMode(mode)) {
    return generateMixChainQuestion(mode, id, optionCount)
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
