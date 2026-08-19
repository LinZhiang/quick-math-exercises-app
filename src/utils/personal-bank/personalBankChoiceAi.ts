import { aiChatCompletion } from '@/services/ai'
import { getAiProvider, type AiProvider } from '@/utils/app/aiProviderStore'
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient } from '@/utils/app/aiJsonParse'
import { CHINESE_MCQ_SURFACE_PARITY_RULES } from '@/utils/chinese/chineseMcqAiFields'
import {
  personalBankChoiceModeOf,
  type PersonalBankQuestion,
} from '@/utils/personal-bank/personalQuestionBank'
import { richHtmlIsEmpty, richHtmlPlainText, sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

export type PersonalBankChoiceOptions = {
  optionsHtml: string[]
  correctIndex: number
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function optionKey(html: string): string {
  return richHtmlPlainText(html, 5000).replace(/\s+/g, '').toLowerCase()
}

function asHtmlSnippet(raw: string): string {
  const t = String(raw ?? '').trim()
  if (!t) return ''
  if (/<[a-z][\s\S]*>/i.test(t)) return sanitizeRichHtml(t)
  return sanitizeRichHtml(`<p>${t}</p>`)
}

function uniqueDistractors(correctHtml: string, candidates: string[]): string[] | null {
  const correctKey = optionKey(correctHtml)
  const out: string[] = []
  const seen = new Set<string>([correctKey])
  for (const raw of candidates) {
    const html = asHtmlSnippet(raw)
    if (richHtmlIsEmpty(html)) continue
    const key = optionKey(html)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(html)
    if (out.length === 3) return out
  }
  return null
}

function assembleOptions(correctHtml: string, distractors: string[]): PersonalBankChoiceOptions | null {
  const ds = uniqueDistractors(correctHtml, distractors)
  if (!ds) return null
  const optionsHtml = shuffleInPlace([correctHtml, ...ds])
  const correctKey = optionKey(correctHtml)
  const correctIndex = optionsHtml.findIndex((o) => optionKey(o) === correctKey)
  if (correctIndex < 0) return null
  return { optionsHtml, correctIndex }
}

function extractDistractorsFromUnknown(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return []
  const o = raw as Record<string, unknown>
  if (Array.isArray(o.distractors)) {
    return o.distractors.map((x) => String(x ?? '').trim()).filter(Boolean)
  }
  if (Array.isArray(o.options)) {
    return o.options.map((x) => String(x ?? '').trim()).filter(Boolean)
  }
  return []
}

function parseBatchMap(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>()
  const obj = parseAiJsonObjectLenient(text)
  const arrFromObj =
    obj && typeof obj === 'object'
      ? (obj as Record<string, unknown>).items ?? (obj as Record<string, unknown>).questions
      : null
  const list = Array.isArray(arrFromObj) ? arrFromObj : parseAiJsonArrayLenient(text)
  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    const rec = row as Record<string, unknown>
    const id = String(rec.id ?? rec.questionId ?? '').trim()
    const ds = extractDistractorsFromUnknown(rec)
    if (id && ds.length) map.set(id, ds)
  }
  return map
}

async function requestDistractors(
  questions: PersonalBankQuestion[],
  provider: AiProvider,
): Promise<Map<string, string[]>> {
  const payload = questions.map((q) => ({
    id: q.id,
    title: q.title,
    stem: richHtmlPlainText(q.stemHtml, 1200),
    correct: richHtmlPlainText(q.answerHtml || q.answer, 1200),
  }))
  const raw = await aiChatCompletion(
    [
      {
        role: 'system',
        content:
          '你是考试命题助手。只输出合法 JSON，不要 markdown 围栏。任务：根据已有题干和唯一正确答案，生成 3 个强干扰项。正确项已由出题人写好，禁止改写正确项。',
      },
      {
        role: 'user',
        content: [
          '为下列选择题各生成 3 个强干扰项。干扰项必须：',
          '- 与正确答案同一题、同一问法，看起来像真选项；',
          '- 彼此不同，且不能等于正确答案（含义或字面都不行）；',
          '- 长度、标点、句式与正确项接近，避免正确项明显更长或更完整；',
          '- 可以是 HTML 片段（如 <p>…</p>、<strong>），不要包整页。',
          CHINESE_MCQ_SURFACE_PARITY_RULES,
          '返回 JSON：{"items":[{"id":"题目id","distractors":["干扰1","干扰2","干扰3"]}]}',
          '题目：',
          JSON.stringify(payload, null, 2),
        ].join('\n'),
      },
    ],
    { provider, temperature: 0.55, maxTokens: 4096 },
  )
  return parseBatchMap(raw)
}

async function requestOne(q: PersonalBankQuestion, provider: AiProvider): Promise<string[]> {
  const map = await requestDistractors([q], provider)
  return map.get(q.id) ?? [...map.values()][0] ?? []
}

export function packStoredChoiceOptions(q: PersonalBankQuestion): PersonalBankChoiceOptions | null {
  if (personalBankChoiceModeOf(q) !== 'fixed') return null
  const optionsHtml = (q.optionsHtml ?? []).map((h) => sanitizeRichHtml(h)).filter((h) => !richHtmlIsEmpty(h))
  if (optionsHtml.length < 2) return null
  let correctIndex = Math.max(0, Math.floor(Number(q.correctIndex) || 0))
  if (correctIndex >= optionsHtml.length) correctIndex = 0
  return { optionsHtml, correctIndex }
}

export async function generatePersonalBankChoiceOptions(
  questions: PersonalBankQuestion[],
  provider: AiProvider = getAiProvider(),
): Promise<Map<string, PersonalBankChoiceOptions>> {
  const choiceQs = questions.filter((q) => q.type === 'choice')
  const result = new Map<string, PersonalBankChoiceOptions>()
  if (!choiceQs.length) return result

  for (const q of choiceQs) {
    const packed = packStoredChoiceOptions(q)
    if (packed) result.set(q.id, packed)
  }

  const openQs = choiceQs.filter((q) => !result.has(q.id))
  if (!openQs.length) return result

  let batch = new Map<string, string[]>()
  try {
    batch = await requestDistractors(openQs, provider)
  } catch {
    batch = new Map()
  }

  for (const q of openQs) {
    const correctHtml = sanitizeRichHtml(q.answerHtml || '')
    if (richHtmlIsEmpty(correctHtml)) {
      throw new Error(`选择题「${q.title}」缺少正确答案`)
    }
    let assembled = assembleOptions(correctHtml, batch.get(q.id) ?? [])
    if (!assembled) {
      try {
        assembled = assembleOptions(correctHtml, await requestOne(q, provider))
      } catch {
        assembled = null
      }
    }
    if (!assembled) {
      throw new Error(`选择题「${q.title}」干扰项生成失败，请重试`)
    }
    result.set(q.id, assembled)
  }
  return result
}
