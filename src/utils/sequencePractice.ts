/**
 * 其他运算 · 数列问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式：
 * 【等差】
 * - 通项：a_n = a_1+(n−1)d；推论 a_n−a_m=(n−m)d
 * - 对称：m+n=i+j ⇒ a_m+a_n=a_i+a_j
 * - 求和：S_n = n a_1 + n(n−1)d/2
 * - 中项求和：S_n = 中间项 × n（n 为奇数时中间一项）
 * - 首末平均：S_n = (首项+末项)/2 × n
 * 【等比】
 * - 通项：a_n = a_1 × q^(n−1)
 * - 对称：m+n=i+j ⇒ a_m×a_n=a_i×a_j
 * - 求和：q≠1 时 S_n=a_1(1−q^n)/(1−q)；q=1 时 S_n=n a_1
 *
 * 【简单】比经典真题 1、2 略易（直接套通项/求和/翻倍）
 * 【普通】对齐经典真题 1（等差座位数求和）、真题 2（等比细菌翻倍）
 * 【困难】高于真题 1、2；≥8 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SequenceDifficulty = 'easy' | 'medium' | 'hard'

export const SEQUENCE_QUESTION_COUNT = 6

export const SEQUENCE_MODES: {
  id: SequenceDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '数列 · 简单',
    desc: '每轮 6 题 · 比经典真题 1、2 略易 · 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '数列 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 1（等差求和）、真题 2（等比翻倍）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '数列 · 困难',
    desc: '每轮 6 题 · 高于真题 1、2 的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

export const SEQUENCE_HARD_EXAM_TYPES = [
  {
    id: 'ap-find-d-from-sum',
    name: '等差由和求公差',
    note: '已知 S_n、a_1、n 反推 d',
  },
  {
    id: 'ap-symmetry',
    name: '等差对称公式',
    note: 'm+n=i+j ⇒ 对应项之和相等',
  },
  {
    id: 'ap-middle-sum',
    name: '等差中项求和',
    note: '奇数项时 S_n=中间项×n',
  },
  {
    id: 'ap-find-n',
    name: '等差求项数',
    note: '由首末项与公差求 n，或由和式解 n',
  },
  {
    id: 'gp-find-term',
    name: '等比求指定项',
    note: 'a_n=a_1 q^(n−1) 加强指数',
  },
  {
    id: 'gp-symmetry',
    name: '等比对称公式',
    note: 'm+n=i+j ⇒ 对应项之积相等',
  },
  {
    id: 'gp-sum',
    name: '等比求和',
    note: 'S_n=a_1(1−q^n)/(1−q)',
  },
  {
    id: 'gp-fill-backward',
    name: '等比倒推时间',
    note: '真题 2 加强：由倍数关系倒推秒数',
  },
  {
    id: 'ap-gp-mix-recognize',
    name: '先判别再计算',
    note: '题面混入等差/等比线索，先认型再套公式',
  },
  {
    id: 'ap-avg-sum-plus',
    name: '等差首末平均加强',
    note: '先求末项再 (首+末)/2×n',
  },
] as const

export type SequenceHardTypeId = (typeof SEQUENCE_HARD_EXAM_TYPES)[number]['id']

export type SequenceQuestion = {
  id: string
  topic: 'sequence'
  difficulty: SequenceDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: SequenceHardTypeId
}

export function sequenceTopicLabel(): string {
  return '数列问题'
}

export function sequenceDifficultyLabel(d: SequenceDifficulty): string {
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

function uniqueNum(correct: number, cands: number[]): string[] {
  const out: string[] = []
  const seen = new Set([String(correct)])
  for (const c of cands) {
    if (!Number.isFinite(c) || c === correct) continue
    const s = String(Math.round(c))
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3 && g < 50) {
    const fake = String(correct + g)
    g++
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: SequenceDifficulty
  term: string
  passage: string
  stem: string
  correct: number
  distractors: number[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: SequenceHardTypeId
}): SequenceQuestion | null {
  const assembled = assembleFourChoiceMcq(
    String(input.correct),
    uniqueNum(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'sequence',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `seq-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'sequence',
    difficulty: input.difficulty,
    term: input.term,
    passage: input.passage.trim(),
    stem: input.stem.trim(),
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method: input.method.trim(),
    explanation: input.explanation.trim(),
    fingerprint,
    hardTypeId: input.hardTypeId,
  }
}

function apTerm(a1: number, d: number, n: number): number {
  return a1 + (n - 1) * d
}

function apSum(a1: number, d: number, n: number): number {
  return n * a1 + (n * (n - 1) * d) / 2
}

function gpTerm(a1: number, q: number, n: number): number {
  return a1 * Math.pow(q, n - 1)
}

function gpSum(a1: number, q: number, n: number): number {
  if (q === 1) return n * a1
  return (a1 * (1 - Math.pow(q, n))) / (1 - q)
}

// ——— 简单（比真题略易） ———

function genEasyApTerm(seq: number): SequenceQuestion | null {
  const a1 = pickOne([2, 3, 5, 10])
  const d = pickOne([2, 3, 4, 5])
  const n = pickOne([4, 5, 6])
  const ans = apTerm(a1, d, n)
  return buildQuestion({
    difficulty: 'easy',
    term: '等差通项',
    passage: `等差数列首项 a₁=${a1}，公差 d=${d}。`,
    stem: `求第 ${n} 项 a_${n}。`,
    correct: ans,
    distractors: [a1 + n * d, a1 + (n + 1) * d, n * a1 + d, ans + d],
    method: `通项公式：a_n=a₁+(n−1)d=${a1}+(${n}−1)×${d}=${ans}。`,
    explanation: `a_${n}=${ans}。`,
    seq,
  })
}

function genEasyApSumSmall(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2, 5])
  const d = pickOne([2, 3])
  const n = pickOne([4, 5])
  const ans = apSum(a1, d, n)
  return buildQuestion({
    difficulty: 'easy',
    term: '等差求和（短）',
    passage: `等差数列首项 a₁=${a1}，公差 d=${d}。`,
    stem: `前 ${n} 项和 S_${n} 是多少？`,
    correct: ans,
    distractors: [n * a1, n * apTerm(a1, d, n), apSum(a1, d, n + 1), ans + a1],
    method: `S_n=n a₁+n(n−1)d/2=${n}×${a1}+${n}×${n - 1}×${d}/2=${ans}。`,
    explanation: `S_${n}=${ans}。`,
    seq,
  })
}

function genEasyGpTerm(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2, 3])
  const q = pickOne([2, 3])
  const n = pickOne([4, 5])
  const ans = gpTerm(a1, q, n)
  return buildQuestion({
    difficulty: 'easy',
    term: '等比通项',
    passage: `等比数列首项 a₁=${a1}，公比 q=${q}。`,
    stem: `求第 ${n} 项 a_${n}。`,
    correct: ans,
    distractors: [a1 * Math.pow(q, n), a1 * q * n, ans / q, ans * q],
    method: `通项：a_n=a₁×q^(n−1)=${a1}×${q}^(${n}−1)=${ans}。`,
    explanation: `a_${n}=${ans}。`,
    seq,
  })
}

function genEasyGpDouble(seq: number): SequenceQuestion | null {
  // 比真题 2 简单：问 2^k
  const k = pickOne([3, 4, 5])
  const ans = Math.pow(2, k)
  return buildQuestion({
    difficulty: 'easy',
    term: '等比翻倍计数',
    passage: `某种细胞每过 1 小时数量翻倍（公比 q=2）。开始时有 1 个。`,
    stem: `${k} 小时后有多少个？`,
    correct: ans,
    distractors: [k * 2, Math.pow(2, k - 1), Math.pow(2, k + 1), k + 2],
    method: `a_{k+1}=1×2^k（经过 k 次翻倍）=2^${k}=${ans}。也可用 a_n=a₁ q^(n−1)，此处 n=${k}+1。`,
    explanation: `${k} 小时后为 ${ans} 个。`,
    seq,
  })
}

function genEasyApDiff(seq: number): SequenceQuestion | null {
  const a1 = pickOne([5, 8, 10])
  const d = pickOne([3, 4, 5])
  const m = pickOne([2, 3])
  const n = pickOne([5, 6, 7])
  const ans = (n - m) * d
  return buildQuestion({
    difficulty: 'easy',
    term: '等差项差推论',
    passage: `等差数列公差 d=${d}。`,
    stem: `a_${n} − a_${m} 等于多少？`,
    correct: ans,
    distractors: [n * d, (n + m) * d, (n - m) * a1, ans + d],
    method: `推论：a_n−a_m=(n−m)d=(${n}−${m})×${d}=${ans}。`,
    explanation: `差为 ${ans}。（与首项 ${a1} 无关。）`,
    seq,
  })
}

// ——— 普通（对齐真题 1、2） ———

function genMediumApSeats(seq: number): SequenceQuestion | null {
  // 经典真题 1：阶梯座位
  const a1 = pickOne([15, 18, 20, 22])
  const d = pickOne([2, 3])
  const n = pickOne([8, 10, 12])
  const ans = apSum(a1, d, n)
  return buildQuestion({
    difficulty: 'medium',
    term: '等差座位求和（经典真题 1）',
    passage: `阶梯教室有 ${n} 排座位，后一排比前一排多 ${d} 个座位，第 1 排有 ${a1} 个座位。`,
    stem: '整个教室一共有多少个座位？',
    correct: ans,
    distractors: [
      n * a1,
      n * apTerm(a1, d, n),
      apSum(a1, d, n - 1),
      n * a1 + n * d,
      290,
    ],
    method: [
      '等差数列求和：',
      `a₁=${a1}，d=${d}，n=${n}。`,
      `S_n=n a₁+n(n−1)d/2=${n}×${a1}+${n}×${n - 1}×${d}/2=${ans}。`,
    ].join('\n'),
    explanation: `共 ${ans} 个座位。也可用 (首+末)/2×n：末项=${apTerm(a1, d, n)}，(${a1}+${apTerm(a1, d, n)})/2×${n}=${ans}。`,
    seq,
  })
}

function genMediumGpBacteria(seq: number): SequenceQuestion | null {
  // 经典真题 2：60 秒装满，从 2^k 开始省 k 秒
  const fullSec = pickOne([60, 60, 48])
  const startPow = pickOne([4, 5, 6]) // 2^startPow bacteria
  const start = Math.pow(2, startPow)
  const ans = fullSec - startPow
  return buildQuestion({
    difficulty: 'medium',
    term: '等比细菌翻倍（经典真题 2）',
    passage: `瓶中放入 1 个细菌，每秒每个细菌分裂为 2 个。过 ${fullSec} 秒瓶子刚好装满。若一开始放入 ${start} 个细菌（其余条件不变）。`,
    stem: '多少秒后瓶子刚好装满？',
    correct: ans,
    distractors: [fullSec - startPow + 1, fullSec - startPow - 1, fullSec / 2, startPow],
    method: [
      '等比数列（q=2）：数量每秒翻倍。',
      `${start}=2^${startPow}，相当于从 1 个开始已过 ${startPow} 秒的状态。`,
      `因此可少等 ${startPow} 秒：${fullSec}−${startPow}=${ans}。`,
    ].join('\n'),
    explanation: `${ans} 秒后装满。`,
    seq,
  })
}

function genMediumApAvgSum(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2, 3])
  const n = pickOne([6, 8, 10])
  const d = pickOne([2, 3, 4])
  const an = apTerm(a1, d, n)
  const ans = apSum(a1, d, n)
  return buildQuestion({
    difficulty: 'medium',
    term: '等差首末平均求和',
    passage: `等差数列第 1 项为 ${a1}，第 ${n} 项为 ${an}。`,
    stem: `前 ${n} 项和是多少？`,
    correct: ans,
    distractors: [n * a1, n * an, (a1 + an) * n, ans + d],
    method: `首末平均：S_n=(首+末)/2×n=(${a1}+${an})/2×${n}=${ans}。`,
    explanation: `S_${n}=${ans}。`,
    seq,
  })
}

function genMediumGpSum(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2])
  const q = pickOne([2, 3])
  const n = pickOne([4, 5])
  const ans = gpSum(a1, q, n)
  return buildQuestion({
    difficulty: 'medium',
    term: '等比前 n 项和',
    passage: `等比数列首项 a₁=${a1}，公比 q=${q}。`,
    stem: `求前 ${n} 项和 S_${n}。`,
    correct: ans,
    distractors: [
      a1 * Math.pow(q, n),
      gpTerm(a1, q, n),
      (a1 * (Math.pow(q, n) - 1)) / q,
      ans + a1,
    ],
    method: `q≠1：S_n=a₁(1−q^n)/(1−q)=${a1}(1−${q}^${n})/(1−${q})=${ans}。`,
    explanation: `S_${n}=${ans}。`,
    seq,
  })
}

function genMediumApFindAn(seq: number): SequenceQuestion | null {
  const a1 = pickOne([10, 12, 15])
  const d = pickOne([3, 4, 5])
  const n = pickOne([8, 9, 10])
  const ans = apTerm(a1, d, n)
  return buildQuestion({
    difficulty: 'medium',
    term: '等差求末项再联想求和',
    passage: `某工厂第 1 周产量 ${a1} 件，之后每周比上周多 ${d} 件，连续生产 ${n} 周。`,
    stem: `第 ${n} 周产量是多少件？`,
    correct: ans,
    distractors: [a1 + n * d, apSum(a1, d, n), a1 * n, ans - d],
    method: `a_n=a₁+(n−1)d=${a1}+(${n}−1)×${d}=${ans}。`,
    explanation: `第 ${n} 周产量 ${ans} 件。`,
    seq,
  })
}

// ——— 困难 ———

function genHardApFindD(seq: number): SequenceQuestion | null {
  for (let i = 0; i < 30; i++) {
    const a1 = pickOne([2, 3, 5, 10])
    const d = pickOne([2, 3, 4, 5])
    const n = pickOne([6, 8, 10])
    const sn = apSum(a1, d, n)
    // reverse: sn = n*a1 + n(n-1)d/2 => d = 2(sn - n*a1)/(n(n-1))
    return buildQuestion({
      difficulty: 'hard',
      term: '等差由和求公差',
      hardTypeId: 'ap-find-d-from-sum',
      passage: `等差数列首项 a₁=${a1}，前 ${n} 项和 S_${n}=${sn}。`,
      stem: '公差 d 是多少？',
      correct: d,
      distractors: [d + 1, d - 1, sn / n - a1, (sn - a1) / n],
      method: [
        `由 S_n=n a₁+n(n−1)d/2：`,
        `${sn}=${n}×${a1}+${n}×${n - 1}×d/2`,
        `⇒ d=2(${sn}−${n * a1})/(${n}×${n - 1})=${d}。`,
      ].join('\n'),
      explanation: `公差 d=${d}。`,
      seq,
    })
  }
  return null
}

function genHardApSymmetry(seq: number): SequenceQuestion | null {
  const a1 = pickOne([0, 1, 2, 5])
  const d = pickOne([3, 4, 5])
  const m = 1
  const n = pickOne([6, 8, 10])
  const i = pickOne([2, 3])
  const j = m + n - i
  const am = apTerm(a1, d, m)
  const an = apTerm(a1, d, n)
  const ans = am + an
  return buildQuestion({
    difficulty: 'hard',
    term: '等差对称公式',
    hardTypeId: 'ap-symmetry',
    passage: `等差数列中 a₁=${a1}，公差 d=${d}。已知下标满足 ${m}+${n}=${i}+${j}。`,
    stem: `a_${i}+a_${j} 等于多少？`,
    correct: ans,
    distractors: [
      apTerm(a1, d, i) + apTerm(a1, d, j) + d,
      am * an,
      ans + d,
      apTerm(a1, d, i) * 2,
    ],
    method: [
      '对称公式：若 m+n=i+j，则 a_m+a_n=a_i+a_j。',
      `故 a_${i}+a_${j}=a_${m}+a_${n}=${am}+${an}=${ans}。`,
    ].join('\n'),
    explanation: `和为 ${ans}。`,
    seq,
  })
}

function genHardApMiddleSum(seq: number): SequenceQuestion | null {
  // n odd, middle term known
  const n = pickOne([5, 7, 9])
  const midIdx = (n + 1) / 2
  const mid = pickOne([6, 7, 8, 10, 12])
  const ans = mid * n
  return buildQuestion({
    difficulty: 'hard',
    term: '等差中项求和',
    hardTypeId: 'ap-middle-sum',
    passage: `等差数列共有 ${n} 项（奇数项），第 ${midIdx} 项（中间项）为 ${mid}。`,
    stem: `这 ${n} 项的和是多少？`,
    correct: ans,
    distractors: [mid * midIdx, mid * (n - 1), ans + mid, n * midIdx],
    method: `中项求和：奇数项时 S_n=中间项×n=${mid}×${n}=${ans}。`,
    explanation: `S_${n}=${ans}。`,
    seq,
  })
}

function genHardApFindN(seq: number): SequenceQuestion | null {
  const a1 = pickOne([3, 5, 8])
  const d = pickOne([2, 3, 4])
  const n = pickOne([8, 9, 10, 12])
  const an = apTerm(a1, d, n)
  return buildQuestion({
    difficulty: 'hard',
    term: '等差求项数',
    hardTypeId: 'ap-find-n',
    passage: `等差数列首项 ${a1}，公差 ${d}，末项为 ${an}。`,
    stem: '该项数 n 是多少？',
    correct: n,
    distractors: [n + 1, n - 1, (an - a1) / d, n + d],
    method: [
      `由 a_n=a₁+(n−1)d：`,
      `${an}=${a1}+(n−1)×${d} ⇒ n−1=(${an}−${a1})/${d}=${n - 1} ⇒ n=${n}。`,
    ].join('\n'),
    explanation: `共 ${n} 项。`,
    seq,
  })
}

function genHardGpFindTerm(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2])
  const q = pickOne([2, 3])
  const n = pickOne([6, 7, 8])
  const ans = gpTerm(a1, q, n)
  if (ans > 100000) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '等比求高次项',
    hardTypeId: 'gp-find-term',
    passage: `等比数列首项 a₁=${a1}，公比 q=${q}。`,
    stem: `求 a_${n}。`,
    correct: ans,
    distractors: [
      a1 * Math.pow(q, n),
      gpTerm(a1, q, n - 1),
      a1 * q * (n - 1),
      ans / q,
    ],
    method: `a_n=a₁ q^(n−1)=${a1}×${q}^(${n}−1)=${ans}。`,
    explanation: `a_${n}=${ans}。`,
    seq,
  })
}

function genHardGpSymmetry(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2])
  const q = pickOne([2, 3, 4])
  const m = 1
  const n = pickOne([4, 5, 6])
  const i = 2
  const j = m + n - i
  const ans = gpTerm(a1, q, m) * gpTerm(a1, q, n)
  return buildQuestion({
    difficulty: 'hard',
    term: '等比对称公式',
    hardTypeId: 'gp-symmetry',
    passage: `等比数列 a₁=${a1}，公比 q=${q}。已知 ${m}+${n}=${i}+${j}。`,
    stem: `a_${i}×a_${j} 等于多少？`,
    correct: ans,
    distractors: [
      gpTerm(a1, q, i) + gpTerm(a1, q, j),
      ans * q,
      ans / q,
      gpTerm(a1, q, i) * gpTerm(a1, q, j + 1),
    ],
    method: [
      '对称公式：若 m+n=i+j，则 a_m×a_n=a_i×a_j。',
      `故 a_${i}×a_${j}=a_${m}×a_${n}=${gpTerm(a1, q, m)}×${gpTerm(a1, q, n)}=${ans}。`,
    ].join('\n'),
    explanation: `积为 ${ans}。`,
    seq,
  })
}

function genHardGpSum(seq: number): SequenceQuestion | null {
  const a1 = pickOne([1, 2, 3])
  const q = pickOne([2, 3])
  const n = pickOne([5, 6])
  const ans = gpSum(a1, q, n)
  if (!Number.isInteger(ans) || ans > 200000) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '等比求和加强',
    hardTypeId: 'gp-sum',
    passage: `等比数列首项 a₁=${a1}，公比 q=${q}。`,
    stem: `前 ${n} 项和 S_${n} 是多少？`,
    correct: ans,
    distractors: [
      a1 * Math.pow(q, n),
      gpTerm(a1, q, n),
      (a1 * (Math.pow(q, n) - 1)) / q,
      ans - a1,
    ],
    method: `S_n=a₁(1−q^n)/(1−q)=${a1}(1−${q}^${n})/(1−${q})=${ans}。`,
    explanation: `S_${n}=${ans}。`,
    seq,
  })
}

function genHardGpFillBackward(seq: number): SequenceQuestion | null {
  const fullSec = pickOne([60, 90, 120])
  const startPow = pickOne([5, 6, 7, 8])
  const start = Math.pow(2, startPow)
  const ans = fullSec - startPow
  return buildQuestion({
    difficulty: 'hard',
    term: '等比倒推时间加强',
    hardTypeId: 'gp-fill-backward',
    passage: `某种病毒每分钟数量翻倍。从 1 个开始，经过 ${fullSec} 分钟容器刚好装满。现改为一开始放入 ${start} 个。`,
    stem: '多少分钟后刚好装满？',
    correct: ans,
    distractors: [fullSec - startPow + 1, fullSec - Math.log2(start) - 1, fullSec / 2, startPow],
    method: [
      `${start}=2^${startPow}，相当于已增殖 ${startPow} 分钟。`,
      `所需时间 = ${fullSec}−${startPow}=${ans}。`,
    ].join('\n'),
    explanation: `${ans} 分钟。`,
    seq,
  })
}

function genHardApGpRecognize(seq: number): SequenceQuestion | null {
  const mode = pickOne(['ap', 'gp'] as const)
  if (mode === 'ap') {
    const a1 = pickOne([4, 5, 6])
    const d = pickOne([3, 4])
    const n = pickOne([5, 6])
    const ans = apSum(a1, d, n)
    return buildQuestion({
      difficulty: 'hard',
      term: '先认等差再求和',
      hardTypeId: 'ap-gp-mix-recognize',
      passage: `一列数：${a1}，${a1 + d}，${a1 + 2 * d}，…（后项减前项恒为 ${d}）。`,
      stem: `该列数前 ${n} 项之和是多少？`,
      correct: ans,
      distractors: [gpSum(a1, d, n), n * a1, apTerm(a1, d, n), ans + d],
      method: [
        `后项减前项为常数 ⇒ 等差，d=${d}。`,
        `S_n=${n}×${a1}+${n}×${n - 1}×${d}/2=${ans}。`,
      ].join('\n'),
      explanation: `和为 ${ans}。`,
      seq,
    })
  }
  const a1 = pickOne([1, 2])
  const q = pickOne([2, 3])
  const n = pickOne([4, 5])
  const ans = gpSum(a1, q, n)
  return buildQuestion({
    difficulty: 'hard',
    term: '先认等比再求和',
    hardTypeId: 'ap-gp-mix-recognize',
    passage: `一列数：${a1}，${a1 * q}，${a1 * q * q}，…（后项除以前项恒为 ${q}）。`,
    stem: `该列数前 ${n} 项之和是多少？`,
    correct: ans,
    distractors: [apSum(a1, q, n), gpTerm(a1, q, n), n * a1, ans + a1],
    method: [
      `后项/前项为常数 ⇒ 等比，q=${q}。`,
      `S_n=${a1}(1−${q}^${n})/(1−${q})=${ans}。`,
    ].join('\n'),
    explanation: `和为 ${ans}。`,
    seq,
  })
}

function genHardApAvgSumPlus(seq: number): SequenceQuestion | null {
  const a1 = pickOne([10, 15, 20])
  const d = pickOne([2, 3, 4])
  const n = pickOne([9, 10, 12])
  const an = apTerm(a1, d, n)
  const ans = apSum(a1, d, n)
  return buildQuestion({
    difficulty: 'hard',
    term: '等差首末平均加强',
    hardTypeId: 'ap-avg-sum-plus',
    passage: `施工队第 1 天完成 ${a1} 米，之后每天比前一天多做 ${d} 米，共做 ${n} 天。`,
    stem: '这期间一共完成多少米？',
    correct: ans,
    distractors: [
      n * a1,
      n * an,
      (a1 + an) * n,
      apSum(a1, d, n - 1),
    ],
    method: [
      `① 末天产量 a_${n}=${a1}+(${n}−1)×${d}=${an}。`,
      `② S_n=(首+末)/2×n=(${a1}+${an})/2×${n}=${ans}。`,
    ].join('\n'),
    explanation: `共完成 ${ans} 米。`,
    seq,
  })
}

const HARD_BUILDERS: Record<SequenceHardTypeId, (seq: number) => SequenceQuestion | null> = {
  'ap-find-d-from-sum': genHardApFindD,
  'ap-symmetry': genHardApSymmetry,
  'ap-middle-sum': genHardApMiddleSum,
  'ap-find-n': genHardApFindN,
  'gp-find-term': genHardGpFindTerm,
  'gp-symmetry': genHardGpSymmetry,
  'gp-sum': genHardGpSum,
  'gp-fill-backward': genHardGpFillBackward,
  'ap-gp-mix-recognize': genHardApGpRecognize,
  'ap-avg-sum-plus': genHardApAvgSumPlus,
}

function tryBuild(
  factory: () => SequenceQuestion | null,
  maxTry = 40,
): SequenceQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateSequencePaper(difficulty: SequenceDifficulty): SequenceQuestion[] {
  const out: SequenceQuestion[] = []
  const seen = new Set<string>()
  const push = (q: SequenceQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyApTerm,
      genEasyApSumSmall,
      genEasyGpTerm,
      genEasyGpDouble,
      genEasyApDiff,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= SEQUENCE_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < SEQUENCE_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumApSeats,
      genMediumGpBacteria,
      genMediumApAvgSum,
      genMediumGpSum,
      genMediumApFindAn,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= SEQUENCE_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < SEQUENCE_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<SequenceHardTypeId>()
    const types = shuffleInPlace([...SEQUENCE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= SEQUENCE_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = SEQUENCE_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < SEQUENCE_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : SEQUENCE_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, SEQUENCE_QUESTION_COUNT)
}
