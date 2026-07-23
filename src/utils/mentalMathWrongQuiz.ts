/**
 * 口算错题集：筛选、分批（10 题一组）、可选 AI 变式。
 */
import { isAiChatConfigured, requestChinesePracticeVariantJson } from '@/services/deepseek'
import { localDateKey } from '@/utils/practiceSessionLog'
import type { MentalMathWrongRecord } from '@/utils/mentalMathWrongBook'

export const WRONG_BOOK_BATCH_SIZE = 10

export type WrongBookFilter = {
  /** 最少错题次数（含） */
  minWrongCount?: number
  /** 某一天 YYYY-MM-DD；空=不限 */
  dateKey?: string
}

export type WrongBookQuizItem = {
  id: string
  originFingerprint: string
  expression: string
  /** mcq：四选一；fill：填空（口算无选项错题） */
  kind: 'mcq' | 'fill'
  options: string[]
  correctIndex: number
  /** fill 时的标准答案 */
  fillAnswer?: string
  explanation?: string
  isVariant: boolean
}

/** 通用错题筛选（口算 / 语文关题均含 wrongCount、updatedAt） */
export function filterWrongBookByMeta<T extends { wrongCount: number; updatedAt: string }>(
  rows: T[],
  filter: WrongBookFilter,
): T[] {
  return rows.filter((row) => {
    if (
      typeof filter.minWrongCount === 'number' &&
      filter.minWrongCount > 0 &&
      (row.wrongCount ?? 0) < filter.minWrongCount
    ) {
      return false
    }
    if (filter.dateKey) {
      if (recordDateKey(row.updatedAt) !== filter.dateKey) return false
    }
    return true
  })
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function recordDateKey(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return localDateKey(d)
  } catch {
    return ''
  }
}

export function filterMentalMathWrongRecords(
  rows: MentalMathWrongRecord[],
  filter: WrongBookFilter,
): MentalMathWrongRecord[] {
  return filterWrongBookByMeta(rows, filter)
}

function normalizeFillAnswer(s: string): string {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/，/g, ',')
    .toLowerCase()
}

export function isFillAnswerMatch(input: string, expected: string): boolean {
  return normalizeFillAnswer(input) === normalizeFillAnswer(expected)
}

/** 将错题记录转为测验题；有选项走 MCQ，否则填空 */
export function wrongRecordToQuizItem(
  row: MentalMathWrongRecord,
  seq: number,
): WrongBookQuizItem | null {
  const correct = String(row.correctAnswer ?? '').trim()
  if (!correct) return null
  let options = (row.options ?? []).map((o) => String(o).trim()).filter(Boolean)
  if (options.length >= 2) {
    if (!options.includes(correct)) options = [...options, correct]
    options = [...new Set(options)]
    if (options.length < 2) {
      return {
        id: `wbq-${seq}-${row.fingerprint.slice(0, 10)}`,
        originFingerprint: row.fingerprint,
        expression: row.expression,
        kind: 'fill',
        options: [],
        correctIndex: -1,
        fillAnswer: correct,
        explanation: row.explanation,
        isVariant: false,
      }
    }
    shuffleInPlace(options)
    const correctIndex = options.findIndex((o) => o === correct)
    if (correctIndex < 0) return null
    return {
      id: `wbq-${seq}-${row.fingerprint.slice(0, 10)}`,
      originFingerprint: row.fingerprint,
      expression: row.expression,
      kind: 'mcq',
      options,
      correctIndex,
      explanation: row.explanation,
      isVariant: false,
    }
  }
  return {
    id: `wbq-${seq}-${row.fingerprint.slice(0, 10)}`,
    originFingerprint: row.fingerprint,
    expression: row.expression,
    kind: 'fill',
    options: [],
    correctIndex: -1,
    fillAnswer: correct,
    explanation: row.explanation,
    isVariant: false,
  }
}

export function chunkWrongBookQuizItems(
  items: WrongBookQuizItem[],
  size = WRONG_BOOK_BATCH_SIZE,
): WrongBookQuizItem[][] {
  const n = Math.max(1, Math.floor(size))
  const out: WrongBookQuizItem[][] = []
  for (let i = 0; i < items.length; i += n) {
    out.push(items.slice(i, i + n))
  }
  return out
}

async function requestWrongBookMcqVariant(
  row: MentalMathWrongRecord,
): Promise<WrongBookQuizItem | null> {
  const correct = String(row.correctAnswer ?? '').trim()
  const opts = (row.options ?? []).map((o) => String(o).trim()).filter(Boolean)
  if (!correct || opts.length < 2) return null
  const distractors = opts.filter((o) => o !== correct)
  const original = {
    stem: row.expression,
    correct,
    distractors: distractors.slice(0, 3),
    options: opts,
    explanation: row.explanation ?? '',
  }
  const schemaHint = [
    '输出字段：stem（题干，可含材料）；correct（正确选项文案）；distractors（长度 3 的干扰项数组）；explanation（简短解析）。',
    '四选一；选项字数尽量齐整；禁止正确项独最长；干扰半真半假。',
  ].join('\n')
  try {
    const raw = await requestChinesePracticeVariantJson({
      sourceTitle: '数量关系/资料分析错题变式',
      schemaHint,
      originalQuestionJson: JSON.stringify(original),
    })
    if (!raw || typeof raw !== 'object') return null
    const o = raw as Record<string, unknown>
    const stem = String(o.stem ?? o.expression ?? o.question ?? '').trim()
    const newCorrect = String(o.correct ?? o.correctAnswer ?? '').trim()
    let distractorsOut: string[] = []
    if (Array.isArray(o.distractors)) {
      distractorsOut = o.distractors.map((x) => String(x ?? '').trim()).filter(Boolean)
    }
    if (!stem || !newCorrect || distractorsOut.length < 2) return null
    const options = shuffleInPlace([...new Set([newCorrect, ...distractorsOut.slice(0, 3)])])
    if (options.length < 2) return null
    const correctIndex = options.findIndex((x) => x === newCorrect)
    if (correctIndex < 0) return null
    return {
      id: `wbq-var-${row.fingerprint.slice(0, 10)}-${Date.now()}`,
      originFingerprint: row.fingerprint,
      expression: stem,
      kind: 'mcq',
      options,
      correctIndex,
      explanation: String(o.explanation ?? o.analysis ?? row.explanation ?? '').trim() || undefined,
      isVariant: true,
    }
  } catch {
    return null
  }
}

/**
 * 从错题生成测验题（优先 AI 变式，失败用原题打乱选项）。
 * 返回可测验的题目列表（可能少于输入，因无选项的题会跳过）。
 */
export async function buildWrongBookQuizItems(
  rows: MentalMathWrongRecord[],
  onProgress?: (msg: string) => void,
): Promise<WrongBookQuizItem[]> {
  const out: WrongBookQuizItem[] = []
  const useAi = isAiChatConfigured()
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    onProgress?.(`准备第 ${i + 1}/${rows.length} 题…`)
    let item: WrongBookQuizItem | null = null
    if (useAi) {
      item = await requestWrongBookMcqVariant(row)
    }
    if (!item) item = wrongRecordToQuizItem(row, i + 1)
    if (item) out.push(item)
  }
  return out
}
