export type ChinesePoetryQuestionType = 'poem-to-author' | 'poem-to-theme'

export const POETRY_RECOGNITION_QUESTION_COUNT = 15

export type PoetryRecognitionQuestion = {
  id: string
  questionType: ChinesePoetryQuestionType
  /** 诗题或名句标识（元数据） */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function poetryQuestionTypeLabel(type: ChinesePoetryQuestionType): string {
  return type === 'poem-to-author' ? '选作者' : '选描写'
}

export function poetryStemLeaksAnswer(stem: string, answer: string): boolean {
  const a = answer.trim()
  if (!a || a.length < 2) return false
  const normalizedStem = stem.replace(/\s+/g, '')
  const normalizedAnswer = a.replace(/\s+/g, '')
  return normalizedStem.includes(normalizedAnswer)
}

export function shouldShowPoetryTermBeforeSubmit(_q: PoetryRecognitionQuestion): boolean {
  return true
}

export function getPoetryQuestionFingerprint(input: {
  questionType: ChinesePoetryQuestionType
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

export function buildPoetryQuestionFromMcq(input: {
  questionType: ChinesePoetryQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): PoetryRecognitionQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const all = [correct, ...distractors]
  if (new Set(all).size !== 4) return null
  if (poetryStemLeaksAnswer(stem, correct)) return null
  const options = shuffleInPlace([...all])
  const correctIndex = options.indexOf(correct)
  if (correctIndex < 0) return null
  const fingerprint = getPoetryQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `poetry-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
}

export function parsePoetryMcqAiObject(item: unknown): {
  questionType: ChinesePoetryQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  const questionType: ChinesePoetryQuestionType | null =
    typeRaw === 'poem-to-author' || typeRaw === 'poem-to-theme'
      ? typeRaw
      : typeRaw === '选作者' || typeRaw === '作者'
        ? 'poem-to-author'
        : typeRaw === '选描写' || typeRaw === '意境' || typeRaw === '描写'
          ? 'poem-to-theme'
          : null
  if (!questionType) return null
  const term = String(o.term ?? o.poem ?? o.title ?? '').trim()
  const stem = String(o.stem ?? o.question ?? o.lines ?? '').trim()
  const correct = String(o.correct ?? o.answer ?? '').trim()
  const distractors = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem || !correct || distractors.length !== 3) return null
  if (poetryStemLeaksAnswer(stem, correct)) return null
  if (distractors.some((d) => d === correct)) return null
  return { questionType, term, stem, correct, distractors, explanation }
}
