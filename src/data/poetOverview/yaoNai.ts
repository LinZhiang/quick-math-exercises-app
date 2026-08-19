/** 其他·姚鼐 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const YAO_NAI_PROFILE: PoetOverviewProfile = {
  id: 'yao-nai',
  name: '姚鼐',
  dynasty: 'other',
  headline: '姚鼐全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：进士及第，任职翰林院',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['进士及第，任职翰林院。'],
          note: '桐城派集大成者。',
        },
      ],
    },
    {
      title: '第二阶段：辞官后主讲各地书院，编纂古文选本',
      poems: [
        {
          title: '《登泰山记》',
          lines: [
            '苍山负雪，明烛天南；',
            '道中迷雾冰滑，磴几不可登。',
          ],
          place: '泰山',
          weather: '冬日雪后',
          note: '清代游记散文必考篇目。',
        },
      ],
    },
    {
      title: '第三阶段：完善桐城派“义理、考据、辞章”理论',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['义理、考据、辞章融为一体。'],
          note: '桐城文脉继方宗。',
        },
      ],
    },
    {
      title: '第四阶段：长期讲学，培养众多文人',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['长期讲学，振儒风。'],
          note: '字姬传。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '雪后登临望泰峰，桐城文脉继方宗；',
      '义理辞章融一体，姬传讲学振儒风。',
    ],
  },
}
