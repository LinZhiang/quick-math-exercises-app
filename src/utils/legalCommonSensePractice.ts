export type ChineseLegalCommonSenseQuestionType = 'general'

export const LEGAL_COMMON_SENSE_QUESTION_COUNT = 15

export type LegalCommonSenseQuestion = {
  id: string
  questionType: ChineseLegalCommonSenseQuestionType
  /** 知识点，如「公民基本权利」「行政处罚」「正当防卫」 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function legalCommonSenseQuestionTypeLabel(
  _type: ChineseLegalCommonSenseQuestionType,
): string {
  return '法律常识'
}

export function getLegalCommonSenseQuestionFingerprint(input: {
  questionType: ChineseLegalCommonSenseQuestionType
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

export function buildLegalCommonSenseQuestionFromMcq(input: {
  questionType: ChineseLegalCommonSenseQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): LegalCommonSenseQuestion | null {
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
  const fingerprint = getLegalCommonSenseQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `legal-sense-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
}

export function parseLegalCommonSenseMcqAiObject(item: unknown): {
  questionType: ChineseLegalCommonSenseQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  const correct = String(o.correct ?? o.answer ?? '').trim()
  const distractors = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem || !correct || distractors.length !== 3) return null
  return {
    questionType: 'general',
    term,
    stem,
    correct,
    distractors,
    explanation,
  }
}
