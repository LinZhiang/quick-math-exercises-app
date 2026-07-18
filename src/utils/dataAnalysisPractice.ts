/**
 * 资料分析 · 百分数与百分点
 * 题型参照公考/事业编资料分析教材：基期比重/增长率、百分点加减、增速比较。
 */
import {
  assembleFourChoiceMcq,
  extractMcqCorrectAndDistractors,
  isPlayableFourChoiceMcq,
} from '@/utils/chineseMcqAiFields'

export type DataAnalysisDifficulty = 'easy' | 'hard'

export type DataAnalysisTopic = 'percent-point'

export const DATA_ANALYSIS_QUESTION_COUNT = 5

export const DATA_ANALYSIS_MODES: {
  id: DataAnalysisDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '百分数与百分点 · 简单',
    desc: '每轮 5 题 · 直接求百分点差、由现期±百分点还原基期比重/增速 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '百分数与百分点 · 复杂',
    desc: '每轮 5 题 · 多指标短材料，常需先还原再比差/两步运算，含迷惑条件 · 正计时停表看答案',
  },
]

export type DataAnalysisQuestion = {
  id: string
  topic: DataAnalysisTopic
  difficulty: DataAnalysisDifficulty
  /** 材料主题/考点标签，如「恩格尔系数」「进出口增速」 */
  term: string
  /** 复杂题短材料；简单题可为空 */
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  /**
   * 题干真正用到的材料原文片段（须为 passage 子串），提交后高亮。
   * 简单题无材料时可为空。
   */
  evidenceSpans: string[]
  /** 一句话做法名，如「两现期增速作差」「现期±百分点还原」 */
  method: string
  explanation: string
  fingerprint: string
}

/** 单条证据建议不超过此长度；过长则拆成数字/百分点短语 */
const DATA_ANALYSIS_EVIDENCE_MAX_LEN = 28

const DATA_ANALYSIS_EVIDENCE_ATOMIC_RES: RegExp[] = [
  /比(?:上年|去年|上月|上半年|同期|一季度|二季度|三季度|四季度|七月|八月|九月|[^\d%，。；、\s]{1,10})(?:提高|回落|加快|下降|降低|减少|增加|增长|上升)[-+]?\d+(?:\.\d+)?个百分点/g,
  /(?:提高|回落|加快|下降|降低|上涨)[-+]?\d+(?:\.\d+)?个百分点/g,
  /(?:同比|环比)?(?:增长|下降|提高|回落|加快|上涨)[-+]?\d+(?:\.\d+)?(?:[%％]|个百分点|亿元|万人|万吨|万公顷)?/g,
  /(?:比重|增速|涨幅|占比|增长率)为[-+]?\d+(?:\.\d+)?[%％]/g,
  /[-+]?\d+(?:\.\d+)?个百分点/g,
  /[-+]?\d+(?:\.\d+)?[%％]/g,
  /[-+]?\d+(?:\.\d+)?(?:万亿元|亿元|万人|万吨|万公顷|千克|万千瓦|亿平方米)/g,
]

function escapeRegExpLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 把裸数字扩成材料中带动词的完整数据短语 */
function enrichDataTokenInPassage(passage: string, token: string): string | null {
  let from = 0
  let best: string | null = null
  while (from < passage.length) {
    const idx = passage.indexOf(token, from)
    if (idx < 0) break
    const left = Math.max(0, idx - 16)
    const right = Math.min(passage.length, idx + token.length + 12)
    const windowLeft = passage.slice(left, idx + token.length)
    const windowFull = passage.slice(left, right)
    const m =
      windowFull.match(
        new RegExp(
          `(?:同比)?(?:增长|下降|提高|回落|加快|上涨|降低|增加|减少)${escapeRegExpLiteral(token)}(?:万亿元|万千瓦|亿元|万人|万吨|亿平方米|千克|万公顷|个百分点|[%％])?`,
        ),
      ) ||
      windowFull.match(
        new RegExp(
          `${escapeRegExpLiteral(token)}(?:万亿元|万千瓦|亿元|万人|万吨|亿平方米|千克|万公顷)`,
        ),
      ) ||
      windowLeft.match(
        new RegExp(
          `(?:比重|占比|增速|涨幅|增长率|失业率)为${escapeRegExpLiteral(token)}$`,
        ),
      ) ||
      windowLeft.match(
        new RegExp(
          `比[^，。；%]{1,12}(?:提高|回落|加快|下降|降低|减少|增加)${escapeRegExpLiteral(token)}$`,
        ),
      )
    if (m?.[0] && passage.includes(m[0]) && (!best || m[0].length > best.length)) {
      best = m[0]
    }
    from = idx + token.length
  }
  return best
}

/** 从过长原文中拆出可圈的关键短语（须仍为 passage 子串） */
export function extractDataAnalysisAtomicEvidence(chunk: string, passage: string): string[] {
  const p = String(passage ?? '')
  const src = String(chunk ?? '')
  if (!p || !src) return []
  const found = new Set<string>()
  for (const reSrc of DATA_ANALYSIS_EVIDENCE_ATOMIC_RES) {
    const re = new RegExp(reSrc.source, reSrc.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) != null) {
      const hit = m[0]
      if (!hit) break
      if (hit.length >= 2 && p.includes(hit)) found.add(hit)
      if (m.index === re.lastIndex) re.lastIndex++
    }
  }
  // 解析里只有「5.2%」时，优先圈材料里的「同比增长5.2%」「回落1.1个百分点」等完整短语
  for (const m of src.matchAll(/[-+]?\d+(?:\.\d+)?(?:[%％]|个百分点|万亿元|亿元|万人|万吨|万千瓦|亿平方米)/g)) {
    const token = m[0]!
    if (!p.includes(token)) continue
    const richer = enrichDataTokenInPassage(p, token)
    if (richer) found.add(richer)
    else if (token.length >= 2) found.add(token)
  }
  return [...found]
}

const DATA_ANALYSIS_SUBJECT_TAIL =
  '(?:类零售额|零售额|固定资产投资|资产投资|业务收入|销售收入|财政收入|出口额|进口额|增加值|销售额|产量|招生|人数|比重|占比|失业率|投资|企业|价格|制造业|装机容量|发电|货运量|销售面积)'

const DATA_ANALYSIS_SUBJECT_TAIL_RE = new RegExp(`${DATA_ANALYSIS_SUBJECT_TAIL}$`)

const DATA_ANALYSIS_SUBJECT_IN_TEXT_RE = new RegExp(
  `[\\u4e00-\\u9fff]{2,14}${DATA_ANALYSIS_SUBJECT_TAIL}`,
  'g',
)

function dataAnalysisEvidenceScore(s: string): number {
  let score = 0
  if (/(?:比重|增速|涨幅|占比|增长率)为/.test(s)) score += 40
  if (/比.+?(?:提高|回落|加快|下降|降低|减少|增加|增长|上升).+个百分点/.test(s)) score += 40
  if (/(?:同比)?(?:增长|下降|提高|回落|加快).+[%％]/.test(s)) score += 28
  if (/百分点/.test(s)) score += 12
  if (/[%％]/.test(s)) score += 8
  // 「针对谁」主体词：无数字，但有指标尾巴
  if (!/\d/.test(s) && DATA_ANALYSIS_SUBJECT_TAIL_RE.test(s)) {
    score += 36
  } else if (!/\d/.test(s) && s.length >= 4 && s.length <= 14) {
    score += 18
  }
  // 过短裸数字区分度差；过长接近整句
  if (/^[-+]?\d/.test(s) && s.length <= 8) score -= 18
  if (s.length > DATA_ANALYSIS_EVIDENCE_MAX_LEN) score -= 50
  score -= Math.max(0, s.length - 22)
  return score
}

function evidenceRangesOverlap(a: string, b: string, passage: string): boolean {
  const ia = passage.indexOf(a)
  const ib = passage.indexOf(b)
  if (ia < 0 || ib < 0) return a.includes(b) || b.includes(a)
  const a0 = ia
  const a1 = ia + a.length
  const b0 = ib
  const b1 = ib + b.length
  return a0 < b1 && b0 < a1
}

const DATA_ANALYSIS_STEM_STOP = new Set([
  '多少',
  '为多',
  '请问',
  '根据',
  '材料',
  '下列',
  '正确',
  '以下',
  '同比',
  '环比',
  '大约',
  '约是',
  '同比增长',
  '环比增长',
  '限额以上',
  '其中',
])

/** 题干内容词：用来丢掉与设问无关分句里的迷惑数字 */
function dataAnalysisStemContentTokens(stem: string): string[] {
  const s = String(stem ?? '')
  const tokens = new Set<string>()
  for (const m of s.matchAll(/[\u4e00-\u9fff]{2,8}/g)) {
    const t = m[0]!
    if (!DATA_ANALYSIS_STEM_STOP.has(t) && !/^第.+题$/.test(t)) tokens.add(t)
  }
  for (const m of s.matchAll(DATA_ANALYSIS_SUBJECT_IN_TEXT_RE)) {
    tokens.add(m[0]!)
  }
  for (const m of s.matchAll(/[\u4e00-\u9fff]{2,6}类(?:零售额|业务收入|销售额|收入)?/g)) {
    tokens.add(m[0]!)
  }
  for (const m of s.matchAll(/[\u4e00-\u9fff]{2,4}类/g)) {
    tokens.add(m[0]!)
  }
  return [...tokens]
}

/**
 * 从题干+材料抽取「针对谁」的主体词。
 * 支持：A类与B类、A比B高多少、全国/民间固定资产投资 等。
 */
export function extractDataAnalysisSubjectAnchors(passage: string, stem: string): string[] {
  const p = String(passage ?? '')
  const rawStem = String(stem ?? '')
  if (!p || !rawStem) return []

  const cleanSubject = (sub: string) => {
    let t = sub
    for (let i = 0; i < 4; i++) {
      const next = t
        .replace(/(?:同比|环比)?(?:增长|下降|提高|回落|加快|降低|增速)$/g, '')
        .replace(/(?:同比|环比)$/g, '')
      if (next === t) break
      t = next
    }
    return t
  }

  const isBareNoise = (label: string) =>
    /^(?:限额以上|其中|全国|民间|八月份?|七月份?|上半年|下半年)$/.test(label)

  const hits: string[] = []
  const pushHit = (raw: string) => {
    const sub = cleanSubject(raw.trim())
    if (sub.length < 4 || isBareNoise(sub)) return
    if (/限额以上|额以上|以上单位/.test(sub) && !/零售额|投资|收入|增加值/.test(sub)) return
    if (!p.includes(sub)) return
    if (!DATA_ANALYSIS_SUBJECT_TAIL_RE.test(sub) && !/类$/.test(sub)) return
    hits.push(sub)
  }

  // 1) 优先：材料中的主体短语，且题干也出现（最稳）
  DATA_ANALYSIS_SUBJECT_IN_TEXT_RE.lastIndex = 0
  for (const m of p.matchAll(DATA_ANALYSIS_SUBJECT_IN_TEXT_RE)) {
    const s = m[0]!
    if (rawStem.includes(s)) pushHit(s)
  }

  // 2) 「A比B高/低多少」「A同比增速比B」
  const cmpRate = rawStem.match(
    /([\u4e00-\u9fff]{4,16})(?:同比)?(?:增速|涨幅)?比([\u4e00-\u9fff]{4,16})(?:高|低|快|慢)多少/,
  )
  if (cmpRate) {
    pushHit(cmpRate[1]!)
    pushHit(cmpRate[2]!)
  }

  // 3) 「A与B相差 / A与B…」
  const cmpAnd = rawStem.match(
    /([\u4e00-\u9fff]{4,16})与([\u4e00-\u9fff]{4,16})/,
  )
  if (cmpAnd) {
    pushHit(cmpAnd[1]!)
    pushHit(cmpAnd[2]!)
  }

  // 4) 「A类与B类零售额」
  const cmpClass = rawStem.match(
    /([\u4e00-\u9fff]{2,4}类)\s*与\s*([\u4e00-\u9fff]{2,4}类)([\u4e00-\u9fff]{0,8})/,
  )
  if (cmpClass) {
    const sharedTail =
      (cmpClass[3] ?? '').match(/^(?:零售额|业务收入|销售收入|销售额|收入|投资)/)?.[0] ?? ''
    pushHit(cmpClass[1]! + sharedTail)
    pushHit(cmpClass[2]! + sharedTail)
    pushHit(cmpClass[1]!)
    pushHit(cmpClass[2]!)
  }

  // 去重：优先更长、带完整尾巴的
  hits.sort((a, b) => b.length - a.length)
  const out: string[] = []
  for (const h of hits) {
    if (out.some((x) => x.includes(h) || h.includes(x))) continue
    out.push(h)
    if (out.length >= 3) break
  }
  return out
}

function evidenceClauseOf(span: string, passage: string): string {
  const parts = String(passage).split(/[；;。\n]/)
  return parts.find((c) => c.includes(span)) ?? passage
}

/** 数据点归属：取材料中位于其前方、最近的主体 */
function subjectIndexForDataSpan(span: string, subjects: string[], passage: string): number {
  const dataPos = passage.indexOf(span)
  if (dataPos < 0 || !subjects.length) return -1
  let best = -1
  let bestPos = -1
  for (let i = 0; i < subjects.length; i++) {
    const sp = passage.indexOf(subjects[i]!)
    if (sp >= 0 && sp <= dataPos && sp >= bestPos) {
      bestPos = sp
      best = i
    }
  }
  return best
}

function evidenceLikelyForStem(span: string, passage: string, stem: string): boolean {
  const tokens = dataAnalysisStemContentTokens(stem)
  if (!tokens.length) return true
  const clause = evidenceClauseOf(span, passage)
  if (tokens.some((t) => span.includes(t) || clause.includes(t))) return true
  // 主体本身
  if (!/\d/.test(span) && stem.includes(span)) return true
  return false
}

function stemWantsTwoRateDiff(stem: string): boolean {
  return /相差|与.+比|比.+高多少|比.+低多少|快多少|慢多少/.test(stem)
}

/** 是否为主体词（无数字） */
export function isDataAnalysisSubjectSpan(span: string): boolean {
  return Boolean(span) && !/\d/.test(span)
}

/** 去掉解析里「忽略/迷惑」之后的干扰描述，高亮只跟真正解题句对齐 */
export function stripDataAnalysisDistractorClauses(explanation: string): string {
  let s = String(explanation ?? '')
  s = s.replace(/[；;。].{0,6}(?:忽略|无关|迷惑条件|不要用|勿用).*$/g, '')
  s = s.replace(/计算时忽略.*$/g, '')
  s = s.replace(/(?:与设问无关|迷惑条件).*$/g, '')
  return s.trim()
}

/** 解析中明确要求忽略的专名，不得圈入材料 */
export function extractDataAnalysisIgnoredSubjects(explanation: string): string[] {
  const exp = String(explanation ?? '')
  const parts =
    exp.match(/(?:忽略|无关|迷惑条件|不要用|勿用|勿取)[^。；]{0,100}/g) ?? []
  const out: string[] = []
  const push = (t: string) => {
    const s = t.trim()
    if (s.length >= 4 && !out.includes(s)) out.push(s)
  }
  for (const part of parts) {
    for (const m of part.matchAll(DATA_ANALYSIS_SUBJECT_IN_TEXT_RE)) push(m[0]!)
    for (const m of part.matchAll(
      /[\u4e00-\u9fff]{2,14}(?:企业|价格|收入|增加值|投资|失业率|零售额|制造业)/g,
    )) {
      push(m[0]!)
    }
  }
  return out
}

function isNoiseEvidenceSpan(s: string): boolean {
  return /^(?:八月份?|七月份?|前八个月|上半年|下半年|其中|全国|民间|限额以上|同比|环比|(?:同比|环比)?(?:增长|下降))$/.test(
    s,
  )
}

function spanAppearsInUsefulText(span: string, useful: string): boolean {
  if (!useful) return true
  if (useful.includes(span)) return true
  const nums = span.match(/\d+(?:\.\d+)?/g) ?? []
  if (nums.length && nums.every((n) => useful.includes(n))) return true
  return false
}

function isIgnoredSubjectSpan(span: string, ignored: string[]): boolean {
  if (!ignored.length) return false
  return ignored.some(
    (ig) => span === ig || (isDataAnalysisSubjectSpan(span) && (ig.includes(span) || span.includes(ig))),
  )
}

/** 从「真正解题」的解析句中抽取应在材料里圈出的原文 */
function extractEvidenceFromExplanation(
  passage: string,
  usefulExplanation: string,
  stem: string,
  ignored: string[] = [],
): string[] {
  const p = String(passage ?? '')
  const useful = String(usefulExplanation ?? '')
  if (!p || !useful) return []

  const hits: string[] = []
  const push = (raw: string) => {
    const t = raw.trim()
    if (t.length < 2 || !p.includes(t) || isNoiseEvidenceSpan(t)) return
    if (isIgnoredSubjectSpan(t, ignored)) return
    if (!hits.includes(t)) hits.push(t)
  }

  for (const atom of extractDataAnalysisAtomicEvidence(useful, p)) push(atom)

  // 「回落/加快×百分点」常写在解析里
  for (const m of useful.matchAll(
    /(?:提高|回落|加快|下降|降低|上涨)[-+]?\d+(?:\.\d+)?个百分点/g,
  )) {
    push(m[0]!)
  }

  for (const m of useful.matchAll(DATA_ANALYSIS_SUBJECT_IN_TEXT_RE)) push(m[0]!)
  for (const m of useful.matchAll(
    /[\u4e00-\u9fff]{2,14}(?:企业|价格|收入|增加值|投资|失业率|零售额|制造业)/g,
  )) {
    push(m[0]!)
  }

  // 题干主体仅当解析也点到时才圈（避免圈迷惑专名）
  for (const subj of extractDataAnalysisSubjectAnchors(p, stem)) {
    if (useful.includes(subj)) push(subj)
  }

  return hits
}

/**
 * 规范证据高亮：严格对齐解析真正用到的专名与数据。
 * - 优先从 explanation（去掉「忽略/迷惑」段）抽取
 * - AI 给的 spans 仅保留出现在解题句中的
 * - 不自动把材料里其它同名指标/加快回落圈进来
 */
export function normalizeDataAnalysisEvidenceSpans(
  passage: string,
  spans: unknown,
  stem = '',
  explanation = '',
): string[] {
  const p = String(passage ?? '')
  if (!p) return []

  const useful = stripDataAnalysisDistractorClauses(explanation)
  const ignored = extractDataAnalysisIgnoredSubjects(explanation)
  const candidates = new Set<string>()
  const push = (s: string) => {
    const t = s.trim()
    if (t.length < 2 || !p.includes(t) || isNoiseEvidenceSpan(t)) return
    if (isIgnoredSubjectSpan(t, ignored)) return
    if (useful && !spanAppearsInUsefulText(t, useful)) return
    candidates.add(t)
  }

  if (useful) {
    for (const s of extractEvidenceFromExplanation(p, useful, stem, ignored)) push(s)
  }

  const rawList = Array.isArray(spans)
    ? spans.map((s) => String(s ?? '').trim()).filter(Boolean)
    : []

  for (const raw of rawList) {
    if (useful && !spanAppearsInUsefulText(raw, useful)) {
      // 仍尝试拆出解析里出现过的原子数据
      for (const atom of extractDataAnalysisAtomicEvidence(raw, p)) {
        if (spanAppearsInUsefulText(atom, useful)) push(atom)
      }
      continue
    }
    if (!p.includes(raw)) {
      for (const atom of extractDataAnalysisAtomicEvidence(raw, p)) push(atom)
      continue
    }
    const glued =
      /\d/.test(raw) &&
      /(?:类零售额|零售额|固定资产投资|资产投资|业务收入|收入|增加值|销售额|投资|企业)/.test(
        raw,
      )
    if (!glued && raw.length <= DATA_ANALYSIS_EVIDENCE_MAX_LEN) {
      push(raw)
    } else if (glued) {
      const subj = raw.match(
        new RegExp(`^[\\u4e00-\\u9fff]{2,16}${DATA_ANALYSIS_SUBJECT_TAIL}`),
      )
      if (subj?.[0]) push(subj[0])
    }
    for (const atom of extractDataAnalysisAtomicEvidence(raw, p)) push(atom)
  }

  // 无解析时退化为题干主体 + 其紧邻数据（仍禁时期噪声）
  if (!useful) {
    const subjects = stem ? extractDataAnalysisSubjectAnchors(p, stem) : []
    for (const subj of subjects) push(subj)
    for (let si = 0; si < subjects.length; si++) {
      const subj = subjects[si]!
      const subjPos = p.indexOf(subj)
      const nextPos =
        si + 1 < subjects.length ? p.indexOf(subjects[si + 1]!, subjPos + subj.length) : -1
      const window =
        subjPos >= 0
          ? p.slice(subjPos, nextPos > subjPos ? nextPos : undefined)
          : evidenceClauseOf(subj, p)
      const growth = window.match(/(?:同比)?(?:增长|下降)[-+]?\d+(?:\.\d+)?[%％]/)?.[0]
      const share = window.match(/(?:比重|占比|增速|涨幅)为[-+]?\d+(?:\.\d+)?[%％]/)?.[0]
      const pp = window.match(
        /(?:提高|回落|加快|下降|降低)[-+]?\d+(?:\.\d+)?个百分点/,
      )?.[0]
      if (growth) push(growth)
      if (share) push(share)
      // 仅当题干需要还原时才圈加快/回落
      if (pp && /还原|基期|上月|上年|上半年|七月|八月/.test(stem)) push(pp)
    }
  }

  const ranked = [...candidates].sort(
    (a, b) => dataAnalysisEvidenceScore(b) - dataAnalysisEvidenceScore(a) || a.length - b.length,
  )

  const out: string[] = []
  for (const s of ranked) {
    if (dataAnalysisEvidenceScore(s) < -20) continue
    const conflictIdx = out.findIndex((x) => evidenceRangesOverlap(s, x, p))
    if (conflictIdx >= 0) {
      const prev = out[conflictIdx]!
      if (dataAnalysisEvidenceScore(s) > dataAnalysisEvidenceScore(prev)) {
        out[conflictIdx] = s
      }
      continue
    }
    out.push(s)
    if (out.length >= 8) break
  }

  out.sort((a, b) => p.indexOf(a) - p.indexOf(b))
  return out
}

function parseDataAnalysisNumericToken(raw: string): number | null {
  const m = String(raw ?? '').match(/([-+]?\d+(?:\.\d+)?)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function nearlyEqual(a: number, b: number, eps = 0.051): boolean {
  return Math.abs(a - b) <= eps
}

/**
 * 校验解析算式与标准答案是否算术正确。
 * - 文中所有「a±b=c」必须算对
 * - 最后一步算式结果须与 correct 一致
 * - 解析声称的最终百分点须与 correct 一致
 */
export function validateDataAnalysisAnswerMath(
  correct: string,
  explanation: string,
): { ok: boolean; reason?: string } {
  const expFull = String(explanation ?? '')
    .trim()
    .replace(/[−–—]/g, '-')
  if (!expFull) return { ok: false, reason: '缺少解析' }

  const correctNum = parseDataAnalysisNumericToken(correct)
  if (correctNum == null) return { ok: false, reason: '标准答案无法解析数值' }

  let exp = expFull
  let lastEqResult: number | null = null

  // (a±b)±(c±d)=e —— 先校验并抠掉，避免被简单式误匹配
  const nestedRe =
    /\(\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*([-+])\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)\s*=\s*([-+]?\d+(?:\.\d+)?)/g
  const nestedParts: { start: number; end: number }[] = []
  let nm: RegExpExecArray | null
  while ((nm = nestedRe.exec(expFull)) != null) {
    const a = Number(nm[1])
    const b = Number(nm[3])
    const c = Number(nm[5])
    const d = Number(nm[7])
    const left = nm[2] === '-' ? a - b : a + b
    const right = nm[6] === '-' ? c - d : c + d
    const expected = nm[4] === '-' ? left - right : left + right
    const claimed = Number(nm[8])
    if (!nearlyEqual(expected, claimed)) {
      return {
        ok: false,
        reason: `算式错误：(${a}${nm[2]}${b})${nm[4]}(${c}${nm[6]}${d})≠${claimed}`,
      }
    }
    lastEqResult = claimed
    nestedParts.push({ start: nm.index, end: nm.index + nm[0].length })
  }
  // 从后往前挖掉已校验的嵌套式
  for (let i = nestedParts.length - 1; i >= 0; i--) {
    const { start, end } = nestedParts[i]!
    exp = exp.slice(0, start) + ' '.repeat(end - start) + exp.slice(end)
  }

  // a ± b = c（含 a%-(-b%)、a%-b%）
  const simpleRe =
    /([-+]?\d+(?:\.\d+)?)\s*%?\s*([-+])\s*\(?\s*(-)?\s*([-+]?\d+(?:\.\d+)?)\s*%?\s*\)?\s*=\s*([-+]?\d+(?:\.\d+)?)/g
  let sm: RegExpExecArray | null
  let eqCount = nestedParts.length
  while ((sm = simpleRe.exec(exp)) != null) {
    eqCount += 1
    const a = Number(sm[1])
    const bRaw = Number(sm[4])
    const b = sm[3] === '-' ? -Math.abs(bRaw) : bRaw
    const claimed = Number(sm[5])
    const expected = sm[2] === '-' ? a - b : a + b
    if (!nearlyEqual(expected, claimed)) {
      return { ok: false, reason: `算式错误：${a}${sm[2]}${b}≠${claimed}` }
    }
    lastEqResult = claimed
  }

  if (lastEqResult != null && !nearlyEqual(lastEqResult, correctNum)) {
    return {
      ok: false,
      reason: `末步算式结果 ${lastEqResult} 与标准答案 ${correctNum} 不一致`,
    }
  }

  // 已有末步算式且与答案一致时，不再用文中其它「×个百分点」干扰项误杀
  if (lastEqResult != null) return { ok: true }

  const usefulForClaim = stripDataAnalysisDistractorClauses(expFull)
  const claimMatch =
    usefulForClaim.match(
      /(?:即|故|得|为|是|相差|差(?:为|是)?|答案)\s*([-+]?\d+(?:\.\d+)?)\s*个百分点/,
    ) ||
    usefulForClaim.match(/=\s*([-+]?\d+(?:\.\d+)?)\s*个百分点/) ||
    [...usefulForClaim.matchAll(/([-+]?\d+(?:\.\d+)?)\s*个百分点/g)].at(-1)

  if (claimMatch) {
    const claimedFinal = Number(claimMatch[1])
    if (Number.isFinite(claimedFinal) && !nearlyEqual(claimedFinal, correctNum)) {
      return {
        ok: false,
        reason: `解析结论 ${claimedFinal} 与标准答案 ${correctNum} 不一致`,
      }
    }
  } else if (eqCount === 0) {
    return { ok: false, reason: '解析缺少可校验算式' }
  }

  return { ok: true }
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 纯数字或「数字+单位」短核：渲染时用数字边界，避免「200」误命中「1200」 */
export function isNumericEvidenceSpan(span: string): boolean {
  const s = String(span ?? '').trim()
  if (!s) return false
  return /^[-+]?\d+(?:\.\d+)?(?:万亿元|万千瓦|亿元|万人|万吨|万公顷|千克|亿平方米|个百分点|[%％])?$/.test(
    s,
  )
}

/** 在正文中定位证据：裸数字必须左右非数字，防止子串误标 */
function findEvidenceSpanRanges(text: string, span: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = []
  if (!text || !span) return ranges
  if (/^[-+]?\d+(?:\.\d+)?$/.test(span)) {
    const re = new RegExp(`(?<![\\d.])${escapeRegExpLiteral(span)}(?![\\d.])`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) != null) {
      ranges.push({ start: m.index, end: m.index + m[0].length })
    }
    return ranges
  }
  if (isNumericEvidenceSpan(span)) {
    const re = new RegExp(`(?<![\\d.])${escapeRegExpLiteral(span)}`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) != null) {
      ranges.push({ start: m.index, end: m.index + m[0].length })
    }
    return ranges
  }
  let from = 0
  while (from < text.length) {
    const i = text.indexOf(span, from)
    if (i < 0) break
    ranges.push({ start: i, end: i + span.length })
    from = i + span.length
  }
  return ranges
}

/**
 * 在材料/题干/解析中高亮证据。主体与数据分色；多主体用 subject-0/1/2。
 * 数字类加 --num，圈在数字本身上（边界匹配）。
 */
export function renderDataAnalysisPassageHtml(
  textIn: string,
  evidenceSpans: string[],
  highlight: boolean,
  passageForTone?: string,
): string {
  const text = String(textIn ?? '')
  if (!text) return ''
  if (!highlight || !evidenceSpans?.length) return escapeHtmlText(text)

  const toneBase = passageForTone || text
  const subjects = evidenceSpans.filter((s) => isDataAnalysisSubjectSpan(s))

  type Hit = { start: number; end: number; cls: string; score: number; isNum: boolean }
  const hits: Hit[] = []
  for (const span of evidenceSpans) {
    if (!span) continue
    const isNum = isNumericEvidenceSpan(span)
    let cls: string
    if (isDataAnalysisSubjectSpan(span)) {
      let idx = subjects.findIndex((s) => s === span || s.includes(span) || span.includes(s))
      if (idx < 0) idx = 0
      cls = `da-evidence da-evidence--subject da-evidence--subject-${Math.min(idx, 2)}`
    } else {
      let idx = subjectIndexForDataSpan(span, subjects, toneBase)
      if (idx >= 0) {
        cls = `da-evidence da-evidence--data da-evidence--data-${Math.min(idx, 2)}`
      } else {
        cls = 'da-evidence da-evidence--data'
      }
      if (isNum) cls += ' da-evidence--num'
    }
    // 数字短核优先于长叙述下划线，避免叠标对不齐
    let score = dataAnalysisEvidenceScore(span)
    if (isNum) score += 50 - Math.min(span.length, 20)
    const ranges = findEvidenceSpanRanges(text, span)
    for (const r of ranges) {
      hits.push({ start: r.start, end: r.end, cls, score, isNum })
    }
  }
  if (!hits.length) return escapeHtmlText(text)

  hits.sort((a, b) => a.start - b.start || b.end - a.end || b.score - a.score)
  const merged: Hit[] = []
  for (const h of hits) {
    const last = merged[merged.length - 1]
    if (last && h.start < last.end) {
      // 重叠：数字圈优先；同级取更短更准
      if (h.isNum !== last.isNum) {
        if (h.isNum) merged[merged.length - 1] = h
      } else if (
        h.score > last.score ||
        (h.score === last.score && h.end - h.start < last.end - last.start)
      ) {
        merged[merged.length - 1] = h
      }
    } else {
      merged.push({ ...h })
    }
  }

  let html = ''
  let cursor = 0
  for (const h of merged) {
    if (h.start > cursor) html += escapeHtmlText(text.slice(cursor, h.start))
    html += `<mark class="${h.cls}">${escapeHtmlText(text.slice(h.start, h.end))}</mark>`
    cursor = h.end
  }
  if (cursor < text.length) html += escapeHtmlText(text.slice(cursor))
  return html
}

/** 题干高亮：只圈 evidenceSpans 里出现在题干中的专名/数据（不再另扩题干主体） */
export function resolveDataAnalysisStemHighlightSpans(
  stem: string,
  _passage: string,
  evidenceSpans: string[],
): string[] {
  const s = String(stem ?? '')
  const out: string[] = []
  const push = (t: string) => {
    if (!t || !s.includes(t) || out.includes(t)) return
    if (isNoiseEvidenceSpan(t)) return
    out.push(t)
  }
  for (const span of evidenceSpans) {
    if (s.includes(span)) push(span)
    // 「中西药品类零售额」→ 题干若只写「中西药品类」也可圈
    if (isDataAnalysisSubjectSpan(span)) {
      const m = span.match(/^(.+?类)(?:零售额|业务收入|收入|销售额)?$/)
      if (m?.[1] && s.includes(m[1])) push(m[1])
    }
  }
  return out
}

/** 解析高亮：只圈 evidenceSpans / 解题用数据，不把题干里无关专名带进来 */
export function resolveDataAnalysisExplainHighlightSpans(
  explanation: string,
  _passage: string,
  _stem: string,
  evidenceSpans: string[],
): string[] {
  const useful = stripDataAnalysisDistractorClauses(explanation)
  if (!useful) return []
  const out: string[] = []
  const push = (t: string) => {
    if (t && useful.includes(t) && !out.includes(t) && !isNoiseEvidenceSpan(t)) out.push(t)
  }

  for (const s of evidenceSpans) {
    if (useful.includes(s)) push(s)
  }
  for (const s of evidenceSpans) {
    const nums = s.match(/\d+(?:\.\d+)?/g) ?? []
    for (const n of nums) {
      if (!useful.includes(n)) continue
      // 禁止匹配「增速=200」「增长量：220」等残片；只圈材料式数据短语
      const re = new RegExp(
        `(?:同比|环比)?(?:增长|下降|增加|减少)了?${n}(?:[%％]|个百分点|万亿元|亿元|万人|万千瓦|万吨)?|增长量(?:为|是)?${n}(?:[%％]|个百分点|万亿元|亿元|万人|万千瓦|万吨)?|${n}(?:[%％]|个百分点|万亿元|亿元|万人|万千瓦|万吨|亿平方米)`,
        'g',
      )
      for (const m of useful.matchAll(re)) {
        const hit = m[0]!
        if (/=|：|:/.test(hit) && !/^增长量(?:为|是)/.test(hit)) continue
        push(hit)
      }
    }
  }
  return out
}

export function dataAnalysisDifficultyLabel(d: DataAnalysisDifficulty): string {
  return d === 'easy' ? '简单' : '复杂'
}

export function dataAnalysisTopicLabel(_t: DataAnalysisTopic = 'percent-point'): string {
  return '百分数与百分点'
}

export function getDataAnalysisQuestionFingerprint(input: {
  difficulty: DataAnalysisDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
}): string {
  const opts = [...input.options].sort().join('\u001f')
  return [
    input.difficulty,
    input.term.trim(),
    input.passage.trim(),
    input.stem.trim(),
    opts,
    String(input.correctIndex),
  ].join('\u001e')
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** 选项单位归类：同一题四个选项必须同类 */
export type DataAnalysisOptionUnitKind =
  | 'percentage-points'
  | 'percent'
  | 'number'
  | 'invalid'

export function classifyDataAnalysisOptionUnit(opt: string): DataAnalysisOptionUnitKind {
  const t = String(opt ?? '').trim()
  if (!t) return 'invalid'
  const hasPp = /个百分点/.test(t)
  const bare = t.replace(/个百分点/g, '')
  const hasPct = /[%％]|百分数/.test(bare)
  if (hasPp && hasPct) return 'invalid'
  if (hasPp) return 'percentage-points'
  if (/%|％/.test(t) || /百分数/.test(t)) return 'percent'
  if (/^[-+]?(\d+(\.\d+)?|\d+\/\d+)$/.test(t)) return 'number'
  // 「13个百分号」等错写也拒
  if (/百分/.test(t) && !hasPp) return 'invalid'
  return 'invalid'
}

/** 四个选项单位/格式必须完全一致（禁「个百分点」与「%」混排） */
export function dataAnalysisOptionsUnitConsistent(options: string[]): boolean {
  if (!Array.isArray(options) || options.length < 4) return false
  const four = options.slice(0, 4).map((o) => String(o).trim())
  if (four.some((o) => !o)) return false
  const kinds = four.map(classifyDataAnalysisOptionUnit)
  if (kinds.some((k) => k === 'invalid')) return false
  const first = kinds[0]
  return kinds.every((k) => k === first)
}

/** 问「高/低/快/慢多少」或明确百分点时，答案须用「个百分点」 */
export function dataAnalysisStemExpectsPercentagePoints(stem: string): boolean {
  const s = String(stem ?? '')
  if (/百分点/.test(s)) return true
  if (/(高|低|快|慢|多|少)多少(?!.*[%％])/.test(s)) return true
  if (/相差多少|差了多少|相差几|差几/.test(s)) return true
  return false
}

/** 把「4.3% / 4.3」统一成「4.3个百分点」，避免混单位被拒 */
export function normalizeDataAnalysisOptionToPercentagePoints(opt: string): string | null {
  const t = String(opt ?? '').trim()
  if (!t) return null
  if (/个百分点/.test(t)) {
    const m = t.match(/([-+]?\d+(?:\.\d+)?)\s*个百分点/)
    return m ? `${m[1]}个百分点` : t
  }
  const m = t.match(/^([-+]?\d+(?:\.\d+)?)\s*[%％]?$/)
  if (m) return `${m[1]}个百分点`
  return null
}

export function coerceDataAnalysisOptionsUnits(
  stem: string,
  correct: string,
  distractors: string[],
): { correct: string; distractors: string[] } | null {
  const all = [correct, ...distractors].map((x) => String(x).trim())
  if (all.length !== 4 || all.some((x) => !x)) return null

  // 问差值时：尽量统一成「个百分点」（含原先全是 % 或混排的情况）
  if (dataAnalysisStemExpectsPercentagePoints(stem)) {
    const coerced = all.map(normalizeDataAnalysisOptionToPercentagePoints)
    if (!coerced.some((x) => !x) && new Set(coerced).size === 4) {
      return { correct: coerced[0]!, distractors: coerced.slice(1) as string[] }
    }
  }

  if (dataAnalysisOptionsUnitConsistent(all)) {
    return { correct: all[0]!, distractors: all.slice(1) }
  }
  return null
}

export function isPlayableDataAnalysisMcq(q: {
  stem: string
  options: string[]
  correctIndex: number
}): boolean {
  if (!isPlayableFourChoiceMcq(q)) return false
  if (!dataAnalysisOptionsUnitConsistent(q.options)) return false
  if (dataAnalysisStemExpectsPercentagePoints(q.stem)) {
    const kind = classifyDataAnalysisOptionUnit(q.options[q.correctIndex] ?? '')
    if (kind !== 'percentage-points') return false
  }
  return true
}

export function buildDataAnalysisQuestionFromMcq(input: {
  difficulty: DataAnalysisDifficulty
  term: string
  passage?: string
  stem: string
  correct: string
  distractors: string[]
  explanation?: string
  evidenceSpans?: unknown
  method?: string
  seq: number
}): DataAnalysisQuestion | null {
  const term = input.term.trim()
  const stem = input.stem.trim()
  const passage = (input.passage ?? '').trim()
  const correct = input.correct.trim()
  const distractors = input.distractors.map((d) => d.trim()).filter(Boolean)
  if (!term || !stem || !correct || distractors.length !== 3) return null
  if (input.difficulty === 'hard' && passage.length < 36) return null
  const coerced = coerceDataAnalysisOptionsUnits(stem, correct, distractors)
  if (!coerced) return null
  const assembled = assembleFourChoiceMcq(coerced.correct, coerced.distractors, shuffleInPlace)
  if (!assembled) return null
  const { options, correctIndex } = assembled
  const fingerprint = getDataAnalysisQuestionFingerprint({
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
  })
  const explanation = (input.explanation ?? '').trim()
  if (explanation) {
    const math = validateDataAnalysisAnswerMath(correct, explanation)
    if (!math.ok) return null
  } else {
    return null
  }
  const evidenceSpans = normalizeDataAnalysisEvidenceSpans(
    passage,
    input.evidenceSpans,
    stem,
    explanation,
  )
  // 有材料时必须能圈到至少一处解题数据/专名
  if (passage.length >= 12 && evidenceSpans.length === 0) return null
  const method = String(input.method ?? '').trim().slice(0, 40)
  const q: DataAnalysisQuestion = {
    id: `data-analysis-${input.difficulty}-${input.seq}-${Date.now()}`,
    topic: 'percent-point',
    difficulty: input.difficulty,
    term,
    passage,
    stem,
    options,
    correctIndex,
    evidenceSpans,
    method,
    explanation,
    fingerprint,
  }
  if (!isPlayableDataAnalysisMcq(q)) return null
  return q
}

export function parseDataAnalysisMcqAiObject(item: unknown): {
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
  const term = String(o.term ?? o.topic ?? o.keyword ?? '').trim()
  const passage = String(o.passage ?? o.material ?? o.text ?? '').trim()
  const stem = String(o.stem ?? o.question ?? '').trim()
  // 拒收「1-8月」「1至8月」「2024年1-8月」等数字连写时期
  if (/\d\s*[-－—–~～至到]\s*\d\s*月/.test(`${passage}\n${stem}`)) return null
  if (/年\d+\s*[-－—–~～至到]\s*\d+\s*月/.test(`${passage}\n${stem}`)) return null
  if (/前\s*\d+\s*个?月累计/.test(`${passage}\n${stem}`)) return null
  const picked = extractMcqCorrectAndDistractors(o)
  if (!picked) return null
  const explanation = String(o.explanation ?? o.解读 ?? o.解析 ?? '').trim()
  const method = String(o.method ?? o.做法 ?? o.解法 ?? '').trim()
  const evidenceSpans = o.evidenceSpans ?? o.evidence ?? o.focusSpans ?? o.材料依据 ?? []
  return {
    term,
    passage,
    stem,
    correct: picked.correct,
    distractors: picked.distractors,
    explanation,
    evidenceSpans,
    method,
  }
}
