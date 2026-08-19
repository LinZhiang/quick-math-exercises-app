/** 其他·曹操 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const CAO_CAO_PROFILE: PoetOverviewProfile = {
  id: 'cao-cao',
  name: '曹操',
  dynasty: 'other',
  headline: '曹操全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年仕途起伏，参与平定动乱，诗歌尚质朴',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['早年仕途起伏，诗歌尚质朴。'],
          note: '早期杂诗，传世名篇较少。',
        },
      ],
    },
    {
      title: '第二阶段：击败袁绍，北定中原，登临抒怀',
      poems: [
        {
          title: '《观沧海》',
          lines: [
            '东临碣石，以观沧海。',
            '日月之行，若出其中；星汉灿烂，若出其里。',
          ],
          place: '河北碣石山',
          weather: '秋日海滨',
          note: '借大海景象抒写宏大抱负，现存最早完整山水写景诗作之一。',
        },
      ],
    },
    {
      title: '第三阶段：年岁渐长，感慨时光流逝，求贤建业',
      poems: [
        {
          title: '《短歌行》',
          lines: [
            '对酒当歌，人生几何？譬如朝露，去日苦多；',
            '青青子衿，悠悠我心。',
          ],
          place: '北方军中酒宴',
          note: '四言诗巅峰，慷慨悲凉，典型建安风骨。',
        },
      ],
    },
    {
      title: '第四阶段：暮年，安定北方，壮志未已',
      poems: [
        {
          title: '《龟虽寿》',
          lines: ['老骥伏枥，志在千里；烈士暮年，壮心不已。'],
          note: '咏物抒怀，自强不息名句，常识、言语高频。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '碣石沧海揽星河，短歌把酒叹逝波；',
      '老马存怀千里志，建安风骨属孟德。',
    ],
  },
}
