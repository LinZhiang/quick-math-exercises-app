/**
 * 各小测试「完整完成一轮」次数统计（按 modeId，含难度后缀时分开计）
 * 另计「全对 / 满分」次数。
 * 持久化到 localStorage，界面用 practiceCompletionTick 响应刷新。
 * 完成时同步写入「导览 → 日志」。
 */
import { computed, ref, type MaybeRefOrGetter, toValue } from 'vue'
import {
  appendPracticeSessionLog,
  type PracticeSessionLogStats,
} from '@/utils/practiceSessionLog'
import {
  isChineseKeyReviewActive,
  getChineseKeyReviewSession,
  markChineseKeyReviewSessionCompleted,
} from '@/utils/chineseKeyReviewSession'
import {
  chineseWrongReviewScope,
  recordWrongBookReviewComplete,
} from '@/utils/wrongBookReviewStats'

const STORAGE_KEY = 'practice-completion-counts-v1'
const PERFECT_STORAGE_KEY = 'practice-perfect-counts-v1'

export const practiceCompletionTick = ref(0)

type CountsMap = Record<string, number>

export type PracticeCompletionStats = PracticeSessionLogStats & {
  /** 明确标记本轮全对/满分；未传时可由 correctCount/totalCount 推断 */
  perfect?: boolean
}

function readCounts(key: string): CountsMap {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: CountsMap = {}
    for (const [k, v] of Object.entries(parsed as CountsMap)) {
      const n = Number(v)
      if (typeof k === 'string' && k && Number.isFinite(n) && n > 0) {
        out[k] = Math.floor(n)
      }
    }
    return out
  } catch {
    return {}
  }
}

function writeCounts(key: string, map: CountsMap) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(map))
  practiceCompletionTick.value += 1
}

export function getPracticeCompletionCount(modeId: string): number {
  void practiceCompletionTick.value
  if (!modeId) return 0
  return readCounts(STORAGE_KEY)[modeId] ?? 0
}

export function getPracticePerfectCount(modeId: string): number {
  void practiceCompletionTick.value
  if (!modeId) return 0
  return readCounts(PERFECT_STORAGE_KEY)[modeId] ?? 0
}

function resolvePerfect(stats?: PracticeCompletionStats): boolean {
  if (!stats) return false
  if (stats.perfect === true) return true
  if (stats.perfect === false) return false
  const { correctCount, totalCount } = stats
  if (
    typeof correctCount === 'number' &&
    typeof totalCount === 'number' &&
    totalCount > 0 &&
    correctCount === totalCount
  ) {
    return true
  }
  return false
}

/** 完整完成一轮后 +1；若全对/满分则满分次数也 +1。返回完成次数 */
export function incrementPracticeCompletion(
  modeId: string,
  stats?: PracticeCompletionStats,
): number {
  // 关题错题/收藏复盘：不计入普通「已完成轮次」，改记错题复盘统计
  if (isChineseKeyReviewActive()) {
    const session = getChineseKeyReviewSession()
    if (session) {
      markChineseKeyReviewSessionCompleted()
      recordWrongBookReviewComplete(chineseWrongReviewScope(session.source, session.bank), {
        correctCount: stats?.correctCount,
        totalCount: stats?.totalCount,
        durationMs: stats?.durationMs,
      })
    }
    return getPracticeCompletionCount(modeId.trim())
  }

  const id = modeId.trim()
  if (!id) return 0
  const map = readCounts(STORAGE_KEY)
  const next = (map[id] ?? 0) + 1
  map[id] = next
  writeCounts(STORAGE_KEY, map)

  if (resolvePerfect(stats)) {
    const pMap = readCounts(PERFECT_STORAGE_KEY)
    pMap[id] = (pMap[id] ?? 0) + 1
    writeCounts(PERFECT_STORAGE_KEY, pMap)
  }

  appendPracticeSessionLog(id, {
    ...stats,
    perfect: resolvePerfect(stats),
  })
  return next
}

export function usePracticeCompletionCount(modeId: MaybeRefOrGetter<string>) {
  return computed(() => getPracticeCompletionCount(toValue(modeId)))
}

export function usePracticePerfectCount(modeId: MaybeRefOrGetter<string>) {
  return computed(() => getPracticePerfectCount(toValue(modeId)))
}

/** 拼出带难度的 modeId，如 op-skill-ratio-method-easy */
export function practiceModeId(prefix: string, difficulty: string): string {
  return `${prefix}-${difficulty}`
}
