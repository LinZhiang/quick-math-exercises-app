/**
 * 逻辑推理 · 评价推理
 * 评价推理（论证评价、谬误识别与观点评析）四选一；由网页 AI 出题，本地只做结构校验。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type EvalReasonDifficulty = 'easy' | 'medium' | 'hard'

export const EVAL_REASON_QUESTION_COUNT = 5

export const EVAL_REASON_MODES: {
  id: EvalReasonDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '评价推理 · 简单题',
    desc: '每轮 5 题 · 单一明显谬误/评价点 · AI 出题 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '评价推理 · 普通题',
    desc: '每轮 5 题 · 论证易受批评的原因（样本/人身等）· AI 出题 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '评价推理 · 困难题',
    desc: '每轮 5 题 · 多要点组合评价某方观点 · AI 出题 · 正计时停表看答案',
  },
]

export type EvalReasonQuestion = {
  id: string
  difficulty: EvalReasonDifficulty
  /** 材料主题短标签，用于去重与结果列表 */
  term: string
  /** 题干材料（含逻辑语句）；可为空则只看 stem */
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  /** 一句话做法，如「样本不当」「诉诸情感」「结论绝对」 */
  method: string
  explanation: string
  fingerprint: string
}

export function evalReasonDifficultyLabel(d: EvalReasonDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

export function evalReasonTopicLabel(): string {
  return '评价推理'
}

export function getEvalReasonQuestionFingerprint(input: {
  difficulty: EvalReasonDifficulty
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

export function buildEvalReasonQuestionFromMcq(input: {
  difficulty: EvalReasonDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  method?: string
  explanation?: string
  seq: number
}): EvalReasonQuestion | null {
  const term = input.term.trim()
  const passage = (input.passage ?? '').trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getEvalReasonQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const q: EvalReasonQuestion = {
    id: `logic-reason-eval-reason-${input.difficulty}-${input.seq}-${Date.now()}`,
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
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

export function parseEvalReasonMcqAiObject(item: unknown): {
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
