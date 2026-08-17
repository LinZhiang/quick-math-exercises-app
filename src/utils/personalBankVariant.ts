import { aiChatCompletion } from '@/services/ai'
import { parseAiJsonObjectLenient } from '@/utils/aiJsonParse'
import { getAiProvider, getAiProviderLabel } from '@/utils/aiProviderStore'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import {
  personalBankChoiceModeOf,
  personalBankQuestionTypeLabel,
  type PersonalBankQuestion,
  type PersonalBankQuestionInput,
} from '@/utils/personalQuestionBank'
import { richHtmlPlainText, sanitizeRichHtml } from '@/utils/richTextHtml'

function asText(v: unknown): string {
  return String(v ?? '')
    .replace(/^```[a-zA-Z]*\s*/g, '')
    .replace(/\s*```$/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function toRichHtml(raw: string): string {
  const t = asText(raw)
  if (!t) return ''
  if (/<[a-z][\s\S]*>/i.test(t)) return sanitizeRichHtml(t)
  return sanitizeRichHtml(markdownToDisplaySafeHtml(t))
}

function variantTitle(original: string, suggested: string): string {
  const base = (suggested || original).replace(/（变式\d*）/g, '').trim() || original.trim()
  const short = base.slice(0, 28)
  return /（变式）$/.test(short) ? short : `${short}（变式）`
}

export async function generatePersonalBankVariant(
  question: PersonalBankQuestion,
): Promise<PersonalBankQuestionInput> {
  const provider = getAiProvider()
  const typeLabel = personalBankQuestionTypeLabel(question.type)
  const raw = await aiChatCompletion(
    [
      {
        role: 'system',
        content:
          '你是考试命题助手。根据已有题目生成一道考点相同、数字或情境不同的变式题。只输出合法 JSON，不要 markdown 围栏。',
      },
      {
        role: 'user',
        content: [
          `原题题型必须保持为 ${question.type}（${typeLabel}），分值保持 ${question.score}。`,
          '要求：',
          '- 考点和问法同类，但改数字、年份、人名、材料或故事，不能照抄原题；',
          '- 答案必须与新题一致，并给出对应解析；',
          '- 分数写成 (分子)/(分母)，如 (100-98.1)/(1)；幂次写成 x^2；根号写成 \\sqrt{...}；',
          '- 表格用 GitHub Markdown 表格，不要改成纯文字；',
          '- 不要输出图片，也不要编造原题没有的图表结构（可改表内数字）；',
          question.type === 'choice'
            ? personalBankChoiceModeOf(question) === 'fixed'
              ? '- 保持定项选择题：给出 4 个新选项（options 数组）和 correctIndex；stem 不要带 A/B/C/D 清单。'
              : '- 非定项选择题：stem 不要带选项清单；answer 只写正确答案本身。'
            : '- 简答题：answer 写最终答案正文。',
          '返回 JSON：',
          personalBankChoiceModeOf(question) === 'fixed'
            ? '{ "title": "不超过20字短标题", "stem": "题干 Markdown", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "解析 Markdown" }'
            : '{ "title": "不超过20字短标题", "stem": "题干 Markdown", "answer": "答案 Markdown", "explanation": "解析 Markdown" }',
          '原题：',
          JSON.stringify(
            {
              title: question.title,
              type: question.type,
              stem: richHtmlPlainText(question.stemHtml, 4000),
              answer: richHtmlPlainText(question.answerHtml || question.answer, 2000),
              explanation: richHtmlPlainText(question.explanationHtml, 4000),
            },
            null,
            2,
          ),
        ].join('\n'),
      },
    ],
    { provider, temperature: 0.7, maxTokens: 4096 },
  )

  const obj = parseAiJsonObjectLenient(raw)
  if (!obj || typeof obj !== 'object') {
    throw new Error(`${getAiProviderLabel(provider)} 没有返回可用的变式题，请重试`)
  }
  const rec = obj as Record<string, unknown>
  const stemHtml = toRichHtml(asText(rec.stem ?? rec.question ?? rec.stemHtml))
  if (!stemHtml.trim()) throw new Error('变式题干为空，请重试')
  const answerRaw = asText(rec.answer ?? rec.correct ?? rec.answerHtml)
  const explanationHtml = toRichHtml(asText(rec.explanation ?? rec.analysis ?? rec.explanationHtml))
  const title = variantTitle(question.title, asText(rec.title))

  if (question.type === 'choice') {
    const mode = personalBankChoiceModeOf(question)
    if (mode === 'fixed') {
      const options = Array.isArray(rec.options)
        ? rec.options.map((x) => toRichHtml(asText(x))).filter(Boolean)
        : []
      let correctIndex = Math.max(0, Math.floor(Number(rec.correctIndex) || 0))
      if (options.length < 2) throw new Error('变式定项选择题缺少选项，请重试')
      if (correctIndex >= options.length) correctIndex = 0
      const answerHtml = options[correctIndex]!
      return {
        title,
        type: 'choice',
        score: question.score,
        stemHtml,
        answer: richHtmlPlainText(answerHtml, 5000),
        answerHtml,
        explanationHtml,
        choiceMode: 'fixed',
        optionsHtml: options,
        correctIndex,
      }
    }
    const answerHtml = toRichHtml(answerRaw)
    if (!answerHtml.trim()) throw new Error('变式选择题缺少正确答案，请重试')
    return {
      title,
      type: 'choice',
      score: question.score,
      stemHtml,
      answer: richHtmlPlainText(answerHtml, 5000),
      answerHtml,
      explanationHtml,
      choiceMode: 'open',
      optionsHtml: [],
      correctIndex: 0,
    }
  }

  const answer = answerRaw || richHtmlPlainText(toRichHtml(answerRaw), 5000)
  if (!answer.trim()) throw new Error('变式简答题缺少答案，请重试')
  return {
    title,
    type: 'short-answer',
    score: question.score,
    stemHtml,
    answer,
    answerHtml: '',
    explanationHtml,
    choiceMode: 'open',
    optionsHtml: [],
    correctIndex: 0,
  }
}
