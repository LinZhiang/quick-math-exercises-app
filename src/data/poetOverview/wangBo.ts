/** 唐朝·王勃：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const WANG_BO_PROFILE: PoetOverviewProfile = {
  id: 'wang-bo',
  name: '王勃',
  dynasty: 'tang',
  headline: '王勃全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：天资神童，年少入朝（幼年至十六岁）',
      poems: [
        {
          title: '《送杜少府之任蜀州》',
          lines: ['海内存知己，天涯若比邻。'],
          place: '长安城外灞桥渡口',
          weather: '暮春晴日',
          note: '王勃年少聪颖，未及弱冠便入朝任职。一改传统送别诗伤感低沉，格局开阔大气，是千古送别名句，言语理解与诗词鉴赏高频考点。',
        },
      ],
    },
    {
      title: '第二阶段：因事被贬，南下蜀中（666-670）',
      poems: [
        {
          title: '《山中》',
          lines: ['况属高风晚，山山黄叶飞。'],
          place: '巴蜀山间',
          weather: '深秋黄昏',
          note: '因擅杀官奴被贬斥，被迫远离长安，漫游蜀地山林。秋风落叶烘托自身漂泊失意，情景交融，借秋景写贬谪落寞。',
        },
      ],
    },
    {
      title: '第三阶段：渡海探父，意外溺亡（676）',
      poems: [
        {
          title: '《滕王阁诗》',
          lines: ['阁中帝子今何在？槛外长江空自流。'],
          place: '江西滕王阁江畔',
          time: '秋日傍晚',
          note: '途经洪州写下千古名篇《滕王阁序》，收尾诗句感叹荣华转瞬即逝，唯有江水永恒；作完不久渡海赴交趾探望父亲，不幸落水惊悸而亡，人生骤然落幕。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '海内天涯别知己，巴山秋叶写愁思；',
      '滕王高阁叹兴废，江水东流少年辞。',
    ],
  },
}
