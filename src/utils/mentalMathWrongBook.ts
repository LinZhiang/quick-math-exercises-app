import { ref } from 'vue'

/** 支持错题集的口算分区（与侧栏 id 对齐） */
export type MentalMathWrongSection =
  | 'power'
  | 'square-cube'
  | 'fraction'
  | 'divisibility'
  | 'life-sense'
  | 'grammar-judgment'
  | 'twentyfour'
  | 'data-analysis'
  | 'data-analysis-growth'
  | 'data-analysis-growth-inter-year'
  | 'data-analysis-growth-avg-annual'
  | 'data-analysis-growth-mixed'
  | 'data-analysis-proportion-basic'
  | 'data-analysis-proportion-base'
  | 'data-analysis-average-basic'
  | 'data-analysis-average-base'
  | 'data-analysis-multiple-basic'
  | 'data-analysis-multiple-base'
  | 'data-analysis-index'
  | 'data-analysis-pull'
  | 'data-analysis-surplus'
  | 'op-skill-div-judge'
  | 'op-skill-prime-comp'
  | 'op-skill-gcd-lcm'
  | 'op-skill-ratio-mult'
  | 'op-skill-rem-prop'
  | 'op-skill-sub-elim'
  | 'op-skill-eq-method'
  | 'op-skill-spec-val'
  | 'op-skill-ratio-method'
  | 'op-skill-cross-method'

export type MentalMathWrongRecord = {
  fingerprint: string
  section: MentalMathWrongSection
  modeId: string
  /** 题面：算式 / 设问 / 二十四点提示 */
  expression: string
  correctAnswer: string
  chosenAnswer: string
  options?: string[]
  explanation?: string
  wrongCount: number
  updatedAt: string
}

const STORAGE_KEY = 'mental-math-wrong-book-v1'

/** 错题变更时递增，供菜单内错题集刷新 */
export const mentalMathWrongBookTick = ref(0)

function notifyChanged() {
  mentalMathWrongBookTick.value += 1
}

function readAll(): MentalMathWrongRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is MentalMathWrongRecord =>
        !!r &&
        typeof r === 'object' &&
        typeof (r as MentalMathWrongRecord).fingerprint === 'string' &&
        typeof (r as MentalMathWrongRecord).section === 'string',
    )
  } catch {
    return []
  }
}

function writeAll(rows: MentalMathWrongRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  notifyChanged()
}

export const MENTAL_MATH_WRONG_SECTION_LABELS: Record<MentalMathWrongSection, string> = {
  power: '2 的 n 次幂',
  'square-cube': '平方与立方',
  fraction: '估算分数',
  divisibility: '整除及其性质',
  'life-sense': '生活常识',
  'grammar-judgment': '语法判断',
  twentyfour: '二十四点',
  'data-analysis': '资料分析 · 百分数与百分点',
  'data-analysis-growth': '资料分析 · 增长·一般增长',
  'data-analysis-growth-inter-year': '资料分析 · 增长·隔年增长',
  'data-analysis-growth-avg-annual': '资料分析 · 增长·年均增长',
  'data-analysis-growth-mixed': '资料分析 · 增长·混合增长',
  'data-analysis-proportion-basic': '资料分析 · 比重·基本公式',
  'data-analysis-proportion-base': '资料分析 · 比重·基期比重',
  'data-analysis-average-basic': '资料分析 · 平均数·基本公式',
  'data-analysis-average-base': '资料分析 · 平均数·基期平均数',
  'data-analysis-multiple-basic': '资料分析 · 倍数·基本公式',
  'data-analysis-multiple-base': '资料分析 · 倍数·基期与增长量倍数',
  'data-analysis-index': '资料分析 · 指数',
  'data-analysis-pull': '资料分析 · 拉动增长和比例',
  'data-analysis-surplus': '资料分析 · 顺差与逆差',
  'op-skill-div-judge': '运算技巧 · 整除的判定',
  'op-skill-prime-comp': '运算技巧 · 质数与合数',
  'op-skill-gcd-lcm': '运算技巧 · 公因数与公倍数',
  'op-skill-ratio-mult': '运算技巧 · 由比例判定倍数',
  'op-skill-rem-prop': '运算技巧 · 余数及其性质',
  'op-skill-sub-elim': '运算技巧 · 代入排除法',
  'op-skill-eq-method': '运算技巧 · 方程法',
  'op-skill-spec-val': '运算技巧 · 特值法',
  'op-skill-ratio-method': '运算技巧 · 比例法',
  'op-skill-cross-method': '运算技巧 · 十字交叉法',
}

/** 模式 id → 错题分区；不在集合内则不记错题本 */
export function mentalMathModeToWrongSection(modeId: string): MentalMathWrongSection | null {
  if (modeId === 'power-easy' || modeId === 'power-hard') return 'power'
  if (modeId === 'square-cube-easy' || modeId === 'square-cube-hard') return 'square-cube'
  if (modeId === 'fraction-easy' || modeId === 'fraction-hard') return 'fraction'
  if (
    modeId === 'divisibility-easy' ||
    modeId === 'divisibility-distractor' ||
    modeId === 'divisibility-normal' ||
    modeId === 'divisibility-hard'
  ) {
    return 'divisibility'
  }
  if (
    modeId === 'life-sense-easy' ||
    modeId === 'life-sense-normal' ||
    modeId === 'life-sense-hard'
  ) {
    return 'life-sense'
  }
  if (
    modeId === 'grammar-judgment-easy' ||
    modeId === 'grammar-judgment-normal' ||
    modeId === 'grammar-judgment-hard' ||
    modeId === 'circle-grammar-easy' ||
    modeId === 'circle-grammar-hard' ||
    modeId === 'shorten-sentence-easy' ||
    modeId === 'shorten-sentence-hard'
  ) {
    return 'grammar-judgment'
  }
  if (modeId === 'twentyfour-easy' || modeId === 'twentyfour-hard') return 'twentyfour'
  if (modeId === 'data-analysis-easy' || modeId === 'data-analysis-hard') return 'data-analysis'
  if (modeId === 'data-analysis-growth-easy' || modeId === 'data-analysis-growth-hard') {
    return 'data-analysis-growth'
  }
  if (
    modeId === 'data-analysis-growth-inter-year-easy' ||
    modeId === 'data-analysis-growth-inter-year-hard'
  ) {
    return 'data-analysis-growth-inter-year'
  }
  if (
    modeId === 'data-analysis-growth-avg-annual-easy' ||
    modeId === 'data-analysis-growth-avg-annual-hard'
  ) {
    return 'data-analysis-growth-avg-annual'
  }
  if (
    modeId === 'data-analysis-growth-mixed-easy' ||
    modeId === 'data-analysis-growth-mixed-hard'
  ) {
    return 'data-analysis-growth-mixed'
  }
  if (
    modeId === 'data-analysis-proportion-basic-easy' ||
    modeId === 'data-analysis-proportion-basic-hard'
  ) {
    return 'data-analysis-proportion-basic'
  }
  if (
    modeId === 'data-analysis-proportion-base-easy' ||
    modeId === 'data-analysis-proportion-base-hard'
  ) {
    return 'data-analysis-proportion-base'
  }
  if (
    modeId === 'data-analysis-average-basic-easy' ||
    modeId === 'data-analysis-average-basic-hard'
  ) {
    return 'data-analysis-average-basic'
  }
  if (
    modeId === 'data-analysis-average-base-easy' ||
    modeId === 'data-analysis-average-base-hard'
  ) {
    return 'data-analysis-average-base'
  }
  if (
    modeId === 'data-analysis-multiple-basic-easy' ||
    modeId === 'data-analysis-multiple-basic-hard'
  ) {
    return 'data-analysis-multiple-basic'
  }
  if (
    modeId === 'data-analysis-multiple-base-easy' ||
    modeId === 'data-analysis-multiple-base-hard'
  ) {
    return 'data-analysis-multiple-base'
  }
  if (modeId === 'data-analysis-index-easy' || modeId === 'data-analysis-index-hard') {
    return 'data-analysis-index'
  }
  if (modeId === 'data-analysis-pull-easy' || modeId === 'data-analysis-pull-hard') {
    return 'data-analysis-pull'
  }
  if (modeId === 'data-analysis-surplus-easy' || modeId === 'data-analysis-surplus-hard') {
    return 'data-analysis-surplus'
  }
  if (
    modeId === 'op-skill-div-judge-easy' ||
    modeId === 'op-skill-div-judge-medium' ||
    modeId === 'op-skill-div-judge-hard'
  ) {
    return 'op-skill-div-judge'
  }
  if (
    modeId === 'op-skill-prime-comp-easy' ||
    modeId === 'op-skill-prime-comp-medium' ||
    modeId === 'op-skill-prime-comp-hard'
  ) {
    return 'op-skill-prime-comp'
  }
  if (
    modeId === 'op-skill-gcd-lcm-easy' ||
    modeId === 'op-skill-gcd-lcm-medium' ||
    modeId === 'op-skill-gcd-lcm-hard'
  ) {
    return 'op-skill-gcd-lcm'
  }
  if (
    modeId === 'op-skill-ratio-mult-easy' ||
    modeId === 'op-skill-ratio-mult-medium' ||
    modeId === 'op-skill-ratio-mult-hard'
  ) {
    return 'op-skill-ratio-mult'
  }
  if (
    modeId === 'op-skill-rem-prop-easy' ||
    modeId === 'op-skill-rem-prop-medium' ||
    modeId === 'op-skill-rem-prop-hard'
  ) {
    return 'op-skill-rem-prop'
  }
  if (
    modeId === 'op-skill-sub-elim-easy' ||
    modeId === 'op-skill-sub-elim-medium' ||
    modeId === 'op-skill-sub-elim-hard'
  ) {
    return 'op-skill-sub-elim'
  }
  if (
    modeId === 'op-skill-eq-method-easy' ||
    modeId === 'op-skill-eq-method-medium' ||
    modeId === 'op-skill-eq-method-hard'
  ) {
    return 'op-skill-eq-method'
  }
  if (modeId === 'op-skill-spec-val-easy' || modeId === 'op-skill-spec-val-hard') {
    return 'op-skill-spec-val'
  }
  if (
    modeId === 'op-skill-ratio-method-easy' ||
    modeId === 'op-skill-ratio-method-medium' ||
    modeId === 'op-skill-ratio-method-hard'
  ) {
    return 'op-skill-ratio-method'
  }
  if (
    modeId === 'op-skill-cross-method-easy' ||
    modeId === 'op-skill-cross-method-medium' ||
    modeId === 'op-skill-cross-method-hard'
  ) {
    return 'op-skill-cross-method'
  }
  return null
}

export function buildMentalMathWrongFingerprint(input: {
  section: MentalMathWrongSection
  modeId: string
  expression: string
  correctAnswer: string
}): string {
  return [
    input.section,
    input.modeId,
    input.expression.trim(),
    String(input.correctAnswer).trim(),
  ].join('\u001e')
}

export function listMentalMathWrongRecords(
  section?: MentalMathWrongSection,
): MentalMathWrongRecord[] {
  const all = readAll()
  if (!section) return all
  return all.filter((r) => r.section === section)
}

export function countMentalMathWrongRecords(section: MentalMathWrongSection): number {
  return listMentalMathWrongRecords(section).length
}

export function upsertMentalMathWrong(input: {
  modeId: string
  expression: string
  correctAnswer: string | number
  chosenAnswer: string | number
  options?: Array<string | number>
  explanation?: string
}) {
  const section = mentalMathModeToWrongSection(input.modeId)
  if (!section) return

  const correctAnswer = String(input.correctAnswer)
  const chosenAnswer = String(input.chosenAnswer)
  const expression = input.expression.trim()
  if (!expression) return

  const fingerprint = buildMentalMathWrongFingerprint({
    section,
    modeId: input.modeId,
    expression,
    correctAnswer,
  })

  const rows = readAll()
  const hit = rows.find((r) => r.fingerprint === fingerprint)
  const now = new Date().toISOString()
  if (hit) {
    hit.wrongCount = (hit.wrongCount ?? 0) + 1
    hit.updatedAt = now
    hit.chosenAnswer = chosenAnswer
    if (input.explanation) hit.explanation = input.explanation
    if (input.options?.length) hit.options = input.options.map(String)
  } else {
    rows.unshift({
      fingerprint,
      section,
      modeId: input.modeId,
      expression,
      correctAnswer,
      chosenAnswer,
      options: input.options?.map(String),
      explanation: input.explanation?.trim() || undefined,
      wrongCount: 1,
      updatedAt: now,
    })
  }
  writeAll(rows)
}

export function removeMentalMathWrong(fingerprint: string) {
  const rows = readAll().filter((r) => r.fingerprint !== fingerprint)
  writeAll(rows)
}

export function clearMentalMathWrongSection(section: MentalMathWrongSection) {
  const rows = readAll().filter((r) => r.section !== section)
  writeAll(rows)
}
