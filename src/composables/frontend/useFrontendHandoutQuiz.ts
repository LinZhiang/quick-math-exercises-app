import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { isAiChatConfigured, requestFrontendHandoutQuiz, requestFrontendQuizVariant, DEEPSEEK_NOT_CONFIGURED_HINT } from '@/services/deepseek'
import {
  calcAnswerMatches,
  clampFrontendQuizCounts,
  frontendQuizKindLabel,
  totalFrontendQuizCount,
  type FrontendQuizCounts,
  type FrontendQuizQuestion,
  DEFAULT_FRONTEND_QUIZ_COUNTS,
} from '@/utils/frontend/frontendHandoutQuiz'
import {
  appendFrontendQuizAvoidStems,
  bumpFrontendQuizAttempt,
  listFrontendQuizAvoidStems,
  upsertFrontendQuizWrong,
} from '@/utils/frontend/frontendHandoutQuizStorage'
import { createChineseWrongBookGate } from '@/utils/chinese/chineseWrongBookGate'
import { getAiProvider, setAiProvider, type AiProvider } from '@/utils/app/aiProviderStore'
import { stripHandoutImagesForAi, type FrontendHandoutItem } from '@/utils/frontend/frontendLearning'
import { formatLogDuration } from '@/utils/app/practiceSessionLog'
import { logFrontendQuizSession } from '@/utils/frontend/frontendStudyLog'

export type FrontendQuizSelfScore = 'full' | 'partial' | 'zero'

export type FrontendQuizPhase = 'idle' | 'loading' | 'running' | 'summary'

export function useFrontendHandoutQuiz() {
  const phase = ref<FrontendQuizPhase>('idle')
  const loadingMessage = ref('')
  const counts = ref<FrontendQuizCounts>({ ...DEFAULT_FRONTEND_QUIZ_COUNTS })
  const questions = ref<FrontendQuizQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const calcInput = ref('')
  const shortInput = ref('')
  const submitted = ref(false)
  const selfScore = ref<FrontendQuizSelfScore | null>(null)
  const results = ref<
    {
      unitIndex: number
      correct: boolean
      careless?: boolean
      selfScore?: FrontendQuizSelfScore | null
      question: FrontendQuizQuestion
      chosen: string
    }[]
  >([])
  const carelessMarked = ref(false)
  const quizStartedAt = ref(0)
  const elapsedMs = ref(0)
  const quizTimerPaused = ref(false)
  let elapsedTimer = 0
  let pauseStartMs: number | null = null
  let totalPausedMs = 0
  let loggedSession = false
  let quizItem: FrontendHandoutItem | null = null
  const skipWrongBook = ref(false)
  const recordAttempts = ref(false)
  const wrongGate = createChineseWrongBookGate(upsertFrontendQuizWrong)

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() => questions.value.length)
  const elapsedClockText = computed(() => {
    const t = formatLogDuration(elapsedMs.value) || '0 秒'
    return `已用时 ${t}`
  })
  const elapsedText = computed(() =>
    quizTimerPaused.value ? `${elapsedClockText.value} · 计时暂停` : elapsedClockText.value,
  )

  function stopElapsedTimer() {
    if (elapsedTimer) {
      window.clearInterval(elapsedTimer)
      elapsedTimer = 0
    }
  }

  function tickElapsed() {
    if (!quizStartedAt.value) {
      elapsedMs.value = 0
      return
    }
    let paused = totalPausedMs
    if (pauseStartMs != null) paused += Math.max(0, Date.now() - pauseStartMs)
    elapsedMs.value = Math.max(0, Date.now() - quizStartedAt.value - paused)
  }

  function startElapsedTimer() {
    stopElapsedTimer()
    tickElapsed()
    elapsedTimer = window.setInterval(tickElapsed, 250)
  }

  function pauseQuizTimer() {
    if (phase.value !== 'running' || pauseStartMs != null) return
    tickElapsed()
    pauseStartMs = Date.now()
    quizTimerPaused.value = true
  }

  function resumeQuizTimer() {
    if (pauseStartMs == null) return
    totalPausedMs += Math.max(0, Date.now() - pauseStartMs)
    pauseStartMs = null
    quizTimerPaused.value = false
    tickElapsed()
  }

  function resetTimerState() {
    stopElapsedTimer()
    pauseStartMs = null
    totalPausedMs = 0
    quizTimerPaused.value = false
    quizStartedAt.value = 0
    elapsedMs.value = 0
  }

  function resetToIdle() {
    resetTimerState()
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    calcInput.value = ''
    shortInput.value = ''
    submitted.value = false
    selfScore.value = null
    results.value = []
    carelessMarked.value = false
    wrongGate.clearWrongGate()
    loggedSession = false
    quizItem = null
    skipWrongBook.value = false
    recordAttempts.value = false
  }

  function beginRunning(item: FrontendHandoutItem, generated: FrontendQuizQuestion[]) {
    quizItem = item
    questions.value = generated
    currentIndex.value = 0
    selectedIndex.value = null
    calcInput.value = ''
    shortInput.value = ''
    submitted.value = false
    selfScore.value = null
    results.value = []
    carelessMarked.value = false
    wrongGate.clearWrongGate()
    pauseStartMs = null
    totalPausedMs = 0
    quizTimerPaused.value = false
    quizStartedAt.value = Date.now()
    elapsedMs.value = 0
    loggedSession = false
    phase.value = 'running'
    startElapsedTimer()
  }

  async function generateAndStart(item: FrontendHandoutItem, provider: AiProvider) {
    if (!isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    const nextCounts = clampFrontendQuizCounts(counts.value)
    if (totalFrontendQuizCount(nextCounts) <= 0) {
      ElMessage.warning('请至少设置 1 道题')
      return
    }
    counts.value = nextCounts
    setAiProvider(provider)
    skipWrongBook.value = false
    recordAttempts.value = false
    quizItem = item
    phase.value = 'loading'
    loadingMessage.value = '正在根据讲义出题…'
    try {
      const generated = await requestFrontendHandoutQuiz({
        title: item.title,
        material: stripHandoutImagesForAi(item.content),
        itemId: item.id,
        learningPath: item.learningPath,
        counts: nextCounts,
        avoidStems: listFrontendQuizAvoidStems(item.id),
        provider: getAiProvider(),
        onProgress: (msg) => {
          loadingMessage.value = msg
        },
      })
      appendFrontendQuizAvoidStems(
        item.id,
        generated.map((q) => q.stem),
      )
      beginRunning(item, generated)
      ElMessage.success(`已生成 ${generated.length} 道题`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '出题失败')
    }
  }

  async function startPrepared(
    item: FrontendHandoutItem,
    qs: FrontendQuizQuestion[],
    opts?: { skipWrongBook?: boolean; recordAttempts?: boolean; useVariants?: boolean; provider?: AiProvider },
  ) {
    if (!qs.length) {
      ElMessage.warning('当前没有可测验的题目')
      return
    }
    skipWrongBook.value = Boolean(opts?.skipWrongBook)
    recordAttempts.value = Boolean(opts?.recordAttempts)
    quizItem = item
    phase.value = 'loading'
    loadingMessage.value = opts?.useVariants ? '正在生成变式题…' : '正在准备题目…'
    try {
      let generated = qs.map((q) => ({ ...q }))
      if (opts?.useVariants) {
        if (!isAiChatConfigured()) {
          ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
          phase.value = 'idle'
          return
        }
        if (opts.provider) setAiProvider(opts.provider)
        const next: FrontendQuizQuestion[] = []
        for (let i = 0; i < qs.length; i++) {
          loadingMessage.value = `正在生成变式 ${i + 1}/${qs.length}`
          try {
            const variant = await requestFrontendQuizVariant({
              original: qs[i],
              provider: getAiProvider(),
            })
            next.push(variant ?? qs[i])
          } catch {
            next.push(qs[i])
          }
        }
        generated = next
      }
      beginRunning(item, generated)
      ElMessage.success(opts?.useVariants ? `已准备 ${generated.length} 道变式题` : `已准备 ${generated.length} 道原题`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '准备题目失败')
    }
  }

  function selectOption(idx: number) {
    if (phase.value !== 'running' || submitted.value) return
    selectedIndex.value = idx
  }

  function submitCurrent() {
    const q = currentQuestion.value
    if (!q || submitted.value) return
    let chosen = ''
    let correct = false
    if (q.kind === 'calc') {
      chosen = calcInput.value.trim()
      if (!chosen) {
        ElMessage.warning('请先填写计算结果')
        return
      }
      correct = calcAnswerMatches(chosen, q.correctText)
    } else if (q.kind === 'short') {
      chosen = shortInput.value.trim()
    } else {
      if (selectedIndex.value == null) {
        ElMessage.warning('请先选择一个选项')
        return
      }
      chosen = q.options[selectedIndex.value] ?? ''
      correct = selectedIndex.value === q.correctIndex
    }
    results.value.push({
      unitIndex: currentIndex.value + 1,
      correct,
      selfScore: q.kind === 'short' ? null : undefined,
      question: q,
      chosen,
    })
    submitted.value = true
    selfScore.value = null
    carelessMarked.value = false
    pauseQuizTimer()
    if (recordAttempts.value) bumpFrontendQuizAttempt(q.fingerprint)
    if (!skipWrongBook.value && q.kind !== 'short' && !correct) wrongGate.noteWrongAnswer(q)
  }

  function applySelfScore(score: FrontendQuizSelfScore) {
    const q = currentQuestion.value
    const row = results.value.find((r) => r.unitIndex === currentIndex.value + 1)
    if (phase.value !== 'running' || !submitted.value || !q || q.kind !== 'short' || !row) return
    row.selfScore = score
    row.correct = score === 'full'
    selfScore.value = score
    carelessMarked.value = false
    if (score === 'full') wrongGate.dropPendingWrong()
    else if (!skipWrongBook.value) wrongGate.noteWrongAnswer(q)
  }

  function nextQuestion() {
    const q = currentQuestion.value
    if (q?.kind === 'short' && !selfScore.value) {
      ElMessage.warning('请先对照参考答案给自己打分')
      return
    }
    try {
      if (!skipWrongBook.value) wrongGate.flushWrongIfNeeded()
    } catch {
      ElMessage.error('错题保存失败')
    }
    carelessMarked.value = false
    if (currentIndex.value >= questions.value.length - 1) {
      tickElapsed()
      stopElapsedTimer()
      if (!loggedSession && results.value.length) {
        const first = questions.value[0]
        const kindCounts = {
          choice: questions.value.filter((item) => item.kind === 'choice').length,
          judge: questions.value.filter((item) => item.kind === 'judge').length,
          calc: questions.value.filter((item) => item.kind === 'calc').length,
          short: questions.value.filter((item) => item.kind === 'short').length,
        }
        logFrontendQuizSession({
          itemId: quizItem?.id || first?.itemId || '',
          itemTitle: quizItem?.title || first?.itemTitle || '前端学习测验',
          learningPath: quizItem?.learningPath,
          rangeQuiz: Boolean(quizItem?.id.startsWith('range:')),
          kindCounts,
          wrongCount: results.value.filter((r) => !r.correct).length,
          carelessCount: results.value.filter((r) => r.careless).length,
          correctCount: results.value.filter((r) => r.correct).length,
          totalCount: results.value.length,
          durationMs: elapsedMs.value || undefined,
        })
        loggedSession = true
      }
      phase.value = 'summary'
      return
    }
    currentIndex.value++
    selectedIndex.value = null
    calcInput.value = ''
    shortInput.value = ''
    submitted.value = false
    selfScore.value = null
    resumeQuizTimer()
  }

  function markCarelessWrong() {
    if (phase.value !== 'running' || !submitted.value) return
    const row = results.value[results.value.length - 1]
    if (!row || row.correct) return
    if (!wrongGate.markCarelessWrong()) return
    row.careless = true
    carelessMarked.value = true
    ElMessage.success('已标记为粗心答错，本题不入错题本')
  }

  onBeforeUnmount(() => stopElapsedTimer())

  return reactive({
    phase,
    loadingMessage,
    counts,
    questions,
    currentIndex,
    selectedIndex,
    calcInput,
    shortInput,
    submitted,
    selfScore,
    results,
    currentQuestion,
    correctCount,
    questionCount,
    carelessMarked,
    elapsedMs,
    elapsedClockText,
    elapsedText,
    quizTimerPaused,
    frontendQuizKindLabel,
    generateAndStart,
    startPrepared,
    skipWrongBook,
    selectOption,
    submitCurrent,
    applySelfScore,
    nextQuestion,
    markCarelessWrong,
    resetToIdle,
  })
}
