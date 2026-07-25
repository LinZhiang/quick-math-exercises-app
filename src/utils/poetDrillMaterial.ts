/** 识记·诗词模块：按分期打包应试材料，供 AI 命题 */

import type { PoetOverviewDynastyId } from '@/constants/chinese-practice-tabs'
import {
  poetsForOtherPeriod,
  poetsForSongPeriod,
  poetsForTangPeriod,
} from '@/data/poetOverview/bank'
import {
  OTHER_GUIDE_GROUPS,
  OTHER_PERIODS,
  type OtherPeriodId,
} from '@/data/poetOverview/otherGuide'
import {
  SONG_GUIDE_GROUPS,
  SONG_PERIODS,
  type SongPeriodId,
} from '@/data/poetOverview/songGuide'
import {
  TANG_GUIDE_GROUPS,
  TANG_PERIODS,
  type TangPeriodId,
} from '@/data/poetOverview/tangGuide'
import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export type PoetDrillScope = {
  dynasty: PoetOverviewDynastyId
  /** 不含 overview */
  period: string
  periodLabel: string
  scopeKey: string
}

export function resolvePoetDrillScope(
  dynasty: PoetOverviewDynastyId,
  period: string,
): PoetDrillScope | null {
  if (period === 'overview') return null
  if (dynasty === 'tang') {
    const p = period as Exclude<TangPeriodId, 'overview'>
    const title = TANG_PERIODS.find((x) => x.id === p)?.title
    if (!title || !(p in { early: 1, high: 1, mid: 1, late: 1 })) return null
    return {
      dynasty,
      period: p,
      periodLabel: `唐朝·${title}`,
      scopeKey: `tang-${p}`,
    }
  }
  if (dynasty === 'song') {
    const p = period as Exclude<SongPeriodId, 'overview'>
    const title = SONG_PERIODS.find((x) => x.id === p)?.title
    if (!title || !(p in { northern: 1, southern: 1 })) return null
    return {
      dynasty,
      period: p,
      periodLabel: `宋朝·${title}`,
      scopeKey: `song-${p}`,
    }
  }
  const p = period as Exclude<OtherPeriodId, 'overview'>
  const title = OTHER_PERIODS.find((x) => x.id === p)?.title
  if (!title) return null
  return {
    dynasty,
    period: p,
    periodLabel: `其他·${title}`,
    scopeKey: `other-${p}`,
  }
}

export function poetsForDrillScope(scope: PoetDrillScope): PoetOverviewProfile[] {
  if (scope.dynasty === 'tang') {
    return poetsForTangPeriod(scope.period as Exclude<TangPeriodId, 'overview'>)
  }
  if (scope.dynasty === 'song') {
    return poetsForSongPeriod(scope.period as Exclude<SongPeriodId, 'overview'>)
  }
  return poetsForOtherPeriod(scope.period as Exclude<OtherPeriodId, 'overview'>)
}

function profileToMaterial(p: PoetOverviewProfile): string {
  const blocks: string[] = [`### ${p.name}`, p.headline]
  for (const stage of p.stages) {
    blocks.push(`【${stage.title}】`)
    for (const poem of stage.poems) {
      const meta = [poem.place, poem.time, poem.weather].filter(Boolean).join('；')
      blocks.push(
        `${poem.title}\n名句：${poem.lines.join(' / ')}${meta ? `\n背景标签：${meta}` : ''}\n注释：${poem.note}`,
      )
    }
  }
  if (p.mnemonic) {
    blocks.push(
      `${p.mnemonic.title}\n${p.mnemonic.lines.map((l) => l.replace(/\*\*/g, '')).join('\n')}`,
    )
  }
  return blocks.join('\n')
}

function guideCommonForScope(scope: PoetDrillScope): string {
  if (scope.dynasty === 'tang') {
    return TANG_GUIDE_GROUPS.filter((g) => g.period === scope.period)
      .map((g) => `${g.title}${g.common ? `：${g.common}` : ''}`)
      .join('\n')
  }
  if (scope.dynasty === 'song') {
    return SONG_GUIDE_GROUPS.filter((g) => g.period === scope.period)
      .map((g) => `${g.title}${g.common ? `：${g.common}` : ''}`)
      .join('\n')
  }
  return OTHER_GUIDE_GROUPS.filter((g) => g.period === scope.period)
    .map((g) => `${g.title}${g.common ? `：${g.common}` : ''}`)
    .join('\n')
}

/** 供 DeepSeek 命题的材料正文（控制长度） */
export function buildPoetDrillMaterialText(scope: PoetDrillScope): string {
  const poets = poetsForDrillScope(scope)
  if (!poets.length) return ''
  const guide = guideCommonForScope(scope)
  const body = poets.map(profileToMaterial).join('\n\n---\n\n')
  const raw = [
    `【考查范围】${scope.periodLabel}`,
    guide ? `【分期总述】\n${guide}` : '',
    `【诗人详解材料】\n${body}`,
  ]
    .filter(Boolean)
    .join('\n\n')
  // 防止超长 prompt
  return raw.length > 14000 ? `${raw.slice(0, 14000)}\n…（材料已截断）` : raw
}
