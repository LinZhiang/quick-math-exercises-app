function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function span(cls: string, text: string) {
  if (!text) return ''
  return `<span class="tok-${cls}">${escapeHtml(text)}</span>`
}

const KEYWORDS = new Set([
  'function',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'break',
  'continue',
  'new',
  'typeof',
  'instanceof',
  'in',
  'of',
  'class',
  'extends',
  'interface',
  'type',
  'export',
  'import',
  'from',
  'as',
  'async',
  'await',
  'void',
  'this',
  'true',
  'false',
  'null',
  'undefined',
  'switch',
  'case',
  'default',
  'try',
  'catch',
  'finally',
  'throw',
  'static',
  'public',
  'private',
  'protected',
  'readonly',
  'yield',
  'delete',
])

const TYPE_WORDS = new Set([
  'number',
  'string',
  'boolean',
  'any',
  'never',
  'unknown',
  'void',
  'object',
  'symbol',
  'bigint',
])

const TWO_OPS = new Set(['==', '!=', '<=', '>=', '=>', '++', '--', '&&', '||', '??', '+=', '-=', '*=', '/=', '%=', '?.'])
const THREE_OPS = new Set(['===', '!==', '**=', '...'])

type ScanMode = {
  stopRBrace?: boolean
}

function scan(src: string, start: number, mode: ScanMode = {}): { html: string; i: number } {
  const out: string[] = []
  let i = start
  const n = src.length
  let lastWasColon = false
  let lastWasFunction = false
  let braceDepth = 0

  while (i < n) {
    const ch = src[i]

    if (mode.stopRBrace && ch === '}' && braceDepth === 0) {
      break
    }

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      let j = i + 1
      while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n' || src[j] === '\r')) j += 1
      out.push(escapeHtml(src.slice(i, j)))
      i = j
      continue
    }

    if (ch === '/' && src[i + 1] === '/') {
      let j = i + 2
      while (j < n && src[j] !== '\n') j += 1
      out.push(span('cmt', src.slice(i, j)))
      i = j
      lastWasColon = false
      lastWasFunction = false
      continue
    }

    if (ch === '/' && src[i + 1] === '*') {
      let j = i + 2
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j += 1
      j = j + 2 <= n ? j + 2 : n
      out.push(span('cmt', src.slice(i, j)))
      i = j
      lastWasColon = false
      lastWasFunction = false
      continue
    }

    if (ch === "'" || ch === '"') {
      const q = ch
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === q) {
          j += 1
          break
        }
        if (src[j] === '\n') break
        j += 1
      }
      out.push(span('str', src.slice(i, j)))
      i = j
      lastWasColon = false
      lastWasFunction = false
      continue
    }

    if (ch === '`') {
      out.push(span('tmpl', '`'))
      i += 1
      let buf = ''
      while (i < n) {
        if (src[i] === '\\') {
          buf += src.slice(i, i + 2)
          i += 2
          continue
        }
        if (src[i] === '`') {
          if (buf) out.push(span('tmpl', buf))
          out.push(span('tmpl', '`'))
          i += 1
          break
        }
        if (src[i] === '$' && src[i + 1] === '{') {
          if (buf) out.push(span('tmpl', buf))
          buf = ''
          out.push(span('tmpl', '${'))
          i += 2
          const inner = scan(src, i, { stopRBrace: true })
          out.push(inner.html)
          i = inner.i
          if (src[i] === '}') {
            out.push(span('tmpl', '}'))
            i += 1
          }
          continue
        }
        buf += src[i]
        i += 1
      }
      lastWasColon = false
      lastWasFunction = false
      continue
    }

    if (/\d/.test(ch) || (ch === '.' && i + 1 < n && /\d/.test(src[i + 1]))) {
      let j = i + 1
      while (j < n && /[\d._xXa-fA-Fn]/.test(src[j])) j += 1
      out.push(span('num', src.slice(i, j)))
      i = j
      lastWasColon = false
      lastWasFunction = false
      continue
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1
      while (j < n && /[\w$]/.test(src[j])) j += 1
      const word = src.slice(i, j)
      let k = j
      while (k < n && (src[k] === ' ' || src[k] === '\t')) k += 1
      const next = src[k]
      let cls = 'id'
      if (KEYWORDS.has(word)) cls = 'kw'
      else if (lastWasFunction || next === '(') cls = 'fn'
      else if (lastWasColon || TYPE_WORDS.has(word)) cls = 'ty'
      out.push(span(cls, word))
      lastWasFunction = word === 'function'
      lastWasColon = false
      i = j
      continue
    }

    if (mode.stopRBrace && ch === '{') braceDepth += 1
    if (mode.stopRBrace && ch === '}') braceDepth = Math.max(0, braceDepth - 1)

    lastWasFunction = false
    lastWasColon = ch === ':'

    const three = src.slice(i, i + 3)
    if (THREE_OPS.has(three)) {
      out.push(span('op', three))
      i += 3
      continue
    }
    const two = src.slice(i, i + 2)
    if (TWO_OPS.has(two)) {
      out.push(span('op', two))
      i += 2
      continue
    }
    out.push(span('op', ch))
    i += 1
  }

  return { html: out.join(''), i }
}

export function highlightTs(source: string): string {
  return scan(source, 0).html
}
