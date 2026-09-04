/** 讲义里 JS/TS 围栏：整理缩进/空行，并把 `if (x) return y` 拆成带花括号的结构，避免窄屏被折成错位。 */

const FENCE_RE = /```(javascript|js|typescript|ts|jsx|tsx)[ \t]*\r?\n([\s\S]*?)```/gi

function matchParen(s: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < s.length; i += 1) {
    const ch = s[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch
      i += 1
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\') i += 1
        i += 1
      }
      continue
    }
    if (ch === '(') depth += 1
    else if (ch === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function expandOneLineIf(line: string): string | null {
  const m = /^([ \t]*)(else\s+if|if)\s*\(/.exec(line)
  if (!m) return null
  const indent = m[1] ?? ''
  const kw = (m[2] ?? 'if').replace(/\s+/g, ' ')
  const open = m[0].lastIndexOf('(')
  const close = matchParen(line, open)
  if (close < 0) return null
  const after = line.slice(close + 1).trim()
  if (!after || after.startsWith('{') || after.startsWith('//')) return null
  if (!/^(return|throw)\b/.test(after)) return null
  const stmt = `${after.replace(/;?\s*$/, '')};`
  const cond = line.slice(open, close + 1)
  return `${indent}${kw} ${cond} {\n${indent}  ${stmt}\n${indent}}`
}

function nextNonEmptyLine(lines: string[], from: number): string {
  for (let j = from; j < lines.length; j += 1) {
    const t = lines[j]?.trim() ?? ''
    if (t) return t
  }
  return ''
}

function looksLikeCodeLine(line: string): boolean {
  const t = String(line || '').trim()
  if (!t) return true
  if (/^```/.test(t)) return false
  if (/^#{1,6}\s/.test(t)) return false
  if (/^[\u4e00-\u9fff]/.test(t)) return false
  if (/[\u4e00-\u9fff]/.test(t) && !/[{};=<>]|function\b|const\b|let\b|var\b|=>/.test(t)) return false
  return true
}

/** 围栏内再遇到 ```lang 时先闭合，避免结束符被写成 ```js 把后文粘进代码块。 */
export function repairFusedMarkdownFences(md: string): string {
  const lines = String(md ?? '').replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inFence = false
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    const open = /^```([\w+-]*)[ \t]*$/.exec(line.trim())
    if (!open) {
      out.push(line)
      continue
    }
    const lang = open[1] || ''
    if (!inFence) {
      inFence = true
      out.push(lang ? `\`\`\`${lang}` : '```')
      continue
    }
    out.push('```')
    inFence = false
    if (!lang) continue
    const next = nextNonEmptyLine(lines, i + 1)
    if (/^```/.test(next) || !looksLikeCodeLine(next)) continue
    out.push('')
    out.push(`\`\`\`${lang}`)
    inFence = true
  }
  if (inFence) out.push('```')
  return out.join('\n')
}

/** 整理一个代码块正文。 */
export function tidyJsFenceBody(code: string, opts?: { expand?: boolean }): string {
  const expand = opts?.expand !== false
  let s = String(code ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
  if (expand) {
    s = s
      .split('\n')
      .map((line) => expandOneLineIf(line) || line)
      .join('\n')
  }
  s = s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
  return s
}

/** 整理 Markdown 里的 js/ts 围栏。 */
export function tidyJsFencesInMarkdown(md: string): string {
  const repaired = repairFusedMarkdownFences(md)
  FENCE_RE.lastIndex = 0
  return repaired.replace(FENCE_RE, (_all, lang: string | undefined, body: string) => {
    const raw = String(lang || 'js').toLowerCase()
    const nextLang = raw === 'javascript' ? 'js' : raw === 'typescript' ? 'ts' : raw
    return `\`\`\`${nextLang}\n${tidyJsFenceBody(body)}\n\`\`\``
  })
}
