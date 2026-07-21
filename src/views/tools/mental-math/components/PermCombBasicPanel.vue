<script setup lang="ts">
import { renderDataAnalysisMathHtml } from '@/utils/dataAnalysisMathDisplay'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  usePermCombBasicTest,
  type PermCombBasicResultRow,
} from '@/composables/usePermCombBasicTest'
import {
  PERM_COMB_BASIC_MODES,
  permCombBasicDifficultyLabel,
  permCombBasicTopicLabel,
  type PermCombBasicDifficulty,
  type PermCombBasicQuestion,
} from '@/utils/permCombBasicPractice'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'

const selectedDifficulty = ref<PermCombBasicDifficulty | null>(null)
const test = reactive(usePermCombBasicTest(selectedDifficulty))
const regenerating = ref(false)
const detailRow = ref<PermCombBasicResultRow | null>(null)
const detailVisible = ref(false)

const isRunningOrLoading = computed(() =>
  test.phase === 'running' || test.phase === 'loading' || test.phase === 'summary',
)

defineExpose({ isRunningOrLoading })

function selectDifficulty(d: PermCombBasicDifficulty) {
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

function onRegenerate() {
  regenerating.value = true
  try {
    test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

function openResultDetail(row: PermCombBasicResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detailRow.value = null
}

function optionClass(row: PermCombBasicResultRow, idx: number) {
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

function passageHtml(q: PermCombBasicQuestion | null | undefined) {
  if (!q?.passage) return ''
  return esc(q.passage)
}

function stemHtml(q: PermCombBasicQuestion | null | undefined) {
  if (!q?.stem) return ''
  return esc(q.stem)
}

function explainHtml(q: PermCombBasicQuestion | null | undefined) {
  if (!q?.explanation) return ''
  return esc(q.explanation)
}

function optionHtml(opt: string): string {
  return esc(opt)
}

function mathHtml(text: string): string {
  return renderDataAnalysisMathHtml(text)
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
        考点「排列组合·基本原理及公式」：加法（分类）/乘法（分步）；排列 A_n^m、组合 C_n^m。简单对齐示例 1～4；普通对齐真题 1、2。本地程序组卷（不调用
        AI），每轮 {{ test.questionCount }} 题四选一。正计时，提交后暂停看答案。
      </p>
      <div class="mode-grid">
        <button
          v-for="m in PERM_COMB_BASIC_MODES"
          :key="m.id"
          type="button"
          class="mode-card mode-card--data-analysis"
          @click="selectDifficulty(m.id)"
        >
          <h3 class="mode-card__title">
            {{ m.label }}
            <PracticeCompletionStat :mode-id="`op-highfreq-perm-comb-basic-${m.id}`" />
          </h3>
          <p class="mode-card__desc">{{ m.desc }}</p>
          <span class="mode-card__cta">选择题型</span>
        </button>
      </div>
    </template>

    <template v-else-if="selectedDifficulty && (test.phase === 'idle' || test.phase === 'loading')">
      <p class="mode-section__hint">
        当前：{{ permCombBasicTopicLabel() }} · {{ permCombBasicDifficultyLabel(selectedDifficulty) }}。每轮
        {{ test.questionCount }} 题 · 本地组卷。正计时，提交后暂停看答案。
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
        <span>{{ permCombBasicTopicLabel() }} · {{ permCombBasicDifficultyLabel(selectedDifficulty!) }}</span>
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
          做法：
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="mathHtml(test.currentQuestion.method)" />
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
              做法：
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="mathHtml(detailRow.question.method)" />
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

.da-passage__hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.da-passage__body--revealed :deep(mark.da-evidence--subject-0) {
  background: color-mix(in srgb, #0d9488 32%, transparent);
  color: inherit;
  padding: 0 1px;
  border-bottom: 2px solid color-mix(in srgb, #0f766e 80%, transparent);
  border-radius: 2px;
}

.da-passage__body--revealed :deep(mark.da-evidence--subject-1) {
  background: color-mix(in srgb, #7c3aed 28%, transparent);
  color: inherit;
  padding: 0 1px;
  border-bottom: 2px solid color-mix(in srgb, #6d28d9 75%, transparent);
  border-radius: 2px;
}

.da-passage__body--revealed :deep(mark.da-evidence--subject-2) {
  background: color-mix(in srgb, #2563eb 28%, transparent);
  color: inherit;
  padding: 0 1px;
  border-bottom: 2px solid color-mix(in srgb, #1d4ed8 75%, transparent);
  border-radius: 2px;
}

.da-passage__body--revealed :deep(mark.da-evidence--data),
.da-passage__body--revealed :deep(mark.da-evidence--data-0),
.da-passage__body--revealed :deep(mark.da-evidence--data-1),
.da-passage__body--revealed :deep(mark.da-evidence--data-2) {
  background: color-mix(in srgb, #f59e0b 28%, transparent);
  color: inherit;
  padding: 0 1px;
  border-bottom: 2px solid color-mix(in srgb, #dc2626 70%, transparent);
  border-radius: 2px;
}

/* 数字短核：直接圈在数字上，不用长下划线 */
.da-passage__body--revealed :deep(mark.da-evidence--num) {
  background: color-mix(in srgb, #f59e0b 22%, transparent);
  border: 1.5px solid color-mix(in srgb, #c2410c 75%, transparent);
  border-bottom: 1.5px solid color-mix(in srgb, #c2410c 75%, transparent);
  border-radius: 999px;
  padding: 0 4px;
  margin: 0 1px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* 与主体同色系的数据，便于左右对照 */
.da-passage__body--revealed :deep(mark.da-evidence--data-0) {
  background: color-mix(in srgb, #0d9488 18%, #f59e0b 12%, transparent);
  border-bottom-color: color-mix(in srgb, #0f766e 55%, #dc2626 45%);
}
.da-passage__body--revealed :deep(mark.da-evidence--data-0.da-evidence--num) {
  border-color: color-mix(in srgb, #0f766e 70%, #c2410c 30%);
}
.da-passage__body--revealed :deep(mark.da-evidence--data-1) {
  background: color-mix(in srgb, #7c3aed 18%, #f59e0b 12%, transparent);
  border-bottom-color: color-mix(in srgb, #6d28d9 55%, #dc2626 45%);
}
.da-passage__body--revealed :deep(mark.da-evidence--data-1.da-evidence--num) {
  border-color: color-mix(in srgb, #6d28d9 70%, #c2410c 30%);
}
.da-passage__body--revealed :deep(mark.da-evidence--data-2) {
  background: color-mix(in srgb, #2563eb 18%, #f59e0b 12%, transparent);
  border-bottom-color: color-mix(in srgb, #1d4ed8 55%, #dc2626 45%);
}
.da-passage__body--revealed :deep(mark.da-evidence--data-2.da-evidence--num) {
  border-color: color-mix(in srgb, #1d4ed8 70%, #c2410c 30%);
}

.chinese-quiz__stem {
  text-align: left;
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
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--app-border, #d0d5dd);
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  font-size: 15px;
  line-height: 1.45;
}

.chinese-option.is-selected:not(.is-correct):not(.is-wrong) {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
}

.chinese-option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 65%, transparent);
}

.chinese-option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 65%, transparent);
}

.chinese-option:disabled {
  cursor: default;
}

.chinese-option__key {
  flex-shrink: 0;
  width: 1.4em;
  font-weight: 700;
  color: var(--app-text-muted);
}

.chinese-quiz__feedback {
  margin-bottom: 12px;
  text-align: left;
}

.feedback--ok {
  color: var(--el-color-success);
  font-weight: 600;
}

.feedback--bad {
  color: var(--el-color-danger);
  font-weight: 600;
}

.chinese-quiz__method,
.da-result-detail__method {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: color-mix(in srgb, #0d9488 85%, var(--app-text, #111));
}

.chinese-quiz__explain {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--app-text-muted);
  white-space: pre-wrap;
}

.chinese-quiz__careless {
  margin-top: 10px;
}

.chinese-quiz__careless-done {
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-quiz__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.hint {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.hint kbd {
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--app-border, #d0d5dd);
  font-size: 12px;
}

.chinese-summary__title {
  margin: 0 0 8px;
}

.chinese-summary__stats {
  margin: 0 0 6px;
  color: var(--app-text-muted);
}

.chinese-summary__hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-summary__list {
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
  line-height: 1.6;
}

.chinese-summary__list li {
  margin: 0 0 6px;
}

.chinese-summary__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  font: inherit;
  cursor: pointer;
  color: inherit;
}

.chinese-summary__item:hover {
  border-color: color-mix(in srgb, var(--app-border, #d0d5dd) 80%, transparent);
  background: color-mix(in srgb, var(--app-surface-alt, #f5f5f5) 70%, transparent);
}

.chinese-summary__item-tip {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
  opacity: 0.85;
}

.log-ok {
  color: var(--el-color-success);
}

.log-bad {
  color: var(--el-color-danger);
}

.da-result-detail {
  text-align: left;
}

.da-result-detail section {
  margin-bottom: 14px;
}

.da-result-detail h4 {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.da-result-detail__meta {
  margin: 0 0 14px;
  font-size: 14px;
}

.da-result-detail__meta .is-ok {
  color: var(--el-color-success);
}

.da-result-detail__meta .is-bad {
  color: var(--el-color-danger);
}

.da-result-detail__passage,
.da-result-detail__stem,
.da-result-detail__exp {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.da-result-detail__opts {
  margin: 0;
  padding: 0;
  list-style: none;
}

.da-result-detail__opts li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
  margin: 0 0 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--app-border, #d0d5dd);
  font-size: 14px;
  line-height: 1.45;
}

.da-result-detail__opts li.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 65%, transparent);
}

.da-result-detail__opts li.is-chosen-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 65%, transparent);
}

.da-result-detail__key {
  font-weight: 700;
  color: var(--app-text-muted);
}

.da-tag {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
}

.da-tag--ok {
  color: var(--el-color-success);
}

.da-tag--bad {
  color: var(--el-color-danger);
}

:deep(.da-math-frac) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0.1em 0.2em;
  line-height: 1.2;
}

:deep(.da-math-frac__num),
:deep(.da-math-frac__den) {
  font-size: 1em;
  padding: 0 0.25em;
  text-align: center;
  white-space: nowrap;
}

:deep(.da-math-frac__rule) {
  display: block;
  align-self: stretch;
  border-top: 1.5px solid currentColor;
  margin: 0.06em 0;
}

:deep(.da-math-root) {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-family: 'Cambria Math', 'Times New Roman', serif;
}

:deep(.da-math-root__idx) {
  font-size: 0.72em;
  margin-right: 1px;
  line-height: 1;
}

:deep(.da-math-root__sym) {
  font-size: 1.05em;
}

:deep(.da-math-radicand) {
  border-top: 1px solid currentColor;
  padding: 0 1px;
  margin-left: 1px;
  line-height: 1.15;
}

:deep(sup.da-math-sup) {
  font-size: 0.72em;
  font-weight: 750;
  line-height: 0;
  vertical-align: super;
}


.chinese-quiz__explain,
.da-result-detail__exp,
.chinese-quiz__method,
.da-result-detail__method {
  line-height: 2.15;
}
</style>
