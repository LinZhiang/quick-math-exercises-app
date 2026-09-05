import { highlightTs } from '@/utils/dsa/highlightTs'
import { wrapHtmlTablesForScroll } from '@/utils/markdown/markdownToHtml'
import { tidyJsFenceBody } from '@/utils/markdown/tidyJsCode'

const JS_LANG = /^(js|javascript|ts|typescript|jsx|tsx)$/i
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

function isJsLang(cls: string): boolean {
  const lang = (
    cls.match(/language-([A-Za-z0-9_+-]+)/i)?.[1] ||
    cls.match(/\b(js|javascript|ts|typescript|jsx|tsx)\b/i)?.[1] ||
    ''
  ).toLowerCase()
  return JS_LANG.test(lang)
}

function looksLikeJsSource(source: string): boolean {
  const t = source.trim()
  if (!t) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[;={}()=<>+\-*/&|!?]/.test(t)) return false
  return /[A-Za-z_$0-9;={}()+\-*/<>!&|?:`'"]/.test(t)
}

/** 赋值、比较、语句等应升成黑底代码块；短标识符/运算符保持行内黑底。 */
export function shouldPromoteJsToBlock(source: string): boolean {
  const t = String(source ?? '').trim()
  if (!t || t.length > 500) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[;={}()]/.test(t)) return false
  if (/^(?:const|let|var|function|class|import|export)\b/.test(t)) return true
  if (/;/.test(t)) return true
  if (t.length >= 6 && /===|!==|&&|\|\||=>/.test(t)) return true
  if (/=/.test(t) && t.length >= 5) return true
  if (t.length >= 5 && /['"`]/.test(t) && /[+\-*/%]/.test(t)) return true
  if (/\n/.test(t) && looksLikeJsSource(t)) return true
  return false
}

function highlightJsSource(source: string): string {
  const body = tidyJsFenceBody(source, { expand: false })
  if (!looksLikeJsSource(body)) return escapeHtml(body)
  return highlightTs(body) || escapeHtml(body)
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
    const source = decodeHandoutCodeHtml(code.innerHTML)
    if (!source.trim()) continue
    if (shouldPromoteJsToBlock(source)) {
      const wrap = buildHighlightedPre(doc, source)
      const parent = code.parentElement
      const onlyChild =
        parent &&
        ['P', 'LI'].includes(parent.tagName) &&
        [...parent.childNodes].every(
          (n) => n === code || (n.nodeType === 3 && !String(n.textContent ?? '').trim()),
        )
      if (onlyChild && parent) parent.replaceWith(wrap)
      else code.replaceWith(wrap)
      continue
    }
    code.classList.add('hl-inline')
    if (looksLikeJsSource(source)) code.innerHTML = highlightJsSource(source)
  }
}

/** 编辑器插入的 JS 代码块（深色高亮，和讲义展示一致）。 */
export function buildJsCodeBlockHtml(code: string): string {
  const body = tidyJsFenceBody(code)
  const highlighted = highlightTs(body)
  return `<div class="md-table-scroll"><pre class="hl-code"><code class="language-js">${highlighted}</code></pre></div>`
}

export function jsSourceFromPre(pre: HTMLElement): string {
  const code = pre.querySelector('code')
  return tidyJsFenceBody(decodeHandoutCodeHtml(code?.innerHTML ?? pre.innerHTML), { expand: false })
}

/** 给讲义/测验里的 JS 代码块和行内表达式套上黑底高亮。 */
export function highlightHandoutCodeHtml(html: string): string {
  const replaced = String(html ?? '').replace(
    PRE_CODE_RE,
    (_all, preAttrs: string, codeAttrs: string, inner: string) => {
      const cls = `${classOf(preAttrs)} ${classOf(codeAttrs)}`.trim()
      const looksJs = isJsLang(cls) || /\bhl-code\b/i.test(`${preAttrs} ${cls}`)
      if (!looksJs) return _all
      const source = tidyJsFenceBody(decodeHandoutCodeHtml(inner), { expand: false })
      const highlighted = highlightTs(source)
      return `<div class="md-table-scroll"><pre class="hl-code"><code class="language-js">${highlighted || escapeHtml(source)}</code></pre></div>`
    },
  )
  if (typeof DOMParser === 'undefined') return replaced
  const doc = new DOMParser().parseFromString(`<div id="__hl_root">${replaced}</div>`, 'text/html')
  const root = doc.getElementById('__hl_root')
  if (!root) return replaced
  mergeAdjacentInlineCodes(root)
  promoteInlineJs(root, doc)
  return wrapHtmlTablesForScroll(root.innerHTML)
}
