/** 其他·宋濂 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const SONG_LIAN_PROFILE: PoetOverviewProfile = {
  id: 'song-lian',
  name: '宋濂',
  dynasty: 'other',
  headline: '宋濂全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：元末家境贫寒，借书苦读，广游求学',
      poems: [
        {
          title: '《送东阳马生序》',
          lines: [
            '天大寒，砚冰坚，手指不可屈伸，弗之怠。',
            '以中有足乐者，不知口体之奉不若人也。',
          ],
          place: '求学路途',
          note: '劝学名篇，常考文言文。',
        },
      ],
    },
    {
      title: '第二阶段：受朱元璋征召，出任顾问，草拟朝廷文书',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['开国文臣，草拟朝廷文书。'],
          note: '大量庙堂应酬文章。',
        },
      ],
    },
    {
      title: '第三阶段：主持编撰《元史》，培养大批文人',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['主持编撰《元史》。'],
          note: '明代开国文臣之首。',
        },
      ],
    },
    {
      title: '第四阶段：受胡惟庸案牵连，流放途中离世',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['受牵连流放，途中离世。'],
          note: '结局凄凉。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '寒夜抄书志不移，东阳赠序劝勤学；',
      '开国文臣推宋濂，暮年迁谪路途凄。',
    ],
  },
}
