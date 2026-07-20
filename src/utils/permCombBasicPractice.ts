/**
 * 高频运算 · 排列组合 · 基本原理及公式
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式：
 * - 加法原理（分类）：总办法 = 各类办法之和
 * - 乘法原理（分步）：总办法 = 各步办法之积
 * - 排列：A_n^m = n×(n−1)×…×(n−m+1) = n!/(n−m)!
 * - 组合：C_n^m = A_n^m / m! = n!/(m!(n−m)!)；C_n^m = C_n^{n−m}
 *
 * 【简单】对齐书中示例 1～4（加法/乘法/排列/组合直算）
 * 【普通】对齐经典真题 1（枚举分类）、经典真题 2（间接法 2^n−2）
 * 【困难】高于真题 1、2；≥6 种变式，每轮抽 5 种且题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type PermCombBasicDifficulty = 'easy' | 'medium' | 'hard'

export const PERM_COMB_BASIC_QUESTION_COUNT = 5

export const PERM_COMB_BASIC_MODES: {
  id: PermCombBasicDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '基本原理及公式 · 简单',
    desc: '每轮 5 题 · 对齐示例 1～4（加法/乘法/排列/组合）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '基本原理及公式 · 普通',
    desc: '每轮 5 题 · 对齐经典真题 1（枚举）、真题 2（间接法）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '基本原理及公式 · 困难',
    desc: '每轮 5 题 · 比真题 1、2 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PERM_COMB_BASIC_HARD_EXAM_TYPES = [
  {
    id: 'enum-volume',
    name: '枚举凑定量',
    note: '经典真题 1 加强：多种规格凑固定总量，分类枚举',
  },
  {
    id: 'assign-two',
    name: '两组分配间接法',
    note: '经典真题 2 加强：每人选组，排除全空，2^n−2 或同类',
  },
  {
    id: 'fixed-ends',
    name: '首尾限定优限法',
    note: '首尾节目/位置先排，再排中间（对齐真题 3 思路）',
  },
  {
    id: 'bundle-adjacent',
    name: '相邻捆绑法',
    note: '必须相邻的元素捆成一块再排列',
  },
  {
    id: 'not-adjacent',
    name: '不相邻间接法',
    note: '总排法减去相邻排法',
  },
  {
    id: 'choose-then-arrange',
    name: '先选后排',
    note: '先组合选出人/物，再排列顺序',
  },
  {
    id: 'fixed-one-then-rest',
    name: '指定位置优限法',
    note: '某人固定位置后，其余全排列（示例 5 加强）',
  },
] as const

export type PermCombBasicHardTypeId = (typeof PERM_COMB_BASIC_HARD_EXAM_TYPES)[number]['id']

export type PermCombBasicQuestion = {
  id: string
  topic: 'perm-comb-basic'
  difficulty: PermCombBasicDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: PermCombBasicHardTypeId
}

export function permCombBasicTopicLabel(): string {
  return '基本原理及公式'
}

export function permCombBasicDifficultyLabel(d: PermCombBasicDifficulty): string {
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

function fact(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function perm(n: number, m: number): number {
  if (m < 0 || m > n) return 0
  let r = 1
  for (let i = 0; i < m; i++) r *= n - i
  return r
}

function comb(n: number, m: number): number {
  if (m < 0 || m > n) return 0
  m = Math.min(m, n - m)
  let r = 1
  for (let i = 1; i <= m; i++) r = (r * (n - m + i)) / i
  return Math.round(r)
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
  const base = Number(correct)
  while (out.length < need && g++ < 50) {
    const fake = Number.isFinite(base) ? String(Math.round(base) + g) : `${correct}+${g}`
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
  difficulty: PermCombBasicDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: PermCombBasicHardTypeId
  seq: number
}): PermCombBasicQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'perm-comb-basic',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `pcb-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'perm-comb-basic',
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

// ——— 简单 · 示例 1～4 ———

/** 示例 1：加法原理 */
function genEasyAdd(seq: number): PermCombBasicQuestion | null {
  const a = pickOne([2, 3, 4])
  const b = pickOne([3, 4, 5])
  const c = pickOne([1, 2, 3])
  const total = a + b + c
  return buildQuestion({
    difficulty: 'easy',
    term: '加法原理（示例 1）',
    passage: `从甲地到乙地：火车有 ${a} 个班次，汽车有 ${b} 条线路，飞机有 ${c} 个航班（三类交通互不影响，任选一类即可到达）。`,
    stem: '一共有多少种走法？',
    correct: String(total),
    distractors: uniqueNum(total, [a * b * c, a + b, a * b + c, total + 1]),
    method: '加法原理（分类）：完成一件事有几类办法，总办法数 = 各类办法数之和。',
    explanation: `${a}+${b}+${c}=${total}。`,
    seq,
  })
}

/** 示例 2：乘法原理 */
function genEasyMul(seq: number): PermCombBasicQuestion | null {
  const a = pickOne([3, 4, 5])
  const b = pickOne([2, 3, 4])
  const total = a * b
  return buildQuestion({
    difficulty: 'easy',
    term: '乘法原理（示例 2）',
    passage: `从甲地到乙地必须经丙地中转。甲→丙有 ${a} 种走法，丙→乙有 ${b} 种走法。`,
    stem: '甲到乙一共有多少种走法？',
    correct: String(total),
    distractors: uniqueNum(total, [a + b, a * b + 1, Math.max(a, b), a * b - 1]),
    method: '乘法原理（分步）：完成一件事需分若干步，总办法数 = 各步办法数之积。',
    explanation: `${a}×${b}=${total}。`,
    seq,
  })
}

/** 示例 3：排列 */
function genEasyPerm(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([4, 5, 6])
  const m = pickOne([2, 3])
  if (m > n) return null
  const ans = perm(n, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '排列公式（示例 3）',
    passage: `从 ${n} 名不同的小朋友中选出 ${m} 名，按左右顺序站成一排。`,
    stem: '有多少种不同的站法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [comb(n, m), perm(n, m - 1), fact(m), n * m]),
    method: '排列：从 n 个不同元素中取 m 个并排成顺序。A_n^m = n×(n−1)×…×(n−m+1)。',
    explanation: `A_${n}^${m}=${ans}。`,
    seq,
  })
}

/** 示例 4：组合 */
function genEasyComb(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([4, 5, 6, 7])
  const m = pickOne([2, 3])
  if (m > n) return null
  const ans = comb(n, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '组合公式（示例 4）',
    passage: `从 ${n} 名不同的小朋友中选出 ${m} 名组成一个小组（不分顺序）。`,
    stem: '有多少种不同的选法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [perm(n, m), comb(n, m - 1), n * m, fact(m)]),
    method: '组合：只选不排。C_n^m = A_n^m / m!。',
    explanation: `C_${n}^${m}=${ans}。`,
    seq,
  })
}

function genEasyFullPerm(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([3, 4, 5])
  const ans = fact(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '全排列',
    passage: `${n} 本不同的书排成一排。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [n * n, perm(n, n - 1), comb(n, 2), ans / 2]),
    method: '全排列 A_n^n = n!。',
    explanation: `${n}!=${ans}。`,
    seq,
  })
}

// ——— 普通 · 真题 1、2 ———

/** 经典真题 1：枚举凑升数 */
function countBottleWays(
  need: number,
  big: number,
  mid: number,
  small: number,
  bigMax: number,
  midMax: number,
  smallMax: number,
): number {
  let ways = 0
  for (let b = 0; b <= bigMax && b * big <= need; b++) {
    const rem1 = need - b * big
    for (let m = 0; m <= midMax && m * mid <= rem1; m++) {
      const rem2 = rem1 - m * mid
      if (rem2 % small === 0) {
        const s = rem2 / small
        if (s >= 0 && s <= smallMax) ways++
      }
    }
  }
  return ways
}

function genMediumClassic1(seq: number): PermCombBasicQuestion | null {
  for (let i = 0; i < 40; i++) {
    const need = pickOne([8, 9, 10, 12])
    const big = 5
    const mid = 2
    const small = 1
    const bigMax = pickOne([2, 3])
    const midMax = pickOne([3, 4])
    const smallMax = pickOne([8, 10, 12])
    const ways = countBottleWays(need, big, mid, small, bigMax, midMax, smallMax)
    if (ways < 4 || ways > 12) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '枚举分类凑定量（经典真题 1）',
      passage: `需要恰好买满 ${need} 升饮料。超市有 ${big} 升装至多 ${bigMax} 瓶、${mid} 升装至多 ${midMax} 瓶、${small} 升装至多 ${smallMax} 瓶（每种瓶数不能超过库存）。`,
      stem: '有多少种不同的购买方案？',
      correct: String(ways),
      distractors: uniqueNum(ways, [ways - 1, ways + 1, ways + 2, bigMax + midMax]),
      method: '加法原理 + 枚举：按大瓶瓶数分类，再枚举中瓶，看小瓶是否恰好凑满且不超库存。',
      explanation: `按 ${big} 升瓶数分类枚举，共 ${ways} 种方案。`,
      seq,
    })
  }
  // 教材：15 瓶 5L、3 瓶 2L、8 瓶 1L，凑 9L → 6
  return buildQuestion({
    difficulty: 'medium',
    term: '枚举分类凑定量（经典真题 1）',
    passage:
      '需要恰好 9 升可乐。超市有 5 升装 15 瓶、2 升装 3 瓶、1 升装 8 瓶。',
    stem: '有多少种不同的购买方案？',
    correct: '6',
    distractors: uniqueNum(6, [4, 5, 7]),
    method: '按 5 升瓶数分类：买 1 瓶 5 升剩 4 升有 3 种；买 0 瓶 5 升剩 9 升有 3 种；共 6 种。',
    explanation: '共 6 种方案。',
    seq,
  })
}

/** 经典真题 2：每人选 A/B，两组均非空 → 2^n − 2 */
function genMediumClassic2(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const ans = 2 ** n - 2
  return buildQuestion({
    difficulty: 'medium',
    term: '两组分配间接法（经典真题 2）',
    passage: `把 ${n} 名技工分配到甲、乙两个项目，每人参加且只参加一个项目，且两个项目都至少有 1 人。`,
    stem: '有多少种分配方法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [2 ** n, 2 ** n - 1, comb(n, Math.floor(n / 2)), n * 2]),
    method: '间接法：每人 2 种选择共 2^n 种；减去全部去甲、全部去乙 2 种。',
    explanation: `2^${n}−2=${ans}。`,
    seq,
  })
}

function genMediumMixedAddMul(seq: number): PermCombBasicQuestion | null {
  const a = pickOne([2, 3])
  const b = pickOne([3, 4])
  const c = pickOne([2, 3])
  // 两类路线：一类直达 a 种；一类中转 b×c
  const total = a + b * c
  return buildQuestion({
    difficulty: 'medium',
    term: '分类加分步',
    passage: `甲到乙：可直达，有 ${a} 种走法；也可经丙中转，甲→丙有 ${b} 种、丙→乙有 ${c} 种。`,
    stem: '一共有多少种走法？',
    correct: String(total),
    distractors: uniqueNum(total, [a + b + c, a * b * c, b * c, a * b + c]),
    method: '先分类（直达 / 中转），中转类内再分步相乘，最后各类相加。',
    explanation: `${a}+${b}×${c}=${total}。`,
    seq,
  })
}

function genMediumCombThenAdd(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([6, 7, 8])
  // 选 2 人或选 3 人开会
  const ans = comb(n, 2) + comb(n, 3)
  return buildQuestion({
    difficulty: 'medium',
    term: '两类组合相加',
    passage: `从 ${n} 人中选人开会：可以选 2 人，也可以选 3 人。`,
    stem: '有多少种选法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [comb(n, 2), comb(n, 3), comb(n, 2) * comb(n, 3), perm(n, 2)]),
    method: '分类用加法：C_n^2 + C_n^3。',
    explanation: `C_${n}^2+C_${n}^3=${ans}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardEnumVolume(seq: number): PermCombBasicQuestion | null {
  for (let i = 0; i < 40; i++) {
    const need = pickOne([10, 11, 12, 14])
    const big = pickOne([4, 5])
    const mid = 2
    const small = 1
    const bigMax = pickOne([3, 4])
    const midMax = pickOne([4, 5])
    const smallMax = pickOne([10, 12, 14])
    const ways = countBottleWays(need, big, mid, small, bigMax, midMax, smallMax)
    if (ways < 5 || ways > 15) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '枚举凑定量加强',
      hardTypeId: 'enum-volume',
      passage: `需恰好采购 ${need} 件货物。仓库有大件（每件当 ${big}）、中件（每件当 ${mid}）、小件（每件当 ${small}），库存分别至多 ${bigMax}、${midMax}、${smallMax} 件。`,
      stem: '有多少种采购组合？',
      correct: String(ways),
      distractors: uniqueNum(ways, [ways - 2, ways + 1, ways + 3, bigMax * midMax]),
      method: '按大件数量分类枚举，再定中件，检验小件是否非负且不超库存。',
      explanation: `枚举得 ${ways} 种。`,
      seq,
    })
  }
  return null
}

function genHardAssignTwo(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([6, 7, 8, 9])
  // 两组均非空；若还要求两组人数不能为 0 已含；可选：两组人数都≥2 → 2^n - 2 - 2*C(n,1)
  const mode = pickOne(['nonempty', 'min2'] as const)
  if (mode === 'nonempty') {
    const ans = 2 ** n - 2
    return buildQuestion({
      difficulty: 'hard',
      term: '两组均非空分配',
      hardTypeId: 'assign-two',
      passage: `${n} 名员工分配到甲、乙两队，每人一队，两队都不能空。`,
      stem: '有多少种分法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [2 ** n, 2 ** n - 1, comb(n, 1) * 2, ans - n]),
      method: '间接法：2^n−2。',
      explanation: `2^${n}−2=${ans}。`,
      seq,
    })
  }
  // 每队至少 2 人：2^n - 2 - 2n
  const ans = 2 ** n - 2 - 2 * n
  if (ans <= 0) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '两组均至少两人',
    hardTypeId: 'assign-two',
    passage: `${n} 名员工分到甲、乙两队，每人一队，且每队至少 2 人。`,
    stem: '有多少种分法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [2 ** n - 2, 2 ** n - 2 * n, ans + 2, 2 ** n]),
    method: '2^n 减去两队有一队为空（2），再减去恰有一队只有 1 人（2n）。',
    explanation: `2^${n}−2−2×${n}=${ans}。`,
    seq,
  })
}

function genHardFixedEnds(seq: number): PermCombBasicQuestion | null {
  // 6 个节目：k 个歌舞、其余相声；首尾必须是歌舞
  const dance = pickOne([2, 3])
  const talk = pickOne([3, 4])
  const total = dance + talk
  if (dance < 2) return null
  const ans = perm(dance, 2) * fact(total - 2)
  return buildQuestion({
    difficulty: 'hard',
    term: '首尾限定优限法',
    hardTypeId: 'fixed-ends',
    passage: `晚会有 ${total} 个节目：其中歌舞 ${dance} 个、相声 ${talk} 个。要求第一个和最后一个必须是歌舞节目。`,
    stem: '节目单有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(total), perm(dance, 2) * fact(talk), fact(total - 2), dance * talk * fact(total - 2)]),
    method: '优限法：先排首尾两个歌舞位置 A_歌舞^2，再对其余节目全排列。',
    explanation: `A_${dance}^2×${total - 2}!=${ans}。`,
    seq,
  })
}

function genHardBundle(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([5, 6, 7])
  // n 人排队，其中甲乙必须相邻
  const ans = 2 * fact(n - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '相邻捆绑法',
    hardTypeId: 'bundle-adjacent',
    passage: `${n} 人排成一排，其中甲、乙两人必须相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n - 1), 2 * fact(n), perm(n, 2) * fact(n - 2)]),
    method: '捆绑法：甲乙捆成一块，内部 2!，与其余共 (n−1) 个单元全排列。',
    explanation: `2×(n−1)!=2×${fact(n - 1)}=${ans}。`,
    seq,
  })
}

function genHardNotAdjacent(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([5, 6, 7])
  const total = fact(n)
  const adj = 2 * fact(n - 1)
  const ans = total - adj
  return buildQuestion({
    difficulty: 'hard',
    term: '不相邻间接法',
    hardTypeId: 'not-adjacent',
    passage: `${n} 人排成一排，要求甲、乙两人不相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [total, adj, fact(n - 2), ans + 2]),
    method: '间接法：总排法 n! 减去甲乙相邻的 2×(n−1)!。',
    explanation: `${n}!−2×${n - 1}!=${ans}。`,
    seq,
  })
}

function genHardChooseArrange(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([6, 7, 8])
  const m = pickOne([3, 4])
  if (m > n) return null
  const ans = comb(n, m) * fact(m) // = perm(n,m)
  return buildQuestion({
    difficulty: 'hard',
    term: '先选后排',
    hardTypeId: 'choose-then-arrange',
    passage: `从 ${n} 名选手中选出 ${m} 名，再按名次排成一列领奖。`,
    stem: '有多少种不同结果？',
    correct: String(ans),
    distractors: uniqueNum(ans, [comb(n, m), fact(m), perm(n, m - 1), comb(n, m) * m]),
    method: '先组合选出人 C_n^m，再全排列 m!；等价于排列 A_n^m。',
    explanation: `C_${n}^${m}×${m}!=A_${n}^${m}=${ans}。`,
    seq,
  })
}

function genHardFixedOne(seq: number): PermCombBasicQuestion | null {
  const n = pickOne([5, 6, 7])
  // 甲必须在第一个位置，或甲必须在两端之一
  const mode = pickOne(['first', 'ends'] as const)
  if (mode === 'first') {
    const ans = fact(n - 1)
    return buildQuestion({
      difficulty: 'hard',
      term: '指定位置优限法',
      hardTypeId: 'fixed-one-then-rest',
      passage: `${n} 人排成一排，要求甲必须站在最左边。`,
      stem: '有多少种排法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [fact(n), 2 * fact(n - 1), perm(n, 2), n * fact(n - 2)]),
      method: '优限法：先固定甲的位置，其余 (n−1)!。',
      explanation: `(${n}−1)!=${ans}。`,
      seq,
    })
  }
  const ans = 2 * fact(n - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '指定位置优限法',
    hardTypeId: 'fixed-one-then-rest',
    passage: `${n} 人排成一排，要求甲必须站在两端（最左或最右）。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n - 1), fact(n), 2 * fact(n - 2), n * 2]),
    method: '甲有 2 个端点可选，其余 (n−1)!。',
    explanation: `2×(${n}−1)!=${ans}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  PermCombBasicHardTypeId,
  (seq: number) => PermCombBasicQuestion | null
> = {
  'enum-volume': genHardEnumVolume,
  'assign-two': genHardAssignTwo,
  'fixed-ends': genHardFixedEnds,
  'bundle-adjacent': genHardBundle,
  'not-adjacent': genHardNotAdjacent,
  'choose-then-arrange': genHardChooseArrange,
  'fixed-one-then-rest': genHardFixedOne,
}

function tryBuild(
  factory: () => PermCombBasicQuestion | null,
  maxTry = 50,
): PermCombBasicQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generatePermCombBasicPaper(
  difficulty: PermCombBasicDifficulty,
): PermCombBasicQuestion[] {
  const out: PermCombBasicQuestion[] = []
  const seen = new Set<string>()
  const push = (q: PermCombBasicQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyAdd, genEasyMul, genEasyPerm, genEasyComb, genEasyFullPerm]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_BASIC_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_BASIC_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumClassic1,
      genMediumClassic2,
      genMediumMixedAddMul,
      genMediumCombThenAdd,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_BASIC_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_BASIC_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<PermCombBasicHardTypeId>()
    const types = shuffleInPlace([...PERM_COMB_BASIC_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= PERM_COMB_BASIC_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = PERM_COMB_BASIC_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < PERM_COMB_BASIC_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : PERM_COMB_BASIC_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, PERM_COMB_BASIC_QUESTION_COUNT)
}
