import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { GeographyCommonSenseQuestion } from '@/utils/geographyCommonSensePractice'

const WRONG_KEY = 'chinese-geography-common-sense-wrong-v1'
const FAVORITE_KEY = 'chinese-geography-common-sense-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredGeographyCommonSenseRecord = {
  fingerprint: string
  questionType: GeographyCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredGeographyCommonSenseFavoriteRecord = {
  fingerprint: string
  questionType: GeographyCommonSenseQuestion['questionType']
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

function questionToStoredRecord(q: GeographyCommonSenseQuestion): StoredGeographyCommonSenseRecord {
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

export function storedGeographyCommonSenseToQuestion(
  row: StoredGeographyCommonSenseRecord | StoredGeographyCommonSenseFavoriteRecord,
  seq: number,
): GeographyCommonSenseQuestion {
  return {
    id: `stored-geo-sense-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseGeographyCommonSenseWrongRecords(): StoredGeographyCommonSenseRecord[] {
  return readJson<StoredGeographyCommonSenseRecord[]>(WRONG_KEY, [])
}

export function listChineseGeographyCommonSenseFavoriteRecords(): StoredGeographyCommonSenseFavoriteRecord[] {
  return readJson<StoredGeographyCommonSenseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseGeographyCommonSenseWrong(q: GeographyCommonSenseQuestion) {
  const rows = listChineseGeographyCommonSenseWrongRecords()
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

export function isChineseGeographyCommonSenseFavorite(fingerprint: string): boolean {
  return listChineseGeographyCommonSenseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseGeographyCommonSenseFavorite(
  q: GeographyCommonSenseQuestion,
): 'added' | 'removed' {
  const rows = listChineseGeographyCommonSenseFavoriteRecords()
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

export function removeChineseGeographyCommonSenseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseGeographyCommonSenseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseGeographyCommonSenseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseGeographyCommonSenseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
