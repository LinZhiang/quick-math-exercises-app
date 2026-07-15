/** 口算·生活常识：短题干快速判断；本地 1500 题库（500×3），近 90 题知识点不重复 */

import {
  LIFE_SENSE_BANK,
  type LifeSenseBankItem,
} from '@/utils/lifeSenseBank.generated'

export type LifeSenseMode = 'life-sense-easy' | 'life-sense-normal' | 'life-sense-hard'

export type LifeSenseModeConfig = {
  id: LifeSenseMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const LIFE_SENSE_MODES: LifeSenseModeConfig[] = [
  {
    id: 'life-sense-easy',
    label: '简单题',
    durationSec: 30,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '30 秒 · 校对题库快判 · 短题干短选项 · 近 90 题不重复 · 对 +5 / 错 -10',
  },
  {
    id: 'life-sense-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 校对题库易混快判 · 短题干短选项 · 近 90 题不重复 · 对 +8 / 错 -15',
  },
  {
    id: 'life-sense-hard',
    label: '复杂题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 校对题库高频易混 · 短题干短选项 · 近 90 题不重复 · 对 +10 / 错 -20',
  },
]

export type LifeSenseQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

/** 与语文生成题一致：连续约 90 道内同一知识点不重复 */
export const LIFE_SENSE_RECENT_LIMIT = 90
const HISTORY_KEY = 'mental-life-sense-recent-keys-v1'

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function readRecentKeys(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((t) => (typeof t === 'string' ? normalizeKey(t) : ''))
      .filter(Boolean)
      .slice(-LIFE_SENSE_RECENT_LIMIT)
  } catch {
    return []
  }
}

function writeRecentKeys(keys: string[]) {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(keys.map(normalizeKey).filter(Boolean).slice(-LIFE_SENSE_RECENT_LIMIT)),
    )
  } catch {
    /* ignore quota */
  }
}

export function listRecentLifeSenseKeys(): string[] {
  return readRecentKeys()
}

export function appendLifeSenseKey(key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const merged = readRecentKeys().filter((x) => x !== k)
  merged.push(k)
  writeRecentKeys(merged)
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function difficultyOf(mode: LifeSenseMode): 'easy' | 'normal' | 'hard' {
  if (mode === 'life-sense-hard') return 'hard'
  if (mode === 'life-sense-normal') return 'normal'
  return 'easy'
}

function poolFor(mode: LifeSenseMode): LifeSenseBankItem[] {
  const d = difficultyOf(mode)
  return LIFE_SENSE_BANK.filter((q) => q.difficulty === d)
}

function buildMcq(
  id: number,
  item: LifeSenseBankItem,
  optionCount: number,
): LifeSenseQuestion {
  const need = Math.max(2, optionCount - 1)
  const pool = item.distractors
    .map((x) => x.trim())
    .filter((x) => x && x !== item.correct)
  const distractors = shuffle(pool).slice(0, need)
  while (distractors.length < need) {
    const extra = pool.find((x) => !distractors.includes(x))
    if (!extra) break
    distractors.push(extra)
  }
  while (distractors.length < need) {
    distractors.push(`选项${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: item.explanation,
  }
}

function itemKey(item: LifeSenseBankItem): string {
  return normalizeKey(item.key || `${item.stem}|${item.correct}`)
}

export function generateLifeSenseQuestion(
  mode: LifeSenseMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): LifeSenseQuestion {
  const recent = new Set(readRecentKeys())
  const pool = poolFor(mode)
  const shuffled = shuffle(pool)

  const tryPick = (respectRecent: boolean): LifeSenseQuestion | null => {
    for (const item of shuffled) {
      const key = itemKey(item)
      if (respectRecent && recent.has(key)) continue
      const q = buildMcq(id, item, optionCount)
      const fp = `${q.expression}\u001e${[...q.options].sort().join('\u001f')}`
      if (avoidFingerprints.has(fp)) continue
      appendLifeSenseKey(key)
      return q
    }
    return null
  }

  return (
    tryPick(true) ??
    tryPick(false) ??
    buildMcq(id, shuffled[0] ?? pool[0]!, optionCount)
  )
}

export function isLifeSenseMode(mode: string): mode is LifeSenseMode {
  return mode === 'life-sense-easy' || mode === 'life-sense-normal' || mode === 'life-sense-hard'
}

export function getLifeSenseBankStats() {
  const easy = LIFE_SENSE_BANK.filter((x) => x.difficulty === 'easy').length
  const normal = LIFE_SENSE_BANK.filter((x) => x.difficulty === 'normal').length
  const hard = LIFE_SENSE_BANK.filter((x) => x.difficulty === 'hard').length
  return { easy, normal, hard, total: LIFE_SENSE_BANK.length }
}
