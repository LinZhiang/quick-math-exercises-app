/**
 * 资料分析 · 增长——年均增长
 * 考点对齐教材：年均增长量/增长率、多期连乘总增速、初期年份判定（一般/这n年/五年规划）、
 * 特征数字估算、(1+r)^n 外推、年均下降量推算、表格同比增量外推等。
 * 简单题：纯文字、计算相对简明；复杂题：柱+折线图或数据表，难度对齐真题。
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
  parseGrowthChartSpec,
  type GrowthChartSpec,
  validateGrowthGeneralAnswerMath,
} from '@/utils/dataAnalysisGrowthPractice'
import { looksLikeDataAnalysisFormulaAnswer } from '@/utils/dataAnalysisMathDisplay'

export type GrowthAvgAnnualDifficulty = DataAnalysisDifficulty

export const GROWTH_AVG_ANNUAL_QUESTION_COUNT = 5

export const GROWTH_AVG_ANNUAL_MODES: {
  id: GrowthAvgAnnualDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '增长·年均增长 · 简单',
    desc: '每轮 5 题 · 纯文字 · 年均增长量/增长率、初期判定、多期连乘 · 数字好算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '增长·年均增长 · 复杂',
    desc: '每轮 5 题 · 柱折线图或数据表 · 多步外推/十字运算/根号表达式 · 对齐真题或更难 · 仅豆包 · 正计时停表看答案',
  },
]

/** 复杂题数据表（如银行替代率） */
export type GrowthAvgAnnualTableSpec = {
  title: string
  /** 列头，首列为行类目名 */
  columns: string[]
  /** 每行：[类目, ...数值或字符串] */
  rows: Array<Array<string | number>>
  unit?: string
}

export type GrowthAvgAnnualQuestion = {
  id: string
  topic: 'growth-avg-annual'
  difficulty: GrowthAvgAnnualDifficulty
  term: string
  passage: string
  chart: GrowthChartSpec | null
  table: GrowthAvgAnnualTableSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function growthAvgAnnualTopicLabel(): string {
  return '增长·年均增长'
}

export function growthAvgAnnualDifficultyLabel(d: GrowthAvgAnnualDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type GrowthAvgAnnualEasySkillId =
  | 'avg-delta'
  | 'end-from-avg-delta'
  | 'periods-from-avg-delta'
  | 'avg-rate-char'
  | 'avg-rate-approx'
  | 'end-from-avg-rate'
  | 'base-from-avg-rate'
  | 'multi-year-compound'
  | 'start-year-rule'
  | 'avg-decrease-project'

export type GrowthAvgAnnualEasySkillSlot = {
  id: GrowthAvgAnnualEasySkillId
  label: string
  prompt: string
}

/** 简单题考点：覆盖教材公式①–⑥、多期连乘、初期判定、年均下降推算 */
export const GROWTH_AVG_ANNUAL_EASY_SKILL_SLOTS: GrowthAvgAnnualEasySkillSlot[] = [
  {
    id: 'avg-delta',
    label: '求年均增长量',
    prompt:
      '给初期、末期与年份跨度，求年均增长量=(末期−初期)/(末年−初年)。数字取整好算。',
  },
  {
    id: 'end-from-avg-delta',
    label: '由年均增长量求末期',
    prompt: '给初期、年均增长量与增长期数，求末期=初期+期数×年均增长量。',
  },
  {
    id: 'periods-from-avg-delta',
    label: '由年均增长量求期数',
    prompt: '给初期、末期、年均增长量，求期数=(末期−初期)/年均增长量。',
  },
  {
    id: 'avg-rate-char',
    label: '年均增长率（特征数字）',
    prompt:
      '给初期末期与期数，用末期/初期与 1.1^n、1.2^n 等特征数字比较，选出年均增长率；explanation 写出比值与对照。',
  },
  {
    id: 'avg-rate-approx',
    label: '年均增长率近似估',
    prompt:
      '当增速较小（常<10%）且选项差距大：年均增长率≈年均增长量/初期值（结果略偏大）。先算年均增长量再除以初期。',
  },
  {
    id: 'end-from-avg-rate',
    label: '由年均增长率求末期',
    prompt: '末期=初期×(1+r)^n；数字取便于心算的 r、n。',
  },
  {
    id: 'base-from-avg-rate',
    label: '由年均增长率求初期',
    prompt: '初期=末期/(1+r)^n。',
  },
  {
    id: 'multi-year-compound',
    label: '多期连乘总增速',
    prompt:
      '给出连续 n(≥2) 年同比增速，求末期相对基期总增速=(1+q1)…(1+qn)−1；可用近似。',
  },
  {
    id: 'start-year-rule',
    label: '初期年份判定',
    prompt:
      '必考其一：①「2014—2018年」初期=2014、期数=4；②「这四年2018—2021年」初期=2017、期数=4；③「十三五（2016—2020）」初期=2015、期数=5。设问求期数或初期年份。',
  },
  {
    id: 'avg-decrease-project',
    label: '年均下降量推中间年',
    prompt:
      '给首末两年某比率与下降幅度，先求年均下降量（百分点），再推中间某年值。仿贫困发生率例，数字简化。',
  },
]

export function pickGrowthAvgAnnualEasySkillPlan(
  count: number,
): GrowthAvgAnnualEasySkillSlot[] {
  const pool = [...GROWTH_AVG_ANNUAL_EASY_SKILL_SLOTS]
  shuffleInPlace(pool)
  // 每轮尽量覆盖不同考点；不够再循环
  const out: GrowthAvgAnnualEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...GROWTH_AVG_ANNUAL_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectGrowthAvgAnnualEasySkillId(q: {
  stem: string
  explanation: string
}): GrowthAvgAnnualEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/五年规划|十三五|这四|这五|初期/.test(s) && /期数|初期|年/.test(s))
    return 'start-year-rule'
  if (/下降|回落/.test(s) && /年均/.test(s)) return 'avg-decrease-project'
  if (/\(1\+|×\(1\+|连乘|总增速/.test(s) && /%/.test(s)) return 'multi-year-compound'
  if (/年均增长量/.test(s) && /末期|达到/.test(s)) return 'end-from-avg-delta'
  if (/年均增长量/.test(s) && /几年|期数|需要/.test(s)) return 'periods-from-avg-delta'
  if (/年均增长量/.test(s)) return 'avg-delta'
  if (/近似|≈|年均增长量\s*\/\s*初期/.test(s)) return 'avg-rate-approx'
  if (/初期|基期/.test(s) && /\(1\+|年均增长/.test(s)) return 'base-from-avg-rate'
  if (/年均增长/.test(s) && (/达到|末期|将为/.test(s) || /\(1\+/.test(s)))
    return 'end-from-avg-rate'
  if (/年均增长/.test(s) || /开方|特征|1\.1\^/.test(s)) return 'avg-rate-char'
  return null
}

export type GrowthAvgAnnualHardSkillId =
  | 'chart-project-avg-rate'
  | 'chart-avg-delta'
  | 'table-increment-project'
  | 'chart-start-year-fy'
  | 'chart-multi-compound'
  | 'chart-root-avg-rate'

export type GrowthAvgAnnualHardSkillSlot = {
  id: GrowthAvgAnnualHardSkillId
  label: string
  prompt: string
}

export const GROWTH_AVG_ANNUAL_HARD_SKILL_SLOTS: GrowthAvgAnnualHardSkillSlot[] = [
  {
    id: 'chart-project-avg-rate',
    label: '读图年均增速多步外推',
    prompt:
      '柱+折线；先定初期与期数，再外推未来。须多步（如先求比值再乘，或跨不同年数），选项接近，难度≥真题8。',
  },
  {
    id: 'chart-avg-delta',
    label: '读图年均增长量再推算',
    prompt: '先求年均增长量，再推中间年或达标年；禁止一步除法直接出答案。',
  },
  {
    id: 'table-increment-project',
    label: '表格同比增量外推',
    prompt:
      '多列数据表；比较多家银行/主体增量，问最先达标年或某行还需几年；须进位取整。',
  },
  {
    id: 'chart-start-year-fy',
    label: '五年规划初期+读图多步',
    prompt: '含「十三五/十四五/这四年」初期陷阱，结合柱值求年均量或率，并可再外推。',
  },
  {
    id: 'chart-multi-compound',
    label: '读折线多期连乘',
    prompt: '从图取连续三年及以上增速连乘求总增速；数字不宜过整，需近似。',
  },
  {
    id: 'chart-root-avg-rate',
    label: '年均增长率估算（开方）',
    prompt:
      '须用末期/初期开n次方估算年均增长率，选项给百分数约值（禁止根号表达式作选项）；解析可写开方过程。',
  },
]

export function getGrowthAvgAnnualQuestionFingerprint(input: {
  difficulty: GrowthAvgAnnualDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  chartTitle?: string
  tableTitle?: string
}): string {
  return [
    'growth-avg-annual',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.chartTitle?.trim() ?? '',
    input.tableTitle?.trim() ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableGrowthAvgAnnualMcq(q: {
  stem: string
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
  const deltas = [1, 2, 5, -1, 3, 10, -2]
  for (const d of deltas) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const v = Math.round((num + d) * 10) / 10
    const t = `${v}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function parseGrowthAvgAnnualTableSpec(
  raw: unknown,
): GrowthAvgAnnualTableSpec | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = String(o.title ?? '').trim()
  const columns = Array.isArray(o.columns)
    ? o.columns.map((c) => String(c ?? '').trim()).filter(Boolean)
    : []
  const rowsRaw = Array.isArray(o.rows) ? o.rows : []
  const rows: Array<Array<string | number>> = []
  for (const r of rowsRaw) {
    if (!Array.isArray(r) || r.length < 2) continue
    rows.push(r.map((c, i) => (i === 0 ? String(c) : Number.isFinite(Number(c)) ? Number(c) : String(c))))
  }
  if (!title || columns.length < 2 || rows.length < 2) return null
  return {
    title,
    columns,
    rows,
    unit: String(o.unit ?? '').trim() || undefined,
  }
}

export function buildGrowthAvgAnnualQuestionFromMcq(input: {
  difficulty: GrowthAvgAnnualDifficulty
  term: string
  passage?: string
  chart?: unknown
  table?: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): GrowthAvgAnnualQuestion | null {
  const term = input.term.trim() || '年均增长'
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  const distractors = coerceDistractors(
    correct,
    input.distractors.map((d) => d.trim()).filter(Boolean),
  )
  if (!stem || !correct || distractors.length !== 3) return null

  const chart =
    input.difficulty === 'hard'
      ? parseGrowthChartSpec(input.chart ?? null, { requireCombo: true })
      : null
  const table =
    input.difficulty === 'hard' ? parseGrowthAvgAnnualTableSpec(input.table ?? null) : null

  if (input.difficulty === 'hard' && !chart && !table) return null
  if (input.difficulty === 'easy' && passage.length < 8) return null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按年均增长关系计算，答案为 ${correct}。`
  }
  const formulaAns = looksLikeDataAnalysisFormulaAnswer(correct)
  const approxAns = /^约/.test(correct)
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: input.difficulty === 'easy' || formulaAns || approxAns,
  })
  if (!math.ok) return null

  const highlightSource = [passage, chart?.title ?? '', table?.title ?? '']
    .filter(Boolean)
    .join('\n')
  const evidenceSpans = normalizeGrowthEvidenceSpans(
    highlightSource || passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getGrowthAvgAnnualQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    chartTitle: chart?.title,
    tableTitle: table?.title,
  })

  const q: GrowthAvgAnnualQuestion = {
    id: `growth-avg-annual-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'growth-avg-annual',
    difficulty: input.difficulty,
    term,
    passage,
    chart,
    table,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableGrowthAvgAnnualMcq(q)) return null
  return q
}

export function parseGrowthAvgAnnualMcqAiObject(item: unknown): {
  term: string
  passage: string
  chart: unknown
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
    term: String(o.term ?? o.topic ?? '').trim() || '年均增长',
    passage: String(o.passage ?? o.material ?? '').trim(),
    chart: o.chart ?? o.chartSpec ?? null,
    table: o.table ?? o.tableSpec ?? o.数据表 ?? null,
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? o.解析 ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? o.evidence ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const GROWTH_AVG_ANNUAL_EASY_SEEDS: Array<{
  skillId: GrowthAvgAnnualEasySkillId
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
    skillId: 'avg-delta',
    term: '年均增长量',
    passage: '2014年某市货运量4000万吨，2018年为6000万吨。',
    stem: '2014—2018年该市货运量年均增长量是多少万吨？',
    correct: '500万吨',
    distractors: ['400万吨', '1000万吨', '2000万吨'],
    explanation: '期数=2018-2014=4。年均增长量=(6000-4000)/4=2000/4=500万吨。',
    evidenceSpans: ['4000', '6000'],
    method: '(末期−初期)/期数',
  },
  {
    skillId: 'end-from-avg-delta',
    term: '由年均增长量求末期',
    passage: '2016年某县财政收入80亿元。若此后年均增长量保持5亿元。',
    stem: '按此年均增长量，2020年财政收入将达到多少亿元？',
    correct: '100亿元',
    distractors: ['95亿元', '105亿元', '85亿元'],
    explanation: '期数=2020-2016=4。末期=80+4×5=80+20=100亿元。',
    evidenceSpans: ['80', '5'],
    method: '初期+期数×年均增长量',
  },
  {
    skillId: 'periods-from-avg-delta',
    term: '由年均增长量求期数',
    passage: '某产品产量从120万吨增至180万吨，年均增长量15万吨。',
    stem: '按此年均增长量，产量从120万吨增至180万吨大约需要几年？',
    correct: '4年',
    distractors: ['3年', '5年', '6年'],
    explanation: '期数=(180-120)/15=60/15=4年。',
    evidenceSpans: ['120', '180', '15'],
    method: '(末期−初期)/年均增长量',
  },
  {
    skillId: 'avg-rate-char',
    term: '年均增长率特征数字',
    passage: '2015年某企业营收100亿元，2020年为161亿元。',
    stem: '2015—2020年该企业营收年均增长率最接近下列哪一项？',
    correct: '10%',
    distractors: ['8%', '12%', '15%'],
    explanation:
      '期数=2020-2015=5。161/100=1.61。特征数字1.1^5≈1.61，故年均增长率约为10%。',
    evidenceSpans: ['100', '161'],
    method: '末期/初期对照1.1^n',
  },
  {
    skillId: 'end-from-avg-rate',
    term: '由年均增长率求末期',
    passage: '2018年某市电商交易额200亿元。若按年均增长10%增长。',
    stem: '按年均增长10%计算，2020年交易额约为多少亿元？',
    correct: '242亿元',
    distractors: ['220亿元', '240亿元', '260亿元'],
    explanation: '期数=2。末期=200×1.1×1.1=200×1.21=242亿元。',
    evidenceSpans: ['200', '10'],
    method: '初期×(1+r)^n',
  },
  {
    skillId: 'base-from-avg-rate',
    term: '由年均增长率求初期',
    passage: '2021年某省光伏装机240万千瓦。已知2018—2021年年均增长约10%。',
    stem: '按年均增长10%反推，2018年装机约多少万千瓦？',
    correct: '180万千瓦',
    distractors: ['200万千瓦', '160万千瓦', '220万千瓦'],
    explanation: '期数=3。初期=240/(1.1^3)。1.1^3≈1.331；240/1.331≈180万千瓦。',
    evidenceSpans: ['240', '10'],
    method: '末期/(1+r)^n',
  },
  {
    skillId: 'multi-year-compound',
    term: '多期连乘总增速',
    passage: '2019—2021年某指标同比增速分别为5%、2%、8%。',
    stem: '2021年该指标相对2018年约增长了多少？',
    correct: '15.7%',
    distractors: ['15%', '16.8%', '10%'],
    explanation:
      '总增速=(1+0.05)×(1+0.02)×(1+0.08)−1。1.05×1.02=1.071；1.071×1.08=1.15668；约15.7%。',
    evidenceSpans: ['5%', '2%', '8%'],
    method: '(1+q1)…(1+qn)−1',
  },
  {
    skillId: 'start-year-rule',
    term: '一般初期判定',
    passage: '材料称「2014—2018年」某市用电量年均增长。',
    stem: '计算该段年均增长率时，初期年份与增长期数分别是？',
    correct: '2014年，4年',
    distractors: ['2013年，4年', '2014年，5年', '2015年，3年'],
    explanation:
      '一般表述「2014—2018年」时，初期为2014年，期数=2018-2014=4。',
    evidenceSpans: ['2014—2018'],
    method: '一般初期=区间起始年',
  },
  {
    skillId: 'start-year-rule',
    term: '这四年初期判定',
    passage: '材料称「这四年2018—2021年」某市GDP年均增长。',
    stem: '计算这四年年均增长率时，增长期数与初期年份分别是？',
    correct: '4年，2017年',
    distractors: ['4年，2018年', '3年，2018年', '5年，2017年'],
    explanation:
      '「这四年2018—2021年」含2017→2018的增长，初期为2017年，期数=4。',
    evidenceSpans: ['2018—2021'],
    method: '这n年初期=起始年前一年',
  },
  {
    skillId: 'start-year-rule',
    term: '五年规划初期判定',
    passage: '「十三五」时期为2016—2020年。某省「十三五」期间工业增加值年均增长。',
    stem: '计算「十三五」年均增长率时，初期年份与增长期数分别是？',
    correct: '2015年，5年',
    distractors: ['2016年，5年', '2016年，4年', '2015年，4年'],
    explanation: '五年规划初期为规划起始年前一年，即2015年；期数=5。',
    evidenceSpans: ['2016—2020'],
    method: '五年规划初期=起始年前一年',
  },
  {
    skillId: 'avg-rate-approx',
    term: '年均增长率近似估',
    passage: '2016年某市旅游收入500亿元，2020年为700亿元。',
    stem: '选项差距较大时，用「年均增长量÷初期」近似估算2016—2020年年均增长率，最接近？',
    correct: '10%',
    distractors: ['8%', '12%', '15%'],
    explanation:
      '期数=4。年均增长量=(700-500)/4=50亿元。近似年均增长率≈50/500=10%（该近似略偏大）。答案为10%。',
    evidenceSpans: ['500', '700'],
    method: '年均增长量/初期≈年均增长率',
  },
  {
    skillId: 'avg-decrease-project',
    term: '年均下降量推中间年',
    passage:
      '某连片特困地区农村贫困发生率由2012年末的20%下降到2017年末的5%。',
    stem: '按贫困发生率年均下降幅度推算，2015年末该发生率约为？',
    correct: '11%',
    distractors: ['14%', '8%', '17%'],
    explanation:
      '五年累计下降=20-5=15个百分点；年均下降=15/5=3个百分点。2015相对2012过了3年：20-3×3=20-9=11%。',
    evidenceSpans: ['20%', '5%'],
    method: '年均下降量×年数再从初期扣',
  },
]

export function takeGrowthAvgAnnualEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: GrowthAvgAnnualEasySkillId[] = [],
): GrowthAvgAnnualQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...GROWTH_AVG_ANNUAL_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: GrowthAvgAnnualQuestion[] = []
  const used = new Set<GrowthAvgAnnualEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const { skillId: _s, ...fields } = seed
    const q = buildGrowthAvgAnnualQuestionFromMcq({
      ...fields,
      difficulty: 'easy',
      seq: seq++,
    })
    if (!q || avoidFingerprints.has(q.fingerprint)) return
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
    used.add(seed.skillId)
  }
  for (const s of pool) tryPush(s, false)
  if (out.length < need) for (const s of pool) tryPush(s, true)
  if (out.length < need) {
    for (const s of pool) {
      if (out.length >= need) break
      const { skillId: _s, ...fields } = s
      const q = buildGrowthAvgAnnualQuestionFromMcq({
        ...fields,
        stem: `${s.stem}（备${seq}）`,
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

export type GrowthAvgAnnualHardSeedTemplate = {
  term: string
  passage: string
  chart?: GrowthChartSpec | null
  table?: GrowthAvgAnnualTableSpec | null
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: GrowthAvgAnnualHardSkillId
}

const GROWTH_AVG_ANNUAL_HARD_SEEDS: GrowthAvgAnnualHardSeedTemplate[] = [
  {
    skillId: 'chart-project-avg-rate',
    term: '互联网收入跨期外推',
    passage:
      '根据下图。若从2019年起，全国互联网业务收入均按2014—2018年的年均增速增长。',
    chart: {
      title: '2013—2018年全国互联网业务收入及增长情况',
      categories: ['2013', '2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        {
          name: '业务收入',
          type: 'bar',
          values: [3317, 4229, 5444, 6651, 7902, 9562],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [32.1, 27.5, 28.7, 22.2, 18.8, 21.0],
          unit: '%',
        },
      ],
    },
    stem: '在上述假定下，2023年收入约为2018年的多少倍？',
    correct: '约2.7倍',
    distractors: ['约2.3倍', '约3.2倍', '约1.8倍'],
    explanation:
      '2014—2018期数=4，(1+r)^4=9562/4229≈2.26。2023相对2018为5年，(1+r)^5=2.26×(1+r)。1+r≈1.22，故倍数≈2.26×1.22≈2.76，约2.7倍。答案为2.7。',
    evidenceSpans: ['4229', '9562'],
    method: '(1+r)^4再乘(1+r)得5年倍数',
  },
  {
    skillId: 'chart-root-avg-rate',
    term: '年均增长率开方估算',
    passage: '根据下图全国互联网业务收入柱值作答。',
    chart: {
      title: '2013—2018年全国互联网业务收入及增长情况',
      categories: ['2013', '2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        {
          name: '业务收入',
          type: 'bar',
          values: [3317, 4229, 5444, 6651, 7902, 9562],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [32.1, 27.5, 28.7, 22.2, 18.8, 21.0],
          unit: '%',
        },
      ],
    },
    stem: '2014—2018年互联网业务收入年均增长率约为多少？',
    correct: '22.6%',
    distractors: ['18%', '25%', '28%'],
    explanation:
      '期数=4。末期/初期=9562/4229≈2.26。开四次方：√2.26≈1.50，再开方≈1.226。1.226-1=0.226；0.226×100=22.6。答案为22.6%。',
    evidenceSpans: ['4229', '9562'],
    method: '末期/初期开4次方再减1',
  },
  {
    skillId: 'chart-avg-delta',
    term: '年均增长量推达标年',
    passage:
      '根据下图。假定2018年后互联网业务收入按2014—2018年年均增长量等量增长。',
    chart: {
      title: '2013—2018年全国互联网业务收入及增长情况',
      categories: ['2013', '2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        {
          name: '业务收入',
          type: 'bar',
          values: [3317, 4229, 5444, 6651, 7902, 9562],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [32.1, 27.5, 28.7, 22.2, 18.8, 21.0],
          unit: '%',
        },
      ],
    },
    stem: '按此假定，收入最早超过12000亿元的年份是？',
    correct: '2020年',
    distractors: ['2019年', '2021年', '2022年'],
    explanation:
      '期数=4，年均增长量=(9562-4229)/4=5333/4=1333.25。12000-9562=2438；2438/1333.25≈1.83→需2年，2018+2=2020。2019年≈9562+1333=10895<12000。答案为2020年。',
    evidenceSpans: ['4229', '9562'],
    method: '年均量→差额÷年均量取整年',
  },
  {
    skillId: 'table-increment-project',
    term: '表格增量比较外推',
    passage:
      '下表为部分银行电子渠道对网点业务替代率。假定各银行2018年同比增量此后每年保持不变。',
    table: {
      title: '2013—2018年部分银行电子渠道对网点业务替代率',
      unit: '%',
      columns: ['年份', 'B银行', 'C银行', 'D银行', 'E银行'],
      rows: [
        ['2013', 92.5, 76.5, 80.9, 77.5],
        ['2014', 95.4, 85.6, 85.0, 84.7],
        ['2015', 97.3, 92.7, 91.5, 88.0],
        ['2016', 97.8, 96.2, 92.5, 90.7],
        ['2017', 98.2, 97.1, 95.9, 94.2],
        ['2018', 98.2, 98.1, 96.8, 94.0],
      ],
    },
    stem: 'D银行替代率达到100%至少要比C银行晚几年？',
    correct: '2年',
    distractors: ['1年', '3年', '4年'],
    explanation:
      'C增量=98.1-97.1=1.0，差1.9，1.9/1=1.9→2年，2020达标。D增量=96.8-95.9=0.9，差3.2，3.2/0.9≈3.56→4年，2022达标。2022-2020=2。答案为2年。',
    evidenceSpans: ['98.1', '97.1', '96.8', '95.9'],
    method: '分别外推再作差',
  },
  {
    skillId: 'chart-start-year-fy',
    term: '十三五率外推估算',
    passage:
      '「十三五」时期为2016—2020年。下图给出相关年份收入。若2021—2022年仍按「十三五」年均增速增长。',
    chart: {
      title: '2015—2020年某省软件业务收入及增速',
      categories: ['2015', '2016', '2017', '2018', '2019', '2020'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        {
          name: '收入',
          type: 'bar',
          values: [1000, 1200, 1450, 1700, 2000, 2400],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [18, 20, 20.8, 17.2, 17.6, 20],
          unit: '%',
        },
      ],
    },
    stem: '在上述假定下，2022年该省软件业务收入约为多少亿元？',
    correct: '3400亿元',
    distractors: ['2880亿元', '4800亿元', '5760亿元'],
    explanation:
      '五年规划初期=2015，期数=5，(1+r)^5=2400/1000=2.4。2022相对2020为2年，2022=2400×(1+r)^2=2400×\\sqrt[5]{2.4^2}。2.4^(2/5)≈1.42；2400×1.42≈3408≈3400亿元。答案为3400。',
    evidenceSpans: ['1000', '2400'],
    method: '五年规划初期+(1+r)^2估算',
  },
  {
    skillId: 'chart-multi-compound',
    term: '读折线四年连乘近似',
    passage: '根据下图折线增速，估算2018年收入相对2014年的总增速。',
    chart: {
      title: '2013—2018年全国互联网业务收入及增长情况',
      categories: ['2013', '2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        {
          name: '业务收入',
          type: 'bar',
          values: [3317, 4229, 5444, 6651, 7902, 9562],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [32.1, 27.5, 28.7, 22.2, 18.8, 21.0],
          unit: '%',
        },
      ],
    },
    stem: '按图中2015—2018年四年同比增速连乘，2018年较2014年约增长了多少？',
    correct: '126%',
    distractors: ['90%', '110%', '145%'],
    explanation:
      '取2015—2018增速28.7%、22.2%、18.8%、21.0%。1.287×1.222≈1.57；1.188×1.21≈1.44；1.57×1.44≈2.26。柱值核对9562/4229≈2.26。总增速百分点1.26×100=126。答案为126%。',
    evidenceSpans: ['28.7', '22.2', '18.8', '21.0'],
    method: '四年折线连乘近似',
  },
]

export function pickGrowthAvgAnnualHardSeedTemplates(
  count: number,
): GrowthAvgAnnualHardSeedTemplate[] {
  const pool = [...GROWTH_AVG_ANNUAL_HARD_SEEDS]
  shuffleInPlace(pool)
  // 保证表题与图题都有机会
  const tables = pool.filter((s) => s.table)
  const charts = pool.filter((s) => s.chart)
  const out: GrowthAvgAnnualHardSeedTemplate[] = []
  if (tables.length && count >= 2) out.push(tables[0]!)
  for (const s of charts) {
    if (out.length >= count) break
    if (!out.includes(s)) out.push(s)
  }
  for (const s of pool) {
    if (out.length >= count) break
    if (!out.includes(s)) out.push(s)
  }
  while (out.length < count) {
    out.push(...pool)
  }
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function pickGrowthAvgAnnualHardFallbackSeed(
  failed: GrowthAvgAnnualHardSeedTemplate,
  usedTerms: Set<string>,
): GrowthAvgAnnualHardSeedTemplate {
  const pool = GROWTH_AVG_ANNUAL_HARD_SEEDS.filter(
    (s) => s.stem !== failed.stem && !usedTerms.has(s.term.trim()),
  )
  const src = pool.length
    ? pool
    : GROWTH_AVG_ANNUAL_HARD_SEEDS.filter((s) => s.stem !== failed.stem)
  if (!src.length) return failed
  return src[Math.floor(Math.random() * src.length)]!
}

export function buildGrowthAvgAnnualHardFromSeedTemplate(
  seed: GrowthAvgAnnualHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): GrowthAvgAnnualQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildGrowthAvgAnnualQuestionFromMcq({
    ...fields,
    chart: seed.chart ?? null,
    table: seed.table ?? null,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeGrowthAvgAnnualHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): GrowthAvgAnnualQuestion[] {
  if (need <= 0) return []
  const pool = [...GROWTH_AVG_ANNUAL_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: GrowthAvgAnnualQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildGrowthAvgAnnualHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildGrowthAvgAnnualHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderGrowthAvgAnnualPassageHtml }
