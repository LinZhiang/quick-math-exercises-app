/**
 * 错题复盘统计（与「完成多少轮」分开）：
 * - attempted：做过多少题（每提交一题 +1）
 * - correct：复盘答对多少题
 * - completeReviews：完整复盘次数（整组题全部答完才 +1）
 * 按分区 / 关题来源归类，持久化到 localStorage。
 */
import { computed, ref, type MaybeRefOrGetter, toValue } from 'vue'
import {
  appendPracticeSessionLog,
  type PracticeSessionLogStats,
} from '@/utils/practiceSessionLog'
import {
  MENTAL_MATH_WRONG_SECTION_LABELS,
  type MentalMathWrongSection,
} from '@/utils/mentalMathWrongBook'
import { CHINESE_KEY_QUESTION_SOURCES } from '@/constants/chinese-practice-tabs'
import type { ChineseKeyQuestionSource } from '@/constants/chinese-practice-tabs'
import type { ChineseKeyReviewBank } from '@/utils/chineseKeyReviewSession'

const STORAGE_KEY = 'wrong-book-review-stats-v1'

export const wrongBookReviewStatsTick = ref(0)

export type WrongBookReviewBucket = {
  attempted: number
  correct: number
  completeReviews: number
}

export type WrongBookReviewScope =
  | `mm:${MentalMathWrongSection}`
  | `mm-favorite:${MentalMathWrongSection}`
  | `cn-wrong:${ChineseKeyQuestionSource}`
  | `cn-favorite:${ChineseKeyQuestionSource}`

type StatsMap = Record<string, WrongBookReviewBucket>

const EMPTY: WrongBookReviewBucket = {
  attempted: 0,
  correct: 0,
  completeReviews: 0,
}

function readMap(): StatsMap {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: StatsMap = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!k || !v || typeof v !== 'object' || Array.isArray(v)) continue
      const o = v as Record<string, unknown>
      const attempted = Math.max(0, Math.floor(Number(o.attempted) || 0))
      const correct = Math.max(0, Math.floor(Number(o.correct) || 0))
      const completeReviews = Math.max(0, Math.floor(Number(o.completeReviews) || 0))
      if (attempted || correct || completeReviews) {
        out[k] = { attempted, correct, completeReviews }
      }
    }
    return out
  } catch {
    return {}
  }
}

function writeMap(map: StatsMap) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  wrongBookReviewStatsTick.value += 1
}

export function mmWrongReviewScope(
  section: MentalMathWrongSection,
  bank: 'wrong' | 'favorite' = 'wrong',
): WrongBookReviewScope {
  return bank === 'favorite' ? `mm-favorite:${section}` : `mm:${section}`
}

export function chineseWrongReviewScope(
  source: ChineseKeyQuestionSource,
  bank: ChineseKeyReviewBank = 'wrong',
): WrongBookReviewScope {
  return bank === 'favorite' ? `cn-favorite:${source}` : `cn-wrong:${source}`
}

/** 日志用 modeId，便于归入「错题复盘」大类 */
export function wrongReviewLogModeId(scope: WrongBookReviewScope): string {
  return `wb-review:${scope}`
}

export function wrongReviewScopeLabel(scope: string): string {
  if (scope.startsWith('mm-favorite:')) {
    const section = scope.slice('mm-favorite:'.length) as MentalMathWrongSection
    const name = MENTAL_MATH_WRONG_SECTION_LABELS[section] ?? section
    return `口算收藏 · ${name}`
  }
  if (scope.startsWith('mm:')) {
    const section = scope.slice(3) as MentalMathWrongSection
    const name = MENTAL_MATH_WRONG_SECTION_LABELS[section] ?? section
    return `口算错题 · ${name}`
  }
  if (scope.startsWith('cn-wrong:')) {
    const id = scope.slice('cn-wrong:'.length) as ChineseKeyQuestionSource
    const title = CHINESE_KEY_QUESTION_SOURCES.find((s) => s.id === id)?.title ?? id
    return `关题错题 · ${title}`
  }
  if (scope.startsWith('cn-favorite:')) {
    const id = scope.slice('cn-favorite:'.length) as ChineseKeyQuestionSource
    const title = CHINESE_KEY_QUESTION_SOURCES.find((s) => s.id === id)?.title ?? id
    return `关题收藏 · ${title}`
  }
  return scope
}

export function getWrongBookReviewStats(scope: string): WrongBookReviewBucket {
  void wrongBookReviewStatsTick.value
  if (!scope) return { ...EMPTY }
  const hit = readMap()[scope]
  return hit ? { ...hit } : { ...EMPTY }
}

/** 每答一题调用：做题数 +1，答对则答对数 +1 */
export function recordWrongBookReviewAttempt(scope: WrongBookReviewScope, correct: boolean) {
  const id = String(scope ?? '').trim()
  if (!id) return
  const map = readMap()
  const cur = map[id] ?? { ...EMPTY }
  cur.attempted += 1
  if (correct) cur.correct += 1
  map[id] = cur
  writeMap(map)
}

/**
 * 完整复盘（本组题全部答完）+1，并写入导览日志。
 * 注意：做题/答对已在每题提交时累计，此处不再重复加 attempted/correct。
 */
export function recordWrongBookReviewComplete(
  scope: WrongBookReviewScope,
  stats?: PracticeSessionLogStats & { abandoned?: boolean },
) {
  const id = String(scope ?? '').trim()
  if (!id) return
  const abandoned = stats?.abandoned === true
  if (!abandoned) {
    const map = readMap()
    const cur = map[id] ?? { ...EMPTY }
    cur.completeReviews += 1
    map[id] = cur
    writeMap(map)
  }

  const total = stats?.totalCount
  const correct = stats?.correctCount
  appendPracticeSessionLog(wrongReviewLogModeId(scope as WrongBookReviewScope), {
    correctCount: correct,
    totalCount: total,
    durationMs: stats?.durationMs,
    perfect:
      !abandoned &&
      typeof correct === 'number' &&
      typeof total === 'number' &&
      total > 0 &&
      correct === total,
    categoryId: 'wrong-review',
    categoryLabel: '错题复盘',
    itemLabel: `${wrongReviewScopeLabel(id)}${abandoned ? ' · 中途结束' : ' · 完整复盘'}`,
  })
}

export function useWrongBookReviewStats(scope: MaybeRefOrGetter<string>) {
  return computed(() => getWrongBookReviewStats(toValue(scope)))
}
