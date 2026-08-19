/** 口算·体制管理：岗位层级 / 职责辨析快判；本地题库（仅普通题）
 * 抽题：优先出尚未出过的知识点；出完后清空再循环。
 */

import { SYSTEM_MGMT_BANK } from '@/utils/chinese/systemMgmtBank'
import type { SystemMgmtBankItem } from '@/utils/chinese/systemMgmtBankTypes'
import { resolveFactExplanation } from '@/utils/chinese/factExplanationOverrides'

export type SystemMgmtMode = 'system-mgmt-normal'

export type SystemMgmtModeConfig = {
  id: SystemMgmtMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const SYSTEM_MGMT_MODES: SystemMgmtModeConfig[] = [
  {
    id: 'system-mgmt-normal',
    label: '普通题',
    durationSec: 52,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '52 秒 · 体制/企业管理岗位辨析 · 按知识点未出优先 · 对 +8 / 错 -15',
  },
]

export type SystemMgmtQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

const USED_KEYS_STORAGE = 'mental-system-mgmt-used-keys-v1'

type UsedMap = { normal: string[] }

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function knowledgeKey(item: Pick<SystemMgmtBankItem, 'stem' | 'correct'>): string {
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

function poolFor(): SystemMgmtBankItem[] {
  const seen = new Set<string>()
  const out: SystemMgmtBankItem[] = []
  for (const item of SYSTEM_MGMT_BANK) {
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

export function clearSystemMgmtUsedKeys(_mode?: SystemMgmtMode) {
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
  item: SystemMgmtBankItem,
  optionCount: number,
): SystemMgmtQuestion {
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
    distractors.push(`其他岗位概念 ${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: resolveFactExplanation('system-mgmt', item.key, item.explanation),
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

export function generateSystemMgmtQuestion(
  mode: SystemMgmtMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): SystemMgmtQuestion {
  void mode
  const pool = poolFor()
  if (!pool.length) throw new Error('「体制管理」题库为空')

  const avoidStems = avoidStemSet(avoidFingerprints)

  const pickFrom = (candidates: SystemMgmtBankItem[]): SystemMgmtQuestion | null => {
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

export function isSystemMgmtMode(mode: string): mode is SystemMgmtMode {
  return mode === 'system-mgmt-normal'
}

export function getSystemMgmtModeConfig(mode: SystemMgmtMode): SystemMgmtModeConfig {
  const hit = SYSTEM_MGMT_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知「体制管理」模式: ${mode}`)
  return hit
}
