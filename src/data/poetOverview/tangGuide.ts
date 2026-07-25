/** 唐朝诗人速览·总览与分期（应试分层） */

export type TangPeriodId = 'overview' | 'early' | 'high' | 'mid' | 'late'

export const TANG_PERIODS: { id: TangPeriodId; title: string }[] = [
  { id: 'overview', title: '总览' },
  { id: 'early', title: '初唐' },
  { id: 'high', title: '盛唐' },
  { id: 'mid', title: '中唐' },
  { id: 'late', title: '晚唐' },
]

/** 各分期诗人顺序（时间线 / 阵营顺序） */
export const TANG_PERIOD_POET_IDS: Record<Exclude<TangPeriodId, 'overview'>, readonly string[]> = {
  early: [
    'wang-bo',
    'yang-jiong',
    'lu-zhao-lin',
    'luo-bin-wang',
    'chen-zi-ang',
    'he-zhi-zhang',
  ],
  high: [
    'wang-zhi-huan',
    'cui-hao',
    'wang-chang-ling',
    'gao-shi',
    'cen-shen',
    'meng-hao-ran',
    'wang-wei',
    'li-bai',
    'du-fu',
  ],
  mid: ['bai-ju-yi', 'liu-yu-xi', 'han-yu', 'liu-zong-yuan'],
  late: ['du-mu', 'li-shang-yin'],
}

export type TangGuidePoetBrief = {
  poetId: string
  name: string
  /** 如「四杰之首」「诗佛」 */
  badge?: string
  life?: string
  works?: string
  exam?: string
  /** 无详细字段时的短评 */
  blurb?: string
}

export type TangGuideGroup = {
  id: string
  period: Exclude<TangPeriodId, 'overview'>
  title: string
  common?: string
  poets: TangGuidePoetBrief[]
}

export const TANG_GUIDE_GROUPS: TangGuideGroup[] = [
  {
    id: 'early-core',
    period: 'early',
    title: '一、初唐核心：初唐四杰 + 陈子昂',
    common:
      '摆脱齐梁浮华靡丽文风，扩大诗歌题材，推动五言、七言歌行发展，为盛唐诗歌铺路；陈子昂进一步高举复古革新大旗。',
    poets: [
      {
        poetId: 'wang-bo',
        name: '王勃',
        badge: '四杰之首',
        life: '少年神童→仕途受挫漫游巴蜀→渡海探父溺水早逝',
        works: '《送杜少府之任蜀州》《滕王阁序》',
        exam: '“海内存知己”开阔送别意境；骈文名篇，名句高频考查。',
      },
      {
        poetId: 'yang-jiong',
        name: '杨炯',
        life: '幼举神童，长期文职，渴望沙场建功，后遭牵连贬官。',
        works: '《从军行》',
        exam: '“宁为百夫长，胜作一书生”，初唐早期边塞诗代表。',
      },
      {
        poetId: 'lu-zhao-lin',
        name: '卢照邻',
        life: '早年游学，创作兴盛；后重病缠身，一生愁苦。',
        works: '《长安古意》',
        exam: '“得成比目何辞死，愿作鸳鸯不羡仙”，七言歌行典范。',
      },
      {
        poetId: 'luo-bin-wang',
        name: '骆宾王',
        life: '仕途低微，蒙冤入狱；追随徐敬业起兵。',
        works: '《在狱咏蝉》《代李敬业讨武曌檄》',
        exam: '咏蝉托物言志；檄文名句识记。',
      },
      {
        poetId: 'chen-zi-ang',
        name: '陈子昂',
        badge: '初唐诗歌革新旗手',
        life: '早年任侠，中年随军北征；晚年受构陷，冤死狱中。',
        works: '《登幽州台歌》',
        exam: '怀古抒怀，苍茫时空感；主张恢复汉魏风骨，反对绮丽诗风。',
      },
    ],
  },
  {
    id: 'high-frontier',
    period: 'high',
    title: '二、盛唐边塞阵营：王昌龄、高适、岑参、王之涣、崔颢',
    common: '亲历边塞，诗作兼具报国壮志、征人乡愁、异域风光。',
    poets: [
      {
        poetId: 'wang-zhi-huan',
        name: '王之涣',
        blurb: '精品少而流传极广。《登鹳雀楼》寓理写景；《凉州词》边塞乡愁名作。',
      },
      {
        poetId: 'cui-hao',
        name: '崔颢',
        blurb: '《黄鹤楼》被誉为七律第一；怀古兼思乡。',
      },
      {
        poetId: 'wang-chang-ling',
        name: '王昌龄',
        blurb: '七绝圣手。两大题材：边塞诗、送别诗；《芙蓉楼送辛渐》冰心玉壶为经典意象。',
      },
      {
        poetId: 'gao-shi',
        name: '高适',
        blurb: '盛唐唯一封侯诗人，风格沉实厚重，《燕歌行》批判军中不公。',
      },
      {
        poetId: 'cen-shen',
        name: '岑参',
        blurb: '两度远赴西域，善写奇特边塞雪景，《白雪歌送武判官归京》。',
      },
    ],
  },
  {
    id: 'high-landscape',
    period: 'high',
    title: '三、盛唐山水田园派：王维、孟浩然',
    common: '寄情山水，向往隐逸，意境清淡悠远。',
    poets: [
      {
        poetId: 'meng-hao-ran',
        name: '孟浩然',
        blurb: '终身未得高官，隐居鹿门。代表作《春晓》《过故人庄》。',
      },
      {
        poetId: 'wang-wei',
        name: '王维',
        badge: '诗佛',
        life: '早年入世，安史之乱被迫任职伪朝，晚年辋川隐居，诗含禅意。',
        works: '《山居秋暝》《使至塞上》',
        exam: '诗中有画，画中有诗。',
      },
    ],
  },
  {
    id: 'high-peaks',
    period: 'high',
    title: '四、盛唐双峰：李白、杜甫',
    common: '唐诗两大顶峰。',
    poets: [
      {
        poetId: 'li-bai',
        name: '李白',
        badge: '诗仙｜浪漫主义',
        life: '终生漫游，渴求理想，蔑视官场束缚；受永王事件牵连流放夜郎。',
        exam: '高频意象：明月、美酒、江河；夸张、想象等浪漫手法。',
      },
      {
        poetId: 'du-fu',
        name: '杜甫',
        badge: '诗圣｜诗史｜现实主义',
        life: '安史之乱前后颠沛流离，诗歌记录民间苦难；风格沉郁顿挫。',
        exam: '家国情怀，诗词鉴赏大题热门人选。',
      },
    ],
  },
  {
    id: 'mid-core',
    period: 'mid',
    title: '五、中唐核心：白居易、刘禹锡、韩愈、柳宗元',
    poets: [
      {
        poetId: 'bai-ju-yi',
        name: '白居易',
        life: '上书遭贬江州，晚年心态闲适。',
        exam: '发起新乐府运动，主张诗歌为时、为事而作，语言通俗。',
      },
      {
        poetId: 'liu-yu-xi',
        name: '刘禹锡',
        badge: '诗豪',
        life: '永贞革新失败，长期贬谪。擅长咏史、富含哲思。',
        works: '《秋词》《酬乐天扬州初逢席上见赠》《乌衣巷》',
      },
      {
        poetId: 'han-yu',
        name: '韩愈',
        badge: '古文运动领袖',
        exam: '力斥浮华骈文，倡导古文；因谏迎佛骨被贬潮州。',
      },
      {
        poetId: 'liu-zong-yuan',
        name: '柳宗元',
        badge: '古文运动领袖',
        life: '永贞革新参与者，久贬永州、柳州。山水诗文清冷，借景抒怀。',
        works: '《江雪》《小石潭记》',
      },
    ],
  },
  {
    id: 'late-dual',
    period: 'late',
    title: '六、晚唐双璧：杜牧、李商隐',
    common: '身处乱世，诗歌多抒发国运衰败之感，常用咏史题材。',
    poets: [
      {
        poetId: 'du-mu',
        name: '杜牧',
        blurb: '咏史诗成就突出，文笔俊爽，以古鉴今。',
      },
      {
        poetId: 'li-shang-yin',
        name: '李商隐',
        blurb: '深陷牛李党争，仕途困顿。无题诗朦胧含蓄，多身世之感、相思之情。',
      },
    ],
  },
]

/** 应试分层速记 */
export const TANG_CHEAT_SHEET: string[] = [
  '初唐奠基：四杰（王杨卢骆）+ 陈子昂 → 革除齐梁绮靡文风',
  '边塞阵营：王、高、岑、王之涣、崔颢 → 征战、乡愁、塞外景色',
  '山水田园：王维、孟浩然 → 隐逸、画意、禅境',
  '盛唐双绝：李白（浪漫）、杜甫（现实）',
  '中唐革新：白居易、刘禹锡、韩愈、柳宗元 → 古文运动、新乐府、贬谪文学',
  '晚唐压轴：杜牧（咏史明朗）、李商隐（无题朦胧）',
]

export function tangPeriodOfPoet(poetId: string): Exclude<TangPeriodId, 'overview'> | null {
  for (const [period, ids] of Object.entries(TANG_PERIOD_POET_IDS) as [
    Exclude<TangPeriodId, 'overview'>,
    readonly string[],
  ][]) {
    if (ids.includes(poetId)) return period
  }
  return null
}
