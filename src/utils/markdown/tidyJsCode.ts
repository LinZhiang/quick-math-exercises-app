/** 讲义里 JS/TS 围栏：整理缩进/空行，并把 `if (x) return y` 拆成带花括号的结构，避免窄屏被折成错位。 */

const FENCE_LANG = 'javascript|js|typescript|ts|jsx|tsx'
const FENCE_RE = new RegExp('```[ \\t]*(' + FENCE_LANG + ')[ \\t]*\\r?\\n([\\s\\S]*?)```', 'gi')
const FENCE_LANG_RE = /^(javascript|js|typescript|ts|jsx|tsx)\b/i

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

/** 去掉误写进正文的 ```js 语言标记，避免画面上出现「js try {」。 */
export function stripJsLangPrefix(code: string): string {
  let s = String(code ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
  s = s.replace(/^[ \t]*(?:javascript|typescript|jsx|tsx|js|ts)\b[ \t]*\r?\n/, '')
  s = s.replace(/^[ \t]*(?:javascript|typescript|jsx|tsx|js|ts)\b[ \t]+/, '')
  return s
}

/** ``` js / 正文后面直接跟围栏：拆成独立一行，保证能转成代码块。 */
export function normalizeJsMarkdownFences(md: string): string {
  const queue = String(md ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/```[ \t]+(?=(?:javascript|js|typescript|ts|jsx|tsx)\b)/gi, '```')
    .split('\n')
  const out: string[] = []
  let inFence = false

  while (queue.length) {
    const line = queue.shift() ?? ''
    if (!inFence) {
      const idx = line.indexOf('```')
      if (idx < 0) {
        out.push(line)
        continue
      }
      const before = line.slice(0, idx).replace(/[ \t]+$/, '')
      let after = line.slice(idx + 3).replace(/^[ \t]+/, '')
      if (before) out.push(before)
      const langM = FENCE_LANG_RE.exec(after)
      const langRaw = langM?.[0] || ''
      if (langM) after = after.slice(langM[0].length).replace(/^[ \t]+/, '')
      const raw = langRaw.toLowerCase()
      const lang = raw === 'javascript' ? 'js' : raw === 'typescript' ? 'ts' : raw || 'js'
      out.push(`\`\`\`${lang}`)
      inFence = true
      if (!after) continue
      const closeAt = after.indexOf('```')
      if (closeAt < 0) {
        out.push(after)
        continue
      }
      const code = after.slice(0, closeAt).replace(/[ \t]+$/, '')
      if (code) out.push(code)
      out.push('```')
      inFence = false
      const tail = after.slice(closeAt + 3).replace(/^[ \t]+/, '')
      if (tail) queue.unshift(tail)
      continue
    }
    const idx = line.indexOf('```')
    if (idx < 0) {
      out.push(line)
      continue
    }
    const before = line.slice(0, idx).replace(/[ \t]+$/, '')
    const tail = line.slice(idx + 3).replace(/^[ \t]+/, '')
    if (before) out.push(before)
    out.push('```')
    inFence = false
    if (tail) queue.unshift(tail)
  }
  if (inFence) out.push('```')
  return out.join('\n')
}

/** ```js try { 这种开栏与代码写在同一行时，拆成真正的围栏。 */
export function repairSameLineFenceOpeners(md: string): string {
  return String(md ?? '').replace(
    /^([ \t]*)```[ \t]*(javascript|js|typescript|ts|jsx|tsx)[ \t]+(\S[^\n]*)$/gim,
    (_all, indent: string, lang: string, rest: string) => `${indent}\`\`\`${lang}\n${indent}${rest}`,
  )
}

function prettyJsOneLiner(src: string): string {
  const s = src.trim()
  if (!s || s.includes('\n')) return s
  if (!/[{}]/.test(s) && (s.match(/;/g) || []).length < 2) return s
  let out = ''
  let indent = 0
  let i = 0
  let str: string | null = null
  let paren = 0
  let forDepth = 0
  const n = s.length
  const pad = () => '  '.repeat(Math.max(0, indent))
  const nl = () => {
    out += `\n${pad()}`
  }
  while (i < n) {
    const ch = s[i]!
    if (str) {
      out += ch
      if (ch === '\\' && i + 1 < n) {
        out += s[i + 1]
        i += 2
        continue
      }
      if (ch === str) str = null
      i += 1
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      str = ch
      out += ch
      i += 1
      continue
    }
    if (ch === '/' && s[i + 1] === '/') {
      out += s.slice(i)
      break
    }
    if (ch === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2)
      out += s.slice(i, end < 0 ? n : end + 2)
      i = end < 0 ? n : end + 2
      continue
    }
    if (ch === '(') {
      paren += 1
      if (/\bfor\s*$/.test(out)) forDepth = paren
      out += ch
      i += 1
      continue
    }
    if (ch === ')') {
      if (forDepth && paren === forDepth) forDepth = 0
      paren = Math.max(0, paren - 1)
      out += ch
      i += 1
      continue
    }
    if (ch === '{') {
      out = out.replace(/[ \t]+$/, '')
      out += ' {'
      indent += 1
      i += 1
      while (i < n && s[i] === ' ') i += 1
      if (i < n && s[i] !== '}') nl()
      continue
    }
    if (ch === '}') {
      indent = Math.max(0, indent - 1)
      out = out.replace(/[ \t]+$/, '')
      if (!out.endsWith('\n')) out += `\n${pad()}`
      else out = out.replace(/[ \t]*$/, pad())
      out += '}'
      i += 1
      while (i < n && s[i] === ' ') i += 1
      if (i < n && s[i] !== ';' && s[i] !== ')' && s[i] !== ',' && s[i] !== '}') {
        if (/^(else|catch|finally)\b/.test(s.slice(i))) out += ' '
        else nl()
      }
      continue
    }
    if (ch === ';' && !forDepth) {
      out += ';'
      i += 1
      while (i < n && s[i] === ' ') i += 1
      if (i < n && s[i] !== '}' && s[i] !== ')') nl()
      continue
    }
    out += ch
    i += 1
  }
  return out
}

/** 展示前整理代码块：去掉误入的 js 标记，单行程序补上回车。 */
export function prepareJsBlockSource(code: string, opts?: { expand?: boolean }): string {
  const stripped = stripJsLangPrefix(code)
  const expanded = prettyJsOneLiner(stripped)
  return tidyJsFenceBody(expanded, opts)
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
  const repaired = repairFusedMarkdownFences(repairSameLineFenceOpeners(normalizeJsMarkdownFences(md)))
  FENCE_RE.lastIndex = 0
  return repaired.replace(FENCE_RE, (_all, lang: string | undefined, body: string) => {
    const raw = String(lang || 'js').toLowerCase()
    const nextLang = raw === 'javascript' ? 'js' : raw === 'typescript' ? 'ts' : raw
    return `\`\`\`${nextLang}\n${prepareJsBlockSource(body)}\n\`\`\``
  })
}
