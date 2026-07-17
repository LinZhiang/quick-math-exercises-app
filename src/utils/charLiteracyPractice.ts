import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import { typoMcqQualityFailure } from '@/utils/chineseVariantQuality'

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
 * 选项里若带「（误）」、引号点错、×、自我纠正话术等，会一眼露馅或不成题，必须丢弃。
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

  // 模型把思考/自我纠正写进选项：如「虚与委蛇 (yí) ？不，虚与委蛇 (shé)」
  if (/[？?]/.test(t)) return true
  if (/[！!]/.test(t)) return true
  if (/(?:不对|不是|不应|应为|应该是|更正|改成|或者说|等等|抱歉|其实|等等吧)/.test(t)) {
    return true
  }
  if (/[，,；;：:].{0,6}(?:不|是|应|对)/.test(t)) return true
  // 同一选项出现两个及以上拼音注音 → 多半改来改去
  const pyGroups = t.match(
    /[（(][a-züāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜńňǹ\s\-]+[）)]/gi,
  )
  if (pyGroups && pyGroups.length >= 2) return true
  // 选项过长（正常读音/词语选项很短）
  if (t.replace(/\s+/g, '').length > 28) return true

  return false
}

/** 读音题：四选项须同形、干净，禁止「半对半改」式垃圾项 */
export function pronunciationMcqQualityFailure(input: {
  correct: string
  distractors: string[]
}): string | null {
  const options = [input.correct, ...input.distractors].map((s) => s.trim())
  if (options.length !== 4) return '结构不完整'
  if (options.some(optionHasObviousErrorMark)) return '选项含露馅/自我纠正标记'

  const stripPy = (s: string) =>
    s.replace(/[（(][^）)]*[）)]/g, '').replace(/\s+/g, '').trim()

  const bases = options.map(stripPy)
  if (bases.some((b) => !b)) return '读音题选项缺少词语正文'

  // 同词多音辨析：四项去拼音后应完全相同（只改注音）
  const allSameBase = bases.every((b) => b === bases[0])
  // 「下列读音全部正确」类：也可能是不同短语；此时每项仍须短且各仅一处注音
  if (allSameBase) {
    const withPy = options.filter((o) => /[（(][a-züāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/i.test(o))
    if (withPy.length !== 4) return '同词读音题：四选项均须带拼音注音'
  }

  // 任意两项去空白后完全相同 → 废题
  const norm = options.map((o) => o.replace(/\s+/g, ''))
  if (new Set(norm).size !== 4) return '选项重复'

  return null
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
  if (questionType === 'typo') {
    const fail = typoMcqQualityFailure({
      stem,
      term,
      correct,
      distractors,
      explanation,
    })
    if (fail) return null
  }
  if (questionType === 'pronunciation') {
    const fail = pronunciationMcqQualityFailure({ correct, distractors })
    if (fail) return null
  }
  return { questionType, term, stem, correct, distractors, explanation }
}
