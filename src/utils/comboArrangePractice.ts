/**
 * 逻辑推理 · 组合排列
 * 组合排列（排序、匹配、条件推理）四选一；由网页 AI 出题，本地只做结构校验。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type ComboArrangeDifficulty = 'easy' | 'medium' | 'hard'

export const COMBO_ARRANGE_QUESTION_COUNT = 5

export const COMBO_ARRANGE_MODES: {
  id: ComboArrangeDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '组合排列 · 简单题',
    desc: '每轮 5 题 · 元素少、条件更少的排序/匹配 · AI 出题 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '组合排列 · 普通题',
    desc: '每轮 5 题 · 多人预测对一半 / 中等条件排序 · AI 出题 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '组合排列 · 困难题',
    desc: '每轮 5 题 · 多条件匹配分配（含假言/否定） · AI 出题 · 正计时停表看答案',
  },
]

export type ComboArrangeQuestion = {
  id: string
  difficulty: ComboArrangeDifficulty
  /** 材料主题短标签，用于去重与结果列表 */
  term: string
  /** 题干材料（含逻辑语句）；可为空则只看 stem */
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  /** 一句话做法，如「半真半假排除」「条件匹配」 */
  method: string
  explanation: string
  fingerprint: string
}

export function comboArrangeDifficultyLabel(d: ComboArrangeDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

export function comboArrangeTopicLabel(): string {
  return '组合排列'
}

export function getComboArrangeQuestionFingerprint(input: {
  difficulty: ComboArrangeDifficulty
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

export function buildComboArrangeQuestionFromMcq(input: {
  difficulty: ComboArrangeDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  method?: string
  explanation?: string
  seq: number
}): ComboArrangeQuestion | null {
  const term = input.term.trim()
  const passage = (input.passage ?? '').trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getComboArrangeQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const q: ComboArrangeQuestion = {
    id: `logic-reason-combo-arrange-${input.difficulty}-${input.seq}-${Date.now()}`,
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

export function parseComboArrangeMcqAiObject(item: unknown): {
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
