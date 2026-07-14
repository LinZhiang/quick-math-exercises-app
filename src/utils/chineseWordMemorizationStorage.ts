import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { WordMemorizationQuestion } from '@/utils/wordMemorizationPractice'

const WRONG_KEY = 'chinese-word-memorization-wrong-v1'
const FAVORITE_KEY = 'chinese-word-memorization-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredWordMemorizationRecord = {
  fingerprint: string
  questionType: WordMemorizationQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredWordMemorizationFavoriteRecord = {
  fingerprint: string
  questionType: WordMemorizationQuestion['questionType']
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

function questionToStoredRecord(q: WordMemorizationQuestion): StoredWordMemorizationRecord {
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

export function storedWordMemorizationToQuestion(
  row: StoredWordMemorizationRecord | StoredWordMemorizationFavoriteRecord,
  seq: number,
): WordMemorizationQuestion {
  return {
    id: `stored-word-mem-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseWordMemorizationWrongRecords(): StoredWordMemorizationRecord[] {
  return readJson<StoredWordMemorizationRecord[]>(WRONG_KEY, [])
}

export function listChineseWordMemorizationFavoriteRecords(): StoredWordMemorizationFavoriteRecord[] {
  return readJson<StoredWordMemorizationFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseWordMemorizationWrong(q: WordMemorizationQuestion) {
  const rows = listChineseWordMemorizationWrongRecords()
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

export function isChineseWordMemorizationFavorite(fingerprint: string): boolean {
  return listChineseWordMemorizationFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseWordMemorizationFavorite(
  q: WordMemorizationQuestion,
): 'added' | 'removed' {
  const rows = listChineseWordMemorizationFavoriteRecords()
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

export function removeChineseWordMemorizationWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseWordMemorizationWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseWordMemorizationFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseWordMemorizationFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
