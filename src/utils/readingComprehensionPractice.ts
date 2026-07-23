import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
  mcqOptionSurfaceLeakFailure,
  mcqOptionVisibleLength,
  normalizeMcqOptionText,
} from '@/utils/chineseMcqAiFields'

export type ChineseReadingQuestionType =
  | 'main-idea'
  | 'detail'
  | 'word-sentence'
  | 'infer-next'
  | 'title'

export const READING_COMPREHENSION_QUESTION_COUNT = 10 // shorter passages, 10 per round is better

export type ReadingComprehensionQuestion = {
  id: string
  questionType: ChineseReadingQuestionType
  /** 知识点/材料主题短标签 */
  term: string
  /** 阅读材料原文（可多段） */
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
  /**
   * 支撑正确选项的文中原句（须为 passage 子串）。
   * 提交后在材料中高亮，便于定位。
   */
  keySentence?: string
}

/** AI 解析的结构化片段（打乱选项后再拼成带「选项1～4」的完整解析） */
export type ReadingExplanationParts = {
  /** 主旨/依据在文中的位置，如「文末结论句」「第二句」 */
  focus: string
  /** 正确项为何对（不含「选项N」前缀） */
  correctNote: string
  /** 与 distractors 一一对应的错因（长度须为 3） */
  distractorNotes: string[]
}

export function readingComprehensionQuestionTypeLabel(
  type: ChineseReadingQuestionType,
): string {
  const map: Record<ChineseReadingQuestionType, string> = {
    'main-idea': '主旨观点',
    detail: '细节判断',
    'word-sentence': '词句理解',
    'infer-next': '推断下文',
    title: '标题添加',
  }
  return map[type]
}

export function readingComprehensionHistoryKind(
  mode: ChineseReadingQuestionType,
):
  | 'reading-main-idea'
  | 'reading-detail'
  | 'reading-word-sentence'
  | 'reading-infer-next'
  | 'reading-title' {
  const map = {
    'main-idea': 'reading-main-idea',
    detail: 'reading-detail',
    'word-sentence': 'reading-word-sentence',
    'infer-next': 'reading-infer-next',
    title: 'reading-title',
  } as const
  return map[mode]
}

/**
 * 除「标题添加」外，批次中至少一道题的正确项须含绝对性表述，
 * 且材料原文须出现同类绝对词，避免正确项悬空。
 */
export const READING_ABSOLUTE_MARKERS = [
  '必须',
  '务必',
  '绝对',
  '完全',
  '一定',
  '一律',
  '全部',
  '始终',
  '绝不能',
  '绝不',
  '必不可少',
  '不可或缺',
] as const

const READING_ABSOLUTE_RE = new RegExp(READING_ABSOLUTE_MARKERS.join('|'))

export function textHasReadingAbsoluteMarker(text: string): boolean {
  return READING_ABSOLUTE_RE.test(String(text ?? ''))
}

/** 正确项含绝对词，且材料中至少出现同一类绝对词（对照命题） */
export function readingQuestionHasGroundedAbsoluteCorrect(
  q: Pick<ReadingComprehensionQuestion, 'passage' | 'options' | 'correctIndex' | 'keySentence'>,
): boolean {
  const correct = String(q.options[q.correctIndex] ?? '')
  if (!textHasReadingAbsoluteMarker(correct)) return false
  const passage = String(q.passage ?? '')
  const key = String(q.keySentence ?? '')
  // 正确项里出现的每个绝对标记，至少有一个能在材料或关键句中找到
  for (const marker of READING_ABSOLUTE_MARKERS) {
    if (!correct.includes(marker)) continue
    if (passage.includes(marker) || key.includes(marker)) return true
  }
  return false
}

/** 标题添加不要求绝对性正确项 */
export function readingModeNeedsAbsoluteCorrectSlot(
  mode: ChineseReadingQuestionType,
): boolean {
  return mode !== 'title'
}

export function getReadingComprehensionQuestionFingerprint(input: {
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  const opts = [...input.options].sort().join('\u001f')
  return `${input.questionType}\u001e${input.term.trim()}\u001e${input.passage.trim()}\u001e${input.stem.trim()}\u001e${opts}\u001e${input.correctIndex}`
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** 选项可见长度（去空白），用于防「选最长=正确」 */
export function readingOptionTextLength(s: string): number {
  return mcqOptionVisibleLength(s)
}

/**
 * 阅读理解选项长度/标点质量：与全站四选一表面泄题规则对齐（更严）。
 */
export function readingMcqLengthQualityOk(correct: string, distractors: string[]): boolean {
  return (
    mcqOptionSurfaceLeakFailure([correct, ...distractors], 0) == null
  )
}

function trimExplanationClause(s: string): string {
  return s
    .trim()
    .replace(/^[：:\s]+/, '')
    .replace(/[。；;]+$/g, '')
}

/**
 * 打乱后按题面序号拼完整解析：先点明主旨位置，再逐项 选项1～4。
 */
export function composeReadingExplanationForDisplay(input: {
  parts: ReadingExplanationParts
  options: string[]
  correctIndex: number
  correct: string
  distractors: string[]
}): string | null {
  const { parts, options, correctIndex, correct, distractors } = input
  if (options.length !== 4 || correctIndex < 0 || correctIndex > 3) return null
  if (parts.distractorNotes.length !== 3) return null
  const focus = trimExplanationClause(parts.focus)
  const correctNote = trimExplanationClause(parts.correctNote)
  if (!focus || !correctNote) return null

  const noteByOptionText = new Map<string, string>()
  noteByOptionText.set(normalizeMcqOptionText(correct), correctNote)
  for (let i = 0; i < 3; i++) {
    const d = distractors[i]!
    const note = trimExplanationClause(parts.distractorNotes[i] ?? '')
    if (!note) return null
    noteByOptionText.set(normalizeMcqOptionText(d), note)
  }

  const lines: string[] = []
  lines.push(`主旨依据：${focus}。`)
  for (let i = 0; i < 4; i++) {
    const opt = options[i]!
    const note = noteByOptionText.get(normalizeMcqOptionText(opt))
    if (!note) return null
    const verdict = i === correctIndex ? '正确' : '错误'
    lines.push(`选项${i + 1}${verdict}：${note}。`)
  }
  const text = lines.join('')
  return readingExplanationQualityOk(text) ? text : null
}

/**
 * 把旧式「正确项/干扰项A/B/C」映射到打乱后的「选项1～4」。
 * 无法可靠映射时返回 null。
 */
export function remapReadingExplanationLettersToOptionNumbers(input: {
  explanation: string
  correct: string
  distractors: string[]
  options: string[]
  correctIndex: number
}): string | null {
  let e = input.explanation.trim()
  if (!e) return null
  // 去掉明显残缺尾巴（如「且字数比正确项…」）
  e = e.replace(/[，、；]?\s*且字数比[^。！？]*$/u, '')
  e = e.replace(/[，、；：…]+$/u, '')

  const idxOf = (text: string): number =>
    input.options.findIndex((o) => normalizeMcqOptionText(o) === normalizeMcqOptionText(text))

  const correctOpt = input.correctIndex + 1
  const dIdx = input.distractors.map((d) => idxOf(d) + 1)
  if (dIdx.some((n) => n <= 0)) return null

  e = e
    .replace(/正确项(?![0-9])/g, `选项${correctOpt}`)
    .replace(/正确选项(?![0-9])/g, `选项${correctOpt}`)
    .replace(/干扰项\s*A|干扰\s*A|选项\s*A/gi, `选项${dIdx[0]}`)
    .replace(/干扰项\s*B|干扰\s*B|选项\s*B/gi, `选项${dIdx[1]}`)
    .replace(/干扰项\s*C|干扰\s*C|选项\s*C/gi, `选项${dIdx[2]}`)
    .replace(/(?<![选项第0-9])A项/g, `选项${dIdx[0]}`)
    .replace(/(?<![选项第0-9])B项/g, `选项${dIdx[1]}`)
    .replace(/(?<![选项第0-9])C项/g, `选项${dIdx[2]}`)

  if (!/[。！？]\s*$/.test(e)) e = `${e}。`
  return readingExplanationQualityOk(e) ? e : null
}

/** 解析须完整通顺，且用选项序号而非 A/B/C */
export function readingExplanationQualityOk(explanation: string): boolean {
  const e = explanation.trim()
  if (e.length < 36) return false
  if (/干扰项\s*[ABC]|选项\s*[ABCD](?![0-9])|(?<![选项第0-9])[ABC]项/i.test(e)) return false
  if (/[、，；：…]\s*$/.test(e)) return false
  if (!/[。！？]\s*$/.test(e)) return false
  // 结构化解析须覆盖选项1～4；旧文本至少覆盖多数序号
  const hits = [1, 2, 3, 4].filter((n) => e.includes(`选项${n}`) || e.includes(`第${n}项`)).length
  if (e.includes('主旨依据') && hits < 4) return false
  if (!e.includes('主旨依据') && hits < 3) return false
  return true
}

function extractReadingExplanationParts(o: Record<string, unknown>): ReadingExplanationParts | null {
  const focus = String(
    o.explanationFocus ?? o.focus ?? o.mainIdeaLoc ?? o.passageFocus ?? '',
  ).trim()
  const correctNote = String(
    o.explanationCorrect ?? o.correctExplanation ?? o.correctNote ?? '',
  ).trim()
  let distractorNotes: string[] = []
  const rawNotes = o.explanationDistractors ?? o.distractorExplanations ?? o.wrongNotes
  if (Array.isArray(rawNotes)) {
    distractorNotes = rawNotes.map((x) => String(x ?? '').trim()).filter(Boolean)
  }
  if (focus && correctNote && distractorNotes.length === 3) {
    return { focus, correctNote, distractorNotes }
  }
  return null
}

function escapeReadingHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 把 AI 给出的关键句对齐到材料原文子串（允许空白差异）。
 * 对不上则返回 undefined，题目仍可作答，只是不高亮。
 */
export function resolveReadingKeySentence(
  passage: string,
  raw: string | undefined | null,
): string | undefined {
  const text = String(passage ?? '')
  const key = String(raw ?? '').trim()
  if (!text || !key || key.length < 4) return undefined
  if (text.includes(key)) return key

  const compact = (s: string) => s.replace(/\s+/g, '')
  const tn = compact(text)
  const kn = compact(key)
  if (!kn || kn.length < 4) return undefined
  const ti = tn.indexOf(kn)
  if (ti < 0) return undefined

  let i = 0
  let j = 0
  while (j < ti && i < text.length) {
    if (!/\s/.test(text[i]!)) j++
    i++
  }
  const start = i
  let need = kn.length
  let end = start
  while (need > 0 && end < text.length) {
    if (!/\s/.test(text[end]!)) need--
    end++
  }
  const sliced = text.slice(start, end).trim()
  return sliced.length >= 4 ? sliced : undefined
}

/**
 * 材料 HTML：提交/回顾时可高亮支撑正确选项的关键句。
 */
export function renderReadingPassageHtml(
  passage: string,
  keySentence: string | undefined,
  highlight: boolean,
): string {
  const text = String(passage ?? '')
  if (!text) return ''
  if (!highlight) return escapeReadingHtml(text)
  const key = resolveReadingKeySentence(text, keySentence)
  if (!key) return escapeReadingHtml(text)
  const idx = text.indexOf(key)
  if (idx < 0) return escapeReadingHtml(text)
  return (
    escapeReadingHtml(text.slice(0, idx)) +
    `<mark class="reading-key-sentence">${escapeReadingHtml(key)}</mark>` +
    escapeReadingHtml(text.slice(idx + key.length))
  )
}

export function buildReadingComprehensionQuestionFromMcq(input: {
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  explanationParts?: ReadingExplanationParts | null
  keySentence?: string
  seq: number
}): ReadingComprehensionQuestion | null {
  const term = input.term.trim()
  const passage = input.passage.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !passage || !stem || !correct || distractors.length !== 3) return null
  if (!readingMcqLengthQualityOk(correct, distractors)) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled

  let explanation = ''
  if (input.explanationParts) {
    explanation =
      composeReadingExplanationForDisplay({
        parts: input.explanationParts,
        options,
        correctIndex,
        correct,
        distractors,
      }) ?? ''
  }
  if (!explanation && input.explanation?.trim()) {
    const raw = input.explanation.trim()
    // 已写死「选项1～4」但未随打乱重排 → 不可信，拒收
    const hasFixedNumbers = /选项\s*[1-4]|第[1-4]项/.test(raw)
    const hasLetters = /正确项|干扰项\s*[ABC]|干扰\s*[ABC]|(?<![选项第0-9])[ABC]项/i.test(raw)
    if (!(hasFixedNumbers && !hasLetters)) {
      explanation =
        remapReadingExplanationLettersToOptionNumbers({
          explanation: raw,
          correct,
          distractors,
          options,
          correctIndex,
        }) ?? ''
    }
  }
  if (!explanation || !readingExplanationQualityOk(explanation)) return null

  const keySentence = resolveReadingKeySentence(passage, input.keySentence)

  const fingerprint = getReadingComprehensionQuestionFingerprint({
    questionType: input.questionType,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const q: ReadingComprehensionQuestion = {
    id: `reading-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    passage,
    stem,
    options,
    correctIndex,
    explanation,
    fingerprint,
    ...(keySentence ? { keySentence } : {}),
  }
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

export function readingComprehensionPayloadToQuestion(
  payload: Omit<ReadingComprehensionQuestion, 'id'>,
  seq: number,
): ReadingComprehensionQuestion {
  return {
    id: `reading-key-${seq}-${payload.fingerprint.slice(0, 12)}`,
    ...payload,
    options: [...payload.options],
  }
}

export function parseReadingComprehensionMcqAiObject(item: unknown): {
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  explanationParts: ReadingExplanationParts | null
  keySentence: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  const questionType: ChineseReadingQuestionType | null =
    typeRaw === 'main-idea' ||
    typeRaw === 'detail' ||
    typeRaw === 'word-sentence' ||
    typeRaw === 'infer-next' ||
    typeRaw === 'title'
      ? typeRaw
      : typeRaw === '主旨观点'
        ? 'main-idea'
        : typeRaw === '细节判断'
          ? 'detail'
          : typeRaw === '词句理解'
            ? 'word-sentence'
            : typeRaw === '推断下文'
              ? 'infer-next'
              : typeRaw === '标题添加'
                ? 'title'
                : null
  if (!questionType) return null
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim()
  const passage = String(o.passage ?? o.material ?? o.text ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const { correct, distractors } = picked
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  const explanationParts = extractReadingExplanationParts(o)
  const keySentence = String(
    o.keySentence ?? o.keySentences ?? o.evidenceSentence ?? o.supportSentence ?? o.原文关键句 ?? '',
  ).trim()
  if (!term || !passage || !stem) return null
  // 结构化解析优先；若无结构则至少要有可重写的 explanation 文本
  if (!explanationParts && !explanation) return null
  return {
    questionType,
    term,
    passage,
    stem,
    correct,
    distractors,
    explanation,
    explanationParts,
    keySentence,
  }
}
