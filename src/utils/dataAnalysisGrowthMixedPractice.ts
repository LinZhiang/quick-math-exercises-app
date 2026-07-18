/**
 * 资料分析 · 增长——混合增长
 * 考点：整体增速公式、介于部分之间、偏向基期大的一侧、十字交叉法、
 * 用现期比近似、已知整体求另一部分增速（逻辑排除）等。
 * 简单/复杂均为纯文字（无图）；复杂题计算/推理更接近真题或更难。
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
export type GrowthMixedDifficulty = DataAnalysisDifficulty

export const GROWTH_MIXED_QUESTION_COUNT = 5

export const GROWTH_MIXED_MODES: {
  id: GrowthMixedDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '增长·混合增长 · 简单',
    desc: '每轮 5 题 · 纯文字 · 区间排除/偏向基期大/求另一部分增速 · 数字好算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '增长·混合增长 · 复杂',
    desc: '每轮 5 题 · 纯文字 · 选项贴近须十字交叉/精确算/权重估 · 对齐书上难题或更难 · 仅豆包 · 正计时停表看答案',
  },
]

export type GrowthMixedQuestion = {
  id: string
  topic: 'growth-mixed'
  difficulty: GrowthMixedDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function growthMixedTopicLabel(): string {
  return '增长·混合增长'
}

export function growthMixedDifficultyLabel(d: GrowthMixedDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type GrowthMixedEasySkillId =
  | 'range-between'
  | 'lean-larger-base'
  | 'missing-part-logic'
  | 'vs-average'
  | 'simple-formula'

export type GrowthMixedEasySkillSlot = {
  id: GrowthMixedEasySkillId
  label: string
  prompt: string
}

/** 简单题：覆盖教材结论与典型排除题型，计算从简 */
export const GROWTH_MIXED_EASY_SKILL_SLOTS: GrowthMixedEasySkillSlot[] = [
  {
    id: 'range-between',
    label: '整体介于部分之间',
    prompt:
      '给两部分现期与增速，求整体增速；选项中只有一项落在两增速之间。explanation 写区间排除。',
  },
  {
    id: 'lean-larger-base',
    label: '偏向基期较大部分',
    prompt:
      '先估基期 A/(1+q)，比较大小，判断整体增速在均值哪一侧，结合区间选出唯一选项。',
  },
  {
    id: 'missing-part-logic',
    label: '求另一部分增速（逻辑）',
    prompt:
      '已知整体与一部分增速，求另一部分；整体介于两者之间→另一部分必在整体另一侧。仿非商品住宅下降题。',
  },
  {
    id: 'vs-average',
    label: '与算术平均比较',
    prompt:
      '在已判定区间后，用「基期大则更靠近该部分增速」把答案缩到均值与端点之间。',
  },
  {
    id: 'simple-formula',
    label: '混合增速简算',
    prompt:
      '数字较小，可直接用 q=(A1+A2)/(A1/(1+q1)+A2/(1+q2))-1 算出约值选答案。',
  },
]

export function pickGrowthMixedEasySkillPlan(count: number): GrowthMixedEasySkillSlot[] {
  const out: GrowthMixedEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...GROWTH_MIXED_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectGrowthMixedEasySkillId(q: {
  stem: string
  explanation: string
}): GrowthMixedEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/非|其余|另一|除此之外/.test(s) && /介于|大于|小于|必须/.test(s))
    return 'missing-part-logic'
  if (/基期/.test(s) && (/偏向|靠近|大于|小于/.test(s) || /均值|平均/.test(s)))
    return /平均|均值/.test(s) ? 'vs-average' : 'lean-larger-base'
  if (/公式|1\+|\/\(1\+/.test(s)) return 'simple-formula'
  if (/介于|之间/.test(s)) return 'range-between'
  return null
}

export type GrowthMixedHardSkillId =
  | 'cross-find-overall'
  | 'cross-approx-current'
  | 'exact-formula'
  | 'missing-part-hard'
  | 'base-ratio-cross'

export type GrowthMixedHardSkillSlot = {
  id: GrowthMixedHardSkillId
  label: string
  prompt: string
}

export const GROWTH_MIXED_HARD_SKILL_SLOTS: GrowthMixedHardSkillSlot[] = [
  {
    id: 'cross-find-overall',
    label: '十字交叉求整体增速',
    prompt:
      '难度≥教材真题：两部分现期+增速求整体。选项须有≥2个落在两增速之间，禁止「区间一眼排除」。须十字交叉算到约一位小数，并可说明现期比近似带来的偏差方向。',
  },
  {
    id: 'cross-approx-current',
    label: '现期比近似十字交叉',
    prompt:
      '列 (q高−x):(x−q低)=现期大:现期小 或等价式；数字不宜整十；干扰项与正确项差距≤1.5个百分点。',
  },
  {
    id: 'exact-formula',
    label: '精确混合增速公式',
    prompt:
      '须算基期 A/(1+q) 再代入精确式；仅用区间+偏向不够选唯一答案；选项密集。',
  },
  {
    id: 'missing-part-hard',
    label: '反推另一部分增速（加难）',
    prompt:
      '仿真题：已知整体与一部分（最好给占比）。外侧选项≥2个，须结合占比/基期权重估算，不能只靠「大于整体」秒杀。',
  },
  {
    id: 'base-ratio-cross',
    label: '由十字交叉反推基期比',
    prompt:
      '已知两增速与整体增速，求基期比；比值非整比（如7:5、5:3），选项接近易混。',
  },
]

export function getGrowthMixedQuestionFingerprint(input: {
  difficulty: GrowthMixedDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  return [
    'growth-mixed',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableGrowthMixedMcq(q: {
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

export function buildGrowthMixedQuestionFromMcq(input: {
  difficulty: GrowthMixedDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): GrowthMixedQuestion | null {
  const term = input.term.trim() || '混合增长'
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  const distractors = coerceDistractors(
    correct,
    input.distractors.map((d) => d.trim()).filter(Boolean),
  )
  if (!stem || !correct || distractors.length !== 3) return null
  if (passage.length < 8) return null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按混合增长率关系判断，答案为 ${correct}。`
  }
  // 混合增长解析多为区间/定性推理，严格验算易误杀豆包题；一律软校验
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: true,
  })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getGrowthMixedQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
  })

  const q: GrowthMixedQuestion = {
    id: `growth-mixed-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'growth-mixed',
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableGrowthMixedMcq(q)) return null
  return q
}

export function parseGrowthMixedMcqAiObject(item: unknown): {
  term: string
  passage: string
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
    term: String(o.term ?? o.topic ?? '').trim() || '混合增长',
    passage: String(o.passage ?? o.material ?? '').trim(),
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? o.解析 ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? o.evidence ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const GROWTH_MIXED_EASY_SEEDS: Array<{
  skillId: GrowthMixedEasySkillId
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
    skillId: 'range-between',
    term: '整体介于两者之间',
    passage: '2019年甲产品产量80万吨，同比增长10%；乙产品产量60万吨，同比增长16%。',
    stem: '2019年甲乙合计产量同比增长率约为？',
    correct: '12.5%',
    distractors: ['8%', '18%', '26%'],
    explanation:
      '整体增速介于10%与16%之间，排除8%、18%、26%。12.5%落在区间内。答案为12.5%。',
    evidenceSpans: ['10%', '16%'],
    method: '整体增速介于部分增速之间',
  },
  {
    skillId: 'lean-larger-base',
    term: '偏向基期较大侧',
    passage:
      '2019年某省养殖水产品产量120万吨，同比增长15%；捕捞水产品产量99万吨，同比增长21%。',
    stem: '2019年该省水产品总产量同比增长率约为？',
    correct: '17.7%',
    distractors: ['19.2%', '14.3%', '23.2%'],
    explanation:
      '整体介于15%与21%之间，排除14.3%、23.2%。均值18%。养殖基期≈120/1.15≈104，捕捞基期≈99/1.21≈82，基期养殖更大，整体偏向15%，应小于18%。17.7%符合。答案为17.7%。',
    evidenceSpans: ['15%', '21%', '120', '99'],
    method: '区间+偏向基期大的一侧',
  },
  {
    skillId: 'vs-average',
    term: '与均值比较定位',
    passage: '某市线上零售额200亿元，同比增长20%；线下零售额300亿元，同比增长8%。',
    stem: '该市零售额总体同比增速应最接近？',
    correct: '12%',
    distractors: ['16%', '18%', '6%'],
    explanation:
      '整体介于8%与20%之间，排除6%。均值14%。线下基期≈300/1.08≈278，线上基期≈200/1.2≈167，线下基期更大，整体偏向8%，应小于14%。12%符合。答案为12%。',
    evidenceSpans: ['20%', '8%', '200', '300'],
    method: '均值两侧+基期权重',
  },
  {
    skillId: 'missing-part-logic',
    term: '反推另一部分下降幅度',
    passage:
      '2017年S省房屋新开工面积同比下降14.2%。其中商品住宅新开工面积同比下降9.2%。',
    stem: '2017年该省非商品住宅类房屋新开工面积比上年约下降了多少？',
    correct: '25%',
    distractors: ['2%', '8%', '4%'],
    explanation:
      '整体下降14.2%，商品住宅下降9.2%。整体介于两部分之间，故非商品住宅下降幅度必大于14.2%。选项中仅25%>14.2%。答案为25%。',
    evidenceSpans: ['14.2%', '9.2%'],
    method: '整体介于部分→另一部分在外侧',
  },
  {
    skillId: 'simple-formula',
    term: '混合增速简算',
    passage: 'A部门产值50，同比+10%；B部门产值50，同比+20%。',
    stem: 'A、B合计产值同比增速是？',
    correct: '14.9%',
    distractors: ['15%', '12%', '18%'],
    explanation:
      '基期和=50/1.1+50/1.2≈45.45+41.67=87.12；现期和=100；增速=100/87.12-1≈0.148≈14.9%。亦介于10%与20%且基期接近，略低于均值15%。答案为14.9%。',
    evidenceSpans: ['50', '10%', '20%'],
    method: '混合增速精确式',
  },
]

export function takeGrowthMixedEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: GrowthMixedEasySkillId[] = [],
): GrowthMixedQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...GROWTH_MIXED_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: GrowthMixedQuestion[] = []
  const used = new Set<GrowthMixedEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const { skillId: _s, ...fields } = seed
    const q = buildGrowthMixedQuestionFromMcq({
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

export type GrowthMixedHardSeedTemplate = {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: GrowthMixedHardSkillId
}

const GROWTH_MIXED_HARD_SEEDS: GrowthMixedHardSeedTemplate[] = [
  {
    skillId: 'cross-approx-current',
    term: '水产品十字交叉（真题级）',
    passage:
      '2019年某省养殖水产品产量120万吨，同比增长15%；捕捞水产品产量99万吨，同比增长21%。',
    stem: '2019年该省水产品总产量同比增长率约为？',
    correct: '17.7%',
    distractors: ['18.5%', '17.0%', '19.2%'],
    explanation:
      '介于15%与21%，17.0%、17.7%、18.5%均可能，不可秒杀。现期比十字交叉：(21-x)/(x-15)=120/99≈1.21。21-x=1.21x-18.15；39.15=2.21x；x≈17.7。现期比略抬高高速一侧，真实略低仍最接近17.7%。答案为17.7%。',
    evidenceSpans: ['15%', '21%', '120', '99'],
    method: '区间内多选项+十字交叉',
  },
  {
    skillId: 'exact-formula',
    term: '精确式算集团总增速',
    passage:
      '某集团海外业务收入368亿元，同比增长12.5%；国内业务收入532亿元，同比增长4.8%。',
    stem: '该集团总收入同比增速最接近下列哪一项？',
    correct: '7.9%',
    distractors: ['8.6%', '7.2%', '9.1%'],
    explanation:
      '7.2%、7.9%、8.6%均在4.8%—12.5%内。基期海外=368/1.125≈327.1，国内=532/1.048≈507.6，基期和≈834.7；现期和=900；900/834.7-1≈0.078≈7.8%，最接近7.9%。答案为7.9%。',
    evidenceSpans: ['368', '12.5%', '532', '4.8%'],
    method: '精确基期和再除',
  },
  {
    skillId: 'missing-part-hard',
    term: '非商品住宅降幅（权重）',
    passage:
      '2017年S省房屋新开工面积3306万平方米，同比下降14.2%。其中商品住宅新开工面积2411万平方米，同比下降9.2%。',
    stem: '2017年该省非商品住宅类房屋新开工面积比上年同期约下降了多少？',
    correct: '25%',
    distractors: ['16%', '18%', '30%'],
    explanation:
      '整体−14.2%，住宅−9.2%，故非住宅降幅>14.2%，16%、18%、25%、30%均可能。住宅占比2411/3306≈73%。粗估：−14.2≈0.73×(−9.2)+0.27q → −14.2≈−6.7+0.27q → q≈−27.8%，最接近25%（30%偏大）。答案为25%。',
    evidenceSpans: ['14.2%', '9.2%', '3306', '2411'],
    method: '外侧多选项+占比估权重',
  },
  {
    skillId: 'base-ratio-cross',
    term: '反推基期比非整比',
    passage: '甲、乙两类业务增速分别为19.5%、8.5%，两类合计增速为13.5%。',
    stem: '甲、乙基期规模之比最接近？',
    correct: '5:6',
    distractors: ['1:1', '2:3', '3:2'],
    explanation:
      '基期甲:乙=(13.5-8.5):(19.5-13.5)=5:6。答案为5:6。',
    evidenceSpans: ['19.5%', '8.5%', '13.5%'],
    method: '十字交叉得非整比',
  },
  {
    skillId: 'cross-find-overall',
    term: '东西部营收十字交叉微调',
    passage:
      '2021年东部营收423亿元，同比+9.4%；中西部营收277亿元，同比+16.2%。',
    stem: '东部与中西部合计营收同比增速约为？',
    correct: '12.0%',
    distractors: ['12.8%', '11.3%', '13.5%'],
    explanation:
      '11.3%、12.0%、12.8%均在9.4%—16.2%。现期比423:277≈1.53。设x为整体：(16.2-x)/(x-9.4)≈1.53。16.2-x=1.53x-14.38；30.58=2.53x；x≈12.1。现期比略抬高，取12.0%。答案为12.0%。',
    evidenceSpans: ['9.4%', '16.2%', '423', '277'],
    method: '十字交叉+现期比偏差',
  },
  {
    skillId: 'exact-formula',
    term: '进出口精确混合',
    passage:
      '某市出口额486亿元，同比增长7.8%；进口额314亿元，同比增长15.2%。',
    stem: '该市进出口总额同比增速最接近？',
    correct: '10.6%',
    distractors: ['11.5%', '9.8%', '12.2%'],
    explanation:
      '9.8%、10.6%、11.5%均在区间内。基期出口≈486/1.078≈450.8，进口≈314/1.152≈272.6，基期和≈723.4；现期和=800；800/723.4-1≈0.106。答案为10.6%。',
    evidenceSpans: ['7.8%', '15.2%', '486', '314'],
    method: '精确式定密集选项',
  },
  {
    skillId: 'missing-part-hard',
    term: '非民间投资降幅估权',
    passage:
      '2022年某省固定资产投资同比下降4.8%。其中民间投资同比下降1.5%，占全省投资的64%。',
    stem: '2022年该省非民间投资同比约下降了多少？',
    correct: '11%',
    distractors: ['6%', '8%', '14%'],
    explanation:
      '非民间降幅>4.8%，6%、8%、11%、14%中后三者都可能。粗估：−4.8≈0.64×(−1.5)+0.36q → −4.8≈−0.96+0.36q → q≈−10.7%，最接近11%。答案为11%。',
    evidenceSpans: ['4.8%', '1.5%', '64%'],
    method: '权重方程估算',
  },
]

export function pickGrowthMixedHardSeedTemplates(
  count: number,
): GrowthMixedHardSeedTemplate[] {
  const pool = [...GROWTH_MIXED_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: GrowthMixedHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function pickGrowthMixedHardFallbackSeed(
  failed: GrowthMixedHardSeedTemplate,
  usedTerms: Set<string>,
): GrowthMixedHardSeedTemplate {
  const pool = GROWTH_MIXED_HARD_SEEDS.filter(
    (s) => s.stem !== failed.stem && !usedTerms.has(s.term.trim()),
  )
  const src = pool.length
    ? pool
    : GROWTH_MIXED_HARD_SEEDS.filter((s) => s.stem !== failed.stem)
  if (!src.length) return failed
  return src[Math.floor(Math.random() * src.length)]!
}

export function buildGrowthMixedHardFromSeedTemplate(
  seed: GrowthMixedHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): GrowthMixedQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildGrowthMixedQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeGrowthMixedHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): GrowthMixedQuestion[] {
  if (need <= 0) return []
  const pool = [...GROWTH_MIXED_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: GrowthMixedQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildGrowthMixedHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildGrowthMixedHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderGrowthMixedPassageHtml }
