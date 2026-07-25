/** 其他·马致远 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const MA_ZHI_YUAN_PROFILE: PoetOverviewProfile = {
  id: 'ma-zhi-yuan',
  name: '马致远',
  dynasty: 'other',
  headline: '马致远全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：青年热衷仕途，奔走求仕，屡屡失意',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['求仕屡屡失意，散曲抒发怀才不遇。'],
          note: '早期抒怀散曲。',
        },
      ],
    },
    {
      title: '第二阶段：仕途无望，寄情山水，散曲名篇问世',
      poems: [
        {
          title: '《天净沙·秋思》',
          lines: [
            '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。',
            '夕阳西下，断肠人在天涯。',
          ],
          place: '旅途郊野',
          weather: '秋日黄昏',
          note: '“秋思之祖”，最短小精悍的元曲，必考篇目。',
        },
      ],
    },
    {
      title: '第三阶段：归隐田园，创作历史杂剧',
      poems: [
        {
          title: '《汉宫秋》',
          lines: ['不思量除是铁心肠；铁心肠也愁泪滴千行。'],
          place: '塞外',
          note: '昭君题材经典杂剧，借怀古抒发家国愁思。',
        },
      ],
    },
    {
      title: '第四阶段：晚年潜心修道，号“东篱”，看淡世事',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['号东篱，诗作冲淡。'],
          note: '曲状元，元曲四大家之一。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '求仕无成远路赊，西风瘦马走天涯；',
      '东篱一曲天净沙，秋思千古属马家。',
    ],
  },
}
