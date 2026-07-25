/** 其他·龚自珍 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const GONG_ZI_ZHEN_PROFILE: PoetOverviewProfile = {
  id: 'gong-zi-zhen',
  name: '龚自珍',
  dynasty: 'other',
  headline: '龚自珍全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：年少博览群书，洞察社会危机，留心经世致用',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['洞察社会危机，留心经世致用。'],
          note: '近代启蒙先驱。',
        },
      ],
    },
    {
      title: '第二阶段：入朝为官，目睹朝政腐朽，壮志难伸，辞官南归',
      poems: [
        {
          title: '《己亥杂诗·其五》',
          lines: [
            '浩荡离愁白日斜，吟鞭东指即天涯。',
            '落红不是无情物，化作春泥更护花。',
          ],
          place: '京师城外',
          weather: '暮春黄昏',
          note: '公考常识、言语超级高频。',
        },
        {
          title: '《己亥杂诗·其二百二十》',
          lines: [
            '九州生气恃风雷，万马齐喑究可哀。',
            '我劝天公重抖擞，不拘一格降人材。',
          ],
          place: '旅途',
          note: '两组诗句均为公考常识、言语超级高频。',
        },
      ],
    },
    {
      title: '第三阶段：往返南北，讲学著书，呼吁社会变革',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['讲学著书，呼吁社会变革。'],
          note: '近代思想启蒙重要人物。',
        },
      ],
    },
    {
      title: '第四阶段：暴卒于丹阳，诗文汇编为《定盦文集》',
      poems: [
        {
          title: '（阶段概述）',
          lines: ['暴卒于丹阳。'],
          note: '号定盦。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '看透衰朝世事赊，离京挥鞭向天涯；',
      '风雷呐喊求贤才，落红春泥传万家。',
    ],
  },
}
