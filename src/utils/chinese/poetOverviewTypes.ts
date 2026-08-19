/** 诗人速览·数据结构（后续诗人严格按此格式录入） */

import type { PoetOverviewDynastyId } from '@/constants/chinese-practice-tabs'

export type PoetOverviewPoemMeta = {
  /** 地点 */
  place?: string
  /** 时间 */
  time?: string
  /** 天气 */
  weather?: string
}

export type PoetOverviewPoem = PoetOverviewPoemMeta & {
  /** 篇目，如《上李邕》 */
  title: string
  /** 须背诵的名句（可多行） */
  lines: string[]
  /** 注释 */
  note: string
}

export type PoetOverviewStage = {
  /** 阶段标题，如「第一阶段：大鹏初心｜蜀中少年立志（701-724）」 */
  title: string
  poems: PoetOverviewPoem[]
}

export type PoetOverviewMnemonic = {
  /** 如「精简串背口诀（附带篇目）」 */
  title: string
  /** 口诀行（可含 **加粗** 名句标记，展示时解析） */
  lines: string[]
}

export type PoetOverviewProfile = {
  id: string
  name: string
  dynasty: PoetOverviewDynastyId
  /** 总标题，如「李白全人生阶段应试背诵整理」 */
  headline: string
  stages: PoetOverviewStage[]
  mnemonic?: PoetOverviewMnemonic
}

export function listPoetsByDynasty(
  bank: PoetOverviewProfile[],
  dynasty: PoetOverviewDynastyId,
): PoetOverviewProfile[] {
  return bank.filter((p) => p.dynasty === dynasty)
}
