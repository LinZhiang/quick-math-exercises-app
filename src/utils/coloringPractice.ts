/**
 * 高频运算 · 染色问题
 * 本地程序出题（不调用 AI）。每轮 4 题四选一。
 *
 * 对齐教材表格（棱长 n 的大正方体外表面染色后切成 1×1×1）：
 * - 三面染色：8（顶角）
 * - 两面染色：12(n−2)（棱上）
 * - 一面染色：6(n−2)²（外表面中央）
 * - 未染色：(n−2)³（内部）
 * 常用：有染色 = n³ − (n−2)³
 *
 * 【简单】比经典真题 5 简单：直接套表中某一行
 * 【中等】对齐经典真题 5：求有多少小正方体被染色（n³−(n−2)³）
 * 【困难】更高阶；每轮 4 题且题型互不重复
 * 1. paint-k-faces：只染 k 个面（k=4/5）
 * 2. cuboid-abc：长方体 a×b×c 表面染色
 * 3. exactly-two：专问两面染色个数（大 n）
 * 4. exactly-one：专问一面染色
 * 5. uncolored-ratio：未染色占比或有染色:未染色
 * 6. layered-sum：三面+两面+一面求和核对
 * 7. after-cut-repaint：切开后再染或二次操作
 * 8. missing-inner：已知有染色反求 n
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ColoringDifficulty = 'easy' | 'medium' | 'hard'

export const COLORING_QUESTION_COUNT = 4

export const COLORING_MODES: {
  id: ColoringDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '染色问题 · 简单',
    desc: '每轮 4 题 · 直接套三面/两面/一面/未染色公式 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '染色问题 · 普通',
    desc: '每轮 4 题 · 对齐经典真题 5（有染色= n³−(n−2)³）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '染色问题 · 困难',
    desc: '每轮 4 题 · 比经典真题 5 更难的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const COLORING_HARD_EXAM_TYPES = [
  {
    id: 'paint-k-faces',
    name: '只染部分面',
    note: '只染 4 面或 5 面，顶角/棱公式要改',
  },
  {
    id: 'cuboid-abc',
    name: '长方体染色',
    note: 'a×b×c 小正方体组成的长方体表面染色',
  },
  {
    id: 'exactly-two',
    name: '专问两面染色',
    note: '12(n−2)，较大 n',
  },
  {
    id: 'exactly-one',
    name: '专问一面染色',
    note: '6(n−2)²',
  },
  {
    id: 'uncolored-ratio',
    name: '未染色占比',
    note: '未染色与总数或有染色的比',
  },
  {
    id: 'layered-sum',
    name: '三类染色求和',
    note: '三面+两面+一面与 n³−(n−2)³ 对照',
  },
  {
    id: 'after-cut-repaint',
    name: '切开后再染',
    note: '先切再对某些块二次染色/计数',
  },
  {
    id: 'missing-inner',
    name: '已知有染色求 n',
    note: '由有染色个数反推棱长 n',
  },
] as const

export type ColoringHardTypeId = (typeof COLORING_HARD_EXAM_TYPES)[number]['id']

export type ColoringQuestion = {
  id: string
  topic: 'coloring'
  difficulty: ColoringDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ColoringHardTypeId
}

export function coloringTopicLabel(): string {
  return '染色问题'
}

export function coloringDifficultyLabel(d: ColoringDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function paint3(): number {
  return 8
}
function paint2(n: number): number {
  return 12 * (n - 2)
}
function paint1(n: number): number {
  return 6 * (n - 2) * (n - 2)
}
function uncolored(n: number): number {
  return (n - 2) * (n - 2) * (n - 2)
}
function colored(n: number): number {
  return n * n * n - uncolored(n)
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
    const n = Number(correct)
    const fake = Number.isFinite(n) ? String(Math.round(n) + g + 1) : `${g}:${g + 1}`
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
  difficulty: ColoringDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: ColoringHardTypeId
  seq: number
}): ColoringQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'coloring',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `coloring-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'coloring',
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

function genEasyThree(seq: number): ColoringQuestion | null {
  const n = pickOne([3, 4, 5, 6, 8, 10])
  return buildQuestion({
    difficulty: 'easy',
    term: '三面染色',
    passage: `棱长为 ${n} 的大正方体六个外表面都涂色后，切成棱长为 1 的小正方体。`,
    stem: '三面都涂到色的小正方体有多少个？',
    correct: '8',
    distractors: uniqueNum(8, [6, 12, paint2(n), n]),
    method: '三面染色的小块只在 8 个顶角，与 n 无关（n≥2）。',
    explanation: `顶角共 8 个，故为 8。`,
    seq,
  })
}

function genEasyTwo(seq: number): ColoringQuestion | null {
  const n = pickOne([3, 4, 5, 6, 7, 8])
  const ans = paint2(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '两面染色',
    passage: `棱长为 ${n} 的大正方体外表面涂色后切成 1×1×1 小正方体。`,
    stem: '恰好两面涂色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [8, paint1(n), 12 * n, 12 * (n - 1)]),
    method: '每条棱上去掉两端顶角剩 (n−2) 个，共 12 条棱：12(n−2)。',
    explanation: `12×(${n}−2)=${ans}。`,
    seq,
  })
}

function genEasyOne(seq: number): ColoringQuestion | null {
  const n = pickOne([3, 4, 5, 6, 7])
  const ans = paint1(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '一面染色',
    passage: `棱长为 ${n} 的大正方体外表面涂色后切成棱长 1 的小正方体。`,
    stem: '恰好一面涂色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [paint2(n), 6 * (n - 2), (n - 2) ** 2, 6 * n * n]),
    method: '每个面中心 (n−2)² 个只染一面，共 6 面：6(n−2)²。',
    explanation: `6×(${n}−2)²=${ans}。`,
    seq,
  })
}

function genEasyNone(seq: number): ColoringQuestion | null {
  const n = pickOne([3, 4, 5, 6, 7, 8])
  const ans = uncolored(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '未染色',
    passage: `棱长为 ${n} 的大正方体外表面涂色后切成棱长 1 的小正方体。`,
    stem: '完全没有涂到色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), (n - 1) ** 3, (n - 2) ** 2, n ** 3]),
    method: '内部是棱长 (n−2) 的正方体：(n−2)³。',
    explanation: `(${n}−2)³=${ans}。`,
    seq,
  })
}

// ——— 中等：经典真题 5 ———

function genMediumColored(seq: number): ColoringQuestion | null {
  const n = pickOne([5, 6, 7, 8, 9, 10])
  const ans = colored(n)
  // classic n=8 → 296
  return buildQuestion({
    difficulty: 'medium',
    term: '有染色块数（经典真题 5）',
    passage: `一个棱长为 ${n} 厘米的大正方体，全部由体积 1 立方厘米的小正方体组成。将其外表面涂色后切开。`,
    stem: '有多少个小正方体至少有一面涂到色？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      uncolored(n),
      n * n * n,
      paint1(n) + paint2(n) + 8,
      n * n * 6,
      296,
      216,
    ]),
    method: '有染色 = 总数 − 内部未染色 = n³ − (n−2)³。',
    explanation: `${n}³−(${n}−2)³=${n ** 3}−${uncolored(n)}=${ans}。`,
    seq,
  })
}

function genMediumBySum(seq: number): ColoringQuestion | null {
  const n = pickOne([4, 5, 6, 7, 8])
  const ans = paint3() + paint2(n) + paint1(n)
  return buildQuestion({
    difficulty: 'medium',
    term: '三类染色相加',
    passage: `棱长 ${n} 的正方体外表面涂色后切成单位小正方体。`,
    stem: '至少一面有色的小正方体个数是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), uncolored(n), paint2(n) + paint1(n), n ** 3]),
    method: '8 + 12(n−2) + 6(n−2)²，应等于 n³−(n−2)³。',
    explanation: `8+${paint2(n)}+${paint1(n)}=${ans}。`,
    seq,
  })
}

function genMediumUncolored(seq: number): ColoringQuestion | null {
  const n = pickOne([6, 7, 8, 9, 10])
  const ans = uncolored(n)
  return buildQuestion({
    difficulty: 'medium',
    term: '先求内部再对照',
    passage: `棱长 ${n} 的魔方状大正方体，外表面涂色后切开。某人说「没涂色的在正中间」。`,
    stem: '未涂色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), (n - 1) ** 3, n ** 3 - 6 * n * n, (n - 2) ** 2 * 6]),
    method: '剥掉一层皮，内部棱长 n−2。',
    explanation: `(${n}−2)³=${ans}。`,
    seq,
  })
}

function genMediumMixedAsk(seq: number): ColoringQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const ask = pickOne(['twoPlusThree', 'onePlusTwo'] as const)
  if (ask === 'twoPlusThree') {
    const ans = paint2(n) + 8
    return buildQuestion({
      difficulty: 'medium',
      term: '棱与顶角合计',
      passage: `棱长 ${n} 的正方体外表面涂色后切开。`,
      stem: '至少有两面涂色的小正方体共多少个？',
      correct: String(ans),
      distractors: uniqueNum(ans, [paint2(n), colored(n), 8, paint1(n)]),
      method: '至少两面 = 三面 + 两面 = 8+12(n−2)。',
      explanation: `8+${paint2(n)}=${ans}。`,
      seq,
    })
  }
  const ans = paint1(n) + paint2(n)
  return buildQuestion({
    difficulty: 'medium',
    term: '一面与两面合计',
    passage: `棱长 ${n} 的正方体外表面涂色后切开。`,
    stem: '恰好一面或恰好两面涂色的小正方体共多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), paint1(n), ans + 8, uncolored(n)]),
    method: '6(n−2)² + 12(n−2)。',
    explanation: `${paint1(n)}+${paint2(n)}=${ans}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardPaintK(seq: number): ColoringQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const k = pickOne([4, 5] as const)
  // 只染相邻/相对情况简化：染 5 面（少底面）时：
  // 顶面仍有，底面不染 → 底面那层原来「只染底」的变成未染；顶角：上面 4 个仍可三面，下面 4 个最多两面
  // 简化可考模型：只染上下前后左右中的 5 面（缺底）
  // 有染色 ≈ 总数 − 内部未染 − 底面中心未暴露部分
  // 更干净的题：只染相对两面 → 2n²；或只染 4 个侧面（无顶底）
  if (k === 4) {
    // 只染四个侧面（无顶底）：两面染色 = 4 条竖棱 ×(n-2) 在侧面相交处... 
    // 四个侧面：顶角都不三面（缺顶底）；竖棱上 (n-2) 两面；水平棱上只有侧面一边 → 一面
    // 有染色 = 4 * n * n - 重叠？更好用：表面属于四侧面的单位块
    // 四侧面展开：每面 n²，竖棱共用：4n² - 4n（每条竖棱算了两次去掉一次）= 4n(n-1)
    const ans = 4 * n * (n - 1)
    return buildQuestion({
      difficulty: 'hard',
      term: '只染部分面',
      hardTypeId: 'paint-k-faces',
      passage: `棱长 ${n} 的正方体只对四个竖直侧面涂色（顶面与底面不涂），再切成单位小正方体。`,
      stem: '至少一面有色的小正方体有多少个？',
      correct: String(ans),
      distractors: uniqueNum(ans, [colored(n), 4 * n * n, 6 * n * n - 2 * n * n, ans - 4]),
      method: '四侧面涂色：每面 n²，四条竖棱重复计，有染色=4n²−4n=4n(n−1)。',
      explanation: `4×${n}×(${n}−1)=${ans}。`,
      seq,
    })
  }
  // 染 5 面（缺底）：有染色 = n³ − (n-1)(n-2)² 
  // 内部未染：去掉顶层后，下面 (n-1) 层中，水平截面内部 (n-2)²，且底面也不染所以底面整层中心也… 
  // 标准：缺一个面时，未染色 = (n-1)(n-2)²（从缺的那面「凹」进去一层）
  const ans = n ** 3 - (n - 1) * (n - 2) * (n - 2)
  return buildQuestion({
    difficulty: 'hard',
    term: '只染五个面',
    hardTypeId: 'paint-k-faces',
    passage: `棱长 ${n} 的正方体只涂五个面（底面不涂），再切成单位小正方体。`,
    stem: '至少一面有色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), n ** 3 - (n - 2) ** 3, n ** 3 - (n - 1) ** 3, ans + n]),
    method: '缺底面时，未染色块构成高 (n−1)、底面边长 (n−2) 的「柱」：(n−1)(n−2)²；有染色=总数−未染色。',
    explanation: `${n}³−(${n}−1)(${n}−2)²=${n ** 3}−${(n - 1) * (n - 2) ** 2}=${ans}。`,
    seq,
  })
}

function genHardCuboid(seq: number): ColoringQuestion | null {
  const a = pickOne([4, 5, 6])
  const b = pickOne([3, 4, 5])
  const c = pickOne([3, 4, 5])
  // 有染色 = abc - (a-2)(b-2)(c-2) 当 a,b,c≥2
  if (a < 2 || b < 2 || c < 2) return null
  const inner = Math.max(0, a - 2) * Math.max(0, b - 2) * Math.max(0, c - 2)
  const ans = a * b * c - inner
  return buildQuestion({
    difficulty: 'hard',
    term: '长方体染色',
    hardTypeId: 'cuboid-abc',
    passage: `一个 ${a}×${b}×${c} 的长方体由单位小正方体堆成，外表面涂色后拆开。`,
    stem: '至少一面有色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      a * b * c,
      inner,
      colored(Math.max(a, b, c)),
      2 * (a * b + b * c + c * a),
    ]),
    method: '有染色 = 总数 − 内部未染色 = abc − (a−2)(b−2)(c−2)。',
    explanation: `${a}×${b}×${c}−(${a}−2)(${b}−2)(${c}−2)=${a * b * c}−${inner}=${ans}。`,
    seq,
  })
}

function genHardExactlyTwo(seq: number): ColoringQuestion | null {
  const n = pickOne([8, 9, 10, 12, 15])
  const ans = paint2(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '专问两面染色',
    hardTypeId: 'exactly-two',
    passage: `棱长 ${n} 的大正方体外表面涂色后切成单位小正方体。`,
    stem: '恰好两面涂色的有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [paint1(n), colored(n), 12 * n, 8 + paint2(n)]),
    method: '12(n−2)。',
    explanation: `12×(${n}−2)=${ans}。`,
    seq,
  })
}

function genHardExactlyOne(seq: number): ColoringQuestion | null {
  const n = pickOne([7, 8, 9, 10, 11])
  const ans = paint1(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '专问一面染色',
    hardTypeId: 'exactly-one',
    passage: `棱长 ${n} 的正方体外表面涂色后切开。`,
    stem: '恰好一面涂色的小正方体有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [paint2(n), 6 * (n - 2), colored(n), (n - 2) ** 2]),
    method: '6(n−2)²。',
    explanation: `6×(${n}−2)²=${ans}。`,
    seq,
  })
}

function genHardRatio(seq: number): ColoringQuestion | null {
  const n = pickOne([4, 5, 6, 8])
  const u = uncolored(n)
  const t = n ** 3
  const c = colored(n)
  const ask = pickOne(['uncoloredFrac', 'coloredToUncolored'] as const)
  if (ask === 'uncoloredFrac') {
    // 未染色占总数：u/t，约分
    const g = gcd(u, t)
    const ans = `${u / g}/${t / g}`
    return buildQuestion({
      difficulty: 'hard',
      term: '未染色占比',
      hardTypeId: 'uncolored-ratio',
      passage: `棱长 ${n} 的正方体外表面涂色后切开。`,
      stem: '未涂色小正方体占总块数的比例是？',
      correct: ans,
      distractors: uniqueStr(ans, [
        `${c / gcd(c, t)}/${t / gcd(c, t)}`,
        `${u}/${t}`,
        `${n - 2}/${n}`,
        '1/2',
      ]),
      method: '未染色 (n−2)³，总数 n³，约分。',
      explanation: `${u}/${t}=${ans}。`,
      seq,
    })
  }
  const g = gcd(c, u)
  const ans = u === 0 ? '全染色' : `${c / g}:${u / g}`
  if (u === 0) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '有染色与未染色之比',
    hardTypeId: 'uncolored-ratio',
    passage: `棱长 ${n} 的正方体外表面涂色后切开。`,
    stem: '有染色块数与未染色块数之比是？',
    correct: ans,
    distractors: uniqueStr(ans, [`${u / g}:${c / g}`, `${c}:${u}`, '1:1', `${n}:${n - 2}`]),
    method: '有染色 n³−(n−2)³，未染色 (n−2)³，约分。',
    explanation: `${c}:${u}=${ans}。`,
    seq,
  })
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

function genHardLayeredSum(seq: number): ColoringQuestion | null {
  const n = pickOne([6, 7, 8, 9])
  const a = paint3()
  const b = paint2(n)
  const c = paint1(n)
  const ans = a + b + c
  return buildQuestion({
    difficulty: 'hard',
    term: '三类染色求和',
    hardTypeId: 'layered-sum',
    passage: `棱长 ${n}。已知三面染色 ${a} 个，两面染色按公式计算，一面染色按公式计算。`,
    stem: '三类有色小正方体个数之和是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), b + c, a + b, n ** 3]),
    method: '8+12(n−2)+6(n−2)²，应等于 n³−(n−2)³。',
    explanation: `${a}+${b}+${c}=${ans}（= ${n}³−${uncolored(n)}）。`,
    seq,
  })
}

function genHardRepaint(seq: number): ColoringQuestion | null {
  const n = pickOne([4, 5, 6])
  // 先外表面涂色切开后，把所有未染色的再全部涂成红色：问最终红色块数 = 原未染色
  // 或：把三面染色的挑出再扔掉，剩多少有色
  const ask = pickOne(['toss3', 'repaintInner'] as const)
  if (ask === 'toss3') {
    const ans = colored(n) - 8
    return buildQuestion({
      difficulty: 'hard',
      term: '切开后再操作',
      hardTypeId: 'after-cut-repaint',
      passage: `棱长 ${n} 的正方体外表面涂色后切开。把所有三面都有色的小正方体扔掉。`,
      stem: '剩下的有色小正方体还有多少个？',
      correct: String(ans),
      distractors: uniqueNum(ans, [colored(n), paint2(n) + paint1(n), uncolored(n), ans + 8]),
      method: '有染色总数减去 8 个顶角块。',
      explanation: `${colored(n)}−8=${ans}。`,
      seq,
    })
  }
  const ans = uncolored(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '内部再涂色',
    hardTypeId: 'after-cut-repaint',
    passage: `棱长 ${n} 外表面涂色切开后，将原先完全未涂色的小正方体全部再涂成红色。`,
    stem: '被涂成红色的有多少个？',
    correct: String(ans),
    distractors: uniqueNum(ans, [colored(n), (n - 1) ** 3, paint1(n), n ** 3]),
    method: '即原内部未染色个数 (n−2)³。',
    explanation: `(${n}−2)³=${ans}。`,
    seq,
  })
}

function genHardMissingN(seq: number): ColoringQuestion | null {
  const n = pickOne([5, 6, 7, 8, 9, 10])
  const c = colored(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '已知有染色求 n',
    hardTypeId: 'missing-inner',
    passage: `某大正方体由单位小正方体组成，外表面涂色后切开，发现至少一面有色的小正方体共 ${c} 个。`,
    stem: '该大正方体的棱长 n 是？',
    correct: String(n),
    distractors: uniqueNum(n, [n - 1, n + 1, n - 2, 8]),
    method: '试 n：使 n³−(n−2)³ 等于已知有染色数。',
    explanation: `${n}³−(${n}−2)³=${c}，故 n=${n}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<ColoringHardTypeId, (seq: number) => ColoringQuestion | null> = {
  'paint-k-faces': genHardPaintK,
  'cuboid-abc': genHardCuboid,
  'exactly-two': genHardExactlyTwo,
  'exactly-one': genHardExactlyOne,
  'uncolored-ratio': genHardRatio,
  'layered-sum': genHardLayeredSum,
  'after-cut-repaint': genHardRepaint,
  'missing-inner': genHardMissingN,
}

function tryBuild(factory: () => ColoringQuestion | null, maxTry = 40): ColoringQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateColoringPaper(difficulty: ColoringDifficulty): ColoringQuestion[] {
  const out: ColoringQuestion[] = []
  const seen = new Set<string>()

  const push = (q: ColoringQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyThree, genEasyTwo, genEasyOne, genEasyNone]
    // 尽量四种考察点各一题
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= COLORING_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < COLORING_QUESTION_COUNT && guard++ < 40) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumColored(0),
      () => genMediumBySum(1),
      () => genMediumUncolored(2),
      () => genMediumMixedAsk(3),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < COLORING_QUESTION_COUNT && guard++ < 40) {
      push(
        tryBuild(() =>
          pickOne([genMediumColored, genMediumBySum, genMediumUncolored, genMediumMixedAsk])(
            out.length,
          ),
        ),
      )
    }
  } else {
    const types = shuffleInPlace([...COLORING_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= COLORING_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
    }
  }

  if (out.length < COLORING_QUESTION_COUNT) {
    throw new Error(`染色问题组卷不足：仅 ${out.length}/${COLORING_QUESTION_COUNT}`)
  }
  return out.slice(0, COLORING_QUESTION_COUNT)
}
