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

/** 从材料中提取可考诗人名、篇目名，供命题后校验「不得超纲」 */
export function extractPoetDrillAllowlist(material: string): {
  poets: string[]
  titles: string[]
  compact: string
} {
  const poets: string[] = []
  const titles: string[] = []
  for (const line of material.split(/\r?\n/)) {
    const h = line.match(/^###\s*(.+)\s*$/)
    if (h?.[1]) poets.push(h[1].trim())
    const t = line.trim()
    if (
      t &&
      !t.startsWith('【') &&
      !t.startsWith('名句') &&
      !t.startsWith('注释') &&
      !t.startsWith('背景') &&
      !t.startsWith('###') &&
      !t.startsWith('—') &&
      !t.includes('：') === false &&
      t.length >= 2 &&
      t.length <= 24 &&
      !/考查范围|分期总述|诗人详解/.test(t)
    ) {
      if (!/^[甲乙丙丁]/.test(t) && !/小时|分钟/.test(t)) {
        titles.push(t)
      }
    }
  }
  const compact = normalizePoetText(material)
  return {
    poets: [...new Set(poets)],
    titles: [...new Set(titles)],
    compact,
  }
}

function normalizePoetText(s: string): string {
  return s.replace(/\s+/g, '').replace(/[，。！？、；：:""''「」『』《》【】（）()·\-—_/\\]/g, '')
}

/** 题目是否仍落在材料封闭范围内（宽松：正确作者/诗句须在材料；term 尽量在材料） */
export function poetDrillQuestionInMaterial(
  q: { questionType: string; term: string; stem: string; options: string[]; correctIndex: number },
  allow: { poets: string[]; titles: string[]; compact: string },
): boolean {
  const stemCompact = normalizePoetText(q.stem)
  const correct = (q.options[q.correctIndex] ?? '').trim()
  const correctCompact = normalizePoetText(correct)

  const inCompact = (s: string) => {
    const c = normalizePoetText(s)
    return c.length >= 2 && allow.compact.includes(c)
  }

  const stemInMaterial = (() => {
    if (!stemCompact) return false
    if (allow.compact.includes(stemCompact)) return true
    for (const n of [12, 10, 8, 6]) {
      if (stemCompact.length >= n && allow.compact.includes(stemCompact.slice(0, n))) return true
    }
    return false
  })()

  if (q.questionType === 'verse-to-author') {
    const authorOk = allow.poets.includes(correct) || inCompact(correct)
    if (!authorOk) return false
    if (!stemInMaterial) return false
    return true
  }

  if (q.questionType === 'author-to-verse') {
    if (correctCompact.length >= 4) {
      const hit =
        allow.compact.includes(correctCompact) ||
        allow.compact.includes(correctCompact.slice(0, Math.min(10, correctCompact.length)))
      if (!hit) return false
    }
    return true
  }

  if (q.questionType === 'verse-to-background') {
    return stemInMaterial
  }

  if (q.questionType === 'poet-fact') {
    const term = q.term.trim()
    if (term && (allow.poets.includes(term) || inCompact(term))) return true
    if (allow.poets.some((p) => q.stem.includes(p))) return true
    return allow.poets.some((p) => allow.compact.includes(normalizePoetText(p)) && q.stem.length > 0)
  }

  return true
}
