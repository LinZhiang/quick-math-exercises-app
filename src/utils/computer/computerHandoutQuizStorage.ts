import { ref } from 'vue'
import type { ComputerQuizQuestion } from '@/utils/computer/computerHandoutQuiz'

const WRONG_KEY = 'computer-handout-quiz-wrong-v1'
const FAVORITE_KEY = 'computer-handout-quiz-favorite-v1'
const AVOID_KEY = 'computer-handout-quiz-avoid-v1'

export const computerQuizBookTick = ref(0)

export type StoredComputerQuizRecord = ComputerQuizQuestion & {
  wrongCount?: number
  updatedAt?: string
  savedAt?: string
}

function notify() {
  computerQuizBookTick.value += 1
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
  notify()
}

export function listComputerQuizWrongRecords(): StoredComputerQuizRecord[] {
  void computerQuizBookTick.value
  return readJson<StoredComputerQuizRecord[]>(WRONG_KEY, [])
}

export function listComputerQuizFavoriteRecords(): StoredComputerQuizRecord[] {
  void computerQuizBookTick.value
  return readJson<StoredComputerQuizRecord[]>(FAVORITE_KEY, [])
}

export function upsertComputerQuizWrong(q: ComputerQuizQuestion) {
  const rows = listComputerQuizWrongRecords()
  const hit = rows.find((r) => r.fingerprint === q.fingerprint)
  const now = new Date().toISOString()
  if (hit) {
    hit.wrongCount = (hit.wrongCount ?? 0) + 1
    hit.updatedAt = now
  } else {
    rows.unshift({ ...q, wrongCount: 1, updatedAt: now })
  }
  writeJson(WRONG_KEY, rows)
}

export function removeComputerQuizWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listComputerQuizWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
}

export function isComputerQuizFavorite(fingerprint: string): boolean {
  void computerQuizBookTick.value
  return listComputerQuizFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleComputerQuizFavorite(q: ComputerQuizQuestion): 'added' | 'removed' {
  const rows = listComputerQuizFavoriteRecords()
  const idx = rows.findIndex((r) => r.fingerprint === fingerprintOf(q))
  if (idx >= 0) {
    rows.splice(idx, 1)
    writeJson(FAVORITE_KEY, rows)
    return 'removed'
  }
  rows.unshift({ ...q, savedAt: new Date().toISOString() })
  writeJson(FAVORITE_KEY, rows)
  return 'added'
}

function fingerprintOf(q: ComputerQuizQuestion) {
  return q.fingerprint
}

export function removeComputerQuizFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listComputerQuizFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
}

export function listComputerQuizAvoidStems(itemId: string): string[] {
  const all = readJson<Record<string, string[]>>(AVOID_KEY, {})
  return all[itemId] ?? []
}

export function appendComputerQuizAvoidStems(itemId: string, stems: string[]) {
  const all = readJson<Record<string, string[]>>(AVOID_KEY, {})
  const next = [...(all[itemId] ?? []), ...stems.map((s) => s.replace(/\s+/g, '').slice(0, 60))]
  all[itemId] = [...new Set(next)].slice(-48)
  writeJson(AVOID_KEY, all)
}
