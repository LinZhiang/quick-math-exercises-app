/**
 * 语文类 AI 出题（成语、诗词、常识、阅读等）
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

【出处】
- sourceTitle 必须为材料中的文章标题
- explanation 1～2 句点明出处与依据

【JSON 字段】
questionType, sourceTitle, term, stem, correct, distractors[3], explanation

【JSON 示例】
{"questionType":"sentence-fill","sourceTitle":"2025年第19期《求是》杂志发表习近平重要文章","term":"是中华民族共同体形成和发展的历史根基","stem":"各民族血脉相融，_______。","correct":"是中华民族共同体形成和发展的历史根基","distractors":["是各民族交往交流交融不断深化的现实基础","构成中华文明多元一体格局的文化基因","推动统一的多民族国家巩固发展的内生动力"],"explanation":"出处：求是文章。对应「血脉相融」条目原文。"}
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
      `仅成功生成 ${deduped.length}/${count} 道语句填充题（需≥12字挖空、多处改写干扰项），请稍后重试`,
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
- 从材料中选取一段连贯原文，拆成恰好 **5** 段（segments）
- **标点必须照搬原文**（逗号、顿号、分号、句号等一律保留原样）；禁止擅自改标点
- 五段按正确顺序拼接后的整段文字，**末尾必须以句号「。」（或！？）收尾**；中间各段可以逗号等收尾
- 每段应是完整意群；去掉 ** 加粗标记
- **禁止过短碎片**：如只拆出「第一」「第二」；若原文是「提出四点主张：第一……。第二……。」，应把「第一……。」整句作为一段
- segments 数组按 **界面展示顺序** 给出：必须已经打乱，对应序号 1、2、3、4、5
- 禁止把无关句子拼在一起；五段合起来应能还原为材料中的连贯表述

【正确答案 correct】
- 字符串格式固定为「数字、数字、数字、数字、数字」，如「3、4、5、2、1」
- 含义：按该排列阅读 segments[序号-1]，即可还原原文逻辑顺序
- 例：若正确阅读顺序是展示编号 3→4→5→2→1，则 correct 为「3、4、5、2、1」
- 必须是 1～5 的全排列，不得重复、不得缺号
- distractors 可省略（服务端会补强干扰序）；若填写则须为另 3 个不同全排列

【出处与题干】
- sourceTitle 必须为材料中的文章标题
- stem 可写：「下列五段文字顺序已打乱。请点选片段填入下方排序区，可拖动调整，完成后点击确认。」
- term 用该段原文前 20～40 字作去重键（勿与本批其它题重复）
- explanation 1～2 句点明出处，并可简述正确语序依据（因果/总—分/时间等）

【JSON 字段】
questionType, sourceTitle, term, stem, segments[5], correct, explanation

【JSON 示例】
{"questionType":"sentence-order","sourceTitle":"2025年第19期《求是》杂志发表习近平重要文章","term":"各民族血脉相融是中华民族共同体","stem":"下列五段文字顺序已打乱。请点选片段填入下方排序区，可拖动调整，完成后点击确认。","segments":["各民族共同开拓了祖国的锦绣河山，","各民族血脉相融，是中华民族共同体形成和发展的历史根基。","各民族共同书写了悠久历史，","各民族共同创造了灿烂文化，","各民族共同培育了伟大精神。"],"correct":"2、1、3、4、5","explanation":"出处：求是文章。先总起「血脉相融」与根基，再并列展开共同开拓、书写、创造、培育。"}
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
    `请根据下列「${input.scopeLabel}」时政材料，生成 **${count} 道** 语句排序题（学员拖动/点击排序，非四选一）。`,
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
          `请根据「${input.scopeLabel}」时政材料再生成 1 道语句排序题（拖动/点击排序）。`,
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
      `仅成功生成 ${deduped.length}/${count} 道语句排序题（需 5 段原文语段且整段以句末收尾），请稍后重试`,
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
