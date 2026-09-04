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
  counts: { choice: number; judge: number; calc: number; short: number }
  learningPath?: string[]
  avoidStems?: string[]
  provider?: AiProvider
  onProgress?: (message: string) => void
}): Promise<import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[]> {
  const { parseComputerQuizAiItem, totalComputerQuizCount, extractComputerQuizSources } = await import('@/utils/computer/computerHandoutQuiz')
  const total = totalComputerQuizCount(input.counts)
  if (total <= 0) throw new Error('请至少设置 1 道题')
  input.onProgress?.(aiRequestProgressText('计算机基础测验', input.provider))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(-24)
  const avoidHint = avoid.length
    ? `不要出与下列题干相近的题：\n- ${avoid.join('\n- ')}`
    : '本轮题干、考点组合不要彼此雷同。'
  const allowedSources = extractComputerQuizSources(input.material)
  const allowedSourceIds = allowedSources.map((x) => x.id)
  const system = [
    '你是计算机基础知识命题老师，专出易错、高频考点题。只根据给定讲义出题，用简体中文。',
    '只输出合法 JSON 数组，不要 markdown 围栏，不要其它说明。',
    '少而准：优先考讲义里的重点（定义、划分标准、最主要特点、原理、易混概念），不要考边角例子或无区分度的细节。',
    '解析必须证明 correct，不允许标答与解析打架。',
    '解析不要只抄讲义原句：先点明正确答案，再用自己的话把原理、易混点、记忆提示说清楚（可举讲义外的浅显例子）；不得编造与讲义矛盾的结论。',
    '英文缩写（如 MAR、CPU）在题干和选项里只写缩写本身，不要夹带中文全称或括号解释；全称、含义只写在 explanation。',
  ].join('\n')
  const user = [
    `讲义标题：${input.title}`,
    '讲义正文：',
    input.material.slice(0, 9000),
    '',
    `请出 ${total} 道题，数量：选择题 ${input.counts.choice}，判断题 ${input.counts.judge}（二选一：正确/错误），计算题 ${input.counts.calc}，简答题 ${input.counts.short}。`,
    '字段：kind(choice|judge|calc|short), term(考点短名), stem, options(选择题必须 4 项), distractors(可选，3 个干扰项), correct, explanation。',
    allowedSourceIds.length
      ? '范围测验时每题必须带 sourceId，等于该题所考那篇【讲义ID:xxx｜标题】里的 xxx。'
      : '',
    '【计算题 calc】只问一个能唯一算出的结果，例如「某数的原码/反码/补码是多少」「某式等于多少」。correct 只写最终结果短串（如 10001011、-1、64），禁止写整句解析。程序用包含匹配判分。',
    '【简答题 short】考特点、区别、原理等需要组织语言的内容。correct 写参考要点（可几句）。程序不自动判分，学员对照后自打分。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '【选题优先·必须遵守】',
    'A. 先从讲义抽出 3～6 个重点：加粗/定义句、「最主要/核心/本质/划分依据/原理/特点」、易混对比、考试常考的专名与标准。',
    'B. 本轮题目必须打在这些重点上；禁止专考边角数字、无区分度的举例、或讲义未强调的常识。',
    'C. 一题只考一个重点；同一轮不要重复同一考点。',
    '【干扰项·必须有迷惑性】',
    'D. 干扰项必须来自讲义里的真实概念/相邻特点/易混表述，看起来都像能选，不能一眼假。',
    'E. 优先用「讲义里正确、但答的不是本题」的内容作干扰（例如题干问最主要特点，用运算速度快、存储容量大等真实优点去抢「自动化程度高」）。',
    'F. 禁止无讲义依据的胡编、空洞选项（如「以上都对」「计算机很方便」）或与题干完全无关的张冠李戴。',
    'G. 四个选项长度、语气尽量齐整，不要正确项明显最长或最完整。',
    '【硬性规则·违反则该题作废】',
    '1. 选择题 correct 必须写正确选项的全文，禁止写 A/B/C/D 或 1/2/3/4。',
    '2. 选项顺序随意，程序会打乱；不要把干扰项写成 correct。',
    '3. 题干、选项、correct、解析必须是同一道题。禁止题干问甲、答案却是乙。',
    '4. 解析先点明正确答案，再说明其余项为何错（错在「不是本题所问」或「讲义明确否定」）；可适当展开背景与记忆法，不必逐句照抄讲义。解析支持另一选项即作废。',
    '5. 考点必须能在讲义中找到原句或等价表述。',
    '6. 判断题要卡在易错点上：把「最主要/划分标准/原理」说成相邻优点或错误依据，句子必须能从讲义直接判对错。',
    '7. 计算题只出一个结果、correct 只能是该结果短串；禁止把计算题写成简答，也禁止把简答写成计算题。',
    '9. 题干、选项禁止出现「MAR（存储器地址寄存器）」这类缩写中文提示；必须把全称放到 explanation。',
    avoidHint,
    '仅返回 JSON 数组。',
  ].filter(Boolean).join('\n')
  const collect = (parsed: unknown[]) => {
    const out: import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[] = []
    const seen = new Set<string>()
    for (const item of parsed) {
      const q = parseComputerQuizAiItem(item, {
        itemId: input.itemId,
        itemTitle: input.title,
        learningPath: input.learningPath,
        allowedSources,
        allowedSourceIds,
      })
      if (!q || seen.has(q.fingerprint)) continue
      seen.add(q.fingerprint)
      out.push(q)
    }
    return out
  }
  const ask = async () => {
    const raw = await deepseekChatRaw(user, {
      system,
      temperature: 0.42,
      maxTokens: Math.min(16384, 4096 + total * 280),
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

export async function requestFrontendHandoutQuiz(input: {
  title: string
  material: string
  itemId: string
  counts: { choice: number; judge: number; calc: number; short: number }
  learningPath?: string[]
  avoidStems?: string[]
  provider?: AiProvider
  onProgress?: (message: string) => void
}): Promise<import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[]> {
  const {
    parseFrontendQuizAiItem,
    totalFrontendQuizCount,
    extractFrontendQuizSources,
    frontendHandoutLooksLikeProgramming,
  } = await import('@/utils/frontend/frontendHandoutQuiz')
  const { filterHandoutQuizFactConflicts } = await import('@/utils/quiz/handoutQuizConsistency')
  const total = totalFrontendQuizCount(input.counts)
  if (total <= 0) throw new Error('请至少设置 1 道题')
  input.onProgress?.(aiRequestProgressText('前端学习测验', input.provider))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(-24)
  const avoidHint = avoid.length
    ? `不要出与下列题干相近的题：\n- ${avoid.join('\n- ')}`
    : '本轮题干、考点组合不要彼此雷同。'
  const allowedSources = extractFrontendQuizSources(input.material)
  const allowedSourceIds = allowedSources.map((x) => x.id)
  const codingHeavy = frontendHandoutLooksLikeProgramming(input.material)
  const system = [
    '你是前端（JavaScript / ES6）命题老师，专出高频、实用、易错考点题。只根据给定讲义出题，用简体中文。',
    '只输出合法 JSON 数组，不要 markdown 围栏，不要其它说明。',
    '选题必须分清轻重：先考讲义加粗、定义、易混对比、每天写代码会用到的内容；禁止把实际很少用的边角 API、冷门参数、无区分度细节反复出题，更禁止因此漏掉重点。',
    '解析必须证明 correct，不允许标答与解析打架，也不允许本轮题目之间互相矛盾。',
    '解析不要只抄讲义原句：先点明正确答案，再用自己的话把原理、易混点、记忆提示说清楚；不得编造与讲义矛盾的结论。',
    '英文缩写在题干和选项里只写缩写本身；全称、含义只写在 explanation。',
    '标识符、代码、进制前缀必须用 Markdown：代码块用 ```js ，行内如 `Number.MIN_VALUE`、`0x`/`0X`、`if("")`。禁止把斜杠/反斜杠写成 LaTeX 分式。',
  ].join('\n')
  const user = [
    `讲义标题：${input.title}`,
    '讲义正文：',
    input.material.slice(0, 9000),
    '',
    `请出 ${total} 道题，数量：选择题 ${input.counts.choice}，判断题 ${input.counts.judge}（二选一：正确/错误），计算题 ${input.counts.calc}，简答题 ${input.counts.short}。`,
    '字段：kind(choice|judge|calc|short), term(考点短名), stem, options(选择题必须 4 项), distractors(可选，3 个干扰项), correct, explanation。',
    allowedSourceIds.length
      ? '范围测验时每题必须带 sourceId，等于该题所考那篇【讲义ID:xxx｜标题】里的 xxx。'
      : '',
    '【计算题 calc】只问一个能唯一算出的结果。correct 只写最终结果短串。',
    '【简答题 short】考特点、区别、原理等需要组织语言的内容。correct 写参考要点。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '【选题优先·必须遵守】',
    'A. 先从讲义抽出 3～6 个重点，按权重排序：①加粗/标题 ②定义与易混对比 ③高频实战（日常开发会用）④考试常考。',
    'B. 本轮必须先打在这些重点上；重点还没出完时，禁止出冷门、低使用度内容。同一冷门细节整轮最多 1 题。',
    'C. 一题只考一个重点；同一轮不要重复同一考点。',
    codingHeavy
      ? [
          '【编程题·本讲义含代码/操作，必须出】',
          'H. 本轮至少一半题目必须是编程题，而不是名词定义：看代码写运行结果、空缺处怎么填、判断这段代码在做什么。',
          'I. 代码必须写在 stem/options/explanation 的 Markdown ```js 代码块里，或行内反引号；不要把多行代码挤成一句纯文本。',
        ].join('\n')
      : '本讲义若几乎没有代码、主要是概念定义，则以概念题为主，不要硬凑无材料的程序题。',
    '【干扰项·必须有迷惑性】',
    'D. 干扰项必须来自讲义里的真实概念/相邻特点/易混表述，看起来都像能选。',
    'E. 优先用「讲义里正确、但答的不是本题」的内容作干扰。',
    'F. 禁止无讲义依据的胡编、空洞选项或与题干完全无关的张冠李戴。',
    'G. 四个选项长度、语气尽量齐整。',
    '【硬性规则·违反则该题作废】',
    '1. 选择题 correct 必须写正确选项的全文，禁止写 A/B/C/D 或 1/2/3/4。',
    '2. 选项顺序随意，程序会打乱；不要把干扰项写成 correct。',
    '3. 题干、选项、correct、解析必须是同一道题。禁止题干问甲、答案却是乙。',
    '4. 解析先点明正确答案；解析支持另一选项即作废。判断题：题干断言、correct、解析的对错极性必须一致（例如题干说空字符串会转为 true 且判「错误」时，解析必须说明它是 falsy / 不会执行，不能再写成会执行）。',
    '5. 考点必须能在讲义中找到原句或等价表述。',
    '6. 本轮题目之间不得互相矛盾（例如一题说 Number.MIN_VALUE 是最接近 0 的最小正数，另一题又说它是 -MAX_VALUE；一题说空字符串 falsy，另一题又说它是 true）。',
    '7. 计算题只出一个结果、correct 只能是该结果短串。',
    '9. 题干、选项禁止夹带缩写中文提示；全称放到 explanation。',
    avoidHint,
    '仅返回 JSON 数组。',
  ].filter(Boolean).join('\n')
  const collect = (parsed: unknown[]) => {
    const rawOut: import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[] = []
    const seen = new Set<string>()
    for (const item of parsed) {
      const q = parseFrontendQuizAiItem(item, {
        itemId: input.itemId,
        itemTitle: input.title,
        learningPath: input.learningPath,
        allowedSources,
        allowedSourceIds,
      })
      if (!q || seen.has(q.fingerprint)) continue
      seen.add(q.fingerprint)
      rawOut.push(q)
    }
    return filterHandoutQuizFactConflicts(rawOut, (q) => ({
      correctText: q.correctText,
      explanation: q.explanation,
    }))
  }
  const ask = async () => {
    const raw = await deepseekChatRaw(user, {
      system,
      temperature: 0.38,
      maxTokens: Math.min(16384, 4096 + total * 320),
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
    out = filterHandoutQuizFactConflicts(out, (q) => ({
      correctText: q.correctText,
      explanation: q.explanation,
    }))
  }
  if (out.length < Math.max(1, Math.ceil(total * 0.6))) {
    throw new Error(`仅成功生成 ${out.length} 道合格题，请稍后重试`)
  }
  return out.slice(0, total)
}

export async function requestComputerQuizVariant(input: {
  original: import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion
  provider?: AiProvider
}): Promise<import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion | null> {
  const { parseComputerQuizAiItem } = await import('@/utils/computer/computerHandoutQuiz')
  const original = input.original
  const system = [
    '你是计算机基础知识命题老师，专门根据原题生成变式题。',
    '只输出合法 JSON 对象，不要 markdown 围栏，不要其它说明。',
    '考查同一知识点，换提问角度或选项表述，不要几乎照抄原题。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '计算题 correct 只写最终结果短串；简答题 correct 写参考要点。',
  ].join('\n')
  const user = [
    '请根据下列原题生成 1 道变式题。',
    '字段：kind(choice|judge|calc|short), term, stem, options, correct, explanation。',
    `题型必须仍是 ${original.kind}。`,
    `【原题】\n${JSON.stringify({
      kind: original.kind,
      term: original.term,
      stem: original.stem,
      options: original.options,
      correct: original.correctText,
      explanation: original.explanation,
    })}`,
    '仅返回一个 JSON 对象。',
  ].join('\n')
  const raw = await deepseekChatRaw(user, {
    system,
    temperature: 0.55,
    maxTokens: 1800,
    provider: input.provider,
  })
  let parsed: unknown = parseAiJsonObjectLenient(raw)
  if (Array.isArray(parsed)) parsed = parsed[0]
  const q = parseComputerQuizAiItem(parsed, {
    itemId: original.itemId,
    itemTitle: original.itemTitle,
    learningPath: original.learningPath,
  })
  if (!q || q.kind !== original.kind) return null
  return {
    ...q,
    fingerprint: original.fingerprint,
    itemId: original.itemId,
    itemTitle: original.itemTitle,
    learningPath: original.learningPath,
  }
}

export async function requestFrontendQuizVariant(input: {
  original: import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion
  provider?: AiProvider
}): Promise<import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion | null> {
  const { parseFrontendQuizAiItem } = await import('@/utils/frontend/frontendHandoutQuiz')
  const original = input.original
  const system = [
    '你是前端（JavaScript / ES6）命题老师，专门根据原题生成变式题。',
    '只输出合法 JSON 对象，不要 markdown 围栏，不要其它说明。',
    '考查同一知识点，换提问角度或选项表述，不要几乎照抄原题，也不要写出与原题结论矛盾的新说法。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '有代码时用 Markdown ```js 代码块或行内反引号。',
    '计算题 correct 只写最终结果短串；简答题 correct 写参考要点。',
  ].join('\n')
  const user = [
    '请根据下列原题生成 1 道变式题。',
    '字段：kind(choice|judge|calc|short), term, stem, options, correct, explanation。',
    `题型必须仍是 ${original.kind}。`,
    `【原题】\n${JSON.stringify({
      kind: original.kind,
      term: original.term,
      stem: original.stem,
      options: original.options,
      correct: original.correctText,
      explanation: original.explanation,
    })}`,
    '仅返回一个 JSON 对象。',
  ].join('\n')
  const raw = await deepseekChatRaw(user, {
    system,
    temperature: 0.55,
    maxTokens: 1800,
    provider: input.provider,
  })
  let parsed: unknown = parseAiJsonObjectLenient(raw)
  if (Array.isArray(parsed)) parsed = parsed[0]
  const q = parseFrontendQuizAiItem(parsed, {
    itemId: original.itemId,
    itemTitle: original.itemTitle,
    learningPath: original.learningPath,
  })
  if (!q || q.kind !== original.kind) return null
  return {
    ...q,
    fingerprint: original.fingerprint,
    itemId: original.itemId,
    itemTitle: original.itemTitle,
    learningPath: original.learningPath,
  }
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

