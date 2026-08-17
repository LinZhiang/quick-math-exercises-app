import { aiChatCompletion, type AiMessage } from '@/services/ai'
import { parseAiJsonObjectLenient } from '@/utils/aiJsonParse'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/richTextHtml'

export const COMPUTER_HANDOUT_PHOTO_MAX = 12

const IGNORE_NOISE = [
  '只采用印刷体、打印体、教材、讲义或幻灯片上的正式文字。',
  '必须忽略：手写字、批注、对勾、叉、圈画、下划线、涂改、红笔/蓝笔/铅笔笔记。',
  '必须忽略：页眉页脚、页码、水印、二维码、截图界面无关文字。',
  '不要发明原文没有的内容；看不清则跳过该处，不要猜。',
  '分数写成 (分子)/(分母)，如 (1)/(2)；幂次写成 x^2 或 x^{n}；根号写成 \\sqrt{...}。',
  '若材料含表格：必须用 GitHub Markdown 表格原样抄出（含表头分隔行 |---|---|）。',
].join('')

function asText(v: unknown): string {
  return String(v ?? '')
    .replace(/^```[a-zA-Z]*\s*/g, '')
    .replace(/\s*```$/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function isBlankOcr(s: string): boolean {
  const t = s.trim()
  return !t || /^(无|没有|空|none|n\/a|null)$/i.test(t)
}

function visionParts(imageDataUrls: string[], text: string): AiMessage['content'] {
  return [
    { type: 'text', text },
    ...imageDataUrls.map((url) => ({
      type: 'image_url' as const,
      image_url: { url, detail: 'high' as const },
    })),
  ]
}

function asImageList(input: string | string[]): string[] {
  const list = (Array.isArray(input) ? input : [input]).map((s) => String(s ?? '').trim()).filter(Boolean)
  if (!list.length) throw new Error('请先拍下或选择照片')
  return list.slice(0, COMPUTER_HANDOUT_PHOTO_MAX)
}

function orderHint(count: number): string {
  if (count <= 1) {
    return '这是讲义/教材照片。请按阅读顺序抽出印刷正文。'
  }
  return [
    `共 ${count} 张照片，已按第 1 张到第 ${count} 张排好。`,
    '把这些照片按顺序拼成一份讲义正文；跨页内容接在一起，不要重复抄标题。',
  ].join('')
}

export async function extractComputerHandoutFromPhoto(imageDataUrl: string | string[]): Promise<string> {
  const images = asImageList(imageDataUrl)
  const raw = await aiChatCompletion(
    [
      {
        role: 'system',
        content: '你是讲义录入助手。只根据图片里的印刷文字整理，不要发明。只输出合法 JSON。',
      },
      {
        role: 'user',
        content: visionParts(
          images,
          [
            orderHint(images.length),
            IGNORE_NOISE,
            '输出 JSON：{ "markdown": "讲义正文 Markdown。可用标题、段落、列表、表格。没有则空字符串" }',
          ].join('\n'),
        ),
      },
    ],
    {
      provider: 'doubao',
      capability: 'vision',
      temperature: 0.05,
      maxTokens: 8192,
    },
  )
  const obj = parseAiJsonObjectLenient(raw)
  const rec = obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {}
  const markdown = asText(rec.markdown ?? rec.text ?? rec.content ?? rec.html)
  if (isBlankOcr(markdown)) throw new Error('没有识别到印刷文字（手写与无关文字已忽略）')
  const html = sanitizeRichHtml(markdownToDisplaySafeHtml(markdown))
  if (!html.trim()) throw new Error('没有识别到印刷文字（手写与无关文字已忽略）')
  return html
}
