/** 宋代诗人速览·总览与分期 */

export type SongPeriodId = 'overview' | 'northern' | 'southern'

export const SONG_PERIODS: { id: SongPeriodId; title: string }[] = [
  { id: 'overview', title: '总览' },
  { id: 'northern', title: '北宋' },
  { id: 'southern', title: '南宋' },
]

/** 各分期文人顺序（时间线：婉约先驱 → 古文八大家 → 南渡至亡国） */
export const SONG_PERIOD_POET_IDS: Record<
  Exclude<SongPeriodId, 'overview'>,
  readonly string[]
> = {
  northern: [
    'liu-yong', // ~984 婉约专力
    'yan-shu', // 991 太平宰相
    'ou-yang-xiu', // 1007 文坛盟主
    'su-xun', // 1009 三苏之父
    'zeng-gong', // 1019 八大家收尾
    'wang-an-shi', // 1021 变法
    'su-shi', // 1037
    'su-zhe', // 1039
  ],
  southern: [
    'li-qing-zhao', // 1084
    'lu-you', // 1125
    'xin-qi-ji', // 1140
    'wen-tian-xiang', // 1236
  ],
}

export type SongGuidePoetBrief = {
  poetId: string
  name: string
  badge?: string
  life?: string
  works?: string
  exam?: string
  blurb?: string
}

export type SongGuideGroup = {
  id: string
  period: Exclude<SongPeriodId, 'overview'>
  title: string
  common?: string
  poets: SongGuidePoetBrief[]
}

export const SONG_GUIDE_GROUPS: SongGuideGroup[] = [
  {
    id: 'northern-core',
    period: 'northern',
    title: '一、北宋文坛核心：古文运动 · 新旧党争 · 婉约奠基',
    common:
      '围绕古文革新与新旧党争；文人命运多与朝堂派系绑定，文章、诗词兼顾说理、意境、政见。',
    poets: [
      {
        poetId: 'liu-yong',
        name: '柳永',
        badge: '专力写词',
        life: '《鹤冲天》惹怒仁宗→奉旨填词→市井漫游→晚年改名得小官，落寞而终',
        works: '《雨霖铃》《八声甘州》《望海潮》',
        exam: '俚俗入词的革新；离别/羁旅情景交融；“奉旨填词”与完颜亮典故。',
      },
      {
        poetId: 'yan-shu',
        name: '晏殊',
        badge: '太平宰相·婉约',
        life: '仕途极度平顺，仅一次短期贬谪',
        exam: '无可奈何花落去；昨夜西风凋碧树（治学三境第一境）；富贵而不俗。',
      },
      {
        poetId: 'ou-yang-xiu',
        name: '欧阳修',
        badge: '文坛盟主',
        life: '幼年贫苦苦读→支持庆历新政被贬滁州→回京掌权改革文风→晚年归隐颍州',
        works: '《醉翁亭记》《朋党论》',
        exam: '与民同乐、朋党论政见；提拔三苏、曾巩；古文运动真正领袖。',
      },
      {
        poetId: 'su-xun',
        name: '苏洵',
        badge: '三苏之父',
        life: '大器晚成，二十七岁发奋治学，专攻史论策论',
        works: '《六国论》',
        exam: '借古讽今，警示勿对外妥协；以史鉴今的政论文宗师。',
      },
      {
        poetId: 'zeng-gong',
        name: '曾巩',
        badge: '八大家收尾',
        life: '早年赡养弟妹→与二苏同榜→党争不站队外派→晚年整理典籍',
        works: '《墨池记》',
        exam: '劝学主旨；古文运动最后的正统传承，最重道义德行。',
      },
      {
        poetId: 'wang-an-shi',
        name: '王安石',
        badge: '改革家·八大家',
        life: '深耕地方→拜相变法→两度罢相→新法尽废，忧愤离世',
        works: '《登飞来峰》《泊船瓜洲》《桂枝香·金陵怀古》',
        exam: '诗文极简犀利；《泊船瓜洲》炼字考点极强。',
      },
      {
        poetId: 'su-shi',
        name: '苏轼',
        badge: '宋代全能第一人',
        life: '新旧两党双向排挤；乌台诗案为断崖，黄州后旷达通透；外放密州、徐州、惠州、儋州',
        works: '《念奴娇·赤壁怀古》《定风波》等',
        exam: '豪放词巅峰；中秋、悼亡、田园全面覆盖；鉴赏题最高频宋代人物。',
      },
      {
        poetId: 'su-zhe',
        name: '苏辙',
        badge: '三苏',
        life: '人生绑定兄长；乌台诗案削官替兄；后期高位遭贬，晚年归隐颍川',
        exam: '手足情谊、文论思想、含蓄克制的处世与文风。',
      },
    ],
  },
  {
    id: 'southern-core',
    period: 'southern',
    title: '二、南宋文坛核心：国破南渡 · 抗金复国 · 气节风骨',
    common:
      '全部笼罩在靖康之耻阴影下；底色多出家国破碎的悲愤，气节与情怀是鉴赏题核心得分点。',
    poets: [
      {
        poetId: 'li-qing-zhao',
        name: '李清照',
        badge: '南北宋分水岭',
        life: '南渡前金石相伴、词风轻快→南渡后国破家亡、孤苦漂泊',
        works: '《声声慢》《夏日绝句》',
        exam: '前后风格巨大反差；叠词千古一绝；《夏日绝句》借项羽批判苟安。',
      },
      {
        poetId: 'lu-you',
        name: '陆游',
        badge: '第一爱国诗人',
        life: '主战被排挤→入蜀前线→罢官归隐山阴→临终仍嘱北伐',
        works: '《游山西村》《示儿》',
        exam: '山重水复 / 柳暗花明；爱国报国 + 田园闲适的矛盾统一。',
      },
      {
        poetId: 'xin-qi-ji',
        name: '辛弃疾',
        badge: '豪放词顶峰',
        life: '沦陷区率义军归宋→被猜忌夺兵权→外放闲居上饶',
        works: '《破阵子》《西江月》《永遇乐》《青玉案·元夕》',
        exam: '壮志难酬与田园松弛两面性；治学第三重境界；怀古叹报国无路。',
      },
      {
        poetId: 'wen-tian-xiang',
        name: '文天祥',
        badge: '末代气节标杆',
        life: '状元刚正→散财勤王→被俘拒降',
        works: '《过零丁洋》《正气歌》',
        exam: '人生自古谁无死，留取丹心照汗青；绝境中的道义坚守。',
      },
    ],
  },
]

/** 四大文学流派（做题快速对应） */
export const SONG_SCHOOL_LINES: string[] = [
  '北宋古文运动（唐宋八大家）：欧阳修、三苏、王安石、曾巩 → 摒弃浮华骈文，明道务实',
  '北宋前期婉约词：晏殊（上层闲愁）、柳永（市井离别羁旅，拓展词的社会边界）',
  '两宋豪放词：苏轼（开创体系）、辛弃疾（南宋集大成）',
  '南宋爱国诗人群：李清照（家国之悲）、陆游（毕生抗金）、文天祥（殉国忠义）',
]

/** 应试整体提炼 */
export const SONG_CHEAT_SHEET: string[] = [
  '北宋：古文革新 + 新旧党争；命运绑定朝堂派系',
  '南宋：靖康之耻阴影；北伐渴望或痛感苟安；气节情怀是得分点',
  '最高频六人：苏轼、辛弃疾、李清照、陆游、王安石、欧阳修',
  '其余人物：常识、古文、典故补充',
]

export function songPeriodOfPoet(
  poetId: string,
): Exclude<SongPeriodId, 'overview'> | null {
  for (const [period, ids] of Object.entries(SONG_PERIOD_POET_IDS) as [
    Exclude<SongPeriodId, 'overview'>,
    readonly string[],
  ][]) {
    if (ids.includes(poetId)) return period
  }
  return null
}
