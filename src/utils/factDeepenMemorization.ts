/**
 * 生活常识 / 这是什么 · 加深识记：先看 20 题解析，再限时测 20 题。
 */
import { LIFE_SENSE_BANK } from '@/utils/lifeSenseBank.generated'
import type { LifeSenseBankItem } from '@/utils/lifeSenseBankTypes'
import {
  resolveFactExplanation,
  type FactBankKind,
} from '@/utils/factExplanationOverrides'
import { WHAT_IS_THIS_BANK } from '@/utils/whatIsThisBank.generated'
import type { WhatIsThisBankItem } from '@/utils/whatIsThisBankTypes'

export type FactDeepenDifficulty = 'easy' | 'normal' | 'hard'

export type FactDeepenKind = FactBankKind

export type FactDeepenModeId =
  | 'life-sense-deepen-easy'
  | 'life-sense-deepen-normal'
  | 'life-sense-deepen-hard'
  | 'what-is-this-deepen-easy'
  | 'what-is-this-deepen-normal'
  | 'what-is-this-deepen-hard'

export type FactDeepenBankItem = {
  kind: FactDeepenKind
  difficulty: FactDeepenDifficulty
  stem: string
  correct: string
  distractors: string[]
  /** 题库原始解析 */
  baseExplanation: string
  key: string
}

export type FactDeepenStudyCard = FactDeepenBankItem & {
  /** 含用户覆盖后的展示解析 */
  explanation: string
}

export type FactDeepenQuizQuestion = {
  id: number
  bankKey: string
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type FactDeepenModeConfig = {
  modeId: FactDeepenModeId
  kind: FactDeepenKind
  difficulty: FactDeepenDifficulty
  label: string
  /** 测验整局倒计时（秒） */
  durationSec: number
  optionCount: number
  batchSize: number
  desc: string
}

export const FACT_DEEPEN_BATCH_SIZE = 20

export const FACT_DEEPEN_MODES: FactDeepenModeConfig[] = [
  {
    modeId: 'life-sense-deepen-easy',
    kind: 'life-sense',
    difficulty: 'easy',
    label: '简单题',
    durationSec: 40,
    optionCount: 3,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 40 秒',
  },
  {
    modeId: 'life-sense-deepen-normal',
    kind: 'life-sense',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 52,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 52 秒',
  },
  {
    modeId: 'life-sense-deepen-hard',
    kind: 'life-sense',
    difficulty: 'hard',
    label: '复杂题',
    durationSec: 64,
    optionCount: 5,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 64 秒',
  },
  {
    modeId: 'what-is-this-deepen-easy',
    kind: 'what-is-this',
    difficulty: 'easy',
    label: '简单题',
    durationSec: 40,
    optionCount: 3,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 40 秒',
  },
  {
    modeId: 'what-is-this-deepen-normal',
    kind: 'what-is-this',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 52,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 52 秒',
  },
  {
    modeId: 'what-is-this-deepen-hard',
    kind: 'what-is-this',
    difficulty: 'hard',
    label: '复杂题',
    durationSec: 64,
    optionCount: 5,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '先识记 20 题 → 限时测 20 题 · 64 秒',
  },
]

const USED_STORAGE: Record<FactDeepenKind, string> = {
  'life-sense': 'fact-deepen-used-life-sense-v1',
  'what-is-this': 'fact-deepen-used-what-is-this-v1',
}

type UsedMap = Record<FactDeepenDifficulty, string[]>

function emptyUsed(): UsedMap {
  return { easy: [], normal: [], hard: [] }
}

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function readUsed(kind: FactDeepenKind): UsedMap {
  try {
    const raw = localStorage.getItem(USED_STORAGE[kind])
    if (!raw) return emptyUsed()
    const parsed = JSON.parse(raw) as Partial<UsedMap>
    const out = emptyUsed()
    for (const d of ['easy', 'normal', 'hard'] as const) {
      const arr = parsed[d]
      if (!Array.isArray(arr)) continue
      out[d] = arr
        .map((t) => (typeof t === 'string' ? normalizeKey(t) : ''))
        .filter(Boolean)
    }
    return out
  } catch {
    return emptyUsed()
  }
}

function writeUsed(kind: FactDeepenKind, map: UsedMap) {
  try {
    localStorage.setItem(USED_STORAGE[kind], JSON.stringify(map))
  } catch {
    /* ignore */
  }
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

function toDeepenItem(
  kind: FactDeepenKind,
  item: LifeSenseBankItem | WhatIsThisBankItem,
): FactDeepenBankItem {
  return {
    kind,
    difficulty: item.difficulty,
    stem: item.stem,
    correct: item.correct,
    distractors: item.distractors,
    baseExplanation: item.explanation,
    key: item.key,
  }
}

function poolFor(kind: FactDeepenKind, difficulty: FactDeepenDifficulty): FactDeepenBankItem[] {
  const bank = kind === 'life-sense' ? LIFE_SENSE_BANK : WHAT_IS_THIS_BANK
  const seen = new Set<string>()
  const out: FactDeepenBankItem[] = []
  for (const item of bank) {
    if (item.difficulty !== difficulty) continue
    const k = normalizeKey(item.key)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(toDeepenItem(kind, item))
  }
  return out
}

export function listFactDeepenModes(kind: FactDeepenKind): FactDeepenModeConfig[] {
  return FACT_DEEPEN_MODES.filter((m) => m.kind === kind)
}

export function getFactDeepenModeConfig(modeId: FactDeepenModeId): FactDeepenModeConfig {
  const hit = FACT_DEEPEN_MODES.find((m) => m.modeId === modeId)
  if (!hit) throw new Error(`未知加深识记模式: ${modeId}`)
  return hit
}

export function isFactDeepenModeId(id: string): id is FactDeepenModeId {
  return FACT_DEEPEN_MODES.some((m) => m.modeId === id)
}

export function factDeepenKindLabel(kind: FactDeepenKind): string {
  return kind === 'life-sense' ? '生活常识' : '这是什么'
}

function withResolvedExplanation(item: FactDeepenBankItem): FactDeepenStudyCard {
  return {
    ...item,
    explanation: resolveFactExplanation(item.kind, item.key, item.baseExplanation),
  }
}

/**
 * 抽取一批加深识记题目（默认 20）；优先未出过的知识点，出完重置再循环。
 */
export function pickFactDeepenBatch(
  kind: FactDeepenKind,
  difficulty: FactDeepenDifficulty,
  count = FACT_DEEPEN_BATCH_SIZE,
): FactDeepenStudyCard[] {
  const pool = poolFor(kind, difficulty)
  if (pool.length < count) {
    throw new Error(`${factDeepenKindLabel(kind)}「${difficulty}」题库不足 ${count} 题`)
  }

  const usedMap = readUsed(kind)
  const used = new Set(usedMap[difficulty])
  let unused = pool.filter((x) => !used.has(normalizeKey(x.key)))
  if (unused.length < count) {
    usedMap[difficulty] = []
    writeUsed(kind, usedMap)
    unused = [...pool]
  }

  const picked = shuffle(unused).slice(0, count)
  const nextUsed = [
    ...usedMap[difficulty].filter((k) => !picked.some((p) => normalizeKey(p.key) === k)),
    ...picked.map((p) => normalizeKey(p.key)),
  ]
  usedMap[difficulty] = nextUsed
  writeUsed(kind, usedMap)

  return picked.map(withResolvedExplanation)
}

export function refreshFactDeepenStudyCard(card: FactDeepenBankItem): FactDeepenStudyCard {
  return withResolvedExplanation(card)
}

function buildQuizFromCard(
  id: number,
  card: FactDeepenStudyCard,
  optionCount: number,
): FactDeepenQuizQuestion {
  const need = Math.max(2, optionCount - 1)
  const pool = card.distractors
    .map((x) => x.trim())
    .filter((x) => x && x !== card.correct)
  const distractors = shuffle(pool).slice(0, need)
  while (distractors.length < need) {
    const extra = pool.find((x) => !distractors.includes(x))
    if (!extra) break
    distractors.push(extra)
  }
  while (distractors.length < need) {
    distractors.push(`选项${distractors.length + 1}`)
  }
  const options = shuffle([card.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === card.correct)
  return {
    id,
    bankKey: card.key,
    expression: card.stem,
    correctAnswer: card.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: resolveFactExplanation(card.kind, card.key, card.baseExplanation),
  }
}

/** 同一批卡片打乱顺序后生成测验题（选项重洗） */
export function buildFactDeepenQuiz(
  cards: FactDeepenStudyCard[],
  optionCount: number,
): FactDeepenQuizQuestion[] {
  return shuffle(cards).map((card, i) => buildQuizFromCard(i + 1, card, optionCount))
}

export function factDeepenDifficultyLabel(d: FactDeepenDifficulty): string {
  if (d === 'hard') return '复杂'
  if (d === 'normal') return '普通'
  return '简单'
}
