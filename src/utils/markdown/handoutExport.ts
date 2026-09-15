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

/** 多篇连在一起导出：不另加标题/目录。上一篇结束后换页，不插空白页。 */
export async function exportHandoutFolderDocx(title: string, items: HandoutFolderExportItem[]): Promise<void> {
  const list = items.filter((it) => it.html.trim() || it.title.trim())
  if (!list.length) throw new Error('没有可下载的讲义')
  const children: FileChild[] = []
  for (let i = 0; i < list.length; i += 1) {
    const html = list[i]?.html.trim() ?? ''
    const body = html
      ? await htmlToDocxBlocks(html, { handout: true, pageBreakFirst: i > 0 })
      : [
          new Paragraph({
            pageBreakBefore: i > 0,
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
