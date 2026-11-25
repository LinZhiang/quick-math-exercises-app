/** 题干去掉代码和数字后仍几乎一样，就当成同一题。 */

export function compactQuizStem(stem: string): string {
  return String(stem || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\d+/g, '#')
    .replace(/\s+/g, '')
    .slice(0, 96)
}

function bigrams(s: string): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i < s.length - 1; i += 1) out.add(s.slice(i, i + 2))
  return out
}

export function quizStemsTooClose(a: string, b: string): boolean {
  const x = compactQuizStem(a)
  const y = compactQuizStem(b)
  if (x.length < 8 || y.length < 8) return false
  if (x === y) return true
  const short = x.length < y.length ? x : y
  const long = x.length < y.length ? y : x
  if (short.length >= 18 && long.includes(short)) return true
  const left = bigrams(x)
  const right = bigrams(y)
  let inter = 0
  for (const g of left) if (right.has(g)) inter += 1
  const union = left.size + right.size - inter
  return union > 0 && inter / union >= 0.62
}

export function quizNearKey(stem: string): string {
  return `near:${compactQuizStem(stem)}`
}

export function quizStemTooCloseToSeen(stem: string, seen: Iterable<string>): boolean {
  for (const raw of seen) {
    const s = String(raw || '')
    if (!s.startsWith('near:')) continue
    if (quizStemsTooClose(stem, s.slice(5))) return true
  }
  return false
}
