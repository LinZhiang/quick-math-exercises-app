/**
 * 口算各分区收藏（与错题本并列，对齐语文关题收藏）
 */
import { ref } from 'vue'
import {
  buildMentalMathWrongFingerprint,
  mentalMathModeToWrongSection,
  type MentalMathWrongSection,
} from '@/utils/mentalMathWrongBook'

const STORAGE_KEY = 'mental-math-favorite-book-v1'

export const mentalMathFavoriteBookTick = ref(0)

export type MentalMathFavoriteRecord = {
  fingerprint: string
  section: MentalMathWrongSection
  modeId: string
  expression: string
  correctAnswer: string
  options?: string[]
  explanation?: string
  savedAt: string
}

function notifyChanged() {
  mentalMathFavoriteBookTick.value += 1
}

function readAll(): MentalMathFavoriteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is MentalMathFavoriteRecord =>
        !!r &&
        typeof r === 'object' &&
        typeof (r as MentalMathFavoriteRecord).fingerprint === 'string' &&
        typeof (r as MentalMathFavoriteRecord).section === 'string',
    )
  } catch {
    return []
  }
}

function writeAll(rows: MentalMathFavoriteRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  notifyChanged()
}

export function listMentalMathFavoriteRecords(
  section?: MentalMathWrongSection,
): MentalMathFavoriteRecord[] {
  void mentalMathFavoriteBookTick.value
  const all = readAll()
  if (!section) return all
  return all.filter((r) => r.section === section)
}

export function countMentalMathFavoriteRecords(section: MentalMathWrongSection): number {
  return listMentalMathFavoriteRecords(section).length
}

export function isMentalMathFavorite(fingerprint: string): boolean {
  void mentalMathFavoriteBookTick.value
  return readAll().some((r) => r.fingerprint === fingerprint)
}

export function isMentalMathFavoriteByInput(input: {
  modeId: string
  expression: string
  correctAnswer: string | number
}): boolean {
  const section = mentalMathModeToWrongSection(input.modeId)
  if (!section) return false
  const fingerprint = buildMentalMathWrongFingerprint({
    section,
    modeId: input.modeId,
    expression: String(input.expression ?? '').trim(),
    correctAnswer: String(input.correctAnswer),
  })
  return isMentalMathFavorite(fingerprint)
}

export function toggleMentalMathFavorite(input: {
  modeId: string
  expression: string
  correctAnswer: string | number
  options?: Array<string | number>
  explanation?: string
}): 'added' | 'removed' | 'skipped' {
  const section = mentalMathModeToWrongSection(input.modeId)
  if (!section) return 'skipped'
  const expression = String(input.expression ?? '').trim()
  const correctAnswer = String(input.correctAnswer)
  if (!expression) return 'skipped'

  const fingerprint = buildMentalMathWrongFingerprint({
    section,
    modeId: input.modeId,
    expression,
    correctAnswer,
  })

  const rows = readAll()
  const idx = rows.findIndex((r) => r.fingerprint === fingerprint)
  if (idx >= 0) {
    rows.splice(idx, 1)
    writeAll(rows)
    return 'removed'
  }

  rows.unshift({
    fingerprint,
    section,
    modeId: input.modeId,
    expression,
    correctAnswer,
    options: input.options?.map(String),
    explanation: input.explanation?.trim() || undefined,
    savedAt: new Date().toISOString(),
  })
  writeAll(rows)
  return 'added'
}

/** 从已有错题记录加入/取消收藏 */
export function toggleMentalMathFavoriteFromWrong(row: {
  fingerprint: string
  section: MentalMathWrongSection
  modeId: string
  expression: string
  correctAnswer: string
  options?: string[]
  explanation?: string
}): 'added' | 'removed' {
  const rows = readAll()
  const idx = rows.findIndex((r) => r.fingerprint === row.fingerprint)
  if (idx >= 0) {
    rows.splice(idx, 1)
    writeAll(rows)
    return 'removed'
  }
  rows.unshift({
    fingerprint: row.fingerprint,
    section: row.section,
    modeId: row.modeId,
    expression: row.expression,
    correctAnswer: row.correctAnswer,
    options: row.options,
    explanation: row.explanation,
    savedAt: new Date().toISOString(),
  })
  writeAll(rows)
  return 'added'
}

export function removeMentalMathFavorite(fingerprint: string) {
  writeAll(readAll().filter((r) => r.fingerprint !== fingerprint))
}

export function clearMentalMathFavoriteSection(section: MentalMathWrongSection) {
  writeAll(readAll().filter((r) => r.section !== section))
}
