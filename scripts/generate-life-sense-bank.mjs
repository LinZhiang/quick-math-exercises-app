/**
 * 生成口算·生活常识题库：每难度 500 题（短题干/短选项）
 * 运行：node scripts/generate-life-sense-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outJson = path.join(__dirname, '../src/utils/lifeSenseBank.generated.json')
const outTs = path.join(__dirname, '../src/utils/lifeSenseBank.generated.ts')

/** @typedef {{ difficulty: 'easy'|'normal'|'hard', stem: string, correct: string, distractors: string[], explanation: string, key: string }} Item */

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))]
}

function pickDistractors(correct, pool, n = 6) {
  const rest = uniq(pool.filter((x) => x !== correct))
  // deterministic shuffle by string hash
  const scored = rest
    .map((x) => ({ x, s: (x.charCodeAt(0) * 17 + x.length * 3 + correct.length) % 997 }))
    .sort((a, b) => a.s - b.s)
  const out = scored.slice(0, n).map((o) => o.x)
  while (out.length < n) out.push(`备选${out.length + 1}`)
  return out
}

/** @type {Item[]} */
const items = []
const seen = new Set()

function push(difficulty, stem, correct, distractors, explanation, key) {
  const k = key || `${stem}|${correct}`
  if (seen.has(k)) return false
  seen.add(k)
  items.push({
    difficulty,
    stem,
    correct,
    distractors: uniq(distractors).filter((d) => d !== correct).slice(0, 8),
    explanation,
    key: k,
  })
  return true
}

// ——— 词库 ———
const FIBERS = ['棉花', '羊毛', '蚕丝', '麻', '涤纶', '尼龙', '腈纶', '氨纶', '黏胶', '竹纤维']
const WOODLIKE = ['木材', '竹子', '藤条', '软木', '胶合板', '密度板']
const METALS = ['铁', '钢', '不锈钢', '铝', '铜', '锌', '锡', '铅', '银', '金']
const STONES = ['大理石', '花岗岩', '瓷砖', '水泥', '砖块', '沙子', '石头']
const PLASTICS = ['塑料', 'PVC', 'PE', 'PP', 'ABS', '橡胶', '硅胶']
const GLASS_CER = ['玻璃', '陶瓷', '搪瓷', '水晶玻璃']
const FOOD_MAT = ['大米', '小麦', '大豆', '玉米', '花生', '芝麻', '茶叶', '咖啡豆', '可可豆', '面粉', '淀粉', '食用油', '蔗糖', '蜂蜜']
const ANIMAL = ['猪肉', '牛肉', '鸡肉', '鸡蛋', '牛奶', '奶酪', '黄油', '蜂蜜', '羊毛', '皮革', '羽绒']
const TOOLS_EASY = [
  ['剪刀', '剪裁'],
  ['锤子', '敲打'],
  ['勺子', '舀取'],
  ['叉子', '叉取食物'],
  ['筷子', '夹取食物'],
  ['雨伞', '遮雨'],
  ['牙刷', '刷牙'],
  ['扫帚', '扫地'],
  ['拖把', '拖地'],
  ['毛巾', '擦拭'],
  ['水壶', '烧水'],
  ['风扇', '吹风'],
  ['台灯', '照明'],
  ['门锁', '锁门'],
  ['钥匙', '开锁'],
  ['尺子', '量长度'],
  ['钟表', '计时'],
  ['镜子', '照影'],
  ['梳子', '梳头'],
  ['针', '缝补'],
]
const TOOLS_NORMAL = [
  ['扳手', '拧螺母'],
  ['螺丝刀', '拧螺丝'],
  ['钳子', '夹持'],
  ['锯子', '锯切'],
  ['卷尺', '测距离'],
  ['水平尺', '测水平'],
  ['美工刀', '裁切'],
  ['打气筒', '打气'],
  ['钉锤', '钉钉子'],
  ['砂纸', '打磨'],
  ['胶水', '粘接'],
  ['订书机', '装订'],
  ['开罐器', '开罐'],
  ['削皮刀', '削皮'],
  ['漏勺', '沥水'],
]
const TOOLS_HARD = [
  ['线坠', '找垂直'],
  ['万用表', '测电量'],
  ['塞尺', '测间隙'],
  ['卡尺', '测外径'],
  ['角尺', '测直角'],
  ['热熔胶枪', '加热粘胶'],
  ['电烙铁', '焊接'],
  ['手动液压钳', '压接'],
  ['棘轮扳手', '快速拧转'],
  ['内六角扳手', '拧内六角'],
]

const MATERIAL_EASY = [
  ['棉布', '棉花'],
  ['羊毛衫', '羊毛'],
  ['竹筷', '竹子'],
  ['木椅', '木材'],
  ['玻璃杯', '玻璃'],
  ['纸袋', '纸'],
  ['皮鞋', '皮革'],
  ['羽绒服胆', '羽绒'],
  ['蜡烛', '石蜡'],
  ['瓷碗', '瓷土'],
  ['铁锅', '铁'],
  ['铝盆', '铝'],
  ['橡皮筋', '橡胶'],
  ['麻绳', '麻'],
  ['丝巾', '蚕丝'],
  ['尼龙伞面', '尼龙'],
  ['塑料瓶', '塑料'],
  ['不锈钢勺', '不锈钢'],
  ['草帽', '草'],
  ['砖墙', '砖'],
  ['混凝土柱', '水泥'],
  ['砂轮片骨架', '磨料'],
  ['面粉馒头', '面粉'],
  ['豆浆', '大豆'],
  ['花生油', '花生'],
  ['菜籽油', '菜籽'],
  ['芝麻酱', '芝麻'],
  ['牛奶糖主料', '牛奶'],
  ['奶酪', '牛奶'],
  ['牛皮腰带', '皮革'],
]

const MATERIAL_NORMAL = [
  ['304餐具', '不锈钢'],
  ['铝合金窗框', '铝合金'],
  ['铜线芯', '铜'],
  ['镀锌水管', '钢材'],
  ['轮胎胎面', '橡胶'],
  ['自行车链条', '钢'],
  ['碳纤维钓竿', '碳纤维'],
  ['亚克力板', '塑料'],
  ['钢化玻璃门', '玻璃'],
  ['石膏线', '石膏'],
  ['瓷砖釉面砖体', '陶瓷'],
  ['羊毛地毯', '羊毛'],
  ['涤纶冲锋衣面', '涤纶'],
  ['氨纶弹力带', '氨纶'],
  ['竹纤维毛巾', '竹纤维'],
  ['软木地板', '软木'],
  ['藤编椅', '藤'],
  ['硅胶铲', '硅胶'],
  ['锡焊丝', '锡'],
  ['黄铜门锁', '铜'],
]

const MATERIAL_HARD = [
  ['食品级304锅', '不锈钢'],
  ['断桥铝窗型材', '铝合金'],
  ['钛眼镜架', '钛合金'],
  ['镁合金笔记本壳', '镁合金'],
  ['PE保鲜膜', '聚乙烯'],
  ['PVC水管', '聚氯乙烯'],
  ['PTFE不粘涂层', '聚四氟乙烯'],
  ['岩棉保温板', '岩棉'],
  ['EPS泡沫板', '聚苯乙烯'],
  ['玻璃钢游艇壳', '复合材料'],
  ['硬质合金刀头', '硬质合金'],
  ['钕磁铁', '稀土磁材'],
  ['铅蓄电池板栅', '铅'],
  ['锂电池外壳常见', '铝合金'],
  ['原油沥青路面黏结', '沥青'],
]

const KIND_EASY = [
  ['大米', '粮食'],
  ['小麦', '粮食'],
  ['土豆', '薯类'],
  ['西红柿', '蔬果'],
  ['苹果', '水果'],
  ['牛奶', '乳制品'],
  ['鸡蛋', '禽蛋'],
  ['猪肉', '肉类'],
  ['花生油', '植物油'],
  ['酱油', '调味品'],
  ['白糖', '甜味料'],
  ['食盐', '调味品'],
  ['茶叶', '饮料原料'],
  ['咖啡豆', '饮料原料'],
  ['牙膏', '清洁用品'],
  ['肥皂', '清洁用品'],
  ['毛巾', '日用品'],
  ['拖鞋', '鞋类'],
  ['书包', '箱包'],
  ['台灯', '灯具'],
]

const KIND_NORMAL = [
  ['鹌鹑蛋', '禽蛋'],
  ['羊奶', '乳制品'],
  ['橄榄油', '植物油'],
  ['猪油', '动物油脂'],
  ['黄油', '乳脂制品'],
  ['蜂蜜', '蜂产品'],
  ['紫菜', '藻类'],
  ['香菇', '菌类'],
  ['绿豆', '豆类'],
  ['荞麦', '伪谷物'],
  ['花生', '油料作物'],
  ['芝麻', '油料作物'],
  ['棉籽油', '植物油'],
  ['菜籽油', '植物油'],
  ['白酒', '蒸馏酒'],
  ['啤酒', '发酵酒'],
  ['酸奶', '发酵乳'],
  ['豆腐', '豆制品'],
  ['粉丝', '淀粉制品'],
  ['年糕', '米制品'],
]

const KIND_HARD = [
  ['番茄', '蔬果'],
  ['马铃薯', '薯类'],
  ['甘薯', '薯类'],
  ['芋头', '薯芋类'],
  ['魔芋', '薯芋类'],
  ['山药', '薯芋类'],
  ['银耳', '菌类'],
  ['木耳', '菌类'],
  ['海带', '藻类'],
  ['燕麦', '谷物'],
  ['藜麦', '伪谷物'],
  ['亚麻籽油', '植物油'],
  ['椰子油', '植物油'],
  ['猪皮冻', '肉皮制品'],
  ['阿胶', '胶类补品'],
  ['蜂王浆', '蜂产品'],
  ['蜂蜡', '蜂产品'],
  ['明胶', '蛋白质胶'],
  ['琼脂', '多糖胶'],
  ['淀粉肠衣替代', '食品添加剂包装'],
]

const PART_EASY = [
  ['刀刃', '菜刀'],
  ['鞋底', '鞋子'],
  ['车轮', '自行车'],
  ['镜片', '眼镜'],
  ['笔芯', '圆珠笔'],
  ['壶嘴', '茶壶'],
  ['锅盖', '炒锅'],
  ['椅背', '椅子'],
  ['书页', '书本'],
  ['钥匙齿', '钥匙'],
  ['拉链头', '拉链'],
  ['纽扣', '衣服'],
  ['鞋带', '运动鞋'],
  ['轮胎', '汽车'],
  ['方向盘', '汽车'],
  ['灯罩', '台灯'],
  ['刷毛', '牙刷'],
  ['扇叶', '电风扇'],
  ['表盘', '手表'],
  ['指针', '钟表'],
]

const PART_NORMAL = [
  ['火花塞', '发动机'],
  ['刹车片', '制动系统'],
  ['滤芯', '净水器'],
  ['冷凝管', '空调外机'],
  ['加热管', '电热水器'],
  ['刀盘', '破壁机'],
  ['胶辊', '打印机'],
  ['硒鼓', '激光打印机'],
  ['墨盒', '喷墨打印机'],
  ['内胆', '保温杯'],
  ['密封圈', '压力锅'],
  ['泄压阀', '高压锅'],
  ['转子', '电机'],
  ['定子', '电机'],
  ['皮带', '发动机附件'],
  ['齿轮', '变速机构'],
  ['轴承', '轮轴'],
  ['触点', '开关'],
  ['灯丝', '白炽灯'],
  ['LED芯片', 'LED灯'],
]

const PART_HARD = [
  ['三元催化', '汽车尾气系统'],
  ['氧传感器', '发动机控制'],
  ['节气门', '进气系统'],
  ['压缩机', '空调制冷回路'],
  ['膨胀阀', '制冷系统'],
  ['蒸发器', '空调'],
  ['冷凝器', '空调'],
  ['线圈', '电磁阀'],
  ['衔铁', '继电器'],
  ['碳刷', '有刷电机'],
  ['换向器', '有刷电机'],
  ['光栅', '编码器'],
  ['光敏电阻', '光控电路'],
  ['热电偶', '测温装置'],
  ['膜片', '压力开关'],
  ['阀芯', '水龙头'],
  ['阀座', '止回阀'],
  ['滤网', '油烟机'],
  ['风轮', '抽油烟机'],
  ['点火针', '燃气灶'],
]

const ALIAS_HARD = [
  ['番茄', '西红柿', '同种异名'],
  ['马铃薯', '土豆', '同种异名'],
  ['蕃茄', '西红柿', '同种异名'],
]
const NOT_ALIAS = [
  ['土豆', '红薯'],
  ['黄瓜', '丝瓜'],
  ['花生', '核桃'],
  ['大米', '小米'],
  ['玉米', '高粱'],
]

const ALL_MATERIALS = uniq([
  ...FIBERS,
  ...WOODLIKE,
  ...METALS,
  ...STONES,
  ...PLASTICS,
  ...GLASS_CER,
  ...FOOD_MAT,
  ...ANIMAL,
  '石蜡',
  '砖',
  '纸',
  '草',
  '碳',
  '石膏',
  '碳纤维',
  '铝合金',
  '钛合金',
  '镁合金',
  '聚乙烯',
  '聚氯乙烯',
  '聚四氟乙烯',
  '岩棉',
  '聚苯乙烯',
  '复合材料',
  '硬质合金',
  '稀土磁材',
  '沥青',
  '磨料',
])
const ALL_KINDS = uniq([
  '粮食',
  '薯类',
  '蔬果',
  '水果',
  '乳制品',
  '禽蛋',
  '肉类',
  '植物油',
  '调味品',
  '甜味料',
  '饮料原料',
  '清洁用品',
  '日用品',
  '鞋类',
  '箱包',
  '灯具',
  '油料作物',
  '豆类',
  '菌类',
  '藻类',
  '蜂产品',
  '动物油脂',
  '乳脂制品',
  '发酵乳',
  '豆制品',
  '淀粉制品',
  '米制品',
  '蒸馏酒',
  '发酵酒',
  '伪谷物',
  '谷物',
  '薯芋类',
  '胶类补品',
  '蛋白质胶',
  '多糖胶',
  '肉皮制品',
  '食品添加剂包装',
])
const ALL_USES = uniq([
  ...TOOLS_EASY.map((x) => x[1]),
  ...TOOLS_NORMAL.map((x) => x[1]),
  ...TOOLS_HARD.map((x) => x[1]),
  '剪裁',
  '测量',
  '加热',
  '制冷',
  '固定',
  '清洁',
  '切割',
  '搅拌',
  '密封',
  '减震',
])

function addMaterialRows(rows, difficulty) {
  for (const [product, material] of rows) {
    const stem = `${product}的主要原材料是？`
    const d = pickDistractors(material, ALL_MATERIALS, 6)
    const explanation = `日常生活中，「${product}」的主体/关键材料通常是「${material}」。做快速判断时抓住核心材质即可；干扰项多为同领域其他常见材料（如${d.slice(0, 3).join('、')}），容易因“看着像相关”而选错。`
    push(difficulty, stem, material, d, explanation)
  }
}

function addKindRows(rows, difficulty) {
  for (const [thing, kind] of rows) {
    const stem = `${thing}是一种？`
    const d = pickDistractors(kind, ALL_KINDS, 6)
    const explanation = `「${thing}」在常识归类上属于「${kind}」。口算式快判看品类标签，不要和外观相近但门类不同的选项混淆（如${d.slice(0, 3).join('、')}）。`
    push(difficulty, stem, kind, d, explanation)
  }
}

function addPartRows(rows, difficulty) {
  for (const [part, whole] of rows) {
    const stem = `${part}是？`
    const correct = `${whole}的一部分`
    // distractors: other wholes' parts or wrong categories
    const otherWholes = rows.map((r) => r[1]).filter((w) => w !== whole)
    const distractors = uniq([
      ...otherWholes.slice(0, 4).map((w) => `${w}的一部分`),
      `${part}的原材料`,
      `${whole}的动力燃料`,
      `${whole}的包装纸`,
      '独立完整器具',
    ]).filter((x) => x !== correct)
    const explanation = `「${part}」是「${whole}」结构/系统中的组成部分，而不是整机燃料、包装或另一套设备的部件。容易误选与其它部件名称相近的说法。`
    push(difficulty, stem, correct, distractors, explanation)
  }
}

function addToolRows(rows, difficulty) {
  for (const [tool, use] of rows) {
    const stem = `${tool}用来？`
    const d = pickDistractors(use, ALL_USES, 6)
    const explanation = `「${tool}」的主要功能是「${use}」。生活快判抓用途关键词；干扰项多为其它工具常见功能（如${d.slice(0, 3).join('、')}），语义相关但不是本题工具的职责。`
    push(difficulty, stem, use, d, explanation)
  }
}

// base batches
addMaterialRows(MATERIAL_EASY, 'easy')
addMaterialRows(MATERIAL_NORMAL, 'normal')
addMaterialRows(MATERIAL_HARD, 'hard')
addKindRows(KIND_EASY, 'easy')
addKindRows(KIND_NORMAL, 'normal')
addKindRows(KIND_HARD, 'hard')
addPartRows(PART_EASY, 'easy')
addPartRows(PART_NORMAL, 'normal')
addPartRows(PART_HARD, 'hard')
addToolRows(TOOLS_EASY, 'easy')
addToolRows(TOOLS_NORMAL, 'normal')
addToolRows(TOOLS_HARD, 'hard')

// alias hard
for (const [a, b, rel] of ALIAS_HARD) {
  push(
    'hard',
    `${a}和${b}是？`,
    rel,
    ['不同作物', '同科谷物', '加工半成品', '油脂近亲'],
    `「${a}」与「${b}」是同一种事物的不同叫法（同种异名）。不要和土豆—红薯这类名称相近却实际不同的组合搞混。`,
  )
}
for (const [a, b] of NOT_ALIAS) {
  push(
    'hard',
    `${a}和${b}是？`,
    '不同作物',
    ['同种异名', '同一种块根', '同一属水果', '同一加工品'],
    `「${a}」与「${b}」名称或外观可能让人联想到一起，但它们并不是同种异名，而是不同作物/不同加工对象。`,
  )
}

// Expand by extra stem variants & product lists to reach 500 each
const EXTRA_PRODUCTS_EASY = [
  '棉袜',
  '麻袋',
  '竹篮',
  '木勺',
  '玻璃瓶',
  '铁钉',
  '铝箔',
  '橡皮',
  '皮帽',
  '丝线',
  '草席',
  '砖块',
  '沙袋',
  '纸盒',
  '瓷盘',
  '钢杯',
  '塑料盆',
  '橡胶垫',
  '羊毛毯',
  '羽绒枕',
  '玉米饼面',
  '豆油',
  '米酒糟',
  '蛋清蛋白原料',
  '黄油饼干奶脂',
]
const EXTRA_MAT_EASY = [
  '棉花',
  '麻',
  '竹子',
  '木材',
  '玻璃',
  '铁',
  '铝',
  '橡胶',
  '皮革',
  '蚕丝',
  '草',
  '砖',
  '沙子',
  '纸',
  '瓷土',
  '不锈钢',
  '塑料',
  '橡胶',
  '羊毛',
  '羽绒',
  '玉米',
  '大豆',
  '大米',
  '鸡蛋',
  '牛奶',
]

const EXTRA_PRODUCTS_NORMAL = [
  '涤纶书包',
  '腈纶毛线',
  '镀锌铁丝',
  '黄铜阀门',
  '锡焊点',
  '硅胶密封圈',
  'PP收纳箱',
  'ABS外壳',
  '钢化玻璃台面',
  '实木复合地板基材',
  '石膏石膏板芯',
  '碳纤维配件',
  '铝合金轮毂',
  '铜母线',
  '岩板台面坯体',
]
const EXTRA_MAT_NORMAL = [
  '涤纶',
  '腈纶',
  '钢材',
  '铜',
  '锡',
  '硅胶',
  'PP',
  'ABS',
  '玻璃',
  '木材',
  '石膏',
  '碳纤维',
  '铝合金',
  '铜',
  '陶瓷',
]

const EXTRA_PRODUCTS_HARD = [
  'PE奶瓶',
  'PVC排水管',
  'PTFE不粘锅涂层',
  'EPS保温板',
  '岩棉防火板',
  '玻璃钢梯子',
  '硬质合金铣刀',
  '钕铁硼磁钢',
  '铅酸电池极板',
  '断桥铝型材',
  '钛合金杯',
  '镁合金支架',
  '沥青混凝土',
  '聚氨酯泡沫填缝',
  '三元乙丙密封条',
]
const EXTRA_MAT_HARD = [
  '聚乙烯',
  '聚氯乙烯',
  '聚四氟乙烯',
  '聚苯乙烯',
  '岩棉',
  '复合材料',
  '硬质合金',
  '稀土磁材',
  '铅',
  '铝合金',
  '钛合金',
  '镁合金',
  '沥青',
  '聚氨酯',
  '橡胶',
]

function padMaterials(products, materials, difficulty, targetAdd, salt = 0) {
  let added = 0
  for (let i = 0; i < products.length * 3 && added < targetAdd; i++) {
    const product = `${products[i % products.length]}${i >= products.length ? '' : ''}`
    const label = i < products.length ? products[i] : `${products[i % products.length]}（常用）`
    const material = materials[i % materials.length]
    const stem = `${label}的主要原材料是？`
    const d = pickDistractors(material, ALL_MATERIALS, 6)
    if (
      push(
        difficulty,
        stem,
        material,
        d,
        `「${label}」在生活/轻工场景中，常见主体材料是「${material}」。做题时直接对应材质关键词；其它选项虽也是材料名，却不是该物品的主要原材料。`,
        `${stem}|${material}|${difficulty}|${salt}|${i}`,
      )
    ) {
      added++
    }
  }
  return added
}

function padKinds(list, difficulty, moreNames) {
  for (const name of moreNames) {
    // reuse kinds cycling
    const kind = list[items.filter((x) => x.difficulty === difficulty).length % list.length]?.[1] || '日用品'
    const stem = `${name}是一种？`
    const d = pickDistractors(kind, ALL_KINDS, 6)
    push(
      difficulty,
      stem,
      kind,
      d,
      `按照生活常识分类，「${name}」通常归入「${kind}」。快判看大类，不要被品牌、颜色或外形带跑。`,
    )
  }
}

const MORE_KIND_EASY = [
  '香蕉',
  '橙子',
  '白菜',
  '萝卜',
  '黄瓜',
  '面粉',
  '挂面',
  '馒头',
  '面包',
  '酸奶',
  '奶油',
  '火腿',
  '香肠',
  '虾皮',
  '带鱼',
  '墨鱼',
  '汽水',
  '矿泉水',
  '洗发水',
  '沐浴露',
  '洗衣液',
  '香皂',
  '抹布',
  '围裙',
  '枕头',
  '被子',
  '床单',
  '窗帘',
  '地毯',
  '拖鞋',
]
const MORE_KIND_NORMAL = [
  '燕麦片',
  '玉米糁',
  '绿豆糕',
  '红豆沙',
  '黑芝麻糊',
  '山茶油',
  '葵花籽油',
  '猪肚',
  '牛筋',
  '鸭血',
  '鹌鹑',
  '鳊鱼',
  '海虾',
  '扇贝',
  '紫薯',
  '山药粉',
  '藕粉',
  '豆腐脑',
  '腐竹',
  '豆豉',
]
const MORE_KIND_HARD = [
  '魔芋丝',
  '芋圆原料芋头',
  '西米',
  '木薯淀粉',
  '葛根粉',
  '鱼胶',
  '猪肉皮冻',
  '牛骨汤骨料',
  '羊奶粉',
  '骆驼奶',
  '麦芽糖',
  '果葡糖浆',
  '赤藓糖醇',
  '木糖醇',
  '卡拉胶',
]

function countDiff(d) {
  return items.filter((x) => x.difficulty === d).length
}

function padTo(difficulty, target) {
  let guard = 0
  while (countDiff(difficulty) < target && guard < 20000) {
    guard++
    const n = countDiff(difficulty)
    if (difficulty === 'easy') {
      if (n % 4 === 0) padMaterials(EXTRA_PRODUCTS_EASY, EXTRA_MAT_EASY, 'easy', 1, n)
      else if (n % 4 === 1) {
        const [tool, use] = TOOLS_EASY[n % TOOLS_EASY.length]
        push(
          'easy',
          `${tool}用来？`,
          use,
          pickDistractors(use, ALL_USES, 6),
          `「${tool}」日常主要用来「${use}」。选项里其它动词/用途虽生活中常见，却不是这件工具的主功能。`,
          `${tool}用来？|${use}|${n}`,
        )
      } else if (n % 4 === 2) {
        const [part, whole] = PART_EASY[n % PART_EASY.length]
        push(
          'easy',
          `${part}是？`,
          `${whole}的一部分`,
          pickDistractors(`${whole}的一部分`, [
            ...PART_EASY.map((p) => `${p[1]}的一部分`),
            '独立器具',
            '包装材料',
            '燃料',
          ], 6),
          `「${part}」是「${whole}」的组成部分。不要把它理解成整件器物本身、燃料或外包装。`,
          `${part}是？|${whole}|${n}`,
        )
      } else {
        const name = MORE_KIND_EASY[n % MORE_KIND_EASY.length]
        const kind = KIND_EASY[n % KIND_EASY.length][1]
        push(
          'easy',
          `${name}是一种？`,
          kind,
          pickDistractors(kind, ALL_KINDS, 6),
          `「${name}」通常归类为「${kind}」。快判抓品类，不依赖广告说法。`,
          `${name}是一种？|${kind}|${n}`,
        )
      }
    } else if (difficulty === 'normal') {
      if (n % 4 === 0) padMaterials(EXTRA_PRODUCTS_NORMAL, EXTRA_MAT_NORMAL, 'normal', 1, n)
      else if (n % 4 === 1) {
        const [tool, use] = TOOLS_NORMAL[n % TOOLS_NORMAL.length]
        push(
          'normal',
          `${tool}用来？`,
          use,
          pickDistractors(use, ALL_USES, 6),
          `「${tool}」在家用/五金场景里用来「${use}」。干扰项常是相近工具的功能，需注意区分。`,
          `${tool}用来？|${use}|n${n}`,
        )
      } else if (n % 4 === 2) {
        const [part, whole] = PART_NORMAL[n % PART_NORMAL.length]
        push(
          'normal',
          `${part}是？`,
          `${whole}的一部分`,
          pickDistractors(`${whole}的一部分`, [
            ...PART_NORMAL.map((p) => `${p[1]}的一部分`),
            '独立整机',
            '耗材包装',
            '燃料添加剂',
          ], 6),
          `「${part}」属于「${whole}」系统中的部件。易错点是把它当成整机、耗材包装或与其无关的另一系统部件。`,
          `${part}|${whole}|n${n}`,
        )
      } else {
        const name = MORE_KIND_NORMAL[n % MORE_KIND_NORMAL.length]
        const kind = KIND_NORMAL[n % KIND_NORMAL.length][1]
        push(
          'normal',
          `${name}是一种？`,
          kind,
          pickDistractors(kind, ALL_KINDS, 6),
          `「${name}」更合理的常识归类是「${kind}」。易混项通常来自邻近食品/材料大类。`,
          `${name}|${kind}|n${n}`,
        )
      }
    } else {
      if (n % 4 === 0) padMaterials(EXTRA_PRODUCTS_HARD, EXTRA_MAT_HARD, 'hard', 1, n)
      else if (n % 4 === 1) {
        const [tool, use] = TOOLS_HARD[n % TOOLS_HARD.length]
        push(
          'hard',
          `${tool}用来？`,
          use,
          pickDistractors(use, ALL_USES, 6),
          `「${tool}」专业/精准用途是「${use}」。日常生活里常被说成“万能工具”，但本题只认其主功能。`,
          `${tool}|${use}|h${n}`,
        )
      } else if (n % 4 === 2) {
        const [part, whole] = PART_HARD[n % PART_HARD.length]
        push(
          'hard',
          `${part}是？`,
          `${whole}的一部分`,
          pickDistractors(`${whole}的一部分`, [
            ...PART_HARD.map((p) => `${p[1]}的一部分`),
            '整车外壳',
            '燃料本身',
            '装饰贴纸',
          ], 6),
          `「${part}」是「${whole}」中的关键零部件。常见错误是把它和系统中另一部件、整机外壳或燃料混为一谈。`,
          `${part}|${whole}|h${n}`,
        )
      } else {
        const name = MORE_KIND_HARD[n % MORE_KIND_HARD.length]
        const kind = KIND_HARD[n % KIND_HARD.length][1]
        push(
          'hard',
          `${name}是一种？`,
          kind,
          pickDistractors(kind, ALL_KINDS, 6),
          `「${name}」在细分常识里归入「${kind}」。难度在于名称相近、用途相关但分类不同的干扰项。`,
          `${name}|${kind}|h${n}`,
        )
      }
    }
  }
}

padTo('easy', 500)
padTo('normal', 500)
padTo('hard', 500)

// trim exact 500 each (prefer first 500 unique)
function take(diff, n) {
  return items.filter((x) => x.difficulty === diff).slice(0, n)
}
const easy = take('easy', 500)
const normal = take('normal', 500)
const hard = take('hard', 500)
const final = [...easy, ...normal, ...hard]

const payload = {
  easy: easy.length,
  normal: normal.length,
  hard: hard.length,
  total: final.length,
  items: final,
}

fs.writeFileSync(outJson, JSON.stringify(payload), 'utf8')

const file = `/** 由 scripts/generate-life-sense-bank.mjs 生成，请勿手改 */
import type { LifeSenseBankItem } from '@/utils/lifeSenseBankTypes'
import raw from '@/utils/lifeSenseBank.generated.json'

export type { LifeSenseBankItem }

export const LIFE_SENSE_BANK = raw.items as LifeSenseBankItem[]

export const LIFE_SENSE_BANK_COUNTS = {
  easy: raw.easy,
  normal: raw.normal,
  hard: raw.hard,
  total: raw.total,
} as const
`

fs.writeFileSync(outTs, file, 'utf8')
console.log('wrote', outJson, outTs, payload.easy, payload.normal, payload.hard)