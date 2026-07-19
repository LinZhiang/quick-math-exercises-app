/**
 * 资料分析 · 平均数——基期平均数
 * 考点：基期平均=A/B×(1+qB)/(1+qA)；
 * 平均数增长量=A/B×(qA−qB)/(1+qA)；
 * 平均数增长率=(qA−qB)/(1+qB)；
 * qA>qB 现期平均上升，qA<qB 下降。
 * 简单/复杂均为纯文字；复杂对齐教材货运/快递真题。
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

export type AverageBaseDifficulty = DataAnalysisDifficulty

export const AVERAGE_BASE_QUESTION_COUNT = 5

export const AVERAGE_BASE_MODES: {
  id: AverageBaseDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '平均数·基期平均数 · 简单',
    desc: '每轮 5 题 · 纯文字 · 基期平均/升降/增速 · 数字相对简明 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '平均数·基期平均数 · 复杂',
    desc: '每轮 5 题 · 纯文字 · 增长量/增长率估算 · 对齐教材真题 · 仅豆包 · 正计时停表看答案',
  },
]

export type AverageBaseQuestion = {
  id: string
  topic: 'average-base'
  difficulty: AverageBaseDifficulty
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

export function averageBaseTopicLabel(): string {
  return '平均数·基期平均数'
}

export function averageBaseDifficultyLabel(d: AverageBaseDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type AverageBaseEasySkillId =
  | 'base-avg'
  | 'avg-dir'
  | 'avg-rate-simple'
  | 'avg-delta-simple'
  | 'base-vs-current'

export type AverageBaseEasySkillSlot = {
  id: AverageBaseEasySkillId
  label: string
  prompt: string
}

export const AVERAGE_BASE_EASY_SKILL_SLOTS: AverageBaseEasySkillSlot[] = [
  {
    id: 'base-avg',
    label: '求基期平均数',
    prompt: '基期平均=A/B×(1+qB)/(1+qA)。数字取易估算。',
  },
  {
    id: 'avg-dir',
    label: '平均数升降判断',
    prompt: '只比较 qA 与 qB：qA>qB 上升，qA<qB 下降。',
  },
  {
    id: 'avg-rate-simple',
    label: '平均数增长率简算',
    prompt: '增长率=(qA−qB)/(1+qB)；数字好算，可先判升降。',
  },
  {
    id: 'avg-delta-simple',
    label: '平均数增长量简算',
    prompt: '增长量=A/B×(qA−qB)/(1+qA)；量级小、易估。',
  },
  {
    id: 'base-vs-current',
    label: '基期与现期平均比较',
    prompt: '求基期平均并与现期 A/B 比较大小。',
  },
]

export function pickAverageBaseEasySkillPlan(
  count: number,
): AverageBaseEasySkillSlot[] {
  const out: AverageBaseEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...AVERAGE_BASE_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectAverageBaseEasySkillId(q: {
  stem: string
  explanation: string
}): AverageBaseEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/增长量|公里|元/.test(s) && /(qA|增速差|1\+qA)/.test(s)) return 'avg-delta-simple'
  if (/增长率|%/.test(s) && /(1\+qB|1\+b)/.test(s)) return 'avg-rate-simple'
  if (/上升|下降|提高|降低/.test(s) && !/百分点|约.*%/.test(s)) return 'avg-dir'
  if (/基期.*平均|上年.*平均/.test(s)) return 'base-avg'
  return 'base-vs-current'
}

export type AverageBaseHardSkillId =
  | 'avg-delta-hard'
  | 'avg-rate-hard'
  | 'base-avg-hard'
  | 'dir-then-size'
  | 'distract-parts'

export const AVERAGE_BASE_HARD_SKILL_SLOTS: {
  id: AverageBaseHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'avg-delta-hard',
    label: '平均数增长量（教材级）',
    prompt:
      '仿货运：周转量A增速qA、货运量B增速qB，求平均运距增长量≈A/B×(qA−qB)/(1+qA)。选项含升降干扰。',
  },
  {
    id: 'avg-rate-hard',
    label: '平均数增长率（教材级）',
    prompt:
      '仿快递：收入增速a、件量增速b，每件收入增速=(a−b)/(1+b)。须估到一位小数，选项贴近。',
  },
  {
    id: 'base-avg-hard',
    label: '基期平均数求值',
    prompt: '用 A/B×(1+qB)/(1+qA) 求基期人均/均价；数字需截位估算。',
  },
  {
    id: 'dir-then-size',
    label: '先判升降再定量',
    prompt: '选项同时含升/降与约1.3%/1.5%等；必须两步。',
  },
  {
    id: 'distract-parts',
    label: '多余分项干扰',
    prompt: '材料含同城/异地等分项，设问只用总计收入与总计件量增速。',
  },
]

export function getAverageBaseFingerprint(input: {
  difficulty: AverageBaseDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  return [
    'average-base',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableAverageBaseMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (q.options.filter((o) => /\d/.test(o) || /上升|下降/.test(o)).length >= 2) return true
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
  for (const d of [0.2, 0.5, 1, -0.2, 2, -1]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildAverageBaseQuestionFromMcq(input: {
  difficulty: AverageBaseDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): AverageBaseQuestion | null {
  const term = input.term.trim() || '基期平均数'
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
    explanation = `按基期平均数公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getAverageBaseFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
  })

  const q: AverageBaseQuestion = {
    id: `average-base-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'average-base',
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
  if (!isPlayableAverageBaseMcq(q)) return null
  return q
}

export function parseAverageBaseMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '基期平均数',
    passage: String(o.passage ?? o.material ?? '').trim(),
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const AVERAGE_BASE_EASY_SEEDS: Array<{
  skillId: AverageBaseEasySkillId
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
    skillId: 'base-avg',
    term: '求基期人均收入',
    passage:
      '某市居民可支配收入总额200亿元，同比增长25%；常住人口50万人，同比增长10%。',
    stem: '上年该市人均可支配收入约为多少万元？',
    correct: '3.52万元',
    distractors: ['4万元', '3.2万元', '3.8万元'],
    explanation:
      '现期人均=200/50=4。基期人均=4×(1+10%)/(1+25%)=4×1.1/1.25=4×0.88=3.52。答案为3.52万元。',
    evidenceSpans: ['200', '25%', '50', '10%'],
    method: 'A/B×(1+qB)/(1+qA)',
  },
  {
    skillId: 'avg-dir',
    term: '人均升降判断',
    passage: '某省GDP同比增长8%，常住人口同比增长2%。',
    stem: '与上年相比，该省人均GDP：',
    correct: '上升',
    distractors: ['下降', '不变', '无法判断'],
    explanation: 'qA=8%>qB=2%，现期人均上升。答案为上升。',
    evidenceSpans: ['8%', '2%'],
    method: 'qA>qB则上升',
  },
  {
    skillId: 'avg-rate-simple',
    term: '均价增长率简算',
    passage: '某商品销售额同比增长20%，销售量同比增长10%。',
    stem: '该商品均价同比约：',
    correct: '上升约9.1%',
    distractors: ['下降约9.1%', '上升约10%', '下降约10%'],
    explanation:
      'qA=20%>qB=10%，均价上升。增长率=(20%-10%)/(1+10%)=10%/1.1≈9.1%。答案为上升约9.1%。',
    evidenceSpans: ['20%', '10%'],
    method: '(qA−qB)/(1+qB)',
  },
  {
    skillId: 'avg-delta-simple',
    term: '人均增长量简算',
    passage:
      '某镇可支配收入总额1.2亿元，同比增长20%；人口3000人，同比增长5%。现期人均=4万元。',
    stem: '人均可支配收入同比约增加多少万元？',
    correct: '约0.5万元',
    distractors: ['约0.3万元', '约0.8万元', '约1万元'],
    explanation:
      'Δ=4×(20%-5%)/(1+20%)=4×15%/1.2=4×0.125=0.5。答案为约0.5万元。',
    evidenceSpans: ['20%', '5%', '4万'],
    method: 'A/B×(qA−qB)/(1+qA)',
  },
  {
    skillId: 'base-vs-current',
    term: '基期与现期人均比较',
    passage:
      '某市产值120亿元，同比增长20%；就业人数30万人，同比增长5%。',
    stem: '上年人均产值比现期人均产值约：',
    correct: '低0.5万元',
    distractors: ['高0.5万元', '低1万元', '高1万元'],
    explanation:
      '现期人均=4万元。基期=4×(1+5%)/(1+20%)=4×1.05/1.2=3.5；基期比现期低0.5万元。答案为低0.5万元。',
    evidenceSpans: ['120', '20%', '30', '5%'],
    method: '现期与基期人均作差',
  },
]

export function takeAverageBaseEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: AverageBaseEasySkillId[] = [],
): AverageBaseQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...AVERAGE_BASE_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: AverageBaseQuestion[] = []
  const used = new Set<AverageBaseEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildAverageBaseQuestionFromMcq({
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

export type AverageBaseHardSeedTemplate = {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: AverageBaseHardSkillId
}

const AVERAGE_BASE_HARD_SEEDS: AverageBaseHardSeedTemplate[] = [
  {
    skillId: 'avg-delta-hard',
    term: '平均运距增长量',
    passage:
      '2019年上半年，全国货运量245.8亿吨，同比增长5.9%；货物周转量98481.83亿吨公里，同比增长5.0%。',
    stem: '2019年上半年全国货物平均运距同比约：',
    correct: '减少约3.4公里',
    distractors: ['增加约3.4公里', '减少约5公里', '增加约5公里'],
    explanation:
      '平均运距=周转量/货运量。qA=5.0%<qB=5.9%，平均下降。Δ≈98481.83/245.8×(5.0%-5.9%)/(1+5.0%)≈400.7×(-0.9%)/1.05≈-3.4公里。答案为减少约3.4公里。',
    evidenceSpans: ['245.8', '5.9%', '98481.83', '5.0%'],
    method: 'A/B×(qA−qB)/(1+qA)',
  },
  {
    skillId: 'avg-rate-hard',
    term: '快递每件收入增速',
    passage:
      '2018年上半年，全国快递服务企业业务量220.8亿件，同比增长27.5%；业务收入2745亿元，同比增长25.8%。同城、异地、国际及港澳台业务量分别增长等（本题不用分项）。',
    stem: '与上年同期相比，全国快递服务企业每件业务收入约：',
    correct: '下降约1.3%',
    distractors: ['上升约1.3%', '下降约1.5%', '上升约1.5%'],
    explanation:
      '每件收入=收入/件量。a=25.8%<b=27.5%，下降。增速=(25.8%-27.5%)/(1+27.5%)=(-1.7%)/1.275≈-1.33%≈下降约1.3%。答案为下降约1.3%。',
    evidenceSpans: ['27.5%', '25.8%'],
    method: '(qA−qB)/(1+qB)',
  },
  {
    skillId: 'base-avg-hard',
    term: '基期平均运距',
    passage:
      '某省货运量200亿吨，同比增长10%；货物周转量80000亿吨公里，同比增长5%。',
    stem: '上年该省货物平均运距约为多少公里？',
    correct: '约419公里',
    distractors: ['约400公里', '约380公里', '约440公里'],
    explanation:
      '现期平均=80000/200=400。基期=400×(1+10%)/(1+5%)=400×1.1/1.05≈400×1.048≈419。答案为约419公里。',
    evidenceSpans: ['200', '10%', '80000', '5%'],
    method: 'A/B×(1+qB)/(1+qA)',
  },
  {
    skillId: 'dir-then-size',
    term: '先判升降再估增速',
    passage:
      '某市商品房销售额同比增长18.6%，销售面积同比增长15.2%。',
    stem: '与上年相比，该市商品房销售均价约：',
    correct: '上升约3.0%',
    distractors: ['下降约3.0%', '上升约3.4%', '下降约3.4%'],
    explanation:
      'qA=18.6%>qB=15.2%，均价上升，排除下降项。(18.6%-15.2%)/(1+15.2%)=3.4%/1.152≈2.95%≈上升约3.0%。答案为上升约3.0%。',
    evidenceSpans: ['18.6%', '15.2%'],
    method: '先判升降再算(qA−qB)/(1+qB)',
  },
  {
    skillId: 'distract-parts',
    term: '分项干扰求每件收入增速',
    passage:
      '某快递企业业务量10亿件（其中同城3亿、异地6.5亿、国际0.5亿），同比增长30%；业务收入120亿元（同城24亿、异地90亿、国际6亿），同比增长24%。',
    stem: '该企业每件业务平均收入同比约：',
    correct: '下降约4.6%',
    distractors: ['上升约4.6%', '下降约6%', '上升约6%'],
    explanation:
      '只用总计：a=24%，b=30%，a<b下降。(24%-30%)/(1+30%)=(-6%)/1.3≈-4.6%。分项不用。答案为下降约4.6%。',
    evidenceSpans: ['30%', '24%'],
    method: '忽略分项，用总计增速',
  },
]

export function pickAverageBaseHardSeedTemplates(
  count: number,
): AverageBaseHardSeedTemplate[] {
  const pool = [...AVERAGE_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: AverageBaseHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildAverageBaseHardFromSeedTemplate(
  seed: AverageBaseHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): AverageBaseQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildAverageBaseQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeAverageBaseHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): AverageBaseQuestion[] {
  if (need <= 0) return []
  const pool = [...AVERAGE_BASE_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: AverageBaseQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildAverageBaseHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildAverageBaseHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderAverageBasePassageHtml }
