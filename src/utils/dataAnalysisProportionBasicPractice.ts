/**
 * 资料分析 · 比重——基本公式
 * 考点：比重=部分/整体；部分=整体×比重；整体=部分/比重；连续占比 p1×p2。
 * 简单：纯文字；复杂：扇形图（可双图），难度≥教材真题。
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

export type ProportionBasicDifficulty = DataAnalysisDifficulty

export const PROPORTION_BASIC_QUESTION_COUNT = 5

export const PROPORTION_BASIC_MODES: {
  id: ProportionBasicDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '比重·基本公式 · 简单',
    desc: '每轮 5 题 · 纯文字 · 部分/整体、反推、连续占比 · 数字好算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '比重·基本公式 · 复杂',
    desc: '每轮 5 题 · 扇形图 · 读图多步求值/对比 · 难于教材例题 · 仅豆包 · 正计时停表看答案',
  },
]

export type ProportionPieSlice = {
  name: string
  /** 百分数，如 17 表示 17% */
  value: number
  color?: string
}

export type ProportionPieSpec = {
  title: string
  slices: ProportionPieSlice[]
  note?: string
}

export type ProportionBasicQuestion = {
  id: string
  topic: 'proportion-basic'
  difficulty: ProportionBasicDifficulty
  term: string
  passage: string
  /** 复杂题：一张或两张扇形图 */
  pies: ProportionPieSpec[]
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function proportionBasicTopicLabel(): string {
  return '比重·基本公式'
}

export function proportionBasicDifficultyLabel(d: ProportionBasicDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type ProportionBasicEasySkillId =
  | 'part-over-whole'
  | 'part-from-prop'
  | 'whole-from-prop'
  | 'continuous-prop'
  | 'sum-parts-prop'

export type ProportionBasicEasySkillSlot = {
  id: ProportionBasicEasySkillId
  label: string
  prompt: string
}

export const PROPORTION_BASIC_EASY_SKILL_SLOTS: ProportionBasicEasySkillSlot[] = [
  {
    id: 'part-over-whole',
    label: '求比重=部分/整体',
    prompt: '给出部分与整体，求比重百分数。仿马拉松前三省占比题，数字好算。',
  },
  {
    id: 'part-from-prop',
    label: '由比重求部分',
    prompt: '部分=整体×比重。',
  },
  {
    id: 'whole-from-prop',
    label: '由比重求整体',
    prompt: '整体=部分/比重。',
  },
  {
    id: 'continuous-prop',
    label: '连续占比',
    prompt: 'A占B为p1，B占C为p2，求A占C=p1×p2，或求A=C×p1×p2。',
  },
  {
    id: 'sum-parts-prop',
    label: '多部分合计占比',
    prompt: '若干部分相加再除以整体求合计比重。',
  },
]

export function pickProportionBasicEasySkillPlan(
  count: number,
): ProportionBasicEasySkillSlot[] {
  const out: ProportionBasicEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...PROPORTION_BASIC_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectProportionBasicEasySkillId(q: {
  stem: string
  explanation: string
}): ProportionBasicEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/连续|p1|占.*占/.test(s) && /×|乘/.test(s)) return 'continuous-prop'
  if (/合计|前三|之和/.test(s)) return 'sum-parts-prop'
  if (/整体|总量/.test(s) && /部分|比重/.test(s) && /\/|除/.test(s)) return 'whole-from-prop'
  if (/部分/.test(s) && /×|乘|比重/.test(s)) return 'part-from-prop'
  if (/比重|占/.test(s)) return 'part-over-whole'
  return null
}

export type ProportionBasicHardSkillId =
  | 'pie-value-from-slice'
  | 'pie-dual-compare'
  | 'pie-multi-step'
  | 'pie-sum-slices'
  | 'pie-continuous'

export const PROPORTION_BASIC_HARD_SKILL_SLOTS: {
  id: ProportionBasicHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'pie-value-from-slice',
    label: '读扇形由已知扇区求另一扇区量',
    prompt:
      '给一扇区绝对量与占比，求另一扇区量：先求整体=已知量/占比，再×目标占比。难度≥发电量真题，可多一步估算。',
  },
  {
    id: 'pie-dual-compare',
    label: '双扇形图对比',
    prompt: '两年/两种结构扇形图，问某类占比变化或结合绝对量对比；多步。',
  },
  {
    id: 'pie-multi-step',
    label: '扇形图多步推算',
    prompt: '读图取多个扇区，先合计占比再求量或比重；选项贴近。',
  },
  {
    id: 'pie-sum-slices',
    label: '多扇区合计比重',
    prompt: '若干扇区相加求合计占比；注意四舍五入说明。',
  },
  {
    id: 'pie-continuous',
    label: '扇形+连续占比',
    prompt: '图给一层占比，材料再给子项占该类比重，求子项占整体。',
  },
]

export function getProportionBasicFingerprint(input: {
  difficulty: ProportionBasicDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  pieTitles?: string
}): string {
  return [
    'proportion-basic',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.pieTitles ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableProportionBasicMcq(q: {
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

const PIE_COLORS = ['#0d9488', '#c2410c', '#2563eb', '#ca8a04', '#7c3aed', '#64748b', '#db2777']

export function parseProportionPieSpec(raw: unknown): ProportionPieSpec | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const title = String(o.title ?? '').trim()
  const slicesRaw = Array.isArray(o.slices) ? o.slices : Array.isArray(o.data) ? o.data : []
  const slices: ProportionPieSlice[] = []
  for (let i = 0; i < slicesRaw.length; i++) {
    const item = slicesRaw[i]
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const name = String(s.name ?? s.label ?? '').trim()
    const value = Number(s.value ?? s.percent ?? s.pct)
    if (!name || !Number.isFinite(value)) continue
    slices.push({
      name,
      value,
      color: String(s.color ?? '').trim() || PIE_COLORS[i % PIE_COLORS.length],
    })
  }
  if (!title || slices.length < 3) return null
  return {
    title,
    slices,
    note: String(o.note ?? '').trim() || undefined,
  }
}

export function parseProportionPies(raw: unknown): ProportionPieSpec[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(parseProportionPieSpec).filter((p): p is ProportionPieSpec => !!p)
  }
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.pies)) {
      return o.pies.map(parseProportionPieSpec).filter((p): p is ProportionPieSpec => !!p)
    }
    const one = parseProportionPieSpec(raw)
    return one ? [one] : []
  }
  return []
}

export function buildProportionBasicQuestionFromMcq(input: {
  difficulty: ProportionBasicDifficulty
  term: string
  passage?: string
  pies?: unknown
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): ProportionBasicQuestion | null {
  const term = input.term.trim() || '比重基本公式'
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  const distractors = coerceDistractors(
    correct,
    input.distractors.map((d) => d.trim()).filter(Boolean),
  )
  if (!stem || !correct || distractors.length !== 3) return null

  const pies =
    input.difficulty === 'hard' ? parseProportionPies(input.pies ?? null) : []
  if (input.difficulty === 'hard' && pies.length < 1) return null
  if (input.difficulty === 'easy' && passage.length < 8) return null

  const assembled = assembleFourChoiceMcq(correct, distractors, shuffleInPlace)
  if (!assembled) return null

  let explanation = (input.explanation ?? '').trim()
  if (!explanation) {
    if (input.difficulty !== 'easy') return null
    explanation = `按比重基本公式计算，答案为 ${correct}。`
  }
  const math = validateGrowthGeneralAnswerMath(correct, explanation, {
    soft: true,
  })
  if (!math.ok) return null

  const pieTitles = pies.map((p) => p.title).join('|')
  const evidenceSpans = normalizeGrowthEvidenceSpans(
    [passage, pieTitles].filter(Boolean).join('\n') || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getProportionBasicFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    pieTitles,
  })

  const q: ProportionBasicQuestion = {
    id: `proportion-basic-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'proportion-basic',
    difficulty: input.difficulty,
    term,
    passage,
    pies,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    evidenceSpans,
    method: String(input.method ?? '').trim().slice(0, 48),
    explanation,
    fingerprint,
  }
  if (!isPlayableProportionBasicMcq(q)) return null
  return q
}

export function parseProportionBasicMcqAiObject(item: unknown): {
  term: string
  passage: string
  pies: unknown
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
    term: String(o.term ?? '').trim() || '比重基本公式',
    passage: String(o.passage ?? o.material ?? '').trim(),
    pies: o.pies ?? o.pie ?? o.charts ?? null,
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const PROPORTION_BASIC_EASY_SEEDS: Array<{
  skillId: ProportionBasicEasySkillId
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
    skillId: 'sum-parts-prop',
    term: '前三省赛事占比',
    passage:
      '2019年中国大陆共举办马拉松及相关运动赛事1828场。浙江232场，江苏185场，北京117场。',
    stem: '2019年前三省（市）合计约占全国赛事的比重为？',
    correct: '29%',
    distractors: ['25%', '27%', '31%'],
    explanation: '(232+185+117)/1828=534/1828≈0.292≈29%。答案为29%。',
    evidenceSpans: ['1828', '232', '185', '117'],
    method: '部分之和/整体',
  },
  {
    skillId: 'part-over-whole',
    term: '单部分求比重',
    passage: '某市商品房销售面积800万平方米，其中住宅销售面积560万平方米。',
    stem: '住宅销售面积占全市商品房销售面积的比重约为？',
    correct: '70%',
    distractors: ['65%', '75%', '60%'],
    explanation: '560/800=0.7=70%。答案为70%。',
    evidenceSpans: ['800', '560'],
    method: '部分/整体',
  },
  {
    skillId: 'part-from-prop',
    term: '由比重求部分',
    passage: '某省出口总额500亿美元，机电产品占比18%。',
    stem: '机电产品出口额约为多少亿美元？',
    correct: '90亿美元',
    distractors: ['80亿美元', '100亿美元', '72亿美元'],
    explanation: '部分=500×18%=90。答案为90亿美元。',
    evidenceSpans: ['500', '18%'],
    method: '整体×比重',
  },
  {
    skillId: 'whole-from-prop',
    term: '由比重求整体',
    passage: '某县水果产量中苹果为120万吨，占水果总产量的40%。',
    stem: '该县水果总产量约为多少万吨？',
    correct: '300万吨',
    distractors: ['280万吨', '320万吨', '240万吨'],
    explanation: '整体=120/40%=300。答案为300万吨。',
    evidenceSpans: ['120', '40%'],
    method: '部分/比重',
  },
  {
    skillId: 'continuous-prop',
    term: '连续占比',
    passage:
      '某市高技术制造业增加值占工业增加值的25%，工业增加值占GDP的40%。',
    stem: '高技术制造业增加值约占GDP的比重为？',
    correct: '10%',
    distractors: ['15%', '8%', '12%'],
    explanation: '连续占比=25%×40%=10%。答案为10%。',
    evidenceSpans: ['25%', '40%'],
    method: 'p1×p2',
  },
]

export function takeProportionBasicEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: ProportionBasicEasySkillId[] = [],
): ProportionBasicQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...PROPORTION_BASIC_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: ProportionBasicQuestion[] = []
  const used = new Set<ProportionBasicEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const { skillId: _s, ...fields } = seed
    const q = buildProportionBasicQuestionFromMcq({
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

export type ProportionBasicHardSeedTemplate = {
  term: string
  passage: string
  pies: ProportionPieSpec[]
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: ProportionBasicHardSkillId
}

const PROPORTION_BASIC_HARD_SEEDS: ProportionBasicHardSeedTemplate[] = [
  {
    skillId: 'pie-value-from-slice',
    term: '发电量扇形求核电',
    passage:
      '根据下图。已知2010年中国水电发电量为6867亿千瓦时。求同年核电发电量（单位：亿千瓦时）。',
    pies: [
      {
        title: '中国2010年发电量结构',
        note: '因四舍五入，各项相加可能不等于100%',
        slices: [
          { name: '水电', value: 17 },
          { name: '风电', value: 1 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 0.07 },
          { name: '火电', value: 80 },
        ],
      },
    ],
    stem: '2010年核电发电量约为多少亿千瓦时？',
    correct: '808',
    distractors: ['583', '763', '926'],
    explanation:
      '整体=6867/17%。核电=6867/17%×2%=6867/8.5≈808。答案为808。',
    evidenceSpans: ['6867', '17%', '2%'],
    method: '整体=已知扇区/占比，再×目标占比',
  },
  {
    skillId: 'pie-dual-compare',
    term: '双扇形清洁能源占比变化',
    passage: '根据下列两图，比较风电+太阳能合计占比的变化。',
    pies: [
      {
        title: '中国2010年发电量结构',
        slices: [
          { name: '水电', value: 17 },
          { name: '风电', value: 1 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 0.07 },
          { name: '火电', value: 80 },
        ],
      },
      {
        title: '中国2020年发电量预测结构',
        slices: [
          { name: '水电', value: 18 },
          { name: '风电', value: 7 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 6 },
          { name: '火电', value: 67 },
        ],
      },
    ],
    stem: '2020年预测中，风电与太阳能合计占比约比2010年提高多少个百分点？',
    correct: '12个百分点',
    distractors: ['8个百分点', '10个百分点', '14个百分点'],
    explanation:
      '2010年：1+0.07≈1.07；2020年：7+6=13；提高约13-1≈12个百分点。答案为12个百分点。',
    evidenceSpans: ['1%', '0.07%', '7%', '6%'],
    method: '双图扇区相加再作差',
  },
  {
    skillId: 'pie-multi-step',
    term: '扇形求非化石合计电量',
    passage:
      '根据下图。若2010年火电发电量为32320亿千瓦时，求水电、风电、核电、太阳能合计发电量约多少亿千瓦时。',
    pies: [
      {
        title: '中国2010年发电量结构',
        slices: [
          { name: '水电', value: 17 },
          { name: '风电', value: 1 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 0.07 },
          { name: '火电', value: 80 },
        ],
      },
    ],
    stem: '四类非火电合计发电量约为多少亿千瓦时？',
    correct: '8080',
    distractors: ['6464', '9680', '4040'],
    explanation:
      '整体=32320/80%=40400。非火电占比≈20%；40400×20%=8080。答案为8080。',
    evidenceSpans: ['32320', '80%'],
    method: '先求整体再×合计占比',
  },
  {
    skillId: 'pie-sum-slices',
    term: '新能源扇区合计',
    passage: '根据2020年预测扇形图，风电、核电、太阳能合计约占？',
    pies: [
      {
        title: '中国2020年发电量预测结构',
        slices: [
          { name: '水电', value: 18 },
          { name: '风电', value: 7 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 6 },
          { name: '火电', value: 67 },
        ],
      },
    ],
    stem: '风电、核电与太阳能合计占比约为？',
    correct: '15%',
    distractors: ['13%', '17%', '11%'],
    explanation: '7+2+6=15。答案为15%。',
    evidenceSpans: ['7%', '2%', '6%'],
    method: '扇区相加',
  },
  {
    skillId: 'pie-continuous',
    term: '扇形+连续占比',
    passage:
      '根据下图火电占发电量80%。已知其中燃煤发电占火电的90%。若当年发电总量为4万亿千瓦时，燃煤发电约为多少万亿千瓦时？',
    pies: [
      {
        title: '中国2010年发电量结构',
        slices: [
          { name: '水电', value: 17 },
          { name: '风电', value: 1 },
          { name: '核电', value: 2 },
          { name: '太阳能', value: 0.07 },
          { name: '火电', value: 80 },
        ],
      },
    ],
    stem: '燃煤发电量约为多少万亿千瓦时？',
    correct: '2.88',
    distractors: ['3.2', '2.4', '3.6'],
    explanation: '燃煤占整体=80%×90%=72%；4×72%=2.88。答案为2.88。',
    evidenceSpans: ['80%', '90%', '4'],
    method: '扇形占比×子占比',
  },
]

export function pickProportionBasicHardSeedTemplates(
  count: number,
): ProportionBasicHardSeedTemplate[] {
  const pool = [...PROPORTION_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: ProportionBasicHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildProportionBasicHardFromSeedTemplate(
  seed: ProportionBasicHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): ProportionBasicQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildProportionBasicQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeProportionBasicHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): ProportionBasicQuestion[] {
  if (need <= 0) return []
  const pool = [...PROPORTION_BASIC_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: ProportionBasicQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildProportionBasicHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildProportionBasicHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderProportionBasicPassageHtml }
