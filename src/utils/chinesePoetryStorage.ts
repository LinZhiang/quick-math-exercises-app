import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { PoetryRecognitionQuestion } from '@/utils/poetryRecognitionPractice'

const WRONG_KEY = 'chinese-poetry-wrong-v1'
const FAVORITE_KEY = 'chinese-poetry-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredPoetryRecord = {
  fingerprint: string
  questionType: PoetryRecognitionQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredPoetryFavoriteRecord = {
  fingerprint: string
  questionType: PoetryRecognitionQuestion['questionType']
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

function questionToStoredRecord(q: PoetryRecognitionQuestion): StoredPoetryRecord {
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

export function storedPoetryToQuestion(
  row: StoredPoetryRecord | StoredPoetryFavoriteRecord,
  seq: number,
): PoetryRecognitionQuestion {
  return {
    id: `stored-poetry-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChinesePoetryWrongRecords(): StoredPoetryRecord[] {
  return readJson<StoredPoetryRecord[]>(WRONG_KEY, [])
}

export function listChinesePoetryFavoriteRecords(): StoredPoetryFavoriteRecord[] {
  return readJson<StoredPoetryFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChinesePoetryWrong(q: PoetryRecognitionQuestion) {
  const rows = listChinesePoetryWrongRecords()
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

export function isChinesePoetryFavorite(fingerprint: string): boolean {
  return listChinesePoetryFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChinesePoetryFavorite(q: PoetryRecognitionQuestion): 'added' | 'removed' {
  const rows = listChinesePoetryFavoriteRecords()
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

export function removeChinesePoetryWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChinesePoetryWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChinesePoetryFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChinesePoetryFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
