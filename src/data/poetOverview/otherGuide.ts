/** 其他（先秦—清）诗人速览·总览与分期 */

export type OtherPeriodId = 'overview' | 'pre' | 'wudai' | 'yuan' | 'ming' | 'qing'

export const OTHER_PERIODS: { id: OtherPeriodId; title: string }[] = [
  { id: 'overview', title: '总览' },
  { id: 'pre', title: '先秦' },
  { id: 'wudai', title: '五代' },
  { id: 'yuan', title: '元' },
  { id: 'ming', title: '明' },
  { id: 'qing', title: '清' },
]

/** 各分期文人顺序 */
export const OTHER_PERIOD_POET_IDS: Record<
  Exclude<OtherPeriodId, 'overview'>,
  readonly string[]
> = {
  pre: [
    'qu-yuan',
    'cao-cao',
    'cao-zhi',
    'tao-yuan-ming',
    'xie-ling-yun',
    'yuefu-classics',
  ],
  wudai: ['li-yu'],
  yuan: ['guan-han-qing', 'ma-zhi-yuan', 'bai-pu', 'zheng-guang-zu'],
  ming: ['song-lian', 'gui-you-guang'],
  qing: ['gong-zi-zhen', 'cao-xue-qin', 'fang-bao', 'yao-nai'],
}

export type OtherGuidePoetBrief = {
  poetId: string
  name: string
  badge?: string
  life?: string
  works?: string
  exam?: string
  blurb?: string
}

export type OtherGuideGroup = {
  id: string
  period: Exclude<OtherPeriodId, 'overview'>
  title: string
  common?: string
  poets: OtherGuidePoetBrief[]
}

export const OTHER_GUIDE_GROUPS: OtherGuideGroup[] = [
  {
    id: 'pre-core',
    period: 'pre',
    title: '一、先秦两汉魏晋：诗词向高频文人',
    common: '无思想主张专项，聚焦名篇名句与人生脉络。',
    poets: [
      {
        poetId: 'qu-yuan',
        name: '屈原',
        badge: '楚辞开创者',
        life: '得志左徒→遭谗漫游→再放江南→投汨罗殉国',
        works: '《橘颂》《九歌》《离骚》《怀沙》',
        exam: '香草美人比兴；“路漫漫其修远兮”超高频。',
      },
      {
        poetId: 'cao-cao',
        name: '曹操',
        badge: '建安风骨',
        life: '平乱→北定中原→求贤建业→暮年壮心',
        works: '《观沧海》《短歌行》《龟虽寿》',
        exam: '建安风骨；“老骥伏枥”常识高频。',
      },
      {
        poetId: 'cao-zhi',
        name: '曹植',
        badge: '建安代表',
        life: '少年得宠→储位失败→迁徙监视→英年早逝',
        works: '《白马篇》《洛神赋》《赠白马王彪》《七哀诗》',
        exam: '《洛神赋》写美人典范。',
      },
      {
        poetId: 'tao-yuan-ming',
        name: '陶渊明',
        badge: '田园诗鼻祖',
        life: '多次出仕→不为五斗米折腰→归园田居→贫寒守志',
        works: '《归去来兮辞》《饮酒》《桃花源记》',
        exam: '东篱采菊；“刑天舞干戚”易作隐逸陷阱题。',
      },
      {
        poetId: 'xie-ling-yun',
        name: '谢灵运',
        badge: '山水诗开创者',
        life: '名门康乐公→外放永嘉→游历浙闽→遭杀害',
        works: '《登池上楼》',
        exam: '“池塘生春草”，山水诗标志名句。',
      },
      {
        poetId: 'yuefu-classics',
        name: '乐府名篇',
        badge: '无固定归属',
        blurb:
          '《孔雀东南飞》《木兰诗》《长歌行》《陌上桑》——常考诗句汇总。',
      },
    ],
  },
  {
    id: 'wudai-liyu',
    period: 'wudai',
    title: '二、五代：李煜（南唐后主）',
    common: '五代词人，勿归入唐宋常规诗人序列；前期宫廷艳词→后期亡国悲词。',
    poets: [
      {
        poetId: 'li-yu',
        name: '李煜',
        badge: '南唐后主',
        life: '皇子寄情书画→君主苟安→国破被俘→赐死',
        works: '《虞美人》《相见欢》《浪淘沙令》',
        exam: '“一江春水向东流”；王国维《人间词话》常作拓展。',
      },
    ],
  },
  {
    id: 'yuan-core',
    period: 'yuan',
    title: '三、元代：元曲四大家',
    common: '杂剧与散曲并重；牢记关、马、白、郑。',
    poets: [
      {
        poetId: 'guan-han-qing',
        name: '关汉卿',
        badge: '元曲四大家之首',
        works: '《窦娥冤》《救风尘》',
        exam: '“地也……天也……”控诉台词高频。',
      },
      {
        poetId: 'ma-zhi-yuan',
        name: '马致远',
        badge: '曲状元',
        works: '《天净沙·秋思》《汉宫秋》',
        exam: '“秋思之祖”，元曲最高频篇目。',
      },
      {
        poetId: 'bai-pu',
        name: '白朴',
        blurb: '《梧桐雨》《墙头马上》——离愁与情辞柔婉。',
      },
      {
        poetId: 'zheng-guang-zu',
        name: '郑光祖',
        blurb: '《倩女离魂》——四大家中郑德辉。',
      },
    ],
  },
  {
    id: 'ming-prose',
    period: 'ming',
    title: '四、明代：散文核心',
    common: '唐宋派与开国文臣，文言文填空常考。',
    poets: [
      {
        poetId: 'song-lian',
        name: '宋濂',
        badge: '开国文臣之首',
        works: '《送东阳马生序》',
        exam: '劝学名篇，寒夜抄书细节常考。',
      },
      {
        poetId: 'gui-you-guang',
        name: '归有光',
        badge: '唐宋派',
        works: '《项脊轩志》',
        exam: '枇杷树“亭亭如盖”抒情散文巅峰。',
      },
    ],
  },
  {
    id: 'qing-core',
    period: 'qing',
    title: '五、清代：启蒙·红楼·桐城',
    common: '龚自珍诗句、红楼诗词、桐城派古文为三大板块。',
    poets: [
      {
        poetId: 'gong-zi-zhen',
        name: '龚自珍',
        badge: '近代启蒙先驱',
        works: '《己亥杂诗》两组',
        exam: '落红春泥；不拘一格降人材——双高频。',
      },
      {
        poetId: 'cao-xue-qin',
        name: '曹雪芹',
        badge: '《红楼梦》',
        works: '《葬花吟》《临江仙·柳絮》',
        exam: '红楼诗词名句识记。',
      },
      {
        poetId: 'fang-bao',
        name: '方苞',
        badge: '桐城派鼻祖',
        works: '《狱中杂记》',
        exam: '义法论文，桐城开山。',
      },
      {
        poetId: 'yao-nai',
        name: '姚鼐',
        badge: '桐城派集大成',
        works: '《登泰山记》',
        exam: '雪后登泰，清代游记必考。',
      },
    ],
  },
]

export const OTHER_CHEAT_SHEET: string[] = [
  '先秦魏晋：屈原楚辞、建安三曹、陶渊明田园、谢灵运山水、乐府名篇',
  '五代提醒：李煜＝南唐后主＝五代词人，勿归唐宋',
  '元曲重点：马致远《天净沙·秋思》（最高频）、关汉卿《窦娥冤》；牢记元曲四大家',
  '明代散文：宋濂《送东阳马生序》、归有光《项脊轩志》',
  '清代板块：龚自珍《己亥杂诗》两组；姚鼐《登泰山记》；红楼诗词名句',
]

export function otherPeriodOfPoet(
  poetId: string,
): Exclude<OtherPeriodId, 'overview'> | null {
  for (const [period, ids] of Object.entries(OTHER_PERIOD_POET_IDS) as [
    Exclude<OtherPeriodId, 'overview'>,
    readonly string[],
  ][]) {
    if (ids.includes(poetId)) return period
  }
  return null
}
