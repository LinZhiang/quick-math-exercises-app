import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import {
  DEEPSEEK_NOT_CONFIGURED_HINT,
  isAiChatConfigured,
  requestDataAnalysisPercentMcqs,
} from '@/services/deepseek'
import {
  appendGeneratedTerms,
  listRecentGeneratedTerms,
} from '@/utils/chineseGeneratedHistory'
import { createChineseWrongBookGate } from '@/utils/chineseWrongBookGate'
import { upsertMentalMathWrong } from '@/utils/mentalMathWrongBook'
import { playMentalMathStartSound } from '@/utils/mentalMathSounds'
import {
  DATA_ANALYSIS_QUESTION_COUNT,
  dataAnalysisDifficultyLabel,
  dataAnalysisTopicLabel,
  type DataAnalysisDifficulty,
  type DataAnalysisQuestion,
} from '@/utils/dataAnalysisPractice'

export type DataAnalysisPhase = 'idle' | 'loading' | 'running' | 'summary'

export type DataAnalysisResultRow = {
  unitIndex: number
  typeLabel: string
  title: string
  correct: boolean
  question: DataAnalysisQuestion
  chosenIndex: number | null
}

type PendingWrong = {
  fingerprint: string
  question: DataAnalysisQuestion
  chosenIndex: number
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

function saveDataAnalysisWrong(pending: PendingWrong) {
  const q = pending.question
  const expression = q.passage ? `${q.passage}\n\n${q.stem}` : q.stem
  const explainParts = [q.method ? `做法：${q.method}` : '', q.explanation]
    .map((s) => s.trim())
    .filter(Boolean)
  upsertMentalMathWrong({
    modeId: `data-analysis-${q.difficulty}`,
    expression,
    correctAnswer: q.options[q.correctIndex] ?? '',
    chosenAnswer: q.options[pending.chosenIndex] ?? '',
    options: q.options,
    explanation: explainParts.join('\n') || undefined,
  })
}

export function useDataAnalysisTest(difficulty: Ref<DataAnalysisDifficulty | null>) {
  const phase = ref<DataAnalysisPhase>('idle')
  const loadingMessage = ref('')
  const questions = ref<DataAnalysisQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const submitted = ref(false)
  const results = ref<DataAnalysisResultRow[]>([])
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)
  const carelessMarked = ref(false)

  const wrongGate = createChineseWrongBookGate<PendingWrong>((pending) => {
    saveDataAnalysisWrong(pending)
  })

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() =>
    questions.value.length > 0 ? questions.value.length : DATA_ANALYSIS_QUESTION_COUNT,
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

  async function generatePaper() {
    const diff = difficulty.value
    if (!diff) {
      ElMessage.warning('请先选择简单或复杂')
      return
    }
    if (!isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    phase.value = 'loading'
    loadingMessage.value = '正在生成题目…'
    try {
      const generated = await requestDataAnalysisPercentMcqs({
        count: DATA_ANALYSIS_QUESTION_COUNT,
        difficulty: diff,
        avoidTerms: listRecentGeneratedTerms('data-analysis-percent'),
        onProgress: (msg) => {
          loadingMessage.value = msg
        },
      })
      appendGeneratedTerms(
        'data-analysis-percent',
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

  async function regenerateAndStart() {
    await generatePaper()
    if (questions.value.length) startQuiz()
  }

  function selectOption(idx: number) {
    if (phase.value !== 'running' || submitted.value) return
    selectedIndex.value = idx
  }

  function submitCurrent() {
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
      typeLabel: `${dataAnalysisTopicLabel()} · ${dataAnalysisDifficultyLabel(q.difficulty)}`,
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
      ElMessage.error('错题保存失败')
    }
    carelessMarked.value = false
    if (currentIndex.value >= questions.value.length - 1) {
      finalizeElapsed()
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
    ElMessage.success('已标记为粗心答错，本题不入错题本')
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
