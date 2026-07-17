/** 口算·缩句练习：去掉定状补，留下主谓宾主干 */

import {
  SHORTEN_SENTENCE_BANK,
  type ShortenSentenceItem,
} from '@/utils/shortenSentenceBank'

export type ShortenSentenceMode = 'shorten-sentence-easy' | 'shorten-sentence-hard'

export type ShortenSentenceModeConfig = {
  id: ShortenSentenceMode
  label: string
  /** 0 = 不计倒计时，只累计用时 */
  durationSec: number
  questionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
  bankDifficulty: 'easy' | 'hard'
}

export const SHORTEN_SENTENCE_MODES: ShortenSentenceModeConfig[] = [
  {
    id: 'shorten-sentence-easy',
    label: '简单题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -20,
    maxScore: 100,
    desc: '5 题 · 时事短句缩句 · 不计时 · 对 +20 / 错 -20',
    bankDifficulty: 'easy',
  },
  {
    id: 'shorten-sentence-hard',
    label: '困难题',
    durationSec: 0,
    questionCount: 5,
    correctDelta: 20,
    wrongDelta: -20,
    maxScore: 100,
    desc: '5 题 · 时事长句缩句 · 不计时 · 对 +20 / 错 -20',
    bankDifficulty: 'hard',
  },
]

export type ShortenSentenceQuestion = {
  id: number
  item: ShortenSentenceItem
  prompt: string
  explanation: string
}

const CURSOR_KEY = 'mental-shorten-sentence-cursor-v1'

type CursorMap = Record<'easy' | 'hard', number>

let memoryCursors: CursorMap = { easy: 0, hard: 0 }
let memoryHydrated = false

function hydrateCursorsOnce() {
  if (memoryHydrated) return
  memoryHydrated = true
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(CURSOR_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<CursorMap>
    memoryCursors = {
      easy: typeof parsed.easy === 'number' ? parsed.easy : 0,
      hard: typeof parsed.hard === 'number' ? parsed.hard : 0,
    }
  } catch {
    /* ignore */
  }
}

function readCursors(): CursorMap {
  hydrateCursorsOnce()
  return { ...memoryCursors }
}

function writeCursors(map: CursorMap) {
  memoryCursors = { ...map }
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CURSOR_KEY, JSON.stringify(memoryCursors))
  } catch {
    /* ignore */
  }
}

export function isShortenSentenceMode(mode: string): mode is ShortenSentenceMode {
  return mode === 'shorten-sentence-easy' || mode === 'shorten-sentence-hard'
}

export function getShortenSentenceModeConfig(mode: ShortenSentenceMode): ShortenSentenceModeConfig {
  const hit = SHORTEN_SENTENCE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`Unknown shorten sentence mode: ${mode}`)
  return hit
}

export function clampShortenSentenceScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

function poolFor(mode: ShortenSentenceMode): ShortenSentenceItem[] {
  const diff = getShortenSentenceModeConfig(mode).bankDifficulty
  return SHORTEN_SENTENCE_BANK.filter((s) => s.difficulty === diff)
}

function cursorKey(mode: ShortenSentenceMode): 'easy' | 'hard' {
  return mode === 'shorten-sentence-hard' ? 'hard' : 'easy'
}

function takeNextItem(mode: ShortenSentenceMode): ShortenSentenceItem {
  const pool = poolFor(mode)
  const key = cursorKey(mode)
  const cursors = readCursors()
  const idx = ((cursors[key] % pool.length) + pool.length) % pool.length
  cursors[key] = idx + 1
  writeCursors(cursors)
  return pool[idx]!
}

export function generateShortenSentenceQuestion(
  mode: ShortenSentenceMode,
  id: number,
): ShortenSentenceQuestion {
  const item = takeNextItem(mode)
  const alts = item.alternates?.length
    ? `（也可接受：${item.alternates.join(' / ')}）`
    : ''
  return {
    id,
    item,
    prompt: '请缩写句子：滑动圈选主干词语（也可手动输入），去掉定状补等修饰，留下主谓宾主干。',
    explanation: `标准缩句：${item.shortened}${alts} 来源：${item.source}`,
  }
}

export function getShortenSentenceQuestionFingerprint(q: ShortenSentenceQuestion): string {
  return `shorten-sentence:${q.item.id}`
}

/** 去掉标点空白后比较 */
export function normalizeShortenAnswer(text: string): string {
  return text
    .replace(/[，。、；：！？\s"'“”‘’《》【】（）()\[\]{}·…—\-～~、]/g, '')
    .trim()
    .toLowerCase()
}

export function validateShortenSentenceAnswer(
  item: ShortenSentenceItem,
  answer: string,
): { ok: boolean; detail: string } {
  const got = normalizeShortenAnswer(answer)
  if (!got) {
    return { ok: false, detail: '未填写缩句' }
  }
  const candidates = [item.shortened, ...(item.alternates ?? [])].map(normalizeShortenAnswer)
  if (candidates.includes(got)) {
    return { ok: true, detail: '缩句正确' }
  }
  return {
    ok: false,
    detail: `标准答案：${item.shortened}${
      item.alternates?.length ? `；也可：${item.alternates.join('、')}` : ''
    }`,
  }
}
