/** 其他·陶渊明 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const TAO_YUAN_MING_PROFILE: PoetOverviewProfile = {
  id: 'tao-yuan-ming',
  name: '陶渊明',
  dynasty: 'other',
  headline: '陶渊明全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年多次出仕，辗转担任低级官吏，心存矛盾',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['早年多次出仕，心存矛盾。'],
          note: '早期行役诗。',
        },
      ],
    },
    {
      title: '第二阶段：出任彭泽令，不愿为五斗米折腰，辞官归隐',
      poems: [
        {
          title: '《归去来兮辞》',
          lines: [
            '悟已往之不谏，知来者之可追；',
            '实迷途其未远，觉今是而昨非。',
          ],
          place: '彭泽，归途浔阳',
          note: '宣告和官场决裂，归隐宣言。',
        },
      ],
    },
    {
      title: '第三阶段：归园田居前期，安居田园，悠然自得',
      poems: [
        {
          title: '《归园田居·其一》《饮酒·其五》',
          lines: [
            '采菊东篱下，悠然见南山；',
            '久在樊笼里，复得返自然。',
          ],
          place: '浔阳柴桑田园',
          note: '田园诗最高频篇目，隐逸意象标杆。',
        },
      ],
    },
    {
      title: '第四阶段：晚年家境贫寒，饥寒交迫，依旧坚守隐居之志',
      poems: [
        {
          title: '《桃花源记》《读山海经·其十》',
          lines: ['刑天舞干戚，猛志固常在。'],
          note: '不止恬淡隐逸，暗藏不屈壮志，极易作为出题陷阱。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '五斗难羁靖节身，东篱菊影避风尘；',
      '桃源一梦寄理想，刑天诗里见雄神。',
    ],
  },
}
