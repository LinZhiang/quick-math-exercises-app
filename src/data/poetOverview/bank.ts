/** 诗人速览题库入口：按朝代汇总，后续新增诗人在此登记 */

import { BAI_JU_YI_PROFILE } from '@/data/poetOverview/baiJuYi'
import { BAI_PU_PROFILE } from '@/data/poetOverview/baiPu'
import { CAO_CAO_PROFILE } from '@/data/poetOverview/caoCao'
import { CAO_XUE_QIN_PROFILE } from '@/data/poetOverview/caoXueQin'
import { CAO_ZHI_PROFILE } from '@/data/poetOverview/caoZhi'
import { CEN_SHEN_PROFILE } from '@/data/poetOverview/cenShen'
import { CHEN_ZI_ANG_PROFILE } from '@/data/poetOverview/chenZiAng'
import { CUI_HAO_PROFILE } from '@/data/poetOverview/cuiHao'
import { DU_FU_PROFILE } from '@/data/poetOverview/duFu'
import { DU_MU_PROFILE } from '@/data/poetOverview/duMu'
import { FANG_BAO_PROFILE } from '@/data/poetOverview/fangBao'
import { GAO_SHI_PROFILE } from '@/data/poetOverview/gaoShi'
import { GONG_ZI_ZHEN_PROFILE } from '@/data/poetOverview/gongZiZhen'
import { GUAN_HAN_QING_PROFILE } from '@/data/poetOverview/guanHanQing'
import { GUI_YOU_GUANG_PROFILE } from '@/data/poetOverview/guiYouGuang'
import { HAN_YU_PROFILE } from '@/data/poetOverview/hanYu'
import { HE_ZHI_ZHANG_PROFILE } from '@/data/poetOverview/heZhiZhang'
import { LI_BAI_PROFILE } from '@/data/poetOverview/liBai'
import { LI_SHANG_YIN_PROFILE } from '@/data/poetOverview/liShangYin'
import { LI_YU_PROFILE } from '@/data/poetOverview/liYu'
import { LIU_YU_XI_PROFILE } from '@/data/poetOverview/liuYuXi'
import { LIU_ZONG_YUAN_PROFILE } from '@/data/poetOverview/liuZongYuan'
import { LU_ZHAO_LIN_PROFILE } from '@/data/poetOverview/luZhaoLin'
import { LUO_BIN_WANG_PROFILE } from '@/data/poetOverview/luoBinWang'
import { MA_ZHI_YUAN_PROFILE } from '@/data/poetOverview/maZhiYuan'
import { MENG_HAO_RAN_PROFILE } from '@/data/poetOverview/mengHaoRan'
import { QU_YUAN_PROFILE } from '@/data/poetOverview/quYuan'
import { SONG_LIAN_PROFILE } from '@/data/poetOverview/songLian'
import { TAO_YUAN_MING_PROFILE } from '@/data/poetOverview/taoYuanMing'
import { WANG_BO_PROFILE } from '@/data/poetOverview/wangBo'
import { WANG_CHANG_LING_PROFILE } from '@/data/poetOverview/wangChangLing'
import { WANG_WEI_PROFILE } from '@/data/poetOverview/wangWei'
import { WANG_ZHI_HUAN_PROFILE } from '@/data/poetOverview/wangZhiHuan'
import { XIE_LING_YUN_PROFILE } from '@/data/poetOverview/xieLingYun'
import { YANG_JIONG_PROFILE } from '@/data/poetOverview/yangJiong'
import { YAO_NAI_PROFILE } from '@/data/poetOverview/yaoNai'
import { YUEFU_CLASSICS_PROFILE } from '@/data/poetOverview/yuefuClassics'
import { ZHENG_GUANG_ZU_PROFILE } from '@/data/poetOverview/zhengGuangZu'
import { LI_QING_ZHAO_PROFILE } from '@/data/poetOverview/liQingZhao'
import { LIU_YONG_PROFILE } from '@/data/poetOverview/liuYong'
import { LU_YOU_PROFILE } from '@/data/poetOverview/luYou'
import { OU_YANG_XIU_PROFILE } from '@/data/poetOverview/ouYangXiu'
import { SU_SHI_PROFILE } from '@/data/poetOverview/suShi'
import { SU_XUN_PROFILE } from '@/data/poetOverview/suXun'
import { SU_ZHE_PROFILE } from '@/data/poetOverview/suZhe'
import { WANG_AN_SHI_PROFILE } from '@/data/poetOverview/wangAnShi'
import { WEN_TIAN_XIANG_PROFILE } from '@/data/poetOverview/wenTianXiang'
import { XIN_QI_JI_PROFILE } from '@/data/poetOverview/xinQiJi'
import { YAN_SHU_PROFILE } from '@/data/poetOverview/yanShu'
import { ZENG_GONG_PROFILE } from '@/data/poetOverview/zengGong'
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

export const POET_OVERVIEW_BANK: PoetOverviewProfile[] = [
  // 唐朝
  WANG_BO_PROFILE,
  YANG_JIONG_PROFILE,
  LU_ZHAO_LIN_PROFILE,
  LUO_BIN_WANG_PROFILE,
  CHEN_ZI_ANG_PROFILE,
  HE_ZHI_ZHANG_PROFILE,
  WANG_ZHI_HUAN_PROFILE,
  CUI_HAO_PROFILE,
  WANG_CHANG_LING_PROFILE,
  GAO_SHI_PROFILE,
  CEN_SHEN_PROFILE,
  MENG_HAO_RAN_PROFILE,
  WANG_WEI_PROFILE,
  LI_BAI_PROFILE,
  DU_FU_PROFILE,
  BAI_JU_YI_PROFILE,
  LIU_YU_XI_PROFILE,
  HAN_YU_PROFILE,
  LIU_ZONG_YUAN_PROFILE,
  DU_MU_PROFILE,
  LI_SHANG_YIN_PROFILE,
  // 宋朝（时间线）
  LIU_YONG_PROFILE,
  YAN_SHU_PROFILE,
  OU_YANG_XIU_PROFILE,
  SU_XUN_PROFILE,
  ZENG_GONG_PROFILE,
  WANG_AN_SHI_PROFILE,
  SU_SHI_PROFILE,
  SU_ZHE_PROFILE,
  LI_QING_ZHAO_PROFILE,
  LU_YOU_PROFILE,
  XIN_QI_JI_PROFILE,
  WEN_TIAN_XIANG_PROFILE,
  // 其他：先秦—清
  QU_YUAN_PROFILE,
  CAO_CAO_PROFILE,
  CAO_ZHI_PROFILE,
  TAO_YUAN_MING_PROFILE,
  XIE_LING_YUN_PROFILE,
  YUEFU_CLASSICS_PROFILE,
  LI_YU_PROFILE,
  GUAN_HAN_QING_PROFILE,
  MA_ZHI_YUAN_PROFILE,
  BAI_PU_PROFILE,
  ZHENG_GUANG_ZU_PROFILE,
  SONG_LIAN_PROFILE,
  GUI_YOU_GUANG_PROFILE,
  FANG_BAO_PROFILE,
  YAO_NAI_PROFILE,
  CAO_XUE_QIN_PROFILE,
  GONG_ZI_ZHEN_PROFILE,
]

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
