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
    modeId === 'grammar-judgment-hard'
  ) {
    return 'grammar-judgment'
  }
  if (modeId === 'twentyfour-easy' || modeId === 'twentyfour-hard') return 'twentyfour'
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
