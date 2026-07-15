/** 语文四选一：从 AI JSON 稳健提取正确答案，并保证选项中一定含正确答案 */

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

/** 答题前结构自检：选项含唯一正确答案下标 */
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
  return true
}

export const CHINESE_MCQ_CORRECTNESS_RULES = `
【正确答案约束·严重】
- correct 的文本必须能在四个选项中找到**完全一致**的一项（勿另写不在选项里的句子）
- 也可直接返回 options 长度为 4 的数组，并给 correctIndex（0～3）或 correct 为 A/B/C/D
- distractors 必须 3 个，且与 correct 互不相同、互不雷同
- 禁止出现「四个选项都对不上题干」「正确项实际不在选项中」的题
`.trim()
