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
  | 'op-highfreq-sum-diff-ratio'
  | 'op-highfreq-geometry'
  | 'op-highfreq-right-triangle'
  | 'op-highfreq-similar-triangle'
  | 'op-highfreq-coloring'
  | 'op-highfreq-ordinary-travel'
  | 'op-highfreq-meet-pursue'
  | 'op-highfreq-boat-current'
  | 'op-highfreq-ordinary-work'
  | 'op-highfreq-cooperative-work'
  | 'op-highfreq-profit-calc'
  | 'op-highfreq-profit-rate'
  | 'op-highfreq-concentration'
  | 'op-highfreq-perm-comb-basic'
  | 'op-highfreq-perm-comb-constraint'
  | 'op-highfreq-perm-comb-classic'
  | 'op-highfreq-probability'
  | 'op-other-inclusion-exclusion'
  | 'op-other-sequence'
  | 'op-other-extremum'
  | 'op-other-date'
  | 'op-other-age'
  | 'op-other-clock'
  | 'op-other-ying-kui'
  | 'op-other-chicken-rabbit'
  | 'op-other-function-graph'
  | 'op-other-competition'
  | 'op-other-reverse'
  | 'op-other-sectional'

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
  'op-highfreq-sum-diff-ratio': '高频运算 · 和差倍比问题',
  'op-highfreq-geometry': '高频运算 · 几何问题',
  'op-highfreq-right-triangle': '高频运算 · 直角三角形常用结论',
  'op-highfreq-similar-triangle': '高频运算 · 三角形相似',
  'op-highfreq-coloring': '高频运算 · 染色问题',
  'op-highfreq-ordinary-travel': '高频运算 · 普通行程问题',
  'op-highfreq-meet-pursue': '高频运算 · 相遇与追及问题',
  'op-highfreq-boat-current': '高频运算 · 流水行船问题',
  'op-highfreq-ordinary-work': '高频运算 · 普通工程问题',
  'op-highfreq-cooperative-work': '高频运算 · 合作完工问题',
  'op-highfreq-profit-calc': '高频运算 · 利润计算',
  'op-highfreq-profit-rate': '高频运算 · 利润率计算',
  'op-highfreq-concentration': '高频运算 · 浓度问题',
  'op-highfreq-perm-comb-basic': '高频运算 · 基本原理及公式',
  'op-highfreq-perm-comb-constraint': '高频运算 · 限制条件型问题',
  'op-highfreq-perm-comb-classic': '高频运算 · 排列组合经典模型',
  'op-highfreq-probability': '高频运算 · 概率问题',
  'op-other-inclusion-exclusion': '其他运算 · 容斥问题',
  'op-other-sequence': '其他运算 · 数列问题',
  'op-other-extremum': '其他运算 · 最值问题',
  'op-other-date': '其他运算 · 日期问题',
  'op-other-age': '其他运算 · 年龄问题',
  'op-other-clock': '其他运算 · 时钟问题',
  'op-other-ying-kui': '其他运算 · 盈亏问题',
  'op-other-chicken-rabbit': '其他运算 · 鸡兔同笼问题',
  'op-other-function-graph': '其他运算 · 函数图象问题',
  'op-other-competition': '其他运算 · 比赛问题',
  'op-other-reverse': '其他运算 · 逆推问题',
  'op-other-sectional': '其他运算 · 分段问题',
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
  if (
    modeId === 'op-highfreq-sum-diff-ratio-easy' ||
    modeId === 'op-highfreq-sum-diff-ratio-medium' ||
    modeId === 'op-highfreq-sum-diff-ratio-hard'
  ) {
    return 'op-highfreq-sum-diff-ratio'
  }
  if (
    modeId === 'op-highfreq-geometry-easy' ||
    modeId === 'op-highfreq-geometry-medium' ||
    modeId === 'op-highfreq-geometry-hard'
  ) {
    return 'op-highfreq-geometry'
  }
  if (
    modeId === 'op-highfreq-right-triangle-easy' ||
    modeId === 'op-highfreq-right-triangle-medium' ||
    modeId === 'op-highfreq-right-triangle-hard'
  ) {
    return 'op-highfreq-right-triangle'
  }
  if (
    modeId === 'op-highfreq-similar-triangle-easy' ||
    modeId === 'op-highfreq-similar-triangle-medium' ||
    modeId === 'op-highfreq-similar-triangle-hard'
  ) {
    return 'op-highfreq-similar-triangle'
  }
  if (
    modeId === 'op-highfreq-coloring-easy' ||
    modeId === 'op-highfreq-coloring-medium' ||
    modeId === 'op-highfreq-coloring-hard'
  ) {
    return 'op-highfreq-coloring'
  }
  if (
    modeId === 'op-highfreq-ordinary-travel-easy' ||
    modeId === 'op-highfreq-ordinary-travel-medium' ||
    modeId === 'op-highfreq-ordinary-travel-hard'
  ) {
    return 'op-highfreq-ordinary-travel'
  }
  if (
    modeId === 'op-highfreq-meet-pursue-easy' ||
    modeId === 'op-highfreq-meet-pursue-medium' ||
    modeId === 'op-highfreq-meet-pursue-hard'
  ) {
    return 'op-highfreq-meet-pursue'
  }
  if (
    modeId === 'op-highfreq-boat-current-easy' ||
    modeId === 'op-highfreq-boat-current-hard'
  ) {
    return 'op-highfreq-boat-current'
  }
  if (
    modeId === 'op-highfreq-ordinary-work-easy' ||
    modeId === 'op-highfreq-ordinary-work-hard'
  ) {
    return 'op-highfreq-ordinary-work'
  }
  if (
    modeId === 'op-highfreq-cooperative-work-easy' ||
    modeId === 'op-highfreq-cooperative-work-hard'
  ) {
    return 'op-highfreq-cooperative-work'
  }
  if (
    modeId === 'op-highfreq-profit-calc-easy' ||
    modeId === 'op-highfreq-profit-calc-hard'
  ) {
    return 'op-highfreq-profit-calc'
  }
  if (
    modeId === 'op-highfreq-profit-rate-easy' ||
    modeId === 'op-highfreq-profit-rate-hard'
  ) {
    return 'op-highfreq-profit-rate'
  }
  if (
    modeId === 'op-highfreq-concentration-easy' ||
    modeId === 'op-highfreq-concentration-medium' ||
    modeId === 'op-highfreq-concentration-hard'
  ) {
    return 'op-highfreq-concentration'
  }
  if (
    modeId === 'op-highfreq-perm-comb-basic-easy' ||
    modeId === 'op-highfreq-perm-comb-basic-medium' ||
    modeId === 'op-highfreq-perm-comb-basic-hard'
  ) {
    return 'op-highfreq-perm-comb-basic'
  }
  if (
    modeId === 'op-highfreq-perm-comb-constraint-easy' ||
    modeId === 'op-highfreq-perm-comb-constraint-medium' ||
    modeId === 'op-highfreq-perm-comb-constraint-hard'
  ) {
    return 'op-highfreq-perm-comb-constraint'
  }
  if (
    modeId === 'op-highfreq-perm-comb-classic-easy' ||
    modeId === 'op-highfreq-perm-comb-classic-medium' ||
    modeId === 'op-highfreq-perm-comb-classic-hard'
  ) {
    return 'op-highfreq-perm-comb-classic'
  }
  if (
    modeId === 'op-highfreq-probability-easy' ||
    modeId === 'op-highfreq-probability-medium' ||
    modeId === 'op-highfreq-probability-hard'
  ) {
    return 'op-highfreq-probability'
  }
  if (
    modeId === 'op-other-inclusion-exclusion-easy' ||
    modeId === 'op-other-inclusion-exclusion-medium' ||
    modeId === 'op-other-inclusion-exclusion-hard'
  ) {
    return 'op-other-inclusion-exclusion'
  }
  if (
    modeId === 'op-other-sequence-easy' ||
    modeId === 'op-other-sequence-medium' ||
    modeId === 'op-other-sequence-hard'
  ) {
    return 'op-other-sequence'
  }
  if (
    modeId === 'op-other-extremum-easy' ||
    modeId === 'op-other-extremum-medium' ||
    modeId === 'op-other-extremum-hard'
  ) {
    return 'op-other-extremum'
  }
  if (
    modeId === 'op-other-date-easy' ||
    modeId === 'op-other-date-medium' ||
    modeId === 'op-other-date-hard'
  ) {
    return 'op-other-date'
  }
  if (
    modeId === 'op-other-age-easy' ||
    modeId === 'op-other-age-medium' ||
    modeId === 'op-other-age-hard'
  ) {
    return 'op-other-age'
  }
  if (
    modeId === 'op-other-clock-easy' ||
    modeId === 'op-other-clock-medium' ||
    modeId === 'op-other-clock-hard'
  ) {
    return 'op-other-clock'
  }
  if (
    modeId === 'op-other-ying-kui-easy' ||
    modeId === 'op-other-ying-kui-medium' ||
    modeId === 'op-other-ying-kui-hard'
  ) {
    return 'op-other-ying-kui'
  }
  if (
    modeId === 'op-other-chicken-rabbit-easy' ||
    modeId === 'op-other-chicken-rabbit-medium' ||
    modeId === 'op-other-chicken-rabbit-hard'
  ) {
    return 'op-other-chicken-rabbit'
  }
  if (
    modeId === 'op-other-function-graph-easy' ||
    modeId === 'op-other-function-graph-medium' ||
    modeId === 'op-other-function-graph-hard'
  ) {
    return 'op-other-function-graph'
  }
  if (
    modeId === 'op-other-competition-easy' ||
    modeId === 'op-other-competition-medium' ||
    modeId === 'op-other-competition-hard'
  ) {
    return 'op-other-competition'
  }
  if (
    modeId === 'op-other-reverse-easy' ||
    modeId === 'op-other-reverse-medium' ||
    modeId === 'op-other-reverse-hard'
  ) {
    return 'op-other-reverse'
  }
  if (
    modeId === 'op-other-sectional-easy' ||
    modeId === 'op-other-sectional-medium' ||
    modeId === 'op-other-sectional-hard'
  ) {
    return 'op-other-sectional'
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
