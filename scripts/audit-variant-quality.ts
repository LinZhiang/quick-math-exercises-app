/**
 * 自检：截图类坏题是否被 typoMcqQualityFailure / coerceVocab 拦住
 * 运行：node --experimental-strip-types --no-warnings scripts/audit-variant-quality.ts
 * （本文件内联精简逻辑，避免 @ 路径别名）
 */

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

function cjkEditDistance(a: string, b: string): number {
  const x = a.replace(/\s+/g, '')
  const y = b.replace(/\s+/g, '')
  if (x === y) return 0
  const n = x.length
  const m = y.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i]![0] = i
  for (let j = 0; j <= m; j++) dp[0]![j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
    }
  }
  return dp[n]![m]!
}

function isNear(canonical: string, candidate: string): boolean {
  const aa = normalize(canonical).replace(/[（(][^）)]*[）)]/g, '')
  const bb = normalize(candidate).replace(/[（(][^）)]*[）)]/g, '')
  if (!aa || !bb || aa === bb) return false
  if (Math.abs(aa.length - bb.length) > 1) return false
  const dist = cjkEditDistance(aa, bb)
  return dist >= 1 && dist <= 2
}

function optionsNearPair(options: string[]): boolean {
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (isNear(options[i]!, options[j]!)) return true
    }
  }
  return false
}

function polarity(stem: string): 'has-typo' | 'no-typo' | 'unknown' {
  const s = stem.replace(/\s+/g, '')
  if (/没有错别字|无错别字/.test(s)) return 'no-typo'
  if (/有错别字|错别字的一项|错别字的是/.test(s)) return 'has-typo'
  return 'unknown'
}

function typoFail(input: {
  stem: string
  term: string
  correct: string
  distractors: string[]
}): string | null {
  const term = normalize(input.term)
  const correct = normalize(input.correct)
  const distractors = input.distractors.map(normalize)
  const options = [correct, ...distractors]
  if (new Set(options).size !== 4) return 'dup options'
  if (optionsNearPair(options)) return 'near pair in options'
  const p = polarity(input.stem)
  const exact = options.filter((o) => o === term).length
  if (p === 'no-typo') {
    if (correct !== term) return 'no-typo correct!=term'
    if (exact !== 1) return 'term count'
    if (distractors.some((o) => isNear(term, o))) return 'distractor near term'
  } else if (p === 'has-typo') {
    if (correct === term) return 'has-typo correct==term'
    if (!isNear(term, correct)) return 'correct not near'
    if (exact !== 0) return 'term must not appear'
    if (distractors.some((o) => isNear(term, o))) return 'distractor near term'
  }
  return null
}

const cases: { name: string; expectReject: boolean; data: Parameters<typeof typoFail>[0] }[] = [
  {
    name: '黄粱美梦标成有错别字答案',
    expectReject: true,
    data: {
      stem: '下列词语有错别字的是？',
      term: '黄粱美梦',
      correct: '黄粱美梦',
      distractors: ['黄粮美梦', '黄梁美梦', '黄凉美梦'],
    },
  },
  {
    name: '唉声叹气多错写并存',
    expectReject: true,
    data: {
      stem: '下列词语中有错别字的一项是？',
      term: '唉声叹气',
      correct: '哀声叹气',
      distractors: ['唉声叹气', '爱声叹气', '埃声叹气'],
    },
  },
  {
    name: '合盘脱出多错写',
    expectReject: true,
    data: {
      stem: '下列词语有错别字的是？',
      term: '和盘托出',
      correct: '合盘脱出',
      distractors: ['和盘托出', '合盘托出', '和盘脱出'],
    },
  },
  {
    name: '截图坏题：变本加利与变本加厉同列',
    expectReject: true,
    data: {
      stem: '下列词语有错别字的是？',
      term: '变本加厉',
      correct: '变本加利',
      distractors: ['百折不挠', '顶天立地', '变本加厉'],
    },
  },
  {
    name: '旧规则合法题（含规范写法）现应拒绝',
    expectReject: true,
    data: {
      stem: '下列词语有错别字的是？',
      term: '和盘托出',
      correct: '合盘托出',
      distractors: ['和盘托出', '淋漓尽致', '司空见惯'],
    },
  },
  {
    name: '合法有错别字题（四词互异）',
    expectReject: false,
    data: {
      stem: '下列词语有错别字的是？',
      term: '变本加厉',
      correct: '变本加利',
      distractors: ['百折不挠', '顶天立地', '再接再厉'],
    },
  },
  {
    name: '合法没有错别字题（四词互异）',
    expectReject: false,
    data: {
      stem: '下列词语没有错别字的是？',
      term: '和盘托出',
      correct: '和盘托出',
      distractors: ['世外桃园', '再接再励', '墨守陈规'],
    },
  },
]

let fail = 0
for (const c of cases) {
  const r = typoFail(c.data)
  const rejected = r != null
  const ok = rejected === c.expectReject
  console.log(ok ? 'OK' : 'FAIL', c.name, r ?? 'pass')
  if (!ok) fail++
}
process.exit(fail ? 1 : 0)
