/**
 * 校验汉字规律题库：数量、key 唯一、chars 长度、按 correct 关键词计数
 * node scripts/validate-hanzi-pattern-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bankPath = path.join(__dirname, '../src/utils/hanziPatternBank.ts')
const raw = fs.readFileSync(bankPath, 'utf8')

// 粗解析：抽取 key / correct / chars
const keys = [...raw.matchAll(/key:\s*(?:'|")([^'"]+)(?:'|")/g)].map((m) => m[1])
const allCorrects = [...raw.matchAll(/correct:\s*(?:'|")([^'"]+)(?:'|")/g)].map((m) => m[1])
const charBlocks = [...raw.matchAll(/chars:\s*(\[[^\]]+\])/g)].map((m) => {
  try {
    return JSON.parse(m[1].replace(/'/g, '"'))
  } catch {
    return null
  }
})

console.log('=== hanzi-pattern validation ===')
console.log('count (by key):', keys.length)
console.log('unique keys:', new Set(keys).size)
console.log('duplicate keys:', keys.length - new Set(keys).size)
console.log('chars blocks:', charBlocks.length)
const badChars = charBlocks.filter((c) => !c || c.length !== 4 || c.some((x) => typeof x !== 'string' || x.length !== 1))
console.log('chars length !== 4:', badChars.length)

const keywordCounts = {}
for (const c of allCorrects) {
  let bucket = c
  if (c.startsWith('都包含')) bucket = '都包含某成分'
  else if (c.includes('笔画数')) bucket = c.includes('累加') ? '笔画数累加1' : c.includes('累减') ? '笔画数累减1' : '笔画数相等'
  else if (c.includes('交叉')) bucket = c.includes('累加') ? '笔画交叉数累加1' : c.includes('累减') ? '笔画交叉数累减1' : '笔画交叉数相等'
  else if (c.includes('封闭区域个数'))
    bucket = c.includes('累加') ? '封闭区域个数累加1' : c.includes('累减') ? '封闭区域个数累减1' : '封闭区域个数相等'
  else if (c.includes('不相连'))
    bucket = c.includes('累加')
      ? '笔画不相连部分个数累加1'
      : c.includes('累减')
        ? '笔画不相连部分个数累减1'
        : '笔画不相连部分个数相等'
  keywordCounts[bucket] = (keywordCounts[bucket] || 0) + 1
}
console.log('counts by pattern keyword:')
for (const [k, v] of Object.entries(keywordCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`)
}

// xuci / jushi quick counts
function countExport(file, name) {
  const t = fs.readFileSync(path.join(__dirname, '../src/utils', file), 'utf8')
  const ks = [...t.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1])
  const ks2 = ks.length ? ks : [...t.matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1])
  console.log(`${name}: ${ks2.length} (unique ${new Set(ks2).size})`)
}
console.log('=== other banks ===')
countExport('wenyanXuciBank.ts', 'wenyan-xuci')
countExport('wenyanJushiBank.ts', 'wenyan-jushi')

const ok =
  keys.length === 500 &&
  new Set(keys).size === 500 &&
  badChars.length === 0 &&
  charBlocks.length === 500
console.log(ok ? 'PASS' : 'FAIL')
process.exit(ok ? 0 : 1)
