/**
 * 运算技巧 · 整除及其性质 · 整除的判定
 * 本地程序出题（不调用 AI）。每轮 7 题四选一。
 *
 * 【困难题型库 · 事业编/公考高频，每轮各 1 题】
 * 1. quotients-sum：商之和求原数
 * 2. unknown-digit：双空挖空（数对/填法/两空之和）
 * 3. compound-div：①②③④ 中哪些/有几个符合复合整除条件
 * 4. add-sub-property：可加减性（含挖空）
 * 5. pass-property：因子必然性（含计数）
 * 6. multi-divisor-lcm：多因子 LCM（含最小三位数挖空）
 * 7. last-digits：可变除数「能被/不能被/有几个」（无提示词）
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type DivJudgeDifficulty = 'easy' | 'medium' | 'hard'

export const DIV_JUDGE_QUESTION_COUNT = 7

export const DIV_JUDGE_MODES: {
  id: DivJudgeDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '整除的判定 · 简单',
    desc: '每轮 7 题 · 2/3/5/6/9 整除判定 · 「谁能被整除 / 能被谁整除」· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '整除的判定 · 普通',
    desc: '每轮 7 题 · 7/11/14/15 与半满足干扰 · 需动笔验算 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '整除的判定 · 困难',
    desc: '每轮 7 题 · 对标/难于经典真题 · 7 类考点各一题 · 强干扰选项 · 正计时停表看答案',
  },
]

/** 困难题型登记（出题与攻略共用；每轮困难卷各出 1 题） */
export const DIV_JUDGE_HARD_EXAM_TYPES = [
  {
    id: 'quotients-sum',
    name: '商之和求原数（经典真题 1 加强）',
    note: '列式求四位数或数位和；干扰为错解/错倍',
  },
  {
    id: 'unknown-digit',
    name: '双空挖空判定',
    note: '数中挖两个空，选项为数对或填法，需同时满足整除条件',
  },
  {
    id: 'compound-div',
    name: '哪些数符合条件',
    note: '给出若干候选，问有几个/哪几个同时满足复合整除条件',
  },
  {
    id: 'add-sub-property',
    name: '可加减性应用',
    note: '由和差反推；「一定成立」多语句辨析',
  },
  {
    id: 'pass-property',
    name: '因子必然性（传递加强）',
    note: '能被 15/21 等整除时，哪些结论一定对',
  },
  {
    id: 'multi-divisor-lcm',
    name: '多因子·LCM 应用',
    note: '「一定能被谁整除」；干扰为相关但非恒除数',
  },
  {
    id: 'last-digits',
    name: '可变除数·谁能被整除',
    note: '除数在 8/9/11/12/14/15/18/24/36/45/72 等间轮换；无提示词；强半满足干扰',
  },
] as const

export type DivJudgeHardTypeId = (typeof DIV_JUDGE_HARD_EXAM_TYPES)[number]['id']

export type DivJudgeQuestion = {
  id: string
  topic: 'div-judge'
  difficulty: DivJudgeDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: DivJudgeHardTypeId
}

export function divJudgeTopicLabel(): string {
  return '整除的判定'
}

export function divJudgeDifficultyLabel(d: DivJudgeDifficulty): string {
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

function digitSum(n: number): number {
  return String(Math.abs(n))
    .split('')
    .reduce((s, c) => s + Number(c), 0)
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

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

function lcm3(a: number, b: number, c: number): number {
  return lcm(lcm(a, b), c)
}

function makeDivisible(d: number, min: number, max: number): number {
  for (let t = 0; t < 40; t++) {
    let n = randInt(min, max)
    n = Math.floor(n / d) * d
    if (n < min) n += d
    if (n >= min && n <= max && n % d === 0 && n !== 0) return n
  }
  return d * Math.max(1, Math.ceil(min / d))
}

function makeNotDivisible(d: number, min: number, max: number): number {
  for (let t = 0; t < 60; t++) {
    const n = randInt(min, max)
    if (n % d !== 0) return n
  }
  return min % d === 0 ? min + 1 : min
}

function buildQ(input: {
  difficulty: DivJudgeDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: DivJudgeHardTypeId
  seq: number
}): DivJudgeQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'div-judge',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `div-judge-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'div-judge',
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

/** —— 简单 / 中等：判定类 —— */

type EasyDivisor = 2 | 3 | 5 | 6 | 9
type MediumDivisor = 6 | 7 | 9 | 11 | 14 | 15

function ruleHint(d: number): string {
  if (d === 2) return '看末位是否为偶数'
  if (d === 3) return '各位数字之和能被 3 整除'
  if (d === 4) return '末两位数能被 4 整除'
  if (d === 5) return '末位是 0 或 5'
  if (d === 6) return '同时能被 2 和 3 整除'
  if (d === 7) return '末三位数与前面部分之差能被 7 整除（也可直接除）'
  if (d === 8) return '末三位数能被 8 整除'
  if (d === 9) return '各位数字之和能被 9 整除'
  if (d === 11) return '奇偶位数字之和的差为 0 或能被 11 整除'
  if (d === 14) return '同时能被 2 和 7 整除'
  if (d === 15) return '同时能被 3 和 5 整除'
  if (d === 12) return '同时能被 3 和 4 整除'
  if (d === 18) return '同时能被 2 和 9 整除'
  if (d === 22) return '同时能被 2 和 11 整除'
  if (d === 24) return '同时能被 3 和 8 整除'
  if (d === 36) return '同时能被 4 和 9 整除'
  if (d === 45) return '同时能被 5 和 9 整除'
  if (d === 72) return '同时能被 8 和 9 整除'
  return `能被 ${d} 整除则余数为 0`
}

/** 半满足干扰：看起来「差一点」就能整除 */
function makeNearMiss(d: number, min: number, max: number): number {
  for (let t = 0; t < 80; t++) {
    let w: number
    if (d === 6) {
      if (Math.random() < 0.5) {
        w = makeDivisible(2, min, max)
        if (w % 3 === 0) w += 2
      } else {
        w = makeDivisible(3, min, max)
        if (w % 2 === 0) w += 3
      }
    } else if (d === 14) {
      w = Math.random() < 0.5 ? makeDivisible(2, min, max) : makeDivisible(7, min, max)
      if (w % 14 === 0) w += 2
    } else if (d === 15) {
      w = Math.random() < 0.5 ? makeDivisible(3, min, max) : makeDivisible(5, min, max)
      if (w % 15 === 0) w += 5
    } else if (d === 9) {
      w = makeDivisible(3, min, max)
      if (w % 9 === 0) w += 3
    } else if (d === 11) {
      w = makeNotDivisible(11, min, max)
      // 尽量让交替和接近 11 的倍数
    } else {
      w = makeNotDivisible(d, min, max)
    }
    if (w >= min && w <= max && w % d !== 0) return w
  }
  return makeNotDivisible(d, min, max)
}

function uniqueDistractors(correct: number, cands: number[], need = 3): string[] {
  const out: string[] = []
  const seen = new Set<string>([String(correct)])
  for (const n of cands) {
    const s = String(n)
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= need) break
  }
  let guard = 0
  while (out.length < need && guard++ < 40) {
    const n = correct + pickOne([-3, -2, -1, 1, 2, 3, 7, 11, 14]) * pickOne([1, 2, 3])
    if (n <= 0 || seen.has(String(n))) continue
    seen.add(String(n))
    out.push(String(n))
  }
  return out.slice(0, need)
}

function genWhichDivisibleBy(
  difficulty: 'easy' | 'medium',
  d: number,
  seq: number,
): DivJudgeQuestion | null {
  const [min, max] = difficulty === 'easy' ? [100, 999] : [10000, 999999]
  const correct = makeDivisible(d, min, max)
  const wrongs: number[] = []
  if (difficulty === 'medium') {
    while (wrongs.length < 3) {
      const w = makeNearMiss(d, min, max)
      if (w !== correct && !wrongs.includes(w)) wrongs.push(w)
    }
  } else {
    while (wrongs.length < 3) {
      const w = makeNotDivisible(d, min, max)
      if (w !== correct && !wrongs.includes(w)) wrongs.push(w)
    }
  }
  return buildQ({
    difficulty,
    term: `能被${d}整除`,
    stem: `下列哪个数能被 ${d} 整除？`,
    correct: String(correct),
    distractors: uniqueDistractors(correct, wrongs),
    method: ruleHint(d),
    explanation: `${correct}÷${d}=${correct / d}，余数为 0。判定：${ruleHint(d)}。干扰项常只满足部分条件。答案为 ${correct}。`,
    seq,
  })
}

function genCanNBeDivBy(
  difficulty: 'easy' | 'medium',
  d: number,
  seq: number,
): DivJudgeQuestion | null {
  if (difficulty === 'medium') {
    // 中等不用弱「能/不能」三干扰，改成带验算要点的四选一结论
    return genMediumMustTrue(d, seq)
  }
  const [min, max] = [100, 999]
  const yes = Math.random() < 0.55
  const n = yes ? makeDivisible(d, min, max) : makeNotDivisible(d, min, max)
  const correct = yes ? '能' : '不能'
  return buildQ({
    difficulty,
    term: `${n}被${d}整除？`,
    stem: `${n} 能否被 ${d} 整除？`,
    correct,
    distractors: yes ? ['不能', '无法判断', '只能被 1 整除'] : ['能', '无法判断', '与整除无关'],
    method: ruleHint(d),
    explanation: yes
      ? `${n}÷${d}=${n / d}。${ruleHint(d)}。答案为能。`
      : `${n}÷${d} 余 ${n % d}，不能整除。${ruleHint(d)}。答案为不能。`,
    seq,
  })
}

/** 中等：给出一个大数，问「下列说法正确的是」 */
function genMediumMustTrue(d: number, seq: number): DivJudgeQuestion | null {
  const n = makeDivisible(d, 20000, 800000)
  const ds = digitSum(n)
  const correct = `${n} 能被 ${d} 整除`
  const distractors = [
    `${n} 不能被 ${d} 整除`,
    `各位数字之和为 ${ds + 1}，故不能被 ${d === 9 || d === 3 ? d : 3} 整除`,
    d === 14 || d === 6 || d === 15
      ? `${n} 只需满足「能被 ${d === 14 ? 2 : d === 6 ? 2 : 5} 整除」即可被 ${d} 整除`
      : `${n} 末三位能被 ${d} 整除就一定整体能被 ${d} 整除`,
  ]
  return buildQ({
    difficulty: 'medium',
    term: `结论辨析·${d}`,
    passage: `已知正整数 ${n}。`,
    stem: '下列说法正确的是？',
    correct,
    distractors,
    method: ruleHint(d),
    explanation: `${n}÷${d}=${n / d}，故能被 ${d} 整除。${ruleHint(d)}。答案为「${correct}」。`,
    seq,
  })
}

function genNDivisibleByWhich(
  difficulty: 'easy' | 'medium',
  seq: number,
): DivJudgeQuestion | null {
  const pool: number[] =
    difficulty === 'easy' ? [2, 3, 5, 6, 9] : [6, 7, 9, 11, 14, 15]
  const [min, max] = difficulty === 'easy' ? [120, 900] : [12000, 900000]
  const target = pickOne(pool)
  // 构造只被 target 整除、尽量不被其它候选整除的数
  let n = makeDivisible(target, min, max)
  for (let t = 0; t < 30; t++) {
    const clash = pool.filter((d) => d !== target && n % d === 0)
    if (clash.length === 0) break
    n = makeDivisible(target, min, max)
  }
  const others = shuffleInPlace(
    pool.filter((d) => d !== target && n % d !== 0),
  ).slice(0, 3)
  while (others.length < 3) {
    const fake = pickOne([4, 8, 10, 12, 13, 16, 21, 22, 25].filter((x) => n % x !== 0))
    if (!others.includes(fake) && fake !== target) others.push(fake)
  }
  return buildQ({
    difficulty,
    term: `${n}能被谁整除`,
    stem: `${n} 一定能被下列哪个数整除？`,
    correct: String(target),
    distractors: others.slice(0, 3).map(String),
    method: ruleHint(target),
    explanation: `${n}÷${target}=${n / target}。${ruleHint(target)}。答案为 ${target}。`,
    seq,
  })
}

/** 中等：四个形态相近的数，挑出能被 d 整除的 */
function genMediumPickAmongNear(seq: number): DivJudgeQuestion | null {
  const d = pickOne([7, 11, 14, 15] as const)
  const correct = makeDivisible(d, 100000, 999999)
  const wrongs = [
    makeNearMiss(d, 100000, 999999),
    makeNearMiss(d, 100000, 999999),
    makeNearMiss(d, 100000, 999999),
  ]
  return buildQ({
    difficulty: 'medium',
    term: `近邻四选一·${d}`,
    stem: `下列哪个数能被 ${d} 整除？`,
    correct: String(correct),
    distractors: uniqueDistractors(correct, wrongs),
    method: ruleHint(d),
    explanation: `${correct}÷${d}=${correct / d}。其余选项对 ${d} 只满足部分判定条件。答案为 ${correct}。`,
    seq,
  })
}

function genEasyMediumPaper(difficulty: 'easy' | 'medium'): DivJudgeQuestion[] {
  const easyD: EasyDivisor[] = [2, 3, 5, 6, 9]
  const medD: MediumDivisor[] = [6, 7, 9, 11, 14, 15]
  const divisors = difficulty === 'easy' ? easyD : medD
  const out: DivJudgeQuestion[] = []
  let seq = 1
  if (difficulty === 'easy') {
    const plan: Array<'which' | 'can' | 'by-which'> = shuffleInPlace([
      'which',
      'which',
      'can',
      'can',
      'by-which',
      'by-which',
      'which',
    ])
    for (const kind of plan) {
      if (out.length >= DIV_JUDGE_QUESTION_COUNT) break
      const d = pickOne(divisors)
      let q: DivJudgeQuestion | null = null
      if (kind === 'which') q = genWhichDivisibleBy('easy', d, seq++)
      else if (kind === 'can') q = genCanNBeDivBy('easy', d, seq++)
      else q = genNDivisibleByWhich('easy', seq++)
      if (q) out.push(q)
    }
  } else {
    const plan: Array<'which' | 'near' | 'by-which' | 'must'> = shuffleInPlace([
      'which',
      'near',
      'near',
      'by-which',
      'by-which',
      'must',
      'must',
    ])
    for (const kind of plan) {
      if (out.length >= DIV_JUDGE_QUESTION_COUNT) break
      const d = pickOne(medD)
      let q: DivJudgeQuestion | null = null
      if (kind === 'which') q = genWhichDivisibleBy('medium', d, seq++)
      else if (kind === 'near') q = genMediumPickAmongNear(seq++)
      else if (kind === 'by-which') q = genNDivisibleByWhich('medium', seq++)
      else q = genMediumMustTrue(d, seq++)
      if (q) out.push(q)
    }
  }
  while (out.length < DIV_JUDGE_QUESTION_COUNT) {
    const q =
      difficulty === 'easy'
        ? genWhichDivisibleBy('easy', pickOne(easyD), seq++)
        : genMediumPickAmongNear(seq++)
    if (q) out.push(q)
    else break
  }
  return out.slice(0, DIV_JUDGE_QUESTION_COUNT)
}

/** —— 困难：7 种题型，每轮各一，对标/难于经典真题 —— */

function genHardQuotientsSum(seq: number): DivJudgeQuestion | null {
  const triples: [number, number, number][] = [
    [15, 12, 10],
    [12, 18, 8],
    [10, 15, 6],
    [14, 21, 6],
    [9, 12, 18],
  ]
  const [a, b, c] = pickOne(triples)
  const L = lcm3(a, b, c)
  let k = randInt(3, 15)
  let x = L * k
  while (x < 1000) {
    k += 1
    x = L * k
  }
  while (x > 9999) {
    k -= 1
    x = L * k
  }
  if (x < 1000 || x > 9999) {
    k = Math.max(2, Math.floor(4500 / L))
    x = L * k
  }
  const sumQ = x / a + x / b + x / c
  // 问四位数本身；干扰：错用商和公式、相邻倍数、各位和误当作答案
  const digitSumAns = digitSum(x)
  const wrongK1 = L * (k + 1)
  const wrongK2 = L * Math.max(1, k - 1)
  const wrongAlgebra = Math.round(sumQ / (1 / a + 1 / b + 1 / c + 0.01)) // 略偏
  const distractors = uniqueDistractors(x, [
    wrongK1 > 9999 ? L * (k - 2) : wrongK1,
    wrongK2 < 1000 ? L * (k + 2) : wrongK2,
    digitSumAns * 100 + (x % 100), // 把数位和掺进数里的形似干扰
    a * b * c,
    Math.floor(sumQ * ((a + b + c) / 3)),
    wrongAlgebra,
  ].filter((n) => n !== x && n >= 1000 && n <= 99999))

  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'quotients-sum',
    term: '商之和·求原数',
    passage: `有一个四位数，它分别能被 ${a}、${b}、${c} 整除，且除得的三个商之和为 ${sumQ}。`,
    stem: '这个四位数是？',
    correct: String(x),
    distractors,
    method: `设该数为 x：x(1/${a}+1/${b}+1/${c})=${sumQ}，即 x=${x}（亦为 ${L} 的倍数）`,
    explanation: `设该数为 x，则 x/${a}+x/${b}+x/${c}=${sumQ} ⇒ x×(${(b * c + a * c + a * b) / (a * b * c)})=${sumQ}，解得 x=${x}。亦先求 lcm(${a},${b},${c})=${L}，再找满足商和的倍数。答案为 ${x}。`,
    seq,
  })
}

function genHardUnknownDigit(seq: number): DivJudgeQuestion | null {
  // 双空：形如 a□b○c，同时被 9 整除（各位和）且末两位被 4 整除（○与末位组成末两位时）
  // 更清晰：五位数 AB□C○ —— □、○ 为两个未知数字；要求整个数被 9 整除，且末两位 C○ 被 4 整除
  const A = randInt(1, 9)
  const B = randInt(0, 9)
  const C = randInt(0, 9)
  // 枚举 ○∈0..9 使 10*C+○ 被 4 整除，再找 □ 使各位和被 9 整除
  const validPairs: Array<{ x: number; y: number }> = []
  for (let y = 0; y <= 9; y++) {
    if ((10 * C + y) % 4 !== 0) continue
    const base = A + B + C + y
    for (let x = 0; x <= 9; x++) {
      if ((base + x) % 9 === 0) validPairs.push({ x, y })
    }
  }
  if (validPairs.length === 0) return null
  const ans = pickOne(validPairs)
  // 干扰：只满足一个条件的数对
  const badPairs: Array<{ x: number; y: number }> = []
  for (let x = 0; x <= 9 && badPairs.length < 8; x++) {
    for (let y = 0; y <= 9 && badPairs.length < 8; y++) {
      if (x === ans.x && y === ans.y) continue
      const sumOk = (A + B + x + C + y) % 9 === 0
      const lastOk = (10 * C + y) % 4 === 0
      if (sumOk !== lastOk) badPairs.push({ x, y }) // 只满足其一
    }
  }
  shuffleInPlace(badPairs)
  const fmt = (p: { x: number; y: number }) => `(${p.x}, ${p.y})`
  const distractors = badPairs.slice(0, 3).map(fmt)
  while (distractors.length < 3) {
    const x = randInt(0, 9)
    const y = randInt(0, 9)
    const s = fmt({ x, y })
    if (s !== fmt(ans) && !distractors.includes(s)) distractors.push(s)
  }
  const shown = `${A}${B}□${C}○`
  const full = Number(`${A}${B}${ans.x}${C}${ans.y}`)
  const askMode = pickOne(['pair', 'sum', 'which-fill'] as const)
  if (askMode === 'sum') {
    const correctSum = ans.x + ans.y
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'unknown-digit',
      term: '双空·和',
      passage: `五位数 ${shown} 能被 9 整除，且末两位数能被 4 整除。□、○ 均表示 0～9 的数字。`,
      stem: '若存在满足条件的填法，则 □+○ 可以是？',
      correct: String(correctSum),
      distractors: uniqueDistractors(
        correctSum,
        validPairs
          .filter((p) => p.x + p.y !== correctSum)
          .map((p) => p.x + p.y)
          .concat([correctSum + 1, correctSum - 1, correctSum + 2, ans.x, ans.y]),
      ),
      method: '末两位定 ○，各位和定 □，再求 □+○',
      explanation: `末两位 ${C}${ans.y} 能被 4 整除；各位和须被 9 整除得 □=${ans.x}。故 □+○=${correctSum}（完整数 ${full}）。答案为 ${correctSum}。`,
      seq,
    })
  }
  if (askMode === 'which-fill') {
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'unknown-digit',
      term: '双空·填法',
      passage: `五位数 ${shown} 须同时满足：能被 9 整除，且末两位数能被 4 整除。`,
      stem: '下列哪种填法正确？',
      correct: `□=${ans.x}，○=${ans.y}`,
      distractors: distractors.slice(0, 3).map((s) => {
        const m = s.match(/\((\d+), (\d+)\)/)
        return m ? `□=${m[1]}，○=${m[2]}` : s
      }),
      method: '两空联动：○ 影响末两位与各位和，□ 只影响各位和',
      explanation: `检验：${full}÷9=${full / 9}，末两位 ${10 * C + ans.y}÷4=${(10 * C + ans.y) / 4}。答案为 □=${ans.x}，○=${ans.y}。`,
      seq,
    })
  }
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'unknown-digit',
    term: '双空·数对',
    passage: `五位数 ${shown} 能被 9 整除，且末两位数能被 4 整除。□、○ 表示待填数字。`,
    stem: '下列哪一组 (□, ○) 符合条件？',
    correct: fmt(ans),
    distractors,
    method: '先筛末两位被 4 整除的 ○，再筛各位和被 9 整除的 □',
    explanation: `正确填法使数为 ${full}。答案为 ${fmt(ans)}。`,
    seq,
  })
}

function genHardCompound(seq: number): DivJudgeQuestion | null {
  // 「哪些数符合」：给出 ①②③④，问有几个能同时被 d 整除且各位和能被 3 整除
  const d = pickOne([12, 14, 15, 18] as const)
  const goods: number[] = []
  const bads: number[] = []
  for (let t = 0; t < 80 && goods.length < 2; t++) {
    let n = makeDivisible(d, 10000, 999999)
    if (digitSum(n) % 3 === 0 && !goods.includes(n)) goods.push(n)
  }
  for (let t = 0; t < 80 && bads.length < 3; t++) {
    // 半满足
    let n =
      Math.random() < 0.5
        ? makeDivisible(d, 10000, 999999)
        : makeNearMiss(d, 10000, 999999)
    if (n % d === 0 && digitSum(n) % 3 === 0) continue
    if (!bads.includes(n) && !goods.includes(n)) bads.push(n)
  }
  while (goods.length < 1) {
    const n = makeDivisible(d, 10000, 999999)
    if (digitSum(n) % 3 === 0) goods.push(n)
  }
  while (bads.length < 3) bads.push(makeNearMiss(d, 10000, 999999))
  // 组装 4 个编号项：恰好 k 个合格，k=1 或 2
  const k = goods.length >= 2 && Math.random() < 0.55 ? 2 : 1
  const pickedGood = shuffleInPlace([...goods]).slice(0, k)
  const pickedBad = shuffleInPlace([...bads]).slice(0, 4 - k)
  const items = shuffleInPlace([...pickedGood, ...pickedBad])
  const labels = ['①', '②', '③', '④']
  const passageLines = items
    .map((n, i) => `${labels[i]} ${n}`)
    .join('；')
  const goodIdx = items
    .map((n, i) => (pickedGood.includes(n) ? labels[i] : null))
    .filter(Boolean) as string[]
  const mode = pickOne(['count', 'which'] as const)
  if (mode === 'count') {
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'compound-div',
      term: `符合条件个数·${d}`,
      passage: `下列四个数：${passageLines}。`,
      stem: `其中既能被 ${d} 整除、又满足各位数字之和能被 3 整除的有几个？`,
      correct: `${k} 个`,
      distractors: ['0 个', '1 个', '2 个', '3 个', '4 个']
        .filter((s) => s !== `${k} 个`)
        .slice(0, 3),
      method: `逐个检验：被 ${d} 整除 + 各位和被 3 整除`,
      explanation: `符合条件的是 ${goodIdx.join('、') || '无'}，共 ${k} 个。答案为 ${k} 个。`,
      seq,
    })
  }
  const correctLabel =
    goodIdx.length === 1
      ? `只有${goodIdx[0]}`
      : `只有${goodIdx.join('和')}`
  const distractorLabels = [
    '只有①',
    '只有②',
    '①②③',
    '①②③④',
    `只有${labels.find((l) => !goodIdx.includes(l)) ?? '④'}`,
  ].filter((s) => s !== correctLabel)
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'compound-div',
    term: `哪些符合·${d}`,
    passage: `下列四个数：${passageLines}。`,
    stem: `既能被 ${d} 整除、又满足各位数字之和能被 3 整除的是？`,
    correct: correctLabel,
    distractors: distractorLabels.slice(0, 3),
    method: `逐个检验复合条件`,
    explanation: `符合的是 ${goodIdx.join('、')}。答案为 ${correctLabel}。`,
    seq,
  })
}

function genHardAddSub(seq: number): DivJudgeQuestion | null {
  const c = pickOne([7, 9, 11])
  let a = makeDivisible(c, 80, 400)
  let b = makeDivisible(c, 50, 350)
  while (a === b) b = makeDivisible(c, 50, 350)
  if (a < b) [a, b] = [b, a]
  const sum = a + b
  const diff = a - b
  const mode = pickOne(['infer-b', 'must', 'blank-diff'] as const)
  if (mode === 'blank-diff') {
    // 挖空：M=□，已知 M 与 N 都能被 c 整除，M−N=diff，问 □
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'add-sub-property',
      term: '可加减性·挖空',
      passage: `已知正整数 □ 与 ${b} 都能被 ${c} 整除，且 □−${b}=${diff}。`,
      stem: '□ 中的数是？',
      correct: String(a),
      distractors: uniqueDistractors(a, [b, diff, sum, a + c, a - c, b + diff]),
      method: '□=N+差；两数均被 c 整除则差也被 c 整除可作检验',
      explanation: `□=${b}+${diff}=${a}，且 ${a}÷${c}=${a / c}。答案为 ${a}。`,
      seq,
    })
  }
  if (mode === 'infer-b') {
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'add-sub-property',
      term: '可加减性·反推',
      passage: `已知正整数 M=${a}、N 均能被 ${c} 整除，且 M−N=${diff}。`,
      stem: 'N 等于？',
      correct: String(b),
      distractors: uniqueDistractors(b, [diff, sum, a + diff, b + c, Math.abs(a - 2 * diff)]),
      method: 'N=M−(M−N)',
      explanation: `N=${a}−${diff}=${b}。答案为 ${b}。`,
      seq,
    })
  }
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'add-sub-property',
    term: '可加减性·一定成立',
    passage: `已知 ${a} 与 ${b} 都能被 ${c} 整除（两数不相等）。`,
    stem: '下列一定成立的是？',
    correct: `${sum} 与 ${diff} 都能被 ${c} 整除`,
    distractors: [
      `${sum + 1} 一定能被 ${c} 整除`,
      `${a}×${b} 一定不能被 ${c} 整除`,
      `只有 ${sum} 能被 ${c} 整除，${diff} 不能`,
    ],
    method: '可加减性：和、差均被同一数整除',
    explanation: `${sum}÷${c}=${sum / c}，${diff}÷${c}=${diff / c}。答案为「${sum} 与 ${diff} 都能被 ${c} 整除」。`,
    seq,
  })
}

function genHardPass(seq: number): DivJudgeQuestion | null {
  const specs: { d: number; must: number[]; notSure: number[] }[] = [
    { d: 15, must: [3, 5], notSure: [6, 10, 30, 45] },
    { d: 21, must: [3, 7], notSure: [6, 14, 42, 9] },
    { d: 35, must: [5, 7], notSure: [10, 14, 70, 21] },
    { d: 33, must: [3, 11], notSure: [6, 22, 66, 9] },
  ]
  const spec = pickOne(specs)
  const must = pickOne(spec.must)
  const trap = pickOne(spec.notSure)
  const mode = pickOne(['must-true', 'how-many'] as const)
  if (mode === 'how-many') {
    // 给出若干结论，问有几条一定正确
    const statements = [
      { text: `n 一定能被 ${must} 整除`, ok: true },
      { text: `n 一定能被 ${trap} 整除`, ok: false },
      { text: `n 一定能被 ${spec.must.find((x) => x !== must) ?? must} 整除`, ok: true },
      { text: `n 的各位数字之和一定能被 ${spec.d} 整除`, ok: false },
    ]
    const okCount = statements.filter((s) => s.ok).length
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'pass-property',
      term: `因子必然性·计数·${spec.d}`,
      passage: `若正整数 n 能被 ${spec.d} 整除，考虑下列说法：\n${statements.map((s, i) => `${i + 1}. ${s.text}`).join('\n')}`,
      stem: '其中一定正确的说法有几条？',
      correct: `${okCount} 条`,
      distractors: ['1 条', '2 条', '3 条', '4 条'].filter((s) => s !== `${okCount} 条`).slice(0, 3),
      method: `${spec.d} 的因子一定能整除 n；复合数如 ${trap} 不一定`,
      explanation: `一定成立的是：${statements
        .filter((s) => s.ok)
        .map((s) => s.text)
        .join('；')}。共 ${okCount} 条。答案为 ${okCount} 条。`,
      seq,
    })
  }
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'pass-property',
    term: `因子必然性·${spec.d}`,
    passage: `若正整数 n 能被 ${spec.d} 整除。`,
    stem: '下列结论一定正确的是？',
    correct: `n 一定能被 ${must} 整除`,
    distractors: [
      `n 一定能被 ${trap} 整除`,
      `n 一定不能被 ${must} 整除`,
      `n 的各位数字之和一定能被 ${spec.d} 整除`,
    ],
    method: `${spec.d} 含因子 ${spec.must.join('、')}；但不一定能被 ${trap} 整除`,
    explanation: `n 能被 ${spec.d} 整除 ⇒ 能被 ${must} 整除。取 n=${spec.d} 可说明「一定能被 ${trap}」不成立。答案为「n 一定能被 ${must} 整除」。`,
    seq,
  })
}

function genHardLcm(seq: number): DivJudgeQuestion | null {
  const triples: [number, number, number][] = [
    [6, 8, 12],
    [4, 6, 8],
    [3, 5, 6],
    [4, 5, 6],
    [6, 9, 12],
  ]
  const [a, b, c] = pickOne(triples)
  const L = lcm3(a, b, c)
  const half = L % 2 === 0 ? L / 2 : a * b
  const lab = lcm(a, b)
  const distractors = uniqueDistractors(L, [
    2 * L,
    a * b,
    lab === L ? a * c : lab,
    half === L ? L + a : half,
    a * b * c,
    L + a,
  ].filter((n) => n > 1 && n !== L))

  const mode = pickOne(['must-div', 'min-blank'] as const)
  if (mode === 'min-blank') {
    // 挖空：最小的能同时被 a,b,c 整除的三位数是 □□□
    let min3 = L
    while (min3 < 100) min3 += L
    if (min3 > 999) min3 = L // fallback
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'multi-divisor-lcm',
      term: '多因子·最小挖空',
      passage: `正整数 □□□（三位数）能同时被 ${a}、${b}、${c} 整除，且是满足条件的最小三位数。`,
      stem: '□□□ 中的数是？',
      correct: String(min3),
      distractors: uniqueDistractors(min3, [
        L,
        min3 + L,
        a * b,
        lab,
        2 * L,
        min3 - L > 99 ? min3 - L : min3 + 2 * L,
      ]),
      method: `最小公倍数 lcm=${L}，再取 ≥100 的最小倍数`,
      explanation: `lcm(${a},${b},${c})=${L}，最小三位数倍数为 ${min3}。答案为 ${min3}。`,
      seq,
    })
  }

  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'multi-divisor-lcm',
    term: '多因子·一定能被',
    stem: `一个数同时能被 ${a}、${b}、${c} 整除，则它一定能被下列哪个数整除？`,
    correct: String(L),
    distractors,
    method: `同时被三者整除 ⇔ 被 lcm=${L} 整除`,
    explanation: `最小公倍数为 ${L}。不一定能被 ${2 * L} 整除（反例取 ${L}）。答案为 ${L}。`,
    seq,
  })
}

/** 可变除数的「下列哪个能被 xx 整除」——无提示词，半满足干扰 */
function genHardLastDigits(seq: number): DivJudgeQuestion | null {
  const divisors = [8, 9, 11, 12, 14, 15, 18, 22, 24, 36, 45, 72] as const
  const d = pickOne(divisors)
  const correct = makeDivisible(d, 10000, 999999)
  const wrongs: number[] = []
  // 按除数构造半满足干扰
  const pushNear = (w: number) => {
    if (w !== correct && w % d !== 0 && !wrongs.includes(w)) wrongs.push(w)
  }
  for (let t = 0; t < 100 && wrongs.length < 3; t++) {
    if (d === 8) {
      // 末三位不能被 8
      const head = randInt(10, 999)
      const last = makeNotDivisible(8, 100, 999)
      pushNear(head * 1000 + last)
    } else if (d === 9 || d === 18 || d === 45 || d === 36) {
      pushNear(makeNearMiss(d === 9 ? 9 : 3, 10000, 999999))
      if (d !== 9) {
        const w = makeDivisible(d === 18 || d === 36 ? 9 : 5, 10000, 999999)
        if (w % d !== 0) pushNear(w)
      }
    } else if (d === 11 || d === 22) {
      pushNear(makeNotDivisible(11, 10000, 999999))
      if (d === 22) {
        const w = makeDivisible(11, 10000, 999999)
        if (w % 2 !== 0) pushNear(w)
      }
    } else if (d === 12) {
      // 被 3 不被 4，或被 4 不被 3
      let w = makeDivisible(3, 10000, 999999)
      if (w % 4 === 0) w += 3
      pushNear(w)
      w = makeDivisible(4, 10000, 999999)
      if (w % 3 === 0) w += 4
      pushNear(w)
    } else if (d === 14) {
      pushNear(makeNearMiss(14, 10000, 999999))
    } else if (d === 15) {
      pushNear(makeNearMiss(15, 10000, 999999))
    } else if (d === 24) {
      let w = makeDivisible(8, 10000, 999999)
      if (w % 3 === 0) w += 8
      pushNear(w)
      w = makeDivisible(3, 10000, 999999)
      if (w % 8 === 0) w += 3
      pushNear(w)
    } else if (d === 72) {
      let w = makeDivisible(8, 10000, 999999)
      if (w % 9 === 0) w += 8
      pushNear(w)
      w = makeDivisible(9, 10000, 999999)
      if (w % 8 === 0) w += 9
      pushNear(w)
    } else {
      pushNear(makeNearMiss(d, 10000, 999999))
    }
  }
  while (wrongs.length < 3) pushNear(makeNotDivisible(d, 10000, 999999))

  const askMode = pickOne(['which', 'count-four', 'not-which'] as const)
  if (askMode === 'count-four') {
    const pool = shuffleInPlace([correct, ...wrongs.slice(0, 3)])
    // 确保只有 1 个正确
    const uniq = [...new Set(pool)].slice(0, 4)
    while (uniq.length < 4) uniq.push(makeNotDivisible(d, 10000, 999999))
    const cnt = uniq.filter((n) => n % d === 0).length
    // 若意外多个正确，重建
    if (cnt !== 1) {
      const only = [correct, ...uniqueDistractors(correct, wrongs).map(Number)].slice(0, 4)
      const labels = only.map((n, i) => `${['①', '②', '③', '④'][i]} ${n}`).join('；')
      return buildQ({
        difficulty: 'hard',
        hardTypeId: 'last-digits',
        term: `可变除数·计数·${d}`,
        passage: `下列四个数：${labels}。`,
        stem: `其中能被 ${d} 整除的有几个？`,
        correct: '1 个',
        distractors: ['0 个', '2 个', '3 个'],
        method: ruleHint(d),
        explanation: `仅 ${correct} 能被 ${d} 整除（${correct}÷${d}=${correct / d}）。答案为 1 个。`,
        seq,
      })
    }
    const labels = uniq.map((n, i) => `${['①', '②', '③', '④'][i]} ${n}`).join('；')
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'last-digits',
      term: `可变除数·计数·${d}`,
      passage: `下列四个数：${labels}。`,
      stem: `其中能被 ${d} 整除的有几个？`,
      correct: `${cnt} 个`,
      distractors: ['0 个', '1 个', '2 个', '3 个', '4 个']
        .filter((s) => s !== `${cnt} 个`)
        .slice(0, 3),
      method: ruleHint(d),
      explanation: `逐个用判定法检验。答案为 ${cnt} 个。`,
      seq,
    })
  }
  if (askMode === 'not-which') {
    const cannot = wrongs[0]!
    const canList: number[] = [correct]
    for (let t = 0; t < 40 && canList.length < 3; t++) {
      const w = makeDivisible(d, 10000, 999999)
      if (w !== cannot && !canList.includes(w)) canList.push(w)
    }
    return buildQ({
      difficulty: 'hard',
      hardTypeId: 'last-digits',
      term: `可变除数·不能被·${d}`,
      stem: `下列哪个数不能被 ${d} 整除？`,
      correct: String(cannot),
      distractors: canList.slice(0, 3).map(String),
      method: ruleHint(d),
      explanation: `${cannot}÷${d} 余 ${cannot % d}，不能整除。其余选项均可被 ${d} 整除。答案为 ${cannot}。`,
      seq,
    })
  }
  return buildQ({
    difficulty: 'hard',
    hardTypeId: 'last-digits',
    term: `可变除数·能被·${d}`,
    stem: `下列哪个数能被 ${d} 整除？`,
    correct: String(correct),
    distractors: uniqueDistractors(correct, wrongs),
    method: ruleHint(d),
    explanation: `${correct}÷${d}=${correct / d}。${ruleHint(d)}。干扰项多为半满足条件。答案为 ${correct}。`,
    seq,
  })
}

const HARD_GENERATORS: Record<
  DivJudgeHardTypeId,
  (seq: number) => DivJudgeQuestion | null
> = {
  'quotients-sum': genHardQuotientsSum,
  'unknown-digit': genHardUnknownDigit,
  'compound-div': genHardCompound,
  'add-sub-property': genHardAddSub,
  'pass-property': genHardPass,
  'multi-divisor-lcm': genHardLcm,
  'last-digits': genHardLastDigits,
}

function genHardPaper(): DivJudgeQuestion[] {
  // 固定 7 类各一题，再打乱顺序
  const types = [...DIV_JUDGE_HARD_EXAM_TYPES.map((t) => t.id)]
  const out: DivJudgeQuestion[] = []
  let seq = 1
  for (const id of types) {
    let q: DivJudgeQuestion | null = null
    for (let attempt = 0; attempt < 6 && !q; attempt++) {
      q = HARD_GENERATORS[id](seq)
    }
    seq += 1
    if (q) out.push(q)
  }
  shuffleInPlace(out)
  while (out.length < DIV_JUDGE_QUESTION_COUNT) {
    const q = genHardCompound(seq++)
    if (!q) break
    out.push(q)
  }
  return out.slice(0, DIV_JUDGE_QUESTION_COUNT)
}

/** 生成本轮 7 题 */
export function generateDivisibilityJudgePaper(
  difficulty: DivJudgeDifficulty,
): DivJudgeQuestion[] {
  if (difficulty === 'hard') return genHardPaper()
  return genEasyMediumPaper(difficulty)
}
