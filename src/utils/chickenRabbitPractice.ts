/**
 * 其他运算 · 鸡兔同笼问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 教材方法（假设法）：
 * - 全设为「鸡」（属性较小）类：假设总量 = 头数 × 鸡属性
 * - 差量 = 实际总量 − 假设总量
 * - 「兔」数 = 差量 ÷ (兔属性 − 鸡属性)
 * - 亦可全设为兔，用差量求鸡数
 * 推广：大中客车、鹤龟、邮票面值等，只要两类对象、两种属性、头数与总量已知。
 *
 * 【简单】比经典真题更易（直接鸡兔/鹤龟）
 * 【普通】对齐经典真题（大中客车座位）
 * 【困难】高于例题；≥6 变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type ChickenRabbitDifficulty = 'easy' | 'medium' | 'hard'

export const CHICKEN_RABBIT_QUESTION_COUNT = 5

export const CHICKEN_RABBIT_MODES: {
  id: ChickenRabbitDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '鸡兔 · 简单',
    desc: '每轮 5 题 · 比经典真题更易（直接鸡兔假设法）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '鸡兔 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（大中客车）及同类替换 · 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '鸡兔 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

export const CHICKEN_RABBIT_HARD_EXAM_TYPES = [
  { id: 'three-attr-reduce', name: '三类化两类', note: '先合并或消元成鸡兔模型' },
  { id: 'ask-ratio', name: '求两类数量比', note: '假设法求出后再问比值' },
  { id: 'money-face', name: '面值/票价同笼', note: '两种面额张数与总额' },
  { id: 'work-days', name: '工效同笼', note: '两种效率人数与总产量' },
  { id: 'assume-other-first', name: '先全设较大类', note: '全设为兔/大车求鸡/中车' },
  { id: 'partial-known', name: '已知一类求另一类', note: '头数未知但给补充条件' },
  { id: 'wheel-vehicle', name: '车轮同笼', note: '两轮/三轮/四轮车辆' },
  { id: 'seats-plus', name: '座位同笼加强', note: '经典客车更大数字' },
] as const

export type ChickenRabbitHardTypeId = (typeof CHICKEN_RABBIT_HARD_EXAM_TYPES)[number]['id']

export type ChickenRabbitQuestion = {
  id: string
  topic: 'chicken-rabbit'
  difficulty: ChickenRabbitDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: ChickenRabbitHardTypeId
}

export function chickenRabbitTopicLabel(): string {
  return '鸡兔同笼问题'
}

export function chickenRabbitDifficultyLabel(d: ChickenRabbitDifficulty): string {
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
  difficulty: ChickenRabbitDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: ChickenRabbitHardTypeId
}): ChickenRabbitQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'chicken-rabbit',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `cr-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'chicken-rabbit',
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

/** 假设全为 smallAttr，求 large 的数量 */
function countLarge(heads: number, total: number, smallAttr: number, largeAttr: number): number | null {
  const diffPer = largeAttr - smallAttr
  if (diffPer <= 0) return null
  const excess = total - heads * smallAttr
  if (excess < 0 || excess % diffPer !== 0) return null
  const large = excess / diffPer
  const small = heads - large
  if (large < 0 || small < 0 || !Number.isInteger(large)) return null
  return large
}

// ——— 简单 ———

function genEasyChickenRabbitAskRabbit(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 40; t++) {
    const heads = pickOne([20, 25, 30, 35, 40])
    const rabbits = pickOne([8, 10, 12, 15])
    const chickens = heads - rabbits
    if (chickens <= 0) continue
    const legs = chickens * 2 + rabbits * 4
    return buildQuestion({
      difficulty: 'easy',
      term: '鸡兔求兔数',
      passage: `鸡兔同笼，共 ${heads} 个头，${legs} 只脚。`,
      stem: '笼中有多少只兔？',
      correct: String(rabbits),
      distractors: [String(chickens), String(legs - heads * 2), String((legs - heads * 2) / 2 + 1), String(heads)],
      method: [
        '假设全是鸡：应有脚 ' + `${heads}×2=${heads * 2}` + ' 只。',
        `实际多 ${legs}−${heads * 2}=${legs - heads * 2} 只脚。`,
        `每把一只鸡换成兔多 2 只脚，兔数 = ${legs - heads * 2}÷(4−2)=${rabbits}。`,
      ].join('\n'),
      explanation: `兔 ${rabbits} 只（鸡 ${chickens} 只）。`,
      seq,
    })
  }
  return null
}

function genEasyChickenRabbitAskChicken(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 40; t++) {
    const heads = pickOne([18, 24, 28, 32])
    const chickens = pickOne([10, 12, 14, 16])
    const rabbits = heads - chickens
    if (rabbits <= 0) continue
    const legs = chickens * 2 + rabbits * 4
    return buildQuestion({
      difficulty: 'easy',
      term: '鸡兔求鸡数',
      passage: `鸡兔同笼，共 ${heads} 个头，${legs} 只脚。`,
      stem: '笼中有多少只鸡？',
      correct: String(chickens),
      distractors: [String(rabbits), String(heads * 4 - legs), String(chickens + 2), String(heads)],
      method: [
        '假设全是兔：应有脚 ' + `${heads}×4=${heads * 4}` + ' 只。',
        `实际少 ${heads * 4}−${legs}=${heads * 4 - legs} 只脚。`,
        `每把一只兔换成鸡少 2 只脚，鸡数 = ${heads * 4 - legs}÷(4−2)=${chickens}。`,
      ].join('\n'),
      explanation: `鸡 ${chickens} 只。`,
      seq,
    })
  }
  return null
}

function genEasyCraneTurtle(seq: number): ChickenRabbitQuestion | null {
  // 鹤 2 足，龟 4 足 — 同鸡兔
  for (let t = 0; t < 30; t++) {
    const heads = pickOne([16, 20, 22, 26])
    const turtles = pickOne([5, 6, 7, 8, 9])
    const cranes = heads - turtles
    if (cranes <= 0) continue
    const legs = cranes * 2 + turtles * 4
    return buildQuestion({
      difficulty: 'easy',
      term: '鹤龟同笼',
      passage: `鹤与龟共 ${heads} 只，脚共 ${legs} 只。（鹤 2 足，龟 4 足）`,
      stem: '龟有多少只？',
      correct: String(turtles),
      distractors: [String(cranes), String((legs - heads * 2) / 2 + 1), String(heads), String(turtles + 2)],
      method: [
        `假设全是鹤：脚 ${heads}×2=${heads * 2}。`,
        `多出 ${legs - heads * 2} 只脚 ÷ 2 = 龟 ${turtles} 只。`,
      ].join('\n'),
      explanation: `龟 ${turtles} 只。`,
      seq,
    })
  }
  return null
}

function genEasyPencilPrice(seq: number): ChickenRabbitQuestion | null {
  // 两种笔：2 元与 5 元，共 n 支，总价
  for (let t = 0; t < 30; t++) {
    const n = pickOne([10, 12, 15, 16])
    const expensive = pickOne([3, 4, 5, 6])
    const cheap = n - expensive
    if (cheap <= 0) continue
    const total = cheap * 2 + expensive * 5
    return buildQuestion({
      difficulty: 'easy',
      term: '两种单价同笼',
      passage: `买了 ${n} 支笔，有的 2 元、有的 5 元，共花 ${total} 元。`,
      stem: '5 元的笔买了多少支？',
      correct: String(expensive),
      distractors: [String(cheap), String(total - n * 2), String(expensive + 1), String(n)],
      method: [
        `假设全是 2 元：花 ${n}×2=${n * 2} 元。`,
        `多花 ${total - n * 2} 元，每换成一支 5 元笔多 3 元。`,
        `5 元笔 = ${total - n * 2}÷(5−2)=${expensive}。`,
      ].join('\n'),
      explanation: `5 元笔 ${expensive} 支。`,
      seq,
    })
  }
  return null
}

function genEasyBikeTrike(seq: number): ChickenRabbitQuestion | null {
  // 自行车 2 轮，三轮车 3 轮
  for (let t = 0; t < 30; t++) {
    const n = pickOne([12, 15, 18, 20])
    const trike = pickOne([4, 5, 6, 7])
    const bike = n - trike
    if (bike <= 0) continue
    const wheels = bike * 2 + trike * 3
    return buildQuestion({
      difficulty: 'easy',
      term: '二轮三轮同笼',
      passage: `停车场有自行车与三轮车共 ${n} 辆，车轮共 ${wheels} 个。`,
      stem: '三轮车有多少辆？',
      correct: String(trike),
      distractors: [String(bike), String(wheels - n * 2), String(trike + 1), String(n)],
      method: [
        `假设全是自行车：轮 ${n}×2=${n * 2}。`,
        `多 ${wheels - n * 2} 个轮 ÷ 1 = 三轮车 ${trike} 辆。`,
      ].join('\n'),
      explanation: `三轮车 ${trike} 辆。`,
      seq,
    })
  }
  return null
}

// ——— 普通 ———

function genMediumBusClassic(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 40; t++) {
    const buses = pickOne([5, 6, 7, 8])
    const largeSeats = pickOne([30, 35, 40])
    const midSeats = pickOne([18, 20, 22, 25])
    if (largeSeats <= midSeats) continue
    const large = pickOne([2, 3, 4, 5])
    if (large >= buses) continue
    const mid = buses - large
    const people = large * largeSeats + mid * midSeats
    // 验假设法
    const chk = countLarge(buses, people, midSeats, largeSeats)
    if (chk !== large) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '大中客车（经典真题）',
      passage: `共租 ${buses} 辆客车运送 ${people} 人。大客车每辆坐 ${largeSeats} 人，中客车每辆坐 ${midSeats} 人，刚好坐满。`,
      stem: '大客车租了多少辆？',
      correct: String(large),
      distractors: [String(mid), String(people - buses * midSeats), String(large + 1), String(buses)],
      method: [
        `假设全是中客车：座位 ${buses}×${midSeats}=${buses * midSeats}。`,
        `还差 ${people}−${buses * midSeats}=${people - buses * midSeats} 个座位。`,
        `每换成一辆大客车多 ${largeSeats}−${midSeats}=${largeSeats - midSeats} 座。`,
        `大客车 = ${people - buses * midSeats}÷${largeSeats - midSeats}=${large}。`,
      ].join('\n'),
      explanation: `大客车 ${large} 辆。`,
      seq,
    })
  }
  return null
}

function genMediumAskMidBus(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const buses = pickOne([5, 6, 7, 8])
    const largeSeats = pickOne([32, 35, 40])
    const midSeats = pickOne([20, 22, 25])
    if (largeSeats <= midSeats) continue
    const large = pickOne([2, 3, 4])
    if (large >= buses) continue
    const mid = buses - large
    if (mid < 2) continue
    const people = large * largeSeats + mid * midSeats
    return buildQuestion({
      difficulty: 'medium',
      term: '客车求中客',
      passage: `共 ${buses} 辆车，座位共 ${people} 个。大客 ${largeSeats} 座/辆，中客 ${midSeats} 座/辆，刚好坐满。`,
      stem: '中客车有多少辆？',
      correct: String(mid),
      distractors: [String(large), String(buses - large + 1), String(mid + 1), String(buses)],
      method: [
        `假设全是大客车：座位 ${buses}×${largeSeats}=${buses * largeSeats}。`,
        `多出 ${buses * largeSeats - people}，每换成中客少 ${largeSeats - midSeats} 座。`,
        `中客 = ${buses * largeSeats - people}÷${largeSeats - midSeats}=${mid}。`,
      ].join('\n'),
      explanation: `中客车 ${mid} 辆。`,
      seq,
    })
  }
  return null
}

function genMediumStamp(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const n = pickOne([20, 24, 30])
    const high = pickOne([5, 6, 8, 10])
    const low = n - high
    if (low <= 0) continue
    const faceH = pickOne([5, 8, 10])
    const faceL = pickOne([1, 2])
    const total = high * faceH + low * faceL
    return buildQuestion({
      difficulty: 'medium',
      term: '两种面值邮票',
      passage: `两种邮票共 ${n} 张，面值分别为 ${faceL} 元与 ${faceH} 元，总面值 ${total} 元。`,
      stem: `${faceH} 元面值的有多少张？`,
      correct: String(high),
      distractors: [String(low), String((total - n * faceL) / (faceH - faceL) + 1), String(n), String(high - 1)],
      method: [
        `假设全是 ${faceL} 元：总值 ${n}×${faceL}=${n * faceL}。`,
        `差额 ${total - n * faceL}÷(${faceH}−${faceL})=${high}。`,
      ].join('\n'),
      explanation: `${faceH} 元的有 ${high} 张。`,
      seq,
    })
  }
  return null
}

function genMediumChickenDuck(seq: number): ChickenRabbitQuestion | null {
  // 鸡 2 腿鸭 2 腿不行；用鹅 2 兔 4 或 鸡鸭体重
  // 鸡每天吃 2 两，兔 5 两
  for (let t = 0; t < 30; t++) {
    const n = pickOne([20, 25, 30])
    const rabbits = pickOne([6, 8, 10])
    const chickens = n - rabbits
    if (chickens <= 0) continue
    const feed = chickens * 2 + rabbits * 5
    return buildQuestion({
      difficulty: 'medium',
      term: '鸡兔食量同笼',
      passage: `鸡兔共 ${n} 只，一天共吃饲料 ${feed} 两。已知鸡每天吃 2 两，兔每天吃 5 两。`,
      stem: '兔有多少只？',
      correct: String(rabbits),
      distractors: [String(chickens), String((feed - n * 2) / 3 + 1), String(n), String(rabbits + 2)],
      method: [
        `假设全是鸡：吃 ${n}×2=${n * 2} 两。`,
        `多 ${feed - n * 2} 两 ÷ (5−2) = 兔 ${rabbits} 只。`,
      ].join('\n'),
      explanation: `兔 ${rabbits} 只。`,
      seq,
    })
  }
  return null
}

function genMediumBoat(seq: number): ChickenRabbitQuestion | null {
  // 大船 5 人，小船 3 人
  for (let t = 0; t < 30; t++) {
    const boats = pickOne([8, 10, 12])
    const big = pickOne([3, 4, 5])
    if (big >= boats) continue
    const small = boats - big
    const people = big * 5 + small * 3
    return buildQuestion({
      difficulty: 'medium',
      term: '大小船同笼',
      passage: `大船每艘坐 5 人，小船每艘坐 3 人。共 ${boats} 艘船，刚好坐 ${people} 人。`,
      stem: '大船有多少艘？',
      correct: String(big),
      distractors: [String(small), String((people - boats * 3) / 2 + 1), String(boats), String(big + 1)],
      method: [
        `假设全是小船：座位 ${boats}×3=${boats * 3}。`,
        `差 ${people - boats * 3}÷(5−3)=大船 ${big} 艘。`,
      ].join('\n'),
      explanation: `大船 ${big} 艘。`,
      seq,
    })
  }
  return null
}

// ——— 困难 ———

function genHardThreeReduce(seq: number): ChickenRabbitQuestion | null {
  // 鸡2、兔4、还有已知数量的鸭2——鸭与鸡同腿，合并为「二足类」
  for (let t = 0; t < 30; t++) {
    const ducks = pickOne([3, 4, 5])
    const chickens = pickOne([8, 10, 12])
    const rabbits = pickOne([6, 7, 8])
    const heads = ducks + chickens + rabbits
    const legs = ducks * 2 + chickens * 2 + rabbits * 4
    const twoFoot = ducks + chickens
    return buildQuestion({
      difficulty: 'hard',
      term: '三类化两类',
      hardTypeId: 'three-attr-reduce',
      passage: `鸡、鸭、兔共 ${heads} 只，脚共 ${legs} 只。已知鸭有 ${ducks} 只（鸡鸭皆 2 足，兔 4 足）。`,
      stem: '兔有多少只？',
      correct: String(rabbits),
      distractors: [String(chickens), String(twoFoot), String(rabbits + ducks), String(heads - ducks)],
      method: [
        `鸭与鸡同为 2 足，先把「非兔」看成一类：非兔 ${heads}−兔。`,
        `或：去掉 ${ducks} 只鸭（带走 ${ducks * 2} 足），剩 ${heads - ducks} 只鸡兔、${legs - ducks * 2} 足。`,
        `假设剩的全是鸡：足 ${(heads - ducks) * 2}；兔 = (${legs - ducks * 2}−${(heads - ducks) * 2})÷2=${rabbits}。`,
      ].join('\n'),
      explanation: `兔 ${rabbits} 只。`,
      seq,
    })
  }
  return null
}

function genHardAskRatio(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const heads = pickOne([24, 30, 36])
    const rabbits = pickOne([8, 9, 10, 12])
    const chickens = heads - rabbits
    if (chickens <= 0 || chickens === rabbits) continue
    const legs = chickens * 2 + rabbits * 4
    const g = (a: number, b: number): number => {
      let x = a
      let y = b
      while (y) {
        const t0 = y
        y = x % y
        x = t0
      }
      return x || 1
    }
    const d = g(chickens, rabbits)
    const ratio = `${chickens / d}:${rabbits / d}`
    const distractors = [
      `${rabbits / d}:${chickens / d}`,
      `${(chickens / d) + 1}:${rabbits / d}`,
      `${chickens / d}:${(rabbits / d) + 1}`,
      '2:1',
      '3:1',
      '3:2',
    ].filter((x) => x !== ratio)
    return buildQuestion({
      difficulty: 'hard',
      term: '求两类数量比',
      hardTypeId: 'ask-ratio',
      passage: `鸡兔同笼，共 ${heads} 个头，${legs} 只脚。`,
      stem: '鸡与兔的数量比是？（已约分）',
      correct: ratio,
      distractors,
      method: [
        '假设全是鸡：脚数应为头数×2；多出来的脚，每多 2 只就对应 1 只兔。',
        `兔 = (${legs}−${heads}×2)÷2=${rabbits}，鸡 = ${heads}−${rabbits}=${chickens}。`,
        `约分得鸡:兔 = ${ratio}。`,
      ].join('\n'),
      explanation: `鸡:兔 = ${ratio}。`,
      seq,
    })
  }
  return null
}

function genHardMoneyFace(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const n = pickOne([40, 50, 60])
    const high = pickOne([12, 15, 18, 20])
    const low = n - high
    const faceH = pickOne([10, 20, 50])
    const faceL = pickOne([1, 5])
    const total = high * faceH + low * faceL
    return buildQuestion({
      difficulty: 'hard',
      term: '面值/票价同笼',
      hardTypeId: 'money-face',
      passage: `两种面值纸币共 ${n} 张，面值 ${faceL} 元与 ${faceH} 元，合计 ${total} 元。`,
      stem: `${faceH} 元纸币有多少张？`,
      correct: String(high),
      distractors: [String(low), String(n), String(high + 2), String((total - n * faceL) / (faceH - faceL) - 1)],
      method: [
        `假设全是 ${faceL} 元：${n}×${faceL}=${n * faceL}。`,
        `${faceH} 元张数 = (${total}−${n * faceL})÷(${faceH}−${faceL})=${high}。`,
      ].join('\n'),
      explanation: `${faceH} 元的有 ${high} 张。`,
      seq,
    })
  }
  return null
}

function genHardWorkDays(seq: number): ChickenRabbitQuestion | null {
  // 甲效率 3，乙效率 5，共 n 人，一天产量
  for (let t = 0; t < 30; t++) {
    const n = pickOne([20, 24, 30])
    const typeB = pickOne([6, 8, 10])
    const typeA = n - typeB
    if (typeA <= 0) continue
    const prod = typeA * 3 + typeB * 5
    return buildQuestion({
      difficulty: 'hard',
      term: '工效同笼',
      hardTypeId: 'work-days',
      passage: `车间 ${n} 人，甲种工人每天做 3 件，乙种每天做 5 件，一天共做 ${prod} 件。`,
      stem: '乙种工人有多少人？',
      correct: String(typeB),
      distractors: [String(typeA), String((prod - n * 3) / 2 + 1), String(n), String(typeB + 1)],
      method: [
        `假设全是甲种：产量 ${n}×3=${n * 3}。`,
        `乙种人数 = (${prod}−${n * 3})÷(5−3)=${typeB}。`,
      ].join('\n'),
      explanation: `乙种 ${typeB} 人。`,
      seq,
    })
  }
  return null
}

function genHardAssumeOtherFirst(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const heads = pickOne([28, 32, 40])
    const chickens = pickOne([15, 18, 20, 22])
    const rabbits = heads - chickens
    if (rabbits <= 0) continue
    const legs = chickens * 2 + rabbits * 4
    return buildQuestion({
      difficulty: 'hard',
      term: '先全设较大类',
      hardTypeId: 'assume-other-first',
      passage: `鸡兔共 ${heads} 只，脚 ${legs} 只。请用「假设全是兔」的方法求解。`,
      stem: '鸡有多少只？',
      correct: String(chickens),
      distractors: [String(rabbits), String(heads), String(chickens + 1), String((heads * 4 - legs) / 2 + 1)],
      method: [
        `全设为兔：脚 ${heads}×4=${heads * 4}。`,
        `少 ${heads * 4 - legs} 只脚 ÷ 2 = 鸡 ${chickens} 只。`,
      ].join('\n'),
      explanation: `鸡 ${chickens} 只。`,
      seq,
    })
  }
  return null
}

function genHardPartialKnown(seq: number): ChickenRabbitQuestion | null {
  // 腿数已知，兔比鸡多 k 只 → 可解
  for (let t = 0; t < 40; t++) {
    const k = pickOne([2, 4, 6])
    const chickens = pickOne([8, 10, 12, 14])
    const rabbits = chickens + k
    const heads = chickens + rabbits
    const legs = chickens * 2 + rabbits * 4
    // 由 legs 与 k 反推：设鸡 x，兔 x+k，2x+4(x+k)=legs ⇒ 6x+4k=legs
    if ((legs - 4 * k) % 6 !== 0) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '已知一类求另一类',
      hardTypeId: 'partial-known',
      passage: `鸡兔同笼，脚共 ${legs} 只，且兔比鸡多 ${k} 只。`,
      stem: '鸡有多少只？',
      correct: String(chickens),
      distractors: [String(rabbits), String(heads), String(chickens + k), String(k)],
      method: [
        `设鸡 x 只，则兔 x+${k} 只。`,
        `2x+4(x+${k})=${legs} ⇒ 6x=${legs - 4 * k} ⇒ x=${chickens}。`,
        '（也可用假设法结合头数关系。）',
      ].join('\n'),
      explanation: `鸡 ${chickens} 只。`,
      seq,
    })
  }
  return null
}

function genHardWheelVehicle(seq: number): ChickenRabbitQuestion | null {
  // 摩托车 2 轮，汽车 4 轮
  for (let t = 0; t < 30; t++) {
    const n = pickOne([25, 30, 35, 40])
    const cars = pickOne([10, 12, 15, 18])
    const bikes = n - cars
    if (bikes <= 0) continue
    const wheels = bikes * 2 + cars * 4
    return buildQuestion({
      difficulty: 'hard',
      term: '车轮同笼',
      hardTypeId: 'wheel-vehicle',
      passage: `摩托车（2 轮）与汽车（4 轮）共 ${n} 辆，车轮共 ${wheels} 个。`,
      stem: '汽车有多少辆？',
      correct: String(cars),
      distractors: [String(bikes), String((wheels - n * 2) / 2 + 1), String(n), String(cars - 1)],
      method: [
        `假设全是摩托车：轮 ${n}×2=${n * 2}。`,
        `汽车 = (${wheels}−${n * 2})÷(4−2)=${cars}。`,
      ].join('\n'),
      explanation: `汽车 ${cars} 辆。`,
      seq,
    })
  }
  return null
}

function genHardSeatsPlus(seq: number): ChickenRabbitQuestion | null {
  for (let t = 0; t < 30; t++) {
    const buses = pickOne([10, 12, 15])
    const largeSeats = pickOne([45, 50, 55])
    const midSeats = pickOne([25, 28, 30])
    const large = pickOne([4, 5, 6, 7])
    if (large >= buses) continue
    const mid = buses - large
    const people = large * largeSeats + mid * midSeats
    return buildQuestion({
      difficulty: 'hard',
      term: '座位同笼加强',
      hardTypeId: 'seats-plus',
      passage: `共 ${buses} 辆车运送 ${people} 人。大客 ${largeSeats} 座，中客 ${midSeats} 座，刚好坐满。`,
      stem: '大客车有多少辆？',
      correct: String(large),
      distractors: [String(mid), String(buses), String(large + 1), String((people - buses * midSeats) / (largeSeats - midSeats) + 1)],
      method: [
        `全设中客：${buses}×${midSeats}=${buses * midSeats}。`,
        `大客 = (${people}−${buses * midSeats})÷(${largeSeats}−${midSeats})=${large}。`,
      ].join('\n'),
      explanation: `大客 ${large} 辆。`,
      seq,
    })
  }
  return null
}

const HARD_BUILDERS: Record<ChickenRabbitHardTypeId, (seq: number) => ChickenRabbitQuestion | null> = {
  'three-attr-reduce': genHardThreeReduce,
  'ask-ratio': genHardAskRatio,
  'money-face': genHardMoneyFace,
  'work-days': genHardWorkDays,
  'assume-other-first': genHardAssumeOtherFirst,
  'partial-known': genHardPartialKnown,
  'wheel-vehicle': genHardWheelVehicle,
  'seats-plus': genHardSeatsPlus,
}

function tryBuild(factory: () => ChickenRabbitQuestion | null, maxTry = 40): ChickenRabbitQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type CRFactory = { key: string; build: (seq: number) => ChickenRabbitQuestion | null }

export function generateChickenRabbitPaper(difficulty: ChickenRabbitDifficulty): ChickenRabbitQuestion[] {
  const out: ChickenRabbitQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: ChickenRabbitQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: CRFactory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= CHICKEN_RABBIT_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < CHICKEN_RABBIT_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'ask-rabbit', build: genEasyChickenRabbitAskRabbit },
      { key: 'ask-chicken', build: genEasyChickenRabbitAskChicken },
      { key: 'crane-turtle', build: genEasyCraneTurtle },
      { key: 'pencil', build: genEasyPencilPrice },
      { key: 'bike-trike', build: genEasyBikeTrike },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'bus-classic', build: genMediumBusClassic },
      { key: 'ask-mid', build: genMediumAskMidBus },
      { key: 'stamp', build: genMediumStamp },
      { key: 'feed', build: genMediumChickenDuck },
      { key: 'boat', build: genMediumBoat },
    ])
  } else {
    const used = new Set<ChickenRabbitHardTypeId>()
    const types = shuffleInPlace([...CHICKEN_RABBIT_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= CHICKEN_RABBIT_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = CHICKEN_RABBIT_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < CHICKEN_RABBIT_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : CHICKEN_RABBIT_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, CHICKEN_RABBIT_QUESTION_COUNT)
}
