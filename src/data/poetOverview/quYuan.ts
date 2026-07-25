/** 其他·屈原 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const QU_YUAN_PROFILE: PoetOverviewProfile = {
  id: 'qu-yuan',
  name: '屈原',
  dynasty: 'other',
  headline: '屈原全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年深受楚王信任，担任左徒，意气风发',
      poems: [
        {
          title: '《橘颂》',
          lines: ['后皇嘉树，橘徕服兮。', '受命不迁，生南国兮。'],
          place: '郢都',
          note: '托物言志，借橘树坚守故土抒发自身节操，屈原早期作品。',
        },
      ],
    },
    {
      title: '第二阶段：遭谗被疏，离开朝堂，开始漫游江汉',
      poems: [
        {
          title: '《九歌》（《湘夫人》《东皇太一》）',
          lines: ['袅袅兮秋风，洞庭波兮木叶下。'],
          place: '洞庭湖、沅湘流域',
          note: '祭祀神灵的抒情组诗，辞藻华美，情景交融，古典“秋景”经典意象源头。',
        },
      ],
    },
    {
      title: '第三阶段：再次流放，远走江南，忧愁愤懑达到顶峰',
      poems: [
        {
          title: '《离骚》',
          lines: [
            '路漫漫其修远兮，吾将上下而求索；',
            '亦余心之所善兮，虽九死其犹未悔。',
          ],
          place: '沅水、湘水漂泊途中',
          note: '中国最长政治抒情长诗；香草美人比兴手法考试高频。',
        },
      ],
    },
    {
      title: '第四阶段：秦破郢都，家国覆灭，投汨罗江殉国',
      poems: [
        {
          title: '《九章·怀沙》',
          lines: ['定心广志，余何畏惧兮。'],
          note: '绝笔篇章，悲愤沉郁。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '郢都得志又遭谗，九歌秋风洞庭寒；',
      '离骚求索传千古，身沉汨罗万古叹。',
    ],
  },
}
