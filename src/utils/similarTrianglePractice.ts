/**
 * 高频运算 · 三角形相似
 * 本地程序出题（不调用 AI）。每轮 5 题四选一。
 *
 * 考察点对齐教材：对应角相等、对应边成比例、面积比=相似比²；
 * A 型（平行截线）、X 型（沙漏）、中位线；测高（经典真题 4）。
 *
 * 【简单】比经典真题 4 简单：直接给相似比/平行求边、中位线、面积比
 * 【中等】对齐经典真题 4：竹竿测树高（AN+MN 后再比例）
 * 【困难】比真题 4 更难，≥6 种变式；每轮抽 5 种且互不重复
 * 1. measure-ask-dist：测高结构，反求距离
 * 2. measure-eye-height：眼睛离地有高度
 * 3. a-shape-area：A 型求面积比/未知面积
 * 4. x-shape-chain：X 型多段比例
 * 5. midline-plus：中位线 + 额外条件
 * 6. double-parallel：两道平行线（三层相似）
 * 7. shadow-mirror：影长/镜面测高
 * 8. raised-base：树基抬高或人站坡上
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type SimilarTriangleDifficulty = 'easy' | 'medium' | 'hard'

export const SIMILAR_TRIANGLE_QUESTION_COUNT = 5

export const SIMILAR_TRIANGLE_MODES: {
  id: SimilarTriangleDifficulty
  label: string
  desc: string
}[] = [
  {
    id: 'easy',
    label: '三角形相似 · 简单',
    desc: '每轮 5 题 · A/X 型与中位线直接比例 · 正计时停表看答案',
  },
  {
    id: 'medium',
    label: '三角形相似 · 普通',
    desc: '每轮 5 题 · 对齐经典真题 4（竹竿测树高）· 正计时停表看答案',
  },
  {
    id: 'hard',
    label: '三角形相似 · 困难',
    desc: '每轮 5 题 · 比经典真题 4 更难的 8 类变式（每题题型不同）· 正计时停表看答案',
  },
]

export const SIMILAR_TRIANGLE_HARD_EXAM_TYPES = [
  {
    id: 'measure-ask-dist',
    name: '测高反求距离',
    note: '已知树高反求人到竿或竿到树的距离',
  },
  {
    id: 'measure-eye-height',
    name: '眼睛离地测高',
    note: '视线高度不在地面，需先减眼高再相似',
  },
  {
    id: 'a-shape-area',
    name: 'A 型面积比',
    note: '平行截线，面积比等于相似比平方',
  },
  {
    id: 'x-shape-chain',
    name: 'X 型多段比例',
    note: '沙漏型给出多段，求未知边',
  },
  {
    id: 'midline-plus',
    name: '中位线加强',
    note: '中位线 + 周长/面积再求一量',
  },
  {
    id: 'double-parallel',
    name: '两道平行线',
    note: '大三角形内两道平行于底边的截线',
  },
  {
    id: 'shadow-mirror',
    name: '影长或镜面测高',
    note: '杆影/人影或平面镜反射测高',
  },
  {
    id: 'raised-base',
    name: '基座抬高测高',
    note: '树在台基上或观察点抬高',
  },
] as const

export type SimilarTriangleHardTypeId = (typeof SIMILAR_TRIANGLE_HARD_EXAM_TYPES)[number]['id']

export type SimilarTriangleQuestion = {
  id: string
  topic: 'similar-triangle'
  difficulty: SimilarTriangleDifficulty
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  hardTypeId?: SimilarTriangleHardTypeId
}

export function similarTriangleTopicLabel(): string {
  return '三角形相似'
}

export function similarTriangleDifficultyLabel(d: SimilarTriangleDifficulty): string {
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
  while (out.length < need && g++ < 40) {
    const n = Number(correct)
    const fake = Number.isFinite(n) ? String(Math.round(n) + g + 1) : `${g}:${g + 1}`
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

function approx1(x: number): number {
  return Math.round(x * 10) / 10
}

function buildQuestion(input: {
  difficulty: SimilarTriangleDifficulty
  term: string
  stem: string
  correct: string
  distractors: string[]
  explanation: string
  method: string
  passage?: string
  hardTypeId?: SimilarTriangleHardTypeId
  seq: number
}): SimilarTriangleQuestion | null {
  const assembled = assembleFourChoiceMcq(
    input.correct.trim(),
    input.distractors.map((d) => d.trim()).filter(Boolean).slice(0, 3),
    shuffleInPlace,
  )
  if (!assembled) return null
  const fingerprint = [
    'similar-triangle',
    input.difficulty,
    input.hardTypeId ?? '',
    input.stem,
    input.passage ?? '',
    [...assembled.options].sort().join('|'),
    String(assembled.correctIndex),
  ].join('\u001e')
  return {
    id: `similar-triangle-${input.difficulty}-${input.seq}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topic: 'similar-triangle',
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

function genEasyRatioSide(seq: number): SimilarTriangleQuestion | null {
  const mNum = pickOne([2, 3, 4])
  const mDen = 1
  const small = pickOne([3, 4, 5, 6, 8])
  const large = small * mNum
  const ask = pickOne(['large', 'small', 'ratio'] as const)
  if (ask === 'ratio') {
    const ans = `${mNum}:1`
    return buildQuestion({
      difficulty: 'easy',
      term: '相似比求边',
      passage: `△ABC ∼ △A'B'C'，对应边 AB=${large}，A'B'=${small}。`,
      stem: '相似比（大:小）是？',
      correct: ans,
      distractors: uniqueStr(ans, ['1:2', `${mNum}:${mNum}`, '1:1', `${small}:${large}`]),
      method: '相似比 = 对应边之比。',
      explanation: `相似比 = ${large}:${small} = ${ans}。`,
      seq,
    })
  }
  if (ask === 'large') {
    return buildQuestion({
      difficulty: 'easy',
      term: '由相似比求大边',
      passage: `两三角形相似，相似比为 ${mNum}:${mDen}。较小三角形一边为 ${small}。`,
      stem: '对应的较大边长是？',
      correct: String(large),
      distractors: uniqueNum(large, [small, large + mNum, small * mNum + 1, large / 2]),
      method: '对应边成比例：大边 = 小边 × 相似比。',
      explanation: `${small}×${mNum}=${large}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '由相似比求小边',
    passage: `两三角形相似，相似比为 ${mNum}:1。较大三角形一边为 ${large}。`,
    stem: '对应的较小边长是？',
    correct: String(small),
    distractors: uniqueNum(small, [large, small + 1, large - small, small * 2]),
    method: '小边 = 大边 / 相似比。',
    explanation: `${large}/${mNum}=${small}。`,
    seq,
  })
}

function genEasyAShape(seq: number): SimilarTriangleQuestion | null {
  const ad = pickOne([2, 3, 4])
  const ab = ad * pickOne([2, 3])
  const de = pickOne([4, 5, 6])
  const bc = (de * ab) / ad
  if (!Number.isInteger(bc)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: 'A 型平行求边',
    passage: `△ABC 中，D、E 分别在 AB、AC 上，DE // BC。已知 AD=${ad}，AB=${ab}，DE=${de}。`,
    stem: 'BC 长是？',
    correct: String(bc),
    distractors: uniqueNum(bc, [de, ab, de * 2, bc + 2]),
    method: 'DE // BC ⇒ △ADE ∼ △ABC，AD/AB = DE/BC。',
    explanation: `${ad}/${ab}=${de}/BC ⇒ BC=${bc}。`,
    seq,
  })
}

function genEasyXShape(seq: number): SimilarTriangleQuestion | null {
  const ae = pickOne([2, 3, 4])
  const ec = ae * pickOne([2, 3])
  const ab = pickOne([4, 5, 6])
  const cd = (ab * ec) / ae
  if (!Number.isInteger(cd)) return null
  return buildQuestion({
    difficulty: 'easy',
    term: 'X 型沙漏求边',
    passage: `AB // CD，AC 与 BD 交于 E。已知 AE=${ae}，EC=${ec}，AB=${ab}。`,
    stem: 'CD 长是？',
    correct: String(cd),
    distractors: uniqueNum(cd, [ab, ae + ec, cd + 2, ab * 2]),
    method: 'AB // CD ⇒ △AEB ∼ △CED（或对应标记），AE/EC = AB/CD。',
    explanation: `${ae}/${ec}=${ab}/CD ⇒ CD=${cd}。`,
    seq,
  })
}

function genEasyMidline(seq: number): SimilarTriangleQuestion | null {
  const bc = pickOne([8, 10, 12, 14, 16])
  const de = bc / 2
  const ask = pickOne(['de', 'bc', 'area'] as const)
  if (ask === 'de') {
    return buildQuestion({
      difficulty: 'easy',
      term: '中位线求中段',
      passage: `△ABC 中，D、E 分别是 AB、AC 的中点，BC=${bc}。`,
      stem: '中位线 DE 长是？',
      correct: String(de),
      distractors: uniqueNum(de, [bc, bc / 4, de + 1, bc - de]),
      method: '三角形中位线平行于第三边且等于其一半。',
      explanation: `DE=BC/2=${de}。`,
      seq,
    })
  }
  if (ask === 'bc') {
    return buildQuestion({
      difficulty: 'easy',
      term: '中位线求底边',
      passage: `△ABC 中，DE 是中位线（D、E 为 AB、AC 中点），DE=${de}。`,
      stem: 'BC 长是？',
      correct: String(bc),
      distractors: uniqueNum(bc, [de, bc + 2, de * 3, bc / 2]),
      method: 'BC = 2·DE。',
      explanation: `BC=2×${de}=${bc}。`,
      seq,
    })
  }
  return buildQuestion({
    difficulty: 'easy',
    term: '中位线面积比',
    passage: `△ABC 中，DE 为中位线（连结两边中点）。`,
    stem: 'S△ADE : S△ABC 等于？',
    correct: '1:4',
    distractors: uniqueStr('1:4', ['1:2', '1:3', '2:3', '1:8']),
    method: '中位线相似比为 1:2，面积比 = 相似比² = 1:4。',
    explanation: 'm=1/2，面积比 m²=1/4，即 1:4。',
    seq,
  })
}

function genEasyArea(seq: number): SimilarTriangleQuestion | null {
  const m = pickOne([2, 3, 4])
  const ask = pickOne(['area', 'm'] as const)
  if (ask === 'area') {
    const ans = `${m * m}:1`
    return buildQuestion({
      difficulty: 'easy',
      term: '相似比求面积比',
      passage: `两三角形相似，相似比为 ${m}:1。`,
      stem: '面积之比（大:小）是？',
      correct: ans,
      distractors: uniqueStr(ans, [`${m}:1`, '1:1', `${m * m}:${m}`, `${2 * m}:1`]),
      method: '面积比 = 相似比的平方。',
      explanation: `面积比 = ${m}²:1² = ${ans}。`,
      seq,
    })
  }
  const areaBig = m * m * pickOne([2, 3])
  const areaSmall = areaBig / (m * m)
  return buildQuestion({
    difficulty: 'easy',
    term: '面积比求相似比',
    passage: `两三角形相似，面积分别为 ${areaBig} 与 ${areaSmall}。`,
    stem: '相似比（大:小）是？',
    correct: `${m}:1`,
    distractors: uniqueStr(`${m}:1`, [`${m * m}:1`, '2:1', `${areaBig}:${areaSmall}`]),
    method: '相似比 = √(面积比)。',
    explanation: `√(${areaBig}/${areaSmall})=${m}，相似比 ${m}:1。`,
    seq,
  })
}

// ——— 中等：经典真题 4 ———

function genMediumMeasureTree(seq: number): SimilarTriangleQuestion | null {
  const banks = [
    { bn: 1.5, an: 1.6, mn: 15 },
    { bn: 1.2, an: 1.5, mn: 12 },
    { bn: 1.8, an: 2, mn: 16 },
    { bn: 1.5, an: 2, mn: 18 },
    { bn: 2, an: 2.5, mn: 20 },
    { bn: 1.6, an: 1.6, mn: 14.4 },
  ]
  const b = pickOne(banks)
  const am = b.an + b.mn
  const cm = approx1((b.bn * am) / b.an)
  const correct = Number.isInteger(cm) ? String(cm) : cm.toFixed(1)
  return buildQuestion({
    difficulty: 'medium',
    term: '竹竿测树高（经典真题 4）',
    passage: `小明站在 A 处测树高。在自己与树之间竖直插一竹竿 BN（B 为竿顶，N 为竿底），使眼睛 A、竿顶 B、树顶 C 三点共线。已知竹竿高 BN=${b.bn} 米，竿到树基 MN=${b.mn} 米，人到竿的水平距离 AN=${b.an} 米（A、N、M 共线于地面）。`,
    stem: '树高 CM 大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1((b.bn * b.mn) / b.an)),
      String(approx1(b.bn + b.mn)),
      String(approx1((b.bn * am) / b.mn)),
      '15.6',
      '14.5',
      '16.0',
    ]),
    method: 'BN // CM ⇒ △ABN ∼ △ACM，AN/AM = BN/CM，其中 AM=AN+MN。',
    explanation: `AM=${b.an}+${b.mn}=${am}；CM=${b.bn}×${am}/${b.an}≈${correct}。`,
    seq,
  })
}

function genMediumShadow(seq: number): SimilarTriangleQuestion | null {
  const pole = pickOne([1.5, 2, 2.5])
  const poleShadow = pickOne([2, 2.5, 3])
  const treeShadow = pickOne([12, 15, 18, 20])
  const tree = approx1((pole * treeShadow) / poleShadow)
  const correct = Number.isInteger(tree) ? String(tree) : tree.toFixed(1)
  return buildQuestion({
    difficulty: 'medium',
    term: '影长测高',
    passage: `同一时刻，高 ${pole} 米的竹竿影长 ${poleShadow} 米，某树影长 ${treeShadow} 米。`,
    stem: '树高大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1(pole + treeShadow)),
      String(approx1((pole * poleShadow) / treeShadow)),
      String(treeShadow),
      String(approx1(tree + 1)),
    ]),
    method: '阳光平行 ⇒ 竿与树的直角三角形相似，高/影成比例。',
    explanation: `树高/${treeShadow}=${pole}/${poleShadow} ⇒ 树高≈${correct}。`,
    seq,
  })
}

function genMediumAShapeSum(seq: number): SimilarTriangleQuestion | null {
  const ad = pickOne([3, 4, 5])
  const db = pickOne([6, 8, 9])
  const ab = ad + db
  const de = pickOne([4, 5, 6])
  const bc = approx1((de * ab) / ad)
  if (Math.abs(bc - Math.round(bc)) > 0.05 && Math.abs(bc * 10 - Math.round(bc * 10)) > 0.01) {
    // keep one decimal ok
  }
  const correct = Number.isInteger(bc) ? String(bc) : bc.toFixed(1)
  return buildQuestion({
    difficulty: 'medium',
    term: 'A 型分段求底',
    passage: `△ABC 中 DE // BC，D 在 AB 上。AD=${ad}，DB=${db}，DE=${de}。`,
    stem: 'BC 长是？',
    correct,
    distractors: uniqueStr(correct, [
      String(de * 2),
      String(ad + de),
      String(approx1((de * db) / ad)),
      String(ab),
    ]),
    method: '先求 AB=AD+DB，再用 AD/AB=DE/BC。',
    explanation: `AB=${ab}；BC=${de}×${ab}/${ad}≈${correct}。`,
    seq,
  })
}

function genMediumXFind(seq: number): SimilarTriangleQuestion | null {
  const ae = pickOne([3, 4, 5])
  const ec = pickOne([6, 8, 9])
  const be = pickOne([4, 5, 6])
  const ed = approx1((be * ec) / ae)
  const correct = Number.isInteger(ed) ? String(ed) : ed.toFixed(1)
  return buildQuestion({
    difficulty: 'medium',
    term: 'X 型求对应段',
    passage: `AB // CD，对角线交于 E。AE=${ae}，EC=${ec}，BE=${be}。`,
    stem: 'ED 长大约是？',
    correct,
    distractors: uniqueStr(correct, [
      String(be),
      String(ae + ec),
      String(approx1((be * ae) / ec)),
      String(approx1(ed + 1)),
    ]),
    method: '相似对应边成比例：AE/EC = BE/ED。',
    explanation: `${ae}/${ec}=${be}/ED ⇒ ED≈${correct}。`,
    seq,
  })
}

// ——— 困难 ———

function genHardAskDist(seq: number): SimilarTriangleQuestion | null {
  const bn = pickOne([1.5, 1.8, 2])
  const cm = pickOne([12, 15, 16, 18])
  const an = pickOne([1.5, 1.6, 2])
  const am = (cm * an) / bn
  const mn = approx1(am - an)
  if (mn <= 0) return null
  const correct = Number.isInteger(mn) ? String(mn) : mn.toFixed(1)
  return buildQuestion({
    difficulty: 'hard',
    term: '测高反求距离',
    hardTypeId: 'measure-ask-dist',
    passage: `用竹竿测树：BN=${bn} 米，树高 CM=${cm} 米，人到竿 AN=${an} 米，BN // CM，A、B、C 共线。`,
    stem: '竿到树的距离 MN 大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1(am)),
      String(an),
      String(approx1((bn * an) / cm)),
      String(approx1(mn + 2)),
    ]),
    method: 'AN/AM=BN/CM ⇒ AM=AN·CM/BN，再 MN=AM−AN。',
    explanation: `AM=${an}×${cm}/${bn}=${approx1(am)}；MN≈${correct}。`,
    seq,
  })
}

function genHardEyeHeight(seq: number): SimilarTriangleQuestion | null {
  const eye = pickOne([1.5, 1.6, 1.7])
  const bn = pickOne([2, 2.5, 3])
  const an = pickOne([2, 2.5, 3])
  const mn = pickOne([10, 12, 15])
  // 眼高以上的竿高与树高成比例
  const poleAbove = bn - eye
  if (poleAbove <= 0) return null
  const am = an + mn
  const treeAbove = (poleAbove * am) / an
  const cm = approx1(treeAbove + eye)
  const correct = Number.isInteger(cm) ? String(cm) : cm.toFixed(1)
  return buildQuestion({
    difficulty: 'hard',
    term: '眼睛离地测高',
    hardTypeId: 'measure-eye-height',
    passage: `测树高：眼睛离地 ${eye} 米，眼前竖直竹竿高 ${bn} 米，人到竿 ${an} 米，竿到树 ${mn} 米。眼睛、竿顶、树顶共线。`,
    stem: '树高大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1((bn * am) / an)),
      String(approx1(treeAbove)),
      String(approx1(bn + mn)),
      String(approx1(cm - 1)),
    ]),
    method: '先减去眼高：有效竿高/有效树高 = AN/AM，再加回眼高。',
    explanation: `有效竿高=${poleAbove}；有效树高=${poleAbove}×${am}/${an}≈${approx1(treeAbove)}；树高≈${correct}。`,
    seq,
  })
}

function genHardAArea(seq: number): SimilarTriangleQuestion | null {
  const ad = pickOne([2, 3, 4])
  const ab = ad * pickOne([2, 3])
  const sBig = pickOne([36, 48, 54, 72])
  const m = ad / ab
  const sSmall = approx1(sBig * m * m)
  const ask = pickOne(['small', 'ring'] as const)
  if (ask === 'small') {
    const correct = Number.isInteger(sSmall) ? String(sSmall) : sSmall.toFixed(1)
    return buildQuestion({
      difficulty: 'hard',
      term: 'A 型面积比',
      hardTypeId: 'a-shape-area',
      passage: `△ABC 中 DE // BC，AD=${ad}，AB=${ab}，S△ABC=${sBig}。`,
      stem: 'S△ADE 大约是？',
      correct,
      distractors: uniqueStr(correct, [
        String(approx1(sBig * m)),
        String(sBig / 2),
        String(approx1(sSmall + 2)),
        String(sBig),
      ]),
      method: '相似比 m=AD/AB，面积比 m²。',
      explanation: `m=${ad}/${ab}；S△ADE=${sBig}×(${ad}/${ab})²≈${correct}。`,
      seq,
    })
  }
  const ring = approx1(sBig - sSmall)
  const correct = Number.isInteger(ring) ? String(ring) : ring.toFixed(1)
  return buildQuestion({
    difficulty: 'hard',
    term: 'A 型梯形面积',
    hardTypeId: 'a-shape-area',
    passage: `△ABC 中 DE // BC，AD=${ad}，AB=${ab}，S△ABC=${sBig}。`,
    stem: '四边形 DECB 的面积大约是？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1(sSmall)),
      String(sBig / 2),
      String(approx1(ring + 3)),
      String(sBig),
    ]),
    method: '大面积减去小相似三角形面积。',
    explanation: `S△ADE≈${sSmall}；梯形≈${sBig}−${sSmall}≈${correct}。`,
    seq,
  })
}

function genHardXChain(seq: number): SimilarTriangleQuestion | null {
  const ae = pickOne([2, 3])
  const ec = pickOne([4, 6])
  const ab = pickOne([5, 6, 8])
  const be = pickOne([3, 4])
  const cd = (ab * ec) / ae
  const ed = (be * ec) / ae
  if (!Number.isInteger(cd) || !Number.isInteger(ed)) return null
  const ask = pickOne(['cd', 'ed', 'sum'] as const)
  if (ask === 'cd') {
    return buildQuestion({
      difficulty: 'hard',
      term: 'X 型多段比例',
      hardTypeId: 'x-shape-chain',
      passage: `AB // CD，交点 E。AE=${ae}，EC=${ec}，AB=${ab}，BE=${be}。`,
      stem: 'CD 长是？',
      correct: String(cd),
      distractors: uniqueNum(cd, [ab, ed, ae + ec, cd + 1]),
      method: 'AE/EC=AB/CD。',
      explanation: `${ae}/${ec}=${ab}/CD ⇒ CD=${cd}。`,
      seq,
    })
  }
  if (ask === 'ed') {
    return buildQuestion({
      difficulty: 'hard',
      term: 'X 型求 ED',
      hardTypeId: 'x-shape-chain',
      passage: `AB // CD，交点 E。AE=${ae}，EC=${ec}，BE=${be}。`,
      stem: 'ED 长是？',
      correct: String(ed),
      distractors: uniqueNum(ed, [be, ae, ed + 2, be + ec]),
      method: 'AE/EC=BE/ED。',
      explanation: `${ae}/${ec}=${be}/ED ⇒ ED=${ed}。`,
      seq,
    })
  }
  const ans = cd + ed
  return buildQuestion({
    difficulty: 'hard',
    term: 'X 型求两段和',
    hardTypeId: 'x-shape-chain',
    passage: `AB // CD，交点 E。AE=${ae}，EC=${ec}，AB=${ab}，BE=${be}。`,
    stem: 'CD+ED 等于？',
    correct: String(ans),
    distractors: uniqueNum(ans, [cd, ed, ab + be, ans + 2]),
    method: '分别用比例求 CD、ED 再相加。',
    explanation: `CD=${cd}，ED=${ed}，和=${ans}。`,
    seq,
  })
}

function genHardMidlinePlus(seq: number): SimilarTriangleQuestion | null {
  const bc = pickOne([10, 12, 14, 16])
  const de = bc / 2
  const peri = pickOne([30, 36, 40, 42])
  // AB+AC = peri - BC，且中位线三角形周长 = DE + (AB+AC)/2 = de + (peri-bc)/2
  const abAc = peri - bc
  if (abAc <= 0) return null
  const smallPeri = approx1(de + abAc / 2)
  const ask = pickOne(['smallPeri', 'area'] as const)
  if (ask === 'smallPeri') {
    const correct = Number.isInteger(smallPeri) ? String(smallPeri) : smallPeri.toFixed(1)
    return buildQuestion({
      difficulty: 'hard',
      term: '中位线加强',
      hardTypeId: 'midline-plus',
      passage: `△ABC 周长 ${peri}，BC=${bc}，DE 为中位线。`,
      stem: '△ADE 的周长大约是？',
      correct,
      distractors: uniqueStr(correct, [
        String(peri / 2),
        String(de),
        String(approx1(peri - bc)),
        String(approx1(smallPeri + 2)),
      ]),
      method: 'DE=BC/2；AD+AE=(AB+AC)/2；周长=DE+(AB+AC)/2。',
      explanation: `AB+AC=${abAc}；△ADE 周长=${de}+${abAc}/2≈${correct}。`,
      seq,
    })
  }
  const sBig = pickOne([48, 60, 72])
  const sSmall = sBig / 4
  return buildQuestion({
    difficulty: 'hard',
    term: '中位线求大面积',
    hardTypeId: 'midline-plus',
    passage: `DE 为 △ABC 中位线，S△ADE=${sSmall}。`,
    stem: 'S△ABC 是？',
    correct: String(sBig),
    distractors: uniqueNum(sBig, [sSmall * 2, sSmall * 3, sBig + 4, sSmall]),
    method: '中位线相似比 1:2，面积比 1:4。',
    explanation: `S△ABC=4×${sSmall}=${sBig}。`,
    seq,
  })
}

function genHardDoubleParallel(seq: number): SimilarTriangleQuestion | null {
  // 顶点到第一截线 : 到第二 : 到全底 = 1:2:3
  const k1 = 1
  const k2 = 2
  const k3 = 3
  const de = pickOne([4, 5, 6]) // 第一道
  const fg = (de * k2) / k1
  const bc = (de * k3) / k1
  const ask = pickOne(['fg', 'bc', 'area'] as const)
  if (ask === 'fg') {
    return buildQuestion({
      difficulty: 'hard',
      term: '两道平行线',
      hardTypeId: 'double-parallel',
      passage: `△ABC 中，DE // FG // BC（D、F 在 AB，E、G 在 AC）。AD:AF:AB=${k1}:${k2}:${k3}，DE=${de}。`,
      stem: 'FG 长是？',
      correct: String(fg),
      distractors: uniqueNum(fg, [de, bc, de * 2, fg + 1]),
      method: '平行截线 ⇒ 各小三角形与大三角形相似，对应边比=到顶点距离比。',
      explanation: `FG/DE=${k2}/${k1} ⇒ FG=${fg}。`,
      seq,
    })
  }
  if (ask === 'bc') {
    return buildQuestion({
      difficulty: 'hard',
      term: '两道平行求底',
      hardTypeId: 'double-parallel',
      passage: `△ABC 中 DE // FG // BC，AD:AF:AB=1:2:3，DE=${de}。`,
      stem: 'BC 长是？',
      correct: String(bc),
      distractors: uniqueNum(bc, [fg, de * 2, bc + 2, de]),
      method: 'BC/DE=3/1。',
      explanation: `BC=${de}×3=${bc}。`,
      seq,
    })
  }
  const s1 = pickOne([4, 9, 16])
  const s3 = s1 * 9
  return buildQuestion({
    difficulty: 'hard',
    term: '两道平行面积',
    hardTypeId: 'double-parallel',
    passage: `△ABC 中两道平行于 BC 的截线，把顶点到各截线的距离比做成 1:2:3。最内侧小三角形面积为 ${s1}。`,
    stem: '大三角形面积是？',
    correct: String(s3),
    distractors: uniqueNum(s3, [s1 * 3, s1 * 4, s1 * 6, s3 + s1]),
    method: '相似比 1:3，面积比 1:9。',
    explanation: `S大=${s1}×9=${s3}。`,
    seq,
  })
}

function genHardShadowMirror(seq: number): SimilarTriangleQuestion | null {
  const ask = pickOne(['shadow', 'mirror'] as const)
  if (ask === 'shadow') {
    const h1 = pickOne([1.6, 1.7, 1.8])
    const s1 = pickOne([0.8, 1, 1.2])
    const s2 = pickOne([8, 9, 10, 12])
    const h2 = approx1((h1 * s2) / s1)
    const correct = Number.isInteger(h2) ? String(h2) : h2.toFixed(1)
    return buildQuestion({
      difficulty: 'hard',
      term: '影长或镜面测高',
      hardTypeId: 'shadow-mirror',
      passage: `身高 ${h1} 米的人影长 ${s1} 米时，旗杆影长 ${s2} 米。`,
      stem: '旗杆高大约多少米？',
      correct,
      distractors: uniqueStr(correct, [
        String(approx1(h1 * s2)),
        String(s2),
        String(approx1(h2 / 2)),
        String(approx1(h2 + 1)),
      ]),
      method: '同一时刻影三角形相似，高与影成比例。',
      explanation: `旗杆/${s2}=${h1}/${s1} ⇒ 约 ${correct} 米。`,
      seq,
    })
  }
  // 平面镜：眼到镜 = 镜到塔底水平距 时，塔高/眼高 = ?
  // 经典：镜距人 a，镜距塔 b，眼高 h，塔高 H = h * (a+b)/a 若镜面反射角相等成相似
  const h = pickOne([1.5, 1.6])
  const a = pickOne([1, 1.2, 1.5])
  const b = pickOne([8, 10, 12])
  const H = approx1((h * b) / a)
  const correct = Number.isInteger(H) ? String(H) : H.toFixed(1)
  return buildQuestion({
    difficulty: 'hard',
    term: '镜面反射测高',
    hardTypeId: 'shadow-mirror',
    passage: `在平地上放一块镜子，人眼高 ${h} 米，眼到镜面水平距离 ${a} 米，镜面到塔基 ${b} 米。调节位置使人眼经镜面看见塔尖（入射角=反射角）。`,
    stem: '塔高大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(approx1((h * (a + b)) / a)),
      String(approx1(h + b)),
      String(approx1(H + 1)),
      String(b),
    ]),
    method: '反射角相等 ⇒ 眼高三角形与塔高三角形相似：眼高/人到镜 = 塔高/镜到塔。',
    explanation: `塔高/${b}=${h}/${a} ⇒ 塔高≈${correct}。`,
    seq,
  })
}

function genHardRaisedBase(seq: number): SimilarTriangleQuestion | null {
  const platform = pickOne([1, 1.5, 2])
  const bn = pickOne([1.5, 2])
  const an = pickOne([2, 2.5])
  const mn = pickOne([10, 12, 15])
  const am = an + mn
  // 树在高 platform 的台基上：CM 为台以上树干；相似仍对竖直杆
  const cmAbove = approx1((bn * am) / an)
  const total = approx1(cmAbove + platform)
  const correct = Number.isInteger(total) ? String(total) : total.toFixed(1)
  return buildQuestion({
    difficulty: 'hard',
    term: '基座抬高测高',
    hardTypeId: 'raised-base',
    passage: `树栽在高 ${platform} 米的台基上。用高 ${bn} 米竹竿测台基以上的树干：人到竿 ${an} 米，竿到台基边缘（树所在） ${mn} 米，眼睛、竿顶、树顶共线（均相对水平地面，竹竿与树干竖直）。`,
    stem: '树顶距地面大约多少米？',
    correct,
    distractors: uniqueStr(correct, [
      String(cmAbove),
      String(approx1(cmAbove - platform)),
      String(approx1(bn + platform)),
      String(approx1(total + 1)),
    ]),
    method: '先按相似求出台基以上树干，再加上台基高度。',
    explanation: `台以上≈${bn}×${am}/${an}≈${cmAbove}；总高≈${cmAbove}+${platform}≈${correct}。`,
    seq,
  })
}

const HARD_BUILDERS: Record<
  SimilarTriangleHardTypeId,
  (seq: number) => SimilarTriangleQuestion | null
> = {
  'measure-ask-dist': genHardAskDist,
  'measure-eye-height': genHardEyeHeight,
  'a-shape-area': genHardAArea,
  'x-shape-chain': genHardXChain,
  'midline-plus': genHardMidlinePlus,
  'double-parallel': genHardDoubleParallel,
  'shadow-mirror': genHardShadowMirror,
  'raised-base': genHardRaisedBase,
}

function tryBuild(
  factory: () => SimilarTriangleQuestion | null,
  maxTry = 40,
): SimilarTriangleQuestion | null {
  for (let i = 0; i < maxTry; i++) {
    const q = factory()
    if (q) return q
  }
  return null
}

export function generateSimilarTrianglePaper(
  difficulty: SimilarTriangleDifficulty,
): SimilarTriangleQuestion[] {
  const out: SimilarTriangleQuestion[] = []
  const seen = new Set<string>()

  const push = (q: SimilarTriangleQuestion | null) => {
    if (!q) return
    if (seen.has(q.fingerprint)) return
    seen.add(q.fingerprint)
    out.push(q)
  }

  if (difficulty === 'easy') {
    const factories = [
      genEasyRatioSide,
      genEasyAShape,
      genEasyXShape,
      genEasyMidline,
      genEasyArea,
    ]
    let guard = 0
    while (out.length < SIMILAR_TRIANGLE_QUESTION_COUNT && guard++ < 80) {
      push(tryBuild(() => pickOne(factories)(out.length)))
    }
  } else if (difficulty === 'medium') {
    const plan = [
      () => genMediumMeasureTree(0),
      () => genMediumShadow(1),
      () => genMediumAShapeSum(2),
      () => genMediumXFind(3),
      () => genMediumMeasureTree(4),
    ]
    for (const f of plan) push(tryBuild(f))
    let guard = 0
    while (out.length < SIMILAR_TRIANGLE_QUESTION_COUNT && guard++ < 50) {
      push(
        tryBuild(() =>
          pickOne([genMediumMeasureTree, genMediumShadow, genMediumAShapeSum, genMediumXFind])(
            out.length,
          ),
        ),
      )
    }
  } else {
    const types = shuffleInPlace([...SIMILAR_TRIANGLE_HARD_EXAM_TYPES.map((x) => x.id)])
    for (const typeId of types) {
      if (out.length >= SIMILAR_TRIANGLE_QUESTION_COUNT) break
      push(tryBuild(() => HARD_BUILDERS[typeId](out.length), 20))
    }
    if (out.length < SIMILAR_TRIANGLE_QUESTION_COUNT) {
      const used = new Set(out.map((q) => q.hardTypeId))
      for (const typeId of types) {
        if (out.length >= SIMILAR_TRIANGLE_QUESTION_COUNT) break
        if (used.has(typeId)) continue
        const q = tryBuild(() => HARD_BUILDERS[typeId](out.length), 30)
        if (q) {
          push(q)
          used.add(typeId)
        }
      }
    }
  }

  if (out.length < SIMILAR_TRIANGLE_QUESTION_COUNT) {
    throw new Error(`三角形相似组卷不足：仅 ${out.length}/${SIMILAR_TRIANGLE_QUESTION_COUNT}`)
  }
  return out.slice(0, SIMILAR_TRIANGLE_QUESTION_COUNT)
}
