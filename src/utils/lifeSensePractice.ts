/** 生活常识：衣食住行、材料、工具、种属组成等生活化判断（本地出题） */

export type LifeSenseMode = 'life-sense-easy' | 'life-sense-normal' | 'life-sense-hard'

export type LifeSenseModeConfig = {
  id: LifeSenseMode
  label: string
  durationSec: number
  optionCount: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
}

export const LIFE_SENSE_MODES: LifeSenseModeConfig[] = [
  {
    id: 'life-sense-easy',
    label: '简单题',
    durationSec: 30,
    optionCount: 3,
    correctDelta: 5,
    wrongDelta: -10,
    maxScore: 100,
    desc: '30 秒 · 衣食住行与日常辨识 · 强干扰选项 · 3 选项 · 对 +5 / 错 -10 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'life-sense-normal',
    label: '普通题',
    durationSec: 40,
    optionCount: 4,
    correctDelta: 8,
    wrongDelta: -15,
    maxScore: 100,
    desc: '40 秒 · 材料用途、工具功能、种属组成 · 强干扰选项 · 4 选项 · 对 +8 / 错 -15 · 对 +1 秒 / 错 -1 秒',
  },
  {
    id: 'life-sense-hard',
    label: '复杂题',
    durationSec: 50,
    optionCount: 5,
    correctDelta: 10,
    wrongDelta: -20,
    maxScore: 100,
    desc: '50 秒 · 易混材料/工具/成分综合辨析 · 强干扰选项 · 5 选项 · 对 +10 / 错 -20 · 对 +1 秒 / 错 -1 秒',
  },
]

export type LifeSenseQuestion = {
  id: number
  expression: string
  correctAnswer: string
  options: string[]
  correctIndex: number
  /** 错因说明：仅结算页展示 */
  explanation: string
}

type LifeSenseBankItem = {
  difficulty: 'easy' | 'normal' | 'hard'
  stem: string
  correct: string
  distractors: string[]
  explanation: string
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function difficultyOf(mode: LifeSenseMode): 'easy' | 'normal' | 'hard' {
  if (mode === 'life-sense-hard') return 'hard'
  if (mode === 'life-sense-normal') return 'normal'
  return 'easy'
}

/** 难度池：简单含 easy；普通含 easy+normal；复杂含全部（偏 hard） */
function poolFor(mode: LifeSenseMode): LifeSenseBankItem[] {
  const d = difficultyOf(mode)
  if (d === 'easy') return BANK.filter((q) => q.difficulty === 'easy')
  if (d === 'normal') return BANK.filter((q) => q.difficulty === 'easy' || q.difficulty === 'normal')
  return BANK.filter((q) => q.difficulty === 'normal' || q.difficulty === 'hard')
}

function buildMcq(
  id: number,
  item: LifeSenseBankItem,
  optionCount: number,
): LifeSenseQuestion {
  const need = Math.max(2, optionCount - 1)
  const pool = item.distractors
    .map((x) => x.trim())
    .filter((x) => x && x !== item.correct)
  // 优先选与正确项「句式/长度更接近」的干扰，增强迷惑性
  const ranked = [...pool].sort((a, b) => {
    const da = Math.abs(a.length - item.correct.length)
    const db = Math.abs(b.length - item.correct.length)
    return da - db
  })
  const preferred = ranked.slice(0, Math.min(ranked.length, need + 2))
  const distractors = shuffle(preferred).slice(0, need)
  while (distractors.length < need && ranked.length > distractors.length) {
    const extra = ranked.find((x) => !distractors.includes(x))
    if (!extra) break
    distractors.push(extra)
  }
  while (distractors.length < need) {
    distractors.push(`易混备选${distractors.length + 1}`)
  }
  const options = shuffle([item.correct, ...distractors.slice(0, need)])
  const correctIndex = options.findIndex((x) => x === item.correct)
  return {
    id,
    expression: item.stem,
    correctAnswer: item.correct,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: item.explanation,
  }
}

const BANK: LifeSenseBankItem[] = [
  // —— 简单：日常辨识（干扰为常见误解 / 半对半错）——
  {
    difficulty: 'easy',
    stem: '夏天逛街时，棉质短袖通常比化纤短袖更让人感觉透气，主要因为棉？',
    correct: '吸湿性较好，便于散热排湿',
    distractors: [
      '导热性极强，像金属一样传热',
      '几乎不吸湿，所以不会闷热',
      '纤维更密，阻止空气对流',
      '一定比化纤更轻，所以凉快',
    ],
    explanation: '棉吸湿性较好，出汗时更易带走湿热；化纤往往吸湿差、更易闷热。',
  },
  {
    difficulty: 'easy',
    stem: '家里炒青菜时锅里冒白烟并有刺鼻味，更可能是油温过高开始？',
    correct: '接近油的烟点，油开始裂解冒烟',
    distractors: [
      '油温刚好适宜，白烟是水蒸气',
      '锅内气压升高，油被压成气体',
      '菜里的叶绿素受热变成烟雾',
      '白烟说明油还很冷，需要继续猛火',
    ],
    explanation: '食用油加热到烟点附近会冒烟并带刺鼻味，应降温，切勿持续干烧。',
  },
  {
    difficulty: 'easy',
    stem: '下雨后柏油路面格外滑，主要原因之一是？',
    correct: '雨水把油污灰尘浮起形成薄膜',
    distractors: [
      '雨水把沥青溶解后路面变软',
      '轮胎进水后自动变硬发滑',
      '雨丝像润滑油一样铺满路面',
      '路面温度骤降结成薄冰（夏天也一样）',
    ],
    explanation: '雨初常把路面灰尘、油污浮起成膜，摩擦系数下降；不一定是溶解沥青。',
  },
  {
    difficulty: 'easy',
    stem: '打开冰箱取出冷冻肉后，表面很快结霜变湿，说明？',
    correct: '周围湿空气遇冷物凝结成水/霜',
    distractors: [
      '肉在解冻时把内部水分挤到表面',
      '冰箱冷气跟随肉一起跑出来结冰',
      '包装塑料遇热熔化后变成白霜',
      '冷冻肉本身不断分泌出油脂水',
    ],
    explanation: '冷物温度低于露点时，空气中水蒸气在表面冷凝甚至结霜。',
  },
  {
    difficulty: 'easy',
    stem: '洗衣时，「棉」标签的衣服更不适合用哪种方式粗暴处理？',
    correct: '高温烘干并大力拧绞甩干',
    distractors: [
      '冷水手洗后轻柔挤压水分',
      '按洗涤标签选择机洗程序',
      '阴凉通风处自然晾干',
      '用中性洗衣液短时浸泡',
    ],
    explanation: '棉耐洗，但高温烘干、暴力拧绞更容易变形缩水。',
  },
  {
    difficulty: 'easy',
    stem: '水果刀和砧板上留下难闻的葱蒜味，较实用的除味办法是？',
    correct: '用柠檬汁或小苏打擦洗后再冲洗',
    distractors: [
      '只用水龙头冷水快速冲一下即可',
      '放进微波炉空转加热除味',
      '冷冻一晚气味会自动消失',
      '用开水烫过就能彻底中和硫化物',
    ],
    explanation: '酸（柠檬）或碱（小苏打）有助分解吸附的硫化物气味，单靠冷水常不够。',
  },
  {
    difficulty: 'easy',
    stem: '家里常用的「不锈钢筷子」，其主要金属基体通常是？',
    correct: '铁（再加入铬等合金元素）',
    distractors: [
      '铬（所以看起来发亮就不生锈）',
      '铝（轻便所以被称为「钢」）',
      '铜（抛光后颜色接近不锈钢）',
      '镍（含量最高才能叫不锈钢）',
    ],
    explanation: '不锈钢以铁为基体，靠加入铬等形成耐蚀性；不是纯铝、纯铜。',
  },
  {
    difficulty: 'easy',
    stem: '自行车打气筒把气打进车胎，主要是利用？',
    correct: '活塞运动压缩空气提高气压',
    distractors: [
      '气筒内部装有小型储气钢瓶',
      '轮胎内负压把外界空气直接吸进去',
      '链条传动带动进气阀自动充气',
      '靠摩擦发热让空气体积膨胀进胎',
    ],
    explanation: '打气筒主要靠活塞压缩空气增压送入胎内。',
  },
  {
    difficulty: 'easy',
    stem: '玻璃杯倒入刚烧开的水后外壁很快出现水珠，水珠主要来自？',
    correct: '杯外空气中的水蒸气遇冷凝结',
    distractors: [
      '开水透过玻璃微孔渗到外壁',
      '玻璃杯本身析出的晶态水分',
      '桌面水汽被热杯“吸”上去',
      '杯内蒸汽压强过大把水挤出外壁',
    ],
    explanation: '热杯使靠近外壁的空气降温，水蒸气凝结成小水珠。',
  },
  {
    difficulty: 'easy',
    stem: '「土豆」和「马铃薯」一般指的是？',
    correct: '同一种农作物的不同叫法',
    distractors: [
      '一种是块茎、一种是块根，并不相同',
      '土豆是果实，马铃薯是地下茎',
      '马铃薯是生的，土豆是加工半成品',
      '二者同科但一个属蔬菜一个属粮食',
    ],
    explanation: '土豆即马铃薯，属同物异名。',
  },
  {
    difficulty: 'easy',
    stem: '插线板总功率过大时最危险的直接风险是？',
    correct: '导线过热导致绝缘受损、短路起火',
    distractors: [
      '电压会自动升高把电器烧毁',
      '电流变小使电器逐渐无法工作',
      '电表反转，电费被异常扣减',
      '插座会先“跳闸保护”所以肯定无事',
    ],
    explanation: '超负荷使导线过热，绝缘老化甚至短路起火；不能默认一定先安全跳闸。',
  },
  {
    difficulty: 'easy',
    stem: '淘米时水变白浑浊，主要是？',
    correct: '米粒表面淀粉、糠粉被洗下',
    distractors: [
      '大米内部的蛋白质大量溶出',
      '自来水遇米碱生成白色沉淀',
      '米中矿物质析出成石灰乳',
      '铁锅涂层脱落混入淘米水',
    ],
    explanation: '淘米水发白主要来自表面淀粉、糠层等被洗下，不是石灰。',
  },

  // —— 普通 ——
  {
    difficulty: 'normal',
    stem: '木质砧板和塑料砧板比起来，一般更需要注意哪一点卫生要点？',
    correct: '木纹孔隙易藏污，洗净后必须充分晾干',
    distractors: [
      '木材本身抑菌，用后擦一下即可',
      '木质砧板不能用水洗，只能干擦',
      '塑料砧板更易藏菌，木头永远更干净',
      '木头遇水会释放防腐剂，反而更卫生',
    ],
    explanation: '木质有纹理孔隙，污渍和水分更易残留，洗净晾干很关键。',
  },
  {
    difficulty: 'normal',
    stem: '家用手电筒（电池款）里把电能主要转换成？',
    correct: '光能，同时有少量变成热能',
    distractors: [
      '全部高效变成光，几乎无热损耗',
      '先变成机械能再驱动灯珠发光',
      '主要变成化学能回充进电池',
      '主要变成磁能向外发射照明',
    ],
    explanation: '电池电能主要转化为光，并伴随发热；并非零损耗。',
  },
  {
    difficulty: 'normal',
    stem: '厨房「不锈钢锅」和「铁锅」比，不锈钢更突出的常见优点是？',
    correct: '更耐锈蚀，日常清洁相对省心',
    distractors: [
      '导热一定更快，更适合爆炒',
      '表面绝不粘锅，无需控油火候',
      '可以安全放入微波炉加热',
      '补铁效果一定强于传统铁锅',
    ],
    explanation: '不锈钢耐锈、好打理；粘锅、导热、补铁等优势并不必然成立。',
  },
  {
    difficulty: 'normal',
    stem: '蝴蝶和飞蛾同属昆虫，区分时更可靠的特征之一是？',
    correct: '触角形态常有差异（蝶多棒状，蛾多羽状等）',
    distractors: [
      '只有蛾有鳞片，蝴蝶翅膀是光滑的',
      '蝶一定昼出，蛾一定夜出绝无例外',
      '体型大小可严格区分二者',
      '蛾没有复眼，蝶才有复眼',
    ],
    explanation: '触角是较常用外形区分；昼夜习性、体型并非绝对。',
  },
  {
    difficulty: 'normal',
    stem: '羽绒服里填充的「羽绒」主要来自？',
    correct: '鸭、鹅等水禽的羽绒',
    distractors: [
      '绵羊毛经过膨化处理后的短绒',
      '棉花经漂白蓬松后的絮状物',
      '涤纶短纤剪碎后充成的「仿羽绒」统称',
      '蚕丝拉绒后再充入胆料',
    ],
    explanation: '正品羽绒取自鸭、鹅等；棉、化纤、羊毛是其他填充类型。',
  },
  {
    difficulty: 'normal',
    stem: '家里用扳手拧螺母，扳手本质上是在增大？',
    correct: '力矩（通过加长力臂）',
    distractors: [
      '螺母受到的重力',
      '螺丝螺纹的导程（螺距）',
      '作用力的大小但力臂不变',
      '材料的摩擦系数本身',
    ],
    explanation: '扳手增大力臂从而增大力矩，便于拧转；并非改变重力或螺距。',
  },
  {
    difficulty: 'normal',
    stem: '玻璃窗上贴的「防晒膜」主要作用更接近？',
    correct: '减弱紫外线透射并降低部分辐射热',
    distractors: [
      '把普通玻璃改造成钢化防弹玻璃',
      '完全隔绝室内外空气对流',
      '把阳光直接转化为电能供家用',
      '让玻璃表面形成防水永久涂层',
    ],
    explanation: '窗膜常见功能是阻隔紫外、减热；不是结构加强或发电。',
  },
  {
    difficulty: 'normal',
    stem: '花生油、菜籽油同属？',
    correct: '植物油脂',
    distractors: [
      '动物油脂（因都来自「作物收获」）',
      '矿物油（提炼自石油馏分）',
      '精炼乙醇（由淀粉发酵而得）',
      '天然树脂（可食但不属于油）',
    ],
    explanation: '花生油、菜籽油由油料作物榨取，属植物油。',
  },
  {
    difficulty: 'normal',
    stem: '「柿子」未成熟时嘴发涩，主要因为含较多？',
    correct: '鞣酸（单宁）',
    distractors: [
      '果酸（柠檬酸）浓度过高',
      '淀粉尚未转化成糖',
      '草酸钙结晶刺激口腔',
      '天然食盐结晶析出',
    ],
    explanation: '未熟柿涩感主要来自鞣酸（单宁）；脱涩后口感改善。',
  },
  {
    difficulty: 'normal',
    stem: '菜刀刃口变钝后，磨刀主要是在？',
    correct: '磨削刃口，重新形成锋利楔角',
    distractors: [
      '给刀面镀一层更硬的金属膜',
      '改变钢材内部化学成分',
      '把刀身锻打加长以增加惯性',
      '用油浸泡刃口恢复「油膜切削」',
    ],
    explanation: '磨刀是机械修整刃口几何，不是改成分或镀层。',
  },
  {
    difficulty: 'normal',
    stem: '塑料饭盒拿去微波炉加热前，首先应确认？',
    correct: '是否标注可微波/耐热使用',
    distractors: [
      '只要透明就一定能耐微波加热',
      '只要盒盖能扣紧就可以随意加热',
      '颜色越深耐热性越好',
      '闻起来无塑料味就能放心加热',
    ],
    explanation: '可否微波取决于材质与标注；透明、颜色、气味都不能保证安全。',
  },
  {
    difficulty: 'normal',
    stem: '蜜蜂和黄蜂都能叮人，更贴近常识的对比是？',
    correct: '蜜蜂以采蜜为主，常见黄蜂更多捕食或取食甜食',
    distractors: [
      '黄蜂只能白天飞，蜜蜂只能夜里飞',
      '蜜蜂没有蛰针，黄蜂才有',
      '二者属同一物种，只是颜色不同',
      '黄蜂采蜜酿蜜，蜜蜂从不采花',
    ],
    explanation: '习性上蜜蜂偏采蜜；常见胡蜂/马蜂等更多捕食或取食甜食。',
  },
  {
    difficulty: 'normal',
    stem: '水泥硬化变硬，主要依赖？',
    correct: '与水发生水化反应逐步凝固',
    distractors: [
      '主要靠太阳晒干水分变成「石头」',
      '靠空气把水泥「氧化」成金属样硬块',
      '堆放足够久即使不加水也会自行硬化',
      '靠沙子自己结晶把水泥颗粒粘住',
    ],
    explanation: '水泥硬化靠水化反应，不是单纯晒干。',
  },
  {
    difficulty: 'normal',
    stem: '羊毛衫容易起球，常见原因是？',
    correct: '纤维末端受摩擦滑出并纠缠成球',
    distractors: [
      '说明一定是假羊毛或劣质染色',
      '洗涤剂把羊毛化学「熔」成小球',
      '起球是羊毛吸收空气后膨胀的结果',
      '机洗把内衬金线磨出来才叫起球',
    ],
    explanation: '摩擦使短纤维滑出缠结成球；真假绒都可能起球。',
  },

  // —— 复杂 ——
  {
    difficulty: 'hard',
    stem: '下列哪一项更适合描述「陶瓷杯」与「玻璃杯」在日常生活里的常见区别？',
    correct: '陶瓷多为烧结体（常不透明），玻璃多为熔融冷却的非晶体',
    distractors: [
      '陶瓷是金属烧结，玻璃是塑料透明化',
      '二者微观结构相同，只是上色工艺不同',
      '玻璃杯一定更耐磕碰，陶瓷一定更怕热胀',
      '陶瓷含水结晶，玻璃完全不含任何氧化物',
      '只要同样厚，两者碎裂方式和耐热就一样',
    ],
    explanation: '日用陶瓷经烧结，常不透明；玻璃多为非晶态。脆性与耐热因产品差异大，不能一概而论。',
  },
  {
    difficulty: 'hard',
    stem: '不锈钢锅声明「食品级 304」，这里的「304」主要指？',
    correct: '一种常用不锈钢牌号（成分规格）',
    distractors: [
      '锅材铬含量恰好为 30.4%',
      '耐温上限被标准固定为 304℃',
      '通过了 304 项食品卫生抽检',
      '表示可微波加热循环 304 次',
      '锅体公称厚度为 3.04 毫米',
    ],
    explanation: '304 是牌号/规格代号，不是重量、次数或固定耐温度数。',
  },
  {
    difficulty: 'hard',
    stem: '干电池常见「锌锰」与「碱锰」，使用上更贴近的说法是？',
    correct: '碱锰综合更耐用，但仍要防漏液且勿随意混用',
    distractors: [
      '锌锰电压更高所以一定更耐用',
      '两类电池可无条件串联混用且更安全',
      '碱锰密封完美，永久不会漏液',
      '放电完毕可直接倒入下水道冲走',
      '标明碱锰后就能给所有电器快充回用',
    ],
    explanation: '碱锰通常更耐用，但存放、混用仍有风险，废电池应回收。',
  },
  {
    difficulty: 'hard',
    stem: '「铝合金窗」比「纯铝窗」在建筑门窗上更常见的原因包括？',
    correct: '合金强度与刚度更好，纯铝偏软易变形',
    distractors: [
      '铝合金几乎不导热，所以天生断桥保温',
      '纯铝遇潮会迅速锈成粉末无法成窗',
      '铝合金密度远低于纯铝所以更轻更好装',
      '纯铝无法表面氧化，铝合金才能上漆',
      '铝合金其实是镀锌钢材改名，强度来自钢',
    ],
    explanation: '合金化提高强度与耐久性；隔热还要靠断桥设计，并非「不导热」。',
  },
  {
    difficulty: 'hard',
    stem: '油性记号笔字迹难被水洗掉，主要因为墨水？',
    correct: '含有机溶剂与树脂，干燥后耐水附着',
    distractors: [
      '染料颗粒比纸孔大，被机械卡死',
      '主要是清水加颜料，干后遇水才加固',
      '纸面有磁性把金属颜料吸住',
      '字迹是溶剂挥发后留下的矿物盐结晶',
      '油性笔写字靠针刺渗入纤维深处',
    ],
    explanation: '油性墨水依赖溶剂/树脂体系，干燥后难溶于水；水性笔更易晕染。',
  },
  {
    difficulty: 'hard',
    stem: '关于「保鲜膜」与「密封袋」，更准确的生活使用原则是？',
    correct: '加热前先看是否标注可微波/耐温材质',
    distractors: [
      '凡是食品级透明膜都能高温加热',
      '密封口扣紧后就可盛装刚出锅热油',
      '写明 PE/PVC 就可以安心明火烧烤',
      '冰箱冷冻用的袋子一定也适合微波',
      '只要加热时鼓泡冒烟就说明消毒完成',
    ],
    explanation: '耐热性因材质而异，必须看标注；冷冻适用≠微波适用。',
  },
  {
    difficulty: 'hard',
    stem: '下列哪组更属于「同种异名」？',
    correct: '蕃茄 — 西红柿',
    distractors: [
      '土豆 — 红薯',
      '玉米 — 高粱',
      '黄瓜 — 丝瓜',
      '花生 — 蚕豆',
      '大米 — 糯米（完全等同）',
    ],
    explanation: '番茄即西红柿；土豆≠红薯，其余多为不同作物；糯米是大米类型之一而非异名。',
  },
  {
    difficulty: 'hard',
    stem: '家里气体热水器「强制排气」的目的主要是？',
    correct: '把燃烧废气排到室外，降低一氧化碳风险',
    distractors: [
      '把热水加压送到楼层更高的水龙头',
      '向室内鼓入新鲜氧气帮助燃烧更旺',
      '抽走燃气中的杂质以提高燃气纯度',
      '给燃烧室吹冷风以降温保护点火器',
      '把废热回收成热水以节省燃气',
    ],
    explanation: '强制排气重点是导出烟气、防一氧化碳积聚。',
  },
  {
    difficulty: 'hard',
    stem: '实木家具和板式（人造板）家具对比，下列更贴近常识的是？',
    correct: '人造板多用胶黏剂，新家具更要通风散味',
    distractors: [
      '实木家具制作过程绝对不含任何胶漆',
      '板式家具遇水一定比实木更耐泡不变形',
      '人造板实质是金属夹芯板，更防火',
      '实木越重就一定越环保、甲醛越低',
      '板式家具没有甲醛问题，只有油漆会有',
    ],
    explanation: '人造板常含胶黏剂，新家具宜通风；实木也可能有油漆胶水，重量≠环保。',
  },
  {
    difficulty: 'hard',
    stem: '破壁机打碎水果后液体分层，下层沉淀较多，更可能是？',
    correct: '果肉纤维与渣质密度较大而下沉',
    distractors: [
      '上层澄清液一定是有害析出物',
      '下层沉淀说明水果重金属超标',
      '机器把部分水分转化成了油相',
      '分层是果汁开始发酵产气的标志',
      '说明刀片把维生素「打碎失效」了',
    ],
    explanation: '纤维、果渣易沉降分层，摇匀或过滤即可，不等于有毒或变质。',
  },
  {
    difficulty: 'hard',
    stem: '下列工具中，主要用于「测量水平」的是？',
    correct: '水平尺（水平仪）',
    distractors: ['直角尺（角尺）', '钢卷尺', '游标卡尺', '线坠（单独使用时看垂直）', '激光测距仪（只测距离）'],
    explanation: '水平尺用气泡等判断水平；直角尺、卷尺、卡尺、线坠功能不同（线坠偏垂直）。',
  },
  {
    difficulty: 'hard',
    stem: '衣物标签「含羊毛 80%」意味着？',
    correct: '纤维成分中羊毛约占八成，其余为其他纤维',
    distractors: [
      '洗涤水温上限是 80℃',
      '建议手洗次数不超过 80 次',
      '成衣克重标准值为 80 克',
      '柔软剂须稀释到体积分数 80%',
      '羊毛与化纤按 80:20 长度交错编织',
    ],
    explanation: '百分比通常指纤维含量占比，不是耐温、克重或洗涤次数。',
  },
]

export function generateLifeSenseQuestion(
  mode: LifeSenseMode,
  id: number,
  optionCount: number,
  avoidFingerprints: Set<string> = new Set(),
): LifeSenseQuestion {
  const pool = poolFor(mode)
  const shuffled = shuffle(pool)
  for (const item of shuffled) {
    const q = buildMcq(id, item, optionCount)
    const fp = `${q.expression}\u001e${[...q.options].sort().join('\u001f')}`
    if (!avoidFingerprints.has(fp)) return q
  }
  const fallback = shuffled[0] ?? BANK[0]!
  return buildMcq(id, fallback, optionCount)
}

export function isLifeSenseMode(mode: string): mode is LifeSenseMode {
  return mode === 'life-sense-easy' || mode === 'life-sense-normal' || mode === 'life-sense-hard'
}
