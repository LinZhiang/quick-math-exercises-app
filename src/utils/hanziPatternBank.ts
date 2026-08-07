/**
 * 快判·汉字规律本地题库（普通难度，恰好 500 题）
 * 由 scripts/generate-hanzi-pattern-bank.mjs 生成；勿手改整表，改种子后重跑脚本。
 */
import type { HanziPatternBankItem } from '@/utils/hanziPatternBankTypes'

export const HANZI_PATTERN_BANK: HanziPatternBankItem[] = [
  {
    difficulty: 'normal',
    stem: `下列汉字：一　乙　丨　丶
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：一、乙、丨、丶
规律：笔画数相等
说明：均为 1 画`,
    key: "hanzi-pattern:001",
    chars: ["一","乙","丨","丶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　十　丁　七
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：二、十、丁、七
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:002",
    chars: ["二","十","丁","七"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：人　八　入　几
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：人、八、入、几
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:003",
    chars: ["人","八","入","几"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　干　于　下
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：三、干、于、下
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:004",
    chars: ["三","干","于","下"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：土　士　工　才
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：土、士、工、才
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:005",
    chars: ["土","士","工","才"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　山　巾　千
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：口、山、巾、千
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:006",
    chars: ["口","山","巾","千"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：大　丈　与　万
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：大、丈、与、万
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:007",
    chars: ["大","丈","与","万"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：小　上　乞　川
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：小、上、乞、川
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:008",
    chars: ["小","上","乞","川"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：女　子　也　飞
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：女、子、也、飞
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:009",
    chars: ["女","子","也","飞"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　天　夫　井
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：王、天、夫、井
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:010",
    chars: ["王","天","夫","井"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：木　不　太　犬
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：木、不、太、犬
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:011",
    chars: ["木","不","太","犬"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　曰　中　水
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：日、曰、中、水
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:012",
    chars: ["日","曰","中","水"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：月　丹　内　见
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：月、丹、内、见
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:013",
    chars: ["月","丹","内","见"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：火　文　方　心
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：火、文、方、心
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:014",
    chars: ["火","文","方","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：牛　午　手　毛
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：牛、午、手、毛
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:015",
    chars: ["牛","午","手","毛"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：五　互　牙　屯
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：五、互、牙、屯
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:016",
    chars: ["五","互","牙","屯"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：开　井　天　夫
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：开、井、天、夫
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:017",
    chars: ["开","井","天","夫"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：正　甘　生　用
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：正、甘、生、用
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:018",
    chars: ["正","甘","生","用"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：古　可　右　石
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：古、可、右、石
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:019",
    chars: ["古","可","右","石"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：本　术　未　末
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：本、术、未、末
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:020",
    chars: ["本","术","未","末"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：申　甲　电　田
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：申、甲、电、田
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:021",
    chars: ["申","甲","电","田"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：白　皮　目　且
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：白、皮、目、且
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:022",
    chars: ["白","皮","目","且"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：合　同　名　各
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：合、同、名、各
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:023",
    chars: ["合","同","名","各"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：安　字　守　宅
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：安、字、守、宅
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:024",
    chars: ["安","字","守","宅"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：红　纤　约　级
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：红、纤、约、级
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:025",
    chars: ["红","纤","约","级"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：军　农　冰　决
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：军、农、冰、决
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:026",
    chars: ["军","农","冰","决"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　找　身　走
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：我、找、身、走
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:027",
    chars: ["我","找","身","走"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：来　求　更　束
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：来、求、更、束
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:028",
    chars: ["来","求","更","束"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：里　困　园　围
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：里、困、园、围
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:029",
    chars: ["里","困","园","围"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：身　近　返　这
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：身、近、返、这
规律：笔画数相等
说明：身=7；近返这=7`,
    key: "hanzi-pattern:030",
    chars: ["身","近","返","这"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：国　固　图　周
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：国、固、图、周
规律：笔画数相等
说明：均为 8 画`,
    key: "hanzi-pattern:031",
    chars: ["国","固","图","周"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：金　命　念　贪
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：金、命、念、贪
规律：笔画数相等
说明：均为 8 画`,
    key: "hanzi-pattern:032",
    chars: ["金","命","念","贪"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：青　表　事　雨
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：青、表、事、雨
规律：笔画数相等
说明：青表事=8；雨=8`,
    key: "hanzi-pattern:033",
    chars: ["青","表","事","雨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：春　是　看　星
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：春、是、看、星
规律：笔画数相等
说明：均为 9 画`,
    key: "hanzi-pattern:034",
    chars: ["春","是","看","星"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：音　美　前　南
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：音、美、前、南
规律：笔画数相等
说明：均为 9 画`,
    key: "hanzi-pattern:035",
    chars: ["音","美","前","南"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：家　宽　宾　宰
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：家、宽、宾、宰
规律：笔画数相等
说明：均为 10 画`,
    key: "hanzi-pattern:036",
    chars: ["家","宽","宾","宰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：高　离　凉　资
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：高、离、凉、资
规律：笔画数相等
说明：均为 10 画`,
    key: "hanzi-pattern:037",
    chars: ["高","离","凉","资"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　二　三　王
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：一、二、三、王
规律：笔画数累加1
说明：1→2→3→4 画`,
    key: "hanzi-pattern:038",
    chars: ["一","二","三","王"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　二　三　丰
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：一、二、三、丰
规律：笔画数累加1
说明：1→2→3→4 画（丰=4）`,
    key: "hanzi-pattern:039",
    chars: ["一","二","三","丰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：乙　十　干　天
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：乙、十、干、天
规律：笔画数累加1
说明：1→2→3→4 画`,
    key: "hanzi-pattern:040",
    chars: ["乙","十","干","天"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　王　正
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：二、三、王、正
规律：笔画数累加1
说明：2→3→4→5 画`,
    key: "hanzi-pattern:041",
    chars: ["二","三","王","正"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　土　木　本
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：十、土、木、本
规律：笔画数累加1
说明：2→3→4→5 画`,
    key: "hanzi-pattern:042",
    chars: ["十","土","木","本"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：人　大　天　禾
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：人、大、天、禾
规律：笔画数累加1
说明：2→3→4→5 画`,
    key: "hanzi-pattern:043",
    chars: ["人","大","天","禾"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　王　正　合
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：三、王、正、合
规律：笔画数累加1
说明：3→4→5→6 画`,
    key: "hanzi-pattern:044",
    chars: ["三","王","正","合"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：干　开　未　同
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：干、开、未、同
规律：笔画数累加1
说明：3→4→5→6 画`,
    key: "hanzi-pattern:045",
    chars: ["干","开","未","同"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　日　田　回
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：口、日、田、回
规律：笔画数累加1
说明：3→4→5→6 画`,
    key: "hanzi-pattern:046",
    chars: ["口","日","田","回"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　正　合　我
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：王、正、合、我
规律：笔画数累加1
说明：4→5→6→7 画`,
    key: "hanzi-pattern:047",
    chars: ["王","正","合","我"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　白　合　我
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：日、白、合、我
规律：笔画数累加1
说明：4→5→6→7 画`,
    key: "hanzi-pattern:048",
    chars: ["日","白","合","我"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：中　甲　同　里
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：中、甲、同、里
规律：笔画数累加1
说明：4→5→6→7 画`,
    key: "hanzi-pattern:049",
    chars: ["中","甲","同","里"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：五　正　字　身
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：五、正、字、身
规律：笔画数累加1
说明：4→5→6→7 画`,
    key: "hanzi-pattern:050",
    chars: ["五","正","字","身"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：正　合　我　国
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：正、合、我、国
规律：笔画数累加1
说明：5→6→7→8 画`,
    key: "hanzi-pattern:051",
    chars: ["正","合","我","国"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：古　同　里　固
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：古、同、里、固
规律：笔画数累加1
说明：5→6→7→8 画`,
    key: "hanzi-pattern:052",
    chars: ["古","同","里","固"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：本　朱　来　述
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：本、朱、来、述
规律：笔画数累加1
说明：5→6→7→8 画`,
    key: "hanzi-pattern:053",
    chars: ["本","朱","来","述"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：白　合　身　金
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：白、合、身、金
规律：笔画数累加1
说明：5→6→7→8 画`,
    key: "hanzi-pattern:054",
    chars: ["白","合","身","金"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：合　我　国　春
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：合、我、国、春
规律：笔画数累加1
说明：6→7→8→9 画`,
    key: "hanzi-pattern:055",
    chars: ["合","我","国","春"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：字　里　固　是
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：字、里、固、是
规律：笔画数累加1
说明：6→7→8→9 画`,
    key: "hanzi-pattern:056",
    chars: ["字","里","固","是"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　来　青　音
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：同、来、青、音
规律：笔画数累加1
说明：6→7→8→9 画`,
    key: "hanzi-pattern:057",
    chars: ["同","来","青","音"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　国　春　家
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：我、国、春、家
规律：笔画数累加1
说明：7→8→9→10 画`,
    key: "hanzi-pattern:058",
    chars: ["我","国","春","家"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：里　金　看　高
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：里、金、看、高
规律：笔画数累加1
说明：7→8→9→10 画`,
    key: "hanzi-pattern:059",
    chars: ["里","金","看","高"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　五　四　伍
其规律是？`,
    correct: "笔画数累加1",
    distractors: ["笔画数相等","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：三、五、四、伍
规律：笔画数累加1
说明：3→4→5→6 画（伍=6）`,
    key: "hanzi-pattern:060",
    chars: ["三","五","四","伍"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　三　二　一
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：王、三、二、一
规律：笔画数累减1
说明：1←2←3←4 画（逆序）`,
    key: "hanzi-pattern:061",
    chars: ["王","三","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丰　三　二　一
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：丰、三、二、一
规律：笔画数累减1
说明：1←2←3←4 画（丰=4）（逆序）`,
    key: "hanzi-pattern:062",
    chars: ["丰","三","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　干　十　乙
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：天、干、十、乙
规律：笔画数累减1
说明：1←2←3←4 画（逆序）`,
    key: "hanzi-pattern:063",
    chars: ["天","干","十","乙"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：正　王　三　二
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：正、王、三、二
规律：笔画数累减1
说明：2←3←4←5 画（逆序）`,
    key: "hanzi-pattern:064",
    chars: ["正","王","三","二"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：本　木　土　十
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：本、木、土、十
规律：笔画数累减1
说明：2←3←4←5 画（逆序）`,
    key: "hanzi-pattern:065",
    chars: ["本","木","土","十"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：禾　天　大　人
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：禾、天、大、人
规律：笔画数累减1
说明：2←3←4←5 画（逆序）`,
    key: "hanzi-pattern:066",
    chars: ["禾","天","大","人"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：合　正　王　三
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：合、正、王、三
规律：笔画数累减1
说明：3←4←5←6 画（逆序）`,
    key: "hanzi-pattern:067",
    chars: ["合","正","王","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　未　开　干
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：同、未、开、干
规律：笔画数累减1
说明：3←4←5←6 画（逆序）`,
    key: "hanzi-pattern:068",
    chars: ["同","未","开","干"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：回　田　日　口
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：回、田、日、口
规律：笔画数累减1
说明：3←4←5←6 画（逆序）`,
    key: "hanzi-pattern:069",
    chars: ["回","田","日","口"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　合　正　王
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：我、合、正、王
规律：笔画数累减1
说明：4←5←6←7 画（逆序）`,
    key: "hanzi-pattern:070",
    chars: ["我","合","正","王"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　合　白　日
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：我、合、白、日
规律：笔画数累减1
说明：4←5←6←7 画（逆序）`,
    key: "hanzi-pattern:071",
    chars: ["我","合","白","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：里　同　甲　中
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：里、同、甲、中
规律：笔画数累减1
说明：4←5←6←7 画（逆序）`,
    key: "hanzi-pattern:072",
    chars: ["里","同","甲","中"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：身　字　正　五
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：身、字、正、五
规律：笔画数累减1
说明：4←5←6←7 画（逆序）`,
    key: "hanzi-pattern:073",
    chars: ["身","字","正","五"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：国　我　合　正
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：国、我、合、正
规律：笔画数累减1
说明：5←6←7←8 画（逆序）`,
    key: "hanzi-pattern:074",
    chars: ["国","我","合","正"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：固　里　同　古
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：固、里、同、古
规律：笔画数累减1
说明：5←6←7←8 画（逆序）`,
    key: "hanzi-pattern:075",
    chars: ["固","里","同","古"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：述　来　朱　本
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：述、来、朱、本
规律：笔画数累减1
说明：5←6←7←8 画（逆序）`,
    key: "hanzi-pattern:076",
    chars: ["述","来","朱","本"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：金　身　合　白
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：金、身、合、白
规律：笔画数累减1
说明：5←6←7←8 画（逆序）`,
    key: "hanzi-pattern:077",
    chars: ["金","身","合","白"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：春　国　我　合
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：春、国、我、合
规律：笔画数累减1
说明：6←7←8←9 画（逆序）`,
    key: "hanzi-pattern:078",
    chars: ["春","国","我","合"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：是　固　里　字
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：是、固、里、字
规律：笔画数累减1
说明：6←7←8←9 画（逆序）`,
    key: "hanzi-pattern:079",
    chars: ["是","固","里","字"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：音　青　来　同
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：音、青、来、同
规律：笔画数累减1
说明：6←7←8←9 画（逆序）`,
    key: "hanzi-pattern:080",
    chars: ["音","青","来","同"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：家　春　国　我
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：家、春、国、我
规律：笔画数累减1
说明：7←8←9←10 画（逆序）`,
    key: "hanzi-pattern:081",
    chars: ["家","春","国","我"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：高　看　金　里
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：高、看、金、里
规律：笔画数累减1
说明：7←8←9←10 画（逆序）`,
    key: "hanzi-pattern:082",
    chars: ["高","看","金","里"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：伍　四　五　三
其规律是？`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：伍、四、五、三
规律：笔画数累减1
说明：3←4←5←6 画（伍=6）（逆序）`,
    key: "hanzi-pattern:083",
    chars: ["伍","四","五","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　川　一
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：二、三、川、一
规律：笔画交叉数相等
说明：交叉数均为 0`,
    key: "hanzi-pattern:084",
    chars: ["二","三","川","一"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　八　小
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：二、三、八、小
规律：笔画交叉数相等
说明：交叉数均为 0`,
    key: "hanzi-pattern:085",
    chars: ["二","三","八","小"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　丈　才　干
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：十、丈、才、干
规律：笔画交叉数相等
说明：交叉数均为 1`,
    key: "hanzi-pattern:086",
    chars: ["十","丈","才","干"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：七　九　力　刀
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：七、九、力、刀
规律：笔画交叉数相等
说明：交叉数均为 1`,
    key: "hanzi-pattern:087",
    chars: ["七","九","力","刀"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丰　韦　井　开
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：丰、韦、井、开
规律：笔画交叉数相等
说明：交叉数均为 2`,
    key: "hanzi-pattern:088",
    chars: ["丰","韦","井","开"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　末　朱　来
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、末、朱、来
规律：笔画交叉数相等
说明：交叉数均为 3`,
    key: "hanzi-pattern:089",
    chars: ["未","末","朱","来"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　丈　支　友
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：十、丈、支、友
规律：笔画交叉数相等
说明：交叉数均为 1`,
    key: "hanzi-pattern:090",
    chars: ["十","丈","支","友"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：干　于　午　牛
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：干、于、午、牛
规律：笔画交叉数相等
说明：交叉数均为 1`,
    key: "hanzi-pattern:091",
    chars: ["干","于","午","牛"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：井　开　并　关
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：井、开、并、关
规律：笔画交叉数相等
说明：交叉数均为 2`,
    key: "hanzi-pattern:092",
    chars: ["井","开","并","关"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丰　韦　邦　律
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：丰、韦、邦、律
规律：笔画交叉数相等
说明：交叉数均为 2（主干交叉）`,
    key: "hanzi-pattern:093",
    chars: ["丰","韦","邦","律"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　末　朱　束
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、末、朱、束
规律：笔画交叉数相等
说明：交叉数均为 3`,
    key: "hanzi-pattern:094",
    chars: ["未","末","朱","束"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：米　来　夹　爽
其规律是？`,
    correct: "笔画交叉数相等",
    distractors: ["笔画交叉数累加1","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：米、来、夹、爽
规律：笔画交叉数相等
说明：交叉数均为 4`,
    key: "hanzi-pattern:095",
    chars: ["米","来","夹","爽"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　十　井　未
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：二、十、井、未
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:096",
    chars: ["二","十","井","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　干　开　未
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：三、干、开、未
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:097",
    chars: ["三","干","开","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　十　屯　连
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：二、十、屯、连
规律：笔画交叉数累加1
说明：0→1→2→3（经典例）`,
    key: "hanzi-pattern:098",
    chars: ["二","十","屯","连"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　七　井　未
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：一、七、井、未
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:099",
    chars: ["一","七","井","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：八　九　开　朱
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：八、九、开、朱
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:100",
    chars: ["八","九","开","朱"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　才　井　未
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：三、才、井、未
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:101",
    chars: ["三","才","井","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　井　未　米
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：十、井、未、米
规律：笔画交叉数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:102",
    chars: ["十","井","未","米"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：干　开　朱　来
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：干、开、朱、来
规律：笔画交叉数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:103",
    chars: ["干","开","朱","来"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：七　井　未　夹
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：七、井、未、夹
规律：笔画交叉数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:104",
    chars: ["七","井","未","夹"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　十　丰　未
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：二、十、丰、未
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:105",
    chars: ["二","十","丰","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　丈　开　束
其规律是？`,
    correct: "笔画交叉数累加1",
    distractors: ["笔画交叉数相等","笔画交叉数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：三、丈、开、束
规律：笔画交叉数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:106",
    chars: ["三","丈","开","束"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　井　十　二
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、井、十、二
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:107",
    chars: ["未","井","十","二"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　开　干　三
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、开、干、三
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:108",
    chars: ["未","开","干","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：连　屯　十　二
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：连、屯、十、二
规律：笔画交叉数累减1
说明：0→1→2→3（经典例）（逆序累减）`,
    key: "hanzi-pattern:109",
    chars: ["连","屯","十","二"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　井　七　一
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、井、七、一
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:110",
    chars: ["未","井","七","一"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：朱　开　九　八
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：朱、开、九、八
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:111",
    chars: ["朱","开","九","八"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　井　才　三
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、井、才、三
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:112",
    chars: ["未","井","才","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：米　未　井　十
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：米、未、井、十
规律：笔画交叉数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:113",
    chars: ["米","未","井","十"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：来　朱　开　干
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：来、朱、开、干
规律：笔画交叉数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:114",
    chars: ["来","朱","开","干"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：夹　未　井　七
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：夹、未、井、七
规律：笔画交叉数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:115",
    chars: ["夹","未","井","七"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　丰　十　二
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：未、丰、十、二
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:116",
    chars: ["未","丰","十","二"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：束　开　丈　三
其规律是？`,
    correct: "笔画交叉数累减1",
    distractors: ["笔画交叉数相等","笔画交叉数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：束、开、丈、三
规律：笔画交叉数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:117",
    chars: ["束","开","丈","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：早　旱　旺　昨
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「月」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：早、旱、旺、昨
规律：都包含「日」
说明：四字均含部件「日」`,
    key: "hanzi-pattern:118",
    chars: ["早","旱","旺","昨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：明　星　春　是
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「月」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：明、星、春、是
规律：都包含「日」
说明：四字均含部件「日」`,
    key: "hanzi-pattern:119",
    chars: ["明","星","春","是"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：复　暮　晴　晶
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「月」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：复、暮、晴、晶
规律：都包含「日」
说明：四字均含部件「日」`,
    key: "hanzi-pattern:120",
    chars: ["复","暮","晴","晶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：昌　易　昔　昏
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「月」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：昌、易、昔、昏
规律：都包含「日」
说明：四字均含部件「日」`,
    key: "hanzi-pattern:121",
    chars: ["昌","易","昔","昏"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：旱　星　暮　易
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「月」","都包含「木」","都包含「口」","都包含「氵」","笔画数相等"],
    explanation: `汉字：旱、星、暮、易
规律：都包含「日」
说明：四字均含部件「日」`,
    key: "hanzi-pattern:122",
    chars: ["旱","星","暮","易"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：明　朋　有　青
其规律是？`,
    correct: "都包含「月」",
    distractors: ["都包含「日」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：明、朋、有、青
规律：都包含「月」
说明：四字均含部件「月」`,
    key: "hanzi-pattern:123",
    chars: ["明","朋","有","青"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：朝　胜　脂　朗
其规律是？`,
    correct: "都包含「月」",
    distractors: ["都包含「日」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：朝、胜、脂、朗
规律：都包含「月」
说明：四字均含部件「月」`,
    key: "hanzi-pattern:124",
    chars: ["朝","胜","脂","朗"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：朦　胧　肤　肥
其规律是？`,
    correct: "都包含「月」",
    distractors: ["都包含「日」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：朦、胧、肤、肥
规律：都包含「月」
说明：四字均含部件「月」`,
    key: "hanzi-pattern:125",
    chars: ["朦","胧","肤","肥"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：肩　背　胡　能
其规律是？`,
    correct: "都包含「月」",
    distractors: ["都包含「日」","都包含「木」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：肩、背、胡、能
规律：都包含「月」
说明：四字均含部件「月」`,
    key: "hanzi-pattern:126",
    chars: ["肩","背","胡","能"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：朋　胜　胧　背
其规律是？`,
    correct: "都包含「月」",
    distractors: ["都包含「日」","都包含「木」","都包含「口」","都包含「氵」","笔画数相等"],
    explanation: `汉字：朋、胜、胧、背
规律：都包含「月」
说明：四字均含部件「月」`,
    key: "hanzi-pattern:127",
    chars: ["朋","胜","胧","背"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：林　森　村　杜
其规律是？`,
    correct: "都包含「木」",
    distractors: ["都包含「日」","都包含「月」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：林、森、村、杜
规律：都包含「木」
说明：四字均含部件「木」`,
    key: "hanzi-pattern:128",
    chars: ["林","森","村","杜"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：李　椅　桌　柜
其规律是？`,
    correct: "都包含「木」",
    distractors: ["都包含「日」","都包含「月」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：李、椅、桌、柜
规律：都包含「木」
说明：四字均含部件「木」`,
    key: "hanzi-pattern:129",
    chars: ["李","椅","桌","柜"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：桥　树　根　枝
其规律是？`,
    correct: "都包含「木」",
    distractors: ["都包含「日」","都包含「月」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：桥、树、根、枝
规律：都包含「木」
说明：四字均含部件「木」`,
    key: "hanzi-pattern:130",
    chars: ["桥","树","根","枝"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：松　柏　柳　梅
其规律是？`,
    correct: "都包含「木」",
    distractors: ["都包含「日」","都包含「月」","都包含「口」","都包含「氵」","都包含「心」"],
    explanation: `汉字：松、柏、柳、梅
规律：都包含「木」
说明：四字均含部件「木」`,
    key: "hanzi-pattern:131",
    chars: ["松","柏","柳","梅"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：森　椅　树　柏
其规律是？`,
    correct: "都包含「木」",
    distractors: ["都包含「日」","都包含「月」","都包含「口」","都包含「氵」","笔画数相等"],
    explanation: `汉字：森、椅、树、柏
规律：都包含「木」
说明：四字均含部件「木」`,
    key: "hanzi-pattern:132",
    chars: ["森","椅","树","柏"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：河　江　湖　海
其规律是？`,
    correct: "都包含「氵」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「心」"],
    explanation: `汉字：河、江、湖、海
规律：都包含「氵」
说明：四字均含部件「氵」`,
    key: "hanzi-pattern:133",
    chars: ["河","江","湖","海"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：洗　游　深　浅
其规律是？`,
    correct: "都包含「氵」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「心」"],
    explanation: `汉字：洗、游、深、浅
规律：都包含「氵」
说明：四字均含部件「氵」`,
    key: "hanzi-pattern:134",
    chars: ["洗","游","深","浅"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：湿　满　酒　油
其规律是？`,
    correct: "都包含「氵」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「心」"],
    explanation: `汉字：湿、满、酒、油
规律：都包含「氵」
说明：四字均含部件「氵」`,
    key: "hanzi-pattern:135",
    chars: ["湿","满","酒","油"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：波　浪　洋　洲
其规律是？`,
    correct: "都包含「氵」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「心」"],
    explanation: `汉字：波、浪、洋、洲
规律：都包含「氵」
说明：四字均含部件「氵」`,
    key: "hanzi-pattern:136",
    chars: ["波","浪","洋","洲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：江　游　满　浪
其规律是？`,
    correct: "都包含「氵」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","笔画数相等"],
    explanation: `汉字：江、游、满、浪
规律：都包含「氵」
说明：四字均含部件「氵」`,
    key: "hanzi-pattern:137",
    chars: ["江","游","满","浪"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：吗　呢　呀　吧
其规律是？`,
    correct: "都包含「口」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「氵」","都包含「心」"],
    explanation: `汉字：吗、呢、呀、吧
规律：都包含「口」
说明：四字均含部件「口」`,
    key: "hanzi-pattern:138",
    chars: ["吗","呢","呀","吧"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：知　如　君　名
其规律是？`,
    correct: "都包含「口」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「氵」","都包含「心」"],
    explanation: `汉字：知、如、君、名
规律：都包含「口」
说明：四字均含部件「口」`,
    key: "hanzi-pattern:139",
    chars: ["知","如","君","名"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　向　告　合
其规律是？`,
    correct: "都包含「口」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「氵」","都包含「心」"],
    explanation: `汉字：同、向、告、合
规律：都包含「口」
说明：四字均含部件「口」`,
    key: "hanzi-pattern:140",
    chars: ["同","向","告","合"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：听　唱　吹　呼
其规律是？`,
    correct: "都包含「口」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「氵」","都包含「心」"],
    explanation: `汉字：听、唱、吹、呼
规律：都包含「口」
说明：四字均含部件「口」`,
    key: "hanzi-pattern:141",
    chars: ["听","唱","吹","呼"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：呢　如　向　唱
其规律是？`,
    correct: "都包含「口」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「氵」","笔画数相等"],
    explanation: `汉字：呢、如、向、唱
规律：都包含「口」
说明：四字均含部件「口」`,
    key: "hanzi-pattern:142",
    chars: ["呢","如","向","唱"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：们　他　你　作
其规律是？`,
    correct: "都包含「亻」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：们、他、你、作
规律：都包含「亻」
说明：四字均含部件「亻」`,
    key: "hanzi-pattern:143",
    chars: ["们","他","你","作"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：位　休　体　何
其规律是？`,
    correct: "都包含「亻」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：位、休、体、何
规律：都包含「亻」
说明：四字均含部件「亻」`,
    key: "hanzi-pattern:144",
    chars: ["位","休","体","何"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：任　传　伤　估
其规律是？`,
    correct: "都包含「亻」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：任、传、伤、估
规律：都包含「亻」
说明：四字均含部件「亻」`,
    key: "hanzi-pattern:145",
    chars: ["任","传","伤","估"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：伸　似　低　仰
其规律是？`,
    correct: "都包含「亻」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：伸、似、低、仰
规律：都包含「亻」
说明：四字均含部件「亻」`,
    key: "hanzi-pattern:146",
    chars: ["伸","似","低","仰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：他　休　传　似
其规律是？`,
    correct: "都包含「亻」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：他、休、传、似
规律：都包含「亻」
说明：四字均含部件「亻」`,
    key: "hanzi-pattern:147",
    chars: ["他","休","传","似"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：打　找　把　拉
其规律是？`,
    correct: "都包含「扌」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：打、找、把、拉
规律：都包含「扌」
说明：四字均含部件「扌」`,
    key: "hanzi-pattern:148",
    chars: ["打","找","把","拉"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：提　指　挥　按
其规律是？`,
    correct: "都包含「扌」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：提、指、挥、按
规律：都包含「扌」
说明：四字均含部件「扌」`,
    key: "hanzi-pattern:149",
    chars: ["提","指","挥","按"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：扫　折　批　抓
其规律是？`,
    correct: "都包含「扌」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：扫、折、批、抓
规律：都包含「扌」
说明：四字均含部件「扌」`,
    key: "hanzi-pattern:150",
    chars: ["扫","折","批","抓"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：抗　护　报　抱
其规律是？`,
    correct: "都包含「扌」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：抗、护、报、抱
规律：都包含「扌」
说明：四字均含部件「扌」`,
    key: "hanzi-pattern:151",
    chars: ["抗","护","报","抱"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：找　指　折　护
其规律是？`,
    correct: "都包含「扌」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：找、指、折、护
规律：都包含「扌」
说明：四字均含部件「扌」`,
    key: "hanzi-pattern:152",
    chars: ["找","指","折","护"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：花　草　英　茶
其规律是？`,
    correct: "都包含「艹」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：花、草、英、茶
规律：都包含「艹」
说明：四字均含部件「艹」`,
    key: "hanzi-pattern:153",
    chars: ["花","草","英","茶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：萌　蓝　莲　菊
其规律是？`,
    correct: "都包含「艹」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：萌、蓝、莲、菊
规律：都包含「艹」
说明：四字均含部件「艹」`,
    key: "hanzi-pattern:154",
    chars: ["萌","蓝","莲","菊"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：苗　芽　苦　若
其规律是？`,
    correct: "都包含「艹」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：苗、芽、苦、若
规律：都包含「艹」
说明：四字均含部件「艹」`,
    key: "hanzi-pattern:155",
    chars: ["苗","芽","苦","若"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：茄　茅　茎　苹
其规律是？`,
    correct: "都包含「艹」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：茄、茅、茎、苹
规律：都包含「艹」
说明：四字均含部件「艹」`,
    key: "hanzi-pattern:156",
    chars: ["茄","茅","茎","苹"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：草　蓝　芽　茅
其规律是？`,
    correct: "都包含「艹」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：草、蓝、芽、茅
规律：都包含「艹」
说明：四字均含部件「艹」`,
    key: "hanzi-pattern:157",
    chars: ["草","蓝","芽","茅"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：思　想　念　忘
其规律是？`,
    correct: "都包含「心」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：思、想、念、忘
规律：都包含「心」
说明：四字均含部件「心」`,
    key: "hanzi-pattern:158",
    chars: ["思","想","念","忘"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：忠　恩　息　您
其规律是？`,
    correct: "都包含「心」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：忠、恩、息、您
规律：都包含「心」
说明：四字均含部件「心」`,
    key: "hanzi-pattern:159",
    chars: ["忠","恩","息","您"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：急　怒　怨　恐
其规律是？`,
    correct: "都包含「心」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：急、怒、怨、恐
规律：都包含「心」
说明：四字均含部件「心」`,
    key: "hanzi-pattern:160",
    chars: ["急","怒","怨","恐"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：悟　惜　愉　意
其规律是？`,
    correct: "都包含「心」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：悟、惜、愉、意
规律：都包含「心」
说明：四字均含部件「心」`,
    key: "hanzi-pattern:161",
    chars: ["悟","惜","愉","意"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：想　恩　怒　惜
其规律是？`,
    correct: "都包含「心」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：想、恩、怒、惜
规律：都包含「心」
说明：四字均含部件「心」`,
    key: "hanzi-pattern:162",
    chars: ["想","恩","怒","惜"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：灯　烧　热　然
其规律是？`,
    correct: "都包含「火」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：灯、烧、热、然
规律：都包含「火」
说明：四字均含部件「火」`,
    key: "hanzi-pattern:163",
    chars: ["灯","烧","热","然"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：煮　焦　焰　灿
其规律是？`,
    correct: "都包含「火」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：煮、焦、焰、灿
规律：都包含「火」
说明：四字均含部件「火」`,
    key: "hanzi-pattern:164",
    chars: ["煮","焦","焰","灿"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：烟　煤　烦　炎
其规律是？`,
    correct: "都包含「火」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：烟、煤、烦、炎
规律：都包含「火」
说明：四字均含部件「火」`,
    key: "hanzi-pattern:165",
    chars: ["烟","煤","烦","炎"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：灰　灶　炸　炮
其规律是？`,
    correct: "都包含「火」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：灰、灶、炸、炮
规律：都包含「火」
说明：四字均含部件「火」`,
    key: "hanzi-pattern:166",
    chars: ["灰","灶","炸","炮"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：烧　焦　煤　灶
其规律是？`,
    correct: "都包含「火」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：烧、焦、煤、灶
规律：都包含「火」
说明：四字均含部件「火」`,
    key: "hanzi-pattern:167",
    chars: ["烧","焦","煤","灶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：地　场　城　埋
其规律是？`,
    correct: "都包含「土」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：地、场、城、埋
规律：都包含「土」
说明：四字均含部件「土」`,
    key: "hanzi-pattern:168",
    chars: ["地","场","城","埋"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：壁　塘　境　培
其规律是？`,
    correct: "都包含「土」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：壁、塘、境、培
规律：都包含「土」
说明：四字均含部件「土」`,
    key: "hanzi-pattern:169",
    chars: ["壁","塘","境","培"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：坡　坎　坛　坊
其规律是？`,
    correct: "都包含「土」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：坡、坎、坛、坊
规律：都包含「土」
说明：四字均含部件「土」`,
    key: "hanzi-pattern:170",
    chars: ["坡","坎","坛","坊"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：块　坚　坐　圣
其规律是？`,
    correct: "都包含「土」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：块、坚、坐、圣
规律：都包含「土」
说明：四字均含部件「土」`,
    key: "hanzi-pattern:171",
    chars: ["块","坚","坐","圣"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：场　塘　坎　坚
其规律是？`,
    correct: "都包含「土」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：场、塘、坎、坚
规律：都包含「土」
说明：四字均含部件「土」`,
    key: "hanzi-pattern:172",
    chars: ["场","塘","坎","坚"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：银　铜　铁　钢
其规律是？`,
    correct: "都包含「钅」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：银、铜、铁、钢
规律：都包含「钅」
说明：四字均含部件「钅」`,
    key: "hanzi-pattern:173",
    chars: ["银","铜","铁","钢"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：钱　镜　钟　错
其规律是？`,
    correct: "都包含「钅」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：钱、镜、钟、错
规律：都包含「钅」
说明：四字均含部件「钅」`,
    key: "hanzi-pattern:174",
    chars: ["钱","镜","钟","错"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：锁　锐　锋　链
其规律是？`,
    correct: "都包含「钅」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：锁、锐、锋、链
规律：都包含「钅」
说明：四字均含部件「钅」`,
    key: "hanzi-pattern:175",
    chars: ["锁","锐","锋","链"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：锦　铸　锻　钉
其规律是？`,
    correct: "都包含「钅」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：锦、铸、锻、钉
规律：都包含「钅」
说明：四字均含部件「钅」`,
    key: "hanzi-pattern:176",
    chars: ["锦","铸","锻","钉"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：铜　镜　锐　铸
其规律是？`,
    correct: "都包含「钅」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：铜、镜、锐、铸
规律：都包含「钅」
说明：四字均含部件「钅」`,
    key: "hanzi-pattern:177",
    chars: ["铜","镜","锐","铸"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：说　话　语　认
其规律是？`,
    correct: "都包含「讠」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：说、话、语、认
规律：都包含「讠」
说明：四字均含部件「讠」`,
    key: "hanzi-pattern:178",
    chars: ["说","话","语","认"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：讲　评　论　诉
其规律是？`,
    correct: "都包含「讠」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：讲、评、论、诉
规律：都包含「讠」
说明：四字均含部件「讠」`,
    key: "hanzi-pattern:179",
    chars: ["讲","评","论","诉"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：详　该　课　调
其规律是？`,
    correct: "都包含「讠」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：详、该、课、调
规律：都包含「讠」
说明：四字均含部件「讠」`,
    key: "hanzi-pattern:180",
    chars: ["详","该","课","调"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：谁　请　让　议
其规律是？`,
    correct: "都包含「讠」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：谁、请、让、议
规律：都包含「讠」
说明：四字均含部件「讠」`,
    key: "hanzi-pattern:181",
    chars: ["谁","请","让","议"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：话　评　该　请
其规律是？`,
    correct: "都包含「讠」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：话、评、该、请
规律：都包含「讠」
说明：四字均含部件「讠」`,
    key: "hanzi-pattern:182",
    chars: ["话","评","该","请"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：她　好　妈　姐
其规律是？`,
    correct: "都包含「女」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：她、好、妈、姐
规律：都包含「女」
说明：四字均含部件「女」`,
    key: "hanzi-pattern:183",
    chars: ["她","好","妈","姐"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：姑　娘　妻　妇
其规律是？`,
    correct: "都包含「女」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：姑、娘、妻、妇
规律：都包含「女」
说明：四字均含部件「女」`,
    key: "hanzi-pattern:184",
    chars: ["姑","娘","妻","妇"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：姓　委　威　姿
其规律是？`,
    correct: "都包含「女」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：姓、委、威、姿
规律：都包含「女」
说明：四字均含部件「女」`,
    key: "hanzi-pattern:185",
    chars: ["姓","委","威","姿"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：婚　媒　嫩　妙
其规律是？`,
    correct: "都包含「女」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：婚、媒、嫩、妙
规律：都包含「女」
说明：四字均含部件「女」`,
    key: "hanzi-pattern:186",
    chars: ["婚","媒","嫩","妙"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：好　娘　委　媒
其规律是？`,
    correct: "都包含「女」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：好、娘、委、媒
规律：都包含「女」
说明：四字均含部件「女」`,
    key: "hanzi-pattern:187",
    chars: ["好","娘","委","媒"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：研　破　硬　码
其规律是？`,
    correct: "都包含「石」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：研、破、硬、码
规律：都包含「石」
说明：四字均含部件「石」`,
    key: "hanzi-pattern:188",
    chars: ["研","破","硬","码"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：确　碎　碰　砍
其规律是？`,
    correct: "都包含「石」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：确、碎、碰、砍
规律：都包含「石」
说明：四字均含部件「石」`,
    key: "hanzi-pattern:189",
    chars: ["确","碎","碰","砍"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：矿　硕　碧　磐
其规律是？`,
    correct: "都包含「石」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：矿、硕、碧、磐
规律：都包含「石」
说明：四字均含部件「石」`,
    key: "hanzi-pattern:190",
    chars: ["矿","硕","碧","磐"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：碟　砖　碗　碑
其规律是？`,
    correct: "都包含「石」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：碟、砖、碗、碑
规律：都包含「石」
说明：四字均含部件「石」`,
    key: "hanzi-pattern:191",
    chars: ["碟","砖","碗","碑"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：破　碎　硕　砖
其规律是？`,
    correct: "都包含「石」",
    distractors: ["都包含「日」","都包含「月」","都包含「木」","都包含「口」","都包含「氵」"],
    explanation: `汉字：破、碎、硕、砖
规律：都包含「石」
说明：四字均含部件「石」`,
    key: "hanzi-pattern:192",
    chars: ["破","碎","硕","砖"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：檀　香　复　早
其规律是？`,
    correct: "都包含「日」",
    distractors: ["都包含「木」","都包含「白」","笔画数相等","左右结构","笔画数累加1"],
    explanation: `汉字：檀、香、复、早
规律：都包含「日」
说明：檀/香/复/早均含「日」`,
    key: "hanzi-pattern:193",
    chars: ["檀","香","复","早"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　川　十
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：二、三、川、十
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:194",
    chars: ["二","三","川","十"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　人　大　天
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：一、人、大、天
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:195",
    chars: ["一","人","大","天"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：木　本　未　末
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：木、本、未、末
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:196",
    chars: ["木","本","未","末"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　主　丰　井
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：王、主、丰、井
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:197",
    chars: ["王","主","丰","井"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　日　白　目
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：口、日、白、目
规律：封闭区域个数相等
说明：封闭区域均为 1`,
    key: "hanzi-pattern:198",
    chars: ["口","日","白","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：古　右　石　后
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：古、右、石、后
规律：封闭区域个数相等
说明：封闭区域均为 1`,
    key: "hanzi-pattern:199",
    chars: ["古","右","石","后"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：甲　申　电　由
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：甲、申、电、由
规律：封闭区域个数相等
说明：封闭区域均为 1`,
    key: "hanzi-pattern:200",
    chars: ["甲","申","电","由"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：回　图　国　园
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：回、图、国、园
规律：封闭区域个数相等
说明：封闭区域均为 2`,
    key: "hanzi-pattern:201",
    chars: ["回","图","国","园"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：田　串　昌　吕
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：田、串、昌、吕
规律：封闭区域个数相等
说明：封闭区域均为 2`,
    key: "hanzi-pattern:202",
    chars: ["田","串","昌","吕"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：品　晶　鑫　磊
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：品、晶、鑫、磊
规律：封闭区域个数相等
说明：封闭区域均为 3`,
    key: "hanzi-pattern:203",
    chars: ["品","晶","鑫","磊"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　中　古　可
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：口、中、古、可
规律：封闭区域个数相等
说明：封闭区域均为 1`,
    key: "hanzi-pattern:204",
    chars: ["口","中","古","可"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　目　自　且
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：日、目、自、且
规律：封闭区域个数相等
说明：封闭区域均为 1`,
    key: "hanzi-pattern:205",
    chars: ["日","目","自","且"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：田　回　吕　昌
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：田、回、吕、昌
规律：封闭区域个数相等
说明：封闭区域均为 2`,
    key: "hanzi-pattern:206",
    chars: ["田","回","吕","昌"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　八　小　川
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：二、八、小、川
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:207",
    chars: ["二","八","小","川"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：开　井　末　未
其规律是？`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累加1","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：开、井、末、未
规律：封闭区域个数相等
说明：封闭区域均为 0`,
    key: "hanzi-pattern:208",
    chars: ["开","井","末","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：无　五　把　吧
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：无、五、把、吧
规律：封闭区域个数累加1
说明：0→1→2→3（经典例）`,
    key: "hanzi-pattern:209",
    chars: ["无","五","把","吧"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　口　田　品
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：二、口、田、品
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:210",
    chars: ["二","口","田","品"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：人　日　回　晶
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：人、日、回、晶
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:211",
    chars: ["人","日","回","晶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：木　白　吕　品
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：木、白、吕、品
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:212",
    chars: ["木","白","吕","品"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　甲　昌　鑫
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：天、甲、昌、鑫
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:213",
    chars: ["天","甲","昌","鑫"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　目　串　磊
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：三、目、串、磊
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:214",
    chars: ["三","目","串","磊"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：川　古　国　品
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：川、古、国、品
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:215",
    chars: ["川","古","国","品"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　石　图　晶
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：十、石、图、晶
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:216",
    chars: ["十","石","图","晶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　合　园　品
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：王、合、园、品
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:217",
    chars: ["王","合","园","品"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丰　同　昌　鑫
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：丰、同、昌、鑫
规律：封闭区域个数累加1
说明：0→1→2→3`,
    key: "hanzi-pattern:218",
    chars: ["丰","同","昌","鑫"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　田　品　器
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：口、田、品、器
规律：封闭区域个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:219",
    chars: ["口","田","品","器"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　回　晶　器
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：日、回、晶、器
规律：封闭区域个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:220",
    chars: ["日","回","晶","器"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：白　吕　品　器
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：白、吕、品、器
规律：封闭区域个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:221",
    chars: ["白","吕","品","器"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：目　昌　鑫　器
其规律是？`,
    correct: "封闭区域个数累加1",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：目、昌、鑫、器
规律：封闭区域个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:222",
    chars: ["目","昌","鑫","器"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：吧　把　五　无
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：吧、把、五、无
规律：封闭区域个数累减1
说明：0→1→2→3（经典例）（逆序累减）`,
    key: "hanzi-pattern:223",
    chars: ["吧","把","五","无"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：品　田　口　二
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：品、田、口、二
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:224",
    chars: ["品","田","口","二"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：晶　回　日　人
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：晶、回、日、人
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:225",
    chars: ["晶","回","日","人"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：品　吕　白　木
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：品、吕、白、木
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:226",
    chars: ["品","吕","白","木"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：鑫　昌　甲　天
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：鑫、昌、甲、天
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:227",
    chars: ["鑫","昌","甲","天"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：磊　串　目　三
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：磊、串、目、三
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:228",
    chars: ["磊","串","目","三"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：品　国　古　川
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：品、国、古、川
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:229",
    chars: ["品","国","古","川"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：晶　图　石　十
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：晶、图、石、十
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:230",
    chars: ["晶","图","石","十"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：品　园　合　王
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：品、园、合、王
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:231",
    chars: ["品","园","合","王"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：鑫　昌　同　丰
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：鑫、昌、同、丰
规律：封闭区域个数累减1
说明：0→1→2→3（逆序累减）`,
    key: "hanzi-pattern:232",
    chars: ["鑫","昌","同","丰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：器　品　田　口
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：器、品、田、口
规律：封闭区域个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:233",
    chars: ["器","品","田","口"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：器　晶　回　日
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：器、晶、回、日
规律：封闭区域个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:234",
    chars: ["器","晶","回","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：器　品　吕　白
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：器、品、吕、白
规律：封闭区域个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:235",
    chars: ["器","品","吕","白"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：器　鑫　昌　目
其规律是？`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数相等","封闭区域个数累加1","都有封闭区域","都是开放区域","笔画数相等"],
    explanation: `汉字：器、鑫、昌、目
规律：封闭区域个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:236",
    chars: ["器","鑫","昌","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：明　休　村　河
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：明、休、村、河
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:237",
    chars: ["明","休","村","河"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：林　秋　肚　灯
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：林、秋、肚、灯
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:238",
    chars: ["林","秋","肚","灯"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：伟　传　伸　伴
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：伟、传、伸、伴
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:239",
    chars: ["伟","传","伸","伴"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：江　湖　海　洋
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：江、湖、海、洋
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:240",
    chars: ["江","湖","海","洋"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：时　明　昨　晚
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：时、明、昨、晚
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:241",
    chars: ["时","明","昨","晚"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：根　枝　材　松
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：根、枝、材、松
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:242",
    chars: ["根","枝","材","松"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：清　洗　游　深
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：清、洗、游、深
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:243",
    chars: ["清","洗","游","深"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：指　挥　按　持
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：指、挥、按、持
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:244",
    chars: ["指","挥","按","持"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：低　住　依　估
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：低、住、依、估
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:245",
    chars: ["低","住","依","估"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：推　提　扫　折
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：推、提、扫、折
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:246",
    chars: ["推","提","扫","折"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：评　论　诉　试
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：评、论、诉、试
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:247",
    chars: ["评","论","诉","试"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：钟　错　销　锁
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：钟、错、销、锁
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:248",
    chars: ["钟","错","销","锁"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：破　碰　砍　础
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：破、碰、砍、础
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:249",
    chars: ["破","碰","砍","础"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：朋　有　期　朝
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：朋、有、期、朝
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:250",
    chars: ["朋","有","期","朝"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：杜　桃　李　柳
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：杜、桃、李、柳
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:251",
    chars: ["杜","桃","李","柳"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：温　湿　满　酒
其规律是？`,
    correct: "左右结构",
    distractors: ["上下结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：温、湿、满、酒
规律：左右结构
说明：四字均为左右结构`,
    key: "hanzi-pattern:252",
    chars: ["温","湿","满","酒"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：字　安　守　宅
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：字、安、守、宅
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:253",
    chars: ["字","安","守","宅"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：音　意　竟　章
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：音、意、竟、章
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:254",
    chars: ["音","意","竟","章"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：尖　尘　肖　省
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：尖、尘、肖、省
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:255",
    chars: ["尖","尘","肖","省"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：冒　昌　星　晨
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：冒、昌、星、晨
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:256",
    chars: ["冒","昌","星","晨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：架　案　桌　梨
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：架、案、桌、梨
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:257",
    chars: ["架","案","桌","梨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：想　感　慈　慧
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：想、感、慈、慧
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:258",
    chars: ["想","感","慈","慧"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：简　箱　笔　等
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：简、箱、笔、等
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:259",
    chars: ["简","箱","笔","等"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：管　算　符　答
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：管、算、符、答
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:260",
    chars: ["管","算","符","答"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：菜　萌　蓝　莲
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：菜、萌、蓝、莲
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:261",
    chars: ["菜","萌","蓝","莲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：忘　志　忠　恩
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：忘、志、忠、恩
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:262",
    chars: ["忘","志","忠","恩"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：息　您　态　急
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：息、您、态、急
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:263",
    chars: ["息","您","态","急"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：架　染　柔　梨
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：架、染、柔、梨
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:264",
    chars: ["架","染","柔","梨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：符　答　策　筑
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：符、答、策、筑
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:265",
    chars: ["符","答","策","筑"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：荷　菊　苹　蕉
其规律是？`,
    correct: "上下结构",
    distractors: ["左右结构","半包围结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：荷、菊、苹、蕉
规律：上下结构
说明：四字均为上下结构`,
    key: "hanzi-pattern:266",
    chars: ["荷","菊","苹","蕉"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　周　风　问
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：同、周、风、问
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:267",
    chars: ["同","周","风","问"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：闲　间　闭　闯
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：闲、间、闭、闯
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:268",
    chars: ["闲","间","闭","闯"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：压　厅　历　厚
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：压、厅、历、厚
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:269",
    chars: ["压","厅","历","厚"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：床　序　库　应
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：床、序、库、应
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:270",
    chars: ["床","序","库","应"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：延　建　廷　庭
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：延、建、廷、庭
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:271",
    chars: ["延","建","廷","庭"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：这　还　过　进
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：这、还、过、进
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:272",
    chars: ["这","还","过","进"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：道　远　近　返
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：道、远、近、返
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:273",
    chars: ["道","远","近","返"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：句　勾　包　勿
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：句、勾、包、勿
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:274",
    chars: ["句","勾","包","勿"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：司　可　句　局
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：司、可、句、局
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:275",
    chars: ["司","可","句","局"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：医　区　匹　巨
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：医、区、匹、巨
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:276",
    chars: ["医","区","匹","巨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：庆　床　店　庙
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：庆、床、店、庙
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:277",
    chars: ["庆","床","店","庙"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：闲　闷　闸　闹
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：闲、闷、闸、闹
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:278",
    chars: ["闲","闷","闸","闹"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：厢　厨　厦　厩
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：厢、厨、厦、厩
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:279",
    chars: ["厢","厨","厦","厩"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：逢　逃　追　退
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：逢、逃、追、退
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:280",
    chars: ["逢","逃","追","退"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：遍　遣　遥　遭
其规律是？`,
    correct: "半包围结构",
    distractors: ["左右结构","上下结构","独体结构","左右对称","上下对称"],
    explanation: `汉字：遍、遣、遥、遭
规律：半包围结构
说明：四字均为半包围结构`,
    key: "hanzi-pattern:281",
    chars: ["遍","遣","遥","遭"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：人　木　火　水
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：人、木、火、水
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:282",
    chars: ["人","木","火","水"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　月　山　石
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：日、月、山、石
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:283",
    chars: ["日","月","山","石"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：大　小　上　下
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：大、小、上、下
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:284",
    chars: ["大","小","上","下"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　王　主　玉
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：天、王、主、玉
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:285",
    chars: ["天","王","主","玉"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：牛　羊　马　鸟
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：牛、羊、马、鸟
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:286",
    chars: ["牛","羊","马","鸟"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：手　毛　爪　牙
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：手、毛、爪、牙
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:287",
    chars: ["手","毛","爪","牙"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　力　刀　弓
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：心、力、刀、弓
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:288",
    chars: ["心","力","刀","弓"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：车　舟　米　豆
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：车、舟、米、豆
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:289",
    chars: ["车","舟","米","豆"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：虫　鱼　龙　飞
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：虫、鱼、龙、飞
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:290",
    chars: ["虫","鱼","龙","飞"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：中　永　事　书
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：中、永、事、书
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:291",
    chars: ["中","永","事","书"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　成　或　武
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：我、成、或、武
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:292",
    chars: ["我","成","或","武"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：东　西　南　北
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：东、西、南、北
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:293",
    chars: ["东","西","南","北"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：年　来　求　更
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：年、来、求、更
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:294",
    chars: ["年","来","求","更"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：面　重　兼　爽
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：面、重、兼、爽
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:295",
    chars: ["面","重","兼","爽"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：民　氏　气　长
其规律是？`,
    correct: "独体结构",
    distractors: ["左右结构","上下结构","半包围结构","左右对称","上下对称"],
    explanation: `汉字：民、氏、气、长
规律：独体结构
说明：四字均为独体结构`,
    key: "hanzi-pattern:296",
    chars: ["民","氏","气","长"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：中　非　米　半
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：中、非、米、半
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:297",
    chars: ["中","非","米","半"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：田　甲　由　申
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：田、甲、由、申
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:298",
    chars: ["田","甲","由","申"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　目　且　自
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：日、目、且、自
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:299",
    chars: ["日","目","且","自"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　干　午　丰
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：十、干、午、丰
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:300",
    chars: ["十","干","午","丰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：山　出　幽　岔
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：山、出、幽、岔
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:301",
    chars: ["山","出","幽","岔"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　回　吕　品
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：口、回、吕、品
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:302",
    chars: ["口","回","吕","品"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　主　玉　弄
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：王、主、玉、弄
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:303",
    chars: ["王","主","玉","弄"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：小　水　永　冰
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：小、水、永、冰
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:304",
    chars: ["小","水","永","冰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：大　天　夫　央
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：大、天、夫、央
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:305",
    chars: ["大","天","夫","央"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：八　人　入　个
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：八、人、入、个
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:306",
    chars: ["八","人","入","个"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：火　灭　灰　灯
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：火、灭、灰、灯
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:307",
    chars: ["火","灭","灰","灯"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：车　东　军　轰
其规律是？`,
    correct: "左右对称",
    distractors: ["上下对称","左右结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：车、东、军、轰
规律：左右对称
说明：四字均为左右对称（轴对称）`,
    key: "hanzi-pattern:308",
    chars: ["车","东","军","轰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　亘　目
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：二、三、亘、目
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:309",
    chars: ["二","三","亘","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：昌　吕　圭　炎
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：昌、吕、圭、炎
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:310",
    chars: ["昌","吕","圭","炎"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　亚　曹
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：二、三、亚、曹
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:311",
    chars: ["二","三","亚","曹"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　二　三　亘
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：一、二、三、亘
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:312",
    chars: ["一","二","三","亘"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：目　且　县　具
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：目、且、县、具
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:313",
    chars: ["目","且","县","具"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：吕　昌　喦　畾
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：吕、昌、喦、畾
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:314",
    chars: ["吕","昌","喦","畾"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：炎　叒　歮　厽
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：炎、叒、歮、厽
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:315",
    chars: ["炎","叒","歮","厽"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：圭　晋　出　芈
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：圭、晋、出、芈
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:316",
    chars: ["圭","晋","出","芈"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　亚　亘　目
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：二、亚、亘、目
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:317",
    chars: ["二","亚","亘","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：昌　炎　圭　吕
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：昌、炎、圭、吕
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:318",
    chars: ["昌","炎","圭","吕"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：非　兆　北　乖
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：非、兆、北、乖
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:319",
    chars: ["非","兆","北","乖"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：出　岀　芈　亚
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：出、岀、芈、亚
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:320",
    chars: ["出","岀","芈","亚"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　亘　目　且
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：三、亘、目、且
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:321",
    chars: ["三","亘","目","且"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：吕　炎　昌　圭
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：吕、炎、昌、圭
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:322",
    chars: ["吕","炎","昌","圭"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　三　吕　昌
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：二、三、吕、昌
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:323",
    chars: ["二","三","吕","昌"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：亚　亘　目　出
其规律是？`,
    correct: "上下对称",
    distractors: ["左右对称","上下结构","独体结构","笔画数相等","笔画数累加1"],
    explanation: `汉字：亚、亘、目、出
规律：上下对称
说明：四字均为上下对称`,
    key: "hanzi-pattern:324",
    chars: ["亚","亘","目","出"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　乙　丁　七
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：一、乙、丁、七
规律：笔画不相连部分个数相等
说明：连通块均为 1（开=1 类）`,
    key: "hanzi-pattern:325",
    chars: ["一","乙","丁","七"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：大　太　天　夫
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：大、太、天、夫
规律：笔画不相连部分个数相等
说明：连通块均为 1`,
    key: "hanzi-pattern:326",
    chars: ["大","太","天","夫"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　主　玉　正
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：王、主、玉、正
规律：笔画不相连部分个数相等
说明：连通块均为 1`,
    key: "hanzi-pattern:327",
    chars: ["王","主","玉","正"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：八　儿　丫　刀
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：八、儿、丫、刀
规律：笔画不相连部分个数相等
说明：连通块均为 2`,
    key: "hanzi-pattern:328",
    chars: ["八","儿","丫","刀"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：勺　万　方　为
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：勺、万、方、为
规律：笔画不相连部分个数相等
说明：连通块均为 2`,
    key: "hanzi-pattern:329",
    chars: ["勺","万","方","为"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：小　川　彡　沝
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：小、川、彡、沝
规律：笔画不相连部分个数相等
说明：连通块均为 3`,
    key: "hanzi-pattern:330",
    chars: ["小","川","彡","沝"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　干　土　王
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：十、干、土、王
规律：笔画不相连部分个数相等
说明：连通块均为 1`,
    key: "hanzi-pattern:331",
    chars: ["十","干","土","王"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　日　田　目
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：口、日、田、目
规律：笔画不相连部分个数相等
说明：连通块均为 1`,
    key: "hanzi-pattern:332",
    chars: ["口","日","田","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：开　正　生　用
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：开、正、生、用
规律：笔画不相连部分个数相等
说明：连通块均为 1`,
    key: "hanzi-pattern:333",
    chars: ["开","正","生","用"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：勺　匀　勾　勿
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：勺、匀、勾、勿
规律：笔画不相连部分个数相等
说明：连通块均为 2`,
    key: "hanzi-pattern:334",
    chars: ["勺","匀","勾","勿"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：八　儿　几　匕
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：八、儿、几、匕
规律：笔画不相连部分个数相等
说明：连通块均为 2`,
    key: "hanzi-pattern:335",
    chars: ["八","儿","几","匕"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：小　川　彡　氵
其规律是？`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：小、川、彡、氵
规律：笔画不相连部分个数相等
说明：连通块均为 3`,
    key: "hanzi-pattern:336",
    chars: ["小","川","彡","氵"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：开　勺　小　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：开、勺、小、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4（开/勺/小经典）`,
    key: "hanzi-pattern:337",
    chars: ["开","勺","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：井　八　川　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：井、八、川、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:338",
    chars: ["井","八","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　儿　小　必
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：天、儿、小、必
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:339",
    chars: ["天","儿","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　勺　彡　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：口、勺、彡、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:340",
    chars: ["口","勺","彡","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　匀　川　必
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：日、匀、川、必
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:341",
    chars: ["日","匀","川","必"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：木　万　小　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：木、万、小、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:342",
    chars: ["木","万","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　方　彡　必
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：王、方、彡、必
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:343",
    chars: ["王","方","彡","必"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：正　勾　川　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：正、勾、川、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:344",
    chars: ["正","勾","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：生　勿　小　必
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：生、勿、小、必
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:345",
    chars: ["生","勿","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：用　匕　彡　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：用、匕、彡、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:346",
    chars: ["用","匕","彡","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：一　八　小　心
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：一、八、小、心
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:347",
    chars: ["一","八","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：乙　儿　川　必
其规律是？`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：乙、儿、川、必
规律：笔画不相连部分个数累加1
说明：1→2→3→4`,
    key: "hanzi-pattern:348",
    chars: ["乙","儿","川","必"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　小　勺　开
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、小、勺、开
规律：笔画不相连部分个数累减1
说明：1→2→3→4（开/勺/小经典）（逆序累减）`,
    key: "hanzi-pattern:349",
    chars: ["心","小","勺","开"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　川　八　井
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、川、八、井
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:350",
    chars: ["心","川","八","井"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：必　小　儿　天
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：必、小、儿、天
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:351",
    chars: ["必","小","儿","天"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　彡　勺　口
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、彡、勺、口
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:352",
    chars: ["心","彡","勺","口"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：必　川　匀　日
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：必、川、匀、日
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:353",
    chars: ["必","川","匀","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　小　万　木
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、小、万、木
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:354",
    chars: ["心","小","万","木"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：必　彡　方　王
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：必、彡、方、王
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:355",
    chars: ["必","彡","方","王"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　川　勾　正
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、川、勾、正
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:356",
    chars: ["心","川","勾","正"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：必　小　勿　生
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：必、小、勿、生
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:357",
    chars: ["必","小","勿","生"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　彡　匕　用
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、彡、匕、用
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:358",
    chars: ["心","彡","匕","用"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：心　小　八　一
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：心、小、八、一
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:359",
    chars: ["心","小","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：必　川　儿　乙
其规律是？`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累加1","笔画数相等","笔画数累加1","笔画数累减1"],
    explanation: `汉字：必、川、儿、乙
规律：笔画不相连部分个数累减1
说明：1→2→3→4（逆序累减）`,
    key: "hanzi-pattern:360",
    chars: ["必","川","儿","乙"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：国　回　田　日
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：国、回、田、日
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:361",
    chars: ["国","回","田","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　目　白　甲
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：口、目、白、甲
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:362",
    chars: ["口","目","白","甲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：图　园　围　困
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：图、园、围、困
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:363",
    chars: ["图","园","围","困"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：申　电　由　甲
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：申、电、由、甲
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:364",
    chars: ["申","电","由","甲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：昌　吕　品　晶
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：昌、吕、品、晶
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:365",
    chars: ["昌","吕","品","晶"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：回　图　国　圆
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：回、图、国、圆
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:366",
    chars: ["回","图","国","圆"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：自　且　目　日
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：自、且、目、日
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:367",
    chars: ["自","且","目","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：四　西　酉　面
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：四、西、酉、面
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:368",
    chars: ["四","西","酉","面"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：团　固　困　国
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：团、固、困、国
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:369",
    chars: ["团","固","困","国"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：星　是　早　昨
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：星、是、早、昨
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:370",
    chars: ["星","是","早","昨"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：明　时　晚　晴
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：明、时、晚、晴
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:371",
    chars: ["明","时","晚","晴"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：问　间　闲　闷
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：问、间、闲、闷
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:372",
    chars: ["问","间","闲","闷"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：高　亮　享　京
其规律是？`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右结构"],
    explanation: `汉字：高、亮、享、京
规律：都有封闭区域
说明：四字均含封闭线条围成的区域`,
    key: "hanzi-pattern:373",
    chars: ["高","亮","享","京"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　天　木　人
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：王、天、木、人
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:374",
    chars: ["王","天","木","人"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　川　十　干
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：三、川、十、干
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:375",
    chars: ["三","川","十","干"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：开　井　丰　韦
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：开、井、丰、韦
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:376",
    chars: ["开","井","丰","韦"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　末　本　术
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：未、末、本、术
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:377",
    chars: ["未","末","本","术"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：火　水　永　冰
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：火、水、永、冰
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:378",
    chars: ["火","水","永","冰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：东　乐　车　军
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：东、乐、车、军
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:379",
    chars: ["东","乐","车","军"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　找　成　求
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：我、找、成、求
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:380",
    chars: ["我","找","成","求"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：牛　午　生　失
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：牛、午、生、失
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:381",
    chars: ["牛","午","生","失"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：力　刀　刃　切
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：力、刀、刃、切
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:382",
    chars: ["力","刀","刃","切"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：才　寸　丈　万
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：才、寸、丈、万
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:383",
    chars: ["才","寸","丈","万"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：长　片　书　事
其规律是？`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数相等","封闭区域个数累加1","封闭区域个数累减1","左右对称"],
    explanation: `汉字：长、片、书、事
规律：都是开放区域
说明：四字均无封闭区域（笔画不围成封闭空间）`,
    key: "hanzi-pattern:384",
    chars: ["长","片","书","事"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：十　丁　七　人
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：十、丁、七、人
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:385",
    chars: ["十","丁","七","人"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丁　七　人　八
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：丁、七、人、八
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:386",
    chars: ["丁","七","人","八"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：七　人　八　入
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：七、人、八、入
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:387",
    chars: ["七","人","八","入"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：八　入　几　九
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：八、入、几、九
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:388",
    chars: ["八","入","几","九"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：入　几　九　了
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：入、几、九、了
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:389",
    chars: ["入","几","九","了"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：二　七　入　了
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：二、七、入、了
规律：笔画数相等
说明：均为 2 画`,
    key: "hanzi-pattern:390",
    chars: ["二","七","入","了"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：干　于　下　土
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：干、于、下、土
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:391",
    chars: ["干","于","下","土"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：于　下　土　士
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：于、下、土、士
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:392",
    chars: ["于","下","土","士"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：下　土　士　工
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：下、土、士、工
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:393",
    chars: ["下","土","士","工"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：士　工　才　口
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：士、工、才、口
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:394",
    chars: ["士","工","才","口"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：工　才　口　山
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：工、才、口、山
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:395",
    chars: ["工","才","口","山"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：才　口　山　巾
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：才、口、山、巾
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:396",
    chars: ["才","口","山","巾"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：山　巾　千　大
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：山、巾、千、大
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:397",
    chars: ["山","巾","千","大"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：巾　千　大　丈
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：巾、千、大、丈
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:398",
    chars: ["巾","千","大","丈"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：千　大　丈　小
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：千、大、丈、小
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:399",
    chars: ["千","大","丈","小"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：大　丈　小　上
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：大、丈、小、上
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:400",
    chars: ["大","丈","小","上"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：丈　小　上　女
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：丈、小、上、女
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:401",
    chars: ["丈","小","上","女"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：小　上　女　子
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：小、上、女、子
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:402",
    chars: ["小","上","女","子"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：上　女　子　也
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：上、女、子、也
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:403",
    chars: ["上","女","子","也"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：三　下　工　山
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：三、下、工、山
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:404",
    chars: ["三","下","工","山"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：干　土　才　巾
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：干、土、才、巾
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:405",
    chars: ["干","土","才","巾"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：于　士　口　千
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：于、士、口、千
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:406",
    chars: ["于","士","口","千"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：下　工　山　大
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：下、工、山、大
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:407",
    chars: ["下","工","山","大"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：土　才　巾　丈
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：土、才、巾、丈
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:408",
    chars: ["土","才","巾","丈"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：士　口　千　小
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：士、口、千、小
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:409",
    chars: ["士","口","千","小"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：工　山　大　上
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：工、山、大、上
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:410",
    chars: ["工","山","大","上"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：才　巾　丈　女
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：才、巾、丈、女
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:411",
    chars: ["才","巾","丈","女"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：口　千　小　子
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：口、千、小、子
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:412",
    chars: ["口","千","小","子"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：山　大　上　也
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：山、大、上、也
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:413",
    chars: ["山","大","上","也"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：巾　丈　女　飞
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：巾、丈、女、飞
规律：笔画数相等
说明：均为 3 画`,
    key: "hanzi-pattern:414",
    chars: ["巾","丈","女","飞"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　夫　井　木
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：天、夫、井、木
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:415",
    chars: ["天","夫","井","木"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：夫　井　木　不
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：夫、井、木、不
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:416",
    chars: ["夫","井","木","不"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：井　木　不　太
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：井、木、不、太
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:417",
    chars: ["井","木","不","太"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：不　太　犬　日
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：不、太、犬、日
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:418",
    chars: ["不","太","犬","日"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：太　犬　日　曰
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：太、犬、日、曰
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:419",
    chars: ["太","犬","日","曰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：犬　日　曰　中
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：犬、日、曰、中
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:420",
    chars: ["犬","日","曰","中"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：曰　中　水　月
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：曰、中、水、月
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:421",
    chars: ["曰","中","水","月"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：中　水　月　火
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：中、水、月、火
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:422",
    chars: ["中","水","月","火"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：水　月　火　文
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：水、月、火、文
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:423",
    chars: ["水","月","火","文"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：月　火　文　方
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：月、火、文、方
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:424",
    chars: ["月","火","文","方"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：火　文　方　牛
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：火、文、方、牛
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:425",
    chars: ["火","文","方","牛"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：文　方　牛　午
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：文、方、牛、午
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:426",
    chars: ["文","方","牛","午"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：方　牛　午　手
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：方、牛、午、手
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:427",
    chars: ["方","牛","午","手"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：午　手　毛　五
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：午、手、毛、五
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:428",
    chars: ["午","手","毛","五"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：手　毛　五　开
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：手、毛、五、开
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:429",
    chars: ["手","毛","五","开"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：王　井　太　曰
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：王、井、太、曰
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:430",
    chars: ["王","井","太","曰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：天　木　犬　中
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：天、木、犬、中
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:431",
    chars: ["天","木","犬","中"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：夫　不　日　水
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：夫、不、日、水
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:432",
    chars: ["夫","不","日","水"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：井　太　曰　月
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：井、太、曰、月
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:433",
    chars: ["井","太","曰","月"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：木　犬　中　火
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：木、犬、中、火
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:434",
    chars: ["木","犬","中","火"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：不　日　水　文
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：不、日、水、文
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:435",
    chars: ["不","日","水","文"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：太　曰　月　方
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：太、曰、月、方
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:436",
    chars: ["太","曰","月","方"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：犬　中　火　牛
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：犬、中、火、牛
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:437",
    chars: ["犬","中","火","牛"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：日　水　文　午
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：日、水、文、午
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:438",
    chars: ["日","水","文","午"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：曰　月　方　手
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：曰、月、方、手
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:439",
    chars: ["曰","月","方","手"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：中　火　牛　毛
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：中、火、牛、毛
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:440",
    chars: ["中","火","牛","毛"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：水　文　午　五
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：水、文、午、五
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:441",
    chars: ["水","文","午","五"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：月　方　手　开
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：月、方、手、开
规律：笔画数相等
说明：均为 4 画`,
    key: "hanzi-pattern:442",
    chars: ["月","方","手","开"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：甘　生　用　古
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：甘、生、用、古
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:443",
    chars: ["甘","生","用","古"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：生　用　古　可
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：生、用、古、可
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:444",
    chars: ["生","用","古","可"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：用　古　可　右
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：用、古、可、右
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:445",
    chars: ["用","古","可","右"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：可　右　石　本
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：可、右、石、本
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:446",
    chars: ["可","右","石","本"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：右　石　本　术
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：右、石、本、术
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:447",
    chars: ["右","石","本","术"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：石　本　术　未
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：石、本、术、未
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:448",
    chars: ["石","本","术","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：术　未　末　申
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：术、未、末、申
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:449",
    chars: ["术","未","末","申"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　末　申　甲
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：未、末、申、甲
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:450",
    chars: ["未","末","申","甲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：末　申　甲　电
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：末、申、甲、电
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:451",
    chars: ["末","申","甲","电"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：甲　电　田　白
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：甲、电、田、白
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:452",
    chars: ["甲","电","田","白"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：电　田　白　皮
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：电、田、白、皮
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:453",
    chars: ["电","田","白","皮"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：田　白　皮　目
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：田、白、皮、目
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:454",
    chars: ["田","白","皮","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：正　用　右　术
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：正、用、右、术
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:455",
    chars: ["正","用","右","术"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：甘　古　石　未
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：甘、古、石、未
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:456",
    chars: ["甘","古","石","未"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：生　可　本　末
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：生、可、本、末
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:457",
    chars: ["生","可","本","末"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：用　右　术　申
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：用、右、术、申
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:458",
    chars: ["用","右","术","申"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：古　石　未　甲
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：古、石、未、甲
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:459",
    chars: ["古","石","未","甲"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：可　本　末　电
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：可、本、末、电
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:460",
    chars: ["可","本","末","电"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：右　术　申　田
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：右、术、申、田
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:461",
    chars: ["右","术","申","田"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：石　未　甲　白
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：石、未、甲、白
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:462",
    chars: ["石","未","甲","白"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：本　末　电　皮
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：本、末、电、皮
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:463",
    chars: ["本","末","电","皮"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：术　申　田　目
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：术、申、田、目
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:464",
    chars: ["术","申","田","目"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：未　甲　白　且
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：未、甲、白、且
规律：笔画数相等
说明：均为 5 画`,
    key: "hanzi-pattern:465",
    chars: ["未","甲","白","且"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　名　各　安
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：同、名、各、安
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:466",
    chars: ["同","名","各","安"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：名　各　安　字
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：名、各、安、字
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:467",
    chars: ["名","各","安","字"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：各　安　字　守
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：各、安、字、守
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:468",
    chars: ["各","安","字","守"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：字　守　宅　红
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：字、守、宅、红
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:469",
    chars: ["字","守","宅","红"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：守　宅　红　纤
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：守、宅、红、纤
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:470",
    chars: ["守","宅","红","纤"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：宅　红　纤　约
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：宅、红、纤、约
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:471",
    chars: ["宅","红","纤","约"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：纤　约　级　军
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：纤、约、级、军
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:472",
    chars: ["纤","约","级","军"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：约　级　军　农
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：约、级、军、农
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:473",
    chars: ["约","级","军","农"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：级　军　农　冰
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：级、军、农、冰
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:474",
    chars: ["级","军","农","冰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：农　冰　决　光
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：农、冰、决、光
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:475",
    chars: ["农","冰","决","光"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：冰　决　光　先
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：冰、决、光、先
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:476",
    chars: ["冰","决","光","先"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：决　光　先　共
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：决、光、先、共
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:477",
    chars: ["决","光","先","共"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：光　先　共　色
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：光、先、共、色
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:478",
    chars: ["光","先","共","色"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：合　各　守　纤
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：合、各、守、纤
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:479",
    chars: ["合","各","守","纤"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：同　安　宅　约
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：同、安、宅、约
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:480",
    chars: ["同","安","宅","约"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：名　字　红　级
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：名、字、红、级
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:481",
    chars: ["名","字","红","级"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：各　守　纤　军
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：各、守、纤、军
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:482",
    chars: ["各","守","纤","军"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：安　宅　约　农
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：安、宅、约、农
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:483",
    chars: ["安","宅","约","农"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：字　红　级　冰
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：字、红、级、冰
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:484",
    chars: ["字","红","级","冰"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：守　纤　军　决
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：守、纤、军、决
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:485",
    chars: ["守","纤","军","决"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：宅　约　农　光
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：宅、约、农、光
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:486",
    chars: ["宅","约","农","光"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：红　级　冰　先
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：红、级、冰、先
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:487",
    chars: ["红","级","冰","先"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：纤　军　决　共
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：纤、军、决、共
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:488",
    chars: ["纤","军","决","共"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：约　农　光　色
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：约、农、光、色
规律：笔画数相等
说明：均为 6 画`,
    key: "hanzi-pattern:489",
    chars: ["约","农","光","色"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：我　找　成　或
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：我、找、成、或
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:490",
    chars: ["我","找","成","或"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：找　成　或　来
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：找、成、或、来
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:491",
    chars: ["找","成","或","来"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：成　或　来　求
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：成、或、来、求
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:492",
    chars: ["成","或","来","求"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：或　来　求　更
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：或、来、求、更
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:493",
    chars: ["或","来","求","更"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：求　更　束　里
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：求、更、束、里
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:494",
    chars: ["求","更","束","里"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：更　束　里　困
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：更、束、里、困
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:495",
    chars: ["更","束","里","困"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：束　里　困　园
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：束、里、困、园
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:496",
    chars: ["束","里","困","园"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：困　园　围　身
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：困、园、围、身
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:497",
    chars: ["困","园","围","身"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：园　围　身　近
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：园、围、身、近
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:498",
    chars: ["园","围","身","近"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：围　身　近　返
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：围、身、近、返
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:499",
    chars: ["围","身","近","返"],
  },
  {
    difficulty: 'normal',
    stem: `下列汉字：近　返　这　别
其规律是？`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","笔画交叉数相等","笔画交叉数累加1","笔画交叉数累减1"],
    explanation: `汉字：近、返、这、别
规律：笔画数相等
说明：均为 7 画`,
    key: "hanzi-pattern:500",
    chars: ["近","返","这","别"],
  },
]
