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

/**
 * 默认无备注，返回空字符串。
 * 成语识记旧版来源 id 为 word-memorization，读取时兼容旧 key。
 */
export function getKeyQuestionNote(source: ChineseKeyQuestionSource, fingerprint: string): string {
  const map = readNotes()
  const direct = map[noteKey(source, fingerprint)]
  if (direct) return direct
  if (source === 'idiom-memorization') {
    return map[noteKey('word-memorization', fingerprint)] ?? ''
  }
  return ''
}

/** 按当前 source 写入；成语识记写入 idiom-memorization key（清空时同步删掉旧 word-memorization key） */
export function setKeyQuestionNote(
  source: ChineseKeyQuestionSource,
  fingerprint: string,
  note: string,
) {
  const map = readNotes()
  const key = noteKey(source, fingerprint)
  const trimmed = note.trim()
  if (!trimmed) {
    delete map[key]
    // 避免 get 时仍从旧 key 回落读出
    if (source === 'idiom-memorization') {
      delete map[noteKey('word-memorization', fingerprint)]
    }
  } else {
    map[key] = trimmed
  }
  writeNotes(map)
}
