/**
 * 高频运算 · 普通行程问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。
 *
 * 覆盖教材公式：
 * 1. s = v × t
 * 2. 比例：t 定 → s∝v；v 定 → s∝t；s 定 → v∝1/t
 * 3. 平均速度 v̄ = s/(t1+…+tn) = s/(s1/v1+…+sn/vn)
 * 4. 两段等距特值：v̄ = 2v1v2/(v1+v2)
 *
 * 【简单】略低于经典真题 1/2/3：直接套公式
 * 【中等】对齐经典真题 1（迟到早到）、2（提速早到）、3（等距平均速度）
 * 【困难】更高阶；登记 ≥8 种变式，每轮抽 6 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type OrdinaryTravelDifficulty = 'easy' | 'medium' | 'hard'

export const ORDINARY_TRAVEL_QUESTION_COUNT = 6

export const ORDINARY_TRAVEL_MODES: {
  id: OrdinaryTravelDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '普通行程 · 简单',
    desc: '每轮 6 题 · 略低于经典真题 · 直接套 s=vt / 比例 / 平均速度 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '普通行程 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 1～3（迟到早到、提速、等距平均速度）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '普通行程 · 困难',
    desc: '每轮 6 题 · 比经典真题更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

/** 困难题 ≥8 种结构变式（记录后按不同数字/题型轮换考查） */
export const ORDINARY_TRAVEL_HARD_EXAM_TYPES = [
  {
    id: 'late-early-plus',
    name: '迟到早到加强',
    note: '经典真题 1 加强：两种速度 + 额外约束或求路程',
  },
  {
    id: 'two-stage-speedup',
    name: '分段提速早到',
    note: '经典真题 2 加强：全程提速与后半段提速对照求全程',
  },
  {
    id: 'three-segment-avg',
    name: '三段不等距平均速度',
    note: '三段路程不同速度，求全程平均速度或总时间',
  },
  {
    id: 'round-trip-rest',
    name: '往返+停留',
    note: '上坡下坡不同速，中间停留，求单程或总时',
  },
  {
    id: 'ratio-chain',
    name: '比例连环',
    note: '多段时间/速度比连环求某段路程',
  },
  {
    id: 'avg-then-remain',
    name: '先平均再剩余',
    note: '已知前半平均速度，后半速度变，求剩余时间或全程均速',
  },
  {
    id: 'leave-speed-combo',
    name: '出发时刻+变速',
    note: '何时出发与提速/降速条件联立',
  },
  {
    id: 'two-route-compare',
    name: '两路线对照',
    note: '两条路线不同路程速度，同时出发比到达',
  },
  {
    id: 'meet-from-ends',
    name: '两端相向（普通行程）',
    note: '两端出发相向，用 s=(v1+v2)t 求路程或时间',
  },
  {
    id: 'return-catch',
    name: '折返追及（普通行程）',
    note: '一人折返或变速后追及，路程关系更复杂',
  },
] as const

export type OrdinaryTravelHardTypeId = (typeof ORDINARY_TRAVEL_HARD_EXAM_TYPES)[number]['id']

export type OrdinaryTravelQuestion = {
  id: string
  topic: 'ordinary-travel'
  difficulty: OrdinaryTravelDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: OrdinaryTravelHardTypeId
}

export function ordinaryTravelTopicLabel(): string {
  return '普通行程问题'
}

export function ordinaryTravelDifficultyLabel(d: OrdinaryTravelDifficulty): string {
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
    const n = Number(correct)
    const fake = Number.isFinite(n) ? String(Math.round(n) + g + 1) : `${correct}+${g}`
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

function approxEq(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps
}

function isNiceInt(n: number): boolean {
  return Number.isFinite(n) && approxEq(n, Math.round(n)) && n > 0
}

function buildQuestion(input: {
  difficulty: OrdinaryTravelDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: OrdinaryTravelHardTypeId
  seq: number
}): OrdinaryTravelQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'ordinary-travel',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ot-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'ordinary-travel',
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

// ——— 简单：覆盖全部基本公式，难度低于真题 ———

/** s = v × t */
function genEasySvt(seq: number): OrdinaryTravelQuestion | null {
  const mode = pickOne(['s', 'v', 't'] as const)
  if (mode === 's') {
    const v = pickOne([40, 50, 60, 75, 80, 100])
    const t = pickOne([2, 3, 4, 5])
    const s = v * t
    return buildQuestion({
      difficulty: 'easy',
      term: '核心公式求路程',
      passage: `一辆车以 ${v} 千米/小时的速度匀速行驶 ${t} 小时。`,
      stem: '行驶的路程是多少千米？',
      correct: String(s),
      distractors: uniqueNum(s, [v + t, v * (t + 1), v * t - v, t * 100]),
      method: '路程 s = 速度 v × 时间 t。',
      explanation: `s = ${v}×${t} = ${s}（千米）。`,
      seq,
    })
  }
  if (mode === 'v') {
    const s = pickOne([120, 150, 180, 240, 300])
    const t = pickOne([2, 3, 4, 5, 6])
    if (s % t !== 0) return null
    const v = s / t
    return buildQuestion({
      difficulty: 'easy',
      term: '核心公式求速度',
      passage: `某车行驶 ${s} 千米，共用时 ${t} 小时。`,
      stem: '平均速度是多少千米/小时？',
      correct: String(v),
      distractors: uniqueNum(v, [s - t, s / (t + 1), t * 10, v + 10]),
      method: '速度 v = 路程 s ÷ 时间 t。',
      explanation: `v = ${s}÷${t} = ${v}（千米/小时）。`,
      seq,
    })
  }
  const s = pickOne([90, 120, 150, 180, 240])
  const v = pickOne([30, 40, 50, 60])
  if (s % v !== 0) return null
  const t = s / v
  return buildQuestion({
    difficulty: 'easy',
    term: '核心公式求时间',
    passage: `路程 ${s} 千米，匀速 ${v} 千米/小时。`,
    stem: '需要多少小时？',
    correct: String(t),
    distractors: uniqueNum(t, [t + 1, t - 1, s - v, v / 10]),
    method: '时间 t = 路程 s ÷ 速度 v。',
    explanation: `t = ${s}÷${v} = ${t}（小时）。`,
    seq,
  })
}

/** 时间一定：s ∝ v */
function genEasyPropT(seq: number): OrdinaryTravelQuestion | null {
  const t = pickOne([2, 3, 4])
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([80, 90, 100, 120])
  if (v2 <= v1) return null
  const s1 = v1 * t
  const s2 = v2 * t
  return buildQuestion({
    difficulty: 'easy',
    term: '时间一定 · 路程比=速度比',
    passage: `甲、乙同时出发，行驶相同时间 ${t} 小时；甲速 ${v1} 千米/小时，乙速 ${v2} 千米/小时。`,
    stem: '乙比甲多行驶多少千米？',
    correct: String(s2 - s1),
    distractors: uniqueNum(s2 - s1, [s2, s1, v2 - v1, (v2 - v1) * (t + 1)]),
    method: '时间一定时，路程与速度成正比：s = v×t。',
    explanation: `乙路程 ${s2}，甲路程 ${s1}，差 ${s2 - s1}。`,
    seq,
  })
}

/** 速度一定：s ∝ t */
function genEasyPropV(seq: number): OrdinaryTravelQuestion | null {
  const v = pickOne([40, 50, 60, 80])
  const t1 = pickOne([2, 3])
  const t2 = pickOne([4, 5, 6])
  if (t2 <= t1) return null
  const s1 = v * t1
  const s2 = v * t2
  return buildQuestion({
    difficulty: 'easy',
    term: '速度一定 · 路程比=时间比',
    passage: `匀速 ${v} 千米/小时。先走 ${t1} 小时，再走 ${t2} 小时。`,
    stem: '第二段比第一段多走多少千米？',
    correct: String(s2 - s1),
    distractors: uniqueNum(s2 - s1, [s2, s1, v * (t2 - t1 + 1), t2 - t1]),
    method: '速度一定时，路程与时间成正比。',
    explanation: `第二段 ${s2}，第一段 ${s1}，差 ${s2 - s1}。`,
    seq,
  })
}

/** 路程一定：v ∝ 1/t */
function genEasyPropS(seq: number): OrdinaryTravelQuestion | null {
  const s = pickOne([120, 180, 240])
  const v1 = pickOne([40, 60])
  const v2 = pickOne([60, 80, 120])
  if (v2 <= v1 || s % v1 !== 0 || s % v2 !== 0) return null
  const t1 = s / v1
  const t2 = s / v2
  return buildQuestion({
    difficulty: 'easy',
    term: '路程一定 · 速度与时间反比',
    passage: `同一段路程 ${s} 千米。步行速度 ${v1} 千米/小时，骑车速度 ${v2} 千米/小时。`,
    stem: '骑车比步行少用多少小时？',
    correct: String(t1 - t2),
    distractors: uniqueNum(t1 - t2, [t1, t2, v2 - v1, t1 + t2]),
    method: '路程一定时，速度与时间成反比：t = s/v。',
    explanation: `步行 ${t1} 小时，骑车 ${t2} 小时，少用 ${t1 - t2} 小时。`,
    seq,
  })
}

/** 等距平均速度 v̄ = 2v1v2/(v1+v2) */
function genEasyAvgEqual(seq: number): OrdinaryTravelQuestion | null {
  const v1 = pickOne([20, 30, 40, 50])
  const v2 = pickOne([40, 60, 80, 90])
  if (v2 <= v1) return null
  const num = 2 * v1 * v2
  const den = v1 + v2
  if (num % den !== 0) return null
  const avg = num / den
  const half = pickOne([30, 40, 60, 90])
  return buildQuestion({
    difficulty: 'easy',
    term: '等距平均速度',
    passage: `上下山路程相等。上山 ${v1} 千米/小时，下山 ${v2} 千米/小时。单程 ${half} 千米。`,
    stem: '往返的平均速度是多少千米/小时？',
    correct: String(avg),
    distractors: uniqueNum(avg, [(v1 + v2) / 2, v1, v2, (v1 + v2) / 2 + 5]),
    method: '两段路程相等时，平均速度 = 2v1v2/(v1+v2)，不是 (v1+v2)/2。',
    explanation: `v̄ = 2×${v1}×${v2}/(${v1}+${v2}) = ${avg}。`,
    seq,
  })
}

/** 一般平均速度：已知分段路程与速度 */
function genEasyAvgGeneral(seq: number): OrdinaryTravelQuestion | null {
  const s1 = pickOne([60, 80, 100])
  const v1 = pickOne([40, 50])
  const s2 = pickOne([60, 90, 120])
  const v2 = pickOne([60, 90])
  if (s1 % v1 !== 0 && (s1 * 2) % (v1 * 2) !== 0) {
    /* allow .5 hours */
  }
  const t1 = s1 / v1
  const t2 = s2 / v2
  const totalS = s1 + s2
  const totalT = t1 + t2
  const avg = totalS / totalT
  if (!isNiceInt(avg) && !approxEq(avg, Math.round(avg * 2) / 2)) return null
  const ans = approxEq(avg, Math.round(avg)) ? String(Math.round(avg)) : String(avg)
  const ansNum = Number(ans)
  return buildQuestion({
    difficulty: 'easy',
    term: '一般平均速度',
    passage: `先以 ${v1} 千米/小时行驶 ${s1} 千米，再以 ${v2} 千米/小时行驶 ${s2} 千米。`,
    stem: '全程平均速度是多少千米/小时？',
    correct: ans,
    distractors: uniqueNum(ansNum, [(v1 + v2) / 2, v1, v2, totalS / Math.max(t1, t2)]),
    method: '平均速度 = 总路程 ÷ 总时间 = (s1+s2)/(s1/v1+s2/v2)。',
    explanation: `总路程 ${totalS}，总时间 ${t1}+${t2}=${totalT}，平均速度 ${ans}。`,
    seq,
  })
}

// ——— 中等：对齐经典真题 1 / 2 / 3 ———

/** 经典真题 1：迟到/早到，路程一定 */
function genMediumLateEarly(seq: number): OrdinaryTravelQuestion | null {
  // 50(m/min)*(t+12)=150*(t-8) → t=18；参数化
  const vWalk = pickOne([40, 50, 60])
  const vBike = pickOne([120, 150, 180])
  if (vBike <= vWalk * 2) return null
  const late = pickOne([10, 12, 15])
  const early = pickOne([6, 8, 10])
  // vWalk*(t+late)=vBike*(t-early)
  // t*(vBike-vWalk)=vWalk*late+vBike*early
  const den = vBike - vWalk
  const num = vWalk * late + vBike * early
  if (num % den !== 0) return null
  const t = num / den
  if (t <= early || !isNiceInt(t) || t > 60) return null
  const ask = pickOne(['leave', 'dist'] as const)
  if (ask === 'leave') {
    return buildQuestion({
      difficulty: 'medium',
      term: '迟到早到求出发提前量（经典真题 1）',
      passage: `老张从家到单位。若步行 ${vWalk} 米/分，会迟到 ${late} 分钟；若骑车 ${vBike} 米/分，会早到 ${early} 分钟。`,
      stem: '老张出发时距离上班开始还有多少分钟？',
      correct: String(t),
      distractors: uniqueNum(t, [late + early, t + 2, t - 2, (late + early) * 2, 18]),
      method: '路程一定：v1(t+迟到)=v2(t−早到)，解 t。',
      explanation: `${vWalk}(t+${late})=${vBike}(t−${early}) ⇒ t=${t}。`,
      seq,
    })
  }
  const dist = vWalk * (t + late)
  return buildQuestion({
    difficulty: 'medium',
    term: '迟到早到求路程（经典真题 1）',
    passage: `若以 ${vWalk} 米/分走，迟到 ${late} 分钟；以 ${vBike} 米/分骑，早到 ${early} 分钟。`,
    stem: '家到单位的路程是多少米？',
    correct: String(dist),
    distractors: uniqueNum(dist, [vWalk * t, vBike * (t - early), dist + 100, vWalk * late]),
    method: '先解出预留时间 t，再 s=v1(t+迟到)。',
    explanation: `t=${t}，s=${vWalk}×(${t}+${late})=${dist}。`,
    seq,
  })
}

/** 经典真题 2：提速早到 + 分段提速 */
function genMediumSpeedup(seq: number): OrdinaryTravelQuestion | null {
  for (let attempt = 0; attempt < 50; attempt++) {
    const p1 = pickOne([20, 25, 50])
    const p2 = pickOne([25, 30, 50])
    if (p1 === p2) continue
    const earlyMin = pickOne([45, 54, 60])
    const earlyH = earlyMin / 60
    const T = (earlyH * (100 + p1)) / p1
    const remOrigT = (earlyH * (100 + p2)) / p2
    const firstT = T - remOrigT
    if (firstT <= 0.05) continue
    for (const firstKm of shuffleInPlace([18, 20, 24, 30, 36, 40, 48, 60])) {
      const speed = firstKm / firstT
      const ans = speed * T
      if (!isNiceInt(ans) || ans < 80 || ans > 360) continue
      if (!approxEq(speed * firstT, firstKm, 1e-6)) continue
      return buildQuestion({
        difficulty: 'medium',
        term: '提速早到求路程（经典真题 2）',
        passage: `赵某计划匀速从甲地到乙地。若从一开始就提速 ${p1}%，可早到 ${earlyMin} 分钟；若先按原速走 ${firstKm} 千米，再提速 ${p2}%，也可早到 ${earlyMin} 分钟。`,
        stem: '甲乙两地相距多少千米？',
        correct: String(Math.round(ans)),
        distractors: uniqueNum(Math.round(ans), [
          Math.round(ans) - 20,
          Math.round(ans) + 20,
          160,
          200,
          240,
          firstKm * 5,
        ]),
        method:
          '路程一定时速度与时间反比。全程提速与后半段提速两次早到条件，用份数求出原计划时间与前段原速时间，再得原速与全程。',
        explanation: `全程提速 ${p1}%：原计划时间 ${T} 小时；后半提速 ${p2}%：剩余原速时间 ${remOrigT} 小时；前 ${firstKm} 千米用时 ${firstT} 小时，全程 ${Math.round(ans)} 千米。`,
        seq,
      })
    }
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '提速早到求路程（经典真题 2）',
    passage:
      '赵某计划匀速从甲地到乙地。若一开始就提速 25%，可早到 54 分钟；若先按原速走 24 千米，再提速 30%，也可早到 54 分钟。',
    stem: '甲乙两地相距多少千米？',
    correct: '180',
    distractors: uniqueNum(180, [160, 200, 240]),
    method: '比例法：路程一定，速度比与时间比互为反比；两段条件对照求原速时间与前段时间。',
    explanation:
      '提速 25%→速度比 4:5→时间比 5:4，差 1 份=0.9 小时，原时间 4.5 小时。后半提速 30%→速度比 10:13→时间比 13:10，差 3 份=0.9，剩余原速时间 3.9 小时。前 24 千米用 0.6 小时，原速 40，全程 180。',
    seq,
  })
}

/** 经典真题 3：等距往返平均速度 */
function genMediumMountain(seq: number): OrdinaryTravelQuestion | null {
  const vUp = pickOne([4, 5, 6])
  const vDown = pickOne([8, 10, 12])
  if (vDown <= vUp) return null
  const totalH = pickOne([4, 5, 6, 8])
  const avg = (2 * vUp * vDown) / (vUp + vDown)
  const round = avg * totalH
  const oneWay = round / 2
  if (!isNiceInt(oneWay) && !approxEq(oneWay * 2, Math.round(oneWay * 2))) return null
  const ans = approxEq(oneWay, Math.round(oneWay)) ? Math.round(oneWay) : oneWay
  if (!isNiceInt(Number(ans)) && !approxEq(Number(ans) * 2, Math.round(Number(ans) * 2)))
    return null
  const ansStr = String(ans)
  return buildQuestion({
    difficulty: 'medium',
    term: '等距往返求单程（经典真题 3）',
    passage: `部队登山训练，上山 ${vUp} 千米/小时，下山 ${vDown} 千米/小时，往返共 ${totalH} 小时（路程相等）。`,
    stem: '山脚到山顶的距离是多少千米？',
    correct: ansStr,
    distractors: uniqueNum(Number(ans), [
      ((vUp + vDown) / 2) * totalH / 2,
      vUp * totalH,
      vDown * totalH / 2,
      20,
      30,
    ]),
    method: '等距往返平均速度 = 2v1v2/(v1+v2)；单程 = 往返路程/2 = v̄×总时间/2。',
    explanation: `v̄=2×${vUp}×${vDown}/(${vUp}+${vDown})=${avg}；往返路程=${avg}×${totalH}；单程=${ansStr}。`,
    seq,
  })
}

function genMediumPropMix(seq: number): OrdinaryTravelQuestion | null {
  // 中等补充：路程一定，已知两速时间差求路程
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([80, 100, 120])
  const dt = pickOne([1, 1.5, 2])
  // s/v1 - s/v2 = dt → s(v2-v1)/(v1v2)=dt → s = dt*v1*v2/(v2-v1)
  const s = (dt * v1 * v2) / (v2 - v1)
  if (!isNiceInt(s)) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '路程一定 · 时间差求路程',
    passage: `同一段路，以 ${v1} 千米/小时走比以 ${v2} 千米/小时走多用 ${dt} 小时。`,
    stem: '这段路长多少千米？',
    correct: String(s),
    distractors: uniqueNum(s, [v1 * dt, v2 * dt, (v1 + v2) * dt, s + 20]),
    method: 's/v1 − s/v2 = Δt ⇒ s = Δt·v1·v2/(v2−v1)。',
    explanation: `s=${dt}×${v1}×${v2}/(${v2}−${v1})=${s}。`,
    seq,
  })
}

function genMediumAvgEqualAskTime(seq: number): OrdinaryTravelQuestion | null {
  const v1 = pickOne([30, 40])
  const v2 = pickOne([60, 80, 120])
  const oneWay = pickOne([60, 90, 120])
  const avg = (2 * v1 * v2) / (v1 + v2)
  const t = (2 * oneWay) / avg
  if (!isNiceInt(t) && !approxEq(t * 2, Math.round(t * 2))) return null
  const ans = approxEq(t, Math.round(t)) ? String(Math.round(t)) : String(t)
  return buildQuestion({
    difficulty: 'medium',
    term: '等距往返求总时间',
    passage: `去程 ${v1} 千米/小时，回程 ${v2} 千米/小时，单程 ${oneWay} 千米。`,
    stem: '往返一共需要多少小时？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [oneWay / v1 + oneWay / v2 + 1, (2 * oneWay) / ((v1 + v2) / 2), 6]),
    method: '总时间 = 2s / v̄，或 s/v1+s/v2；v̄=2v1v2/(v1+v2)。',
    explanation: `t=${oneWay}/${v1}+${oneWay}/${v2}=${ans}。`,
    seq,
  })
}

// ——— 困难变式 ≥8 ———

function genHardLateEarlyPlus(seq: number): OrdinaryTravelQuestion | null {
  const v1 = pickOne([45, 50, 60])
  const v2 = pickOne([135, 150, 180])
  const late = pickOne([12, 15, 18])
  const early = pickOne([8, 9, 12])
  const den = v2 - v1
  const num = v1 * late + v2 * early
  if (num % den !== 0) return null
  const t = num / den
  if (t <= early || !isNiceInt(t)) return null
  const s = v1 * (t + late)
  // 再问：若以中间速度，会怎样
  const v3 = (v1 + v2) / 2
  if (!isNiceInt(v3)) return null
  const t3 = s / v3
  const delta = t - t3 // 相对上班开始：正=早到，负=迟到
  const absMin = Math.round(Math.abs(delta))
  if (!isNiceInt(absMin) || absMin === 0) return null
  const stem =
    delta > 0
      ? `若以 ${v3} 米/分的速度出发，相对上班开始会早到多少分钟？`
      : `若以 ${v3} 米/分的速度出发，相对上班开始会迟到多少分钟？`
  return buildQuestion({
    difficulty: 'hard',
    term: '迟到早到加强 · 第三速度',
    hardTypeId: 'late-early-plus',
    passage: `步行 ${v1} 米/分会迟到 ${late} 分钟；骑车 ${v2} 米/分会早到 ${early} 分钟。`,
    stem,
    correct: String(absMin),
    distractors: uniqueNum(absMin, [late, early, late + early, t, Math.abs(late - early)]),
    method: '先由两速条件解出预留时间 t 与路程 s，再算第三速用时与 t 比较。',
    explanation: `t=${t}，s=${s}；第三速用时 ${t3} 分，与 t 相差 ${absMin} 分。`,
    seq,
  })
}

function genHardTwoStage(seq: number): OrdinaryTravelQuestion | null {
  for (let attempt = 0; attempt < 50; attempt++) {
    const p1 = pickOne([20, 25, 50])
    const p2 = pickOne([25, 30, 50])
    if (p1 === p2) continue
    const earlyMin = pickOne([48, 54, 60, 72])
    const earlyH = earlyMin / 60
    const T = (earlyH * (100 + p1)) / p1
    const remOrigT = (earlyH * (100 + p2)) / p2
    const firstT = T - remOrigT
    if (firstT <= 0.05) continue
    for (const firstKm of shuffleInPlace([24, 30, 36, 40, 48, 60, 72])) {
      const speed = firstKm / firstT
      const ans = speed * T
      if (!isNiceInt(ans) || ans < 100 || ans > 480) continue
      return buildQuestion({
        difficulty: 'hard',
        term: '分段提速早到（加强）',
        hardTypeId: 'two-stage-speedup',
        passage: `计划匀速走完全程。一开始就提速 ${p1}% 可早到 ${earlyMin} 分钟；先按原速走 ${firstKm} 千米再提速 ${p2}%，同样早到 ${earlyMin} 分钟。`,
        stem: '全程多少千米？',
        correct: String(Math.round(ans)),
        distractors: uniqueNum(Math.round(ans), [
          Math.round(ans) - 20,
          Math.round(ans) + 20,
          firstKm * 6,
          240,
          160,
        ]),
        method: '两次「提速—早到」用反比份数求原计划时间与前段时间，再求原速与全程。',
        explanation: `原计划 ${T} 小时，前段 ${firstT} 小时走 ${firstKm} 千米，全程 ${Math.round(ans)} 千米。`,
        seq,
      })
    }
  }
  return null
}

function genHardThreeSeg(seq: number): OrdinaryTravelQuestion | null {
  const s1 = pickOne([40, 60, 80])
  const v1 = pickOne([40, 50])
  const s2 = pickOne([60, 90])
  const v2 = pickOne([60, 90])
  const s3 = pickOne([60, 80, 120])
  const v3 = pickOne([40, 80, 120])
  const t = s1 / v1 + s2 / v2 + s3 / v3
  const s = s1 + s2 + s3
  const avg = s / t
  if (!isNiceInt(avg)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '三段不等距平均速度',
    hardTypeId: 'three-segment-avg',
    passage: `三段路程依次为 ${s1}、${s2}、${s3} 千米，速度依次为 ${v1}、${v2}、${v3} 千米/小时。`,
    stem: '全程平均速度是多少千米/小时？',
    correct: String(avg),
    distractors: uniqueNum(avg, [(v1 + v2 + v3) / 3, (v1 + v3) / 2, s / 3, avg + 10]),
    method: 'v̄ = 总路程 ÷ 总时间 = (s1+s2+s3)/(s1/v1+s2/v2+s3/v3)。',
    explanation: `总路程 ${s}，总时间 ${t}，平均速度 ${avg}。`,
    seq,
  })
}

function genHardRoundRest(seq: number): OrdinaryTravelQuestion | null {
  const vUp = pickOne([5, 6])
  const vDown = pickOne([10, 12, 15])
  const rest = pickOne([0.5, 1])
  const oneWay = pickOne([15, 20, 30])
  const moveT = oneWay / vUp + oneWay / vDown
  const totalT = moveT + rest
  if (!isNiceInt(totalT) && !approxEq(totalT * 2, Math.round(totalT * 2))) return null
  // 问：不含休息的往返平均速度
  const avg = (2 * oneWay) / moveT
  if (!isNiceInt(avg) && !approxEq(avg * 2, Math.round(avg * 2))) return null
  const ans = approxEq(avg, Math.round(avg)) ? String(Math.round(avg)) : String(avg)
  return buildQuestion({
    difficulty: 'hard',
    term: '往返停留 · 求运动平均速度',
    hardTypeId: 'round-trip-rest',
    passage: `上山 ${vUp} 千米/小时，下山 ${vDown} 千米/小时，单程 ${oneWay} 千米，山顶停留 ${rest} 小时。`,
    stem: '不计停留时间，往返运动的平均速度是多少千米/小时？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [
      (2 * oneWay) / totalT,
      (vUp + vDown) / 2,
      (2 * vUp * vDown) / (vUp + vDown),
    ]),
    method: '停留不计入运动时间；等距时也可用 2v1v2/(v1+v2)。',
    explanation: `运动时间 ${moveT} 小时，往返 ${2 * oneWay} 千米，平均速度 ${ans}。`,
    seq,
  })
}

function genHardRatioChain(seq: number): OrdinaryTravelQuestion | null {
  const v = pickOne([40, 50, 60])
  // 三段时间比 1:2:3，求最长段路程
  const parts = pickOne([
    [1, 2, 3],
    [2, 3, 4],
    [1, 1, 2],
  ] as const)
  const unit = pickOne([0.5, 1])
  const times = parts.map((p) => p * unit)
  const dists = times.map((t) => v * t)
  const longest = Math.max(...dists)
  const total = dists.reduce((a, b) => a + b, 0)
  return buildQuestion({
    difficulty: 'hard',
    term: '速度一定 · 时间比连环',
    hardTypeId: 'ratio-chain',
    passage: `匀速 ${v} 千米/小时，分三段行驶，用时之比为 ${parts.join('∶')}，最短一段用时 ${times[0]} 小时。`,
    stem: '最长一段路程是多少千米？',
    correct: String(longest),
    distractors: uniqueNum(longest, [total, dists[0]!, v, longest - v]),
    method: '速度一定时 s∝t；先按比求出各段时间，再 s=v×t。',
    explanation: `各段时间 ${times.join('、')} 小时，最长路程 ${longest}。`,
    seq,
  })
}

function genHardAvgRemain(seq: number): OrdinaryTravelQuestion | null {
  const half = pickOne([60, 80, 100])
  const v1 = pickOne([40, 50])
  const v2 = pickOne([60, 80, 100])
  const t1 = half / v1
  const t2 = half / v2
  const avg = (2 * half) / (t1 + t2)
  if (!isNiceInt(avg)) return null
  // 问后半段用时
  return buildQuestion({
    difficulty: 'hard',
    term: '等距两段 · 已知前速求后时',
    hardTypeId: 'avg-then-remain',
    passage: `全程分成相等的两段，每段 ${half} 千米。前半段以 ${v1} 千米/小时行驶，后半段以 ${v2} 千米/小时行驶。`,
    stem: '后半段需要多少小时？',
    correct: String(t2),
    distractors: uniqueNum(t2, [t1, t1 + t2, half / avg, 2]),
    method: '等距时后半时间 = s/v2；也可先求全程平均速度再分配。',
    explanation: `后半时间 = ${half}/${v2} = ${t2}。全程平均速度 ${avg}。`,
    seq,
  })
}

function genHardLeaveCombo(seq: number): OrdinaryTravelQuestion | null {
  const vSlow = pickOne([40, 50, 60])
  const vFast = pickOne([120, 150, 180])
  const late = pickOne([12, 15, 18])
  const early = pickOne([8, 10, 12])
  const den = vFast - vSlow
  const num = vSlow * late + vFast * early
  if (num % den !== 0) return null
  const t = num / den
  if (!isNiceInt(t) || t <= early) return null
  const s = vSlow * (t + late)
  const vNeed = s / t
  if (!isNiceInt(vNeed)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '出发时刻+变速 · 求准时速度',
    hardTypeId: 'leave-speed-combo',
    passage: `以 ${vSlow} 米/分会迟到 ${late} 分钟；以 ${vFast} 米/分会早到 ${early} 分钟。`,
    stem: '要刚好正点到达，速度应是多少米/分？',
    correct: String(vNeed),
    distractors: uniqueNum(vNeed, [vSlow, vFast, (vSlow + vFast) / 2, vNeed + 10]),
    method: '先解预留时间 t 与路程，准时速度 = s/t。',
    explanation: `由 ${vSlow}(t+${late})=${vFast}(t−${early}) 得 t=${t}，s=${s}，准时速度 ${vNeed} 米/分。`,
    seq,
  })
}

function genHardTwoRoute(seq: number): OrdinaryTravelQuestion | null {
  const sA = pickOne([120, 150, 180])
  const vA = pickOne([40, 50, 60])
  const sB = pickOne([100, 160, 200])
  const vB = pickOne([50, 80, 100])
  if (sA % vA !== 0 || sB % vB !== 0) return null
  const tA = sA / vA
  const tB = sB / vB
  const diff = Math.abs(tA - tB)
  if (!isNiceInt(diff) && !approxEq(diff * 2, Math.round(diff * 2))) return null
  const who = tA < tB ? '甲' : '乙'
  const ans = approxEq(diff, Math.round(diff)) ? String(Math.round(diff)) : String(diff)
  return buildQuestion({
    difficulty: 'hard',
    term: '两路线同时出发',
    hardTypeId: 'two-route-compare',
    passage: `甲走 A 路线 ${sA} 千米、速度 ${vA} 千米/小时；乙走 B 路线 ${sB} 千米、速度 ${vB} 千米/小时。两人同时出发。`,
    stem: `${who}比另一人早到多少小时？`,
    correct: ans,
    distractors: uniqueNum(Number(ans), [tA, tB, tA + tB, Math.abs(sA - sB) / 10]),
    method: '分别算 t=s/v，再比较时间差。',
    explanation: `甲用时 ${tA}，乙用时 ${tB}，${who}早到 ${ans} 小时。`,
    seq,
  })
}

function genHardMeet(seq: number): OrdinaryTravelQuestion | null {
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([50, 70, 80])
  const t = pickOne([2, 3, 4])
  const s = (v1 + v2) * t
  return buildQuestion({
    difficulty: 'hard',
    term: '两端相向求路程',
    hardTypeId: 'meet-from-ends',
    passage: `甲、乙两地相距未知。两人分别从两地相向而行，甲速 ${v1} 千米/小时，乙速 ${v2} 千米/小时，${t} 小时后相遇。`,
    stem: '甲乙两地相距多少千米？',
    correct: String(s),
    distractors: uniqueNum(s, [v1 * t, v2 * t, Math.abs(v1 - v2) * t, s + 20]),
    method: '相向路程 = (v1+v2)×相遇时间。',
    explanation: `s=(${v1}+${v2})×${t}=${s}。`,
    seq,
  })
}

function genHardReturnCatch(seq: number): OrdinaryTravelQuestion | null {
  // 甲先走 t0，乙出发同向追；或甲到中点折返
  const vA = pickOne([40, 50])
  const vB = pickOne([60, 80])
  if (vB <= vA) return null
  const headStart = pickOne([1, 2])
  const lead = vA * headStart
  const catchT = lead / (vB - vA)
  if (!isNiceInt(catchT) && !approxEq(catchT * 2, Math.round(catchT * 2))) return null
  const ans = approxEq(catchT, Math.round(catchT)) ? String(Math.round(catchT)) : String(catchT)
  const distWhenCatch = vB * Number(ans)
  return buildQuestion({
    difficulty: 'hard',
    term: '同向追及',
    hardTypeId: 'return-catch',
    passage: `甲以 ${vA} 千米/小时先出发 ${headStart} 小时，乙以 ${vB} 千米/小时同向追赶。`,
    stem: '乙出发后多少小时追上甲？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [headStart, lead / vB, distWhenCatch / 10, Number(ans) + 1]),
    method: '追及路程差 = 甲领先路程；时间 = 领先路程 ÷ 速度差。',
    explanation: `领先 ${lead} 千米，追及时差速度 ${vB - vA}，用时 ${ans} 小时。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  OrdinaryTravelHardTypeId,
  (seq: number) => OrdinaryTravelQuestion | null
> = {
  'late-early-plus': genHardLateEarlyPlus,
  'two-stage-speedup': genHardTwoStage,
  'three-segment-avg': genHardThreeSeg,
  'round-trip-rest': genHardRoundRest,
  'ratio-chain': genHardRatioChain,
  'avg-then-remain': genHardAvgRemain,
  'leave-speed-combo': genHardLeaveCombo,
  'two-route-compare': genHardTwoRoute,
  'meet-from-ends': genHardMeet,
  'return-catch': genHardReturnCatch,
}

function tryBuild(
  factory: () => OrdinaryTravelQuestion | null,
  maxTry = 50,
): OrdinaryTravelQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateOrdinaryTravelPaper(
  difficulty: OrdinaryTravelDifficulty,
): OrdinaryTravelQuestion[] {
  const out: OrdinaryTravelQuestion[] = []
  const seen = new Set<string>()

  const push = (q: OrdinaryTravelQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasySvt,
      genEasyPropT,
      genEasyPropV,
      genEasyPropS,
      genEasyAvgEqual,
      genEasyAvgGeneral,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= ORDINARY_TRAVEL_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < ORDINARY_TRAVEL_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumLateEarly,
      genMediumSpeedup,
      genMediumMountain,
      genMediumPropMix,
      genMediumAvgEqualAskTime,
      genMediumLateEarly,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= ORDINARY_TRAVEL_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < ORDINARY_TRAVEL_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const types = shuffleInPlace([...ORDINARY_TRAVEL_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= ORDINARY_TRAVEL_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
    }
    let guard = 0
    while (out.length < ORDINARY_TRAVEL_QUESTION_COUNT && guard++ < 40) {
      const typeId = pickOne(ORDINARY_TRAVEL_HARD_EXAM_TYPES).id
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
    }
  }

  return out.slice(0, ORDINARY_TRAVEL_QUESTION_COUNT)
}
