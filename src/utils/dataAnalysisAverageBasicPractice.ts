/**
 * 资料分析 · 平均数——基本公式
 * 考点：平均数=总量/份数；总量=平均数×份数；份数=总量/平均数；简单算术平均。
 * 简单/复杂均为纯文字；复杂含单位换算、大数估算、多步提取，难度对齐教材。
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

export type AverageBasicDifficulty = DataAnalysisDifficulty

export const AVERAGE_BASIC_QUESTION_COUNT = 5

export const AVERAGE_BASIC_MODES: {
  id: AverageBasicDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '平均数·基本公式 · 简单',
    desc: '每轮 5 题 · 纯文字 · 总量/份数互求 · 数字好算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '平均数·基本公式 · 复杂',
    desc: '每轮 5 题 · 纯文字 · 单位换算/大数估算/多步提取 · 对齐教材 · 仅豆包 · 正计时停表看答案',
  },
]

export type AverageBasicQuestion = {
  id: string
  topic: 'average-basic'
  difficulty: AverageBasicDifficulty
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

export function averageBasicTopicLabel(): string {
  return '平均数·基本公式'
}

export function averageBasicDifficultyLabel(d: AverageBasicDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type AverageBasicEasySkillId =
  | 'avg-divide'
  | 'total-multiply'
  | 'shares-divide'
  | 'arithmetic-mean'
  | 'unit-price-simple'

export type AverageBasicEasySkillSlot = {
  id: AverageBasicEasySkillId
  label: string
  prompt: string
}

export const AVERAGE_BASIC_EASY_SKILL_SLOTS: AverageBasicEasySkillSlot[] = [
  {
    id: 'avg-divide',
    label: '求平均数=总量/份数',
    prompt: '给出总量与份数，求人均/均价/单产等。数字整除或易除。',
  },
  {
    id: 'total-multiply',
    label: '由平均数求总量',
    prompt: '总量=平均数×份数。仿教材公式②。',
  },
  {
    id: 'shares-divide',
    label: '由平均数求份数',
    prompt: '份数=总量/平均数。仿教材公式③。',
  },
  {
    id: 'arithmetic-mean',
    label: '简单算术平均',
    prompt: '若干数值求平均值 m=(m1+…+mn)/n。',
  },
  {
    id: 'unit-price-simple',
    label: '均价/单产简算',
    prompt: '金额÷数量或产量÷面积，结果为整数或一位小数。',
  },
]

export function pickAverageBasicEasySkillPlan(
  count: number,
): AverageBasicEasySkillSlot[] {
  const out: AverageBasicEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...AVERAGE_BASIC_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectAverageBasicEasySkillId(q: {
  stem: string
  explanation: string
}): AverageBasicEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/算术|平均值|\(m1|之和\/n/.test(s)) return 'arithmetic-mean'
  if (/份数|人数|面积/.test(s) && /总量|总|\/|除/.test(s) && /求.*数|多少人|多少公顷/.test(s))
    return 'shares-divide'
  if (/总量|总产|总额/.test(s) && /×|乘/.test(s)) return 'total-multiply'
  if (/均价|单价|单产|人均/.test(s)) return 'unit-price-simple'
  if (/平均|人均|单产|均价/.test(s)) return 'avg-divide'
  return 'avg-divide'
}

export type AverageBasicHardSkillId =
  | 'unit-convert'
  | 'large-est'
  | 'multi-sum-avg'
  | 'avg-compare'
  | 'multi-step-reverse'

export const AVERAGE_BASIC_HARD_SKILL_SLOTS: {
  id: AverageBasicHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'unit-convert',
    label: '单位换算求总量',
    prompt:
      '仿粮食：面积(万公顷)×单产(千克/公顷)→万吨，注意千克→吨换算。数字接近教材量级。',
  },
  {
    id: 'large-est',
    label: '大数估算均价',
    prompt: '仿原木：货值÷体积估单价；需截位估算，选项贴近。',
  },
  {
    id: 'multi-sum-avg',
    label: '多部分先合计再求平均',
    prompt: '材料给多项总量/份数，先求和再除；可有无关分项干扰。',
  },
  {
    id: 'avg-compare',
    label: '两类平均比较',
    prompt: '比较两部门人均/均价谁高或高多少；需分别计算。',
  },
  {
    id: 'multi-step-reverse',
    label: '多步反推',
    prompt: '已知平均与部分数据，反推总量或份数，中间含占比或单位换算。',
  },
]

export function getAverageBasicFingerprint(input: {
  difficulty: AverageBasicDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  return [
    'average-basic',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableAverageBasicMcq(q: {
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
  for (const d of [1, 2, 5, -1, 3, -2]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildAverageBasicQuestionFromMcq(input: {
  difficulty: AverageBasicDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): AverageBasicQuestion | null {
  const term = input.term.trim() || '平均数基本公式'
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
    explanation = `按平均数基本公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getAverageBasicFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
  })

  const q: AverageBasicQuestion = {
    id: `average-basic-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'average-basic',
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
  if (!isPlayableAverageBasicMcq(q)) return null
  return q
}

export function parseAverageBasicMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '平均数基本公式',
    passage: String(o.passage ?? o.material ?? '').trim(),
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const AVERAGE_BASIC_EASY_SEEDS: Array<{
  skillId: AverageBasicEasySkillId
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
    skillId: 'avg-divide',
    term: '人均可支配收入',
    passage: '某县居民可支配收入总额120亿元，常住人口60万人。',
    stem: '该县人均可支配收入约为多少万元？',
    correct: '2万元',
    distractors: ['1.5万元', '2.5万元', '3万元'],
    explanation: '人均=120/60=2（万元）。答案为2万元。',
    evidenceSpans: ['120', '60'],
    method: '总量/份数',
  },
  {
    skillId: 'total-multiply',
    term: '由单产求总产',
    passage: '某乡粮食播种面积800公顷，平均单产5600千克/公顷。',
    stem: '该乡粮食总产量约为多少吨？',
    correct: '4480吨',
    distractors: ['448吨', '5600吨', '4000吨'],
    explanation: '总量=800×5600=4480000千克=4480吨。答案为4480吨。',
    evidenceSpans: ['800', '5600'],
    method: '平均数×份数',
  },
  {
    skillId: 'shares-divide',
    term: '由均价求销量',
    passage: '某商场某品牌手机销售额90万元，平均售价3000元/台。',
    stem: '该品牌手机约售出多少台？',
    correct: '300台',
    distractors: ['270台', '330台', '360台'],
    explanation: '份数=900000/3000=300。答案为300台。',
    evidenceSpans: ['90万', '3000'],
    method: '总量/平均数',
  },
  {
    skillId: 'arithmetic-mean',
    term: '三地均价算术平均',
    passage: '甲乙丙三市某商品均价分别为12元、15元、18元。',
    stem: '三市均价的简单算术平均约为？',
    correct: '15元',
    distractors: ['14元', '16元', '13.5元'],
    explanation: '(12+15+18)/3=15。答案为15元。',
    evidenceSpans: ['12', '15', '18'],
    method: '算术平均',
  },
  {
    skillId: 'unit-price-simple',
    term: '出口均价简算',
    passage: '某批商品出口额500万美元，出口量100万件。',
    stem: '该批商品出口均价约为多少美元/件？',
    correct: '5美元/件',
    distractors: ['4美元/件', '6美元/件', '50美元/件'],
    explanation: '均价=500/100=5。答案为5美元/件。',
    evidenceSpans: ['500', '100'],
    method: '金额/数量',
  },
]

export function takeAverageBasicEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: AverageBasicEasySkillId[] = [],
): AverageBasicQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...AVERAGE_BASIC_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: AverageBasicQuestion[] = []
  const used = new Set<AverageBasicEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildAverageBasicQuestionFromMcq({
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

export type AverageBasicHardSeedTemplate = {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: AverageBasicHardSkillId
}

const AVERAGE_BASIC_HARD_SEEDS: AverageBasicHardSeedTemplate[] = [
  {
    skillId: 'unit-convert',
    term: '粮食面积×单产求万吨',
    passage:
      '2018年全国粮食播种面积11704万公顷，平均每公顷产量5600千克。',
    stem: '2018年全国粮食总产量约为多少万吨？',
    correct: '约65542万吨',
    distractors: ['约6554万吨', '约11704万吨', '约56000万吨'],
    explanation:
      '总量=11704×5600=65554200（万千克）。1吨=1000千克，故万吨级=65554200/1000=65554.2≈65542万吨。答案为约65542万吨。',
    evidenceSpans: ['11704', '5600'],
    method: '面积×单产并换算万吨',
  },
  {
    skillId: 'large-est',
    term: '原木出口均价估算',
    passage:
      '某年原木出口额约70000万美元，出口量669.7万立方米。',
    stem: '该年原木出口均价约多少美元/立方米？',
    correct: '约105美元/立方米',
    distractors: ['约95美元/立方米', '约115美元/立方米', '约125美元/立方米'],
    explanation: '均价≈70000/669.7≈104.5≈105。答案为约105美元/立方米。',
    evidenceSpans: ['70000', '669.7'],
    method: '货值/体积估算',
  },
  {
    skillId: 'multi-sum-avg',
    term: '三类出口先合计再均价',
    passage:
      '对俄出口：服装27.3亿美元、鞋靴6.7亿美元、机电9.6亿美元；三类合计出口量约2.18亿件（件均按件数口径）。为简化，已知三类合计金额43.6亿美元，合计数量2.18亿件。',
    stem: '三类商品合计出口均价约为多少美元/件？',
    correct: '约20美元/件',
    distractors: ['约18美元/件', '约22美元/件', '约15美元/件'],
    explanation: '均价=43.6/2.18≈20。答案为约20美元/件。',
    evidenceSpans: ['43.6', '2.18'],
    method: '先合计再除',
  },
  {
    skillId: 'avg-compare',
    term: '两市人均比较',
    passage:
      '甲市可支配收入总额480亿元、人口120万人；乙市总额360亿元、人口80万人。',
    stem: '人均可支配收入较高的是？',
    correct: '乙市高约0.5万元',
    distractors: ['甲市高约0.5万元', '两市相同', '甲市高约1万元'],
    explanation: '甲人均=480/120=4；乙=360/80=4.5；乙高0.5万元。答案为乙市高约0.5万元。',
    evidenceSpans: ['480', '120', '360', '80'],
    method: '分别求人均再比较',
  },
  {
    skillId: 'multi-step-reverse',
    term: '已知均价与占比反推销量',
    passage:
      '某品牌手机销售额占全店手机销售额的40%，全店手机销售额300万元，该品牌平均售价2500元/台。',
    stem: '该品牌约售出多少台？',
    correct: '480台',
    distractors: ['400台', '520台', '600台'],
    explanation: '该品牌销售额=300×40%=120万元=1200000元；台数=1200000/2500=480。答案为480台。',
    evidenceSpans: ['40%', '300', '2500'],
    method: '先求部分总量再÷均价',
  },
]

export function pickAverageBasicHardSeedTemplates(
  count: number,
): AverageBasicHardSeedTemplate[] {
  const pool = [...AVERAGE_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: AverageBasicHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildAverageBasicHardFromSeedTemplate(
  seed: AverageBasicHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): AverageBasicQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildAverageBasicQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeAverageBasicHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): AverageBasicQuestion[] {
  if (need <= 0) return []
  const pool = [...AVERAGE_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: AverageBasicQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildAverageBasicHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildAverageBasicHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderAverageBasicPassageHtml }
