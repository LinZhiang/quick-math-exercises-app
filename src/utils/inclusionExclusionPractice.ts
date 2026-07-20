/**
 * 其他运算 · 容斥问题
 * 本地程序出题（不调用 AI）。每轮 6 题四选一。简单 / 普通 / 困难。
 *
 * 教材公式：
 * - 两集合：A∪B = A+B−A∩B；总数 = 并集 + 都不
 * - 三集合：A∪B∪C = A+B+C−(A∩B)−(B∩C)−(C∩A)+(A∩B∩C)
 * - 推导：满足条件人数 = 三项之和 − (只属两项) − 2×(三项都属)
 * - 多集合交极值：min(A∩B)=a+b−m；min(A∩B∩C)=a+b+c−2m；min(四交)=a+b+c+d−3m
 *
 * 【简单】对齐经典真题 1（两集合 + 都不）
 * 【普通】对齐经典真题 2（三集合求只属两项）
 * 【困难】对齐经典真题 3（多集合交最小值）；≥8 种变式，每轮题型不重复
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type InclusionExclusionDifficulty = 'easy' | 'medium' | 'hard'

export const INCLUSION_EXCLUSION_QUESTION_COUNT = 6

export const INCLUSION_EXCLUSION_MODES: {
  id: InclusionExclusionDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '容斥 · 简单',
    desc: '每轮 6 题 · 对齐经典真题 1（两集合容斥）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '容斥 · 普通',
    desc: '每轮 6 题 · 对齐经典真题 2（三集合求只属两项）· 本地组卷 · 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '容斥 · 困难',
    desc: '每轮 6 题 · 对齐经典真题 3（多集合交极值）· 每题题型不同 · 正计时停表看答案',
  },
]

/** 困难 · 多集合容斥极值变式（≥8） */
export const INCLUSION_EXCLUSION_HARD_EXAM_TYPES = [
  {
    id: 'min-inter-2',
    name: '两集合交最小',
    note: 'min(A∩B)=a+b−m',
  },
  {
    id: 'min-inter-3',
    name: '三集合交最小',
    note: '经典真题 3：min(A∩B∩C)=a+b+c−2m',
  },
  {
    id: 'min-inter-4',
    name: '四集合交最小',
    note: 'min(四交)=a+b+c+d−3m',
  },
  {
    id: 'complement-3',
    name: '补集法求三交最小',
    note: '真题 3 法一：m−(不属A+不属B+不属C)',
  },
  {
    id: 'min-inter-3-ask-max-miss',
    name: '先求最多未全交',
    note: '先求最多「至少一人未借」，再反推最小全交',
  },
  {
    id: 'min-inter-2-disguise',
    name: '两交最小变装',
    note: '换场景仍套 a+b−m',
  },
  {
    id: 'min-inter-3-disguise',
    name: '三交最小变装',
    note: '换杂志/课程/问卷等场景',
  },
  {
    id: 'min-union-bound',
    name: '并集下界相关',
    note: '由交最小推出并集最大等变形',
  },
  {
    id: 'min-inter-3-percent',
    name: '百分数三交最小',
    note: '先还原人数再套公式',
  },
  {
    id: 'min-common-two-of-three',
    name: '三人中某两人之交最小',
    note: '在总量约束下求指定两集合交的最小',
  },
] as const

export type InclusionExclusionHardTypeId =
  (typeof INCLUSION_EXCLUSION_HARD_EXAM_TYPES)[number]['id']

export type InclusionExclusionDiagramPreset = 'venn-2' | 'venn-3' | 'venn-min'

export type InclusionExclusionQuestion = {
  id: string
  topic: 'inclusion-exclusion'
  difficulty: InclusionExclusionDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: InclusionExclusionHardTypeId
  diagramPreset?: InclusionExclusionDiagramPreset
  diagramCaption?: string
}

export function inclusionExclusionTopicLabel(): string {
  return '容斥问题'
}

export function inclusionExclusionDifficultyLabel(d: InclusionExclusionDifficulty): string {
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

function uniqueNum(correct: number, cands: number[]): string[] {
  const out: string[] = []
  const seen = new Set([String(correct)])
  for (const c of cands) {
    if (!Number.isFinite(c) || c === correct || c < 0) continue
    const s = String(Math.round(c))
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= 3) break
  }
  let g = 1
  while (out.length < 3 && g < 40) {
    const fake = String(correct + g)
    g++
    if (seen.has(fake)) continue
    seen.add(fake)
    out.push(fake)
  }
  return out.slice(0, 3)
}

function buildQuestion(input: {
  difficulty: InclusionExclusionDifficulty
  term: string
  passage: string
  stem: string
  correct: number
  distractors: number[]
  method: string
  explanation: string
  seq: number
  hardTypeId?: InclusionExclusionHardTypeId
  diagramPreset?: InclusionExclusionDiagramPreset
  diagramCaption?: string
}): InclusionExclusionQuestion | null {
  const assembled = assembleFourChoiceMcq(
    String(input.correct),
    uniqueNum(input.correct, input.distractors),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'inclusion-exclusion',
    input.difficulty,
    input.hardTypeId ?? '',
    input.passage,
    input.stem,
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `ie-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'inclusion-exclusion',
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
    diagramPreset: input.diagramPreset,
    diagramCaption: input.diagramCaption,
  }
}

// ——— 简单 · 真题 1 ———

function genEasyClassic1(seq: number): InclusionExclusionQuestion | null {
  // 总数 = A+B−交 + 都不
  for (let i = 0; i < 40; i++) {
    const both = pickOne([5, 6, 7, 8, 9])
    const onlyA = pickOne([8, 10, 11, 12])
    const onlyB = pickOne([12, 14, 15, 16])
    const a = onlyA + both
    const b = onlyB + both
    const neither = pickOne([1, 2, 3, 4])
    const union = a + b - both
    const total = union + neither
    if (total < 20 || total > 80) continue
    return buildQuestion({
      difficulty: 'easy',
      term: '两集合容斥求总数（经典真题 1）',
      passage: `某班喜欢语文的有 ${a} 人，喜欢数学的有 ${b} 人，两科都喜欢的有 ${both} 人，两科都不喜欢的有 ${neither} 人。`,
      stem: '该班共有多少人？',
      correct: total,
      distractors: [union, a + b + neither, a + b - both - neither, total + 1, total - 1],
      method: [
        '两集合容斥：',
        `① 至少喜欢一科 = A+B−交 = ${a}+${b}−${both} = ${union}。`,
        `② 全班人数 = 至少一科 + 都不 = ${union}+${neither} = ${total}。`,
      ].join('\n'),
      explanation: `对照韦恩图：两圆覆盖 ${union} 人，再加上都不的 ${neither} 人，共 ${total} 人。`,
      seq,
      diagramPreset: 'venn-2',
      diagramCaption: `读图：两圆交叠是「都喜欢」${both} 人；两圆覆盖 = ${a}+${b}−${both}；再加圈外「都不」。`,
    })
  }
  return null
}

function genEasyUnionOnly(seq: number): InclusionExclusionQuestion | null {
  const both = pickOne([4, 5, 6, 7])
  const a = pickOne([15, 18, 20, 22])
  const b = pickOne([16, 19, 21, 24])
  if (both > Math.min(a, b)) return null
  const union = a + b - both
  return buildQuestion({
    difficulty: 'easy',
    term: '两集合求并集',
    passage: `参加书法的有 ${a} 人，参加绘画的有 ${b} 人，两项都参加的有 ${both} 人。`,
    stem: '至少参加一项的有多少人？',
    correct: union,
    distractors: [a + b, a + b + both, a + b - 2 * both, union + both],
    method: `两集合：并集 = A+B−交 = ${a}+${b}−${both} = ${union}。`,
    explanation: `直接套公式得 ${union}。`,
    seq,
    diagramPreset: 'venn-2',
    diagramCaption: '读图：两圆覆盖面积 = 两圆面积和 − 重叠部分。',
  })
}

function genEasyBothFromUnion(seq: number): InclusionExclusionQuestion | null {
  const onlyA = pickOne([10, 12, 14])
  const onlyB = pickOne([8, 9, 11])
  const both = pickOne([5, 6, 7])
  const a = onlyA + both
  const b = onlyB + both
  const union = onlyA + onlyB + both
  return buildQuestion({
    difficulty: 'easy',
    term: '已知并集反推交集',
    passage: `喜欢足球的有 ${a} 人，喜欢篮球的有 ${b} 人，至少喜欢其中一项的有 ${union} 人。`,
    stem: '两项都喜欢的有多少人？',
    correct: both,
    distractors: [a + b - union + 1, union - a, Math.abs(a - b), both + 2],
    method: `由 A∪B = A+B−交，得 交 = A+B−并 = ${a}+${b}−${union} = ${both}。`,
    explanation: `交集为 ${both}。`,
    seq,
    diagramPreset: 'venn-2',
  })
}

function genEasyNeither(seq: number): InclusionExclusionQuestion | null {
  const total = pickOne([40, 45, 50])
  const a = pickOne([20, 22, 25])
  const b = pickOne([18, 21, 24])
  const both = pickOne([6, 7, 8])
  if (both > Math.min(a, b)) return null
  const union = a + b - both
  if (union >= total) return null
  const neither = total - union
  return buildQuestion({
    difficulty: 'easy',
    term: '两集合求都不',
    passage: `全班 ${total} 人。会游泳的 ${a} 人，会骑车的 ${b} 人，两项都会的 ${both} 人。`,
    stem: '两项都不会的有多少人？',
    correct: neither,
    distractors: [total - a - b, total - both, neither + both, a + b - total],
    method: [
      `① 至少会一项 = ${a}+${b}−${both} = ${union}。`,
      `② 都不会 = 总数 − 至少一项 = ${total}−${union} = ${neither}。`,
    ].join('\n'),
    explanation: `都不会 ${neither} 人。`,
    seq,
    diagramPreset: 'venn-2',
  })
}

function genEasyOnlyOne(seq: number): InclusionExclusionQuestion | null {
  const both = pickOne([5, 6, 7])
  const a = pickOne([18, 20, 22])
  const b = pickOne([15, 17, 19])
  if (both > Math.min(a, b)) return null
  const onlyA = a - both
  return buildQuestion({
    difficulty: 'easy',
    term: '求只属于一集合',
    passage: `订阅报纸的 ${a} 人，订阅杂志的 ${b} 人，两种都订的 ${both} 人。`,
    stem: '只订报纸、不订杂志的有多少人？',
    correct: onlyA,
    distractors: [a, both, a - b + both, onlyA + both],
    method: `只属 A = A−交 = ${a}−${both} = ${onlyA}。`,
    explanation: `韦恩图中仅 A 的白区为 ${onlyA}。`,
    seq,
    diagramPreset: 'venn-2',
  })
}

// ——— 普通 · 真题 2 ———

function genMediumClassic2(seq: number): InclusionExclusionQuestion | null {
  // 总数−都不 = 三项和 − x − 2×三重交，求 x=只属两项
  for (let i = 0; i < 50; i++) {
    const total = pickOne([100, 120, 125, 130])
    const none = pickOne([15, 18, 20, 22])
    const triple = pickOne([20, 22, 24, 25])
    const a = pickOne([70, 80, 85, 89])
    const b = pickOne([40, 45, 47, 50])
    const c = pickOne([55, 60, 63, 65])
    const covered = total - none
    // covered = a+b+c - x - 2*triple  =>  x = a+b+c - 2*triple - covered
    const x = a + b + c - 2 * triple - covered
    if (x < 10 || x > 80) continue
    if (a + b + c < covered) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '三集合求只属两项（经典真题 2）',
      passage: `某专业共 ${total} 人。参加短跑 ${a} 人、跳远 ${b} 人、跳高 ${c} 人；三项都参加的有 ${triple} 人，三项都不参加的有 ${none} 人。`,
      stem: '恰好参加两项的有多少人？',
      correct: x,
      distractors: [
        a + b + c - covered,
        covered - triple,
        a + b + c - 3 * triple - covered,
        x + triple,
        x - 5,
      ],
      method: [
        '三集合推导公式：',
        '满足条件人数 = 三项之和 − (只属两项) − 2×(三项都属)。',
        `① 至少参加一项 = ${total}−${none} = ${covered}。`,
        `② ${covered} = ${a}+${b}+${c} − x − 2×${triple}。`,
        `③ x = ${a + b + c} − ${2 * triple} − ${covered} = ${x}。`,
      ].join('\n'),
      explanation: `恰好两项的人数为 ${x}。对照三圆韦恩图：灰色「只两两相交」部分合计即 x。`,
      seq,
      diagramPreset: 'venn-3',
      diagramCaption: '读图：黑心=三项都属；灰区=只属两项；白区=只属一项。',
    })
  }
  return null
}

function genMediumThreeUnion(seq: number): InclusionExclusionQuestion | null {
  // 给两两交与三重交，求并集
  const a = pickOne([30, 35, 40])
  const b = pickOne([28, 32, 36])
  const c = pickOne([25, 30, 33])
  const ab = pickOne([8, 10, 12])
  const bc = pickOne([7, 9, 11])
  const ca = pickOne([6, 8, 10])
  const abc = pickOne([2, 3, 4])
  if (abc > Math.min(ab, bc, ca)) return null
  if (ab > Math.min(a, b) || bc > Math.min(b, c) || ca > Math.min(c, a)) return null
  const union = a + b + c - ab - bc - ca + abc
  return buildQuestion({
    difficulty: 'medium',
    term: '三集合标准求并',
    passage: `会英语 ${a} 人、会日语 ${b} 人、会法语 ${c} 人；英日都会 ${ab}、日法都会 ${bc}、法英都会 ${ca}；三种都会 ${abc} 人。`,
    stem: '至少会一门外语的有多少人？',
    correct: union,
    distractors: [
      a + b + c - ab - bc - ca,
      a + b + c - abc,
      union + abc,
      a + b + c,
    ],
    method: [
      '三集合标准公式：',
      `并集 = A+B+C − (AB+BC+CA) + ABC`,
      `= ${a}+${b}+${c} − (${ab}+${bc}+${ca}) + ${abc} = ${union}。`,
    ].join('\n'),
    explanation: `至少会一门共 ${union} 人。`,
    seq,
    diagramPreset: 'venn-3',
  })
}

function genMediumExactlyOne(seq: number): InclusionExclusionQuestion | null {
  // 用推导：covered = sum - x - 2*t，再求只一项 = covered - x - t
  for (let i = 0; i < 40; i++) {
    const total = pickOne([90, 100, 110])
    const none = pickOne([10, 12, 15])
    const triple = pickOne([8, 10, 12])
    const x = pickOne([20, 24, 28, 30]) // exactly two
    const a = pickOne([50, 55, 60])
    const b = pickOne([40, 45, 48])
    const c = pickOne([35, 38, 42])
    const covered = total - none
    // check consistency: covered should equal sum - x - 2*t
    const expect = a + b + c - x - 2 * triple
    if (expect !== covered) continue
    const onlyOne = covered - x - triple
    if (onlyOne < 5) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '三集合求只属一项',
      passage: `共 ${total} 人。参加合唱 ${a}、舞蹈 ${b}、朗诵 ${c}；恰好两项 ${x} 人，三项都参加 ${triple} 人，三项都不参加 ${none} 人。`,
      stem: '恰好只参加一项的有多少人？',
      correct: onlyOne,
      distractors: [covered - x, covered - triple, x + triple, onlyOne + x],
      method: [
        `① 至少一项 = ${total}−${none} = ${covered}。`,
        `② 只一项 + 恰好两项 + 三项都 = 至少一项。`,
        `③ 只一项 = ${covered}−${x}−${triple} = ${onlyOne}。`,
      ].join('\n'),
      explanation: `韦恩图三块白区合计 ${onlyOne}。`,
      seq,
      diagramPreset: 'venn-3',
    })
  }
  return null
}

function genMediumVerifyFormula(seq: number): InclusionExclusionQuestion | null {
  // 已知 sum、triple、covered，求 exactly two
  return genMediumClassic2(seq)
}

function genMediumNoneFromThree(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 40; i++) {
    const total = pickOne([80, 90, 100])
    const a = pickOne([40, 45, 50])
    const b = pickOne([35, 38, 42])
    const c = pickOne([30, 33, 36])
    const x = pickOne([18, 20, 22])
    const triple = pickOne([6, 8, 10])
    const covered = a + b + c - x - 2 * triple
    if (covered <= 0 || covered >= total) continue
    const none = total - covered
    if (none < 3 || none > 40) continue
    return buildQuestion({
      difficulty: 'medium',
      term: '三集合求都不参加',
      passage: `共 ${total} 人。报名甲课 ${a}、乙课 ${b}、丙课 ${c}；恰好报两门 ${x} 人，三门都报 ${triple} 人。`,
      stem: '一门都不报的有多少人？',
      correct: none,
      distractors: [total - a - b - c, none + x, covered, total - triple],
      method: [
        `① 至少报一门 = 三项和 − 恰好两门 − 2×三门都 = ${a}+${b}+${c}−${x}−2×${triple} = ${covered}。`,
        `② 都不报 = ${total}−${covered} = ${none}。`,
      ].join('\n'),
      explanation: `都不报 ${none} 人。`,
      seq,
      diagramPreset: 'venn-3',
    })
  }
  return null
}

// ——— 困难 · 交极值 ———

function genHardMinInter2(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 30; i++) {
    const m = pickOne([50, 60, 80, 100])
    const a = pickOne([Math.floor(m * 0.6), Math.floor(m * 0.7), Math.floor(m * 0.75)])
    const b = pickOne([Math.floor(m * 0.55), Math.floor(m * 0.65), Math.floor(m * 0.7)])
    const ans = a + b - m
    if (ans < 1 || ans > Math.min(a, b)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '两集合交最小值',
      hardTypeId: 'min-inter-2',
      passage: `共有 ${m} 本期刊。小张借过 ${a} 本，小王借过 ${b} 本。`,
      stem: '两人共同借过的期刊最少有多少本？',
      correct: ans,
      distractors: [Math.min(a, b), a + b - 2 * m, Math.max(0, a + b - m - 5), ans + 5],
      method: [
        '多集合交最小值：',
        `min(A∩B) = a+b−m = ${a}+${b}−${m} = ${ans}。`,
        '（等价：让「没借过」尽量不重叠，使共同借过尽量少。）',
      ].join('\n'),
      explanation: `最少共同借过 ${ans} 本。`,
      seq,
      diagramPreset: 'venn-min',
      diagramCaption: `公式：两集合交最小 = ${a}+${b}−${m}。`,
    })
  }
  return null
}

function genHardMinInter3(seq: number): InclusionExclusionQuestion | null {
  // 经典真题 3
  for (let i = 0; i < 30; i++) {
    const m = pickOne([80, 100, 120])
    const a = pickOne([60, 70, 75])
    const b = pickOne([55, 65, 70])
    const c = pickOne([50, 55, 60])
    const ans = a + b + c - 2 * m
    if (ans < 1 || ans > Math.min(a, b, c)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三集合交最小值（经典真题 3）',
      hardTypeId: 'min-inter-3',
      passage: `阅览室有杂志 ${m} 本。小赵借过 ${a} 本，小王借过 ${b} 本，小刘借过 ${c} 本。`,
      stem: '三人都借过的杂志最少有多少本？',
      correct: ans,
      distractors: [a + b + c - m, a + b + c - 3 * m, Math.min(a, b, c), ans + 5, ans + 10],
      method: [
        '三集合交最小值公式：',
        `min(A∩B∩C) = a+b+c−2m = ${a}+${b}+${c}−2×${m} = ${ans}。`,
      ].join('\n'),
      explanation: `最少 ${ans} 本三人共同借过。也可用补集：未借分别 ${m - a}、${m - b}、${m - c}，最多覆盖 ${3 * m - a - b - c}，则最小全交 = m−该值 = ${ans}。`,
      seq,
      diagramPreset: 'venn-min',
      diagramCaption: `锦囊：n 个集合交最小 ≈ 各项之和 − (n−1)×总量。三集合即减 2m。`,
    })
  }
  return null
}

function genHardMinInter4(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 40; i++) {
    const m = pickOne([100, 120, 150])
    const a = pickOne([70, 80, 85])
    const b = pickOne([65, 75, 80])
    const c = pickOne([60, 70, 72])
    const d = pickOne([55, 65, 68])
    const ans = a + b + c + d - 3 * m
    if (ans < 1 || ans > Math.min(a, b, c, d)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '四集合交最小值',
      hardTypeId: 'min-inter-4',
      passage: `题库共 ${m} 题。甲做过 ${a} 题，乙 ${b} 题，丙 ${c} 题，丁 ${d} 题。`,
      stem: '四人都做过的题最少有多少道？',
      correct: ans,
      distractors: [a + b + c + d - 2 * m, a + b + c + d - 4 * m, ans + 5, Math.min(a, b, c, d)],
      method: [
        '四集合交最小值：',
        `min = a+b+c+d−3m = ${a}+${b}+${c}+${d}−3×${m} = ${ans}。`,
      ].join('\n'),
      explanation: `最少 ${ans} 道四人都做过。`,
      seq,
      diagramPreset: 'venn-min',
      diagramCaption: '规律：n 集合交最小 = 各项之和 − (n−1)×总量。',
    })
  }
  return null
}

function genHardComplement3(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 30; i++) {
    const m = pickOne([100, 100, 120])
    const a = pickOne([75, 78, 80])
    const b = pickOne([70, 72, 74])
    const c = pickOne([60, 62, 65])
    const na = m - a
    const nb = m - b
    const nc = m - c
    const maxMiss = na + nb + nc
    if (maxMiss >= m) continue
    const ans = m - maxMiss
    const formula = a + b + c - 2 * m
    if (ans !== formula || ans < 1) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '补集法求三交最小',
      hardTypeId: 'complement-3',
      passage: `共有图书 ${m} 本。甲读过 ${a} 本（未读 ${na}），乙读过 ${b} 本（未读 ${nb}），丙读过 ${c} 本（未读 ${nc}）。`,
      stem: '三人共同读过的书最少有多少本？',
      correct: ans,
      distractors: [maxMiss, na + nb + nc - m, ans + 5, Math.min(a, b, c)],
      method: [
        '补集法（经典真题 3 法一）：',
        `① 未读本数：甲 ${na}、乙 ${nb}、丙 ${nc}。`,
        `② 这些「未读」尽量不重叠，最多盖住 ${na}+${nb}+${nc}=${maxMiss} 本（每本至少一人未读）。`,
        `③ 于是三人全读过的最少 = 总量 − 最多未全读 = ${m}−${maxMiss} = ${ans}。`,
      ].join('\n'),
      explanation: `与公式 a+b+c−2m 一致，答案 ${ans}。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

function genHardMinInter3AskMaxMiss(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 30; i++) {
    const m = pickOne([90, 100, 110])
    const a = pickOne([70, 75, 80])
    const b = pickOne([65, 68, 72])
    const c = pickOne([55, 60, 62])
    const ansMin = a + b + c - 2 * m
    if (ansMin < 1) continue
    const maxMiss = m - ansMin
    return buildQuestion({
      difficulty: 'hard',
      term: '最多「并非三人都有」',
      hardTypeId: 'min-inter-3-ask-max-miss',
      passage: `仓库有零件 ${m} 件。车间甲用过 ${a} 件，乙 ${b} 件，丙 ${c} 件。`,
      stem: '「并非甲乙丙三人都用过」的零件最多有多少件？',
      correct: maxMiss,
      distractors: [ansMin, (m - a) + (m - b) + (m - c), m - Math.min(a, b, c), maxMiss - ansMin],
      method: [
        `① 先求三人都用过的最少：${a}+${b}+${c}−2×${m} = ${ansMin}。`,
        `② 则「并非三人都用过」最多 = ${m}−${ansMin} = ${maxMiss}。`,
      ].join('\n'),
      explanation: `最多 ${maxMiss} 件不是三人都用过。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

function genHardMinInter2Disguise(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 30; i++) {
    const m = pickOne([40, 50, 60])
    const a = pickOne([28, 30, 35])
    const b = pickOne([25, 27, 32])
    const ans = a + b - m
    if (ans < 1 || ans > Math.min(a, b)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '两交最小·问卷变装',
      hardTypeId: 'min-inter-2-disguise',
      passage: `一次调查收回有效问卷 ${m} 份。赞成方案甲的 ${a} 份，赞成方案乙的 ${b} 份。`,
      stem: '两方案都赞成的问卷最少有多少份？',
      correct: ans,
      distractors: [Math.min(a, b), a + b, ans + 3, Math.max(0, a + b - 2 * m)],
      method: `min(A∩B)=a+b−m=${a}+${b}−${m}=${ans}。`,
      explanation: `最少 ${ans} 份两方案都赞成。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

function genHardMinInter3Disguise(seq: number): InclusionExclusionQuestion | null {
  for (let i = 0; i < 30; i++) {
    const m = pickOne([100, 120])
    const a = pickOne([80, 85, 88])
    const b = pickOne([75, 78, 82])
    const c = pickOne([70, 72, 76])
    const ans = a + b + c - 2 * m
    if (ans < 1 || ans > 40) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '三交最小·课程变装',
      hardTypeId: 'min-inter-3-disguise',
      passage: `选修课共 ${m} 门。小李选了 ${a} 门，小张 ${b} 门，小陈 ${c} 门。`,
      stem: '三人共同选修的课程最少有多少门？',
      correct: ans,
      distractors: [a + b + c - m, ans + 5, Math.min(a, b, c) - 20, ans + 10],
      method: `min(A∩B∩C)=${a}+${b}+${c}−2×${m}=${ans}。`,
      explanation: `最少共同选修 ${ans} 门。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

function genHardMinUnionBound(seq: number): InclusionExclusionQuestion | null {
  // 已知 a,b,m，交最小时并集最大 = a+b-min交 = m（当 ans>0）
  // 问：当共同借过最少时，至少一人借过的最多是多少？ → 通常是 m
  for (let i = 0; i < 30; i++) {
    const m = pickOne([50, 60, 70])
    const a = pickOne([35, 40, 45])
    const b = pickOne([30, 35, 38])
    const minBoth = a + b - m
    if (minBoth < 1) continue
    const maxUnion = a + b - minBoth // = m
    return buildQuestion({
      difficulty: 'hard',
      term: '交最小时并集最大',
      hardTypeId: 'min-union-bound',
      passage: `书架上有书 ${m} 本。甲读过 ${a} 本，乙读过 ${b} 本。`,
      stem: '若两人共同读过的书尽可能少，则「至少一人读过」的书最多有多少本？',
      correct: maxUnion,
      distractors: [minBoth, a + b, m - minBoth, a + b - m],
      method: [
        `① 共同读过最少 = ${a}+${b}−${m} = ${minBoth}。`,
        `② 并集 = A+B−交，交最小时并集最大 = ${a}+${b}−${minBoth} = ${maxUnion}。`,
      ].join('\n'),
      explanation: `此时并集达到上限 ${maxUnion}（通常等于总量）。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

function genHardMinInter3Percent(seq: number): InclusionExclusionQuestion | null {
  // m=100, percentages
  const m = 100
  const pa = pickOne([70, 75, 80])
  const pb = pickOne([65, 70, 72])
  const pc = pickOne([55, 60, 65])
  const a = pa
  const b = pb
  const c = pc
  const ans = a + b + c - 2 * m
  if (ans < 1) return null
  return buildQuestion({
    difficulty: 'hard',
    term: '百分数三交最小',
    hardTypeId: 'min-inter-3-percent',
    passage: `共 100 名员工。会用软件甲的占 ${pa}%，会用乙的占 ${pb}%，会用丙的占 ${pc}%。`,
    stem: '三种软件都会用的员工最少有多少人？',
    correct: ans,
    distractors: [pa + pb + pc - 100, ans + 5, Math.min(pa, pb, pc) - 40, 0],
    method: [
      '先把百分数看成人数（总量 100）：',
      `min = ${pa}+${pb}+${pc}−2×100 = ${ans}。`,
    ].join('\n'),
    explanation: `最少 ${ans} 人三种都会。`,
    seq,
    diagramPreset: 'venn-min',
  })
}

function genHardMinCommonTwoOfThree(seq: number): InclusionExclusionQuestion | null {
  // 求 A∩B 的最小值，在总量 m、还有 C 的约束下——简化：仅用两集合公式 a+b-m（忽略 C）作为题面「至少」
  // Better: given a,b,c,m ask min of A∩B (not necessarily all three)
  // min(A∩B) = a+b-m still (C doesn't increase the min of A∩B)
  for (let i = 0; i < 30; i++) {
    const m = pickOne([100, 120])
    const a = pickOne([70, 75, 80])
    const b = pickOne([65, 70, 78])
    const c = pickOne([40, 50, 55]) // red herring
    const ans = a + b - m
    if (ans < 1 || ans > Math.min(a, b)) continue
    return buildQuestion({
      difficulty: 'hard',
      term: '指定两人之交最小',
      hardTypeId: 'min-common-two-of-three',
      passage: `题库 ${m} 题。甲做 ${a} 题，乙 ${b} 题，丙 ${c} 题。`,
      stem: '甲、乙共同做过的题最少有多少道？（不要求丙也做过）',
      correct: ans,
      distractors: [a + b + c - 2 * m, a + b - c, Math.min(a, b), ans + c - 40],
      method: [
        '问的是甲∩乙的最小，与丙无关：',
        `min(甲∩乙)=甲+乙−总量=${a}+${b}−${m}=${ans}。`,
        '（若误用三交公式会算成另一数，那是干扰项。）',
      ].join('\n'),
      explanation: `甲乙共同做过最少 ${ans} 道。`,
      seq,
      diagramPreset: 'venn-min',
    })
  }
  return null
}

const HARD_BUILDERS: Record<
  InclusionExclusionHardTypeId,
  (seq: number) => InclusionExclusionQuestion | null
> = {
  'min-inter-2': genHardMinInter2,
  'min-inter-3': genHardMinInter3,
  'min-inter-4': genHardMinInter4,
  'complement-3': genHardComplement3,
  'min-inter-3-ask-max-miss': genHardMinInter3AskMaxMiss,
  'min-inter-2-disguise': genHardMinInter2Disguise,
  'min-inter-3-disguise': genHardMinInter3Disguise,
  'min-union-bound': genHardMinUnionBound,
  'min-inter-3-percent': genHardMinInter3Percent,
  'min-common-two-of-three': genHardMinCommonTwoOfThree,
}

function tryBuild(
  factory: () => InclusionExclusionQuestion | null,
  maxTry = 40,
): InclusionExclusionQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateInclusionExclusionPaper(
  difficulty: InclusionExclusionDifficulty,
): InclusionExclusionQuestion[] {
  const out: InclusionExclusionQuestion[] = []
  const seen = new Set<string>()
  const push = (q: InclusionExclusionQuestion | null) => {
    if (!q || seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyClassic1,
      genEasyUnionOnly,
      genEasyBothFromUnion,
      genEasyNeither,
      genEasyOnlyOne,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= INCLUSION_EXCLUSION_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < INCLUSION_EXCLUSION_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const factories = [
      genMediumClassic2,
      genMediumThreeUnion,
      genMediumExactlyOne,
      genMediumVerifyFormula,
      genMediumNoneFromThree,
    ]
    for (const f of shuffleInPlace([...factories])) {
      if (out.length >= INCLUSION_EXCLUSION_QUESTION_COUNT) break
      push(tryBuild(() => f(out.length)))
    }
    let guard = 0
    while (out.length < INCLUSION_EXCLUSION_QUESTION_COUNT && guard++ < 50) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else {
    const used = new Set<InclusionExclusionHardTypeId>()
    const types = shuffleInPlace([...INCLUSION_EXCLUSION_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= INCLUSION_EXCLUSION_QUESTION_COUNT) break
      const before = out.length
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 40))
      if (out.length > before) used.add(typeId)
    }
    let guard = 0
    const remain = INCLUSION_EXCLUSION_HARD_EXAM_TYPES.map((x) => x.id).filter((id) => !used.has(id))
    while (out.length < INCLUSION_EXCLUSION_QUESTION_COUNT && guard++ < 50) {
      const pool = remain.length
        ? remain
        : INCLUSION_EXCLUSION_HARD_EXAM_TYPES.map((x) => x.id)
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

  return out.slice(0, INCLUSION_EXCLUSION_QUESTION_COUNT)
}
