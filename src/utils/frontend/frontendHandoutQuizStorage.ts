import { ref } from 'vue'
import type { FrontendQuizQuestion } from '@/utils/frontend/frontendHandoutQuiz'

const WRONG_KEY = 'frontend-handout-quiz-wrong-v1'
const FAVORITE_KEY = 'frontend-handout-quiz-favorite-v1'
const AVOID_KEY = 'frontend-handout-quiz-avoid-v1'

export const frontendQuizBookTick = ref(0)

export type StoredFrontendQuizRecord = FrontendQuizQuestion & {
  wrongCount?: number
  attemptCount?: number
  updatedAt?: string
  savedAt?: string
}

function notify() {
  frontendQuizBookTick.value += 1
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

export function listFrontendQuizWrongRecords(): StoredFrontendQuizRecord[] {
  void frontendQuizBookTick.value
  return readJson<StoredFrontendQuizRecord[]>(WRONG_KEY, [])
}

export function listFrontendQuizFavoriteRecords(): StoredFrontendQuizRecord[] {
  void frontendQuizBookTick.value
  return readJson<StoredFrontendQuizRecord[]>(FAVORITE_KEY, [])
}

export function upsertFrontendQuizWrong(q: FrontendQuizQuestion) {
  const rows = listFrontendQuizWrongRecords()
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

export function removeFrontendQuizWrong(fingerprint: string) {
  writeJson(
    WRONG_KEY,
    listFrontendQuizWrongRecords().filter((r) => r.fingerprint !== fingerprint),
  )
}

export function isFrontendQuizFavorite(fingerprint: string): boolean {
  void frontendQuizBookTick.value
  return listFrontendQuizFavoriteRecords().some((r) => r.fingerprint === fingerprint)
}

export function toggleFrontendQuizFavorite(q: FrontendQuizQuestion): 'added' | 'removed' {
  const rows = listFrontendQuizFavoriteRecords()
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

function fingerprintOf(q: FrontendQuizQuestion) {
  return q.fingerprint
}

export function removeFrontendQuizFavorite(fingerprint: string) {
  writeJson(
    FAVORITE_KEY,
    listFrontendQuizFavoriteRecords().filter((r) => r.fingerprint !== fingerprint),
  )
}

export function listFrontendQuizAvoidStems(itemId: string): string[] {
  const all = readJson<Record<string, string[]>>(AVOID_KEY, {})
  return all[itemId] ?? []
}

export function appendFrontendQuizAvoidStems(itemId: string, stems: string[]) {
  const all = readJson<Record<string, string[]>>(AVOID_KEY, {})
  const next = [...(all[itemId] ?? []), ...stems.map((s) => s.replace(/\s+/g, '').slice(0, 60))]
  all[itemId] = [...new Set(next)].slice(-48)
  writeJson(AVOID_KEY, all)
}

export function bumpFrontendQuizAttempt(fingerprint: string) {
  const fp = String(fingerprint || '').trim()
  if (!fp) return
  const now = new Date().toISOString()
  let changed = false
  const bump = (rows: StoredFrontendQuizRecord[]) => {
    for (const row of rows) {
      if (row.fingerprint !== fp) continue
      row.attemptCount = (row.attemptCount ?? 0) + 1
      row.updatedAt = now
      changed = true
    }
  }
  const wrongs = listFrontendQuizWrongRecords()
  const favs = listFrontendQuizFavoriteRecords()
  bump(wrongs)
  bump(favs)
  if (!changed) return
  writeJson(WRONG_KEY, wrongs)
  writeJson(FAVORITE_KEY, favs)
}
