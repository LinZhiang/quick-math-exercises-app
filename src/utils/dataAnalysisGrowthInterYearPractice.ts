/**
 * 资料分析 · 增长——隔年增长
 * 考点：隔年增速 q=(1+q1)(1+q2)-1；隔年基期 A/((1+q1)(1+q2))
 * 简单题：纯文字；复杂题：两年增速双折线图（前n个月等自然时期）
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import {
  renderDataAnalysisPassageHtml,
  stripDataAnalysisDistractorClauses,
  type DataAnalysisDifficulty,
} from '@/utils/dataAnalysisPractice'
import {
  normalizeGrowthEvidenceSpans,
  resolveGrowthExplainHighlightSpans,
  resolveGrowthStemHighlightSpans,
  validateGrowthGeneralAnswerMath,
} from '@/utils/dataAnalysisGrowthPractice'

export type GrowthInterYearDifficulty = DataAnalysisDifficulty

export const GROWTH_INTER_YEAR_QUESTION_COUNT = 5

export const GROWTH_INTER_YEAR_MODES: {
  id: GrowthInterYearDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '增长·隔年增长 · 简单',
    desc: '每轮 5 题 · 纯文字 · 隔年增速/隔年基期 · 常先用百分点还原上年增速 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '增长·隔年增长 · 复杂',
    desc: '每轮 5 题 · 两年累计增速双折线图 · 读图取 q1、q2 再算隔年增速/基期 · 难度偏大 · 仅豆包 · 正计时停表看答案',
  },
]

export type GrowthInterYearChartSeries = {
  name: string
  /** 两年增速线 */
  values: number[]
  /** 点样式：便于区分两年 */
  marker?: 'triangle' | 'square' | 'circle'
}

/** 复杂题：双折线（两年同比增速），横轴多为前n个月/上半年 */
export type GrowthInterYearChartSpec = {
  title: string
  categories: string[]
  series: GrowthInterYearChartSeries[]
  yUnit?: string
}

export type GrowthInterYearQuestion = {
  id: string
  topic: 'growth-inter-year'
  difficulty: GrowthInterYearDifficulty
  term: string
  passage: string
  chart: GrowthInterYearChartSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function growthInterYearTopicLabel(): string {
  return '增长·隔年增长'
}

export function growthInterYearDifficultyLabel(d: GrowthInterYearDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** 隔年增速（q1、q2 为百分数，如 17.9 表示 17.9%） */
export function interYearRatePercent(q1Pct: number, q2Pct: number): number {
  const q1 = q1Pct / 100
  const q2 = q2Pct / 100
  return (q1 + q2 + q1 * q2) * 100
}

/** 隔年基期 */
export function interYearBase(A: number, q1Pct: number, q2Pct: number): number {
  const q1 = q1Pct / 100
  const q2 = q2Pct / 100
  return A / ((1 + q1) * (1 + q2))
}

export type GrowthInterYearEasySkillId =
  | 'inter-rate-direct'
  | 'inter-base-direct'
  | 'inter-base-via-pp'
  | 'inter-rate-via-pp'
  | 'inter-base-approx'

export type GrowthInterYearEasySkillSlot = {
  id: GrowthInterYearEasySkillId
  label: string
  prompt: string
}

export const GROWTH_INTER_YEAR_EASY_SKILL_SLOTS: GrowthInterYearEasySkillSlot[] = [
  {
    id: 'inter-rate-direct',
    label: '直接求隔年增速',
    prompt:
      '给出连续两年同比增速 q1、q2，求隔年增速。explanation 须写 q1+q2+q1×q2（百分数先÷100），答案约到一位小数。',
  },
  {
    id: 'inter-base-direct',
    label: '直接求隔年基期',
    prompt:
      '给出现期量 A 与两年增速 q1、q2，求两年前基期。explanation 写 A/((1+q1)(1+q2))。',
  },
  {
    id: 'inter-base-via-pp',
    label: '百分点还原后再求隔年基期',
    prompt:
      '给出 A、当年增速 q1，以及「比上年高/低 x 个百分点」；先求上年增速 q2，再求隔年基期。仿教材例：先百分点差再除积。',
  },
  {
    id: 'inter-rate-via-pp',
    label: '百分点还原后再求隔年增速',
    prompt:
      '给出 q1 与「比上年高/低 x 个百分点」，先求 q2，再求隔年增速 q1+q2+q1q2。',
  },
  {
    id: 'inter-base-approx',
    label: '隔年基期估算',
    prompt:
      '数字略大，可用 (1+q1+q2) 近似分母，但 explanation 须给出精确式与约等答案。',
  },
]

export function pickGrowthInterYearEasySkillPlan(
  count: number,
): GrowthInterYearEasySkillSlot[] {
  const pool = [...GROWTH_INTER_YEAR_EASY_SKILL_SLOTS]
  shuffleInPlace(pool)
  if (count <= pool.length) return pool.slice(0, count)
  const out: GrowthInterYearEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...GROWTH_INTER_YEAR_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectGrowthInterYearEasySkillId(q: {
  stem: string
  explanation: string
}): GrowthInterYearEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/百分点/.test(s) && /基期|年前|两年前|201\d年/.test(s)) return 'inter-base-via-pp'
  if (/百分点/.test(s) && /隔年|较.*前年|比.*年.*增长/.test(s)) return 'inter-rate-via-pp'
  if (/基期|年前|两年前/.test(s)) return 'inter-base-direct'
  if (/隔年增速|两年.*增长|较.*年.*增长了/.test(s)) return 'inter-rate-direct'
  return null
}

export type GrowthInterYearHardSkillId =
  | 'chart-inter-rate'
  | 'chart-inter-base'
  | 'chart-pick-period-rate'
  | 'chart-compare-inter'

export type GrowthInterYearHardSkillSlot = {
  id: GrowthInterYearHardSkillId
  label: string
  prompt: string
}

export const GROWTH_INTER_YEAR_HARD_SKILL_SLOTS: GrowthInterYearHardSkillSlot[] = [
  {
    id: 'chart-inter-rate',
    label: '读双折线求隔年增速',
    prompt:
      'chart 为两年累计增速双折线；材料给出现期与当年增速；从图取上年同时期增速，算隔年增速。',
  },
  {
    id: 'chart-inter-base',
    label: '读双折线求隔年基期',
    prompt: '从图取两年同段增速，结合现期量求两年前基期。',
  },
  {
    id: 'chart-pick-period-rate',
    label: '定位时期再算隔年',
    prompt: '题干说「上半年/前六个月/前九个月」等，须在图中定位对应类目再取两点增速。',
  },
  {
    id: 'chart-compare-inter',
    label: '两段隔年增速比较',
    prompt: '分别算两段时期的隔年增速再比较大小或作差。',
  },
]

export function getGrowthInterYearQuestionFingerprint(input: {
  difficulty: GrowthInterYearDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  chartTitle?: string
}): string {
  return [
    'growth-inter-year',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.chartTitle?.trim() ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableGrowthInterYearMcq(q: {
  stem: string
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n)) return false
  if (new Set(norms).size !== 4) return false
  const mostlyNumeric = q.options.filter((o) => /\d/.test(o)).length >= 3
  if (mostlyNumeric) return true
  return isPlayableFourChoiceMcq(q)
}

function coerceInterYearDistractors(correct: string, distractors: string[]): string[] {
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
  if (!Number.isFinite(num)) {
    while (out.length < 3) out.push(`${c}·干扰${out.length + 1}`)
    return out.slice(0, 3)
  }
  const unit = c.replace(/[-+]?\d+(?:\.\d+)?/, '').trim() || '%'
  const deltas = [0.5, 1.2, 2.5, -0.8, 3.1, -1.5, 4, -2]
  for (const d of deltas) {
    if (out.length >= 3) break
    const v = Math.round((num + d) * 10) / 10
    const t = `${v}${unit}`
    const key = t.replace(/\s+/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  while (out.length < 3) {
    const t = `${num + out.length + 1}${unit}`
    if (!seen.has(t.replace(/\s+/g, ''))) out.push(t)
    else out.push(`${t}′`)
  }
  return out.slice(0, 3)
}

export function parseGrowthInterYearChartSpec(
  raw: unknown,
): GrowthInterYearChartSpec | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = String(o.title ?? o.name ?? '').trim()
  const categories = Array.isArray(o.categories)
    ? o.categories.map((c) => String(c ?? '').trim()).filter(Boolean)
    : []
  const seriesRaw = Array.isArray(o.series) ? o.series : []
  const series: GrowthInterYearChartSeries[] = []
  for (const item of seriesRaw) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const name = String(s.name ?? s.label ?? '').trim() || '系列'
    const values = Array.isArray(s.values)
      ? s.values.map((v) => Number(v)).filter((n) => Number.isFinite(n))
      : []
    if (values.length < 2) continue
    const markerRaw = String(s.marker ?? '').toLowerCase()
    const marker: GrowthInterYearChartSeries['marker'] =
      markerRaw.includes('tri') || markerRaw.includes('三角')
        ? 'triangle'
        : markerRaw.includes('sq') || markerRaw.includes('方')
          ? 'square'
          : 'circle'
    series.push({ name, values, marker })
  }
  if (!title || categories.length < 4 || series.length < 2) return null
  const n = Math.min(categories.length, ...series.map((s) => s.values.length))
  if (n < 4) return null
  return {
    title,
    categories: categories.slice(0, n),
    series: series.map((s, i) => ({
      ...s,
      values: s.values.slice(0, n),
      marker: s.marker ?? (i === 0 ? 'triangle' : 'square'),
    })),
    yUnit: String(o.yUnit ?? o.unit ?? '%').trim() || '%',
  }
}

function chartNumNear(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  return Math.abs(a - b) <= Math.max(0.2, Math.abs(b) * 0.02)
}

export function validateGrowthInterYearHardChartLogic(input: {
  chart: GrowthInterYearChartSpec
  stem: string
  correct: string
  explanation: string
}): { ok: boolean; reason?: string } {
  const { chart, stem, correct, explanation } = input
  if (chart.series.length < 2) return { ok: false, reason: '图须含至少两条增速折线' }
  if (chart.categories.length < 4) return { ok: false, reason: '横轴类目少于 4' }

  const useful = stripDataAnalysisDistractorClauses(explanation).replace(/[−–—]/g, '-')
  const allRates = chart.series.flatMap((s) => s.values)
  const expNums = [...useful.matchAll(/[-+]?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
  const matched = expNums.filter(
    (n) =>
      Number.isFinite(n) &&
      !(n >= 1900 && n <= 2100) &&
      allRates.some((v) => chartNumNear(v, n)),
  )
  if (matched.length < 2) {
    return { ok: false, reason: '解析须至少引用图中 2 个真实增速点' }
  }

  // 若解析出现 q1+q2+q1×q2 形态，校验隔年增速
  const m = useful.match(
    /(\d+(?:\.\d+)?)\s*%?\s*[+＋]\s*(\d+(?:\.\d+)?)\s*%?\s*[+＋]\s*(\d+(?:\.\d+)?)\s*%?\s*[×*xX]\s*(\d+(?:\.\d+)?)\s*%?/,
  )
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    // 可能是 q1+q2+q1×q2，第三、四是 q1、q2 再乘
    const c = Number(m[3])
    const d = Number(m[4])
    const productForm = chartNumNear(a, c) && chartNumNear(b, d)
    if (productForm) {
      const expected = interYearRatePercent(a, b)
      const correctNum = Number(String(correct).match(/[-+]?\d+(?:\.\d+)?/)?.[0])
      if (
        Number.isFinite(correctNum) &&
        /%|增速|增长/.test(correct + stem) &&
        Math.abs(expected - correctNum) > 1.2
      ) {
        return {
          ok: false,
          reason: `隔年增速按图约 ${expected.toFixed(1)}%，答案却是 ${correct}`,
        }
      }
    }
  }

  return { ok: true }
}

export function buildGrowthInterYearQuestionFromMcq(input: {
  difficulty: GrowthInterYearDifficulty
  term: string
  passage?: string
  chart?: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): GrowthInterYearQuestion | null {
  let term = input.term.trim() || '隔年增长'
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  let distractors = coerceInterYearDistractors(
    correct,
    input.distractors.map((d) => d.trim()).filter(Boolean),
  )
  if (!stem || !correct || distractors.length !== 3) return null

  const chart =
    input.difficulty === 'hard' ? parseGrowthInterYearChartSpec(input.chart) : null
  if (input.difficulty === 'hard' && !chart) return null
  if (input.difficulty === 'easy' && passage.length < 8) return null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按隔年增长公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: input.difficulty === 'easy',
  })
  if (!math.ok) return null

  if (input.difficulty === 'hard' && chart) {
    const logic = validateGrowthInterYearHardChartLogic({
      chart,
      stem,
      correct,
      explanation,
    })
    if (!logic.ok) return null
  }

  const highlightSource = [passage, chart?.title ?? ''].filter(Boolean).join('\n')
  const evidenceSpans = normalizeGrowthEvidenceSpans(
    highlightSource || passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getGrowthInterYearQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    chartTitle: chart?.title,
  })

  const q: GrowthInterYearQuestion = {
    id: `growth-inter-year-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'growth-inter-year',
    difficulty: input.difficulty,
    term,
    passage,
    chart,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableGrowthInterYearMcq(q)) return null
  return q
}

export function parseGrowthInterYearMcqAiObject(item: unknown): {
  term: string
  passage: string
  chart: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: unknown
  method: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim() || '隔年增长'
  const passage = String(o.passage ?? o.material ?? o.text ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  if (!stem) return null

  let picked = extractMcqCorrectAndDistractors(o)
  if (!picked) {
    const correctRaw = String(o.correct ?? o.answer ?? '').trim()
    const distractorsRaw = Array.isArray(o.distractors)
      ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
      : Array.isArray(o.options)
        ? o.options.map((x) => String(x).trim()).filter((x) => x && x !== correctRaw)
        : []
    if (correctRaw) {
      const ds = coerceInterYearDistractors(correctRaw, distractorsRaw)
      if (ds.length === 3) picked = { correct: correctRaw, distractors: ds }
    }
  }
  if (!picked) return null

  return {
    term,
    passage,
    chart: o.chart ?? o.chartSpec ?? o.figure ?? o.图 ?? null,
    stem,
    correct: picked.correct,
    distractors: coerceInterYearDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? o.解读 ?? o.解析 ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? o.evidence ?? [],
    method: String(o.method ?? o.做法 ?? '').trim(),
  }
}

/** 简单题本地保底 */
const GROWTH_INTER_YEAR_EASY_SEEDS: Array<{
  skillId: GrowthInterYearEasySkillId
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
    skillId: 'inter-base-via-pp',
    term: '营业收入隔年基期',
    passage:
      '2019年某企业营业收入50471亿元，比上年增长9.8%。该增速比上年高2.1个百分点。',
    stem: '2017年该企业营业收入约为多少亿元？',
    correct: '42680亿元',
    distractors: ['45966亿元', '48000亿元', '50471亿元'],
    explanation:
      '上年增速=9.8-2.1=7.7。隔年基期=50471/((1+0.098)×(1+0.077))=50471/(1.098×1.077)。1.098×1.077=1.182546；50471/1.182546≈42680亿元。',
    evidenceSpans: ['50471', '9.8', '2.1'],
    method: '百分点还原q2再求隔年基期',
  },
  {
    skillId: 'inter-rate-direct',
    term: '直接隔年增速',
    passage: '某市商品房销售面积2018年同比增长12.5%，2019年同比增长8.0%。',
    stem: '2019年销售面积较2017年约增长了多少？',
    correct: '21.5%',
    distractors: ['20.5%', '4.5%', '22.5%'],
    explanation:
      '隔年增速=12.5%+8%+12.5%×8%=20.5%+1%=21.5%。12.5×8=100；100/100=1。20.5+1=21.5。答案为21.5%。',
    evidenceSpans: ['12.5', '8.0'],
    method: 'q1+q2+q1×q2',
  },
  {
    skillId: 'inter-base-direct',
    term: '已知两年增速求基期',
    passage: '2020年某省快递业务收入960亿元，同比增长20%；2019年同比增长25%。',
    stem: '2018年该省快递业务收入约为多少亿元？',
    correct: '640亿元',
    distractors: ['768亿元', '800亿元', '720亿元'],
    explanation: '隔年基期=960/((1+0.2)×(1+0.25))=960/(1.2×1.25)=960/1.5=640亿元。',
    evidenceSpans: ['960', '20', '25'],
    method: 'A/((1+q1)(1+q2))',
  },
  {
    skillId: 'inter-rate-via-pp',
    term: '百分点还原隔年增速',
    passage: '2021年某行业增加值同比增长6.4%，增速比上年回落1.2个百分点。',
    stem: '2021年增加值较2019年约增长了多少？',
    correct: '14.5%',
    distractors: ['11.6%', '7.6%', '16.0%'],
    explanation:
      '上年增速=6.4+1.2=7.6。隔年增速=6.4%+7.6%+6.4%×7.6%=14%+0.4864%≈14.5%。',
    evidenceSpans: ['6.4', '1.2'],
    method: '先求q2再隔年增速',
  },
  {
    skillId: 'inter-base-approx',
    term: '隔年基期估算',
    passage: '2018年社会消费品零售总额380987亿元，同比增长9.0%；2017年同比增长10.2%。',
    stem: '2016年社会消费品零售总额约为多少亿元？',
    correct: '316800亿元',
    distractors: ['349500亿元', '300000亿元', '332000亿元'],
    explanation:
      '隔年基期=380987/((1+0.09)×(1+0.102))=380987/(1.09×1.102)。1.09×1.102=1.20118；380987/1.20118≈317180≈316800亿元。',
    evidenceSpans: ['380987', '9.0', '10.2'],
    method: '隔年基期精确除法',
  },
]

export function takeGrowthInterYearEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: GrowthInterYearEasySkillId[] = [],
): GrowthInterYearQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...GROWTH_INTER_YEAR_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: GrowthInterYearQuestion[] = []
  const usedSkills = new Set<GrowthInterYearEasySkillId>()
  let seq = seqStart

  const tryPush = (
    seed: (typeof GROWTH_INTER_YEAR_EASY_SEEDS)[number],
    allowDup: boolean,
  ) => {
    if (out.length >= need) return
    if (!allowDup && usedSkills.has(seed.skillId)) return
    const { skillId: _s, ...fields } = seed
    const q = buildGrowthInterYearQuestionFromMcq({
      ...fields,
      difficulty: 'easy',
      seq: seq++,
    })
    if (!q || avoidFingerprints.has(q.fingerprint)) return
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
    usedSkills.add(seed.skillId)
  }

  for (const seed of pool) tryPush(seed, false)
  if (out.length < need) for (const seed of pool) tryPush(seed, true)
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const { skillId: _s, ...fields } = seed
      const q = buildGrowthInterYearQuestionFromMcq({
        ...fields,
        stem: `${seed.stem}（备${seq}）`,
        difficulty: 'easy',
        seq: seq++,
      })
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export type GrowthInterYearHardSeedTemplate = {
  term: string
  passage: string
  chart: GrowthInterYearChartSpec
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: GrowthInterYearHardSkillId
}

/** 复杂题图库：两年累计增速双折线；横轴用「前n个月/上半年」等自然说法 */
const GROWTH_INTER_YEAR_HARD_SEEDS: GrowthInterYearHardSeedTemplate[] = [
  {
    skillId: 'chart-inter-rate',
    term: '软件业务收入隔年增速',
    passage:
      '2019年上半年，全国软件业务收入5409亿元，同比增长17.9%。下图为2018、2019年各累计时期同比增速。',
    chart: {
      title: '2018年、2019年软件业务收入累计同比增速',
      categories: [
        '前2个月',
        '前3个月',
        '前4个月',
        '前5个月',
        '前6个月',
        '前7个月',
        '前8个月',
        '前9个月',
      ],
      yUnit: '%',
      series: [
        {
          name: '2018年',
          marker: 'triangle',
          values: [14.8, 16.2, 18.5, 20.1, 22.9, 21.5, 20.8, 19.6],
        },
        {
          name: '2019年',
          marker: 'square',
          values: [13.1, 14.5, 15.8, 16.9, 17.9, 18.2, 17.5, 16.8],
        },
      ],
    },
    stem: '2019年上半年全国软件业务收入较2017年同期约增长了多少？',
    correct: '44.9%',
    distractors: ['40.8%', '22.9%', '35.6%'],
    explanation:
      '上半年即前6个月。q1=17.9，图中2018年前6个月q2=22.9。隔年增速=17.9+22.9+17.9×22.9/100。17.9+22.9=40.8；17.9×22.9=409.91；409.91/100=4.099；40.8+4.099=44.899≈44.9%。答案为44.9%。',
    evidenceSpans: ['5409', '17.9', '22.9'],
    method: '读前6个月两点算隔年增速',
  },
  {
    skillId: 'chart-inter-base',
    term: '读图求隔年基期',
    passage:
      '2019年前6个月某市高技术制造业增加值280亿元，同比增长12.0%。下图为两年累计增速。',
    chart: {
      title: '2018年、2019年高技术制造业增加值累计同比增速',
      categories: ['前3个月', '前4个月', '前5个月', '前6个月', '前7个月', '前8个月'],
      yUnit: '%',
      series: [
        { name: '2018年', marker: 'triangle', values: [9.5, 10.2, 10.8, 11.5, 11.0, 10.6] },
        { name: '2019年', marker: 'square', values: [10.1, 10.8, 11.4, 12.0, 11.7, 11.2] },
      ],
    },
    stem: '2017年前6个月该市高技术制造业增加值约为多少亿元？',
    correct: '224亿元',
    distractors: ['250亿元', '236亿元', '200亿元'],
    explanation:
      '前6个月：q1=12.0，图中2018年q2=11.5。基期=280/((1+0.12)×(1+0.115))=280/(1.12×1.115)。1.12×1.115=1.2488；280/1.2488≈224.2≈224亿元。',
    evidenceSpans: ['280', '12.0', '11.5'],
    method: '读图取q2再求隔年基期',
  },
  {
    skillId: 'chart-pick-period-rate',
    term: '定位前9个月隔年增速',
    passage:
      '2019年前9个月全国网上零售额73237亿元，同比增长16.8%。结合下图增速作答。',
    chart: {
      title: '2018年、2019年网上零售额累计同比增速',
      categories: ['前3个月', '前5个月', '前6个月', '前8个月', '前9个月', '前11个月'],
      yUnit: '%',
      series: [
        { name: '2018年', marker: 'triangle', values: [35.4, 30.7, 29.5, 27.8, 26.9, 25.1] },
        { name: '2019年', marker: 'square', values: [21.2, 18.5, 17.8, 17.1, 16.8, 16.0] },
      ],
    },
    stem: '2019年前9个月网上零售额较2017年同期约增长了多少？',
    correct: '48.2%',
    distractors: ['43.7%', '26.9%', '52.0%'],
    explanation:
      '定位前9个月：q1=16.8，图中2018年q2=26.9。隔年增速=16.8+26.9+16.8×26.9/100。16.8+26.9=43.7；16.8×26.9=451.92；451.92/100=4.519；43.7+4.519=48.219≈48.2%。',
    evidenceSpans: ['16.8', '26.9'],
    method: '定位累计时期再算隔年增速',
  },
  {
    skillId: 'chart-compare-inter',
    term: '两段隔年增速比较',
    passage: '根据下图，比较不同累计时期的隔年增速。',
    chart: {
      title: '2018年、2019年工业企业利润累计同比增速',
      categories: ['前3个月', '前4个月', '前5个月', '前6个月', '前7个月', '前8个月'],
      yUnit: '%',
      series: [
        { name: '2018年', marker: 'triangle', values: [15.0, 14.2, 13.5, 12.0, 11.5, 11.0] },
        { name: '2019年', marker: 'square', values: [8.0, 6.5, 5.0, 3.0, 2.5, 2.0] },
      ],
    },
    stem: '按图估算，2019年前3个月利润总额较2017年同期的隔年增速，约比前6个月隔年增速高多少个百分点？',
    correct: '8.84个百分点',
    distractors: ['5.0个百分点', '12.0个百分点', '3.0个百分点'],
    explanation:
      '前3个月：8+15=23；23+1.2=24.2。前6个月：3+12=15；15+0.36=15.36。24.2-15.36=8.84。答案为8.84个百分点。',
    evidenceSpans: ['8.0', '15.0', '3.0', '12.0'],
    method: '两段隔年增速作差',
  },
  {
    skillId: 'chart-inter-rate',
    term: '货运量隔年增速',
    passage:
      '2020年前5个月某省公路货运量4.8亿吨，同比增长6.5%。下图为2019、2020年累计增速。',
    chart: {
      title: '2019年、2020年公路货运量累计同比增速',
      categories: ['前2个月', '前3个月', '前4个月', '前5个月', '前6个月', '前7个月'],
      yUnit: '%',
      series: [
        { name: '2019年', marker: 'triangle', values: [5.2, 5.8, 6.1, 6.8, 7.0, 6.5] },
        { name: '2020年', marker: 'square', values: [3.0, 4.2, 5.5, 6.5, 6.2, 5.8] },
      ],
    },
    stem: '2020年前5个月公路货运量较2018年同期约增长了多少？',
    correct: '13.7%',
    distractors: ['13.3%', '6.8%', '15.0%'],
    explanation:
      '前5个月：q1=6.5，图中2019年q2=6.8。隔年=6.5+6.8+6.5×6.8/100。6.5+6.8=13.3；6.5×6.8=44.2；44.2/100=0.442；13.3+0.442=13.742≈13.7%。答案为13.7%。',
    evidenceSpans: ['6.5', '6.8'],
    method: '读前5个月两点算隔年增速',
  },
]

export function pickGrowthInterYearHardSeedTemplates(
  count: number,
): GrowthInterYearHardSeedTemplate[] {
  const pool = [...GROWTH_INTER_YEAR_HARD_SEEDS]
  shuffleInPlace(pool)
  if (count <= pool.length) return pool.slice(0, count)
  const out: GrowthInterYearHardSeedTemplate[] = []
  while (out.length < count) {
    const wave = [...GROWTH_INTER_YEAR_HARD_SEEDS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function pickGrowthInterYearHardFallbackSeed(
  failed: GrowthInterYearHardSeedTemplate,
  usedTerms: Set<string>,
): GrowthInterYearHardSeedTemplate {
  const pool = GROWTH_INTER_YEAR_HARD_SEEDS.filter((s) => {
    if (s.stem === failed.stem) return false
    if (usedTerms.has(s.term.trim())) return false
    return true
  })
  const src = pool.length ? pool : GROWTH_INTER_YEAR_HARD_SEEDS.filter((s) => s.stem !== failed.stem)
  if (!src.length) return failed
  return src[Math.floor(Math.random() * src.length)]!
}

export function buildGrowthInterYearHardFromSeedTemplate(
  seed: GrowthInterYearHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): GrowthInterYearQuestion | null {
  const { skillId: _skillId, ...fields } = seed
  return buildGrowthInterYearQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeGrowthInterYearHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): GrowthInterYearQuestion[] {
  if (need <= 0) return []
  const pool = [...GROWTH_INTER_YEAR_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: GrowthInterYearQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildGrowthInterYearHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildGrowthInterYearHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export {
  renderDataAnalysisPassageHtml as renderGrowthInterYearPassageHtml,
  resolveGrowthExplainHighlightSpans as resolveGrowthInterYearExplainHighlightSpans,
  resolveGrowthStemHighlightSpans as resolveGrowthInterYearStemHighlightSpans,
}
