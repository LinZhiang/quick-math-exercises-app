/**
 * 其他运算 · 比赛问题
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。简单 / 普通 / 困难。
 *
 * 书中基本公式：
 * - 淘汰赛决出冠军：场次 = n − 1（每场淘汰 1 人）
 * - 淘汰赛排出 1～4 名（含三四名决赛）：场次 = n
 * - 单循环：场次 = C(n,2) = n(n−1)/2
 * - 双循环：场次 = A(n,2) = n(n−1)
 * 中公锦囊：握手/对阵可用连线示意图分析。
 *
 * 【简单】比经典真题更易（直接套公式）
 * 【普通】对齐经典真题（五人握手度数推理）及同类
 * 【困难】高于例题；≥6 变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type CompetitionDifficulty = 'easy' | 'medium' | 'hard'

export const COMPETITION_QUESTION_COUNT = 5

export const COMPETITION_MODES: {
  id: CompetitionDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '比赛 · 简单',
    desc: '每轮 5 题 · 比经典真题更易（直接套淘汰/循环公式）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '比赛 · 普通',
    desc: '每轮 5 题 · 对齐经典真题（握手连线）及循环场次 · 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '比赛 · 困难',
    desc: '每轮 5 题 · 高于书中例题的变式（每题题型不同）· 本地组卷 · 正计时停表看答案',
  },
]

/** 困难变式（≥6） */
export const COMPETITION_HARD_EXAM_TYPES = [
  { id: 'knockout-top4', name: '淘汰赛排前四', note: '场次 = n（含三四名决赛）' },
  { id: 'handshake-hard', name: '握手加强', note: '人数/度数更复杂的连线推理' },
  { id: 'remaining-matches', name: '剩余场次', note: '单循环总场 − 已赛场次' },
  { id: 'score-points', name: '积分赛', note: '胜平负积分反推场次或结果' },
  { id: 'knockout-byes', name: '轮空次数', note: '奇数人轮次中的轮空计数' },
  { id: 'cycle-diff', name: '单双循环差', note: 'A_n^2 − C_n^2 = n(n−1)/2' },
  { id: 'inverse-n', name: '反推人数', note: '已知场次反推 n' },
  { id: 'partial-degree', name: '部分对阵', note: '已知部分握手求未知边' },
] as const

export type CompetitionHardTypeId = (typeof COMPETITION_HARD_EXAM_TYPES)[number]['id']

export type CompetitionQuestion = {
  id: string
  topic: 'competition'
  difficulty: CompetitionDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: CompetitionHardTypeId
}

export function competitionTopicLabel(): string {
  return '比赛问题'
}

export function competitionDifficultyLabel(d: CompetitionDifficulty): string {
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

function numDistractors(correct: number, extras: number[] = []): string[] {
  const base = [
    correct - 1,
    correct + 1,
    correct - 2,
    correct + 2,
    Math.floor(correct / 2),
    correct * 2,
    ...extras,
  ]
    .filter((x) => Number.isFinite(x) && x !== correct && x > 0)
    .map(String)
  return uniqueStr(String(correct), base)
}

function buildQuestion(input: {
  difficulty: CompetitionDifficulty
  term: string
  passage: string
  stem: string
  correct: string
  distractors: string[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: CompetitionHardTypeId
}): CompetitionQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct,
    uniqueStr(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'competition',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `cp-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'competition',
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

const C2 = (n: number) => (n * (n - 1)) / 2
const A2 = (n: number) => n * (n - 1)

/** 淘汰赛决冠军：场次 = n−1 */
function knockoutChampion(n: number) {
  return n - 1
}

/** 淘汰赛排出 1～4 名：场次 = n */
function knockoutTop4(n: number) {
  return n
}

// ——— 简单 ———

function genEasyKnockoutChampion(seq: number): CompetitionQuestion | null {
  const n = pickOne([8, 10, 12, 16, 20, 32])
  const ans = knockoutChampion(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '淘汰赛·决冠军',
    passage: `某淘汰赛共有 ${n} 名选手参赛，每场比赛淘汰 1 人，直至决出一名冠军。`,
    stem: '一共需要进行多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [n, C2(n), Math.floor(n / 2)]),
    method: [
      '淘汰赛可以想成：每打一场，就少一个人。',
      `要剩下唯一冠军，需要淘汰 ${n}−1 人，所以一共 ${ans} 场。`,
      '（有人轮空也不改这个结论：轮空不淘汰人，总场次仍是 n−1。）',
    ].join('\n'),
    explanation: `答案 ${ans}。口诀：淘汰赛决冠军，场次=人数−1。`,
    seq,
  })
}

function genEasySingleRound(seq: number): CompetitionQuestion | null {
  const n = pickOne([5, 6, 7, 8, 9, 10])
  const ans = C2(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '单循环·场次',
    passage: `${n} 支球队进行单循环赛（任意两队只赛 1 场，出场顺序不计）。`,
    stem: '一共要进行多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [A2(n), n - 1, n]),
    method: [
      '单循环=「每个队都要和其他队打一场」，顺序无所谓。',
      `场次就是从 ${n} 队里任选 2 队的组合数：C(${n},2)=${n}×${n - 1}/2=${ans}。`,
      '也可想成握手：n 人两两握一次手，握了几次就打了几场。',
    ].join('\n'),
    explanation: `答案 ${ans}。口诀：单循环场次 = n(n−1)/2。`,
    seq,
  })
}

function genEasyDoubleRound(seq: number): CompetitionQuestion | null {
  const n = pickOne([4, 5, 6, 7, 8])
  const ans = A2(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '双循环·场次',
    passage: `${n} 支球队进行双循环赛（任意两队主客场各赛 1 场，共 2 场）。`,
    stem: '一共要进行多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [C2(n), n - 1, 2 * C2(n)]),
    method: [
      '双循环=主客场各打一场，任意两队要打 2 场。',
      `场次 = ${n}×${n - 1}=${ans}（也等于单循环场次的 2 倍）。`,
    ].join('\n'),
    explanation: `答案 ${ans}。口诀：双循环场次 = n(n−1)。`,
    seq,
  })
}

function genEasyKnockoutExample(seq: number): CompetitionQuestion | null {
  // 对齐书中 10 人例：5+2+1+1=9，但问总场次用 n−1
  const n = pickOne([6, 9, 10, 11, 14])
  const ans = knockoutChampion(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '淘汰赛·含轮空',
    passage: `${n} 人参加淘汰赛争夺冠军。人数为奇数时有人轮空，但每场仍淘汰 1 人。`,
    stem: '决出冠军一共需要多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [n, C2(n), Math.ceil(Math.log2(n))]),
    method: [
      '无论是否轮空：每场淘汰 1 人，淘汰 n−1 人即产生冠军。',
      `场次 = ${n}−1 = ${ans}（轮空不改变总场次公式）。`,
    ].join('\n'),
    explanation: `答案 ${ans}。书中 10 人例：5+2+1+1=9，即 n−1。`,
    seq,
  })
}

function genEasyHandshakeTotal(seq: number): CompetitionQuestion | null {
  const n = pickOne([4, 5, 6, 7])
  const ans = C2(n)
  return buildQuestion({
    difficulty: 'easy',
    term: '握手·总次数',
    passage: `${n} 人聚会，任意两人恰好握手一次（可看作单循环「场次」）。`,
    stem: '一共握手多少次？',
    correct: String(ans),
    distractors: numDistractors(ans, [A2(n), n - 1]),
    method: [`握手一次对应一对人：次数 = C(${n},2) = ${ans}。`].join('\n'),
    explanation: `答案 ${ans}。与单循环公式相同：C_n^2。`,
    seq,
  })
}

// ——— 普通（对齐经典握手真题） ———

const NAMES_POOL = [
  ['老张', '老王', '老刘', '老赵', '老李'],
  ['甲', '乙', '丙', '丁', '戊'],
  ['小明', '小红', '小刚', '小芳', '小强'],
]

/**
 * 经典度数序列：4,3,2,1,2 的同构图
 * 最大度连所有人；最小度只连最大度；次大度连最大、中间、次小…
 * 经典：张4、王3、李2、赵1 → 刘连张、王
 */
function genMediumHandshakeClassic(seq: number): CompetitionQuestion | null {
  const names = pickOne(NAMES_POOL)
  // 固定角色：A度4, B度3, C度2(所求), D度1, E度2
  const [A, B, C, D, E] = names
  const correct = `${A}和${B}`
  const distractors = [
    `${A}和${E}`,
    `${A}、${B}和${E}`,
    `${A}、${B}、${E}和${D}`,
  ]
  return buildQuestion({
    difficulty: 'medium',
    term: '握手·经典连线',
    passage: `${A}、${B}、${C}、${D}、${E}五人互相握手。${A}与其余 4 人都握了手，${B}与 3 人握了手，${E}与 2 人握了手，${D}与 1 人握了手。`,
    stem: `${C}与谁握了手？`,
    correct,
    distractors,
    method: [
      '把五人画成五个点，握过手就连一条线（中公锦囊：连线示意图）。',
      `${A} 握了 4 次 ⇒ 与另外四人都有连线。于是 ${D} 仅有的那 1 次，只能是与 ${A} 握的。`,
      `${B} 握了 3 次：不能再连 ${D}（${D} 已经「满额」），所以 ${B} 只能连 ${A}、${C}、${E}。`,
      `再看 ${C}：已经确定连着 ${A}、${B}；核对 ${E} 的次数后可知 ${C} 不再连 ${E}、${D}。`,
      `因此 ${C} 只与 ${A}、${B} 握了手。`,
    ].join('\n'),
    explanation: `答案：${correct}。口诀：握得最少的人，一定握过「握得最多的人」。`,
    seq,
  })
}

function genMediumSingleAskN(seq: number): CompetitionQuestion | null {
  const n = pickOne([6, 7, 8, 9, 10])
  const matches = C2(n)
  // 问：共 matches 场单循环，几支队？
  return buildQuestion({
    difficulty: 'medium',
    term: '单循环·反推队数',
    passage: `某联赛采用单循环赛制，共进行了 ${matches} 场比赛（任意两队只赛 1 场）。`,
    stem: '共有多少支参赛队？',
    correct: String(n),
    distractors: numDistractors(n, [n + 1, n - 1, matches]),
    method: [
      `设队数为 n，则 n(n−1)/2 = ${matches}。`,
      `试算得 n = ${n}（因 ${n}×${n - 1}/2 = ${matches}）。`,
    ].join('\n'),
    explanation: `答案 ${n}。单循环：C_n^2 = 场次。`,
    seq,
  })
}

function genMediumDoubleVsSingle(seq: number): CompetitionQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const single = C2(n)
  const dbl = A2(n)
  const askDouble = Math.random() < 0.5
  if (askDouble) {
    return buildQuestion({
      difficulty: 'medium',
      term: '双循环·对照',
      passage: `${n} 队若打单循环共 ${single} 场。现改为双循环（主客场各一场）。`,
      stem: '双循环一共多少场？',
      correct: String(dbl),
      distractors: numDistractors(dbl, [single, single * 2, n - 1]),
      method: [`双循环场次 = A(${n},2) = ${n}×${n - 1} = ${dbl}（恰为单循环的 2 倍）。`].join('\n'),
      explanation: `答案 ${dbl}。A_n^2 = n(n−1)。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'medium',
    term: '单循环·对照',
    passage: `${n} 队双循环共 ${dbl} 场。若改为单循环（任意两队只赛一场）。`,
    stem: '单循环一共多少场？',
    correct: String(single),
    distractors: numDistractors(single, [dbl, n - 1, dbl / 2]),
    method: [`单循环场次 = C(${n},2) = ${n}×${n - 1}/2 = ${single}。`].join('\n'),
    explanation: `答案 ${single}。C_n^2 = n(n−1)/2。`,
    seq,
  })
}

function genMediumKnockoutFromMatches(seq: number): CompetitionQuestion | null {
  const n = pickOne([8, 12, 16, 20, 24])
  const matches = knockoutChampion(n)
  return buildQuestion({
    difficulty: 'medium',
    term: '淘汰赛·已知场次',
    passage: `一场淘汰赛决出冠军，共进行了 ${matches} 场比赛（每场淘汰 1 人）。`,
    stem: '最初有多少名选手参赛？',
    correct: String(n),
    distractors: numDistractors(n, [matches, matches + 2, n / 2]),
    method: [`场次 = n−1 = ${matches} ⇒ n = ${matches}+1 = ${n}。`].join('\n'),
    explanation: `答案 ${n}。`,
    seq,
  })
}

function genMediumHandshakeWhoNot(seq: number): CompetitionQuestion | null {
  const names = pickOne(NAMES_POOL)
  const [A, B, C, D, E] = names
  // 问：赵（D）与谁没有握手以外的… 经典中 D 只与 A 握，问 D 没与谁握 — 改问「谁没和赵握手」干扰太多
  // 改为问：老赵只可能与谁握手
  const correct = A
  const distractors = [B, C, E]
  return buildQuestion({
    difficulty: 'medium',
    term: '握手·最小度',
    passage: `${A}、${B}、${C}、${D}、${E}五人互相握手。${A}握手 4 次，${B}握手 3 次，${C}握手 2 次，${E}握手 2 次，${D}握手 1 次。`,
    stem: `${D}只可能与谁握了手？`,
    correct,
    distractors,
    method: [
      `${A} 度数为 4，与所有人握手，故 ${D} 的唯一一次握手只能是与 ${A}。`,
      '（连线图：最小度点必与最大度点相连。）',
    ].join('\n'),
    explanation: `答案：${correct}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardKnockoutTop4(seq: number): CompetitionQuestion | null {
  const n = pickOne([8, 12, 16, 20, 24, 32])
  const ans = knockoutTop4(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '淘汰赛排前四',
    hardTypeId: 'knockout-top4',
    passage: `${n} 人参加淘汰赛，不仅要决出冠军，还要通过三四名决赛排出第 1～4 名。`,
    stem: '一共需要进行多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [n - 1, n + 1, C2(n)]),
    method: [
      '决出冠军需 n−1 场；再加 1 场三四名决赛。',
      `总场次 = (n−1)+1 = n = ${ans}。`,
      '（书中表格：淘汰赛排出 1～4 名，场次 = n。）',
    ].join('\n'),
    explanation: `答案 ${ans}。公式：排前四名场次 = n。`,
    seq,
  })
}

function genHardHandshakeHard(seq: number): CompetitionQuestion | null {
  // 合法度序列 5,3,3,2,2,1（度和=16，偶；最小度必连最大度）
  const names = ['甲', '乙', '丙', '丁', '戊', '己']
  const [A, B, C, D, E, F] = names
  const correct = A
  return buildQuestion({
    difficulty: 'hard',
    term: '握手加强',
    hardTypeId: 'handshake-hard',
    passage: `${names.join('、')}六人互相握手。各人握手次数分别是：${A} 5 次，${B} 3 次，${C} 3 次，${D} 2 次，${E} 2 次，${F} 1 次。`,
    stem: `${F}与谁握了手？`,
    correct,
    distractors: [B, C, D],
    method: [
      '把六人画成六个点，握手画成连线；握手次数=该点引出的线数。',
      `${A} 握了 5 次 ⇒ 与其余五人全有连线，所以 ${F} 的那 1 次握手只能是与 ${A}。`,
      `（其余度数 3、3、2、2 可继续连线核对，但不影响本题结论。）`,
    ].join('\n'),
    explanation: `答案：${correct}。口诀：握得最少的人，一定握过「握得最多的人」。`,
    seq,
  })
}

function genHardRemainingMatches(seq: number): CompetitionQuestion | null {
  const n = pickOne([8, 9, 10, 12])
  const total = C2(n)
  const half = Math.ceil(total / 2)
  const played = randInt(half, Math.max(half, total - 2))
  if (played >= total) return null
  const ans = total - played
  return buildQuestion({
    difficulty: 'hard',
    term: '剩余场次',
    hardTypeId: 'remaining-matches',
    passage: `${n} 队打单循环赛（任意两队只赛 1 场），全程共要赛完所有场次。目前已经赛完 ${played} 场。`,
    stem: '还剩多少场比赛？',
    correct: String(ans),
    distractors: numDistractors(ans, [total, played, A2(n) - played]),
    method: [
      `先算总场次：单循环 C(${n},2)=${n}×${n - 1}/2=${total}（就像 ${n} 人两两握一次手）。`,
      `剩余 = 总场次 − 已赛 = ${total}−${played}=${ans}。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genHardScorePoints(seq: number): CompetitionQuestion | null {
  const n = pickOne([5, 6, 7, 8])
  const matches = C2(n)
  const totalPts = 3 * matches
  return buildQuestion({
    difficulty: 'hard',
    term: '积分赛',
    hardTypeId: 'score-points',
    passage: `${n} 队单循环，每场必分胜负：胜者得 3 分、负者 0 分（没有平局）。赛季全部打完后，所有球队的积分加起来一共是 ${totalPts} 分。`,
    stem: '一共进行了多少场比赛？',
    correct: String(matches),
    distractors: numDistractors(matches, [totalPts, Math.round(totalPts / 2), A2(n), n - 1]),
    method: [
      '每一场比赛恰好产生 3 分（胜 3 + 负 0）。',
      `所以场次数 = 总积分 ÷ 3 = ${totalPts}÷3=${matches}。`,
      `再用单循环公式核对：C(${n},2)=${matches}。`,
    ].join('\n'),
    explanation: `答案 ${matches}。记住：无平局时「总积分÷3=场次」。`,
    seq,
  })
}

function genHardKnockoutByes(seq: number): CompetitionQuestion | null {
  // 书中 10 人：轮空 2 次。一般：每轮奇数人时有 1 次轮空，直到剩 1 人
  // 总轮空次数 = 下一 2 的幂 − n？ 不对。
  // 实际上淘汰到冠军，轮空次数 = 凑成 2^k 的补数？ 
  // 更准确：从 n 人到 1 人，若每轮配对，奇数人时轮空 1 人晋级。
  // 总轮空次数可以用：下一 2 的幂 − n（仅当用「补足到 2^k」的赛制）
  // 书中 10 人例逐步：轮空 2 次。10→下一幂 16，16-10=6 不是 2。
  // 逐步计数更可靠：
  function countByes(start: number): number {
    let cur = start
    let byes = 0
    while (cur > 1) {
      if (cur % 2 === 1) {
        byes += 1
        cur = (cur - 1) / 2 + 1 // 一场轮空晋级 + (cur-1)/2 场产生 (cur-1)/2 人 → 共 (cur-1)/2 + 1
        // simpler: odd → 1 bye, (cur-1)/2 matches, next = (cur-1)/2 + 1
      } else {
        cur = cur / 2
      }
    }
    return byes
  }
  const n = pickOne([9, 10, 11, 12, 13, 14])
  const ans = countByes(n)
  if (ans <= 0) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '轮空次数',
    hardTypeId: 'knockout-byes',
    passage: `${n} 人淘汰赛决冠军：每轮两人一组比赛，奇数人时有一人轮空直接晋级。`,
    stem: '整个赛程中一共出现多少次「轮空」？',
    correct: String(ans),
    distractors: numDistractors(ans, [n - 1, Math.ceil(Math.log2(n)), 0]),
    method: [
      '逐轮模拟：人数为奇数则该轮计 1 次轮空，晋级人数 = ⌊人数/2⌋ + (奇数?1:0)。',
      `模拟得总轮空 ${ans} 次。（总场次仍为 n−1，与轮空无关。）`,
    ].join('\n'),
    explanation: `答案 ${ans}。书中 10 人例轮空 2 次。`,
    seq,
  })
}

function genHardCycleDiff(seq: number): CompetitionQuestion | null {
  const n = pickOne([6, 7, 8, 9, 10])
  const ans = C2(n) // A2 - C2 = C2
  return buildQuestion({
    difficulty: 'hard',
    term: '单双循环差',
    hardTypeId: 'cycle-diff',
    passage: `${n} 支球队，双循环场次比单循环多多少场？`,
    stem: '多出的场次数是？',
    correct: String(ans),
    distractors: numDistractors(ans, [A2(n), n - 1, n]),
    method: [
      `双循环 A(${n},2)=${A2(n)}，单循环 C(${n},2)=${C2(n)}。`,
      `差 = ${A2(n)} − ${C2(n)} = ${ans}（恰等于再打一个单循环）。`,
    ].join('\n'),
    explanation: `答案 ${ans}。`,
    seq,
  })
}

function genHardInverseN(seq: number): CompetitionQuestion | null {
  const kind = pickOne(['single', 'double', 'knockout'] as const)
  if (kind === 'single') {
    const n = pickOne([7, 8, 9, 10, 11])
    const m = C2(n)
    return buildQuestion({
      difficulty: 'hard',
      term: '反推人数',
      hardTypeId: 'inverse-n',
      passage: `单循环共 ${m} 场比赛。`,
      stem: '参赛队数 n 为多少？',
      correct: String(n),
      distractors: numDistractors(n, [m, n + 1]),
      method: [`n(n−1)/2 = ${m} ⇒ n = ${n}。`].join('\n'),
      explanation: `答案 ${n}。`,
      seq,
    })
  }
  if (kind === 'double') {
    const n = pickOne([5, 6, 7, 8, 9])
    const m = A2(n)
    return buildQuestion({
      difficulty: 'hard',
      term: '反推人数',
      hardTypeId: 'inverse-n',
      passage: `双循环共 ${m} 场比赛。`,
      stem: '参赛队数 n 为多少？',
      correct: String(n),
      distractors: numDistractors(n, [m, Math.sqrt(m)]),
      method: [`n(n−1) = ${m} ⇒ n = ${n}。`].join('\n'),
      explanation: `答案 ${n}。`,
      seq,
    })
  }
  const n = pickOne([15, 17, 19, 25, 31])
  const m = knockoutChampion(n)
  return buildQuestion({
    difficulty: 'hard',
    term: '反推人数',
    hardTypeId: 'inverse-n',
    passage: `淘汰赛决出冠军共用了 ${m} 场。`,
    stem: '最初参赛人数是多少？',
    correct: String(n),
    distractors: numDistractors(n, [m, m + 2]),
    method: [`n−1 = ${m} ⇒ n = ${n}。`].join('\n'),
    explanation: `答案 ${n}。`,
    seq,
  })
}

function genHardPartialDegree(seq: number): CompetitionQuestion | null {
  const names = pickOne(NAMES_POOL)
  const [A, B, C, D, E] = names
  // 已知：单循环应有 C(5,2)=10 次握手；已发生部分；或问总握手还差几次
  // 用经典图：已知边数已确定为 4+3+2+2+1=12 的一半 = 6 条边
  const total = C2(5)
  return buildQuestion({
    difficulty: 'hard',
    term: '部分对阵',
    hardTypeId: 'partial-degree',
    passage: `${A}、${B}、${C}、${D}、${E}按「每人握手次数分别为 4、3、2、1、2」完成全部握手（与经典真题同构）。`,
    stem: '一共握手多少次？',
    correct: String(total),
    distractors: numDistractors(total, [4 + 3 + 2 + 1 + 2, A2(5), 5]),
    method: [
      '握手图边数 = 度数和 / 2。',
      `度数和 = 4+3+2+1+2 = 12，边数 = 12/2 = ${total}。`,
      `亦等于单循环 C(5,2) = ${total}。`,
    ].join('\n'),
    explanation: `答案 ${total}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  CompetitionHardTypeId,
  (seq: number) => CompetitionQuestion | null
> = {
  'knockout-top4': genHardKnockoutTop4,
  'handshake-hard': genHardHandshakeHard,
  'remaining-matches': genHardRemainingMatches,
  'score-points': genHardScorePoints,
  'knockout-byes': genHardKnockoutByes,
  'cycle-diff': genHardCycleDiff,
  'inverse-n': genHardInverseN,
  'partial-degree': genHardPartialDegree,
}

function tryBuild(factory: () => CompetitionQuestion | null, maxTry = 40): CompetitionQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

type Factory = { key: string; build: (seq: number) => CompetitionQuestion | null }

export function generateCompetitionPaper(difficulty: CompetitionDifficulty): CompetitionQuestion[] {
  const out: CompetitionQuestion[] = []
  const seen = new Set<string>()
  const usedKeys = new Set<string>()
  const push = (q: CompetitionQuestion | null, typeKey: string) => {
    if (!q || seen.has(q.fingerprint) || usedKeys.has(typeKey)) return false
    seen.add(q.fingerprint)
    usedKeys.add(typeKey)
    out.push(q)
    return true
  }

  const fillFromFactories = (factories: Factory[]) => {
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= COMPETITION_QUESTION_COUNT) break
      push(tryBuild(() => f.build(out.length)), f.key)
    }
    let guard = 0
    const remain = () => factories.filter((f) => !usedKeys.has(f.key))
    while (out.length < COMPETITION_QUESTION_COUNT && guard++ < 60) {
      const pool = remain()
      if (!pool.length) break
      const f = pickOne(pool)
      push(tryBuild(() => f.build(out.length)), f.key)
    }
  }

  if (difficulty === 'easy') {
    fillFromFactories([
      { key: 'ko-champ', build: genEasyKnockoutChampion },
      { key: 'single', build: genEasySingleRound },
      { key: 'double', build: genEasyDoubleRound },
      { key: 'ko-bye', build: genEasyKnockoutExample },
      { key: 'handshake-total', build: genEasyHandshakeTotal },
    ])
  } else if (difficulty === 'medium') {
    fillFromFactories([
      { key: 'handshake-classic', build: genMediumHandshakeClassic },
      { key: 'single-ask-n', build: genMediumSingleAskN },
      { key: 'double-vs-single', build: genMediumDoubleVsSingle },
      { key: 'ko-from-m', build: genMediumKnockoutFromMatches },
      { key: 'handshake-min', build: genMediumHandshakeWhoNot },
    ])
  } else {
    const used = new Set<CompetitionHardTypeId>()
    const types = shuffleInPlace([...COMPETITION_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= COMPETITION_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40), typeId)
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = COMPETITION_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < COMPETITION_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length ? remain : COMPETITION_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, COMPETITION_QUESTION_COUNT)
}
