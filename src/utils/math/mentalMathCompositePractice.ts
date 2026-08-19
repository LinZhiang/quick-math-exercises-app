type AnswerValue = number | string

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickSign(): number {
  return Math.random() < 0.5 ? -1 : 1
}

function pickTens(): number {
  return pickSign() * randInt(10, 99)
}

function pickOnesNonZero(): number {
  return pickNonZero(-9, 9)
}

function pickNonZero(min: number, max: number): number {
  let n = randInt(min, max)
  while (n === 0) n = randInt(min, max)
  return n
}

function pickHundreds(): number {
  return pickSign() * randInt(100, 499)
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

function isTrivialDigitPair(a: number, b: number): boolean {
  return Math.abs(a) <= 9 && Math.abs(b) <= 9
}

export type CompositeBuilt = {
  expression: string
  answer: AnswerValue
  buildWrongOptions: (count: number) => AnswerValue[]
}

function formatMb(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return `${rounded.toFixed(2)}MB`
}

function formatKb(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return `${rounded.toFixed(1)}KB`
}

function collectDistinctOptions(
  correct: AnswerValue,
  count: number,
  candidates: AnswerValue[],
): AnswerValue[] {
  const wrong: AnswerValue[] = []
  const used = new Set<string>([String(correct)])

  for (const c of shuffle(candidates)) {
    if (wrong.length >= count) break
    const key = String(c)
    if (used.has(key)) continue
    used.add(key)
    wrong.push(c)
  }

  if (typeof correct === 'number') {
    for (let delta = 2; wrong.length < count && delta <= 12; delta++) {
      for (const sign of [-1, 1]) {
        const v = correct + sign * delta
        const key = String(v)
        if (used.has(key)) continue
        used.add(key)
        wrong.push(v)
        if (wrong.length >= count) break
      }
    }
  }

  return wrong
}

/** 考场风格：倍数/漏算因子类干扰（参考容量估算题选项分布） */
function examStyleMbWrongs(correctMb: number, count: number): string[] {
  const correct = formatMb(correctMb)
  const candidates: string[] = []
  const factors = [0.5, 2, 3, 4, 1.5, 2.5, 0.25, 5]
  for (const f of factors) {
    candidates.push(formatMb(correctMb * f))
  }
  candidates.push(formatMb(correctMb + 0.5), formatMb(correctMb - 0.3))
  return collectDistinctOptions(correct, count, candidates) as string[]
}

function examStyleNumberWrongs(correct: number, count: number): number[] {
  const candidates: number[] = []
  const factors = [0.5, 2, 3, 4, 1.5]
  for (const f of factors) {
    const v = Math.round(correct * f)
    if (Number.isFinite(v)) candidates.push(v)
  }
  for (let d = 2; d <= 8; d++) {
    candidates.push(correct + d, correct - d)
  }
  return collectDistinctOptions(correct, count, candidates) as number[]
}

/** 立体声音频容量：channels × kHz × (bits/8) × 秒 ÷ 1024 ≈ MB */
function buildAudioCapacityQuestion(): CompositeBuilt {
  const channels = 2
  const khz = [32, 40, 44, 48][randInt(0, 3)]!
  const bits = 16
  const seconds = [5, 8, 10, 12][randInt(0, 3)]!
  const bytesPerSample = bits / 8
  const correctMb = (channels * khz * bytesPerSample * seconds) / 1024

  const forgotStereo = (1 * khz * bytesPerSample * seconds) / 1024
  const bitsNotBytes = (channels * khz * bits * seconds) / 1024 / 1024
  const doubleK = (channels * khz * bytesPerSample * seconds * 2) / 1024

  return {
    expression: `一段立体声音频，采样频率 ${khz}kHz，量化位数 ${bits} 位，时长 ${seconds} 秒，其数据容量约为？`,
    answer: formatMb(correctMb),
    buildWrongOptions: (count) =>
      collectDistinctOptions(formatMb(correctMb), count, [
        formatMb(forgotStereo),
        formatMb(bitsNotBytes),
        formatMb(doubleK),
        ...examStyleMbWrongs(correctMb, count),
      ]),
  }
}

/** 多因子连乘（速算锁定量级） */
function buildMultiFactorProduct(): CompositeBuilt {
  const factors = [
    randInt(2, 5),
    randInt(2, 6),
    pickTens(),
    randInt(2, 4),
  ]
  const correct = factors.reduce((s, n) => s * n, 1)
  const expression = `${factors.join(' × ')} = ?`
  return {
    expression,
    answer: correct,
    buildWrongOptions: (count) => examStyleNumberWrongs(correct, count),
  }
}

/** 连除再乘：a ÷ b × c */
function buildDivMulChain(): CompositeBuilt {
  const b = pickOnesNonZero()
  let c = pickOnesNonZero()
  let quotient = pickTens()
  if (Math.abs(quotient) < 10) quotient = pickSign() * randInt(10, 40)
  const a = b * quotient
  const correct = quotient * c
  return {
    expression: `${a} ÷ ${b} × ${c} = ?`,
    answer: correct,
    buildWrongOptions: (count) => examStyleNumberWrongs(correct, count),
  }
}

/** 两积之和：a×b + c×d */
function buildSumOfProducts(): CompositeBuilt {
  const a = pickTens()
  const b = pickOnesNonZero()
  const c = pickTens()
  const d = pickOnesNonZero()
  const correct = a * b + c * d
  const onlyFirst = a * b
  const onlySecond = c * d
  return {
    expression: `${a} × ${b} + ${c} × ${d} = ?`,
    answer: correct,
    buildWrongOptions: (count) =>
      collectDistinctOptions(correct, count, [
        onlyFirst,
        onlySecond,
        ...examStyleNumberWrongs(correct, count),
      ]),
  }
}

/** 图像未压缩容量：宽×高×位深/8（KB） */
function buildImageSizeQuestion(): CompositeBuilt {
  const w = [800, 1024, 1280, 1920][randInt(0, 3)]!
  const h = [600, 768, 720, 1080][randInt(0, 3)]!
  const bits = [16, 24, 32][randInt(0, 2)]!
  const correctKb = (w * h * bits) / 8 / 1024
  const forgotBitsToBytes = (w * h * bits) / 1024
  const halfDepth = (w * h * (bits / 2)) / 8 / 1024

  return {
    expression: `一幅 ${w}×${h} 图像，${bits} 位色深，未压缩数据量约为？`,
    answer: formatKb(correctKb),
    buildWrongOptions: (count) =>
      collectDistinctOptions(formatKb(correctKb), count, [
        formatKb(forgotBitsToBytes),
        formatKb(halfDepth),
        formatKb(correctKb * 2),
        formatKb(correctKb * 0.5),
        formatKb(correctKb * 3),
      ]),
  }
}

const HARD_COMPOSITE_BUILDERS = [
  buildAudioCapacityQuestion,
  buildMultiFactorProduct,
  buildDivMulChain,
  buildSumOfProducts,
  buildImageSizeQuestion,
]

export function tryBuildHardCompositeQuestion(): CompositeBuilt | null {
  const builder = HARD_COMPOSITE_BUILDERS[randInt(0, HARD_COMPOSITE_BUILDERS.length - 1)]!
  return builder()
}

export function assertNonTrivialPair(a: number, b: number): boolean {
  return !isTrivialDigitPair(a, b)
}

/** 普通/高难两数运算：考场风格数值干扰（倍数、漏算因子等） */
export function buildExamStyleNumberWrongs(correct: number, count: number): number[] {
  return examStyleNumberWrongs(correct, count)
}
