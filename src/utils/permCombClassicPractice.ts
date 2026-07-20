/**
 * 高频运算 · 排列组合 · 排列组合经典模型
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式：
 * - 环形排列：n 人围成一圈（旋转相同）→ (n−1)! = A_{n−1}^{n−1}
 * - 错位重排：D_n=(n−1)(D_{n−1}+D_{n−2})；D_1=0,D_2=1,D_3=2,D_4=9,D_5=44
 * - 同素分堆（插板法）：n 个相同元素分成 m 组且每组至少 1 个 → C_{n−1}^{m−1}
 *   若每组至少 k 个：先各预分 (k−1)，再对剩余做「至少 1」插板
 *
 * 【简单】对齐经典真题 7（环形）
 * 【普通】对齐经典真题 8（错位）、真题 9（同素分堆）
 * 【困难】高于书中例题；≥6 种变式，每轮抽 6 种且题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type PermCombClassicDifficulty = 'easy' | 'medium' | 'hard'

export const PERM_COMB_CLASSIC_QUESTION_COUNT = 6

export const PERM_COMB_CLASSIC_MODES: {
  id: PermCombClassicDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '经典模型 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 7（环形排列）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '经典模型 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 8（错位）、真题 9（同素分堆）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '经典模型 · 困难',
    desc: '每轮 6 题 · 比书中例题更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PERM_COMB_CLASSIC_HARD_EXAM_TYPES = [
  {
    id: 'circular-plus',
    name: '环形加强',
    note: '环形基础上加相邻/不相邻等限制',
  },
  {
    id: 'derange-plus',
    name: '错位加强',
    note: 'D_n 或部分位置错位、与排列组合结合',
  },
  {
    id: 'stars-at-least-one',
    name: '同素分堆至少一',
    note: '插板法 C_{n−1}^{m−1} 加强数字',
  },
  {
    id: 'stars-prealloc',
    name: '预分后插板',
    note: '真题 9 加强：每组至少 k 个，先预分再插板',
  },
  {
    id: 'stars-allow-zero',
    name: '允许空堆',
    note: 'n 个相同分 m 组允许为空：C_{n+m−1}^{m−1}',
  },
  {
    id: 'circular-fix',
    name: '环形定点',
    note: '先固定一人破环，再排其余（强调破环思想）',
  },
  {
    id: 'mix-circular-derange',
    name: '环形与错位综合',
    note: '先环形再错位，或错位后再分类',
  },
] as const

export type PermCombClassicHardTypeId = (typeof PERM_COMB_CLASSIC_HARD_EXAM_TYPES)[number]['id']

export type PermCombClassicQuestion = {
  id: string
  topic: 'perm-comb-classic'
  difficulty: PermCombClassicDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: PermCombClassicHardTypeId
}

export function permCombClassicTopicLabel(): string {
  return '排列组合经典模型'
}

export function permCombClassicDifficultyLabel(d: PermCombClassicDifficulty): string {
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

function comb(n: number, m: number): number {
  if (m < 0 || m > n) return 0
  m = Math.min(m, n - m)
  let r = 1
  for (let i = 1; i <= m; i++) r = (r * (n - m + i)) / i
  return Math.round(r)
}

/** 错位重排 D_n */
const D: Record<number, number> = {
  0: 1,
  1: 0,
  2: 1,
  3: 2,
  4: 9,
  5: 44,
  6: 265,
  7: 1854,
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
  difficulty: PermCombClassicDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: PermCombClassicHardTypeId
  seq: number
}): PermCombClassicQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'perm-comb-classic',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `pcm-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'perm-comb-classic',
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

// ——— 简单 · 真题 7 环形 ———

function genEasyCircular(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const ans = fact(n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '环形排列（经典真题 7）',
    passage: `${n} 人围成一圈跳舞（旋转后相同视为同一种站法，翻转不算同一种）。`,
    stem: '有多少种不同的站法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n - 2), n * fact(n - 1), Math.floor(fact(n - 1) / 2)]),
    method: '环形排列：固定一人破环，其余 (n−1)!；即 A_{n−1}^{n−1}。',
    explanation: `(${n}−1)!=${ans}。`,
    seq,
  })
}

function genEasyCircularMenWomen(seq: number): PermCombClassicQuestion | null {
  // 真题 7 情境：4 男 2 女共 6 人围圈
  const men = pickOne([3, 4])
  const women = pickOne([2, 3])
  const n = men + women
  const ans = fact(n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '男女围圈环形（经典真题 7）',
    passage: `某小组有 ${men} 名男生、${women} 名女生，共 ${n} 人围成一圈跳舞（旋转相同算一种）。`,
    stem: '有多少种站法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(men) * fact(women), fact(n - 2), n * fact(n - 2)]),
    method: '不论男女，共 n 人环形：(n−1)!。',
    explanation: `(${n}−1)!=${ans}。`,
    seq,
  })
}

function genEasyCircularFixOne(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([5, 6, 7])
  const ans = fact(n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '固定一人破环',
    passage: `${n} 人围桌而坐。可先固定其中一人的位置以消除旋转带来的重复。`,
    stem: '不同坐法有多少种？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), n * fact(n - 1), fact(n - 2)]),
    method: '固定一人后，其余 n−1 人直线全排：(n−1)!。',
    explanation: `(${n}−1)!=${ans}。`,
    seq,
  })
}

// ——— 普通 · 真题 8、9 ———

function genMediumDerange(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([4, 5, 6])
  const ans = D[n]!
  return buildQuestion({
    difficulty: 'medium',
    term: '错位重排（经典真题 8）',
    passage: `${n} 名选手分别从编号 1～${n} 的门进入迷宫，要求每人离开时都不能走自己编号对应的门。`,
    stem: '有多少种离开方式？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), D[n - 1] ?? ans - 1, fact(n) - 1, n * (D[n - 1] ?? 1)]),
    method: '错位重排 D_n：任何元素都不在原位。可记 D_4=9，D_5=44，D_6=265。',
    explanation: `D_${n}=${ans}。`,
    seq,
  })
}

function genMediumStarsBasic(seq: number): PermCombClassicQuestion | null {
  // 示例 9：10 球分 4 人每人至少一个 → C_9^3=84
  for (let i = 0; i < 30; i++) {
    const n = pickOne([8, 9, 10, 12])
    const m = pickOne([3, 4, 5])
    if (n <= m) continue
    const ans = comb(n - 1, m - 1)
    return buildQuestion({
      difficulty: 'medium',
      term: '同素分堆至少一（插板法）',
      passage: `把 ${n} 个完全相同的球分给 ${m} 个不同的孩子，每个孩子至少分到 1 个。`,
      stem: '有多少种分法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [comb(n, m), comb(n - 1, m), m ** n, comb(n + m - 1, m - 1)]),
      method: '插板法：n 个相同排成一排，n−1 个空隙插入 m−1 块板 → C_{n−1}^{m−1}。',
      explanation: `C_${n - 1}^{${m - 1}}=${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '同素分堆至少一（插板法）',
    passage: '把 10 个相同的足球分给 4 个孩子，每人至少一个。',
    stem: '有多少种分法？',
    correct: '84',
    distractors: uniqueNum(84, [120, 36, 210]),
    method: 'C_9^3=84。',
    explanation: '共 84 种。',
    seq,
  })
}

function genMediumStarsPrealloc(seq: number): PermCombClassicQuestion | null {
  // 真题 9：30 玩具 3 桶每桶至少 9 → 先各放 8，剩 6 再每人至少 1 → C_5^2=10
  for (let i = 0; i < 40; i++) {
    const buckets = pickOne([3, 4])
    const minEach = pickOne([5, 6, 8, 9])
    const total = pickOne([20, 24, 30, 32])
    const pre = minEach - 1
    const remain = total - pre * buckets
    if (remain < buckets) continue
    const ans = comb(remain - 1, buckets - 1)
    if (ans < 4 || ans > 120) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '预分后同素分堆（经典真题 9）',
      passage: `把 ${total} 个完全相同的玩具放入 ${buckets} 个不同颜色的箱子，每个箱子至少 ${minEach} 个。`,
      stem: '有多少种放法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [
        comb(total - 1, buckets - 1),
        comb(remain, buckets - 1),
        comb(remain - 1, buckets),
        buckets * remain,
      ]),
      method: `先每个箱子放 ${pre} 个，剩余 ${remain} 个再按「每箱至少 1 个」插板：C_{${remain}−1}^{${buckets}−1}。`,
      explanation: `先各放 ${pre}，剩 ${remain}；C_${remain - 1}^{${buckets - 1}}=${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '预分后同素分堆（经典真题 9）',
    passage: '把 30 个相同玩具放入 3 个不同颜色箱子，每箱至少 9 个。',
    stem: '有多少种放法？',
    correct: '10',
    distractors: uniqueNum(10, [15, 6, 20]),
    method: '先各放 8 个，剩 6 个再每箱至少 1：C_5^2=10。',
    explanation: '共 10 种。',
    seq,
  })
}

function genMediumDerangeLetter(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([3, 4, 5])
  const ans = D[n]!
  return buildQuestion({
    difficulty: 'medium',
    term: '信封错位',
    passage: `${n} 封写好的信与 ${n} 个写好地址的信封，要求每封信都不装进自己的信封。`,
    stem: '有多少种装法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), D[n - 1] ?? 1, fact(n) - n]),
    method: '错位重排 D_n。',
    explanation: `D_${n}=${ans}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardCircularPlus(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([6, 7, 8])
  const mode = pickOne(['adjacent', 'not-adj'] as const)
  if (mode === 'adjacent') {
    // 环形甲乙相邻：捆成一块，(n-2)! * 2
    const ans = 2 * fact(n - 2)
    return buildQuestion({
      difficulty: 'hard',
      term: '环形两人相邻',
      hardTypeId: 'circular-plus',
      passage: `${n} 人围成一圈，要求甲、乙必须相邻（旋转相同算一种）。`,
      stem: '有多少种站法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [fact(n - 1), 2 * fact(n - 1), fact(n - 2), 2 * fact(n - 3)]),
      method: '甲乙捆绑后环形排 n−1 个单元得 (n−2)!，块内×2。',
      explanation: `2×(${n}−2)!=${ans}。`,
      seq,
    })
  }
  // 环形不相邻：总环形 − 相邻环形
  const total = fact(n - 1)
  const adj = 2 * fact(n - 2)
  const ans = total - adj
  return buildQuestion({
    difficulty: 'hard',
    term: '环形两人不相邻',
    hardTypeId: 'circular-plus',
    passage: `${n} 人围成一圈，要求甲、乙不相邻（旋转相同算一种）。`,
    stem: '有多少种站法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [total, adj, fact(n - 2), ans + 2]),
    method: '间接法：(n−1)! − 2×(n−2)!。',
    explanation: `(${n}−1)!−2×(${n}−2)!=${ans}。`,
    seq,
  })
}

function genHardDerangePlus(seq: number): PermCombClassicQuestion | null {
  const mode = pickOne(['plain', 'one-fixed'] as const)
  if (mode === 'plain') {
    const n = pickOne([5, 6, 7])
    const ans = D[n]!
    return buildQuestion({
      difficulty: 'hard',
      term: '错位重排加强',
      hardTypeId: 'derange-plus',
      passage: `${n} 人各有一件外套，聚会结束时每人随机拿一件，要求谁都拿不到自己的外套。`,
      stem: '有多少种拿法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [fact(n), D[n - 1]!, n * D[n - 1]!]),
      method: 'D_n；也可用递推 D_n=(n−1)(D_{n−1}+D_{n−2})。',
      explanation: `D_${n}=${ans}。`,
      seq,
    })
  }
  // 甲必须拿自己的，其余错位 → D_{n-1}
  const n = pickOne([5, 6, 7])
  const ans = D[n - 1]!
  return buildQuestion({
    difficulty: 'hard',
    term: '一人归位其余错位',
    hardTypeId: 'derange-plus',
    passage: `${n} 人拿外套。已知甲一定拿到自己的外套，其余人谁都拿不到自己的。`,
    stem: '有多少种拿法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [D[n]!, fact(n - 1), D[n - 2]!]),
    method: '甲固定拿自己的，其余 n−1 人错位：D_{n−1}。',
    explanation: `D_${n - 1}=${ans}。`,
    seq,
  })
}

function genHardStarsAtLeastOne(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([12, 15, 16, 20])
  const m = pickOne([4, 5, 6])
  if (n <= m) return null
  const ans = comb(n - 1, m - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '同素分堆至少一加强',
    hardTypeId: 'stars-at-least-one',
    passage: `把 ${n} 个相同苹果分到 ${m} 个不同盘子，每盘至少一个。`,
    stem: '有多少种分法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [comb(n, m - 1), comb(n + m - 1, m - 1), comb(n - 1, m)]),
    method: '插板法 C_{n−1}^{m−1}。',
    explanation: `C_${n - 1}^{${m - 1}}=${ans}。`,
    seq,
  })
}

function genHardStarsPrealloc(seq: number): PermCombClassicQuestion | null {
  for (let i = 0; i < 40; i++) {
    const buckets = pickOne([3, 4, 5])
    const minEach = pickOne([4, 5, 6, 10])
    const total = pickOne([25, 28, 35, 40])
    const pre = minEach - 1
    const remain = total - pre * buckets
    if (remain < buckets) continue
    const ans = comb(remain - 1, buckets - 1)
    if (ans < 5 || ans > 200) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '每组至少 k 预分插板',
      hardTypeId: 'stars-prealloc',
      passage: `${total} 个相同零件装入 ${buckets} 个不同箱子，每箱至少 ${minEach} 个。`,
      stem: '有多少种装法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [
        comb(total - 1, buckets - 1),
        comb(remain - 1, buckets),
        comb(remain, buckets - 1),
      ]),
      method: `先各放 ${pre} 个，剩 ${remain} 个再「每箱至少 1」：C_{${remain}−1}^{${buckets}−1}。`,
      explanation: `C_${remain - 1}^{${buckets - 1}}=${ans}。`,
      seq,
    })
  }
  return null
}

function genHardStarsAllowZero(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([5, 6, 8, 10])
  const m = pickOne([3, 4])
  // 允许空：C_{n+m-1}^{m-1}
  const ans = comb(n + m - 1, m - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '同素分堆允许空',
    hardTypeId: 'stars-allow-zero',
    passage: `把 ${n} 个相同小球放入 ${m} 个不同盒子，盒子可以为空。`,
    stem: '有多少种放法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [comb(n - 1, m - 1), comb(n + m - 1, n), m ** n]),
    method: '允许为空的同素分堆：C_{n+m−1}^{m−1}（隔板法变形 / 星星月亮）。',
    explanation: `C_${n + m - 1}^{${m - 1}}=${ans}。`,
    seq,
  })
}

function genHardCircularFix(seq: number): PermCombClassicQuestion | null {
  const n = pickOne([6, 7, 8])
  // 强调破环：固定甲后其余全排
  const ans = fact(n - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '破环思想环形',
    hardTypeId: 'circular-fix',
    passage: `${n} 名代表围圆桌开会。为避免旋转重复，可先固定甲的座位，再安排其余人。`,
    stem: '不同坐法共多少种？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n - 2), (n - 1) * fact(n - 2)]),
    method: '固定甲后，其余 (n−1)! 种排法，即环形公式。',
    explanation: `(${n}−1)!=${ans}。`,
    seq,
  })
}

function genHardMixCircularDerange(seq: number): PermCombClassicQuestion | null {
  // 5 人先围圈，再每人抽座位号错位 — 简化为：先环形再对编号错位不太自然
  // 改用：n 个礼物随机发，无人拿自己的，且甲乙的礼物互换算… 直接 D_n * something
  // 更好：n 人入座圆形桌，座位有编号 1..n，无人坐自己编号 → 这是圆桌上的错位，较难
  // 简化题：直线错位 D_n 与环形 (n-1)! 对比选择
  const n = pickOne([5, 6])
  const ans = D[n]! * fact(n - 1) // 先错位发号牌再围圈？过强
  // 更合理：n 封信错位装入信封后，再把信封围成一圈摆放（信封不同）
  // 信封已错位装好视为 n 个不同物体围圈：(n-1)!，总 D_n * (n-1)!
  if (ans > 100000) {
    const a = D[n]!
    return buildQuestion({
      difficulty: 'hard',
      term: '错位后再环形摆放',
      hardTypeId: 'mix-circular-derange',
      passage: `${n} 封信错位装入 ${n} 个不同信封后，再把这些信封围成一圈摆在桌上（旋转相同算一种）。`,
      stem: '装信与摆放合在一起有多少种结果？',
      correct: String(a * fact(n - 1)),
      distractors: uniqueNum(a * fact(n - 1), [a, fact(n - 1), a * fact(n), fact(n)]),
      method: '先错位装信 D_n，再 n 个不同信封环形摆 (n−1)!，分步相乘。',
      explanation: `D_${n}×(${n}−1)!=${a * fact(n - 1)}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '错位后再环形摆放',
    hardTypeId: 'mix-circular-derange',
    passage: `${n} 封信错位装入 ${n} 个不同信封后，再把信封围成一圈摆放（旋转相同算一种）。`,
    stem: '共有多少种结果？',
    correct: String(ans),
    distractors: uniqueNum(ans, [D[n]!, fact(n - 1), D[n]! * fact(n)]),
    method: 'D_n×(n−1)!。',
    explanation: `D_${n}×(${n}−1)!=${ans}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  PermCombClassicHardTypeId,
  (seq: number) => PermCombClassicQuestion | null
> = {
  'circular-plus': genHardCircularPlus,
  'derange-plus': genHardDerangePlus,
  'stars-at-least-one': genHardStarsAtLeastOne,
  'stars-prealloc': genHardStarsPrealloc,
  'stars-allow-zero': genHardStarsAllowZero,
  'circular-fix': genHardCircularFix,
  'mix-circular-derange': genHardMixCircularDerange,
}

function tryBuild(
  factory: () => PermCombClassicQuestion | null,
  maxTry = 50,
): PermCombClassicQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generatePermCombClassicPaper(
  difficulty: PermCombClassicDifficulty,
): PermCombClassicQuestion[] {
  const out: PermCombClassicQuestion[] = []
  const seen = new Set<string>()
  const push = (q: PermCombClassicQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyCircular, genEasyCircularMenWomen, genEasyCircularFixOne]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_CLASSIC_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_CLASSIC_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumDerange,
      genMediumStarsBasic,
      genMediumStarsPrealloc,
      genMediumDerangeLetter,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_CLASSIC_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_CLASSIC_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<PermCombClassicHardTypeId>()
    const types = shuffleInPlace([...PERM_COMB_CLASSIC_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= PERM_COMB_CLASSIC_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = PERM_COMB_CLASSIC_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < PERM_COMB_CLASSIC_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : PERM_COMB_CLASSIC_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, PERM_COMB_CLASSIC_QUESTION_COUNT)
}
