/**
 * 高频运算 · 直角三角形常用结论
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 【简单】比经典真题 3 简单：勾股数、30°/45° 边比直接求边
 * 【中等】对齐经典真题 3：指挥部—正北集合—30°直角三角形—同时到达
 * 【困难】比经典真题 3 更难，登记 ≥6 种变式；每轮抽 5 种且互不重复
 * 1. dual-angle-gather：甲乙两侧分别为 30°/60°，联立求集合距离
 * 2. fortyfive-gather：45° 等腰直角 + 不同时速同时到达
 * 3. offset-north：集合点偏东/偏西（不正北），两步勾股
 * 4. space-corner：立体直角（房间对角/蛛蝇最短路投影）
 * 5. nested-share：两个直角三角形共边/共斜边嵌套
 * 6. reflection-path：反射最短路径（直角折线）
 * 7. two-redirect：两次改向仍同时到达
 * 8. chord-30：圆周/弦上 30° 直角关系求半径或弦长
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type RightTriangleDifficulty = 'easy' | 'medium' | 'hard'

export const RIGHT_TRIANGLE_QUESTION_COUNT = 5

export const RIGHT_TRIANGLE_MODES: {
  id: RightTriangleDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '直角三角形 · 简单',
    desc: '每轮 5 题 · 勾股数与 30°/45° 边比直接求边 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '直角三角形 · 中等',
    desc: '每轮 5 题 · 对齐经典真题 3（正北集合+30°+同时到达）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '直角三角形 · 困难',
    desc: '每轮 5 题 · 比经典真题 3 更难的 8 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const RIGHT_TRIANGLE_HARD_EXAM_TYPES = [
  {
    id: 'dual-angle-gather',
    name: '双侧 30°/60° 集合',
    note: '甲侧 30°、乙侧 60°，两速不同且有时差，求正北距离',
  },
  {
    id: 'fortyfive-gather',
    name: '45° 等腰集合',
    note: '集合点正北，一侧为 45° 等腰直角，同时到达',
  },
  {
    id: 'offset-north',
    name: '偏北集合两步勾股',
    note: '集合点不正对指挥部，先平移再勾股',
  },
  {
    id: 'space-corner',
    name: '立体直角最短路',
    note: '长方体表面最短路或空间直角三角形求棱',
  },
  {
    id: 'nested-share',
    name: '嵌套共边直角三角形',
    note: '大小直角三角形共直角边，求未知边或面积',
  },
  {
    id: 'reflection-path',
    name: '反射最短折线',
    note: '镜面反射化直，直角折线求最短路',
  },
  {
    id: 'two-redirect',
    name: '两次改向同时到',
    note: '先沿直线再两次改向，仍同时到达求距离',
  },
  {
    id: 'chord-30',
    name: '弦上 30° 直角',
    note: '直径所对圆周角/弦心距与 30° 联立',
  },
] as const

export type RightTriangleHardTypeId = (typeof RIGHT_TRIANGLE_HARD_EXAM_TYPES)[number]['id']

export type RightTriangleQuestion = {
  id: string
  topic: 'right-triangle'
  difficulty: RightTriangleDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: RightTriangleHardTypeId
}

export function rightTriangleTopicLabel(): string {
  return '直角三角形常用结论'
}

export function rightTriangleDifficultyLabel(d: RightTriangleDifficulty): string {
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
    const fake = Number.isFinite(n) ? String(n + g + 1) : `${g}:${g + 1}`
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

function approxInt(x: number): number {
  return Math.round(x)
}

function buildQuestion(input: {
  difficulty: RightTriangleDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: RightTriangleHardTypeId
  seq: number
}): RightTriangleQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'right-triangle',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `right-triangle-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'right-triangle',
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

function genEasyPythagorean(seq: number): RightTriangleQuestion | null {
  const triples: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [7, 24, 25],
    [8, 15, 17],
    [9, 12, 15],
    [9, 40, 41],
    [20, 21, 29],
  ]
  const k = pickOne([1, 2, 3])
  const [a0, b0, c0] = pickOne(triples)
  const a = a0 * k
  const b = b0 * k
  const c = c0 * k
  const ask = pickOne(['c', 'a', 'b'] as const)
  if (ask === 'c') {
    return buildQuestion({
      difficulty: 'easy',
      term: '勾股求斜边',
      passage: `直角三角形两直角边分别为 ${a}、${b}。`,
      stem: '斜边长是？',
      correct: String(c),
      distractors: uniqueNum(c, [a + b, c + k, c - k, a * b, Math.hypot(a, b - k)]),
      method: '勾股定理：斜边² = 直角边² + 直角边²。',
      explanation: `${a}²+${b}²=${a * a}+${b * b}=${a * a + b * b}=${c}²，斜边=${c}。`,
      seq,
    })
  }
  const known = ask === 'a' ? b : a
  const miss = ask === 'a' ? a : b
  return buildQuestion({
    difficulty: 'easy',
    term: '勾股求直角边',
    passage: `直角三角形斜边为 ${c}，一条直角边为 ${known}。`,
    stem: '另一条直角边长是？',
    correct: String(miss),
    distractors: uniqueNum(miss, [c - known, c + known, known, miss + k]),
    method: '直角边 = √(斜边² − 已知直角边²)。',
    explanation: `√(${c}²−${known}²)=√${c * c - known * known}=${miss}。`,
    seq,
  })
}

function genEasy30(seq: number): RightTriangleQuestion | null {
  const short = pickOne([2, 3, 4, 5, 6, 8])
  const hyp = 2 * short
  const long = approxInt(short * Math.sqrt(3))
  const ask = pickOne(['hyp', 'short', 'long'] as const)
  if (ask === 'hyp') {
    return buildQuestion({
      difficulty: 'easy',
      term: '30° 求斜边',
      passage: `直角三角形有一个角是 30°，30° 所对直角边（较短直角边）长为 ${short}。`,
      stem: '斜边长是？',
      correct: String(hyp),
      distractors: uniqueNum(hyp, [short, long, short * 3, hyp + 1]),
      method: '30° 直角三角形：较短直角边 : 斜边 = 1 : 2。',
      explanation: `斜边 = 2×${short}=${hyp}。`,
      seq,
    })
  }
  if (ask === 'short') {
    return buildQuestion({
      difficulty: 'easy',
      term: '30° 求较短直角边',
      passage: `直角三角形有一个角是 30°，斜边长为 ${hyp}。`,
      stem: '30° 所对的直角边长是？',
      correct: String(short),
      distractors: uniqueNum(short, [hyp, long, short + 1, hyp / 3]),
      method: '30° 所对直角边 = 斜边 / 2。',
      explanation: `${hyp}/2=${short}。`,
      seq,
    })
  }
  // long leg ≈ short√3；选项用精确表达或整数近似题改为问「较短边」避免根号选项麻烦
  const exact = `${short}√3`
  return buildQuestion({
    difficulty: 'easy',
    term: '30° 求较长直角边',
    passage: `直角三角形有一个角是 30°，较短直角边长为 ${short}。`,
    stem: '较长直角边长是？',
    correct: exact,
    distractors: uniqueStr(exact, [`${short}√2`, String(2 * short), `${2 * short}√3`, String(short)]),
    method: '30° 直角三角形三边比 1 : √3 : 2，较长直角边 = 较短边 × √3。',
    explanation: `较长直角边 = ${short}√3。`,
    seq,
  })
}

function genEasy45(seq: number): RightTriangleQuestion | null {
  const leg = pickOne([2, 3, 4, 5, 6, 8, 10])
  const ask = pickOne(['hyp', 'leg'] as const)
  if (ask === 'hyp') {
    const ans = `${leg}√2`
    return buildQuestion({
      difficulty: 'easy',
      term: '45° 求斜边',
      passage: `等腰直角三角形的直角边长为 ${leg}。`,
      stem: '斜边长是？',
      correct: ans,
      distractors: uniqueStr(ans, [`${leg}√3`, String(2 * leg), `${2 * leg}√2`, String(leg)]),
      method: '45° 直角三角形：直角边 : 斜边 = 1 : √2。',
      explanation: `斜边 = ${leg}√2。`,
      seq,
    })
  }
  const hypExpr = `${leg}√2`
  return buildQuestion({
    difficulty: 'easy',
    term: '45° 求直角边',
    passage: `等腰直角三角形的斜边长为 ${hypExpr}。`,
    stem: '直角边长是？',
    correct: String(leg),
    distractors: uniqueNum(leg, [2 * leg, leg + 1, leg - 1, leg * 2]),
    method: '直角边 = 斜边 / √2；若斜边 = a√2，则直角边 = a。',
    explanation: `斜边 ${hypExpr}，直角边 = ${leg}。`,
    seq,
  })
}

function genEasyIdentify(seq: number): RightTriangleQuestion | null {
  const cases = [
    {
      a: 6,
      b: 8,
      c: 10,
      ans: '是，勾股数 (3,4,5) 的 2 倍',
      wrong: ['不是直角三角形', '是，勾股数 (5,12,13)', '无法判断'],
    },
    {
      a: 5,
      b: 12,
      c: 13,
      ans: '是直角三角形',
      wrong: ['不是直角三角形', '是钝角三角形', '是锐角三角形但非直角'],
    },
    {
      a: 5,
      b: 5,
      c: approxInt(5 * Math.sqrt(2)),
      ans: '等腰直角（约 45°）',
      wrong: ['30° 直角三角形', '不是直角三角形', '三边成 3:4:5'],
    },
  ]
  const t = pickOne(cases)
  return buildQuestion({
    difficulty: 'easy',
    term: '判定直角三角形',
    passage: `三角形三边长分别为 ${t.a}、${t.b}、${t.c}。`,
    stem: '下列判断正确的是？',
    correct: t.ans,
    distractors: uniqueStr(t.ans, t.wrong),
    method: '最大边为斜边候选，检验 a²+b²=c²；两直角边相等则为 45° 等腰直角。',
    explanation: `${t.a}²+${t.b}²=${t.a * t.a + t.b * t.b}，${t.c}²=${t.c * t.c}。结论：${t.ans}。`,
    seq,
  })
}

// ——— 中等：经典真题 3 型 ———

/** 经典结构：CD = Va·Δt/(√3−1)，约整后四选一 */
function classicGatherCd(va: number, deltaHour: number): number {
  return va * deltaHour / (Math.sqrt(3) - 1)
}

function genMediumClassicGather(seq: number): RightTriangleQuestion | null {
  const banks = [
    { va: 60, delta: 0.5, story: '军演' as const },
    { va: 80, delta: 0.5, story: '军演' as const },
    { va: 60, delta: 1 / 3, story: '搜救' as const },
    { va: 90, delta: 0.5, story: '军演' as const },
    { va: 40, delta: 0.5, story: '徒步' as const },
    { va: 72, delta: 0.5, story: '车队' as const },
  ]
  const b = pickOne(banks)
  const cd = approxInt(classicGatherCd(b.va, b.delta))
  const deltaText =
    b.delta === 0.5 ? '半小时' : b.delta === 1 / 3 ? '20 分钟' : `${b.delta} 小时`
  const roleA = b.story === '徒步' ? '甲组' : b.story === '车队' ? '甲车队' : '甲部队'
  const roleB = b.story === '徒步' ? '乙组' : b.story === '车队' ? '乙车队' : '乙部队'
  const hq = b.story === '搜救' ? '指挥中心' : '指挥部'
  const gather = b.story === '搜救' ? '会合点' : '集合点'
  const unit = '千米'

  return buildQuestion({
    difficulty: 'medium',
    term: '正北集合（经典真题 3）',
    passage: `${roleA}从${hq}出发向西以 ${b.va} ${unit}/小时行进，${deltaText}后${roleB}从${hq}出发向东行进，速度比${roleA}慢。两队同时接到紧急指令，要求到${hq}正北的${gather}集结。此时两队所在位置与${gather}恰好构成一个有 30° 角的直角三角形。两队立即改向${gather}并保持原速，结果同时到达。`,
    stem: `${gather}距${hq}大约多少${unit}？`,
    correct: String(cd),
    distractors: uniqueNum(cd, [cd - 3, cd + 3, cd - 7, cd + 7, approxInt(cd * 1.15), 38, 44, 48]),
    method:
      '设乙出发后 t 小时接到指令。甲侧 30°：较短直角边 CD 对 30°，则 AC=CD√3、AD=2·CD。由边比与同时到达关系可推得 CD = Va·t，并与 AC=Va(t+Δt) 联立，得 t=Δt/(√3−1)，CD=Va·Δt/(√3−1)。',
    explanation: `Va=${b.va}，时差 Δt=${b.delta}。CD = ${b.va}×${b.delta}/(√3−1) ≈ ${classicGatherCd(b.va, b.delta).toFixed(2)}，约 ${cd}。`,
    seq,
  })
}

function genMedium45Gather(seq: number): RightTriangleQuestion | null {
  // 45° at A: AC = CD, AD = CD√2; with CD = Va*t and AC = Va(t+Δt) ⇒ t = t+Δt 不可能
  // 改用：45° 在甲侧则 AC=CD，同时到达 AD/Va = BD/Vb。简化题：已知 AC 与 CD 相等的等腰直角，求斜边路程时间比
  const va = pickOne([60, 80, 90])
  const cd = pickOne([30, 40, 50, 60])
  const ac = cd
  const ad = approxInt(cd * Math.sqrt(2))
  const timeHour = ad / va
  const mins = approxInt(timeHour * 60)
  return buildQuestion({
    difficulty: 'medium',
    term: '45° 正北集合求时间',
    passage: `甲车从指挥部向西行驶，接到指令时距指挥部 ${ac} 千米；集合点在指挥部正北 ${cd} 千米。已知此时甲车位置、指挥部、集合点构成等腰直角三角形（45°）。甲立即改向集合点，时速 ${va} 千米。`,
    stem: '甲大约多少分钟后到达集合点？',
    correct: String(mins),
    distractors: uniqueNum(mins, [mins - 10, mins + 10, approxInt((cd / va) * 60), approxInt((ac / va) * 60)]),
    method: '45° 等腰直角：斜边 = 直角边 × √2；时间 = 路程 / 速度。',
    explanation: `斜边 AD=${cd}√2≈${(cd * Math.sqrt(2)).toFixed(1)} 千米；时间≈${timeHour.toFixed(2)} 小时≈${mins} 分钟。`,
    seq,
  })
}

function genMediumTwoLegFind(seq: number): RightTriangleQuestion | null {
  const va = pickOne([50, 60, 80])
  const tA = pickOne([1.5, 2, 2.5])
  const ac = va * tA
  // 30° at A: CD = AC/√3
  const cd = approxInt(ac / Math.sqrt(3))
  return buildQuestion({
    difficulty: 'medium',
    term: '先西行再求正北距',
    passage: `甲部队以 ${va} 千米/小时向西行进 ${tA} 小时后接到集合令。集合点在指挥部正北，此时甲的位置与指挥部、集合点构成直角三角形，且甲所在锐角为 30°。`,
    stem: '集合点距指挥部大约多少千米？',
    correct: String(cd),
    distractors: uniqueNum(cd, [approxInt(ac / 2), approxInt(ac), cd + 5, cd - 5, approxInt(ac * Math.sqrt(3))]),
    method: '30° 在甲处：对边 CD 是斜边 AD 的一半，邻边 AC=CD√3，故 CD=AC/√3。',
    explanation: `AC=${va}×${tA}=${ac}；CD=${ac}/√3≈${(ac / Math.sqrt(3)).toFixed(1)}，约 ${cd}。`,
    seq,
  })
}

function genMediumPythagApply(seq: number): RightTriangleQuestion | null {
  const west = pickOne([30, 40, 60, 80])
  const north = pickOne([40, 50, 60, 90])
  const dist = approxInt(Math.hypot(west, north))
  return buildQuestion({
    difficulty: 'medium',
    term: '直角转向求直距',
    passage: `一艘船先向西航行 ${west} 千米，再转向正北航行 ${north} 千米。`,
    stem: '此时船距出发点大约多少千米？',
    correct: String(dist),
    distractors: uniqueNum(dist, [west + north, Math.abs(west - north), dist + 10, dist - 10]),
    method: '东西与南北方向互相垂直，用勾股定理求直线距离。',
    explanation: `√(${west}²+${north}²)=√${west * west + north * north}≈${Math.hypot(west, north).toFixed(1)}，约 ${dist}。`,
    seq,
  })
}

// ——— 困难变式 ———

function genHardDualAngle(seq: number): RightTriangleQuestion | null {
  // 直角在指挥部：∠A=30°⇒AC=h√3, AD=2h；∠B=60°⇒BC=h/√3, BD=2h/√3
  // 同时到达 ⇒ Vb=Va/√3；再联立得 h=Va·Δt/(√3−1)。困难侧重点问乙速或总时长。
  const va = pickOne([60, 80, 90])
  const delta = pickOne([0.5, 1 / 3, 0.4])
  const t = delta / (Math.sqrt(3) - 1)
  const h = va * t
  const vb = va / Math.sqrt(3)
  const deltaLabel = delta === 0.5 ? '半小时' : delta === 1 / 3 ? '20 分钟' : '0.4 小时'
  const ask = pickOne(['h', 'vb', 'totalTime'] as const)
  if (ask === 'h') {
    const ans = approxInt(h)
    return buildQuestion({
      difficulty: 'hard',
      term: '双侧 30°/60° 集合',
      hardTypeId: 'dual-angle-gather',
      passage: `甲以 ${va} 千米/小时向西，${deltaLabel}后乙向东出发。接到指令时：指挥部正北集合点与甲、乙位置构成直角三角形，甲处锐角 30°、乙处锐角 60°。两队改向后原速同时到达。`,
      stem: '集合点距指挥部大约多少千米？',
      correct: String(ans),
      distractors: uniqueNum(ans, [ans - 5, ans + 5, approxInt(va * delta), approxInt(h / Math.sqrt(3))]),
      method: '甲 30°、乙 60°：AC=h√3，BC=h/√3；同时到达得 Vb=Va/√3，再与路程方程联立得 h=Va·Δt/(√3−1)。',
      explanation: `t=Δt/(√3−1)≈${t.toFixed(3)}；h=Va·t≈${h.toFixed(1)}，约 ${ans}。`,
      seq,
    })
  }
  if (ask === 'vb') {
    const ans = approxInt(vb)
    return buildQuestion({
      difficulty: 'hard',
      term: '双侧 30°/60° 求乙速',
      hardTypeId: 'dual-angle-gather',
      passage: `甲速 ${va} 千米/小时向西，乙稍后向东。指令下达时甲处 30°、乙处 60°（直角在指挥部），且改向后同时到达集合点（指挥部正北）。`,
      stem: '乙的速度大约多少千米/小时？',
      correct: String(ans),
      distractors: uniqueNum(ans, [va, approxInt(va / 2), ans + 10, approxInt(va * Math.sqrt(3))]),
      method: '同时到达 + 边比：AD=2h，BD=2h/√3 ⇒ Vb=Va/√3。',
      explanation: `Vb=${va}/√3≈${vb.toFixed(1)}，约 ${ans}。`,
      seq,
    })
  }
  const total = t + delta + (2 * h) / va
  const ans = approxInt(total * 60)
  return buildQuestion({
    difficulty: 'hard',
    term: '双侧角求总用时',
    hardTypeId: 'dual-angle-gather',
    passage: `甲速 ${va} 千米/小时，时差 ${deltaLabel}。甲 30°、乙 60°，正北集合且同时到达。`,
    stem: '从甲出发到甲到达集合点，大约多少分钟？',
    correct: String(ans),
    distractors: uniqueNum(ans, [ans - 15, ans + 15, approxInt((t + delta) * 60), approxInt(t * 60)]),
    method: '先求 t 与 h，甲总时间 = (t+Δt) + AD/Va，AD=2h。',
    explanation: `t≈${t.toFixed(3)}，h≈${h.toFixed(1)}，AD=2h；甲总时间≈${total.toFixed(2)} 小时≈${ans} 分钟。`,
    seq,
  })
}

function genHard45Gather(seq: number): RightTriangleQuestion | null {
  // 预制可解参数，避免在线搜索过慢
  const banks: { va: number; vb: number; t: number; h: number }[] = []
  for (const va of [60, 80, 100, 120]) {
    for (const vb of [40, 45, 50, 55]) {
      if (vb >= va) continue
      const k = 2 * vb * vb - va * va
      if (k <= 0) continue
      const rootK = Math.sqrt(k)
      if (vb <= rootK) continue
      const t = (0.5 * rootK) / (vb - rootK)
      if (t <= 0 || t > 4) continue
      const h = va * (t + 0.5)
      if (h < 15 || h > 350) continue
      banks.push({ va, vb, t, h })
    }
  }
  if (!banks.length) return null
  const b = pickOne(banks)
  const ans = approxInt(b.h)
  return buildQuestion({
    difficulty: 'hard',
    term: '45° 等腰集合',
    hardTypeId: 'fortyfive-gather',
    passage: `甲以 ${b.va} 千米/小时向西，半小时后乙以 ${b.vb} 千米/小时向东。指令时甲处为 45° 等腰直角（集合点在指挥部正北），两队改向后原速同时到达。`,
    stem: '集合点距指挥部大约多少千米？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      ans - 8,
      ans + 8,
      approxInt(b.va * 0.5),
      approxInt(b.h / Math.sqrt(2)),
      ans + 15,
    ]),
    method: '甲 45° ⇒ AC=CD=h，AD=h√2；结合 BC=Vb·t 与同时到达列方程求 t，再得 h=Va(t+0.5)。',
    explanation: `解得 t≈${b.t.toFixed(3)}，h=${b.va}(t+0.5)≈${b.h.toFixed(1)}，约 ${ans}。`,
    seq,
  })
}

function genHardOffsetNorth(seq: number): RightTriangleQuestion | null {
  const west = pickOne([30, 40, 50, 60])
  const east = pickOne([20, 30, 40])
  const north = pickOne([40, 50, 60, 80])
  const offset = pickOne([10, 15, 20])
  // 集合点在指挥部东偏北：先到东 offset 再北 north；甲在西 west，乙在东 east
  // 甲到集合：水平 west+offset，竖直 north
  const da = approxInt(Math.hypot(west + offset, north))
  const db = approxInt(Math.hypot(Math.abs(east - offset), north))
  const ask = pickOne(['da', 'sum', 'diff'] as const)
  if (ask === 'da') {
    return buildQuestion({
      difficulty: 'hard',
      term: '偏北集合两步勾股',
      hardTypeId: 'offset-north',
      passage: `指挥部为原点。甲在正西 ${west} 千米，乙在正东 ${east} 千米。集合点在指挥部东侧 ${offset} 千米再向北 ${north} 千米处。`,
      stem: '甲到集合点的直线距离大约多少千米？',
      correct: String(da),
      distractors: uniqueNum(da, [db, west + north, da + 5, approxInt(Math.hypot(west, north))]),
      method: '东西方向距离与南北方向距离互相垂直，分别求 Δx、Δy 后勾股。',
      explanation: `甲的 Δx=${west}+${offset}=${west + offset}，Δy=${north}；距离√(${west + offset}²+${north}²)≈${Math.hypot(west + offset, north).toFixed(1)}，约 ${da}。`,
      seq,
    })
  }
  if (ask === 'sum') {
    const ans = da + db
    return buildQuestion({
      difficulty: 'hard',
      term: '偏北集合路程和',
      hardTypeId: 'offset-north',
      passage: `甲在西 ${west} 千米，乙在东 ${east} 千米；集合点在东 ${offset}、北 ${north} 千米。两队直线赶往集合点。`,
      stem: '两队路程之和大约多少千米？',
      correct: String(ans),
      distractors: uniqueNum(ans, [da, db, ans - 10, west + east + north]),
      method: '分别对甲、乙做勾股，再求和。',
      explanation: `甲≈${da}，乙≈${db}，和≈${ans}。`,
      seq,
    })
  }
  const ans = Math.abs(da - db)
  return buildQuestion({
    difficulty: 'hard',
    term: '偏北集合路程差',
    hardTypeId: 'offset-north',
    passage: `甲西 ${west}、乙东 ${east}；集合点东 ${offset} 北 ${north}。`,
    stem: '两队直线路程相差大约多少千米？',
    correct: String(ans),
    distractors: uniqueNum(ans, [da, db, ans + 5, Math.abs(west - east)]),
    method: '分别勾股后求差的绝对值。',
    explanation: `|${da}−${db}|=${ans}。`,
    seq,
  })
}

function genHardSpaceCorner(seq: number): RightTriangleQuestion | null {
  const a = pickOne([3, 4, 5, 6])
  const b = pickOne([4, 5, 6, 8])
  const c = pickOne([5, 6, 8, 10])
  // 表面最短：展开后 √((a+b)²+c²) 或 √((a+c)²+b²) 等取最小
  const paths = [
    Math.hypot(a + b, c),
    Math.hypot(a + c, b),
    Math.hypot(b + c, a),
  ]
  const shortest = Math.min(...paths)
  const ans = approxInt(shortest)
  return buildQuestion({
    difficulty: 'hard',
    term: '立体直角最短路',
    hardTypeId: 'space-corner',
    passage: `长方体房间长宽高分别为 ${a}、${b}、${c} 米。蜘蛛在一面墙的角落，苍蝇在相对墙的角落（空间相对）。蜘蛛沿表面爬行。`,
    stem: '最短路程大约多少米？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      approxInt(Math.hypot(a, b, c)),
      approxInt(paths[0]!),
      approxInt(paths[1]!),
      a + b + c,
    ]),
    method: '把相邻面展开成平面，最短路化为平面两点直线；比较三种展开取最小。',
    explanation: `三种展开：√((${a}+${b})²+${c}²)、√((${a}+${c})²+${b}²)、√((${b}+${c})²+${a}²)，最小≈${shortest.toFixed(1)}，约 ${ans}。`,
    seq,
  })
}

function genHardNestedShare(seq: number): RightTriangleQuestion | null {
  const a = pickOne([6, 8, 9, 12])
  const b = pickOne([8, 10, 12, 15])
  const c = Math.hypot(a, b)
  // 小三角形相似，高线上一点：内接直角三角形共斜边？改：大直角三角形内，以斜边上高分成两个小直角
  const h = (a * b) / c
  const ansAsk = pickOne(['h', 'area', 'p'] as const)
  if (ansAsk === 'h') {
    const ans = approxInt(h)
    return buildQuestion({
      difficulty: 'hard',
      term: '嵌套共边直角三角形',
      hardTypeId: 'nested-share',
      passage: `直角边为 ${a}、${b} 的直角三角形，过直角顶点向斜边作垂线。`,
      stem: '这条高大约长多少？',
      correct: String(ans),
      distractors: uniqueNum(ans, [a, b, approxInt(c), approxInt(h / 2)]),
      method: '面积相等：½ab = ½c·h ⇒ h=ab/c。',
      explanation: `斜边 c=√(${a}²+${b}²)≈${c.toFixed(2)}；h=ab/c≈${h.toFixed(2)}，约 ${ans}。`,
      seq,
    })
  }
  if (ansAsk === 'area') {
    const area = (a * b) / 2
    const ans = approxInt(area)
    return buildQuestion({
      difficulty: 'hard',
      term: '嵌套求面积',
      hardTypeId: 'nested-share',
      passage: `直角边 ${a}、${b}；斜边上的高把原三角形分成两个小直角三角形。`,
      stem: '原三角形面积是？',
      correct: String(ans),
      distractors: uniqueNum(ans, [a * b, ans / 2, a + b, approxInt(c * h / 2)]),
      method: '直角三角形面积 = 两直角边乘积的一半。',
      explanation: `S=½×${a}×${b}=${area}。`,
      seq,
    })
  }
  const p1 = (a * a) / c
  const ans = approxInt(p1)
  return buildQuestion({
    difficulty: 'hard',
    term: '射影定理求投影',
    hardTypeId: 'nested-share',
    passage: `直角边为 ${a}、${b} 的直角三角形，斜边上的高把斜边分为两段。`,
    stem: '直角边 ${a} 在斜边上的投影长大约是？',
    correct: String(ans),
    distractors: uniqueNum(ans, [approxInt((b * b) / c), approxInt(c / 2), a, approxInt(h)]),
    method: '射影定理：直角边² = 斜边 × 该边在斜边上的投影。',
    explanation: `投影 = ${a}²/c ≈ ${p1.toFixed(2)}，约 ${ans}。`,
    seq,
  })
}

function genHardReflection(seq: number): RightTriangleQuestion | null {
  const x1 = pickOne([3, 4, 5])
  const x2 = pickOne([6, 8, 9])
  const w = pickOne([4, 5, 6, 8])
  // 两岸距离 w，A、B 沿岸距离差；最短路反射：√((x2-x1)²+(2w)²) 若同侧？
  // 经典：河宽 w，两端点离某点距离，对岸取水最短 = 反射
  const path = Math.hypot(x1 + x2, w)
  const ans = approxInt(path)
  return buildQuestion({
    difficulty: 'hard',
    term: '反射最短折线',
    hardTypeId: 'reflection-path',
    passage: `河宽 ${w} 千米，南岸 A 距河岸某垂足正东 ${x1} 千米，北岸 B 距对岸对应垂足正东 ${x2} 千米。要从 A 到河岸取水再前往 B，使路程最短。`,
    stem: '最短路程大约多少千米？',
    correct: String(ans),
    distractors: uniqueNum(ans, [
      approxInt(Math.hypot(x1 + x2, 2 * w)),
      x1 + x2 + w,
      approxInt(Math.hypot(Math.abs(x2 - x1), w)),
      ans + 2,
    ]),
    method: '将北岸点关于河岸镜面反射，连线与河岸交点为取水点；最短路 = 到反射点的直线距。',
    explanation: `反射后等价于 √((${x1}+${x2})²+${w}²)≈${path.toFixed(2)}，约 ${ans}。`,
    seq,
  })
}

function genHardTwoRedirect(seq: number): RightTriangleQuestion | null {
  const h = pickOne([30, 40, 50, 60])
  const ac = approxInt(h * Math.sqrt(3))
  const ask = pickOne(['diff', 'timeDiff'] as const)
  if (ask === 'diff') {
    const corner = ac + h
    const direct = 2 * h
    const ans = approxInt(corner - direct)
    return buildQuestion({
      difficulty: 'hard',
      term: '两次改向路程差',
      hardTypeId: 'two-redirect',
      passage: `集合点在指挥部正北 ${h} 千米。甲接到指令时在正西，与集合点、指挥部成 30° 直角三角形。甲若先向正北走到与集合点同一纬度，再向东走到集合点；也可直接斜向驶向集合点。`,
      stem: '折线路程比直线路程大约多多少千米？',
      correct: String(ans),
      distractors: uniqueNum(ans, [h, ac, ans + 5, approxInt(direct), ans - 3]),
      method: '30°：AC=h√3，AD=2h。折线=AC+CD=h√3+h；直线=AD=2h；差=h(√3−1)。',
      explanation: `折线≈${(ac + h).toFixed(1)}，直线=${direct}，差≈${(ac + h - direct).toFixed(1)}，约 ${ans}。`,
      seq,
    })
  }
  const va = pickOne([60, 80])
  const vb = pickOne([40, 50])
  const tAfterA = (2 * h) / va
  const tAfterB = (h * Math.sqrt(2)) / vb
  const ans = Math.max(1, approxInt(Math.abs(tAfterA - tAfterB) * 60))
  return buildQuestion({
    difficulty: 'hard',
    term: '两次改向同时差',
    hardTypeId: 'two-redirect',
    passage: `甲速 ${va}、乙速 ${vb}。甲侧 30°、乙侧 45°（直角在指挥部），集合点正北 ${h} 千米。两队接到指令后直接改向集合点。`,
    stem: '两队到达时间相差大约多少分钟？（从各自接到指令起算）',
    correct: String(ans),
    distractors: uniqueNum(ans, [5, 10, 15, ans + 5, ans + 10]),
    method: '分别算 AD/Va 与 BD/Vb；AD=2h，BD=h√2。',
    explanation: `甲用时 ${tAfterA.toFixed(2)} 小时，乙用时 ${tAfterB.toFixed(2)} 小时，差约 ${ans} 分钟。`,
    seq,
  })
}

function genHardChord30(seq: number): RightTriangleQuestion | null {
  const r = pickOne([6, 8, 10, 12, 15])
  // 直径 AC=2r，圆周角 30°：对直径的圆周角是 90°；弦 AB 对圆心 60° 则弦长=r
  const ask = pickOne(['chord', 'dist', 'area'] as const)
  if (ask === 'chord') {
    // 圆心角 60° 弦长 = r
    const ans = r
    return buildQuestion({
      difficulty: 'hard',
      term: '弦上 30° 直角',
      hardTypeId: 'chord-30',
      passage: `圆半径为 ${r}。直径 AC 的一端 A 与圆上一点 B 相连，∠ABC=30°（B 在圆上，C 为直径另一端）。`,
      stem: '注意：直径所对圆周角为直角。若 ∠BAC=30°，则弦 BC 长是？',
      correct: String(ans),
      distractors: uniqueNum(ans, [2 * r, approxInt(r * Math.sqrt(3)), r / 2, approxInt(r * Math.sqrt(2))]),
      method: '直径所对圆周角 ∠ABC=90°；再有 30°，则 30° 所对直角边是斜边（直径）一半。',
      explanation: `斜边为直径 ${2 * r}，30° 所对边 BC = 直径/2 = ${r}。`,
      seq,
    })
  }
  if (ask === 'dist') {
    // 弦心距：30° 弦对圆心角 60° 时弦心距 = r√3/2；或对直径直角三角形高
    const d = approxInt((r * Math.sqrt(3)) / 2)
    return buildQuestion({
      difficulty: 'hard',
      term: '弦心距',
      hardTypeId: 'chord-30',
      passage: `半径 ${r} 的圆中，弦 AB 所对圆心角为 60°。`,
      stem: '弦心距大约是？',
      correct: String(d),
      distractors: uniqueNum(d, [r, approxInt(r / 2), approxInt(r * Math.sqrt(3)), d + 1]),
      method: '等腰三角形底边中线：弦心距 = r·cos(30°)=r√3/2（圆心角一半为 30°）。',
      explanation: `弦心距=${r}×√3/2≈${((r * Math.sqrt(3)) / 2).toFixed(2)}，约 ${d}。`,
      seq,
    })
  }
  const area = approxInt((Math.sqrt(3) / 4) * r * r)
  return buildQuestion({
    difficulty: 'hard',
    term: '圆内接 30° 直角面积',
    hardTypeId: 'chord-30',
    passage: `半径 ${r} 的圆中，以直径为斜边作含 30° 的直角三角形。`,
    stem: '该直角三角形面积大约是？',
    correct: String(area),
    distractors: uniqueNum(area, [r * r, approxInt(r * r / 2), area + 5, approxInt(Math.PI * r * r)]),
    method: '斜边 2r；30° 直角三角形两直角边为 r 与 r√3；面积=½·r·r√3。',
    explanation: `S=½·${r}·${r}√3≈${((Math.sqrt(3) / 4) * r * r).toFixed(1)}，约 ${area}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  RightTriangleHardTypeId,
  (seq: number) => RightTriangleQuestion | null
> = {
  'dual-angle-gather': genHardDualAngle,
  'fortyfive-gather': genHard45Gather,
  'offset-north': genHardOffsetNorth,
  'space-corner': genHardSpaceCorner,
  'nested-share': genHardNestedShare,
  'reflection-path': genHardReflection,
  'two-redirect': genHardTwoRedirect,
  'chord-30': genHardChord30,
}

function tryBuild(
  factory: () => RightTriangleQuestion | null,
  maxTry = 40,
): RightTriangleQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateRightTrianglePaper(
  difficulty: RightTriangleDifficulty,
): RightTriangleQuestion[] {
  const out: RightTriangleQuestion[] = []
  const seen = new Set<string>()

  const push = (q: RightTriangleQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [genEasyPythagorean, genEasy30, genEasy45, genEasyIdentify]
    let guard = 0
    while (out.length < RIGHT_TRIANGLE_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumClassicGather(0),
      () => genMedium45Gather(1),
      () => genMediumTwoLegFind(2),
      () => genMediumPythagApply(3),
      () => genMediumClassicGather(4),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < RIGHT_TRIANGLE_QUESTION_COUNT && guard++ < 50) {
      push(
        tryBuild(() =>
          pickOne([
            genMediumClassicGather,
            genMedium45Gather,
            genMediumTwoLegFind,
            genMediumPythagApply,
          ])(out.length),
        ),
      )
    }
  } else {
    const types = shuffleInPlace([...RIGHT_TRIANGLE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= RIGHT_TRIANGLE_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 12))
    }
    if (out.length < RIGHT_TRIANGLE_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= RIGHT_TRIANGLE_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 20)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < RIGHT_TRIANGLE_QUESTION_COUNT) {
    throw new Error(`直角三角形组卷不足：仅 ${out.length}/${RIGHT_TRIANGLE_QUESTION_COUNT}`)
  }
  return out.slice(0, RIGHT_TRIANGLE_QUESTION_COUNT)
}
