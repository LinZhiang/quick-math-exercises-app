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

export function buildReadingComprehensionQuestionFromMcq(input: {
  questionType: ChineseReadingQuestionType
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): ReadingComprehensionQuestion | null {
  const term = input.term.trim()
  const passage = input.passage.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !passage || !stem || !correct || distractors.length !== 3) return null
  const all = [correct, ...distractors]
  if (new Set(all).size !== 4) return null
  const options = shuffleInPlace([...all])
  const correctIndex = options.indexOf(correct)
  if (correctIndex < 0) return null
  const fingerprint = getReadingComprehensionQuestionFingerprint({
    questionType: input.questionType,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `reading-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    passage,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
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
  const correct = String(o.correct ?? o.answer ?? '').trim()
  const distractors = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !passage || !stem || !correct || distractors.length !== 3) return null
  return {
    questionType,
    term,
    passage,
    stem,
    correct,
    distractors,
    explanation,
  }
}
