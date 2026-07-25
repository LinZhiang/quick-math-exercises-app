/** 唐朝·崔颢：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const CUI_HAO_PROFILE: PoetOverviewProfile = {
  id: 'cui-hao',
  name: '崔颢',
  dynasty: 'tang',
  headline: '崔颢全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年轻薄，诗文浮华（青年漫游两京）',
      poems: [
        {
          title: '《长干行》',
          lines: ['君家何处住？妾住在横塘。'],
          place: '金陵江边渡口',
          weather: '夏日江上',
          note: '崔颢早年生活放浪，诗作多写男女情思，文笔细腻轻快，属于其早期代表作。',
        },
      ],
    },
    {
      title: '第二阶段：北游边塞，文风剧变（中年出塞游历）',
      poems: [
        {
          title: '《古游侠呈军中诸将》',
          lines: ['仗剑出门去，孤城逢合围。'],
          place: '北方边塞军营',
          weather: '秋日寒天',
          note: '远赴边塞亲眼见识沙场与戍卒生活，文风彻底褪去浮华，转向雄浑苍凉，为后世《黄鹤楼》积淀笔力。',
        },
      ],
    },
    {
      title: '第三阶段：登临黄鹤楼，铸就千古名篇，晚年归京（732之后）',
      poems: [
        {
          title: '《黄鹤楼》',
          lines: ['日暮乡关何处是？烟波江上使人愁。'],
          place: '武昌黄鹤楼江边',
          time: '黄昏日暮，江上起雾',
          note: '登临黄鹤楼触景生情，怀古又兼思乡，意境苍茫悠远，被后世推为唐代七律第一，诗词鉴赏必考篇目。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '长干渡口诉私情，北入边塞砺笔锋；',
      '黄鹤楼上烟波起，日暮乡愁万古同。',
    ],
  },
}
