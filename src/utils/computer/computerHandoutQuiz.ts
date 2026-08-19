export type ComputerQuizKind = 'choice' | 'judge' | 'calc'

export type ComputerQuizQuestion = {
  fingerprint: string
  kind: ComputerQuizKind
  term: string
  stem: string
  options: string[]
  correctIndex: number
  correctText: string
  explanation: string
  itemId: string
  itemTitle: string
}

export type ComputerQuizCounts = {
  choice: number
  judge: number
  calc: number
}

export const DEFAULT_COMPUTER_QUIZ_COUNTS: ComputerQuizCounts = {
  choice: 5,
  judge: 2,
  calc: 0,
}

export function computerQuizKindLabel(kind: ComputerQuizKind): string {
  if (kind === 'judge') return '判断'
  if (kind === 'calc') return '简答'
  return '选择'
}

export function totalComputerQuizCount(c: ComputerQuizCounts): number {
  return Math.max(0, c.choice) + Math.max(0, c.judge) + Math.max(0, c.calc)
}

export function clampComputerQuizCounts(raw: Partial<ComputerQuizCounts>): ComputerQuizCounts {
  const n = (v: unknown, fallback: number) => {
    const x = Math.round(Number(v))
    if (!Number.isFinite(x)) return fallback
    return Math.min(20, Math.max(0, x))
  }
  const choice = n(raw.choice, DEFAULT_COMPUTER_QUIZ_COUNTS.choice)
  const judge = n(raw.judge, DEFAULT_COMPUTER_QUIZ_COUNTS.judge)
  const calc = n(raw.calc, DEFAULT_COMPUTER_QUIZ_COUNTS.calc)
  if (choice + judge + calc <= 0) return { ...DEFAULT_COMPUTER_QUIZ_COUNTS }
  return { choice, judge, calc }
}

export function buildComputerQuizFingerprint(input: {
  kind: ComputerQuizKind
  stem: string
  correctText: string
}): string {
  const stem = input.stem.replace(/\s+/g, '').slice(0, 80)
  const ans = input.correctText.replace(/\s+/g, '').slice(0, 40)
  return `cb-quiz:${input.kind}:${stem}:${ans}`
}

function asText(v: unknown): string {
  return String(v ?? '').trim()
}

function parseKind(v: unknown): ComputerQuizKind | null {
  const t = asText(v).toLowerCase()
  if (t === 'choice' || t === '选择' || t === 'mcq') return 'choice'
  if (t === 'judge' || t === '判断' || t === 'tf' || t === 'truefalse') return 'judge'
  if (t === 'calc' || t === '简答' || t === '计算' || t === 'short') return 'calc'
  return null
}

function letterIndex(v: unknown): number {
  const t = asText(v)
  const m = t.match(/^[A-Da-d]$/)
  if (m) return m[0].toUpperCase().charCodeAt(0) - 65
  const n = Number(t)
  if (Number.isInteger(n) && n >= 1 && n <= 4) return n - 1
  if (Number.isInteger(n) && n >= 0 && n <= 3) return n
  return -1
}

export function parseComputerQuizAiItem(
  raw: unknown,
  meta: { itemId: string; itemTitle: string },
): ComputerQuizQuestion | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const kind = parseKind(o.kind ?? o.type ?? o.questionType)
  if (!kind) return null
  const stem = asText(o.stem ?? o.question ?? o.title)
  const explanation = asText(o.explanation ?? o.explain ?? o.parse)
  const term = asText(o.term ?? o.point ?? o.考点) || stem.slice(0, 24)
  if (stem.length < 6) return null

  if (kind === 'calc') {
    const correctText = asText(o.correct ?? o.answer ?? o.correctText)
    if (!correctText) return null
    return {
      fingerprint: buildComputerQuizFingerprint({ kind, stem, correctText }),
      kind,
      term,
      stem,
      options: [],
      correctIndex: 0,
      correctText,
      explanation,
      itemId: meta.itemId,
      itemTitle: meta.itemTitle,
    }
  }

  const optsRaw = o.options ?? o.choices
  let options = Array.isArray(optsRaw) ? optsRaw.map(asText).filter(Boolean) : []
  if (kind === 'judge') {
    if (options.length < 2) options = ['正确', '错误']
    options = options.slice(0, 2)
  } else if (options.length < 4) {
    return null
  } else {
    options = options.slice(0, 4)
  }

  let correctIndex = letterIndex(o.correctIndex ?? o.answerIndex)
  const correctTextHint = asText(o.correct ?? o.answer)
  if (correctIndex < 0 && correctTextHint) {
    const hit = options.findIndex((x) => x === correctTextHint || x.includes(correctTextHint) || correctTextHint.includes(x))
    if (hit >= 0) correctIndex = hit
    if (kind === 'judge') {
      if (/^(正确|对|true|t|√|是)$/i.test(correctTextHint)) correctIndex = options.findIndex((x) => /正确|对/.test(x))
      if (/^(错误|错|false|f|×|否)$/i.test(correctTextHint)) correctIndex = options.findIndex((x) => /错误|错/.test(x))
    }
  }
  if (correctIndex < 0 || correctIndex >= options.length) return null
  const correctText = options[correctIndex] ?? ''
  return {
    fingerprint: buildComputerQuizFingerprint({ kind, stem, correctText }),
    kind,
    term,
    stem,
    options,
    correctIndex,
    correctText,
    explanation,
    itemId: meta.itemId,
    itemTitle: meta.itemTitle,
  }
}

export function normalizeCalcAnswer(s: string): string {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[。．.]$/g, '')
    .toLowerCase()
}
