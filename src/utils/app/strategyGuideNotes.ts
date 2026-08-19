/** 答题攻略「我的备忘录」：按 topicId 持久化到本机 */

const NOTES_KEY = 'mental-math-strategy-guide-notes-v1'

type NotesMap = Record<string, string>

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
}

export function getStrategyGuideNote(topicId: string): string {
  if (!topicId) return ''
  return readNotes()[topicId] ?? ''
}

export function setStrategyGuideNote(topicId: string, note: string) {
  if (!topicId) return
  const map = readNotes()
  const trimmed = note.trim()
  if (!trimmed) delete map[topicId]
  else map[topicId] = trimmed
  writeNotes(map)
}

export function hasStrategyGuideNote(topicId: string): boolean {
  return Boolean(getStrategyGuideNote(topicId))
}
