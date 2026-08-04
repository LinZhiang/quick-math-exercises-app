<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  useComboArrangeTest,
  type ComboArrangeResultRow,
} from '@/composables/useComboArrangeTest'
import {
  COMBO_ARRANGE_MODES,
  comboArrangeDifficultyLabel,
  comboArrangeTopicLabel,
  type ComboArrangeDifficulty,
  type ComboArrangeQuestion,
} from '@/utils/comboArrangePractice'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'

const selectedDifficulty = ref<ComboArrangeDifficulty | null>(null)
const test = reactive(useComboArrangeTest(selectedDifficulty))
const regenerating = ref(false)
const detailRow = ref<ComboArrangeResultRow | null>(null)
const detailVisible = ref(false)

const isRunningOrLoading = computed(
  () =>
    selectedDifficulty.value != null ||
    test.phase === 'running' ||
    test.phase === 'loading' ||
    test.phase === 'summary',
)

defineExpose({ isRunningOrLoading })

function selectDifficulty(d: ComboArrangeDifficulty) {
  if (test.phase === 'loading') return
  if (selectedDifficulty.value !== d) {
    selectedDifficulty.value = d
    test.questions = []
  }
}

function clearDifficulty() {
  if (test.phase === 'loading') return
  selectedDifficulty.value = null
  test.resetToIdle()
}

async function onRegenerate() {
  regenerating.value = true
  try {
    await test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

function openResultDetail(row: ComboArrangeResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detailRow.value = null
}

function optionClass(row: ComboArrangeResultRow, idx: number) {
  const q = row.question
  const isCorrect = idx === q.correctIndex
  const isChosen = row.chosenIndex === idx
  return {
    'is-correct': isCorrect,
    'is-chosen-wrong': isChosen && !isCorrect,
  }
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
}

function passageHtml(q: ComboArrangeQuestion | null | undefined) {
  if (!q?.passage) return ''
  return esc(q.passage)
}

function stemHtml(q: ComboArrangeQuestion | null | undefined) {
  if (!q?.stem) return ''
  return esc(q.stem)
}

function explainHtml(q: ComboArrangeQuestion | null | undefined) {
  if (!q?.explanation) return ''
  return esc(q.explanation)
}

function optionHtml(opt: string): string {
  return esc(opt)
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
  <div
    class="chinese-idiom-panel data-analysis-panel"
    :data-session-active="isRunningOrLoading ? '' : undefined"
  >
    <template v-if="!selectedDifficulty && (test.phase === 'idle' || test.phase === 'loading')">
      <p class="mode-section__hint">
        考点「组合排列」：根据若干条件对对象做排序或一对一匹配，推出唯一结果。由网页 AI
        大模型出题（需已配置），每轮 {{ test.questionCount }} 题四选一。正计时，提交后暂停看答案。
      </p>
      <div class="mode-grid">
        <button
          v-for="m in COMBO_ARRANGE_MODES"
          :key="m.id"
          type="button"
          class="mode-card mode-card--data-analysis"
          @click="selectDifficulty(m.id)"
        >
          <h3 class="mode-card__title">
            {{ m.label }}
            <PracticeCompletionStat :mode-id="`logic-reason-combo-arrange-${m.id}`" />
          </h3>
          <p class="mode-card__desc">{{ m.desc }}</p>
          <span class="mode-card__cta">选择题型</span>
        </button>
      </div>
    </template>

    <template v-else-if="selectedDifficulty && (test.phase === 'idle' || test.phase === 'loading')">
      <p class="mode-section__hint">
        当前：{{ comboArrangeTopicLabel() }} ·
        {{ comboArrangeDifficultyLabel(selectedDifficulty) }}。每轮
        {{ test.questionCount }} 题 · AI 出题。正计时，提交后暂停看答案。
      </p>
      <div class="chinese-setup">
        <el-button size="small" plain @click="clearDifficulty">返回题型</el-button>
        <el-button type="primary" :loading="test.phase === 'loading'" @click="test.generatePaper()">
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
        <span>
          {{ comboArrangeTopicLabel() }} ·
          {{ comboArrangeDifficultyLabel(selectedDifficulty!) }}
        </span>
        <span class="chinese-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
          {{ test.quizRunningElapsedText }}
        </span>
        <div class="chinese-quiz__actions-top">
          <el-button size="small" plain @click="test.resetToIdle(); selectedDifficulty = null">
            返回
          </el-button>
        </div>
      </div>

      <div v-if="test.currentQuestion?.passage" class="da-passage">
        <h5 class="da-passage__title">材料</h5>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="da-passage__body" v-html="passageHtml(test.currentQuestion)" />
      </div>

      <div v-if="test.currentQuestion" class="chinese-quiz__stem">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="chinese-quiz__question" v-html="stemHtml(test.currentQuestion)" />
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
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="chinese-option__val" v-html="optionHtml(opt)" />
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
          <template v-if="test.results[test.results.length - 1]?.correct">回答正确</template>
          <template v-else>
            回答错误 · 正确答案：
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span
              v-html="optionHtml(test.currentQuestion.options[test.currentQuestion.correctIndex] ?? '')"
            />
          </template>
        </p>
        <p v-if="test.currentQuestion.method" class="chinese-quiz__method">
          做法：{{ test.currentQuestion.method }}
        </p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p
          v-if="test.currentQuestion.explanation"
          class="chinese-quiz__explain da-passage__body--revealed"
          v-html="explainHtml(test.currentQuestion)"
        />
        <div
          v-if="!test.results[test.results.length - 1]?.correct"
          class="chinese-quiz__careless"
        >
          <el-button
            v-if="!test.carelessMarked"
            size="small"
            plain
            @click="test.markCarelessWrong()"
          >
            粗心答错
          </el-button>
          <span v-else class="chinese-quiz__careless-done">已标记粗心，不入错题本</span>
        </div>
      </div>

      <div class="chinese-quiz__actions">
        <el-button
          v-if="!test.submitted"
          type="primary"
          :disabled="test.selectedIndex == null"
          @click="test.submitCurrent()"
        >
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
      <p class="chinese-summary__hint">点击题目可查看题干、选项与解析</p>
      <ul class="chinese-summary__list">
        <li
          v-for="row in test.results"
          :key="row.unitIndex"
          :class="row.correct ? 'log-ok' : 'log-bad'"
        >
          <button type="button" class="chinese-summary__item" @click="openResultDetail(row)">
            {{ row.unitIndex }}. {{ row.title }} · {{ row.typeLabel }} ·
            {{ row.correct ? '对' : '错' }}
            <span class="chinese-summary__item-tip">查看</span>
          </button>
        </li>
      </ul>
      <div class="chinese-setup">
        <el-button type="primary" :loading="regenerating" @click="onRegenerate">再来一轮</el-button>
        <el-button
          @click="
            test.resetToIdle();
            selectedDifficulty = null
          "
        >
          返回
        </el-button>
      </div>

      <el-dialog
        v-model="detailVisible"
        :title="`第 ${detailRow?.unitIndex ?? ''} 题 · ${detailRow?.title ?? ''}`"
        width="560px"
        align-center
        destroy-on-close
        append-to-body
        @closed="onDetailClosed"
      >
        <div v-if="detailRow" class="da-result-detail">
          <p class="da-result-detail__meta">
            {{ detailRow.typeLabel }} ·
            <strong :class="detailRow.correct ? 'is-ok' : 'is-bad'">
              {{ detailRow.correct ? '回答正确' : '回答错误' }}
            </strong>
          </p>
          <section v-if="detailRow.question.passage">
            <h4>材料</h4>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              class="da-result-detail__passage da-passage__body--revealed"
              v-html="passageHtml(detailRow.question)"
            />
          </section>
          <section>
            <h4>题干</h4>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              class="da-result-detail__stem da-passage__body--revealed"
              v-html="stemHtml(detailRow.question)"
            />
          </section>
          <section>
            <h4>选项</h4>
            <ul class="da-result-detail__opts">
              <li
                v-for="(opt, idx) in detailRow.question.options"
                :key="idx"
                :class="optionClass(detailRow, Number(idx))"
              >
                <span class="da-result-detail__key">{{ Number(idx) + 1 }}.</span>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-html="optionHtml(opt)" />
                <span v-if="Number(idx) === detailRow.question.correctIndex" class="da-tag da-tag--ok">
                  正确
                </span>
                <span
                  v-else-if="detailRow.chosenIndex === Number(idx)"
                  class="da-tag da-tag--bad"
                >
                  你的选择
                </span>
              </li>
            </ul>
          </section>
          <section v-if="detailRow.question.method || detailRow.question.explanation">
            <h4>解析</h4>
            <p v-if="detailRow.question.method" class="da-result-detail__method">
              做法：{{ detailRow.question.method }}
            </p>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="detailRow.question.explanation"
              class="da-result-detail__exp da-passage__body--revealed"
              v-html="explainHtml(detailRow.question)"
            />
          </section>
        </div>
        <template #footer>
          <el-button type="primary" @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<style scoped>
.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.mode-card {
  text-align: left;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--app-border, #d0d5dd) 80%, transparent);
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.mode-card--data-analysis:hover {
  border-color: color-mix(in srgb, #0d9488 55%, transparent);
  box-shadow: 0 4px 14px color-mix(in srgb, #0d9488 18%, transparent);
}

.mode-card__title {
  margin: 0 0 6px;
  font-size: 1rem;
}

.mode-card__desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--app-text-muted);
}

.mode-card__cta {
  font-size: 13px;
  font-weight: 600;
  color: #0d9488;
}

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

.chinese-quiz__actions-top {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.da-passage {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--el-color-info-light-9) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-info) 22%, transparent);
  text-align: left;
}

.da-passage__title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.da-passage__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.chinese-quiz__stem {
  margin-bottom: 12px;
  text-align: left;
}

.chinese-quiz__question {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 600;
}

.chinese-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chinese-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--app-border, #d0d5dd);
  background: var(--app-card-bg, #fff);
  cursor: pointer;
}

.chinese-option.is-selected {
  border-color: color-mix(in srgb, #0d9488 55%, transparent);
}

.chinese-option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 70%, transparent);
}

.chinese-option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 70%, transparent);
}

.chinese-option__key {
  flex-shrink: 0;
  width: 1.4em;
  font-weight: 700;
}

.chinese-option__val {
  flex: 1;
  line-height: 1.5;
}

.chinese-quiz__feedback {
  margin-top: 14px;
  text-align: left;
}

.feedback--ok {
  color: var(--el-color-success);
}

.feedback--bad {
  color: var(--el-color-danger);
}

.chinese-quiz__method,
.chinese-quiz__explain {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.6;
}

.chinese-quiz__careless {
  margin-top: 8px;
}

.chinese-quiz__careless-done {
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-quiz__actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.chinese-summary__title {
  margin: 0 0 8px;
}

.chinese-summary__stats,
.chinese-summary__hint {
  margin: 0 0 8px;
  font-size: 14px;
}

.chinese-summary__hint {
  color: var(--app-text-muted);
  font-size: 13px;
}

.chinese-summary__list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}

.chinese-summary__item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid var(--app-border, #e5e7eb);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  margin-bottom: 6px;
}

.chinese-summary__item-tip {
  float: right;
  font-size: 12px;
  color: #0d9488;
}

.log-ok .chinese-summary__item {
  border-color: color-mix(in srgb, var(--el-color-success) 35%, transparent);
}

.log-bad .chinese-summary__item {
  border-color: color-mix(in srgb, var(--el-color-danger) 35%, transparent);
}

.da-result-detail {
  text-align: left;
}

.da-result-detail section {
  margin-top: 12px;
}

.da-result-detail h4 {
  margin: 0 0 6px;
  font-size: 13px;
}

.da-result-detail__meta .is-ok {
  color: var(--el-color-success);
}

.da-result-detail__meta .is-bad {
  color: var(--el-color-danger);
}

.da-result-detail__opts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.da-result-detail__opts li {
  margin-bottom: 6px;
  padding: 6px 8px;
  border-radius: 6px;
}

.da-result-detail__opts li.is-correct {
  background: color-mix(in srgb, var(--el-color-success-light-9) 80%, transparent);
}

.da-result-detail__opts li.is-chosen-wrong {
  background: color-mix(in srgb, var(--el-color-danger-light-9) 80%, transparent);
}

.da-tag {
  margin-left: 6px;
  font-size: 12px;
}

.da-tag--ok {
  color: var(--el-color-success);
}

.da-tag--bad {
  color: var(--el-color-danger);
}
</style>
