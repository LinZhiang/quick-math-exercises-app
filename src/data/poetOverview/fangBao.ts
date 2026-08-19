/** 其他·方苞 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const FANG_BAO_PROFILE: PoetOverviewProfile = {
  id: 'fang-bao',
  name: '方苞',
  dynasty: 'other',
  headline: '方苞全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：潜心经学，研习古文，奠定文论基础',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['潜心经学，奠定文论基础。'],
          note: '桐城派鼻祖。',
        },
      ],
    },
    {
      title: '第二阶段：受文字狱牵连入狱',
      poems: [
        {
          title: '《狱中杂记》',
          lines: ['凡死刑狱上，行刑者先俟于门外。'],
          note: '记录监狱黑暗现实，桐城派典范古文。',
        },
      ],
    },
    {
      title: '第三阶段：获释之后入值南书房，大力倡导桐城派文论',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['入值南书房，倡导桐城派文论。'],
          note: '义法论文开桐城。',
        },
      ],
    },
    {
      title: '第四阶段：晚年辞官归乡，整理文稿',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['辞官归乡，整理文稿。'],
          note: '洁雅文风垂后世。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '身陷囹圄记狱情，义法论文开桐城；',
      '洁雅文风垂后世，方苞笔墨重清庭。',
    ],
  },
}
