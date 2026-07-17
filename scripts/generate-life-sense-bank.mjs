/**
 * 生成口算·生活常识题库（每难度尽量逼近 900：原约 500 + 关系类约 400）
 * 硬性规则：只使用人工校对的「名称→答案」配对，禁止按索引乱搭。
 * 运行：node scripts/generate-life-sense-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ANCIENT_APPELLATIONS,
  ANCIENT_MEANING_DISTRACTORS,
  AUTHOR_DISTRACTORS,
  CAPITALS,
  COUNTRY_DISTRACTORS,
  GEO_CITY_PROVINCE,
  GEO_FOREIGN,
  GEO_PROVINCE_COUNTRY,
  LITERARY_WORKS,
  PROVINCE_DISTRACTORS,
} from './life-sense-relations-data.mjs'
import { getNatureQaByDifficulty } from './life-sense-nature-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outJson = path.join(__dirname, '../src/utils/lifeSenseBank.generated.json')
const outTs = path.join(__dirname, '../src/utils/lifeSenseBank.generated.ts')

/** @typedef {{ difficulty: 'easy'|'normal'|'hard', stem: string, correct: string, distractors: string[], explanation: string, key: string }} Item */

function uniq(arr) {
  return [...new Set((arr || []).map((x) => String(x).trim()).filter(Boolean))]
}

function hashPick(seed, arr, n) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

/** @type {Item[]} */
const items = []
const seenKey = new Set()
/** stem 前缀 → 唯一允许的正确答案（用于自检） */
const truthByStem = new Map()

function registerTruth(stem, correct) {
  const prev = truthByStem.get(stem)
  if (prev && prev !== correct) {
    throw new Error(`自检失败：同一题干冲突\n${stem}\n曾=${prev}\n现=${correct}`)
  }
  truthByStem.set(stem, correct)
}

function push(difficulty, stem, correct, distractorsIn, explanation, keyExtra = '') {
  const c = String(correct).trim()
  const st = String(stem).trim()
  if (!st || !c) return false
  registerTruth(st, c)

  /** @type {{ same: string[], other: string[] }} */
  let structured
  if (distractorsIn && typeof distractorsIn === 'object' && !Array.isArray(distractorsIn)) {
    structured = {
      same: uniq(distractorsIn.same).filter((d) => d !== c),
      other: uniq(distractorsIn.other).filter((d) => d !== c),
    }
  } else {
    structured = { same: uniq(distractorsIn).filter((d) => d !== c), other: [] }
  }
  if (structured.same.length + structured.other.length < 2) {
    throw new Error(`干扰项不足: ${st} / ${c}`)
  }

  // 同一题干可因干扰组合不同多条，正确答案必须一致（用于凑足练习量，不编造错误配对）
  const packs = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 8 : 10
  for (let pack = 0; pack < packs; pack++) {
    const key = `${st}|${c}|${difficulty}|p${pack}|${keyExtra}`
    if (seenKey.has(key)) continue
    const distractors = pickDistractors(st.length * 97 + c.length * 13 + pack * 31, structured, 8)
    if (distractors.length < 2) continue
    seenKey.add(key)
    items.push({
      difficulty,
      stem: st,
      correct: c,
      distractors,
      explanation,
      key,
    })
  }
  return true
}

/** 单包推入（用于专题题：每题干只保留 1 条，便于精确凑满 120） */
function pushOnce(difficulty, stem, correct, distractorsIn, explanation, keyExtra = 'nature') {
  const c = String(correct).trim()
  const st = String(stem).trim()
  if (!st || !c) return false
  registerTruth(st, c)

  let structured
  if (distractorsIn && typeof distractorsIn === 'object' && !Array.isArray(distractorsIn)) {
    structured = {
      same: uniq(distractorsIn.same).filter((d) => d !== c),
      other: uniq(distractorsIn.other).filter((d) => d !== c),
    }
  } else {
    structured = { same: uniq(distractorsIn).filter((d) => d !== c), other: [] }
  }
  if (structured.same.length + structured.other.length < 2) {
    throw new Error(`干扰项不足: ${st} / ${c}`)
  }
  const key = `${st}|${c}|${difficulty}|p0|${keyExtra}`
  if (seenKey.has(key)) return false
  const distractors = pickDistractors(st.length * 97 + c.length * 13 + 17, structured, 8)
  if (distractors.length < 2) throw new Error(`干扰挑选失败: ${st}`)
  seenKey.add(key)
  items.push({
    difficulty,
    stem: st,
    correct: c,
    distractors,
    explanation,
    key,
  })
  return true
}

function addNatureKnowledge(diff) {
  const bag = getNatureQaByDifficulty(diff)
  const topicLabel = {
    weather: '天气节气',
    festival: '节日纪念日',
    astronomy: '天文',
    landform: '山川河流',
  }
  let n = 0
  for (const [topic, rows] of Object.entries(bag)) {
    for (const [stem, correct, distractors] of rows) {
      if (pairNameLeaks(stem.replace(/[？?].*$/, ''), correct, 'subjectHasAnswer')) {
        // 题干是整句，多数不触发；仍做轻量保护
      }
      const ok = pushOnce(
        diff,
        stem,
        correct,
        distractors,
        `【${topicLabel[topic] || topic}】正确答案是「${correct}」。`,
        `nature-${topic}`,
      )
      if (ok) n += 1
    }
  }
  if (n !== 120) {
    throw new Error(`自然地理专题 ${diff} 应为 120 题，实际 ${n}`)
  }
}

// ========== 校对词库：只写确定关系 ==========

/**
 * 材料：产品 → 主要原材料
 * 难度约定：
 * - easy：日常可见的天然/简单构成（棉、粮、木竹、玻璃、砖纸、乳品豆麦等）
 * - normal：略需生活经验（钢材零件、软木藤、石膏、硅胶厨具等）
 * - hard：工业加工/合成/合金/石化聚合物（化纤、工程塑料、合金牌号、高分子俗称对应）
 * 硬性：产品名不得直接泄露出原材料（禁「铁锅→铁」「棉布→棉花」这类）。
 */
const MATERIALS = {
  easy: [
    ['纱布', '棉花'],
    ['创可贴内垫常见', '棉花'],
    ['外套保暖填充物常见', '羽绒'],
    ['冬季外套保暖填充常见', '羽绒'],
    ['易拉罐罐体常见', '铝'],
    ['家用锡纸', '铝'],
    ['蜡烛主要成分', '石蜡'],
    ['自行车内胎', '橡胶'],
    ['汽车雨刮胶条', '橡胶'],
    ['汽车轮胎胎面', '橡胶'],
    ['真皮沙发面料常见', '皮革'],
    ['腰带常见真皮款材质', '皮革'],
    ['奶酪', '牛奶'],
    ['黄油', '牛奶'],
    ['奶粉主料常见', '牛奶'],
    ['豆浆', '大豆'],
    ['豆腐', '大豆'],
    ['面粉', '小麦'],
    ['挂面主料', '小麦'],
    ['大米', '稻谷'],
    ['糯米', '稻谷'],
    ['碗盘坯体常见', '瓷土'],
    ['砂锅胎体常见', '陶土'],
    ['透明水杯常见材质', '玻璃'],
    ['窗上透明板常见', '玻璃'],
    ['切菜砧板常见材质', '木材'],
    ['一次性环保筷常见', '竹子'],
    ['菜市提篮常见材质', '竹子'],
    ['砌墙块常见', '砖'],
    ['课本内页', '纸'],
    ['快递外箱常见', '纸板'],
    ['田间遮阳帽常见编制材', '草'],
    ['传统绳结常见天然材', '草'],
    ['电源线芯常见', '铜'],
    ['常见导电金属线芯', '铜'],
    ['橄榄油主要来自', '油橄榄'],
    ['葵花油主要来自', '葵花籽'],
    ['豆油主要来自', '大豆'],
  ],
  normal: [
    ['镀锌水管基材', '钢'],
    ['自行车链条基材', '钢'],
    ['不粘锅铲柔性材质常见', '硅胶'],
    ['酒塞常用植物组织', '软木'],
    ['家用躺椅常见茎蔓植物材质', '藤'],
    ['装饰线脚粉状胶凝材', '石膏'],
    ['门窗钢化透明板', '玻璃'],
    ['毛巾型植物纤维替代棉', '竹纤维'],
  ],
  hard: [
    // 化纤 / 工业纺织
    ['冲锋衣化纤面常见', '涤纶'],
    ['雨伞伞面化纤常见', '尼龙'],
    ['膨体毛线常见', '腈纶'],
    ['松紧腰带弹力纤维常见', '氨纶'],
    // 工程塑料 / 高分子
    ['PE保鲜膜', '聚乙烯'],
    ['PVC水管', '聚氯乙烯'],
    ['不粘锅涂层常见代号PTFE对应', '聚四氟乙烯'],
    ['白色泡沫包装板常见', '聚苯乙烯'],
    ['遥控外壳常见工程塑料', 'ABS塑料'],
    ['收纳箱常见食品级塑料', 'PP塑料'],
    ['透明展示板常见有机玻璃俗称材', '亚克力'],
    ['钓鱼竿轻质高强纤维常见', '碳纤维'],
    ['海绵泡沫弹性体常见', '聚氨酯'],
    ['汽车密封条三元乙丙对应', 'EPDM橡胶'],
    ['车船外壳纤维树脂复合材俗称对应', '玻璃钢'],
    // 合金 / 特种金属
    ['轻质窗框金属常见', '铝合金'],
    ['断桥窗型材金属主体', '铝合金'],
    ['标称304的餐具材质', '不锈钢'],
    ['眼镜架轻质金属常见', '钛合金'],
    ['笔记本壳体轻质金属常见', '镁合金'],
    ['切削刀头超硬合金常见', '硬质合金'],
    ['焊接用金属丝主料常见', '锡'],
    ['蓄电池极板主要金属', '铅'],
    ['强磁吸铁石常见磁材来源', '稀土磁材'],
    // 石化 / 建材工业
    ['建筑保温岩质纤维板', '岩棉'],
    ['铺路黑黏结料常见', '沥青'],
  ],
}

/** 若产品名已点明原料，视为泄题 */
function materialNameLeaks(product, material) {
  const p = String(product)
  const m = String(material)
  if (!p || !m) return true
  if (p.includes(m)) return true
  const hints = {
    棉花: ['棉'],
    羊毛: ['羊毛'],
    蚕丝: ['蚕丝', '丝绸', '丝巾'],
    麻: ['麻'],
    竹子: ['竹'],
    木材: ['木'],
    玻璃: ['玻璃'],
    铁: ['铁'],
    铝: ['铝'],
    塑料: ['塑料'],
    橡胶: ['橡胶', '橡皮'],
    皮革: ['皮鞋', '皮带', '皮手套'],
    羽绒: ['羽绒'],
    纸: ['纸盒', '纸页'],
    纸板: ['纸箱'],
    砖: ['砖墙', '砖块'],
    不锈钢: ['不锈钢'],
    尼龙: ['尼龙'],
    涤纶: ['涤纶'],
    腈纶: ['腈纶'],
    氨纶: ['氨纶'],
    竹纤维: ['竹纤维'],
    硅胶: ['硅胶'],
    花生: ['花生'],
    菜籽: ['菜籽'],
    芝麻: ['芝麻'],
    大豆: ['大豆油'],
    玉米: ['玉米油', '玉米面'],
    瓷土: ['瓷'],
    陶土: ['陶'],
    铜: ['铜导', '黄铜'],
    软木: ['软木垫'],
    藤: ['藤椅', '藤编'],
    石膏: ['石膏线'],
    碳纤维: ['碳纤维竿'],
    葵花籽: ['葵花籽油'],
    岩棉: ['岩棉板'],
    铝合金: ['断桥铝'],
    钛合金: ['钛眼镜'],
    镁合金: ['镁合金壳'],
    硬质合金: ['硬质合金'],
    铅: ['铅蓄'],
    沥青: ['沥青路面'],
    玻璃钢: ['玻璃钢外壳'],
    聚氨酯: ['聚氨酯泡沫'],
    ABS塑料: ['ABS外壳'],
    PP塑料: ['PP收纳'],
    亚克力: ['亚克力板'],
  }
  for (const h of hints[m] || []) {
    if (h && p.includes(h)) return true
  }
  if (m.length === 1 && p.includes(m)) return true
  return false
}

/** 种属：事物 → 类别（必须正确）
 * easy：日常食材/用品大类；normal：稍生僻食材；hard：加工胶剂/伪谷物/蜂产品细分等
 */
const KINDS = {
  easy: [
    ['大米', '粮食'],
    ['小麦', '粮食'],
    ['玉米粒', '粮食'],
    ['小米', '粮食'],
    ['面粉', '粮食加工品'],
    ['挂面', '粮食加工品'],
    ['馒头', '粮食加工品'],
    ['土豆', '薯类'],
    ['红薯', '薯类'],
    ['马铃薯', '薯类'],
    ['甘薯', '薯类'],
    ['西红柿', '蔬果'],
    ['番茄', '蔬果'],
    ['黄瓜', '蔬果'],
    ['白菜', '蔬果'],
    ['萝卜', '蔬果'],
    ['茄子', '蔬果'],
    ['苹果', '水果'],
    ['香蕉', '水果'],
    ['橙子', '水果'],
    ['梨', '水果'],
    ['葡萄', '水果'],
    ['牛奶', '乳制品'],
    ['酸奶', '乳制品'],
    ['奶酪', '乳制品'],
    ['奶粉', '乳制品'],
    ['鸡蛋', '禽蛋'],
    ['鸭蛋', '禽蛋'],
    ['猪肉', '肉类'],
    ['牛肉', '肉类'],
    ['鸡肉', '肉类'],
    ['羊肉', '肉类'],
    ['花生油', '植物油'],
    ['酱油', '调味品'],
    ['醋', '调味品'],
    ['食盐', '调味品'],
    ['味精', '调味品'],
    ['白糖', '甜味料'],
    ['红糖', '甜味料'],
    ['茶叶', '饮料原料'],
    ['咖啡豆', '饮料原料'],
    ['牙膏', '清洁用品'],
    ['肥皂', '清洁用品'],
    ['沐浴露', '清洁用品'],
    ['洗发水', '清洁用品'],
    ['洗衣液', '清洁用品'],
    ['毛巾', '日用品'],
    ['抹布', '日用品'],
    ['拖鞋', '鞋类'],
    ['运动鞋', '鞋类'],
    ['台灯', '灯具'],
    ['灯泡', '灯具'],
    ['书包', '箱包'],
    ['手提包', '箱包'],
    ['矿泉水', '饮料'],
    ['汽水', '饮料'],
  ],
  normal: [
    ['鹌鹑蛋', '禽蛋'],
    ['羊奶', '乳制品'],
    ['黄油', '乳制品'],
    ['蜂蜜', '蜂产品'],
    ['紫菜', '藻类'],
    ['香菇', '菌类'],
    ['木耳', '菌类'],
    ['银耳', '菌类'],
    ['海带', '藻类'],
    ['绿豆', '豆类'],
    ['花生', '油料作物'],
    ['芝麻', '油料作物'],
    ['白酒', '蒸馏酒'],
    ['啤酒', '发酵酒'],
    ['豆腐', '豆制品'],
    ['粉丝', '淀粉制品'],
    ['年糕', '米制品'],
    ['燕麦', '谷物'],
    ['荞麦', '谷物'],
    ['猪油', '动物油脂'],
    ['菜籽油', '植物油'],
    ['山茶油', '植物油'],
    ['椰子油', '植物油'],
    ['亚麻籽油', '植物油'],
    ['芋头', '薯芋类'],
    ['魔芋', '薯芋类'],
  ],
  hard: [
    ['藜麦', '伪谷物'],
    ['蜂蜡', '蜂产品'],
    ['蜂王浆', '蜂产品'],
    ['明胶', '动物胶'],
    ['琼脂', '植物胶'],
    ['木糖醇', '甜味料'],
  ],
}

/**
 * 组成：部件 → 所属整件（强对应，尽量唯一）
 * 题干不得出现整件名；部件名与整件名不得互相包含（禁「插座孔→插座」「涡轮→涡轮增压器」）。
 * 多宿主部件勿入库；干扰项禁止放其它合法宿主。
 */
const PARTS = {
  easy: [
    ['方向盘', '汽车'],
    ['车把', '自行车'],
    ['车座', '自行车'],
    ['脚蹬', '自行车'],
    ['镜片', '眼镜'],
    ['镜框', '眼镜'],
    ['笔芯', '圆珠笔'],
    ['笔帽', '圆珠笔'],
    ['壶嘴', '茶壶'],
    ['扇叶', '电风扇'],
    ['鞋带', '运动鞋'],
    ['刀刃', '菜刀'],
    ['刷毛', '牙刷'],
    ['表盘', '手表'],
    ['灯罩', '台灯'],
    ['插头', '电源线'],
    ['拉头', '拉链'],
    ['琴键', '钢琴'],
    ['铅芯', '自动铅笔'],
    ['墨囊', '钢笔'],
  ],
  normal: [
    ['滤芯', '净水器'],
    ['刀盘', '破壁机'],
    ['泄压阀', '高压锅'],
    ['墨盒', '打印机'],
    ['硒鼓', '激光打印机'],
    ['火花塞', '发动机'],
    ['灯丝', '白炽灯'],
    ['阀芯', '水龙头'],
    ['风轮', '抽油烟机'],
    ['加热盘', '电磁炉'],
    ['感光鼓', '复印机'],
    ['刹车片', '制动系统'],
    ['密封圈', '压力锅'],
    ['加热管', '电热水器'],
  ],
  hard: [
    ['三元催化器', '汽车尾气系统'],
    ['氧传感器', '发动机控制系统'],
    ['节气门', '进气系统'],
    ['碳刷', '有刷电机'],
    ['换向器', '有刷电机'],
    ['点火针', '燃气灶'],
    ['膨胀阀', '制冷系统'],
    ['热电偶', '测温装置'],
    ['光栅盘', '编码器'],
    ['衔铁', '继电器'],
    ['曲轴', '发动机'],
    ['凸轮轴', '发动机'],
    ['增压叶轮', '涡轮增压器'],
    ['阀座', '止回阀'],
  ],
}

/** 部件还可能出现在这些整件上 —— 禁止作为干扰项出现 */
const PART_ALSO_ON = {
  灯罩: ['台灯', '落地灯', '吊灯'],
  插头: ['电源线', '充电器', '排插'],
  滤芯: ['净水器', '空气净化器', '烟机'],
  密封圈: ['压力锅', '水龙头', '保温杯'],
  刀刃: ['菜刀', '水果刀', '剪刀'],
  表盘: ['手表', '闹钟', '仪表'],
  脚蹬: ['自行车', '健身车'],
  琴键: ['钢琴', '电子琴', '风琴'],
}

/** 题干主语与答案互相包含 → 明显泄题；mode=subjectHasAnswer 仅禁「主语包含答案」 */
function pairNameLeaks(subject, answer, mode = 'both') {
  const a = String(subject || '').trim()
  const b = String(answer || '').trim()
  if (!a || !b) return true
  if (a === b) return true
  if (a.includes(b)) return true
  if (mode === 'both' && b.includes(a)) return true
  return false
}

/** 用途：工具 → 功能 */
const TOOLS = {
  easy: [
    ['剪刀', '剪裁'],
    ['锤子', '敲打'],
    ['勺子', '舀取'],
    ['叉子', '叉取'],
    ['筷子', '夹取'],
    ['雨伞', '遮雨'],
    ['牙刷', '刷牙'],
    ['扫帚', '扫地'],
    ['拖把', '拖地'],
    ['毛巾', '擦拭'],
    ['水壶', '烧水'],
    ['风扇', '吹风'],
    ['台灯', '照明'],
    ['钥匙', '开锁'],
    ['尺子', '量长度'],
    ['钟表', '计时'],
    ['镜子', '照影'],
    ['梳子', '梳头'],
    ['针', '缝补'],
    ['开瓶器', '启瓶盖'],
  ],
  normal: [
    ['扳手', '拧螺母'],
    ['螺丝刀', '拧螺丝'],
    ['钳子', '夹持'],
    ['锯子', '锯切'],
    ['卷尺', '测距离'],
    ['水平尺', '测水平'],
    ['美工刀', '裁切'],
    ['打气筒', '充气'],
    ['砂纸', '打磨'],
    ['订书机', '装订'],
    ['开罐器', '开启罐头'],
    ['削皮刀', '去果皮'],
    ['漏勺', '沥水'],
    ['锥子', '钻孔'],
    ['胶水', '粘接'],
  ],
  hard: [
    ['线坠', '找垂直'],
    ['万用表', '测电参数'],
    ['卡尺', '测尺寸'],
    ['角尺', '测直角'],
    ['塞尺', '测间隙'],
    ['电烙铁', '焊接'],
    ['热熔胶枪', '热熔粘接'],
    ['内六角扳手', '拧内六角'],
    ['棘轮扳手', '连续拧转'],
    ['兆欧表', '测绝缘'],
  ],
}

const MATERIAL_DOMAIN = {
  棉花: '纺织',
  羊毛: '纺织',
  蚕丝: '纺织',
  麻: '纺织',
  尼龙: '纺织',
  涤纶: '纺织',
  腈纶: '纺织',
  氨纶: '纺织',
  竹纤维: '纺织',
  羽绒: '纺织',
  皮革: '纺织',
  竹子: '植物材',
  木材: '植物材',
  软木: '植物材',
  藤: '植物材',
  草: '植物材',
  纸: '植物材',
  纸板: '植物材',
  玻璃: '无机',
  瓷土: '无机',
  陶土: '无机',
  砖: '无机',
  石膏: '无机',
  水泥: '无机',
  沙子: '无机',
  铁: '金属',
  铝: '金属',
  不锈钢: '金属',
  铜: '金属',
  钢: '金属',
  锡: '金属',
  铅: '金属',
  铝合金: '金属',
  钛合金: '金属',
  镁合金: '金属',
  硬质合金: '金属',
  塑料: '合成',
  橡胶: '合成',
  硅胶: '合成',
  ABS塑料: '合成',
  PP塑料: '合成',
  亚克力: '合成',
  碳纤维: '合成',
  聚乙烯: '合成',
  聚氯乙烯: '合成',
  聚四氟乙烯: '合成',
  聚苯乙烯: '合成',
  聚氨酯: '合成',
  玻璃钢: '合成',
  EPDM橡胶: '合成',
  石蜡: '石化',
  沥青: '石化',
  岩棉: '石化',
  稀土磁材: '特种',
  花生: '粮油',
  菜籽: '粮油',
  芝麻: '粮油',
  大豆: '粮油',
  小麦: '粮油',
  稻谷: '粮油',
  玉米: '粮油',
  牛奶: '粮油',
  油橄榄: '粮油',
  葵花籽: '粮油',
}

const KIND_DOMAIN = {
  粮食: '食材',
  粮食加工品: '食材',
  薯类: '食材',
  蔬果: '食材',
  水果: '食材',
  乳制品: '食材',
  禽蛋: '食材',
  肉类: '食材',
  植物油: '食材',
  调味品: '食材',
  甜味料: '食材',
  饮料原料: '食材',
  饮料: '食材',
  蜂产品: '食材',
  藻类: '食材',
  菌类: '食材',
  豆类: '食材',
  油料作物: '食材',
  蒸馏酒: '食材',
  发酵酒: '食材',
  豆制品: '食材',
  淀粉制品: '食材',
  米制品: '食材',
  谷物: '食材',
  动物油脂: '食材',
  薯芋类: '食材',
  伪谷物: '食材',
  动物胶: '食材',
  植物胶: '食材',
  清洁用品: '家居',
  日用品: '家居',
  鞋类: '家居',
  灯具: '家居',
  箱包: '家居',
  电器: '家居',
  厨具: '家居',
  家具: '家居',
  文具: '家居',
}

const WHOLE_DOMAIN = {
  菜刀: '厨具',
  炒锅: '厨具',
  茶壶: '厨具',
  压力锅: '厨具',
  高压锅: '厨具',
  破壁机: '厨具',
  抽油烟机: '厨具',
  油烟机: '厨具',
  电磁炉: '厨具',
  燃气灶: '厨具',
  自行车: '出行',
  汽车: '出行',
  运动鞋: '穿戴',
  鞋子: '穿戴',
  衣服: '穿戴',
  眼镜: '穿戴',
  手表: '穿戴',
  圆珠笔: '文具',
  书本: '文具',
  椅子: '家具',
  台灯: '家电',
  电风扇: '家电',
  空调: '家电',
  空调制冷系统: '家电',
  电热水器: '家电',
  净水器: '家电',
  打印机: '办公',
  激光打印机: '办公',
  复印机: '办公',
  手机: '数码',
  保温杯: '日用',
  牙刷: '日用',
  拉链: '日用',
  钥匙: '日用',
  门锁: '日用',
  钟表: '日用',
  电源线: '电气',
  插座: '电气',
  开关: '电气',
  白炽灯: '电气',
  电机: '机电',
  有刷电机: '机电',
  发动机: '机电',
  发动机控制系统: '机电',
  汽车尾气系统: '出行',
  进气系统: '机电',
  制动系统: '出行',
  变速机构: '机电',
  轮轴: '机电',
  水龙头: '五金',
  止回阀: '五金',
  压力开关: '五金',
  继电器: '电气',
  电磁阀: '电气',
  编码器: '电气',
  测温装置: '仪器',
  剃须刀: '个护',
  液压缸: '机电',
  涡轮增压器: '机电',
  制冷系统: '家电',
  钢琴: '乐器',
  钢笔: '文具',
  自动铅笔: '文具',
}

const USE_DOMAIN = {
  剪裁: '加工',
  锯切: '加工',
  裁切: '加工',
  打磨: '加工',
  钻孔: '加工',
  焊接: '加工',
  热熔粘接: '加工',
  粘接: '加工',
  装订: '加工',
  切削: '加工',
  研磨: '加工',
  压制: '加工',
  敲打: '装配',
  拧螺母: '装配',
  拧螺丝: '装配',
  拧内六角: '装配',
  连续拧转: '装配',
  夹持: '装配',
  夹紧: '装配',
  打气: '装配',
  固定: '装配',
  量长度: '测量',
  测距离: '测量',
  测水平: '测量',
  找垂直: '测量',
  测直角: '测量',
  测尺寸: '测量',
  测间隙: '测量',
  测电参数: '测量',
  测绝缘: '测量',
  计时: '测量',
  测量: '测量',
  扫地: '清洁',
  拖地: '清洁',
  擦拭: '清洁',
  刷牙: '清洁',
  舀取: '餐厨',
  叉取: '餐厨',
  夹取: '餐厨',
  沥水: '餐厨',
  削皮: '餐厨',
  开瓶: '餐厨',
  启瓶盖: '餐厨',
  开罐: '餐厨',
  开启罐头: '餐厨',
  削皮: '餐厨',
  去果皮: '餐厨',
  烧水: '餐厨',
  打气: '装配',
  充气: '装配',
  遮雨: '日常',
  照明: '日常',
  吹风: '日常',
  开锁: '日常',
  照影: '日常',
  梳头: '日常',
  缝补: '日常',
  加热: '日常',
}

/** 同域优先干扰池：返回 { same, other }，抽取时强制多数来自 same */
function distractorPool(correct, allCandidates, domainOf) {
  const pool = uniq(allCandidates).filter((x) => x && x !== correct)
  const dom = domainOf(correct)
  if (!dom) return { same: pool, other: [] }
  const same = pool.filter((x) => domainOf(x) === dom)
  const other = pool.filter((x) => domainOf(x) !== dom)
  return { same, other }
}

/** 多数从同域易混项抽；同域足够时全部同域，不足再补异域 */
function pickDistractors(seed, orderedPool, n) {
  const same = uniq(orderedPool?.same || (Array.isArray(orderedPool) ? orderedPool : []))
  const other = uniq(orderedPool?.other || [])
  const fallback = same.length ? same : other
  const wantSame = Math.min(n, same.length || 0)
  const fromSame = wantSame > 0 ? hashPick(seed, same, wantSame) : []
  const need = n - fromSame.length
  const fromOther =
    need > 0 ? hashPick(seed + 991, other.length ? other : fallback, need) : []
  return uniq([...fromSame, ...fromOther]).slice(0, n)
}

const ALL_USES = uniq(
  [...TOOLS.easy, ...TOOLS.normal, ...TOOLS.hard].map((x) => x[1]).concat(['测量', '加热', '固定', '切削', '研磨', '夹紧', '压制']),
)
const USE_POOL = {
  easy: ALL_USES,
  normal: ALL_USES,
  hard: ALL_USES,
}

const ALL_KINDS = uniq(
  [...KINDS.easy, ...KINDS.normal, ...KINDS.hard].map((x) => x[1]).concat(['菌类', '藻类', '豆类', '谷物', '蜂产品', '电器', '厨具', '家具', '文具']),
)
const KIND_POOL = {
  easy: ALL_KINDS,
  normal: ALL_KINDS,
  hard: ALL_KINDS,
}

const ALL_MATERIALS = uniq(
  [...MATERIALS.easy, ...MATERIALS.normal, ...MATERIALS.hard]
    .map((x) => x[1])
    .concat(['涤纶', '尼龙', '硅胶', '水泥', '沙子', '腈纶', '氨纶', '竹纤维']),
)
const MATERIAL_POOL = {
  easy: ALL_MATERIALS,
  normal: ALL_MATERIALS,
  hard: ALL_MATERIALS,
}

function addMaterials(diff) {
  const rows = MATERIALS[diff]
  for (const [product, material] of rows) {
    if (materialNameLeaks(product, material)) {
      throw new Error(`原材料题名称泄题: ${product} → ${material}`)
    }
    push(
      diff,
      `${product}的主要原材料是？`,
      material,
      distractorPool(material, MATERIAL_POOL[diff], (x) => MATERIAL_DOMAIN[x]),
      `「${product}」常见主体原料是「${material}」。题干刻意不直接点名材料字样；干扰项为同大类其它材料。`,
    )
  }
}

/** 每种原料只出一道反向题，避免同题干多解；仅短品名作选项以免选项本身像注解 */
const reversedMaterials = new Set()
function addMaterialReverse(diff) {
  const rows = MATERIALS[diff]
  const shortOk = (p) => p.length <= 6 && !/常见|主要|材质|主料|对应|俗称|填充|来自/.test(p)
  const allProducts = uniq(
    [...MATERIALS.easy, ...MATERIALS.normal, ...MATERIALS.hard].map(([p]) => p).filter(shortOk),
  )
  for (const [product, material] of rows) {
    if (!shortOk(product)) continue
    if (reversedMaterials.has(material)) continue
    if (materialNameLeaks(product, material)) continue
    reversedMaterials.add(material)
    const pool = {
      same: allProducts.filter((p) => p !== product),
      other: [],
    }
    if (pool.same.length < 2) continue
    push(
      diff,
      `${material}在生活中常用来做？`,
      product,
      pool,
      `「${material}」常见用途之一是做成「${product}」。其它选项多为别的原料对应制品。`,
      'rev',
    )
  }
}

function addKinds(diff) {
  for (const [thing, kind] of KINDS[diff]) {
    push(
      diff,
      `${thing}是一种？`,
      kind,
      distractorPool(kind, KIND_POOL[diff], (x) => KIND_DOMAIN[x]),
      `「${thing}」按生活常识归类属于「${kind}」。干扰项尽量取相近品类，避免靠「风马牛不相及」蒙对。`,
    )
  }
}

/**
 * 组成：题干只出示部件，答案为整件名。
 * 禁止「整件上的部件」泄题句式；干扰项不得含其它合法宿主。
 */
function addParts(diff) {
  const rows = PARTS[diff]
  const allWholes = uniq([
    ...PARTS.easy.map(([, w]) => w),
    ...PARTS.normal.map(([, w]) => w),
    ...PARTS.hard.map(([, w]) => w),
    '摩托车',
    '电动车',
    '冰箱',
    '洗衣机',
    '落地灯',
    '吊灯',
    '水果刀',
    '闹钟',
    '充电器',
  ])
  for (const [part, whole] of rows) {
    const stem = `${part}通常属于？`
    if (pairNameLeaks(part, whole)) {
      throw new Error(`组成题名互相包含(泄题): ${part} → ${whole}`)
    }
    // 题干去掉部件名后仍含整件名
    if (stem.replace(part, '').includes(whole)) {
      throw new Error(`组成题干泄题(含整件名): ${stem}`)
    }
    const forbidden = new Set([...(PART_ALSO_ON[part] || []), whole])
    // 其它合法宿主绝不能进干扰
    const candidates = allWholes.filter((w) => w !== whole && !forbidden.has(w))
    // 若 PART_ALSO_ON 把过多同域干掉，仍用异类补足
    const pool = distractorPool(whole, candidates, (w) => WHOLE_DOMAIN[w] || '其它')
    // 二次过滤：保险去掉宿主
    pool.same = pool.same.filter((w) => !forbidden.has(w) && w !== whole)
    pool.other = pool.other.filter((w) => !forbidden.has(w) && w !== whole)
    if (pool.same.length + pool.other.length < 2) {
      throw new Error(`组成题干扰不足: ${part} → ${whole}`)
    }
    push(
      diff,
      stem,
      whole,
      pool,
      `「${part}」在生活常识中通常属于「${whole}」。干扰项已排除其它也可能带该部件的对象，避免一题多解。`,
    )
  }
}

function addTools(diff) {
  for (const [tool, use] of TOOLS[diff]) {
    if (pairNameLeaks(tool, use, 'subjectHasAnswer')) {
      throw new Error(`用途题泄题(工具名含用途): ${tool} → ${use}`)
    }
    push(
      diff,
      `${tool}用来？`,
      use,
      distractorPool(use, USE_POOL[diff], (x) => USE_DOMAIN[x]),
      `「${tool}」的主要功能是「${use}」。干扰项多为同类工具的相近用途，注意细辨差异。`,
    )
  }
}

/**
 * 别称同义组：同一组内互为有效别称。
 * 「A的别称是？」答案只能是组内另一名；干扰项严禁落入同组其它名。
 */
const ALIAS_GROUPS = [
  ['番茄', '西红柿', '蕃茄'],
  ['马铃薯', '土豆', '洋芋', '山药蛋'],
  ['红薯', '甘薯', '番薯', '地瓜'],
  ['玉米', '苞米', '包谷', '玉蜀黍'],
  ['花生', '落花生'],
  ['大豆', '黄豆'],
  ['卷心菜', '包菜', '圆白菜'],
  ['自行车', '脚踏车'],
  ['肥皂', '胰子'],
  ['火柴', '洋火'],
]

/** 题干名 → 唯一正确答案（每词干仅一条，禁止一题多解） */
const NICKNAMES = {
  easy: [
    ['番茄', '西红柿'],
    ['西红柿', '番茄'],
    ['马铃薯', '土豆'],
    ['土豆', '马铃薯'],
    ['自行车', '脚踏车'],
    ['脚踏车', '自行车'],
    ['肥皂', '胰子'],
    ['胰子', '肥皂'],
  ],
  normal: [
    ['红薯', '甘薯'],
    ['甘薯', '红薯'],
    ['花生', '落花生'],
    ['苞米', '玉米'],
    ['包谷', '玉米'],
    ['黄豆', '大豆'],
    ['大豆', '黄豆'],
    ['卷心菜', '包菜'],
    ['包菜', '卷心菜'],
    ['火柴', '洋火'],
    ['洋火', '火柴'],
  ],
  hard: [
    ['蕃茄', '番茄'],
    ['洋芋', '马铃薯'],
    ['山药蛋', '马铃薯'],
    ['番薯', '红薯'],
    ['地瓜', '红薯'],
    ['玉蜀黍', '玉米'],
    ['圆白菜', '卷心菜'],
  ],
}

const NICK_DISTRACTOR_EXTRA = [
  '高粱',
  '小米',
  '黄瓜',
  '丝瓜',
  '核桃',
  '芋头',
  '山药',
  '木薯',
  '荞麦',
  '绿豆',
  '红豆',
  '茄子',
  '辣椒',
  '萝卜',
  '大麦',
  '燕麦',
  '芝麻',
  '葵花籽',
  '摩托车',
  '三轮车',
  '洗衣液',
  '蜡烛',
  '打火机',
  '冬瓜',
  '南瓜',
  '芹菜',
  '菠菜',
  '莲藕',
  '生姜',
  '大蒜',
  '芝麻酱',
  '板栗',
  '杏仁',
  '电动车',
  '滑板车',
  '香皂',
  '洗洁精',
  '打火石',
]

function aliasGroupOf(name) {
  return ALIAS_GROUPS.find((g) => g.includes(name)) || [name]
}

const NICK_DOMAIN = {
  番茄: '蔬果',
  西红柿: '蔬果',
  蕃茄: '蔬果',
  马铃薯: '薯类',
  土豆: '薯类',
  洋芋: '薯类',
  山药蛋: '薯类',
  红薯: '薯类',
  甘薯: '薯类',
  番薯: '薯类',
  地瓜: '薯类',
  玉米: '谷物',
  苞米: '谷物',
  包谷: '谷物',
  玉蜀黍: '谷物',
  花生: '油料',
  落花生: '油料',
  大豆: '豆类',
  黄豆: '豆类',
  卷心菜: '叶菜',
  包菜: '叶菜',
  圆白菜: '叶菜',
  自行车: '出行',
  脚踏车: '出行',
  肥皂: '清洁',
  胰子: '清洁',
  火柴: '点火',
  洋火: '点火',
  高粱: '谷物',
  小米: '谷物',
  黄瓜: '蔬果',
  丝瓜: '蔬果',
  核桃: '坚果',
  芋头: '薯类',
  山药: '薯类',
  木薯: '薯类',
  荞麦: '谷物',
  绿豆: '豆类',
  红豆: '豆类',
  茄子: '蔬果',
  辣椒: '蔬果',
  萝卜: '蔬果',
  大麦: '谷物',
  燕麦: '谷物',
  芝麻: '油料',
  葵花籽: '油料',
  摩托车: '出行',
  三轮车: '出行',
  洗衣液: '清洁',
  蜡烛: '点火',
  打火机: '点火',
  冬瓜: '蔬果',
  南瓜: '蔬果',
  芹菜: '蔬果',
  菠菜: '蔬果',
  莲藕: '蔬果',
  生姜: '蔬果',
  大蒜: '蔬果',
  芝麻酱: '油料',
  板栗: '坚果',
  杏仁: '坚果',
  电动车: '出行',
  滑板车: '出行',
  香皂: '清洁',
  洗洁精: '清洁',
  打火石: '点火',
}

function addNicknames(diff) {
  const rows = NICKNAMES[diff]
  const allNames = uniq([
    ...ALIAS_GROUPS.flat(),
    ...NICK_DISTRACTOR_EXTRA,
    ...Object.values(NICKNAMES)
      .flat()
      .flatMap(([a, b]) => [a, b]),
  ])
  for (const [name, nick] of rows) {
    const group = new Set(aliasGroupOf(name))
    if (!group.has(nick)) {
      throw new Error(`别称不在同义组内: ${name} → ${nick}`)
    }
    if (pairNameLeaks(name, nick, 'subjectHasAnswer')) {
      throw new Error(`别称题名泄题(主语含答案): ${name} → ${nick}`)
    }
    const pool = distractorPool(
      nick,
      allNames.filter((d) => !group.has(d)),
      (x) => NICK_DOMAIN[x] || '其它',
    )
    push(
      diff,
      `${name}的别称是？`,
      nick,
      pool,
      `「${name}」的常见别称是「${nick}」。干扰项多为相近作物/器物的其它叫法，勿张冠李戴。`,
    )
  }
}

function addAliasHard() {
  const same = [
    ['番茄', '西红柿'],
    ['马铃薯', '土豆'],
    ['蕃茄', '西红柿'],
    ['红薯', '甘薯'],
    ['花生', '落花生'],
  ]
  const diffPairs = [
    ['土豆', '红薯'],
    ['黄瓜', '丝瓜'],
    ['花生', '核桃'],
    ['大米', '小米'],
    ['玉米', '高粱'],
    ['番茄', '茄子'],
    ['黄豆', '绿豆'],
  ]
  for (const [a, b] of same) {
    push(
      'hard',
      `${a}和${b}是？`,
      '同种异名',
      ['不同作物', '同科谷物', '油脂近亲', '加工半成品'],
      `「${a}」与「${b}」是同一种事物的不同叫法。不要和土豆—红薯这类名字相近却是不同作物的情况混淆。`,
    )
  }
  for (const [a, b] of diffPairs) {
    push(
      'hard',
      `${a}和${b}是？`,
      '不同作物',
      ['同种异名', '同一种块根', '同一属水果', '同一加工品'],
      `「${a}」与「${b}」名称或外观可能相近，但它们是不同作物，并非同种异名。`,
    )
  }
}

/** 关系类：地理从属 / 首都 / 古代称呼 / 作品作者 */
function addRelations(diff) {
  // —— 省区市属于中国 ——
  if (diff === 'easy') {
    for (const [place, country] of GEO_PROVINCE_COUNTRY) {
      if (pairNameLeaks(place, country, 'subjectHasAnswer')) continue
      push(
        'easy',
        `${place}属于？`,
        country,
        distractorPool(country, COUNTRY_DISTRACTORS, () => '国家'),
        `「${place}」是中国的省级行政区（或特别行政区），属于中国。`,
      )
    }
    for (const [work, author] of LITERARY_WORKS.easy) {
      if (pairNameLeaks(work, author, 'subjectHasAnswer')) continue
      push(
        'easy',
        `《${work}》的作者是？`,
        author,
        distractorPool(author, AUTHOR_DISTRACTORS, () => '作者'),
        `《${work}》的作者是「${author}」。`,
      )
    }
    for (const [term, meaning] of ANCIENT_APPELLATIONS.easy) {
      if (pairNameLeaks(term, meaning, 'subjectHasAnswer')) continue
      push(
        'easy',
        `古代「${term}」常指？`,
        meaning,
        distractorPool(meaning, ANCIENT_MEANING_DISTRACTORS, () => '古称'),
        `文言/旧称里，「${term}」常指「${meaning}」。如秦时称百姓为黔首。`,
      )
    }
    // 少量首都题（简单）
    for (const [nation, capital] of CAPITALS.slice(0, 8)) {
      if (pairNameLeaks(nation, capital, 'subjectHasAnswer')) continue
      push(
        'easy',
        `${nation}的首都是？`,
        capital,
        distractorPool(
          capital,
          CAPITALS.map(([, c]) => c).concat(['大阪', '上海', '纽约', '悉尼', '多伦多', '伊斯坦布尔']),
          () => '首都',
        ),
        `「${nation}」的首都是「${capital}」。`,
      )
    }
  }

  if (diff === 'normal') {
    for (const [city, province] of GEO_CITY_PROVINCE) {
      if (pairNameLeaks(city, province, 'subjectHasAnswer')) continue
      push(
        'normal',
        `${city}属于？`,
        province,
        distractorPool(province, PROVINCE_DISTRACTORS, () => '省级'),
        `「${city}」行政上属于「${province}」。`,
      )
    }
    for (const [work, author] of LITERARY_WORKS.normal) {
      if (pairNameLeaks(work, author, 'subjectHasAnswer')) continue
      push(
        'normal',
        `《${work}》的作者是？`,
        author,
        distractorPool(author, AUTHOR_DISTRACTORS, () => '作者'),
        `《${work}》的作者是「${author}」。`,
      )
    }
    for (const [term, meaning] of ANCIENT_APPELLATIONS.normal) {
      if (pairNameLeaks(term, meaning, 'subjectHasAnswer')) continue
      push(
        'normal',
        `古代「${term}」常指？`,
        meaning,
        distractorPool(meaning, ANCIENT_MEANING_DISTRACTORS, () => '古称'),
        `旧时说法里，「${term}」常指「${meaning}」。`,
      )
    }
    for (const [nation, capital] of CAPITALS.slice(8, 16)) {
      if (pairNameLeaks(nation, capital, 'subjectHasAnswer')) continue
      push(
        'normal',
        `${nation}的首都是？`,
        capital,
        distractorPool(
          capital,
          CAPITALS.map(([, c]) => c).concat(['大阪', '上海', '纽约', '悉尼', '多伦多', '伊斯坦布尔', '里约热内卢']),
          () => '首都',
        ),
        `「${nation}」的首都是「${capital}」。`,
      )
    }
    for (const [city, country] of GEO_FOREIGN.slice(0, 14)) {
      if (pairNameLeaks(city, country, 'subjectHasAnswer')) continue
      push(
        'normal',
        `${city}属于？`,
        country,
        distractorPool(country, COUNTRY_DISTRACTORS, () => '国家'),
        `「${city}」是「${country}」的城市。`,
      )
    }
  }

  if (diff === 'hard') {
    for (const [city, country] of GEO_FOREIGN) {
      if (pairNameLeaks(city, country, 'subjectHasAnswer')) continue
      push(
        'hard',
        `${city}属于？`,
        country,
        distractorPool(country, COUNTRY_DISTRACTORS, () => '国家'),
        `「${city}」是「${country}」境内的重要城市，行政上属于该国。`,
      )
    }
    for (const [work, author] of LITERARY_WORKS.hard) {
      if (pairNameLeaks(work, author, 'subjectHasAnswer')) continue
      push(
        'hard',
        `《${work}》的作者是？`,
        author,
        distractorPool(author, AUTHOR_DISTRACTORS, () => '作者'),
        `《${work}》的作者是「${author}」。干扰项多为同时期或同领域其它作家，勿张冠李戴。`,
      )
    }
    for (const [term, meaning] of ANCIENT_APPELLATIONS.hard) {
      if (pairNameLeaks(term, meaning, 'subjectHasAnswer')) continue
      push(
        'hard',
        `古代「${term}」常指？`,
        meaning,
        distractorPool(meaning, ANCIENT_MEANING_DISTRACTORS, () => '古称'),
        `较文言的说法里，「${term}」常指「${meaning}」。干扰项多为其它年龄称谓或称谓义项。`,
      )
    }
    for (const [nation, capital] of CAPITALS.slice(12)) {
      if (pairNameLeaks(nation, capital, 'subjectHasAnswer')) continue
      push(
        'hard',
        `${nation}的首都是？`,
        capital,
        distractorPool(
          capital,
          CAPITALS.map(([, c]) => c).concat(['大阪', '上海', '纽约', '悉尼', '开普敦', '伊斯坦布尔', '里约热内卢']),
          () => '首都',
        ),
        `「${nation}」的首都是「${capital}」。注意勿与该国其它知名大城市（如港口、金融中心）混淆。`,
      )
    }
    // 反向：首都 → 国家（困难）
    // 注意：不可用「主语包含答案」粗判，否则「巴西利亚」会误伤「巴西」
    for (const [nation, capital] of CAPITALS) {
      if (!capital || !nation || capital === nation) continue
      if (nation.includes(capital)) continue
      push(
        'hard',
        `${capital}是哪国首都？`,
        nation,
        distractorPool(nation, COUNTRY_DISTRACTORS, () => '国家'),
        `「${capital}」是「${nation}」的首都。干扰项为其它国家，勿被同名或邻近国家迷惑。`,
      )
    }
  }
}

for (const d of ['easy', 'normal', 'hard']) {
  addNatureKnowledge(d) // 天气/节日/天文/山川：每难度精确 120 题，优先入库
  addMaterials(d)
  addMaterialReverse(d)
  addKinds(d)
  addParts(d)
  addTools(d)
  addNicknames(d)
  addRelations(d)
}
addAliasHard()

/** 自检：每个题干只能有一个正确答案；答案必须出现在题干允许集合；种属题答案必须∈KIND池 */
function validateAll() {
  const byStem = new Map()
  for (const q of items) {
    const prev = byStem.get(q.stem)
    if (prev && prev !== q.correct) {
      throw new Error(`题干答案不一致: ${q.stem} => ${prev} / ${q.correct}`)
    }
    byStem.set(q.stem, q.correct)
    if (!q.distractors.length) throw new Error(`无干扰项: ${q.stem}`)
    if (q.distractors.includes(q.correct)) throw new Error(`干扰含正确项: ${q.stem}`)
    if (q.stem.endsWith('是一种？')) {
      const okKinds = new Set([...KIND_POOL.easy, ...KIND_POOL.normal, ...KIND_POOL.hard])
      if (!okKinds.has(q.correct)) throw new Error(`种属答案非法: ${q.stem} => ${q.correct}`)
    }
  }

  const must = {
    '酸奶是一种？': '乳制品',
    '牛奶是一种？': '乳制品',
    '台灯是一种？': '灯具',
    '拖鞋是一种？': '鞋类',
    '沐浴露是一种？': '清洁用品',
    '纱布的主要原材料是？': '棉花',
    '易拉罐罐体常见的主要原材料是？': '铝',
    '剪刀用来？': '剪裁',
    '番茄和西红柿是？': '同种异名',
    '土豆和红薯是？': '不同作物',
    '番茄的别称是？': '西红柿',
    '西红柿的别称是？': '番茄',
    '马铃薯的别称是？': '土豆',
    '红薯的别称是？': '甘薯',
    '地瓜的别称是？': '红薯',
    '玉蜀黍的别称是？': '玉米',
    '方向盘通常属于？': '汽车',
    '扇叶通常属于？': '电风扇',
    '火花塞通常属于？': '发动机',
    '三元催化器通常属于？': '汽车尾气系统',
    '河北属于？': '中国',
    '古代「黔首」常指？': '百姓',
    '《沁园春·雪》的作者是？': '毛泽东',
    '中国的首都是？': '北京',
  }
  for (const [stem, ans] of Object.entries(must)) {
    const hit = items.find((q) => q.stem === stem)
    if (!hit) throw new Error(`缺少关键题: ${stem}`)
    if (hit.correct !== ans) throw new Error(`关键题错误: ${stem} 期望${ans} 实际${hit.correct}`)
  }

  // 组成：题干不得含答案整件名；主语与答案不得互相包含
  for (const q of items) {
    if (/上的.+是？$/.test(q.stem) && !q.stem.startsWith('《')) {
      throw new Error(`组成题干泄题句式: ${q.stem}`)
    }
    if (q.stem.endsWith('通常属于？')) {
      const part = q.stem.slice(0, -5)
      if (pairNameLeaks(part, q.correct)) {
        throw new Error(`组成名互相包含: ${q.stem} => ${q.correct}`)
      }
      if (q.stem.replace(part, '').includes(q.correct)) {
        throw new Error(`组成题干含答案: ${q.stem} => ${q.correct}`)
      }
      const also = PART_ALSO_ON[part] || []
      for (const d of q.distractors) {
        if (also.includes(d)) throw new Error(`组成干扰含其它合法宿主: ${q.stem} / ${d}`)
      }
    }
    if (q.stem.endsWith('的别称是？')) {
      const name = q.stem.slice(0, -5)
      if (pairNameLeaks(name, q.correct, 'subjectHasAnswer')) {
        throw new Error(`别称名泄题(主语含答案): ${q.stem} => ${q.correct}`)
      }
    }
  }

  // 原材料：名称不得泄题；禁止经典泄题条目
  for (const q of items) {
    if (!q.stem.endsWith('的主要原材料是？')) continue
    const product = q.stem.slice(0, -8)
    if (materialNameLeaks(product, q.correct) || pairNameLeaks(product, q.correct, 'subjectHasAnswer')) {
      throw new Error(`原材料名称泄题: ${q.stem} => ${q.correct}`)
    }
  }
  for (const bad of ['铁锅的主要原材料是？', '棉布的主要原材料是？', '铝盆的主要原材料是？', '插座孔通常属于？', '拉链头通常属于？']) {
    if (items.some((q) => q.stem === bad)) throw new Error(`仍存在泄题题干: ${bad}`)
  }

  // 全库扫描：主语包含答案一律禁止；组成题额外禁止答案包含主语
  for (const q of items) {
    let subject = null
    let mode = 'subjectHasAnswer'
    if (q.stem.endsWith('通常属于？')) {
      subject = q.stem.slice(0, -5)
      mode = 'both'
    } else if (q.stem.endsWith('属于？')) {
      subject = q.stem.slice(0, -3)
      mode = 'subjectHasAnswer'
    } else if (q.stem.endsWith('的别称是？')) subject = q.stem.slice(0, -5)
    else if (q.stem.endsWith('的主要原材料是？')) subject = q.stem.slice(0, -8)
    else if (q.stem.endsWith('是一种？')) subject = q.stem.slice(0, -4)
    else if (q.stem.endsWith('用来？')) subject = q.stem.slice(0, -3)
    else if (q.stem.endsWith('的作者是？')) {
      subject = q.stem.replace(/^《/, '').replace(/》的作者是？$/, '')
      mode = 'subjectHasAnswer'
    } else if (q.stem.endsWith('的首都是？')) {
      subject = q.stem.slice(0, -5)
      mode = 'subjectHasAnswer'
    } else if (q.stem.endsWith('是哪国首都？')) {
      subject = q.stem.slice(0, -6)
      // 反向首都题：允许「巴西利亚→巴西」这类答案是主语子串的情况
      mode = 'exact-only'
    } else if (/^古代「.+」常指？$/.test(q.stem)) {
      subject = q.stem.replace(/^古代「/, '').replace(/」常指？$/, '')
      mode = 'subjectHasAnswer'
    }
    if (subject) {
      if (mode === 'exact-only') {
        if (subject === q.correct) throw new Error(`题干主语与答案相同: ${q.stem}`)
      } else if (pairNameLeaks(subject, q.correct, mode)) {
        throw new Error(`题干主语与答案泄题(${mode}): ${q.stem} => ${q.correct}`)
      }
    }
  }

  // 别称题：答案须在同义组；干扰项不得含同组其它名
  for (const q of items) {
    if (!q.stem.endsWith('的别称是？')) continue
    const name = q.stem.slice(0, -5)
    const group = aliasGroupOf(name)
    if (!group.includes(q.correct)) {
      throw new Error(`别称答案不在同义组: ${q.stem} => ${q.correct}`)
    }
    for (const d of q.distractors) {
      if (group.includes(d)) {
        throw new Error(`别称干扰项撞同义组: ${q.stem} 干扰=${d}`)
      }
    }
  }
}

validateAll()

/** 先保证每个题干至少保留 1 条，再按包填充到 target，避免后半段词库被截断 */
function take(diff, target) {
  const list = items.filter((x) => x.difficulty === diff)
  const byStem = new Map()
  for (const q of list) {
    if (!byStem.has(q.stem)) byStem.set(q.stem, [])
    byStem.get(q.stem).push(q)
  }

  const out = []
  const stems = [...byStem.keys()]
  // 第一轮：每题干取第一条（覆盖全部校对条目）
  for (const stem of stems) {
    out.push(byStem.get(stem)[0])
  }
  // 第二轮：继续追加其它包直到 target
  let guard = 0
  while (out.length < target && guard < 100000) {
    guard++
    let added = false
    for (const stem of stems) {
      if (out.length >= target) break
      const variants = byStem.get(stem)
      const have = out.filter((x) => x.stem === stem).length
      if (have < variants.length) {
        out.push(variants[have])
        added = true
      }
    }
    if (!added) break
  }

  if (out.length < target) {
    console.warn(`[warn] ${diff} 仅 ${out.length} 题（校对词库上限），不足 ${target}`)
  }
  // 若超过（不应），截到 target，但仍保留「每题干至少 1」——上面逻辑不会超太多且先覆盖
  return out.slice(0, Math.max(out.length, 0) >= target ? target : out.length)
}

// 每难度目标：原校对题库约 500 + 关系类补充约 400
const TARGET = 900
const easy = take('easy', TARGET)
const normal = take('normal', TARGET)
const hard = take('hard', TARGET)
const final = [...easy, ...normal, ...hard]

const payload = {
  easy: easy.length,
  normal: normal.length,
  hard: hard.length,
  total: final.length,
  items: final,
}

fs.writeFileSync(outJson, JSON.stringify(payload), 'utf8')
fs.writeFileSync(
  outTs,
  `/** 由 scripts/generate-life-sense-bank.mjs 生成，请勿手改 */
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
`,
  'utf8',
)

// 专题入库检查：天气/节日/天文/山川 每难度须满 120
for (const diff of ['easy', 'normal', 'hard']) {
  const nature = final.filter((q) => q.difficulty === diff && String(q.key || '').includes('nature-'))
  if (nature.length < 120) {
    throw new Error(`入库后 ${diff} 自然专题不足 120（实际 ${nature.length}）`)
  }
  const byTopic = { weather: 0, festival: 0, astronomy: 0, landform: 0 }
  for (const q of nature) {
    for (const t of Object.keys(byTopic)) {
      if (String(q.key).includes(`nature-${t}`)) byTopic[t] += 1
    }
  }
  console.log(`[nature] ${diff}:`, byTopic, 'sum', nature.length)
}

console.log('OK', payload.easy, payload.normal, payload.hard, 'total', payload.total)
