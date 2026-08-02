/** 生成「这是什么」题库 JSON */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WHAT_IS_THIS_RAW } from './what-is-this-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const TARGET = 300

function parseLines(lines) {
  const seen = new Set()
  const items = []
  for (const line of lines) {
    const parts = String(line).split('|')
    if (parts.length < 2) continue
    const term = parts[0].trim()
    const def = parts[1].trim()
    const tag = (parts[2] || 'misc').trim()
    if (!term || !def) continue
    if (seen.has(term)) continue
    seen.add(term)
    items.push({ term, def, tag })
  }
  return items
}

function pickDistractors(pool, self, n = 5) {
  const sameTag = pool.filter((x) => x.term !== self.term && x.tag === self.tag)
  const others = pool.filter((x) => x.term !== self.term && x.tag !== self.tag)
  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const out = []
  const used = new Set([self.def])
  for (const src of [shuffle(sameTag), shuffle(others)]) {
    for (const x of src) {
      if (used.has(x.def)) continue
      used.add(x.def)
      out.push(x.def)
      if (out.length >= n) return out
    }
  }
  while (out.length < n) out.push(`与「${self.term}」含义不同的其他专业概念`)
  return out
}

function buildDifficulty(diff, lines) {
  const pool = parseLines(lines)
  if (pool.length < TARGET) {
    throw new Error(`${diff} 仅 ${pool.length} 条，需要 ${TARGET} 条`)
  }
  if (pool.length > TARGET) {
    console.warn(`${diff}: 源 ${pool.length} 条，截取前 ${TARGET}`)
  }
  const chosen = pool.slice(0, TARGET)
  return chosen.map((item, i) => ({
    difficulty: diff,
    stem: `什么是${item.term}？`,
    correct: item.def,
    distractors: pickDistractors(chosen, item, 5),
    explanation: `【这是什么·${diff}】「${item.term}」：${item.def}`,
    key: `什么是${item.term}？|${item.def}|${diff}|${item.tag}|i${i}`,
  }))
}

const easy = buildDifficulty('easy', WHAT_IS_THIS_RAW.easy)
const normal = buildDifficulty('normal', WHAT_IS_THIS_RAW.normal)
const hard = buildDifficulty('hard', WHAT_IS_THIS_RAW.hard)
const items = [...easy, ...normal, ...hard]

const payload = {
  generatedAt: new Date().toISOString(),
  easy: easy.length,
  normal: normal.length,
  hard: hard.length,
  total: items.length,
  items,
}

const jsonPath = path.join(root, 'src/utils/whatIsThisBank.generated.json')
const tsPath = path.join(root, 'src/utils/whatIsThisBank.generated.ts')
fs.writeFileSync(jsonPath, JSON.stringify(payload), 'utf8')
fs.writeFileSync(
  tsPath,
  `/** 由 scripts/generate-what-is-this-bank.mjs 生成，请勿手改 */
import type { WhatIsThisBankItem } from '@/utils/whatIsThisBankTypes'
import raw from '@/utils/whatIsThisBank.generated.json'

export type { WhatIsThisBankItem }

export const WHAT_IS_THIS_BANK = raw.items as WhatIsThisBankItem[]

export const WHAT_IS_THIS_BANK_COUNTS = {
  easy: raw.easy,
  normal: raw.normal,
  hard: raw.hard,
  total: raw.total,
} as const
`,
  'utf8',
)

console.log('wrote', payload.easy, payload.normal, payload.hard, 'total', payload.total)
