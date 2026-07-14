import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { EconomyCommonSenseQuestion } from '@/utils/economyCommonSensePractice'

const WRONG_KEY = 'chinese-economy-common-sense-wrong-v1'
const FAVORITE_KEY = 'chinese-economy-common-sense-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredEconomyCommonSenseRecord = {
  fingerprint: string
  questionType: EconomyCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredEconomyCommonSenseFavoriteRecord = {
  fingerprint: string
  questionType: EconomyCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  savedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function questionToStoredRecord(q: EconomyCommonSenseQuestion): StoredEconomyCommonSenseRecord {
  return {
    fingerprint: q.fingerprint,
    questionType: q.questionType,
    term: q.term,
    stem: q.stem,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    wrongCount: 1,
    updatedAt: new Date().toISOString(),
  }
}

export function storedEconomyCommonSenseToQuestion(
  row: StoredEconomyCommonSenseRecord | StoredEconomyCommonSenseFavoriteRecord,
  seq: number,
): EconomyCommonSenseQuestion {
  return {
    id: `stored-econ-sense-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseEconomyCommonSenseWrongRecords(): StoredEconomyCommonSenseRecord[] {
  return readJson<StoredEconomyCommonSenseRecord[]>(WRONG_KEY, [])
}

export function listChineseEconomyCommonSenseFavoriteRecords(): StoredEconomyCommonSenseFavoriteRecord[] {
  return readJson<StoredEconomyCommonSenseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseEconomyCommonSenseWrong(q: EconomyCommonSenseQuestion) {
  const rows = listChineseEconomyCommonSenseWrongRecords()
  const hit = rows.find((r) => r.fingerprint === q.fingerprint)
  const now = new Date().toISOString()
  if (hit) {
    hit.wrongCount = (hit.wrongCount ?? 0) + 1
    hit.updatedAt = now
  } else {
    rows.unshift({ ...questionToStoredRecord(q), wrongCount: 1, updatedAt: now })
  }
  writeJson(WRONG_KEY, rows)
  notifyDataChanged()
}

export function isChineseEconomyCommonSenseFavorite(fingerprint: string): boolean {
  return listChineseEconomyCommonSenseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseEconomyCommonSenseFavorite(
  q: EconomyCommonSenseQuestion,
): 'added' | 'removed' {
  const rows = listChineseEconomyCommonSenseFavoriteRecords()
  const idx = rows.findIndex((r) => r.fingerprint === q.fingerprint)
  if (idx >= 0) {
    rows.splice(idx, 1)
    writeJson(FAVORITE_KEY, rows)
    notifyDataChanged()
    return 'removed'
  }
  const base = questionToStoredRecord(q)
  rows.unshift({
    fingerprint: base.fingerprint,
    questionType: base.questionType,
    term: base.term,
    stem: base.stem,
    options: base.options,
    correctIndex: base.correctIndex,
    explanation: base.explanation,
    savedAt: new Date().toISOString(),
  })
  writeJson(FAVORITE_KEY, rows)
  notifyDataChanged()
  return 'added'
}

export function removeChineseEconomyCommonSenseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseEconomyCommonSenseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseEconomyCommonSenseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseEconomyCommonSenseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
