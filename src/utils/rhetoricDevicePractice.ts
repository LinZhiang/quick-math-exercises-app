/** 快判·修辞手法：给句子选主要修辞；本地题库（仅普通题）
 * 抽题：优先出尚未出过的；出完后清空再循环。
 */

import { RHETORIC_DEVICE_BANK } from '@/utils/rhetoricDeviceBank'
import type { RhetoricDeviceBankItem } from '@/utils/rhetoricDeviceBankTypes'
import { resolveFactExplanation } from '@/utils/factExplanationOverrides'

export type RhetoricDeviceMode = 'rhetoric-device-normal'

export type RhetoricDeviceModeConfig = {
  id: RhetoricDeviceMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const RHETORIC_DEVICE_MODES: RhetoricDeviceModeConfig[] = [
  {
    id: 'rhetoric-device-normal',
    label: '普通题',
    durationSec: 52,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '52 秒 · 给句子选主要修辞 · 对比/衬托/比喻等 10 种 · 对 +8 / 错 -15',
  },
]

export type RhetoricDeviceQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

const USED_KEYS_STORAGE = 'mental-rhetoric-device-used-keys-v1'

type UsedMap = { normal: string[] }

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function knowledgeKey(item: Pick<RhetoricDeviceBankItem, 'stem' | 'correct'>): string {
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

function poolFor(): RhetoricDeviceBankItem[] {
  const seen = new Set<string>()
  const out: RhetoricDeviceBankItem[] = []
  for (const item of RHETORIC_DEVICE_BANK) {
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

export function clearRhetoricDeviceUsedKeys(_mode?: RhetoricDeviceMode) {
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
  item: RhetoricDeviceBankItem,
  optionCount: number,
): RhetoricDeviceQuestion {
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
    distractors.push(`其他修辞 ${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: resolveFactExplanation('rhetoric-device', item.key, item.explanation),
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

export function generateRhetoricDeviceQuestion(
  mode: RhetoricDeviceMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): RhetoricDeviceQuestion {
  void mode
  const pool = poolFor()
  if (!pool.length) throw new Error('「修辞手法」题库为空')

  const avoidStems = avoidStemSet(avoidFingerprints)

  const pickFrom = (candidates: RhetoricDeviceBankItem[]): RhetoricDeviceQuestion | null => {
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

export function isRhetoricDeviceMode(mode: string): mode is RhetoricDeviceMode {
  return mode === 'rhetoric-device-normal'
}

export function getRhetoricDeviceModeConfig(mode: RhetoricDeviceMode): RhetoricDeviceModeConfig {
  const hit = RHETORIC_DEVICE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知「修辞手法」模式: ${mode}`)
  return hit
}
