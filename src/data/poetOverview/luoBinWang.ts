/** 唐朝·骆宾王：全人生阶段应试背诵整理（初唐四杰） */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const LUO_BIN_WANG_PROFILE: PoetOverviewProfile = {
  id: 'luo-bin-wang',
  name: '骆宾王',
  dynasty: 'tang',
  headline: '骆宾王全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年漂泊，仕途低微，生活困顿',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['早年漂泊，仕途低微，生活困顿。'],
          note: '早年经历坎坷，为后续托物言志积淀心境。',
        },
      ],
    },
    {
      title: '第二阶段：入朝短暂为官，遭诬陷入狱',
      poems: [
        {
          title: '《在狱咏蝉》',
          lines: ['露重飞难进，风多响易沉。', '无人信高洁，谁为表予心。'],
          place: '狱中',
          weather: '秋',
          note: '托物言志，以蝉自比，抒发蒙冤苦闷。',
        },
      ],
    },
    {
      title: '第三阶段：追随徐敬业起兵讨伐武则天，起草檄文',
      poems: [
        {
          title: '《代李敬业讨武曌檄》',
          lines: ['一抔之土未干，六尺之孤何托。'],
          note: '骈文名篇，相传武则天读后赞叹其才华。',
        },
      ],
    },
    {
      title: '第四阶段：兵败之后下落不明，不知所终',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['兵败之后下落不明，不知所终。'],
          note: '四杰中结局最为扑朔迷离。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '狱中咏蝉寄苦心，雄檄一纸震古今；',
      '随军兵败行踪杳，四杰才情骆宾王。',
    ],
  },
}
