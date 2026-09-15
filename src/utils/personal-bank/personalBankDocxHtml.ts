import {
  BorderStyle,
  ImageRun,
  Math as DocxMath,
  MathFraction,
  MathRun,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
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

const MAX_IMG_PX = 520
const CONTENT_DXA = 9638

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
    font: bodyFont(style),
    size: style.size || (style.inPre ? 20 : 24),
    color: style.color,
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
  }
  if (el) {
    const tok = tokenColorOf(el)
    if (tok) {
      next.color = tok
      next.italics = next.italics || el.classList.contains('tok-cmt')
      next.bold = next.bold || el.classList.contains('tok-kw')
    }
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
    next.color = next.color || CODE_FG
    next.shadingFill = undefined
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
    const scale = Math.min(1, MAX_IMG_PX / natW, MAX_IMG_PX / natH)
    const width = Math.max(24, Math.round(natW * scale))
    const height = Math.max(24, Math.round(natH * scale))

    const mimeMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/i.exec(url)
    const mime = (mimeMatch?.[1] ?? '').toLowerCase()
    const kind: ImageKind | null = mime.includes('png')
      ? 'png'
      : mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpg'
        : mime.includes('gif')
          ? 'gif'
          : mime.includes('bmp')
            ? 'bmp'
            : null

    if (url.startsWith('data:') && kind) {
      const b64 = url.slice(url.indexOf(',') + 1)
      const bin = atob(b64)
      const data = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i += 1) data[i] = bin.charCodeAt(i)
      return { type: kind, data, width, height }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return null
    return { type: 'png', data: new Uint8Array(await blob.arrayBuffer()), width, height }
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

type HtmlBlock =
  | { kind: 'p'; children: ParagraphChild[]; extra?: Omit<IParagraphOptions, 'children'> }
  | { kind: 'table'; table: Table }

function tableFromElement(tableEl: Element, images: Map<string, PreparedImage>): Table {
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

function codeLineExtra(isFirst: boolean, isLast: boolean): Omit<IParagraphOptions, 'children'> {
  return {
    shading: { type: ShadingType.CLEAR, fill: CODE_BG },
    spacing: { before: isFirst ? 160 : 0, after: isLast ? 200 : 0, line: 276 },
    indent: { left: 140, right: 140 },
  }
}

const codeBoxBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: CODE_BG,
}

function codeBlockTable(lines: ParagraphChild[][]): Table {
  const paras = lines.map(
    (children) =>
      new Paragraph({
        spacing: { before: 0, after: 0, line: 400 },
        children: children.length
          ? children
          : [new TextRun({ text: ' ', font: 'Consolas', size: 20, color: CODE_FG })],
      }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [CONTENT_DXA],
    rows: [
      new TableRow({
        cantSplit: lines.length <= 18,
        children: [
          new TableCell({
            width: { size: CONTENT_DXA, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: CODE_BG },
            margins: { top: 180, bottom: 200, left: 220, right: 220 },
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

function splitPreLines(pre: Element, images: Map<string, PreparedImage>): ParagraphChild[][] {
  const code = pre.querySelector('code') ?? pre
  const lines: ParagraphChild[][] = [[]]
  const pushLine = () => {
    if (lines[lines.length - 1]) lines.push([])
  }
  const current = () => lines[lines.length - 1]!
  const walk = (node: Node, style: RunStyle) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = String(node.textContent ?? '').replace(/\r\n/g, '\n').split('\n')
      parts.forEach((part, i) => {
        if (i > 0) pushLine()
        const run = styledRun(part, style)
        if (run && (part.length || style.inPre)) current().push(run)
      })
      return
    }
    if (!isElement(node)) return
    const name = tagName(node)
    if (name === 'br') {
      pushLine()
      return
    }
    if (name === 'img') {
      current().push(...imageChild(node.getAttribute('src') ?? '', images))
      return
    }
    const next = childStyle(name, style, node)
    for (const child of [...node.childNodes]) walk(child, next)
  }
  walk(code, { inPre: true, font: 'Consolas', size: 20, color: CODE_FG })
  return lines.length ? lines : [[]]
}

function blocksFromNode(root: ParentNode, images: Map<string, PreparedImage>, handout = false): HtmlBlock[] {
  const out: HtmlBlock[] = []
  let pending: ParagraphChild[] = []

  const flush = () => {
    if (!pending.length) return
    out.push({ kind: 'p', children: pending })
    pending = []
  }

  const walk = (node: Node) => {
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
    if (name === 'pre') {
      flush()
      const lines = splitPreLines(node, images)
      if (handout) {
        out.push({ kind: 'table', table: codeBlockTable(lines) })
        return
      }
      lines.forEach((children, i) => {
        out.push({
          kind: 'p',
          children: children.length ? children : [new TextRun({ text: ' ', font: 'Consolas', size: 20, color: CODE_FG })],
          extra: codeLineExtra(i === 0, i === lines.length - 1),
        })
      })
      return
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
          spacing: {
            before: handout ? (level === 1 ? 0 : level === 2 ? 280 : 220) : level === 1 ? 80 : 280,
            after: handout ? (level === 1 ? 200 : level === 2 ? 140 : 100) : 120,
            line: 360,
          },
        },
      })
      return
    }
    if (name === 'blockquote') {
      flush()
      for (const block of blocksFromNode(node, images, handout)) {
        if (block.kind === 'p') {
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
            spacing: { after: handout ? 50 : 60, before: 0, line: handout ? 440 : 276 },
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
            before: handout ? 220 : 200,
            after: handout ? 100 : 120,
            line: 360,
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
): IParagraphOptions['spacing'] {
  const given = block.extra?.spacing
  const merged = {
    after: handout ? 220 : 80,
    before: afterCode && handout ? 240 : 0,
    line: handout ? 456 : 276,
    ...(typeof given === 'object' && given ? given : {}),
  }
  if (handout && afterCode) {
    const before = typeof merged.before === 'number' ? merged.before : 0
    merged.before = Math.max(before, 240)
  }
  return merged
}

function toFileChild(
  block: HtmlBlock,
  extra: Omit<IParagraphOptions, 'children'>,
  handout = false,
  afterCode = false,
): FileChild {
  if (block.kind === 'table') return block.table
  const { spacing: _ignored, ...rest } = block.extra ?? {}
  return bodyParagraph(block.children, {
    ...extra,
    ...rest,
    spacing: paragraphSpacing(block, handout, afterCode),
  })
}

function zeroFirstHeadingBefore(blocks: HtmlBlock[]) {
  const first = blocks[0]
  if (!first || first.kind !== 'p' || !first.extra?.spacing || typeof first.extra.spacing !== 'object') return
  first.extra = { ...first.extra, spacing: { ...first.extra.spacing, before: 0 } }
}

export async function htmlToDocxBlocks(
  html: string,
  options?: { prefix?: ParagraphChild[]; indent?: number; handout?: boolean },
): Promise<FileChild[]> {
  const prefix = options?.prefix ?? []
  const extra: Omit<IParagraphOptions, 'children'> = options?.indent != null ? { indent: { left: options.indent } } : {}
  const handout = Boolean(options?.handout)
  const root = parseRoot(html)
  if (!root) return prefix.length ? [bodyParagraph(prefix, extra)] : []
  const images = await collectImages(root)
  const blocks = blocksFromNode(root, images, handout)
  if (handout) zeroFirstHeadingBefore(blocks)
  const mapped = (list: HtmlBlock[], offset: number) =>
    list.map((b, i) => toFileChild(b, extra, handout, handout && (offset + i > 0) && blocks[offset + i - 1]?.kind === 'table'))
  if (!prefix.length) return mapped(blocks, 0)
  if (!blocks.length) return [bodyParagraph(prefix, extra)]
  const first = blocks[0]
  if (first && first.kind === 'p') {
    return [
      bodyParagraph([...prefix, ...first.children], {
        ...extra,
        ...first.extra,
        spacing: paragraphSpacing(first, handout, false),
      }),
      ...mapped(blocks.slice(1), 1),
    ]
  }
  return [bodyParagraph(prefix, extra), ...mapped(blocks, 0)]
}
