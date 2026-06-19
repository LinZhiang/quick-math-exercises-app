<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PRACTICE_HUB_SECTIONS,
  type PracticeHubSectionId,
} from '@/constants/practice-hub-sections'
import MentalMathPracticeGuide from '@/views/tools/mental-math/components/MentalMathPracticeGuide.vue'
import TwentyFourPointPanel from '@/views/tools/mental-math/components/TwentyFourPointPanel.vue'
import SudokuPanel from '@/views/tools/mental-math/components/SudokuPanel.vue'
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
  MENTAL_MATH_FRACTION_MODES,
  MENTAL_MATH_POWER_MODES,
  MENTAL_MATH_SQUARE_CUBE_MODES,
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

type Phase = 'select' | 'countdown' | 'playing' | 'finished'
type CountdownStep = 3 | 2 | 1 | 'GO'
type PracticeMode = MentalMathMode | GraphicReasoningMode | TwentyFourPointMode | SudokuMode

const COUNTDOWN_STEPS: CountdownStep[] = [3, 2, 1, 'GO']

const route = useRoute()
const phase = ref<Phase>('select')
const activeOutlineSection = ref<PracticeHubSectionId>('all')
const activeMode = ref<PracticeMode | null>(null)
const score = ref(0)
const question = ref<MentalMathQuestion | null>(null)
const graphicQuestion = ref<GraphicReasoningQuestion | null>(null)
const twentyFourQuestion = ref<TwentyFourPointQuestion | null>(null)
const twentyFourPanelRef = ref<InstanceType<typeof TwentyFourPointPanel> | null>(null)
const sudokuQuestion = ref<SudokuQuestion | null>(null)
const sudokuPanelRef = ref<InstanceType<typeof SudokuPanel> | null>(null)
const questionSeq = ref(0)
const records = ref<MentalMathAnswerRecord[]>([])
const graphicRecords = ref<GraphicReasoningAnswerRecord[]>([])
const remainingMs = ref(0)
const totalMs = ref(0)
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

function isGraphicMode(mode: PracticeMode): mode is GraphicReasoningMode {
  return mode === 'graphic'
}

const isTwentyFourSession = computed(
  () => activeMode.value != null && isTwentyFourPointMode(activeMode.value),
)

const isSudokuSession = computed(
  () => activeMode.value != null && isSudokuMode(activeMode.value),
)

const isGraphicSession = computed(
  () => activeMode.value != null && isGraphicMode(activeMode.value),
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
  return getMentalMathModeConfig(activeMode.value)
})

const progressPercent = computed(() => {
  if (totalMs.value <= 0) return 0
  return Math.max(0, Math.min(100, (remainingMs.value / totalMs.value) * 100))
})

const sessionRecords = computed(() =>
  isGraphicSession.value ? graphicRecords.value : records.value,
)

const correctCount = computed(() => sessionRecords.value.filter((r) => r.correct).length)
const wrongCount = computed(() => sessionRecords.value.filter((r) => !r.correct).length)

const showArithmeticSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'arithmetic',
)
const showPowerSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'power',
)
const showSquareCubeSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'square-cube',
)
const showFractionSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'fraction',
)
const showTwentyFourSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'twentyfour',
)
const showSudokuSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'sudoku',
)
const showGraphicSection = computed(
  () => activeOutlineSection.value === 'all' || activeOutlineSection.value === 'graphic',
)
const showGuideSection = computed(() => activeOutlineSection.value === 'guide')

const mcqOptionCount = computed(() => {
  const mode = activeMode.value
  if (!mode || isTwentyFourPointMode(mode) || isSudokuMode(mode)) return 0
  if (isGraphicMode(mode)) return getGraphicReasoningModeConfig(mode).optionCount
  return getMentalMathModeConfig(mode as MentalMathMode).optionCount
})

function selectOutlineSection(id: PracticeHubSectionId) {
  activeOutlineSection.value = id
}

function onGuideStartPractice(modeId: string) {
  startMode(modeId as PracticeMode)
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
  } else if (isTwentyFourPointMode(activeMode.value)) {
    const q = generateTwentyFourPointPuzzle(activeMode.value, questionSeq.value, lastQuestionFingerprint.value)
    twentyFourQuestion.value = q
    lastQuestionFingerprint.value = getTwentyFourQuestionFingerprint(q)
    question.value = null
    graphicQuestion.value = null
    sudokuQuestion.value = null
  } else if (isSudokuMode(activeMode.value)) {
    const q = generateSudokuPuzzle(activeMode.value, questionSeq.value, lastQuestionFingerprint.value)
    sudokuQuestion.value = q
    lastQuestionFingerprint.value = getSudokuQuestionFingerprint(q)
    question.value = null
    graphicQuestion.value = null
    twentyFourQuestion.value = null
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
  }
  feedback.value = null
  acceptingInput.value = true
}

function finishSession(perfect = false) {
  clearTimers()
  acceptingInput.value = false
  finishedByPerfect.value = perfect
  if (perfect) {
    syncRemainingFromSession()
    prepareQbPerfectMidi()
    if (!tryPlayQbPerfectMidiSync()) {
      void startQbPerfectMidi()
    }
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
  const cfg = isGraphicMode(mode)
    ? getGraphicReasoningModeConfig(mode)
    : isTwentyFourPointMode(mode)
      ? getTwentyFourPointModeConfig(mode)
      : isSudokuMode(mode)
        ? getSudokuModeConfig(mode)
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
  sessionStartMs = Date.now()
  phase.value = 'playing'
  nextQuestion()

  timerHandle = setInterval(() => {
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
    })
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
    isSudokuMode(activeMode.value)
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
  feedback.value = null
  countdownValue.value = null
  lastQuestionFingerprint.value = null
  sessionQuestionFingerprints.value = new Set()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  prepareQbPerfectMidi()
  const hash = route.hash.replace('#', '')
  if (hash === 'guide' || route.query.section === 'guide') {
    activeOutlineSection.value = 'guide'
  } else if (hash === 'twentyfour' || route.query.section === 'twentyfour') {
    activeOutlineSection.value = 'twentyfour'
  } else if (hash === 'sudoku' || route.query.section === 'sudoku') {
    activeOutlineSection.value = 'sudoku'
  } else if (hash === 'graphic' || route.query.section === 'graphic') {
    activeOutlineSection.value = 'graphic'
  } else if (hash === 'fraction' || route.query.section === 'fraction') {
    activeOutlineSection.value = 'fraction'
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
    <header class="page-hero">
      <h2 class="page-title">口算练习</h2>
      <p class="page-subtitle">
        限时口算、次幂、平方与立方、估算分数与图形推理，结果仅在本页展示、不写入本地。左侧可打开「练习攻略」或切换分类；按数字键
        <strong>1～3</strong>、<strong>1～4</strong> 或 <strong>1～5</strong> 作答；答对
        <strong>+1 秒</strong>，答错 <strong>-1 秒</strong>。
      </p>
    </header>

    <div v-if="phase === 'select'" class="practice-shell">
      <aside class="practice-sidebar" aria-label="练习大纲">
        <button
          v-for="section in PRACTICE_HUB_SECTIONS"
          :key="section.id"
          type="button"
          class="practice-sidebar__item"
          :class="{ 'practice-sidebar__item--active': activeOutlineSection === section.id }"
          @click="selectOutlineSection(section.id)"
        >
          {{ section.title }}
        </button>
      </aside>

      <div class="practice-main mode-select">
        <MentalMathPracticeGuide
          v-if="showGuideSection"
          @start-practice="onGuideStartPractice"
        />
        <section v-if="showArithmeticSection" class="mode-section" id="practice-arithmetic">
          <h3 class="mode-section__title">四则口算</h3>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_ARITHMETIC_MODES"
              :key="m.id"
              type="button"
              class="mode-card"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showPowerSection" class="mode-section" id="practice-power">
          <h3 class="mode-section__title">2 的 n 次幂</h3>
          <p class="mode-section__hint">
            题目形如 2ⁿ（简单含 2⁻¹～2⁻³ 与 2⁰～2¹²；复杂含 2⁻²～2⁻⁶ 与 2¹⁰～2²⁴），干扰项为相邻次幂。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_POWER_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--power"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showSquareCubeSection" class="mode-section" id="practice-square-cube">
          <h3 class="mode-section__title">平方与立方</h3>
          <p class="mode-section__hint">
            题目随机为 n² 或 n³（不含 10²、10³；简单：平方 n≤11、立方 n≤6；复杂：平方 7～20、立方 3～9），干扰项为相邻底数的同次幂且选项数值互不重复。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_SQUARE_CUBE_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--square-cube"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showFractionSection" class="mode-section" id="practice-fraction">
          <h3 class="mode-section__title">估算分数</h3>
          <p class="mode-section__hint">
            百分数转最简分数，或比较两个分数的大小；简单题为常见百分数与同分母比较，高难题含 12.5%、33% 等及异分母接近分数。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in MENTAL_MATH_FRACTION_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--fraction"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>

        <section v-if="showTwentyFourSection" class="mode-section" id="practice-twentyfour">
          <h3 class="mode-section__title">二十四点</h3>
          <p class="mode-section__hint">
            用给出的四个数，通过加、减、乘、除（可加括号）自行拼出等于 24 的算式；四数各用一次。
          </p>
          <div class="mode-grid">
            <button
              v-for="m in TWENTY_FOUR_POINT_MODES"
              :key="m.id"
              type="button"
              class="mode-card mode-card--twentyfour"
              @click="startMode(m.id)"
            >
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
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
              <h3 class="mode-card__title">{{ m.label }}</h3>
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
              <h3 class="mode-card__title">{{ m.label }}</h3>
              <p class="mode-card__desc">{{ m.desc }}</p>
              <span class="mode-card__cta">开始练习</span>
            </button>
          </div>
        </section>
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
        (question || graphicQuestion || twentyFourQuestion || sudokuQuestion)
      "
      class="play-panel"
    >
      <div class="play-top">
        <div class="play-meta">
          <div class="play-meta__main">
            <span class="play-mode">{{ modeConfig.label }}</span>
            <span class="play-score">得分 <strong>{{ score }}</strong> / {{ modeConfig.maxScore }}</span>
          </div>
          <div class="session-actions session-actions--inline">
            <el-button size="small" plain @click="retryCurrentMode">重来</el-button>
            <el-button size="small" @click="backToSelect">返回</el-button>
          </div>
        </div>
        <div class="time-bar" aria-label="剩余时间">
          <div class="time-bar__fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="time-bar__label">{{ (remainingMs / 1000).toFixed(1) }} 秒</div>
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

      <template v-else-if="question">
        <div class="question-block">
          <p
            class="question-expression"
            :class="{
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

      <p v-if="!isTwentyFourSession && !isSudokuSession && mcqOptionCount > 0" class="hint">
        键盘按 <kbd>1</kbd>～<kbd>{{ mcqOptionCount }}</kbd> 快速作答
      </p>
    </div>

    <div
      v-else-if="phase === 'finished' && modeConfig"
      class="result-panel"
      :class="{ 'result-panel--perfect': finishedByPerfect }"
    >
      <h3 class="result-title">
        {{ finishedByPerfect ? '恭喜满分！' : '时间到' }}
      </h3>
      <p v-if="finishedByPerfect" class="result-perfect">
        剩余时间 <strong>{{ (remainingMs / 1000).toFixed(1) }}</strong> 秒
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
  max-width: 1120px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 20px 24px;
  gap: 12px;
}

.page-hero {
  flex-shrink: 0;
}

.practice-shell {
  flex: 1;
  min-height: 420px;
  display: grid;
  grid-template-columns: minmax(148px, 188px) minmax(0, 1fr);
  gap: 0;
  border: 1px solid var(--app-border-soft);
  border-radius: 14px;
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

.mode-card--graphic {
  border-color: color-mix(in srgb, var(--el-color-warning) 28%, var(--app-border-soft));
}

.mode-card--graphic:hover {
  border-color: color-mix(in srgb, var(--el-color-warning) 45%, var(--app-border-soft));
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
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

@media (max-width: 640px) {
  .practice-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .practice-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    border-right: none;
    border-bottom: 1px solid var(--app-border-soft);
    overflow-y: visible;
    flex-shrink: 0;
  }

  .practice-sidebar__item {
    flex: 1 1 auto;
    text-align: center;
    padding: 8px 10px;
  }

  .option-list--4 {
    grid-template-columns: 1fr;
  }

  .sequence-slot {
    width: 72px;
    height: 72px;
  }
}
</style>
