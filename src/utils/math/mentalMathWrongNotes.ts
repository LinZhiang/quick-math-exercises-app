import { readUserJson, writeUserJson } from '@/utils/app/syncedUserJson'
import { mentalMathWrongBookTick } from '@/utils/math/mentalMathWrongBook'
import type { MentalMathWrongSection } from '@/utils/math/mentalMathWrongBook'

const NOTES_KEY = 'mental-math-wrong-notes-v1'

type NotesMap = Record<string, string>

function noteKey(section: MentalMathWrongSection, fingerprint: string): string {
  return `${section}\u001e${fingerprint}`
}

function readNotes(): NotesMap {
  const parsed = readUserJson<unknown>(NOTES_KEY, {})
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const out: NotesMap = {}
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim()) out[k] = v.trim()
  }
  return out
}

function writeNotes(map: NotesMap) {
  writeUserJson(NOTES_KEY, map)
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
