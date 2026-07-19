/**
 * 资料分析题面公式显示：斜线分式 → 上下结构；LaTeX 根号/分式转义。
 */

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 是否像带根号/分式的公式答案（校验时宜放宽） */
export function looksLikeDataAnalysisFormulaAnswer(text: string): boolean {
  return /\\sqrt|√|\\frac|\\dfrac|开方/.test(String(text ?? ''))
}

function stripOuterParens(t: string): string {
  let s = t.trim()
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0
    let wrapped = true
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]!
      if (ch === '(') depth++
      else if (ch === ')') {
        depth--
        if (depth === 0 && i < s.length - 1) {
          wrapped = false
          break
        }
      }
    }
    if (!wrapped || depth !== 0) break
    s = s.slice(1, -1).trim()
  }
  return s
}

function readAtomLeft(s: string, slashIdx: number): number {
  let i = slashIdx - 1
  while (i >= 0 && /\s/.test(s[i]!)) i--
  if (i < 0) return -1
  if (s[i] === ')') {
    let depth = 1
    i--
    while (i >= 0 && depth > 0) {
      if (s[i] === ')') depth++
      else if (s[i] === '(') depth--
      i--
    }
    return depth === 0 ? i + 1 : -1
  }
  if (/[\d.%％]/.test(s[i]!)) {
    while (i >= 0 && /[\d.%％]/.test(s[i]!)) i--
    // A1、q2 等：数字左侧的字母前缀一并纳入
    while (i >= 0 && /[A-Za-z_]/.test(s[i]!)) i--
    return i + 1
  }
  if (/[A-Za-z_\u4e00-\u9fff]/.test(s[i]!)) {
    while (i >= 0 && /[A-Za-z0-9_\u4e00-\u9fff]/.test(s[i]!)) i--
    return i + 1
  }
  return -1
}

function readAtomRight(s: string, afterSlash: number): number {
  let i = afterSlash
  while (i < s.length && /\s/.test(s[i]!)) i++
  if (i >= s.length) return -1
  if (s[i] === '(') {
    let depth = 1
    i++
    while (i < s.length && depth > 0) {
      if (s[i] === '(') depth++
      else if (s[i] === ')') depth--
      i++
    }
    return depth === 0 ? i : -1
  }
  if (/\d/.test(s[i]!)) {
    while (i < s.length && /[\d.]/.test(s[i]!)) i++
    if (s[i] === '%' || s[i] === '％') i++
    return i
  }
  if (/[A-Za-z_\u4e00-\u9fff]/.test(s[i]!)) {
    while (i < s.length && /[A-Za-z0-9_\u4e00-\u9fff]/.test(s[i]!)) i++
    return i
  }
  return -1
}

type FracSlot = { num: string; den: string }

/**
 * 攻略/题干里大量「公考/事业编」「整除 / 是」「提高 / 上升」是文字并列，不是分式。
 * 仅当分子、分母都像数学量时才转成上下结构。
 */
const CN_MATH_FRAC_LABELS = new Set([
  '部分',
  '整体',
  '总量',
  '份数',
  '增长量',
  '增长率',
  '增速',
  '增幅',
  '基期',
  '现期',
  '基期值',
  '现期值',
  '基期量',
  '现期量',
  '分子',
  '分母',
  '平均数',
  '平均',
  '比重',
  '占比',
  '倍数',
  '差值',
  '差值量',
  '贡献率',
  '利润率',
  '期数',
  '末期',
  '初期',
])

function isMathyFractionPart(part: string): boolean {
  const t = stripOuterParens(part).trim()
  if (!t) return false
  // 数字、拉丁字母、百分号、常见运算符号 → 数学量
  if (/[0-9A-Za-z_%％+\-−–—×÷·=<>≤≥≈^√π∞]/.test(t)) return true
  // 资料分析等攻略中的中文量名（如 部分/整体）
  if (CN_MATH_FRAC_LABELS.has(t)) return true
  return false
}

/** 两侧都像数学量，且不像「15/21/35」这类枚举列表 */
function shouldConvertSlashFraction(
  num: string,
  den: string,
  s: string,
  leftStart: number,
  rightEnd: number,
): boolean {
  if (!isMathyFractionPart(num) || !isMathyFractionPart(den)) return false

  const bareNum = stripOuterParens(num).trim()
  const bareDen = stripOuterParens(den).trim()
  // 纯数字串接成列表：能被 15/21/35、选项 1/2/3
  if (/^\d+$/.test(bareNum) && /^\d+$/.test(bareDen)) {
    const after = s.slice(rightEnd)
    const before = s.slice(0, leftStart)
    if (/^\s*\/\s*\d/.test(after)) return false
    if (/\/\s*\d+\s*$/.test(before)) return false
    // 匹配到中间一段时：15/「21/35」——左侧紧挨着「数字/」
    if (/\d+\s*\/\s*$/.test(before)) return false
  }
  return true
}

function replaceInnermostSlashFraction(
  s: string,
  slots: FracSlot[],
): string | null {
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '/') continue
    const leftStart = readAtomLeft(s, i)
    const rightEnd = readAtomRight(s, i + 1)
    if (leftStart < 0 || rightEnd < 0) continue
    const num = s.slice(leftStart, i).trim()
    const den = s.slice(i + 1, rightEnd).trim()
    if (!num || !den) continue
    if (/^\d{4}$/.test(num) && /^\d{4}$/.test(den)) continue
    if (num.includes('/') || den.includes('/')) continue
    // 跳过「真题 1/2」「第 1/2 章」等序号，勿当成数学分式
    const prefix = s.slice(Math.max(0, leftStart - 6), leftStart)
    if (/真题|例题|习题|[题章节类项条]\s*$/.test(prefix)) continue
    if (
      /[\u4e00-\u9fff]\s*$/.test(prefix) &&
      /^\(?\d{1,2}\)?$/.test(num) &&
      /^\(?\d{1,2}\)?$/.test(den)
    ) {
      continue
    }
    if (!shouldConvertSlashFraction(num, den, s, leftStart, rightEnd)) continue
    const id = slots.length
    slots.push({ num: stripOuterParens(num), den: stripOuterParens(den) })
    return s.slice(0, leftStart) + `\uE000${id}\uE001` + s.slice(rightEnd)
  }
  return null
}

function normalizeLatex(s: string): string {
  let out = String(s ?? '')
  out = out.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\approx/g, '≈')
  out = out.replace(/\\%/g, '%')
  for (let n = 0; n < 8; n++) {
    const next = out
      .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    if (next === out) break
    out = next
  }
  return normalizeVulgarAndUnicodeFractions(out)
}

/** ½、⅓、⁴⁄₃ 等 → (1)/(2) 形式，供上下分式渲染 */
const VULGAR_FRACTIONS: Record<string, [string, string]> = {
  '½': ['1', '2'],
  '⅓': ['1', '3'],
  '⅔': ['2', '3'],
  '¼': ['1', '4'],
  '¾': ['3', '4'],
  '⅕': ['1', '5'],
  '⅖': ['2', '5'],
  '⅗': ['3', '5'],
  '⅘': ['4', '5'],
  '⅙': ['1', '6'],
  '⅚': ['5', '6'],
  '⅛': ['1', '8'],
  '⅜': ['3', '8'],
  '⅝': ['5', '8'],
  '⅞': ['7', '8'],
  '⅐': ['1', '7'],
  '⅑': ['1', '9'],
  '⅒': ['1', '10'],
}

const UNI_SUB_TO_ASCII: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
}

const UNI_TO_ASCII_SUP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  'ⁿ': 'n',
}

function normalizeVulgarAndUnicodeFractions(s: string): string {
  let out = s
  for (const [ch, [num, den]] of Object.entries(VULGAR_FRACTIONS)) {
    if (out.includes(ch)) out = out.split(ch).join(`(${num})/(${den})`)
  }
  // ⁴⁄₃、4⁄3（分数斜线 U+2044）
  out = out.replace(
    /([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\d+)⁄([₀₁₂₃₄₅₆₇₈₉]+|\d+)/g,
    (_m, a: string, b: string) => {
      const num = [...a].map((c) => UNI_TO_ASCII_SUP[c] ?? c).join('')
      const den = [...b].map((c) => UNI_SUB_TO_ASCII[c] ?? c).join('')
      return `(${num})/(${den})`
    },
  )
  return out
}

function extractSlashFractions(s: string, slots: FracSlot[]): string {
  let cur = s
  for (let guard = 0; guard < 40; guard++) {
    const next = replaceInnermostSlashFraction(cur, slots)
    if (next == null) break
    cur = next
  }
  return cur
}

function shiftFracTokens(s: string, offset: number): string {
  return s.replace(/\uE000(\d+)\uE001/g, (_m, id: string) => `\uE000${offset + Number(id)}\uE001`)
}

function expandSlotsToHtml(s: string, slots: FracSlot[]): string {
  const re = /\uE000(\d+)\uE001/g
  let html = ''
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) != null) {
    if (m.index > last) html += escapeHtmlText(s.slice(last, m.index))
    const slot = slots[Number(m[1])]
    if (!slot) {
      html += escapeHtmlText(m[0])
    } else {
      const numHtml = expandSlotsToHtml(slot.num, slots)
      const denHtml = expandSlotsToHtml(slot.den, slots)
      html += `<span class="da-math-frac"><span class="da-math-frac__num">${numHtml}</span><span class="da-math-frac__rule" aria-hidden="true"></span><span class="da-math-frac__den">${denHtml}</span></span>`
    }
    last = m.index + m[0].length
  }
  if (last < s.length) html += escapeHtmlText(s.slice(last))
  return html
}

/**
 * 将 LaTeX/斜线公式转为明文（错题本等）。
 */
export function formatDataAnalysisMathPlain(text: string): string {
  let s = normalizeLatex(text)
  const SUP: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  }
  const LETTER_SUP: Record<string, string> = {
    n: 'ⁿ',
    N: 'ⁿ',
  }
  const toSup = (n: string) =>
    [...n].map((c) => SUP[c] ?? LETTER_SUP[c] ?? c).join('')
  for (let i = 0; i < 6; i++) {
    const next = s.replace(/\\sqrt\[(\d+)\]\{([^{}]+)\}/g, (_m, n: string, inner: string) => {
      return `${toSup(n)}√(${inner})`
    })
    if (next === s) break
    s = next
  }
  for (let i = 0; i < 6; i++) {
    const next = s.replace(/\\sqrt\{([^{}]+)\}/g, (_m, inner: string) => `√(${inner})`)
    if (next === s) break
    s = next
  }
  // a² → 先规范；再把 ^2 / ^{n} 收成上标字符
  s = unicodeSuperscriptsToCaret(s)
  s = s.replace(/\^\{([^{}]+)\}/g, (_m, exp: string) => toSup(String(exp)))
  s = s.replace(/\^(-?\d+(?:\.\d+)?|[A-Za-z])/g, (_m, exp: string) => toSup(String(exp)))
  return s
}

/** a²、r³ → a^2、r^3，便于统一转成 <sup> */
function unicodeSuperscriptsToCaret(s: string): string {
  return s.replace(/([A-Za-z0-9π%)\]）])([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+)/g, (_m, base: string, supers: string) => {
    const exp = [...supers].map((c) => UNI_TO_ASCII_SUP[c] ?? c).join('')
    return `${base}^${exp}`
  })
}

type PowerSlot = { exp: string }

function extractCaretPowers(s: string, slots: PowerSlot[]): string {
  let cur = s
  cur = cur.replace(/\^\{([^{}]+)\}/g, (_m, exp: string) => {
    const id = slots.length
    slots.push({ exp: String(exp) })
    return `\uE500${id}\uE501`
  })
  cur = cur.replace(/\^(-?\d+(?:\.\d+)?|[A-Za-z])/g, (_m, exp: string) => {
    const id = slots.length
    slots.push({ exp: String(exp) })
    return `\uE500${id}\uE501`
  })
  return cur
}

function expandPowerTokens(html: string, slots: PowerSlot[]): string {
  return html.replace(/\uE500(\d+)\uE501/g, (_m, id: string) => {
    const slot = slots[Number(id)]
    if (!slot) return ''
    return `<sup class="da-math-sup">${escapeHtmlText(slot.exp)}</sup>`
  })
}

/**
 * 转为可安全 v-html 的 HTML：分式上下排布；根号带被开方数横线；^n 转成上标。
 */
export function renderDataAnalysisMathHtml(text: string): string {
  let s = normalizeLatex(text)
  s = unicodeSuperscriptsToCaret(s)

  type RootSlot = { idx?: string; inner: string }
  const roots: RootSlot[] = []
  for (let i = 0; i < 8; i++) {
    const next = s.replace(
      /\\sqrt(?:\[(\d+)\])?\{([^{}]+)\}/g,
      (_m, idx: string | undefined, inner: string) => {
        const id = roots.length
        roots.push({ idx, inner })
        return `\uE100${id}\uE101`
      },
    )
    if (next === s) break
    s = next
  }

  const powers: PowerSlot[] = []
  s = extractCaretPowers(s, powers)

  const fracs: FracSlot[] = []
  s = extractSlashFractions(s, fracs)

  let withRoots = s.replace(/\uE100(\d+)\uE101/g, (_m, idStr: string) => {
    const root = roots[Number(idStr)]
    if (!root) return ''
    const innerFracs: FracSlot[] = []
    const innerExtracted = extractSlashFractions(root.inner, innerFracs)
    const offset = fracs.length
    for (const slot of innerFracs) {
      fracs.push({
        num: shiftFracTokens(slot.num, offset),
        den: shiftFracTokens(slot.den, offset),
      })
    }
    const innerMapped = shiftFracTokens(innerExtracted, offset)
    const idxHtml = root.idx
      ? `<sup class="da-math-root__idx">${escapeHtmlText(root.idx)}</sup>`
      : ''
    return `\uE200${idxHtml}\uE201${innerMapped}\uE202`
  })

  const rootBlocks: string[] = []
  withRoots = withRoots.replace(
    /\uE200([\s\S]*?)\uE201([\s\S]*?)\uE202/g,
    (_m, idxHtml: string, innerRaw: string) => {
      const id = rootBlocks.length
      const innerHtml = expandPowerTokens(expandSlotsToHtml(innerRaw, fracs), powers)
      rootBlocks.push(
        `<span class="da-math-root">${idxHtml}<span class="da-math-root__sym">√</span><span class="da-math-radicand">${innerHtml}</span></span>`,
      )
      return `\uE300${id}\uE301`
    },
  )

  let html = expandSlotsToHtml(withRoots, fracs)
  html = expandPowerTokens(html, powers)
  html = html.replace(/\uE300(\d+)\uE301/g, (_m, id: string) => rootBlocks[Number(id)] ?? '')

  // √3、√(…) → 带横线的根号结构（被开方数需再转义）
  html = html.replace(
    /([⁰¹²³⁴⁵⁶⁷⁸⁹]+)?√(?:\(([^)]+)\)|(\d+(?:\.\d+)?)|([A-Za-z]))/g,
    (
      _m,
      sup: string | undefined,
      paren: string | undefined,
      bare: string | undefined,
      letter: string | undefined,
    ) => {
      const idxHtml = sup ? `<sup class="da-math-root__idx">${escapeHtmlText(sup)}</sup>` : ''
      const body = escapeHtmlText(paren ?? bare ?? letter ?? '')
      return `<span class="da-math-root">${idxHtml}<span class="da-math-root__sym">√</span><span class="da-math-radicand">${body}</span></span>`
    },
  )

  return html
}
