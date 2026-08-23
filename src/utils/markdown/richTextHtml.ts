import DOMPurify from 'dompurify'

const SANITIZE_OPTS: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true },
  ADD_TAGS: [
    'img',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col',
    'aside',
  ],
  ADD_ATTR: [
    'class',
    'style',
    'src',
    'alt',
    'width',
    'height',
    'target',
    'rel',
    'colspan',
    'rowspan',
    'align',
    'contenteditable',
    'hidden',
  ],
  ADD_DATA_URI_TAGS: ['img'],
  ALLOW_DATA_ATTR: false,
}

export function sanitizeRichHtml(raw: string): string {
  return String(DOMPurify.sanitize(raw ?? '', SANITIZE_OPTS))
}

function isEmptyRichElement(el: Element): boolean {
  if (el.matches('aside, .cb-handout-note')) return false
  if (el.querySelector('img, table, video, canvas, iframe, aside, .cb-handout-note')) return false
  return !(el.textContent || '').replace(/\u00a0/g, ' ').trim()
}

/** 去掉文末连续空段，避免 Backspace 后底下还剩一大截空白。 */
export function compactTrailingEmptyHtml(html: string): string {
  const sanitized = sanitizeRichHtml(html)
  if (typeof document === 'undefined') return sanitized
  const wrap = document.createElement('div')
  wrap.innerHTML = sanitized
  while (wrap.lastChild) {
    const last = wrap.lastChild
    if (last.nodeType === Node.TEXT_NODE && !(last.textContent || '').trim()) {
      wrap.removeChild(last)
      continue
    }
    if (last.nodeName === 'BR') {
      wrap.removeChild(last)
      continue
    }
    if (last.nodeType === Node.ELEMENT_NODE && isEmptyRichElement(last as Element)) {
      wrap.removeChild(last)
      continue
    }
    break
  }
  return wrap.innerHTML.trim()
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

export function richHtmlToPlainMultiline(html: string): string {
  if (typeof document === 'undefined') return richHtmlPlainText(html, 8000)
  const wrap = document.createElement('div')
  wrap.innerHTML = sanitizeRichHtml(html)
  return (wrap.innerText || wrap.textContent || '').replace(/\u00a0/g, ' ').trim()
}

export function buildHandoutNoteHtml(title: string, bodyPlain = ''): string {
  const tab = escapeHtmlText((title.trim() || '备注').slice(0, 24))
  const body = plainTextToRichHtml(bodyPlain)
  return `<aside class="cb-handout-note" contenteditable="false"><span class="cb-handout-note__tab">${tab}</span><div class="cb-handout-note__body">${body}</div></aside>`
}
