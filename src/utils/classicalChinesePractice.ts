import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type ChineseClassicalChineseQuestionType = 'general'

export const CLASSICAL_CHINESE_QUESTION_COUNT = 15

/** 《愚公移山》「以为神」所在连续原句（禁止与「以君之力…焉置土石」跨段拼接） */
export const YUGONG_YIWEI_SHEN_CONTINUOUS =
  '操蛇之神闻之，惧其不已也，告之于帝。帝感其诚，命夸娥氏二子负二山，一厝朔东，一厝雍南，众人以为神。'

const YIWEI_ANCIENT_MODERN_NOTE =
  '文言中「以为」是「以（之）为」的省略结构，古义为「把……当作」，今义是「认为」，属古今异义考点。'

export type ClassicalChineseQuestion = {
  id: string
  questionType: ChineseClassicalChineseQuestionType
  /** 知识点，如「古今异义」「通假字」「文言句式」 */
  term: string
  stem: string
  options: string[]
  correctIndex: number
  explanation: string
  fingerprint: string
}

export function classicalChineseQuestionTypeLabel(
  _type: ChineseClassicalChineseQuestionType,
): string {
  return '文言知识'
}

export function getClassicalChineseQuestionFingerprint(input: {
  questionType: ChineseClassicalChineseQuestionType
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

/**
 * 题干是否像「跨段拼接」：用省略号硬接两段不连续原文，或已知误拼组合。
 */
export function classicalStemLooksSpliced(stem: string): boolean {
  const s = stem.trim()
  if (!s) return true
  // 「前半……后半」式硬拼
  if (/「[^」]{3,}[…⋯]{1,6}[^」]{2,}」/.test(s)) return true
  // 两段引文用省略号拼接
  if (/「[^」]+」\s*[…⋯]{1,6}\s*「[^」]+」/.test(s)) return true
  // 《愚公移山》典型误拼：智叟质疑句 + 「以为神」
  if (/焉置土石|以君之力/.test(s) && /以为神/.test(s)) return true
  return false
}

/** 抽出题干中全部「……」引文 */
export function extractClassicalQuotedExcerpts(stem: string): string[] {
  const out: string[] = []
  const re = /「([^」]+)」/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stem)) !== null) {
    const t = (m[1] ?? '').trim()
    if (t) out.push(t)
  }
  return out
}

export function classicalExcerptCjkLen(s: string): number {
  return (s.match(/[\u4e00-\u9fff]/g) ?? []).length
}

/**
 * 引文是否过短、缺少语境（没看过原文难以揣测，如仅「信而见疑」）。
 * 合格参考：「信而见疑，忠而被谤」「臣诚恐见欺于王而负赵」
 */
export function classicalExcerptLacksContext(excerpt: string): boolean {
  const t = excerpt.trim()
  if (!t) return true
  const cjk = classicalExcerptCjkLen(t)
  if (cjk < 8) return true
  // 8～9 字且无句读，仍偏碎片
  if (cjk < 10 && !/[，、；。？！]/.test(t)) return true
  return false
}

/** 高频过短碎片 → 同篇连续稍完整句（仍属原文相邻语境） */
const CLASSICAL_SHORT_EXCERPT_EXPANSIONS: Record<string, string> = {
  信而见疑: '信而见疑，忠而被谤',
  忠而被谤: '信而见疑，忠而被谤',
  见疑: '信而见疑，忠而被谤',
  被谤: '信而见疑，忠而被谤',
}

/** 把过短引文扩成稍完整连续句；无法扩则原样返回 */
export function expandClassicalShortExcerpt(excerpt: string): string {
  const key = excerpt.replace(/\s+/g, '').trim()
  if (CLASSICAL_SHORT_EXCERPT_EXPANSIONS[key]) {
    return CLASSICAL_SHORT_EXCERPT_EXPANSIONS[key]!
  }
  // 引文整段恰好是已知短句
  for (const [short, full] of Object.entries(CLASSICAL_SHORT_EXCERPT_EXPANSIONS)) {
    if (key === short || key.includes(short) && classicalExcerptCjkLen(key) < 8) {
      return full
    }
  }
  return excerpt
}

export function expandClassicalShortExcerptsInStem(stem: string): string {
  return stem.replace(/「([^」]+)」/g, (_all, inner: string) => {
    const expanded = expandClassicalShortExcerpt(inner.trim())
    return `「${expanded}」`
  })
}

/** 题干中凡带文言引文的，须足够完整；无引文但 stem 本身像极短例句时也拦 */
export function classicalStemExcerptsLackContext(stem: string): boolean {
  const excerpts = extractClassicalQuotedExcerpts(stem)
  if (excerpts.length > 0) {
    return excerpts.some((e) => classicalExcerptLacksContext(e))
  }
  // 无书名号时：若整句里像「……中「x」」已处理；否则看是否夹了过短加点词语境
  // 形如：……「信而见疑」…… 已由上面覆盖
  return false
}

/** 解析中补上「以为」古今异义说明（已有则不重复） */
export function ensureYiWeiAncientModernNote(explanation: string): string {
  const e = explanation.trim()
  if (!e) return YIWEI_ANCIENT_MODERN_NOTE
  const base = /[。！？]$/.test(e) ? e : `${e}。`
  if (/以（之）为/.test(base) && (/把……当作|把\.\.\.当作|把…当作/.test(base) || /古义/.test(base))) {
    return base
  }
  if (base.includes(YIWEI_ANCIENT_MODERN_NOTE)) return base
  return `${base}${YIWEI_ANCIENT_MODERN_NOTE}`
}

/**
 * 修复/规范化题干与解析：
 * - 「以为神」题还原连续原句，去掉跨段拼接
 * - 过短引文尽量扩成稍完整连续句；仍过短则拒收
 * - 「以为」考点解析补古今异义说明
 */
export function normalizeClassicalChineseMcqFields(input: {
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
}): {
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
} | null {
  let stem = input.stem.trim()
  let explanation = input.explanation.trim()
  const term = input.term.trim()

  const touchesYiWeiShen =
    /以为神/.test(stem) || (/以为/.test(stem) && /愚公|夸娥|厝/.test(stem))
  const hasBadYugongSplice = /焉置土石|以君之力/.test(stem) && /以为神|以为/.test(stem)

  if (touchesYiWeiShen || hasBadYugongSplice) {
    // 用连续原句替换引文；若仍残留智叟句关键词则重写设问壳
    if (/「[^」]+」/.test(stem)) {
      stem = stem.replace(/「[^」]+」/g, `「${YUGONG_YIWEI_SHEN_CONTINUOUS}」`)
      if (/焉置土石|以君之力/.test(stem)) {
        stem = `下列加点「以为」的意义是？「${YUGONG_YIWEI_SHEN_CONTINUOUS}」`
      }
    } else if (hasBadYugongSplice || classicalStemLooksSpliced(stem)) {
      stem = `下列加点「以为」的意义是？「${YUGONG_YIWEI_SHEN_CONTINUOUS}」`
    }
    explanation = ensureYiWeiAncientModernNote(explanation)
  } else if (/以为/.test(stem) || /以为|古今异义/.test(term)) {
    explanation = ensureYiWeiAncientModernNote(explanation)
  }

  // 过短引文先扩写（如「信而见疑」→「信而见疑，忠而被谤」）
  stem = expandClassicalShortExcerptsInStem(stem)

  // 修复后若引文已是连续原句，不应再被判为拼接
  if (stem.includes(YUGONG_YIWEI_SHEN_CONTINUOUS)) {
    // ok
  } else if (classicalStemLooksSpliced(stem)) {
    return null
  }

  // 仍缺语境的短引文：拒收，逼生成器给完整句
  if (classicalStemExcerptsLackContext(stem)) return null

  return {
    term,
    stem,
    correct: input.correct.trim(),
    distractors: input.distractors.map((d) => d.trim()).filter(Boolean),
    explanation,
  }
}

export function buildClassicalChineseQuestionFromMcq(input: {
  questionType: ChineseClassicalChineseQuestionType
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  seq: number
}): ClassicalChineseQuestion | null {
  const normalized = normalizeClassicalChineseMcqFields({
    term: input.term,
    stem: input.stem,
    correct: input.correct,
    distractors: input.distractors,
    explanation: input.explanation ?? '',
  })
  if (!normalized) return null
  const { term, stem, correct, distractors, explanation } = normalized
  if (!term || !stem || !correct || distractors.length !== 3) return null
  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getClassicalChineseQuestionFingerprint({
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
  })
  const q: ClassicalChineseQuestion = {
    id: `classical-${input.seq}-${Date.now()}`,
    questionType: input.questionType,
    term,
    stem,
    options,
    correctIndex,
    explanation,
    fingerprint,
  }
  if (!isPlayableFourChoiceMcq(q)) return null
  return q
}

export function parseClassicalChineseMcqAiObject(item: unknown): {
  questionType: ChineseClassicalChineseQuestionType
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
  const normalized = normalizeClassicalChineseMcqFields({
    term,
    stem,
    correct,
    distractors,
    explanation,
  })
  if (!normalized) return null
  return {
    questionType: 'general',
    ...normalized,
  }
}
