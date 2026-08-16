import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  type FileChild,
  type IRunOptions,
} from 'docx'
import { generatePersonalBankChoiceOptions } from '@/utils/personalBankChoiceAi'
import { bodyParagraph, htmlToDocxBlocks, htmlToInlineChildren, textRun } from '@/utils/personalBankDocxHtml'
import {
  personalBankQuestionTypeLabel,
  type PersonalBankCategory,
  type PersonalBankQuestion,
  type PersonalBankSubCategory,
} from '@/utils/personalQuestionBank'

export type PersonalBankExportSubKey = {
  categoryId: string
  subId: string
}

export type PersonalBankExportNode = {
  id: string
  label: string
  children?: PersonalBankExportNode[]
}

export type PersonalBankExportOptions = {
  includeAnswers: boolean
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const
const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function cnNum(n: number): string {
  const v = Math.floor(n)
  if (v <= 0) return '零'
  if (v <= 10) return CN_DIGITS[v] ?? String(v)
  if (v < 20) return `十${v === 10 ? '' : CN_DIGITS[v - 10]}`
  if (v < 100) {
    const tens = Math.floor(v / 10)
    const ones = v % 10
    return `${CN_DIGITS[tens]}十${ones ? CN_DIGITS[ones] : ''}`
  }
  return String(v)
}

export function buildPersonalBankExportTree(categories: PersonalBankCategory[]): PersonalBankExportNode[] {
  return categories.map((cat) => ({
    id: `cat:${cat.id}`,
    label: cat.name,
    children: cat.subs.map((sub) => ({
      id: subKey(cat.id, sub.id),
      label: `${sub.name}（${sub.questions.length} 题）`,
    })),
  }))
}

export function allPersonalBankExportLeafIds(categories: PersonalBankCategory[]): string[] {
  const ids: string[] = []
  for (const cat of categories) {
    for (const sub of cat.subs) ids.push(subKey(cat.id, sub.id))
  }
  return ids
}

export function parseExportLeafId(id: string): PersonalBankExportSubKey | null {
  const m = /^sub:([^:]+):(.+)$/.exec(id)
  if (!m) return null
  return { categoryId: m[1]!, subId: m[2]! }
}

function subKey(categoryId: string, subId: string): string {
  return `sub:${categoryId}:${subId}`
}

function collectSelected(
  categories: PersonalBankCategory[],
  leafIds: string[],
): Array<{ category: PersonalBankCategory; sub: PersonalBankSubCategory }> {
  const want = new Set(leafIds)
  const out: Array<{ category: PersonalBankCategory; sub: PersonalBankSubCategory }> = []
  for (const cat of categories) {
    for (const sub of cat.subs) {
      if (want.has(subKey(cat.id, sub.id))) out.push({ category: cat, sub })
    }
  }
  return out
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function stampName(): string {
  const d = new Date()
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function headingRun(text: string, size: number, extra: Omit<IRunOptions, 'text'> = {}): TextRun {
  return new TextRun({
    text,
    bold: true,
    font: 'SimHei',
    size,
    ...extra,
  })
}

function chapterHead(chapterIndex: number, name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 80, line: 360 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 16, color: '5BA8D8', space: 4 },
    },
    children: [headingRun(`第${cnNum(chapterIndex)}章　${name}`, 40)],
  })
}

function sectionHead(sectionIndex: number, name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 280, line: 360 },
    children: [headingRun(`第${cnNum(sectionIndex)}节　${name}`, 36)],
  })
}

type NumberedItem = {
  index: number
  q: PersonalBankQuestion
  choice?: { optionsHtml: string[]; correctIndex: number }
  categoryName: string
  subName: string
  chapterIndex: number
  sectionIndex: number
}

async function renderQuestion(item: NumberedItem): Promise<FileChild[]> {
  const { index, q, choice } = item
  const typeLabel = personalBankQuestionTypeLabel(q.type)
  const out: FileChild[] = [
    bodyParagraph(
      [
        textRun(`${index}. `, { bold: true }),
        textRun(q.title, { bold: true }),
        textRun(`　【${typeLabel}】${q.score} 分`, { color: '64748B', size: 21 }),
      ],
      { spacing: { after: 40, before: 160, line: 276 } },
    ),
    ...(await htmlToDocxBlocks(q.stemHtml)),
  ]
  if (q.type === 'choice' && choice) {
    for (let i = 0; i < choice.optionsHtml.length; i += 1) {
      const letter = OPTION_LETTERS[i] ?? String(i + 1)
      const inline = await htmlToInlineChildren(choice.optionsHtml[i] ?? '')
      out.push(
        bodyParagraph([textRun(`${letter}. `, { bold: true }), ...(inline.length ? inline : [textRun('')])], {
          indent: { left: 240 },
          spacing: { after: 40, before: 0, line: 240 },
        }),
      )
    }
  }
  return out
}

async function renderAnswer(item: NumberedItem): Promise<FileChild[]> {
  const { index, q, choice } = item
  const out: FileChild[] = [
    bodyParagraph([textRun(`${index}. `, { bold: true })], { spacing: { after: 40, before: 120, line: 240 } }),
  ]
  if (q.type === 'choice' && choice) {
    const ans = OPTION_LETTERS[choice.correctIndex] ?? String(choice.correctIndex + 1)
    out.push(bodyParagraph([textRun('答案：', { bold: true }), textRun(ans)], { spacing: { after: 40, before: 0, line: 240 } }))
  } else if (q.type === 'choice') {
    out.push(
      ...(await htmlToDocxBlocks(q.answerHtml || q.answer, {
        prefix: [textRun('答案：', { bold: true })],
      })),
    )
  } else {
    const answerInline = await htmlToInlineChildren(`<p>${escapeXml(q.answer)}</p>`)
    out.push(
      bodyParagraph([textRun('答案：', { bold: true }), ...(answerInline.length ? answerInline : [textRun(q.answer)])], {
        spacing: { after: 40, before: 0, line: 240 },
      }),
    )
  }
  if (q.explanationHtml.trim()) {
    out.push(
      ...(await htmlToDocxBlocks(q.explanationHtml, {
        prefix: [textRun('解析：', { bold: true })],
      })),
    )
  }
  return out
}

function escapeXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function appendGrouped(
  children: FileChild[],
  items: NumberedItem[],
  renderItem: (item: NumberedItem) => Promise<FileChild[]>,
) {
  let lastCat = ''
  let lastSub = ''
  for (const item of items) {
    if (item.categoryName !== lastCat) {
      children.push(chapterHead(item.chapterIndex, item.categoryName))
      lastCat = item.categoryName
      lastSub = ''
    }
    if (item.subName !== lastSub) {
      children.push(sectionHead(item.sectionIndex, item.subName))
      lastSub = item.subName
    }
    children.push(...(await renderItem(item)))
  }
}

export async function exportPersonalBankToWord(
  categories: PersonalBankCategory[],
  leafIds: string[],
  options: PersonalBankExportOptions = { includeAnswers: true },
  onProgress?: (text: string) => void,
): Promise<{ questionCount: number; filename: string }> {
  const includeAnswers = options.includeAnswers !== false
  const selected = collectSelected(categories, leafIds)
  if (!selected.length) throw new Error('请至少勾选一个小类')
  const questions: PersonalBankQuestion[] = selected.flatMap((row) => row.sub.questions)
  if (!questions.length) throw new Error('勾选范围内没有题目')

  const choiceQs = questions.filter((q) => q.type === 'choice')
  let choiceMap = new Map<string, { optionsHtml: string[]; correctIndex: number }>()
  if (choiceQs.length) {
    onProgress?.(`正在用豆包补全 ${choiceQs.length} 道选择题的干扰项…`)
    choiceMap = await generatePersonalBankChoiceOptions(choiceQs, 'doubao')
  }

  onProgress?.('正在生成 Word 文档…')
  const numbered: NumberedItem[] = []
  let index = 0
  let chapterIndex = 0
  let lastCat = ''
  let sectionIndex = 0
  for (const { category, sub } of selected) {
    if (category.name !== lastCat) {
      chapterIndex += 1
      lastCat = category.name
      sectionIndex = 0
    }
    sectionIndex += 1
    for (const q of sub.questions) {
      index += 1
      numbered.push({
        index,
        q,
        choice: q.type === 'choice' ? choiceMap.get(q.id) : undefined,
        categoryName: category.name,
        subName: sub.name,
        chapterIndex,
        sectionIndex,
      })
    }
  }

  const children: FileChild[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, before: 0 },
      children: [headingRun('个人题库', 48)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280, before: 0 },
      children: [
        textRun(
          `导出时间 ${new Date().toLocaleString('zh-CN')} · 共 ${questions.length} 题${includeAnswers ? ' · 含参考答案' : ' · 仅题目'}`,
          { color: '64748B', size: 21 },
        ),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240, before: 0 },
      children: [headingRun('试　题', 44)],
    }),
  ]
  await appendGrouped(children, numbered, renderQuestion)

  if (includeAnswers) {
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, before: 0 },
        children: [headingRun('参考答案', 44)],
      }),
    )
    await appendGrouped(children, numbered, renderAnswer)
  }

  const doc = new Document({
    title: '个人题库',
    creator: '学习App',
    styles: {
      default: {
        document: {
          run: { font: 'SimSun', size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: '210mm',
              height: '297mm',
            },
            margin: {
              top: '22mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm',
            },
          },
        },
        children,
      },
    ],
  })

  const filename = `个人题库-${stampName()}.docx`
  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, filename)
  return { questionCount: questions.length, filename }
}
