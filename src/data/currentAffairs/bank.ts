/** 时政识记题库入口：分期正文用 glob 加载，材料不进公开仓库。 */

import {
  CURRENT_AFFAIRS_CATEGORIES,
  CURRENT_AFFAIRS_PERIODS,
  type CurrentAffairsArticle,
  type CurrentAffairsCategoryId,
  type CurrentAffairsPeriodId,
} from '@/utils/chinese/currentAffairsTypes'

const packed = import.meta.glob(['./*.ts', '!./bank.ts'], { eager: true })

function isArticle(value: unknown): value is CurrentAffairsArticle {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.id === 'string' && typeof row.periodId === 'string' && typeof row.category === 'string'
}

export const CURRENT_AFFAIRS_BANK: CurrentAffairsArticle[] = Object.values(packed).flatMap((mod) =>
  Object.entries(mod as Record<string, unknown>)
    .filter(([key, value]) => key.endsWith('_ARTICLES') && Array.isArray(value))
    .flatMap(([, value]) => (value as unknown[]).filter(isArticle)),
)

export function articlesForPeriod(
  periodId: CurrentAffairsPeriodId,
): CurrentAffairsArticle[] {
  return CURRENT_AFFAIRS_BANK.filter((a) => a.periodId === periodId)
}

export function articlesForPeriodCategory(
  periodId: CurrentAffairsPeriodId,
  category: CurrentAffairsCategoryId,
): CurrentAffairsArticle[] {
  return CURRENT_AFFAIRS_BANK.filter(
    (a) => a.periodId === periodId && a.category === category,
  )
}

export { CURRENT_AFFAIRS_CATEGORIES, CURRENT_AFFAIRS_PERIODS }
