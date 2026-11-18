import {
  AlignmentType,
  BorderStyle,
  ImageRun,
  Math as DocxMath,
  MathFraction,
  MathRun,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
  type FileChild,
  type IParagraphOptions,
  type IRunOptions,
  type MathComponent,
  type ParagraphChild,
} from 'docx'
import { renderMathInRichHtml } from '@/utils/data-analysis/dataAnalysisMathDisplay'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

type ImageKind = 'jpg' | 'png' | 'gif' | 'bmp'

type PreparedImage = {
  type: ImageKind
  data: Uint8Array
  width: number
  height: number
}

type RunStyle = {
  bold?: boolean
  italics?: boolean
  superScript?: boolean
  subScript?: boolean
  color?: string
  font?: string
  size?: number
  shadingFill?: string
  inPre?: boolean
  handout?: boolean
  codeBg?: string
}

const HANDOUT_FONT = 'Microsoft YaHei'

const TOK_COLOR: Record<string, string> = {
  'tok-kw': 'F472B6',
  'tok-fn': 'FBBF24',
  'tok-ty': '7DD3FC',
  'tok-str': '86EFAC',
  'tok-tmpl': '86EFAC',
  'tok-cmt': 'A3E635',
  'tok-num': 'C4B5FD',
  'tok-lit': 'C4B5FD',
  'tok-op': 'E5E7EB',
  'tok-id': 'E5E7EB',
}

const CODE_BG = '1E1E1E'
const CODE_FG = 'E5E7EB'
const MONO_FONT_RE = /consolas|menlo|monaco|courier|monospace|fira|cascadia|jetbrains|source code|ui-monospace/i

function cssColorToHex(raw: string): string | undefined {
  const s = String(raw ?? '').trim()
  if (!s) return undefined
  const hex = /#([0-9a-f]{3,8})\b/i.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
    return h.slice(0, 6).toUpperCase()
  }
  const rgb = /rgba?\(\s*(\d+)\s*[,\s/]\s*(\d+)\s*[,\s/]\s*(\d+)/i.exec(s)
  if (!rgb) return undefined
  const n = (x: string) => Math.max(0, Math.min(255, Number(x))).toString(16).padStart(2, '0')
  return `${n(rgb[1])}${n(rgb[2])}${n(rgb[3])}`.toUpperCase()
}

function hexLum(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return 255
  return (r * 299 + g * 587 + b * 114) / 1000
}

function styleMap(el: Element): Record<string, string> {
  const s = el.getAttribute('style') || ''
  const out: Record<string, string> = {}
  for (const part of s.split(';')) {
    const i = part.indexOf(':')
    if (i < 0) continue
    out[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim()
  }
  return out
}

function inlineStyleOf(el: Element): Pick<RunStyle, 'color' | 'bold' | 'italics' | 'font' | 'codeBg'> {
  const st = styleMap(el)
  const color = cssColorToHex(st.color || '')
  const bg = cssColorToHex(st['background-color'] || st.background || '')
  const weight = (st['font-weight'] || '').toLowerCase()
  const font = st['font-family'] || ''
  return {
    color,
    bold: weight === 'bold' || Number(weight) >= 600 || undefined,
    italics: (st['font-style'] || '').toLowerCase() === 'italic' || undefined,
    font: MONO_FONT_RE.test(font) ? 'Consolas' : undefined,
    codeBg: bg && hexLum(bg) < 80 ? bg : undefined,
  }
}

/** Cursor / VS Code 复制过来的代码：黑底 + 彩色 span，不能当普通正文。 */
function looksLikeCursorCode(el: Element): boolean {
  const name = tagName(el)
  if (name === 'pre' || el.classList.contains('hl-code')) return true
  if (!/^(div|section|article|figure)$/.test(name)) return false
  const cls = el.getAttribute('class') || ''
  if (/\b(monaco-editor|view-lines|hl-code|rte-js-pre)\b/i.test(cls)) return true
  if (el.querySelector('h1, h2, h3, h4, h5, h6, table, ul, ol, aside, .cb-handout-note, img')) return false
  const st = styleMap(el)
  const bg = cssColorToHex(st['background-color'] || st.background || '')
  const font = `${st['font-family'] || ''} ${cls}`
  const mono = MONO_FONT_RE.test(font)
  const preWrap = /pre/i.test(st['white-space'] || '')
  const colored = el.querySelectorAll('span[style*="color" i], font[color]').length
  if (bg && hexLum(bg) < 80 && (mono || preWrap || colored >= 2)) return true
  if ((mono || preWrap) && colored >= 2) return true
  const breaks = el.querySelectorAll('br').length
  if ((mono || preWrap) && (breaks >= 1 || /\n/.test(el.textContent || ''))) return true
  return false
}

/** 页面内容宽约 6.7 英寸，按 96dpi 显示；嵌入像素另算，避免 Word 把小图拉糊。 */
const PAGE_IMG_W = 640
const PAGE_IMG_H = 880
const EMBED_MAX_PX = 2400
const CONTENT_DXA = 9638
/** Consolas 10pt 粗体大约一个空格的宽度，用来还原代码行首缩进。 */
const CODE_CHAR_DXA = 120

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '334155',
}

const tableBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
  insideHorizontal: thinBorder,
  insideVertical: thinBorder,
}

export function bodyParagraph(
  children: ParagraphChild[],
  extra: Omit<IParagraphOptions, 'children'> = {},
): Paragraph {
  return new Paragraph({
    spacing: { after: 80, before: 0, line: 276 },
    ...extra,
    children: children.length ? children : [new TextRun('')],
  })
}

export function textRun(text: string, extra: Omit<IRunOptions, 'text'> = {}): TextRun {
  return new TextRun({
    text,
    font: 'SimSun',
    size: 24,
    ...extra,
  })
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function tagName(el: Element): string {
  return el.tagName.toLowerCase()
}

function isFrac(el: Element): boolean {
  return el.classList.contains('da-math-frac')
}

function isBlockTag(name: string): boolean {
  return /^(p|div|h[1-6]|li|ul|ol|table|thead|tbody|tfoot|blockquote|section|article|pre)$/.test(name)
}

function collapseText(s: string): string {
  return s.replace(/\u00a0/g, ' ').replace(/[\t\r\n]+/g, ' ')
}

function bodyFont(style: RunStyle): string {
  if (style.font) return style.font
  if (style.inPre) return 'Consolas'
  return style.handout ? HANDOUT_FONT : 'SimSun'
}

function styledRun(text: string, style: RunStyle): TextRun | null {
  const value = style.inPre ? String(text).replace(/\u00a0/g, ' ') : collapseText(text)
  if (!value && !style.inPre) return null
  return new TextRun({
    text: value || ' ',
    bold: style.bold,
    italics: style.italics,
    superScript: style.superScript,
    subScript: style.subScript,
    font: style.inPre
      ? { ascii: 'Consolas', hAnsi: 'Consolas', cs: 'Consolas', eastAsia: 'Microsoft YaHei' }
      : bodyFont(style),
    size: style.size || (style.inPre ? 20 : 24),
    color: style.color,
    noProof: style.inPre || undefined,
    shading: style.shadingFill
      ? { type: ShadingType.CLEAR, fill: style.shadingFill }
      : undefined,
  })
}

function tokenColorOf(el: Element): string | undefined {
  const tok = [...el.classList].find((c) => c.startsWith('tok-'))
  return tok ? TOK_COLOR[tok] : undefined
}

function childStyle(name: string, style: RunStyle, el?: Element): RunStyle {
  const next: RunStyle = {
    bold: style.bold || name === 'strong' || name === 'b' || name === 'th',
    italics: style.italics || name === 'em' || name === 'i',
    superScript: style.superScript || name === 'sup',
    subScript: style.subScript || name === 'sub',
    color: style.color,
    font: style.font,
    size: style.size,
    shadingFill: style.shadingFill,
    inPre: style.inPre,
    handout: style.handout,
    codeBg: style.codeBg,
  }
  if (el) {
    const inline = inlineStyleOf(el)
    if (inline.color) next.color = inline.color
    if (inline.bold) next.bold = true
    if (inline.italics) next.italics = true
    if (inline.font) next.font = inline.font
    if (inline.codeBg) next.codeBg = inline.codeBg
    const tok = tokenColorOf(el)
    if (tok) {
      next.color = tok
      next.italics = next.italics || el.classList.contains('tok-cmt')
      next.bold = next.bold || el.classList.contains('tok-kw')
    }
    const attrColor = cssColorToHex(el.getAttribute('color') || '')
    if (attrColor) next.color = attrColor
  }
  if (name === 'code' && !style.inPre) {
    next.font = 'Consolas'
    next.size = style.handout ? 22 : 21
    next.color = next.color || 'C43B66'
    next.shadingFill = next.shadingFill || 'FDECEE'
    if (style.handout) next.bold = true
  }
  if (style.inPre) {
    next.font = 'Consolas'
    next.size = 20
    next.bold = true
    next.color = next.color || CODE_FG
    next.shadingFill = next.codeBg || style.codeBg || CODE_BG
  }
  return next
}

function mathComponentsFrom(el: Element | null): MathComponent[] {
  if (!el) return [new MathRun('')]
  const out: MathComponent[] = []
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = collapseText(node.textContent ?? '').trim()
      if (t) out.push(new MathRun(t))
      return
    }
    if (!isElement(node)) return
    if (node.classList.contains('da-math-frac__rule')) return
    if (isFrac(node)) {
      out.push(
        new MathFraction({
          numerator: mathComponentsFrom(node.querySelector(':scope > .da-math-frac__num')),
          denominator: mathComponentsFrom(node.querySelector(':scope > .da-math-frac__den')),
        }),
      )
      return
    }
    for (const child of [...node.childNodes]) walk(child)
  }
  for (const child of [...el.childNodes]) walk(child)
  return out.length ? out : [new MathRun('')]
}

function mathFromFrac(el: Element): DocxMath {
  return new DocxMath({
    children: [
      new MathFraction({
        numerator: mathComponentsFrom(el.querySelector(':scope > .da-math-frac__num')),
        denominator: mathComponentsFrom(el.querySelector(':scope > .da-math-frac__den')),
      }),
    ],
  })
}

function displaySize(natW: number, natH: number): { width: number; height: number } {
  const scale = Math.min(1, PAGE_IMG_W / natW, PAGE_IMG_H / natH)
  return {
    width: Math.max(1, Math.round(natW * scale)),
    height: Math.max(1, Math.round(natH * scale)),
  }
}

function sniffImage(data: Uint8Array): ImageKind | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8) return 'jpg'
  if (data.length >= 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'png'
  if (data.length >= 6 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'gif'
  if (data.length >= 2 && data[0] === 0x42 && data[1] === 0x4d) return 'bmp'
  return null
}

function bytesFromDataUrl(url: string): Uint8Array | null {
  const comma = url.indexOf(',')
  if (comma < 0) return null
  if (/;base64/i.test(url.slice(0, comma))) {
    const bin = atob(url.slice(comma + 1).replace(/\s/g, ''))
    const data = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i += 1) data[i] = bin.charCodeAt(i)
    return data
  }
  const text = decodeURIComponent(url.slice(comma + 1))
  return new TextEncoder().encode(text)
}

async function rasterizeImage(img: HTMLImageElement, maxEdge: number): Promise<Uint8Array | null> {
  const natW = Math.max(1, img.naturalWidth || 1)
  const natH = Math.max(1, img.naturalHeight || 1)
  const scale = Math.min(1, maxEdge / natW, maxEdge / natH)
  const width = Math.max(1, Math.round(natW * scale))
  const height = Math.max(1, Math.round(natH * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return null
  return new Uint8Array(await blob.arrayBuffer())
}

async function loadImage(src: string): Promise<PreparedImage | null> {
  const url = String(src ?? '').trim()
  if (!url || url.startsWith('blob:')) return null
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('img'))
      img.src = url
    })
    const natW = Math.max(1, img.naturalWidth || 1)
    const natH = Math.max(1, img.naturalHeight || 1)
    const shown = displaySize(natW, natH)
    const oversized = natW > EMBED_MAX_PX || natH > EMBED_MAX_PX

    let data: Uint8Array | null = null
    if (url.startsWith('data:')) data = bytesFromDataUrl(url)
    else {
      const res = await fetch(url)
      if (res.ok) data = new Uint8Array(await res.arrayBuffer())
    }
    const kind = data ? sniffImage(data) : null
    if (data && kind && !oversized) return { type: kind, data, ...shown }

    const raster = await rasterizeImage(img, EMBED_MAX_PX)
    if (!raster) return null
    return { type: 'png', data: raster, ...shown }
  } catch {
    return null
  }
}

async function collectImages(root: ParentNode): Promise<Map<string, PreparedImage>> {
  const map = new Map<string, PreparedImage>()
  const srcs = [...root.querySelectorAll('img')].map((el) => el.getAttribute('src') ?? '').filter(Boolean)
  for (const src of [...new Set(srcs)]) {
    const img = await loadImage(src)
    if (img) map.set(src, img)
  }
  return map
}

function imageChild(src: string, images: Map<string, PreparedImage>): ParagraphChild[] {
  const img = images.get(src)
  if (!img) return []
  return [
    new ImageRun({
      type: img.type,
      data: img.data,
      transformation: { width: img.width, height: img.height },
    }),
  ]
}

function inlineFromNode(node: Node, style: RunStyle, images: Map<string, PreparedImage>): ParagraphChild[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const run = styledRun(node.textContent ?? '', style)
    return run ? [run] : []
  }
  if (!isElement(node)) return []
  const name = tagName(node)
  if (name === 'br') return style.inPre ? [new TextRun({ break: 1 })] : [new TextRun(' ')]
  if (node.classList.contains('da-math-frac__rule')) return []
  if (isFrac(node)) return [mathFromFrac(node)]
  if (name === 'img') return imageChild(node.getAttribute('src') ?? '', images)
  if (name === 'table' || name === 'ul' || name === 'ol') return []
  const next = childStyle(name, style, node)
  const out: ParagraphChild[] = []
  for (const child of [...node.childNodes]) out.push(...inlineFromNode(child, next, images))
  return out
}

function flattenInline(root: ParentNode, images: Map<string, PreparedImage>, style: RunStyle = {}): ParagraphChild[] {
  const out: ParagraphChild[] = []
  for (const child of [...root.childNodes]) {
    if (isElement(child) && isBlockTag(tagName(child)) && tagName(child) !== 'table') {
      if (out.length) out.push(new TextRun(style.inPre ? { break: 1 } : { text: ' ' }))
      out.push(...flattenInline(child, images, childStyle(tagName(child), style, child)))
    } else {
      out.push(...inlineFromNode(child, style, images))
    }
  }
  return out
}

type CodeLine = { children: ParagraphChild[]; pad: number }

type HtmlBlock =
  | { kind: 'p'; children: ParagraphChild[]; extra?: Omit<IParagraphOptions, 'children'> }
  | { kind: 'table'; table: Table }
  | { kind: 'code'; lines: CodeLine[]; inset?: number }

function tableFromElement(tableEl: Element, images: Map<string, PreparedImage>, pageBreakBefore = false): Table {
  const rows = [...tableEl.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr')]
  const grid = rows.map((tr) => [...tr.children].filter((c) => tagName(c) === 'td' || tagName(c) === 'th'))
  const colCount = Math.max(1, ...grid.map((r) => r.length))
  const colW = Math.max(400, Math.floor(CONTENT_DXA / colCount))
  const tableRows = (grid.length ? grid : [[document.createElement('td')]]).map((cells, ri) => {
    const filled = cells.length ? [...cells] : [document.createElement('td')]
    while (filled.length < colCount) filled.push(document.createElement('td'))
    return new TableRow({
      cantSplit: true,
      children: filled.map((cell) => {
        const header = tagName(cell) === 'th' || ri === 0
        const inlines = flattenInline(cell, images, { bold: header })
        return new TableCell({
          width: { size: colW, type: WidthType.DXA },
          verticalAlign: VerticalAlignTable.CENTER,
          margins: { top: 40, bottom: 40, left: 60, right: 60 },
          children: [
            bodyParagraph(inlines.length ? inlines : [textRun(collapseText(cell.textContent ?? '').trim(), { bold: header, size: 22 })], {
              pageBreakBefore: pageBreakBefore && ri === 0,
              spacing: { after: 0, before: 0, line: 240 },
            }),
          ],
        })
      }),
    })
  })
  return new Table({
    width: { size: CONTENT_DXA, type: WidthType.DXA },
    columnWidths: Array.from({ length: colCount }, () => colW),
    rows: tableRows,
    borders: tableBorders,
  })
}

function codeLineExtra(isFirst: boolean, isLast: boolean, pad = 0): Omit<IParagraphOptions, 'children'> {
  return {
    shading: { type: ShadingType.CLEAR, fill: CODE_BG },
    spacing: { before: isFirst ? 160 : 0, after: isLast ? 200 : 0, line: 276 },
    indent: { left: 140 + pad * CODE_CHAR_DXA, right: 140 },
  }
}

const codeBoxBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: CODE_BG,
}

function emptyCodeRun(fill: string): TextRun {
  return new TextRun({
    text: ' ',
    font: { ascii: 'Consolas', hAnsi: 'Consolas', cs: 'Consolas', eastAsia: 'Microsoft YaHei' },
    size: 20,
    bold: true,
    color: CODE_FG,
    noProof: true,
    shading: { type: ShadingType.CLEAR, fill },
  })
}

function codeBlockTable(lines: CodeLine[], pageBreakBefore = false, bg = CODE_BG, inset = 0): Table {
  const fill = bg || CODE_BG
  const paras = lines.map(
    (line, i) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        pageBreakBefore: pageBreakBefore && i === 0,
        spacing: { before: 0, after: 0, line: 276, lineRule: 'auto' },
        shading: { type: ShadingType.CLEAR, fill },
        indent: line.pad > 0 || inset > 0 ? { left: line.pad * CODE_CHAR_DXA + inset } : undefined,
        autoSpaceEastAsianText: false,
        children: line.children.length ? line.children : [emptyCodeRun(fill)],
      }),
  )
  return new Table({
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.LEFT,
    width: { size: CONTENT_DXA, type: WidthType.DXA },
    columnWidths: [CONTENT_DXA],
    rows: [
      new TableRow({
        cantSplit: lines.length <= 18,
        children: [
          new TableCell({
            width: { size: CONTENT_DXA, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            borders: {
              top: codeBoxBorder,
              bottom: codeBoxBorder,
              left: codeBoxBorder,
              right: codeBoxBorder,
            },
            children: paras,
          }),
        ],
      }),
    ],
    borders: {
      top: codeBoxBorder,
      bottom: codeBoxBorder,
      left: codeBoxBorder,
      right: codeBoxBorder,
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: CODE_BG },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: CODE_BG },
    },
  })
}

function isEmptyExportBlock(el: Element): boolean {
  if (el.querySelector('img, table, pre, ul, ol, hr, video, .cb-handout-note')) return false
  if (looksLikeCursorCode(el)) return false
  return !collapseText(el.textContent ?? '').trim()
}

function handoutBase(handout: boolean): RunStyle {
  return handout ? { font: HANDOUT_FONT, handout: true, color: '334155' } : {}
}

function looksLikeSubheading(el: Element): boolean {
  const t = collapseText(el.textContent ?? '').trim()
  if (t.length < 2 || t.length > 56) return false
  if (!/^\d+[.、]\s*\S/.test(t)) return false
  const parts = [...el.childNodes].filter((n) => {
    if (n.nodeType === Node.TEXT_NODE) return Boolean(collapseText(n.textContent ?? '').trim())
    return isElement(n)
  })
  if (!parts.length) return false
  return parts.every((n) => {
    if (n.nodeType === Node.TEXT_NODE) return true
    return isElement(n) && /^(strong|b|code|span|em)$/.test(tagName(n))
  })
}

type CodePiece = { text: string; style: RunStyle } | { child: ParagraphChild }

function finalizeCodeLine(pieces: CodePiece[]): CodeLine {
  let pad = 0
  let skipping = true
  const children: ParagraphChild[] = []
  for (const piece of pieces) {
    if ('child' in piece) {
      skipping = false
      children.push(piece.child)
      continue
    }
    const text = piece.text.replace(/\t/g, '  ').replace(/\u00a0/g, ' ')
    if (!skipping) {
      const run = styledRun(text, piece.style)
      if (run) children.push(run)
      continue
    }
    const lead = /^ */.exec(text)?.[0].length ?? 0
    pad += lead
    const rest = text.slice(lead)
    if (!rest) continue
    skipping = false
    const run = styledRun(rest, piece.style)
    if (run) children.push(run)
  }
  return { children, pad }
}

function splitPreLines(pre: Element, images: Map<string, PreparedImage>): CodeLine[] {
  const code = pre.querySelector(':scope > code') ?? pre
  const lines: CodePiece[][] = [[]]
  let blockLineStarted = false
  const pushLine = () => {
    lines.push([])
  }
  const current = () => lines[lines.length - 1]!
  const hostStyle = inlineStyleOf(pre)
  const base: RunStyle = {
    inPre: true,
    font: 'Consolas',
    size: 20,
    color: hostStyle.color || CODE_FG,
    codeBg: hostStyle.codeBg || CODE_BG,
    shadingFill: hostStyle.codeBg || CODE_BG,
  }
  const walk = (node: Node, style: RunStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = String(node.textContent ?? '')
      const parent = node.parentElement
      const parentName = parent ? tagName(parent) : ''
      const betweenBlocks =
        parentName !== 'pre' &&
        parentName !== 'code' &&
        Boolean(parent?.querySelector(':scope > div, :scope > p'))
      if (betweenBlocks && !raw.replace(/\u00a0/g, ' ').trim()) return
      const parts = raw.replace(/\r\n/g, '\n').split('\n')
      parts.forEach((part, i) => {
        if (i > 0) pushLine()
        if (part.length) current().push({ text: part, style })
      })
      return
    }
    if (!isElement(node)) return
    const name = tagName(node)
    if (name === 'br') {
      pushLine()
      return
    }
    if (name === 'div' || name === 'p') {
      if (blockLineStarted) pushLine()
      blockLineStarted = true
      const next = childStyle(name, style, node)
      for (const child of [...node.childNodes]) walk(child, next)
      return
    }
    if (name === 'img') {
      current().push(...imageChild(node.getAttribute('src') ?? '', images).map((child) => ({ child })))
      return
    }
    const next = childStyle(name, style, node)
    for (const child of [...node.childNodes]) walk(child, next)
  }
  const inherited = childStyle(tagName(code), base, code)
  for (const child of [...code.childNodes]) walk(child, inherited)
  const built = (lines.length ? lines : [[]]).map(finalizeCodeLine)
  while (built.length > 1 && !built[built.length - 1]!.children.length && built[built.length - 1]!.pad === 0) built.pop()
  return built.length ? built : [{ children: [], pad: 0 }]
}

function cssPx(raw: string): number {
  const n = Number.parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  if (/mm$/i.test(raw)) return (n * 96) / 25.4
  if (/cm$/i.test(raw)) return (n * 96) / 2.54
  if (/in$/i.test(raw)) return n * 96
  if (/em$/i.test(raw)) return n * 16
  return n
}

function insetDxa(el: Element): number {
  const st = styleMap(el)
  return Math.round((cssPx(st['margin-left'] || '') + cssPx(st['padding-left'] || '')) * 15)
}

function plainLines(el: Element): string[] {
  const lines: string[] = []
  let buf = ''
  const flushLine = () => {
    lines.push(buf.replace(/\u00a0/g, ' '))
    buf = ''
  }
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      buf += node.textContent ?? ''
      return
    }
    if (!isElement(node)) return
    const name = tagName(node)
    if (name === 'br') {
      flushLine()
      return
    }
    if (name === 'div' || name === 'p' || name === 'li' || name === 'blockquote') {
      if (buf.trim()) flushLine()
      else buf = ''
      for (const child of [...node.childNodes]) walk(child)
      flushLine()
      return
    }
    for (const child of [...node.childNodes]) walk(child)
  }
  for (const child of [...el.childNodes]) walk(child)
  if (buf) flushLine()
  return lines
}

function codeSample(lines: string[]): boolean {
  const meaningful = lines.filter((l) => l.trim())
  if (meaningful.length < 2) return false
  const src = meaningful.join('\n')
  const indented = meaningful.filter((l) => /^[ \t]{2,}\S/.test(l)).length
  const codey = /[{};]|=>|\b(?:function|const|let|var|return|if|for|while|class|import|export|async)\b/.test(src)
  if (indented >= 1 && codey) return true
  if (indented >= 2) return true
  if (codey && /[{}]/.test(src) && meaningful.length >= 3) return true
  return false
}

/** 缩进命令把 pre 拆成普通段落 / br 之后，仍按代码块导出。 */
function looksLikeBrokenCodeBlock(el: Element): boolean {
  if (tagName(el) === 'pre' || looksLikeCursorCode(el)) return false
  if (el.querySelector('pre, table, img, ul, ol, h1, h2, h3, h4, h5, h6, aside, .cb-handout-note')) return false
  return codeSample(plainLines(el))
}

function consumeCodeGroup(start: Element): Element[] | null {
  const name0 = tagName(start)
  if (name0 !== 'div' && name0 !== 'p') return null
  const group: Element[] = []
  let el: Element | null = start
  while (el && (tagName(el) === 'div' || tagName(el) === 'p')) {
    if (el.querySelector('pre, table, img, ul, ol, h1, h2, h3, h4, h5, h6, aside, .cb-handout-note, div, p, blockquote')) break
    const lines = plainLines(el)
    if (lines.filter((l) => l.trim()).length > 1) break
    if (!lines.some((l) => l.trim())) break
    group.push(el)
    el = el.nextElementSibling
  }
  if (group.length < 2) return null
  return codeSample(group.map((g) => plainLines(g).join(''))) ? group : null
}

function blocksFromNode(root: ParentNode, images: Map<string, PreparedImage>, handout = false): HtmlBlock[] {
  const out: HtmlBlock[] = []
  let pending: ParagraphChild[] = []
  const skip = new WeakSet<Element>()

  const flush = () => {
    if (!pending.length) return
    out.push({ kind: 'p', children: pending })
    pending = []
  }

  const emitCode = (el: Element, lines: CodeLine[]) => {
    flush()
    const inset = insetDxa(el)
    if (handout) {
      out.push({ kind: 'code', lines, inset })
      return
    }
    lines.forEach((line, i) => {
      out.push({
        kind: 'p',
        children: line.children.length ? line.children : [emptyCodeRun(CODE_BG)],
        extra: {
          ...codeLineExtra(i === 0, i === lines.length - 1, line.pad),
          indent: { left: 140 + line.pad * CODE_CHAR_DXA + inset, right: 140 },
        },
      })
    })
  }

  const walk = (node: Node) => {
    if (isElement(node) && skip.has(node)) return
    if (node.nodeType === Node.TEXT_NODE) {
      const run = styledRun(node.textContent ?? '', handoutBase(handout))
      if (run) pending.push(run)
      return
    }
    if (!isElement(node)) return
    const name = tagName(node)
    if ((name === 'p' || name === 'div' || name === 'section' || name === 'article') && isEmptyExportBlock(node)) {
      return
    }
    if (name === 'br') {
      if (pending.length) pending.push(new TextRun(' '))
      return
    }
    if (name === 'table') {
      flush()
      out.push({ kind: 'table', table: tableFromElement(node, images) })
      return
    }
    if (name === 'pre' || looksLikeCursorCode(node)) {
      emitCode(node, splitPreLines(node, images))
      return
    }
    if ((name === 'div' || name === 'p' || name === 'blockquote') && looksLikeBrokenCodeBlock(node)) {
      emitCode(node, splitPreLines(node, images))
      return
    }
    if (name === 'div' || name === 'p') {
      const group = consumeCodeGroup(node)
      if (group) {
        for (const item of group.slice(1)) skip.add(item)
        emitCode(node, group.flatMap((item) => splitPreLines(item, images)))
        return
      }
    }
    if (node.classList.contains('cb-handout-note') || (name === 'aside' && node.classList.contains('cb-handout-note'))) {
      flush()
      const tab = (node.querySelector('.cb-handout-note__tab')?.textContent || '备注').trim()
      const body = node.querySelector('.cb-handout-note__body')
      out.push({
        kind: 'p',
        children: [textRun(`【${tab}】`, { bold: true, color: 'C43B66', size: 22 })],
        extra: {
          shading: { type: ShadingType.CLEAR, fill: 'FDECEE' },
          spacing: { before: 120, after: 40, line: 276 },
        },
      })
      if (body) {
        for (const block of blocksFromNode(body, images, handout)) {
          if (block.kind === 'p') {
            out.push({
              ...block,
              extra: {
                ...block.extra,
                shading: { type: ShadingType.CLEAR, fill: 'FDECEE' },
              },
            })
          } else out.push(block)
        }
      }
      return
    }
    if (/^h[1-6]$/.test(name)) {
      if (isEmptyExportBlock(node)) return
      flush()
      const level = Number(name.slice(1))
      const size = handout
        ? level === 1
          ? 40
          : level === 2
            ? 36
            : level === 3
              ? 28
              : 24
        : level === 1
          ? 40
          : level === 2
            ? 32
            : 26
      const color = handout && level >= 3 ? '334155' : '1E2937'
      const inlines = flattenInline(node, images, {
        bold: true,
        font: handout ? HANDOUT_FONT : 'SimHei',
        size,
        color,
        handout,
      })
      out.push({
        kind: 'p',
        children: inlines.length
          ? inlines
          : [
              textRun(collapseText(node.textContent ?? '').trim(), {
                bold: true,
                font: handout ? HANDOUT_FONT : 'SimHei',
                size,
                color,
              }),
            ],
        extra: {
          keepNext: false,
          spacing: {
            before: handout ? (level === 1 ? 0 : level === 2 ? 140 : 100) : level === 1 ? 80 : 280,
            after: handout ? (level === 1 ? 60 : level === 2 ? 40 : 40) : 120,
            line: 276,
          },
        },
      })
      return
    }
    if (name === 'blockquote') {
      flush()
      const quoteInset = insetDxa(node)
      for (const block of blocksFromNode(node, images, handout)) {
        if (block.kind === 'code') {
          out.push({ ...block, inset: (block.inset || 0) + quoteInset })
        } else if (block.kind === 'p') {
          out.push({
            ...block,
            extra: {
              ...block.extra,
              indent: { left: 240 },
              border: { left: { style: BorderStyle.SINGLE, size: 12, color: '94A3B8', space: 8 } },
            },
          })
        } else out.push(block)
      }
      return
    }
    if (name === 'ul' || name === 'ol') {
      flush()
      ;[...node.children].forEach((li, i) => {
        if (tagName(li) !== 'li') return
        const mark = name === 'ol' ? `${i + 1}. ` : '• '
        out.push({
          kind: 'p',
          children: [
            textRun(mark, {
              color: '94A3B8',
              size: 24,
              ...(handout ? { font: HANDOUT_FONT } : {}),
            }),
            ...flattenInline(li, images, handoutBase(handout)),
          ],
          extra: {
            indent: { left: handout ? 280 : 220 },
            spacing: { after: handout ? 20 : 60, before: 0, line: 276 },
          },
        })
      })
      return
    }
    if (
      isFrac(node) ||
      name === 'img' ||
      name === 'span' ||
      name === 'strong' ||
      name === 'b' ||
      name === 'em' ||
      name === 'i' ||
      name === 'sup' ||
      name === 'sub' ||
      name === 'a' ||
      name === 'u' ||
      name === 'code'
    ) {
      pending.push(...inlineFromNode(node, handoutBase(handout), images))
      return
    }
    if (name === 'p' && looksLikeSubheading(node)) {
      flush()
      const inlines = flattenInline(node, images, {
        bold: true,
        font: handout ? HANDOUT_FONT : 'SimHei',
        size: handout ? 28 : 26,
        color: handout ? '334155' : '1E2937',
        handout,
      })
      out.push({
        kind: 'p',
        children: inlines,
        extra: {
          spacing: {
            before: handout ? 100 : 200,
            after: handout ? 40 : 120,
            line: 276,
          },
        },
      })
      return
    }
    if (isBlockTag(name)) {
      flush()
      const inner = blocksFromNode(node, images, handout)
      if (inner.length) out.push(...inner)
      else {
        const inlines = flattenInline(node, images, handoutBase(handout))
        if (inlines.length) out.push({ kind: 'p', children: inlines })
      }
      return
    }
    for (const child of [...node.childNodes]) walk(child)
  }

  for (const child of [...root.childNodes]) walk(child)
  flush()
  return out
}

function parseRoot(html: string): HTMLElement | null {
  const raw = sanitizeRichHtml(html ?? '')
  if (!raw.trim()) return null
  const withMath = renderMathInRichHtml(raw)
  const doc = new DOMParser().parseFromString(`<div id="__docx_root">${withMath}</div>`, 'text/html')
  return doc.getElementById('__docx_root')
}

export async function htmlToInlineChildren(html: string): Promise<ParagraphChild[]> {
  const root = parseRoot(html)
  if (!root) return []
  const images = await collectImages(root)
  return flattenInline(root, images)
}

function paragraphSpacing(
  block: Extract<HtmlBlock, { kind: 'p' }>,
  handout: boolean,
  afterCode: boolean,
  pageBreak = false,
): IParagraphOptions['spacing'] {
  const given = block.extra?.spacing
  const merged = {
    after: handout ? 60 : 80,
    before: afterCode && handout ? 60 : 0,
    line: 276,
    lineRule: 'auto' as const,
    ...(typeof given === 'object' && given ? given : {}),
  }
  if (handout && afterCode) {
    const before = typeof merged.before === 'number' ? merged.before : 0
    merged.before = Math.max(before, 60)
  }
  if (pageBreak) merged.before = 0
  return merged
}

function isCodeLike(block: HtmlBlock | undefined): boolean {
  return block?.kind === 'table' || block?.kind === 'code'
}

function toFileChild(
  block: HtmlBlock,
  extra: Omit<IParagraphOptions, 'children'>,
  handout = false,
  afterCode = false,
  pageBreak = false,
): FileChild {
  if (block.kind === 'code') return codeBlockTable(block.lines, pageBreak, CODE_BG, block.inset ?? 0)
  if (block.kind === 'table') return block.table
  const { spacing: _ignored, pageBreakBefore: extraBreak, ...rest } = block.extra ?? {}
  return bodyParagraph(block.children, {
    ...extra,
    ...rest,
    pageBreakBefore: pageBreak || extraBreak,
    contextualSpacing: true,
    spacing: paragraphSpacing(block, handout, afterCode, pageBreak || extraBreak),
  })
}

function zeroFirstHeadingBefore(blocks: HtmlBlock[]) {
  const first = blocks[0]
  if (!first || first.kind !== 'p' || !first.extra?.spacing || typeof first.extra.spacing !== 'object') return
  first.extra = { ...first.extra, spacing: { ...first.extra.spacing, before: 0 } }
}

function pageBreakSpacer(): Paragraph {
  return new Paragraph({
    pageBreakBefore: true,
    spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' },
    children: [new TextRun({ text: '', size: 2 })],
  })
}

export async function htmlToDocxBlocks(
  html: string,
  options?: {
    prefix?: ParagraphChild[]
    indent?: number
    handout?: boolean
    pageBreakFirst?: boolean
  },
): Promise<FileChild[]> {
  const prefix = options?.prefix ?? []
  const extra: Omit<IParagraphOptions, 'children'> = options?.indent != null ? { indent: { left: options.indent } } : {}
  const handout = Boolean(options?.handout)
  const pageBreakFirst = Boolean(options?.pageBreakFirst)
  const root = parseRoot(html)
  if (!root) {
    if (!prefix.length) return []
    return [bodyParagraph(prefix, { ...extra, pageBreakBefore: pageBreakFirst })]
  }
  const images = await collectImages(root)
  const blocks = blocksFromNode(root, images, handout)
  if (handout) zeroFirstHeadingBefore(blocks)
  const mapped = (list: HtmlBlock[], offset: number) =>
    list.map((b, i) =>
      toFileChild(
        b,
        extra,
        handout,
        handout && offset + i > 0 && isCodeLike(blocks[offset + i - 1]),
        pageBreakFirst && offset + i === 0 && (b.kind === 'p' || b.kind === 'code'),
      ),
    )
  if (!prefix.length) {
    const kids = mapped(blocks, 0)
    if (pageBreakFirst && blocks[0]?.kind === 'table') return [pageBreakSpacer(), ...kids]
    return kids
  }
  if (!blocks.length) return [bodyParagraph(prefix, { ...extra, pageBreakBefore: pageBreakFirst })]
  const first = blocks[0]
  if (first && first.kind === 'p') {
    return [
      bodyParagraph([...prefix, ...first.children], {
        ...extra,
        ...first.extra,
        pageBreakBefore: pageBreakFirst,
        contextualSpacing: true,
        spacing: paragraphSpacing(first, handout, false, pageBreakFirst),
      }),
      ...mapped(blocks.slice(1), 1),
    ]
  }
  const rest = mapped(blocks, 0)
  if (pageBreakFirst) return [pageBreakSpacer(), ...rest]
  return [bodyParagraph(prefix, extra), ...rest]
}
