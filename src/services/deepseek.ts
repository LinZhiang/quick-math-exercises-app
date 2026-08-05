import { parseAiJsonArrayLenient, parseAiJsonObjectLenient, stripAiJsonFence } from '@/utils/aiJsonParse'
import {
  CHINESE_MCQ_CORRECTNESS_RULES,
  isPlayableFourChoiceMcq,
  isPlayableLogicReasonMcq,
} from '@/utils/chineseMcqAiFields'
import {
  collectVocabRelatedFillOptionBank,
  parseVocabRelatedLearningPack,
  parseVocabRelatedQuizList,
  type VocabRelatedKind,
  type VocabRelatedLearningPack,
  type VocabRelatedQuizQuestion,
  type VocabRelatedSourceRow,
} from '@/utils/vocabRelatedLearning'
import {
  parseCharLiteracyRelatedLearningPack,
  parseCharLiteracyRelatedQuizList,
  type CharLiteracyRelatedLearningPack,
  type CharLiteracyRelatedQuizQuestion,
  type CharLiteracyRelatedSourceRow,
} from '@/utils/charLiteracyRelatedLearning'
import {
  buildCharLiteracyQuestionFromMcq,
  CHAR_LITERACY_QUESTION_COUNT,
  parseCharLiteracyMcqAiObject,
  type CharLiteracyQuestion,
} from '@/utils/charLiteracyPractice'
import {
  buildGeographyCommonSenseQuestionFromMcq,
  GEOGRAPHY_COMMON_SENSE_QUESTION_COUNT,
  parseGeographyCommonSenseMcqAiObject,
  type GeographyCommonSenseQuestion,
} from '@/utils/geographyCommonSensePractice'
import {
  buildHistoryCommonSenseQuestionFromMcq,
  HISTORY_COMMON_SENSE_QUESTION_COUNT,
  parseHistoryCommonSenseMcqAiObject,
  type HistoryCommonSenseQuestion,
} from '@/utils/historyCommonSensePractice'
import {
  buildLifeCommonSenseQuestionFromMcq,
  LIFE_COMMON_SENSE_QUESTION_COUNT,
  parseLifeCommonSenseMcqAiObject,
  type LifeCommonSenseQuestion,
} from '@/utils/lifeCommonSensePractice'
import {
  buildIdiomQuestionFromMcq,
  IDIOM_RECOGNITION_QUESTION_COUNT,
  parseIdiomMcqAiObject,
  type IdiomRecognitionQuestion,
} from '@/utils/idiomRecognitionPractice'
import {
  buildPartyHistoryQuestionFromMcq,
  PARTY_HISTORY_QUESTION_COUNT,
  parsePartyHistoryMcqAiObject,
  type PartyHistoryQuestion,
} from '@/utils/partyHistoryPractice'
import {
  buildPoetryQuestionFromMcq,
  parsePoetryMcqAiObject,
  POETRY_RECOGNITION_QUESTION_COUNT,
  type PoetryRecognitionQuestion,
} from '@/utils/poetryRecognitionPractice'
import {
  buildPoetDrillQuestionFromMcq,
  parsePoetDrillMcqAiObject,
  POET_DRILL_QUESTION_COUNT,
  type PoetDrillQuestion,
} from '@/utils/poetDrillPractice'
import {
  extractPoetDrillAllowlist,
  poetDrillQuestionInMaterial,
} from '@/utils/poetDrillMaterial'
import {
  buildCurrentAffairsDrillQuestionFromMcq,
  CURRENT_AFFAIRS_DRILL_QUESTION_COUNT,
  CURRENT_AFFAIRS_SENTENCE_FILL_QUESTION_COUNT,
  CURRENT_AFFAIRS_SENTENCE_ORDER_QUESTION_COUNT,
  currentAffairsDrillSourceInList,
  parseCurrentAffairsDrillMcqAiObject,
  type CurrentAffairsDrillQuestion,
} from '@/utils/currentAffairsDrillPractice'
import {
  buildTheoryPolicyQuestionFromMcq,
  THEORY_POLICY_QUESTION_COUNT,
  parseTheoryPolicyMcqAiObject,
  type TheoryPolicyQuestion,
} from '@/utils/theoryPolicyPractice'
import {
  buildTranslationReasonQuestionFromMcq,
  parseTranslationReasonMcqAiObject,
  TRANSLATION_REASON_QUESTION_COUNT,
  type TranslationReasonDifficulty,
  type TranslationReasonQuestion,
} from '@/utils/translationReasonPractice'
import {
  buildComboArrangeQuestionFromMcq,
  parseComboArrangeMcqAiObject,
  COMBO_ARRANGE_QUESTION_COUNT,
  type ComboArrangeDifficulty,
  type ComboArrangeQuestion,
} from '@/utils/comboArrangePractice'
import {
  buildTruthFalseQuestionFromMcq,
  parseTruthFalseMcqAiObject,
  TRUTH_FALSE_QUESTION_COUNT,
  type TruthFalseDifficulty,
  type TruthFalseQuestion,
} from '@/utils/truthFalsePractice'
import {
  buildEvalReasonQuestionFromMcq,
  parseEvalReasonMcqAiObject,
  EVAL_REASON_QUESTION_COUNT,
  type EvalReasonDifficulty,
  type EvalReasonQuestion,
} from '@/utils/evalReasonPractice'
import {
  buildStrengthenReasonQuestionFromMcq,
  parseStrengthenReasonMcqAiObject,
  STRENGTHEN_REASON_QUESTION_COUNT,
  type StrengthenReasonDifficulty,
  type StrengthenReasonQuestion,
} from '@/utils/strengthenReasonPractice'
import {
  buildWeakenReasonQuestionFromMcq,
  parseWeakenReasonMcqAiObject,
  WEAKEN_REASON_QUESTION_COUNT,
  type WeakenReasonDifficulty,
  type WeakenReasonQuestion,
} from '@/utils/weakenReasonPractice'
import {
  buildDailyConclusionQuestionFromMcq,
  parseDailyConclusionMcqAiObject,
  DAILY_CONCLUSION_QUESTION_COUNT,
  type DailyConclusionDifficulty,
  type DailyConclusionQuestion,
} from '@/utils/dailyConclusionPractice'
import {
  buildExplainPhenomQuestionFromMcq,
  parseExplainPhenomMcqAiObject,
  EXPLAIN_PHENOM_QUESTION_COUNT,
  type ExplainPhenomDifficulty,
  type ExplainPhenomQuestion,
} from '@/utils/explainPhenomPractice'
import {
  buildLegalCommonSenseQuestionFromMcq,
  LEGAL_COMMON_SENSE_QUESTION_COUNT,
  parseLegalCommonSenseMcqAiObject,
  type LegalCommonSenseQuestion,
} from '@/utils/legalCommonSensePractice'
import {
  buildEconomyCommonSenseQuestionFromMcq,
  ECONOMY_COMMON_SENSE_QUESTION_COUNT,
  parseEconomyCommonSenseMcqAiObject,
  type EconomyCommonSenseQuestion,
} from '@/utils/economyCommonSensePractice'
import {
  buildWordMemorizationQuestionFromMcq,
  WORD_MEMORIZATION_QUESTION_COUNT,
  parseWordMemorizationMcqAiObject,
  type WordMemorizationQuestion,
} from '@/utils/wordMemorizationPractice'
import {
  buildClassicalChineseQuestionFromMcq,
  CLASSICAL_CHINESE_QUESTION_COUNT,
  parseClassicalChineseMcqAiObject,
  type ClassicalChineseQuestion,
} from '@/utils/classicalChinesePractice'
import {
  buildRhetoricUsageQuestionFromMcq,
  RHETORIC_USAGE_QUESTION_COUNT,
  parseRhetoricUsageMcqAiObject,
  type RhetoricUsageQuestion,
} from '@/utils/rhetoricUsagePractice'
import {
  buildReadingComprehensionQuestionFromMcq,
  READING_COMPREHENSION_QUESTION_COUNT,
  parseReadingComprehensionMcqAiObject,
  readingModeNeedsAbsoluteCorrectSlot,
  readingQuestionHasGroundedAbsoluteCorrect,
  type ChineseReadingQuestionType,
  type ReadingComprehensionQuestion,
  readingComprehensionQuestionTypeLabel,
} from '@/utils/readingComprehensionPractice'
import {
  buildGeometryQuestionFromSeed,
  buildLocalGeometryPaper,
  GEOMETRY_QUESTION_COUNT,
  pickGeometrySeeds,
  type GeometryDifficulty,
  type GeometryQuestion,
  type GeometrySeed,
} from '@/utils/geometryPractice'
import {
  buildLocalProbabilityHardPaper,
  buildProbabilityQuestionFromSeed,
  pickProbabilityHardSeeds,
  PROBABILITY_QUESTION_COUNT,
  type ProbabilityQuestion,
  type ProbabilitySeed,
} from '@/utils/probabilityPractice'
import {
  FUNCTION_GRAPH_QUESTION_COUNT,
  buildFunctionGraphQuestionFromSeed,
  buildLocalFunctionGraphPaper,
  pickFunctionGraphSeeds,
  type FunctionGraphDifficulty,
  type FunctionGraphQuestion,
  type FunctionGraphSeed,
} from '@/utils/functionGraphPractice'
import {
  buildDataAnalysisQuestionFromMcq,
  DATA_ANALYSIS_QUESTION_COUNT,
  parseDataAnalysisMcqAiObject,
  type DataAnalysisDifficulty,
  type DataAnalysisQuestion,
} from '@/utils/dataAnalysisPractice'
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
} from '@/utils/dataAnalysisGrowthPractice'
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
} from '@/utils/dataAnalysisGrowthInterYearPractice'
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
} from '@/utils/dataAnalysisGrowthAvgAnnualPractice'
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
} from '@/utils/dataAnalysisGrowthMixedPractice'
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
} from '@/utils/dataAnalysisProportionBasicPractice'
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
} from '@/utils/dataAnalysisProportionBasePractice'
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
} from '@/utils/dataAnalysisAverageBasicPractice'
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
} from '@/utils/dataAnalysisAverageBasePractice'
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
} from '@/utils/dataAnalysisMultipleBasicPractice'
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
} from '@/utils/dataAnalysisMultipleBasePractice'
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
} from '@/utils/dataAnalysisIndexPractice'
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
} from '@/utils/dataAnalysisPullPractice'
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
} from '@/utils/dataAnalysisSurplusPractice'
import {
  hasStoredDeepSeekApiKey,
} from '@/utils/deepseekApiKeyStore'
import {
  isWenguApiReadyForCurrentUser,
  isWenguLoggedIn,
  WENGU_LOGIN_REQUIRED_HINT,
  wenguAuthTick,
} from '@/utils/wenguAuthStore'
import { WENGU_MEMBER_CUSTOM_API_HINT } from '@/utils/wenguApiOrigin'
import {
  aiChatCompletion,
  type AiMessage,
} from '@/services/ai'
import { aiRequestProgressText, getAiProvider, type AiProvider } from '@/utils/aiProviderStore'

/** 是否可使用语文 AI（已登录走服务端代理；成员须自备 API；开发环境可回退本机 Key） */
export function isAiChatConfigured(): boolean {
  void wenguAuthTick.value
  if (isWenguLoggedIn()) return isWenguApiReadyForCurrentUser()
  if (import.meta.env.DEV) {
    if (hasStoredDeepSeekApiKey()) return true
    if (Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY?.trim())) return true
  }
  return false
}

export const DEEPSEEK_NOT_CONFIGURED_HINT = WENGU_LOGIN_REQUIRED_HINT

/** 成员未配置自定义 API 时的提示（供 UI 区分） */
export { WENGU_MEMBER_CUSTOM_API_HINT }

export type DeepSeekChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** 内部转发至 aiChatCompletion；可单次覆盖 provider（如一般增长强制豆包） */
async function deepseekChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; provider?: AiProvider },
): Promise<string> {
  return aiChatCompletion(messages as AiMessage[], {
    provider: options?.provider ?? getAiProvider(),
    capability: 'text',
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  })
}

async function deepseekChatRaw(
  user: string,
  options?: {
    system?: string
    temperature?: number
    maxTokens?: number
    provider?: AiProvider
  },
): Promise<string> {
  return deepseekChatCompletion(
    [
      {
        role: 'system',
        content:
          options?.system ??
          '你是专业、严谨的学习助手，只输出用户要求的格式，使用简体中文。',
      },
      { role: 'user', content: user },
    ],
    options,
  )
}

const CONVERSATION_FOLLOWUP_NOTE =
  '学员可能继续追问。请结合上文题目与讲解作答，使用简体中文，可直接输出 Markdown。'

/** 单轮问答 */
export async function requestAssistantMarkdown(input: {
  system: string
  userMessage: string
  temperature?: number
}): Promise<string> {
  const userMessage = input.userMessage.trim()
  if (!userMessage) throw new Error('请输入提问内容')
  return deepseekChatRaw(userMessage, {
    system: input.system,
    temperature: input.temperature ?? 0.4,
    maxTokens: 2048,
  })
}

/** 关键题变式：根据原题 JSON 生成一道新四选一（仅返回 JSON 对象） */
export async function requestChinesePracticeVariantJson(input: {
  sourceTitle: string
  schemaHint: string
  originalQuestionJson: string
}): Promise<unknown> {
  const system = [
    `你是公考/事业编「${input.sourceTitle}」命题专家，专门根据错题本原题生成**变式题**。`,
    '只输出合法 JSON 对象，不要 markdown 代码围栏，不要其它说明。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')
  const user = [
    '请依据下列【原题】生成 1 道四选一变式题。',
    '变式要求：',
    '1. 可换提问方式（换题干/换角度），但仍考查同一知识要点或材料理解能力；',
    '2. 可继续以原正确选项为答案，也可在保证科学性的前提下，改为考查原干扰项中某一知识点（此时新 correct 必须对应该新问法的真正正确答案）；',
    '3. 选项可改写，干扰仍要有迷惑性；不要几乎原样照抄；',
    '4. 阅读类须保留或微调 passage，不得丢掉材料胡编；选项字数/标点必须齐整，禁止正确项独最长或独含逗号顿号。',
    '',
    '【硬性质量·违反则整题作废】',
    '5. questionType 必须与题干/选项形态一致：',
    '   - word-to-meaning（选释义）：展示目标词，选项必须是四条释义（不是词语本身）；禁止填空题干 + 词语选项却标成选释义；',
    '   - meaning-to-word（选词语）：题干不得出现正确答案/term；选项为词语；correct 必须等于 term；',
    '6. 错别字题（typo）四个选项必须是四个不同词语，严禁同一成语的规范写法与错写同列（如禁止「变本加利」与「变本加厉」同时出现）；',
    '   「没有错别字的是」：correct=term；三个干扰项分别为另外三个不同词语的形近/音近错写（不得是 term 的错写）；',
    '   「有错别字的是」：correct=term 的错写且 ≠ term；三个干扰项为另外三个正确词语；选项中不得出现 term；解析可写规范写法，但规范写法不得进选项；',
    '   严禁把规范写法标成「有错别字」的答案；',
    '7. 题干只允许唯一最优答案；禁止两个近义项都合理（如步履维艰/举步维艰同列且题干无法区分）；解析不得写「也是…之意/两者均可」。',
    '8. 任何字段不得提前泄露答案（题干、term 展示字段与选项形态错配即泄题）。',
    '',
    `【输出字段】\n${input.schemaHint}`,
    '',
    `【原题】\n${input.originalQuestionJson}`,
    '',
    '仅返回一个 JSON 对象。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')
  const raw = await deepseekChatRaw(user, {
    system,
    temperature: 0.55,
    maxTokens: 2000,
  })
  return parseAiJsonObjectLenient(raw)
}

/** 多轮追问 */
export async function deepseekChatConversation(input: {
  system: string
  history: DeepSeekChatTurn[]
  userMessage: string
  temperature?: number
}): Promise<string> {
  const userMessage = input.userMessage.trim()
  if (!userMessage) throw new Error('请输入追问内容')
  if (!input.history.length) throw new Error('对话尚未开始')
  const messages: ChatMessage[] = [
    { role: 'system', content: `${input.system.trim()}\n\n${CONVERSATION_FOLLOWUP_NOTE}` },
    ...input.history.map((t) => ({ role: t.role, content: t.content })),
    { role: 'user', content: userMessage },
  ]
  return deepseekChatCompletion(messages, {
    temperature: input.temperature ?? 0.4,
    maxTokens: 2048,
  })
}

const IDIOM_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解」命题专家，专门命制**四字成语**识记题（含选词填空、类比推理高频成语）。',
  '不要出非成语实词、关联词或双音节普通词语；目标必须是常用四字成语。',
  '干扰项必须高迷惑：近义错位/望文生义/常混成语，禁止口语场景句导致一眼排除。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const IDIOM_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示成语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个成语；correct 必须等于 term

【命题要求】
- **仅出四字成语**（如「潜移默化」「脱颖而出」），不要出双音节实词、关联词、网络新词或非成语短语
- 优先事业编/国考言语理解、逻辑填空高频易混成语
- **干扰项迷惑力（极重要）**：释义四项书面齐整；干扰优先近义成语释义错位、拆字生义、常混成语义；禁止生活场景化错项
- 释义选项 10～24 字；成语选项须为四字；选词语干扰须为常混近义/形近成语（尽量有共同字）
- term 填目标成语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/比喻义/语境，禁止写出答案成语
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"潜移默化","stem":"「潜移默化」的正确释义是？","correct":"人的思想或性格在不知不觉中受到感染、影响而发生变化","distractors":["暗中活动以改变局面","默默积累而后突然显露","表面和缓而实际已生变故"],"explanation":"……"}
选词语：{"questionType":"meaning-to-word","term":"脱颖而出","stem":"比喻人的才能全部显露出来的是？","correct":"脱颖而出","distractors":["出类拔萃","崭露头角","锋芒毕露"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function normalizeAvoidTerm(term: string): string {
  return term.trim().replace(/\s+/g, '')
}

function buildAvoidTermsHint(label: string, terms: string[]): string {
  const unique = [...new Set(terms.map(normalizeAvoidTerm).filter(Boolean))]
  if (!unique.length) return ''
  return `\n【禁止重复】以下${label}近期已练过，本批**一律不得**再出（含近义换题干）：${unique.join('、')}`
}

function dedupeQuestions(
  items: IdiomRecognitionQuestion[],
  blockedTerms?: Set<string>,
): IdiomRecognitionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: IdiomRecognitionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestIdiomRecognitionMcqs(input: {
  count?: number
  /** 跨轮次近期已出过的词语，连续约 90 道内避开 */
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<IdiomRecognitionQuestion[]> {
  const count = input.count ?? IDIOM_RECOGNITION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('题目'))

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选释义' : '选词语',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('成语', [...blocked])
  const user = [
    `请生成 **${count} 道** **四字成语**识记四选一练习题（不要出非成语词语），用于公务员与事业单位言语理解备考。`,
    IDIOM_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同，且均为四字成语。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: IDIOM_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: IdiomRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseIdiomMcqAiObject(item)
    if (!fields) return
    const q = buildIdiomQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('成语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道四字成语识记四选一题（不要出非成语词语）。\n${IDIOM_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: IDIOM_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseIdiomMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildIdiomQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const POETRY_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·文学常识/古诗文」命题专家，熟悉唐诗宋词、名家名句及公考高频篇目。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const POETRY_FORMAT = `
【题型】每题 questionType 随机取其一：
- poem-to-author（选作者）：给出诗句/词句（可 1～4 句），问作者是谁；选项为四位诗人/词人姓名
- poem-to-theme（选描写）：给出诗句/词句，问主要描写什么（意境、景色、天气、季节、情感等）；选项为四个概括性描述

【命题要求】
- 优先公考、事业编常考篇目：李白、杜甫、苏轼、辛弃疾、李清照、白居易、王维、杜牧、李商隐等
- 诗句须准确，可只取名句片段；term 填诗题（如「静夜思」）或词牌+首句标识
- poem-to-author 的 stem 只写诗句，**不得**出现作者姓名；correct 为作者全名
- poem-to-theme 的 stem 只写诗句，**不得**泄露正确答案；选项 8～24 字，概括描写对象或意境
- 干扰项须为同时代或常混诗人/相近意境描述
- explanation 用 1～2 句说明出处、背景或记忆要点

【JSON 示例】
选作者：{"questionType":"poem-to-author","term":"静夜思","stem":"床前明月光，疑是地上霜。举头望明月，低头思故乡。","correct":"李白","distractors":["杜甫","白居易","王维"],"explanation":"……"}
选描写：{"questionType":"poem-to-theme","term":"江雪","stem":"千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。","correct":"严冬江雪、孤寂寒境","distractors":["春日江南烟雨","秋夜洞庭月色","夏日荷塘清趣"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupePoetryQuestions(
  items: PoetryRecognitionQuestion[],
  blockedTerms?: Set<string>,
): PoetryRecognitionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: PoetryRecognitionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestPoetryRecognitionMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PoetryRecognitionQuestion[]> {
  const count = input.count ?? POETRY_RECOGNITION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('诗词题目'))

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选作者' : '选描写',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('篇目', [...blocked])
  const user = [
    `请生成 **${count} 道** 古诗文识记四选一练习题，用于公务员与事业单位备考。`,
    POETRY_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term（篇目）必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: POETRY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: PoetryRecognitionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePoetryMcqAiObject(item)
    if (!fields) return
    const q = buildPoetryQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupePoetryQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('篇目', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道古诗文识记四选一题。\n${POETRY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: POETRY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePoetryMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPoetryQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const POET_DRILL_SYSTEM = [
  '你是公务员考试与事业单位考试「文学常识/古诗文」命题专家，擅长根据给定背诵材料出细致识记题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  '硬性约束：所有考点、诗句、作者、背景必须严格来自用户提供的材料；严禁考查材料未出现的诗词、作者或史实。',
].join('\n')

const POET_DRILL_FORMAT = `
【题型】每题 questionType 随机取其一：
- verse-to-author（诗句选作者）：stem 只写**材料中原样出现的诗句**（可 1～4 句），问作者；选项为四位诗人姓名（正确项必须是材料中该诗句的作者；干扰项优先用同分期材料内其他诗人）
- author-to-verse（作者选诗句）：stem 问材料中某诗人；correct 必须是材料中该诗人名句原文；干扰项用材料中其他诗句或同分期易混句
- verse-to-background（诗句选背景）：stem 只写材料中的诗句，问材料注释/标签里的创作处境；选项为短句概括
- poet-fact（诗人背景）：只能考材料里写明的生平脉络、流派、阶段特点、应试标签；不得发挥课外知识

【材料封闭性·最高优先级】
- 不得出现材料未列出的篇目名、诗句、作者
- 若材料只有盛唐诗人，不得考初唐/中唐专属篇目
- term 只能填材料中的篇目名或诗人名

【诗句选背景·难度硬性要求】
- correct 与 distractors **一律不得**出现篇目名（term）及同形地标专名
- 干扰项取同分期材料里其他诗人的相近背景
- 优先考材料注释细点

【命题要求】
- 干扰项须强干扰；explanation 点明材料依据
- 本批 term 尽量分散覆盖材料内不同诗人与篇目

【JSON 示例】
选作者：{"questionType":"verse-to-author","term":"登幽州台歌","stem":"前不见古人，后不见来者。念天地之悠悠，独怆然而涕下。","correct":"陈子昂","distractors":["王勃","骆宾王","张若虚"],"explanation":"……"}
选背景：{"questionType":"verse-to-background","term":"黄鹤楼","stem":"日暮乡关何处是？烟波江上使人愁。","correct":"登楼远眺江上烟波，黄昏思乡","distractors":["舟泊秋江、羁旅漂泊","边城笛里折柳、征人怀乡","白帝高江、朝辞远行"],"explanation":"材料：崔颢《黄鹤楼》……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupePoetDrillQuestions(
  items: PoetDrillQuestion[],
  blockedTerms?: Set<string>,
): PoetDrillQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: PoetDrillQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestPoetDrillMcqs(input: {
  material: string
  periodLabel: string
  scopeKey: string
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PoetDrillQuestion[]> {
  const count = input.count ?? POET_DRILL_QUESTION_COUNT
  const material = input.material.trim()
  if (!material) throw new Error('当前分期没有可用材料，无法出题')
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('识记测试题'))

  const typeHints = Array.from({ length: count }, (_, i) => {
    const types = ['诗句选作者', '作者选诗句', '诗句选背景', '诗人背景']
    return `第 ${i + 1} 题建议 ${types[i % types.length]}`
  }).join('；')

  const historyHint = buildAvoidTermsHint('篇目/考点', [...blocked])
  const user = [
    `请根据下列「${input.periodLabel}」背诵材料，生成 **${count} 道** 细致识记四选一题（公考/事业编文学常识向）。`,
    POET_DRILL_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `【材料】\n${material}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: POET_DRILL_SYSTEM,
    temperature: 0.68,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const allow = extractPoetDrillAllowlist(material)
  const questions: PoetDrillQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePoetDrillMcqAiObject(item)
    if (!fields) return
    const q = buildPoetDrillQuestionFromMcq({
      ...fields,
      scopeKey: input.scopeKey,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q) && poetDrillQuestionInMaterial(q, allow)) {
      questions.push(q)
    }
  })

  const deduped = dedupePoetDrillQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('篇目/考点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请根据「${input.periodLabel}」材料再生成 1 道细致识记四选一题。考点必须全部来自下列材料，禁止超纲。`,
          POET_DRILL_FORMAT,
          avoidHint,
          `【材料】\n${material}`,
          '仅返回一个 JSON 对象。',
        ].join('\n\n'),
        { system: POET_DRILL_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePoetDrillMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPoetDrillQuestionFromMcq({
        ...fields,
        scopeKey: input.scopeKey,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q) || !poetDrillQuestionInMaterial(q, allow)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复与超纲题），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const CURRENT_AFFAIRS_DRILL_SYSTEM = [
  '你是公务员考试与事业单位考试「时政」命题专家，擅长根据给定材料出挖空识记题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  '硬性约束：考点必须严格来自用户提供的材料；严禁超纲。',
].join('\n')

const CURRENT_AFFAIRS_DRILL_FORMAT = `
【题型】questionType 仅两种：
- cloze-bold（重点挖空）：挖空必须来自材料中 **加粗** 的重点词/句
- cloze-plain（通读挖空）：挖空来自未加粗的正文，但仍须是核心实词、官方术语、关键表述

【比例·硬性】本批题目 cloze-bold : cloze-plain = **4:1**（20 题则重点挖空 16 题、通读挖空 4 题）

【挖空规则】
- stem 为挖空后的原句/原半句，用连续下划线 _______ 表示空缺；不得在 stem 中泄漏正确答案
- correct 为被挖去的原文片段（词或半句）
- 只挖核心实词、官方术语、关键政策表述；禁止只挖「的」「了」「是」「他」「我们」等助词/代词/虚词
- 挖空长度建议 2～12 字；半句挖空也可，但选项仍须等长

【干扰项·最高优先级】
- distractors 必须 3 个，且与 correct **字数完全一致**（不计空格）
- 干扰性必须很强：可改动其中一字/一词，或改半句关键表述，但整体读来像真考点
- 例：原文「中华民族伟大复兴」→ 干扰「中华民族伟大改造」「中华民族共同复兴」等
- 禁止无关长句、白话解释句、字数明显不同的选项

【出处】
- sourceTitle 必须填写材料中的「文章标题」原文（可与 ### 文章标题： 后一致）
- explanation 用 1～2 句说明依据，并再次点明出处文章

【JSON 字段】
questionType, sourceTitle, term（可与 correct 相同）, stem, correct, distractors[3], explanation

【JSON 示例】
{"questionType":"cloze-bold","sourceTitle":"2025年第19期《求是》杂志发表习近平重要文章","term":"血脉相融","stem":"各民族_______，是中华民族共同体形成和发展的历史根基。","correct":"血脉相融","distractors":["血缘相融","血脉相通","血脉相连"],"explanation":"出处：求是文章。材料强调各民族血脉相融是历史根基。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeCurrentAffairsDrillQuestions(
  items: CurrentAffairsDrillQuestion[],
  blockedTerms?: Set<string>,
): CurrentAffairsDrillQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: CurrentAffairsDrillQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestCurrentAffairsDrillMcqs(input: {
  material: string
  scopeLabel: string
  scopeKey: string
  allowedSourceTitles: string[]
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<CurrentAffairsDrillQuestion[]> {
  const count = input.count ?? CURRENT_AFFAIRS_DRILL_QUESTION_COUNT
  const material = input.material.trim()
  if (!material) throw new Error('当前栏目没有可用材料，无法出题')
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  const titles = input.allowedSourceTitles.filter(Boolean)
  input.onProgress?.(aiRequestProgressText('时政测试题'))

  const boldTarget = Math.max(1, Math.round((count * 4) / 5))
  const typeHints = Array.from({ length: count }, (_, i) => {
    const kind = i < boldTarget ? '重点挖空(cloze-bold)' : '通读挖空(cloze-plain)'
    return `第 ${i + 1} 题：${kind}`
  }).join('；')

  const historyHint = buildAvoidTermsHint('挖空答案', [...blocked])
  const user = [
    `请根据下列「${input.scopeLabel}」时政材料，生成 **${count} 道** 挖空四选一题（公考/事业编时政向）。`,
    CURRENT_AFFAIRS_DRILL_FORMAT,
    `本轮题型分配：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term（挖空答案）必须互不相同，严禁重复考点；优先覆盖不同文章与不同段落；sourceTitle 必须来自材料文章标题。`,
    `【材料】\n${material}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CURRENT_AFFAIRS_DRILL_SYSTEM,
    temperature: 0.62,
    maxTokens: 16384,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CurrentAffairsDrillQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCurrentAffairsDrillMcqAiObject(item)
    if (!fields) return
    if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) return
    const q = buildCurrentAffairsDrillQuestionFromMcq({
      ...fields,
      scopeKey: input.scopeKey,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeCurrentAffairsDrillQuestions(questions, blocked)
  // 尽量维持 4:1；不足时按缺的类型补生成
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 40; slot++) {
    const boldCount = deduped.filter((q) => q.questionType === 'cloze-bold').length
    const needBold = boldCount < boldTarget
    const preferType = needBold ? 'cloze-bold' : 'cloze-plain'
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('挖空答案', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请根据「${input.scopeLabel}」时政材料再生成 1 道挖空四选一题。`,
          CURRENT_AFFAIRS_DRILL_FORMAT,
          `本题 questionType 必须为 ${preferType}。`,
          avoidHint,
          `【材料】\n${material}`,
          '仅返回一个 JSON 对象。',
        ].join('\n\n'),
        { system: CURRENT_AFFAIRS_DRILL_SYSTEM, temperature: 0.68, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCurrentAffairsDrillMcqAiObject(oneObj)
      if (!fields) continue
      if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) continue
      const q = buildCurrentAffairsDrillQuestionFromMcq({
        ...fields,
        questionType: preferType,
        scopeKey: input.scopeKey,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 题（需等长强干扰项且避开重复），请稍后重试`,
    )
  }
  return deduped.slice(0, count)
}

const CURRENT_AFFAIRS_SENTENCE_FILL_SYSTEM = [
  '你是公务员考试与事业单位考试「时政」命题专家，擅长长句/半句挖空识记题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  '硬性约束：考点必须严格来自用户提供的材料；严禁超纲。',
  '干扰项须多处改写、保持官方语感；禁止只改一两个字的近形项。',
].join('\n')

const CURRENT_AFFAIRS_SENTENCE_FILL_FORMAT = `
【题型】questionType 固定为 sentence-fill（语句填充）

【挖空规则】
- 从材料原句中挖去一段 **不少于 12 字** 的连续半句/分句（核心表述），留下前后文
- stem 用连续下划线 _______ 表示空缺，例如：「各民族血脉相融，_______。」
- correct 必须是材料原文片段（≥12 字），不得改写正确答案
- stem 中不得泄漏正确答案

【干扰项·最高优先级】
- distractors 必须 3 个；与 correct 字数大致相当即可（允许差约 1/3 字数，不必等长）
- **禁止过细改写**：不得只改 1～2 个字（如仅「历史→时代」「形成→建设」「民族→各民族」）；此类一律不合格
- **鼓励多处改写**：每个干扰项应改动 **多个关键词**，甚至改写大半句结构；可读起来仍像官方时政表述，具有真实迷惑性
- 改写方向示例（可组合使用）：
  · 换核心判断（历史根基→现实基础 / 内生动力→外在推力）
  · 换主体或范围（中华民族共同体→各民族大家庭 / 命运共同体）
  · 换动词链条（形成和发展→巩固与提升 / 交往交流交融）
  · 改半句逻辑仍通顺但与原文不符
- 例：原文「是中华民族共同体形成和发展的历史根基」
  →「是各民族交往交流交融不断深化的现实基础」（多处改写）
  →「构成中华文明多元一体格局的文化基因」（换概念但仍像考点）
  →「推动统一的多民族国家巩固发展的内生动力」（大幅改写）
- 禁止：白话解释、无关长篇、明显跑题空话、与 correct 几乎相同的近形项

【上下文】
- context 必填：给出含该挖空句的完整原文段落（去掉 ** 标记即可），供学员「查看上下文」
- context 须包含 stem 所对应的原句（含被挖空的原文）

【出处】
- sourceTitle 必须为材料中的文章标题
- explanation 1～2 句点明出处与依据

【JSON 字段】
questionType, sourceTitle, term, stem, correct, distractors[3], context, explanation

【JSON 示例】
{"questionType":"sentence-fill","sourceTitle":"2025年第19期《求是》杂志发表习近平重要文章","term":"是中华民族共同体形成和发展的历史根基","stem":"各民族血脉相融，_______。","correct":"是中华民族共同体形成和发展的历史根基","distractors":["是各民族交往交流交融不断深化的现实基础","构成中华文明多元一体格局的文化基因","推动统一的多民族国家巩固发展的内生动力"],"context":"——各民族血脉相融，是中华民族共同体形成和发展的历史根基。各民族共同在中华大地上繁衍生息……","explanation":"出处：求是文章。对应「血脉相融」条目原文。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

export async function requestCurrentAffairsSentenceFillMcqs(input: {
  material: string
  scopeLabel: string
  scopeKey: string
  allowedSourceTitles: string[]
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<CurrentAffairsDrillQuestion[]> {
  const count = input.count ?? CURRENT_AFFAIRS_SENTENCE_FILL_QUESTION_COUNT
  const material = input.material.trim()
  if (!material) throw new Error('当前栏目没有可用材料，无法出题')
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  const titles = input.allowedSourceTitles.filter(Boolean)
  input.onProgress?.(aiRequestProgressText('时政语句填充'))

  const historyHint = buildAvoidTermsHint('填充片段', [...blocked])
  const user = [
    `请根据下列「${input.scopeLabel}」时政材料，生成 **${count} 道** 语句填充四选一题。`,
    CURRENT_AFFAIRS_SENTENCE_FILL_FORMAT,
    historyHint,
    `本批 ${count} 道的 correct/term 必须互不相同，严禁同一挖空片段重复；优先覆盖不同文章与不同原句；sourceTitle 必须来自材料文章标题。`,
    `【材料】\n${material}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CURRENT_AFFAIRS_SENTENCE_FILL_SYSTEM,
    temperature: 0.65,
    maxTokens: 16384,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CurrentAffairsDrillQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCurrentAffairsDrillMcqAiObject(item)
    if (!fields) return
    if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) return
    const q = buildCurrentAffairsDrillQuestionFromMcq({
      ...fields,
      questionType: 'sentence-fill',
      scopeKey: input.scopeKey,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeCurrentAffairsDrillQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 40; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('填充片段', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请根据「${input.scopeLabel}」时政材料再生成 1 道语句填充四选一题。`,
          CURRENT_AFFAIRS_SENTENCE_FILL_FORMAT,
          avoidHint,
          `【材料】\n${material}`,
          '仅返回一个 JSON 对象。',
        ].join('\n\n'),
        { system: CURRENT_AFFAIRS_SENTENCE_FILL_SYSTEM, temperature: 0.7, maxTokens: 1400 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCurrentAffairsDrillMcqAiObject(oneObj)
      if (!fields) continue
      if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) continue
      const q = buildCurrentAffairsDrillQuestionFromMcq({
        ...fields,
        questionType: 'sentence-fill',
        scopeKey: input.scopeKey,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 道语句填充题（需≥12字挖空、多处改写干扰项与上下文），请稍后重试`,
    )
  }
  return deduped.slice(0, count)
}

const CURRENT_AFFAIRS_SENTENCE_ORDER_SYSTEM = [
  '你是公务员考试与事业单位考试「时政」命题专家，擅长语句排序/段落重组识记题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  '硬性约束：考点必须严格来自用户提供的材料；严禁超纲、严禁杜撰原文。',
].join('\n')

const CURRENT_AFFAIRS_SENTENCE_ORDER_FORMAT = `
【题型】questionType 固定为 sentence-order（语句排序）

【选材与拆分】
- 从材料中选取一段连贯原文（一句长论述或紧密相连的数句），拆成恰好 **5** 段（segments）
- 每段应是完整意群，长度尽量接近；去掉 ** 加粗标记
- segments 数组按 **界面展示顺序** 给出：必须已经打乱，对应序号 1、2、3、4、5
- 禁止把无关句子拼在一起；五段合起来应能还原为材料中的连贯表述

【正确答案 correct】
- 字符串格式固定为「数字、数字、数字、数字、数字」，如「3、4、5、2、1」
- 含义：按该排列阅读 segments[序号-1]，即可还原原文逻辑顺序
- 例：若正确阅读顺序是展示编号 3→4→5→2→1，则 correct 为「3、4、5、2、1」
- 必须是 1～5 的全排列，不得重复、不得缺号

【干扰项 distractors】
- 恰好 3 个；同样写成「a、b、c、d、e」全排列格式
- 必须与 correct 不同，且彼此不同
- 干扰性必须很强：仅交换相邻两段、首尾对调、中间三段循环移位、因果/递进顺序颠倒等，读来仍像合理语序
- 禁止明显胡乱排列（如一眼就乱的跳跃序）

【上下文 context】
- 必填：给出该题对应的原文完整段落（正确阅读顺序、去掉 **），供学员「查看上下文」

【出处与题干】
- sourceTitle 必须为材料中的文章标题
- stem 可写：「下列五段文字顺序已打乱（序号 1～5）。请选择能还原原文逻辑顺序的排列：」
- term 用该段原文前 20～40 字作去重键（勿与本批其它题重复）
- explanation 1～2 句点明出处，并可简述正确语序依据（因果/总—分/时间等）

【JSON 字段】
questionType, sourceTitle, term, stem, segments[5], correct, distractors[3], context, explanation

【JSON 示例】
{"questionType":"sentence-order","sourceTitle":"2025年第19期《求是》杂志发表习近平重要文章","term":"各民族血脉相融是中华民族共同体","stem":"下列五段文字顺序已打乱（序号 1～5）。请选择能还原原文逻辑顺序的排列：","segments":["各民族共同开拓了祖国的锦绣河山。","是中华民族共同体形成和发展的历史根基。","各民族血脉相融，","各民族共同书写了悠久历史，","各民族共同创造了灿烂文化，"],"correct":"3、2、1、4、5","distractors":["3、2、4、5、1","3、1、2、4、5","2、3、1、4、5"],"context":"各民族血脉相融，是中华民族共同体形成和发展的历史根基。各民族共同开拓了祖国的锦绣河山。各民族共同书写了悠久历史，各民族共同创造了灿烂文化……","explanation":"出处：求是文章。先总起「血脉相融」与根基，再并列展开共同开拓、书写、创造。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

export async function requestCurrentAffairsSentenceOrderMcqs(input: {
  material: string
  scopeLabel: string
  scopeKey: string
  allowedSourceTitles: string[]
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<CurrentAffairsDrillQuestion[]> {
  const count = input.count ?? CURRENT_AFFAIRS_SENTENCE_ORDER_QUESTION_COUNT
  const material = input.material.trim()
  if (!material) throw new Error('当前栏目没有可用材料，无法出题')
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  const titles = input.allowedSourceTitles.filter(Boolean)
  input.onProgress?.(aiRequestProgressText('时政语句排序'))

  const historyHint = buildAvoidTermsHint('排序语段', [...blocked])
  const user = [
    `请根据下列「${input.scopeLabel}」时政材料，生成 **${count} 道** 语句排序四选一题。`,
    CURRENT_AFFAIRS_SENTENCE_ORDER_FORMAT,
    historyHint,
    `本批 ${count} 道的 term/语段必须互不相同，严禁同一段落重复出题；优先覆盖不同文章；sourceTitle 必须来自材料文章标题。`,
    `【材料】\n${material}`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CURRENT_AFFAIRS_SENTENCE_ORDER_SYSTEM,
    temperature: 0.65,
    maxTokens: 16384,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CurrentAffairsDrillQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCurrentAffairsDrillMcqAiObject(item)
    if (!fields) return
    if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) return
    const q = buildCurrentAffairsDrillQuestionFromMcq({
      ...fields,
      questionType: 'sentence-order',
      scopeKey: input.scopeKey,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeCurrentAffairsDrillQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 40; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('排序语段', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请根据「${input.scopeLabel}」时政材料再生成 1 道语句排序四选一题。`,
          CURRENT_AFFAIRS_SENTENCE_ORDER_FORMAT,
          avoidHint,
          `【材料】\n${material}`,
          '仅返回一个 JSON 对象。',
        ].join('\n\n'),
        { system: CURRENT_AFFAIRS_SENTENCE_ORDER_SYSTEM, temperature: 0.7, maxTokens: 1800 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCurrentAffairsDrillMcqAiObject(oneObj)
      if (!fields) continue
      if (!currentAffairsDrillSourceInList(fields.sourceTitle, titles)) continue
      const q = buildCurrentAffairsDrillQuestionFromMcq({
        ...fields,
        questionType: 'sentence-order',
        scopeKey: input.scopeKey,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成 ${deduped.length}/${count} 道语句排序题（需 5 段打乱与强干扰排列），请稍后重试`,
    )
  }
  return deduped.slice(0, count)
}

const LIFE_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·生活科学」命题专家，熟悉物理、化学、生物、科技与生活等高频易考点。',
  '题目以识记与辨析为主，难度中等偏易；不要出公式推导、复杂计算或专业实验压轴题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const LIFE_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、生活现象解释、易混提法辨析；忌过深理论。

【命题比例·必须遵守】（15 题一轮）
- **物理**：约 **25%～30%**（力、热、光、声、电与生活应用，如惯性、沸腾、凸透镜、导体绝缘体等高频点）
- **化学**：约 **25%～30%**（物质变化、酸碱、燃烧条件、常见材料与食品安全常识等高频点）
- **生物**：约 **20%～25%**（人体系统、植物生理、遗传基础、生态与传染病防疫常识等高频点）
- **科技与生活**：约 **20%～25%**（互联网/通信基础、新能源、航天航空常考常识、日常数字技术概念，忌过深专业细节）

【命题要求】
- term 填知识点关键词（如「惯性」「酸碱中和」「光合作用」「5G」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 依据现行常用表述，表述准确但通俗

【JSON 示例】
{"questionType":"general","term":"惯性","stem":"物体保持原有运动状态的性质称为？","correct":"惯性","distractors":["重力","摩擦力","弹力"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeLifeCommonSenseQuestions(
  items: LifeCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): LifeCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: LifeCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestLifeCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<LifeCommonSenseQuestion[]> {
  const count = input.count ?? LIFE_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('生活科学题目'))

  const historyHint = buildAvoidTermsHint('生活科学知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「生活科学」四选一练习题（物理/化学/生物/科技与生活，**难度中等偏易、高频考点**）。`,
    LIFE_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: LIFE_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: LifeCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseLifeCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildLifeCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeLifeCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('生活科学知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道生活科学四选一题（C 类公基难度，物理/化学/生物/科技与生活高频点，勿出难题）。\n${LIFE_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: LIFE_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseLifeCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildLifeCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const GEOGRAPHY_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·地理常识」命题专家，熟悉中国自然地理、人文地理、世界地理、地球与地图等高频易考点。',
  '题目以识记与辨析为主，难度中等偏易；不要出复杂计算、等高线压轴分析或过难区域综合题。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const GEOGRAPHY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、常考地理事实、易混区位辨析；忌偏难怪。

【命题比例·必须遵守】（15 题一轮）
- **中国自然地理**：约 **30%～35%**（山川河湖、气候类型、地形阶梯、资源分布、自然灾害等高频点）
- **中国人文地理**：约 **25%～30%**（行政区划与省会、人口与城市、农业工业布局、交通线等高频点）
- **世界地理**：约 **15%～20%**（大洲大洋、主要国家首都/气候/资源、重要海峡运河等高频基础点）
- **地球与地图**：约 **15%～20%**（经纬网、时区日界线、地球运动与四季昼夜、比例尺方向等高频基础点）

【命题要求】
- term 填知识点关键词（如「秦岭—淮河」「长江」「时区」「板块构造」）
- stem 写完整问句；选项互斥；干扰项为易混概念或易混地名
- explanation 用 1～2 句简体中文说明
- 表述准确但通俗，贴近公基真题风格

【JSON 示例】
{"questionType":"general","term":"秦岭—淮河","stem":"我国冬季平均气温 0℃等温线大体经过的地理分界线是？","correct":"秦岭—淮河一线","distractors":["黄河流域","长江流域","南岭一线"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeGeographyCommonSenseQuestions(
  items: GeographyCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): GeographyCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: GeographyCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestGeographyCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<GeographyCommonSenseQuestion[]> {
  const count = input.count ?? GEOGRAPHY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('地理常识题目'))

  const historyHint = buildAvoidTermsHint('地理知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「地理常识」四选一练习题（中国自然/人文、世界地理、地球与地图，**难度中等偏易、高频考点**）。`,
    GEOGRAPHY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: GEOGRAPHY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: GeographyCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseGeographyCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildGeographyCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeGeographyCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('地理知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道地理常识四选一题（C 类公基难度，中国地理/世界地理/地球与地图高频点，勿出难题）。\n${GEOGRAPHY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: GEOGRAPHY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseGeographyCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildGeographyCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const CHAR_LITERACY_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·字音字形」命题专家，熟悉公考高频易错读音、多音字、形近字与音近错别字。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  '选项必须干净：禁止把思考、自我纠正、问号、多个拼音写进选项正文。',
].join('\n')

const CHAR_LITERACY_FORMAT = `
【题型】每题 questionType 随机取其一：
- pronunciation（读音辨析）：考查加点字/词语正确读音，或「下列读音全部正确的是」「下列加点字读音有误的是」等公考常见问法
- typo（错别字）：考查「下列词语没有错别字的是」「下列词语有错别字的是」等，干扰项须含形近/音近错字

【命题要求·干扰要强且不能一眼露馅】
- 优先事业编/国考言语理解高频易错点：多音字、习惯性误读、形近字、音近别字
- term 填考点关键词的**规范写法**（如「纨绔」「暴殄天物」「一筹莫展」「和盘托出」）
- 读音题：四个选项外观一致，均为「词语 + 单一拼音注音」；干扰项只改拼音（常见误读）；**每个选项只能出现一处拼音括号**
- **严禁**把思考过程写进选项（如「……（yí）？不，……（shé）」「不对」「应该是」等自我纠正话术）；此类整题作废
- **严禁**选项中出现问号、感叹号、逗号拼接两套答案、或多个拼音注音
- 错别字题：四个选项均为完整词语/成语，外观一致；**不要**用引号、括号、（误）等标出哪个字错了
- **错别字极性（极重要）**：
  - **四个选项=四个不同词语**；严禁同一成语的规范写法与错写同列（如禁止同时出现「变本加利」与「变本加厉」）
  - 「没有错别字的是」：correct = term；三个 distractors 分别是**另外三个不同词语**的形近/音近错写（不得是 term 本身的错写）
  - 「有错别字的是」：correct 是 term 的错写且 ≠ term；三个 distractors 是**另外三个正确词语**；选项中**不得**出现 term；规范写法只写在 explanation 里
  - 严禁把规范写法标成「有错别字」题的答案；解析若写「正确写法是 X」，则 X 不得出现在 options 里，correct 也绝不能是 X
- **严禁**选项中出现：（误）、(误)、【误】、误读、错误、有误、×、✗，以及用 '' "" 「」 『』 包住某个字来暗示它是错字
- 四个选项必须「看起来都像正确答案」，只能靠知识判断，不能靠排版/标注判断
- explanation 用 1～2 句点明正确读音/正确字形及易混原因（解析里可以说哪里错，选项正文里不能说）

【JSON 示例】
读音：{"questionType":"pronunciation","term":"虚与委蛇","stem":"下列词语中加点字读音正确的是？","correct":"虚与委蛇（yí）","distractors":["虚与委蛇（shé）","虚与委蛇（yé）","虚与委蛇（tuó）"],"explanation":"「蛇」此处读 yí，不读 shé。"}
没有错别字：{"questionType":"typo","term":"和盘托出","stem":"下列词语没有错别字的是？","correct":"和盘托出","distractors":["世外桃园","再接再励","墨守陈规"],"explanation":"「和盘托出」书写正确；另三项分别为「桃源」「再厉」「成规」之误。"}
有错别字：{"questionType":"typo","term":"变本加厉","stem":"下列词语有错别字的是？","correct":"变本加利","distractors":["百折不挠","顶天立地","再接再厉"],"explanation":"「变本加利」应为「变本加厉」，「厉」意为猛烈，不可写作「利」。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeCharLiteracyQuestions(
  items: CharLiteracyQuestion[],
  blockedTerms?: Set<string>,
): CharLiteracyQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: CharLiteracyQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestCharLiteracyMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<CharLiteracyQuestion[]> {
  const count = input.count ?? CHAR_LITERACY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('字音字形题目'))

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '读音辨析' : '错别字',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('考点词语', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编高频「字音字形」四选一练习题，干扰项要强、易混。`,
    CHAR_LITERACY_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CHAR_LITERACY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: CharLiteracyQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseCharLiteracyMcqAiObject(item)
    if (!fields) return
    const q = buildCharLiteracyQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeCharLiteracyQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('考点词语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道字音字形四选一题（读音或错别字均可）。\n${CHAR_LITERACY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: CHAR_LITERACY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseCharLiteracyMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildCharLiteracyQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const HISTORY_COMMON_SENSE_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·历史」命题专家，熟悉中国史高频考点；世界史仅作少量补充。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const HISTORY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】
- **以中国史为主**：约 **85%～90%** 为中国史（古代史 + 近现代史）
- **世界史从少**：至多约 **10%～15%**（15 题中世界史不超过 2 题；补单题时优先出中国史）
- 面向浙江杭州等地事业编/公考常见考法，少出冷门外国史细节

【命题要求】
- 中国古代史优先：秦汉唐宋元明清重大事件、制度、人物、都城与改革
- 中国近现代史优先：鸦片战争至新中国成立前关键节点、条约、运动、人物
- 世界史仅保留极少高频：如两次世界大战、工业革命等极常见点，不要堆砌国别琐事
- term 填知识点关键词（如「辛亥革命」「贞观之治」「鸦片战争」）
- stem 写完整问句；选项 4 个互斥、干扰项易混但错误
- explanation 用 1～2 句简体中文说明

【JSON 示例】
{"questionType":"general","term":"辛亥革命","stem":"辛亥革命爆发于哪一年？","correct":"1911年","distractors":["1919年","1921年","1949年"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeHistoryCommonSenseQuestions(
  items: HistoryCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): HistoryCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: HistoryCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestHistoryCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<HistoryCommonSenseQuestion[]> {
  const count = input.count ?? HISTORY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('历史常识题目'))

  const historyHint = buildAvoidTermsHint('历史知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编「历史常识」四选一练习题（面向杭州等地考情：**绝大部分为中国史**，世界史极少）。`,
    HISTORY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: HISTORY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: HistoryCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseHistoryCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildHistoryCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeHistoryCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('历史知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道历史常识四选一题（优先中国史，非必要不要出世界史）。\n${HISTORY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: HISTORY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseHistoryCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildHistoryCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const PARTY_HISTORY_SYSTEM = [
  '你是公务员考试与事业单位考试「常识判断·中共党史」命题专家，熟悉建党以来重要会议、事件、人物、路线方针与时间节点。',
  '命题以会议内容、事件意义、人物贡献、路线方针为主，纯时间节点题从少。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const PARTY_HISTORY_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】（按考点考察角度分配，15 题一轮时严格控制数量）
- **时间节点从少**：纯问「哪一年/哪一月/哪一天召开/发生」的题约 **10%～15%**（15 题中至多 **2** 题；补单题时优先非时间题）
- **重要会议（内容/意义/地点/决策）**：约 **30%～35%**（会议确立了什么、通过了什么、历史意义等，勿改写成纯年份题）
- **重要事件**：约 **25%～30%**（经过、结果、意义、与同期事件辨析）
- **人物与贡献**：约 **15%～20%**（谁提出/领导/贡献，人物与事件对应关系）
- **路线方针与决议**：约 **15%～20%**（路线、方针、重要决议名称与核心内容）

【禁止偏题】
- 不要批量出「××会议召开于哪一年」「××事件发生于哪一年」同类题
- 干扰项优先易混会议名称、决议内容、人物贡献、事件意义；仅时间题才用易混年份作选项

【命题要求】
- 优先事业编/国考常考：一大至二十大、遵义会议、长征、抗战、解放战争、建国、改革开放、十一届三中全会、重要决议与人物贡献等
- term 填知识点关键词（如「遵义会议」「十一届三中全会」「中共一大」）
- stem 写完整问句；选项互斥；同一批题考察角度要多样
- explanation 用 1～2 句简体中文说明
- 表述客观、准确，符合公开权威表述

【JSON 示例】（示例为会议内容题，勿模仿成时间题）
{"questionType":"general","term":"遵义会议","stem":"遵义会议的重大历史意义是？","correct":"事实上确立了毛泽东在党中央和红军的领导地位","distractors":["通过了《关于建国以来党的若干历史问题的决议》","确立了社会主义市场经济体制的改革目标","提出了社会主义初级阶段的基本路线"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupePartyHistoryQuestions(
  items: PartyHistoryQuestion[],
  blockedTerms?: Set<string>,
): PartyHistoryQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: PartyHistoryQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestPartyHistoryMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<PartyHistoryQuestion[]> {
  const count = input.count ?? PARTY_HISTORY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('中共党史题目'))

  const historyHint = buildAvoidTermsHint('党史知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 公考/事业编「中共党史」四选一练习题（**时间节点从少**，以会议内容、事件意义、人物贡献、路线方针为主）。`,
    PARTY_HISTORY_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；考察角度须按【命题比例】分配，纯时间题不超过约 15%。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: PARTY_HISTORY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: PartyHistoryQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parsePartyHistoryMcqAiObject(item)
    if (!fields) return
    const q = buildPartyHistoryQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupePartyHistoryQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('党史知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道中共党史四选一题（优先会议内容/事件意义/人物贡献/路线方针，非必要不要出纯时间节点题）。\n${PARTY_HISTORY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: PARTY_HISTORY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parsePartyHistoryMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildPartyHistoryQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const THEORY_POLICY_SYSTEM = [
  '你是事业单位与公务员考试「政治理论·政策法规」命题专家，熟悉习近平新时代中国特色社会主义思想、党的二十大报告、党的二十届三中全会《决定》及近年政府工作报告高频考点。',
  '命题紧扣公开权威表述，选项准确、干扰项为易混提法；不要编造未公布的文件条款。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const THEORY_POLICY_FORMAT = `
【题型】questionType 固定为 general

【命题比例·必须遵守】（15 题一轮时严格控制数量）
- **习近平新时代中国特色社会主义思想**：约 **35%～40%**（核心要义、十个明确、十四个坚持、十三个方面成就、中国式现代化、新发展理念、高质量发展等）
- **党的二十大报告**：约 **25%～30%**（中心任务、两步走、五个必由之路、三个务必、总体国家安全观、全过程人民民主等报告表述）
- **党的二十届三中全会《决定》**：约 **20%～25%**（进一步全面深化改革总目标、七个聚焦、到 2029 年完成改革任务等《决定》要点）
- **政府工作报告及相关政策表述**：约 **15%～20%**（近年政府工作报告高频目标、举措、民生与经济发展表述，与上述理论衔接）

【命题要求】
- 面向事业编/公考常考：核心概念辨析、原文关键表述填空式选择、目标/原则/任务对应关系
- term 填知识点关键词（如「中国式现代化」「进一步全面深化改革」「高质量发展」「全过程人民民主」）
- stem 写完整问句；选项互斥；干扰项为易混概念或相近文件提法，勿用明显错误到一眼识破的表述
- explanation 用 1～2 句简体中文说明依据（文件/报告出处可点到即可）
- 表述客观、准确，符合公开发布的权威表述；避免过时或相互矛盾的说法

【JSON 示例】
{"questionType":"general","term":"中国式现代化","stem":"党的二十大报告指出，中国式现代化是人口规模巨大的现代化，是全体人民共同富裕的现代化，是物质文明和精神文明相协调的现代化，是人与自然和谐共生的现代化，还是？","correct":"走和平发展道路的现代化","distractors":["对外扩张发展的现代化","依附外部市场的现代化","以资本为中心的现代化"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeTheoryPolicyQuestions(
  items: TheoryPolicyQuestion[],
  blockedTerms?: Set<string>,
): TheoryPolicyQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: TheoryPolicyQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestTheoryPolicyMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<TheoryPolicyQuestion[]> {
  const count = input.count ?? THEORY_POLICY_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('理论政策题目'))

  const historyHint = buildAvoidTermsHint('理论政策知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「理论政策」四选一练习题（聚焦习近平新时代中国特色社会主义思想、二十大报告、二十届三中全会《决定》及政府工作报告）。`,
    THEORY_POLICY_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；考察来源须按【命题比例】分配。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: THEORY_POLICY_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: TheoryPolicyQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseTheoryPolicyMcqAiObject(item)
    if (!fields) return
    const q = buildTheoryPolicyQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeTheoryPolicyQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('理论政策知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道理论政策四选一题（按命题比例，覆盖习思想/二十大报告/三中全会《决定》/政府工作报告）。\n${THEORY_POLICY_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: THEORY_POLICY_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseTheoryPolicyMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildTheoryPolicyQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const LEGAL_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·法律常识」命题专家，熟悉宪法、民法、刑法、行政法高频易考点。',
  '题目以识记与辨析为主，难度中等偏易，不要出案例分析压轴题、不要堆砌冷门法条细节。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const LEGAL_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、常考制度、易混辨析即可；忌偏难怪。

【命题比例·必须遵守】（15 题一轮）
- **宪法**：约 **25%～30%**（国体政体、公民基本权利义务、国家机构、全国人大/国务院职权等高频点）
- **民法**：约 **25%～30%**（民事主体、民事权利、合同基础、时效、婚姻继承常考点）
- **刑法**：约 **20%～25%**（犯罪构成基础、正当防卫/紧急避险、刑罚种类、常见罪名辨识）
- **行政法**：约 **20%～25%**（行政行为、行政处罚/许可/强制、行政复议与诉讼基础、公务员法常识）

【命题要求】
- term 填知识点关键词（如「公民基本权利」「行政处罚」「正当防卫」「诉讼时效」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 依据现行常用表述，表述准确但通俗

【JSON 示例】
{"questionType":"general","term":"正当防卫","stem":"为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为，对不法侵害人造成损害的，属于？","correct":"正当防卫","distractors":["紧急避险","过失犯罪","意外事件"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeLegalCommonSenseQuestions(
  items: LegalCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): LegalCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: LegalCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestLegalCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<LegalCommonSenseQuestion[]> {
  const count = input.count ?? LEGAL_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('法律常识题目'))

  const historyHint = buildAvoidTermsHint('法律知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「法律常识」四选一练习题（宪法/民法/刑法/行政法，**难度中等偏易、高频考点**）。`,
    LEGAL_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖四法。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: LEGAL_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: LegalCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseLegalCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildLegalCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeLegalCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('法律知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道法律常识四选一题（C 类公基难度，宪法/民法/刑法/行政法高频点，勿出难题）。\n${LEGAL_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: LEGAL_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseLegalCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildLegalCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const ECONOMY_COMMON_SENSE_SYSTEM = [
  '你是事业编联考 C 类「公共基础知识·经济常识」命题专家，熟悉微观经济、宏观经济、社会主义市场经济高频易考点。',
  '题目以概念识记与简单辨析为主，难度中等偏易；不要出公式推导、复杂图表或专业金融计算。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const ECONOMY_COMMON_SENSE_FORMAT = `
【题型】questionType 固定为 general

【难度】事业编联考 C 类公基常见难度：基础概念、政策工具辨识、易混提法辨析；忌过深理论。

【命题比例·必须遵守】（15 题一轮）
- **微观经济**：约 **30%～35%**（供给需求、价格、市场类型、机会成本、边际效用等高频基础点）
- **宏观经济**：约 **30%～35%**（GDP、通胀通缩、财政货币政策、失业率、经济周期等高频点）
- **社会主义市场经济**：约 **30%～35%**（基本经济制度、所有制、分配制度、市场决定作用与更好发挥政府作用等高频表述）

【命题要求】
- term 填知识点关键词（如「通货膨胀」「财政政策」「社会主义市场经济」「需求价格弹性」）
- stem 写完整问句；选项互斥；干扰项为易混概念
- explanation 用 1～2 句简体中文说明
- 表述准确但通俗，贴近公基真题风格

【JSON 示例】
{"questionType":"general","term":"通货膨胀","stem":"一般物价水平持续上涨、货币购买力下降的经济现象称为？","correct":"通货膨胀","distractors":["通货紧缩","滞胀","流动性陷阱"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeEconomyCommonSenseQuestions(
  items: EconomyCommonSenseQuestion[],
  blockedTerms?: Set<string>,
): EconomyCommonSenseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: EconomyCommonSenseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestEconomyCommonSenseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<EconomyCommonSenseQuestion[]> {
  const count = input.count ?? ECONOMY_COMMON_SENSE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('经济常识题目'))

  const historyHint = buildAvoidTermsHint('经济知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编联考 C 类公基「经济常识」四选一练习题（微观/宏观/社会主义市场经济，**难度中等偏易、高频考点**）。`,
    ECONOMY_COMMON_SENSE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；按【命题比例】覆盖三类。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: ECONOMY_COMMON_SENSE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: EconomyCommonSenseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseEconomyCommonSenseMcqAiObject(item)
    if (!fields) return
    const q = buildEconomyCommonSenseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeEconomyCommonSenseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('经济知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道经济常识四选一题（C 类公基难度，微观/宏观/社会主义市场经济高频点，勿出难题）。\n${ECONOMY_COMMON_SENSE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: ECONOMY_COMMON_SENSE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseEconomyCommonSenseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildEconomyCommonSenseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const WORD_MEMORIZATION_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·词语识记」命题专家，专门命制**非四字成语**的词语识记题（实词、虚词、关联词、近义辨析等）。',
  '禁止出四字成语；目标必须是双音节/三音节词语或常见关联词、短语。',
  '干扰项必须高迷惑：近义错位/拆字望文生义/常混词，禁止口语场景句导致一眼排除。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const WORD_MEMORIZATION_FORMAT = `
【题型】每题 questionType 随机取其一：
- word-to-meaning（选释义）：展示词语，选项为四个释义；stem 可写「「XXX」的正确释义是？」
- meaning-to-word（选词语）：仅给出释义或语境问句，选项为四个词语；correct 必须等于 term

【命题要求】
- **禁止四字成语**；词语长度多为 2～3 字，或常见关联词（如「尽管如此」「不仅…而且…」类，可作 term 短标签）
- 优先事业编/国考言语理解逻辑填空高频易混实词、虚词、近义辨析
- **干扰项迷惑力（极重要）**：四个释义/词语须齐整、书面；干扰优先近义程度/对象偷换、拆字生义但像词典义、常混近义词；禁止「着急下班」「发布通知」「监督下属」等生活场景句
- 释义选项 8～24 字，风格统一如词典短释；词语选项须为非四字成语的短词语
- term 填目标词语（选词语题 **不得** 在 stem 中出现 term 或正确答案）
- meaning-to-word 的 stem 只写释义/用法/语境，禁止写出答案词语；干扰词须与 term 同义场或有共同汉字
- explanation 用 1～2 句简体中文说明辨析要点

【JSON 示例】
选释义：{"questionType":"word-to-meaning","term":"顾惜","stem":"「顾惜」的正确释义是？","correct":"顾全爱惜；珍惜","distractors":["顾念爱护","怜惜体恤","眷顾思念"],"explanation":"「顾惜」侧重顾全并爱惜，对象可为身体、名誉、情面等。"}
选词语：{"questionType":"meaning-to-word","term":"贻误","stem":"因拖延或差错而造成不利影响，可用哪个词语？","correct":"贻误","distractors":["延误","耽误","辜负"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeWordMemorizationQuestions(
  items: WordMemorizationQuestion[],
  blockedTerms?: Set<string>,
): WordMemorizationQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: WordMemorizationQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestWordMemorizationMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<WordMemorizationQuestion[]> {
  const count = input.count ?? WORD_MEMORIZATION_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('词语识记题目'))

  const typeHints = Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? '选释义' : '选词语',
  )
    .map((t, i) => `第 ${i + 1} 题建议 ${t}`)
    .join('；')

  const historyHint = buildAvoidTermsHint('词语', [...blocked])
  const user = [
    `请生成 **${count} 道** **非四字成语**词语识记四选一练习题（实词、虚词、关联词、近义辨析等；禁止出四字成语），用于公务员与事业单位言语理解备考。`,
    WORD_MEMORIZATION_FORMAT,
    `本轮题型顺序参考：${typeHints}`,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同，且均非四字成语。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: WORD_MEMORIZATION_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: WordMemorizationQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseWordMemorizationMcqAiObject(item)
    if (!fields) return
    const q = buildWordMemorizationQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeWordMemorizationQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('词语', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道非四字成语词语识记四选一题（禁止出四字成语）。\n${WORD_MEMORIZATION_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: WORD_MEMORIZATION_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseWordMemorizationMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildWordMemorizationQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const VOCAB_RELATED_LEARNING_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解」词语/成语关联学习教练。',
  '根据学员错题中的目标词，输出结构化关联学习材料与学后小测。',
  '只输出合法 JSON 对象，不要 markdown 代码围栏，不要其它说明文字。',
  '内容须准确、简洁，使用简体中文；小测只考词义理解或选词填空，不考典故出处 trivia。',
  '选词填空选项必须是词语/成语词面，禁止释义长句；选词填空不得使用反义词作选项。',
  '学后小测必须轮换考查对象：禁止整套小题都只考目标词；至少一题考查易混词/近义词/其他选项词。',
].join('\n')

/**
 * 重点题 · 成语/词语「关联学习」：一次生成四层学习材料 + 2～3 道学后小测。
 * 小测答错不进错题本（由调用方保证）。
 */
export async function requestVocabRelatedLearningPack(input: {
  kind: VocabRelatedKind
  row: VocabRelatedSourceRow
  onProgress?: (message: string) => void
}): Promise<VocabRelatedLearningPack> {
  const kindLabel = input.kind === 'idiom' ? '成语' : '词语'
  const correct =
    input.row.options[input.row.correctIndex]?.trim() ||
    (input.row.questionType === 'meaning-to-word' ? input.row.term : '')
  const otherOptions = input.row.options
    .map((x, i) => ({ text: String(x ?? '').trim(), index: i }))
    .filter((x) => x.text && x.index !== input.row.correctIndex)
    .map((x) => x.text)

  input.onProgress?.(aiRequestProgressText(`${kindLabel}关联学习`))

  const user = [
    `请为下列公考/事业编言语理解「${kindLabel}识记」错题目标词生成【关联学习包】。`,
    `目标词（term）：${input.row.term}`,
    `原题干：${input.row.stem}`,
    `正确选项：${correct || input.row.term}`,
    `全部选项：${input.row.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(' / ')}`,
    input.row.explanation ? `原解析（可参考）：${input.row.explanation}` : '',
    '',
    '请严格按下列 JSON 结构返回一个对象：',
    '{',
    `  "term": "${input.row.term}",`,
    '  "layer1": {',
    '    "meaning": "当前词准确释义（1～3 句）",',
    '    "example": "含当前词的自然例句（1 句）",',
    '    "sentiment": "褒义|贬义|中性|分情况",',
    '    "sentimentNote": "若为分情况，说明什么语境褒/贬/中；否则空字符串",',
    '    "phonologyNotes": "字音字形需注意点；若无则写空字符串"',
    '  },',
    '  "layer2": {',
    '    "confusables": [',
    '      { "word": "易混词", "meaning": "该词释义", "example": "含该易混词的自然例句", "sentiment": "褒义|贬义|中性|分情况", "sentimentNote": "", "howToDistinguish": "与目标词如何区分" }',
    '    ]',
    '  },',
    '  "layer3": {',
    '    "synonyms": ["近义词1", "近义词2"],',
    '    "antonyms": ["反义词1"],',
    '    "otherOptions": [',
    '      { "text": "原题干扰项原文", "meaning": "该选项释义", "sentiment": "褒义|贬义|中性|分情况", "sentimentNote": "" }',
    '    ]',
    '  },',
    '  "layer4": {',
    '    "quickMem": [',
    '      { "word": "词面", "cue": "简短使用场景/记忆强调点（十来字内）", "examples": ["短例句1", "短例句2"] }',
    '    ]',
    '  },',
    '  "quiz": [',
    '    {',
    '      "questionType": "meaning 或 fill",',
    '      "focusTerm": "本题主要考查的词（目标词或易混/近反义之一）",',
    '      "stem": "题干",',
    '      "correct": "正确选项原文",',
    '      "distractors": ["干扰1", "干扰2", "干扰3"],',
    '      "explanation": "简短解析"',
    '    }',
    '  ]',
    '}',
    '',
    '硬性要求：',
    '1. layer2.confusables 至少 1 条，优先公考高频易混；',
    '2. layer3.otherOptions 须覆盖原题全部干扰项（非正确选项），每项必须有准确释义（meaning），禁止空字段；',
    '3. 所有释义处必须标注 sentiment（褒义/贬义/中性/分情况）；分情况时 sentimentNote 写清语境差异；',
    '4. layer1.example 与每个 confusable.example 必须各给 1 句自然例句，句中须原样出现对应词；',
    '5. 【第四层·快速识记】layer4.quickMem 须覆盖：目标词 + 全部易混词 + otherOptions 里像「词/成语」的 text（选词语题的干扰词）；禁止写入近义词、反义词；若 otherOptions 是释义长句（选释义题）则不必为其单独做 quickMem；',
    '   每条 cue 写使用场景/记忆强调点（简短，如「形势顺利、不可逆推进」），examples 给 1～3 条极短例句（如「北伐军一路北上，势如破竹」），方便速记，勿写长句；',
    '6. quiz 必须 2～3 题；questionType 仅 meaning（词义理解）或 fill（选词填空）；',
    '7. 若 questionType=fill（选词填空）：correct 与 distractors 共 4 个选项必须全部是短词/成语词面，且只能来自「目标词、易混词、近义词、otherOptions 的 text」；禁止反义词入选；禁止白话释义长句（如「差别明显看得出不一样」）；词面不足 4 个时不要出 fill，改出 meaning；',
    '8. 【考查轮换·硬性】2～3 道小测中，至少 1 题的考查对象不是目标词（focusTerm / fill 正确答案须为易混词或近义词或其他选项词）；严禁「第1题考目标词词义 + 第2题选词填空答案仍是目标词」这种固定套路；目标词最多作为其中 1 题的答案；',
    '9. quiz 各题 focusTerm 必须写明本题真正考查的词，且尽量在目标词、易混、近义、其他选项词之间轮换；',
    '10. 小测四选一：correct + distractors 共 4 个互不相同选项；禁止靠选项长短/标点蒙对；fill 四个选项长度应接近（都是词/成语），禁止一个成语配一条长解释；',
    '11. 近/反义词若确实少见可少给，但数组字段必须存在（可为 []）；反义词仅供第三层学习展示，不得进入 fill 选项，也不得进入 layer4；',
    '12. 小测题干禁止写「本题考查××」「考「××」」等剧透；选词填空题干不得提前给出正确答案。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await deepseekChatRaw(user, {
    system: VOCAB_RELATED_LEARNING_SYSTEM,
    temperature: 0.55,
    maxTokens: 6144,
  })

  const parsed = parseAiJsonObjectLenient(stripAiJsonFence(raw))
  let pack = parseVocabRelatedLearningPack(parsed, {
    kind: input.kind,
    term: input.row.term,
    otherOptionTexts: otherOptions,
  })
  if (!pack) {
    throw new Error('关联学习内容解析失败，请稍后重试')
  }
  if (pack.quiz.length < 2) {
    input.onProgress?.(`「${pack.term}」材料已就绪，正在按轮换规则生成小测…`)
    const quiz = await requestVocabRelatedQuizOnly({
      kind: input.kind,
      row: input.row,
      pack,
      onProgress: input.onProgress,
    })
    pack = { ...pack, quiz }
  }
  if (pack.quiz.length < 2) {
    throw new Error('关联学习小测生成失败，请稍后重试')
  }
  return pack
}

/** 仅重出学后小测（学习材料用缓存） */
export async function requestVocabRelatedQuizOnly(input: {
  kind: VocabRelatedKind
  row: VocabRelatedSourceRow
  pack: VocabRelatedLearningPack
  avoidStems?: string[]
  onProgress?: (message: string) => void
}): Promise<VocabRelatedQuizQuestion[]> {
  const kindLabel = input.kind === 'idiom' ? '成语' : '词语'
  input.onProgress?.(aiRequestProgressText(`${kindLabel}关联学习小测`))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(0, 6)
  const fillOptionBank = collectVocabRelatedFillOptionBank(input.pack)
  const antonymBlock = input.pack.antonyms.filter(Boolean)
  const altFocus = fillOptionBank.filter(
    (t) => t.trim() && t.trim() !== input.pack.term.trim(),
  )
  const user = [
    `请根据下列「${kindLabel}」关联学习材料，重新生成 2～3 道学后小测（四选一），只考词义或选词填空。`,
    `目标词：${input.pack.term}`,
    `释义：${input.pack.meaning}（${input.pack.sentiment}${input.pack.sentimentNote ? `；${input.pack.sentimentNote}` : ''}）`,
    input.pack.example ? `例句：${input.pack.example}` : '',
    `易混：${input.pack.confusables.map((c) => `${c.word}（${c.sentiment}${c.example ? `；例：${c.example}` : ''}）`).join('、')}`,
    `近义：${input.pack.synonyms.join('、') || '无'}`,
    `其他选项词：${input.pack.otherOptions.map((o) => o.text).join('、') || '无'}`,
    antonymBlock.length
      ? `反义词（仅学习展示，禁止作为选词填空选项）：${antonymBlock.join('、')}`
      : '',
    `选词填空可用词库（仅可从中选，已排除反义词）：${fillOptionBank.join('、') || '（不足，请只出 meaning 题）'}`,
    altFocus.length
      ? `优先轮换考查这些非目标词（至少 1 题）：${altFocus.join('、')}`
      : '',
    avoid.length ? `请避免与下列旧题干雷同：${avoid.join(' ｜ ')}` : '',
    '',
    '返回 JSON 对象：{"quiz":[...]} 或直接返回 quiz 数组。',
    '每题字段：questionType(meaning|fill)、focusTerm、stem、correct、distractors[3]、explanation。',
    '禁止题干写出「本题考查××」；选项互不相同。',
    '若 questionType=fill：四个选项必须是短词/成语词面，且全部来自「选词填空可用词库」；禁止反义词；禁止白话释义长句；词库不足 4 个时不要出 fill。',
    'meaning 题选项才是释义句子；fill 题选项禁止写成释义。',
    '【考查轮换·硬性】禁止整套都只考目标词；至少 1 题 focusTerm（fill 则以 correct 为准）必须是易混/近义/其他选项词；禁止「先问目标词释义、再填空答案仍是目标词」的套路；目标词最多作为 1 题的答案。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await deepseekChatRaw(user, {
    system: VOCAB_RELATED_LEARNING_SYSTEM,
    temperature: 0.72,
    maxTokens: 2048,
  })
  const parsedObj = parseAiJsonObjectLenient(stripAiJsonFence(raw))
  const parsedArr = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const quiz =
    parseVocabRelatedQuizList(parsedObj, {
      kind: input.kind,
      term: input.pack.term,
      fillOptionBank,
    }) ??
    parseVocabRelatedQuizList(parsedArr, {
      kind: input.kind,
      term: input.pack.term,
      fillOptionBank,
    })
  if (!quiz) throw new Error('小测重新生成失败，请稍后重试')
  return quiz
}

function extractRelatedPacksArray(rawText: string): unknown[] {
  const stripped = stripAiJsonFence(rawText)
  const arr = parseAiJsonArrayLenient(stripped)
  if (arr.length) return arr
  const obj = parseAiJsonObjectLenient(stripped)
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const o = obj as Record<string, unknown>
    const nested = o.packs ?? o.items ?? o.data ?? o.list
    if (Array.isArray(nested)) return nested
  }
  return []
}

function pickRelatedRawPack(
  parsed: unknown[],
  term: string,
  index: number,
): unknown {
  const want = term.trim()
  const byTerm = parsed.find(
    (p) =>
      p &&
      typeof p === 'object' &&
      String((p as Record<string, unknown>).term ?? '')
        .trim() === want,
  )
  return byTerm ?? parsed[index]
}

/**
 * 一组关联学习包优先一次性生成；截断/解析失败的词再单词补生成。
 */
export async function requestVocabRelatedLearningPackBatch(input: {
  kind: VocabRelatedKind
  rows: VocabRelatedSourceRow[]
  onProgress?: (message: string) => void
}): Promise<VocabRelatedLearningPack[]> {
  const rows = input.rows
  if (!rows.length) return []
  if (rows.length === 1) {
    return [
      await requestVocabRelatedLearningPack({
        kind: input.kind,
        row: rows[0]!,
        onProgress: input.onProgress,
      }),
    ]
  }

  const kindLabel = input.kind === 'idiom' ? '成语' : '词语'
  input.onProgress?.(aiRequestProgressText(`${kindLabel}关联学习（本组 ${rows.length} 词）`))

  // 超过 5 词时拆成小批，降低 JSON 截断导致整组解析失败的概率
  if (rows.length > 5) {
    const merged: (VocabRelatedLearningPack | null)[] = rows.map(() => null)
    const failedTerms: string[] = []
    for (let i = 0; i < rows.length; i += 5) {
      const chunk = rows.slice(i, i + 5)
      input.onProgress?.(
        `${kindLabel}关联学习：第 ${i + 1}–${i + chunk.length} / ${rows.length} 词…`,
      )
      try {
        const part = await requestVocabRelatedLearningPackBatch({
          kind: input.kind,
          rows: chunk,
          onProgress: input.onProgress,
        })
        part.forEach((p, j) => {
          merged[i + j] = p
        })
      } catch {
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j]!
          input.onProgress?.(`补生成「${row.term}」（${i + j + 1}/${rows.length}）…`)
          try {
            merged[i + j] = await requestVocabRelatedLearningPack({
              kind: input.kind,
              row,
              onProgress: input.onProgress,
            })
          } catch {
            failedTerms.push(row.term)
          }
        }
      }
    }
    if (failedTerms.length) {
      throw new Error(
        `关联学习仍有 ${failedTerms.length} 词未生成成功：${failedTerms.slice(0, 5).join('、')}${failedTerms.length > 5 ? '…' : ''}。可减少勾选数量后重试。`,
      )
    }
    return merged as VocabRelatedLearningPack[]
  }

  const items = rows
    .map((row, i) => {
      const correct =
        row.options[row.correctIndex]?.trim() ||
        (row.questionType === 'meaning-to-word' ? row.term : '')
      return [
        `【词 ${i + 1}】`,
        `term：${row.term}`,
        `题干：${row.stem}`,
        `正确选项：${correct || row.term}`,
        `全部选项：${row.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(' / ')}`,
        row.explanation ? `原解析：${row.explanation}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')

  const user = [
    `请为下列 ${rows.length} 个「${kindLabel}识记」目标词一次性生成【关联学习包】数组。`,
    '每个元素：layer1（meaning、example、sentiment、sentimentNote、phonologyNotes）、layer2.confusables（≥1，含 meaning/example/sentiment）、layer3（synonyms、antonyms、otherOptions 含 sentiment）、layer4.quickMem（目标词+易混+词面干扰项，不含近反义与释义长句；每条 cue+短例句）、quiz（2 题）。',
    '硬性：otherOptions 必须覆盖全部干扰项且有真实释义；sentiment 取褒义/贬义/中性/分情况，分情况须写 sentimentNote；layer1 与每个易混词都必须有含该词的例句 example；layer4 须给快速识记（cue 强调使用场景，examples 短句速记）；fill 题四个选项必须是短词/成语且仅来自目标/易混/近义/otherOptions，禁止反义词与白话长句；小测至少 1 题考查非目标词，禁止整套只考目标词。',
    '一次返回完整 JSON 数组，长度恰好为输入词数；不要分多轮。',
    '小测题干勿写「本题考查××」剧透。',
    '',
    items,
    '',
    `**仅返回 JSON 数组**，长度恰好 ${rows.length}。`,
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')

  let parsed: unknown[] = []
  try {
    const raw = await deepseekChatRaw(user, {
      system: VOCAB_RELATED_LEARNING_SYSTEM,
      temperature: 0.45,
      maxTokens: 16384,
    })
    parsed = extractRelatedPacksArray(raw)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '批量生成请求失败'
    input.onProgress?.(`${msg}，改为逐词补生成…`)
  }

  const out: (VocabRelatedLearningPack | null)[] = rows.map(() => null)
  const materialsOnly: (VocabRelatedLearningPack | null)[] = rows.map(() => null)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const otherOptions = row.options
      .map((x, idx) => ({ text: String(x ?? '').trim(), index: idx }))
      .filter((x) => x.text && x.index !== row.correctIndex)
      .map((x) => x.text)
    const pack = parseVocabRelatedLearningPack(pickRelatedRawPack(parsed, row.term, i), {
      kind: input.kind,
      term: row.term,
      otherOptionTexts: otherOptions,
    })
    if (!pack) continue
    if (pack.quiz.length >= 2) out[i] = pack
    else materialsOnly[i] = pack
  }

  for (let i = 0; i < rows.length; i++) {
    if (out[i]) continue
    const row = rows[i]!
    const base = materialsOnly[i]
    if (base) {
      input.onProgress?.(`「${row.term}」按轮换规则补生成小测（${i + 1}/${rows.length}）…`)
      try {
        const quiz = await requestVocabRelatedQuizOnly({
          kind: input.kind,
          row,
          pack: base,
          onProgress: input.onProgress,
        })
        if (quiz.length >= 2) {
          out[i] = { ...base, quiz }
          continue
        }
      } catch {
        /* fall through to full regen */
      }
    }
    // 整包补生成：最多 2 次，降低偶发 JSON/截断失败
    let lastErr: unknown = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      input.onProgress?.(
        `补生成「${row.term}」（${i + 1}/${rows.length}，第 ${attempt} 次）…`,
      )
      try {
        out[i] = await requestVocabRelatedLearningPack({
          kind: input.kind,
          row,
          onProgress: input.onProgress,
        })
        lastErr = null
        break
      } catch (e) {
        lastErr = e
      }
    }
    if (!out[i] && lastErr) {
      console.warn('[vocab-related] 补生成失败', row.term, lastErr)
    }
  }

  const failed = rows.filter((_, i) => !out[i]).map((r) => r.term)
  if (failed.length) {
    throw new Error(
      `关联学习仍有 ${failed.length} 词未生成成功：${failed.slice(0, 5).join('、')}${failed.length > 5 ? '…' : ''}。可减少勾选数量后重试，或先清除该词缓存。`,
    )
  }
  return out as VocabRelatedLearningPack[]
}

const CHAR_LITERACY_RELATED_LEARNING_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·字音字形」关联学习教练。',
  '根据学员错题中的目标词，输出结构化关联学习材料与学后小测。',
  '只输出合法 JSON 对象，不要 markdown 代码围栏，不要其它说明文字。',
  '内容须准确、简洁，使用简体中文；小测只考字音或字形，不考词义 trivia。',
].join('\n')

/**
 * 重点题 · 字音字形「关联学习」：三层材料 + 2～3 道学后小测（不计错题本）。
 */
export async function requestCharLiteracyRelatedLearningPack(input: {
  row: CharLiteracyRelatedSourceRow
  onProgress?: (message: string) => void
}): Promise<CharLiteracyRelatedLearningPack> {
  const qType =
    input.row.questionType === 'typo' || String(input.row.questionType).includes('错')
      ? 'typo'
      : 'pronunciation'
  const typeLabel = qType === 'typo' ? '错别字/字形' : '读音辨析'
  const correct = input.row.options[input.row.correctIndex]?.trim() || input.row.term
  const otherOptions = input.row.options
    .map((x, i) => ({ text: String(x ?? '').trim(), index: i }))
    .filter((x) => x.text && x.index !== input.row.correctIndex)
    .map((x) => x.text)

  input.onProgress?.(aiRequestProgressText('字音字形关联学习'))

  const user = [
    `请为下列公考/事业编「字音字形」错题目标词生成【关联学习包】（原题型侧重：${typeLabel}）。`,
    `目标词（term）：${input.row.term}`,
    `原题干：${input.row.stem}`,
    `正确选项：${correct}`,
    `全部选项：${input.row.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(' / ')}`,
    input.row.explanation ? `原解析（可参考）：${input.row.explanation}` : '',
    '',
    '请严格按下列 JSON 结构返回一个对象：',
    '{',
    `  "term": "${input.row.term}",`,
    `  "questionType": "${qType}",`,
    '  "layer1": {',
    '    "meaning": "当前词准确释义（1～2 句）",',
    '    "phonologyOrForm": "当前词正确字音与/或规范字形要点（必填，可含拼音注音）"',
    '  },',
    '  "layer2": {',
    '    "confusables": [',
    '      {',
    '        "word": "易混词",',
    '        "correctFormOrReading": "该词正确读音或规范写法",',
    '        "howToDistinguish": "与目标词在字音/字形上如何区分"',
    '      }',
    '    ]',
    '  },',
    '  "layer3": {',
    '    "otherOptions": [',
    '      {',
    '        "text": "原题干扰项原文",',
    '        "correctFormOrReading": "该选项对应的正确字音或规范字形",',
    '        "confusionPoint": "易混点说明"',
    '      }',
    '    ]',
    '  },',
    '  "quiz": [',
    '    {',
    '      "questionType": "pronunciation 或 typo",',
    '      "focusTerm": "本题主要考查的词",',
    '      "stem": "题干（只考字音或字形）",',
    '      "correct": "正确选项原文",',
    '      "distractors": ["干扰1", "干扰2", "干扰3"],',
    '      "explanation": "简短解析"',
    '    }',
    '  ]',
    '}',
    '',
    '硬性要求：',
    '1. layer1.phonologyOrForm 必填；',
    '2. layer2.confusables 至少 1 条，必须针对字音或字形易混（不是词义近反义）；',
    '3. layer3.otherOptions 须覆盖原题全部干扰项，写明正确字音/字形与易混点；',
    '4. quiz 必须 2～3 题；questionType 仅 pronunciation 或 typo；禁止考纯词义；',
    '5. quiz 各题 focusTerm 尽量轮换（目标词、易混词等）；',
    '6. 小测四选一：correct + distractors 共 4 个互不相同；选项勿带「（误）」等露馅标记；',
    '7. 读音题选项宜带拼音注音；错别字题选项为词语写法辨析。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await deepseekChatRaw(user, {
    system: CHAR_LITERACY_RELATED_LEARNING_SYSTEM,
    temperature: 0.55,
    maxTokens: 4096,
  })

  const parsed = parseAiJsonObjectLenient(stripAiJsonFence(raw))
  const pack = parseCharLiteracyRelatedLearningPack(parsed, {
    term: input.row.term,
    questionType: qType,
    otherOptionTexts: otherOptions,
  })
  if (!pack) {
    throw new Error('字音字形关联学习内容解析失败，请稍后重试')
  }
  return pack
}

/** 仅重出学后小测（学习材料用缓存） */
export async function requestCharLiteracyRelatedQuizOnly(input: {
  row: CharLiteracyRelatedSourceRow
  pack: CharLiteracyRelatedLearningPack
  avoidStems?: string[]
  onProgress?: (message: string) => void
}): Promise<CharLiteracyRelatedQuizQuestion[]> {
  input.onProgress?.(aiRequestProgressText('字音字形关联学习小测'))
  const avoid = (input.avoidStems ?? []).filter(Boolean).slice(0, 6)
  const qType = String(input.pack.questionType || input.row.questionType || 'pronunciation')
  const user = [
    '请根据下列「字音字形」关联学习材料，重新生成 2～3 道学后小测（四选一），只考字音或字形，禁止纯词义题。',
    `目标词：${input.pack.term}`,
    `题型倾向：${qType}`,
    `词义参考：${input.pack.meaning}`,
    `字音字形要点：${input.pack.phonologyOrForm}`,
    `易混：${input.pack.confusables.map((c) => `${c.word}（${c.correctFormOrReading}）`).join('、')}`,
    avoid.length ? `请避免与下列旧题干雷同：${avoid.join(' ｜ ')}` : '',
    '',
    '返回 JSON 对象：{"quiz":[...]} 或直接返回 quiz 数组。',
    '每题字段：questionType(pronunciation|typo)、focusTerm、stem、correct、distractors[3]、explanation。',
    '禁止题干写出「本题考查××」；选项互不相同；读音题宜带拼音；错别字题为写法辨析。',
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await deepseekChatRaw(user, {
    system: CHAR_LITERACY_RELATED_LEARNING_SYSTEM,
    temperature: 0.72,
    maxTokens: 2048,
  })
  const parsedObj = parseAiJsonObjectLenient(stripAiJsonFence(raw))
  const parsedArr = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const quiz =
    parseCharLiteracyRelatedQuizList(parsedObj, {
      term: input.pack.term,
      questionType: qType,
    }) ??
    parseCharLiteracyRelatedQuizList(parsedArr, {
      term: input.pack.term,
      questionType: qType,
    })
  if (!quiz) throw new Error('小测重新生成失败，请稍后重试')
  return quiz
}

/** 字音字形关联学习：优先整组一次生成，失败词再补生成 */
export async function requestCharLiteracyRelatedLearningPackBatch(input: {
  rows: CharLiteracyRelatedSourceRow[]
  onProgress?: (message: string) => void
}): Promise<CharLiteracyRelatedLearningPack[]> {
  const rows = input.rows
  if (!rows.length) return []
  if (rows.length === 1) {
    return [
      await requestCharLiteracyRelatedLearningPack({
        row: rows[0]!,
        onProgress: input.onProgress,
      }),
    ]
  }

  input.onProgress?.(aiRequestProgressText(`字音字形关联学习（本组 ${rows.length} 词）`))

  const items = rows
    .map((row, i) => {
      const qType =
        row.questionType === 'typo' || String(row.questionType).includes('错')
          ? 'typo'
          : 'pronunciation'
      const correct = row.options[row.correctIndex]?.trim() || row.term
      return [
        `【词 ${i + 1}】`,
        `term：${row.term}`,
        `questionType：${qType}`,
        `题干：${row.stem}`,
        `正确选项：${correct}`,
        `全部选项：${row.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(' / ')}`,
        row.explanation ? `原解析：${row.explanation}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')

  const user = [
    `请为下列 ${rows.length} 个「字音字形」目标词一次性生成【关联学习包】数组。`,
    '每个元素：layer1（meaning、phonologyOrForm）、layer2.confusables（≥1）、layer3.otherOptions、quiz（2 题，pronunciation/typo）。',
    '硬性：otherOptions 必须覆盖全部干扰项，写明正确字音/字形与易混点，禁止空字段。',
    '一次返回完整 JSON 数组，长度恰好为输入词数；不要分多轮。',
    '小测题干勿写「本题考查××」剧透。',
    '',
    items,
    '',
    `**仅返回 JSON 数组**，长度恰好 ${rows.length}。`,
    '',
    CHINESE_MCQ_CORRECTNESS_RULES,
  ].join('\n')

  let parsed: unknown[] = []
  try {
    const raw = await deepseekChatRaw(user, {
      system: CHAR_LITERACY_RELATED_LEARNING_SYSTEM,
      temperature: 0.45,
      maxTokens: 16384,
    })
    parsed = extractRelatedPacksArray(raw)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '批量生成请求失败'
    input.onProgress?.(`${msg}，改为逐词补生成…`)
  }

  const out: (CharLiteracyRelatedLearningPack | null)[] = rows.map(() => null)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const qType =
      row.questionType === 'typo' || String(row.questionType).includes('错')
        ? 'typo'
        : 'pronunciation'
    const otherOptions = row.options
      .map((x, idx) => ({ text: String(x ?? '').trim(), index: idx }))
      .filter((x) => x.text && x.index !== row.correctIndex)
      .map((x) => x.text)
    const pack = parseCharLiteracyRelatedLearningPack(
      pickRelatedRawPack(parsed, row.term, i),
      {
        term: row.term,
        questionType: qType,
        otherOptionTexts: otherOptions,
      },
    )
    if (pack) out[i] = pack
  }

  for (let i = 0; i < rows.length; i++) {
    if (out[i]) continue
    const row = rows[i]!
    input.onProgress?.(`补生成「${row.term}」（${i + 1}/${rows.length}）…`)
    try {
      out[i] = await requestCharLiteracyRelatedLearningPack({
        row,
        onProgress: input.onProgress,
      })
    } catch {
      /* keep null */
    }
  }

  const failed = rows.filter((_, i) => !out[i]).map((r) => r.term)
  if (failed.length) {
    throw new Error(
      `字音字形关联学习仍有 ${failed.length} 词未生成成功：${failed.slice(0, 5).join('、')}${failed.length > 5 ? '…' : ''}，请稍后重试`,
    )
  }
  return out as CharLiteracyRelatedLearningPack[]
}

const CLASSICAL_CHINESE_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·文言文」命题专家，熟悉文言实词虚词、古今异义、通假字、文言句式、一词多义等公考/事业编高频考点。',
  '难度适中，贴近真题识记与辨析风格；不要出过长文言翻译压轴题。',
  '硬性：题干所引文言必须是原文中连续完整的语句；严禁把不同段落、不相邻的句子用省略号拼接出题。',
  '硬性：引文须带足语境，禁止只截三四个字的碎片（如仅「信而见疑」）；至少用对句/整句，使没读过原文的人也能大致看懂。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const CLASSICAL_CHINESE_FORMAT = `
【题型】questionType 固定为 general

【命题要求】
- 聚焦：文言实词虚词、古今异义、通假字、文言句式、一词多义
- 优先公考、事业编常考字词与句式，难度适中
- term 填短知识点标签，如「之」「以为」「通假字·女」「宾语前置」「被动句·见」
- stem 写完整问句；若引用课文/名篇例句，**必须截取原文连续完整语句**（可含标点的整句或紧邻数句），**禁止**拆分、拼接不同位置的句子，**禁止**「前半句……后半句」跨段硬拼
- **引文长度与语境（硬性）**：
  - 禁止过短碎片。反例：只写「信而见疑」——没读原文很难懂。
  - 正例：至少写成「信而见疑，忠而被谤」；更好如「臣诚恐见欺于王而负赵」（一眼能感到被动与担忧）。
  - 引文汉字一般不少于约 8～10 字，或含「，」等句读的对句/整句；考点词可加点，但上下文必须够读。
- 反例（严禁）：把《愚公移山》「以君之力……且焉置土石？」与后文「以为神」拼进同一题干
- 正例：考「以为」时只引连续原句「操蛇之神闻之，惧其不已也，告之于帝。帝感其诚，命夸娥氏二子负二山，一厝朔东，一厝雍南，众人以为神。」
- 选项互斥；干扰项为易混义项或相近句式
- explanation 用完整通顺的简体中文说明；考「以为」等古今异义时须点明古义/今义差别（如「以为」为「以（之）为」，古义把……当作，今义认为）

【JSON 示例】
{"questionType":"general","term":"被动句·见","stem":"下列句中「见」表被动的一项所在语境是？「信而见疑，忠而被谤」","correct":"被","distractors":["看见","出现","会见"],"explanation":"「见疑」即被怀疑；与「被谤」对举，是被动用法。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeClassicalChineseQuestions(
  items: ClassicalChineseQuestion[],
  blockedTerms?: Set<string>,
): ClassicalChineseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ClassicalChineseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestClassicalChineseMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ClassicalChineseQuestion[]> {
  const count = input.count ?? CLASSICAL_CHINESE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('文言文题目'))

  const historyHint = buildAvoidTermsHint('文言知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「文言文」四选一练习题（文言实词虚词、古今异义、通假字、文言句式、一词多义，**难度适中、高频考点**）。`,
    CLASSICAL_CHINESE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: CLASSICAL_CHINESE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: ClassicalChineseQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseClassicalChineseMcqAiObject(item)
    if (!fields) return
    const q = buildClassicalChineseQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeClassicalChineseQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('文言知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道文言文四选一题（实词虚词/古今异义/通假字/句式/一词多义等高频点）。题干引文必须是原文连续完整语句，禁止跨段拼接；引文须带足语境（勿只截「信而见疑」这类过短碎片，宜用「信而见疑，忠而被谤」或更完整句）。\n${CLASSICAL_CHINESE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: CLASSICAL_CHINESE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseClassicalChineseMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildClassicalChineseQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const RHETORIC_USAGE_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·修辞辨识与表达效果」命题专家，熟悉比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等公考高频修辞。',
  '可考「这句话用了什么修辞」或修辞表达效果辨析；难度适中。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

const RHETORIC_USAGE_FORMAT = `
【题型】questionType 固定为 general

【命题要求】
- 聚焦修辞辨识与表达效果：比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等
- 也可出效果辨析（如增强气势、生动形象、突出强调等）
- 优先公考、事业编言语理解高频考点
- term 填短知识点标签（如「比喻」「排比·效果」「借代」）
- stem 可含短句例句并设问；选项互斥；干扰项为易混修辞或相近效果表述
- explanation 用 1～2 句简体中文说明

【JSON 示例】
{"questionType":"general","term":"比喻","stem":"「人生如逆旅，我亦是行人」主要运用的修辞是？","correct":"比喻","distractors":["夸张","借代","拟人"],"explanation":"……"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES

function dedupeRhetoricUsageQuestions(
  items: RhetoricUsageQuestion[],
  blockedTerms?: Set<string>,
): RhetoricUsageQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: RhetoricUsageQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestRhetoricUsageMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<RhetoricUsageQuestion[]> {
  const count = input.count ?? RHETORIC_USAGE_QUESTION_COUNT
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText('修辞运用题目'))

  const historyHint = buildAvoidTermsHint('修辞知识点', [...blocked])
  const user = [
    `请生成 **${count} 道** 事业编/公考「修辞辨识与表达效果」四选一练习题（比喻、比拟、借代、夸张、对偶、排比、设问、反问、反复等，**公考高频**）。`,
    RHETORIC_USAGE_FORMAT,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: RHETORIC_USAGE_SYSTEM,
    temperature: 0.72,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: RhetoricUsageQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseRhetoricUsageMcqAiObject(item)
    if (!fields) return
    const q = buildRhetoricUsageQuestionFromMcq({ ...fields, seq: idx + 1 })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeRhetoricUsageQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('修辞知识点', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        `请生成第 ${slot} 道修辞辨识/表达效果四选一题（公考高频修辞）。\n${RHETORIC_USAGE_FORMAT}${avoidHint}\n仅返回一个 JSON 对象。`,
        { system: RHETORIC_USAGE_SYSTEM, temperature: 0.7, maxTokens: 900 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseRhetoricUsageMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildRhetoricUsageQuestionFromMcq({ ...fields, seq: slot })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }
  return deduped.slice(0, count)
}

const READING_COMPREHENSION_SYSTEM = [
  '你是公务员考试与事业单位考试「言语理解·阅读理解」命题专家，熟悉主旨观点、细节判断、词句理解、推断下文、标题添加等高频题型。',
  '命题必须对标国考/联考真题难度：正确项不可一眼可辨，干扰项须「真假参半」、有迷惑力。',
  '选项表面必须齐整：禁止正确项独最长（多1字也不行），标点风格一致；禁止正确项标点独多或独含逗号/顿号。',
  '干扰项禁止用「只需/唯一/全部」等绝对化词语做成一眼可排除的低级错项；正确项若含绝对表述，必须能被材料原文明确支撑。',
  '解析必须结构化：explanationFocus + explanationCorrect + explanationDistractors[3]（与 distractors 同序）；禁止用 A/B/C 指代选项；语句完整，禁止残缺断句。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
].join('\n')

function readingAbsoluteCorrectBatchRule(mode: ChineseReadingQuestionType): string {
  if (!readingModeNeedsAbsoluteCorrectSlot(mode)) {
    return [
      '【标题添加·绝对化】标题宜克制，勿用「必须/绝对/完全」等口号式绝对词硬凑正确项；本批不强制绝对性正确项。',
    ].join('\n')
  }
  return [
    '【绝对性正确项·硬性·除标题添加外每批至少 1 题】',
    '1. 本批题目中**至少有 1 道**的 correct（正确选项）必须包含以下绝对性词语之一：必须、务必、绝对、完全、一定、一律、全部、始终、绝不能、绝不、必不可少、不可或缺。',
    '2. **对照命题（最重要）**：材料 passage 中必须原样出现与正确项相同的绝对词（或同句明确写出该绝对要求），keySentence 须摘录支撑该绝对判断的原文连续子串；禁止材料语气柔和、正确项却擅自升格为「必须/绝对」等。',
    '3. 正确项是对该绝对表述的准确概括或同义转述，不得歪曲材料；干扰项仍半真半假，**不要**把「绝对词」当廉价错项（忌干扰项独用极端词却一眼假）。',
    '4. 其余题目可不用绝对词；仅保证本批至少 1 道满足上述对照。',
  ].join('\n')
}

function readingComprehensionModeGuidance(mode: ChineseReadingQuestionType): string {
  switch (mode) {
    case 'main-idea':
      return [
        '【本题型专属】考主旨/意图/观点：问这段文字主要说明什么、意在强调什么、核心观点是？',
        '正确项：全面准确概括文意重点（可含侧重+统筹），语气克制，避免堆砌材料原句。',
        '干扰项优先：①以偏概全（只抓次要信息当主旨）；②程度/侧重偷换（把「重点」改成「更重要/取代」）；③范围扩大或缩小；④对策类偷换（文中未说的方案）。四类都应读来「像那么回事」。',
        '若本批指定某题作「绝对性正确项」：材料须明确写「必须/绝对/完全…」，正确项忠实概括该绝对要求，勿另造材料未说的绝对结论。',
      ].join('\n')
    case 'detail':
      return [
        '【本题型专属】考细节判断：哪项正确/错误或能从文中推出。',
        '干扰项优先：偷换概念、无中生有但表述像材料语气、混淆充分/必要、张冠李戴。',
        '若本批指定某题作「绝对性正确项」：宜出「下列说法正确的是」，正确项复述材料中的必须/绝对/完全等要求；干扰项可把绝对范围偷换或弱化，但勿做成小学生级假句。',
      ].join('\n')
    case 'word-sentence':
      return [
        '【本题型专属】考词句理解：stem 标出需理解的词句。',
        '干扰项优先：字面义、超语境引申、邻句意思串位；正确项结合语境，勿比其它项明显更「正确腔」。',
        '若本批指定某题作「绝对性正确项」：所考词句或正确释义须落实材料中的绝对语气（如「完全」「必须」），正确项不得脱离该语境另加绝对词。',
      ].join('\n')
    case 'infer-next':
      return [
        '【本题型专属】考推断下文：下文最可能写什么。',
        '干扰项优先：上文已写完的内容、无关新话题、跳跃过大但措辞正式的续写；正确项紧扣末句衔接。',
        '若本批指定某题作「绝对性正确项」：末句或上文须出现必须/绝对/完全等，正确续写项须承接该绝对要求（如将写如何落实「必须…」），且 absolute 词可出现在正确项中并与上文一致。',
      ].join('\n')
    case 'title':
      return [
        '【本题型专属】考标题添加。',
        '干扰项优先：过宽、过窄、只抓细节、标题党式夸张；四标题字数接近，勿靠长短泄题。',
      ].join('\n')
  }
}

function readingComprehensionFormat(mode: ChineseReadingQuestionType): string {
  const label = readingComprehensionQuestionTypeLabel(mode)
  return `
【题型】questionType **固定**为 \`${mode}\`（${label}），本批每题都必须是该题型，不得混用其它题型。

${readingComprehensionModeGuidance(mode)}

${readingAbsoluteCorrectBatchRule(mode)}

【干扰项质量·必须遵守】
1. **字数与标点齐整（硬性·系统会拒收）**：
   - **禁止正确项独最长**（哪怕只多 1 字也不行）；须有干扰项同长或更长。
   - 标点风格须一致：禁止正确项标点独多，禁止只有正确项带逗号/顿号/分号。
   - 禁止「正确项最完整、干扰项残缺短句」的反差；宁可四项都稍短或都稍长。
2. **半真半假**：每个错项都要包含材料中出现过的关键词或半对信息，再在「侧重、范围、程度、逻辑关系」上出错；读起来像合理概括，细辨才错。
3. **绝对词用法**：
   - 干扰项不要用「只需」「仅仅」「唯一」等极端词做成一眼假的低级错项。
   - 正确项若含「必须/绝对/完全」等，材料必须先有对应绝对表述，正确项与材料对照成立。
4. **禁止形式泄题**：不要让正确项独用「统筹/既要又要/重点是…同时…」这类最周全句式，而错项全是片面短句。四个选项句式风格应同类。
5. **自检**：数四项字数与逗号——若「选最长」或「选标点最多」能稳中正确项，必须改到分不出。

【命题要求】
- 每题必须有 passage：短材料约 150～350 字，公考风格议论文/说明文片段，信息有轻重主次（便于出半真干扰）
- term：短主题标签（如「基层治理」「科技创新」）
- stem：针对材料的设问；correct + distractors[3]，共 4 个互斥选项
- 材料与设问须匹配题型 ${label}（${mode}）

【解析字段·硬性·禁止混乱】
系统会打乱选项顺序，界面显示为「选项1～4」。你**不要**在解析里写 A/B/C 或「干扰项A」。必须输出结构化字段，由系统按最终题面序号拼接：
- explanationFocus：主旨/解题依据在文中的位置（完整短句，如「文末结论句强调通过制度创新推动内部一体化」）
- explanationCorrect：正确项为何正确（完整短句，不要写「选项几」，不要残缺）；若正确项含绝对词，须点明材料何处支撑该绝对判断
- explanationDistractors：字符串数组，长度必须为 3，且与 distractors 数组**一一对应**（第 i 条解释第 i 个干扰项为何错）
- keySentence：**硬性**。从 passage **原样摘录**支撑正确选项的一句或连续短句（须为材料连续子串；勿改写、勿加省略号、勿拼接不相邻句）。界面据此高亮关键句。含绝对词的正确项，keySentence 须覆盖材料中的绝对表述。
- 可选再给 explanation 作备份长文，但仍禁止使用 A/B/C；语句须完整收尾（以句号结束），禁止半截话如「且字数比…」

【JSON 示例】（实际内容勿照抄；keySentence 必须能在 passage 中原样找到；explanationDistractors 与 distractors 同序）
{"questionType":"${mode}","term":"乡村振兴","passage":"……产业振兴是乡村振兴的重点任务。","stem":"这段文字旨在强调：","correct":"产业振兴是乡村振兴的重点任务","distractors":["完善乡村基础设施应作为当前首要着力点","吸引人才回流即可自然带动乡村产业全面升级","组织建设应重新排定产业与人才工作次序"],"keySentence":"产业振兴是乡村振兴的重点任务。","explanationFocus":"文末收束句点明产业振兴是乡村振兴的重点","explanationCorrect":"准确概括文意重点，与结尾结论一致","explanationDistractors":["把基础设施写成首要着力点，主次颠倒","夸大人才回流作用，属于过度推断","把组织建设抬到统领一切，偏离文意重心"],"explanation":"主旨在文末。正确项概括产业振兴重点；三个干扰项分别主次颠倒、过度推断、重心偏移。"}
`.trim() + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES
}

function dedupeReadingComprehensionQuestions(
  items: ReadingComprehensionQuestion[],
  blockedTerms?: Set<string>,
): ReadingComprehensionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ReadingComprehensionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestReadingComprehensionMcqs(input: {
  count?: number
  mode: ChineseReadingQuestionType
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ReadingComprehensionQuestion[]> {
  const count = input.count ?? READING_COMPREHENSION_QUESTION_COUNT
  const mode = input.mode
  const modeLabel = readingComprehensionQuestionTypeLabel(mode)
  const format = readingComprehensionFormat(mode)
  const needAbsoluteSlot = readingModeNeedsAbsoluteCorrectSlot(mode)
  const blocked = new Set((input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean))
  input.onProgress?.(aiRequestProgressText(`阅读理解（${modeLabel}）题目`))

  const historyHint = buildAvoidTermsHint('阅读材料主题', [...blocked])
  const absoluteBatchHint = needAbsoluteSlot
    ? `**批次硬性**：除标题添加外，本批 ${count} 题中**至少 1 道**的 correct 须含「必须/绝对/完全/一定」等绝对词，且 passage/keySentence 原文须出现同一绝对词，正确项与材料对照成立；禁止材料无绝对语气却硬加绝对正确项。`
    : ''
  const user = [
    `请生成 **${count} 道** 事业编/公考「言语理解·阅读理解」四选一练习题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
    format,
    historyHint,
    `本批 ${count} 道的 term 必须互不相同；每题须含独立 passage。`,
    absoluteBatchHint,
    `**务必做到**：选项字数/标点齐整（禁止正确项独最长或独含逗号）；干扰半真半假；解析必须含 explanationFocus、explanationCorrect、explanationDistractors[3]（与 distractors 同序），以及 keySentence（passage 原句子串）；禁止 A/B/C，语句完整。`,
    `**仅返回 JSON 数组**，长度恰好 ${count}，每项为单题对象。`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: READING_COMPREHENSION_SYSTEM,
    temperature: 0.62,
    maxTokens: 8192,
  })

  const parsed = parseAiJsonArrayLenient(stripAiJsonFence(raw))
  const questions: ReadingComprehensionQuestion[] = []
  parsed.forEach((item, idx) => {
    const fields = parseReadingComprehensionMcqAiObject(item)
    if (!fields) return
    const q = buildReadingComprehensionQuestionFromMcq({
      ...fields,
      questionType: mode,
      seq: idx + 1,
    })
    if (q && isPlayableFourChoiceMcq(q)) questions.push(q)
  })

  const deduped = dedupeReadingComprehensionQuestions(questions, blocked)
  input.onProgress?.(`已解析 ${deduped.length}/${count} 题（已拒收字数极端失衡等不合格项）…`)

  const avoidTerms = [...blocked, ...deduped.map((q) => normalizeAvoidTerm(q.term))]
  for (let slot = deduped.length + 1; deduped.length < count && slot <= count + 24; slot++) {
    input.onProgress?.(`补生成第 ${deduped.length + 1}/${count} 题…`)
    const avoidHint = buildAvoidTermsHint('阅读材料主题', avoidTerms)
    try {
      const oneRaw = await deepseekChatRaw(
        [
          `请生成第 ${slot} 道阅读理解四选一题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
          `字数/标点必须齐整，禁止正确项独最长。干扰半真半假。`,
          `解析硬性：explanationFocus、explanationCorrect、explanationDistractors[3]（与 distractors 一一对应）；禁止 A/B/C；语句完整收尾。`,
          needAbsoluteSlot && !deduped.some(readingQuestionHasGroundedAbsoluteCorrect)
            ? `本题**必须**作为批次中的「绝对性正确项」：correct 含必须/绝对/完全等，passage 原文须出现同一绝对词，keySentence 覆盖该绝对表述。`
            : `干扰项禁止「只需/唯一」类一眼假的低级错项。`,
          format,
          avoidHint,
          `仅返回一个 JSON 对象。`,
        ]
          .filter(Boolean)
          .join('\n'),
        { system: READING_COMPREHENSION_SYSTEM, temperature: 0.65, maxTokens: 1600 },
      )
      const oneObj = parseAiJsonObjectLenient(oneRaw)
      const fields = parseReadingComprehensionMcqAiObject(oneObj)
      if (!fields) continue
      const q = buildReadingComprehensionQuestionFromMcq({
        ...fields,
        questionType: mode,
        seq: slot,
      })
      if (!q || !isPlayableFourChoiceMcq(q)) continue
      const termKey = normalizeAvoidTerm(q.term)
      if (
        deduped.some((x) => x.fingerprint === q.fingerprint) ||
        (termKey && avoidTerms.includes(termKey))
      ) {
        continue
      }
      deduped.push(q)
      if (termKey) avoidTerms.push(termKey)
    } catch {
      /* skip */
    }
  }

  if (deduped.length < count) {
    throw new Error(`仅成功生成 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`)
  }

  // 非标题添加：强制保证至少 1 道「材料对照成立」的绝对性正确项
  if (needAbsoluteSlot && !deduped.some(readingQuestionHasGroundedAbsoluteCorrect)) {
    input.onProgress?.('补生成「绝对性正确项」对照题…')
    let injected = false
    for (let attempt = 0; attempt < 6 && !injected; attempt++) {
      try {
        const oneRaw = await deepseekChatRaw(
          [
            `请生成 1 道阅读理解四选一题，题型固定为 **${modeLabel}**（questionType=\`${mode}\`）。`,
            `【本题专属硬性】这是批次中唯一的「绝对性正确项」题：`,
            `- correct 必须含「必须 / 绝对 / 完全 / 一定 / 务必 / 一律」等绝对词之一；`,
            `- passage 原文必须出现与 correct 相同的绝对词（同句写出该绝对要求）；`,
            `- keySentence 必须原样摘录含该绝对词的材料连续子串；`,
            `- explanationCorrect 须点明材料何处支撑该绝对判断；`,
            `- 禁止材料语气柔和却把正确项擅自升格为绝对结论。`,
            `字数/标点齐整；干扰半真半假，勿用绝对词做一眼假错项。`,
            format,
            buildAvoidTermsHint('阅读材料主题', avoidTerms),
            `仅返回一个 JSON 对象。`,
          ].join('\n'),
          { system: READING_COMPREHENSION_SYSTEM, temperature: 0.55, maxTokens: 1800 },
        )
        const oneObj = parseAiJsonObjectLenient(oneRaw)
        const fields = parseReadingComprehensionMcqAiObject(oneObj)
        if (!fields) continue
        const q = buildReadingComprehensionQuestionFromMcq({
          ...fields,
          questionType: mode,
          seq: count,
        })
        if (!q || !isPlayableFourChoiceMcq(q)) continue
        if (!readingQuestionHasGroundedAbsoluteCorrect(q)) continue
        const termKey = normalizeAvoidTerm(q.term)
        if (
          deduped.some((x) => x.fingerprint === q.fingerprint) ||
          (termKey && avoidTerms.includes(termKey))
        ) {
          continue
        }
        // 替换最后一题，保证总数不变且至少一题达标
        deduped[deduped.length - 1] = q
        injected = true
      } catch {
        /* retry */
      }
    }
    if (!injected) {
      throw new Error(
        '本批未能生成「正确项含绝对表述且材料对照成立」的题目，请重试生成（标题添加除外）',
      )
    }
  }

  return deduped.slice(0, count)
}

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

/** 几何问题：强制豆包；图形由本地种子锚定（SVG 渲染） */
const GEOMETRY_FORCE_PROVIDER: AiProvider = 'doubao'

const GEOMETRY_SYSTEM = `
你是公务员/事业编「数量关系·几何问题」命题专家。
图形数据、正确答案与解析步骤已由系统锚定：你只改写材料与题干表述，不得改动数字、答案与计算步骤。
只输出合法 JSON 对象，不要 markdown 围栏。
${CHINESE_MCQ_CORRECTNESS_RULES}
`.trim()

async function requestAnchoredGeometryMcq(input: {
  seed: GeometrySeed
  difficulty: GeometryDifficulty
  seq: number
  timeoutMs?: number
}): Promise<GeometryQuestion | null> {
  const { seed, difficulty, seq } = input
  const timeoutMs = input.timeoutMs ?? 16_000
  const diffHint =
    difficulty === 'easy'
      ? '简单：直接套公式，表述清楚即可。'
      : difficulty === 'medium'
        ? '中等：对齐教材经典真题难度（割补/长方体变正方体等）。'
        : '困难：高于教材经典题，强调多步或组合，但数字与答案仍必须与锚定一致。'
  try {
    const raw = await Promise.race([
      deepseekChatRaw(
        [
          `请为下列【已锚定几何题】改写材料与题干（四选一）。解析步骤已锚定，不要删减计算说明。`,
          diffHint,
          `【锚定】formula=${seed.formulaId}；正确答案必须是「${seed.correct}」；干扰项可用原 distractors 或等价改写但数值集合不变。`,
          seed.anchorHint,
          `原题材料：${seed.passage}`,
          `原题干：${seed.stem}`,
          `请输出 JSON：{ "term","passage","stem","correct","distractors":[3],"method","explanation" }`,
          `correct 必须等于 ${JSON.stringify(seed.correct)}；distractors 必须是三个与 correct 不同的选项文本。`,
          `method、explanation 请尽量沿用或扩写下列内容，不得比原文更简略：`,
          `做法：${seed.method}`,
          `解析：${seed.explanation}`,
        ].join('\n'),
        {
          system: GEOMETRY_SYSTEM,
          temperature: 0.35,
          maxTokens: 1600,
          provider: GEOMETRY_FORCE_PROVIDER,
        },
      ),
      new Promise<string>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
      }),
    ])
    const obj = parseAiJsonObjectLenient(stripAiJsonFence(raw))
    if (!obj || typeof obj !== 'object') return null
    const o = obj as Record<string, unknown>
    const passage = String(o.passage ?? seed.passage)
    const stem = String(o.stem ?? seed.stem)
    const term = String(o.term ?? seed.term)
    const aiMethod = String(o.method ?? '').trim()
    const aiExplain = String(o.explanation ?? '').trim()
    // 解析若被写短，回退本地详解
    const method =
      aiMethod.length >= Math.min(12, seed.method.length) ? aiMethod : seed.method
    const explanation =
      aiExplain.replace(/\s/g, '').length >=
      Math.floor(seed.explanation.replace(/\s/g, '').length * 0.7)
        ? aiExplain
        : seed.explanation
    return buildGeometryQuestionFromSeed(seed, difficulty, seq, {
      passage,
      stem,
      method,
      explanation,
      term,
    })
  } catch {
    return null
  }
}

export async function requestGeometryMcqs(input: {
  count?: number
  difficulty: GeometryDifficulty
  avoidTerms?: string[]
  onProgress?: (msg: string) => void
}): Promise<GeometryQuestion[]> {
  void input.avoidTerms
  const count = input.count ?? GEOMETRY_QUESTION_COUNT
  const difficulty = input.difficulty
  const seeds = pickGeometrySeeds(difficulty)
  const out: GeometryQuestion[] = []
  const seen = new Set<string>()

  const push = (q: GeometryQuestion | null) => {
    if (!q) return false
    if (seen.has(q.fingerprint)) return false
    seen.add(q.fingerprint)
    out.push(q)
    return true
  }

  input.onProgress?.(
    `豆包按几何图库出题（${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}，共 ${count} 题）…`,
  )

  for (let i = 0; i < count && i < seeds.length; i++) {
    const seed = seeds[i]!
    input.onProgress?.(`第 ${i + 1}/${count} 题 · ${seed.term}（豆包改写）…`)
    const aiQ = await requestAnchoredGeometryMcq({
      seed,
      difficulty,
      seq: i,
      timeoutMs: 14_000,
    })
    if (push(aiQ)) continue
    input.onProgress?.(`第 ${i + 1} 题豆包未通过，使用同图本地题…`)
    push(buildGeometryQuestionFromSeed(seed, difficulty, 100 + i))
  }

  if (out.length < count) {
    for (const q of buildLocalGeometryPaper(difficulty)) {
      if (out.length >= count) break
      push(q)
    }
  }

  if (out.length < count) {
    throw new Error(`几何问题仅生成 ${out.length}/${count} 题，请重试。`)
  }
  return out.slice(0, count)
}

/** 概率问题·困难：强制豆包；几何概率数字由本地种子锚定 */
const PROBABILITY_FORCE_PROVIDER: AiProvider = 'doubao'

const PROBABILITY_SYSTEM = `
你是公务员/事业编「数量关系·概率问题」命题专家，专攻几何概率。
正确答案、数字参数与解析步骤已由系统锚定：你只改写材料与题干表述，不得改动数字、答案与关键计算步骤。
method/explanation 必须分步写清（建样本空间→标出有利区域→算面积或长度比），用中文具体数字，禁止出现英文占位词如 side。
只输出合法 JSON 对象，不要 markdown 围栏。
${CHINESE_MCQ_CORRECTNESS_RULES}
`.trim()

async function requestAnchoredProbabilityMcq(input: {
  seed: ProbabilitySeed
  seq: number
  timeoutMs?: number
}): Promise<ProbabilityQuestion | null> {
  const { seed, seq } = input
  const timeoutMs = input.timeoutMs ?? 16_000
  try {
    const raw = await Promise.race([
      deepseekChatRaw(
        [
          `请为下列【已锚定几何概率题】改写材料与题干（四选一）。解析步骤已锚定，不要删减计算说明。`,
          `难度对齐教材经典真题 3（几何概率·面积/线段比），可换生活场景，但数字与答案必须与锚定一致。`,
          `【锚定】题型=${seed.hardTypeId}；正确答案必须是「${seed.correct}」；干扰项可用原 distractors 或等价改写但数值集合不变。`,
          seed.anchorHint,
          `原题材料：${seed.passage}`,
          `原题干：${seed.stem}`,
          `请输出 JSON：{ "term","passage","stem","correct","distractors":[3],"method","explanation" }`,
          `correct 必须等于 ${JSON.stringify(seed.correct)}；distractors 必须是三个与 correct 不同的选项文本。`,
          `method、explanation 必须保留分步结构（可用换行），不得比原文更简略；禁止把数字改成英文单词 side：`,
          `做法：${seed.method}`,
          `解析：${seed.explanation}`,
        ].join('\n'),
        {
          system: PROBABILITY_SYSTEM,
          temperature: 0.35,
          maxTokens: 2000,
          provider: PROBABILITY_FORCE_PROVIDER,
        },
      ),
      new Promise<string>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
      }),
    ])
    const obj = parseAiJsonObjectLenient(stripAiJsonFence(raw))
    if (!obj || typeof obj !== 'object') return null
    const o = obj as Record<string, unknown>
    const passage = String(o.passage ?? seed.passage)
    const stem = String(o.stem ?? seed.stem)
    const term = String(o.term ?? seed.term)
    const aiMethod = String(o.method ?? '').trim()
    const aiExplain = String(o.explanation ?? '').trim()
    const method =
      aiMethod.length >= Math.min(12, seed.method.length) ? aiMethod : seed.method
    const explanation =
      aiExplain.replace(/\s/g, '').length >=
      Math.floor(seed.explanation.replace(/\s/g, '').length * 0.7)
        ? aiExplain
        : seed.explanation
    return buildProbabilityQuestionFromSeed(seed, 'hard', seq, {
      passage,
      stem,
      method,
      explanation,
      term,
    })
  } catch {
    return null
  }
}

export async function requestProbabilityHardMcqs(input: {
  count?: number
  avoidTerms?: string[]
  onProgress?: (msg: string) => void
}): Promise<ProbabilityQuestion[]> {
  void input.avoidTerms
  const count = input.count ?? PROBABILITY_QUESTION_COUNT
  const seeds = pickProbabilityHardSeeds(count)
  const out: ProbabilityQuestion[] = []
  const seen = new Set<string>()

  const push = (q: ProbabilityQuestion | null) => {
    if (!q) return false
    if (seen.has(q.fingerprint)) return false
    seen.add(q.fingerprint)
    out.push(q)
    return true
  }

  input.onProgress?.(`豆包按几何概率题库出题（困难，共 ${count} 题）…`)

  for (let i = 0; i < count && i < seeds.length; i++) {
    const seed = seeds[i]!
    input.onProgress?.(`第 ${i + 1}/${count} 题 · ${seed.term}（豆包改写）…`)
    const aiQ = await requestAnchoredProbabilityMcq({
      seed,
      seq: i,
      timeoutMs: 14_000,
    })
    if (push(aiQ)) continue
    input.onProgress?.(`第 ${i + 1} 题豆包未通过，使用同型本地题…`)
    push(buildProbabilityQuestionFromSeed(seed, 'hard', 100 + i))
  }

  if (out.length < count) {
    for (const q of buildLocalProbabilityHardPaper(count)) {
      if (out.length >= count) break
      push(q)
    }
  }

  if (out.length < count) {
    throw new Error(`概率问题仅生成 ${out.length}/${count} 题，请重试。`)
  }
  return out.slice(0, count)
}

/** 函数图象问题：强制豆包改写；曲线种类由本地种子锚定 */
const FUNCTION_GRAPH_FORCE_PROVIDER: AiProvider = 'doubao'

const FUNCTION_GRAPH_SYSTEM = `
你是公务员/事业编「数量关系·函数图象问题」命题专家。
正确答案对应的曲线类型已由系统锚定：你只改写材料与题干表述，不得改动曲线结论与关键推理。
method/explanation 必须结合教材四点（增减、周期、直线/曲线、状态变化点）分步说明。
只输出合法 JSON 对象，不要 markdown 围栏。
${CHINESE_MCQ_CORRECTNESS_RULES}
`.trim()

async function requestAnchoredFunctionGraphMcq(input: {
  seed: FunctionGraphSeed
  seq: number
  timeoutMs?: number
}): Promise<FunctionGraphQuestion | null> {
  const { seed, seq } = input
  const timeoutMs = input.timeoutMs ?? 14_000
  const correctKind = seed.optionKinds[seed.correctIndex]
  try {
    const raw = await Promise.race([
      deepseekChatRaw(
        [
          `请为下列【已锚定函数图象题】改写材料与题干（四选一选图）。曲线类型已锚定，不要改变应选图形态。`,
          `难度：${seed.difficulty}；正确曲线类型标识=${correctKind}（解析中用中文描述形态即可）。`,
          seed.anchorHint,
          `原题材料：${seed.passage}`,
          `原题干：${seed.stem}`,
          `请输出 JSON：{ "term","passage","stem","method","explanation" }`,
          `method、explanation 必须保留分步结构：`,
          `做法：${seed.method}`,
          `解析：${seed.explanation}`,
        ].join('\n'),
        {
          system: FUNCTION_GRAPH_SYSTEM,
          temperature: 0.35,
          maxTokens: 1800,
          provider: FUNCTION_GRAPH_FORCE_PROVIDER,
        },
      ),
      new Promise<string>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
      }),
    ])
    const obj = parseAiJsonObjectLenient(stripAiJsonFence(raw))
    if (!obj || typeof obj !== 'object') return null
    const o = obj as Record<string, unknown>
    const passage = String(o.passage ?? seed.passage)
    const stem = String(o.stem ?? seed.stem)
    const term = String(o.term ?? seed.term)
    const aiMethod = String(o.method ?? '').trim()
    const aiExplain = String(o.explanation ?? '').trim()
    const method =
      aiMethod.length >= Math.min(12, seed.method.length) ? aiMethod : seed.method
    const explanation =
      aiExplain.replace(/\s/g, '').length >=
      Math.floor(seed.explanation.replace(/\s/g, '').length * 0.65)
        ? aiExplain
        : seed.explanation
    return buildFunctionGraphQuestionFromSeed(seed, seq, {
      passage,
      stem,
      method,
      explanation,
      term,
    })
  } catch {
    return null
  }
}

export async function requestFunctionGraphMcqs(input: {
  count?: number
  difficulty: FunctionGraphDifficulty
  avoidTerms?: string[]
  onProgress?: (msg: string) => void
}): Promise<FunctionGraphQuestion[]> {
  void input.avoidTerms
  const count = input.count ?? FUNCTION_GRAPH_QUESTION_COUNT
  const difficulty = input.difficulty
  const seeds = pickFunctionGraphSeeds(difficulty)
  const out: FunctionGraphQuestion[] = []
  const seen = new Set<string>()

  const push = (q: FunctionGraphQuestion | null) => {
    if (!q) return false
    if (seen.has(q.fingerprint)) return false
    if (difficulty === 'hard' && q.hardTypeId && out.some((x) => x.hardTypeId === q.hardTypeId)) {
      return false
    }
    seen.add(q.fingerprint)
    out.push(q)
    return true
  }

  input.onProgress?.(
    `豆包按函数图象题库出题（${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '普通' : '困难'}，共 ${count} 题）…`,
  )

  for (let i = 0; i < count && i < seeds.length; i++) {
    const seed = seeds[i]!
    input.onProgress?.(`第 ${i + 1}/${count} 题 · ${seed.term}（豆包改写）…`)
    const aiQ = await requestAnchoredFunctionGraphMcq({
      seed,
      seq: i,
      timeoutMs: 14_000,
    })
    if (push(aiQ)) continue
    input.onProgress?.(`第 ${i + 1} 题豆包未通过，使用同型本地题…`)
    push(buildFunctionGraphQuestionFromSeed(seed, 100 + i))
  }

  if (out.length < count) {
    for (const q of buildLocalFunctionGraphPaper(difficulty)) {
      if (out.length >= count) break
      push(q)
    }
  }

  if (out.length < count) {
    throw new Error(`函数图象问题仅生成 ${out.length}/${count} 题，请重试。`)
  }
  return out.slice(0, count)
}

/** 逻辑判断各题型共用：公考/事业编定位 + 唯一解/题答对齐 + 解析要求 */
const LOGIC_REASON_COMMON_RULES = [
  '命题对接公务员考试、事业单位考试「判断推理·逻辑判断」常见考法，干扰项设计贴近真题陷阱，难度对标相应考点真题手感。',
  '只输出合法 JSON，不要 markdown 代码围栏，不要其它说明文字。',
  [
    '【答案唯一·硬性·出题前自检】必须按此顺序：①写材料与设问；②不看选项先独立推导唯一结论；③再写 correct；④写三个明确错误的干扰项。',
    '四个选项中只能有一个满足题干要求；禁止两选项都说得通、半对半错、或「选哪个都行」。',
    'correct 必须与 passage+stem 严丝合缝：问「推出」则正确项须必然推出；问「加强/前提」不得给削弱；问「削弱」不得给加强；问「解释」须真正化解矛盾/反常。',
    '干扰项须有明确错因（充分必要颠倒、肯前否后、过度推断、另有他因、无关、答非所问等），禁止「也勉强对」。',
    '若无法保证唯一正确解，宁可换材料重出，禁止勉强拼题。',
  ].join(''),
  [
    '【explanation】写 3～5 句中文（约 80～160 字）：①概括逻辑/论证结构；②正确项为何唯一成立；',
    '③点破两个主要干扰项错因；④末句点明考点名。禁止只写「选某项」。method 写短考点名（约 8～20 字）。',
  ].join(''),
].join('\n')

const LOGIC_REASON_PROOFREAD_SYSTEM = [
  '你是公务员/事业编「判断推理·逻辑判断」严格审题官，只做校对，不出新题。',
  '任务：判断「标为正确的选项」是否与材料+设问严丝合缝，且四个选项中是否仅此一项成立。',
  '宁可判不合格，也不放过：题干与答案对不上、多解、正确项其实推不出、干扰项其实也对、问法与答案类型错位（如问削弱却给加强）。',
  '只输出合法 JSON 对象，不要 markdown，不要其它文字。',
].join('\n')

type LogicReasonVerifiable = {
  fingerprint: string
  term: string
  passage: string
  stem: string
  options: string[]
  correctIndex: number
  explanation?: string
  method?: string
}

/** AI 校对：题答对齐 + 唯一正确解；不过关则丢弃 */
async function verifyLogicReasonMcqWithAi(
  q: LogicReasonVerifiable,
  examTypeHint: string,
): Promise<boolean> {
  if (!Array.isArray(q.options) || q.options.length !== 4) return false
  if (q.correctIndex < 0 || q.correctIndex > 3) return false
  const letters = ['A', 'B', 'C', 'D'] as const
  const optionLines = q.options
    .map((opt, i) => `${letters[i]}. ${String(opt ?? '').trim()}`)
    .join('\n')
  const marked = letters[q.correctIndex]!
  const user = [
    `题型：${examTypeHint}`,
    `材料：\n${(q.passage || '（无独立材料，见设问）').trim()}`,
    `设问：\n${q.stem.trim()}`,
    `选项：\n${optionLines}`,
    `命题标注正确答案：${marked}`,
    q.method ? `命题标注考点：${q.method}` : '',
    q.explanation ? `命题给出的解析（仅供参考，你须独立复核）：${q.explanation}` : '',
    [
      '请独立复核后只返回 JSON：',
      '{',
      '  "markedCorrectIsRight": true/false,  // 标注项是否确实满足设问',
      '  "uniqueAnswer": true/false,          // 是否仅有一个选项能成立',
      '  "alsoAcceptable": ["B"],             // 除标注项外仍可成立的选项字母；无可填 []',
      '  "stemAnswerMatch": true/false,       // 设问类型与答案类型是否对齐',
      '  "ok": true/false,                    // 仅当前三项都通过时为 true',
      '  "reason": "一句话中文理由"',
      '}',
      '判定标准：ok 为 true 当且仅当 markedCorrectIsRight、uniqueAnswer、stemAnswerMatch 均为 true，且 alsoAcceptable 为空。',
      '有疑点一律 ok=false。',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')

  try {
    const raw = await deepseekChatRaw(user, {
      system: LOGIC_REASON_PROOFREAD_SYSTEM,
      temperature: 0.1,
      maxTokens: 500,
    })
    const obj = parseAiJsonObjectLenient(raw) as Record<string, unknown> | null
    if (!obj || typeof obj !== 'object') return false

    const truthy = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1'
    const markedOk = truthy(obj.markedCorrectIsRight)
    const unique = truthy(obj.uniqueAnswer)
    const match = truthy(obj.stemAnswerMatch)
    const ok = truthy(obj.ok)
    const also = Array.isArray(obj.alsoAcceptable)
      ? obj.alsoAcceptable.map((x) => String(x).trim().toUpperCase()).filter(Boolean)
      : []
    // 排除误把标注项自己写进 alsoAcceptable
    const alsoOthers = also.filter((x) => x !== marked)

    return ok && markedOk && unique && match && alsoOthers.length === 0
  } catch {
    return false
  }
}

const LOGIC_REASON_TOPIC_SEEDS = [
  '社会治理',
  '经济民生',
  '科技创新',
  '教育文化',
  '生态环境',
  '医疗卫生',
  '法律权益',
  '职场管理',
  '城乡发展',
  '公共安全',
] as const

/** 逻辑判断：并行单题生成，避免一次吐 5 道长解析导致 JSON 截断 */
async function requestOneLogicReasonMcqObject(input: {
  system: string
  format: string
  examTypeHint: string
  diffLabel: string
  seq: number
  avoidTerms: string[]
  topicLabel: string
  topicHint?: string
  temperature: number
  extraHints?: string[]
}): Promise<unknown | null> {
  const avoidHint = buildAvoidTermsHint(input.topicLabel, input.avoidTerms)
  const topicLine = input.topicHint
    ? `本题题材方向优先贴近「${input.topicHint}」（可换具体案例，勿照抄旧题）。`
    : ''
  const user = [
    `请生成第 ${input.seq} 道公考/事业编「${input.examTypeHint}」四选一，难度 **${input.diffLabel}**。`,
    input.format,
    avoidHint,
    topicLine,
    ...(input.extraHints ?? []),
    [
      '【交卷前自检·必须】',
      '1）遮住选项，仅凭材料+设问能否唯一推出你写的 correct？不能则重写。',
      '2）逐个检查三个 distractors：是否有任何一个其实也成立？有则改掉。',
      '3）设问类型与 correct 类型是否对齐（推出/加强/削弱/解释/评价）？不对齐则重写。',
      '仅返回一个 JSON 对象（不要数组）。',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')

  const raw = await deepseekChatRaw(user, {
    system: input.system,
    temperature: input.temperature,
    maxTokens: 2000,
  })
  return parseAiJsonObjectLenient(raw)
}

async function requestLogicReasonMcqBatch<T extends LogicReasonVerifiable>(input: {
  count: number
  progressLabel: string
  diffLabel: string
  avoidTerms?: string[]
  onProgress?: (message: string) => void
  system: string
  format: string
  topicLabel: string
  examTypeHint: string
  extraHints?: string[]
  temperature?: number
  tryBuild: (raw: unknown, seq: number) => T | null
}): Promise<T[]> {
  const count = input.count
  const historyBlocked = new Set(
    (input.avoidTerms ?? []).map(normalizeAvoidTerm).filter(Boolean),
  )
  const deduped: T[] = []
  const usedTerms = new Set<string>(historyBlocked)
  // 略降温度，优先唯一解与题答对齐
  const baseTemp = input.temperature ?? 0.58

  const pushIfNew = (q: T | null) => {
    if (!q) return false
    if (deduped.some((x) => x.fingerprint === q.fingerprint)) return false
    const termKey = normalizeAvoidTerm(q.term)
    // 历史主题尽量避开；本批主题撞车仍可保留不同题干（并行时否则易凑不满）
    if (termKey && historyBlocked.has(termKey)) return false
    deduped.push(q)
    if (termKey) usedTerms.add(termKey)
    return true
  }

  const topicFor = (i: number, wave: number) =>
    LOGIC_REASON_TOPIC_SEEDS[(i + wave * 3) % LOGIC_REASON_TOPIC_SEEDS.length]!

  const fetchOne = async (seq: number, wave: number, avoid: string[]) => {
    try {
      const raw = await requestOneLogicReasonMcqObject({
        system: input.system,
        format: input.format,
        examTypeHint: input.examTypeHint,
        diffLabel: input.diffLabel,
        seq,
        avoidTerms: avoid,
        topicLabel: input.topicLabel,
        topicHint: topicFor(seq, wave),
        temperature: Math.min(0.78, baseTemp + wave * 0.04),
        extraHints: input.extraHints,
      })
      const q = input.tryBuild(raw, seq)
      if (!q) return null
      const passed = await verifyLogicReasonMcqWithAi(q, input.examTypeHint)
      if (!passed) return null
      return q
    } catch {
      return null
    }
  }

  input.onProgress?.(`并行生成并校对 ${count} 道${input.progressLabel}…`)
  const wave1 = await Promise.all(
    Array.from({ length: count }, (_, i) => fetchOne(i + 1, 0, [...historyBlocked])),
  )
  for (const q of wave1) pushIfNew(q)
  input.onProgress?.(`校对通过 ${deduped.length}/${count} 题…`)

  for (let wave = 1; deduped.length < count && wave <= 4; wave++) {
    const need = count - deduped.length
    input.onProgress?.(`补生成并校对 ${need} 题（第 ${wave} 波）…`)
    const more = await Promise.all(
      Array.from({ length: need }, (_, i) =>
        fetchOne(100 * wave + i + 1, wave, [...usedTerms]),
      ),
    )
    for (const q of more) pushIfNew(q)
  }

  let guard = 0
  while (deduped.length < count && guard < 16) {
    guard += 1
    const slot = deduped.length + 1
    input.onProgress?.(`兜底补第 ${slot}/${count} 题并校对（${guard}/16）…`)
    const q = await fetchOne(900 + guard, guard, [...usedTerms])
    pushIfNew(q)
  }

  if (deduped.length < count) {
    throw new Error(
      `仅成功生成并通过校对 ${deduped.length}/${count} 题（已避开近期重复），请稍后重试`,
    )
  }
  return deduped.slice(0, count)
}

const TRANSLATION_REASON_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·翻译推理」命题专家，专精假言命题、充分必要条件、逆否等价。',
  LOGIC_REASON_COMMON_RULES,
  '题干表述可灵活（若…则…/只有…才…/前提/基础/必须等），题材不限；正确项须逻辑唯一，干扰项贴近常见翻译陷阱。',
].join('\n')

function translationReasonDiffLabel(d: TranslationReasonDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function translationReasonFormat(difficulty: TranslationReasonDifficulty): string {
  const flex = `
【灵活·必读】联词与场景可换；勿整批同构。例题只定难度与陷阱类型，禁止照抄原文人物/名言/材料。
【输出】JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】单层假言或一句条件句，1～2 步逆否/等价即可；干扰项含肯前否后、肯后否前、「只要…就」与原命题不等价等。
【例题参考·难度手感】
passage：法国剧作家博马舍《费加罗的婚礼》：「若批评不自由，则赞美无意义。」某报以此为报头。
stem：由此可以推出该报纸最有可能赞同的说法是（ ）
选项参考：A 只要批评自由则赞美有意义｜B 只要赞美自由则批评有意义｜C 赞美有意义可见批评自由｜D 批评不自由仍可有意义赞美
正确思路：原命题「批评不自由→赞美无意义」等价逆否「赞美有意义→批评自由」，故 C。
同类可换：若…则… / 如果…就… / 除非…否则…（译成等价假言）等，人物题材自拟。
${flex}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】「只有…才…」或 2～3 环短链条；正确项多为肯后推前/逆否，干扰项颠倒充分必要。
【例题参考·难度手感】
passage：农民是保护传承主体，让农民受益才能落到实处；发挥新型经营主体、健全利益联结、发展特色、惠及更多农户，才能擦亮农业文化遗产「招牌」。
stem：由此可以推出（ ）
选项参考含：若招牌得以擦亮，说明更多农户享受到发展成果（必要条件肯后）；以及「没保护→农民没受益」等混淆充分必要的干扰。
正确思路：擦亮招牌←惠及农户等必要条件链条 → 「擦亮→已惠及」可推。
链条长度与联词可灵活，勿照抄农业题材。
${flex}
`.trim()
  }
  return `
【难度·困难】多层「只有 A 才能 B」必要条件链（≥3 环），正确项常为链上某环的逆否；干扰项把「只有…才」误当充分。
【例题参考·难度手感】
passage：明确数据财产权属→才能建要素市场；建立数据财产制度→才能调动积极性且静态变资产；真正成为资产→才能推动产业且实现数字化转型。
stem：由此可以推出（ ）
选项参考含：若未能真正成为资产就不能实现数字化转型（逆否）；以及「一旦明确权属就能建市场」等充分误读。
正确思路：数字化转型→真正成为资产，故「未成资产→不能数字化转型」。
可换科技/治理/教育等长链条题材，结构自拟。
${flex}
`.trim()
}

function dedupeTranslationReasonQuestions(
  items: TranslationReasonQuestion[],
  blockedTerms?: Set<string>,
): TranslationReasonQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: TranslationReasonQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestTranslationReasonMcqs(input: {
  count?: number
  difficulty: TranslationReasonDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<TranslationReasonQuestion[]> {
  const count = input.count ?? TRANSLATION_REASON_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = translationReasonDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `翻译推理（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: TRANSLATION_REASON_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: translationReasonFormat(difficulty),
    topicLabel: '翻译推理主题',
    examTypeHint: '判断推理·翻译推理',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseTranslationReasonMcqAiObject(raw)
      if (!fields) return null
      const q = buildTranslationReasonQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const COMBO_ARRANGE_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·组合排列」命题专家，专精排序、匹配、半真半假与条件分配。',
  LOGIC_REASON_COMMON_RULES,
  '元素个数、条件条数、题型（纯排序/一对一匹配/半真半假）可灵活；correct 在材料下须唯一可确定。',
].join('\n')

function comboArrangeDiffLabel(d: ComboArrangeDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function comboArrangeFormat(difficulty: ComboArrangeDifficulty): string {
  const flex = `
【灵活·必读】元素个数、条件写法、场景均可换；例题只定难度，禁止照抄饮品/四队原文。本批尽量变换题型变体。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】比普通题条件更少：约 3 个元素、2～3 条直接条件即可唯一确定；避免「每人对一半」多轮假设，也避免多层假言嵌套。
题型可灵活：名次排序、书架顺序、三人三课匹配等；条件如「甲不是第一」「乙在丙前」「丙不选语文」等。
stem：「据此可推出排序/匹配为（ ）」；选项写完整方案。
${flex}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】推理量对齐「半真半假推排序」：多人预测名次且各对一半（或类似对错比例），或条件稍多的中等排序/匹配。
【例题参考·难度手感】
passage：甲乙丙预测牛奶、豆浆、果汁、咖啡销量。甲：豆浆第二、咖啡最高。乙：咖啡第二、果汁第三。丙：牛奶第二、果汁垫底。各自预测正确一半。
stem：据此推断 4 种饮品销量从高到低为（ ）
选项为四条完整排序（如「咖啡、果汁、豆浆、牛奶」等）；正确项须与「各对一半」完全自洽。
同类可换：比赛名次、成绩排名、节目收视等；「各对一半」也可改为「各对一句」等，但难度勿掉到简单档。
${flex}
`.trim()
  }
  return `
【难度·困难】多条件一对一分配；条件含否定、析取否定、假言等，推出唯一匹配。
【例题参考·难度手感】
passage：红蓝黄绿四队分配搭帐篷、生火做饭、寻找水源、搞卫生。（1）红队不是生火做饭，也不寻找水源；（2）黄队既不寻找水源，也不生火做饭；（3）如果红队不是搭帐篷，那么绿队不是生火做饭；（4）有人说蓝队或者搭帐篷或者生火做饭，但事实并非如此。
stem：由此可推出具体分配结果为（ ）
选项为四人完整分配方案；正确项须满足全部条件。
主体/任务/条件组合可自拟，保持同类推理负担。
${flex}
`.trim()
}

function dedupeComboArrangeQuestions(
  items: ComboArrangeQuestion[],
  blockedTerms?: Set<string>,
): ComboArrangeQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ComboArrangeQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestComboArrangeMcqs(input: {
  count?: number
  difficulty: ComboArrangeDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ComboArrangeQuestion[]> {
  const count = input.count ?? COMBO_ARRANGE_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = comboArrangeDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `组合排列（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: COMBO_ARRANGE_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: comboArrangeFormat(difficulty),
    topicLabel: '组合排列主题',
    examTypeHint: '判断推理·组合排列',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseComboArrangeMcqAiObject(raw)
      if (!fields) return null
      const q = buildComboArrangeQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const TRUTH_FALSE_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·真假推理」命题专家，专精真话假话、矛盾对当、假设排除。',
  LOGIC_REASON_COMMON_RULES,
  '人数、陈述句数、真假数量均可灵活（仅一真/仅一假/恰两真/恰两假/一半真一半假等），但材料必须写清真假约束；在该约束下 correct 唯一；解析须标明谁真谁假及逐步排除。',
].join('\n')

function truthFalseDiffLabel(d: TruthFalseDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function truthFalseFormat(difficulty: TruthFalseDifficulty): string {
  const flexibleCommon = `
【灵活命题·必读】
- 人数不必固定（2～7 人均可）；陈述句数可与人数相同或略少。
- 真假约束可多样：仅一真、仅一假、恰两真、恰两假、一半真一半假等——须在题干写清。
- 本批尽量变换「真假约束类型」与场景，不要整批同一种「仅一真」。
- 例题只定难度手感与结构，禁止照抄人名与原话。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】一两轮假设即可；陈述多为直言，一般不含全称特称对当与假言连锁。
【例题参考·难度手感】
passage：小查、小白、小铭三人中只有一人会泰语。小查：「我不会泰语。」小铭：「小查不会泰语。」小白：「我会泰语。」三句话只有一句为真。
stem：那么会泰语的是（ ）
选项：小查 / 小白 / 小铭 / 无法判断（结构参考；你出题时须自洽唯一）。
同类亦可：两人三句、四人仅一假、三人恰两真等，整体仍偏易。
${flexibleCommon}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】常用矛盾/对当（全称与特称等）先锁一真一假，再结合真假数量推其余。
【例题参考·难度手感】
passage：甲乙丙丁四人工作各不相同且至多一工具。甲：所有工作都要用老虎钳。乙：本人工作要用螺丝刀。丙：我的工作不需要扳手。丁：有的工作没有用到老虎钳。其中只有一句话为真。
stem：以下哪项为真（ ）
选项参考含：丙的工作要用扳手；有的工作要用螺丝刀；乙要用螺丝刀；所有工作都要用老虎钳。
正确思路：甲与丁矛盾必有一真一假，又仅一真 → 乙丙假 → 可推「丙的工作要用扳手」一类结论。
同类可换约束与对象，勿照抄工具题。
${flexibleCommon}
`.trim()
  }
  return `
【难度·困难】多人、假言与直言混杂；真假数量 + 假言真值多步排除；干扰项区分「可能/必然」。
【例题参考·难度手感】
passage：甲～己六人推测录取。甲：若小赵没考上文学则一定考上语言学。乙：小汪一定考上法律。丙：若小刘没考上化学则小丽考上微电子。丁：小赵文学语言学都考不上。戊：小任能考上动漫。己：小丽考不上微电子。录取后发现两个人的推测与事实不符。
stem：由此可以推出（ ）
选项为复合事实判断；正确项须在「恰两假」下可必然推出。
人数与真假数可改，保持困难档推理负担。
${flexibleCommon}
`.trim()
}

function dedupeTruthFalseQuestions(
  items: TruthFalseQuestion[],
  blockedTerms?: Set<string>,
): TruthFalseQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: TruthFalseQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestTruthFalseMcqs(input: {
  count?: number
  difficulty: TruthFalseDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<TruthFalseQuestion[]> {
  const count = input.count ?? TRUTH_FALSE_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = truthFalseDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `真假推理（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: TRUTH_FALSE_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: truthFalseFormat(difficulty),
    topicLabel: '真假推理主题',
    examTypeHint: '判断推理·真假推理',
    temperature: 0.5,
    extraHints: ['真假约束类型尽量多样（勿总是「仅一真」）；人数也可变化。'],
    tryBuild: (raw, seq) => {
      const fields = parseTruthFalseMcqAiObject(raw)
      if (!fields) return null
      const q = buildTruthFalseQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const EVAL_REASON_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·评价推理」命题专家，专精论证评价、谬误识别与观点评析。',
  LOGIC_REASON_COMMON_RULES,
  '题干问法可灵活（易受批评的原因 / 主要漏洞 / 评价正确的是）；谬误类型宜多样；correct 为最恰当评价。',
].join('\n')

function evalReasonDiffLabel(d: EvalReasonDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function evalReasonFormat(difficulty: EvalReasonDifficulty): string {
  const flex = `
【灵活·必读】场景与谬误类型可换；例题只定难度，禁止照抄刘奶奶/斜杠青年原文。本批尽量覆盖不同谬误。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】比普通题更轻：材料一两句即可，漏洞单一明显（人身攻击、诉诸权威、以偏概全、偷换概念、绝对化等其一）；选项直接对应一种批评，无需①②③④组合。
stem：「上述论证的主要问题是（ ）」「最恰当的评价是（ ）」等。
${flex}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】一段论证，问「很容易受到批评，因为…」；正确项抓最核心漏洞，干扰项为次要或似是而非批评。
【例题参考·难度手感】
passage：刘奶奶称「全年物价涨幅低于5%」的官员明显错，因缺乏生活经验、没自己买过东西；并举早点涨10%、布鞋12%、高铁15%、汽油20%。
stem：刘奶奶的上述论证很容易受到批评，因为（ ）
选项参考：A 指责官员缺乏经验而非针对论证｜B 用不具代表性的小样本作证据｜C 诉诸感情｜D 「没买过东西」说法太绝对
正确思路：个别品类涨价不能代表全年总物价指数 → 批评「小样本/以偏概全」最切中（B）；A/C/D 虽可挑剔但非最核心。
同类可换统计、调查、个案推全体等题材。
${flex}
`.trim()
  }
  return `
【难度·困难】双方讨论 +「对甲/乙观点评价正确的是」+ ①②③④ 要点组合选肢。
【例题参考·难度手感】
passage：「斜杠青年」定义后，甲：不可取，「术业有专攻」，专一才能成功。乙：认同，年轻人应多尝试才知适合什么。
stem：对于甲的观点，评价正确的是（ ）
要点参考：①带偏见名言支撑｜②结论过于绝对｜③有主观偏见｜④把普通情况代入特殊情形
选项参考：A①② B②③ C③④ D①④
正确思路：甲把专一说成成功必要条件，结论绝对且带主观排斥「斜杠」→ ②③ 一类组合更贴切。
可换职场/教育/消费等辩论题材；要点集合与组合方式自拟。
${flex}
`.trim()
}

function dedupeEvalReasonQuestions(
  items: EvalReasonQuestion[],
  blockedTerms?: Set<string>,
): EvalReasonQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: EvalReasonQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestEvalReasonMcqs(input: {
  count?: number
  difficulty: EvalReasonDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<EvalReasonQuestion[]> {
  const count = input.count ?? EVAL_REASON_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = evalReasonDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `评价推理（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: EVAL_REASON_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: evalReasonFormat(difficulty),
    topicLabel: '评价推理主题',
    examTypeHint: '判断推理·评价推理',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseEvalReasonMcqAiObject(raw)
      if (!fields) return null
      const q = buildEvalReasonQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const STRENGTHEN_REASON_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·加强型/前提型」命题专家，专精补强结论、排除他因、例证支持与隐含前提。',
  LOGIC_REASON_COMMON_RULES,
  'correct 须最能支持/使结论成立；勿出削弱项当正确项。',
].join('\n')

function strengthenReasonDiffLabel(d: StrengthenReasonDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function strengthenReasonFormat(difficulty: StrengthenReasonDifficulty): string {
  const flex = `
【灵活·必读】题材与问法可换；例题只定难度，禁止照抄招聘/金字塔/无人机原文。本批尽量变换加强方式（前提、排除他因、例证、补充机制等）。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】偏「前提/假设」：材料给论证或结论，问「结论基于的前提是」「论证假设了什么」；正确项是结论成立所必需、且材料未明说的条件；干扰项过强、过窄或无关。
【例题参考·难度手感】
passage：某公司招聘要求身高1米7以上；严格按规则招聘后，结论「该公司所有人身高都高于1米7」。
stem：以上结论基于的前提是？
选项参考：A 招聘前原员工都超1米7｜B 领导岗位都超｜C 所有应聘者都超｜D 对1米7及以下优秀人员不设特殊招聘
正确思路：若可对矮个子特招，则「严格按规则招聘」推不出「所有人都超1米7」→ D 类「无例外通道」是关键前提。
同类可换其他规则→全称结论的隐含前提题。
${flex}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】经典加强：考古/调查等由证据推结论，问「最能支持/加强上述结论」；正确项常排除他因或堵住漏洞。
【例题参考·难度手感】
passage：原认为胡夫金字塔由奴隶建造；附近发现工匠村落、食宿有保障，墓穴有工匠骸骨及手术/骨折医治痕迹 → 考古学家认为由自由民建造而非奴隶。
stem：最能支持考古学家观点的是（ ）（选项结构参考）
选项参考：A 村落住了大量自由民｜B 古埃及奴隶死后不会在墓穴安葬｜C 自由民数量足以建造｜D 遗迹中有妇女婴儿骸骨
正确思路：B 堵住「墓中工匠仍可能是奴隶」→ 加强「是自由民」。
问法可为「最能支持/加强/以下哪项为真则结论更可信」等。
${flex}
`.trim()
  }
  return `
【难度·困难】材料给较新做法/现象并下积极结论，选项多为事实陈述；正确项用具体例证或关键机制明显加强，干扰项为无关培训、比赛或弱相关。
【例题参考·难度手感】
passage：无人机应用变广；检察机关借无人机参与公益诉讼，专项监督以来航拍勘验取证，为办案提质增效提供支撑。
stem：最能加强上述论证的是（ ）（选项结构参考）
选项参考：A 某院航拍西瓜种植区采集农膜图片作公益诉讼证据｜B 无人机高机动宽视野等优势可打破地形限制勘查｜C 组织飞行勘查培训多次｜D 举办无人机取证比赛
正确思路：A 类「办案实绩例证」最直接支持「提质增效」；B 也可加强但偏能力说明；C/D 偏组织活动，加强力弱。出题时须保证正确项唯一最强。
${flex}
`.trim()
}

function dedupeStrengthenReasonQuestions(
  items: StrengthenReasonQuestion[],
  blockedTerms?: Set<string>,
): StrengthenReasonQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: StrengthenReasonQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestStrengthenReasonMcqs(input: {
  count?: number
  difficulty: StrengthenReasonDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<StrengthenReasonQuestion[]> {
  const count = input.count ?? STRENGTHEN_REASON_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = strengthenReasonDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `加强论证（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: STRENGTHEN_REASON_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: strengthenReasonFormat(difficulty),
    topicLabel: '加强论证主题',
    examTypeHint: '判断推理·加强论证（含前提型）',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseStrengthenReasonMcqAiObject(raw)
      if (!fields) return null
      const q = buildStrengthenReasonQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const WEAKEN_REASON_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·削弱型」命题专家，专精另有他因、切断外推、质疑样本与统计陷阱。',
  LOGIC_REASON_COMMON_RULES,
  'correct 须最能削弱结论；勿把加强项或无关项标为正确。',
].join('\n')

function weakenReasonDiffLabel(d: WeakenReasonDifficulty): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '普通'
  return '困难'
}

function weakenReasonFormat(difficulty: WeakenReasonDifficulty): string {
  const flex = `
【灵活·必读】题材与削弱方式可换；例题只定难度，禁止照抄照相机/茶咖啡/健身卡原文。本批尽量变换削弱手法。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】由部分时段/局部数据外推全年或总体结论；正确削弱常指出「时段不具代表性」或切断外推。
【例题参考·难度手感】
passage：2022年1–6月售出约300万台照相机，仅是2021年全年销量的35% → 结论：2022年销量一定比2021年少。
stem：最能削弱上述结论的是（ ）
选项参考：A 2021比2020少｜B 2022售价更便宜｜C 多数家庭已有相机｜D 全年销量70%以上在年末两月完成
正确思路：D 说明上半年占比本就可能偏低，外推「全年更少」不成立。
${flex}
`.trim()
  }
  if (difficulty === 'medium') {
    return `
【难度·普通】因果/实验结论；正确削弱多为「另有他因」（实验组还做了别的事），干扰项为无关、另项研究或背景常识。
【例题参考·难度手感】
passage：研究称茶中物质增强抵抗力而咖啡没有；20人各半喝茶/喝咖啡一个月后，接触大肠杆菌，喝茶组干扰素为实验前5倍，咖啡组无变化。
stem：最能削弱以上研究结论的是（ ）
选项参考：A 喝茶组更注重运动｜B 另有研究称多喝咖啡也增强体质｜C 细菌亿年未灭绝｜D 干净环境有助抵抗力
正确思路：A 引入他因，削弱「是茶导致干扰素升高」。
${flex}
`.trim()
  }
  return `
【难度·困难】用办卡数/人次增长证明举措有效；正确削弱常指出「重复办卡」「基数变化」等使「人数增加两倍」不可比或虚高，干扰项为成本、未锻炼等次要问题。
【例题参考·难度手感】
passage：建馆办免费健身卡，2015办3万、2018办7万、2020办11万；市政府认为举措有效，因5年间办卡学生增加两倍多。
stem：最能削弱上述结论的是（ ）
选项参考：A 中小学生总人数从20万增到30万｜B 维护成本高难平衡财政｜C 办第一馆卡的学生又办另外两馆卡｜D 部分办卡后从未去运动
正确思路：C 说明办卡张数≠办卡学生人数，增长可能被重复办卡放大（亦可讨论 A 的人均比例，但题眼常落在重复统计）。出题时保证正确项唯一最强。
${flex}
`.trim()
}

function dedupeWeakenReasonQuestions(
  items: WeakenReasonQuestion[],
  blockedTerms?: Set<string>,
): WeakenReasonQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: WeakenReasonQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestWeakenReasonMcqs(input: {
  count?: number
  difficulty: WeakenReasonDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<WeakenReasonQuestion[]> {
  const count = input.count ?? WEAKEN_REASON_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = weakenReasonDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `削弱论证（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: WEAKEN_REASON_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: weakenReasonFormat(difficulty),
    topicLabel: '削弱论证主题',
    examTypeHint: '判断推理·削弱论证',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseWeakenReasonMcqAiObject(raw)
      if (!fields) return null
      const q = buildWeakenReasonQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const DAILY_CONCLUSION_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·日常结论」命题专家，专精从日常/科普陈述中做必然推出，避免过度推断。',
  LOGIC_REASON_COMMON_RULES,
  'correct 必须是材料可必然推出的结论；干扰项含夸大因果、绝对化、材料未提及信息等。',
].join('\n')

function dailyConclusionDiffLabel(d: DailyConclusionDifficulty): string {
  return d === 'easy' ? '简单' : '困难'
}

function dailyConclusionFormat(difficulty: DailyConclusionDifficulty): string {
  const flex = `
【灵活·必读】题材可换（健康、运动、饮食、科技生活等）；例题只定难度，禁止照抄跑步机/糖尿病原文。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】短日常材料，1～2 步即可推出；正确项紧扣材料已说内容，干扰项为目的臆测、比例臆测、材料未提细节。
【例题参考·难度手感】
passage：生活节奏加快、压力增加，更多人关注健康并以运动改善，跑步受青睐；除户外跑步外，很多人也会选择室内跑步机。
stem：由此可以推出（ ）
选项参考：A 锻炼目的是缓解压力｜B 压力会影响人的健康｜C 不健康的人占多数｜D 没有放在室外的跑步机
正确思路：材料把压力增加与关注健康/运动改善健康相连 → B 可推；A 把目的说死、C 比例、D 与「室内跑步机」无关且妄断。
${flex}
`.trim()
  }
  return `
【难度·困难】科普/医学类稍长材料；正确项多为谨慎、可推出的控制建议；干扰项常见「越多越好」「能规避」「完全不能摄入」等过度推断。
【例题参考·难度手感】
passage：糖尿病以高血糖为特征；胰岛素分泌不足或调节不佳致血糖升高；与糖类等热量摄入增加有关；尚无根治，但可通过饮食治疗、适当运动等控制。
stem：如果上述言论为真，可以推出下列哪项结论？（ ）
选项参考：A 胰岛素越多越不易得病｜B 诱因很多，体育锻炼能规避糖尿病｜C 患者不能摄入含糖食物｜D 调整膳食减少热量摄入有助于安全控制血糖
正确思路：材料支持饮食治疗控制 → D；A/B/C 为过度推断或绝对化。
${flex}
`.trim()
}

function dedupeDailyConclusionQuestions(
  items: DailyConclusionQuestion[],
  blockedTerms?: Set<string>,
): DailyConclusionQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: DailyConclusionQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestDailyConclusionMcqs(input: {
  count?: number
  difficulty: DailyConclusionDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<DailyConclusionQuestion[]> {
  const count = input.count ?? DAILY_CONCLUSION_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = dailyConclusionDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `日常结论（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: DAILY_CONCLUSION_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: dailyConclusionFormat(difficulty),
    topicLabel: '日常结论主题',
    examTypeHint: '判断推理·日常结论',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseDailyConclusionMcqAiObject(raw)
      if (!fields) return null
      const q = buildDailyConclusionQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}

const EXPLAIN_PHENOM_SYSTEM = [
  '你是公务员/事业编考试「判断推理·逻辑判断·解释型」命题专家，专精解释反常现象与化解矛盾。',
  LOGIC_REASON_COMMON_RULES,
  'correct 须最能解释材料中的现象或矛盾；干扰项为无关、事后发生或无法对接矛盾双方的选项。',
].join('\n')

function explainPhenomDiffLabel(d: ExplainPhenomDifficulty): string {
  return d === 'easy' ? '简单' : '困难'
}

function explainPhenomFormat(difficulty: ExplainPhenomDifficulty): string {
  const flex = `
【灵活·必读】场景可换；例题只定难度，禁止照抄咖啡促销/选举/冰川原文。困难档可轮换「组合选肢」与「科学矛盾」两类。
JSON：term,passage,stem,correct,distractors[3],method,explanation；explanation 按系统要求写清结构、正确项与两个干扰错因即可（勿过长）。
`.trim()

  if (difficulty === 'easy') {
    return `
【难度·简单】给出「预期应升/应好，结果却降/变差」类反常；问最能解释该现象。正确项直接说明为何销量/指标下降。
【例题参考·难度手感】
passage：咖啡店按往年在冷门时段半价促销，但一段时间后整体销量较往年同期明显减少。
stem：下列哪项如果为真，最能解释上述现象？（ ）
选项参考：A 促销期订单大导致服务下降｜B 周围新开多家其他品牌咖啡店｜C 品牌知名度不够缺固定客群｜D 促销结束后回调了价格
正确思路：B 引入竞争分流，解释「促销仍整体减少」；D 若发生在促销结束后未必解释促销期间的减少；C 往年同样存在则难解释「较往年减少」。
${flex}
`.trim()
  }
  return `
【难度·困难】解释「矛盾双方同时成立」：如负面曝光但支持率上升，或主流理论与新结论冲突。可选：①②③④组合选肢，或科学史情境找「缺失机制」。
【例题参考1·矛盾组合】
passage：候选人被揭篡改简历致部分选民怀疑诚信，但民意支持率仍节节上升并远超他人。
要点：①执行力博得支持｜②多数候选人也美化简历｜③以往错误不代表今后表现｜④以往支持率一向很高
stem：有助于解释这种矛盾现象的是（ ）选项为 ①④ / ②④ / ①② / ③④ 等组合。
正确思路：需同时解释「为何仍上升」与不必然被诚信质疑打垮；常见有效组合如①②（能力吸票+简历美化普遍）等——出题时自洽唯一即可。
【例题参考2·科学矛盾】
passage：沟渠似河水冲凿，普遍认为冰川融化逐渐形成；地理学家认为短时大洪水冲凿；迅速形成有地形依据，但洪水论曾被排斥因「没有那么多冰忽然融化」。
stem：最有助于解释上述矛盾的是（ ）
选项参考含：冰川拦水成湖后溃决 → 可短时释放巨量洪水而无须「忽然融化那么多冰」。
两类困难题本批宜混出，勿整批同构。
${flex}
`.trim()
}

function dedupeExplainPhenomQuestions(
  items: ExplainPhenomQuestion[],
  blockedTerms?: Set<string>,
): ExplainPhenomQuestion[] {
  const seenFp = new Set<string>()
  const seenTerm = new Set<string>(blockedTerms ?? [])
  const out: ExplainPhenomQuestion[] = []
  for (const q of items) {
    const termKey = normalizeAvoidTerm(q.term)
    if (seenFp.has(q.fingerprint) || (termKey && seenTerm.has(termKey))) continue
    seenFp.add(q.fingerprint)
    if (termKey) seenTerm.add(termKey)
    out.push(q)
  }
  return out
}

export async function requestExplainPhenomMcqs(input: {
  count?: number
  difficulty: ExplainPhenomDifficulty
  avoidTerms?: string[]
  onProgress?: (message: string) => void
}): Promise<ExplainPhenomQuestion[]> {
  const count = input.count ?? EXPLAIN_PHENOM_QUESTION_COUNT
  const difficulty = input.difficulty
  const diffLabel = explainPhenomDiffLabel(difficulty)
  return requestLogicReasonMcqBatch({
    count,
    progressLabel: `解释现象（${diffLabel}）`,
    diffLabel,
    avoidTerms: input.avoidTerms,
    onProgress: input.onProgress,
    system: EXPLAIN_PHENOM_SYSTEM + '\n\n' + CHINESE_MCQ_CORRECTNESS_RULES,
    format: explainPhenomFormat(difficulty),
    topicLabel: '解释现象主题',
    examTypeHint: '判断推理·解释现象',
    temperature: 0.52,
    tryBuild: (raw, seq) => {
      const fields = parseExplainPhenomMcqAiObject(raw)
      if (!fields) return null
      const q = buildExplainPhenomQuestionFromMcq({ ...fields, difficulty, seq })
      return q && isPlayableLogicReasonMcq(q) ? q : null
    },
  })
}
