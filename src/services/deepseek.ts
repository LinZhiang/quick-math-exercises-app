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
  buildDataAnalysisQuestionFromMcq,
  DATA_ANALYSIS_QUESTION_COUNT,
  parseDataAnalysisMcqAiObject,
  type DataAnalysisDifficulty,
  type DataAnalysisQuestion,
} from '@/utils/dataAnalysisPractice'
import {
  buildGrowthGeneralQuestionFromMcq,
  buildGrowthHardFromSeedTemplate,
  detectGrowthEasySkillId,
  diagnoseGrowthGeneralBuildReject,
  GROWTH_GENERAL_QUESTION_COUNT,
  parseGrowthGeneralMcqAiObject,
  pickGrowthEasySkillPlan,
  pickGrowthHardFallbackSeed,
  pickGrowthHardSeedTemplates,
  takeGrowthEasyLocalSeeds,
  takeGrowthHardLocalSeeds,
  type GrowthEasySkillId,
  type GrowthEasySkillSlot,
  type GrowthHardSeedTemplate,
  type GrowthHardSkillSlot,
  type GrowthGeneralDifficulty,
  type GrowthGeneralQuestion,
} from '@/utils/dataAnalysisGrowthPractice'
import {
  buildGrowthInterYearHardFromSeedTemplate,
  buildGrowthInterYearQuestionFromMcq,
  detectGrowthInterYearEasySkillId,
  GROWTH_INTER_YEAR_QUESTION_COUNT,
  parseGrowthInterYearMcqAiObject,
  pickGrowthInterYearEasySkillPlan,
  pickGrowthInterYearHardFallbackSeed,
  pickGrowthInterYearHardSeedTemplates,
  takeGrowthInterYearEasyLocalSeeds,
  takeGrowthInterYearHardLocalSeeds,
  type GrowthInterYearDifficulty,
  type GrowthInterYearEasySkillId,
  type GrowthInterYearEasySkillSlot,
  type GrowthInterYearHardSeedTemplate,
  type GrowthInterYearQuestion,
} from '@/utils/dataAnalysisGrowthInterYearPractice'
import {
  buildGrowthAvgAnnualHardFromSeedTemplate,
  buildGrowthAvgAnnualQuestionFromMcq,
  detectGrowthAvgAnnualEasySkillId,
  GROWTH_AVG_ANNUAL_QUESTION_COUNT,
  parseGrowthAvgAnnualMcqAiObject,
  pickGrowthAvgAnnualEasySkillPlan,
  pickGrowthAvgAnnualHardFallbackSeed,
  pickGrowthAvgAnnualHardSeedTemplates,
  takeGrowthAvgAnnualEasyLocalSeeds,
  takeGrowthAvgAnnualHardLocalSeeds,
  type GrowthAvgAnnualDifficulty,
  type GrowthAvgAnnualEasySkillId,
  type GrowthAvgAnnualEasySkillSlot,
  type GrowthAvgAnnualHardSeedTemplate,
  type GrowthAvgAnnualQuestion,
} from '@/utils/dataAnalysisGrowthAvgAnnualPractice'
import {
  buildGrowthMixedHardFromSeedTemplate,
  buildGrowthMixedQuestionFromMcq,
  detectGrowthMixedEasySkillId,
  GROWTH_MIXED_HARD_SKILL_SLOTS,
  GROWTH_MIXED_QUESTION_COUNT,
  parseGrowthMixedMcqAiObject,
  pickGrowthMixedEasySkillPlan,
  pickGrowthMixedHardSeedTemplates,
  takeGrowthMixedEasyLocalSeeds,
  takeGrowthMixedHardLocalSeeds,
  type GrowthMixedDifficulty,
  type GrowthMixedEasySkillId,
  type GrowthMixedEasySkillSlot,
  type GrowthMixedHardSeedTemplate,
  type GrowthMixedQuestion,
} from '@/utils/dataAnalysisGrowthMixedPractice'
import {
  hasStoredDeepSeekApiKey,
} from '@/utils/deepseekApiKeyStore'
import {
  isWenguApiReadyForCurrentUser,
  isWenguLoggedIn,
  WENGU_LOGIN_REQUIRED_HINT,
  wenguAuthTick,
} from '@/utils/wenguAuthStore'
import { WENGU_MEMBER_CUSTOM_API_HINT } from '@/utils/wenguApiOrigin'
import {
  aiChatCompletion,
  type AiMessage,
} from '@/services/ai'
import { aiRequestProgressText, getAiProvider, type AiProvider } from '@/utils/aiProviderStore'

/** 是否可使用语文 AI（已登录走服务端代理；成员须自备 API；开发环境可回退本机 Key） */
export function isAiChatConfigured(): boolean {
  void wenguAuthTick.value
  if (isWenguLoggedIn()) return isWenguApiReadyForCurrentUser()
  if (import.meta.env.DEV) {
    if (hasStoredDeepSeekApiKey()) return true
    if (Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY?.trim())) return true
  }
  return false
}

export const DEEPSEEK_NOT_CONFIGURED_HINT = WENGU_LOGIN_REQUIRED_HINT

/** 成员未配置自定义 API 时的提示（供 UI 区分） */
export { WENGU_MEMBER_CUSTOM_API_HINT }

export type DeepSeekChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** 内部转发至 aiChatCompletion；可单次覆盖 provider（如一般增长强制豆包） */
async function deepseekChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; provider?: AiProvider },
): Promise<string> {
  return aiChatCompletion(messages as AiMessage[], {
    provider: options?.provider ?? getAiProvider(),
    capability: 'text',
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  })
}

async function deepseekChatRaw(
  user: string,
  options?: {
    system?: string
    temperature?: number
    maxTokens?: number
    provider?: AiProvider
  },
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
    '4. 阅读类须保留或微调 passage，不得丢掉材料胡编；选项字数/标点必须齐整，禁止正确项独最长或独含逗号顿号。',
    '',
    '【硬性质量·违反则整题作废】',
    '5. questionType 必须与题干/选项形态一致：',
    '   - word-to-meaning（选释义）：展示目标词，选项必须是四条释义（不是词语本身）；禁止填空题干 + 词语选项却标成选释义；',
    '   - meaning-to-word（选词语）：题干不得出现正确答案/term；选项为词语；correct 必须等于 term；',
    '6. 错别字题（typo）四个选项必须是四个不同词语，严禁同一成语的规范写法与错写同列（如禁止「变本加利」与「变本加厉」同时出现）；',
    '   「没有错别字的是」：correct=term；三个干扰项分别为另外三个不同词语的形近/音近错写（不得是 term 的错写）；',
    '   「有错别字的是」：correct=term 的错写且 ≠ term；三个干扰项为另外三个正确词语；选项中不得出现 term；解析可写规范写法，但规范写法不得进选项；',
    '   严禁把规范写法标成「有错别字」的答案；',
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
  '干扰项必须高迷惑：近义错位/望文生义/常混成语，禁止口语场景句导致一眼排除。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const IDIOM_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示成语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个成语；correct 必须等于 term

【命题要求】
- **仅出四字成语**（如「潜移默化」「脱颖而出」），不要出双音节实词、关联词、网络新词或非成语短语
- 优先事业编/国考言语理解、逻辑填空高频易混成语
- **干扰项迷惑力（极重要）**：释义四项书面齐整；干扰优先近义成语释义错位、拆字生义、常混成语义；禁止生活场景化错项
- 释义选项 10～24 字；成语选项须为四字；选词语干扰须为常混近义/形近成语（尽量有共同字）
- term 填目标成语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/比喻义/语境，禁止写出答案成语
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"潜移默化","stem":"「潜移默化」的正确释义是？","correct":"人的思想或性格在不知不觉中受到感染、影响而发生变化","distractors":["暗中活动以改变局面","默默积累而后突然显露","表面和缓而实际已生变故"],"explanation":"……"}
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
  input.onProgress?.(aiRequestProgressText('题目'))

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
  input.onProgress?.(aiRequestProgressText('诗词题目'))

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
  input.onProgress?.(aiRequestProgressText('生活科学题目'))

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
  input.onProgress?.(aiRequestProgressText('地理常识题目'))

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
  '选项必须干净：禁止把思考、自我纠正、问号、多个拼音写进选项正文。',
].join('\n')

const CHAR_LITERACY_FORMAT = `
【题型】每题 questionType 随机取其一：
- pronunciation（读音辨析）：考查加点字/词语正确读音，或「下列读音全部正确的是」「下列加点字读音有误的是」等公考常见问法
- typo（错别字）：考查「下列词语没有错别字的是」「下列词语有错别字的是」等，干扰项须含形近/音近错字

【命题要求·干扰要强且不能一眼露馅】
- 优先事业编/国考言语理解高频易错点：多音字、习惯性误读、形近字、音近别字
- term 填考点关键词的**规范写法**（如「纨绔」「暴殄天物」「一筹莫展」「和盘托出」）
- 读音题：四个选项外观一致，均为「词语 + 单一拼音注音」；干扰项只改拼音（常见误读）；**每个选项只能出现一处拼音括号**
- **严禁**把思考过程写进选项（如「……（yí）？不，……（shé）」「不对」「应该是」等自我纠正话术）；此类整题作废
- **严禁**选项中出现问号、感叹号、逗号拼接两套答案、或多个拼音注音
- 错别字题：四个选项均为完整词语/成语，外观一致；**不要**用引号、括号、（误）等标出哪个字错了
- **错别字极性（极重要）**：
  - **四个选项=四个不同词语**；严禁同一成语的规范写法与错写同列（如禁止同时出现「变本加利」与「变本加厉」）
  - 「没有错别字的是」：correct = term；三个 distractors 分别是**另外三个不同词语**的形近/音近错写（不得是 term 本身的错写）
  - 「有错别字的是」：correct 是 term 的错写且 ≠ term；三个 distractors 是**另外三个正确词语**；选项中**不得**出现 term；规范写法只写在 explanation 里
  - 严禁把规范写法标成「有错别字」题的答案；解析若写「正确写法是 X」，则 X 不得出现在 options 里，correct 也绝不能是 X
- **严禁**选项中出现：（误）、(误)、【误】、误读、错误、有误、×、✗，以及用 '' "" 「」 『』 包住某个字来暗示它是错字
- 四个选项必须「看起来都像正确答案」，只能靠知识判断，不能靠排版/标注判断
- explanation 用 1～2 句点明正确读音/正确字形及易混原因（解析里可以说哪里错，选项正文里不能说）

【JSON 示例】
读音：{"questionType":"pronunciation","term":"虚与委蛇","stem":"下列词语中加点字读音正确的是？","correct":"虚与委蛇（yí）","distractors":["虚与委蛇（shé）","虚与委蛇（yé）","虚与委蛇（tuó）"],"explanation":"「蛇」此处读 yí，不读 shé。"}
没有错别字：{"questionType":"typo","term":"和盘托出","stem":"下列词语没有错别字的是？","correct":"和盘托出","distractors":["世外桃园","再接再励","墨守陈规"],"explanation":"「和盘托出」书写正确；另三项分别为「桃源」「再厉」「成规」之误。"}
有错别字：{"questionType":"typo","term":"变本加厉","stem":"下列词语有错别字的是？","correct":"变本加利","distractors":["百折不挠","顶天立地","再接再厉"],"explanation":"「变本加利」应为「变本加厉」，「厉」意为猛烈，不可写作「利」。"}
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
  input.onProgress?.(aiRequestProgressText('字音字形题目'))

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
  input.onProgress?.(aiRequestProgressText('历史常识题目'))

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
  input.onProgress?.(aiRequestProgressText('中共党史题目'))

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
  input.onProgress?.(aiRequestProgressText('理论政策题目'))

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
  input.onProgress?.(aiRequestProgressText('法律常识题目'))

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
  input.onProgress?.(aiRequestProgressText('经济常识题目'))

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
  '干扰项必须高迷惑：近义错位/拆字望文生义/常混词，禁止口语场景句导致一眼排除。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const WORD_MEMORIZATION_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示词语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个词语；correct 必须等于 term

【命题要求】
- **禁止四字成语**；词语长度多为 2～3 字，或常见关联词（如「尽管如此」「不仅…而且…」类，可作 term 短标签）
- 优先事业编/国考言语理解逻辑填空高频易混实词、虚词、近义辨析
- **干扰项迷惑力（极重要）**：四个释义/词语须齐整、书面；干扰优先近义程度/对象偷换、拆字生义但像词典义、常混近义词；禁止「着急下班」「发布通知」「监督下属」等生活场景句
- 释义选项 8～24 字，风格统一如词典短释；词语选项须为非四字成语的短词语
- term 填目标词语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/用法/语境，禁止写出答案词语；干扰词须与 term 同义场或有共同汉字
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"顾惜","stem":"「顾惜」的正确释义是？","correct":"顾全爱惜；珍惜","distractors":["顾念爱护","怜惜体恤","眷顾思念"],"explanation":"「顾惜」侧重顾全并爱惜，对象可为身体、名誉、情面等。"}
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
  input.onProgress?.(aiRequestProgressText('词语识记题目'))

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
  input.onProgress?.(aiRequestProgressText('文言文题目'))

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
  input.onProgress?.(aiRequestProgressText('修辞运用题目'))

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
  '选项表面必须齐整：禁止正确项独最长（多1字也不行），标点风格一致；禁止正确项标点独多或独含逗号/顿号。',
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
1. **字数与标点齐整（硬性·系统会拒收）**：
   - **禁止正确项独最长**（哪怕只多 1 字也不行）；须有干扰项同长或更长。
   - 标点风格须一致：禁止正确项标点独多，禁止只有正确项带逗号/顿号/分号。
   - 禁止「正确项最完整、干扰项残缺短句」的反差；宁可四项都稍短或都稍长。
2. **半真半假**：每个错项都要包含材料中出现过的关键词或半对信息，再在「侧重、范围、程度、逻辑关系」上出错；读起来像合理概括，细辨才错。
3. **禁止低级错项**：不要用「只需」「仅仅」「唯一」「全部」「一定」「绝对」等极端词把选项做死；不要写与材料明文直接相反、小学生也能排除的句子。
4. **禁止形式泄题**：不要让正确项独用「统筹/既要又要/重点是…同时…」这类最周全句式，而错项全是片面短句。四个选项句式风格应同类。
5. **自检**：数四项字数与逗号——若「选最长」或「选标点最多」能稳中正确项，必须改到分不出。

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
  input.onProgress?.(aiRequestProgressText(`阅读理解（${modeLabel}）题目`))

  const historyHint = buildAvoidTermsHint('阅读材料主题', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「言语理解·阅读理解」四选一练习题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
    format,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；每题须含独立 passage。`,
    `**务必做到**：选项字数/标点齐整（禁止正确项独最长或独含逗号）；干扰半真半假；禁止绝对化低级错项；解析必须含 explanationFocus、explanationCorrect、explanationDistractors[3]（与 distractors 同序），禁止 A/B/C，语句完整。`,
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
          `字数/标点必须齐整，禁止正确项独最长。干扰半真半假。`,
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

const DATA_ANALYSIS_PERCENT_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「百分数与百分点」。
百分数=比例/增速本身；百分点=两个百分数之差。

【时期写法】优先用自然月份/季度说法：八月、八月份、七月、上半年、一季度、前三季度。
禁止「1-8月」「1至8月」「1—8月累计」等数字连写区间（读着别扭，也不符合本题展示习惯）。
比较前后期时写「比七月」「比上月」「比一季度」，不要写「比1至7月累计」。
材料与题干同一套说法。

【材料】可以保留与设问无关的数字或「回落/加快×个百分点」等迷惑条件（干扰阅读），不要为了「干净」删掉它们。

【对应材料必须点明·会圈·严校】有 passage 时：evidenceSpans 填 2～5 个「短」原文子串（须与 passage 逐字一致）。
必须且仅圈：解析真正用到的 ① 专名主体（如「股份制企业」「高技术制造业增加值」）；② 算式用到的数据（如「同比增长5.2%」「回落1.1个百分点」）。
禁止圈：时期词 alone（「八月份」「前八个月」）、解析写明忽略/无关/迷惑的指标与数字、题干未用到的同名指标第二处。
比较题两侧主体与两侧解题数据都要圈全；主体与数据分开圈，禁止整句一条。
method 写短做法名，如「两现期增速作差」「现期±百分点还原」「先还原再比差」。

【解析·算术必须对】explanation 须含：① 点明对应材料哪几处（与 evidenceSpans 一致）；② 做法；③ 可逐步验算的算式（如 3.7%-1.1%=2.6%，再 5.2%-2.6%=2.6）。
算式每一步加减必须算术正确；末步结果必须等于 correct 的数值。禁止出现「5.3%-5.1%=0.3」这类口算错误。
若有迷惑条件，在句末单独写「忽略……」，不要把迷惑数据写进算式。

【干扰选项要贴】三个 distractors 贴近正确答案，优先用材料中出现的数字做简单加减
（如正确 0.2，可用 0.2+0.4、|0.2−0.4|、材料里另一单独百分点等）。

选项单位四项一致：求差一律「N个百分点」（不要写%）。
只输出合法 JSON，不要 markdown 围栏。
`.trim()

const DATA_ANALYSIS_TOPIC_SEEDS = [
  '风力与光伏发电增速',
  '货物进出口增速',
  '社会消费品零售增速',
  '固定资产投资增速',
  '规模以上工业增加值增速',
  '居民消费价格涨幅',
  '城镇调查失业率相关增速对比',
  '高技术制造业与传统制造业增速',
  '货运量与客运量增速',
  '商品房销售面积增速',
]

function dataAnalysisPercentFormat(difficulty: DataAnalysisDifficulty): string {
  if (difficulty === 'easy') {
    return `
【简单】一步/两步：现期±百分点还原，或两增速求差。
passage 可短材料（约 30～60 字）或 ""；有材料时 evidenceSpans 必填 2～3 个短短语（仅解题用专名+数据），无材料填 []。
四个选项一律「N个百分点」。distractors 用数字简单加减，贴近正确项。
method：短做法名。explanation：对应材料短引 + 做法 + 算术正确的算式（末步=correct）。
JSON：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。
`.trim()
  }
  return `
【复杂】难度明显高于简单题：passage 约 60～110 字，至少 3 个百分数/百分点数据，须含 1～2 项迷惑条件（如无关指标增速，或「加快/回落×个百分点」但设问并不用它）。
题型优先两步：① 先用现期±百分点还原基期再比较；② 或先算两组增速差再与另一条件结合；禁止纯「读一个现成差值」的送分题。
时期只用「八月/前八个月/上半年」等，禁止「1-8月」「2024年1-8月」。
四个选项一律「N个百分点」；distractors 由材料数字简单加减得到，贴近正确项。
evidenceSpans：3～5 个短短语，且必须与 explanation 算式用到的专名/数据一一对应；迷惑条件不要进 spans。
method：短做法名（如「先还原再比差」「两现期增速作差」）。
explanation：两侧对应材料都点名 + 做法 + 逐步算式（每步算术正确，末步等于 correct）；句末可写忽略哪项迷惑条件。
JSON：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。
`.trim()
}

function tryBuildDataAnalysisQuestion(
  item: unknown,
  difficulty: DataAnalysisDifficulty,
  seq: number,
): DataAnalysisQuestion | null {
  const fields = parseDataAnalysisMcqAiObject(item)
  if (!fields) return null
  return buildDataAnalysisQuestionFromMcq({
    ...fields,
    difficulty,
    seq,
  })
}

async function requestOneDataAnalysisPercentMcq(input: {
  difficulty: DataAnalysisDifficulty
  seq: number
  avoidTerms: string[]
  topicHint?: string
  temperature?: number
}): Promise<DataAnalysisQuestion | null> {
  const diffLabel = input.difficulty === 'easy' ? '简单' : '复杂'
  const format = dataAnalysisPercentFormat(input.difficulty)
  const avoidHint = buildAvoidTermsHint('资料分析材料主题', input.avoidTerms)
  const topicLine = input.topicHint
    ? `本题材料主题请围绕「${input.topicHint}」（不要写成其它主题）。`
    : ''
  const raw = await deepseekChatRaw(
    [
      `请生成 1 道「百分数与百分点」四选一，难度 **${diffLabel}**。`,
      topicLine,
      format,
      avoidHint,
      `运算必须正确（算式逐步可验算，末步=correct）。evidenceSpans 只含解析用到的专名与数据，禁止圈迷惑条件/裸时期词。有材料时必须给 evidenceSpans+method；explanation 含对应材料+做法+算式。干扰项贴近正确项。四个选项单位必须一致。仅返回一个 JSON 对象。`,
    ]
      .filter(Boolean)
      .join('\n'),
    {
      system: DATA_ANALYSIS_PERCENT_SYSTEM,
      temperature: input.temperature ?? 0.5,
      maxTokens: input.difficulty === 'hard' ? 1100 : 560,
    },
  )
  return tryBuildDataAnalysisQuestion(parseAiJsonObjectLenient(raw), input.difficulty, input.seq)
}

export async function requestDataAnalysisPercentMcqs(input: {
  count?: number
  difficulty: DataAnalysisDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<DataAnalysisQuestion[]> {
  const count = input.count ?? DATA_ANALYSIS_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = difficulty === 'easy' ? '简单' : '复杂'
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const format = dataAnalysisPercentFormat(difficulty)
  const historyHint = buildAvoidTermsHint('资料分析材料主题', [...historyBlocked])

  const deduped: DataAnalysisQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)

  /** 本批只按指纹去重；主题撞车时仍可保留不同题干 */
  const pushIfNew = (q: DataAnalysisQuestion | null, strictTerm = false) => {
    if (!q) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    if (strictTerm && termKey && usedTerms.has(termKey)) return false
    // 历史主题尽量避开，但不因本批主题重复直接丢弃（否则并行易只剩 4 题）
    if (termKey && historyBlocked.has(termKey) && strictTerm) return false
    deduped.push(q)
    if (termKey) usedTerms.add(termKey)
    return true
  }

  const topicFor = (i: number, wave: number) =>
    DATA_ANALYSIS_TOPIC_SEEDS[(i + wave * 3) % DATA_ANALYSIS_TOPIC_SEEDS.length]!

  // —— 首轮：按主题种子并行，降低撞题 ——
  input.onProgress?.(
    difficulty === 'hard'
      ? `并行生成 ${count} 道复杂题…`
      : aiRequestProgressText(`资料分析·百分数与百分点（${diffLabel}）`),
  )

  if (difficulty === 'easy') {
    try {
      const raw = await deepseekChatRaw(
        [
          `请生成 **${count} 道**「百分数与百分点」四选一，难度 **${diffLabel}**。`,
          format,
          historyHint,
          `term 尽量不同；有材料时给 evidenceSpans+method（仅解题用信息）；解析含对应材料+做法+算术正确算式；干扰项贴近正确项；JSON 数组长度恰好 ${count}。`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        { system: DATA_ANALYSIS_PERCENT_SYSTEM, temperature: 0.45, maxTokens: 3200 },
      )
      const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
      parsed.forEach((item, idx) =>
        pushIfNew(tryBuildDataAnalysisQuestion(item, difficulty, idx + 1)),
      )
    } catch {
      /* fall through to补题 */
    }
  } else {
    const wave1 = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        requestOneDataAnalysisPercentMcq({
          difficulty,
          seq: i + 1,
          avoidTerms: [...historyBlocked],
          topicHint: topicFor(i, 0),
          temperature: 0.48,
        }).catch(() => null),
      ),
    )
    for (const q of wave1) pushIfNew(q)
  }

  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  // —— 缺口：并行补（带不同主题种子）最多 3 波 ——
  for (let wave = 1; deduped.length < count && wave <= 3; wave++) {
    const need = count - deduped.length
    input.onProgress?.(`补生成 ${need} 题（第 ${wave} 波）…`)
    const more = await Promise.all(
      Array.from({ length: need }, (_, i) =>
        requestOneDataAnalysisPercentMcq({
          difficulty,
          seq: 100 * wave + i,
          avoidTerms: [...usedTerms],
          topicHint: topicFor(i + deduped.length, wave),
          temperature: 0.5 + wave * 0.05,
        }).catch(() => null),
      ),
    )
    for (const q of more) pushIfNew(q)
  }

  // —— 仍不足：串行兜底，直到凑满或达到尝试上限 ——
  let guard = 0
  while (deduped.length < count && guard < 12) {
    guard += 1
    const slot = deduped.length + 1
    input.onProgress?.(`兜底补第 ${slot}/${count} 题（${guard}/12）…`)
    const q = await requestOneDataAnalysisPercentMcq({
      difficulty,
      seq: 900 + guard,
      avoidTerms: [...usedTerms],
      topicHint: topicFor(guard + 7, guard),
      temperature: 0.55 + (guard % 5) * 0.05,
    }).catch(() => null)
    pushIfNew(q)
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题，请稍后重试`)
  }
  return deduped.slice(0, count)
}

/** 一般增长：强制豆包（复杂题含统计图结构化数据，DeepSeek 不适用） */
const GROWTH_GENERAL_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——一般增长」。

【核心概念】基期/基期值、现期/现期值、增长量、增长率（增幅）；区分同比与环比。
常用关系：基期+增长量=现期；增长率=增长量/基期；现期=基期×(1+增长率)；基期=现期/(1+增长率)；增长量=现期−基期。

【高亮 evidenceSpans】只给短原文：专名 + 裸数字或「数字+单位」。

【复杂题·图题必须一致】
1. chart 必须同时含 type=bar 与 type=line，categories 与各 values 等长且≥4；
2. explanation 里用到的现期量/增速必须从图中照抄，禁止编造图上没有的数；
3. 求增长量最值年份时，必须用柱值相减，答案年份与计算结果一致；
4. 折线增速若用于设问，数值必须等于 line.values。

【解析】须含可验算算式（用 =）；算术正确；末步与 correct 一致（年份题除外）。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

const GROWTH_TOPIC_SEEDS = [
  '风力光伏发电增速',
  '国内财政收入',
  '第一产业增加值',
  '互联网业务收入',
  '研究生在学人数',
  '棉花单位面积产量',
  '居民人均消费支出名义与实际增长',
  '社会消费品零售额',
  '固定资产投资完成额',
  '城镇新增就业',
]

function growthGeneralFormat(difficulty: GrowthGeneralDifficulty): string {
  if (difficulty === 'easy') {
    return `
【简单·考点轮换】每题只考下面指定的一个知识点（见用户消息【本考点】），不要擅自改成「现期−增长量求基期」。
一轮卷子会覆盖：基期/现期/增长量/增长率、现期÷(1+r)、基期×(1+r)、增长量=现期×r/(1+r)、百分点还原增速、同比与环比。
passage 1～2 句（30～70 字），数字尽量整十。不要 chart（chart:null）。
evidenceSpans 示例：["国内财政收入","1200","200"]。
JSON 单对象：term,passage,chart:null,stem,correct,distractors[3],evidenceSpans,method,explanation。
method 写短做法名，须与本考点一致。
`.trim()
  }
  return `
【复杂·读图】必须同时给 bar+line，categories 与 values 等长且 ≥4。
【正确示例·请模仿结构与自洽方式】
{
  "term": "互联网业务收入增长量",
  "passage": "根据下图比较各年增长量。",
  "chart": {
    "title": "2015—2018年业务收入及增速",
    "categories": ["2015","2016","2017","2018"],
    "leftUnit": "亿元",
    "rightUnit": "%",
    "series": [
      { "name": "收入", "type": "bar", "values": [1000,1200,1500,1950], "unit": "亿元" },
      { "name": "增速", "type": "line", "values": [18,20,25,30], "unit": "%" }
    ]
  },
  "stem": "2016—2018年，业务收入增长量最大的年份是？",
  "correct": "2018年",
  "distractors": ["2016年","2017年","2015年"],
  "evidenceSpans": ["收入"],
  "method": "柱值相减比较增长量",
  "explanation": "增长量：2016:1200-1000=200；2017:1500-1200=300；2018:1950-1500=450。最大为2018年。"
}
【硬性】explanation 里的柱值/增速必须原样来自 chart；增长量=后年柱−前年柱；答案必须与计算一致。只输出一个 JSON 对象。
`.trim()
}

function tryBuildGrowthGeneralQuestion(
  item: unknown,
  difficulty: GrowthGeneralDifficulty,
  seq: number,
): GrowthGeneralQuestion | null {
  const fields = parseGrowthGeneralMcqAiObject(item)
  if (!fields) return null
  return buildGrowthGeneralQuestionFromMcq({
    ...fields,
    difficulty,
    seq,
  })
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label}超时（${Math.round(ms / 1000)}s）`)),
          ms,
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function requestOneGrowthGeneralMcq(input: {
  difficulty: GrowthGeneralDifficulty
  seq: number
  avoidTerms: string[]
  topicHint?: string
  skillSlot?: GrowthEasySkillSlot | GrowthHardSkillSlot
  temperature?: number
  allowDeepseekFallback?: boolean
  maxAttempts?: number
  timeoutMs?: number
}): Promise<{ question: GrowthGeneralQuestion | null; rejectReason?: string }> {
  const diffLabel = input.difficulty === 'easy' ? '简单' : '复杂'
  const format = growthGeneralFormat(input.difficulty)
  const avoidHint = buildAvoidTermsHint('资料分析·一般增长主题', input.avoidTerms)
  const topicLine = input.topicHint
    ? `本题材料主题请围绕「${input.topicHint}」。`
    : ''
  const skillLine = input.skillSlot
    ? `【本考点】${input.skillSlot.label}：${input.skillSlot.prompt}`
    : ''

  let lastReason = ''
  const providers: AiProvider[] =
    input.difficulty === 'easy' && input.allowDeepseekFallback
      ? [GROWTH_GENERAL_FORCE_PROVIDER, 'deepseek']
      : [GROWTH_GENERAL_FORCE_PROVIDER]

  const maxAttempts = input.maxAttempts ?? 1
  const timeoutMs =
    input.timeoutMs ?? (input.difficulty === 'hard' ? 32_000 : 35_000)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (let pi = 0; pi < providers.length; pi++) {
      const provider = providers[pi]!
      try {
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——一般增长」四选一，难度 **${diffLabel}**。`,
              skillLine,
              topicLine,
              format,
              avoidHint,
              input.difficulty === 'hard'
                ? `先想好 chart 数字，再写 stem/explanation；explanation 中的柱值/增速必须原样来自 chart；只返回一个 JSON 对象。`
                : `只返回一个 JSON 对象；correct+distractors 共 4 个互异选项；explanation 含算式。`,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_SYSTEM,
              temperature: (input.temperature ?? 0.35) + attempt * 0.08 + pi * 0.05,
              maxTokens: input.difficulty === 'hard' ? 2000 : 1600,
              provider,
            },
          ),
          timeoutMs,
          `${provider}出题`,
        )
        const parsed = parseAiJsonObjectLenient(raw)
        if (!parsed) {
          lastReason = `${provider} JSON 解析失败`
          continue
        }
        const q = tryBuildGrowthGeneralQuestion(parsed, input.difficulty, input.seq)
        if (q) return { question: q }
        lastReason = diagnoseGrowthGeneralBuildReject(parsed, input.difficulty)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        lastReason = msg.slice(0, 120)
        if (/429|限流|rate/i.test(msg)) await sleepMs(600)
        // 超时：本 attempt 结束，若还有 maxAttempts 会再试
        if (/超时/.test(msg)) continue
      }
    }
  }
  return { question: null, rejectReason: lastReason || '未知失败' }
}

/** 简单题：一次整包生成，减少往返失败 */
async function requestGrowthEasyBatch(
  count: number,
  skillPlan: GrowthEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthGeneralQuestion[]> {
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  const avoidHint = buildAvoidTermsHint('资料分析·一般增长主题', avoidTerms)
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——一般增长」简单四选一，组成 JSON 数组。`,
        `第 i 题必须对应下面第 i 个考点（不要 5 题都考同一公式）：`,
        skillLines,
        growthGeneralFormat('easy'),
        avoidHint,
        `term 尽量不同；chart 一律 null；每题含 explanation 算式。只输出 JSON 数组。`,
      ].join('\n\n'),
      {
        system: DATA_ANALYSIS_GROWTH_SYSTEM,
        temperature: 0.32,
        maxTokens: 5000,
        provider: GROWTH_GENERAL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    const out: GrowthGeneralQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthGeneralQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

/** 复杂题：锚定已校验图表，豆包只写题干/选项/解析（大幅降低失败率） */
async function requestHardGrowthAnchoredMcq(input: {
  seed: GrowthHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthGeneralQuestion | null> {
  const chartJson = JSON.stringify(input.seed.chart)
  const secondaryJson = input.seed.secondaryChart
    ? JSON.stringify(input.seed.secondaryChart)
    : ''
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可沿用或微调设问，但必须仍读给定图）。`
    : ''
  const dualHint = secondaryJson
    ? `另有【给定 secondaryChart】，须结合两图出题（比重/增量差等），禁止改数字。`
    : ''
  const prompt = [
    `请基于【给定 chart】${secondaryJson ? '与【给定 secondaryChart】' : ''}出 1 道「增长——一般增长」复杂四选一。`,
    skillHint,
    dualHint,
    `【给定 chart（禁止改动任何数字/类目）】`,
    chartJson,
    secondaryJson ? `【给定 secondaryChart（禁止改动）】\n${secondaryJson}` : '',
    `要求：`,
    `1. 返回 JSON 对象字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation；可带 chart/secondaryChart 但必须与给定完全一致。`,
    `2. explanation 只能使用图中出现的柱值/折线值；增长量=后年柱−前年柱；算术正确；须多步计算（不要只问「哪年最大/有几个」这类一眼题）。`,
    `3. passage 一两句即可。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_SYSTEM,
        temperature,
        maxTokens: 1600,
        provider: GROWTH_GENERAL_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthGeneralMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart,
      secondaryChart: input.seed.secondaryChart ?? null,
    })
    if (!fields) return null
    return buildGrowthGeneralQuestionFromMcq({
      ...fields,
      chart: input.seed.chart,
      secondaryChart: input.seed.secondaryChart ?? null,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* 首轮失败再试一次 */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthGeneralMcqs(input: {
  count?: number
  difficulty: GrowthGeneralDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthGeneralQuestion[]> {
  const count = input.count ?? GROWTH_GENERAL_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthGeneralQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthEasySkillId>()

  const pushIfNew = (q: GrowthGeneralQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const topicFor = (i: number, wave: number) =>
    GROWTH_TOPIC_SEEDS[(i + wave * 3) % GROWTH_TOPIC_SEEDS.length]!

  const skillPlan =
    difficulty === 'easy' ? pickGrowthEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 整包失败则逐题补 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      const { question } = await requestOneGrowthGeneralMcq({
        difficulty: 'easy',
        seq: 50 + i,
        avoidTerms: [...usedTerms],
        topicHint: topicFor(i, 1),
        skillSlot: slot,
        temperature: 0.4,
        allowDeepseekFallback: true,
        maxAttempts: 1,
        timeoutMs: 35_000,
      })
      pushIfNew(question)
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐，凑满 ${count} 题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    /**
     * 复杂题：锚定已校验图库出题。
     * 豆包只改题干/选项/解析，chart 固定 → 通过率高；失败立刻用同图保底题，不会卡在「已成功 0」。
     */
    const anchors = pickGrowthHardSeedTemplates(count)
    input.onProgress?.(`豆包按已校验图库出题（每题限时，失败即用同图保底）…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余题…`)
      for (const q of takeGrowthHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 隔年增长：强制豆包 */
const GROWTH_INTER_YEAR_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——隔年增长」。

【核心公式】
1. 隔年增速 q = (1+q1)(1+q2)−1 = q1+q2+q1×q2（q1、q2 为小数）
2. 隔年基期 = A / ((1+q1)(1+q2))
3. 常先用「百分点」还原上年增速：q2 = q1 ± 百分点差

【简单题】纯文字材料，无图。
【复杂题】chart 必须为两年累计同比增速双折线（series≥2，categories≥4，值为百分数）；explanation 中的增速须从图中照抄。
【时期写法】横轴与题干一律用自然说法：前3个月、前6个月、上半年、前三季度等。
禁止「1-6月」「1—6月」「1至6月」等数字连写区间。

【解析】须含可验算算式；算术正确；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthInterYearFormat(difficulty: GrowthInterYearDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】须读给定 chart（两年累计增速双折线）；禁止改图中数字。时期只用「前n个月/上半年」等，禁止「1—n月」。字段同简单题；chart 与给定一致。难度偏大。`
}

function tryBuildGrowthInterYearQuestion(
  item: unknown,
  difficulty: GrowthInterYearDifficulty,
  seq: number,
): GrowthInterYearQuestion | null {
  const fields = parseGrowthInterYearMcqAiObject(item)
  if (!fields) return null
  return buildGrowthInterYearQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthInterYearEasyBatch(
  count: number,
  skillPlan: GrowthInterYearEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthInterYearQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·隔年增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——隔年增长」简单四选一，组成 JSON 数组。`,
        growthInterYearFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthInterYearQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthInterYearQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardGrowthInterYearAnchoredMcq(input: {
  seed: GrowthInterYearHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthInterYearQuestion | null> {
  const chartJson = JSON.stringify(input.seed.chart)
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可微调设问，必须读给定图）。`
    : ''
  const prompt = [
    `请基于【给定 chart】出 1 道「增长——隔年增长」复杂四选一。`,
    skillHint,
    `【给定 chart（禁止改数字/类目）】`,
    chartJson,
    growthInterYearFormat('hard'),
    `explanation 用隔年公式，增速取自图；难度偏大。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
        temperature,
        maxTokens: 1600,
        provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包隔年增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthInterYearMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart,
    })
    if (!fields) return null
    return buildGrowthInterYearQuestionFromMcq({
      ...fields,
      chart: input.seed.chart,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* retry */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthInterYearMcqs(input: {
  count?: number
  difficulty: GrowthInterYearDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthInterYearQuestion[]> {
  const count = input.count ?? GROWTH_INTER_YEAR_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthInterYearQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthInterYearEasySkillId>()

  const pushIfNew = (q: GrowthInterYearQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthInterYearEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthInterYearEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道隔年增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthInterYearEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包隔年增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·隔年增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——隔年增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthInterYearFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包隔年增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthInterYearQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐隔年增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthInterYearEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    const anchors = pickGrowthInterYearHardSeedTemplates(count)
    input.onProgress?.(`豆包按隔年增长双折线图库出题…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthInterYearAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthInterYearHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthInterYearHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余隔年增长复杂题…`)
      for (const q of takeGrowthInterYearHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 年均增长：强制豆包 */
const GROWTH_AVG_ANNUAL_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——年均增长」。

【核心公式】
1. 年均增长量=(末期−初期)/期数；期数=末年−初年
2. 末期=初期+期数×年均增长量；期数=(末期−初期)/年均增长量
3. 年均增长率 r 满足 (1+r)^期数=末期/初期；末期=初期×(1+r)^n；初期=末期/(1+r)^n
4. 多期总增速=(1+q1)(1+q2)…(1+qn)−1
5. 近似：增速较小且选项差距大时，年均增长率≈年均增长量/初期（略偏大）
6. 特征数字：1.1^n、1.2^n 等对照末期/初期
7. 初期判定：一般「2014—2018」初期=2014、期数=4；「这四年2018—2021」初期=2017、期数=4；五年规划「十三五2016—2020」初期=2015、期数=5

【简单题】纯文字，无图无表；数字好算。
【复杂题】须读给定 chart（柱+折线）或 table；禁止改图/表中数字；explanation 取值须与图/表一致。
题干须多步推理（外推、比较、初期陷阱等），难度≥教材真题。
涉及开方的年均增长率题：选项须给出百分数/具体约值，禁止把 \\sqrt 表达式当作选项；解析里可写开方过程。
【解析】须含可验算算式；算术正确；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthAvgAnnualFormat(difficulty: GrowthAvgAnnualDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】须读给定 chart 或 table；禁止改数字；设问偏难（多步）。选项用百分数/数量约值，不要用根号表达式作选项。字段同简单题；chart/table 与给定一致。`
}

function tryBuildGrowthAvgAnnualQuestion(
  item: unknown,
  difficulty: GrowthAvgAnnualDifficulty,
  seq: number,
): GrowthAvgAnnualQuestion | null {
  const fields = parseGrowthAvgAnnualMcqAiObject(item)
  if (!fields) return null
  return buildGrowthAvgAnnualQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthAvgAnnualEasyBatch(
  count: number,
  skillPlan: GrowthAvgAnnualEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthAvgAnnualQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·年均增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——年均增长」简单四选一，组成 JSON 数组。`,
        growthAvgAnnualFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
        temperature: 0.4,
        maxTokens: 3600,
        provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthAvgAnnualQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthAvgAnnualQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardGrowthAvgAnnualAnchoredMcq(input: {
  seed: GrowthAvgAnnualHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthAvgAnnualQuestion | null> {
  const hasTable = !!input.seed.table
  const dataBlock = hasTable
    ? `【给定 table（禁止改数字/行列）】\n${JSON.stringify(input.seed.table)}`
    : `【给定 chart（禁止改数字/类目）】\n${JSON.stringify(input.seed.chart)}`
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可微调设问，必须读给定图/表）。`
    : ''
  const prompt = [
    `请基于给定数据出 1 道「增长——年均增长」复杂四选一。`,
    skillHint,
    dataBlock,
    growthAvgAnnualFormat('hard'),
    `explanation 用年均增长公式，数值取自图/表；难度偏大。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
        temperature,
        maxTokens: 1800,
        provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包年均增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthAvgAnnualMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart ?? null,
      table: input.seed.table ?? null,
    })
    if (!fields) return null
    return buildGrowthAvgAnnualQuestionFromMcq({
      ...fields,
      chart: input.seed.chart ?? null,
      table: input.seed.table ?? null,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* retry */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthAvgAnnualMcqs(input: {
  count?: number
  difficulty: GrowthAvgAnnualDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthAvgAnnualQuestion[]> {
  const count = input.count ?? GROWTH_AVG_ANNUAL_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthAvgAnnualQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthAvgAnnualEasySkillId>()

  const pushIfNew = (q: GrowthAvgAnnualQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthAvgAnnualEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthAvgAnnualEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道年均增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthAvgAnnualEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包年均增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·年均增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——年均增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthAvgAnnualFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
              temperature: 0.4,
              maxTokens: 1400,
              provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包年均增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthAvgAnnualQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐年均增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthAvgAnnualEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    const anchors = pickGrowthAvgAnnualHardSeedTemplates(count)
    input.onProgress?.(`豆包按年均增长图/表库出题…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthAvgAnnualAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthAvgAnnualHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthAvgAnnualHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余年均增长复杂题…`)
      for (const q of takeGrowthAvgAnnualHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 混合增长：强制豆包；纯文字无图 */
const GROWTH_MIXED_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_MIXED_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——混合增长」。

【核心结论与公式】
1. 整体 A=A1+A2 时，q_A=(A1+A2)/(A1/(1+q1)+A2/(1+q2))−1
2. q_A 必介于 q1 与 q2 之间（可多部分推广）
3. q_A 偏向基期较大的部分；基期≈现期/(1+q)
4. 若 q1>q2：基期1>基期2 则 q_A 在 (q1+q2)/2 与 q1 之间；反之在 q2 与均值之间
5. 十字交叉：基期1/基期2=(q_A−q2)/(q1−q_A)；可用现期比近似基期比
6. 已知整体与一部分增速，求另一部分：另一部分必在整体外侧（大于较大者或小于较小者）

【简单题】纯文字，计算简明，多用区间排除/偏向判断。
【复杂题】仍纯文字（不要 chart）；难度必须≥教材难题：
- 禁止「只有一个选项落在两增速之间」这种秒杀题；
- 求整体增速：区间内至少两个选项，须十字交叉或精确算基期；
- 反推另一部分：外侧至少两个选项，须结合占比/权重估算；
- 反推基期比：用十字交叉，比值尽量非整比。
【解析】须含可验算推理或算式；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthMixedFormat(difficulty: GrowthMixedDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无图；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无图；难度≥书上真题（选项贴近、须计算/估权，禁止区间秒杀）。字段同简单题。`
}

function tryBuildGrowthMixedQuestion(
  item: unknown,
  difficulty: GrowthMixedDifficulty,
  seq: number,
): GrowthMixedQuestion | null {
  const fields = parseGrowthMixedMcqAiObject(item)
  if (!fields) return null
  return buildGrowthMixedQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthMixedEasyBatch(
  count: number,
  skillPlan: GrowthMixedEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthMixedQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——混合增长」简单四选一，组成 JSON 数组。`,
        growthMixedFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthMixedQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthMixedQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestGrowthMixedHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<GrowthMixedQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', avoidTerms)
  const skillLines = GROWTH_MIXED_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——混合增长」复杂四选一，组成 JSON 数组。`,
        growthMixedFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `数字换新；每题选项须「贴近」，不能靠介于两者之间一眼排除；须十字交叉/精确式/权重估算。explanation 写清步骤，末句「答案为…」。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthMixedQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthMixedQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

/** 单题锚定：仅短超时试一次，失败立刻放弃（由本地种子补） */
async function requestHardGrowthMixedAnchoredMcq(input: {
  seed: GrowthMixedHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthMixedQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改数字与设问，但须同一考点且更难或持平）。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「增长——混合增长」复杂四选一（纯文字，不要图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    growthMixedFormat('hard'),
    `explanation 末句写「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包混合增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthMixedMcqAiObject(parsed)
    if (!fields) return null
    return buildGrowthMixedQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthMixedMcqs(input: {
  count?: number
  difficulty: GrowthMixedDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthMixedQuestion[]> {
  const count = input.count ?? GROWTH_MIXED_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthMixedQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthMixedEasySkillId>()

  const pushIfNew = (q: GrowthMixedQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthMixedEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthMixedEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道混合增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthMixedEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包混合增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——混合增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthMixedFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: GROWTH_MIXED_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包混合增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthMixedQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐混合增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthMixedEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    // 复杂题：优先 1 次整包；缺题再短超时单题；仍缺则立刻本地种子，避免 5×长超时卡住
    input.onProgress?.(`豆包整包生成 ${count} 道混合增长复杂题…`)
    try {
      const batch = await withTimeout(
        requestGrowthMixedHardBatch(count, [...usedTerms]),
        48_000,
        '豆包混合增长复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickGrowthMixedHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardGrowthMixedAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildGrowthMixedHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeGrowthMixedHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}
