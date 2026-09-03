import { highlightTs } from '@/utils/dsa/highlightTs'

const JS_LANG = /^(js|javascript|ts|typescript|jsx|tsx)$/i
const PRE_CODE_RE = /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function classOf(attrs: string): string {
  const m = /class=(["'])(.*?)\1/i.exec(attrs)
  return m?.[2] ?? ''
}

/** 给讲义里的 JS/TS 代码块套上与编辑器一致的 token 高亮。 */
export function highlightHandoutCodeHtml(html: string): string {
  return String(html ?? '').replace(PRE_CODE_RE, (all, preAttrs: string, codeAttrs: string, inner: string) => {
    if (/tok-/.test(inner)) return all
    const cls = `${classOf(preAttrs)} ${classOf(codeAttrs)}`.trim()
    const lang = (cls.match(/language-([A-Za-z0-9_+-]+)/i)?.[1] || cls.match(/\b(js|javascript|ts|typescript|jsx|tsx)\b/i)?.[1] || '').toLowerCase()
    if (!JS_LANG.test(lang)) return all
    const highlighted = highlightTs(decodeHtmlText(inner))
    const nextCodeClass = cls.includes('language-') ? cls : `language-js ${cls}`.trim()
    return `<pre class="hl-code"${preAttrs.replace(/\sclass=(["']).*?\1/i, '')}><code class="${nextCodeClass}">${highlighted}</code></pre>`
  })
}
