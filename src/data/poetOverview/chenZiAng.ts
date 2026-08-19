/** 唐朝·陈子昂：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const CHEN_ZI_ANG_PROFILE: PoetOverviewProfile = {
  id: 'chen-zi-ang',
  name: '陈子昂',
  dynasty: 'tang',
  headline: '陈子昂全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年任侠，后发奋读书，进京求取功名',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['早年任侠，后发奋读书，进京求取功名。'],
          note: '为后续诗文革新主张奠定志向。',
        },
      ],
    },
    {
      title: '第二阶段：进士及第，上书论政，提倡诗歌革新',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['提倡诗歌革新，反对浮华齐梁诗风。'],
          note: '初唐诗文革新先驱，力扫浮靡。',
        },
      ],
    },
    {
      title: '第三阶段：随军北征塞外，登临古迹，名作诞生',
      poems: [
        {
          title: '《登幽州台歌》',
          lines: [
            '前不见古人，后不见来者。',
            '念天地之悠悠，独怆然而涕下！',
          ],
          place: '幽州蓟北楼',
          weather: '秋日',
          note: '初唐划时代名篇，怀古咏史，时空苍茫感，必考诗歌。',
        },
      ],
    },
    {
      title: '第四阶段：辞官返乡，遭地方权贵迫害，冤死狱中',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['辞官返乡，遭地方权贵迫害，冤死狱中。'],
          note: '结局悲凉，与其苍茫诗境形成对照。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '力扫浮靡倡古风，随军北上蓟门中；',
      '高台一望空今古，万古怆然陈子昂。',
    ],
  },
}
