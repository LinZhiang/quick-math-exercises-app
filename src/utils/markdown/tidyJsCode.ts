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
  return stripOuterMarkdownTicks(s)
}

/** 去掉误包在整段代码外的 markdown 反引号，避免画面上出现「`function」。 */
export function stripOuterMarkdownTicks(code: string): string {
  let s = String(code ?? '').replace(/\r\n/g, '\n').trim()
  const wrapped = /^`([\s\S]+)`$/.exec(s)
  if (wrapped && !/\$\{/.test(wrapped[1] ?? '')) {
    const inner = wrapped[1] ?? ''
    if (
      inner.includes('\n') ||
      /^\s*(?:function|class|const|let|var|if|for|while|switch|return|console)\b/.test(inner)
    ) {
      return inner
    }
  }
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

/** 运算符后被拆开的同一句，拼回一行。对象属性逗号后的换行要保留。 */
function lineCommentIndex(line: string): number {
  let str: string | null = null
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!
    if (str) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === str) str = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      str = ch
      continue
    }
    if (ch === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2)
      if (end < 0) return -1
      i = end + 1
      continue
    }
    if (ch === '/' && line[i + 1] === '/') {
      if (line[i - 1] === ':') continue
      return i
    }
  }
  return -1
}

function codeBeforeLineComment(line: string): string {
  const idx = lineCommentIndex(line)
  return (idx >= 0 ? line.slice(0, idx) : line).trimEnd()
}

function joinContinuedJsLines(code: string): string {
  const lines = String(code ?? '').replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i] ?? ''
    while (i + 1 < lines.length) {
      const nextRaw = lines[i + 1] ?? ''
      const next = nextRaw.trim()
      if (!next) break
      const cur = line.trimEnd()
      const curCode = codeBeforeLineComment(cur)
      if (!curCode.trim()) break
      if (lineCommentIndex(next) === 0) break
      if (/[;{}]$/.test(curCode)) break
      if (/,$/.test(curCode)) break
      const dangling =
        /[=+\-*/%<>&|?.]$/.test(curCode) ||
        /\($/.test(curCode) ||
        /\b(?:return|throw|case|new)\s*$/.test(curCode)
      const continues = /^[=+\-*/%<>&|?.,]/.test(next) || /^\./.test(next)
      if (!dangling && !continues) break
      if (
        /^(function|class|const|let|var|if|for|while|try|catch|finally|else|window|document|location|history|console)\b/.test(
          next,
        )
      ) {
        break
      }
      line = `${curCode} ${next}`
      i += 1
    }
    out.push(line)
  }
  return out.join('\n')
}

function skipJsTrivia(s: string, from: number): number {
  let j = from
  while (j < s.length) {
    const ch = s[j]
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      j += 1
      continue
    }
    if (ch === '/' && s[j + 1] === '/') {
      j += 2
      while (j < s.length && s[j] !== '\n') j += 1
      continue
    }
    if (ch === '/' && s[j + 1] === '*') {
      const end = s.indexOf('*/', j + 2)
      j = end < 0 ? s.length : end + 2
      continue
    }
    break
  }
  return j
}

function classifyJsBrace(s: string, openIdx: number): 'object' | 'block' | 'empty' {
  let j = skipJsTrivia(s, openIdx + 1)
  if (j >= s.length || s[j] === '}') return 'empty'
  const rest = s.slice(j, j + 96)
  if (/^(return|const|let|var|if|for|while|do|try|switch|function|class|throw|break|continue|debugger)\b/.test(rest)) {
    return 'block'
  }
  if (/^[A-Za-z_$][\w$]*\s*:/.test(rest) || /^['"`]/.test(rest) || /^\.\.\./.test(rest) || /^\[/.test(rest)) {
    return 'object'
  }
  return 'block'
}

/** 对象属性在逗号后换行；花括号内挤在一行的语句也拆开。注释里的对象字面量同样处理。 */
function layoutJsStructures(src: string): string {
  const s = String(src ?? '')
  let out = ''
  let i = 0
  let str: string | null = null
  let lineComment = false
  let blockComment = false
  let paren = 0
  let bracket = 0
  let forDepth = 0
  const braceStack: { object: boolean; paren: number; bracket: number }[] = []
  let commentPrefix = '// '

  const depth = () => braceStack.length
  const pad = () => '  '.repeat(depth())
  const inObjectComma = () => {
    const top = braceStack[braceStack.length - 1]
    return Boolean(top?.object && paren === top.paren && bracket === top.bracket)
  }
  const breakPrefix = () => (lineComment ? `${commentPrefix}${pad()}` : pad())
  const insertNl = () => {
    out += `\n${breakPrefix()}`
  }
  const nextSignificant = (from: number) => skipJsTrivia(s, from)
  const prevNonSpaceIsNewline = () => /\n[ \t]*$/.test(out) || out === ''

  while (i < s.length) {
    const ch = s[i]!

    if (str) {
      out += ch
      if (ch === '\\' && i + 1 < s.length) {
        out += s[i + 1]
        i += 2
        continue
      }
      if (ch === str) str = null
      i += 1
      continue
    }

    if (lineComment) {
      if (ch === '\n') {
        lineComment = false
        out += ch
        i += 1
        continue
      }
      out += ch
      i += 1
      continue
    } else if (blockComment) {
      out += ch
      if (ch === '*' && s[i + 1] === '/') {
        out += '/'
        i += 2
        blockComment = false
        continue
      }
      i += 1
      continue
    } else {
      if (ch === '/' && s[i + 1] === '/') {
        const lineStart = out.lastIndexOf('\n') + 1
        const indent = out.slice(lineStart).match(/^[ \t]*/)?.[0] ?? ''
        commentPrefix = `${indent}// `
        lineComment = true
        out += '//'
        i += 2
        continue
      }
      if (ch === '/' && s[i + 1] === '*') {
        blockComment = true
        out += '/*'
        i += 2
        continue
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        str = ch
        out += ch
        i += 1
        continue
      }
    }

    if (!blockComment) {
      if (ch === '(') {
        paren += 1
        if (/\bfor\s*$/.test(out.replace(/\/\/[^\n]*$/, ''))) forDepth = paren
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
      if (ch === '[') {
        bracket += 1
        out += ch
        i += 1
        continue
      }
      if (ch === ']') {
        bracket = Math.max(0, bracket - 1)
        out += ch
        i += 1
        continue
      }
    }

    if (ch === '{') {
      const kind = classifyJsBrace(s, i)
      braceStack.push({ object: kind === 'object', paren, bracket })
      out = out.replace(/[ \t]+$/, '')
      if (out && !out.endsWith(' ') && !out.endsWith('\n') && !out.endsWith('(')) out += ' '
      out += '{'
      i += 1
      const nxt = nextSignificant(i)
      if (kind !== 'empty' && s[nxt] !== '}') {
        while (i < s.length && /[ \t]/.test(s[i]!)) i += 1
        if (s[i] !== '\n') insertNl()
      }
      continue
    }

    if (ch === '}') {
      braceStack.pop()
      out = out.replace(/[ \t]+$/, '')
      if (!prevNonSpaceIsNewline() && !out.endsWith('{')) insertNl()
      else out = out.replace(/[ \t]*$/, lineComment ? commentPrefix + pad() : pad())
      out += '}'
      i += 1
      continue
    }

    if (ch === ',' && inObjectComma() && !forDepth) {
      out += ','
      i += 1
      while (i < s.length && /[ \t]/.test(s[i]!)) i += 1
      if (i < s.length && s[i] !== '\n' && s[i] !== '}' && s[i] !== ']') insertNl()
      continue
    }

    out += ch
    i += 1
  }
  return out
}

const JS_STMT_START =
  /^(const|let|var|function|class|if|for|while|do|switch|try|return|throw|async|break|continue|debugger|import|export)\b/
const JS_HOLD_KW =
  /^(const|let|var|function|class|async|await|new|return|throw|typeof|void|delete|yield|else|do|case|in|of|instanceof|extends|from|import|export|if|for|while|switch|catch)$/

const JS_AFTER_LINE_COMMENT =
  /(?:;|>)\s*(?=(?:function|const|let|var|class|document|window|setTimeout|setInterval|console|if|for|while|return|async)\b)|\s(?=(?:setTimeout|setInterval|document|window|console)\b)/

function formatQuizJsTextbook(src: string): string {
  const s = String(src ?? '').replace(/\r\n/g, '\n').trim()
  if (!s) return s
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
  const trimmedOut = () => out.replace(/[ \t]+$/, '')
  const asiBreak = (at: number, afterSpace: boolean): boolean => {
    if (paren !== 0 || forDepth) return false
    if (/^(else|catch|finally|instanceof|in|of|as|satisfies)\b/.test(s.slice(at))) return false
    if (/^[=+\-*/%<>&|?:]/.test(s[at]!)) return false
    if (/^['"`]/.test(s[at]!)) return false
    const t = trimmedOut()
    if (!t || t.endsWith('\n') || t.endsWith('{')) return false
    if (/[.(,:?=&|!+\-*/%~<>^]$/.test(t)) return false
    const word = t.match(/[A-Za-z_$][\w$]*$/)?.[0]
    if (word && JS_HOLD_KW.test(word)) return false
    if (JS_STMT_START.test(s.slice(at))) return /(?:['"`0-9]|[)\]]|\w)$/.test(t)
    if (/^[A-Za-z_$]/.test(s[at]!) && /(?:['"`]|[)\]])$/.test(t)) return true
    if (afterSpace && /^[A-Za-z_$]/.test(s[at]!) && /\w$/.test(t)) return true
    return false
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
      let k = i + 2
      const lineEnd = s.indexOf('\n', k)
      const rest = lineEnd < 0 ? s.slice(k) : s.slice(k, lineEnd)
      const cut = rest.search(JS_AFTER_LINE_COMMENT)
      k = cut >= 0 ? k + cut + (rest[cut] === ';' || rest[cut] === '>' ? 1 : 0) : lineEnd < 0 ? n : lineEnd
      out = out.replace(/[ \t]+$/, '')
      if (out && !out.endsWith('\n')) nl()
      out += s.slice(i, k).trimEnd()
      i = k
      while (i < n && /[ \t]/.test(s[i]!)) i += 1
      if (i < n && s[i] !== '\n') nl()
      continue
    }
    if (ch === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2)
      out += s.slice(i, end < 0 ? n : end + 2)
      i = end < 0 ? n : end + 2
      continue
    }
    if (ch === '\n' || ch === '\r') {
      i += 1
      while (i < n && /[ \t\r\n]/.test(s[i]!)) i += 1
      if (i >= n) break
      if (asiBreak(i, true)) nl()
      continue
    }
    if (ch === ' ' || ch === '\t') {
      let j = i
      while (j < n && (s[j] === ' ' || s[j] === '\t')) j += 1
      if (j < n && asiBreak(j, true)) {
        i = j
        out = out.replace(/[ \t]+$/, '')
        nl()
        continue
      }
      out += ' '
      i = j
      continue
    }
    if (asiBreak(i, false)) {
      nl()
      continue
    }
    if (ch === '(') {
      paren += 1
      if (/\bfor\s*$/.test(out)) forDepth = paren
      if (/\b(?:function|if|for|while|switch|catch|with)\s*$/.test(out.replace(/[ \t]+$/, ''))) {
        out = out.replace(/[ \t]+$/, '')
        out += ' ('
      } else {
        out += ch
      }
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
      while (i < n && /[ \t]/.test(s[i]!)) i += 1
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
      while (i < n && /[ \t]/.test(s[i]!)) i += 1
      if (i < n && s[i] !== ';' && s[i] !== ')' && s[i] !== ',' && s[i] !== '}') {
        if (/^(else|catch|finally)\b/.test(s.slice(i))) out += ' '
        else nl()
      }
      continue
    }
    if (ch === ';' && !forDepth) {
      out += ';'
      i += 1
      while (i < n && /[ \t]/.test(s[i]!)) i += 1
      if (i < n && s[i] !== '}' && s[i] !== ')') nl()
      continue
    }
    if (ch === ',' && indent > 0 && !forDepth && paren === 0) {
      out += ','
      i += 1
      while (i < n && /[ \t]/.test(s[i]!)) i += 1
      if (i < n && s[i] !== '}' && s[i] !== ')') nl()
      continue
    }
    out += ch
    i += 1
  }
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** 函数 / 实例 / 验证之间空一行，贴近教程体例。 */
function insertTextbookBlankLines(code: string): string {
  const lines = String(code ?? '').replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    const t = line.trim()
    const next = (lines[i + 1] ?? '').trim()
    out.push(line)
    if (!t || !next) continue
    const indent = line.match(/^[ \t]*/)?.[0].length ?? 0
    if (indent !== 0) continue
    const endedBlock = t === '}' || t === '};' || /^\}\s*\)\s*\(\s*\)\s*;?$/.test(t)
    const nextDecl = /^(function|class|var|let|const)\b/.test(next)
    const nextComment = next.startsWith('//')
    const nextCtrl = /^(else|catch|finally|while)\b/.test(next)
    if (endedBlock && (nextDecl || nextComment || (!nextCtrl && next !== '}'))) {
      out.push('')
      continue
    }
    if (/^(var|let|const)\b/.test(t) && !/^(var|let|const)\b/.test(next) && !nextCtrl && next !== '}') {
      out.push('')
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** IIFE 只剩结尾 `})();`、函数缺 `{` 时补全，避免题干代码残缺。 */
export function repairTruncatedQuizJs(code: string): string {
  let s = String(code ?? '').replace(/\r\n/g, '\n')
  s = s.replace(/function\s*\(([^)]*)\)\s*(?![\s]*\{)/g, 'function ($1) {')
  const trimmed = s.trim()
  if (/\}\s*\)\s*\(\s*\)\s*;?\s*$/.test(trimmed) && !/^\(\s*(?:function\b|\()/.test(trimmed)) {
    s = `(function () {\n${trimmed}`
  }
  return s
}

/** 测验代码块：补全残缺 IIFE/花括号，并按教程体例排版（一句一行、2 空格、逻辑段空行）。 */
export function repairAndPrettyQuizJs(code: string, opts?: { expand?: boolean }): string {
  const stripped = stripJsLangPrefix(code)
  const repaired = repairTruncatedQuizJs(stripped)
  const joined = joinContinuedJsLines(repaired)
  const laid = formatQuizJsTextbook(joined)
  return tidyJsFenceBody(insertTextbookBlankLines(layoutJsStructures(laid)), opts)
}

export function jsSourceUnbalanced(code: string): boolean {
  const body = String(code ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
  let braces = 0
  let parens = 0
  let squares = 0
  for (const ch of body) {
    if (ch === '{') braces += 1
    else if (ch === '}') braces -= 1
    else if (ch === '(') parens += 1
    else if (ch === ')') parens -= 1
    else if (ch === '[') squares += 1
    else if (ch === ']') squares -= 1
    if (braces < 0 || parens < 0 || squares < 0) return true
  }
  return braces !== 0 || parens !== 0 || squares !== 0
}

/** 题干代码只写了 API 名、括号没写全、或花括号不配。 */
export function quizJsLooksIncomplete(code: string): boolean {
  const t = String(code ?? '').trim()
  if (!t) return true
  if (jsSourceUnbalanced(t)) return true
  const compact = t
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/\s+/g, '')
  if (!compact) return true
  if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(compact)) return true
  if (/\b(?:pushState|replaceState)\b/.test(t) && !/\b(?:pushState|replaceState)\s*\(/.test(t)) return true
  if (/[=(,]\s*$/.test(t)) return true
  if (/\}\s*\)\s*\(\s*\)\s*;?\s*$/.test(t) && !/^\s*\(/.test(t)) return true
  return false
}

function jsNeedsFullPretty(code: string): boolean {
  const lines = String(code ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.trim())
  const compact = String(code ?? '').replace(/\s+/g, '')
  if (lines.some((l) => /;\s*(?:var|let|const|function|document|window|setTimeout|setInterval|if)\b/.test(l))) {
    return true
  }
  if (lines.length <= 2 && compact.length > 72 && /;/.test(code)) return true
  if (lines.length === 1 && compact.length > 56 && /(?:function|=>|\{)/.test(code)) return true
  return false
}

/** 展示前整理代码块：原文已换行的保持原样；只给挤在一行的拆语句。 */
export function prepareJsBlockSource(code: string, opts?: { expand?: boolean }): string {
  const stripped = stripJsLangPrefix(code)
  if (jsNeedsFullPretty(stripped)) return repairAndPrettyQuizJs(stripped, opts)
  return tidyJsFenceBody(stripped, { expand: opts?.expand === true })
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
export function tidyJsFencesInMarkdown(md: string, opts?: { prettyQuiz?: boolean }): string {
  const repaired = repairFusedMarkdownFences(repairSameLineFenceOpeners(normalizeJsMarkdownFences(md)))
  FENCE_RE.lastIndex = 0
  return repaired.replace(FENCE_RE, (_all, lang: string | undefined, body: string) => {
    const raw = String(lang || 'js').toLowerCase()
    const nextLang = raw === 'javascript' ? 'js' : raw === 'typescript' ? 'ts' : raw
    const source = opts?.prettyQuiz ? repairAndPrettyQuizJs(body) : prepareJsBlockSource(body)
    return `\`\`\`${nextLang}\n${source}\n\`\`\``
  })
}
