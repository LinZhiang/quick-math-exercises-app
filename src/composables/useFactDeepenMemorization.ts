import { ElMessage } from 'element-plus'
import { computed, onUnmounted, ref } from 'vue'
import {
  buildFactDeepenQuiz,
  factDeepenDifficultyLabel,
  factDeepenKindLabel,
  getFactDeepenModeConfig,
  listFactDeepenModes,
  pickFactDeepenBatch,
  refreshFactDeepenStudyCard,
  type FactDeepenKind,
  type FactDeepenModeConfig,
  type FactDeepenModeId,
  type FactDeepenQuizQuestion,
  type FactDeepenStudyCard,
} from '@/utils/factDeepenMemorization'
import {
  setFactExplanationOverride,
} from '@/utils/factExplanationOverrides'
import { upsertMentalMathWrong } from '@/utils/mentalMathWrongBook'
import { MENTAL_MATH_TIME_CORRECT_BONUS_SEC, MENTAL_MATH_TIME_WRONG_PENALTY_SEC } from '@/utils/mentalMathPractice'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'
import {
  playMentalMathCorrectSound,
  playMentalMathWrongSound,
} from '@/utils/mentalMathSounds'

export type FactDeepenPhase =
  | 'idle'
  | 'pick'
  | 'study'
  | 'countdown'
  | 'quiz'
  | 'result'

export type FactDeepenQuizRecord = {
  expression: string
  correctAnswer: string
  chosenAnswer: string
  correct: boolean
  explanation: string
}

export function useFactDeepenMemorization() {
  const open = ref(false)
  const kind = ref<FactDeepenKind>('life-sense')
  const phase = ref<FactDeepenPhase>('idle')
  const modeConfig = ref<FactDeepenModeConfig | null>(null)
  const cards = ref<FactDeepenStudyCard[]>([])
  const studyIndex = ref(0)
  const studyVisited = ref<Set<number>>(new Set())
  const draftExplanation = ref('')

  const quiz = ref<FactDeepenQuizQuestion[]>([])
  const quizIndex = ref(0)
  const selectedOption = ref<number | null>(null)
  const quizSubmitted = ref(false)
  const records = ref<FactDeepenQuizRecord[]>([])
  const feedback = ref<'correct' | 'wrong' | null>(null)

  const countdownValue = ref<string | number | null>(null)
  const remainingMs = ref(0)
  const sessionStartMs = ref(0)
  const totalMs = ref(0)
  const elapsedMs = ref(0)
  const sessionStartedAt = ref(0)

  let tickTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setTimeout> | null = null
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null

  const kindLabel = computed(() => factDeepenKindLabel(kind.value))
  const modes = computed(() => listFactDeepenModes(kind.value))
  const currentCard = computed(() => cards.value[studyIndex.value] ?? null)
  const currentQuiz = computed(() => quiz.value[quizIndex.value] ?? null)
  const studyProgress = computed(() =>
    cards.value.length ? `${studyIndex.value + 1} / ${cards.value.length}` : '',
  )
  const quizProgress = computed(() =>
    quiz.value.length ? `${quizIndex.value + 1} / ${quiz.value.length}` : '',
  )
  const correctCount = computed(() => records.value.filter((r) => r.correct).length)
  const allStudyVisited = computed(() => {
    if (!cards.value.length) return false
    return cards.value.every((_, i) => studyVisited.value.has(i))
  })
  const remainingSec = computed(() => Math.ceil(Math.max(0, remainingMs.value) / 1000))

  function clearTimers() {
    if (tickTimer) {
      clearInterval(tickTimer)
      tickTimer = null
    }
    if (countdownTimer) {
      clearTimeout(countdownTimer)
      countdownTimer = null
    }
    if (feedbackTimer) {
      clearTimeout(feedbackTimer)
      feedbackTimer = null
    }
  }

  function close() {
    clearTimers()
    open.value = false
    phase.value = 'idle'
    modeConfig.value = null
    cards.value = []
    studyIndex.value = 0
    studyVisited.value = new Set()
    draftExplanation.value = ''
    quiz.value = []
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
    records.value = []
    feedback.value = null
    countdownValue.value = null
    remainingMs.value = 0
  }

  function start(inputKind: FactDeepenKind) {
    kind.value = inputKind
    open.value = true
    phase.value = 'pick'
    modeConfig.value = null
    cards.value = []
    studyIndex.value = 0
    studyVisited.value = new Set()
  }

  function beginStudy(modeId: FactDeepenModeId) {
    try {
      const cfg = getFactDeepenModeConfig(modeId)
      if (cfg.kind !== kind.value) {
        ElMessage.error('难度与模块不匹配')
        return
      }
      const batch = pickFactDeepenBatch(cfg.kind, cfg.difficulty, cfg.batchSize)
      modeConfig.value = cfg
      cards.value = batch
      studyIndex.value = 0
      studyVisited.value = new Set([0])
      loadDraftFromCard(batch[0]!)
      phase.value = 'study'
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '抽题失败')
    }
  }

  function loadDraftFromCard(card: FactDeepenStudyCard) {
    draftExplanation.value = card.explanation
  }

  function markVisited(idx: number) {
    const next = new Set(studyVisited.value)
    next.add(idx)
    studyVisited.value = next
  }

  function saveCurrentExplanation() {
    const card = currentCard.value
    if (!card || !modeConfig.value) return
    setFactExplanationOverride(
      card.kind,
      card.key,
      draftExplanation.value,
      card.baseExplanation,
    )
    const refreshed = refreshFactDeepenStudyCard(card)
    const next = [...cards.value]
    next[studyIndex.value] = refreshed
    cards.value = next
    draftExplanation.value = refreshed.explanation
  }

  function resetExplanationToBase() {
    const card = currentCard.value
    if (!card) return
    draftExplanation.value = card.baseExplanation
    setFactExplanationOverride(card.kind, card.key, '', card.baseExplanation)
    const refreshed = refreshFactDeepenStudyCard(card)
    const next = [...cards.value]
    next[studyIndex.value] = refreshed
    cards.value = next
  }

  function goStudy(idx: number) {
    saveCurrentExplanation()
    if (idx < 0 || idx >= cards.value.length) return
    studyIndex.value = idx
    markVisited(idx)
    loadDraftFromCard(cards.value[idx]!)
  }

  function nextStudy() {
    if (studyIndex.value + 1 < cards.value.length) {
      goStudy(studyIndex.value + 1)
      return
    }
    startQuizFromStudy()
  }

  function prevStudy() {
    if (studyIndex.value > 0) goStudy(studyIndex.value - 1)
  }

  function startQuizFromStudy() {
    saveCurrentExplanation()
    if (!allStudyVisited.value) {
      ElMessage.warning('请先浏览完本组全部题目再测验')
      return
    }
    const cfg = modeConfig.value
    if (!cfg || !cards.value.length) return
    // 刷新解析覆盖后再出卷
    const refreshed = cards.value.map((c) => refreshFactDeepenStudyCard(c))
    cards.value = refreshed
    quiz.value = buildFactDeepenQuiz(refreshed, cfg.optionCount)
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
    records.value = []
    feedback.value = null
    sessionStartedAt.value = Date.now()
    runCountdown()
  }

  function runCountdown() {
    clearTimers()
    phase.value = 'countdown'
    const steps: Array<string | number> = [3, 2, 1, 'GO']
    let i = 0
    countdownValue.value = steps[0]!
    const tick = () => {
      i += 1
      if (i >= steps.length) {
        countdownValue.value = null
        beginQuizPlaying()
        return
      }
      countdownValue.value = steps[i]!
      countdownTimer = setTimeout(tick, i === steps.length - 1 ? 450 : 700)
    }
    countdownTimer = setTimeout(tick, 700)
  }

  function syncRemaining() {
    remainingMs.value = Math.max(0, totalMs.value - (Date.now() - sessionStartMs.value))
  }

  function beginQuizPlaying() {
    const cfg = modeConfig.value
    if (!cfg) return
    clearTimers()
    phase.value = 'quiz'
    totalMs.value = cfg.durationSec * 1000
    sessionStartMs.value = Date.now()
    remainingMs.value = totalMs.value
    elapsedMs.value = 0
    tickTimer = setInterval(() => {
      syncRemaining()
      if (remainingMs.value <= 0) {
        finishQuiz()
      }
    }, 100)
  }

  function applyTimeDelta(ok: boolean) {
    const deltaMs = ok
      ? MENTAL_MATH_TIME_CORRECT_BONUS_SEC * 1000
      : -MENTAL_MATH_TIME_WRONG_PENALTY_SEC * 1000
    sessionStartMs.value += deltaMs
    syncRemaining()
  }

  function selectQuizOption(idx: number) {
    if (phase.value !== 'quiz' || quizSubmitted.value || feedback.value) return
    selectedOption.value = idx
  }

  function submitQuizAnswer() {
    if (phase.value !== 'quiz' || quizSubmitted.value || feedback.value) return
    const q = currentQuiz.value
    const cfg = modeConfig.value
    if (!q || !cfg) return
    if (selectedOption.value == null) {
      ElMessage.warning('请先选择一个选项')
      return
    }
    quizSubmitted.value = true
    const chosen = q.options[selectedOption.value] ?? ''
    const ok = selectedOption.value === q.correctIndex
    feedback.value = ok ? 'correct' : 'wrong'
    if (ok) playMentalMathCorrectSound()
    else playMentalMathWrongSound()

    records.value = [
      ...records.value,
      {
        expression: q.expression,
        correctAnswer: q.correctAnswer,
        chosenAnswer: chosen,
        correct: ok,
        explanation: q.explanation,
      },
    ]

    if (!ok) {
      upsertMentalMathWrong({
        modeId: cfg.modeId,
        expression: q.expression,
        correctAnswer: q.correctAnswer,
        chosenAnswer: chosen,
        options: q.options,
        explanation: q.explanation,
      })
    }

    applyTimeDelta(ok)

    feedbackTimer = setTimeout(() => {
      feedback.value = null
      quizSubmitted.value = false
      selectedOption.value = null
      if (remainingMs.value <= 0) {
        finishQuiz()
        return
      }
      if (quizIndex.value + 1 >= quiz.value.length) {
        finishQuiz()
        return
      }
      quizIndex.value += 1
    }, ok ? 380 : 900)
  }

  function finishQuiz() {
    clearTimers()
    syncRemaining()
    elapsedMs.value = Math.max(0, Date.now() - sessionStartedAt.value)
    const cfg = modeConfig.value
    if (cfg) {
      const answered = records.value.length
      const correct = records.value.filter((r) => r.correct).length
      incrementPracticeCompletion(cfg.modeId, {
        correctCount: correct,
        totalCount: Math.max(answered, quiz.value.length),
        durationMs: elapsedMs.value,
        perfect: answered === quiz.value.length && correct === quiz.value.length,
        categoryId: cfg.kind,
        categoryLabel: factDeepenKindLabel(cfg.kind),
        itemLabel: `${factDeepenKindLabel(cfg.kind)} · 加深识记 · ${factDeepenDifficultyLabel(cfg.difficulty)}题`,
      })
    }
    phase.value = 'result'
  }

  function restartPick() {
    const k = kind.value
    clearTimers()
    modeConfig.value = null
    cards.value = []
    studyIndex.value = 0
    studyVisited.value = new Set()
    draftExplanation.value = ''
    quiz.value = []
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
    records.value = []
    feedback.value = null
    countdownValue.value = null
    remainingMs.value = 0
    kind.value = k
    open.value = true
    phase.value = 'pick'
  }

  onUnmounted(() => clearTimers())

  return {
    open,
    kind,
    kindLabel,
    phase,
    modes,
    modeConfig,
    cards,
    studyIndex,
    currentCard,
    studyProgress,
    allStudyVisited,
    draftExplanation,
    quiz,
    quizIndex,
    currentQuiz,
    quizProgress,
    selectedOption,
    quizSubmitted,
    feedback,
    records,
    correctCount,
    countdownValue,
    remainingSec,
    remainingMs,
    elapsedMs,
    start,
    close,
    beginStudy,
    saveCurrentExplanation,
    resetExplanationToBase,
    nextStudy,
    prevStudy,
    goStudy,
    startQuizFromStudy,
    selectQuizOption,
    submitQuizAnswer,
    restartPick,
  }
}
