/**
 * 生成汉字规律本地题库（恰好 500 题）——属性表驱动 + 配额均衡 + 全量校验
 * 用法: node scripts/generate-hanzi-pattern-bank.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../src/utils/hanziPatternBank.ts')
const FW = '\u3000'

// ═══════════════════ 可核验属性（只用有把握的常用字）═══════════════════

/** 规范简体笔画数 */
const STROKE = {
  一: 1, 乙: 1,
  二: 2, 十: 2, 丁: 2, 七: 2, 八: 2, 人: 2, 入: 2, 儿: 2, 九: 2, 几: 2, 了: 2, 力: 2, 刀: 2, 又: 2,
  三: 3, 干: 3, 于: 3, 下: 3, 土: 3, 士: 3, 工: 3, 才: 3, 寸: 3, 大: 3, 丈: 3, 与: 3, 万: 3,
  上: 3, 小: 3, 口: 3, 山: 3, 巾: 3, 千: 3, 乞: 3, 川: 3, 女: 3, 子: 3, 也: 3, 飞: 3, 个: 3,
  久: 3, 么: 3, 义: 3, 之: 3, 已: 3, 弓: 3, 丸: 3, 及: 3, 勺: 3, 丫: 3, 彡: 3,
  王: 4, 天: 4, 夫: 4, 井: 4, 开: 4, 木: 4, 不: 4, 太: 4, 犬: 4, 日: 4, 曰: 4, 中: 4, 水: 4,
  月: 4, 火: 4, 文: 4, 方: 4, 心: 4, 手: 4, 毛: 4, 牛: 4, 午: 4, 牙: 4, 五: 4, 互: 4,
  切: 4, 分: 4, 公: 4, 六: 4, 化: 4, 区: 4, 匹: 4, 升: 4, 友: 4, 反: 4, 双: 4, 少: 4,
  尺: 4, 引: 4, 丑: 4, 巴: 4, 办: 4, 书: 4, 丰: 4, 韦: 4, 云: 4, 元: 4, 无: 4, 匀: 4,
  勾: 4, 勿: 4, 风: 4, 认: 4, 巨: 4, 厅: 4, 历: 4, 屯: 4, 支: 4, 为: 4, 匕: 2,
  正: 5, 甘: 5, 生: 5, 用: 5, 古: 5, 可: 5, 右: 5, 石: 5, 本: 5, 术: 5, 未: 5, 末: 5,
  甲: 5, 申: 5, 电: 5, 田: 5, 由: 5, 白: 5, 皮: 5, 目: 5, 且: 5, 去: 5, 失: 5, 禾: 5,
  丘: 5, 代: 5, 他: 5, 令: 5, 以: 5, 加: 5, 包: 5, 北: 5, 半: 5, 占: 5, 卡: 5, 外: 5,
  处: 5, 冬: 5, 鸟: 5, 龙: 5, 四: 5, 平: 5, 打: 5, 立: 5, 主: 5, 市: 5, 布: 5, 必: 5,
  永: 5, 出: 5, 记: 5, 句: 5, 司: 5, 玉: 5, 东: 5, 灭: 5,
  合: 6, 同: 6, 名: 6, 各: 6, 安: 6, 字: 6, 守: 6, 宅: 6, 红: 6, 纤: 6, 约: 6, 级: 6,
  军: 6, 农: 6, 冰: 6, 决: 6, 光: 6, 先: 6, 共: 6, 色: 6, 朱: 6, 回: 6, 因: 6, 团: 6,
  在: 6, 地: 6, 多: 6, 成: 6, 年: 6, 早: 6, 有: 6, 伍: 6, 休: 6, 伙: 6, 优: 6, 伐: 6,
  件: 6, 任: 6, 伤: 6, 仰: 6, 仿: 6, 企: 6, 米: 6, 羊: 6, 羽: 6, 考: 6, 老: 6, 耳: 6,
  自: 6, 至: 6, 压: 6, 庆: 6, 问: 6, 闭: 6, 闯: 6, 讲: 6, 论: 6, 江: 6, 扫: 6, 她: 6,
  好: 6, 妈: 6, 传: 6, 伟: 6, 圭: 6, 吕: 6, 亚: 6, 亘: 6, 兆: 6, 并: 6, 关: 6, 夹: 6,
  州: 6, 西: 6, 如: 6, 向: 6, 尖: 6, 尘: 6, 廷: 6, 延: 6, 吸: 6, // 口+及=6（勿误作 7）
  我: 7, 找: 7, 身: 7, 走: 7, 来: 7, 求: 7, 更: 7, 束: 7, 里: 7, 困: 7, 园: 7, 围: 7,
  近: 7, 返: 7, 这: 7, 别: 7, 利: 7, 否: 7, 位: 7, 住: 7, 体: 7, 何: 7, 作: 7, 你: 7,
  弟: 7, 完: 7, 宋: 7, 宏: 7, 牢: 7, 良: 7, 把: 7, 报: 7, 护: 7, 折: 7, 批: 7, 抓: 7,
  投: 7, 抗: 7, 吧: 7, 村: 7, 杜: 7, 材: 7, 时: 7, 旱: 7, 针: 7, 听: 7, 吹: 7,
  床: 7, 序: 7, 库: 7, 应: 7, 闲: 7, 间: 7, 闷: 7, 还: 7, 进: 7, 远: 7, 医: 7, 局: 7,
  忘: 7, 志: 7, 花: 7, 芽: 7, 码: 8, 矿: 8, 连: 7, 串: 7, 评: 7, 诉: 7, 识: 7, 词: 7,
  伸: 7, 伴: 7, 低: 7, 估: 7, 但: 7, 似: 7, 肖: 7, 芈: 7, 肚: 7, 李: 7, 坚: 7, 坐: 7,
  国: 8, 固: 8, 图: 8, 周: 8, 金: 8, 命: 8, 念: 8, 贪: 8, 青: 8, 表: 8, 事: 8, 雨: 8,
  和: 8, 知: 8, 的: 8, 到: 8, 使: 8, 例: 8, 供: 8, 依: 8, 佳: 8, 林: 8, 卧: 8, 朋: 8,
  服: 8, 河: 8, 油: 8, 泪: 8, 波: 8, 浅: 8, 拉: 8, 姐: 8, 妹: 8, 姑: 8, 话: 8, 试: 8,
  详: 8, 该: 8, 昌: 8, 炎: 8, 非: 8, 建: 8, 底: 8, 店: 8, 庙: 8, 府: 8, 闸: 8, 闹: 8,
  忠: 8, 态: 8, 英: 8, 苗: 8, 苦: 8, 若: 8, 茂: 8, 枝: 8, 松: 8, 柜: 8, 钢: 9, 钟: 9,
  呼: 8, 易: 8, 昔: 8, 昏: 8, 旺: 8, 或: 8, 武: 8, 乖: 8, 律: 9, 春: 9,
  春: 9, 是: 9, 看: 9, 星: 9, 音: 9, 美: 9, 前: 9, 南: 9, 面: 9, 香: 9, 复: 9, 段: 9,
  便: 9, 修: 9, 保: 9, 促: 9, 思: 9, 急: 9, 草: 9, 茶: 9, 架: 9, 染: 9, 柔: 9, 省: 9,
  冒: 9, 庭: 9, 厚: 9, 度: 9, 说: 9, 语: 9, 指: 9, 挥: 9, 按: 9, 持: 9, 洗: 9, 树: 9,
  柏: 9, 柳: 9, 昨: 9, 研: 9, 砍: 9, 砖: 9, 城: 9, 胜: 9, 怨: 9, 怒: 9, 逃: 9, 追: 9,
  退: 9, 栏: 9, 品: 9, 贵: 9,
  家: 10, 宽: 10, 宾: 10, 宰: 10, 高: 10, 离: 10, 凉: 10, 资: 10, 案: 10, 桌: 10,
  根: 10, 格: 10, 桃: 10, 海: 10, 酒: 10, 恩: 10, 息: 10, 荷: 10, 铁: 10, 钱: 10,
  破: 10, 础: 10, 埋: 10, 烧: 10, 热: 10, 烟: 10, 烦: 10, 恐: 10, 悔: 10, 悟: 10,
  逢: 10, 晓: 10, 娘: 10, 课: 10, 调: 10, 谁: 10, 请: 10, 读: 10, 笔: 10,
  清: 11, 深: 11, 菜: 11, 银: 11, 铜: 11, 推: 11, 晚: 11, 晨: 11, 您: 11, 惜: 11,
  基: 11, 培: 11, 菊: 11, 梨: 11, 符: 11, 唱: 11, 箱: 15, 爽: 11, 想: 13, 湖: 12,
  游: 12, 温: 12, 湿: 12, 提: 12, 晴: 12, 硬: 12, 确: 12, 期: 12, 朝: 12, 道: 12,
  愉: 12, 感: 13, 晶: 12, 器: 16, 磊: 15, 鑫: 24, 檀: 17, 森: 12, 镜: 16, 错: 13,
  销: 12, 锁: 12, 锐: 12, 碎: 13, 碰: 13, 满: 13, 蓝: 13, 简: 13, 磁: 14, 壁: 16,
}

/** 笔画交叉数（仅收录已核验字） */
const CROSS = {
  一: 0, 二: 0, 三: 0, 川: 0, 八: 0, 小: 0, 人: 0, 入: 0, 儿: 0, 了: 0, 丫: 0, 彡: 0, 乙: 0,
  十: 1, 七: 1, 九: 1, 力: 1, 刀: 1, 丈: 1, 才: 1, 干: 1, 于: 1, 午: 1, 牛: 1, 支: 1, 友: 1, 大: 1, 又: 1,
  井: 2, 开: 2, 丰: 2, 韦: 2, 并: 2, 关: 2, 屯: 2, 邦: 2, 升: 2,
  未: 3, 末: 3, 朱: 3, 束: 3, 连: 3, 来: 3,
  米: 4, 夹: 4, 爽: 4,
}

/**
 * 封闭区域（空洞拓扑；田=2 按小学找规律常见计法）
 * 口=1 日=1 中=1 回=2 目=3 王=0 五=0；
 * 经典累加改用 木→日→昌→晶（0→1→2→3），不再用错误的「五=1/把=2」。
 */
const ENCLOSE = {
  一: 0, 乙: 0, 二: 0, 三: 0, 十: 0, 八: 0, 人: 0, 大: 0, 天: 0, 木: 0, 本: 0, 未: 0, 末: 0,
  王: 0, 主: 0, 井: 0, 开: 0, 川: 0, 小: 0, 上: 0, 下: 0, 工: 0, 土: 0, 干: 0, 丰: 0,
  手: 0, 毛: 0, 火: 0, 水: 0, 永: 0, 丈: 0, 才: 0, 夫: 0, 无: 0, 午: 0, 牛: 0, 生: 0,
  失: 0, 禾: 0, 正: 0, 用: 0, 术: 0, 米: 0, 来: 0, 年: 0, 我: 0, 成: 0, 求: 0, 更: 0,
  五: 0,
  口: 1, 中: 1, 古: 1, 右: 1, 石: 1, 可: 1, 后: 1, 甲: 1, 申: 1, 电: 1, 由: 1,
  合: 1, 同: 1, 名: 1, 各: 1, 四: 1, 西: 1, 日: 1, 白: 1, 自: 1, 且: 1,
  把: 1, 图: 1, 园: 1, 困: 1, 国: 1, 吧: 2,
  回: 2, 田: 2, 吕: 2, 固: 2, 昌: 2, 串: 2,
  目: 3, 品: 3, 晶: 3, 磊: 3, 鑫: 3,
  器: 4,
}

/** 不相连部分：开=1 勺=2（勹+点）小=3 心=4；丫/万/勿/匕 笔势连通=1 */
const PARTS = {
  一: 1, 乙: 1, 丁: 1, 七: 1, 十: 1, 干: 1, 土: 1, 王: 1, 开: 1, 井: 1, 天: 1, 夫: 1,
  口: 1, 日: 1, 田: 1, 回: 1, 木: 1, 本: 1, 未: 1, 末: 1, 正: 1, 生: 1, 用: 1, 大: 1, 太: 1,
  中: 1, 甲: 1, 申: 1, 电: 1, 目: 1, 白: 1, 石: 1, 古: 1, 可: 1, 合: 1, 同: 1,
  丫: 1, 万: 1, 勿: 1, 匕: 1, 方: 1, 为: 1,
  勺: 2, 八: 2, 儿: 2, 匀: 2, 勾: 2,
  小: 3, 川: 3, 彡: 3,
  心: 4, 必: 4,
}

const STRUCT = {
  左右结构: [
    '明', '休', '村', '河', '林', '秋', '灯', '伟', '打', '江', '说', '银', '她', '朋', '羽', '双',
    '卧', '低', '住', '依', '估', '推', '提', '扫', '折', '评', '论', '诉', '试', '钟', '错', '销',
    '破', '碰', '砍', '础', '杜', '桃', '柏', '柳', '温', '湿', '满', '酒', '时', '昨', '晚', '晴',
    '根', '枝', '材', '松', '清', '洗', '游', '深', '指', '挥', '按', '持', '好', '妈', '姐', '妹',
    '铜', '铁', '钢', '针', '找', '把', '拉', '批', '他', '们', '作', '何', '但', '任', '伸', '伴',
  ],
  上下结构: [
    '思', '想', '念', '忘', '花', '草', '英', '茶', '字', '安', '守', '宅', '音', '意', '竟', '章',
    '尖', '尘', '肖', '省', '冒', '昌', '星', '晨', '架', '案', '桌', '梨', '符', '答', '策', '筑',
    '菜', '苗', '芽', '苦', '若', '荷', '菊', '苹', '志', '忠', '恩', '息', '态', '急', '怒',
    '圭', '炎', '吕', '品', '简', '箱', '笔', '等', '管', '算', '染', '柔', '李',
  ],
  半包围结构: [
    '同', '周', '风', '问', '闲', '间', '闭', '闯', '压', '厅', '历', '厚', '床', '序', '库', '应',
    '这', '还', '过', '进', '道', '远', '近', '返', '句', '勾', '包', '勿', '司', '可', '局', '医',
    '区', '匹', '巨', '庆', '店', '庙', '府', '度', '逢', '逃', '追', '退', '闷', '闸', '闹',
  ],
  独体结构: [
    '人', '木', '火', '水', '日', '月', '山', '石', '大', '小', '上', '下', '天', '王', '主', '玉',
    '牛', '羊', '马', '鸟', '手', '毛', '爪', '牙', '心', '力', '刀', '弓', '车', '舟', '米', '豆',
    '虫', '鱼', '龙', '飞', '中', '永', '事', '书', '我', '成', '或', '武', '东', '西', '南', '北',
    '年', '来', '求', '更', '面', '重', '兼', '爽', '民', '氏', '气', '长', '正', '生', '用', '本',
  ],
}

/**
 * 左右对称：沿竖直中线左右对折重合（典型：古、山、大）。
 * 上下对称：沿水平中线上下对折重合（典型：巨、目、中）。
 *
 * 硬规则：
 * - 两表互斥。
 * - 「且/凹/凸/皿」是左右对称，绝不是上下对称（上下对折合不上；凹↔凸互为上下翻转）。
 * - 「甲/由」仅左右对称（竖笔下出/上出），绝不是上下对称。
 * - 「禾/永」有撇捺，非轴对称，不进表。
 * - 仅上下、非左右的锚点字：巨/臣/叵（侧向开口）。上下对称题必须至少含其中一字。
 */
const SYM_LR = [
  '古', '山', '大', '木', '非', '米', '小', '八', '天', '夫', '火', '开', '丰', '井',
  '未', '末', '来', '本', '夹', '羊', '半', '平', '辛',
  '林', '羽', '朋', '双',
  '且', '凹', '凸', '皿', '甲', '由',
]
/** 仅上下对称、非左右对称（侧向开口） */
const SYM_UD_ONLY = ['巨', '臣', '叵']
/** 上下对称用字：锚点 + 确为上下对称者；甲/由不得进入 */
const SYM_UD = [...SYM_UD_ONLY, '目', '中', '日', '田', '口', '回', '申', '二', '三', '亚']

{
  const lr = new Set(SYM_LR)
  const ud = new Set(SYM_UD)
  for (const ch of lr) {
    if (ud.has(ch)) throw new Error(`SYM_LR/SYM_UD 互斥破坏：${ch}`)
  }
  for (const ch of SYM_UD_ONLY) {
    if (!ud.has(ch)) throw new Error(`SYM_UD_ONLY 未落入 SYM_UD：${ch}`)
    if (lr.has(ch)) throw new Error(`锚点字不可在 SYM_LR：${ch}`)
  }
}

const CONTAIN = {
  日: ['早', '旱', '旺', '昨', '时', '明', '星', '春', '是', '香', '复', '晴', '晶', '昭', '昌', '易', '昔', '昏', '晓', '檀'],
  月: ['明', '朋', '有', '青', '期', '朝', '胜', '脂', '朗', '肤', '肥', '肯', '肩', '背', '胡', '能', '服', '前'],
  木: ['林', '森', '村', '杜', '桃', '李', '椅', '桌', '柜', '架', '桥', '树', '根', '枝', '材', '松', '柏', '柳', '梅', '棠'],
  氵: ['河', '江', '湖', '海', '清', '洗', '游', '深', '浅', '温', '湿', '满', '酒', '油', '泪', '波', '浪', '洋', '洲', '港'],
  口: ['吗', '呢', '呀', '吧', '和', '知', '如', '君', '名', '各', '同', '向', '告', '合', '员', '听', '唱', '吹', '呼', '吸'],
  亻: ['们', '他', '你', '作', '住', '位', '休', '体', '何', '但', '任', '传', '伤', '估', '伴', '伸', '似', '低', '仰', '依'],
  扌: ['打', '找', '把', '拉', '推', '提', '指', '挥', '按', '持', '扫', '折', '批', '抓', '投', '抗', '护', '报', '抱', '拍'],
  艹: ['花', '草', '英', '茶', '菜', '萌', '蓝', '莲', '菊', '荷', '苗', '芽', '苦', '若', '茂', '茄', '茅', '茎', '苹', '蕉'],
  心: ['思', '想', '念', '忘', '志', '忠', '恩', '息', '您', '态', '急', '怒', '怨', '恐', '悔', '悟', '惜', '愉', '意', '感'],
  火: ['灯', '烧', '热', '然', '熟', '煮', '焦', '焰', '灿', '烂', '烟', '煤', '烦', '炎', '灭', '灰', '灶', '炸', '炮', '烘'],
  土: ['地', '场', '城', '埋', '基', '壁', '塘', '境', '培', '填', '坡', '坎', '坛', '坊', '坑', '块', '坚', '坐', '圣', '坠'],
  钅: ['银', '铜', '铁', '钢', '针', '钱', '镜', '钟', '错', '销', '锁', '锐', '锋', '链', '键', '锦', '铸', '锻', '钉', '钓'],
  讠: ['说', '话', '语', '认', '记', '讲', '评', '论', '诉', '试', '详', '该', '课', '调', '谢', '谁', '请', '让', '议', '读'],
  女: ['她', '好', '妈', '姐', '妹', '姑', '娘', '妻', '妇', '始', '姓', '委', '威', '姿', '娱', '婚', '媒', '嫩', '妙', '妖'],
  石: ['研', '破', '硬', '码', '磁', '确', '碎', '碰', '砍', '础', '矿', '硕', '碧', '磐', '磊', '碟', '砖', '碗', '碑', '砂'],
}

const ALL_LABELS = [
  '笔画数相等', '笔画数累加1', '笔画数累减1',
  '笔画交叉数相等', '笔画交叉数累加1', '笔画交叉数累减1',
  '封闭区域个数相等', '封闭区域个数累加1', '封闭区域个数累减1',
  '笔画不相连部分个数相等', '笔画不相连部分个数累加1', '笔画不相连部分个数累减1',
  '左右结构', '上下结构', '半包围结构', '独体结构',
  '左右对称', '上下对称',
  '都有封闭区域', '都是开放区域',
]
const CONTAIN_LABELS = Object.keys(CONTAIN).map((c) => `都包含「${c}」`)

// 结构表去重：一字只属一类，避免双正解
{
  const seen = new Set()
  for (const lab of ['左右结构', '上下结构', '半包围结构', '独体结构']) {
    STRUCT[lab] = STRUCT[lab].filter((ch) => {
      if (seen.has(ch)) return false
      seen.add(ch)
      return true
    })
  }
}

// 包含表：去掉表外无核验字（保留列表内）
for (const [comp, pool] of Object.entries(CONTAIN)) {
  CONTAIN[comp] = [...new Set(pool)].filter((ch) => [...ch].length === 1)
}

/** 各标签目标配额（合计 ≥500，组装时截到 500） */
const QUOTA = {
  笔画数相等: 45,
  笔画数累加1: 28,
  笔画数累减1: 28,
  笔画交叉数相等: 18,
  笔画交叉数累加1: 16,
  笔画交叉数累减1: 16,
  封闭区域个数相等: 22,
  封闭区域个数累加1: 20,
  封闭区域个数累减1: 20,
  笔画不相连部分个数相等: 16,
  笔画不相连部分个数累加1: 16,
  笔画不相连部分个数累减1: 16,
  左右结构: 22,
  上下结构: 22,
  半包围结构: 20,
  独体结构: 22,
  左右对称: 20,
  上下对称: 16,
  都有封闭区域: 20,
  都是开放区域: 20,
  // 都包含* 合计约 57
}

const REJECTED = []
const SEEDS = [] // {chars, correct, tip, extraDist, priority?}

function reject(chars, correct, reason) {
  REJECTED.push(`${(chars || []).join('')}|${correct}|${reason}`)
}

function distractorsFor(correct, extra = [], salt = 0) {
  const pool = [...new Set([...extra, ...ALL_LABELS, ...CONTAIN_LABELS])].filter((x) => x !== correct)
  const family = pool.filter((x) => {
    if (correct.includes('笔画数') && x.includes('笔画数')) return true
    if (correct.includes('交叉') && x.includes('交叉')) return true
    if (correct.includes('封闭区域个数') && x.includes('封闭区域个数')) return true
    if (correct.includes('不相连') && x.includes('不相连')) return true
    if (correct.includes('结构') && x.includes('结构')) return true
    if (correct.includes('对称') && x.includes('对称')) return true
    if ((correct.includes('封闭区域') || correct.includes('开放')) && (x.includes('封闭') || x.includes('开放'))) return true
    if (correct.startsWith('都包含') && x.startsWith('都包含')) return true
    return false
  })
  const rest = pool.filter((x) => !family.includes(x))
  const rot = (arr, s) => {
    const a = [...arr]
    let h = s >>> 0
    for (let i = a.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223 + a[i].charCodeAt(0)) >>> 0
      const j = h % (i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const base = [...correct, ...String(salt)].reduce((s, ch) => s + ch.charCodeAt(0), 0)
  return [...rot(family, base), ...rot(rest, base + 17)].slice(0, 5)
}

function windowQuartets(pool, step = 1) {
  const uniq = [...new Set(pool)]
  const out = []
  for (let i = 0; i + 3 < uniq.length; i += step) {
    out.push([uniq[i], uniq[i + 1], uniq[i + 2], uniq[i + 3]])
  }
  return out
}

function sampleComb4(pool, max, salt = 1) {
  const uniq = [...new Set(pool)]
  const n = uniq.length
  if (n < 4) return []
  const out = []
  const seen = new Set()
  let h = salt >>> 0
  let guard = 0
  while (out.length < max && guard < max * 40) {
    guard++
    h = (h * 1664525 + 1013904223) >>> 0
    const i0 = h % n
    h = (h * 1664525 + 1013904223) >>> 0
    const i1 = h % n
    h = (h * 1664525 + 1013904223) >>> 0
    const i2 = h % n
    h = (h * 1664525 + 1013904223) >>> 0
    const i3 = h % n
    const idx = [...new Set([i0, i1, i2, i3])]
    if (idx.length < 4) continue
    const chars = idx.slice(0, 4).map((i) => uniq[i])
    const key = chars.join('')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(chars)
  }
  return out
}

function groupBy(map) {
  const by = new Map()
  for (const [ch, n] of Object.entries(map)) {
    if (!by.has(n)) by.set(n, [])
    by.get(n).push(ch)
  }
  return by
}

function vals(map, chars) {
  return chars.map((c) => map[c])
}
function allDefined(map, chars) {
  return chars.every((c) => map[c] !== undefined)
}
function isEqual(nums) {
  return nums.every((n) => n === nums[0])
}
function isInc1(nums) {
  return nums.length === 4 && nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)
}
function isDec1(nums) {
  return nums.length === 4 && nums.every((n, i) => i === 0 || n === nums[i - 1] - 1)
}

function validateSeed(chars, correct) {
  const c = [...chars]
  if (c.length !== 4 || c.some((x) => !x || [...x].length !== 1)) return '非法四字'
  if (new Set(c).size !== 4) return '有重复字'

  if (correct === '笔画数相等') {
    if (!allDefined(STROKE, c)) return '缺笔画'
    if (!isEqual(vals(STROKE, c))) return `笔画不等 ${vals(STROKE, c)}`
  } else if (correct === '笔画数累加1') {
    if (!allDefined(STROKE, c) || !isInc1(vals(STROKE, c))) return `非累加 ${vals(STROKE, c)}`
  } else if (correct === '笔画数累减1') {
    if (!allDefined(STROKE, c) || !isDec1(vals(STROKE, c))) return `非累减 ${vals(STROKE, c)}`
  } else if (correct === '笔画交叉数相等') {
    if (!allDefined(CROSS, c) || !isEqual(vals(CROSS, c))) return `交叉不等 ${vals(CROSS, c)}`
  } else if (correct === '笔画交叉数累加1') {
    if (!allDefined(CROSS, c) || !isInc1(vals(CROSS, c))) return `交叉非累加 ${vals(CROSS, c)}`
  } else if (correct === '笔画交叉数累减1') {
    if (!allDefined(CROSS, c) || !isDec1(vals(CROSS, c))) return `交叉非累减 ${vals(CROSS, c)}`
  } else if (correct === '封闭区域个数相等') {
    if (!allDefined(ENCLOSE, c) || !isEqual(vals(ENCLOSE, c))) return `封闭不等 ${vals(ENCLOSE, c)}`
  } else if (correct === '封闭区域个数累加1') {
    if (!allDefined(ENCLOSE, c) || !isInc1(vals(ENCLOSE, c))) return `封闭非累加 ${vals(ENCLOSE, c)}`
  } else if (correct === '封闭区域个数累减1') {
    if (!allDefined(ENCLOSE, c) || !isDec1(vals(ENCLOSE, c))) return `封闭非累减 ${vals(ENCLOSE, c)}`
  } else if (correct === '笔画不相连部分个数相等') {
    if (!allDefined(PARTS, c) || !isEqual(vals(PARTS, c))) return `连通不等 ${vals(PARTS, c)}`
  } else if (correct === '笔画不相连部分个数累加1') {
    if (!allDefined(PARTS, c) || !isInc1(vals(PARTS, c))) return `连通非累加 ${vals(PARTS, c)}`
  } else if (correct === '笔画不相连部分个数累减1') {
    if (!allDefined(PARTS, c) || !isDec1(vals(PARTS, c))) return `连通非累减 ${vals(PARTS, c)}`
  } else if (STRUCT[correct]) {
    const pool = new Set(STRUCT[correct])
    if (!c.every((ch) => pool.has(ch))) return '结构不匹配'
    // 结构题：四字不得同时落入另一结构类（避免双正解）
    for (const [lab, list] of Object.entries(STRUCT)) {
      if (lab === correct) continue
      if (c.every((ch) => list.includes(ch))) return `同时满足${lab}`
    }
    // 也不得整组同时是左右/上下对称（如 林羽朋双、圭炎吕昌）
    if (c.every((ch) => SYM_LR.includes(ch))) return '同时满足左右对称'
    if (c.every((ch) => SYM_UD.includes(ch))) return '同时满足上下对称'
  } else if (correct === '左右对称') {
    if (!c.every((ch) => SYM_LR.includes(ch))) return '非左右对称'
    if (c.every((ch) => SYM_UD.includes(ch))) return '同时满足上下对称'
    for (const [lab, list] of Object.entries(STRUCT)) {
      if (c.every((ch) => list.includes(ch))) return `同时满足${lab}`
    }
  } else if (correct === '上下对称') {
    if (!c.every((ch) => SYM_UD.includes(ch))) return '非上下对称'
    // 必须含巨/臣/叵，避免整组双轴字被「左右对称」也可选
    if (!c.some((ch) => SYM_UD_ONLY.includes(ch))) return '缺上下对称锚点字（巨/臣/叵）'
    if (c.every((ch) => SYM_LR.includes(ch))) return '同时满足左右对称'
    for (const [lab, list] of Object.entries(STRUCT)) {
      if (c.every((ch) => list.includes(ch))) return `同时满足${lab}`
    }
  } else if (correct === '都有封闭区域') {
    if (!allDefined(ENCLOSE, c) || !c.every((ch) => ENCLOSE[ch] >= 1)) return '含开放字'
    // 若封闭个数恰好相等/累加，优先更具体标签
    if (isEqual(vals(ENCLOSE, c))) return '更贴合封闭区域个数相等'
    if (isInc1(vals(ENCLOSE, c))) return '更贴合封闭区域个数累加1'
    if (isDec1(vals(ENCLOSE, c))) return '更贴合封闭区域个数累减1'
  } else if (correct === '都是开放区域') {
    if (!allDefined(ENCLOSE, c) || !c.every((ch) => ENCLOSE[ch] === 0)) return '含封闭字'
    // 全 0 必然也满足封闭相等——教学题保留；生成时用 priority 绕过
  } else if (correct.startsWith('都包含「')) {
    const comp = correct.slice(4, -1)
    const pool = CONTAIN[comp]
    if (!pool || !c.every((ch) => pool.includes(ch))) return '部件不匹配'
  } else {
    return '未知标签'
  }
  return null
}

/** 是否匹配某标签（供校验脚本复用） */
function matchesLabel(chars, correct) {
  return validateSeed(chars, correct) === null
}

function tipFor(chars, correct) {
  if (correct === '笔画数相等') return `笔画数均为 ${STROKE[chars[0]]}`
  if (correct === '笔画数累加1') return `笔画数 ${vals(STROKE, chars).join('→')}`
  if (correct === '笔画数累减1') return `笔画数 ${vals(STROKE, chars).join('→')}`
  if (correct === '笔画交叉数相等') return `笔画交叉数均为 ${CROSS[chars[0]]}`
  if (correct === '笔画交叉数累加1' || correct === '笔画交叉数累减1') return `交叉数 ${vals(CROSS, chars).join('→')}`
  if (correct === '封闭区域个数相等') return `封闭区域个数均为 ${ENCLOSE[chars[0]]}`
  if (correct.includes('封闭区域个数累')) return `封闭区域 ${vals(ENCLOSE, chars).join('→')}`
  if (correct === '笔画不相连部分个数相等') return `不相连部分个数均为 ${PARTS[chars[0]]}`
  if (correct.includes('不相连部分个数累')) return `不相连部分 ${vals(PARTS, chars).join('→')}（开=1/勺=2/小=3）`
  if (STRUCT[correct]) return `四字均为${correct}`
  if (correct === '左右对称') return '四字均为左右对称（沿竖轴对折重合，如古/山/大）'
  if (correct === '上下对称') return '四字均为上下对称（沿横轴对折重合，如巨/目/中）'
  if (correct === '都有封闭区域') return `均有封闭区域（${vals(ENCLOSE, chars).join('、')}）`
  if (correct === '都是开放区域') return '封闭区域均为 0（开放字形）'
  if (correct.startsWith('都包含「')) return `四字均含可见部件「${correct.slice(4, -1)}」`
  return ''
}

function add(chars, correct, tip, opts = {}) {
  const c = [...chars]
  const err = validateSeed(c, correct)
  if (err) {
    reject(c, correct, err)
    return false
  }
  // 非优先：若另一「累加/累减」数值规律更贴合，拒题（开放区域与封闭相等重叠属正常教学标签，不拒）
  if (!opts.priority) {
    const rivals = [
      '笔画数累加1',
      '笔画数累减1',
      '笔画交叉数累加1',
      '笔画交叉数累减1',
      '封闭区域个数累加1',
      '封闭区域个数累减1',
      '笔画不相连部分个数累加1',
      '笔画不相连部分个数累减1',
    ]
    if (!rivals.includes(correct) && correct !== '都是开放区域') {
      for (const r of rivals) {
        if (matchesLabel(c, r)) {
          reject(c, correct, `另有更贴合规律 ${r}`)
          return false
        }
      }
    }
  }
  SEEDS.push({
    chars: c,
    correct,
    tip: tip || tipFor(c, correct),
    extraDist: opts.extraDist,
    priority: !!opts.priority,
  })
  return true
}

function addMapPatterns(map, labelEq, labelInc, labelDec, eqMaxPerLevel, seqMax) {
  const by = groupBy(map)
  for (const [n, pool] of by) {
    const uniq = [...new Set(pool)]
    if (uniq.length < 4) continue
    let made = 0
    for (const q of windowQuartets(uniq, 1)) {
      if (made >= eqMaxPerLevel) break
      if (add(q, labelEq)) made++
    }
    for (const q of sampleComb4(uniq, eqMaxPerLevel, n * 17 + uniq.length)) {
      if (made >= eqMaxPerLevel) break
      if (add(q, labelEq)) made++
    }
  }
  const nums = [...by.keys()].sort((a, b) => a - b)
  let seqMade = 0
  for (let s = 0; s + 3 < nums.length; s++) {
    const seq = [nums[s], nums[s + 1], nums[s + 2], nums[s + 3]]
    if (!isInc1(seq)) continue
    const pools = seq.map((n) => [...new Set(by.get(n))])
    for (let a = 0; a < pools[0].length && seqMade < seqMax; a++) {
      for (let b = 0; b < pools[1].length && seqMade < seqMax; b++) {
        for (let c = 0; c < pools[2].length && seqMade < seqMax; c++) {
          for (let d = 0; d < Math.min(3, pools[3].length) && seqMade < seqMax; d++) {
            const chars = [pools[0][a], pools[1][b], pools[2][c], pools[3][d]]
            if (new Set(chars).size !== 4) continue
            if (add(chars, labelInc)) {
              add([...chars].reverse(), labelDec)
              seqMade++
            }
          }
        }
      }
    }
  }
}

// ── 用户经典例（优先）──
add(['三', '五', '四', '伍'], '笔画数累加1', '笔画数 3→4→5→6（三/五/四/伍）', { priority: true })
add(['二', '十', '屯', '连'], '笔画交叉数累加1', '交叉数 0→1→2→3（经典例）', { priority: true })
add(['檀', '香', '复', '早'], '都包含「日」', '檀/香/复/早均含「日」', {
  priority: true,
  extraDist: CONTAIN_LABELS.filter((x) => x !== '都包含「日」'),
})
add(['木', '日', '昌', '晶'], '封闭区域个数累加1', '封闭区域 0→1→2→3（木/日/昌/晶）', { priority: true })
add(['开', '勺', '小', '心'], '笔画不相连部分个数累加1', '不相连部分 1→2→3→4（开/勺/小/心）', { priority: true })
add(['王', '天', '木', '人'], '都是开放区域', '封闭区域均为 0', { priority: true })
add(['国', '回', '田', '日'], '都有封闭区域', '均有封闭区域', { priority: true })
add(['古', '山', '大', '非'], '左右对称', '古/山/大/非均为左右对称（竖轴对折；非上下对称）', {
  priority: true,
})
add(['木', '开', '丰', '夹'], '左右对称', '木/开/丰/夹均为左右对称', { priority: true })
add(['巨', '目', '中', '臣'], '上下对称', '巨/目/中/臣均为上下对称（横轴对折；巨/臣非左右对称）', {
  priority: true,
})
add(['巨', '目', '中', '叵'], '上下对称', '巨/目/中/叵均为上下对称（横轴对折；巨/叵非左右对称）', {
  priority: true,
})
add(['卧', '林', '河', '明'], '左右结构', '四字均为左右结构', { priority: true })
add(['床', '问', '这', '区'], '半包围结构', '四字均为半包围结构', { priority: true })
add(['人', '木', '火', '水'], '独体结构', '四字均为独体结构', { priority: true })
add(['圭', '炎', '吕', '昌'], '上下结构', '四字均为上下结构', { priority: true })

// ── 系统生成 ──
addMapPatterns(STROKE, '笔画数相等', '笔画数累加1', '笔画数累减1', 6, 40)
addMapPatterns(CROSS, '笔画交叉数相等', '笔画交叉数累加1', '笔画交叉数累减1', 8, 30)
addMapPatterns(ENCLOSE, '封闭区域个数相等', '封闭区域个数累加1', '封闭区域个数累减1', 8, 35)
addMapPatterns(PARTS, '笔画不相连部分个数相等', '笔画不相连部分个数累加1', '笔画不相连部分个数累减1', 8, 30)

for (const [label, pool] of Object.entries(STRUCT)) {
  const uniq = [...new Set(pool)]
  const extra = ['左右结构', '上下结构', '半包围结构', '独体结构', '左右对称', '上下对称']
  for (const q of windowQuartets(uniq, 1)) add(q, label, null, { extraDist: extra })
  for (const q of sampleComb4(uniq, 18, label.length * 99)) add(q, label, null, { extraDist: extra })
}

{
  const extra = ['上下对称', '左右对称', '左右结构', '独体结构', '笔画数相等']
  // 多抽组合：对称题会拒「整组同结构/落入另一对称」，需要更大候选池
  for (const q of windowQuartets(SYM_LR, 1)) add(q, '左右对称', null, { extraDist: extra })
  for (const q of sampleComb4(SYM_LR, 80, 3)) add(q, '左右对称', null, { extraDist: extra })
  for (const q of windowQuartets(SYM_UD, 1)) add(q, '上下对称', null, { extraDist: extra })
  for (const q of sampleComb4(SYM_UD, 60, 5)) add(q, '上下对称', null, { extraDist: extra })
}

{
  const closed = Object.keys(ENCLOSE).filter((c) => ENCLOSE[c] >= 1)
  const open = Object.keys(ENCLOSE).filter((c) => ENCLOSE[c] === 0)
  const extraC = ['都是开放区域', '封闭区域个数相等', '左右结构', '独体结构']
  const extraO = ['都有封闭区域', '封闭区域个数相等', '左右对称', '笔画数相等']
  for (const q of windowQuartets(closed, 1)) add(q, '都有封闭区域', null, { extraDist: extraC })
  for (const q of sampleComb4(closed, 22, 7)) add(q, '都有封闭区域', null, { extraDist: extraC })
  for (const q of windowQuartets(open, 1)) add(q, '都是开放区域', null, { extraDist: extraO })
  for (const q of sampleComb4(open, 22, 9)) add(q, '都是开放区域', null, { extraDist: extraO })
}

for (const [comp, pool] of Object.entries(CONTAIN)) {
  const label = `都包含「${comp}」`
  const extra = CONTAIN_LABELS.filter((x) => x !== label)
  for (const q of windowQuartets(pool, 2)) add(q, label, null, { extraDist: extra })
  for (const q of sampleComb4(pool, 5, comp.charCodeAt(0))) add(q, label, null, { extraDist: extra })
}

// ═══════════════════ 配额组装 ═══════════════════

function labelKey(correct) {
  return correct.startsWith('都包含') ? '都包含某成分' : correct
}

function buildItems() {
  const byLabel = new Map()
  for (const s of SEEDS) {
    const k = s.correct
    if (!byLabel.has(k)) byLabel.set(k, [])
    byLabel.get(k).push(s)
  }
  // 优先级种子置顶
  for (const [, arr] of byLabel) {
    arr.sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0))
  }

  const picked = []
  const seenStem = new Set()

  function tryPick(s, distSalt = 0) {
    const stem = s.chars.join(FW)
    if (seenStem.has(stem)) return false
    // 再校验一次
    const err = validateSeed(s.chars, s.correct)
    if (err) {
      reject(s.chars, s.correct, `组装期: ${err}`)
      return false
    }
    seenStem.add(stem)
    picked.push({
      difficulty: 'normal',
      stem,
      correct: s.correct,
      distractors: distractorsFor(s.correct, s.extraDist, distSalt),
      explanation: [`汉字：${s.chars.join('、')}`, `规律：${s.correct}`, `核对：${s.tip || tipFor(s.chars, s.correct)}`].join('\n'),
      chars: /** @type {[string,string,string,string]} */ ([...s.chars]),
    })
    return true
  }

  // 1) 先保证优先经典例
  for (const s of SEEDS.filter((x) => x.priority)) tryPick(s)

  // 2) 按配额填充各标签
  const containBudget = 57
  let containCount = picked.filter((x) => x.correct.startsWith('都包含')).length

  for (const [label, quota] of Object.entries(QUOTA)) {
    const arr = byLabel.get(label) || []
    let have = picked.filter((x) => x.correct === label).length
    for (const s of arr) {
      if (have >= quota) break
      if (tryPick(s)) have++
    }
  }
  // 包含类
  for (const [label, arr] of byLabel) {
    if (!label.startsWith('都包含')) continue
    for (const s of arr) {
      if (containCount >= containBudget) break
      if (picked.some((p) => p.stem === s.chars.join(FW))) continue
      if (tryPick(s)) containCount++
    }
  }

  // 3) 相等类可换序补足
  function perms(chars) {
    const [a, b, c, d] = chars
    return [
      [a, c, b, d],
      [b, a, d, c],
      [c, d, a, b],
      [d, b, a, c],
      [a, d, c, b],
      [b, c, d, a],
    ]
  }

  const fillOrder = [
    ...Object.keys(QUOTA),
    ...Object.keys(CONTAIN).map((c) => `都包含「${c}」`),
  ]

  let guard = 0
  while (picked.length < 500 && guard < 20) {
    guard++
    let added = false
    for (const label of fillOrder) {
      if (picked.length >= 500) break
      const arr = byLabel.get(label) || []
      for (const s of arr) {
        if (picked.length >= 500) break
        if (label.includes('累加') || label.includes('累减')) continue
        for (const p of perms(s.chars)) {
          if (picked.length >= 500) break
          if (tryPick({ ...s, chars: p }, guard)) added = true
        }
      }
    }
    // 包含类再挖
    if (picked.length < 500) {
      for (const [comp, pool] of Object.entries(CONTAIN)) {
        if (picked.length >= 500) break
        const label = `都包含「${comp}」`
        for (const q of sampleComb4(pool, 8, guard * 31 + comp.charCodeAt(0))) {
          if (picked.length >= 500) break
          const s = { chars: q, correct: label, tip: tipFor(q, label), extraDist: CONTAIN_LABELS.filter((x) => x !== label) }
          if (tryPick(s, guard)) added = true
        }
      }
    }
    // 结构再挖
    if (picked.length < 500) {
      for (const [label, pool] of Object.entries(STRUCT)) {
        if (picked.length >= 500) break
        for (const q of sampleComb4(pool, 10, guard * 13 + label.length)) {
          if (picked.length >= 500) break
          const s = { chars: q, correct: label, tip: tipFor(q, label), extraDist: ['左右结构', '上下结构', '半包围结构', '独体结构'] }
          if (tryPick(s, guard)) added = true
        }
      }
    }
    // 笔画相等再挖
    if (picked.length < 500) {
      const by = groupBy(STROKE)
      for (const [n, pool] of by) {
        if (picked.length >= 500) break
        for (const q of sampleComb4(pool, 6, guard * 7 + n)) {
          if (picked.length >= 500) break
          const s = { chars: q, correct: '笔画数相等', tip: `笔画数均为 ${n}` }
          if (tryPick(s, guard)) added = true
        }
      }
    }
    if (!added) break
  }

  if (picked.length < 500) {
    throw new Error(`仅生成 ${picked.length}/500；拒绝 ${REJECTED.length}；种子 ${SEEDS.length}`)
  }

  return picked.slice(0, 500).map((item, idx) => ({
    ...item,
    key: `hanzi-pattern:${String(idx + 1).padStart(3, '0')}`,
  }))
}

function validateAll(items) {
  const errors = []
  if (items.length !== 500) errors.push(`count=${items.length}`)
  if (new Set(items.map((x) => x.key)).size !== 500) errors.push('duplicate keys')
  if (new Set(items.map((x) => x.stem)).size !== 500) errors.push('duplicate stems')

  const stemRe = /^.\u3000.\u3000.\u3000.$/
  for (const it of items) {
    if (it.stem !== it.chars.join(FW)) errors.push(`stem!=chars ${it.key}`)
    if (!stemRe.test(it.stem)) errors.push(`stem format ${it.key}: ${it.stem}`)
    if (/规律|下列/.test(it.stem)) errors.push(`bad stem text ${it.key}`)
    if (it.distractors.includes(it.correct)) errors.push(`dist has correct ${it.key}`)
    if (it.distractors.length < 3) errors.push(`few dist ${it.key}`)
    // 开放区域优先例允许与「封闭相等」重叠
    if (it.correct === '都是开放区域' && it.chars.every((ch) => ENCLOSE[ch] === 0)) {
      /* ok */
    } else {
      const err = validateSeed(it.chars, it.correct)
      if (err) errors.push(`revalidate ${it.key} ${it.chars.join('')}: ${err}`)
    }
  }

  const spots = [
    ['三五四伍', '笔画数累加1'],
    ['二十屯连', '笔画交叉数累加1'],
    ['檀香复早', '都包含「日」'],
    ['木日昌晶', '封闭区域个数累加1'],
    ['开勺小心', '笔画不相连部分个数累加1'],
    ['王天木人', '都是开放区域'],
    ['国回田日', '都有封闭区域'],
    ['古山大非', '左右对称'],
    ['巨目中臣', '上下对称'],
  ]
  for (const [chars, correct] of spots) {
    const hit = items.find((it) => it.chars.join('') === chars)
    if (!hit) errors.push(`missing spot ${chars}`)
    else if (hit.correct !== correct) errors.push(`spot ${chars} => ${hit.correct}`)
  }

  const counts = {}
  for (const it of items) {
    const k = labelKey(it.correct)
    counts[k] = (counts[k] || 0) + 1
  }
  return { errors, counts }
}

function main() {
  const items = buildItems()
  const { errors, counts } = validateAll(items)
  console.log('=== distribution ===')
  console.log(counts)
  console.log('seeds=', SEEDS.length, 'rejected=', REJECTED.length)
  if (REJECTED.length) {
    console.log('=== rejected sample ===')
    console.log(REJECTED.slice(0, 30).join('\n'))
  }
  if (errors.length) {
    console.error('=== VALIDATION ERRORS ===')
    console.error(errors.slice(0, 40).join('\n'))
    throw new Error(`validation failed: ${errors.length}`)
  }
  console.log('=== validation OK ===')

  const body = items
    .map((it) => {
      const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
      return `  {
    difficulty: 'normal',
    stem: \`${esc(it.stem)}\`,
    correct: ${JSON.stringify(it.correct)},
    distractors: ${JSON.stringify(it.distractors)},
    explanation: \`${esc(it.explanation)}\`,
    key: ${JSON.stringify(it.key)},
    chars: ${JSON.stringify(it.chars)},
  }`
    })
    .join(',\n')

  fs.writeFileSync(
    OUT,
    `/**
 * 快判·汉字规律本地题库（普通难度，恰好 500 题）
 * 由 scripts/generate-hanzi-pattern-bank.mjs 生成；勿手改整表，改种子后重跑脚本。
 * stem 仅为四字（全角空格分隔）。
 */
import type { HanziPatternBankItem } from '@/utils/hanziPatternBankTypes'

export const HANZI_PATTERN_BANK: HanziPatternBankItem[] = [
${body},
]
`,
    'utf8',
  )
  console.log('wrote', OUT, 'items=', items.length)
}

const isMain =
  process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])
if (isMain) main()

export {
  STROKE,
  CROSS,
  ENCLOSE,
  PARTS,
  STRUCT,
  SYM_LR,
  SYM_UD,
  SYM_UD_ONLY,
  CONTAIN,
  ALL_LABELS,
  CONTAIN_LABELS,
  FW,
  validateSeed,
  matchesLabel,
  vals,
  allDefined,
  isEqual,
  isInc1,
  isDec1,
}
