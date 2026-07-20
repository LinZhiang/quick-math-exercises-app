/**
 * 运算技巧 · 比例法
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【简单】对齐「示例」：份数差对应实际差，求总量/某量
 * 【中等】对齐经典真题 1：两次调动后人比，比例统一求原比
 * 【困难】对齐经典真题 2（行程正比例），登记 ≥8 种；每轮抽 5 种且互不重复
 * 1. mid-gap：甲走完若干分之几时，乙距中点还有一段，求全程（经典）
 * 2. mid-gap-seg：同上条件，问甲或乙已走路程
 * 3. end-gap：乙距终点还有一段
 * 4. meet-share：相遇时路程比为速度比
 * 5. chase-ratio：同向追及
 * 6. frac-change：改分数与差距，结构同经典
 * 7. ask-speed：已知全程反求速度
 * 8. time-slice：由位置关系求时间
 * 9. opposite-left：一方到中点时另一方位置
 * 10. ratio-unify-travel：行程三段比例统一
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type RatioMethodDifficulty = 'easy' | 'medium' | 'hard'

export const RATIO_METHOD_QUESTION_COUNT = 5

export const RATIO_METHOD_MODES: {
  id: RatioMethodDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '比例法 · 简单',
    desc: '每轮 5 题 · 份数差对应实际量（示例型）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '比例法 · 普通',
    desc: '每轮 5 题 · 对齐经典真题 1（比例统一 / 调动前后人比）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '比例法 · 困难',
    desc: '每轮 5 题 · 对齐经典真题 2 的 10 类行程比例变式（每题题型不同）· 正计时停表看答案',
  },
]

export const RATIO_METHOD_HARD_EXAM_TYPES = [
  {
    id: 'mid-gap',
    name: '距中点差距求全程（经典真题 2）',
    note: '同时出发、速度成比、一方走完若干分之几，另一方距中点有差距',
  },
  {
    id: 'mid-gap-seg',
    name: '同条件问已走路程',
    note: '经典结构，问甲或乙已走多少',
  },
  {
    id: 'end-gap',
    name: '距终点差距求全程',
    note: '差距相对终点而非中点',
  },
  {
    id: 'meet-share',
    name: '相遇路程比',
    note: '相向相遇时路程比=速度比',
  },
  {
    id: 'chase-ratio',
    name: '同向追及比例',
    note: '同向，用速度差与比求路程',
  },
  {
    id: 'frac-change',
    name: '改分数的中点差距',
    note: '结构同经典，分数与差距数字不同',
  },
  {
    id: 'ask-speed',
    name: '已知全程反求速度',
    note: '经典位置关系，问乙速度',
  },
  {
    id: 'time-slice',
    name: '由位置关系求时间',
    note: '已知速度与全程，求到该位置用时',
  },
  {
    id: 'opposite-left',
    name: '一方到中点时另一方位置',
    note: '甲到中点时乙距中点的距离',
  },
  {
    id: 'ratio-unify-travel',
    name: '行程三段比例统一',
    note: '三段路程成比，求全程',
  },
] as const

export type RatioMethodHardTypeId = (typeof RATIO_METHOD_HARD_EXAM_TYPES)[number]['id']

export type RatioMethodQuestion = {
  id: string
  topic: 'ratio-method'
  difficulty: RatioMethodDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: RatioMethodHardTypeId
}

export function ratioMethodTopicLabel(): string {
  return '比例法'
}

export function ratioMethodDifficultyLabel(d: RatioMethodDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
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

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x
}

function lcm2(a: number, b: number): number {
  return Math.abs((a / gcd(a, b)) * b)
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
  while (out.length < need && g++ < 40) {
    const fake = String(Number(correct) + g + 1)
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && Number.isInteger(x) && x !== correct).map(String),
  )
}

function uniqueOpt(correct: string, cands: (string | number)[]): string[] {
  return uniqueStr(
    correct,
    cands.map(String),
  )
}

function buildQuestion(input: {
  difficulty: RatioMethodDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: RatioMethodHardTypeId
  seq: number
}): RatioMethodQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'ratio-method',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ratio-method-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'ratio-method',
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

function fractionLabel(x: number): string {
  const dens = [2, 3, 4, 5, 8, 10, 16, 20, 25, 50]
  for (const d of dens) {
    const n = Math.round(x * d)
    if (Math.abs(n / d - x) < 1e-9) {
      const g = gcd(n, d)
      return `${n / g}/${d / g}`
    }
  }
  return String(x)
}

// ——— 简单 ———

function genEasyDiffParts(seq: number): RatioMethodQuestion | null {
  const pool = [
    { m: 5, n: 4, d: 5, ask: 'total' as const },
    { m: 3, n: 2, d: 6, ask: 'total' as const },
    { m: 7, n: 5, d: 8, ask: 'total' as const },
    { m: 4, n: 3, d: 7, ask: 'boys' as const },
    { m: 5, n: 3, d: 10, ask: 'girls' as const },
    { m: 6, n: 5, d: 4, ask: 'total' as const },
  ]
  const c = pickOne(pool)
  const diffParts = c.m - c.n
  if (diffParts <= 0 || c.d % diffParts !== 0) return null
  const unit = c.d / diffParts
  const boys = c.m * unit
  const girls = c.n * unit
  const total = boys + girls
  let ans: number
  let stem: string
  if (c.ask === 'total') {
    ans = total
    stem = '全班一共多少人？'
  } else if (c.ask === 'boys') {
    ans = boys
    stem = '男生多少人？'
  } else {
    ans = girls
    stem = '女生多少人？'
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '份数差求总量（示例）',
    passage: `某班男生与女生人数比为 ${c.m}:${c.n}，男生比女生多 ${c.d} 人。`,
    stem,
    correct: String(ans),
    distractors: uniqueNum(ans, [boys, girls, total, c.d * (c.m + c.n), ans + unit]),
    method: '设男生 m 份、女生 n 份；差对应实际差，再求总量或各量。',
    explanation: `差 ${diffParts} 份=${c.d} 人，每份 ${unit} 人；男 ${boys}、女 ${girls}、共 ${total}。所求=${ans}。`,
    seq,
  })
}

function genEasySumParts(seq: number): RatioMethodQuestion | null {
  const m = pickOne([2, 3, 4, 5])
  const n = pickOne([3, 4, 5, 7])
  if (m === n) return null
  const k = randInt(3, 8)
  const total = (m + n) * k
  const askM = Math.random() < 0.5
  const ans = askM ? m * k : n * k
  return buildQuestion({
    difficulty: 'easy',
    term: '份数和求一量',
    passage: `甲、乙两数之比为 ${m}:${n}，两数之和为 ${total}。`,
    stem: askM ? '甲数是？' : '乙数是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [m * k, n * k, total, k, ans + k]),
    method: '总和对应 (m+n) 份，每份=总和÷份数和。',
    explanation: `共 ${m + n} 份，每份 ${k}；所求=${ans}。`,
    seq,
  })
}

function genEasyUnifySimple(seq: number): RatioMethodQuestion | null {
  const a = pickOne([2, 3, 4])
  const b = pickOne([3, 4, 5])
  const c = pickOne([2, 4, 5])
  const d = pickOne([3, 5, 7])
  const B = lcm2(b, c)
  const A = (B / b) * a
  const C = (B / c) * d
  const g = gcd(gcd(A, B), C)
  const ans = `${A / g}:${B / g}:${C / g}`
  return buildQuestion({
    difficulty: 'easy',
    term: '比例统一（简单）',
    passage: `已知甲:乙=${a}:${b}，乙:丙=${c}:${d}。`,
    stem: '甲:乙:丙等于？',
    correct: ans,
    distractors: uniqueOpt(ans, [
      `${a}:${b}:${d}`,
      `${A}:${B}:${C}`,
      `${a * c}:${b * c}:${b * d}`,
      `${A / g}:${C / g}`,
    ]),
    method: '乙为中间量，取两比中乙份数的最小公倍数后统一约分。',
    explanation: `乙取 ${B} 份 ⇒ 甲:乙:丙=${A}:${B}:${C}=${ans}。`,
    seq,
  })
}

// ——— 中等 ———

function genMediumTransferRatio(seq: number): RatioMethodQuestion | null {
  const templates = [
    { leaveB: 4, r1: [6, 5] as [number, number], leaveA: 7, r2: [1, 2] as [number, number] },
    { leaveB: 3, r1: [5, 4] as [number, number], leaveA: 6, r2: [2, 3] as [number, number] },
    { leaveB: 5, r1: [4, 3] as [number, number], leaveA: 4, r2: [1, 2] as [number, number] },
    { leaveB: 2, r1: [3, 2] as [number, number], leaveA: 5, r2: [1, 3] as [number, number] },
    { leaveB: 6, r1: [5, 3] as [number, number], leaveA: 8, r2: [1, 2] as [number, number] },
  ]

  for (const t of shuffleInPlace([...templates])) {
    const [a1, b1] = t.r1
    const [a2, b2] = t.r2
    const B = lcm2(b1, b2)
    const A_after1 = (B / b1) * a1
    const A_after2 = (B / b2) * a2
    const deltaA = A_after1 - A_after2
    if (deltaA <= 0) continue
    if (t.leaveA % deltaA !== 0) continue
    const unit = t.leaveA / deltaA
    const A1 = A_after1 * unit
    const B1 = B * unit
    const A0 = A1
    const B0 = B1 + t.leaveB
    const g = gcd(A0, B0)
    const ans = `${A0 / g}:${B0 / g}`
    return buildQuestion({
      difficulty: 'medium',
      term: '调动后人比（经典真题 1）',
      passage: `某单位有甲、乙两组。第一次乙组调走 ${t.leaveB} 人后，甲:乙=${a1}:${b1}；第二次甲组再调走 ${t.leaveA} 人后，甲:乙=${a2}:${b2}。`,
      stem: '两次调动前，甲、乙两组人数之比是？',
      correct: ans,
      distractors: uniqueOpt(ans, ['1:2', '3:4', '4:5', '6:7', '5:6', `${a1}:${b1}`]),
      method: '第二次调动时乙不变，先统一乙的份数；由甲减少的份数对应实际调走人数，再还原调动前。',
      explanation: `乙统一为 ${B} 份时，第一次后甲 ${A_after1} 份、第二次后甲 ${A_after2} 份，差 ${deltaA} 份=${t.leaveA} 人。第一次后甲 ${A1}、乙 ${B1}；调动前乙 ${B0}，原比 ${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '调动后人比（经典真题 1）',
    passage:
      '某工厂有甲、乙两组。第一次乙组调走 4 人后甲:乙=6:5；第二次甲组调走 7 人后甲:乙=1:2。',
    stem: '两次调动前甲、乙人数之比是？',
    correct: '6:7',
    distractors: uniqueOpt('6:7', ['1:2', '3:4', '4:5']),
    method: '第二次乙不变，统一乙为 10 份：12:10 与 5:10；甲少 7 份=7 人。还原得原比 6:7。',
    explanation: '第一次后甲 12、乙 10；调动前乙 14；原比 12:14=6:7。',
    seq,
  })
}

function genMediumUnifyThree(seq: number): RatioMethodQuestion | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const a = pickOne([3, 4, 5])
    const b1 = pickOne([4, 5, 6])
    const b2 = pickOne([3, 5, 6])
    const c = pickOne([4, 5, 7, 8])
    const B = lcm2(b1, b2)
    const A = (B / b1) * a
    const C = (B / b2) * c
    const g = gcd(gcd(A, B), C)
    const dg = Math.abs(A - C) / g
    if (dg === 0) continue
    const realDiff = pickOne([6, 8, 10, 12, 14, 15])
    if (realDiff % dg !== 0) continue
    const unit = realDiff / dg
    const total = ((A + B + C) / g) * unit
    return buildQuestion({
      difficulty: 'medium',
      term: '三量比例统一',
      passage: `甲:乙=${a}:${b1}，乙:丙=${b2}:${c}。甲比丙多 ${realDiff}（人/件）。`,
      stem: '甲、乙、丙合计是多少？',
      correct: String(total),
      distractors: uniqueNum(total, [(A / g) * unit, (B / g) * unit, total + unit, realDiff * 9]),
      method: '统一乙份数得甲:乙:丙，用差对应份数求每份实际值。',
      explanation: `统一后甲:乙:丙=${A / g}:${B / g}:${C / g}；差 ${dg} 份=${realDiff}，每份 ${unit}；合计 ${total}。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardMidGap(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 35; t++) {
    const va = pickOne([80, 90, 100, 120])
    const pb = pickOne([3, 4])
    const pa = 5
    const f = pickOne([2, 3])
    const g = 5
    const gap = pickOne([36, 45, 54, 60])
    const vb = (va * pb) / pa
    if (!Number.isInteger(vb)) continue
    const fracB = (f / g) * (pb / pa)
    const midMinusB = 0.5 - fracB
    if (midMinusB <= 0) continue
    const S = gap / midMinusB
    if (!Number.isInteger(S) || S < 100) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '距中点差距求全程',
      hardTypeId: 'mid-gap',
      passage: `甲、乙两车从 A、B 两地同时相向而行。甲速 ${va} 千米/时，乙速是甲速的 ${pb}/${pa}。当甲行驶了全程的 ${f}/${g} 时，乙距中点还差 ${gap} 千米。`,
      stem: 'A、B 两地相距多少千米？',
      correct: String(S),
      distractors: uniqueNum(S, [175, 200, 225, 250, S + 25, S - 25].filter((x) => x > 0)),
      method: '时间相同 ⇒ 路程比=速度比。乙此时路程占比=甲占比×速度比；与 1/2 的差对应差距。',
      explanation: `乙走完全程的 ${fractionLabel(fracB)}；距中点 ${fractionLabel(midMinusB)}=${gap} 千米 ⇒ 全程 ${S}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '距中点差距求全程',
    hardTypeId: 'mid-gap',
    passage:
      '甲、乙从 A、B 同时相向。甲速 90 千米/时，乙速是甲的 4/5。当甲行驶了全程的 2/5 时，乙距中点还差 45 千米。',
    stem: 'A、B 两地相距多少千米？',
    correct: '250',
    distractors: uniqueNum(250, [175, 200, 225]),
    method: '乙此时走完 8/25；距中点差 9/50 对应 45，全程=250。',
    explanation: '45÷(9/50)=250。',
    seq,
  })
}

function genHardMidGapSeg(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([90, 100, 120])
    const pb = 4
    const pa = 5
    const f = 2
    const g = 5
    const gap = pickOne([45, 36, 54])
    const vb = (va * pb) / pa
    if (!Number.isInteger(vb)) continue
    const fracB = (f / g) * (pb / pa)
    const midMinusB = 0.5 - fracB
    const S = gap / midMinusB
    if (!Number.isInteger(S)) continue
    const askA = Math.random() < 0.5
    const ans = askA ? (f / g) * S : fracB * S
    if (!Number.isInteger(ans)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '同条件问已走路程',
      hardTypeId: 'mid-gap-seg',
      passage: `甲、乙从 A、B 同时相向。甲速 ${va}，乙速为甲的 ${pb}/${pa}。当甲行驶全程的 ${f}/${g} 时，乙距中点还差 ${gap} 千米。`,
      stem: askA ? '此时甲已行驶多少千米？' : '此时乙已行驶多少千米？',
      correct: String(ans),
      distractors: uniqueNum(ans, [S / 2, gap, S, ans + 10]),
      method: '先求全程，再乘以各自路程占比。',
      explanation: `全程=${S}；甲占比 ${f}/${g}，乙占比 ${fractionLabel(fracB)}；所求=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardEndGap(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([80, 90, 100])
    const pb = pickOne([3, 4])
    const pa = 5
    const f = pickOne([2, 3])
    const g = 5
    const gap = pickOne([40, 50, 60, 75])
    const vb = (va * pb) / pa
    if (!Number.isInteger(vb)) continue
    const fracB = (f / g) * (pb / pa)
    const leftToEnd = 1 - fracB
    if (leftToEnd <= 0) continue
    const S = gap / leftToEnd
    if (!Number.isInteger(S) || S < 100) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '距终点差距求全程',
      hardTypeId: 'end-gap',
      passage: `甲、乙从 A、B 同时相向。甲速 ${va}，乙速是甲的 ${pb}/${pa}。当甲行驶全程的 ${f}/${g} 时，乙距自己终点还差 ${gap} 千米。`,
      stem: 'A、B 两地相距多少千米？',
      correct: String(S),
      distractors: uniqueNum(S, [200, 225, 250, S + 25, gap * 5]),
      method: '乙已走路程占比=甲占比×速度比；距终点占比=1−该占比，对应差距求全程。',
      explanation: `乙已走 ${fractionLabel(fracB)}，距终点 ${fractionLabel(leftToEnd)}=${gap} ⇒ 全程 ${S}。`,
      seq,
    })
  }
  return null
}

function genHardMeetShare(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([60, 80, 90])
    const vb = pickOne([40, 45, 60])
    const S = pickOne([180, 200, 240, 270])
    const g = gcd(va, vb)
    const parts = va / g + vb / g
    if (S % parts !== 0) continue
    const sa = (S * (va / g)) / parts
    const sb = S - sa
    const ask = pickOne(['sa', 'sb', 'time'] as const)
    let ans: number
    let stem: string
    if (ask === 'sa') {
      ans = sa
      stem = '相遇时甲行驶了多少千米？'
    } else if (ask === 'sb') {
      ans = sb
      stem = '相遇时乙行驶了多少千米？'
    } else {
      if (sa % va !== 0) continue
      ans = sa / va
      stem = '出发后多少小时相遇？'
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '相遇路程比',
      hardTypeId: 'meet-share',
      passage: `甲、乙从相距 ${S} 千米的两地同时相向而行，甲速 ${va} 千米/时，乙速 ${vb} 千米/时。`,
      stem,
      correct: String(ans),
      distractors: uniqueNum(ans, [sa, sb, S / 2, va, vb].filter((x) => Number.isInteger(x))),
      method: '相向相遇时间相同，路程比=速度比，按份数分割全程。',
      explanation: `路程比甲:乙=${va / g}:${vb / g}；甲 ${sa}、乙 ${sb}。所求=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardChaseRatio(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([80, 90, 100])
    const vb = pickOne([50, 60, 70])
    if (va <= vb) continue
    const head = pickOne([30, 40, 50, 60])
    if (head % (va - vb) !== 0) continue
    const time = head / (va - vb)
    const ans = va * time
    if (!Number.isInteger(ans)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '同向追及比例',
      hardTypeId: 'chase-ratio',
      passage: `甲、乙同向而行，甲速 ${va}，乙速 ${vb}。乙在甲前方 ${head} 千米。`,
      stem: '甲追上乙时，甲行驶了多少千米？',
      correct: String(ans),
      distractors: uniqueNum(ans, [vb * time, head, ans - head, va]),
      method: '追及路程差÷速度差=时间；甲路程=甲速×时间。',
      explanation: `速度差 ${va - vb}，时间 ${time} 小时；甲走 ${ans} 千米。`,
      seq,
    })
  }
  return null
}

function genHardFracChange(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([100, 120])
    const pb = pickOne([3, 4])
    const pa = 5
    const f = 3
    const g = 5
    const gap = pickOne([40, 48, 56])
    const vb = (va * pb) / pa
    if (!Number.isInteger(vb)) continue
    const fracB = (f / g) * (pb / pa)
    const midMinusB = 0.5 - fracB
    if (midMinusB <= 0) continue
    const S = gap / midMinusB
    if (!Number.isInteger(S)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '改分数的中点差距',
      hardTypeId: 'frac-change',
      passage: `甲、乙从 A、B 同时相向。甲速 ${va}，乙速是甲的 ${pb}/${pa}。当甲行驶全程的 ${f}/${g} 时，乙距中点还差 ${gap} 千米。`,
      stem: '两地相距多少千米？',
      correct: String(S),
      distractors: uniqueNum(S, [200, 240, 250, 300, S + 20]),
      method: '同经典真题 2：路程比=速度比，用中点差占比求全程。',
      explanation: `乙占比 ${fractionLabel(fracB)}，距中点 ${fractionLabel(midMinusB)}=${gap} ⇒ S=${S}。`,
      seq,
    })
  }
  return null
}

function genHardAskSpeed(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const S = pickOne([200, 250, 300])
    const va = pickOne([80, 90, 100])
    const f = 2
    const g = 5
    const gap = pickOne([40, 45, 50])
    const Sa = (f / g) * S
    if (!Number.isInteger(Sa)) continue
    const Sb = S / 2 - gap
    if (Sb <= 0 || !Number.isInteger(Sb)) continue
    if (Sa % va !== 0) continue
    const time = Sa / va
    const vb = Sb / time
    if (!Number.isInteger(vb)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '已知全程反求速度',
      hardTypeId: 'ask-speed',
      passage: `A、B 相距 ${S} 千米。甲、乙同时相向，甲速 ${va}。当甲行驶全程的 ${f}/${g} 时，乙距中点还差 ${gap} 千米。`,
      stem: '乙的速度是多少千米/时？',
      correct: String(vb),
      distractors: uniqueNum(vb, [va, Math.round((va * 4) / 5), vb + 10, 60]),
      method: '由甲路程与速度求时间；乙路程=中点−差距，速度=路程÷时间。',
      explanation: `甲走 ${Sa}，用时 ${time}；乙走 ${Sb}，速度 ${vb}。`,
      seq,
    })
  }
  return null
}

function genHardTimeSlice(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const va = pickOne([80, 90, 100])
    const pb = 4
    const pa = 5
    const f = 2
    const g = 5
    const gap = pickOne([36, 45, 54])
    const vb = (va * pb) / pa
    if (!Number.isInteger(vb)) continue
    const fracB = (f / g) * (pb / pa)
    const midMinusB = 0.5 - fracB
    const S = gap / midMinusB
    if (!Number.isInteger(S)) continue
    const Sa = (f / g) * S
    if (Sa % va !== 0) continue
    const time = Sa / va
    return buildQuestion({
      difficulty: 'hard',
      term: '由位置关系求时间',
      hardTypeId: 'time-slice',
      passage: `甲、乙从相距 ${S} 千米的两地同时相向。甲速 ${va}，乙速 ${vb}。当甲行驶全程的 ${f}/${g} 时，乙距中点还差 ${gap} 千米。`,
      stem: '从出发到该时刻，经过了多少小时？',
      correct: String(time),
      distractors: uniqueNum(time, [time + 1, 2, 3, 4].filter((x) => x > 0)),
      method: '甲路程÷甲速度=时间。',
      explanation: `甲走 ${Sa} 千米，用时 ${time} 小时。`,
      seq,
    })
  }
  return null
}

function genHardOppositeLeft(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 30; t++) {
    const S = pickOne([200, 240, 300])
    const va = pickOne([60, 80, 100])
    const vb = pickOne([40, 50, 60])
    const half = S / 2
    if (half % va !== 0) continue
    const time = half / va
    const Sb = vb * time
    if (!Number.isInteger(Sb)) continue
    const toMid = half - Sb
    if (toMid <= 0 || !Number.isInteger(toMid)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '一方到中点时另一方位置',
      hardTypeId: 'opposite-left',
      passage: `甲、乙从相距 ${S} 千米的两地同时相向，甲速 ${va}，乙速 ${vb}。`,
      stem: '当甲到达中点时，乙距中点还差多少千米？',
      correct: String(toMid),
      distractors: uniqueNum(toMid, [Sb, half, Math.abs(va - vb), toMid + 10]),
      method: '甲到中点用时=半程÷甲速；乙路程=乙速×时间；再与半程作差。',
      explanation: `甲到中点用时 ${time}；乙走 ${Sb}；距中点 ${toMid}。`,
      seq,
    })
  }
  return null
}

function genHardRatioUnifyTravel(seq: number): RatioMethodQuestion | null {
  for (let t = 0; t < 25; t++) {
    const a = pickOne([2, 3])
    const b = pickOne([3, 4])
    const c = pickOne([4, 5])
    const g = gcd(gcd(a, b), c)
    const A = a / g
    const B = b / g
    const C = c / g
    const unit = pickOne([10, 12, 15, 20])
    const S = (A + B + C) * unit
    const which = pickOne([0, 1, 2] as const)
    const known = [A, B, C][which]! * unit
    const label = ['第一段', '第二段', '第三段'][which]!
    return buildQuestion({
      difficulty: 'hard',
      term: '行程三段比例统一',
      hardTypeId: 'ratio-unify-travel',
      passage: `一条公路分三段，路程比为 ${A}:${B}:${C}。其中${label}长 ${known} 千米。`,
      stem: '公路全长多少千米？',
      correct: String(S),
      distractors: uniqueNum(S, [known * 3, S + unit, (A + B) * unit, S - unit]),
      method: '按份数：已知段对应份数，求每份长度后求总和。',
      explanation: `${label}占 ${known / unit} 份=${known} 千米，每份 ${unit}；全程 ${S}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  RatioMethodHardTypeId,
  (seq: number) => RatioMethodQuestion | null
> = {
  'mid-gap': genHardMidGap,
  'mid-gap-seg': genHardMidGapSeg,
  'end-gap': genHardEndGap,
  'meet-share': genHardMeetShare,
  'chase-ratio': genHardChaseRatio,
  'frac-change': genHardFracChange,
  'ask-speed': genHardAskSpeed,
  'time-slice': genHardTimeSlice,
  'opposite-left': genHardOppositeLeft,
  'ratio-unify-travel': genHardRatioUnifyTravel,
}

function tryBuild(
  factory: () => RatioMethodQuestion | null,
  maxTry = 35,
): RatioMethodQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateRatioMethodPaper(
  difficulty: RatioMethodDifficulty,
): RatioMethodQuestion[] {
  const out: RatioMethodQuestion[] = []
  const seen = new Set<string>()

  const push = (q: RatioMethodQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyDiffParts, genEasySumParts, genEasyUnifySimple]
    let guard = 0
    while (out.length < RATIO_METHOD_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumTransferRatio(0),
      () => genMediumTransferRatio(1),
      () => genMediumUnifyThree(2),
      () => genMediumTransferRatio(3),
      () => genMediumUnifyThree(4),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < RATIO_METHOD_QUESTION_COUNT && guard++ < 40) {
      push(tryBuild(() => genMediumTransferRatio(out.length)))
    }
  } else {
    const types = shuffleInPlace([...RATIO_METHOD_HARD_EXAM_TYPES.map((t) => t.id)])
    for (const typeId of types) {
      if (out.length >= RATIO_METHOD_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 50))
    }
    if (out.length < RATIO_METHOD_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= RATIO_METHOD_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 60)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < RATIO_METHOD_QUESTION_COUNT) {
    throw new Error(`比例法组卷不足：仅 ${out.length}/${RATIO_METHOD_QUESTION_COUNT}`)
  }
  return out.slice(0, RATIO_METHOD_QUESTION_COUNT)
}
