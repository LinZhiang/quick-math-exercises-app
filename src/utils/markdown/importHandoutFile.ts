import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'

export type ImportedHandout = { title: string; html: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fileTitle(name: string): string {
  return name.replace(/\.(docx|md|markdown)$/i, '').trim() || '未命名讲义'
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

async function readZipText(buf: ArrayBuffer, want: string): Promise<string> {
  const data = new Uint8Array(buf)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  let offset = 0
  while (offset + 30 < data.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) break
    const flags = view.getUint16(offset + 6, true)
    const method = view.getUint16(offset + 8, true)
    let compSize = view.getUint32(offset + 18, true)
    const nameLen = view.getUint16(offset + 26, true)
    const extraLen = view.getUint16(offset + 28, true)
    const nameStart = offset + 30
    const name = new TextDecoder().decode(data.subarray(nameStart, nameStart + nameLen))
    let start = nameStart + nameLen + extraLen
    if (flags & 0x8 && compSize === 0) {
      const mark = [0x50, 0x4b]
      let end = start
      while (end + 3 < data.length) {
        if (data[end] === mark[0] && data[end + 1] === mark[1]) break
        end += 1
      }
      compSize = end - start
    }
    const comp = data.subarray(start, start + compSize)
    if (name === want) {
      const raw = method === 0 ? comp : method === 8 ? await inflateRaw(comp) : null
      if (!raw) throw new Error('这个 docx 的压缩方式读不了')
      return new TextDecoder().decode(raw)
    }
    offset = start + compSize
    if (flags & 0x8) offset += 16
  }
  throw new Error('这个 docx 里没有正文')
}

function docxXmlToHtml(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const body = doc.getElementsByTagName('w:body')[0]
  if (!body) throw new Error('这个 docx 里没有正文')
  const blocks: string[] = []
  const children = [...body.childNodes]
  for (const node of children) {
    if (!(node instanceof Element)) continue
    const tag = node.tagName.toLowerCase()
    if (tag === 'w:p') blocks.push(paragraphHtml(node))
    else if (tag === 'w:tbl') blocks.push(tableHtml(node))
  }
  const html = blocks.filter(Boolean).join('')
  if (!html.trim()) throw new Error('这个 docx 里没有可导入的文字')
  return sanitizeRichHtml(html)
}

function paragraphHtml(p: Element): string {
  const style = p.getElementsByTagName('w:pStyle')[0]?.getAttribute('w:val') || ''
  const text = runsText(p)
  if (!text.trim()) return ''
  const heading = /^heading(\d)$/i.exec(style)
  if (heading) {
    const level = Math.min(4, Math.max(2, Number(heading[1]) + 1))
    return `<h${level}>${escapeHtml(text)}</h${level}>`
  }
  return `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`
}

function runsText(root: Element): string {
  let out = ''
  const walk = (node: Node) => {
    if (!(node instanceof Element)) return
    const tag = node.tagName.toLowerCase()
    if (tag === 'w:t') {
      out += node.textContent || ''
      return
    }
    if (tag === 'w:tab') {
      out += '  '
      return
    }
    if (tag === 'w:br' || tag === 'w:cr') {
      out += '\n'
      return
    }
    for (const child of [...node.childNodes]) walk(child)
  }
  for (const child of [...root.childNodes]) walk(child)
  return out
}

function tableHtml(table: Element): string {
  const rows = [...table.getElementsByTagName('w:tr')]
  if (!rows.length) return ''
  const body = rows
    .map((row) => {
      const cells = [...row.getElementsByTagName('w:tc')].map((cell) => `<td>${escapeHtml(runsText(cell))}</td>`)
      return `<tr>${cells.join('')}</tr>`
    })
    .join('')
  return `<table><tbody>${body}</tbody></table>`
}

export async function handoutFromUploadFile(file: File): Promise<ImportedHandout> {
  const title = fileTitle(file.name)
  if (/\.(md|markdown)$/i.test(file.name)) {
    const html = markdownToDisplaySafeHtml(await file.text())
    if (!html.trim()) throw new Error(`「${file.name}」是空文件`)
    return { title, html }
  }
  if (/\.docx$/i.test(file.name)) {
    const xml = await readZipText(await file.arrayBuffer(), 'word/document.xml')
    return { title, html: docxXmlToHtml(xml) }
  }
  throw new Error('只支持 .docx 和 .md')
}
