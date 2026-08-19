/** 渲染前规范化 Markdown（修复 AI 输出里表格、列表等常见格式问题） */

export function isMarkdownTableSeparatorLine(line: string): boolean {
  const t = line.trim()
  if (!t.includes('-') || !t.includes('|')) return false
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(t)
}

export function isMarkdownTableRowLine(line: string): boolean {
  const t = line.trim()
  if (!t || !t.includes('|')) return false
  if (t.startsWith('```')) return false
  return t.split('|').length >= 2
}

function normalizeMarkdownTableRow(line: string): string {
  let t = line.trim()
  if (!t.includes('|')) return line
  if (!t.startsWith('|')) t = `|${t}`
  if (!t.endsWith('|')) t = `${t}|`
  return t
}

function isTableContextLine(line: string, nextLine?: string): boolean {
  const t = line.trim()
  if (!isMarkdownTableRowLine(t)) return false
  const next = nextLine?.trim() ?? ''
  if (isMarkdownTableSeparatorLine(t)) return true
  if (isMarkdownTableSeparatorLine(next)) return true
  if (next && isMarkdownTableRowLine(next)) return true
  return t.startsWith('|')
}

function normalizeMarkdownListAndEmphasisLine(line: string): string {
  let out = line
  if (/^ {4,}([*+\-]|\d{1,2}\.)\s+/.test(out)) {
    out = out.replace(/^ {4,}/, '')
  }
  out = out.replace(/^\\([*+\-])\s+/, '$1 ')
  if (!out.includes('`')) {
    out = out.replace(/\\(\*{1,2})/g, '$1').replace(/\\(_{1,2})/g, '$1')
  }
  return out
}

function insertMissingMarkdownTableHeaders(lines: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i]!.trim()
    const prev = out[out.length - 1]?.trim() ?? ''
    if (isMarkdownTableSeparatorLine(t) && !isMarkdownTableRowLine(prev)) {
      const colCount = (t.match(/-{2,}/g) ?? []).length
      if (colCount > 0) {
        out.push(`| ${Array(colCount).fill(' ').join(' | ')} |`)
      }
    }
    out.push(lines[i]!)
  }
  return out
}

export function normalizeMarkdownForRender(md: string): string {
  let lines = (md ?? '').split(/\r?\n/)
  lines = insertMissingMarkdownTableHeaders(lines)
  const out: string[] = []
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      inFence = !inFence
      out.push(line)
      continue
    }

    if (inFence) {
      out.push(line)
      continue
    }

    const nextLine = lines[i + 1]
    if (isTableContextLine(line, nextLine)) {
      out.push(normalizeMarkdownTableRow(line))
      continue
    }

    out.push(normalizeMarkdownListAndEmphasisLine(line))
  }

  return out.join('\n')
}
