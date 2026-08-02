/** 时政识记题库入口 */

import { OCT_EARLY_ARTICLES } from '@/data/currentAffairs/octEarly'
import { OCT_LATE_ARTICLES } from '@/data/currentAffairs/octLate'
import {
  CURRENT_AFFAIRS_CATEGORIES,
  CURRENT_AFFAIRS_PERIODS,
  type CurrentAffairsArticle,
  type CurrentAffairsCategoryId,
  type CurrentAffairsPeriodId,
} from '@/utils/currentAffairsTypes'

export const CURRENT_AFFAIRS_BANK: CurrentAffairsArticle[] = [
  ...OCT_EARLY_ARTICLES,
  ...OCT_LATE_ARTICLES,
]

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
