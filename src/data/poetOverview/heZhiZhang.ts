/** 唐朝·贺知章：全人生阶段应试背诵整理 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const HE_ZHI_ZHANG_PROFILE: PoetOverviewProfile = {
  id: 'he-zhi-zhang',
  name: '贺知章',
  dynasty: 'tang',
  headline: '贺知章全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：早年求学，江南隐居（青年至中年）',
      poems: [
        {
          title: '《咏柳》',
          lines: ['碧玉妆成一树高，万条垂下绿丝绦。'],
          place: '浙江越州乡间',
          weather: '早春晴昼',
          note: '贺知章早年隐居江南，性情闲适旷达。以碧玉、绿丝喻杨柳，比喻精妙通俗，从小到公考言语长期考查。',
        },
      ],
    },
    {
      title: '第二阶段：久居长安，身居高位（695-744）',
      poems: [
        {
          title: '《采莲曲》',
          lines: ['稽云雾里辨仙源，南国佳人倚棹喧。'],
          place: '长安宫廷诗会',
          time: '春日午后',
          note: '高中进士后在长安为官数十年，深得唐玄宗信任，为人豁达放浪，与李白相交甚厚。宫廷诗文字清丽，尽显从容心境。',
        },
      ],
    },
    {
      title: '第三阶段：辞官还乡，晚年归越（744归乡不久离世）',
      poems: [
        {
          title: '《回乡偶书·其一》',
          lines: ['少小离家老大回，乡音无改鬓毛衰。'],
          place: '越州家乡村口',
          time: '白日晴和',
          note: '八十余岁辞官回到阔别数十年的故乡，乡音依旧、容貌已衰，写出物是人非的沧桑感，思乡归乡题材必考诗句。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '碧玉杨柳江南春，长安为官自安身；',
      '乡音未改容颜老，一阕偶书动古今。',
    ],
  },
}
