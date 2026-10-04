import {
  Document,
  Packer,
  Paragraph,
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
          paragraph: {
            spacing: { after: 0, before: 0, line: 276, lineRule: 'auto' },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: '210mm', height: '297mm' },
            margin: { top: '12mm', right: '16mm', bottom: '12mm', left: '16mm' },
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

export type HandoutFolderExportItem = {
  path: string[]
  title: string
  html: string
}

function commonPathPrefix(paths: string[][]): string[] {
  if (!paths.length) return []
  const first = paths[0] ?? []
  let n = first.length
  for (const path of paths) {
    let i = 0
    while (i < n && i < path.length && path[i] === first[i]) i += 1
    n = i
    if (!n) break
  }
  return first.slice(0, n)
}

function pathAfterPrefix(path: string[], prefix: string[]): string[] {
  const same = prefix.every((seg, i) => path[i] === seg)
  return same ? path.slice(prefix.length) : path
}

/** 进入新的子目录时，按层级补上尚未出现过的目录名。 */
function nestedFolderHeadings(prev: string[], next: string[]): string[] {
  for (let i = 0; i < next.length; i += 1) {
    if (prev[i] !== next[i]) return next.slice(i).filter(Boolean)
  }
  return []
}

function folderBannerParagraph(name: string, pageBreak: boolean): Paragraph {
  return new Paragraph({
    pageBreakBefore: pageBreak,
    spacing: { before: pageBreak ? 0 : 200, after: 160, line: 360 },
    children: [
      textRun(name, {
        bold: true,
        color: 'DC2626',
        size: 64,
        font: 'Microsoft YaHei',
      }),
    ],
  })
}

/** 多篇连在一起导出：不另加讲义名。非顶层下载目录的子文件夹，在该目录第一篇前加大号红标题。 */
export async function exportHandoutFolderDocx(title: string, items: HandoutFolderExportItem[]): Promise<void> {
  const list = items.filter((it) => it.html.trim() || it.title.trim())
  if (!list.length) throw new Error('没有可下载的讲义')
  const prefix = commonPathPrefix(list.map((it) => it.path))
  const children: FileChild[] = []
  let prevTail: string[] = []
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i]!
    const tail = pathAfterPrefix(item.path, prefix)
    const banners = nestedFolderHeadings(prevTail, tail)
    prevTail = tail
    let pageBroken = false
    for (const name of banners) {
      children.push(folderBannerParagraph(name, i > 0 && !pageBroken))
      if (i > 0) pageBroken = true
    }
    const html = item.html.trim()
    const body = html
      ? await htmlToDocxBlocks(html, { handout: true, pageBreakFirst: i > 0 && !pageBroken })
      : [
          new Paragraph({
            pageBreakBefore: i > 0 && !pageBroken,
            spacing: { before: 0, after: 80, line: 276 },
            children: [textRun('（本文暂无正文）')],
          }),
        ]
    children.push(...body)
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

/** 按目录顺序挑出勾选的讲义，仍走私密/未开放过滤。 */
export function pickHandoutExportRefs(
  nodes: CatalogExportNode[],
  ids: string[],
  isAdmin: boolean,
): CatalogExportRef[] {
  const want = new Set(ids)
  const out: CatalogExportRef[] = []
  for (const node of nodes) {
    for (const ref of collectHandoutExportRefs(node, isAdmin)) {
      if (want.has(ref.id)) out.push(ref)
    }
  }
  return out
}

export function batchHandoutExportTitle(refs: CatalogExportRef[]): string {
  if (refs.length === 1) return refs[0]?.title || '讲义'
  const root = refs[0]?.path[0]
  if (root && refs.every((ref) => ref.path[0] === root)) return root
  return '批量讲义'
}

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
