import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type {
  ChineseReadingQuestionType,
  ReadingComprehensionQuestion,
} from '@/utils/readingComprehensionPractice'

const WRONG_KEY = 'chinese-reading-comprehension-wrong-v1'
const FAVORITE_KEY = 'chinese-reading-comprehension-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredReadingComprehensionRecord = {
  fingerprint: string
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredReadingComprehensionFavoriteRecord = {
  fingerprint: string
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
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

function questionToStoredRecord(
  q: ReadingComprehensionQuestion,
): StoredReadingComprehensionRecord {
  return {
    fingerprint: q.fingerprint,
    questionType: q.questionType,
    term: q.term,
    passage: q.passage,
    stem: q.stem,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    wrongCount: 1,
    updatedAt: new Date().toISOString(),
  }
}

export function storedReadingComprehensionToQuestion(
  row: StoredReadingComprehensionRecord | StoredReadingComprehensionFavoriteRecord,
  seq: number,
): ReadingComprehensionQuestion {
  return {
    id: `stored-reading-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    passage: row.passage,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseReadingComprehensionWrongRecords(
  filterMode?: ChineseReadingQuestionType,
): StoredReadingComprehensionRecord[] {
  const rows = readJson<StoredReadingComprehensionRecord[]>(WRONG_KEY, [])
  if (!filterMode) return rows
  return rows.filter((r) => r.questionType === filterMode)
}

export function listChineseReadingComprehensionFavoriteRecords(
  filterMode?: ChineseReadingQuestionType,
): StoredReadingComprehensionFavoriteRecord[] {
  const rows = readJson<StoredReadingComprehensionFavoriteRecord[]>(FAVORITE_KEY, [])
  if (!filterMode) return rows
  return rows.filter((r) => r.questionType === filterMode)
}

export function upsertChineseReadingComprehensionWrong(q: ReadingComprehensionQuestion) {
  const rows = readJson<StoredReadingComprehensionRecord[]>(WRONG_KEY, [])
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

export function isChineseReadingComprehensionFavorite(fingerprint: string): boolean {
  return listChineseReadingComprehensionFavoriteRecords().some(
    (r) => r.fingerprint === fingerprint,
  )
}

export function toggleChineseReadingComprehensionFavorite(
  q: ReadingComprehensionQuestion,
): 'added' | 'removed' {
  const rows = readJson<StoredReadingComprehensionFavoriteRecord[]>(FAVORITE_KEY, [])
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
    passage: base.passage,
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

export function removeChineseReadingComprehensionWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    readJson<StoredReadingComprehensionRecord[]>(WRONG_KEY, []).filter(
      (r) => r.fingerprint !== fingerprint,
    ),
  )
  notifyDataChanged()
}

export function removeChineseReadingComprehensionFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    readJson<StoredReadingComprehensionFavoriteRecord[]>(FAVORITE_KEY, []).filter(
      (r) => r.fingerprint !== fingerprint,
    ),
  )
  notifyDataChanged()
}
