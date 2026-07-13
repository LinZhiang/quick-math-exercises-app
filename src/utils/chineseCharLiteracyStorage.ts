import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { CharLiteracyQuestion } from '@/utils/charLiteracyPractice'

const WRONG_KEY = 'chinese-char-literacy-wrong-v1'
const FAVORITE_KEY = 'chinese-char-literacy-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredCharLiteracyRecord = {
  fingerprint: string
  questionType: CharLiteracyQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredCharLiteracyFavoriteRecord = {
  fingerprint: string
  questionType: CharLiteracyQuestion['questionType']
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

export function questionToStoredCharLiteracyRecord(q: CharLiteracyQuestion): StoredCharLiteracyRecord {
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

export function storedCharLiteracyToQuestion(
  row: StoredCharLiteracyRecord | StoredCharLiteracyFavoriteRecord,
  seq: number,
): CharLiteracyQuestion {
  return {
    id: `stored-char-lit-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseCharLiteracyWrongRecords(): StoredCharLiteracyRecord[] {
  return readJson<StoredCharLiteracyRecord[]>(WRONG_KEY, [])
}

export function listChineseCharLiteracyFavoriteRecords(): StoredCharLiteracyFavoriteRecord[] {
  return readJson<StoredCharLiteracyFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseCharLiteracyWrong(q: CharLiteracyQuestion) {
  const rows = listChineseCharLiteracyWrongRecords()
  const hit = rows.find((r) => r.fingerprint === q.fingerprint)
  const now = new Date().toISOString()
  if (hit) {
    hit.wrongCount = (hit.wrongCount ?? 0) + 1
    hit.updatedAt = now
  } else {
    rows.unshift({ ...questionToStoredCharLiteracyRecord(q), wrongCount: 1, updatedAt: now })
  }
  writeJson(WRONG_KEY, rows)
  notifyDataChanged()
}

export function isChineseCharLiteracyFavorite(fingerprint: string): boolean {
  return listChineseCharLiteracyFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseCharLiteracyFavorite(q: CharLiteracyQuestion): 'added' | 'removed' {
  const rows = listChineseCharLiteracyFavoriteRecords()
  const idx = rows.findIndex((r) => r.fingerprint === q.fingerprint)
  if (idx >= 0) {
    rows.splice(idx, 1)
    writeJson(FAVORITE_KEY, rows)
    notifyDataChanged()
    return 'removed'
  }
  const base = questionToStoredCharLiteracyRecord(q)
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

export function removeChineseCharLiteracyWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseCharLiteracyWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseCharLiteracyFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseCharLiteracyFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
