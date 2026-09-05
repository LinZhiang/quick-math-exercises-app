import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { highlightHandoutCodeHtml, isJsOnlySnippet, jsSourceLooksLikeProse, shouldPromoteJsToBlock } from '@/utils/markdown/highlightHandoutCode'
import { repairSameLineFenceOpeners, normalizeJsMarkdownFences, tidyJsFencesInMarkdown } from '@/utils/markdown/tidyJsCode'
import { judgeExplanationConflictsCorrect } from '@/utils/quiz/handoutQuizConsistency'

export type FrontendQuizKind = 'choice' | 'judge' | 'calc' | 'short'

export type FrontendQuizQuestion = {
  fingerprint: string
  kind: FrontendQuizKind
  term: string
  stem: string
  options: string[]
  correctIndex: number
  correctText: string
  explanation: string
  itemId: string
  itemTitle: string
  learningPath?: string[]
}

export type FrontendQuizCounts = {
  choice: number
  judge: number
  calc: number
  short: number
}

export const DEFAULT_FRONTEND_QUIZ_COUNTS: FrontendQuizCounts = {
  choice: 12,
  judge: 2,
  calc: 0,
  short: 0,
}

/** 判断/计算/简答单类上限 */
export const FRONTEND_QUIZ_KIND_MAX = 15
/** 选择题上限 */
export const FRONTEND_QUIZ_CHOICE_MAX = 25

const QUIZ_COUNT_MAX: FrontendQuizCounts = {
  choice: FRONTEND_QUIZ_CHOICE_MAX,
  judge: FRONTEND_QUIZ_KIND_MAX,
  calc: FRONTEND_QUIZ_KIND_MAX,
  short: FRONTEND_QUIZ_KIND_MAX,
}

export function frontendQuizKindLabel(kind: FrontendQuizKind): string {
  if (kind === 'judge') return '判断'
  if (kind === 'calc') return '计算'
  if (kind === 'short') return '简答'
  return '选择'
}

export function totalFrontendQuizCount(c: FrontendQuizCounts): number {
  return Math.max(0, c.choice) + Math.max(0, c.judge) + Math.max(0, c.calc) + Math.max(0, c.short)
}

export function clampFrontendQuizCounts(raw: Partial<FrontendQuizCounts>): FrontendQuizCounts {
  const n = (v: unknown, fallback: number, max: number) => {
    const x = Math.round(Number(v))
    if (!Number.isFinite(x)) return fallback
    return Math.min(max, Math.max(0, x))
  }
  const choice = n(raw.choice, DEFAULT_FRONTEND_QUIZ_COUNTS.choice, QUIZ_COUNT_MAX.choice)
  const judge = n(raw.judge, DEFAULT_FRONTEND_QUIZ_COUNTS.judge, QUIZ_COUNT_MAX.judge)
  const calc = n(raw.calc, DEFAULT_FRONTEND_QUIZ_COUNTS.calc, QUIZ_COUNT_MAX.calc)
  const short = n(raw.short, DEFAULT_FRONTEND_QUIZ_COUNTS.short, QUIZ_COUNT_MAX.short)
  if (choice + judge + calc + short <= 0) return { ...DEFAULT_FRONTEND_QUIZ_COUNTS }
  return { choice, judge, calc, short }
}

export function buildFrontendQuizFingerprint(input: {
  kind: FrontendQuizKind
  stem: string
  correctText: string
}): string {
  const stem = input.stem.replace(/\s+/g, '').slice(0, 80)
  const ans = input.correctText.replace(/\s+/g, '').slice(0, 40)
  return `cb-quiz:${input.kind}:${stem}:${ans}`
}

function asText(v: unknown): string {
  return String(v ?? '').trim()
}

const ABBREV_GLOSS_PAREN_RE =
  /\b([A-Za-z][A-Za-z0-9\-\/]{1,16})\s*[（(]([^）)]*[一-龥][^）)]{0,24})[）)]/g
const ABBREV_GLOSS_SLASH_RE = /\b([A-Za-z][A-Za-z0-9\-]{1,16})\s*[／/]\s*([\u4e00-\u9fff]{2,18})/g

function harvestAbbrevGlosses(s: string): string[] {
  const out: string[] = []
  const text = String(s || '')
  const pushAll = (re: RegExp, compactGloss: boolean) => {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const abbr = (m[1] ?? '').trim()
      const gloss = compactGloss ? (m[2] ?? '').replace(/\s+/g, '').trim() : (m[2] ?? '').trim()
      if (abbr && gloss) out.push(`${abbr}：${gloss}`)
    }
  }
  pushAll(ABBREV_GLOSS_PAREN_RE, true)
  pushAll(ABBREV_GLOSS_SLASH_RE, false)
  return out
}

/** 去掉题干/选项里夹带的缩写中文提示，这类信息只应出现在解析。 */
export function stripFrontendQuizHintGloss(s: string): string {
  ABBREV_GLOSS_PAREN_RE.lastIndex = 0
  ABBREV_GLOSS_SLASH_RE.lastIndex = 0
  return String(s || '')
    .replace(ABBREV_GLOSS_PAREN_RE, '$1')
    .replace(ABBREV_GLOSS_SLASH_RE, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([，。；、])/g, '$1')
    .trim()
}

function collectAndStripGlosses(parts: string[]): { texts: string[]; glosses: string[] } {
  const glosses: string[] = []
  const seen = new Set<string>()
  const texts = parts.map((raw) => {
    for (const g of harvestAbbrevGlosses(raw)) {
      if (seen.has(g)) continue
      seen.add(g)
      glosses.push(g)
    }
    return stripFrontendQuizHintGloss(raw)
  })
  return { texts, glosses }
}

/** 讲义是否以编程操作为主（相对纯名词定义），用于决定要不要出看代码题。 */
export function frontendHandoutLooksLikeProgramming(material: string): boolean {
  const s = String(material || '')
  if (/```(?:js|javascript|ts|typescript|jsx|tsx)?\b/i.test(s)) return true
  if (/<pre[^>]*\b(hl-code|language-js|language-javascript|language-ts)/i.test(s)) return true
  const codeLines = (s.match(/^\s{0,3}(?:const|let|var|function|class|console)\b/gm) || []).length
  const tokens =
    /(?:function\s+\w+|const\s+\w+\s*=|=>\s*\{|console\.(?:log|dir)|if\s*\(|for\s*\(|\.prototype\.|class\s+\w+)/.test(s)
  return tokens && codeLines >= 3
}

function lineLooksLikeBareJs(ln: string): boolean {
  const t = ln.trim()
  if (!t) return false
  if (/^[\u4e00-\u9fff]/.test(t)) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[{};=]|function\b|const\b|let\b|var\b|=>/.test(t)) return false
  return (
    /^(?:const|let|var|function|class|console|import|export)\b/.test(t) ||
    /^(?:if|for|while|switch)\s*\(/.test(t) ||
    (/^(?:return|else|try|catch|case)\b/.test(t) && /[;{}()=]/.test(t)) ||
    /[{};]$/.test(t) ||
    /=>/.test(t) ||
    shouldPromoteJsToBlock(t) ||
    /^\s*[})\];]/.test(ln)
  )
}

function flushBareJsLines(buf: string[]): string[] {
  if (buf.length >= 2 || (buf.length === 1 && shouldPromoteJsToBlock(buf[0] ?? ''))) {
    return ['```js', ...buf, '```']
  }
  return [...buf]
}

function promoteBareJsFences(text: string): string {
  const s = String(text ?? '')
  if (!s.trim() || /```/.test(s)) return s
  const lines = s.split('\n')
  const out: string[] = []
  let buf: string[] = []
  const flush = () => {
    out.push(...flushBareJsLines(buf))
    buf = []
  }
  for (const ln of lines) {
    if (lineLooksLikeBareJs(ln) || (buf.length > 0 && !ln.trim())) buf.push(ln)
    else {
      flush()
      out.push(ln)
    }
  }
  flush()
  return out.join('\n')
}

function extractUnfencedJsLines(text: string): string {
  const lines = decodeQuizHtmlText(String(text ?? '')).split('\n')
  const chunks: string[] = []
  let buf: string[] = []
  const flush = () => {
    const kept = buf.filter((ln) => ln.trim())
    if (kept.length >= 2 || (kept.length === 1 && shouldPromoteJsToBlock(kept[0] ?? ''))) {
      chunks.push(buf.join('\n'))
    }
    buf = []
  }
  for (const ln of lines) {
    if (lineLooksLikeBareJs(ln) || (buf.length > 0 && !ln.trim())) buf.push(ln)
    else flush()
  }
  flush()
  return chunks.join('\n').trim()
}

function splitProseAndJsLines(body: string): string {
  const lines = String(body ?? '').split('\n')
  const out: string[] = []
  let buf: string[] = []
  const flush = () => {
    if (!buf.length) return
    const chunk = buf.join('\n')
    if (shouldPromoteJsToBlock(chunk) && !jsSourceLooksLikeProse(chunk)) {
      out.push('```js', ...buf, '```')
    } else {
      out.push(...buf)
    }
    buf = []
  }
  for (const ln of lines) {
    if (lineLooksLikeBareJs(ln) || (buf.length > 0 && !ln.trim())) buf.push(ln)
    else {
      flush()
      out.push(ln)
    }
  }
  flush()
  return out.join('\n')
}

/** 把误包进 ```js 的中文解析拆回正文，里面真正的程序行仍保留代码块。 */
function unwrapProseJsFences(text: string): string {
  return String(text ?? '').replace(
    /```[ \t]*(?:javascript|js|typescript|ts|jsx|tsx)?[ \t]*\r?\n([\s\S]*?)```/gi,
    (all, body: string) => {
      const src = String(body ?? '')
      if (!jsSourceLooksLikeProse(src)) return all
      return splitProseAndJsLines(src)
    },
  )
}

function repairUnmatchedInlineTicks(text: string): string {
  return String(text ?? '')
    .split(/(```[\s\S]*?```)/)
    .map((part) => {
      if (part.startsWith('```')) return part
      const ticks = part.match(/`/g)?.length ?? 0
      if (ticks % 2 === 0) return part
      return part.replace(/`([^`]*)$/, '$1')
    })
    .join('')
}

function unwrapTrivialOptionFence(text: string): string {
  const t = String(text ?? '').trim()
  const m = /^```[^\n]*\r?\n([\s\S]*?)\r?\n```$/.exec(t)
  if (!m) return t
  const inner = (m[1] ?? '').trim()
  if (!inner.includes('\n') && !shouldPromoteJsToBlock(inner)) return inner
  return t
}

export function frontendQuizPlainText(s: string): string {
  return String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const WEAK_HANDOUT_HEADING = /^(概述|简介|引言|小结|总结|目录|前言|说明|注意|备注|示例|例子|练习|导读)$/
const CORE_JS_TOPIC_RE =
  /闭包|作用域链?|词法作用域|原型链?|执行上下文|事件循环|微任务|宏任务|Promise|async|await|柯里化|防抖|节流|事件委托|高阶函数|箭头函数|立即执行|IIFE|变量提升|暂时性死区|垃圾回收|内存泄漏|深拷贝|浅拷贝|事件冒泡|\bthis\b|\b(?:call|apply|bind)\b|继承|迭代器|生成器|模块化|可选链/

function pushUniqueTitle(points: string[], raw: string, maxLen = 48): void {
  const x = frontendQuizPlainText(raw).replace(/^#+\s*/, '').trim()
  if (x.length < 2 || x.length > maxLen) return
  if (WEAK_HANDOUT_HEADING.test(x)) return
  if (points.some((p) => p === x || p.includes(x) || x.includes(p))) return
  points.push(x)
}

function extractHandoutHeadings(material: string): string[] {
  const s = String(material || '')
  const points: string[] = []
  for (const m of s.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)) pushUniqueTitle(points, m[1] ?? '')
  for (const m of s.matchAll(/^#{1,4}\s+(.+)$/gm)) pushUniqueTitle(points, m[1] ?? '')
  return points
}

function isCoreJsTopicTitle(title: string): boolean {
  return CORE_JS_TOPIC_RE.test(title.replace(/\s+/g, ''))
}

function mentionCount(haystack: string, term: string): number {
  if (!term) return 0
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
  return (String(haystack).match(re) || []).length
}

/** 从整篇讲义抽标题/加粗，供出题时先覆盖重点。 */
export function extractFrontendHandoutKeyPoints(material: string, limit = 16): string[] {
  const s = String(material || '')
  const points: string[] = extractHandoutHeadings(s)
  for (const m of s.matchAll(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi)) pushUniqueTitle(points, m[1] ?? '', 36)
  for (const m of s.matchAll(/\*\*([^*]{2,36})\*\*/g)) pushUniqueTitle(points, m[1] ?? '', 36)
  return points.slice(0, limit)
}

/** 专节/高频核心概念：必须加码（定义+易混），不能只用一道编程题打发。 */
export function extractFrontendHandoutQuizFocus(
  material: string,
  total: number,
): { cores: string[]; others: string[]; minPerCore: number; promptBlock: string } {
  const s = String(material || '')
  const headings = extractHandoutHeadings(s)
  const cores: string[] = headings.filter((h) => isCoreJsTopicTitle(h))
  const hinted = [
    '闭包',
    '作用域链',
    '词法作用域',
    '原型链',
    '执行上下文',
    '事件循环',
    '柯里化',
    '防抖',
    '节流',
    '事件委托',
    '变量提升',
    '暂时性死区',
    '高阶函数',
    '箭头函数',
  ]
  for (const term of hinted) {
    if (cores.some((c) => c.includes(term))) continue
    if (mentionCount(s, term) >= 3) cores.push(term)
  }
  const others = headings.filter((h) => !cores.some((c) => c === h || c.includes(h) || h.includes(c)))
  const minPerCore =
    cores.length === 0 ? 0 : total >= cores.length * 3 + Math.min(2, others.length) ? 3 : 2
  const coreLines = cores.map((p, i) => {
    const n = minPerCore
    return `${i + 1}. ${p} → 至少 ${n} 题：①定义/形成条件（选择或判断，禁止只用编程题）②特点/作用/易混对比③有示例再加看代码，且③不能替代①②`
  })
  const otherLines = others.slice(0, 8).map((p, i) => `${i + 1}. ${p}`)
  const promptBlock = [
    cores.length
      ? `【核心专节·必须加码】\n${coreLines.join('\n')}\n同一核心换问法重复考是正确做法，禁止「这个点已经出过一道就跳过」。`
      : '',
    otherLines.length ? `【其它专节·各至少 1 题】\n${otherLines.join('\n')}` : '',
    cores.length
      ? '编程题不得挤占核心专节的定义题：先保证每个核心的①②，再用剩余名额出看代码。'
      : '先覆盖标题/加粗/定义，再考虑其它。',
  ]
    .filter(Boolean)
    .join('\n')
  return { cores, others, minPerCore, promptBlock }
}

/** 长讲义：保留开头，并补上各重点附近的原文，避免闭包等后半段被截掉。 */
export function materialForFrontendQuiz(material: string, maxLen = 14000): string {
  const full = String(material || '')
  if (full.length <= maxLen) return full
  const keys = extractFrontendHandoutKeyPoints(full)
  const chunks: string[] = [full.slice(0, Math.min(7000, maxLen))]
  const used = new Set<number>()
  for (const key of keys) {
    let from = 0
    while (from < full.length) {
      const i = full.indexOf(key, from)
      if (i < 0) break
      const start = Math.max(0, i - 280)
      if (![...used].some((u) => Math.abs(u - start) < 400)) {
        used.add(start)
        chunks.push(full.slice(start, Math.min(full.length, i + 900)))
      }
      from = i + key.length
    }
  }
  chunks.push(full.slice(-1800))
  const joined = chunks.join('\n\n')
  return joined.length > maxLen * 1.35 ? joined.slice(0, Math.round(maxLen * 1.35)) : joined
}

export function polishFrontendQuizJargon(s: string): string {
  return String(s ?? '')
    .replace(/\bfalsy\b/gi, '假值')
    .replace(/\btruthy\b/gi, '真值')
}

function wrapPlainJsSnippet(raw: string, asHtml: boolean): string {
  if (asHtml) {
    return `<code>${raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`
  }
  return `\`${raw}\``
}

/** 正文里漏标的 JS：错误名、if (v) {} 等做成行内代码；已有围栏/反引号不动。 */
function decoratePlainJsSnippets(text: string): string {
  const asHtml = /<(?:p|div|span|br|li|strong|em)\b/i.test(text)
  const chunks = String(text ?? '').split(/(```[\s\S]*?```|<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/gi)
  return chunks
    .map((chunk) => {
      if (/^(```|<pre\b|<code\b)/i.test(chunk)) return chunk
      const bits = chunk.split(/(`[^`]*`)/g)
      return bits
        .map((bit) => {
          if (bit.startsWith('`')) return bit
          return bit
            .replace(
              /\b(ReferenceError|TypeError|SyntaxError|RangeError|URIError|EvalError)\b/g,
              (m) => wrapPlainJsSnippet(m, asHtml),
            )
            .replace(
              /\b((?:else\s+if|if|for|while)\s*\([^)]{0,80}\)\s*(?:\{\s*\})?)/g,
              (m) => wrapPlainJsSnippet(m, asHtml),
            )
            .replace(/\b(typeof\s+[A-Za-z_$][\w$]*)\b/g, (m) => wrapPlainJsSnippet(m, asHtml))
            .replace(/\b(console\.\w+\s*\([^)]{0,100}\))/g, (m) => wrapPlainJsSnippet(m, asHtml))
        })
        .join('')
    })
    .join('')
}

function unwrapQuizOptionToJs(raw: string): string {
  return String(raw ?? '')
    .replace(/```[^\n]*\n?/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

type QuizHtmlRole = 'stem' | 'option' | 'answer' | 'explanation'

function formatQuizAnswerHtml(text: string): string {
  const unwrapped = unwrapTrivialOptionFence(text)
  const src = unwrapQuizOptionToJs(unwrapped)
  if (src && isJsOnlySnippet(unwrapped) && shouldPromoteJsToBlock(src)) {
    return highlightHandoutCodeHtml(`\`\`\`js\n${src}\n\`\`\``)
  }
  const body = tidyJsFencesInMarkdown(repairSameLineFenceOpeners(normalizeJsMarkdownFences(unwrapped)))
  return highlightHandoutCodeHtml(markdownToDisplaySafeHtml(body))
}

/** 测验题干/选项/解析：Markdown + 讲义同款 JS 代码块。 */
export function formatFrontendQuizRichHtml(text: string, role: QuizHtmlRole = 'stem'): string {
  const t = polishFrontendQuizJargon(String(text ?? '').trim())
  if (!t) return ''
  const prepared = repairUnmatchedInlineTicks(unwrapProseJsFences(t))
  if (role === 'option' || role === 'answer') return formatQuizAnswerHtml(prepared)
  if (isJsOnlySnippet(prepared) && !jsSourceLooksLikeProse(prepared)) {
    const src = unwrapQuizOptionToJs(prepared)
    if (src) return highlightHandoutCodeHtml(`\`\`\`js\n${src}\n\`\`\``)
  }
  const hasFence = /```/.test(prepared)
  if (!hasFence && (/^</.test(prepared) || /<(p|pre|code|div|br|span)\b/i.test(prepared))) {
    return highlightHandoutCodeHtml(decoratePlainJsSnippets(prepared))
  }
  let body = tidyJsFencesInMarkdown(repairSameLineFenceOpeners(normalizeJsMarkdownFences(prepared)))
  if (!/```/.test(body) && !/[\u4e00-\u9fff]/.test(body) && shouldPromoteJsToBlock(body)) {
    body = `\`\`\`js\n${body}\n\`\`\``
  }
  const withCode = decoratePlainJsSnippets(promoteBareJsFences(body))
    .replace(/(?<![`\w])(Number\.(?:MIN|MAX)_(?:SAFE_)?VALUE)(?![`\w])/g, '`$1`')
    .replace(/(?<![`\w])0[xX]\s*[\/／]\s*0[xX](?![`\w])/g, '`0x`/`0X`')
  return highlightHandoutCodeHtml(markdownToDisplaySafeHtml(withCode))
}

function mergeGlossIntoExplanation(explanation: string, glosses: string[]): string {
  if (!glosses.length) return explanation
  const missing = glosses.filter((g) => {
    const abbr = g.split('：')[0] ?? ''
    return abbr && !explanation.includes(abbr)
  })
  if (!missing.length) return explanation
  const block = `缩写：${missing.join('；')}`
  return explanation ? `${explanation}\n${block}` : block
}

/** 作答过程中只展示缩写；中文全称并入解析。旧题入库后仍按此清洗。 */
export function sanitizeFrontendQuizForDisplay(q: {
  stem: string
  term?: string
  options: string[]
  correctText: string
  explanation: string
}): {
  stem: string
  term: string
  options: string[]
  correctText: string
  explanation: string
} {
  const harvested = collectAndStripGlosses([
    q.stem,
    q.term ?? '',
    q.correctText,
    ...(q.options ?? []),
  ])
  const stemRaw = attachMissingStemCode(harvested.texts[0] ?? '', q.explanation)
  return {
    stem: formatFrontendQuizRichHtml(stemRaw, 'stem'),
    term: harvested.texts[1] ?? '',
    options: (q.options ?? []).map((opt) => formatFrontendQuizRichHtml(stripFrontendQuizHintGloss(opt), 'option')),
    correctText: formatFrontendQuizRichHtml(harvested.texts[2] ?? '', 'answer'),
    explanation: formatFrontendQuizRichHtml(mergeGlossIntoExplanation(q.explanation, harvested.glosses), 'explanation'),
  }
}

export function extractFrontendQuizSources(material: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  const re = /【讲义ID:([^｜|]+)[｜|]([^】]+)】/g
  let m: RegExpExecArray | null
  while ((m = re.exec(String(material || '')))) {
    const id = (m[1] ?? '').trim()
    const label = (m[2] ?? '').trim()
    if (id && !out.some((x) => x.id === id)) out.push({ id, label })
  }
  return out
}

export function extractFrontendQuizSourceIds(material: string): string[] {
  return extractFrontendQuizSources(material).map((x) => x.id)
}

function parseKind(v: unknown): FrontendQuizKind | null {
  const t = asText(v).toLowerCase()
  if (t === 'choice' || t === '选择' || t === 'mcq') return 'choice'
  if (t === 'judge' || t === '判断' || t === 'tf' || t === 'truefalse') return 'judge'
  if (t === 'short' || t === '简答' || t === '简答题' || t === 'essay') return 'short'
  if (t === 'calc' || t === '计算' || t === '计算题') return 'calc'
  return null
}

function compactText(s: string): string {
  return s.replace(/\s+/g, '')
}

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'instanceof',
  'in', 'of', 'void', 'delete', 'async', 'await', 'yield', 'import', 'export', 'default', 'extends',
  'static', 'get', 'set', 'this', 'super', 'with', 'debugger', 'true', 'false', 'null', 'undefined',
])

const JS_BUILTINS = new Set([
  'console', 'Error', 'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'URIError',
  'JSON', 'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Promise', 'Symbol',
  'BigInt', 'Map', 'Set', 'WeakMap', 'WeakSet', 'RegExp', 'Proxy', 'Reflect', 'Intl', 'Atomics',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'NaN', 'Infinity', 'eval', 'Function',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'window', 'document', 'globalThis',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'arguments',
])

function decodeQuizHtmlText(raw: string): string {
  return String(raw ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|pre|code|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractJsFromQuizStem(stem: string): string {
  const s = normalizeJsMarkdownFences(String(stem ?? ''))
  const chunks: string[] = []
  const takeJsBody = (raw: string) => {
    const body = String(raw ?? '')
    if (jsSourceLooksLikeProse(body)) {
      const onlyJs = extractUnfencedJsLines(body)
      if (onlyJs) chunks.push(onlyJs)
      return
    }
    if (body.trim()) chunks.push(body)
  }
  for (const m of s.matchAll(/```(?:javascript|js|typescript|ts|jsx|tsx)?[ \t]*\r?\n([\s\S]*?)```/gi)) {
    takeJsBody(m[1] ?? '')
  }
  for (const m of s.matchAll(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi)) {
    takeJsBody(decodeQuizHtmlText(m[1] ?? ''))
  }
  if (!chunks.length) {
    const unfenced = extractUnfencedJsLines(s)
    if (unfenced) chunks.push(unfenced)
  }
  return chunks.join('\n')
}

function stemAsksForCodeSample(stem: string): boolean {
  const t = String(stem ?? '')
  return (
    /阅读.{0,16}代码/.test(t) ||
    /下列代码|下面这段代码|下面的代码|以下代码/.test(t) ||
    /运行.{0,12}代码/.test(t) ||
    /代码.{0,20}(输出|运行结果|打印|返回)/.test(t) ||
    /最后一行.{0,16}(输出|结果)/.test(t) ||
    /看代码/.test(t)
  )
}

function attachMissingStemCode(stem: string, explanation: string): string {
  if (!stemAsksForCodeSample(stem)) return stem
  if (extractJsFromQuizStem(stem).trim()) return stem
  const fromExp = extractJsFromQuizStem(explanation)
  if (!fromExp.trim() || jsSourceLooksLikeProse(fromExp)) return stem
  return `${String(stem).trim()}\n\n\`\`\`js\n${fromExp.trim()}\n\`\`\``
}

function stripJsStringsAndComments(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
}

function declaredJsNames(js: string): Set<string> {
  const names = new Set<string>()
  const add = (raw: string) => {
    const n = raw.trim()
    if (n) names.add(n)
  }
  for (const m of js.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) add(m[1] ?? '')
  for (const m of js.matchAll(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g)) add(m[1] ?? '')
  for (const m of js.matchAll(/\bfunction(?:\s+[A-Za-z_$][\w$]*)?\s*\(([^)]*)\)/g)) {
    for (const p of String(m[1] ?? '').split(',')) add(p.replace(/=[\s\S]*/, '').trim())
  }
  for (const m of js.matchAll(/\(([^)]*)\)\s*=>/g)) {
    for (const p of String(m[1] ?? '').split(',')) add(p.replace(/=[\s\S]*/, '').trim())
  }
  for (const m of js.matchAll(/(?:^|[^\w$])([A-Za-z_$][\w$]*)\s*=>/g)) add(m[1] ?? '')
  return names
}

function undeclaredJsIdentifiers(js: string): string[] {
  const declared = declaredJsNames(js)
  const body = stripJsStringsAndComments(js)
  const used: string[] = []
  const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    const name = m[2] ?? ''
    if (!name || JS_KEYWORDS.has(name) || JS_BUILTINS.has(name) || declared.has(name)) continue
    if (!used.includes(name)) used.push(name)
  }
  return used
}

function isRuntimeOutputQuestion(stem: string, js: string): boolean {
  const t = String(stem ?? '')
  if (/(运行后|运行结果|控制台输出|输出的是|会输出|打印出|输出什么|最后一行)/.test(t)) return true
  return /console\.log/.test(js) && /输出/.test(t)
}

function looksTruncatedJs(js: string): boolean {
  const t = js.trim()
  if (!t) return false
  if (/^[sS]\s+(?:var|let|const|function|try|console)\b/.test(t)) return true
  if (/\b(?:co|con|cons|consol|console\.[a-z]{0,2})$/.test(t)) return true
  if (/[=(,]\s*$/.test(t)) return true
  const open = (t.match(/\{/g) || []).length
  const close = (t.match(/\}/g) || []).length
  return open > close
}

function emptyErrorMessageInJs(js: string): boolean {
  if (!/\.message\b/.test(js)) return false
  const hasText = /new\s+Error\s*\(\s*['"`][^'"`]+['"`]/.test(js)
  if (hasText) return false
  return /new\s+Error\s*(?:\(|;)/.test(js)
}

function isEmptyStringAnswer(ans: string): boolean {
  const t = compactText(ans).replace(/[“”‘’]/g, '"')
  return /^(空字符串|空串|""|''|``)$/.test(t) || t === '""'
}

/** 代码题缺上下文、结果算错、解析承认不严谨 → 整题作废。 */
export function frontendQuizItemUnrigorous(input: {
  stem: string
  correctText: string
  explanation?: string
  options?: string[]
}): boolean {
  const stem = String(input.stem ?? '')
  const correct = String(input.correctText ?? '')
  const explanation = String(input.explanation ?? '')
  const js = extractJsFromQuizStem(stem)
  if (/```/.test(stem)) {
    const html = formatFrontendQuizRichHtml(stem, 'stem')
    const visible = decodeQuizHtmlText(html)
    if (/```/.test(visible)) return true
  }
  if (/严格来说.{0,24}(错|不对)|选项里没有|如果选项不包含|都是错的|都不对/.test(explanation)) return true
  if (stemAsksForCodeSample(stem) && !js.trim()) return true
  if (!js.trim()) return false
  if (looksTruncatedJs(js)) return true
  const runtime = isRuntimeOutputQuestion(stem, js)
  if (runtime && undeclaredJsIdentifiers(js).length) return true
  const ansPlain = frontendQuizPlainText(correct).replace(/^[`'"]+|[`'"]+$/g, '').trim()
  if (runtime && /[\u4e00-\u9fff]/.test(ansPlain) && !js.includes(ansPlain)) return true
  if (runtime && emptyErrorMessageInJs(js) && !isEmptyStringAnswer(correct)) return true
  return false
}

function negatedSnippets(exp: string): string[] {
  const out: string[] = []
  const re = /(并非|并不是|而不是|并不能理解为)([\u4e00-\u9fffA-Za-z0-9]{2,16})/g
  let m: RegExpExecArray | null
  while ((m = re.exec(exp))) out.push(m[2] ?? '')
  return out.filter(Boolean)
}

function mentionScore(opt: string, exp: string): number {
  const o = compactText(opt)
  if (!o) return 0
  if (negatedSnippets(exp).some((n) => n && (o.includes(n) || n.includes(o)))) return -8
  let score = 0
  if (exp.includes(o)) score += 4
  const chunks = o.match(/[\u4e00-\u9fff]{4,}/g) || []
  for (const c of chunks) {
    if (exp.includes(c)) score += 2
  }
  if (score === 0) {
    const mid = o.match(/[\u4e00-\u9fff]{3,8}/g) || []
    if (mid.some((c) => c.length >= 4 && exp.includes(c))) score += 2
  }
  if (score > 0 && (exp.includes(`是${o}`) || exp.includes(`为${o}`) || exp.includes(`应选${o}`))) {
    score += 3
  }
  return score
}

function parseQuantities(s: string): { num: string; unit: string }[] {
  const out: { num: string; unit: string }[] = []
  const re = /(\d+(?:\.\d+)?)\s*([A-Za-z]{1,5}|[兆亿万千]|位|字节|瓦)/g
  const text = String(s || '')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    out.push({ num: m[1] ?? '', unit: (m[2] ?? '').trim() })
  }
  return out.filter((x) => x.num && x.unit)
}

function normUnit(u: string): string {
  const x = u.toLowerCase()
  if (x === 'w' || x === '瓦') return 'W'
  if (x === 'kw') return 'kW'
  if (x === 'gb' || x === 'gib') return 'GB'
  if (x === 'mb' || x === 'mib') return 'MB'
  if (x === 'kb' || x === 'kib') return 'KB'
  if (x === 'bit' || x === '位') return 'bit'
  if (x === '字节') return 'B'
  return x
}

function stemAnswerQuantityClash(stem: string, answer: string): boolean {
  const a = parseQuantities(stem)
  const b = parseQuantities(answer)
  for (const x of a) {
    for (const y of b) {
      const ux = normUnit(x.unit)
      const uy = normUnit(y.unit)
      if (x.num === y.num && ux && uy && ux !== uy) return true
    }
  }
  return false
}

function optionIndexByText(options: string[], hint: string): number {
  const h = compactText(hint)
  if (!h || /^[A-Da-d]$/.test(h)) return -1
  const exact = options.findIndex((x) => compactText(x) === h)
  if (exact >= 0) return exact
  if (h.length < 4) return -1
  const contains = options.findIndex((x) => {
    const o = compactText(x)
    return o && (o.includes(h) || h.includes(o))
  })
  return contains
}

/** 解析里写「正确答案是 3」时，以这句话为准，避免标答和解析各说各的。 */
function explicitAnswerFromExplanation(explanation: string): string {
  const t = String(explanation || '')
  const m =
    t.match(/正确答案[是为：:\s]*[「『"“'`]*([^\s。．.\n,，;；」』"”'`]{1,40})/) ||
    t.match(/应选[「『"“'`]*([^\s。．.\n,，;；」』"”'`]{1,40})/)
  return (m?.[1] ?? '').replace(/^[：:\s]+/, '').trim()
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = arr[i]!
    arr[i] = arr[j]!
    arr[j] = a
  }
  return arr
}

/** 解析与标答打架时，以解析支持的选项为准；对不上则丢掉。 */
function reconcileByExplanation(options: string[], claimed: number, explanation: string): number {
  const exp = compactText(explanation)
  if (!exp) return claimed
  const scores = options.map((opt) => mentionScore(opt, exp))
  const claimedScore = claimed >= 0 && claimed < scores.length ? scores[claimed]! : -99
  let best = 0
  for (let i = 1; i < scores.length; i++) {
    if (scores[i]! > scores[best]!) best = i
  }
  const bestScore = scores[best] ?? 0
  const uniqueBest = bestScore > 0 && scores.filter((s) => s === bestScore).length === 1
  if (claimedScore < 0 && uniqueBest) return best
  if (uniqueBest && best !== claimed && (claimedScore <= 0 || bestScore >= claimedScore + 3)) {
    return best
  }
  if (claimedScore < 0) return -1
  return claimed
}

function resolveQuizSourceMeta(
  o: Record<string, unknown>,
  meta: {
    itemId: string
    itemTitle: string
    learningPath?: string[]
    allowedSources?: { id: string; label: string }[]
    allowedSourceIds?: string[]
  },
): { itemId: string; itemTitle: string; learningPath?: string[] } {
  const claimed = asText(o.sourceId ?? o.handoutId)
  const sources = meta.allowedSources?.length
    ? meta.allowedSources
    : (meta.allowedSourceIds ?? []).map((id) => ({ id, label: '' }))
  const hit = sources.find((s) => s.id === claimed)
  if (!hit) {
    return { itemId: meta.itemId, itemTitle: meta.itemTitle, learningPath: meta.learningPath }
  }
  const parts = hit.label.split('/').map((s) => s.trim()).filter(Boolean)
  const title = asText(o.sourceTitle) || parts.pop() || meta.itemTitle
  return {
    itemId: hit.id,
    itemTitle: title,
    learningPath: parts.length ? parts : meta.learningPath,
  }
}

export function parseFrontendQuizAiItem(
  raw: unknown,
  meta: {
    itemId: string
    itemTitle: string
    learningPath?: string[]
    allowedSources?: { id: string; label: string }[]
    allowedSourceIds?: string[]
  },
): FrontendQuizQuestion | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const kind = parseKind(o.kind ?? o.type ?? o.questionType)
  if (!kind) return null
  const harvested = collectAndStripGlosses([
    polishFrontendQuizJargon(asText(o.stem ?? o.question ?? o.title)),
    polishFrontendQuizJargon(asText(o.term ?? o.point ?? o.考点)),
    polishFrontendQuizJargon(asText(o.correct ?? o.answer ?? o.correctText)),
    ...(Array.isArray(o.options) ? o.options.map((x) => polishFrontendQuizJargon(asText(x))) : []),
    ...(Array.isArray(o.choices) ? o.choices.map((x) => polishFrontendQuizJargon(asText(x))) : []),
    ...(Array.isArray(o.distractors) ? o.distractors.map((x) => polishFrontendQuizJargon(asText(x))) : []),
  ])
  const stem = harvested.texts[0] ?? ''
  const termIn = harvested.texts[1] ?? ''
  const correctHintIn = harvested.texts[2] ?? ''
  let explanation = polishFrontendQuizJargon(
    mergeGlossIntoExplanation(asText(o.explanation ?? o.explain ?? o.parse), harvested.glosses),
  )
  const term = termIn || stem.slice(0, 24)
  if (stem.length < 6) return null
  const source = resolveQuizSourceMeta(o, meta)
  const learningPath = (source.learningPath ?? []).map((s) => String(s).trim()).filter(Boolean)

  if (kind === 'calc' || kind === 'short') {
    let nextKind = kind
    const correctText = correctHintIn
    if (!correctText) return null
    if (
      nextKind === 'calc' &&
      compactText(correctText).length > 48 &&
      /[\u4e00-\u9fff]{12,}/.test(correctText)
    ) {
      nextKind = 'short'
    }
    if (frontendQuizItemUnrigorous({ stem, correctText, explanation })) return null
    return {
      fingerprint: buildFrontendQuizFingerprint({ kind: nextKind, stem, correctText }),
      kind: nextKind,
      term,
      stem,
      options: [],
      correctIndex: 0,
      correctText,
      explanation,
      itemId: source.itemId,
      itemTitle: source.itemTitle,
      learningPath,
    }
  }

  const distractorsRaw = Array.isArray(o.distractors)
    ? o.distractors.map((x) => stripFrontendQuizHintGloss(asText(x))).filter(Boolean)
    : []
  const optsRaw = o.options ?? o.choices
  let options = Array.isArray(optsRaw)
    ? optsRaw.map((x) => stripFrontendQuizHintGloss(asText(x))).filter(Boolean)
    : []
  const correctHint = correctHintIn

  if (kind === 'judge') {
    if (options.length < 2) options = ['正确', '错误']
    options = options.slice(0, 2)
  } else {
    if (correctHint && distractorsRaw.length >= 3 && options.length < 4) {
      options = [correctHint, ...distractorsRaw].filter(Boolean)
    }
    const uniq: string[] = []
    for (const x of options) {
      if (!uniq.some((u) => compactText(u) === compactText(x))) uniq.push(x)
    }
    options = uniq.slice(0, 4)
    if (options.length < 4) return null
  }

  let correctIndex = optionIndexByText(options, correctHint)
  if (correctIndex < 0 && kind === 'judge') {
    if (/^(正确|对|true|t|√|是)$/i.test(correctHint)) correctIndex = options.findIndex((x) => /正确|对/.test(x))
    if (/^(错误|错|false|f|×|否)$/i.test(correctHint)) correctIndex = options.findIndex((x) => /错误|错/.test(x))
  }
  const explHint = explicitAnswerFromExplanation(explanation)
  if (explHint) {
    const explIdx = optionIndexByText(options, explHint)
    if (explIdx >= 0) {
      if (kind === 'choice' && correctIndex >= 0 && explIdx !== correctIndex) {
        correctIndex = explIdx
      } else if (correctIndex < 0) {
        correctIndex = explIdx
      } else if (kind === 'judge' && explIdx !== correctIndex) {
        return null
      }
    } else if (kind === 'choice' && correctIndex >= 0) {
      const claimed = compactText(options[correctIndex] ?? '')
      const named = compactText(explHint)
      if (claimed && named && claimed !== named && !claimed.includes(named) && !named.includes(claimed)) {
        return null
      }
    }
  }
  // 选择题不用 A/B/C/D 下标：模型常把错误项放第一位却写 correct:"A"
  if (kind === 'choice' && (!explHint || optionIndexByText(options, explHint) < 0)) {
    correctIndex = reconcileByExplanation(options, correctIndex, explanation)
  }
  if (correctIndex < 0 || correctIndex >= options.length) return null

  const correctText = options[correctIndex] ?? ''
  if (!correctText) return null
  if (kind === 'judge' && judgeExplanationConflictsCorrect(correctText, explanation)) return null
  if (kind === 'choice' && stemAnswerQuantityClash(stem, correctText)) return null
  if (frontendQuizItemUnrigorous({ stem, correctText, explanation, options })) return null
  if (kind === 'choice') {
    const rest = options.filter((_, i) => i !== correctIndex)
    options = shuffleInPlace([correctText, ...rest])
    correctIndex = options.findIndex((x) => compactText(x) === compactText(correctText))
    if (correctIndex < 0) return null
  }

  return {
    fingerprint: buildFrontendQuizFingerprint({ kind, stem, correctText }),
    kind,
    term,
    stem,
    options,
    correctIndex,
    correctText,
    explanation,
    itemId: source.itemId,
    itemTitle: source.itemTitle,
    learningPath,
  }
}

export function normalizeCalcAnswer(s: string): string {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[。．.、,，;；:：]/g, '')
    .replace(/[（）()【】\[\]]/g, '')
    .toLowerCase()
}

function extractCalcCores(correct: string): string[] {
  const raw = String(correct ?? '').trim()
  const compact = normalizeCalcAnswer(raw)
  const out = new Set<string>()
  if (compact) out.add(compact)
  for (const m of raw.match(/[+-]?\d+(?:\.\d+)?/g) ?? []) {
    const n = normalizeCalcAnswer(m)
    if (n.length >= 1) out.add(n)
  }
  for (const m of raw.match(/[01]{4,}/g) ?? []) out.add(m)
  for (const m of raw.match(/[0-9a-fA-F]+[hH]/g) ?? []) out.add(m.toLowerCase())
  return [...out]
}

/** 计算题：用户输入里包含标准结果即可，允许前后多写说明。 */
export function calcAnswerMatches(user: string, correct: string): boolean {
  const u = normalizeCalcAnswer(user)
  const c = normalizeCalcAnswer(correct)
  if (!u || !c) return false
  if (u === c) return true
  if (u.includes(c)) return true
  return extractCalcCores(correct).some((core) => {
    if (!core) return false
    if (core.length >= 2) return u.includes(core)
    return u === core
  })
}
