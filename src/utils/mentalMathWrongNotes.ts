import { mentalMathWrongBookTick } from '@/utils/mentalMathWrongBook'
import type { MentalMathWrongSection } from '@/utils/mentalMathWrongBook'

const NOTES_KEY = 'mental-math-wrong-notes-v1'

type NotesMap = Record<string, string>

function noteKey(section: MentalMathWrongSection, fingerprint: string): string {
  return `${section}\u001e${fingerprint}`
}

function readNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
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
  localStorage.setItem(NOTES_KEY, JSON.stringify(map))
  mentalMathWrongBookTick.value += 1
}

/** 默认无备注，返回空字符串 */
export function getMentalMathWrongNote(
  section: MentalMathWrongSection,
  fingerprint: string,
): string {
  return readNotes()[noteKey(section, fingerprint)] ?? ''
}

export function setMentalMathWrongNote(
  section: MentalMathWrongSection,
  fingerprint: string,
  note: string,
) {
  const map = readNotes()
  const key = noteKey(section, fingerprint)
  const trimmed = note.trim()
  if (!trimmed) delete map[key]
  else map[key] = trimmed
  writeNotes(map)
}

/** 题目删除时顺带清掉备注 */
export function removeMentalMathWrongNote(
  section: MentalMathWrongSection,
  fingerprint: string,
) {
  const map = readNotes()
  const key = noteKey(section, fingerprint)
  if (!(key in map)) return
  delete map[key]
  writeNotes(map)
}

export function clearMentalMathWrongNotesForSection(section: MentalMathWrongSection) {
  const map = readNotes()
  const prefix = `${section}\u001e`
  let changed = false
  for (const key of Object.keys(map)) {
    if (key.startsWith(prefix)) {
      delete map[key]
      changed = true
    }
  }
  if (changed) writeNotes(map)
}
