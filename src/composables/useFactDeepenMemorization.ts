import { ElMessage } from 'element-plus'
import { computed, onUnmounted, ref } from 'vue'
import {
  buildFactDeepenQuiz,
  factDeepenDifficultyLabel,
  factDeepenKindLabel,
  factDeepenQuizDurationSec,
  getFactDeepenGroupStat,
  getFactDeepenModeConfig,
  listFactDeepenGroups,
  listFactDeepenModes,
  loadFactDeepenGroup,
  refreshFactDeepenStudyCard,
  setFactDeepenGroupStat,
  type FactDeepenGroupMeta,
  type FactDeepenKind,
  type FactDeepenModeConfig,
  type FactDeepenModeId,
  type FactDeepenQuizQuestion,
  type FactDeepenStudyCard,
} from '@/utils/factDeepenMemorization'
import { setFactExplanationOverride } from '@/utils/factExplanationOverrides'
import { upsertMentalMathWrong } from '@/utils/mentalMathWrongBook'
import {
  MENTAL_MATH_TIME_CORRECT_BONUS_SEC,
  MENTAL_MATH_TIME_WRONG_PENALTY_SEC,
} from '@/utils/mentalMathPractice'
import { incrementPracticeCompletion } from '@/utils/practiceCompletionStats'
import {
  playMentalMathCorrectSound,
  playMentalMathWrongSound,
} from '@/utils/mentalMathSounds'

export type FactDeepenPhase =
  | 'idle'
  | 'pick'
  | 'catalog'
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
  const catalog = ref<FactDeepenGroupMeta[]>([])
  const activeGroup = ref<FactDeepenGroupMeta | null>(null)
  /** 触发目录成绩刷新 */
  const catalogTick = ref(0)

  const cards = ref<FactDeepenStudyCard[]>([])
  const studyIndex = ref(0)
  const studyVisited = ref<Set<number>>(new Set())
  const draftExplanation = ref('')

  const quiz = ref<FactDeepenQuizQuestion[]>([])
  const quizIndex = ref(0)
  const selectedOption = ref<number | null>(null)
  const quizLocked = ref(false)
  const records = ref<FactDeepenQuizRecord[]>([])
  const feedback = ref<'correct' | 'wrong' | null>(null)

  const countdownValue = ref<string | number | null>(null)
  const remainingMs = ref(0)
  const sessionStartMs = ref(0)
  const totalMs = ref(0)
  const elapsedMs = ref(0)
  const sessionStartedAt = ref(0)
  const quizDurationSec = ref(0)

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

  const catalogRows = computed(() => {
    void catalogTick.value
    return catalog.value.map((g) => ({
      ...g,
      stat: getFactDeepenGroupStat(g.modeId, g.groupIndex),
    }))
  })

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

  function resetSessionFields() {
    cards.value = []
    studyIndex.value = 0
    studyVisited.value = new Set()
    draftExplanation.value = ''
    quiz.value = []
    quizIndex.value = 0
    selectedOption.value = null
    quizLocked.value = false
    records.value = []
    feedback.value = null
    countdownValue.value = null
    remainingMs.value = 0
    activeGroup.value = null
  }

  function close() {
    clearTimers()
    open.value = false
    phase.value = 'idle'
    modeConfig.value = null
    catalog.value = []
    resetSessionFields()
  }

  function start(inputKind: FactDeepenKind) {
    kind.value = inputKind
    open.value = true
    phase.value = 'pick'
    modeConfig.value = null
    catalog.value = []
    resetSessionFields()
  }

  /** 选难度 → 打开固定分组目录 */
  function openCatalog(modeId: FactDeepenModeId) {
    try {
      const cfg = getFactDeepenModeConfig(modeId)
      if (cfg.kind !== kind.value) {
        ElMessage.error('难度与模块不匹配')
        return
      }
      const groups = listFactDeepenGroups(modeId)
      if (!groups.length) {
        ElMessage.warning('该难度暂无题目')
        return
      }
      modeConfig.value = cfg
      catalog.value = groups
      catalogTick.value += 1
      resetSessionFields()
      phase.value = 'catalog'
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '打开目录失败')
    }
  }

  function backToCatalog() {
    clearTimers()
    saveCurrentExplanation()
    resetSessionFields()
    if (modeConfig.value) {
      catalog.value = listFactDeepenGroups(modeConfig.value.modeId)
      catalogTick.value += 1
      phase.value = 'catalog'
    } else {
      phase.value = 'pick'
    }
  }

  function backToPick() {
    clearTimers()
    modeConfig.value = null
    catalog.value = []
    resetSessionFields()
    phase.value = 'pick'
  }

  function beginStudyGroup(groupIndex: number) {
    const cfg = modeConfig.value
    if (!cfg) return
    try {
      const meta = catalog.value.find((g) => g.groupIndex === groupIndex)
      if (!meta) {
        ElMessage.error('该组不存在')
        return
      }
      const batch = loadFactDeepenGroup(cfg.modeId, groupIndex)
      activeGroup.value = meta
      cards.value = batch
      quizDurationSec.value = factDeepenQuizDurationSec(cfg, batch.length)
      studyIndex.value = 0
      studyVisited.value = new Set([0])
      loadDraftFromCard(batch[0]!)
      phase.value = 'study'
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '加载失败')
    }
  }

  /** 目录点组：跳过识记，直接进入限时测验（题序乱序） */
  function beginQuizGroup(groupIndex: number) {
    const cfg = modeConfig.value
    if (!cfg) return
    try {
      const meta = catalog.value.find((g) => g.groupIndex === groupIndex)
      if (!meta) {
        ElMessage.error('该组不存在')
        return
      }
      const batch = loadFactDeepenGroup(cfg.modeId, groupIndex)
      activeGroup.value = meta
      cards.value = batch
      studyVisited.value = new Set(batch.map((_, i) => i))
      quiz.value = buildFactDeepenQuiz(
        batch.map((c) => refreshFactDeepenStudyCard(c)),
        cfg.optionCount,
      )
      quizDurationSec.value = factDeepenQuizDurationSec(cfg, quiz.value.length)
      quizIndex.value = 0
      selectedOption.value = null
      quizLocked.value = false
      records.value = []
      feedback.value = null
      sessionStartedAt.value = Date.now()
      runCountdown()
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '加载失败')
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
    const refreshed = cards.value.map((c) => refreshFactDeepenStudyCard(c))
    cards.value = refreshed
    quiz.value = buildFactDeepenQuiz(refreshed, cfg.optionCount)
    quizDurationSec.value = factDeepenQuizDurationSec(cfg, quiz.value.length)
    quizIndex.value = 0
    selectedOption.value = null
    quizLocked.value = false
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
    totalMs.value = quizDurationSec.value * 1000
    sessionStartMs.value = Date.now()
    remainingMs.value = totalMs.value
    elapsedMs.value = 0
    quizLocked.value = false
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

  /** 点选项即判定（同四则口算） */
  function answerQuizOption(idx: number) {
    if (phase.value !== 'quiz' || quizLocked.value || feedback.value) return
    const q = currentQuiz.value
    const cfg = modeConfig.value
    if (!q || !cfg) return

    quizLocked.value = true
    selectedOption.value = idx
    const chosen = q.options[idx] ?? ''
    const ok = idx === q.correctIndex
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

    // 对：短反馈；错：立刻下一题
    const delay = ok ? 380 : 80
    feedbackTimer = setTimeout(() => {
      feedback.value = null
      selectedOption.value = null
      quizLocked.value = false
      if (remainingMs.value <= 0) {
        finishQuiz()
        return
      }
      if (quizIndex.value + 1 >= quiz.value.length) {
        finishQuiz()
        return
      }
      quizIndex.value += 1
    }, delay)
  }

  function finishQuiz() {
    clearTimers()
    syncRemaining()
    elapsedMs.value = Math.max(0, Date.now() - sessionStartedAt.value)
    const cfg = modeConfig.value
    const group = activeGroup.value
    if (cfg) {
      const answered = records.value.length
      const correct = records.value.filter((r) => r.correct).length
      const total = quiz.value.length
      if (group) {
        setFactDeepenGroupStat(cfg.modeId, group.groupIndex, correct, Math.max(answered, total))
        catalogTick.value += 1
      }
      const groupLabel = group ? `第 ${group.groupNo} 组` : '一组'
      incrementPracticeCompletion(cfg.modeId, {
        correctCount: correct,
        totalCount: Math.max(answered, total),
        durationMs: elapsedMs.value,
        perfect: answered === total && correct === total && answered > 0,
        categoryId: cfg.kind,
        categoryLabel: factDeepenKindLabel(cfg.kind),
        itemLabel: `${factDeepenKindLabel(cfg.kind)} · 加深识记 · ${factDeepenDifficultyLabel(cfg.difficulty)}题 · ${groupLabel}`,
      })
    }
    phase.value = 'result'
  }

  function restartPick() {
    const k = kind.value
    clearTimers()
    modeConfig.value = null
    catalog.value = []
    resetSessionFields()
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
    catalogRows,
    activeGroup,
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
    quizLocked,
    feedback,
    records,
    correctCount,
    countdownValue,
    remainingSec,
    remainingMs,
    elapsedMs,
    quizDurationSec,
    start,
    close,
    openCatalog,
    backToCatalog,
    backToPick,
    beginStudyGroup,
    beginQuizGroup,
    saveCurrentExplanation,
    resetExplanationToBase,
    nextStudy,
    prevStudy,
    goStudy,
    startQuizFromStudy,
    answerQuizOption,
    restartPick,
  }
}
