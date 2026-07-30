/**
 * 运算技巧 / 识记相关修复自检
 * 运行：npx tsx scripts/verify-math-op-fixes.mts
 */
import { crossYieldCostRatio, ratiosEquivalent, uniqueMcqStrings } from '../src/utils/mathOpMcqHelpers.ts'
import { generateCrossMethodPaper } from '../src/utils/crossMethodPractice.ts'
import { generateRatioMethodPaper } from '../src/utils/ratioMethodPractice.ts'
import { generateSpecValPaper } from '../src/utils/specialValuePractice.ts'
import { generateSubElimPaper } from '../src/utils/subElimPractice.ts'
import { generateRemPropPaper } from '../src/utils/remPropPractice.ts'
import {
  extractPoetDrillAllowlist,
  poetDrillQuestionInMaterial,
} from '../src/utils/poetDrillMaterial.ts'

const errors: string[] = []
function err(msg: string) {
  errors.push(msg)
  console.error('FAIL:', msg)
}
function ok(msg: string) {
  console.log('OK:', msg)
}

// ——— helpers ———
function hasNaN(opts: string[]) {
  return opts.some((o) => o === 'NaN' || /\bNaN\b/i.test(o))
}

function onlyOneSatisfies(
  opts: string[],
  correctIndex: number,
  pred: (n: number) => boolean,
) {
  const hits = opts
    .map((o, i) => ({ o, i, n: Number(o) }))
    .filter((x) => Number.isFinite(x.n) && pred(x.n))
  if (hits.length !== 1) return false
  return hits[0]!.i === correctIndex
}

// 1) 精确交叉：经典 5:3
{
  const ans = crossYieldCostRatio(15, -10, 1350, 24000)
  if (ans !== '5:3') err(`经典股票交叉应为 5:3，实际 ${ans}`)
  else ok('十字交叉精确分数 → 5:3')
}

// 2) uniqueMcqStrings 禁止 NaN、过滤等价比
{
  const u = uniqueMcqStrings('2:3:4', ['4:6:8', 'NaN', '2:3', '1:2:3'])
  if (u.includes('NaN')) err('uniqueMcqStrings 产出 NaN')
  if (u.some((x) => ratiosEquivalent(x, '2:3:4'))) err('未过滤等价比例 4:6:8')
  if (u.length !== 3) err(`uniqueMcqStrings 应凑满 3，实际 ${u.length}`)
  else ok('uniqueMcqStrings 无 NaN、无等价比')
}

// 3) 十字交叉 medium：资金之比必须约分正确；选项无 NaN；无第二等价正解
{
  for (let i = 0; i < 20; i++) {
    const paper = generateCrossMethodPaper('medium')
    if (paper.length !== 5) err(`十字交叉 medium 题量 ${paper.length}`)
    for (const q of paper) {
      if (hasNaN(q.options)) err(`十字交叉出现 NaN: ${q.stem}`)
      if (q.options.length !== 4) err('十字交叉选项数不为 4')
      if (q.stem.includes('资金之比')) {
        const m = q.passage?.match(/用 (\d+) 元.*?上涨 (\d+)%.*?下跌 (\d+)%.*?获利 (\d+)/)
        if (!m) {
          err(`股票题材料解析失败: ${q.passage}`)
          continue
        }
        const total = +m[1]!
        const up = +m[2]!
        const down = +m[3]!
        const profit = +m[4]!
        const expect = crossYieldCostRatio(up, -down, profit, total)
        const got = q.options[q.correctIndex]
        if (!expect || got !== expect) {
          err(`股票交叉答案错误：期望 ${expect} 实际 ${got} | ${q.passage}`)
        }
        // 其它选项不得与 expect 等价
        for (let j = 0; j < q.options.length; j++) {
          if (j === q.correctIndex) continue
          if (ratiosEquivalent(q.options[j]!, expect)) {
            err(`股票题多正解等价: ${q.options[j]} ≈ ${expect}`)
          }
        }
      }
    }
  }
  ok('十字交叉 medium ×20 轮：无 NaN、股票比精确')
}

// 4) 比例法 easy/medium：无 NaN；统一比完整；无等价多解
{
  for (const diff of ['easy', 'medium'] as const) {
    for (let i = 0; i < 15; i++) {
      const paper = generateRatioMethodPaper(diff)
      if (paper.length !== 5) err(`比例法 ${diff} 题量 ${paper.length}`)
      for (const q of paper) {
        if (hasNaN(q.options)) err(`比例法 ${diff} NaN: ${q.options.join('|')}`)
        const ans = q.options[q.correctIndex]!
        for (let j = 0; j < q.options.length; j++) {
          if (j === q.correctIndex) continue
          if (ans.includes(':') && ratiosEquivalent(ans, q.options[j]!)) {
            err(`比例法多正解: ${ans} vs ${q.options[j]} | ${q.stem}`)
          }
        }
        if (q.stem.includes('甲:乙:丙') && (ans.split(':').length !== 3 || q.options.some((o) => o.includes(':') && o.split(':').length === 2 && ratiosEquivalent(ans, `${o.split(':')[0]}:x:${o.split(':')[1]}`)))) {
          // 只要答案是三量比即可
          if (ans.split(':').length !== 3) err(`甲:乙:丙 答案非三量: ${ans}`)
        }
      }
    }
  }
  ok('比例法 easy/medium ×15：无 NaN、无等价多解')
}

// 5) 特值困难：三车题必须复合（题干含丙已走/距乙端/几分之几）；组卷满 8
{
  let three = 0
  for (let i = 0; i < 25; i++) {
    const paper = generateSpecValPaper('hard')
    if (paper.length !== 8) err(`特值困难题量 ${paper.length}`)
    for (const q of paper) {
      if (hasNaN(q.options)) err(`特值 NaN: ${q.stem}`)
      if (q.hardTypeId === 'three-speed-lcm') {
        three++
        if (!/丙/.test(q.stem) || /甲乙多少小时后相遇/.test(q.stem)) {
          err(`三车题仍过简: ${q.stem}`)
        }
      }
    }
  }
  if (three < 5) err(`三车复合题出现过少: ${three}`)
  else ok(`特值困难：三车复合出现 ${three} 次，组卷正常`)
}

// 6) 代入排除困难：dual-pct 唯一正解；CRT 选项仅一解
{
  let dual = 0
  for (let i = 0; i < 20; i++) {
    const paper = generateSubElimPaper('hard')
    if (paper.length !== 5) err(`代入排除困难题量 ${paper.length}`)
    for (const q of paper) {
      if (hasNaN(q.options)) err(`代入排除 NaN`)
      if (q.hardTypeId === 'dual-pct-sub') {
        dual++
        const ans = Number(q.options[q.correctIndex])
        const m = q.passage.match(
          /共 (\d+) 人.*?占甲队 (\d+)%.*?占乙队 (\d+)%.*?的 (\d+) 倍/,
        )
        if (!m) {
          err(`dual 材料不匹配: ${q.passage}`)
          continue
        }
        const S = +m[1]!
        const aPct = +m[2]!
        const bPct = +m[3]!
        const k = +m[4]!
        const pred = (a: number) => {
          const pa = (a * aPct) / 100
          const pb = ((S - a) * bPct) / 100
          return Number.isInteger(pa) && Number.isInteger(pb) && pb > 0 && pa === k * pb
        }
        if (!pred(ans)) err(`dual 正解不满足条件 ans=${ans}`)
        if (!onlyOneSatisfies(q.options, q.correctIndex, pred)) {
          err(`dual 多选项满足: ${q.options.join('|')} passage=${q.passage}`)
        }
      }
      if (q.hardTypeId === 'crt-four-min' || q.hardTypeId === 'crt-three-hard') {
        // 至少：数字选项互异
        if (new Set(q.options).size !== 4) err('CRT 选项重复')
      }
    }
  }
  if (dual < 3) err(`dual-pct 出现过少: ${dual}`)
  else ok(`代入排除 dual-pct 唯一正解 ×${dual}`)
}

// 7) 余数性质 smoke
{
  for (let i = 0; i < 5; i++) {
    const paper = generateRemPropPaper('normal')
    if (paper.length < 5) err(`余数普通题量 ${paper.length}`)
    for (const q of paper) {
      if (hasNaN(q.options)) err('余数 NaN')
    }
  }
  ok('余数性质 normal smoke')
}

// 8) 识记材料封闭校验
{
  const material = `【考查范围】唐朝·盛唐
### 李白
名句：床前明月光，疑是地上霜。
### 杜甫
春望
名句：国破山河在，城春草木深。
`
  const allow = extractPoetDrillAllowlist(material)
  if (!allow.poets.includes('李白') || !allow.poets.includes('杜甫')) {
    err(`allowlist 诗人提取失败: ${allow.poets.join(',')}`)
  }
  const good = {
    questionType: 'verse-to-author',
    term: '静夜思',
    stem: '床前明月光，疑是地上霜。',
    options: ['李白', '杜甫', '王维', '白居易'],
    correctIndex: 0,
  }
  const bad = {
    questionType: 'verse-to-author',
    term: '登幽州台歌',
    stem: '前不见古人，后不见来者。',
    options: ['陈子昂', '李白', '杜甫', '王维'],
    correctIndex: 0,
  }
  if (!poetDrillQuestionInMaterial(good, allow)) err('材料内名句题应通过')
  if (poetDrillQuestionInMaterial(bad, allow)) err('材料外陈子昂题应拒绝')
  else ok('识记材料封闭校验')
}

// 9) 连续重生成：指纹应有变化（不完全撞车）
{
  const fps = new Set<string>()
  for (let i = 0; i < 6; i++) {
    for (const q of generateRatioMethodPaper('easy')) fps.add(q.fingerprint)
  }
  if (fps.size < 8) err(`比例法重生成指纹过少: ${fps.size}`)
  else ok(`比例法 6 轮指纹多样性 ${fps.size}`)
}

console.log('\n========')
if (errors.length) {
  console.error(`FAILED: ${errors.length} issues`)
  process.exitCode = 1
} else {
  console.log('ALL CHECKS PASSED')
}
