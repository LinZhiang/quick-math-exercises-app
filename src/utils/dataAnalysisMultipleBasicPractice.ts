/**
 * 资料分析 · 倍数与翻番——基本公式
 * 考点：A是B的 A/B 倍；A比B多/高 (A/B−1) 倍；翻 n 番 = ×2^n。
 * 简单：纯文字；复杂：数据表，难度≥教材（人均收入比、多步读表）。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import {
  renderDataAnalysisPassageHtml,
  type DataAnalysisDifficulty,
} from '@/utils/dataAnalysisPractice'
import {
  normalizeGrowthEvidenceSpans,
  validateGrowthGeneralAnswerMath,
} from '@/utils/dataAnalysisGrowthPractice'
import type { GrowthAvgAnnualTableSpec } from '@/utils/dataAnalysisGrowthAvgAnnualPractice'
import { parseGrowthAvgAnnualTableSpec } from '@/utils/dataAnalysisGrowthAvgAnnualPractice'

export type MultipleBasicDifficulty = DataAnalysisDifficulty

export const MULTIPLE_BASIC_QUESTION_COUNT = 5

export const MULTIPLE_BASIC_MODES: {
  id: MultipleBasicDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '倍数·基本公式 · 简单',
    desc: '每轮 5 题 · 纯文字 · 是几倍/多几倍/翻番 · 数字好算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '倍数·基本公式 · 复杂',
    desc: '每轮 5 题 · 数据表 · 先求人均再比倍等 · 对齐教材或更难 · 仅豆包 · 正计时停表看答案',
  },
]

export type MultipleBasicTableSpec = GrowthAvgAnnualTableSpec

export type MultipleBasicQuestion = {
  id: string
  topic: 'multiple-basic'
  difficulty: MultipleBasicDifficulty
  term: string
  passage: string
  table: MultipleBasicTableSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function multipleBasicTopicLabel(): string {
  return '倍数·基本公式'
}

export function multipleBasicDifficultyLabel(d: MultipleBasicDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type MultipleBasicEasySkillId =
  | 'is-times'
  | 'more-times'
  | 'doubling-n'
  | 'doubling-value'
  | 'more-as-percent'

export type MultipleBasicEasySkillSlot = {
  id: MultipleBasicEasySkillId
  label: string
  prompt: string
}

export const MULTIPLE_BASIC_EASY_SKILL_SLOTS: MultipleBasicEasySkillSlot[] = [
  {
    id: 'is-times',
    label: 'A是B的几倍',
    prompt: '求 A/B。仿国企与股份制利润倍数题，数字易除。',
  },
  {
    id: 'more-times',
    label: 'A比B多/高几倍',
    prompt: '求 A/B−1。注意「是几倍」与「多几倍」区别。',
  },
  {
    id: 'doubling-n',
    label: '翻n番是几倍',
    prompt: '翻 n 番 = 变为原来的 2^n 倍。仿GDP翻两番→4倍。',
  },
  {
    id: 'doubling-value',
    label: '翻番后数值',
    prompt: '基期×2^n 求翻番后的量。',
  },
  {
    id: 'more-as-percent',
    label: '高几倍用百分数表述',
    prompt: 'A比B高 (A/B−1)，可写成百分数，如115.4%。仿城乡消费支出题。',
  },
]

export function pickMultipleBasicEasySkillPlan(
  count: number,
): MultipleBasicEasySkillSlot[] {
  const out: MultipleBasicEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...MULTIPLE_BASIC_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectMultipleBasicEasySkillId(q: {
  stem: string
  explanation: string
}): MultipleBasicEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/翻.*番|2\^|×2/.test(s) && /倍/.test(s) && !/后.*为|变为/.test(s)) return 'doubling-n'
  if (/翻.*番|2\^/.test(s)) return 'doubling-value'
  if (/多|高|增长.*倍|−1|减1/.test(s) && /%/.test(s)) return 'more-as-percent'
  if (/多|高|多几倍|高几倍|−1/.test(s)) return 'more-times'
  return 'is-times'
}

export type MultipleBasicHardSkillId =
  | 'table-per-capita-times'
  | 'table-is-times'
  | 'table-more-times'
  | 'table-multi-step'
  | 'table-compare-rows'

export const MULTIPLE_BASIC_HARD_SKILL_SLOTS: {
  id: MultipleBasicHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'table-per-capita-times',
    label: '读表先求人均再比倍',
    prompt:
      '仿仓储/邮政：营业收入/从业人员得人均，再求仓储人均是邮政的几倍。难度≥教材。',
  },
  {
    id: 'table-is-times',
    label: '读表直接求是几倍',
    prompt: '两行同列指标相除求倍数。',
  },
  {
    id: 'table-more-times',
    label: '读表求多/高几倍',
    prompt: 'A/B−1；选项易与「是几倍」混淆。',
  },
  {
    id: 'table-multi-step',
    label: '读表多指标组合比倍',
    prompt: '需用两列以上数据（如利润/资产）再比倍。',
  },
  {
    id: 'table-compare-rows',
    label: '多行定位后比倍',
    prompt: '表含多行业，须正确定位两行再算。',
  },
]

export function getMultipleBasicFingerprint(input: {
  difficulty: MultipleBasicDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  tableTitle?: string
}): string {
  return [
    'multiple-basic',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.tableTitle ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableMultipleBasicMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (q.options.filter((o) => /\d/.test(o)).length >= 3) return true
  return isPlayableFourChoiceMcq(q)
}

function coerceDistractors(correct: string, distractors: string[]): string[] {
  const c = correct.trim()
  const out: string[] = []
  const seen = new Set<string>([c.replace(/\s+/g, '')])
  for (const d of distractors) {
    const t = d.trim()
    if (!t) continue
    const key = t.replace(/\s+/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
    if (out.length >= 3) break
  }
  const num = Number(String(c).match(/[-+]?\d+(?:\.\d+)?/)?.[0])
  const unit = c.replace(/[-+]?\d+(?:\.\d+)?/, '').trim()
  for (const d of [0.2, 0.5, 1, -0.2, 2]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildMultipleBasicQuestionFromMcq(input: {
  difficulty: MultipleBasicDifficulty
  term: string
  passage?: string
  table?: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): MultipleBasicQuestion | null {
  const term = input.term.trim() || '倍数基本公式'
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  const distractors = coerceDistractors(
    correct,
    input.distractors.map((d) => d.trim()).filter(Boolean),
  )
  if (!stem || !correct || distractors.length !== 3) return null

  const table =
    input.difficulty === 'hard'
      ? parseGrowthAvgAnnualTableSpec(input.table ?? null)
      : null
  if (input.difficulty === 'hard' && !table) return null
  if (input.difficulty === 'easy' && passage.length < 8) return null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按倍数与翻番基本公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    [passage, table?.title].filter(Boolean).join('\n') || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getMultipleBasicFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    tableTitle: table?.title,
  })

  const q: MultipleBasicQuestion = {
    id: `multiple-basic-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'multiple-basic',
    difficulty: input.difficulty,
    term,
    passage,
    table,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableMultipleBasicMcq(q)) return null
  return q
}

export function parseMultipleBasicMcqAiObject(item: unknown): {
  term: string
  passage: string
  table: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: unknown
  method: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const stem = String(o.stem ?? o.question ?? '').trim()
  if (!stem) return null
  let picked = extractMcqCorrectAndDistractors(o)
  if (!picked) {
    const correctRaw = String(o.correct ?? o.answer ?? '').trim()
    const distractorsRaw = Array.isArray(o.distractors)
      ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
      : []
    if (correctRaw) {
      const ds = coerceDistractors(correctRaw, distractorsRaw)
      if (ds.length === 3) picked = { correct: correctRaw, distractors: ds }
    }
  }
  if (!picked) return null
  return {
    term: String(o.term ?? '').trim() || '倍数基本公式',
    passage: String(o.passage ?? o.material ?? '').trim(),
    table: o.table ?? o.tableSpec ?? null,
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const MULTIPLE_BASIC_EASY_SEEDS: Array<{
  skillId: MultipleBasicEasySkillId
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
}> = [
  {
    skillId: 'is-times',
    term: '股份制利润是国企的几倍',
    passage:
      '2019年1—5月，国有控股企业利润总额7342.3亿元，股份制企业利润总额16993.1亿元。',
    stem: '2019年1—5月股份制企业利润总额约是国有控股企业的多少倍？',
    correct: '2.3倍',
    distractors: ['1.3倍', '2.0倍', '2.6倍'],
    explanation: '16993.1/7342.3≈2.31≈2.3倍。答案为2.3倍。',
    evidenceSpans: ['16993.1', '7342.3'],
    method: 'A/B',
  },
  {
    skillId: 'more-times',
    term: '甲比乙多几倍',
    passage: '甲公司营收120亿元，乙公司营收40亿元。',
    stem: '甲公司营收比乙公司多几倍？',
    correct: '2倍',
    distractors: ['3倍', '1倍', '2.5倍'],
    explanation: '120/40−1=3−1=2倍。注意不是「是3倍」。答案为2倍。',
    evidenceSpans: ['120', '40'],
    method: 'A/B−1',
  },
  {
    skillId: 'doubling-n',
    term: '翻两番是几倍',
    passage: '规划提出到2020年国内生产总值比2000年翻两番。',
    stem: '按此目标，2020年GDP将是2000年的多少倍？',
    correct: '4倍',
    distractors: ['2倍', '3倍', '8倍'],
    explanation: '翻两番=2^2=4倍。答案为4倍。',
    evidenceSpans: ['翻两番'],
    method: '2^n',
  },
  {
    skillId: 'doubling-value',
    term: '翻三番后的产值',
    passage: '某县基期工业产值为5亿元，规划翻三番。',
    stem: '翻三番后工业产值应为多少亿元？',
    correct: '40亿元',
    distractors: ['15亿元', '20亿元', '80亿元'],
    explanation: '5×2^3=5×8=40。答案为40亿元。',
    evidenceSpans: ['5', '翻三番'],
    method: '基期×2^n',
  },
  {
    skillId: 'more-as-percent',
    term: '城镇消费比农村高百分数',
    passage:
      '2018年全国居民人均消费支出中，城镇为26112元，农村为12124元。',
    stem: '城镇居民人均消费支出约比农村高多少？',
    correct: '115.4%',
    distractors: ['115.4倍', '2.15倍', '15.4%'],
    explanation:
      '26112/12124−1≈2.154−1=1.154=115.4%。「高几倍」可写成百分数。答案为115.4%。',
    evidenceSpans: ['26112', '12124'],
    method: 'A/B−1（百分数）',
  },
]

export function takeMultipleBasicEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: MultipleBasicEasySkillId[] = [],
): MultipleBasicQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...MULTIPLE_BASIC_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: MultipleBasicQuestion[] = []
  const used = new Set<MultipleBasicEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildMultipleBasicQuestionFromMcq({
      ...seed,
      difficulty: 'easy',
      seq: seq++,
    })
    if (!q || avoidFingerprints.has(q.fingerprint)) return
    out.push(q)
    used.add(seed.skillId)
    avoidFingerprints.add(q.fingerprint)
  }
  for (const seed of pool) tryPush(seed, false)
  for (const seed of pool) tryPush(seed, true)
  return out
}

export type MultipleBasicHardSeedTemplate = {
  term: string
  passage: string
  table: MultipleBasicTableSpec
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: MultipleBasicHardSkillId
}

const WAREHOUSE_TABLE: MultipleBasicTableSpec = {
  title: '某国2018年仓储业和邮政业主要指标',
  unit: '万人、亿元',
  columns: ['指标', '企业法人单位(个)', '从业人员', '资产总计', '营业收入', '营业利润'],
  rows: [
    ['仓储业', 24315, 51.5, 18652.3, 3020.9, 186.4],
    ['邮政业', 18762, 78.4, 4521.8, 939.1, 42.7],
  ],
}

const MULTIPLE_BASIC_HARD_SEEDS: MultipleBasicHardSeedTemplate[] = [
  {
    skillId: 'table-per-capita-times',
    term: '仓储人均营收是邮政的几倍',
    passage: '根据下表。',
    table: WAREHOUSE_TABLE,
    stem: '2018年仓储业平均每名从业人员创造的营业收入约是邮政业的多少倍？',
    correct: '5倍',
    distractors: ['3倍', '4倍', '6倍'],
    explanation:
      '仓储人均≈3020.9/51.5≈58.7；邮政人均≈939.1/78.4≈12.0；58.7/12≈4.9≈5倍。答案为5倍。',
    evidenceSpans: ['3020.9', '51.5', '939.1', '78.4'],
    method: '(营收/从业)之比',
  },
  {
    skillId: 'table-is-times',
    term: '仓储资产是邮政的几倍',
    passage: '根据下表资产总计列。',
    table: WAREHOUSE_TABLE,
    stem: '2018年仓储业资产总计约是邮政业的多少倍？',
    correct: '约4.1倍',
    distractors: ['约3.2倍', '约5.0倍', '约2.5倍'],
    explanation: '18652.3/4521.8≈4.13。答案为约4.1倍。',
    evidenceSpans: ['18652.3', '4521.8'],
    method: 'A/B读表',
  },
  {
    skillId: 'table-more-times',
    term: '仓储利润比邮政高几倍',
    passage: '根据下表营业利润列。',
    table: WAREHOUSE_TABLE,
    stem: '2018年仓储业营业利润约比邮政业高几倍？',
    correct: '约3.4倍',
    distractors: ['约4.4倍', '约2.4倍', '约3.0倍'],
    explanation: '186.4/42.7−1≈4.37−1≈3.37≈3.4倍。勿选「是4.4倍」。答案为约3.4倍。',
    evidenceSpans: ['186.4', '42.7'],
    method: 'A/B−1',
  },
  {
    skillId: 'table-multi-step',
    term: '人均利润之比',
    passage: '根据下表求人均营业利润之比。',
    table: WAREHOUSE_TABLE,
    stem: '仓储业人均营业利润约是邮政业的多少倍？',
    correct: '约6.6倍',
    distractors: ['约4.4倍', '约5.5倍', '约8.0倍'],
    explanation:
      '仓储人均利润≈186.4/51.5≈3.62；邮政≈42.7/78.4≈0.545；3.62/0.545≈6.6。答案为约6.6倍。',
    evidenceSpans: ['186.4', '51.5', '42.7', '78.4'],
    method: '先人均再比倍',
  },
  {
    skillId: 'table-compare-rows',
    term: '营收是利润的几倍（定位行）',
    passage: '根据下表仓储业行。',
    table: WAREHOUSE_TABLE,
    stem: '2018年仓储业营业收入约是其营业利润的多少倍？',
    correct: '约16.2倍',
    distractors: ['约12倍', '约20倍', '约14倍'],
    explanation: '3020.9/186.4≈16.2。答案为约16.2倍。',
    evidenceSpans: ['3020.9', '186.4'],
    method: '同行两列相除',
  },
]

export function pickMultipleBasicHardSeedTemplates(
  count: number,
): MultipleBasicHardSeedTemplate[] {
  const pool = [...MULTIPLE_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: MultipleBasicHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildMultipleBasicHardFromSeedTemplate(
  seed: MultipleBasicHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): MultipleBasicQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildMultipleBasicQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeMultipleBasicHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): MultipleBasicQuestion[] {
  if (need <= 0) return []
  const pool = [...MULTIPLE_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: MultipleBasicQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildMultipleBasicHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildMultipleBasicHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderMultipleBasicPassageHtml }
