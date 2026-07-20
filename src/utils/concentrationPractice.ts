/**
 * 高频运算 · 浓度问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式：
 * - 浓度 = 溶质 ÷ 溶液
 * - 溶液 = 溶质 + 溶剂
 * - 十字交叉：(c−c2):(c1−c) = m1:m2
 * - 倒水加水：每次倒出比例 α 再加满水，溶质（浓度）变为原来的 (1−α)
 *
 * 【简单】不高于经典真题 1、2（基本公式、加水/加盐一步、简单混合）
 * 【普通】对齐真题 1 多步 / 真题 2 十字交叉
 * 【困难】含真题 3 类倒水加水，且高于真题 1、2；≥6 种变式，每轮抽 5 种且题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ConcentrationDifficulty = 'easy' | 'medium' | 'hard'

export const CONCENTRATION_QUESTION_COUNT = 5

export const CONCENTRATION_MODES: {
  id: ConcentrationDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '浓度问题 · 简单',
    desc: '每轮 5 题 · 对齐/略低于经典真题 1、2（基本公式、一步混合）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '浓度问题 · 普通',
    desc: '每轮 5 题 · 对齐经典真题 1（分段）/真题 2（十字交叉）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '浓度问题 · 困难',
    desc: '每轮 5 题 · 含倒水加水（真题 3）等更高阶变式（每题题型不同）· 正计时停表看答案',
  },
]

export const CONCENTRATION_HARD_EXAM_TYPES = [
  {
    id: 'dilute-twice',
    name: '倒水加水两次',
    note: '经典真题 3：倒出固定比例再加满水，连续两次求最终浓度',
  },
  {
    id: 'dilute-n',
    name: '倒水加多次',
    note: '倒出加满重复 n 次（n≥3）求最终浓度',
  },
  {
    id: 'pour-add-salt',
    name: '倒出后加溶质',
    note: '倒出一部分溶液后加入纯溶质（盐），求新浓度或加入量',
  },
  {
    id: 'cross-find-mass',
    name: '十字交叉求质量',
    note: '两溶液混合达目标浓度，求某一溶液质量（加强数字）',
  },
  {
    id: 'add-water-then-salt',
    name: '先加水再加盐',
    note: '经典真题 1 加强：两段操作求加盐量或最终浓度',
  },
  {
    id: 'evaporate-add',
    name: '蒸发后再配制',
    note: '先蒸发水分再加水/加溶液，求浓度',
  },
  {
    id: 'mix-then-dilute',
    name: '先混合再稀释',
    note: '两溶液混合后再倒水加水一次，求最终浓度',
  },
] as const

export type ConcentrationHardTypeId = (typeof CONCENTRATION_HARD_EXAM_TYPES)[number]['id']

export type ConcentrationQuestion = {
  id: string
  topic: 'concentration'
  difficulty: ConcentrationDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ConcentrationHardTypeId
}

export function concentrationTopicLabel(): string {
  return '浓度问题'
}

export function concentrationDifficultyLabel(d: ConcentrationDifficulty): string {
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

function asNiceInt(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n)
  if (Math.abs(n - r) > 1e-8) return null
  return r
}

/** 一位小数（如 3.75、7.2） */
function asNiceDec1(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n * 10) / 10
  if (Math.abs(n - r) > 1e-8) return null
  return r
}

function asNiceDec2(n: number): number | null {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n * 100) / 100
  if (Math.abs(n - r) > 1e-8) return null
  return r
}

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const s = String(Math.round(n * 100) / 100)
  return s
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
  while (out.length < need && g++ < 50) {
    const n = Number(String(correct).replace(/%/g, ''))
    const fake = Number.isFinite(n)
      ? `${Math.round(n * 10 + g + 1) / 10}${correct.includes('%') ? '%' : ''}`
      : `${correct}+${g}`
    const key = fake.replace(/\s+/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[], suffix = ''): string[] {
  return uniqueStr(
    `${fmtNum(correct)}${suffix}`,
    cands
      .filter((x) => Number.isFinite(x) && Math.abs(x - correct) > 1e-9)
      .map((x) => `${fmtNum(Math.round(x * 100) / 100)}${suffix}`),
  )
}

function uniquePct(correct: number, cands: number[]): string[] {
  return uniqueNum(correct, cands, '%')
}

function buildQuestion(input: {
  difficulty: ConcentrationDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: ConcentrationHardTypeId
  seq: number
}): ConcentrationQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'concentration',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `conc-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'concentration',
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

function genEasyBasic(seq: number): ConcentrationQuestion | null {
  const mode = pickOne(['c', 'solute', 'solution'] as const)
  if (mode === 'c') {
    const solute = pickOne([10, 15, 20, 25, 30])
    const solution = pickOne([50, 100, 150, 200])
    if (solute >= solution) return null
    const c = asNiceInt((solute * 100) / solution)
    if (c == null) return null
    return buildQuestion({
      difficulty: 'easy',
      term: '溶质溶液求浓度',
      passage: `某溶液中溶质 ${solute} 克，溶液 ${solution} 克。`,
      stem: '浓度是多少？',
      correct: `${c}%`,
      distractors: uniquePct(c, [solute, asNiceInt((solute * 100) / (solution - solute)) ?? c + 5, c + 10]),
      method: '浓度 = 溶质 ÷ 溶液。',
      explanation: `${solute}÷${solution}=${c}%。`,
      seq,
    })
  }
  if (mode === 'solute') {
    const solution = pickOne([100, 200, 250])
    const c = pickOne([10, 20, 25, 40])
    const solute = asNiceInt((solution * c) / 100)
    if (solute == null) return null
    return buildQuestion({
      difficulty: 'easy',
      term: '浓度与溶液求溶质',
      passage: `${solution} 克浓度为 ${c}% 的溶液。`,
      stem: '溶质是多少克？',
      correct: String(solute),
      distractors: uniqueNum(solute, [solution - solute, c, solution * c, solute + 5]),
      method: '溶质 = 溶液 × 浓度。',
      explanation: `${solution}×${c}%=${solute}。`,
      seq,
    })
  }
  const solute = pickOne([20, 30, 40])
  const solvent = pickOne([60, 70, 80, 120])
  const solution = solute + solvent
  return buildQuestion({
    difficulty: 'easy',
    term: '溶质加溶剂求溶液',
    passage: `溶质 ${solute} 克，溶剂 ${solvent} 克。`,
    stem: '溶液是多少克？',
    correct: String(solution),
    distractors: uniqueNum(solution, [solute, solvent, Math.abs(solvent - solute), solution + solute]),
    method: '溶液 = 溶质 + 溶剂。',
    explanation: `${solute}+${solvent}=${solution}。`,
    seq,
  })
}

/** 加水一步：浓度下降 */
function genEasyAddWater(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const solute = pickOne([20, 30, 40, 50])
    const c0 = pickOne([40, 50, 60])
    const solution0 = asNiceInt((solute * 100) / c0)
    if (solution0 == null) continue
    const water = pickOne([10, 20, 25, 50])
    const c1 = asNiceInt((solute * 100) / (solution0 + water))
    if (c1 == null || c1 >= c0) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '加水求新浓度',
      passage: `${solution0} 克浓度为 ${c0}% 的盐水，加入 ${water} 克水。`,
      stem: '浓度变为多少？',
      correct: `${c1}%`,
      distractors: uniquePct(c1, [c0, asNiceInt((solute * 100) / water) ?? c1 + 5, c0 - 10]),
      method: '加水后溶质不变，溶液增加；新浓度 = 溶质 ÷ 新溶液。',
      explanation: `溶质 ${solute} 克不变；新溶液 ${solution0 + water} 克；浓度 ${c1}%。`,
      seq,
    })
  }
  return null
}

/** 简单混合两溶液求浓度（方程，不必交叉） */
function genEasyMix(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c1 = pickOne([10, 20, 30])
    const c2 = pickOne([40, 50, 60])
    if (c2 <= c1) continue
    const m1 = pickOne([100, 150, 200])
    const m2 = pickOne([100, 150, 200])
    const solute = (c1 * m1 + c2 * m2) / 100
    const mix = m1 + m2
    const c = asNiceInt((solute * 100) / mix)
    if (c == null) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '两溶液混合求浓度',
      passage: `${m1} 克 ${c1}% 的盐水与 ${m2} 克 ${c2}% 的盐水混合。`,
      stem: '混合后浓度是多少？',
      correct: `${c}%`,
      distractors: uniquePct(c, [(c1 + c2) / 2, c1, c2, c + 5]),
      method: '混合后溶质相加、溶液相加，浓度 = 总溶质 ÷ 总溶液。',
      explanation: `总溶质 ${fmtNum(solute)}，总溶液 ${mix}，浓度 ${c}%。`,
      seq,
    })
  }
  return null
}

/** 略简于真题 2：十字交叉求加入量（数字好算） */
function genEasyCross(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    // (c - c1)/(c2 - c) = m2/m1  wait: (c-c2):(c1-c) = m1:m2
    // so m2/m1 = (c1-c)/(c-c2)
    const c1 = pickOne([10, 15, 20])
    const c2 = pickOne([30, 40, 50])
    const c = pickOne([20, 25, 30])
    if (!(c1 < c && c < c2)) continue
    const m1 = pickOne([100, 150, 200])
    const m2 = asNiceInt((m1 * (c - c1)) / (c2 - c))
    if (m2 == null || m2 <= 0) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '十字交叉求加入量（经典真题 2）',
      passage: `有 ${m1} 克浓度为 ${c1}% 的盐水，要配成 ${c}% 的盐水。`,
      stem: `需要加入多少克 ${c2}% 的盐水？`,
      correct: String(m2),
      distractors: uniqueNum(m2, [m1, asNiceInt((m1 * (c2 - c)) / (c - c1)) ?? m2 + 50, m1 + m2, m2 / 2]),
      method: '十字交叉：(目标−低):(高−目标)=高浓度溶液:低浓度溶液；或 (c−c1)/(c2−c)=m2/m1。',
      explanation: `m2=${m1}×(${c}−${c1})÷(${c2}−${c})=${m2}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '十字交叉求加入量（经典真题 2）',
    passage: '有 100 克浓度为 10% 的盐水，要配成 25% 的盐水。',
    stem: '需要加入多少克 30% 的盐水？',
    correct: '300',
    distractors: uniqueNum(300, [150, 200, 250]),
    method: '十字交叉：|30−25|:|25−10|=5:15=1:3 ⇒ 100:x=1:3 ⇒ x=300。',
    explanation: '需加入 300 克。',
    seq,
  })
}

// ——— 普通 ———

/** 经典真题 1 同构：先加水再加盐 */
function genMediumClassic1(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 50; i++) {
    const c0 = pickOne([40, 50, 60])
    const water = pickOne([2, 3, 4, 5])
    const c1 = pickOne([20, 25, 30])
    // 0.01*c0*x / (x+water) = 0.01*c1 ⇒ c0*x = c1*(x+water) ⇒ x(c0-c1)=c1*water
    const x = asNiceDec2((c1 * water) / (c0 - c1))
    if (x == null || x <= 0) continue
    const solute = asNiceDec2((c0 / 100) * x)
    if (solute == null) continue
    const sol1 = asNiceDec2(x + water)
    if (sol1 == null) continue
    const c2 = pickOne([50, 60, 70])
    if (c2 <= c1) continue
    // (solute+y)/(sol1+y)=c2/100 ⇒ solute+y = (c2/100)(sol1+y)
    // solute - (c2/100)*sol1 = y*(c2/100 - 1)
    // y = (solute - c2/100*sol1) / (c2/100 - 1)
    const y = asNiceDec2((solute - (c2 / 100) * sol1) / (c2 / 100 - 1))
    if (y == null || y <= 0) continue
    // prefer nice like 3.75
    if (Math.abs(y * 4 - Math.round(y * 4)) > 1e-6 && Math.abs(y * 2 - Math.round(y * 2)) > 1e-6) {
      if (asNiceDec1(y) == null && asNiceInt(y) == null) continue
    }
    const yShow = asNiceDec2(y)!
    return buildQuestion({
      difficulty: 'medium',
      term: '先加水再加盐（经典真题 1）',
      passage: `浓度为 ${c0}% 的盐水，加入 ${water} 千克水后浓度变为 ${c1}%。在此基础上，要使浓度变为 ${c2}%。`,
      stem: '需要加入多少千克盐？',
      correct: fmtNum(yShow),
      distractors: uniqueNum(yShow, [yShow + 0.1, yShow - 0.1, water, x]),
      method: '分段：先由加水列式求原溶液与溶质；再加盐时溶质、溶液同时增加，列浓度方程。',
      explanation: `原溶液 ${fmtNum(x)} 千克；加水后溶液 ${fmtNum(sol1)}、溶质 ${fmtNum(solute)}；加盐 ${fmtNum(yShow)} 千克。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '先加水再加盐（经典真题 1）',
    passage: '浓度为 50% 的盐水，加入 2 千克水后浓度变为 30%。在此基础上，要使浓度变为 60%。',
    stem: '需要加入多少千克盐？',
    correct: '3.75',
    distractors: uniqueNum(3.75, [3.85, 3.95, 4.05]),
    method: '(0.5x)/(x+2)=0.3 ⇒ x=3；溶质 1.5，溶液 5；(1.5+y)/(5+y)=0.6 ⇒ y=3.75。',
    explanation: '需加盐 3.75 千克。',
    seq,
  })
}

function genMediumCross(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c1 = pickOne([5, 10, 15, 20])
    const c2 = pickOne([30, 35, 40, 50])
    const c = pickOne([20, 25, 30])
    if (!(c1 < c && c < c2)) continue
    const m1 = pickOne([80, 100, 120, 150, 200])
    const m2 = asNiceInt((m1 * (c - c1)) / (c2 - c))
    if (m2 == null) continue
    const ask = pickOne(['m2', 'c'] as const)
    if (ask === 'm2') {
      return buildQuestion({
        difficulty: 'medium',
        term: '十字交叉求加入量',
        passage: `有 ${m1} 克 ${c1}% 的盐水，加入若干克 ${c2}% 的盐水后，浓度变为 ${c}%。`,
        stem: `加入了多少克 ${c2}% 的盐水？`,
        correct: String(m2),
        distractors: uniqueNum(m2, [m1, m1 + m2, asNiceInt((m1 * (c2 - c)) / (c - c1)) ?? m2 + 50]),
        method: '十字交叉：(c−c1):(c2−c)=m2:m1 的倒数关系，即 m2:m1=(c−c1):(c2−c)。',
        explanation: `交叉差 ${c - c1} 与 ${c2 - c}；m2=${m2}。`,
        seq,
      })
    }
    // 已知两质量求混合浓度
    const solute = (c1 * m1 + c2 * m2) / 100
    const cm = asNiceInt((solute * 100) / (m1 + m2))
    if (cm == null) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '混合求浓度（可十字验证）',
      passage: `${m1} 克 ${c1}% 盐水与 ${m2} 克 ${c2}% 盐水混合。`,
      stem: '混合后浓度是多少？',
      correct: `${cm}%`,
      distractors: uniquePct(cm, [c1, c2, Math.round((c1 + c2) / 2), cm + 5]),
      method: '总溶质÷总溶液；也可用十字交叉由质量比反推混合浓度。',
      explanation: `混合浓度 ${cm}%。`,
      seq,
    })
  }
  return null
}

function genMediumAddSalt(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const solution = pickOne([100, 150, 200])
    const c0 = pickOne([10, 20, 25])
    const salt = pickOne([10, 20, 25, 50])
    const solute0 = (solution * c0) / 100
    const c1 = asNiceInt(((solute0 + salt) * 100) / (solution + salt))
    if (c1 == null) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '加盐求新浓度',
      passage: `${solution} 克 ${c0}% 的盐水，加入 ${salt} 克盐（溶质）。`,
      stem: '浓度变为多少？',
      correct: `${c1}%`,
      distractors: uniquePct(c1, [c0, c0 + salt, asNiceInt((salt * 100) / solution) ?? c1 + 5]),
      method: '加盐后溶质与溶液同时增加；新浓度=(原溶质+盐)/(原溶液+盐)。',
      explanation: `新浓度 ${c1}%。`,
      seq,
    })
  }
  return null
}

function genMediumEvaporate(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const solution = pickOne([200, 250, 300])
    const c0 = pickOne([10, 20, 25])
    const evap = pickOne([50, 80, 100])
    if (evap >= solution) continue
    const solute = (solution * c0) / 100
    const c1 = asNiceInt((solute * 100) / (solution - evap))
    if (c1 == null || c1 <= c0) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '蒸发水分求新浓度',
      passage: `${solution} 克 ${c0}% 的盐水，蒸发掉 ${evap} 克水。`,
      stem: '浓度变为多少？',
      correct: `${c1}%`,
      distractors: uniquePct(c1, [c0, asNiceInt((solute * 100) / evap) ?? c1 + 5, c1 - 5]),
      method: '蒸发后溶质不变，溶液减少；新浓度 = 溶质 ÷ 剩余溶液。',
      explanation: `溶质 ${fmtNum(solute)} 克不变；剩余 ${solution - evap} 克；浓度 ${c1}%。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardDiluteTwice(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c0 = pickOne([20, 25, 40, 50])
    // pour fraction a/b, keep (b-a)/b
    const pairs: [number, number][] = [
      [2, 5],
      [1, 3],
      [1, 4],
      [3, 5],
      [1, 2],
    ]
    const [a, b] = pickOne(pairs)
    const keep = (b - a) / b
    const cFinal = asNiceDec1(c0 * keep * keep)
    if (cFinal == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '倒水加水两次（经典真题 3）',
      hardTypeId: 'dilute-twice',
      passage: `一瓶浓度为 ${c0}% 的消毒液，倒出 ${a}/${b}，再加满清水；然后又倒出 ${a}/${b}，再加满清水。`,
      stem: '最终浓度是多少？',
      correct: `${fmtNum(cFinal)}%`,
      distractors: uniquePct(cFinal, [
        asNiceDec1(c0 * keep) ?? cFinal + 1,
        asNiceDec1(c0 * keep * keep * keep) ?? cFinal - 1,
        c0 / 2,
        c0 * ((b - a) / b),
      ]),
      method: '每次倒出 α 再加满水，溶质变为原来的 (1−α)，浓度同比例变化；两次则乘 (1−α)²。',
      explanation: `每次保留 ${(b - a)}/${b}；最终 ${c0}%×(${b - a}/${b})²=${fmtNum(cFinal)}%。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '倒水加水两次（经典真题 3）',
    hardTypeId: 'dilute-twice',
    passage: '一瓶浓度为 20% 的消毒液，倒出 2/5，再加满清水；然后又倒出 2/5，再加满清水。',
    stem: '最终浓度是多少？',
    correct: '7.2%',
    distractors: uniquePct(7.2, [3.2, 5.0, 4.8]),
    method: '每次保留 3/5；20%×(3/5)²=7.2%。',
    explanation: '最终浓度 7.2%。',
    seq,
  })
}

function genHardDiluteN(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c0 = pickOne([40, 50, 60, 80])
    const n = pickOne([3, 4])
    const pairs: [number, number][] = [
      [1, 2],
      [1, 4],
      [1, 5],
    ]
    const [a, b] = pickOne(pairs)
    const keep = (b - a) / b
    let c = c0
    for (let k = 0; k < n; k++) c *= keep
    const cFinal = asNiceDec1(c) ?? asNiceDec2(c)
    if (cFinal == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '倒水加多次',
      hardTypeId: 'dilute-n',
      passage: `一瓶 ${c0}% 的溶液，每次倒出 ${a}/${b} 再加满水，重复操作 ${n} 次。`,
      stem: '最终浓度是多少？',
      correct: `${fmtNum(cFinal)}%`,
      distractors: uniquePct(cFinal, [
        asNiceDec1(c0 * keep) ?? cFinal + 2,
        asNiceDec1(c0 * keep * keep) ?? cFinal + 1,
        c0 / n,
      ]),
      method: `每次浓度乘以 (1−倒出比例)；n 次后乘 (1−α)^n。`,
      explanation: `${c0}%×(${b - a}/${b})^${n}=${fmtNum(cFinal)}%。`,
      seq,
    })
  }
  return null
}

function genHardPourAddSalt(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const V = pickOne([100, 200, 250])
    const c0 = pickOne([20, 25, 40])
    const pour = pickOne([20, 40, 50])
    if (pour >= V) continue
    const soluteLeft = (c0 / 100) * (V - pour)
    const salt = pickOne([10, 15, 20, 25])
    // 倒出后加满？题设：倒出后加入 salt 克盐，溶液质量变为 V-pour+salt
    const c1 = asNiceInt(((soluteLeft + salt) * 100) / (V - pour + salt))
    if (c1 == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '倒出后加溶质',
      hardTypeId: 'pour-add-salt',
      passage: `${V} 克 ${c0}% 的盐水，倒出 ${pour} 克后，向剩余溶液中加入 ${salt} 克盐。`,
      stem: '此时浓度是多少？',
      correct: `${c1}%`,
      distractors: uniquePct(c1, [c0, asNiceInt((salt * 100) / V) ?? c1 + 5, c0 + 5]),
      method: '倒出后溶质按比例减少；再加盐使溶质与溶液同时增加。',
      explanation: `剩余溶质 ${fmtNum(soluteLeft)}；加盐后浓度 ${c1}%。`,
      seq,
    })
  }
  return null
}

function genHardCrossFindMass(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c1 = pickOne([8, 10, 12, 15])
    const c2 = pickOne([35, 40, 45, 50])
    const c = pickOne([20, 24, 25, 30])
    if (!(c1 < c && c < c2)) continue
    const m1 = pickOne([120, 150, 180, 240])
    const m2 = asNiceInt((m1 * (c - c1)) / (c2 - c))
    if (m2 == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '十字交叉求质量',
      hardTypeId: 'cross-find-mass',
      passage: `要用 ${c1}% 与 ${c2}% 两种盐水配成 ${c}% 的盐水 ${m1 + m2} 克。`,
      stem: `需要 ${c2}% 的盐水多少克？`,
      correct: String(m2),
      distractors: uniqueNum(m2, [m1, m1 + m2, asNiceInt((m1 * (c2 - c)) / (c - c1)) ?? m2 + 30]),
      method: '十字交叉：m1:m2=(c2−c):(c−c1)；总质量已知时按比例分配。',
      explanation: `质量比 ${c2 - c}:${c - c1}；其中 ${c2}% 需 ${m2} 克。`,
      seq,
    })
  }
  return null
}

function genHardAddWaterThenSalt(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 50; i++) {
    const c0 = pickOne([40, 50, 60])
    const water = pickOne([4, 5, 6])
    const c1 = pickOne([20, 25, 30])
    const x = asNiceDec2((c1 * water) / (c0 - c1))
    if (x == null || x <= 0) continue
    const solute = asNiceDec2((c0 / 100) * x)
    const sol1 = asNiceDec2(x + water)
    if (solute == null || sol1 == null) continue
    const c2 = pickOne([55, 60, 70])
    if (c2 <= c1) continue
    const y = asNiceDec2((solute - (c2 / 100) * sol1) / (c2 / 100 - 1))
    if (y == null || y <= 0) continue
    if (asNiceDec2(y) == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '先加水再加盐加强',
      hardTypeId: 'add-water-then-salt',
      passage: `${c0}% 的盐水加入 ${water} 千克水后变为 ${c1}%。再加入若干千克盐，使浓度变为 ${c2}%。`,
      stem: '加入的盐是多少千克？',
      correct: fmtNum(y),
      distractors: uniqueNum(y, [y + 0.25, y - 0.25, water, x]),
      method: '先求原溶液与溶质，再对加盐列浓度方程。',
      explanation: `加盐 ${fmtNum(y)} 千克。`,
      seq,
    })
  }
  return null
}

function genHardEvaporateAdd(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const V = pickOne([200, 300, 400])
    const c0 = pickOne([10, 15, 20])
    const evap = pickOne([50, 100])
    if (evap >= V) continue
    const solute = (V * c0) / 100
    const afterEvap = V - evap
    const waterAdd = pickOne([50, 80, 100])
    const c1 = asNiceInt((solute * 100) / (afterEvap + waterAdd))
    if (c1 == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '蒸发后再加水',
      hardTypeId: 'evaporate-add',
      passage: `${V} 克 ${c0}% 的盐水，先蒸发 ${evap} 克水，再加入 ${waterAdd} 克清水。`,
      stem: '最终浓度是多少？',
      correct: `${c1}%`,
      distractors: uniquePct(c1, [
        c0,
        asNiceInt((solute * 100) / afterEvap) ?? c1 + 5,
        asNiceInt((solute * 100) / (V + waterAdd)) ?? c1 - 2,
      ]),
      method: '蒸发溶质不变；再加水溶质仍不变、溶液增加。',
      explanation: `溶质始终 ${fmtNum(solute)} 克；最终溶液 ${afterEvap + waterAdd} 克；浓度 ${c1}%。`,
      seq,
    })
  }
  return null
}

function genHardMixThenDilute(seq: number): ConcentrationQuestion | null {
  for (let i = 0; i < 40; i++) {
    const c1 = pickOne([10, 20])
    const c2 = pickOne([40, 50])
    const m1 = pickOne([100, 150])
    const m2 = pickOne([100, 150])
    const mixC = (c1 * m1 + c2 * m2) / (m1 + m2)
    const keepPairs: [number, number][] = [
      [1, 2],
      [1, 3],
      [2, 5],
    ]
    const [a, b] = pickOne(keepPairs)
    const keep = (b - a) / b
    const cFinal = asNiceDec1(mixC * keep)
    if (cFinal == null) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '先混合再倒水加水',
      hardTypeId: 'mix-then-dilute',
      passage: `${m1} 克 ${c1}% 盐水与 ${m2} 克 ${c2}% 盐水混合后，倒出 ${a}/${b} 再加满清水。`,
      stem: '最终浓度是多少？',
      correct: `${fmtNum(cFinal)}%`,
      distractors: uniquePct(cFinal, [
        asNiceInt(mixC) ?? cFinal + 5,
        asNiceDec1(mixC * keep * keep) ?? cFinal - 1,
        (c1 + c2) / 2,
      ]),
      method: '先求混合浓度，再按倒水加水：浓度乘以保留比例。',
      explanation: `混合约 ${fmtNum(mixC)}%；再×${b - a}/${b} 得 ${fmtNum(cFinal)}%。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  ConcentrationHardTypeId,
  (seq: number) => ConcentrationQuestion | null
> = {
  'dilute-twice': genHardDiluteTwice,
  'dilute-n': genHardDiluteN,
  'pour-add-salt': genHardPourAddSalt,
  'cross-find-mass': genHardCrossFindMass,
  'add-water-then-salt': genHardAddWaterThenSalt,
  'evaporate-add': genHardEvaporateAdd,
  'mix-then-dilute': genHardMixThenDilute,
}

function tryBuild(
  factory: () => ConcentrationQuestion | null,
  maxTry = 50,
): ConcentrationQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateConcentrationPaper(
  difficulty: ConcentrationDifficulty,
): ConcentrationQuestion[] {
  const out: ConcentrationQuestion[] = []
  const seen = new Set<string>()
  const push = (q: ConcentrationQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyBasic, genEasyAddWater, genEasyMix, genEasyCross]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= CONCENTRATION_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < CONCENTRATION_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [genMediumClassic1, genMediumCross, genMediumAddSalt, genMediumEvaporate]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= CONCENTRATION_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < CONCENTRATION_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<ConcentrationHardTypeId>()
    const types = shuffleInPlace([...CONCENTRATION_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= CONCENTRATION_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = CONCENTRATION_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < CONCENTRATION_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : CONCENTRATION_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, CONCENTRATION_QUESTION_COUNT)
}
