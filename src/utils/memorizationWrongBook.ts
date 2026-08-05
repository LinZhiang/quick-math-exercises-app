/**
 * 识记模块（诗词 drill / 时政 drill）错题本。
 * 复盘测验只用原题，不做 AI 变式。
 */
import { ref } from 'vue'
import type { CurrentAffairsDrillMode, CurrentAffairsDrillQuestion } from '@/utils/currentAffairsDrillPractice'
import type { PoetDrillQuestion } from '@/utils/poetDrillPractice'
import { WRONG_BOOK_BATCH_SIZE } from '@/utils/mentalMathWrongQuiz'
import { localDateKey } from '@/utils/practiceSessionLog'

export type MemorizationWrongModule = 'poet-drill' | 'current-affairs'

export type MemorizationWrongRecord = {
  fingerprint: string
  module: MemorizationWrongModule
  scopeKey: string
  scopeLabel: string
  /** 时政三种测法 */
  drillMode?: CurrentAffairsDrillMode
  questionType: string
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  sourceTitle?: string
  context?: string
  segments?: string[]
  chosenAnswer?: string
  wrongCount: number
  updatedAt: string
}

const STORAGE_KEY = 'chinese-memorization-wrong-v1'

export const memorizationWrongBookTick = ref(0)

function notifyChanged() {
  memorizationWrongBookTick.value += 1
}

function readAll(): MemorizationWrongRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is MemorizationWrongRecord =>
        !!r &&
        typeof r === 'object' &&
        typeof (r as MemorizationWrongRecord).fingerprint === 'string' &&
        ((r as MemorizationWrongRecord).module === 'poet-drill' ||
          (r as MemorizationWrongRecord).module === 'current-affairs'),
    )
  } catch {
    return []
  }
}

function writeAll(rows: MemorizationWrongRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  notifyChanged()
}

export function listMemorizationWrongRecords(
  module?: MemorizationWrongModule,
): MemorizationWrongRecord[] {
  void memorizationWrongBookTick.value
  const all = readAll()
  if (!module) return all
  return all.filter((r) => r.module === module)
}

export function removeMemorizationWrong(fingerprint: string) {
  const fp = fingerprint.trim()
  if (!fp) return
  writeAll(readAll().filter((r) => r.fingerprint !== fp))
}

export function bumpMemorizationWrongCount(fingerprint: string) {
  const fp = fingerprint.trim()
  if (!fp) return
  const rows = readAll()
  const idx = rows.findIndex((r) => r.fingerprint === fp)
  if (idx < 0) return
  const cur = rows[idx]!
  rows[idx] = {
    ...cur,
    wrongCount: (cur.wrongCount || 1) + 1,
    updatedAt: new Date().toISOString(),
  }
  writeAll(rows)
}

function upsertRecord(next: MemorizationWrongRecord) {
  const rows = readAll()
  const idx = rows.findIndex((r) => r.fingerprint === next.fingerprint)
  if (idx >= 0) {
    const cur = rows[idx]!
    rows[idx] = {
      ...next,
      wrongCount: (cur.wrongCount || 1) + 1,
      updatedAt: new Date().toISOString(),
    }
  } else {
    rows.unshift(next)
  }
  writeAll(rows)
}

export function upsertPoetDrillWrong(
  q: PoetDrillQuestion,
  input: { scopeLabel: string; chosenIndex: number | null },
) {
  const chosen =
    input.chosenIndex != null ? String(q.options[input.chosenIndex] ?? '') : ''
  upsertRecord({
    fingerprint: q.fingerprint,
    module: 'poet-drill',
    scopeKey: q.scopeKey,
    scopeLabel: input.scopeLabel || q.scopeKey,
    questionType: q.questionType,
    term: q.term,
    stem: q.stem,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    chosenAnswer: chosen,
    wrongCount: 1,
    updatedAt: new Date().toISOString(),
  })
}

export function upsertCurrentAffairsDrillWrong(
  q: CurrentAffairsDrillQuestion,
  input: {
    scopeLabel: string
    drillMode: CurrentAffairsDrillMode
    chosenIndex: number | null
    chosenAnswer?: string
  },
) {
  const chosen =
    (input.chosenAnswer && input.chosenAnswer.trim()) ||
    (input.chosenIndex != null ? String(q.options[input.chosenIndex] ?? '') : '')
  upsertRecord({
    fingerprint: q.fingerprint,
    module: 'current-affairs',
    scopeKey: q.scopeKey,
    scopeLabel: input.scopeLabel || q.scopeKey,
    drillMode: input.drillMode,
    questionType: q.questionType,
    term: q.term,
    stem: q.stem,
    options: [...q.options],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    sourceTitle: q.sourceTitle,
    context: q.context,
    segments: q.segments ? [...q.segments] : undefined,
    chosenAnswer: chosen,
    wrongCount: 1,
    updatedAt: new Date().toISOString(),
  })
}

export type MemorizationWrongQuizItem = {
  id: string
  originFingerprint: string
  module: MemorizationWrongModule
  scopeKey: string
  scopeLabel: string
  drillMode?: CurrentAffairsDrillMode
  questionType: string
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  sourceTitle?: string
  context?: string
  segments?: string[]
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** 原题转测验项（可洗牌选项；不做 AI 变式） */
export function memorizationWrongToQuizItem(
  row: MemorizationWrongRecord,
  seq: number,
): MemorizationWrongQuizItem | null {
  const options = [...(row.options ?? [])].map((o) => String(o).trim()).filter(Boolean)
  const correctRaw = options[row.correctIndex] ?? options[0] ?? ''
  if (!correctRaw) return null

  /** 语句排序：交互排序，不依赖四选一干扰项；须有 5 段 + 正确序号 */
  if (row.questionType === 'sentence-order') {
    const segments = (row.segments ?? [])
      .map((s) => String(s ?? '').trim())
      .filter(Boolean)
    if (segments.length !== 5) return null
    const correctText = correctRaw
    const keep = options.length >= 1 ? options : [correctText]
    const correctIndex = Math.max(
      0,
      keep.findIndex((o) => o === correctText),
    )
    if (!keep[correctIndex]) return null
    return {
      id: `mem-wb-${seq}-${row.fingerprint.slice(0, 10)}`,
      originFingerprint: row.fingerprint,
      module: row.module,
      scopeKey: row.scopeKey,
      scopeLabel: row.scopeLabel,
      drillMode: row.drillMode,
      questionType: row.questionType,
      term: row.term,
      stem: row.stem,
      options: keep,
      correctIndex,
      explanation: row.explanation,
      sourceTitle: row.sourceTitle,
      context: row.context,
      segments,
    }
  }

  if (options.length < 2) return null
  const correctText = correctRaw
  const shuffled = shuffleInPlace([...options])
  const correctIndex = shuffled.findIndex((o) => o === correctText)
  if (correctIndex < 0) return null
  return {
    id: `mem-wb-${seq}-${row.fingerprint.slice(0, 10)}`,
    originFingerprint: row.fingerprint,
    module: row.module,
    scopeKey: row.scopeKey,
    scopeLabel: row.scopeLabel,
    drillMode: row.drillMode,
    questionType: row.questionType,
    term: row.term,
    stem: row.stem,
    options: shuffled,
    correctIndex,
    explanation: row.explanation,
    sourceTitle: row.sourceTitle,
    context: row.context,
    segments: row.segments ? [...row.segments] : undefined,
  }
}

export function buildMemorizationWrongQuizItems(
  rows: MemorizationWrongRecord[],
): MemorizationWrongQuizItem[] {
  const out: MemorizationWrongQuizItem[] = []
  rows.forEach((row, i) => {
    const item = memorizationWrongToQuizItem(row, i + 1)
    if (item) out.push(item)
  })
  return out
}

export function chunkMemorizationWrongQuizItems(
  items: MemorizationWrongQuizItem[],
  size = WRONG_BOOK_BATCH_SIZE,
): MemorizationWrongQuizItem[][] {
  const out: MemorizationWrongQuizItem[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

export function memorizationWrongRecordDateKey(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return localDateKey(d)
  } catch {
    return ''
  }
}

export function filterMemorizationWrongRecords(
  rows: MemorizationWrongRecord[],
  filter: { wrongCount?: number; dateKey?: string },
): MemorizationWrongRecord[] {
  return rows.filter((row) => {
    if (
      typeof filter.wrongCount === 'number' &&
      filter.wrongCount > 0 &&
      (row.wrongCount ?? 0) !== filter.wrongCount
    ) {
      return false
    }
    if (filter.dateKey) {
      if (memorizationWrongRecordDateKey(row.updatedAt) !== filter.dateKey) return false
    }
    return true
  })
}

export const MEMORIZATION_WRONG_STORAGE_KEY = STORAGE_KEY
export { WRONG_BOOK_BATCH_SIZE }
