import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/aiJsonParse'
import {
  buildCommonSenseQuestionFromMcq,
  COMMON_SENSE_QUESTION_COUNT,
  parseCommonSenseMcqAiObject,
  type CommonSenseQuestion,
} from '@/utils/commonSensePractice'
import {
  buildIdiomQuestionFromMcq,
  IDIOM_RECOGNITION_QUESTION_COUNT,
  parseIdiomMcqAiObject,
  type IdiomRecognitionQuestion,
} from '@/utils/idiomRecognitionPractice'
import {
  buildPoetryQuestionFromMcq,
  parsePoetryMcqAiObject,
  POETRY_RECOGNITION_QUESTION_COUNT,
  type PoetryRecognitionQuestion,
} from '@/utils/poetryRecognitionPractice'

const WENGU_AI_SOURCE = 'quick-math-exercises-app'

function chatCompletionsUrl(): string {
  const base = import.meta.env.VITE_AI_API_BASE?.trim()
  if (base) return `${base.replace(/\/$/, '')}/chat/completions`
  if (import.meta.env.DEV) return '/api/ai/chat/completions'
  return ''
}

export function isAiChatConfigured(): boolean {
  if (import.meta.env.VITE_AI_API_BASE?.trim()) return true
  if (import.meta.env.DEV) return true
  return false
}

export type DeepSeekChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function deepseekChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const url = chatCompletionsUrl()
  if (!url) {
    throw new Error('未配置 AI 代理：请设置 VITE_AI_API_BASE，或开发时启动主站 server（8787）')
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wengu-Ai-Source': WENGU_AI_SOURCE,
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_DEEPSEEK_MODEL?.trim() || 'deepseek-v4-flash',
      messages,
      temperature: options?.temperature ?? 0.35,
      max_tokens: options?.maxTokens ?? 8192,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`AI 请求失败 (${res.status})：${errText.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>
  }
  const msg = data.choices?.[0]?.message
  const text = (msg?.content ?? msg?.reasoning_content ?? '').trim()
  if (!text) throw new Error('AI 未返回有效内容')
  return text
}

async function deepseekChatRaw(
  user: string,
  options?: { system?: string; temperature?: number; maxTokens?: number },
): Promise<string> {
  return deepseekChatCompletion(
    [
      {
        role: 'system',
        content:
          options?.system ??
          '你是专业、严谨的学习助手，只输出用户要求的格式，使用简体中文。',
      },
      { role: 'user', content: user },
    ],
    options,
  )
}

const CONVERSATION_FOLLOWUP_NOTE =
  '学员可能继续追问。请结合上文题目与讲解作答，使用简体中文，可直接输出 Markdown。'

/** 单轮问答 */
export async function requestAssistantMarkdown(input: {
  system: string
  userMessage: string
  temperature?: number
}): Promise<string> {
  const userMessage = input.userMessage.trim()
  if (!userMessage) throw new Error('请输入提问内容')
  return deepseekChatRaw(userMessage, {
    system: input.system,
    temperature: input.temperature ?? 0.4,
    maxTokens: 2048,
  })
}

/** 多轮追问 */
export async function deepseekChatConversation(input: {
  system: string
  history: DeepSeekChatTurn[]
  userMessage: string
  temperature?: number
}): Promise<string> {
  const userMessage = input.userMessage.trim()
  if (!userMessage) throw new Error('请输入追问内容')
  if (!input.history.length) throw new Error('对话尚未开始')
  const messages: ChatMessage[] = [
    { role: 'system', content: `${input.system.trim()}\n\n${CONVERSATION_FOLLOWUP_NOTE}` },
    ...input.history.map((t) => ({ role: t.role, content: t.content })),
    { role: 'user', content: userMessage },
  ]
  return deepseekChatCompletion(messages, {
    temperature: input.temperature ?? 0.4,
    maxTokens: 2048,
  })
}

const IDIOM_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解」命题专家，熟悉选词填空、逻辑填空与类比推理中的高频词语与成语。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const IDIOM_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示词语/成语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个词语/成语；correct 必须等于 term

【命题要求】
- 优先事业编/国考言语理解高频实词、成语、关联词及类比推理常考词
- 干扰项须为近义、形近或常混的释义/词语
- 释义选项 12～28 字，词语选项 2～6 字
- term 字段填目标词语/成语（后台元数据，选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/比喻义/语境，例如「比喻人的才能全部显露出来的是？」，禁止写出答案词语
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"潜移默化","stem":"「潜移默化」的正确释义是？","correct":"……","distractors":["……","……","……"],"explanation":"……"}
选词语：{"questionType":"meaning-to-word","term":"脱颖而出","stem":"比喻人的才能全部显露出来的是？","correct":"脱颖而出","distractors":["出类拔萃","崭露头角","锋芒毕露"],"explanation":"……"}
`.trim()

function dedupeQuestions(items: IdiomRecognitionQuestion[]): IdiomRecognitionQuestion[] {
  const seen = new Set<string>()
  const out: IdiomRecognitionQuestion[] = []
  for (const q of items) {
    if (seen.has(q.fingerprint)) continue
    seen.add(q.fingerprint)
    out.push(q)
  }
  return out
}

export async function requestIdiomRecognitionMcqs(input: {
  count?: number
  onProgress?: (message: string) => void
}): Promise<IdiomRecognitionQuestion[]> {
  const count = input.count ?? IDIOM_RECOGNITION_QUESTION_COUNT
  input.onProgress?.('正在向 DeepSeek 请求题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选释义' : '选词语',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const user = [
    `请生成 **${count} 道** 词语/成语识记四选一练习题，用于公务员与事业单位言语理解备考。`,
    IDIOM_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ].join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: IDIOM_SYSTEM,
    temperature: 0.62,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: IdiomRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseIdiomMcqAiObject(item)
    if (!fields) return
    const q = buildIdiomQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q) questions.push(q)
  })

  const deduped = dedupeQuestions(questions)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  if (deduped.length >= count) return deduped.slice(0, count)

  const avoidTerms = deduped.map((q) => q.term)
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 6; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = avoidTerms.length
      ? `\n请勿重复以下词语：${avoidTerms.slice(-20).join('、')}`
      : ''
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道词语/成语识记四选一题。\n${IDIOM_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: IDIOM_SYSTEM, temperature: 0.55, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseIdiomMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildIdiomQuestionFromMcq({ ...fields, seq: slot })
      if (!q || deduped.some((x) => x.fingerprint === q.fingerprint)) continue
      deduped.push(q)
      avoidTerms.push(q.term)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题，请稍后重试`)
  }
  return deduped.slice(0, count)
}

const POETRY_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·文学常识/古诗文」命题专家，熟悉唐诗宋词、名家名句及公考高频篇目。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const POETRY_FORMAT = `
【题型】每题 questionType 随机取其一：
- poem-to-author（选作者）：给出诗句/词句（可 1～4 句），问作者是谁；选项为四位诗人/词人姓名
- poem-to-theme（选描写）：给出诗句/词句，问主要描写什么（意境、景色、天气、季节、情感等）；选项为四个概括性描述

【命题要求】
- 优先公考、事业编常考篇目：李白、杜甫、苏轼、辛弃疾、李清照、白居易、王维、杜牧、李商隐等
- 诗句须准确，可只取名句片段；term 填诗题（如「静夜思」）或词牌+首句标识
- poem-to-author 的 stem 只写诗句，**不得**出现作者姓名；correct 为作者全名
- poem-to-theme 的 stem 只写诗句，**不得**泄露正确答案；选项 8～24 字，概括描写对象或意境
- 干扰项须为同时代或常混诗人/相近意境描述
- explanation 用 1～2 句说明出处、背景或记忆要点

【JSON 示例】
选作者：{"questionType":"poem-to-author","term":"静夜思","stem":"床前明月光，疑是地上霜。举头望明月，低头思故乡。","correct":"李白","distractors":["杜甫","白居易","王维"],"explanation":"……"}
选描写：{"questionType":"poem-to-theme","term":"江雪","stem":"千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。","correct":"严冬江雪、孤寂寒境","distractors":["春日江南烟雨","秋夜洞庭月色","夏日荷塘清趣"],"explanation":"……"}
`.trim()

function dedupePoetryQuestions(items: PoetryRecognitionQuestion[]): PoetryRecognitionQuestion[] {
  const seen = new Set<string>()
  const out: PoetryRecognitionQuestion[] = []
  for (const q of items) {
    if (seen.has(q.fingerprint)) continue
    seen.add(q.fingerprint)
    out.push(q)
  }
  return out
}

export async function requestPoetryRecognitionMcqs(input: {
  count?: number
  onProgress?: (message: string) => void
}): Promise<PoetryRecognitionQuestion[]> {
  const count = input.count ?? POETRY_RECOGNITION_QUESTION_COUNT
  input.onProgress?.('正在向 DeepSeek 请求诗词题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选作者' : '选描写',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const user = [
    `请生成 **${count} 道** 古诗文识记四选一练习题，用于公务员与事业单位备考。`,
    POETRY_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ].join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: POETRY_SYSTEM,
    temperature: 0.62,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: PoetryRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePoetryMcqAiObject(item)
    if (!fields) return
    const q = buildPoetryQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q) questions.push(q)
  })

  const deduped = dedupePoetryQuestions(questions)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  if (deduped.length >= count) return deduped.slice(0, count)

  const avoidTerms = deduped.map((q) => q.term)
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 6; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = avoidTerms.length
      ? `\n请勿重复以下篇目：${avoidTerms.slice(-20).join('、')}`
      : ''
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道古诗文识记四选一题。\n${POETRY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: POETRY_SYSTEM, temperature: 0.55, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePoetryMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPoetryQuestionFromMcq({ ...fields, seq: slot })
      if (!q || deduped.some((x) => x.fingerprint === q.fingerprint)) continue
      deduped.push(q)
      avoidTerms.push(q.term)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题，请稍后重试`)
  }
  return deduped.slice(0, count)
}

const COMMON_SENSE_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·综合常识」命题专家，熟悉自然地理、生活常识、动植物、民俗、科技与生活等公考高频考点。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general（常识四选一）

【命题要求】
- 优先公考、事业编常考：动植物习性、特产功效、地理气候、生活常识、节日民俗、基础科技等
- 示例方向：罗汉果的功效/产地、芦苇的生长环境、四大名著、二十四节气、常见元素与现象等
- term 填知识点关键词（如「罗汉果」「芦苇」）
- stem 写完整问句，如「罗汉果的主要功效是？」「芦苇主要生长在？」
- 选项 4 个互斥，长度 6～28 字；干扰项须 plausible 但错误
- explanation 用 1～2 句简体中文说明

【JSON 示例】
{"questionType":"general","term":"罗汉果","stem":"罗汉果的主要功效是？","correct":"润肺止咳、生津利咽","distractors":["温中散寒、活血通络","清热解毒、利尿消肿","补气养血、安神益智"],"explanation":"……"}
`.trim()

function dedupeCommonSenseQuestions(items: CommonSenseQuestion[]): CommonSenseQuestion[] {
  const seen = new Set<string>()
  const out: CommonSenseQuestion[] = []
  for (const q of items) {
    if (seen.has(q.fingerprint)) continue
    seen.add(q.fingerprint)
    out.push(q)
  }
  return out
}

export async function requestCommonSenseMcqs(input: {
  count?: number
  onProgress?: (message: string) => void
}): Promise<CommonSenseQuestion[]> {
  const count = input.count ?? COMMON_SENSE_QUESTION_COUNT
  input.onProgress?.('正在向 DeepSeek 请求常识题目…')

  const user = [
    `请生成 **${count} 道** 常识判断四选一练习题，用于公务员与事业单位备考。`,
    COMMON_SENSE_FORMAT,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ].join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: COMMON_SENSE_SYSTEM,
    temperature: 0.62,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q) questions.push(q)
  })

  const deduped = dedupeCommonSenseQuestions(questions)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  if (deduped.length >= count) return deduped.slice(0, count)

  const avoidTerms = deduped.map((q) => q.term)
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 6; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = avoidTerms.length
      ? `\n请勿重复以下知识点：${avoidTerms.slice(-20).join('、')}`
      : ''
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道常识判断四选一题。\n${COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: COMMON_SENSE_SYSTEM, temperature: 0.55, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || deduped.some((x) => x.fingerprint === q.fingerprint)) continue
      deduped.push(q)
      avoidTerms.push(q.term)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题，请稍后重试`)
  }
  return deduped.slice(0, count)
}
