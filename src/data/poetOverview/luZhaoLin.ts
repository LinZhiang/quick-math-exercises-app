/** 唐朝·卢照邻：全人生阶段应试背诵整理（初唐四杰） */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const LU_ZHAO_LIN_PROFILE: PoetOverviewProfile = {
  id: 'lu-zhao-lin',
  name: '卢照邻',
  dynasty: 'tang',
  headline: '卢照邻全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：年少游学，游历各地，文名早显',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['年少游学，文名早显。'],
          note: '早年游历各地，为后续长篇歌行积淀文采。',
        },
      ],
    },
    {
      title: '第二阶段：供职王府，创作长篇歌行，文采震动一时',
      poems: [
        {
          title: '《长安古意》',
          lines: ['得成比目何辞死，愿作鸳鸯不羡仙。'],
          place: '长安',
          note: '长篇七言歌行，铺写长安繁华与世事变迁，名句广为考查。',
        },
      ],
    },
    {
      title: '第三阶段：身染重病，饱受病痛折磨，仕途断绝',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['身染重病，仕途断绝。'],
          note: '咏病抒怀诗作，基调悲苦。',
        },
      ],
    },
    {
      title: '第四阶段：不堪病痛折磨，自投颍水而亡',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['自投颍水而亡。'],
          note: '诗文多愁苦之音。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '长歌一曲咏长安，鸳鸯比目诉情欢；',
      '病魔缠身平生苦，失意悲吟泪不干。',
    ],
  },
}
