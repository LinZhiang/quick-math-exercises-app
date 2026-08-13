/**
 * 快判·舒尔特：先出示内容，再渐显方格后按序点选。
 * 成语/词语：简单 4×4 / 28 秒；普通 6×4 / 33 秒（计分同简单）；复杂 7×5 / 40 秒。
 * 古诗词：简单 4×4 / 95 秒（识记≤13字）；普通 6×4 / 117 秒（≤17字）；高难 7×5 / 138 秒（≥13字）。
 * 生活常识：简单 4×4 / 100 秒（≤13字）；普通 6×4 / 121 秒（≤17字）；复杂 7×5 / 147 秒（≥13字）。
 * 诗词/生活常识按知识点去重（未出优先，出完重置）；全格汉字互不相同。
 */

import { SCHULTE_BANK } from '@/utils/schulteBank'
import type { SchulteBankItem, SchulteWordKind } from '@/utils/schulteBankTypes'
import {
  SCHULTE_LIFE_SENSE_BANK,
  SCHULTE_MEMO_EASY_MAX_CHARS,
  SCHULTE_MEMO_HARD_MIN_CHARS,
  SCHULTE_MEMO_NORMAL_MAX_CHARS,
  schulteLifeSensePool,
  schulteMemoLengthOk,
  type SchulteLifeSenseItem,
} from '@/utils/schulteLifeSenseBank'
import {
  SCHULTE_POEM_BANK,
  schultePoemPoolForMemo,
  type SchultePoemItem,
} from '@/utils/schultePoemBank'

export type SchulteMode =
  | 'schulte-easy'
  | 'schulte-normal'
  | 'schulte-hard'
  | 'schulte-poem-easy'
  | 'schulte-poem-normal'
  | 'schulte-poem-hard'
  | 'schulte-life-easy'
  | 'schulte-life-normal'
  | 'schulte-life-hard'

export type SchulteModeConfig = {
  id: SchulteMode
  label: string
  durationSec: number
  rows: number
  cols: number
  correctDelta: number
  wrongDelta: number
  maxScore: number
  desc: string
  /** 成语词语固定预览；古诗词按字数另算 */
  previewMs?: number
}

/** 成语出示 1.8 秒；词语出示 1 秒 */
export const SCHULTE_IDIOM_PREVIEW_MS = 1800
export const SCHULTE_WORD_PREVIEW_MS = 1000
/** 古诗词：每个汉字 0.35 秒（含作者名中的汉字） */
export const SCHULTE_POEM_PREVIEW_PER_CHAR_MS = 350

/** 答对/答错分值 ×1.5 后四舍五入 */
function scaleSchulteDelta(n: number): number {
  return Math.round(n * 1.5)
}

export const SCHULTE_MODES: SchulteModeConfig[] = [
  {
    id: 'schulte-easy',
    label: '成语/词语 · 简单题',
    durationSec: 28,
    rows: 4,
    cols: 4,
    correctDelta: scaleSchulteDelta(10),
    wrongDelta: scaleSchulteDelta(-20),
    maxScore: 100,
    desc: '28 秒 · 4行×4列 · 去重未出优先 · 成语出示 1.8 秒 / 词语 1 秒 · 对 +15 / 错 -30',
  },
  {
    id: 'schulte-normal',
    label: '成语/词语 · 普通题',
    durationSec: 33,
    rows: 6,
    cols: 4,
    correctDelta: scaleSchulteDelta(10),
    wrongDelta: scaleSchulteDelta(-20),
    maxScore: 100,
    desc: '33 秒 · 6行×4列 · 去重未出优先 · 成语出示 1.8 秒 / 词语 1 秒 · 对 +15 / 错 -30',
  },
  {
    id: 'schulte-hard',
    label: '成语/词语 · 复杂题',
    durationSec: 40,
    rows: 7,
    cols: 5,
    correctDelta: scaleSchulteDelta(15),
    wrongDelta: scaleSchulteDelta(-30),
    maxScore: 100,
    desc: '40 秒 · 7行×5列 · 去重未出优先 · 成语出示 1.8 秒 / 词语 1 秒 · 对 +23 / 错 -45',
  },
]

export const SCHULTE_POEM_MODES: SchulteModeConfig[] = [
  {
    id: 'schulte-poem-easy',
    label: '古诗词 · 简单题',
    durationSec: 95,
    rows: 4,
    cols: 4,
    correctDelta: scaleSchulteDelta(15),
    wrongDelta: scaleSchulteDelta(-30),
    maxScore: 100,
    desc: '1 分 35 秒 · 4行×4列 · 识记≤13字 · 去重未出优先 · 每字 0.35 秒 · 对 +23 / 错 -45',
  },
  {
    id: 'schulte-poem-normal',
    label: '古诗词 · 普通题',
    durationSec: 117,
    rows: 6,
    cols: 4,
    correctDelta: scaleSchulteDelta(15),
    wrongDelta: scaleSchulteDelta(-30),
    maxScore: 100,
    desc: '1 分 57 秒 · 6行×4列 · 识记≤17字 · 去重未出优先 · 每字 0.35 秒 · 对 +23 / 错 -45',
  },
  {
    id: 'schulte-poem-hard',
    label: '古诗词 · 高难题',
    durationSec: 138,
    rows: 7,
    cols: 5,
    correctDelta: scaleSchulteDelta(20),
    wrongDelta: scaleSchulteDelta(-40),
    maxScore: 100,
    desc: `2 分 18 秒 · 7行×5列 · 识记≥${SCHULTE_MEMO_HARD_MIN_CHARS}字 · 去重未出优先 · 每字 0.35 秒 · 对 +30 / 错 -60`,
  },
]

/** 生活常识：规则对齐古诗词三档；内容难度对齐原生活常识简单/普通/复杂 */
export const SCHULTE_LIFE_MODES: SchulteModeConfig[] = [
  {
    id: 'schulte-life-easy',
    label: '生活常识 · 简单题',
    durationSec: 100,
    rows: 4,
    cols: 4,
    correctDelta: scaleSchulteDelta(15),
    wrongDelta: scaleSchulteDelta(-30),
    maxScore: 100,
    desc: `1 分 40 秒 · 4行×4列 · 识记≤${SCHULTE_MEMO_EASY_MAX_CHARS}字 · 去重未出优先 · 每字 0.35 秒 · 对 +23 / 错 -45`,
  },
  {
    id: 'schulte-life-normal',
    label: '生活常识 · 普通题',
    durationSec: 121,
    rows: 6,
    cols: 4,
    correctDelta: scaleSchulteDelta(15),
    wrongDelta: scaleSchulteDelta(-30),
    maxScore: 100,
    desc: `2 分 1 秒 · 6行×4列 · 识记≤${SCHULTE_MEMO_NORMAL_MAX_CHARS}字 · 去重未出优先 · 每字 0.35 秒 · 对 +23 / 错 -45`,
  },
  {
    id: 'schulte-life-hard',
    label: '生活常识 · 复杂题',
    durationSec: 147,
    rows: 7,
    cols: 5,
    correctDelta: scaleSchulteDelta(20),
    wrongDelta: scaleSchulteDelta(-40),
    maxScore: 100,
    desc: `2 分 27 秒 · 7行×5列 · 识记≥${SCHULTE_MEMO_HARD_MIN_CHARS}字 · 去重未出优先 · 每字 0.35 秒 · 对 +30 / 错 -60`,
  },
]

export const ALL_SCHULTE_MODES: SchulteModeConfig[] = [
  ...SCHULTE_MODES,
  ...SCHULTE_POEM_MODES,
  ...SCHULTE_LIFE_MODES,
]

export type SchulteCell = {
  id: number
  char: string
  /** 目标字序（0-based）；干扰项为 null */
  orderIndex: number | null
}

export type SchulteQuestion = {
  id: number
  key: string
  kind: SchulteWordKind
  /** 点选目标串（无标点） */
  word: string
  /** 预览区展示文案（诗词含标点与作者） */
  displayText: string
  /** 本题预览毫秒 */
  previewMs: number
  meaning: string
  chars: string[]
  rows: number
  cols: number
  cells: SchulteCell[]
  expression: string
  correctAnswer: string
  explanation: string
  /** 诗词篇目 */
  poemTitle?: string
  author?: string
}

const USED_KEYS_STORAGE = 'mental-schulte-used-keys-v4'

type UsedBucket =
  | 'easy'
  | 'normal'
  | 'hard'
  | 'poemEasy'
  | 'poemNormal'
  | 'poemHard'
  | 'lifeEasy'
  | 'lifeNormal'
  | 'lifeHard'
type UsedMap = Record<UsedBucket, string[]>

function emptyUsedMap(): UsedMap {
  return {
    easy: [],
    normal: [],
    hard: [],
    poemEasy: [],
    poemNormal: [],
    poemHard: [],
    lifeEasy: [],
    lifeNormal: [],
    lifeHard: [],
  }
}

function normalizeKey(key: string): string {
  return key.trim().replace(/\s+/g, '')
}

function readUsedMap(): UsedMap {
  try {
    const raw = localStorage.getItem(USED_KEYS_STORAGE)
    if (!raw) return emptyUsedMap()
    const parsed = JSON.parse(raw) as Partial<UsedMap>
    const out = emptyUsedMap()
    for (const k of Object.keys(out) as UsedBucket[]) {
      if (Array.isArray(parsed[k])) {
        out[k] = parsed[k]!
          .map((t) => (typeof t === 'string' ? normalizeKey(t) : ''))
          .filter(Boolean)
      }
    }
    return out
  } catch {
    return emptyUsedMap()
  }
}

function writeUsedMap(map: UsedMap) {
  try {
    localStorage.setItem(USED_KEYS_STORAGE, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function usedBucket(mode: SchulteMode): UsedBucket {
  if (mode === 'schulte-normal') return 'normal'
  if (mode === 'schulte-hard') return 'hard'
  if (mode === 'schulte-poem-easy') return 'poemEasy'
  if (mode === 'schulte-poem-normal') return 'poemNormal'
  if (mode === 'schulte-poem-hard') return 'poemHard'
  if (mode === 'schulte-life-easy') return 'lifeEasy'
  if (mode === 'schulte-life-normal') return 'lifeNormal'
  if (mode === 'schulte-life-hard') return 'lifeHard'
  return 'easy'
}

function markUsedKey(mode: SchulteMode, key: string) {
  const k = normalizeKey(key)
  if (!k) return
  const map = readUsedMap()
  const bucket = usedBucket(mode)
  const merged = map[bucket].filter((x) => x !== k)
  merged.push(k)
  map[bucket] = merged
  writeUsedMap(map)
}

export function clearSchulteUsedKeys(mode?: SchulteMode) {
  if (!mode) {
    writeUsedMap(emptyUsedMap())
    return
  }
  const map = readUsedMap()
  map[usedBucket(mode)] = []
  writeUsedMap(map)
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

function pickOne<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

/** 形近 / 易混字组（公考识记向，去重合并；干扰优先从此抽取） */
const SIMILAR_GROUPS: string[] = [
  '己已巳',
  '戍戌戊戎',
  '未末本术',
  '日曰目且',
  '人入八',
  '土士干千',
  '杨扬场伤汤',
  '清晴情请',
  '辨辩辫瓣',
  '像象橡相',
  '拆折析诉忻',
  '刺剌辣赖策',
  '茶荼',
  '菅管',
  '粱梁',
  '盲肓',
  '徒徙',
  '暗黯谙',
  '欧殴讴',
  '竞竟境镜',
  '侯候喉猴',
  '厉励历沥砺',
  '籍藉',
  '暑署曙',
  '载裁栽戴带',
  '祟崇',
  '毫豪',
  '蓝篮监',
  '幕墓慕募暮',
  '宵霄',
  '毋母每悔海',
  '叨叼',
  '炙灸',
  '肄肆',
  '羸嬴赢盈',
  '唯惟维',
  '即既暨',
  '度渡镀踱',
  '坐座挫',
  '做作',
  '再在',
  '的地得',
  '需须',
  '反应映',
  '权利力厉',
  '截止至',
  '制定订钉',
  '凑奏',
  '防妨访仿',
  '坚艰',
  '合和河何',
  '纪记计忌',
  '练炼恋',
  '查察擦',
  '长常尝偿',
  '部布怖',
  '绝决诀抉',
  '贡供拱',
  '佳嘉加',
  '叠迭',
  '份分芬粉',
  '幅副付附符',
  '燥躁澡藻噪',
  '泄泻',
  '暄喧渲',
  '诡鬼瑰',
  '卑碑俾',
  '讳违纬韦',
  '诣指脂旨',
  '瞻赡',
  '戮戳',
  '掣制',
  '采彩菜睬',
  '密蜜秘泌',
  '幻幼幽',
  '戈弋',
  '育胃',
  '冒昌',
  '冒帽瑁',
  '哀衷',
  '哀爱受',
  '哀衰',
  '衰衷',
  '哀衰衷',
  '班斑',
  '般搬磐',
  '畔判',
  '畔叛判',
  '拌绊伴',
  '璧壁',
  '壁璧辟避',
  '蔽弊敝',
  '敝敞',
  '敝敞蔽',
  '砭贬眨',
  '贬砭乏',
  '辩辨辫',
  '濒频',
  '博搏膊薄',
  '薄簿',
  '膊搏博',
  '沧苍',
  '沧苍舱',
  '仓沧苍伦',
  '恻测侧',
  '侧测厕',
  '蹭曾增',
  '曾增憎赠',
  '茬槎',
  '察擦',
  '谄陷',
  '谄陷馅',
  '畅怅',
  '嗔瞋',
  '瞋嗔真',
  '骋聘',
  '弛驰',
  '弛驰池',
  '敕辣',
  '憧幢',
  '忡忠',
  '惆绸稠',
  '畴筹踌',
  '绌拙',
  '绌黜',
  '啜缀',
  '辍掇',
  '辍缀啜',
  '绰焯',
  '疵庇庀',
  '伺司词',
  '猝粹碎',
  '粹碎萃',
  '淬悴',
  '沓杳',
  '沓踏蹋',
  '殆怠迨',
  '殚惮',
  '殚惮弹',
  '殚惮单',
  '耽虎',
  '诋底',
  '谛啼',
  '缔谛蒂',
  '掂惦',
  '惦淀绽',
  '玷沾粘',
  '惦踮',
  '凋雕调',
  '凋调',
  '牒谍喋',
  '牒碟蝶',
  '叮盯钉订',
  '锭绽淀',
  '咚冬',
  '恫洞胴',
  '陡徒',
  '睹赌堵',
  '妒护沪',
  '踱度渡',
  '惰坠堕',
  '讹叱',
  '厄呃',
  '遏谒揭',
  '愕腭谔',
  '繁烦',
  '凡帆矾',
  '藩蕃',
  '绯斐',
  '诽啡',
  '悱斐',
  '氛汾纷',
  '忿愤',
  '俸奉捧',
  '缝逢',
  '孚俘浮',
  '芙扶',
  '俯腑',
  '付附咐符',
  '赋斌',
  '腹复覆',
  '缚搏膊',
  '尬介',
  '丐句',
  '溉既',
  '尴监',
  '岗冈刚纲',
  '皋高',
  '诰浩皓',
  '戈弋或',
  '亘恒桓',
  '躬恭拱',
  '沽估咕',
  '诂古',
  '蛊皿',
  '鹄鹤',
  '汩汨',
  '汩汨骨',
  '诡鬼跪',
  '辊滚',
  '聒刮括',
  '骇该',
  '酣甜',
  '悍捍焊',
  '颔颌',
  '瀚翰',
  '呵诃',
  '阂核劾',
  '涸固',
  '阖合盒',
  '亨享烹',
  '弘宏',
  '泓弘',
  '侯候喉',
  '囫勿',
  '狐弧孤',
  '瑚胡湖',
  '怙估',
  '哗华桦',
  '猾滑',
  '桓恒',
  '涣焕换',
  '恍晃幌',
  '诙恢灰',
  '卉奔',
  '讳纬韦',
  '荟绘烩',
  '秽岁',
  '荤浑',
  '诨浑',
  '豁害',
  '讥饥肌',
  '玑几机',
  '畸倚',
  '箕其',
  '稽诣',
  '戟戈',
  '瘠脊',
  '寂叔',
  '夹浃峡',
  '戛嘎',
  '稼家',
  '奸歼纤',
  '坚肾',
  '间简涧',
  '茧蚕',
  '俭险检',
  '荐存',
  '贱溅践',
  '鉴监',
  '键健腱',
  '槛滥',
  '僭潜',
  '疆僵缰',
  '绛降',
  '浇绕挠',
  '矫骄轿',
  '皎佼',
  '皎交',
  '窖窑',
  '嗟差',
  '孑孓',
  '讦干',
  '诘洁结',
  '芥介界',
  '戒戎',
  '诫械戒',
  '矜今',
  '烬尽',
  '菁青',
  '阱井',
  '胫径',
  '窘君',
  '纠赳',
  '啾秋',
  '柩木',
  '咎各',
  '疽且',
  '沮诅咀',
  '矩柜',
  '龃齿',
  '倨据',
  '眷卷券',
  '诀抉决',
  '倔崛掘',
  '崛掘堀',
  '峻俊竣骏',
  '竣俊骏',
  '咔卡',
  '揩皆',
  '铠凯恺',
  '侃况',
  '勘堪戡',
  '瞰敢',
  '亢吭抗',
  '考拷烤',
  '苛荷',
  '珂可',
  '磕瞌嗑',
  '恪格络',
  '氪克',
  '垦恳',
  '铿坚',
  '抠枢',
  '叩扣',
  '绔袴夸',
  '垮挎跨',
  '脍侩',
  '宽完',
  '诓框眶',
  '诓狂',
  '旷圹纩',
  '窥规',
  '葵癸',
  '匮馈',
  '喟渭',
  '昆琨锟',
  '廓郭',
  '腊蜡猎',
  '辣剌',
  '阑澜',
  '揽缆榄',
  '琅浪狼',
  '唠捞涝',
  '涝捞劳',
  '羸嬴赢',
  '蕾雷',
  '磊石',
  '肋胁',
  '棱凌陵',
  '楞愣',
  '俚理狸',
  '莅位',
  '栗票',
  '砾烁',
  '痢利俐',
  '詈骂',
  '廉谦',
  '镰廉',
  '敛剑',
  '殓检',
  '踉跟',
  '缭撩僚',
  '寥廖',
  '蓼羽',
  '瞭缭僚',
  '咧烈裂',
  '趔趄',
  '临监',
  '凛禀',
  '吝各',
  '赁任',
  '伶拎岭',
  '囹令',
  '泠冷',
  '玲令铃',
  '瓴令',
  '翎令',
  '聆铃玲',
  '菱凌陵',
  '零令铃',
  '领岭',
  '溜遛',
  '琉硫',
  '绺咎',
  '镂楼',
  '赂路洛',
  '麓鹿',
  '孪亦',
  '峦恋',
  '挛孪',
  '銮恋',
  '抡伦沦',
  '囵仓',
  '纶伦沦',
  '萝罗',
  '逻锣',
  '骡螺',
  '裸果',
  '洛落络',
  '珞洛落',
  '缕偻',
  '闾吕',
  '榈闾',
  '履复',
  '虑虚',
  '率摔蟀',
  '绿氯',
  '孪峦',
  // —— 补强：公考常考形近/音近易混（规范汉字，无错字）——
  '账帐胀',
  '赃脏臧',
  '赝膺鹰',
  '佩配珮',
  '废费肺',
  '瞻赡蟾',
  '缀辍啜',
  '绌拙黜',
  '止至致',
  '反返',
  '映应影',
  '截接捷',
  '恬括刮',
  '歉欠谦',
  '宵消销霄',
  '采彩睬踩菜',
  '密蜜秘宓',
  '燥躁噪澡藻',
  '喧暄渲楦',
  '厉励砺疠沥',
  '竞竟境镜兢',
  '侯候猴喉',
  '暑署曙薯',
  '载裁栽戴带',
  '毫豪壕嚎',
  '蓝篮滥槛',
  '幕墓慕募暮',
  '羸嬴赢瀛',
  '唯惟维帷',
  '即既暨',
  '度渡镀踱',
  '坐座挫锉',
  '做作昨',
  '需须',
  '辨辩辫瓣',
  '梁粱',
  '拆折析诉',
  '刺剌辣赖',
  '壁璧辟避',
  '班斑',
  '畔叛判拌',
  '博搏膊薄',
  '沧苍舱仓',
  '恻测侧厕',
  '曾增憎赠',
  '谄陷馅',
  '嗔瞋',
  '驰弛池',
  '沓杳',
  '殆怠迨',
  '殚惮弹',
  '诋谛缔蒂',
  '掂惦踮',
  '玷沾粘',
  '凋雕调',
  '牒谍蝶碟',
  '锭淀绽',
  '陡徒',
  '睹赌堵',
  '妒护沪',
  '堕坠惰',
  '遏谒揭竭',
  '愕腭谔',
  '繁烦',
  '绯诽啡',
  '忿愤',
  '俸奉捧',
  '孚俘浮',
  '俯腑',
  '付附咐符',
  '赋复覆腹',
  '岗纲刚钢',
  '诰浩皓',
  '戈弋戟',
  '亘恒桓垣',
  '沽估咕诂',
  '汩汨',
  '悍捍焊',
  '颔颌',
  '瀚翰',
  '阂核劾',
  '亨享烹',
  '弘宏泓',
  '狐孤弧',
  '怙估',
  '哗华桦',
  '猾滑',
  '涣焕换唤',
  '恍晃幌',
  '诙恢灰',
  '荟绘烩',
  '讥饥肌',
  '奸歼纤',
  '俭险检捡',
  '贱溅践',
  '键健腱',
  '槛滥',
  '僭潜',
  '疆僵缰',
  '矫骄轿',
  '皎佼',
  '窖窑',
  '孑孓',
  '诘洁结',
  '戒诫械',
  '阱井',
  '胫径经',
  '纠赳',
  '沮咀诅',
  '眷卷券',
  '倔崛掘',
  '峻俊骏竣',
  '铠凯恺',
  '勘堪戡',
  '亢吭抗炕',
  '磕瞌嗑',
  '垦恳',
  '抠叩扣',
  '挎跨垮胯',
  '脍侩',
  '诓眶框筐',
  '旷圹',
  '窥规',
  '匮馈',
  '廓郭',
  '腊蜡猎',
  '阑澜',
  '揽缆榄览',
  '涝捞劳',
  '棱凌陵',
  '俚狸理',
  '砾烁',
  '痢俐利',
  '敛殓',
  '缭撩僚燎',
  '寥廖',
  '凛禀',
  '囹泠玲',
  '瓴翎聆铃',
  '琉硫',
  '赂路洛络',
  '峦挛銮孪',
  '纶伦沦抡',
  '萝逻锣箩',
  '骡螺裸',
  '珞洛落',
  '缕偻',
  '闾榈吕侣',
  '履复',
  '率摔蟀',
  '绿氯',
  '权利力厉',
  '反应映应',
  '截止至止',
  '制订定订',
  '的地得',
  '再在',
  '荼茶搽',
  '菅管',
  '盲肓',
  '徒徙',
  '祟崇',
  '炙灸',
  '籍藉',
  '戮戳',

]

/** 偏旁相近 / 公考易错汉字兜底池（偏形近，避免过简字） */
const FALLBACK_POOL =
  '戌戍戊戎己巳已拆折析菅管茶荼羸嬴赢籍藉瞻赡炙灸肄肆崇祟侯候竞竟' +
  '厉励历戴带坐座做作即既度渡须需绝决贡供佳嘉叠迭幅副燥躁暄喧诡鬼' +
  '讳违诣指掣制查察合和纪记练炼防妨制定订截止至权利力反应映' +
  '辨辩辫瓣梁粱盲肓徒徙暗黯唯惟维幕墓慕募宵霄暑署蓝篮毫豪' +
  '刺剌辣赖欧殴叨叼毋母密蜜秘采彩菜泄泻卑碑赢盈凑奏坚艰长常部布' +
  '璧壁辟蔽弊敝贬砭博搏膊沧苍恻测曾增谄陷敞敝嗔瞋驰弛辍缀粹碎' +
  '殆怠殚惮诋谛掂惦凋雕牒谍锭陡睹妒踱堕惰遏愕繁妨绯诽忿俸孚俘俯' +
  '赋缚尬溉岗纲诰戈亘躬垢沽汩骇酣悍颔瀚呵阂涸亨弘泓囫狐怙哗猾桓' +
  '涣肓恍诙卉荟秽荤讥畸箕稽戟瘠籍稼奸歼茧俭荐贱鉴键槛僭疆绛矫皎' +
  '窖嗟孑诘芥戒矜烬阱胫窘纠疚咎疽沮矩龃倨眷诀倔崛峻竣铠慨勘瞰亢' +
  '磕恪垦铿抠叩挎脍诓眶旷窥匮喟廓腊阑揽琅涝羸蕾磊肋棱俚莅栗砾痢' +
  '廉敛殓踉缭寥瞭趔凛吝赁囹泠玲瓴翎聆菱溜琉绺镂赂麓峦挛銮囵纶萝' +
  '逻骡裸珞缕闾榈履率绿账帐胀赃脏臧赝膺鹰佩配珮废费肺缀辍啜绌拙黜' +
  '止至致反返映应影截接捷恬括刮歉欠谦宵消销霄采彩睬踩燥躁噪澡喧暄渲' +
  '竞竟境镜兢侯候猴喉暑署曙薯毫豪壕嚎蓝篮滥槛羸嬴赢瀛唯惟维帷'

/** 字 → 所属形近组索引，加速同组判断（组内自动去重，忽略不足 2 字的脏组） */
const CHAR_TO_GROUPS: Map<string, number[]> = (() => {
  const map = new Map<string, number[]>()
  SIMILAR_GROUPS.forEach((g, gi) => {
    const uniq = [
      ...new Set(Array.from(g.normalize('NFC')).filter((c) => /^[\u4e00-\u9fff]$/.test(c))),
    ]
    if (uniq.length < 2) return
    for (const c of uniq) {
      const arr = map.get(c)
      if (arr) arr.push(gi)
      else map.set(c, [gi])
    }
  })
  return map
})()

function normalizeHanChar(c: string): string {
  return c.normalize('NFC')
}

function similarFor(ch: string, exclude: Set<string>): string[] {
  const n = normalizeHanChar(ch)
  const out: string[] = []
  const seen = new Set<string>()
  const groups = CHAR_TO_GROUPS.get(n)
  if (!groups) return out
  for (const gi of groups) {
    const g = SIMILAR_GROUPS[gi]!
    const members = [
      ...new Set(Array.from(g.normalize('NFC')).filter((c) => /^[\u4e00-\u9fff]$/.test(c))),
    ]
    if (members.length < 2) continue
    for (const c of members) {
      if (c === n || exclude.has(c) || seen.has(c)) continue
      seen.add(c)
      out.push(c)
    }
  }
  return out
}

function inSameSimilarGroup(a: string, b: string): boolean {
  const na = normalizeHanChar(a)
  const nb = normalizeHanChar(b)
  if (na === nb) return false
  const ga = CHAR_TO_GROUPS.get(na)
  const gb = CHAR_TO_GROUPS.get(nb)
  if (!ga || !gb) return false
  for (const i of ga) {
    if (gb.includes(i)) return true
  }
  return false
}

function hasUniqueChars(chars: readonly string[]): boolean {
  const norm = chars.map(normalizeHanChar)
  return new Set(norm).size === norm.length
}

/** 与目标同现于其它词条的汉字（语境干扰，仍禁止与目标/已选重复） */
function contextualChars(targetChars: string[], exclude: Set<string>): string[] {
  const targetSet = new Set(targetChars.map(normalizeHanChar))
  const scored = new Map<string, number>()
  const bump = (raw: string, w = 1) => {
    const c = normalizeHanChar(raw)
    if (!c || targetSet.has(c) || exclude.has(c)) return
    scored.set(c, (scored.get(c) ?? 0) + w)
  }
  for (const it of SCHULTE_BANK) {
    const chars = Array.from(it.word).map(normalizeHanChar)
    if (!chars.some((c) => targetSet.has(c))) continue
    for (const c of chars) bump(c, 3)
  }
  for (const it of SCHULTE_POEM_BANK) {
    if (!it.chars.some((c) => targetSet.has(normalizeHanChar(c)))) continue
    for (const c of it.chars) bump(c, 2)
  }
  for (const it of SCHULTE_LIFE_SENSE_BANK) {
    if (!it.chars.some((c) => targetSet.has(normalizeHanChar(c)))) continue
    for (const c of it.chars) bump(c, 2)
  }
  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([c]) => c)
}

/** 大容量互异汉字池，专供补足干扰且永不与已用字冲突 */
function buildFillerPool(): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (raw: string) => {
    for (const ch of Array.from(raw.normalize('NFC'))) {
      if (!/^[\u4e00-\u9fff]$/.test(ch) || seen.has(ch)) continue
      seen.add(ch)
      out.push(ch)
    }
  }
  push(FALLBACK_POOL)
  push(
    '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳' +
      '云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李奈菜重芥姜' +
      '海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐' +
      '吊民伐罪周发殷汤坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王' +
      '鸣凤在树白驹食场化被草木赖及万方盖此身发四大五常恭惟鞠养岂敢毁伤' +
      '女慕贞洁男效才良知过必改得能莫忘罔谈彼短靡恃己长信使可覆器欲难量' +
      '墨悲丝染诗赞羔羊景行维贤克念作圣德建名立形端表正空谷传声虚堂习听' +
      '祸因恶积福缘善庆尺璧非宝寸阴是竞资父事君曰严与敬孝当竭力忠则尽命',
  )
  // 常用汉字区再扫一段，确保格子再大也能补足
  for (let code = 0x4e00; code <= 0x4e00 + 1200 && out.length < 1800; code++) {
    push(String.fromCodePoint(code))
  }
  return out
}

const FILLER_POOL = buildFillerPool()

/** 题库汉字全集（模块级缓存） */
const BANK_CHAR_POOL: string[] = [
  ...new Set([
    ...SCHULTE_BANK.flatMap((it) => Array.from(it.word).map((c) => c.normalize('NFC'))),
    ...SCHULTE_POEM_BANK.flatMap((it) => it.chars.map((c) => c.normalize('NFC'))),
    ...SCHULTE_LIFE_SENSE_BANK.flatMap((it) => it.chars.map((c) => c.normalize('NFC'))),
  ]),
]

function pickDistractors(need: number, targetChars: string[]): string[] {
  const exclude = new Set(targetChars.map(normalizeHanChar))
  const bag: string[] = []

  const pushUnique = (raw: string): boolean => {
    const c = normalizeHanChar(raw)
    if (!c || !/^[\u4e00-\u9fff]$/.test(c)) return false
    if (bag.length >= need) return false
    if (exclude.has(c)) return false
    bag.push(c)
    exclude.add(c)
    return true
  }

  // 1) 多轮优先填形近/易混字（加重轮次，尽量塞满同组干扰）
  for (let round = 0; round < 6 && bag.length < need; round++) {
    for (const ch of shuffle([...targetChars])) {
      for (const s of shuffle(similarFor(ch, exclude))) {
        if (bag.length >= need) break
        pushUnique(s)
      }
    }
  }

  // 2) 语境干扰
  for (const c of shuffle(contextualChars(targetChars, exclude))) {
    if (bag.length >= need) break
    pushUnique(c)
  }

  // 3) 题库字：先收集目标的全部形近字，再筛题库
  const targetSimilar = new Set<string>()
  for (const t of targetChars) {
    for (const s of similarFor(t, exclude)) targetSimilar.add(s)
  }
  const bankSimilar = shuffle(BANK_CHAR_POOL.filter((c) => targetSimilar.has(c) && !exclude.has(c)))
  const bankRest = shuffle(BANK_CHAR_POOL.filter((c) => !exclude.has(c) && !targetSimilar.has(c)))
  for (const c of [...bankSimilar, ...bankRest]) {
    if (bag.length >= need) break
    pushUnique(c)
  }

  // 4) 形近兜底池
  for (const c of shuffle(Array.from(new Set(Array.from(FALLBACK_POOL).map(normalizeHanChar))))) {
    if (bag.length >= need) break
    pushUnique(c)
  }

  // 5) 大容量填充池
  for (const c of FILLER_POOL) {
    if (bag.length >= need) break
    pushUnique(c)
  }
  if (bag.length < need) {
    const offset = randInt(0, Math.max(0, FILLER_POOL.length - 1))
    for (let i = 0; i < FILLER_POOL.length && bag.length < need; i++) {
      pushUnique(FILLER_POOL[(offset + i) % FILLER_POOL.length]!)
    }
  }

  if (bag.length < need) {
    throw new Error(`干扰字不足：需要 ${need}，仅得 ${bag.length}`)
  }
  if (new Set(bag).size !== bag.length) {
    throw new Error('干扰字自身出现重复')
  }
  const targetSet = new Set(targetChars.map(normalizeHanChar))
  if (bag.some((c) => targetSet.has(c))) {
    throw new Error('干扰字与目标字冲突')
  }

  return bag.slice(0, need)
}

function pickWordItem(mode: SchulteMode, avoidFingerprints: Set<string>): SchulteBankItem {
  const bucket = usedBucket(mode)
  const used = new Set(readUsedMap()[bucket])
  const pool = SCHULTE_BANK.filter((it) => {
    const chars = Array.from(it.word).map(normalizeHanChar)
    if (!hasUniqueChars(chars)) return false
    const fp = `schulte:${it.key}`
    if (avoidFingerprints.has(fp)) return false
    return true
  })
  if (!pool.length) {
    throw new Error('成语/词语舒尔特题库为空（无可用不重复字词条）')
  }
  const fresh = pool.filter((it) => !used.has(normalizeKey(it.key)))
  let chosen: SchulteBankItem
  if (fresh.length > 0) {
    chosen = pickOne(fresh)
  } else {
    const map = readUsedMap()
    map[bucket] = []
    writeUsedMap(map)
    chosen = pickOne(pool)
  }
  markUsedKey(mode, chosen.key)
  return chosen
}

function pickPoemItem(mode: SchulteMode, avoidFingerprints: Set<string>): SchultePoemItem {
  const bucket = usedBucket(mode)
  const used = new Set(readUsedMap()[bucket])
  const cfg = getSchulteModeConfig(mode)
  const maxChars = cfg.rows * cfg.cols - 1
  const memoDiff = lifeDifficultyForMode(mode)
  const pool = schultePoemPoolForMemo(memoDiff).filter((it) => {
    const chars = it.chars.map(normalizeHanChar)
    if (!hasUniqueChars(chars)) return false
    if (chars.length > maxChars) return false
    if (!schulteMemoLengthOk(memoDiff, chars.length)) return false
    const fp = `schulte:${it.key}`
    if (avoidFingerprints.has(fp)) return false
    return true
  })
  if (!pool.length) {
    throw new Error('古诗词舒尔特题库为空（无可用字数带内不重复字诗句）')
  }
  const fresh = pool.filter((it) => !used.has(normalizeKey(it.knowledgeKey)))
  let chosen: SchultePoemItem
  if (fresh.length > 0) {
    chosen = pickOne(fresh)
  } else {
    const map = readUsedMap()
    map[bucket] = []
    writeUsedMap(map)
    chosen = pickOne(pool)
  }
  markUsedKey(mode, chosen.knowledgeKey)
  return chosen
}

function lifeDifficultyForMode(mode: SchulteMode): 'easy' | 'normal' | 'hard' {
  if (
    mode === 'schulte-life-normal' ||
    mode === 'schulte-poem-normal' ||
    mode === 'schulte-normal'
  ) {
    return 'normal'
  }
  if (mode === 'schulte-life-hard' || mode === 'schulte-poem-hard' || mode === 'schulte-hard') {
    return 'hard'
  }
  return 'easy'
}

function pickLifeItem(mode: SchulteMode, avoidFingerprints: Set<string>): SchulteLifeSenseItem {
  const bucket = usedBucket(mode)
  const used = new Set(readUsedMap()[bucket])
  const cfg = getSchulteModeConfig(mode)
  const maxChars = cfg.rows * cfg.cols - 1
  const difficulty = lifeDifficultyForMode(mode)
  const pool = schulteLifeSensePool(difficulty).filter((it) => {
    const chars = it.chars.map(normalizeHanChar)
    if (!hasUniqueChars(chars)) return false
    if (chars.length > maxChars) return false
    if (!schulteMemoLengthOk(difficulty, chars.length)) return false
    const fp = `schulte:${it.key}`
    if (avoidFingerprints.has(fp)) return false
    return true
  })
  if (!pool.length) {
    throw new Error('生活常识舒尔特题库为空（无可用字数带内不重复字陈述句）')
  }
  const fresh = pool.filter((it) => !used.has(normalizeKey(it.knowledgeKey)))
  let chosen: SchulteLifeSenseItem
  if (fresh.length > 0) {
    chosen = pickOne(fresh)
  } else {
    const map = readUsedMap()
    map[bucket] = []
    writeUsedMap(map)
    chosen = pickOne(pool)
  }
  markUsedKey(mode, chosen.knowledgeKey)
  return chosen
}

function buildCellsFromChars(chars: string[], rows: number, cols: number): SchulteCell[] {
  const normalized = chars.map(normalizeHanChar)
  const total = rows * cols
  if (!hasUniqueChars(normalized)) {
    throw new Error(`目标字序列存在重复字：${normalized.join('')}`)
  }
  if (normalized.length >= total) {
    throw new Error(`字数(${normalized.length})超过格子数(${total})`)
  }
  const distractors = pickDistractors(total - normalized.length, normalized)
  const allChars = [...normalized, ...distractors]
  if (new Set(allChars).size !== allChars.length) {
    throw new Error(`组格后仍有重复字：${allChars.join('')}`)
  }
  if (allChars.length !== total) {
    throw new Error(`组格数量异常：${allChars.length} != ${total}`)
  }
  const cells: SchulteCell[] = [
    ...normalized.map((char, orderIndex) => ({ id: -1, char, orderIndex })),
    ...distractors.map((char) => ({ id: -1, char, orderIndex: null as number | null })),
  ]
  const shuffled = shuffle(cells)
  return shuffled.map((c, i) => ({ ...c, id: i }))
}

export function isSchulteMode(mode: string): mode is SchulteMode {
  return (
    mode === 'schulte-easy' ||
    mode === 'schulte-normal' ||
    mode === 'schulte-hard' ||
    mode === 'schulte-poem-easy' ||
    mode === 'schulte-poem-normal' ||
    mode === 'schulte-poem-hard' ||
    mode === 'schulte-life-easy' ||
    mode === 'schulte-life-normal' ||
    mode === 'schulte-life-hard'
  )
}

export function isSchultePoemMode(mode: string): boolean {
  return (
    mode === 'schulte-poem-easy' ||
    mode === 'schulte-poem-normal' ||
    mode === 'schulte-poem-hard'
  )
}

export function isSchulteLifeMode(mode: string): boolean {
  return (
    mode === 'schulte-life-easy' ||
    mode === 'schulte-life-normal' ||
    mode === 'schulte-life-hard'
  )
}

export function getSchulteModeConfig(mode: SchulteMode): SchulteModeConfig {
  const hit = ALL_SCHULTE_MODES.find((m) => m.id === mode)
  if (!hit) throw new Error(`未知舒尔特模式: ${mode}`)
  return hit
}

export function generateSchulteQuestion(
  mode: SchulteMode,
  id: number,
  avoidFingerprints: Set<string> = new Set(),
): SchulteQuestion {
  const cfg = getSchulteModeConfig(mode)

  if (isSchultePoemMode(mode)) {
    const item = pickPoemItem(mode, avoidFingerprints)
    const chars = item.chars.map((c) => c.normalize('NFC'))
    const cells = buildCellsFromChars(chars, cfg.rows, cfg.cols)
    const previewMs = Math.max(800, chars.length * SCHULTE_POEM_PREVIEW_PER_CHAR_MS)
    return {
      id,
      key: item.key,
      kind: 'poem',
      word: chars.join(''),
      displayText: item.display,
      previewMs,
      meaning: item.meaning,
      chars,
      rows: cfg.rows,
      cols: cfg.cols,
      cells,
      expression: item.display,
      correctAnswer: item.display,
      explanation: `【${item.title}】${item.display}\n释义：${item.meaning}`,
      poemTitle: item.title,
      author: item.author,
    }
  }

  if (isSchulteLifeMode(mode)) {
    const item = pickLifeItem(mode, avoidFingerprints)
    const chars = item.chars.map((c) => c.normalize('NFC'))
    const cells = buildCellsFromChars(chars, cfg.rows, cfg.cols)
    const previewMs = Math.max(800, chars.length * SCHULTE_POEM_PREVIEW_PER_CHAR_MS)
    return {
      id,
      key: item.key,
      kind: 'life',
      word: chars.join(''),
      displayText: item.display,
      previewMs,
      meaning: item.meaning,
      chars,
      rows: cfg.rows,
      cols: cfg.cols,
      cells,
      expression: item.display,
      correctAnswer: item.display,
      explanation: `【生活常识】${item.display}\n释义：${item.meaning}`,
    }
  }

  const item = pickWordItem(mode, avoidFingerprints)
  const chars = Array.from(item.word).map((c) => c.normalize('NFC'))
  const cells = buildCellsFromChars(chars, cfg.rows, cfg.cols)
  const kindLabel = item.kind === 'idiom' ? '成语' : '词语'
  const previewMs =
    item.kind === 'idiom' ? SCHULTE_IDIOM_PREVIEW_MS : SCHULTE_WORD_PREVIEW_MS
  return {
    id,
    key: item.key,
    kind: item.kind,
    word: item.word,
    displayText: item.word,
    previewMs,
    meaning: item.meaning,
    chars,
    rows: cfg.rows,
    cols: cfg.cols,
    cells,
    expression: `${kindLabel}：${item.word}`,
    correctAnswer: item.word,
    explanation: `【${kindLabel}】${item.word}\n释义：${item.meaning}`,
  }
}

export function getSchulteQuestionFingerprint(q: SchulteQuestion): string {
  return `schulte:${q.key}`
}

export function clampSchulteScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function validateSchulteClick(
  q: SchulteQuestion,
  cellId: number,
  nextOrder: number,
): { ok: boolean; done: boolean } {
  const cell = q.cells.find((c) => c.id === cellId)
  if (!cell || cell.orderIndex == null) return { ok: false, done: false }
  if (cell.orderIndex !== nextOrder) return { ok: false, done: false }
  const done = nextOrder + 1 >= q.chars.length
  return { ok: true, done }
}
