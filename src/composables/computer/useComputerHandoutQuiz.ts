import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { isAiChatConfigured, requestComputerHandoutQuiz, DEEPSEEK_NOT_CONFIGURED_HINT } from '@/services/deepseek'
import {
  clampComputerQuizCounts,
  computerQuizKindLabel,
  normalizeCalcAnswer,
  totalComputerQuizCount,
  type ComputerQuizCounts,
  type ComputerQuizQuestion,
  DEFAULT_COMPUTER_QUIZ_COUNTS,
} from '@/utils/computer/computerHandoutQuiz'
import {
  appendComputerQuizAvoidStems,
  listComputerQuizAvoidStems,
  upsertComputerQuizWrong,
} from '@/utils/computer/computerHandoutQuizStorage'
import { createChineseWrongBookGate } from '@/utils/chinese/chineseWrongBookGate'
import { getAiProvider, setAiProvider, type AiProvider } from '@/utils/app/aiProviderStore'
import { stripHandoutImagesForAi, type ComputerHandoutItem } from '@/utils/computer/computerBasics'

export type ComputerQuizPhase = 'idle' | 'loading' | 'running' | 'summary'

export function useComputerHandoutQuiz() {
  const phase = ref<ComputerQuizPhase>('idle')
  const loadingMessage = ref('')
  const counts = ref<ComputerQuizCounts>({ ...DEFAULT_COMPUTER_QUIZ_COUNTS })
  const questions = ref<ComputerQuizQuestion[]>([])
  const currentIndex = ref(0)
  const selectedIndex = ref<number | null>(null)
  const calcInput = ref('')
  const submitted = ref(false)
  const results = ref<
    { unitIndex: number; correct: boolean; question: ComputerQuizQuestion; chosen: string }[]
  >([])
  const carelessMarked = ref(false)
  const wrongGate = createChineseWrongBookGate(upsertComputerQuizWrong)

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const correctCount = computed(() => results.value.filter((r) => r.correct).length)
  const questionCount = computed(() => questions.value.length)

  function resetToIdle() {
    phase.value = 'idle'
    loadingMessage.value = ''
    questions.value = []
    currentIndex.value = 0
    selectedIndex.value = null
    calcInput.value = ''
    submitted.value = false
    results.value = []
    carelessMarked.value = false
    wrongGate.clearWrongGate()
  }

  async function generateAndStart(item: ComputerHandoutItem, provider: AiProvider) {
    if (!isAiChatConfigured()) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    const nextCounts = clampComputerQuizCounts(counts.value)
    if (totalComputerQuizCount(nextCounts) <= 0) {
      ElMessage.warning('请至少设置 1 道题')
      return
    }
    counts.value = nextCounts
    setAiProvider(provider)
    phase.value = 'loading'
    loadingMessage.value = '正在根据讲义出题…'
    try {
      const generated = await requestComputerHandoutQuiz({
        title: item.title,
        material: stripHandoutImagesForAi(item.content),
        itemId: item.id,
        counts: nextCounts,
        avoidStems: listComputerQuizAvoidStems(item.id),
        provider: getAiProvider(),
        onProgress: (msg) => {
          loadingMessage.value = msg
        },
      })
      appendComputerQuizAvoidStems(
        item.id,
        generated.map((q) => q.stem),
      )
      questions.value = generated
      currentIndex.value = 0
      selectedIndex.value = null
      calcInput.value = ''
      submitted.value = false
      results.value = []
      carelessMarked.value = false
      wrongGate.clearWrongGate()
      phase.value = 'running'
      ElMessage.success(`已生成 ${generated.length} 道题`)
    } catch (e) {
      phase.value = 'idle'
      ElMessage.error(e instanceof Error ? e.message : '出题失败')
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
        ElMessage.warning('请先填写答案')
        return
      }
      correct = normalizeCalcAnswer(chosen) === normalizeCalcAnswer(q.correctText)
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
      question: q,
      chosen,
    })
    submitted.value = true
    carelessMarked.value = false
    if (!correct) wrongGate.noteWrongAnswer(q)
  }

  function nextQuestion() {
    try {
      wrongGate.flushWrongIfNeeded()
    } catch {
      ElMessage.error('错题保存失败')
    }
    carelessMarked.value = false
    if (currentIndex.value >= questions.value.length - 1) {
      phase.value = 'summary'
      return
    }
    currentIndex.value++
    selectedIndex.value = null
    calcInput.value = ''
    submitted.value = false
  }

  function markCarelessWrong() {
    if (phase.value !== 'running' || !submitted.value) return
    const row = results.value[results.value.length - 1]
    if (!row || row.correct) return
    if (!wrongGate.markCarelessWrong()) return
    carelessMarked.value = true
    ElMessage.success('已标记为粗心答错，本题不入错题本')
  }

  return reactive({
    phase,
    loadingMessage,
    counts,
    questions,
    currentIndex,
    selectedIndex,
    calcInput,
    submitted,
    results,
    currentQuestion,
    correctCount,
    questionCount,
    carelessMarked,
    computerQuizKindLabel,
    generateAndStart,
    selectOption,
    submitCurrent,
    nextQuestion,
    markCarelessWrong,
    resetToIdle,
  })
}
