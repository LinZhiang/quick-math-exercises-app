/**
 * 其他运算 · 年龄问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式/方法：
 * 【年龄差不变】无论过了多少年，两人年龄差始终不变。
 * 【同期同增】经过相同年份，各人年龄增加相同。
 * 【出生年】出生当年记为 0 岁；某年岁数 = 该年 − 出生年。
 * 【经典数轴】「当甲有乙现在的岁数时乙为 p；当乙有甲现在的岁数时甲为 q」
 *   → 数轴 p — 乙 — 甲 — q，三段等差，差 x=(q−p)/3；乙=p+x，甲=q−x。
 *
 * 【简单】比经典真题更直接
 * 【普通】对齐经典真题（数轴三段）
 * 【困难】高于例题；≥6 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type AgeDifficulty = 'easy' | 'medium' | 'hard'

export const AGE_QUESTION_COUNT = 5

export const AGE_MODES: {
  id: AgeDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '年龄 · 简单',
    desc: '每轮 5 题 · 比经典真题更直接（差不变、出生年、和差）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '年龄 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（数轴三段）及常见比值题 · 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '年龄 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const AGE_HARD_EXAM_TYPES = [
  { id: 'axis-plus', name: '数轴三段加强', note: '经典真题同构，端点更大' },
  { id: 'three-person-diff', name: '三人年龄差链', note: '甲乙丙差固定求一人' },
  { id: 'past-future-ratio', name: '过去未来双比值', note: 'n 年前与 m 年后各一比值' },
  { id: 'father-son', name: '父子年龄', note: '差不变 + 倍数关系' },
  { id: 'sum-after-years', name: '若干年后年龄和', note: '和随年数线性变化' },
  { id: 'birth-year-puzzle', name: '出生年反推', note: '由现年龄与年份关系求出生年' },
  { id: 'nested-when', name: '嵌套「当…时」', note: '两层「当甲有乙的年龄」' },
  { id: 'avg-age', name: '平均年龄', note: '多人平均随时间变化' },
] as const

export type AgeHardTypeId = (typeof AGE_HARD_EXAM_TYPES)[number]['id']

export type AgeQuestion = {
  id: string
  topic: 'age'
  difficulty: AgeDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: AgeHardTypeId
}

export function ageTopicLabel(): string {
  return '年龄问题'
}

export function ageDifficultyLabel(d: AgeDifficulty): string {
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

function uniqueStr(correct: string, cands: string[]): string[] {
  const out: string[] = []
  const seen = new Set([correct])
  for (const c of cands) {
    if (!c || seen.has(c)) continue
    seen.add(c)
    out.push(c)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3 && g < 40) {
    const fake = String(Number(correct) + g)
    g++
    if (seen.has(fake) || fake === 'NaN') continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: AgeDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: AgeHardTypeId
}): AgeQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'age',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `age-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'age',
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

function pairLabel(a: number, b: number): string {
  return `${a}、${b}`
}

// ——— 简单 ———

/** 出生年 → 现年龄 */
function genEasyBirthYear(seq: number): AgeQuestion | null {
  const birth = pickOne([1985, 1988, 1990, 1992, 1995, 2000])
  const year = pickOne([2018, 2020, 2024, 2025])
  if (year <= birth) return null
  const ans = year - birth
  return buildQuestion({
    difficulty: 'easy',
    term: '出生年求年龄',
    passage: `某人 ${birth} 年出生。`,
    stem: `${year} 年时此人多少岁？（出生当年记为 0 岁）`,
    correct: String(ans),
    distractors: [String(ans - 1), String(ans + 1), String(year - birth - 2), String(birth % 100)],
    method: [
      '出生当年为 0 岁：年龄 = 所问年份 − 出生年份。',
      `${year}−${birth}=${ans}。`,
    ].join('\n'),
    explanation: `${ans} 岁。`,
    seq,
  })
}

/** 年龄差不变 */
function genEasyDiffConstant(seq: number): AgeQuestion | null {
  const a = pickOne([30, 35, 40, 45])
  const b = pickOne([18, 20, 22, 25])
  if (a <= b) return null
  const diff = a - b
  const years = pickOne([5, 8, 10])
  return buildQuestion({
    difficulty: 'easy',
    term: '年龄差不变',
    passage: `甲今年 ${a} 岁，乙今年 ${b} 岁。`,
    stem: `${years} 年后两人的年龄差是多少岁？`,
    correct: String(diff),
    distractors: [String(diff + years), String(diff - years), String(a + years - b), String(years)],
    method: [
      '年龄差不变：无论过了多少年，甲−乙始终相同。',
      `差 = ${a}−${b}=${diff}（${years} 年后仍是 ${diff}）。`,
    ].join('\n'),
    explanation: `差仍为 ${diff} 岁。`,
    seq,
  })
}

/** 和差求年龄 */
function genEasySumDiff(seq: number): AgeQuestion | null {
  const diff = pickOne([4, 5, 6, 8])
  const young = pickOne([12, 15, 18, 20])
  const old = young + diff
  const sum = old + young
  return buildQuestion({
    difficulty: 'easy',
    term: '和差求两人年龄',
    passage: `甲、乙两人年龄之和为 ${sum} 岁，甲比乙大 ${diff} 岁。`,
    stem: '甲、乙今年各多少岁？',
    correct: pairLabel(old, young),
    distractors: [
      pairLabel(young, old),
      pairLabel(old + 1, young - 1),
      pairLabel(sum - diff, diff),
      pairLabel(Math.floor(sum / 2), Math.ceil(sum / 2)),
    ],
    method: [
      `甲 = (和 + 差)/2 = (${sum}+${diff})/2=${old}。`,
      `乙 = (和 − 差)/2 = (${sum}−${diff})/2=${young}。`,
    ].join('\n'),
    explanation: `甲 ${old} 岁，乙 ${young} 岁。`,
    seq,
  })
}

/** n 年前甲是乙的 2 倍（简单） */
function genEasyPastDouble(seq: number): AgeQuestion | null {
  for (let t = 0; t < 30; t++) {
    const n = pickOne([3, 4, 5])
    const bNow = pickOne([10, 12, 14, 15, 16])
    const aNow = 2 * (bNow - n) + n // n年前甲=2*乙 ⇒ a-n = 2(b-n) ⇒ a = 2b - n
    if (aNow <= bNow || aNow > 50) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '若干年前倍数',
      passage: `${n} 年前，甲的年龄是乙的 2 倍；乙今年 ${bNow} 岁。`,
      stem: '甲今年多少岁？',
      correct: String(aNow),
      distractors: [String(2 * bNow), String(2 * bNow - 2 * n), String(aNow + n), String(bNow + n)],
      method: [
        `${n} 年前乙为 ${bNow - n} 岁，甲为 2×${bNow - n}=${2 * (bNow - n)} 岁。`,
        `甲今年 = ${2 * (bNow - n)}+${n}=${aNow}。`,
        '（或：年龄差不变，差 = 甲−乙 = (2(b−n)+n)−b = b−n。）',
      ].join('\n'),
      explanation: `甲今年 ${aNow} 岁。`,
      seq,
    })
  }
  return null
}

/** m 年后甲是乙的 2 倍 */
function genEasyFutureDouble(seq: number): AgeQuestion | null {
  for (let t = 0; t < 30; t++) {
    const m = pickOne([2, 3, 4, 5])
    const bNow = pickOne([8, 10, 12, 14])
    // a+m = 2(b+m) ⇒ a = 2b + m
    const aNow = 2 * bNow + m
    if (aNow > 45) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '若干年后倍数',
      passage: `乙今年 ${bNow} 岁。再过 ${m} 年，甲的年龄将是乙的 2 倍。`,
      stem: '甲今年多少岁？',
      correct: String(aNow),
      distractors: [String(2 * bNow), String(2 * (bNow + m)), String(aNow - m), String(bNow + m)],
      method: [
        `${m} 年后乙为 ${bNow + m}，甲为 2×${bNow + m}=${2 * (bNow + m)}。`,
        `甲今年 = ${2 * (bNow + m)}−${m}=${aNow}。`,
      ].join('\n'),
      explanation: `甲今年 ${aNow} 岁。`,
      seq,
    })
  }
  return null
}

// ——— 普通 ———

/** 经典真题：数轴三段 */
function genMediumAxisClassic(seq: number): AgeQuestion | null {
  for (let t = 0; t < 40; t++) {
    const x = pickOne([2, 3, 4, 5])
    const p = pickOne([18, 20, 23, 24, 25]) // 过去乙的年龄
    const q = p + 3 * x // 未来甲的年龄
    if (q > 45 || q < 28) continue
    const b = p + x
    const a = q - x
    if (a <= b || a - b !== x) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '数轴三段（经典真题）',
      passage: `甲、乙年龄不同。当甲有乙现在的岁数时，乙是 ${p} 岁；当乙有甲现在的岁数时，甲是 ${q} 岁。`,
      stem: '甲、乙现在各多少岁？',
      correct: pairLabel(a, b),
      distractors: [
        pairLabel(a + 1, b - 1),
        pairLabel(q - p, p),
        pairLabel(b, a),
        pairLabel(a + x, b + x),
      ],
      method: [
        '数轴：过去乙 — 现在乙 — 现在甲 — 未来甲，即',
        `${p} — 乙 — 甲 — ${q}，三段间隔均为年龄差 x。`,
        `3x=${q}−${p}=${q - p} ⇒ x=${x}。`,
        `乙=${p}+${x}=${b}，甲=${q}−${x}=${a}。`,
      ].join('\n'),
      explanation: `甲 ${a} 岁，乙 ${b} 岁。`,
      seq,
    })
  }
  return null
}

/** 现在和与差 */
function genMediumSumDiffAsk(seq: number): AgeQuestion | null {
  const diff = pickOne([6, 7, 8, 9])
  const b = pickOne([20, 22, 24, 26])
  const a = b + diff
  const sum = a + b
  const years = pickOne([3, 5, 6])
  // ask ages n years ago sum
  const ans = sum - 2 * years
  return buildQuestion({
    difficulty: 'medium',
    term: '和差与若干年前',
    passage: `甲、乙现在年龄之和 ${sum} 岁，甲比乙大 ${diff} 岁。`,
    stem: `${years} 年前两人年龄之和是多少？`,
    correct: String(ans),
    distractors: [String(sum - years), String(sum), String(ans + diff), String(2 * (b - years))],
    method: [
      `每人减 ${years} 岁，和减 2×${years}=${2 * years}。`,
      `${sum}−${2 * years}=${ans}。`,
      `（差仍为 ${diff}，可验算甲=${a}、乙=${b}。）`,
    ].join('\n'),
    explanation: `${years} 年前年龄和为 ${ans}。`,
    seq,
  })
}

/** n 年前甲:乙 = k:1 */
function genMediumPastRatio(seq: number): AgeQuestion | null {
  for (let t = 0; t < 30; t++) {
    const n = pickOne([4, 5, 6])
    const k = pickOne([2, 3])
    const bNow = pickOne([15, 16, 18, 20, 21])
    // a-n = k(b-n) ⇒ a = k(b-n)+n
    const aNow = k * (bNow - n) + n
    if (aNow <= bNow || aNow > 55) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '若干年前定比',
      passage: `${n} 年前甲、乙年龄比为 ${k}:1，乙今年 ${bNow} 岁。`,
      stem: '甲今年多少岁？',
      correct: String(aNow),
      distractors: [String(k * bNow), String(k * (bNow - n)), String(aNow + n), String(bNow * k - n)],
      method: [
        `${n} 年前乙 ${bNow - n}，甲 ${k}×${bNow - n}=${k * (bNow - n)}。`,
        `甲今年 ${k * (bNow - n)}+${n}=${aNow}。`,
      ].join('\n'),
      explanation: `甲今年 ${aNow} 岁。`,
      seq,
    })
  }
  return null
}

/** m 年后甲:乙 = k:1 */
function genMediumFutureRatio(seq: number): AgeQuestion | null {
  for (let t = 0; t < 30; t++) {
    const m = pickOne([3, 4, 5])
    const k = pickOne([2, 3])
    const bNow = pickOne([10, 12, 14, 15])
    // a+m = k(b+m) ⇒ a = k(b+m)-m
    const aNow = k * (bNow + m) - m
    if (aNow <= bNow || aNow > 60) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '若干年后定比',
      passage: `乙今年 ${bNow} 岁。再过 ${m} 年，甲、乙年龄比为 ${k}:1。`,
      stem: '甲今年多少岁？',
      correct: String(aNow),
      distractors: [String(k * bNow), String(k * (bNow + m)), String(aNow + m), String(bNow * k + m)],
      method: [
        `${m} 年后乙 ${bNow + m}，甲 ${k}×${bNow + m}=${k * (bNow + m)}。`,
        `甲今年 ${k * (bNow + m)}−${m}=${aNow}。`,
      ].join('\n'),
      explanation: `甲今年 ${aNow} 岁。`,
      seq,
    })
  }
  return null
}

/** 已知差与「几年后相等」类——甲比乙大 d，问再过多少年甲是乙现在的年龄…简化：问乙到甲现年龄还需几年 = 差 */
function genMediumYearsToCatch(seq: number): AgeQuestion | null {
  const a = pickOne([28, 30, 32, 35])
  const b = pickOne([18, 20, 22, 24])
  if (a <= b) return null
  const diff = a - b
  // 再过多少年乙的年龄等于甲现在的年龄？ → diff 年
  return buildQuestion({
    difficulty: 'medium',
    term: '追到对方现年龄',
    passage: `甲今年 ${a} 岁，乙今年 ${b} 岁。`,
    stem: '再过多少年，乙的年龄等于甲现在的年龄？',
    correct: String(diff),
    distractors: [String(a - b - 1), String(Math.floor((a + b) / 2)), String(b), String(diff * 2)],
    method: [
      '乙要长到甲现在的岁数，还需增加的岁数 = 甲−乙。',
      `需要 ${a}−${b}=${diff} 年。（年龄差不变。）`,
    ].join('\n'),
    explanation: `再过 ${diff} 年。`,
    seq,
  })
}

// ——— 困难 ———

function genHardAxisPlus(seq: number): AgeQuestion | null {
  for (let t = 0; t < 40; t++) {
    const x = pickOne([4, 5, 6, 7])
    const p = pickOne([20, 22, 25, 28])
    const q = p + 3 * x
    if (q > 55) continue
    const b = p + x
    const a = q - x
    return buildQuestion({
      difficulty: 'hard',
      term: '数轴三段加强',
      hardTypeId: 'axis-plus',
      passage: `当甲有乙现在的岁数时，乙是 ${p} 岁；当乙有甲现在的岁数时，甲是 ${q} 岁。`,
      stem: '甲、乙现在年龄之和是多少？',
      correct: String(a + b),
      distractors: [String(p + q), String(a + b + x), String(q - p), String(2 * a)],
      method: [
        `数轴 ${p} — 乙 — 甲 — ${q}，3x=${q - p}，x=${x}。`,
        `乙=${b}，甲=${a}，和=${a + b}。`,
      ].join('\n'),
      explanation: `年龄和为 ${a + b}。`,
      seq,
    })
  }
  return null
}

function genHardThreePerson(seq: number): AgeQuestion | null {
  const c = pickOne([10, 12, 14])
  const dAB = pickOne([5, 6, 8])
  const dBC = pickOne([3, 4, 5])
  const b = c + dBC
  const a = b + dAB
  return buildQuestion({
    difficulty: 'hard',
    term: '三人年龄差链',
    hardTypeId: 'three-person-diff',
    passage: `甲比乙大 ${dAB} 岁，乙比丙大 ${dBC} 岁，丙今年 ${c} 岁。`,
    stem: '甲今年多少岁？',
    correct: String(a),
    distractors: [String(b), String(a + c), String(c + dAB), String(a - dBC)],
    method: [
      '年龄差可传递相加：甲−丙 = (甲−乙)+(乙−丙)。',
      `乙=${c}+${dBC}=${b}，甲=${b}+${dAB}=${a}。`,
    ].join('\n'),
    explanation: `甲 ${a} 岁。`,
    seq,
  })
}

function genHardPastFutureRatio(seq: number): AgeQuestion | null {
  for (let t = 0; t < 40; t++) {
    const n = pickOne([3, 4, 5])
    const m = pickOne([2, 3, 4])
    // n年前 a:b = 2:1；m年后 a:b = 3:2
    // a-n = 2(b-n)
    // 2(a+m) = 3(b+m)
    // From first: a = 2b - n
    // 2(2b-n+m)=3(b+m) ⇒ 4b -2n +2m = 3b +3m ⇒ b = 2n + m
    const b = 2 * n + m
    const a = 2 * b - n
    if (a <= b || a > 70 || b < 8) continue
    // verify second
    if (2 * (a + m) !== 3 * (b + m)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '过去未来双比值',
      hardTypeId: 'past-future-ratio',
      passage: `${n} 年前甲、乙年龄比为 2:1；再过 ${m} 年（从现在起），甲、乙年龄比为 3:2。`,
      stem: '甲、乙现在各多少岁？',
      correct: pairLabel(a, b),
      distractors: [
        pairLabel(a + 1, b - 1),
        pairLabel(2 * b, b),
        pairLabel(a, b + m),
        pairLabel(b, a),
      ],
      method: [
        `${n} 年前：a−${n}=2(b−${n}) ⇒ a=2b−${n}。`,
        `${m} 年后：2(a+${m})=3(b+${m})，代入得 b=${b}，a=${a}。`,
      ].join('\n'),
      explanation: `甲 ${a} 岁，乙 ${b} 岁。`,
      seq,
    })
  }
  return null
}

function genHardFatherSon(seq: number): AgeQuestion | null {
  for (let t = 0; t < 30; t++) {
    const diff = pickOne([24, 25, 26, 28])
    const n = pickOne([4, 5, 6])
    // n年前父是子的 k 倍
    const k = pickOne([3, 4])
    // f-n = k(s-n), f = s+diff
    // s+diff-n = k(s-n) ⇒ s+diff-n = ks - kn ⇒ s(k-1) = diff-n+kn = diff+n(k-1)
    // s = [diff + n(k-1)]/(k-1) = diff/(k-1) + n
    if (diff % (k - 1) !== 0) continue
    const s = diff / (k - 1) + n
    const f = s + diff
    if (s < 5 || f > 70) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '父子年龄',
      hardTypeId: 'father-son',
      passage: `父子年龄差 ${diff} 岁。${n} 年前父亲年龄是儿子的 ${k} 倍。`,
      stem: '儿子今年多少岁？',
      correct: String(s),
      distractors: [String(f), String(s + n), String(diff / (k - 1)), String(s - n)],
      method: [
        `差不变：父=子+${diff}。`,
        `${n} 年前：子+${diff}−${n}=${k}(子−${n})，解得子=${s}。`,
      ].join('\n'),
      explanation: `儿子今年 ${s} 岁。`,
      seq,
    })
  }
  return null
}

function genHardSumAfterYears(seq: number): AgeQuestion | null {
  const n = pickOne([3, 4, 5])
  const sum0 = pickOne([40, 45, 50, 55])
  const people = pickOne([2, 3])
  const sumLater = sum0 + people * n
  // 已知 n 年后和，求现在和；或反过来
  const askNow = pickOne([true, false])
  if (askNow) {
    return buildQuestion({
      difficulty: 'hard',
      term: '若干年后年龄和',
      hardTypeId: 'sum-after-years',
      passage: `${people} 人再过 ${n} 年，年龄之和为 ${sumLater} 岁。`,
      stem: '他们现在年龄之和是多少？',
      correct: String(sum0),
      distractors: [String(sumLater), String(sumLater - n), String(sum0 + n), String(sumLater / people)],
      method: [
        `每人增加 ${n} 岁，${people} 人共增加 ${people * n} 岁。`,
        `现在和 = ${sumLater}−${people * n}=${sum0}。`,
      ].join('\n'),
      explanation: `现在和为 ${sum0}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '若干年后年龄和',
    hardTypeId: 'sum-after-years',
    passage: `${people} 人现在年龄之和为 ${sum0} 岁。`,
    stem: `${n} 年后他们年龄之和是多少？`,
    correct: String(sumLater),
    distractors: [String(sum0 + n), String(sum0), String(sumLater + people), String(sum0 * n)],
    method: [
      `和的增加量 = 人数 × 年数 = ${people}×${n}=${people * n}。`,
      `${sum0}+${people * n}=${sumLater}。`,
    ].join('\n'),
    explanation: `${n} 年后和为 ${sumLater}。`,
    seq,
  })
}

function genHardBirthYear(seq: number): AgeQuestion | null {
  const year = pickOne([2020, 2024, 2025])
  const age = pickOne([28, 30, 32, 35, 40])
  const birth = year - age
  return buildQuestion({
    difficulty: 'hard',
    term: '出生年反推',
    hardTypeId: 'birth-year-puzzle',
    passage: `${year} 年某人满 ${age} 岁（按「年份差」计算，出生年记 0 岁）。`,
    stem: '此人出生于哪一年？',
    correct: String(birth),
    distractors: [String(birth + 1), String(birth - 1), String(year - age + 1), String(age)],
    method: [`出生年 = ${year}−${age}=${birth}。`].join('\n'),
    explanation: `出生于 ${birth} 年。`,
    seq,
  })
}

function genHardNestedWhen(seq: number): AgeQuestion | null {
  // 甲乙差 x；「当甲像乙这么大时」乙为 p —— 即经典前半；再给现在和
  for (let t = 0; t < 30; t++) {
    const x = pickOne([3, 4, 5, 6])
    const b = pickOne([20, 22, 24, 26])
    const a = b + x
    const p = b - x // 当甲有乙现在岁数时，乙的年龄
    if (p < 8) continue
    const sum = a + b
    return buildQuestion({
      difficulty: 'hard',
      term: '嵌套「当…时」',
      hardTypeId: 'nested-when',
      passage: `甲、乙现在年龄之和 ${sum} 岁。当甲有乙现在的岁数时，乙是 ${p} 岁。`,
      stem: '甲现在多少岁？',
      correct: String(a),
      distractors: [String(b), String(sum - p), String(p + x), String(a + p)],
      method: [
        '当甲长到乙现在的岁数，经过年数 = 年龄差 x，此时乙 = 乙现在 − x = p ⇒ x = 乙 − p。',
        `又甲 + 乙 = ${sum}，甲 = 乙 + x ⇒ 乙 = (${sum}+${p})/3 = ${b}，甲 = ${a}。`,
      ].join('\n'),
      explanation: `甲现在 ${a} 岁。`,
      seq,
    })
  }
  return null
}

function genHardAvgAge(seq: number): AgeQuestion | null {
  const people = pickOne([3, 4, 5])
  const avg0 = pickOne([20, 24, 28, 30])
  const n = pickOne([2, 3, 4])
  const avg1 = avg0 + n // 平均也每人 +n
  return buildQuestion({
    difficulty: 'hard',
    term: '平均年龄',
    hardTypeId: 'avg-age',
    passage: `${people} 人现在平均年龄 ${avg0} 岁。`,
    stem: `${n} 年后他们的平均年龄是多少岁？`,
    correct: String(avg1),
    distractors: [String(avg0), String(avg0 + people), String(avg0 + n * people), String(avg1 - 1)],
    method: [
      '每人增加相同年数，平均年龄也增加相同年数。',
      `${avg0}+${n}=${avg1}。`,
    ].join('\n'),
    explanation: `平均 ${avg1} 岁。`,
    seq,
  })
}

const HARD_BUILDERS: Record<AgeHardTypeId, (seq: number) => AgeQuestion | null> = {
  'axis-plus': genHardAxisPlus,
  'three-person-diff': genHardThreePerson,
  'past-future-ratio': genHardPastFutureRatio,
  'father-son': genHardFatherSon,
  'sum-after-years': genHardSumAfterYears,
  'birth-year-puzzle': genHardBirthYear,
  'nested-when': genHardNestedWhen,
  'avg-age': genHardAvgAge,
}

function tryBuild(factory: () => AgeQuestion | null, maxTry = 40): AgeQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type AgeFactory = {
  key: string
  build: (seq: number) => AgeQuestion | null
}

export function generateAgePaper(difficulty: AgeDifficulty): AgeQuestion[] {
  const out: AgeQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: AgeQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: AgeFactory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= AGE_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < AGE_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'birth-year', build: genEasyBirthYear },
      { key: 'diff-const', build: genEasyDiffConstant },
      { key: 'sum-diff', build: genEasySumDiff },
      { key: 'past-double', build: genEasyPastDouble },
      { key: 'future-double', build: genEasyFutureDouble },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'axis-classic', build: genMediumAxisClassic },
      { key: 'sum-diff-ago', build: genMediumSumDiffAsk },
      { key: 'past-ratio', build: genMediumPastRatio },
      { key: 'future-ratio', build: genMediumFutureRatio },
      { key: 'years-catch', build: genMediumYearsToCatch },
    ])
  } else {
    const used = new Set<AgeHardTypeId>()
    const types = shuffleInPlace([...AGE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= AGE_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = AGE_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < AGE_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : AGE_HARD_EXAM_TYPES.map((x) => x.id)
      const typeId = pickOne(pool)
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30), typeId)
      if (out.length > before) {
        used.add(typeId)
        const idx = remain.indexOf(typeId)
        if (idx >= 0) remain.splice(idx, 1)
      }
    }
  }

  return out.slice(0, AGE_QUESTION_COUNT)
}
