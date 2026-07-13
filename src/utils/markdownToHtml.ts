import { marked } from 'marked'
import { normalizeMarkdownForRender } from '@/utils/markdownNormalize'
import { sanitizeMarkdownHtml } from '@/utils/markdownSanitize'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/** 将 Markdown 转为可安全插入 v-html 的 HTML */
export function markdownToDisplaySafeHtml(md: string): string {
  const text = normalizeMarkdownForRender((md ?? '').trim())
  if (!text) return ''
  const raw = marked.parse(text, { async: false }) as string
  return sanitizeMarkdownHtml(raw)
}
