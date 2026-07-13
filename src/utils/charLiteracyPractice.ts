export type ChineseCharLiteracyQuestionType = 'pronunciation' | 'typo'

export const CHAR_LITERACY_QUESTION_COUNT = 15

export type CharLiteracyQuestion = {
  id: string
  questionType: ChineseCharLiteracyQuestionType
  /** 考点关键词，如「纨绔」「暴殄天物」「一筹莫展」 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function charLiteracyQuestionTypeLabel(type: ChineseCharLiteracyQuestionType): string {
  return type === 'pronunciation' ? '读音辨析' : '错别字'
}

export function getCharLiteracyQuestionFingerprint(input: {
  questionType: ChineseCharLiteracyQuestionType
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

export function buildCharLiteracyQuestionFromMcq(input: {
  questionType: ChineseCharLiteracyQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): CharLiteracyQuestion | null {
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
  const fingerprint = getCharLiteracyQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `char-lit-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
}

export function parseCharLiteracyMcqAiObject(item: unknown): {
  questionType: ChineseCharLiteracyQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  const questionType: ChineseCharLiteracyQuestionType | null =
    typeRaw === 'pronunciation' || typeRaw === 'typo'
      ? typeRaw
      : typeRaw === '读音' || typeRaw === '读音辨析'
        ? 'pronunciation'
        : typeRaw === '错别字' || typeRaw === '字形'
          ? 'typo'
          : null
  if (!questionType) return null
  const term = String(o.term ?? o.word ?? o.keyword ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  const correct = String(o.correct ?? o.answer ?? '').trim()
  const distractors = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem || !correct || distractors.length !== 3) return null
  return { questionType, term, stem, correct, distractors, explanation }
}
