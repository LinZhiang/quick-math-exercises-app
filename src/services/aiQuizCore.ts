/**
 * AI 对话与出题共用底层。
 * 页面请继续从 `@/services/deepseek` 引入；不要直接依赖本文件里的未导出细节。
 */
import { normalizeQuizAvoidText } from '@/utils/quiz/handoutJsQuizRuntime'
import { quizNearKey } from '@/utils/quiz/handoutQuizDiversity'
import { filterHandoutQuizFactConflicts } from '@/utils/quiz/handoutQuizConsistency'
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
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/app/aiJsonParse'

/** 是否可使用 AI（已登录走服务端代理；成员须自备 API；开发环境可回退本机 Key） */
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

type HandoutQuizKindCounts = { choice: number; judge: number; calc: number; short: number }

/** 题量 ≥ 此值时拆成两路并行，墙钟时间接近一半；更少则一次出完。 */
const HANDOUT_QUIZ_PARALLEL_AT = 8
const HANDOUT_QUIZ_MAX_ROUNDS = 6

function totalHandoutQuizCounts(c: HandoutQuizKindCounts) {
  return c.choice + c.judge + c.calc + c.short
}

function remainingHandoutQuizCounts(
  counts: HandoutQuizKindCounts,
  have: { kind: string }[],
): HandoutQuizKindCounts {
  const got = { choice: 0, judge: 0, calc: 0, short: 0 }
  for (const q of have) {
    if (q.kind === 'choice' || q.kind === 'judge' || q.kind === 'calc' || q.kind === 'short') {
      got[q.kind] += 1
    }
  }
  return {
    choice: Math.max(0, counts.choice - got.choice),
    judge: Math.max(0, counts.judge - got.judge),
    calc: Math.max(0, counts.calc - got.calc),
    short: Math.max(0, counts.short - got.short),
  }
}

function takeHandoutQuizBatch(
  remaining: HandoutQuizKindCounts,
  maxBatch: number,
): HandoutQuizKindCounts {
  let left = maxBatch
  const next = { choice: 0, judge: 0, calc: 0, short: 0 }
  for (const k of ['choice', 'judge', 'calc', 'short'] as const) {
    const n = Math.min(remaining[k], left)
    next[k] = n
    left -= n
    if (left <= 0) break
  }
  return next
}

function subtractHandoutQuizCounts(
  counts: HandoutQuizKindCounts,
  used: HandoutQuizKindCounts,
): HandoutQuizKindCounts {
  return {
    choice: Math.max(0, counts.choice - used.choice),
    judge: Math.max(0, counts.judge - used.judge),
    calc: Math.max(0, counts.calc - used.calc),
    short: Math.max(0, counts.short - used.short),
  }
}

function splitHandoutQuizWork(remaining: HandoutQuizKindCounts): HandoutQuizKindCounts[] {
  const total = totalHandoutQuizCounts(remaining)
  if (total <= 0) return []
  const cap = 4
  if (total <= cap) return [{ ...remaining }]
  const first = takeHandoutQuizBatch(remaining, Math.min(cap, Math.ceil(total / 2)))
  const rest = subtractHandoutQuizCounts(remaining, first)
  const second = takeHandoutQuizBatch(rest, cap)
  return [first, second].filter((c) => totalHandoutQuizCounts(c) > 0)
}

/** 多要 1～2 道，过滤掉少量不合格后仍能凑满。 */
function padHandoutQuizCounts(remain: HandoutQuizKindCounts): HandoutQuizKindCounts {
  const n = totalHandoutQuizCounts(remain)
  if (n <= 0) return remain
  const extra = n >= 8 ? 2 : 1
  const next = { ...remain }
  let k: keyof HandoutQuizKindCounts = 'choice'
  for (const key of ['choice', 'judge', 'calc', 'short'] as const) {
    if (next[key] > next[k]) k = key
  }
  if (next[k] > 0) next[k] += extra
  return next
}

function takeUpToCounts<T extends { kind: string }>(
  items: T[],
  counts: HandoutQuizKindCounts,
): T[] {
  const got = { choice: 0, judge: 0, calc: 0, short: 0 }
  const out: T[] = []
  for (const q of items) {
    if (q.kind !== 'choice' && q.kind !== 'judge' && q.kind !== 'calc' && q.kind !== 'short') continue
    if (got[q.kind] >= counts[q.kind]) continue
    got[q.kind] += 1
    out.push(q)
  }
  return out
}

function handoutQuizMaxTokens(need: number) {
  return Math.min(8192, 900 + need * 340)
}

function handoutQuizCountLine(total: number, counts: HandoutQuizKindCounts) {
  return `请出 ${total} 道题，数量：选择题 ${counts.choice}，判断题 ${counts.judge}（二选一：正确/错误），计算题 ${counts.calc}，简答题 ${counts.short}。`
}

function localHandoutOutline(material: string): string[] {
  const s = String(material || '')
  const points: string[] = []
  const push = (raw: string) => {
    const x = raw.replace(/<[^>]+>/g, ' ').replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim()
    if (x.length < 2 || x.length > 48) return
    if (/^(概述|简介|引言|小结|总结|目录|前言|说明|注意|备注|示例|例子|练习|导读)$/.test(x)) return
    if (points.some((p) => p === x || p.includes(x) || x.includes(p))) return
    points.push(x)
  }
  for (const m of s.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)) push(m[1] || '')
  for (const m of s.matchAll(/^#{1,4}\s+(.+)$/gm)) push(m[1] || '')
  return points.slice(0, 40)
}

function scopeLineOf(item: unknown): string {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    const row = item as Record<string, unknown>
    const name = String(row.point ?? row.name ?? row.title ?? row.term ?? '').trim()
    const detail = String(row.detail ?? row.note ?? row.why ?? row.summary ?? '').trim()
    if (name && detail) return `${name}：${detail}`
    return name || detail
  }
  return String(item ?? '')
}

function asScopeLines(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    const s = scopeLineOf(item).replace(/\s+/g, ' ').trim()
    if (s.length < 2 || s.length > 80) continue
    if (out.includes(s)) continue
    out.push(s)
    if (out.length >= limit) break
  }
  return out
}

type HandoutQuizScope = {
  outline: string[]
  inScope: string[]
  outOfScope: string[]
  promptBlock: string
}

function scopePromptBlock(scope: Pick<HandoutQuizScope, 'outline' | 'inScope' | 'outOfScope'>): string {
  const lines = [
    scope.outline.length ? `【讲义结构】\n${scope.outline.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '',
    scope.inScope.length
      ? `【允许考查】只准考下面这些讲义真正展开过的点，每点最多一题，答案必须能在正文里找到：\n${scope.inScope.map((p) => `- ${p}`).join('\n')}`
      : '【允许考查】没能列出细考点。只考正文标题下展开讲过的定义和步骤，禁止另找考点。',
    scope.outOfScope.length
      ? `【禁止考查】下面这些只是带过、举例提到，或讲义没有讲清楚，不要出题：\n${scope.outOfScope.map((p) => `- ${p}`).join('\n')}`
      : '',
    '不得考查上述范围之外的内容，也不得用讲义外的常识、面试题库来补题。',
  ]
  return lines.filter(Boolean).join('\n')
}

/** 先通读全文结构，划出能考和不能考的范围，再交给出题。 */
async function analyzeHandoutQuizScope(input: {
  title: string
  material: string
  subject: string
  provider?: AiProvider
  onProgress?: (message: string) => void
}): Promise<HandoutQuizScope> {
  const local = localHandoutOutline(input.material)
  input.onProgress?.('正在通读讲义结构，划定考点范围…')
  let outline = local
  let inScope = [...local]
  let outOfScope: string[] = []
  try {
    const raw = await deepseekChatRaw(
      [
        `科目：${input.subject}`,
        `讲义标题：${input.title}`,
        '请先完整看完下面讲义的结构，再划考点。不要出题。',
        '规则：',
        '1. outline 按正文出现顺序列出专节标题；后半部分的章节不能漏。',
        '2. inScope 只写讲义用定义、划分、步骤或例子展开讲过的考点。每条写「考点：讲义里的结论」，不要写空泛词。',
        '3. outOfScope 写一笔带过、用来对比但没展开、或正文没有依据的概念。',
        '4. 禁止用你自己知道的常识补考点。讲义没讲的，放进 outOfScope 或直接不写。',
        '5. 若正文含多篇【讲义ID:…｜标题】，每条 inScope 开头写所属标题，不要把 A 篇的点安到 B 篇。',
        '只输出一个 JSON 对象：{"outline":[],"inScope":[],"outOfScope":[]}',
        '',
        '讲义正文：',
        input.material,
      ].join('\n'),
      {
        system: `你是${input.subject}讲义分析老师。先看完整篇结构，只划真正讲过的考点范围。只输出 JSON 对象。`,
        temperature: 0.2,
        maxTokens: 1800,
        provider: input.provider,
      },
    )
    const parsedRaw = parseAiJsonObjectLenient(stripAiJsonFence(raw))
    const parsed = unwrapHandoutScope(parsedRaw)
    const aiOutline = asScopeLines(parsed?.outline, 40)
    const aiIn = asScopeLines(parsed?.inScope, 40)
    outOfScope = asScopeLines(parsed?.outOfScope, 24)
    if (aiOutline.length) outline = aiOutline
    if (aiIn.length) inScope = [...aiIn]
    for (const heading of local) {
      const covered = inScope.some((p) => p.includes(heading) || heading.includes(p))
      const banned = outOfScope.some((p) => p.includes(heading) || heading.includes(p))
      if (!covered && !banned) inScope.push(heading)
    }
  } catch {
    /* 结构分析失败时退回标题，仍然只按讲义标题出题 */
  }
  return { outline, inScope, outOfScope, promptBlock: scopePromptBlock({ outline, inScope, outOfScope }) }
}

function unwrapHandoutScope(parsed: unknown): {
  outline?: unknown
  inScope?: unknown
  outOfScope?: unknown
} | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const row = parsed as Record<string, unknown>
  const hasScope = (value: Record<string, unknown>) =>
    Array.isArray(value.outline) || Array.isArray(value.inScope) || Array.isArray(value.outOfScope)
  if (hasScope(row)) return row
  for (const value of Object.values(row)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && hasScope(value as Record<string, unknown>)) {
      return value as Record<string, unknown>
    }
  }
  return row
}

function quizQuestionOffScope(term: string, stem: string, scope: HandoutQuizScope): boolean {
  if (!scope.outOfScope.length) return false
  const norm = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, '')
  const termN = norm(term)
  const stemN = norm(stem).slice(0, 160)
  const mentionsOut = scope.outOfScope.some((p) => {
    const n = norm(p)
    if (n.length < 2) return false
    if (termN && (termN === n || termN.includes(n))) return true
    if (termN.length >= 4 && n.includes(termN)) return true
    return n.length >= 4 && stemN.includes(n)
  })
  if (!mentionsOut) return false
  const blob = termN + stemN
  const mentionsIn = scope.inScope.some((p) => {
    const n = norm(p)
    return n.length >= 2 && blob.includes(n)
  })
  return !mentionsIn
}

const HANDOUT_QUIZ_SPEED_HINT =
  '每题 explanation 写 2～3 句即可：只讲为什么、易混点；不要再复述正确答案全文（界面已经展示答案）。一次输出完整 JSON 数组。'
const HANDOUT_QUIZ_CONSISTENCY_HINT =
  '标答和解析必须同一结论：解析写「正确答案是X」则 correct 必须是 X，禁止解析否定标答。判断题不要把「继承后直接拥有全部属性/方法」这类过绝对句子标成正确。代码块必须完整可运行：调用要写出括号和参数，禁止只写 history.pushState、location.href 这种残缺 API 名。题干说「执行下列代码」却没有完整语句的，这题作废重出。JS 按教程体例：一条语句一行，写完再换行；禁止把赋值拆成 href 一行、= 一行，也禁止把多条语句挤成一行。'

async function askHandoutQuizBatch<T>(
  ask: () => Promise<T[]>,
): Promise<{ items: T[]; error: unknown }> {
  try {
    return { items: await ask(), error: null }
  } catch (first) {
    try {
      return { items: await ask(), error: null }
    } catch (second) {
      return { items: [], error: second ?? first }
    }
  }
}

async function collectHandoutQuizRounds<T extends { kind: string }>(input: {
  total: number
  counts: HandoutQuizKindCounts
  onProgress?: (message: string) => void
  ask: (batch: HandoutQuizKindCounts, splitHint: string, have: T[]) => Promise<T[]>
  absorb: (have: T[], extra: T[]) => T[]
}): Promise<T[]> {
  let out: T[] = []
  let lastError: unknown = null
  for (let round = 0; round < HANDOUT_QUIZ_MAX_ROUNDS; round += 1) {
    const remain = remainingHandoutQuizCounts(input.counts, out)
    const remainN = totalHandoutQuizCounts(remain)
    if (remainN <= 0) break
    const parts = splitHandoutQuizWork(padHandoutQuizCounts(remain))
    input.onProgress?.(
      parts.length > 1
        ? `正在并行出第 ${out.length + 1}–${input.total} 题…`
        : round
          ? `正在补出第 ${out.length + 1}–${input.total} 题…`
          : `正在出第 1–${input.total} 题…`,
    )
    const splitHints =
      parts.length > 1
        ? [
            '本批优先覆盖讲义前半还没考过的定义与划分，禁止换词重复已出题。',
            '本批优先覆盖讲义后半和易混对比，不要与前半、也不要与已出题扎堆。',
          ]
        : ['每题换一个专节或易混点，禁止同一问法只改几个字。']
    const chunks = await Promise.all(
      parts.map(async (p, i) => {
        const result = await askHandoutQuizBatch(() => input.ask(p, splitHints[i] ?? '', out))
        if (result.error) lastError = result.error
        return result.items
      }),
    )
    const before = out.length
    for (const extra of chunks) out = takeUpToCounts(input.absorb(out, extra), input.counts)
    if (before === out.length && lastError && round > 0) break
  }
  out = takeUpToCounts(out, input.counts)
  if (!out.length) {
    if (lastError instanceof Error && lastError.message) throw lastError
    throw new Error('出题失败，请稍后重试')
  }
  return out
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length)
  let cursor = 0
  const workers = Math.min(Math.max(1, limit), items.length)
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (cursor < items.length) {
        const i = cursor
        cursor += 1
        out[i] = await fn(items[i], i)
      }
    }),
  )
  return out
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
  const { parseComputerQuizAiItem, totalComputerQuizCount, extractComputerQuizSources, materialForComputerQuiz, computerQuizTooSimilar } = await import('@/utils/computer/computerHandoutQuiz')
  const total = totalComputerQuizCount(input.counts)
  if (total <= 0) throw new Error('请至少设置 1 道题')
  const scope = await analyzeHandoutQuizScope({
    title: input.title,
    material: materialForComputerQuiz(input.material),
    subject: '计算机基础',
    provider: input.provider,
    onProgress: input.onProgress,
  })
  input.onProgress?.(aiRequestProgressText('计算机基础测验', input.provider))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(-24)
  const avoidHint = avoid.length
    ? `禁止与下列题干雷同（不要同考点同问法；改几个字不算新题）：\n- ${avoid.slice(-16).join('\n- ')}`
    : '本轮每题必须覆盖不同考点/不同问法，禁止连续出几乎同一题。'
  const allowedSources = extractComputerQuizSources(input.material)
  const allowedSourceIds = allowedSources.map((x) => x.id)
  const system = [
    '你是计算机基础知识命题老师。只根据给定讲义和已经划定的考点范围出题，用简体中文。',
    '只输出合法 JSON 数组，不要 markdown 围栏，不要其它说明。',
    HANDOUT_QUIZ_SPEED_HINT,
    HANDOUT_QUIZ_CONSISTENCY_HINT,
    '考点范围已经划好。只考「允许考查」里的点，禁止考「禁止考查」和讲义没写的常识。不要因为某个词在文中出现过就单独出题。',
    '每题必须换一个允许范围内的考点，禁止高度雷同。',
    '解析必须与 correct 一致。英文缩写在题干和选项里只写缩写；全称放 explanation。',
    '数值范围写成 1-12 或 1～12。题干和选项里不要夹带解析。',
  ].join('\n')
  const user = [
    `讲义标题：${input.title}`,
    scope.promptBlock,
    '讲义正文（只用来核对事实，不要另找考点）：',
    materialForComputerQuiz(input.material),
    '',
    handoutQuizCountLine(total, input.counts),
    '字段：kind(choice|judge|calc|short), term(考点短名), stem, options(选择题必须 4 项), distractors(可选，3 个干扰项), correct, explanation。',
    allowedSourceIds.length
      ? '范围测验时每题必须带 sourceId，等于该题所考那篇【讲义ID:xxx｜标题】里的 xxx。每题只考这一篇自己的允许考查点。'
      : '',
    '【计算题 calc】correct 只写最终结果短串。【简答题 short】correct 写参考要点。',
    '干扰项只用讲义里相邻、易混的说法，不要拿讲义没讲的概念来凑选项。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '【选题】每题对应「允许考查」里的一个点，并覆盖不同专节。同一 term、同一问法在本轮只能出现一次。只改几个字仍算同一题。禁止整轮都压在开头，也禁止跑到划定范围外。',
    '选择题 correct 写选项全文，不要写 A/B/C/D。解析不要重复正确答案原文。缩写中文提示只放 explanation。',
    avoidHint,
    '仅返回 JSON 数组。',
  ].filter(Boolean).join('\n')
  const collect = (parsed: unknown[]) => {
    const out: import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[] = []
    const seen = new Set<string>(avoid.map(normalizeQuizAvoidText).filter(Boolean))
    for (const raw of avoid) seen.add(raw)
    for (const item of parsed) {
      const q = parseComputerQuizAiItem(item, {
        itemId: input.itemId,
        itemTitle: input.title,
        learningPath: input.learningPath,
        allowedSources,
        allowedSourceIds,
      })
      if (!q || seen.has(q.fingerprint) || seen.has(normalizeQuizAvoidText(q.stem))) continue
      if (quizQuestionOffScope(q.term || '', q.stem, scope)) continue
      const termKey = `term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`
      const askKey = `ask:${q.kind}:${String(q.stem || '').replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, '').slice(0, 36)}`
      const stemKey = `stem:${q.kind}:${String(q.stem || '').replace(/```[\s\S]*?```/g, '').replace(/\s+/g, '').slice(0, 48)}`
      if (computerQuizTooSimilar(q, seen)) continue
      if (q.term && seen.has(termKey)) continue
      seen.add(q.fingerprint)
      const stemNorm = normalizeQuizAvoidText(q.stem)
      if (stemNorm) seen.add(stemNorm)
      if (q.term) seen.add(termKey)
      if (askKey) seen.add(askKey)
      if (stemKey) seen.add(stemKey)
      seen.add(quizNearKey(q.stem))
      out.push(q)
    }
    return out
  }
  return collectHandoutQuizRounds({
    total,
    counts: input.counts,
    onProgress: input.onProgress,
    ask: async (batch, splitHint, have) => {
      const need = totalHandoutQuizCounts(batch)
      const raw = await deepseekChatRaw(
        `${user.replace(handoutQuizCountLine(total, input.counts), handoutQuizCountLine(need, batch))}${
          splitHint ? `\n${splitHint}` : ''
        }`,
        {
          system,
          temperature: have.length ? 0.62 : 0.52,
          maxTokens: handoutQuizMaxTokens(need),
          provider: input.provider,
        },
      )
      return collect(parseAiJsonArrayLenient(stripAiJsonFence(raw)))
    },
    absorb: (have, extra) => {
      const seen = new Set<string>(avoid)
      for (const q of have) {
        seen.add(q.fingerprint)
        seen.add(normalizeQuizAvoidText(q.stem))
        seen.add(quizNearKey(q.stem))
        if (q.term) seen.add(`term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`)
      }
      const next = [...have]
      for (const q of extra) {
        if (seen.has(q.fingerprint) || seen.has(normalizeQuizAvoidText(q.stem)) || computerQuizTooSimilar(q, seen)) {
          continue
        }
        seen.add(q.fingerprint)
        seen.add(quizNearKey(q.stem))
        if (q.term) seen.add(`term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`)
        next.push(q)
      }
      return next
    },
  })
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
    materialForFrontendQuiz,
    frontendQuizDedupeKey,
    frontendQuizTooSimilar,
    frontendQuizAvoidTokens,
  } = await import('@/utils/frontend/frontendHandoutQuiz')
  const total = totalFrontendQuizCount(input.counts)
  if (total <= 0) throw new Error('请至少设置 1 道题')
  const material = materialForFrontendQuiz(input.material)
  const scope = await analyzeHandoutQuizScope({
    title: input.title,
    material,
    subject: '前端',
    provider: input.provider,
    onProgress: input.onProgress,
  })
  input.onProgress?.(aiRequestProgressText('前端学习测验', input.provider))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(-24)
  const avoidHint = avoid.length
    ? [
        '禁止与下列题干/代码骨架雷同；只改字符串或变量名不算新题。同一 term 不要重复出同一问法。',
        ...avoid.slice(-16).map((s) => `- ${s}`),
      ].join('\n')
    : '本轮题干、问法、代码骨架必须互不相同；同一 term 最多一题。'
  const allowedSources = extractFrontendQuizSources(input.material)
  const allowedSourceIds = allowedSources.map((x) => x.id)
  const codingHeavy = frontendHandoutLooksLikeProgramming(input.material)
  const system = [
    '你是前端讲义命题老师。只根据给定讲义和已经划定的考点范围出题，用简体中文。',
    '只输出合法 JSON 数组，不要 markdown 围栏，不要其它说明。',
    HANDOUT_QUIZ_SPEED_HINT,
    HANDOUT_QUIZ_CONSISTENCY_HINT,
    '考点范围已经划好。只考「允许考查」里的点。讲义里顺带出现的闭包、原型、事件循环等，如果不在允许范围内，一律不要出。禁止用面试常识补题。',
    '每题换一个允许范围内的考点，禁止把同一题换个说法再出一遍。',
    '禁止 falsy/truthy，写成假值/真值或具体值。完整代码用 ```js 代码块；短关键字用行内反引号。',
    '问运行结果时 stem 里必须带完整代码。解析用中文，不要把整段解析放进代码块。',
  ].join('\n')
  const user = [
    `讲义标题：${input.title}`,
    scope.promptBlock,
    '讲义正文（只用来核对事实，不要另找考点）：',
    material,
    '',
    handoutQuizCountLine(total, input.counts),
    '字段：kind(choice|judge|calc|short), term(考点短名), stem, options(选择题必须 4 项), distractors(可选，3 个干扰项), correct, explanation。',
    allowedSourceIds.length
      ? '范围测验时每题必须带 sourceId，等于该题所考那篇【讲义ID:xxx｜标题】里的 xxx。每题只考这一篇自己的允许考查点。'
      : '',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。计算题 correct 只写结果短串。',
    '干扰项只用讲义里相邻、易混的说法，不要拿讲义没讲的概念来凑选项。',
    '【选题】每题对应「允许考查」里的一个点，并覆盖不同专节。每个考点只出一题。禁止把同一题换词、换变量名后再出，也不要整轮都压在开头几段。',
    codingHeavy
      ? [
          '【编程题】大约三分之一到一半即可，先保证定义/易混题。',
          '完整程序用换行的 ```js 代码块。history.pushState / replaceState 必须写成 history.pushState(state, title, url) 这种完整调用，禁止只写方法名。',
          'exec/match 失败返回 null；对 null 取 [0] 是 TypeError。new Error() 无参时 message 是空字符串。',
        ].join('\n')
      : '本讲义若几乎没有代码、主要是概念定义，则以概念题为主，不要硬凑程序题。',
    '选择题 correct 写选项全文，不要写 A/B/C/D。解析不要重复正确答案原文。',
    avoidHint,
    '仅返回 JSON 数组。',
  ].filter(Boolean).join('\n')
  const collect = (
    parsed: unknown[],
    seen: Set<string>,
  ): import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[] => {
    const rawOut: import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[] = []
    for (const item of parsed) {
      const q = parseFrontendQuizAiItem(item, {
        itemId: input.itemId,
        itemTitle: input.title,
        learningPath: input.learningPath,
        allowedSources,
        allowedSourceIds,
      })
      if (!q) continue
      if (quizQuestionOffScope(q.term || '', q.stem, scope)) continue
      const key = frontendQuizDedupeKey(q)
      const termKey = `term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`
      if (seen.has(key) || seen.has(q.fingerprint) || seen.has(termKey) || frontendQuizTooSimilar(q, seen)) continue
      seen.add(key)
      seen.add(q.fingerprint)
      if (q.term) seen.add(termKey)
      for (const t of frontendQuizAvoidTokens(q)) seen.add(t)
      seen.add(quizNearKey(q.stem))
      rawOut.push(q)
    }
    return filterHandoutQuizFactConflicts(rawOut, (q) => ({
      correctText: q.correctText,
      explanation: q.explanation,
    }))
  }
  return collectHandoutQuizRounds({
    total,
    counts: input.counts,
    onProgress: input.onProgress,
    ask: async (batch, splitHint, have) => {
      const need = totalHandoutQuizCounts(batch)
      const extraAvoid = have.flatMap((q) => frontendQuizAvoidTokens(q)).slice(-12)
      const roundHint = extraAvoid.length
        ? `${avoidHint}\n已出题请换问法补齐：\n- ${extraAvoid.join('\n- ')}`
        : avoidHint
      const roundUser = `${user
        .replace(handoutQuizCountLine(total, input.counts), handoutQuizCountLine(need, batch))
        .replace(avoidHint, roundHint)}${splitHint ? `\n${splitHint}` : ''}`
      const raw = await deepseekChatRaw(roundUser, {
        system,
        temperature: extraAvoid.length ? 0.62 : 0.52,
        maxTokens: handoutQuizMaxTokens(need),
        provider: input.provider,
      })
      const seenRound = new Set(avoid)
      return collect(parseAiJsonArrayLenient(stripAiJsonFence(raw)), seenRound)
    },
    absorb: (have, extra) => {
      const seen = new Set<string>(avoid)
      for (const q of have) {
        seen.add(frontendQuizDedupeKey(q))
        seen.add(q.fingerprint)
        if (q.term) seen.add(`term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`)
        for (const t of frontendQuizAvoidTokens(q)) seen.add(t)
        seen.add(quizNearKey(q.stem))
      }
      const next = [...have]
      for (const q of extra) {
        const key = frontendQuizDedupeKey(q)
        const termKey = `term:${q.kind}:${String(q.term || '').replace(/\s+/g, '')}`
        if (
          seen.has(key) ||
          seen.has(q.fingerprint) ||
          (q.term && seen.has(termKey)) ||
          frontendQuizTooSimilar(q, seen)
        ) {
          continue
        }
        seen.add(key)
        seen.add(q.fingerprint)
        if (q.term) seen.add(termKey)
        for (const t of frontendQuizAvoidTokens(q)) seen.add(t)
        seen.add(quizNearKey(q.stem))
        next.push(q)
      }
      return filterHandoutQuizFactConflicts(next, (q) => ({
        correctText: q.correctText,
        explanation: q.explanation,
      }))
    },
  })
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
    maxTokens: 1200,
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
    '若原题是代码题，变式必须改写代码（换数/换变量/换运算符），并自行算对结果。禁止只改字符串却仍问同一 exec 下标。',
    '代码必须完整可运行：用到的变量都要在片段里出现；问输出时 correct 必须是真实运行结果。',
    'exec/match 失败返回 null；对 null 取 [0] 是 TypeError，不能答成去掉分隔符后的假匹配。',
    'new Error() 无参时 message 是空字符串，不要把 Error / undefined 当答案。',
    '禁止使用 falsy、truthy，改写为假值/真值或具体值。',
    '数值范围不要用 ~~1-12~~；对象字面量属性逗号后换行；计算题 correct 只写核心结果、不要加引号。',
    '选择题 correct 必须是 options 里某一项的原文；判断题 correct 写「正确」或「错误」。',
    '有代码时用 Markdown ```js 代码块；代码必须写在 stem 里，禁止只写「阅读下面代码」不给片段。解析用中文，不要把整段解析放进代码块；短答案不要用代码块包整项。',
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
    maxTokens: 1200,
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

export async function requestComputerQuizVariants(input: {
  originals: import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[]
  provider?: AiProvider
  onProgress?: (done: number, total: number) => void
}): Promise<import('@/utils/computer/computerHandoutQuiz').ComputerQuizQuestion[]> {
  let done = 0
  const total = input.originals.length
  return mapPool(input.originals, 4, async (original) => {
    try {
      const variant = await requestComputerQuizVariant({ original, provider: input.provider })
      return variant ?? original
    } catch {
      return original
    } finally {
      done += 1
      input.onProgress?.(done, total)
    }
  })
}

export async function requestFrontendQuizVariants(input: {
  originals: import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[]
  provider?: AiProvider
  onProgress?: (done: number, total: number) => void
}): Promise<import('@/utils/frontend/frontendHandoutQuiz').FrontendQuizQuestion[]> {
  let done = 0
  const total = input.originals.length
  return mapPool(input.originals, 4, async (original) => {
    try {
      const variant = await requestFrontendQuizVariant({ original, provider: input.provider })
      return variant ?? original
    } catch {
      return original
    } finally {
      done += 1
      input.onProgress?.(done, total)
    }
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


/** 近期已练词语，生成新题时避开 */
export function normalizeAvoidTerm(term: string): string {
  return term.trim().replace(/\s+/g, '')
}

export function buildAvoidTermsHint(label: string, terms: string[]): string {
  const unique = [...new Set(terms.map(normalizeAvoidTerm).filter(Boolean))]
  if (!unique.length) return ''
  return `\n【禁止重复】以下${label}近期已练过，本批**一律不得**再出（含近义换题干）：${unique.join('、')}`
}

