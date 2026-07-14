import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { RhetoricUsageQuestion } from '@/utils/rhetoricUsagePractice'

const WRONG_KEY = 'chinese-rhetoric-usage-wrong-v1'
const FAVORITE_KEY = 'chinese-rhetoric-usage-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredRhetoricUsageRecord = {
  fingerprint: string
  questionType: RhetoricUsageQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredRhetoricUsageFavoriteRecord = {
  fingerprint: string
  questionType: RhetoricUsageQuestion['questionType']
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

function questionToStoredRecord(q: RhetoricUsageQuestion): StoredRhetoricUsageRecord {
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

export function storedRhetoricUsageToQuestion(
  row: StoredRhetoricUsageRecord | StoredRhetoricUsageFavoriteRecord,
  seq: number,
): RhetoricUsageQuestion {
  return {
    id: `stored-rhetoric-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseRhetoricUsageWrongRecords(): StoredRhetoricUsageRecord[] {
  return readJson<StoredRhetoricUsageRecord[]>(WRONG_KEY, [])
}

export function listChineseRhetoricUsageFavoriteRecords(): StoredRhetoricUsageFavoriteRecord[] {
  return readJson<StoredRhetoricUsageFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseRhetoricUsageWrong(q: RhetoricUsageQuestion) {
  const rows = listChineseRhetoricUsageWrongRecords()
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

export function isChineseRhetoricUsageFavorite(fingerprint: string): boolean {
  return listChineseRhetoricUsageFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseRhetoricUsageFavorite(
  q: RhetoricUsageQuestion,
): 'added' | 'removed' {
  const rows = listChineseRhetoricUsageFavoriteRecords()
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

export function removeChineseRhetoricUsageWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseRhetoricUsageWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseRhetoricUsageFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseRhetoricUsageFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
