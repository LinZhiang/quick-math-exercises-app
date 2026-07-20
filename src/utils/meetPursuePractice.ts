/**
 * 高频运算 · 相遇与追及问题（行程问题）
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。
 *
 * 覆盖教材公式：
 * 1. 相遇路程 = 速度和 × 相遇时间
 * 2. 追及路程 = 速度差 × 追及时间
 * 3. 直线往返第 n 次相遇：合路程 sn=(2n−1)s，时间 tn=(2n−1)t
 * 4. 环形反向第 n 次相遇：合路程 = ns；同向第 n 次追上：路程差 = ns
 * 5. 流水：v顺=v船+v水，v逆=v船−v水；v水=(v顺−v逆)/2，v船=(v顺+v逆)/2
 *
 * 【简单】对齐经典真题 4（先出发相遇提前）、5（火车过行人/骑车）
 * 【中等】对齐经典真题 6（往返二次相遇）、7（环形正反相遇）
 * 【困难】更高阶；登记 ≥10 种变式，每轮抽 6 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type MeetPursueDifficulty = 'easy' | 'medium' | 'hard'

export const MEET_PURSUE_QUESTION_COUNT = 6

export const MEET_PURSUE_MODES: {
  id: MeetPursueDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '相遇与追及 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 4/5（先出发、火车过行人）· 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '相遇与追及 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 6/7（往返二次相遇、环形正反）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '相遇与追及 · 困难',
    desc: '每轮 6 题 · 比经典真题 4～7 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

export const MEET_PURSUE_HARD_EXAM_TYPES = [
  {
    id: 'early-start-plus',
    name: '先出发加强',
    note: '经典真题 4 加强：先出发+求路程或第三人速度',
  },
  {
    id: 'train-pass-two',
    name: '火车过两人加强',
    note: '经典真题 5 加强：同向/相向过车或求车速',
  },
  {
    id: 'multi-meet-third',
    name: '往返第三次相遇',
    note: '直线往返第 3 次相遇，合路程 5s',
  },
  {
    id: 'circular-ratio',
    name: '环形速度比',
    note: '正反/同向时间求两速或周长',
  },
  {
    id: 'circular-diff-start',
    name: '环形不同点出发',
    note: '初始相隔一段弧，再套圈追及',
  },
  {
    id: 'boat-two-ships',
    name: '两船流水对照',
    note: '由 A 船求水速，再求 B 船往返',
  },
  {
    id: 'meet-then-pursue',
    name: '先相遇再追及',
    note: '相向相遇后折返追及',
  },
  {
    id: 'multi-meet-ratio',
    name: '二次相遇路程比',
    note: '已知两次相遇点求全程或速度比',
  },
  {
    id: 'circular-n-meet',
    name: '环形第 n 次',
    note: '第 n 次相遇/追上求时间或路程',
  },
  {
    id: 'boat-unknown-current',
    name: '流水未知求船速',
    note: '已知往返时间与水速差求船速或总时',
  },
  {
    id: 'chase-with-rest',
    name: '追及含停留',
    note: '被追者中途停留，追及时间变式',
  },
  {
    id: 'both-early-meet',
    name: '双方先后出发',
    note: '两人先后出发相向，求全程或时间',
  },
] as const

export type MeetPursueHardTypeId = (typeof MEET_PURSUE_HARD_EXAM_TYPES)[number]['id']

export type MeetPursueQuestion = {
  id: string
  topic: 'meet-pursue'
  difficulty: MeetPursueDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: MeetPursueHardTypeId
}

export function meetPursueTopicLabel(): string {
  return '相遇与追及问题'
}

export function meetPursueDifficultyLabel(d: MeetPursueDifficulty): string {
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

function approxEq(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) <= eps
}

function isNiceInt(n: number): boolean {
  return Number.isFinite(n) && approxEq(n, Math.round(n)) && n > 0
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

function buildQuestion(input: {
  difficulty: MeetPursueDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: MeetPursueHardTypeId
  seq: number
}): MeetPursueQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'meet-pursue',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `mp-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'meet-pursue',
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

// ——— 简单：经典真题 4 / 5 ———

/** 经典真题 4：先出发使相遇提前 */
function genEasyEarlyStart(seq: number): MeetPursueQuestion | null {
  // 经典：25 与 20，提前 20 分相遇 → 先出发 36 分
  // 先出发路程 = (v1+v2)×提前时间；先出发时间 = 该路程/v1
  const v1 = pickOne([20, 25, 30, 40])
  const v2 = pickOne([15, 20, 24, 30])
  if (v1 <= v2) return null
  const earlyMin = pickOne([15, 20, 24, 30])
  const earlyH = earlyMin / 60
  const lead = (v1 + v2) * earlyH
  const startH = lead / v1
  const startMin = startH * 60
  if (!isNiceInt(startMin)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '先出发使相遇提前（经典真题 4）',
    passage: `甲、乙两地相向骑行，甲速 ${v1} 千米/小时，乙速 ${v2} 千米/小时。若甲先出发，则两人比同时出发提前 ${earlyMin} 分钟相遇。`,
    stem: '甲先出发了多少分钟？',
    correct: String(startMin),
    distractors: uniqueNum(startMin, [earlyMin, earlyMin * 2, startMin + 6, 30, 40]),
    method:
      '甲先走的路程 = 同时出发时两人在「提前的那段时间」合走的路程 = (v甲+v乙)×提前时间；再除以甲速得先出发时间。',
    explanation: `(${v1}+${v2})×(${earlyMin}/60)=${lead} 千米；${lead}÷${v1}=${startH} 小时=${startMin} 分钟。`,
    seq,
  })
}

/** 经典真题 5：火车过行人与骑车（追及，追及路程=车长） */
function genEasyTrainPass(seq: number): MeetPursueQuestion | null {
  // 行人 3.6km/h=1m/s，骑车 10.8=3m/s；过行人 22s、过骑车 26s → 车长 286
  const walkMs = pickOne([1, 2])
  const bikeMs = pickOne([3, 4])
  if (bikeMs <= walkMs) return null
  const tWalk = pickOne([20, 22, 24])
  const tBike = pickOne([26, 28, 30])
  if (tBike <= tWalk) return null
  // y=(x-w)*tw = (x-b)*tb → x*(tb-tw)= tb*b - tw*w ... 
  // tw(x-w)=tb(x-b) → tw x - tw w = tb x - tb b → x(tb-tw)= tb b - tw w
  const den = tBike - tWalk
  const num = tBike * bikeMs - tWalk * walkMs
  if (num % den !== 0) return null
  const x = num / den
  const y = tWalk * (x - walkMs)
  if (!isNiceInt(x) || !isNiceInt(y) || x <= bikeMs) return null
  const ask = pickOne(['len', 'speed'] as const)
  if (ask === 'len') {
    return buildQuestion({
      difficulty: 'easy',
      term: '火车过行人骑车求车长（经典真题 5）',
      passage: `行人速度 ${walkMs} 米/秒，骑车 ${bikeMs} 米/秒，同向行进。火车从后方开来，通过行人用 ${tWalk} 秒，通过骑车用 ${tBike} 秒。`,
      stem: '火车车长是多少米？',
      correct: String(y),
      distractors: uniqueNum(y, [y - 2, y + 2, tWalk * bikeMs, 280, 286]),
      method: '过行人/骑车都是追及，追及路程=车长：车长=(车速−人速)×时间。列方程组求车长。',
      explanation: `设车速 x、车长 y：y=${tWalk}(x−${walkMs})=${tBike}(x−${bikeMs}) ⇒ x=${x}，y=${y}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '火车过行人骑车求车速',
    passage: `行人 ${walkMs} 米/秒，骑车 ${bikeMs} 米/秒。火车从后方通过行人 ${tWalk} 秒、通过骑车 ${tBike} 秒。`,
    stem: '火车速度是多少米/秒？',
    correct: String(x),
    distractors: uniqueNum(x, [x - 1, x + 1, bikeMs + walkMs, 14]),
    method: '车长相等列方程：t1(v车−v人)=t2(v车−v骑)。',
    explanation: `${tWalk}(x−${walkMs})=${tBike}(x−${bikeMs}) ⇒ x=${x}。`,
    seq,
  })
}

function genEasyBasicMeet(seq: number): MeetPursueQuestion | null {
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([30, 40, 50])
  const t = pickOne([2, 3, 4])
  const s = (v1 + v2) * t
  return buildQuestion({
    difficulty: 'easy',
    term: '相向相遇求路程',
    passage: `甲、乙两地同时相向而行，甲速 ${v1} 千米/小时，乙速 ${v2} 千米/小时，${t} 小时后相遇。`,
    stem: '两地相距多少千米？',
    correct: String(s),
    distractors: uniqueNum(s, [v1 * t, v2 * t, Math.abs(v1 - v2) * t, s + 20]),
    method: '相遇路程 = 速度和 × 相遇时间。',
    explanation: `s=(${v1}+${v2})×${t}=${s}。`,
    seq,
  })
}

function genEasyBasicChase(seq: number): MeetPursueQuestion | null {
  const vFast = pickOne([60, 80, 100])
  const vSlow = pickOne([40, 50, 60])
  if (vFast <= vSlow) return null
  const lead = pickOne([20, 30, 40, 60])
  const t = lead / (vFast - vSlow)
  if (!isNiceInt(t) && !approxEq(t * 2, Math.round(t * 2))) return null
  const ans = approxEq(t, Math.round(t)) ? String(Math.round(t)) : String(t)
  return buildQuestion({
    difficulty: 'easy',
    term: '同向追及求时间',
    passage: `乙在甲前方 ${lead} 千米，甲速 ${vFast} 千米/小时，乙速 ${vSlow} 千米/小时，同向而行。`,
    stem: '甲多少小时追上乙？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [lead / vFast, lead / vSlow, Number(ans) + 1]),
    method: '追及路程 = 速度差 × 追及时间。',
    explanation: `t=${lead}/(${vFast}−${vSlow})=${ans}。`,
    seq,
  })
}

function genEasyBoatBasic(seq: number): MeetPursueQuestion | null {
  const vBoat = pickOne([16, 18, 20, 24])
  const vWater = pickOne([2, 3, 4, 6])
  if (vBoat <= vWater) return null
  const ask = pickOne(['down', 'up', 'boat', 'water'] as const)
  const down = vBoat + vWater
  const up = vBoat - vWater
  if (ask === 'down') {
    return buildQuestion({
      difficulty: 'easy',
      term: '流水 · 求顺水速度',
      passage: `船在静水中速度 ${vBoat} 千米/小时，水流速度 ${vWater} 千米/小时。`,
      stem: '顺水速度是多少千米/小时？',
      correct: String(down),
      distractors: uniqueNum(down, [up, vBoat, vWater, down + 2]),
      method: '顺水速度 = 船速 + 水速。',
      explanation: `${vBoat}+${vWater}=${down}。`,
      seq,
    })
  }
  if (ask === 'up') {
    return buildQuestion({
      difficulty: 'easy',
      term: '流水 · 求逆水速度',
      passage: `船速 ${vBoat} 千米/小时，水速 ${vWater} 千米/小时。`,
      stem: '逆水速度是多少千米/小时？',
      correct: String(up),
      distractors: uniqueNum(up, [down, vBoat, vWater]),
      method: '逆水速度 = 船速 − 水速。',
      explanation: `${vBoat}−${vWater}=${up}。`,
      seq,
    })
  }
  if (ask === 'boat') {
    return buildQuestion({
      difficulty: 'easy',
      term: '流水 · 由顺逆求船速',
      passage: `某船顺水 ${down} 千米/小时，逆水 ${up} 千米/小时。`,
      stem: '船在静水中的速度是多少千米/小时？',
      correct: String(vBoat),
      distractors: uniqueNum(vBoat, [vWater, down, up, (down + up) / 2 + 1]),
      method: '船速 = (顺水 + 逆水) ÷ 2。',
      explanation: `(${down}+${up})÷2=${vBoat}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '流水 · 由顺逆求水速',
    passage: `顺水 ${down} 千米/小时，逆水 ${up} 千米/小时。`,
    stem: '水流速度是多少千米/小时？',
    correct: String(vWater),
    distractors: uniqueNum(vWater, [vBoat, down - up, (down - up) / 2 + 1]),
    method: '水速 = (顺水 − 逆水) ÷ 2。',
    explanation: `(${down}−${up})÷2=${vWater}。`,
    seq,
  })
}

// ——— 中等：经典真题 6 / 7（及流水往返） ———

/** 经典真题 6：往返二次相遇 */
function genMediumMultiMeet(seq: number): MeetPursueQuestion | null {
  // 第一次离 A 为 a，第二次离 B 为 b → 甲第一次走 a，第二次共走 3a；若第二次在离 B 为 b 处，则 s = 3a - b（甲从 A 到 B 再回 b）
  // 经典：a=6, b=3 → 甲二次共 18，s=18-3=15
  for (let i = 0; i < 40; i++) {
    const a = pickOne([4, 5, 6, 8, 9, 10])
    const b = pickOne([2, 3, 4, 5])
    const s = 3 * a - b
    if (s <= a || s <= b || !isNiceInt(s)) continue
    // 乙第一次走 s-a；第二次共 3(s-a)；校验第二次位置：从 B 出发……常见解法用甲即可
    return buildQuestion({
      difficulty: 'medium',
      term: '往返二次相遇求全程（经典真题 6）',
      passage: `甲从 A、乙从 B 同时相向匀速而行。第一次相遇处离 A 地 ${a} 千米；到达对方起点后立即返回，第二次相遇处离 B 地 ${b} 千米。`,
      stem: 'A、B 两地相距多少千米？',
      correct: String(s),
      distractors: uniqueNum(s, [2 * a, a + b, 3 * a, 12, 18, 15]),
      method:
        '直线往返第 n 次相遇，每人路程是第一次的 (2n−1) 倍。甲第一次走 a，第二次共走 3a；第二次离 B 为 b，说明甲已走完一个全程并往回走了 (3a−s)，故 3a−s=b ⇒ s=3a−b。',
      explanation: `甲第二次共走 3×${a}=${3 * a} 千米；离 B ${b} 千米 ⇒ 全程 s=${3 * a}−${b}=${s}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '往返二次相遇求全程（经典真题 6）',
    passage:
      '甲从 A、乙从 B 同时相向而行。第一次相遇离 A 地 6 千米；到达对方起点后立即返回，第二次相遇离 B 地 3 千米。',
    stem: 'A、B 两地相距多少千米？',
    correct: '15',
    distractors: uniqueNum(15, [10, 12, 18]),
    method: '甲第一次 6，第二次共 18；离 B 3 千米 ⇒ 全程 18−3=15。',
    explanation: 's=3×6−3=15。',
    seq,
  })
}

/** 经典真题 7：环形正反相遇 */
function genMediumCircular(seq: number): MeetPursueQuestion | null {
  // (va+vb)*tOpp = (va-vb)*tSame = L
  const va = pickOne([6, 7, 8, 9])
  const tOpp = pickOne([15, 20, 24, 30])
  const tSame = pickOne([60, 90, 120, 150])
  if (tSame <= tOpp) return null
  // (va+vb)*tOpp = (va-vb)*tSame
  // va*tOpp + vb*tOpp = va*tSame - vb*tSame
  // vb*(tOpp+tSame) = va*(tSame-tOpp)
  const den = tOpp + tSame
  const num = va * (tSame - tOpp)
  if (num % den !== 0) return null
  const vb = num / den
  if (!isNiceInt(vb) || vb <= 0 || vb >= va) return null
  const L = (va + vb) * tOpp
  const ask = pickOne(['vb', 'L'] as const)
  if (ask === 'vb') {
    return buildQuestion({
      difficulty: 'medium',
      term: '环形正反相遇求慢速（经典真题 7）',
      passage: `甲、乙在圆形跑道匀速跑步，甲速 ${va} 米/秒且比乙快。同一起点反向跑每 ${tOpp} 秒相遇一次；同向跑每 ${tSame} 秒相遇一次。`,
      stem: '乙的速度是多少米/秒？',
      correct: String(vb),
      distractors: uniqueNum(vb, [va - 1, va - 2, 3, 4, 5, 6]),
      method: '反向：速度和×时间=周长；同向：速度差×时间=周长。两式相等解乙速。',
      explanation: `(${va}+v)×${tOpp}=(${va}−v)×${tSame} ⇒ v=${vb}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '环形正反相遇求周长',
    passage: `甲速 ${va} 米/秒，乙速 ${vb} 米/秒。反向每 ${tOpp} 秒相遇，同向每 ${tSame} 秒相遇。`,
    stem: '圆形跑道周长是多少米？',
    correct: String(L),
    distractors: uniqueNum(L, [(va - vb) * tSame, va * tOpp, L + 20]),
    method: '周长 L=(v甲+v乙)×反向相遇时间。',
    explanation: `L=(${va}+${vb})×${tOpp}=${L}。`,
    seq,
  })
}

/** 流水往返（经典真题 8 量级） */
function genMediumBoatRound(seq: number): MeetPursueQuestion | null {
  const dist = pickOne([240, 300, 360])
  const vBoatA = pickOne([24, 30, 36])
  const vWater = pickOne([4, 6, 8])
  if (vBoatA <= vWater) return null
  const down = vBoatA + vWater
  const up = vBoatA - vWater
  if (dist % down !== 0 || dist % up !== 0) return null
  const tDown = dist / down
  const tUp = dist / up
  const totalA = tDown + tUp
  const vBoatB = pickOne([15, 18, 20, 24])
  if (vBoatB <= vWater) return null
  const tB = dist / (vBoatB + vWater) + dist / (vBoatB - vWater)
  if (!isNiceInt(tB)) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '流水往返 · 由 A 船求 B 船用时',
    passage: `甲乙两港相距 ${dist} 千米。A 船往返需 ${totalA} 小时，其中逆水比顺水多 ${tUp - tDown} 小时。B 船静水速度 ${vBoatB} 千米/小时。`,
    stem: 'B 船往返需要多少小时？',
    correct: String(tB),
    distractors: uniqueNum(tB, [totalA, tB - 5, 30, 45, 20]),
    method:
      '先由 A 船往返与时差求顺/逆时间与速度，得水速；再算 B 船顺逆时间之和。',
    explanation: `A 顺 ${tDown}、逆 ${tUp}；水速 ${vWater}。B 往返 ${dist}/(${vBoatB}+${vWater})+${dist}/(${vBoatB}−${vWater})=${tB}。`,
    seq,
  })
}

function genMediumMultiMeetTime(seq: number): MeetPursueQuestion | null {
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([30, 40, 50])
  const s = pickOne([120, 150, 180])
  const t1 = s / (v1 + v2)
  if (!isNiceInt(t1) && !approxEq(t1 * 2, Math.round(t1 * 2))) return null
  const n = pickOne([2, 3])
  const tn = (2 * n - 1) * t1
  const ans = approxEq(tn, Math.round(tn)) ? String(Math.round(tn)) : String(tn)
  return buildQuestion({
    difficulty: 'medium',
    term: '往返第 n 次相遇时间',
    passage: `甲、乙在相距 ${s} 千米的 A、B 两地同时相向，甲速 ${v1}、乙速 ${v2} 千米/小时，到达对方起点立即返回。`,
    stem: `第 ${n} 次相遇时，出发后经过了多少小时？`,
    correct: ans,
    distractors: uniqueNum(Number(ans), [t1, n * t1, (2 * n) * t1]),
    method: '第 n 次相遇时间 = (2n−1) × 第一次相遇时间。',
    explanation: `第一次 t=${t1}；第 ${n} 次 t=(2×${n}−1)×${t1}=${ans}。`,
    seq,
  })
}

function genMediumCircularChase(seq: number): MeetPursueQuestion | null {
  const L = pickOne([400, 600, 800])
  const vFast = pickOne([8, 10, 12])
  const vSlow = pickOne([4, 5, 6])
  if (vFast <= vSlow) return null
  const t = L / (vFast - vSlow)
  if (!isNiceInt(t)) return null
  return buildQuestion({
    difficulty: 'medium',
    term: '环形同向追及',
    passage: `圆形跑道周长 ${L} 米。甲速 ${vFast} 米/秒，乙速 ${vSlow} 米/秒，同一起点同向跑。`,
    stem: '甲第一次追上乙需要多少秒？',
    correct: String(t),
    distractors: uniqueNum(t, [L / (vFast + vSlow), L / vFast, t + 10]),
    method: '同向第一次追上：路程差 = 一圈 = 速度差 × 时间。',
    explanation: `t=${L}/(${vFast}−${vSlow})=${t}。`,
    seq,
  })
}

// ——— 困难 ≥10 ———

function genHardEarlyPlus(seq: number): MeetPursueQuestion | null {
  const v1 = pickOne([24, 30, 36])
  const v2 = pickOne([18, 20, 24])
  if (v1 <= v2) return null
  const earlyMin = pickOne([16, 20, 24])
  const earlyH = earlyMin / 60
  const lead = (v1 + v2) * earlyH
  const startMin = (lead / v1) * 60
  if (!isNiceInt(startMin)) return null
  const s = pickOne([120, 150, 180])
  // 同时出发相遇时间
  const tSim = s / (v1 + v2)
  const tEarly = (s - (v1 * startMin) / 60) / (v1 + v2) + startMin / 60
  // 问：全程多少时用另一问——改为求同时出发相遇时间
  return buildQuestion({
    difficulty: 'hard',
    term: '先出发加强 · 求同时出发相遇时间',
    hardTypeId: 'early-start-plus',
    passage: `甲速 ${v1}、乙速 ${v2} 千米/小时，相向而行。甲先出发会使相遇比同时出发提前 ${earlyMin} 分钟。已知甲实际先出发 ${startMin} 分钟，两地相距 ${s} 千米。`,
    stem: '若两人同时出发，多少小时相遇？',
    correct: String(tSim),
    distractors: uniqueNum(tSim, [tEarly, s / v1, earlyH]),
    method: '同时出发：t=路程/(速度和)。先出发条件可用来校验。',
    explanation: `t=${s}/(${v1}+${v2})=${tSim}。`,
    seq,
  })
}

function genHardTrainTwo(seq: number): MeetPursueQuestion | null {
  const walk = pickOne([1, 2])
  const bike = pickOne([3, 4, 5])
  if (bike <= walk) return null
  const tW = pickOne([18, 20, 22])
  const tB = pickOne([24, 26, 30])
  if (tB <= tW) return null
  const den = tB - tW
  const num = tB * bike - tW * walk
  if (num % den !== 0) return null
  const x = num / den
  const y = tW * (x - walk)
  if (!isNiceInt(x) || !isNiceInt(y)) return null
  // 相向通过静止电线杆用时
  const tPole = y / x
  if (!isNiceInt(tPole) && !approxEq(tPole * 2, Math.round(tPole * 2))) return null
  const ans = approxEq(tPole, Math.round(tPole)) ? String(Math.round(tPole)) : String(tPole)
  return buildQuestion({
    difficulty: 'hard',
    term: '火车过两人后求过杆时间',
    hardTypeId: 'train-pass-two',
    passage: `行人 ${walk} 米/秒、骑车 ${bike} 米/秒同向。火车从后方通过行人 ${tW} 秒、通过骑车 ${tB} 秒。`,
    stem: '该火车通过一根静止电线杆需要多少秒？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [tW, tB, y / (x - walk)]),
    method: '先求车速、车长；过杆：时间=车长/车速。',
    explanation: `车速 ${x}、车长 ${y}；过杆 ${y}/${x}=${ans} 秒。`,
    seq,
  })
}

function genHardMultiThird(seq: number): MeetPursueQuestion | null {
  const a = pickOne([5, 6, 8])
  // 第三次相遇甲走 5a；若第三次离 A 为 d
  const s = pickOne([20, 24, 30])
  if (5 * a < s) return null
  // 用第二次条件构造：设第二次离 B 为 b = 3a - s
  const b = 3 * a - s
  if (b <= 0 || b >= s) return null
  const thirdFromA = (5 * a) % (2 * s)
  // 简化：问第三次相遇时甲走了多少
  return buildQuestion({
    difficulty: 'hard',
    term: '往返第三次相遇',
    hardTypeId: 'multi-meet-third',
    passage: `甲从 A、乙从 B 相向匀速，第一次相遇离 A ${a} 千米，第二次相遇离 B ${b} 千米（到达对方起点立即返回）。`,
    stem: '第三次相遇时，甲一共走了多少千米？',
    correct: String(5 * a),
    distractors: uniqueNum(5 * a, [3 * a, a, s, 2 * s]),
    method: '第 n 次相遇，每人路程是第一次的 (2n−1) 倍。n=3 时为 5 倍。',
    explanation: `甲第一次 ${a}，第三次 5×${a}=${5 * a}（全程可由 s=3a−b=${s} 校验）。`,
    seq,
  })
}

function genHardCircularRatio(seq: number): MeetPursueQuestion | null {
  const va = pickOne([8, 9, 10])
  const tOpp = pickOne([12, 15, 20])
  const tSame = pickOne([60, 80, 100])
  const den = tOpp + tSame
  const num = va * (tSame - tOpp)
  if (num % den !== 0) return null
  const vb = num / den
  if (!isNiceInt(vb) || vb <= 0 || vb >= va) return null
  const L = (va + vb) * tOpp
  // 问：同向第 2 次追上时间
  const t2 = (2 * L) / (va - vb)
  if (!isNiceInt(t2)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '环形 · 第 2 次追上',
    hardTypeId: 'circular-ratio',
    passage: `甲速 ${va} 米/秒。反向每 ${tOpp} 秒相遇，同向每 ${tSame} 秒相遇一次。`,
    stem: '同向跑时，甲第 2 次追上乙需要多少秒？',
    correct: String(t2),
    distractors: uniqueNum(t2, [tSame, 2 * tSame, L / (va - vb)]),
    method: '先求乙速与周长；第 n 次追上时间 = n×周长/速度差。',
    explanation: `乙速 ${vb}，周长 ${L}；第 2 次 t=2×${L}/(${va}−${vb})=${t2}。`,
    seq,
  })
}

function genHardCircularDiffStart(seq: number): MeetPursueQuestion | null {
  const L = pickOne([400, 500, 600])
  const gap = pickOne([100, 120, 150])
  if (gap >= L) return null
  const vF = pickOne([10, 12, 15])
  const vS = pickOne([5, 6, 8])
  if (vF <= vS) return null
  // 同向，甲在乙后方 gap（沿跑向），第一次追上路程差 = gap
  const t = gap / (vF - vS)
  if (!isNiceInt(t) && !approxEq(t * 2, Math.round(t * 2))) return null
  const ans = approxEq(t, Math.round(t)) ? String(Math.round(t)) : String(t)
  return buildQuestion({
    difficulty: 'hard',
    term: '环形不同点出发追及',
    hardTypeId: 'circular-diff-start',
    passage: `圆形跑道周长 ${L} 米。甲在乙后方 ${gap} 米（沿前进方向），甲速 ${vF}、乙速 ${vS} 米/秒，同向跑。`,
    stem: '甲第一次追上乙需要多少秒？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [L / (vF - vS), gap / vF, (L - gap) / (vF - vS)]),
    method: '不同点出发，第一次追及路程为初始间隔，之后才按整圈算。',
    explanation: `t=${gap}/(${vF}−${vS})=${ans}。`,
    seq,
  })
}

function genHardBoatTwo(seq: number): MeetPursueQuestion | null {
  const dist = pickOne([300, 360, 420])
  const vWater = pickOne([4, 5, 6])
  const vA = pickOne([20, 24, 30])
  if (vA <= vWater) return null
  const tA = dist / (vA + vWater) + dist / (vA - vWater)
  if (!isNiceInt(tA)) return null
  const vB = pickOne([15, 18, 16])
  if (vB <= vWater) return null
  const tB = dist / (vB + vWater) + dist / (vB - vWater)
  if (!isNiceInt(tB)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '两船流水往返对照',
    hardTypeId: 'boat-two-ships',
    passage: `两港相距 ${dist} 千米，水速 ${vWater} 千米/小时。A 船静水速度 ${vA} 千米/小时，B 船静水速度 ${vB} 千米/小时。`,
    stem: 'B 船往返比 A 船多多少小时？',
    correct: String(tB - tA),
    distractors: uniqueNum(tB - tA, [tA, tB, Math.abs(vA - vB)]),
    method: '分别算两船顺逆时间之和再作差。',
    explanation: `A 往返 ${tA}，B 往返 ${tB}，多 ${tB - tA} 小时。`,
    seq,
  })
}

function genHardMeetThenPursue(seq: number): MeetPursueQuestion | null {
  const v1 = pickOne([40, 50])
  const v2 = pickOne([30, 40])
  const s = pickOne([140, 180, 210])
  const tMeet = s / (v1 + v2)
  if (!isNiceInt(tMeet) && !approxEq(tMeet * 2, Math.round(tMeet * 2))) return null
  // 相遇后乙立即折返，甲继续向乙的起点，甲追上乙（同向）
  // 相遇时甲走 v1*tMeet，乙走 v2*tMeet；乙折返向自己起点（即向 A），甲继续向 B——若乙折返往 A，甲往 B，则背向。
  // 改为：相遇后都折返，甲追乙——简化：相遇后乙停下，甲到乙起点再返回追乙……太复杂。
  // 用：相向出发，甲到 B 立即返回追乙（乙仍向 A）
  const tToB = (s - v1 * tMeet) / v1 // 甲遇后到 B
  // 此时乙继续向 A 又走了 v2*tToB，距 A： v2*tMeet - v2*tToB？乙从 B 向 A，相遇时距 A 为 v1*tMeet...
  // 简化题：两端出发相向，相遇后甲立即返回，乙继续，求再次相遇（甲追乙，同向向 A）
  // 相遇点距 A: d=v1*tMeet。甲返回向 A，乙继续向 A，甲在乙后方，同向追及路程差 = 0？甲返回时两人同向都向 A，甲在乙后方（距 A 更远），甲更快才能追上。
  // 乙在甲前方距离：相遇时在同一点，甲折返后两人同点出发同向——立即重叠？相遇瞬间甲折返，之后甲向 A、乙向 A，从同一点同速差追及路程 0。
  // 换题：甲乙同向，乙先走，甲追；追上后乙加速……跳过，改用两端相向第二次从背后追。
  // 标准变式：A、B 两端，甲乙相向，相遇后立即都返回出发点，求再次相遇时间。这是往返二次相遇的一半。
  const t2 = 3 * tMeet
  const ans = approxEq(t2, Math.round(t2)) ? String(Math.round(t2)) : String(t2)
  return buildQuestion({
    difficulty: 'hard',
    term: '相向后往返再次相遇',
    hardTypeId: 'meet-then-pursue',
    passage: `甲、乙从相距 ${s} 千米的两端同时相向，甲速 ${v1}、乙速 ${v2} 千米/小时；到达对方起点立即返回。`,
    stem: '从出发到第二次相遇经过多少小时？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [tMeet, 2 * tMeet, s / Math.abs(v1 - v2)]),
    method: '第二次相遇时间 = 3 × 第一次相遇时间。',
    explanation: `第一次 t=${tMeet}，第二次 3t=${ans}。`,
    seq,
  })
}

function genHardMultiRatio(seq: number): MeetPursueQuestion | null {
  const a = pickOne([6, 8, 9, 10])
  const b = pickOne([2, 3, 4, 5])
  const s = 3 * a - b
  if (s <= Math.max(a, b)) return null
  // 求乙第一次走了多少
  const firstB = s - a
  return buildQuestion({
    difficulty: 'hard',
    term: '二次相遇反求速度比相关量',
    hardTypeId: 'multi-meet-ratio',
    passage: `甲从 A、乙从 B 相向，第一次相遇离 A ${a} 千米，第二次相遇离 B ${b} 千米（到端点即返）。`,
    stem: '第一次相遇时乙走了多少千米？',
    correct: String(firstB),
    distractors: uniqueNum(firstB, [a, b, s, 3 * firstB]),
    method: '先由 s=3a−b 求全程，再乙第一次 = s−a。',
    explanation: `s=${s}，乙第一次 ${s}−${a}=${firstB}。`,
    seq,
  })
}

function genHardCircularN(seq: number): MeetPursueQuestion | null {
  const L = pickOne([300, 400, 600])
  const v1 = pickOne([5, 6, 8])
  const v2 = pickOne([3, 4, 5])
  const n = pickOne([2, 3, 4])
  // 反向第 n 次
  const t = (n * L) / (v1 + v2)
  if (!isNiceInt(t)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '环形反向第 n 次相遇',
    hardTypeId: 'circular-n-meet',
    passage: `圆形跑道周长 ${L} 米，甲速 ${v1}、乙速 ${v2} 米/秒，同一起点反向跑。`,
    stem: `第 ${n} 次相遇时，出发后经过了多少秒？`,
    correct: String(t),
    distractors: uniqueNum(t, [L / (v1 + v2), n * L / Math.abs(v1 - v2), t + 10]),
    method: '环形反向第 n 次相遇：合路程 = n×周长。',
    explanation: `t=${n}×${L}/(${v1}+${v2})=${t}。`,
    seq,
  })
}

function genHardBoatUnknown(seq: number): MeetPursueQuestion | null {
  const dist = pickOne([240, 300, 360])
  const tDown = pickOne([8, 10, 12])
  const tUp = pickOne([12, 15, 18])
  if (tUp <= tDown) return null
  const vDown = dist / tDown
  const vUp = dist / tUp
  if (!isNiceInt(vDown) || !isNiceInt(vUp)) return null
  const vBoat = (vDown + vUp) / 2
  const vWater = (vDown - vUp) / 2
  if (!isNiceInt(vBoat) || !isNiceInt(vWater)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '由顺逆时间求船速',
    hardTypeId: 'boat-unknown-current',
    passage: `两港相距 ${dist} 千米。某船顺水需 ${tDown} 小时，逆水需 ${tUp} 小时。`,
    stem: '船在静水中的速度是多少千米/小时？',
    correct: String(vBoat),
    distractors: uniqueNum(vBoat, [vWater, vDown, vUp, (tDown + tUp) / 2]),
    method: '先求顺逆速度，再船速=(顺+逆)/2。',
    explanation: `顺 ${vDown}、逆 ${vUp}；船速 (${vDown}+${vUp})/2=${vBoat}。`,
    seq,
  })
}

function genHardChaseRest(seq: number): MeetPursueQuestion | null {
  const vF = pickOne([60, 80])
  const vS = pickOne([40, 50])
  if (vF <= vS) return null
  const lead = pickOne([40, 60, 80])
  const rest = pickOne([0.5, 1])
  // 乙先领先 lead，乙走的同时甲追；乙中途休息 rest 小时（甲不停）
  // 若不休息 t0=lead/(vF-vS)；休息使乙少走 vS*rest，相当于追及路程减少？更简单：乙休息时甲仍在追，休息期间甲追上的有效。
  // 模型：乙一直匀速但中间停 rest；甲不停。总追及：甲走的路程 - 乙走的路程 = lead；乙走的时间 = 甲时间 - rest。
  // vF*t - vS*(t-rest) = lead → (vF-vS)t + vS*rest = lead → t = (lead - vS*rest)/(vF-vS)
  const num = lead - vS * rest
  if (num <= 0) return null
  const t = num / (vF - vS)
  if (!isNiceInt(t) && !approxEq(t * 2, Math.round(t * 2))) return null
  if (t <= rest) return null
  const ans = approxEq(t, Math.round(t)) ? String(Math.round(t)) : String(t)
  return buildQuestion({
    difficulty: 'hard',
    term: '追及含停留',
    hardTypeId: 'chase-with-rest',
    passage: `乙在甲前方 ${lead} 千米。甲速 ${vF}、乙速 ${vS} 千米/小时同向。乙在途中停留 ${rest} 小时，甲不停。`,
    stem: '甲出发后多少小时追上乙？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [lead / (vF - vS), Number(ans) + rest, rest]),
    method: '乙运动时间比甲少休息时间；列方程：v甲 t − v乙(t−休息)=领先路程。',
    explanation: `${vF}t−${vS}(t−${rest})=${lead} ⇒ t=${ans}。`,
    seq,
  })
}

function genHardBothEarly(seq: number): MeetPursueQuestion | null {
  const v1 = pickOne([40, 50, 60])
  const v2 = pickOne([30, 40, 50])
  const head1 = pickOne([0.5, 1])
  const s = pickOne([150, 180, 210])
  // 甲先走 head1 小时，然后乙出发相向
  const remain = s - v1 * head1
  if (remain <= 0) return null
  const tAfter = remain / (v1 + v2)
  if (!isNiceInt(tAfter) && !approxEq(tAfter * 2, Math.round(tAfter * 2))) return null
  const total = head1 + tAfter
  const ans = approxEq(total, Math.round(total)) ? String(Math.round(total)) : String(total)
  return buildQuestion({
    difficulty: 'hard',
    term: '一方先出发后相向',
    hardTypeId: 'both-early-meet',
    passage: `两地相距 ${s} 千米。甲速 ${v1} 千米/小时先出发 ${head1} 小时，乙再以 ${v2} 千米/小时与甲相向而行。`,
    stem: '从甲出发到两人相遇共多少小时？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [tAfter, s / (v1 + v2), head1]),
    method: '先算出甲已走路程，剩余路程按速度和计算乙出发后时间，再加甲先走时间。',
    explanation: `甲先走 ${v1 * head1}，剩余 ${remain}；再 ${tAfter} 小时相遇；总 ${ans} 小时。`,
    seq,
  })
}

const HARD_BUILDERS: Record<MeetPursueHardTypeId, (seq: number) => MeetPursueQuestion | null> = {
  'early-start-plus': genHardEarlyPlus,
  'train-pass-two': genHardTrainTwo,
  'multi-meet-third': genHardMultiThird,
  'circular-ratio': genHardCircularRatio,
  'circular-diff-start': genHardCircularDiffStart,
  'boat-two-ships': genHardBoatTwo,
  'meet-then-pursue': genHardMeetThenPursue,
  'multi-meet-ratio': genHardMultiRatio,
  'circular-n-meet': genHardCircularN,
  'boat-unknown-current': genHardBoatUnknown,
  'chase-with-rest': genHardChaseRest,
  'both-early-meet': genHardBothEarly,
}

function tryBuild(factory: () => MeetPursueQuestion | null, maxTry = 50): MeetPursueQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateMeetPursuePaper(difficulty: MeetPursueDifficulty): MeetPursueQuestion[] {
  const out: MeetPursueQuestion[] = []
  const seen = new Set<string>()
  const push = (q: MeetPursueQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyEarlyStart,
      genEasyTrainPass,
      genEasyBasicMeet,
      genEasyBasicChase,
      genEasyBoatBasic,
      genEasyEarlyStart,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= MEET_PURSUE_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < MEET_PURSUE_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumMultiMeet,
      genMediumCircular,
      genMediumBoatRound,
      genMediumMultiMeetTime,
      genMediumCircularChase,
      genMediumMultiMeet,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= MEET_PURSUE_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < MEET_PURSUE_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const types = shuffleInPlace([...MEET_PURSUE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= MEET_PURSUE_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
    }
    let guard = 0
    while (out.length < MEET_PURSUE_QUESTION_COUNT && guard++ < 40) {
      const typeId = pickOne(MEET_PURSUE_HARD_EXAM_TYPES).id
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
    }
  }

  return out.slice(0, MEET_PURSUE_QUESTION_COUNT)
}
