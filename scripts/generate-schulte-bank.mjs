/**
 * 生成舒尔特成语/词语题库（恰好 500：成语 250 + 词语 250）
 * 运行：node scripts/generate-schulte-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IDIOMS, WORDS } from './schulte-bank-seeds.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.join(__dirname, '../src/utils/schulteBank.ts')

function assertBank() {
  if (IDIOMS.length !== 250) throw new Error(`成语应为 250，实际 ${IDIOMS.length}`)
  if (WORDS.length !== 250) throw new Error(`词语应为 250，实际 ${WORDS.length}`)
  const seen = new Set()
  const idiomSet = new Set(IDIOMS.map(([w]) => w))
  for (const [w] of IDIOMS) {
    if (!w || /[^\u4e00-\u9fff]/.test(w)) throw new Error(`非法成语: ${w}`)
    if (w.length < 2 || w.length > 8) throw new Error(`成语词长异常: ${w}`)
    if (seen.has(w)) throw new Error(`重复: ${w}`)
    seen.add(w)
  }
  for (const [w] of WORDS) {
    if (!w || /[^\u4e00-\u9fff]/.test(w)) throw new Error(`非法词语: ${w}`)
    if (w.length < 2 || w.length > 8) throw new Error(`词语词长异常: ${w}`)
    if (w.length === 4) throw new Error(`词语 length 不得为 4: ${w}`)
    if (seen.has(w)) throw new Error(`重复: ${w}`)
    seen.add(w)
  }
  for (const w of seen) {
    if (w.length === 4 && !idiomSet.has(w)) {
      throw new Error(`凡 length===4 必须在 IDIOMS: ${w}`)
    }
  }
}

assertBank()

const items = [
  ...IDIOMS.map(([word, meaning], i) => ({
    key: `idiom-${String(i + 1).padStart(3, '0')}`,
    kind: 'idiom',
    word,
    meaning,
  })),
  ...WORDS.map(([word, meaning], i) => ({
    key: `word-${String(i + 1).padStart(3, '0')}`,
    kind: 'word',
    word,
    meaning,
  })),
]

const body = items
  .map(
    (it) =>
      `  { key: ${JSON.stringify(it.key)}, kind: ${JSON.stringify(it.kind)}, word: ${JSON.stringify(it.word)}, meaning: ${JSON.stringify(it.meaning)} },`,
  )
  .join('\n')

const src = `/**
 * 快判·舒尔特本地题库（成语 250 + 词语 250 = 500）
 * 由 scripts/generate-schulte-bank.mjs 生成；勿手改整表，改 scripts/schulte-bank-seeds.mjs 后重跑脚本。
 */
import type { SchulteBankItem } from '@/utils/schulteBankTypes'

export const SCHULTE_BANK: SchulteBankItem[] = [
${body}
]

export const SCHULTE_BANK_COUNT = SCHULTE_BANK.length
`

fs.writeFileSync(outFile, src, 'utf8')
console.log('wrote', outFile, 'items=', items.length, '(idiom 250 + word 250)')
