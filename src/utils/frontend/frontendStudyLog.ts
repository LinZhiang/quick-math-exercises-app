/**
 * 前端学习学习日志：阅读章节、测验场次。只存在本机 localStorage。
 */
import { ref } from 'vue'
import { formatLogDuration, localDateKey } from '@/utils/app/practiceSessionLog'

export const FRONTEND_STUDY_LOG_KEY = 'frontend-study-log-v1'
const MAX_ENTRIES = 1500

export const frontendStudyLogTick = ref(0)

export type FrontendStudyLogKind = 'view' | 'quiz'

export type FrontendStudyLogEntry = {
  id: string
  kind: FrontendStudyLogKind
  at: string
  dateKey: string
  itemId: string
  itemTitle: string
  pathLabel: string
  correctCount?: number
  totalCount?: number
  durationMs?: number
  rangeQuiz?: boolean
  kindCounts?: { choice: number; judge: number; calc: number; short?: number }
  wrongCount?: number
  carelessCount?: number
}

export type FrontendStudyLogDay = {
  dateKey: string
  views: FrontendStudyLogEntry[]
  quizzes: FrontendStudyLogEntry[]
}

function notify() {
  frontendStudyLogTick.value += 1
}

function readLogs(): FrontendStudyLogEntry[] {
  try {
    const raw = localStorage.getItem(FRONTEND_STUDY_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((row) => row && typeof row === 'object' && row.id && row.kind) as FrontendStudyLogEntry[]
  } catch {
    return []
  }
}

function writeLogs(rows: FrontendStudyLogEntry[]) {
  try {
    localStorage.setItem(FRONTEND_STUDY_LOG_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)))
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

export function listFrontendStudyLogs(): FrontendStudyLogEntry[] {
  void frontendStudyLogTick.value
  return readLogs()
}

export function logFrontendHandoutView(input: {
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

export function logFrontendQuizSession(input: {
  itemId: string
  itemTitle: string
  learningPath?: string[]
  correctCount: number
  totalCount: number
  durationMs?: number
  rangeQuiz?: boolean
  kindCounts?: { choice: number; judge: number; calc: number; short?: number }
  wrongCount?: number
  carelessCount?: number
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
      rangeQuiz: Boolean(input.rangeQuiz),
      kindCounts: input.kindCounts,
      wrongCount: input.wrongCount,
      carelessCount: input.carelessCount,
    },
    ...readLogs(),
  ])
}

export function filterFrontendStudyLogs(opts?: {
  dateKey?: string
  kind?: FrontendStudyLogKind
}): FrontendStudyLogEntry[] {
  const rows = listFrontendStudyLogs()
  return rows.filter((row) => {
    if (opts?.dateKey && row.dateKey !== opts.dateKey) return false
    if (opts?.kind && row.kind !== opts.kind) return false
    return true
  })
}

export function groupFrontendStudyLogsByDate(rows: FrontendStudyLogEntry[]): FrontendStudyLogDay[] {
  const map = new Map<string, FrontendStudyLogDay>()
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

export function clearFrontendStudyLogs() {
  writeLogs([])
}

export function formatFrontendStudyTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return iso
  }
}

export function formatFrontendStudyDateTitle(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return '今天'
  const d = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(d.getTime())) return dateKey
  const week = '日一二三四五六'[d.getDay()] ?? ''
  return week ? `${dateKey} 周${week}` : dateKey
}

export function formatFrontendStudyDuration(ms?: number): string {
  return formatLogDuration(ms)
}

export function frontendQuizKindCountsText(row: FrontendStudyLogEntry): string {
  const c = row.kindCounts
  if (!c) return ''
  const parts: string[] = []
  if (c.choice) parts.push(`选择 ${c.choice}`)
  if (c.judge) parts.push(`判断 ${c.judge}`)
  if (c.calc) parts.push(`计算 ${c.calc}`)
  if (c.short) parts.push(`简答 ${c.short}`)
  return parts.join(' · ')
}

export function frontendQuizResultText(row: FrontendStudyLogEntry): string {
  const parts: string[] = []
  if (row.rangeQuiz) parts.push('范围测验')
  if (row.totalCount != null && row.correctCount != null) {
    const pct = row.totalCount > 0 ? Math.round((row.correctCount / row.totalCount) * 100) : 0
    parts.push(`答对 ${row.correctCount}/${row.totalCount}（${pct}%）`)
    if (row.totalCount > 0 && row.correctCount === row.totalCount) parts.push('全对')
  }
  if (row.wrongCount) parts.push(`错 ${row.wrongCount}`)
  if (row.carelessCount) parts.push(`粗心 ${row.carelessCount}`)
  const kinds = frontendQuizKindCountsText(row)
  if (kinds) parts.push(kinds)
  const dur = formatFrontendStudyDuration(row.durationMs)
  if (dur) parts.push(`用时 ${dur}`)
  return parts.join(' · ')
}

export function frontendStudyDaySummary(day: FrontendStudyLogDay): string {
  const viewN = day.views.length
  const quizN = day.quizzes.length
  const correct = day.quizzes.reduce((n, row) => n + (row.correctCount ?? 0), 0)
  const total = day.quizzes.reduce((n, row) => n + (row.totalCount ?? 0), 0)
  const dur = day.quizzes.reduce((n, row) => n + (row.durationMs ?? 0), 0)
  const parts = [`阅读 ${viewN} 篇`, `测验 ${quizN} 场`]
  if (total > 0) {
    const pct = Math.round((correct / total) * 100)
    parts.push(`共答对 ${correct}/${total}（${pct}%）`)
  }
  const durText = formatFrontendStudyDuration(dur)
  if (durText) parts.push(`测验合计 ${durText}`)
  return parts.join(' · ')
}

export type FrontendQuizModuleStat = {
  label: string
  total: number
  correct: number
}

export type FrontendQuizStatsSummary = {
  lifetimeTotal: number
  lifetimeCorrect: number
  todayTotal: number
  todayCorrect: number
  todayModules: FrontendQuizModuleStat[]
}

export function summarizeFrontendQuizLogs(): FrontendQuizStatsSummary {
  void frontendStudyLogTick.value
  const quizzes = readLogs().filter((row) => row.kind === 'quiz')
  const today = localDateKey()
  const moduleMap = new Map<string, FrontendQuizModuleStat>()
  let lifetimeTotal = 0
  let lifetimeCorrect = 0
  let todayTotal = 0
  let todayCorrect = 0
  for (const row of quizzes) {
    const total = Math.max(0, row.totalCount ?? 0)
    const correct = Math.max(0, row.correctCount ?? 0)
    lifetimeTotal += total
    lifetimeCorrect += correct
    if (row.dateKey !== today) continue
    todayTotal += total
    todayCorrect += correct
    const label = row.pathLabel || row.itemTitle || '未分类'
    const hit = moduleMap.get(label)
    if (hit) {
      hit.total += total
      hit.correct += correct
    } else {
      moduleMap.set(label, { label, total, correct })
    }
  }
  return {
    lifetimeTotal,
    lifetimeCorrect,
    todayTotal,
    todayCorrect,
    todayModules: [...moduleMap.values()],
  }
}
