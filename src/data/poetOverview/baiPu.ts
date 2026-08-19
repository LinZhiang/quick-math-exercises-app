/** 其他·白朴（元曲四大家，精简） */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const BAI_PU_PROFILE: PoetOverviewProfile = {
  id: 'bai-pu',
  name: '白朴',
  dynasty: 'other',
  headline: '白朴应试背诵整理',
  stages: [
    {
      title: '元曲代表作',
      poems: [
        {
          title: '《梧桐雨》',
          lines: ['天长地久有时尽，此恨绵绵无绝期。'],
          note: '化用，剧中经典唱词，写离愁。',
        },
        {
          title: '《墙头马上》',
          lines: ['一似佳人月下摇，花影重重映画桥。'],
          note: '爱情题材杂剧，情辞柔婉。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: ['梧桐夜雨写离愁，墙头马上诉情柔。'],
  },
}
