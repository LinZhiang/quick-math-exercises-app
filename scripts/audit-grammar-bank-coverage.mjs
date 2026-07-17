/**
 * 审计语法题库字符覆盖率
 * 运行：node --experimental-strip-types --no-warnings scripts/audit-grammar-bank-coverage.mjs
 */
import { GRAMMAR_JUDGMENT_BANK } from '../src/utils/grammarJudgmentBank.ts'

const SKIP = new Set(
  '，。！？、；： \t,.!?;:()（）【】《》…—""\'\'“”‘’'.split(''),
)

function coverage(sentence, parts) {
  const raw = sentence
  const covered = new Array(raw.length).fill(false)
  const missing = []
  for (const p of parts) {
    const t = String(p.text || '').trim()
    if (!t) continue
    let idx = raw.indexOf(t)
    let placed = false
    while (idx >= 0) {
      let overlap = false
      for (let i = idx; i < idx + t.length; i++) {
        if (covered[i]) {
          overlap = true
          break
        }
      }
      if (!overlap) {
        for (let i = idx; i < idx + t.length; i++) covered[i] = true
        placed = true
        break
      }
      idx = raw.indexOf(t, idx + 1)
    }
    if (!placed) missing.push(t)
  }
  let content = 0
  let hit = 0
  const uncovered = []
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (SKIP.has(ch)) continue
    content += 1
    if (covered[i]) hit += 1
    else uncovered.push(ch)
  }
  return {
    ratio: content ? hit / content : 1,
    uncovered: uncovered.join(''),
    missing,
  }
}

const MIN = 0.92
for (const diff of ['easy', 'normal', 'hard']) {
  const rows = GRAMMAR_JUDGMENT_BANK.filter((s) => s.difficulty === diff).map((s) => ({
    id: s.id,
    ...coverage(s.sentence, s.parts),
  }))
  const bad = rows.filter((r) => r.ratio < MIN || r.missing.length)
  const avg = rows.reduce((a, r) => a + r.ratio, 0) / rows.length
  console.log(`\n=== ${diff}: ${rows.length} 句, avg=${avg.toFixed(2)}, bad(<${MIN})=${bad.length} ===`)
  for (const r of bad) {
    console.log(
      `${r.id}\tratio=${r.ratio.toFixed(2)}\tuncovered=「${r.uncovered}」\tmissing=${JSON.stringify(r.missing)}`,
    )
  }
}
