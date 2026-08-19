/** 口算·这是什么：什么是xx + 释义选项快判；本地题库
 * 抽题：优先出本难度尚未出过的知识点；该难度出完后清空再循环。
 */

import {
  WHAT_IS_THIS_BANK,
  type WhatIsThisBankItem,
} from '@/utils/chinese/whatIsThisBank.generated'
import { resolveFactExplanation } from '@/utils/chinese/factExplanationOverrides'

export type WhatIsThisMode =
  | 'what-is-this-easy'
  | 'what-is-this-normal'
  | 'what-is-this-hard'

export type WhatIsThisModeConfig = {
  id: WhatIsThisMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const WHAT_IS_THIS_MODES: WhatIsThisModeConfig[] = [
  {
    id: 'what-is-this-easy',
    label: '简单题',
    durationSec: 42,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '42 秒 · 日常专有名词释义 · 按知识点未出优先 · 对 +5 / 错 -10',
  },
  {
    id: 'what-is-this-normal',
    label: '普通题',
    durationSec: 52,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '52 秒 · 经管法务等专有名词 · 按知识点未出优先 · 对 +8 / 错 -15',
  },
  {
    id: 'what-is-this-hard',
    label: '复杂题',
    durationSec: 62,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '62 秒 · 宏观/科技等高阶专有名词 · 按知识点未出优先 · 对 +10 / 错 -20',
  },
]

export type WhatIsThisQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

type WhatIsThisDifficulty = 'easy' | 'normal' | 'hard'

const USED_KEYS_STORAGE = 'mental-what-is-this-used-keys-v1'

type UsedMap = Record<WhatIsThisDifficulty, string[]>

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function knowledgeKey(item: Pick<WhatIsThisBankItem, 'stem' | 'correct'>): string {
  return normalizeKey(`${item.stem}|${item.correct}`)
}

function emptyUsedMap(): UsedMap {
  return { easy: [], normal: [], hard: [] }
}

function readUsedMap(): UsedMap {
  try {
    const raw = localStorage.getItem(USED_KEYS_STORAGE)
    if (!raw) return emptyUsedMap()
    const parsed = JSON.parse(raw) as Partial<UsedMap>
    const out = emptyUsedMap()
    for (const d of ['easy', 'normal', 'hard'] as const) {
      const arr = parsed[d]
      if (!Array.isArray(arr)) continue
      out[d] = arr
        .map((t) => (typeof t === 'string' ? normalizeKey(t) : ''))
        .filter(Boolean)
    }
    return out
  } catch {
    return emptyUsedMap()
  }
}

function writeUsedMap(map: UsedMap) {
  try {
    localStorage.setItem(USED_KEYS_STORAGE, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function difficultyOf(mode: WhatIsThisMode): WhatIsThisDifficulty {
  if (mode === 'what-is-this-hard') return 'hard'
  if (mode === 'what-is-this-normal') return 'normal'
  return 'easy'
}

function poolFor(mode: WhatIsThisMode): WhatIsThisBankItem[] {
  const d = difficultyOf(mode)
  const seen = new Set<string>()
  const out: WhatIsThisBankItem[] = []
  for (const item of WHAT_IS_THIS_BANK) {
    if (item.difficulty !== d) continue
    const k = knowledgeKey(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

function listUsedKeys(diff: WhatIsThisDifficulty): string[] {
  return readUsedMap()[diff]
}

function clearUsedKeys(diff: WhatIsThisDifficulty) {
  const map = readUsedMap()
  map[diff] = []
  writeUsedMap(map)
}

function markUsedKey(diff: WhatIsThisDifficulty, key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const map = readUsedMap()
  const merged = map[diff].filter((x) => x !== k)
  merged.push(k)
  map[diff] = merged
  writeUsedMap(map)
}

export function clearWhatIsThisUsedKeys(mode?: WhatIsThisMode) {
  if (!mode) {
    writeUsedMap(emptyUsedMap())
    return
  }
  clearUsedKeys(difficultyOf(mode))
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

function buildMcq(
  id: number,
  item: WhatIsThisBankItem,
  optionCount: number,
): WhatIsThisQuestion {
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
    distractors.push(`其他专有概念释义 ${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: resolveFactExplanation('what-is-this', item.key, item.explanation),
  }
}

function avoidStemSet(avoidFingerprints: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const raw of avoidFingerprints) {
    const s = String(raw || '')
    if (!s) continue
    out.add(normalizeKey(s.split('\u001e')[0] || s))
  }
  return out
}

export function generateWhatIsThisQuestion(
  mode: WhatIsThisMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): WhatIsThisQuestion {
  const diff = difficultyOf(mode)
  const pool = poolFor(mode)
  if (!pool.length) throw new Error('「这是什么」题库为空')

  const avoidStems = avoidStemSet(avoidFingerprints)

  const pickFrom = (candidates: WhatIsThisBankItem[]): WhatIsThisQuestion | null => {
    for (const item of shuffle(candidates)) {
      if (avoidStems.has(normalizeKey(item.stem))) continue
      const q = buildMcq(id, item, optionCount)
      markUsedKey(diff, knowledgeKey(item))
      return q
    }
    return null
  }

  const used = new Set(listUsedKeys(diff))
  let unused = pool.filter((item) => !used.has(knowledgeKey(item)))

  if (unused.length === 0) {
    clearUsedKeys(diff)
    unused = [...pool]
  }

  const poolFreshInSession = pool.filter((item) => !avoidStems.has(normalizeKey(item.stem)))

  return (
    pickFrom(unused) ??
    pickFrom(poolFreshInSession) ??
    pickFrom(pool) ??
    buildMcq(id, shuffle(pool)[0]!, optionCount)
  )
}

export function isWhatIsThisMode(mode: string): mode is WhatIsThisMode {
  return (
    mode === 'what-is-this-easy' ||
    mode === 'what-is-this-normal' ||
    mode === 'what-is-this-hard'
  )
}

export function getWhatIsThisModeConfig(mode: WhatIsThisMode): WhatIsThisModeConfig {
  const hit = WHAT_IS_THIS_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知「这是什么」模式: ${mode}`)
  return hit
}
