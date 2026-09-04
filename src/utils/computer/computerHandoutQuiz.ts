import { judgeExplanationConflictsCorrect } from '@/utils/quiz/handoutQuizConsistency'

export type ComputerQuizKind = 'choice' | 'judge' | 'calc' | 'short'

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
  learningPath?: string[]
}

export type ComputerQuizCounts = {
  choice: number
  judge: number
  calc: number
  short: number
}

export const DEFAULT_COMPUTER_QUIZ_COUNTS: ComputerQuizCounts = {
  choice: 2,
  judge: 1,
  calc: 0,
  short: 0,
}

export const COMPUTER_QUIZ_KIND_MAX = 15

const QUIZ_COUNT_MAX: ComputerQuizCounts = {
  choice: COMPUTER_QUIZ_KIND_MAX,
  judge: COMPUTER_QUIZ_KIND_MAX,
  calc: COMPUTER_QUIZ_KIND_MAX,
  short: COMPUTER_QUIZ_KIND_MAX,
}

export function computerQuizKindLabel(kind: ComputerQuizKind): string {
  if (kind === 'judge') return '判断'
  if (kind === 'calc') return '计算'
  if (kind === 'short') return '简答'
  return '选择'
}

export function totalComputerQuizCount(c: ComputerQuizCounts): number {
  return Math.max(0, c.choice) + Math.max(0, c.judge) + Math.max(0, c.calc) + Math.max(0, c.short)
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
  const short = n(raw.short, DEFAULT_COMPUTER_QUIZ_COUNTS.short, QUIZ_COUNT_MAX.short)
  if (choice + judge + calc + short <= 0) return { ...DEFAULT_COMPUTER_QUIZ_COUNTS }
  return { choice, judge, calc, short }
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

const ABBREV_GLOSS_PAREN_RE =
  /\b([A-Za-z][A-Za-z0-9\-\/]{1,16})\s*[（(]([^）)]*[一-龥][^）)]{0,24})[）)]/g
const ABBREV_GLOSS_SLASH_RE = /\b([A-Za-z][A-Za-z0-9\-]{1,16})\s*[／/]\s*([\u4e00-\u9fff]{2,18})/g

function harvestAbbrevGlosses(s: string): string[] {
  const out: string[] = []
  const text = String(s || '')
  const pushAll = (re: RegExp, compactGloss: boolean) => {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const abbr = (m[1] ?? '').trim()
      const gloss = compactGloss ? (m[2] ?? '').replace(/\s+/g, '').trim() : (m[2] ?? '').trim()
      if (abbr && gloss) out.push(`${abbr}：${gloss}`)
    }
  }
  pushAll(ABBREV_GLOSS_PAREN_RE, true)
  pushAll(ABBREV_GLOSS_SLASH_RE, false)
  return out
}

/** 去掉题干/选项里夹带的缩写中文提示，这类信息只应出现在解析。 */
export function stripComputerQuizHintGloss(s: string): string {
  ABBREV_GLOSS_PAREN_RE.lastIndex = 0
  ABBREV_GLOSS_SLASH_RE.lastIndex = 0
  return String(s || '')
    .replace(ABBREV_GLOSS_PAREN_RE, '$1')
    .replace(ABBREV_GLOSS_SLASH_RE, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([，。；、])/g, '$1')
    .trim()
}

function collectAndStripGlosses(parts: string[]): { texts: string[]; glosses: string[] } {
  const glosses: string[] = []
  const seen = new Set<string>()
  const texts = parts.map((raw) => {
    for (const g of harvestAbbrevGlosses(raw)) {
      if (seen.has(g)) continue
      seen.add(g)
      glosses.push(g)
    }
    return stripComputerQuizHintGloss(raw)
  })
  return { texts, glosses }
}

function mergeGlossIntoExplanation(explanation: string, glosses: string[]): string {
  if (!glosses.length) return explanation
  const missing = glosses.filter((g) => {
    const abbr = g.split('：')[0] ?? ''
    return abbr && !explanation.includes(abbr)
  })
  if (!missing.length) return explanation
  const block = `缩写：${missing.join('；')}`
  return explanation ? `${explanation}\n${block}` : block
}

/** 作答过程中只展示缩写；中文全称并入解析。旧题入库后仍按此清洗。 */
export function sanitizeComputerQuizForDisplay(q: {
  stem: string
  term?: string
  options: string[]
  correctText: string
  explanation: string
}): {
  stem: string
  term: string
  options: string[]
  correctText: string
  explanation: string
} {
  const harvested = collectAndStripGlosses([
    q.stem,
    q.term ?? '',
    q.correctText,
    ...(q.options ?? []),
  ])
  return {
    stem: harvested.texts[0] ?? '',
    term: harvested.texts[1] ?? '',
    options: (q.options ?? []).map((opt) => stripComputerQuizHintGloss(opt)),
    correctText: harvested.texts[2] ?? '',
    explanation: mergeGlossIntoExplanation(q.explanation, harvested.glosses),
  }
}

export function extractComputerQuizSources(material: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  const re = /【讲义ID:([^｜|]+)[｜|]([^】]+)】/g
  let m: RegExpExecArray | null
  while ((m = re.exec(String(material || '')))) {
    const id = (m[1] ?? '').trim()
    const label = (m[2] ?? '').trim()
    if (id && !out.some((x) => x.id === id)) out.push({ id, label })
  }
  return out
}

export function extractComputerQuizSourceIds(material: string): string[] {
  return extractComputerQuizSources(material).map((x) => x.id)
}

function parseKind(v: unknown): ComputerQuizKind | null {
  const t = asText(v).toLowerCase()
  if (t === 'choice' || t === '选择' || t === 'mcq') return 'choice'
  if (t === 'judge' || t === '判断' || t === 'tf' || t === 'truefalse') return 'judge'
  if (t === 'short' || t === '简答' || t === '简答题' || t === 'essay') return 'short'
  if (t === 'calc' || t === '计算' || t === '计算题') return 'calc'
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

function resolveQuizSourceMeta(
  o: Record<string, unknown>,
  meta: {
    itemId: string
    itemTitle: string
    learningPath?: string[]
    allowedSources?: { id: string; label: string }[]
    allowedSourceIds?: string[]
  },
): { itemId: string; itemTitle: string; learningPath?: string[] } {
  const claimed = asText(o.sourceId ?? o.handoutId)
  const sources = meta.allowedSources?.length
    ? meta.allowedSources
    : (meta.allowedSourceIds ?? []).map((id) => ({ id, label: '' }))
  const hit = sources.find((s) => s.id === claimed)
  if (!hit) {
    return { itemId: meta.itemId, itemTitle: meta.itemTitle, learningPath: meta.learningPath }
  }
  const parts = hit.label.split('/').map((s) => s.trim()).filter(Boolean)
  const title = asText(o.sourceTitle) || parts.pop() || meta.itemTitle
  return {
    itemId: hit.id,
    itemTitle: title,
    learningPath: parts.length ? parts : meta.learningPath,
  }
}

export function parseComputerQuizAiItem(
  raw: unknown,
  meta: {
    itemId: string
    itemTitle: string
    learningPath?: string[]
    allowedSources?: { id: string; label: string }[]
    allowedSourceIds?: string[]
  },
): ComputerQuizQuestion | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const kind = parseKind(o.kind ?? o.type ?? o.questionType)
  if (!kind) return null
  const harvested = collectAndStripGlosses([
    asText(o.stem ?? o.question ?? o.title),
    asText(o.term ?? o.point ?? o.考点),
    asText(o.correct ?? o.answer ?? o.correctText),
    ...(Array.isArray(o.options) ? o.options.map(asText) : []),
    ...(Array.isArray(o.choices) ? o.choices.map(asText) : []),
    ...(Array.isArray(o.distractors) ? o.distractors.map(asText) : []),
  ])
  const stem = harvested.texts[0] ?? ''
  const termIn = harvested.texts[1] ?? ''
  const correctHintIn = harvested.texts[2] ?? ''
  let explanation = mergeGlossIntoExplanation(asText(o.explanation ?? o.explain ?? o.parse), harvested.glosses)
  const term = termIn || stem.slice(0, 24)
  if (stem.length < 6) return null
  const source = resolveQuizSourceMeta(o, meta)
  const learningPath = (source.learningPath ?? []).map((s) => String(s).trim()).filter(Boolean)

  if (kind === 'calc' || kind === 'short') {
    let nextKind = kind
    const correctText = correctHintIn
    if (!correctText) return null
    if (
      nextKind === 'calc' &&
      compactText(correctText).length > 48 &&
      /[\u4e00-\u9fff]{12,}/.test(correctText)
    ) {
      nextKind = 'short'
    }
    return {
      fingerprint: buildComputerQuizFingerprint({ kind: nextKind, stem, correctText }),
      kind: nextKind,
      term,
      stem,
      options: [],
      correctIndex: 0,
      correctText,
      explanation,
      itemId: source.itemId,
      itemTitle: source.itemTitle,
      learningPath,
    }
  }

  const distractorsRaw = Array.isArray(o.distractors)
    ? o.distractors.map((x) => stripComputerQuizHintGloss(asText(x))).filter(Boolean)
    : []
  const optsRaw = o.options ?? o.choices
  let options = Array.isArray(optsRaw)
    ? optsRaw.map((x) => stripComputerQuizHintGloss(asText(x))).filter(Boolean)
    : []
  const correctHint = correctHintIn

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
  if (kind === 'judge' && judgeExplanationConflictsCorrect(correctText, explanation)) return null
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
    itemId: source.itemId,
    itemTitle: source.itemTitle,
    learningPath,
  }
}

export function normalizeCalcAnswer(s: string): string {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[。．.、,，;；:：]/g, '')
    .replace(/[（）()【】\[\]]/g, '')
    .toLowerCase()
}

function extractCalcCores(correct: string): string[] {
  const raw = String(correct ?? '').trim()
  const compact = normalizeCalcAnswer(raw)
  const out = new Set<string>()
  if (compact) out.add(compact)
  for (const m of raw.match(/[+-]?\d+(?:\.\d+)?/g) ?? []) {
    const n = normalizeCalcAnswer(m)
    if (n.length >= 1) out.add(n)
  }
  for (const m of raw.match(/[01]{4,}/g) ?? []) out.add(m)
  for (const m of raw.match(/[0-9a-fA-F]+[hH]/g) ?? []) out.add(m.toLowerCase())
  return [...out]
}

/** 计算题：用户输入里包含标准结果即可，允许前后多写说明。 */
export function calcAnswerMatches(user: string, correct: string): boolean {
  const u = normalizeCalcAnswer(user)
  const c = normalizeCalcAnswer(correct)
  if (!u || !c) return false
  if (u === c) return true
  if (u.includes(c)) return true
  return extractCalcCores(correct).some((core) => {
    if (!core) return false
    if (core.length >= 2) return u.includes(core)
    return u === core
  })
}
