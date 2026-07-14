import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { LegalCommonSenseQuestion } from '@/utils/legalCommonSensePractice'

const WRONG_KEY = 'chinese-legal-common-sense-wrong-v1'
const FAVORITE_KEY = 'chinese-legal-common-sense-favorite-v1'

function notifyDataChanged() {
  chinesePracticeDataTick.value += 1
}

export type StoredLegalCommonSenseRecord = {
  fingerprint: string
  questionType: LegalCommonSenseQuestion['questionType']
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  wrongCount: number
  updatedAt: string
}

export type StoredLegalCommonSenseFavoriteRecord = {
  fingerprint: string
  questionType: LegalCommonSenseQuestion['questionType']
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

function questionToStoredRecord(q: LegalCommonSenseQuestion): StoredLegalCommonSenseRecord {
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

export function storedLegalCommonSenseToQuestion(
  row: StoredLegalCommonSenseRecord | StoredLegalCommonSenseFavoriteRecord,
  seq: number,
): LegalCommonSenseQuestion {
  return {
    id: `stored-legal-sense-${seq}-${row.fingerprint.slice(0, 10)}`,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: [...row.options],
    correctIndex: row.correctIndex,
    explanation: row.explanation,
    fingerprint: row.fingerprint,
  }
}

export function listChineseLegalCommonSenseWrongRecords(): StoredLegalCommonSenseRecord[] {
  return readJson<StoredLegalCommonSenseRecord[]>(WRONG_KEY, [])
}

export function listChineseLegalCommonSenseFavoriteRecords(): StoredLegalCommonSenseFavoriteRecord[] {
  return readJson<StoredLegalCommonSenseFavoriteRecord[]>(FAVORITE_KEY, [])
}

export function upsertChineseLegalCommonSenseWrong(q: LegalCommonSenseQuestion) {
  const rows = listChineseLegalCommonSenseWrongRecords()
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

export function isChineseLegalCommonSenseFavorite(fingerprint: string): boolean {
  return listChineseLegalCommonSenseFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleChineseLegalCommonSenseFavorite(
  q: LegalCommonSenseQuestion,
): 'added' | 'removed' {
  const rows = listChineseLegalCommonSenseFavoriteRecords()
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

export function removeChineseLegalCommonSenseWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listChineseLegalCommonSenseWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}

export function removeChineseLegalCommonSenseFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listChineseLegalCommonSenseFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
  notifyDataChanged()
}
