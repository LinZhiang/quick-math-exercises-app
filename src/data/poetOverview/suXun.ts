/** 宋朝·苏洵 */

import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'

export const SU_XUN_PROFILE: PoetOverviewProfile = {
  id: 'su-xun',
  name: '苏洵',
  dynasty: 'song',
  headline: '苏洵全人生阶段应试背诵整理',
  stages: [
    {
      title: '第一阶段：年少不学，中年发奋苦读（早年至二十七岁）',
      poems: [
        {
          title: '《六国论》',
          lines: ['六国破灭，非兵不利，战不善，弊在赂秦。'],
          place: '家中书斋',
          time: '白日伏案',
          note: '苏洵早年游荡不学，二十七岁方才幡然醒悟闭门苦读。此文借六国割地赂秦而灭亡的史实，劝谏北宋朝廷切勿对外一味退让求和，政论文逻辑缜密，考试经典古文篇目。',
        },
      ],
    },
    {
      title: '第二阶段：潜心治学，文章成名（二十七岁至入京前）',
      poems: [
        {
          title: '《送石昌言使北引》',
          lines: ['壮岁自精悍，晚年益有味。'],
          place: '四川眉山居所',
          weather: '秋日晴昼',
          note: '潜心钻研诸子与史书，文风老练犀利，擅长策论政论，不雕琢辞藻，侧重实用道理，后来携二子苏轼、苏辙一同赴京求取功名。',
        },
      ],
    },
    {
      title: '第三阶段：携二子入京，三苏名动京师，晚年留京治学',
      poems: [
        {
          title: '《管仲论》',
          lines: ['夫功之成，非成于成之日，盖必有所由起。'],
          place: '京城客舍',
          time: '暮春傍晚',
          note: '欧阳修赏识苏洵文章，三苏迅速轰动京城。苏洵不热衷科举，专心研究治国方略与史学，借古人史事剖析治国得失，以古鉴今。',
        },
      ],
    },
  ],
  mnemonic: {
    title: '配套精简串背口诀',
    lines: [
      '早年嬉游中年醒，六国赂秦论兴亡；',
      '入京父子三同显，史论锋芒震宋邦。',
    ],
  },
}
