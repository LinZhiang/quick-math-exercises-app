import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type ChineseTheoryPolicyQuestionType = 'general'

export const THEORY_POLICY_QUESTION_COUNT = 15

export type TheoryPolicyQuestion = {
  id: string
  questionType: ChineseTheoryPolicyQuestionType
  /** 知识点，如「中国式现代化」「进一步全面深化改革」「两步走战略」 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function theoryPolicyQuestionTypeLabel(
  _type: ChineseTheoryPolicyQuestionType,
): string {
  return '理论政策'
}

export function getTheoryPolicyQuestionFingerprint(input: {
  questionType: ChineseTheoryPolicyQuestionType
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

export function buildTheoryPolicyQuestionFromMcq(input: {
  questionType: ChineseTheoryPolicyQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): TheoryPolicyQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getTheoryPolicyQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  const q: TheoryPolicyQuestion = {
    id: `theory-policy-${input.seq}-${Date.now()}`,
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

export function parseTheoryPolicyMcqAiObject(item: unknown): {
  questionType: ChineseTheoryPolicyQuestionType
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
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const { correct, distractors } = picked
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem) return null
  return {
    questionType: 'general',
    term,
    stem,
    correct,
    distractors,
    explanation,
  }
}
