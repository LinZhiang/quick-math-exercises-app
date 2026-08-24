import { frontendQuizBookTick } from '@/utils/frontend/frontendHandoutQuizStorage'

export const FRONTEND_QUIZ_NOTES_KEY = 'frontend-handout-quiz-notes-v1'

type NotesMap = Record<string, string>

function readNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(FRONTEND_QUIZ_NOTES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: NotesMap = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim()
    }
    return out
  } catch {
    return {}
  }
}

function writeNotes(map: NotesMap) {
  localStorage.setItem(FRONTEND_QUIZ_NOTES_KEY, JSON.stringify(map))
  frontendQuizBookTick.value += 1
}

/** 默认无备注，返回空字符串。错题与收藏共用同一指纹。 */
export function getFrontendQuizNote(fingerprint: string): string {
  void frontendQuizBookTick.value
  return readNotes()[fingerprint] ?? ''
}

export function setFrontendQuizNote(fingerprint: string, note: string) {
  const fp = String(fingerprint ?? '').trim()
  if (!fp) return
  const map = readNotes()
  const trimmed = note.trim()
  if (!trimmed) delete map[fp]
  else map[fp] = trimmed
  writeNotes(map)
}

/** 错题和收藏都已删除时再清备注 */
export function removeFrontendQuizNote(fingerprint: string) {
  const fp = String(fingerprint ?? '').trim()
  if (!fp) return
  const map = readNotes()
  if (!(fp in map)) return
  delete map[fp]
  writeNotes(map)
}
