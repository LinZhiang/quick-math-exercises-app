import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/aiJsonParse'
import {
  CHINESE_MCQ_CORRECTNESS_RULES,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import {
  buildCharLiteracyQuestionFromMcq,
  CHAR_LITERACY_QUESTION_COUNT,
  parseCharLiteracyMcqAiObject,
  type CharLiteracyQuestion,
} from '@/utils/charLiteracyPractice'
import {
  buildGeographyCommonSenseQuestionFromMcq,
  GEOGRAPHY_COMMON_SENSE_QUESTION_COUNT,
  parseGeographyCommonSenseMcqAiObject,
  type GeographyCommonSenseQuestion,
} from '@/utils/geographyCommonSensePractice'
import {
  buildHistoryCommonSenseQuestionFromMcq,
  HISTORY_COMMON_SENSE_QUESTION_COUNT,
  parseHistoryCommonSenseMcqAiObject,
  type HistoryCommonSenseQuestion,
} from '@/utils/historyCommonSensePractice'
import {
  buildLifeCommonSenseQuestionFromMcq,
  LIFE_COMMON_SENSE_QUESTION_COUNT,
  parseLifeCommonSenseMcqAiObject,
  type LifeCommonSenseQuestion,
} from '@/utils/lifeCommonSensePractice'
import {
  buildIdiomQuestionFromMcq,
  IDIOM_RECOGNITION_QUESTION_COUNT,
  parseIdiomMcqAiObject,
  type IdiomRecognitionQuestion,
} from '@/utils/idiomRecognitionPractice'
import {
  buildPartyHistoryQuestionFromMcq,
  PARTY_HISTORY_QUESTION_COUNT,
  parsePartyHistoryMcqAiObject,
  type PartyHistoryQuestion,
} from '@/utils/partyHistoryPractice'
import {
  buildPoetryQuestionFromMcq,
  parsePoetryMcqAiObject,
  POETRY_RECOGNITION_QUESTION_COUNT,
  type PoetryRecognitionQuestion,
} from '@/utils/poetryRecognitionPractice'
import {
  buildTheoryPolicyQuestionFromMcq,
  THEORY_POLICY_QUESTION_COUNT,
  parseTheoryPolicyMcqAiObject,
  type TheoryPolicyQuestion,
} from '@/utils/theoryPolicyPractice'
import {
  buildLegalCommonSenseQuestionFromMcq,
  LEGAL_COMMON_SENSE_QUESTION_COUNT,
  parseLegalCommonSenseMcqAiObject,
  type LegalCommonSenseQuestion,
} from '@/utils/legalCommonSensePractice'
import {
  buildEconomyCommonSenseQuestionFromMcq,
  ECONOMY_COMMON_SENSE_QUESTION_COUNT,
  parseEconomyCommonSenseMcqAiObject,
  type EconomyCommonSenseQuestion,
} from '@/utils/economyCommonSensePractice'
import {
  buildWordMemorizationQuestionFromMcq,
  WORD_MEMORIZATION_QUESTION_COUNT,
  parseWordMemorizationMcqAiObject,
  type WordMemorizationQuestion,
} from '@/utils/wordMemorizationPractice'
import {
  buildClassicalChineseQuestionFromMcq,
  CLASSICAL_CHINESE_QUESTION_COUNT,
  parseClassicalChineseMcqAiObject,
  type ClassicalChineseQuestion,
} from '@/utils/classicalChinesePractice'
import {
  buildRhetoricUsageQuestionFromMcq,
  RHETORIC_USAGE_QUESTION_COUNT,
  parseRhetoricUsageMcqAiObject,
  type RhetoricUsageQuestion,
} from '@/utils/rhetoricUsagePractice'
import {
  buildReadingComprehensionQuestionFromMcq,
  READING_COMPREHENSION_QUESTION_COUNT,
  parseReadingComprehensionMcqAiObject,
  type ChineseReadingQuestionType,
  type ReadingComprehensionQuestion,
  readingComprehensionQuestionTypeLabel,
} from '@/utils/readingComprehensionPractice'
import {
  DEEPSEEK_NOT_CONFIGURED_HINT,
  deepseekAuthTick,
  hasStoredDeepSeekApiKey,
  resolveDeepSeekApiKey,
} from '@/utils/deepseekApiKeyStore'

const WENGU_AI_SOURCE = 'quick-math-exercises-app'
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions'

/** 是否已授权 DeepSeek（用户本机 Key；开发环境可回退 VITE_） */
export function isAiChatConfigured(): boolean {
  void deepseekAuthTick.value
  if (hasStoredDeepSeekApiKey()) return true
  if (import.meta.env.DEV && Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY?.trim())) return true
  return false
}

export { DEEPSEEK_NOT_CONFIGURED_HINT }

export type DeepSeekChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function deepseekChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const key = await resolveDeepSeekApiKey()
  if (!key) {
    throw new Error(DEEPSEEK_NOT_CONFIGURED_HINT)
  }
  const res = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
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

/** 关键题变式：根据原题 JSON 生成一道新四选一（仅返回 JSON 对象） */
export async function requestChinesePracticeVariantJson(input: {
  sourceTitle: string
  schemaHint: string
  originalQuestionJson: string
}): Promise<unknown> {
  const system = [
    `你是公考/事业编「${input.sourceTitle}」命题专家，专门根据错题本原题生成**变式题**。`,
    '只输出合法 JSON 对象，不要 markdown 代码围栏，不要其它说明。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')
  const user = [
    '请依据下列【原题】生成 1 道四选一变式题。',
    '变式要求：',
    '1. 可换提问方式（换题干/换角度），但仍考查同一知识要点或材料理解能力；',
    '2. 可继续以原正确选项为答案，也可在保证科学性的前提下，改为考查原干扰项中某一知识点（此时新 correct 必须对应该新问法的真正正确答案）；',
    '3. 选项可改写，干扰仍要有迷惑性；不要几乎原样照抄；',
    '4. 阅读类须保留或微调 passage，不得丢掉材料胡编；选项字数适度齐长即可（正确项或干扰项均可略长），禁止正确项明显独最长到靠长短蒙对。',
    '',
    '【硬性质量·违反则整题作废】',
    '5. questionType 必须与题干/选项形态一致：',
    '   - word-to-meaning（选释义）：展示目标词，选项必须是四条释义（不是词语本身）；禁止填空题干 + 词语选项却标成选释义；',
    '   - meaning-to-word（选词语）：题干不得出现正确答案/term；选项为词语；correct 必须等于 term；',
    '6. 错别字题（typo）优先出「下列词语没有错别字的是」：correct=规范写法=term，三个干扰项为同一词的形近/音近错写；',
    '   若出「有错别字的是」：correct 必须是错写且 ≠ term，选项中规范写法 term 恰好出现一次且为干扰项，其余两项不得再是同一词的错写（禁止多解）；',
    '   严禁把规范写法标成「有错别字」的答案，也严禁解析写「正确写法是 X」却把 X 标成有错别字答案；',
    '7. 题干只允许唯一最优答案；禁止两个近义项都合理（如步履维艰/举步维艰同列且题干无法区分）；解析不得写「也是…之意/两者均可」。',
    '8. 任何字段不得提前泄露答案（题干、term 展示字段与选项形态错配即泄题）。',
    '',
    `【输出字段】\n${input.schemaHint}`,
    '',
    `【原题】\n${input.originalQuestionJson}`,
    '',
    '仅返回一个 JSON 对象。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')
  const raw = await deepseekChatRaw(user, {
    system,
    temperature: 0.55,
    maxTokens: 2000,
  })
  return parseAiJsonObjectLenient(raw)
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
  '你是公务员考试与事业单位考试「言语理解」命题专家，专门命制**四字成语**识记题（含选词填空、类比推理高频成语）。',
  '不要出非成语实词、关联词或双音节普通词语；目标必须是常用四字成语。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const IDIOM_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示成语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个成语；correct 必须等于 term

【命题要求】
- **仅出四字成语**（如「潜移默化」「脱颖而出」），不要出双音节实词、关联词、网络新词或非成语短语
- 优先事业编/国考言语理解、逻辑填空高频易混成语
- 干扰项须为近义、形近或常混的释义/成语
- 释义选项 12～28 字，成语选项须为四字
- term 填目标成语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/比喻义/语境，禁止写出答案成语
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"潜移默化","stem":"「潜移默化」的正确释义是？","correct":"……","distractors":["……","……","……"],"explanation":"……"}
选词语：{"questionType":"meaning-to-word","term":"脱颖而出","stem":"比喻人的才能全部显露出来的是？","correct":"脱颖而出","distractors":["出类拔萃","崭露头角","锋芒毕露"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function normalizeAvoidTerm(term: string): string {
  return term.trim().replace(/\s+/g, '')
}

function buildAvoidTermsHint(label: string, terms: string[]): string {
  const unique = [...new Set(terms.map(normalizeAvoidTerm).filter(Boolean))]
  if (!unique.length) return ''
  return `\n【禁止重复】以下${label}近期已练过，本批**一律不得**再出（含近义换题干）：${unique.join('、')}`
}

function dedupeQuestions(
  items: IdiomRecognitionQuestion[],
  blockedTerms?: Set<string>,
): IdiomRecognitionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: IdiomRecognitionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestIdiomRecognitionMcqs(input: {
  count?: number
  /** 跨轮次近期已出过的词语，连续约 90 道内避开 */
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<IdiomRecognitionQuestion[]> {
  const count = input.count ?? IDIOM_RECOGNITION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选释义' : '选词语',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('成语', [...blocked])
  const user = [
    `请生成 **${count} 道** **四字成语**识记四选一练习题（不要出非成语词语），用于公务员与事业单位言语理解备考。`,
    IDIOM_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同，且均为四字成语。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: IDIOM_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: IdiomRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseIdiomMcqAiObject(item)
    if (!fields) return
    const q = buildIdiomQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('成语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道四字成语识记四选一题（不要出非成语词语）。\n${IDIOM_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: IDIOM_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseIdiomMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildIdiomQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
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
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupePoetryQuestions(
  items: PoetryRecognitionQuestion[],
  blockedTerms?: Set<string>,
): PoetryRecognitionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: PoetryRecognitionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestPoetryRecognitionMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PoetryRecognitionQuestion[]> {
  const count = input.count ?? POETRY_RECOGNITION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求诗词题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选作者' : '选描写',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('篇目', [...blocked])
  const user = [
    `请生成 **${count} 道** 古诗文识记四选一练习题，用于公务员与事业单位备考。`,
    POETRY_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term（篇目）必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: POETRY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: PoetryRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePoetryMcqAiObject(item)
    if (!fields) return
    const q = buildPoetryQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupePoetryQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('篇目', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道古诗文识记四选一题。\n${POETRY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: POETRY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePoetryMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPoetryQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const LIFE_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·生活科学」命题专家，熟悉物理、化学、生物、科技与生活等高频易考点。',
  '题目以识记与辨析为主，难度中等偏易；不要出公式推导、复杂计算或专业实验压轴题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const LIFE_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、生活现象解释、易混提法辨析；忌过深理论。

【命题比例·必须遵守】（15 题一轮）
- **物理**：约 **25%～30%**（力、热、光、声、电与生活应用，如惯性、沸腾、凸透镜、导体绝缘体等高频点）
- **化学**：约 **25%～30%**（物质变化、酸碱、燃烧条件、常见材料与食品安全常识等高频点）
- **生物**：约 **20%～25%**（人体系统、植物生理、遗传基础、生态与传染病防疫常识等高频点）
- **科技与生活**：约 **20%～25%**（互联网/通信基础、新能源、航天航空常考常识、日常数字技术概念，忌过深专业细节）

【命题要求】
- term 填知识点关键词（如「惯性」「酸碱中和」「光合作用」「5G」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 依据现行常用表述，表述准确但通俗

【JSON 示例】
{"questionType":"general","term":"惯性","stem":"物体保持原有运动状态的性质称为？","correct":"惯性","distractors":["重力","摩擦力","弹力"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeLifeCommonSenseQuestions(
  items: LifeCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): LifeCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: LifeCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestLifeCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<LifeCommonSenseQuestion[]> {
  const count = input.count ?? LIFE_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求生活科学题目…')

  const historyHint = buildAvoidTermsHint('生活科学知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「生活科学」四选一练习题（物理/化学/生物/科技与生活，**难度中等偏易、高频考点**）。`,
    LIFE_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: LIFE_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: LifeCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseLifeCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildLifeCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeLifeCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('生活科学知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道生活科学四选一题（C 类公基难度，物理/化学/生物/科技与生活高频点，勿出难题）。\n${LIFE_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: LIFE_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseLifeCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildLifeCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const GEOGRAPHY_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·地理常识」命题专家，熟悉中国自然地理、人文地理、世界地理、地球与地图等高频易考点。',
  '题目以识记与辨析为主，难度中等偏易；不要出复杂计算、等高线压轴分析或过难区域综合题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const GEOGRAPHY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、常考地理事实、易混区位辨析；忌偏难怪。

【命题比例·必须遵守】（15 题一轮）
- **中国自然地理**：约 **30%～35%**（山川河湖、气候类型、地形阶梯、资源分布、自然灾害等高频点）
- **中国人文地理**：约 **25%～30%**（行政区划与省会、人口与城市、农业工业布局、交通线等高频点）
- **世界地理**：约 **15%～20%**（大洲大洋、主要国家首都/气候/资源、重要海峡运河等高频基础点）
- **地球与地图**：约 **15%～20%**（经纬网、时区日界线、地球运动与四季昼夜、比例尺方向等高频基础点）

【命题要求】
- term 填知识点关键词（如「秦岭—淮河」「长江」「时区」「板块构造」）
- stem 写完整问句；选项互斥；干扰项为易混概念或易混地名
- explanation 用 1～2 句简体中文说明
- 表述准确但通俗，贴近公基真题风格

【JSON 示例】
{"questionType":"general","term":"秦岭—淮河","stem":"我国冬季平均气温 0℃等温线大体经过的地理分界线是？","correct":"秦岭—淮河一线","distractors":["黄河流域","长江流域","南岭一线"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeGeographyCommonSenseQuestions(
  items: GeographyCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): GeographyCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: GeographyCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestGeographyCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GeographyCommonSenseQuestion[]> {
  const count = input.count ?? GEOGRAPHY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求地理常识题目…')

  const historyHint = buildAvoidTermsHint('地理知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「地理常识」四选一练习题（中国自然/人文、世界地理、地球与地图，**难度中等偏易、高频考点**）。`,
    GEOGRAPHY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: GEOGRAPHY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: GeographyCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseGeographyCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildGeographyCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeGeographyCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('地理知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道地理常识四选一题（C 类公基难度，中国地理/世界地理/地球与地图高频点，勿出难题）。\n${GEOGRAPHY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: GEOGRAPHY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseGeographyCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildGeographyCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const CHAR_LITERACY_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·字音字形」命题专家，熟悉公考高频易错读音、多音字、形近字与音近错别字。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const CHAR_LITERACY_FORMAT = `
【题型】每题 questionType 随机取其一：
- pronunciation（读音辨析）：考查加点字/词语正确读音，或「下列读音全部正确的是」「下列加点字读音有误的是」等公考常见问法
- typo（错别字）：考查「下列词语没有错别字的是」「下列词语有错别字的是」等，干扰项须含形近/音近错字

【命题要求·干扰要强且不能一眼露馅】
- 优先事业编/国考言语理解高频易错点：多音字、习惯性误读、形近字、音近别字
- term 填考点关键词的**规范写法**（如「纨绔」「暴殄天物」「一筹莫展」「和盘托出」）
- 读音题：四个选项外观一致，均为「词语 + 拼音」或同格式注音；干扰项只改拼音（常见误读），**不要**写（误）、错、×、引号点错等任何对错提示
- 错别字题：四个选项均为完整词语/成语，外观一致；**不要**用引号、括号、（误）等标出哪个字错了
- **错别字极性（极重要）**：
  - 「没有错别字的是」：correct 必须 = term（规范写法）；三个 distractors 均为该词的形近/音近错写
  - 「有错别字的是」：correct 必须是错写且 ≠ term；distractors 中恰好含 term（规范写法）一次，另外两项须是**其它正确词语**（不得再是同一词的其它错写，否则多解）
  - 严禁把规范写法标成「有错别字」题的答案；解析若写「正确写法是 X」，则「有错别字」题的 correct 绝不能是 X
- **严禁**选项中出现：（误）、(误)、【误】、误读、错误、有误、×、✗，以及用 '' "" 「」 『』 包住某个字来暗示它是错字
- 四个选项必须「看起来都像正确答案」，只能靠知识判断，不能靠排版/标注判断
- explanation 用 1～2 句点明正确读音/正确字形及易混原因（解析里可以说哪里错，选项正文里不能说）

【JSON 示例】
读音：{"questionType":"pronunciation","term":"纨绔","stem":"下列加点字读音正确的是？","correct":"纨绔子弟（kù）","distractors":["纨绔子弟（kuā）","纨绔子弟（guā）","纨绔子弟（huà）"],"explanation":"……"}
没有错别字：{"questionType":"typo","term":"一筹莫展","stem":"下列词语没有错别字的是？","correct":"一筹莫展","distractors":["一愁莫展","一绸莫展","一酬莫展"],"explanation":"……"}
有错别字：{"questionType":"typo","term":"和盘托出","stem":"下列词语有错别字的是？","correct":"合盘托出","distractors":["和盘托出","淋漓尽致","司空见惯"],"explanation":"「合盘托出」中的「合」应为「和」，正确写法是「和盘托出」。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeCharLiteracyQuestions(
  items: CharLiteracyQuestion[],
  blockedTerms?: Set<string>,
): CharLiteracyQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: CharLiteracyQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestCharLiteracyMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<CharLiteracyQuestion[]> {
  const count = input.count ?? CHAR_LITERACY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求字音字形题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '读音辨析' : '错别字',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('考点词语', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编高频「字音字形」四选一练习题，干扰项要强、易混。`,
    CHAR_LITERACY_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CHAR_LITERACY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CharLiteracyQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCharLiteracyMcqAiObject(item)
    if (!fields) return
    const q = buildCharLiteracyQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeCharLiteracyQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('考点词语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道字音字形四选一题（读音或错别字均可）。\n${CHAR_LITERACY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: CHAR_LITERACY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCharLiteracyMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildCharLiteracyQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const HISTORY_COMMON_SENSE_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·历史」命题专家，熟悉中国史高频考点；世界史仅作少量补充。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const HISTORY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】
- **以中国史为主**：约 **85%～90%** 为中国史（古代史 + 近现代史）
- **世界史从少**：至多约 **10%～15%**（15 题中世界史不超过 2 题；补单题时优先出中国史）
- 面向浙江杭州等地事业编/公考常见考法，少出冷门外国史细节

【命题要求】
- 中国古代史优先：秦汉唐宋元明清重大事件、制度、人物、都城与改革
- 中国近现代史优先：鸦片战争至新中国成立前关键节点、条约、运动、人物
- 世界史仅保留极少高频：如两次世界大战、工业革命等极常见点，不要堆砌国别琐事
- term 填知识点关键词（如「辛亥革命」「贞观之治」「鸦片战争」）
- stem 写完整问句；选项 4 个互斥、干扰项易混但错误
- explanation 用 1～2 句简体中文说明

【JSON 示例】
{"questionType":"general","term":"辛亥革命","stem":"辛亥革命爆发于哪一年？","correct":"1911年","distractors":["1919年","1921年","1949年"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeHistoryCommonSenseQuestions(
  items: HistoryCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): HistoryCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: HistoryCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestHistoryCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<HistoryCommonSenseQuestion[]> {
  const count = input.count ?? HISTORY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求历史常识题目…')

  const historyHint = buildAvoidTermsHint('历史知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编「历史常识」四选一练习题（面向杭州等地考情：**绝大部分为中国史**，世界史极少）。`,
    HISTORY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: HISTORY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: HistoryCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseHistoryCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildHistoryCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeHistoryCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('历史知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道历史常识四选一题（优先中国史，非必要不要出世界史）。\n${HISTORY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: HISTORY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseHistoryCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildHistoryCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const PARTY_HISTORY_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·中共党史」命题专家，熟悉建党以来重要会议、事件、人物、路线方针与时间节点。',
  '命题以会议内容、事件意义、人物贡献、路线方针为主，纯时间节点题从少。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const PARTY_HISTORY_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】（按考点考察角度分配，15 题一轮时严格控制数量）
- **时间节点从少**：纯问「哪一年/哪一月/哪一天召开/发生」的题约 **10%～15%**（15 题中至多 **2** 题；补单题时优先非时间题）
- **重要会议（内容/意义/地点/决策）**：约 **30%～35%**（会议确立了什么、通过了什么、历史意义等，勿改写成纯年份题）
- **重要事件**：约 **25%～30%**（经过、结果、意义、与同期事件辨析）
- **人物与贡献**：约 **15%～20%**（谁提出/领导/贡献，人物与事件对应关系）
- **路线方针与决议**：约 **15%～20%**（路线、方针、重要决议名称与核心内容）

【禁止偏题】
- 不要批量出「××会议召开于哪一年」「××事件发生于哪一年」同类题
- 干扰项优先易混会议名称、决议内容、人物贡献、事件意义；仅时间题才用易混年份作选项

【命题要求】
- 优先事业编/国考常考：一大至二十大、遵义会议、长征、抗战、解放战争、建国、改革开放、十一届三中全会、重要决议与人物贡献等
- term 填知识点关键词（如「遵义会议」「十一届三中全会」「中共一大」）
- stem 写完整问句；选项互斥；同一批题考察角度要多样
- explanation 用 1～2 句简体中文说明
- 表述客观、准确，符合公开权威表述

【JSON 示例】（示例为会议内容题，勿模仿成时间题）
{"questionType":"general","term":"遵义会议","stem":"遵义会议的重大历史意义是？","correct":"事实上确立了毛泽东在党中央和红军的领导地位","distractors":["通过了《关于建国以来党的若干历史问题的决议》","确立了社会主义市场经济体制的改革目标","提出了社会主义初级阶段的基本路线"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupePartyHistoryQuestions(
  items: PartyHistoryQuestion[],
  blockedTerms?: Set<string>,
): PartyHistoryQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: PartyHistoryQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestPartyHistoryMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PartyHistoryQuestion[]> {
  const count = input.count ?? PARTY_HISTORY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求中共党史题目…')

  const historyHint = buildAvoidTermsHint('党史知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编「中共党史」四选一练习题（**时间节点从少**，以会议内容、事件意义、人物贡献、路线方针为主）。`,
    PARTY_HISTORY_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；考察角度须按【命题比例】分配，纯时间题不超过约 15%。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: PARTY_HISTORY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: PartyHistoryQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePartyHistoryMcqAiObject(item)
    if (!fields) return
    const q = buildPartyHistoryQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupePartyHistoryQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('党史知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道中共党史四选一题（优先会议内容/事件意义/人物贡献/路线方针，非必要不要出纯时间节点题）。\n${PARTY_HISTORY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: PARTY_HISTORY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePartyHistoryMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPartyHistoryQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const THEORY_POLICY_SYSTEM = [
  '你是事业单位与公务员考试「政治理论·政策法规」命题专家，熟悉习近平新时代中国特色社会主义思想、党的二十大报告、党的二十届三中全会《决定》及近年政府工作报告高频考点。',
  '命题紧扣公开权威表述，选项准确、干扰项为易混提法；不要编造未公布的文件条款。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const THEORY_POLICY_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】（15 题一轮时严格控制数量）
- **习近平新时代中国特色社会主义思想**：约 **35%～40%**（核心要义、十个明确、十四个坚持、十三个方面成就、中国式现代化、新发展理念、高质量发展等）
- **党的二十大报告**：约 **25%～30%**（中心任务、两步走、五个必由之路、三个务必、总体国家安全观、全过程人民民主等报告表述）
- **党的二十届三中全会《决定》**：约 **20%～25%**（进一步全面深化改革总目标、七个聚焦、到 2029 年完成改革任务等《决定》要点）
- **政府工作报告及相关政策表述**：约 **15%～20%**（近年政府工作报告高频目标、举措、民生与经济发展表述，与上述理论衔接）

【命题要求】
- 面向事业编/公考常考：核心概念辨析、原文关键表述填空式选择、目标/原则/任务对应关系
- term 填知识点关键词（如「中国式现代化」「进一步全面深化改革」「高质量发展」「全过程人民民主」）
- stem 写完整问句；选项互斥；干扰项为易混概念或相近文件提法，勿用明显错误到一眼识破的表述
- explanation 用 1～2 句简体中文说明依据（文件/报告出处可点到即可）
- 表述客观、准确，符合公开发布的权威表述；避免过时或相互矛盾的说法

【JSON 示例】
{"questionType":"general","term":"中国式现代化","stem":"党的二十大报告指出，中国式现代化是人口规模巨大的现代化，是全体人民共同富裕的现代化，是物质文明和精神文明相协调的现代化，是人与自然和谐共生的现代化，还是？","correct":"走和平发展道路的现代化","distractors":["对外扩张发展的现代化","依附外部市场的现代化","以资本为中心的现代化"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeTheoryPolicyQuestions(
  items: TheoryPolicyQuestion[],
  blockedTerms?: Set<string>,
): TheoryPolicyQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: TheoryPolicyQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestTheoryPolicyMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<TheoryPolicyQuestion[]> {
  const count = input.count ?? THEORY_POLICY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求理论政策题目…')

  const historyHint = buildAvoidTermsHint('理论政策知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「理论政策」四选一练习题（聚焦习近平新时代中国特色社会主义思想、二十大报告、二十届三中全会《决定》及政府工作报告）。`,
    THEORY_POLICY_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；考察来源须按【命题比例】分配。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: THEORY_POLICY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: TheoryPolicyQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseTheoryPolicyMcqAiObject(item)
    if (!fields) return
    const q = buildTheoryPolicyQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeTheoryPolicyQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('理论政策知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道理论政策四选一题（按命题比例，覆盖习思想/二十大报告/三中全会《决定》/政府工作报告）。\n${THEORY_POLICY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: THEORY_POLICY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseTheoryPolicyMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildTheoryPolicyQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const LEGAL_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·法律常识」命题专家，熟悉宪法、民法、刑法、行政法高频易考点。',
  '题目以识记与辨析为主，难度中等偏易，不要出案例分析压轴题、不要堆砌冷门法条细节。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const LEGAL_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、常考制度、易混辨析即可；忌偏难怪。

【命题比例·必须遵守】（15 题一轮）
- **宪法**：约 **25%～30%**（国体政体、公民基本权利义务、国家机构、全国人大/国务院职权等高频点）
- **民法**：约 **25%～30%**（民事主体、民事权利、合同基础、时效、婚姻继承常考点）
- **刑法**：约 **20%～25%**（犯罪构成基础、正当防卫/紧急避险、刑罚种类、常见罪名辨识）
- **行政法**：约 **20%～25%**（行政行为、行政处罚/许可/强制、行政复议与诉讼基础、公务员法常识）

【命题要求】
- term 填知识点关键词（如「公民基本权利」「行政处罚」「正当防卫」「诉讼时效」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 依据现行常用表述，表述准确但通俗

【JSON 示例】
{"questionType":"general","term":"正当防卫","stem":"为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为，对不法侵害人造成损害的，属于？","correct":"正当防卫","distractors":["紧急避险","过失犯罪","意外事件"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeLegalCommonSenseQuestions(
  items: LegalCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): LegalCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: LegalCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestLegalCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<LegalCommonSenseQuestion[]> {
  const count = input.count ?? LEGAL_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求法律常识题目…')

  const historyHint = buildAvoidTermsHint('法律知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「法律常识」四选一练习题（宪法/民法/刑法/行政法，**难度中等偏易、高频考点**）。`,
    LEGAL_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四法。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: LEGAL_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: LegalCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseLegalCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildLegalCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeLegalCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('法律知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道法律常识四选一题（C 类公基难度，宪法/民法/刑法/行政法高频点，勿出难题）。\n${LEGAL_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: LEGAL_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseLegalCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildLegalCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const ECONOMY_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·经济常识」命题专家，熟悉微观经济、宏观经济、社会主义市场经济高频易考点。',
  '题目以概念识记与简单辨析为主，难度中等偏易；不要出公式推导、复杂图表或专业金融计算。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const ECONOMY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、政策工具辨识、易混提法辨析；忌过深理论。

【命题比例·必须遵守】（15 题一轮）
- **微观经济**：约 **30%～35%**（供给需求、价格、市场类型、机会成本、边际效用等高频基础点）
- **宏观经济**：约 **30%～35%**（GDP、通胀通缩、财政货币政策、失业率、经济周期等高频点）
- **社会主义市场经济**：约 **30%～35%**（基本经济制度、所有制、分配制度、市场决定作用与更好发挥政府作用等高频表述）

【命题要求】
- term 填知识点关键词（如「通货膨胀」「财政政策」「社会主义市场经济」「需求价格弹性」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 表述准确但通俗，贴近公基真题风格

【JSON 示例】
{"questionType":"general","term":"通货膨胀","stem":"一般物价水平持续上涨、货币购买力下降的经济现象称为？","correct":"通货膨胀","distractors":["通货紧缩","滞胀","流动性陷阱"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeEconomyCommonSenseQuestions(
  items: EconomyCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): EconomyCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: EconomyCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestEconomyCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<EconomyCommonSenseQuestion[]> {
  const count = input.count ?? ECONOMY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求经济常识题目…')

  const historyHint = buildAvoidTermsHint('经济知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「经济常识」四选一练习题（微观/宏观/社会主义市场经济，**难度中等偏易、高频考点**）。`,
    ECONOMY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖三类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: ECONOMY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: EconomyCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseEconomyCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildEconomyCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeEconomyCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('经济知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道经济常识四选一题（C 类公基难度，微观/宏观/社会主义市场经济高频点，勿出难题）。\n${ECONOMY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: ECONOMY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseEconomyCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildEconomyCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const WORD_MEMORIZATION_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·词语识记」命题专家，专门命制**非四字成语**的词语识记题（实词、虚词、关联词、近义辨析等）。',
  '禁止出四字成语；目标必须是双音节/三音节词语或常见关联词、短语。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const WORD_MEMORIZATION_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示词语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个词语；correct 必须等于 term

【命题要求】
- **禁止四字成语**；词语长度多为 2～3 字，或常见关联词（如「尽管如此」「不仅…而且…」类，可作 term 短标签）
- 优先事业编/国考言语理解逻辑填空高频易混实词、虚词、近义辨析
- 干扰项须为近义、形近或常混的释义/词语
- 释义选项 10～28 字；词语选项须为非四字成语的短词语
- term 填目标词语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/用法/语境，禁止写出答案词语
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"砥砺","stem":"「砥砺」的正确释义是？","correct":"磨炼；激励","distractors":["指责批评","敷衍应付","故意拖延"],"explanation":"……"}
选词语：{"questionType":"meaning-to-word","term":"贻误","stem":"因拖延或差错而造成不利影响，可用哪个词语？","correct":"贻误","distractors":["延误","耽误","辜负"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeWordMemorizationQuestions(
  items: WordMemorizationQuestion[],
  blockedTerms?: Set<string>,
): WordMemorizationQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: WordMemorizationQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestWordMemorizationMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<WordMemorizationQuestion[]> {
  const count = input.count ?? WORD_MEMORIZATION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求词语识记题目…')

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选释义' : '选词语',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('词语', [...blocked])
  const user = [
    `请生成 **${count} 道** **非四字成语**词语识记四选一练习题（实词、虚词、关联词、近义辨析等；禁止出四字成语），用于公务员与事业单位言语理解备考。`,
    WORD_MEMORIZATION_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同，且均非四字成语。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: WORD_MEMORIZATION_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: WordMemorizationQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseWordMemorizationMcqAiObject(item)
    if (!fields) return
    const q = buildWordMemorizationQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeWordMemorizationQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('词语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道非四字成语词语识记四选一题（禁止出四字成语）。\n${WORD_MEMORIZATION_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: WORD_MEMORIZATION_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseWordMemorizationMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildWordMemorizationQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const CLASSICAL_CHINESE_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·文言文」命题专家，熟悉文言实词虚词、古今异义、通假字、文言句式、一词多义等公考/事业编高频考点。',
  '难度适中，贴近真题识记与辨析风格；不要出过长文言翻译压轴题。',
  '硬性：题干所引文言必须是原文中连续完整的语句；严禁把不同段落、不相邻的句子用省略号拼接出题。',
  '硬性：引文须带足语境，禁止只截三四个字的碎片（如仅「信而见疑」）；至少用对句/整句，使没读过原文的人也能大致看懂。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const CLASSICAL_CHINESE_FORMAT = `
【题型】questionType 固定为 general

【命题要求】
- 聚焦：文言实词虚词、古今异义、通假字、文言句式、一词多义
- 优先公考、事业编常考字词与句式，难度适中
- term 填短知识点标签，如「之」「以为」「通假字·女」「宾语前置」「被动句·见」
- stem 写完整问句；若引用课文/名篇例句，**必须截取原文连续完整语句**（可含标点的整句或紧邻数句），**禁止**拆分、拼接不同位置的句子，**禁止**「前半句……后半句」跨段硬拼
- **引文长度与语境（硬性）**：
  - 禁止过短碎片。反例：只写「信而见疑」——没读原文很难懂。
  - 正例：至少写成「信而见疑，忠而被谤」；更好如「臣诚恐见欺于王而负赵」（一眼能感到被动与担忧）。
  - 引文汉字一般不少于约 8～10 字，或含「，」等句读的对句/整句；考点词可加点，但上下文必须够读。
- 反例（严禁）：把《愚公移山》「以君之力……且焉置土石？」与后文「以为神」拼进同一题干
- 正例：考「以为」时只引连续原句「操蛇之神闻之，惧其不已也，告之于帝。帝感其诚，命夸娥氏二子负二山，一厝朔东，一厝雍南，众人以为神。」
- 选项互斥；干扰项为易混义项或相近句式
- explanation 用完整通顺的简体中文说明；考「以为」等古今异义时须点明古义/今义差别（如「以为」为「以（之）为」，古义把……当作，今义认为）

【JSON 示例】
{"questionType":"general","term":"被动句·见","stem":"下列句中「见」表被动的一项所在语境是？「信而见疑，忠而被谤」","correct":"被","distractors":["看见","出现","会见"],"explanation":"「见疑」即被怀疑；与「被谤」对举，是被动用法。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeClassicalChineseQuestions(
  items: ClassicalChineseQuestion[],
  blockedTerms?: Set<string>,
): ClassicalChineseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ClassicalChineseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestClassicalChineseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ClassicalChineseQuestion[]> {
  const count = input.count ?? CLASSICAL_CHINESE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求文言文题目…')

  const historyHint = buildAvoidTermsHint('文言知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「文言文」四选一练习题（文言实词虚词、古今异义、通假字、文言句式、一词多义，**难度适中、高频考点**）。`,
    CLASSICAL_CHINESE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CLASSICAL_CHINESE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: ClassicalChineseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseClassicalChineseMcqAiObject(item)
    if (!fields) return
    const q = buildClassicalChineseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeClassicalChineseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('文言知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道文言文四选一题（实词虚词/古今异义/通假字/句式/一词多义等高频点）。题干引文必须是原文连续完整语句，禁止跨段拼接；引文须带足语境（勿只截「信而见疑」这类过短碎片，宜用「信而见疑，忠而被谤」或更完整句）。\n${CLASSICAL_CHINESE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: CLASSICAL_CHINESE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseClassicalChineseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildClassicalChineseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const RHETORIC_USAGE_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·修辞辨识与表达效果」命题专家，熟悉比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等公考高频修辞。',
  '可考「这句话用了什么修辞」或修辞表达效果辨析；难度适中。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const RHETORIC_USAGE_FORMAT = `
【题型】questionType 固定为 general

【命题要求】
- 聚焦修辞辨识与表达效果：比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等
- 也可出效果辨析（如增强气势、生动形象、突出强调等）
- 优先公考、事业编言语理解高频考点
- term 填短知识点标签（如「比喻」「排比·效果」「借代」）
- stem 可含短句例句并设问；选项互斥；干扰项为易混修辞或相近效果表述
- explanation 用 1～2 句简体中文说明

【JSON 示例】
{"questionType":"general","term":"比喻","stem":"「人生如逆旅，我亦是行人」主要运用的修辞是？","correct":"比喻","distractors":["夸张","借代","拟人"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeRhetoricUsageQuestions(
  items: RhetoricUsageQuestion[],
  blockedTerms?: Set<string>,
): RhetoricUsageQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: RhetoricUsageQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestRhetoricUsageMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<RhetoricUsageQuestion[]> {
  const count = input.count ?? RHETORIC_USAGE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.('正在向 DeepSeek 请求修辞运用题目…')

  const historyHint = buildAvoidTermsHint('修辞知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「修辞辨识与表达效果」四选一练习题（比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等，**公考高频**）。`,
    RHETORIC_USAGE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: RHETORIC_USAGE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: RhetoricUsageQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseRhetoricUsageMcqAiObject(item)
    if (!fields) return
    const q = buildRhetoricUsageQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeRhetoricUsageQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('修辞知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道修辞辨识/表达效果四选一题（公考高频修辞）。\n${RHETORIC_USAGE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: RHETORIC_USAGE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseRhetoricUsageMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildRhetoricUsageQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const READING_COMPREHENSION_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·阅读理解」命题专家，熟悉主旨观点、细节判断、词句理解、推断下文、标题添加等高频题型。',
  '命题必须对标国考/联考真题难度：正确项不可一眼可辨，干扰项须「真假参半」、有迷惑力。',
  '选项字数采适度原则：四项大致齐长；正确项可以最长，干扰项也可以最长，不要刻意把正确项写短或把错项灌水凑长。',
  '仅当正确项明显比所有干扰项都长、靠「选最长」可蒙对时才不合格。',
  '严禁「只需/唯一/全部」等绝对化低级错项；干扰项要信息密度高、读来像正确答案。',
  '解析必须结构化：explanationFocus + explanationCorrect + explanationDistractors[3]（与 distractors 同序）；禁止用 A/B/C 指代选项；语句完整，禁止残缺断句。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

function readingComprehensionModeGuidance(mode: ChineseReadingQuestionType): string {
  switch (mode) {
    case 'main-idea':
      return [
        '【本题型专属】考主旨/意图/观点：问这段文字主要说明什么、意在强调什么、核心观点是？',
        '正确项：全面准确概括文意重点（可含侧重+统筹），语气克制，避免堆砌材料原句。',
        '干扰项优先：①以偏概全（只抓次要信息当主旨）；②程度/侧重偷换（把「重点」改成「更重要/取代」）；③范围扩大或缩小；④对策类偷换（文中未说的绝对方案）。四类都应读来「像那么回事」。',
      ].join('\n')
    case 'detail':
      return [
        '【本题型专属】考细节判断：哪项正确/错误或能从文中推出。',
        '干扰项优先：偷换概念、无中生有但表述像材料语气、混淆充分/必要、张冠李戴；忌一眼假的绝对句。',
      ].join('\n')
    case 'word-sentence':
      return [
        '【本题型专属】考词句理解：stem 标出需理解的词句。',
        '干扰项优先：字面义、超语境引申、邻句意思串位；正确项结合语境，勿比其它项明显更「正确腔」。',
      ].join('\n')
    case 'infer-next':
      return [
        '【本题型专属】考推断下文：下文最可能写什么。',
        '干扰项优先：上文已写完的内容、无关新话题、跳跃过大但措辞正式的续写；正确项紧扣末句衔接。',
      ].join('\n')
    case 'title':
      return [
        '【本题型专属】考标题添加。',
        '干扰项优先：过宽、过窄、只抓细节、标题党式夸张；四标题字数接近，勿靠长短泄题。',
      ].join('\n')
  }
}

function readingComprehensionFormat(mode: ChineseReadingQuestionType): string {
  const label = readingComprehensionQuestionTypeLabel(mode)
  return `
【题型】questionType **固定**为 \`${mode}\`（${label}），本批每题都必须是该题型，不得混用其它题型。

${readingComprehensionModeGuidance(mode)}

【干扰项质量·必须遵守】
1. **长度适度（平衡，非控死）**：
   - 四个选项字数应大致接近（跨度建议约 18 字内）。
   - **允许**正确项略长或最长，也**允许**某个干扰项更长——不要为了反套路硬把正确项写短、或给错项灌水凑字数。
   - **禁止**的只有极端情形：正确项比每一个干扰项都明显更长（甩开约 8 字以上），以至于「选最长」就能蒙对。
2. **半真半假**：每个错项都要包含材料中出现过的关键词或半对信息，再在「侧重、范围、程度、逻辑关系」上出错；读起来像合理概括，细辨才错。
3. **禁止低级错项**：不要用「只需」「仅仅」「唯一」「全部」「一定」「绝对」等极端词把选项做死；不要写与材料明文直接相反、小学生也能排除的句子。
4. **禁止形式泄题**：不要让正确项独用「统筹/既要又要/重点是…同时…」这类最周全句式，而错项全是片面短句。四个选项句式风格应同类。
5. **自检**：数四项字数——谁最长都可以，只要不是正确项明显独最长到靠长短蒙；再问「只看长短会不会稳选某一项？」——若会，微调使长短接近。

【命题要求】
- 每题必须有 passage：短材料约 150～350 字，公考风格议论文/说明文片段，信息有轻重主次（便于出半真干扰）
- term：短主题标签（如「基层治理」「科技创新」）
- stem：针对材料的设问；correct + distractors[3]，共 4 个互斥选项
- 材料与设问须匹配题型 ${label}（${mode}）

【解析字段·硬性·禁止混乱】
系统会打乱选项顺序，界面显示为「选项1～4」。你**不要**在解析里写 A/B/C 或「干扰项A」。必须输出结构化字段，由系统按最终题面序号拼接：
- explanationFocus：主旨/解题依据在文中的位置（完整短句，如「文末结论句强调通过制度创新推动内部一体化」）
- explanationCorrect：正确项为何正确（完整短句，不要写「选项几」，不要残缺）
- explanationDistractors：字符串数组，长度必须为 3，且与 distractors 数组**一一对应**（第 i 条解释第 i 个干扰项为何错）
- 可选再给 explanation 作备份长文，但仍禁止使用 A/B/C；语句须完整收尾（以句号结束），禁止半截话如「且字数比…」

【JSON 示例】（实际内容勿照抄；注意 explanationDistractors 与 distractors 同序）
{"questionType":"${mode}","term":"乡村振兴","passage":"……","stem":"这段文字旨在强调：","correct":"产业振兴是乡村振兴的重点任务","distractors":["完善乡村基础设施应作为当前首要着力点","吸引人才回流即可自然带动乡村产业全面升级","组织建设应重新排定产业与人才工作次序"],"explanationFocus":"文末收束句点明产业振兴是乡村振兴的重点","explanationCorrect":"准确概括文意重点，与结尾结论一致","explanationDistractors":["把基础设施写成首要着力点，主次颠倒","夸大人才回流作用，属于过度推断","把组织建设抬到统领一切，偏离文意重心"],"explanation":"主旨在文末。正确项概括产业振兴重点；三个干扰项分别主次颠倒、过度推断、重心偏移。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES
}

function dedupeReadingComprehensionQuestions(
  items: ReadingComprehensionQuestion[],
  blockedTerms?: Set<string>,
): ReadingComprehensionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ReadingComprehensionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestReadingComprehensionMcqs(input: {
  count?: number
  mode: ChineseReadingQuestionType
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ReadingComprehensionQuestion[]> {
  const count = input.count ?? READING_COMPREHENSION_QUESTION_COUNT
  const mode = input.mode
  const modeLabel = readingComprehensionQuestionTypeLabel(mode)
  const format = readingComprehensionFormat(mode)
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(`正在向 DeepSeek 请求阅读理解（${modeLabel}）题目…`)

  const historyHint = buildAvoidTermsHint('阅读材料主题', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「言语理解·阅读理解」四选一练习题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
    format,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；每题须含独立 passage。`,
    `**务必做到**：选项字数适度齐长；干扰半真半假；禁止绝对化低级错项；解析必须含 explanationFocus、explanationCorrect、explanationDistractors[3]（与 distractors 同序），禁止 A/B/C，语句完整。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: READING_COMPREHENSION_SYSTEM,
    temperature: 0.62,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: ReadingComprehensionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseReadingComprehensionMcqAiObject(item)
    if (!fields) return
    const q = buildReadingComprehensionQuestionFromMcq({
      ...fields,
      questionType: mode,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeReadingComprehensionQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题（已拒收字数极端失衡等不合格项）…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('阅读材料主题', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请生成第 ${slot} 道阅读理解四选一题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
          `字数适度齐长即可。干扰半真半假。`,
          `解析硬性：explanationFocus、explanationCorrect、explanationDistractors[3]（与 distractors 一一对应）；禁止 A/B/C；语句完整收尾。`,
          `禁止「只需/唯一」类低级错项。`,
          format,
          avoidHint,
          `仅返回一个 JSON 对象。`,
        ]
          .filter(Boolean)
          .join('\n'),
        { system: READING_COMPREHENSION_SYSTEM, temperature: 0.65, maxTokens: 1600 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseReadingComprehensionMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildReadingComprehensionQuestionFromMcq({
        ...fields,
        questionType: mode,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}
