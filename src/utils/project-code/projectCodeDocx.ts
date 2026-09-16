import { Document, Packer, Paragraph, type FileChild } from 'docx'
import { htmlToDocxBlocks, textRun } from '@/utils/personal-bank/personalBankDocxHtml'
import { saveExportedFile } from '@/utils/markdown/handoutExport'
import { highlightProjectCode } from '@/utils/project-code/projectCodeHighlight'
import type { ProjectCodeFile } from '@/utils/project-code/projectCodeApi'

function safeFileName(title: string): string {
  const name = String(title || '源码').replace(/[\\/:*?"<>|]+/g, '_').trim() || '源码'
  return name.slice(0, 80)
}

function esc(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fileHtml(file: ProjectCodeFile): string {
  const title = esc(file.name || '源码')
  const addr = esc(file.path || file.name)
  const code = highlightProjectCode(file.content || '')
  return `<p><strong>${title}</strong></p><p>文件地址：${addr}</p><pre class="hl-code"><code>${code}</code></pre>`
}

function codeDoc(title: string, children: FileChild[]): Document {
  return new Document({
    title: title || '源码',
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

/** 多文件合成一份 Word：每个源文件另起一页，页首写文件名和路径。 */
export async function exportProjectCodeDocx(
  title: string,
  files: ProjectCodeFile[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const list = files.filter((f) => f.name || f.path || f.content)
  if (!list.length) throw new Error('没有可下载的源码')
  const children: FileChild[] = []
  for (let i = 0; i < list.length; i += 1) {
    onProgress?.(i, list.length)
    await Promise.resolve()
    const html = fileHtml(list[i]!)
    const body = html.trim()
      ? await htmlToDocxBlocks(html, { handout: true, pageBreakFirst: i > 0 })
      : [
          new Paragraph({
            pageBreakBefore: i > 0,
            spacing: { before: 0, after: 80, line: 276 },
            children: [textRun('（空文件）')],
          }),
        ]
    children.push(...body)
  }
  onProgress?.(list.length, list.length)
  const blob = await Packer.toBlob(codeDoc(title, children))
  await saveExportedFile(blob, `${safeFileName(title)}.docx`)
}
