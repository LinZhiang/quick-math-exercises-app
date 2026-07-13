export type ChinesePartyHistoryQuestionType = 'general'

export const PARTY_HISTORY_QUESTION_COUNT = 15

export type PartyHistoryQuestion = {
  id: string
  questionType: ChinesePartyHistoryQuestionType
  /** 知识点，如「遵义会议」「十一届三中全会」 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function partyHistoryQuestionTypeLabel(_type: ChinesePartyHistoryQuestionType): string {
  return '中共党史'
}

export function getPartyHistoryQuestionFingerprint(input: {
  questionType: ChinesePartyHistoryQuestionType
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

export function buildPartyHistoryQuestionFromMcq(input: {
  questionType: ChinesePartyHistoryQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): PartyHistoryQuestion | null {
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
  const fingerprint = getPartyHistoryQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  return {
    id: `party-hist-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
}

export function parsePartyHistoryMcqAiObject(item: unknown): {
  questionType: ChinesePartyHistoryQuestionType
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
