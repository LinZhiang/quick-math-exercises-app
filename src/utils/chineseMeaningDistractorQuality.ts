/**
 * 词语/成语「选释义」「选词语」干扰项质量：过弱、口语化、与考点毫无联系的废题拦截。
 */

/** 口语/生活场景/一眼假的表述（选释义干扰里不应出现） */
const COLLOQUIAL_OR_TRIVIAL_RE =
  /下班|休息|摸鱼|加班|老板|朋友圈|点赞|网购|外卖|追剧|打游戏|刷短视频|发通知|发布通知|紧急发布|着急|库存物资|账目数据|监督下属|外部压力|追求功名|过往回忆|遗憾的情绪/

function cjkChars(s: string): string[] {
  return [...s.replace(/\s+/g, '')].filter((c) => /[\u4e00-\u9fff]/.test(c))
}

function sharesAnyChar(a: string, b: string): boolean {
  const setB = new Set(cjkChars(b))
  return cjkChars(a).some((c) => setB.has(c))
}

function sharesAtLeast(a: string, b: string, n: number): boolean {
  const setB = new Set(cjkChars(b))
  let hit = 0
  for (const c of cjkChars(a)) {
    if (setB.has(c)) hit += 1
    if (hit >= n) return true
  }
  return false
}

/**
 * 失败返回原因；通过返回 null。
 * - word-to-meaning：释义干扰须书面、易混，禁止口语场景句；多数干扰须与 term 或正确释义有字面/语义钩连
 * - meaning-to-word：干扰词须与考点形近/近义（至少一项共享汉字），禁止风马牛不相及
 */
export function meaningDistractorQualityFailure(input: {
  questionType: 'word-to-meaning' | 'meaning-to-word'
  term: string
  correct: string
  distractors: string[]
}): string | null {
  const term = input.term.trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !correct || distractors.length !== 3) return '结构不完整'

  if (input.questionType === 'word-to-meaning') {
    for (const d of distractors) {
      if (COLLOQUIAL_OR_TRIVIAL_RE.test(d)) {
        return '干扰项口语化或场景过具体，与正确释义差距过大'
      }
      if (/[？?！!]/.test(d)) return '释义选项不得含问号/感叹号'
    }

    const cl = cjkChars(correct).length
    if (cl >= 4) {
      const lengths = [correct, ...distractors].map((s) => cjkChars(s).length)
      const sorted = [...lengths].sort((a, b) => a - b)
      const median = sorted[1]!
      for (const dl of lengths) {
        if (Math.abs(dl - median) > 2) {
          return '释义选项字数不够齐整（易凭长短蒙对）'
        }
      }
      // 正确项不得独最长（多 1 字也毙）
      const cOnly = lengths[0]!
      const dMax = Math.max(...lengths.slice(1))
      if (cOnly > dMax) {
        return '正确释义独最长'
      }
      const heavy = (s: string) => /[，,；;、]/.test(s)
      if (heavy(correct) && distractors.every((d) => !heavy(d))) {
        return '仅正确释义含逗号类标点'
      }
      const punct = (s: string) =>
        (s.match(/[，,；;、：:。.！!？?（）()《》「」""''—…·]/g) || []).length
      const cP = punct(correct)
      const dPMax = Math.max(...distractors.map(punct))
      if (cP > dPMax) {
        return '正确释义标点独多'
      }
    }

    // 至少 2 个干扰项：与 term 同字，或与正确释义共享 ≥2 字（近义改写钩连）
    let linked = 0
    for (const d of distractors) {
      if (sharesAnyChar(term, d) || sharesAtLeast(correct, d, 2)) linked += 1
    }
    if (linked < 2) {
      return '干扰项与考点词/正确释义联系过弱（易一眼排除）'
    }
  }

  if (input.questionType === 'meaning-to-word') {
    let shareWithTerm = 0
    for (const d of distractors) {
      if (sharesAnyChar(term, d)) shareWithTerm += 1
      if (COLLOQUIAL_OR_TRIVIAL_RE.test(d)) {
        return '选词语干扰项不得为口语/网络词'
      }
    }
    // 近义成语/词语题：至少 1 个形近钩连；0 个则几乎一定是乱凑
    if (shareWithTerm < 1 && term.length >= 2) {
      return '选词语干扰项与考点词无字形联系，干扰过弱'
    }
  }

  return null
}

/** 写入 AI 提示：选释义/选词语干扰项硬性要求 */
export const CHINESE_MEANING_DISTRACTOR_RULES = `
【干扰项迷惑力·选释义/选词语·严重】
- 正确项与三个干扰项必须「看起来都像答案」，禁止正确项书面、干扰项口语/生活场景导致一眼可排除。
- 禁止干扰项写成具体生活情节（如下班休息、发布通知、盘点库存、监督下属、追求功名等）。
- 选释义：干扰优先①近义错位（程度/对象/褒贬偷换）；②拆字望文生义但读来像词典义；③常混近义词释义；④本义/引申义错位。每个干扰都要像词典短释义。
- 选词语：干扰须为常混近义/形近词（尽量与 term 有相同字或同义场），禁止风马牛不相及的词。
- **字数与标点必须齐整**：四释义字数相差尽量≤2字；**禁止正确项独最长**（多1字也不行）；禁止正确项标点独多/独含逗号顿号。
- 反例（禁止）：「遑急」正确「匆忙急迫」却配「着急下班休息」；「砥砺」正确「磨炼意志，相互勉励」却配无逗号短干扰。
- 正例：「顾惜」正确「顾全爱惜」配「顾念爱护」「怜惜体恤」「眷顾思念」类近义错位（字数接近、均无独标点）。
`.trim()
