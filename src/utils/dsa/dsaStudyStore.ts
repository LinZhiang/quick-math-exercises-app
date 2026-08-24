/**
 * 数据结构与算法：刷题次数 / 正确次数，以及打开题目、测试日志。只存在本机。
 */
import { ref } from 'vue'
import { formatLogDuration, localDateKey } from '@/utils/app/practiceSessionLog'

export const DSA_STUDY_LOG_KEY = 'dsa-study-log-v1'
export const DSA_PROBLEM_STATS_KEY = 'dsa-problem-stats-v1'
const LEGACY_PROGRESS_PREFIX = 'dsa-progress:'
const MAX_ENTRIES = 1500

export const dsaStudyTick = ref(0)

export type DsaProblemStats = {
  attempts: number
  corrects: number
  solveMs: number
  execMs: number
  bestExecMs: number
  completedAt: number
}

export type DsaStudyLogKind = 'view' | 'run'

export type DsaStudyLogEntry = {
  id: string
  kind: DsaStudyLogKind
  at: string
  dateKey: string
  problemId: string
  itemTitle: string
  pathLabel: string
  ok?: boolean
  durationMs?: number
  execMs?: number
}

export type DsaStudyLogDay = {
  dateKey: string
  views: DsaStudyLogEntry[]
  runs: DsaStudyLogEntry[]
}

function notify() {
  dsaStudyTick.value += 1
}

function emptyStats(): DsaProblemStats {
  return { attempts: 0, corrects: 0, solveMs: 0, execMs: 0, bestExecMs: 0, completedAt: 0 }
}

function parseStats(raw: unknown): DsaProblemStats {
  const row = raw && typeof raw === 'object' ? (raw as Partial<DsaProblemStats>) : {}
  return {
    attempts: Math.max(0, Math.round(Number(row.attempts) || 0)),
    corrects: Math.max(0, Math.round(Number(row.corrects) || 0)),
    solveMs: Math.max(0, Number(row.solveMs) || 0),
    execMs: Math.max(0, Number(row.execMs) || 0),
    bestExecMs: Math.max(0, Number(row.bestExecMs) || 0),
    completedAt: Math.max(0, Number(row.completedAt) || 0),
  }
}

function readStatsMap(): Record<string, DsaProblemStats> {
  try {
    const raw = localStorage.getItem(DSA_PROBLEM_STATS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, DsaProblemStats> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (id) out[id] = parseStats(value)
    }
    return out
  } catch {
    return {}
  }
}

function writeStatsMap(map: Record<string, DsaProblemStats>) {
  try {
    localStorage.setItem(DSA_PROBLEM_STATS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
  notify()
}

function migrateLegacyProgress(map: Record<string, DsaProblemStats>) {
  let changed = false
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key?.startsWith(LEGACY_PROGRESS_PREFIX)) continue
      const id = key.slice(LEGACY_PROGRESS_PREFIX.length)
      if (!id) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as Partial<DsaProblemStats>
      const prev = map[id] ?? emptyStats()
      map[id] = {
        ...prev,
        solveMs: prev.solveMs || Number(parsed.solveMs) || 0,
        execMs: prev.execMs || Number(parsed.execMs) || 0,
        bestExecMs: prev.bestExecMs || Number(parsed.bestExecMs) || Number(parsed.execMs) || 0,
        completedAt: prev.completedAt || Number(parsed.completedAt) || 0,
        corrects: prev.corrects || (parsed.completedAt ? 1 : 0),
        attempts: prev.attempts || (parsed.completedAt ? 1 : prev.corrects),
      }
      changed = true
    }
  } catch {
    /* ignore */
  }
  if (changed) writeStatsMap(map)
}

let migrated = false

function statsMap(): Record<string, DsaProblemStats> {
  const map = readStatsMap()
  if (!migrated) {
    migrated = true
    migrateLegacyProgress(map)
  }
  void dsaStudyTick.value
  return map
}

export function getDsaProblemStats(problemId: string): DsaProblemStats {
  return statsMap()[problemId] ?? emptyStats()
}

function readLogs(): DsaStudyLogEntry[] {
  try {
    const raw = localStorage.getItem(DSA_STUDY_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((row) => row && typeof row === 'object' && row.id && row.kind) as DsaStudyLogEntry[]
  } catch {
    return []
  }
}

function writeLogs(rows: DsaStudyLogEntry[]) {
  try {
    localStorage.setItem(DSA_STUDY_LOG_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)))
  } catch {
    /* ignore */
  }
  notify()
}

function newId() {
  return `dsalog-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function pathOf(pathLabel: string, itemTitle: string) {
  const label = String(pathLabel || '').trim()
  return label || itemTitle
}

export function listDsaStudyLogs(): DsaStudyLogEntry[] {
  void dsaStudyTick.value
  return readLogs()
}

export function logDsaProblemView(input: {
  problemId: string
  itemTitle: string
  pathLabel: string
}) {
  const problemId = String(input.problemId || '').trim()
  const itemTitle = String(input.itemTitle || '').trim()
  if (!problemId || !itemTitle) return
  const now = new Date()
  const dateKey = localDateKey(now)
  const at = now.toISOString()
  const pathLabel = pathOf(input.pathLabel, itemTitle)
  const rows = readLogs()
  const hit = rows.find((row) => row.kind === 'view' && row.dateKey === dateKey && row.problemId === problemId)
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
      problemId,
      itemTitle,
      pathLabel,
    },
    ...rows,
  ])
}

export function recordDsaRun(input: {
  problemId: string
  itemTitle: string
  pathLabel: string
  ok: boolean
  durationMs?: number
  execMs?: number
}) {
  const problemId = String(input.problemId || '').trim()
  const itemTitle = String(input.itemTitle || '').trim()
  if (!problemId || !itemTitle) return getDsaProblemStats(problemId)

  const map = statsMap()
  const prev = map[problemId] ?? emptyStats()
  const next: DsaProblemStats = {
    attempts: prev.attempts + 1,
    corrects: prev.corrects + (input.ok ? 1 : 0),
    solveMs: prev.solveMs || (input.ok ? Math.max(0, input.durationMs ?? 0) : 0),
    execMs: input.ok && input.execMs ? input.execMs : prev.execMs,
    bestExecMs: input.ok && input.execMs
      ? prev.bestExecMs
        ? Math.min(prev.bestExecMs, input.execMs)
        : input.execMs
      : prev.bestExecMs,
    completedAt: prev.completedAt || (input.ok ? Date.now() : 0),
  }
  map[problemId] = next
  writeStatsMap(map)

  const now = new Date()
  writeLogs([
    {
      id: newId(),
      kind: 'run',
      at: now.toISOString(),
      dateKey: localDateKey(now),
      problemId,
      itemTitle,
      pathLabel: pathOf(input.pathLabel, itemTitle),
      ok: input.ok,
      durationMs: input.durationMs,
      execMs: input.ok ? input.execMs : undefined,
    },
    ...readLogs(),
  ])
  return next
}

export function filterDsaStudyLogs(opts?: {
  dateKey?: string
  kind?: DsaStudyLogKind
}): DsaStudyLogEntry[] {
  return listDsaStudyLogs().filter((row) => {
    if (opts?.dateKey && row.dateKey !== opts.dateKey) return false
    if (opts?.kind && row.kind !== opts.kind) return false
    return true
  })
}

export function groupDsaStudyLogsByDate(rows: DsaStudyLogEntry[]): DsaStudyLogDay[] {
  const map = new Map<string, DsaStudyLogDay>()
  for (const row of rows) {
    let day = map.get(row.dateKey)
    if (!day) {
      day = { dateKey: row.dateKey, views: [], runs: [] }
      map.set(row.dateKey, day)
    }
    if (row.kind === 'run') day.runs.push(row)
    else day.views.push(row)
  }
  for (const day of map.values()) {
    day.views.sort((a, b) => b.at.localeCompare(a.at))
    day.runs.sort((a, b) => b.at.localeCompare(a.at))
  }
  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

export function clearDsaStudyLogs() {
  writeLogs([])
}

export function formatDsaStudyTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return iso
  }
}

export function formatDsaStudyDateTitle(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return '今天'
  const d = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(d.getTime())) return dateKey
  const week = '日一二三四五六'[d.getDay()] ?? ''
  return week ? `${dateKey} 周${week}` : dateKey
}

export function formatDsaStudyDuration(ms?: number): string {
  return formatLogDuration(ms)
}

export function dsaRunResultText(row: DsaStudyLogEntry): string {
  const parts = [row.ok ? '通过' : '未通过']
  const dur = formatDsaStudyDuration(row.durationMs)
  if (dur) parts.push(`解题 ${dur}`)
  if (row.execMs && row.execMs > 0) parts.push(`运行 ${row.execMs.toFixed(2)} ms`)
  return parts.join(' · ')
}

export function dsaStudyDaySummary(day: DsaStudyLogDay): string {
  const pass = day.runs.filter((row) => row.ok).length
  const parts = [`打开 ${day.views.length} 题`, `测试 ${day.runs.length} 次`]
  if (day.runs.length) parts.push(`通过 ${pass} 次`)
  const dur = day.runs.reduce((n, row) => n + (row.durationMs ?? 0), 0)
  const durText = formatDsaStudyDuration(dur)
  if (durText) parts.push(`合计 ${durText}`)
  return parts.join(' · ')
}

export type DsaStudyStatsSummary = {
  lifetimeAttempts: number
  lifetimeCorrects: number
  todayAttempts: number
  todayCorrects: number
}

export function summarizeDsaStudy(): DsaStudyStatsSummary {
  void dsaStudyTick.value
  const runs = readLogs().filter((row) => row.kind === 'run')
  const today = localDateKey()
  let lifetimeAttempts = 0
  let lifetimeCorrects = 0
  let todayAttempts = 0
  let todayCorrects = 0
  for (const row of runs) {
    lifetimeAttempts += 1
    if (row.ok) lifetimeCorrects += 1
    if (row.dateKey !== today) continue
    todayAttempts += 1
    if (row.ok) todayCorrects += 1
  }
  const map = statsMap()
  if (!lifetimeAttempts) {
    for (const row of Object.values(map)) {
      lifetimeAttempts += row.attempts
      lifetimeCorrects += row.corrects
    }
  }
  return { lifetimeAttempts, lifetimeCorrects, todayAttempts, todayCorrects }
}
