import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  DEEPSEEK_NOT_CONFIGURED_HINT,
  isAiChatConfigured,
  requestCurrentAffairsDrillMcqs,
  requestCurrentAffairsSentenceFillMcqs,
  requestCurrentAffairsSentenceOrderMcqs,
} from '@/services/deepseek'
import {
  appendGeneratedTerms,
  listRecentGeneratedTerms,
} from '@/utils/chineseGeneratedHistory'
import {
  buildCurrentAffairsDrillMaterialText,
  listCurrentAffairsSourceTitles,
  resolveCurrentAffairsDrillScope,
  type CurrentAffairsDrillScope,
} from '@/utils/currentAffairsDrillMaterial'
import {
  currentAffairsDrillModeLabel,
  currentAffairsDrillQuestionCountFor,
  currentAffairsDrillQuestionTypeLabel,
  type CurrentAffairsDrillMode,
  type CurrentAffairsDrillQuestion,
} from '@/utils/currentAffairsDrillPractice'
import { playMentalMathStartSound } from '@/utils/mentalMathSounds'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'
import type { ChinesePaperSource } from '@/types/chinese-practice'
import type {
  CurrentAffairsCategoryId,
  CurrentAffairsPeriodId,
} from '@/utils/currentAffairsTypes'

export type ChineseCurrentAffairsDrillPhase = 'idle' | 'loading' | 'running' | 'summary'

export type ChineseCurrentAffairsDrillResultRow = {
  unitIndex: number
  typeLabel: string
  title: string
  correct: boolean
  question: CurrentAffairsDrillQuestion
  chosenIndex: number | null
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

export function useChineseCurrentAffairsDrillTest() {
  const phase = ref<ChineseCurrentAffairsDrillPhase>('idle')
  const loadingMessage = ref('')
  const questions = ref<CurrentAffairsDrillQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const submitted = ref(false)
  const paperSource = ref<ChinesePaperSource>(null)
  const results = ref<ChineseCurrentAffairsDrillResultRow[]>([])
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)
  const activeScope = ref<CurrentAffairsDrillScope | null>(null)
  const drillMode = ref<CurrentAffairsDrillMode>('cloze')

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() => {
    if (questions.value.length > 0) return questions.value.length
    const category = activeScope.value?.category ?? 'politics'
    return currentAffairsDrillQuestionCountFor(drillMode.value, category)
  })
  const scopeLabel = computed(() => activeScope.value?.scopeLabel ?? '')
  const modeLabel = computed(() => currentAffairsDrillModeLabel(drillMode.value))
  const completionModeId = computed(() => {
    const key = activeScope.value?.scopeKey
    const prefix =
      drillMode.value === 'sentence-fill'
        ? 'chinese-current-affairs-sentence-fill'
        : drillMode.value === 'sentence-order'
          ? 'chinese-current-affairs-sentence-order'
          : 'chinese-current-affairs-drill'
    return key ? `${prefix}:${key}` : prefix
  })

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

  async function generatePaper(scope: CurrentAffairsDrillScope, mode: CurrentAffairsDrillMode) {
    if (!isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return false
    }
    const material = buildCurrentAffairsDrillMaterialText(scope)
    if (!material) {
      ElMessage.warning('当前栏目没有可用材料，无法出题')
      return false
    }
    activeScope.value = scope
    drillMode.value = mode
    phase.value = 'loading'
    loadingMessage.value =
      mode === 'sentence-fill'
        ? '正在生成语句填充题…'
        : mode === 'sentence-order'
          ? '正在生成语句排序题…'
          : '正在根据材料生成挖空题…'
    const historyKind =
      mode === 'sentence-fill'
        ? 'current-affairs-sentence-fill'
        : mode === 'sentence-order'
          ? 'current-affairs-sentence-order'
          : 'current-affairs-drill'
    try {
      const count = currentAffairsDrillQuestionCountFor(mode, scope.category)
      const generated =
        mode === 'sentence-fill'
          ? await requestCurrentAffairsSentenceFillMcqs({
              material,
              scopeLabel: scope.scopeLabel,
              scopeKey: `${scope.scopeKey}:sentence-fill`,
              allowedSourceTitles: listCurrentAffairsSourceTitles(scope),
              count,
              avoidTerms: listRecentGeneratedTerms(historyKind),
              onProgress: (msg) => {
                loadingMessage.value = msg
              },
            })
          : mode === 'sentence-order'
            ? await requestCurrentAffairsSentenceOrderMcqs({
                material,
                scopeLabel: scope.scopeLabel,
                scopeKey: `${scope.scopeKey}:sentence-order`,
                allowedSourceTitles: listCurrentAffairsSourceTitles(scope),
                count,
                avoidTerms: listRecentGeneratedTerms(historyKind),
                onProgress: (msg) => {
                  loadingMessage.value = msg
                },
              })
            : await requestCurrentAffairsDrillMcqs({
                material,
                scopeLabel: scope.scopeLabel,
                scopeKey: scope.scopeKey,
                allowedSourceTitles: listCurrentAffairsSourceTitles(scope),
                count,
                avoidTerms: listRecentGeneratedTerms(historyKind),
                onProgress: (msg) => {
                  loadingMessage.value = msg
                },
              })
      appendGeneratedTerms(
        historyKind,
        generated.map((q) => `${scope.scopeKey}:${q.term}`),
      )
      questions.value = generated
      currentIndex.value = 0
      selectedIndex.value = null
      submitted.value = false
      results.value = []
      phase.value = 'idle'
      ElMessage.success(`已生成 ${questions.value.length} 道题`)
      return true
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '生成题目失败')
      return false
    }
  }

  function startQuiz() {
    if (!questions.value.length) return
    paperSource.value = 'generated'
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    results.value = []
    phase.value = 'running'
    playMentalMathStartSound()
  }

  async function startDrillFor(
    periodId: CurrentAffairsPeriodId,
    category: CurrentAffairsCategoryId,
    mode: CurrentAffairsDrillMode = 'cloze',
  ) {
    const scope = resolveCurrentAffairsDrillScope(periodId, category)
    if (!scope) {
      ElMessage.warning('当前栏目没有材料，无法开测')
      return false
    }
    const ok = await generatePaper(scope, mode)
    if (ok && questions.value.length) {
      startQuiz()
      return true
    }
    return false
  }

  async function regenerateAndStart() {
    const scope = activeScope.value
    if (!scope) return
    const ok = await generatePaper(scope, drillMode.value)
    if (ok && questions.value.length) startQuiz()
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
      typeLabel: currentAffairsDrillQuestionTypeLabel(q.questionType),
      title: q.sourceTitle,
      correct,
      question: q,
      chosenIndex: selectedIndex.value,
    })
    submitted.value = true
  }

  function nextQuestion() {
    resumeQuizTimer()
    if (currentIndex.value >= questions.value.length - 1) {
      finalizeElapsed()
      incrementPracticeCompletion(completionModeId.value, {
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

  function resetToIdle() {
    clearQuizElapsedInterval()
    quizWallClockStartMs = null
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    submitted.value = false
    paperSource.value = null
    results.value = []
    quizElapsedMs.value = 0
    quizRunningDisplayMs.value = 0
    totalPausedMs = 0
    pauseStartMs = null
    activeScope.value = null
    drillMode.value = 'cloze'
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
    scopeLabel,
    modeLabel,
    drillMode,
    completionModeId,
    activeScope,
    quizDurationSummaryText,
    quizRunningElapsedText,
    quizTimerPaused,
    generatePaper,
    startQuiz,
    startDrillFor,
    regenerateAndStart,
    selectOption,
    submitCurrent,
    nextQuestion,
    resetToIdle,
  })
}
