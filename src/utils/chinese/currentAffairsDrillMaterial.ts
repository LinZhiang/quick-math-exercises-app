/** 时政识记 · 按时段+栏目打包材料，供 AI 挖空命题 */

import { articlesForPeriodCategory } from '@/data/currentAffairs/bank'
import {
  CURRENT_AFFAIRS_CATEGORIES,
  CURRENT_AFFAIRS_PERIODS,
  type CurrentAffairsArticle,
  type CurrentAffairsCategoryId,
  type CurrentAffairsPeriodId,
} from '@/utils/chinese/currentAffairsTypes'

export type CurrentAffairsDrillScope = {
  periodId: CurrentAffairsPeriodId
  category: CurrentAffairsCategoryId
  periodLabel: string
  categoryLabel: string
  scopeLabel: string
  scopeKey: string
}

export function resolveCurrentAffairsDrillScope(
  periodId: CurrentAffairsPeriodId,
  category: CurrentAffairsCategoryId,
): CurrentAffairsDrillScope | null {
  const period = CURRENT_AFFAIRS_PERIODS.find((p) => p.id === periodId)
  const cat = CURRENT_AFFAIRS_CATEGORIES.find((c) => c.id === category)
  if (!period || !cat) return null
  const articles = articlesForPeriodCategory(periodId, category)
  if (!articles.length) return null
  return {
    periodId,
    category,
    periodLabel: period.title,
    categoryLabel: cat.title,
    scopeLabel: `${period.title}·${cat.title}`,
    scopeKey: `${periodId}-${category}`,
  }
}

function extractBoldSpans(text: string): string[] {
  const out: string[] = []
  const re = /\*\*(.+?)\*\*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const t = m[1]!.trim()
    if (t) out.push(t)
  }
  return out
}

function articleToMaterialBlock(a: CurrentAffairsArticle): string {
  const body = a.paragraphs.join('\n')
  const boldSpans = extractBoldSpans(body)
  const boldList = boldSpans.length
    ? boldSpans.map((x, i) => `${i + 1}. ${x}`).join('\n')
    : '（本文无加粗标记，可从全文挖核心术语）'
  return [
    `### 文章标题：${a.title}`,
    `材料标签：【${a.tag}】${a.date ? `；时间：${a.date}` : ''}`,
    `星级：${a.stars === 2 ? '★★' : '★'}`,
    '【加粗重点词/句一览】',
    boldList,
    '【全文（**加粗** 为重点考点）】',
    body,
  ].join('\n')
}

/** 供 DeepSeek 命题的材料正文 */
export function buildCurrentAffairsDrillMaterialText(
  scope: CurrentAffairsDrillScope,
): string {
  const articles = articlesForPeriodCategory(scope.periodId, scope.category)
  if (!articles.length) return ''
  return [
    `时段：${scope.periodLabel}；栏目：${scope.categoryLabel}`,
    '以下每篇文章独立成块；出题须写明出处文章标题。',
    '',
    ...articles.map(articleToMaterialBlock),
  ].join('\n\n')
}

export function listCurrentAffairsSourceTitles(
  scope: CurrentAffairsDrillScope,
): string[] {
  return articlesForPeriodCategory(scope.periodId, scope.category).map((a) => a.title)
}
