import { highlightTs } from '@/utils/dsa/highlightTs'
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

/** 给讲义里的 JS/TS 代码块套上与编辑器一致的 token 高亮。 */
export function highlightHandoutCodeHtml(html: string): string {
  return String(html ?? '').replace(PRE_CODE_RE, (_all, preAttrs: string, codeAttrs: string, inner: string) => {
    const cls = `${classOf(preAttrs)} ${classOf(codeAttrs)}`.trim()
    const looksJs = isJsLang(cls) || /\bhl-code\b/i.test(`${preAttrs} ${cls}`)
    if (!looksJs) return _all
    const source = tidyJsFenceBody(decodeHandoutCodeHtml(inner), { expand: false })
    const highlighted = highlightTs(source)
    return `<pre class="hl-code"><code class="language-js">${highlighted || escapeHtml(source)}</code></pre>`
  })
}
