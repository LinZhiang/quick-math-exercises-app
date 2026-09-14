import { aiChatCompletion } from '@/services/ai'
import { parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/app/aiJsonParse'
import { getAiProvider } from '@/utils/app/aiProviderStore'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'
import { repairSameLineFenceOpeners, tidyJsFencesInMarkdown } from '@/utils/markdown/tidyJsCode'

const FORMAT_CHUNK_CHARS = 2800
const AI_KEEP_RATIO = 0.72

export class HandoutFormatAbortedError extends Error {
  constructor() {
    super('已中断格式匹配')
    this.name = 'HandoutFormatAbortedError'
  }
}

export type HandoutFormatProgress = {
  current: number
  total: number
  attempt: number
  round: number
}

export type HandoutFormatOptions = {
  signal?: AbortSignal
  onProgress?: (p: HandoutFormatProgress) => void
}

function aborted() {
  return new HandoutFormatAbortedError()
}

export function isHandoutFormatAborted(e: unknown): boolean {
  if (e instanceof HandoutFormatAbortedError) return true
  if (e instanceof DOMException && e.name === 'AbortError') return true
  return e instanceof Error && (e.name === 'AbortError' || e.message === '已中断格式匹配')
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw aborted()
}

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

function tidyMarkdown(md: string): string {
  return tidyJsFencesInMarkdown(repairSameLineFenceOpeners(String(md || '').trim()))
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
    if (part.length <= FORMAT_CHUNK_CHARS * 1.2) {
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
  const s = tidyMarkdown(formatted)
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

const STRUCTURED_ATTEMPTS = 4
const LOOSE_ATTEMPTS = 1

function markdownLooksStyled(md: string): boolean {
  const s = String(md || '')
  if (/^#{1,4}\s+\S/m.test(s)) return true
  if (/```[\w+-]*\r?\n[\s\S]+?```/.test(s)) return true
  if (/^(\s*[-*+]|\s*\d+\.)\s+\S/m.test(s)) return true
  if (/^>\s+\S/m.test(s)) return true
  if (/<[hH][1-6]\b|<pre\b|<ul\b|<ol\b|<blockquote\b/i.test(s)) return true
  return false
}

function htmlLooksStyled(html: string): boolean {
  return /<(h[1-6]|ul|ol|pre|blockquote)\b/i.test(html)
}

function hasStructureCue(s: string): boolean {
  const t = String(s || '')
  if (markdownLooksStyled(t)) return true
  if (/<(h[1-6]|ul|ol|pre|blockquote|table)\b/i.test(t)) return true
  if (/```/.test(t)) return true
  const lines = t.split('\n')
  const bullets = lines.filter((l) => /^\s*(?:[-*+•]|\d+[.、)])\s+\S/.test(l)).length
  if (bullets >= 2) return true
  const keywords = t.match(/\b(?:function|class|const|let|var|import|export|#include|def |public |private )\b/g)
  if ((keywords?.length || 0) >= 2) return true
  if ((t.match(/[{};]/g) || []).length >= 12 && lines.length >= 4) return true
  return false
}

function looksLikeTitleLine(line: string): boolean {
  const t = line.trim()
  if (!t || t.length > 42) return false
  if (/^(来源|补充说明|参考|注[：:]|http)/i.test(t)) return false
  if (/https?:\/\//i.test(t) || t.includes('。')) return false
  if (/[。！？；;：:]$/.test(t)) return false
  return true
}

function looksLikeCodeDump(s: string): boolean {
  const t = s.trim()
  if (!t || markdownLooksStyled(t)) return false
  const lines = t.split('\n')
  if (lines.length < 3) return false
  return (t.match(/[{};()=<>]/g) || []).length >= 10
}

function guessFenceLang(s: string): string {
  if (/\b(?:fn |let mut|impl )\b/.test(s)) return 'rust'
  if (/\b(?:def |elif |self\.)\b/.test(s)) return 'python'
  if (/#include|std::/.test(s)) return 'cpp'
  if (/\b(?:func |package )\b/.test(s)) return 'go'
  if (/\b(?:const |let |function |=>|import )\b/.test(s)) return 'js'
  return ''
}

/** 没有标题/列表/代码时的本地排版：段落、像标题的首行、代码堆。 */
function localFormatChunk(chunk: string): string {
  const raw = tidyMarkdown(String(chunk || '').trim())
  if (!raw) return ''
  if (looksLikeHtml(raw)) return raw
  if (markdownLooksStyled(raw)) return raw
  if (looksLikeCodeDump(raw)) {
    const lang = guessFenceLang(raw)
    return `\`\`\`${lang}\n${raw.replace(/\n+$/, '')}\n\`\`\``
  }
  const lines = raw.split('\n').map((l) => l.trimEnd())
  const nonempty = lines.map((l) => l.trim()).filter(Boolean)
  if (nonempty.length >= 2 && looksLikeTitleLine(nonempty[0] || '')) {
    const title = nonempty[0] || ''
    const rest = raw.slice(raw.indexOf(title) + title.length).trim()
    return rest ? `## ${title}\n\n${rest}` : `## ${title}`
  }
  return raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .join('\n\n')
}

function chunkIsAcceptable(
  original: string,
  aiRaw: string,
  requireStyle: boolean,
): string | null {
  const got = extractFormatResult(aiRaw)
  if (!got.trim()) return null
  const need = plainLen(original)
  if (need >= 40 && plainLen(got) < Math.floor(need * AI_KEEP_RATIO)) return null
  const html = formattedToHtml(got)
  if (!html.trim()) return null
  if (requireStyle && need >= 80 && !markdownLooksStyled(got) && !htmlLooksStyled(html)) return null
  return got
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(aborted())
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(aborted())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function formatHandoutChunk(
  chunk: string,
  signal: AbortSignal | undefined,
  mode: 'strict' | 'loose',
): Promise<string> {
  const strict = mode === 'strict'
  const raw = await aiChatCompletion(
    [
      {
        role: 'system',
        content: [
          '你是讲义排版助手，只做格式，不改知识点、不增删结论、不发明例句。',
          '禁止省略、摘要或删节；给了哪一段就完整排哪一段。',
          strict
            ? '这段有标题、列表或代码：整理成网道/wangdoc 风格 Markdown（# / ## / ###、列表、行内 `code`、围栏代码块并标明语言）。'
            : '这段可能只是说明、出处或普通段落：有结构就排结构，没有就用普通段落，不要硬加标题、列表或代码块。',
          '直接输出 Markdown 正文：不要 JSON，不要前言，不要用 ```markdown 包整篇。',
        ].join(''),
      },
      {
        role: 'user',
        content: [
          strict
            ? '把下面这一段排成讲义 Markdown，要能看出标题层级和代码块。'
            : '把下面这一段排版。没有标题/列表/代码就保持成段落，不要硬造结构。',
          'API、关键字、文件名可用行内 `code`。图片和链接原样保留。',
          '「## 补充说明」和「来源：」行保留。',
          '只输出整理后的 Markdown。',
          '',
          '原文：',
          chunk,
        ].join('\n'),
      },
    ],
    {
      provider: getAiProvider(),
      temperature: 0.1,
      maxTokens: 8192,
      signal,
    },
  )
  return extractFormatResult(raw)
}

async function formatOneChunk(
  chunk: string,
  opts: { signal?: AbortSignal; onAttempt: (attempt: number) => void },
): Promise<string> {
  const structured = hasStructureCue(chunk)
  const maxAttempts = structured ? STRUCTURED_ATTEMPTS : LOOSE_ATTEMPTS
  if (!structured && plainLen(chunk) < 80) {
    opts.onAttempt(1)
    return localFormatChunk(chunk) || chunk
  }
  if (plainLen(chunk) < 24) {
    opts.onAttempt(1)
    return localFormatChunk(chunk) || chunk
  }

  let lastKept = ''
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    throwIfAborted(opts.signal)
    opts.onAttempt(attempt)
    try {
      const raw = await formatHandoutChunk(chunk, opts.signal, structured ? 'strict' : 'loose')
      const ok = chunkIsAcceptable(chunk, raw, structured)
      if (ok) return ok
      const got = extractFormatResult(raw)
      if (got.trim() && (plainLen(chunk) < 40 || plainLen(got) >= Math.floor(plainLen(chunk) * AI_KEEP_RATIO))) {
        lastKept = got
      }
    } catch (e) {
      throwIfAborted(opts.signal)
      if (isHandoutFormatAborted(e)) throw aborted()
    }
    if (attempt < maxAttempts) await sleep(Math.min(800 + attempt * 300, 2500), opts.signal)
  }
  return lastKept || localFormatChunk(chunk) || chunk
}

/** 分段排版：有结构就套讲义样式，没有就按段落处理或跳过死磕。 */
export async function aiMatchHandoutFormat(
  sourceHtml: string,
  options?: HandoutFormatOptions,
): Promise<string> {
  const source = String(sourceHtml || '').trim()
  if (!source) throw new Error('编辑器里还没有内容')
  const prepared = tidyMarkdown(sourceForModel(source))
  const chunks = splitHandoutForFormat(prepared || source)
  const pieces: string[] = []
  for (let i = 0; i < chunks.length; i += 1) {
    throwIfAborted(options?.signal)
    const chunk = chunks[i] ?? ''
    const formatted = await formatOneChunk(chunk, {
      signal: options?.signal,
      onAttempt: (attempt) => {
        options?.onProgress?.({ current: i + 1, total: chunks.length, attempt, round: 1 })
      },
    })
    pieces.push(formatted)
  }
  const html = formattedToHtml(pieces.join('\n\n'))
  if (!html.trim()) throw new Error('没有生成可用的讲义内容，请再试一次')
  return html
}
