/**
 * 校验汉字规律题库：数量、stem 格式、属性表 100% 复验
 * node scripts/validate-hanzi-pattern-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  STROKE,
  CROSS,
  ENCLOSE,
  PARTS,
  STRUCT,
  SYM_LR,
  SYM_LR_FORBIDDEN,
  SYM_UD,
  SYM_UD_ONLY,
  CONTAIN,
  FW,
  validateSeed,
  allDefined,
  vals,
  isEqual,
  isInc1,
  isDec1,
} from './generate-hanzi-pattern-bank.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bankPath = path.join(__dirname, '../src/utils/hanziPatternBank.ts')
const raw = fs.readFileSync(bankPath, 'utf8')

const STEM_RE = /^.\u3000.\u3000.\u3000.$/

function parseItems(src) {
  const items = []
  const blocks = src.split(/\{\s*difficulty:/).slice(1)
  for (const b of blocks) {
    const stem = b.match(/stem:\s*`([^`]*)`/)?.[1]
    const correct = b.match(/correct:\s*"([^"]+)"/)?.[1] || b.match(/correct:\s*'([^']+)'/)?.[1]
    const key = b.match(/key:\s*"([^"]+)"/)?.[1] || b.match(/key:\s*'([^']+)'/)?.[1]
    const charsRaw = b.match(/chars:\s*(\[[^\]]+\])/)?.[1]
    let chars = null
    if (charsRaw) {
      try {
        chars = JSON.parse(charsRaw.replace(/'/g, '"'))
      } catch {
        chars = null
      }
    }
    if (stem && correct && key && chars) items.push({ stem, correct, key, chars })
  }
  return items
}

const items = parseItems(raw)
const errors = []

console.log('=== hanzi-pattern validation ===')
console.log('count:', items.length)

if (items.length !== 500) errors.push(`count=${items.length} want 500`)
if (new Set(items.map((x) => x.key)).size !== items.length) errors.push('duplicate keys')
if (new Set(items.map((x) => x.stem)).size !== items.length) errors.push('duplicate stems')

let stemOk = 0
let tableOk = 0
let tableChecked = 0

for (const it of items) {
  if (!STEM_RE.test(it.stem)) {
    errors.push(`stem format FAIL ${it.key}: ${JSON.stringify(it.stem)}`)
  } else stemOk++

  if (it.stem !== it.chars.join(FW)) {
    errors.push(`stem!=chars ${it.key}`)
  }

  const c = it.chars
  const lab = it.correct

  // 属性表 100% 复验（按标签族）
  if (lab.includes('笔画数') && !lab.includes('交叉') && !lab.includes('不相连')) {
    tableChecked++
    if (!allDefined(STROKE, c)) errors.push(`STROKE missing ${it.key}`)
    else if (lab.includes('累加') && !isInc1(vals(STROKE, c))) errors.push(`STROKE add1 ${it.key} ${vals(STROKE, c)}`)
    else if (lab.includes('累减') && !isDec1(vals(STROKE, c))) errors.push(`STROKE sub1 ${it.key} ${vals(STROKE, c)}`)
    else if (!lab.includes('累') && !isEqual(vals(STROKE, c))) errors.push(`STROKE eq ${it.key} ${vals(STROKE, c)}`)
    else tableOk++
  } else if (lab.includes('交叉')) {
    tableChecked++
    if (!allDefined(CROSS, c)) errors.push(`CROSS missing ${it.key}`)
    else if (lab.includes('累加') && !isInc1(vals(CROSS, c))) errors.push(`CROSS add1 ${it.key}`)
    else if (lab.includes('累减') && !isDec1(vals(CROSS, c))) errors.push(`CROSS sub1 ${it.key}`)
    else if (!lab.includes('累') && !isEqual(vals(CROSS, c))) errors.push(`CROSS eq ${it.key}`)
    else tableOk++
  } else if (lab.includes('封闭区域个数')) {
    tableChecked++
    if (!allDefined(ENCLOSE, c)) errors.push(`ENCLOSE missing ${it.key}`)
    else if (lab.includes('累加') && !isInc1(vals(ENCLOSE, c))) errors.push(`ENCLOSE add1 ${it.key}`)
    else if (lab.includes('累减') && !isDec1(vals(ENCLOSE, c))) errors.push(`ENCLOSE sub1 ${it.key}`)
    else if (!lab.includes('累') && !isEqual(vals(ENCLOSE, c))) errors.push(`ENCLOSE eq ${it.key}`)
    else tableOk++
  } else if (lab.includes('不相连')) {
    tableChecked++
    if (!allDefined(PARTS, c)) errors.push(`PARTS missing ${it.key}`)
    else if (lab.includes('累加') && !isInc1(vals(PARTS, c))) errors.push(`PARTS add1 ${it.key}`)
    else if (lab.includes('累减') && !isDec1(vals(PARTS, c))) errors.push(`PARTS sub1 ${it.key}`)
    else if (!lab.includes('累') && !isEqual(vals(PARTS, c))) errors.push(`PARTS eq ${it.key}`)
    else tableOk++
  } else if (STRUCT[lab]) {
    tableChecked++
    if (!c.every((ch) => STRUCT[lab].includes(ch))) errors.push(`STRUCT ${it.key}`)
    else tableOk++
  } else if (lab === '左右对称') {
    tableChecked++
    if (!c.every((ch) => SYM_LR.includes(ch))) errors.push(`SYM_LR ${it.key}`)
    else if (c.some((ch) => SYM_LR_FORBIDDEN.includes(ch))) {
      errors.push(`SYM_LR forbidden char ${it.key} ${c.join('')}`)
    } else tableOk++
  } else if (lab === '上下对称') {
    tableChecked++
    if (!c.every((ch) => SYM_UD.includes(ch))) errors.push(`SYM_UD ${it.key}`)
    else if (!c.some((ch) => SYM_UD_ONLY.includes(ch))) {
      errors.push(`SYM_UD_ONLY missing ${it.key} ${c.join('')}`)
    } else tableOk++
  } else if (lab === '都有封闭区域') {
    tableChecked++
    if (!allDefined(ENCLOSE, c) || !c.every((ch) => ENCLOSE[ch] > 0)) errors.push(`closed ${it.key}`)
    else tableOk++
  } else if (lab === '都是开放区域') {
    tableChecked++
    if (!allDefined(ENCLOSE, c) || !c.every((ch) => ENCLOSE[ch] === 0)) errors.push(`open ${it.key}`)
    else tableOk++
  } else if (lab.startsWith('都包含「')) {
    tableChecked++
    const comp = lab.slice(4, -1)
    const pool = CONTAIN[comp] || []
    if (!c.every((ch) => pool.includes(ch))) errors.push(`CONTAIN ${it.key}`)
    else tableOk++
  }

  // validateSeed（开放区域教学例豁免与封闭相等的互斥）
  if (!(lab === '都是开放区域' && c.every((ch) => ENCLOSE[ch] === 0))) {
    const err = validateSeed(c, lab)
    if (err) errors.push(`validateSeed ${it.key}: ${err}`)
  }
}

const spots = [
  ['三五四伍', '笔画数累加1'],
  ['二十屯连', '笔画交叉数累加1'],
  ['檀香复早', '都包含「日」'],
  ['木日昌晶', '封闭区域个数累加1'],
  ['开勺小心', '笔画不相连部分个数累加1'],
  ['古山大非', '左右对称'],
  ['巨目中臣', '上下对称'],
]
for (const [chars, correct] of spots) {
  const hit = items.find((it) => it.chars.join('') === chars)
  if (!hit) errors.push(`missing spot ${chars}`)
  else if (hit.correct !== correct) errors.push(`spot ${chars} => ${hit.correct}`)
}

console.log('stem format OK:', stemOk, '/', items.length)
console.log('table re-verify OK:', tableOk, '/', tableChecked)
console.log('吸 strokes (expect 6):', STROKE['吸'])
console.log('CROSS anchors 才/干/丰/井:', CROSS['才'], CROSS['干'], CROSS['丰'], CROSS['井'])
console.log('ENCLOSE anchors 日/且/四/目:', ENCLOSE['日'], ENCLOSE['且'], ENCLOSE['四'], ENCLOSE['目'])
console.log('SYM_LR has 小/八?', SYM_LR.includes('小'), SYM_LR.includes('八'))
if (CROSS['才'] !== 1 || CROSS['干'] !== 2) errors.push('CROSS anchor 才/干 failed')
if (SYM_LR.includes('小') || SYM_LR.includes('八')) errors.push('SYM_LR still contains 小/八')
if (items.some((it) => it.correct === '左右对称' && it.chars.some((ch) => ch === '小' || ch === '八'))) {
  errors.push('bank 左右对称仍含小/八')
}

// xuci / jushi quick counts
function countExport(file, name) {
  const t = fs.readFileSync(path.join(__dirname, '../src/utils', file), 'utf8')
  const ks = [...t.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1])
  console.log(`${name}: ${ks.length} (unique ${new Set(ks).size})`)
}
console.log('=== other banks ===')
countExport('wenyanXuciBank.ts', 'wenyan-xuci')
countExport('wenyanJushiBank.ts', 'wenyan-jushi')

if (errors.length) {
  console.error('=== FAIL details (first 40) ===')
  console.error(errors.slice(0, 40).join('\n'))
  console.log('FAIL')
  process.exit(1)
}

console.log('PASS')
process.exit(0)
