/**
 * 修辞手法题库硬性校对（含出处/解析结构）
 * node scripts/validate-rhetoric-device-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEVICES, ENTRIES, SENTENCES } from './rhetoric-device-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BANK = path.join(__dirname, '../src/utils/chinese/rhetoricDeviceBank.ts')

const errors = []
const warnings = []

const LIKE_MARK = /(像|似|如同|好比|宛如|犹如|仿佛(?!远处))/

for (const d of DEVICES) {
  const list = ENTRIES[d]
  if (!list || list.length !== 30) errors.push(`${d}: want 30 entries, got ${list?.length}`)
  const seen = new Set()
  for (const e of list || []) {
    if (!e?.text?.trim()) errors.push(`${d}: empty text`)
    if (!e?.source?.trim()) errors.push(`${d}: missing source 「${e?.text}」`)
    if (!e?.analysis?.trim()) errors.push(`${d}: missing analysis 「${e?.text}」`)
    if (e.analysis && e.analysis.length < 18) warnings.push(`${d}: analysis short 「${e.text}」`)
    if (/教学用例|来源取向|求是网风格表述/.test(`${e.source}|${e.analysis}|${e.note || ''}`)) {
      errors.push(`${d}: internal meta in entry 「${e.text}」`)
    }
    const k = String(e.text || '').replace(/\s+/g, '')
    if (seen.has(k)) errors.push(`${d}: duplicate 「${e.text}」`)
    seen.add(k)
  }
}

const byText = new Map()
for (const d of DEVICES) {
  for (const e of ENTRIES[d] || []) {
    const k = e.text.replace(/\s+/g, '')
    if (!byText.has(k)) byText.set(k, [])
    byText.get(k).push(d)
  }
}
for (const [k, ds] of byText) {
  if (ds.length > 1) errors.push(`跨类重复「${k}」→ ${ds.join(',')}`)
}

for (const s of SENTENCES['比拟'] || []) {
  if (LIKE_MARK.test(s) && !/粉蝶如知/.test(s)) {
    errors.push(`比拟疑似比喻（含像/似等）：「${s}」`)
  }
}

const seed = '创新的种子正在破土而出。'
const seedEntry = (ENTRIES['比喻'] || []).find((e) => e.text === seed)
if (!seedEntry) errors.push('比喻缺失：创新的种子正在破土而出。')
else {
  if (!/本体/.test(seedEntry.analysis) || !/喻体/.test(seedEntry.analysis)) {
    errors.push('种子题解析缺少本体/喻体拆解')
  }
  if (!seedEntry.note || !/拟人|比拟/.test(seedEntry.note)) {
    errors.push('种子题缺少「不是拟人」类补充')
  }
  if (seedEntry.label && !/暗喻|比喻/.test(seedEntry.label)) {
    errors.push('种子题 label 异常')
  }
}
if ((ENTRIES['比拟'] || []).some((e) => e.text === seed)) {
  errors.push('比拟误收：创新的种子正在破土而出。')
}

if (fs.existsSync(BANK)) {
  const text = fs.readFileSync(BANK, 'utf8')
  if (text.includes('来源取向') || text.includes('教学用例')) {
    errors.push('rhetoricDeviceBank.ts 仍含内部元数据用语')
  }
  if (!text.includes('出处：')) errors.push('rhetoricDeviceBank.ts 缺少「出处：」')
  if (!text.includes('解析：')) errors.push('rhetoricDeviceBank.ts 缺少「解析：」')
  const idx = text.indexOf(seed)
  if (idx < 0) errors.push('rhetoricDeviceBank.ts 未包含种子句')
  else {
    const after = text.slice(idx, idx + 500)
    if (!/correct:\s*"比喻"/.test(after)) errors.push('种子句 correct 不是比喻')
    if (!after.includes('出处：') || !after.includes('解析：')) {
      errors.push('种子句 explanation 缺少出处/解析')
    }
    if (!after.includes('补充：')) errors.push('种子句 explanation 缺少补充')
  }
}

console.log('warnings:', warnings.length)
for (const w of warnings.slice(0, 20)) console.log('  W', w)
if (errors.length) {
  console.error('FAIL', errors.length)
  for (const e of errors) console.error('  E', e)
  process.exit(1)
}
console.log('PASS rhetoric-device audit', {
  devices: DEVICES.length,
  total: DEVICES.reduce((n, d) => n + ENTRIES[d].length, 0),
})
