import type { PracticeHubSectionId } from '@/constants/practice-hub-sections'

export type MentalMathGuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'tip'; text: string }

export type MentalMathGuideArticle = {
  id: string
  title: string
  /** 所属练习大类（攻略自身为 guide） */
  category: PracticeHubSectionId
  /** 对应练习模式 id，用于「去练习」 */
  practiceModeId?: string
  blocks: MentalMathGuideBlock[]
}

export type MentalMathGuideGroup = {
  id: PracticeHubSectionId
  title: string
  articles: MentalMathGuideArticle[]
}

export const MENTAL_MATH_GUIDE_GROUPS: MentalMathGuideGroup[] = [
  {
    id: 'guide',
    title: '新手入门',
    articles: [
      {
        id: 'overview',
        title: '怎么玩、怎么计分',
        category: 'guide',
        blocks: [
          {
            type: 'p',
            text: '左侧点菜单选模式，点「开始练习」就会倒计时开局。大部分是限时选择题；二十四点要自己打算式；数独要填格子。答对加分加时，答错扣分扣时，满 100 分或时间到结束。',
          },
          {
            type: 'h3',
            text: '第一次怎么上手',
          },
          {
            type: 'ol',
            items: [
              '先点左侧「练习攻略」扫一眼，或直接进「四则口算 → 简单题」试一局。',
              '开局会 3-2-1-GO，然后看题选答案；键盘也能按 1～5 选选项（更快）。',
              '一局结束后看本局对错记录；部分模式（次幂、平方立方、分数、整除、生活常识、二十四点）答错会自动进菜单里的「错题集」。',
            ],
          },
          {
            type: 'h3',
            text: '计分记什么',
          },
          {
            type: 'ul',
            items: [
              '分数一般在 0～100：对了加分，错了扣分（各模式加减不同，卡片上有写）。',
              '时间也会变：多数口算模式对 +1 秒、错 −1 秒；二十四点等另有加减秒规则。',
              '本局成绩只在当前页面看；错题集保存在本机浏览器，方便回头复习。',
            ],
          },
          {
            type: 'tip',
            text: '别一味抢速度。连续错会扣时间，先求稳再求快。',
          },
        ],
      },
      {
        id: 'training-path',
        title: '推荐练什么顺序',
        category: 'guide',
        blocks: [
          {
            type: 'p',
            text: '像打游戏通关：简单打稳了再升难度。每天挑 2～3 个模式，每个打几局就够。',
          },
          {
            type: 'ol',
            items: [
              '起步：四则简单 → 2 的次幂简单 → 平方立方简单。',
              '加分：估算分数简单 → 整除简单 → 生活常识简单（练反应，不拼难题）。',
              '进阶：四则普通 / 分数高难 / 整除普通；想动脑可穿插二十四点简单、图形推理。',
              '冲刺：四则高难、次幂复杂、平方立方复杂、二十四点高难。',
            ],
          },
          {
            type: 'tip',
            text: '错题集里反复错的题，先搞懂再往上冲；比盲目开高难更有效。',
          },
        ],
      },
    ],
  },
  {
    id: 'arithmetic',
    title: '四则口算',
    articles: [
      {
        id: 'arithmetic-easy',
        title: '简单题',
        category: 'arithmetic',
        practiceModeId: 'easy',
        blocks: [
          {
            type: 'p',
            text: '适合热身：个位加减乘除（可含负数），三个选项，时间短、题简单。目标是「看到就有答案」，不用动笔。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '加减：先看正负。同号绝对值相加；异号用大减小，符号跟大的走。',
              '乘法：1～9 口诀要熟；负负得正、一正一负得负。看到 0 直接选 0。',
              '除法：用乘法反推，如 56÷8 想「七八五十六」。',
            ],
          },
          {
            type: 'tip',
            text: '错了别慌，看一眼正确答案再下一题；这个模式主要练手感和节奏。',
          },
        ],
      },
      {
        id: 'arithmetic-normal',
        title: '普通题',
        category: 'arithmetic',
        practiceModeId: 'normal',
        blocks: [
          {
            type: 'p',
            text: '数字变大一点（常见十位、百位组合），四个选项。核心是「拆开来算」，不要整坨硬乘。',
          },
          {
            type: 'h3',
            text: '常用拆法',
          },
          {
            type: 'ul',
            items: [
              '比如 47×6：先算 40×6=240，再 7×6=42，加起来 282。',
              '加减：先整十整百，再补个位，比如 156+34 → 150+30=180，再 +6+4。',
              '除法：先估大概商是几，再在选项里对一下。',
            ],
          },
          {
            type: 'tip',
            text: '干扰项经常是「少算一步」或「多乘了 2」。先心算一个数，再去选项里找，别被「差不多」带走。',
          },
        ],
      },
      {
        id: 'arithmetic-hard',
        title: '高难题',
        category: 'arithmetic',
        practiceModeId: 'hard',
        blocks: [
          {
            type: 'p',
            text: '题型更杂：连乘连除、两积相加等，五个选项。建议普通题能稳定八九十分再来。',
          },
          {
            type: 'h3',
            text: '答题顺序建议',
          },
          {
            type: 'ol',
            items: [
              '先看结构：是乘除连算，还是两段再加？',
              '能约分、能提公因数就先做，数字会小很多。',
              '中间结果先估量级（大概几百还是几千），再精确算。',
            ],
          },
          {
            type: 'tip',
            text: '高难不是每题都要秒出。会的快做，卡壳的跳过式抢下一题也行——别在一道题上把时间扣光。',
          },
        ],
      },
    ],
  },
  {
    id: 'power',
    title: '2 的 n 次幂',
    articles: [
      {
        id: 'power-easy',
        title: '简单题',
        category: 'power',
        practiceModeId: 'power-easy',
        blocks: [
          {
            type: 'p',
            text: '题面像 2ⁿ。简单档覆盖常见次幂（含少量负数指数）。干扰项多是「隔壁次幂」，差一次就差一倍。',
          },
          {
            type: 'h3',
            text: '先背这些就够用',
          },
          {
            type: 'ul',
            items: [
              '2⁰=1，2¹=2，2²=4，2³=8，2⁴=16，2⁵=32，2⁶=64，2⁷=128，2⁸=256，2⁹=512，2¹⁰=1024。',
              '往后：每次 ×2；往前：每次 ÷2。',
              '负指数：2⁻¹=1/2，2⁻²=1/4，2⁻³=1/8（就是「倒数的正次幂」）。',
            ],
          },
          {
            type: 'tip',
            text: '选项里若出现「刚好大一倍/小一半」的数，多半是差了一次幂，再核对指数。',
          },
        ],
      },
      {
        id: 'power-hard',
        title: '复杂题',
        category: 'power',
        practiceModeId: 'power-hard',
        blocks: [
          {
            type: 'p',
            text: '指数更大或更负。记住「从熟的点出发连乘/连除」比死背全部更快。',
          },
          {
            type: 'h3',
            text: '速算技巧',
          },
          {
            type: 'ul',
            items: [
              '从 2¹⁰=1024 出发：2¹¹≈2 千，2¹²≈4 千，2¹³≈8 千，2²⁰≈一百万量级。',
              '负指数同理：2⁻⁴=1/16，2⁻⁵=1/32……',
              '先锁定量级，再在选项里排除离谱的。',
            ],
          },
          {
            type: 'tip',
            text: '答错会进本菜单「错题集」。把反复错的次幂抄一张小表，练几天就牢了。',
          },
        ],
      },
    ],
  },
  {
    id: 'square-cube',
    title: '平方与立方',
    articles: [
      {
        id: 'square-cube-easy',
        title: '简单题',
        category: 'square-cube',
        practiceModeId: 'square-cube-easy',
        blocks: [
          {
            type: 'p',
            text: '题目会是 n² 或 n³。简单档底数不大，把常用表背熟就能很快。',
          },
          {
            type: 'h3',
            text: '建议先熟记',
          },
          {
            type: 'ul',
            items: [
              '平方：1²～11²（121）；尤其 6²=36、7²=49、8²=64、9²=81、11²=121。',
              '立方：1³～6³（216）；2³=8、3³=27、4³=64、5³=125、6³=216。',
              '注意：4²=16 和 2⁴=16 不同题，看清是平方还是次幂。',
            ],
          },
          {
            type: 'tip',
            text: '干扰项常是「底数大 1 或小 1 的同次幂」。先算对，再选，别扫选项猜。',
          },
        ],
      },
      {
        id: 'square-cube-hard',
        title: '复杂题',
        category: 'square-cube',
        practiceModeId: 'square-cube-hard',
        blocks: [
          {
            type: 'p',
            text: '平方底数可到 20，立方可到 9。不会的用「拆开」或「邻近值」。',
          },
          {
            type: 'h3',
            text: '例子',
          },
          {
            type: 'ul',
            items: [
              '15²=(10+5)²=100+100+25=225；12²=144，13²=169，14²=196，16²=256。',
              '7³=343，8³=512，9³=729——这几个值得单独背。',
              '若选项里有「很接近但差一截」的数，可能是把平方立方搞混了。',
            ],
          },
          {
            type: 'tip',
            text: '复杂档优先保证正确率；错题集里按「平方表 / 立方表」分类复习更快。',
          },
        ],
      },
    ],
  },
  {
    id: 'fraction',
    title: '估算分数',
    articles: [
      {
        id: 'fraction-easy',
        title: '简单题',
        category: 'fraction',
        practiceModeId: 'fraction-easy',
        blocks: [
          {
            type: 'p',
            text: '两类常见题：百分数写成最简分数，或比较两个分数谁大。简单档数字友好，适合建立感觉。',
          },
          {
            type: 'h3',
            text: '百分数 ↔ 分数',
          },
          {
            type: 'ul',
            items: [
              '25%=1/4，50%=1/2，75%=3/4，20%=1/5，10%=1/10。',
              '写成分数后约分：分子分母同除公约数。',
            ],
          },
          {
            type: 'h3',
            text: '比大小',
          },
          {
            type: 'ul',
            items: [
              '同分母：分子大的更大。',
              '同分子：分母小的更大（同样多的「份」，份越大每份越小）。',
            ],
          },
          {
            type: 'tip',
            text: '拿不准时，把它想成「一块披萨切几份」——比干背公式更直观。',
          },
        ],
      },
      {
        id: 'fraction-hard',
        title: '高难题',
        category: 'fraction',
        practiceModeId: 'fraction-hard',
        blocks: [
          {
            type: 'p',
            text: '会出现 12.5%、33% 等，以及异分母、数值接近的比较。多记几组「特殊百分数」会轻松很多。',
          },
          {
            type: 'h3',
            text: '值得背的换算',
          },
          {
            type: 'ul',
            items: [
              '12.5%=1/8，37.5%=3/8，62.5%=5/8，87.5%=7/8。',
              '大约：33%≈1/3，67%≈2/3。',
            ],
          },
          {
            type: 'h3',
            text: '异分母怎么比',
          },
          {
            type: 'ul',
            items: [
              '交叉想：a/b 和 c/d，比 a×d 与 b×c（同号正分数时）。',
              '或先估离 1/2、1/3 有多远，比如 4/9 略小于 1/2。',
            ],
          },
          {
            type: 'tip',
            text: '高难不必每题精算到小数；先排除离谱选项，再细算剩下的。',
          },
        ],
      },
    ],
  },
  {
    id: 'divisibility',
    title: '整除及其性质',
    articles: [
      {
        id: 'divisibility-easy',
        title: '简单题入门',
        category: 'divisibility',
        practiceModeId: 'divisibility-easy',
        blocks: [
          {
            type: 'p',
            text: '考「能不能整除」「是不是质数」「公因数公倍数」等。先把几条口诀用熟，比硬除更省事。',
          },
          {
            type: 'h3',
            text: '最常用的整除口诀',
          },
          {
            type: 'ul',
            items: [
              '能被 2 整除：末位是偶数。',
              '能被 5 整除：末位是 0 或 5。',
              '能被 3 / 9 整除：各位数字加起来能被 3 / 9 整除。',
              '能被 6 整除：同时能被 2 和 3 整除。',
            ],
          },
          {
            type: 'tip',
            text: '干扰型选项会故意「看起来像对的」。用口诀验一遍再选。',
          },
        ],
      },
      {
        id: 'divisibility-normal',
        title: '普通 / 高难怎么进阶',
        category: 'divisibility',
        practiceModeId: 'divisibility-normal',
        blocks: [
          {
            type: 'p',
            text: '普通、高难会加入 7、11，以及质因数、最大公因数（GCD）、最小公倍数（LCM）。',
          },
          {
            type: 'h3',
            text: '小抄',
          },
          {
            type: 'ul',
            items: [
              '11：奇位和与偶位和之差是 11 的倍数（含 0）。',
              '质数：大于 1，只有 1 和自身两个正因数（2,3,5,7,11…）。',
              'GCD：两数最大公因数；LCM：最小公倍数。记住：两数之积 = GCD × LCM（正整数时）。',
            ],
          },
          {
            type: 'tip',
            text: '答错会进错题集。同一类规则（比如「判 9」）连续错，就专门练这一条规则几局。',
          },
        ],
      },
    ],
  },
  {
    id: 'life-sense',
    title: '生活常识',
    articles: [
      {
        id: 'life-sense-overview',
        title: '怎么练生活常识',
        category: 'life-sense',
        practiceModeId: 'life-sense-easy',
        blocks: [
          {
            type: 'p',
            text: '这里是口算菜单里的「生活常识」快判题（材料、种属、组成、用途、别称等），和语文里的「生活科学」不是同一套。题干短、选项短，靠常识反应。',
          },
          {
            type: 'h3',
            text: '三种难度',
          },
          {
            type: 'ul',
            items: [
              '简单 / 普通 / 复杂：时间更紧、选项更多、干扰更接近。',
              '作答过程中只显示对错；详细错因可在本局结束后或错题集里看。',
            ],
          },
          {
            type: 'h3',
            text: '答题小建议',
          },
          {
            type: 'ul',
            items: [
              '盯住题干问的是「原材料 / 是一种什么 / 属于谁 / 用来做什么」。',
              '别被「名字像」骗走：比如土豆和红薯不是同一种。',
              '组成题若写「某某通常属于？」，答案是整件名，不是把答案写进题干里那种送分题。',
            ],
          },
          {
            type: 'tip',
            text: '错题集按菜单汇总。同一类（如别称、材料）错多了，就集中翻几遍再练。',
          },
        ],
      },
    ],
  },
  {
    id: 'twentyfour',
    title: '二十四点',
    articles: [
      {
        id: 'twentyfour-easy',
        title: '简单模式',
        category: 'twentyfour',
        practiceModeId: 'twentyfour-easy',
        blocks: [
          {
            type: 'p',
            text: '给你四个数，用加减乘除（可加括号），每个数用一次，算出 24。简单模式数字小、解法多，适合入门。',
          },
          {
            type: 'h3',
            text: '常用思路',
          },
          {
            type: 'ul',
            items: [
              '先想怎么凑出 8、6、4、3 这些「好用的中间数」，再乘到 24。',
              '例如 8×3、6×4、12×2、(7+1)×3 都很常见。',
              '输入时注意括号：乘法除法优先级和你想的顺序不一致时，一定要加括号。',
            ],
          },
          {
            type: 'tip',
            text: '卡住就换目标：先固定两个数的运算结果，再看剩下两个怎么接。错了会进错题集，可对照参考解法。',
          },
        ],
      },
      {
        id: 'twentyfour-hard',
        title: '高难模式',
        category: 'twentyfour',
        practiceModeId: 'twentyfour-hard',
        blocks: [
          {
            type: 'p',
            text: '数字组合更刁，时间更紧，分值起伏更大。建议简单模式能稳定通关再来。',
          },
          {
            type: 'h3',
            text: '进阶技巧',
          },
          {
            type: 'ul',
            items: [
              '善用「拆 24」：24=8×3=6×4=12×2= (5−1)×6 等。',
              '除法可用来「变整数」：比如先 ÷ 再 ×，或先凑出能整除的数。',
              '实在不会时，保证别空提交乱扣分；有时放下重开下一题更划算。',
            ],
          },
          {
            type: 'tip',
            text: '错题详情里有参考解法。先看懂解法套路，再自己重打一遍，比只看答案有效。',
          },
        ],
      },
    ],
  },
  {
    id: 'graphic',
    title: '图形推理',
    articles: [
      {
        id: 'graphic',
        title: '图形推理怎么看',
        category: 'graphic',
        practiceModeId: 'graphic',
        blocks: [
          {
            type: 'p',
            text: '给出一串图形，找出规律，选下一格。本模式练常见程序化规律；立体折叠等真题图还需另外刷题。',
          },
          {
            type: 'h3',
            text: '先按这四类扫一眼',
          },
          {
            type: 'ul',
            items: [
              '数量：点、线、块是不是每次 +1？',
              '位置：是不是在转、在平移？',
              '形状：圆方三角是不是在轮换？',
              '颜色/实空：是不是黑白交替？',
            ],
          },
          {
            type: 'ol',
            items: [
              '用前两格提出假设。',
              '用第三格验证。',
              '到选项里找唯一符合延续的那个。',
            ],
          },
          {
            type: 'tip',
            text: '答错后看规律说明（比如「圆点每次 +1」），同一规律连练几局，手感会上来。',
          },
        ],
      },
    ],
  },
]

export const DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID = 'overview'

export function findMentalMathGuideArticle(id: string): MentalMathGuideArticle | null {
  for (const group of MENTAL_MATH_GUIDE_GROUPS) {
    const hit = group.articles.find((a) => a.id === id)
    if (hit) return hit
  }
  return null
}

export function mentalMathGuideGroupForArticle(articleId: string): MentalMathGuideGroup | null {
  for (const group of MENTAL_MATH_GUIDE_GROUPS) {
    if (group.articles.some((a) => a.id === articleId)) return group
  }
  return null
}
