/** 考察四字成语以外的词语（实词、虚词、关联词、近义辨析等） */

export type ChineseWordMemorizationQuestionType = 'word-to-meaning' | 'meaning-to-word'

export const WORD_MEMORIZATION_QUESTION_COUNT = 15

export type WordMemorizationQuestion = {
  id: string
  questionType: ChineseWordMemorizationQuestionType
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function wordMemorizationQuestionTypeLabel(
  type: ChineseWordMemorizationQuestionType,
): string {
  return type === 'word-to-meaning' ? '选释义' : '选词语'
}

/** 选词语题：题干/展示文案不得包含正确答案 */
export function wordMemorizationStemLeaksTerm(stem: string, term: string): boolean {
  const t = term.trim()
  if (!t) return false
  const normalizedStem = stem.replace(/\s+/g, '')
  const normalizedTerm = t.replace(/\s+/g, '')
  return normalizedStem.includes(normalizedTerm)
}

export function buildWordMemorizationDisplayStem(q: WordMemorizationQuestion): string {
  if (q.questionType === 'word-to-meaning') return q.stem
  // 选词语：仅展示释义/问句，不重复 term
  return q.stem
}

export function shouldShowWordMemorizationTermBeforeSubmit(q: WordMemorizationQuestion): boolean {
  return q.questionType === 'word-to-meaning'
}

export function getWordMemorizationQuestionFingerprint(input: {
  questionType: ChineseWordMemorizationQuestionType
  term: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  const opts = [...input.options].sort().join('\u001f')
  return `${input.questionType}\u001e${input.term.trim()}\u001e${input.stem.trim()}\u001e${opts}\u001e${input.correctIndex}`
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function buildWordMemorizationQuestionFromMcq(input: {
  questionType: ChineseWordMemorizationQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): WordMemorizationQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const all = [correct, ...distractors]
  if (new Set(all).size !== 4) return null
  const options = shuffleInPlace([...all])
  const correctIndex = options.indexOf(correct)
  if (correctIndex < 0) return null
  const fingerprint = getWordMemorizationQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `word-mem-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
}

export function wordMemorizationPayloadToQuestion(
  payload: Omit<WordMemorizationQuestion, 'id'>,
  seq: number,
): WordMemorizationQuestion {
  return {
    id: `word-mem-key-${seq}-${payload.fingerprint.slice(0, 12)}`,
    ...payload,
    options: [...payload.options],
  }
}

export function parseWordMemorizationMcqAiObject(item: unknown): {
  questionType: ChineseWordMemorizationQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  const questionType: ChineseWordMemorizationQuestionType | null =
    typeRaw === 'word-to-meaning' || typeRaw === 'meaning-to-word'
      ? typeRaw
      : typeRaw === '选释义'
        ? 'word-to-meaning'
        : typeRaw === '选词语'
          ? 'meaning-to-word'
          : null
  if (!questionType) return null
  const term = String(o.term ?? o.word ?? o.idiom ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  const correctArr = Array.isArray(o.correct)
    ? o.correct.map((x) => String(x).trim()).filter(Boolean)
    : [String(o.correct ?? o.answer ?? '').trim()].filter(Boolean)
  const correct = correctArr[0] ?? ''
  const distractors = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem || !correct || distractors.length !== 3) return null
  if (questionType === 'meaning-to-word' && wordMemorizationStemLeaksTerm(stem, term)) return null
  if (questionType === 'meaning-to-word' && distractors.some((d) => d === term)) return null
  if (questionType === 'meaning-to-word' && correct !== term) return null
  return { questionType, term, stem, correct, distractors, explanation }
}
