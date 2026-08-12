/**
 * 快判·汉字规律本地题库（普通难度，恰好 500 题）
 * 由 scripts/generate-hanzi-pattern-bank.mjs 生成；勿手改整表，改种子后重跑脚本。
 * stem 仅为四字（全角空格分隔）。
 */
import type { HanziPatternBankItem } from '@/utils/hanziPatternBankTypes'

export const HANZI_PATTERN_BANK: HanziPatternBankItem[] = [
  {
    difficulty: 'normal',
    stem: `三　五　四　伍`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：三、五、四、伍
规律：笔画数累加1
核对：笔画数 3→4→5→6（三/五/四/伍）`,
    key: "hanzi-pattern:001",
    chars: ["三","五","四","伍"],
  },
  {
    difficulty: 'normal',
    stem: `檀　香　复　早`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：檀、香、复、早
规律：都包含「日」
核对：檀/香/复/早均含「日」`,
    key: "hanzi-pattern:002",
    chars: ["檀","香","复","早"],
  },
  {
    difficulty: 'normal',
    stem: `木　日　昌　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：木、日、昌、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3（木/日/昌/晶）`,
    key: "hanzi-pattern:003",
    chars: ["木","日","昌","晶"],
  },
  {
    difficulty: 'normal',
    stem: `开　勺　小　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：开、勺、小、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开/勺/小/心）`,
    key: "hanzi-pattern:004",
    chars: ["开","勺","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `王　天　木　人`,
    correct: "都是开放区域",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","封闭区域个数相等","都有封闭区域","笔画数累减1"],
    explanation: `汉字：王、天、木、人
规律：都是开放区域
核对：封闭区域均为 0`,
    key: "hanzi-pattern:005",
    chars: ["王","天","木","人"],
  },
  {
    difficulty: 'normal',
    stem: `国　回　田　日`,
    correct: "都有封闭区域",
    distractors: ["封闭区域个数相等","封闭区域个数累减1","都是开放区域","封闭区域个数累加1","左右对称"],
    explanation: `汉字：国、回、田、日
规律：都有封闭区域
核对：均有封闭区域`,
    key: "hanzi-pattern:006",
    chars: ["国","回","田","日"],
  },
  {
    difficulty: 'normal',
    stem: `古　山　大　非`,
    correct: "左右对称",
    distractors: ["上下对称","都包含「女」","都包含「氵」","都包含「日」","都有封闭区域"],
    explanation: `汉字：古、山、大、非
规律：左右对称
核对：古/山/大/非均为左右对称（竖轴对折；非上下对称）`,
    key: "hanzi-pattern:007",
    chars: ["古","山","大","非"],
  },
  {
    difficulty: 'normal',
    stem: `木　开　丰　夹`,
    correct: "左右对称",
    distractors: ["上下对称","都包含「女」","都包含「氵」","都包含「日」","都有封闭区域"],
    explanation: `汉字：木、开、丰、夹
规律：左右对称
核对：木/开/丰/夹均为左右对称`,
    key: "hanzi-pattern:008",
    chars: ["木","开","丰","夹"],
  },
  {
    difficulty: 'normal',
    stem: `巨　目　中　臣`,
    correct: "上下对称",
    distractors: ["左右对称","笔画不相连部分个数相等","都包含「土」","笔画数相等","左右结构"],
    explanation: `汉字：巨、目、中、臣
规律：上下对称
核对：巨/目/中/臣均为上下对称（横轴对折；巨/臣非左右对称）`,
    key: "hanzi-pattern:009",
    chars: ["巨","目","中","臣"],
  },
  {
    difficulty: 'normal',
    stem: `巨　目　中　叵`,
    correct: "上下对称",
    distractors: ["左右对称","笔画不相连部分个数相等","都包含「土」","笔画数相等","左右结构"],
    explanation: `汉字：巨、目、中、叵
规律：上下对称
核对：巨/目/中/叵均为上下对称（横轴对折；巨/叵非左右对称）`,
    key: "hanzi-pattern:010",
    chars: ["巨","目","中","叵"],
  },
  {
    difficulty: 'normal',
    stem: `卧　林　河　明`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都包含「土」","封闭区域个数累加1"],
    explanation: `汉字：卧、林、河、明
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:011",
    chars: ["卧","林","河","明"],
  },
  {
    difficulty: 'normal',
    stem: `床　问　这　区`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","都包含「亻」","都包含「口」"],
    explanation: `汉字：床、问、这、区
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:012",
    chars: ["床","问","这","区"],
  },
  {
    difficulty: 'normal',
    stem: `人　木　火　水`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","都包含「口」","都包含「钅」"],
    explanation: `汉字：人、木、火、水
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:013",
    chars: ["人","木","火","水"],
  },
  {
    difficulty: 'normal',
    stem: `圭　炎　吕　昌`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","封闭区域个数累加1","都是开放区域"],
    explanation: `汉字：圭、炎、吕、昌
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:014",
    chars: ["圭","炎","吕","昌"],
  },
  {
    difficulty: 'normal',
    stem: `二　十　丁　七`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：二、十、丁、七
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:015",
    chars: ["二","十","丁","七"],
  },
  {
    difficulty: 'normal',
    stem: `十　丁　七　八`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：十、丁、七、八
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:016",
    chars: ["十","丁","七","八"],
  },
  {
    difficulty: 'normal',
    stem: `丁　七　八　人`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：丁、七、八、人
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:017",
    chars: ["丁","七","八","人"],
  },
  {
    difficulty: 'normal',
    stem: `七　八　人　入`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：七、八、人、入
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:018",
    chars: ["七","八","人","入"],
  },
  {
    difficulty: 'normal',
    stem: `八　人　入　儿`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：八、人、入、儿
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:019",
    chars: ["八","人","入","儿"],
  },
  {
    difficulty: 'normal',
    stem: `人　入　儿　九`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：人、入、儿、九
规律：笔画数相等
核对：笔画数均为 2`,
    key: "hanzi-pattern:020",
    chars: ["人","入","儿","九"],
  },
  {
    difficulty: 'normal',
    stem: `三　干　于　下`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：三、干、于、下
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:021",
    chars: ["三","干","于","下"],
  },
  {
    difficulty: 'normal',
    stem: `干　于　下　土`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：干、于、下、土
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:022",
    chars: ["干","于","下","土"],
  },
  {
    difficulty: 'normal',
    stem: `于　下　土　士`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：于、下、土、士
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:023",
    chars: ["于","下","土","士"],
  },
  {
    difficulty: 'normal',
    stem: `下　土　士　工`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：下、土、士、工
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:024",
    chars: ["下","土","士","工"],
  },
  {
    difficulty: 'normal',
    stem: `土　士　工　才`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：土、士、工、才
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:025",
    chars: ["土","士","工","才"],
  },
  {
    difficulty: 'normal',
    stem: `士　工　才　寸`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：士、工、才、寸
规律：笔画数相等
核对：笔画数均为 3`,
    key: "hanzi-pattern:026",
    chars: ["士","工","才","寸"],
  },
  {
    difficulty: 'normal',
    stem: `王　天　夫　井`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：王、天、夫、井
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:027",
    chars: ["王","天","夫","井"],
  },
  {
    difficulty: 'normal',
    stem: `天　夫　井　开`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：天、夫、井、开
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:028",
    chars: ["天","夫","井","开"],
  },
  {
    difficulty: 'normal',
    stem: `夫　井　开　木`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：夫、井、开、木
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:029",
    chars: ["夫","井","开","木"],
  },
  {
    difficulty: 'normal',
    stem: `井　开　木　不`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：井、开、木、不
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:030",
    chars: ["井","开","木","不"],
  },
  {
    difficulty: 'normal',
    stem: `开　木　不　太`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：开、木、不、太
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:031",
    chars: ["开","木","不","太"],
  },
  {
    difficulty: 'normal',
    stem: `木　不　太　犬`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：木、不、太、犬
规律：笔画数相等
核对：笔画数均为 4`,
    key: "hanzi-pattern:032",
    chars: ["木","不","太","犬"],
  },
  {
    difficulty: 'normal',
    stem: `正　甘　生　用`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：正、甘、生、用
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:033",
    chars: ["正","甘","生","用"],
  },
  {
    difficulty: 'normal',
    stem: `甘　生　用　古`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：甘、生、用、古
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:034",
    chars: ["甘","生","用","古"],
  },
  {
    difficulty: 'normal',
    stem: `生　用　古　可`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：生、用、古、可
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:035",
    chars: ["生","用","古","可"],
  },
  {
    difficulty: 'normal',
    stem: `用　古　可　右`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：用、古、可、右
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:036",
    chars: ["用","古","可","右"],
  },
  {
    difficulty: 'normal',
    stem: `古　可　右　石`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：古、可、右、石
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:037",
    chars: ["古","可","右","石"],
  },
  {
    difficulty: 'normal',
    stem: `可　右　石　本`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：可、右、石、本
规律：笔画数相等
核对：笔画数均为 5`,
    key: "hanzi-pattern:038",
    chars: ["可","右","石","本"],
  },
  {
    difficulty: 'normal',
    stem: `合　同　名　各`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：合、同、名、各
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:039",
    chars: ["合","同","名","各"],
  },
  {
    difficulty: 'normal',
    stem: `同　名　各　安`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：同、名、各、安
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:040",
    chars: ["同","名","各","安"],
  },
  {
    difficulty: 'normal',
    stem: `名　各　安　字`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：名、各、安、字
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:041",
    chars: ["名","各","安","字"],
  },
  {
    difficulty: 'normal',
    stem: `各　安　字　守`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：各、安、字、守
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:042",
    chars: ["各","安","字","守"],
  },
  {
    difficulty: 'normal',
    stem: `安　字　守　宅`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：安、字、守、宅
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:043",
    chars: ["安","字","守","宅"],
  },
  {
    difficulty: 'normal',
    stem: `字　守　宅　红`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：字、守、宅、红
规律：笔画数相等
核对：笔画数均为 6`,
    key: "hanzi-pattern:044",
    chars: ["字","守","宅","红"],
  },
  {
    difficulty: 'normal',
    stem: `我　找　身　走`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：我、找、身、走
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:045",
    chars: ["我","找","身","走"],
  },
  {
    difficulty: 'normal',
    stem: `找　身　走　来`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：找、身、走、来
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:046",
    chars: ["找","身","走","来"],
  },
  {
    difficulty: 'normal',
    stem: `身　走　来　求`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：身、走、来、求
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:047",
    chars: ["身","走","来","求"],
  },
  {
    difficulty: 'normal',
    stem: `走　来　求　更`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：走、来、求、更
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:048",
    chars: ["走","来","求","更"],
  },
  {
    difficulty: 'normal',
    stem: `来　求　更　束`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：来、求、更、束
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:049",
    chars: ["来","求","更","束"],
  },
  {
    difficulty: 'normal',
    stem: `求　更　束　里`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：求、更、束、里
规律：笔画数相等
核对：笔画数均为 7`,
    key: "hanzi-pattern:050",
    chars: ["求","更","束","里"],
  },
  {
    difficulty: 'normal',
    stem: `码　矿　国　固`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：码、矿、国、固
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:051",
    chars: ["码","矿","国","固"],
  },
  {
    difficulty: 'normal',
    stem: `矿　国　固　图`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：矿、国、固、图
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:052",
    chars: ["矿","国","固","图"],
  },
  {
    difficulty: 'normal',
    stem: `国　固　图　周`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：国、固、图、周
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:053",
    chars: ["国","固","图","周"],
  },
  {
    difficulty: 'normal',
    stem: `固　图　周　金`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：固、图、周、金
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:054",
    chars: ["固","图","周","金"],
  },
  {
    difficulty: 'normal',
    stem: `图　周　金　命`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：图、周、金、命
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:055",
    chars: ["图","周","金","命"],
  },
  {
    difficulty: 'normal',
    stem: `周　金　命　念`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：周、金、命、念
规律：笔画数相等
核对：笔画数均为 8`,
    key: "hanzi-pattern:056",
    chars: ["周","金","命","念"],
  },
  {
    difficulty: 'normal',
    stem: `钢　钟　律　春`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：钢、钟、律、春
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:057",
    chars: ["钢","钟","律","春"],
  },
  {
    difficulty: 'normal',
    stem: `钟　律　春　是`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：钟、律、春、是
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:058",
    chars: ["钟","律","春","是"],
  },
  {
    difficulty: 'normal',
    stem: `律　春　是　看`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：律、春、是、看
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:059",
    chars: ["律","春","是","看"],
  },
  {
    difficulty: 'normal',
    stem: `春　是　看　星`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：春、是、看、星
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:060",
    chars: ["春","是","看","星"],
  },
  {
    difficulty: 'normal',
    stem: `是　看　星　音`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：是、看、星、音
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:061",
    chars: ["是","看","星","音"],
  },
  {
    difficulty: 'normal',
    stem: `看　星　音　美`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：看、星、音、美
规律：笔画数相等
核对：笔画数均为 9`,
    key: "hanzi-pattern:062",
    chars: ["看","星","音","美"],
  },
  {
    difficulty: 'normal',
    stem: `家　宽　宾　宰`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：家、宽、宾、宰
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:063",
    chars: ["家","宽","宾","宰"],
  },
  {
    difficulty: 'normal',
    stem: `宽　宾　宰　高`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：宽、宾、宰、高
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:064",
    chars: ["宽","宾","宰","高"],
  },
  {
    difficulty: 'normal',
    stem: `宾　宰　高　离`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：宾、宰、高、离
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:065",
    chars: ["宾","宰","高","离"],
  },
  {
    difficulty: 'normal',
    stem: `宰　高　离　凉`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：宰、高、离、凉
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:066",
    chars: ["宰","高","离","凉"],
  },
  {
    difficulty: 'normal',
    stem: `高　离　凉　资`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：高、离、凉、资
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:067",
    chars: ["高","离","凉","资"],
  },
  {
    difficulty: 'normal',
    stem: `离　凉　资　案`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：离、凉、资、案
规律：笔画数相等
核对：笔画数均为 10`,
    key: "hanzi-pattern:068",
    chars: ["离","凉","资","案"],
  },
  {
    difficulty: 'normal',
    stem: `清　深　菜　银`,
    correct: "笔画数相等",
    distractors: ["笔画数累加1","笔画数累减1","都包含「艹」","都是开放区域","封闭区域个数相等"],
    explanation: `汉字：清、深、菜、银
规律：笔画数相等
核对：笔画数均为 11`,
    key: "hanzi-pattern:069",
    chars: ["清","深","菜","银"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　三　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、三、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:070",
    chars: ["一","二","三","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　三　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、三、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:071",
    chars: ["一","二","三","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　三　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、三、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:072",
    chars: ["一","二","三","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　干　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、干、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:073",
    chars: ["一","二","干","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　干　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、干、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:074",
    chars: ["一","二","干","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　干　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、干、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:075",
    chars: ["一","二","干","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　于　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、于、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:076",
    chars: ["一","二","于","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　于　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、于、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:077",
    chars: ["一","二","于","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　于　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、于、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:078",
    chars: ["一","二","于","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　下　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、下、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:079",
    chars: ["一","二","下","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　下　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、下、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:080",
    chars: ["一","二","下","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　下　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、下、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:081",
    chars: ["一","二","下","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　土　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、土、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:082",
    chars: ["一","二","土","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　土　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、土、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:083",
    chars: ["一","二","土","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　土　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、土、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:084",
    chars: ["一","二","土","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　士　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、士、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:085",
    chars: ["一","二","士","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　士　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、士、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:086",
    chars: ["一","二","士","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　士　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、士、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:087",
    chars: ["一","二","士","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　工　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、工、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:088",
    chars: ["一","二","工","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　工　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、工、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:089",
    chars: ["一","二","工","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　工　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、工、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:090",
    chars: ["一","二","工","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　才　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、才、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:091",
    chars: ["一","二","才","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　才　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、才、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:092",
    chars: ["一","二","才","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　才　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、才、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:093",
    chars: ["一","二","才","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　寸　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、寸、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:094",
    chars: ["一","二","寸","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　寸　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、寸、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:095",
    chars: ["一","二","寸","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　寸　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、寸、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:096",
    chars: ["一","二","寸","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　大　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、大、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:097",
    chars: ["一","二","大","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　大　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、大、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:098",
    chars: ["一","二","大","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　大　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、大、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:099",
    chars: ["一","二","大","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　丈　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、丈、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:100",
    chars: ["一","二","丈","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　丈　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、丈、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:101",
    chars: ["一","二","丈","天"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　丈　夫`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、丈、夫
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:102",
    chars: ["一","二","丈","夫"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　与　王`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、与、王
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:103",
    chars: ["一","二","与","王"],
  },
  {
    difficulty: 'normal',
    stem: `一　二　与　天`,
    correct: "笔画数累加1",
    distractors: ["笔画数累减1","笔画数相等","都包含「讠」","都是开放区域","上下结构"],
    explanation: `汉字：一、二、与、天
规律：笔画数累加1
核对：笔画数 1→2→3→4`,
    key: "hanzi-pattern:104",
    chars: ["一","二","与","天"],
  },
  {
    difficulty: 'normal',
    stem: `王　三　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、三、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:105",
    chars: ["王","三","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　三　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、三、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:106",
    chars: ["天","三","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　三　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、三、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:107",
    chars: ["夫","三","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　干　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、干、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:108",
    chars: ["王","干","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　干　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、干、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:109",
    chars: ["天","干","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　干　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、干、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:110",
    chars: ["夫","干","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　于　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、于、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:111",
    chars: ["王","于","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　于　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、于、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:112",
    chars: ["天","于","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　于　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、于、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:113",
    chars: ["夫","于","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　下　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、下、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:114",
    chars: ["王","下","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　下　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、下、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:115",
    chars: ["天","下","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　下　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、下、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:116",
    chars: ["夫","下","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　土　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、土、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:117",
    chars: ["王","土","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　土　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、土、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:118",
    chars: ["天","土","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　土　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、土、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:119",
    chars: ["夫","土","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　士　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、士、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:120",
    chars: ["王","士","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　士　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、士、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:121",
    chars: ["天","士","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　士　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、士、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:122",
    chars: ["夫","士","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　工　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、工、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:123",
    chars: ["王","工","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　工　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、工、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:124",
    chars: ["天","工","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　工　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、工、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:125",
    chars: ["夫","工","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　才　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、才、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:126",
    chars: ["王","才","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　才　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、才、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:127",
    chars: ["天","才","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　才　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、才、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:128",
    chars: ["夫","才","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　寸　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、寸、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:129",
    chars: ["王","寸","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　寸　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、寸、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:130",
    chars: ["天","寸","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　寸　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、寸、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:131",
    chars: ["夫","寸","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　大　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、大、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:132",
    chars: ["王","大","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　大　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、大、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:133",
    chars: ["天","大","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　大　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、大、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:134",
    chars: ["夫","大","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　丈　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、丈、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:135",
    chars: ["王","丈","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　丈　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、丈、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:136",
    chars: ["天","丈","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　丈　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、丈、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:137",
    chars: ["夫","丈","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `王　与　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：王、与、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:138",
    chars: ["王","与","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `天　与　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：天、与、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:139",
    chars: ["天","与","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `夫　与　二　一`,
    correct: "笔画数累减1",
    distractors: ["笔画数相等","笔画数累加1","都包含「石」","都包含「氵」","都包含「女」"],
    explanation: `汉字：夫、与、二、一
规律：笔画数累减1
核对：笔画数 4→3→2→1`,
    key: "hanzi-pattern:140",
    chars: ["夫","与","二","一"],
  },
  {
    difficulty: 'normal',
    stem: `一　乙　二　三`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：一、乙、二、三
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:141",
    chars: ["一","乙","二","三"],
  },
  {
    difficulty: 'normal',
    stem: `乙　二　三　十`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：乙、二、三、十
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:142",
    chars: ["乙","二","三","十"],
  },
  {
    difficulty: 'normal',
    stem: `二　三　十　八`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：二、三、十、八
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:143",
    chars: ["二","三","十","八"],
  },
  {
    difficulty: 'normal',
    stem: `三　十　八　人`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：三、十、八、人
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:144",
    chars: ["三","十","八","人"],
  },
  {
    difficulty: 'normal',
    stem: `十　八　人　大`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：十、八、人、大
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:145",
    chars: ["十","八","人","大"],
  },
  {
    difficulty: 'normal',
    stem: `八　人　大　天`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：八、人、大、天
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:146",
    chars: ["八","人","大","天"],
  },
  {
    difficulty: 'normal',
    stem: `人　大　天　木`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：人、大、天、木
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:147",
    chars: ["人","大","天","木"],
  },
  {
    difficulty: 'normal',
    stem: `大　天　木　本`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：大、天、木、本
规律：封闭区域个数相等
核对：封闭区域个数均为 0`,
    key: "hanzi-pattern:148",
    chars: ["大","天","木","本"],
  },
  {
    difficulty: 'normal',
    stem: `口　中　古　右`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：口、中、古、右
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:149",
    chars: ["口","中","古","右"],
  },
  {
    difficulty: 'normal',
    stem: `中　古　右　石`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：中、古、右、石
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:150",
    chars: ["中","古","右","石"],
  },
  {
    difficulty: 'normal',
    stem: `古　右　石　可`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：古、右、石、可
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:151",
    chars: ["古","右","石","可"],
  },
  {
    difficulty: 'normal',
    stem: `右　石　可　后`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：右、石、可、后
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:152",
    chars: ["右","石","可","后"],
  },
  {
    difficulty: 'normal',
    stem: `石　可　后　甲`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：石、可、后、甲
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:153",
    chars: ["石","可","后","甲"],
  },
  {
    difficulty: 'normal',
    stem: `可　后　甲　申`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：可、后、甲、申
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:154",
    chars: ["可","后","甲","申"],
  },
  {
    difficulty: 'normal',
    stem: `后　甲　申　电`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：后、甲、申、电
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:155",
    chars: ["后","甲","申","电"],
  },
  {
    difficulty: 'normal',
    stem: `甲　申　电　由`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：甲、申、电、由
规律：封闭区域个数相等
核对：封闭区域个数均为 1`,
    key: "hanzi-pattern:156",
    chars: ["甲","申","电","由"],
  },
  {
    difficulty: 'normal',
    stem: `且　四　吧　回`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：且、四、吧、回
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:157",
    chars: ["且","四","吧","回"],
  },
  {
    difficulty: 'normal',
    stem: `四　吧　回　田`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：四、吧、回、田
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:158",
    chars: ["四","吧","回","田"],
  },
  {
    difficulty: 'normal',
    stem: `吧　回　田　吕`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：吧、回、田、吕
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:159",
    chars: ["吧","回","田","吕"],
  },
  {
    difficulty: 'normal',
    stem: `回　田　吕　固`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：回、田、吕、固
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:160",
    chars: ["回","田","吕","固"],
  },
  {
    difficulty: 'normal',
    stem: `田　吕　固　昌`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：田、吕、固、昌
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:161",
    chars: ["田","吕","固","昌"],
  },
  {
    difficulty: 'normal',
    stem: `吕　固　昌　串`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：吕、固、昌、串
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:162",
    chars: ["吕","固","昌","串"],
  },
  {
    difficulty: 'normal',
    stem: `且　固　田　吕`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：且、固、田、吕
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:163",
    chars: ["且","固","田","吕"],
  },
  {
    difficulty: 'normal',
    stem: `串　且　固　四`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：串、且、固、四
规律：封闭区域个数相等
核对：封闭区域个数均为 2`,
    key: "hanzi-pattern:164",
    chars: ["串","且","固","四"],
  },
  {
    difficulty: 'normal',
    stem: `目　品　晶　磊`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：目、品、晶、磊
规律：封闭区域个数相等
核对：封闭区域个数均为 3`,
    key: "hanzi-pattern:165",
    chars: ["目","品","晶","磊"],
  },
  {
    difficulty: 'normal',
    stem: `品　晶　磊　鑫`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：品、晶、磊、鑫
规律：封闭区域个数相等
核对：封闭区域个数均为 3`,
    key: "hanzi-pattern:166",
    chars: ["品","晶","磊","鑫"],
  },
  {
    difficulty: 'normal',
    stem: `品　晶　鑫　磊`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：品、晶、鑫、磊
规律：封闭区域个数相等
核对：封闭区域个数均为 3`,
    key: "hanzi-pattern:167",
    chars: ["品","晶","鑫","磊"],
  },
  {
    difficulty: 'normal',
    stem: `磊　品　晶　目`,
    correct: "封闭区域个数相等",
    distractors: ["封闭区域个数累减1","封闭区域个数累加1","都是开放区域","都有封闭区域","都包含「钅」"],
    explanation: `汉字：磊、品、晶、目
规律：封闭区域个数相等
核对：封闭区域个数均为 3`,
    key: "hanzi-pattern:168",
    chars: ["磊","品","晶","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　且　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、且、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:169",
    chars: ["一","口","且","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　且　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、且、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:170",
    chars: ["一","口","且","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　且　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、且、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:171",
    chars: ["一","口","且","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　四　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、四、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:172",
    chars: ["一","口","四","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　四　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、四、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:173",
    chars: ["一","口","四","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　四　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、四、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:174",
    chars: ["一","口","四","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吧　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吧、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:175",
    chars: ["一","口","吧","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吧　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吧、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:176",
    chars: ["一","口","吧","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吧　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吧、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:177",
    chars: ["一","口","吧","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　回　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、回、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:178",
    chars: ["一","口","回","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　回　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、回、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:179",
    chars: ["一","口","回","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　回　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、回、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:180",
    chars: ["一","口","回","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　田　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、田、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:181",
    chars: ["一","口","田","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　田　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、田、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:182",
    chars: ["一","口","田","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　田　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、田、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:183",
    chars: ["一","口","田","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吕　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吕、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:184",
    chars: ["一","口","吕","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吕　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吕、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:185",
    chars: ["一","口","吕","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　吕　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、吕、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:186",
    chars: ["一","口","吕","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　固　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、固、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:187",
    chars: ["一","口","固","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　固　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、固、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:188",
    chars: ["一","口","固","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　固　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、固、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:189",
    chars: ["一","口","固","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　昌　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、昌、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:190",
    chars: ["一","口","昌","目"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　昌　品`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、昌、品
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:191",
    chars: ["一","口","昌","品"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　昌　晶`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、昌、晶
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:192",
    chars: ["一","口","昌","晶"],
  },
  {
    difficulty: 'normal',
    stem: `一　口　串　目`,
    correct: "封闭区域个数累加1",
    distractors: ["都有封闭区域","都是开放区域","封闭区域个数相等","封闭区域个数累减1","笔画数累加1"],
    explanation: `汉字：一、口、串、目
规律：封闭区域个数累加1
核对：封闭区域 0→1→2→3`,
    key: "hanzi-pattern:193",
    chars: ["一","口","串","目"],
  },
  {
    difficulty: 'normal',
    stem: `目　且　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、且、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:194",
    chars: ["目","且","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　且　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、且、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:195",
    chars: ["品","且","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　且　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、且、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:196",
    chars: ["晶","且","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　四　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、四、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:197",
    chars: ["目","四","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　四　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、四、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:198",
    chars: ["品","四","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　四　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、四、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:199",
    chars: ["晶","四","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　吧　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、吧、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:200",
    chars: ["目","吧","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　吧　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、吧、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:201",
    chars: ["品","吧","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　吧　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、吧、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:202",
    chars: ["晶","吧","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　回　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、回、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:203",
    chars: ["目","回","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　回　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、回、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:204",
    chars: ["品","回","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　回　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、回、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:205",
    chars: ["晶","回","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　田　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、田、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:206",
    chars: ["目","田","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　田　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、田、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:207",
    chars: ["品","田","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　田　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、田、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:208",
    chars: ["晶","田","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　吕　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、吕、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:209",
    chars: ["目","吕","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　吕　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、吕、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:210",
    chars: ["品","吕","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　吕　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、吕、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:211",
    chars: ["晶","吕","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　固　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、固、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:212",
    chars: ["目","固","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　固　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、固、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:213",
    chars: ["品","固","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　固　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、固、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:214",
    chars: ["晶","固","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　昌　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、昌、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:215",
    chars: ["目","昌","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　昌　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、昌、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:216",
    chars: ["品","昌","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `晶　昌　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：晶、昌、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:217",
    chars: ["晶","昌","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `目　串　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：目、串、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:218",
    chars: ["目","串","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `品　串　口　一`,
    correct: "封闭区域个数累减1",
    distractors: ["封闭区域个数累加1","都是开放区域","都有封闭区域","封闭区域个数相等","都包含「扌」"],
    explanation: `汉字：品、串、口、一
规律：封闭区域个数累减1
核对：封闭区域 3→2→1→0`,
    key: "hanzi-pattern:219",
    chars: ["品","串","口","一"],
  },
  {
    difficulty: 'normal',
    stem: `一　乙　丁　七`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：一、乙、丁、七
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:220",
    chars: ["一","乙","丁","七"],
  },
  {
    difficulty: 'normal',
    stem: `乙　丁　七　十`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：乙、丁、七、十
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:221",
    chars: ["乙","丁","七","十"],
  },
  {
    difficulty: 'normal',
    stem: `丁　七　十　干`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：丁、七、十、干
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:222",
    chars: ["丁","七","十","干"],
  },
  {
    difficulty: 'normal',
    stem: `七　十　干　土`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：七、十、干、土
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:223",
    chars: ["七","十","干","土"],
  },
  {
    difficulty: 'normal',
    stem: `十　干　土　王`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：十、干、土、王
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:224",
    chars: ["十","干","土","王"],
  },
  {
    difficulty: 'normal',
    stem: `干　土　王　开`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：干、土、王、开
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:225",
    chars: ["干","土","王","开"],
  },
  {
    difficulty: 'normal',
    stem: `土　王　开　井`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：土、王、开、井
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:226",
    chars: ["土","王","开","井"],
  },
  {
    difficulty: 'normal',
    stem: `王　开　井　天`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：王、开、井、天
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 1`,
    key: "hanzi-pattern:227",
    chars: ["王","开","井","天"],
  },
  {
    difficulty: 'normal',
    stem: `勺　八　儿　匀`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：勺、八、儿、匀
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:228",
    chars: ["勺","八","儿","匀"],
  },
  {
    difficulty: 'normal',
    stem: `八　儿　匀　勾`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：八、儿、匀、勾
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:229",
    chars: ["八","儿","匀","勾"],
  },
  {
    difficulty: 'normal',
    stem: `儿　八　匀　勾`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：儿、八、匀、勾
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:230",
    chars: ["儿","八","匀","勾"],
  },
  {
    difficulty: 'normal',
    stem: `勾　匀　八　勺`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：勾、匀、八、勺
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:231",
    chars: ["勾","匀","八","勺"],
  },
  {
    difficulty: 'normal',
    stem: `八　匀　儿　勾`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：八、匀、儿、勾
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:232",
    chars: ["八","匀","儿","勾"],
  },
  {
    difficulty: 'normal',
    stem: `勾　儿　勺　八`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：勾、儿、勺、八
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:233",
    chars: ["勾","儿","勺","八"],
  },
  {
    difficulty: 'normal',
    stem: `八　匀　儿　勺`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：八、匀、儿、勺
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:234",
    chars: ["八","匀","儿","勺"],
  },
  {
    difficulty: 'normal',
    stem: `勺　匀　八　勾`,
    correct: "笔画不相连部分个数相等",
    distractors: ["笔画不相连部分个数累减1","笔画不相连部分个数累加1","都包含「亻」","都包含「心」","都包含「口」"],
    explanation: `汉字：勺、匀、八、勾
规律：笔画不相连部分个数相等
核对：不相连部分个数均为 2`,
    key: "hanzi-pattern:235",
    chars: ["勺","匀","八","勾"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　小　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、小、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:236",
    chars: ["一","勺","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　小　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、小、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:237",
    chars: ["一","勺","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　川　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、川、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:238",
    chars: ["一","勺","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　川　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、川、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:239",
    chars: ["一","勺","川","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　彡　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、彡、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:240",
    chars: ["一","勺","彡","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　勺　彡　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、勺、彡、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:241",
    chars: ["一","勺","彡","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　小　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、小、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:242",
    chars: ["一","八","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　小　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、小、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:243",
    chars: ["一","八","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　川　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、川、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:244",
    chars: ["一","八","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　川　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、川、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:245",
    chars: ["一","八","川","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　彡　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、彡、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:246",
    chars: ["一","八","彡","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　八　彡　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、八、彡、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:247",
    chars: ["一","八","彡","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　小　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、小、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:248",
    chars: ["一","儿","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　小　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、小、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:249",
    chars: ["一","儿","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　川　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、川、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:250",
    chars: ["一","儿","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　川　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、川、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:251",
    chars: ["一","儿","川","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　彡　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、彡、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:252",
    chars: ["一","儿","彡","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　儿　彡　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、儿、彡、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:253",
    chars: ["一","儿","彡","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　匀　小　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、匀、小、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:254",
    chars: ["一","匀","小","心"],
  },
  {
    difficulty: 'normal',
    stem: `一　匀　小　必`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、匀、小、必
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:255",
    chars: ["一","匀","小","必"],
  },
  {
    difficulty: 'normal',
    stem: `一　匀　川　心`,
    correct: "笔画不相连部分个数累加1",
    distractors: ["笔画不相连部分个数相等","笔画不相连部分个数累减1","笔画数相等","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：一、匀、川、心
规律：笔画不相连部分个数累加1
核对：不相连部分 1→2→3→4（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:256",
    chars: ["一","匀","川","心"],
  },
  {
    difficulty: 'normal',
    stem: `心　小　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、小、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:257",
    chars: ["心","小","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　小　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、小、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:258",
    chars: ["必","小","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　川　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、川、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:259",
    chars: ["心","川","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　川　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、川、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:260",
    chars: ["必","川","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　彡　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、彡、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:261",
    chars: ["心","彡","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　彡　勺　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、彡、勺、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:262",
    chars: ["必","彡","勺","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　小　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、小、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:263",
    chars: ["心","小","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　小　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、小、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:264",
    chars: ["必","小","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　川　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、川、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:265",
    chars: ["心","川","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　川　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、川、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:266",
    chars: ["必","川","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　彡　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、彡、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:267",
    chars: ["心","彡","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　彡　八　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、彡、八、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:268",
    chars: ["必","彡","八","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　小　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、小、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:269",
    chars: ["心","小","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　小　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、小、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:270",
    chars: ["必","小","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　川　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、川、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:271",
    chars: ["心","川","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　川　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、川、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:272",
    chars: ["必","川","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　彡　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、彡、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:273",
    chars: ["心","彡","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　彡　儿　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、彡、儿、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:274",
    chars: ["必","彡","儿","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　小　匀　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、小、匀、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:275",
    chars: ["心","小","匀","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　小　匀　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、小、匀、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:276",
    chars: ["必","小","匀","一"],
  },
  {
    difficulty: 'normal',
    stem: `心　川　匀　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：心、川、匀、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:277",
    chars: ["心","川","匀","一"],
  },
  {
    difficulty: 'normal',
    stem: `必　川　匀　一`,
    correct: "笔画不相连部分个数累减1",
    distractors: ["笔画不相连部分个数累加1","笔画不相连部分个数相等","左右结构","半包围结构","都是开放区域"],
    explanation: `汉字：必、川、匀、一
规律：笔画不相连部分个数累减1
核对：不相连部分 4→3→2→1（开=1/勺=2/小=3）`,
    key: "hanzi-pattern:278",
    chars: ["必","川","匀","一"],
  },
  {
    difficulty: 'normal',
    stem: `明　休　村　河`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：明、休、村、河
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:279",
    chars: ["明","休","村","河"],
  },
  {
    difficulty: 'normal',
    stem: `休　村　河　林`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：休、村、河、林
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:280",
    chars: ["休","村","河","林"],
  },
  {
    difficulty: 'normal',
    stem: `村　河　林　秋`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：村、河、林、秋
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:281",
    chars: ["村","河","林","秋"],
  },
  {
    difficulty: 'normal',
    stem: `河　林　秋　灯`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：河、林、秋、灯
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:282",
    chars: ["河","林","秋","灯"],
  },
  {
    difficulty: 'normal',
    stem: `林　秋　灯　伟`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：林、秋、灯、伟
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:283",
    chars: ["林","秋","灯","伟"],
  },
  {
    difficulty: 'normal',
    stem: `秋　灯　伟　打`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：秋、灯、伟、打
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:284",
    chars: ["秋","灯","伟","打"],
  },
  {
    difficulty: 'normal',
    stem: `灯　伟　打　江`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：灯、伟、打、江
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:285",
    chars: ["灯","伟","打","江"],
  },
  {
    difficulty: 'normal',
    stem: `伟　打　江　说`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：伟、打、江、说
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:286",
    chars: ["伟","打","江","说"],
  },
  {
    difficulty: 'normal',
    stem: `打　江　说　银`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：打、江、说、银
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:287",
    chars: ["打","江","说","银"],
  },
  {
    difficulty: 'normal',
    stem: `江　说　银　她`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：江、说、银、她
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:288",
    chars: ["江","说","银","她"],
  },
  {
    difficulty: 'normal',
    stem: `说　银　她　朋`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：说、银、她、朋
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:289",
    chars: ["说","银","她","朋"],
  },
  {
    difficulty: 'normal',
    stem: `银　她　朋　羽`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：银、她、朋、羽
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:290",
    chars: ["银","她","朋","羽"],
  },
  {
    difficulty: 'normal',
    stem: `她　朋　羽　双`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：她、朋、羽、双
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:291",
    chars: ["她","朋","羽","双"],
  },
  {
    difficulty: 'normal',
    stem: `朋　羽　双　卧`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：朋、羽、双、卧
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:292",
    chars: ["朋","羽","双","卧"],
  },
  {
    difficulty: 'normal',
    stem: `羽　双　卧　低`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：羽、双、卧、低
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:293",
    chars: ["羽","双","卧","低"],
  },
  {
    difficulty: 'normal',
    stem: `双　卧　低　住`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：双、卧、低、住
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:294",
    chars: ["双","卧","低","住"],
  },
  {
    difficulty: 'normal',
    stem: `卧　低　住　依`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：卧、低、住、依
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:295",
    chars: ["卧","低","住","依"],
  },
  {
    difficulty: 'normal',
    stem: `低　住　依　估`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：低、住、依、估
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:296",
    chars: ["低","住","依","估"],
  },
  {
    difficulty: 'normal',
    stem: `住　依　估　推`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：住、依、估、推
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:297",
    chars: ["住","依","估","推"],
  },
  {
    difficulty: 'normal',
    stem: `依　估　推　提`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：依、估、推、提
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:298",
    chars: ["依","估","推","提"],
  },
  {
    difficulty: 'normal',
    stem: `估　推　提　扫`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：估、推、提、扫
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:299",
    chars: ["估","推","提","扫"],
  },
  {
    difficulty: 'normal',
    stem: `推　提　扫　折`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：推、提、扫、折
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:300",
    chars: ["推","提","扫","折"],
  },
  {
    difficulty: 'normal',
    stem: `提　扫　折　评`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：提、扫、折、评
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:301",
    chars: ["提","扫","折","评"],
  },
  {
    difficulty: 'normal',
    stem: `扫　折　评　论`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：扫、折、评、论
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:302",
    chars: ["扫","折","评","论"],
  },
  {
    difficulty: 'normal',
    stem: `折　评　论　诉`,
    correct: "左右结构",
    distractors: ["半包围结构","上下结构","独体结构","都有封闭区域","封闭区域个数累加1"],
    explanation: `汉字：折、评、论、诉
规律：左右结构
核对：四字均为左右结构`,
    key: "hanzi-pattern:303",
    chars: ["折","评","论","诉"],
  },
  {
    difficulty: 'normal',
    stem: `思　想　念　忘`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：思、想、念、忘
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:304",
    chars: ["思","想","念","忘"],
  },
  {
    difficulty: 'normal',
    stem: `想　念　忘　花`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：想、念、忘、花
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:305",
    chars: ["想","念","忘","花"],
  },
  {
    difficulty: 'normal',
    stem: `念　忘　花　草`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：念、忘、花、草
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:306",
    chars: ["念","忘","花","草"],
  },
  {
    difficulty: 'normal',
    stem: `忘　花　草　英`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：忘、花、草、英
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:307",
    chars: ["忘","花","草","英"],
  },
  {
    difficulty: 'normal',
    stem: `花　草　英　茶`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：花、草、英、茶
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:308",
    chars: ["花","草","英","茶"],
  },
  {
    difficulty: 'normal',
    stem: `草　英　茶　字`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：草、英、茶、字
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:309",
    chars: ["草","英","茶","字"],
  },
  {
    difficulty: 'normal',
    stem: `英　茶　字　安`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：英、茶、字、安
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:310",
    chars: ["英","茶","字","安"],
  },
  {
    difficulty: 'normal',
    stem: `茶　字　安　守`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：茶、字、安、守
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:311",
    chars: ["茶","字","安","守"],
  },
  {
    difficulty: 'normal',
    stem: `字　安　守　宅`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：字、安、守、宅
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:312",
    chars: ["字","安","守","宅"],
  },
  {
    difficulty: 'normal',
    stem: `安　守　宅　音`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：安、守、宅、音
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:313",
    chars: ["安","守","宅","音"],
  },
  {
    difficulty: 'normal',
    stem: `守　宅　音　意`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：守、宅、音、意
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:314",
    chars: ["守","宅","音","意"],
  },
  {
    difficulty: 'normal',
    stem: `宅　音　意　竟`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：宅、音、意、竟
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:315",
    chars: ["宅","音","意","竟"],
  },
  {
    difficulty: 'normal',
    stem: `音　意　竟　章`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：音、意、竟、章
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:316",
    chars: ["音","意","竟","章"],
  },
  {
    difficulty: 'normal',
    stem: `意　竟　章　尖`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：意、竟、章、尖
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:317",
    chars: ["意","竟","章","尖"],
  },
  {
    difficulty: 'normal',
    stem: `竟　章　尖　尘`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：竟、章、尖、尘
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:318",
    chars: ["竟","章","尖","尘"],
  },
  {
    difficulty: 'normal',
    stem: `章　尖　尘　肖`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：章、尖、尘、肖
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:319",
    chars: ["章","尖","尘","肖"],
  },
  {
    difficulty: 'normal',
    stem: `尖　尘　肖　省`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：尖、尘、肖、省
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:320",
    chars: ["尖","尘","肖","省"],
  },
  {
    difficulty: 'normal',
    stem: `尘　肖　省　冒`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：尘、肖、省、冒
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:321",
    chars: ["尘","肖","省","冒"],
  },
  {
    difficulty: 'normal',
    stem: `肖　省　冒　昌`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：肖、省、冒、昌
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:322",
    chars: ["肖","省","冒","昌"],
  },
  {
    difficulty: 'normal',
    stem: `省　冒　昌　星`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：省、冒、昌、星
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:323",
    chars: ["省","冒","昌","星"],
  },
  {
    difficulty: 'normal',
    stem: `冒　昌　星　晨`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：冒、昌、星、晨
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:324",
    chars: ["冒","昌","星","晨"],
  },
  {
    difficulty: 'normal',
    stem: `昌　星　晨　架`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：昌、星、晨、架
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:325",
    chars: ["昌","星","晨","架"],
  },
  {
    difficulty: 'normal',
    stem: `星　晨　架　案`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：星、晨、架、案
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:326",
    chars: ["星","晨","架","案"],
  },
  {
    difficulty: 'normal',
    stem: `晨　架　案　桌`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：晨、架、案、桌
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:327",
    chars: ["晨","架","案","桌"],
  },
  {
    difficulty: 'normal',
    stem: `架　案　桌　梨`,
    correct: "上下结构",
    distractors: ["半包围结构","左右结构","独体结构","都包含「亻」","笔画数累减1"],
    explanation: `汉字：架、案、桌、梨
规律：上下结构
核对：四字均为上下结构`,
    key: "hanzi-pattern:328",
    chars: ["架","案","桌","梨"],
  },
  {
    difficulty: 'normal',
    stem: `同　周　风　问`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：同、周、风、问
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:329",
    chars: ["同","周","风","问"],
  },
  {
    difficulty: 'normal',
    stem: `周　风　问　闲`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：周、风、问、闲
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:330",
    chars: ["周","风","问","闲"],
  },
  {
    difficulty: 'normal',
    stem: `风　问　闲　间`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：风、问、闲、间
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:331",
    chars: ["风","问","闲","间"],
  },
  {
    difficulty: 'normal',
    stem: `问　闲　间　闭`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：问、闲、间、闭
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:332",
    chars: ["问","闲","间","闭"],
  },
  {
    difficulty: 'normal',
    stem: `闲　间　闭　闯`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：闲、间、闭、闯
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:333",
    chars: ["闲","间","闭","闯"],
  },
  {
    difficulty: 'normal',
    stem: `间　闭　闯　压`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：间、闭、闯、压
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:334",
    chars: ["间","闭","闯","压"],
  },
  {
    difficulty: 'normal',
    stem: `闭　闯　压　厅`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：闭、闯、压、厅
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:335",
    chars: ["闭","闯","压","厅"],
  },
  {
    difficulty: 'normal',
    stem: `闯　压　厅　历`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：闯、压、厅、历
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:336",
    chars: ["闯","压","厅","历"],
  },
  {
    difficulty: 'normal',
    stem: `压　厅　历　厚`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：压、厅、历、厚
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:337",
    chars: ["压","厅","历","厚"],
  },
  {
    difficulty: 'normal',
    stem: `厅　历　厚　床`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：厅、历、厚、床
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:338",
    chars: ["厅","历","厚","床"],
  },
  {
    difficulty: 'normal',
    stem: `历　厚　床　序`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：历、厚、床、序
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:339",
    chars: ["历","厚","床","序"],
  },
  {
    difficulty: 'normal',
    stem: `厚　床　序　库`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：厚、床、序、库
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:340",
    chars: ["厚","床","序","库"],
  },
  {
    difficulty: 'normal',
    stem: `床　序　库　应`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：床、序、库、应
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:341",
    chars: ["床","序","库","应"],
  },
  {
    difficulty: 'normal',
    stem: `序　库　应　这`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：序、库、应、这
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:342",
    chars: ["序","库","应","这"],
  },
  {
    difficulty: 'normal',
    stem: `库　应　这　还`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：库、应、这、还
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:343",
    chars: ["库","应","这","还"],
  },
  {
    difficulty: 'normal',
    stem: `应　这　还　过`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：应、这、还、过
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:344",
    chars: ["应","这","还","过"],
  },
  {
    difficulty: 'normal',
    stem: `这　还　过　进`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：这、还、过、进
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:345",
    chars: ["这","还","过","进"],
  },
  {
    difficulty: 'normal',
    stem: `还　过　进　道`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：还、过、进、道
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:346",
    chars: ["还","过","进","道"],
  },
  {
    difficulty: 'normal',
    stem: `过　进　道　远`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：过、进、道、远
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:347",
    chars: ["过","进","道","远"],
  },
  {
    difficulty: 'normal',
    stem: `进　道　远　近`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：进、道、远、近
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:348",
    chars: ["进","道","远","近"],
  },
  {
    difficulty: 'normal',
    stem: `道　远　近　返`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：道、远、近、返
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:349",
    chars: ["道","远","近","返"],
  },
  {
    difficulty: 'normal',
    stem: `远　近　返　句`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：远、近、返、句
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:350",
    chars: ["远","近","返","句"],
  },
  {
    difficulty: 'normal',
    stem: `近　返　句　勾`,
    correct: "半包围结构",
    distractors: ["上下结构","左右结构","独体结构","封闭区域个数累加1","笔画数相等"],
    explanation: `汉字：近、返、句、勾
规律：半包围结构
核对：四字均为半包围结构`,
    key: "hanzi-pattern:351",
    chars: ["近","返","句","勾"],
  },
  {
    difficulty: 'normal',
    stem: `木　火　水　日`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：木、火、水、日
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:352",
    chars: ["木","火","水","日"],
  },
  {
    difficulty: 'normal',
    stem: `火　水　日　月`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：火、水、日、月
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:353",
    chars: ["火","水","日","月"],
  },
  {
    difficulty: 'normal',
    stem: `水　日　月　山`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：水、日、月、山
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:354",
    chars: ["水","日","月","山"],
  },
  {
    difficulty: 'normal',
    stem: `日　月　山　石`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：日、月、山、石
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:355",
    chars: ["日","月","山","石"],
  },
  {
    difficulty: 'normal',
    stem: `月　山　石　大`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：月、山、石、大
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:356",
    chars: ["月","山","石","大"],
  },
  {
    difficulty: 'normal',
    stem: `山　石　大　小`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：山、石、大、小
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:357",
    chars: ["山","石","大","小"],
  },
  {
    difficulty: 'normal',
    stem: `石　大　小　上`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：石、大、小、上
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:358",
    chars: ["石","大","小","上"],
  },
  {
    difficulty: 'normal',
    stem: `大　小　上　下`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：大、小、上、下
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:359",
    chars: ["大","小","上","下"],
  },
  {
    difficulty: 'normal',
    stem: `小　上　下　天`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：小、上、下、天
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:360",
    chars: ["小","上","下","天"],
  },
  {
    difficulty: 'normal',
    stem: `上　下　天　王`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：上、下、天、王
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:361",
    chars: ["上","下","天","王"],
  },
  {
    difficulty: 'normal',
    stem: `下　天　王　主`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：下、天、王、主
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:362",
    chars: ["下","天","王","主"],
  },
  {
    difficulty: 'normal',
    stem: `天　王　主　玉`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：天、王、主、玉
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:363",
    chars: ["天","王","主","玉"],
  },
  {
    difficulty: 'normal',
    stem: `王　主　玉　牛`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：王、主、玉、牛
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:364",
    chars: ["王","主","玉","牛"],
  },
  {
    difficulty: 'normal',
    stem: `主　玉　牛　羊`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：主、玉、牛、羊
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:365",
    chars: ["主","玉","牛","羊"],
  },
  {
    difficulty: 'normal',
    stem: `玉　牛　羊　马`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：玉、牛、羊、马
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:366",
    chars: ["玉","牛","羊","马"],
  },
  {
    difficulty: 'normal',
    stem: `牛　羊　马　鸟`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：牛、羊、马、鸟
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:367",
    chars: ["牛","羊","马","鸟"],
  },
  {
    difficulty: 'normal',
    stem: `羊　马　鸟　手`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：羊、马、鸟、手
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:368",
    chars: ["羊","马","鸟","手"],
  },
  {
    difficulty: 'normal',
    stem: `马　鸟　手　毛`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：马、鸟、手、毛
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:369",
    chars: ["马","鸟","手","毛"],
  },
  {
    difficulty: 'normal',
    stem: `鸟　手　毛　爪`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：鸟、手、毛、爪
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:370",
    chars: ["鸟","手","毛","爪"],
  },
  {
    difficulty: 'normal',
    stem: `手　毛　爪　牙`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：手、毛、爪、牙
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:371",
    chars: ["手","毛","爪","牙"],
  },
  {
    difficulty: 'normal',
    stem: `毛　爪　牙　心`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：毛、爪、牙、心
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:372",
    chars: ["毛","爪","牙","心"],
  },
  {
    difficulty: 'normal',
    stem: `爪　牙　心　力`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：爪、牙、心、力
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:373",
    chars: ["爪","牙","心","力"],
  },
  {
    difficulty: 'normal',
    stem: `牙　心　力　刀`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：牙、心、力、刀
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:374",
    chars: ["牙","心","力","刀"],
  },
  {
    difficulty: 'normal',
    stem: `心　力　刀　弓`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：心、力、刀、弓
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:375",
    chars: ["心","力","刀","弓"],
  },
  {
    difficulty: 'normal',
    stem: `力　刀　弓　车`,
    correct: "独体结构",
    distractors: ["半包围结构","左右结构","上下结构","笔画数相等","上下对称"],
    explanation: `汉字：力、刀、弓、车
规律：独体结构
核对：四字均为独体结构`,
    key: "hanzi-pattern:376",
    chars: ["力","刀","弓","车"],
  },
  {
    difficulty: 'normal',
    stem: `古　山　大　木`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：古、山、大、木
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:377",
    chars: ["古","山","大","木"],
  },
  {
    difficulty: 'normal',
    stem: `山　大　木　非`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：山、大、木、非
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:378",
    chars: ["山","大","木","非"],
  },
  {
    difficulty: 'normal',
    stem: `大　木　非　米`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：大、木、非、米
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:379",
    chars: ["大","木","非","米"],
  },
  {
    difficulty: 'normal',
    stem: `木　非　米　天`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：木、非、米、天
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:380",
    chars: ["木","非","米","天"],
  },
  {
    difficulty: 'normal',
    stem: `非　米　天　夫`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：非、米、天、夫
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:381",
    chars: ["非","米","天","夫"],
  },
  {
    difficulty: 'normal',
    stem: `米　天　夫　火`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：米、天、夫、火
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:382",
    chars: ["米","天","夫","火"],
  },
  {
    difficulty: 'normal',
    stem: `天　夫　火　开`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：天、夫、火、开
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:383",
    chars: ["天","夫","火","开"],
  },
  {
    difficulty: 'normal',
    stem: `夫　火　开　丰`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：夫、火、开、丰
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:384",
    chars: ["夫","火","开","丰"],
  },
  {
    difficulty: 'normal',
    stem: `火　开　丰　井`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：火、开、丰、井
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:385",
    chars: ["火","开","丰","井"],
  },
  {
    difficulty: 'normal',
    stem: `开　丰　井　未`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：开、丰、井、未
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:386",
    chars: ["开","丰","井","未"],
  },
  {
    difficulty: 'normal',
    stem: `丰　井　未　末`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：丰、井、未、末
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:387",
    chars: ["丰","井","未","末"],
  },
  {
    difficulty: 'normal',
    stem: `井　未　末　来`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：井、未、末、来
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:388",
    chars: ["井","未","末","来"],
  },
  {
    difficulty: 'normal',
    stem: `未　末　来　本`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：未、末、来、本
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:389",
    chars: ["未","末","来","本"],
  },
  {
    difficulty: 'normal',
    stem: `末　来　本　夹`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：末、来、本、夹
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:390",
    chars: ["末","来","本","夹"],
  },
  {
    difficulty: 'normal',
    stem: `来　本　夹　羊`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：来、本、夹、羊
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:391",
    chars: ["来","本","夹","羊"],
  },
  {
    difficulty: 'normal',
    stem: `本　夹　羊　半`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：本、夹、羊、半
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:392",
    chars: ["本","夹","羊","半"],
  },
  {
    difficulty: 'normal',
    stem: `夹　羊　半　平`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：夹、羊、半、平
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:393",
    chars: ["夹","羊","半","平"],
  },
  {
    difficulty: 'normal',
    stem: `羊　半　平　辛`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：羊、半、平、辛
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:394",
    chars: ["羊","半","平","辛"],
  },
  {
    difficulty: 'normal',
    stem: `半　平　辛　林`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：半、平、辛、林
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:395",
    chars: ["半","平","辛","林"],
  },
  {
    difficulty: 'normal',
    stem: `平　辛　林　羽`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：平、辛、林、羽
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:396",
    chars: ["平","辛","林","羽"],
  },
  {
    difficulty: 'normal',
    stem: `辛　林　羽　朋`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：辛、林、羽、朋
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:397",
    chars: ["辛","林","羽","朋"],
  },
  {
    difficulty: 'normal',
    stem: `羽　朋　双　且`,
    correct: "左右对称",
    distractors: ["上下对称","笔画数相等","上下结构","都有封闭区域","封闭区域个数相等"],
    explanation: `汉字：羽、朋、双、且
规律：左右对称
核对：四字均为左右对称（沿竖轴对折重合，如古/山/大；不含小/八）`,
    key: "hanzi-pattern:398",
    chars: ["羽","朋","双","且"],
  },
  {
    difficulty: 'normal',
    stem: `巨　臣　叵　目`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：巨、臣、叵、目
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:399",
    chars: ["巨","臣","叵","目"],
  },
  {
    difficulty: 'normal',
    stem: `臣　叵　目　中`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：臣、叵、目、中
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:400",
    chars: ["臣","叵","目","中"],
  },
  {
    difficulty: 'normal',
    stem: `叵　目　中　日`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：叵、目、中、日
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:401",
    chars: ["叵","目","中","日"],
  },
  {
    difficulty: 'normal',
    stem: `叵　臣　目　回`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：叵、臣、目、回
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:402",
    chars: ["叵","臣","目","回"],
  },
  {
    difficulty: 'normal',
    stem: `中　回　二　巨`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：中、回、二、巨
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:403",
    chars: ["中","回","二","巨"],
  },
  {
    difficulty: 'normal',
    stem: `目　臣　叵　申`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：目、臣、叵、申
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:404",
    chars: ["目","臣","叵","申"],
  },
  {
    difficulty: 'normal',
    stem: `亚　回　日　巨`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：亚、回、日、巨
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:405",
    chars: ["亚","回","日","巨"],
  },
  {
    difficulty: 'normal',
    stem: `亚　中　臣　田`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：亚、中、臣、田
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:406",
    chars: ["亚","中","臣","田"],
  },
  {
    difficulty: 'normal',
    stem: `目　臣　二　三`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：目、臣、二、三
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:407",
    chars: ["目","臣","二","三"],
  },
  {
    difficulty: 'normal',
    stem: `目　田　回　叵`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：目、田、回、叵
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:408",
    chars: ["目","田","回","叵"],
  },
  {
    difficulty: 'normal',
    stem: `目　田　日　叵`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：目、田、日、叵
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:409",
    chars: ["目","田","日","叵"],
  },
  {
    difficulty: 'normal',
    stem: `三　田　叵　日`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：三、田、叵、日
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:410",
    chars: ["三","田","叵","日"],
  },
  {
    difficulty: 'normal',
    stem: `回　田　申　巨`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：回、田、申、巨
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:411",
    chars: ["回","田","申","巨"],
  },
  {
    difficulty: 'normal',
    stem: `叵　目　口　田`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：叵、目、口、田
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:412",
    chars: ["叵","目","口","田"],
  },
  {
    difficulty: 'normal',
    stem: `三　亚　目　叵`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：三、亚、目、叵
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:413",
    chars: ["三","亚","目","叵"],
  },
  {
    difficulty: 'normal',
    stem: `二　叵　申　口`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：二、叵、申、口
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:414",
    chars: ["二","叵","申","口"],
  },
  {
    difficulty: 'normal',
    stem: `申　三　巨　目`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：申、三、巨、目
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:415",
    chars: ["申","三","巨","目"],
  },
  {
    difficulty: 'normal',
    stem: `臣　申　亚　中`,
    correct: "上下对称",
    distractors: ["左右对称","都包含「心」","都包含「火」","都包含「女」","笔画不相连部分个数累减1"],
    explanation: `汉字：臣、申、亚、中
规律：上下对称
核对：四字均为上下对称（沿横轴对折重合，如巨/目/中）`,
    key: "hanzi-pattern:416",
    chars: ["臣","申","亚","中"],
  },
  {
    difficulty: 'normal',
    stem: `园　困　国　且`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：园、困、国、且
规律：都有封闭区域
核对：均有封闭区域（1、1、1、2）`,
    key: "hanzi-pattern:417",
    chars: ["园","困","国","且"],
  },
  {
    difficulty: 'normal',
    stem: `困　国　且　四`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：困、国、且、四
规律：都有封闭区域
核对：均有封闭区域（1、1、2、2）`,
    key: "hanzi-pattern:418",
    chars: ["困","国","且","四"],
  },
  {
    difficulty: 'normal',
    stem: `国　且　四　吧`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：国、且、四、吧
规律：都有封闭区域
核对：均有封闭区域（1、2、2、2）`,
    key: "hanzi-pattern:419",
    chars: ["国","且","四","吧"],
  },
  {
    difficulty: 'normal',
    stem: `固　昌　串　目`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：固、昌、串、目
规律：都有封闭区域
核对：均有封闭区域（2、2、2、3）`,
    key: "hanzi-pattern:420",
    chars: ["固","昌","串","目"],
  },
  {
    difficulty: 'normal',
    stem: `昌　串　目　品`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：昌、串、目、品
规律：都有封闭区域
核对：均有封闭区域（2、2、3、3）`,
    key: "hanzi-pattern:421",
    chars: ["昌","串","目","品"],
  },
  {
    difficulty: 'normal',
    stem: `串　目　品　晶`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：串、目、品、晶
规律：都有封闭区域
核对：均有封闭区域（2、3、3、3）`,
    key: "hanzi-pattern:422",
    chars: ["串","目","品","晶"],
  },
  {
    difficulty: 'normal',
    stem: `晶　磊　鑫　器`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：晶、磊、鑫、器
规律：都有封闭区域
核对：均有封闭区域（3、3、3、4）`,
    key: "hanzi-pattern:423",
    chars: ["晶","磊","鑫","器"],
  },
  {
    difficulty: 'normal',
    stem: `右　且　由　鑫`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：右、且、由、鑫
规律：都有封闭区域
核对：均有封闭区域（1、2、1、3）`,
    key: "hanzi-pattern:424",
    chars: ["右","且","由","鑫"],
  },
  {
    difficulty: 'normal',
    stem: `回　自　且　图`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：回、自、且、图
规律：都有封闭区域
核对：均有封闭区域（2、1、2、1）`,
    key: "hanzi-pattern:425",
    chars: ["回","自","且","图"],
  },
  {
    difficulty: 'normal',
    stem: `固　昌　同　可`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：固、昌、同、可
规律：都有封闭区域
核对：均有封闭区域（2、2、1、1）`,
    key: "hanzi-pattern:426",
    chars: ["固","昌","同","可"],
  },
  {
    difficulty: 'normal',
    stem: `申　品　磊　昌`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：申、品、磊、昌
规律：都有封闭区域
核对：均有封闭区域（1、3、3、2）`,
    key: "hanzi-pattern:427",
    chars: ["申","品","磊","昌"],
  },
  {
    difficulty: 'normal',
    stem: `昌　石　磊　国`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：昌、石、磊、国
规律：都有封闭区域
核对：均有封闭区域（2、1、3、1）`,
    key: "hanzi-pattern:428",
    chars: ["昌","石","磊","国"],
  },
  {
    difficulty: 'normal',
    stem: `四　晶　电　自`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：四、晶、电、自
规律：都有封闭区域
核对：均有封闭区域（2、3、1、1）`,
    key: "hanzi-pattern:429",
    chars: ["四","晶","电","自"],
  },
  {
    difficulty: 'normal',
    stem: `口　四　晶　右`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：口、四、晶、右
规律：都有封闭区域
核对：均有封闭区域（1、2、3、1）`,
    key: "hanzi-pattern:430",
    chars: ["口","四","晶","右"],
  },
  {
    difficulty: 'normal',
    stem: `把　鑫　串　右`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：把、鑫、串、右
规律：都有封闭区域
核对：均有封闭区域（1、3、2、1）`,
    key: "hanzi-pattern:431",
    chars: ["把","鑫","串","右"],
  },
  {
    difficulty: 'normal',
    stem: `吕　国　名　后`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：吕、国、名、后
规律：都有封闭区域
核对：均有封闭区域（2、1、1、1）`,
    key: "hanzi-pattern:432",
    chars: ["吕","国","名","后"],
  },
  {
    difficulty: 'normal',
    stem: `四　电　田　可`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：四、电、田、可
规律：都有封闭区域
核对：均有封闭区域（2、1、2、1）`,
    key: "hanzi-pattern:433",
    chars: ["四","电","田","可"],
  },
  {
    difficulty: 'normal',
    stem: `后　困　国　品`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：后、困、国、品
规律：都有封闭区域
核对：均有封闭区域（1、1、1、3）`,
    key: "hanzi-pattern:434",
    chars: ["后","困","国","品"],
  },
  {
    difficulty: 'normal',
    stem: `名　田　串　西`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：名、田、串、西
规律：都有封闭区域
核对：均有封闭区域（1、2、2、1）`,
    key: "hanzi-pattern:435",
    chars: ["名","田","串","西"],
  },
  {
    difficulty: 'normal',
    stem: `口　电　吕　图`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：口、电、吕、图
规律：都有封闭区域
核对：均有封闭区域（1、1、2、1）`,
    key: "hanzi-pattern:436",
    chars: ["口","电","吕","图"],
  },
  {
    difficulty: 'normal',
    stem: `石　各　白　器`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：石、各、白、器
规律：都有封闭区域
核对：均有封闭区域（1、1、1、4）`,
    key: "hanzi-pattern:437",
    chars: ["石","各","白","器"],
  },
  {
    difficulty: 'normal',
    stem: `申　图　磊　石`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：申、图、磊、石
规律：都有封闭区域
核对：均有封闭区域（1、1、3、1）`,
    key: "hanzi-pattern:438",
    chars: ["申","图","磊","石"],
  },
  {
    difficulty: 'normal',
    stem: `各　后　四　古`,
    correct: "都有封闭区域",
    distractors: ["都是开放区域","封闭区域个数累加1","封闭区域个数累减1","封闭区域个数相等","都包含「氵」"],
    explanation: `汉字：各、后、四、古
规律：都有封闭区域
核对：均有封闭区域（1、1、2、1）`,
    key: "hanzi-pattern:439",
    chars: ["各","后","四","古"],
  },
  {
    difficulty: 'normal',
    stem: `天　木　本　未`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：天、木、本、未
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:440",
    chars: ["天","木","本","未"],
  },
  {
    difficulty: 'normal',
    stem: `木　本　未　末`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：木、本、未、末
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:441",
    chars: ["木","本","未","末"],
  },
  {
    difficulty: 'normal',
    stem: `本　未　末　王`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：本、未、末、王
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:442",
    chars: ["本","未","末","王"],
  },
  {
    difficulty: 'normal',
    stem: `未　末　王　主`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：未、末、王、主
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:443",
    chars: ["未","末","王","主"],
  },
  {
    difficulty: 'normal',
    stem: `末　王　主　井`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：末、王、主、井
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:444",
    chars: ["末","王","主","井"],
  },
  {
    difficulty: 'normal',
    stem: `王　主　井　开`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：王、主、井、开
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:445",
    chars: ["王","主","井","开"],
  },
  {
    difficulty: 'normal',
    stem: `主　井　开　川`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：主、井、开、川
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:446",
    chars: ["主","井","开","川"],
  },
  {
    difficulty: 'normal',
    stem: `井　开　川　小`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：井、开、川、小
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:447",
    chars: ["井","开","川","小"],
  },
  {
    difficulty: 'normal',
    stem: `开　川　小　上`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：开、川、小、上
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:448",
    chars: ["开","川","小","上"],
  },
  {
    difficulty: 'normal',
    stem: `川　小　上　下`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：川、小、上、下
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:449",
    chars: ["川","小","上","下"],
  },
  {
    difficulty: 'normal',
    stem: `小　上　下　工`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：小、上、下、工
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:450",
    chars: ["小","上","下","工"],
  },
  {
    difficulty: 'normal',
    stem: `上　下　工　土`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：上、下、工、土
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:451",
    chars: ["上","下","工","土"],
  },
  {
    difficulty: 'normal',
    stem: `下　工　土　干`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：下、工、土、干
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:452",
    chars: ["下","工","土","干"],
  },
  {
    difficulty: 'normal',
    stem: `工　土　干　丰`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：工、土、干、丰
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:453",
    chars: ["工","土","干","丰"],
  },
  {
    difficulty: 'normal',
    stem: `土　干　丰　手`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：土、干、丰、手
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:454",
    chars: ["土","干","丰","手"],
  },
  {
    difficulty: 'normal',
    stem: `干　丰　手　毛`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：干、丰、手、毛
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:455",
    chars: ["干","丰","手","毛"],
  },
  {
    difficulty: 'normal',
    stem: `丰　手　毛　火`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：丰、手、毛、火
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:456",
    chars: ["丰","手","毛","火"],
  },
  {
    difficulty: 'normal',
    stem: `手　毛　火　水`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：手、毛、火、水
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:457",
    chars: ["手","毛","火","水"],
  },
  {
    difficulty: 'normal',
    stem: `毛　火　水　永`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：毛、火、水、永
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:458",
    chars: ["毛","火","水","永"],
  },
  {
    difficulty: 'normal',
    stem: `火　水　永　丈`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：火、水、永、丈
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:459",
    chars: ["火","水","永","丈"],
  },
  {
    difficulty: 'normal',
    stem: `水　永　丈　才`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：水、永、丈、才
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:460",
    chars: ["水","永","丈","才"],
  },
  {
    difficulty: 'normal',
    stem: `永　丈　才　夫`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：永、丈、才、夫
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:461",
    chars: ["永","丈","才","夫"],
  },
  {
    difficulty: 'normal',
    stem: `丈　才　夫　无`,
    correct: "都是开放区域",
    distractors: ["都有封闭区域","封闭区域个数累加1","封闭区域个数相等","封闭区域个数累减1","笔画数累减1"],
    explanation: `汉字：丈、才、夫、无
规律：都是开放区域
核对：封闭区域均为 0（开放字形）`,
    key: "hanzi-pattern:462",
    chars: ["丈","才","夫","无"],
  },
  {
    difficulty: 'normal',
    stem: `旺　昨　时　明`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：旺、昨、时、明
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:463",
    chars: ["旺","昨","时","明"],
  },
  {
    difficulty: 'normal',
    stem: `时　明　星　春`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：时、明、星、春
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:464",
    chars: ["时","明","星","春"],
  },
  {
    difficulty: 'normal',
    stem: `星　春　是　香`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：星、春、是、香
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:465",
    chars: ["星","春","是","香"],
  },
  {
    difficulty: 'normal',
    stem: `是　香　复　晴`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：是、香、复、晴
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:466",
    chars: ["是","香","复","晴"],
  },
  {
    difficulty: 'normal',
    stem: `复　晴　晶　昭`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：复、晴、晶、昭
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:467",
    chars: ["复","晴","晶","昭"],
  },
  {
    difficulty: 'normal',
    stem: `晶　昭　昌　易`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：晶、昭、昌、易
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:468",
    chars: ["晶","昭","昌","易"],
  },
  {
    difficulty: 'normal',
    stem: `昌　易　昔　昏`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：昌、易、昔、昏
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:469",
    chars: ["昌","易","昔","昏"],
  },
  {
    difficulty: 'normal',
    stem: `昔　昏　晓　檀`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：昔、昏、晓、檀
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:470",
    chars: ["昔","昏","晓","檀"],
  },
  {
    difficulty: 'normal',
    stem: `是　晴　星　昭`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：是、晴、星、昭
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:471",
    chars: ["是","晴","星","昭"],
  },
  {
    difficulty: 'normal',
    stem: `晶　昨　星　明`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：晶、昨、星、明
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:472",
    chars: ["晶","昨","星","明"],
  },
  {
    difficulty: 'normal',
    stem: `是　易　星　明`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：是、易、星、明
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:473",
    chars: ["是","易","星","明"],
  },
  {
    difficulty: 'normal',
    stem: `早　晴　复　旱`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：早、晴、复、旱
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:474",
    chars: ["早","晴","复","旱"],
  },
  {
    difficulty: 'normal',
    stem: `是　昨　昌　昭`,
    correct: "都包含「日」",
    distractors: ["都包含「亻」","都包含「扌」","都包含「氵」","都包含「艹」","都包含「月」"],
    explanation: `汉字：是、昨、昌、昭
规律：都包含「日」
核对：四字均含可见部件「日」`,
    key: "hanzi-pattern:475",
    chars: ["是","昨","昌","昭"],
  },
  {
    difficulty: 'normal',
    stem: `明　朋　有　青`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：明、朋、有、青
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:476",
    chars: ["明","朋","有","青"],
  },
  {
    difficulty: 'normal',
    stem: `有　青　期　朝`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：有、青、期、朝
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:477",
    chars: ["有","青","期","朝"],
  },
  {
    difficulty: 'normal',
    stem: `期　朝　胜　脂`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：期、朝、胜、脂
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:478",
    chars: ["期","朝","胜","脂"],
  },
  {
    difficulty: 'normal',
    stem: `胜　脂　朗　肤`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：胜、脂、朗、肤
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:479",
    chars: ["胜","脂","朗","肤"],
  },
  {
    difficulty: 'normal',
    stem: `朗　肤　肥　肯`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：朗、肤、肥、肯
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:480",
    chars: ["朗","肤","肥","肯"],
  },
  {
    difficulty: 'normal',
    stem: `肥　肯　肩　背`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：肥、肯、肩、背
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:481",
    chars: ["肥","肯","肩","背"],
  },
  {
    difficulty: 'normal',
    stem: `肩　背　胡　能`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：肩、背、胡、能
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:482",
    chars: ["肩","背","胡","能"],
  },
  {
    difficulty: 'normal',
    stem: `胡　能　服　前`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：胡、能、服、前
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:483",
    chars: ["胡","能","服","前"],
  },
  {
    difficulty: 'normal',
    stem: `能　期　脂　肩`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：能、期、脂、肩
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:484",
    chars: ["能","期","脂","肩"],
  },
  {
    difficulty: 'normal',
    stem: `朝　肩　肤　肥`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：朝、肩、肤、肥
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:485",
    chars: ["朝","肩","肤","肥"],
  },
  {
    difficulty: 'normal',
    stem: `肤　期　脂　服`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：肤、期、脂、服
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:486",
    chars: ["肤","期","脂","服"],
  },
  {
    difficulty: 'normal',
    stem: `朋　肩　青　期`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：朋、肩、青、期
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:487",
    chars: ["朋","肩","青","期"],
  },
  {
    difficulty: 'normal',
    stem: `背　明　朋　胜`,
    correct: "都包含「月」",
    distractors: ["都包含「口」","都包含「艹」","都包含「木」","都包含「心」","都包含「钅」"],
    explanation: `汉字：背、明、朋、胜
规律：都包含「月」
核对：四字均含可见部件「月」`,
    key: "hanzi-pattern:488",
    chars: ["背","明","朋","胜"],
  },
  {
    difficulty: 'normal',
    stem: `林　森　村　杜`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：林、森、村、杜
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:489",
    chars: ["林","森","村","杜"],
  },
  {
    difficulty: 'normal',
    stem: `村　杜　桃　李`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：村、杜、桃、李
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:490",
    chars: ["村","杜","桃","李"],
  },
  {
    difficulty: 'normal',
    stem: `桃　李　椅　桌`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：桃、李、椅、桌
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:491",
    chars: ["桃","李","椅","桌"],
  },
  {
    difficulty: 'normal',
    stem: `椅　桌　柜　架`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：椅、桌、柜、架
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:492",
    chars: ["椅","桌","柜","架"],
  },
  {
    difficulty: 'normal',
    stem: `柜　架　桥　树`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：柜、架、桥、树
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:493",
    chars: ["柜","架","桥","树"],
  },
  {
    difficulty: 'normal',
    stem: `桥　树　根　枝`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：桥、树、根、枝
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:494",
    chars: ["桥","树","根","枝"],
  },
  {
    difficulty: 'normal',
    stem: `根　枝　材　松`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：根、枝、材、松
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:495",
    chars: ["根","枝","材","松"],
  },
  {
    difficulty: 'normal',
    stem: `材　松　柏　柳`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：材、松、柏、柳
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:496",
    chars: ["材","松","柏","柳"],
  },
  {
    difficulty: 'normal',
    stem: `柏　柳　梅　棠`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：柏、柳、梅、棠
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:497",
    chars: ["柏","柳","梅","棠"],
  },
  {
    difficulty: 'normal',
    stem: `杜　村　森　桃`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：杜、村、森、桃
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:498",
    chars: ["杜","村","森","桃"],
  },
  {
    difficulty: 'normal',
    stem: `松　材　柳　柏`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：松、材、柳、柏
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:499",
    chars: ["松","材","柳","柏"],
  },
  {
    difficulty: 'normal',
    stem: `桌　桥　枝　柜`,
    correct: "都包含「木」",
    distractors: ["都包含「艹」","都包含「口」","都包含「亻」","都包含「心」","都包含「女」"],
    explanation: `汉字：桌、桥、枝、柜
规律：都包含「木」
核对：四字均含可见部件「木」`,
    key: "hanzi-pattern:500",
    chars: ["桌","桥","枝","柜"],
  },
]
