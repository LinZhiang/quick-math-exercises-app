/**
 * 生成修辞手法题库：每种手法 30 题，共 300 题
 * node scripts/generate-rhetoric-device-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEVICES, ENTRIES } from './rhetoric-device-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../src/utils/chinese/rhetoricDeviceBank.ts')

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickDistractors(correct, salt) {
  const others = DEVICES.filter((d) => d !== correct)
  const ordered = [...others].sort((a, b) => hash(`${salt}|${a}`) - hash(`${salt}|${b}`))
  return ordered.slice(0, 5)
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

/** 对标豆包：修辞 + 出处 + 解析 +（可选）补充 */
function buildExplanation(device, entry) {
  const lines = [
    `修辞：${entry.label || device}`,
    `出处：${entry.source}`,
    `解析：${entry.analysis}`,
  ]
  if (entry.note && String(entry.note).trim()) {
    lines.push(`补充：${String(entry.note).trim()}`)
  }
  return lines.join('\n')
}

const stems = new Set()
const items = []

for (const device of DEVICES) {
  const list = ENTRIES[device]
  if (!list) throw new Error(`missing ENTRIES.${device}`)
  list.forEach((entry, i) => {
    const sentence = entry.text
    if (!sentence || !entry.source || !entry.analysis) {
      throw new Error(`${device}#${i + 1} missing text/source/analysis`)
    }
    if (/教学用例|来源取向/.test(`${entry.source}\n${entry.analysis}\n${entry.note || ''}`)) {
      throw new Error(`${device}#${i + 1} contains internal meta wording`)
    }
    const stem = `下列句子主要运用的修辞手法是？\n${sentence}`
    const norm = stem.replace(/\s+/g, '')
    if (stems.has(norm)) throw new Error(`duplicate stem: ${device}#${i + 1} ${sentence}`)
    stems.add(norm)
    const key = `rhetoric-device:${device}-${String(i + 1).padStart(2, '0')}`
    const distractors = pickDistractors(device, key)
    items.push({
      stem,
      correct: device,
      distractors,
      explanation: buildExplanation(device, entry),
      key,
    })
  })
}

if (items.length !== 300) throw new Error(`want 300, got ${items.length}`)

const body = items
  .map(
    (it) => `  {
    difficulty: 'normal',
    stem: \`${esc(it.stem)}\`,
    correct: ${JSON.stringify(it.correct)},
    distractors: ${JSON.stringify(it.distractors)},
    explanation: \`${esc(it.explanation)}\`,
    key: ${JSON.stringify(it.key)},
  }`,
  )
  .join(',\n')

fs.writeFileSync(
  OUT,
  `/**
 * 快判·修辞手法本地题库（普通难度，恰好 300 题：10 种×30）
 * 由 scripts/generate-rhetoric-device-bank.mjs 生成；原料见 rhetoric-device-data.mjs。
 */
import type { RhetoricDeviceBankItem } from '@/utils/chinese/rhetoricDeviceBankTypes'

export const RHETORIC_DEVICE_BANK: RhetoricDeviceBankItem[] = [
${body},
]
`,
  'utf8',
)

const counts = Object.fromEntries(DEVICES.map((d) => [d, items.filter((x) => x.correct === d).length]))
console.log('wrote', OUT, 'items=', items.length, counts)
