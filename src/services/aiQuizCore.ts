/**
 * AI 对话与出题共用底层。
 * 页面请继续从 `@/services/deepseek` 引入；不要直接依赖本文件里的未导出细节。
 */
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/app/aiJsonParse'
import { CHINESE_MCQ_CORRECTNESS_RULES } from '@/utils/chinese/chineseMcqAiFields'
import { hasStoredDeepSeekApiKey } from '@/utils/app/deepseekApiKeyStore'
import {
  isWenguApiReadyForCurrentUser,
  isWenguLoggedIn,
  WENGU_LOGIN_REQUIRED_HINT,
  wenguAuthTick,
} from '@/utils/computer/wenguAuthStore'
import { WENGU_MEMBER_CUSTOM_API_HINT } from '@/utils/computer/wenguApiOrigin'
import { aiChatCompletion, type AiMessage } from '@/services/ai'
import { aiRequestProgressText, getAiProvider, type AiProvider } from '@/utils/app/aiProviderStore'

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
export async function deepseekChatCompletion(
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

export async function deepseekChatRaw(
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

export async function requestComputerHandoutQuiz(input: {
  title: string
  material: string
  itemId: string
  counts: { choice: number; judge: number; calc: number }
  avoidStems?: string[]
  provider?: AiProvider
  onProgress?: (message: string) => void
}): Promise<import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[]> {
  const { parseComputerQuizAiItem, totalComputerQuizCount } = await import('@/utils/computer/computerHandoutQuiz')
  const total = totalComputerQuizCount(input.counts)
  if (total <= 0) throw new Error('请至少设置 1 道题')
  input.onProgress?.(aiRequestProgressText('计算机基础测验', input.provider))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(-24)
  const avoidHint = avoid.length
    ? `不要出与下列题干相近的题：\n- ${avoid.join('\n- ')}`
    : '本轮题干、考点组合不要彼此雷同。'
  const system = [
    '你是计算机基础知识命题老师。只根据给定讲义出题，用简体中文。',
    '只输出合法 JSON 数组，不要 markdown 围栏，不要其它说明。',
    '少而准：只出讲义里写明的考点，宁缺毋滥。解析必须证明 correct，不允许标答与解析打架。',
  ].join('\n')
  const user = [
    `讲义标题：${input.title}`,
    '讲义正文：',
    input.material.slice(0, 9000),
    '',
    `请出 ${total} 道题，数量：选择题 ${input.counts.choice}，判断题 ${input.counts.judge}（二选一：正确/错误），简答题 ${input.counts.calc}。`,
    '字段：kind(choice|judge|calc), term(考点短名), stem, options(选择题必须 4 项), distractors(可选，3 个干扰项), correct(必须是 options 里某一项的原文；判断题写「正确」或「错误」), explanation。',
    '【硬性规则·违反则该题作废】',
    '1. correct 必须写正确选项的全文，禁止写 A/B/C/D 或 1/2/3/4。',
    '2. 选项顺序随意，程序会打乱；不要把干扰项写成 correct。',
    '3. 题干、选项、correct、解析必须是同一道题。禁止题干问甲、答案却是乙。',
    '4. 解析先点明正确答案，再说明其余项为何错；解析支持另一选项即作废。',
    '5. 考点必须能在讲义中找到原句或等价表述，不要用讲义外的常识硬凑。',
    '6. 判断题句子必须能从讲义直接判对错，不要模棱两可。',
    avoidHint,
    '仅返回 JSON 数组。',
  ].join('\n')
  const collect = (parsed: unknown[]) => {
    const out: import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[] = []
    const seen = new Set<string>()
    for (const item of parsed) {
      const q = parseComputerQuizAiItem(item, { itemId: input.itemId, itemTitle: input.title })
      if (!q || seen.has(q.fingerprint)) continue
      seen.add(q.fingerprint)
      out.push(q)
    }
    return out
  }
  const ask = async () => {
    const raw = await deepseekChatRaw(user, {
      system,
      temperature: 0.28,
      maxTokens: 8192,
      provider: input.provider,
    })
    return collect(parseAiJsonArrayLenient(stripAiJsonFence(raw)))
  }
  let out = await ask()
  if (out.length < Math.max(1, Math.ceil(total * 0.6))) {
    input.onProgress?.('正在去掉不合格题并补出…')
    const extra = await ask()
    const seen = new Set(out.map((q) => q.fingerprint))
    for (const q of extra) {
      if (seen.has(q.fingerprint)) continue
      seen.add(q.fingerprint)
      out.push(q)
    }
  }
  if (out.length < Math.max(1, Math.ceil(total * 0.6))) {
    throw new Error(`仅成功生成 ${out.length} 道合格题，请稍后重试`)
  }
  return out.slice(0, total)
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


/** 近期已练词语，生成新题时避开 */
export function normalizeAvoidTerm(term: string): string {
  return term.trim().replace(/\s+/g, '')
}

export function buildAvoidTermsHint(label: string, terms: string[]): string {
  const unique = [...new Set(terms.map(normalizeAvoidTerm).filter(Boolean))]
  if (!unique.length) return ''
  return `\n【禁止重复】以下${label}近期已练过，本批**一律不得**再出（含近义换题干）：${unique.join('、')}`
}

