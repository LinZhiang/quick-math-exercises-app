const { errors, counts } = validate(items)
console.log('=== distribution ===')
console.log(counts)
console.log('=== rejected (sample) ===')
console.log(`total rejected: ${REJECTED.length}`)
console.log(REJECTED.slice(0, 40).join('\n'))
if (REJECTED.length > 40) console.log(`... +${REJECTED.length - 40} more`)

if (errors.length) {
  console.error('=== VALIDATION ERRORS ===')
  console.error(errors.slice(0, 50).join('\n'))
  throw new Error(`validation failed: ${errors.length} errors`)
}
console.log('=== validation OK ===')

const body = items
  .map((it) => {
    const chars = JSON.stringify(it.chars)
    const dist = JSON.stringify(it.distractors)
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
    return `  {
    difficulty: 'normal',
    stem: \`${esc(it.stem)}\`,
    correct: ${JSON.stringify(it.correct)},
    distractors: ${dist},
    explanation: \`${esc(it.explanation)}\`,
    key: ${JSON.stringify(it.key)},
    chars: ${chars},
  }`
  })
  .join(',\n')

const file = `/**
 * 快判·汉字规律本地题库（普通难度，恰好 500 题）
 * 由 scripts/generate-hanzi-pattern-bank.mjs 生成；勿手改整表，改种子后重跑脚本。
 * stem 仅为四字（全角空格分隔）。
 */
import type { HanziPatternBankItem } from '@/utils/hanziPatternBankTypes'

export const HANZI_PATTERN_BANK: HanziPatternBankItem[] = [
${body},
]
`

fs.writeFileSync(OUT, file, 'utf8')
console.log('wrote', OUT, 'items=', items.length)
