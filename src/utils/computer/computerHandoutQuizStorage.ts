import { ref } from 'vue'
import type { ComputerQuizQuestion } from '@/utils/computer/computerHandoutQuiz'
import { readUserJson, writeUserJson } from '@/utils/app/syncedUserJson'

const WRONG_KEY = 'computer-handout-quiz-wrong-v1'
const FAVORITE_KEY = 'computer-handout-quiz-favorite-v1'
const AVOID_KEY = 'computer-handout-quiz-avoid-v1'

export const computerQuizBookTick = ref(0)

export type StoredComputerQuizRecord = ComputerQuizQuestion & {
  wrongCount?: number
  attemptCount?: number
  updatedAt?: string
  savedAt?: string
}

function notify() {
  computerQuizBookTick.value += 1
}

function readJson<T>(key: string, fallback: T): T {
  return readUserJson(key, fallback)
}

function writeJson(key: string, value: unknown) {
  writeUserJson(key, value)
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

/** 变式答错：用变式题面覆盖错题本/收藏里同一指纹的原题，并记一次错题。 */
export function replaceComputerQuizQuestionContent(q: ComputerQuizQuestion) {
  const fp = String(q.fingerprint || '').trim()
  if (!fp) return
  const now = new Date().toISOString()
  const applyContent = (row: StoredComputerQuizRecord) => {
    row.kind = q.kind
    row.term = q.term
    row.stem = q.stem
    row.options = Array.isArray(q.options) ? [...q.options] : []
    row.correctIndex = q.correctIndex
    row.correctText = q.correctText
    row.explanation = q.explanation
    if (q.itemId) row.itemId = q.itemId
    if (q.itemTitle) row.itemTitle = q.itemTitle
    if (q.learningPath?.length) row.learningPath = [...q.learningPath]
    row.updatedAt = now
  }
  const wrongs = listComputerQuizWrongRecords()
  const favs = listComputerQuizFavoriteRecords()
  let hitWrong = false
  for (const row of wrongs) {
    if (row.fingerprint !== fp) continue
    applyContent(row)
    row.wrongCount = (row.wrongCount ?? 0) + 1
    hitWrong = true
  }
  let hitFav = false
  for (const row of favs) {
    if (row.fingerprint !== fp) continue
    applyContent(row)
    hitFav = true
  }
  if (!hitWrong && !hitFav) {
    wrongs.unshift({ ...q, wrongCount: 1, updatedAt: now })
    hitWrong = true
  }
  if (hitWrong) writeJson(WRONG_KEY, wrongs)
  if (hitFav) writeJson(FAVORITE_KEY, favs)
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
  const next = [...(all[itemId] ?? []), ...stems.map((s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 160))]
  all[itemId] = [...new Set(next.filter(Boolean))].slice(-80)
  writeJson(AVOID_KEY, all)
}

export function bumpComputerQuizAttempt(fingerprint: string) {
  const fp = String(fingerprint || '').trim()
  if (!fp) return
  const now = new Date().toISOString()
  let changed = false
  const bump = (rows: StoredComputerQuizRecord[]) => {
    for (const row of rows) {
      if (row.fingerprint !== fp) continue
      row.attemptCount = (row.attemptCount ?? 0) + 1
      row.updatedAt = now
      changed = true
    }
  }
  const wrongs = listComputerQuizWrongRecords()
  const favs = listComputerQuizFavoriteRecords()
  bump(wrongs)
  bump(favs)
  if (!changed) return
  writeJson(WRONG_KEY, wrongs)
  writeJson(FAVORITE_KEY, favs)
}
