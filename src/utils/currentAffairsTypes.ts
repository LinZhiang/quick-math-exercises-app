/** 时政识记 · 类型 */

export type CurrentAffairsPeriodId = 'oct-early' | 'oct-late'

export type CurrentAffairsCategoryId = 'politics' | 'society'

/** 材料原标签：学习/文件/会议 → 政治；综合及其他 → 社会 */
export type CurrentAffairsSourceTag = '学习' | '文件' | '会议' | '综合'

export type CurrentAffairsPeriod = {
  id: CurrentAffairsPeriodId
  title: string
}

export type CurrentAffairsCategory = {
  id: CurrentAffairsCategoryId
  title: string
}

export type CurrentAffairsArticle = {
  id: string
  periodId: CurrentAffairsPeriodId
  category: CurrentAffairsCategoryId
  /** 材料原标签 */
  tag: CurrentAffairsSourceTag
  /** 星级（材料 ★ / ★★） */
  stars: 1 | 2
  title: string
  /** 时间信息，如 2025年10月1日 */
  date?: string
  /** 正文段落（可含 **加粗**） */
  paragraphs: string[]
}

export const CURRENT_AFFAIRS_PERIODS: CurrentAffairsPeriod[] = [
  { id: 'oct-early', title: '十月上' },
  { id: 'oct-late', title: '十月下' },
]

export const CURRENT_AFFAIRS_CATEGORIES: CurrentAffairsCategory[] = [
  { id: 'politics', title: '政治' },
  { id: 'society', title: '社会' },
]

export function parseCurrentAffairsBoldParts(
  line: string,
): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), bold: false })
    parts.push({ text: m[1]!, bold: true })
    last = m.index + m[0].length
  }
  if (last < line.length) parts.push({ text: line.slice(last), bold: false })
  return parts.length ? parts : [{ text: line, bold: false }]
}

export function currentAffairsStarsText(stars: 1 | 2): string {
  return stars === 2 ? '★★' : '★'
}
