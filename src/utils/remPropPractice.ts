/**
 * 运算技巧 · 余数及其性质
 * 本地程序出题（不调用 AI）。每轮 7 题四选一。
 *
 * 【困难题型库 · 难于经典真题，登记 ≥7 种；每轮抽 7 种且互不重复】
 * 1. score-draw：赛点不定方程，用同余求平局/胜场（升级版真题）
 * 2. score-ask-other：问胜场或负场，约束更紧
 * 3. shop-diophantine：购物 ax+by=c，同余消元
 * 4. crt-three-min：三同余式求最小正整数（难于真题数字）
 * 5. crt-four：四条件同余，代入排除
 * 6. crt-max-under：不超过 N 的最大解
 * 7. diophantine-reduce：先约去公约数再同余
 * 8. prod-find-rem：由积的余数反推某因数余数
 * 9. mixed-expr-rem：大型混合运算求余（难于中等）
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type RemPropDifficulty = 'easy' | 'medium' | 'hard'

export const REM_PROP_QUESTION_COUNT = 7

export const REM_PROP_MODES: {
  id: RemPropDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '余数及其性质 · 简单',
    desc: '每轮 7 题 · 同余：和/差/积与余数 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '余数及其性质 · 中等',
    desc: '每轮 7 题 · 对齐经典真题（赛点同余 / 分组代入）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '余数及其性质 · 困难',
    desc: '每轮 7 题 · 难于经典真题的 9 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const REM_PROP_HARD_EXAM_TYPES = [
  {
    id: 'score-draw',
    name: '赛点不定方程求平局',
    note: '胜/平得分，用同余锁定平局可能取值',
  },
  {
    id: 'score-ask-other',
    name: '赛点问胜场或负场',
    note: '总场次+总分，问另一未知量',
  },
  {
    id: 'shop-diophantine',
    name: '购物不定方程',
    note: 'ax+by=c，取模消元求正整数解',
  },
  {
    id: 'crt-three-min',
    name: '三同余求最小正整数',
    note: '难于真题的模与余数组合',
  },
  {
    id: 'crt-four',
    name: '四条件同余代入',
    note: '四个余数条件，代入排除',
  },
  {
    id: 'crt-max-under',
    name: '不超过 N 的最大解',
    note: '同余组在上界内的最大正整数',
  },
  {
    id: 'diophantine-reduce',
    name: '先约分再同余',
    note: 'ax+by=c 先除公约数，再取模',
  },
  {
    id: 'prod-find-rem',
    name: '由积余反推因数余',
    note: '6x≡3(mod5) 等，求 x 的余数',
  },
  {
    id: 'mixed-expr-rem',
    name: '混合运算求余（加强）',
    note: '多层加减乘后对 m 求余',
  },
] as const

export type RemPropHardTypeId = (typeof REM_PROP_HARD_EXAM_TYPES)[number]['id']

export type RemPropQuestion = {
  id: string
  topic: 'rem-prop'
  difficulty: RemPropDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: RemPropHardTypeId
}

export function remPropTopicLabel(): string {
  return '余数及其性质'
}

export function remPropDifficultyLabel(d: RemPropDifficulty): string {
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

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
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
    const fake = String(Number(correct) + g)
    if (!Number.isFinite(Number(correct))) break
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, need)
}

function uniqueNum(correct: number, cands: number[]): string[] {
  return uniqueStr(
    String(correct),
    cands.filter((x) => Number.isFinite(x) && x !== correct && Number.isInteger(x)).map(String),
  )
}

function buildQuestion(input: {
  difficulty: RemPropDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: RemPropHardTypeId
  seq: number
}): RemPropQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'rem-prop',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `rem-prop-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'rem-prop',
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

/** 中国剩余：找满足所有 n≡r_i (mod m_i) 的最小正整数 */
function solveCrt(moduli: number[], rems: number[]): number | null {
  if (moduli.length !== rems.length || moduli.length === 0) return null
  const M = moduli.reduce((a, b) => a * b, 1)
  // 仅当两两互质时用标准 CRT；否则暴力搜
  let pairwise = true
  for (let i = 0; i < moduli.length; i++) {
    for (let j = i + 1; j < moduli.length; j++) {
      if (gcd(moduli[i]!, moduli[j]!) !== 1) pairwise = false
    }
  }
  if (pairwise) {
    let x = 0
    for (let i = 0; i < moduli.length; i++) {
      const mi = moduli[i]!
      const Mi = M / mi
      let inv = 0
      for (let t = 0; t < mi; t++) {
        if ((Mi * t) % mi === 1) {
          inv = t
          break
        }
      }
      x += rems[i]! * Mi * inv
    }
    return mod(x, M) === 0 ? M : mod(x, M)
  }
  const maxScan = M * 2
  for (let n = 1; n <= maxScan; n++) {
    if (moduli.every((m, i) => mod(n, m) === rems[i]!)) return n
  }
  return null
}

function allCrtSolutionsUnder(moduli: number[], rems: number[], maxN: number): number[] {
  const out: number[] = []
  for (let n = 1; n <= maxN; n++) {
    if (moduli.every((m, i) => mod(n, m) === rems[i]!)) out.push(n)
  }
  return out
}

// ——— 简单：同余性质 ———

function genEasySumRem(seq: number): RemPropQuestion | null {
  const m = pickOne([5, 7, 8, 9, 11])
  const a = randInt(10, 40)
  const b = randInt(10, 40)
  const ra = mod(a, m)
  const rb = mod(b, m)
  const ans = mod(a + b, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '和与余数同余',
    stem: `已知 ${a}÷${m} 余 ${ra}，${b}÷${m} 余 ${rb}，则 (${a}+${b})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [mod(ra + rb, m), ra + rb, ra, rb, mod(a - b, m)]),
    method: '和与余数之和同余：先算 (余数之和)÷m 的余数。',
    explanation: `(${ra}+${rb})÷${m} 余 ${mod(ra + rb, m)}，与 (${a}+${b})÷${m} 余 ${ans} 一致。`,
    seq,
  })
}

function genEasyDiffRem(seq: number): RemPropQuestion | null {
  const m = pickOne([5, 6, 7, 8, 9])
  let a = randInt(20, 50)
  let b = randInt(10, 25)
  if (a < b) [a, b] = [b, a]
  const ra = mod(a, m)
  const rb = mod(b, m)
  const ans = mod(a - b, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '差与余数同余',
    stem: `已知 ${a}÷${m} 余 ${ra}，${b}÷${m} 余 ${rb}，则 (${a}−${b})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [mod(ra - rb, m), Math.abs(ra - rb), ra, rb]),
    method: '差与余数之差同余（差为负时加 m 再取余）。',
    explanation: `(${ra}−${rb}) 对 ${m} 取余得 ${mod(ra - rb, m)}，即答案 ${ans}。`,
    seq,
  })
}

function genEasyProdRem(seq: number): RemPropQuestion | null {
  const m = pickOne([5, 7, 8, 9])
  const a = randInt(8, 30)
  const b = randInt(8, 30)
  const ra = mod(a, m)
  const rb = mod(b, m)
  const ans = mod(a * b, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '积与余数同余',
    stem: `已知 ${a}÷${m} 余 ${ra}，${b}÷${m} 余 ${rb}，则 (${a}×${b})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [mod(ra * rb, m), ra * rb, mod(ra + rb, m), ra, rb]),
    method: '积与余数之积同余：先算余数相乘再÷m 取余。',
    explanation: `${ra}×${rb}=${ra * rb}，${ra * rb}÷${m} 余 ${mod(ra * rb, m)}，即 ${ans}。`,
    seq,
  })
}

function genEasyMixedRem(seq: number): RemPropQuestion | null {
  const m = pickOne([5, 7, 9, 11])
  const a = randInt(10, 25)
  const b = randInt(10, 25)
  const c = randInt(2, 9)
  const ans = mod(a + b * c, m)
  return buildQuestion({
    difficulty: 'easy',
    term: '简单混合求余',
    stem: `(${a}+${b}×${c})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [
      mod(a + b + c, m),
      mod(a * b * c, m),
      mod(a, m),
      mod(b * c, m),
    ]),
    method: '可把各数换成对 m 的余数再算，最后再取余。',
    explanation: `${a}≡${mod(a, m)}，${b}≡${mod(b, m)}，${c}≡${mod(c, m)} (mod ${m})，得余数 ${ans}。`,
    seq,
  })
}

// ——— 中等：经典真题难度 ———

/** 经典：胜 3 分平 1 分，总场次+总分，问平局 */
function genMediumScoreDraw(seq: number): RemPropQuestion | null {
  const configs: { games: number; points: number; win: number; draw: number; lossPts: number }[] =
    []
  for (const games of [12, 14, 15, 16, 18]) {
    for (const winPts of [3]) {
      for (let w = 0; w <= games; w++) {
        for (let d = 0; d <= games - w; d++) {
          const pts = winPts * w + 1 * d
          if (pts < 8 || pts > 40) continue
          if (d % 3 !== pts % 3) continue // 同余特征：3w≡0 ⇒ d≡pts (mod 3)
          // 至少保证平局唯一满足「d≡pts mod 3」在常见干扰中
          configs.push({ games, points: pts, win: w, draw: d, lossPts: 0 })
        }
      }
    }
  }
  // 挑「选项里只有一个满足 d≡points mod 3」的题
  for (let attempt = 0; attempt < 40; attempt++) {
    const c = pickOne(configs)
    const need = mod(c.points, 3)
    const correct = c.draw
    const distractorsPool = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter(
      (x) => x !== correct && x <= c.games && mod(x, 3) !== need,
    )
    if (distractorsPool.length < 3) continue
    const distractors = shuffleInPlace(distractorsPool).slice(0, 3)
    // 确认正确项确实满足且方程有解
    const remOk = mod(correct, 3) === need
    const w = (c.points - correct) / 3
    if (!remOk || !Number.isInteger(w) || w < 0 || w + correct > c.games) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '赛点同余（经典）',
      passage: `某队参加 ${c.games} 场比赛，胜一场得 3 分，平一场得 1 分，负一场得 0 分，累计得 ${c.points} 分。`,
      stem: '平局场次可能是？',
      correct: String(correct),
      distractors: uniqueNum(correct, distractors),
      method: '3×胜场 ≡0 (mod 3)，故平局 ≡ 总分 (mod 3)。用同余先排除，再验证场次。',
      explanation: `${c.points}÷3 余 ${need}，故平局÷3 余 ${need}。选项中只有 ${correct} 符合，且胜场=${w}，负场=${c.games - w - correct}。`,
      seq,
    })
  }
  return null
}

/** 经典：分组余数，求最少人数（代入排除） */
function genMediumCrtGroup(seq: number): RemPropQuestion | null {
  const templates: { m: number[]; r: number[]; ans: number; opts: number[] }[] = [
    { m: [3, 5, 7], r: [2, 3, 4], ans: 53, opts: [23, 53, 88, 158] },
    { m: [3, 5, 7], r: [1, 2, 3], ans: 52, opts: [17, 52, 87, 122] },
    { m: [3, 4, 5], r: [2, 3, 4], ans: 59, opts: [23, 39, 59, 119] },
    { m: [3, 5, 7], r: [2, 1, 3], ans: 58, opts: [16, 37, 58, 121] },
    { m: [4, 5, 7], r: [3, 2, 1], ans: 107, opts: [27, 67, 107, 147] },
  ]
  // 动态生成一组
  for (let t = 0; t < 20; t++) {
    const m = [3, 5, 7]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6)]
    // 避免全 0
    if (r.every((x) => x === 0)) continue
    const ans = solveCrt(m, r)
    if (ans == null || ans < 10 || ans > 200) continue
    const product = 3 * 5 * 7
    const opts = shuffleInPlace([
      ans,
      ans + product,
      Math.max(1, ans - product),
      ans + m[0]! * m[1]!,
    ])
    // 保证只有 ans 满足（在选项里）—— ans+product 也满足！需换成不满足的干扰
    const wrong: number[] = []
    for (const cand of [ans - 7, ans + 5, ans + 11, 23, 53, 88, ans * 2, ans + 1]) {
      if (cand <= 0 || cand === ans) continue
      if (m.every((moduli, i) => mod(cand, moduli) === r[i]!)) continue
      if (!wrong.includes(cand)) wrong.push(cand)
      if (wrong.length >= 3) break
    }
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '分组余数（经典）',
      passage: `一群学生排队：${m.map((mi, i) => `${mi} 人一组余 ${r[i]} 人`).join('；')}。`,
      stem: '学生人数最少是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最少：从较小选项起代入验证；或用同余方程组求解。',
      explanation: `求满足 n≡${r[0]}(mod ${m[0]})，n≡${r[1]}(mod ${m[1]})，n≡${r[2]}(mod ${m[2]}) 的最小正整数，得 ${ans}。`,
      seq,
    })
  }
  const fixed = pickOne(templates)
  // 校验 fixed
  if (!fixed.m.every((mi, i) => mod(fixed.ans, mi) === fixed.r[i]!)) return null
  const wrong = fixed.opts.filter((x) => x !== fixed.ans)
  return buildQuestion({
    difficulty: 'medium',
    term: '分组余数（经典）',
    passage: `一群学生排队：${fixed.m.map((mi, i) => `${mi} 人一组余 ${fixed.r[i]} 人`).join('；')}。`,
    stem: '学生人数最少是？',
    correct: String(fixed.ans),
    distractors: uniqueNum(fixed.ans, wrong),
    method: '问最少：从较小选项起代入；利用余数特征快速排除。',
    explanation: `最小正整数解为 ${fixed.ans}。`,
    seq,
  })
}

function genMediumExprRem(seq: number): RemPropQuestion | null {
  const m = pickOne([7, 8, 9, 11, 13])
  const a = randInt(100, 400)
  const b = randInt(100, 400)
  const c = randInt(100, 400)
  const ans = mod(a + b * c, m)
  return buildQuestion({
    difficulty: 'medium',
    term: '大数混合求余',
    stem: `(${a}+${b}×${c})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [
      mod(a + b + c, m),
      mod(a * b + c, m),
      mod(a, m),
      mod(b * c, m),
      (ans + 1) % m,
      (ans + 2) % m,
    ]),
    method: '各数先对 m 取余，再按运算计算，最后再取余。',
    explanation: `${a}≡${mod(a, m)}，${b}≡${mod(b, m)}，${c}≡${mod(c, m)} (mod ${m})，结果余 ${ans}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardScoreDraw(seq: number): RemPropQuestion | null {
  const winPts = pickOne([3, 4, 5])
  const drawPts = pickOne([1, 2])
  if (drawPts >= winPts) return null
  const games = pickOne([16, 18, 20, 22])
  for (let attempt = 0; attempt < 50; attempt++) {
    const w = randInt(2, games - 3)
    const d = randInt(1, games - w - 1)
    const points = winPts * w + drawPts * d
    if (points < 15) continue
    // 同余：winPts*w + drawPts*d ≡ points (自动成立)；用 mod winPts：
    // drawPts*d ≡ points (mod winPts)
    const need = mod(points, winPts)
    // d 需满足 drawPts*d ≡ need (mod winPts)
    if (mod(drawPts * d, winPts) !== need) continue
    const correct = d
    const wrong: number[] = []
    for (let x = 1; x <= games; x++) {
      if (x === correct) continue
      if (mod(drawPts * x, winPts) === need) continue // 也满足同余的不要做干扰（除非无解）
      wrong.push(x)
      if (wrong.length >= 8) break
    }
    if (wrong.length < 3) continue
    const distractors = shuffleInPlace(wrong).slice(0, 3)
    return buildQuestion({
      difficulty: 'hard',
      term: '赛点求平局（加强）',
      hardTypeId: 'score-draw',
      passage: `球队赛 ${games} 场：胜一场 ${winPts} 分，平一场 ${drawPts} 分，负一场 0 分，共得 ${points} 分。`,
      stem: '平局场次是？',
      correct: String(correct),
      distractors: uniqueNum(correct, distractors),
      method: `对 ${winPts} 取模：胜场贡献余 0，故 ${drawPts}×平局 ≡ ${points} (mod ${winPts})，据此排除再验证。`,
      explanation: `${points}÷${winPts} 余 ${need}，需 ${drawPts}×d ≡ ${need} (mod ${winPts})。得 d=${correct}（胜 ${w}，负 ${games - w - d}）。`,
      seq,
    })
  }
  return null
}

function genHardScoreAskOther(seq: number): RemPropQuestion | null {
  const games = pickOne([14, 15, 16, 18])
  const winPts = 3
  for (let attempt = 0; attempt < 40; attempt++) {
    const w = randInt(3, games - 4)
    const d = randInt(1, games - w - 1)
    const loss = games - w - d
    const points = winPts * w + d
    if (loss < 1 || points < 10) continue
    const ask = pickOne(['win', 'loss'] as const)
    const correct = ask === 'win' ? w : loss
    // 干扰
    const wrong = shuffleInPlace(
      [w, d, loss, w + 1, d + 1, loss + 1, games - points, points % 3].filter(
        (x) => x !== correct && x >= 0 && x <= games,
      ),
    ).slice(0, 3)
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '赛点问胜场/负场',
      hardTypeId: 'score-ask-other',
      passage: `共 ${games} 场比赛，胜一场 3 分、平一场 1 分、负一场 0 分，总分 ${points}。已知平局 ${d} 场。`,
      stem: ask === 'win' ? '胜场是多少？' : '负场是多少？',
      correct: String(correct),
      distractors: uniqueNum(correct, wrong),
      method: '由 3w+d=总分得 w；再由总场次求负场。可先用同余检查 d 与总分是否匹配。',
      explanation: `3w+${d}=${points} ⇒ w=${w}，负场=${loss}。所求为 ${correct}。`,
      seq,
    })
  }
  return null
}

function genHardShop(seq: number): RemPropQuestion | null {
  // ax + by = c, ask x
  for (let attempt = 0; attempt < 40; attempt++) {
    const a = pickOne([3, 4, 5, 6, 7])
    const b = pickOne([5, 6, 7, 8, 9])
    if (a === b) continue
    const x = randInt(2, 8)
    const y = randInt(2, 8)
    const c = a * x + b * y
    if (c > 80) continue
    // 同余：a*x ≡ c (mod b) 因为 by≡0
    const correct = x
    const wrong: number[] = []
    for (let t = 1; t <= 12; t++) {
      if (t === correct) continue
      if (mod(a * t, b) === mod(c, b) && (c - a * t) % b === 0) {
        const yy = (c - a * t) / b
        if (yy > 0) continue // 也是正整数解，跳过
      }
      wrong.push(t)
      if (wrong.length >= 3) break
    }
    if (wrong.length < 3) continue
    const itemA = pickOne(['笔', '本子', '水杯'])
    const itemB = pickOne(['橡皮', '文件夹', '钥匙扣'])
    return buildQuestion({
      difficulty: 'hard',
      term: '购物不定方程',
      hardTypeId: 'shop-diophantine',
      passage: `${itemA}每支 ${a} 元，${itemB}每个 ${b} 元，共花 ${c} 元，两种都买且数量均为正整数。`,
      stem: `${itemA}买了多少支？`,
      correct: String(correct),
      distractors: uniqueNum(correct, wrong),
      method: `对 ${b} 取模：${b}y≡0 ⇒ ${a}x≡${c} (mod ${b})，解出 x 再还原 y。`,
      explanation: `${a}x+${b}y=${c}。对 ${b} 取模得 ${a}x≡${mod(c, b)} (mod ${b})，得 x=${correct}，y=${y}。`,
      seq,
    })
  }
  return null
}

function genHardCrtThreeMin(seq: number): RemPropQuestion | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const m = pickOne([
      [3, 5, 8],
      [3, 7, 8],
      [4, 5, 7],
      [3, 5, 11],
      [5, 7, 8],
    ])
    const r = m.map((mi) => randInt(1, mi - 1))
    const ans = solveCrt(m, r)
    if (ans == null || ans < 20 || ans > 300) continue
    const wrong: number[] = []
    for (const cand of [ans + 1, ans - 1, ans + m[0]!, ans + m[1]!, 23, 53, 88, ans + 10]) {
      if (cand <= 0 || cand === ans) continue
      if (m.every((mi, i) => mod(cand, mi) === r[i]!)) continue
      if (!wrong.includes(cand)) wrong.push(cand)
      if (wrong.length >= 3) break
    }
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三同余求最小',
      hardTypeId: 'crt-three-min',
      passage: `正整数 n 满足：${m.map((mi, i) => `除以 ${mi} 余 ${r[i]}`).join('；')}。`,
      stem: 'n 的最小值是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最小：从小到大代入排除；或逐步合并同余式。',
      explanation: `满足 n≡${r.join(',')} (mod ${m.join(',')}) 的最小正整数为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardCrtFour(seq: number): RemPropQuestion | null {
  for (let attempt = 0; attempt < 25; attempt++) {
    const m = [3, 5, 7, 8]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6), randInt(0, 7)]
    if (r.every((x) => x === 0)) continue
    const sols = allCrtSolutionsUnder(m, r, 500)
    if (!sols.length) continue
    const ans = sols[0]!
    if (ans < 30) continue
    const wrong: number[] = []
    for (const cand of [ans + 3, ans - 5, ans + 15, 53, 88, 128, 158, ans + 1]) {
      if (cand <= 0 || cand === ans) continue
      if (m.every((mi, i) => mod(cand, mi) === r[i]!)) continue
      if (!wrong.includes(cand)) wrong.push(cand)
      if (wrong.length >= 3) break
    }
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '四条件同余',
      hardTypeId: 'crt-four',
      passage: `物体个数：3 个一余 ${r[0]}，5 个一余 ${r[1]}，7 个一余 ${r[2]}，8 个一余 ${r[3]}。`,
      stem: '个数最少是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '四条件同时成立，优先用代入排除；问最少从较小选项试起。',
      explanation: `最小正整数解为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardCrtMaxUnder(seq: number): RemPropQuestion | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const m = [3, 5, 7]
    const r = [randInt(0, 2), randInt(0, 4), randInt(0, 6)]
    const maxN = pickOne([100, 120, 150, 200])
    const sols = allCrtSolutionsUnder(m, r, maxN)
    if (sols.length < 2) continue
    const ans = sols[sols.length - 1]!
    const wrong: number[] = []
    // 干扰：更小的解、超过上界的、不满足的
    if (sols.length >= 2) wrong.push(sols[sols.length - 2]!)
    for (const cand of [ans + 3 * 5 * 7, ans - 1, maxN, sols[0]!]) {
      if (cand === ans || cand <= 0) continue
      if (cand <= maxN && m.every((mi, i) => mod(cand, mi) === r[i]!) && cand !== ans) {
        // 也是合法解但不是最大——可作为干扰
        if (!wrong.includes(cand)) wrong.push(cand)
      } else if (!m.every((mi, i) => mod(cand, mi) === r[i]!)) {
        if (!wrong.includes(cand)) wrong.push(cand)
      }
      if (wrong.length >= 3) break
    }
    while (wrong.length < 3) {
      const x = ans - wrong.length - 2
      if (x > 0 && x !== ans) wrong.push(x)
      else wrong.push(ans + 10 + wrong.length)
    }
    return buildQuestion({
      difficulty: 'hard',
      term: '上界内最大解',
      hardTypeId: 'crt-max-under',
      passage: `正整数 n≤${maxN}，且 ${m.map((mi, i) => `n÷${mi} 余 ${r[i]}`).join('，')}。`,
      stem: 'n 的最大值是？',
      correct: String(ans),
      distractors: uniqueNum(ans, wrong),
      method: '问最多/最大：从较大选项往下代入；通解为 n0+周期×k，取不超过上界的最大 k。',
      explanation: `周期 ${3 * 5 * 7}=105（若模两两互质）。不超过 ${maxN} 的最大解为 ${ans}。`,
      seq,
    })
  }
  return null
}

function genHardDiophantineReduce(seq: number): RemPropQuestion | null {
  // 类似教材 12x+10y=76 → 6x+5y=38
  for (let attempt = 0; attempt < 40; attempt++) {
    const g = pickOne([2, 3, 4])
    const a0 = pickOne([4, 5, 6, 7])
    const b0 = pickOne([3, 5, 7, 8])
    if (gcd(a0, b0) !== 1 && gcd(a0, b0) !== g) {
      /* ok */
    }
    const x = randInt(1, 6)
    const y = randInt(1, 6)
    const a = a0 * g
    const b = b0 * g
    const c = a * x + b * y
    if (c > 100) continue
    // 问 x
    const correct = x
    const wrong = uniqueNum(correct, [y, x + 1, y + 1, a0, b0, x + y]).map(Number)
    if (wrong.length < 3) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '先约分再同余',
      hardTypeId: 'diophantine-reduce',
      passage: `正整数 x、y 满足 ${a}x+${b}y=${c}。`,
      stem: 'x 的值是？',
      correct: String(correct),
      distractors: uniqueNum(correct, wrong),
      method: `先除以公约数 ${g} 得 ${a0}x+${b0}y=${c / g}；再对 ${b0} 取模消去 y。`,
      explanation: `约去 ${g} 后 ${a / g}x+${b / g}y=${c / g}。对 ${b / g} 取模：${a / g}x≡${mod(c / g, b / g)}，得 x=${correct}，y=${y}。`,
      seq,
    })
  }
  return null
}

function genHardProdFindRem(seq: number): RemPropQuestion | null {
  // (k*x) ≡ r (mod m), find x mod m；k 与 m 未必互质时要小心
  for (let attempt = 0; attempt < 30; attempt++) {
    const m = pickOne([5, 7, 8, 9])
    const k = pickOne([2, 3, 4, 6])
    const xRem = randInt(0, m - 1)
    const prodRem = mod(k * xRem, m)
    // 可能多解：找所有 x 使 k*x ≡ prodRem (mod m)
    const sols: number[] = []
    for (let t = 0; t < m; t++) {
      if (mod(k * t, m) === prodRem) sols.push(t)
    }
    if (sols.length !== 1) continue // 只要唯一解
    const correct = sols[0]!
    const wrong = uniqueNum(correct, [prodRem, mod(k, m), (correct + 1) % m, (correct + 2) % m, 0])
    return buildQuestion({
      difficulty: 'hard',
      term: '由积余反推因数余',
      hardTypeId: 'prod-find-rem',
      passage: `已知某数 x 满足：(${k}×x)÷${m} 的余数是 ${prodRem}。又知 ${k}÷${m} 余 ${mod(k, m)}。`,
      stem: `x÷${m} 的余数是？`,
      correct: String(correct),
      distractors: wrong,
      method: '积与余数之积同余：若 k≡k\'，kx≡r，则 k\'·(x 的余数)≡r (mod m)。',
      explanation: `${mod(k, m)}×(x 的余数)≡${prodRem} (mod ${m})，唯一解余数为 ${correct}。`,
      seq,
    })
  }
  return null
}

function genHardMixedExprRem(seq: number): RemPropQuestion | null {
  const m = pickOne([7, 9, 11, 13])
  const a = randInt(200, 900)
  const b = randInt(200, 900)
  const c = randInt(50, 200)
  const d = randInt(50, 200)
  const ans = mod(a * b + c - d, m)
  return buildQuestion({
    difficulty: 'hard',
    term: '混合运算求余（加强）',
    hardTypeId: 'mixed-expr-rem',
    stem: `(${a}×${b}+${c}−${d})÷${m} 的余数是？`,
    correct: String(ans),
    distractors: uniqueNum(ans, [
      mod(a * b, m),
      mod(a + b + c - d, m),
      mod(a * b + c, m),
      (ans + 1) % m,
      (ans + 3) % m,
    ]),
    method: '逐项取余再运算；乘法余数相乘后可能再超过 m，需再取余。',
    explanation: `各数 mod ${m} 后计算，得余数 ${ans}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<RemPropHardTypeId, (seq: number) => RemPropQuestion | null> = {
  'score-draw': genHardScoreDraw,
  'score-ask-other': genHardScoreAskOther,
  'shop-diophantine': genHardShop,
  'crt-three-min': genHardCrtThreeMin,
  'crt-four': genHardCrtFour,
  'crt-max-under': genHardCrtMaxUnder,
  'diophantine-reduce': genHardDiophantineReduce,
  'prod-find-rem': genHardProdFindRem,
  'mixed-expr-rem': genHardMixedExprRem,
}

function tryBuild(factory: () => RemPropQuestion | null, maxTry = 30): RemPropQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateRemPropPaper(difficulty: RemPropDifficulty): RemPropQuestion[] {
  const out: RemPropQuestion[] = []
  const seen = new Set<string>()

  const push = (q: RemPropQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasySumRem, genEasyDiffRem, genEasyProdRem, genEasyMixedRem]
    let guard = 0
    while (out.length < REM_PROP_QUESTION_COUNT && guard++ < 100) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumScoreDraw(0),
      () => genMediumScoreDraw(1),
      () => genMediumCrtGroup(2),
      () => genMediumCrtGroup(3),
      () => genMediumExprRem(4),
      () => genMediumExprRem(5),
      () => (Math.random() < 0.5 ? genMediumScoreDraw(6) : genMediumCrtGroup(6)),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < REM_PROP_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => genMediumCrtGroup(out.length)))
    }
  } else {
    const types = shuffleInPlace([...REM_PROP_HARD_EXAM_TYPES.map((t) => t.id)]).slice(
      0,
      REM_PROP_QUESTION_COUNT,
    )
    for (const typeId of types) {
      const builder = HARD_BUILDERS[typeId]
      let q: RemPropQuestion | null = null
      for (let t = 0; t < 40; t++) {
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

  if (out.length < REM_PROP_QUESTION_COUNT) {
    throw new Error(`余数及其性质组卷不足：仅 ${out.length}/${REM_PROP_QUESTION_COUNT}`)
  }
  return out.slice(0, REM_PROP_QUESTION_COUNT)
}
