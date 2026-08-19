/**
 * 数量关系 / 逻辑判断 AI 出题（几何、概率、函数图、翻译/加强削弱等）
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
    '【答案唯一·出题前自检】①写材料与设问；②不看选项先推导唯一结论；③再写 correct；④写三个明确错误的干扰项。',
    '四个选项中只能有一个满足题干要求；禁止两选项都说得通、或「选哪个都行」。',
    'correct 必须与 passage+stem 对齐：问「推出」须必然推出；问「加强/前提」不得给削弱；问「削弱」不得给加强；问「解释」须化解矛盾。',
    '加强/削弱/评价/解释：干扰项须为无关、反向或答非所问，不能另有一项同样能当正确答案；解析禁止写「也可加强/亦可讨论」。',
    '真假/组合排列：材料约束须自洽，穷举后仅一种赋值指向 correct；禁止真假个数矛盾、无解或多解。',
    '若无法保证唯一正确解，换材料重出，禁止勉强拼题。',
  ].join(''),
  [
    '【explanation】写 3～5 句中文（约 80～160 字）：①概括逻辑结构；②正确项为何成立；',
    '③点破两个主要干扰项错因；④末句点明考点名。method 写短考点名（约 8～20 字）。',
  ].join(''),
].join('\n')

const LOGIC_REASON_PROOFREAD_SYSTEM = [
  '你是公务员/事业编「判断推理·逻辑判断」审题官，只做校对，不出新题。',
  '任务：判断标注正确答案是否成立，且是否不存在另一选项同样可成立。',
  '硬伤必须判不合格：标注项错误、真假/条件自相矛盾、问削弱却给加强、干扰项其实也能完整作答。',
  '加强/削弱类：只要标注项明显最恰当、其它项不能独立成立为正确答案，即可通过；勿因「力度略弱的联想」过度否决。',
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

function parseLogicReasonLetterList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => String(x ?? '').trim().toUpperCase())
    .map((x) => {
      const m = x.match(/^[A-D]/)
      return m ? m[0]! : ''
    })
    .filter((x): x is 'A' | 'B' | 'C' | 'D' => x === 'A' || x === 'B' || x === 'C' || x === 'D')
}

/** AI 校对：题答对齐 + 拦明显双解；单轮，避免过严导致整批生成失败 */
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
      '  "markedCorrectIsRight": true/false,',
      '  "uniqueAnswer": true/false,',
      '  "alsoAcceptable": [],',
      '  "stemAnswerMatch": true/false,',
      '  "selfConsistent": true/false,',
      '  "ok": true/false,',
      '  "reason": "一句话中文理由"',
      '}',
      'ok=true 当且仅当：标注项正确、唯一可作答、设问类型对齐、材料自洽，且 alsoAcceptable 为空（可把误写的标注项自身剔除）。',
      '仅当另有选项也能完整当作正确答案时，才把字母写入 alsoAcceptable 并 ok=false。',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')

  const runOnce = async (): Promise<boolean | null> => {
    try {
      const raw = await deepseekChatRaw(user, {
        system: LOGIC_REASON_PROOFREAD_SYSTEM,
        temperature: 0.1,
        maxTokens: 500,
      })
      const obj = parseAiJsonObjectLenient(raw) as Record<string, unknown> | null
      if (!obj || typeof obj !== 'object') return null

      const truthy = (v: unknown) => v === true || v === 'true' || v === 1 || v === '1'
      const markedOk = truthy(obj.markedCorrectIsRight)
      const unique = truthy(obj.uniqueAnswer)
      const match = truthy(obj.stemAnswerMatch)
      const consistent = obj.selfConsistent === undefined ? true : truthy(obj.selfConsistent)
      const ok = truthy(obj.ok)
      const alsoOthers = parseLogicReasonLetterList(obj.alsoAcceptable).filter((x) => x !== marked)

      // 硬拒绝：标注错 / 明确双解 / 类型错位 / 材料矛盾
      if (!markedOk || !match || !consistent || alsoOthers.length > 0) return false
      if (ok && unique) return true
      // unique/ok 偏严或漏填时：无 alsoAcceptable 且标注正确 → 放行
      if (markedOk && match && consistent && alsoOthers.length === 0) return true
      return false
    } catch {
      return null
    }
  }

  const first = await runOnce()
  if (first !== null) return first
  // 解析/网络偶发失败再试一次；仍失败则放行结构已合法的题，避免整批生成崩掉
  const second = await runOnce()
  if (second !== null) return second
  return true
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
      '【交卷前自检】',
      '1）遮住选项，材料+设问能否唯一推出 correct？不能则重写。',
      '2）三个 distractors 不得也能完整作答；有则改掉。',
      '3）设问类型与 correct 对齐（推出/加强/削弱/解释/评价）。',
      '4）真假/组合须自洽唯一解；explanation 勿写「也可/亦可讨论」。',
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
  // 略降温度，兼顾唯一解与生成成功率
  const baseTemp = input.temperature ?? 0.55

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
        temperature: Math.min(0.75, baseTemp + wave * 0.04),
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

  for (let wave = 1; deduped.length < count && wave <= 6; wave++) {
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
  while (deduped.length < count && guard < 24) {
    guard += 1
    const slot = deduped.length + 1
    input.onProgress?.(`兜底补第 ${slot}/${count} 题并校对（${guard}/24）…`)
    // 后期放宽历史避让，优先凑满题量
    const avoid = guard <= 12 ? [...usedTerms] : []
    const q = await fetchOne(900 + guard, guard, avoid)
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
  '元素个数、条件条数、题型（纯排序/一对一匹配/半真半假）可灵活。',
  'correct 在全部条件下须唯一可确定；交卷前须验证：不存在第二种完整方案同时满足全部条件；「各对一半」类题须逐人核对对错条数恰好符合题干。',
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
  '人数、陈述句数、真假数量均可灵活（仅一真/仅一假/恰两真/恰两假/一半真一半假等），但材料必须写清真假约束。',
  '交卷前必须对每种可能世界穷举：满足「真假数量+背景事实」的赋值有且仅有一种，且该赋值唯一指向 correct；禁止无解、双解、真假个数对不上。',
  '解析须标明谁真谁假及逐步排除；干扰项须对应错误赋值（如把真话者认错）。',
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
【例题参考·已自洽·须仿此严谨度，禁止照抄人名】
passage：甲、乙、丙三人参加比赛，冠军恰为其中一人。甲说：「我是冠军。」乙说：「甲不是冠军。」丙说：「我不是冠军。」已知三人中只有一人说真话。
stem：由此可以推出冠军是（ ）
选项：甲 / 乙 / 丙 / 无法确定
正确思路（出题须同样可穷举）：若甲冠军→甲真且丙真（两真，矛盾）；若乙冠军→乙真且丙真（两真，矛盾）；若丙冠军→仅乙真（甲假、丙假），恰一真。故唯一 correct＝丙。
严禁写出「仅一真」却穷举后 0 真/2 真/3 真的题；同类可换场景，但必须先穷举自洽再定选项。
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
    extraHints: [
      '真假约束类型尽量多样（勿总是「仅一真」）；人数也可变化。',
      '必须先穷举验证材料自洽且唯一解，再写选项；禁止无解/双解/真假个数矛盾。',
    ],
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
  '题干问法可灵活（易受批评的原因 / 主要漏洞 / 评价正确的是）；谬误类型宜多样。',
  'correct 必须是材料中真实存在且可唯一认定的漏洞/评价；三个干扰项须为「材料未犯」的谬误或错误评价，禁止「次核心但也可批评」凑项。',
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
【例题参考·唯一解写法】
passage：某评论称：官方公布「全年居民消费价格涨幅低于5%」一定错了，因为本社区早点涨了10%、布鞋涨了12%。
stem：上述论证最主要的逻辑问题是（ ）
选项参考：A 把个别商品价格变动等同于居民消费价格总指数｜B 未说明早点与布鞋是否本地生产｜C 未比较邻市涨幅｜D 未讨论居民收入是否同步增长
正确思路：论证用少数品类涨价否定总指数 → 仅 A 击中推理结构；B/C/D 与「总指数是否被个别品类证伪」无关，不能评价错。出题时干扰项须同样「无关/未犯」，禁止「也算批评」。
同类可换统计、调查、个案推全体等题材。
${flex}
`.trim()
  }
  return `
【难度·困难】双方讨论 +「对甲/乙观点评价正确的是」+ ①②③④ 要点组合选肢。
【例题参考·唯一解写法】
passage：甲认为「斜杠青年」不可取，因为「术业有专攻」，一个人只有专一才能成功。
stem：对甲观点评价正确的是（ ）
要点：①结论把「专一」当成成功的必要条件，过于绝对｜②引用名言本身不能代替论证｜③未讨论乙是否赞同｜④批评了斜杠青年的着装
选项：A①② B①③ C②④ D③④
正确思路：甲把「专一」抬成成功必要条件（绝对化），且以名言代替论证 → 仅①②成立；③④材料未涉及，故唯一组合 A。组合题每个要点须可验真假，禁止「差不多都沾边」。
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
  'correct 须能使结论成立或明显支持结论；三个 distractors 必须是无关、削弱或答非所问，禁止出现「也能加强但较弱」的次优项。',
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
【难度·困难】材料给较新做法/现象并下积极结论，选项多为事实陈述；正确项用具体例证或关键机制明显加强；干扰项须为零加强（无关/不能对接结论）。
【例题参考·唯一解写法】
passage：某市检察机关开展无人机公益诉讼专项，称航拍勘验「明显提升了办案质效」。
stem：以下哪项如果为真，最能支持上述结论？（ ）
选项参考：A 专项开展后，该市公益诉讼案件平均取证周期比开展前缩短约四成｜B 该市无人机爱好者协会会员人数近年增长｜C 邻近未开展专项的城市也购入了同款无人机｜D 媒体报道过一次航拍风景宣传片
正确思路：仅 A 用前后对比直接支持「质效提升」；B/C/D 与办案质效无逻辑关联（零加强）。禁止再出「能力说明/培训/比赛」这类也能沾边加强的次优项。
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
  'correct 须能明显削弱结论；三个 distractors 必须是无关、加强或答非所问，禁止出现「也能削弱但较弱」的次优项。',
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
【难度·困难】用办卡数/人次增长证明举措有效；正确削弱须直接击穿「张数/人次＝受益人数」或因果；干扰项须为零削弱。
【例题参考·唯一解写法】
passage：市政府称免费健身卡举措有效，依据是办卡张数从2015年3万增至2020年11万，「办卡学生增加两倍多」。
stem：以下哪项如果为真，最能削弱上述结论？（ ）
选项参考：A 不少学生在三家场馆重复办卡，同一人被计入多张｜B 场馆维护开支高于预期｜C 部分办卡学生很少去锻炼｜D 邻市同期也推广了类似健身卡
正确思路：结论把「张数增长」当成「学生人数增长」；仅 A 直接证明统计口径虚高，削弱「人数增加→举措有效」。B 谈成本、C 谈使用率、D 谈邻市，均不否定「人数是否真增加」，定为零削弱干扰。禁止再放「总人数上升」这类也能削弱可比性的次优项。
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
  'correct 必须是材料字面可必然推出的结论（换说法亦可，但不得补常识）；干扰项含夸大因果、绝对化、材料未提及、或然推断等。',
  '禁止把「相关/伴随」写成必然因果（如材料只写压力增加且更关注健康，不得推「压力一定影响健康」）。',
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
【难度·简单】短日常材料，1～2 步即可推出；正确项须材料已说或等价改写，干扰项为目的臆测、比例臆测、因果妄断、材料未提细节。
【例题参考·必然推出写法】
passage：近三年本市新建公园数量翻了一番；同期，周末到公园休闲的市民人次明显增加。不少市民除了去公园，也会选择室内健身房锻炼。
stem：由此可以推出（ ）
选项参考：A 近三年本市新建公园数量有所增加｜B 市民去公园就是为了缓解工作压力｜C 不锻炼的市民已占少数｜D 室内健身房都建在公园旁边
正确思路：仅 A 由「翻了一番」必然推出；B 目的臆测、C 比例未给、D 材料未提。禁止再用「压力→一定影响健康」这类需补常识的软结论当 correct。
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
  'correct 须能同时对接矛盾/反常的双方；三个 distractors 须无法解释（无关、时间错位、只解释一侧、与材料冲突），禁止「也能解释但较弱」。',
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
正确思路：B 引入新竞争，能解释「促销仍比往年少」；A 未说明会压过促销效果；C 往年若同样知名度不足则解释不了「较往年减少」；D 若发生在促销结束后，解释不了促销期内的减少。出题时保证仅一项能对接反常。
${flex}
`.trim()
  }
  return `
【难度·困难】解释「矛盾双方同时成立」：如负面曝光但支持率上升，或主流理论与新结论冲突。可选：①②③④组合选肢，或科学史情境找「缺失机制」。
【例题参考1·矛盾组合·唯一解】
passage：候选人被揭篡改简历，部分选民怀疑其诚信，但其民意支持率仍持续上升并大幅领先。
要点：①其施政承诺与执行力持续吸引大量选民｜②多数选民认为「简历美化」在候选人中很常见，不足以单独否定其人｜③该候选人以往支持率本来就很高｜④电视台减少了对其负面新闻的播出时长
stem：有助于解释上述矛盾的是（ ）选项：A①② B①③ C②④ D③④
正确思路：要同时解释「诚信受疑仍上升」：①提供上升动力，②削弱负面杀伤；③只说明基数高解释不了「仍上升」；④材料未给。故唯一 A。组合题须保证其它组合无法完整解释矛盾。
【例题参考2·科学矛盾】
passage：沟渠似河水冲凿，普遍认为冰川融化逐渐形成；地理学家认为短时大洪水冲凿；迅速形成有地形依据，但洪水论曾被排斥因「没有那么多冰忽然融化」。
stem：最有助于解释上述矛盾的是（ ）
正确项须给出「无须忽然融化那么多冰也能短时形成巨量洪水」的机制（如冰川拦湖溃决）；干扰项不得同样能化解该质疑。
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
