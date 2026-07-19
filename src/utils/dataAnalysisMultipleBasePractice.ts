/**
 * 资料分析 · 倍数与翻番——基期倍数与增长量倍数
 * 基期倍数=A/B×(1+qB)/(1+qA)；
 * 增长量倍数=A×qA/(B×qB)×(1+qB)/(1+qA)。
 * 简单：纯文字；复杂：数据表，难度高于教材。
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

export type MultipleBaseDifficulty = DataAnalysisDifficulty

export const MULTIPLE_BASE_QUESTION_COUNT = 5

export const MULTIPLE_BASE_MODES: {
  id: MultipleBaseDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '倍数·基期与增长量倍数 · 简单',
    desc: '每轮 5 题 · 纯文字 · 基期倍数/增长量倍数 · 数字相对简明 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '倍数·基期与增长量倍数 · 复杂',
    desc: '每轮 5 题 · 数据表 · 增长量倍数估算等 · 难于教材 · 仅豆包 · 正计时停表看答案',
  },
]

export type MultipleBaseTableSpec = GrowthAvgAnnualTableSpec

export type MultipleBaseQuestion = {
  id: string
  topic: 'multiple-base'
  difficulty: MultipleBaseDifficulty
  term: string
  passage: string
  table: MultipleBaseTableSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function multipleBaseTopicLabel(): string {
  return '倍数·基期与增长量倍数'
}

export function multipleBaseDifficultyLabel(d: MultipleBaseDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type MultipleBaseEasySkillId =
  | 'base-multiple'
  | 'growth-multiple'
  | 'base-with-decline'
  | 'current-vs-base-mult'
  | 'growth-approx'

export type MultipleBaseEasySkillSlot = {
  id: MultipleBaseEasySkillId
  label: string
  prompt: string
}

export const MULTIPLE_BASE_EASY_SKILL_SLOTS: MultipleBaseEasySkillSlot[] = [
  {
    id: 'base-multiple',
    label: '求基期倍数',
    prompt: '基期倍数=A/B×(1+qB)/(1+qA)。仿海水产品/淡水产品题。',
  },
  {
    id: 'growth-multiple',
    label: '求增长量倍数',
    prompt: '增长量倍数=A×qA/(B×qB)×(1+qB)/(1+qA)。数字好估。',
  },
  {
    id: 'base-with-decline',
    label: '一方负增长的基期倍数',
    prompt: '一方下降时 1+q 小于1，注意方向。',
  },
  {
    id: 'current-vs-base-mult',
    label: '现期倍数与基期倍数比较',
    prompt: '先算现期 A/B，再算基期倍数，比较大小。',
  },
  {
    id: 'growth-approx',
    label: '增长量倍数特征分数估',
    prompt: '用 1/7、1/10 等特征分数估算增长量再比倍。',
  },
]

export function pickMultipleBaseEasySkillPlan(
  count: number,
): MultipleBaseEasySkillSlot[] {
  const out: MultipleBaseEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...MULTIPLE_BASE_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectMultipleBaseEasySkillId(q: {
  stem: string
  explanation: string
}): MultipleBaseEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/增长量|×qA|特征|1\/7/.test(s)) return 'growth-multiple'
  if (/下降|负增长|1−|1-/.test(s) && /基期/.test(s)) return 'base-with-decline'
  if (/现期.*基期|基期.*现期/.test(s)) return 'current-vs-base-mult'
  if (/基期倍数|上年.*倍/.test(s)) return 'base-multiple'
  return 'growth-approx'
}

export type MultipleBaseHardSkillId =
  | 'table-growth-mult'
  | 'table-base-mult'
  | 'table-growth-frac'
  | 'table-distract-rows'
  | 'table-combo'

export const MULTIPLE_BASE_HARD_SKILL_SLOTS: {
  id: MultipleBaseHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'table-growth-mult',
    label: '读表增长量倍数',
    prompt:
      '仿白酒/啤酒：增长量=现期×r/(1+r)，再求倍数。难度高于教材，选项更贴近。',
  },
  {
    id: 'table-base-mult',
    label: '读表基期倍数',
    prompt: '从表取两产品现期与增速，求上年倍数。',
  },
  {
    id: 'table-growth-frac',
    label: '特征分数估增长量倍数',
    prompt: '须用 1/7、1/10 等估算，禁止直接精确算才能选。',
  },
  {
    id: 'table-distract-rows',
    label: '多行干扰定位',
    prompt: '表含5行以上产品，须找对两行再算增长量倍数。',
  },
  {
    id: 'table-combo',
    label: '基期倍数与增长量倍数综合',
    prompt: '一题需判断用基期倍数还是增长量倍数；材料易混淆。',
  },
]

export function getMultipleBaseFingerprint(input: {
  difficulty: MultipleBaseDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  tableTitle?: string
}): string {
  return [
    'multiple-base',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.tableTitle ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableMultipleBaseMcq(q: {
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
  for (const d of [0.2, 0.3, 0.5, -0.2, 1]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildMultipleBaseQuestionFromMcq(input: {
  difficulty: MultipleBaseDifficulty
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
}): MultipleBaseQuestion | null {
  const term = input.term.trim() || '基期与增长量倍数'
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
    explanation = `按基期倍数或增长量倍数公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    [passage, table?.title].filter(Boolean).join('\n') || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getMultipleBaseFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    tableTitle: table?.title,
  })

  const q: MultipleBaseQuestion = {
    id: `multiple-base-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'multiple-base',
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
  if (!isPlayableMultipleBaseMcq(q)) return null
  return q
}

export function parseMultipleBaseMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '基期与增长量倍数',
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

const MULTIPLE_BASE_EASY_SEEDS: Array<{
  skillId: MultipleBaseEasySkillId
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
    skillId: 'base-with-decline',
    term: '海水是淡水基期倍数',
    passage:
      '2018年G省海水产品产量447.40万吨，同比下降1.0%；淡水产品产量400.85万吨，同比增长5.0%。',
    stem: '2017年G省海水产品产量约是淡水产品的多少倍？',
    correct: '1.2倍',
    distractors: ['0.8倍', '1.5倍', '0.9倍'],
    explanation:
      '基期倍数=447.40/400.85×(1+5.0%)/(1−1.0%)≈1.116×1.05/0.99≈1.116×1.061≈1.18≈1.2倍。答案为1.2倍。',
    evidenceSpans: ['447.40', '1.0%', '400.85', '5.0%'],
    method: 'A/B×(1+qB)/(1+qA)',
  },
  {
    skillId: 'base-multiple',
    term: '粮食是水果基期倍数',
    passage:
      '2018年G省粮食产量1193.49万吨，同比下降1.3%；园林水果1540.99万吨，同比增长8.4%。',
    stem: '2017年粮食产量约是园林水果的多少倍？',
    correct: '约0.84倍',
    distractors: ['约0.77倍', '约0.90倍', '约1.1倍'],
    explanation:
      '现期比≈1193/1541≈0.775；基期=0.775×(1+8.4%)/(1−1.3%)≈0.775×1.084/0.987≈0.85。答案为约0.84倍。',
    evidenceSpans: ['1193.49', '1.3%', '1540.99', '8.4%'],
    method: '基期倍数',
  },
  {
    skillId: 'growth-multiple',
    term: '甲乙增长量倍数简算',
    passage: '甲产量200万吨，同比增长20%；乙产量100万吨，同比增长10%。',
    stem: '甲产量同比增量约是乙的多少倍？',
    correct: '约3.7倍',
    distractors: ['约2倍', '约4倍', '约3倍'],
    explanation:
      '甲增量=200×20%/1.2≈33.3；乙=100×10%/1.1≈9.1；33.3/9.1≈3.7。或200×0.2/(100×0.1)×1.1/1.2=4×1.1/1.2≈3.67。答案为约3.7倍。',
    evidenceSpans: ['200', '20%', '100', '10%'],
    method: '增长量倍数公式',
  },
  {
    skillId: 'growth-approx',
    term: '特征分数估增长量倍',
    passage: '白酒产量350万千升，同比增长约14%（≈1/7）；啤酒产量220万千升，同比增长约10%（≈1/10）。',
    stem: '白酒产量增量约是啤酒的多少倍？',
    correct: '约2.3倍',
    distractors: ['约1.8倍', '约2.0倍', '约2.8倍'],
    explanation:
      '白酒增量≈350/8=43.75；啤酒≈220/11=20；43.75/20≈2.2≈2.3。答案为约2.3倍。',
    evidenceSpans: ['350', '14%', '220', '10%'],
    method: '特征分数估增长量再比',
  },
  {
    skillId: 'current-vs-base-mult',
    term: '现期与基期倍数比较',
    passage: 'A产值120，同比+20%；B产值80，同比+10%。',
    stem: 'A是B的现期倍数与基期倍数相比：',
    correct: '现期倍数更大',
    distractors: ['基期倍数更大', '两者相等', '无法判断'],
    explanation:
      '现期=120/80=1.5；基期=1.5×1.1/1.2=1.375。现期更大。答案为现期倍数更大。',
    evidenceSpans: ['120', '20%', '80', '10%'],
    method: '现期A/B与基期倍数比较',
  },
]

export function takeMultipleBaseEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: MultipleBaseEasySkillId[] = [],
): MultipleBaseQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...MULTIPLE_BASE_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: MultipleBaseQuestion[] = []
  const used = new Set<MultipleBaseEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildMultipleBaseQuestionFromMcq({
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

export type MultipleBaseHardSeedTemplate = {
  term: string
  passage: string
  table: MultipleBaseTableSpec
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: MultipleBaseHardSkillId
}

const INDUSTRY_PRODUCT_TABLE: MultipleBaseTableSpec = {
  title: '2018年甲市规模以上工业企业部分产品产量及其增长速度',
  unit: '万吨、万千升、亿支、%',
  columns: ['产品名称', '单位', '绝对数', '比上年增长(%)'],
  rows: [
    ['食用植物油', '万吨', 200.2, 3.3],
    ['白酒', '万千升', 358.3, 14.0],
    ['啤酒', '万千升', 221.4, 10.2],
    ['卷烟', '亿支', 755.2, 2.9],
    ['纱', '万吨', 73.0, 7.3],
  ],
}

const MULTIPLE_BASE_HARD_SEEDS: MultipleBaseHardSeedTemplate[] = [
  {
    skillId: 'table-growth-frac',
    term: '白酒增量是啤酒的几倍',
    passage: '根据下表。可用特征分数估算。',
    table: INDUSTRY_PRODUCT_TABLE,
    stem: '2018年甲市白酒产量同比增量约是啤酒的多少倍？',
    correct: '2.2倍',
    distractors: ['1.6倍', '1.8倍', '2.0倍'],
    explanation:
      '14%≈1/7，增量≈358.3/8≈44.8；10.2%≈1/10，增量≈221.4/11≈20.1；44.8/20.1≈2.23≈2.2。答案为2.2倍。',
    evidenceSpans: ['358.3', '14.0', '221.4', '10.2'],
    method: '特征分数估增长量倍数',
  },
  {
    skillId: 'table-base-mult',
    term: '白酒是啤酒基期倍数',
    passage: '根据下表求上年白酒与啤酒产量之比。',
    table: INDUSTRY_PRODUCT_TABLE,
    stem: '2017年甲市白酒产量约是啤酒的多少倍？',
    correct: '约1.56倍',
    distractors: ['约1.62倍', '约1.45倍', '约1.70倍'],
    explanation:
      '现期比≈358.3/221.4≈1.62；基期=1.62×(1+10.2%)/(1+14%)≈1.62×1.102/1.14≈1.56。答案为约1.56倍。',
    evidenceSpans: ['358.3', '14.0', '221.4', '10.2'],
    method: '基期倍数',
  },
  {
    skillId: 'table-growth-mult',
    term: '纱增量是植物油的几倍',
    passage: '根据下表食用植物油与纱。',
    table: INDUSTRY_PRODUCT_TABLE,
    stem: '2018年纱产量同比增量约是食用植物油的多少倍？',
    correct: '约0.77倍',
    distractors: ['约0.55倍', '约1.0倍', '约1.2倍'],
    explanation:
      '纱增量=73×7.3%/1.073≈5.0；油增量=200.2×3.3%/1.033≈6.4；5.0/6.4≈0.78。答案为约0.77倍。',
    evidenceSpans: ['73.0', '7.3', '200.2', '3.3'],
    method: '增长量倍数',
  },
  {
    skillId: 'table-distract-rows',
    term: '卷烟与白酒增长量倍（定位）',
    passage: '根据下表，注意勿用啤酒行。',
    table: INDUSTRY_PRODUCT_TABLE,
    stem: '2018年白酒产量同比增量约是卷烟的多少倍？',
    correct: '约2.1倍',
    distractors: ['约1.5倍', '约2.5倍', '约3.0倍'],
    explanation:
      '白酒增量≈358.3×14%/1.14≈44.0；卷烟≈755.2×2.9%/1.029≈21.3；44/21.3≈2.07≈2.1。答案为约2.1倍。',
    evidenceSpans: ['358.3', '14.0', '755.2', '2.9'],
    method: '定位两行再算增长量倍',
  },
  {
    skillId: 'table-combo',
    term: '问基期勿用增长量公式',
    passage: '根据下表啤酒与食用植物油。',
    table: INDUSTRY_PRODUCT_TABLE,
    stem: '2017年啤酒产量约是食用植物油的多少倍？',
    correct: '约1.05倍',
    distractors: ['约1.11倍', '约0.95倍', '约3.1倍'],
    explanation:
      '问基期倍数：现期221.4/200.2≈1.106；基期=1.106×(1+3.3%)/(1+10.2%)≈1.106×1.033/1.102≈1.04≈1.05。勿用增长量公式得约3倍干扰项。答案为约1.05倍。',
    evidenceSpans: ['221.4', '10.2', '200.2', '3.3'],
    method: '基期倍数（非增长量）',
  },
]

export function pickMultipleBaseHardSeedTemplates(
  count: number,
): MultipleBaseHardSeedTemplate[] {
  const pool = [...MULTIPLE_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: MultipleBaseHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildMultipleBaseHardFromSeedTemplate(
  seed: MultipleBaseHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): MultipleBaseQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildMultipleBaseQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeMultipleBaseHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): MultipleBaseQuestion[] {
  if (need <= 0) return []
  const pool = [...MULTIPLE_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: MultipleBaseQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildMultipleBaseHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildMultipleBaseHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderMultipleBasePassageHtml }
