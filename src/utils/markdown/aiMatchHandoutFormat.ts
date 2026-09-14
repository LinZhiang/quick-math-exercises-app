import { aiChatCompletion } from '@/services/ai'
import { parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/app/aiJsonParse'
import { getAiProvider } from '@/utils/app/aiProviderStore'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

/** 输出还要完整排完全文，分块宜短于模型上限，避免 JSON/正文被截断。 */
const FORMAT_CHUNK_CHARS = 5000

function asText(v: unknown): string {
  return String(v ?? '')
    .replace(/^```(?:markdown|md|html|json)?\s*/i, '')
    .replace(/\s*```$/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function plainLen(s: string): number {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '').length
}

function looksLikeHtml(s: string): boolean {
  const t = String(s || '').trimStart()
  return /^<!doctype/i.test(t) || /<(?:h[1-6]|p|div|ul|ol|pre|section|article|table|blockquote)\b/i.test(t.slice(0, 480))
}

function salvageMarkdownField(raw: string): string {
  const m = /"(?:markdown|text|content|html)"\s*:\s*"/i.exec(raw)
  if (!m || m.index == null) return ''
  let i = m.index + m[0].length
  let out = ''
  while (i < raw.length) {
    const ch = raw[i]
    if (ch === '\\' && i + 1 < raw.length) {
      const n = raw[i + 1]
      const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\', '/': '/' }
      out += map[n] ?? n
      i += 2
      continue
    }
    if (ch === '"') break
    out += ch
    i += 1
  }
  return out.trim()
}

function extractFormatResult(raw: string): string {
  const text = String(raw || '').trim()
  if (!text) return ''
  const obj = parseAiJsonObjectLenient(text)
  if (obj && typeof obj === 'object') {
    const rec = obj as Record<string, unknown>
    const fromJson = asText(rec.markdown ?? rec.text ?? rec.content ?? rec.html)
    if (fromJson) return fromJson
  }
  const salvaged = salvageMarkdownField(text)
  if (salvaged) return salvaged
  const fenced = text.match(/```(?:markdown|md|html)?\s*\r?\n([\s\S]*?)```/i)
  if (fenced?.[1]?.trim()) return fenced[1].trim()
  const stripped = stripAiJsonFence(text)
  if (stripped.startsWith('{')) {
    const body = stripped.search(/\n#\s|<(?:h[1-6]|p|pre|ul)\b/i)
    if (body >= 0) return asText(stripped.slice(body))
  }
  return asText(stripped)
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  const kids = () => [...el.childNodes].map(serializeNode).join('')
  if (tag === 'h1') return `\n\n# ${el.textContent?.trim() || ''}\n\n`
  if (tag === 'h2') return `\n\n## ${el.textContent?.trim() || ''}\n\n`
  if (tag === 'h3') return `\n\n### ${el.textContent?.trim() || ''}\n\n`
  if (tag === 'h4') return `\n\n#### ${el.textContent?.trim() || ''}\n\n`
  if (tag === 'pre') {
    const lang =
      el.querySelector('code')?.className.match(/(?:language-|lang-)([\w+-]+)/)?.[1] ||
      el.className.match(/(?:language-|lang-)([\w+-]+)/)?.[1] ||
      ''
    const code = (el.textContent || '').replace(/\n$/, '')
    return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`
  }
  if (tag === 'code' && el.parentElement?.tagName !== 'PRE') {
    return `\`${el.textContent || ''}\``
  }
  if (tag === 'li') return `\n- ${kids().trim()}`
  if (tag === 'br') return '\n'
  if (tag === 'hr') return '\n\n---\n\n'
  if (tag === 'img') {
    const src = el.getAttribute('src') || ''
    const alt = el.getAttribute('alt') || ''
    return src ? `![${alt}](${src})` : ''
  }
  if (tag === 'a') {
    const href = el.getAttribute('href') || ''
    const label = kids().trim() || href
    return href ? `[${label}](${href})` : label
  }
  if (tag === 'strong' || tag === 'b') return `**${kids()}**`
  if (tag === 'em' || tag === 'i') return `*${kids()}*`
  if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'blockquote') {
    return `\n\n${kids().trim()}\n\n`
  }
  return kids()
}

/** 把编辑器 HTML 收成接近 Markdown 的原文，模型更好排，也少被标签撑爆。 */
function sourceForModel(html: string): string {
  const raw = String(html || '').trim()
  if (!raw) return ''
  if (typeof document === 'undefined' || !looksLikeHtml(raw)) return raw
  const wrap = document.createElement('div')
  wrap.innerHTML = sanitizeRichHtml(raw)
  const md = serializeNode(wrap)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return md || raw
}

function splitHandoutForFormat(source: string): string[] {
  if (source.length <= FORMAT_CHUNK_CHARS) return [source]
  const blocks = source.split(/(?=^#{1,3}\s+|<h[1-3][ >])/im).filter(Boolean)
  const parts: string[] = []
  let buf = ''
  for (const block of blocks) {
    if (buf && buf.length + block.length > FORMAT_CHUNK_CHARS) {
      parts.push(buf)
      buf = block
    } else {
      buf += block
    }
  }
  if (buf) parts.push(buf)
  const out: string[] = []
  for (const part of parts) {
    if (part.length <= FORMAT_CHUNK_CHARS * 1.25) {
      out.push(part)
      continue
    }
    for (let i = 0; i < part.length; i += FORMAT_CHUNK_CHARS) {
      out.push(part.slice(i, i + FORMAT_CHUNK_CHARS))
    }
  }
  return out.length ? out : [source]
}

function formattedToHtml(formatted: string): string {
  const s = formatted.trim()
  if (!s) return ''
  if (looksLikeHtml(s)) {
    const html = sanitizeRichHtml(s)
    if (html.trim()) return html
  }
  const html = sanitizeRichHtml(markdownToDisplaySafeHtml(s))
  if (html.trim()) return html
  const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return sanitizeRichHtml(`<p>${escaped.replace(/\n+/g, '</p><p>')}</p>`)
}

async function formatHandoutChunk(chunk: string): Promise<string> {
  const raw = await aiChatCompletion(
    [
      {
        role: 'system',
        content: [
          '你是讲义排版助手。把用户给的讲义整理成网道/wangdoc 风格 Markdown。',
          '只做格式识别与小幅排版调整，不要改写知识点、不要增删结论、不要发明例句。',
          '禁止省略、摘要或删节任何段落、代码、列表；给了哪一段就完整排哪一段。',
          '直接输出 Markdown 正文：不要 JSON，不要前言，不要用 ```markdown 包整篇。',
        ].join(''),
      },
      {
        role: 'user',
        content: [
          '请识别标题层级、段落、列表、行内代码、代码块语言、补充说明与来源行。',
          '规则：',
          '1. 一级标题用 #，小节用 ## / ###；代码用 fenced 块并标语言（如 ```js）。',
          '2. API、关键字、文件名用行内 `code`；列表保持原意。',
          '3. 「## 补充说明」和「来源：」行原样保留。',
          '4. 图片/链接原样保留；允许修正明显的标题层级、代码围栏、多余空白。',
          '5. 不要把代码拆进普通段落；看不清的地方保持原文。',
          '6. 不得把后文写成「（后续省略）」或任何摘要。',
          '只输出整理后的 Markdown。',
          '',
          '原文：',
          chunk,
        ].join('\n'),
      },
    ],
    {
      provider: getAiProvider(),
      temperature: 0.15,
      maxTokens: 8192,
    },
  )
  const formatted = extractFormatResult(raw)
  if (!formatted) throw new Error('没有生成可用的讲义格式')
  return formatted
}

export async function aiMatchHandoutFormat(sourceHtml: string): Promise<string> {
  const source = String(sourceHtml || '').trim()
  if (!source) throw new Error('编辑器里还没有内容')
  const prepared = sourceForModel(source)
  const chunks = splitHandoutForFormat(prepared)
  const pieces: string[] = []
  for (const chunk of chunks) {
    pieces.push(await formatHandoutChunk(chunk))
  }
  const markdown = pieces.join('\n\n')
  const srcLen = Math.max(plainLen(prepared), plainLen(source))
  if (srcLen >= 800 && plainLen(markdown) < Math.floor(srcLen * 0.4)) {
    throw new Error('格式匹配结果比原文短太多，已放弃套用，原文未改。请分段处理或手动排版。')
  }
  const html = formattedToHtml(markdown)
  if (!html.trim()) throw new Error('没有生成可用的讲义格式')
  return html
}
