/**
 * 其他运算 · 盈亏问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材表格公式（对象数 = 盈亏相关差 ÷ 两次分配量之差）：
 * - 一盈一尽：盈 ÷ 分配差
 * - 一亏一尽：亏 ÷ 分配差
 * - 一盈一亏：(盈+亏) ÷ 分配差
 * - 两次皆盈：(大盈−小盈) ÷ 分配差
 * - 两次皆亏：(大亏−小亏) ÷ 分配差
 * 求出对象数后再代回任一情形求总量。
 *
 * 【简单】比经典真题更直接（一盈一尽 / 一亏一尽等）
 * 【普通】对齐经典真题（一盈一亏，含「差一点」化亏）
 * 【困难】高于例题；≥6 变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type YingKuiDifficulty = 'easy' | 'medium' | 'hard'

export const YING_KUI_QUESTION_COUNT = 5

export const YING_KUI_MODES: {
  id: YingKuiDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '盈亏 · 简单',
    desc: '每轮 5 题 · 比经典真题更易（一盈一尽、一亏一尽等）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '盈亏 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（一盈一亏）及表格各型 · 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '盈亏 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

export const YING_KUI_HARD_EXAM_TYPES = [
  { id: 'surplus-deficit-plus', name: '一盈一亏加强', note: '经典真题同构，数字更大/需先化亏' },
  { id: 'two-surplus-ask-total', name: '两次皆盈求总量', note: '先求对象再求总量' },
  { id: 'two-deficit-ask-n', name: '两次皆亏求对象', note: '大亏小亏差÷分配差' },
  { id: 'three-condition', name: '三组分配条件', note: '两两校验或选两组求解' },
  { id: 'ask-each-amount', name: '反求每人份数', note: '已知对象与盈亏反推分配量' },
  { id: 'mixed-unit', name: '班组/箱装综合', note: '对象不是「人」的变体情境' },
  { id: 'surplus-then-change', name: '分配量变化二次', note: '先盈尽再改条件' },
  { id: 'deficit-as-partial', name: '末组不足化亏', note: '「最后一组只分到 k」化亏' },
] as const

export type YingKuiHardTypeId = (typeof YING_KUI_HARD_EXAM_TYPES)[number]['id']

export type YingKuiQuestion = {
  id: string
  topic: 'ying-kui'
  difficulty: YingKuiDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: YingKuiHardTypeId
}

export function yingKuiTopicLabel(): string {
  return '盈亏问题'
}

export function yingKuiDifficultyLabel(d: YingKuiDifficulty): string {
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
  difficulty: YingKuiDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: YingKuiHardTypeId
}): YingKuiQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'ying-kui',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `yk-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'ying-kui',
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

/** 构造：n 个对象，每人 a 个盈 s；或每人 b 个…… */
function totalFrom(n: number, each: number, surplus: number): number {
  return n * each + surplus
}

// ——— 简单 ———

/** 一盈一尽：每人 a 剩 s；每人 b 刚好分完 → n = s/(b-a) */
function genEasySurplusExact(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([3, 4, 5, 6])
    const b = a + pickOne([1, 2])
    const n = pickOne([5, 6, 7, 8, 9, 10])
    const s = n * (b - a) // 盈，使得 b 时刚好尽
    if (s <= 0 || s > 40) continue
    const total = totalFrom(n, a, s)
    // 验：n*b = total
    if (n * b !== total) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '一盈一尽',
      passage: `若干个苹果分给若干人。每人分 ${a} 个，还剩 ${s} 个；每人分 ${b} 个，刚好分完。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(s), String(b - a), String(total), String(n + 1)],
      method: [
        '一盈一尽：对象数 = 盈 ÷ 两次分配量之差。',
        `人数 = ${s}÷(${b}−${a})=${n}。`,
        `验算总量：${a}×${n}+${s}=${total}；${b}×${n}=${total}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

/** 一亏一尽 */
function genEasyDeficitExact(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([4, 5, 6, 7])
    const b = a + pickOne([1, 2])
    const n = pickOne([5, 6, 7, 8, 9])
    const d = n * (b - a) // 亏：每人 a 时差 d 个才够
    // 每人 a 亏 d ⇒ total = n*a - d；每人 b 刚好 ⇒ total = n*b
    // n*a - d = n*b ⇒ d = n(a-b) negative if a<b
    // 正确：每人多拿的是 b，尽在 b；每人 a 时亏：total = n*b，每人 a 需要 n*a，亏 = n*a - total = n(a-b) < 0 means surplus
    // 一亏一尽：每人 a 刚好尽；每人 b 亏 d → n = d/(b-a)，total = n*a
    const deficit = n * (b - a)
    const total = n * a
    // 每人 b：差 deficit
    if (n * b - total !== deficit) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '一亏一尽',
      passage: `分糖果。每人分 ${a} 颗刚好分完；每人分 ${b} 颗则少 ${deficit} 颗。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(deficit), String(b - a), String(total), String(n + 2)],
      method: [
        '一亏一尽：对象数 = 亏 ÷ 两次分配量之差。',
        `人数 = ${deficit}÷(${b}−${a})=${n}。`,
        `总量 = ${a}×${n}=${total}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

/** 两次皆盈（简单数字） */
function genEasyTwoSurplus(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([2, 3, 4])
    const b = a + pickOne([1, 2])
    const n = pickOne([4, 5, 6, 7, 8])
    const sSmall = pickOne([2, 3, 4, 5])
    const sLarge = sSmall + n * (b - a)
    // 每人 a 盈 sLarge；每人 b 盈 sSmall：total = n*a+sLarge = n*b+sSmall
    const total = n * a + sLarge
    if (n * b + sSmall !== total) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '两次皆盈',
      passage: `每人分 ${a} 个还剩 ${sLarge} 个；每人分 ${b} 个还剩 ${sSmall} 个。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(sLarge - sSmall), String(b - a), String(total), String(sLarge)],
      method: [
        '两次皆盈：对象数 = (大盈−小盈) ÷ 分配差。',
        `人数 = (${sLarge}−${sSmall})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

/** 两次皆亏（简单） */
function genEasyTwoDeficit(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([3, 4, 5])
    const b = a + pickOne([1, 2])
    const n = pickOne([4, 5, 6, 7, 8])
    const dSmall = pickOne([2, 3, 4])
    const dLarge = dSmall + n * (b - a)
    // 每人 a 亏 dSmall；每人 b 亏 dLarge：total = n*a - dSmall = n*b - dLarge
    const total = n * a - dSmall
    if (total <= 0) continue
    if (n * b - dLarge !== total) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '两次皆亏',
      passage: `每人分 ${a} 个少 ${dSmall} 个；每人分 ${b} 个少 ${dLarge} 个。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(dLarge - dSmall), String(total), String(b - a), String(n + 1)],
      method: [
        '两次皆亏：对象数 = (大亏−小亏) ÷ 分配差。',
        `人数 = (${dLarge}−${dSmall})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

/** 一盈一尽后求总量 */
function genEasyAskTotal(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([3, 4, 5])
    const b = a + pickOne([1, 2])
    const n = pickOne([6, 7, 8, 9])
    const s = n * (b - a)
    const total = n * b
    return buildQuestion({
      difficulty: 'easy',
      term: '一盈一尽求总量',
      passage: `每人分 ${a} 本还剩 ${s} 本；每人分 ${b} 本刚好分完。`,
      stem: '这批书一共多少本？',
      correct: String(total),
      distractors: [String(n), String(n * a + s), String(s * b), String(total + a)],
      method: [
        `人数 = ${s}÷(${b}−${a})=${n}（一盈一尽）。`,
        `总量 = ${b}×${n}=${total}（或 ${a}×${n}+${s}）。`,
      ].join('\n'),
      explanation: `共 ${total} 本。`,
      seq,
    })
  }
  return null
}

// ——— 普通 ———

/** 经典真题：一盈一亏（末组不足化亏） */
function genMediumClassic(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 50; t++) {
    const a = pickOne([7, 8, 9, 10])
    const b = a + pickOne([2, 3])
    const n = pickOne([6, 7, 8, 9, 10])
    const surplus = pickOne([4, 5, 6, 8])
    // total = n*a + surplus
    // 每人 b：差 deficit = n*b - total = n*(b-a) - surplus
    const deficit = n * (b - a) - surplus
    if (deficit <= 0 || deficit > 30) continue
    const total = n * a + surplus
    // 表述：每人 b 时，有一个部门只分到 k 个，k = b - deficit? 
    // classic: 11 each, one dept only 1 → short by 10 for that dept, i.e. overall deficit 10
    // partial = b - deficit if deficit < b, meaning one unit got partial
    if (deficit >= b) continue
    const partial = b - deficit
    if (partial < 1 || partial >= b) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '一盈一亏（经典真题）',
      passage: `一批打印纸发给各部门。每个部门发 ${a} 包还剩 ${surplus} 包；每个部门发 ${b} 包，则有一个部门只分到 ${partial} 包。`,
      stem: '这批打印纸一共多少包？',
      correct: String(total),
      distractors: [
        String(total + (b - a)),
        String(n * b),
        String((surplus + deficit) * (b - a)),
        String(n * a),
      ],
      method: [
        `第二种情形：若每部门 ${b} 包，差 ${b}−${partial}=${deficit} 包 → 亏 ${deficit}。`,
        '一盈一亏：对象数 = (盈+亏) ÷ 分配差。',
        `部门数 = (${surplus}+${deficit})÷(${b}−${a})=${n}。`,
        `总量 = ${a}×${n}+${surplus}=${total}。`,
      ].join('\n'),
      explanation: `一共 ${total} 包。`,
      seq,
    })
  }
  return null
}

function genMediumSurplusDeficit(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([5, 6, 7, 8])
    const b = a + pickOne([2, 3, 4])
    const n = pickOne([5, 6, 7, 8, 9])
    const surplus = pickOne([3, 4, 5, 6])
    const deficit = n * (b - a) - surplus
    if (deficit <= 0) continue
    const total = n * a + surplus
    return buildQuestion({
      difficulty: 'medium',
      term: '一盈一亏求人数',
      passage: `每人分 ${a} 个还多 ${surplus} 个；每人分 ${b} 个则少 ${deficit} 个。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(surplus + deficit), String(b - a), String(total), String(n + 1)],
      method: [
        '一盈一亏：对象数 = (盈+亏) ÷ 分配差。',
        `人数 = (${surplus}+${deficit})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

function genMediumTwoSurplusTotal(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([4, 5, 6])
    const b = a + pickOne([2, 3])
    const n = pickOne([6, 7, 8, 9])
    const sSmall = pickOne([2, 3, 4])
    const sLarge = sSmall + n * (b - a)
    const total = n * a + sLarge
    return buildQuestion({
      difficulty: 'medium',
      term: '两次皆盈求总量',
      passage: `每人 ${a} 个剩 ${sLarge} 个；每人 ${b} 个剩 ${sSmall} 个。`,
      stem: '物品一共多少个？',
      correct: String(total),
      distractors: [String(n), String(sLarge - sSmall), String(n * b + sSmall), String(total - a)],
      method: [
        `人数 = (${sLarge}−${sSmall})÷(${b}−${a})=${n}。`,
        `总量 = ${a}×${n}+${sLarge}=${total}。`,
      ].join('\n'),
      explanation: `共 ${total} 个。`,
      seq,
    })
  }
  return null
}

function genMediumTwoDeficitN(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([5, 6, 7])
    const b = a + pickOne([2, 3])
    const n = pickOne([5, 6, 7, 8, 9])
    const dSmall = pickOne([2, 3, 4, 5])
    const dLarge = dSmall + n * (b - a)
    const total = n * a - dSmall
    if (total <= 0) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '两次皆亏求对象',
      passage: `每班发 ${a} 本少 ${dSmall} 本；每班发 ${b} 本少 ${dLarge} 本。`,
      stem: '一共有多少个班？',
      correct: String(n),
      distractors: [String(dLarge - dSmall), String(total), String(b - a), String(n + 2)],
      method: [
        '两次皆亏：对象数 = (大亏−小亏) ÷ 分配差。',
        `班数 = (${dLarge}−${dSmall})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 个班。`,
      seq,
    })
  }
  return null
}

function genMediumSurplusExactTotal(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([6, 8, 10])
    const b = a + pickOne([2, 4])
    const n = pickOne([5, 6, 7, 8])
    const s = n * (b - a)
    const total = n * b
    return buildQuestion({
      difficulty: 'medium',
      term: '一盈一尽求总量',
      passage: `每组 ${a} 瓶还多 ${s} 瓶；每组 ${b} 瓶刚好发完。`,
      stem: '这批饮料一共多少瓶？',
      correct: String(total),
      distractors: [String(n), String(n * a + s), String(s), String(total + b)],
      method: [
        `组数 = ${s}÷(${b}−${a})=${n}。`,
        `总量 = ${b}×${n}=${total}。`,
      ].join('\n'),
      explanation: `共 ${total} 瓶。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardSurplusDeficitPlus(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 40; t++) {
    const a = pickOne([12, 15, 18])
    const b = a + pickOne([3, 4, 5])
    const n = pickOne([10, 12, 14, 15])
    const surplus = pickOne([8, 10, 12, 15])
    const deficit = n * (b - a) - surplus
    if (deficit <= 1 || deficit >= b) continue
    const partial = b - deficit
    const total = n * a + surplus
    return buildQuestion({
      difficulty: 'hard',
      term: '一盈一亏加强',
      hardTypeId: 'surplus-deficit-plus',
      passage: `物资下发：每单位 ${a} 件剩 ${surplus} 件；每单位 ${b} 件时，有一个单位只领到 ${partial} 件。`,
      stem: '物资一共多少件？',
      correct: String(total),
      distractors: [String(n * b), String(total + deficit), String((surplus + deficit) / (b - a)), String(n)],
      method: [
        `化亏：差 ${b}−${partial}=${deficit}。`,
        `单位数 = (${surplus}+${deficit})÷(${b}−${a})=${n}，总量 ${total}。`,
      ].join('\n'),
      explanation: `一共 ${total} 件。`,
      seq,
    })
  }
  return null
}

function genHardTwoSurplusTotal(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([8, 9, 10, 12])
    const b = a + pickOne([3, 4, 5])
    const n = pickOne([9, 10, 12, 15])
    const sSmall = pickOne([3, 4, 5, 6])
    const sLarge = sSmall + n * (b - a)
    const total = n * a + sLarge
    return buildQuestion({
      difficulty: 'hard',
      term: '两次皆盈求总量',
      hardTypeId: 'two-surplus-ask-total',
      passage: `按甲方案每人 ${a} 个剩 ${sLarge}；按乙方案每人 ${b} 个剩 ${sSmall}。`,
      stem: '物品总数是多少？',
      correct: String(total),
      distractors: [String(n), String(sLarge - sSmall), String(n * b), String(total - sSmall)],
      method: [
        `人数 = (${sLarge}−${sSmall})÷(${b}−${a})=${n}。`,
        `总量 = ${a}×${n}+${sLarge}=${total}。`,
      ].join('\n'),
      explanation: `共 ${total} 个。`,
      seq,
    })
  }
  return null
}

function genHardTwoDeficitN(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([8, 10, 12])
    const b = a + pickOne([3, 4])
    const n = pickOne([8, 9, 10, 12])
    const dSmall = pickOne([4, 5, 6, 8])
    const dLarge = dSmall + n * (b - a)
    const total = n * a - dSmall
    if (total <= 10) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '两次皆亏求对象',
      hardTypeId: 'two-deficit-ask-n',
      passage: `每校发 ${a} 套少 ${dSmall} 套；每校发 ${b} 套少 ${dLarge} 套。`,
      stem: '一共有多少所学校？',
      correct: String(n),
      distractors: [String(dLarge - dSmall), String(total), String(n + 1), String(b - a)],
      method: [
        `学校数 = (${dLarge}−${dSmall})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 所。`,
      seq,
    })
  }
  return null
}

function genHardThreeCondition(seq: number): YingKuiQuestion | null {
  // 三组：a 盈 s1；b 尽；c 亏 d —— 用前两组求 n，第三组验算
  for (let t = 0; t < 40; t++) {
    const a = pickOne([4, 5, 6])
    const b = a + pickOne([1, 2])
    const c = b + pickOne([1, 2])
    const n = pickOne([6, 7, 8, 9])
    const s = n * (b - a)
    const total = n * b
    const deficit = n * c - total
    if (deficit <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三组分配条件',
      hardTypeId: 'three-condition',
      passage: `每人 ${a} 个剩 ${s} 个；每人 ${b} 个刚好分完；每人 ${c} 个少 ${deficit} 个。`,
      stem: '一共有多少人？',
      correct: String(n),
      distractors: [String(s), String(deficit), String(total), String(n + c - b)],
      method: [
        '任取两组，如一盈一尽：',
        `人数 = ${s}÷(${b}−${a})=${n}。`,
        `再用第三组验：${c}×${n}−总量 ${total}=${deficit}。`,
      ].join('\n'),
      explanation: `共 ${n} 人。`,
      seq,
    })
  }
  return null
}

function genHardAskEach(seq: number): YingKuiQuestion | null {
  // 已知人数 n，每人 a 盈 s，问改成刚好分完每人应分多少 → b = (n*a+s)/n = a + s/n
  for (let t = 0; t < 30; t++) {
    const n = pickOne([5, 6, 8, 10])
    const a = pickOne([3, 4, 5, 6])
    const extra = pickOne([1, 2]) // 每人多拿 extra 则尽？ 一盈一尽：s = n*extra, b = a+extra
    const s = n * extra
    const b = a + extra
    return buildQuestion({
      difficulty: 'hard',
      term: '反求每人份数',
      hardTypeId: 'ask-each-amount',
      passage: `已知有 ${n} 人。每人分 ${a} 个还剩 ${s} 个。`,
      stem: '若要刚好分完，每人应分多少个？',
      correct: String(b),
      distractors: [String(a), String(s), String(a + s), String(b + 1)],
      method: [
        '总量 = 人数×原分配 + 盈。',
        `总量 = ${n}×${a}+${s}=${n * a + s}，每人应分 (${n * a + s})÷${n}=${b}。`,
        '（或：一盈一尽，分配差 = 盈÷人数 = ${s}÷${n}=${extra}，故 ${a}+${extra}=${b}。）',
      ].join('\n'),
      explanation: `每人应分 ${b} 个。`,
      seq,
    })
  }
  return null
}

function genHardMixedUnit(seq: number): YingKuiQuestion | null {
  for (let t = 0; t < 30; t++) {
    const a = pickOne([20, 24, 25, 30])
    const b = a + pickOne([5, 6, 8])
    const n = pickOne([6, 8, 10, 12])
    const surplus = pickOne([10, 12, 16, 18])
    const deficit = n * (b - a) - surplus
    if (deficit <= 0) continue
    const total = n * a + surplus
    return buildQuestion({
      difficulty: 'hard',
      term: '班组/箱装综合',
      hardTypeId: 'mixed-unit',
      passage: `零件装箱：每箱装 ${a} 个还多 ${surplus} 个；每箱装 ${b} 个则少 ${deficit} 个。`,
      stem: '这些零件一共多少个？',
      correct: String(total),
      distractors: [String(n), String(n * b), String(surplus + deficit), String(total - surplus)],
      method: [
        `箱数 = (${surplus}+${deficit})÷(${b}−${a})=${n}。`,
        `总量 = ${a}×${n}+${surplus}=${total}。`,
      ].join('\n'),
      explanation: `共 ${total} 个。`,
      seq,
    })
  }
  return null
}

function genHardSurplusThenChange(seq: number): YingKuiQuestion | null {
  // 先一盈一尽得 n、total；再问：若每人再多拿 1 个，会亏多少
  for (let t = 0; t < 30; t++) {
    const a = pickOne([5, 6, 7])
    const b = a + pickOne([2, 3])
    const n = pickOne([6, 7, 8, 9])
    const s = n * (b - a)
    const total = n * b
    const c = b + pickOne([1, 2])
    const newDeficit = n * c - total
    if (newDeficit <= 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '分配量变化二次',
      hardTypeId: 'surplus-then-change',
      passage: `每人 ${a} 个剩 ${s} 个；每人 ${b} 个刚好分完。`,
      stem: `若改为每人 ${c} 个，会少多少个？`,
      correct: String(newDeficit),
      distractors: [String(n), String(s), String(c - b), String(n * (c - a))],
      method: [
        `先求人数 = ${s}÷(${b}−${a})=${n}，总量 ${total}。`,
        `每人 ${c}：需要 ${n}×${c}=${n * c}，少 ${n * c}−${total}=${newDeficit}。`,
      ].join('\n'),
      explanation: `会少 ${newDeficit} 个。`,
      seq,
    })
  }
  return null
}

function genHardDeficitPartial(seq: number): YingKuiQuestion | null {
  // same as classic but ask n not total, larger numbers
  for (let t = 0; t < 40; t++) {
    const a = pickOne([10, 12, 14])
    const b = a + pickOne([2, 3, 4])
    const n = pickOne([9, 10, 11, 12])
    const surplus = pickOne([6, 8, 9, 10])
    const deficit = n * (b - a) - surplus
    if (deficit <= 0 || deficit >= b) continue
    const partial = b - deficit
    return buildQuestion({
      difficulty: 'hard',
      term: '末组不足化亏',
      hardTypeId: 'deficit-as-partial',
      passage: `每队发 ${a} 顶还剩 ${surplus} 顶；每队发 ${b} 顶，最后一队只领到 ${partial} 顶。`,
      stem: '一共有多少队？',
      correct: String(n),
      distractors: [String(surplus + deficit), String(b - a), String(partial), String(n - 1)],
      method: [
        `亏 = ${b}−${partial}=${deficit}。`,
        `队数 = (${surplus}+${deficit})÷(${b}−${a})=${n}。`,
      ].join('\n'),
      explanation: `共 ${n} 队。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<YingKuiHardTypeId, (seq: number) => YingKuiQuestion | null> = {
  'surplus-deficit-plus': genHardSurplusDeficitPlus,
  'two-surplus-ask-total': genHardTwoSurplusTotal,
  'two-deficit-ask-n': genHardTwoDeficitN,
  'three-condition': genHardThreeCondition,
  'ask-each-amount': genHardAskEach,
  'mixed-unit': genHardMixedUnit,
  'surplus-then-change': genHardSurplusThenChange,
  'deficit-as-partial': genHardDeficitPartial,
}

function tryBuild(factory: () => YingKuiQuestion | null, maxTry = 40): YingKuiQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type YingKuiFactory = { key: string; build: (seq: number) => YingKuiQuestion | null }

export function generateYingKuiPaper(difficulty: YingKuiDifficulty): YingKuiQuestion[] {
  const out: YingKuiQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: YingKuiQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: YingKuiFactory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= YING_KUI_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < YING_KUI_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'surplus-exact', build: genEasySurplusExact },
      { key: 'deficit-exact', build: genEasyDeficitExact },
      { key: 'two-surplus', build: genEasyTwoSurplus },
      { key: 'two-deficit', build: genEasyTwoDeficit },
      { key: 'ask-total', build: genEasyAskTotal },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'classic', build: genMediumClassic },
      { key: 'surplus-deficit', build: genMediumSurplusDeficit },
      { key: 'two-surplus-total', build: genMediumTwoSurplusTotal },
      { key: 'two-deficit-n', build: genMediumTwoDeficitN },
      { key: 'surplus-exact-total', build: genMediumSurplusExactTotal },
    ])
  } else {
    const used = new Set<YingKuiHardTypeId>()
    const types = shuffleInPlace([...YING_KUI_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= YING_KUI_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = YING_KUI_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < YING_KUI_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : YING_KUI_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, YING_KUI_QUESTION_COUNT)
}
