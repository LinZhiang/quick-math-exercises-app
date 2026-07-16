/**
 * 重点题变式 / AI 四选一质量校验：防泄题、错别字极性颠倒、解析自相矛盾。
 */

import { normalizeMcqOptionText } from '@/utils/chineseMcqAiFields'

export function stemHasFillBlank(stem: string): boolean {
  const s = stem.replace(/\s+/g, '')
  return /[（(]\s*[）)]|_+|＿+|【\s*】|\[\s*\]/.test(s)
}

/** 两串汉字的替换距离（长度不同时按多出来的字 + 对齐替换估算） */
export function cjkEditDistance(a: string, b: string): number {
  const x = a.replace(/\s+/g, '')
  const y = b.replace(/\s+/g, '')
  if (x === y) return 0
  const n = x.length
  const m = y.length
  if (!n) return m
  if (!m) return n
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i]![0] = i
  for (let j = 0; j <= m; j++) dp[0]![j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      )
    }
  }
  return dp[n]![m]!
}

/** 是否像同一词语的形近/音近错写（长度接近且少量改字） */
export function isNearTypoVariant(canonical: string, candidate: string): boolean {
  const a = normalizeMcqOptionText(canonical).replace(/\s+/g, '')
  const b = normalizeMcqOptionText(candidate).replace(/\s+/g, '')
  if (!a || !b || a === b) return false
  // 去掉拼音注音再比
  const stripPy = (s: string) => s.replace(/[（(][^）)]*[）)]/g, '').trim()
  const aa = stripPy(a)
  const bb = stripPy(b)
  if (!aa || !bb || aa === bb) return false
  if (Math.abs(aa.length - bb.length) > 1) return false
  const dist = cjkEditDistance(aa, bb)
  const maxLen = Math.max(aa.length, bb.length)
  if (maxLen <= 2) return dist === 1
  return dist >= 1 && dist <= 2
}

export type TypoStemPolarity = 'has-typo' | 'no-typo' | 'unknown'

/** 错别字题干极性：有错别字 / 没有错别字 */
export function typoStemPolarity(stem: string): TypoStemPolarity {
  const s = stem.replace(/\s+/g, '')
  // 先匹配「没有」类，避免被「有」误伤
  if (
    /没有错别字|无错别字|没有错误|全都正确|全部正确|书写正确|用字正确|没有误|无错误/.test(s)
  ) {
    return 'no-typo'
  }
  if (
    /有错别字|含有错别字|存在错别字|错别字的一项|错别字的是|书写有误|有错误的是|不正确的是|有误的是/.test(
      s,
    )
  ) {
    return 'has-typo'
  }
  return 'unknown'
}

/** 从解析文中尽量抽出「正确写法」 */
export function extractCanonicalFormFromExplanation(explanation: string): string | null {
  const e = explanation.trim()
  if (!e) return null
  const patterns = [
    /正确写[法]?\s*[是为]\s*[「『"“]?([\u4e00-\u9fff]{2,12})/,
    /规范写[法]?\s*[是为]\s*[「『"“]?([\u4e00-\u9fff]{2,12})/,
    /正确形式\s*[是为]\s*[「『"“]?([\u4e00-\u9fff]{2,12})/,
    /应为\s*[「『"“]([\u4e00-\u9fff]{2,12})[」』"”]/,
    /应写作\s*[「『"“]?([\u4e00-\u9fff]{2,12})/,
  ]
  for (const re of patterns) {
    const m = re.exec(e)
    if (m?.[1]) return m[1]
  }
  return null
}

/**
 * 错别字四选一字段校验。失败返回原因字符串，通过返回 null。
 * term = 规范写法（考点词）。
 */
export function typoMcqQualityFailure(input: {
  stem: string
  term: string
  correct: string
  distractors: string[]
  explanation?: string
}): string | null {
  const term = normalizeMcqOptionText(input.term)
  const correct = normalizeMcqOptionText(input.correct)
  const distractors = input.distractors.map(normalizeMcqOptionText)
  const options = [correct, ...distractors]
  if (!term || !correct || distractors.length !== 3) return '结构不完整'

  const polarity = typoStemPolarity(input.stem)
  const nearTypos = options.filter((o) => isNearTypoVariant(term, o))
  const exactTermCount = options.filter((o) => o === term).length

  if (polarity === 'no-typo') {
    // 选「没有错别字」：正确项必须是规范写法
    if (correct !== term) return '没有错别字题：correct 必须等于 term（规范写法）'
    if (exactTermCount !== 1) return '没有错别字题：选项中规范写法须恰好出现一次'
    // 干扰项应是错写；若干扰里几乎没有近形错写，可能整题乱编
    if (nearTypos.length < 2) return '没有错别字题：干扰项应多为考点词的错写'
  } else if (polarity === 'has-typo') {
    // 选「有错别字」：正确项必须是错写；规范写法须在干扰项中且仅一次
    if (correct === term) return '有错别字题：不能把规范写法标为正确答案'
    if (!isNearTypoVariant(term, correct)) return '有错别字题：correct 须是 term 的近形错写'
    if (exactTermCount !== 1) return '有错别字题：选项中须恰好含一项规范写法'
    if (!distractors.includes(term)) return '有错别字题：规范写法须作为干扰项出现'
    // 关键：除 correct 外，不能再有其它近形错写，否则多解
    const otherTypos = distractors.filter((o) => o !== term && isNearTypoVariant(term, o))
    if (otherTypos.length > 0) {
      return '有错别字题：干扰项中不能再出现同一词的其它错写（否则多解）'
    }
  } else {
    // 未知极性：至少禁止「解析说正确写法是 X，却把 X 标成有错别字答案」等自相矛盾
    // 保守：若 correct===term，要求题干不像「有错别字」；已在上面处理
    // 若选项里既有 term 又有多个近形错写，且 correct 是错写——按 has-typo 规则收紧
    if (exactTermCount === 1 && nearTypos.length >= 2) {
      if (correct === term) return '疑似有错别字题却把规范写法标为答案'
      const otherTypos = options.filter((o) => o !== correct && o !== term && isNearTypoVariant(term, o))
      if (otherTypos.length > 0) return '同一词多个错写并存，题干未标明极性且会多解'
    }
  }

  const canonical = extractCanonicalFormFromExplanation(input.explanation ?? '')
  if (canonical) {
    const c = normalizeMcqOptionText(canonical)
    if (polarity === 'no-typo' && correct !== c && term !== c) {
      // 解析给出的规范写法与标答不一致
      if (options.includes(c) && correct !== c) {
        return '解析中的正确写法与 correct 不一致'
      }
    }
    if (polarity === 'has-typo') {
      if (correct === c) return '解析认定的正确写法被标成了「有错别字」的答案'
      if (options.includes(c) && !distractors.includes(c) && c !== term) {
        return '解析中的正确写法未落在干扰项'
      }
    }
    // 解析写「X 是错误写法」且 X===correct 对 has-typo OK；若写「X 是错误」且 polarity no-typo 且 correct===X → 坏
    if (polarity === 'no-typo' && new RegExp(`${escapeRegExp(correct)}.{0,6}(错误|有误|错写)`).test(input.explanation ?? '')) {
      return '解析称 correct 为错误写法，与「没有错别字」题矛盾'
    }
  }

  return null
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 解析是否暗示多选项都合理（近义送分/无唯一答案） */
export function explanationImpliesNonUniqueAnswer(
  explanation: string,
  options: string[],
): boolean {
  const e = explanation.replace(/\s+/g, '')
  if (!e) return false
  if (/(两者|两个|均可|都能|都可以|都可|都对|都可以选|无本质区别|意思相近|几乎同义)/.test(e)) {
    return true
  }
  // 「步履维艰也是行走困难之意」——另一选项被说成同义
  for (const opt of options) {
    const o = opt.trim()
    if (o.length < 2) continue
    const re = new RegExp(
      `${escapeRegExp(o)}.{0,4}(也是|同样|亦是|也指|也表).{0,12}(之意|意思|含义|意思)`,
    )
    if (re.test(e)) return true
  }
  return false
}

/**
 * 成语/词语：题型与题干、选项形态是否一致。
 * 返回纠正后的题型，或 null 表示应丢弃。
 */
export function coerceVocabQuestionType(input: {
  questionType: 'word-to-meaning' | 'meaning-to-word'
  term: string
  stem: string
  correct: string
  distractors: string[]
}): 'word-to-meaning' | 'meaning-to-word' | null {
  const { term, stem, correct, distractors } = input
  let questionType = input.questionType
  const options = [correct, ...distractors]
  const blank = stemHasFillBlank(stem)
  const termInOptions = options.some((o) => normalizeMcqOptionText(o) === normalizeMcqOptionText(term))
  const optsLookLikeShortWords = options.every((o) => {
    const t = o.trim()
    return t.length >= 2 && t.length <= 8 && !/[，。；、]/.test(t) && t.length <= term.length + 2
  })
  const optsLookLikeMeanings = options.every((o) => {
    const t = o.trim()
    return t.length >= 8 || /[的是为指比喻]/.test(t)
  })

  // 填空 + 短词语选项 → 实际是选词语
  if (blank && optsLookLikeShortWords && correct === term) {
    questionType = 'meaning-to-word'
  }

  if (questionType === 'word-to-meaning') {
    // 选释义却把词语本身放进选项，且会展示 term → 泄题/题型错乱
    if (termInOptions) return null
    if (blank && optsLookLikeShortWords) return null
    // 选项全是短词而非释义
    if (optsLookLikeShortWords && !optsLookLikeMeanings) return null
  }

  if (questionType === 'meaning-to-word') {
    if (correct !== term) return null
    if (stemHasFillBlank(stem) === false && termInOptions === false && optsLookLikeMeanings) {
      // 选项全是释义却标成选词语
      return null
    }
  }

  return questionType
}
