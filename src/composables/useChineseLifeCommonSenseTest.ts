import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { isAiChatConfigured, requestLifeCommonSenseMcqs, DEEPSEEK_NOT_CONFIGURED_HINT } from '@/services/deepseek'
import {
  appendGeneratedTerms,
  listRecentGeneratedTerms,
} from '@/utils/chineseGeneratedHistory'
import { upsertChineseLifeCommonSenseWrong } from '@/utils/chineseLifeCommonSenseStorage'
import { createChineseWrongBookGate } from '@/utils/chineseWrongBookGate'
import {
  beginChineseKeyReviewSession,
  clearChineseKeyReviewSession,
  type ChineseKeyReviewMeta,
} from '@/utils/chineseKeyReviewSession'
import { noteWrongOrReplaceKeyReviewVariant } from '@/utils/chineseKeyReviewWrongReplace'
import { playMentalMathStartSound } from '@/utils/mentalMathSounds'
import {
  LIFE_COMMON_SENSE_QUESTION_COUNT,
  lifeCommonSenseQuestionTypeLabel,
  type LifeCommonSenseQuestion,
} from '@/utils/lifeCommonSensePractice'
import type { ChinesePaperSource } from '@/types/chinese-practice'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'

export type ChineseLifeCommonSensePhase = 'idle' | 'loading' | 'running' | 'summary'

export type ChineseLifeCommonSenseResultRow = {
  unitIndex: number
  typeLabel: string
  title: string
  correct: boolean
  question: LifeCommonSenseQuestion
  chosenIndex: number | null
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

export function useChineseLifeCommonSenseTest() {
  const phase = ref<ChineseLifeCommonSensePhase>('idle')
  const loadingMessage = ref('')
  const questions = ref<LifeCommonSenseQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const submitted = ref(false)
  const paperSource = ref<ChinesePaperSource>(null)
  const results = ref<ChineseLifeCommonSenseResultRow[]>([])
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null

  const wrongGate = createChineseWrongBookGate(upsertChineseLifeCommonSenseWrong)
  const carelessMarked = ref(false)

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() =>
    questions.value.length > 0 ? questions.value.length : LIFE_COMMON_SENSE_QUESTION_COUNT,
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
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    phase.value = 'loading'
    loadingMessage.value = '正在生成题目…'
    try {
      const generated = await requestLifeCommonSenseMcqs({
        count: LIFE_COMMON_SENSE_QUESTION_COUNT,
        avoidTerms: listRecentGeneratedTerms('life-common-sense'),
        onProgress: (msg) => {
          loadingMessage.value = msg
        },
      })
      appendGeneratedTerms(
        'life-common-sense',
        generated.map((q) => q.term),
      )
      questions.value = generated
      currentIndex.value = 0
      selectedIndex.value = null
      submitted.value = false
      results.value = []
      wrongGate.clearWrongGate()
      carelessMarked.value = false
      phase.value = 'idle'
      ElMessage.success(`已生成 ${questions.value.length} 道题`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '生成题目失败')
    }
  }

  function startQuiz(initialQuestions?: LifeCommonSenseQuestion[], opts?: { keyReview?: ChineseKeyReviewMeta }) {
    if (initialQuestions?.length) {
      questions.value = initialQuestions
      paperSource.value = 'review'
    } else {
      if (!questions.value.length) return
      paperSource.value = 'generated'
    }
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    if (opts?.keyReview) {
      beginChineseKeyReviewSession(opts.keyReview)
    } else {
      clearChineseKeyReviewSession()
    }
    wrongGate.clearWrongGate()
    carelessMarked.value = false
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
      typeLabel: lifeCommonSenseQuestionTypeLabel(q.questionType),
      title: q.term,
      correct,
      question: q,
      chosenIndex: selectedIndex.value,
    })
    submitted.value = true
    carelessMarked.value = false
    noteWrongOrReplaceKeyReviewVariant(correct, currentIndex.value, q, () => {
      wrongGate.noteWrongAnswer(q)
    })
  }

  function nextQuestion() {
    try {
      wrongGate.flushWrongIfNeeded()
    } catch {
      ElMessage.error('错题保存失败')
    }
    carelessMarked.value = false
    resumeQuizTimer()
    if (currentIndex.value >= questions.value.length - 1) {
      finalizeElapsed()
      incrementPracticeCompletion('chinese-life-common-sense', {
        correctCount: correctCount.value,
        totalCount: questions.value.length,
        durationMs: quizElapsedMs.value,
        perfect:
          questions.value.length > 0 && correctCount.value === questions.value.length,
      })
      phase.value = 'summary'
      return
    }
    currentIndex.value++
    selectedIndex.value = null
    submitted.value = false
  }


  function markCarelessWrong() {
    if (phase.value !== 'running' || !submitted.value) return
    const row = results.value[results.value.length - 1]
    if (!row || row.correct) return
    if (!wrongGate.markCarelessWrong()) {
      // already flushed or none
      return
    }
    carelessMarked.value = true
    ElMessage.success('已标记为粗心答错，本题不入错题本')
  }

  function resetToIdle() {
    clearQuizElapsedInterval()
    clearChineseKeyReviewSession()
    quizWallClockStartMs = null
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    wrongGate.clearWrongGate()
    carelessMarked.value = false
    paperSource.value = null
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
    paperSource,
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
    markCarelessWrong,
    carelessMarked,
    resetToIdle,
  })
}
