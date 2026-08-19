/** 唐朝·韩愈：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const HAN_YU_PROFILE: PoetOverviewProfile = {
  id: 'han-yu',
  name: '韩愈',
  dynasty: 'tang',
  headline: '韩愈全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：幼年孤苦，刻苦求学（早年漂泊）',
      poems: [
        {
          title: '《调张籍》',
          lines: ['蚍蜉撼大树，可笑不自量。'],
          place: '长安书斋',
          time: '白日',
          note: '韩愈父母早亡，由兄长嫂嫂抚养长大，苦读成才。此句用来嘲讽世人妄议李白杜甫，后世广泛用来比喻不自量力，常识高频成语诗句。',
        },
      ],
    },
    {
      title: '第二阶段：入朝为官，直言遭贬（819谏迎佛骨被贬潮州）',
      poems: [
        {
          title: '《左迁至蓝关示侄孙湘》',
          lines: ['云横秦岭家何在？雪拥蓝关马不前。'],
          place: '秦岭蓝关古道',
          weather: '寒冬大雪',
          note: '上书劝谏唐宪宗不要供奉佛骨，触怒帝王，被贬遥远潮州。大雪阻路，前路迷茫，家国、仕途双重失意，是韩愈一生最悲情诗作。',
        },
      ],
    },
    {
      title: '第三阶段：重返朝堂，推动古文运动，晚年高位（820-824）',
      poems: [
        {
          title: '《早春呈水部张十八员外》',
          lines: ['天街小雨润如酥，草色遥看近却无。'],
          place: '长安天街',
          weather: '初春细雨清晨',
          note: '回京后身居要职，大力推动古文运动，摒弃浮华骈文。小诗描摹京城早春淡景，细腻传神，言语意境辨析常考。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '蚍蜉撼树护李杜，蓝关风雪断归途；',
      '长安小雨描春色，古文开道一代儒。',
    ],
  },
}
