import DOMPurify from 'dompurify'

const SANITIZE_OPTS = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['class', 'target', 'rel', 'colspan', 'rowspan', 'align', 'src', 'alt'],
  ADD_DATA_URI_TAGS: ['img'],
}

export function sanitizeMarkdownHtml(raw: string): string {
  return String(DOMPurify.sanitize(raw, SANITIZE_OPTS))
}
