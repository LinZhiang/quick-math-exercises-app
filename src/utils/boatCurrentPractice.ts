/**
 * 高频运算 · 流水行船问题（行程问题）
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。仅简单 / 困难（无普通档）。
 *
 * 教材公式：
 * - 顺水速度 v顺 = 船速 v船 + 水速 v水
 * - 逆水速度 v逆 = 船速 v船 − 水速 v水
 * - 推论：v水 = (v顺 − v逆)/2；v船 = (v顺 + v逆)/2
 *
 * 【简单】对齐经典真题 8：往返总时 + 顺逆时差 → 求水速 → 再求另一船往返
 * 【困难】比真题 8 更高阶；登记 ≥5 种变式，每轮抽 6 种且题型互不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type BoatCurrentDifficulty = 'easy' | 'hard'

export const BOAT_CURRENT_QUESTION_COUNT = 6

export const BOAT_CURRENT_MODES: {
  id: BoatCurrentDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '流水行船 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 8（往返时差求水速再算另一船）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '流水行船 · 困难',
    desc: '每轮 6 题 · 比经典真题 8 更高阶的变式（每题题型不同）· 正计时停表看答案',
  },
]

/** 困难题 ≥5 种结构变式 */
export const BOAT_CURRENT_HARD_EXAM_TYPES = [
  {
    id: 'three-ports',
    name: '三港往返',
    note: '两段航程不同水情或连续两段求总时',
  },
  {
    id: 'same-time-find-dist',
    name: '已知往返等时求路程',
    note: '顺逆时间已知或总时与差，反求港距',
  },
  {
    id: 'drift-and-still',
    name: '静水与流水对照',
    note: '静水往返与流水往返联立求水速或船速',
  },
  {
    id: 'meet-on-river',
    name: '河上相向相遇',
    note: '两船顺逆组合相遇求时间或路程',
  },
  {
    id: 'round-plus-one-way',
    name: '往返后再单程',
    note: '先往返再加一段顺/逆，求总时',
  },
  {
    id: 'two-boats-race',
    name: '两船同时出发对照',
    note: '同时从两港出发，相遇后再求返港',
  },
] as const

export type BoatCurrentHardTypeId = (typeof BOAT_CURRENT_HARD_EXAM_TYPES)[number]['id']

export type BoatCurrentQuestion = {
  id: string
  topic: 'boat-current'
  difficulty: BoatCurrentDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: BoatCurrentHardTypeId
}

export function boatCurrentTopicLabel(): string {
  return '流水行船问题'
}

export function boatCurrentDifficultyLabel(d: BoatCurrentDifficulty): string {
  if (d === 'easy') return '简单'
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
  difficulty: BoatCurrentDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: BoatCurrentHardTypeId
  seq: number
}): BoatCurrentQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'boat-current',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `bc-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'boat-current',
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

// ——— 简单：对齐经典真题 8 ———

/** 经典真题 8 同构：往返总时 + 逆比顺多 → 求 B 船往返 */
function genEasyClassic8(seq: number): BoatCurrentQuestion | null {
  for (let i = 0; i < 40; i++) {
    const dist = pickOne([240, 300, 360, 420])
    const diff = pickOne([4, 5, 6])
    const tDown = pickOne([8, 10, 12])
    const tUp = tDown + diff
    const totalA = tDown + tUp
    const vDown = dist / tDown
    const vUp = dist / tUp
    if (!isNiceInt(vDown) || !isNiceInt(vUp)) continue
    const vWater = (vDown - vUp) / 2
    const vBoatA = (vDown + vUp) / 2
    if (!isNiceInt(vWater) || !isNiceInt(vBoatA) || vWater <= 0) continue
    const vBoatB = pickOne([15, 16, 18, 20, 24])
    if (vBoatB <= vWater) continue
    const tB = dist / (vBoatB + vWater) + dist / (vBoatB - vWater)
    if (!isNiceInt(tB)) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '往返时差求另一船用时（经典真题 8）',
      passage: `甲、乙两港相距 ${dist} 千米。A 船往返需 ${totalA} 小时，其中逆水时间比顺水时间多 ${diff} 小时。B 船静水速度为 ${vBoatB} 千米/小时。`,
      stem: 'B 船往返两港需要多少小时？',
      correct: String(tB),
      distractors: uniqueNum(tB, [totalA, tB - 5, 30, 45, 20, 38]),
      method:
        '顺水时间=(总时−时差)/2，逆水时间=顺水+时差；求出顺逆速度得水速；再算 B 船顺逆时间之和。',
      explanation: `A 顺 ${tDown}、逆 ${tUp}；顺速 ${vDown}、逆速 ${vUp}；水速 ${vWater}。B：${dist}/(${vBoatB}+${vWater})+${dist}/(${vBoatB}−${vWater})=${tB}。`,
      seq,
    })
  }
  // fallback classic numbers
  return buildQuestion({
    difficulty: 'easy',
    term: '往返时差求另一船用时（经典真题 8）',
    passage:
      '甲、乙两港相距 360 千米。A 船往返需 25 小时，其中逆水时间比顺水时间多 5 小时。B 船静水速度为 18 千米/小时。',
    stem: 'B 船往返两港需要多少小时？',
    correct: '45',
    distractors: uniqueNum(45, [30, 20, 38]),
    method: '顺 10、逆 15 → 水速 6；B 往返 360/24+360/12=45。',
    explanation: '水速 6；B：15+30=45 小时。',
    seq,
  })
}

function genEasyDownUpSpeed(seq: number): BoatCurrentQuestion | null {
  const vBoat = pickOne([16, 18, 20, 24])
  const vWater = pickOne([2, 3, 4, 6])
  if (vBoat <= vWater) return null
  const ask = pickOne(['down', 'up'] as const)
  if (ask === 'down') {
    const ans = vBoat + vWater
    return buildQuestion({
      difficulty: 'easy',
      term: '求顺水速度',
      passage: `船在静水中速度 ${vBoat} 千米/小时，水流速度 ${vWater} 千米/小时。`,
      stem: '顺水速度是多少千米/小时？',
      correct: String(ans),
      distractors: uniqueNum(ans, [vBoat - vWater, vBoat, vWater, ans + 2]),
      method: '顺水速度 = 船速 + 水速。',
      explanation: `${vBoat}+${vWater}=${ans}。`,
      seq,
    })
  }
  const ans = vBoat - vWater
  return buildQuestion({
    difficulty: 'easy',
    term: '求逆水速度',
    passage: `船速 ${vBoat} 千米/小时，水速 ${vWater} 千米/小时。`,
    stem: '逆水速度是多少千米/小时？',
    correct: String(ans),
    distractors: uniqueNum(ans, [vBoat + vWater, vBoat, vWater]),
    method: '逆水速度 = 船速 − 水速。',
    explanation: `${vBoat}−${vWater}=${ans}。`,
    seq,
  })
}

function genEasyFromDownUp(seq: number): BoatCurrentQuestion | null {
  const vDown = pickOne([30, 36, 40, 48])
  const vUp = pickOne([18, 20, 24, 30])
  if (vDown <= vUp || (vDown - vUp) % 2 !== 0 || (vDown + vUp) % 2 !== 0) return null
  const vWater = (vDown - vUp) / 2
  const vBoat = (vDown + vUp) / 2
  const ask = pickOne(['boat', 'water'] as const)
  if (ask === 'boat') {
    return buildQuestion({
      difficulty: 'easy',
      term: '由顺逆求船速',
      passage: `某船顺水 ${vDown} 千米/小时，逆水 ${vUp} 千米/小时。`,
      stem: '船在静水中的速度是多少千米/小时？',
      correct: String(vBoat),
      distractors: uniqueNum(vBoat, [vWater, vDown, vUp]),
      method: '船速 = (顺水 + 逆水) ÷ 2。',
      explanation: `(${vDown}+${vUp})÷2=${vBoat}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '由顺逆求水速',
    passage: `顺水 ${vDown} 千米/小时，逆水 ${vUp} 千米/小时。`,
    stem: '水流速度是多少千米/小时？',
    correct: String(vWater),
    distractors: uniqueNum(vWater, [vBoat, vDown - vUp, vDown]),
    method: '水速 = (顺水 − 逆水) ÷ 2。',
    explanation: `(${vDown}−${vUp})÷2=${vWater}。`,
    seq,
  })
}

function genEasyOneWayTime(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([120, 180, 240])
  const vBoat = pickOne([20, 24, 30])
  const vWater = pickOne([4, 5, 6])
  if (vBoat <= vWater) return null
  const ask = pickOne(['down', 'up'] as const)
  if (ask === 'down') {
    const t = dist / (vBoat + vWater)
    if (!isNiceInt(t)) return null
    return buildQuestion({
      difficulty: 'easy',
      term: '顺水单程用时',
      passage: `两港相距 ${dist} 千米，船速 ${vBoat}、水速 ${vWater} 千米/小时。`,
      stem: '顺水行驶需要多少小时？',
      correct: String(t),
      distractors: uniqueNum(t, [dist / (vBoat - vWater), dist / vBoat, t + 1]),
      method: '顺水时间 = 路程 ÷ (船速 + 水速)。',
      explanation: `t=${dist}/(${vBoat}+${vWater})=${t}。`,
      seq,
    })
  }
  const t = dist / (vBoat - vWater)
  if (!isNiceInt(t)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '逆水单程用时',
    passage: `两港相距 ${dist} 千米，船速 ${vBoat}、水速 ${vWater} 千米/小时。`,
    stem: '逆水行驶需要多少小时？',
    correct: String(t),
    distractors: uniqueNum(t, [dist / (vBoat + vWater), dist / vBoat, t - 1]),
    method: '逆水时间 = 路程 ÷ (船速 − 水速)。',
    explanation: `t=${dist}/(${vBoat}−${vWater})=${t}。`,
    seq,
  })
}

function genEasyRoundGivenSpeeds(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([180, 240, 300])
  const vBoat = pickOne([18, 20, 24])
  const vWater = pickOne([3, 4, 6])
  if (vBoat <= vWater) return null
  const t = dist / (vBoat + vWater) + dist / (vBoat - vWater)
  if (!isNiceInt(t)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '已知船速水速求往返',
    passage: `两港相距 ${dist} 千米。船静水速度 ${vBoat} 千米/小时，水流速度 ${vWater} 千米/小时。`,
    stem: '往返需要多少小时？',
    correct: String(t),
    distractors: uniqueNum(t, [2 * dist / vBoat, dist / (vBoat + vWater), t - 2]),
    method: '往返时间 = 路程/(船+水) + 路程/(船−水)。',
    explanation: `${dist}/(${vBoat}+${vWater})+${dist}/(${vBoat}−${vWater})=${t}。`,
    seq,
  })
}

function genEasyFindDiffHours(seq: number): BoatCurrentQuestion | null {
  // 已知总往返与水速船速之一，或由真题 8 前半：只问顺水时间
  const dist = pickOne([300, 360])
  const total = pickOne([20, 24, 25, 30])
  const diff = pickOne([4, 5, 6])
  if ((total - diff) % 2 !== 0) return null
  const tDown = (total - diff) / 2
  const tUp = tDown + diff
  if (!isNiceInt(tDown) || tDown <= 0) return null
  const vDown = dist / tDown
  const vUp = dist / tUp
  if (!isNiceInt(vDown) || !isNiceInt(vUp)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: '由总时与时差求顺水时间',
    passage: `两港相距 ${dist} 千米。某船往返共 ${total} 小时，逆水比顺水多用 ${diff} 小时。`,
    stem: '顺水单程需要多少小时？',
    correct: String(tDown),
    distractors: uniqueNum(tDown, [tUp, total / 2, diff, tDown + 1]),
    method: '顺水时间 = (总往返时间 − 时差) ÷ 2。',
    explanation: `(${total}−${diff})÷2=${tDown}。`,
    seq,
  })
}

// ——— 困难 ≥5 ———

function genHardThreePorts(seq: number): BoatCurrentQuestion | null {
  const d1 = pickOne([120, 150, 180])
  const d2 = pickOne([120, 180, 240])
  const vBoat = pickOne([20, 24, 30])
  const vWater = pickOne([4, 5, 6])
  if (vBoat <= vWater) return null
  // A→B 顺，B→C 逆，再返回… 简化：A 到 B 顺水，B 到 C 顺水（同向水流假设分段），改为：去程全程顺、回程全程逆但两段路程
  const t = d1 / (vBoat + vWater) + d2 / (vBoat + vWater) + d1 / (vBoat - vWater) + d2 / (vBoat - vWater)
  if (!isNiceInt(t)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '两段航程往返',
    hardTypeId: 'three-ports',
    passage: `A 到 B ${d1} 千米、B 到 C ${d2} 千米，水流方向均为 A→C。船速 ${vBoat}、水速 ${vWater} 千米/小时。船从 A 经 B 到 C，再原路返回 A。`,
    stem: '全程往返共需多少小时？',
    correct: String(t),
    distractors: uniqueNum(t, [
      (d1 + d2) / (vBoat + vWater) + (d1 + d2) / (vBoat - vWater) + 2,
      2 * (d1 + d2) / vBoat,
      t - 2,
    ]),
    method: '去程两段皆顺水，回程两段皆逆水；分段求和。',
    explanation: `去 ${(d1 + d2) / (vBoat + vWater)}，回 ${(d1 + d2) / (vBoat - vWater)}，共 ${t}。`,
    seq,
  })
}

function genHardFindDist(seq: number): BoatCurrentQuestion | null {
  const vBoat = pickOne([18, 20, 24])
  const vWater = pickOne([3, 4, 6])
  if (vBoat <= vWater) return null
  const tDown = pickOne([8, 10, 12])
  const tUp = pickOne([12, 15, 18])
  if (tUp <= tDown) return null
  const dist = (vBoat + vWater) * tDown
  if (!isNiceInt(dist) || dist !== (vBoat - vWater) * tUp) {
    // force consistent: pick dist from down, check up
    const d = (vBoat + vWater) * tDown
    const tUp2 = d / (vBoat - vWater)
    if (!isNiceInt(tUp2)) return null
    return buildQuestion({
      difficulty: 'hard',
      term: '已知顺逆时间求港距',
      hardTypeId: 'same-time-find-dist',
      passage: `船速 ${vBoat}、水速 ${vWater} 千米/小时。顺水行驶 ${tDown} 小时，逆水行驶 ${tUp2} 小时，恰好为一个单程往返的两段。`,
      stem: '两港相距多少千米？',
      correct: String(d),
      distractors: uniqueNum(d, [vBoat * tDown, (vBoat - vWater) * tDown, d + 30]),
      method: '港距 = 顺水速度 × 顺水时间（或逆水速度 × 逆水时间）。',
      explanation: `s=(${vBoat}+${vWater})×${tDown}=${d}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'hard',
    term: '已知顺逆时间求港距',
    hardTypeId: 'same-time-find-dist',
    passage: `船速 ${vBoat}、水速 ${vWater} 千米/小时。顺水 ${tDown} 小时、逆水 ${tUp} 小时各走完一程。`,
    stem: '两港相距多少千米？',
    correct: String(dist),
    distractors: uniqueNum(dist, [vBoat * tDown, dist + 40, (vBoat + vWater) * tUp]),
    method: '港距 = (船速+水速)×顺水时间。',
    explanation: `s=(${vBoat}+${vWater})×${tDown}=${dist}。`,
    seq,
  })
}

function genHardStillCompare(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([240, 300, 360])
  const vBoat = pickOne([20, 24, 30])
  const vWater = pickOne([4, 5, 6])
  if (vBoat <= vWater) return null
  const tStill = (2 * dist) / vBoat
  const tFlow = dist / (vBoat + vWater) + dist / (vBoat - vWater)
  if (!isNiceInt(tStill) || !isNiceInt(tFlow)) return null
  const extra = tFlow - tStill
  if (!isNiceInt(extra) || extra <= 0) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '静水往返与流水往返时差',
    hardTypeId: 'drift-and-still',
    passage: `两港相距 ${dist} 千米，船速 ${vBoat} 千米/小时。若在静水中往返需 ${tStill} 小时；实际有水流，水速 ${vWater} 千米/小时。`,
    stem: '有水流时往返比静水往返多多少小时？',
    correct: String(extra),
    distractors: uniqueNum(extra, [tFlow, tStill, vWater, extra + 1]),
    method: '分别算静水往返与流水往返时间再作差。',
    explanation: `流水往返 ${tFlow}，静水 ${tStill}，多 ${extra} 小时。`,
    seq,
  })
}

function genHardMeetOnRiver(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([240, 300, 360])
  const vA = pickOne([20, 24])
  const vB = pickOne([16, 18, 20])
  const vWater = pickOne([4, 5, 6])
  if (vA <= vWater || vB <= vWater) return null
  // A 从上游顺水，B 从下游逆水相向
  const t = dist / (vA + vWater + vB - vWater)
  // relative: A effective vA+vW, B effective vB-vW, sum = vA+vB
  if (!approxEq(t, dist / (vA + vB))) return null
  if (!isNiceInt(t) && !approxEq(t * 2, Math.round(t * 2))) return null
  const ans = approxEq(t, Math.round(t)) ? String(Math.round(t)) : String(t)
  return buildQuestion({
    difficulty: 'hard',
    term: '上下游相向相遇',
    hardTypeId: 'meet-on-river',
    passage: `两港相距 ${dist} 千米，水速 ${vWater} 千米/小时。A 船从上游顺水出发（船速 ${vA}），B 船从下游逆水出发（船速 ${vB}），同时相向而行。`,
    stem: '多少小时后两船相遇？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [
      dist / (vA + vB + 2 * vWater),
      dist / (vA + vWater),
      Number(ans) + 1,
    ]),
    method: '相向相对速度 = (船A+水)+(船B−水)=两船静水速度之和。',
    explanation: `相对速度 ${vA}+${vB}，t=${dist}/(${vA}+${vB})=${ans}。`,
    seq,
  })
}

function genHardRoundPlusOne(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([180, 240, 300])
  const vBoat = pickOne([18, 20, 24])
  const vWater = pickOne([3, 4, 6])
  if (vBoat <= vWater) return null
  const tRound = dist / (vBoat + vWater) + dist / (vBoat - vWater)
  const tExtra = dist / (vBoat + vWater)
  const total = tRound + tExtra
  if (!isNiceInt(tRound) || !isNiceInt(total)) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '往返后再顺水一程',
    hardTypeId: 'round-plus-one-way',
    passage: `两港相距 ${dist} 千米，船速 ${vBoat}、水速 ${vWater} 千米/小时。船先往返一趟，再顺水开一趟到对面港口。`,
    stem: '从出发到最后到达对面港口共多少小时？',
    correct: String(total),
    distractors: uniqueNum(total, [tRound, 2 * tRound, tExtra * 3]),
    method: '往返时间 + 再一段顺水时间。',
    explanation: `往返 ${tRound}，再顺水 ${tExtra}，共 ${total}。`,
    seq,
  })
}

function genHardTwoBoatsRace(seq: number): BoatCurrentQuestion | null {
  const dist = pickOne([240, 300, 360])
  const vA = pickOne([20, 24, 30])
  const vB = pickOne([15, 18, 20])
  const vWater = pickOne([4, 5, 6])
  if (vA <= vWater || vB <= vWater) return null
  // 同时从同一港出发：A 顺水到对面再逆水回；问 A 回到起点时 B（一直顺水来回？）简化：
  // 两船同时从两港出发相向，求相遇时间后，A 到对方港还需多久
  const tMeet = dist / (vA + vB)
  if (!isNiceInt(tMeet) && !approxEq(tMeet * 2, Math.round(tMeet * 2))) return null
  // A 顺水，B 逆水
  const vAeff = vA + vWater
  const vBeff = vB - vWater
  const tMeet2 = dist / (vAeff + vBeff)
  if (!approxEq(tMeet2, dist / (vA + vB))) {
    /* always true */
  }
  const remainForA = (dist - vAeff * tMeet2) / vAeff
  if (remainForA < 0) return null
  if (!isNiceInt(remainForA) && !approxEq(remainForA * 2, Math.round(remainForA * 2))) return null
  const ans = approxEq(remainForA, Math.round(remainForA))
    ? String(Math.round(remainForA))
    : String(remainForA)
  const meetAns = approxEq(tMeet2, Math.round(tMeet2)) ? String(Math.round(tMeet2)) : String(tMeet2)
  return buildQuestion({
    difficulty: 'hard',
    term: '两船相向后 A 到港剩余时间',
    hardTypeId: 'two-boats-race',
    passage: `两港相距 ${dist} 千米，水速 ${vWater}。A 船（船速 ${vA}）从上游顺水出发，B 船（船速 ${vB}）从下游逆水出发，同时相向。`,
    stem: '相遇后，A 船再到下游港口还需要多少小时？',
    correct: ans,
    distractors: uniqueNum(Number(ans), [Number(meetAns), dist / vAeff, Number(ans) + 1]),
    method: '先求相遇时间与相遇点，剩余路程 ÷ A 的顺水速度。',
    explanation: `相遇用时 ${meetAns}；A 已走 ${vAeff}×${meetAns}，剩余再 ${ans} 小时。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  BoatCurrentHardTypeId,
  (seq: number) => BoatCurrentQuestion | null
> = {
  'three-ports': genHardThreePorts,
  'same-time-find-dist': genHardFindDist,
  'drift-and-still': genHardStillCompare,
  'meet-on-river': genHardMeetOnRiver,
  'round-plus-one-way': genHardRoundPlusOne,
  'two-boats-race': genHardTwoBoatsRace,
}

function tryBuild(factory: () => BoatCurrentQuestion | null, maxTry = 50): BoatCurrentQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateBoatCurrentPaper(difficulty: BoatCurrentDifficulty): BoatCurrentQuestion[] {
  const out: BoatCurrentQuestion[] = []
  const seen = new Set<string>()
  const push = (q: BoatCurrentQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyClassic8,
      genEasyDownUpSpeed,
      genEasyFromDownUp,
      genEasyOneWayTime,
      genEasyRoundGivenSpeeds,
      genEasyFindDiffHours,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= BOAT_CURRENT_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < BOAT_CURRENT_QUESTION_COUNT && guard++ < 60) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const types = shuffleInPlace([...BOAT_CURRENT_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= BOAT_CURRENT_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 30))
    }
    let guard = 0
    while (out.length < BOAT_CURRENT_QUESTION_COUNT && guard++ < 40) {
      const typeId = pickOne(BOAT_CURRENT_HARD_EXAM_TYPES).id
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
    }
  }

  return out.slice(0, BOAT_CURRENT_QUESTION_COUNT)
}
