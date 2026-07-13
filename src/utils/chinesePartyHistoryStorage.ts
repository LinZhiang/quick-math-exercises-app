import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { PartyHistoryQuestion } from '@/utils/partyHistoryPractice'

const WRONG_KEY = 'chinese-party-history-wrong-v1'
const FAVORITE_KEY = 'chinese-party-history-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredPartyHistoryRecord = {
  fingerprint: string
  questionType: PartyHistoryQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredPartyHistoryFavoriteRecord = {
  fingerprint: string
  questionType: PartyHistoryQuestion['questionType']
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

function questionToStoredRecord(q: PartyHistoryQuestion): StoredPartyHistoryRecord {
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

export function storedPartyHistoryToQuestion(
  row: StoredPartyHistoryRecord | StoredPartyHistoryFavoriteRecord,
  seq: number,
): PartyHistoryQuestion {
  return {
    id: `stored-party-hist-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChinesePartyHistoryWrongRecords(): StoredPartyHistoryRecord[] {
  return readJson<StoredPartyHistoryRecord[]>(WRONG_KEY, [])
}

export function listChinesePartyHistoryFavoriteRecords(): StoredPartyHistoryFavoriteRecord[] {
  return readJson<StoredPartyHistoryFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChinesePartyHistoryWrong(q: PartyHistoryQuestion) {
  const rows = listChinesePartyHistoryWrongRecords()
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

export function isChinesePartyHistoryFavorite(fingerprint: string): boolean {
  return listChinesePartyHistoryFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChinesePartyHistoryFavorite(q: PartyHistoryQuestion): 'added' | 'removed' {
  const rows = listChinesePartyHistoryFavoriteRecords()
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

export function removeChinesePartyHistoryWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChinesePartyHistoryWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChinesePartyHistoryFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChinesePartyHistoryFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
