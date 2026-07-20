import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import { createChineseWrongBookGate } from '@/utils/chineseWrongBookGate'
import { upsertMentalMathWrong } from '@/utils/mentalMathWrongBook'
import { playMentalMathStartSound } from '@/utils/mentalMathSounds'
import {
  PERM_COMB_CLASSIC_QUESTION_COUNT,
  permCombClassicDifficultyLabel,
  permCombClassicTopicLabel,
  generatePermCombClassicPaper,
  type PermCombClassicDifficulty,
  type PermCombClassicQuestion,
} from '@/utils/permCombClassicPractice'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'

export type PermCombClassicPhase = 'idle' | 'loading' | 'running' | 'summary'

export type PermCombClassicResultRow = {
  unitIndex: number
  typeLabel: string
  title: string
  correct: boolean
  question: PermCombClassicQuestion
  chosenIndex: number | null
}

type PendingWrong = {
  fingerprint: string
  question: PermCombClassicQuestion
  chosenIndex: number
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} ?`
  return `${m} ? ${s} ?`
}

function saveWrong(pending: PendingWrong) {
  const q = pending.question
  const expression = [q.passage, q.stem].filter(Boolean).join('\n\n')
  const explainParts = [q.method ? `???${q.method}` : '', q.explanation]
    .map((s) => s.trim())
    .filter(Boolean)
  upsertMentalMathWrong({
    modeId: `op-highfreq-perm-comb-classic-${q.difficulty}`,
    expression,
    correctAnswer: q.options[q.correctIndex] ?? '',
    chosenAnswer: q.options[pending.chosenIndex] ?? '',
    options: q.options,
    explanation: explainParts.join('\n') || undefined,
  })
}

export function usePermCombClassicTest(difficulty: Ref<PermCombClassicDifficulty | null>) {
  const phase = ref<PermCombClassicPhase>('idle')
  const loadingMessage = ref('')
  const questions = ref<PermCombClassicQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const submitted = ref(false)
  const results = ref<PermCombClassicResultRow[]>([])
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)
  const carelessMarked = ref(false)

  const wrongGate = createChineseWrongBookGate<PendingWrong>((pending) => {
    saveWrong(pending)
  })

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() =>
    questions.value.length > 0 ? questions.value.length : PERM_COMB_CLASSIC_QUESTION_COUNT,
  )

  const quizDurationSummaryText = computed(() => {
    if (quizElapsedMs.value <= 0) return ''
    return `????? ${formatDuration(quizElapsedMs.value)}`
  })

  const quizRunningElapsedText = computed(() => {
    if (phase.value !== 'running') return ''
    const paused = pauseStartMs != null ? ' ? ????' : ''
    return `??? ${formatDuration(quizRunningDisplayMs.value)}${paused}`
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

  function startQuizClock() {
    clearQuizElapsedInterval()
    quizWallClockStartMs = performance.now()
    totalPausedMs = 0
    pauseStartMs = null
    quizElapsedMs.value = 0
    quizRunningDisplayMs.value = 0
    quizElapsedIntervalId = window.setInterval(() => {
      if (pauseStartMs != null) return
      quizRunningDisplayMs.value = getRunningElapsedMs()
    }, 200)
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
    clearQuizElapsedInterval()
  }

  function generatePaper() {
    const diff = difficulty.value
    if (!diff) {
      ElMessage.warning('????????????')
      return
    }
    phase.value = 'loading'
    loadingMessage.value = '?????'
    try {
      const generated = generatePermCombClassicPaper(diff)
      if (generated.length < PERM_COMB_CLASSIC_QUESTION_COUNT) {
        throw new Error('??????????')
      }
      questions.value = generated
      currentIndex.value = 0
      selectedIndex.value = null
      submitted.value = false
      results.value = []
      wrongGate.clearWrongGate()
      carelessMarked.value = false
      phase.value = 'idle'
      ElMessage.success(`??? ${questions.value.length} ??`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '??????')
    }
  }

  function startQuiz() {
    if (!questions.value.length) return
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    wrongGate.clearWrongGate()
    carelessMarked.value = false
    phase.value = 'running'
    startQuizClock()
    playMentalMathStartSound()
  }

  function regenerateAndStart() {
    generatePaper()
    if (questions.value.length) startQuiz()
  }

  function selectOption(idx: number) {
    if (phase.value !== 'running' || submitted.value) return
    selectedIndex.value = idx
  }

  function submitCurrent() {
    const q = currentQuestion.value
    if (!q || selectedIndex.value == null) {
      ElMessage.warning('????????')
      return
    }
    if (submitted.value) return
    pauseQuizTimer()
    const correct = selectedIndex.value === q.correctIndex
    results.value.push({
      unitIndex: currentIndex.value + 1,
      typeLabel: `${permCombClassicTopicLabel()} ? ${permCombClassicDifficultyLabel(q.difficulty)}`,
      title: q.term || q.stem.slice(0, 24),
      correct,
      question: q,
      chosenIndex: selectedIndex.value,
    })
    submitted.value = true
    carelessMarked.value = false
    if (!correct) {
      wrongGate.noteWrongAnswer({
        fingerprint: q.fingerprint,
        question: q,
        chosenIndex: selectedIndex.value,
      })
    }
  }

  function nextQuestion() {
    if (!submitted.value) return
    try {
      wrongGate.flushWrongIfNeeded()
    } catch {
      ElMessage.error('??????')
    }
    carelessMarked.value = false
    if (currentIndex.value >= questions.value.length - 1) {
      finalizeElapsed()
      if (difficulty.value) {
        incrementPracticeCompletion(`op-highfreq-perm-comb-classic-${difficulty.value}`)
      }
      phase.value = 'summary'
      return
    }
    currentIndex.value += 1
    selectedIndex.value = null
    submitted.value = false
    resumeQuizTimer()
  }

  function markCarelessWrong() {
    if (phase.value !== 'running' || !submitted.value) return
    const row = results.value[results.value.length - 1]
    if (!row || row.correct) return
    if (!wrongGate.markCarelessWrong()) return
    carelessMarked.value = true
    ElMessage.success('????????????????')
  }

  function resetToIdle() {
    finalizeElapsed()
    clearQuizElapsedInterval()
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    wrongGate.clearWrongGate()
    carelessMarked.value = false
    quizElapsedMs.value = 0
    quizRunningDisplayMs.value = 0
  }

  onBeforeUnmount(() => {
    clearQuizElapsedInterval()
  })

  return {
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
    quizElapsedMs,
    quizRunningDisplayMs,
    quizDurationSummaryText,
    quizRunningElapsedText,
    quizTimerPaused,
    carelessMarked,
    generatePaper,
    startQuiz,
    regenerateAndStart,
    selectOption,
    submitCurrent,
    nextQuestion,
    markCarelessWrong,
    resetToIdle,
  }
}
