/** 口算·生活常识：短题干快速判断；本地题库
 * 抽题：优先出本难度尚未出过的知识点（题干+答案）；该难度出完后清空已用状态再循环。
 * 本局避免重复题干；仅在真正选出一题后记入已用，避免重试误记。
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
    desc: '30 秒 · 去重题库快判 · 按知识点未出优先，出完重置再循环 · 对 +5 / 错 -10',
  },
  {
    id: 'life-sense-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 去重题库易混快判 · 按知识点未出优先，出完重置再循环 · 对 +8 / 错 -15',
  },
  {
    id: 'life-sense-hard',
    label: '复杂题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 去重题库高频易混 · 按知识点未出优先，出完重置再循环 · 对 +10 / 错 -20',
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
const USED_KEYS_STORAGE = 'mental-life-sense-used-keys-v3'
/** 旧版 key，迁移后删除 */
const LEGACY_USED_V2 = 'mental-life-sense-used-keys-v2'
const LEGACY_RECENT_KEY = 'mental-life-sense-recent-keys-v1'

type UsedMap = Record<LifeSenseDifficulty, string[]>

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

/** 知识点身份：同一题干+答案只算一题，避免干扰项变体被当成「未出」 */
function knowledgeKey(item: Pick<LifeSenseBankItem, 'stem' | 'correct'>): string {
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
  const seen = new Set<string>()
  const out: LifeSenseBankItem[] = []
  for (const item of LIFE_SENSE_BANK) {
    if (item.difficulty !== d) continue
    const k = knowledgeKey(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
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

/** 本局 avoid 指纹：题干（与 getMentalMathQuestionFingerprint 一致） */
function avoidStemSet(avoidFingerprints: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const raw of avoidFingerprints) {
    const s = String(raw || '')
    if (!s) continue
    out.add(normalizeKey(s.split('\u001e')[0] || s))
  }
  return out
}

function migrateLegacyUsedKeys() {
  try {
    if (localStorage.getItem(LEGACY_RECENT_KEY)) localStorage.removeItem(LEGACY_RECENT_KEY)
    if (localStorage.getItem(LEGACY_USED_V2)) localStorage.removeItem(LEGACY_USED_V2)
  } catch {
    /* ignore */
  }
}

export function generateLifeSenseQuestion(
  mode: LifeSenseMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): LifeSenseQuestion {
  migrateLegacyUsedKeys()

  const diff = difficultyOf(mode)
  const pool = poolFor(mode)
  if (!pool.length) {
    throw new Error('生活常识题库为空')
  }

  const avoidStems = avoidStemSet(avoidFingerprints)

  const pickFrom = (candidates: LifeSenseBankItem[]): LifeSenseQuestion | null => {
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

export function isLifeSenseMode(mode: string): mode is LifeSenseMode {
  return mode === 'life-sense-easy' || mode === 'life-sense-normal' || mode === 'life-sense-hard'
}

export function getLifeSenseModeConfig(mode: LifeSenseMode): LifeSenseModeConfig {
  const hit = LIFE_SENSE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知生活常识模式: ${mode}`)
  return hit
}

/** 题库去重后各难度知识点数量（调试用） */
export function countLifeSenseKnowledge(mode?: LifeSenseMode): number {
  if (mode) return poolFor(mode).length
  return (
    poolFor('life-sense-easy').length +
    poolFor('life-sense-normal').length +
    poolFor('life-sense-hard').length
  )
}
