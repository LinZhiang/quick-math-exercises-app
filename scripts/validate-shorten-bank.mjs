/**
 * Validate src/utils/shortenSentenceBank.ts without TypeScript compilation.
 * Usage: node scripts/validate-shorten-bank.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const bankPath = join(__dirname, '../src/utils/shortenSentenceBank.ts')
const text = readFileSync(bankPath, 'utf8')

const errors = []

/** Read next single-quoted string from source starting at i; returns [value, nextIndex] */
function readQuoted(source, i) {
  if (source[i] !== "'") return null
  let value = ''
  i += 1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\' && source[i + 1] === "'") {
      value += "'"
      i += 2
      continue
    }
    if (ch === "'") return [value, i + 1]
    value += ch
    i += 1
  }
  return null
}

/** Skip whitespace and commas */
function skipSep(source, i) {
  while (i < source.length && /[\s,]/.test(source[i])) i += 1
  return i
}

/** Extract items from S('e..') / S('h..') calls (supports multiline) */
function parseBankItems(source) {
  const items = []
  const headRe = /S\s*\(\s*'(e\d{2}|h\d{2})'/g
  let head
  while ((head = headRe.exec(source)) !== null) {
    const id = head[1]
    let i = head.index + head[0].length
    i = skipSep(source, i)

    const diffR = readQuoted(source, i)
    if (!diffR) continue
    const [difficulty, afterDiff] = diffR
    if (difficulty !== 'easy' && difficulty !== 'hard') continue
    i = skipSep(source, afterDiff)

    const sentR = readQuoted(source, i)
    if (!sentR) continue
    const [sentence, afterSent] = sentR
    i = skipSep(source, afterSent)

    const shortR = readQuoted(source, i)
    if (!shortR) continue
    const [shortened, afterShort] = shortR
    i = skipSep(source, afterShort)

    const srcR = readQuoted(source, i)
    if (!srcR) continue
    const [src, afterSrc] = srcR
    i = skipSep(source, afterSrc)

    let alternates
    if (source[i] === '[') {
      alternates = []
      i += 1
      while (i < source.length && source[i] !== ']') {
        i = skipSep(source, i)
        const altR = readQuoted(source, i)
        if (!altR) break
        alternates.push(altR[0])
        i = skipSep(source, altR[1])
      }
    }

    items.push({ id, difficulty, sentence, shortened, source: src, alternates })
  }
  return items
}

const items = parseBankItems(text)

if (items.length === 0) {
  errors.push('No S(...) items parsed from bank file')
}

const easy = items.filter((i) => i.difficulty === 'easy')
const hard = items.filter((i) => i.difficulty === 'hard')

if (easy.length !== 75) {
  errors.push(`Expected 75 easy items, got ${easy.length}`)
}
if (hard.length !== 75) {
  errors.push(`Expected 75 hard items, got ${hard.length}`)
}

const ids = new Set()
const sentences = new Set()

for (const item of items) {
  const { id, sentence, shortened, alternates } = item

  if (!id) errors.push('Item missing id')
  if (ids.has(id)) errors.push(`Duplicate id: ${id}`)
  ids.add(id)

  if (!sentence || !sentence.trim()) errors.push(`${id}: empty sentence`)
  if (!shortened || !shortened.trim()) errors.push(`${id}: empty shortened`)

  if (sentences.has(sentence)) errors.push(`${id}: duplicate sentence "${sentence}"`)
  sentences.add(sentence)

  if (shortened && sentence && shortened.length >= sentence.length) {
    errors.push(
      `${id}: shortened length (${shortened.length}) must be < sentence length (${sentence.length})`,
    )
  }

  const strip = (s) =>
    s.replace(/[，。、；：！？\s"'“”‘’《》【】（）()\[\]{}·…—\-～~、]/g, '')
  const isSubseq = (shortText, longText) => {
    const a = strip(shortText)
    const b = strip(longText)
    let j = 0
    for (let i = 0; i < b.length && j < a.length; i++) {
      if (b[i] === a[j]) j += 1
    }
    return j === a.length
  }
  if (shortened && sentence && !isSubseq(shortened, sentence)) {
    errors.push(`${id}: shortened is not a character subsequence of sentence`)
  }

  if (alternates) {
    for (const alt of alternates) {
      if (!alt || !alt.trim()) errors.push(`${id}: empty alternate`)
      if (alt === shortened) errors.push(`${id}: alternate equals shortened: "${alt}"`)
      if (alt.length >= sentence.length) {
        errors.push(`${id}: alternate not shorter than sentence`)
      }
      if (!isSubseq(alt, sentence)) {
        errors.push(`${id}: alternate is not a character subsequence of sentence: ${alt}`)
      }
    }
  }
}

// ID format checks
for (const item of easy) {
  if (!/^e\d{2}$/.test(item.id) || parseInt(item.id.slice(1), 10) < 1 || parseInt(item.id.slice(1), 10) > 75) {
    errors.push(`${item.id}: easy id should be e01–e75`)
  }
}
for (const item of hard) {
  if (!/^h\d{2}$/.test(item.id) || parseInt(item.id.slice(1), 10) < 1 || parseInt(item.id.slice(1), 10) > 75) {
    errors.push(`${item.id}: hard id should be h01–h75`)
  }
}

if (errors.length === 0) {
  console.log('ALL VALID')
  console.log(`  easy: ${easy.length}, hard: ${hard.length}, total: ${items.length}`)
} else {
  console.log(`ERRORS (${errors.length}):`)
  for (const e of errors) {
    console.log(`  - ${e}`)
  }
  process.exit(1)
}
