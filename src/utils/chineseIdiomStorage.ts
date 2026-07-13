import { ref } from 'vue'
import type { IdiomRecognitionQuestion } from '@/utils/idiomRecognitionPractice'

const WRONG_KEY = 'chinese-practice-wrong-v1'
const FAVORITE_KEY = 'chinese-practice-favorite-v1'

/** 错题/收藏变更时递增，供关键题面板自动刷新 */
export const chinesePracticeDataTick = ref(0)

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredIdiomRecord = {
  fingerprint: string
  questionType: IdiomRecognitionQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredFavoriteRecord = {
  fingerprint: string
  questionType: IdiomRecognitionQuestion['questionType']
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

export function questionToStoredRecord(q: IdiomRecognitionQuestion): StoredIdiomRecord {
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

export function storedToQuestion(
  row: StoredIdiomRecord | StoredFavoriteRecord,
  seq: number,
): IdiomRecognitionQuestion {
  return {
    id: `stored-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseWrongRecords(): StoredIdiomRecord[] {
  return readJson<StoredIdiomRecord[]>(WRONG_KEY, [])
}

export function listChineseFavoriteRecords(): StoredFavoriteRecord[] {
  return readJson<StoredFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseWrong(q: IdiomRecognitionQuestion) {
  const rows = listChineseWrongRecords()
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

export function isChineseFavorite(fingerprint: string): boolean {
  return listChineseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseFavorite(q: IdiomRecognitionQuestion): 'added' | 'removed' {
  const rows = listChineseFavoriteRecords()
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

export function removeChineseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
