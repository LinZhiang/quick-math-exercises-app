import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import {
  DEEPSEEK_NOT_CONFIGURED_HINT,
  isAiChatConfigured,
  requestVocabRelatedLearningPackBatch,
  requestVocabRelatedQuizOnly,
} from '@/services/deepseek'
import { appendPracticeSessionLog } from '@/utils/app/practiceSessionLog'
import {
  getVocabRelatedLearningCache,
  setVocabRelatedLearningCache,
} from '@/utils/chinese/vocabRelatedLearningCache'
import {
  vocabRelatedQuizTypeLabel,
  type VocabRelatedKind,
  type VocabRelatedLearningPack,
  type VocabRelatedQuizQuestion,
  type VocabRelatedSourceRow,
} from '@/utils/chinese/vocabRelatedLearning'

export type VocabRelatedLearningPhase =
  | 'idle'
  | 'loading'
  | 'study'
  | 'quiz'
  | 'quiz-result'
  | 'session-done'

export type VocabRelatedStudyLayer = 1 | 2 | 3 | 4

export function useVocabRelatedLearning() {
  const open = ref(false)
  const phase = ref<VocabRelatedLearningPhase>('idle')
  const loadingMessage = ref('')
  const kind = ref<VocabRelatedKind>('idiom')
  const queue = ref<VocabRelatedSourceRow[]>([])
  const queueIndex = ref(0)
  /** 本组全部学习包（开场一次性备齐） */
  const packs = ref<VocabRelatedLearningPack[]>([])
  const pack = computed(() => packs.value[queueIndex.value] ?? null)
  const currentRow = computed(() => queue.value[queueIndex.value] ?? null)
  const studyLayer = ref<VocabRelatedStudyLayer>(1)

  const quizIndex = ref(0)
  const selectedOption = ref<number | null>(null)
  const quizSubmitted = ref(false)
  const quizAnswers = ref<(number | null)[]>([])

  const sessionStartedAt = ref(0)
  const sessionPassedModules = ref(0)
  const sessionFailedAttempts = ref(0)

  const MAX_BATCH = 10
  const kindLabel = computed(() => (kind.value === 'idiom' ? '成语识记' : '词语识记'))
  const progressText = computed(() => {
    const total = queue.value.length
    if (!total) return ''
    return `本组 ${queueIndex.value + 1} / ${total} 个词`
  })

  const currentQuiz = computed(() => pack.value?.quiz[quizIndex.value] ?? null)
  const quizCount = computed(() => pack.value?.quiz.length ?? 0)
  const quizCorrectCount = computed(() => {
    if (!pack.value) return 0
    return pack.value.quiz.reduce((n, q, i) => {
      const ans = quizAnswers.value[i]
      return n + (ans != null && ans === q.correctIndex ? 1 : 0)
    }, 0)
  })
  const quizAllCorrect = computed(
    () => quizCount.value > 0 && quizCorrectCount.value === quizCount.value,
  )

  function resetQuizState(nextQuiz?: VocabRelatedQuizQuestion[]) {
    const idx = queueIndex.value
    if (nextQuiz && packs.value[idx]) {
      const next = [...packs.value]
      next[idx] = { ...next[idx]!, quiz: nextQuiz }
      packs.value = next
    }
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
    quizAnswers.value = Array.from({ length: pack.value?.quiz.length ?? 0 }, () => null)
  }

  function showCurrentPack(keepExistingQuiz: boolean) {
    const cur = packs.value[queueIndex.value]
    if (!cur) return
    if (!keepExistingQuiz) {
      const next = [...packs.value]
      next[queueIndex.value] = { ...cur, quiz: [] }
      packs.value = next
      resetQuizState([])
    } else {
      resetQuizState(cur.quiz)
    }
    studyLayer.value = 1
    phase.value = 'study'
  }

  async function regenerateQuizForCurrent(reason: 'open' | 'retry') {
    const row = currentRow.value
    const cur = packs.value[queueIndex.value]
    if (!row || !cur) return
    if (!isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    phase.value = 'loading'
    loadingMessage.value =
      reason === 'retry' ? `正在重新生成「${cur.term}」小测…` : `正在生成本词小测…`
    try {
      const quiz = await requestVocabRelatedQuizOnly({
        kind: kind.value,
        row,
        pack: cur,
        avoidStems: cur.quiz.map((q) => q.stem).filter(Boolean),
        onProgress: (m) => {
          loadingMessage.value = m
        },
      })
      const next = [...packs.value]
      next[queueIndex.value] = { ...cur, quiz }
      packs.value = next
      resetQuizState(quiz)
      if (reason === 'retry') {
        studyLayer.value = 1
        phase.value = 'study'
      } else {
        phase.value = 'quiz'
        quizIndex.value = 0
        selectedOption.value = null
        quizSubmitted.value = false
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '小测生成失败'
      ElMessage.error(msg)
      phase.value = 'study'
      studyLayer.value = 1
    }
  }

  function close() {
    open.value = false
    phase.value = 'idle'
    loadingMessage.value = ''
    packs.value = []
    queue.value = []
    queueIndex.value = 0
    studyLayer.value = 1
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
    quizAnswers.value = []
  }

  async function start(input: {
    kind: VocabRelatedKind
    rows: VocabRelatedSourceRow[]
  }) {
    const rows = input.rows
      .map((r) => ({
        ...r,
        term: r.term.trim(),
        stem: r.stem.trim(),
        options: r.options.map((o) => String(o ?? '').trim()),
      }))
      .filter((r) => r.term && r.options.length === 4)
      .slice(0, MAX_BATCH)
    if (!rows.length) {
      ElMessage.warning('没有可关联学习的成语/词语')
      return
    }

    const cachedList: (VocabRelatedLearningPack | null)[] = rows.map((r) =>
      getVocabRelatedLearningCache(input.kind, r),
    )
    const missRows = rows.filter((_, i) => !cachedList[i])
    if (missRows.length > 0 && !isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }

    kind.value = input.kind
    queue.value = rows
    queueIndex.value = 0
    sessionStartedAt.value = Date.now()
    sessionPassedModules.value = 0
    sessionFailedAttempts.value = 0
    open.value = true
    phase.value = 'loading'

    try {
      let generated: VocabRelatedLearningPack[] = []
      if (missRows.length === 0) {
        loadingMessage.value = '本组均已缓存，正在打开…'
      } else {
        loadingMessage.value = `正在一次性生成本组 ${missRows.length} 词关联学习内容…`
        if (missRows.length < rows.length) {
          ElMessage.info(
            `本组 ${rows.length - missRows.length} 词已缓存，其余 ${missRows.length} 词一次性生成`,
          )
        }
        generated = await requestVocabRelatedLearningPackBatch({
          kind: input.kind,
          rows: missRows,
          onProgress: (m) => {
            loadingMessage.value = m
          },
        })
        missRows.forEach((row, i) => {
          const p = generated[i]
          if (p) setVocabRelatedLearningCache(input.kind, row, p)
        })
      }

      let gi = 0
      const all: VocabRelatedLearningPack[] = []
      for (let i = 0; i < rows.length; i++) {
        const c = cachedList[i]
        if (c) all.push(c)
        else {
          const p = generated[gi++]
          if (!p) throw new Error(`缺少「${rows[i]!.term}」的学习包`)
          all.push(p)
        }
      }
      packs.value = all
      // 缓存材料无小测；新生成的可保留本轮小测。重新打开时缓存侧已 strip quiz。
      showCurrentPack((all[0]?.quiz.length ?? 0) >= 2)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败'
      ElMessage.error(msg)
      close()
    }
  }

  function nextStudyLayer() {
    if (studyLayer.value < 4) {
      studyLayer.value = (studyLayer.value + 1) as VocabRelatedStudyLayer
      return
    }
    void startQuiz()
  }

  function prevStudyLayer() {
    if (studyLayer.value > 1) {
      studyLayer.value = (studyLayer.value - 1) as VocabRelatedStudyLayer
    }
  }

  async function startQuiz() {
    const cur = pack.value
    if (!cur) return
    if (cur.quiz.length < 2) {
      await regenerateQuizForCurrent('open')
      return
    }
    phase.value = 'quiz'
    quizIndex.value = 0
    selectedOption.value = null
    quizSubmitted.value = false
  }

  function selectQuizOption(idx: number) {
    if (phase.value !== 'quiz' || quizSubmitted.value) return
    selectedOption.value = idx
  }

  function submitQuizAnswer() {
    if (phase.value !== 'quiz' || quizSubmitted.value) return
    if (selectedOption.value == null) {
      ElMessage.warning('请先选择一个选项')
      return
    }
    const answers = [...quizAnswers.value]
    answers[quizIndex.value] = selectedOption.value
    quizAnswers.value = answers
    quizSubmitted.value = true
  }

  function nextQuizOrResult() {
    if (!pack.value) return
    if (quizIndex.value + 1 < pack.value.quiz.length) {
      quizIndex.value += 1
      selectedOption.value = null
      quizSubmitted.value = false
      return
    }
    phase.value = 'quiz-result'
    if (!quizAllCorrect.value) sessionFailedAttempts.value += 1
  }

  async function retryModule() {
    if (!pack.value) return
    studyLayer.value = 1
    await regenerateQuizForCurrent('retry')
  }

  function advanceToNextModule() {
    sessionPassedModules.value += 1
    if (queueIndex.value + 1 >= queue.value.length) {
      finishSession()
      return
    }
    queueIndex.value += 1
    // 下一词作答前重新出题
    showCurrentPack(false)
  }

  function finishSession() {
    const total = queue.value.length
    const durationMs = Math.max(0, Date.now() - sessionStartedAt.value)
    const modeId =
      kind.value === 'idiom' ? 'chinese-vocab-related-idiom' : 'chinese-vocab-related-word'
    appendPracticeSessionLog(modeId, {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: `语文 · 关联学习 · ${kindLabel.value}`,
      correctCount: sessionPassedModules.value,
      totalCount: total,
      score: total > 0 ? Math.round((sessionPassedModules.value / total) * 100) : undefined,
      durationMs,
      perfect: sessionPassedModules.value === total && sessionFailedAttempts.value === 0,
    })
    phase.value = 'session-done'
    ElMessage.success(
      `本组关联学习完成：通过 ${sessionPassedModules.value}/${total} 个词（小测不计入错题本）`,
    )
  }

  return {
    open,
    phase,
    loadingMessage,
    kindLabel,
    queue,
    queueIndex,
    pack,
    studyLayer,
    quizIndex,
    selectedOption,
    quizSubmitted,
    currentQuiz,
    quizCount,
    quizCorrectCount,
    quizAllCorrect,
    progressText,
    sessionPassedModules,
    sessionFailedAttempts,
    vocabRelatedQuizTypeLabel,
    start,
    close,
    nextStudyLayer,
    prevStudyLayer,
    startQuiz,
    selectQuizOption,
    submitQuizAnswer,
    nextQuizOrResult,
    retryModule,
    advanceToNextModule,
  }
}
