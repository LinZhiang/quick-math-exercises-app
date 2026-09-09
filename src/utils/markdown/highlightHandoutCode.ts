import { highlightTs } from '@/utils/dsa/highlightTs'
import { wrapHtmlTablesForScroll } from '@/utils/markdown/markdownToHtml'
import { unwrapNumericStrikethroughHtml } from '@/utils/markdown/markdownNormalize'
import {
  normalizeJsMarkdownFences,
  prepareJsBlockSource,
  stripJsLangPrefix,
  tidyJsFencesInMarkdown,
} from '@/utils/markdown/tidyJsCode'

const JS_LANG = /^(js|javascript|ts|typescript|jsx|tsx)$/i
const FENCE_LANG = /^(js|javascript|ts|typescript|jsx|tsx|css|html|vue|xml|json|bash|sh|shell)$/i
const PRE_CODE_RE = /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi

export function decodeHandoutCodeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function classOf(attrs: string): string {
  const m = /class=(["'])(.*?)\1/i.exec(attrs)
  return m?.[2] ?? ''
}

function langOf(cls: string): string {
  return (
    cls.match(/language-([A-Za-z0-9_+-]+)/i)?.[1] ||
    cls.match(/\b(js|javascript|ts|typescript|jsx|tsx|css|html|vue|xml|json|bash|sh|shell)\b/i)?.[1] ||
    ''
  ).toLowerCase()
}

function isJsLang(cls: string): boolean {
  return JS_LANG.test(langOf(cls))
}

function isFenceLang(cls: string): boolean {
  return FENCE_LANG.test(langOf(cls))
}

function highlightCodeSource(source: string, lang: string): string {
  const js = JS_LANG.test(lang)
  const body = js ? prepareJsBlockSource(source, { expand: false }) : String(source ?? '').replace(/\t/g, '  ')
  if (js) {
    if (!looksLikeJsSource(body)) return escapeHtml(body)
    return highlightTs(body) || escapeHtml(body)
  }
  const compact = body.replace(/\s+/g, '')
  const han = (compact.match(/[\u4e00-\u9fff]/g) || []).length
  if (han / Math.max(compact.length, 1) >= 0.4) return escapeHtml(body)
  return highlightTs(body) || escapeHtml(body)
}

function wrapCodeBlock(source: string, lang: string): string {
  const name = lang || 'js'
  const highlighted = highlightCodeSource(source, name)
  return `<div class="md-table-scroll"><pre class="hl-code"><code class="language-${name}">${highlighted}</code></pre></div>`
}

/** 程序结构：即便注释/字符串是中文，仍按代码块展示。 */
function looksLikeStructuredJs(source: string): boolean {
  const t = source.trim()
  if (/^(?:function|class|const|let|var|if|for|while|switch|try|async|return)\b/.test(t)) return true
  if (/\/\*[\s\S]*\*\//.test(t) && /(?:function\b|=>|[{}();=])/.test(t)) return true
  const tokens = (t.match(/\b(?:function|const|let|var|return|console|typeof|class)\b/g) || []).length
  const punct = (t.match(/[{};=]/g) || []).length
  return tokens >= 2 && punct >= 2
}

/** 中文讲解误进代码块：汉字多、或汉字占比高，不当成 JS 程序。 */
export function jsSourceLooksLikeProse(source: string): boolean {
  const t = String(source ?? '').trim()
  if (!t) return false
  const han = (t.match(/[\u4e00-\u9fff]/g) || []).length
  if (!han) return false
  if (/^(正确|错误|答案|解析|因此|所以|因为|对于)/.test(t) && han >= 8) return true
  if (looksLikeStructuredJs(t)) return false
  const compact = t.replace(/\s+/g, '')
  const ratio = han / Math.max(compact.length, 1)
  if (/^(正确|错误|答案|解析|因此|所以|因为|对于)/.test(t) && han >= 4) return true
  if (han >= 10 && ratio >= 0.18) return true
  if (han >= 6 && ratio >= 0.28) return true
  return false
}

function looksLikeJsSource(source: string): boolean {
  const t = source.trim()
  if (!t) return false
  if (jsSourceLooksLikeProse(t)) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[;={}()=<>+\-*/&|!?]/.test(t)) return false
  return /[A-Za-z_$0-9;={}()+\-*/<>!&|?:`'"]/.test(t)
}

/** 只有真正的程序片段才升成黑底代码块；短关键字/表达式保持行内红底。 */
export function shouldPromoteJsToBlock(source: string): boolean {
  const t = stripJsLangPrefix(String(source ?? '')).trim()
  if (!t || t.length > 4000) return false
  if (jsSourceLooksLikeProse(t)) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[;={}()]/.test(t)) return false
  const lines = t.split(/\n/).filter((ln) => ln.trim())
  if (lines.length >= 2 && looksLikeJsSource(t)) return true
  if (/\b(?:try|function|class|async)\b/.test(t) && /\{/.test(t)) return true
  if (/^(?:if|for|while|switch)\s*\(/.test(t) && /[{};]/.test(t) && t.length >= 12) return true
  if (/^(?:const|let|var)\b/.test(t) && /[=;]/.test(t) && t.length >= 16) return true
  if (/^console\.\w+\s*\(/.test(t) && t.length >= 16) return true
  if ((t.match(/;/g) || []).length >= 2) return true
  if (t.length >= 48 && /[{}]/.test(t) && /;/.test(t)) return true
  return false
}

/** 选项/片段去掉标签后是否整段都是 JS（用于强制黑底代码块）。 */
export function isJsOnlySnippet(raw: string): boolean {
  const t = stripJsLangPrefix(
    String(raw ?? '')
      .replace(/```[^\n]*\n?/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&'),
  )
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length < 6) return false
  if (jsSourceLooksLikeProse(t) || /[\u4e00-\u9fff]/.test(t)) return false
  if (/^[\d.\s+\-eE]+$/.test(t)) return false
  if (/^(true|false|null|undefined|NaN)$/i.test(t)) return false
  return /[{};=]|function\b|\b(?:if|for|while|switch|return|console|const|let|var)\b|\(.*\)/.test(t)
}

function highlightJsSource(source: string): string {
  return highlightCodeSource(source, 'js')
}

function buildHighlightedPre(doc: Document, source: string): HTMLElement {
  const wrap = doc.createElement('div')
  wrap.className = 'md-table-scroll'
  const pre = doc.createElement('pre')
  pre.className = 'hl-code'
  const code = doc.createElement('code')
  code.className = 'language-js'
  code.innerHTML = highlightJsSource(source)
  pre.appendChild(code)
  wrap.appendChild(pre)
  return wrap
}

function isElement(node: Node, tag: string): node is HTMLElement {
  return node.nodeType === 1 && (node as HTMLElement).tagName.toLowerCase() === tag
}

function mergeAdjacentInlineCodes(root: HTMLElement) {
  for (const host of root.querySelectorAll('p, li, td, th, h2, h3, h4, blockquote, div')) {
    let child = host.firstChild
    while (child) {
      if (!isElement(child, 'code') || child.closest('pre')) {
        child = child.nextSibling
        continue
      }
      let glue = ''
      const drop: ChildNode[] = []
      let n = child.nextSibling
      while (n && n.nodeType === 3) {
        glue += n.textContent ?? ''
        drop.push(n)
        n = n.nextSibling
      }
      if (!n || !isElement(n, 'code') || n.closest('pre')) {
        child = child.nextSibling
        continue
      }
      if (!/^(\s*|\/\/\s*)$/.test(glue)) {
        child = child.nextSibling
        continue
      }
      child.textContent = `${child.textContent ?? ''}${glue}${n.textContent ?? ''}`
      for (const node of drop) node.remove()
      n.remove()
      continue
    }
  }
}

function promoteInlineJs(root: HTMLElement, doc: Document) {
  for (const code of [...root.querySelectorAll('code')]) {
    if (code.closest('pre')) continue
    const source = stripJsLangPrefix(decodeHandoutCodeHtml(code.innerHTML))
    if (!source.trim()) continue
    if (shouldPromoteJsToBlock(source) || isJsOnlySnippet(source)) {
      const wrap = buildHighlightedPre(doc, source)
      const parent = code.parentElement
      const onlyChild =
        parent &&
        ['P', 'LI', 'DIV'].includes(parent.tagName) &&
        [...parent.childNodes].every(
          (n) => n === code || (n.nodeType === 3 && !String(n.textContent ?? '').trim()),
        )
      if (onlyChild && parent) parent.replaceWith(wrap)
      else if (shouldPromoteJsToBlock(source) && source.includes('\n')) code.replaceWith(wrap)
      continue
    }
    if (source !== (code.textContent ?? '')) code.textContent = source
  }
}

/** 编辑器插入的 JS 代码块（深色高亮，和讲义展示一致）。不要改写用户原文。 */
export function buildJsCodeBlockHtml(code: string): string {
  const body = stripJsLangPrefix(code)
  const highlighted = highlightTs(body) || escapeHtml(body)
  return `<div class="md-table-scroll"><pre class="hl-code"><code class="language-js">${highlighted}</code></pre></div>`
}

export function jsSourceFromPre(pre: HTMLElement): string {
  const code = pre.querySelector('code')
  return stripJsLangPrefix(decodeHandoutCodeHtml(code?.innerHTML ?? pre.innerHTML))
}

function materializeMarkdownFences(html: string): string {
  if (!html.includes('```')) return html
  const normalized = tidyJsFencesInMarkdown(normalizeJsMarkdownFences(html))
  return normalized.replace(
    /```[ \t]*(javascript|js|typescript|ts|jsx|tsx|css|html|vue|xml|json|bash|sh|shell)?[ \t]*\r?\n([\s\S]*?)```/gi,
    (_all, lang: string | undefined, body: string) => {
      const rawLang = String(lang || '').toLowerCase()
      const source = String(body ?? '')
      if (JS_LANG.test(rawLang) || !rawLang) {
        const prepared = prepareJsBlockSource(source, { expand: false })
        if (!rawLang && jsSourceLooksLikeProse(prepared)) {
          return escapeHtml(prepared.trim()).replace(/\n/g, '<br>')
        }
        if (!shouldPromoteJsToBlock(prepared) && !prepared.includes('\n') && !isJsOnlySnippet(prepared)) {
          return `<code>${escapeHtml(prepared.trim())}</code>`
        }
        return wrapCodeBlock(prepared, rawLang || 'js')
      }
      return wrapCodeBlock(source, rawLang)
    },
  )
}

/** 给讲义/测验里的 JS 代码块套上黑底高亮；短表达式保持原来的行内样式。 */
export function highlightHandoutCodeHtml(html: string): string {
  const replaced = materializeMarkdownFences(String(html ?? '')).replace(
    PRE_CODE_RE,
    (_all, preAttrs: string, codeAttrs: string, inner: string) => {
      const cls = `${classOf(preAttrs)} ${classOf(codeAttrs)}`.trim()
      const decoded = decodeHandoutCodeHtml(inner)
      const lang = langOf(cls)
      const markedFence = isFenceLang(cls) || /\bhl-code\b/i.test(`${preAttrs} ${cls}`)
      const markedJs = isJsLang(cls) || /\bhl-code\b/i.test(`${preAttrs} ${cls}`)
      if (markedFence && !JS_LANG.test(lang || 'js')) {
        return wrapCodeBlock(decoded, lang || 'css')
      }
      const looksJs = markedJs || looksLikeJsSource(stripJsLangPrefix(decoded))
      if (!looksJs) {
        if (markedFence) return wrapCodeBlock(decoded, lang || 'txt')
        return _all
      }
      const source = prepareJsBlockSource(decoded, { expand: false })
      if (!markedJs && jsSourceLooksLikeProse(source)) {
        return `<p>${escapeHtml(source.trim()).replace(/\n/g, '<br>')}</p>`
      }
      if (
        !shouldPromoteJsToBlock(source) &&
        !isJsOnlySnippet(source) &&
        !(markedJs && (source.includes('\n') || source.length >= 24))
      ) {
        return `<code>${escapeHtml(source.trim())}</code>`
      }
      return wrapCodeBlock(source, lang || 'js')
    },
  )
  if (typeof DOMParser === 'undefined') return unwrapNumericStrikethroughHtml(replaced)
  const doc = new DOMParser().parseFromString(`<div id="__hl_root">${replaced}</div>`, 'text/html')
  const root = doc.getElementById('__hl_root')
  if (!root) return unwrapNumericStrikethroughHtml(replaced)
  mergeAdjacentInlineCodes(root)
  promoteInlineJs(root, doc)
  return wrapHtmlTablesForScroll(unwrapNumericStrikethroughHtml(root.innerHTML))
}
