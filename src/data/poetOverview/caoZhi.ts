/** 其他·曹植 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const CAO_ZHI_PROFILE: PoetOverviewProfile = {
  id: 'cao-zhi',
  name: '曹植',
  dynasty: 'other',
  headline: '曹植全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：少年富有才华，深受曹操喜爱，意气昂扬',
      poems: [
        {
          title: '《白马篇》',
          lines: ['捐躯赴国难，视死忽如归。'],
          note: '游侠题材，意气风发，早年意气之作。',
        },
      ],
    },
    {
      title: '第二阶段：储位之争失败，曹丕登基，遭受猜忌打压',
      poems: [
        {
          title: '《洛神赋》',
          lines: ['翩若惊鸿，婉若游龙。', '荣曜秋菊，华茂春松。'],
          place: '途经洛水',
          note: '辞赋名篇，千古写美人典范。',
        },
      ],
    },
    {
      title: '第三阶段：多次迁徙封地，常年遭受监视，郁郁不得志',
      poems: [
        {
          title: '《赠白马王彪》',
          lines: ['丈夫志四海，万里犹比邻。'],
          note: '与兄弟离别抒愤，长篇抒情诗。',
        },
      ],
    },
    {
      title: '第四阶段：屡遭迁削，封地狭小，困居一隅，英年早逝',
      poems: [
        {
          title: '《七哀诗》',
          lines: ['明月照高楼，流光正徘徊。'],
          note: '凄清哀婉，抒发被禁锢的苦闷。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '白马少年有壮心，洛神翩影动古今；',
      '骨肉相残遭远徙，哀诗月下寄孤吟。',
    ],
  },
}
