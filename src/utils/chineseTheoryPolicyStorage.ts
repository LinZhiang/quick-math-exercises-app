import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { TheoryPolicyQuestion } from '@/utils/theoryPolicyPractice'

const WRONG_KEY = 'chinese-theory-policy-wrong-v1'
const FAVORITE_KEY = 'chinese-theory-policy-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredTheoryPolicyRecord = {
  fingerprint: string
  questionType: TheoryPolicyQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredTheoryPolicyFavoriteRecord = {
  fingerprint: string
  questionType: TheoryPolicyQuestion['questionType']
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

function questionToStoredRecord(q: TheoryPolicyQuestion): StoredTheoryPolicyRecord {
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

export function storedTheoryPolicyToQuestion(
  row: StoredTheoryPolicyRecord | StoredTheoryPolicyFavoriteRecord,
  seq: number,
): TheoryPolicyQuestion {
  return {
    id: `stored-theory-policy-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseTheoryPolicyWrongRecords(): StoredTheoryPolicyRecord[] {
  return readJson<StoredTheoryPolicyRecord[]>(WRONG_KEY, [])
}

export function listChineseTheoryPolicyFavoriteRecords(): StoredTheoryPolicyFavoriteRecord[] {
  return readJson<StoredTheoryPolicyFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseTheoryPolicyWrong(q: TheoryPolicyQuestion) {
  const rows = listChineseTheoryPolicyWrongRecords()
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

export function isChineseTheoryPolicyFavorite(fingerprint: string): boolean {
  return listChineseTheoryPolicyFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseTheoryPolicyFavorite(
  q: TheoryPolicyQuestion,
): 'added' | 'removed' {
  const rows = listChineseTheoryPolicyFavoriteRecords()
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

export function removeChineseTheoryPolicyWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseTheoryPolicyWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseTheoryPolicyFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseTheoryPolicyFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
