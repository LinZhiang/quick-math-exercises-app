/**
 * 资料分析 · 增长——一般增长
 * 考点：基期/现期、增长量、增长率、同比/环比；复杂题含柱状+折线组合图。
 * 高亮流程与百分数与百分点一致（解析驱动），图本身不高亮。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'
import {
  normalizeDataAnalysisEvidenceSpans,
  renderDataAnalysisPassageHtml,
  stripDataAnalysisDistractorClauses,
  extractDataAnalysisAtomicEvidence,
  type DataAnalysisDifficulty,
} from '@/utils/dataAnalysisPractice'

export type { DataAnalysisDifficulty }

export type GrowthGeneralDifficulty = DataAnalysisDifficulty

export const GROWTH_GENERAL_QUESTION_COUNT = 5

export const GROWTH_GENERAL_MODES: {
  id: GrowthGeneralDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '增长·一般增长 · 简单',
    desc: '每轮 5 题 · 覆盖基期/现期/增长量/增长率/增速还原等考点 · 数字好算 · 无复杂统计图 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '增长·一般增长 · 复杂',
    desc: '每轮 5 题 · 柱状+折线组合图（含双图/遮罩变式）· 数字加大且防重叠 · 难度对齐公考 · 正计时停表看答案',
  },
]

/**
 * 简单题知识点槽位：每轮尽量各出一类，避免 5 题全是「现期−增长量求基期」。
 */
export type GrowthEasySkillId =
  | 'base-from-current-delta'
  | 'current-from-base-delta'
  | 'delta-from-current-base'
  | 'rate-from-delta-base'
  | 'base-from-current-rate'
  | 'current-from-base-rate'
  | 'delta-from-current-rate'
  | 'rate-restore-pp'
  | 'yoy-vs-mom'

export type GrowthEasySkillSlot = {
  id: GrowthEasySkillId
  label: string
  /** 写入豆包提示：本题必须考什么 */
  prompt: string
  /** 匹配 method/explanation，判断本地种子是否属于该槽 */
  match: RegExp
}

export const GROWTH_EASY_SKILL_SLOTS: GrowthEasySkillSlot[] = [
  {
    id: 'base-from-current-delta',
    label: '现期+增长量→基期',
    prompt:
      '本题必考：已知现期值与增长量，求基期值。公式：基期=现期−增长量。不要改考增长率。',
    match: /现期.{0,6}减.{0,6}增长量|基期\s*=\s*现期\s*[-−]/,
  },
  {
    id: 'current-from-base-delta',
    label: '基期+增长量→现期',
    prompt:
      '本题必考：已知基期值与增长量，求现期值。公式：现期=基期+增长量。不要改考基期。',
    match: /基期.{0,6}加.{0,6}增长量|现期\s*=\s*基期\s*[+＋]/,
  },
  {
    id: 'delta-from-current-base',
    label: '现期+基期→增长量',
    prompt:
      '本题必考：已知现期值与基期值，求增长量。公式：增长量=现期−基期。材料须同时给出两年/两期数值。',
    match: /增长量\s*=\s*现期|现期.{0,4}减.{0,4}基期|求增长量/,
  },
  {
    id: 'rate-from-delta-base',
    label: '增长量÷基期→增长率',
    prompt:
      '本题必考：已知现期与增长量（或基期与增长量），求增长率。公式：增长率=增长量/基期；可先还原基期再除。选项用百分数。',
    match: /增长率\s*=|增长量除以基期|\/\s*基期|÷\s*基期/,
  },
  {
    id: 'base-from-current-rate',
    label: '现期+增长率→基期',
    prompt:
      '本题必考：已知现期值与增长率，求基期值。公式：基期=现期/(1+增长率)。材料给「同比增长 r%」，不要再给增长量。',
    match: /现期除以|\/\s*\(?\s*1\s*\+|基期\s*=\s*现期\s*[／/÷]/,
  },
  {
    id: 'current-from-base-rate',
    label: '基期+增长率→现期',
    prompt:
      '本题必考：已知基期值与增长率，求现期值。公式：现期=基期×(1+增长率)。材料给基期与增速，不要给增长量。',
    match: /基期.{0,6}[×*xX].{0,8}1\s*\+|现期\s*=\s*基期\s*[×*]/,
  },
  {
    id: 'delta-from-current-rate',
    label: '现期+增长率→增长量',
    prompt:
      '本题必考：已知现期值与增长率，求增长量。公式：增长量=现期×增长率/(1+增长率)。不要只求基期。',
    match: /增长量\s*=\s*现期|现期.{0,4}[×*].{0,8}增长率|r\s*\/\s*\(1/,
  },
  {
    id: 'rate-restore-pp',
    label: '百分点还原基期增速',
    prompt:
      '本题必考：已知现期增速及「加快/回落×个百分点」，还原上一期增速。例：现期25%，比上月加快1个百分点→上月24%。不要考基期值。',
    match: /百分点|加快|回落|还原/,
  },
  {
    id: 'yoy-vs-mom',
    label: '同比与环比辨析计算',
    prompt:
      '本题必考：材料同时出现同比、环比数据，设问明确求同比基期或环比基期之一，干扰项用另一种口径的错算。一步计算即可。',
    match: /同比|环比/,
  },
]

/** 打乱后取前 n 个槽位，保证本轮考点尽量不重复 */
export function pickGrowthEasySkillPlan(count: number): GrowthEasySkillSlot[] {
  const pool = [...GROWTH_EASY_SKILL_SLOTS]
  shuffleInPlace(pool)
  if (count <= pool.length) return pool.slice(0, count)
  const out: GrowthEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...GROWTH_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectGrowthEasySkillId(q: {
  method?: string
  explanation?: string
  stem?: string
}): GrowthEasySkillId | null {
  const blob = `${q.method ?? ''}\n${q.explanation ?? ''}\n${q.stem ?? ''}`
  for (const slot of GROWTH_EASY_SKILL_SLOTS) {
    if (slot.match.test(blob)) return slot.id
  }
  return null
}

/** 前端可渲染的统计图（由 AI 给结构化数据，本地画 SVG；图上不高亮） */
export type GrowthChartSeries = {
  name: string
  /** bar=柱（通常现期量），line=折线（通常增速%） */
  type: 'bar' | 'line'
  values: number[]
  unit?: string
}

export type GrowthChartSpec = {
  title: string
  /** 横轴类目，如年份 */
  categories: string[]
  series: GrowthChartSeries[]
  leftUnit?: string
  rightUnit?: string
  /**
   * 柱顶展示覆盖（与 categories 等长）。
   * 填 '?' 表示图上遮罩待求；null/undefined 则显示真实柱值。
   */
  barDisplay?: Array<string | number | null | undefined>
}

export type GrowthGeneralQuestion = {
  id: string
  topic: 'growth-general'
  difficulty: GrowthGeneralDifficulty
  term: string
  /** 文字材料；复杂题可短，主要看 chart */
  passage: string
  /** 复杂题必有；简单题为空 */
  chart: GrowthChartSpec | null
  /** 双图题的第二张图（可选） */
  secondaryChart: GrowthChartSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function growthGeneralTopicLabel(): string {
  return '增长·一般增长'
}

export function growthGeneralDifficultyLabel(d: GrowthGeneralDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function parseNumericToken(raw: string): number | null {
  const m = String(raw ?? '').match(/([-+]?\d+(?:\.\d+)?)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function nearlyEqual(a: number, b: number, eps = 0.051): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  const scale = Math.max(Math.abs(a), Math.abs(b))
  // 小数点差/百分点：用绝对误差；大额（亿元）允许约 2% 相对误差
  if (scale <= 20) return Math.abs(a - b) <= eps
  return Math.abs(a - b) <= Math.max(eps, scale * 0.02)
}

/**
 * 校验一般增长解析算式：支持 ± × ÷ 与 ≈；末步/结论须与 correct 数值一致。
 * soft：简单题宽松模式——跳过算错中间式，答案数字出现在解析中即可通过。
 */
export function validateGrowthGeneralAnswerMath(
  correct: string,
  explanation: string,
  opts?: { soft?: boolean },
): { ok: boolean; reason?: string } {
  const soft = Boolean(opts?.soft)
  const expFull = String(explanation ?? '')
    .trim()
    .replace(/[−–—]/g, '-')
  if (!expFull) return { ok: false, reason: '缺少解析' }

  const correctNum = parseNumericToken(correct)
  if (correctNum == null) return { ok: false, reason: '标准答案无法解析数值' }

  let exp = expFull
  let lastEqResult: number | null = null
  let matchedCorrect = false
  let eqCount = 0

  const noteResult = (claimed: number) => {
    lastEqResult = claimed
    if (nearlyEqual(claimed, correctNum, Math.abs(correctNum) > 20 ? 0.25 : 0.051)) {
      matchedCorrect = true
    }
  }

  const blankRanges = (ranges: { start: number; end: number }[]) => {
    for (let i = ranges.length - 1; i >= 0; i--) {
      const { start, end } = ranges[i]!
      exp = exp.slice(0, start) + ' '.repeat(end - start) + exp.slice(end)
    }
  }

  // a / (b ± c) ≈ d  必须先抠掉，避免内层被当成「b−c=d」
  const fracRe =
    /([-+]?\d+(?:\.\d+)?)\s*%?\s*[／/÷]\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)/g
  const fracParts: { start: number; end: number }[] = []
  let sm: RegExpExecArray | null
  while ((sm = fracRe.exec(expFull)) != null) {
    const a = Number(sm[1])
    const b = Number(sm[2])
    const c = Number(sm[4])
    const den = sm[3] === '-' ? b - c : b + c
    const claimed = Number(sm[5])
    if (Math.abs(den) < 1e-9) {
      if (!soft) return { ok: false, reason: '分母为 0' }
      continue
    }
    const expected = a / den
    const claimedAsRate = claimed > 1 ? claimed / 100 : claimed
    const expectedAsPct = expected * 100
    const okFrac =
      nearlyEqual(expected, claimed, 0.05) ||
      nearlyEqual(expectedAsPct, claimed, 0.25) ||
      nearlyEqual(expected, claimedAsRate, 0.005)
    if (!okFrac) {
      if (!soft) return { ok: false, reason: `算式错误：${a}/(${b}${sm[3]}${c})≠${claimed}` }
      continue
    }
    eqCount += 1
    noteResult(claimed > 1 && expected < 1 ? claimed : expectedAsPct)
    fracParts.push({ start: sm.index, end: sm.index + sm[0].length })
  }
  blankRanges(fracParts)

  // 嵌套 (a±b)±(c±d)=e
  const nestedRe =
    /\(\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*([-+])\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)/g
  const nestedParts: { start: number; end: number }[] = []
  let nm: RegExpExecArray | null
  while ((nm = nestedRe.exec(exp)) != null) {
    const a = Number(nm[1])
    const b = Number(nm[3])
    const c = Number(nm[5])
    const d = Number(nm[7])
    const left = nm[2] === '-' ? a - b : a + b
    const right = nm[6] === '-' ? c - d : c + d
    const expected = nm[4] === '-' ? left - right : left + right
    const claimed = Number(nm[8])
    if (!nearlyEqual(expected, claimed)) {
      if (!soft) {
        return {
          ok: false,
          reason: `算式错误：(${a}${nm[2]}${b})${nm[4]}(${c}${nm[6]}${d})≠${claimed}`,
        }
      }
      continue
    }
    eqCount += 1
    noteResult(claimed)
    nestedParts.push({ start: nm.index, end: nm.index + nm[0].length })
  }
  blankRanges(nestedParts)

  // a ± b = c（含负号）；禁止匹配到括号残片
  const addRe =
    /([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*\(\s*(-)?\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)|([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)/g
  while ((sm = addRe.exec(exp)) != null) {
    let a: number
    let op: string
    let b: number
    let claimed: number
    if (sm[1] != null) {
      a = Number(sm[1])
      op = sm[2]!
      const bRaw = Number(sm[4])
      b = sm[3] === '-' ? -Math.abs(bRaw) : bRaw
      claimed = Number(sm[5])
    } else {
      a = Number(sm[6])
      op = sm[7]!
      b = Number(sm[8])
      claimed = Number(sm[9])
    }
    const expected = op === '-' ? a - b : a + b
    if (!nearlyEqual(expected, claimed)) {
      if (!soft) return { ok: false, reason: `算式错误：${a}${op}${b}≠${claimed}` }
      continue
    }
    eqCount += 1
    noteResult(claimed)
  }

  // a ×|/|÷ b = c
  const mulRe =
    /([-+]?\d+(?:\.\d+)?)\s*%?\s*[×*xX／/÷]\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)/g
  while ((sm = mulRe.exec(exp)) != null) {
    const a = Number(sm[1])
    const b = Number(sm[2])
    const claimed = Number(sm[3])
    const op = /[÷／/]/.test(sm[0]) ? '/' : '*'
    if (op === '/' && Math.abs(b) < 1e-9) {
      if (!soft) return { ok: false, reason: '除数为 0' }
      continue
    }
    const expected = op === '/' ? a / b : a * b
    if (!nearlyEqual(expected, claimed, Math.abs(expected) > 20 ? 0.2 : 0.051)) {
      if (!soft) return { ok: false, reason: `算式错误：${a}${op}${b}≠${claimed}` }
      continue
    }
    eqCount += 1
    noteResult(claimed)
  }

  if (matchedCorrect) return { ok: true }

  if (lastEqResult != null) {
    if (!nearlyEqual(lastEqResult, correctNum, Math.abs(correctNum) > 20 ? 0.25 : 0.051)) {
      const looksLikeYear = /年/.test(correct) && correctNum >= 1990 && correctNum <= 2100
      if (looksLikeYear && eqCount > 0) {
        // 答案是年份：算式校验增长量即可，不必末步等于年份数字
        return { ok: true }
      }
      if (!looksLikeYear && !soft) {
        return {
          ok: false,
          reason: `末步算式结果 ${lastEqResult} 与标准答案 ${correctNum} 不一致`,
        }
      }
    } else {
      return { ok: true }
    }
  }

  const useful = stripDataAnalysisDistractorClauses(expFull)
  const claimMatch =
    useful.match(
      /(?:最少为|最多为|答案为?|正确答案为?|故为|即为|得|共|共有)\s*([-+]?\d+(?:\.\d+)?)\s*(?:%|％|个百分点|亿元|万人|年|个)?/,
    ) ||
    useful.match(/[≈≒=＝]\s*([-+]?\d+(?:\.\d+)?)\s*(?:%|％|个百分点|亿元|万人)?(?:\s*[。；]|\s*$)/) ||
    [...useful.matchAll(/([-+]?\d+(?:\.\d+)?)\s*(?:%|％|个百分点|亿元|万人|个)/g)].at(-1)

  if (claimMatch) {
    const claimedFinal = Number(claimMatch[1])
    if (Number.isFinite(claimedFinal) && nearlyEqual(claimedFinal, correctNum, 0.25)) {
      return { ok: true }
    }
    if (
      Number.isFinite(claimedFinal) &&
      !nearlyEqual(claimedFinal, correctNum, 0.25) &&
      !soft
    ) {
      return {
        ok: false,
        reason: `解析结论 ${claimedFinal} 与标准答案 ${correctNum} 不一致`,
      }
    }
  }

  // 答案为「2018年」类：解析点名该年份且有算式即可
  if (/年/.test(correct) && correctNum >= 1990 && correctNum <= 2100 && eqCount > 0) {
    if (useful.includes(String(correctNum)) || useful.includes(correct.replace(/\s+/g, ''))) {
      return { ok: true }
    }
  }

  if (soft) {
    const escaped = String(correctNum).replace('.', '\\.')
    const re = new RegExp(`(?<![\\d.])${escaped}(?![\\d])`)
    if (re.test(useful) && useful.length >= 8) return { ok: true }
    return { ok: true }
  }

  if (eqCount === 0) {
    return { ok: false, reason: '解析缺少可校验算式' }
  }
  return { ok: false, reason: '解析结论与标准答案不一致' }
}

export function parseGrowthChartSpec(
  raw: unknown,
  opts?: { requireCombo?: boolean },
): GrowthChartSpec | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = String(o.title ?? o.name ?? '').trim()
  const categories = Array.isArray(o.categories)
    ? o.categories.map((c) => String(c ?? '').trim()).filter(Boolean)
    : Array.isArray(o.years)
      ? o.years.map((c) => String(c ?? '').trim()).filter(Boolean)
      : []
  const seriesRaw = Array.isArray(o.series) ? o.series : []
  const series: GrowthChartSeries[] = []
  for (const item of seriesRaw) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const name = String(s.name ?? s.label ?? '').trim() || '系列'
    const typeRaw = String(s.type ?? 'bar').toLowerCase()
    const type: 'bar' | 'line' =
      typeRaw.includes('line') || typeRaw.includes('折') ? 'line' : 'bar'
    const values = Array.isArray(s.values)
      ? s.values.map((v) => Number(v)).filter((n) => Number.isFinite(n))
      : Array.isArray(s.data)
        ? s.data.map((v) => Number(v)).filter((n) => Number.isFinite(n))
        : []
    if (values.length < 2) continue
    series.push({
      name,
      type,
      values,
      unit: String(s.unit ?? '').trim() || undefined,
    })
  }
  if (!title || categories.length < 2 || series.length < 1) return null
  // 对齐长度（截断；禁止用 0 瞎补导致图-题对不上）
  const n = Math.min(
    categories.length,
    ...series.map((s) => s.values.length),
  )
  if (n < 2) return null
  const cats = categories.slice(0, n)
  for (const s of series) {
    s.values = s.values.slice(0, n)
  }
  if (opts?.requireCombo) {
    const hasBar = series.some((s) => s.type === 'bar')
    const hasLine = series.some((s) => s.type === 'line')
    if (!hasBar || !hasLine) return null
    if (cats.length < 4) return null
  }
  const barDisplayRaw = Array.isArray(o.barDisplay)
    ? o.barDisplay
    : Array.isArray(o.barLabels)
      ? o.barLabels
      : null
  const barDisplay = barDisplayRaw
    ? cats.map((_, i) => {
        const v = barDisplayRaw[i]
        if (v == null || v === '') return null
        return v as string | number
      })
    : undefined
  return {
    title,
    categories: cats,
    series,
    leftUnit: String(o.leftUnit ?? o.valueUnit ?? '').trim() || undefined,
    rightUnit: String(o.rightUnit ?? o.rateUnit ?? '%').trim() || undefined,
    barDisplay,
  }
}

function chartNumNearlyEqual(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  const scale = Math.max(Math.abs(a), Math.abs(b))
  if (scale <= 5) return Math.abs(a - b) <= 0.15
  if (scale <= 50) return Math.abs(a - b) <= 0.35
  return Math.abs(a - b) <= Math.max(0.6, scale * 0.015)
}

function collectChartNumberPool(chart: GrowthChartSpec): {
  values: number[]
  deltas: number[]
  ratesFromBar: number[]
  categories: string[]
} {
  const bar = chart.series.find((s) => s.type === 'bar')
  const values: number[] = []
  for (const s of chart.series) values.push(...s.values)
  const deltas: number[] = []
  const ratesFromBar: number[] = []
  if (bar) {
    for (let i = 1; i < bar.values.length; i++) {
      const cur = bar.values[i]!
      const prev = bar.values[i - 1]!
      const d = cur - prev
      deltas.push(d)
      if (Math.abs(prev) > 1e-9) ratesFromBar.push((d / prev) * 100)
    }
  }
  return { values, deltas, ratesFromBar, categories: chart.categories }
}

/**
 * 复杂题图-题-解析一致性：解析须引用图中数据；增长量最值题答案须与柱图一致。
 */
export function validateGrowthHardChartLogic(input: {
  chart: GrowthChartSpec
  stem: string
  correct: string
  explanation: string
  secondaryChart?: GrowthChartSpec | null
}): { ok: boolean; reason?: string } {
  const chart = input.chart
  const secondary = input.secondaryChart ?? null
  const stem = String(input.stem ?? '')
  const correct = String(input.correct ?? '').trim()
  const useful = stripDataAnalysisDistractorClauses(input.explanation).replace(/[−–—]/g, '-')

  const hasBar = chart.series.some((s) => s.type === 'bar')
  const hasLine = chart.series.some((s) => s.type === 'line')
  if (!hasBar) return { ok: false, reason: '图缺少柱状（现期量）系列' }
  if (!hasLine) return { ok: false, reason: '图缺少折线（增速）系列' }
  if (chart.categories.length < 4) return { ok: false, reason: '图类目少于 4 个' }

  if (secondary) {
    if (!secondary.series.some((s) => s.type === 'bar') || !secondary.series.some((s) => s.type === 'line')) {
      return { ok: false, reason: '第二张图须同时含柱+折线' }
    }
  }

  const pool = collectChartNumberPool(chart)
  const citeValues = [...pool.values]
  const citeDeltas = [...pool.deltas]
  const citeRates = [...pool.ratesFromBar]
  if (secondary) {
    const p2 = collectChartNumberPool(secondary)
    citeValues.push(...p2.values)
    citeDeltas.push(...p2.deltas)
    citeRates.push(...p2.ratesFromBar)
  }
  const bar = chart.series.find((s) => s.type === 'bar')!
  const line = chart.series.find((s) => s.type === 'line')!
  const axisCats = [...chart.categories, ...(secondary?.categories ?? [])]

  // 答案若含「xxxx年」才当成年份校验（避免 72062 被误读成 2062）
  const correctYear =
    correct.match(/(?:19|20)\d{2}\s*年/)?.[0]?.match(/\d{4}/)?.[0] ??
    (/^(?:19|20)\d{2}$/.test(correct.replace(/\s+/g, ''))
      ? correct.replace(/\s+/g, '')
      : undefined)
  if (correctYear) {
    const onAxis = axisCats.some(
      (c) => c.includes(correctYear) || correctYear.includes(c.replace(/年/g, '')),
    )
    if (!onAxis) {
      return {
        ok: false,
        reason: `答案年份 ${correctYear} 不在图横轴（${axisCats.join('、')}）`,
      }
    }
  }

  // 解析须真正用到图中至少 2 个数据点（柱值/折线值/相邻增长量；双图可互引）
  const expNums = [...useful.matchAll(/[-+]?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
  const lineCite = [
    ...line.values,
    ...(secondary?.series.find((s) => s.type === 'line')?.values ?? []),
  ]
  const matched = expNums.filter((n) => {
    if (!Number.isFinite(n)) return false
    if (n >= 1900 && n <= 2100) return false // 年份不计入
    return (
      citeValues.some((v) => chartNumNearlyEqual(v, n)) ||
      citeDeltas.some((d) => chartNumNearlyEqual(d, n)) ||
      citeRates.some((r) => chartNumNearlyEqual(r, n)) ||
      lineCite.some((v) => chartNumNearlyEqual(v, n))
    )
  })
  if (matched.length < 2) {
    return { ok: false, reason: '解析须至少引用图中 2 个真实数据（柱/线/增长量）' }
  }

  // 算式 a-b=c：若 a、b 都是相邻柱值，则 c 必须等于增长量
  for (const m of useful.matchAll(
    /(\d+(?:\.\d+)?)\s*[-−–—]\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)/g,
  )) {
    const a = Number(m[1])
    const b = Number(m[2])
    const c = Number(m[3])
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue
    // 识别为相邻柱：a=后一年，b=前一年
    for (let i = 1; i < bar.values.length; i++) {
      const cur = bar.values[i]!
      const prev = bar.values[i - 1]!
      if (chartNumNearlyEqual(cur, a) && chartNumNearlyEqual(prev, b)) {
        const delta = cur - prev
        if (!chartNumNearlyEqual(delta, c)) {
          return {
            ok: false,
            reason: `图上 ${chart.categories[i]}−${chart.categories[i - 1]} 增长量应为 ${Math.round(delta * 100) / 100}，解析写 ${c}`,
          }
        }
      }
    }
  }

  // 「增长量最大/最小的年份」：仅当答案本身是年份时校验
  if (
    /增长量/.test(stem) &&
    /(最大|最多|最小|最少|最低|最高)/.test(stem) &&
    /(?:19|20)\d{2}\s*年?/.test(correct) &&
    !/百分点|倍|亿元|万|%|个(?!年)/.test(correct)
  ) {
    const wantMax = /(最大|最多|最高)/.test(stem)
    if (pool.deltas.length > 0) {
      let bestI = 0
      let best = pool.deltas[0]!
      for (let i = 1; i < pool.deltas.length; i++) {
        const d = pool.deltas[i]!
        if (wantMax ? d > best + 1e-9 : d < best - 1e-9) {
          best = d
          bestI = i
        }
      }
      // deltas[i] 对应 categories[i+1]
      const yearLabel = chart.categories[bestI + 1]!
      const yearNum = yearLabel.match(/\d{4}/)?.[0] ?? yearLabel
      const correctBlob = correct.replace(/\s+/g, '')
      const okYear =
        correctBlob.includes(yearNum) ||
        correctBlob.includes(yearLabel) ||
        chart.categories.some(
          (c, idx) =>
            idx === bestI + 1 &&
            (correctBlob.includes(c) || correctBlob.includes(c.replace(/年/, ''))),
        )
      if (!okYear) {
        return {
          ok: false,
          reason: `按图计算增长量${wantMax ? '最大' : '最小'}应为 ${yearLabel}，答案却是 ${correct}`,
        }
      }
    }
  }

  // 增速回落/加快：数一数与折线一致（简单校验）
  if (/回落|加快/.test(stem) && /几个|多少个|哪一年/.test(stem)) {
    const lineVals = line.values
    let drop = 0
    let rise = 0
    for (let i = 1; i < lineVals.length; i++) {
      const d = lineVals[i]! - lineVals[i - 1]!
      if (d < -1e-9) drop += 1
      if (d > 1e-9) rise += 1
    }
    const correctNum = parseNumericToken(correct)
    if (correctNum != null && /回落/.test(stem) && /几个|多少/.test(stem)) {
      if (!nearlyEqual(correctNum, drop, 0.1)) {
        return { ok: false, reason: `图上增速回落 ${drop} 次，答案却是 ${correct}` }
      }
    }
    if (correctNum != null && /加快/.test(stem) && /几个|多少/.test(stem)) {
      if (!nearlyEqual(correctNum, rise, 0.1)) {
        return { ok: false, reason: `图上增速加快 ${rise} 次，答案却是 ${correct}` }
      }
    }
  }

  return { ok: true }
}

/**
 * 复杂题专用知识点（每轮轮换，强制读图计算）
 */
export type GrowthHardSkillId =
  | 'max-delta-year'
  | 'min-delta-year'
  | 'rate-drop-count'
  | 'base-from-chart-rate'
  | 'compare-delta'
  | 'masked-bar-restore'
  | 'dual-chart-share'
  | 'multi-step-delta'

export type GrowthHardSkillSlot = {
  id: GrowthHardSkillId
  label: string
  prompt: string
}

export const GROWTH_HARD_SKILL_SLOTS: GrowthHardSkillSlot[] = [
  {
    id: 'max-delta-year',
    label: '读柱求增长量最大年份',
    prompt:
      '仿照系统示例：chart 含 bar+line；设问增长量最大年份；explanation 用柱值相减，数字必须来自 chart，答案年份与计算一致。',
  },
  {
    id: 'min-delta-year',
    label: '读柱求增长量最小年份',
    prompt:
      '仿照系统示例：设问增长量最小年份；explanation 柱值相减，数字来自 chart，答案与计算一致。',
  },
  {
    id: 'rate-drop-count',
    label: '读折线数回落次数',
    prompt:
      '设问增速回落有几个；explanation 写出折线各年增速（必须等于 line.values）并点数，答案与图一致。',
  },
  {
    id: 'base-from-chart-rate',
    label: '读图用现期与增速还原基期',
    prompt:
      '设问根据某年柱值与折线增速求上一年；explanation 用 基期=现期/(1+r)，现期与 r 取自同一类目的柱与线。',
  },
  {
    id: 'compare-delta',
    label: '比较两年增长量之差',
    prompt:
      '设问 A 年增长量比 B 年多/少多少；explanation 先分别用柱值算两年增长量再相减，数字来自 chart。',
  },
  {
    id: 'masked-bar-restore',
    label: '遮罩柱值用增速还原',
    prompt:
      '图中某年柱顶为「?」；用上年柱值与当年折线增速还原该年现期；explanation 写 现期=基期×(1+r)。',
  },
  {
    id: 'dual-chart-share',
    label: '双图比重/差值比较',
    prompt:
      '同时给出 chart 与 secondaryChart；设问某类目下图2占图1比重，或两图增长量比较；数字必须分别来自两图。',
  },
  {
    id: 'multi-step-delta',
    label: '多步增长量变式',
    prompt:
      '先逐年算增长量，再求合计、倍数或「约为某年的几倍」；explanation 至少两步算式，数字来自 chart。',
  },
]

export function pickGrowthHardSkillPlan(count: number): GrowthHardSkillSlot[] {
  const pool = [...GROWTH_HARD_SKILL_SLOTS]
  shuffleInPlace(pool)
  if (count <= pool.length) return pool.slice(0, count)
  const out: GrowthHardSkillSlot[] = []
  while (out.length < count) {
    const wave = [...GROWTH_HARD_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function getGrowthGeneralQuestionFingerprint(input: {
  difficulty: GrowthGeneralDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  chartTitle?: string
}): string {
  return [
    'growth-general',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.chartTitle?.trim() ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

/** 一般增长选项：四项互异；数值/年份题不做「独最长」泄题误杀（如 17861.37亿元） */
export function isPlayableGrowthGeneralMcq(q: {
  stem: string
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n)) return false
  if (new Set(norms).size !== 4) return false
  // 含明确数字的选项：跳过字数泄题检测（资料分析常见）
  const mostlyNumeric = q.options.filter((o) => /\d/.test(o)).length >= 3
  if (mostlyNumeric) return true
  return isPlayableFourChoiceMcq(q)
}

const GROWTH_UNIT =
  '(?:万亿元|万千瓦|亿元|万人|万吨|亿平方米|千克|万公顷|个百分点|[%％])'

function isGrowthNoiseSpan(s: string): boolean {
  if (!s || s.length < 2) return true
  if (/[=＝≈]/.test(s)) return true
  if (/^(?:增速|涨幅|增长率|增长量|基期|现期|同比|环比)$/.test(s)) return true
  if (/^(?:增长|下降|增加|减少)\d+(?:\.\d+)?$/.test(s)) return true
  if (/^(?:八月份?|七月份?|前八个月|上半年|下半年|其中)$/.test(s)) return true
  // 「年某省…」缺年份前缀，主体对不上号
  if (/^年/.test(s)) return true
  return false
}

function isGrowthDataCore(s: string): boolean {
  return (
    new RegExp(`^\\d+(?:\\.\\d+)?${GROWTH_UNIT}$`).test(s) ||
    /^\d+(?:\.\d+)?$/.test(s) ||
    new RegExp(`^(?:同比|环比)?(?:增长|下降|增加|减少)\\d+(?:\\.\\d+)?${GROWTH_UNIT}$`).test(s)
  )
}

/** 直接圈数字：裸数字或「数字+单位」短核（不要整句「较上年增长…」） */
function isGrowthNumMark(s: string): boolean {
  return (
    /^\d+(?:\.\d+)?$/.test(s) || new RegExp(`^\\d+(?:\\.\\d+)?${GROWTH_UNIT}$`).test(s)
  )
}

function passageHasBareNumber(passage: string, num: string): boolean {
  if (!passage || !num) return false
  const escaped = escapeGrowthRegExp(num.replace(/^[-+]/, ''))
  if (!escaped) return false
  return new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`).test(passage)
}

function escapeGrowthRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 清洗主体：去掉误吸入的句首「年」 */
function cleanGrowthSubject(sub: string): string {
  let t = sub.trim()
  if (/^年/.test(t)) t = t.slice(1)
  return t
}

function extractGrowthSubjects(passage: string, stem: string, useful: string): string[] {
  const p = passage
  const hits: string[] = []
  const push = (raw: string) => {
    const t = cleanGrowthSubject(raw)
    if (t.length < 4 || !p.includes(t) || isGrowthNoiseSpan(t)) return
    if (!hits.includes(t)) hits.push(t)
  }

  const tails = ['装机容量', '财政收入', '增加值', '零售额', '货运量', '销售面积'] as const
  for (const tail of tails) {
    if (!stem.includes(tail) && !useful.includes(tail)) continue
    const re = new RegExp(`[\\u4e00-\\u9fff]{2,16}${tail}`, 'g')
    for (const m of p.matchAll(re)) {
      const sub = cleanGrowthSubject(m[0]!)
      if (sub.endsWith(tail) && !sub.startsWith('年')) push(sub)
    }
  }
  return hits
}

/** 材料中所有「数字+单位」，且该数字出现在解析中 */
function collectGrowthDataCores(passage: string, useful: string): string[] {
  const p = passage
  const out: string[] = []
  const push = (s: string) => {
    if (s && p.includes(s) && !out.includes(s)) out.push(s)
  }
  for (const m of p.matchAll(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`, 'g'))) {
    const phrase = m[0]!
    const num = phrase.match(/\d+(?:\.\d+)?/)?.[0]
    if (num && useful.includes(num)) push(phrase)
  }
  for (const m of p.matchAll(
    new RegExp(
      `(?:较上年(?:同期)?|比上年|同比|环比)?(?:增长|下降|增加|减少)了?\\d+(?:\\.\\d+)?${GROWTH_UNIT}`,
      'g',
    ),
  )) {
    const phrase = m[0]!
    const num = phrase.match(/\d+(?:\.\d+)?/)?.[0]
    if (num && useful.includes(num)) {
      push(phrase)
      const core = phrase.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
      if (core) push(core)
    }
  }
  return out
}

function growthSpanNum(s: string): string | null {
  return s.match(/\d+(?:\.\d+)?/)?.[0] ?? null
}

/** 是否真包含（禁止「4200亿元」与裸「200」互相误杀） */
function growthSpansTrulyOverlap(a: string, b: string): boolean {
  if (a === b) return true
  const bare = (x: string) => /^\d+(?:\.\d+)?$/.test(x)
  if (bare(a) || bare(b)) return false
  if (isGrowthDataCore(a) && isGrowthDataCore(b) && growthSpanNum(a) !== growthSpanNum(b)) {
    return false
  }
  if (a.includes(b) && b.length >= 4) return true
  if (b.includes(a) && a.length >= 4) return true
  return false
}

/**
 * 一般增长高亮：解析驱动；数据只圈裸数字 /「数字+单位」短核（直接对准数字）。
 */
export function normalizeGrowthEvidenceSpans(
  passage: string,
  spans: unknown,
  stem = '',
  explanation = '',
): string[] {
  const p = String(passage ?? '')
  if (!p) return []

  const useful = stripDataAnalysisDistractorClauses(explanation)
  const base = normalizeDataAnalysisEvidenceSpans(p, spans, stem, explanation)
  const candidates = new Set<string>()

  const push = (raw: string) => {
    const t = cleanGrowthSubject(raw.trim())
    if (!t || isGrowthNoiseSpan(t)) return
    if (/^\d+(?:\.\d+)?$/.test(t)) {
      if (!passageHasBareNumber(p, t)) return
      candidates.add(t)
      return
    }
    if (!p.includes(t)) return
    candidates.add(t)
  }

  /** 解题用到的数字 → 材料里圈裸数字 + 短单位核 */
  const markNumsFromUseful = () => {
    if (!useful) return
    for (const m of useful.matchAll(/[-+]?\d+(?:\.\d+)?/g)) {
      const n = (m[0] ?? '').replace(/^[-+]/, '')
      if (!n || !passageHasBareNumber(p, n)) continue
      push(n)
      const unitCore = p.match(
        new RegExp(`(?<![\\d.])${escapeGrowthRegExp(n)}${GROWTH_UNIT}`),
      )?.[0]
      if (unitCore) push(unitCore)
    }
  }

  markNumsFromUseful()

  for (const core of collectGrowthDataCores(p, useful)) {
    const num = growthSpanNum(core)
    if (num && passageHasBareNumber(p, num)) push(num)
    const short = core.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
    if (short) push(short)
    else if (isGrowthNumMark(core)) push(core)
  }

  for (const s of base) {
    if (isGrowthNoiseSpan(s) || /^年/.test(s)) {
      const nums = s.match(/\d+(?:\.\d+)?/g) ?? []
      for (const n of nums) {
        if (passageHasBareNumber(p, n)) push(n)
        const unitCore = p.match(
          new RegExp(`(?<![\\d.])${escapeGrowthRegExp(n)}${GROWTH_UNIT}`),
        )?.[0]
        if (unitCore) push(unitCore)
      }
      continue
    }
    if (!/\d/.test(s)) {
      push(s)
      continue
    }
    // 长叙述压成短核
    const core = s.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
    const num = growthSpanNum(s)
    if (core) push(core)
    if (num && passageHasBareNumber(p, num)) push(num)
  }

  if (useful) {
    for (const atom of extractDataAnalysisAtomicEvidence(useful, p)) {
      if (!/\d/.test(atom)) push(atom)
      else {
        const core = atom.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
        const num = growthSpanNum(atom)
        if (core) push(core)
        if (num && passageHasBareNumber(p, num)) push(num)
      }
    }
  }

  for (const sub of extractGrowthSubjects(p, stem, useful)) push(sub)

  const ranked = [...candidates].sort((a, b) => {
    const score = (s: string) => {
      let sc = 0
      if (isGrowthNumMark(s)) sc += 60 - Math.min(s.length, 12)
      else if (isGrowthDataCore(s)) sc += 20
      else if (!/\d/.test(s)) sc += 35
      else sc -= 30 // 长叙述数据降权
      if (isGrowthNoiseSpan(s) || /^年/.test(s)) sc -= 80
      return sc
    }
    return score(b) - score(a) || a.length - b.length
  })

  const out: string[] = []
  for (const s of ranked) {
    // 只要短数字核；长「较上年…增长xx」一律丢掉
    if (/\d/.test(s) && !isGrowthNumMark(s)) continue

    const conflictIdx = out.findIndex((x) => growthSpansTrulyOverlap(x, s))
    if (conflictIdx >= 0) {
      const prev = out[conflictIdx]!
      if (isGrowthNumMark(s) && isGrowthNumMark(prev)) {
        if (growthSpanNum(s) !== growthSpanNum(prev)) {
          if (!out.includes(s)) out.push(s)
        } else if (s.length <= prev.length) {
          out[conflictIdx] = s
        }
        continue
      }
      if (!/\d/.test(s) && !/\d/.test(prev)) {
        if (!s.startsWith('年') && (prev.startsWith('年') || s.length <= prev.length)) {
          out[conflictIdx] = s
        }
        continue
      }
      // 主体与数字不互相替换
      if (!out.includes(s)) out.push(s)
      continue
    }
    out.push(s)
    if (out.length >= 14) break
  }

  // 保证解析里用到的材料数字都有裸数字圈
  markNumsFromUseful()
  for (const n of [...candidates]) {
    if (/^\d+(?:\.\d+)?$/.test(n) && !out.includes(n) && passageHasBareNumber(p, n)) {
      out.push(n)
    }
  }

  out.sort((a, b) => {
    const idxOf = (x: string) => {
      if (/^\d/.test(x)) {
        const i = p.search(new RegExp(`(?<![\\d.])${escapeGrowthRegExp(x)}`))
        return i >= 0 ? i : p.indexOf(x)
      }
      return p.indexOf(x)
    }
    return idxOf(a) - idxOf(b)
  })
  return out
}

/**
 * 解析高亮：主体 + 裸数字 / 短单位核；算式三数全圈。不用长叙述下划线。
 */
export function resolveGrowthExplainHighlightSpans(
  explanation: string,
  _passage: string,
  _stem: string,
  evidenceSpans: string[],
): string[] {
  const useful = stripDataAnalysisDistractorClauses(explanation).replace(/[−–—]/g, '-')
  if (!useful) return []
  const out: string[] = []
  const push = (t: string) => {
    const s = t.trim()
    if (!s || out.includes(s)) return
    if (isGrowthNoiseSpan(s) || /[=＝]/.test(s)) return
    if (/^\d+(?:\.\d+)?$/.test(s)) {
      if (!new RegExp(`(?<![\\d.])${escapeGrowthRegExp(s)}(?![\\d.])`).test(useful)) return
      out.push(s)
      return
    }
    if (!useful.includes(s)) return
    // 解析里也只保留短核，避免「增长量200万千瓦」整段错位
    if (/\d/.test(s) && !isGrowthNumMark(s)) return
    out.push(s)
  }

  for (const s of evidenceSpans) {
    if (!/\d/.test(s)) {
      push(s)
      const tip = cleanGrowthSubject(s)
      if (tip !== s) push(tip)
      const noProv = tip.replace(/^某省|^我国|^全国/, '')
      if (noProv !== tip && noProv.length >= 4) push(noProv)
      continue
    }
    if (isGrowthNumMark(s)) push(s)
    const core = s.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
    if (core) push(core)
    const n = growthSpanNum(s)
    if (n) push(n)
  }

  // 算式 a-b=c 中的三个数都圈
  for (const m of useful.matchAll(
    /(\d+(?:\.\d+)?)(?:万亿元|万千瓦|亿元|万人)?\s*[-−–—]\s*(\d+(?:\.\d+)?)(?:万亿元|万千瓦|亿元|万人)?\s*=\s*(\d+(?:\.\d+)?)(?:万亿元|万千瓦|亿元|万人)?/g,
  )) {
    push(m[1]!)
    push(m[2]!)
    push(m[3]!)
  }

  return out
}

/** 题干高亮：与 evidenceSpans 对齐，补短主体 */
export function resolveGrowthStemHighlightSpans(
  stem: string,
  _passage: string,
  evidenceSpans: string[],
): string[] {
  const s = String(stem ?? '')
  const out: string[] = []
  const push = (t: string) => {
    const x = cleanGrowthSubject(t)
    if (!x || !s.includes(x) || out.includes(x) || isGrowthNoiseSpan(x)) return
    out.push(x)
  }
  for (const span of evidenceSpans) {
    if (s.includes(span)) push(span)
    const core = span.match(new RegExp(`\\d+(?:\\.\\d+)?${GROWTH_UNIT}`))?.[0]
    if (core && s.includes(core)) push(core)
    const cleaned = cleanGrowthSubject(span)
    if (cleaned !== span && s.includes(cleaned)) push(cleaned)
    if (!/\d/.test(span)) {
      const tip = cleanGrowthSubject(span)
      if (tip.length >= 4 && s.includes(tip)) push(tip)
      const noProv = tip.replace(/^某省|^我国|^全国/, '')
      if (noProv.length >= 4 && noProv !== tip && s.includes(noProv)) push(noProv)
      for (const tail of ['装机容量', '财政收入', '增加值', '零售额', '货运量', '销售面积']) {
        if (tip.endsWith(tail) && s.includes(tail)) push(tail)
      }
    }
  }
  return out
}

export function buildGrowthGeneralQuestionFromMcq(input: {
  difficulty: GrowthGeneralDifficulty
  term: string
  passage?: string
  chart?: unknown
  secondaryChart?: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): GrowthGeneralQuestion | null {
  let term = input.term.trim()
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  let distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!stem || !correct) return null
  if (!term) term = '一般增长'

  // 豆包常只给 1～2 个干扰项：按正确答案数值自动补齐
  distractors = coerceGrowthDistractors(correct, distractors)
  if (distractors.length !== 3) return null

  const chart =
    input.difficulty === 'hard'
      ? parseGrowthChartSpec(input.chart, { requireCombo: true })
      : null
  if (input.difficulty === 'hard' && !chart) return null
  if (input.difficulty === 'easy' && passage.length < 8) return null

  const secondaryChart =
    input.difficulty === 'hard'
      ? parseGrowthChartSpec(input.secondaryChart ?? null, { requireCombo: true })
      : null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按一般增长关系计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: input.difficulty === 'easy',
  })
  if (!math.ok) return null

  if (input.difficulty === 'hard' && chart) {
    const chartLogic = validateGrowthHardChartLogic({
      chart,
      stem,
      correct,
      explanation,
      secondaryChart,
    })
    if (!chartLogic.ok) return null
  }

  const highlightSource = [passage, chart?.title ?? '', secondaryChart?.title ?? '']
    .filter(Boolean)
    .join('\n')
  const evidenceSpans = normalizeGrowthEvidenceSpans(
    highlightSource || passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getGrowthGeneralQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
    chartTitle: [chart?.title, secondaryChart?.title].filter(Boolean).join('|'),
  })

  const q: GrowthGeneralQuestion = {
    id: `growth-general-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'growth-general',
    difficulty: input.difficulty,
    term,
    passage,
    chart,
    secondaryChart,
    stem,
    options,
    correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableGrowthGeneralMcq(q)) return null
  return q
}

/** 干扰项不足时，用正确答案附近数值自动补满 3 个 */
function coerceGrowthDistractors(correct: string, distractors: string[]): string[] {
  const c = correct.trim()
  const out: string[] = []
  const seen = new Set<string>()
  const norm = (s: string) => s.replace(/\s+/g, '')
  const push = (s: string) => {
    const t = s.trim()
    if (!t || norm(t) === norm(c) || seen.has(norm(t))) return
    seen.add(norm(t))
    out.push(t)
  }
  for (const d of distractors) push(d)
  if (out.length >= 3) return out.slice(0, 3)

  const m = c.match(/^([约大约]{0,2})([-+]?\d+(?:\.\d+)?)(.*)$/)
  if (m) {
    const prefix = m[1] ?? ''
    const num = Number(m[2])
    const unit = m[3] ?? ''
    if (Number.isFinite(num)) {
      const deltas =
        Math.abs(num) >= 100
          ? [Math.round(num * 0.9), Math.round(num * 1.1), Math.round(num + Math.max(10, num * 0.05)), Math.round(Math.max(0, num - Math.max(10, num * 0.08)))]
          : Math.abs(num) >= 10
            ? [num - 1, num + 1, num + 2, Math.max(0, num - 2), Math.round(num * 1.2)]
            : [num - 0.2, num + 0.2, num + 0.5, Math.max(0, num - 0.5), num * 2]
      for (const n of deltas) {
        if (out.length >= 3) break
        const formatted = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
        push(`${prefix}${formatted}${unit}`)
      }
    }
  }
  let i = 1
  while (out.length < 3 && i < 20) {
    push(`干扰项${i++}`)
  }
  return out.slice(0, 3)
}

export function parseGrowthGeneralMcqAiObject(item: unknown): {
  term: string
  passage: string
  chart: unknown
  secondaryChart: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: unknown
  method: string
} | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim() || '一般增长'
  const passage = String(o.passage ?? o.material ?? o.text ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  if (!stem) return null

  let picked = extractMcqCorrectAndDistractors(o)
  // 豆包常返回 options 不足 4 / distractors 不足 3
  if (!picked) {
    const correctRaw = String(o.correct ?? o.answer ?? '').trim()
    const distractorsRaw = Array.isArray(o.distractors)
      ? o.distractors.map((x) => String(x).trim()).filter(Boolean)
      : Array.isArray(o.options)
        ? o.options.map((x) => String(x).trim()).filter((x) => x && x !== correctRaw)
        : []
    if (correctRaw) {
      const ds = coerceGrowthDistractors(correctRaw, distractorsRaw)
      if (ds.length === 3) picked = { correct: correctRaw, distractors: ds }
    }
  }
  if (!picked) return null

  const explanation = String(o.explanation ?? o.解读 ?? o.解析 ?? '').trim()
  const method = String(o.method ?? o.做法 ?? o.解法 ?? '').trim()
  const evidenceSpans = o.evidenceSpans ?? o.evidence ?? o.focusSpans ?? o.材料依据 ?? []
  const chart = o.chart ?? o.chartSpec ?? o.figure ?? o.图 ?? null
  const secondaryChart =
    o.secondaryChart ?? o.chart2 ?? o.secondChart ?? o.图2 ?? o.副图 ?? null
  return {
    term,
    passage,
    chart,
    secondaryChart,
    stem,
    correct: picked.correct,
    distractors: coerceGrowthDistractors(picked.correct, picked.distractors),
    explanation,
    evidenceSpans,
    method,
  }
}

/** 诊断豆包 JSON 为何没建成题（便于进度条提示） */
export function diagnoseGrowthGeneralBuildReject(
  item: unknown,
  difficulty: GrowthGeneralDifficulty,
): string {
  if (!item || typeof item !== 'object') return '返回非 JSON 对象'
  const o = item as Record<string, unknown>
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return '选项/正确答案字段无效'
  const explanation = String(o.explanation ?? o.解读 ?? o.解析 ?? '').trim()
  if (!explanation) return '缺少 explanation'
  const stem = String(o.stem ?? o.question ?? '').trim()
  if (!stem) return '缺少 stem'
  if (difficulty === 'hard') {
    const chart = parseGrowthChartSpec(o.chart ?? o.chartSpec ?? o.figure ?? o.图 ?? null, {
      requireCombo: true,
    })
    if (!chart) return '复杂题缺有效柱+折线 chart'
    const explanation = String(o.explanation ?? o.解读 ?? o.解析 ?? '').trim()
    const stem = String(o.stem ?? o.question ?? '').trim()
    const picked = extractMcqCorrectAndDistractors(o)
    if (picked && explanation) {
      const secondaryChart = parseGrowthChartSpec(
        o.secondaryChart ?? o.chart2 ?? o.secondChart ?? o.图2 ?? null,
        { requireCombo: true },
      )
      const chartLogic = validateGrowthHardChartLogic({
        chart,
        stem,
        correct: picked.correct,
        explanation,
        secondaryChart,
      })
      if (!chartLogic.ok) return chartLogic.reason ?? '图-题不一致'
    }
  }
  const built = buildGrowthGeneralQuestionFromMcq({
    term: String(o.term ?? o.topic ?? o.keyword ?? '增长').trim() || '增长',
    passage: String(o.passage ?? o.material ?? o.text ?? '').trim(),
    chart: o.chart ?? o.chartSpec ?? o.figure ?? o.图 ?? null,
    secondaryChart: o.secondaryChart ?? o.chart2 ?? o.secondChart ?? o.图2 ?? null,
    stem,
    correct: picked.correct,
    distractors: picked.distractors,
    explanation,
    evidenceSpans: o.evidenceSpans ?? o.evidence ?? [],
    method: String(o.method ?? '').trim(),
    difficulty,
    seq: 0,
  })
  if (!built) return '校验未通过（选项重复或不可作答）'
  return '未知原因'
}

/** 本地保底简单题（豆包拒收/超时/校验失败时凑满 5 题）；尽量覆盖各知识点 */
const GROWTH_EASY_LOCAL_SEEDS: Array<{
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId: GrowthEasySkillId
}> = [
  {
    skillId: 'base-from-current-delta',
    term: '国内财政收入',
    passage: '2019年6月，国内财政收入17920亿元，环比增加80亿元。',
    stem: '2019年5月国内财政收入是多少亿元？',
    correct: '17840亿元',
    distractors: ['18000亿元', '17800亿元', '80亿元'],
    explanation: '现期17920亿元，增长量80亿元，基期=现期-增长量=17920-80=17840亿元。',
    evidenceSpans: ['国内财政收入', '17920', '80'],
    method: '现期减增长量求基期',
  },
  {
    skillId: 'current-from-base-delta',
    term: '第一产业增加值',
    passage: '2020年第一产业增加值77750亿元。2021年比上年增加5250亿元。',
    stem: '2021年第一产业增加值是多少亿元？',
    correct: '83000亿元',
    distractors: ['72500亿元', '77750亿元', '5250亿元'],
    explanation: '基期77750亿元，增长量5250亿元，现期=基期+增长量=77750+5250=83000亿元。',
    evidenceSpans: ['第一产业增加值', '77750', '5250'],
    method: '基期加增长量求现期',
  },
  {
    skillId: 'delta-from-current-base',
    term: '货运量',
    passage: '2022年货运量2.0亿吨，2021年货运量1.8亿吨。',
    stem: '2022年货运量比上年增长多少亿吨？',
    correct: '0.2亿吨',
    distractors: ['0.1亿吨', '3.8亿吨', '1.8亿吨'],
    explanation: '增长量=现期-基期=2.0-1.8=0.2亿吨。',
    evidenceSpans: ['2.0', '1.8'],
    method: '现期减基期求增长量',
  },
  {
    skillId: 'rate-from-delta-base',
    term: '棉花单产',
    passage: '2018年棉花亩产120千克，比上年增加3千克。',
    stem: '2018年棉花亩产同比增长率约为多少？',
    correct: '2.6%',
    distractors: ['2.5%', '3.0%', '2.8%'],
    explanation: '增长量3，基期=120-3=117，增长率=3/117≈2.6%。',
    evidenceSpans: ['120', '3'],
    method: '增长量除以基期',
  },
  {
    skillId: 'base-from-current-rate',
    term: '社会消费品零售',
    passage: '某市8月社会消费品零售额500亿元，同比增长10%。',
    stem: '该市上年同月社会消费品零售额约为多少亿元？',
    correct: '约455亿元',
    distractors: ['约450亿元', '约550亿元', '约490亿元'],
    explanation: '现期500，增长率10%，基期=现期/(1+增长率)=500/1.1≈454.5，约455亿元。',
    evidenceSpans: ['社会消费品零售额', '500', '10'],
    method: '现期除以(1+r)求基期',
  },
  {
    skillId: 'current-from-base-rate',
    term: '互联网业务收入',
    passage: '2017年全国互联网业务收入7902亿元，2018年同比增长21%。',
    stem: '2018年全国互联网业务收入约为多少亿元？',
    correct: '约9561亿元',
    distractors: ['约7902亿元', '约1659亿元', '约10000亿元'],
    explanation: '基期7902，增长率21%，现期=基期×(1+增长率)=7902×1.21≈9561亿元。',
    evidenceSpans: ['7902', '21'],
    method: '基期×(1+r)求现期',
  },
  {
    skillId: 'delta-from-current-rate',
    term: '固定资产投资',
    passage: '某省全年固定资产投资完成额1200亿元，同比增长20%。',
    stem: '该省全年固定资产投资同比增长量是多少亿元？',
    correct: '200亿元',
    distractors: ['240亿元', '1000亿元', '20亿元'],
    explanation: '增长量=现期×增长率/(1+增长率)=1200×0.2/1.2=200亿元。',
    evidenceSpans: ['1200', '20'],
    method: '现期×r/(1+r)求增长量',
  },
  {
    skillId: 'rate-restore-pp',
    term: '风力发电增速',
    passage: '12月风力发电同比增长25%，比上月加快1个百分点。',
    stem: '11月风力发电同比增速是多少？',
    correct: '24%',
    distractors: ['26%', '25%', '1%'],
    explanation: '12月增速25%，比上月加快1个百分点，则11月=25%-1%=24%。',
    evidenceSpans: ['25', '1'],
    method: '现期增速减百分点还原',
  },
  {
    skillId: 'yoy-vs-mom',
    term: '商品房销售面积',
    passage: '2021年6月商品房销售面积1.8亿平方米，同比增长0.2亿平方米，环比减少0.1亿平方米。',
    stem: '2021年5月商品房销售面积是多少亿平方米？（求环比基期）',
    correct: '1.9亿平方米',
    distractors: ['1.6亿平方米', '1.8亿平方米', '2.0亿平方米'],
    explanation: '求环比基期：现期1.8亿平方米，环比减少0.1亿平方米，则上月=1.8+0.1=1.9亿平方米。',
    evidenceSpans: ['1.8', '0.1'],
    method: '环比基期：现期加减少量',
  },
]

/** 用本地种子凑满简单题；优先补齐尚未覆盖的知识点 */
export function takeGrowthEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds?: GrowthEasySkillId[],
): GrowthGeneralQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds ?? [])
  const pool = [...GROWTH_EASY_LOCAL_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => {
    const ap = prefer.has(a.skillId) ? 0 : 1
    const bp = prefer.has(b.skillId) ? 0 : 1
    return ap - bp
  })
  const out: GrowthGeneralQuestion[] = []
  const usedSkills = new Set<GrowthEasySkillId>()
  let seq = seqStart

  const tryPush = (seed: (typeof GROWTH_EASY_LOCAL_SEEDS)[number], allowDupSkill: boolean) => {
    if (out.length >= need) return
    if (!allowDupSkill && usedSkills.has(seed.skillId)) return
    const { skillId, ...seedFields } = seed
    const q = buildGrowthGeneralQuestionFromMcq({
      ...seedFields,
      difficulty: 'easy',
      seq: seq++,
    })
    if (!q || avoidFingerprints.has(q.fingerprint)) return
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
    usedSkills.add(skillId)
    prefer.delete(skillId)
  }

  for (const seed of pool) tryPush(seed, false)
  if (out.length < need) {
    for (const seed of pool) tryPush(seed, true)
  }
  // 仍不足：改 stem 强制放出，保证开练不断档
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const { skillId, ...seedFields } = seed
      const q = buildGrowthGeneralQuestionFromMcq({
        ...seedFields,
        stem: `${seed.stem}（备${seq}）`,
        difficulty: 'easy',
        seq: seq++,
      })
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
      usedSkills.add(skillId)
    }
  }
  return out
}

/** 复杂题本地保底（含柱+折线）；也作为豆包「锚定出题」的图库 */
export type GrowthHardSeedTemplate = {
  term: string
  passage: string
  chart: GrowthChartSpec
  /** 双图变式 */
  secondaryChart?: GrowthChartSpec | null
  /** variant=加难/双图；默认 hard */
  difficultyTier?: 'hard' | 'variant'
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: GrowthHardSkillId
}

const GROWTH_HARD_LOCAL_SEEDS: GrowthHardSeedTemplate[] = [
  {
    skillId: 'multi-step-delta',
    difficultyTier: 'variant',
    term: '互联网增长量合计变式',
    passage: '根据下图，先逐年算增长量，再汇总比较。',
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
    stem: '2014—2018年，全国互联网业务收入增长量合计约为多少亿元？',
    correct: '6245亿元',
    distractors: ['5333亿元', '7045亿元', '1660亿元'],
    explanation:
      '2014年增长量=4229-3317=912；2015年=5444-4229=1215；2016年=6651-5444=1207；2017年=7902-6651=1251；2018年=9562-7902=1660。912+1215=2127；2127+1207=3334；3334+1251=4585；4585+1660=6245。答案为6245亿元。',
    evidenceSpans: ['业务收入'],
    method: '逐年求增长量再求和',
  },
  {
    skillId: 'multi-step-delta',
    difficultyTier: 'variant',
    term: '增长量与均值差额',
    passage: '先算各年增长量，再与前几年均值比较。',
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
    stem: '2018年互联网业务收入增长量比2014—2017年增长量的平均值大约多多少亿元？',
    correct: '514亿元',
    distractors: ['445亿元', '605亿元', '1660亿元'],
    explanation:
      '2014增长量=4229-3317=912；2015:5444-4229=1215；2016:6651-5444=1207；2017:7902-6651=1251；平均=(912+1215+1207+1251)/4=1146.25；2018增长量=9562-7902=1660；差=1660-1146.25=513.75≈514亿元。',
    evidenceSpans: ['9562', '7902'],
    method: '增长量减前四年均值',
  },
  {
    skillId: 'compare-delta',
    difficultyTier: 'variant',
    term: '回落年增长量合计',
    passage: '先判断增速回落年份，再汇总这些年的增长量。',
    chart: {
      title: '2014—2018年某市工业增加值及增速',
      categories: ['2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        { name: '增加值', type: 'bar', values: [500, 560, 620, 680, 750], unit: '亿元' },
        { name: '增速', type: 'line', values: [12, 10, 8, 9, 11], unit: '%' },
      ],
    },
    stem: '2015—2018年增速较上年回落的年份中，工业增加值增长量合计为多少亿元？',
    correct: '120亿元',
    distractors: ['60亿元', '190亿元', '250亿元'],
    explanation:
      '折线：2015、2016两年回落。增长量：2015:560-500=60；2016:620-560=60。合计60+60=120亿元。',
    evidenceSpans: ['增速', '增加值'],
    method: '先定点回落年再求和增长量',
  },
  {
    skillId: 'base-from-chart-rate',
    difficultyTier: 'variant',
    term: '还原基期再作差',
    passage: '用现期与增速还原基期，再与图中更早年份柱值比较。',
    chart: {
      title: '2015—2018年快递业务收入及增速',
      categories: ['2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        { name: '收入', type: 'bar', values: [3200, 4000, 4800, 5760], unit: '亿元' },
        { name: '增速', type: 'line', values: [28, 25, 20, 20], unit: '%' },
      ],
    },
    stem: '按2018年柱值与增速还原的2017年收入，比图中2016年收入多多少亿元？',
    correct: '800亿元',
    distractors: ['480亿元', '960亿元', '1760亿元'],
    explanation: '2017年=5760/1.2=4800；比2016年多4800-4000=800亿元。',
    evidenceSpans: ['5760', '20', '4000'],
    method: '现期/(1+r)后再作差',
  },
  {
    skillId: 'multi-step-delta',
    difficultyTier: 'variant',
    term: '增长量与增速交叉比较',
    passage: '结合柱值增长量与折线增速综合判断。',
    chart: {
      title: '2015—2019年某省光伏装机容量',
      categories: ['2015', '2016', '2017', '2018', '2019'],
      leftUnit: '万千瓦',
      rightUnit: '%',
      series: [
        { name: '装机', type: 'bar', values: [100, 130, 175, 190, 240], unit: '万千瓦' },
        { name: '增速', type: 'line', values: [30, 30, 34.6, 8.6, 26.3], unit: '%' },
      ],
    },
    stem: '2016—2019年装机增长量最小年份的增速，比增长量最大年份的增速低多少个百分点？',
    correct: '17.7个百分点',
    distractors: ['8.6个百分点', '26.3个百分点', '15个百分点'],
    explanation:
      '增长量：2016:30；2017:45；2018:15；2019:50。最小2018年增速8.6%，最大2019年增速26.3%，差=26.3-8.6=17.7个百分点。',
    evidenceSpans: ['8.6', '26.3'],
    method: '先定最大/最小增长量年份再比增速',
  },
  {
    skillId: 'compare-delta',
    difficultyTier: 'variant',
    term: '两年增长量倍数',
    passage: '分别计算两年增长量后再求倍数。',
    chart: {
      title: '2015—2018年软件业务收入及增速',
      categories: ['2015', '2016', '2017', '2018'],
      leftUnit: '亿元',
      rightUnit: '%',
      series: [
        { name: '收入', type: 'bar', values: [1000, 1200, 1500, 1950], unit: '亿元' },
        { name: '增速', type: 'line', values: [18, 20, 25, 30], unit: '%' },
      ],
    },
    stem: '2018年软件业务收入增长量约为2016年增长量的多少倍？',
    correct: '2.3倍',
    distractors: ['1.5倍', '2.0倍', '2.8倍'],
    explanation:
      '2016年增长量=1200-1000=200；2018年增长量=1950-1500=450；450÷200=2.25，约为2.3倍。',
    evidenceSpans: ['收入'],
    method: '两年增长量相除',
  },
  {
    skillId: 'multi-step-delta',
    difficultyTier: 'variant',
    term: '加快年份增长量合计',
    passage: '先找增速加快的年份，再汇总对应增长量。',
    chart: {
      title: '2014—2018年货运量及增速',
      categories: ['2014', '2015', '2016', '2017', '2018'],
      leftUnit: '亿吨',
      rightUnit: '%',
      series: [
        { name: '货运量', type: 'bar', values: [40, 42, 45, 48, 52], unit: '亿吨' },
        { name: '增速', type: 'line', values: [8, 5, 7.1, 6.7, 8.3], unit: '%' },
      ],
    },
    stem: '2015—2018年货运量同比增速较上年加快的年份中，货运量增长量合计为多少亿吨？',
    correct: '7亿吨',
    distractors: ['3亿吨', '4亿吨', '10亿吨'],
    explanation:
      '折线加快年份为2016、2018。增长量：2016:45-42=3；2018:52-48=4。合计3+4=7亿吨。',
    evidenceSpans: ['增速', '货运量'],
    method: '定点加快年再求增长量合计',
  },
  {
    skillId: 'masked-bar-restore',
    difficultyTier: 'variant',
    term: '软件收入遮罩还原',
    passage: '根据下列资料完成问题。图中2019年收入以「?」标出。',
    chart: {
      title: '2015—2020年中国软件业务收入及同比增速',
      categories: ['2015', '2016', '2017', '2018', '2019', '2020'],
      leftUnit: '亿元',
      rightUnit: '%',
      barDisplay: [42848, 48232, 55103, 61909, '?', 81616],
      series: [
        {
          name: '收入',
          type: 'bar',
          values: [42848, 48232, 55103, 61909, 72062, 81616],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [15.7, 12.6, 14.2, 12.4, 16.4, 13.2],
          unit: '%',
        },
      ],
    },
    stem: '2019年中国软件业务收入约为多少亿元？',
    correct: '72062亿元',
    distractors: ['61909亿元', '81616亿元', '70000亿元'],
    explanation:
      '现期=基期×(1+r)=61909×1.164=72062。答案为72062亿元。',
    evidenceSpans: ['61909', '16.4'],
    method: '基期×(1+r)还原遮罩现期',
  },
  {
    skillId: 'masked-bar-restore',
    difficultyTier: 'variant',
    term: '遮罩年增长量推算',
    passage: '先还原「?」柱值，再求该年增长量。',
    chart: {
      title: '2015—2020年中国软件业务收入及同比增速',
      categories: ['2015', '2016', '2017', '2018', '2019', '2020'],
      leftUnit: '亿元',
      rightUnit: '%',
      barDisplay: [42848, 48232, 55103, 61909, '?', 81616],
      series: [
        {
          name: '收入',
          type: 'bar',
          values: [42848, 48232, 55103, 61909, 72062, 81616],
          unit: '亿元',
        },
        {
          name: '增速',
          type: 'line',
          values: [15.7, 12.6, 14.2, 12.4, 16.4, 13.2],
          unit: '%',
        },
      ],
    },
    stem: '2019年软件业务收入增长量比2018年大约多多少亿元？',
    correct: '3347亿元',
    distractors: ['1970亿元', '4553亿元', '10153亿元'],
    explanation:
      '2019年收入=61909×1.164=72062；2019增长量=72062-61909=10153；2018增长量=61909-55103=6806；差=10153-6806=3347亿元。',
    evidenceSpans: ['61909', '16.4', '55103'],
    method: '还原后两年增长量作差',
  },
  {
    skillId: 'dual-chart-share',
    difficultyTier: 'variant',
    term: '双图出口额比重',
    passage: '图1为全国累计出口额，图2为国有企业累计出口额。结合两图作答。',
    chart: {
      title: '图1 2021年S国对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.8, 35.2, 68.5, 98.4, 121.8],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-78.5, -10.2, 45.3, 88.6, 115.2],
          unit: '%',
        },
      ],
    },
    secondaryChart: {
      title: '图2 2021年S国国有企业对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.3, 24.1, 48.6, 70.2, 86.5],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-75.8, -8.5, 38.2, 72.1, 91.1],
          unit: '%',
        },
      ],
    },
    stem: '2021年12月，国有企业累计出口额约占全国累计出口额的比重为？',
    correct: '71%',
    distractors: ['65%', '75%', '80%'],
    explanation: '图2的86.5÷图1的121.8≈0.71，即约71%。',
    evidenceSpans: ['86.5', '121.8'],
    method: '双图柱值求比重',
  },
  {
    skillId: 'dual-chart-share',
    difficultyTier: 'variant',
    term: '双图增长量差额',
    passage: '结合图1与图2，比较累计出口额的增量。',
    chart: {
      title: '图1 2021年S国对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.8, 35.2, 68.5, 98.4, 121.8],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-78.5, -10.2, 45.3, 88.6, 115.2],
          unit: '%',
        },
      ],
    },
    secondaryChart: {
      title: '图2 2021年S国国有企业对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.3, 24.1, 48.6, 70.2, 86.5],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-75.8, -8.5, 38.2, 72.1, 91.1],
          unit: '%',
        },
      ],
    },
    stem: '2021年10—12月，全国累计出口额增量比国有企业累计出口额增量大约多少千万美元？',
    correct: '7.1',
    distractors: ['5.2', '9.3', '23.4'],
    explanation:
      '图1增量=121.8-98.4=23.4；图2增量=86.5-70.2=16.3；差=23.4-16.3=7.1千万美元。',
    evidenceSpans: ['121.8', '98.4', '86.5', '70.2'],
    method: '双图各自求增量再作差',
  },
  {
    skillId: 'dual-chart-share',
    difficultyTier: 'variant',
    term: '双图比重变化',
    passage: '结合两图比较不同时点国有企业占比变化。',
    chart: {
      title: '图1 2021年S国对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.8, 35.2, 68.5, 98.4, 121.8],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-78.5, -10.2, 45.3, 88.6, 115.2],
          unit: '%',
        },
      ],
    },
    secondaryChart: {
      title: '图2 2021年S国国有企业对外捐赠与无偿援助物资累计出口额及增速',
      categories: ['1月', '4月', '7月', '10月', '12月'],
      leftUnit: '千万美元',
      rightUnit: '%',
      series: [
        {
          name: '累计出口额',
          type: 'bar',
          values: [2.3, 24.1, 48.6, 70.2, 86.5],
          unit: '千万美元',
        },
        {
          name: '累计增速',
          type: 'line',
          values: [-75.8, -8.5, 38.2, 72.1, 91.1],
          unit: '%',
        },
      ],
    },
    stem: '与1月相比，12月国有企业累计出口额占全国的比重大约下降了多少个百分点？',
    correct: '11个百分点',
    distractors: ['5个百分点', '8个百分点', '15个百分点'],
    explanation:
      '1月比重用2.3与2.8约为82%，12月用86.5与121.8约为71%。82-71=11。答案为11个百分点。',
    evidenceSpans: ['2.3', '2.8', '86.5', '121.8'],
    method: '两时点比重作差',
  },
]

/** 打乱后取复杂题图库；全部为多步/双图难度，供豆包锚定与保底共用 */
export function pickGrowthHardSeedTemplates(count: number): GrowthHardSeedTemplate[] {
  const pool = [...GROWTH_HARD_LOCAL_SEEDS]
  shuffleInPlace(pool)
  if (count <= pool.length) return pool.slice(0, count)
  const out: GrowthHardSeedTemplate[] = []
  while (out.length < count) {
    const wave = [...GROWTH_HARD_LOCAL_SEEDS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

/** 豆包失败时：优先换另一道未用过的加难/双图保底，避免同图简单设问 */
export function pickGrowthHardFallbackSeed(
  failed: GrowthHardSeedTemplate,
  usedTerms: Set<string>,
): GrowthHardSeedTemplate {
  const pool = GROWTH_HARD_LOCAL_SEEDS.filter((s) => {
    if (s.term === failed.term && s.stem === failed.stem) return false
    const key = s.term.trim()
    if (key && usedTerms.has(key)) return false
    return true
  })
  if (pool.length === 0) {
    const others = GROWTH_HARD_LOCAL_SEEDS.filter((s) => s.stem !== failed.stem)
    if (others.length === 0) return failed
    return others[Math.floor(Math.random() * others.length)]!
  }
  // 优先双图
  const duals = pool.filter((s) => s.secondaryChart)
  const prefer = duals.length > 0 && Math.random() < 0.45 ? duals : pool
  return prefer[Math.floor(Math.random() * prefer.length)]!
}

export function buildGrowthHardFromSeedTemplate(
  seed: GrowthHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): GrowthGeneralQuestion | null {
  const { skillId: _skillId, difficultyTier: _tier, ...fields } = seed
  return buildGrowthGeneralQuestionFromMcq({
    ...fields,
    secondaryChart: seed.secondaryChart ?? null,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeGrowthHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): GrowthGeneralQuestion[] {
  if (need <= 0) return []
  const pool = [...GROWTH_HARD_LOCAL_SEEDS]
  shuffleInPlace(pool)
  const out: GrowthGeneralQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildGrowthHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildGrowthHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderGrowthPassageHtml }
