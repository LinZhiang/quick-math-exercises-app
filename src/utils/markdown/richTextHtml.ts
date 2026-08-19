import DOMPurify from 'dompurify'

const SANITIZE_OPTS: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'],
  ADD_ATTR: ['class', 'style', 'src', 'alt', 'width', 'height', 'target', 'rel', 'colspan', 'rowspan', 'align'],
  ADD_DATA_URI_TAGS: ['img'],
  ALLOW_DATA_ATTR: false,
}

export function sanitizeRichHtml(raw: string): string {
  return String(DOMPurify.sanitize(raw ?? '', SANITIZE_OPTS))
}

export function richHtmlIsEmpty(html: string): boolean {
  const sanitized = sanitizeRichHtml(html)
  const text = sanitized
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return !text && !/<img\b/i.test(sanitized)
}

export function escapeHtmlText(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function plainTextToRichHtml(text: string): string {
  const t = String(text ?? '').trim()
  if (!t) return ''
  return sanitizeRichHtml(
    t
      .split(/\n+/)
      .map((line) => `<p>${escapeHtmlText(line)}</p>`)
      .join(''),
  )
}

export function richHtmlPlainText(html: string, maxLen = 80): string {
  const text = sanitizeRichHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen)}…`
}
