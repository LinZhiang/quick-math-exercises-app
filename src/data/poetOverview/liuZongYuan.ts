/** 唐朝·柳宗元：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/chinese/poetOverviewTypes'

export const LIU_ZONG_YUAN_PROFILE: PoetOverviewProfile = {
  id: 'liu-zong-yuan',
  name: '柳宗元',
  dynasty: 'tang',
  headline: '柳宗元全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：少年登科，参与永贞革新（793-805）',
      poems: [
        {
          title: '《渔翁》',
          lines: ['烟销日出不见人，欸乃一声山水绿。'],
          place: '长安近郊',
          time: '清晨日出',
          note: '柳宗元年少成名，积极参与政治革新，早年诗文兼具朝气与清雅，山水小诗意境空灵。',
        },
      ],
    },
    {
      title: '第二阶段：革新失败，贬谪永州十年（805-815，人生低谷）',
      poems: [
        {
          title: '《江雪》',
          lines: ['孤舟蓑笠翁，独钓寒江雪。'],
          place: '永州江上',
          weather: '隆冬大雪漫天',
          note: '永贞革新彻底失败，柳宗元被贬蛮荒永州，十年不得返京。以漫天冰雪、独钓老翁自比，孤寂傲骨，坚守本心，千古五言绝句，必考。',
        },
      ],
    },
    {
      title: '第三阶段：改贬柳州，教化一方，病逝任上（815-819）',
      poems: [
        {
          title: '《登柳州城楼寄漳汀封连四州刺史》',
          lines: ['惊风乱飐芙蓉水，密雨斜侵薜荔墙。'],
          place: '柳州城楼',
          weather: '夏日暴雨黄昏',
          note: '再贬柳州，虽依旧失意，却尽力教化当地百姓；风雨摧残花木，暗喻朝堂小人不断迫害革新一派，情景交融，情感沉郁。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '渔翁山水自空灵，永州寒雪守孤清；',
      '柳州楼上风雨骤，一代文宗困贬程。',
    ],
  },
}
