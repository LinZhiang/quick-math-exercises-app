import { aiChatCompletion, type AiMessage } from '@/services/ai'
import { parseAiJsonObjectLenient } from '@/utils/aiJsonParse'
import type { PersonalBankQuestionType } from '@/utils/personalQuestionBank'
import { plainTextToRichHtml } from '@/utils/richTextHtml'

export type PersonalBankPhotoExtract = {
  title: string
  type: PersonalBankQuestionType
  stemHtml: string
  answer: string
  answerHtml: string
  explanationHtml: string
}

export type PersonalBankPhotoField = 'stem' | 'answer' | 'explanation'

export type PersonalBankPhotoFieldExtract = {
  text: string
  html: string
}

const IGNORE_NOISE = [
  '只采用印刷体、打印体、教材或试卷上的正式文字。',
  '必须忽略：手写字、批注、对勾、叉、圈画、下划线、涂改、红笔/蓝笔/铅笔笔记、订正、个人演算。',
  '必须忽略：页眉页脚、页码、水印、二维码、相邻题目、无关栏目、截图界面文字。',
  '不要把手写内容当成题干、答案或解析。',
  '不要发明原文没有的内容；没有则留空。',
  '分数写成 (分子)/(分母)，如 (1)/(2)；幂次写成 x^2 或 x^{n}；根号写成 \\sqrt{...}。不要把指数写成普通贴在一起的数字。',
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

function inferType(raw: string, stem: string, answer: string): PersonalBankQuestionType {
  const t = raw.trim().toLowerCase()
  if (t === 'choice' || t === '选择题' || t.includes('选择')) return 'choice'
  if (t === 'short-answer' || t === '简答' || t === '简答题') return 'short-answer'
  const blob = `${stem}\n${answer}`
  if (/[A-DＡ-Ｄ][\.．、\)]/.test(blob) && /[B-DＢ-Ｄ][\.．、\)]/.test(blob)) return 'choice'
  return 'short-answer'
}

function toExtract(rec: Record<string, unknown>): PersonalBankPhotoExtract {
  const stem = asText(rec.stem ?? rec.question)
  const answer = asText(rec.answer ?? rec.correct)
  const explanation = asText(rec.explanation ?? rec.analysis)
  if (isBlankOcr(stem)) throw new Error('没有识别到印刷题干（手写与无关文字已忽略）')
  const type = inferType(asText(rec.type), stem, answer)
  const title = asText(rec.title) || stem.slice(0, 18)
  return {
    title: title.slice(0, 80),
    type,
    stemHtml: plainTextToRichHtml(stem),
    answer,
    answerHtml: type === 'choice' ? plainTextToRichHtml(answer) : '',
    explanationHtml: explanation ? plainTextToRichHtml(explanation) : '',
  }
}

function questionJsonSpec(): string {
  return [
    '整理为 JSON：',
    '{',
    '  "title": "不超过20字的短标题，便于列表辨认",',
    '  "type": "choice 或 short-answer",',
    '  "stem": "题干全文，保留换行；选择题题干不要把选项清单写进去",',
    '  "answer": "若印刷文字里有答案则只写正确答案本身（选择题只写正确选项内容，不要写 A/B/C/D 整组）；没有则空字符串",',
    '  "explanation": "若印刷文字里有解析则原文整理；没有则空字符串"',
    '}',
    '判断 type：出现 A/B/C/D 这类印刷选项的为 choice，否则 short-answer。',
    IGNORE_NOISE,
  ].join('\n')
}

function fieldJsonSpec(field: PersonalBankPhotoField, questionType: PersonalBankQuestionType): string {
  const focus =
    field === 'stem'
      ? '只提取题干。不要答案、解析；选择题不要把选项清单写进去。'
      : field === 'answer'
        ? questionType === 'choice'
          ? '只提取印刷的正确答案内容（正确选项正文，不要整组选项，不要题干）。'
          : '只提取印刷的参考答案正文，不要题干和解析。'
        : '只提取印刷的解析/解答/分析正文，不要题干和答案。'
  return [
    `当前只要【${field === 'stem' ? '题干' : field === 'answer' ? '答案' : '解析'}】。`,
    focus,
    IGNORE_NOISE,
    '输出 JSON：{ "text": "提取结果，没有则空字符串" }',
  ].join('\n')
}

function visionUser(imageDataUrl: string, text: string): AiMessage {
  return {
    role: 'user',
    content: [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
    ],
  }
}

async function completeVisionJson(messages: AiMessage[]): Promise<Record<string, unknown>> {
  const raw = await aiChatCompletion(messages, {
    provider: 'doubao',
    capability: 'vision',
    temperature: 0.05,
    maxTokens: 4096,
  })
  const obj = parseAiJsonObjectLenient(raw)
  if (!obj || typeof obj !== 'object') throw new Error('未能识别内容，请换一张更清晰的照片或缩小裁切范围')
  return obj as Record<string, unknown>
}

export async function extractPersonalBankQuestionFromPhoto(
  imageDataUrl: string,
): Promise<PersonalBankPhotoExtract> {
  const rec = await completeVisionJson([
    {
      role: 'system',
      content: '你是试题录入助手。只根据图片里的印刷试题文字整理，不要发明。只输出合法 JSON。',
    },
    visionUser(imageDataUrl, `这是一道题的照片。${questionJsonSpec()}`),
  ])
  return toExtract(rec)
}

export async function extractPersonalBankFieldFromPhoto(
  imageDataUrl: string,
  field: PersonalBankPhotoField,
  options?: { questionType?: PersonalBankQuestionType },
): Promise<PersonalBankPhotoFieldExtract> {
  const questionType = options?.questionType ?? 'short-answer'
  const rec = await completeVisionJson([
    {
      role: 'system',
      content: '你是试题录入助手。只提取指定栏的印刷文字。只输出合法 JSON。',
    },
    visionUser(imageDataUrl, fieldJsonSpec(field, questionType)),
  ])
  const text = asText(rec.text ?? rec.stem ?? rec.answer ?? rec.explanation)
  if (isBlankOcr(text)) throw new Error('没有识别到该栏的印刷文字（手写与无关文字已忽略）')
  return { text, html: plainTextToRichHtml(text) }
}
