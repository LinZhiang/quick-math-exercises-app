import { computerQuizBookTick } from '@/utils/computer/computerHandoutQuizStorage'

export const COMPUTER_QUIZ_NOTES_KEY = 'computer-handout-quiz-notes-v1'

type NotesMap = Record<string, string>

function readNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(COMPUTER_QUIZ_NOTES_KEY)
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
  localStorage.setItem(COMPUTER_QUIZ_NOTES_KEY, JSON.stringify(map))
  computerQuizBookTick.value += 1
}

/** 默认无备注，返回空字符串。错题与收藏共用同一指纹。 */
export function getComputerQuizNote(fingerprint: string): string {
  void computerQuizBookTick.value
  return readNotes()[fingerprint] ?? ''
}

export function setComputerQuizNote(fingerprint: string, note: string) {
  const fp = String(fingerprint ?? '').trim()
  if (!fp) return
  const map = readNotes()
  const trimmed = note.trim()
  if (!trimmed) delete map[fp]
  else map[fp] = trimmed
  writeNotes(map)
}

/** 错题和收藏都已删除时再清备注 */
export function removeComputerQuizNote(fingerprint: string) {
  const fp = String(fingerprint ?? '').trim()
  if (!fp) return
  const map = readNotes()
  if (!(fp in map)) return
  delete map[fp]
  writeNotes(map)
}
