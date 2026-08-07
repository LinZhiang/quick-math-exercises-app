/** 口算·文言句式：特殊句式快判；本地题库（仅普通题）
 * 抽题：优先出尚未出过的知识点；出完后清空再循环。
 */

import { WENYAN_JUSHI_BANK } from '@/utils/wenyanJushiBank'
import type { WenyanJushiBankItem } from '@/utils/wenyanJushiBankTypes'
import { resolveFactExplanation } from '@/utils/factExplanationOverrides'

export type WenyanJushiMode = 'wenyan-jushi-normal'

export type WenyanJushiModeConfig = {
  id: WenyanJushiMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const WENYAN_JUSHI_MODES: WenyanJushiModeConfig[] = [
  {
    id: 'wenyan-jushi-normal',
    label: '普通题',
    durationSec: 67,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '67 秒 · 文言特殊句式 · 按知识点未出优先 · 对 +8 / 错 -15',
  },
]

export type WenyanJushiQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

const USED_KEYS_STORAGE = 'mental-wenyan-jushi-used-keys-v1'

type UsedMap = { normal: string[] }

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function knowledgeKey(item: Pick<WenyanJushiBankItem, 'stem' | 'correct'>): string {
  return normalizeKey(`${item.stem}|${item.correct}`)
}

function emptyUsedMap(): UsedMap {
  return { normal: [] }
}

function readUsedMap(): UsedMap {
  try {
    const raw = localStorage.getItem(USED_KEYS_STORAGE)
    if (!raw) return emptyUsedMap()
    const parsed = JSON.parse(raw) as Partial<UsedMap>
    const out = emptyUsedMap()
    if (Array.isArray(parsed.normal)) {
      out.normal = parsed.normal
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

function poolFor(): WenyanJushiBankItem[] {
  const seen = new Set<string>()
  const out: WenyanJushiBankItem[] = []
  for (const item of WENYAN_JUSHI_BANK) {
    const k = knowledgeKey(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

function listUsedKeys(): string[] {
  return readUsedMap().normal
}

function clearUsedKeys() {
  writeUsedMap(emptyUsedMap())
}

function markUsedKey(key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const map = readUsedMap()
  const merged = map.normal.filter((x) => x !== k)
  merged.push(k)
  map.normal = merged
  writeUsedMap(map)
}

export function clearWenyanJushiUsedKeys(_mode?: WenyanJushiMode) {
  clearUsedKeys()
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
  item: WenyanJushiBankItem,
  optionCount: number,
): WenyanJushiQuestion {
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
    distractors.push(`其他句式 ${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: resolveFactExplanation('wenyan-jushi', item.key, item.explanation),
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

export function generateWenyanJushiQuestion(
  mode: WenyanJushiMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): WenyanJushiQuestion {
  void mode
  const pool = poolFor()
  if (!pool.length) throw new Error('「文言句式」题库为空')

  const avoidStems = avoidStemSet(avoidFingerprints)

  const pickFrom = (candidates: WenyanJushiBankItem[]): WenyanJushiQuestion | null => {
    for (const item of shuffle(candidates)) {
      if (avoidStems.has(normalizeKey(item.stem))) continue
      const q = buildMcq(id, item, optionCount)
      markUsedKey(knowledgeKey(item))
      return q
    }
    return null
  }

  const used = new Set(listUsedKeys())
  let unused = pool.filter((item) => !used.has(knowledgeKey(item)))

  if (unused.length === 0) {
    clearUsedKeys()
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

export function isWenyanJushiMode(mode: string): mode is WenyanJushiMode {
  return mode === 'wenyan-jushi-normal'
}

export function getWenyanJushiModeConfig(mode: WenyanJushiMode): WenyanJushiModeConfig {
  const hit = WENYAN_JUSHI_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知「文言句式」模式: ${mode}`)
  return hit
}
