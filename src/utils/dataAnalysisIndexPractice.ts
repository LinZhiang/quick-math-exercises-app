/**
 * 资料分析 · 指数
 * 考点：现期/基期 = 指数/100；增长率=(指数−100)%；倍数=指数/100；
 * 指数差（点）数值上等于增长率差×100。
 * 简单/复杂均为纯文字无表；简单略易，复杂对齐教材景气指数题或更难。
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

export type IndexDifficulty = DataAnalysisDifficulty

export const INDEX_QUESTION_COUNT = 5

export const INDEX_MODES: {
  id: IndexDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '指数 · 简单',
    desc: '每轮 5 题 · 纯文字 · 指数↔增速/倍数/现期值 · 略易 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '指数 · 复杂',
    desc: '每轮 5 题 · 纯文字 · 点数升降反推/多分类比较 · 对齐教材或更难 · 仅豆包 · 正计时停表看答案',
  },
]

export type IndexQuestion = {
  id: string
  topic: 'index'
  difficulty: IndexDifficulty
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

export function indexTopicLabel(): string {
  return '指数'
}

export function indexDifficultyLabel(d: IndexDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type IndexEasySkillId =
  | 'index-to-value'
  | 'index-to-growth'
  | 'index-to-multiple'
  | 'growth-to-index'
  | 'index-direction'

export type IndexEasySkillSlot = {
  id: IndexEasySkillId
  label: string
  prompt: string
}

export const INDEX_EASY_SKILL_SLOTS: IndexEasySkillSlot[] = [
  {
    id: 'index-to-value',
    label: '由指数求现期值',
    prompt: '现期=基期×指数/100。数字整除，略易。',
  },
  {
    id: 'index-to-growth',
    label: '指数化增长率',
    prompt: '增长率=(指数−100)%；>100上升，<100下降。',
  },
  {
    id: 'index-to-multiple',
    label: '指数化倍数',
    prompt: '倍数=指数/100。',
  },
  {
    id: 'growth-to-index',
    label: '由增速求指数',
    prompt: '指数=100+增速百分数（如增2.3%→102.3）。',
  },
  {
    id: 'index-direction',
    label: '升降判断',
    prompt: '只根据指数与100比较判断升/降/平。',
  },
]

export function pickIndexEasySkillPlan(count: number): IndexEasySkillSlot[] {
  const out: IndexEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...INDEX_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectIndexEasySkillId(q: {
  stem: string
  explanation: string
}): IndexEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/倍数|\/100/.test(s) && /倍/.test(s)) return 'index-to-multiple'
  if (/现期|产量|×|基期/.test(s) && /指数/.test(s)) return 'index-to-value'
  if (/求.*指数|指数为|指数是/.test(s) && /增长|下降/.test(s)) return 'growth-to-index'
  if (/上升|下降|持平|不变/.test(s) && !/%/.test(s)) return 'index-direction'
  return 'index-to-growth'
}

export type IndexHardSkillId =
  | 'points-reverse'
  | 'points-compare'
  | 'multi-category'
  | 'points-vs-growth'
  | 'index-growth-pct'

export const INDEX_HARD_SKILL_SLOTS: {
  id: IndexHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'points-reverse',
    label: '点数升降反推上期指数',
    prompt:
      '仿景气指数：现期指数±点数得上期。注意「高/低」方向，选项含加减反号干扰。',
  },
  {
    id: 'points-compare',
    label: '比较点数变化幅度',
    prompt: '多地区/规模给出点数变化，问升幅最小或降幅最大等。',
  },
  {
    id: 'multi-category',
    label: '多分类材料定位',
    prompt: '材料含总体、规模、地区等多组指数，须定位正确项再算。',
  },
  {
    id: 'points-vs-growth',
    label: '指数差与增长率差',
    prompt: '指数相差n点 ⇔ 增长率相差n个百分点；结合两指数作差。',
  },
  {
    id: 'index-growth-pct',
    label: '由指数求同比增速',
    prompt: '指数128→同比增28%；可与上期点数信息组合多步。',
  },
]

export function getIndexFingerprint(input: {
  difficulty: IndexDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  return [
    'index',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayableIndexMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (
    q.options.filter((o) => /\d/.test(o) || /上升|下降|持平|东部|中部|西部|大型|中型|小型/.test(o))
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
  for (const d of [0.5, 1, 2, -1, 3, -2]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildIndexQuestionFromMcq(input: {
  difficulty: IndexDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): IndexQuestion | null {
  const term = input.term.trim() || '指数'
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
    explanation = `按指数与实际值关系计算，答案为 ${correct}。`
  }
  const math = /\d/.test(correct)
    ? validateGrowthGeneralAnswerMath(correct, explanation, { soft: true })
    : { ok: explanation.includes(correct) || /答案为/.test(explanation) }
  if (!math.ok) return null

  const evidenceSpans = normalizeGrowthEvidenceSpans(
    passage || stem,
    input.evidenceSpans,
    stem,
    explanation,
  )

  const fingerprint = getIndexFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
  })

  const q: IndexQuestion = {
    id: `index-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'index',
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
  if (!isPlayableIndexMcq(q)) return null
  return q
}

export function parseIndexMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '指数',
    passage: String(o.passage ?? o.material ?? '').trim(),
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const INDEX_EASY_SEEDS: Array<{
  skillId: IndexEasySkillId
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
    skillId: 'index-to-value',
    term: '棉花产量指数求现期',
    passage: '2019年棉花产量指数为150（以上年为100）。2018年棉花产量为80万吨。',
    stem: '2019年棉花产量为多少万吨？',
    correct: '120万吨',
    distractors: ['100万吨', '150万吨', '80万吨'],
    explanation: '现期=80×150/100=120。答案为120万吨。',
    evidenceSpans: ['150', '80'],
    method: '基期×指数/100',
  },
  {
    skillId: 'index-to-growth',
    term: '价格指数化增速',
    passage: '某商品价格指数为102.3（以上年为100）。',
    stem: '该商品价格同比约：',
    correct: '上涨2.3%',
    distractors: ['上涨102.3%', '下降2.3%', '上涨0.23%'],
    explanation: '增长率=(102.3−100)%=2.3%。答案为上涨2.3%。',
    evidenceSpans: ['102.3'],
    method: '(指数−100)%',
  },
  {
    skillId: 'index-to-multiple',
    term: '指数化倍数',
    passage: '某行业产值指数为250（以基期为100）。',
    stem: '现期产值约是基期的多少倍？',
    correct: '2.5倍',
    distractors: ['1.5倍', '250倍', '0.25倍'],
    explanation: '倍数=250/100=2.5。答案为2.5倍。',
    evidenceSpans: ['250'],
    method: '指数/100',
  },
  {
    skillId: 'growth-to-index',
    term: '由增速求指数',
    passage: '某市固定资产投资同比下降0.5%。',
    stem: '若以上年为100，投资指数约为？',
    correct: '99.5',
    distractors: ['100.5', '95', '0.5'],
    explanation: '指数=100−0.5=99.5。答案为99.5。',
    evidenceSpans: ['0.5%'],
    method: '100+增速',
  },
  {
    skillId: 'index-direction',
    term: '指数升降判断',
    passage: '某产品产量指数为98.2（以上年为100）。',
    stem: '与上年相比，该产品产量：',
    correct: '下降',
    distractors: ['上升', '持平', '无法判断'],
    explanation: '指数98.2<100，产量下降。答案为下降。',
    evidenceSpans: ['98.2'],
    method: '指数与100比较',
  },
]

export function takeIndexEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: IndexEasySkillId[] = [],
): IndexQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...INDEX_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: IndexQuestion[] = []
  const used = new Set<IndexEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildIndexQuestionFromMcq({
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

export type IndexHardSeedTemplate = {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: IndexHardSkillId
}

const CLIMATE_PASSAGE =
  '2017年一季度，全国工业企业景气指数为128.0，比上年四季度上升3.7点。其中，现状指数为122.5，比上年四季度下降6.1点。按企业规模看，大型企业132.5（降0.6点），中型企业129.4（升3.5点），小型企业121.0（升5.3点）。按区域看，东部129.9（升4.4点），中部129.3（升2.3点），西部118.3（升2.6点）。'

const INDEX_HARD_SEEDS: IndexHardSeedTemplate[] = [
  {
    skillId: 'points-reverse',
    term: '反推中型企业上期景气指数',
    passage: CLIMATE_PASSAGE,
    stem: '2016年四季度中型工业企业景气指数约为？',
    correct: '125.9',
    distractors: ['132.9', '129.4', '122.9'],
    explanation:
      '现期129.4，比上期升3.5点，上期=129.4−3.5=125.9。勿加得132.9。答案为125.9。',
    evidenceSpans: ['129.4', '3.5'],
    method: '现期−升点数',
  },
  {
    skillId: 'points-compare',
    term: '区域升幅最小',
    passage: CLIMATE_PASSAGE,
    stem: '与上年四季度相比，下列区域景气指数升幅（点数）最小的是？',
    correct: '中部',
    distractors: ['东部', '西部', '无法判断'],
    explanation: '东部+4.4、中部+2.3、西部+2.6，中部升幅最小。答案为中部。',
    evidenceSpans: ['4.4', '2.3', '2.6'],
    method: '比较点数变化',
  },
  {
    skillId: 'index-growth-pct',
    term: '总体指数化同比增速',
    passage: CLIMATE_PASSAGE,
    stem: '2017年一季度全国工业企业景气指数同比（相对上年同期为100的口径）约增长？',
    correct: '28%',
    distractors: ['3.7%', '28点', '128%'],
    explanation:
      '指数128.0→相对基期100增长(128−100)%=28%。3.7点是环比点数，非同比增速。答案为28%。',
    evidenceSpans: ['128.0'],
    method: '(指数−100)%',
  },
  {
    skillId: 'multi-category',
    term: '小型企业上期指数',
    passage: CLIMATE_PASSAGE,
    stem: '2016年四季度小型工业企业景气指数约为？',
    correct: '115.7',
    distractors: ['126.3', '121.0', '128.0'],
    explanation: '现期121.0升5.3点，上期=121.0−5.3=115.7。答案为115.7。',
    evidenceSpans: ['121.0', '5.3'],
    method: '定位规模行再反推',
  },
  {
    skillId: 'points-vs-growth',
    term: '现状与总体指数差',
    passage: CLIMATE_PASSAGE,
    stem: '2017年一季度现状指数比总体景气指数约低多少点？对应增长率约低多少个百分点？',
    correct: '低5.5点，约低5.5个百分点',
    distractors: ['低5.5点，约低0.055个百分点', '低6.1点，约低6.1个百分点', '低3.7点，约低3.7个百分点'],
    explanation:
      '128.0−122.5=5.5点；指数差n点对应增长率差n个百分点。答案为低5.5点，约低5.5个百分点。',
    evidenceSpans: ['128.0', '122.5'],
    method: '指数差=增长率差（百分点）',
  },
]

export function pickIndexHardSeedTemplates(count: number): IndexHardSeedTemplate[] {
  const pool = [...INDEX_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: IndexHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildIndexHardFromSeedTemplate(
  seed: IndexHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): IndexQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildIndexQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takeIndexHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): IndexQuestion[] {
  if (need <= 0) return []
  const pool = [...INDEX_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: IndexQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildIndexHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildIndexHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderIndexPassageHtml }
