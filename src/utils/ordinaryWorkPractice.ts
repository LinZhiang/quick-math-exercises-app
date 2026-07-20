/**
 * 高频运算 · 普通工程问题
 * 本地程序出题（不调用 AI）。每轮 4 题四选一。仅简单 / 困难。
 *
 * 教材公式：
 * - 工作总量 = 工作效率 × 工作时间
 * - 效率相同：总量与时间成正比
 * - 时间相同：总量与效率成正比
 * - 总量相同：效率与时间成反比
 *
 * 【简单】不高于经典真题 1（提效后同量省时求效率差）
 * 【困难】比真题 1 更高阶；≥5 种变式，每轮抽 4 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type OrdinaryWorkDifficulty = 'easy' | 'hard'

export const ORDINARY_WORK_QUESTION_COUNT = 4

export const ORDINARY_WORK_MODES: {
  id: OrdinaryWorkDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '普通工程 · 简单',
    desc: '每轮 4 题 · 对齐/略低于经典真题 1（提效省时、三量公式）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '普通工程 · 困难',
    desc: '每轮 4 题 · 比经典真题 1 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const ORDINARY_WORK_HARD_EXAM_TYPES = [
  {
    id: 'efficiency-boost-plus',
    name: '提效省时加强',
    note: '经典真题 1 加强：两段不同量或提效倍数非整数',
  },
  {
    id: 'two-stage-quota',
    name: '两段定额不同',
    note: '前后两段工作量不同，求原效率或提效后效率',
  },
  {
    id: 'time-same-compare',
    name: '同时间比总量',
    note: '时间相同，效率比推总量比或件数差',
  },
  {
    id: 'work-same-inverse',
    name: '同量反比求时间',
    note: '总量相同，效率变化后求时间差或新时间',
  },
  {
    id: 'three-rate-chain',
    name: '三段效率变化',
    note: '效率变两次，求总量或某段时间',
  },
  {
    id: 'percent-boost',
    name: '百分数提效',
    note: '效率提高 p%，同量省时，求原效率或增量',
  },
] as const

export type OrdinaryWorkHardTypeId = (typeof ORDINARY_WORK_HARD_EXAM_TYPES)[number]['id']

export type OrdinaryWorkQuestion = {
  id: string
  topic: 'ordinary-work'
  difficulty: OrdinaryWorkDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: OrdinaryWorkHardTypeId
}

export function ordinaryWorkTopicLabel(): string {
  return '普通工程问题'
}

export function ordinaryWorkDifficultyLabel(d: OrdinaryWorkDifficulty): string {
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

function isNiceInt(n: number): boolean {
  return Number.isFinite(n) && approxEq(n, Math.round(n)) && n > 0
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
  difficulty: OrdinaryWorkDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: OrdinaryWorkHardTypeId
  seq: number
}): OrdinaryWorkQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'ordinary-work',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ow-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'ordinary-work',
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

/** 经典真题 1 同构或略简：提效后同量少用时，求每小时多加工多少 */
function genEasyClassic1(seq: number): OrdinaryWorkQuestion | null {
  // 1000/x - 1000/(k x) = dt → 1000(1-1/k)/x = dt → x = 1000(1-1/k)/dt
  for (let i = 0; i < 40; i++) {
    const amount = pickOne([600, 800, 1000, 1200])
    const k = pickOne([2, 2.5, 3]) // new = k * old
    const dt = pickOne([6, 8, 10, 12])
    const factor = 1 - 1 / k
    const x = (amount * factor) / dt
    if (!isNiceInt(x)) continue
    const increase = (k - 1) * x
    if (!isNiceInt(increase)) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '提效后同量省时（经典真题 1）',
      passage: `加工完 ${amount} 个零件后改进技术，效率提高到原来的 ${k} 倍。再加工 ${amount} 个零件，比改进前加工同样数量少用 ${dt} 小时。`,
      stem: '改进后每小时比原来多加工多少个零件？',
      correct: String(increase),
      distractors: uniqueNum(increase, [x, k * x, amount / dt, 50, 75, 100]),
      method:
        '设原效率为 x，则 amount/x − amount/(k x)=时差。总量相同，效率比与时间比互为反比，也可用份数法。',
      explanation: `${amount}/x−${amount}/(${k}x)=${dt} ⇒ x=${x}；多加工 (${k}−1)×${x}=${increase}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '提效后同量省时（经典真题 1）',
    passage:
      '加工完 1000 个零件后改进技术，效率提高到原来的 2.5 倍。再加工 1000 个，比改进前少用 12 小时。',
    stem: '改进后每小时比原来多加工多少个零件？',
    correct: '75',
    distractors: uniqueNum(75, [50, 100, 125]),
    method: '1000/x−1000/(2.5x)=12 ⇒ x=50；多 1.5×50=75。',
    explanation: '原效率 50，新效率 125，差 75。',
    seq,
  })
}

function genEasyWEqualsRT(seq: number): OrdinaryWorkQuestion | null {
  const mode = pickOne(['W', 'R', 'T'] as const)
  if (mode === 'W') {
    const r = pickOne([40, 50, 60, 80])
    const t = pickOne([3, 4, 5, 6])
    const w = r * t
    return buildQuestion({
      difficulty: 'easy',
      term: '总量=效率×时间',
      passage: `工作效率为每小时 ${r} 个，工作 ${t} 小时。`,
      stem: '完成的工作总量是多少个？',
      correct: String(w),
      distractors: uniqueNum(w, [r + t, r * (t + 1), w - r]),
      method: '工作总量 = 工作效率 × 工作时间。',
      explanation: `${r}×${t}=${w}。`,
      seq,
    })
  }
  if (mode === 'R') {
    const w = pickOne([120, 150, 200, 240])
    const t = pickOne([3, 4, 5, 6])
    if (w % t !== 0) return null
    const r = w / t
    return buildQuestion({
      difficulty: 'easy',
      term: '由总量与时间求效率',
      passage: `共完成 ${w} 个零件，用时 ${t} 小时。`,
      stem: '工作效率是每小时多少个？',
      correct: String(r),
      distractors: uniqueNum(r, [w - t, t * 10, r + 10]),
      method: '效率 = 总量 ÷ 时间。',
      explanation: `${w}÷${t}=${r}。`,
      seq,
    })
  }
  const w = pickOne([120, 180, 240])
  const r = pickOne([30, 40, 60])
  if (w % r !== 0) return null
  const t = w / r
  return buildQuestion({
    difficulty: 'easy',
    term: '由总量与效率求时间',
    passage: `需完成 ${w} 个，效率每小时 ${r} 个。`,
    stem: '需要多少小时？',
    correct: String(t),
    distractors: uniqueNum(t, [t + 1, w - r, r / 10]),
    method: '时间 = 总量 ÷ 效率。',
    explanation: `${w}÷${r}=${t}。`,
    seq,
  })
}

function genEasySameWorkInverse(seq: number): OrdinaryWorkQuestion | null {
  // 总量相同，效率比 a:b，时间比 b:a
  const r1 = pickOne([20, 30, 40])
  const r2 = pickOne([40, 60, 80])
  if (r2 <= r1) return null
  const w = pickOne([120, 180, 240])
  if (w % r1 !== 0 || w % r2 !== 0) return null
  const t1 = w / r1
  const t2 = w / r2
  const dt = t1 - t2
  return buildQuestion({
    difficulty: 'easy',
    term: '总量相同 · 效率反比时间',
    passage: `完成同样 ${w} 个零件。甲每小时 ${r1} 个，乙每小时 ${r2} 个。`,
    stem: '甲比乙多用多少小时？',
    correct: String(dt),
    distractors: uniqueNum(dt, [t1, t2, r2 - r1]),
    method: '总量相同，效率与时间成反比；时间差 = w/r1 − w/r2。',
    explanation: `甲 ${t1} 小时，乙 ${t2} 小时，差 ${dt}。`,
    seq,
  })
}

function genEasySameTimeProp(seq: number): OrdinaryWorkQuestion | null {
  const t = pickOne([4, 5, 6])
  const r1 = pickOne([30, 40, 50])
  const r2 = pickOne([50, 60, 80])
  const w1 = r1 * t
  const w2 = r2 * t
  return buildQuestion({
    difficulty: 'easy',
    term: '时间相同 · 总量正比效率',
    passage: `甲、乙同时工作 ${t} 小时。甲效率每小时 ${r1} 个，乙每小时 ${r2} 个。`,
    stem: '乙比甲多完成多少个？',
    correct: String(w2 - w1),
    distractors: uniqueNum(w2 - w1, [w1, w2, r2 - r1]),
    method: '时间相同，总量与效率成正比。',
    explanation: `乙 ${w2}，甲 ${w1}，差 ${w2 - w1}。`,
    seq,
  })
}

// ——— 困难 ≥5 ———

function genHardBoostPlus(seq: number): OrdinaryWorkQuestion | null {
  // 两段量不同：由后一段省时反推原效率，再求增量（比真题 1 多一段干扰量）
  for (let i = 0; i < 40; i++) {
    const w1 = pickOne([600, 800, 1000])
    const w2 = pickOne([800, 1000, 1200])
    if (w1 === w2) continue
    const k = pickOne([2, 2.5, 3])
    const dt = pickOne([6, 8, 10, 12])
    const x = (w2 * (1 - 1 / k)) / dt
    if (!isNiceInt(x)) continue
    const increase = (k - 1) * x
    if (!isNiceInt(increase)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '两段量 · 提效省时求增量',
      hardTypeId: 'efficiency-boost-plus',
      passage: `先按原效率加工 ${w1} 个，再将效率提高到原来的 ${k} 倍后加工 ${w2} 个。已知后一段比「若不提效继续加工 ${w2} 个」少用 ${dt} 小时。`,
      stem: '提效后每小时比原来多加工多少个？',
      correct: String(increase),
      distractors: uniqueNum(increase, [x, k * x, w1 / dt, (w1 * (1 - 1 / k)) / dt]),
      method: '后一段总量相同：w2/x−w2/(k x)=时差，先求原效率，再算增量。前一段不参与省时方程。',
      explanation: `${w2}/x−${w2}/(${k}x)=${dt} ⇒ x=${x}；多加工 (${k}−1)×${x}=${increase}。`,
      seq,
    })
  }
  return null
}

function genHardTwoStageQuota(seq: number): OrdinaryWorkQuestion | null {
  const w1 = pickOne([400, 500, 600])
  const w2 = pickOne([600, 800, 1000])
  const k = pickOne([2, 2.5])
  const dt = pickOne([8, 10, 12])
  // w2/x - w2/(k x) = dt → x = w2(1-1/k)/dt
  const x = (w2 * (1 - 1 / k)) / dt
  if (!isNiceInt(x)) return null
  const tTotal = w1 / x + w2 / (k * x)
  if (!isNiceInt(tTotal)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '两段定额求总用时',
    hardTypeId: 'two-stage-quota',
    passage: `先加工 ${w1} 个，效率提高到原来的 ${k} 倍后再加工 ${w2} 个。已知后一段比原效率加工同样 ${w2} 个少用 ${dt} 小时。`,
    stem: '两段一共用了多少小时？',
    correct: String(tTotal),
    distractors: uniqueNum(tTotal, [w1 / x, dt, tTotal + 2, (w1 + w2) / x]),
    method: '先由后一段省时求原效率，再算两段实际用时之和。',
    explanation: `原效率 ${x}；总时 ${w1}/${x}+${w2}/(${k}x)=${tTotal}。`,
    seq,
  })
}

function genHardTimeSame(seq: number): OrdinaryWorkQuestion | null {
  const t = pickOne([5, 6, 8])
  const r1 = pickOne([40, 50])
  const r2 = pickOne([60, 80, 100])
  const r3 = pickOne([30, 40, 50])
  const total = (r1 + r2 + r3) * t
  return buildQuestion({
    difficulty: 'hard',
    term: '三人同时工作求总量',
    hardTypeId: 'time-same-compare',
    passage: `甲、乙、丙同时工作 ${t} 小时，效率分别为每小时 ${r1}、${r2}、${r3} 个。`,
    stem: '三人一共完成多少个？',
    correct: String(total),
    distractors: uniqueNum(total, [r1 * t, (r1 + r2) * t, total / t]),
    method: '时间相同：总量 = (效率和) × 时间。',
    explanation: `(${r1}+${r2}+${r3})×${t}=${total}。`,
    seq,
  })
}

function genHardWorkSameInverse(seq: number): OrdinaryWorkQuestion | null {
  const w = pickOne([1200, 1500, 1800])
  const r1 = pickOne([50, 60, 75])
  const k = pickOne([1.5, 2, 2.5])
  if (w % r1 !== 0) return null
  const t1 = w / r1
  const r2 = k * r1
  if (!isNiceInt(r2)) return null
  const t2 = w / r2
  if (!isNiceInt(t2)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '同量提效后求新时间',
    hardTypeId: 'work-same-inverse',
    passage: `一批共 ${w} 个零件，原效率每小时 ${r1} 个。效率提高到原来的 ${k} 倍后加工这批零件。`,
    stem: '需要多少小时？',
    correct: String(t2),
    distractors: uniqueNum(t2, [t1, t1 - t2, t1 / k + 1]),
    method: '总量相同，时间与效率成反比：新时间 = 原时间 / 倍数。',
    explanation: `原需 ${t1} 小时；新效率 ${r2}，需 ${t2} 小时。`,
    seq,
  })
}

function genHardThreeRate(seq: number): OrdinaryWorkQuestion | null {
  const r = pickOne([40, 50, 60])
  const t1 = pickOne([2, 3])
  const t2 = pickOne([2, 3, 4])
  const t3 = pickOne([1, 2])
  const k2 = 2
  const k3 = 3
  const w = r * t1 + k2 * r * t2 + k3 * r * t3
  return buildQuestion({
    difficulty: 'hard',
    term: '三段效率变化求总量',
    hardTypeId: 'three-rate-chain',
    passage: `原效率每小时 ${r} 个。先按原效率工作 ${t1} 小时，再按 2 倍效率工作 ${t2} 小时，最后按 3 倍效率工作 ${t3} 小时。`,
    stem: '一共完成多少个？',
    correct: String(w),
    distractors: uniqueNum(w, [r * (t1 + t2 + t3), 2 * r * (t1 + t2 + t3), w - r]),
    method: '各段工作量 = 各段效率 × 各段时间，再求和。',
    explanation: `${r}×${t1}+${2 * r}×${t2}+${3 * r}×${t3}=${w}。`,
    seq,
  })
}

function genHardPercentBoost(seq: number): OrdinaryWorkQuestion | null {
  // 效率提高 p%（即变为 1+p/100），同量省时 dt
  for (let i = 0; i < 40; i++) {
    const amount = pickOne([800, 1000, 1200])
    const p = pickOne([50, 100, 150]) // percent increase
    const k = 1 + p / 100
    const dt = pickOne([6, 8, 10, 12])
    const x = (amount * (1 - 1 / k)) / dt
    if (!isNiceInt(x)) continue
    const increase = x * (p / 100)
    if (!isNiceInt(increase)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '百分数提效求增量',
      hardTypeId: 'percent-boost',
      passage: `加工 ${amount} 个零件。效率提高 ${p}% 后，加工同样数量比原来少用 ${dt} 小时。`,
      stem: '提高后每小时比原来多加工多少个？',
      correct: String(increase),
      distractors: uniqueNum(increase, [x, x + increase, amount / dt, 75]),
      method: '新效率=(1+p%)×原效率；amount/x−amount/((1+p%)x)=时差，求增量。',
      explanation: `原效率 ${x}，提高 ${p}% 后多 ${increase} 个/小时。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  OrdinaryWorkHardTypeId,
  (seq: number) => OrdinaryWorkQuestion | null
> = {
  'efficiency-boost-plus': genHardBoostPlus,
  'two-stage-quota': genHardTwoStageQuota,
  'time-same-compare': genHardTimeSame,
  'work-same-inverse': genHardWorkSameInverse,
  'three-rate-chain': genHardThreeRate,
  'percent-boost': genHardPercentBoost,
}

function tryBuild(factory: () => OrdinaryWorkQuestion | null, maxTry = 50): OrdinaryWorkQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateOrdinaryWorkPaper(
  difficulty: OrdinaryWorkDifficulty,
): OrdinaryWorkQuestion[] {
  const out: OrdinaryWorkQuestion[] = []
  const seen = new Set<string>()
  const push = (q: OrdinaryWorkQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyClassic1,
      genEasyWEqualsRT,
      genEasySameWorkInverse,
      genEasySameTimeProp,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= ORDINARY_WORK_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < ORDINARY_WORK_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<OrdinaryWorkHardTypeId>()
    const types = shuffleInPlace([...ORDINARY_WORK_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= ORDINARY_WORK_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = ORDINARY_WORK_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < ORDINARY_WORK_QUESTION_COUNT && guard++ < 40) {
      const pool = remain.length ? remain : ORDINARY_WORK_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, ORDINARY_WORK_QUESTION_COUNT)
}
