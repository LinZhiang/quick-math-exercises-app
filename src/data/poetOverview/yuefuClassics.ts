/** 其他·乐府名篇（无固定单人归属） */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const YUEFU_CLASSICS_PROFILE: PoetOverviewProfile = {
  id: 'yuefu-classics',
  name: '乐府名篇',
  dynasty: 'other',
  headline: '乐府名篇常考诗句汇总',
  stages: [
    {
      title: '汉乐府叙事与抒情名篇',
      poems: [
        {
          title: '《孔雀东南飞》',
          lines: ['孔雀东南飞，五里一徘徊。'],
          note: '中国古代最长叙事诗之一，忠贞爱情与封建礼教冲突。',
        },
        {
          title: '《木兰诗》',
          lines: [
            '万里赴戎机，关山度若飞；',
            '朔气传金柝，寒光照铁衣。',
          ],
          note: '北朝乐府，替父从军，边塞行军描写高频。',
        },
        {
          title: '《长歌行》',
          lines: ['少壮不努力，老大徒伤悲。'],
          note: '劝学励志名句，常识超高频。',
        },
        {
          title: '《陌上桑》',
          lines: ['日出东南隅，照我秦氏楼。'],
          note: '罗敷拒使君，乐府叙事经典开篇。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '孔雀徘徊木兰飞，长歌伤悲劝少时；',
      '陌上罗敷拒使君，乐府名篇要记牢。',
    ],
  },
}
