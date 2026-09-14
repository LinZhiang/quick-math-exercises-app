import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
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

export async function exportHandoutMarkdown(title: string, content: string): Promise<void> {
  const blob = new Blob([content || ''], { type: 'text/markdown;charset=utf-8' })
  await saveExportedFile(blob, `${safeFileName(title)}.md`)
}

export async function exportHandoutDocx(title: string, html: string): Promise<void> {
  const heading = new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 240, before: 0, line: 360 },
    children: [
      new TextRun({
        text: title || '讲义',
        bold: true,
        font: 'SimHei',
        size: 40,
        color: '1E2937',
      }),
    ],
  })
  const body = html.trim()
    ? await htmlToDocxBlocks(html, { handout: true })
    : [new Paragraph({ children: [textRun('')] })]
  const doc = new Document({
    title: title || '讲义',
    creator: '学习App',
    styles: {
      default: {
        document: {
          run: { font: 'SimSun', size: 24, color: '334155' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: '210mm', height: '297mm' },
            margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
          },
        },
        children: [heading, ...body],
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  await saveExportedFile(blob, `${safeFileName(title)}.docx`)
}
