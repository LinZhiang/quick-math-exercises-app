/** 全量校对生活常识题库：node scripts/audit-life-sense-bank.mjs */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/utils/lifeSenseBank.generated.json'), 'utf8'),
)
const items = raw.items
const errors = []
const warnings = []

function err(msg, q) {
  errors.push(q ? `${msg} | ${q.difficulty} | ${q.stem} => ${q.correct}` : msg)
}
function warn(msg, q) {
  warnings.push(q ? `${msg} | ${q.difficulty} | ${q.stem} => ${q.correct}` : msg)
}

const MUST_KIND = {
  大米: '粮食',
  小麦: '粮食',
  玉米粒: '粮食',
  小米: '粮食',
  面粉: '粮食加工品',
  挂面: '粮食加工品',
  馒头: '粮食加工品',
  土豆: '薯类',
  红薯: '薯类',
  西红柿: '蔬果',
  黄瓜: '蔬果',
  白菜: '蔬果',
  萝卜: '蔬果',
  茄子: '蔬果',
  苹果: '水果',
  香蕉: '水果',
  橙子: '水果',
  梨: '水果',
  葡萄: '水果',
  牛奶: '乳制品',
  酸奶: '乳制品',
  奶酪: '乳制品',
  奶粉: '乳制品',
  鸡蛋: '禽蛋',
  鸭蛋: '禽蛋',
  猪肉: '肉类',
  牛肉: '肉类',
  鸡肉: '肉类',
  羊肉: '肉类',
  花生油: '植物油',
  酱油: '调味品',
  醋: '调味品',
  食盐: '调味品',
  味精: '调味品',
  白糖: '甜味料',
  红糖: '甜味料',
  茶叶: '饮料原料',
  咖啡豆: '饮料原料',
  牙膏: '清洁用品',
  肥皂: '清洁用品',
  沐浴露: '清洁用品',
  洗发水: '清洁用品',
  洗衣液: '清洁用品',
  毛巾: '日用品',
  抹布: '日用品',
  拖鞋: '鞋类',
  运动鞋: '鞋类',
  台灯: '灯具',
  灯泡: '灯具',
  书包: '箱包',
  手提包: '箱包',
  矿泉水: '饮料',
  汽水: '饮料',
  鹌鹑蛋: '禽蛋',
  羊奶: '乳制品',
  黄油: '乳制品',
  蜂蜜: '蜂产品',
  紫菜: '藻类',
  香菇: '菌类',
  木耳: '菌类',
  绿豆: '豆类',
  花生: '油料作物',
  芝麻: '油料作物',
  白酒: '蒸馏酒',
  啤酒: '发酵酒',
  豆腐: '豆制品',
  粉丝: '淀粉制品',
  年糕: '米制品',
  燕麦: '谷物',
  荞麦: '谷物',
  猪油: '动物油脂',
  菜籽油: '植物油',
  山茶油: '植物油',
  番茄: '蔬果',
  马铃薯: '薯类',
  甘薯: '薯类',
  芋头: '薯芋类',
  魔芋: '薯芋类',
  银耳: '菌类',
  海带: '藻类',
  椰子油: '植物油',
  亚麻籽油: '植物油',
  腐乳: '豆制品',
  豆豉: '豆制品',
  皮蛋: '蛋制品',
  咸鸭蛋: '蛋制品',
  午餐肉: '肉制品',
  火腿肠: '肉制品',
  方便面: '粮食加工品',
  芝麻酱: '调味品',
  蚝油: '调味品',
  海苔: '藻类',
  虾皮: '水产干货',
  墨鱼干: '水产干货',
}

const MUST_MAT = {
  纱布: '棉花',
  易拉罐罐体常见: '铝',
  家用蜡烛: '石蜡',
  自行车内胎: '橡胶',
  奶酪: '牛奶',
  黄油: '牛奶',
  豆浆: '大豆',
  面粉: '小麦',
  大米: '稻谷',
  超市保鲜膜常见塑料: '聚乙烯',
  家装给水管常见塑料: '聚氯乙烯',
  '橄榄油主要来自': '油橄榄',
  电源线芯常见: '铜',
  冲锋衣化纤面常见: '涤纶',
  雨伞伞面化纤常见: '尼龙',
  标称304的餐具材质: '不锈钢',
}

const FORBIDDEN_MAT_STEMS = [
  '铁锅的主要原材料是？',
  '棉布的主要原材料是？',
  '铝盆的主要原材料是？',
  '玻璃杯的主要原材料是？',
  '木椅的主要原材料是？',
  '塑料瓶的主要原材料是？',
]

const MUST_USE = {
  剪刀: '剪裁',
  锤子: '敲打',
  勺子: '舀取',
  雨伞: '遮雨',
  牙刷: '刷牙',
  扫帚: '扫地',
  拖把: '拖地',
  钥匙: '开锁',
  尺子: '量长度',
  钟表: '计时',
  扳手: '拧螺母',
  螺丝刀: '拧螺丝',
  锯子: '锯切',
  水平尺: '测水平',
  打气筒: '充气',
  线坠: '找垂直',
  万用表: '测电参数',
  卡尺: '测尺寸',
  开瓶器: '启瓶盖',
  开罐器: '开启罐头',
  削皮刀: '去果皮',
}

const MUST_PART = {
  '方向盘通常属于？': '汽车',
  '车把通常属于？': '自行车',
  '镜片通常属于？': '眼镜',
  '笔芯通常属于？': '圆珠笔',
  '扇叶通常属于？': '电风扇',
  '鞋带通常属于？': '运动鞋',
  '火花塞通常属于？': '发动机',
  '硒鼓通常属于？': '激光打印机',
    '三元催化器通常属于？': '汽车',
    '安全带通常属于？': '汽车',
    '雨刮器通常属于？': '汽车',
    '铅芯通常属于？': '自动铅笔',
  }

const PART_ALSO_ON = {
  灯罩: ['台灯', '落地灯', '吊灯'],
  插头: ['电源线', '充电器', '排插'],
  滤芯: ['净水器', '空气净化器', '烟机'],
  密封圈: ['压力锅', '水龙头', '保温杯'],
  刀刃: ['菜刀', '水果刀', '剪刀'],
  表盘: ['手表', '闹钟', '仪表'],
  压缩机: ['空调', '冰箱', '冷柜'],
  蒸发器: ['空调', '冰箱'],
  冷凝器: ['空调', '冰箱'],
  温控器: ['电热水器', '空调', '冰箱', '电饭煲'],
}

const MUST_ALIAS = {
  '番茄和西红柿是？': '同种异名',
  '马铃薯和土豆是？': '同种异名',
  '蕃茄和西红柿是？': '同种异名',
  '红薯和甘薯是？': '同种异名',
  '花生和落花生是？': '同种异名',
  '土豆和红薯是？': '不同作物',
  '黄瓜和丝瓜是？': '不同作物',
  '花生和核桃是？': '不同作物',
  '大米和小米是？': '不同作物',
  '玉米和高粱是？': '不同作物',
  '番茄和茄子是？': '不同作物',
  '黄豆和绿豆是？': '不同作物',
}

/** 别称：题干名 → 唯一正确答案；同组其它词不得入干扰项 */
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

const MUST_NICK = {
  番茄: '西红柿',
  西红柿: '番茄',
  马铃薯: '土豆',
  土豆: '马铃薯',
  自行车: '脚踏车',
  脚踏车: '自行车',
  肥皂: '胰子',
  胰子: '肥皂',
  红薯: '甘薯',
  甘薯: '红薯',
  花生: '落花生',
  苞米: '玉米',
  包谷: '玉米',
  黄豆: '大豆',
  大豆: '黄豆',
  卷心菜: '包菜',
  包菜: '卷心菜',
  火柴: '洋火',
  洋火: '火柴',
  蕃茄: '番茄',
  洋芋: '马铃薯',
  山药蛋: '马铃薯',
  番薯: '红薯',
  地瓜: '红薯',
  玉蜀黍: '玉米',
  圆白菜: '卷心菜',
}

function aliasGroupOf(name) {
  return ALIAS_GROUPS.find((g) => g.includes(name)) || [name]
}

function pairNameLeaks(subject, answer, mode = 'both') {
  const a = String(subject || '').trim()
  const b = String(answer || '').trim()
  if (!a || !b) return true
  if (a === b) return true
  if (a.includes(b)) return true
  if (mode === 'both' && b.includes(a)) return true
  return false
}

const stemAnswer = new Map()
const counts = { easy: 0, normal: 0, hard: 0 }

for (const q of items) {
  counts[q.difficulty] = (counts[q.difficulty] || 0) + 1

  if (!q.stem?.trim() || !q.correct?.trim()) err('空题干或空答案', q)
  if (!Array.isArray(q.distractors) || q.distractors.length < 2) err('干扰项不足2个', q)
  if (q.distractors.some((d) => !String(d).trim())) err('存在空干扰项', q)
  if (q.distractors.includes(q.correct)) err('干扰项含正确答案', q)
  if (new Set(q.distractors).size !== q.distractors.length) warn('干扰项内部重复', q)
  if (!q.explanation || q.explanation.length < 12) warn('解析过短', q)

  const prev = stemAnswer.get(q.stem)
  if (prev && prev !== q.correct) err(`同题干答案冲突(曾=${prev})`, q)
  stemAnswer.set(q.stem, q.correct)

  let subject = null
  let mode = 'subjectHasAnswer'
  if (q.stem.endsWith('通常属于？')) {
    subject = q.stem.slice(0, -5)
    mode = 'both'
  } else if (q.stem.endsWith('的别称是？')) subject = q.stem.slice(0, -5)
  else if (q.stem.endsWith('的主要原材料是？')) subject = q.stem.slice(0, -8)
  else if (q.stem.endsWith('是一种？')) subject = q.stem.slice(0, -4)
  else if (q.stem.endsWith('用来？')) subject = q.stem.slice(0, -3)
  if (subject && pairNameLeaks(subject, q.correct, mode)) err('题干主语与答案泄题', q)

  if (MUST_ALIAS[q.stem] && MUST_ALIAS[q.stem] !== q.correct) {
    err(`别名题错误(期望${MUST_ALIAS[q.stem]})`, q)
  }

  if (q.stem.endsWith('的别称是？')) {
    const name = q.stem.slice(0, -5)
    const group = aliasGroupOf(name)
    if (MUST_NICK[name] && MUST_NICK[name] !== q.correct) {
      err(`别称答案错误(期望${MUST_NICK[name]})`, q)
    }
    if (!group.includes(q.correct)) err('别称答案不在同义组', q)
    for (const d of q.distractors) {
      if (group.includes(d)) err(`别称干扰撞同义组(${d})`, q)
    }
  }

  if (q.stem.endsWith('是一种？')) {
    const name = q.stem.slice(0, -4)
    if (MUST_KIND[name] && MUST_KIND[name] !== q.correct) {
      err(`种属答案错误(期望${MUST_KIND[name]})`, q)
    }
    if (/的一部分$/.test(q.correct)) err('种属题答案却是组成部分', q)
  } else if (q.stem.endsWith('的主要原材料是？')) {
    const name = q.stem.slice(0, -8)
    if (MUST_MAT[name] && MUST_MAT[name] !== q.correct) {
      err(`原材料答案错误(期望${MUST_MAT[name]})`, q)
    }
    // 名称含原料字样 = 泄题
    if (name.includes(q.correct)) err('原材料题名称泄题', q)
  } else if (q.stem.endsWith('用来？')) {
    const name = q.stem.slice(0, -3)
    if (MUST_USE[name] && MUST_USE[name] !== q.correct) {
      err(`用途答案错误(期望${MUST_USE[name]})`, q)
    }
  } else if (q.stem.endsWith('的别称是？')) {
    // 已在上方校验
  } else if (q.stem.endsWith('通常属于？')) {
    if (MUST_PART[q.stem] && MUST_PART[q.stem] !== q.correct) {
      err(`组成答案错误(期望${MUST_PART[q.stem]})`, q)
    }
    const part = q.stem.slice(0, -5)
    if (pairNameLeaks(part, q.correct)) err('组成题干主语与答案互相包含', q)
    for (const d of q.distractors) {
      if ((PART_ALSO_ON[part] || []).includes(d)) err(`组成干扰含其它合法宿主(${d})`, q)
    }
  } else if (q.stem.includes('上的') && q.correct.endsWith('的一部分')) {
    err('组成题干泄题句式(整件上的部件)', q)
  } else if (q.stem.endsWith('是？') && !q.stem.includes('和') && q.correct.endsWith('的一部分')) {
    err('组成题干过宽或旧格式', q)
  }

  // 难度分层：工业加工/合成材料 → 难题；日常简单构成 → 简单题
  const MAT_SHOULD_HARD = new Set([
    '涤纶',
    '尼龙',
    '腈纶',
    '氨纶',
    '聚乙烯',
    '聚氯乙烯',
    '聚四氟乙烯',
    '聚苯乙烯',
    'ABS塑料',
    'PP塑料',
    '亚克力',
    '碳纤维',
    '聚氨酯',
    'EPDM橡胶',
    '玻璃钢',
    '铝合金',
    '不锈钢',
    '钛合金',
    '镁合金',
    '硬质合金',
    '锡',
    '铅',
    '岩棉',
    '沥青',
  ])
  const MAT_SHOULD_EASY = new Set([
    '棉花',
    '羽绒',
    '铝',
    '石蜡',
    '橡胶',
    '皮革',
    '牛奶',
    '大豆',
    '小麦',
    '稻谷',
    '瓷土',
    '陶土',
    '玻璃',
    '木材',
    '竹子',
    '砖',
    '纸',
    '纸板',
    '草',
    '铜',
    '油橄榄',
    '葵花籽',
  ])
  const KIND_SHOULD_NOT_HARD = new Set([
    '番茄',
    '马铃薯',
    '甘薯',
    '西红柿',
    '土豆',
    '红薯',
    '大米',
    '苹果',
    '牛奶',
    '黄瓜',
    '鸡蛋',
    '牙膏',
  ])
  const KIND_SHOULD_NOT_EASY = new Set(['腐乳', '皮蛋', '午餐肉', '虾皮', '蚝油', '墨鱼干'])

  // 专业术语 / 超纲：不属于「生活常识」面向范围
  const SCOPE_FORBIDDEN = [
    /CAPE|位势高度|水汽通量|相当位温|锋生作用|切变线|冷垫|气旋性曲率|抬升凝结|大气可降水|中尺度对流|K指数|干湿球温度表/,
    /伪谷物|动物胶|植物胶|光栅盘|热电偶|换向器|衔铁|膨胀阀|氧传感器|节气门通常属于/,
    /汽车尾气系统|发动机控制系统|进气系统|有刷电机|测温装置|编码器|止回阀/,
    /赫罗图|拉格朗日点|洛希极限|奥尔特云|太阳中微子|宇宙微波背景/,
  ]
  if (q.stem.endsWith('的主要原材料是？')) {
    if (q.difficulty === 'easy' && MAT_SHOULD_HARD.has(q.correct)) {
      err('工业/合成材料不应落在简单题', q)
    }
    if (q.difficulty === 'hard' && MAT_SHOULD_EASY.has(q.correct)) {
      err('日常简单材料不应落在难题', q)
    }
  }
  if (q.stem.endsWith('是一种？')) {
    const name = q.stem.slice(0, -4)
    if (q.difficulty === 'hard' && KIND_SHOULD_NOT_HARD.has(name)) {
      err('日常种属题不应落在难题', q)
    }
    if (q.difficulty === 'easy' && KIND_SHOULD_NOT_EASY.has(name)) {
      err('偏细分种属题不应落在简单题', q)
    }
  }

  for (const re of SCOPE_FORBIDDEN) {
    if (re.test(q.stem) || re.test(q.correct) || re.test(String(q.key || ''))) {
      err('超出生活常识面向范围（专业/冷门术语）', q)
      break
    }
  }

  // 语义荒谬
  const absurdPairs = [
    [/酸奶|牛奶|奶酪|奶粉|羊奶|黄油/, /灯具|鞋类|箱包|清洁用品|刀具|木材|玻璃/],
    [/台灯|灯泡/, /乳制品|肉类|粮食|水果|鞋类/],
    [/拖鞋|运动鞋/, /乳制品|灯具|饮料|肉类/],
    [/剪刀|锤子|扳手/, /乳制品|粮食|水果|灯具/],
    [/棉布|羊毛衫|丝巾/, /乳制品|肉类|灯具|鞋类/],
  ]
  for (const [nameRe, badAns] of absurdPairs) {
    if (nameRe.test(q.stem) && badAns.test(q.correct)) err('语义荒谬配对', q)
  }

  // 可选组装仿真：3/4/5 选项时答案必须仍在选项中
  for (const optCount of [3, 4, 5]) {
    const need = optCount - 1
    const d = q.distractors.slice(0, need)
    if (d.length < need) warn(`干扰不足以支撑${optCount}选项`, q)
    const options = [q.correct, ...d]
    if (!options.includes(q.correct)) err('组装后无正确答案', q)
  }
}

// 覆盖率：关键词必须出现
for (const name of Object.keys(MUST_KIND)) {
  const stem = `${name}是一种？`
  if (![...stemAnswer.keys()].includes(stem)) warn(`种属题缺失: ${stem}`)
}
for (const [stem, ans] of Object.entries(MUST_PART)) {
  if (stemAnswer.get(stem) !== ans) err(`组成题缺失或错误: ${stem}`)
}
for (const bad of [...FORBIDDEN_MAT_STEMS, '插座孔通常属于？', '拉链头通常属于？', '涡轮通常属于？', '落花生的别称是？']) {
  if (stemAnswer.has(bad)) err(`仍存在泄题题干: ${bad}`)
}
for (const [stem, ans] of Object.entries(MUST_ALIAS)) {
  if (stemAnswer.get(stem) !== ans) err(`别名题缺失或错误: ${stem}`)
}
for (const [name, ans] of Object.entries(MUST_NICK)) {
  const stem = `${name}的别称是？`
  if (stemAnswer.get(stem) !== ans) err(`别称题缺失或错误: ${stem}`)
}

const report = {
  counts,
  uniqueStems: stemAnswer.size,
  errorCount: errors.length,
  warningCount: warnings.length,
  errors,
  warnings: warnings.slice(0, 100),
}

// 天气/节日/天文/山川专题：每难度至少 120
{
  const natureCounts = { easy: 0, normal: 0, hard: 0 }
  const topicCounts = {
    easy: { weather: 0, festival: 0, astronomy: 0, landform: 0 },
    normal: { weather: 0, festival: 0, astronomy: 0, landform: 0 },
    hard: { weather: 0, festival: 0, astronomy: 0, landform: 0 },
  }
  for (const q of items) {
    const k = String(q.key || '')
    if (!k.includes('nature-')) continue
    natureCounts[q.difficulty] = (natureCounts[q.difficulty] || 0) + 1
    for (const t of ['weather', 'festival', 'astronomy', 'landform']) {
      if (k.includes(`nature-${t}`)) topicCounts[q.difficulty][t] += 1
    }
  }
  for (const diff of ['easy', 'normal', 'hard']) {
    if (natureCounts[diff] < 120) {
      err(`自然专题 ${diff} 不足120（${natureCounts[diff]}）`)
    }
    for (const t of ['weather', 'festival', 'astronomy', 'landform']) {
      if (topicCounts[diff][t] < 30) {
        err(`自然专题 ${diff}/${t} 不足30（${topicCounts[diff][t]}）`)
      }
    }
  }
  report.natureCounts = natureCounts
  report.natureTopicCounts = topicCounts
}

fs.writeFileSync(
  path.join(__dirname, 'life-sense-audit-report.json'),
  JSON.stringify(report, null, 2),
  'utf8',
)

console.log(JSON.stringify({ counts, uniqueStems: stemAnswer.size, errorCount: errors.length, warningCount: warnings.length }, null, 2))
if (errors.length) {
  console.log('--- ERRORS ---')
  console.log(errors.slice(0, 50).join('\n'))
  process.exitCode = 1
} else {
  console.log('ALL CHECKS PASSED')
}
if (warnings.length) {
  console.log('--- WARNINGS (first 30) ---')
  console.log(warnings.slice(0, 30).join('\n'))
}
