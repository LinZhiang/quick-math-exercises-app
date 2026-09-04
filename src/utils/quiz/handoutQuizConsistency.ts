/** 讲义测验：判断题极性、本轮事实不得自相矛盾。 */

function compactText(s: string): string {
  return String(s ?? '').replace(/\s+/g, '')
}

export function isJudgeAnswerTrue(correct: string): boolean | null {
  const t = compactText(correct)
  if (/^(正确|对|true|t|√|是)$/i.test(t) || (t.includes('正确') && !t.includes('错误'))) return true
  if (/^(错误|错|false|f|×|否)$/i.test(t) || t.includes('错误')) return false
  return null
}

/** 解析宣称的对/错与标答不一致时，该题作废。 */
export function judgeExplanationConflictsCorrect(correct: string, explanation: string): boolean {
  const ans = isJudgeAnswerTrue(correct)
  if (ans == null) return false
  const exp = compactText(explanation)
  if (!exp) return false
  const saysWrong = /正确答案是错误|题干说法错误|该说法错误|应选错误|判断为错误|应判错误/.test(exp)
  const saysRight = /正确答案是正确|题干说法正确|该说法正确|应选正确|判断为正确|应判正确/.test(exp)
  if (saysWrong && saysRight) return true
  if (ans && saysWrong && !saysRight) return true
  if (!ans && saysRight && !saysWrong) return true
  return false
}

type FactPolarity = [key: string, polarity: string]

function pushFact(out: FactPolarity[], key: string, polarity: string) {
  if (!out.some((x) => x[0] === key && x[1] === polarity)) out.push([key, polarity])
}

/** 从标答+解析抽取可对撞的事实（不读题干，避免把错误陈述当结论）。 */
export function extractHandoutQuizFactPolarities(correctText: string, explanation: string): FactPolarity[] {
  const src = compactText(`${correctText}\n${explanation}`)
  if (!src) return []
  const out: FactPolarity[] = []

  if (/空字符串|""|''|if\(""\)|if\(''\)/.test(src)) {
    if (/不会执行|条件为假|转[为成]false|假值|falsy|六个.{0,8}false/.test(src)) {
      pushFact(out, 'empty-string', 'falsy')
    } else if (/会执行|转[为成]true|真值|truthy/.test(src) && !/不会执行|并非true|不是true/.test(src)) {
      pushFact(out, 'empty-string', 'truthy')
    }
  }
  if (/空数组|\[\]/.test(src)) {
    if (/转[为成]false|假值|falsy|不会执行/.test(src) && !/空数组.{0,12}true|\[].{0,12}true/.test(src)) {
      pushFact(out, 'empty-array', 'falsy')
    } else if (/转[为成]true|真值|truthy/.test(src)) {
      pushFact(out, 'empty-array', 'truthy')
    }
  }
  if (/空对象|\{\}/.test(src)) {
    if (/转[为成]false|假值|falsy/.test(src) && !/空对象.{0,12}true|\{\}.{0,12}true/.test(src)) {
      pushFact(out, 'empty-object', 'falsy')
    } else if (/转[为成]true|真值|truthy/.test(src)) {
      pushFact(out, 'empty-object', 'truthy')
    }
  }
  if (/MIN_VALUE/.test(src)) {
    if (/最接近0|最接近零|最小正|最接近于0/.test(src)) pushFact(out, 'min-value', 'tiny-positive')
    if (/最小负|-MAX_VALUE|负向溢出/.test(src) && !/不是最小负|并非最小负|不是负/.test(src)) {
      pushFact(out, 'min-value', 'most-negative')
    }
  }
  if (/parseInt/.test(src) && (/前导0|以0开头|0x|八进制/.test(src))) {
    if (/按十进制|结果是11|不是八进制/.test(src)) pushFact(out, 'parseint-leading-zero', 'decimal')
    if (/按八进制|结果是9/.test(src) && !/不适用于parseInt|不是八进制/.test(src)) {
      pushFact(out, 'parseint-leading-zero', 'octal')
    }
  }
  return out
}

export function filterHandoutQuizFactConflicts<T>(
  items: T[],
  pick: (q: T) => { correctText: string; explanation: string },
): T[] {
  const seen = new Map<string, string>()
  const out: T[] = []
  for (const q of items) {
    const { correctText, explanation } = pick(q)
    const facts = extractHandoutQuizFactPolarities(correctText, explanation)
    const self = new Map<string, Set<string>>()
    for (const [k, p] of facts) {
      const set = self.get(k) ?? new Set<string>()
      set.add(p)
      self.set(k, set)
    }
    if ([...self.values()].some((s) => s.size > 1)) continue
    if (facts.some(([k, p]) => seen.has(k) && seen.get(k) !== p)) continue
    for (const [k, p] of facts) {
      if (!seen.has(k)) seen.set(k, p)
    }
    out.push(q)
  }
  return out
}
