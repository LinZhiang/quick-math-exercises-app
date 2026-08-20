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
  choice: 2,
  judge: 1,
  calc: 0,
}

const QUIZ_COUNT_MAX: ComputerQuizCounts = {
  choice: 8,
  judge: 6,
  calc: 4,
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
  const n = (v: unknown, fallback: number, max: number) => {
    const x = Math.round(Number(v))
    if (!Number.isFinite(x)) return fallback
    return Math.min(max, Math.max(0, x))
  }
  const choice = n(raw.choice, DEFAULT_COMPUTER_QUIZ_COUNTS.choice, QUIZ_COUNT_MAX.choice)
  const judge = n(raw.judge, DEFAULT_COMPUTER_QUIZ_COUNTS.judge, QUIZ_COUNT_MAX.judge)
  const calc = n(raw.calc, DEFAULT_COMPUTER_QUIZ_COUNTS.calc, QUIZ_COUNT_MAX.calc)
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

function compactText(s: string): string {
  return s.replace(/\s+/g, '')
}

function negatedSnippets(exp: string): string[] {
  const out: string[] = []
  const re = /(并非|并不是|而不是|并不能理解为)([\u4e00-\u9fffA-Za-z0-9]{2,16})/g
  let m: RegExpExecArray | null
  while ((m = re.exec(exp))) out.push(m[2] ?? '')
  return out.filter(Boolean)
}

function mentionScore(opt: string, exp: string): number {
  const o = compactText(opt)
  if (!o) return 0
  if (negatedSnippets(exp).some((n) => n && (o.includes(n) || n.includes(o)))) return -8
  let score = 0
  if (exp.includes(o)) score += 4
  const chunks = o.match(/[\u4e00-\u9fff]{4,}/g) || []
  for (const c of chunks) {
    if (exp.includes(c)) score += 2
  }
  if (score === 0) {
    const mid = o.match(/[\u4e00-\u9fff]{3,8}/g) || []
    if (mid.some((c) => c.length >= 4 && exp.includes(c))) score += 2
  }
  if (score > 0 && (exp.includes(`是${o}`) || exp.includes(`为${o}`) || exp.includes(`应选${o}`))) {
    score += 3
  }
  return score
}

function parseQuantities(s: string): { num: string; unit: string }[] {
  const out: { num: string; unit: string }[] = []
  const re = /(\d+(?:\.\d+)?)\s*([A-Za-z]{1,5}|[兆亿万千]|位|字节|瓦)/g
  const text = String(s || '')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    out.push({ num: m[1] ?? '', unit: (m[2] ?? '').trim() })
  }
  return out.filter((x) => x.num && x.unit)
}

function normUnit(u: string): string {
  const x = u.toLowerCase()
  if (x === 'w' || x === '瓦') return 'W'
  if (x === 'kw') return 'kW'
  if (x === 'gb' || x === 'gib') return 'GB'
  if (x === 'mb' || x === 'mib') return 'MB'
  if (x === 'kb' || x === 'kib') return 'KB'
  if (x === 'bit' || x === '位') return 'bit'
  if (x === '字节') return 'B'
  return x
}

function stemAnswerQuantityClash(stem: string, answer: string): boolean {
  const a = parseQuantities(stem)
  const b = parseQuantities(answer)
  for (const x of a) {
    for (const y of b) {
      const ux = normUnit(x.unit)
      const uy = normUnit(y.unit)
      if (x.num === y.num && ux && uy && ux !== uy) return true
    }
  }
  return false
}

function optionIndexByText(options: string[], hint: string): number {
  const h = compactText(hint)
  if (!h || /^[A-Da-d]$/.test(h)) return -1
  const exact = options.findIndex((x) => compactText(x) === h)
  if (exact >= 0) return exact
  if (h.length < 4) return -1
  const contains = options.findIndex((x) => {
    const o = compactText(x)
    return o && (o.includes(h) || h.includes(o))
  })
  return contains
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = arr[i]!
    arr[i] = arr[j]!
    arr[j] = a
  }
  return arr
}

/** 解析与标答打架时，以解析支持的选项为准；对不上则丢掉。 */
function reconcileByExplanation(options: string[], claimed: number, explanation: string): number {
  const exp = compactText(explanation)
  if (!exp) return claimed
  const scores = options.map((opt) => mentionScore(opt, exp))
  const claimedScore = claimed >= 0 && claimed < scores.length ? scores[claimed]! : -99
  let best = 0
  for (let i = 1; i < scores.length; i++) {
    if (scores[i]! > scores[best]!) best = i
  }
  const bestScore = scores[best] ?? 0
  const uniqueBest = bestScore > 0 && scores.filter((s) => s === bestScore).length === 1
  if (claimedScore < 0 && uniqueBest) return best
  if (uniqueBest && best !== claimed && (claimedScore <= 0 || bestScore >= claimedScore + 3)) {
    return best
  }
  if (claimedScore < 0) return -1
  return claimed
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

  const distractorsRaw = Array.isArray(o.distractors) ? o.distractors.map(asText).filter(Boolean) : []
  const optsRaw = o.options ?? o.choices
  let options = Array.isArray(optsRaw) ? optsRaw.map(asText).filter(Boolean) : []
  const correctHint = asText(o.correct ?? o.answer ?? o.correctText)

  if (kind === 'judge') {
    if (options.length < 2) options = ['正确', '错误']
    options = options.slice(0, 2)
  } else {
    if (correctHint && distractorsRaw.length >= 3 && options.length < 4) {
      options = [correctHint, ...distractorsRaw].filter(Boolean)
    }
    const uniq: string[] = []
    for (const x of options) {
      if (!uniq.some((u) => compactText(u) === compactText(x))) uniq.push(x)
    }
    options = uniq.slice(0, 4)
    if (options.length < 4) return null
  }

  let correctIndex = optionIndexByText(options, correctHint)
  if (correctIndex < 0 && kind === 'judge') {
    if (/^(正确|对|true|t|√|是)$/i.test(correctHint)) correctIndex = options.findIndex((x) => /正确|对/.test(x))
    if (/^(错误|错|false|f|×|否)$/i.test(correctHint)) correctIndex = options.findIndex((x) => /错误|错/.test(x))
  }
  // 选择题不用 A/B/C/D 下标：模型常把错误项放第一位却写 correct:"A"
  correctIndex = reconcileByExplanation(options, correctIndex, explanation)
  if (correctIndex < 0 || correctIndex >= options.length) return null

  const correctText = options[correctIndex] ?? ''
  if (!correctText) return null
  if (kind === 'choice' && stemAnswerQuantityClash(stem, correctText)) return null
  if (kind === 'choice') {
    const rest = options.filter((_, i) => i !== correctIndex)
    options = shuffleInPlace([correctText, ...rest])
    correctIndex = options.findIndex((x) => compactText(x) === compactText(correctText))
    if (correctIndex < 0) return null
  }

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
