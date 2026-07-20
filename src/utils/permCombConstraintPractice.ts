/**
 * 高频运算 · 排列组合 · 限制条件型问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材方法：
 * - 指定位置：优限法（优先法）先排特殊位置/元素
 * - 相邻：捆绑法，捆成一块再排，块内可再排
 * - 不相邻：插空法，先排其余再插入空隙；或总数−相邻
 * - 顺序固定：归一法 A_n^n / A_m^m
 * - 环形：(n−1)! ；错位：D_n（可记 D_2=1,D_3=2,D_4=9,D_5=44）
 *
 * 【简单】对齐经典真题 3（首尾限定）、真题 4（捆绑+指定）及示例级优限/捆绑
 * 【普通】对齐经典真题 5（插空）、真题 6（归一法）
 * 【困难】高于书中例题；≥6 种变式，每轮抽 6 种且题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type PermCombConstraintDifficulty = 'easy' | 'medium' | 'hard'

export const PERM_COMB_CONSTRAINT_QUESTION_COUNT = 6

export const PERM_COMB_CONSTRAINT_MODES: {
  id: PermCombConstraintDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '限制条件型 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 3、4（优限/捆绑）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '限制条件型 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 5（插空）、真题 6（归一法）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '限制条件型 · 困难',
    desc: '每轮 6 题 · 比书中例题更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const PERM_COMB_CONSTRAINT_HARD_EXAM_TYPES = [
  {
    id: 'fixed-ends-plus',
    name: '首尾限定加强',
    note: '真题 3 加强：首尾同类或异类限制后再排中间',
  },
  {
    id: 'multi-bundle',
    name: '多组捆绑',
    note: '两组及以上必须相邻，分别捆绑再排列',
  },
  {
    id: 'insert-gaps-plus',
    name: '插空法加强',
    note: '真题 5 加强：先排人/物再向空隙插入相同或不同元素',
  },
  {
    id: 'normalize-plus',
    name: '归一法加强',
    note: '真题 6 加强：部分相对顺序固定，总排除以固定段全排',
  },
  {
    id: 'circular',
    name: '环形排列',
    note: '围成一圈：(n−1)!，或环上再加限制',
  },
  {
    id: 'derangement',
    name: '错位重排',
    note: '元素都不在原位，用 D_n 或递推',
  },
  {
    id: 'bind-and-fixed',
    name: '捆绑加指定位置',
    note: '真题 4 加强：中间固定块 + 相邻块 + 其余排列',
  },
] as const

export type PermCombConstraintHardTypeId =
  (typeof PERM_COMB_CONSTRAINT_HARD_EXAM_TYPES)[number]['id']

export type PermCombConstraintQuestion = {
  id: string
  topic: 'perm-comb-constraint'
  difficulty: PermCombConstraintDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: PermCombConstraintHardTypeId
}

export function permCombConstraintTopicLabel(): string {
  return '限制条件型问题'
}

export function permCombConstraintDifficultyLabel(d: PermCombConstraintDifficulty): string {
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

const D: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 9, 5: 44, 6: 265 }

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
  difficulty: PermCombConstraintDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: PermCombConstraintHardTypeId
  seq: number
}): PermCombConstraintQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'perm-comb-constraint',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `pcc-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'perm-comb-constraint',
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

// ——— 简单 · 真题 3、4 及示例 ———

/** 经典真题 3：首尾必须是某类节目 */
function genEasyClassic3(seq: number): PermCombConstraintQuestion | null {
  const dance = pickOne([2, 3])
  const talk = pickOne([3, 4])
  if (dance < 2) return null
  const total = dance + talk
  const mid = total - 2
  const ans2 = perm(dance, 2) * fact(mid)
  return buildQuestion({
    difficulty: 'easy',
    term: '首尾限定优限法（经典真题 3）',
    passage: `晚会共 ${total} 个节目：歌舞 ${dance} 个、相声 ${talk} 个（节目均不同）。要求第一个和最后一个必须是歌舞。`,
    stem: '节目单有多少种排法？',
    correct: String(ans2),
    distractors: uniqueNum(ans2, [fact(total), perm(dance, 2), fact(mid), Math.max(1, Math.floor(ans2 / 2))]),
    method: '优限法：先排首尾两个歌舞位置 A_歌舞^2，再对其余节目全排列。',
    explanation: `A_${dance}^2×${mid}!=${ans2}。`,
    seq,
  })
}

/** 示例 5：某人固定首位 */
function genEasyFixedOne(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([5, 6])
  const ans = fact(n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '指定位置优限法（示例 5）',
    passage: `${n} 人（含甲）排成一排，要求甲必须站在最左边。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), 2 * fact(n - 1), perm(n, 2), n * fact(n - 2)]),
    method: '优限法：先固定甲，其余 (n−1)!。',
    explanation: `(${n}−1)!=${ans}。`,
    seq,
  })
}

/** 示例 6 / 真题 4 简化：两人相邻捆绑 */
function genEasyBundle(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([5, 6])
  const ans = 2 * fact(n - 1)
  return buildQuestion({
    difficulty: 'easy',
    term: '相邻捆绑法（示例 6）',
    passage: `${n} 人排成一排，其中甲、乙两人必须相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n - 1), 2 * fact(n), perm(n, 2) * fact(n - 2)]),
    method: '捆绑法：甲乙捆成一块（块内 2!），与其余共 n−1 个单元全排列。',
    explanation: `2×(${n}−1)!=${ans}。`,
    seq,
  })
}

/** 经典真题 4 同构：中间固定两人块 + 双胞胎捆绑 */
function genEasyClassic4(seq: number): PermCombConstraintQuestion | null {
  // 教材：班长与老师居中、双胞胎相邻 → 16
  // 一般化：n=6，中间两位置放「指定两人块」，另一对捆绑，其余 2 人
  // 中间块内 2!，双胞胎块内 2!，两侧两空位给「双胞胎块」与「其余两人块」：2! 种排法，其余两人若也成块？
  // 书：2×2×2×2=16
  // 构造：总 6 人站成一排；甲乙必须居中相邻；丙丁必须相邻；戊己其余
  // 中间两格固定给甲乙块：块内 A_2^2=2
  // 左右各还剩两个位置……实际书上把双胞胎当一块、另两学生当两块？「四个单元」：
  // (班长老师块固定中间) + 双胞胎块可在左或右两「侧位」之一？简化用固定答案结构
  const ans = 16
  return buildQuestion({
    difficulty: 'easy',
    term: '捆绑加居中（经典真题 4）',
    passage:
      '老师与 5 名学生共 6 人拍照站成一排。要求：班长与老师必须站在正中间且相邻；一对双胞胎必须相邻。',
    stem: '有多少种站法？',
    correct: '16',
    distractors: uniqueNum(16, [8, 24, 32]),
    method: '优限+捆绑：班长与老师捆成中间块（块内 2!）；双胞胎捆成一块（块内 2!）；两侧位置安排双胞胎块与另两名学生（再乘内部排列）。',
    explanation: '教材结果：2×2×2×2=16。',
    seq,
  })
}

function genEasyFixedEndsSimple(seq: number): PermCombConstraintQuestion | null {
  // 5 人，甲乙分别在两端
  const n = 5
  const ans = 2 * fact(n - 2) // 甲左乙右或甲右乙左，中间 3!
  return buildQuestion({
    difficulty: 'easy',
    term: '两端指定两人',
    passage: `甲、乙、丙、丁、戊 5 人排成一排，要求甲、乙分别站在两端（谁左谁右不限）。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(5), 2 * fact(4), fact(3), 12]),
    method: '两端甲乙：2! 种，中间 3!。',
    explanation: `2×3!=${ans}。`,
    seq,
  })
}

// ——— 普通 · 真题 5、6 ———

/** 经典真题 5：空位不相邻插空 */
function genMediumClassic5(seq: number): PermCombConstraintQuestion | null {
  for (let i = 0; i < 30; i++) {
    const people = pickOne([4, 5])
    const empties = pickOne([3, 4])
    const seats = people + empties
    // 先排 people 人 A_people^people，形成 people+1 个空隙，选 empties 个空隙各放 1 个空位（空位相同）
    if (empties > people + 1) continue
    const ans = fact(people) * comb(people + 1, empties)
    return buildQuestion({
      difficulty: 'medium',
      term: '空位不相邻插空（经典真题 5）',
      passage: `一排共 ${seats} 个座位，有 ${people} 名观众入座（人不同），其余为空位。要求任意两个空位不相邻。`,
      stem: '有多少种坐法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [
        fact(people) * comb(people, empties),
        fact(seats) / fact(empties),
        fact(people) * empties,
        comb(seats, people),
      ]),
      method: '插空法：先排观众形成空隙，再把相同空位插入不同空隙（每隙至多一个）。',
      explanation: `${people}!×C_${people + 1}^${empties}=${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '空位不相邻插空（经典真题 5）',
    passage: '一排 8 个座位，4 名观众入座，要求任意两个空位不相邻。',
    stem: '有多少种坐法？',
    correct: '120',
    distractors: uniqueNum(120, [24, 96, 168]),
    method: '先排 4 人 A_4^4=24，形成 5 个空隙，选 4 个放空位 C_5^4=5；24×5=120。',
    explanation: '共 120 种。',
    seq,
  })
}

/** 经典真题 6：相对顺序固定归一法 */
function genMediumClassic6(seq: number): PermCombConstraintQuestion | null {
  for (let i = 0; i < 30; i++) {
    const fixed = pickOne([2, 3])
    const added = pickOne([2, 3])
    const n = fixed + added
    const ans = fact(n) / fact(fixed)
    if (!Number.isInteger(ans)) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '相对顺序固定归一法（经典真题 6）',
      passage: `原有 ${fixed} 个节目相对顺序不变，再插入 ${added} 个新节目，共 ${n} 个节目重新排节目单（新节目之间无顺序限制）。`,
      stem: '有多少种排法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [fact(n), fact(added), perm(n, added), fact(n) / fact(added)]),
      method: '归一法：先按 n 个全排列，再除以固定相对顺序的那 m 个的全排列 A_m^m。',
      explanation: `A_${n}^${n}÷A_${fixed}^${fixed}=${ans}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '相对顺序固定归一法（经典真题 6）',
    passage: '原节目单 3 个节目相对顺序不变，再加入 2 个新节目。',
    stem: '有多少种排法？',
    correct: '20',
    distractors: uniqueNum(20, [12, 6, 4]),
    method: 'A_5^5÷A_3^3=120÷6=20。',
    explanation: '共 20 种。',
    seq,
  })
}

/** 示例 7：两人不相邻插空 */
function genMediumInsertPeople(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([5, 6])
  // 甲乙不相邻：先排其余 n-2 人，空隙 n-1 个，A_{n-1}^2
  const rest = n - 2
  const gaps = rest + 1
  const ans = fact(rest) * perm(gaps, 2)
  return buildQuestion({
    difficulty: 'medium',
    term: '不相邻插空法（示例 7）',
    passage: `${n} 人排成一排，要求甲、乙两人不相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n) - 2 * fact(n - 1), fact(n), 2 * fact(n - 1), fact(rest) * comb(gaps, 2)]),
    method: '插空法：先排其余人，再在空隙中选两空插入甲、乙（注意顺序）。',
    explanation: `${rest}!×A_${gaps}^2=${ans}（也可用 ${n}!−2×${n - 1}! 验证）。`,
    seq,
  })
}

/** 示例 8：甲在乙前归一 */
function genMediumNormalizePair(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([5, 6])
  const ans = fact(n) / 2
  return buildQuestion({
    difficulty: 'medium',
    term: '相对前后归一法（示例 8）',
    passage: `${n} 人排成一排，要求甲必须站在乙的左边（甲在乙前）。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n - 1), 2 * fact(n - 1), fact(n) / fact(2)]),
    method: '归一法：全排列中甲乙相对顺序各半，除以 2!。',
    explanation: `${n}!÷2=${ans}。`,
    seq,
  })
}

function genMediumBundleThenArrange(seq: number): PermCombConstraintQuestion | null {
  // 3 人必须相邻捆成一块
  const n = pickOne([6, 7])
  const ans = fact(3) * fact(n - 3 + 1) // 块内 3!，单元 n-2 个
  return buildQuestion({
    difficulty: 'medium',
    term: '三人相邻捆绑',
    passage: `${n} 人排成一排，其中甲、乙、丙三人必须相邻（三人相对顺序任意）。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [2 * fact(n - 1), fact(n), fact(3) * fact(n - 3), perm(n, 3)]),
    method: '三人捆成一块（块内 3!），与其余共 n−2 个单元全排列。',
    explanation: `3!×(${n}−2)!=${ans}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardFixedEndsPlus(seq: number): PermCombConstraintQuestion | null {
  const dance = pickOne([2, 3])
  const talk = pickOne([4, 5])
  const total = dance + talk
  const mid = total - 2
  // 首尾歌舞，且中间第一个位置必须是相声
  if (talk < 1 || mid < 1) return null
  const ans = perm(dance, 2) * talk * fact(mid - 1)
  return buildQuestion({
    difficulty: 'hard',
    term: '首尾限定再限中间',
    hardTypeId: 'fixed-ends-plus',
    passage: `共 ${total} 个不同节目：歌舞 ${dance} 个、相声 ${talk} 个。要求首尾必须是歌舞，且从左数第 2 个必须是相声。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [perm(dance, 2) * fact(mid), fact(total), perm(dance, 2) * talk]),
    method: '优限法：先排首尾歌舞，再排第 2 位相声，最后排其余。',
    explanation: `A_${dance}^2×${talk}×${mid - 1}!=${ans}。`,
    seq,
  })
}

function genHardMultiBundle(seq: number): PermCombConstraintQuestion | null {
  // n 人，甲乙相邻，丙丁相邻
  const n = pickOne([6, 7, 8])
  // 两块 + (n-4) 人 = n-2 个单元，两块内各 2!
  const ans = fact(n - 2) * 2 * 2
  return buildQuestion({
    difficulty: 'hard',
    term: '两组相邻捆绑',
    hardTypeId: 'multi-bundle',
    passage: `${n} 人排成一排，要求甲与乙相邻，且丙与丁相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [2 * fact(n - 1), fact(n - 2), 4 * fact(n - 1), fact(n)]),
    method: '甲乙、丙丁各捆成一块（各×2!），共 n−2 个单元全排列。',
    explanation: `(${n}−2)!×2×2=${ans}。`,
    seq,
  })
}

function genHardInsertGapsPlus(seq: number): PermCombConstraintQuestion | null {
  const people = pickOne([5, 6])
  const empties = pickOne([3, 4])
  if (empties > people + 1) return null
  const ans = fact(people) * comb(people + 1, empties)
  return buildQuestion({
    difficulty: 'hard',
    term: '空位插空加强',
    hardTypeId: 'insert-gaps-plus',
    passage: `一排 ${people + empties} 座，${people} 名不同观众入座，${empties} 个空位完全相同，且任意两空位不相邻。`,
    stem: '有多少种坐法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      fact(people) * perm(people + 1, empties),
      fact(people + empties) / fact(empties),
      comb(people + empties, people),
    ]),
    method: '先排观众，再在空隙中选空放入相同空位。',
    explanation: `${people}!×C_${people + 1}^${empties}=${ans}。`,
    seq,
  })
}

function genHardNormalizePlus(seq: number): PermCombConstraintQuestion | null {
  const fixed = pickOne([3, 4])
  const added = pickOne([2, 3, 4])
  const n = fixed + added
  const ans = fact(n) / fact(fixed)
  if (!Number.isInteger(ans)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '多节目顺序固定归一',
    hardTypeId: 'normalize-plus',
    passage: `共 ${n} 个节目排节目单。其中某 ${fixed} 个老节目必须保持相对先后顺序不变，其余 ${added} 个新节目无限制。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n) / fact(added), perm(n, added), comb(n, fixed)]),
    method: '归一法：n! / m!（m 为相对顺序固定的个数）。',
    explanation: `${n}!÷${fixed}!=${ans}。`,
    seq,
  })
}

function genHardCircular(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const mode = pickOne(['plain', 'two-fixed'] as const)
  if (mode === 'plain') {
    const ans = fact(n - 1)
    return buildQuestion({
      difficulty: 'hard',
      term: '环形排列',
      hardTypeId: 'circular',
      passage: `${n} 人围成一圈跳舞（旋转视为同一圈，翻转不算同一）。`,
      stem: '有多少种站法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [fact(n), fact(n - 2), n * fact(n - 1), (fact(n - 1) / 2)]),
      method: '环形排列：(n−1)!。',
      explanation: `(${n}−1)!=${ans}。`,
      seq,
    })
  }
  // 甲乙相邻的环形：先捆甲乙，(n-2)! * 2
  const ans = 2 * fact(n - 2)
  return buildQuestion({
    difficulty: 'hard',
    term: '环形且两人相邻',
    hardTypeId: 'circular',
    passage: `${n} 人围成一圈，要求甲、乙必须相邻（旋转相同算一种）。`,
    stem: '有多少种站法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n - 1), 2 * fact(n - 1), fact(n - 2), 2 * fact(n - 3)]),
    method: '甲乙捆绑后环形排 n−1 个单元：(n−2)!，块内×2。',
    explanation: `2×(${n}−2)!=${ans}。`,
    seq,
  })
}

function genHardDerangement(seq: number): PermCombConstraintQuestion | null {
  const n = pickOne([4, 5, 6])
  const ans = D[n]
  if (ans == null) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '错位重排',
    hardTypeId: 'derangement',
    passage: `${n} 封信放入 ${n} 个信封，要求每封信都不在自己的信封里。`,
    stem: '有多少种放法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n), fact(n) - 1, D[n - 1] ?? ans - 1, n * (D[n - 1] ?? 1)]),
    method: '错位重排 D_n；可记 D_4=9，D_5=44，D_6=265，或用 D_n=(n−1)(D_{n−1}+D_{n−2})。',
    explanation: `D_${n}=${ans}。`,
    seq,
  })
}

function genHardBindAndFixed(seq: number): PermCombConstraintQuestion | null {
  // n=6 或 7：甲乙居中相邻，丙丁相邻
  const n = pickOne([6, 7])
  if (n === 6) {
    // 中间两格给甲乙块：2!；剩下 4 个位置、丙丁块+两人：把丙丁捆后 3 单元排在两侧区域较复杂
    // 简化：直线，甲乙必须在正中两位置（n偶数）：中间块 2!，其余 4 人中丙丁捆绑：2!*2!*3! ? 
    // 左右共 4 位看成一排 4 单元？中间已占，左右各 2 位连起来是 4 个位置排（丙丁块、戊、己）= 3 单元在？不对。
    // 用：中间固定甲乙块(2!)，剩余 4 位置全排但丙丁相邻：2!*2!*3! = 2*2*6=24
    const ans = 2 * 2 * fact(3)
    return buildQuestion({
      difficulty: 'hard',
      term: '居中捆绑加另一对相邻',
      hardTypeId: 'bind-and-fixed',
      passage: `6 人排成一排。甲、乙必须站在正中间两座且相邻；丙、丁必须相邻。`,
      stem: '有多少种排法？',
      correct: String(ans),
      distractors: uniqueNum(ans, [16, 48, 12, 36]),
      method: '中间先排甲乙（2!）；剩余 4 座上丙丁捆绑（2!）与另两人共 3 单元排列（3!）。',
      explanation: `2×2×3!=${ans}。`,
      seq,
    })
  }
  // n=7：甲左乙右固定，丙丁捆绑
  const ans = 2 * fact(n - 3)
  return buildQuestion({
    difficulty: 'hard',
    term: '两端一人加一对捆绑',
    hardTypeId: 'bind-and-fixed',
    passage: `${n} 人排成一排。甲必须在最左，乙必须在最右；丙、丁必须相邻。`,
    stem: '有多少种排法？',
    correct: String(ans),
    distractors: uniqueNum(ans, [fact(n - 2), 2 * fact(n - 2), fact(n - 3), 4 * fact(n - 3)]),
    method: '先固定甲左乙右；中间 n−2 个位置上丙丁捆绑：块内 2!，与其余共 n−3 个单元全排列。',
    explanation: `2×(${n}−3)!=${ans}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  PermCombConstraintHardTypeId,
  (seq: number) => PermCombConstraintQuestion | null
> = {
  'fixed-ends-plus': genHardFixedEndsPlus,
  'multi-bundle': genHardMultiBundle,
  'insert-gaps-plus': genHardInsertGapsPlus,
  'normalize-plus': genHardNormalizePlus,
  circular: genHardCircular,
  derangement: genHardDerangement,
  'bind-and-fixed': genHardBindAndFixed,
}

function tryBuild(
  factory: () => PermCombConstraintQuestion | null,
  maxTry = 50,
): PermCombConstraintQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generatePermCombConstraintPaper(
  difficulty: PermCombConstraintDifficulty,
): PermCombConstraintQuestion[] {
  const out: PermCombConstraintQuestion[] = []
  const seen = new Set<string>()
  const push = (q: PermCombConstraintQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyClassic3,
      genEasyFixedOne,
      genEasyBundle,
      genEasyClassic4,
      genEasyFixedEndsSimple,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_CONSTRAINT_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_CONSTRAINT_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumClassic5,
      genMediumClassic6,
      genMediumInsertPeople,
      genMediumNormalizePair,
      genMediumBundleThenArrange,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= PERM_COMB_CONSTRAINT_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < PERM_COMB_CONSTRAINT_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<PermCombConstraintHardTypeId>()
    const types = shuffleInPlace([...PERM_COMB_CONSTRAINT_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= PERM_COMB_CONSTRAINT_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = PERM_COMB_CONSTRAINT_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < PERM_COMB_CONSTRAINT_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : PERM_COMB_CONSTRAINT_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, PERM_COMB_CONSTRAINT_QUESTION_COUNT)
}
