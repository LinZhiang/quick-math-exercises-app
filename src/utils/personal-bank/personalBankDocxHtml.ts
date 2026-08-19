import {
  BorderStyle,
  ImageRun,
  Math as DocxMath,
  MathFraction,
  MathRun,
  Paragraph,
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
}

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

function styledRun(text: string, style: RunStyle): TextRun | null {
  const value = collapseText(text)
  if (!value) return null
  return new TextRun({
    text: value,
    bold: style.bold,
    italics: style.italics,
    superScript: style.superScript,
    subScript: style.subScript,
    font: 'SimSun',
    size: 24,
  })
}

function childStyle(name: string, style: RunStyle): RunStyle {
  return {
    bold: style.bold || name === 'strong' || name === 'b' || name === 'th',
    italics: style.italics || name === 'em' || name === 'i',
    superScript: style.superScript || name === 'sup',
    subScript: style.subScript || name === 'sub',
  }
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
  if (name === 'br') return [new TextRun(' ')]
  if (node.classList.contains('da-math-frac__rule')) return []
  if (isFrac(node)) return [mathFromFrac(node)]
  if (name === 'img') return imageChild(node.getAttribute('src') ?? '', images)
  if (name === 'table' || name === 'ul' || name === 'ol') return []
  const next = childStyle(name, style)
  const out: ParagraphChild[] = []
  for (const child of [...node.childNodes]) out.push(...inlineFromNode(child, next, images))
  return out
}

function flattenInline(root: ParentNode, images: Map<string, PreparedImage>, style: RunStyle = {}): ParagraphChild[] {
  const out: ParagraphChild[] = []
  for (const child of [...root.childNodes]) {
    if (isElement(child) && isBlockTag(tagName(child)) && tagName(child) !== 'table') {
      if (out.length) out.push(new TextRun(' '))
      out.push(...flattenInline(child, images, childStyle(tagName(child), style)))
    } else {
      out.push(...inlineFromNode(child, style, images))
    }
  }
  return out
}

type HtmlBlock = { kind: 'p'; children: ParagraphChild[] } | { kind: 'table'; table: Table }

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

function blocksFromNode(root: ParentNode, images: Map<string, PreparedImage>): HtmlBlock[] {
  const out: HtmlBlock[] = []
  let pending: ParagraphChild[] = []

  const flush = () => {
    if (!pending.length) return
    out.push({ kind: 'p', children: pending })
    pending = []
  }

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const run = styledRun(node.textContent ?? '', {})
      if (run) pending.push(run)
      return
    }
    if (!isElement(node)) return
    const name = tagName(node)
    if (name === 'br') {
      if (pending.length) pending.push(new TextRun(' '))
      return
    }
    if (name === 'table') {
      flush()
      out.push({ kind: 'table', table: tableFromElement(node, images) })
      return
    }
    if (name === 'ul' || name === 'ol') {
      flush()
      ;[...node.children].forEach((li, i) => {
        if (tagName(li) !== 'li') return
        const mark = name === 'ol' ? `${i + 1}. ` : '• '
        out.push({ kind: 'p', children: [textRun(mark), ...flattenInline(li, images)] })
      })
      return
    }
    if (isFrac(node) || name === 'img' || name === 'span' || name === 'strong' || name === 'b' || name === 'em' || name === 'i' || name === 'sup' || name === 'sub' || name === 'a' || name === 'u') {
      pending.push(...inlineFromNode(node, {}, images))
      return
    }
    if (isBlockTag(name)) {
      flush()
      const inner = blocksFromNode(node, images)
      if (inner.length) out.push(...inner)
      else {
        const inlines = flattenInline(node, images)
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

function toFileChild(block: HtmlBlock, extra: Omit<IParagraphOptions, 'children'>): FileChild {
  if (block.kind === 'table') return block.table
  return bodyParagraph(block.children, extra)
}

export async function htmlToDocxBlocks(
  html: string,
  options?: { prefix?: ParagraphChild[]; indent?: number },
): Promise<FileChild[]> {
  const prefix = options?.prefix ?? []
  const extra: Omit<IParagraphOptions, 'children'> = options?.indent != null ? { indent: { left: options.indent } } : {}
  const root = parseRoot(html)
  if (!root) return prefix.length ? [bodyParagraph(prefix, extra)] : []
  const images = await collectImages(root)
  const blocks = blocksFromNode(root, images)
  if (!prefix.length) return blocks.map((b) => toFileChild(b, extra))
  if (!blocks.length) return [bodyParagraph(prefix, extra)]
  const first = blocks[0]
  if (first && first.kind === 'p') {
    return [bodyParagraph([...prefix, ...first.children], extra), ...blocks.slice(1).map((b) => toFileChild(b, extra))]
  }
  return [bodyParagraph(prefix, extra), ...blocks.map((b) => toFileChild(b, extra))]
}
