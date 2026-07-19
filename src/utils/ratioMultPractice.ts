/**
 * 运算技巧 · 整除及其性质 · 由比例判定倍数
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【困难题型库 · 难于经典真题 5，登记 ≥10 种；每轮抽 5 种且互不重复】
 * 1. ship-equation：客船上下客 + 两比例，需列方程（比真题更绕）
 * 2. pct-to-fraction：百分数先化最简分数再判倍数
 * 3. need-simplify：比例未约分，须先化为互质
 * 4. sum-multiple：由 A/B=m/n 推 A+B 是 m+n 的倍数
 * 5. diff-multiple：由 A/B=m/n 推 |A−B| 是 |m−n| 的倍数
 * 6. three-chain：三量比例连锁约束
 * 7. decimal-ratio：小数比例先化分数
 * 8. dual-options：双分母约束筛选项（LCM）
 * 9. leave-board-final：下车比例+上车人数+最终比例求原人数
 * 10. which-must：多结论选「一定成立」
 * 11. find-from-sum：已知和与比求一量
 * 12. mixed-pct-frac：百分数与分数混合约束
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type RatioMultDifficulty = 'easy' | 'medium' | 'hard'

export const RATIO_MULT_QUESTION_COUNT = 5

export const RATIO_MULT_MODES: {
  id: RatioMultDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '由比例判定倍数 · 简单',
    desc: '每轮 5 题 · 最简比直接判倍数 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '由比例判定倍数 · 中等',
    desc: '每轮 5 题 · 对齐经典真题 5（比例筛选项）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '由比例判定倍数 · 困难',
    desc: '每轮 5 题 · 难于经典真题 5 的 12 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const RATIO_MULT_HARD_EXAM_TYPES = [
  {
    id: 'ship-equation',
    name: '客船比例列方程',
    note: '下车比例 + 上车人数 + 最终相对比例，列方程求解',
  },
  {
    id: 'pct-to-fraction',
    name: '百分数化最简分数',
    note: '先把百分数写成最简分数，再判倍数',
  },
  {
    id: 'need-simplify',
    name: '比例须先约分',
    note: '给出未约分的比，约成互质后再用结论',
  },
  {
    id: 'sum-multiple',
    name: '和是 m+n 的倍数',
    note: 'A/B=m/n（互质）⇒ A+B 是 m+n 的倍数',
  },
  {
    id: 'diff-multiple',
    name: '差是 |m−n| 的倍数',
    note: 'A/B=m/n（互质）⇒ |A−B| 是 |m−n| 的倍数',
  },
  {
    id: 'three-chain',
    name: '三量比例连锁',
    note: 'A:B 与 B:C 或 A:B:C，综合倍数约束',
  },
  {
    id: 'decimal-ratio',
    name: '小数比化分数',
    note: '0.25、0.375 等先化最简分数',
  },
  {
    id: 'dual-options',
    name: '双约束筛选项',
    note: '两个最简比分母，取 LCM 筛选项',
  },
  {
    id: 'leave-board-final',
    name: '下车+上车+最终比（升级版真题 5）',
    note: '结构同经典真题 5，数字与约束更紧',
  },
  {
    id: 'which-must',
    name: '选一定成立的结论',
    note: '给出比例，判断哪条倍数结论必真',
  },
  {
    id: 'find-from-sum',
    name: '已知和与比求一量',
    note: 'A+B 与 A:B 已知，求 A 或 B',
  },
  {
    id: 'mixed-pct-frac',
    name: '百分数与分数混合',
    note: '同一总量同时受 % 与分数约束',
  },
] as const

export type RatioMultHardTypeId = (typeof RATIO_MULT_HARD_EXAM_TYPES)[number]['id']

export type RatioMultQuestion = {
  id: string
  topic: 'ratio-mult'
  difficulty: RatioMultDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: RatioMultHardTypeId
}

export function ratioMultTopicLabel(): string {
  return '由比例判定倍数'
}

export function ratioMultDifficultyLabel(d: RatioMultDifficulty): string {
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
  return x
}

function lcm2(a: number, b: number): number {
  return Math.abs((a / gcd(a, b)) * b)
}

function simplify(m: number, n: number): [number, number] {
  const g = gcd(m, n)
  return [m / g, n / g]
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
    const fake = `${Number.isFinite(Number(correct)) ? Number(correct) + g + 1 : correct + g}`
    if (seen.has(String(fake).replace(/\s+/g, ''))) continue
    seen.add(String(fake).replace(/\s+/g, ''))
    out.push(String(fake))
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && x !== correct).map(String),
  )
}

/** 造干扰选项：只有正确项满足「是 d 的倍数」 */
function optionsMultipleOf(correct: number, d: number, extras: number[] = []): number[] {
  const wrong: number[] = []
  const pool = [
    ...extras,
    correct + d,
    correct - d,
    correct + 1,
    correct - 1,
    Math.floor(correct * 1.1),
    Math.floor(correct * 0.9),
    correct + d * 2,
    d * Math.floor(correct / d) + 1,
  ]
  for (const x of pool) {
    if (!Number.isInteger(x) || x <= 0 || x === correct) continue
    if (x % d === 0) continue
    if (wrong.includes(x)) continue
    wrong.push(x)
    if (wrong.length >= 3) break
  }
  let t = 1
  while (wrong.length < 3 && t < 200) {
    const x = correct + t
    t++
    if (x % d === 0 || x === correct || x <= 0) continue
    if (wrong.includes(x)) continue
    wrong.push(x)
  }
  return wrong.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: RatioMultDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: RatioMultHardTypeId
  seq: number
}): RatioMultQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'ratio-mult',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ratio-mult-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'ratio-mult',
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

const COPRIME_PAIRS: [number, number][] = [
  [2, 3],
  [2, 5],
  [2, 7],
  [3, 4],
  [3, 5],
  [3, 7],
  [3, 8],
  [4, 5],
  [4, 7],
  [5, 6],
  [5, 7],
  [5, 8],
  [5, 9],
  [7, 8],
  [7, 9],
  [7, 10],
  [8, 9],
  [8, 11],
  [9, 10],
  [11, 12],
  [20, 21],
]

// ——— 简单 ———

function genEasyAMultiple(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS)
  const askA = Math.random() < 0.5
  const ans = askA ? m : n
  const other = askA ? n : m
  return buildQuestion({
    difficulty: 'easy',
    term: '最简比判倍数',
    stem: askA
      ? `已知正整数 A、B 满足 A/B = ${m}/${n}（已是最简分数），则 A 一定是几的倍数？`
      : `已知正整数 A、B 满足 A/B = ${m}/${n}（已是最简分数），则 B 一定是几的倍数？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [other, m + n, Math.abs(m - n), m * n, 1]),
    method: '最简比 A/B=m/n（m、n 互质）⇒ A 是 m 的倍数，B 是 n 的倍数。',
    explanation: `${m} 与 ${n} 互质，故 ${askA ? 'A' : 'B'} 必为 ${ans} 的倍数。`,
    seq,
  })
}

function genEasySumDiff(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS.filter(([a, b]) => a !== b))
  const askSum = Math.random() < 0.5
  const ans = askSum ? m + n : Math.abs(m - n)
  return buildQuestion({
    difficulty: 'easy',
    term: askSum ? '和的倍数' : '差的倍数',
    stem: askSum
      ? `已知 A/B = ${m}/${n}（最简），则 A+B 一定是几的倍数？`
      : `已知 A/B = ${m}/${n}（最简），则 |A−B| 一定是几的倍数？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [m, n, m * n, m + n, Math.abs(m - n), 1].filter((x) => x > 0)),
    method: askSum
      ? '最简比 ⇒ A+B 是 (m+n) 的倍数。'
      : '最简比 ⇒ |A−B| 是 |m−n| 的倍数。',
    explanation: `${m}、${n} 互质，故 ${askSum ? `A+B 是 ${m}+${n}=${ans}` : `|A−B| 是 |${m}−${n}|=${ans}`} 的倍数。`,
    seq,
  })
}

function genEasyPickOption(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS)
  const k = randInt(2, 6)
  const correct = n * k
  const wrong = optionsMultipleOf(correct, n, [m * k, m * n, n * (k + 1) + 1])
  return buildQuestion({
    difficulty: 'easy',
    term: '选项筛倍数',
    stem: `已知 A/B = ${m}/${n}（最简），下列哪个数可能是 B？`,
    correct: String(correct),
    distractors: uniqueNum(correct, wrong),
    method: 'B 必为 n 的倍数，用选项排除。',
    explanation: `B 是 ${n} 的倍数。只有 ${correct}=${n}×${k} 符合。`,
    seq,
  })
}

function genEasyMustTrue(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS)
  const correct = `A 是 ${m} 的倍数`
  const distractors = uniqueStr(correct, [
    `A 是 ${n} 的倍数`,
    `B 是 ${m} 的倍数`,
    `A+B 是 ${m * n} 的倍数`,
    `A 是 ${m + n} 的倍数`,
  ])
  return buildQuestion({
    difficulty: 'easy',
    term: '选正确结论',
    stem: `若 A/B = ${m}/${n} 为最简分数，下列一定正确的是？`,
    correct,
    distractors,
    method: '互质时：A↔m，B↔n，和↔m+n，差↔|m−n|。',
    explanation: `${m} 与 ${n} 互质 ⇒ A 必为 ${m} 的倍数。其余未必。`,
    seq,
  })
}

// ——— 中等：对齐经典真题 5 ———

/** 构造「下车比例 + 上车 + 最终比」且答案唯一满足分母倍数 */
function genMediumShipClassic(seq: number): RatioMultQuestion | null {
  // 设原人数 x = t * den，下车 leaveM/leaveN，上车 board，最终 finalM/finalN
  // (1 - leaveM/leaveN)*x + board = (finalM/finalN)*x
  // board = x * (finalM/finalN - (leaveN-leaveM)/leaveN)
  const templates: {
    leave: [number, number]
    final: [number, number]
    board: number
    answer: number
  }[] = [
    { leave: [2, 7], final: [20, 21], board: 45, answer: 189 },
    { leave: [1, 4], final: [5, 6], board: 30, answer: 120 },
    { leave: [1, 5], final: [4, 5], board: 40, answer: 200 },
    { leave: [1, 3], final: [5, 6], board: 50, answer: 150 },
    { leave: [2, 5], final: [7, 8], board: 36, answer: 240 },
    { leave: [1, 6], final: [5, 6], board: 25, answer: 150 },
    { leave: [3, 8], final: [7, 8], board: 40, answer: 320 },
    { leave: [1, 7], final: [6, 7], board: 28, answer: 196 },
  ]

  // 校验方程
  const valid = templates.filter((t) => {
    const [lm, ln] = t.leave
    const [fm, fn] = t.final
    const left = ((ln - lm) / ln) * t.answer + t.board
    const right = (fm / fn) * t.answer
    return Math.abs(left - right) < 1e-9
  })
  if (!valid.length) return null
  const t = pickOne(valid)
  const [lm, ln] = t.leave
  const [fm, fn] = t.final
  const den = lcm2(ln, fn)
  const correct = t.answer
  const distractors = uniqueNum(correct, optionsMultipleOf(correct, den, [ln * 20, fn * 8, den * 5, 140, 160, 200]))

  const names = pickOne(['客船', '大巴', '游轮'])
  const from = pickOne(['甲地', 'A 港', '起点站'])
  const mid = pickOne(['乙地', 'B 港', '中途站'])
  return buildQuestion({
    difficulty: 'medium',
    term: '比例筛选项（经典真题 5）',
    passage: `一艘${names}从${from}出发。途经${mid}时，下车人数是出发时的 ${lm}/${ln}，随后又上来 ${t.board} 人。此时车上人数是出发时的 ${fm}/${fn}。`,
    stem: `出发时车上有多少人？`,
    correct: String(correct),
    distractors,
    method: '比例化为最简后，总量必为分母的倍数；多比例取分母的最小公倍数筛选项，必要时再列方程验证。',
    explanation: `${lm}/${ln} 最简 ⇒ 原人数是 ${ln} 的倍数；${fm}/${fn} 最简 ⇒ 原人数是 ${fn} 的倍数，故是 ${den} 的倍数。选项中 ${correct} 符合，且验证：下车后剩 ${(ln - lm) / ln}×${correct}，加 ${t.board} 后 = ${(fm / fn) * correct}。`,
    seq,
  })
}

function genMediumTwoRatioScreen(seq: number): RatioMultQuestion | null {
  const [m1, n1] = pickOne(COPRIME_PAIRS)
  let [m2, n2] = pickOne(COPRIME_PAIRS)
  let guard = 0
  while ((n1 === n2 || lcm2(n1, n2) > 120) && guard++ < 20) {
    ;[m2, n2] = pickOne(COPRIME_PAIRS)
  }
  const den = lcm2(n1, n2)
  const k = randInt(2, 5)
  const correct = den * k
  // 干扰：不是 den 的倍数，但可能是 n1 或 n2 的倍数
  const wrong: number[] = []
  for (const cand of [n1 * (k + 1), n2 * (k + 2), den * k + n1, den * k - 1, correct + 10, correct - 10]) {
    if (cand > 0 && cand !== correct && cand % den !== 0 && !wrong.includes(cand)) wrong.push(cand)
    if (wrong.length >= 3) break
  }
  while (wrong.length < 3) {
    const x = correct + wrong.length + 3
    if (x % den !== 0) wrong.push(x)
    else wrong.push(x + 1)
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '双比例筛选项',
    passage: `某班男生人数 A、女生人数 B 满足：请假男生占男生总数的 ${m1}/${n1}，到场总人数占应到总人数的 ${m2}/${n2}（两比均已最简）。已知应到总人数为下列某一选项。`,
    stem: '应到总人数只可能是？',
    correct: String(correct),
    distractors: uniqueNum(correct, wrong),
    method: '最简比分母给出倍数约束；两约束同时成立 ⇒ 总量是两分母 LCM 的倍数。',
    explanation: `由 ${m1}/${n1} 得相关量为 ${n1} 的倍数；由 ${m2}/${n2} 得总量是 ${n2} 的倍数。综合为 ${den} 的倍数，故选 ${correct}。`,
    seq,
  })
}

function genMediumPartOfWhole(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS.filter(([a, b]) => b >= 5))
  const k = randInt(3, 8)
  const total = n * k
  const part = m * k
  const ask = Math.random() < 0.5 ? 'total' : 'part'
  if (ask === 'total') {
    return buildQuestion({
      difficulty: 'medium',
      term: '部分占整体',
      passage: `某次活动中，已报名人数是计划名额的 ${m}/${n}（最简）。已知已报名 ${part} 人。`,
      stem: '计划名额是多少？',
      correct: String(total),
      distractors: uniqueNum(total, optionsMultipleOf(total, n, [part, m * n, total + n])),
      method: '已报名/计划 = m/n 最简 ⇒ 计划是 n 的倍数，且已报名是 m 的倍数。',
      explanation: `计划名额是 ${n} 的倍数；${part}÷${m}=${k}，故计划=${n}×${k}=${total}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '部分占整体',
    passage: `库存商品中，已售出占总数的 ${m}/${n}（最简）。已知总数为 ${total} 件。`,
    stem: '已售出多少件？',
    correct: String(part),
    distractors: uniqueNum(part, [m * (k + 1), n * k, part + m, total - part]),
    method: '总数是 n 的倍数时，已售 = (m/n)×总数，且已售是 m 的倍数。',
    explanation: `已售=${m}/${n}×${total}=${part}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardShipEquation(seq: number): RatioMultQuestion | null {
  // (1-p/q)x + b = (r/s)x  =>  b = x(r/s - (q-p)/q)
  const configs: { p: number; q: number; r: number; s: number; b: number; x: number }[] = []
  for (const [p, q] of [
    [2, 7],
    [3, 8],
    [1, 5],
    [2, 9],
    [3, 10],
  ] as [number, number][]) {
    for (const [r, s] of [
      [20, 21],
      [7, 8],
      [5, 6],
      [11, 12],
      [8, 9],
    ] as [number, number][]) {
      if (r / s <= (q - p) / q) continue
      for (const t of [6, 7, 8, 9, 10, 12]) {
        const x = lcm2(q, s) * t
        const b = x * (r / s - (q - p) / q)
        if (!Number.isInteger(b) || b <= 0 || b > 200) continue
        configs.push({ p, q, r, s, b, x })
      }
    }
  }
  if (!configs.length) return null
  const c = pickOne(configs)
  const den = lcm2(c.q, c.s)
  const distractors = uniqueNum(c.x, optionsMultipleOf(c.x, den, [c.q * 20, c.s * 15, den * 5]))
  return buildQuestion({
    difficulty: 'hard',
    term: '客船比例列方程',
    hardTypeId: 'ship-equation',
    passage: `客船从 A 港出发时有若干乘客。到 B 港时下车人数为出发人数的 ${c.p}/${c.q}，随后又上来 ${c.b} 人，此时船上人数为出发人数的 ${c.r}/${c.s}。`,
    stem: '出发时乘客人数是？',
    correct: String(c.x),
    distractors,
    method: '先用最简分母得倍数（LCM 筛选项），再列式：(1−p/q)x+b=(r/s)x 验证。',
    explanation: `原人数是 ${c.q} 与 ${c.s} 的公倍数（${den} 的倍数）。设为 x，则 ${(c.q - c.p) / c.q}x+${c.b}=${c.r}/${c.s}x，解得 x=${c.x}。`,
    seq,
  })
}

function genHardPctToFraction(seq: number): RatioMultQuestion | null {
  const pcts: { pct: number; m: number; n: number }[] = [
    { pct: 12.5, m: 1, n: 8 },
    { pct: 37.5, m: 3, n: 8 },
    { pct: 62.5, m: 5, n: 8 },
    { pct: 20, m: 1, n: 5 },
    { pct: 40, m: 2, n: 5 },
    { pct: 16, m: 4, n: 25 },
    { pct: 4, m: 1, n: 25 },
  ]
  const p = pickOne(pcts)
  const k = randInt(2, 6)
  const total = p.n * k
  return buildQuestion({
    difficulty: 'hard',
    term: '百分数化最简分数',
    hardTypeId: 'pct-to-fraction',
    passage: `某工厂合格品占产量的 ${p.pct}%。已知合格品有 ${p.m * k} 件。`,
    stem: '该批产量是多少件？',
    correct: String(total),
    distractors: uniqueNum(total, optionsMultipleOf(total, p.n, [p.m * 10, 100, total + p.n])),
    method: '百分数÷100 化为分数并约分到最简，产量必为分母的倍数。',
    explanation: `${p.pct}%=${p.pct}/100=${p.m}/${p.n}（最简）⇒ 产量是 ${p.n} 的倍数。合格 ${p.m * k} ⇒ 产量=${total}。`,
    seq,
  })
}

function genHardNeedSimplify(seq: number): RatioMultQuestion | null {
  const [m0, n0] = pickOne(COPRIME_PAIRS)
  const g = pickOne([2, 3, 4, 5])
  const m = m0 * g
  const n = n0 * g
  const ask = pickOne(['A', 'B', 'sum'] as const)
  let ans: number
  let stem: string
  if (ask === 'A') {
    ans = m0
    stem = `已知 A/B = ${m}/${n}，则 A 一定是几的倍数？`
  } else if (ask === 'B') {
    ans = n0
    stem = `已知 A/B = ${m}/${n}，则 B 一定是几的倍数？`
  } else {
    ans = m0 + n0
    stem = `已知 A/B = ${m}/${n}，则 A+B 一定是几的倍数？`
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '比例须先约分',
    hardTypeId: 'need-simplify',
    stem,
    correct: String(ans),
    distractors: uniqueNum(ans, [m, n, m + n, Math.abs(m - n), m0, n0, m0 + n0].filter((x) => x > 0 && x !== ans)),
    method: '先约分到互质，再套「A↔分子、B↔分母、和↔分子+分母」。未约分时不能直接用原分子分母。',
    explanation: `${m}/${n} 约分得 ${m0}/${n0}（互质）。故答案为 ${ans}。若误用未约分的 ${m},${n} 会错。`,
    seq,
  })
}

function genHardSumMultiple(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS.filter(([a, b]) => a + b >= 7))
  const k = randInt(3, 9)
  const sum = (m + n) * k
  const A = m * k
  const B = n * k
  return buildQuestion({
    difficulty: 'hard',
    term: '和是 m+n 的倍数',
    hardTypeId: 'sum-multiple',
    passage: `甲、乙两队人数比为 ${m}:${n}（已最简）。已知两队合计 ${sum} 人。`,
    stem: '甲队人数是？',
    correct: String(A),
    distractors: uniqueNum(A, [B, m * (k + 1), sum - m, n * k]),
    method: 'A:B=m:n ⇒ A+B 是 m+n 的倍数；A=(m/(m+n))×合计。',
    explanation: `合计是 ${m}+${n}=${m + n} 的倍数。甲=${m}/${m + n}×${sum}=${A}。`,
    seq,
  })
}

function genHardDiffMultiple(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS.filter(([a, b]) => Math.abs(a - b) >= 2))
  const k = randInt(3, 8)
  const A = m * k
  const B = n * k
  const diff = Math.abs(A - B)
  const askDiff = Math.random() < 0.4
  if (askDiff) {
    return buildQuestion({
      difficulty: 'hard',
      term: '差是 |m−n| 的倍数',
      hardTypeId: 'diff-multiple',
      stem: `已知正整数 A、B 满足 A/B=${m}/${n}（最简），且 A>B。下列哪个数可能是 A−B？`,
      correct: String(diff),
      distractors: uniqueNum(diff, optionsMultipleOf(diff, Math.abs(m - n), [m + n, m * n])),
      method: '|A−B| 必为 |m−n| 的倍数。',
      explanation: `|m−n|=${Math.abs(m - n)}，${diff}=${Math.abs(m - n)}×${k} 符合。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '差是 |m−n| 的倍数',
    hardTypeId: 'diff-multiple',
    passage: `两种零件个数比为 ${m}:${n}（最简），且较多者比少者多 ${diff} 个。`,
    stem: '较少的那种有多少个？',
    correct: String(Math.min(A, B)),
    distractors: uniqueNum(Math.min(A, B), [Math.max(A, B), diff, m * k, n * (k + 1)]),
    method: '差是 |m−n| 的倍数；少者 = min(m,n)/( |m−n| ) × 差。',
    explanation: `差=${Math.abs(m - n)}×${k}=${diff}。少者=${Math.min(m, n)}×${k}=${Math.min(A, B)}。`,
    seq,
  })
}

function genHardThreeChain(seq: number): RatioMultQuestion | null {
  const a = pickOne([2, 3, 4])
  const b = pickOne([3, 5, 7])
  const c = pickOne([4, 5, 8])
  // A:B = a:b, B:C = b:c  after aligning B → A:B:C = a : b : c  if same b, else A:B:C = a*b2 : b*b1 : c*b1 wait
  // Simpler: give A:B:C = a:b:c already simplified pairwise as much as possible
  const g = gcd(gcd(a, b), c)
  const A = a / g
  const B = b / g
  const C = c / g
  const t = randInt(2, 5)
  const total = (A + B + C) * t
  return buildQuestion({
    difficulty: 'hard',
    term: '三量比例连锁',
    hardTypeId: 'three-chain',
    passage: `甲、乙、丙三组人数比为 ${A}:${B}:${C}。已知三组合计 ${total} 人。`,
    stem: '乙组有多少人？',
    correct: String(B * t),
    distractors: uniqueNum(B * t, [A * t, C * t, total / 3, (A + B) * t].filter((x) => Number.isInteger(x))),
    method: 'A:B:C 最简份数之和去除总数；乙 = B/(A+B+C)×合计。合计是 (A+B+C) 的倍数。',
    explanation: `份数和=${A + B + C}，乙=${B}/${A + B + C}×${total}=${B * t}。`,
    seq,
  })
}

function genHardDecimalRatio(seq: number): RatioMultQuestion | null {
  const items: { text: string; m: number; n: number }[] = [
    { text: '0.25', m: 1, n: 4 },
    { text: '0.375', m: 3, n: 8 },
    { text: '0.125', m: 1, n: 8 },
    { text: '0.6', m: 3, n: 5 },
    { text: '0.4', m: 2, n: 5 },
    { text: '0.75', m: 3, n: 4 },
  ]
  const it = pickOne(items)
  const k = randInt(2, 7)
  const total = it.n * k
  return buildQuestion({
    difficulty: 'hard',
    term: '小数比化分数',
    hardTypeId: 'decimal-ratio',
    passage: `抽检合格率（合格数/抽检数）为 ${it.text}。已知合格 ${it.m * k} 件。`,
    stem: '抽检件数是？',
    correct: String(total),
    distractors: uniqueNum(total, optionsMultipleOf(total, it.n, [100, it.m * 10])),
    method: '小数化为最简分数，抽检数必为分母倍数。',
    explanation: `${it.text}=${it.m}/${it.n} ⇒ 抽检数是 ${it.n} 的倍数，得 ${total}。`,
    seq,
  })
}

function genHardDualOptions(seq: number): RatioMultQuestion | null {
  const [m1, n1] = pickOne([
    [2, 7],
    [3, 8],
    [2, 9],
    [4, 15],
  ] as [number, number][])
  const [m2, n2] = pickOne([
    [20, 21],
    [5, 6],
    [7, 8],
    [11, 12],
  ] as [number, number][])
  const den = lcm2(n1, n2)
  const k = randInt(2, 4)
  const correct = den * k
  const wrong = optionsMultipleOf(correct, den, [n1 * 12, n2 * 10, 140, 160, 200, 180])
  return buildQuestion({
    difficulty: 'hard',
    term: '双约束筛选项',
    hardTypeId: 'dual-options',
    passage: `仓库中，已发货占总库存的 ${m1}/${n1}，剩余库存占原计划库存的 ${m2}/${n2}（两比均最简）。原计划库存为下列某一正整数。`,
    stem: '原计划库存只可能是？',
    correct: String(correct),
    distractors: uniqueNum(correct, wrong),
    method: '两最简比 ⇒ 总量分别是两分母的倍数 ⇒ 是 LCM(分母) 的倍数，筛选项。',
    explanation: `约束分母 ${n1}、${n2}，LCM=${den}。只有 ${correct} 是 ${den} 的倍数。`,
    seq,
  })
}

function genHardLeaveBoardFinal(seq: number): RatioMultQuestion | null {
  const configs: { lm: number; ln: number; fm: number; fn: number; board: number; x: number }[] =
    []
  for (const [lm, ln] of [
    [2, 7],
    [1, 4],
    [1, 5],
    [2, 9],
    [3, 10],
    [1, 6],
  ] as [number, number][]) {
    for (const [fm, fn] of [
      [20, 21],
      [5, 6],
      [7, 8],
      [8, 9],
      [11, 12],
    ] as [number, number][]) {
      if (fm / fn <= (ln - lm) / ln) continue
      for (const t of [3, 4, 5, 6, 7, 8, 9]) {
        const x = lcm2(ln, fn) * t
        if (x % 10 !== 0) continue
        const board = x * (fm / fn - (ln - lm) / ln)
        if (!Number.isInteger(board) || board <= 0 || board > 120) continue
        configs.push({ lm, ln, fm, fn, board, x })
      }
    }
  }
  if (!configs.length) return null
  const t = pickOne(configs)
  const den = lcm2(t.ln, t.fn)
  return buildQuestion({
    difficulty: 'hard',
    term: '下车+上车+最终比',
    hardTypeId: 'leave-board-final',
    passage: `大巴从车站出发。到中途站下车人数为出发人数的 ${t.lm}/${t.ln}，随后又上来 ${t.board} 人，此时车上人数恰为出发人数的 ${t.fm}/${t.fn}。另知出发人数是 10 的倍数。`,
    stem: '出发时车上人数是？',
    correct: String(t.x),
    distractors: uniqueNum(t.x, optionsMultipleOf(t.x, den, [140, 160, 200, 210, den * 2])),
    method: '用最简分母得 LCM 倍数约束，并结合「是 10 的倍数」缩小范围，再代入验证。',
    explanation: `原人数是 ${t.ln} 与 ${t.fn} 的公倍数（及 10 的倍数）。验证得 ${t.x}：剩 ${(t.ln - t.lm) / t.ln}×${t.x}+${t.board}=${(t.fm / t.fn) * t.x}。`,
    seq,
  })
}

function genHardWhichMust(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS)
  const correct = `A+B 是 ${m + n} 的倍数`
  const distractors = uniqueStr(correct, [
    `A 是 ${n} 的倍数`,
    `B 是 ${m} 的倍数`,
    `A−B 是 ${m + n} 的倍数`,
    `A 是 ${m * n} 的倍数`,
  ])
  return buildQuestion({
    difficulty: 'hard',
    term: '选一定成立的结论',
    hardTypeId: 'which-must',
    stem: `正整数 A、B 满足 A:B=${m}:${n}（最简）。下列一定正确的是？`,
    correct,
    distractors,
    method: '互质时四条：A↔m，B↔n，和↔m+n，差↔|m−n|。',
    explanation: `只有「A+B 是 ${m + n} 的倍数」恒成立。`,
    seq,
  })
}

function genHardFindFromSum(seq: number): RatioMultQuestion | null {
  const [m, n] = pickOne(COPRIME_PAIRS)
  const k = randInt(4, 10)
  const sum = (m + n) * k
  const askFirst = Math.random() < 0.5
  const ans = askFirst ? m * k : n * k
  return buildQuestion({
    difficulty: 'hard',
    term: '已知和与比求一量',
    hardTypeId: 'find-from-sum',
    passage: `两数之和为 ${sum}，且两数之比为 ${m}:${n}。`,
    stem: askFirst ? `对应前项（比值 ${m} 的那一项）是？` : `对应后项（比值 ${n} 的那一项）是？`,
    correct: String(ans),
    distractors: uniqueNum(
      ans,
      [m * k, n * k, sum - ans, (m + n) * (k - 1), m * n].filter((x) => x !== ans && x > 0),
    ),
    method: '份数和去除总数；前项 = m/(m+n)×和，后项 = n/(m+n)×和。',
    explanation: `${sum}÷(${m}+${n})=${k}，所求=${ans}。`,
    seq,
  })
}

function genHardMixedPctFrac(seq: number): RatioMultQuestion | null {
  // total multiple of both denominators after simplifying pct and frac
  const frac: [number, number] = pickOne([
    [2, 7],
    [3, 8],
    [1, 6],
  ])
  const pct = pickOne([
    { text: '25%', m: 1, n: 4 },
    { text: '20%', m: 1, n: 5 },
    { text: '12.5%', m: 1, n: 8 },
  ])
  const den = lcm2(frac[1], pct.n)
  const k = randInt(2, 4)
  const total = den * k
  return buildQuestion({
    difficulty: 'hard',
    term: '百分数与分数混合',
    hardTypeId: 'mixed-pct-frac',
    passage: `某次普查：已登记人数占总目标的 ${frac[0]}/${frac[1]}，另有一批样本占总目标的 ${pct.text}。总目标人数为整数。`,
    stem: '总目标人数只可能是下列哪一个？',
    correct: String(total),
    distractors: uniqueNum(total, optionsMultipleOf(total, den, [frac[1] * 10, pct.n * 12, 100])),
    method: '百分数化最简分数后，总量须同时是两分母的倍数 → 取 LCM 筛选项。',
    explanation: `${pct.text}=${pct.m}/${pct.n}；与 ${frac[0]}/${frac[1]} 综合，总量是 LCM(${frac[1]},${pct.n})=${den} 的倍数，故选 ${total}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<RatioMultHardTypeId, (seq: number) => RatioMultQuestion | null> = {
  'ship-equation': genHardShipEquation,
  'pct-to-fraction': genHardPctToFraction,
  'need-simplify': genHardNeedSimplify,
  'sum-multiple': genHardSumMultiple,
  'diff-multiple': genHardDiffMultiple,
  'three-chain': genHardThreeChain,
  'decimal-ratio': genHardDecimalRatio,
  'dual-options': genHardDualOptions,
  'leave-board-final': genHardLeaveBoardFinal,
  'which-must': genHardWhichMust,
  'find-from-sum': genHardFindFromSum,
  'mixed-pct-frac': genHardMixedPctFrac,
}

function tryBuild(factory: () => RatioMultQuestion | null, maxTry = 30): RatioMultQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateRatioMultPaper(difficulty: RatioMultDifficulty): RatioMultQuestion[] {
  const out: RatioMultQuestion[] = []
  const seen = new Set<string>()

  const push = (q: RatioMultQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyAMultiple, genEasySumDiff, genEasyPickOption, genEasyMustTrue]
    let guard = 0
    while (out.length < RATIO_MULT_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumShipClassic(0),
      () => genMediumShipClassic(1),
      () => genMediumTwoRatioScreen(2),
      () => genMediumPartOfWhole(3),
      () => (Math.random() < 0.5 ? genMediumShipClassic(4) : genMediumTwoRatioScreen(4)),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < RATIO_MULT_QUESTION_COUNT && guard++ < 40) {
      push(tryBuild(() => genMediumShipClassic(out.length)))
    }
  } else {
    const types = shuffleInPlace([...RATIO_MULT_HARD_EXAM_TYPES.map((t) => t.id)]).slice(
      0,
      RATIO_MULT_QUESTION_COUNT,
    )
    for (const typeId of types) {
      const builder = HARD_BUILDERS[typeId]
      let q: RatioMultQuestion | null = null
      for (let t = 0; t < 35; t++) {
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

  if (out.length < RATIO_MULT_QUESTION_COUNT) {
    throw new Error(`由比例判定倍数组卷不足：仅 ${out.length}/${RATIO_MULT_QUESTION_COUNT}`)
  }
  return out.slice(0, RATIO_MULT_QUESTION_COUNT)
}
