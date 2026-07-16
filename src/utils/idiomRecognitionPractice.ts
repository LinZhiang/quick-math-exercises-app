import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import {
  coerceVocabQuestionType,
  explanationImpliesNonUniqueAnswer,
  stemHasFillBlank,
} from '@/utils/chineseVariantQuality'

export type ChineseIdiomQuestionType = 'word-to-meaning' | 'meaning-to-word'

export const IDIOM_RECOGNITION_QUESTION_COUNT = 15

export type IdiomRecognitionQuestion = {
  id: string
  questionType: ChineseIdiomQuestionType
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function idiomQuestionTypeLabel(type: ChineseIdiomQuestionType): string {
  return type === 'word-to-meaning' ? '选释义' : '选词语'
}

/** 选词语题：题干/展示文案不得包含正确答案 */
export function idiomStemLeaksTerm(stem: string, term: string): boolean {
  const t = term.trim()
  if (!t) return false
  const normalizedStem = stem.replace(/\s+/g, '')
  const normalizedTerm = t.replace(/\s+/g, '')
  return normalizedStem.includes(normalizedTerm)
}

export function buildIdiomDisplayStem(q: IdiomRecognitionQuestion): string {
  if (q.questionType === 'word-to-meaning') return q.stem
  // 选词语：仅展示释义/问句，不重复 term
  return q.stem
}

export function shouldShowIdiomTermBeforeSubmit(q: IdiomRecognitionQuestion): boolean {
  if (q.questionType !== 'word-to-meaning') return false
  // 填空/选词语形态，或选项里已含 term：展示 term 会直接泄题
  if (stemHasFillBlank(q.stem)) return false
  if (q.options.some((o) => o.trim() === q.term.trim())) return false
  return true
}

export function getIdiomQuestionFingerprint(input: {
  questionType: ChineseIdiomQuestionType
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

export function buildIdiomQuestionFromMcq(input: {
  questionType: ChineseIdiomQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): IdiomRecognitionQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getIdiomQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  const q: IdiomRecognitionQuestion = {
    id: `idiom-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

export function idiomPayloadToQuestion(
  payload: Omit<IdiomRecognitionQuestion, 'id'>,
  seq: number,
): IdiomRecognitionQuestion {
  return {
    id: `idiom-key-${seq}-${payload.fingerprint.slice(0, 12)}`,
    ...payload,
    options: [...payload.options],
  }
}

export function parseIdiomMcqAiObject(item: unknown): {
  questionType: ChineseIdiomQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const typeRaw = String(o.questionType ?? o.type ?? '').trim()
  let questionType: ChineseIdiomQuestionType | null =
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
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const { correct, distractors } = picked
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem) return null

  const coerced = coerceVocabQuestionType({
    questionType,
    term,
    stem,
    correct,
    distractors,
  })
  if (!coerced) return null
  questionType = coerced

  if (questionType === 'meaning-to-word' && idiomStemLeaksTerm(stem, term)) return null
  if (questionType === 'meaning-to-word' && distractors.some((d) => d === term)) return null
  if (questionType === 'meaning-to-word' && correct !== term) return null
  // 选释义：选项不得是目标成语本身
  if (questionType === 'word-to-meaning' && [correct, ...distractors].some((x) => x === term)) {
    return null
  }
  if (explanationImpliesNonUniqueAnswer(explanation, [correct, ...distractors])) return null
  return { questionType, term, stem, correct, distractors, explanation }
}
