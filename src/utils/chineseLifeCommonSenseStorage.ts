import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { LifeCommonSenseQuestion } from '@/utils/lifeCommonSensePractice'

const WRONG_KEY = 'chinese-life-common-sense-wrong-v1'
const FAVORITE_KEY = 'chinese-life-common-sense-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredLifeCommonSenseRecord = {
  fingerprint: string
  questionType: LifeCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredLifeCommonSenseFavoriteRecord = {
  fingerprint: string
  questionType: LifeCommonSenseQuestion['questionType']
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

function questionToStoredRecord(q: LifeCommonSenseQuestion): StoredLifeCommonSenseRecord {
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

export function storedLifeCommonSenseToQuestion(
  row: StoredLifeCommonSenseRecord | StoredLifeCommonSenseFavoriteRecord,
  seq: number,
): LifeCommonSenseQuestion {
  return {
    id: `stored-life-sense-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseLifeCommonSenseWrongRecords(): StoredLifeCommonSenseRecord[] {
  return readJson<StoredLifeCommonSenseRecord[]>(WRONG_KEY, [])
}

export function listChineseLifeCommonSenseFavoriteRecords(): StoredLifeCommonSenseFavoriteRecord[] {
  return readJson<StoredLifeCommonSenseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseLifeCommonSenseWrong(q: LifeCommonSenseQuestion) {
  const rows = listChineseLifeCommonSenseWrongRecords()
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

export function isChineseLifeCommonSenseFavorite(fingerprint: string): boolean {
  return listChineseLifeCommonSenseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseLifeCommonSenseFavorite(
  q: LifeCommonSenseQuestion,
): 'added' | 'removed' {
  const rows = listChineseLifeCommonSenseFavoriteRecords()
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

export function removeChineseLifeCommonSenseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseLifeCommonSenseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseLifeCommonSenseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseLifeCommonSenseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
