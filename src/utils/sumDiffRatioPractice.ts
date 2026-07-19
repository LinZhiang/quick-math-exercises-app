/**
 * 高频运算 · 和差倍比问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【简单】对齐经典真题 1：份数/倍数 + 转移后等量关系求总量
 * 【中等】对齐经典真题 2：总量=平均量×数量，带分数人数与整数约束
 * 【困难】比经典真题 2 更难，登记 ≥8 种；每轮抽 5 种且互不重复
 * 1. transfer-ratio：转移后成比/差（加强版）
 * 2. weighted-three：三组不同效率/单价加权
 * 3. fraction-bring：带「几分之几各带一人/一件」
 * 4. chicken-rabbit-plus：鸡兔同笼 + 额外比/差条件
 * 5. age-sum-ratio：年龄和差倍
 * 6. buy-mix：采购金额与件数混合
 * 7. two-step-transfer：两次转移后再比
 * 8. work-avg-hard：植树/产量加权且男女均非零
 * 9. vote-three：三方案票数转移
 * 10. profit-parts：利润/成本份数与和差
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SumDiffRatioDifficulty = 'easy' | 'medium' | 'hard'

export const SUM_DIFF_RATIO_QUESTION_COUNT = 5

export const SUM_DIFF_RATIO_MODES: {
  id: SumDiffRatioDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '和差倍比 · 简单',
    desc: '每轮 5 题 · 对齐经典真题 1（份数+转移求总量）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '和差倍比 · 中等',
    desc: '每轮 5 题 · 对齐经典真题 2（加权总量+整数约束）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '和差倍比 · 困难',
    desc: '每轮 5 题 · 比经典真题 2 更难的 10 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const SUM_DIFF_RATIO_HARD_EXAM_TYPES = [
  {
    id: 'transfer-ratio',
    name: '转移后成比（加强）',
    note: '初始成倍/成比，转移后差或比更复杂',
  },
  {
    id: 'weighted-three',
    name: '三组加权总量',
    note: '三组不同平均量，求人数或总量',
  },
  {
    id: 'fraction-bring',
    name: '几分之几各带一件',
    note: '员工+孩子/配件，加权求和',
  },
  {
    id: 'chicken-rabbit-plus',
    name: '鸡兔同笼加强',
    note: '头脚之外再加比或差条件',
  },
  {
    id: 'age-sum-ratio',
    name: '年龄和差倍',
    note: '现在/若干年后年龄比与和',
  },
  {
    id: 'buy-mix',
    name: '采购混合',
    note: '不同单价商品，总数与总价求一量',
  },
  {
    id: 'two-step-transfer',
    name: '两次转移',
    note: '两次调动后再出现差/比',
  },
  {
    id: 'work-avg-hard',
    name: '植树加权（男女均非零）',
    note: '经典真题 2 加强：必须男女都有',
  },
  {
    id: 'vote-three',
    name: '三方案投票',
    note: '三个方案间转移后求总人数',
  },
  {
    id: 'profit-parts',
    name: '利润份数和差',
    note: '成本成比、利润差已知求成本',
  },
] as const

export type SumDiffRatioHardTypeId = (typeof SUM_DIFF_RATIO_HARD_EXAM_TYPES)[number]['id']

export type SumDiffRatioQuestion = {
  id: string
  topic: 'sum-diff-ratio'
  difficulty: SumDiffRatioDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: SumDiffRatioHardTypeId
}

export function sumDiffRatioTopicLabel(): string {
  return '和差倍比问题'
}

export function sumDiffRatioDifficultyLabel(d: SumDiffRatioDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
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
  return x || 1
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
    out.push(Number.isFinite(Number(correct)) ? fake : `${g}:${g + 1}`)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && Number.isInteger(x) && x !== correct).map(String),
  )
}

function buildQuestion(input: {
  difficulty: SumDiffRatioDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: SumDiffRatioHardTypeId
  seq: number
}): SumDiffRatioQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'sum-diff-ratio',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `sum-diff-ratio-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'sum-diff-ratio',
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

// ——— 简单：经典真题 1 型 ———

function genEasyVoteTransfer(seq: number): SumDiffRatioQuestion | null {
  // A initially = B * (1 + p/q); transfer t from A to B; then B - A = d
  // Classic: A=5x, B=4x, t=6, d=2 → total 90
  const templates = [
    { aParts: 5, bParts: 4, t: 6, d: 2 },
    { aParts: 3, bParts: 2, t: 5, d: 1 },
    { aParts: 4, bParts: 3, t: 8, d: 2 },
    { aParts: 5, bParts: 3, t: 4, d: 2 },
    { aParts: 7, bParts: 5, t: 6, d: 4 },
  ]
  for (const t of shuffleInPlace([...templates])) {
    // After: A' = aParts*x - t, B' = bParts*x + t; B' - A' = d
    // (bParts*x + t) - (aParts*x - t) = d ⇒ (bParts - aParts)*x + 2t = d
    // Usually aParts > bParts so: (aParts - bParts)*x = 2t - d  or rearrange
    // B'-A' = b*x + t - a*x + t = (b-a)x + 2t = d
    // (a-b)x = 2t - d
    const diffParts = t.aParts - t.bParts
    if (diffParts <= 0) continue
    const rhs = 2 * t.t - t.d
    if (rhs <= 0 || rhs % diffParts !== 0) continue
    const x = rhs / diffParts
    if (!Number.isInteger(x) || x <= 0) continue
    const total = (t.aParts + t.bParts) * x
    const moreFrac = `${t.aParts - t.bParts}/${t.bParts}`
    return buildQuestion({
      difficulty: 'easy',
      term: '投票转移（经典真题 1）',
      passage: `某社区对甲、乙两个方案投票。起初支持甲的人数比支持乙的多 ${moreFrac}；后来有 ${t.t} 人从支持甲改为支持乙，结果支持乙的比支持甲的多 ${t.d} 人。`,
      stem: '参加投票的居民共有多少人？',
      correct: String(total),
      distractors: uniqueNum(total, [85, 90, 95, 100, total + 9, total - 9, (t.aParts + t.bParts) * (x + 1)]),
      method: '设乙最初为 b 份、甲为 a 份；转移后列差的方程，求出每份人数，再求总量。',
      explanation: `设乙最初 ${t.bParts}x、甲 ${t.aParts}x。转移后：(${t.bParts}x+${t.t})−(${t.aParts}x−${t.t})=${t.d} ⇒ x=${x}；共 ${(t.aParts + t.bParts)}x=${total}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '投票转移（经典真题 1）',
    passage:
      '某社区对甲、乙两个绿化方案投票。起初支持甲的人数比支持乙的多 1/4；后来有 6 人从支持甲改为支持乙，结果支持乙的比支持甲的多 2 人。',
    stem: '参加投票的居民共有多少人？',
    correct: '90',
    distractors: uniqueNum(90, [85, 95, 100]),
    method: '设乙 4x、甲 5x；转移后列方程得 x=10，总量 90。',
    explanation: '(4x+6)−(5x−6)=2 ⇒ x=10；共 9×10=90。',
    seq,
  })
}

function genEasySumDiff(seq: number): SumDiffRatioQuestion | null {
  const sum = pickOne([48, 60, 72, 84, 90])
  const diff = pickOne([6, 8, 10, 12])
  if ((sum + diff) % 2 !== 0) return null
  const a = (sum + diff) / 2
  const b = (sum - diff) / 2
  if (!Number.isInteger(a) || !Number.isInteger(b) || b <= 0) return null
  const ask = pickOne(['a', 'b', 'ratio'] as const)
  if (ask === 'ratio') {
    const g = gcd(a, b)
    const ans = `${a / g}:${b / g}`
    return buildQuestion({
      difficulty: 'easy',
      term: '和差求比',
      passage: `甲、乙两数之和为 ${sum}，甲比乙多 ${diff}。`,
      stem: '甲与乙的比是？',
      correct: ans,
      distractors: uniqueStr(ans, [`${b / g}:${a / g}`, '1:1', '2:1', '3:2']),
      method: '和差公式：大=(和+差)/2，小=(和−差)/2，再约分。',
      explanation: `甲=${a}，乙=${b}，比=${ans}。`,
      seq,
    })
  }
  const ans = ask === 'a' ? a : b
  return buildQuestion({
    difficulty: 'easy',
    term: '和差求一量',
    passage: `甲、乙两数之和为 ${sum}，甲比乙多 ${diff}。`,
    stem: ask === 'a' ? '甲数是？' : '乙数是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [a, b, sum, diff, ans + 2]),
    method: '大数=(和+差)/2，小数=(和−差)/2。',
    explanation: `甲=${a}，乙=${b}；所求=${ans}。`,
    seq,
  })
}

function genEasyMultiple(seq: number): SumDiffRatioQuestion | null {
  const k = pickOne([2, 3, 4])
  const small = pickOne([12, 15, 18, 20, 24])
  const large = small * k
  const sum = large + small
  return buildQuestion({
    difficulty: 'easy',
    term: '倍数求和',
    passage: `甲是乙的 ${k} 倍，两数之和为 ${sum}。`,
    stem: '乙是多少？',
    correct: String(small),
    distractors: uniqueNum(small, [large, sum / 2, small + k, large - small]),
    method: '设乙为 1 份，甲为 k 份，共 (k+1) 份。',
    explanation: `共 ${k + 1} 份=${sum}，乙=1 份=${small}。`,
    seq,
  })
}

// ——— 中等：经典真题 2 型 ———

function genMediumTreePlant(seq: number): SumDiffRatioQuestion | null {
  // Classic: 1/3 bring child; male 13, female 10, child 6; total trees 216 → employees 18 (y=18,x=0) or other
  // We construct so answer is unique among options and integer.
  // 13x + 10y + 6*(x+y)/3 = T ⇒ 15x + 12y = T ⇒ 5x + 4y = T/3
  // Prefer cases where both x,y > 0 for medium variety, plus classic-like
  const templates = [
    { male: 13, female: 10, child: 6, fracDen: 3, trees: 216, preferTotal: 18 },
    { male: 12, female: 9, child: 6, fracDen: 3, trees: 198, preferTotal: 18 },
    { male: 15, female: 12, child: 6, fracDen: 3, trees: 252, preferTotal: 18 },
    { male: 10, female: 8, child: 4, fracDen: 2, trees: 200, preferTotal: 20 },
  ]

  for (const t of shuffleInPlace([...templates])) {
    //  male*x + female*y + child*(x+y)/fracDen = trees
    // Multiply by fracDen: fracDen*male*x + fracDen*female*y + child*(x+y) = trees*fracDen
    const A = t.fracDen * t.male + t.child
    const B = t.fracDen * t.female + t.child
    const C = t.trees * t.fracDen
    // A x + B y = C
    // Try y from 1..40, find integer x>=0
    const solutions: { x: number; y: number; total: number }[] = []
    for (let y = 0; y <= 40; y++) {
      const rem = C - B * y
      if (rem < 0) break
      if (rem % A !== 0) continue
      const x = rem / A
      if (!Number.isInteger(x) || x < 0) continue
      const total = x + y
      if (total % t.fracDen !== 0) continue // children integer
      if (total < 6) continue
      solutions.push({ x, y, total })
    }
    if (!solutions.length) continue
    // Prefer preferTotal if present, else first with both >0, else first
    const preferred =
      solutions.find((s) => s.total === t.preferTotal) ??
      solutions.find((s) => s.x > 0 && s.y > 0) ??
      solutions[0]!
    const ans = preferred.total
    return buildQuestion({
      difficulty: 'medium',
      term: '植树加权（经典真题 2）',
      passage: `某单位员工去植树，有男员工、女员工。其中 ${t.fracDen === 3 ? '1/3' : `1/${t.fracDen}`} 的员工各带了一名儿童。男员工平均每人植树 ${t.male} 棵，女员工 ${t.female} 棵，儿童 ${t.child} 棵，共植树 ${t.trees} 棵。`,
      stem: '该单位共有员工多少人？',
      correct: String(ans),
      distractors: uniqueNum(
        ans,
        solutions.map((s) => s.total).concat([12, 15, 18, 21, ans + 3, ans - 3]),
      ),
      method: '总量=平均量×数量。设男 x、女 y，儿童=(x+y)/n，列方程并结合整除筛选。',
      explanation: `设男 ${preferred.x}、女 ${preferred.y}（或等价解），员工共 ${ans} 人。方程：${t.male}x+${t.female}y+${t.child}·(x+y)/${t.fracDen}=${t.trees}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '植树加权（经典真题 2）',
    passage:
      '某单位员工去植树，有男员工、女员工。其中 1/3 的员工各带了一名儿童。男员工平均每人植树 13 棵，女员工 10 棵，儿童 6 棵，共植树 216 棵。',
    stem: '该单位共有员工多少人？',
    correct: '18',
    distractors: uniqueNum(18, [12, 15, 21]),
    method: '设男 x、女 y：13x+10y+2(x+y)=216 ⇒ 5x+4y=72，结合选项检验。',
    explanation: '选项中 18：若男 0 女 18 满足；结合题意与选项得 18。',
    seq,
  })
}

function genMediumWeightedAvg(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([80, 85, 90])
    const b = pickOne([60, 70, 75])
    const rx = pickOne([2, 3, 4])
    const ry = pickOne([3, 4, 5])
    const unit = pickOne([5, 6, 8, 10])
    const na = rx * unit
    const nb = ry * unit
    const total = a * na + b * nb
    const avg = total / (na + nb)
    if (!Number.isInteger(avg)) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '两组加权平均',
      passage: `甲组平均成绩 ${a} 分共 ${na} 人，乙组平均成绩 ${b} 分共 ${nb} 人。`,
      stem: '两组合计平均分是多少？',
      correct: String(avg),
      distractors: uniqueNum(avg, [a, b, Math.round((a + b) / 2), avg + 1, avg - 1]),
      method: '总分÷总人数；或十字交叉验证人数比。',
      explanation: `总分 ${total}，人数 ${na + nb}，平均 ${avg}。`,
      seq,
    })
  }
  return null
}

function genMediumSumRatio(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 30; t++) {
    const m = pickOne([3, 4, 5])
    const n = pickOne([2, 3, 4])
    if (m === n) continue
    const unit = pickOne([6, 8, 10, 12])
    const a = m * unit
    const b = n * unit
    const diff = Math.abs(a - b)
    const askSum = Math.random() < 0.5
    if (askSum) {
      const ans = a + b
      return buildQuestion({
        difficulty: 'medium',
        term: '比与差求和',
        passage: `甲、乙之比为 ${m}:${n}，甲比乙${a > b ? '多' : '少'} ${diff}。`,
        stem: '甲、乙之和是多少？',
        correct: String(ans),
        distractors: uniqueNum(ans, [a, b, diff * (m + n), ans + unit]),
        method: '差对应 |m−n| 份，求出每份再求和。',
        explanation: `差 ${Math.abs(m - n)} 份=${diff}，每份 ${unit}；和=${ans}。`,
        seq,
      })
    }
    return buildQuestion({
      difficulty: 'medium',
      term: '比与和求差',
      passage: `甲、乙之比为 ${m}:${n}，两数之和为 ${a + b}。`,
      stem: '甲比乙多多少？',
      correct: String(diff),
      distractors: uniqueNum(diff, [a, b, unit, Math.abs(m - n)]),
      method: '和对应 (m+n) 份，差对应 |m−n| 份。',
      explanation: `每份 ${unit}；差 ${Math.abs(m - n)} 份=${diff}。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardTransferRatio(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const aParts = pickOne([5, 6, 7])
    const bParts = pickOne([3, 4, 5])
    if (aParts <= bParts) continue
    const transfer = pickOne([8, 10, 12, 15])
    const afterDiff = pickOne([2, 4, 6])
    const diffParts = aParts - bParts
    const rhs = 2 * transfer - afterDiff
    if (rhs <= 0 || rhs % diffParts !== 0) continue
    const x = rhs / diffParts
    if (!Number.isInteger(x) || x < 2) continue
    const total = (aParts + bParts) * x
    const more = `${aParts - bParts}/${bParts}`
    return buildQuestion({
      difficulty: 'hard',
      term: '转移后成比（加强）',
      hardTypeId: 'transfer-ratio',
      passage: `甲、乙两队人数，起初甲比乙多 ${more}。从甲调 ${transfer} 人到乙后，乙比甲多 ${afterDiff} 人。`,
      stem: '两队原有一共多少人？',
      correct: String(total),
      distractors: uniqueNum(total, [total + aParts, total - bParts, 90, 100, 120]),
      method: '设份数列转移后的差方程，求总量。',
      explanation: `乙 ${bParts}x、甲 ${aParts}x；转移后差方程得 x=${x}，共 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardWeightedThree(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const p1 = pickOne([20, 25, 30])
    const p2 = pickOne([15, 18, 20])
    const p3 = pickOne([8, 10, 12])
    const n1 = pickOne([4, 5, 6])
    const n2 = pickOne([3, 4, 5])
    const n3 = pickOne([2, 3, 4])
    const total = p1 * n1 + p2 * n2 + p3 * n3
    const people = n1 + n2 + n3
    const ask = pickOne(['total', 'people'] as const)
    if (ask === 'total') {
      return buildQuestion({
        difficulty: 'hard',
        term: '三组加权总量',
        hardTypeId: 'weighted-three',
        passage: `甲、乙、丙三组分别有 ${n1}、${n2}、${n3} 人，人均产量分别为 ${p1}、${p2}、${p3}。`,
        stem: '三组总产量是多少？',
        correct: String(total),
        distractors: uniqueNum(total, [p1 * people, total + p3, (p1 + p2 + p3) * 5]),
        method: '各组平均量×人数再求和。',
        explanation: `${p1}×${n1}+${p2}×${n2}+${p3}×${n3}=${total}。`,
        seq,
      })
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '三组加权总量',
      hardTypeId: 'weighted-three',
      passage: `甲、乙、丙人均产量 ${p1}、${p2}、${p3}，人数比为 ${n1}:${n2}:${n3}，总产量 ${total}。`,
      stem: '三组一共多少人？',
      correct: String(people),
      distractors: uniqueNum(people, [n1 + n2, people + 2, n1 * 3, total / p2].map(Math.round)),
      method: '设人数为 k(n1,n2,n3)，代入总产量求 k。',
      explanation: `每份产量 ${p1 * n1 + p2 * n2 + p3 * n3}/${people} 对应结构；人数=${people}。`,
      seq,
    })
  }
  return null
}

function genHardFractionBring(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const male = pickOne([12, 14, 16])
    const female = pickOne([8, 9, 10])
    const child = pickOne([4, 5, 6])
    const den = pickOne([3, 4])
    const x = pickOne([4, 6, 8])
    const y = pickOne([4, 6, 8, 9])
    const totalPeople = x + y
    if (totalPeople % den !== 0) continue
    const trees = male * x + female * y + child * (totalPeople / den)
    if (!Number.isInteger(trees)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '几分之几各带一件',
      hardTypeId: 'fraction-bring',
      passage: `单位植树：男员工人均 ${male} 棵，女员工 ${female} 棵；${den === 3 ? '1/3' : `1/${den}`} 员工各带 1 名儿童，儿童人均 ${child} 棵。已知男 ${x} 人、女 ${y} 人。`,
      stem: '共植树多少棵？',
      correct: String(trees),
      distractors: uniqueNum(trees, [male * x + female * y, trees + child, 216, 200]),
      method: '员工产量 + 儿童人数×人均，儿童数=员工总数/分母。',
      explanation: `儿童 ${totalPeople / den} 人；总量=${trees}。`,
      seq,
    })
  }
  return null
}

function genHardChickenRabbit(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const heads = pickOne([20, 24, 30, 35])
    const chickens = pickOne([8, 10, 12, 15, 18])
    const rabbits = heads - chickens
    if (rabbits <= 0) continue
    const feet = 2 * chickens + 4 * rabbits
    // extra: rabbits are k more than chickens or ratio
    const style = pickOne(['diff', 'ratio'] as const)
    if (style === 'diff') {
      const d = rabbits - chickens
      if (d <= 0) continue
      return buildQuestion({
        difficulty: 'hard',
        term: '鸡兔同笼加强',
        hardTypeId: 'chicken-rabbit-plus',
        passage: `鸡兔同笼，共 ${heads} 个头、${feet} 只脚，兔比鸡多 ${d} 只。`,
        stem: '鸡有多少只？',
        correct: String(chickens),
        distractors: uniqueNum(chickens, [rabbits, heads / 2, chickens + 2, rabbits - 2].map(Math.round)),
        method: '设鸡 x、兔 heads−x，用脚数列式；或用差条件验证。',
        explanation: `2x+4(${heads}−x)=${feet} ⇒ x=${chickens}；且兔−鸡=${d}。`,
        seq,
      })
    }
    if (rabbits % chickens !== 0 && chickens % rabbits !== 0) {
      // use simplified ratio
      const g = gcd(chickens, rabbits)
      const ans = chickens
      return buildQuestion({
        difficulty: 'hard',
        term: '鸡兔同笼加强',
        hardTypeId: 'chicken-rabbit-plus',
        passage: `鸡兔同笼，共 ${heads} 个头、${feet} 只脚，鸡与兔数量比为 ${chickens / g}:${rabbits / g}。`,
        stem: '鸡有多少只？',
        correct: String(ans),
        distractors: uniqueNum(ans, [rabbits, heads / 2, ans + g]),
        method: '按比设份，结合总头数；用脚数验算。',
        explanation: `鸡 ${ans}，兔 ${rabbits}。`,
        seq,
      })
    }
  }
  return null
}

function genHardAgeSumRatio(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const nowA = pickOne([30, 36, 40, 42])
    const nowB = pickOne([10, 12, 14, 18])
    const years = pickOne([4, 5, 6])
    const futureA = nowA + years
    const futureB = nowB + years
    const g = gcd(futureA, futureB)
    if (g === futureA || futureA / g > 9) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '年龄和差倍',
      hardTypeId: 'age-sum-ratio',
      passage: `父亲现在 ${nowA} 岁，儿子 ${nowB} 岁。`,
      stem: `${years} 年后，父亲与儿子的年龄之比是？`,
      correct: `${futureA / g}:${futureB / g}`,
      distractors: uniqueStr(`${futureA / g}:${futureB / g}`, [
        `${nowA}:${nowB}`,
        `${futureB / g}:${futureA / g}`,
        '2:1',
        '3:1',
      ]),
      method: '先各自加年数，再约分成最简比。',
      explanation: `${years} 年后 ${futureA} 与 ${futureB}，比=${futureA / g}:${futureB / g}。`,
      seq,
    })
  }
  return null
}

function genHardBuyMix(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const pa = pickOne([8, 10, 12])
    const pb = pickOne([5, 6, 7])
    const na = pickOne([10, 12, 15])
    const nb = pickOne([8, 10, 14])
    const cost = pa * na + pb * nb
    const pieces = na + nb
    return buildQuestion({
      difficulty: 'hard',
      term: '采购混合',
      hardTypeId: 'buy-mix',
      passage: `买甲种商品单价 ${pa} 元、乙种 ${pb} 元，共买 ${pieces} 件，花费 ${cost} 元。`,
      stem: '甲种商品买了多少件？',
      correct: String(na),
      distractors: uniqueNum(na, [nb, pieces / 2, na + 2, nb - 2].map(Math.round)),
      method: '设甲 x 件，则乙 pieces−x；列总价方程。',
      explanation: `${pa}x+${pb}(${pieces}−x)=${cost} ⇒ x=${na}。`,
      seq,
    })
  }
  return null
}

function genHardTwoStepTransfer(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a0 = pickOne([40, 45, 50])
    const b0 = pickOne([30, 35, 40])
    const t1 = pickOne([4, 5, 6])
    const t2 = pickOne([3, 4, 5])
    // first: A loses t1 to B; second: B loses t2 to A
    const a1 = a0 - t1
    const b1 = b0 + t1
    const a2 = a1 + t2
    const b2 = b1 - t2
    const d = Math.abs(a2 - b2)
    if (d <= 0) continue
    const total = a0 + b0
    return buildQuestion({
      difficulty: 'hard',
      term: '两次转移',
      hardTypeId: 'two-step-transfer',
      passage: `甲班 ${a0} 人、乙班 ${b0} 人。先从甲调 ${t1} 人到乙，再从乙调 ${t2} 人到甲。`,
      stem: '两次调动后，两班人数相差多少？',
      correct: String(d),
      distractors: uniqueNum(d, [Math.abs(a0 - b0), t1, t2, d + 2]),
      method: '按顺序模拟两次调动，再求差。',
      explanation: `最终甲 ${a2}、乙 ${b2}，差 ${d}。总量始终 ${total}。`,
      seq,
    })
  }
  return null
}

function genHardWorkAvg(seq: number): SumDiffRatioQuestion | null {
  // Like classic but force x>0,y>0 unique total
  for (let t = 0; t < 50; t++) {
    const male = pickOne([12, 14, 15])
    const female = pickOne([8, 9, 10])
    const child = pickOne([4, 5, 6])
    const den = 3
    const x = pickOne([3, 6, 9])
    const y = pickOne([6, 9, 12])
    if ((x + y) % den !== 0) continue
    const trees = male * x + female * y + child * ((x + y) / den)
    // verify uniqueness of total among small search
    const A = den * male + child
    const B = den * female + child
    const C = trees * den
    const totals = new Set<number>()
    for (let yy = 1; yy <= 30; yy++) {
      const rem = C - B * yy
      if (rem <= 0) continue
      if (rem % A !== 0) continue
      const xx = rem / A
      if (xx > 0 && Number.isInteger(xx) && (xx + yy) % den === 0) totals.add(xx + yy)
    }
    if (totals.size !== 1) continue
    const ans = x + y
    return buildQuestion({
      difficulty: 'hard',
      term: '植树加权（男女均非零）',
      hardTypeId: 'work-avg-hard',
      passage: `植树：男人均 ${male} 棵、女人均 ${female} 棵；1/3 员工各带一名儿童，儿童人均 ${child} 棵。共植 ${trees} 棵，且男、女员工都有。`,
      stem: '员工一共多少人？',
      correct: String(ans),
      distractors: uniqueNum(ans, [12, 15, 18, 21, ans + 3, ans - 3]),
      method: '列 男x+女y+儿童加权方程，要求 x,y>0，结合整除唯一确定。',
      explanation: `满足条件的解员工数唯一为 ${ans}（如男 ${x} 女 ${y}）。`,
      seq,
    })
  }
  return null
}

function genHardVoteThree(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([20, 24, 30])
    const b = pickOne([16, 18, 20])
    const c = pickOne([10, 12, 15])
    const move = pickOne([3, 4, 5])
    // move from A to B, then B leads A by d, C unchanged
    const a2 = a - move
    const b2 = b + move
    if (b2 <= a2) continue
    const d = b2 - a2
    const total = a + b + c
    return buildQuestion({
      difficulty: 'hard',
      term: '三方案投票',
      hardTypeId: 'vote-three',
      passage: `甲、乙、丙三方案最初支持者分别为 ${a}、${b}、${c} 人。有 ${move} 人从支持甲改为支持乙后，乙比甲多 ${d} 人，丙不变。`,
      stem: '参加投票的一共多少人？',
      correct: String(total),
      distractors: uniqueNum(total, [a + b, total - c, 90, total + move]),
      method: '总量=三方案人数之和（转移不改变总量）。',
      explanation: `总量 ${a}+${b}+${c}=${total}；转移只改变甲乙，不改变总和。`,
      seq,
    })
  }
  return null
}

function genHardProfitParts(seq: number): SumDiffRatioQuestion | null {
  for (let t = 0; t < 40; t++) {
    const m = pickOne([3, 4, 5])
    const n = pickOne([2, 3])
    if (m === n) continue
    const unit = pickOne([1000, 2000, 2500])
    const costA = m * unit
    const costB = n * unit
    const rateA = pickOne([10, 15, 20])
    const rateB = pickOne([5, 8, 10])
    const profitA = (costA * rateA) / 100
    const profitB = (costB * rateB) / 100
    if (!Number.isInteger(profitA) || !Number.isInteger(profitB)) continue
    const diff = Math.abs(profitA - profitB)
    if (diff <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '利润份数和差',
      hardTypeId: 'profit-parts',
      passage: `甲、乙两种商品成本之比为 ${m}:${n}。甲按 ${rateA}% 利润售出，乙按 ${rateB}% 利润售出，甲利润比乙${profitA > profitB ? '多' : '少'} ${diff} 元。`,
      stem: '甲商品成本是多少元？',
      correct: String(costA),
      distractors: uniqueNum(costA, [costB, costA + costB, unit, costA + unit]),
      method: '设成本 m、n 份，利润差对应方程求每份成本。',
      explanation: `成本甲 ${costA}、乙 ${costB}；利润差 ${diff}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  SumDiffRatioHardTypeId,
  (seq: number) => SumDiffRatioQuestion | null
> = {
  'transfer-ratio': genHardTransferRatio,
  'weighted-three': genHardWeightedThree,
  'fraction-bring': genHardFractionBring,
  'chicken-rabbit-plus': genHardChickenRabbit,
  'age-sum-ratio': genHardAgeSumRatio,
  'buy-mix': genHardBuyMix,
  'two-step-transfer': genHardTwoStepTransfer,
  'work-avg-hard': genHardWorkAvg,
  'vote-three': genHardVoteThree,
  'profit-parts': genHardProfitParts,
}

function tryBuild(
  factory: () => SumDiffRatioQuestion | null,
  maxTry = 40,
): SumDiffRatioQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateSumDiffRatioPaper(
  difficulty: SumDiffRatioDifficulty,
): SumDiffRatioQuestion[] {
  const out: SumDiffRatioQuestion[] = []
  const seen = new Set<string>()

  const push = (q: SumDiffRatioQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyVoteTransfer, genEasySumDiff, genEasyMultiple]
    let guard = 0
    while (out.length < SUM_DIFF_RATIO_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumTreePlant(0),
      () => genMediumWeightedAvg(1),
      () => genMediumSumRatio(2),
      () => genMediumTreePlant(3),
      () => genMediumSumRatio(4),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < SUM_DIFF_RATIO_QUESTION_COUNT && guard++ < 50) {
      push(
        tryBuild(() =>
          pickOne([genMediumTreePlant, genMediumWeightedAvg, genMediumSumRatio])(out.length),
        ),
      )
    }
  } else {
    const types = shuffleInPlace([...SUM_DIFF_RATIO_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= SUM_DIFF_RATIO_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 55))
    }
    if (out.length < SUM_DIFF_RATIO_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= SUM_DIFF_RATIO_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 70)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < SUM_DIFF_RATIO_QUESTION_COUNT) {
    throw new Error(`和差倍比组卷不足：仅 ${out.length}/${SUM_DIFF_RATIO_QUESTION_COUNT}`)
  }
  return out.slice(0, SUM_DIFF_RATIO_QUESTION_COUNT)
}
