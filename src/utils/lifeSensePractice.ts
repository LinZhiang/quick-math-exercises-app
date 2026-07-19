/** 口算·生活常识：短题干快速判断；本地题库（约 900×3）
 * 抽题：优先出本难度尚未出过的题；该难度题库出完后清空已用状态，再随机重抽，循环往复。
 */

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
    desc: '30 秒 · 校对题库快判 · 未出题优先，出完重置再抽 · 对 +5 / 错 -10',
  },
  {
    id: 'life-sense-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 校对题库易混快判 · 未出题优先，出完重置再抽 · 对 +8 / 错 -15',
  },
  {
    id: 'life-sense-hard',
    label: '复杂题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 校对题库高频易混 · 未出题优先，出完重置再抽 · 对 +10 / 错 -20',
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

type LifeSenseDifficulty = 'easy' | 'normal' | 'hard'

/** 按难度记录已出过的知识点；出完该难度题库后清空再循环 */
const USED_KEYS_STORAGE = 'mental-life-sense-used-keys-v2'
/** 旧版近 90 题滑动窗口，读取时迁移一次后可忽略 */
const LEGACY_RECENT_KEY = 'mental-life-sense-recent-keys-v1'

type UsedMap = Record<LifeSenseDifficulty, string[]>

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
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
    /* ignore quota */
  }
}

function difficultyOf(mode: LifeSenseMode): LifeSenseDifficulty {
  if (mode === 'life-sense-hard') return 'hard'
  if (mode === 'life-sense-normal') return 'normal'
  return 'easy'
}

function poolFor(mode: LifeSenseMode): LifeSenseBankItem[] {
  const d = difficultyOf(mode)
  return LIFE_SENSE_BANK.filter((q) => q.difficulty === d)
}

function listUsedKeys(diff: LifeSenseDifficulty): string[] {
  return readUsedMap()[diff]
}

function clearUsedKeys(diff: LifeSenseDifficulty) {
  const map = readUsedMap()
  map[diff] = []
  writeUsedMap(map)
}

function markUsedKey(diff: LifeSenseDifficulty, key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const map = readUsedMap()
  const merged = map[diff].filter((x) => x !== k)
  merged.push(k)
  map[diff] = merged
  writeUsedMap(map)
}

/** 调试/设置用：清空某难度或全部已用状态 */
export function clearLifeSenseUsedKeys(mode?: LifeSenseMode) {
  if (!mode) {
    writeUsedMap(emptyUsedMap())
    return
  }
  clearUsedKeys(difficultyOf(mode))
}

/** @deprecated 兼容旧调用：现为按难度已用列表 */
export function listRecentLifeSenseKeys(): string[] {
  const map = readUsedMap()
  return [...map.easy, ...map.normal, ...map.hard]
}

/** @deprecated 请使用抽题流程内的 markUsedKey */
export function appendLifeSenseKey(key: string) {
  // 无法判断难度时写入 easy，仅兼容旧调用
  markUsedKey('easy', key)
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
  // 一次性清理旧滑动窗口 key（不再使用）
  try {
    if (localStorage.getItem(LEGACY_RECENT_KEY)) localStorage.removeItem(LEGACY_RECENT_KEY)
  } catch {
    /* ignore */
  }

  const diff = difficultyOf(mode)
  const pool = poolFor(mode)
  if (!pool.length) {
    throw new Error('生活常识题库为空')
  }

  const pickFrom = (candidates: LifeSenseBankItem[]): LifeSenseQuestion | null => {
    for (const item of shuffle(candidates)) {
      const q = buildMcq(id, item, optionCount)
      const fp = `${q.expression}\u001e${[...q.options].sort().join('\u001f')}`
      if (avoidFingerprints.has(fp)) continue
      markUsedKey(diff, itemKey(item))
      return q
    }
    return null
  }

  const used = new Set(listUsedKeys(diff))
  let unused = pool.filter((item) => !used.has(itemKey(item)))

  // 本难度题库已全部出过 → 重置状态后再随机
  if (unused.length === 0) {
    clearUsedKeys(diff)
    unused = [...pool]
  }

  return (
    pickFrom(unused) ??
    // 本局指纹把未用题都挡住时：仍优先未用失败则放宽到全池（不立刻重置，避免同局重复清空）
    pickFrom(pool) ??
    buildMcq(id, shuffle(pool)[0]!, optionCount)
  )
}

export function isLifeSenseMode(mode: string): mode is LifeSenseMode {
  return mode === 'life-sense-easy' || mode === 'life-sense-normal' || mode === 'life-sense-hard'
}

export function getLifeSenseModeConfig(mode: LifeSenseMode): LifeSenseModeConfig {
  const hit = LIFE_SENSE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知生活常识模式: ${mode}`)
  return hit
}
