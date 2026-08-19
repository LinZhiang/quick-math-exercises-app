/** 时政识记题库入口 */

import { DEC_EARLY_ARTICLES } from '@/data/currentAffairs/decEarly'
import { DEC_LATE_ARTICLES } from '@/data/currentAffairs/decLate'
import { NOV_EARLY_ARTICLES } from '@/data/currentAffairs/novEarly'
import { NOV_LATE_ARTICLES } from '@/data/currentAffairs/novLate'
import { OCT_EARLY_ARTICLES } from '@/data/currentAffairs/octEarly'
import { OCT_LATE_ARTICLES } from '@/data/currentAffairs/octLate'
import {
  CURRENT_AFFAIRS_CATEGORIES,
  CURRENT_AFFAIRS_PERIODS,
  type CurrentAffairsArticle,
  type CurrentAffairsCategoryId,
  type CurrentAffairsPeriodId,
} from '@/utils/chinese/currentAffairsTypes'

export const CURRENT_AFFAIRS_BANK: CurrentAffairsArticle[] = [
  ...OCT_EARLY_ARTICLES,
  ...OCT_LATE_ARTICLES,
  ...NOV_EARLY_ARTICLES,
  ...NOV_LATE_ARTICLES,
  ...DEC_EARLY_ARTICLES,
  ...DEC_LATE_ARTICLES,
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
