/**
 * 公式背诵：数量关系公式 + 资料分析术语/公式。
 * 全部「普通题」：正计时、四选一、提交停表看答案；每轮 10 题。
 * 去重：模块内未出优先，出完一轮后重置再循环。
 *
 * 数量关系：
 * 1. 行程·溶液·几何
 * 2. 排列组合·容斥·计数
 * 3. 计算·数列·钟表
 * 资料分析：
 * 4. 增长与比较术语
 * 5. 比重·贡献·成数翻番
 * 6. 经贸指标与规划时期
 * 7. 比例相关（现期/基期/两期）
 * 8. 增长相关（增长率/增长量/基期现期计算）
 */
import { assembleFourChoiceMcq } from '@/utils/chineseMcqAiFields'

export type FormulaReciteModuleId =
  | 'travel-sol-geo'
  | 'perm-incl-count'
  | 'calc-seq-clock'
  | 'da-growth'
  | 'da-share'
  | 'da-indicator'
  | 'da-ratio'
  | 'da-growth-calc'

export const FORMULA_RECITE_QUESTION_COUNT = 10

export const FORMULA_RECITE_MODES: {
  id: FormulaReciteModuleId
  label: string
  desc: string
}[] = [
  {
    id: 'travel-sol-geo',
    label: '行程·溶液·几何',
    desc: '普通题 · 每轮 10 题 · 路程速度、浓度、平面/立体公式 · 可查看公式',
  },
  {
    id: 'perm-incl-count',
    label: '排列组合·容斥·计数',
    desc: '普通题 · 每轮 10 题 · 排列组合、容斥、植树方阵牛吃草 · 可查看公式',
  },
  {
    id: 'calc-seq-clock',
    label: '计算·数列·钟表',
    desc: '普通题 · 每轮 10 题 · 代数恒等式、等差等比、周期钟表 · 可查看公式',
  },
  {
    id: 'da-growth',
    label: '资料·增长与比较',
    desc: '普通题 · 每轮 10 题 · 现期基期、增长量率、年均/拉动、同比环比、百分数百分点',
  },
  {
    id: 'da-share',
    label: '资料·比重贡献翻番',
    desc: '普通题 · 每轮 10 题 · 比重、增长贡献率、成数、翻番',
  },
  {
    id: 'da-indicator',
    label: '资料·经贸指标与时期',
    desc: '普通题 · 每轮 10 题 · 顺差逆差、指数、恩格尔/基尼、五年规划、GDP',
  },
  {
    id: 'da-ratio',
    label: '资料·比例相关',
    desc: '普通题 · 每轮 10 题 · 现期/基期比例、两期升降与差值、平均数增长率 · 可查看公式',
  },
  {
    id: 'da-growth-calc',
    label: '资料·增长相关',
    desc: '普通题 · 每轮 10 题 · 一般/混合/间隔/年均增长率、增长量、基期现期计算 · 可查看公式',
  },
]

export type FormulaParam = {
  /** 可走公式渲染，如 a_{n}、V_{1} */
  symbol: string
  meaning: string
}

export type FormulaEntry = {
  id: string
  moduleId: FormulaReciteModuleId
  group: string
  name: string
  /** 供 renderDataAnalysisMathHtml 渲染：分式用 (a)/(b)，幂用 ^n */
  formula: string
  /** 字母/符号参数说明，便于对照教材理解 */
  params?: FormulaParam[]
}

const FP = {
  svt: [
    { symbol: 's', meaning: '路程' },
    { symbol: 'v', meaning: '速度' },
    { symbol: 't', meaning: '时间' },
  ],
  avgV: [
    { symbol: 'V_{1}', meaning: '去程（或第一段）速度' },
    { symbol: 'V_{2}', meaning: '回程（或第二段）速度' },
  ],
  nGon: [{ symbol: 'n', meaning: '多边形的边数' }],
  sq: [
    { symbol: 'C', meaning: '周长' },
    { symbol: 'S', meaning: '面积' },
    { symbol: 'a', meaning: '边长' },
  ],
  rect: [
    { symbol: 'C', meaning: '周长' },
    { symbol: 'S', meaning: '面积' },
    { symbol: 'a', meaning: '长' },
    { symbol: 'b', meaning: '宽' },
  ],
  circle: [
    { symbol: 'C', meaning: '周长' },
    { symbol: 'S', meaning: '面积' },
    { symbol: 'r', meaning: '半径' },
    { symbol: 'π', meaning: '圆周率' },
  ],
  tri: [
    { symbol: 'S', meaning: '面积' },
    { symbol: 'a', meaning: '底边长' },
    { symbol: 'h', meaning: '高' },
  ],
  trap: [
    { symbol: 'S', meaning: '面积' },
    { symbol: 'a', meaning: '上底' },
    { symbol: 'b', meaning: '下底' },
    { symbol: 'h', meaning: '高' },
  ],
  sector: [
    { symbol: 'S', meaning: '面积' },
    { symbol: 'n', meaning: '圆心角度数' },
    { symbol: 'r', meaning: '半径' },
    { symbol: 'π', meaning: '圆周率' },
  ],
  cube: [
    { symbol: 'S', meaning: '表面积' },
    { symbol: 'V', meaning: '体积' },
    { symbol: 'a', meaning: '棱长' },
  ],
  box: [
    { symbol: 'S', meaning: '表面积' },
    { symbol: 'V', meaning: '体积' },
    { symbol: 'a', meaning: '长' },
    { symbol: 'b', meaning: '宽' },
    { symbol: 'c', meaning: '高' },
  ],
  sphere: [
    { symbol: 'S', meaning: '表面积' },
    { symbol: 'V', meaning: '体积' },
    { symbol: 'R', meaning: '半径' },
    { symbol: 'D', meaning: '直径' },
    { symbol: 'π', meaning: '圆周率' },
  ],
  cyl: [
    { symbol: 'S', meaning: '表面积' },
    { symbol: 'S侧', meaning: '侧面积' },
    { symbol: 'V', meaning: '体积' },
    { symbol: 'r', meaning: '底面半径' },
    { symbol: 'h', meaning: '高' },
    { symbol: 'π', meaning: '圆周率' },
  ],
  cone: [
    { symbol: 'V', meaning: '体积' },
    { symbol: 'r', meaning: '底面半径' },
    { symbol: 'h', meaning: '高' },
    { symbol: 'π', meaning: '圆周率' },
  ],
  scale: [{ symbol: 'n', meaning: '相似比（对应边的放大/缩小倍数）' }],
  perm: [
    { symbol: 'A_{n}^{m}', meaning: '从 n 个不同元素中取 m 个的排列数' },
    { symbol: 'n', meaning: '元素总数' },
    { symbol: 'm', meaning: '取出的个数' },
    { symbol: 'n!', meaning: 'n 的阶乘（1×2×…×n）' },
  ],
  comb: [
    { symbol: 'C_{n}^{m}', meaning: '从 n 个不同元素中取 m 个的组合数' },
    { symbol: 'A_{n}^{m}', meaning: '从 n 个中取 m 个的排列数' },
    { symbol: 'n', meaning: '元素总数' },
    { symbol: 'm', meaning: '取出的个数' },
    { symbol: 'n!', meaning: 'n 的阶乘' },
  ],
  ie2: [
    { symbol: 'A', meaning: '满足条件甲的数量' },
    { symbol: 'B', meaning: '满足条件乙的数量' },
    { symbol: 'A∩B', meaning: '同时满足甲、乙的数量（交集）' },
    { symbol: '都不', meaning: '两个条件都不满足的数量' },
  ],
  ie3: [
    { symbol: 'A、B、C', meaning: '分别满足三个条件的数量' },
    { symbol: 'A∩B 等', meaning: '两两交集' },
    { symbol: 'A∩B∩C', meaning: '三个条件都满足的数量' },
    { symbol: '都不', meaning: '三个条件都不满足的数量' },
  ],
  phN: [{ symbol: 'N', meaning: '正方形方阵每边人数（或边长）' }],
  phMN: [
    { symbol: 'M', meaning: '长方形方阵一边人数' },
    { symbol: 'N', meaning: '长方形方阵另一边人数' },
  ],
  abc: [
    { symbol: 'a、b、c', meaning: '任意实数（参与运算的量）' },
  ],
  arith: [
    { symbol: 'a_{n}', meaning: '第 n 项' },
    { symbol: 'a_{1}', meaning: '首项（第 1 项）' },
    { symbol: 'a_{m}', meaning: '第 m 项' },
    { symbol: 'n', meaning: '项的序号；求和时也表示项数' },
    { symbol: 'm', meaning: '另一项的序号' },
    { symbol: 'd', meaning: '公差（后项减前项）' },
    { symbol: 'S_{n}', meaning: '前 n 项的和' },
  ],
  geom: [
    { symbol: 'a_{n}', meaning: '第 n 项' },
    { symbol: 'a_{1}', meaning: '首项' },
    { symbol: 'a_{m}', meaning: '第 m 项' },
    { symbol: 'n', meaning: '项的序号；求和时也表示项数' },
    { symbol: 'm', meaning: '另一项的序号' },
    { symbol: 'q', meaning: '公比（后项除以前项）' },
    { symbol: 'S_{n}', meaning: '前 n 项的和' },
  ],
  cycM: [{ symbol: 'm', meaning: '除法得到的余数（用于定位周期内第几项）' }],
  cycN: [{ symbol: 'n', meaning: '间隔天数或重复次数相关的正整数' }],
  daAB: [
    { symbol: 'A', meaning: '现期分子（部分/被比量）' },
    { symbol: 'B', meaning: '现期分母（整体/对比量）' },
    { symbol: 'a', meaning: '分子 A 的同比增长率' },
    { symbol: 'b', meaning: '分母 B 的同比增长率' },
  ],
  daR: [
    { symbol: 'r', meaning: '增长率' },
    { symbol: '现期量', meaning: '当前时期数值' },
    { symbol: '基期量', meaning: '对比基期数值' },
  ],
  daInterval: [
    { symbol: 'r₁', meaning: '第一段时期的增长率' },
    { symbol: 'r₂', meaning: '第二段时期的增长率' },
    { symbol: 'r间隔', meaning: '间隔增长率' },
  ],
  daNyear: [{ symbol: 'n', meaning: '现期与基期的年份差' }],
  daBaihua: [
    { symbol: 'n', meaning: '把增长率写成 1/n 时的分母' },
    { symbol: '现期量', meaning: '当前时期数值' },
  ],
} as const satisfies Record<string, FormulaParam[]>

export function formatFormulaParamsLegend(params: FormulaParam[] | undefined): string {
  if (!params?.length) return ''
  return params.map((p) => `${p.symbol}：${p.meaning}`).join('；')
}

/** 仅含公式/定量关系；不含纯文字策略与例题 */
export const FORMULA_RECITE_CATALOG: FormulaEntry[] = [
  // —— 模块1：行程·溶液·几何 ——
  {
    id: 'tr-svt',
    moduleId: 'travel-sol-geo',
    group: '普通行程',
    name: '路程公式',
    formula: '路程 = 速度 × 时间（s = vt）',
    params: [...FP.svt],
  },
  {
    id: 'tr-avg',
    moduleId: 'travel-sol-geo',
    group: '普通行程',
    name: '等距离平均速度',
    formula: '等距离平均速度 = (2V_{1}V_{2})/(V_{1}+V_{2})',
    params: [...FP.avgV],
  },
  {
    id: 'tr-bridge-full',
    moduleId: 'travel-sol-geo',
    group: '普通行程',
    name: '火车完全通过桥',
    formula: '所走路程 = 桥长 + 火车长',
  },
  {
    id: 'tr-bridge-on',
    moduleId: 'travel-sol-geo',
    group: '普通行程',
    name: '火车完全在桥上',
    formula: '所走路程 = 桥长 − 火车长',
  },
  {
    id: 'sol-conc',
    moduleId: 'travel-sol-geo',
    group: '溶液问题',
    name: '浓度定义',
    formula: '浓度 = (溶质质量)/(溶液质量)',
  },
  {
    id: 'sol-sum',
    moduleId: 'travel-sol-geo',
    group: '溶液问题',
    name: '溶液组成',
    formula: '溶液质量 = 溶质质量 + 溶剂质量',
  },
  {
    id: 'sol-solute',
    moduleId: 'travel-sol-geo',
    group: '溶液问题',
    name: '求溶质质量',
    formula: '溶质质量 = 溶液质量 × 浓度',
  },
  {
    id: 'sol-solution',
    moduleId: 'travel-sol-geo',
    group: '溶液问题',
    name: '求溶液质量',
    formula: '溶液质量 = (溶质质量)/(浓度)',
  },
  {
    id: 'sol-dilute',
    moduleId: 'travel-sol-geo',
    group: '溶液问题',
    name: '稀释后浓度（溶液不变型）',
    formula: '稀释后浓度 = 初始浓度 × 剩下后的比例',
  },
  {
    id: 'geo-int-ang',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: 'n边形内角和',
    formula: '内角和 = (n−2)×180°',
    params: [...FP.nGon],
  },
  {
    id: 'geo-ext-ang',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '多边形外角和',
    formula: '外角和 = 360°',
  },
  {
    id: 'geo-sq-c',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '正方形周长',
    formula: 'C = 4a',
    params: [...FP.sq],
  },
  {
    id: 'geo-sq-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '正方形面积',
    formula: 'S = a^2',
    params: [...FP.sq],
  },
  {
    id: 'geo-rect-c',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '长方形周长',
    formula: 'C = 2(a+b)',
    params: [...FP.rect],
  },
  {
    id: 'geo-rect-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '长方形面积',
    formula: 'S = ab',
    params: [...FP.rect],
  },
  {
    id: 'geo-cir-c',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '圆周长',
    formula: 'C = 2πr',
    params: [...FP.circle],
  },
  {
    id: 'geo-cir-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '圆面积',
    formula: 'S = πr^2',
    params: [...FP.circle],
  },
  {
    id: 'geo-tri-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '三角形面积',
    formula: 'S = (1)/(2)ah',
    params: [...FP.tri],
  },
  {
    id: 'geo-para-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '平行四边形面积',
    formula: 'S = ah',
    params: [...FP.tri],
  },
  {
    id: 'geo-trap-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '梯形面积',
    formula: 'S = (1)/(2)(a+b)h',
    params: [...FP.trap],
  },
  {
    id: 'geo-sec-s',
    moduleId: 'travel-sol-geo',
    group: '平面几何',
    name: '扇形面积',
    formula: 'S = (n)/(360)πr^2',
    params: [...FP.sector],
  },
  {
    id: 'geo-cube-s',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '正方体表面积',
    formula: 'S = 6a^2',
    params: [...FP.cube],
  },
  {
    id: 'geo-cube-v',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '正方体体积',
    formula: 'V = a^3',
    params: [...FP.cube],
  },
  {
    id: 'geo-box-s',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '长方体表面积',
    formula: 'S = 2(ab+bc+ac)',
    params: [...FP.box],
  },
  {
    id: 'geo-box-v',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '长方体体积',
    formula: 'V = abc',
    params: [...FP.box],
  },
  {
    id: 'geo-sph-s',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '球表面积',
    formula: 'S = 4πR^2 = πD^2',
    params: [...FP.sphere],
  },
  {
    id: 'geo-sph-v',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '球体积',
    formula: 'V = (4)/(3)πR^3 = (1)/(6)πD^3',
    params: [...FP.sphere],
  },
  {
    id: 'geo-cyl-s',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '圆柱表面积',
    formula: 'S = 2πrh + 2πr^2',
    params: [...FP.cyl],
  },
  {
    id: 'geo-cyl-lat',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '圆柱侧面积',
    formula: 'S侧 = 2πrh',
    params: [...FP.cyl],
  },
  {
    id: 'geo-cyl-v',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '圆柱体积',
    formula: 'V = πr^2h',
    params: [...FP.cyl],
  },
  {
    id: 'geo-cone-v',
    moduleId: 'travel-sol-geo',
    group: '立体几何',
    name: '圆锥体积',
    formula: 'V = (1)/(3)πr^2h',
    params: [...FP.cone],
  },
  {
    id: 'geo-scale',
    moduleId: 'travel-sol-geo',
    group: '几何特性',
    name: '等比例放缩',
    formula: '相似比 n：角度不变；长度×n；面积×n^2；体积×n^3',
    params: [...FP.scale],
  },

  // —— 模块2：排列组合·容斥·计数 ——
  {
    id: 'pc-add',
    moduleId: 'perm-incl-count',
    group: '基本原理',
    name: '分类加法原理',
    formula: '分类完成：总办法数 = 各类办法数之和',
  },
  {
    id: 'pc-mul',
    moduleId: 'perm-incl-count',
    group: '基本原理',
    name: '分步乘法原理',
    formula: '分步完成：总办法数 = 各步办法数之积',
  },
  {
    id: 'pc-perm',
    moduleId: 'perm-incl-count',
    group: '排列组合',
    name: '排列公式',
    formula: 'A_{n}^{m} = (n!)/((n−m)!) = n(n−1)(n−2)⋯(n−m+1)',
    params: [...FP.perm],
  },
  {
    id: 'pc-comb',
    moduleId: 'perm-incl-count',
    group: '排列组合',
    name: '组合公式',
    formula:
      'C_{n}^{m} = (n!)/(m!(n−m)!) = (A_{n}^{m})/(m!) = (n(n−1)⋯(n−m+1))/(m(m−1)⋯1)',
    params: [...FP.comb],
  },
  {
    id: 'pc-sym',
    moduleId: 'perm-incl-count',
    group: '排列组合',
    name: '组合对称性',
    formula: 'C_{n}^{m} = C_{n}^{n−m}',
    params: [...FP.comb],
  },
  {
    id: 'ie-two',
    moduleId: 'perm-incl-count',
    group: '容斥原理',
    name: '两集合公式',
    formula: 'A + B − A∩B = 总数 − 都不',
    params: [...FP.ie2],
  },
  {
    id: 'ie-three',
    moduleId: 'perm-incl-count',
    group: '容斥原理',
    name: '三集合标准型',
    formula: 'A+B+C − A∩B − A∩C − B∩C + A∩B∩C = 总数 − 都不',
    params: [...FP.ie3],
  },
  {
    id: 'ie-three-ns',
    moduleId: 'perm-incl-count',
    group: '容斥原理',
    name: '三集合非标准型',
    formula: 'A+B+C − 只满足两项 − 满足三项×2 = 总数 − 都不',
    params: [...FP.ie3],
  },
  {
    id: 'ie-common',
    moduleId: 'perm-incl-count',
    group: '容斥原理',
    name: '三集合常识型',
    formula: '只满足一项 + 只满足两项 + 满足三项 = 总数 − 都不',
    params: [...FP.ie3],
  },
  {
    id: 'cnt-line',
    moduleId: 'perm-incl-count',
    group: '植树问题',
    name: '单边线形植树',
    formula: '棵数 = 总长÷间隔 + 1；总长 = (棵数−1)×间隔',
  },
  {
    id: 'cnt-build',
    moduleId: 'perm-incl-count',
    group: '植树问题',
    name: '单边楼间植树',
    formula: '棵数 = 总长÷间隔 − 1；总长 = (棵数+1)×间隔',
  },
  {
    id: 'cnt-ring',
    moduleId: 'perm-incl-count',
    group: '植树问题',
    name: '环形植树',
    formula: '棵数 = 总长÷间隔；总长 = 棵数×间隔',
  },
  {
    id: 'cnt-both',
    moduleId: 'perm-incl-count',
    group: '植树问题',
    name: '两侧植树',
    formula: '两侧都植树：在单侧结果基础上 ×2',
  },
  {
    id: 'ph-sq',
    moduleId: 'perm-incl-count',
    group: '方阵问题',
    name: '正方形实心方阵总人数',
    formula: '总人数 = N^2',
    params: [...FP.phN],
  },
  {
    id: 'ph-rect',
    moduleId: 'perm-incl-count',
    group: '方阵问题',
    name: '长方形实心方阵总人数',
    formula: '总人数 = MN',
    params: [...FP.phMN],
  },
  {
    id: 'ph-sq-out',
    moduleId: 'perm-incl-count',
    group: '方阵问题',
    name: '正方形方阵最外层人数',
    formula: '最外层人数 = 4N − 4',
    params: [...FP.phN],
  },
  {
    id: 'ph-rect-out',
    moduleId: 'perm-incl-count',
    group: '方阵问题',
    name: '长方形方阵最外层人数',
    formula: '最外层人数 = 2(M+N) − 4',
    params: [...FP.phMN],
  },
  {
    id: 'cow',
    moduleId: 'perm-incl-count',
    group: '牛吃草问题',
    name: '牛吃草核心公式',
    formula: '草地原有草量 = (牛吃草效率 − 每天长草效率) × 天数',
  },

  // —— 模块3：计算·数列·钟表 ——
  {
    id: 'cal-comm',
    moduleId: 'calc-seq-clock',
    group: '基础计算',
    name: '交换律',
    formula: 'a×b = b×a；a+b = b+a',
    params: [...FP.abc],
  },
  {
    id: 'cal-dist',
    moduleId: 'calc-seq-clock',
    group: '基础计算',
    name: '乘法分配律',
    formula: '(a+b)c = ac + bc',
    params: [...FP.abc],
  },
  {
    id: 'cal-diff-sq',
    moduleId: 'calc-seq-clock',
    group: '基础计算',
    name: '平方差公式',
    formula: '(a+b)(a−b) = a^2 − b^2',
    params: [...FP.abc],
  },
  {
    id: 'cal-perf-sq',
    moduleId: 'calc-seq-clock',
    group: '基础计算',
    name: '完全平方公式',
    formula: '(a±b)^2 = a^2 ± 2ab + b^2',
    params: [...FP.abc],
  },
  {
    id: 'cal-avg',
    moduleId: 'calc-seq-clock',
    group: '平均数',
    name: '平均数定义',
    formula: '平均数 = 总数 ÷ 份数',
  },
  {
    id: 'ar-an',
    moduleId: 'calc-seq-clock',
    group: '等差数列',
    name: '等差数列通项',
    formula: 'a_{n} = a_{1} + (n−1)d = a_{m} + (n−m)d',
    params: [...FP.arith],
  },
  {
    id: 'ar-sn1',
    moduleId: 'calc-seq-clock',
    group: '等差数列',
    name: '等差数列求和（首项公差）',
    formula: 'S_{n} = na_{1} + (n(n−1))/(2)×d',
    params: [...FP.arith],
  },
  {
    id: 'ar-sn2',
    moduleId: 'calc-seq-clock',
    group: '等差数列',
    name: '等差数列求和（首末项）',
    formula: 'S_{n} = (a_{1}+a_{n})/(2)×n = 中位数 × 项数',
    params: [...FP.arith],
  },
  {
    id: 'geo-an',
    moduleId: 'calc-seq-clock',
    group: '等比数列',
    name: '等比数列通项',
    formula: 'a_{n} = a_{1} × q^{n−1} = a_{m} × q^{n−m}',
    params: [...FP.geom],
  },
  {
    id: 'geo-sn',
    moduleId: 'calc-seq-clock',
    group: '等比数列',
    name: '等比数列求和',
    formula: 'S_{n} = a_{1} × (1−q^{n})/(1−q)（q≠1）',
    params: [...FP.geom],
  },
  {
    id: 'cyc-rem',
    moduleId: 'calc-seq-clock',
    group: '周期问题',
    name: '周期余数定位',
    formula: '总数 ÷ 每周期项数 = 周期数 … 余数 m → 取周期内第 m 项',
    params: [...FP.cycM],
  },
  {
    id: 'cyc-every',
    moduleId: 'calc-seq-clock',
    group: '周期问题',
    name: '每隔 n 天',
    formula: '「每隔 n 天」=「每 (n+1) 天」',
    params: [...FP.cycN],
  },
  {
    id: 'clk-unit',
    moduleId: 'calc-seq-clock',
    group: '钟表问题',
    name: '钟面基本单位',
    formula: '一周 360°；一大格 30°；一小格 6°',
  },
  {
    id: 'clk-speed',
    moduleId: 'calc-seq-clock',
    group: '钟表问题',
    name: '时针分针速度',
    formula: '时针 0.5°/分；分针 6°/分；速度差 5.5°/分；速度比 1:12',
  },
  {
    id: 'clk-angle',
    moduleId: 'calc-seq-clock',
    group: '钟表问题',
    name: '夹角与时间差',
    formula: '夹角差 = 5.5 × 时间差（分钟）',
  },

  // —— 模块4：资料·增长与比较 ——
  {
    id: 'da-base-cur',
    moduleId: 'da-growth',
    group: '现期与基期',
    name: '现期量与基期量',
    formula: '基期量：作为对比参照的量；现期量：相对于基期、被拿来比较的量',
    params: [
      { symbol: 'A', meaning: '「与 A 相比，B…」中的参照（基期）' },
      { symbol: 'B', meaning: '被比较的对象（现期）' },
    ],
  },
  {
    id: 'da-yoy-base',
    moduleId: 'da-growth',
    group: '现期与基期',
    name: '同比隐含基期',
    formula: '现期为某年时，「同比增长」的基期一般为上一年同期（上年）',
    params: [
      { symbol: '现期', meaning: '材料给出的当前年份/时期数据' },
      { symbol: '基期', meaning: '对比参照的上年（或上年同期）数据' },
    ],
  },
  {
    id: 'da-delta',
    moduleId: 'da-growth',
    group: '增长量与增长率',
    name: '增长量（两式）',
    formula: '增长量 = 现期量 − 基期量 = 基期量 × 增长率',
    params: [
      { symbol: '现期量', meaning: '当前时期的数值' },
      { symbol: '基期量', meaning: '对比基期的数值' },
      { symbol: '增长率', meaning: '相对基期的增长比例' },
    ],
  },
  {
    id: 'da-rate1',
    moduleId: 'da-growth',
    group: '增长量与增长率',
    name: '增长率（现期基期）',
    formula: '增长率 = (现期量 − 基期量)/(基期量)',
    params: [
      { symbol: '现期量', meaning: '当前时期数值' },
      { symbol: '基期量', meaning: '对比基期数值' },
    ],
  },
  {
    id: 'da-rate2',
    moduleId: 'da-growth',
    group: '增长量与增长率',
    name: '增长率（增长量）',
    formula: '增长率 = (增长量)/(基期量) = (增长量)/(现期量 − 增长量)',
    params: [
      { symbol: '增长量', meaning: '现期相对基期增加的绝对量' },
      { symbol: '基期量', meaning: '对比基期数值' },
      { symbol: '现期量', meaning: '当前时期数值' },
    ],
  },
  {
    id: 'da-rate-alias',
    moduleId: 'da-growth',
    group: '增长量与增长率',
    name: '增长率同义表述',
    formula: '未特殊说明时：增长率 = 增长幅度（增幅）= 增长速度（增速）',
  },
  {
    id: 'da-amt-vs-rate',
    moduleId: 'da-growth',
    group: '增长量与增长率',
    name: '增长量与增长率辨析',
    formula: '问「增长了多少」时：选项带单位→增长量；选项为百分数→增长率',
  },
  {
    id: 'da-cagr',
    moduleId: 'da-growth',
    group: '年均增长率',
    name: '年均增长率（复合增长率）',
    formula: '现期量 = 基期量 × (1 + 年均增长率)^n',
    params: [
      { symbol: 'n', meaning: '现期与基期的年份差（间隔年数）' },
      { symbol: '现期量', meaning: '末期数值' },
      { symbol: '基期量', meaning: '初期数值' },
    ],
  },
  {
    id: 'da-pull',
    moduleId: 'da-growth',
    group: '拉动增长',
    name: '拉动增长率',
    formula: 'B 拉动 A 增长 x% = (B 的增长量)/(A 的基期量)',
    params: [
      { symbol: 'A', meaning: '整体' },
      { symbol: 'B', meaning: '整体中的部分' },
      { symbol: 'x%', meaning: '部分增长对整体的拉动（百分点表述时同算）' },
    ],
  },
  {
    id: 'da-yoy',
    moduleId: 'da-growth',
    group: '同比与环比',
    name: '同比',
    formula: '同比：与历史同期相比（通常为上年同月/同季/全年对上年全年）',
    params: [
      { symbol: '例', meaning: '2024 年 4 月同比 → 对比 2023 年 4 月' },
    ],
  },
  {
    id: 'da-mom',
    moduleId: 'da-growth',
    group: '同比与环比',
    name: '环比',
    formula: '环比：与相邻上一统计周期相比（日/周/月/季；考试多为月、季）',
    params: [
      { symbol: '月环比例', meaning: '2020 年 8 月环比 → 对比 2020 年 7 月' },
      { symbol: '季环比例', meaning: '2022 年一季度环比 → 对比 2021 年四季度' },
    ],
  },
  {
    id: 'da-pct',
    moduleId: 'da-growth',
    group: '百分数与百分点',
    name: '百分数',
    formula: '百分数：分母为 100 的分数，用 % 表示；用于描述增长率或比例本身',
  },
  {
    id: 'da-pp',
    moduleId: 'da-growth',
    group: '百分数与百分点',
    name: '百分点',
    formula: '百分点：两个百分数（或相对指标）作差的单位；1 个百分点 = 1%',
    params: [
      { symbol: '例', meaning: '增速 10.4% 比 8.9% 高 1.5 个百分点（不能说高 1.5%）' },
    ],
  },

  // —— 模块5：资料·比重贡献翻番 ——
  {
    id: 'da-proportion',
    moduleId: 'da-share',
    group: '比重',
    name: '比重',
    formula: '比重 = (部分)/(整体)',
    params: [
      { symbol: '部分', meaning: '整体中的某一组成部分' },
      { symbol: '整体', meaning: '全部总量' },
    ],
  },
  {
    id: 'da-contrib-rate',
    moduleId: 'da-share',
    group: '增长贡献率',
    name: '增长贡献率',
    formula: '增长贡献率 = (部分增长量)/(整体增长量)',
    params: [
      { symbol: '部分增长量', meaning: '某一部分相对基期的增量' },
      { symbol: '整体增长量', meaning: '整体相对基期的增量' },
    ],
  },
  {
    id: 'da-share-vs-contrib',
    moduleId: 'da-share',
    group: '增长贡献率',
    name: '比重与增长贡献率区分',
    formula: '比重用「部分/整体」总量；增长贡献率用「部分增长量/整体增长量」',
  },
  {
    id: 'da-cheng',
    moduleId: 'da-share',
    group: '成数与翻番',
    name: '成数',
    formula: '几成 = 十分之几；如三成 = (3)/(10) = 30%',
    params: [{ symbol: '成', meaning: '十分之一；三成即 30%' }],
  },
  {
    id: 'da-fan1',
    moduleId: 'da-share',
    group: '成数与翻番',
    name: '翻番含义',
    formula: '翻 1 番 = 原来的 2 倍；翻 2 番 = 原来的 4 倍',
  },
  {
    id: 'da-fann',
    moduleId: 'da-share',
    group: '成数与翻番',
    name: '翻 n 番',
    formula: '翻 n 番 = 原来的 2^n 倍',
    params: [{ symbol: 'n', meaning: '翻番的次数' }],
  },
  {
    id: 'da-fan3',
    moduleId: 'da-share',
    group: '成数与翻番',
    name: '翻 3 番易错',
    formula: '翻 3 番 = 原来的 2^3 = 8 倍（不是 6 倍）',
    params: [{ symbol: 'n', meaning: '此处 n = 3' }],
  },
  {
    id: 'da-pull-pp',
    moduleId: 'da-share',
    group: '拉动增长',
    name: '拉动增长（百分点表述）',
    formula: '部分增长量 ÷ 整体基期量，结果常用「拉动…个百分点」表述',
    params: [
      { symbol: '分子', meaning: '部分的增长量' },
      { symbol: '分母', meaning: '整体的基期量' },
    ],
  },

  // —— 模块6：资料·经贸指标与时期 ——
  {
    id: 'da-surplus',
    moduleId: 'da-indicator',
    group: '顺差与逆差',
    name: '顺差',
    formula: '出口额 > 进口额 → 顺差（又称对外贸易顺差、净出口额、出超）',
    params: [
      { symbol: '顺差', meaning: '出口额 − 进口额（正值）' },
    ],
  },
  {
    id: 'da-deficit',
    moduleId: 'da-indicator',
    group: '顺差与逆差',
    name: '逆差',
    formula: '出口额 < 进口额 → 逆差（又称净进口额、入超）',
    params: [
      { symbol: '逆差', meaning: '进口额 − 出口额（或出口减进口得负）' },
    ],
  },
  {
    id: 'da-index',
    moduleId: 'da-indicator',
    group: '指数',
    name: '指数定义',
    formula: '指数：衡量某要素相对变化的指标；一般将基期量定为 100，现期量与基期量的比值称指数',
    params: [
      { symbol: '基期指数', meaning: '通常取 100' },
      { symbol: '现期指数', meaning: '相对基期的相对水平' },
    ],
  },
  {
    id: 'da-index-rate',
    moduleId: 'da-indicator',
    group: '指数',
    name: '指数与增长率',
    formula: '实际量增长率 = 指数增长率；两期实际量之比 = 两期指数之比',
    params: [
      { symbol: '例', meaning: '指数 100→101.65，增速 = (101.65−100)/100 = 1.65%' },
    ],
  },
  {
    id: 'da-index-tip',
    moduleId: 'da-indicator',
    group: '指数',
    name: '指数含义注意',
    formula: '指数一般反映相对变化，不直接表示绝对规模大小',
  },
  {
    id: 'da-gdp',
    moduleId: 'da-indicator',
    group: 'GDP 与三次产业',
    name: 'GDP',
    formula: 'GDP（国内生产总值）= 一、二、三产业增加值之和',
  },
  {
    id: 'da-industry',
    moduleId: 'da-indicator',
    group: 'GDP 与三次产业',
    name: '三次产业概要',
    formula: '第一产业：农林牧渔（不含专业辅助）；第二产业：工矿制造水电热气水及建筑等；第三产业：服务业（除此一二产业外）',
  },
  {
    id: 'da-engel',
    moduleId: 'da-indicator',
    group: '恩格尔与基尼',
    name: '恩格尔系数',
    formula: '恩格尔系数 = (食品消费支出)/(总消费支出)×100%',
    params: [
      { symbol: '食品消费支出', meaning: '用于食品的消费' },
      { symbol: '总消费支出', meaning: '全部消费支出' },
    ],
  },
  {
    id: 'da-engel-mean',
    moduleId: 'da-indicator',
    group: '恩格尔与基尼',
    name: '恩格尔系数含义',
    formula: '恩格尔系数越低，通常表明该地区居民生活水平越高',
  },
  {
    id: 'da-gini',
    moduleId: 'da-indicator',
    group: '恩格尔与基尼',
    name: '基尼系数',
    formula: '基尼系数取值在 0～1；越大表示收入分配越不均；0.4 常作贫富差距警戒线',
  },
  {
    id: 'da-plan-found',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '建国初与改革开放',
    formula: '「中华人民共和国成立初」≈1949 年后最初几年；「改革开放以来」指 1978 年至今',
  },
  {
    id: 'da-plan-95',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「九五」计划时期',
    formula: '「九五」计划时期：1996—2000',
  },
  {
    id: 'da-plan-10',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十五」计划时期',
    formula: '「十五」计划时期：2001—2005',
  },
  {
    id: 'da-plan-11',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十一五」规划时期',
    formula: '「十一五」规划时期：2006—2010',
  },
  {
    id: 'da-plan-12',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十二五」规划时期',
    formula: '「十二五」规划时期：2011—2015',
  },
  {
    id: 'da-plan-13',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十三五」规划时期',
    formula: '「十三五」规划时期：2016—2020',
  },
  {
    id: 'da-plan-14',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十四五」规划时期',
    formula: '「十四五」规划时期：2021—2025',
  },
  {
    id: 'da-plan-15',
    moduleId: 'da-indicator',
    group: '特定历史时期',
    name: '「十五五」规划时期',
    formula: '「十五五」规划时期：2026—2030',
  },

  // —— 模块7：资料·比例相关 ——
  {
    id: 'dr-cur',
    moduleId: 'da-ratio',
    group: '现期比例',
    name: '现期比例基本公式',
    formula: '现期比重/平均数/倍数 = (A)/(B)',
    params: [...FP.daAB],
  },
  {
    id: 'dr-cur-more',
    moduleId: 'da-ratio',
    group: '现期比例',
    name: '多/增长了多少倍',
    formula: '问「A 比 B 多/增长了多少倍」：结果 = (A)/(B) − 1',
    params: [...FP.daAB],
  },
  {
    id: 'dr-base',
    moduleId: 'da-ratio',
    group: '基期比例',
    name: '基期比例公式',
    formula: '基期比例 = (A)/(1+a) ÷ (B)/(1+b) = (A)/(B) × (1+b)/(1+a)',
    params: [...FP.daAB],
  },
  {
    id: 'dr-cmp',
    moduleId: 'da-ratio',
    group: '两期比例',
    name: '两期比例升降',
    formula: 'a > b → 比例上升；a < b → 比例下降；a = b → 比例不变',
    params: [...FP.daAB],
  },
  {
    id: 'dr-delta',
    moduleId: 'da-ratio',
    group: '两期比例',
    name: '两期比例增长量',
    formula: '两期比例增长量 = (A)/(B) × (a−b)/(1+a)',
    params: [...FP.daAB],
  },
  {
    id: 'dr-delta-bound',
    moduleId: 'da-ratio',
    group: '两期比例',
    name: '两期比重差绝对值结论',
    formula: '|(A)/(B)×(a−b)/(1+a)| < |a−b|（两期比重差绝对值一般小于增长率差绝对值）',
    params: [...FP.daAB],
  },
  {
    id: 'dr-avg-rate',
    moduleId: 'da-ratio',
    group: '两期比例',
    name: '平均数增长率',
    formula: '平均数增长率 = (a−b)/(1+b)（主要用于平均数增速；一般不考比重的增长率）',
    params: [...FP.daAB],
  },
  {
    id: 'dr-avg-delta',
    moduleId: 'da-ratio',
    group: '两期比例',
    name: '平均数增长量',
    formula: '平均数增长量可套用：现期平均数 × (a−b)/(1+a)',
    params: [...FP.daAB],
  },

  // —— 模块8：资料·增长相关 ——
  {
    id: 'dg-rate',
    moduleId: 'da-growth-calc',
    group: '增长率',
    name: '一般增长率',
    formula: '增长率 = (现期量 − 基期量)/(基期量) = (现期量)/(基期量) − 1',
    params: [...FP.daR],
  },
  {
    id: 'dg-interval',
    moduleId: 'da-growth-calc',
    group: '增长率',
    name: '间隔增长率',
    formula: 'r间隔 = r₁ + r₂ + r₁ × r₂',
    params: [...FP.daInterval],
  },
  {
    id: 'dg-cagr',
    moduleId: 'da-growth-calc',
    group: '增长率',
    name: '年均增长率',
    formula: '基期量 × (1 + 年均增长率)^n = 现期量',
    params: [...FP.daNyear, ...FP.daR],
  },
  {
    id: 'dg-amt',
    moduleId: 'da-growth-calc',
    group: '增长量',
    name: '增长量计算',
    formula: '增长量 = 现期量 − 基期量 = (现期量)/(1+r) × r',
    params: [...FP.daR],
  },
  {
    id: 'dg-baihua',
    moduleId: 'da-growth-calc',
    group: '增长量',
    name: '百化分（增长，r=1/n）',
    formula: '增长量 = (现期量)/(n+1)',
    params: [...FP.daBaihua],
  },
  {
    id: 'dg-baihua-down',
    moduleId: 'da-growth-calc',
    group: '增长量',
    name: '百化分（下降，下降率=1/n）',
    formula: '减少量 = (现期量)/(n−1)',
    params: [...FP.daBaihua],
  },
  {
    id: 'dg-base',
    moduleId: 'da-growth-calc',
    group: '基期与现期',
    name: '基期量',
    formula: '基期量 = 现期量 − 增长量 = (现期量)/(1+r)',
    params: [...FP.daR],
  },
  {
    id: 'dg-base-int',
    moduleId: 'da-growth-calc',
    group: '基期与现期',
    name: '间隔基期量',
    formula: '间隔基期量 = (现期量)/(1 + r间隔)',
    params: [
      { symbol: 'r间隔', meaning: '间隔增长率（可用 r₁+r₂+r₁r₂）' },
      { symbol: '现期量', meaning: '当前时期数值' },
    ],
  },
  {
    id: 'dg-cur',
    moduleId: 'da-growth-calc',
    group: '基期与现期',
    name: '现期量',
    formula: '现期量 = 基期量 + 增长量 = 基期量 × (1+r)',
    params: [...FP.daR],
  },
]

export type FormulaReciteQuestion = {
  id: string
  topic: 'formula-recite'
  moduleId: FormulaReciteModuleId
  difficulty: 'medium'
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  method: string
  explanation: string
  fingerprint: string
  formulaId: string
}

export function formulaReciteModuleLabel(id: FormulaReciteModuleId): string {
  return FORMULA_RECITE_MODES.find((m) => m.id === id)?.label ?? id
}

export function formulaReciteDifficultyLabel(): string {
  return '普通'
}

export function formulasForModule(moduleId: FormulaReciteModuleId): FormulaEntry[] {
  return FORMULA_RECITE_CATALOG.filter((f) => f.moduleId === moduleId)
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr]
  shuffleInPlace(copy)
  return copy.slice(0, Math.min(n, copy.length))
}

/** 括号外按 = 拆分（支持链式多等号） */
function splitByEqualsOutsideParens(text: string): string[] {
  const parts: string[] = []
  let buf = ''
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (ch === '(' || ch === '（') depth++
    else if (ch === ')' || ch === '）') depth = Math.max(0, depth - 1)
    if (ch === '=' && depth === 0) {
      const piece = buf.trim()
      if (piece) parts.push(piece)
      buf = ''
      continue
    }
    buf += ch
  }
  const last = buf.trim()
  if (last) parts.push(last)
  return parts
}

/** 分号分成多条；每条再按等号链拆开 */
function equalityChainsOf(formula: string): string[][] {
  const clauses = formula
    .replace(/\uFF1B/g, ';')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const source = clauses.length > 0 ? clauses : [formula.trim()]
  const chains: string[][] = []
  for (const clause of source) {
    const parts = splitByEqualsOutsideParens(clause)
    if (parts.length >= 2) chains.push(parts)
  }
  return chains
}

function allEqualityParts(formula: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const chain of equalityChainsOf(formula)) {
    for (const p of chain) {
      if (!seen.has(p)) {
        seen.add(p)
        out.push(p)
      }
    }
  }
  return out
}

/** 近形干扰：易混符号、正负号、阶乘位置、分子分母对调等 */
function mutateExpr(expr: string): string[] {
  const s = expr.trim()
  const out: string[] = []
  const add = (t: string) => {
    const x = t.trim()
    if (x && x !== s) out.push(x)
  }

  add(s.replaceAll('n−m', 'n+m'))
  add(s.replaceAll('n−m', 'm−n'))
  add(s.replaceAll('(n−m)!', 'n!'))
  add(s.replaceAll('(n−m)!', 'm!'))
  add(s.replaceAll('n!', 'm!'))
  add(s.replaceAll('m!', 'n!'))
  add(s.replaceAll('m!(n−m)!', '(n−m)!m!'))
  add(s.replaceAll('(n−m+1)', '(n−m)'))
  add(s.replaceAll('(n−m+1)', '(n−m−1)'))
  add(s.replaceAll('(n−m+1)', '(n+m−1)'))
  add(s.replaceAll('A_{n}^{m}', 'C_{n}^{m}'))
  add(s.replaceAll('C_{n}^{m}', 'A_{n}^{m}'))
  add(s.replaceAll('C_{n}^{n−m}', 'C_{n}^{n+m}'))
  add(s.replaceAll('C_{n}^{n−m}', 'C_{m}^{n}'))
  add(s.replaceAll('(1+a)', '(1+b)'))
  add(s.replaceAll('(1+b)', '(1+a)'))
  add(s.replaceAll('(a−b)', '(b−a)'))
  add(s.replaceAll('(a−b)', '(a+b)'))
  add(s.replaceAll('n+1', 'n−1'))
  add(s.replaceAll('n−1', 'n+1'))
  add(s.replaceAll('2^n', '2n'))
  add(s.replaceAll('2^n', 'n^2'))
  add(s.replaceAll('2^3', '2×3'))
  add(s.replaceAll('现期量 − 基期量', '基期量 − 现期量'))
  add(s.replaceAll('基期量 × 增长率', '现期量 × 增长率'))
  add(s.replaceAll('(增长量)/(基期量)', '(增长量)/(现期量)'))
  add(s.replaceAll('(现期量)/(基期量) − 1', '(基期量)/(现期量) − 1'))
  add(s.replaceAll('(现期量)/(1+r)', '(现期量)/(1−r)'))
  add(s.replaceAll('(现期量)/(n+1)', '(现期量)/(n−1)'))
  add(s.replaceAll('(现期量)/(n−1)', '(现期量)/(n+1)'))
  add(s.replaceAll('r₁ + r₂ + r₁ × r₂', 'r₁ + r₂ − r₁ × r₂'))
  add(s.replaceAll('r₁ + r₂ + r₁ × r₂', 'r₁ × r₂'))
  add(s.replaceAll('(A)/(B) − 1', '(A)/(B) + 1'))
  add(s.replaceAll('(A)/(B) × (1+b)/(1+a)', '(A)/(B) × (1+a)/(1+b)'))
  add(s.replaceAll('(A)/(B) × (a−b)/(1+a)', '(A)/(B) × (a−b)/(1+b)'))
  add(s.replaceAll('(a−b)/(1+b)', '(a−b)/(1+a)'))
  add(s.replaceAll('总长÷间隔 + 1', '总长÷间隔 − 1'))
  add(s.replaceAll('总长÷间隔 − 1', '总长÷间隔 + 1'))
  add(s.replaceAll('(棵数−1)', '(棵数+1)'))
  add(s.replaceAll('(棵数+1)', '(棵数−1)'))
  add(s.replaceAll('4N − 4', '4N + 4'))
  add(s.replaceAll('4N − 4', '4(N − 1) + 4'))

  // 单个最外层分式分子分母对调
  const m = s.match(/^\(([^()]+)\)\/\(([^()]+)\)$/)
  if (m) add(`(${m[2]})/(${m[1]})`)

  return out
}

function normalizeOptKey(t: string): string {
  return t.replace(/\s+/g, '')
}

function strongDistractors(
  correct: string,
  entry: FormulaEntry,
  pool: FormulaEntry[],
  need = 3,
  excludeExprs: string[] = [],
): string[] {
  const correctKey = normalizeOptKey(correct)
  const excludeKeys = new Set(
    excludeExprs.filter(Boolean).map((x) => normalizeOptKey(x)),
  )
  excludeKeys.delete(correctKey)
  const cands: string[] = []
  const push = (t: string) => {
    const x = t.trim()
    const k = normalizeOptKey(x)
    if (!k || k === correctKey) return
    if (excludeKeys.has(k)) return
    if (cands.some((c) => normalizeOptKey(c) === k)) return
    if (x.length > Math.max(48, correct.length * 2.2) && x.includes('=')) return
    cands.push(x)
  }

  for (const m of mutateExpr(correct)) push(m)

  // 同一公式链其它写法（最强干扰）
  for (const p of allEqualityParts(entry.formula)) {
    if (normalizeOptKey(p) === correctKey || excludeKeys.has(normalizeOptKey(p))) continue
    push(p)
    for (const m of mutateExpr(p)) push(m)
  }

  const sameGroup = pool.filter((e) => e.group === entry.group && e.id !== entry.id)
  for (const e of sameGroup) {
    for (const p of allEqualityParts(e.formula)) {
      push(p)
      for (const m of mutateExpr(p)) push(m)
    }
  }

  if (cands.length < need) {
    for (const e of pool) {
      if (e.id === entry.id) continue
      for (const p of allEqualityParts(e.formula)) push(p)
      if (cands.length >= need + 6) break
    }
  }

  shuffleInPlace(cands)
  cands.sort(
    (a, b) =>
      Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length) ||
      a.length - b.length,
  )
  return cands.slice(0, need)
}

function strongNameDistractors(entry: FormulaEntry, pool: FormulaEntry[], need = 3): string[] {
  const sameGroup = pool.filter((e) => e.group === entry.group && e.id !== entry.id)
  const others = pool.filter((e) => e.id !== entry.id && e.group !== entry.group)
  const names = [
    ...pickN(sameGroup, Math.min(3, sameGroup.length)).map((e) => e.name),
    ...pickN(others, 3).map((e) => e.name),
  ].filter((n) => n !== entry.name)
  const uniq: string[] = []
  for (const n of names) {
    if (!uniq.includes(n)) uniq.push(n)
  }
  while (uniq.length < need && others.length) {
    const n = others[randInt(0, others.length - 1)]!.name
    if (n !== entry.name && !uniq.includes(n)) uniq.push(n)
    else break
  }
  return uniq.slice(0, need)
}

type BankItemKind = 'eq-link' | 'name-to-full' | 'full-to-name'

type BankItem = {
  id: string
  entry: FormulaEntry
  kind: BankItemKind
  /** eq-link：问左求右 */
  leftExpr?: string
  rightExpr?: string
}

function buildBank(moduleId: FormulaReciteModuleId): BankItem[] {
  const pool = formulasForModule(moduleId)
  const items: BankItem[] = []
  const seen = new Set<string>()
  const add = (item: BankItem) => {
    if (seen.has(item.id)) return
    seen.add(item.id)
    items.push(item)
  }

  for (const entry of pool) {
    const chains = equalityChainsOf(entry.formula)
    let hasMultiEq = false

    for (let ci = 0; ci < chains.length; ci++) {
      const parts = chains[ci]!
      if (parts.length < 2) continue
      if (parts.length >= 3) hasMultiEq = true

      // 左端 = 右侧每一段（多等号拆题）
      for (let j = 1; j < parts.length; j++) {
        add({
          id: `${entry.id}|eq|${ci}|0-${j}`,
          entry,
          kind: 'eq-link',
          leftExpr: parts[0],
          rightExpr: parts[j],
        })
      }
      // 相邻等号也拆：B = C
      for (let j = 1; j < parts.length - 1; j++) {
        add({
          id: `${entry.id}|eq|${ci}|${j}-${j + 1}`,
          entry,
          kind: 'eq-link',
          leftExpr: parts[j],
          rightExpr: parts[j + 1],
        })
      }
    }

    // 无多等号链时：保留「名称↔全文」；多等号则以拆题为主，另保留「全文→名称」
    if (!hasMultiEq && chains.length <= 1) {
      add({ id: `${entry.id}|f`, entry, kind: 'name-to-full' })
      add({ id: `${entry.id}|n`, entry, kind: 'full-to-name' })
    } else {
      add({ id: `${entry.id}|n`, entry, kind: 'full-to-name' })
      // 单等号（恰好 A=B）已由 eq-link 覆盖；若完全无等号则补名称题
      if (chains.length === 0) {
        add({ id: `${entry.id}|f`, entry, kind: 'name-to-full' })
        add({ id: `${entry.id}|n2`, entry, kind: 'full-to-name' })
      }
    }
  }
  return items
}

function buildQuestionFromBankItem(
  item: BankItem,
  pool: FormulaEntry[],
): FormulaReciteQuestion | null {
  const entry = item.entry
  let stem: string
  let correct: string
  let distractors: string[]
  let term: string
  let method: string
  let explanation: string
  let kindTag: string

  if (item.kind === 'eq-link' && item.leftExpr && item.rightExpr) {
    term = entry.name
    stem = `「${entry.name}」中，\n${item.leftExpr}\n等于下列哪一项？`
    correct = item.rightExpr
    distractors = strongDistractors(correct, entry, pool, 3, [item.leftExpr])
    method = '多等号公式按「左边 = 哪一种写法」逐段记忆'
    explanation = `${entry.group} · ${entry.name}\n${item.leftExpr} = ${item.rightExpr}\n完整：${entry.formula}`
    kindTag = item.id
  } else if (item.kind === 'name-to-full') {
    term = entry.name
    stem = `「${entry.name}」对应的内容是？`
    correct = entry.formula
    distractors = strongDistractors(correct, entry, pool, 3)
    if (distractors.length < 3) {
      distractors = [
        ...distractors,
        ...pickN(
          pool.filter((e) => e.id !== entry.id).map((e) => e.formula),
          3,
        ),
      ].filter((d, i, arr) => normalizeOptKey(d) !== normalizeOptKey(correct) && arr.indexOf(d) === i)
        .slice(0, 3)
    }
    method = '对照公式表记忆名称与完整表述'
    explanation = `${entry.group} · ${entry.name}：${entry.formula}`
    kindTag = 'f'
  } else {
    term = entry.name
    stem = `下列内容对应哪一项？\n${entry.formula}`
    correct = entry.name
    distractors = strongNameDistractors(entry, pool, 3)
    method = '由表达式/定义反推名称'
    explanation = `${entry.formula} → ${entry.group} · ${entry.name}`
    kindTag = 'n'
  }

  if (distractors.length < 3) return null
  const legend = formatFormulaParamsLegend(entry.params)
  if (legend) explanation += `\n参数说明：${legend}`

  const assembled = assembleFourChoiceMcq(correct, distractors.slice(0, 3), shuffleInPlace)
  if (!assembled) return null

  return {
    id: `fr-${entry.moduleId}-${kindTag}-${Date.now()}-${randInt(0, 9999)}`,
    topic: 'formula-recite',
    moduleId: entry.moduleId,
    difficulty: 'medium',
    term,
    passage: '',
    stem,
    options: assembled.options,
    correctIndex: assembled.correctIndex,
    method,
    explanation,
    fingerprint: `fr|${entry.moduleId}|${item.id}|${assembled.correctIndex}`,
    formulaId: entry.id,
  }
}

const USED_STORAGE = 'formula-recite-used-v2'

type UsedMap = Partial<Record<FormulaReciteModuleId, string[]>>

function readUsedMap(): UsedMap {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(USED_STORAGE)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as UsedMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeUsedMap(map: UsedMap) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(USED_STORAGE, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

/**
 * 未出优先；本模块题库用尽则开启下一轮循环。
 * 同一试卷内不重复；跨卷在未用尽前不重复。
 */
function pickBankItems(moduleId: FormulaReciteModuleId, need: number): BankItem[] {
  const bank = buildBank(moduleId)
  if (!bank.length) return []

  const map = readUsedMap()
  const used = new Set((map[moduleId] ?? []).filter(Boolean))
  const picks: BankItem[] = []
  const pickedIds = new Set<string>()

  const takeFrom = (candidates: BankItem[]) => {
    shuffleInPlace(candidates)
    for (const b of candidates) {
      if (picks.length >= need) break
      if (pickedIds.has(b.id)) continue
      picks.push(b)
      pickedIds.add(b.id)
      used.add(b.id)
    }
  }

  takeFrom(bank.filter((b) => !used.has(b.id)))

  if (picks.length < need) {
    used.clear()
    takeFrom(bank.filter((b) => !pickedIds.has(b.id)))
    for (const b of picks) used.add(b.id)
  }

  if (picks.length < need) {
    takeFrom([...bank])
  }

  map[moduleId] = [...used]
  writeUsedMap(map)
  return picks.slice(0, need)
}

export function generateFormulaRecitePaper(
  moduleId: FormulaReciteModuleId,
): FormulaReciteQuestion[] {
  const pool = formulasForModule(moduleId)
  if (pool.length < 4) return []

  const picks = pickBankItems(moduleId, FORMULA_RECITE_QUESTION_COUNT)
  const out: FormulaReciteQuestion[] = []
  for (const item of picks) {
    const q = buildQuestionFromBankItem(item, pool)
    if (q) out.push(q)
  }

  let guard = 0
  const bank = buildBank(moduleId)
  while (out.length < FORMULA_RECITE_QUESTION_COUNT && guard < 60) {
    guard += 1
    const item = bank[randInt(0, bank.length - 1)]!
    const q = buildQuestionFromBankItem(item, pool)
    if (q && !out.some((x) => x.fingerprint === q.fingerprint)) out.push(q)
  }

  return out.slice(0, FORMULA_RECITE_QUESTION_COUNT)
}
