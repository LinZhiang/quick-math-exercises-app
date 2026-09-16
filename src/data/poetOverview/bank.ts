/** 诗人速览题库入口：本机档案用 glob 加载，正文不进公开仓库。 */

import {
  OTHER_PERIOD_POET_IDS,
  type OtherPeriodId,
} from '@/data/poetOverview/otherGuide'
import {
  SONG_PERIOD_POET_IDS,
  type SongPeriodId,
} from '@/data/poetOverview/songGuide'
import {
  TANG_PERIOD_POET_IDS,
  type TangPeriodId,
} from '@/data/poetOverview/tangGuide'
import {
  listPoetsByDynasty,
  type PoetOverviewProfile,
} from '@/utils/chinese/poetOverviewTypes'
import type { PoetOverviewDynastyId } from '@/constants/chinese-practice-tabs'

const packed = import.meta.glob(['./*.ts', '!./bank.ts'], { eager: true })

function isProfile(value: unknown): value is PoetOverviewProfile {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.dynasty === 'string' &&
    Array.isArray(row.stages)
  )
}

const DYNASTY_ORDER: PoetOverviewDynastyId[] = ['tang', 'song', 'other']

export const POET_OVERVIEW_BANK: PoetOverviewProfile[] = Object.values(packed)
  .flatMap((mod) => Object.values(mod as Record<string, unknown>))
  .filter(isProfile)
  .sort((a, b) => {
    const da = DYNASTY_ORDER.indexOf(a.dynasty)
    const db = DYNASTY_ORDER.indexOf(b.dynasty)
    if (da !== db) return da - db
    return a.name.localeCompare(b.name, 'zh')
  })

export function poetsForDynasty(dynasty: PoetOverviewDynastyId): PoetOverviewProfile[] {
  return listPoetsByDynasty(POET_OVERVIEW_BANK, dynasty)
}

export function poetsForTangPeriod(
  period: Exclude<TangPeriodId, 'overview'>,
): PoetOverviewProfile[] {
  const ids = TANG_PERIOD_POET_IDS[period]
  return ids
    .map((id) => POET_OVERVIEW_BANK.find((p) => p.id === id))
    .filter((p): p is PoetOverviewProfile => !!p)
}

export function poetsForOtherPeriod(
  period: Exclude<OtherPeriodId, 'overview'>,
): PoetOverviewProfile[] {
  const ids = OTHER_PERIOD_POET_IDS[period]
  return ids
    .map((id) => POET_OVERVIEW_BANK.find((p) => p.id === id))
    .filter((p): p is PoetOverviewProfile => !!p)
}

export function poetsForSongPeriod(
  period: Exclude<SongPeriodId, 'overview'>,
): PoetOverviewProfile[] {
  const ids = SONG_PERIOD_POET_IDS[period]
  return ids
    .map((id) => POET_OVERVIEW_BANK.find((p) => p.id === id))
    .filter((p): p is PoetOverviewProfile => !!p)
}

export function findPoetById(id: string): PoetOverviewProfile | undefined {
  return POET_OVERVIEW_BANK.find((p) => p.id === id)
}
