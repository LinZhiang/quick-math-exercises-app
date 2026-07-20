/**
 * 运算技巧 · 代入排除法
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【困难题型库 · 难于经典真题 1/2，登记 ≥8 种；每轮抽 5 种且互不重复】
 * 1. crt-three-hard：三同余求最小（模更大/余数更绕）
 * 2. crt-four-min：四条件同余求最少
 * 3. crt-max-bound：上界内最大，按「最大从大」代入
 * 4. pct-books-hard：百分数化分数筛倍数（升级版真题 2）
 * 5. dual-pct-sub：双百分数约束再代入
 * 6. age-chain-sub：年龄关系链，选项代入
 * 7. speed-half-sub：行程提速，半程时间（选项验证）
 * 8. rem-then-sub：先余数/奇偶排除再代入
 * 9. sum-pct-elim：两数之和 + 百分数，排除后代入
 * 10. multi-cond-sub：多条件综合代入
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SubElimDifficulty = 'easy' | 'medium' | 'hard'

export const SUB_ELIM_QUESTION_COUNT = 5

export const SUB_ELIM_MODES: {
  id: SubElimDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '代入排除法 · 简单',
    desc: '每轮 5 题 · 单条件直接代入 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '代入排除法 · 普通',
    desc: '每轮 5 题 · 对齐经典真题 1/2（分组余数 / 百分数筛选项）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '代入排除法 · 困难',
    desc: '每轮 5 题 · 难于经典真题的 10 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const SUB_ELIM_HARD_EXAM_TYPES = [
  {
    id: 'crt-three-hard',
    name: '三同余求最少（加强）',
    note: '模与余数组合难于真题 1',
  },
  {
    id: 'crt-four-min',
    name: '四条件同余求最少',
    note: '四个余数条件，代入排除',
  },
  {
    id: 'crt-max-bound',
    name: '上界内求最大',
    note: '问最多/最大，从大选项往下试',
  },
  {
    id: 'pct-books-hard',
    name: '百分数倍数筛选项（加强真题 2）',
    note: '专业书占比化最简分数，先排除再代入',
  },
  {
    id: 'dual-pct-sub',
    name: '双百分数约束代入',
    note: '甲乙两边都有百分数约束',
  },
  {
    id: 'age-chain-sub',
    name: '年龄关系链代入',
    note: '多人间年龄差，选项验证某年年龄',
  },
  {
    id: 'speed-half-sub',
    name: '行程提速求半程时间',
    note: '提速后求走过一半路程的时间',
  },
  {
    id: 'rem-then-sub',
    name: '先余数排除再代入',
    note: '同余/奇偶先砍选项，再验证',
  },
  {
    id: 'sum-pct-elim',
    name: '两数之和+百分数',
    note: '总量固定，百分数给倍数，排除后代入',
  },
  {
    id: 'multi-cond-sub',
    name: '多条件综合代入',
    note: '整除+余数+范围同时成立',
  },
] as const

export type SubElimHardTypeId = (typeof SUB_ELIM_HARD_EXAM_TYPES)[number]['id']

export type SubElimQuestion = {
  id: string
  topic: 'sub-elim'
  difficulty: SubElimDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: SubElimHardTypeId
}

export function subElimTopicLabel(): string {
  return '代入排除法'
}

export function subElimDifficultyLabel(d: SubElimDifficulty): string {
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

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
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

function buildQuestion(input: {
  difficulty: SubElimDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: SubElimHardTypeId
  seq: number
}): SubElimQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'sub-elim',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `sub-elim-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'sub-elim',
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

function satisfiesCrt(n: number, moduli: number[], rems: number[]): boolean {
  return moduli.every((m, i) => mod(n, m) === rems[i]!)
}

function minCrt(moduli: number[], rems: number[], maxScan = 2000): number | null {
  for (let n = 1; n <= maxScan; n++) {
    if (satisfiesCrt(n, moduli, rems)) return n
  }
  return null
}

function maxCrtUnder(moduli: number[], rems: number[], maxN: number): number | null {
  let best: number | null = null
  for (let n = 1; n <= maxN; n++) {
    if (satisfiesCrt(n, moduli, rems)) best = n
  }
  return best
}

function wrongCrtOptions(ans: number, moduli: number[], rems: number[], pool: number[]): number[] {
  const wrong: number[] = []
  for (const cand of pool) {
    if (cand <= 0 || cand === ans) continue
    if (satisfiesCrt(cand, moduli, rems)) continue
    if (!wrong.includes(cand)) wrong.push(cand)
    if (wrong.length >= 3) break
  }
  let t = 1
  while (wrong.length < 3 && t < 80) {
    const cand = ans + t
    t++
    if (satisfiesCrt(cand, moduli, rems)) continue
    if (!wrong.includes(cand)) wrong.push(cand)
  }
  return wrong.slice(0, 3)
}

// ——— 简单：比真题更简单 ———

function genEasySingleRem(seq: number): SubElimQuestion | null {
  const m = pickOne([3, 4, 5, 7])
  const r = randInt(1, m - 1)
  const k = randInt(2, 6)
  const ans = m * k + r
  const wrong = wrongCrtOptions(ans, [m], [r], [ans - m, ans + 1, ans - 1, m * k, r, ans + m + 1])
  return buildQuestion({
    difficulty: 'easy',
    term: '单条件直接代入',
    passage: `正整数 n 满足：除以 ${m} 余 ${r}。`,
    stem: '下列哪一个可能是 n？',
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '把选项逐一代入：看 (选项−余数) 能否被除数整除。',
    explanation: `${ans}−${r}=${ans - r}，能被 ${m} 整除；其余选项不满足。`,
    seq,
  })
}

function genEasyTwoRem(seq: number): SubElimQuestion | null {
  const m1 = 3
  const m2 = 5
  const r1 = randInt(0, 2)
  const r2 = randInt(0, 4)
  const ans = minCrt([m1, m2], [r1, r2], 100)
  if (ans == null || ans < 5) return null
  const wrong = wrongCrtOptions(ans, [m1, m2], [r1, r2], [ans + 1, ans - 1, 8, 14, 23, ans + 15])
  return buildQuestion({
    difficulty: 'easy',
    term: '两条件代入',
    passage: `一群人排队：${m1} 人一组余 ${r1} 人，${m2} 人一组余 ${r2} 人。`,
    stem: '人数最少可能是？',
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '问最少：从较小选项起代入，两个条件都满足即停。',
    explanation: `最小正整数解为 ${ans}。`,
    seq,
  })
}

function genEasyMultipleOf(seq: number): SubElimQuestion | null {
  const d = pickOne([6, 8, 9, 12])
  const k = randInt(3, 9)
  const ans = d * k
  const wrong: number[] = []
  for (const c of [ans + 1, ans - 1, ans + d / 2, d * (k + 1) + 1, ans + 2]) {
    if (Number.isInteger(c) && c > 0 && c % d !== 0 && c !== ans) wrong.push(c)
    if (wrong.length >= 3) break
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '倍数筛选项',
    stem: `某正整数是 ${d} 的倍数，下列哪一个可能是它？`,
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '先排除不能被 d 整除的选项，剩下的再确认。',
    explanation: `只有 ${ans}=${d}×${k} 是 ${d} 的倍数。`,
    seq,
  })
}

function genEasyLinearSub(seq: number): SubElimQuestion | null {
  const a = pickOne([2, 3, 4])
  const b = pickOne([5, 7, 9])
  const x = randInt(3, 12)
  const c = a * x + b
  return buildQuestion({
    difficulty: 'easy',
    term: '方程选项代入',
    passage: `正整数 x 满足 ${a}x+${b}=${c}。`,
    stem: 'x 等于？',
    correct: String(x),
    distractors: uniqueNum(x, [x + 1, x - 1, c, b, a]),
    method: '把选项代入左边，看是否等于右边。',
    explanation: `${a}×${x}+${b}=${c}。`,
    seq,
  })
}

// ——— 中等：对齐经典真题 1 / 2 ———

function genMediumCrtClassic(seq: number): SubElimQuestion | null {
  const templates: { m: number[]; r: number[]; ans: number }[] = [
    { m: [3, 5, 7], r: [2, 3, 4], ans: 53 },
    { m: [3, 5, 7], r: [1, 2, 3], ans: 52 },
    { m: [3, 4, 5], r: [1, 2, 3], ans: 58 },
    { m: [3, 5, 7], r: [2, 1, 3], ans: 58 },
  ]
  // 也动态生成
  for (let t = 0; t < 15; t++) {
    const m = [3, 5, 7]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6)]
    if (r.every((x) => x === 0)) continue
    const ans = minCrt(m, r)
    if (ans == null || ans < 15 || ans > 160) continue
    const wrong = wrongCrtOptions(ans, m, r, [23, 53, 88, 158, ans + 1, ans - 7, ans + 15])
    return buildQuestion({
      difficulty: 'medium',
      term: '分组余数（经典真题 1）',
      passage: `一群学生：${m.map((mi, i) => `${mi} 人一组余 ${r[i]} 人`).join('；')}。`,
      stem: '学生人数最少是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最少：从较小选项起代入；三个条件都满足即为解。',
      explanation: `最小正整数解为 ${ans}。验证：${m.map((mi, i) => `${ans}÷${mi} 余 ${r[i]}`).join('，')}。`,
      seq,
    })
  }
  const fixed = pickOne(templates)
  if (!satisfiesCrt(fixed.ans, fixed.m, fixed.r)) return null
  const wrong = wrongCrtOptions(fixed.ans, fixed.m, fixed.r, [23, 53, 88, 158, 39, 67])
  return buildQuestion({
    difficulty: 'medium',
    term: '分组余数（经典真题 1）',
    passage: `一群学生：${fixed.m.map((mi, i) => `${mi} 人一组余 ${fixed.r[i]} 人`).join('；')}。`,
    stem: '学生人数最少是？',
    correct: String(fixed.ans),
    distractors: uniqueNum(fixed.ans, wrong),
    method: '问最少：从小到大代入排除。',
    explanation: `答案为 ${fixed.ans}。`,
    seq,
  })
}

/** 经典真题 2：藏书百分数 */
function genMediumBooksPct(seq: number): SubElimQuestion | null {
  // A+B=total；A 专业占比 pA；B 专业占比 pB；问 A 的非专业
  const scenarios: {
    total: number
    aProPct: number // 13 => 13%
    bProFrac: [number, number] // 12.5% = 1/8
    aTotal: number
    askNonPro: boolean
  }[] = [
    { total: 260, aProPct: 13, bProFrac: [1, 8], aTotal: 100, askNonPro: true },
    { total: 300, aProPct: 20, bProFrac: [1, 5], aTotal: 150, askNonPro: true },
    { total: 240, aProPct: 25, bProFrac: [1, 8], aTotal: 120, askNonPro: true },
    { total: 280, aProPct: 15, bProFrac: [1, 4], aTotal: 160, askNonPro: true },
  ]

  for (const s of scenarios) {
    const aNonRatio = 100 - s.aProPct // 百分数
    const g = gcd(aNonRatio, 100)
    const mult = aNonRatio / g // A 非专业必为该数的倍数（约分后分子）
    // 更准确：非专业 = aTotal * (100-p)/100，且 aTotal 须使专业为整数
    // A 总数须为 100/gcd(p,100) 的倍数
    const aDen = 100 / gcd(s.aProPct, 100)
    if (s.aTotal % aDen !== 0) continue
    const bTotal = s.total - s.aTotal
    const [bm, bn] = s.bProFrac
    if (bTotal % bn !== 0) continue
    const ans = Math.round((s.aTotal * (100 - s.aProPct)) / 100)
    if (ans % (aNonRatio / g) !== 0 && g !== 1) {
      // still ok if integer
    }
    if (!Number.isInteger(ans)) continue

    // 干扰：倍数干扰 + 另一可能倍数但不满足 B
    const wrongPool = [
      ans * 2,
      mult,
      Math.round(s.total * (100 - s.aProPct)) / 100,
      s.aTotal,
      ans + mult,
      75,
      67,
      174,
    ].filter((x) => Number.isInteger(x) && x > 0 && x !== ans) as number[]

    // 确保干扰不都是正确的倍数陷阱中的唯一答案路径
    const wrong = uniqueNum(ans, wrongPool).map(Number)
    if (wrong.length < 3) continue

    const bPctText =
      bn === 8 && bm === 1 ? '12.5%' : bn === 5 && bm === 1 ? '20%' : bn === 4 && bm === 1 ? '25%' : `${(bm / bn) * 100}%`

    return buildQuestion({
      difficulty: 'medium',
      term: '百分数筛选项（经典真题 2）',
      passage: `甲、乙两人共有藏书 ${s.total} 本。甲的藏书中专业书占 ${s.aProPct}%，乙的藏书中专业书占 ${bPctText}。`,
      stem: '甲的非专业书有多少本？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '甲非专业占 (100−p)% ，化最简分数后非专业本数是分子对应倍数；乙总数须为分母倍数。先排除再代入验证。',
      explanation: `甲非专业占 ${100 - s.aProPct}%=${(100 - s.aProPct) / g}/${100 / g}，故非专业是 ${(100 - s.aProPct) / g} 的倍数。代入得甲共 ${s.aTotal} 本、非专业 ${ans} 本；乙 ${bTotal} 本，能被 ${bn} 整除。`,
      seq,
    })
  }
  return null
}

function genMediumSelectiveRem(seq: number): SubElimQuestion | null {
  // 3x+y=points style lite for medium - or simple "n even and n%5=3"
  const m = pickOne([3, 4, 5])
  const r = randInt(0, m - 1)
  const mustEven = Math.random() < 0.5
  let ans = minCrt([m, 2], [r, mustEven ? 0 : 1], 80)
  if (ans == null) return null
  if (ans < 6) ans = ans + m * 2
  while (mustEven ? ans % 2 !== 0 : ans % 2 !== 1) ans += m
  if (!satisfiesCrt(ans, [m], [r])) return null
  const wrong = wrongCrtOptions(
    ans,
    [m, 2],
    [r, mustEven ? 0 : 1],
    [ans + 1, ans - 1, ans + m, 12, 18, 24],
  )
  return buildQuestion({
    difficulty: 'medium',
    term: '选择性代入',
    passage: `正整数 n ${mustEven ? '是偶数' : '是奇数'}，且除以 ${m} 余 ${r}。`,
    stem: '下列哪一个可能是 n？',
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '先用奇偶或余数排除部分选项，再对剩余选项代入验证。',
    explanation: `${ans} 满足全部条件。`,
    seq,
  })
}

// ——— 困难 ———

function genHardCrtThree(seq: number): SubElimQuestion | null {
  for (let t = 0; t < 25; t++) {
    const m = pickOne([
      [3, 5, 8],
      [4, 5, 7],
      [3, 7, 8],
      [5, 7, 9],
    ])
    const r = m.map((mi) => randInt(1, mi - 1))
    const ans = minCrt(m, r)
    if (ans == null || ans < 30 || ans > 400) continue
    const wrong = wrongCrtOptions(ans, m, r, [23, 53, 88, 158, ans + 1, ans - 5, ans + 20])
    return buildQuestion({
      difficulty: 'hard',
      term: '三同余求最少（加强）',
      hardTypeId: 'crt-three-hard',
      passage: `正整数 n：${m.map((mi, i) => `÷${mi} 余 ${r[i]}`).join('；')}。`,
      stem: 'n 的最小值是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最小：从小选项起代入；三个条件同时满足即得。',
      explanation: `最小解为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardCrtFour(seq: number): SubElimQuestion | null {
  for (let t = 0; t < 20; t++) {
    const m = [3, 5, 7, 8]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6), randInt(1, 7)]
    const ans = minCrt(m, r, 800)
    if (ans == null || ans < 40) continue
    const wrong = wrongCrtOptions(ans, m, r, [53, 88, 128, 158, ans + 3, ans - 7])
    return buildQuestion({
      difficulty: 'hard',
      term: '四条件同余求最少',
      hardTypeId: 'crt-four-min',
      passage: `物体个数：${m.map((mi, i) => `${mi} 个一组余 ${r[i]}`).join('；')}。`,
      stem: '个数最少是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '四条件同时成立，优先代入排除；问最少从小到大试。',
      explanation: `最小解为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardCrtMax(seq: number): SubElimQuestion | null {
  for (let t = 0; t < 25; t++) {
    const m = [3, 5, 7]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6)]
    const maxN = pickOne([100, 120, 150, 200])
    const ans = maxCrtUnder(m, r, maxN)
    if (ans == null || ans < 20) continue
    const smaller = maxCrtUnder(m, r, ans - 1)
    const wrong = uniqueNum(ans, [
      smaller ?? ans - 1,
      maxN,
      ans + 1,
      minCrt(m, r) ?? 23,
    ]).map(Number)
    return buildQuestion({
      difficulty: 'hard',
      term: '上界内求最大',
      hardTypeId: 'crt-max-bound',
      passage: `正整数 n≤${maxN}，且 ${m.map((mi, i) => `÷${mi} 余 ${r[i]}`).join('，')}。`,
      stem: 'n 的最大值是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最大/最多：从较大选项往下代入。',
      explanation: `不超过 ${maxN} 的最大解为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardPctBooks(seq: number): SubElimQuestion | null {
  const pool = [
    { total: 340, aPro: 15, bFrac: [1, 8] as [number, number], aTotal: 200 },
    { total: 420, aPro: 12, bFrac: [1, 5] as [number, number], aTotal: 250 },
    { total: 360, aPro: 16, bFrac: [1, 8] as [number, number], aTotal: 200 },
    { total: 480, aPro: 12.5, bFrac: [1, 6] as [number, number], aTotal: 240 },
  ]
  for (const s of shuffleInPlace([...pool])) {
    const aProPct = s.aPro
    const aDen = aProPct === 12.5 ? 8 : 100 / gcd(Math.round(aProPct), 100)
    // For 12.5%, A total multiple of 8
    const aOk =
      aProPct === 12.5
        ? s.aTotal % 8 === 0
        : s.aTotal % (100 / gcd(Math.round(aProPct), 100)) === 0
    if (!aOk) continue
    const bTotal = s.total - s.aTotal
    if (bTotal % s.bFrac[1] !== 0) continue
    const ans =
      aProPct === 12.5
        ? Math.round(s.aTotal * 0.875)
        : Math.round((s.aTotal * (100 - aProPct)) / 100)
    if (!Number.isInteger(ans)) continue
    const wrong = [ans + 13, Math.round(ans * 2), 87, 174, s.aTotal, ans - 10].filter(
      (x) => x > 0 && x !== ans,
    )
    const aText = aProPct === 12.5 ? '12.5%' : `${aProPct}%`
    const bText =
      s.bFrac[1] === 8 ? '12.5%' : s.bFrac[1] === 5 ? '20%' : s.bFrac[1] === 6 ? `${(100 / 6).toFixed(2)}%` : `${(s.bFrac[0] / s.bFrac[1]) * 100}%`
    const bLabel = s.bFrac[1] === 6 ? '1/6' : bText
    return buildQuestion({
      difficulty: 'hard',
      term: '百分数倍数筛选项（加强）',
      hardTypeId: 'pct-books-hard',
      passage: `甲、乙共有图书 ${s.total} 本。甲的专业书占其藏书的 ${aText}，乙的专业书占其藏书的 ${bLabel}。`,
      stem: '甲的非专业书有多少本？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '百分数化最简分数 → 本数的倍数约束先排除；再代入验证乙侧也是整数倍。',
      explanation: `甲共 ${s.aTotal} 本，非专业 ${ans}；乙 ${bTotal} 本满足倍数条件。`,
      seq,
    })
  }
  return null
}

function genHardDualPct(seq: number): SubElimQuestion | null {
  // A+B=S; A 的 k% 与 B 的 m/n，问 A
  const S = pickOne([200, 240, 280, 320])
  const aPct = pickOne([25, 20, 16])
  const bDen = pickOne([5, 8, 4])
  for (let a = 40; a < S; a += 20) {
    if ((a * aPct) % 100 !== 0) continue
    const b = S - a
    if (b % bDen !== 0) continue
    const ans = a
    const wrong = [a + 20, a - 20, b, S / 2].filter((x) => x > 0 && x !== ans && Number.isInteger(x))
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '双百分数约束代入',
      hardTypeId: 'dual-pct-sub',
      passage: `甲、乙两队共 ${S} 人。甲队党员占甲队 ${aPct}%，乙队党员占乙队 1/${bDen}（人数均为整数）。`,
      stem: '甲队人数是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '甲人数须使 (甲×占比) 为整数；乙人数须为分母倍数。筛选项后代入。',
      explanation: `甲 ${ans}、乙 ${S - ans} 同时满足整数条件。`,
      seq,
    })
  }
  return null
}

function genHardAgeChain(seq: number): SubElimQuestion | null {
  // 简化版经典年龄：已知关系和某年之和，问若干年后年龄
  // 刘 = 黄+5；张 = 刘+6；黄+张=19（2010）→ 黄4，刘9；2020 刘19
  const configs = [
    { h: 4, lOff: 5, zOff: 11, sumYear: 2010, askYear: 2020, sum: 19 },
    { h: 5, lOff: 4, zOff: 10, sumYear: 2012, askYear: 2022, sum: 20 },
    { h: 6, lOff: 3, zOff: 9, sumYear: 2008, askYear: 2018, sum: 21 },
  ]
  const c = pickOne(configs)
  const l2010 = c.h + c.lOff
  const z2010 = c.h + c.zOff
  if (c.h + z2010 !== c.sum) return null
  const ans = l2010 + (c.askYear - c.sumYear)
  const wrong = [l2010, ans + 5, ans - 5, c.sum, z2010]
  return buildQuestion({
    difficulty: 'hard',
    term: '年龄关系链代入',
    hardTypeId: 'age-chain-sub',
    passage: `刘比黄大 ${c.lOff} 岁，张比黄大 ${c.zOff} 岁。${c.sumYear} 年黄与张的年龄之和为 ${c.sum} 岁。`,
    stem: `${c.askYear} 年刘的年龄是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '可由选项反推某年年龄是否满足和与差；或先解出基年年龄再加年差。',
    explanation: `${c.sumYear} 年：黄 ${c.h}、刘 ${l2010}、张 ${z2010}。${c.askYear} 年刘为 ${ans}。`,
    seq,
  })
}

function genHardSpeedHalf(seq: number): SubElimQuestion | null {
  // 走 t1 分钟后提速 p%，总时间 T，求走到一半用时
  // v: (1+p)v = 5:6 when p=20%
  const configs = [
    { t1: 24, T: 48, p: 20, ans: 26 },
    { t1: 20, T: 40, p: 25, ans: 22 }, // 4:5, d1=80a,d2=100a,half=90a → 20+(10a/5a)=22
    { t1: 30, T: 60, p: 20, ans: 33 }, // 5:6, 150a+180a=330a half=165a → 30+15a/6a=32.5 not int
  ]
  const valid = [
    { t1: 24, T: 48, p: 20, ans: 26 },
    { t1: 20, T: 40, p: 25, ans: 22 },
    { t1: 30, T: 50, p: 50, ans: 28 }, // 2:3, d1=60a d2=60a total=120a half=60a → exactly 30 at first speed... half at end of phase1 = 30. Need different.
    { t1: 18, T: 36, p: 50, ans: 21 }, // 2:3, 36a+54a=90a half=45a → 18+9a/3a=21
  ]
  const c = pickOne(valid)
  // verify
  const r0 = 100
  const r1 = 100 + c.p
  const g = gcd(r0, r1)
  const v0 = r0 / g
  const v1 = r1 / g
  const t2 = c.T - c.t1
  const d1 = c.t1 * v0
  const d2 = t2 * v1
  const half = (d1 + d2) / 2
  let time: number
  if (half <= d1) time = half / v0
  else time = c.t1 + (half - d1) / v1
  if (Math.abs(time - c.ans) > 1e-9) {
    // use computed
  }
  const ans = Math.round(time)
  if (Math.abs(time - ans) > 1e-9) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '行程提速求半程时间',
    hardTypeId: 'speed-half-sub',
    passage: `某人从家去单位，走了 ${c.t1} 分钟后提速 ${c.p}%，到达时共用 ${c.T} 分钟。`,
    stem: '走到全程一半时，共用了多少分钟？',
    correct: String(ans),
    distractors: uniqueNum(ans, [c.t1, c.T / 2, ans + 2, ans - 2, 30]),
    method: '速度比化简后算两段路程；半程可能跨过提速点。也可把选项代入检验路程关系。',
    explanation: `提速前:后 = ${v0}:${v1}。前段 ${d1} 份、后段 ${d2} 份，一半 ${half} 份，用时 ${ans} 分钟。`,
    seq,
  })
}

function genHardRemThenSub(seq: number): SubElimQuestion | null {
  // 类似赛点：选项先用余数砍，再代入
  const games = pickOne([14, 16, 18])
  const points = pickOne([19, 22, 25, 28])
  // 3w + d = points, w+d+l = games, find d that works uniquely among options
  const candidates: number[] = []
  for (let d = 0; d <= games; d++) {
    if ((points - d) % 3 !== 0) continue
    const w = (points - d) / 3
    if (w < 0) continue
    const l = games - w - d
    if (l >= 0) candidates.push(d)
  }
  if (candidates.length === 0) return null
  const ans = pickOne(candidates)
  const need = mod(points, 3)
  const wrong: number[] = []
  for (const x of [2, 4, 6, 8, 10, 12, 1, 3, 5, 7, 9]) {
    if (x === ans || x > games) continue
    if (mod(x, 3) === need && candidates.includes(x)) continue
    wrong.push(x)
    if (wrong.length >= 3) break
  }
  if (wrong.length < 3) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '先余数排除再代入',
    hardTypeId: 'rem-then-sub',
    passage: `球队赛 ${games} 场，胜一场 3 分、平一场 1 分、负一场 0 分，共得 ${points} 分。`,
    stem: '平局场次可能是？',
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: '先由同余：平局 ≡ 总分 (mod 3) 排除；再代入验证胜场、负场非负。',
    explanation: `${points}÷3 余 ${need}，平局也须余 ${need}。验证得 ${ans}。`,
    seq,
  })
}

function genHardSumPctElim(seq: number): SubElimQuestion | null {
  const total = pickOne([260, 300, 360])
  const aPctNon = pickOne([87, 80, 75]) // 非专业占比
  // ans = A non-pro = multiple of simplified numerator
  const g = gcd(aPctNon, 100)
  const mult = aPctNon / g
  const k = pickOne([1, 2])
  const ans = mult * k
  const aTotal = (ans * 100) / aPctNon
  if (!Number.isInteger(aTotal)) return null
  const bTotal = total - aTotal
  if (bTotal <= 0) return null
  // B 专业 12.5% => b multiple of 8
  if (bTotal % 8 !== 0) {
    // try other k
    return null
  }
  const wrong = [mult, ans * 2 === ans ? ans + mult : ans * 2, 67, 75, 174].filter(
    (x) => x !== ans && x > 0,
  )
  return buildQuestion({
    difficulty: 'hard',
    term: '两数之和+百分数',
    hardTypeId: 'sum-pct-elim',
    passage: `甲、乙共有书 ${total} 本。甲的非专业书占其藏书的 ${aPctNon}%，乙的专业书占其藏书的 12.5%。`,
    stem: '甲的非专业书有多少本？',
    correct: String(ans),
    distractors: uniqueNum(ans, wrong),
    method: `${aPctNon}%=${aPctNon / g}/${100 / g}，甲非专业是 ${mult} 的倍数；乙总数是 8 的倍数。排除后代入。`,
    explanation: `甲非专业 ${ans} ⇒ 甲共 ${aTotal}，乙 ${bTotal}（能被 8 整除）。`,
    seq,
  })
}

function genHardMultiCond(seq: number): SubElimQuestion | null {
  for (let t = 0; t < 30; t++) {
    const m1 = 4
    const m2 = 5
    const m3 = 7
    const r1 = randInt(0, 3)
    const r2 = randInt(0, 4)
    const r3 = randInt(0, 6)
    const ans = minCrt([m1, m2, m3], [r1, r2, r3])
    if (ans == null || ans < 25 || ans > 300) continue
    // also require even
    let n = ans
    while (n <= 600 && n % 2 !== 0) {
      // find next CRT solution that is even - lcm period
      n += m1 * m2 * m3
    }
    if (n > 600 || !satisfiesCrt(n, [m1, m2, m3], [r1, r2, r3]) || n % 2 !== 0) {
      // search
      n = 0
      for (let x = 2; x <= 600; x += 2) {
        if (satisfiesCrt(x, [m1, m2, m3], [r1, r2, r3])) {
          n = x
          break
        }
      }
      if (!n) continue
    }
    const wrong = wrongCrtOptions(n, [m1, m2, m3, 2], [r1, r2, r3, 0], [
      n + 1,
      n - 2,
      53,
      88,
      n + 20,
    ])
    return buildQuestion({
      difficulty: 'hard',
      term: '多条件综合代入',
      hardTypeId: 'multi-cond-sub',
      passage: `正整数 n 是偶数，且 ÷${m1} 余 ${r1}，÷${m2} 余 ${r2}，÷${m3} 余 ${r3}。`,
      stem: 'n 的最小值是？',
      correct: String(n),
      distractors: uniqueNum(n, wrong),
      method: '先用奇偶排除奇数选项，再对余数条件逐一代入。',
      explanation: `最小偶数解为 ${n}。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<SubElimHardTypeId, (seq: number) => SubElimQuestion | null> = {
  'crt-three-hard': genHardCrtThree,
  'crt-four-min': genHardCrtFour,
  'crt-max-bound': genHardCrtMax,
  'pct-books-hard': genHardPctBooks,
  'dual-pct-sub': genHardDualPct,
  'age-chain-sub': genHardAgeChain,
  'speed-half-sub': genHardSpeedHalf,
  'rem-then-sub': genHardRemThenSub,
  'sum-pct-elim': genHardSumPctElim,
  'multi-cond-sub': genHardMultiCond,
}

function tryBuild(factory: () => SubElimQuestion | null, maxTry = 30): SubElimQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateSubElimPaper(difficulty: SubElimDifficulty): SubElimQuestion[] {
  const out: SubElimQuestion[] = []
  const seen = new Set<string>()

  const push = (q: SubElimQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasySingleRem, genEasyTwoRem, genEasyMultipleOf, genEasyLinearSub]
    let guard = 0
    while (out.length < SUB_ELIM_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumCrtClassic(0),
      () => genMediumBooksPct(1),
      () => genMediumCrtClassic(2),
      () => genMediumSelectiveRem(3),
      () => (Math.random() < 0.5 ? genMediumBooksPct(4) : genMediumCrtClassic(4)),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < SUB_ELIM_QUESTION_COUNT && guard++ < 40) {
      push(tryBuild(() => genMediumCrtClassic(out.length)))
    }
  } else {
    const types = shuffleInPlace([...SUB_ELIM_HARD_EXAM_TYPES.map((t) => t.id)]).slice(
      0,
      SUB_ELIM_QUESTION_COUNT,
    )
    for (const typeId of types) {
      const builder = HARD_BUILDERS[typeId]
      let q: SubElimQuestion | null = null
      for (let t = 0; t < 40; t++) {
        q = builder(out.length)
        if (q && !seen.has(q.fingerprint)) break
        q = null
      }
      if (q) {
        seen.add(q.fingerprint)
        out.push(q)
      }
    }
  }

  if (out.length < SUB_ELIM_QUESTION_COUNT) {
    throw new Error(`代入排除法组卷不足：仅 ${out.length}/${SUB_ELIM_QUESTION_COUNT}`)
  }
  return out.slice(0, SUB_ELIM_QUESTION_COUNT)
}
