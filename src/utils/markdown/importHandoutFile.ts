import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

export type ImportedHandout = { title: string; html: string }

const HIGHLIGHT: Record<string, string> = {
  yellow: '#fff3a3',
  green: '#c8f7c5',
  cyan: '#c7f3f3',
  magenta: '#f8c7e8',
  blue: '#cfe4ff',
  red: '#ffc9c9',
  darkYellow: '#ffe08a',
  darkGreen: '#8fd99a',
  darkCyan: '#7ed6d6',
  darkMagenta: '#e59bc8',
  darkBlue: '#8fb4ea',
  darkRed: '#f0a0a0',
  lightGray: '#eeeeee',
  darkGray: '#bdbdbd',
  black: '#333333',
  white: '#ffffff',
}

type StyleInfo = {
  heading?: number
  bold?: boolean
  italic?: boolean
  mono?: boolean
  align?: string
  basedOn?: string
  numId?: string
  ilvl?: number
}

type RunStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  vert?: 'superscript' | 'subscript'
  color?: string
  bg?: string
  sizePt?: number
  family?: string
  mono?: boolean
}

type Rel = { target: string; external: boolean }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;')
}

function fileTitle(name: string): string {
  return name.replace(/\.(docx|md|markdown)$/i, '').trim() || '未命名讲义'
}

function looksLikeHtmlDocument(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (/^<!doctype html/i.test(t) || /^<html[\s>]/i.test(t)) return true
  const tags = t.match(/<\/?(p|h[1-6]|table|div|ul|ol|pre|img|blockquote|strong|span)\b/gi) || []
  const mdMarks = /(^|\n)(#{1,6}\s|```|\*\*|-\s|\d+\.\s)/.test(t)
  return tags.length >= 4 && !mdMarks
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'function') {
    throw new Error('当前浏览器读不了 docx，请改用 md')
  }
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function unzipAll(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const data = new Uint8Array(buf)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  let eocd = -1
  const min = Math.max(0, data.length - 22 - 65536)
  for (let i = data.length - 22; i >= min; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  const out = new Map<string, Uint8Array>()
  if (eocd < 0) throw new Error('这个 docx 不是有效的压缩包')
  const count = view.getUint16(eocd + 10, true)
  let pos = view.getUint32(eocd + 16, true)
  for (let n = 0; n < count && pos + 46 < data.length; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break
    const method = view.getUint16(pos + 10, true)
    const compSize = view.getUint32(pos + 20, true)
    const nameLen = view.getUint16(pos + 28, true)
    const extraLen = view.getUint16(pos + 30, true)
    const commentLen = view.getUint16(pos + 32, true)
    const localOff = view.getUint32(pos + 42, true)
    const name = new TextDecoder().decode(data.subarray(pos + 46, pos + 46 + nameLen)).replace(/\\/g, '/')
    pos += 46 + nameLen + extraLen + commentLen
    if (!name || name.endsWith('/')) continue
    const localNameLen = view.getUint16(localOff + 26, true)
    const localExtraLen = view.getUint16(localOff + 28, true)
    const start = localOff + 30 + localNameLen + localExtraLen
    const comp = data.subarray(start, start + compSize)
    const raw = method === 0 ? comp : method === 8 ? await inflateRaw(comp) : null
    if (raw) out.set(name, raw)
  }
  if (!out.has('word/document.xml')) throw new Error('这个 docx 里没有正文')
  return out
}

function xmlDoc(bytes: Uint8Array | undefined): Document | null {
  if (!bytes) return null
  const xml = new TextDecoder().decode(bytes)
  return new DOMParser().parseFromString(xml, 'text/xml')
}

function local(el: Element): string {
  return (el.localName || el.tagName || '').replace(/^.*:/, '').toLowerCase()
}

function elements(el: Element): Element[] {
  return [...el.children]
}

function direct(el: Element | null, name: string): Element | null {
  if (!el) return null
  for (const child of elements(el)) {
    if (local(child) === name) return child
  }
  return null
}

function attr(el: Element | null, name: string): string {
  if (!el) return ''
  return (
    el.getAttribute(`w:${name}`) ||
    el.getAttribute(name) ||
    el.getAttribute(`r:${name}`) ||
    ''
  )
}

function flag(el: Element | null, name: string): boolean | null {
  const node = el ? direct(el, name) : null
  if (!node) return null
  const v = attr(node, 'val').toLowerCase()
  if (v === '0' || v === 'false' || v === 'off' || v === 'none') return false
  return true
}

function hexColor(raw: string): string {
  const v = raw.trim()
  if (!v || v.toLowerCase() === 'auto') return ''
  if (/^[0-9a-f]{6}$/i.test(v)) return `#${v}`
  if (/^[0-9a-f]{3}$/i.test(v)) return `#${v}`
  return ''
}

function fillOf(el: Element | null): string {
  if (!el) return ''
  const fill = hexColor(attr(el, 'fill'))
  if (fill && fill.toLowerCase() !== '#auto') return fill
  const highlight = attr(el, 'val')
  return HIGHLIGHT[highlight] || ''
}

function fontFamily(rPr: Element | null): { family: string; mono: boolean } {
  const fonts = rPr ? direct(rPr, 'rFonts') : null
  const names = [
    attr(fonts, 'ascii'),
    attr(fonts, 'hAnsi'),
    attr(fonts, 'eastAsia'),
    attr(fonts, 'cs'),
  ].filter(Boolean)
  const joined = names.join(' ')
  const mono = /consolas|courier|monaco|menlo|source code|monospace|等宽|consola/i.test(joined)
  const picked =
    names.find((name) => /楷体|仿宋|黑体|consolas|courier|monaco|menlo|kaiti|fangsong|simhei/i.test(name)) || ''
  return { family: picked, mono }
}

function parseStyles(doc: Document | null): Map<string, StyleInfo> {
  const map = new Map<string, StyleInfo>()
  if (!doc) return map
  for (const style of [...doc.getElementsByTagName('*')].filter((el) => local(el) === 'style')) {
    const id = attr(style, 'styleId')
    if (!id) continue
    const name = attr(direct(style, 'name'), 'val')
    const info: StyleInfo = { basedOn: attr(direct(style, 'basedOn'), 'val') || undefined }
    const headingName = /heading\s*(\d+)/i.exec(name) || /标题\s*(\d+)/.exec(name) || /heading\s*(\d+)/i.exec(id)
    if (headingName) info.heading = Number(headingName[1])
    const outline = attr(direct(direct(style, 'pPr'), 'outlineLvl'), 'val')
    if (outline !== '') info.heading = Number(outline) + 1
    if (/代码|code|html preformatted|plaintext/i.test(`${name} ${id}`)) info.mono = true
    const rPr = direct(style, 'rPr')
    const bold = flag(rPr, 'b')
    const italic = flag(rPr, 'i')
    if (bold != null) info.bold = bold
    if (italic != null) info.italic = italic
    if (fontFamily(rPr).mono) info.mono = true
    const jc = attr(direct(direct(style, 'pPr'), 'jc'), 'val')
    if (jc) info.align = jc
    const num = direct(direct(style, 'pPr'), 'numPr')
    if (num) {
      info.numId = attr(direct(num, 'numId'), 'val')
      info.ilvl = Number(attr(direct(num, 'ilvl'), 'val') || 0)
    }
    map.set(id, info)
  }
  return map
}

function resolveStyle(id: string, styles: Map<string, StyleInfo>, seen = new Set<string>()): StyleInfo {
  if (!id || seen.has(id)) return {}
  seen.add(id)
  const own = styles.get(id)
  if (!own) {
    const heading = /heading\s*(\d+)/i.exec(id) || /标题\s*(\d+)/.exec(id)
    return heading ? { heading: Number(heading[1]) } : {}
  }
  const base = resolveStyle(own.basedOn || '', styles, seen)
  return {
    ...base,
    ...Object.fromEntries(Object.entries(own).filter(([, v]) => v !== undefined && v !== '')),
  }
}

function parseNumbering(doc: Document | null): Map<string, 'ul' | 'ol'> {
  const map = new Map<string, 'ul' | 'ol'>()
  if (!doc) return map
  const abstracts = new Map<string, 'ul' | 'ol'>()
  for (const abs of [...doc.getElementsByTagName('*')].filter((el) => local(el) === 'abstractnum')) {
    const id = attr(abs, 'abstractNumId')
    const lvl = elements(abs).find((el) => local(el) === 'lvl' && attr(el, 'ilvl') === '0') || direct(abs, 'lvl')
    const fmt = attr(lvl ? direct(lvl, 'numFmt') : null, 'val')
    abstracts.set(id, fmt === 'bullet' ? 'ul' : 'ol')
  }
  for (const num of [...doc.getElementsByTagName('*')].filter((el) => local(el) === 'num')) {
    const id = attr(num, 'numId')
    const abs = attr(direct(num, 'abstractNumId'), 'val')
    if (id) map.set(id, abstracts.get(abs) || 'ol')
  }
  return map
}

function parseRels(doc: Document | null): Map<string, Rel> {
  const map = new Map<string, Rel>()
  if (!doc) return map
  for (const rel of [...doc.getElementsByTagName('*')].filter((el) => local(el) === 'relationship')) {
    const id = rel.getAttribute('Id') || rel.getAttribute('id') || ''
    const target = rel.getAttribute('Target') || ''
    const mode = rel.getAttribute('TargetMode') || ''
    if (id && target) map.set(id, { target: decodeURIComponent(target), external: /external/i.test(mode) })
  }
  return map
}

function bytesToDataUrl(bytes: Uint8Array, name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || 'png'
  const mime =
    (
      {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        bmp: 'image/bmp',
        svg: 'image/svg+xml',
        emf: 'image/emf',
        wmf: 'image/wmf',
      } as Record<string, string>
    )[ext] || 'image/png'
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:${mime};base64,${btoa(binary)}`
}

function mediaPath(target: string): string {
  const clean = target.replace(/\\/g, '/').replace(/^\/+/, '')
  if (clean.startsWith('word/')) return clean
  return `word/${clean.replace(/^\.\.\//, '')}`
}

function imageTag(bytes: Uint8Array, name: string, width: number, height: number): string {
  const src = bytesToDataUrl(bytes, name)
  const size = [
    width > 0 ? `width:${Math.round(width)}px` : '',
    height > 0 ? `height:${Math.round(height)}px` : 'height:auto',
    'max-width:100%',
  ]
    .filter(Boolean)
    .join(';')
  return `<img src="${src}" alt="" style="${size}">`
}

function extentNear(el: Element): { w: number; h: number } {
  let node: Element | null = el
  while (node) {
    for (const child of [...node.getElementsByTagName('*')]) {
      if (local(child) !== 'extent' && local(child) !== 'ext') continue
      const cx = Number(child.getAttribute('cx') || 0)
      const cy = Number(child.getAttribute('cy') || 0)
      if (cx > 0 && cy > 0) return { w: cx / 9525, h: cy / 9525 }
    }
    node = node.parentElement
  }
  return { w: 0, h: 0 }
}

function imagesHtml(root: Element, rels: Map<string, Rel>, files: Map<string, Uint8Array>): string {
  let html = ''
  for (const el of [...root.getElementsByTagName('*')]) {
    if (local(el) !== 'blip' && local(el) !== 'imagedata') continue
    const id = el.getAttribute('r:embed') || el.getAttribute('r:id') || attr(el, 'embed') || attr(el, 'id')
    const rel = id ? rels.get(id) : undefined
    if (!rel || rel.external) continue
    const bytes = files.get(mediaPath(rel.target))
    if (!bytes) continue
    const size = extentNear(el)
    html += imageTag(bytes, rel.target, size.w, size.h)
  }
  return html
}

function runStyle(rPr: Element | null, inherited: StyleInfo): RunStyle {
  const fonts = fontFamily(rPr)
  const size = Number(attr(rPr ? direct(rPr, 'sz') : null, 'val') || 0)
  const color = hexColor(attr(rPr ? direct(rPr, 'color') : null, 'val'))
  const bg =
    fillOf(rPr ? direct(rPr, 'highlight') : null) || fillOf(rPr ? direct(rPr, 'shd') : null)
  const vert = attr(rPr ? direct(rPr, 'vertAlign') : null, 'val')
  const underline = flag(rPr, 'u')
  return {
    bold: flag(rPr, 'b') ?? inherited.bold,
    italic: flag(rPr, 'i') ?? inherited.italic,
    underline: underline === null ? undefined : underline,
    strike: flag(rPr, 'strike') === true || flag(rPr, 'dstrike') === true,
    vert: vert === 'superscript' || vert === 'subscript' ? vert : undefined,
    color: color || undefined,
    bg: bg || undefined,
    sizePt: size >= 8 ? size / 2 : undefined,
    family: fonts.family || undefined,
    mono: fonts.mono || inherited.mono,
  }
}

function wrapRun(inner: string, style: RunStyle, inCode: boolean): string {
  if (!inner) return ''
  let html = inner
  if (!inCode && style.mono && !html.includes('<img')) html = `<code>${html}</code>`
  if (style.bold) html = `<strong>${html}</strong>`
  if (style.italic) html = `<em>${html}</em>`
  if (style.underline) html = `<u>${html}</u>`
  if (style.strike) html = `<s>${html}</s>`
  if (style.vert === 'superscript') html = `<sup>${html}</sup>`
  if (style.vert === 'subscript') html = `<sub>${html}</sub>`
  const css = [
    style.color ? `color:${style.color}` : '',
    style.bg ? `background-color:${style.bg}` : '',
    style.sizePt && style.sizePt !== 12 && style.sizePt !== 10.5 ? `font-size:${style.sizePt}pt` : '',
    !inCode && style.family ? `font-family:${style.family}` : '',
  ].filter(Boolean)
  if (css.length) html = `<span style="${css.join(';')}">${html}</span>`
  return html
}

function inlineHtml(
  root: Element,
  inherited: StyleInfo,
  rels: Map<string, Rel>,
  files: Map<string, Uint8Array>,
  inCode: boolean,
): string {
  let html = ''
  for (const child of elements(root)) {
    const name = local(child)
    if (name === 'r') {
      const style = runStyle(direct(child, 'rPr'), inherited)
      let inner = ''
      for (const part of elements(child)) {
        const partName = local(part)
        if (partName === 't') inner += escapeHtml(part.textContent || '')
        else if (partName === 'tab') inner += '　'
        else if (partName === 'br' || partName === 'cr') inner += '<br>'
        else if (partName === 'drawing' || partName === 'pict' || partName === 'object') {
          inner += imagesHtml(part, rels, files)
        } else if (partName === 'sym') {
          const code = Number.parseInt(attr(part, 'char'), 16)
          if (Number.isFinite(code)) inner += escapeHtml(String.fromCodePoint(code))
        }
      }
      html += wrapRun(inner, style, inCode)
    } else if (name === 'hyperlink') {
      const rel = rels.get(attr(child, 'id'))
      const inner = inlineHtml(child, inherited, rels, files, inCode)
      const href = rel && (rel.external || /^https?:|^mailto:/i.test(rel.target)) ? rel.target : ''
      html += href
        ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : inner
    } else if (name === 'ins' || name === 'smartTag' || name === 'sdt') {
      const innerRoot = direct(child, 'sdtContent') || child
      html += inlineHtml(innerRoot, inherited, rels, files, inCode)
    } else if (name === 'del') {
      const inner = inlineHtml(child, inherited, rels, files, inCode)
      if (inner) html += `<s>${inner}</s>`
    }
  }
  return html
}

function twipPt(raw: string): string {
  const n = Number(raw)
  if (!Number.isFinite(n) || n === 0) return ''
  return `${Math.round((n / 20) * 10) / 10}pt`
}

type Block = {
  kind: 'html' | 'code' | 'item'
  html: string
  numId?: string
  ilvl?: number
  ordered?: boolean
}

function paragraphBlocks(
  p: Element,
  styles: Map<string, StyleInfo>,
  numbering: Map<string, 'ul' | 'ol'>,
  rels: Map<string, Rel>,
  files: Map<string, Uint8Array>,
): Block | null {
  const pPr = direct(p, 'pPr')
  const style = resolveStyle(attr(direct(pPr, 'pStyle'), 'val'), styles)
  const numPr = direct(pPr, 'numPr')
  const numId = attr(direct(numPr, 'numId'), 'val') || style.numId || ''
  const ilvl = numPr ? Number(attr(direct(numPr, 'ilvl'), 'val') || 0) : style.ilvl || 0
  const inCode = Boolean(style.mono) && !numId
  const inner = inlineHtml(p, style, rels, files, inCode)
  const hasImage = inner.includes('<img')
  if (!inner.trim() && !hasImage) {
    return { kind: 'html', html: '<p><br></p>' }
  }
  if (inCode && !hasImage) return { kind: 'code', html: inner.replace(/<br>/g, '\n') }
  const css: string[] = []
  const align = attr(direct(pPr, 'jc'), 'val') || style.align || ''
  if (align === 'center' || align === 'right') css.push(`text-align:${align}`)
  if (align === 'both' || align === 'distribute') css.push('text-align:justify')
  if (!numId) {
    const ind = direct(pPr, 'ind')
    const left = twipPt(attr(ind, 'left') || attr(ind, 'start'))
    const first = twipPt(attr(ind, 'firstLine'))
    const hanging = twipPt(attr(ind, 'hanging'))
    if (left) css.push(`margin-left:${left}`)
    if (first) css.push(`text-indent:${first}`)
    if (hanging) css.push(`text-indent:-${hanging}`, `padding-left:${hanging}`)
  }
  const bg = fillOf(direct(pPr, 'shd'))
  if (bg) css.push(`background-color:${bg}`)
  const styleAttr = css.length ? ` style="${css.join(';')}"` : ''
  if (numId && numId !== '0') {
    return {
      kind: 'item',
      html: inner,
      numId,
      ilvl,
      ordered: (numbering.get(numId) || 'ol') === 'ol',
    }
  }
  const heading = style.heading && style.heading >= 1 && style.heading <= 6 ? style.heading : 0
  if (heading) return { kind: 'html', html: `<h${heading}${styleAttr}>${inner}</h${heading}>` }
  return { kind: 'html', html: `<p${styleAttr}>${inner}</p>` }
}

function listHtml(items: Block[]): string {
  if (!items.length) return ''
  const tag = items[0]?.ordered ? 'ol' : 'ul'
  let i = 0
  const take = (level: number): string => {
    let out = ''
    while (i < items.length && (items[i]?.ilvl || 0) >= level) {
      if ((items[i]?.ilvl || 0) > level) {
        const before = i
        out += take(items[i]?.ilvl || level)
        if (i === before) i += 1
        continue
      }
      const html = items[i]?.html || ''
      i += 1
      let nested = ''
      if (i < items.length && (items[i]?.ilvl || 0) > level) nested = take((items[i]?.ilvl || level + 1))
      out += `<li>${html}${nested}</li>`
    }
    return out ? `<${tag}>${out}</${tag}>` : ''
  }
  return take(items[0]?.ilvl || 0)
}

function foldBlocks(blocks: Block[]): string {
  let html = ''
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]!
    if (block.kind === 'code') {
      const lines = [block.html]
      i += 1
      while (i < blocks.length && blocks[i]?.kind === 'code') {
        lines.push(blocks[i]!.html)
        i += 1
      }
      html += `<pre><code>${lines.join('\n')}</code></pre>`
      continue
    }
    if (block.kind === 'item') {
      const items = [block]
      i += 1
      while (i < blocks.length && blocks[i]?.kind === 'item' && blocks[i]?.numId === block.numId) {
        items.push(blocks[i]!)
        i += 1
      }
      html += listHtml(items)
      continue
    }
    html += block.html
    i += 1
  }
  return html
}

type RawCell = { html: string; colspan: number; merge: '' | 'restart' | 'continue'; bg: string; align: string }

function cellAt(row: RawCell[], col: number): RawCell | null {
  let cursor = 0
  for (const cell of row) {
    if (cursor === col) return cell
    cursor += cell.colspan
  }
  return null
}

function tableHtml(
  table: Element,
  styles: Map<string, StyleInfo>,
  numbering: Map<string, 'ul' | 'ol'>,
  rels: Map<string, Rel>,
  files: Map<string, Uint8Array>,
): string {
  const rows = elements(table).filter((el) => local(el) === 'tr')
  const matrix: RawCell[][] = rows.map((row) =>
    elements(row)
      .filter((el) => local(el) === 'tc')
      .map((cell) => {
        const tcPr = direct(cell, 'tcPr')
        const span = Number(attr(direct(tcPr, 'gridSpan'), 'val') || 1)
        const vMerge = direct(tcPr, 'vMerge')
        const mergeVal = attr(vMerge, 'val')
        const merge = !vMerge ? '' : mergeVal === 'restart' ? 'restart' : 'continue'
        const blocks = elements(cell)
          .flatMap((el) => blockFrom(el, styles, numbering, rels, files))
        return {
          html: foldBlocks(blocks) || '<p><br></p>',
          colspan: Number.isFinite(span) && span > 1 ? span : 1,
          merge: merge,
          bg: fillOf(direct(tcPr, 'shd')),
          align: attr(direct(direct(cell, 'p'), 'pPr') ? direct(direct(direct(cell, 'p'), 'pPr'), 'jc') : null, 'val'),
        }
      }),
  )
  const body = matrix
    .map((row, r) => {
      let col = 0
      const cells = row
        .map((cell) => {
          const at = col
          col += cell.colspan
          if (cell.merge === 'continue') return ''
          let rowspan = 1
          if (cell.merge === 'restart') {
            for (let rr = r + 1; rr < matrix.length; rr++) {
              const below = cellAt(matrix[rr] || [], at)
              if (!below || below.merge !== 'continue') break
              rowspan += 1
            }
          }
          const css = [
            'border:1px solid #cbd5e1',
            'padding:4px 8px',
            'vertical-align:top',
            cell.bg ? `background-color:${cell.bg}` : '',
            cell.align === 'center' || cell.align === 'right' ? `text-align:${cell.align}` : '',
          ]
            .filter(Boolean)
            .join(';')
          const spanAttr = cell.colspan > 1 ? ` colspan="${cell.colspan}"` : ''
          const rowAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : ''
          return `<td${spanAttr}${rowAttr} style="${css}">${cell.html}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')
  if (!body) return ''
  return `<table style="border-collapse:collapse;width:100%"><tbody>${body}</tbody></table>`
}

function blockFrom(
  el: Element,
  styles: Map<string, StyleInfo>,
  numbering: Map<string, 'ul' | 'ol'>,
  rels: Map<string, Rel>,
  files: Map<string, Uint8Array>,
): Block[] {
  const name = local(el)
  if (name === 'p') {
    const block = paragraphBlocks(el, styles, numbering, rels, files)
    return block ? [block] : []
  }
  if (name === 'tbl') return [{ kind: 'html', html: tableHtml(el, styles, numbering, rels, files) }]
  if (name === 'sdt' || name === 'customXml') {
    const inner = direct(el, 'sdtContent') || el
    return elements(inner).flatMap((child) => blockFrom(child, styles, numbering, rels, files))
  }
  return []
}

function docxToHtml(files: Map<string, Uint8Array>): string {
  const doc = xmlDoc(files.get('word/document.xml'))
  const body = doc ? [...doc.getElementsByTagName('*')].find((el) => local(el) === 'body') : null
  if (!body) throw new Error('这个 docx 里没有正文')
  const styles = parseStyles(xmlDoc(files.get('word/styles.xml')))
  const numbering = parseNumbering(xmlDoc(files.get('word/numbering.xml')))
  const rels = parseRels(xmlDoc(files.get('word/_rels/document.xml.rels')))
  const html = foldBlocks(elements(body).flatMap((el) => blockFrom(el, styles, numbering, rels, files)))
  const safe = sanitizeRichHtml(html)
  if (!safe.trim()) throw new Error('这个 docx 里没有可导入的文字')
  return safe
}

export async function handoutFromUploadFile(file: File): Promise<ImportedHandout> {
  const title = fileTitle(file.name)
  if (/\.(md|markdown)$/i.test(file.name)) {
    const text = await file.text()
    const html = looksLikeHtmlDocument(text) ? sanitizeRichHtml(text) : markdownToDisplaySafeHtml(text)
    if (!html.trim()) throw new Error(`「${file.name}」是空文件`)
    return { title, html }
  }
  if (/\.docx$/i.test(file.name)) {
    return { title, html: docxToHtml(await unzipAll(await file.arrayBuffer())) }
  }
  throw new Error('只支持 .docx 和 .md')
}
