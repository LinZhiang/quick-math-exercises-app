/** 其他·曹雪芹 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const CAO_XUE_QIN_PROFILE: PoetOverviewProfile = {
  id: 'cao-xue-qin',
  name: '曹雪芹',
  dynasty: 'other',
  headline: '曹雪芹全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：幼年出身江宁织造豪门，锦衣玉食',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['出身江宁织造豪门。'],
          note: '幼年锦衣玉食。',
        },
      ],
    },
    {
      title: '第二阶段：家族遭抄，家道骤然败落，迁居北京',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['家道败落，开始构思长篇小说。'],
          note: '迁居北京。',
        },
      ],
    },
    {
      title: '第三阶段：贫居西山，举家食粥，潜心创作《红楼梦》',
      poems: [
        {
          title: '《葬花吟》',
          lines: [
            '花谢花飞花满天，红消香断有谁怜？',
            '一朝春尽红颜老，花落人亡两不知。',
          ],
          note: '红楼诗词最高频之一。',
        },
        {
          title: '《临江仙·柳絮》',
          lines: ['好风凭借力，送我上青云。'],
          note: '红楼诗词高频名句。',
        },
      ],
    },
    {
      title: '第四阶段：书稿尚未完稿，贫病而逝',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['贫病而逝，后四十回由后人续补。'],
          note: '千古文坛第一流。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '昔日豪门转瞬休，西山食粥写红楼；',
      '葬花一曲催人泪，千古文坛第一流。',
    ],
  },
}
