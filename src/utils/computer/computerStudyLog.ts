/**
 * 计算机基础学习日志：阅读章节、测验场次。只存在本机 localStorage。
 */
import { ref } from 'vue'
import { formatLogDuration, localDateKey } from '@/utils/app/practiceSessionLog'

export const COMPUTER_STUDY_LOG_KEY = 'computer-study-log-v1'
const MAX_ENTRIES = 1500

export const computerStudyLogTick = ref(0)

export type ComputerStudyLogKind = 'view' | 'quiz'

export type ComputerStudyLogEntry = {
  id: string
  kind: ComputerStudyLogKind
  at: string
  dateKey: string
  itemId: string
  itemTitle: string
  pathLabel: string
  correctCount?: number
  totalCount?: number
  durationMs?: number
}

export type ComputerStudyLogDay = {
  dateKey: string
  views: ComputerStudyLogEntry[]
  quizzes: ComputerStudyLogEntry[]
}

function notify() {
  computerStudyLogTick.value += 1
}

function readLogs(): ComputerStudyLogEntry[] {
  try {
    const raw = localStorage.getItem(COMPUTER_STUDY_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((row) => row && typeof row === 'object' && row.id && row.kind) as ComputerStudyLogEntry[]
  } catch {
    return []
  }
}

function writeLogs(rows: ComputerStudyLogEntry[]) {
  try {
    localStorage.setItem(COMPUTER_STUDY_LOG_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)))
  } catch {
    /* 配额满时忽略 */
  }
  notify()
}

function newId() {
  return `cblog-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function pathOf(input: { learningPath?: string[]; itemTitle: string }): string {
  const parts = (input.learningPath ?? []).map((s) => String(s).trim()).filter(Boolean)
  return parts.length ? parts.join(' / ') : input.itemTitle
}

export function listComputerStudyLogs(): ComputerStudyLogEntry[] {
  void computerStudyLogTick.value
  return readLogs()
}

export function logComputerHandoutView(input: {
  itemId: string
  itemTitle: string
  learningPath?: string[]
}) {
  const itemId = String(input.itemId || '').trim()
  const itemTitle = String(input.itemTitle || '').trim()
  if (!itemId || !itemTitle) return
  const now = new Date()
  const dateKey = localDateKey(now)
  const at = now.toISOString()
  const pathLabel = pathOf({ learningPath: input.learningPath, itemTitle })
  const rows = readLogs()
  const hit = rows.find((row) => row.kind === 'view' && row.dateKey === dateKey && row.itemId === itemId)
  if (hit) {
    hit.at = at
    hit.itemTitle = itemTitle
    hit.pathLabel = pathLabel
    writeLogs(rows)
    return
  }
  writeLogs([
    {
      id: newId(),
      kind: 'view',
      at,
      dateKey,
      itemId,
      itemTitle,
      pathLabel,
    },
    ...rows,
  ])
}

export function logComputerQuizSession(input: {
  itemId: string
  itemTitle: string
  learningPath?: string[]
  correctCount: number
  totalCount: number
  durationMs?: number
}) {
  const itemId = String(input.itemId || '').trim()
  const itemTitle = String(input.itemTitle || '').trim()
  if (!itemId || !itemTitle || input.totalCount <= 0) return
  const now = new Date()
  writeLogs([
    {
      id: newId(),
      kind: 'quiz',
      at: now.toISOString(),
      dateKey: localDateKey(now),
      itemId,
      itemTitle,
      pathLabel: pathOf({ learningPath: input.learningPath, itemTitle }),
      correctCount: Math.max(0, Math.round(input.correctCount)),
      totalCount: Math.max(1, Math.round(input.totalCount)),
      durationMs: input.durationMs,
    },
    ...readLogs(),
  ])
}

export function filterComputerStudyLogs(opts?: {
  dateKey?: string
  kind?: ComputerStudyLogKind
}): ComputerStudyLogEntry[] {
  const rows = listComputerStudyLogs()
  return rows.filter((row) => {
    if (opts?.dateKey && row.dateKey !== opts.dateKey) return false
    if (opts?.kind && row.kind !== opts.kind) return false
    return true
  })
}

export function groupComputerStudyLogsByDate(rows: ComputerStudyLogEntry[]): ComputerStudyLogDay[] {
  const map = new Map<string, ComputerStudyLogDay>()
  for (const row of rows) {
    let day = map.get(row.dateKey)
    if (!day) {
      day = { dateKey: row.dateKey, views: [], quizzes: [] }
      map.set(row.dateKey, day)
    }
    if (row.kind === 'quiz') day.quizzes.push(row)
    else day.views.push(row)
  }
  for (const day of map.values()) {
    day.views.sort((a, b) => b.at.localeCompare(a.at))
    day.quizzes.sort((a, b) => b.at.localeCompare(a.at))
  }
  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

export function clearComputerStudyLogs() {
  writeLogs([])
}

export function formatComputerStudyTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return iso
  }
}

export function formatComputerStudyDuration(ms?: number): string {
  return formatLogDuration(ms)
}

export function computerQuizResultText(row: ComputerStudyLogEntry): string {
  const parts: string[] = []
  if (row.totalCount != null && row.correctCount != null) {
    parts.push(`答对 ${row.correctCount}/${row.totalCount}`)
    if (row.totalCount > 0 && row.correctCount === row.totalCount) parts.push('全对')
  }
  const dur = formatComputerStudyDuration(row.durationMs)
  if (dur) parts.push(`用时 ${dur}`)
  return parts.join(' · ')
}
