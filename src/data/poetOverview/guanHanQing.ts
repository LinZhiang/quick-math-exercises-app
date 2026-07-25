/** 其他·关汉卿 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const GUAN_HAN_QING_PROFILE: PoetOverviewProfile = {
  id: 'guan-han-qing',
  name: '关汉卿',
  dynasty: 'other',
  headline: '关汉卿全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：长期定居大都，混迹市井，开始创作杂剧',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['混迹市井，熟悉底层百姓生活。'],
          note: '早期市井题材小杂剧，流传名句较少。',
        },
      ],
    },
    {
      title: '第二阶段：创作高峰，书写女性抗争题材',
      poems: [
        {
          title: '《窦娥冤》',
          lines: ['地也，你不分好歹何为地！', '天也，你错勘贤愚枉做天！'],
          place: '楚州',
          note: '控诉世道不公，元杂剧最经典台词，文史高频。',
        },
      ],
    },
    {
      title: '第三阶段：游历南方杭州等地，拓展创作题材',
      poems: [
        {
          title: '《救风尘》',
          lines: ['花有重开日，人无再少年。'],
          note: '刻画风尘女子智斗恶徒，语言通俗质朴。',
        },
      ],
    },
    {
      title: '第四阶段：晚年隐居，作品多散失',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['晚年隐居，大量剧本仅存篇目。'],
          note: '元曲四大家之首，杂剧奠基人。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '大都市井写悲欢，窦娥泣血动尘寰；',
      '元曲魁首关汉卿，杂剧千秋世代传。',
    ],
  },
}
