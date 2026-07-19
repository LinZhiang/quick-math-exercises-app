/**
 * 资料分析 · 拉动增长和比例
 * 拉动……增长（百分点）=部分增长量/整体基期值；
 * 贡献率=部分增长量/整体增长量；
 * 利润率=利润/收入，升降看两增速比较，变化量≈现期利润率×(q利−q收)/(1+q利)。
 * 简单/复杂均为纯文字无表；简单略易，复杂对齐教材或更难。
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

export type PullDifficulty = DataAnalysisDifficulty

export const PULL_QUESTION_COUNT = 5

export const PULL_MODES: {
  id: PullDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '拉动增长和比例 · 简单',
    desc: '每轮 5 题 · 纯文字 · 拉动/贡献率/利润率直算 · 略易 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '拉动增长和比例 · 复杂',
    desc: '每轮 5 题 · 纯文字 · 由现期与增速多步推算 · 对齐教材或更难 · 仅豆包 · 正计时停表看答案',
  },
]

export type PullQuestion = {
  id: string
  topic: 'pull'
  difficulty: PullDifficulty
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

export function pullTopicLabel(): string {
  return '拉动增长和比例'
}

export function pullDifficultyLabel(d: PullDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

export type PullEasySkillId =
  | 'pull-direct'
  | 'contrib-direct'
  | 'profit-rate'
  | 'pull-from-points'
  | 'rate-dir'

export type PullEasySkillSlot = {
  id: PullEasySkillId
  label: string
  prompt: string
}

export const PULL_EASY_SKILL_SLOTS: PullEasySkillSlot[] = [
  {
    id: 'pull-direct',
    label: '拉动增长直算',
    prompt: '已知部分增长量与整体基期，拉动=部分增量/整体基期（百分点）。数字好除。',
  },
  {
    id: 'contrib-direct',
    label: '贡献率直算',
    prompt: '已知部分增量与整体增量，贡献率=部分增量/整体增量。',
  },
  {
    id: 'profit-rate',
    label: '利润率直算',
    prompt: '利润率=利润/收入。数字好除。',
  },
  {
    id: 'pull-from-points',
    label: '由拉动点数求部分增量',
    prompt: '部分增量=整体基期×拉动百分点/100。',
  },
  {
    id: 'rate-dir',
    label: '利润率升降判断',
    prompt: '只比较利润增速与收入增速：q利>q收则利润率上升。',
  },
]

export function pickPullEasySkillPlan(count: number): PullEasySkillSlot[] {
  const out: PullEasySkillSlot[] = []
  while (out.length < count) {
    const wave = [...PULL_EASY_SKILL_SLOTS]
    shuffleInPlace(wave)
    out.push(...wave)
  }
  return out.slice(0, count)
}

export function detectPullEasySkillId(q: {
  stem: string
  explanation: string
}): PullEasySkillId | null {
  const s = `${q.stem}${q.explanation}`
  if (/贡献率/.test(s)) return 'contrib-direct'
  if (/利润率/.test(s) && /上升|下降/.test(s) && !/百分点/.test(s)) return 'rate-dir'
  if (/利润率/.test(s)) return 'profit-rate'
  if (/拉动/.test(s) && /增量|增长量/.test(s) && /基期|×/.test(s)) return 'pull-from-points'
  return 'pull-direct'
}

export type PullHardSkillId =
  | 'pull-multi'
  | 'contrib-multi'
  | 'profit-change'
  | 'pull-reverse'
  | 'contrib-approx'

export const PULL_HARD_SKILL_SLOTS: {
  id: PullHardSkillId
  label: string
  prompt: string
}[] = [
  {
    id: 'pull-multi',
    label: '拉动增长多步',
    prompt:
      '仿六大重点行业：由部分/整体现期与增速先求部分增量与整体基期，再求拉动百分点。难度≥教材。',
  },
  {
    id: 'contrib-multi',
    label: '贡献率多步',
    prompt:
      '仿个人住房贷款：贡献率=A/B×qA/qB×(1+qB)/(1+qA)。选项贴近。',
  },
  {
    id: 'profit-change',
    label: '利润率升降定量',
    prompt:
      '仿软件业：先判升降，再估 Δ≈现期利润率×(q利−q收)/(1+q利)（百分点）。',
  },
  {
    id: 'pull-reverse',
    label: '已知拉动反推部分增量',
    prompt: '已知整体基期与拉动点数，求部分增长量；需估算。',
  },
  {
    id: 'contrib-approx',
    label: '贡献率特征估',
    prompt: '用截位/特征分数估算两增长量之比，难度高于直算。',
  },
]

export function getPullFingerprint(input: {
  difficulty: PullDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  return [
    'pull',
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    [...input.options].map((x) => x.trim()).sort().join('\u001f'),
    String(input.correctIndex),
  ].join('\u001e')
}

export function isPlayablePullMcq(q: {
  options: string[]
  correctIndex: number
}): boolean {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex >= 4) return false
  const norms = q.options.map((o) => o.trim().replace(/\s+/g, ''))
  if (norms.some((n) => !n) || new Set(norms).size !== 4) return false
  if (
    q.options.filter((o) => /\d/.test(o) || /上升|下降|无法计算/.test(o)).length >= 2
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
  for (const d of [0.5, 1, 2, -1, 3]) {
    if (out.length >= 3 || !Number.isFinite(num)) break
    const t = `${Math.round((num + d) * 10) / 10}${unit}`
    if (seen.has(t.replace(/\s+/g, ''))) continue
    seen.add(t.replace(/\s+/g, ''))
    out.push(t)
  }
  while (out.length < 3) out.push(`${c}·干${out.length + 1}`)
  return out.slice(0, 3)
}

export function buildPullQuestionFromMcq(input: {
  difficulty: PullDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): PullQuestion | null {
  const term = input.term.trim() || '拉动增长和比例'
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
    explanation = `按拉动增长或贡献率/利润率公式计算，答案为 ${correct}。`
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

  const fingerprint = getPullFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
  })

  const q: PullQuestion = {
    id: `pull-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topic: 'pull',
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
  if (!isPlayablePullMcq(q)) return null
  return q
}

export function parsePullMcqAiObject(item: unknown): {
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
    term: String(o.term ?? '').trim() || '拉动增长和比例',
    passage: String(o.passage ?? o.material ?? '').trim(),
    stem,
    correct: picked.correct,
    distractors: coerceDistractors(picked.correct, picked.distractors),
    explanation: String(o.explanation ?? '').trim(),
    evidenceSpans: o.evidenceSpans ?? [],
    method: String(o.method ?? '').trim(),
  }
}

const PULL_EASY_SEEDS: Array<{
  skillId: PullEasySkillId
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
    skillId: 'pull-direct',
    term: '拉动增长直算',
    passage: '某市工业增加值上年基期为1000亿元。本年重点行业增加值增量共120亿元。',
    stem: '重点行业拉动全市工业增长约多少个百分点？',
    correct: '12个百分点',
    distractors: ['10个百分点', '14个百分点', '8个百分点'],
    explanation: '拉动=120/1000×100%=12个百分点。答案为12个百分点。',
    evidenceSpans: ['120', '1000'],
    method: '部分增量/整体基期',
  },
  {
    skillId: 'contrib-direct',
    term: '贡献率直算',
    passage: '全市产值增量200亿元，其中高技术产业增量80亿元。',
    stem: '高技术产业对全市产值增量的贡献率约为？',
    correct: '40%',
    distractors: ['30%', '50%', '25%'],
    explanation: '贡献率=80/200=40%。答案为40%。',
    evidenceSpans: ['80', '200'],
    method: '部分增量/整体增量',
  },
  {
    skillId: 'profit-rate',
    term: '利润率直算',
    passage: '某企业利润总额800万元，营业收入5000万元。',
    stem: '该企业利润率约为？',
    correct: '16%',
    distractors: ['14%', '18%', '20%'],
    explanation: '利润率=800/5000=16%。答案为16%。',
    evidenceSpans: ['800', '5000'],
    method: '利润/收入',
  },
  {
    skillId: 'pull-from-points',
    term: '由拉动点数求增量',
    passage: '某市上年工业增加值基期为2000亿元。已知某行业拉动全市工业增长5个百分点。',
    stem: '该行业增加值增量约为多少亿元？',
    correct: '100亿元',
    distractors: ['80亿元', '120亿元', '50亿元'],
    explanation: '增量=2000×5/100=100。答案为100亿元。',
    evidenceSpans: ['2000', '5'],
    method: '基期×拉动点/100',
  },
  {
    skillId: 'rate-dir',
    term: '利润率升降判断',
    passage: '某公司利润同比增长8%，营业收入同比增长12%。',
    stem: '与上年相比，该公司利润率：',
    correct: '下降',
    distractors: ['上升', '不变', '无法判断'],
    explanation: 'q利=8%<q收=12%，利润率下降。答案为下降。',
    evidenceSpans: ['8%', '12%'],
    method: '比较两增速',
  },
]

export function takePullEasyLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
  preferSkillIds: PullEasySkillId[] = [],
): PullQuestion[] {
  if (need <= 0) return []
  const prefer = new Set(preferSkillIds)
  const pool = [...PULL_EASY_SEEDS]
  shuffleInPlace(pool)
  pool.sort((a, b) => Number(prefer.has(b.skillId)) - Number(prefer.has(a.skillId)))
  const out: PullQuestion[] = []
  const used = new Set<PullEasySkillId>()
  let seq = seqStart
  const tryPush = (seed: (typeof pool)[number], allowDup: boolean) => {
    if (out.length >= need) return
    if (!allowDup && used.has(seed.skillId)) return
    const q = buildPullQuestionFromMcq({
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

export type PullHardSeedTemplate = {
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  evidenceSpans: string[]
  method: string
  skillId?: PullHardSkillId
}

const PULL_HARD_SEEDS: PullHardSeedTemplate[] = [
  {
    skillId: 'pull-multi',
    term: '六大行业拉动工业增长',
    passage:
      '2018年前三季度，A市规模以上工业增加值15777.56亿元，同比增长16.2%。其中六大重点行业增加值10282.8亿元，同比增长19.3%。',
    stem: '2018年前三季度六大重点行业拉动全市规模以上工业增长约多少个百分点？',
    correct: '12.3个百分点',
    distractors: ['14.2个百分点', '65.2个百分点', '无法计算'],
    explanation:
      '整体基期≈15777.56/1.162≈13578。部分增量≈10282.8/1.193×19.3%≈1664。拉动≈1664/13578≈12.3个百分点。答案为12.3个百分点。',
    evidenceSpans: ['15777.56', '16.2%', '10282.8', '19.3%'],
    method: '部分增量/整体基期',
  },
  {
    skillId: 'contrib-multi',
    term: '个人住房贷款贡献率',
    passage:
      '2017年6月末，人民币房地产贷款余额29.72万亿元，同比增长24.2%；其中个人住房贷款余额20.1万亿元，同比增长30.8%。',
    stem: '个人住房贷款余额增量对人民币房地产贷款余额增量的贡献率约为？',
    correct: '82%',
    distractors: ['80%', '90%', '89%'],
    explanation:
      '贡献率≈20.1/29.72×30.8%/24.2%×(1+24.2%)/(1+30.8%)≈0.676×1.273×1.242/1.308≈0.82。答案为82%。',
    evidenceSpans: ['29.72', '24.2%', '20.1', '30.8%'],
    method: '部分增量/整体增量',
  },
  {
    skillId: 'profit-change',
    term: '软件业利润率变化',
    passage:
      '2018年软件业务收入63061亿元，同比增长14.2%；利润总额8079亿元，同比增长9.7%。',
    stem: '2018年软件业务收入利润率比2017年：',
    correct: '下降约0.5个百分点',
    distractors: ['下降约1.5个百分点', '上升约0.5个百分点', '上升约1.5个百分点'],
    explanation:
      'q利9.7%<q收14.2%，利润率下降。现期利润率≈8079/63061≈12.8%。Δ≈12.8%×(9.7%−14.2%)/(1+9.7%)≈12.8%×(−4.5%)/1.097≈−0.52个百分点。答案为下降约0.5个百分点。',
    evidenceSpans: ['63061', '14.2%', '8079', '9.7%'],
    method: '先判升降再估百分点',
  },
  {
    skillId: 'pull-reverse',
    term: '已知拉动求部分增量',
    passage:
      '2017年某市工业增加值基期约13543亿元。已知重点产业拉动全市工业增长约8.5个百分点。',
    stem: '重点产业增加值增量最接近？',
    correct: '约1154亿元',
    distractors: ['约2604亿元', '约1138亿元', '约141亿元'],
    explanation: '增量≈13543×8.5/100≈1151≈1154。答案为约1154亿元。',
    evidenceSpans: ['13543', '8.5'],
    method: '基期×拉动点/100',
  },
  {
    skillId: 'contrib-approx',
    term: '两行业贡献率估算',
    passage:
      '全市产值现期5000亿元，同比+25%；甲行业现期1200亿元，同比+40%。',
    stem: '甲行业对全市产值增量的贡献率约为？',
    correct: '约34%',
    distractors: ['约24%', '约40%', '约30%'],
    explanation:
      '全市增量=5000×25%/1.25=1000；甲增量=1200×40%/1.4≈342.9；贡献率≈343/1000≈34%。答案为约34%。',
    evidenceSpans: ['5000', '25%', '1200', '40%'],
    method: '先算两增量再相比',
  },
]

export function pickPullHardSeedTemplates(count: number): PullHardSeedTemplate[] {
  const pool = [...PULL_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: PullHardSeedTemplate[] = []
  while (out.length < count) out.push(...pool)
  shuffleInPlace(out)
  return out.slice(0, count)
}

export function buildPullHardFromSeedTemplate(
  seed: PullHardSeedTemplate,
  seq: number,
  stemSuffix = '',
): PullQuestion | null {
  const { skillId: _s, ...fields } = seed
  return buildPullQuestionFromMcq({
    ...fields,
    stem: stemSuffix ? `${fields.stem}${stemSuffix}` : fields.stem,
    difficulty: 'hard',
    seq,
  })
}

export function takePullHardLocalSeeds(
  need: number,
  seqStart: number,
  avoidFingerprints: Set<string>,
): PullQuestion[] {
  if (need <= 0) return []
  const pool = [...PULL_HARD_SEEDS]
  shuffleInPlace(pool)
  const out: PullQuestion[] = []
  let seq = seqStart
  for (const seed of pool) {
    if (out.length >= need) break
    const q = buildPullHardFromSeedTemplate(seed, seq++)
    if (!q || avoidFingerprints.has(q.fingerprint)) continue
    out.push(q)
    avoidFingerprints.add(q.fingerprint)
  }
  if (out.length < need) {
    for (const seed of pool) {
      if (out.length >= need) break
      const q = buildPullHardFromSeedTemplate(seed, seq++, `（练习${seq}）`)
      if (!q) continue
      out.push(q)
      avoidFingerprints.add(q.fingerprint)
    }
  }
  return out
}

export { renderDataAnalysisPassageHtml as renderPullPassageHtml }
