import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  type FileChild,
} from 'docx'
import { htmlToDocxBlocks, textRun } from '@/utils/personal-bank/personalBankDocxHtml'

function safeFileName(title: string): string {
  const name = String(title || '讲义').replace(/[\\/:*?"<>|]+/g, '_').trim() || '讲义'
  return name.slice(0, 80)
}

export async function saveExportedFile(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
  }
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: filename })
      return
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

function handoutDoc(title: string, children: FileChild[]): Document {
  return new Document({
    title: title || '讲义',
    creator: '学习App',
    styles: {
      default: {
        document: {
          run: { font: 'Microsoft YaHei', size: 24, color: '334155' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: '210mm', height: '297mm' },
            margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
          },
        },
        children,
      },
    ],
  })
}

async function saveDocx(title: string, children: FileChild[]): Promise<void> {
  const blob = await Packer.toBlob(handoutDoc(title, children))
  await saveExportedFile(blob, `${safeFileName(title)}.docx`)
}

export async function exportHandoutMarkdown(title: string, content: string): Promise<void> {
  const blob = new Blob([content || ''], { type: 'text/markdown;charset=utf-8' })
  await saveExportedFile(blob, `${safeFileName(title)}.md`)
}

export async function exportHandoutDocx(title: string, html: string): Promise<void> {
  const body = html.trim()
    ? await htmlToDocxBlocks(html, { handout: true })
    : [new Paragraph({ children: [textRun('')] })]
  await saveDocx(title, body)
}

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
] as const

const HEADING_SIZE = [40, 36, 28, 26, 24, 24]

function headingLevel(depth: number) {
  return HEADING_LEVELS[Math.max(0, Math.min(depth, 5))]
}

function headingParagraph(text: string, depth: number, pageBreak = false): Paragraph {
  const level = Math.max(0, Math.min(depth, 5))
  return new Paragraph({
    heading: headingLevel(depth),
    pageBreakBefore: pageBreak,
    spacing: { before: level === 0 ? 80 : 280, after: 120, line: 360 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: 'Microsoft YaHei',
        size: HEADING_SIZE[level],
        color: '1E2937',
      }),
    ],
  })
}

function tocLine(text: string, indent: number): Paragraph {
  return new Paragraph({
    spacing: { after: 40, before: 0, line: 360 },
    indent: { left: indent * 280 },
    children: [
      new TextRun({
        text,
        font: 'Microsoft YaHei',
        size: 22,
        color: '334155',
      }),
    ],
  })
}

export type HandoutFolderExportItem = {
  path: string[]
  title: string
  html: string
}

/** 文件夹导出：文首带目录，正文按分类层级排讲义。 */
export async function exportHandoutFolderDocx(title: string, items: HandoutFolderExportItem[]): Promise<void> {
  const list = items.filter((it) => it.title.trim())
  if (!list.length) throw new Error('没有可下载的讲义')
  const children: FileChild[] = [headingParagraph('目录', 0)]
  const seenPath = new Set<string>()
  for (const item of list) {
    for (let i = 0; i < item.path.length; i += 1) {
      const key = item.path.slice(0, i + 1).join('\0')
      if (seenPath.has(key)) continue
      seenPath.add(key)
      children.push(tocLine(item.path[i] || '分类', i))
    }
    children.push(tocLine(item.title, item.path.length))
  }
  let lastPath: string[] = []
  let firstBody = true
  for (const item of list) {
    const path = item.path.filter(Boolean)
    let same = 0
    while (same < path.length && same < lastPath.length && path[same] === lastPath[same]) same += 1
    for (let i = same; i < path.length; i += 1) {
      children.push(headingParagraph(path[i] || '分类', i, firstBody))
      firstBody = false
    }
    children.push(headingParagraph(item.title, Math.min(path.length, 5), firstBody))
    firstBody = false
    const body = item.html.trim()
      ? await htmlToDocxBlocks(item.html, { handout: true })
      : [new Paragraph({ children: [textRun('（本文暂无正文）')] })]
    children.push(...body)
    lastPath = path
  }
  await saveDocx(title, children)
}

export type CatalogExportNode = {
  name: string
  private?: boolean
  children: CatalogExportNode[]
  entries: { id: string; title: string; ready: boolean; private?: boolean }[]
}

export type CatalogExportRef = { id: string; title: string; path: string[] }

/** 收集可导出讲义；非管理员跳过私密分类/讲义和未开放条目。 */
export function collectHandoutExportRefs(
  node: CatalogExportNode,
  isAdmin: boolean,
  inheritedPrivate = false,
  path: string[] = [],
): CatalogExportRef[] {
  const locked = inheritedPrivate || Boolean(node.private)
  if (locked && !isAdmin) return []
  const here = [...path, node.name]
  const out: CatalogExportRef[] = []
  for (const child of node.children || []) {
    out.push(...collectHandoutExportRefs(child, isAdmin, locked, here))
  }
  for (const entry of node.entries || []) {
    if (!isAdmin && (locked || Boolean(entry.private) || !entry.ready)) continue
    out.push({ id: entry.id, title: entry.title, path: here })
  }
  return out
}
