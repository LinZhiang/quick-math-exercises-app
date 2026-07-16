/** 口算·语法判断：句子成分题库（主/谓/宾/定/状/补） */

export type GrammarRole =
  | 'subject'
  | 'predicate'
  | 'object'
  | 'attributive'
  | 'adverbial'
  | 'complement'

export type GrammarPart = {
  text: string
  role: GrammarRole
}

export type GrammarSentence = {
  id: string
  sentence: string
  difficulty: 'easy' | 'normal' | 'hard'
  parts: GrammarPart[]
}

export const GRAMMAR_ROLE_LABELS: Record<GrammarRole, string> = {
  subject: '主语',
  predicate: '谓语',
  object: '宾语',
  attributive: '定语',
  adverbial: '状语',
  complement: '补语',
}

export const ALL_GRAMMAR_ROLES: GrammarRole[] = [
  'subject',
  'predicate',
  'object',
  'attributive',
  'adverbial',
  'complement',
]

function S(
  id: string,
  difficulty: GrammarSentence['difficulty'],
  sentence: string,
  parts: GrammarPart[],
): GrammarSentence {
  return { id, difficulty, sentence, parts }
}

/** 简单：短句清楚；六种成分都要覆盖，定/状/补与主谓宾均衡出现 */
const EASY: GrammarSentence[] = [
  // —— 定语清晰 ——
  S('e01', 'easy', '红红的苹果很好吃。', [
    { text: '红红的', role: 'attributive' },
    { text: '苹果', role: 'subject' },
    { text: '很好吃', role: 'predicate' },
  ]),
  S('e02', 'easy', '美丽的花朵开了。', [
    { text: '美丽的', role: 'attributive' },
    { text: '花朵', role: 'subject' },
    { text: '开', role: 'predicate' },
  ]),
  S('e03', 'easy', '新书很好看。', [
    { text: '新', role: 'attributive' },
    { text: '书', role: 'subject' },
    { text: '很好看', role: 'predicate' },
  ]),
  S('e04', 'easy', '蓝蓝的天空很美。', [
    { text: '蓝蓝的', role: 'attributive' },
    { text: '天空', role: 'subject' },
    { text: '很美', role: 'predicate' },
  ]),
  S('e05', 'easy', '小小的鸟飞走了。', [
    { text: '小小的', role: 'attributive' },
    { text: '鸟', role: 'subject' },
    { text: '飞', role: 'predicate' },
    { text: '走了', role: 'complement' },
  ]),
  S('e06', 'easy', '干净的桌子很亮。', [
    { text: '干净的', role: 'attributive' },
    { text: '桌子', role: 'subject' },
    { text: '很亮', role: 'predicate' },
  ]),
  S('e07', 'easy', '白色的云朵飘着。', [
    { text: '白色的', role: 'attributive' },
    { text: '云朵', role: 'subject' },
    { text: '飘着', role: 'predicate' },
  ]),
  S('e08', 'easy', '快乐的孩子笑了。', [
    { text: '快乐的', role: 'attributive' },
    { text: '孩子', role: 'subject' },
    { text: '笑', role: 'predicate' },
  ]),
  S('e09', 'easy', '新鲜的牛奶很香。', [
    { text: '新鲜的', role: 'attributive' },
    { text: '牛奶', role: 'subject' },
    { text: '很香', role: 'predicate' },
  ]),
  // —— 状语清晰 ——
  S('e10', 'easy', '他认真学习。', [
    { text: '他', role: 'subject' },
    { text: '认真', role: 'adverbial' },
    { text: '学习', role: 'predicate' },
  ]),
  S('e11', 'easy', '我慢慢走。', [
    { text: '我', role: 'subject' },
    { text: '慢慢', role: 'adverbial' },
    { text: '走', role: 'predicate' },
  ]),
  S('e12', 'easy', '鱼在水里游。', [
    { text: '鱼', role: 'subject' },
    { text: '在水里', role: 'adverbial' },
    { text: '游', role: 'predicate' },
  ]),
  S('e13', 'easy', '孩子高兴地笑。', [
    { text: '孩子', role: 'subject' },
    { text: '高兴地', role: 'adverbial' },
    { text: '笑', role: 'predicate' },
  ]),
  S('e14', 'easy', '大家一起唱歌。', [
    { text: '大家', role: 'subject' },
    { text: '一起', role: 'adverbial' },
    { text: '唱', role: 'predicate' },
    { text: '歌', role: 'object' },
  ]),
  S('e15', 'easy', '我今天休息。', [
    { text: '我', role: 'subject' },
    { text: '今天', role: 'adverbial' },
    { text: '休息', role: 'predicate' },
  ]),
  S('e16', 'easy', '他昨天回家。', [
    { text: '他', role: 'subject' },
    { text: '昨天', role: 'adverbial' },
    { text: '回', role: 'predicate' },
    { text: '家', role: 'object' },
  ]),
  S('e17', 'easy', '我们立刻出发。', [
    { text: '我们', role: 'subject' },
    { text: '立刻', role: 'adverbial' },
    { text: '出发', role: 'predicate' },
  ]),
  S('e18', 'easy', '她轻轻敲门。', [
    { text: '她', role: 'subject' },
    { text: '轻轻', role: 'adverbial' },
    { text: '敲', role: 'predicate' },
    { text: '门', role: 'object' },
  ]),
  // —— 补语清晰 ——
  S('e19', 'easy', '小狗跑得很快。', [
    { text: '小狗', role: 'subject' },
    { text: '跑', role: 'predicate' },
    { text: '很快', role: 'complement' },
  ]),
  S('e20', 'easy', '他写得很工整。', [
    { text: '他', role: 'subject' },
    { text: '写', role: 'predicate' },
    { text: '很工整', role: 'complement' },
  ]),
  S('e21', 'easy', '小鸟飞得很高。', [
    { text: '小鸟', role: 'subject' },
    { text: '飞', role: 'predicate' },
    { text: '很高', role: 'complement' },
  ]),
  S('e22', 'easy', '雨下大了。', [
    { text: '雨', role: 'subject' },
    { text: '下', role: 'predicate' },
    { text: '大了', role: 'complement' },
  ]),
  S('e23', 'easy', '灯亮起来了。', [
    { text: '灯', role: 'subject' },
    { text: '亮', role: 'predicate' },
    { text: '起来了', role: 'complement' },
  ]),
  S('e24', 'easy', '花开得很艳。', [
    { text: '花', role: 'subject' },
    { text: '开', role: 'predicate' },
    { text: '很艳', role: 'complement' },
  ]),
  S('e25', 'easy', '他吃得真香。', [
    { text: '他', role: 'subject' },
    { text: '吃', role: 'predicate' },
    { text: '真香', role: 'complement' },
  ]),
  S('e26', 'easy', '衣服洗干净了。', [
    { text: '衣服', role: 'subject' },
    { text: '洗', role: 'predicate' },
    { text: '干净了', role: 'complement' },
  ]),
  S('e27', 'easy', '字写端正了。', [
    { text: '字', role: 'subject' },
    { text: '写', role: 'predicate' },
    { text: '端正了', role: 'complement' },
  ]),
  S('e28', 'easy', '门关紧了。', [
    { text: '门', role: 'subject' },
    { text: '关', role: 'predicate' },
    { text: '紧了', role: 'complement' },
  ]),
  // —— 状 + 宾（仍短） ——
  S('e29', 'easy', '我认真写作业。', [
    { text: '我', role: 'subject' },
    { text: '认真', role: 'adverbial' },
    { text: '写', role: 'predicate' },
    { text: '作业', role: 'object' },
  ]),
  S('e30', 'easy', '哥哥努力踢足球。', [
    { text: '哥哥', role: 'subject' },
    { text: '努力', role: 'adverbial' },
    { text: '踢', role: 'predicate' },
    { text: '足球', role: 'object' },
  ]),
  S('e31', 'easy', '妹妹仔细擦桌子。', [
    { text: '妹妹', role: 'subject' },
    { text: '仔细', role: 'adverbial' },
    { text: '擦', role: 'predicate' },
    { text: '桌子', role: 'object' },
  ]),
  S('e32', 'easy', '老师耐心讲课。', [
    { text: '老师', role: 'subject' },
    { text: '耐心', role: 'adverbial' },
    { text: '讲', role: 'predicate' },
    { text: '课', role: 'object' },
  ]),
  S('e33', 'easy', '学生正确回答问题。', [
    { text: '学生', role: 'subject' },
    { text: '正确', role: 'adverbial' },
    { text: '回答', role: 'predicate' },
    { text: '问题', role: 'object' },
  ]),
  S('e34', 'easy', '小猫轻轻捉老鼠。', [
    { text: '小猫', role: 'subject' },
    { text: '轻轻', role: 'adverbial' },
    { text: '捉', role: 'predicate' },
    { text: '老鼠', role: 'object' },
  ]),
  // —— 定 + 宾 / 定 + 补 ——
  S('e35', 'easy', '美丽的小鸟唱歌。', [
    { text: '美丽的', role: 'attributive' },
    { text: '小鸟', role: 'subject' },
    { text: '唱', role: 'predicate' },
    { text: '歌', role: 'object' },
  ]),
  S('e36', 'easy', '雪白的兔子吃青草。', [
    { text: '雪白的', role: 'attributive' },
    { text: '兔子', role: 'subject' },
    { text: '吃', role: 'predicate' },
    { text: '青草', role: 'object' },
  ]),
  S('e37', 'easy', '勤劳的蜜蜂采花蜜。', [
    { text: '勤劳的', role: 'attributive' },
    { text: '蜜蜂', role: 'subject' },
    { text: '采', role: 'predicate' },
    { text: '花蜜', role: 'object' },
  ]),
  S('e38', 'easy', '红红的太阳升起来了。', [
    { text: '红红的', role: 'attributive' },
    { text: '太阳', role: 'subject' },
    { text: '升', role: 'predicate' },
    { text: '起来了', role: 'complement' },
  ]),
  S('e39', 'easy', '绿绿的草很好看。', [
    { text: '绿绿的', role: 'attributive' },
    { text: '草', role: 'subject' },
    { text: '很好看', role: 'predicate' },
  ]),
  S('e40', 'easy', '新衣服很合身。', [
    { text: '新', role: 'attributive' },
    { text: '衣服', role: 'subject' },
    { text: '很合身', role: 'predicate' },
  ]),
  // —— 状 + 补 ——
  S('e41', 'easy', '他已经走远了。', [
    { text: '他', role: 'subject' },
    { text: '已经', role: 'adverbial' },
    { text: '走', role: 'predicate' },
    { text: '远了', role: 'complement' },
  ]),
  S('e42', 'easy', '小鸟忽然飞走了。', [
    { text: '小鸟', role: 'subject' },
    { text: '忽然', role: 'adverbial' },
    { text: '飞', role: 'predicate' },
    { text: '走了', role: 'complement' },
  ]),
  S('e43', 'easy', '灯又亮起来了。', [
    { text: '灯', role: 'subject' },
    { text: '又', role: 'adverbial' },
    { text: '亮', role: 'predicate' },
    { text: '起来了', role: 'complement' },
  ]),
  S('e44', 'easy', '雨渐渐下大了。', [
    { text: '雨', role: 'subject' },
    { text: '渐渐', role: 'adverbial' },
    { text: '下', role: 'predicate' },
    { text: '大了', role: 'complement' },
  ]),
  S('e45', 'easy', '孩子们高兴地玩耍。', [
    { text: '孩子们', role: 'subject' },
    { text: '高兴地', role: 'adverbial' },
    { text: '玩耍', role: 'predicate' },
  ]),
  // —— 主谓宾保留少量，并带修饰 ——
  S('e46', 'easy', '妈妈细心做饭。', [
    { text: '妈妈', role: 'subject' },
    { text: '细心', role: 'adverbial' },
    { text: '做', role: 'predicate' },
    { text: '饭', role: 'object' },
  ]),
  S('e47', 'easy', '爸爸修好自行车。', [
    { text: '爸爸', role: 'subject' },
    { text: '修', role: 'predicate' },
    { text: '好', role: 'complement' },
    { text: '自行车', role: 'object' },
  ]),
  S('e48', 'easy', '姐姐洗干净衣服。', [
    { text: '姐姐', role: 'subject' },
    { text: '洗', role: 'predicate' },
    { text: '干净', role: 'complement' },
    { text: '衣服', role: 'object' },
  ]),
  S('e49', 'easy', '弟弟堆好雪人。', [
    { text: '弟弟', role: 'subject' },
    { text: '堆', role: 'predicate' },
    { text: '好', role: 'complement' },
    { text: '雪人', role: 'object' },
  ]),
  S('e50', 'easy', '客人慢慢喝茶。', [
    { text: '客人', role: 'subject' },
    { text: '慢慢', role: 'adverbial' },
    { text: '喝', role: 'predicate' },
    { text: '茶', role: 'object' },
  ]),
]

/** 普通：定/状/补更常见，句式稍长 */
const NORMAL: GrammarSentence[] = [
  S('n01', 'normal', '聪明的孩子很快学会了方法。', [
    { text: '聪明的', role: 'attributive' },
    { text: '孩子', role: 'subject' },
    { text: '很快', role: 'adverbial' },
    { text: '学会', role: 'predicate' },
    { text: '方法', role: 'object' },
  ]),
  S('n02', 'normal', '他昨天在图书馆借了一本书。', [
    { text: '他', role: 'subject' },
    { text: '昨天', role: 'adverbial' },
    { text: '在图书馆', role: 'adverbial' },
    { text: '借', role: 'predicate' },
    { text: '一本书', role: 'object' },
  ]),
  S('n03', 'normal', '小鸟在枝头快乐地歌唱。', [
    { text: '小鸟', role: 'subject' },
    { text: '在枝头', role: 'adverbial' },
    { text: '快乐地', role: 'adverbial' },
    { text: '歌唱', role: 'predicate' },
  ]),
  S('n04', 'normal', '同学们把教室打扫得干干净净。', [
    { text: '同学们', role: 'subject' },
    { text: '把教室', role: 'adverbial' },
    { text: '打扫', role: 'predicate' },
    { text: '干干净净', role: 'complement' },
  ]),
  S('n05', 'normal', '那本厚厚的词典很有用。', [
    { text: '那本', role: 'attributive' },
    { text: '厚厚的', role: 'attributive' },
    { text: '词典', role: 'subject' },
    { text: '很有用', role: 'predicate' },
  ]),
  S('n06', 'normal', '她轻轻地关上了房门。', [
    { text: '她', role: 'subject' },
    { text: '轻轻地', role: 'adverbial' },
    { text: '关', role: 'predicate' },
    { text: '房门', role: 'object' },
  ]),
  S('n07', 'normal', '爷爷讲的故事十分有趣。', [
    { text: '爷爷讲的', role: 'attributive' },
    { text: '故事', role: 'subject' },
    { text: '十分有趣', role: 'predicate' },
  ]),
  S('n08', 'normal', '我已经做完了功课。', [
    { text: '我', role: 'subject' },
    { text: '已经', role: 'adverbial' },
    { text: '做', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '功课', role: 'object' },
  ]),
  S('n09', 'normal', '阳光透过窗帘洒进房间。', [
    { text: '阳光', role: 'subject' },
    { text: '透过窗帘', role: 'adverbial' },
    { text: '洒', role: 'predicate' },
    { text: '进房间', role: 'complement' },
  ]),
  S('n10', 'normal', '他激动得说不出话来。', [
    { text: '他', role: 'subject' },
    { text: '激动', role: 'predicate' },
    { text: '说不出话来', role: 'complement' },
  ]),
  S('n11', 'normal', '勤劳的蜜蜂整天忙碌着。', [
    { text: '勤劳的', role: 'attributive' },
    { text: '蜜蜂', role: 'subject' },
    { text: '整天', role: 'adverbial' },
    { text: '忙碌', role: 'predicate' },
  ]),
  S('n12', 'normal', '我们沿着小路慢慢向前走。', [
    { text: '我们', role: 'subject' },
    { text: '沿着小路', role: 'adverbial' },
    { text: '慢慢', role: 'adverbial' },
    { text: '向前', role: 'adverbial' },
    { text: '走', role: 'predicate' },
  ]),
  S('n13', 'normal', '老师耐心地讲解了难题。', [
    { text: '老师', role: 'subject' },
    { text: '耐心地', role: 'adverbial' },
    { text: '讲解', role: 'predicate' },
    { text: '难题', role: 'object' },
  ]),
  S('n14', 'normal', '窗外的景色美极了。', [
    { text: '窗外的', role: 'attributive' },
    { text: '景色', role: 'subject' },
    { text: '美', role: 'predicate' },
    { text: '极了', role: 'complement' },
  ]),
  S('n15', 'normal', '他突然想起一件重要的事。', [
    { text: '他', role: 'subject' },
    { text: '突然', role: 'adverbial' },
    { text: '想起', role: 'predicate' },
    { text: '一件重要的事', role: 'object' },
  ]),
  S('n16', 'normal', '妹妹把房间收拾得整整齐齐。', [
    { text: '妹妹', role: 'subject' },
    { text: '把房间', role: 'adverbial' },
    { text: '收拾', role: 'predicate' },
    { text: '整整齐齐', role: 'complement' },
  ]),
  S('n17', 'normal', '远处传来阵阵欢笑声。', [
    { text: '远处', role: 'adverbial' },
    { text: '传来', role: 'predicate' },
    { text: '阵阵欢笑声', role: 'object' },
  ]),
  S('n18', 'normal', '这部电影深刻地反映了现实。', [
    { text: '这部', role: 'attributive' },
    { text: '电影', role: 'subject' },
    { text: '深刻地', role: 'adverbial' },
    { text: '反映', role: 'predicate' },
    { text: '现实', role: 'object' },
  ]),
  S('n19', 'normal', '孩子们在草地上尽情地奔跑。', [
    { text: '孩子们', role: 'subject' },
    { text: '在草地上', role: 'adverbial' },
    { text: '尽情地', role: 'adverbial' },
    { text: '奔跑', role: 'predicate' },
  ]),
  S('n20', 'normal', '他写的字越来越漂亮了。', [
    { text: '他写的', role: 'attributive' },
    { text: '字', role: 'subject' },
    { text: '越来越漂亮了', role: 'predicate' },
  ]),
  S('n21', 'normal', '我清楚地听见了脚步声。', [
    { text: '我', role: 'subject' },
    { text: '清楚地', role: 'adverbial' },
    { text: '听见', role: 'predicate' },
    { text: '脚步声', role: 'object' },
  ]),
  S('n22', 'normal', '金色的麦浪随风起伏。', [
    { text: '金色的', role: 'attributive' },
    { text: '麦浪', role: 'subject' },
    { text: '随风', role: 'adverbial' },
    { text: '起伏', role: 'predicate' },
  ]),
  S('n23', 'normal', '他被这件事深深地打动了。', [
    { text: '他', role: 'subject' },
    { text: '被这件事', role: 'adverbial' },
    { text: '深深地', role: 'adverbial' },
    { text: '打动', role: 'predicate' },
  ]),
  S('n24', 'normal', '桌上放着一本打开的书。', [
    { text: '桌上', role: 'adverbial' },
    { text: '放', role: 'predicate' },
    { text: '一本打开的书', role: 'object' },
  ]),
  S('n25', 'normal', '她兴奋得跳了起来。', [
    { text: '她', role: 'subject' },
    { text: '兴奋', role: 'predicate' },
    { text: '跳了起来', role: 'complement' },
  ]),
  S('n26', 'normal', '古老的城墙依然屹立着。', [
    { text: '古老的', role: 'attributive' },
    { text: '城墙', role: 'subject' },
    { text: '依然', role: 'adverbial' },
    { text: '屹立', role: 'predicate' },
  ]),
  S('n27', 'normal', '我们终于爬上了山顶。', [
    { text: '我们', role: 'subject' },
    { text: '终于', role: 'adverbial' },
    { text: '爬', role: 'predicate' },
    { text: '上了', role: 'complement' },
    { text: '山顶', role: 'object' },
  ]),
  S('n28', 'normal', '他诚恳地向大家道歉。', [
    { text: '他', role: 'subject' },
    { text: '诚恳地', role: 'adverbial' },
    { text: '向大家', role: 'adverbial' },
    { text: '道歉', role: 'predicate' },
  ]),
  S('n29', 'normal', '春天的风吹绿了大地。', [
    { text: '春天的', role: 'attributive' },
    { text: '风', role: 'subject' },
    { text: '吹', role: 'predicate' },
    { text: '绿了', role: 'complement' },
    { text: '大地', role: 'object' },
  ]),
  S('n30', 'normal', '那位和蔼的老人笑了。', [
    { text: '那位', role: 'attributive' },
    { text: '和蔼的', role: 'attributive' },
    { text: '老人', role: 'subject' },
    { text: '笑', role: 'predicate' },
  ]),
  S('n31', 'normal', '他迅速地解答完题目。', [
    { text: '他', role: 'subject' },
    { text: '迅速地', role: 'adverbial' },
    { text: '解答', role: 'predicate' },
    { text: '完', role: 'complement' },
    { text: '题目', role: 'object' },
  ]),
  S('n32', 'normal', '皎洁的月光洒满庭院。', [
    { text: '皎洁的', role: 'attributive' },
    { text: '月光', role: 'subject' },
    { text: '洒', role: 'predicate' },
    { text: '满', role: 'complement' },
    { text: '庭院', role: 'object' },
  ]),
  S('n33', 'normal', '我把钥匙忘在家里了。', [
    { text: '我', role: 'subject' },
    { text: '把钥匙', role: 'adverbial' },
    { text: '忘', role: 'predicate' },
    { text: '在家里了', role: 'complement' },
  ]),
  S('n34', 'normal', '热闹的集市挤满了人。', [
    { text: '热闹的', role: 'attributive' },
    { text: '集市', role: 'subject' },
    { text: '挤', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '人', role: 'object' },
  ]),
  S('n35', 'normal', '他悄悄地走进教室。', [
    { text: '他', role: 'subject' },
    { text: '悄悄地', role: 'adverbial' },
    { text: '走', role: 'predicate' },
    { text: '进教室', role: 'complement' },
  ]),
  S('n36', 'normal', '清澈的河水缓缓流过村庄。', [
    { text: '清澈的', role: 'attributive' },
    { text: '河水', role: 'subject' },
    { text: '缓缓', role: 'adverbial' },
    { text: '流', role: 'predicate' },
    { text: '过村庄', role: 'complement' },
  ]),
  S('n37', 'normal', '她认真地把笔记整理好。', [
    { text: '她', role: 'subject' },
    { text: '认真地', role: 'adverbial' },
    { text: '把笔记', role: 'adverbial' },
    { text: '整理', role: 'predicate' },
    { text: '好', role: 'complement' },
  ]),
  S('n38', 'normal', '雄伟的长城吸引着游客。', [
    { text: '雄伟的', role: 'attributive' },
    { text: '长城', role: 'subject' },
    { text: '吸引', role: 'predicate' },
    { text: '游客', role: 'object' },
  ]),
  S('n39', 'normal', '我终于听懂了老师的话。', [
    { text: '我', role: 'subject' },
    { text: '终于', role: 'adverbial' },
    { text: '听', role: 'predicate' },
    { text: '懂了', role: 'complement' },
    { text: '老师的话', role: 'object' },
  ]),
  S('n40', 'normal', '树上的果实压弯了枝头。', [
    { text: '树上的', role: 'attributive' },
    { text: '果实', role: 'subject' },
    { text: '压', role: 'predicate' },
    { text: '弯了', role: 'complement' },
    { text: '枝头', role: 'object' },
  ]),
  S('n41', 'normal', '他专心地画着一幅画。', [
    { text: '他', role: 'subject' },
    { text: '专心地', role: 'adverbial' },
    { text: '画', role: 'predicate' },
    { text: '一幅画', role: 'object' },
  ]),
  S('n42', 'normal', '温暖的阳光照在脸上。', [
    { text: '温暖的', role: 'attributive' },
    { text: '阳光', role: 'subject' },
    { text: '照', role: 'predicate' },
    { text: '在脸上', role: 'complement' },
  ]),
  S('n43', 'normal', '同学们热烈地讨论着问题。', [
    { text: '同学们', role: 'subject' },
    { text: '热烈地', role: 'adverbial' },
    { text: '讨论', role: 'predicate' },
    { text: '问题', role: 'object' },
  ]),
  S('n44', 'normal', '他累得不想说话。', [
    { text: '他', role: 'subject' },
    { text: '累', role: 'predicate' },
    { text: '不想说话', role: 'complement' },
  ]),
  S('n45', 'normal', '新鲜的蔬菜堆满了菜篮。', [
    { text: '新鲜的', role: 'attributive' },
    { text: '蔬菜', role: 'subject' },
    { text: '堆', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '菜篮', role: 'object' },
  ]),
  S('n46', 'normal', '我从书包里拿出作业本。', [
    { text: '我', role: 'subject' },
    { text: '从书包里', role: 'adverbial' },
    { text: '拿', role: 'predicate' },
    { text: '出', role: 'complement' },
    { text: '作业本', role: 'object' },
  ]),
  S('n47', 'normal', '明亮的灯光照亮了整间屋子。', [
    { text: '明亮的', role: 'attributive' },
    { text: '灯光', role: 'subject' },
    { text: '照亮', role: 'predicate' },
    { text: '整间屋子', role: 'object' },
  ]),
  S('n48', 'normal', '他骄傲地举起了奖杯。', [
    { text: '他', role: 'subject' },
    { text: '骄傲地', role: 'adverbial' },
    { text: '举', role: 'predicate' },
    { text: '起了', role: 'complement' },
    { text: '奖杯', role: 'object' },
  ]),
  S('n49', 'normal', '远处的山峦笼罩着薄雾。', [
    { text: '远处的', role: 'attributive' },
    { text: '山峦', role: 'subject' },
    { text: '笼罩', role: 'predicate' },
    { text: '薄雾', role: 'object' },
  ]),
  S('n50', 'normal', '她把花瓶小心地放在桌上。', [
    { text: '她', role: 'subject' },
    { text: '把花瓶', role: 'adverbial' },
    { text: '小心地', role: 'adverbial' },
    { text: '放', role: 'predicate' },
    { text: '在桌上', role: 'complement' },
  ]),
]

/** 复杂：长单句（逗号延展）、多层定状补、把被兼语句式，与普通题拉开差距 */
const HARD: GrammarSentence[] = [
  S(
    'h01',
    'hard',
    '被风雨打湿的衣服挂在阳台上晾着，妈妈把它们一一收回了柜子。',
    [
      { text: '被风雨打湿的', role: 'attributive' },
      { text: '衣服', role: 'subject' },
      { text: '挂', role: 'predicate' },
      { text: '在阳台上', role: 'complement' },
      { text: '一一', role: 'adverbial' },
    ],
  ),
  S(
    'h02',
    'hard',
    '妈妈昨天在厨房里做了一桌丰盛的菜，全家人围坐在桌边吃得津津有味。',
    [
      { text: '妈妈', role: 'subject' },
      { text: '昨天', role: 'adverbial' },
      { text: '在厨房里', role: 'adverbial' },
      { text: '做', role: 'predicate' },
      { text: '一桌丰盛的菜', role: 'object' },
      { text: '津津有味', role: 'complement' },
    ],
  ),
  S(
    'h03',
    'hard',
    '那位戴眼镜的老师把问题讲解得十分清楚，同学们听完后都恍然大悟。',
    [
      { text: '那位戴眼镜的', role: 'attributive' },
      { text: '老师', role: 'subject' },
      { text: '把问题', role: 'adverbial' },
      { text: '讲解', role: 'predicate' },
      { text: '十分清楚', role: 'complement' },
    ],
  ),
  S(
    'h04',
    'hard',
    '经过反复练习，他终于把这首歌唱得非常动听，台下顿时响起了热烈的掌声。',
    [
      { text: '经过反复练习', role: 'adverbial' },
      { text: '他', role: 'subject' },
      { text: '终于', role: 'adverbial' },
      { text: '把这首歌', role: 'adverbial' },
      { text: '唱', role: 'predicate' },
      { text: '非常动听', role: 'complement' },
    ],
  ),
  S(
    'h05',
    'hard',
    '矗立在广场中央的纪念碑吸引着过往行人，孩子们围着它听爷爷讲过去的故事。',
    [
      { text: '矗立在广场中央的', role: 'attributive' },
      { text: '纪念碑', role: 'subject' },
      { text: '吸引', role: 'predicate' },
      { text: '过往行人', role: 'object' },
    ],
  ),
  S(
    'h06',
    'hard',
    '他被这突如其来的消息弄得不知所措，好半天才把要说的话挤了出来。',
    [
      { text: '他', role: 'subject' },
      { text: '被这突如其来的消息', role: 'adverbial' },
      { text: '弄', role: 'predicate' },
      { text: '不知所措', role: 'complement' },
      { text: '好半天', role: 'adverbial' },
    ],
  ),
  S(
    'h07',
    'hard',
    '在明亮的灯光下，她认真地修改着文章，每一个错别字都被她改得干干净净。',
    [
      { text: '在明亮的灯光下', role: 'adverbial' },
      { text: '她', role: 'subject' },
      { text: '认真地', role: 'adverbial' },
      { text: '修改', role: 'predicate' },
      { text: '文章', role: 'object' },
      { text: '干干净净', role: 'complement' },
    ],
  ),
  S(
    'h08',
    'hard',
    '那些堆在角落里的旧书散发着淡淡的墨香，他忍不住翻开其中一本读了起来。',
    [
      { text: '那些堆在角落里的', role: 'attributive' },
      { text: '旧书', role: 'subject' },
      { text: '散发', role: 'predicate' },
      { text: '淡淡的墨香', role: 'object' },
    ],
  ),
  S(
    'h09',
    'hard',
    '他把书包往肩膀上一甩，快步走出了校门，晚霞把整条街道映得通红。',
    [
      { text: '他', role: 'subject' },
      { text: '把书包', role: 'adverbial' },
      { text: '往肩膀上', role: 'adverbial' },
      { text: '一甩', role: 'predicate' },
      { text: '通红', role: 'complement' },
    ],
  ),
  S(
    'h10',
    'hard',
    '被阳光照耀的湖面闪烁着金色的光斑，渔船缓缓地从远处划了过来。',
    [
      { text: '被阳光照耀的', role: 'attributive' },
      { text: '湖面', role: 'subject' },
      { text: '闪烁', role: 'predicate' },
      { text: '金色的光斑', role: 'object' },
      { text: '缓缓地', role: 'adverbial' },
    ],
  ),
  S(
    'h11',
    'hard',
    '孩子们兴奋地把刚采到的野花插进花瓶，客厅立刻变得鲜艳起来。',
    [
      { text: '孩子们', role: 'subject' },
      { text: '兴奋地', role: 'adverbial' },
      { text: '把刚采到的野花', role: 'adverbial' },
      { text: '插', role: 'predicate' },
      { text: '进花瓶', role: 'complement' },
    ],
  ),
  S(
    'h12',
    'hard',
    '从远方传来的钟声在山谷里久久回荡，放羊的老人停下脚步静静地听着。',
    [
      { text: '从远方传来的', role: 'attributive' },
      { text: '钟声', role: 'subject' },
      { text: '在山谷里', role: 'adverbial' },
      { text: '久久', role: 'adverbial' },
      { text: '回荡', role: 'predicate' },
    ],
  ),
  S(
    'h13',
    'hard',
    '他用颤抖的手把那封信小心翼翼地拆开，信纸上密密麻麻写满了思念的话。',
    [
      { text: '他', role: 'subject' },
      { text: '用颤抖的手', role: 'adverbial' },
      { text: '把那封信', role: 'adverbial' },
      { text: '小心翼翼地', role: 'adverbial' },
      { text: '拆开', role: 'predicate' },
    ],
  ),
  S(
    'h14',
    'hard',
    '覆盖着厚厚积雪的山峰在晨曦中显得格外壮观，登山队决定第二天一早出发。',
    [
      { text: '覆盖着厚厚积雪的', role: 'attributive' },
      { text: '山峰', role: 'subject' },
      { text: '在晨曦中', role: 'adverbial' },
      { text: '显得', role: 'predicate' },
      { text: '格外壮观', role: 'object' },
    ],
  ),
  S(
    'h15',
    'hard',
    '她把房间里的每一件物品都摆放得井井有条，连窗帘也被她整理得服服帖帖。',
    [
      { text: '她', role: 'subject' },
      { text: '把房间里的每一件物品', role: 'adverbial' },
      { text: '都', role: 'adverbial' },
      { text: '摆放', role: 'predicate' },
      { text: '井井有条', role: 'complement' },
    ],
  ),
  S(
    'h16',
    'hard',
    '站在窗前的老人久久凝视着远方的田野，秋风把金黄的稻浪吹得起伏不定。',
    [
      { text: '站在窗前的', role: 'attributive' },
      { text: '老人', role: 'subject' },
      { text: '久久', role: 'adverbial' },
      { text: '凝视', role: 'predicate' },
      { text: '远方的田野', role: 'object' },
      { text: '起伏不定', role: 'complement' },
    ],
  ),
  S(
    'h17',
    'hard',
    '这场突如其来的大雨把行人淋得狼狈不堪，路边的积水很快漫过了鞋面。',
    [
      { text: '这场突如其来的', role: 'attributive' },
      { text: '大雨', role: 'subject' },
      { text: '把行人', role: 'adverbial' },
      { text: '淋', role: 'predicate' },
      { text: '狼狈不堪', role: 'complement' },
    ],
  ),
  S(
    'h18',
    'hard',
    '他在灯下认真地把这份报告修改了三遍，天亮前终于把最后一处错误改掉了。',
    [
      { text: '他', role: 'subject' },
      { text: '在灯下', role: 'adverbial' },
      { text: '认真地', role: 'adverbial' },
      { text: '把这份报告', role: 'adverbial' },
      { text: '修改', role: 'predicate' },
      { text: '三遍', role: 'complement' },
    ],
  ),
  S(
    'h19',
    'hard',
    '飘落的花瓣轻轻地落在清澈的溪水上，小鱼立刻游过来啄了几下。',
    [
      { text: '飘落的', role: 'attributive' },
      { text: '花瓣', role: 'subject' },
      { text: '轻轻地', role: 'adverbial' },
      { text: '落', role: 'predicate' },
      { text: '在清澈的溪水上', role: 'complement' },
    ],
  ),
  S(
    'h20',
    'hard',
    '被掌声包围的获奖者激动得热泪盈眶，他把奖杯高高举过了头顶。',
    [
      { text: '被掌声包围的', role: 'attributive' },
      { text: '获奖者', role: 'subject' },
      { text: '激动', role: 'predicate' },
      { text: '热泪盈眶', role: 'complement' },
      { text: '高高', role: 'adverbial' },
    ],
  ),
  S(
    'h21',
    'hard',
    '老师让我们把课文里的生字抄写三遍，抄完之后还要把词语造句写进本子。',
    [
      { text: '老师', role: 'subject' },
      { text: '让我们', role: 'adverbial' },
      { text: '把课文里的生字', role: 'adverbial' },
      { text: '抄写', role: 'predicate' },
      { text: '三遍', role: 'complement' },
    ],
  ),
  S(
    'h22',
    'hard',
    '在宁静的夜晚，远处偶尔传来几声犬吠，月光把庭院照得如同白昼。',
    [
      { text: '在宁静的夜晚', role: 'adverbial' },
      { text: '远处', role: 'adverbial' },
      { text: '偶尔', role: 'adverbial' },
      { text: '传来', role: 'predicate' },
      { text: '几声犬吠', role: 'object' },
      { text: '如同白昼', role: 'complement' },
    ],
  ),
  S(
    'h23',
    'hard',
    '他把那本破旧的相册小心翼翼地放回抽屉，照片里的笑容仿佛又活了过来。',
    [
      { text: '他', role: 'subject' },
      { text: '把那本破旧的相册', role: 'adverbial' },
      { text: '小心翼翼地', role: 'adverbial' },
      { text: '放', role: 'predicate' },
      { text: '回抽屉', role: 'complement' },
    ],
  ),
  S(
    'h24',
    'hard',
    '挂在墙上的那幅油画把整个客厅映衬得高雅极了，来客都不由得多看了几眼。',
    [
      { text: '挂在墙上的', role: 'attributive' },
      { text: '那幅油画', role: 'subject' },
      { text: '把整个客厅', role: 'adverbial' },
      { text: '映衬', role: 'predicate' },
      { text: '高雅极了', role: 'complement' },
    ],
  ),
  S(
    'h25',
    'hard',
    '经过一夜的大风，院子里的落叶被扫成一堆，清晨的阳光又把湿漉漉的石板晒得发亮。',
    [
      { text: '经过一夜的大风', role: 'adverbial' },
      { text: '院子里的', role: 'attributive' },
      { text: '落叶', role: 'subject' },
      { text: '被扫', role: 'predicate' },
      { text: '成一堆', role: 'complement' },
      { text: '湿漉漉的', role: 'attributive' },
    ],
  ),
  S(
    'h26',
    'hard',
    '她把刚做好的点心端到客人面前，香气立刻在客厅里弥漫开来。',
    [
      { text: '她', role: 'subject' },
      { text: '把刚做好的点心', role: 'adverbial' },
      { text: '端', role: 'predicate' },
      { text: '到客人面前', role: 'complement' },
      { text: '立刻', role: 'adverbial' },
    ],
  ),
  S(
    'h27',
    'hard',
    '在老师的鼓励下，他勇敢地走上了讲台，原先准备好的稿子却被紧张忘得一干二净。',
    [
      { text: '在老师的鼓励下', role: 'adverbial' },
      { text: '他', role: 'subject' },
      { text: '勇敢地', role: 'adverbial' },
      { text: '走', role: 'predicate' },
      { text: '上了讲台', role: 'complement' },
      { text: '一干二净', role: 'complement' },
    ],
  ),
  S(
    'h28',
    'hard',
    '那条蜿蜒的小路通向一座静谧的小村庄，炊烟正从屋顶上袅袅升起。',
    [
      { text: '那条蜿蜒的', role: 'attributive' },
      { text: '小路', role: 'subject' },
      { text: '通向', role: 'predicate' },
      { text: '一座静谧的小村庄', role: 'object' },
      { text: '袅袅', role: 'adverbial' },
    ],
  ),
  S(
    'h29',
    'hard',
    '他被这部感人的电影感动得泣不成声，散场后他还久久不肯离开座位。',
    [
      { text: '他', role: 'subject' },
      { text: '被这部感人的电影', role: 'adverbial' },
      { text: '感动', role: 'predicate' },
      { text: '泣不成声', role: 'complement' },
      { text: '久久', role: 'adverbial' },
    ],
  ),
  S(
    'h30',
    'hard',
    '清晨的薄雾把远处的山峦笼罩得模模糊糊，过了一会儿，太阳才把雾气一点点驱散。',
    [
      { text: '清晨的', role: 'attributive' },
      { text: '薄雾', role: 'subject' },
      { text: '把远处的山峦', role: 'adverbial' },
      { text: '笼罩', role: 'predicate' },
      { text: '模模糊糊', role: 'complement' },
      { text: '一点点', role: 'adverbial' },
    ],
  ),
  S(
    'h31',
    'hard',
    '坐在第一排的同学把黑板上的字看得清清楚楚，后排的同学却不得不踮起脚尖。',
    [
      { text: '坐在第一排的', role: 'attributive' },
      { text: '同学', role: 'subject' },
      { text: '把黑板上的字', role: 'adverbial' },
      { text: '看', role: 'predicate' },
      { text: '清清楚楚', role: 'complement' },
    ],
  ),
  S(
    'h32',
    'hard',
    '一阵清凉的晚风吹散了院子里的闷热，树叶沙沙地响着，像在低声说话。',
    [
      { text: '一阵清凉的', role: 'attributive' },
      { text: '晚风', role: 'subject' },
      { text: '吹', role: 'predicate' },
      { text: '散了', role: 'complement' },
      { text: '院子里的闷热', role: 'object' },
      { text: '沙沙地', role: 'adverbial' },
    ],
  ),
  S(
    'h33',
    'hard',
    '他从书架上小心地取下那本珍贵的古籍，翻开书页时，纸张发出轻微的脆响。',
    [
      { text: '他', role: 'subject' },
      { text: '从书架上', role: 'adverbial' },
      { text: '小心地', role: 'adverbial' },
      { text: '取', role: 'predicate' },
      { text: '下', role: 'complement' },
      { text: '那本珍贵的古籍', role: 'object' },
    ],
  ),
  S(
    'h34',
    'hard',
    '被秋风染黄的银杏叶铺满了整条人行道，行人踩上去发出细碎的沙沙声。',
    [
      { text: '被秋风染黄的', role: 'attributive' },
      { text: '银杏叶', role: 'subject' },
      { text: '铺', role: 'predicate' },
      { text: '满了', role: 'complement' },
      { text: '整条人行道', role: 'object' },
    ],
  ),
  S(
    'h35',
    'hard',
    '在细雨中，撑着伞的行人匆匆赶往地铁站，车窗外的霓虹被雨水拉成模糊的光带。',
    [
      { text: '在细雨中', role: 'adverbial' },
      { text: '撑着伞的', role: 'attributive' },
      { text: '行人', role: 'subject' },
      { text: '匆匆', role: 'adverbial' },
      { text: '赶往', role: 'predicate' },
      { text: '地铁站', role: 'object' },
    ],
  ),
  S(
    'h36',
    'hard',
    '他把昨天没写完的作业又仔细检查了一遍，确认无误后才放进书包。',
    [
      { text: '他', role: 'subject' },
      { text: '把昨天没写完的作业', role: 'adverbial' },
      { text: '又', role: 'adverbial' },
      { text: '仔细', role: 'adverbial' },
      { text: '检查', role: 'predicate' },
      { text: '一遍', role: 'complement' },
    ],
  ),
  S(
    'h37',
    'hard',
    '闪耀着星光的夜空让孩子们看得入了迷，谁也不愿意这么早就回屋睡觉。',
    [
      { text: '闪耀着星光的', role: 'attributive' },
      { text: '夜空', role: 'subject' },
      { text: '让孩子们', role: 'adverbial' },
      { text: '看', role: 'predicate' },
      { text: '入了迷', role: 'complement' },
    ],
  ),
  S(
    'h38',
    'hard',
    '她把从花园里采来的玫瑰插进瓷瓶，娇艳的花瓣上还滚动着晶莹的露珠。',
    [
      { text: '她', role: 'subject' },
      { text: '把从花园里采来的玫瑰', role: 'adverbial' },
      { text: '插', role: 'predicate' },
      { text: '进瓷瓶', role: 'complement' },
      { text: '娇艳的', role: 'attributive' },
    ],
  ),
  S(
    'h39',
    'hard',
    '在同学们的注视下，他沉着地完成了实验，试管里的液体渐渐变成了淡蓝色。',
    [
      { text: '在同学们的注视下', role: 'adverbial' },
      { text: '他', role: 'subject' },
      { text: '沉着地', role: 'adverbial' },
      { text: '完成', role: 'predicate' },
      { text: '实验', role: 'object' },
      { text: '渐渐', role: 'adverbial' },
    ],
  ),
  S(
    'h40',
    'hard',
    '那座建于明代的石桥至今仍横跨在小河上，桥洞下不时有渔船静静驶过。',
    [
      { text: '那座建于明代的', role: 'attributive' },
      { text: '石桥', role: 'subject' },
      { text: '至今', role: 'adverbial' },
      { text: '仍', role: 'adverbial' },
      { text: '横跨', role: 'predicate' },
      { text: '在小河上', role: 'complement' },
    ],
  ),
  S(
    'h41',
    'hard',
    '他被这个出乎意料的结果弄得目瞪口呆，半晌才把惊讶的表情收敛起来。',
    [
      { text: '他', role: 'subject' },
      { text: '被这个出乎意料的结果', role: 'adverbial' },
      { text: '弄', role: 'predicate' },
      { text: '目瞪口呆', role: 'complement' },
      { text: '半晌', role: 'adverbial' },
    ],
  ),
  S(
    'h42',
    'hard',
    '飘着香味的面包刚出炉就被抢购一空，后来的顾客只能失望地摇了摇头。',
    [
      { text: '飘着香味的', role: 'attributive' },
      { text: '面包', role: 'subject' },
      { text: '刚出炉', role: 'adverbial' },
      { text: '就被抢购', role: 'predicate' },
      { text: '一空', role: 'complement' },
      { text: '失望地', role: 'adverbial' },
    ],
  ),
  S(
    'h43',
    'hard',
    '在柔和的琴声中，舞者把动作做得优美极了，观众们屏住呼吸，生怕错过任何一个细节。',
    [
      { text: '在柔和的琴声中', role: 'adverbial' },
      { text: '舞者', role: 'subject' },
      { text: '把动作', role: 'adverbial' },
      { text: '做', role: 'predicate' },
      { text: '优美极了', role: 'complement' },
    ],
  ),
  S(
    'h44',
    'hard',
    '那些写在黑板上的公式被学生抄得整整齐齐，下课铃响时，本子上已经密密麻麻写满了字。',
    [
      { text: '那些写在黑板上的', role: 'attributive' },
      { text: '公式', role: 'subject' },
      { text: '被学生', role: 'adverbial' },
      { text: '抄', role: 'predicate' },
      { text: '整整齐齐', role: 'complement' },
    ],
  ),
  S(
    'h45',
    'hard',
    '他终于把压在心底多年的话说了出来，听的人愣了片刻，随后轻轻点了点头。',
    [
      { text: '他', role: 'subject' },
      { text: '终于', role: 'adverbial' },
      { text: '把压在心底多年的话', role: 'adverbial' },
      { text: '说', role: 'predicate' },
      { text: '出来', role: 'complement' },
    ],
  ),
  S(
    'h46',
    'hard',
    '笼罩着薄雾的湖面倒映出周围的青山，一群白鹭贴着水面低低飞过。',
    [
      { text: '笼罩着薄雾的', role: 'attributive' },
      { text: '湖面', role: 'subject' },
      { text: '倒映', role: 'predicate' },
      { text: '出', role: 'complement' },
      { text: '周围的青山', role: 'object' },
      { text: '低低', role: 'adverbial' },
    ],
  ),
  S(
    'h47',
    'hard',
    '在暴风雨来临之前，渔民们赶紧把船开回港口，岸边的缆绳被他们绑得结结实实。',
    [
      { text: '在暴风雨来临之前', role: 'adverbial' },
      { text: '渔民们', role: 'subject' },
      { text: '赶紧', role: 'adverbial' },
      { text: '把船', role: 'adverbial' },
      { text: '开', role: 'predicate' },
      { text: '回港口', role: 'complement' },
      { text: '结结实实', role: 'complement' },
    ],
  ),
  S(
    'h48',
    'hard',
    '那位来自远方的客人把旅途见闻讲得绘声绘色，听的人仿佛跟着他走遍了千山万水。',
    [
      { text: '那位来自远方的', role: 'attributive' },
      { text: '客人', role: 'subject' },
      { text: '把旅途见闻', role: 'adverbial' },
      { text: '讲', role: 'predicate' },
      { text: '绘声绘色', role: 'complement' },
    ],
  ),
  S(
    'h49',
    'hard',
    '被夕阳染红的云彩把天空装点得绚丽多彩，归巢的鸟群在天边画下一道道弧线。',
    [
      { text: '被夕阳染红的', role: 'attributive' },
      { text: '云彩', role: 'subject' },
      { text: '把天空', role: 'adverbial' },
      { text: '装点', role: 'predicate' },
      { text: '绚丽多彩', role: 'complement' },
    ],
  ),
  S(
    'h50',
    'hard',
    '他在图书馆里安静地把那本厚厚的词典查了个遍，窗外的蝉鸣却一刻也不肯停歇。',
    [
      { text: '他', role: 'subject' },
      { text: '在图书馆里', role: 'adverbial' },
      { text: '安静地', role: 'adverbial' },
      { text: '把那本厚厚的词典', role: 'adverbial' },
      { text: '查', role: 'predicate' },
      { text: '个遍', role: 'complement' },
    ],
  ),
]

export const GRAMMAR_JUDGMENT_BANK: GrammarSentence[] = [...EASY, ...NORMAL, ...HARD]

export const GRAMMAR_JUDGMENT_BANK_COUNTS = {
  easy: EASY.length,
  normal: NORMAL.length,
  hard: HARD.length,
  total: EASY.length + NORMAL.length + HARD.length,
}
