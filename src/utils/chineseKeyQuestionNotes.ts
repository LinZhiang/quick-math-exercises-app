import { chinesePracticeDataTick } from '@/utils/chineseIdiomStorage'
import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'

const NOTES_KEY = 'chinese-key-question-notes-v1'

type NotesMap = Record<string, string>

function noteKey(source: ChineseKeyQuestionSource, fingerprint: string): string {
  return `${source}\u001e${fingerprint}`
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
  chinesePracticeDataTick.value += 1
}

/** 默认无备注，返回空字符串 */
export function getKeyQuestionNote(source: ChineseKeyQuestionSource, fingerprint: string): string {
  return readNotes()[noteKey(source, fingerprint)] ?? ''
}

export function setKeyQuestionNote(
  source: ChineseKeyQuestionSource,
  fingerprint: string,
  note: string,
) {
  const map = readNotes()
  const key = noteKey(source, fingerprint)
  const trimmed = note.trim()
  if (!trimmed) delete map[key]
  else map[key] = trimmed
  writeNotes(map)
}
