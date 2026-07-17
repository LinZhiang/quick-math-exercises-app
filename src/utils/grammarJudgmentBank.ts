/** 口算·语法判断：句子成分题库（主/谓/宾/定/状/补） */

import { HARD } from './grammarJudgmentBankHard.ts'

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

/** 标点等不计入覆盖率 */
const COVERAGE_SKIP = new Set(
  '，。！？、；： \t,.!?;:()（）【】《》…—""\'\'“”‘’'.split(''),
)

/**
 * 成分对原句的字符覆盖率（忽略标点）。
 * parts 中找不到的文本记入 missingTexts。
 */
export function grammarSentenceCoverage(sentence: GrammarSentence): {
  ratio: number
  uncovered: string
  missingTexts: string[]
} {
  const raw = sentence.sentence
  const covered = new Array(raw.length).fill(false)
  const missingTexts: string[] = []
  for (const p of sentence.parts) {
    const t = String(p.text || '').trim()
    if (!t) continue
    let idx = raw.indexOf(t)
    let placed = false
    while (idx >= 0) {
      let overlap = false
      for (let i = idx; i < idx + t.length; i++) {
        if (covered[i]) {
          overlap = true
          break
        }
      }
      if (!overlap) {
        for (let i = idx; i < idx + t.length; i++) covered[i] = true
        placed = true
        break
      }
      idx = raw.indexOf(t, idx + 1)
    }
    if (!placed) missingTexts.push(t)
  }
  let content = 0
  let hit = 0
  const uncoveredChars: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!
    if (COVERAGE_SKIP.has(ch)) continue
    content += 1
    if (covered[i]) hit += 1
    else uncoveredChars.push(ch)
  }
  return {
    ratio: content ? hit / content : 1,
    uncovered: uncoveredChars.join(''),
    missingTexts,
  }
}

/** 「圈出所有语法」题库最低覆盖率：过低视为漏标，不得出题 */
export const CIRCLE_GRAMMAR_MIN_COVERAGE = 0.92

export function isCircleGrammarBankReady(sentence: GrammarSentence): boolean {
  const c = grammarSentenceCoverage(sentence)
  return c.missingTexts.length === 0 && c.ratio >= CIRCLE_GRAMMAR_MIN_COVERAGE
}

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

/** 普通：每句主谓宾定状补齐全，句式适中 */
const NORMAL: GrammarSentence[] = [
  S('n01', 'normal', '聪明的孩子很快听懂了课文。', [
    { text: '聪明的', role: 'attributive' },
    { text: '孩子', role: 'subject' },
    { text: '很快', role: 'adverbial' },
    { text: '听', role: 'predicate' },
    { text: '懂了', role: 'complement' },
    { text: '课文', role: 'object' },
  ]),
  S('n02', 'normal', '勤劳的蜜蜂整天采满了花蜜。', [
    { text: '勤劳的', role: 'attributive' },
    { text: '蜜蜂', role: 'subject' },
    { text: '整天', role: 'adverbial' },
    { text: '采', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '花蜜', role: 'object' },
  ]),
  S('n03', 'normal', '快乐的小鸟在枝头唱完了歌。', [
    { text: '快乐的', role: 'attributive' },
    { text: '小鸟', role: 'subject' },
    { text: '在枝头', role: 'adverbial' },
    { text: '唱', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '歌', role: 'object' },
  ]),
  S('n04', 'normal', '雪白的兔子飞快吃光了青草。', [
    { text: '雪白的', role: 'attributive' },
    { text: '兔子', role: 'subject' },
    { text: '飞快', role: 'adverbial' },
    { text: '吃', role: 'predicate' },
    { text: '光了', role: 'complement' },
    { text: '青草', role: 'object' },
  ]),
  S('n05', 'normal', '那位老师耐心地讲清了难题。', [
    { text: '那位', role: 'attributive' },
    { text: '老师', role: 'subject' },
    { text: '耐心地', role: 'adverbial' },
    { text: '讲', role: 'predicate' },
    { text: '清了', role: 'complement' },
    { text: '难题', role: 'object' },
  ]),
  S('n06', 'normal', '哥哥认真踢进了一个球。', [
    { text: '哥哥', role: 'subject' },
    { text: '认真', role: 'adverbial' },
    { text: '踢', role: 'predicate' },
    { text: '进了', role: 'complement' },
    { text: '一个', role: 'attributive' },
    { text: '球', role: 'object' },
  ]),
  S('n07', 'normal', '妹妹仔细擦亮了那块玻璃。', [
    { text: '妹妹', role: 'subject' },
    { text: '仔细', role: 'adverbial' },
    { text: '擦', role: 'predicate' },
    { text: '亮了', role: 'complement' },
    { text: '那块', role: 'attributive' },
    { text: '玻璃', role: 'object' },
  ]),
  S('n08', 'normal', '细心的妈妈已经做好了晚饭。', [
    { text: '细心的', role: 'attributive' },
    { text: '妈妈', role: 'subject' },
    { text: '已经', role: 'adverbial' },
    { text: '做', role: 'predicate' },
    { text: '好了', role: 'complement' },
    { text: '晚饭', role: 'object' },
  ]),
  S('n09', 'normal', '可爱的小猫轻轻捉住了老鼠。', [
    { text: '可爱的', role: 'attributive' },
    { text: '小猫', role: 'subject' },
    { text: '轻轻', role: 'adverbial' },
    { text: '捉', role: 'predicate' },
    { text: '住了', role: 'complement' },
    { text: '老鼠', role: 'object' },
  ]),
  S('n10', 'normal', '勇敢的战士迅速攻下了敌军。', [
    { text: '勇敢的', role: 'attributive' },
    { text: '战士', role: 'subject' },
    { text: '迅速', role: 'adverbial' },
    { text: '攻', role: 'predicate' },
    { text: '下了', role: 'complement' },
    { text: '敌军', role: 'object' },
  ]),
  S('n11', 'normal', '弟弟高兴地堆好了一个雪人。', [
    { text: '弟弟', role: 'subject' },
    { text: '高兴地', role: 'adverbial' },
    { text: '堆', role: 'predicate' },
    { text: '好了', role: 'complement' },
    { text: '一个', role: 'attributive' },
    { text: '雪人', role: 'object' },
  ]),
  S('n12', 'normal', '姐姐安静地写完了这篇日记。', [
    { text: '姐姐', role: 'subject' },
    { text: '安静地', role: 'adverbial' },
    { text: '写', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '这篇', role: 'attributive' },
    { text: '日记', role: 'object' },
  ]),
  S('n13', 'normal', '爸爸熟练地修好了那辆自行车。', [
    { text: '爸爸', role: 'subject' },
    { text: '熟练地', role: 'adverbial' },
    { text: '修', role: 'predicate' },
    { text: '好了', role: 'complement' },
    { text: '那辆', role: 'attributive' },
    { text: '自行车', role: 'object' },
  ]),
  S('n14', 'normal', '新鲜的牛奶慢慢倒满了杯子。', [
    { text: '新鲜的', role: 'attributive' },
    { text: '牛奶', role: 'subject' },
    { text: '慢慢', role: 'adverbial' },
    { text: '倒', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '杯子', role: 'object' },
  ]),
  S('n15', 'normal', '绿绿的小草悄悄长满了山坡。', [
    { text: '绿绿的', role: 'attributive' },
    { text: '小草', role: 'subject' },
    { text: '悄悄', role: 'adverbial' },
    { text: '长', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '山坡', role: 'object' },
  ]),
  S('n16', 'normal', '明亮的灯光忽然照亮了房间。', [
    { text: '明亮的', role: 'attributive' },
    { text: '灯光', role: 'subject' },
    { text: '忽然', role: 'adverbial' },
    { text: '照', role: 'predicate' },
    { text: '亮了', role: 'complement' },
    { text: '房间', role: 'object' },
  ]),
  S('n17', 'normal', '忙碌的厨师很快炒好了菜。', [
    { text: '忙碌的', role: 'attributive' },
    { text: '厨师', role: 'subject' },
    { text: '很快', role: 'adverbial' },
    { text: '炒', role: 'predicate' },
    { text: '好了', role: 'complement' },
    { text: '菜', role: 'object' },
  ]),
  S('n18', 'normal', '机灵的猴子一下子摘下了桃子。', [
    { text: '机灵的', role: 'attributive' },
    { text: '猴子', role: 'subject' },
    { text: '一下子', role: 'adverbial' },
    { text: '摘', role: 'predicate' },
    { text: '下了', role: 'complement' },
    { text: '桃子', role: 'object' },
  ]),
  S('n19', 'normal', '热情的同学主动让出了座位。', [
    { text: '热情的', role: 'attributive' },
    { text: '同学', role: 'subject' },
    { text: '主动', role: 'adverbial' },
    { text: '让', role: 'predicate' },
    { text: '出了', role: 'complement' },
    { text: '座位', role: 'object' },
  ]),
  S('n20', 'normal', '诚实的孩子立刻说出了真相。', [
    { text: '诚实的', role: 'attributive' },
    { text: '孩子', role: 'subject' },
    { text: '立刻', role: 'adverbial' },
    { text: '说', role: 'predicate' },
    { text: '出了', role: 'complement' },
    { text: '真相', role: 'object' },
  ]),
  S('n21', 'normal', '小朋友认真读完了一本书。', [
    { text: '小朋友', role: 'subject' },
    { text: '认真', role: 'adverbial' },
    { text: '读', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '一本', role: 'attributive' },
    { text: '书', role: 'object' },
  ]),
  S('n22', 'normal', '农民辛勤种下了一片麦子。', [
    { text: '农民', role: 'subject' },
    { text: '辛勤', role: 'adverbial' },
    { text: '种', role: 'predicate' },
    { text: '下了', role: 'complement' },
    { text: '一片', role: 'attributive' },
    { text: '麦子', role: 'object' },
  ]),
  S('n23', 'normal', '医生仔细检查完了那位病人。', [
    { text: '医生', role: 'subject' },
    { text: '仔细', role: 'adverbial' },
    { text: '检查', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '那位', role: 'attributive' },
    { text: '病人', role: 'object' },
  ]),
  S('n24', 'normal', '警察迅速抓住了那个小偷。', [
    { text: '警察', role: 'subject' },
    { text: '迅速', role: 'adverbial' },
    { text: '抓', role: 'predicate' },
    { text: '住了', role: 'complement' },
    { text: '那个', role: 'attributive' },
    { text: '小偷', role: 'object' },
  ]),
  S('n25', 'normal', '画家慢慢画好了这幅风景。', [
    { text: '画家', role: 'subject' },
    { text: '慢慢', role: 'adverbial' },
    { text: '画', role: 'predicate' },
    { text: '好了', role: 'complement' },
    { text: '这幅', role: 'attributive' },
    { text: '风景', role: 'object' },
  ]),
  S('n26', 'normal', '洁白的雪花轻轻盖满了屋顶。', [
    { text: '洁白的', role: 'attributive' },
    { text: '雪花', role: 'subject' },
    { text: '轻轻', role: 'adverbial' },
    { text: '盖', role: 'predicate' },
    { text: '满了', role: 'complement' },
    { text: '屋顶', role: 'object' },
  ]),
  S('n27', 'normal', '金色的麦浪随风涌起了波浪。', [
    { text: '金色的', role: 'attributive' },
    { text: '麦浪', role: 'subject' },
    { text: '随风', role: 'adverbial' },
    { text: '涌', role: 'predicate' },
    { text: '起了', role: 'complement' },
    { text: '波浪', role: 'object' },
  ]),
  S('n28', 'normal', '清澈的溪水静静流到了远方。', [
    { text: '清澈的', role: 'attributive' },
    { text: '溪水', role: 'subject' },
    { text: '静静', role: 'adverbial' },
    { text: '流', role: 'predicate' },
    { text: '到了', role: 'complement' },
    { text: '远方', role: 'object' },
  ]),
  S('n29', 'normal', '愤怒的海浪猛烈拍碎了礁石。', [
    { text: '愤怒的', role: 'attributive' },
    { text: '海浪', role: 'subject' },
    { text: '猛烈', role: 'adverbial' },
    { text: '拍', role: 'predicate' },
    { text: '碎了', role: 'complement' },
    { text: '礁石', role: 'object' },
  ]),
  S('n30', 'normal', '温柔的春风悄悄吹开了花蕾。', [
    { text: '温柔的', role: 'attributive' },
    { text: '春风', role: 'subject' },
    { text: '悄悄', role: 'adverbial' },
    { text: '吹', role: 'predicate' },
    { text: '开了', role: 'complement' },
    { text: '花蕾', role: 'object' },
  ]),
  S('n31', 'normal', '学生正确地答出了这道问题。', [
    { text: '学生', role: 'subject' },
    { text: '正确地', role: 'adverbial' },
    { text: '答', role: 'predicate' },
    { text: '出了', role: 'complement' },
    { text: '这道', role: 'attributive' },
    { text: '问题', role: 'object' },
  ]),
  S('n32', 'normal', '观众热烈欢迎完了那位演员。', [
    { text: '观众', role: 'subject' },
    { text: '热烈', role: 'adverbial' },
    { text: '欢迎', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '那位', role: 'attributive' },
    { text: '演员', role: 'object' },
  ]),
  S('n33', 'normal', '园丁细心地浇透了整片花圃。', [
    { text: '园丁', role: 'subject' },
    { text: '细心地', role: 'adverbial' },
    { text: '浇', role: 'predicate' },
    { text: '透了', role: 'complement' },
    { text: '整片', role: 'attributive' },
    { text: '花圃', role: 'object' },
  ]),
  S('n34', 'normal', '邮递员准时送完了全部信件。', [
    { text: '邮递员', role: 'subject' },
    { text: '准时', role: 'adverbial' },
    { text: '送', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '全部', role: 'attributive' },
    { text: '信件', role: 'object' },
  ]),
  S('n35', 'normal', '飞行员安全停稳了这架飞机。', [
    { text: '飞行员', role: 'subject' },
    { text: '安全', role: 'adverbial' },
    { text: '停', role: 'predicate' },
    { text: '稳了', role: 'complement' },
    { text: '这架', role: 'attributive' },
    { text: '飞机', role: 'object' },
  ]),
  S('n36', 'normal', '调皮的小狗忽然咬破了鞋子。', [
    { text: '调皮的', role: 'attributive' },
    { text: '小狗', role: 'subject' },
    { text: '忽然', role: 'adverbial' },
    { text: '咬', role: 'predicate' },
    { text: '破了', role: 'complement' },
    { text: '鞋子', role: 'object' },
  ]),
  S('n37', 'normal', '饥饿的小鸟赶快啄完了米粒。', [
    { text: '饥饿的', role: 'attributive' },
    { text: '小鸟', role: 'subject' },
    { text: '赶快', role: 'adverbial' },
    { text: '啄', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '米粒', role: 'object' },
  ]),
  S('n38', 'normal', '忙碌的蚂蚁不停搬完了粮食。', [
    { text: '忙碌的', role: 'attributive' },
    { text: '蚂蚁', role: 'subject' },
    { text: '不停', role: 'adverbial' },
    { text: '搬', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '粮食', role: 'object' },
  ]),
  S('n39', 'normal', '狡猾的狐狸悄悄偷走了鸡。', [
    { text: '狡猾的', role: 'attributive' },
    { text: '狐狸', role: 'subject' },
    { text: '悄悄', role: 'adverbial' },
    { text: '偷', role: 'predicate' },
    { text: '走了', role: 'complement' },
    { text: '鸡', role: 'object' },
  ]),
  S('n40', 'normal', '善良的姑娘轻轻扶起了老人。', [
    { text: '善良的', role: 'attributive' },
    { text: '姑娘', role: 'subject' },
    { text: '轻轻', role: 'adverbial' },
    { text: '扶', role: 'predicate' },
    { text: '起了', role: 'complement' },
    { text: '老人', role: 'object' },
  ]),
  S('n41', 'normal', '工人熟练地焊牢了那根钢梁。', [
    { text: '工人', role: 'subject' },
    { text: '熟练地', role: 'adverbial' },
    { text: '焊', role: 'predicate' },
    { text: '牢了', role: 'complement' },
    { text: '那根', role: 'attributive' },
    { text: '钢梁', role: 'object' },
  ]),
  S('n42', 'normal', '厨师小心地端稳了那碗汤。', [
    { text: '厨师', role: 'subject' },
    { text: '小心地', role: 'adverbial' },
    { text: '端', role: 'predicate' },
    { text: '稳了', role: 'complement' },
    { text: '那碗', role: 'attributive' },
    { text: '汤', role: 'object' },
  ]),
  S('n43', 'normal', '孩子开心地拆开了这份礼物。', [
    { text: '孩子', role: 'subject' },
    { text: '开心地', role: 'adverbial' },
    { text: '拆', role: 'predicate' },
    { text: '开了', role: 'complement' },
    { text: '这份', role: 'attributive' },
    { text: '礼物', role: 'object' },
  ]),
  S('n44', 'normal', '作者认真地改完了整篇稿子。', [
    { text: '作者', role: 'subject' },
    { text: '认真地', role: 'adverbial' },
    { text: '改', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '整篇', role: 'attributive' },
    { text: '稿子', role: 'object' },
  ]),
  S('n45', 'normal', '歌手深情地唱完了这首歌曲。', [
    { text: '歌手', role: 'subject' },
    { text: '深情地', role: 'adverbial' },
    { text: '唱', role: 'predicate' },
    { text: '完了', role: 'complement' },
    { text: '这首', role: 'attributive' },
    { text: '歌曲', role: 'object' },
  ]),
  S('n46', 'normal', '古老的钟楼准时敲响了钟声。', [
    { text: '古老的', role: 'attributive' },
    { text: '钟楼', role: 'subject' },
    { text: '准时', role: 'adverbial' },
    { text: '敲', role: 'predicate' },
    { text: '响了', role: 'complement' },
    { text: '钟声', role: 'object' },
  ]),
  S('n47', 'normal', '巍峨的高山远远挡住了视线。', [
    { text: '巍峨的', role: 'attributive' },
    { text: '高山', role: 'subject' },
    { text: '远远', role: 'adverbial' },
    { text: '挡', role: 'predicate' },
    { text: '住了', role: 'complement' },
    { text: '视线', role: 'object' },
  ]),
  S('n48', 'normal', '广阔的草原渐渐染上了绿色。', [
    { text: '广阔的', role: 'attributive' },
    { text: '草原', role: 'subject' },
    { text: '渐渐', role: 'adverbial' },
    { text: '染', role: 'predicate' },
    { text: '上了', role: 'complement' },
    { text: '绿色', role: 'object' },
  ]),
  S('n49', 'normal', '宁静的夜晚悄悄笼罩住了村庄。', [
    { text: '宁静的', role: 'attributive' },
    { text: '夜晚', role: 'subject' },
    { text: '悄悄', role: 'adverbial' },
    { text: '笼罩', role: 'predicate' },
    { text: '住了', role: 'complement' },
    { text: '村庄', role: 'object' },
  ]),
  S('n50', 'normal', '灿烂的朝阳终于照亮了大地。', [
    { text: '灿烂的', role: 'attributive' },
    { text: '朝阳', role: 'subject' },
    { text: '终于', role: 'adverbial' },
    { text: '照', role: 'predicate' },
    { text: '亮了', role: 'complement' },
    { text: '大地', role: 'object' },
  ]),
]


export const GRAMMAR_JUDGMENT_BANK: GrammarSentence[] = [...EASY, ...NORMAL, ...HARD]

export const GRAMMAR_JUDGMENT_BANK_COUNTS = {
  easy: EASY.length,
  normal: NORMAL.length,
  hard: HARD.length,
  total: EASY.length + NORMAL.length + HARD.length,
}
