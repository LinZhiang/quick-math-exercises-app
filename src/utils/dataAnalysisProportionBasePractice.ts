/**
 * 资料分析 · 比重——基期比重
 * 考点：(A−a)/(B−b)；A/B×(1+qB)/(1+qA)；比重增长量=A/B×(qA−qB)/(1+qA)；
 * qA>qB 则现期比重上升。简单纯文字；复杂有表格，难度≥教材。
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

export type ProportionBaseDifficulty = DataAnalysisDifficulty

export const PROPORTION_BASE_QUESTION_COUNT = 5

export const PROPORTION_BASE_MODES: {
  id: ProportionBaseDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '比重·基期比重 · 简单',
    desc: '每轮 5 题 · 纯文字 · 基期比重/升降判断 · 数字相对简明 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '比重·基期比重 · 复杂',
    desc: '每轮 5 题 · 数据表 · 基期比重与比重增长量 · 对齐真题或更难 · 仅豆包 · 正计时停表看答案',
  },
]

export type ProportionBaseTableSpec = GrowthAvgAnnualTableSpec

export type ProportionBaseQuestion = {
  id: string
  topic: 'proportion-base'
  difficulty: ProportionBaseDifficulty
  term: string
  passage: string
  table: ProportionBaseTableSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function proportionBaseTopicLabel(): string {
  return '比重·基期比重'
}

export function proportionBaseDifficultyLabel(d: ProportionBaseDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type ProportionBaseEasySkillId =
  | 'base-by-delta'
  | 'base-by-rate'
  | 'prop-change-dir'
  | 'prop-change-amount'
  | 'base-compare'

export type ProportionBaseEasySkillSlot = {
  id: ProportionBaseEasySkillId
  label: string
  prompt: string
}

export const PROPORTION_BASE_EASY_SKILL_SLOTS: ProportionBaseEasySkillSlot[] = [
  {
    id: 'base-by-delta',
    label: '增长量求基期比重',
    prompt: '已知现期部分A、整体B及增长量a、b，基期比重=(A−a)/(B−b)。仿农产品进出口例。',
  },
  {
    id: 'base-by-rate',
    label: '增速求基期比重',
    prompt: '基期比重=A/B×(1+qB)/(1+qA)；数字取易估算。',
  },
  {
    id: 'prop-change-dir',
    label: '比重升降判断',
    prompt: '只比较 qA 与 qB：qA>qB 上升，qA<qB 下降。',
  },
  {
    id: 'prop-change-amount',
    label: '比重增长量估算',
    prompt: 'Δ=A/B×(qA−qB)/(1+qA)（百分点）；可先判升降再估大小。',
  },
  {
    id: 'base-compare',
    label: '基期与现期比重比较',
    prompt: '求基期比重并与现期 A/B 比较大小或差值。',
  },
]

export function pickProportionBaseEasySkillPlan(
  count: number,
): ProportionBaseEasySkillSlot[] {
  const out: ProportionBaseEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...PROPORTION_BASE_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectProportionBaseEasySkillId(q: {
  stem: string
  explanation: string
}): ProportionBaseEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/增长量|−a|减去/.test(s) && /基期比重/.test(s)) return 'base-by-delta'
  if (/1\+q|基期比重/.test(s) && /增速|同比/.test(s)) return 'base-by-rate'
  if (/百分点|增长量/.test(s) && /比重/.test(s)) return 'prop-change-amount'
  if (/上升|下降|提高|降低/.test(s) && /比重/.test(s)) return 'prop-change-dir'
  return 'base-compare'
}

export type ProportionBaseHardSkillId =
  | 'table-prop-change'
  | 'table-base-prop'
  | 'table-dir-then-size'
  | 'table-multi-row'
  | 'table-compare-rows'

export const PROPORTION_BASE_HARD_SKILL_SLOTS: {
  id: ProportionBaseHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'table-prop-change',
    label: '读表比重增长量',
    prompt:
      '从表取部分与整体现期值及增速，先比 qA、qB 判升降，再估 Δ≈A/B×(qA−qB)/(1+qA)。仿亏损企业收入占比题，选项含升降方向干扰。',
  },
  {
    id: 'table-base-prop',
    label: '读表求基期比重',
    prompt: '用 A/B×(1+qB)/(1+qA) 或增长量式；数字需估算。',
  },
  {
    id: 'table-dir-then-size',
    label: '先判方向再定量',
    prompt: '选项同时含升/降与大约/小约；必须两步。',
  },
  {
    id: 'table-multi-row',
    label: '多行指标综合',
    prompt: '表含多类企业，需定位正确行再算比重变化。',
  },
  {
    id: 'table-compare-rows',
    label: '两类主体比重变化比较',
    prompt: '比较两行主体现期比重相对上年的升降或幅度谁更大。',
  },
]

export function getProportionBaseFingerprint(input: {
  difficulty: ProportionBaseDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  tableTitle?: string
}): string {
  return [
    'proportion-base',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.tableTitle ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableProportionBaseMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (q.options.filter((o) => /\d/.test(o)).length >= 2) return true
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
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildProportionBaseQuestionFromMcq(input: {
  difficulty: ProportionBaseDifficulty
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
}): ProportionBaseQuestion | null {
  const term = input.term.trim() || '基期比重'
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
    explanation = `按基期比重公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: true,
  })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    [passage, table?.title ?? ''].filter(Boolean).join('\n') || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getProportionBaseFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    tableTitle: table?.title,
  })

  const q: ProportionBaseQuestion = {
    id: `proportion-base-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'proportion-base',
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
  if (!isPlayableProportionBaseMcq(q)) return null
  return q
}

export function parseProportionBaseMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '基期比重',
    passage: String(o.passage ?? '').trim(),
    table: o.table ?? o.tableSpec ?? null,
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const PROPORTION_BASE_EASY_SEEDS: Array<{
  skillId: ProportionBaseEasySkillId
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
    skillId: 'base-by-delta',
    term: '增长量求基期进口占比',
    passage:
      '2019年1—10月，农产品进出口总额1854.1亿美元，比上年同期增加41.69亿美元；其中进口1221.0亿美元，增加55.9亿美元。',
    stem: '2018年1—10月进口额占农产品进出口总额的比重约为？',
    correct: '64.3%',
    distractors: ['62%', '66%', '60%'],
    explanation:
      '基期比重=(1221.0-55.9)/(1854.1-41.69)=1165.1/1812.41≈0.643。答案为64.3%。',
    evidenceSpans: ['1221.0', '55.9', '1854.1', '41.69'],
    method: '(A−a)/(B−b)',
  },
  {
    skillId: 'base-by-rate',
    term: '增速求基期比重',
    passage:
      '某市高技术产业产值200亿元，同比增长25%；全市工业产值1000亿元，同比增长10%。',
    stem: '上年高技术产业产值占全市工业产值的比重约为？',
    correct: '17.6%',
    distractors: ['20%', '16%', '22%'],
    explanation:
      '现期比重=20%。基期比重=20%×(1+10%)/(1+25%)=20%×1.1/1.25=20%×0.88=17.6%。答案为17.6%。',
    evidenceSpans: ['200', '25%', '1000', '10%'],
    method: 'A/B×(1+qB)/(1+qA)',
  },
  {
    skillId: 'prop-change-dir',
    term: '比重升降判断',
    passage: '某省民营工业增加值同比增长12%，全省工业增加值同比增长8%。',
    stem: '与上年相比，民营工业增加值占全省工业增加值的比重：',
    correct: '上升',
    distractors: ['下降', '不变', '无法判断'],
    explanation: 'qA=12%>qB=8%，现期比重上升。答案为上升。',
    evidenceSpans: ['12%', '8%'],
    method: 'qA>qB则上升',
  },
  {
    skillId: 'prop-change-amount',
    term: '比重增长量简算',
    passage:
      '某类产品销售额占行业销售额的20%，该类产品销售额同比+30%，行业销售额同比+10%。',
    stem: '该类产品销售额占比约比上年提高多少个百分点？',
    correct: '约3个百分点',
    distractors: ['约5个百分点', '约1个百分点', '约8个百分点'],
    explanation:
      'Δ=20%×(30%-10%)/(1+30%)=20%×20%/1.3≈20%×0.154≈3.1个百分点。答案为约3个百分点。',
    evidenceSpans: ['20%', '30%', '10%'],
    method: 'A/B×(qA−qB)/(1+qA)',
  },
  {
    skillId: 'base-compare',
    term: '基期现期比重比较',
    passage:
      '出口额中机电产品占30%，机电同比增长20%，出口总额同比增长5%。',
    stem: '上年机电产品出口占比约比今年：',
    correct: '低约4个百分点',
    distractors: ['高约4个百分点', '低约2个百分点', '高约2个百分点'],
    explanation:
      '基期比重=30%×1.05/1.20=30%×0.875=26.25%；今年30%，基期低约3.75≈4个百分点。答案为低约4个百分点。',
    evidenceSpans: ['30%', '20%', '5%'],
    method: '先算基期再与现期作差',
  },
]

export function takeProportionBaseEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: ProportionBaseEasySkillId[] = [],
): ProportionBaseQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...PROPORTION_BASE_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: ProportionBaseQuestion[] = []
  const used = new Set<ProportionBaseEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const { skillId: _s, ...fields } = seed
    const q = buildProportionBaseQuestionFromMcq({
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
  return out
}

export type ProportionBaseHardSeedTemplate = {
  term: string
  passage: string
  table: ProportionBaseTableSpec
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: ProportionBaseHardSkillId
}

const INDUSTRY_TABLE: ProportionBaseTableSpec = {
  title: '2021年1—2月H省工业企业主要经济效益指标',
  unit: '亿元、%',
  columns: ['指标', '营业收入', '同比%', '营业成本', '同比%', '利润总额', '同比%'],
  rows: [
    ['总计', 5136.6, 27.9, 4200.1, 26.5, 312.4, 45.2],
    ['其中：亏损企业', 405.8, 47.4, 448.2, 38.1, -48.6, '-'],
    ['国有控股企业', 1820.3, 22.1, 1490.5, 20.8, 128.7, 35.6],
    ['中央企业', 960.2, 18.5, 790.4, 17.2, 72.3, 28.4],
  ],
}

const PROPORTION_BASE_HARD_SEEDS: ProportionBaseHardSeedTemplate[] = [
  {
    skillId: 'table-dir-then-size',
    term: '亏损企业营收占比变化',
    passage: '根据下表。',
    table: INDUSTRY_TABLE,
    stem: '2021年1—2月，H省亏损工业企业营业收入占全部工业企业营业收入的比重与上年同期相比：',
    correct: '上升约1个百分点',
    distractors: ['下降约1个百分点', '上升约20个百分点', '下降约20个百分点'],
    explanation:
      'qA=47.4%>qB=27.9%，比重上升，排除下降项。Δ≈405.8/5136.6×(47.4%-27.9%)/(1+47.4%)≈0.079×19.5%/1.474≈0.079×0.132≈1.0个百分点。答案为上升约1个百分点。',
    evidenceSpans: ['405.8', '47.4', '5136.6', '27.9'],
    method: '先判升降再估百分点',
  },
  {
    skillId: 'table-base-prop',
    term: '读表求基期亏损占比',
    passage: '根据下表求上年同期亏损企业营业收入占比。',
    table: INDUSTRY_TABLE,
    stem: '2020年1—2月，亏损企业营业收入约占全部工业企业营业收入的比重为？',
    correct: '约6.9%',
    distractors: ['约7.9%', '约5.5%', '约8.8%'],
    explanation:
      '现期占比≈405.8/5136.6≈7.9%。基期=7.9%×(1+27.9%)/(1+47.4%)≈7.9%×1.279/1.474≈7.9%×0.868≈6.9%。答案为约6.9%。',
    evidenceSpans: ['405.8', '5136.6', '27.9', '47.4'],
    method: 'A/B×(1+qB)/(1+qA)',
  },
  {
    skillId: 'table-prop-change',
    term: '国有控股营收占比变化',
    passage: '根据下表。',
    table: INDUSTRY_TABLE,
    stem: '国有控股企业营业收入占总计的比重与上年同期相比约：',
    correct: '下降约1个百分点',
    distractors: ['上升约1个百分点', '下降约5个百分点', '上升约5个百分点'],
    explanation:
      'qA=22.1%<qB=27.9%，比重下降。Δ幅度≈1820.3/5136.6×|22.1-27.9|/(1+22.1%)≈0.354×5.8%/1.221≈0.354×0.0475≈1.7，约1个百分点量级，选下降约1个百分点。答案为下降约1个百分点。',
    evidenceSpans: ['1820.3', '22.1', '5136.6', '27.9'],
    method: 'qA<qB下降+估幅度',
  },
  {
    skillId: 'table-multi-row',
    term: '中央企业基期利润占比',
    passage: '根据下表利润总额列。',
    table: INDUSTRY_TABLE,
    stem: '上年同期中央企业利润总额约占全部利润总额的比重最接近？',
    correct: '约26%',
    distractors: ['约23%', '约24%', '约21%'],
    explanation:
      '基期中央利润=72.3/1.284≈56.3，全部=312.4/1.452≈215.2；56.3/215.2≈26.2%。答案为约26%。',
    evidenceSpans: ['72.3', '28.4', '312.4', '45.2'],
    method: '利润列基期比重',
  },
  {
    skillId: 'table-compare-rows',
    term: '两类主体占比升降比较',
    passage: '根据下表营业收入同比增速。',
    table: INDUSTRY_TABLE,
    stem: '与上年同期相比，下列哪一类营业收入占总计的比重上升？',
    correct: '亏损企业',
    distractors: ['国有控股企业', '中央企业', '无法判断'],
    explanation:
      '总计增速27.9%。亏损47.4%>27.9%上升；国有22.1%<27.9%下降；中央18.5%<27.9%下降。答案为亏损企业。',
    evidenceSpans: ['47.4', '27.9', '22.1', '18.5'],
    method: '各行q与总计q比较',
  },
]

export function pickProportionBaseHardSeedTemplates(
  count: number,
): ProportionBaseHardSeedTemplate[] {
  const pool = [...PROPORTION_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: ProportionBaseHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildProportionBaseHardFromSeedTemplate(
  seed: ProportionBaseHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): ProportionBaseQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildProportionBaseQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeProportionBaseHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): ProportionBaseQuestion[] {
  if (need <= 0) return []
  const pool = [...PROPORTION_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: ProportionBaseQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildProportionBaseHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildProportionBaseHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderProportionBasePassageHtml }
