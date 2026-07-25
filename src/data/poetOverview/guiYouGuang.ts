/** 其他·归有光 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const GUI_YOU_GUANG_PROFILE: PoetOverviewProfile = {
  id: 'gui-you-guang',
  name: '归有光',
  dynasty: 'other',
  headline: '归有光全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：久困科举，多次落第，在家乡讲学',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['久困科举，家乡讲学。'],
          note: '早期记事小品文。',
        },
      ],
    },
    {
      title: '第二阶段：居家追忆亲人，散文代表作成型',
      poems: [
        {
          title: '《项脊轩志》',
          lines: [
            '庭有枇杷树，吾妻死之年所手植也，今已亭亭如盖矣。',
          ],
          place: '昆山项脊轩',
          note: '借寻常景物寄托哀思，明代抒情散文巅峰，常考古文填空。',
        },
      ],
    },
    {
      title: '第三阶段：晚年终于考中进士，远赴浙江、河北为官',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['进士及第，外任为官。'],
          note: '公文、记游散文居多。',
        },
      ],
    },
    {
      title: '第四阶段：官至太仆寺丞，留京修书，不久病逝',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['官至太仆寺丞，不久病逝。'],
          note: '唐宋派散文代表，号震川。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '屡困科场守旧庐，轩中旧事忆妻孥；',
      '枇杷一树千秋句，震川散文韵味殊。',
    ],
  },
}
