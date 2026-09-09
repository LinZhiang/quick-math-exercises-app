/** 讲义测验：判断题极性、本轮事实不得自相矛盾。 */

function compactText(s: string): string {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
}

export function isJudgeAnswerTrue(correct: string): boolean | null {
  const t = compactText(correct)
  if (/^(正确|对|true|t|√|是)$/i.test(t)) return true
  if (/^(错误|错|false|f|×|否)$/i.test(t)) return false
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
  if (ans && /并不(?:是|能|会|等于)|不能直接拥有|并非拥有全部|私有.{0,8}无法/.test(exp)) return true
  return false
}

const ACCESS_YES = /(?:可以|能够|能).{0,24}(?:直接)?(?:读取|访问|修改|拿到|拥有)/
const ACCESS_NO = /(?:无法|不能|不可以).{0,12}(?:直接)?(?:读取|访问|修改|拿到|拥有)/

/** 标答说「可以访问」、解析却说「无法访问」这类正反打架。 */
export function explanationContradictsCorrect(correct: string, explanation: string): boolean {
  const a = compactText(correct)
  const b = compactText(explanation)
  if (!a || !b) return false
  if (ACCESS_YES.test(a) && ACCESS_NO.test(b)) return true
  if (ACCESS_NO.test(a) && ACCESS_YES.test(b) && !/并非|并不是|不是说/.test(b.slice(0, 24))) return true
  if (ACCESS_YES.test(b) && ACCESS_NO.test(b)) return true
  return false
}

/** 判断题把「继承后拥有所有属性/方法」这类过绝对的句子标成正确 → 作废。 */
export function judgeOverclaimMarkedTrue(stem: string, correct: string): boolean {
  if (isJudgeAnswerTrue(correct) !== true) return false
  const t = compactText(stem)
  if (/继承/.test(t) && /(?:所有|全部).{0,10}(?:属性|方法)/.test(t)) return true
  if (/私有/.test(t) && ACCESS_YES.test(t) && !ACCESS_NO.test(t) && !/不|并非|无法|不能/.test(t)) return true
  return false
}

type FactPolarity = [key: string, polarity: string]

function pushFact(out: FactPolarity[], key: string, polarity: string) {
  if (!out.some((x) => x[0] === key && x[1] === polarity)) out.push([key, polarity])
}

const TRUTHY = /true|truthy|真值|(?<!不)会执行/
const FALSY = /false|falsy|假值|不会执行|条件为假/

function claimPolarity(src: string, subject: RegExp): 'truthy' | 'falsy' | null {
  const re = new RegExp(subject.source, subject.flags.includes('g') ? subject.flags : `${subject.flags}g`)
  let hit: RegExpExecArray | null
  let truthy = false
  let falsy = false
  while ((hit = re.exec(src))) {
    const around = src.slice(Math.max(0, hit.index - 4), hit.index + hit[0].length + 22)
    if (FALSY.test(around)) falsy = true
    if (TRUTHY.test(around)) truthy = true
  }
  if (truthy && !falsy) return 'truthy'
  if (falsy && !truthy) return 'falsy'
  return null
}

/** 从标答+解析抽取可对撞的事实（不读题干，避免把错误陈述当结论）。 */
export function extractHandoutQuizFactPolarities(correctText: string, explanation: string): FactPolarity[] {
  const src = compactText(`${correctText}\n${explanation}`)
  if (!src) return []
  const out: FactPolarity[] = []

  const emptyStr = claimPolarity(src, /空字符串|if\(""\)|if\(''\)/g)
  if (emptyStr) pushFact(out, 'empty-string', emptyStr)
  const emptyArr = claimPolarity(src, /空数组|\[\]/g)
  if (emptyArr) pushFact(out, 'empty-array', emptyArr)
  const emptyObj = claimPolarity(src, /空对象|\{\}/g)
  if (emptyObj) pushFact(out, 'empty-object', emptyObj)

  if (/MIN_VALUE/.test(src)) {
    if (/最接近0|最接近零|最小正|最接近于0/.test(src)) pushFact(out, 'min-value', 'tiny-positive')
    if (/最小负|-MAX_VALUE|负向溢出/.test(src) && !/不是最小负|并非最小负|不是负/.test(src)) {
      pushFact(out, 'min-value', 'most-negative')
    }
  }
  if (/parseInt/.test(src) && /前导0|以0开头|0x|八进制/.test(src)) {
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
    if (explanationContradictsCorrect(correctText, explanation)) continue
    out.push(q)
  }
  return out
}
