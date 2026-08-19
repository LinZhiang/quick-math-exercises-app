/**
 * 资料分析 AI 出题（增长、比重、平均数、倍数、指数、拉动、顺差）
 * 由 scripts/split-deepseek.mjs 从 deepseek.ts 拆出。对外仍从 @/services/deepseek 导出。
 */
import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/app/aiJsonParse'
import {
  CHINESE_MCQ_CORRECTNESS_RULES,
  isPlayableFourChoiceMcq,
  isPlayableLogicReasonMcq,
} from '@/utils/chinese/chineseMcqAiFields'
import {
  collectVocabRelatedFillOptionBank,
  parseVocabRelatedLearningPack,
  parseVocabRelatedQuizList,
  type VocabRelatedKind,
  type VocabRelatedLearningPack,
  type VocabRelatedQuizQuestion,
  type VocabRelatedSourceRow,
} from '@/utils/chinese/vocabRelatedLearning'
import {
  parseCharLiteracyRelatedLearningPack,
  parseCharLiteracyRelatedQuizList,
  type CharLiteracyRelatedLearningPack,
  type CharLiteracyRelatedQuizQuestion,
  type CharLiteracyRelatedSourceRow,
} from '@/utils/chinese/charLiteracyRelatedLearning'
import {
  buildCharLiteracyQuestionFromMcq,
  CHAR_LITERACY_QUESTION_COUNT,
  parseCharLiteracyMcqAiObject,
  type CharLiteracyQuestion,
} from '@/utils/chinese/charLiteracyPractice'
import {
  buildGeographyCommonSenseQuestionFromMcq,
  GEOGRAPHY_COMMON_SENSE_QUESTION_COUNT,
  parseGeographyCommonSenseMcqAiObject,
  type GeographyCommonSenseQuestion,
} from '@/utils/chinese/geographyCommonSensePractice'
import {
  buildHistoryCommonSenseQuestionFromMcq,
  HISTORY_COMMON_SENSE_QUESTION_COUNT,
  parseHistoryCommonSenseMcqAiObject,
  type HistoryCommonSenseQuestion,
} from '@/utils/chinese/historyCommonSensePractice'
import {
  buildLifeCommonSenseQuestionFromMcq,
  LIFE_COMMON_SENSE_QUESTION_COUNT,
  parseLifeCommonSenseMcqAiObject,
  type LifeCommonSenseQuestion,
} from '@/utils/chinese/lifeCommonSensePractice'
import {
  buildIdiomQuestionFromMcq,
  IDIOM_RECOGNITION_QUESTION_COUNT,
  parseIdiomMcqAiObject,
  type IdiomRecognitionQuestion,
} from '@/utils/chinese/idiomRecognitionPractice'
import {
  buildPartyHistoryQuestionFromMcq,
  PARTY_HISTORY_QUESTION_COUNT,
  parsePartyHistoryMcqAiObject,
  type PartyHistoryQuestion,
} from '@/utils/chinese/partyHistoryPractice'
import {
  buildPoetryQuestionFromMcq,
  parsePoetryMcqAiObject,
  POETRY_RECOGNITION_QUESTION_COUNT,
  type PoetryRecognitionQuestion,
} from '@/utils/chinese/poetryRecognitionPractice'
import {
  buildPoetDrillQuestionFromMcq,
  parsePoetDrillMcqAiObject,
  POET_DRILL_QUESTION_COUNT,
  type PoetDrillQuestion,
} from '@/utils/chinese/poetDrillPractice'
import {
  extractPoetDrillAllowlist,
  poetDrillQuestionInMaterial,
} from '@/utils/chinese/poetDrillMaterial'
import {
  buildCurrentAffairsDrillQuestionFromMcq,
  CURRENT_AFFAIRS_DRILL_QUESTION_COUNT,
  CURRENT_AFFAIRS_SENTENCE_FILL_QUESTION_COUNT,
  CURRENT_AFFAIRS_SENTENCE_ORDER_QUESTION_COUNT,
  currentAffairsDrillSourceInList,
  parseCurrentAffairsDrillMcqAiObject,
  type CurrentAffairsDrillQuestion,
} from '@/utils/chinese/currentAffairsDrillPractice'
import {
  buildTheoryPolicyQuestionFromMcq,
  THEORY_POLICY_QUESTION_COUNT,
  parseTheoryPolicyMcqAiObject,
  type TheoryPolicyQuestion,
} from '@/utils/chinese/theoryPolicyPractice'
import {
  buildTranslationReasonQuestionFromMcq,
  parseTranslationReasonMcqAiObject,
  TRANSLATION_REASON_QUESTION_COUNT,
  type TranslationReasonDifficulty,
  type TranslationReasonQuestion,
} from '@/utils/logic/translationReasonPractice'
import {
  buildComboArrangeQuestionFromMcq,
  parseComboArrangeMcqAiObject,
  COMBO_ARRANGE_QUESTION_COUNT,
  type ComboArrangeDifficulty,
  type ComboArrangeQuestion,
} from '@/utils/logic/comboArrangePractice'
import {
  buildTruthFalseQuestionFromMcq,
  parseTruthFalseMcqAiObject,
  TRUTH_FALSE_QUESTION_COUNT,
  type TruthFalseDifficulty,
  type TruthFalseQuestion,
} from '@/utils/logic/truthFalsePractice'
import {
  buildEvalReasonQuestionFromMcq,
  parseEvalReasonMcqAiObject,
  EVAL_REASON_QUESTION_COUNT,
  type EvalReasonDifficulty,
  type EvalReasonQuestion,
} from '@/utils/logic/evalReasonPractice'
import {
  buildStrengthenReasonQuestionFromMcq,
  parseStrengthenReasonMcqAiObject,
  STRENGTHEN_REASON_QUESTION_COUNT,
  type StrengthenReasonDifficulty,
  type StrengthenReasonQuestion,
} from '@/utils/logic/strengthenReasonPractice'
import {
  buildWeakenReasonQuestionFromMcq,
  parseWeakenReasonMcqAiObject,
  WEAKEN_REASON_QUESTION_COUNT,
  type WeakenReasonDifficulty,
  type WeakenReasonQuestion,
} from '@/utils/logic/weakenReasonPractice'
import {
  buildDailyConclusionQuestionFromMcq,
  parseDailyConclusionMcqAiObject,
  DAILY_CONCLUSION_QUESTION_COUNT,
  type DailyConclusionDifficulty,
  type DailyConclusionQuestion,
} from '@/utils/logic/dailyConclusionPractice'
import {
  buildExplainPhenomQuestionFromMcq,
  parseExplainPhenomMcqAiObject,
  EXPLAIN_PHENOM_QUESTION_COUNT,
  type ExplainPhenomDifficulty,
  type ExplainPhenomQuestion,
} from '@/utils/logic/explainPhenomPractice'
import {
  buildLegalCommonSenseQuestionFromMcq,
  LEGAL_COMMON_SENSE_QUESTION_COUNT,
  parseLegalCommonSenseMcqAiObject,
  type LegalCommonSenseQuestion,
} from '@/utils/chinese/legalCommonSensePractice'
import {
  buildEconomyCommonSenseQuestionFromMcq,
  ECONOMY_COMMON_SENSE_QUESTION_COUNT,
  parseEconomyCommonSenseMcqAiObject,
  type EconomyCommonSenseQuestion,
} from '@/utils/chinese/economyCommonSensePractice'
import {
  buildWordMemorizationQuestionFromMcq,
  WORD_MEMORIZATION_QUESTION_COUNT,
  parseWordMemorizationMcqAiObject,
  type WordMemorizationQuestion,
} from '@/utils/chinese/wordMemorizationPractice'
import {
  buildClassicalChineseQuestionFromMcq,
  CLASSICAL_CHINESE_QUESTION_COUNT,
  parseClassicalChineseMcqAiObject,
  type ClassicalChineseQuestion,
} from '@/utils/chinese/classicalChinesePractice'
import {
  buildRhetoricUsageQuestionFromMcq,
  RHETORIC_USAGE_QUESTION_COUNT,
  parseRhetoricUsageMcqAiObject,
  type RhetoricUsageQuestion,
} from '@/utils/chinese/rhetoricUsagePractice'
import {
  buildReadingComprehensionQuestionFromMcq,
  READING_COMPREHENSION_QUESTION_COUNT,
  parseReadingComprehensionMcqAiObject,
  readingModeNeedsAbsoluteCorrectSlot,
  readingQuestionHasGroundedAbsoluteCorrect,
  type ChineseReadingQuestionType,
  type ReadingComprehensionQuestion,
  readingComprehensionQuestionTypeLabel,
} from '@/utils/chinese/readingComprehensionPractice'
import {
  buildGeometryQuestionFromSeed,
  buildLocalGeometryPaper,
  GEOMETRY_QUESTION_COUNT,
  pickGeometrySeeds,
  type GeometryDifficulty,
  type GeometryQuestion,
  type GeometrySeed,
} from '@/utils/math/geometryPractice'
import {
  buildLocalProbabilityHardPaper,
  buildProbabilityQuestionFromSeed,
  pickProbabilityHardSeeds,
  PROBABILITY_QUESTION_COUNT,
  type ProbabilityQuestion,
  type ProbabilitySeed,
} from '@/utils/math/probabilityPractice'
import {
  FUNCTION_GRAPH_QUESTION_COUNT,
  buildFunctionGraphQuestionFromSeed,
  buildLocalFunctionGraphPaper,
  pickFunctionGraphSeeds,
  type FunctionGraphDifficulty,
  type FunctionGraphQuestion,
  type FunctionGraphSeed,
} from '@/utils/math/functionGraphPractice'
import {
  buildDataAnalysisQuestionFromMcq,
  DATA_ANALYSIS_QUESTION_COUNT,
  parseDataAnalysisMcqAiObject,
  type DataAnalysisDifficulty,
  type DataAnalysisQuestion,
} from '@/utils/data-analysis/dataAnalysisPractice'
import {
  buildGrowthGeneralQuestionFromMcq,
  buildGrowthHardFromSeedTemplate,
  detectGrowthEasySkillId,
  diagnoseGrowthGeneralBuildReject,
  GROWTH_GENERAL_QUESTION_COUNT,
  parseGrowthGeneralMcqAiObject,
  pickGrowthEasySkillPlan,
  pickGrowthHardFallbackSeed,
  pickGrowthHardSeedTemplates,
  takeGrowthEasyLocalSeeds,
  takeGrowthHardLocalSeeds,
  type GrowthEasySkillId,
  type GrowthEasySkillSlot,
  type GrowthHardSeedTemplate,
  type GrowthHardSkillSlot,
  type GrowthGeneralDifficulty,
  type GrowthGeneralQuestion,
} from '@/utils/data-analysis/dataAnalysisGrowthPractice'
import {
  buildGrowthInterYearHardFromSeedTemplate,
  buildGrowthInterYearQuestionFromMcq,
  detectGrowthInterYearEasySkillId,
  GROWTH_INTER_YEAR_QUESTION_COUNT,
  parseGrowthInterYearMcqAiObject,
  pickGrowthInterYearEasySkillPlan,
  pickGrowthInterYearHardFallbackSeed,
  pickGrowthInterYearHardSeedTemplates,
  takeGrowthInterYearEasyLocalSeeds,
  takeGrowthInterYearHardLocalSeeds,
  type GrowthInterYearDifficulty,
  type GrowthInterYearEasySkillId,
  type GrowthInterYearEasySkillSlot,
  type GrowthInterYearHardSeedTemplate,
  type GrowthInterYearQuestion,
} from '@/utils/data-analysis/dataAnalysisGrowthInterYearPractice'
import {
  buildGrowthAvgAnnualHardFromSeedTemplate,
  buildGrowthAvgAnnualQuestionFromMcq,
  detectGrowthAvgAnnualEasySkillId,
  GROWTH_AVG_ANNUAL_QUESTION_COUNT,
  parseGrowthAvgAnnualMcqAiObject,
  pickGrowthAvgAnnualEasySkillPlan,
  pickGrowthAvgAnnualHardFallbackSeed,
  pickGrowthAvgAnnualHardSeedTemplates,
  takeGrowthAvgAnnualEasyLocalSeeds,
  takeGrowthAvgAnnualHardLocalSeeds,
  type GrowthAvgAnnualDifficulty,
  type GrowthAvgAnnualEasySkillId,
  type GrowthAvgAnnualEasySkillSlot,
  type GrowthAvgAnnualHardSeedTemplate,
  type GrowthAvgAnnualQuestion,
} from '@/utils/data-analysis/dataAnalysisGrowthAvgAnnualPractice'
import {
  buildGrowthMixedHardFromSeedTemplate,
  buildGrowthMixedQuestionFromMcq,
  detectGrowthMixedEasySkillId,
  GROWTH_MIXED_HARD_SKILL_SLOTS,
  GROWTH_MIXED_QUESTION_COUNT,
  parseGrowthMixedMcqAiObject,
  pickGrowthMixedEasySkillPlan,
  pickGrowthMixedHardSeedTemplates,
  takeGrowthMixedEasyLocalSeeds,
  takeGrowthMixedHardLocalSeeds,
  type GrowthMixedDifficulty,
  type GrowthMixedEasySkillId,
  type GrowthMixedEasySkillSlot,
  type GrowthMixedHardSeedTemplate,
  type GrowthMixedQuestion,
} from '@/utils/data-analysis/dataAnalysisGrowthMixedPractice'
import {
  buildProportionBasicHardFromSeedTemplate,
  buildProportionBasicQuestionFromMcq,
  detectProportionBasicEasySkillId,
  PROPORTION_BASIC_HARD_SKILL_SLOTS,
  PROPORTION_BASIC_QUESTION_COUNT,
  parseProportionBasicMcqAiObject,
  pickProportionBasicEasySkillPlan,
  pickProportionBasicHardSeedTemplates,
  takeProportionBasicEasyLocalSeeds,
  takeProportionBasicHardLocalSeeds,
  type ProportionBasicDifficulty,
  type ProportionBasicEasySkillId,
  type ProportionBasicEasySkillSlot,
  type ProportionBasicHardSeedTemplate,
  type ProportionBasicQuestion,
} from '@/utils/data-analysis/dataAnalysisProportionBasicPractice'
import {
  buildProportionBaseHardFromSeedTemplate,
  buildProportionBaseQuestionFromMcq,
  detectProportionBaseEasySkillId,
  PROPORTION_BASE_HARD_SKILL_SLOTS,
  PROPORTION_BASE_QUESTION_COUNT,
  parseProportionBaseMcqAiObject,
  pickProportionBaseEasySkillPlan,
  pickProportionBaseHardSeedTemplates,
  takeProportionBaseEasyLocalSeeds,
  takeProportionBaseHardLocalSeeds,
  type ProportionBaseDifficulty,
  type ProportionBaseEasySkillId,
  type ProportionBaseEasySkillSlot,
  type ProportionBaseHardSeedTemplate,
  type ProportionBaseQuestion,
} from '@/utils/data-analysis/dataAnalysisProportionBasePractice'
import {
  buildAverageBasicHardFromSeedTemplate,
  buildAverageBasicQuestionFromMcq,
  detectAverageBasicEasySkillId,
  AVERAGE_BASIC_HARD_SKILL_SLOTS,
  AVERAGE_BASIC_QUESTION_COUNT,
  parseAverageBasicMcqAiObject,
  pickAverageBasicEasySkillPlan,
  pickAverageBasicHardSeedTemplates,
  takeAverageBasicEasyLocalSeeds,
  takeAverageBasicHardLocalSeeds,
  type AverageBasicDifficulty,
  type AverageBasicEasySkillId,
  type AverageBasicEasySkillSlot,
  type AverageBasicHardSeedTemplate,
  type AverageBasicQuestion,
} from '@/utils/data-analysis/dataAnalysisAverageBasicPractice'
import {
  buildAverageBaseHardFromSeedTemplate,
  buildAverageBaseQuestionFromMcq,
  detectAverageBaseEasySkillId,
  AVERAGE_BASE_HARD_SKILL_SLOTS,
  AVERAGE_BASE_QUESTION_COUNT,
  parseAverageBaseMcqAiObject,
  pickAverageBaseEasySkillPlan,
  pickAverageBaseHardSeedTemplates,
  takeAverageBaseEasyLocalSeeds,
  takeAverageBaseHardLocalSeeds,
  type AverageBaseDifficulty,
  type AverageBaseEasySkillId,
  type AverageBaseEasySkillSlot,
  type AverageBaseHardSeedTemplate,
  type AverageBaseQuestion,
} from '@/utils/data-analysis/dataAnalysisAverageBasePractice'
import {
  buildMultipleBasicHardFromSeedTemplate,
  buildMultipleBasicQuestionFromMcq,
  detectMultipleBasicEasySkillId,
  MULTIPLE_BASIC_HARD_SKILL_SLOTS,
  MULTIPLE_BASIC_QUESTION_COUNT,
  parseMultipleBasicMcqAiObject,
  pickMultipleBasicEasySkillPlan,
  pickMultipleBasicHardSeedTemplates,
  takeMultipleBasicEasyLocalSeeds,
  takeMultipleBasicHardLocalSeeds,
  type MultipleBasicDifficulty,
  type MultipleBasicEasySkillId,
  type MultipleBasicEasySkillSlot,
  type MultipleBasicHardSeedTemplate,
  type MultipleBasicQuestion,
} from '@/utils/data-analysis/dataAnalysisMultipleBasicPractice'
import {
  buildMultipleBaseHardFromSeedTemplate,
  buildMultipleBaseQuestionFromMcq,
  detectMultipleBaseEasySkillId,
  MULTIPLE_BASE_HARD_SKILL_SLOTS,
  MULTIPLE_BASE_QUESTION_COUNT,
  parseMultipleBaseMcqAiObject,
  pickMultipleBaseEasySkillPlan,
  pickMultipleBaseHardSeedTemplates,
  takeMultipleBaseEasyLocalSeeds,
  takeMultipleBaseHardLocalSeeds,
  type MultipleBaseDifficulty,
  type MultipleBaseEasySkillId,
  type MultipleBaseEasySkillSlot,
  type MultipleBaseHardSeedTemplate,
  type MultipleBaseQuestion,
} from '@/utils/data-analysis/dataAnalysisMultipleBasePractice'
import {
  buildIndexHardFromSeedTemplate,
  buildIndexQuestionFromMcq,
  detectIndexEasySkillId,
  INDEX_HARD_SKILL_SLOTS,
  INDEX_QUESTION_COUNT,
  parseIndexMcqAiObject,
  pickIndexEasySkillPlan,
  pickIndexHardSeedTemplates,
  takeIndexEasyLocalSeeds,
  takeIndexHardLocalSeeds,
  type IndexDifficulty,
  type IndexEasySkillId,
  type IndexEasySkillSlot,
  type IndexHardSeedTemplate,
  type IndexQuestion,
} from '@/utils/data-analysis/dataAnalysisIndexPractice'
import {
  buildPullHardFromSeedTemplate,
  buildPullQuestionFromMcq,
  detectPullEasySkillId,
  PULL_HARD_SKILL_SLOTS,
  PULL_QUESTION_COUNT,
  parsePullMcqAiObject,
  pickPullEasySkillPlan,
  pickPullHardSeedTemplates,
  takePullEasyLocalSeeds,
  takePullHardLocalSeeds,
  type PullDifficulty,
  type PullEasySkillId,
  type PullEasySkillSlot,
  type PullHardSeedTemplate,
  type PullQuestion,
} from '@/utils/data-analysis/dataAnalysisPullPractice'
import {
  buildSurplusHardFromSeedTemplate,
  buildSurplusQuestionFromMcq,
  detectSurplusEasySkillId,
  SURPLUS_HARD_SKILL_SLOTS,
  SURPLUS_QUESTION_COUNT,
  parseSurplusMcqAiObject,
  pickSurplusEasySkillPlan,
  pickSurplusHardSeedTemplates,
  takeSurplusEasyLocalSeeds,
  takeSurplusHardLocalSeeds,
  type SurplusDifficulty,
  type SurplusEasySkillId,
  type SurplusEasySkillSlot,
  type SurplusHardSeedTemplate,
  type SurplusQuestion,
} from '@/utils/data-analysis/dataAnalysisSurplusPractice'
import {
  hasStoredDeepSeekApiKey,
} from '@/utils/app/deepseekApiKeyStore'
import {
  isWenguApiReadyForCurrentUser,
  isWenguLoggedIn,
  WENGU_LOGIN_REQUIRED_HINT,
  wenguAuthTick,
} from '@/utils/computer/wenguAuthStore'
import { WENGU_MEMBER_CUSTOM_API_HINT } from '@/utils/computer/wenguApiOrigin'
import {
  aiChatCompletion,
  type AiMessage,
} from '@/services/ai'
import { aiRequestProgressText, getAiProvider, type AiProvider } from '@/utils/app/aiProviderStore'
import { buildAvoidTermsHint, deepseekChatRaw, normalizeAvoidTerm } from '@/services/aiQuizCore'

const DATA_ANALYSIS_PERCENT_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「百分数与百分点」。
百分数=比例/增速本身；百分点=两个百分数之差。

【时期写法】优先用自然月份/季度说法：八月、八月份、七月、上半年、一季度、前三季度。
禁止「1-8月」「1至8月」「1—8月累计」等数字连写区间（读着别扭，也不符合本题展示习惯）。
比较前后期时写「比七月」「比上月」「比一季度」，不要写「比1至7月累计」。
材料与题干同一套说法。

【材料】可以保留与设问无关的数字或「回落/加快×个百分点」等迷惑条件（干扰阅读），不要为了「干净」删掉它们。

【对应材料必须点明·会圈·严校】有 passage 时：evidenceSpans 填 2～5 个「短」原文子串（须与 passage 逐字一致）。
必须且仅圈：解析真正用到的 ① 专名主体（如「股份制企业」「高技术制造业增加值」）；② 算式用到的数据（如「同比增长5.2%」「回落1.1个百分点」）。
禁止圈：时期词 alone（「八月份」「前八个月」）、解析写明忽略/无关/迷惑的指标与数字、题干未用到的同名指标第二处。
比较题两侧主体与两侧解题数据都要圈全；主体与数据分开圈，禁止整句一条。
method 写短做法名，如「两现期增速作差」「现期±百分点还原」「先还原再比差」。

【解析·算术必须对】explanation 须含：① 点明对应材料哪几处（与 evidenceSpans 一致）；② 做法；③ 可逐步验算的算式（如 3.7%-1.1%=2.6%，再 5.2%-2.6%=2.6）。
算式每一步加减必须算术正确；末步结果必须等于 correct 的数值。禁止出现「5.3%-5.1%=0.3」这类口算错误。
若有迷惑条件，在句末单独写「忽略……」，不要把迷惑数据写进算式。

【干扰选项要贴】三个 distractors 贴近正确答案，优先用材料中出现的数字做简单加减
（如正确 0.2，可用 0.2+0.4、|0.2−0.4|、材料里另一单独百分点等）。

选项单位四项一致：求差一律「N个百分点」（不要写%）。
只输出合法 JSON，不要 markdown 围栏。
`.trim()

const DATA_ANALYSIS_TOPIC_SEEDS = [
  '风力与光伏发电增速',
  '货物进出口增速',
  '社会消费品零售增速',
  '固定资产投资增速',
  '规模以上工业增加值增速',
  '居民消费价格涨幅',
  '城镇调查失业率相关增速对比',
  '高技术制造业与传统制造业增速',
  '货运量与客运量增速',
  '商品房销售面积增速',
]

function dataAnalysisPercentFormat(difficulty: DataAnalysisDifficulty): string {
  if (difficulty === 'easy') {
    return `
【简单】一步/两步：现期±百分点还原，或两增速求差。
passage 可短材料（约 30～60 字）或 ""；有材料时 evidenceSpans 必填 2～3 个短短语（仅解题用专名+数据），无材料填 []。
四个选项一律「N个百分点」。distractors 用数字简单加减，贴近正确项。
method：短做法名。explanation：对应材料短引 + 做法 + 算术正确的算式（末步=correct）。
JSON：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。
`.trim()
  }
  return `
【复杂】难度明显高于简单题：passage 约 60～110 字，至少 3 个百分数/百分点数据，须含 1～2 项迷惑条件（如无关指标增速，或「加快/回落×个百分点」但设问并不用它）。
题型优先两步：① 先用现期±百分点还原基期再比较；② 或先算两组增速差再与另一条件结合；禁止纯「读一个现成差值」的送分题。
时期只用「八月/前八个月/上半年」等，禁止「1-8月」「2024年1-8月」。
四个选项一律「N个百分点」；distractors 由材料数字简单加减得到，贴近正确项。
evidenceSpans：3～5 个短短语，且必须与 explanation 算式用到的专名/数据一一对应；迷惑条件不要进 spans。
method：短做法名（如「先还原再比差」「两现期增速作差」）。
explanation：两侧对应材料都点名 + 做法 + 逐步算式（每步算术正确，末步等于 correct）；句末可写忽略哪项迷惑条件。
JSON：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。
`.trim()
}

function tryBuildDataAnalysisQuestion(
  item: unknown,
  difficulty: DataAnalysisDifficulty,
  seq: number,
): DataAnalysisQuestion | null {
  const fields = parseDataAnalysisMcqAiObject(item)
  if (!fields) return null
  return buildDataAnalysisQuestionFromMcq({
    ...fields,
    difficulty,
    seq,
  })
}

async function requestOneDataAnalysisPercentMcq(input: {
  difficulty: DataAnalysisDifficulty
  seq: number
  avoidTerms: string[]
  topicHint?: string
  temperature?: number
}): Promise<DataAnalysisQuestion | null> {
  const diffLabel = input.difficulty === 'easy' ? '简单' : '复杂'
  const format = dataAnalysisPercentFormat(input.difficulty)
  const avoidHint = buildAvoidTermsHint('资料分析材料主题', input.avoidTerms)
  const topicLine = input.topicHint
    ? `本题材料主题请围绕「${input.topicHint}」（不要写成其它主题）。`
    : ''
  const raw = await deepseekChatRaw(
    [
      `请生成 1 道「百分数与百分点」四选一，难度 **${diffLabel}**。`,
      topicLine,
      format,
      avoidHint,
      `运算必须正确（算式逐步可验算，末步=correct）。evidenceSpans 只含解析用到的专名与数据，禁止圈迷惑条件/裸时期词。有材料时必须给 evidenceSpans+method；explanation 含对应材料+做法+算式。干扰项贴近正确项。四个选项单位必须一致。仅返回一个 JSON 对象。`,
    ]
      .filter(Boolean)
      .join('\n'),
    {
      system: DATA_ANALYSIS_PERCENT_SYSTEM,
      temperature: input.temperature ?? 0.5,
      maxTokens: input.difficulty === 'hard' ? 1100 : 560,
    },
  )
  return tryBuildDataAnalysisQuestion(parseAiJsonObjectLenient(raw), input.difficulty, input.seq)
}

export async function requestDataAnalysisPercentMcqs(input: {
  count?: number
  difficulty: DataAnalysisDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<DataAnalysisQuestion[]> {
  const count = input.count ?? DATA_ANALYSIS_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = difficulty === 'easy' ? '简单' : '复杂'
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const format = dataAnalysisPercentFormat(difficulty)
  const historyHint = buildAvoidTermsHint('资料分析材料主题', [...historyBlocked])

  const deduped: DataAnalysisQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)

  /** 本批只按指纹去重；主题撞车时仍可保留不同题干 */
  const pushIfNew = (q: DataAnalysisQuestion | null, strictTerm = false) => {
    if (!q) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    if (strictTerm && termKey && usedTerms.has(termKey)) return false
    // 历史主题尽量避开，但不因本批主题重复直接丢弃（否则并行易只剩 4 题）
    if (termKey && historyBlocked.has(termKey) && strictTerm) return false
    deduped.push(q)
    if (termKey) usedTerms.add(termKey)
    return true
  }

  const topicFor = (i: number, wave: number) =>
    DATA_ANALYSIS_TOPIC_SEEDS[(i + wave * 3) % DATA_ANALYSIS_TOPIC_SEEDS.length]!

  // —— 首轮：按主题种子并行，降低撞题 ——
  input.onProgress?.(
    difficulty === 'hard'
      ? `并行生成 ${count} 道复杂题…`
      : aiRequestProgressText(`资料分析·百分数与百分点（${diffLabel}）`),
  )

  if (difficulty === 'easy') {
    try {
      const raw = await deepseekChatRaw(
        [
          `请生成 **${count} 道**「百分数与百分点」四选一，难度 **${diffLabel}**。`,
          format,
          historyHint,
          `term 尽量不同；有材料时给 evidenceSpans+method（仅解题用信息）；解析含对应材料+做法+算术正确算式；干扰项贴近正确项；JSON 数组长度恰好 ${count}。`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        { system: DATA_ANALYSIS_PERCENT_SYSTEM, temperature: 0.45, maxTokens: 3200 },
      )
      const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
      parsed.forEach((item, idx) =>
        pushIfNew(tryBuildDataAnalysisQuestion(item, difficulty, idx + 1)),
      )
    } catch {
      /* fall through to补题 */
    }
  } else {
    const wave1 = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        requestOneDataAnalysisPercentMcq({
          difficulty,
          seq: i + 1,
          avoidTerms: [...historyBlocked],
          topicHint: topicFor(i, 0),
          temperature: 0.48,
        }).catch(() => null),
      ),
    )
    for (const q of wave1) pushIfNew(q)
  }

  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  // —— 缺口：并行补（带不同主题种子）最多 3 波 ——
  for (let wave = 1; deduped.length < count && wave <= 3; wave++) {
    const need = count - deduped.length
    input.onProgress?.(`补生成 ${need} 题（第 ${wave} 波）…`)
    const more = await Promise.all(
      Array.from({ length: need }, (_, i) =>
        requestOneDataAnalysisPercentMcq({
          difficulty,
          seq: 100 * wave + i,
          avoidTerms: [...usedTerms],
          topicHint: topicFor(i + deduped.length, wave),
          temperature: 0.5 + wave * 0.05,
        }).catch(() => null),
      ),
    )
    for (const q of more) pushIfNew(q)
  }

  // —— 仍不足：串行兜底，直到凑满或达到尝试上限 ——
  let guard = 0
  while (deduped.length < count && guard < 12) {
    guard += 1
    const slot = deduped.length + 1
    input.onProgress?.(`兜底补第 ${slot}/${count} 题（${guard}/12）…`)
    const q = await requestOneDataAnalysisPercentMcq({
      difficulty,
      seq: 900 + guard,
      avoidTerms: [...usedTerms],
      topicHint: topicFor(guard + 7, guard),
      temperature: 0.55 + (guard % 5) * 0.05,
    }).catch(() => null)
    pushIfNew(q)
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题，请稍后重试`)
  }
  return deduped.slice(0, count)
}

/** 一般增长：强制豆包（复杂题含统计图结构化数据，DeepSeek 不适用） */
const GROWTH_GENERAL_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——一般增长」。

【核心概念】基期/基期值、现期/现期值、增长量、增长率（增幅）；区分同比与环比。
常用关系：基期+增长量=现期；增长率=增长量/基期；现期=基期×(1+增长率)；基期=现期/(1+增长率)；增长量=现期−基期。

【高亮 evidenceSpans】只给短原文：专名 + 裸数字或「数字+单位」。

【复杂题·图题必须一致】
1. chart 必须同时含 type=bar 与 type=line，categories 与各 values 等长且≥4；
2. explanation 里用到的现期量/增速必须从图中照抄，禁止编造图上没有的数；
3. 求增长量最值年份时，必须用柱值相减，答案年份与计算结果一致；
4. 折线增速若用于设问，数值必须等于 line.values。

【解析】须含可验算算式（用 =）；算术正确；末步与 correct 一致（年份题除外）。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

const GROWTH_TOPIC_SEEDS = [
  '风力光伏发电增速',
  '国内财政收入',
  '第一产业增加值',
  '互联网业务收入',
  '研究生在学人数',
  '棉花单位面积产量',
  '居民人均消费支出名义与实际增长',
  '社会消费品零售额',
  '固定资产投资完成额',
  '城镇新增就业',
]

function growthGeneralFormat(difficulty: GrowthGeneralDifficulty): string {
  if (difficulty === 'easy') {
    return `
【简单·考点轮换】每题只考下面指定的一个知识点（见用户消息【本考点】），不要擅自改成「现期−增长量求基期」。
一轮卷子会覆盖：基期/现期/增长量/增长率、现期÷(1+r)、基期×(1+r)、增长量=现期×r/(1+r)、百分点还原增速、同比与环比。
passage 1～2 句（30～70 字），数字尽量整十。不要 chart（chart:null）。
evidenceSpans 示例：["国内财政收入","1200","200"]。
JSON 单对象：term,passage,chart:null,stem,correct,distractors[3],evidenceSpans,method,explanation。
method 写短做法名，须与本考点一致。
`.trim()
  }
  return `
【复杂·读图】必须同时给 bar+line，categories 与 values 等长且 ≥4。
【正确示例·请模仿结构与自洽方式】
{
  "term": "互联网业务收入增长量",
  "passage": "根据下图比较各年增长量。",
  "chart": {
    "title": "2015—2018年业务收入及增速",
    "categories": ["2015","2016","2017","2018"],
    "leftUnit": "亿元",
    "rightUnit": "%",
    "series": [
      { "name": "收入", "type": "bar", "values": [1000,1200,1500,1950], "unit": "亿元" },
      { "name": "增速", "type": "line", "values": [18,20,25,30], "unit": "%" }
    ]
  },
  "stem": "2016—2018年，业务收入增长量最大的年份是？",
  "correct": "2018年",
  "distractors": ["2016年","2017年","2015年"],
  "evidenceSpans": ["收入"],
  "method": "柱值相减比较增长量",
  "explanation": "增长量：2016:1200-1000=200；2017:1500-1200=300；2018:1950-1500=450。最大为2018年。"
}
【硬性】explanation 里的柱值/增速必须原样来自 chart；增长量=后年柱−前年柱；答案必须与计算一致。只输出一个 JSON 对象。
`.trim()
}

function tryBuildGrowthGeneralQuestion(
  item: unknown,
  difficulty: GrowthGeneralDifficulty,
  seq: number,
): GrowthGeneralQuestion | null {
  const fields = parseGrowthGeneralMcqAiObject(item)
  if (!fields) return null
  return buildGrowthGeneralQuestionFromMcq({
    ...fields,
    difficulty,
    seq,
  })
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label}超时（${Math.round(ms / 1000)}s）`)),
          ms,
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function requestOneGrowthGeneralMcq(input: {
  difficulty: GrowthGeneralDifficulty
  seq: number
  avoidTerms: string[]
  topicHint?: string
  skillSlot?: GrowthEasySkillSlot | GrowthHardSkillSlot
  temperature?: number
  allowDeepseekFallback?: boolean
  maxAttempts?: number
  timeoutMs?: number
}): Promise<{ question: GrowthGeneralQuestion | null; rejectReason?: string }> {
  const diffLabel = input.difficulty === 'easy' ? '简单' : '复杂'
  const format = growthGeneralFormat(input.difficulty)
  const avoidHint = buildAvoidTermsHint('资料分析·一般增长主题', input.avoidTerms)
  const topicLine = input.topicHint
    ? `本题材料主题请围绕「${input.topicHint}」。`
    : ''
  const skillLine = input.skillSlot
    ? `【本考点】${input.skillSlot.label}：${input.skillSlot.prompt}`
    : ''

  let lastReason = ''
  const providers: AiProvider[] =
    input.difficulty === 'easy' && input.allowDeepseekFallback
      ? [GROWTH_GENERAL_FORCE_PROVIDER, 'deepseek']
      : [GROWTH_GENERAL_FORCE_PROVIDER]

  const maxAttempts = input.maxAttempts ?? 1
  const timeoutMs =
    input.timeoutMs ?? (input.difficulty === 'hard' ? 32_000 : 35_000)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (let pi = 0; pi < providers.length; pi++) {
      const provider = providers[pi]!
      try {
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——一般增长」四选一，难度 **${diffLabel}**。`,
              skillLine,
              topicLine,
              format,
              avoidHint,
              input.difficulty === 'hard'
                ? `先想好 chart 数字，再写 stem/explanation；explanation 中的柱值/增速必须原样来自 chart；只返回一个 JSON 对象。`
                : `只返回一个 JSON 对象；correct+distractors 共 4 个互异选项；explanation 含算式。`,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_SYSTEM,
              temperature: (input.temperature ?? 0.35) + attempt * 0.08 + pi * 0.05,
              maxTokens: input.difficulty === 'hard' ? 2000 : 1600,
              provider,
            },
          ),
          timeoutMs,
          `${provider}出题`,
        )
        const parsed = parseAiJsonObjectLenient(raw)
        if (!parsed) {
          lastReason = `${provider} JSON 解析失败`
          continue
        }
        const q = tryBuildGrowthGeneralQuestion(parsed, input.difficulty, input.seq)
        if (q) return { question: q }
        lastReason = diagnoseGrowthGeneralBuildReject(parsed, input.difficulty)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        lastReason = msg.slice(0, 120)
        if (/429|限流|rate/i.test(msg)) await sleepMs(600)
        // 超时：本 attempt 结束，若还有 maxAttempts 会再试
        if (/超时/.test(msg)) continue
      }
    }
  }
  return { question: null, rejectReason: lastReason || '未知失败' }
}

/** 简单题：一次整包生成，减少往返失败 */
async function requestGrowthEasyBatch(
  count: number,
  skillPlan: GrowthEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthGeneralQuestion[]> {
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  const avoidHint = buildAvoidTermsHint('资料分析·一般增长主题', avoidTerms)
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——一般增长」简单四选一，组成 JSON 数组。`,
        `第 i 题必须对应下面第 i 个考点（不要 5 题都考同一公式）：`,
        skillLines,
        growthGeneralFormat('easy'),
        avoidHint,
        `term 尽量不同；chart 一律 null；每题含 explanation 算式。只输出 JSON 数组。`,
      ].join('\n\n'),
      {
        system: DATA_ANALYSIS_GROWTH_SYSTEM,
        temperature: 0.32,
        maxTokens: 5000,
        provider: GROWTH_GENERAL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    const out: GrowthGeneralQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthGeneralQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

/** 复杂题：锚定已校验图表，豆包只写题干/选项/解析（大幅降低失败率） */
async function requestHardGrowthAnchoredMcq(input: {
  seed: GrowthHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthGeneralQuestion | null> {
  const chartJson = JSON.stringify(input.seed.chart)
  const secondaryJson = input.seed.secondaryChart
    ? JSON.stringify(input.seed.secondaryChart)
    : ''
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可沿用或微调设问，但必须仍读给定图）。`
    : ''
  const dualHint = secondaryJson
    ? `另有【给定 secondaryChart】，须结合两图出题（比重/增量差等），禁止改数字。`
    : ''
  const prompt = [
    `请基于【给定 chart】${secondaryJson ? '与【给定 secondaryChart】' : ''}出 1 道「增长——一般增长」复杂四选一。`,
    skillHint,
    dualHint,
    `【给定 chart（禁止改动任何数字/类目）】`,
    chartJson,
    secondaryJson ? `【给定 secondaryChart（禁止改动）】\n${secondaryJson}` : '',
    `要求：`,
    `1. 返回 JSON 对象字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation；可带 chart/secondaryChart 但必须与给定完全一致。`,
    `2. explanation 只能使用图中出现的柱值/折线值；增长量=后年柱−前年柱；算术正确；须多步计算（不要只问「哪年最大/有几个」这类一眼题）。`,
    `3. passage 一两句即可。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_SYSTEM,
        temperature,
        maxTokens: 1600,
        provider: GROWTH_GENERAL_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthGeneralMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart,
      secondaryChart: input.seed.secondaryChart ?? null,
    })
    if (!fields) return null
    return buildGrowthGeneralQuestionFromMcq({
      ...fields,
      chart: input.seed.chart,
      secondaryChart: input.seed.secondaryChart ?? null,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* 首轮失败再试一次 */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthGeneralMcqs(input: {
  count?: number
  difficulty: GrowthGeneralDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthGeneralQuestion[]> {
  const count = input.count ?? GROWTH_GENERAL_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthGeneralQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthEasySkillId>()

  const pushIfNew = (q: GrowthGeneralQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const topicFor = (i: number, wave: number) =>
    GROWTH_TOPIC_SEEDS[(i + wave * 3) % GROWTH_TOPIC_SEEDS.length]!

  const skillPlan =
    difficulty === 'easy' ? pickGrowthEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 整包失败则逐题补 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      const { question } = await requestOneGrowthGeneralMcq({
        difficulty: 'easy',
        seq: 50 + i,
        avoidTerms: [...usedTerms],
        topicHint: topicFor(i, 1),
        skillSlot: slot,
        temperature: 0.4,
        allowDeepseekFallback: true,
        maxAttempts: 1,
        timeoutMs: 35_000,
      })
      pushIfNew(question)
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐，凑满 ${count} 题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    /**
     * 复杂题：锚定已校验图库出题。
     * 豆包只改题干/选项/解析，chart 固定 → 通过率高；失败立刻用同图保底题，不会卡在「已成功 0」。
     */
    const anchors = pickGrowthHardSeedTemplates(count)
    input.onProgress?.(`豆包按已校验图库出题（每题限时，失败即用同图保底）…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余题…`)
      for (const q of takeGrowthHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 隔年增长：强制豆包 */
const GROWTH_INTER_YEAR_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——隔年增长」。

【核心公式】
1. 隔年增速 q = (1+q1)(1+q2)−1 = q1+q2+q1×q2（q1、q2 为小数）
2. 隔年基期 = A / ((1+q1)(1+q2))
3. 常先用「百分点」还原上年增速：q2 = q1 ± 百分点差

【简单题】纯文字材料，无图。
【复杂题】chart 必须为两年累计同比增速双折线（series≥2，categories≥4，值为百分数）；explanation 中的增速须从图中照抄。
【时期写法】横轴与题干一律用自然说法：前3个月、前6个月、上半年、前三季度等。
禁止「1-6月」「1—6月」「1至6月」等数字连写区间。

【解析】须含可验算算式；算术正确；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthInterYearFormat(difficulty: GrowthInterYearDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】须读给定 chart（两年累计增速双折线）；禁止改图中数字。时期只用「前n个月/上半年」等，禁止「1—n月」。字段同简单题；chart 与给定一致。难度偏大。`
}

function tryBuildGrowthInterYearQuestion(
  item: unknown,
  difficulty: GrowthInterYearDifficulty,
  seq: number,
): GrowthInterYearQuestion | null {
  const fields = parseGrowthInterYearMcqAiObject(item)
  if (!fields) return null
  return buildGrowthInterYearQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthInterYearEasyBatch(
  count: number,
  skillPlan: GrowthInterYearEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthInterYearQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·隔年增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——隔年增长」简单四选一，组成 JSON 数组。`,
        growthInterYearFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthInterYearQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthInterYearQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardGrowthInterYearAnchoredMcq(input: {
  seed: GrowthInterYearHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthInterYearQuestion | null> {
  const chartJson = JSON.stringify(input.seed.chart)
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可微调设问，必须读给定图）。`
    : ''
  const prompt = [
    `请基于【给定 chart】出 1 道「增长——隔年增长」复杂四选一。`,
    skillHint,
    `【给定 chart（禁止改数字/类目）】`,
    chartJson,
    growthInterYearFormat('hard'),
    `explanation 用隔年公式，增速取自图；难度偏大。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
        temperature,
        maxTokens: 1600,
        provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包隔年增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthInterYearMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart,
    })
    if (!fields) return null
    return buildGrowthInterYearQuestionFromMcq({
      ...fields,
      chart: input.seed.chart,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* retry */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthInterYearMcqs(input: {
  count?: number
  difficulty: GrowthInterYearDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthInterYearQuestion[]> {
  const count = input.count ?? GROWTH_INTER_YEAR_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthInterYearQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthInterYearEasySkillId>()

  const pushIfNew = (q: GrowthInterYearQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthInterYearEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthInterYearEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道隔年增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthInterYearEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包隔年增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·隔年增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——隔年增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthInterYearFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_INTER_YEAR_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: GROWTH_INTER_YEAR_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包隔年增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthInterYearQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐隔年增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthInterYearEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    const anchors = pickGrowthInterYearHardSeedTemplates(count)
    input.onProgress?.(`豆包按隔年增长双折线图库出题…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthInterYearAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthInterYearHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthInterYearHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余隔年增长复杂题…`)
      for (const q of takeGrowthInterYearHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 年均增长：强制豆包 */
const GROWTH_AVG_ANNUAL_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——年均增长」。

【核心公式】
1. 年均增长量=(末期−初期)/期数；期数=末年−初年
2. 末期=初期+期数×年均增长量；期数=(末期−初期)/年均增长量
3. 年均增长率 r 满足 (1+r)^期数=末期/初期；末期=初期×(1+r)^n；初期=末期/(1+r)^n
4. 多期总增速=(1+q1)(1+q2)…(1+qn)−1
5. 近似：增速较小且选项差距大时，年均增长率≈年均增长量/初期（略偏大）
6. 特征数字：1.1^n、1.2^n 等对照末期/初期
7. 初期判定：一般「2014—2018」初期=2014、期数=4；「这四年2018—2021」初期=2017、期数=4；五年规划「十三五2016—2020」初期=2015、期数=5

【简单题】纯文字，无图无表；数字好算。
【复杂题】须读给定 chart（柱+折线）或 table；禁止改图/表中数字；explanation 取值须与图/表一致。
题干须多步推理（外推、比较、初期陷阱等），难度≥教材真题。
涉及开方的年均增长率题：选项须给出百分数/具体约值，禁止把 \\sqrt 表达式当作选项；解析里可写开方过程。
【解析】须含可验算算式；算术正确；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthAvgAnnualFormat(difficulty: GrowthAvgAnnualDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】须读给定 chart 或 table；禁止改数字；设问偏难（多步）。选项用百分数/数量约值，不要用根号表达式作选项。字段同简单题；chart/table 与给定一致。`
}

function tryBuildGrowthAvgAnnualQuestion(
  item: unknown,
  difficulty: GrowthAvgAnnualDifficulty,
  seq: number,
): GrowthAvgAnnualQuestion | null {
  const fields = parseGrowthAvgAnnualMcqAiObject(item)
  if (!fields) return null
  return buildGrowthAvgAnnualQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthAvgAnnualEasyBatch(
  count: number,
  skillPlan: GrowthAvgAnnualEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthAvgAnnualQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·年均增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——年均增长」简单四选一，组成 JSON 数组。`,
        growthAvgAnnualFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
        temperature: 0.4,
        maxTokens: 3600,
        provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthAvgAnnualQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthAvgAnnualQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardGrowthAvgAnnualAnchoredMcq(input: {
  seed: GrowthAvgAnnualHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthAvgAnnualQuestion | null> {
  const hasTable = !!input.seed.table
  const dataBlock = hasTable
    ? `【给定 table（禁止改数字/行列）】\n${JSON.stringify(input.seed.table)}`
    : `【给定 chart（禁止改数字/类目）】\n${JSON.stringify(input.seed.chart)}`
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可微调设问，必须读给定图/表）。`
    : ''
  const prompt = [
    `请基于给定数据出 1 道「增长——年均增长」复杂四选一。`,
    skillHint,
    dataBlock,
    growthAvgAnnualFormat('hard'),
    `explanation 用年均增长公式，数值取自图/表；难度偏大。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  const tryOnce = async (timeoutMs: number, temperature: number) => {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
        temperature,
        maxTokens: 1800,
        provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
      }),
      timeoutMs,
      '豆包年均增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthAvgAnnualMcqAiObject({
      ...(parsed as Record<string, unknown>),
      chart: input.seed.chart ?? null,
      table: input.seed.table ?? null,
    })
    if (!fields) return null
    return buildGrowthAvgAnnualQuestionFromMcq({
      ...fields,
      chart: input.seed.chart ?? null,
      table: input.seed.table ?? null,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  }

  try {
    const first = await tryOnce(input.timeoutMs, 0.35)
    if (first) return first
  } catch {
    /* retry */
  }
  try {
    return await tryOnce(Math.max(input.timeoutMs, 36_000), 0.28)
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthAvgAnnualMcqs(input: {
  count?: number
  difficulty: GrowthAvgAnnualDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthAvgAnnualQuestion[]> {
  const count = input.count ?? GROWTH_AVG_ANNUAL_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthAvgAnnualQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthAvgAnnualEasySkillId>()

  const pushIfNew = (q: GrowthAvgAnnualQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthAvgAnnualEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthAvgAnnualEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道年均增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthAvgAnnualEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包年均增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·年均增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——年均增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthAvgAnnualFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_AVG_ANNUAL_SYSTEM,
              temperature: 0.4,
              maxTokens: 1400,
              provider: GROWTH_AVG_ANNUAL_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包年均增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthAvgAnnualQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐年均增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthAvgAnnualEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    const anchors = pickGrowthAvgAnnualHardSeedTemplates(count)
    input.onProgress?.(`豆包按年均增长图/表库出题…`)

    for (let i = 0; i < count; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `第 ${i + 1}/${count} 题 · ${seed.term}…已成功 ${deduped.length}`,
      )
      const aiQ = await requestHardGrowthAvgAnnualAnchoredMcq({
        seed,
        seq: i + 1,
        timeoutMs: 32_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${i + 1} 题豆包通过（${deduped.length}/${count}）`)
      } else {
        const fbSeed = pickGrowthAvgAnnualHardFallbackSeed(seed, usedTerms)
        const fallback = buildGrowthAvgAnnualHardFromSeedTemplate(fbSeed, 500 + i)
        if (pushIfNew(fallback)) {
          input.onProgress?.(
            `第 ${i + 1} 题用加难保底「${fbSeed.term}」（${deduped.length}/${count}）`,
          )
        }
      }
      if (i < count - 1) await sleepMs(120)
    }

    if (deduped.length < count) {
      input.onProgress?.(`补齐剩余年均增长复杂题…`)
      for (const q of takeGrowthAvgAnnualHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

/** 混合增长：强制豆包；纯文字无图 */
const GROWTH_MIXED_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_GROWTH_MIXED_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「增长——混合增长」。

【核心结论与公式】
1. 整体 A=A1+A2 时，q_A=(A1+A2)/(A1/(1+q1)+A2/(1+q2))−1
2. q_A 必介于 q1 与 q2 之间（可多部分推广）
3. q_A 偏向基期较大的部分；基期≈现期/(1+q)
4. 若 q1>q2：基期1>基期2 则 q_A 在 (q1+q2)/2 与 q1 之间；反之在 q2 与均值之间
5. 十字交叉：基期1/基期2=(q_A−q2)/(q1−q_A)；可用现期比近似基期比
6. 已知整体与一部分增速，求另一部分：另一部分必在整体外侧（大于较大者或小于较小者）

【简单题】纯文字，计算简明，多用区间排除/偏向判断。
【复杂题】仍纯文字（不要 chart）；难度必须≥教材难题：
- 禁止「只有一个选项落在两增速之间」这种秒杀题；
- 求整体增速：区间内至少两个选项，须十字交叉或精确算基期；
- 反推另一部分：外侧至少两个选项，须结合占比/权重估算；
- 反推基期比：用十字交叉，比值尽量非整比。
【解析】须含可验算推理或算式；末步与 correct 一致。
【输出】只输出合法 JSON，不要 markdown 围栏。
`.trim()

function growthMixedFormat(difficulty: GrowthMixedDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无图；指定考点见用户消息。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无图；难度≥书上真题（选项贴近、须计算/估权，禁止区间秒杀）。字段同简单题。`
}

function tryBuildGrowthMixedQuestion(
  item: unknown,
  difficulty: GrowthMixedDifficulty,
  seq: number,
): GrowthMixedQuestion | null {
  const fields = parseGrowthMixedMcqAiObject(item)
  if (!fields) return null
  return buildGrowthMixedQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestGrowthMixedEasyBatch(
  count: number,
  skillPlan: GrowthMixedEasySkillSlot[],
  avoidTerms: string[],
): Promise<GrowthMixedQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——混合增长」简单四选一，组成 JSON 数组。`,
        growthMixedFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthMixedQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthMixedQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestGrowthMixedHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<GrowthMixedQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', avoidTerms)
  const skillLines = GROWTH_MIXED_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「增长——混合增长」复杂四选一，组成 JSON 数组。`,
        growthMixedFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `数字换新；每题选项须「贴近」，不能靠介于两者之间一眼排除；须十字交叉/精确式/权重估算。explanation 写清步骤，末句「答案为…」。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: GrowthMixedQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildGrowthMixedQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

/** 单题锚定：仅短超时试一次，失败立刻放弃（由本地种子补） */
async function requestHardGrowthMixedAnchoredMcq(input: {
  seed: GrowthMixedHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<GrowthMixedQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改数字与设问，但须同一考点且更难或持平）。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「增长——混合增长」复杂四选一（纯文字，不要图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    growthMixedFormat('hard'),
    `explanation 末句写「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: GROWTH_MIXED_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包混合增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseGrowthMixedMcqAiObject(parsed)
    if (!fields) return null
    return buildGrowthMixedQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisGrowthMixedMcqs(input: {
  count?: number
  difficulty: GrowthMixedDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GrowthMixedQuestion[]> {
  const count = input.count ?? GROWTH_MIXED_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: GrowthMixedQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<GrowthMixedEasySkillId>()

  const pushIfNew = (q: GrowthMixedQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectGrowthMixedEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickGrowthMixedEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道混合增长简单题…`)
    try {
      const batch = await withTimeout(
        requestGrowthMixedEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包混合增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·混合增长主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「增长——混合增长」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              growthMixedFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_GROWTH_MIXED_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: GROWTH_MIXED_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包混合增长单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildGrowthMixedQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐混合增长简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeGrowthMixedEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    // 复杂题：优先 1 次整包；缺题再短超时单题；仍缺则立刻本地种子，避免 5×长超时卡住
    input.onProgress?.(`豆包整包生成 ${count} 道混合增长复杂题…`)
    try {
      const batch = await withTimeout(
        requestGrowthMixedHardBatch(count, [...usedTerms]),
        48_000,
        '豆包混合增长复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickGrowthMixedHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardGrowthMixedAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildGrowthMixedHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeGrowthMixedHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 比重基本公式 / 基期比重：强制豆包 */
const PROPORTION_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_PROPORTION_BASIC_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「比重——基本公式」。

【公式】
1. 比重=部分值/整体值×100%
2. 部分值=整体值×比重；整体值=部分值/比重
3. 连续占比：A占B为p1、B占C为p2 ⇒ A占C=p1×p2；A=C×p1×p2

【简单题】纯文字无图；数字好算，贴近教材马拉松占比类例题。
【复杂题】必须含扇形图 pies（1～2 张）；难度≥教材发电量扇形真题，宜多一步推算；选项贴近。
pies 格式：[{ "title":"…", "note":"可选", "slices":[{"name":"水电","value":17},…] }]，value 为百分数数字。
【解析】须可验算；末句「答案为…」。只输出合法 JSON。
`.trim()

const DATA_ANALYSIS_PROPORTION_BASE_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「比重——基期比重」。

【公式】
1. 已知增长量：基期比重=(A−a)/(B−b)
2. 已知增速：基期比重=A/B×(1+qB)/(1+qA)
3. 比重增长量（百分点）=A/B×(qA−qB)/(1+qA)
4. qA>qB 现期比重上升；qA<qB 下降

【简单题】纯文字无表。
【复杂题】必须含 table（工业经济效益指标类多列表）；难度对齐教材亏损企业占比题或更难。
table：{ "title","unit?","columns":[…],"rows":[[…],…] }
【解析】须可验算；末句「答案为…」。只输出合法 JSON。
`.trim()

function proportionBasicFormat(difficulty: ProportionBasicDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；pies 省略或 []。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】必须 pies 含 1～2 张扇形图；读图多步。字段：term,passage,pies,stem,correct,distractors[3],evidenceSpans,method,explanation。`
}

function proportionBaseFormat(difficulty: ProportionBaseDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无表；table:null。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】必须 table 多行多列；基期比重/比重变化。字段：term,passage,table,stem,correct,distractors[3],evidenceSpans,method,explanation。`
}

function tryBuildProportionBasicQuestion(
  item: unknown,
  difficulty: ProportionBasicDifficulty,
  seq: number,
): ProportionBasicQuestion | null {
  const fields = parseProportionBasicMcqAiObject(item)
  if (!fields) return null
  return buildProportionBasicQuestionFromMcq({ ...fields, difficulty, seq })
}

function tryBuildProportionBaseQuestion(
  item: unknown,
  difficulty: ProportionBaseDifficulty,
  seq: number,
): ProportionBaseQuestion | null {
  const fields = parseProportionBaseMcqAiObject(item)
  if (!fields) return null
  return buildProportionBaseQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestProportionBasicEasyBatch(
  count: number,
  skillPlan: ProportionBasicEasySkillSlot[],
  avoidTerms: string[],
): Promise<ProportionBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·比重基本公式主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「比重——基本公式」简单四选一，组成 JSON 数组。`,
        proportionBasicFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PROPORTION_BASIC_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: PROPORTION_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: ProportionBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildProportionBasicQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestProportionBasicHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<ProportionBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·比重基本公式主题', avoidTerms)
  const skillLines = PROPORTION_BASIC_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「比重——基本公式」复杂四选一，组成 JSON 数组。`,
        proportionBasicFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `每题必须有可读扇形图 pies；数字换新；explanation 写清步骤。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PROPORTION_BASIC_SYSTEM,
        temperature: 0.35,
        maxTokens: 4800,
        provider: PROPORTION_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: ProportionBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildProportionBasicQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardProportionBasicAnchoredMcq(input: {
  seed: ProportionBasicHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<ProportionBasicQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改数字与设问，但须同一考点且更难或持平）。`
    : ''
  const piesJson = JSON.stringify(input.seed.pies)
  const prompt = [
    `请基于【给定 pies】出 1 道「比重——基本公式」复杂四选一。`,
    skillHint,
    `【给定 pies（扇区百分数尽量保持，可微调非关键数字）】`,
    piesJson,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    proportionBasicFormat('hard'),
    `返回 JSON 可省略 pies（将使用给定图）；explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_PROPORTION_BASIC_SYSTEM,
        temperature: 0.32,
        maxTokens: 1600,
        provider: PROPORTION_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包比重基本公式锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseProportionBasicMcqAiObject(parsed)
    if (!fields) return null
    return buildProportionBasicQuestionFromMcq({
      ...fields,
      pies: fields.pies ?? input.seed.pies,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisProportionBasicMcqs(input: {
  count?: number
  difficulty: ProportionBasicDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ProportionBasicQuestion[]> {
  const count = input.count ?? PROPORTION_BASIC_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: ProportionBasicQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<ProportionBasicEasySkillId>()

  const pushIfNew = (q: ProportionBasicQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectProportionBasicEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickProportionBasicEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道比重基本公式简单题…`)
    try {
      const batch = await withTimeout(
        requestProportionBasicEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包比重基本公式整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·比重基本公式主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「比重——基本公式」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              proportionBasicFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_PROPORTION_BASIC_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: PROPORTION_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包比重基本公式单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildProportionBasicQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐比重基本公式简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeProportionBasicEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道比重基本公式复杂题…`)
    try {
      const batch = await withTimeout(
        requestProportionBasicHardBatch(count, [...usedTerms]),
        48_000,
        '豆包比重基本公式复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickProportionBasicHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardProportionBasicAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildProportionBasicHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeProportionBasicHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

async function requestProportionBaseEasyBatch(
  count: number,
  skillPlan: ProportionBaseEasySkillSlot[],
  avoidTerms: string[],
): Promise<ProportionBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期比重主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「比重——基期比重」简单四选一，组成 JSON 数组。`,
        proportionBaseFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PROPORTION_BASE_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: PROPORTION_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: ProportionBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildProportionBaseQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestProportionBaseHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<ProportionBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期比重主题', avoidTerms)
  const skillLines = PROPORTION_BASE_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「比重——基期比重」复杂四选一，组成 JSON 数组。`,
        proportionBaseFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `每题必须有 table；数字换新；explanation 写清步骤。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PROPORTION_BASE_SYSTEM,
        temperature: 0.35,
        maxTokens: 4800,
        provider: PROPORTION_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: ProportionBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildProportionBaseQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardProportionBaseAnchoredMcq(input: {
  seed: ProportionBaseHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<ProportionBaseQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改设问，表数据尽量保持）。`
    : ''
  const tableJson = JSON.stringify(input.seed.table)
  const prompt = [
    `请基于【给定 table】出 1 道「比重——基期比重」复杂四选一。`,
    skillHint,
    `【给定 table（禁止改动表中数字）】`,
    tableJson,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    proportionBaseFormat('hard'),
    `返回 JSON 可省略 table（将使用给定表）；explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_PROPORTION_BASE_SYSTEM,
        temperature: 0.32,
        maxTokens: 1600,
        provider: PROPORTION_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包基期比重锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseProportionBaseMcqAiObject(parsed)
    if (!fields) return null
    return buildProportionBaseQuestionFromMcq({
      ...fields,
      table: fields.table ?? input.seed.table,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisProportionBaseMcqs(input: {
  count?: number
  difficulty: ProportionBaseDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ProportionBaseQuestion[]> {
  const count = input.count ?? PROPORTION_BASE_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: ProportionBaseQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<ProportionBaseEasySkillId>()

  const pushIfNew = (q: ProportionBaseQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectProportionBaseEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickProportionBaseEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道基期比重简单题…`)
    try {
      const batch = await withTimeout(
        requestProportionBaseEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包基期比重整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·基期比重主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「比重——基期比重」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              proportionBaseFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_PROPORTION_BASE_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: PROPORTION_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包基期比重单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildProportionBaseQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐基期比重简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeProportionBaseEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道基期比重复杂题…`)
    try {
      const batch = await withTimeout(
        requestProportionBaseHardBatch(count, [...usedTerms]),
        48_000,
        '豆包基期比重复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickProportionBaseHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardProportionBaseAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildProportionBaseHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeProportionBaseHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 平均数基本公式 / 基期平均数：强制豆包；纯文字无图 */
const AVERAGE_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_AVERAGE_BASIC_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「平均数——基本公式」。

【公式】
1. 平均数=总量/份数
2. 总量=平均数×份数
3. 份数=总量/平均数
4. 算术平均 m=(m1+…+mn)/n

【简单题】纯文字；数字好算，直接套公式。
【复杂题】仍纯文字（不要图/表）；须含单位换算、大数估算或先合计再平均等多步；难度对齐教材粮食总产/原木均价例题。
【解析】须可验算；末句「答案为…」。只输出合法 JSON。
`.trim()

const DATA_ANALYSIS_AVERAGE_BASE_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「平均数——基期平均数」。

【公式】（A=现期总量增速qA，B=现期份数增速qB）
1. 基期平均数=A/B×(1+qB)/(1+qA)
2. 平均数增长量=A/B×(qA−qB)/(1+qA)
3. 平均数增长率=(qA−qB)/(1+qB)
4. qA>qB 现期平均上升；qA<qB 下降

【简单题】纯文字；数字相对简明。
【复杂题】仍纯文字；对齐教材货运平均运距增长量、快递每件收入增速等真题；选项须含升降方向干扰。
【解析】须可验算；末句「答案为…」。只输出合法 JSON。
`.trim()

function averageBasicFormat(difficulty: AverageBasicDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无图。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无图；单位换算/大数估算/多步。字段同简单题。`
}

function averageBaseFormat(difficulty: AverageBaseDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无图。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无图；增长量/增长率估算，选项含升降干扰。字段同简单题。`
}

function tryBuildAverageBasicQuestion(
  item: unknown,
  difficulty: AverageBasicDifficulty,
  seq: number,
): AverageBasicQuestion | null {
  const fields = parseAverageBasicMcqAiObject(item)
  if (!fields) return null
  return buildAverageBasicQuestionFromMcq({ ...fields, difficulty, seq })
}

function tryBuildAverageBaseQuestion(
  item: unknown,
  difficulty: AverageBaseDifficulty,
  seq: number,
): AverageBaseQuestion | null {
  const fields = parseAverageBaseMcqAiObject(item)
  if (!fields) return null
  return buildAverageBaseQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestAverageBasicEasyBatch(
  count: number,
  skillPlan: AverageBasicEasySkillSlot[],
  avoidTerms: string[],
): Promise<AverageBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·平均数基本公式主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「平均数——基本公式」简单四选一，组成 JSON 数组。`,
        averageBasicFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_AVERAGE_BASIC_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: AVERAGE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: AverageBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildAverageBasicQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestAverageBasicHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<AverageBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·平均数基本公式主题', avoidTerms)
  const skillLines = AVERAGE_BASIC_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「平均数——基本公式」复杂四选一，组成 JSON 数组。`,
        averageBasicFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `数字换新；explanation 写清步骤，末句「答案为…」。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_AVERAGE_BASIC_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: AVERAGE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: AverageBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildAverageBasicQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardAverageBasicAnchoredMcq(input: {
  seed: AverageBasicHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<AverageBasicQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改数字与设问，但须同一考点）。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「平均数——基本公式」复杂四选一（纯文字，不要图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    averageBasicFormat('hard'),
    `explanation 末句写「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_AVERAGE_BASIC_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: AVERAGE_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包平均数基本公式锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseAverageBasicMcqAiObject(parsed)
    if (!fields) return null
    return buildAverageBasicQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisAverageBasicMcqs(input: {
  count?: number
  difficulty: AverageBasicDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<AverageBasicQuestion[]> {
  const count = input.count ?? AVERAGE_BASIC_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: AverageBasicQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<AverageBasicEasySkillId>()

  const pushIfNew = (q: AverageBasicQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectAverageBasicEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickAverageBasicEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道平均数基本公式简单题…`)
    try {
      const batch = await withTimeout(
        requestAverageBasicEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包平均数基本公式整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·平均数基本公式主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「平均数——基本公式」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              averageBasicFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_AVERAGE_BASIC_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: AVERAGE_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包平均数基本公式单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildAverageBasicQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐平均数基本公式简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeAverageBasicEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道平均数基本公式复杂题…`)
    try {
      const batch = await withTimeout(
        requestAverageBasicHardBatch(count, [...usedTerms]),
        48_000,
        '豆包平均数基本公式复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickAverageBasicHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardAverageBasicAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildAverageBasicHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeAverageBasicHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

async function requestAverageBaseEasyBatch(
  count: number,
  skillPlan: AverageBaseEasySkillSlot[],
  avoidTerms: string[],
): Promise<AverageBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期平均数主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「平均数——基期平均数」简单四选一，组成 JSON 数组。`,
        averageBaseFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_AVERAGE_BASE_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: AVERAGE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: AverageBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildAverageBaseQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestAverageBaseHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<AverageBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期平均数主题', avoidTerms)
  const skillLines = AVERAGE_BASE_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「平均数——基期平均数」复杂四选一，组成 JSON 数组。`,
        averageBaseFormat('hard'),
        `【考点须覆盖，每题不同】\n${skillLines}`,
        `数字换新；选项含升降干扰；explanation 写清步骤。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_AVERAGE_BASE_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: AVERAGE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: AverageBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildAverageBaseQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardAverageBaseAnchoredMcq(input: {
  seed: AverageBaseHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<AverageBaseQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}（可改数字与设问，但须同一考点）。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「平均数——基期平均数」复杂四选一（纯文字，不要图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    averageBaseFormat('hard'),
    `explanation 末句写「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_AVERAGE_BASE_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: AVERAGE_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包基期平均数锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseAverageBaseMcqAiObject(parsed)
    if (!fields) return null
    return buildAverageBaseQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisAverageBaseMcqs(input: {
  count?: number
  difficulty: AverageBaseDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<AverageBaseQuestion[]> {
  const count = input.count ?? AVERAGE_BASE_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )

  const deduped: AverageBaseQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<AverageBaseEasySkillId>()

  const pushIfNew = (q: AverageBaseQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectAverageBaseEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickAverageBaseEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道基期平均数简单题…`)
    try {
      const batch = await withTimeout(
        requestAverageBaseEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包基期平均数整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* 补题 */
    }

    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·基期平均数主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「平均数——基期平均数」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              averageBaseFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_AVERAGE_BASE_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: AVERAGE_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包基期平均数单题',
        )
        const parsed = parseAiJsonObjectLenient(raw)
        pushIfNew(tryBuildAverageBaseQuestion(parsed, 'easy', 50 + i))
      } catch {
        /* continue */
      }
      await sleepMs(180)
    }

    if (deduped.length < count) {
      input.onProgress?.(`保底补齐基期平均数简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeAverageBaseEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道基期平均数复杂题…`)
    try {
      const batch = await withTimeout(
        requestAverageBaseHardBatch(count, [...usedTerms]),
        48_000,
        '豆包基期平均数复杂整包',
      )
      for (const q of batch) pushIfNew(q)
      if (batch.length) {
        input.onProgress?.(`整包已收录 ${deduped.length}/${count} 题`)
      }
    } catch {
      input.onProgress?.(`整包超时或失败，改用短时单题/本地题库…`)
    }

    const anchors = pickAverageBaseHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardAverageBaseAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) {
        input.onProgress?.(`第 ${deduped.length} 题豆包通过`)
        continue
      }
      const fallback = buildAverageBaseHardFromSeedTemplate(seed, 500 + i)
      if (pushIfNew(fallback)) {
        input.onProgress?.(
          `第 ${deduped.length} 题用本地保底「${seed.term}」`,
        )
      }
    }

    if (deduped.length < count) {
      input.onProgress?.(`本地复杂题库补齐剩余…`)
      for (const q of takeAverageBaseHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 倍数与翻番：强制豆包 */
const MULTIPLE_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_MULTIPLE_BASIC_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「倍数与翻番——基本公式」。

【公式】
1. A是B的几倍 = A/B
2. A比B多/高几倍 = A/B−1（可写成百分数）
3. 翻 n 番 = 变为原来的 2^n 倍；数值 = 基期×2^n

【简单题】纯文字无表。
【复杂题】必须含 table；可先求人均再比倍，难度≥教材仓储/邮政题。
table：{title, unit?, columns, rows}
【解析】末句「答案为…」。只输出合法 JSON。
`.trim()

const DATA_ANALYSIS_MULTIPLE_BASE_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「基期倍数与增长量倍数」。

【公式】
1. 基期倍数 = A/B×(1+qB)/(1+qA)
2. 增长量倍数 = A×qA/(B×qB)×(1+qB)/(1+qA)；增长量=现期×r/(1+r)

【简单题】纯文字无表。
【复杂题】必须含 table；增长量倍数可用特征分数估算，难度高于教材白酒/啤酒题。
【解析】末句「答案为…」。只输出合法 JSON。
`.trim()

function multipleBasicFormat(difficulty: MultipleBasicDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；table:null。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】必须 table。字段：term,passage,table,stem,correct,distractors[3],evidenceSpans,method,explanation。`
}

function multipleBaseFormat(difficulty: MultipleBaseDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；table:null。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】必须 table；选项贴近。字段：term,passage,table,stem,correct,distractors[3],evidenceSpans,method,explanation。`
}

function tryBuildMultipleBasicQuestion(
  item: unknown,
  difficulty: MultipleBasicDifficulty,
  seq: number,
): MultipleBasicQuestion | null {
  const fields = parseMultipleBasicMcqAiObject(item)
  if (!fields) return null
  return buildMultipleBasicQuestionFromMcq({ ...fields, difficulty, seq })
}

function tryBuildMultipleBaseQuestion(
  item: unknown,
  difficulty: MultipleBaseDifficulty,
  seq: number,
): MultipleBaseQuestion | null {
  const fields = parseMultipleBaseMcqAiObject(item)
  if (!fields) return null
  return buildMultipleBaseQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestMultipleBasicEasyBatch(
  count: number,
  skillPlan: MultipleBasicEasySkillSlot[],
  avoidTerms: string[],
): Promise<MultipleBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·倍数基本公式主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「倍数与翻番——基本公式」简单四选一，组成 JSON 数组。`,
        multipleBasicFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_MULTIPLE_BASIC_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: MULTIPLE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: MultipleBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildMultipleBasicQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestMultipleBasicHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<MultipleBasicQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·倍数基本公式主题', avoidTerms)
  const skillLines = MULTIPLE_BASIC_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「倍数与翻番——基本公式」复杂四选一，组成 JSON 数组。`,
        multipleBasicFormat('hard'),
        `【考点须覆盖】\n${skillLines}`,
        `每题必须有 table；explanation 写清步骤。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_MULTIPLE_BASIC_SYSTEM,
        temperature: 0.35,
        maxTokens: 4800,
        provider: MULTIPLE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: MultipleBasicQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildMultipleBasicQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardMultipleBasicAnchoredMcq(input: {
  seed: MultipleBasicHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<MultipleBasicQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}。`
    : ''
  const tableJson = JSON.stringify(input.seed.table)
  const prompt = [
    `请基于【给定 table】出 1 道「倍数与翻番——基本公式」复杂四选一。`,
    skillHint,
    `【给定 table（禁止改动表中数字）】`,
    tableJson,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    multipleBasicFormat('hard'),
    `可省略 table（将用给定表）。explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_MULTIPLE_BASIC_SYSTEM,
        temperature: 0.32,
        maxTokens: 1600,
        provider: MULTIPLE_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包倍数基本公式锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseMultipleBasicMcqAiObject(parsed)
    if (!fields) return null
    return buildMultipleBasicQuestionFromMcq({
      ...fields,
      table: fields.table ?? input.seed.table,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisMultipleBasicMcqs(input: {
  count?: number
  difficulty: MultipleBasicDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<MultipleBasicQuestion[]> {
  const count = input.count ?? MULTIPLE_BASIC_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: MultipleBasicQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<MultipleBasicEasySkillId>()

  const pushIfNew = (q: MultipleBasicQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectMultipleBasicEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickMultipleBasicEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道倍数基本公式简单题…`)
    try {
      const batch = await withTimeout(
        requestMultipleBasicEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包倍数基本公式整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* */
    }
    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·倍数基本公式主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「倍数与翻番——基本公式」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              multipleBasicFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_MULTIPLE_BASIC_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: MULTIPLE_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包倍数基本公式单题',
        )
        pushIfNew(tryBuildMultipleBasicQuestion(parseAiJsonObjectLenient(raw), 'easy', 50 + i))
      } catch {
        /* */
      }
      await sleepMs(180)
    }
    if (deduped.length < count) {
      input.onProgress?.(`保底补齐倍数基本公式简单题…`)
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeMultipleBasicEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道倍数基本公式复杂题…`)
    try {
      const batch = await withTimeout(
        requestMultipleBasicHardBatch(count, [...usedTerms]),
        48_000,
        '豆包倍数基本公式复杂整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      input.onProgress?.(`整包失败，改用短时单题/本地题库…`)
    }
    const anchors = pickMultipleBasicHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardMultipleBasicAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) continue
      pushIfNew(buildMultipleBasicHardFromSeedTemplate(seed, 500 + i))
    }
    if (deduped.length < count) {
      for (const q of takeMultipleBasicHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}

async function requestMultipleBaseEasyBatch(
  count: number,
  skillPlan: MultipleBaseEasySkillSlot[],
  avoidTerms: string[],
): Promise<MultipleBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期与增长量倍数主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「基期倍数与增长量倍数」简单四选一，组成 JSON 数组。`,
        multipleBaseFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_MULTIPLE_BASE_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: MULTIPLE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: MultipleBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildMultipleBaseQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestMultipleBaseHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<MultipleBaseQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·基期与增长量倍数主题', avoidTerms)
  const skillLines = MULTIPLE_BASE_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「基期倍数与增长量倍数」复杂四选一，组成 JSON 数组。`,
        multipleBaseFormat('hard'),
        `【考点须覆盖】\n${skillLines}`,
        `每题必须有 table；难度高于教材。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_MULTIPLE_BASE_SYSTEM,
        temperature: 0.35,
        maxTokens: 4800,
        provider: MULTIPLE_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: MultipleBaseQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildMultipleBaseQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardMultipleBaseAnchoredMcq(input: {
  seed: MultipleBaseHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<MultipleBaseQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}。`
    : ''
  const tableJson = JSON.stringify(input.seed.table)
  const prompt = [
    `请基于【给定 table】出 1 道「基期倍数与增长量倍数」复杂四选一。`,
    skillHint,
    `【给定 table（禁止改动表中数字）】`,
    tableJson,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    multipleBaseFormat('hard'),
    `可省略 table。explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_MULTIPLE_BASE_SYSTEM,
        temperature: 0.32,
        maxTokens: 1600,
        provider: MULTIPLE_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包基期增长量倍数锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseMultipleBaseMcqAiObject(parsed)
    if (!fields) return null
    return buildMultipleBaseQuestionFromMcq({
      ...fields,
      table: fields.table ?? input.seed.table,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisMultipleBaseMcqs(input: {
  count?: number
  difficulty: MultipleBaseDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<MultipleBaseQuestion[]> {
  const count = input.count ?? MULTIPLE_BASE_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: MultipleBaseQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<MultipleBaseEasySkillId>()

  const pushIfNew = (q: MultipleBaseQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectMultipleBaseEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickMultipleBaseEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道基期与增长量倍数简单题…`)
    try {
      const batch = await withTimeout(
        requestMultipleBaseEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包基期增长量倍数整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* */
    }
    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·基期与增长量倍数主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「基期倍数与增长量倍数」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              multipleBaseFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_MULTIPLE_BASE_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: MULTIPLE_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包基期增长量倍数单题',
        )
        pushIfNew(tryBuildMultipleBaseQuestion(parseAiJsonObjectLenient(raw), 'easy', 50 + i))
      } catch {
        /* */
      }
      await sleepMs(180)
    }
    if (deduped.length < count) {
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeMultipleBaseEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道基期与增长量倍数复杂题…`)
    try {
      const batch = await withTimeout(
        requestMultipleBaseHardBatch(count, [...usedTerms]),
        48_000,
        '豆包基期增长量倍数复杂整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      input.onProgress?.(`整包失败，改用短时单题/本地题库…`)
    }
    const anchors = pickMultipleBaseHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardMultipleBaseAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) continue
      pushIfNew(buildMultipleBaseHardFromSeedTemplate(seed, 500 + i))
    }
    if (deduped.length < count) {
      for (const q of takeMultipleBaseHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 指数：强制豆包；纯文字无表 */
const INDEX_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_INDEX_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精教材考点「指数」。

【核心关系】（基期指数通常为100）
1. 现期实际值/基期实际值 = 指数/100 ⇒ 现期=基期×指数/100
2. 增长率 = (指数−100)%；指数>100上升，<100下降，=100持平
3. 倍数 = 指数/100
4. 两指数相差 n 点 ⇔ 对应增长率相差 n 个百分点

【简单题】纯文字无表；数字略易，直接套公式。
【复杂题】仍纯文字无表；材料可含多分类指数与「升/降×点」，须反推上期或比较点数；难度≥教材工业企业景气指数真题。
【解析】末句「答案为…」。只输出合法 JSON。
`.trim()

function indexFormat(difficulty: IndexDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无表。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无表；多分类+点数。字段同简单题。`
}

function tryBuildIndexQuestion(
  item: unknown,
  difficulty: IndexDifficulty,
  seq: number,
): IndexQuestion | null {
  const fields = parseIndexMcqAiObject(item)
  if (!fields) return null
  return buildIndexQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestIndexEasyBatch(
  count: number,
  skillPlan: IndexEasySkillSlot[],
  avoidTerms: string[],
): Promise<IndexQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·指数主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「指数」简单四选一，组成 JSON 数组。`,
        indexFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_INDEX_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: INDEX_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: IndexQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildIndexQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestIndexHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<IndexQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·指数主题', avoidTerms)
  const skillLines = INDEX_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「指数」复杂四选一，组成 JSON 数组。`,
        indexFormat('hard'),
        `【考点须覆盖】\n${skillLines}`,
        `材料可仿工业企业景气指数（多规模/地区+点数）；explanation 写清步骤。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_INDEX_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: INDEX_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: IndexQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildIndexQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardIndexAnchoredMcq(input: {
  seed: IndexHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<IndexQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「指数」复杂四选一（纯文字，不要表/图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    indexFormat('hard'),
    `explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_INDEX_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: INDEX_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包指数锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseIndexMcqAiObject(parsed)
    if (!fields) return null
    return buildIndexQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisIndexMcqs(input: {
  count?: number
  difficulty: IndexDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<IndexQuestion[]> {
  const count = input.count ?? INDEX_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: IndexQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<IndexEasySkillId>()

  const pushIfNew = (q: IndexQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectIndexEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan = difficulty === 'easy' ? pickIndexEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道指数简单题…`)
    try {
      const batch = await withTimeout(
        requestIndexEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包指数整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* */
    }
    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·指数主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「指数」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              indexFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_INDEX_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: INDEX_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包指数单题',
        )
        pushIfNew(tryBuildIndexQuestion(parseAiJsonObjectLenient(raw), 'easy', 50 + i))
      } catch {
        /* */
      }
      await sleepMs(180)
    }
    if (deduped.length < count) {
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeIndexEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道指数复杂题…`)
    try {
      const batch = await withTimeout(
        requestIndexHardBatch(count, [...usedTerms]),
        48_000,
        '豆包指数复杂整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      input.onProgress?.(`整包失败，改用短时单题/本地题库…`)
    }
    const anchors = pickIndexHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardIndexAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) continue
      pushIfNew(buildIndexHardFromSeedTemplate(seed, 500 + i))
    }
    if (deduped.length < count) {
      for (const q of takeIndexHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 拉动增长和比例：强制豆包；纯文字无表 */
const PULL_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_PULL_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「拉动……增长、贡献率、利润率」。

【公式】
1. 拉动……增长（百分点）= 部分增长量 / 整体基期值
2. 贡献率 = 部分增长量 / 整体增长量 ×100%
3. 利润率 = 利润 / 收入；升降：q利>q收上升，反之下降
4. 利润率变化量（百分点）≈ 现期利润率×(q利−q收)/(1+q利)

【简单题】纯文字无表；尽量直接给增量/基期，略易。
【复杂题】仍纯文字无表；须由现期与增速推算增量/基期，对齐教材六大行业拉动、房贷贡献率、软件利润率题或更难。
【解析】末句「答案为…」。只输出合法 JSON。
`.trim()

function pullFormat(difficulty: PullDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字无表。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】纯文字无表；多步估算。字段同简单题。`
}

function tryBuildPullQuestion(
  item: unknown,
  difficulty: PullDifficulty,
  seq: number,
): PullQuestion | null {
  const fields = parsePullMcqAiObject(item)
  if (!fields) return null
  return buildPullQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestPullEasyBatch(
  count: number,
  skillPlan: PullEasySkillSlot[],
  avoidTerms: string[],
): Promise<PullQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·拉动增长和比例主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「拉动增长和比例」简单四选一，组成 JSON 数组。`,
        pullFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PULL_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: PULL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: PullQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildPullQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestPullHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<PullQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·拉动增长和比例主题', avoidTerms)
  const skillLines = PULL_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「拉动增长和比例」复杂四选一，组成 JSON 数组。`,
        pullFormat('hard'),
        `【考点须覆盖】\n${skillLines}`,
        `explanation 写清步骤，末句「答案为…」。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_PULL_SYSTEM,
        temperature: 0.35,
        maxTokens: 4200,
        provider: PULL_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: PullQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildPullQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardPullAnchoredMcq(input: {
  seed: PullHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<PullQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}。`
    : ''
  const prompt = [
    `请参考下列种子题出 1 道「拉动增长和比例」复杂四选一（纯文字，不要表/图）。`,
    skillHint,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    pullFormat('hard'),
    `explanation 末句写「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_PULL_SYSTEM,
        temperature: 0.32,
        maxTokens: 1400,
        provider: PULL_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包拉动增长锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parsePullMcqAiObject(parsed)
    if (!fields) return null
    return buildPullQuestionFromMcq({
      ...fields,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisPullMcqs(input: {
  count?: number
  difficulty: PullDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PullQuestion[]> {
  const count = input.count ?? PULL_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: PullQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<PullEasySkillId>()

  const pushIfNew = (q: PullQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectPullEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan = difficulty === 'easy' ? pickPullEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道拉动增长和比例简单题…`)
    try {
      const batch = await withTimeout(
        requestPullEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包拉动增长整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* */
    }
    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·拉动增长和比例主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「拉动增长和比例」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              pullFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_PULL_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: PULL_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包拉动增长单题',
        )
        pushIfNew(tryBuildPullQuestion(parseAiJsonObjectLenient(raw), 'easy', 50 + i))
      } catch {
        /* */
      }
      await sleepMs(180)
    }
    if (deduped.length < count) {
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takePullEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道拉动增长和比例复杂题…`)
    try {
      const batch = await withTimeout(
        requestPullHardBatch(count, [...usedTerms]),
        48_000,
        '豆包拉动增长复杂整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      input.onProgress?.(`整包失败，改用短时单题/本地题库…`)
    }
    const anchors = pickPullHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardPullAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) continue
      pushIfNew(buildPullHardFromSeedTemplate(seed, 500 + i))
    }
    if (deduped.length < count) {
      for (const q of takePullHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}


/** 顺差与逆差：强制豆包；简单无表，复杂有表 */
const SURPLUS_FORCE_PROVIDER: AiProvider = 'doubao'

const DATA_ANALYSIS_SURPLUS_SYSTEM = `
你是公务员/事业编「资料分析」命题专家，专精「顺差与逆差」。

【公式】
1. 进出口总额 = 进口 + 出口
2. 顺差 = 出口 − 进口（出口>进口）
3. 逆差 = 进口 − 出口（进口>出口）

【简单题】纯文字无表；略易。
【复杂题】必须含 table；多年差额筛选/比较/扩大幅度等，难度高于教材水果进出口计数题。
table：{title, unit?, columns, rows}
【解析】末句「答案为…」。只输出合法 JSON。
`.trim()

function surplusFormat(difficulty: SurplusDifficulty): string {
  if (difficulty === 'easy') {
    return `【简单】纯文字；table:null。字段：term,passage,stem,correct,distractors[3],evidenceSpans,method,explanation。`
  }
  return `【复杂】必须 table。字段：term,passage,table,stem,correct,distractors[3],evidenceSpans,method,explanation。`
}

function tryBuildSurplusQuestion(
  item: unknown,
  difficulty: SurplusDifficulty,
  seq: number,
): SurplusQuestion | null {
  const fields = parseSurplusMcqAiObject(item)
  if (!fields) return null
  return buildSurplusQuestionFromMcq({ ...fields, difficulty, seq })
}

async function requestSurplusEasyBatch(
  count: number,
  skillPlan: SurplusEasySkillSlot[],
  avoidTerms: string[],
): Promise<SurplusQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·顺差与逆差主题', avoidTerms)
  const skillLines = skillPlan
    .slice(0, count)
    .map((s, i) => `${i + 1}. ${s.label}：${s.prompt}`)
    .join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「顺差与逆差」简单四选一，组成 JSON 数组。`,
        surplusFormat('easy'),
        `【本轮考点】\n${skillLines}`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_SURPLUS_SYSTEM,
        temperature: 0.4,
        maxTokens: 3200,
        provider: SURPLUS_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: SurplusQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildSurplusQuestion(item, 'easy', 10 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestSurplusHardBatch(
  count: number,
  avoidTerms: string[],
): Promise<SurplusQuestion[]> {
  const avoidHint = buildAvoidTermsHint('资料分析·顺差与逆差主题', avoidTerms)
  const skillLines = SURPLUS_HARD_SKILL_SLOTS.map(
    (s, i) => `${i + 1}. ${s.label}：${s.prompt}`,
  ).join('\n')
  try {
    const raw = await deepseekChatRaw(
      [
        `请一次性生成 **${count} 道**「顺差与逆差」复杂四选一，组成 JSON 数组。`,
        surplusFormat('hard'),
        `【考点须覆盖】\n${skillLines}`,
        `每题必须有 table；难度高于教材。`,
        avoidHint,
        `不要 markdown。`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        system: DATA_ANALYSIS_SURPLUS_SYSTEM,
        temperature: 0.35,
        maxTokens: 4800,
        provider: SURPLUS_FORCE_PROVIDER,
      },
    )
    const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
    if (!Array.isArray(parsed)) return []
    const out: SurplusQuestion[] = []
    parsed.forEach((item, idx) => {
      const q = tryBuildSurplusQuestion(item, 'hard', 20 + idx)
      if (q) out.push(q)
    })
    return out
  } catch {
    return []
  }
}

async function requestHardSurplusAnchoredMcq(input: {
  seed: SurplusHardSeedTemplate
  seq: number
  timeoutMs: number
}): Promise<SurplusQuestion | null> {
  const skillHint = input.seed.skillId
    ? `本题考点倾向：${input.seed.skillId}。`
    : ''
  const tableJson = JSON.stringify(input.seed.table)
  const prompt = [
    `请基于【给定 table】出 1 道「顺差与逆差」复杂四选一。`,
    skillHint,
    `【给定 table（禁止改动表中数字）】`,
    tableJson,
    `【种子材料】${input.seed.passage}`,
    `【种子设问参考】${input.seed.stem}`,
    surplusFormat('hard'),
    `可省略 table。explanation 末句「答案为…」。不要 markdown。`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const raw = await withTimeout(
      deepseekChatRaw(prompt, {
        system: DATA_ANALYSIS_SURPLUS_SYSTEM,
        temperature: 0.32,
        maxTokens: 1600,
        provider: SURPLUS_FORCE_PROVIDER,
      }),
      input.timeoutMs,
      '豆包顺差逆差锚定出题',
    )
    const parsed = parseAiJsonObjectLenient(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const fields = parseSurplusMcqAiObject(parsed)
    if (!fields) return null
    return buildSurplusQuestionFromMcq({
      ...fields,
      table: fields.table ?? input.seed.table,
      passage: fields.passage || input.seed.passage,
      difficulty: 'hard',
      seq: input.seq,
    })
  } catch {
    return null
  }
}

export async function requestDataAnalysisSurplusMcqs(input: {
  count?: number
  difficulty: SurplusDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<SurplusQuestion[]> {
  const count = input.count ?? SURPLUS_QUESTION_COUNT
  const difficulty = input.difficulty
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: SurplusQuestion[] = []
  const usedTerms = new Set<string>(historyBlocked)
  const usedFingerprints = new Set<string>()
  const usedSkillIds = new Set<SurplusEasySkillId>()

  const pushIfNew = (q: SurplusQuestion | null) => {
    if (!q) return false
    if (usedFingerprints.has(q.fingerprint)) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    deduped.push(q)
    usedFingerprints.add(q.fingerprint)
    if (termKey) usedTerms.add(termKey)
    const skill = detectSurplusEasySkillId(q)
    if (skill) usedSkillIds.add(skill)
    return true
  }

  const skillPlan =
    difficulty === 'easy' ? pickSurplusEasySkillPlan(count + 4) : []

  if (difficulty === 'easy') {
    input.onProgress?.(`豆包整包生成 ${count} 道顺差与逆差简单题…`)
    try {
      const batch = await withTimeout(
        requestSurplusEasyBatch(count, skillPlan, [...usedTerms]),
        70_000,
        '豆包顺差逆差整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      /* */
    }
    for (let i = 0; deduped.length < count && i < count; i++) {
      const slot =
        skillPlan.find((s) => !usedSkillIds.has(s.id)) ??
        skillPlan[deduped.length % Math.max(1, skillPlan.length)]
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题${slot ? ` · ${slot.label}` : ''}…`,
      )
      try {
        const avoidHint = buildAvoidTermsHint('资料分析·顺差与逆差主题', [...usedTerms])
        const raw = await withTimeout(
          deepseekChatRaw(
            [
              `请生成 1 道「顺差与逆差」简单四选一。`,
              slot ? `【本考点】${slot.label}：${slot.prompt}` : '',
              surplusFormat('easy'),
              avoidHint,
            ]
              .filter(Boolean)
              .join('\n'),
            {
              system: DATA_ANALYSIS_SURPLUS_SYSTEM,
              temperature: 0.4,
              maxTokens: 1200,
              provider: SURPLUS_FORCE_PROVIDER,
            },
          ),
          35_000,
          '豆包顺差逆差单题',
        )
        pushIfNew(tryBuildSurplusQuestion(parseAiJsonObjectLenient(raw), 'easy', 50 + i))
      } catch {
        /* */
      }
      await sleepMs(180)
    }
    if (deduped.length < count) {
      const missing = skillPlan.map((s) => s.id).filter((id) => !usedSkillIds.has(id))
      for (const q of takeSurplusEasyLocalSeeds(
        count - deduped.length,
        800,
        usedFingerprints,
        missing,
      )) {
        pushIfNew(q)
      }
    }
  } else {
    input.onProgress?.(`豆包整包生成 ${count} 道顺差与逆差复杂题…`)
    try {
      const batch = await withTimeout(
        requestSurplusHardBatch(count, [...usedTerms]),
        48_000,
        '豆包顺差逆差复杂整包',
      )
      for (const q of batch) pushIfNew(q)
    } catch {
      input.onProgress?.(`整包失败，改用短时单题/本地题库…`)
    }
    const anchors = pickSurplusHardSeedTemplates(count)
    for (let i = 0; deduped.length < count && i < anchors.length; i++) {
      const seed = anchors[i]!
      input.onProgress?.(
        `补第 ${deduped.length + 1}/${count} 题 · ${seed.term}（短时）…`,
      )
      const aiQ = await requestHardSurplusAnchoredMcq({
        seed,
        seq: 100 + i,
        timeoutMs: 14_000,
      })
      if (pushIfNew(aiQ)) continue
      pushIfNew(buildSurplusHardFromSeedTemplate(seed, 500 + i))
    }
    if (deduped.length < count) {
      for (const q of takeSurplusHardLocalSeeds(
        count - deduped.length,
        900,
        usedFingerprints,
      )) {
        pushIfNew(q)
      }
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题。请确认本地代理 8790 已启动后重试。`,
    )
  }
  return deduped.slice(0, count)
}
