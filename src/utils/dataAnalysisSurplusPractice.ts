/**
 * 资料分析 · 顺差与逆差
 * 进出口总额=进口+出口；顺差=出口−进口；逆差=进口−出口。
 * 简单：纯文字，略易；复杂：数据表，难度高于教材（多年筛选/比较/增速等）。
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

export type SurplusDifficulty = DataAnalysisDifficulty

export const SURPLUS_QUESTION_COUNT = 5

export const SURPLUS_MODES: {
  id: SurplusDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '顺差与逆差 · 简单',
    desc: '每轮 5 题 · 纯文字 · 顺逆差判断与求值 · 略易 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '顺差与逆差 · 复杂',
    desc: '每轮 5 题 · 数据表 · 多年筛选/比较/差额增速 · 难于教材 · 仅豆包 · 正计时停表看答案',
  },
]

export type SurplusTableSpec = GrowthAvgAnnualTableSpec

export type SurplusQuestion = {
  id: string
  topic: 'surplus'
  difficulty: SurplusDifficulty
  term: string
  passage: string
  table: SurplusTableSpec | null
  stem: string
  options: string[]
  correctIndex: number
  evidenceSpans: string[]
  method: string
  explanation: string
  fingerprint: string
}

export function surplusTopicLabel(): string {
  return '顺差与逆差'
}

export function surplusDifficultyLabel(d: SurplusDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type SurplusEasySkillId =
  | 'judge-surplus'
  | 'calc-surplus'
  | 'calc-deficit'
  | 'total-trade'
  | 'which-surplus'

export type SurplusEasySkillSlot = {
  id: SurplusEasySkillId
  label: string
  prompt: string
}

export const SURPLUS_EASY_SKILL_SLOTS: SurplusEasySkillSlot[] = [
  {
    id: 'judge-surplus',
    label: '顺逆差判断',
    prompt: '出口>进口为顺差，进口>出口为逆差。数字简明。',
  },
  {
    id: 'calc-surplus',
    label: '求顺差',
    prompt: '顺差=出口−进口。',
  },
  {
    id: 'calc-deficit',
    label: '求逆差',
    prompt: '逆差=进口−出口。',
  },
  {
    id: 'total-trade',
    label: '求进出口总额',
    prompt: '总额=进口+出口。',
  },
  {
    id: 'which-surplus',
    label: '哪方顺差',
    prompt: '给出两地进出口，判断谁顺差或谁差额更大（简单比较）。',
  },
]

export function pickSurplusEasySkillPlan(count: number): SurplusEasySkillSlot[] {
  const out: SurplusEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...SURPLUS_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectSurplusEasySkillId(q: {
  stem: string
  explanation: string
}): SurplusEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/总额|合计/.test(s)) return 'total-trade'
  if (/逆差/.test(s) && /求|约为|多少/.test(s)) return 'calc-deficit'
  if (/顺差/.test(s) && /求|约为|多少/.test(s)) return 'calc-surplus'
  if (/哪|谁|最大|更大/.test(s)) return 'which-surplus'
  return 'judge-surplus'
}

export type SurplusHardSkillId =
  | 'table-count-years'
  | 'table-max-gap'
  | 'table-gap-growth'
  | 'table-surplus-regions'
  | 'table-multi-step'

export const SURPLUS_HARD_SKILL_SLOTS: {
  id: SurplusHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'table-count-years',
    label: '多年差额筛选计数',
    prompt:
      '仿水果进出口：逐年算顺/逆差金额，统计满足阈值条件的年份个数。难度高于教材（条件更严或需兼看顺差逆差）。',
  },
  {
    id: 'table-max-gap',
    label: '最大顺差/逆差年份',
    prompt: '比较各年|出口−进口|或有符号差额，找最大/最小。',
  },
  {
    id: 'table-gap-growth',
    label: '差额同比变化',
    prompt: '求某年顺差或逆差比上年增长/扩大多少，或多步比较。',
  },
  {
    id: 'table-surplus-regions',
    label: '读表判断顺差地区',
    prompt: '仿与港台日贸易表：判断顺差地区并求总额或顺差额。',
  },
  {
    id: 'table-multi-step',
    label: '总额与差额综合',
    prompt: '同一表中既问进出口总额又问顺逆差，或先求差额再比较增速。',
  },
]

export function getSurplusFingerprint(input: {
  difficulty: SurplusDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  tableTitle?: string
}): string {
  return [
    'surplus',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.tableTitle ?? '',
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableSurplusMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (
    q.options.filter((o) => /\d/.test(o) || /顺差|逆差|香港|台湾|日本|无法/.test(o))
      .length >= 2
  ) {
    return true
  }
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
  for (const d of [1, 2, 0.5, -1, 3]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildSurplusQuestionFromMcq(input: {
  difficulty: SurplusDifficulty
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
}): SurplusQuestion | null {
  const term = input.term.trim() || '顺差与逆差'
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
    explanation = `按顺差/逆差公式计算，答案为 ${correct}。`
  }
  const math = /\d/.test(correct)
    ? validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
    : { ok: explanation.includes(correct) || /答案为/.test(explanation) }
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    [passage, table?.title].filter(Boolean).join('\n') || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getSurplusFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    tableTitle: table?.title,
  })

  const q: SurplusQuestion = {
    id: `surplus-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'surplus',
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
  if (!isPlayableSurplusMcq(q)) return null
  return q
}

export function parseSurplusMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '顺差与逆差',
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

const SURPLUS_EASY_SEEDS: Array<{
  skillId: SurplusEasySkillId
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
    skillId: 'judge-surplus',
    term: '顺逆差判断',
    passage: '某市对甲国出口80亿美元，进口50亿美元。',
    stem: '该市对甲国贸易为：',
    correct: '顺差',
    distractors: ['逆差', '平衡', '无法判断'],
    explanation: '出口80>进口50，为顺差。答案为顺差。',
    evidenceSpans: ['80', '50'],
    method: '出口与进口比较',
  },
  {
    skillId: 'calc-surplus',
    term: '求顺差金额',
    passage: '某省对日本出口62.2亿美元，进口28.7亿美元。',
    stem: '该省对日本贸易顺差约为多少亿美元？',
    correct: '33.5亿美元',
    distractors: ['90.9亿美元', '28.7亿美元', '62.2亿美元'],
    explanation: '顺差=62.2−28.7=33.5。答案为33.5亿美元。',
    evidenceSpans: ['62.2', '28.7'],
    method: '出口−进口',
  },
  {
    skillId: 'calc-deficit',
    term: '求逆差金额',
    passage: '某省对台湾出口10.8亿美元，进口58.2亿美元。',
    stem: '该省对台湾贸易逆差约为多少亿美元？',
    correct: '47.4亿美元',
    distractors: ['69.0亿美元', '10.8亿美元', '58.2亿美元'],
    explanation: '逆差=58.2−10.8=47.4。答案为47.4亿美元。',
    evidenceSpans: ['58.2', '10.8'],
    method: '进口−出口',
  },
  {
    skillId: 'total-trade',
    term: '求进出口总额',
    passage: '某地对香港出口36亿美元，进口1.4亿美元。',
    stem: '该地与香港进出口总额约为多少亿美元？',
    correct: '37.4亿美元',
    distractors: ['34.6亿美元', '36亿美元', '1.4亿美元'],
    explanation: '总额=36+1.4=37.4。答案为37.4亿美元。',
    evidenceSpans: ['36', '1.4'],
    method: '进口+出口',
  },
  {
    skillId: 'which-surplus',
    term: '比较谁顺差更大',
    passage: '甲地顺差20亿美元，乙地顺差15亿美元，丙地逆差8亿美元。',
    stem: '顺差最大的是？',
    correct: '甲地',
    distractors: ['乙地', '丙地', '无法判断'],
    explanation: '甲顺差20最大。答案为甲地。',
    evidenceSpans: ['20', '15', '8'],
    method: '比较顺差大小',
  },
]

export function takeSurplusEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: SurplusEasySkillId[] = [],
): SurplusQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...SURPLUS_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: SurplusQuestion[] = []
  const used = new Set<SurplusEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildSurplusQuestionFromMcq({
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

export type SurplusHardSeedTemplate = {
  term: string
  passage: string
  table: SurplusTableSpec
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: SurplusHardSkillId
}

const FRUIT_TABLE: SurplusTableSpec = {
  title: '2012—2017年我国水果进出口情况',
  unit: '万吨、亿美元',
  columns: ['年份', '进口数量', '进口金额', '出口数量', '出口金额'],
  rows: [
    [2012, 330.49, 38.05, 328.25, 37.72],
    [2013, 315.6, 40.95, 318.75, 41.73],
    [2014, 387.57, 51.41, 289.05, 43.18],
    [2015, 434.09, 60.13, 304.29, 51.62],
    [2016, 403.87, 58.64, 367.65, 55.0],
    [2017, 456.27, 63.79, 361.19, 53.41],
  ],
}

const REGION_TABLE: SurplusTableSpec = {
  title: '2019年某省对香港、台湾、日本进出口情况',
  unit: '亿美元、%',
  columns: ['国家/地区', '出口额', '出口同比%', '进口额', '进口同比%'],
  rows: [
    ['中国香港', 35.95, 8.2, 1.38, -3.1],
    ['中国台湾', 10.79, 5.0, 58.22, 12.4],
    ['日本', 62.2, 6.5, 28.72, 4.8],
  ],
}

const SURPLUS_HARD_SEEDS: SurplusHardSeedTemplate[] = [
  {
    skillId: 'table-count-years',
    term: '逆差扩大超5亿的年份数',
    passage:
      '根据下表，按进出口金额计算各年逆差（进口金额−出口金额，仅当进口>出口）。比教材“差额小于5”更难：需逐年算逆差并与上年逆差作差。',
    table: FRUIT_TABLE,
    stem: '在2014—2017年中，水果贸易逆差金额比上年扩大超过5亿美元的年份有几个？（上年若为顺差，则不计入“扩大”）',
    correct: '1个',
    distractors: ['2个', '3个', '0个'],
    explanation:
      '逆差：2013为顺差；2014:8.23（上年顺差，不计扩大）；2015:8.51−8.23=0.28；2016:3.64−8.51<0；2017:10.38−3.64=6.74>5。仅2017一年。答案为1个。',
    evidenceSpans: ['58.64', '55.00', '63.79', '53.41'],
    method: '逐年逆差再同比筛选',
  },
  {
    skillId: 'table-max-gap',
    term: '逆差占进口金额比重最大年份',
    passage: '根据下表进出口金额。先求逆差，再算逆差÷进口金额。',
    table: FRUIT_TABLE,
    stem: '2014—2017年，水果贸易逆差金额占当年进口金额比重最高的年份是？',
    correct: '2017年',
    distractors: ['2014年', '2015年', '2016年'],
    explanation:
      '逆差/进口：2014:8.23/51.41≈16.0%；2015:8.51/60.13≈14.2%；2016:3.64/58.64≈6.2%；2017:10.38/63.79≈16.3%，最高为2017。答案为2017年。',
    evidenceSpans: ['51.41', '43.18', '63.79', '53.41'],
    method: '逆差÷进口再比较',
  },
  {
    skillId: 'table-gap-growth',
    term: '逆差同比增长率',
    passage: '根据下表。先求两年逆差，再求增长率。',
    table: FRUIT_TABLE,
    stem: '2017年水果贸易逆差金额同比约增长百分之几？',
    correct: '约185%',
    distractors: ['约67%', '约100%', '约10%'],
    explanation:
      '2016逆差≈3.64，2017≈10.38；增长量≈6.74；增长率≈6.74/3.64≈185%。答案为约185%。',
    evidenceSpans: ['58.64', '55.00', '63.79', '53.41'],
    method: '逆差增长率=增长量/基期逆差',
  },
  {
    skillId: 'table-surplus-regions',
    term: '顺差地区总额与顺差合计',
    passage:
      '根据下表。仿教材港台日例：先找顺差地区，再求总额与顺差额，本题需两地区加总。',
    table: REGION_TABLE,
    stem: '2019年对存在贸易顺差的地区，进出口总额合计与顺差金额合计分别约为？',
    correct: '128.25亿；68.05亿',
    distractors: ['90.92亿；33.48亿', '37.33亿；34.57亿', '169.26亿；15.57亿'],
    explanation:
      '香港、日本顺差；台湾逆差。总额：(35.95+1.38)+(62.20+28.72)=37.33+90.92=128.25；顺差：(35.95−1.38)+(62.20−28.72)=34.57+33.48=68.05。答案为128.25亿；68.05亿。',
    evidenceSpans: ['35.95', '1.38', '62.20', '28.72'],
    method: '筛顺差地区后分别加总',
  },
  {
    skillId: 'table-multi-step',
    term: '顺差年总额与逆差年最大逆差',
    passage:
      '根据下表。需同时判断顺差/逆差年份，并分别比较总额与逆差金额。',
    table: FRUIT_TABLE,
    stem: '2012—2017年：贸易顺差年份的进出口总额，与逆差金额最大年份的逆差，二者相差约为多少亿美元？',
    correct: '约72.3亿美元',
    distractors: ['约82.7亿美元', '约10.4亿美元', '约92.0亿美元'],
    explanation:
      '顺差年仅2013，总额=40.95+41.73=82.68；逆差最大2017≈10.38；差≈82.68−10.38=72.3。答案为约72.3亿美元。',
    evidenceSpans: ['40.95', '41.73', '63.79', '53.41'],
    method: '顺差年总额−最大逆差',
  },
]

export function pickSurplusHardSeedTemplates(
  count: number,
): SurplusHardSeedTemplate[] {
  const pool = [...SURPLUS_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: SurplusHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildSurplusHardFromSeedTemplate(
  seed: SurplusHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): SurplusQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildSurplusQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeSurplusHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): SurplusQuestion[] {
  if (need <= 0) return []
  const pool = [...SURPLUS_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: SurplusQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildSurplusHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildSurplusHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderSurplusPassageHtml }
