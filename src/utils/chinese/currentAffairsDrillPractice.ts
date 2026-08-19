/** 时政识记 · 挖空 / 语句填充 四选一 */

import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chinese/chineseMcqAiFields'

export type CurrentAffairsDrillMode = 'cloze' | 'sentence-fill' | 'sentence-order'

export type CurrentAffairsDrillQuestionType =
  | 'cloze-bold'
  | 'cloze-plain'
  | 'sentence-fill'
  | 'sentence-order'

export const CURRENT_AFFAIRS_DRILL_QUESTION_COUNT = 20
export const CURRENT_AFFAIRS_SENTENCE_FILL_QUESTION_COUNT = 20
export const CURRENT_AFFAIRS_SENTENCE_ORDER_QUESTION_COUNT = 8
/** 语句填充：被挖片段不少于该字数 */
export const CURRENT_AFFAIRS_SENTENCE_FILL_MIN_CHARS = 12
export const CURRENT_AFFAIRS_SENTENCE_ORDER_SEGMENTS = 5

/** 社会类题量 = 政治类的一半（向下取整，至少 1） */
export function currentAffairsDrillQuestionCountFor(
  mode: CurrentAffairsDrillMode,
  category: 'politics' | 'society' | string,
): number {
  const base =
    mode === 'sentence-fill'
      ? CURRENT_AFFAIRS_SENTENCE_FILL_QUESTION_COUNT
      : mode === 'sentence-order'
        ? CURRENT_AFFAIRS_SENTENCE_ORDER_QUESTION_COUNT
        : CURRENT_AFFAIRS_DRILL_QUESTION_COUNT
  if (category === 'society') return Math.max(1, Math.floor(base / 2))
  return base
}

export type CurrentAffairsDrillQuestion = {
  id: string
  questionType: CurrentAffairsDrillQuestionType
  /** 出处文章标题 */
  sourceTitle: string
  /** 被挖空的原文答案 / 排序题去重键 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
  scopeKey: string
  /** 可选：历史字段，界面已不再展示上下文 */
  context?: string
  /** 语句排序：界面展示的 5 段（已打乱，序号 1～5） */
  segments?: string[]
}

export function currentAffairsDrillQuestionTypeLabel(
  type: CurrentAffairsDrillQuestionType,
): string {
  if (type === 'cloze-bold') return '重点挖空'
  if (type === 'cloze-plain') return '通读挖空'
  if (type === 'sentence-order') return '语句排序'
  return '语句填充'
}

export function currentAffairsDrillModeLabel(mode: CurrentAffairsDrillMode): string {
  if (mode === 'sentence-fill') return '语句填充'
  if (mode === 'sentence-order') return '语句排序'
  return '词语挖空'
}

/** 不计空白的字数（用于选项等长校验） */
export function currentAffairsOptionCharCount(s: string): number {
  return [...String(s ?? '').replace(/\s+/g, '')].length
}

function optionsSameCharCount(correct: string, distractors: string[]): boolean {
  const n = currentAffairsOptionCharCount(correct)
  if (n < 2) return false
  return distractors.every((d) => currentAffairsOptionCharCount(d) === n)
}

/** 长句填充：字数可差一截，方便多词/大幅改写干扰项 */
function optionsNearCharCount(
  correct: string,
  distractors: string[],
  tolerance?: number,
): boolean {
  const n = currentAffairsOptionCharCount(correct)
  if (n < CURRENT_AFFAIRS_SENTENCE_FILL_MIN_CHARS) return false
  const tol = tolerance ?? Math.max(6, Math.floor(n * 0.35))
  return distractors.every((d) => {
    const m = currentAffairsOptionCharCount(d)
    return m >= CURRENT_AFFAIRS_SENTENCE_FILL_MIN_CHARS - 2 && Math.abs(m - n) <= tol
  })
}

/** 简单编辑距离（按 Unicode 码点） */
function unicodeEditDistance(a: string, b: string): number {
  const aa = [...a]
  const bb = [...b]
  const n = aa.length
  const m = bb.length
  if (n === 0) return m
  if (m === 0) return n
  const prev = new Array<number>(m + 1)
  const cur = new Array<number>(m + 1)
  for (let j = 0; j <= m; j++) prev[j] = j
  for (let i = 1; i <= n; i++) {
    cur[0] = i
    for (let j = 1; j <= m; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost)
    }
    for (let j = 0; j <= m; j++) prev[j] = cur[j]!
  }
  return prev[m]!
}

/**
 * 语句填充干扰项：禁止只改 1～2 字的「过细」改写；
 * 须与正确项有足够差异，但仍像官方表述。
 */
function sentenceFillDistractorsOk(correct: string, distractors: string[]): boolean {
  const c = correct.replace(/\s+/g, '')
  if (!optionsNearCharCount(c, distractors.map((d) => d.replace(/\s+/g, '')))) return false
  const minDist = Math.max(3, Math.floor(c.length * 0.12))
  return distractors.every((d) => {
    const t = d.replace(/\s+/g, '')
    if (t === c) return false
    return unicodeEditDistance(c, t) >= minDist
  })
}

function normalizeLeakText(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '')
    .replace(/[《》〈〉「」『』【】\[\]（）()、，。！？：；·\-—_/\\]/g, '')
}

function stemLeaksAnswer(stem: string, answer: string): boolean {
  const a = normalizeLeakText(answer)
  if (!a || a.length < 2) return false
  return normalizeLeakText(stem).includes(a)
}

function stemHasBlank(stem: string): boolean {
  return /_{2,}|…{2,}|（\s*）|\(\s*\)|【\s*】|＿/.test(stem)
}

export function getCurrentAffairsDrillQuestionFingerprint(input: {
  questionType: CurrentAffairsDrillQuestionType
  sourceTitle: string
  term: string
  stem: string
  options: string[]
  scopeKey: string
}): string {
  const opts = [...input.options].map((o) => o.trim()).sort().join('\u001f')
  return [
    'ca-drill',
    input.scopeKey,
    input.questionType,
    input.sourceTitle.trim(),
    input.term.trim(),
    input.stem.trim(),
    opts,
  ].join('\u001e')
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function buildCurrentAffairsDrillQuestionFromMcq(input: {
  questionType: CurrentAffairsDrillQuestionType
  sourceTitle: string
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  context?: string
  segments?: string[]
  scopeKey: string
  seq: number
}): CurrentAffairsDrillQuestion | null {
  const sourceTitle = input.sourceTitle.trim()
  let term = (input.term || input.correct).trim()
  let stem = input.stem.trim()
  let correct = input.correct.trim()
  let distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  const context = String(input.context ?? '').trim()
  if (!sourceTitle || !correct) return null

  const isSentence = input.questionType === 'sentence-fill'
  const isOrder = input.questionType === 'sentence-order'
  let segments: string[] | undefined

  if (isOrder) {
    segments = (input.segments ?? [])
      .map((s) => String(s ?? '').trim().replace(/\*\*/g, ''))
      .filter(Boolean)
    const correctNorm = normalizeOrderOption(correct)
    if (!correctNorm) return null
    if (!orderSegmentsAllValid(segments, correctNorm)) return null
    let distractorsNorm = distractors
      .map((d) => normalizeOrderOption(d))
      .filter(Boolean)
      .filter((d) => d !== correctNorm)
    distractorsNorm = [...new Set(distractorsNorm)]
    if (distractorsNorm.length < 3) {
      distractorsNorm = [
        ...distractorsNorm,
        ...generateOrderDistractors(correctNorm).filter((d) => !distractorsNorm.includes(d)),
      ].slice(0, 3)
    }
    if (distractorsNorm.length !== 3) return null
    if (new Set([correctNorm, ...distractorsNorm]).size !== 4) return null
    correct = correctNorm
    distractors = distractorsNorm
    term = (input.term || segments.join('|')).trim().slice(0, 96) || correctNorm
    stem =
      stem ||
      '下列五段文字顺序已打乱。请点选片段填入下方排序区，可拖动调整，完成后点击确认。'
  } else {
    if (distractors.length !== 3) return null
    if (!term || !stem) return null
    if (!stemHasBlank(stem)) return null
    if (stemLeaksAnswer(stem, correct)) return null
    if (isSentence) {
      if (currentAffairsOptionCharCount(correct) < CURRENT_AFFAIRS_SENTENCE_FILL_MIN_CHARS) {
        return null
      }
      if (!sentenceFillDistractorsOk(correct, distractors)) return null
    } else if (!optionsSameCharCount(correct, distractors)) {
      return null
    }
  }

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getCurrentAffairsDrillQuestionFingerprint({
    questionType: input.questionType,
    sourceTitle,
    term,
    stem,
    options,
    scopeKey: input.scopeKey,
  })
  const q: CurrentAffairsDrillQuestion = {
    id: `ca-drill-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    sourceTitle,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
    scopeKey: input.scopeKey,
    context: context || undefined,
    segments,
  }
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

/** 规范化排序选项：3、4、5、2、1 */
export function normalizeOrderOption(raw: string): string {
  const nums = String(raw ?? '')
    .match(/[1-5]/g)
    ?.map(Number)
  if (!nums || nums.length !== 5) return ''
  if (new Set(nums).size !== 5) return ''
  return nums.join('、')
}

export function isValidOrderOption(raw: string): boolean {
  return Boolean(normalizeOrderOption(raw))
}

/** 排序段：标点照搬原文；禁止过短碎片（如单独「第一」） */
export function isValidOrderSegment(text: string): boolean {
  const s = String(text ?? '')
    .trim()
    .replace(/\*\*/g, '')
  if (s.length < 4) return false
  if (/^第[一二三四五六七八九十百零〇两\d]+[、，,：:．.]?$/.test(s)) return false
  return true
}

/** 按正确序拼接后，整段摘抄须以句末标点收尾 */
export function orderCombinedEndsWithStop(segments: string[], correctOrder: string): boolean {
  const text = orderSegmentsToReadingText(segments, correctOrder)
  return Boolean(text) && /[。！？]$/.test(text)
}

export function orderSegmentsToReadingText(segments: string[], correctOrder: string): string {
  const norm = normalizeOrderOption(correctOrder)
  if (!norm || segments.length !== CURRENT_AFFAIRS_SENTENCE_ORDER_SEGMENTS) return ''
  return norm
    .split('、')
    .map((n) => segments[Number(n) - 1] ?? '')
    .join('')
}

export function orderSegmentsAllValid(segments: string[], correctOrder?: string): boolean {
  if (
    segments.length !== CURRENT_AFFAIRS_SENTENCE_ORDER_SEGMENTS ||
    !segments.every(isValidOrderSegment)
  ) {
    return false
  }
  if (correctOrder) return orderCombinedEndsWithStop(segments, correctOrder)
  return true
}

/** 本地生成强干扰排列（邻位交换 / 旋转等） */
export function generateOrderDistractors(correct: string): string[] {
  const base = normalizeOrderOption(correct)
  if (!base) return []
  const nums = base.split('、').map(Number)
  const out: string[] = []
  const tryAdd = (arr: number[]) => {
    if (arr.length !== 5 || new Set(arr).size !== 5) return
    const s = arr.join('、')
    if (s !== base && !out.includes(s)) out.push(s)
  }
  for (let i = 0; i < 4; i++) {
    const a = [...nums]
    const x = a[i]!
    a[i] = a[i + 1]!
    a[i + 1] = x
    tryAdd(a)
  }
  tryAdd([...nums].reverse())
  tryAdd([...nums.slice(1), nums[0]!])
  tryAdd([nums[4]!, ...nums.slice(0, 4)])
  if (nums.length >= 4) {
    const a = [...nums]
    const x = a[0]!
    a[0] = a[2]!
    a[2] = x
    tryAdd(a)
  }
  if (nums.length >= 5) {
    const a = [...nums]
    const x = a[1]!
    a[1] = a[3]!
    a[3] = x
    tryAdd(a)
  }
  return out.slice(0, 3)
}

export function orderArrangementToOption(labels: number[]): string {
  return normalizeOrderOption(labels.join('、'))
}

function parseOrderOptionList(raw: unknown): string | null {
  if (Array.isArray(raw)) {
    const nums = raw.map((x) => Number(x)).filter((n) => n >= 1 && n <= 5)
    if (nums.length === 5 && new Set(nums).size === 5) return nums.join('、')
    return null
  }
  const n = normalizeOrderOption(String(raw ?? ''))
  return n || null
}

const TYPE_ALIASES: Record<string, CurrentAffairsDrillQuestionType> = {
  'cloze-bold': 'cloze-bold',
  'cloze-plain': 'cloze-plain',
  'sentence-fill': 'sentence-fill',
  'sentence-order': 'sentence-order',
  bold: 'cloze-bold',
  plain: 'cloze-plain',
  重点挖空: 'cloze-bold',
  加粗挖空: 'cloze-bold',
  通读挖空: 'cloze-plain',
  非加粗挖空: 'cloze-plain',
  挖空: 'cloze-plain',
  语句填充: 'sentence-fill',
  长句填充: 'sentence-fill',
  半句填充: 'sentence-fill',
  语句排序: 'sentence-order',
  段落排序: 'sentence-order',
  排序: 'sentence-order',
}

export function parseCurrentAffairsDrillMcqAiObject(item: unknown): {
  questionType: CurrentAffairsDrillQuestionType
  sourceTitle: string
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  context: string
  segments: string[]
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? o.from ?? '').trim()
  let questionType: CurrentAffairsDrillQuestionType | null = TYPE_ALIASES[typeRaw] ?? null
  if (!questionType) {
    if (
      String(o.fromBold ?? o.isBold ?? '') === 'true' ||
      String(o.sourceKind ?? '') === 'bold'
    ) {
      questionType = 'cloze-bold'
    } else if (
      String(o.fromBold ?? '') === 'false' ||
      String(o.sourceKind ?? '') === 'plain'
    ) {
      questionType = 'cloze-plain'
    }
  }
  if (!questionType) return null
  const sourceTitle = String(
    o.sourceTitle ?? o.source ?? o.articleTitle ?? o.出处 ?? o.title ?? '',
  ).trim()
  const context = String(
    o.context ?? o.passage ?? o.paragraph ?? o.surrounding ?? o.上下文 ?? '',
  )
    .trim()
    .replace(/\*\*/g, '')

  if (questionType === 'sentence-order') {
    const segmentsRaw = o.segments ?? o.parts ?? o.chunks ?? o.pieces
    const segments = Array.isArray(segmentsRaw)
      ? segmentsRaw.map((s) => String(s ?? '').trim().replace(/\*\*/g, '')).filter(Boolean)
      : []
    const correct =
      parseOrderOptionList(o.correct ?? o.correctOrder ?? o.order ?? o.answer) ?? ''
    let distractors: string[] = []
    if (Array.isArray(o.distractors)) {
      distractors = o.distractors
        .map((d) => parseOrderOptionList(d))
        .filter((d): d is string => Boolean(d))
    }
    if (distractors.length < 3 && correct) {
      distractors = [
        ...distractors,
        ...generateOrderDistractors(correct).filter((d) => !distractors.includes(d)),
      ].slice(0, 3)
    }
    if (!sourceTitle || !correct || distractors.length !== 3) return null
    return {
      questionType,
      sourceTitle,
      term: String(o.term ?? correct).trim() || correct,
      stem: String(o.stem ?? o.question ?? '').trim(),
      correct,
      distractors,
      explanation: String(o.explanation ?? o.explain ?? '').trim(),
      context,
      segments,
    }
  }

  const stem = String(o.stem ?? o.question ?? '').trim()
  const picked = extractMcqCorrectAndDistractors(o)
  if (!sourceTitle || !stem || !picked) return null
  const term = String(o.term ?? o.blank ?? o.focus ?? picked.correct).trim()
  return {
    questionType,
    sourceTitle,
    term,
    stem,
    correct: picked.correct,
    distractors: picked.distractors,
    explanation: String(o.explanation ?? o.explain ?? '').trim(),
    context,
    segments: [],
  }
}

export function currentAffairsDrillSourceInList(
  sourceTitle: string,
  allowedTitles: string[],
): boolean {
  const want = sourceTitle.trim()
  if (!want) return false
  if (allowedTitles.some((t) => t === want)) return true
  const norm = (s: string) => s.replace(/\s+/g, '')
  const n = norm(want)
  return allowedTitles.some((t) => norm(t) === n || norm(t).includes(n) || n.includes(norm(t)))
}
