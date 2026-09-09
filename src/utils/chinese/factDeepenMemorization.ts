/**
 * 生活常识 / 这是什么 / 经济学常识 / 体制管理 / 文言实词 / 文言虚词 / 文言句式 / 修辞手法 / 计算机单词和语法 · 加深识记：按难度固定切成 20 题一组目录，可溯源。
 */
import { CS_VOCAB_BANK } from '@/utils/cs-vocab/csVocabBank'
import type { CsVocabBankItem } from '@/utils/cs-vocab/csVocabBankTypes'
import { csVocabTopicLabel, csVocabTopicOrder } from '@/utils/cs-vocab/csVocabTopics'
import { ECONOMY_SENSE_BANK } from '@/utils/chinese/economySenseBank'
import type { EconomySenseBankItem } from '@/utils/chinese/economySenseBankTypes'
import { LIFE_SENSE_BANK } from '@/utils/chinese/lifeSenseBank.generated'
import type { LifeSenseBankItem } from '@/utils/chinese/lifeSenseBankTypes'
import {
  resolveFactExplanation,
  type FactBankKind,
} from '@/utils/chinese/factExplanationOverrides'
import { RHETORIC_DEVICE_BANK } from '@/utils/chinese/rhetoricDeviceBank'
import type { RhetoricDeviceBankItem } from '@/utils/chinese/rhetoricDeviceBankTypes'
import { SYSTEM_MGMT_BANK } from '@/utils/chinese/systemMgmtBank'
import type { SystemMgmtBankItem } from '@/utils/chinese/systemMgmtBankTypes'
import { WENYAN_SHICI_BANK } from '@/utils/chinese/wenyanShiciBank'
import type { WenyanShiciBankItem } from '@/utils/chinese/wenyanShiciBankTypes'
import { WENYAN_XUCI_BANK } from '@/utils/chinese/wenyanXuciBank'
import type { WenyanXuciBankItem } from '@/utils/chinese/wenyanXuciBankTypes'
import { WENYAN_JUSHI_BANK } from '@/utils/chinese/wenyanJushiBank'
import type { WenyanJushiBankItem } from '@/utils/chinese/wenyanJushiBankTypes'
import { WHAT_IS_THIS_BANK } from '@/utils/chinese/whatIsThisBank.generated'
import type { WhatIsThisBankItem } from '@/utils/chinese/whatIsThisBankTypes'

export type FactDeepenDifficulty = 'easy' | 'normal' | 'hard'

export type FactDeepenKind = FactBankKind

export type FactDeepenModeId =
  | 'life-sense-deepen-easy'
  | 'life-sense-deepen-normal'
  | 'life-sense-deepen-hard'
  | 'what-is-this-deepen-easy'
  | 'what-is-this-deepen-normal'
  | 'what-is-this-deepen-hard'
  | 'economy-sense-deepen-normal'
  | 'system-mgmt-deepen-normal'
  | 'wenyan-shici-deepen-normal'
  | 'wenyan-xuci-deepen-normal'
  | 'wenyan-jushi-deepen-normal'
  | 'rhetoric-device-deepen-normal'
  | 'cs-vocab-deepen-normal'

export type FactDeepenBankItem = {
  kind: FactDeepenKind
  difficulty: FactDeepenDifficulty
  stem: string
  correct: string
  distractors: string[]
  /** 题库原始解析 */
  baseExplanation: string
  key: string
  /** 计算机单词和语法：考点类型 */
  topic?: string
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
  /** 满组（20 题）测验整局倒计时（秒）；不足 20 题按时长比例缩放 */
  durationSec: number
  optionCount: number
  batchSize: number
  desc: string
}

/** 目录中的一组 */
export type FactDeepenGroupMeta = {
  modeId: FactDeepenModeId
  kind: FactDeepenKind
  difficulty: FactDeepenDifficulty
  /** 从 0 起 */
  groupIndex: number
  /** 展示用从 1 起 */
  groupNo: number
  /** 本组题数（末组可能不足 20） */
  count: number
  /** 全局题号区间（1-based，本难度内） */
  fromNo: number
  toNo: number
  /** 首题题干摘要，便于目录辨认 */
  previewStem: string
  title: string
  /** 在本难度题池中的起始下标；缺省则按 groupIndex * batchSize */
  poolStart?: number
}

export type FactDeepenGroupStat = {
  correct: number
  total: number
  finishedAt: string
}

export const FACT_DEEPEN_BATCH_SIZE = 20

export const FACT_DEEPEN_MODES: FactDeepenModeConfig[] = [
  {
    modeId: 'life-sense-deepen-easy',
    kind: 'life-sense',
    difficulty: 'easy',
    label: '简单题',
    durationSec: 65,
    optionCount: 3,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 65 秒',
  },
  {
    modeId: 'life-sense-deepen-normal',
    kind: 'life-sense',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'life-sense-deepen-hard',
    kind: 'life-sense',
    difficulty: 'hard',
    label: '复杂题',
    durationSec: 89,
    optionCount: 5,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 89 秒',
  },
  {
    modeId: 'what-is-this-deepen-easy',
    kind: 'what-is-this',
    difficulty: 'easy',
    label: '简单题',
    durationSec: 65,
    optionCount: 3,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 65 秒',
  },
  {
    modeId: 'what-is-this-deepen-normal',
    kind: 'what-is-this',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'what-is-this-deepen-hard',
    kind: 'what-is-this',
    difficulty: 'hard',
    label: '复杂题',
    durationSec: 89,
    optionCount: 5,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 89 秒',
  },
  {
    modeId: 'economy-sense-deepen-normal',
    kind: 'economy-sense',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'system-mgmt-deepen-normal',
    kind: 'system-mgmt',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'wenyan-shici-deepen-normal',
    kind: 'wenyan-shici',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'wenyan-xuci-deepen-normal',
    kind: 'wenyan-xuci',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 142,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 142 秒',
  },
  {
    modeId: 'wenyan-jushi-deepen-normal',
    kind: 'wenyan-jushi',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 142,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 142 秒',
  },
  {
    modeId: 'rhetoric-device-deepen-normal',
    kind: 'rhetoric-device',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 77,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '固定分组目录 · 先识记再限时测 · 满组 77 秒',
  },
  {
    modeId: 'cs-vocab-deepen-normal',
    kind: 'cs-vocab',
    difficulty: 'normal',
    label: '普通题',
    durationSec: 100,
    optionCount: 4,
    batchSize: FACT_DEEPEN_BATCH_SIZE,
    desc: '按考点类型固定分组 · 先识记再限时测 · 满组 100 秒',
  },
]

const GROUP_STATS_KEY = 'fact-deepen-group-stats-v1'

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
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
  item:
    | LifeSenseBankItem
    | WhatIsThisBankItem
    | EconomySenseBankItem
    | SystemMgmtBankItem
    | WenyanShiciBankItem
    | WenyanXuciBankItem
    | WenyanJushiBankItem
    | RhetoricDeviceBankItem
    | CsVocabBankItem,
): FactDeepenBankItem {
  return {
    kind,
    difficulty: item.difficulty,
    stem: item.stem,
    correct: item.correct,
    distractors: item.distractors,
    baseExplanation: item.explanation,
    key: item.key,
    topic: 'topic' in item ? item.topic : undefined,
  }
}

/**
 * 本难度稳定题池：按 key 字典序，保证分组编号可溯源、跨会话不变。
 */
function poolFor(kind: FactDeepenKind, difficulty: FactDeepenDifficulty): FactDeepenBankItem[] {
  const bank =
    kind === 'life-sense'
      ? LIFE_SENSE_BANK
      : kind === 'what-is-this'
        ? WHAT_IS_THIS_BANK
        : kind === 'economy-sense'
          ? ECONOMY_SENSE_BANK
          : kind === 'system-mgmt'
            ? SYSTEM_MGMT_BANK
            : kind === 'wenyan-shici'
              ? WENYAN_SHICI_BANK
              : kind === 'wenyan-xuci'
                ? WENYAN_XUCI_BANK
              : kind === 'wenyan-jushi'
                ? WENYAN_JUSHI_BANK
                : kind === 'cs-vocab'
                  ? CS_VOCAB_BANK
                  : RHETORIC_DEVICE_BANK
  const seen = new Set<string>()
  const out: FactDeepenBankItem[] = []
  for (const item of bank) {
    if (item.difficulty !== difficulty) continue
    const k = normalizeKey(item.key)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(toDeepenItem(kind, item))
  }
  if (kind === 'cs-vocab') {
    out.sort((a, b) => {
      const oa = csVocabTopicOrder(a.topic || '')
      const ob = csVocabTopicOrder(b.topic || '')
      if (oa !== ob) return oa - ob
      return normalizeKey(a.key).localeCompare(normalizeKey(b.key), 'zh-CN')
    })
    return out
  }
  out.sort((a, b) => normalizeKey(a.key).localeCompare(normalizeKey(b.key), 'zh-CN'))
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
  if (kind === 'life-sense') return '生活常识'
  if (kind === 'what-is-this') return '这是什么'
  if (kind === 'economy-sense') return '经济学常识'
  if (kind === 'system-mgmt') return '体制管理'
  if (kind === 'wenyan-shici') return '文言实词'
  if (kind === 'wenyan-xuci') return '文言虚词'
  if (kind === 'wenyan-jushi') return '文言句式'
  if (kind === 'rhetoric-device') return '修辞手法'
  if (kind === 'cs-vocab') return '计算机单词和语法'
  return '文言实词'
}

export function factDeepenDifficultyLabel(d: FactDeepenDifficulty): string {
  if (d === 'hard') return '复杂'
  if (d === 'normal') return '普通'
  return '简单'
}

function withResolvedExplanation(item: FactDeepenBankItem): FactDeepenStudyCard {
  return {
    ...item,
    explanation: resolveFactExplanation(item.kind, item.key, item.baseExplanation),
  }
}

export function refreshFactDeepenStudyCard(card: FactDeepenBankItem): FactDeepenStudyCard {
  return withResolvedExplanation(card)
}

function previewStemOf(stem: string): string {
  const preview = stem.trim()
  return preview.length > 28 ? `${preview.slice(0, 28)}…` : preview
}

/** 末组若只多 1–5 题，并进上一组（20–25），避免单独出现少于 20 题的组。 */
export const CS_VOCAB_GROUP_EXTRA = 5

function csVocabChunkSizes(topicLen: number, size: number, extra: number): number[] {
  const cap = size + extra
  if (topicLen <= 0) return []
  if (topicLen <= cap) return [topicLen]
  const sizes: number[] = []
  let left = topicLen
  while (left > 0) {
    if (left <= cap) {
      sizes.push(left)
      break
    }
    sizes.push(size)
    left -= size
  }
  if (sizes.length >= 2) {
    const last = sizes[sizes.length - 1]!
    const prev = sizes[sizes.length - 2]!
    if (last < size && prev + last <= cap) {
      sizes[sizes.length - 2] = prev + last
      sizes.pop()
    }
  }
  return sizes
}

function listCsVocabGroups(
  modeId: FactDeepenModeId,
  cfg: FactDeepenModeConfig,
  pool: FactDeepenBankItem[],
): FactDeepenGroupMeta[] {
  const size = cfg.batchSize
  const extra = CS_VOCAB_GROUP_EXTRA
  const groups: FactDeepenGroupMeta[] = []
  let i = 0
  while (i < pool.length) {
    const topic = pool[i]!.topic || ''
    let j = i
    while (j < pool.length && (pool[j]!.topic || '') === topic) j += 1
    const topicLen = j - i
    const topicLabel = csVocabTopicLabel(topic)
    const chunks = csVocabChunkSizes(topicLen, size, extra)
    const topicGroupTotal = chunks.length
    let local = 0
    chunks.forEach((sliceLen, partIdx) => {
      const slice = pool.slice(i + local, i + local + sliceLen)
      const groupIndex = groups.length
      const fromNo = local + 1
      const toNo = local + sliceLen
      const partNo = partIdx + 1
      const title =
        topicGroupTotal === 1
          ? `${topicLabel} · 第 ${fromNo}–${toNo} 题`
          : `${topicLabel} · 第 ${partNo} 组 · 第 ${fromNo}–${toNo} 题`
      groups.push({
        modeId,
        kind: cfg.kind,
        difficulty: cfg.difficulty,
        groupIndex,
        groupNo: groupIndex + 1,
        count: sliceLen,
        fromNo,
        toNo,
        previewStem: previewStemOf(slice[0]!.stem),
        title,
        poolStart: i + local,
      })
      local += sliceLen
    })
    i = j
  }
  return groups
}

/** 列出某难度下全部固定分组（书籍目录） */
export function listFactDeepenGroups(modeId: FactDeepenModeId): FactDeepenGroupMeta[] {
  const cfg = getFactDeepenModeConfig(modeId)
  const pool = poolFor(cfg.kind, cfg.difficulty)
  const size = cfg.batchSize
  if (cfg.kind === 'cs-vocab') {
    return listCsVocabGroups(modeId, cfg, pool)
  }
  const groups: FactDeepenGroupMeta[] = []
  for (let i = 0; i < pool.length; i += size) {
    const slice = pool.slice(i, i + size)
    if (!slice.length) continue
    const groupIndex = groups.length
    const fromNo = i + 1
    const toNo = i + slice.length
    groups.push({
      modeId,
      kind: cfg.kind,
      difficulty: cfg.difficulty,
      groupIndex,
      groupNo: groupIndex + 1,
      count: slice.length,
      fromNo,
      toNo,
      previewStem: previewStemOf(slice[0]!.stem),
      title:
        slice.length === size
          ? `第 ${groupIndex + 1} 组 · 第 ${fromNo}–${toNo} 题`
          : `第 ${groupIndex + 1} 组 · 第 ${fromNo}–${toNo} 题（末组 ${slice.length} 题）`,
      poolStart: i,
    })
  }
  return groups
}

/** 按组号加载识记卡片（固定内容，可溯源） */
export function loadFactDeepenGroup(
  modeId: FactDeepenModeId,
  groupIndex: number,
): FactDeepenStudyCard[] {
  const cfg = getFactDeepenModeConfig(modeId)
  const pool = poolFor(cfg.kind, cfg.difficulty)
  const groups = listFactDeepenGroups(modeId)
  const meta = groups.find((g) => g.groupIndex === groupIndex)
  if (!meta) {
    throw new Error('该组不存在')
  }
  const start = meta.poolStart ?? groupIndex * cfg.batchSize
  if (start < 0 || start >= pool.length) {
    throw new Error('该组不存在')
  }
  return pool.slice(start, start + meta.count).map(withResolvedExplanation)
}

/** 本组测验时长（秒）；不足 20 题按比例缩时，超过 20 题按比例加时，至少 12 秒 */
export function factDeepenQuizDurationSec(cfg: FactDeepenModeConfig, questionCount: number): number {
  const full = cfg.batchSize
  if (questionCount <= 0) return 12
  if (questionCount === full) return cfg.durationSec
  const scaled = Math.round((cfg.durationSec * questionCount) / full)
  return Math.max(12, scaled)
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

/** 测验选项重洗；题序乱序，避免按目录顺序背答案 */
export function buildFactDeepenQuiz(
  cards: FactDeepenStudyCard[],
  optionCount: number,
): FactDeepenQuizQuestion[] {
  const shuffled = shuffle([...cards])
  return shuffled.map((card, i) => buildQuizFromCard(i + 1, card, optionCount))
}

function groupStatKey(modeId: FactDeepenModeId, groupIndex: number): string {
  return `${modeId}:${groupIndex}`
}

function readGroupStats(): Record<string, FactDeepenGroupStat> {
  try {
    const raw = localStorage.getItem(GROUP_STATS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, FactDeepenGroupStat>
  } catch {
    return {}
  }
}

function writeGroupStats(map: Record<string, FactDeepenGroupStat>) {
  try {
    localStorage.setItem(GROUP_STATS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function getFactDeepenGroupStat(
  modeId: FactDeepenModeId,
  groupIndex: number,
): FactDeepenGroupStat | null {
  return readGroupStats()[groupStatKey(modeId, groupIndex)] ?? null
}

export function setFactDeepenGroupStat(
  modeId: FactDeepenModeId,
  groupIndex: number,
  correct: number,
  total: number,
): void {
  const map = readGroupStats()
  map[groupStatKey(modeId, groupIndex)] = {
    correct,
    total,
    finishedAt: new Date().toISOString(),
  }
  writeGroupStats(map)
}

export const FACT_DEEPEN_GROUP_STATS_STORAGE_KEY = GROUP_STATS_KEY
