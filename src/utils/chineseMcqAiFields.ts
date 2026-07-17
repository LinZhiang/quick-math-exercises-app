/** 语文四选一：从 AI JSON 稳健提取正确答案，并保证选项中一定含正确答案 */

import { CHINESE_MEANING_DISTRACTOR_RULES } from '@/utils/chineseMeaningDistractorQuality'

export function normalizeMcqOptionText(s: string): string {
  return s
    .trim()
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/：/g, ':')
    .replace(/，/g, ',')
    .replace(/。/g, '.')
}

function textsEqual(a: string, b: string): boolean {
  return normalizeMcqOptionText(a) === normalizeMcqOptionText(b)
}

function findInOptions(options: string[], needle: string): string | null {
  const hit = options.find((o) => textsEqual(o, needle))
  return hit ?? null
}

function letterOrNumberToIndex(raw: string): number | null {
  const t = raw.trim()
  if (/^[A-Da-d]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65
  if (/^[1-4]$/.test(t)) return Number(t) - 1
  if (/^[A-Da-d][.、．)]/.test(t)) return t[0]!.toUpperCase().charCodeAt(0) - 65
  return null
}

/**
 * 兼容多种 AI 返回形态，最终保证：
 * - correct 为选项中的某一项（字符级对齐到 options 原文）
 * - distractors 恰好 3 个，且与 correct 互异
 * 无法保证时返回 null（调用方应丢弃该题并补生成）
 */
export function extractMcqCorrectAndDistractors(
  o: Record<string, unknown>,
): { correct: string; distractors: string[] } | null {
  // —— 形态 A：options[4] + correctIndex / correct / answer ——
  if (Array.isArray(o.options)) {
    const options = o.options
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
    if (options.length >= 4) {
      const four = options.slice(0, 4)
      if (new Set(four.map(normalizeMcqOptionText)).size !== 4) return null

      let resolved: string | null = null
      const answerRaw = o.correct ?? o.answer ?? o.right ?? o.key
      if (typeof answerRaw === 'number' && Number.isInteger(answerRaw)) {
        const idx = answerRaw >= 1 && answerRaw <= 4 ? answerRaw - 1 : answerRaw
        if (idx >= 0 && idx < 4) resolved = four[idx]!
      } else if (typeof answerRaw === 'string' && answerRaw.trim()) {
        const asIdx = letterOrNumberToIndex(answerRaw)
        if (asIdx != null && asIdx >= 0 && asIdx < 4) resolved = four[asIdx]!
        else resolved = findInOptions(four, answerRaw)
      }
      if (
        resolved == null &&
        typeof o.correctIndex === 'number' &&
        o.correctIndex >= 0 &&
        o.correctIndex < 4
      ) {
        resolved = four[o.correctIndex]!
      }
      // distractors + correct 同时给出时，校正到 options 集合内
      if (resolved == null && Array.isArray(o.distractors)) {
        const c = String(o.correct ?? o.answer ?? '').trim()
        if (c) resolved = findInOptions(four, c)
      }
      if (!resolved) return null
      const distractors = four.filter((x) => !textsEqual(x, resolved!))
      if (distractors.length !== 3) return null
      return { correct: resolved, distractors }
    }
  }

  // —— 形态 B：correct + distractors[3] ——
  const correctRaw = String(o.correct ?? o.answer ?? '').trim()
  const distractorsRaw = Array.isArray(o.distractors)
    ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
    : []
  if (!correctRaw || distractorsRaw.length < 3) return null
  const distractors = distractorsRaw.slice(0, 3)
  if (distractors.some((d) => textsEqual(d, correctRaw))) return null
  if (new Set([correctRaw, ...distractors].map(normalizeMcqOptionText)).size !== 4) return null
  return { correct: correctRaw, distractors }
}

/** 组装并打乱四选一；若正确答案无法落入选项则返回 null */
export function assembleFourChoiceMcq(
  correct: string,
  distractors: string[],
  shuffleInPlace: <T>(arr: T[]) => T[],
): { options: string[]; correctIndex: number } | null {
  const c = correct.trim()
  const ds = distractors.map((d) => d.trim()).filter(Boolean)
  if (!c || ds.length !== 3) return null
  if (ds.some((d) => textsEqual(d, c))) return null
  if (new Set([c, ...ds].map(normalizeMcqOptionText)).size !== 4) return null
  const options = shuffleInPlace([c, ...ds])
  const correctIndex = options.findIndex((o) => textsEqual(o, c))
  if (correctIndex < 0) return null
  // 用选项原文，避免 trim/空白差异
  return { options, correctIndex }
}

/** 答题前结构自检：选项含唯一正确答案下标，且不可凭字数/标点蒙对 */
export function isPlayableFourChoiceMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return false
  const correct = q.options[q.correctIndex]
  if (!correct || !String(correct).trim()) return false
  const norms = q.options.map((o) => normalizeMcqOptionText(String(o)))
  if (norms.some((n) => !n)) return false
  if (new Set(norms).size !== 4) return false
  if (mcqOptionSurfaceLeakFailure(q.options, q.correctIndex)) return false
  return true
}

/** 选项可见长度（去空白） */
export function mcqOptionVisibleLength(s: string): number {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
    .length
}

/** 可见标点个数（中英文逗号、顿号、分号、冒号、句号等） */
export function mcqOptionPunctCount(s: string): number {
  const m = String(s ?? '').match(/[，,；;、：:。.！!？?（）()《》「」""''—…·]/g)
  return m?.length ?? 0
}

/**
 * 表面泄题：正确项独最长 / 标点更「完整」→ 可蒙对。
 * 失败返回原因，通过返回 null。
 * 根治策略：宁可多丢题补生成，也不放行「选最长 / 选标点最全」能蒙对的题。
 */
export function mcqOptionSurfaceLeakFailure(
  options: string[],
  correctIndex: number,
): string | null {
  if (!Array.isArray(options) || options.length !== 4) return '结构不完整'
  if (correctIndex < 0 || correctIndex > 3) return 'correctIndex 非法'

  const lengths = options.map(mcqOptionVisibleLength)
  const puncts = options.map(mcqOptionPunctCount)
  const cLen = lengths[correctIndex]!
  const cPunct = puncts[correctIndex]!
  const otherLens = lengths.filter((_, i) => i !== correctIndex)
  const otherPuncts = puncts.filter((_, i) => i !== correctIndex)
  const maxOtherLen = Math.max(...otherLens)
  const minOtherLen = Math.min(...otherLens)
  const maxOtherPunct = Math.max(...otherPuncts)
  const minOtherPunct = Math.min(...otherPuncts)
  const maxLen = Math.max(...lengths)
  const minLen = Math.min(...lengths)
  const span = maxLen - minLen
  const sortedLens = [...lengths].sort((a, b) => a - b)
  const medianLen = sortedLens[1]!

  const longForm = maxLen >= 7

  // 1) 正确项严格独最长（甩开≥1 字即毙——选最长可蒙）
  const uniqueLongest =
    cLen === maxLen && lengths.filter((n) => n === maxLen).length === 1
  if (uniqueLongest && cLen > maxOtherLen) {
    return '正确项独最长，可凭字数蒙对'
  }

  // 2) 正确项处于最长档，且四项长短跨度过大
  if (cLen === maxLen && span >= (longForm ? 5 : 3)) {
    return '选项长短跨度过大且正确项处于最长档'
  }

  // 3) 正确项处于最长档，且明显高于中位（两长两短时也能拦住）
  if (cLen === maxLen && cLen - medianLen >= 2) {
    return '正确项相对中位明显偏长，可凭字数偏向蒙对'
  }

  // 4) 正确项标点独多（多出≥1 即毙）
  if (cPunct > maxOtherPunct) {
    return '正确项标点多于其它项，可凭标点蒙对'
  }

  // 5) 仅正确项含逗号/顿号/分号（释义/概括类）
  {
    const heavy = (s: string) => /[，,；;、]/.test(s)
    const correctHeavy = heavy(options[correctIndex]!)
    const othersHeavyCount = options.filter(
      (_, i) => i !== correctIndex && heavy(options[i]!),
    ).length
    if (correctHeavy && othersHeavyCount === 0) {
      return '仅正确项含逗号/顿号/分号，可凭标点蒙对'
    }
  }

  // 6) 正确项同时更长且标点不少于干扰项最大值
  if (cLen > maxOtherLen && cPunct >= maxOtherPunct && cLen - minOtherLen >= 2) {
    return '正确项同时更长且标点不少于干扰项，表面特征泄题'
  }

  // 7) 正确项是唯一「有标点」的项
  if (cPunct >= 1 && maxOtherPunct === 0 && minOtherPunct === 0 && cLen >= 4) {
    return '仅正确项含标点，可凭标点蒙对'
  }

  return null
}

export const CHINESE_MCQ_SURFACE_PARITY_RULES = `
【选项表面齐整·防蒙对·严重·系统会拒收】
- **禁止正确项独最长**（哪怕只多 1 字也不行）；至少让某一干扰项与正确项同长，或让干扰项更长。
- **禁止正确项标点独多**：逗号/顿号/分号/句号等数量不得高于其它三项；禁止只有正确项带逗号类标点。
- 四项字数须接近，正确项不得相对中位明显偏长。
- 禁止「正确项像完整书面句、干扰项像残缺短句」的排版反差。
- 宁可四项都略短或都略长，也不要让正确项在字数/标点上鹤立鸡群。
`.trim()

export const CHINESE_MCQ_CORRECTNESS_RULES = (
  `
【正确答案约束·严重】
- correct 的文本必须能在四个选项中找到**完全一致**的一项（勿另写不在选项里的句子）
- 也可直接返回 options 长度为 4 的数组，并给 correctIndex（0～3）或 correct 为 A/B/C/D
- distractors 必须 3 个，且与 correct 互不相同、互不雷同
- 禁止出现「四个选项都对不上题干」「正确项实际不在选项中」的题
`.trim() +
  '\n\n' +
  CHINESE_MEANING_DISTRACTOR_RULES +
  '\n\n' +
  CHINESE_MCQ_SURFACE_PARITY_RULES
)
