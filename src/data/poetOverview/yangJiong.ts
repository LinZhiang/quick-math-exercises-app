/** 唐朝·杨炯：全人生阶段应试背诵整理（初唐四杰） */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const YANG_JIONG_PROFILE: PoetOverviewProfile = {
  id: 'yang-jiong',
  name: '杨炯',
  dynasty: 'tang',
  headline: '杨炯全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：幼举神童，入朝为官，意气风发',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['幼举神童，入朝为官，意气风发。'],
          note: '早期多宫廷应制诗，传世代表名句较少。',
        },
      ],
    },
    {
      title: '第二阶段：仕途受挫，心中愤懑，向往边塞建功',
      poems: [
        {
          title: '《从军行》',
          lines: ['烽火照西京，心中自不平。', '宁为百夫长，胜作一书生。'],
          place: '长安',
          note: '初唐边塞诗先驱，抒发投笔从戎壮志，四杰最常考诗作。',
        },
      ],
    },
    {
      title: '第三阶段：长期担任文职，辗转朝堂，诗风渐沉郁',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['长期担任文职，诗风渐趋沉郁。'],
          note: '多酬答咏怀篇目，应试以《从军行》为主。',
        },
      ],
    },
    {
      title: '第四阶段：受朝堂斗争牵连，贬官外放，卒于任上',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['贬官外放，卒于任上。'],
          note: '晚年诗文流传较少。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '幼登科第仕西京，不恋文墨慕远征；',
      '百夫长胜书生志，一首从军后世鸣。',
    ],
  },
}
