import { marked } from 'marked'
import { normalizeMarkdownForRender } from '@/utils/markdownNormalize'
import { sanitizeMarkdownHtml } from '@/utils/markdownSanitize'

marked.setOptions({
  gfm: true,
  breaks: true,
})

export const MD_TABLE_SCROLL_CLASS = 'md-table-scroll'

/** 给表格套滚动容器，预览时单元格保底宽度、超出在表底横向滚动 */
export function wrapHtmlTablesForScroll(html: string): string {
  const raw = String(html ?? '')
  if (!raw.toLowerCase().includes('<table')) return raw
  if (typeof DOMParser === 'undefined') return raw
  const doc = new DOMParser().parseFromString(`<div id="__md_root">${raw}</div>`, 'text/html')
  const root = doc.getElementById('__md_root')
  if (!root) return raw
  for (const table of [...root.querySelectorAll('table')]) {
    const parent = table.parentElement
    if (parent?.classList.contains(MD_TABLE_SCROLL_CLASS) && parent.childElementCount === 1) continue
    const wrap = doc.createElement('div')
    wrap.className = MD_TABLE_SCROLL_CLASS
    parent?.insertBefore(wrap, table)
    wrap.appendChild(table)
  }
  return root.innerHTML
}

/** 将 Markdown 转为可安全插入 v-html 的 HTML */
export function markdownToDisplaySafeHtml(md: string): string {
  const text = normalizeMarkdownForRender((md ?? '').trim())
  if (!text) return ''
  const raw = marked.parse(text, { async: false }) as string
  return wrapHtmlTablesForScroll(sanitizeMarkdownHtml(raw))
}
