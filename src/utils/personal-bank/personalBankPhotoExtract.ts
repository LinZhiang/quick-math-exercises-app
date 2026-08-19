import { aiChatCompletion, type AiMessage } from '@/services/ai'
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient } from '@/utils/app/aiJsonParse'
import type {
  PersonalBankChoiceMode,
  PersonalBankQuestionInput,
  PersonalBankQuestionType,
} from '@/utils/personal-bank/personalQuestionBank'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { richHtmlIsEmpty, richHtmlPlainText, sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

export type PersonalBankPhotoExtract = PersonalBankQuestionInput

export type PersonalBankPhotoField = 'stem' | 'answer' | 'explanation'

export type PersonalBankPhotoFieldExtract = {
  text: string
  html: string
  explanationHtml?: string
}

const IGNORE_NOISE = [
  '只采用印刷体、打印体、教材或试卷上的正式文字。',
  '必须忽略：手写字、批注、对勾、叉、圈画、下划线、涂改、红笔/蓝笔/铅笔笔记、订正、个人演算。',
  '必须忽略：页眉页脚、页码、水印、二维码、无关栏目、截图界面文字。',
  '不要把手写内容当成题干、答案或解析。',
  '不要发明原文没有的内容；没有则留空。',
  '分数写成 (分子)/(分母)，如 (1)/(2)；幂次写成 x^2 或 x^{n}；根号写成 \\sqrt{...}。不要把指数写成普通贴在一起的数字。',
  '若材料含表格：必须用 GitHub Markdown 表格原样抄出（含表头分隔行 |---|---|），不要把表格改成纯文字叙述，也不要漏格。',
].join('')

const STRIP_NO_RULES = [
  '题干开头不要带题号：不要写 1.、1、、1）、（1）、第1题 这类序号。',
  '标题也不要带题号。',
].join('')

export const PERSONAL_BANK_PHOTO_MAX = 12

function examMarkdownToRichHtml(text: string): string {
  const t = asText(text)
  if (!t) return ''
  return sanitizeRichHtml(markdownToDisplaySafeHtml(t))
}

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

export function stripLeadingQuestionNo(s: string): string {
  let t = String(s ?? '').trim()
  for (let i = 0; i < 3; i += 1) {
    const next = t
      .replace(/^(?:第\s*)?\d{1,3}\s*[、．]\s*/u, '')
      .replace(/^(?:第\s*)?\d{1,3}\s*[)）]\s*/u, '')
      .replace(/^(?:第\s*)?\d{1,3}\.\s+(?!\d)/u, '')
      .replace(/^(?:第\s*)?\d{1,3}:\s*/u, '')
      .replace(/^[（(]\s*\d{1,3}\s*[)）]\s*/u, '')
      .replace(/^[一二三四五六七八九十百零〇]+\s*[、.．]\s*/u, '')
      .replace(/^第\s*[一二三四五六七八九十百零〇\d]+\s*题\s*[:：、.．]?\s*/u, '')
    if (next === t) break
    t = next.trim()
  }
  return t
}

function inferType(raw: string, stem: string, answer: string, options: string[]): PersonalBankQuestionType {
  const t = raw.trim().toLowerCase()
  if (t === 'choice' || t === '选择题' || t.includes('选择')) return 'choice'
  if (t === 'short-answer' || t === '简答' || t === '简答题') return 'short-answer'
  if (options.length >= 2) return 'choice'
  const blob = `${stem}\n${answer}`
  if (/[A-DＡ-Ｄ][\.．、\)]/.test(blob) && /[B-DＢ-Ｄ][\.．、\)]/.test(blob)) return 'choice'
  return 'short-answer'
}

function asOptionList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => stripLeadingQuestionNo(asText(x).replace(/^[A-Da-d][\.．、\)）]\s*/, ''))).filter((s) => !isBlankOcr(s))
}

function letterToIndex(raw: string): number | null {
  const t = raw.trim().toUpperCase()
  const m = /^[A-D]/.exec(t)
  if (!m) return null
  return m[0]!.charCodeAt(0) - 65
}

function toExtract(rec: Record<string, unknown>): PersonalBankPhotoExtract {
  const stem = stripLeadingQuestionNo(asText(rec.stem ?? rec.question))
  const options = asOptionList(rec.options ?? rec.choices)
  const answer = stripLeadingQuestionNo(asText(rec.answer ?? rec.correct))
  const explanation = asText(rec.explanation ?? rec.analysis)
  if (isBlankOcr(stem)) throw new Error('没有识别到印刷题干（手写与无关文字已忽略）')
  const type = inferType(asText(rec.type), stem, answer, options)
  const title = stripLeadingQuestionNo(asText(rec.title) || stem).slice(0, 80) || stem.slice(0, 18)
  const stemHtml = examMarkdownToRichHtml(stem)
  const explanationHtml = explanation && !isBlankOcr(explanation) ? examMarkdownToRichHtml(explanation) : ''

  if (type !== 'choice') {
    const ans = isBlankOcr(answer) ? '（待补）' : answer
    return {
      title,
      type: 'short-answer',
      score: 2,
      stemHtml,
      answer: ans,
      answerHtml: '',
      explanationHtml,
      choiceMode: 'open',
      optionsHtml: [],
      correctIndex: 0,
    }
  }

  const modeRaw = asText(rec.choiceMode ?? rec.choice_mode).toLowerCase()
  let choiceMode: PersonalBankChoiceMode = modeRaw === 'open' || modeRaw === '非定项' ? 'open' : 'fixed'
  if (options.length >= 2) choiceMode = 'fixed'

  if (choiceMode === 'fixed') {
    const optionsHtml = (options.length ? options : answer && !isBlankOcr(answer) ? [answer] : []).map((o) =>
      examMarkdownToRichHtml(o),
    )
    let correctIndex = Number.isFinite(Number(rec.correctIndex)) ? Math.floor(Number(rec.correctIndex)) : -1
    if (correctIndex < 0) {
      const fromLetter = letterToIndex(asText(rec.correctLetter ?? rec.correct_option ?? rec.key))
      if (fromLetter != null) correctIndex = fromLetter
    }
    if (correctIndex < 0 && answer && !isBlankOcr(answer)) {
      const key = answer.replace(/\s+/g, '')
      correctIndex = options.findIndex((o) => o.replace(/\s+/g, '') === key || o.includes(answer) || answer.includes(o))
    }
    if (correctIndex < 0) correctIndex = 0
    if (optionsHtml.length < 2) {
      const answerHtml = optionsHtml[0] || examMarkdownToRichHtml(isBlankOcr(answer) ? '（待补）' : answer)
      return {
        title,
        type: 'choice',
        score: 2,
        stemHtml,
        answer: richHtmlPlainText(answerHtml, 5000) || '（待补）',
        answerHtml: richHtmlIsEmpty(answerHtml) ? examMarkdownToRichHtml('（待补）') : answerHtml,
        explanationHtml,
        choiceMode: 'open',
        optionsHtml: [],
        correctIndex: 0,
      }
    }
    if (correctIndex >= optionsHtml.length) correctIndex = 0
    const answerHtml = optionsHtml[correctIndex]!
    return {
      title,
      type: 'choice',
      score: 2,
      stemHtml,
      answer: richHtmlPlainText(answerHtml, 5000),
      answerHtml,
      explanationHtml,
      choiceMode: 'fixed',
      optionsHtml,
      correctIndex,
    }
  }

  const answerHtml = examMarkdownToRichHtml(isBlankOcr(answer) ? '（待补）' : answer)
  return {
    title,
    type: 'choice',
    score: 2,
    stemHtml,
    answer: richHtmlPlainText(answerHtml, 5000),
    answerHtml,
    explanationHtml,
    choiceMode: 'open',
    optionsHtml: [],
    correctIndex: 0,
  }
}

function questionJsonSpec(): string {
  return [
    '把材料整理成 JSON。可能有一道题，也可能有多道题。',
    '输出：{"questions":[{...},{...}]}',
    '每题字段：',
    '{',
    '  "title": "不超过20字短标题，不要题号",',
    '  "type": "choice 或 short-answer",',
    '  "choiceMode": "fixed 或 open。识别到选择题时默认 fixed（定项，卷面选项固定）。只有明确没有印刷选项、仅有正确答案时才用 open",',
    '  "stem": "题干全文 Markdown，不要题号，选择题不要把 A/B/C/D 选项清单写进 stem",',
    '  "options": ["A项正文","B项正文","C项正文","D项正文"]。定项选择题必填；简答或非定项用 []",',
    '  "correctIndex": 0到3 的正确项下标（定项必填）',
    '  "answer": "简答写答案正文；非定项选择写正确选项正文；定项可与正确项正文一致。没有印刷答案则空字符串",',
    '  "explanation": "若同一材料里有解析/解答则写入；没有则空字符串"',
    '}',
    '判断 type：出现印刷 A/B/C/D 选项的为 choice。选择题默认 choiceMode=fixed。',
    STRIP_NO_RULES,
    IGNORE_NOISE,
  ].join('\n')
}

function fieldJsonSpec(field: PersonalBankPhotoField, questionType: PersonalBankQuestionType): string {
  if (field === 'stem') {
    return [
      '当前只要【题干】。不要答案、解析。选择题不要把选项清单写进去。',
      STRIP_NO_RULES,
      IGNORE_NOISE,
      '输出 JSON：{ "text": "题干，没有则空字符串。可用 Markdown 段落/列表/表格" }',
    ].join('\n')
  }
  if (field === 'answer') {
    const focus =
      questionType === 'choice'
        ? '提取印刷的正确答案（正确选项正文或正确字母）。若同一画面还有解析/解答/分析，必须同时提取到 explanation。'
        : '提取印刷的参考答案正文。若同一画面还有解析/解答/分析，必须同时提取到 explanation。不要把解析写进 text。'
    return [
      '当前要【答案】。若材料里同时有解析，也要提取解析。',
      focus,
      IGNORE_NOISE,
      '输出 JSON：{ "text": "答案，没有则空字符串", "explanation": "解析，没有则空字符串。可用 Markdown 表格" }',
    ].join('\n')
  }
  return [
    '当前只要【解析/解答/分析】正文，不要题干和答案。',
    IGNORE_NOISE,
    '输出 JSON：{ "text": "解析，没有则空字符串。可用 Markdown 段落/列表/表格" }',
  ].join('\n')
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
  return list.slice(0, PERSONAL_BANK_PHOTO_MAX)
}

async function completeVisionRaw(messages: AiMessage[]): Promise<string> {
  return aiChatCompletion(messages, {
    provider: 'doubao',
    capability: 'vision',
    temperature: 0.05,
    maxTokens: 8192,
  })
}

function collectQuestionRecords(raw: string): Record<string, unknown>[] {
  const obj = parseAiJsonObjectLenient(raw)
  if (obj && typeof obj === 'object') {
    const rec = obj as Record<string, unknown>
    const list = rec.questions ?? rec.items ?? rec.list
    if (Array.isArray(list) && list.length) {
      return list.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    }
    if (rec.stem || rec.question) return [rec]
  }
  const arr = parseAiJsonArrayLenient(raw)
  return arr.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
}

function orderHint(count: number): string {
  if (count <= 1) {
    return '这是试题照片。可能含一道题，也可能一页上有多道题。多道题必须拆成 questions 数组，不要合成一题。'
  }
  return [
    `共 ${count} 张照片，已按第 1 张到第 ${count} 张排好。请把这些照片联动起来读：`,
    '- 可能是同一道题的上下页/左右栏，把同属一题的内容拼在一起；',
    '- 也可能是多道题，按题号或问句切开，每道题一条；',
    '- 一道题跨多张时，只拼该题相关片段，不要把下一题并进来；',
    '- 不要漏题，也不要把不同题合成一题。',
  ].join('')
}

export async function extractPersonalBankQuestionsFromPhoto(
  imageDataUrl: string | string[],
): Promise<PersonalBankPhotoExtract[]> {
  const images = asImageList(imageDataUrl)
  const raw = await completeVisionRaw([
    {
      role: 'system',
      content: '你是试题录入助手。只根据图片里的印刷试题文字整理，不要发明。只输出合法 JSON。',
    },
    {
      role: 'user',
      content: visionParts(
        images,
        `${orderHint(images.length)}${questionJsonSpec()}`,
      ),
    },
  ])
  const recs = collectQuestionRecords(raw)
  const out: PersonalBankPhotoExtract[] = []
  for (const rec of recs) {
    try {
      out.push(toExtract(rec))
    } catch {
      /* skip incomplete row */
    }
  }
  if (!out.length) throw new Error('没有识别到印刷题目（手写与无关文字已忽略）')
  return out
}

export async function extractPersonalBankQuestionFromPhoto(
  imageDataUrl: string | string[],
): Promise<PersonalBankPhotoExtract> {
  const list = await extractPersonalBankQuestionsFromPhoto(imageDataUrl)
  const first = list[0]
  if (!first) throw new Error('没有识别到印刷题目（手写与无关文字已忽略）')
  return first
}

export async function extractPersonalBankFieldFromPhoto(
  imageDataUrl: string | string[],
  field: PersonalBankPhotoField,
  options?: { questionType?: PersonalBankQuestionType },
): Promise<PersonalBankPhotoFieldExtract> {
  const images = asImageList(imageDataUrl)
  const questionType = options?.questionType ?? 'short-answer'
  const raw = await completeVisionRaw([
    {
      role: 'system',
      content: '你是试题录入助手。只提取指定栏的印刷文字。只输出合法 JSON。',
    },
    {
      role: 'user',
      content: visionParts(images, `${orderHint(images.length)}${fieldJsonSpec(field, questionType)}`),
    },
  ])
  const obj = parseAiJsonObjectLenient(raw)
  const rec = obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {}
  let text = asText(rec.text ?? rec.stem ?? rec.answer ?? rec.explanation)
  if (field === 'stem') text = stripLeadingQuestionNo(text)
  if (isBlankOcr(text)) throw new Error('没有识别到该栏的印刷文字（手写与无关文字已忽略）')
  const explanation = asText(rec.explanation ?? rec.analysis)
  return {
    text,
    html: examMarkdownToRichHtml(text),
    explanationHtml:
      field === 'answer' && explanation && !isBlankOcr(explanation) ? examMarkdownToRichHtml(explanation) : undefined,
  }
}
