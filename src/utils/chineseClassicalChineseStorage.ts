import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { ClassicalChineseQuestion } from '@/utils/classicalChinesePractice'

const WRONG_KEY = 'chinese-classical-chinese-wrong-v1'
const FAVORITE_KEY = 'chinese-classical-chinese-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredClassicalChineseRecord = {
  fingerprint: string
  questionType: ClassicalChineseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredClassicalChineseFavoriteRecord = {
  fingerprint: string
  questionType: ClassicalChineseQuestion['questionType']
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

function questionToStoredRecord(q: ClassicalChineseQuestion): StoredClassicalChineseRecord {
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

export function storedClassicalChineseToQuestion(
  row: StoredClassicalChineseRecord | StoredClassicalChineseFavoriteRecord,
  seq: number,
): ClassicalChineseQuestion {
  return {
    id: `stored-classical-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseClassicalChineseWrongRecords(): StoredClassicalChineseRecord[] {
  return readJson<StoredClassicalChineseRecord[]>(WRONG_KEY, [])
}

export function listChineseClassicalChineseFavoriteRecords(): StoredClassicalChineseFavoriteRecord[] {
  return readJson<StoredClassicalChineseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseClassicalChineseWrong(q: ClassicalChineseQuestion) {
  const rows = listChineseClassicalChineseWrongRecords()
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

export function isChineseClassicalChineseFavorite(fingerprint: string): boolean {
  return listChineseClassicalChineseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseClassicalChineseFavorite(
  q: ClassicalChineseQuestion,
): 'added' | 'removed' {
  const rows = listChineseClassicalChineseFavoriteRecords()
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

export function removeChineseClassicalChineseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseClassicalChineseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseClassicalChineseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseClassicalChineseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
