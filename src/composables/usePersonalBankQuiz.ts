import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  playMentalMathCorrectSound,
  playMentalMathStartSound,
  playMentalMathWrongSound,
} from '@/utils/mentalMathSounds'
import { generatePersonalBankChoiceOptions } from '@/utils/personalBankChoiceAi'
import { aiRequestProgressText, type AiProvider } from '@/utils/aiProviderStore'
import {
  incrementPersonalBankQuestionQuizCount,
  isOpenChoiceQuestion,
  type PersonalBankQuestion,
} from '@/utils/personalQuestionBank'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'

export type PersonalBankQuizPhase = 'idle' | 'loading' | 'running' | 'summary'

export type PersonalBankQuizItem = {
  question: PersonalBankQuestion
  optionsHtml?: string[]
  correctIndex?: number
}

export type PersonalBankQuizResultRow = {
  unitIndex: number
  question: PersonalBankQuestion
  userAnswer: string
  awardedScore: number
  fullScore: number
  selectedIndex: number | null
  optionsHtml?: string[]
  correctIndex?: number
}

export type PersonalBankQuizStartInput = {
  paper: PersonalBankQuestion[]
  modeId: string
  categoryId: string
  subId: string
  provider?: AiProvider
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function clampScore(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  const rounded = Math.round(value * 2) / 2
  return Math.min(max, Math.max(0, rounded))
}

export function usePersonalBankQuiz() {
  const phase = ref<PersonalBankQuizPhase>('idle')
  const loadingMessage = ref('')
  const items = ref<PersonalBankQuizItem[]>([])
  const currentIndex = ref(0)
  const userAnswer = ref('')
  const selectedIndex = ref<number | null>(null)
  const revealed = ref(false)
  const awardedScore = ref<number | null>(null)
  const scoreDraft = ref<number | undefined>(undefined)
  const results = ref<PersonalBankQuizResultRow[]>([])
  const modeId = ref('')
  const categoryId = ref('')
  const subId = ref('')
  const quizElapsedMs = ref(0)
  const quizRunningDisplayMs = ref(0)

  let quizWallClockStartMs: number | null = null
  let quizElapsedIntervalId: number | null = null
  let totalPausedMs = 0
  let pauseStartMs: number | null = null
  let scoredSoundPlayed = false
  let startToken = 0

  const currentItem = computed(() => items.value[currentIndex.value] ?? null)
  const currentQuestion = computed(() => currentItem.value?.question ?? null)
  const isChoice = computed(() => currentQuestion.value?.type === 'choice')
  const questionCount = computed(() => items.value.length)
  const totalAwarded = computed(() => results.value.reduce((sum, r) => sum + r.awardedScore, 0))
  const totalFull = computed(() => results.value.reduce((sum, r) => sum + r.fullScore, 0))
  const correctCount = computed(
    () => results.value.filter((r) => r.awardedScore >= r.fullScore && r.fullScore > 0).length,
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

  const nextButtonLabel = computed(() => {
    if (!revealed.value) return isChoice.value ? '提交' : '下一步'
    if (currentIndex.value >= items.value.length - 1) return '查看结果'
    return '下一题'
  })

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

  function resetQuestionState() {
    userAnswer.value = ''
    selectedIndex.value = null
    revealed.value = false
    awardedScore.value = null
    scoreDraft.value = undefined
    scoredSoundPlayed = false
  }

  async function start(input: PersonalBankQuizStartInput) {
    if (!input.paper.length) {
      ElMessage.warning('本题库还没有符合范围的题目')
      return
    }
    const token = ++startToken
    phase.value = 'loading'
    loadingMessage.value = input.paper.some((q) => isOpenChoiceQuestion(q))
      ? aiRequestProgressText('生成选择题干扰项', input.provider)
      : '正在组卷…'
    try {
      const optionMap = await generatePersonalBankChoiceOptions(input.paper, input.provider)
      if (token !== startToken) return
      const built: PersonalBankQuizItem[] = shuffle(input.paper).map((question) => {
        if (question.type !== 'choice') return { question }
        const pack = optionMap.get(question.id)
        if (!pack) throw new Error(`选择题「${question.title}」缺少选项`)
        return {
          question,
          optionsHtml: pack.optionsHtml,
          correctIndex: pack.correctIndex,
        }
      })
      items.value = built
      modeId.value = input.modeId
      categoryId.value = input.categoryId
      subId.value = input.subId
      currentIndex.value = 0
      results.value = []
      resetQuestionState()
      phase.value = 'running'
      startQuizClock()
      playMentalMathStartSound()
    } catch (e) {
      if (token !== startToken) return
      phase.value = 'idle'
      loadingMessage.value = ''
      ElMessage.error(e instanceof Error ? e.message : '组卷失败')
    }
  }

  function selectOption(idx: number) {
    if (phase.value !== 'running' || revealed.value || !isChoice.value) return
    selectedIndex.value = idx
  }

  function revealCurrent() {
    if (phase.value !== 'running' || revealed.value) return
    pauseQuizTimer()
    revealed.value = true
  }

  function submitChoice() {
    const item = currentItem.value
    const q = item?.question
    if (!item || !q || q.type !== 'choice' || revealed.value) return
    if (selectedIndex.value == null) {
      ElMessage.warning('请先选择一个选项')
      return
    }
    const correct = selectedIndex.value === item.correctIndex
    pauseQuizTimer()
    revealed.value = true
    awardedScore.value = correct ? q.score : 0
    scoreDraft.value = awardedScore.value
    scoredSoundPlayed = true
    if (correct) playMentalMathCorrectSound()
    else playMentalMathWrongSound()
  }

  function applySelfScore(score: number) {
    const q = currentQuestion.value
    if (phase.value !== 'running' || !revealed.value || !q || q.type === 'choice') return
    const next = clampScore(score, q.score)
    awardedScore.value = next
    scoreDraft.value = next
    if (!scoredSoundPlayed) {
      scoredSoundPlayed = true
      if (next >= q.score) playMentalMathCorrectSound()
      else if (next <= 0) playMentalMathWrongSound()
    }
  }

  function commitCurrentResult() {
    const item = currentItem.value
    const q = item?.question
    if (!item || !q || awardedScore.value == null) return
    const existing = results.value.find((r) => r.unitIndex === currentIndex.value + 1)
    const chosenHtml =
      item.optionsHtml && selectedIndex.value != null
        ? item.optionsHtml[selectedIndex.value] ?? ''
        : ''
    const row: PersonalBankQuizResultRow = {
      unitIndex: currentIndex.value + 1,
      question: q,
      userAnswer: q.type === 'choice' ? chosenHtml : userAnswer.value.trim(),
      awardedScore: awardedScore.value,
      fullScore: q.score,
      selectedIndex: selectedIndex.value,
      optionsHtml: item.optionsHtml,
      correctIndex: item.correctIndex,
    }
    if (existing) Object.assign(existing, row)
    else {
      results.value.push(row)
      if (categoryId.value && subId.value) {
        try {
          const next = incrementPersonalBankQuestionQuizCount(categoryId.value, subId.value, q.id)
          q.quizCount = next
        } catch {
          /* ignore */
        }
      }
    }
  }

  function goNext() {
    if (phase.value !== 'running') return
    const q = currentQuestion.value
    if (!q) return
    if (!revealed.value) {
      if (q.type === 'choice') submitChoice()
      else revealCurrent()
      return
    }
    if (q.type !== 'choice' && awardedScore.value == null) {
      if (scoreDraft.value == null) {
        ElMessage.warning('请先给本题评分')
        return
      }
      applySelfScore(scoreDraft.value)
    }
    commitCurrentResult()
    if (currentIndex.value >= items.value.length - 1) {
      finalizeElapsed()
      if (modeId.value) {
        incrementPracticeCompletion(modeId.value, {
          correctCount: correctCount.value,
          totalCount: items.value.length,
          score: totalAwarded.value,
          durationMs: quizElapsedMs.value,
          perfect:
            items.value.length > 0 && totalAwarded.value >= totalFull.value && totalFull.value > 0,
        })
      }
      phase.value = 'summary'
      return
    }
    currentIndex.value += 1
    resetQuestionState()
    resumeQuizTimer()
  }

  function resetToIdle() {
    startToken += 1
    finalizeElapsed()
    clearQuizElapsedInterval()
    phase.value = 'idle'
    loadingMessage.value = ''
    items.value = []
    currentIndex.value = 0
    results.value = []
    modeId.value = ''
    categoryId.value = ''
    subId.value = ''
    quizElapsedMs.value = 0
    quizRunningDisplayMs.value = 0
    resetQuestionState()
  }

  onBeforeUnmount(() => {
    startToken += 1
    clearQuizElapsedInterval()
  })

  return {
    phase,
    loadingMessage,
    items,
    currentIndex,
    currentItem,
    currentQuestion,
    isChoice,
    questionCount,
    userAnswer,
    selectedIndex,
    revealed,
    awardedScore,
    scoreDraft,
    results,
    totalAwarded,
    totalFull,
    correctCount,
    quizElapsedMs,
    quizRunningDisplayMs,
    quizDurationSummaryText,
    quizRunningElapsedText,
    quizTimerPaused,
    nextButtonLabel,
    start,
    selectOption,
    applySelfScore,
    goNext,
    resetToIdle,
  }
}
