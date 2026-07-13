import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { HistoryCommonSenseQuestion } from '@/utils/historyCommonSensePractice'

const WRONG_KEY = 'chinese-history-common-sense-wrong-v1'
const FAVORITE_KEY = 'chinese-history-common-sense-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredHistoryCommonSenseRecord = {
  fingerprint: string
  questionType: HistoryCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredHistoryCommonSenseFavoriteRecord = {
  fingerprint: string
  questionType: HistoryCommonSenseQuestion['questionType']
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

function questionToStoredRecord(q: HistoryCommonSenseQuestion): StoredHistoryCommonSenseRecord {
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

export function storedHistoryCommonSenseToQuestion(
  row: StoredHistoryCommonSenseRecord | StoredHistoryCommonSenseFavoriteRecord,
  seq: number,
): HistoryCommonSenseQuestion {
  return {
    id: `stored-hist-sense-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseHistoryCommonSenseWrongRecords(): StoredHistoryCommonSenseRecord[] {
  return readJson<StoredHistoryCommonSenseRecord[]>(WRONG_KEY, [])
}

export function listChineseHistoryCommonSenseFavoriteRecords(): StoredHistoryCommonSenseFavoriteRecord[] {
  return readJson<StoredHistoryCommonSenseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseHistoryCommonSenseWrong(q: HistoryCommonSenseQuestion) {
  const rows = listChineseHistoryCommonSenseWrongRecords()
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

export function isChineseHistoryCommonSenseFavorite(fingerprint: string): boolean {
  return listChineseHistoryCommonSenseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseHistoryCommonSenseFavorite(
  q: HistoryCommonSenseQuestion,
): 'added' | 'removed' {
  const rows = listChineseHistoryCommonSenseFavoriteRecords()
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

export function removeChineseHistoryCommonSenseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseHistoryCommonSenseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseHistoryCommonSenseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseHistoryCommonSenseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
