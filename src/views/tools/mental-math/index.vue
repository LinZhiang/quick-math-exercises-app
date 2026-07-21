<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  PRACTICE_HUB_NAV_ITEMS,
  PRACTICE_HUB_SECTIONS,
  practiceHubGroupHasMultiple,
  practiceHubGroupIdForSection,
  practiceHubSectionsInGroup,
  type PracticeHubGroupId,
  type PracticeHubSectionId,
} from '@/constants/practice-hub-sections'
import MentalMathPracticeGuide from '@/views/tools/mental-math/components/MentalMathPracticeGuide.vue'
import PracticeSessionLogPanel from '@/views/tools/mental-math/components/PracticeSessionLogPanel.vue'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'
import TwentyFourPointPanel from '@/views/tools/mental-math/components/TwentyFourPointPanel.vue'
import SudokuPanel from '@/views/tools/mental-math/components/SudokuPanel.vue'
import CircleGrammarPanel from '@/views/tools/mental-math/components/CircleGrammarPanel.vue'
import ShortenSentencePanel from '@/views/tools/mental-math/components/ShortenSentencePanel.vue'
import DataAnalysisPanel from '@/views/tools/mental-math/components/DataAnalysisPanel.vue'
import DataAnalysisGrowthPanel from '@/views/tools/mental-math/components/DataAnalysisGrowthPanel.vue'
import DataAnalysisGrowthInterYearPanel from '@/views/tools/mental-math/components/DataAnalysisGrowthInterYearPanel.vue'
import DataAnalysisGrowthAvgAnnualPanel from '@/views/tools/mental-math/components/DataAnalysisGrowthAvgAnnualPanel.vue'
import DataAnalysisGrowthMixedPanel from '@/views/tools/mental-math/components/DataAnalysisGrowthMixedPanel.vue'
import DataAnalysisProportionBasicPanel from '@/views/tools/mental-math/components/DataAnalysisProportionBasicPanel.vue'
import DataAnalysisProportionBasePanel from '@/views/tools/mental-math/components/DataAnalysisProportionBasePanel.vue'
import DataAnalysisAverageBasicPanel from '@/views/tools/mental-math/components/DataAnalysisAverageBasicPanel.vue'
import DataAnalysisAverageBasePanel from '@/views/tools/mental-math/components/DataAnalysisAverageBasePanel.vue'
import DataAnalysisMultipleBasicPanel from '@/views/tools/mental-math/components/DataAnalysisMultipleBasicPanel.vue'
import DataAnalysisMultipleBasePanel from '@/views/tools/mental-math/components/DataAnalysisMultipleBasePanel.vue'
import DataAnalysisIndexPanel from '@/views/tools/mental-math/components/DataAnalysisIndexPanel.vue'
import DataAnalysisPullPanel from '@/views/tools/mental-math/components/DataAnalysisPullPanel.vue'
import DataAnalysisSurplusPanel from '@/views/tools/mental-math/components/DataAnalysisSurplusPanel.vue'
import DataAnalysisStrategyGuideButton from '@/views/tools/mental-math/components/DataAnalysisStrategyGuideButton.vue'
import DivisibilityJudgePanel from '@/views/tools/mental-math/components/DivisibilityJudgePanel.vue'
import PrimeCompositePanel from '@/views/tools/mental-math/components/PrimeCompositePanel.vue'
import GcdLcmPanel from '@/views/tools/mental-math/components/GcdLcmPanel.vue'
import RatioMultPanel from '@/views/tools/mental-math/components/RatioMultPanel.vue'
import RemPropPanel from '@/views/tools/mental-math/components/RemPropPanel.vue'
import SubElimPanel from '@/views/tools/mental-math/components/SubElimPanel.vue'
import EquationMethodPanel from '@/views/tools/mental-math/components/EquationMethodPanel.vue'
import SpecialValuePanel from '@/views/tools/mental-math/components/SpecialValuePanel.vue'
import RatioMethodPanel from '@/views/tools/mental-math/components/RatioMethodPanel.vue'
import CrossMethodPanel from '@/views/tools/mental-math/components/CrossMethodPanel.vue'
import SumDiffRatioPanel from '@/views/tools/mental-math/components/SumDiffRatioPanel.vue'
import GeometryPanel from '@/views/tools/mental-math/components/GeometryPanel.vue'
import RightTrianglePanel from '@/views/tools/mental-math/components/RightTrianglePanel.vue'
import SimilarTrianglePanel from '@/views/tools/mental-math/components/SimilarTrianglePanel.vue'
import ColoringPanel from '@/views/tools/mental-math/components/ColoringPanel.vue'
import OrdinaryTravelPanel from '@/views/tools/mental-math/components/OrdinaryTravelPanel.vue'
import MeetPursuePanel from '@/views/tools/mental-math/components/MeetPursuePanel.vue'
import BoatCurrentPanel from '@/views/tools/mental-math/components/BoatCurrentPanel.vue'
import OrdinaryWorkPanel from '@/views/tools/mental-math/components/OrdinaryWorkPanel.vue'
import CooperativeWorkPanel from '@/views/tools/mental-math/components/CooperativeWorkPanel.vue'
import ProfitCalcPanel from '@/views/tools/mental-math/components/ProfitCalcPanel.vue'
import ProfitRatePanel from '@/views/tools/mental-math/components/ProfitRatePanel.vue'
import ConcentrationPanel from '@/views/tools/mental-math/components/ConcentrationPanel.vue'
import PermCombBasicPanel from '@/views/tools/mental-math/components/PermCombBasicPanel.vue'
import PermCombConstraintPanel from '@/views/tools/mental-math/components/PermCombConstraintPanel.vue'
import PermCombClassicPanel from '@/views/tools/mental-math/components/PermCombClassicPanel.vue'
import ProbabilityPanel from '@/views/tools/mental-math/components/ProbabilityPanel.vue'
import InclusionExclusionPanel from '@/views/tools/mental-math/components/InclusionExclusionPanel.vue'
import SequencePanel from '@/views/tools/mental-math/components/SequencePanel.vue'
import ExtremumPanel from '@/views/tools/mental-math/components/ExtremumPanel.vue'
import DatePanel from '@/views/tools/mental-math/components/DatePanel.vue'
import AgePanel from '@/views/tools/mental-math/components/AgePanel.vue'
import ClockPanel from '@/views/tools/mental-math/components/ClockPanel.vue'
import YingKuiPanel from '@/views/tools/mental-math/components/YingKuiPanel.vue'
import ChickenRabbitPanel from '@/views/tools/mental-math/components/ChickenRabbitPanel.vue'
import FunctionGraphPanel from '@/views/tools/mental-math/components/FunctionGraphPanel.vue'
import CompetitionPanel from '@/views/tools/mental-math/components/CompetitionPanel.vue'
import ReversePanel from '@/views/tools/mental-math/components/ReversePanel.vue'
import SectionalPanel from '@/views/tools/mental-math/components/SectionalPanel.vue'
import GraphicReasoningCell from '@/views/tools/graphic-reasoning/components/GraphicReasoningCell.vue'
import {
  clampGraphicReasoningScore,
  generateGraphicReasoningQuestion,
  getGraphicReasoningQuestionFingerprint,
  getGraphicReasoningModeConfig,
  GRAPHIC_REASONING_MODES,
  GRAPHIC_REASONING_TIME_CORRECT_BONUS_SEC,
  GRAPHIC_REASONING_TIME_WRONG_PENALTY_SEC,
  type GraphicReasoningAnswerRecord,
  type GraphicReasoningMode,
  type GraphicReasoningQuestion,
} from '@/utils/graphicReasoningPractice'
import {
  clampMentalMathScore,
  generateMentalMathQuestion,
  getMentalMathQuestionFingerprint,
  getMentalMathModeConfig,
  MENTAL_MATH_TIME_CORRECT_BONUS_SEC,
  MENTAL_MATH_TIME_WRONG_PENALTY_SEC,
  MENTAL_MATH_ARITHMETIC_MODES,
  MENTAL_MATH_DIVISIBILITY_MODES,
  MENTAL_MATH_FRACTION_MODES,
  MENTAL_MATH_LIFE_SENSE_MODES,
  MENTAL_MATH_GRAMMAR_JUDGMENT_MODES,
  MENTAL_MATH_POWER_MODES,
  MENTAL_MATH_SQUARE_CUBE_MODES,
  isLifeSensePracticeMode,
  isGrammarJudgmentPracticeMode,
  type MentalMathAnswerRecord,
  type MentalMathMode,
  type MentalMathQuestion,
} from '@/utils/mentalMathPractice'
import {
  playMentalMathCorrectSound,
  playMentalMathStartSound,
  playMentalMathWrongSound,
} from '@/utils/mentalMathSounds'
import {
  prepareQbPerfectMidi,
  startQbPerfectMidi,
  stopQbPerfectMidi,
  tryPlayQbPerfectMidiSync,
} from '@/utils/qb-perfect-sound'
import {
  clampTwentyFourPointScore,
  generateTwentyFourPointPuzzle,
  getTwentyFourPointModeConfig,
  getTwentyFourQuestionFingerprint,
  isTwentyFourPointMode,
  TWENTY_FOUR_POINT_MODES,
  validateTwentyFourExpression,
  type TwentyFourPointMode,
  type TwentyFourPointQuestion,
} from '@/utils/twentyFourPointPractice'
import {
  clampSudokuScore,
  formatSudokuGrid,
  generateSudokuPuzzle,
  getSudokuModeConfig,
  getSudokuQuestionFingerprint,
  isSudokuMode,
  SUDOKU_MODES,
  validateSudokuAnswer,
  type SudokuMode,
  type SudokuQuestion,
} from '@/utils/sudokuPractice'
import {
  CIRCLE_GRAMMAR_MODES,
  clampCircleGrammarScore,
  formatCircleGrammarExpected,
  formatCircleGrammarMarks,
  generateCircleGrammarQuestion,
  getCircleGrammarModeConfig,
  getCircleGrammarQuestionFingerprint,
  isCircleGrammarMode,
  validateCircleGrammarAnswer,
  type CircleGrammarMark,
  type CircleGrammarMode,
  type CircleGrammarQuestion,
} from '@/utils/circleGrammarPractice'
import {
  SHORTEN_SENTENCE_MODES,
  clampShortenSentenceScore,
  generateShortenSentenceQuestion,
  getShortenSentenceModeConfig,
  getShortenSentenceQuestionFingerprint,
  isShortenSentenceMode,
  validateShortenSentenceAnswer,
  type ShortenSentenceMode,
  type ShortenSentenceQuestion,
} from '@/utils/shortenSentencePractice'
import ChinesePracticeSection from '@/views/tools/chinese-practice/ChinesePracticeSection.vue'
import PwaInstallPanel from '@/components/PwaInstallPanel.vue'
import { clearWenguSessionOnAiLeave } from '@/utils/wenguAuthStore'
import MentalMathWrongBookPanel from '@/views/tools/mental-math/components/MentalMathWrongBookPanel.vue'
import { upsertMentalMathWrong } from '@/utils/mentalMathWrongBook'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'

type Phase = 'select' | 'countdown' | 'playing' | 'finished'
type CountdownStep = 3 | 2 | 1 | 'GO'
type PracticeMode =
  | MentalMathMode
  | GraphicReasoningMode
  | TwentyFourPointMode
  | SudokuMode
  | CircleGrammarMode
  | ShortenSentenceMode

const COUNTDOWN_STEPS: CountdownStep[] = [3, 2, 1, 'GO']

const route = useRoute()
const phase = ref<Phase>('select')
const activeOutlineSection = ref<PracticeHubSectionId>('log')
const activeMode = ref<PracticeMode | null>(null)
const score = ref(0)
const question = ref<MentalMathQuestion | null>(null)
const graphicQuestion = ref<GraphicReasoningQuestion | null>(null)
const twentyFourQuestion = ref<TwentyFourPointQuestion | null>(null)
const twentyFourPanelRef = ref<InstanceType<typeof TwentyFourPointPanel> | null>(null)
const sudokuQuestion = ref<SudokuQuestion | null>(null)
const sudokuPanelRef = ref<InstanceType<typeof SudokuPanel> | null>(null)
const circleGrammarQuestion = ref<CircleGrammarQuestion | null>(null)
const circleGrammarPanelRef = ref<InstanceType<typeof CircleGrammarPanel> | null>(null)
const shortenSentenceQuestion = ref<ShortenSentenceQuestion | null>(null)
const shortenSentencePanelRef = ref<InstanceType<typeof ShortenSentencePanel> | null>(null)
const chinesePracticeRef = ref<InstanceType<typeof ChinesePracticeSection> | null>(null)
const dataAnalysisPanelRef = ref<InstanceType<typeof DataAnalysisPanel> | null>(null)
const dataAnalysisGrowthPanelRef = ref<InstanceType<typeof DataAnalysisGrowthPanel> | null>(null)
const dataAnalysisGrowthInterYearPanelRef = ref<InstanceType<
  typeof DataAnalysisGrowthInterYearPanel
> | null>(null)
const dataAnalysisGrowthAvgAnnualPanelRef = ref<InstanceType<
  typeof DataAnalysisGrowthAvgAnnualPanel
> | null>(null)
const dataAnalysisGrowthMixedPanelRef = ref<InstanceType<
  typeof DataAnalysisGrowthMixedPanel
> | null>(null)
const dataAnalysisProportionBasicPanelRef = ref<InstanceType<
  typeof DataAnalysisProportionBasicPanel
> | null>(null)
const dataAnalysisProportionBasePanelRef = ref<InstanceType<
  typeof DataAnalysisProportionBasePanel
> | null>(null)
const dataAnalysisAverageBasicPanelRef = ref<InstanceType<
  typeof DataAnalysisAverageBasicPanel
> | null>(null)
const dataAnalysisAverageBasePanelRef = ref<InstanceType<
  typeof DataAnalysisAverageBasePanel
> | null>(null)
const dataAnalysisMultipleBasicPanelRef = ref<InstanceType<
  typeof DataAnalysisMultipleBasicPanel
> | null>(null)
const dataAnalysisMultipleBasePanelRef = ref<InstanceType<
  typeof DataAnalysisMultipleBasePanel
> | null>(null)
const dataAnalysisIndexPanelRef = ref<InstanceType<typeof DataAnalysisIndexPanel> | null>(
  null,
)
const dataAnalysisPullPanelRef = ref<InstanceType<typeof DataAnalysisPullPanel> | null>(null)
const dataAnalysisSurplusPanelRef = ref<InstanceType<typeof DataAnalysisSurplusPanel> | null>(
  null,
)
const divisibilityJudgePanelRef = ref<InstanceType<typeof DivisibilityJudgePanel> | null>(null)
const primeCompositePanelRef = ref<InstanceType<typeof PrimeCompositePanel> | null>(null)
const gcdLcmPanelRef = ref<InstanceType<typeof GcdLcmPanel> | null>(null)
const ratioMultPanelRef = ref<InstanceType<typeof RatioMultPanel> | null>(null)
const remPropPanelRef = ref<InstanceType<typeof RemPropPanel> | null>(null)
const subElimPanelRef = ref<InstanceType<typeof SubElimPanel> | null>(null)
const equationMethodPanelRef = ref<InstanceType<typeof EquationMethodPanel> | null>(null)
const specialValuePanelRef = ref<InstanceType<typeof SpecialValuePanel> | null>(null)
const ratioMethodPanelRef = ref<InstanceType<typeof RatioMethodPanel> | null>(null)
const crossMethodPanelRef = ref<InstanceType<typeof CrossMethodPanel> | null>(null)
const sumDiffRatioPanelRef = ref<InstanceType<typeof SumDiffRatioPanel> | null>(null)
const geometryPanelRef = ref<InstanceType<typeof GeometryPanel> | null>(null)
const rightTrianglePanelRef = ref<InstanceType<typeof RightTrianglePanel> | null>(null)
const similarTrianglePanelRef = ref<InstanceType<typeof SimilarTrianglePanel> | null>(null)
const coloringPanelRef = ref<InstanceType<typeof ColoringPanel> | null>(null)
const ordinaryTravelPanelRef = ref<InstanceType<typeof OrdinaryTravelPanel> | null>(null)
const meetPursuePanelRef = ref<InstanceType<typeof MeetPursuePanel> | null>(null)
const boatCurrentPanelRef = ref<InstanceType<typeof BoatCurrentPanel> | null>(null)
const ordinaryWorkPanelRef = ref<InstanceType<typeof OrdinaryWorkPanel> | null>(null)
const cooperativeWorkPanelRef = ref<InstanceType<typeof CooperativeWorkPanel> | null>(null)
const profitCalcPanelRef = ref<InstanceType<typeof ProfitCalcPanel> | null>(null)
const profitRatePanelRef = ref<InstanceType<typeof ProfitRatePanel> | null>(null)
const concentrationPanelRef = ref<InstanceType<typeof ConcentrationPanel> | null>(null)
const permCombBasicPanelRef = ref<InstanceType<typeof PermCombBasicPanel> | null>(null)
const permCombConstraintPanelRef = ref<InstanceType<typeof PermCombConstraintPanel> | null>(null)
const permCombClassicPanelRef = ref<InstanceType<typeof PermCombClassicPanel> | null>(null)
const probabilityPanelRef = ref<InstanceType<typeof ProbabilityPanel> | null>(null)
const inclusionExclusionPanelRef = ref<InstanceType<typeof InclusionExclusionPanel> | null>(null)
const sequencePanelRef = ref<InstanceType<typeof SequencePanel> | null>(null)
const extremumPanelRef = ref<InstanceType<typeof ExtremumPanel> | null>(null)
const datePanelRef = ref<InstanceType<typeof DatePanel> | null>(null)
const agePanelRef = ref<InstanceType<typeof AgePanel> | null>(null)
const clockPanelRef = ref<InstanceType<typeof ClockPanel> | null>(null)
const yingKuiPanelRef = ref<InstanceType<typeof YingKuiPanel> | null>(null)
const chickenRabbitPanelRef = ref<InstanceType<typeof ChickenRabbitPanel> | null>(null)
const functionGraphPanelRef = ref<InstanceType<typeof FunctionGraphPanel> | null>(null)
const competitionPanelRef = ref<InstanceType<typeof CompetitionPanel> | null>(null)
const reversePanelRef = ref<InstanceType<typeof ReversePanel> | null>(null)
const sectionalPanelRef = ref<InstanceType<typeof SectionalPanel> | null>(null)
/** 资料分析「增长」子模块折叠：默认收起 */
const dataAnalysisGrowthFoldOpen = ref(false)
/** 资料分析「比重」子模块折叠：默认收起 */
const dataAnalysisProportionFoldOpen = ref(false)
/** 资料分析「平均数」子模块折叠：默认收起 */
const dataAnalysisAverageFoldOpen = ref(false)
/** 资料分析「倍数与翻番」子模块折叠：默认收起 */
const dataAnalysisMultipleFoldOpen = ref(false)
/** 资料分析「指数」子模块折叠：默认收起 */
const dataAnalysisIndexFoldOpen = ref(false)
/** 资料分析「拉动增长和比例」子模块折叠：默认收起 */
const dataAnalysisPullFoldOpen = ref(false)
/** 资料分析「顺差与逆差」子模块折叠：默认收起 */
const dataAnalysisSurplusFoldOpen = ref(false)
/** 资料分析「百分数与百分点」折叠：默认收起 */
const dataAnalysisPercentFoldOpen = ref(false)
/** 其他运算各子模块折叠：默认收起 */
const opOtherInclusionFoldOpen = ref(false)
const opOtherSequenceFoldOpen = ref(false)
const opOtherExtremumFoldOpen = ref(false)
const opOtherDateFoldOpen = ref(false)
const opOtherAgeFoldOpen = ref(false)
const opOtherClockFoldOpen = ref(false)
const opOtherYingKuiFoldOpen = ref(false)
const opOtherChickenRabbitFoldOpen = ref(false)
const opOtherFunctionGraphFoldOpen = ref(false)
const opOtherCompetitionFoldOpen = ref(false)
const opOtherReverseFoldOpen = ref(false)
const opOtherSectionalFoldOpen = ref(false)
/** 运算技巧「整除及其性质」折叠：默认收起 */
const opSkillDivFoldOpen = ref(false)
const opSkillRemFoldOpen = ref(false)
const opSkillSubElimFoldOpen = ref(false)
const opSkillEqMethodFoldOpen = ref(false)
const opSkillSpecValFoldOpen = ref(false)
const opSkillRatioMethodFoldOpen = ref(false)
const opSkillCrossMethodFoldOpen = ref(false)
const opHighfreqSumDiffRatioFoldOpen = ref(false)
const opHighfreqGeometryFoldOpen = ref(false)
const opHighfreqTravelFoldOpen = ref(false)
const opHighfreqWorkFoldOpen = ref(false)
const opHighfreqProfitFoldOpen = ref(false)
const opHighfreqConcentrationFoldOpen = ref(false)
const opHighfreqPermCombFoldOpen = ref(false)
const questionSeq = ref(0)
const records = ref<MentalMathAnswerRecord[]>([])
const graphicRecords = ref<GraphicReasoningAnswerRecord[]>([])
const remainingMs = ref(0)
const totalMs = ref(0)
/** 不计倒计时时累计用时（毫秒）；圈语法为答题段累计，审题时暂停 */
const elapsedMs = ref(0)
/** 圈语法：当前答题段开始时间 */
let circleSegmentStartMs = 0
/** 圈语法：已累计（不含当前段） */
let circleAccumulatedMs = 0
const circleTimerRunning = ref(false)
/** 圈语法 / 缩句：提交后展示答案、等待点下一题 */
const circleGrammarReviewing = ref(false)
const circleGrammarFeedbackDetail = ref('')
const shortenSentenceReviewing = ref(false)
const shortenSentenceFeedbackDetail = ref('')
const shortenSentenceLastAnswer = ref('')
const feedback = ref<'correct' | 'wrong' | null>(null)
const acceptingInput = ref(true)
const countdownValue = ref<CountdownStep | null>(null)
const lastQuestionFingerprint = ref<string | null>(null)
const sessionQuestionFingerprints = ref(new Set<string>())
/** 满分提前结束（得分达到上限） */
const finishedByPerfect = ref(false)

let timerHandle: ReturnType<typeof setInterval> | null = null
let feedbackTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setTimeout> | null = null
let sessionStartMs = 0
/** 本局是否已记入「完成一轮」统计，防止 finishSession 重复调用 */
let sessionCompletionRecorded = false

function isGraphicMode(mode: PracticeMode): mode is GraphicReasoningMode {
  return mode === 'graphic'
}

const isTwentyFourSession = computed(
  () => activeMode.value != null && isTwentyFourPointMode(activeMode.value),
)

const isSudokuSession = computed(
  () => activeMode.value != null && isSudokuMode(activeMode.value),
)

const isCircleGrammarSession = computed(
  () => activeMode.value != null && isCircleGrammarMode(activeMode.value),
)

const isShortenSentenceSession = computed(
  () => activeMode.value != null && isShortenSentenceMode(activeMode.value),
)

const isGraphicSession = computed(
  () => activeMode.value != null && isGraphicMode(activeMode.value),
)
const isLifeSenseSession = computed(
  () =>
    activeMode.value != null &&
    !isGraphicMode(activeMode.value) &&
    !isTwentyFourPointMode(activeMode.value) &&
    !isSudokuMode(activeMode.value) &&
    !isCircleGrammarMode(activeMode.value) &&
    !isShortenSentenceMode(activeMode.value) &&
    isLifeSensePracticeMode(activeMode.value as MentalMathMode),
)
const isGrammarJudgmentSession = computed(
  () =>
    activeMode.value != null &&
    !isGraphicMode(activeMode.value) &&
    !isTwentyFourPointMode(activeMode.value) &&
    !isSudokuMode(activeMode.value) &&
    !isCircleGrammarMode(activeMode.value) &&
    !isShortenSentenceMode(activeMode.value) &&
    isGrammarJudgmentPracticeMode(activeMode.value as MentalMathMode),
)

const modeConfig = computed(() => {
  if (!activeMode.value) return null
  if (isGraphicMode(activeMode.value)) {
    return getGraphicReasoningModeConfig(activeMode.value)
  }
  if (isTwentyFourPointMode(activeMode.value)) {
    return getTwentyFourPointModeConfig(activeMode.value)
  }
  if (isSudokuMode(activeMode.value)) {
    return getSudokuModeConfig(activeMode.value)
  }
  if (isCircleGrammarMode(activeMode.value)) {
    return getCircleGrammarModeConfig(activeMode.value)
  }
  if (isShortenSentenceMode(activeMode.value)) {
    return getShortenSentenceModeConfig(activeMode.value)
  }
  return getMentalMathModeConfig(activeMode.value)
})

/** 圈语法 / 缩句等：不计倒计时，只显示累计用时 */
const isElapsedOnlySession = computed(
  () =>
    (isCircleGrammarSession.value || isShortenSentenceSession.value) &&
    (modeConfig.value?.durationSec ?? 0) <= 0,
)

const circleGrammarQuestionCount = computed(() =>
  isCircleGrammarSession.value && activeMode.value && isCircleGrammarMode(activeMode.value)
    ? getCircleGrammarModeConfig(activeMode.value).questionCount
    : 5,
)

const circleGrammarQuestionIndex = computed(() =>
  records.value.length + (circleGrammarReviewing.value ? 0 : 1),
)

const circleGrammarIsLastReview = computed(
  () =>
    circleGrammarReviewing.value &&
    records.value.length >= circleGrammarQuestionCount.value,
)

const shortenSentenceQuestionCount = computed(() =>
  isShortenSentenceSession.value && activeMode.value && isShortenSentenceMode(activeMode.value)
    ? getShortenSentenceModeConfig(activeMode.value).questionCount
    : 5,
)

const shortenSentenceQuestionIndex = computed(() =>
  records.value.length + (shortenSentenceReviewing.value ? 0 : 1),
)

const shortenSentenceIsLastReview = computed(
  () =>
    shortenSentenceReviewing.value &&
    records.value.length >= shortenSentenceQuestionCount.value,
)

const elapsedQuestionCount = computed(() =>
  isShortenSentenceSession.value
    ? shortenSentenceQuestionCount.value
    : circleGrammarQuestionCount.value,
)

const progressPercent = computed(() => {
  if (isElapsedOnlySession.value) {
    const total = elapsedQuestionCount.value
    if (total <= 0) return 0
    return Math.max(0, Math.min(100, (records.value.length / total) * 100))
  }
  if (totalMs.value <= 0) return 0
  return Math.max(0, Math.min(100, (remainingMs.value / totalMs.value) * 100))
})

const sessionRecords = computed(() =>
  isGraphicSession.value ? graphicRecords.value : records.value,
)

const correctCount = computed(() => sessionRecords.value.filter((r) => r.correct).length)
const wrongCount = computed(() => sessionRecords.value.filter((r) => !r.correct).length)

const showArithmeticSection = computed(
  () => activeOutlineSection.value === 'arithmetic',
)
const showPowerSection = computed(() => activeOutlineSection.value === 'power')
const showSquareCubeSection = computed(() => activeOutlineSection.value === 'square-cube')
const showFractionSection = computed(() => activeOutlineSection.value === 'fraction')
const showDivisibilitySection = computed(() => activeOutlineSection.value === 'divisibility')
const showLifeSenseSection = computed(() => activeOutlineSection.value === 'life-sense')
const showGrammarJudgmentSection = computed(
  () => activeOutlineSection.value === 'grammar-judgment',
)
const showTwentyFourSection = computed(() => activeOutlineSection.value === 'twentyfour')
const showSudokuSection = computed(() => activeOutlineSection.value === 'sudoku')
const showGraphicSection = computed(() => activeOutlineSection.value === 'graphic')
const showDataAnalysisSection = computed(() => activeOutlineSection.value === 'data-analysis')
const showOpSkillSection = computed(() => activeOutlineSection.value === 'op-skill')
const showOpHighfreqSection = computed(() => activeOutlineSection.value === 'op-highfreq')
const showOpOtherSection = computed(() => activeOutlineSection.value === 'op-other')
const showChineseSection = computed(() => activeOutlineSection.value === 'chinese')
const showInstallSection = computed(() => activeOutlineSection.value === 'install')
const showGuideSection = computed(() => activeOutlineSection.value === 'guide')
const showLogSection = computed(() => activeOutlineSection.value === 'log')

const chineseSessionActive = computed(
  () =>
    (chinesePracticeRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisGrowthPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisGrowthInterYearPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisGrowthAvgAnnualPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisGrowthMixedPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisProportionBasicPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisProportionBasePanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisAverageBasicPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisAverageBasePanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisMultipleBasicPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisMultipleBasePanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisIndexPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisPullPanelRef.value?.isRunningOrLoading ?? false) ||
    (dataAnalysisSurplusPanelRef.value?.isRunningOrLoading ?? false) ||
    (divisibilityJudgePanelRef.value?.isRunningOrLoading ?? false) ||
    (primeCompositePanelRef.value?.isRunningOrLoading ?? false) ||
    (gcdLcmPanelRef.value?.isRunningOrLoading ?? false) ||
    (ratioMultPanelRef.value?.isRunningOrLoading ?? false) ||
    (remPropPanelRef.value?.isRunningOrLoading ?? false) ||
    (subElimPanelRef.value?.isRunningOrLoading ?? false) ||
    (equationMethodPanelRef.value?.isRunningOrLoading ?? false) ||
    (specialValuePanelRef.value?.isRunningOrLoading ?? false) ||
    (ratioMethodPanelRef.value?.isRunningOrLoading ?? false) ||
    (crossMethodPanelRef.value?.isRunningOrLoading ?? false) ||
    (sumDiffRatioPanelRef.value?.isRunningOrLoading ?? false) ||
    (geometryPanelRef.value?.isRunningOrLoading ?? false) ||
    (rightTrianglePanelRef.value?.isRunningOrLoading ?? false) ||
    (similarTrianglePanelRef.value?.isRunningOrLoading ?? false) ||
    (coloringPanelRef.value?.isRunningOrLoading ?? false) ||
    (ordinaryTravelPanelRef.value?.isRunningOrLoading ?? false) ||
    (meetPursuePanelRef.value?.isRunningOrLoading ?? false) ||
    (boatCurrentPanelRef.value?.isRunningOrLoading ?? false) ||
    (ordinaryWorkPanelRef.value?.isRunningOrLoading ?? false) ||
    (cooperativeWorkPanelRef.value?.isRunningOrLoading ?? false) ||
    (profitCalcPanelRef.value?.isRunningOrLoading ?? false) ||
    (profitRatePanelRef.value?.isRunningOrLoading ?? false) ||
    (concentrationPanelRef.value?.isRunningOrLoading ?? false) ||
    (permCombBasicPanelRef.value?.isRunningOrLoading ?? false) ||
    (permCombConstraintPanelRef.value?.isRunningOrLoading ?? false) ||
    (permCombClassicPanelRef.value?.isRunningOrLoading ?? false) ||
    (probabilityPanelRef.value?.isRunningOrLoading ?? false) ||
    (inclusionExclusionPanelRef.value?.isRunningOrLoading ?? false) ||
    (sequencePanelRef.value?.isRunningOrLoading ?? false) ||
    (extremumPanelRef.value?.isRunningOrLoading ?? false) ||
    (datePanelRef.value?.isRunningOrLoading ?? false) ||
    (agePanelRef.value?.isRunningOrLoading ?? false) ||
    (clockPanelRef.value?.isRunningOrLoading ?? false) ||
    (yingKuiPanelRef.value?.isRunningOrLoading ?? false) ||
    (chickenRabbitPanelRef.value?.isRunningOrLoading ?? false) ||
    (functionGraphPanelRef.value?.isRunningOrLoading ?? false) ||
    (competitionPanelRef.value?.isRunningOrLoading ?? false) ||
    (reversePanelRef.value?.isRunningOrLoading ?? false) ||
    (sectionalPanelRef.value?.isRunningOrLoading ?? false),
)

const mcqOptionCount = computed(() => {
  const mode = activeMode.value
  if (
    !mode ||
    isTwentyFourPointMode(mode) ||
    isSudokuMode(mode) ||
    isCircleGrammarMode(mode) ||
    isShortenSentenceMode(mode)
  ) {
    return 0
  }
  if (isGraphicMode(mode)) return getGraphicReasoningModeConfig(mode).optionCount
  return getMentalMathModeConfig(mode as MentalMathMode).optionCount
})

const practiceMainRef = ref<HTMLElement | null>(null)
const practiceSidebarRef = ref<HTMLElement | null>(null)
const activeHubGroupId = ref<PracticeHubGroupId>(
  practiceHubGroupIdForSection(activeOutlineSection.value),
)

const hubChildSections = computed(() => practiceHubSectionsInGroup(activeHubGroupId.value))
const showHubLevel2 = computed(() => practiceHubGroupHasMultiple(activeHubGroupId.value))

watch(activeOutlineSection, (id, prev) => {
  activeHubGroupId.value = practiceHubGroupIdForSection(id)
  if (prev === 'chinese' && id !== 'chinese' && id !== 'install') {
    clearWenguSessionOnAiLeave()
  }
})

function selectHubGroup(groupId: PracticeHubGroupId) {
  if (chineseSessionActive.value) return
  activeHubGroupId.value = groupId
  const children = practiceHubSectionsInGroup(groupId)
  if (!children.some((s) => s.id === activeOutlineSection.value)) {
    const first = children[0]
    if (first) selectOutlineSection(first.id)
  } else {
    void nextTick(() => {
      const active = practiceSidebarRef.value?.querySelector<HTMLElement>(
        '.practice-sidebar__item--active',
      )
      active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    })
  }
}

function isHubLevel1Active(item: (typeof PRACTICE_HUB_NAV_ITEMS)[number]): boolean {
  if (item.kind === 'group') {
    return activeHubGroupId.value === item.group.id && showHubLevel2.value
  }
  return activeOutlineSection.value === item.section.id
}

function selectOutlineSection(id: PracticeHubSectionId) {
  if (chineseSessionActive.value) return
  activeOutlineSection.value = id
  activeHubGroupId.value = practiceHubGroupIdForSection(id)
  void nextTick(() => {
    practiceMainRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
    const active = practiceSidebarRef.value?.querySelector<HTMLElement>(
      '.practice-sidebar__item--active',
    )
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  })
}

function onGuideStartPractice(modeId: string) {
  startMode(modeId as PracticeMode)
}

function onGuideGoChineseTab(tabId: string) {
  activeOutlineSection.value = 'chinese'
  void nextTick(() => {
    chinesePracticeRef.value?.selectTab?.(tabId as import('@/constants/chinese-practice-tabs').ChinesePracticeTabId)
  })
}

function clearTimers() {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
  if (feedbackTimer) {
    clearTimeout(feedbackTimer)
    feedbackTimer = null
  }
  if (countdownTimer) {
    clearTimeout(countdownTimer)
    countdownTimer = null
  }
}

function nextQuestion() {
  if (!activeMode.value || !modeConfig.value) return
  questionSeq.value += 1
  if (isGraphicMode(activeMode.value)) {
    const gCfg = getGraphicReasoningModeConfig(activeMode.value)
    const q = generateGraphicReasoningQuestion(
      activeMode.value,
      questionSeq.value,
      gCfg.optionCount,
      lastQuestionFingerprint.value,
    )
    graphicQuestion.value = q
    lastQuestionFingerprint.value = getGraphicReasoningQuestionFingerprint(q)
    question.value = null
    twentyFourQuestion.value = null
    sudokuQuestion.value = null
    circleGrammarQuestion.value = null
    shortenSentenceQuestion.value = null
  } else if (isTwentyFourPointMode(activeMode.value)) {
    const q = generateTwentyFourPointPuzzle(activeMode.value, questionSeq.value, lastQuestionFingerprint.value)
    twentyFourQuestion.value = q
    lastQuestionFingerprint.value = getTwentyFourQuestionFingerprint(q)
    question.value = null
    graphicQuestion.value = null
    sudokuQuestion.value = null
    circleGrammarQuestion.value = null
    shortenSentenceQuestion.value = null
  } else if (isSudokuMode(activeMode.value)) {
    const q = generateSudokuPuzzle(activeMode.value, questionSeq.value, lastQuestionFingerprint.value)
    sudokuQuestion.value = q
    lastQuestionFingerprint.value = getSudokuQuestionFingerprint(q)
    question.value = null
    graphicQuestion.value = null
    twentyFourQuestion.value = null
    circleGrammarQuestion.value = null
    shortenSentenceQuestion.value = null
  } else if (isCircleGrammarMode(activeMode.value)) {
    const q = generateCircleGrammarQuestion(activeMode.value, questionSeq.value)
    circleGrammarQuestion.value = q
    lastQuestionFingerprint.value = getCircleGrammarQuestionFingerprint(q)
    sessionQuestionFingerprints.value.add(lastQuestionFingerprint.value)
    question.value = null
    graphicQuestion.value = null
    twentyFourQuestion.value = null
    sudokuQuestion.value = null
    shortenSentenceQuestion.value = null
  } else if (isShortenSentenceMode(activeMode.value)) {
    const q = generateShortenSentenceQuestion(activeMode.value, questionSeq.value)
    shortenSentenceQuestion.value = q
    lastQuestionFingerprint.value = getShortenSentenceQuestionFingerprint(q)
    sessionQuestionFingerprints.value.add(lastQuestionFingerprint.value)
    question.value = null
    graphicQuestion.value = null
    twentyFourQuestion.value = null
    sudokuQuestion.value = null
    circleGrammarQuestion.value = null
  } else {
    const mCfg = getMentalMathModeConfig(activeMode.value as MentalMathMode)
    const q = generateMentalMathQuestion(
      activeMode.value as MentalMathMode,
      questionSeq.value,
      mCfg.optionCount,
      sessionQuestionFingerprints.value,
    )
    question.value = q
    const fp = getMentalMathQuestionFingerprint(q)
    lastQuestionFingerprint.value = fp
    sessionQuestionFingerprints.value.add(fp)
    graphicQuestion.value = null
    twentyFourQuestion.value = null
    sudokuQuestion.value = null
    circleGrammarQuestion.value = null
    shortenSentenceQuestion.value = null
  }
  feedback.value = null
  acceptingInput.value = true
}

function finishSession(perfect = false) {
  clearTimers()
  acceptingInput.value = false
  finishedByPerfect.value = perfect
  if (isElapsedOnlySession.value) {
    elapsedMs.value = circleAccumulatedMs
  } else {
    elapsedMs.value = Math.max(elapsedMs.value, Date.now() - sessionStartMs)
  }
  if (perfect) {
    if (!isElapsedOnlySession.value) {
      syncRemainingFromSession()
    }
    prepareQbPerfectMidi()
    if (!tryPlayQbPerfectMidiSync()) {
      void startQbPerfectMidi()
    }
  }
  if (!sessionCompletionRecorded && activeMode.value) {
    sessionCompletionRecorded = true
    incrementPracticeCompletion(String(activeMode.value), {
      correctCount: correctCount.value,
      totalCount: sessionRecords.value.length,
      score: score.value,
      durationMs: elapsedMs.value,
      perfect,
    })
  }
  phase.value = 'finished'
}

function syncRemainingFromSession() {
  remainingMs.value = Math.max(0, totalMs.value - (Date.now() - sessionStartMs))
}

function applyTimeDeltaForAnswer(ok: boolean) {
  let bonusSec = MENTAL_MATH_TIME_CORRECT_BONUS_SEC
  let penaltySec = MENTAL_MATH_TIME_WRONG_PENALTY_SEC
  if (isGraphicSession.value) {
    bonusSec = GRAPHIC_REASONING_TIME_CORRECT_BONUS_SEC
    penaltySec = GRAPHIC_REASONING_TIME_WRONG_PENALTY_SEC
  } else {
    const mode = activeMode.value
    if (mode && isTwentyFourPointMode(mode)) {
      const tf = getTwentyFourPointModeConfig(mode)
      bonusSec = tf.timeCorrectBonusSec
      penaltySec = tf.timeWrongPenaltySec
    } else if (mode && isSudokuMode(mode)) {
      const sd = getSudokuModeConfig(mode)
      bonusSec = sd.timeCorrectBonusSec
      penaltySec = sd.timeWrongPenaltySec
    }
  }
  const deltaMs = ok ? bonusSec * 1000 : -penaltySec * 1000
  sessionStartMs += deltaMs
  syncRemainingFromSession()
}

function beginPlaying(mode: PracticeMode) {
  clearTimers()
  countdownValue.value = null
  activeMode.value = mode
  sessionCompletionRecorded = false
  const cfg = isGraphicMode(mode)
    ? getGraphicReasoningModeConfig(mode)
    : isTwentyFourPointMode(mode)
      ? getTwentyFourPointModeConfig(mode)
      : isSudokuMode(mode)
        ? getSudokuModeConfig(mode)
        : isCircleGrammarMode(mode)
          ? getCircleGrammarModeConfig(mode)
          : isShortenSentenceMode(mode)
            ? getShortenSentenceModeConfig(mode)
            : getMentalMathModeConfig(mode as MentalMathMode)
  score.value = 0
  finishedByPerfect.value = false
  records.value = []
  graphicRecords.value = []
  questionSeq.value = 0
  lastQuestionFingerprint.value = null
  sessionQuestionFingerprints.value = new Set()
  totalMs.value = cfg.durationSec * 1000
  remainingMs.value = totalMs.value
  elapsedMs.value = 0
  circleAccumulatedMs = 0
  circleSegmentStartMs = Date.now()
  circleTimerRunning.value =
    (isCircleGrammarMode(mode) || isShortenSentenceMode(mode)) && cfg.durationSec <= 0
  circleGrammarReviewing.value = false
  circleGrammarFeedbackDetail.value = ''
  shortenSentenceReviewing.value = false
  shortenSentenceFeedbackDetail.value = ''
  shortenSentenceLastAnswer.value = ''
  sessionStartMs = Date.now()
  phase.value = 'playing'
  nextQuestion()

  timerHandle = setInterval(() => {
    if (
      (isCircleGrammarMode(mode) || isShortenSentenceMode(mode)) &&
      cfg.durationSec <= 0
    ) {
      if (circleTimerRunning.value) {
        elapsedMs.value = circleAccumulatedMs + (Date.now() - circleSegmentStartMs)
      } else {
        elapsedMs.value = circleAccumulatedMs
      }
      return
    }
    elapsedMs.value = Date.now() - sessionStartMs
    remainingMs.value = Math.max(0, totalMs.value - (Date.now() - sessionStartMs))
    if (remainingMs.value <= 0) {
      finishSession()
    }
  }, 50)
}

function runCountdownStep(stepIndex: number, mode: PracticeMode) {
  if (stepIndex >= COUNTDOWN_STEPS.length) {
    beginPlaying(mode)
    return
  }

  const step = COUNTDOWN_STEPS[stepIndex]
  countdownValue.value = step
  if (step === 'GO') {
    playMentalMathStartSound()
  }

  const delayMs = step === 'GO' ? 700 : 1000
  countdownTimer = setTimeout(() => {
    runCountdownStep(stepIndex + 1, mode)
  }, delayMs)
}

function startMode(mode: PracticeMode) {
  stopQbPerfectMidi()
  clearTimers()
  activeMode.value = mode
  phase.value = 'countdown'
  countdownValue.value = COUNTDOWN_STEPS[0]
  runCountdownStep(0, mode)
}

/** 测验中重来：重新倒计时并开新一局（同模式） */
function retryCurrentMode() {
  if (!activeMode.value) return
  startMode(activeMode.value)
}

function finishTwentyFourAnswer(expression: string) {
  prepareQbPerfectMidi()
  if (
    phase.value !== 'playing' ||
    !acceptingInput.value ||
    !modeConfig.value ||
    !twentyFourQuestion.value
  ) {
    return
  }

  const cfg = modeConfig.value
  const q = twentyFourQuestion.value
  const check = validateTwentyFourExpression(q.nums, expression)
  const ok = check.ok
  const elapsedMs = Date.now() - sessionStartMs

  score.value = clampTwentyFourPointScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
  records.value.push({
    questionId: q.id,
    expression: q.prompt,
    correctAnswer: q.sampleSolution,
    chosenAnswer: expression || '（空）',
    chosenIndex: -1,
    correct: ok,
    scoreAfter: score.value,
    elapsedMs,
  })
  if (!ok && activeMode.value) {
    upsertMentalMathWrong({
      modeId: activeMode.value,
      expression: q.prompt,
      correctAnswer: q.sampleSolution,
      chosenAnswer: expression || '（空）',
      explanation: `参考解法：${q.sampleSolution}`,
    })
  }

  applyTimeDeltaForAnswer(ok)
  feedback.value = ok ? 'correct' : 'wrong'
  if (ok) playMentalMathCorrectSound()
  else playMentalMathWrongSound()

  acceptingInput.value = false

  if (score.value >= cfg.maxScore) {
    finishSession(true)
    return
  }
  if (remainingMs.value <= 0) {
    finishSession()
    return
  }

  feedbackTimer = setTimeout(() => {
    if (phase.value === 'playing' && remainingMs.value > 0) {
      nextQuestion()
    }
  }, ok ? 380 : 900)
}

function finishSudokuAnswer(grid: number[][]) {
  prepareQbPerfectMidi()
  if (
    phase.value !== 'playing' ||
    !acceptingInput.value ||
    !modeConfig.value ||
    !sudokuQuestion.value
  ) {
    return
  }

  const cfg = modeConfig.value
  const q = sudokuQuestion.value
  const check = validateSudokuAnswer(q, grid)
  const ok = check.ok
  const elapsedMs = Date.now() - sessionStartMs
  const chosenAnswer = formatSudokuGrid(grid)

  score.value = clampSudokuScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
  records.value.push({
    questionId: q.id,
    expression: q.prompt,
    correctAnswer: formatSudokuGrid(q.solution),
    chosenAnswer,
    chosenIndex: -1,
    correct: ok,
    scoreAfter: score.value,
    elapsedMs,
  })

  applyTimeDeltaForAnswer(ok)
  feedback.value = ok ? 'correct' : 'wrong'
  if (ok) playMentalMathCorrectSound()
  else playMentalMathWrongSound()

  acceptingInput.value = false

  if (score.value >= cfg.maxScore) {
    finishSession(true)
    return
  }
  if (remainingMs.value <= 0) {
    finishSession()
    return
  }

  feedbackTimer = setTimeout(() => {
    if (phase.value === 'playing' && remainingMs.value > 0) {
      nextQuestion()
    }
  }, ok ? 380 : 900)
}

function finishCircleGrammarAnswer(marks: CircleGrammarMark[]) {
  prepareQbPerfectMidi()
  if (
    phase.value !== 'playing' ||
    !acceptingInput.value ||
    !modeConfig.value ||
    !circleGrammarQuestion.value ||
    !activeMode.value ||
    !isCircleGrammarMode(activeMode.value) ||
    circleGrammarReviewing.value
  ) {
    return
  }

  const cfg = getCircleGrammarModeConfig(activeMode.value)
  const q = circleGrammarQuestion.value
  const check = validateCircleGrammarAnswer(q.expected, marks)
  const ok = check.ok

  // 先停表，再公布答案
  if (circleTimerRunning.value) {
    circleAccumulatedMs += Math.max(0, Date.now() - circleSegmentStartMs)
    circleTimerRunning.value = false
    elapsedMs.value = circleAccumulatedMs
  }

  const chosenAnswer = formatCircleGrammarMarks(marks)
  const correctAnswer = formatCircleGrammarExpected(q.expected)

  score.value = clampCircleGrammarScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
  records.value.push({
    questionId: q.id,
    expression: q.sentence.sentence,
    correctAnswer,
    chosenAnswer,
    chosenIndex: -1,
    correct: ok,
    scoreAfter: score.value,
    elapsedMs: circleAccumulatedMs,
    explanation: ok ? undefined : `${check.detail}。${q.explanation}`,
  })
  if (!ok) {
    upsertMentalMathWrong({
      modeId: activeMode.value,
      expression: q.sentence.sentence,
      correctAnswer,
      chosenAnswer,
      explanation: `${check.detail}。${q.explanation}`,
    })
  }

  feedback.value = ok ? 'correct' : 'wrong'
  circleGrammarFeedbackDetail.value = ok
    ? q.explanation
    : `${check.detail}。${q.explanation}`
  if (ok) playMentalMathCorrectSound()
  else playMentalMathWrongSound()

  acceptingInput.value = false
  circleGrammarReviewing.value = true
}

/** 圈语法：看完本题答案后进入下一题，或五题后出总结果 */
function advanceCircleGrammar() {
  if (phase.value !== 'playing' || !circleGrammarReviewing.value || !activeMode.value) return
  if (!isCircleGrammarMode(activeMode.value)) return

  const cfg = getCircleGrammarModeConfig(activeMode.value)
  const done = records.value.length >= cfg.questionCount
  circleGrammarReviewing.value = false
  circleGrammarFeedbackDetail.value = ''
  feedback.value = null

  if (done) {
    const perfect = score.value >= cfg.maxScore
    finishSession(perfect)
    return
  }

  nextQuestion()
  circleSegmentStartMs = Date.now()
  circleTimerRunning.value = true
}

function finishShortenSentenceAnswer(answer: string) {
  prepareQbPerfectMidi()
  if (
    phase.value !== 'playing' ||
    !acceptingInput.value ||
    !modeConfig.value ||
    !shortenSentenceQuestion.value ||
    !activeMode.value ||
    !isShortenSentenceMode(activeMode.value) ||
    shortenSentenceReviewing.value
  ) {
    return
  }

  const cfg = getShortenSentenceModeConfig(activeMode.value)
  const q = shortenSentenceQuestion.value
  const check = validateShortenSentenceAnswer(q.item, answer)
  const ok = check.ok

  if (circleTimerRunning.value) {
    circleAccumulatedMs += Math.max(0, Date.now() - circleSegmentStartMs)
    circleTimerRunning.value = false
    elapsedMs.value = circleAccumulatedMs
  }

  shortenSentenceLastAnswer.value = answer.trim() || '（空）'
  score.value = clampShortenSentenceScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
  records.value.push({
    questionId: q.id,
    expression: q.item.sentence,
    correctAnswer: q.item.shortened,
    chosenAnswer: shortenSentenceLastAnswer.value,
    chosenIndex: -1,
    correct: ok,
    scoreAfter: score.value,
    elapsedMs: circleAccumulatedMs,
    explanation: ok ? undefined : check.detail,
  })
  if (!ok) {
    upsertMentalMathWrong({
      modeId: activeMode.value,
      expression: q.item.sentence,
      correctAnswer: q.item.shortened,
      chosenAnswer: shortenSentenceLastAnswer.value,
      explanation: q.explanation,
    })
  }

  feedback.value = ok ? 'correct' : 'wrong'
  shortenSentenceFeedbackDetail.value = ok ? '缩句正确' : check.detail
  if (ok) playMentalMathCorrectSound()
  else playMentalMathWrongSound()

  acceptingInput.value = false
  shortenSentenceReviewing.value = true
}

function advanceShortenSentence() {
  if (phase.value !== 'playing' || !shortenSentenceReviewing.value || !activeMode.value) return
  if (!isShortenSentenceMode(activeMode.value)) return

  const cfg = getShortenSentenceModeConfig(activeMode.value)
  const done = records.value.length >= cfg.questionCount
  shortenSentenceReviewing.value = false
  shortenSentenceFeedbackDetail.value = ''
  shortenSentenceLastAnswer.value = ''
  feedback.value = null

  if (done) {
    finishSession(score.value >= cfg.maxScore)
    return
  }

  nextQuestion()
  circleSegmentStartMs = Date.now()
  circleTimerRunning.value = true
}

function applyAnswer(choiceIndex: number) {
  prepareQbPerfectMidi()
  if (phase.value !== 'playing' || !acceptingInput.value || !modeConfig.value) {
    return
  }
  if (isGraphicSession.value && !graphicQuestion.value) return
  if (
    !isGraphicSession.value &&
    !isTwentyFourSession.value &&
    !isSudokuSession.value &&
    !isCircleGrammarSession.value &&
    !isShortenSentenceSession.value &&
    !question.value
  ) {
    return
  }

  acceptingInput.value = false
  const cfg = modeConfig.value
  const elapsedMs = Date.now() - sessionStartMs
  let ok = false

  if (isGraphicSession.value && graphicQuestion.value) {
    const q = graphicQuestion.value
    ok = choiceIndex === q.correctIndex
    score.value = clampGraphicReasoningScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
    graphicRecords.value.push({
      questionId: q.id,
      ruleLabel: q.ruleLabel,
      chosenIndex: choiceIndex,
      correctIndex: q.correctIndex,
      correct: ok,
      scoreAfter: score.value,
      elapsedMs,
    })
  } else if (question.value) {
    const q = question.value
    const chosenAnswer = q.options[choiceIndex] ?? q.correctAnswer
    ok = choiceIndex === q.correctIndex
    score.value = isTwentyFourSession.value
      ? clampTwentyFourPointScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
      : clampMentalMathScore(score.value + (ok ? cfg.correctDelta : cfg.wrongDelta))
    records.value.push({
      questionId: q.id,
      expression: q.expression,
      correctAnswer: q.correctAnswer,
      chosenAnswer,
      chosenIndex: choiceIndex,
      correct: ok,
      scoreAfter: score.value,
      elapsedMs,
      explanation: q.explanation,
    })
    if (!ok && activeMode.value) {
      upsertMentalMathWrong({
        modeId: activeMode.value,
        expression: q.expression,
        correctAnswer: q.correctAnswer,
        chosenAnswer,
        options: q.options,
        explanation: q.explanation,
      })
    }
  }

  applyTimeDeltaForAnswer(ok)
  feedback.value = ok ? 'correct' : 'wrong'
  if (ok) playMentalMathCorrectSound()
  else playMentalMathWrongSound()

  if (score.value >= cfg.maxScore) {
    finishSession(true)
    return
  }

  if (remainingMs.value <= 0) {
    finishSession()
    return
  }

  feedbackTimer = setTimeout(() => {
    if (phase.value === 'playing' && remainingMs.value > 0) {
      nextQuestion()
    }
  }, 380)
}

function onKeydown(e: KeyboardEvent) {
  if (phase.value !== 'playing' || !acceptingInput.value || !modeConfig.value) return
  if (isTwentyFourSession.value) {
    if (e.key === 'Enter') {
      e.preventDefault()
      twentyFourPanelRef.value?.submitDraft()
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      twentyFourPanelRef.value?.backspace()
      return
    }
    const idx = Number(e.key) - 1
    if (Number.isFinite(idx) && idx >= 0 && idx < 4) {
      e.preventDefault()
      twentyFourPanelRef.value?.appendNum(idx)
    }
    return
  }
  if (isSudokuSession.value && sudokuQuestion.value) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sudokuPanelRef.value?.submitDraft()
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      sudokuPanelRef.value?.backspace()
      return
    }
    const n = Number(e.key)
    if (Number.isFinite(n) && n >= 1 && n <= sudokuQuestion.value.size) {
      e.preventDefault()
      sudokuPanelRef.value?.appendDigit(n)
    }
    return
  }
  if (
    !activeMode.value ||
    isTwentyFourPointMode(activeMode.value) ||
    isSudokuMode(activeMode.value) ||
    isCircleGrammarMode(activeMode.value) ||
    isShortenSentenceMode(activeMode.value)
  ) {
    return
  }
  const mCfg = isGraphicMode(activeMode.value)
    ? getGraphicReasoningModeConfig(activeMode.value)
    : getMentalMathModeConfig(activeMode.value as MentalMathMode)
  const key = e.key
  const idx = Number(key) - 1
  if (!Number.isFinite(idx) || idx < 0 || idx >= mCfg.optionCount) return
  e.preventDefault()
  applyAnswer(idx)
}

function backToSelect() {
  stopQbPerfectMidi()
  clearTimers()
  phase.value = 'select'
  finishedByPerfect.value = false
  activeMode.value = null
  question.value = null
  graphicQuestion.value = null
  twentyFourQuestion.value = null
  sudokuQuestion.value = null
  circleGrammarQuestion.value = null
  shortenSentenceQuestion.value = null
  feedback.value = null
  countdownValue.value = null
  lastQuestionFingerprint.value = null
  sessionQuestionFingerprints.value = new Set()
  elapsedMs.value = 0
  circleAccumulatedMs = 0
  circleTimerRunning.value = false
  circleGrammarReviewing.value = false
  circleGrammarFeedbackDetail.value = ''
  shortenSentenceReviewing.value = false
  shortenSentenceFeedbackDetail.value = ''
  shortenSentenceLastAnswer.value = ''
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  prepareQbPerfectMidi()
  const hash = route.hash.replace('#', '')
  if (hash === 'log' || route.query.section === 'log') {
    activeOutlineSection.value = 'log'
  } else if (hash === 'guide' || route.query.section === 'guide') {
    activeOutlineSection.value = 'guide'
  } else if (hash === 'twentyfour' || route.query.section === 'twentyfour') {
    activeOutlineSection.value = 'twentyfour'
  } else if (hash === 'sudoku' || route.query.section === 'sudoku') {
    activeOutlineSection.value = 'sudoku'
  } else if (hash === 'graphic' || route.query.section === 'graphic') {
    activeOutlineSection.value = 'graphic'
  } else if (hash === 'data-analysis' || route.query.section === 'data-analysis') {
    activeOutlineSection.value = 'data-analysis'
  } else if (hash === 'op-skill' || route.query.section === 'op-skill') {
    activeOutlineSection.value = 'op-skill'
  } else if (hash === 'op-highfreq' || route.query.section === 'op-highfreq') {
    activeOutlineSection.value = 'op-highfreq'
  } else if (hash === 'op-other' || route.query.section === 'op-other') {
    activeOutlineSection.value = 'op-other'
  } else if (hash === 'chinese' || hash === 'chinese-idiom' || route.query.section === 'chinese' || route.query.section === 'chinese-idiom') {
    activeOutlineSection.value = 'chinese'
  } else if (hash === 'chinese-key' || route.query.section === 'chinese-key') {
    activeOutlineSection.value = 'chinese'
  } else if (hash === 'install' || route.query.section === 'install') {
    activeOutlineSection.value = 'install'
  } else if (hash === 'fraction' || route.query.section === 'fraction') {
    activeOutlineSection.value = 'fraction'
  } else if (hash === 'divisibility' || route.query.section === 'divisibility') {
    activeOutlineSection.value = 'divisibility'
  } else if (hash === 'life-sense' || route.query.section === 'life-sense') {
    activeOutlineSection.value = 'life-sense'
  } else if (hash === 'grammar-judgment' || route.query.section === 'grammar-judgment') {
    activeOutlineSection.value = 'grammar-judgment'
  }
})

onBeforeUnmount(() => {
  stopQbPerfectMidi()
  window.removeEventListener('keydown', onKeydown)
  clearTimers()
})
</script>

<template>
  <section class="mental-math-page">
    <header v-if="phase === 'select' && !chineseSessionActive" class="page-hero">
      <h2 class="page-title">口算练习</h2>
      <p class="page-subtitle page-subtitle--full">
        限时口算、次幂、平方与立方、估算分数、整除、生活常识；数学推理含二十四点、数独、图形推理、资料分析、运算技巧、高频运算、其他运算；左侧「语文练习」含成语识记、词语识记、阅读理解等。
        口算/图形结果仅在本页展示；语文练习多子模块四选一、正计时，依赖 AI 出题（DeepSeek / 豆包，需在「导览 → 安装」登录），错题与收藏在「关题练习」。
      </p>
      <p class="page-subtitle page-subtitle--compact">
        点上方分类找模式，点卡片开始练习。
      </p>
    </header>

    <div
      v-if="phase === 'select'"
      class="practice-shell"
      :class="{ 'practice-shell--session-focus': chineseSessionActive }"
    >
      <aside
        v-show="!chineseSessionActive"
        ref="practiceSidebarRef"
        class="practice-sidebar"
        aria-label="练习大纲"
      >
        <div class="practice-sidebar__level1" aria-label="一级分类">
          <template v-for="item in PRACTICE_HUB_NAV_ITEMS" :key="item.kind === 'group' ? item.group.id : item.section.id">
            <button
              v-if="item.kind === 'group'"
              type="button"
              class="practice-sidebar__group"
              :class="{ 'practice-sidebar__group--active': isHubLevel1Active(item) }"
              :disabled="chineseSessionActive && activeHubGroupId !== item.group.id"
              @click="selectHubGroup(item.group.id)"
            >
              {{ item.group.title }}
            </button>
            <button
              v-else
              type="button"
              class="practice-sidebar__group practice-sidebar__group--leaf"
              :class="{ 'practice-sidebar__group--active': isHubLevel1Active(item) }"
              :disabled="chineseSessionActive && item.section.id !== activeOutlineSection"
              @click="selectOutlineSection(item.section.id)"
            >
              {{ item.section.title }}
            </button>
          </template>
        </div>
        <div
          v-show="showHubLevel2"
          class="practice-sidebar__level2"
          aria-label="二级入口"
        >
          <button
            v-for="section in hubChildSections"
            :key="section.id"
            type="button"
            class="practice-sidebar__item"
            :class="{ 'practice-sidebar__item--active': activeOutlineSection === section.id }"
            :disabled="chineseSessionActive && section.id !== activeOutlineSection"
            @click="selectOutlineSection(section.id)"
          >
            {{ section.title }}
          </button>
        </div>
        <div class="practice-sidebar__flat" aria-label="全部入口">
          <button
            v-for="section in PRACTICE_HUB_SECTIONS"
            :key="section.id"
            type="button"
            class="practice-sidebar__item"
            :class="{ 'practice-sidebar__item--active': activeOutlineSection === section.id }"
            :disabled="chineseSessionActive && section.id !== activeOutlineSection"
            @click="selectOutlineSection(section.id)"
          >
            {{ section.title }}
          </button>
        </div>
      </aside>

      <div
        ref="practiceMainRef"
        class="practice-main mode-select"
        :class="{ 'practice-main--session-focus': chineseSessionActive }"
      >
        <PracticeSessionLogPanel v-if="showLogSection" />
        <MentalMathPracticeGuide
          v-if="showGuideSection"
          @start-practice="onGuideStartPractice"
          @go-chinese-tab="onGuideGoChineseTab"
        />
        <section v-if="showArithmeticSection" class="mode-section" id="practice-arithmetic">
          <h3 class="mode-section__title">四则口算</h3>
          <p class="mode-section__hint">
            含简单/干扰/普通/高难，「累加/减数」「累加/减数（乘除）」「三位数加减法」「百分比加减运算」「乘法计算」。答错记入错题本；对 +1 秒 / 错 −1 秒，满分 100。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_ARITHMETIC_MODES"
              :key="m.id"
              type="button"
              class="mode-card"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showPowerSection" class="mode-section" id="practice-power">
          <h3 class="mode-section__title">2 的 n 次幂</h3>
          <p class="mode-section__hint">
            题目形如 2ⁿ（简单含 2⁻¹～2⁻³ 与 2⁰～2¹²；复杂含 2⁻²～2⁻⁶ 与 2¹⁰～2²⁴），干扰项为相邻次幂。答错会记入下方错题集。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_POWER_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--power"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="power" />
        </section>

        <section v-if="showSquareCubeSection" class="mode-section" id="practice-square-cube">
          <h3 class="mode-section__title">平方与立方</h3>
          <p class="mode-section__hint">
            题目随机为 n² 或 n³（不含 10²、10³；简单：平方 n≤11、立方 n≤6；复杂：平方 7～20、立方 3～9）。答错会记入下方错题集。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_SQUARE_CUBE_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--square-cube"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="square-cube" />
        </section>

        <section v-if="showFractionSection" class="mode-section" id="practice-fraction">
          <h3 class="mode-section__title">估算分数</h3>
          <p class="mode-section__hint">
            百分数转最简分数，或比较两个分数的大小。答错会记入下方错题集。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_FRACTION_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--fraction"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="fraction" />
        </section>

        <section v-if="showDivisibilitySection" class="mode-section" id="practice-divisibility">
          <h3 class="mode-section__title">整除及其性质</h3>
          <p class="mode-section__hint">
            只练两类题：「下列哪个数是质数/合数」「下列哪个数能被 3～12 整除」。答错记入下方错题集。计分同四则（对 +1 秒 / 错 −1 秒，分 0～100）。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_DIVISIBILITY_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--divisibility"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="divisibility" />
        </section>

        <section v-if="showLifeSenseSection" class="mode-section" id="practice-life-sense">
          <h3 class="mode-section__title">生活常识</h3>
          <p class="mode-section__hint">
            本地校对题库短题快判（材料/种属/组成/用途等）。答错会记入下方错题集；作答中只提示对错，详解可结束后或在错题集查看。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_LIFE_SENSE_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--life-sense"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="life-sense" />
        </section>

        <section
          v-if="showGrammarJudgmentSection"
          class="mode-section"
          id="practice-grammar-judgment"
        >
          <h3 class="mode-section__title">语法判断</h3>
          <p class="mode-section__hint">
            给出句子，随机考察主/谓/宾/定/状/补（找成分或判成分）。题库 150 句按序出题；普通题六种成分齐全，复杂题为超长单句。答错记入错题集。计分：简单 +7/−14，普通 +10/−20，复杂 +15/−30。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_GRAMMAR_JUDGMENT_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--grammar-judgment"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>

          <h4 class="mode-section__subtitle">圈出所有语法</h4>
          <p class="mode-section__hint">
            圈出句中全部主谓宾定状补：可手指滑动圈词，或手动输入后点确认。简单题用普通句式，困难题用复杂句式。共 5 题；提交后停表看答案，点下一题再计时，五题结束后再看总成绩。对 +20 / 错 −5（扣完为止）。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in CIRCLE_GRAMMAR_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--circle-grammar"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <h4 class="mode-section__subtitle">缩句练习</h4>
          <p class="mode-section__hint">
            摘自求是网、新华网近年时事长句（优先 2026）。滑动圈选主干再自动拼接，也可手动改。简单 75 句 / 困难 75 句。流程同「圈出所有语法」：提交停表看答案，点下一题再计时；共 5 题。对 +20 / 错 −20。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in SHORTEN_SENTENCE_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--shorten-sentence"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="grammar-judgment" />
        </section>

        <section v-if="showTwentyFourSection" class="mode-section" id="practice-twentyfour">
          <h3 class="mode-section__title">二十四点</h3>
          <p class="mode-section__hint">
            用四个数加减乘除（可加括号）算出 24，每数用一次。答错会记入下方错题集（含参考解法）。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in TWENTY_FOUR_POINT_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--twentyfour"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
          <MentalMathWrongBookPanel section="twentyfour" />
        </section>

        <section v-if="showSudokuSection" class="mode-section" id="practice-sudoku">
          <h3 class="mode-section__title">数独</h3>
          <p class="mode-section__hint">
            简单为 5×5 挖 8 空（1 分 30 秒）；高难为 9×9 挖 13 空（2 分 30 秒，含 3×3 宫规则）。拖拽数字填入空格后提交。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in SUDOKU_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--sudoku"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showGraphicSection" class="mode-section" id="practice-graphic">
          <h3 class="mode-section__title">图形推理</h3>
          <p class="mode-section__hint">
            程序化图形规律（旋转、形状循环、数量递增、填色交替、放射线、双标记、图形自转、四宫格填色、圆点平移、四角标记等），4 选项；立体折叠等真题请自行刷题。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in GRAPHIC_REASONING_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--graphic"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }} <PracticeCompletionStat :mode-id="m.id" perfect-label="满分" /></h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showDataAnalysisSection" class="mode-section" id="practice-data-analysis">
          <h3 class="mode-section__title">资料分析</h3>
          <p class="mode-section__hint">
            公考/事业编资料分析考点。开放「百分数与百分点」「增长」「比重」「平均数」「倍数与翻番」「指数」「拉动增长和比例」「顺差与逆差」（均默认折叠）；各模块错题集分开。正计时，提交后停表看答案再下一题。
          </p>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="dataAnalysisPercentFoldOpen"
              @click="dataAnalysisPercentFoldOpen = !dataAnalysisPercentFoldOpen"
            >
              <span class="da-growth-fold__title">百分数与百分点</span>
              <span class="da-growth-fold__meta">百分数 · 百分点 · 换算</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': dataAnalysisPercentFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="dataAnalysisPercentFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">百分数与百分点</h4>
                <DataAnalysisStrategyGuideButton topic-id="percent-point" />
              </div>
              <DataAnalysisPanel ref="dataAnalysisPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="dataAnalysisGrowthFoldOpen"
              @click="dataAnalysisGrowthFoldOpen = !dataAnalysisGrowthFoldOpen"
            >
              <span class="da-growth-fold__title">增长</span>
              <span class="da-growth-fold__meta">一般 · 隔年 · 年均 · 混合</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': dataAnalysisGrowthFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="dataAnalysisGrowthFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">增长 · 一般增长</h4>
                <DataAnalysisStrategyGuideButton topic-id="growth-general" />
              </div>
              <p class="mode-section__hint">
                基期/现期、增长量与增长率；复杂题含统计图，仅豆包出题。与「百分数与百分点」错题不混用。
              </p>
              <DataAnalysisGrowthPanel ref="dataAnalysisGrowthPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-growth" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">增长 · 隔年增长</h4>
                <DataAnalysisStrategyGuideButton topic-id="growth-inter-year" />
              </div>
              <p class="mode-section__hint">
                隔年增速与隔年基期；简单题纯文字，复杂题为两年累计增速双折线图。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisGrowthInterYearPanel ref="dataAnalysisGrowthInterYearPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-growth-inter-year" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">增长 · 年均增长</h4>
                <DataAnalysisStrategyGuideButton topic-id="growth-avg-annual" />
              </div>
              <p class="mode-section__hint">
                年均增长量/增长率、多期连乘、初期判定与外推；简单题纯文字，复杂题含柱折线图或数据表。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisGrowthAvgAnnualPanel ref="dataAnalysisGrowthAvgAnnualPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-growth-avg-annual" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">增长 · 混合增长</h4>
                <DataAnalysisStrategyGuideButton topic-id="growth-mixed" />
              </div>
              <p class="mode-section__hint">
                整体增速介于部分之间、偏向基期大的一侧、十字交叉与反推另一部分增速；简单/复杂均为纯文字。复杂题选项贴近，须计算或估权，对齐书上难题。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisGrowthMixedPanel ref="dataAnalysisGrowthMixedPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-growth-mixed" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="dataAnalysisProportionFoldOpen"
              @click="dataAnalysisProportionFoldOpen = !dataAnalysisProportionFoldOpen"
            >
              <span class="da-growth-fold__title">比重</span>
              <span class="da-growth-fold__meta">基本公式 · 基期比重</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': dataAnalysisProportionFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="dataAnalysisProportionFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">比重 · 基本公式</h4>
                <DataAnalysisStrategyGuideButton topic-id="proportion-basic" />
              </div>
              <p class="mode-section__hint">
                比重=部分/整体、反推与连续占比；简单题纯文字，复杂题含扇形图（难度难于教材）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisProportionBasicPanel ref="dataAnalysisProportionBasicPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-proportion-basic" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">比重 · 基期比重</h4>
                <DataAnalysisStrategyGuideButton topic-id="proportion-base" />
              </div>
              <p class="mode-section__hint">
                基期比重、比重增长量与升降判断；简单题纯文字，复杂题含数据表（对齐教材或更难）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisProportionBasePanel ref="dataAnalysisProportionBasePanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-proportion-base" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="dataAnalysisAverageFoldOpen"
              @click="dataAnalysisAverageFoldOpen = !dataAnalysisAverageFoldOpen"
            >
              <span class="da-growth-fold__title">平均数</span>
              <span class="da-growth-fold__meta">基本公式 · 基期平均数</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': dataAnalysisAverageFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="dataAnalysisAverageFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">平均数 · 基本公式</h4>
                <DataAnalysisStrategyGuideButton topic-id="average-basic" />
              </div>
              <p class="mode-section__hint">
                平均数=总量/份数及反推；简单题数字简明，复杂题含单位换算/大数估算/多步（无图）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisAverageBasicPanel ref="dataAnalysisAverageBasicPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-average-basic" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">平均数 · 基期平均数</h4>
                <DataAnalysisStrategyGuideButton topic-id="average-base" />
              </div>
              <p class="mode-section__hint">
                基期平均数、平均数增长量/增长率与升降判断；简单/复杂均为纯文字，复杂对齐教材货运/快递真题。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisAverageBasePanel ref="dataAnalysisAverageBasePanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-average-base" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="dataAnalysisMultipleFoldOpen"
              @click="dataAnalysisMultipleFoldOpen = !dataAnalysisMultipleFoldOpen"
            >
              <span class="da-growth-fold__title">倍数与翻番</span>
              <span class="da-growth-fold__meta">基本公式 · 基期与增长量倍数</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': dataAnalysisMultipleFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="dataAnalysisMultipleFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">倍数 · 基本公式</h4>
                <DataAnalysisStrategyGuideButton topic-id="multiple-basic" />
              </div>
              <p class="mode-section__hint">
                是几倍、多/高几倍、翻番；简单题纯文字，复杂题含数据表（可先人均再比倍）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisMultipleBasicPanel ref="dataAnalysisMultipleBasicPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-multiple-basic" />
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">倍数 · 基期与增长量倍数</h4>
                <DataAnalysisStrategyGuideButton topic-id="multiple-base" />
              </div>
              <p class="mode-section__hint">
                基期倍数、增长量倍数；简单题纯文字，复杂题含数据表（难度高于教材）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisMultipleBasePanel ref="dataAnalysisMultipleBasePanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-multiple-base" />
            </div>
          </div>

          <div class="da-growth-fold">
            <div class="da-growth-fold__toggle-row">
              <button
                type="button"
                class="da-growth-fold__toggle"
                :aria-expanded="dataAnalysisIndexFoldOpen"
                @click="dataAnalysisIndexFoldOpen = !dataAnalysisIndexFoldOpen"
              >
                <span class="da-growth-fold__title">指数</span>
                <span class="da-growth-fold__meta">简单 · 复杂</span>
                <span
                  class="da-growth-fold__chevron"
                  :class="{ 'is-open': dataAnalysisIndexFoldOpen }"
                >
                  ▾
                </span>
              </button>
              <DataAnalysisStrategyGuideButton topic-id="index" />
            </div>
            <div v-show="dataAnalysisIndexFoldOpen" class="da-growth-fold__body">
              <p class="mode-section__hint">
                指数与实际值、增长率、倍数的关系；点数差对应增长率差。简单/复杂均为纯文字无表；简单略易，复杂对齐教材景气指数题或更难。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisIndexPanel ref="dataAnalysisIndexPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-index" />
            </div>
          </div>

          <div class="da-growth-fold">
            <div class="da-growth-fold__toggle-row">
              <button
                type="button"
                class="da-growth-fold__toggle"
                :aria-expanded="dataAnalysisPullFoldOpen"
                @click="dataAnalysisPullFoldOpen = !dataAnalysisPullFoldOpen"
              >
                <span class="da-growth-fold__title">拉动增长和比例</span>
                <span class="da-growth-fold__meta">简单 · 复杂</span>
                <span
                  class="da-growth-fold__chevron"
                  :class="{ 'is-open': dataAnalysisPullFoldOpen }"
                >
                  ▾
                </span>
              </button>
              <DataAnalysisStrategyGuideButton topic-id="pull" />
            </div>
            <div v-show="dataAnalysisPullFoldOpen" class="da-growth-fold__body">
              <p class="mode-section__hint">
                拉动……增长、贡献率、利润率及其变化。简单/复杂均为纯文字无表；简单略易，复杂对齐教材真题或更难。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisPullPanel ref="dataAnalysisPullPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-pull" />
            </div>
          </div>

          <div class="da-growth-fold">
            <div class="da-growth-fold__toggle-row">
              <button
                type="button"
                class="da-growth-fold__toggle"
                :aria-expanded="dataAnalysisSurplusFoldOpen"
                @click="dataAnalysisSurplusFoldOpen = !dataAnalysisSurplusFoldOpen"
              >
                <span class="da-growth-fold__title">顺差与逆差</span>
                <span class="da-growth-fold__meta">简单 · 复杂</span>
                <span
                  class="da-growth-fold__chevron"
                  :class="{ 'is-open': dataAnalysisSurplusFoldOpen }"
                >
                  ▾
                </span>
              </button>
              <DataAnalysisStrategyGuideButton topic-id="surplus" />
            </div>
            <div v-show="dataAnalysisSurplusFoldOpen" class="da-growth-fold__body">
              <p class="mode-section__hint">
                进出口总额、顺差、逆差。简单题纯文字略易；复杂题含数据表（多年筛选/比较等，难于教材）。仅豆包出题，错题单独成集。
              </p>
              <DataAnalysisSurplusPanel ref="dataAnalysisSurplusPanelRef" />
              <MentalMathWrongBookPanel section="data-analysis-surplus" />
            </div>
          </div>
        </section>

        <section v-if="showOpSkillSection" class="mode-section" id="practice-op-skill">
          <h3 class="mode-section__title">运算技巧</h3>
          <p class="mode-section__hint">
            数学运算常用技巧与判定方法。当前开放「整除及其性质」「余数及其性质」「代入排除法」「方程法」「特值法」「比例法」「十字交叉法」；本地程序组卷，流程同资料分析（正计时、提交后看解析）。
          </p>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillDivFoldOpen"
              @click="opSkillDivFoldOpen = !opSkillDivFoldOpen"
            >
              <span class="da-growth-fold__title">整除及其性质</span>
              <span class="da-growth-fold__meta">整除的判定 · 质数与合数 · 公因数与公倍数 · 由比例判定倍数</span>
              <span class="da-growth-fold__chevron" :class="{ 'is-open': opSkillDivFoldOpen }">
                ▾
              </span>
            </button>
            <div v-show="opSkillDivFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">整除的判定</h4>
                <DataAnalysisStrategyGuideButton topic-id="div-judge" />
              </div>
              <p class="mode-section__hint">
                3/9/7/11/6/14 等整除判定；普通含半满足干扰与结论辨析；困难对标/难于经典真题，7
                类考点各一题。本地组卷，每轮 7 题。
              </p>
              <DivisibilityJudgePanel ref="divisibilityJudgePanelRef" />
              <MentalMathWrongBookPanel section="op-skill-div-judge" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">质数与合数</h4>
                <DataAnalysisStrategyGuideButton topic-id="prime-comp" />
              </div>
              <p class="mode-section__hint">
                质数/合数判定与质因数分解；困难对齐经典真题 2（三质数），7 类变式每轮抽 6
                题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <PrimeCompositePanel ref="primeCompositePanelRef" />
              <MentalMathWrongBookPanel section="op-skill-prime-comp" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">公因数与公倍数</h4>
                <DataAnalysisStrategyGuideButton topic-id="gcd-lcm" />
              </div>
              <p class="mode-section__hint">
                最大公因数 / 最小公倍数；普通含周期相遇（经典真题 3）；困难对齐经典真题 4（等差连乘末尾
                0），7 类变式每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <GcdLcmPanel ref="gcdLcmPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-gcd-lcm" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">由比例判定倍数</h4>
                <DataAnalysisStrategyGuideButton topic-id="ratio-mult" />
              </div>
              <p class="mode-section__hint">
                最简比判定倍数；普通对齐经典真题 5；困难为难于真题的 12 类变式，每轮抽 5
                题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <RatioMultPanel ref="ratioMultPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-ratio-mult" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillRemFoldOpen"
              @click="opSkillRemFoldOpen = !opSkillRemFoldOpen"
            >
              <span class="da-growth-fold__title">余数及其性质</span>
              <span class="da-growth-fold__meta">同余性质 · 不定方程 · 分组余数</span>
              <span class="da-growth-fold__chevron" :class="{ 'is-open': opSkillRemFoldOpen }">
                ▾
              </span>
            </button>
            <div v-show="opSkillRemFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">余数及其性质</h4>
                <DataAnalysisStrategyGuideButton topic-id="rem-prop" />
              </div>
              <p class="mode-section__hint">
                同余三大性质；普通对齐经典真题（赛点同余 / 分组代入）；困难为难于真题的 9
                类变式，每轮 7 题且题型不重复。本地组卷。
              </p>
              <RemPropPanel ref="remPropPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-rem-prop" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillSubElimFoldOpen"
              @click="opSkillSubElimFoldOpen = !opSkillSubElimFoldOpen"
            >
              <span class="da-growth-fold__title">代入排除法</span>
              <span class="da-growth-fold__meta">直接代入 · 选择性代入 · 最值代入顺序</span>
              <span class="da-growth-fold__chevron" :class="{ 'is-open': opSkillSubElimFoldOpen }">
                ▾
              </span>
            </button>
            <div v-show="opSkillSubElimFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">代入排除法</h4>
                <DataAnalysisStrategyGuideButton topic-id="sub-elim" />
              </div>
              <p class="mode-section__hint">
                直接/选择代入；普通对齐经典真题 1（分组余数）、真题 2（百分数筛选项）；困难为难于真题的
                10 类变式，每轮 5 题且题型不重复。本地组卷。
              </p>
              <SubElimPanel ref="subElimPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-sub-elim" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillEqMethodFoldOpen"
              @click="opSkillEqMethodFoldOpen = !opSkillEqMethodFoldOpen"
            >
              <span class="da-growth-fold__title">方程法</span>
              <span class="da-growth-fold__meta">设未知数 · 方程组 · 整体代换</span>
              <span class="da-growth-fold__chevron" :class="{ 'is-open': opSkillEqMethodFoldOpen }">
                ▾
              </span>
            </button>
            <div v-show="opSkillEqMethodFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">方程法</h4>
                <DataAnalysisStrategyGuideButton topic-id="eq-method" />
              </div>
              <p class="mode-section__hint">
                设未知数列方程；普通对齐经典真题 1（行程）、真题 2（年龄）；困难对齐经典真题
                3（整体代换），10 类变式每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <EquationMethodPanel ref="equationMethodPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-eq-method" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillSpecValFoldOpen"
              @click="opSkillSpecValFoldOpen = !opSkillSpecValFoldOpen"
            >
              <span class="da-growth-fold__title">特值法</span>
              <span class="da-growth-fold__meta">设 1 · 设 100 · 设公倍数 · 设份数</span>
              <span class="da-growth-fold__chevron" :class="{ 'is-open': opSkillSpecValFoldOpen }">
                ▾
              </span>
            </button>
            <div v-show="opSkillSpecValFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">特值法</h4>
                <DataAnalysisStrategyGuideButton topic-id="spec-val" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难。简单：经典 4 类格式各 2 题；困难：14 类变式每轮抽 8
                题且题型不重复。本地组卷，每轮 8 题。
              </p>
              <SpecialValuePanel ref="specialValuePanelRef" />
              <MentalMathWrongBookPanel section="op-skill-spec-val" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillRatioMethodFoldOpen"
              @click="opSkillRatioMethodFoldOpen = !opSkillRatioMethodFoldOpen"
            >
              <span class="da-growth-fold__title">比例法</span>
              <span class="da-growth-fold__meta">份数 · 比例统一 · 行程正比例</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opSkillRatioMethodFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opSkillRatioMethodFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">比例法</h4>
                <DataAnalysisStrategyGuideButton topic-id="ratio-method" />
              </div>
              <p class="mode-section__hint">
                简单对齐示例（份数差）；普通对齐经典真题 1（调动后人比 / 比例统一）；困难对齐经典真题
                2（行程正比例），10 类变式每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <RatioMethodPanel ref="ratioMethodPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-ratio-method" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opSkillCrossMethodFoldOpen"
              @click="opSkillCrossMethodFoldOpen = !opSkillCrossMethodFoldOpen"
            >
              <span class="da-growth-fold__title">十字交叉法</span>
              <span class="da-growth-fold__meta">混合比例 · 交叉求份 · 盈亏浓度</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opSkillCrossMethodFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opSkillCrossMethodFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">十字交叉法</h4>
                <DataAnalysisStrategyGuideButton topic-id="cross-method" />
              </div>
              <p class="mode-section__hint">
                简单对齐示例（已知 a、b、c 直接交叉）；普通对齐经典真题（先算混合率，可含亏损）；困难为
                10 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <CrossMethodPanel ref="crossMethodPanelRef" />
              <MentalMathWrongBookPanel section="op-skill-cross-method" />
            </div>
          </div>
        </section>

        <section v-if="showOpHighfreqSection" class="mode-section" id="practice-op-highfreq">
          <h3 class="mode-section__title">高频运算</h3>
          <p class="mode-section__hint">
            公考数量关系高频题型。当前开放「和差倍比问题」「几何问题」（含直角三角形、三角形相似、染色）「行程问题」（普通行程、相遇与追及、流水行船）「工程问题」（普通工程、合作完工）「利润问题」（利润计算、利润率计算）「浓度问题」「排列组合问题」（基本原理及公式、限制条件型、经典模型）「概率问题」；流程同资料分析（正计时、提交后暂停看解析）。
          </p>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqSumDiffRatioFoldOpen"
              @click="opHighfreqSumDiffRatioFoldOpen = !opHighfreqSumDiffRatioFoldOpen"
            >
              <span class="da-growth-fold__title">和差倍比问题</span>
              <span class="da-growth-fold__meta">和 · 差 · 倍 · 比 · 列方程</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqSumDiffRatioFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqSumDiffRatioFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">和差倍比问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="sum-diff-ratio" />
              </div>
              <p class="mode-section__hint">
                简单对齐经典真题 1（份数+转移）；普通对齐经典真题 2（加权总量+整除）；困难为 10
                类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <SumDiffRatioPanel ref="sumDiffRatioPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-sum-diff-ratio" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqGeometryFoldOpen"
              @click="opHighfreqGeometryFoldOpen = !opHighfreqGeometryFoldOpen"
            >
              <span class="da-growth-fold__title">几何问题</span>
              <span class="da-growth-fold__meta"
                >周长 · 面积 · 直角三角形 · 相似 · 染色</span
              >
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqGeometryFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqGeometryFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">几何问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="geometry" />
              </div>
              <p class="mode-section__hint">
                简单略低于经典真题（直接套公式）；普通对齐经典真题 1（割补）/真题 2（长方体变正方体）；困难更高（组合割补/勾股/多步立体）。豆包出题干，几何图按参数渲染，每轮 10 题。
              </p>
              <GeometryPanel ref="geometryPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-geometry" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">直角三角形常用结论</h4>
                <DataAnalysisStrategyGuideButton topic-id="right-triangle" />
              </div>
              <p class="mode-section__hint">
                简单：勾股数与 30°/45° 边比直接求边；普通对齐经典真题 3（正北集合+30°+同时到达）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <RightTrianglePanel ref="rightTrianglePanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-right-triangle" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">三角形相似</h4>
                <DataAnalysisStrategyGuideButton topic-id="similar-triangle" />
              </div>
              <p class="mode-section__hint">
                简单：相似比/A·X 型/中位线直接求边或面积比；普通对齐经典真题 4（竹竿测树高）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <SimilarTrianglePanel ref="similarTrianglePanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-similar-triangle" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">染色问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="coloring" />
              </div>
              <p class="mode-section__hint">
                简单：直接套表中三面/两面/一面/未染色公式；普通对齐经典真题 5（有染色=n³−(n−2)³）；困难为
                更高阶变式，每轮 4 题且题型不重复。本地组卷，每轮 4 题。
              </p>
              <ColoringPanel ref="coloringPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-coloring" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqTravelFoldOpen"
              @click="opHighfreqTravelFoldOpen = !opHighfreqTravelFoldOpen"
            >
              <span class="da-growth-fold__title">行程问题</span>
              <span class="da-growth-fold__meta">普通行程 · 相遇追及 · 流水行船</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqTravelFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqTravelFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">普通行程问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="ordinary-travel" />
              </div>
              <p class="mode-section__hint">
                简单略低于经典真题 1～3（直接套公式）；普通对齐真题 1（迟到早到）/真题 2（提速）/真题
                3（等距平均速度）；困难为 10 类更高阶变式，每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <OrdinaryTravelPanel ref="ordinaryTravelPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-ordinary-travel" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">相遇与追及问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="meet-pursue" />
              </div>
              <p class="mode-section__hint">
                简单对齐经典真题 4（先出发）/真题 5（火车过行人）；普通对齐真题 6（往返二次相遇）/真题
                7（环形正反）。困难为 12 类更高阶变式，每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <MeetPursuePanel ref="meetPursuePanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-meet-pursue" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">流水行船问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="boat-current" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难两档。简单对齐经典真题 8（往返时差求水速再算另一船）；困难为 6
                类更高阶变式，每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <BoatCurrentPanel ref="boatCurrentPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-boat-current" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqWorkFoldOpen"
              @click="opHighfreqWorkFoldOpen = !opHighfreqWorkFoldOpen"
            >
              <span class="da-growth-fold__title">工程问题</span>
              <span class="da-growth-fold__meta">普通工程 · 合作完工</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqWorkFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqWorkFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">普通工程问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="ordinary-work" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难两档。简单对齐或略低于经典真题 1（总量=效率×时间、提效省时、正反比）；困难为 6
                类更高阶变式，每轮抽 4 题且题型不重复。本地组卷，每轮 4 题。
              </p>
              <OrdinaryWorkPanel ref="ordinaryWorkPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-ordinary-work" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">合作完工问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="cooperative-work" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难两档。简单对齐或略低于经典真题 2（效率和、分段合作、工时上限求最少）；困难为 6
                类更高阶变式，每轮抽 4 题且题型不重复。本地组卷，每轮 4 题。
              </p>
              <CooperativeWorkPanel ref="cooperativeWorkPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-cooperative-work" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqProfitFoldOpen"
              @click="opHighfreqProfitFoldOpen = !opHighfreqProfitFoldOpen"
            >
              <span class="da-growth-fold__title">利润问题</span>
              <span class="da-growth-fold__meta">利润计算 · 利润率计算</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqProfitFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqProfitFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">利润计算</h4>
                <DataAnalysisStrategyGuideButton topic-id="profit-calc" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难两档。简单对齐或略低于经典真题 1（利润=收入−支出；囤货涨价+仓储+损耗）；困难为 6
                类更高阶变式，每轮抽 4 题且题型不重复。本地组卷，每轮 4 题。不考利润率。
              </p>
              <ProfitCalcPanel ref="profitCalcPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-profit-calc" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">利润率计算</h4>
                <DataAnalysisStrategyGuideButton topic-id="profit-rate" />
              </div>
              <p class="mode-section__hint">
                仅简单/困难两档。简单对齐或略低于经典真题 2（利润率三式；成本/售价变动导致利润率百分点变化）；困难为 6
                类更高阶变式，每轮抽 4 题且题型不重复。本地组卷，每轮 4 题。答案多为利润率或百分点。
              </p>
              <ProfitRatePanel ref="profitRatePanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-profit-rate" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqConcentrationFoldOpen"
              @click="opHighfreqConcentrationFoldOpen = !opHighfreqConcentrationFoldOpen"
            >
              <span class="da-growth-fold__title">浓度问题</span>
              <span class="da-growth-fold__meta">基本公式 · 十字交叉 · 倒水加水</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqConcentrationFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqConcentrationFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">浓度问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="concentration" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐或略低于经典真题 1、2；普通对齐真题 1（分段加水加盐）与真题
                2（十字交叉）；困难含真题 3（倒水加水）等 7 类变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <ConcentrationPanel ref="concentrationPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-concentration" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opHighfreqPermCombFoldOpen"
              @click="opHighfreqPermCombFoldOpen = !opHighfreqPermCombFoldOpen"
            >
              <span class="da-growth-fold__title">排列组合问题</span>
              <span class="da-growth-fold__meta">基本原理及公式 · 限制条件型 · 经典模型 · 概率</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opHighfreqPermCombFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opHighfreqPermCombFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">基本原理及公式</h4>
                <DataAnalysisStrategyGuideButton topic-id="perm-comb-basic" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐示例 1～4（加法、乘法、排列、组合）；普通对齐经典真题
                1（枚举）与真题 2（间接法 2^n−2）；困难为 7 类更高阶变式，每轮抽 5
                题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <PermCombBasicPanel ref="permCombBasicPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-perm-comb-basic" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">限制条件型问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="perm-comb-constraint" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐经典真题 3（优限首尾）、真题 4（捆绑+居中）；普通对齐真题
                5（插空）、真题 6（归一法）；困难为 7 类更高阶变式（含环形、错位），每轮抽 6
                题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <PermCombConstraintPanel ref="permCombConstraintPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-perm-comb-constraint" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">排列组合经典模型</h4>
                <DataAnalysisStrategyGuideButton topic-id="perm-comb-classic" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐经典真题 7（环形排列）；普通对齐真题 8（错位重排）、真题
                9（同素分堆插板）；困难为 7 类更高阶变式，每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <PermCombClassicPanel ref="permCombClassicPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-perm-comb-classic" />

              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">概率问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="probability" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐经典真题 1（枚举 + 古典概率，本地组卷）；普通对齐真题
                2（分类相加 + 分步相乘，本地组卷）；困难对齐真题 3（几何概率，豆包改写题干），10
                类变式中每轮抽 6 题且题型不重复。每轮 6 题。
              </p>
              <ProbabilityPanel ref="probabilityPanelRef" />
              <MentalMathWrongBookPanel section="op-highfreq-probability" />
            </div>
          </div>
        </section>

        <section v-if="showOpOtherSection" class="mode-section" id="practice-op-other">
          <h3 class="mode-section__title">其他运算</h3>
          <p class="mode-section__hint">
            教材「数学运算其他题型」。当前开放容斥、数列、最值、日期、年龄、时钟、盈亏、鸡兔同笼、函数图象、比赛、逆推、分段（均默认折叠）；各子类均为简单/普通/困难三档（流程同资料分析：正计时、提交后暂停看解析）。
          </p>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherInclusionFoldOpen"
              @click="opOtherInclusionFoldOpen = !opOtherInclusionFoldOpen"
            >
              <span class="da-growth-fold__title">容斥问题</span>
              <span class="da-growth-fold__meta">两集合 · 三集合 · 最值</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherInclusionFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherInclusionFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">容斥问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="inclusion-exclusion" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐经典真题 1（两集合 + 都不）；普通对齐真题 2（三集合求恰好两项）；困难对齐真题
                3（多集合交最小值），10 类变式中每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <InclusionExclusionPanel ref="inclusionExclusionPanelRef" />
              <MentalMathWrongBookPanel section="op-other-inclusion-exclusion" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherSequenceFoldOpen"
              @click="opOtherSequenceFoldOpen = !opOtherSequenceFoldOpen"
            >
              <span class="da-growth-fold__title">数列问题</span>
              <span class="da-growth-fold__meta">等差 · 等比 · 通项求和</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherSequenceFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherSequenceFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">数列问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="sequence" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题 1、2 略易（直接通项/短求和/翻倍）；普通对齐真题 1（等差座位求和）、真题
                2（等比细菌翻倍）；困难为 10 类更高阶变式，每轮抽 6 题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <SequencePanel ref="sequencePanelRef" />
              <MentalMathWrongBookPanel section="op-other-sequence" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherExtremumFoldOpen"
              @click="opOtherExtremumFoldOpen = !opOtherExtremumFoldOpen"
            >
              <span class="da-growth-fold__title">最值问题</span>
              <span class="da-growth-fold__meta">最不利 · 和定分配 · 约束</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherExtremumFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherExtremumFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">最值问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="extremum" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐真题 2（最不利）、示例 1/2（和定相等/不等）；普通对齐真题
                1（二次利润）、真题 3（双约束分配）；困难为 10 类更高阶变式，每轮抽 6
                题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <ExtremumPanel ref="extremumPanelRef" />
              <MentalMathWrongBookPanel section="op-other-extremum" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherDateFoldOpen"
              @click="opOtherDateFoldOpen = !opOtherDateFoldOpen"
            >
              <span class="da-growth-fold__title">日期问题</span>
              <span class="da-growth-fold__meta">星期 · 月历 · 轮值</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherDateFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherDateFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">日期问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="date" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐示例 1/2/3（同年推星期、月历次数、休息日反推）；普通对齐真题
                1（跨年闰日）、真题 2（轮值）；困难为 8 类更高阶变式，每轮抽 6
                题且题型不重复。本地组卷，每轮 6 题。
              </p>
              <DatePanel ref="datePanelRef" />
              <MentalMathWrongBookPanel section="op-other-date" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherAgeFoldOpen"
              @click="opOtherAgeFoldOpen = !opOtherAgeFoldOpen"
            >
              <span class="da-growth-fold__title">年龄问题</span>
              <span class="da-growth-fold__meta">差不变 · 倍数 · 数轴</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherAgeFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherAgeFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">年龄问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="age" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更直接（差不变、出生年、和差、简单倍数）；普通对齐经典真题（数轴三段）及定比题；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <AgePanel ref="agePanelRef" />
              <MentalMathWrongBookPanel section="op-other-age" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherClockFoldOpen"
              @click="opOtherClockFoldOpen = !opOtherClockFoldOpen"
            >
              <span class="da-growth-fold__title">时钟问题</span>
              <span class="da-growth-fold__meta">夹角 · 坏钟 · 重合垂直</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherClockFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherClockFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">时钟问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="clock" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单对齐真题 1（已知时刻求夹角，解析含钟面图）；普通对齐真题
                2（坏钟比例）及重合/垂直/直线；困难为 8 类更高阶变式，每轮抽 5
                题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <ClockPanel ref="clockPanelRef" />
              <MentalMathWrongBookPanel section="op-other-clock" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherYingKuiFoldOpen"
              @click="opOtherYingKuiFoldOpen = !opOtherYingKuiFoldOpen"
            >
              <span class="da-growth-fold__title">盈亏问题</span>
              <span class="da-growth-fold__meta">盈亏 · 尽 · 差量</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherYingKuiFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherYingKuiFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">盈亏问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="ying-kui" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（一盈一尽、一亏一尽、两次皆盈/亏）；普通对齐经典真题（一盈一亏，末组不足化亏）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <YingKuiPanel ref="yingKuiPanelRef" />
              <MentalMathWrongBookPanel section="op-other-ying-kui" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherChickenRabbitFoldOpen"
              @click="opOtherChickenRabbitFoldOpen = !opOtherChickenRabbitFoldOpen"
            >
              <span class="da-growth-fold__title">鸡兔同笼问题</span>
              <span class="da-growth-fold__meta">假设法 · 头脚 · 座位</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherChickenRabbitFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherChickenRabbitFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">鸡兔同笼问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="chicken-rabbit" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（直接鸡兔/鹤龟假设法）；普通对齐经典真题（大中客车座位）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <ChickenRabbitPanel ref="chickenRabbitPanelRef" />
              <MentalMathWrongBookPanel section="op-other-chicken-rabbit" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherFunctionGraphFoldOpen"
              @click="opOtherFunctionGraphFoldOpen = !opOtherFunctionGraphFoldOpen"
            >
              <span class="da-growth-fold__title">函数图象问题</span>
              <span class="da-growth-fold__meta">认图 · 斜率 · 反比例</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherFunctionGraphFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherFunctionGraphFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">函数图象问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="function-graph" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（常速直线、反比例认图）；普通对齐经典真题（库存加速下降→越来越陡）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。豆包改写题干+曲线四选一，每轮 5 题。
              </p>
              <FunctionGraphPanel ref="functionGraphPanelRef" />
              <MentalMathWrongBookPanel section="op-other-function-graph" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherCompetitionFoldOpen"
              @click="opOtherCompetitionFoldOpen = !opOtherCompetitionFoldOpen"
            >
              <span class="da-growth-fold__title">比赛问题</span>
              <span class="da-growth-fold__meta">淘汰 · 循环 · 握手</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherCompetitionFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherCompetitionFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">比赛问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="competition" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（直接套淘汰/单双循环公式）；普通对齐经典真题（五人握手连线）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <CompetitionPanel ref="competitionPanelRef" />
              <MentalMathWrongBookPanel section="op-other-competition" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherReverseFoldOpen"
              @click="opOtherReverseFoldOpen = !opOtherReverseFoldOpen"
            >
              <span class="da-growth-fold__title">逆推问题</span>
              <span class="da-growth-fold__meta">还原 · 分数剩量</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherReverseFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherReverseFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">逆推问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="reverse" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（整步加减乘除还原）；普通对齐经典真题（多日修路分数剩量±常数）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <ReversePanel ref="reversePanelRef" />
              <MentalMathWrongBookPanel section="op-other-reverse" />
            </div>
          </div>

          <div class="da-growth-fold">
            <button
              type="button"
              class="da-growth-fold__toggle"
              :aria-expanded="opOtherSectionalFoldOpen"
              @click="opOtherSectionalFoldOpen = !opOtherSectionalFoldOpen"
            >
              <span class="da-growth-fold__title">分段问题</span>
              <span class="da-growth-fold__meta">阶梯计价 · 分段求量</span>
              <span
                class="da-growth-fold__chevron"
                :class="{ 'is-open': opOtherSectionalFoldOpen }"
              >
                ▾
              </span>
            </button>
            <div v-show="opOtherSectionalFoldOpen" class="da-growth-fold__body">
              <div class="da-topic-head">
                <h4 class="mode-section__subtitle">分段问题</h4>
                <DataAnalysisStrategyGuideButton topic-id="sectional" />
              </div>
              <p class="mode-section__hint">
                简单/普通/困难三档。简单比经典真题更易（两段电费/水费）；普通对齐经典真题（阶梯气价求最大用量）；困难为
                8 类更高阶变式，每轮抽 5 题且题型不重复。本地组卷，每轮 5 题。
              </p>
              <SectionalPanel ref="sectionalPanelRef" />
              <MentalMathWrongBookPanel section="op-other-sectional" />
            </div>
          </div>
        </section>

        <section v-if="showChineseSection" class="mode-section" id="practice-chinese">
          <h3 class="mode-section__title">语文练习</h3>
          <p class="mode-section__hint">
            面向公务员、事业单位备考；开放成语/词语识记、文言、修辞、阅读理解及公基常识等子功能。
          </p>
          <ChinesePracticeSection
            ref="chinesePracticeRef"
            @go-install="activeOutlineSection = 'install'"
          />
        </section>

        <PwaInstallPanel v-if="showInstallSection" />
      </div>
    </div>

    <div v-else-if="phase === 'countdown' && modeConfig && countdownValue" class="countdown-panel">
      <p class="countdown-mode">{{ modeConfig.label }}</p>
      <p
        class="countdown-value"
        :class="{ 'countdown-value--go': countdownValue === 'GO' }"
      >
        {{ countdownValue }}
      </p>
      <p class="countdown-hint">准备好，马上开始计时</p>
      <div class="session-actions">
        <el-button size="small" plain @click="retryCurrentMode">重来</el-button>
        <el-button size="small" @click="backToSelect">返回</el-button>
      </div>
    </div>

    <div
      v-else-if="
        phase === 'playing' &&
        modeConfig &&
        (question ||
          graphicQuestion ||
          twentyFourQuestion ||
          sudokuQuestion ||
          circleGrammarQuestion ||
          shortenSentenceQuestion)
      "
      class="play-panel"
    >
      <div class="play-top">
        <div class="play-meta">
          <div class="play-meta__main">
            <span class="play-mode">{{
              isCircleGrammarSession
                ? `圈出所有语法 · ${modeConfig.label}`
                : isShortenSentenceSession
                  ? `缩句练习 · ${modeConfig.label}`
                  : modeConfig.label
            }}</span>
            <span class="play-score">得分 <strong>{{ score }}</strong> / {{ modeConfig.maxScore }}</span>
          </div>
          <div class="session-actions session-actions--inline">
            <el-button size="small" plain @click="retryCurrentMode">重来</el-button>
            <el-button size="small" @click="backToSelect">返回</el-button>
          </div>
        </div>
        <div class="time-bar" :aria-label="isElapsedOnlySession ? '进度' : '剩余时间'">
          <div class="time-bar__fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div v-if="isElapsedOnlySession" class="time-bar__label">
          已用时 {{ (elapsedMs / 1000).toFixed(1) }} 秒 · 已答
          {{ records.length }} / {{ elapsedQuestionCount }}
        </div>
        <div v-else class="time-bar__label">{{ (remainingMs / 1000).toFixed(1) }} 秒</div>
      </div>

      <template v-if="graphicQuestion">
        <div
          class="question-block graphic-question-block"
          :class="{
            'question-block--ok': feedback === 'correct',
            'question-block--bad': feedback === 'wrong',
          }"
        >
          <p class="question-prompt">
            从所给图形中找出规律，选择最合适的图形填入问号处
            <span class="question-prompt__hint">
              （可试：旋转、形状循环、数量增减、填色交替、图形自转、四宫格填色、圆点平移等）
            </span>
          </p>
          <div class="sequence-row">
            <div
              v-for="(cell, idx) in graphicQuestion.sequence"
              :key="idx"
              class="sequence-slot"
            >
              <GraphicReasoningCell :cell="cell" />
            </div>
            <div class="sequence-slot sequence-slot--question">
              <span class="question-mark">?</span>
            </div>
          </div>
          <p v-if="feedback === 'correct'" class="feedback feedback--ok">答对了！</p>
          <p v-else-if="feedback === 'wrong'" class="feedback feedback--bad">
            答错了 · 规律：{{ graphicQuestion.ruleLabel }}
          </p>
        </div>

        <ul
          v-if="graphicQuestion"
          class="option-list"
          :class="`option-list--${graphicQuestion.options.length}`"
        >
          <li v-for="(opt, idx) in graphicQuestion.options" :key="idx">
            <button
              type="button"
              class="option-btn option-btn--graphic"
              :disabled="!acceptingInput"
              @click="applyAnswer(idx)"
            >
              <span class="option-btn__key">{{ idx + 1 }}</span>
              <GraphicReasoningCell :cell="opt" size="sm" />
            </button>
          </li>
        </ul>
      </template>

      <TwentyFourPointPanel
        v-else-if="twentyFourQuestion"
        ref="twentyFourPanelRef"
        :nums="twentyFourQuestion.nums"
        :feedback="feedback"
        :accepting-input="acceptingInput"
        :sample-solution="twentyFourQuestion.sampleSolution"
        @submit="finishTwentyFourAnswer"
      />

      <SudokuPanel
        v-else-if="sudokuQuestion"
        ref="sudokuPanelRef"
        :puzzle="sudokuQuestion.puzzle"
        :size="sudokuQuestion.size"
        :feedback="feedback"
        :accepting-input="acceptingInput"
        :solution-hint="formatSudokuGrid(sudokuQuestion.solution)"
        @submit="finishSudokuAnswer"
      />

      <CircleGrammarPanel
        v-else-if="circleGrammarQuestion"
        ref="circleGrammarPanelRef"
        :question="circleGrammarQuestion"
        :feedback="feedback"
        :accepting-input="acceptingInput"
        :reviewing="circleGrammarReviewing"
        :review-detail="circleGrammarFeedbackDetail"
        :question-index="circleGrammarQuestionIndex"
        :question-count="circleGrammarQuestionCount"
        :is-last="circleGrammarIsLastReview"
        @submit="finishCircleGrammarAnswer"
        @next="advanceCircleGrammar"
      />

      <ShortenSentencePanel
        v-else-if="shortenSentenceQuestion"
        ref="shortenSentencePanelRef"
        :question="shortenSentenceQuestion"
        :feedback="feedback"
        :accepting-input="acceptingInput"
        :reviewing="shortenSentenceReviewing"
        :review-detail="shortenSentenceFeedbackDetail"
        :question-index="shortenSentenceQuestionIndex"
        :question-count="shortenSentenceQuestionCount"
        :is-last="shortenSentenceIsLastReview"
        @submit="finishShortenSentenceAnswer"
        @next="advanceShortenSentence"
      />

      <template v-else-if="question">
        <div class="question-block">
          <p
            class="question-expression"
            :class="{
              'question-expression--prose': isLifeSenseSession || isGrammarJudgmentSession,
              'question-expression--ok': feedback === 'correct',
              'question-expression--bad': feedback === 'wrong',
            }"
          >
            {{ question.expression }}
          </p>
          <p v-if="feedback === 'correct'" class="feedback feedback--ok">答对了！</p>
          <p v-else-if="feedback === 'wrong'" class="feedback feedback--bad">答错了</p>
        </div>

        <ul class="option-list">
          <li v-for="(opt, idx) in question.options" :key="idx">
            <button
              type="button"
              class="option-btn"
              :disabled="!acceptingInput"
              @click="applyAnswer(idx)"
            >
              <span class="option-btn__key">{{ idx + 1 }}</span>
              <span class="option-btn__val">{{ opt }}</span>
            </button>
          </li>
        </ul>
      </template>

      <p
        v-if="
          !isTwentyFourSession &&
          !isSudokuSession &&
          !isCircleGrammarSession &&
          !isShortenSentenceSession &&
          mcqOptionCount > 0
        "
        class="hint"
      >
        键盘按 <kbd>1</kbd>～<kbd>{{ mcqOptionCount }}</kbd> 快速作答
      </p>
    </div>

    <div
      v-else-if="phase === 'finished' && modeConfig"
      class="result-panel"
      :class="{ 'result-panel--perfect': finishedByPerfect }"
    >
      <h3 class="result-title">
        {{
          finishedByPerfect
            ? '恭喜满分！'
            : isElapsedOnlySession
              ? '练习结束'
              : '时间到'
        }}
      </h3>
      <p v-if="finishedByPerfect && !isElapsedOnlySession" class="result-perfect">
        剩余时间 <strong>{{ (remainingMs / 1000).toFixed(1) }}</strong> 秒
      </p>
      <p v-if="isElapsedOnlySession" class="result-perfect">
        用时 <strong>{{ (elapsedMs / 1000).toFixed(1) }}</strong> 秒
      </p>
      <p class="result-score">
        最终得分：<strong>{{ score }}</strong> / {{ modeConfig.maxScore }}
      </p>
      <p class="result-stats">
        共 {{ sessionRecords.length }} 题 · 答对 {{ correctCount }} · 答错 {{ wrongCount }}
      </p>

      <div v-if="sessionRecords.length" class="result-log">
        <h4>本题记录</h4>
        <ul v-if="isGraphicSession">
          <li
            v-for="(r, i) in graphicRecords"
            :key="i"
            :class="r.correct ? 'log-ok' : 'log-bad'"
          >
            <span class="log-idx">{{ i + 1 }}.</span>
            <span class="log-expr">{{ r.ruleLabel }}</span>
            <span class="log-detail">
              选 {{ r.chosenIndex + 1 }}（正确 {{ r.correctIndex + 1 }}）· {{ r.correct ? '对' : '错' }}
            </span>
          </li>
        </ul>
        <ul v-else>
          <li v-for="(r, i) in records" :key="i" :class="r.correct ? 'log-ok' : 'log-bad'">
            <span class="log-idx">{{ i + 1 }}.</span>
            <span class="log-expr">{{ r.expression }}</span>
            <span class="log-detail">
              选 {{ r.chosenAnswer }}（正确 {{ r.correctAnswer }}）· {{ r.correct ? '对' : '错' }}
            </span>
            <p v-if="!r.correct && r.explanation" class="log-explain">
              错因：{{ r.explanation }}
            </p>
          </li>
        </ul>
      </div>

      <div class="result-actions session-actions">
        <el-button type="primary" @click="retryCurrentMode">重来</el-button>
        <el-button @click="backToSelect">返回</el-button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mental-math-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
  min-width: 0;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  gap: 0;
}

.page-hero {
  flex-shrink: 0;
  padding: 12px 12px 10px;
}

.practice-shell {
  flex: 1;
  min-height: 420px;
  display: grid;
  grid-template-columns: minmax(148px, 188px) minmax(0, 1fr);
  gap: 0;
  border: none;
  border-top: 1px solid var(--app-border-soft);
  border-radius: 0;
  overflow: hidden;
  background: var(--app-surface);
}

.practice-sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 8px;
  background: var(--app-surface-alt);
  border-right: 1px solid var(--app-border-soft);
  min-height: 0;
  overflow-y: auto;
}

.practice-sidebar__level1,
.practice-sidebar__level2 {
  display: none;
}

.practice-sidebar__flat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.practice-sidebar__group {
  display: none;
}

.practice-sidebar__item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--app-text-muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.12s ease,
    color 0.12s ease;
}

.practice-sidebar__item:hover {
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
  color: var(--el-text-color-primary);
}

.practice-sidebar__item--active {
  background: color-mix(in srgb, var(--el-color-primary-light-8) 80%, transparent);
  color: var(--el-color-primary);
}

.practice-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 18px 20px;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.page-kicker {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 6px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--app-text-muted);
}

.mode-select {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.mode-card--twentyfour {
  border-color: rgba(46, 125, 90, 0.35);
}

.mode-card--twentyfour:hover {
  border-color: rgba(46, 125, 90, 0.65);
  background: rgba(46, 125, 90, 0.06);
}

.mode-card--sudoku {
  border-color: rgba(72, 108, 160, 0.35);
}

.mode-card--sudoku:hover {
  border-color: rgba(72, 108, 160, 0.65);
  background: rgba(72, 108, 160, 0.06);
}

.mode-card--fraction {
  border-color: color-mix(in srgb, var(--el-color-success) 28%, var(--app-border-soft));
}

.mode-card--fraction:hover {
  border-color: color-mix(in srgb, var(--el-color-success) 45%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.1);
}

.mode-card--divisibility {
  border-color: color-mix(in srgb, #0d9488 28%, var(--app-border-soft));
}

.mode-card--divisibility:hover {
  border-color: color-mix(in srgb, #0d9488 50%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.12);
}

.mode-card--life-sense {
  border-color: color-mix(in srgb, #3d9b7a 28%, var(--app-border-soft));
}

.mode-card--life-sense:hover {
  border-color: color-mix(in srgb, #3d9b7a 50%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(61, 155, 122, 0.12);
}

.mode-card--grammar-judgment {
  border-color: color-mix(in srgb, #7c5cbf 28%, var(--app-border-soft));
}

.mode-card--grammar-judgment:hover {
  border-color: color-mix(in srgb, #7c5cbf 50%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(124, 92, 191, 0.12);
}

.mode-section__subtitle {
  margin: 18px 0 6px;
  font-size: 1rem;
  font-weight: 750;
  color: #0f172a;
}

.da-topic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 6px;
}

.da-topic-head .mode-section__subtitle {
  margin: 0;
  flex: 1;
  min-width: 0;
}

.da-growth-fold__body > .da-topic-head:first-child {
  margin-top: 0;
}

.da-growth-fold {
  margin-top: 14px;
  border: 1px solid color-mix(in srgb, #0d9488 22%, var(--app-border-soft, #e2e8f0));
  border-radius: 12px;
  background: color-mix(in srgb, #0d9488 4%, var(--app-card-bg, #fff));
  overflow: hidden;
}

.da-growth-fold__toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}

.da-growth-fold__toggle-row .da-growth-fold__toggle {
  flex: 1;
  min-width: 0;
}

.da-growth-fold__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.da-growth-fold__toggle:hover {
  background: color-mix(in srgb, #0d9488 8%, transparent);
}

.da-growth-fold__title {
  font-size: 1.05rem;
  font-weight: 750;
  color: #0f172a;
}

.da-growth-fold__meta {
  flex: 1;
  font-size: 13px;
  color: var(--app-text-muted, #64748b);
}

.da-growth-fold__chevron {
  font-size: 14px;
  color: #0d9488;
  transition: transform 0.18s ease;
}

.da-growth-fold__chevron.is-open {
  transform: rotate(180deg);
}

.da-growth-fold__body {
  padding: 0 14px 14px;
  border-top: 1px solid color-mix(in srgb, #0d9488 14%, transparent);
}

.da-growth-fold__body .mode-section__subtitle:first-child {
  margin-top: 12px;
}

/* 答题中：对齐四则运算，隐藏侧栏/页头/其它折叠与错题等干扰 */
.practice-shell--session-focus {
  grid-template-columns: 1fr;
}

.practice-main--session-focus > .mode-section > .mode-section__title,
.practice-main--session-focus > .mode-section > .mode-section__hint {
  display: none;
}

.practice-main--session-focus .da-growth-fold:not(:has([data-session-active])) {
  display: none;
}

.practice-main--session-focus .da-growth-fold:has([data-session-active]) {
  margin-top: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  overflow: visible;
}

.practice-main--session-focus .da-growth-fold:has([data-session-active]) .da-growth-fold__toggle,
.practice-main--session-focus .da-growth-fold:has([data-session-active]) .da-growth-fold__toggle-row {
  display: none;
}

.practice-main--session-focus .da-growth-fold:has([data-session-active]) .da-growth-fold__body {
  display: block !important;
  padding: 0;
  border-top: 0;
}

.practice-main--session-focus .da-growth-fold:has([data-session-active]) .da-topic-head,
.practice-main--session-focus .da-growth-fold:has([data-session-active]) .mode-section__hint,
.practice-main--session-focus .mm-wrong {
  display: none;
}

.practice-main--session-focus .chinese-idiom-panel:not([data-session-active]) {
  display: none;
}

.mode-card--circle-grammar {
  border-color: color-mix(in srgb, #0d9488 28%, var(--app-border-soft));
}

.mode-card--circle-grammar:hover {
  border-color: color-mix(in srgb, #0d9488 50%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.12);
}

.mode-card--shorten-sentence {
  border-color: color-mix(in srgb, #c2410c 28%, var(--app-border-soft));
}

.mode-card--shorten-sentence:hover {
  border-color: color-mix(in srgb, #c2410c 50%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(194, 65, 12, 0.12);
}

.mode-card--graphic {
  border-color: color-mix(in srgb, var(--el-color-warning) 28%, var(--app-border-soft));
}

.mode-card--graphic:hover {
  border-color: color-mix(in srgb, var(--el-color-warning) 45%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
}

.practice-sidebar__item:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mode-section__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
}

.mode-section__hint {
  margin: -4px 0 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.mode-grid {
  display: grid;
  gap: 14px;
}

.mode-card--power {
  border-color: color-mix(in srgb, var(--el-color-success) 25%, var(--app-border-soft));
}

.mode-card--power:hover {
  border-color: color-mix(in srgb, var(--el-color-success) 45%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.08);
}

.mode-card--square-cube {
  border-color: color-mix(in srgb, var(--el-color-primary) 22%, var(--app-border-soft));
}

.mode-card--square-cube:hover {
  border-color: color-mix(in srgb, var(--el-color-primary) 42%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
}

.mode-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border: 1px solid var(--app-border-soft);
  border-radius: 14px;
  background: var(--app-surface);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.mode-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
}

.mode-card__title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 0;
}

.mode-card__desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.mode-card__cta {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.countdown-panel,
.play-panel,
.result-panel {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.countdown-panel {
  border: 1px solid var(--app-border-soft);
  border-radius: 16px;
  padding: 48px 22px 56px;
  background: var(--app-surface);
  text-align: center;
}

.countdown-mode {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.countdown-value {
  margin: 0;
  font-size: clamp(4rem, 18vw, 6rem);
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
  animation: countdown-pop 0.35s ease-out;
}

.countdown-value--go {
  font-size: clamp(3rem, 14vw, 4.5rem);
  color: var(--el-color-success);
}

.countdown-hint {
  margin: 24px 0 0;
  font-size: 14px;
  color: var(--app-text-muted);
}

.session-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.session-actions--inline {
  margin-top: 0;
  justify-content: flex-end;
}

@keyframes countdown-pop {
  0% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.play-panel {
  border: 1px solid var(--app-border-soft);
  border-radius: 16px;
  padding: 20px 22px 24px;
  background: var(--app-surface);
}

.play-top {
  margin-bottom: 28px;
}

.play-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 10px;
  font-size: 14px;
}

.play-meta__main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  min-width: 0;
}

.play-mode {
  font-weight: 600;
}

.play-score strong {
  font-size: 1.25em;
  color: var(--el-color-primary);
}

.time-bar {
  height: 10px;
  border-radius: 999px;
  background: var(--app-surface-alt);
  overflow: hidden;
}

.time-bar__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  transition: width 0.05s linear;
}

.time-bar__label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--app-text-muted);
  text-align: right;
}

.question-block {
  text-align: center;
  margin-bottom: 24px;
}

.question-expression {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: pre-line;
  line-height: 1.45;
  transition: color 0.15s ease;
}

.question-expression--prose {
  font-size: clamp(1.05rem, 2.8vw, 1.35rem);
  font-weight: 650;
  text-align: left;
  max-width: 36em;
  margin-left: auto;
  margin-right: auto;
}

.question-expression--ok {
  color: var(--el-color-success);
}

.question-expression--bad {
  color: var(--el-color-danger);
}

.feedback {
  margin: 12px 0 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.feedback--ok {
  color: var(--el-color-success);
}

.feedback--bad {
  color: var(--el-color-danger);
}

.option-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
  cursor: pointer;
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.12s ease,
    background 0.12s ease;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--el-color-primary-light-5);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 60%, transparent);
}

.option-btn:disabled {
  opacity: 0.65;
  cursor: default;
}

.option-btn__key {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--app-surface);
  border: 1px solid var(--app-border-soft);
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.hint {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--app-text-muted);
}

.hint kbd {
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--app-border-soft);
  background: var(--app-surface-alt);
  font-size: 11px;
}

.result-panel {
  border: 1px solid var(--app-border-soft);
  border-radius: 16px;
  padding: 24px 22px;
  background: var(--app-surface);
}

.result-panel--perfect {
  border-color: color-mix(in srgb, var(--el-color-success) 45%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-success-light-9, #f0fdf4) 55%, var(--app-surface));
}

.result-title {
  margin: 0 0 8px;
  font-size: 1.25rem;
}

.result-panel--perfect .result-title {
  color: var(--el-color-success, #16a34a);
}

.result-perfect {
  margin: 0 0 8px;
  font-size: 1rem;
  color: var(--app-text-muted);
}

.result-perfect strong {
  font-size: 1.15em;
  color: var(--el-color-success, #16a34a);
}

.result-score {
  margin: 0 0 6px;
  font-size: 1.05rem;
}

.result-score strong {
  font-size: 1.4em;
  color: var(--el-color-primary);
}

.result-stats {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--app-text-muted);
}

.result-log h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--app-text-muted);
}

.result-log ul {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
}

.result-log li {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.45;
  border-bottom: 1px solid var(--app-border-soft);
}

.result-log li:last-child {
  border-bottom: none;
}

.log-ok {
  background: color-mix(in srgb, var(--el-color-success-light-9) 40%, transparent);
}

.log-bad {
  background: color-mix(in srgb, var(--el-color-danger-light-9) 35%, transparent);
}

.log-idx {
  font-weight: 600;
  margin-right: 6px;
}

.log-expr {
  font-weight: 600;
  margin-right: 8px;
}

.log-detail {
  color: var(--app-text-muted);
}

.log-explain {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
  font-weight: 400;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.graphic-question-block {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1px solid var(--app-border-soft);
  background: var(--app-surface-alt);
}

.graphic-question-block.question-block--ok {
  border-color: var(--el-color-success-light-5);
  background: color-mix(in srgb, var(--el-color-success-light-9) 50%, transparent);
}

.graphic-question-block.question-block--bad {
  border-color: var(--el-color-danger-light-5);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 45%, transparent);
}

.question-prompt {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.question-prompt__hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}

.sequence-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.sequence-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface);
}

.sequence-slot--question {
  border-style: dashed;
  border-color: var(--el-color-primary-light-5);
}

.question-mark {
  font-size: 2rem;
  font-weight: 800;
  color: var(--el-color-primary);
}

.option-list--3 {
  display: grid;
  gap: 10px;
}

.option-list--4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.option-btn--graphic {
  justify-content: flex-start;
}

.page-subtitle--compact {
  display: none;
}

@media (max-width: 900px) {
  .mode-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 640px) {
  .mental-math-page:has(.practice-shell) {
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
  }

  .page-hero {
    padding: 8px 12px 6px;
  }

  .page-title {
    margin: 0 0 4px;
    font-size: 1.2rem;
  }

  .page-subtitle--full {
    display: none;
  }

  .page-subtitle--compact {
    display: block;
    font-size: 13px;
    line-height: 1.45;
  }

  .practice-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    border-top: none;
    min-height: 0;
  }

  .practice-sidebar {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--app-border-soft);
    overflow-x: hidden;
    overflow-y: visible;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 30;
    background: color-mix(in srgb, var(--app-surface-alt) 92%, white);
    backdrop-filter: blur(8px);
  }

  .practice-sidebar__flat {
    display: none;
  }

  .practice-sidebar__level1,
  .practice-sidebar__level2 {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    overflow: visible;
  }

  .practice-sidebar__level1 {
    padding: 8px 10px 8px;
    background: color-mix(in srgb, var(--app-border-soft) 35%, var(--app-surface-alt));
    border-bottom: 1px solid var(--app-border);
  }

  .practice-sidebar__level2 {
    /* 与一级贴紧，避免粘连时中间露白 */
    margin-top: 0;
    padding: 8px 10px 10px;
    background: var(--app-surface);
  }

  .practice-sidebar__group {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: var(--app-text-muted);
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;
    text-align: center;
    white-space: normal;
    word-break: break-all;
    cursor: pointer;
  }

  .practice-sidebar__group--active {
    border-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent);
    background: var(--app-surface);
    color: var(--el-color-primary);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .practice-sidebar__group:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .practice-sidebar__item {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    text-align: center;
    padding: 7px 4px;
    border-radius: 999px;
    border: 1px solid var(--app-border-soft);
    background: var(--app-surface-alt);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
    white-space: normal;
    word-break: break-all;
  }

  .practice-sidebar__item--active {
    border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    background: color-mix(in srgb, var(--el-color-primary-light-9) 75%, transparent);
    color: var(--el-color-primary);
  }

  .practice-main {
    padding: 12px 12px 24px;
  }

  .mode-select {
    gap: 18px;
  }

  .mode-section__title {
    margin: 0 0 8px;
    font-size: 0.95rem;
  }

  .mode-section__hint {
    margin: -2px 0 10px;
    font-size: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mode-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .mode-card {
    padding: 12px 12px 14px;
    border-radius: 12px;
  }

  .mode-card__title {
    margin: 0 0 6px;
    font-size: 0.95rem;
  }

  .mode-card__desc {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mode-card__cta {
    font-size: 12px;
  }

  .countdown-panel,
  .play-panel,
  .result-panel {
    border-radius: 0;
    border-left: none;
    border-right: none;
    padding: 14px 12px 20px;
  }

  .play-top {
    margin-bottom: 16px;
  }

  .option-btn {
    padding: 12px 14px;
    min-height: 48px;
    font-size: 1.05rem;
  }

  .option-btn__key {
    display: none;
  }

  .hint {
    display: none;
  }

  .option-list--4 {
    grid-template-columns: 1fr;
  }

  .sequence-slot {
    width: 72px;
    height: 72px;
  }
}

@media (max-width: 380px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
}
</style>
