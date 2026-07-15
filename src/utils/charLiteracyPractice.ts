import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

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

/**
 * 选项里若带「（误）」、引号点错、× 等标记，会一眼暴露对错，必须丢弃。
 * 合法读音括号如（kù）保留。
 */
export function optionHasObviousErrorMark(text: string): boolean {
  const t = text.trim()
  if (!t) return true
  if (/[（(【［〔]\s*误\s*[）)】］〕]/.test(t)) return true
  if (/(?:误读|错读|错误项|有误项|不正确)/.test(t)) return true
  if (/(?:^|[^\u4e00-\u9fff])(?:错误|有误)(?:$|[^\u4e00-\u9fff])/.test(t)) return true
  if (/[×✗✘╳✖]|❌/.test(t)) return true
  // ASCII / 弯引号包住短片段：一'愁'莫展、"愁"（点出错字）
  if (/[''`´].{1,6}[''`´]/.test(t)) return true
  if (/[“”].{1,4}[“”]/.test(t)) return true
  // 单字书名号点错：一「愁」莫展
  if (/[「『].{1}[」』]/.test(t)) return true
  return false
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
  if ([correct, ...distractors].some(optionHasObviousErrorMark)) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getCharLiteracyQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  const q: CharLiteracyQuestion = {
    id: `char-lit-${input.seq}-${Date.now()}`,
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
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const { correct, distractors } = picked
  const explanation = String(o.explanation ?? o.analysis ?? '').trim()
  if (!term || !stem) return null
  if ([correct, ...distractors].some(optionHasObviousErrorMark)) return null
  return { questionType, term, stem, correct, distractors, explanation }
}
