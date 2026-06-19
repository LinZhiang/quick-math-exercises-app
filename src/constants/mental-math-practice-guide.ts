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
    title: '通用说明',
    articles: [
      {
        id: 'overview',
        title: '玩法与计分',
        category: 'guide',
        blocks: [
          {
            type: 'p',
            text: '口算练习包含四则口算、2 的 n 次幂、平方与立方、估算分数与图形推理。左侧大纲可切换「练习攻略」与各分类模式；本页攻略按难度拆解思路，边练边查。',
          },
          {
            type: 'h3',
            text: '一局流程',
          },
          {
            type: 'ol',
            items: [
              '选择模式 → 321 GO 倒计时 → 限时作答。',
              '键盘按 1～3 / 1～4 / 1～5 对应选项，比鼠标更快。',
              '答对 +1 秒、答错 -1 秒（在剩余时间上增减）。',
              '得分达到 100 分提前结束，播放祝贺音乐并显示剩余时间。',
              '时间到或满分后查看本局记录；成绩仅在本页展示，不写入本地。',
            ],
          },
          {
            type: 'h3',
            text: '测验中操作',
          },
          {
            type: 'ul',
            items: [
              '重来：同模式重新倒计时开新局。',
              '返回：结束本局，回到模式选择。',
            ],
          },
          {
            type: 'tip',
            text: '限时内优先保证正确率；连续答错会扣时，稳住节奏比盲目抢答更重要。',
          },
        ],
      },
      {
        id: 'training-path',
        title: '推荐练习路径',
        category: 'guide',
        blocks: [
          {
            type: 'p',
            text: '由易到难递进，每个阶段以「稳定满分或接近满分」为目标再升级。',
          },
          {
            type: 'ol',
            items: [
              '四则简单 → 四则普通 → 四则高难（或并行练 2 的次幂简单题）。',
              '估算分数简单题 → 高难题；图形推理可与普通四则穿插。',
              '高难四则（多因子速算）与次幂复杂题放在后期冲刺。',
            ],
          },
          {
            type: 'tip',
            text: '每天 2～3 个模式、每个 3～5 局即可；重点复盘错题记录里的表达式与规律说明。',
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
        title: '简单模式',
        category: 'arithmetic',
        practiceModeId: 'easy',
        blocks: [
          {
            type: 'p',
            text: '20 秒 · 个位数加减乘除（-9～9，含负数）· 3 选项 · 对 +4 / 错 -8。',
          },
          {
            type: 'h3',
            text: '加减',
          },
          {
            type: 'ul',
            items: [
              '负数相加：同号相加、异号相减，结果符号跟「绝对值大」的那边。',
              '连减变加：a − (−b) = a + b，先判断符号再算绝对值。',
            ],
          },
          {
            type: 'h3',
            text: '乘法',
          },
          {
            type: 'ul',
            items: [
              '熟记 1～9 乘法表；负数 × 负数 = 正，异号得负。',
              '看到 0 立即选 0，不必完整运算。',
            ],
          },
          {
            type: 'h3',
            text: '除法',
          },
          {
            type: 'ul',
            items: [
              '整除优先：用乘法口诀反推，如 56÷8=7。',
              '除法符号规则与乘法一致。',
            ],
          },
          {
            type: 'tip',
            text: '本模式练「条件反射」：看到式子 1 秒内应出思路，不必动笔。',
          },
        ],
      },
      {
        id: 'arithmetic-normal',
        title: '普通模式',
        category: 'arithmetic',
        practiceModeId: 'normal',
        blocks: [
          {
            type: 'p',
            text: '30 秒 · 两数运算（十位+个位、百位+十位等，不会出现个位+个位）· 4 选项 · 对 +8 / 错 -16。',
          },
          {
            type: 'h3',
            text: '数位组合',
          },
          {
            type: 'ul',
            items: [
              '十位 × 个位：拆成「几十 × 几」，如 47×6 = 40×6 + 7×6 = 282。',
              '百位 + 十位：对齐数位心算，如 156+34 先算 150+30、再 +6+4。',
            ],
          },
          {
            type: 'h3',
            text: '除法',
          },
          {
            type: 'ul',
            items: [
              '十位 ÷ 个位：想乘法，如 72÷8=9。',
              '先估商的大小，再在选项里锁定量级接近的答案。',
            ],
          },
          {
            type: 'h3',
            text: '选项干扰',
          },
          {
            type: 'p',
            text: '干扰项多为漏算一步、多算一步或 ×2/÷2，先心算正确答案再扫选项，避免被「差不多」带走。',
          },
          {
            type: 'tip',
            text: '练熟「十位×个位」后，普通模式应能稳定 80 分以上再挑战高难。',
          },
        ],
      },
      {
        id: 'arithmetic-hard',
        title: '高难模式',
        category: 'arithmetic',
        practiceModeId: 'hard',
        blocks: [
          {
            type: 'p',
            text: '40 秒 · 多因子组合速算（容量估算、连乘连除、两积之和等）· 5 选项 · 对 +14 / 错 -28。',
          },
          {
            type: 'h3',
            text: '两数高难（仍会出现）',
          },
          {
            type: 'ul',
            items: [
              '加减：百位 ± 百位/十位，分段加再合并。',
              '乘除：百位 × 个位/十位，先算整十整百部分再微调。',
            ],
          },
          {
            type: 'h3',
            text: '多因子 / 情景题',
          },
          {
            type: 'ul',
            items: [
              '立体声音频容量：声道数 × 采样 kHz × (位深÷8) × 秒数 ÷ 1024 ≈ MB，先估量级再选。',
              '连乘：从左到右或先凑整，如 3×4×50×2 可先算 3×4=12，再 ×100。',
              '连除再乘：a÷b×c 先算 a÷b，心算熟练后一气呵成。',
              '图像 KB：宽×高×位深÷8÷1024，注意「位」要转「字节」。',
            ],
          },
          {
            type: 'h3',
            text: '考场式选项',
          },
          {
            type: 'p',
            text: '错误选项常来自：忘算声道、位深当字节、少除一次 1024、结果 ×2。先锁定正确量级（如 1～2 MB），再排除离谱项。',
          },
          {
            type: 'tip',
            text: '高难重在「估算法」：不必笔算每一位，先定数量级再精确到选项精度。',
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
            text: '25 秒 · 2ⁿ（2⁻¹～2⁻³ 与 2⁰～2¹²）· 3 选项 · 对 +4 / 错 -8。',
          },
          {
            type: 'h3',
            text: '必背表',
          },
          {
            type: 'ul',
            items: [
              '2⁰=1，2¹=2，2²=4，2³=8，2⁴=16，2⁵=32，2⁶=64，2⁷=128，2⁸=256，2⁹=512，2¹⁰=1024。',
              '2⁻¹=1/2，2⁻²=1/4，2⁻³=1/8（小数形式 0.5、0.25、0.125）。',
            ],
          },
          {
            type: 'h3',
            text: '作答技巧',
          },
          {
            type: 'ul',
            items: [
              '干扰项为相邻次幂，错选往往是 n±1；背熟后应秒选。',
              '负指数：分子 1、分母为 2ⁿ，或记常见小数。',
            ],
          },
          {
            type: 'tip',
            text: '每天默写一遍 2⁰～2¹⁰，一周即可形成肌肉记忆。',
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
            text: '35 秒 · 2ⁿ（2⁻²～2⁻⁶ 与 2¹⁰～2²⁴）· 4 选项 · 对 +12 / 错 -24。',
          },
          {
            type: 'h3',
            text: '大指数',
          },
          {
            type: 'ul',
            items: [
              '2¹⁰=1024 为锚点：2¹¹=2048，2¹²=4096，可递推 ×2。',
              '2²⁰≈1e6 量级：2²⁰=1048576，先记 2¹⁶=65536、再 ×16 到 2²⁰。',
            ],
          },
          {
            type: 'h3',
            text: '负指数扩展',
          },
          {
            type: 'ul',
            items: [
              '2⁻⁴=1/16，2⁻⁵=1/32，2⁻⁶=1/64。',
              '与简单题相同：先判断正负与量级，再在相邻次幂干扰中排除。',
            ],
          },
          {
            type: 'tip',
            text: '复杂题不要求死记 2²⁴，但要熟 2¹⁰～2¹⁶ 递推，高位用 ×2 链快速推。',
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
            text: '25 秒 · 随机 n²（n≤11，不含 10²）或 n³（n≤6）· 3 选项 · 对 +4 / 错 -8。',
          },
          {
            type: 'h3',
            text: '平方（n≤11）',
          },
          {
            type: 'ul',
            items: [
              '先分清题目是平方还是立方，再看底数 n。',
              '1²～6² 应秒出；7²=49、8²=64、9²=81、10²=100、11²=121 需熟记。',
            ],
          },
          {
            type: 'h3',
            text: '立方（n≤6）',
          },
          {
            type: 'ul',
            items: [
              '1³～5³ 建议背熟；6³=216 可记「6×6=36，36×6=216」。',
              '干扰项为相邻 n 的同一次幂，错选多为 n±1 算错。',
            ],
          },
          {
            type: 'tip',
            text: '看到 ²/³ 先定次幂类型，再在相邻底数干扰中排除。',
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
            text: '35 秒 · 随机 n²（7～20，不含 10²）或 n³（3～9）· 4 选项 · 对 +12 / 错 -24。',
          },
          {
            type: 'h3',
            text: '大数平方（7～20）',
          },
          {
            type: 'ul',
            items: [
              '12²=144、13²=169、14²=196、15²=225 为常见锚点，可向两侧递推。',
              '尾数平方：个位只看个位，如 17² 个位同 7²=49 → 尾数 9。',
            ],
          },
          {
            type: 'h3',
            text: '大数立方（3～10）',
          },
          {
            type: 'ul',
            items: [
              '7³=343、8³=512、9³=729 建议分段记忆（不出 10³）。',
              '可先估数量级（如 9³ 在 700 左右）再精确到选项。',
            ],
          },
          {
            type: 'tip',
            text: '复杂题干扰范围 ±3 个底数，先锁定次幂类型与量级再细算。',
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
            text: '25 秒 · 常见百分数转最简分数 / 同分母或简单分数比大小 · 3 选项 · 对 +4 / 错 -8。',
          },
          {
            type: 'h3',
            text: '百分数转分数',
          },
          {
            type: 'ul',
            items: [
              '50%=1/2，25%=1/4，75%=3/4，20%=1/5，10%=1/10，100%=1。',
              '口诀：分母 100 化简，或记「常用百分数表」。',
            ],
          },
          {
            type: 'h3',
            text: '比大小',
          },
          {
            type: 'ul',
            items: [
              '同分母：比分子；同分子：分母大分数小。',
              '如 3/7 与 3/8：分子同，7<8 故 3/7 > 3/8。',
            ],
          },
          {
            type: 'tip',
            text: '先判断题型是「转分数」还是「比大小」，再选策略，避免混用。',
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
            text: '35 秒 · 含 12.5%、33% 等 / 异分母接近分数比大小 · 4 选项 · 对 +8 / 错 -16。',
          },
          {
            type: 'h3',
            text: '特殊百分数',
          },
          {
            type: 'ul',
            items: [
              '12.5%=1/8，37.5%=3/8，62.5%=5/8，87.5%=7/8。',
              '33%≈1/3，67%≈2/3；17%≈1/6，83%≈5/6。',
            ],
          },
          {
            type: 'h3',
            text: '异分母比大小',
          },
          {
            type: 'ul',
            items: [
              '通分心算：看两分数乘积交叉 a×d 与 b×c。',
              '接近 1/2、1/3 的分数可估：如 4/9 略小于 1/2。',
            ],
          },
          {
            type: 'tip',
            text: '高难百分数建议单独背「八分之一系」与「六分之一系」，考场上秒反应。',
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
        title: '图形推理',
        category: 'graphic',
        practiceModeId: 'graphic',
        blocks: [
          {
            type: 'p',
            text: '35 秒 · 程序化规律 · 4 选项 · 对 +8 / 错 -16。立体折叠等真题图请自行刷题，本模式练常见规律条件反射。',
          },
          {
            type: 'h3',
            text: '常见规律速查',
          },
          {
            type: 'ul',
            items: [
              '旋转：整体或标记顺时针转 90°/固定角度。',
              '形状循环：圆 → 方 → 三角 轮换。',
              '数量：圆点、线条、标记个数每次 +1。',
              '填色交替：实心 / 空心切换。',
              '平移：元素在格内按固定方向移动。',
              '四宫格：按左上→右上→左下→右下顺序填色或递增。',
            ],
          },
          {
            type: 'h3',
            text: '作答步骤',
          },
          {
            type: 'ol',
            items: [
              '先看「数量、位置、形状、颜色」哪一类在变。',
              '用前两格验证假设，第三格确认规律。',
              '在 4 个选项中找唯一符合延续规律的图形。',
            ],
          },
          {
            type: 'tip',
            text: '答错时看规律说明（如「圆点每次 +1」），同一类规律连续练几局即可提速。',
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
