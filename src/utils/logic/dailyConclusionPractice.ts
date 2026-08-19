/**
 * 逻辑推理 · 日常结论
 * 日常/科普材料的必然推出；由网页 AI 出题，本地只做结构校验。仅简单/困难两档。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableLogicReasonMcq,
} from '@/utils/chinese/chineseMcqAiFields'

export type DailyConclusionDifficulty = 'easy' | 'hard'

export const DAILY_CONCLUSION_QUESTION_COUNT = 5

export const DAILY_CONCLUSION_MODES: {
  id: DailyConclusionDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '日常结论 · 简单题',
    desc: '每轮 5 题 · 短材料、直接可推 · AI 出题 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '日常结论 · 困难题',
    desc: '每轮 5 题 · 科普表述、易过度推断 · AI 出题 · 正计时停表看答案',
  },
]

export type DailyConclusionQuestion = {
  id: string
  difficulty: DailyConclusionDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
}

export function dailyConclusionDifficultyLabel(d: DailyConclusionDifficulty): string {
  if (d === 'easy') return '简单'
  return '困难'
}

export function dailyConclusionTopicLabel(): string {
  return '日常结论'
}

export function getDailyConclusionQuestionFingerprint(input: {
  difficulty: DailyConclusionDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  const opts = [...input.options].sort().join('\u001f')
  return [
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    opts,
    String(input.correctIndex),
  ].join('\u001e')
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export function buildDailyConclusionQuestionFromMcq(input: {
  difficulty: DailyConclusionDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  method?: string
  explanation?: string
  seq: number
}): DailyConclusionQuestion | null {
  const term = input.term.trim()
  const passage = (input.passage ?? '').trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getDailyConclusionQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const q: DailyConclusionQuestion = {
    id: `logic-reason-daily-conclusion-${input.difficulty}-${input.seq}-${Date.now()}`,
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
    method: (input.method ?? '').trim(),
    explanation: (input.explanation ?? '').trim(),
    fingerprint,
  }
  if (!isPlayableLogicReasonMcq(q)) return null
  return q
}

export function parseDailyConclusionMcqAiObject(item: unknown): {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim()
  const passage = String(o.passage ?? o.material ?? o.context ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const { correct, distractors } = picked
  const method = String(o.method ?? o.approach ?? '').trim()
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem) return null
  return { term, passage, stem, correct, distractors, method, explanation }
}
