import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { isAiChatConfigured, requestCommonSenseMcqs } from '@/services/deepseek'
import { upsertChineseCommonSenseWrong } from '@/utils/chineseCommonSenseStorage'
import { playMentalMathStartSound } from '@/utils/mentalMathSounds'
import {
  COMMON_SENSE_QUESTION_COUNT,
  commonSenseQuestionTypeLabel,
  type CommonSenseQuestion,
} from '@/utils/commonSensePractice'

export type ChineseCommonSensePhase = 'idle' | 'loading' | 'running' | 'summary'

export type ChineseCommonSenseResultRow = {
  unitIndex: number
  typeLabel: string
  title: string
  correct: boolean
  question: CommonSenseQuestion
  chosenIndex: number | null
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

export function useChineseCommonSenseTest() {
  const phase = ref<ChineseCommonSensePhase>('idle')
  const loadingMessage = ref('')
  const questions = ref<CommonSenseQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const submitted = ref(false)
  const results = ref<ChineseCommonSenseResultRow[]>([])
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() =>
    questions.value.length > 0 ? questions.value.length : COMMON_SENSE_QUESTION_COUNT,
  )

  const quizDurationSummaryText = computed(() => {
    if (quizElapsedMs.value <= 0) return ''
    return `测验总用时 ${formatDuration(quizElapsedMs.value)}`
  })

  const quizRunningElapsedText = computed(() => {
    if (phase.value !== 'running') return ''
    const paused = pauseStartMs != null ? ' · 计时暂停' : ''
    return `已用时 ${formatDuration(quizRunningDisplayMs.value)}${paused}`
  })

  const quizTimerPaused = computed(() => pauseStartMs != null)

  function getRunningElapsedMs(): number {
    if (quizWallClockStartMs == null) return quizRunningDisplayMs.value
    let paused = totalPausedMs
    if (pauseStartMs != null) paused += Math.round(performance.now() - pauseStartMs)
    return Math.max(0, Math.round(performance.now() - quizWallClockStartMs - paused))
  }

  function pauseQuizTimer() {
    if (phase.value !== 'running' || pauseStartMs != null) return
    pauseStartMs = performance.now()
  }

  function resumeQuizTimer() {
    if (pauseStartMs == null) return
    totalPausedMs += Math.round(performance.now() - pauseStartMs)
    pauseStartMs = null
    if (quizWallClockStartMs != null) {
      quizRunningDisplayMs.value = getRunningElapsedMs()
    }
  }

  function clearQuizElapsedInterval() {
    if (quizElapsedIntervalId != null) {
      window.clearInterval(quizElapsedIntervalId)
      quizElapsedIntervalId = null
    }
  }

  function finalizeElapsed() {
    if (pauseStartMs != null) {
      totalPausedMs += Math.round(performance.now() - pauseStartMs)
      pauseStartMs = null
    }
    if (quizWallClockStartMs != null) {
      quizElapsedMs.value = getRunningElapsedMs()
      quizRunningDisplayMs.value = quizElapsedMs.value
      quizWallClockStartMs = null
    }
  }

  async function generatePaper() {
    if (!isAiChatConfigured()) {
      ElMessage.warning('未配置 AI 代理：开发时请同时启动主站 server（8787）')
      return
    }
    phase.value = 'loading'
    loadingMessage.value = '正在生成题目…'
    try {
      questions.value = await requestCommonSenseMcqs({
        count: COMMON_SENSE_QUESTION_COUNT,
        onProgress: (msg) => {
          loadingMessage.value = msg
        },
      })
      currentIndex.value = 0
      selectedIndex.value = null
      submitted.value = false
      results.value = []
      phase.value = 'idle'
      ElMessage.success(`已生成 ${questions.value.length} 道题`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '生成题目失败')
    }
  }

  function startQuiz(initialQuestions?: CommonSenseQuestion[]) {
    if (initialQuestions?.length) questions.value = initialQuestions
    if (!questions.value.length) return
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    phase.value = 'running'
    playMentalMathStartSound()
  }

  async function regenerateAndStart() {
    await generatePaper()
    if (questions.value.length) startQuiz()
  }

  function selectOption(idx: number) {
    if (phase.value !== 'running' || submitted.value) return
    selectedIndex.value = idx
  }

  async function submitCurrent() {
    const q = currentQuestion.value
    if (!q || selectedIndex.value == null) {
      ElMessage.warning('请先选择一个选项')
      return
    }
    if (submitted.value) return
    pauseQuizTimer()
    const correct = selectedIndex.value === q.correctIndex
    results.value.push({
      unitIndex: currentIndex.value + 1,
      typeLabel: commonSenseQuestionTypeLabel(q.questionType),
      title: q.term,
      correct,
      question: q,
      chosenIndex: selectedIndex.value,
    })
    submitted.value = true
    if (!correct) {
      try {
        upsertChineseCommonSenseWrong(q)
      } catch {
        ElMessage.error('错题保存失败')
      }
    }
  }

  function nextQuestion() {
    resumeQuizTimer()
    if (currentIndex.value >= questions.value.length - 1) {
      finalizeElapsed()
      phase.value = 'summary'
      return
    }
    currentIndex.value++
    selectedIndex.value = null
    submitted.value = false
  }

  function resetToIdle() {
    clearQuizElapsedInterval()
    quizWallClockStartMs = null
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    quizElapsedMs.value = 0
    quizRunningDisplayMs.value = 0
    totalPausedMs = 0
    pauseStartMs = null
  }

  watch(
    () => phase.value,
    (p, prev) => {
      if (p === 'running' && prev !== 'running') {
        quizWallClockStartMs = performance.now()
        quizRunningDisplayMs.value = 0
        quizElapsedMs.value = 0
        totalPausedMs = 0
        pauseStartMs = null
        clearQuizElapsedInterval()
        const tick = () => {
          if (quizWallClockStartMs == null || pauseStartMs != null) return
          quizRunningDisplayMs.value = getRunningElapsedMs()
        }
        tick()
        quizElapsedIntervalId = window.setInterval(tick, 1000)
      } else if (p !== 'running') {
        clearQuizElapsedInterval()
      }
      if (p === 'summary' && prev === 'running') finalizeElapsed()
    },
  )

  onBeforeUnmount(clearQuizElapsedInterval)

  return reactive({
    phase,
    loadingMessage,
    questions,
    currentIndex,
    selectedIndex,
    submitted,
    results,
    currentQuestion,
    correctCount,
    questionCount,
    quizDurationSummaryText,
    quizRunningElapsedText,
    quizTimerPaused,
    generatePaper,
    startQuiz,
    regenerateAndStart,
    selectOption,
    submitCurrent,
    nextQuestion,
    resetToIdle,
  })
}
