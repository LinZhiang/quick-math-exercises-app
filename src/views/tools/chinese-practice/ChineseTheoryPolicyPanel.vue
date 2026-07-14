<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useChineseTheoryPolicyTest } from '@/composables/useChineseTheoryPolicyTest'
import { useDeepseekConversation } from '@/composables/useDeepseekConversation'
import DeepseekChatThread from '@/components/DeepseekChatThread.vue'
import { isAiChatConfigured, requestAssistantMarkdown } from '@/services/deepseek'
import {
  isChineseTheoryPolicyFavorite,
  toggleChineseTheoryPolicyFavorite,
} from '@/utils/chineseTheoryPolicyStorage'
import { theoryPolicyQuestionTypeLabel } from '@/utils/theoryPolicyPractice'
import type { TheoryPolicyQuestion } from '@/utils/theoryPolicyPractice'

const THEORY_ASSIST_SYSTEM =
  '你是事业编与公务员考试「政治理论·政策法规」教练，擅长习近平新时代中国特色社会主义思想、党的二十大报告、二十届三中全会《决定》及政府工作报告高频考点。用简体中文讲解，表述客观准确，紧扣公开权威表述，回答要具体。'

const test = useChineseTheoryPolicyTest()
const favorited = ref(false)
const regenerating = ref(false)
const followupInput = ref('')

const assistKey = computed(
  () => `${test.currentIndex}:${test.currentQuestion?.fingerprint ?? 'none'}`,
)

const {
  displayTurns: assistTurns,
  loading: assistLoading,
  error: assistError,
  apiHistory: assistHistory,
  start: startAssist,
  followup: followupAssist,
  reset: resetAssist,
} = useDeepseekConversation({ resetKey: assistKey })

const isRunningOrLoading = computed(
  () => test.phase === 'running' || test.phase === 'loading',
)

defineExpose({
  isRunningOrLoading,
  startWith(questions: TheoryPolicyQuestion[]) {
    test.resetToIdle()
    test.startQuiz(questions)
  },
})

function buildAssistPrompt(q: TheoryPolicyQuestion): string {
  const row = test.results[test.results.length - 1]
  const opts = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n')
  const chosen =
    row?.chosenIndex != null ? String(q.options[row.chosenIndex] ?? '') : '（未选）'
  const correct = q.options[q.correctIndex] ?? ''
  return [
    `题型：${theoryPolicyQuestionTypeLabel(q.questionType)}`,
    `知识点：${q.term}`,
    `题干：${q.stem}`,
    `选项：\n${opts}`,
    `学员选择：${chosen}`,
    `正确答案：${correct}`,
    `作答结果：${row?.correct ? '正确' : '错误'}`,
    q.explanation ? `题目解析：${q.explanation}` : '',
    '请讲解本题理论/政策依据、核心表述、易混提法及记忆方法。',
  ]
    .filter(Boolean)
    .join('\n\n')
}

async function runAssistExplain() {
  const q = test.currentQuestion
  if (!q || !test.submitted || !isAiChatConfigured()) return
  const userMsg = buildAssistPrompt(q)
  try {
    await startAssist({
      initialUser: userMsg,
      displayUser: '请讲解本题理论政策',
      system: THEORY_ASSIST_SYSTEM,
      fetch: () =>
        requestAssistantMarkdown({
          system: THEORY_ASSIST_SYSTEM,
          userMessage: userMsg,
        }),
    })
  } catch {
    /* error in assistError */
  }
}

async function onSendFollowup() {
  const msg = followupInput.value.trim()
  if (!msg) return
  try {
    await followupAssist(msg)
    followupInput.value = ''
  } catch {
    /* error in assistError */
  }
}

watch(
  () => test.currentQuestion?.fingerprint,
  (fp) => {
    favorited.value = fp ? isChineseTheoryPolicyFavorite(fp) : false
  },
)

watch(
  () => [test.submitted, test.currentIndex] as const,
  () => {
    resetAssist()
    followupInput.value = ''
  },
)

async function onRegenerate() {
  regenerating.value = true
  try {
    await test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

async function onToggleFavorite() {
  const q = test.currentQuestion
  if (!q) return
  const r = toggleChineseTheoryPolicyFavorite(q)
  favorited.value = r === 'added'
  ElMessage.success(r === 'added' ? '已加入关键题收藏' : '已取消收藏')
}

function onKeydown(ev: KeyboardEvent) {
  if (test.phase !== 'running' || test.submitted) return
  const n = Number(ev.key)
  if (Number.isInteger(n) && n >= 1 && n <= 4) {
    ev.preventDefault()
    test.selectOption(n - 1)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="chinese-idiom-panel">
    <template v-if="test.phase === 'idle' || test.phase === 'loading'">
      <p class="mode-section__hint">
        针对事业单位「政治理论」高频考点：习近平新时代中国特色社会主义思想、党的二十大报告、二十届三中全会《决定》及政府工作报告相关表述，
        每轮 {{ test.questionCount }} 题四选一。正计时，提交后暂停并公布答案，点「下一题」继续。
      </p>
      <div class="chinese-setup">
        <el-button
          type="primary"
          :loading="test.phase === 'loading'"
          :disabled="!isAiChatConfigured()"
          @click="test.generatePaper()"
        >
          {{ test.questions.length ? '重新生成题目' : '生成题目' }}
        </el-button>
        <el-button
          type="success"
          :disabled="!test.questions.length || test.phase === 'loading'"
          @click="test.startQuiz()"
        >
          开始练习
        </el-button>
      </div>
      <p v-if="test.phase === 'loading'" class="chinese-setup__loading">{{ test.loadingMessage }}</p>
      <p v-else-if="test.questions.length" class="chinese-setup__ready">
        已备好 {{ test.questions.length }} 题，点击「开始练习」后计时。
      </p>
    </template>

    <template v-else-if="test.phase === 'running'">
      <div class="chinese-quiz__top">
        <span>第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题</span>
        <span
          v-if="test.paperSource === 'generated'"
          class="chinese-quiz__badge chinese-quiz__badge--new"
        >新题</span>
        <span
          v-else-if="test.paperSource === 'review'"
          class="chinese-quiz__badge chinese-quiz__badge--review"
        >复习题</span>
        <span v-if="test.currentQuestion">{{ theoryPolicyQuestionTypeLabel(test.currentQuestion.questionType) }}</span>
        <span class="chinese-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
          {{ test.quizRunningElapsedText }}
        </span>
        <div class="chinese-quiz__actions-top">
          <el-button v-if="test.currentQuestion" size="small" plain @click="onToggleFavorite">
            {{ favorited ? '已收藏' : '收藏' }}
          </el-button>
          <el-button size="small" plain @click="test.resetToIdle()">返回</el-button>
        </div>
      </div>

      <div v-if="test.currentQuestion" class="chinese-quiz__stem">
        <p class="chinese-quiz__question">{{ test.currentQuestion.stem }}</p>
      </div>

      <div v-if="test.currentQuestion" class="chinese-quiz__options">
        <button
          v-for="(opt, idx) in test.currentQuestion.options"
          :key="idx"
          type="button"
          class="chinese-option"
          :class="{
            'is-selected': test.selectedIndex === idx,
            'is-correct': test.submitted && idx === test.currentQuestion!.correctIndex,
            'is-wrong':
              test.submitted &&
              test.selectedIndex === idx &&
              idx !== test.currentQuestion!.correctIndex,
          }"
          :disabled="test.submitted"
          @click="test.selectOption(Number(idx))"
        >
          <span class="chinese-option__key">{{ Number(idx) + 1 }}</span>
          <span class="chinese-option__val">{{ opt }}</span>
        </button>
      </div>

      <div v-if="test.submitted && test.currentQuestion" class="chinese-quiz__feedback">
        <p
          :class="
            test.results[test.results.length - 1]?.correct
              ? 'feedback feedback--ok'
              : 'feedback feedback--bad'
          "
        >
          {{
            test.results[test.results.length - 1]?.correct
              ? '回答正确'
              : `回答错误 · 正确答案：${test.currentQuestion.options[test.currentQuestion.correctIndex]}`
          }}
        </p>
        <p v-if="test.currentQuestion.explanation" class="chinese-quiz__explain">
          {{ test.currentQuestion.explanation }}
        </p>
      </div>

      <div v-if="test.submitted && test.currentQuestion" class="chinese-quiz__assist">
        <div class="chinese-quiz__assist-head">
          <h5 class="chinese-quiz__assist-title">DeepSeek 本题讲解</h5>
          <el-button
            v-if="isAiChatConfigured()"
            size="small"
            plain
            :loading="assistLoading"
            :disabled="assistLoading"
            @click="runAssistExplain"
          >
            {{ assistTurns.length ? '重新讲解' : '生成讲解' }}
          </el-button>
        </div>
        <p v-if="!isAiChatConfigured()" class="chinese-quiz__assist-muted">
          未配置 AI 时无法讲解。
        </p>
        <template v-else>
          <p
            v-if="!assistTurns.length && !assistLoading"
            class="chinese-quiz__assist-muted"
          >
            需要时再点「生成讲解」，不会自动调用 AI。
          </p>
          <p v-if="assistLoading && !assistTurns.length" class="chinese-quiz__assist-muted">
            正在生成讲解…
          </p>
          <p v-if="assistError" class="chinese-quiz__assist-error">{{ assistError }}</p>
          <DeepseekChatThread :turns="assistTurns" first-assistant-title="讲解" />
          <div v-if="assistHistory.length" class="chinese-quiz__assist-followup">
            <el-input
              v-model="followupInput"
              type="textarea"
              :rows="2"
              placeholder="继续追问，例如：和「高质量发展」怎么区分？"
              @keydown.enter.exact.prevent="onSendFollowup"
            />
            <el-button
              type="primary"
              plain
              :loading="assistLoading"
              :disabled="assistLoading || !followupInput.trim()"
              @click="onSendFollowup"
            >
              发送追问
            </el-button>
          </div>
        </template>
      </div>

      <div class="chinese-quiz__actions">
        <el-button v-if="!test.submitted" type="primary" :disabled="test.selectedIndex == null" @click="test.submitCurrent()">
          提交
        </el-button>
        <el-button v-else type="primary" @click="test.nextQuestion()">
          {{ test.currentIndex >= test.questionCount - 1 ? '查看结果' : '下一题' }}
        </el-button>
      </div>
      <p v-if="!test.submitted" class="hint">键盘按 <kbd>1</kbd>～<kbd>4</kbd> 选择，再点「提交」</p>
    </template>

    <template v-else-if="test.phase === 'summary'">
      <h4 class="chinese-summary__title">本轮完成</h4>
      <p class="chinese-summary__stats">
        正确 {{ test.correctCount }} / {{ test.results.length }} 题 · {{ test.quizDurationSummaryText }}
      </p>
      <ul class="chinese-summary__list">
        <li
          v-for="row in test.results"
          :key="row.unitIndex"
          :class="row.correct ? 'log-ok' : 'log-bad'"
        >
          {{ row.unitIndex }}. {{ row.title }} · {{ row.typeLabel }} · {{ row.correct ? '对' : '错' }}
        </li>
      </ul>
      <div class="chinese-setup">
        <el-button type="primary" :loading="regenerating" @click="onRegenerate">
          再来一轮
        </el-button>
        <el-button @click="test.resetToIdle()">返回</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chinese-setup {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.chinese-setup__loading,
.chinese-setup__ready {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-quiz__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin-bottom: 16px;
  font-size: 14px;
}

.chinese-quiz__timer.is-paused {
  color: var(--el-color-warning);
}

.chinese-quiz__badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.chinese-quiz__badge--new {
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 35%, transparent);
}

.chinese-quiz__badge--review {
  color: var(--el-color-warning);
  background: color-mix(in srgb, var(--el-color-warning-light-9) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-warning) 35%, transparent);
}

.chinese-quiz__actions-top {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.chinese-quiz__stem {
  text-align: center;
  margin-bottom: 18px;
}

.chinese-quiz__question {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.55;
  font-weight: 600;
}

.chinese-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.chinese-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
}

.chinese-option:hover:not(:disabled) {
  border-color: var(--el-color-primary-light-5);
}

.chinese-option.is-selected:not(.is-correct):not(.is-wrong) {
  border-color: var(--el-color-primary);
}

.chinese-option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 50%, transparent);
}

.chinese-option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 45%, transparent);
}

.chinese-option:disabled {
  cursor: default;
}

.chinese-option__key {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--app-surface);
  border: 1px solid var(--app-border-soft);
  font-size: 12px;
  font-weight: 700;
}

.chinese-quiz__feedback {
  margin-bottom: 12px;
}

.chinese-quiz__explain {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
  line-height: 1.55;
}

.chinese-quiz__assist {
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
}

.chinese-quiz__assist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.chinese-quiz__assist-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.chinese-quiz__assist-muted {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-quiz__assist-error {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-color-danger);
}

.chinese-quiz__assist-followup {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.chinese-quiz__actions {
  display: flex;
  gap: 10px;
}

.chinese-summary__title {
  margin: 0 0 8px;
}

.chinese-summary__stats {
  margin: 0 0 12px;
  font-size: 14px;
}

.chinese-summary__list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
}

.chinese-summary__list li {
  padding: 8px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--app-border-soft);
}

.chinese-summary__list li:last-child {
  border-bottom: none;
}
</style>
