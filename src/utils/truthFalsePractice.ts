/**
 * 逻辑推理 · 真假推理
 * 真假推理（真假话、矛盾对当与假设排除）四选一；由网页 AI 出题，本地只做结构校验。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableLogicReasonMcq,
} from '@/utils/chineseMcqAiFields'

export type TruthFalseDifficulty = 'easy' | 'medium' | 'hard'

export const TRUTH_FALSE_QUESTION_COUNT = 5

export const TRUTH_FALSE_MODES: {
  id: TruthFalseDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '真假推理 · 简单题',
    desc: '每轮 5 题 · 步骤少、直言为主（人数/真假数不限死）· AI 出题 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '真假推理 · 普通题',
    desc: '每轮 5 题 · 矛盾对当、中等推理量 · AI 出题 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '真假推理 · 困难题',
    desc: '每轮 5 题 · 假言混杂、多步排除 · AI 出题 · 正计时停表看答案',
  },
]

export type TruthFalseQuestion = {
  id: string
  difficulty: TruthFalseDifficulty
  /** 材料主题短标签，用于去重与结果列表 */
  term: string
  /** 题干材料（含逻辑语句）；可为空则只看 stem */
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  /** 一句话做法，如「矛盾对当」「假设找唯一真假」 */
  method: string
  explanation: string
  fingerprint: string
}

export function truthFalseDifficultyLabel(d: TruthFalseDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

export function truthFalseTopicLabel(): string {
  return '真假推理'
}

export function getTruthFalseQuestionFingerprint(input: {
  difficulty: TruthFalseDifficulty
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

export function buildTruthFalseQuestionFromMcq(input: {
  difficulty: TruthFalseDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  method?: string
  explanation?: string
  seq: number
}): TruthFalseQuestion | null {
  const term = input.term.trim()
  const passage = (input.passage ?? '').trim()
  const stem = input.stem.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getTruthFalseQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const q: TruthFalseQuestion = {
    id: `logic-reason-truth-false-${input.difficulty}-${input.seq}-${Date.now()}`,
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

export function parseTruthFalseMcqAiObject(item: unknown): {
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
