/**
 * 各小测试「完整完成一轮」次数统计（按 modeId，含难度后缀时分开计）
 * 持久化到 localStorage，界面用 practiceCompletionTick 响应刷新。
 * 完成时同步写入「导览 → 日志」。
 */
import { computed, ref, type MaybeRefOrGetter, toValue } from 'vue'
import {
  appendPracticeSessionLog,
  type PracticeSessionLogStats,
} from '@/utils/practiceSessionLog'

const STORAGE_KEY = 'practice-completion-counts-v1'

export const practiceCompletionTick = ref(0)

type CountsMap = Record<string, number>

function readCounts(): CountsMap {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(STORAGE_KEY)
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

function writeCounts(map: CountsMap) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  practiceCompletionTick.value += 1
}

export function getPracticeCompletionCount(modeId: string): number {
  void practiceCompletionTick.value
  if (!modeId) return 0
  return readCounts()[modeId] ?? 0
}

/** 完整完成一轮后 +1，并写入测验日志；返回新次数 */
export function incrementPracticeCompletion(
  modeId: string,
  stats?: PracticeSessionLogStats,
): number {
  const id = modeId.trim()
  if (!id) return 0
  const map = readCounts()
  const next = (map[id] ?? 0) + 1
  map[id] = next
  writeCounts(map)
  appendPracticeSessionLog(id, stats)
  return next
}

export function usePracticeCompletionCount(modeId: MaybeRefOrGetter<string>) {
  return computed(() => getPracticeCompletionCount(toValue(modeId)))
}

/** 拼出带难度的 modeId，如 op-skill-ratio-method-easy */
export function practiceModeId(prefix: string, difficulty: string): string {
  return `${prefix}-${difficulty}`
}
