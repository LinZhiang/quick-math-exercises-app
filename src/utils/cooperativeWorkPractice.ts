/**
 * 高频运算 · 合作完工问题
 * 本地程序出题（不调用 AI）。每轮 4 题四选一。仅简单 / 困难。
 *
 * 教材公式：
 * - 效率和 = 效率1 + 效率2 + …
 * - 工作总量 = 第一人工作量 + 第二人工作量 + …
 *
 * 【简单】不高于经典真题 2（甲先做一段，乙加入合作完工；或甲工时上限求乙最少天数）
 * 【困难】比真题 2 更高阶；≥5 种变式，每轮抽 4 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type CooperativeWorkDifficulty = 'easy' | 'hard'

export const COOPERATIVE_WORK_QUESTION_COUNT = 4

export const COOPERATIVE_WORK_MODES: {
  id: CooperativeWorkDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '合作完工 · 简单',
    desc: '每轮 4 题 · 对齐/略低于经典真题 2（效率和、分段合作）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '合作完工 · 困难',
    desc: '每轮 4 题 · 比经典真题 2 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const COOPERATIVE_WORK_HARD_EXAM_TYPES = [
  {
    id: 'cap-min-b',
    name: '工时上限求最少',
    note: '经典真题 2 加强：甲有上限，求乙最少工作天数',
  },
  {
    id: 'three-team',
    name: '三队合作',
    note: '三队效率和，分段加入或求合作天数',
  },
  {
    id: 'join-then-leave',
    name: '中途加入再撤离',
    note: '甲先做→乙加入→甲撤离，求剩余或总天数',
  },
  {
    id: 'rest-during',
    name: '合作中休息',
    note: '合作期间一方休息若干天，求休息天数或完工天数',
  },
  {
    id: 'two-stage-rate',
    name: '两段反推效率',
    note: '由「先单独再合作」反推乙单独完工天数',
  },
  {
    id: 'min-together',
    name: '最少合作天数',
    note: '总工期固定、合作时效率变化，求最少合作天数',
  },
] as const

export type CooperativeWorkHardTypeId = (typeof COOPERATIVE_WORK_HARD_EXAM_TYPES)[number]['id']

export type CooperativeWorkQuestion = {
  id: string
  topic: 'cooperative-work'
  difficulty: CooperativeWorkDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: CooperativeWorkHardTypeId
}

export function cooperativeWorkTopicLabel(): string {
  return '合作完工问题'
}

export function cooperativeWorkDifficultyLabel(d: CooperativeWorkDifficulty): string {
  if (d === 'easy') return '简单'
  return '困难'
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function approxEq(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps
}

function asNiceInt(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n)
  if (Math.abs(n - r) > 1e-8 || r <= 0) return null
  return r
}

function uniqueStr(correct: string, cands: string[], need = 3): string[] {
  const out: string[] = []
  const seen = new Set([correct.replace(/\s+/g, '')])
  for (const c of cands) {
    const k = c.trim().replace(/\s+/g, '')
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(c.trim())
    if (out.length >= need) break
  }
  let g = 0
  while (out.length < need && g++ < 50) {
    const n = Number(correct)
    const fake = Number.isFinite(n) ? String(Math.round(n) + g + 1) : `${correct}+${g}`
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && x !== correct).map((x) => String(Math.round(x))),
  )
}

function buildQuestion(input: {
  difficulty: CooperativeWorkDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: CooperativeWorkHardTypeId
  seq: number
}): CooperativeWorkQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'cooperative-work',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `cw-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'cooperative-work',
    difficulty: input.difficulty,
    term: input.term,
    passage: (input.passage ?? '').trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method,
    explanation: input.explanation.trim(),
    fingerprint,
    hardTypeId: input.hardTypeId,
  }
}

// ——— 简单 ———

/** 效率和：甲乙单独天数已知，求合作几天 */
function genEasyTogetherDays(seq: number): CooperativeWorkQuestion | null {
  const a = pickOne([6, 8, 10, 12, 15])
  const b = pickOne([8, 10, 12, 15, 20])
  if (a === b) return null
  const w = a * b // 赋值总量
  const ra = w / a
  const rb = w / b
  const t = asNiceInt(w / (ra + rb))
  if (t == null) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '效率和求合作天数',
    passage: `一项工程，甲队单独做需 ${a} 天，乙队单独做需 ${b} 天。`,
    stem: '两队合作需要多少天？',
    correct: String(t),
    distractors: uniqueNum(t, [(a + b) / 2, a + b, Math.min(a, b), w / Math.max(ra, rb)]),
    method: '效率和 = 效率1+效率2；合作天数 = 总量 ÷ 效率和。可赋值总量为单独天数之积。',
    explanation: `赋值总量 ${w}，甲效 ${ra}、乙效 ${rb}，合作 ${w}÷(${ra}+${rb})=${t} 天。`,
    seq,
  })
}

/** 甲先做若干天，乙加入合作完工（无上限约束，求合作天数） */
function genEasyJoinFinish(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 40; i++) {
    const ta = pickOne([12, 15, 18, 20, 24])
    const tb = pickOne([10, 12, 15, 18, 20])
    if (ta === tb) continue
    const alone = pickOne([3, 4, 5, 6])
    if (alone >= ta) continue
    const w = ta * tb
    const ra = w / ta
    const rb = w / tb
    const left = w - ra * alone
    const coop = asNiceInt(left / (ra + rb))
    if (coop == null) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '先单独再合作',
      passage: `一项工程甲单独需 ${ta} 天，乙单独需 ${tb} 天。甲先做 ${alone} 天，然后乙加入一起做。`,
      stem: '还需要多少天才能完工？',
      correct: String(coop),
      distractors: uniqueNum(coop, [alone, left / rb, ta - alone, w / (ra + rb)]),
      method: '总量 = 各人工作量之和。先算甲单独完成量，剩余 ÷ 效率和。',
      explanation: `赋值 ${w}，甲先做 ${ra * alone}，剩 ${left}；合作效率 ${ra + rb}，还需 ${coop} 天。`,
      seq,
    })
  }
  return null
}

/** 经典真题 2 同构或略简：由计划反推，再求乙单独天数（不问上限） */
function genEasyClassic2Alone(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 50; i++) {
    // 甲 aloneDays 做完 fracN/fracD，再合作 coopDays 完工
    const aloneDays = pickOne([20, 24, 30])
    const fracN = 1
    const fracD = pickOne([3, 4, 5])
    const coopDays = pickOne([10, 12, 15])
    // 甲单独完工天数 Ta = aloneDays * fracD / fracN
    if ((aloneDays * fracD) % fracN !== 0) continue
    const ta = (aloneDays * fracD) / fracN
    // 剩余 (fracD-fracN)/fracD，合作 coopDays：coopDays*(1/ta+1/tb)=(fracD-fracN)/fracD
    // coopDays/ta + coopDays/tb = (fracD-fracN)/fracD
    // coopDays/tb = (fracD-fracN)/fracD - coopDays/ta
    const rem = (fracD - fracN) / fracD
    const right = rem - coopDays / ta
    if (right <= 0) continue
    const tb = asNiceInt(coopDays / right)
    if (tb == null) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '分段合作求乙单独天数（经典真题 2）',
      passage: `甲、乙两队合作一项工程。原计划甲先单独做 ${aloneDays} 天完成工程的 ${fracN}/${fracD}，然后乙加入，两队再合作 ${coopDays} 天完成全部工程。`,
      stem: '乙队单独完成该项工程需要多少天？',
      correct: String(tb),
      distractors: uniqueNum(tb, [ta, aloneDays + coopDays, coopDays * fracD, ta - aloneDays]),
      method: '由甲先做天数得甲效率；剩余工作量 = 合作天数 × (效率和)，反推乙效率。',
      explanation: `甲单独 ${ta} 天；剩余 ${fracD - fracN}/${fracD} 由合作完成 ⇒ 乙单独 ${tb} 天。`,
      seq,
    })
  }
  // 固定真题数字：甲 90，乙 30
  return buildQuestion({
    difficulty: 'easy',
    term: '分段合作求乙单独天数（经典真题 2）',
    passage:
      '甲、乙两队合作一项工程。原计划甲先单独做 30 天完成工程的 1/3，然后乙加入，两队再合作 15 天完成全部工程。',
    stem: '乙队单独完成该项工程需要多少天？',
    correct: '30',
    distractors: uniqueNum(30, [45, 60, 90]),
    method: '甲 30 天做 1/3 ⇒ 甲单独 90 天；剩余 2/3=15×(1/90+1/乙) ⇒ 乙=30。',
    explanation: '乙单独需 30 天。',
    seq,
  })
}

/** 经典真题 2 核心问法：甲工时上限，求乙最少天数（难度对齐真题） */
function genEasyClassic2Cap(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 50; i++) {
    const aloneDays = pickOne([24, 30])
    const fracD = pickOne([3, 4])
    const coopDays = pickOne([12, 15])
    const cap = pickOne([30, 36, 40])
    const ta = aloneDays * fracD
    const rem = (fracD - 1) / fracD
    const right = rem - coopDays / ta
    if (right <= 0) continue
    const tb = asNiceInt(coopDays / right)
    if (tb == null) continue
    if (cap >= ta) continue
    // 工作量：甲天/ta + 乙天/tb = 1 ⇒ 乙天 = tb*(1 - 甲天/ta)，甲取 cap 最少乙
    const bMin = asNiceInt(tb * (1 - cap / ta))
    if (bMin == null) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '甲工时上限求乙最少天数（经典真题 2）',
      passage: `甲、乙两队合作一项工程。原计划甲先单独做 ${aloneDays} 天完成工程的 1/${fracD}，然后乙加入，两队再合作 ${coopDays} 天完成全部工程。因故甲队参与施工总时间不能超过 ${cap} 天。`,
      stem: '要完成全部工程，乙队至少需要施工多少天？',
      correct: String(bMin),
      distractors: uniqueNum(bMin, [tb, cap, aloneDays + coopDays, tb - cap]),
      method: '先求甲、乙单独完工天数。总量=甲工作量+乙工作量；甲天数取上限时乙天数最少。',
      explanation: `甲单独 ${ta} 天、乙单独 ${tb} 天；甲做 ${cap} 天时乙最少 ${bMin} 天。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '甲工时上限求乙最少天数（经典真题 2）',
    passage:
      '甲、乙两队合作一项工程。原计划甲先单独做 30 天完成工程的 1/3，然后乙加入，两队再合作 15 天完成全部工程。因故甲队总施工时间不能超过 36 天。',
    stem: '要完成全部工程，乙队至少需要施工多少天？',
    correct: '18',
    distractors: uniqueNum(18, [27, 30, 36]),
    method: '甲 90 天、乙 30 天；甲天/90+乙天/30=1，甲取 36 ⇒ 乙=18。',
    explanation: '乙至少 18 天。',
    seq,
  })
}

// ——— 困难 ———

function genHardCapMinB(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 60; i++) {
    const aloneDays = pickOne([20, 24, 30, 36])
    const fracD = pickOne([3, 4, 5])
    const coopDays = pickOne([8, 10, 12, 15, 16])
    const cap = pickOne([28, 32, 36, 40, 42])
    const ta = aloneDays * fracD
    const rem = (fracD - 1) / fracD
    const right = rem - coopDays / ta
    if (right <= 0) continue
    const tb = asNiceInt(coopDays / right)
    if (tb == null || tb === ta) continue
    if (cap >= ta || cap <= aloneDays) continue
    const bMin = asNiceInt(tb * (1 - cap / ta))
    if (bMin == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '上限约束求乙最少天数',
      hardTypeId: 'cap-min-b',
      passage: `甲、乙两队完成一项工程。已知：甲先单独 ${aloneDays} 天可完成工程的 1/${fracD}；此后乙加入，再合作 ${coopDays} 天恰好完工。现要求甲队总施工不超过 ${cap} 天。`,
      stem: '乙队至少施工多少天才能保证完工？',
      correct: String(bMin),
      distractors: uniqueNum(bMin, [tb, cap, aloneDays + coopDays, Math.round(tb * (1 - aloneDays / ta))]),
      method: '效率和思路：先求甲、乙效率（或单独天数）。甲工作量+乙工作量=总量；甲天数取最大时乙最少。',
      explanation: `甲单独 ${ta} 天、乙单独 ${tb} 天；甲 ${cap} 天 ⇒ 乙至少 ${bMin} 天。`,
      seq,
    })
  }
  return null
}

function genHardThreeTeam(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 40; i++) {
    const a = pickOne([6, 8, 9, 10, 12])
    const b = pickOne([8, 10, 12, 15])
    const c = pickOne([12, 15, 18, 20])
    if (new Set([a, b, c]).size < 3) continue
    const w = a * b * c
    const ra = w / a
    const rb = w / b
    const rc = w / c
    const aloneA = pickOne([2, 3])
    const left = w - ra * aloneA
    const coop = asNiceInt(left / (ra + rb + rc))
    if (coop == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三队分段合作',
      hardTypeId: 'three-team',
      passage: `一项工程，甲、乙、丙单独完成分别需 ${a}、${b}、${c} 天。甲先单独做 ${aloneA} 天，然后乙、丙加入三人一起做。`,
      stem: '从乙、丙加入起还需要多少天完工？',
      correct: String(coop),
      distractors: uniqueNum(coop, [aloneA, w / (ra + rb), left / (rb + rc), a - aloneA]),
      method: '效率和 = 三队效率之和；剩余工作量 ÷ 三队效率和。',
      explanation: `赋值 ${w}，甲先做 ${ra * aloneA}，剩 ${left}；三队效率和 ${ra + rb + rc}，还需 ${coop} 天。`,
      seq,
    })
  }
  return null
}

function genHardJoinThenLeave(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 50; i++) {
    const ta = pickOne([12, 15, 18, 20])
    const tb = pickOne([10, 12, 15, 18])
    if (ta === tb) continue
    const t1 = pickOne([2, 3, 4]) // 甲先单独
    const t2 = pickOne([3, 4, 5, 6]) // 合作
    const w = ta * tb
    const ra = w / ta
    const rb = w / tb
    const done = ra * t1 + (ra + rb) * t2
    if (done >= w) continue
    const left = w - done
    const t3 = asNiceInt(left / rb) // 甲撤离后乙单独
    if (t3 == null) continue
    const total = t1 + t2 + t3
    return buildQuestion({
      difficulty: 'hard',
      term: '加入后甲撤离',
      hardTypeId: 'join-then-leave',
      passage: `一项工程甲单独需 ${ta} 天，乙单独需 ${tb} 天。甲先做 ${t1} 天，乙加入后合作 ${t2} 天，随后甲撤离，剩余由乙单独完成。`,
      stem: '从开工到完工一共多少天？',
      correct: String(total),
      distractors: uniqueNum(total, [t1 + t2, t3, ta, t1 + t2 + left / ra]),
      method: '分段计算工作量：甲单独 + 合作 + 乙单独 = 总量，再求各段时间之和。',
      explanation: `赋值 ${w}；三段后剩 ${left}，乙再 ${t3} 天；总 ${total} 天。`,
      seq,
    })
  }
  return null
}

function genHardRestDuring(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 60; i++) {
    const ta = pickOne([20, 24, 30])
    const tb = pickOne([15, 18, 20, 24])
    if (ta === tb) continue
    const rest = pickOne([2, 3, 4, 5])
    // (T−rest)/ta + T/tb = 1 → T = (1+rest/ta)/(1/ta+1/tb)
    const T = asNiceInt((1 + rest / ta) / (1 / ta + 1 / tb))
    if (T == null || T <= rest) continue
    const askTotal = Math.random() < 0.5
    if (askTotal) {
      return buildQuestion({
        difficulty: 'hard',
        term: '合作期间一方休息',
        hardTypeId: 'rest-during',
        passage: `一项工程甲单独需 ${ta} 天，乙单独需 ${tb} 天。两队合作完成该工程，期间甲队休息了 ${rest} 天（乙未休息）。`,
        stem: '从开工到完工一共多少天？',
        correct: String(T),
        distractors: uniqueNum(T, [rest, ta, tb, T - rest]),
        method: '总量 = 甲实际工作量 + 乙实际工作量；甲工作天数 = 总天数 − 休息天数。',
        explanation: `(T−${rest})/${ta}+T/${tb}=1 ⇒ T=${T}。`,
        seq,
      })
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '合作期间一方休息',
      hardTypeId: 'rest-during',
      passage: `一项工程甲单独需 ${ta} 天，乙单独需 ${tb} 天。两队按同一日历施工 ${T} 天完工，其中甲休息了若干天、乙未休息。`,
      stem: '甲休息了多少天？',
      correct: String(rest),
      distractors: uniqueNum(rest, [1, rest + 1, T - rest, Math.abs(ta - tb)]),
      method: '甲工作量+乙工作量=总量；设休息 r，则 (总天−r)/甲单独 + 总天/乙单独 = 1。',
      explanation: `(${T}−r)/${ta}+${T}/${tb}=1 ⇒ r=${rest}。`,
      seq,
    })
  }
  return null
}

function genHardTwoStageRate(seq: number): CooperativeWorkQuestion | null {
  for (let i = 0; i < 50; i++) {
    const aloneDays = pickOne([15, 18, 20, 24, 30])
    const fracD = pickOne([3, 4, 5])
    const coopDays = pickOne([6, 8, 9, 10, 12])
    const ta = aloneDays * fracD
    const rem = (fracD - 1) / fracD
    const right = rem - coopDays / ta
    if (right <= 0) continue
    const tb = asNiceInt(coopDays / right)
    if (tb == null) continue
    // 额外问：若改为全程合作，需多少天
    const w = ta * tb
    const coopAll = asNiceInt(w / (w / ta + w / tb))
    if (coopAll == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '分段信息求全程合作天数',
      hardTypeId: 'two-stage-rate',
      passage: `甲、乙两队完成一项工程。甲先单独做 ${aloneDays} 天完成工程的 1/${fracD}，然后乙加入，再合作 ${coopDays} 天完工。`,
      stem: '若两队从一开始就合作，需要多少天完工？',
      correct: String(coopAll),
      distractors: uniqueNum(coopAll, [tb, ta, aloneDays + coopDays, coopDays]),
      method: '先由分段信息求甲、乙效率（单独天数），再总量÷效率和。',
      explanation: `甲单独 ${ta} 天、乙单独 ${tb} 天；全程合作 ${coopAll} 天。`,
      seq,
    })
  }
  return null
}

function genHardMinTogether(seq: number): CooperativeWorkQuestion | null {
  // 总工期固定 D；单独时甲效 ra、乙效 rb；合作时效率降为 k_a*ra、k_b*rb；求最少合作天数
  // 参考：希望合作天数最少 → 尽量让高效方多单独做
  for (let i = 0; i < 60; i++) {
    const ta = pickOne([24, 30, 36])
    const tb = pickOne([30, 36, 40, 45])
    if (ta === tb) continue
    const D = pickOne([20, 21, 22, 23, 24])
    const kaN = 5
    const kaD = 6 // 甲合作时为原来 5/6
    const kbN = 9
    const kbD = 10 // 乙合作时为原来 9/10
    // 合作 t 天，甲单独 D-t（甲效率更高时让甲单独）
    const ra = 1 / ta
    const rb = 1 / tb
    const rca = (kaN / kaD) * ra
    const rcb = (kbN / kbD) * rb
    const denom = rca + rcb - ra
    const numer = 1 - ra * D
    if (Math.abs(denom) < 1e-12) continue
    const t = asNiceInt(numer / denom)
    if (t == null || t >= D) continue
    const check = ra * (D - t) + (rca + rcb) * t
    if (!approxEq(check, 1, 1e-8)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '降效下求最少合作天数',
      hardTypeId: 'min-together',
      passage: `一项工程甲单独需 ${ta} 天，乙单独需 ${tb} 天。两队合作时效率下降：甲仅为原来的 ${kaN}/${kaD}，乙仅为原来的 ${kbN}/${kbD}。现要求 ${D} 天内完工，且尽量减少两队同时施工的天数。`,
      stem: '两队至少需要合作多少天？',
      correct: String(t),
      distractors: uniqueNum(t, [D - t, D, Math.abs(ta - tb), t + 2]),
      method: '总量=各人工作量之和。合作天数最少时，优先安排效率更高的一方单独做，再解合作天数。',
      explanation: `设合作 t 天、甲单独 ${D}−t 天，由工作量方程得 t=${t}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  CooperativeWorkHardTypeId,
  (seq: number) => CooperativeWorkQuestion | null
> = {
  'cap-min-b': genHardCapMinB,
  'three-team': genHardThreeTeam,
  'join-then-leave': genHardJoinThenLeave,
  'rest-during': genHardRestDuring,
  'two-stage-rate': genHardTwoStageRate,
  'min-together': genHardMinTogether,
}

function tryBuild(
  factory: () => CooperativeWorkQuestion | null,
  maxTry = 50,
): CooperativeWorkQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateCooperativeWorkPaper(
  difficulty: CooperativeWorkDifficulty,
): CooperativeWorkQuestion[] {
  const out: CooperativeWorkQuestion[] = []
  const seen = new Set<string>()
  const push = (q: CooperativeWorkQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyTogetherDays,
      genEasyJoinFinish,
      genEasyClassic2Alone,
      genEasyClassic2Cap,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= COOPERATIVE_WORK_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < COOPERATIVE_WORK_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<CooperativeWorkHardTypeId>()
    const types = shuffleInPlace([...COOPERATIVE_WORK_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= COOPERATIVE_WORK_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = COOPERATIVE_WORK_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < COOPERATIVE_WORK_QUESTION_COUNT && guard++ < 40) {
      const pool = remain.length ? remain : COOPERATIVE_WORK_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, COOPERATIVE_WORK_QUESTION_COUNT)
}
