/**
 * 运算技巧 · 特值法
 * 本地程序出题（不调用 AI）。每轮 8 题四选一。仅简单 / 困难。
 *
 * 【简单】书中 4 类经典格式各 2 题（共 8）：
 * 1. set-one：设效率为 1（工程加人）
 * 2. set-100：设特殊值为 100（百分数）
 * 3. set-lcm：设特殊值为公倍数（行程相遇）
 * 4. set-ratio：设特殊值为比例份数（工程比）
 *
 * 【困难题型库 · 4 类加强 + 额外变式 ≥8 种，共 ≥12；每轮抽 8 种且互不重复】
 * 1. work-one-hard：工程加人（难于真题 1）
 * 2. pct-100-hard：百分数设 100（难于真题 2）
 * 3. lcm-meet-hard：公倍数行程（难于真题 3）
 * 4. ratio-share-hard：比例份数工程（难于真题 4）
 * 5. work-pipes：水管工程设效率 1
 * 6. concentration-100：溶液浓度设总量 100
 * 7. profit-100：利润折扣设成本 100
 * 8. roundtrip-lcm：往返行程设路程为 LCM
 * 9. three-speed-lcm：三车行程设 LCM
 * 10. ratio-chain：三量比例份数统一
 * 11. coop-ratio-share：合作工程先求比再特值
 * 12. pct-change-100：连续百分变化设基数 100
 * 13. inverse-lcm：反比例（人×天）设总量为 LCM
 * 14. leftover-one：剩余工程设人效 1
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SpecValDifficulty = 'easy' | 'hard'

export const SPEC_VAL_QUESTION_COUNT = 8

export const SPEC_VAL_MODES: {
  id: SpecValDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '特值法 · 简单',
    desc: '每轮 8 题 · 4 类经典格式各 2 题（设 1 / 设 100 / 设公倍数 / 设份数）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '特值法 · 困难',
    desc: '每轮 8 题 · 难于经典的 14 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const SPEC_VAL_EASY_TYPES = [
  { id: 'set-one', name: '设特殊值为 1（工程）' },
  { id: 'set-100', name: '设特殊值为 100（百分数）' },
  { id: 'set-lcm', name: '设特殊值为公倍数（行程）' },
  { id: 'set-ratio', name: '设特殊值为比例份数（工程比）' },
] as const

export const SPEC_VAL_HARD_EXAM_TYPES = [
  { id: 'work-one-hard', name: '工程加人（加强真题 1）', note: '设人效为 1，数字更大/环节更多' },
  { id: 'pct-100-hard', name: '百分数设 100（加强真题 2）', note: '多层百分变化，设基数 100' },
  { id: 'lcm-meet-hard', name: '公倍数行程（加强真题 3）', note: '设路程为 LCM，追及/折返更绕' },
  { id: 'ratio-share-hard', name: '比例份数（加强真题 4）', note: '先得效率比再设份数' },
  { id: 'work-pipes', name: '水管工程设效率 1', note: '进水管/出水管，特值 1' },
  { id: 'concentration-100', name: '溶液浓度设 100', note: '溶质/溶液设方便整数' },
  { id: 'profit-100', name: '利润折扣设成本 100', note: '成本 100 算利润率' },
  { id: 'roundtrip-lcm', name: '往返行程设 LCM', note: '去与回时间不同，路程取 LCM' },
  { id: 'three-speed-lcm', name: '三车行程设 LCM', note: '三车时间的 LCM 为路程' },
  { id: 'ratio-chain', name: '三量比例份数', note: 'A:B、B:C 统一份数' },
  { id: 'coop-ratio-share', name: '合作工程比+特值', note: '合作已知，求单独天数' },
  { id: 'pct-change-100', name: '连续涨跌设 100', note: '连乘百分变化' },
  { id: 'inverse-lcm', name: '反比例人×天设 LCM', note: '工作量=人×天，取 LCM' },
  { id: 'leftover-one', name: '剩余工程设人效 1', note: '先做若干天再加人' },
] as const

export type SpecValEasyTypeId = (typeof SPEC_VAL_EASY_TYPES)[number]['id']
export type SpecValHardTypeId = (typeof SPEC_VAL_HARD_EXAM_TYPES)[number]['id']

export type SpecValQuestion = {
  id: string
  topic: 'spec-val'
  difficulty: SpecValDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  easyTypeId?: SpecValEasyTypeId
  hardTypeId?: SpecValHardTypeId
}

export function specValTopicLabel(): string {
  return '特值法'
}

export function specValDifficultyLabel(d: SpecValDifficulty): string {
  return d === 'easy' ? '简单' : '困难'
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

function lcmMany(nums: number[]): number {
  return nums.reduce((acc, n) => lcm2(acc, n), 1)
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
  difficulty: SpecValDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  easyTypeId?: SpecValEasyTypeId
  hardTypeId?: SpecValHardTypeId
  seq: number
}): SpecValQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'spec-val',
    input.difficulty,
    input.easyTypeId ?? input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `spec-val-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'spec-val',
    difficulty: input.difficulty,
    term: input.term,
    passage: (input.passage ?? '').trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method,
    explanation: input.explanation.trim(),
    fingerprint,
    easyTypeId: input.easyTypeId,
    hardTypeId: input.hardTypeId,
  }
}

// ——— 简单：4 类各 2 道 ———

function genEasySetOne(seq: number): SpecValQuestion | null {
  // 人效=1；n 人 d 天；做了 t 天，提前 e 天，求加人
  const pool = [
    { n: 10, d: 30, t: 6, e: 8, ans: 5 }, // classic
    { n: 8, d: 20, t: 5, e: 3, ans: 2 }, // total=160, done=40, left=120, remDays=20-5-3=12, need=10, add=2
    { n: 6, d: 24, t: 4, e: 4, ans: 2 }, // 144, 24, 120, rem=16, need=7.5 no
    { n: 12, d: 20, t: 5, e: 5, ans: 4 }, // 240,60,180, rem=10, need=18, add=6 — fix
    { n: 5, d: 18, t: 3, e: 3, ans: 1 }, // 90,15,75, rem=12, need=6.25 no
    { n: 10, d: 24, t: 6, e: 6, ans: 5 }, // 240,60,180, rem=12, need=15, add=5
    { n: 8, d: 15, t: 3, e: 3, ans: 2 }, // 120,24,96, rem=9, need=10.67 no
    { n: 9, d: 20, t: 4, e: 4, ans: 3 }, // 180,36,144, rem=12, need=12, add=3
  ]
  const valid = pool.filter((c) => {
    const total = c.n * c.d
    const done = c.n * c.t
    const left = total - done
    const remDays = c.d - c.t - c.e
    if (remDays <= 0) return false
    const need = left / remDays
    return Number.isInteger(need) && need - c.n === c.ans
  })
  if (!valid.length) return null
  const c = pickOne(valid)
  return buildQuestion({
    difficulty: 'easy',
    term: '设效率为 1',
    easyTypeId: 'set-one',
    passage: `一项工程，${c.n} 人做需 ${c.d} 天完成。现已做 ${c.t} 天，要求提前 ${c.e} 天完工。`,
    stem: '至少需要增加多少人？',
    correct: String(c.ans),
    distractors: uniqueNum(c.ans, [c.ans + 1, c.ans - 1, 4, 5, 6, 7].filter((x) => x > 0)),
    method: '设每人每天工作量为 1。总量=人数×天数；算出剩余量与剩余天数，再求所需人数。',
    explanation: `总量=${c.n}×${c.d}=${c.n * c.d}。已完成=${c.n}×${c.t}。剩余 ${c.n * c.d - c.n * c.t}，剩余 ${c.d - c.t - c.e} 天，需 ${c.n + c.ans} 人，增加 ${c.ans} 人。`,
    seq,
  })
}

function genEasySet100(seq: number): SpecValQuestion | null {
  const pool: {
    passage: string
    stem: string
    ans: string
    distractors: string[]
    method: string
    explain: string
  }[] = [
    {
      passage: '某商品进价为某数。按进价加价 20% 标价，再以 9 折出售。',
      stem: '利润为进价的百分之几？',
      ans: '8%',
      distractors: ['10%', '12%', '20%'],
      method: '设进价为 100。标价 120，售价 108，利润 8，即 8%。',
      explain: '进价 100 → 标价 120 → 售价 108 → 利润 8，利润率 8%。',
    },
    {
      passage: '某班男生人数比女生多 25%。已知女生 40 人。',
      stem: '男生多少人？',
      ans: '50',
      distractors: ['45', '48', '60'],
      method: '可设女生对应 100 份再缩放；或直接 40×1.25。',
      explain: '男生=40×(1+25%)=50。',
    },
    {
      passage: '一件商品降价 20% 后售价为 80 元。',
      stem: '原价是多少元？',
      ans: '100',
      distractors: ['96', '90', '120'],
      method: '设原价为 100，降价后对应 80，与题中售价一致。',
      explain: '80÷(1−20%)=100。',
    },
    {
      passage: '今年产值比去年增长 25%。',
      stem: '若去年产值设为 100，则今年产值对应多少？',
      ans: '125',
      distractors: ['120', '130', '75'],
      method: '百分数问题常设基数为 100。',
      explain: '100×(1+25%)=125。',
    },
  ]
  const c = pickOne(pool)
  return buildQuestion({
    difficulty: 'easy',
    term: '设特殊值为 100',
    easyTypeId: 'set-100',
    passage: c.passage,
    stem: c.stem,
    correct: c.ans,
    distractors: uniqueOpt(c.ans, c.distractors),
    method: c.method,
    explanation: c.explain,
    seq,
  })
}

function genEasySetLcm(seq: number): SpecValQuestion | null {
  const pool = [
    { t1: 8, t2: 12, ans: '1.6', // classic meet after return? simplified: opposite meet
      // For simple: A alone 8h, B alone 12h, same direction? Classic is: HS 8h, bullet 12h, HS returns, meet after HS arrives...
      // Simple version: 同时相向，多久相遇 = 1/(1/8+1/12)=24/5=4.8 — different
      // Simple: 甲 6 小时、乙 8 小时走完，同时相向，相遇时间
      mode: 'meet' as const,
    },
    { t1: 6, t2: 8, ans: '3.428571', mode: 'meet' as const },
  ]
  // Clean integer-friendly:
  // Distance LCM(t1,t2), meet time = dist/(v1+v2) for opposite
  const cases = [
    { t1: 6, t2: 8, kind: 'opposite', ans: 3.428571 }, // bad
  ]
  void pool
  void cases
  const good = [
    { t1: 4, t2: 6, kind: 'opposite' as const, ans: 2.4 }, // dist=12, v=3+2, t=12/5=2.4
    { t1: 5, t2: 20, kind: 'opposite' as const, ans: 4 }, // 20, 4+1, t=4
    { t1: 6, t2: 12, kind: 'opposite' as const, ans: 4 }, // 12, 2+1, t=4
    { t1: 8, t2: 12, kind: 'chase' as const, ans: 24 }, // same dir: dist/(v1-v2)=24/(3-2)=24 — too long as "hours for full chase from start"
    // Classic-like simplified: 甲 8h、乙 12h 走完同一路程，同时出发相向，相遇几小时
    { t1: 8, t2: 12, kind: 'opposite' as const, ans: 4.8 },
    { t1: 3, t2: 6, kind: 'opposite' as const, ans: 2 },
  ]
  const c = pickOne(good.filter((x) => x.kind === 'opposite'))
  const dist = lcm2(c.t1, c.t2)
  const v1 = dist / c.t1
  const v2 = dist / c.t2
  const t = dist / (v1 + v2)
  const ansStr = Number.isInteger(t) ? String(t) : String(Math.round(t * 10) / 10)
  // verify
  if (Math.abs(t - Number(ansStr)) > 1e-9 && !Number.isInteger(t)) {
    // use one decimal
  }
  const correct = Number.isInteger(t) ? String(t) : parseFloat(t.toFixed(1)).toString()
  return buildQuestion({
    difficulty: 'easy',
    term: '设特殊值为公倍数',
    easyTypeId: 'set-lcm',
    passage: `甲车走完全程需 ${c.t1} 小时，乙车需 ${c.t2} 小时。两车同时从两端相向而行。`,
    stem: '几小时后相遇？',
    correct,
    distractors: uniqueOpt(correct, [
      String(c.t1),
      String(c.t2),
      String(dist / Math.abs(v1 - v2)),
      '1.5',
      '1.6',
      '3',
    ]),
    method: `设全程为 ${c.t1}、${c.t2} 的最小公倍数 ${dist}，则速度分别为 ${v1}、${v2}，相遇时间=路程÷速度和。`,
    explanation: `路程=${dist}，速度 ${v1}+${v2}=${v1 + v2}，相遇时间=${correct} 小时。`,
    seq,
  })
}

function genEasySetRatio(seq: number): SpecValQuestion | null {
  // 甲5天+乙4天=甲6天+乙2天 → A:B=2:1，总量14，乙单独14天
  const pool = [
    { a1: 5, b1: 4, a2: 6, b2: 2, ask: 'b' as const, ans: 14 }, // classic
    { a1: 3, b1: 6, a2: 5, b2: 2, ask: 'b' as const, ans: 0 }, // 3A+6B=5A+2B → 4B=2A → A:B=2:1, total=3*2+6*1=12, B alone=12
    { a1: 4, b1: 5, a2: 6, b2: 2, ask: 'a' as const, ans: 0 },
  ]
  const valid: { a1: number; b1: number; a2: number; b2: number; ask: 'a' | 'b'; ans: number; ar: number; br: number; total: number }[] = []
  for (const p of [
    { a1: 5, b1: 4, a2: 6, b2: 2, ask: 'b' as const },
    { a1: 3, b1: 6, a2: 5, b2: 2, ask: 'b' as const },
    { a1: 2, b1: 5, a2: 4, b2: 3, ask: 'a' as const },
    { a1: 4, b1: 3, a2: 5, b2: 1, ask: 'b' as const },
  ]) {
    // a1*A+b1*B = a2*A+b2*B => (b1-b2)B = (a2-a1)A => A:B = (b1-b2):(a2-a1)
    const ar = p.b1 - p.b2
    const br = p.a2 - p.a1
    if (ar <= 0 || br <= 0) continue
    const g = gcd(ar, br)
    const A = ar / g
    const B = br / g
    const total = p.a1 * A + p.b1 * B
    const ans = p.ask === 'b' ? total / B : total / A
    if (!Number.isInteger(ans)) continue
    valid.push({ ...p, ans, ar: A, br: B, total })
  }
  if (!valid.length) return null
  const c = pickOne(valid)
  void pool
  return buildQuestion({
    difficulty: 'easy',
    term: '设特殊值为比例份数',
    easyTypeId: 'set-ratio',
    passage: `一项工程，甲先做 ${c.a1} 天、乙再做 ${c.b1} 天可完成；若甲先做 ${c.a2} 天、乙再做 ${c.b2} 天也可完成。`,
    stem: c.ask === 'b' ? '乙单独完成需要多少天？' : '甲单独完成需要多少天？',
    correct: String(c.ans),
    distractors: uniqueNum(c.ans, [12, 13, 14, 15, c.ans + 1, c.ans - 1].filter((x) => x > 0)),
    method: '由两种完工方式列等式得效率比，再设份数为特值，算总量与单独天数。',
    explanation: `效率比甲:乙=${c.ar}:${c.br}。设甲每天 ${c.ar}、乙每天 ${c.br}，总量=${c.total}，所求=${c.ans} 天。`,
    seq,
  })
}

// ——— 困难 ———

function genHardWorkOne(seq: number): SpecValQuestion | null {
  const pool = [
    { n: 12, d: 30, t: 10, e: 5, ans: 6 }, // 360,120,240, rem=15, need=16, add=4 — recalc
  ]
  void pool
  for (let attempt = 0; attempt < 40; attempt++) {
    const n = pickOne([10, 12, 15, 16, 20])
    const d = pickOne([24, 30, 36, 40])
    const t = pickOne([6, 8, 10, 12])
    const e = pickOne([4, 5, 6, 8])
    if (t + e >= d) continue
    const total = n * d
    const done = n * t
    const left = total - done
    const rem = d - t - e
    if (left % rem !== 0) continue
    const need = left / rem
    const ans = need - n
    if (ans <= 0 || ans > 20) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '工程加人（加强）',
      hardTypeId: 'work-one-hard',
      passage: `${n} 人做一项工程需 ${d} 天。已做 ${t} 天后要求提前 ${e} 天完工，且中途效率不变。`,
      stem: '应增加多少人？',
      correct: String(ans),
      distractors: uniqueNum(ans, [ans + 1, ans - 1, ans + 2, 5, 6, 8].filter((x) => x > 0)),
      method: '设每人每天工作量=1。算总量、已做、剩余与剩余天数，再求所需人数差。',
      explanation: `总量=${total}，已做=${done}，剩余=${left}，剩 ${rem} 天需 ${need} 人，增加 ${ans} 人。`,
      seq,
    })
  }
  return null
}

function genHardPct100(seq: number): SpecValQuestion | null {
  // 固定可解模板 + 参数微调
  const templates = [
    { p: 40, q: 20, r: 20, ans: '25:1' }, // classic
    { p: 50, q: 20, r: 20, ans: '' }, // compute
  ]
  void templates
  // 简化加强版：设基数 100 的利润/销量题，保证有解
  const cases = [
    {
      passage:
        '某商品成本设为 100 元。先提价 50% 标价，再连续两次打 8 折出售。',
      stem: '最终售价是多少元？',
      ans: '96',
      // 100*1.5=150, 150*0.8=120, 120*0.8=96
      distractors: ['80', '100', '120'],
      method: '设成本 100，按提价与折扣连乘。',
      explain: '100×1.5×0.8×0.8=96。',
    },
    {
      passage: '二月营业额为 100。三月比二月增长 25%，四月比三月下降 20%。',
      stem: '四月营业额相当于二月的多少？',
      ans: '100',
      distractors: ['105', '80', '125'],
      method: '设二月=100，连续乘涨跌系数。',
      explain: '100×1.25×0.8=100。',
    },
    {
      passage:
        '停车场二月夜晚停车时长设为 100，白昼比夜晚多 40%；三月总时长比二月多 20%，白昼比夜晚少 40%，且三月总收入比二月少 20%。',
      stem: '白昼单价与夜晚单价之比是？',
      ans: '25:1',
      distractors: ['3:1', '5:1', '15:1'],
      method: '设二月夜=100，推各时长后列收入方程。',
      explain: '二月昼=140；三月总=288，夜=180，昼=108；由收入关系得 25:1。',
    },
  ]
  const c = pickOne(cases)
  return buildQuestion({
    difficulty: 'hard',
    term: '百分数设 100（加强）',
    hardTypeId: 'pct-100-hard',
    passage: c.passage,
    stem: c.stem,
    correct: c.ans,
    distractors: uniqueOpt(c.ans, c.distractors),
    method: c.method,
    explanation: c.explain,
    seq,
  })
}

function genHardLcmMeet(seq: number): SpecValQuestion | null {
  // 高铁 t1、动车 t2，同时出发，高铁到站立刻返回，何时相遇（在动车到达前）
  for (let attempt = 0; attempt < 40; attempt++) {
    const t1 = pickOne([6, 8, 9, 10])
    const t2 = pickOne([10, 12, 15, 18])
    if (t1 >= t2) continue
    const dist = lcm2(t1, t2)
    const v1 = dist / t1
    const v2 = dist / t2
    // After t1 hours, HS at Beijing and returns; bullet traveled v2*t1; gap = dist - v2*t1
    const gap = dist - v2 * t1
    if (gap <= 0) continue
    const meetAfter = gap / (v1 + v2)
    const totalTime = t1 + meetAfter
    if (totalTime >= t2) continue
    if (
      !Number.isInteger(meetAfter) &&
      Math.abs(meetAfter * 10 - Math.round(meetAfter * 10)) > 1e-6
    ) {
      continue
    }
    const ansMeet = Number.isInteger(meetAfter)
      ? String(meetAfter)
      : parseFloat(meetAfter.toFixed(1)).toString()
    return buildQuestion({
      difficulty: 'hard',
      term: '公倍数行程（加强）',
      hardTypeId: 'lcm-meet-hard',
      passage: `甲地到乙地，高铁需 ${t1} 小时，动车需 ${t2} 小时。两车同时从甲地出发，高铁到达乙地后立刻返回，与仍在前往乙地的动车相遇。`,
      stem: '高铁掉头后，再过多久与动车相遇？',
      correct: ansMeet,
      distractors: uniqueOpt(ansMeet, ['1', '1.2', '1.5', '1.6', String(t1), '2']),
      method: `设路程为 ${t1}、${t2} 的最小公倍数 ${dist}。先算高铁到站时动车位置，再按相向速度求相遇时间。`,
      explanation: `路程=${dist}。高铁到站时动车已走 ${v2 * t1}，相距 ${gap}；相向再经 ${ansMeet} 小时相遇。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '公倍数行程（加强）',
    hardTypeId: 'lcm-meet-hard',
    passage:
      '广州到北京：高铁 8 小时，动车 12 小时。两车同时出发，高铁到京立刻返回，与动车相遇。',
    stem: '高铁掉头后，再过多久与动车相遇？',
    correct: '1.6',
    distractors: uniqueOpt('1.6', ['1', '1.2', '1.5', '8']),
    method: '设路程 24。高铁 8 小时到京时动车走 16，相距 8；相向速度 5，再 1.6 小时相遇。',
    explanation: '8÷(3+2)=1.6 小时。',
    seq,
  })
}

function genHardRatioShare(seq: number): SpecValQuestion | null {
  for (let attempt = 0; attempt < 40; attempt++) {
    const a1 = randInt(3, 7)
    const b1 = randInt(2, 6)
    const a2 = a1 + randInt(1, 3)
    const b2 = randInt(1, b1 - 1)
    const ar = b1 - b2
    const br = a2 - a1
    if (ar <= 0 || br <= 0) continue
    const g = gcd(ar, br)
    const A = ar / g
    const B = br / g
    const total = a1 * A + b1 * B
    const askB = Math.random() < 0.5
    const ans = askB ? total / B : total / A
    if (!Number.isInteger(ans) || ans < 5 || ans > 40) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '比例份数（加强）',
      hardTypeId: 'ratio-share-hard',
      passage: `一项工程：甲先做 ${a1} 天、乙再做 ${b1} 天完成；甲先做 ${a2} 天、乙再做 ${b2} 天也能完成。`,
      stem: askB ? '乙单独做需多少天？' : '甲单独做需多少天？',
      correct: String(ans),
      distractors: uniqueNum(ans, [12, 13, 14, 15, ans + 2, ans - 2].filter((x) => x > 0)),
      method: '两式相等得效率比，设份数为特值，算总量与单独天数。',
      explanation: `甲:乙=${A}:${B}，总量=${total}，所求=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardPipes(seq: number): SpecValQuestion | null {
  // 单进 t1 天满，单出 t2 天抽空；同开多久满？设容量 LCM
  for (let attempt = 0; attempt < 30; attempt++) {
    const tin = pickOne([4, 5, 6, 8])
    const tout = pickOne([6, 8, 10, 12])
    if (tin >= tout) continue // net fill
    const cap = lcm2(tin, tout)
    const vin = cap / tin
    const vout = cap / tout
    const net = vin - vout
    if (cap % net !== 0) continue
    const ans = cap / net
    return buildQuestion({
      difficulty: 'hard',
      term: '水管工程设效率 1',
      hardTypeId: 'work-pipes',
      passage: `一水池，单开进水管 ${tin} 小时注满，单开出水管 ${tout} 小时放空。`,
      stem: '两管同时开，多少小时注满？',
      correct: String(ans),
      distractors: uniqueNum(ans, [tin, tout, ans + 1, tin + tout]),
      method: `设池容量为 ${tin}、${tout} 的最小公倍数 ${cap}，净效率=进−出。`,
      explanation: `容量=${cap}，净效率=${net}，需 ${ans} 小时。`,
      seq,
    })
  }
  return null
}

function genHardConcentration(seq: number): SpecValQuestion | null {
  // 设溶液 100，浓度 c%，蒸发后浓度变
  for (let attempt = 0; attempt < 25; attempt++) {
    const c0 = pickOne([10, 20, 25, 40])
    const c1 = pickOne([20, 25, 40, 50])
    if (c1 <= c0) continue
    // 100 溶液，溶质 c0；蒸发后浓度 c1 => 溶液 = 100*c0/c1
    const sol1 = (100 * c0) / c1
    if (!Number.isInteger(sol1)) continue
    const evaporated = 100 - sol1
    return buildQuestion({
      difficulty: 'hard',
      term: '溶液浓度设 100',
      hardTypeId: 'concentration-100',
      passage: `一杯 ${c0}% 的盐水，蒸发部分水后浓度变为 ${c1}%。`,
      stem: '若原溶液设为 100 克，蒸发了多少克水？',
      correct: String(evaporated),
      distractors: uniqueNum(evaporated, [c0, c1, 100 - c0, evaporated + 5]),
      method: '设原溶液 100 克，溶质不变，用浓度反推蒸发后溶液质量。',
      explanation: `溶质=${c0} 克；蒸发后溶液=${sol1} 克；蒸发水=${evaporated} 克。`,
      seq,
    })
  }
  return null
}

function genHardProfit100(seq: number): SpecValQuestion | null {
  for (let attempt = 0; attempt < 20; attempt++) {
    const markup = pickOne([20, 25, 40, 50])
    const discount = pickOne([80, 85, 90])
    const list = 100 + markup
    const sell = (list * discount) / 100
    if (!Number.isInteger(sell)) continue
    const profit = sell - 100
    const ans = `${profit}%`
    const zhe = discount / 10
    return buildQuestion({
      difficulty: 'hard',
      term: '利润折扣设成本 100',
      hardTypeId: 'profit-100',
      passage: `商品加价 ${markup}% 标价后，再打 ${zhe} 折出售。`,
      stem: '利润率是？',
      correct: ans,
      distractors: uniqueOpt(ans, [`${markup}%`, '10%', '8%', `${profit + 2}%`, '15%']),
      method: '设成本为 100，算标价与售价，利润÷成本。',
      explanation: `成本 100 → 标价 ${list} → 售价 ${sell} → 利润 ${profit}，利润率 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardRoundtrip(seq: number): SpecValQuestion | null {
  // 去 t1 回 t2，全程往返平均速度相关：设路程 LCM，问平均速度或往返总时间
  for (let attempt = 0; attempt < 25; attempt++) {
    const t1 = pickOne([3, 4, 5, 6])
    const t2 = pickOne([4, 5, 6, 8])
    if (t1 === t2) continue
    const dist = lcm2(t1, t2)
    const v1 = dist / t1
    const v2 = dist / t2
    // 往返平均速度 = 2*dist/(t1+t2) 对应「单位路程」时
    const avg = (2 * dist) / (t1 + t2)
    if (!Number.isInteger(avg)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '往返行程设 LCM',
      hardTypeId: 'roundtrip-lcm',
      passage: `某车去程需 ${t1} 小时，回程需 ${t2} 小时（路程相同）。`,
      stem: '往返的平均速度是多少？（设单程为两时间的最小公倍数）',
      correct: String(avg),
      distractors: uniqueNum(avg, [v1, v2, (v1 + v2) / 2, avg + 1].map((x) => Math.round(x))),
      method: `设单程=${dist}，去速 ${v1}、回速 ${v2}；平均速度=总路程÷总时间。`,
      explanation: `往返路程 ${2 * dist}，时间 ${t1 + t2}，平均速度=${avg}。`,
      seq,
    })
  }
  return null
}

function genHardThreeSpeed(seq: number): SpecValQuestion | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const t1 = pickOne([3, 4, 6])
    const t2 = pickOne([4, 6, 8])
    const t3 = pickOne([6, 8, 12])
    if (new Set([t1, t2, t3]).size < 3) continue
    const dist = lcmMany([t1, t2, t3])
    const v1 = dist / t1
    const v2 = dist / t2
    const v3 = dist / t3
    // 三车同时同向从起点出发， eth最快追上最慢？ from start gap 0 - instead: A,B opposite meet time
    // Ask: 甲乙相向相遇时间
    const meet = dist / (v1 + v2)
    if (!Number.isInteger(meet) && Math.abs(meet * 2 - Math.round(meet * 2)) > 1e-9) continue
    const ans = Number.isInteger(meet) ? String(meet) : String(meet)
    if (!Number.isInteger(meet)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三车行程设 LCM',
      hardTypeId: 'three-speed-lcm',
      passage: `同一路程：甲需 ${t1} 小时，乙需 ${t2} 小时，丙需 ${t3} 小时。甲、乙从两端同时相向而行。`,
      stem: '甲乙多少小时后相遇？',
      correct: ans,
      distractors: uniqueNum(Number(ans), [t1, t2, t3, Number(ans) + 1]),
      method: `设路程为 ${t1},${t2},${t3} 的最小公倍数 ${dist}，再算甲乙速度和。`,
      explanation: `路程=${dist}，甲速 ${v1}、乙速 ${v2}，相遇 ${ans} 小时。（丙速 ${v3} 为干扰信息。）`,
      seq,
    })
  }
  return null
}

function genHardRatioChain(seq: number): SpecValQuestion | null {
  for (let attempt = 0; attempt < 25; attempt++) {
    const a = pickOne([2, 3, 4])
    const b1 = pickOne([3, 4, 5])
    const b2 = pickOne([2, 3, 5])
    const c = pickOne([3, 4, 5, 7])
    // A:B=a:b1, B:C=b2:c → unify B as lcm(b1,b2)
    const B = lcm2(b1, b2)
    const A = (B / b1) * a
    const C = (B / b2) * c
    const diff = Math.abs(A - C)
    if (diff === 0) continue
    const realDiff = pickOne([6, 8, 10, 12])
    // 1 share = realDiff/diff
    if (realDiff % diff !== 0) continue
    const unit = realDiff / diff
    const total = (A + B + C) * unit
    return buildQuestion({
      difficulty: 'hard',
      term: '三量比例份数',
      hardTypeId: 'ratio-chain',
      passage: `甲:乙=${a}:${b1}，乙:丙=${b2}:${c}。甲比丙多 ${realDiff} 人（或相应量）。`,
      stem: '三人（三部分）合计是多少？',
      correct: String(total),
      distractors: uniqueNum(total, [A * unit, B * unit, total + unit, realDiff * 9]),
      method: '先统一乙的份数得甲:乙:丙，再由差对应份数求每份实际值。',
      explanation: `统一后甲:乙:丙=${A}:${B}:${C}；差 ${diff} 份=${realDiff}，每份 ${unit}；合计 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardCoopRatio(seq: number): SpecValQuestion | null {
  // 甲乙合作 t 天完成，效率比 m:n，求甲单独
  for (let attempt = 0; attempt < 25; attempt++) {
    const m = pickOne([2, 3, 4])
    const n = pickOne([1, 2, 3])
    if (m === n) continue
    const coop = pickOne([6, 8, 10, 12])
    const total = (m + n) * coop
    const ans = total / m
    if (!Number.isInteger(ans)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '合作工程比+特值',
      hardTypeId: 'coop-ratio-share',
      passage: `甲、乙效率比为 ${m}:${n}，两人合作 ${coop} 天完成一项工程。`,
      stem: '甲单独完成需要多少天？',
      correct: String(ans),
      distractors: uniqueNum(ans, [coop, total / n, ans + 2, m + n].filter((x) => Number.isInteger(x))),
      method: '设效率为 m、n，总量=(m+n)×合作天数；甲单独=总量/m。',
      explanation: `总量=${total}，甲每天 ${m}，单独 ${ans} 天。`,
      seq,
    })
  }
  return null
}

function genHardPctChange(seq: number): SpecValQuestion | null {
  for (let attempt = 0; attempt < 20; attempt++) {
    const up = pickOne([10, 20, 25])
    const down = pickOne([10, 20, 25])
    // 100 * (1+u/100)*(1-d/100)
    const final = (100 * (100 + up) * (100 - down)) / 10000
    if (!Number.isInteger(final)) continue
    const change = final - 100
    const ans = change === 0 ? '不变' : change > 0 ? `上升 ${change}%` : `下降 ${Math.abs(change)}%`
    return buildQuestion({
      difficulty: 'hard',
      term: '连续涨跌设 100',
      hardTypeId: 'pct-change-100',
      passage: `某商品先涨价 ${up}%，再降价 ${down}%。`,
      stem: '与原价相比，最终价格如何变化？',
      correct: ans,
      distractors: uniqueOpt(ans, ['不变', `上升 ${up}%`, `下降 ${down}%`, `下降 ${up}%`, '上升 2%']),
      method: '设原价 100，连续乘以涨跌系数，再与 100 比较。',
      explanation: `100×${1 + up / 100}×${1 - down / 100}=${final}，故${ans}。`,
      seq,
    })
  }
  return null
}

function genHardInverseLcm(seq: number): SpecValQuestion | null {
  // m1 人 d1 天；现 m2 人需几天。总量=m1*d1，设或直接
  for (let attempt = 0; attempt < 25; attempt++) {
    const m1 = pickOne([6, 8, 10, 12])
    const d1 = pickOne([12, 15, 18, 20])
    const m2 = pickOne([8, 9, 10, 15])
    if (m2 === m1) continue
    const total = m1 * d1
    if (total % m2 !== 0) continue
    const ans = total / m2
    return buildQuestion({
      difficulty: 'hard',
      term: '反比例人×天设 LCM',
      hardTypeId: 'inverse-lcm',
      passage: `${m1} 人做一项工程需 ${d1} 天（效率相同）。`,
      stem: `若改为 ${m2} 人做，需要多少天？`,
      correct: String(ans),
      distractors: uniqueNum(ans, [d1, m1, ans + 1, d1 - 2].filter((x) => x > 0)),
      method: '工作量=人数×天数（特值人效=1）。总量不变，反比例求天数。',
      explanation: `总量=${total}，${m2} 人需 ${ans} 天。`,
      seq,
    })
  }
  return null
}

function genHardLeftoverOne(seq: number): SpecValQuestion | null {
  // n 人计划 d 天；做了 t 天，余下由 n+add 人做完还要 k 天，求 add 或总量相关
  for (let attempt = 0; attempt < 40; attempt++) {
    const n = pickOne([8, 10, 12])
    const d = pickOne([20, 24, 30])
    const t = pickOne([5, 6, 8])
    const add = pickOne([2, 3, 4, 5])
    const total = n * d
    const done = n * t
    const left = total - done
    const needPeople = n + add
    if (left % needPeople !== 0) continue
    const k = left / needPeople
    if (k <= 0 || k >= d) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '剩余工程设人效 1',
      hardTypeId: 'leftover-one',
      passage: `原计划 ${n} 人 ${d} 天完工。已做 ${t} 天后增加 ${add} 人，其余条件不变。`,
      stem: '剩下的工程还需多少天？',
      correct: String(k),
      distractors: uniqueNum(k, [d - t, k + 1, t, add]),
      method: '设人效=1，算总量与已完成，剩余÷新人数。',
      explanation: `总量=${total}，已做=${done}，剩余=${left}，${needPeople} 人需 ${k} 天。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<SpecValHardTypeId, (seq: number) => SpecValQuestion | null> = {
  'work-one-hard': genHardWorkOne,
  'pct-100-hard': genHardPct100,
  'lcm-meet-hard': genHardLcmMeet,
  'ratio-share-hard': genHardRatioShare,
  'work-pipes': genHardPipes,
  'concentration-100': genHardConcentration,
  'profit-100': genHardProfit100,
  'roundtrip-lcm': genHardRoundtrip,
  'three-speed-lcm': genHardThreeSpeed,
  'ratio-chain': genHardRatioChain,
  'coop-ratio-share': genHardCoopRatio,
  'pct-change-100': genHardPctChange,
  'inverse-lcm': genHardInverseLcm,
  'leftover-one': genHardLeftoverOne,
}

const EASY_BUILDERS: Record<SpecValEasyTypeId, (seq: number) => SpecValQuestion | null> = {
  'set-one': genEasySetOne,
  'set-100': genEasySet100,
  'set-lcm': genEasySetLcm,
  'set-ratio': genEasySetRatio,
}

function tryBuild(factory: () => SpecValQuestion | null, maxTry = 35): SpecValQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateSpecValPaper(difficulty: SpecValDifficulty): SpecValQuestion[] {
  const out: SpecValQuestion[] = []
  const seen = new Set<string>()

  const push = (q: SpecValQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    // 4 类各 2 题
    for (const type of SPEC_VAL_EASY_TYPES) {
      for (let k = 0; k < 2; k++) {
        const q = tryBuild(() => EASY_BUILDERS[type.id](out.length))
        push(q)
      }
    }
    let guard = 0
    while (out.length < SPEC_VAL_QUESTION_COUNT && guard++ < 40) {
      const type = pickOne(SPEC_VAL_EASY_TYPES)
      push(tryBuild(() => EASY_BUILDERS[type.id](out.length)))
    }
  } else {
    const types = shuffleInPlace([...SPEC_VAL_HARD_EXAM_TYPES.map((t) => t.id)])
    for (const typeId of types) {
      if (out.length >= SPEC_VAL_QUESTION_COUNT) break
      const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 60)
      push(q)
    }
    // 仍不足则对失败类型加大重试
    if (out.length < SPEC_VAL_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= SPEC_VAL_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 80)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < SPEC_VAL_QUESTION_COUNT) {
    throw new Error(`特值法组卷不足：仅 ${out.length}/${SPEC_VAL_QUESTION_COUNT}`)
  }
  return shuffleInPlace(out.slice(0, SPEC_VAL_QUESTION_COUNT))
}
