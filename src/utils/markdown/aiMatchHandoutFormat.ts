import { aiChatCompletion } from '@/services/ai'
import { parseAiJsonObjectLenient } from '@/utils/app/aiJsonParse'
import { getAiProvider } from '@/utils/app/aiProviderStore'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

const FORMAT_CHUNK_CHARS = 8000

function asText(v: unknown): string {
  return String(v ?? '')
    .replace(/^```[a-zA-Z]*\s*/g, '')
    .replace(/\s*```$/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function plainLen(s: string): number {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '').length
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
    if (part.length <= FORMAT_CHUNK_CHARS * 1.4) {
      out.push(part)
      continue
    }
    for (let i = 0; i < part.length; i += FORMAT_CHUNK_CHARS) {
      out.push(part.slice(i, i + FORMAT_CHUNK_CHARS))
    }
  }
  return out.length ? out : [source]
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
        ].join(''),
      },
      {
        role: 'user',
        content: [
          '请识别标题层级、段落、列表、行内代码、代码块语言、补充说明与来源行。',
          '规则：',
          '1. 输出 Markdown：一级标题用 #，小节用 ## / ###；代码用 fenced 块并标语言（如 ```js）。',
          '2. API、关键字、文件名用行内 `code`；列表保持原意。',
          '3. 「## 补充说明」和「来源：」行原样保留。',
          '4. 图片/链接原样保留；允许修正明显的标题层级、代码围栏、多余空白。',
          '5. 不要把代码拆进普通段落；看不清的地方保持原文。',
          '6. 不得把后文写成「（后续省略）」或任何摘要。',
          '只输出 JSON：{ "markdown": "..." }',
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
  const obj = parseAiJsonObjectLenient(raw)
  const rec = obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {}
  const markdown = asText(rec.markdown ?? rec.text ?? rec.content)
  if (!markdown) throw new Error('没有生成可用的讲义格式')
  return markdown
}

export async function aiMatchHandoutFormat(sourceHtml: string): Promise<string> {
  const source = String(sourceHtml || '').trim()
  if (!source) throw new Error('编辑器里还没有内容')
  const chunks = splitHandoutForFormat(source)
  const pieces: string[] = []
  for (const chunk of chunks) {
    pieces.push(await formatHandoutChunk(chunk))
  }
  const markdown = pieces.join('\n\n')
  if (plainLen(source) >= 800 && plainLen(markdown) < Math.floor(plainLen(source) * 0.55)) {
    throw new Error('格式匹配结果比原文短太多，已放弃套用，原文未改。请分段处理或手动排版。')
  }
  const html = sanitizeRichHtml(markdownToDisplaySafeHtml(markdown))
  if (!html.trim()) throw new Error('没有生成可用的讲义格式')
  return html
}
