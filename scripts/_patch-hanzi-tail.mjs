import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const main = path.join(__dirname, 'generate-hanzi-pattern-bank.mjs')
const tail = path.join(__dirname, '_hanzi_bank_tail.mjs')
let t = fs.readFileSync(main, 'utf8')
const marker = "const { errors, counts, spot } = validate(items)"
const i = t.lastIndexOf(marker)
if (i < 0) throw new Error('marker not found')
t = t.slice(0, i) + fs.readFileSync(tail, 'utf8')
fs.writeFileSync(main, t, 'utf8')
console.log('patched, new length', t.length)
