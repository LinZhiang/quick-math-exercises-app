import type { PracticeHubSectionId } from '@/constants/practice-hub-sections'

export type MentalMathGuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'quote'; text: string }

export type MentalMathGuideArticle = {
  id: string
  title: string
  /** 所属练习大类（攻略自身为 guide） */
  category: PracticeHubSectionId
  /** 对应练习模式 id，用于「去练习」口算类 */
  practiceModeId?: string
  /** 跳转到语文练习子菜单（如文言知识） */
  chineseTabId?: string
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
              '加分：估算分数简单 → 整除简单 → 生活常识 / 语法判断简单（练反应，不拼难题）。',
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
      {
        id: 'arithmetic-cumsum',
        title: '累加/减数',
        category: 'arithmetic',
        practiceModeId: 'cumsum-easy',
        blocks: [
          {
            type: 'p',
            text: '个位数连加减，形如 7 + 2 − 5 + 1。简单题 3～4 个数，复杂题 4～5 个数。干扰项常是「某一处加减反了」或与正确答案只差 1～2。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '从左到右扫一遍，心里只记当前结果，不要回头重加。',
              '看见 − 先减，看见 + 再加；别把后面的符号提前用掉。',
              '若选项里有「全加」「全减」的结果，多半是干扰，别贪快。',
            ],
          },
          {
            type: 'tip',
            text: '拿不准时，把式子拆成「正项之和 − 负项之和」再比一次。',
          },
        ],
      },
      {
        id: 'arithmetic-threedigit',
        title: '三位数加减法',
        category: 'arithmetic',
        practiceModeId: 'threedigit-easy',
        blocks: [
          {
            type: 'p',
            text: '两个三位数相加或相减。干扰项故意做成「个位与正确答案相同」，只在十位/百位或进退位上出错，看起来很像对的。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '先算个位，再看要不要进位/退位，最后对一下十位、百位。',
              '选项个位都一样时，重点核对十位和百位，别被「长得像」带走。',
              '加减符号看清：把加做成减（或反过来）是常见干扰。',
            ],
          },
          {
            type: 'tip',
            text: '心算可用「拆整百」：368+247 → 300+200，60+40，8+7，再合并。',
          },
        ],
      },
      {
        id: 'arithmetic-pct-addsub',
        title: '百分比加减运算',
        category: 'arithmetic',
        practiceModeId: 'pct-addsub-easy',
        blocks: [
          {
            type: 'p',
            text: '百分数直接加减，如 35% + 28%、72% − 19%。干扰常是加减反了，或差 1～2 个百分点的近邻结果。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '把百分号先当普通数字加减，最后再带上 %。',
              '先估量级：大概五十多还是七十多，再在选项里精选。',
              '看见「加减反了」的选项（如本该加却出现差），直接排除。',
            ],
          },
          {
            type: 'tip',
            text: '复杂题结果可能超过 100%，这是正常的，别下意识只在 100 以内找。',
          },
        ],
      },
      {
        id: 'arithmetic-mulcalc',
        title: '乘法计算',
        category: 'arithmetic',
        practiceModeId: 'mulcalc-easy',
        blocks: [
          {
            type: 'p',
            text: '简单题是两位数 × 一位数，复杂题是三位数 × 一位数。干扰项个位与正确答案相同，只在十位/百位或进位上出错。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '拆开乘：47×6 → 40×6 + 7×6。',
              '三位数同理：358×7 → 300×7 + 50×7 + 8×7，注意进位。',
              '选项个位都一样时，重点核对十位和百位。',
            ],
          },
          {
            type: 'tip',
            text: '常见错法是乘数差 1，或漏乘某一位。先估量级再点选项。',
          },
        ],
      },
      {
        id: 'arithmetic-mixchain',
        title: '累加/减数（乘除）',
        category: 'arithmetic',
        practiceModeId: 'mixchain-easy',
        blocks: [
          {
            type: 'p',
            text: '先算个位乘法、十位÷个位（整除），再用加减把结果串起来，如 3 × 4 − 24 ÷ 6 + 2。与「个位纯加减」的累加/减数不同。',
          },
          {
            type: 'h3',
            text: '怎么算更快',
          },
          {
            type: 'ul',
            items: [
              '先分别算出每一段乘/除，再按加减合并。',
              '简单题固定「一组乘 + 一组除 + 一个个位数」；复杂题是两组乘一组除，或两组除一组乘。',
              '干扰常是某一段加减符号反了，或商/积差 1。',
            ],
          },
          {
            type: 'tip',
            text: '除法段一定整除；若心算商不顺，多半看错了除数。',
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
        title: '两类固定题型',
        category: 'divisibility',
        practiceModeId: 'divisibility-easy',
        blocks: [
          {
            type: 'p',
            text: '本菜单只出两种题：「下列哪个数是质数/合数」「下列哪个数能被 3～12 整除」。不再考公约数、公倍数、能否判断等其它问法。',
          },
          {
            type: 'h3',
            text: '整除口诀（3～12）',
          },
          {
            type: 'ul',
            items: [
              '3 / 9：各位数字之和能被 3 / 9 整除。',
              '4：末两位能被 4 整除；8：末三位能被 8 整除。',
              '5 / 10：末位是 0 或 5（10 必须末位是 0）。',
              '6：同时能被 2 和 3 整除；12：同时能被 3 和 4 整除。',
              '7 / 11：可用短除或交替和；拿不准就试除验证选项。',
            ],
          },
          {
            type: 'tip',
            text: '质数大于 1 且只有 1 和自身两个正因数；合数还能再拆。1 既不是质数也不是合数，常当干扰项。',
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
            text: '题型不变，只是数字变大、选项变多。干扰项常「只满足一半条件」（比如能被 2 却不能被 3，却冒充能被 6 整除）。',
          },
          {
            type: 'h3',
            text: '小抄',
          },
          {
            type: 'ul',
            items: [
              '先排除明显不对的选项，再对剩余项用口诀或试除。',
              '看「能被 6 / 12」时，两条条件都要查，缺一不可。',
              '质合数题：合数干扰里常混进 1、9、15、25、49 等「看起来像特殊数」的项。',
            ],
          },
          {
            type: 'tip',
            text: '答错会进错题集。同一条规则（如「判 9」）连续错，就专门盯着练几局。',
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
              '抽题优先出本难度题库里还没出过的题；该难度全部出过一轮后会重置进度再随机抽。',
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
    id: 'grammar-judgment',
    title: '语法判断',
    articles: [
      {
        id: 'grammar-judgment-overview',
        title: '怎么练语法判断',
        category: 'grammar-judgment',
        practiceModeId: 'grammar-judgment-easy',
        blocks: [
          {
            type: 'p',
            text: '给出一句中文，考察句子成分：主语、谓语、宾语、定语、状语、补语。题库约 150 句，按顺序出句；同一句话会随机换成「找成分」或「判成分」，所以不会死记题号。',
          },
          {
            type: 'h3',
            text: '两种问法',
          },
          {
            type: 'ul',
            items: [
              '找成分：下列哪个是主语 / 谓语 / …？选项是句中片段。',
              '判成分：「某某」是什么句子成分？选项是六种成分名称。',
            ],
          },
          {
            type: 'h3',
            text: '三种难度',
          },
          {
            type: 'ul',
            items: [
              '简单：短句清楚，但六种成分都会考到，不会总盯主谓宾。',
              '普通：句式含主谓宾定状补六种成分，稍长。',
              '复杂：超长单句，多层定状补与把被兼语交织；对 +15 / 错 -30。',
            ],
          },
          {
            type: 'h3',
            text: '圈出所有语法',
          },
          {
            type: 'ul',
            items: [
              '简单题用「普通」句式，困难题用「复杂」句式；每局固定 5 题。',
              '手指滑动圈词后点成分（主谓宾定状补），也可手动输入原词再添加。',
              '不计倒计时：提交后先停表并公布正确答案，点「下一题」再继续计时；五题后点「查看结果」。',
              '对 +20 / 错 -5（分不会扣到 0 以下）。',
              '要把句中标注的全部成分都圈对才算过关，漏标、多标都算错。',
            ],
          },
          {
            type: 'h3',
            text: '缩句练习',
          },
          {
            type: 'ul',
            items: [
              '题库 150 句，摘自求是网、新华网近年时事（优先 2026）：简单 75 / 困难 75。',
              '去掉定语、状语、补语等修饰，留下主语、谓语、宾语等主干；可滑动圈选后自动拼接，也可手打。',
              '流程同「圈出所有语法」：提交后停表看标准答案，点下一题再计时；五题后看总成绩。',
              '计分：对 +20 / 错 -20（分不会扣到 0 以下）。',
            ],
          },
          {
            type: 'tip',
            text: '计分：简单对 +7 / 错 -14，普通 +10 / -20，复杂 +15 / -30。圈出所有语法：对 +20 / 错 -5。缩句练习：对 +20 / 错 -20。答错进错题集。先看旁边「句子成分速记」再开练，会轻松很多。',
          },
        ],
      },
      {
        id: 'grammar-judgment-core',
        title: '句子成分速记',
        category: 'grammar-judgment',
        practiceModeId: 'grammar-judgment-easy',
        blocks: [
          {
            type: 'h3',
            text: '一句话公式',
          },
          {
            type: 'quote',
            text: '（定语）主语 【状语】谓语 〈补语〉 （定语）宾语',
          },
          {
            type: 'tip',
            text: '口诀：的定、地状、得后补；主语谓语是主干，宾语跟着谓语走。',
          },
          {
            type: 'h3',
            text: '主干三件：主 / 谓 / 宾',
          },
          {
            type: 'ul',
            items: [
              '主语（谁 / 什么）：句子主角，人、事物、地点都可以。例：小猫吃鱼 →「小猫」。',
              '谓语（干什么 / 是什么）：主语发出的动作，或判断词（是、变成）。例：「吃」。',
              '宾语（动作的承受者）：谓语作用到的对象。例：「鱼」。',
            ],
          },
          {
            type: 'p',
            text: '把主谓宾拎出来，句子核心意思就有了。',
          },
          {
            type: 'h3',
            text: '修饰三件：定 / 状 / 补',
          },
          {
            type: 'h4',
            text: '定语：修饰名词，标志「的」',
          },
          {
            type: 'ul',
            items: [
              '专门修饰主语、宾语，限定「哪一个、什么样」。',
              '格式：定语 + 的 + 名词。',
              '例：（可爱的）小猫吃（新鲜的）鱼 →「可爱的」「新鲜的」都是定语。',
            ],
          },
          {
            type: 'h4',
            text: '状语：修饰动作 / 全句，标志「地」',
          },
          {
            type: 'ul',
            items: [
              '多在谓语前，说明什么时候、在哪里、怎么干、频率等。',
              '格式：状语 + 地 + 动词（也有不加「地」的时间、处所状语）。',
              '例：小猫【开心地】吃鱼 →「开心地」是状语。',
            ],
          },
          {
            type: 'h4',
            text: '补语：补充动作结果，标志「得」',
          },
          {
            type: 'ul',
            items: [
              '多在谓语后，补充结果、程度、时长。',
              '格式：动词 + 得 + 补语（也有「洗干净」「走远了」这类结果补语）。',
              '例：小猫吃得〈很香〉→「很香」是补语。',
            ],
          },
          {
            type: 'h3',
            text: '完整套句拆解',
          },
          {
            type: 'quote',
            text: '（乖巧的）小猫【中午在客厅开心地】吃〈干干净净〉（清蒸的）小鱼。',
          },
          {
            type: 'ul',
            items: [
              '主语：小猫',
              '谓语：吃',
              '宾语：小鱼',
              '定语：乖巧的（修饰主语）、清蒸的（修饰宾语）',
              '状语：中午、在客厅、开心地（修饰「吃」）',
              '补语：干干净净（补充「吃」的结果）',
            ],
          },
          {
            type: 'h3',
            text: '快速区分（易错高频）',
          },
          {
            type: 'ul',
            items: [
              '「的」后面一般是名词 → 定语。例：红色的花朵。',
              '「地」后面一般是动词 → 状语。例：飞快地奔跑。',
              '「得」前面是动词、后面是描述 → 补语。例：跑得飞快。',
            ],
          },
          {
            type: 'tip',
            text: '先抓主谓宾定主干，再看「的 / 地 / 得」分定状补。卡住时把选项代回公式位置试一下。',
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
  {
    id: 'chinese',
    title: '语文练习',
    articles: [
      {
        id: 'chinese-classical-sentence-patterns',
        title: '文言知识 · 特殊句式',
        category: 'chinese',
        chineseTabId: 'classical-chinese',
        blocks: [
          {
            type: 'p',
            text: '文言文特殊句式通俗讲解：先抛开晦涩术语，用现代汉语语序来对照。考编识记够用，练「文言知识」前建议先过一遍。',
          },
          {
            type: 'p',
            text: '常见六种：宾语前置、状语后置、定语后置、判断句、被动句、省略句。核心就一句话——古人说话语序和现代人常反过来，把句子掰成现在说话的顺序，就能看懂。',
          },
          {
            type: 'h3',
            text: '一、宾语前置（最常考）',
          },
          {
            type: 'p',
            text: '现代正常语序：主语 + 谓语 + 宾语（我打你）。宾语前置：把宾语放到谓语动词前面，用来强调宾语。',
          },
          {
            type: 'h4',
            text: '三种高频场景',
          },
          {
            type: 'ol',
            items: [
              '否定句（不、未、莫、毋）里，代词作宾语常前置。例：「忌不自信」（《邹忌讽齐王纳谏》）——字面「邹忌不自己相信」，还原为「邹忌不相信自己」。口诀：否定词 + 代词，宾语往前挪。',
              '疑问句（何、谁、奚、安）里，疑问代词常前置。例：「何陋之有？」（《陋室铭》）——字面「什么简陋有」，还原为「有何陋」（有什么简陋的呢）。「之」多为前置标志，无实义。',
              '「唯……是……」固定结构，专门倒装强调。例：唯利是图 = 唯图利（只贪图利益）。',
            ],
          },
          {
            type: 'h3',
            text: '二、状语后置（介词短语后置，考得最多）',
          },
          {
            type: 'p',
            text: '现代习惯：主语 + 谓语 +【状语（在哪 / 用啥 / 对谁）】。文言习惯：谓语说完，把地点、方式、时间（常由「以、于、乎」引导）放到句末。',
          },
          {
            type: 'ul',
            items: [
              '标志词：于（在 / 从 / 比）、以（用 / 把）。',
              '例：「战于长勺」（《曹刿论战》）——字面「作战在长勺」，还原「于长勺战」（在长勺作战）。',
              '例：「咨臣以当世之事」——字面「询问我拿天下大事」，还原「以当世之事咨臣」（拿朝堂大事询问我）。',
            ],
          },
          {
            type: 'h3',
            text: '三、定语后置（修饰语放在名词后面）',
          },
          {
            type: 'p',
            text: '现代：【定语】+ 名词（美丽的花）。文言常：名词 + 定语，修饰语在被修饰成分之后。常见标志：「之」「者」。',
          },
          {
            type: 'ul',
            items: [
              '例：「居庙堂之高，则忧其民」——字面偏「朝堂的高位」，理解时可还原为「居高之庙堂」（处在高高的朝堂之上）。',
              '例：「有吹洞箫者」≈ 有一个吹洞箫的人。',
            ],
          },
          {
            type: 'h3',
            text: '四、判断句（少用「是」，靠固定格式表判断）',
          },
          {
            type: 'p',
            text: '现代常用「是」。先秦文言很少用「是」作判断动词，多靠虚词与固定格式：……者，……也 / ……也 / 乃、则、皆、诚 等。',
          },
          {
            type: 'ul',
            items: [
              '「陈胜者，阳城人也。」→ 陈胜是阳城人。',
              '「此则岳阳楼之大观也。」→ 这就是岳阳楼壮丽的景色。',
            ],
          },
          {
            type: 'h3',
            text: '五、被动句（不靠「被」，虚词表被动）',
          },
          {
            type: 'ul',
            items: [
              '标志：于、为、为……所、见、见……于。',
              '例：身死人手 → 身体被别人杀害（被动意味）。',
              '例：茅屋为秋风所破 → 茅草屋被秋风刮破。',
            ],
          },
          {
            type: 'h3',
            text: '六、省略句（考编高频，最容易踩坑）',
          },
          {
            type: 'p',
            text: '古人写文求简洁，常省略主语、宾语、介词宾语「之」等。《愚公移山》「以为神」就是典型：',
          },
          {
            type: 'ul',
            items: [
              '完整理解：（乡人 / 众人）以（之）为神 → 把这件事当作神异。',
              '写成「以为神」时，省略了主语和代词宾语「之」。',
              '考点：以为 = 以（之）为；古义「把……当作」，今义常作「认为」，属古今异义 + 省略。',
            ],
          },
          {
            type: 'tip',
            text: '题干引文必须是原文连续完整语句。像「以君之力……焉置土石」与「以为神」不在同一连续语境，不能硬拼进一题。',
          },
          {
            type: 'h3',
            text: '极简做题步骤（刷题直接套）',
          },
          {
            type: 'ol',
            items: [
              '先把文言句子译成大白话。',
              '对照现代说话语序，看哪个成分位置颠倒。',
              '看到标志词（于、何、之、是、为等）先锁定可能的句式类型。',
              '倒装句统一还原成现代语序，再翻译、再选题。',
            ],
          },
          {
            type: 'h3',
            text: '专项出题备忘',
          },
          {
            type: 'quote',
            text: '生成文言文特殊句式专项练习时：覆盖宾语前置、状语后置、定语后置、省略句等；题干截取《愚公移山》《邹忌讽齐王纳谏》《陋室铭》等必考篇目的连续原文，禁止跨段落拼接；每题标注句式类型，解析写明语序还原过程。',
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
