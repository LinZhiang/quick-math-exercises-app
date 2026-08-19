/** 其他·谢灵运 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const XIE_LING_YUN_PROFILE: PoetOverviewProfile = {
  id: 'xie-ling-yun',
  name: '谢灵运',
  dynasty: 'other',
  headline: '谢灵运全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：出身名门，年少有才，袭封康乐公，生活优渥',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['出身名门，袭封康乐公。'],
          note: '早期咏怀诗作。',
        },
      ],
    },
    {
      title: '第二阶段：仕途失意，外放永嘉，纵情山水',
      poems: [
        {
          title: '《登池上楼》',
          lines: ['池塘生春草，园柳变鸣禽。'],
          place: '浙江永嘉郡',
          weather: '初春',
          note: '山水诗标志性名句，自然景物细致描摹。',
        },
      ],
    },
    {
      title: '第三阶段：四处游历浙闽名山，不断发掘山水景致',
      poems: [
        {
          title: '《游名山志》相关山水诗篇',
          lines: ['大规模专门描摹山水景色，开创山水诗派。'],
          note: '第一个大规模专门描摹山水景色的诗人，开创山水诗派。',
        },
      ],
    },
    {
      title: '第四阶段：卷入政治斗争，遭流放，最终被杀',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['遭流放，最终被杀。'],
          note: '后期诗篇多寄寓苦闷。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '永嘉官闲向远岑，池塘春草诵至今；',
      '山水诗宗灵运始，踏遍烟霞写幽林。',
    ],
  },
}
