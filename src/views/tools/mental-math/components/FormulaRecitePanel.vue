<script setup lang="ts">
import { renderDataAnalysisMathHtml } from '@/utils/dataAnalysisMathDisplay'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  useFormulaReciteTest,
  type FormulaReciteResultRow,
} from '@/composables/useFormulaReciteTest'
import {
  FORMULA_RECITE_QUESTION_COUNT,
  FORMULA_RECITE_MODES,
  formulaReciteDifficultyLabel,
  formulaReciteModuleLabel,
  formulasForModule,
  formulaDisplayLines,
  type FormulaEntry,
  type FormulaReciteModuleId,
  type FormulaReciteQuestion,
} from '@/utils/formulaRecitePractice'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'

const selectedModule = ref<FormulaReciteModuleId | null>(null)
const test = reactive(useFormulaReciteTest(selectedModule))
const regenerating = ref(false)
const detailRow = ref<FormulaReciteResultRow | null>(null)
const detailVisible = ref(false)
const formulaSheetVisible = ref(false)
const formulaSheetModule = ref<FormulaReciteModuleId | null>(null)

const isRunningOrLoading = computed(
  () =>
    selectedModule.value != null ||
    test.phase === 'running' ||
    test.phase === 'loading' ||
    test.phase === 'summary',
)

defineExpose({
  isRunningOrLoading,
  resetToIdle() {
    selectedModule.value = null
    test.resetToIdle()
  },
})

const formulaGroups = computed(() => {
  const mid = formulaSheetModule.value
  if (!mid) return [] as { group: string; items: FormulaEntry[] }[]
  const list = formulasForModule(mid)
  const map = new Map<string, FormulaEntry[]>()
  for (const f of list) {
    const arr = map.get(f.group) ?? []
    arr.push(f)
    map.set(f.group, arr)
  }
  return [...map.entries()].map(([group, items]) => ({ group, items }))
})

function selectModule(id: FormulaReciteModuleId) {
  if (test.phase === 'loading') return
  if (selectedModule.value !== id) {
    selectedModule.value = id
    test.questions = []
  }
}

function clearModule() {
  if (test.phase === 'loading') return
  selectedModule.value = null
  test.resetToIdle()
}

function openFormulaSheet(mid?: FormulaReciteModuleId | null) {
  formulaSheetModule.value = mid ?? selectedModule.value
  if (!formulaSheetModule.value) return
  formulaSheetVisible.value = true
}

async function onRegenerate() {
  regenerating.value = true
  try {
    await test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

function openResultDetail(row: FormulaReciteResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detailRow.value = null
}

function optionClass(row: FormulaReciteResultRow, idx: number) {
  const q = row.question
  const isCorrect = idx === q.correctIndex
  const isChosen = row.chosenIndex === idx
  return {
    'is-correct': isCorrect,
    'is-chosen-wrong': isChosen && !isCorrect,
  }
}

function mathHtml(text: string): string {
  return renderDataAnalysisMathHtml(text)
}

function stemHtml(q: FormulaReciteQuestion | null | undefined) {
  if (!q?.stem) return ''
  return q.stem
    .split(/\n+/)
    .map((line) => renderDataAnalysisMathHtml(line.trim()))
    .filter(Boolean)
    .join('<br />')
}

function explainHtml(q: FormulaReciteQuestion | null | undefined) {
  if (!q?.explanation) return ''
  return q.explanation
    .split(/\n+/)
    .map((line) => renderDataAnalysisMathHtml(line.trim()))
    .filter(Boolean)
    .join('<br />')
}

function optionHtml(opt: string): string {
  return renderDataAnalysisMathHtml(opt)
}

function methodHtml(text: string): string {
  return text
    .split(/\n+/)
    .map((line) => renderDataAnalysisMathHtml(line.trim()))
    .filter(Boolean)
    .join('<br />')
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
    <template v-if="!selectedModule && (test.phase === 'idle' || test.phase === 'loading')">
      <p class="mode-section__hint">
        考点「公式背诵」：数量关系公式 + 资料分析术语/公式。题干统一为「xxx公式是什么」，选项为完整公式。模块考察重点互不交叉；全部为普通题，每轮最多
        {{ FORMULA_RECITE_QUESTION_COUNT }} 题四选一（未出优先，出完一轮后循环）。正计时，提交后暂停看答案。可点「查看公式」。
      </p>
      <div class="mode-grid">
        <button
          v-for="m in FORMULA_RECITE_MODES"
          :key="m.id"
          type="button"
          class="mode-card mode-card--data-analysis"
          @click="selectModule(m.id)"
        >
          <h3 class="mode-card__title">
            {{ m.label }}
            <PracticeCompletionStat :mode-id="`formula-recite-${m.id}`" />
          </h3>
          <p class="mode-card__desc">{{ m.desc }}</p>
          <span class="mode-card__cta">选择模块</span>
        </button>
      </div>
      <div class="formula-sheet-row">
        <el-button
          v-for="m in FORMULA_RECITE_MODES"
          :key="`sheet-${m.id}`"
          size="small"
          plain
          @click="openFormulaSheet(m.id)"
        >
          查看公式 · {{ m.label }}
        </el-button>
      </div>
    </template>

    <template v-else-if="selectedModule && (test.phase === 'idle' || test.phase === 'loading')">
      <p class="mode-section__hint">
        当前：{{ formulaReciteModuleLabel(selectedModule) }} ·
        {{ formulaReciteDifficultyLabel() }}。每轮最多 {{ FORMULA_RECITE_QUESTION_COUNT }} 题 · 本地组卷。正计时，提交后暂停看答案。
      </p>
      <div class="chinese-setup">
        <el-button size="small" plain @click="clearModule">返回模块</el-button>
        <el-button size="small" plain @click="openFormulaSheet(selectedModule)">查看公式</el-button>
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
        <span
          >{{ formulaReciteModuleLabel(selectedModule!) }} ·
          {{ formulaReciteDifficultyLabel() }}</span
        >
        <span class="chinese-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
          {{ test.quizRunningElapsedText }}
        </span>
        <div class="chinese-quiz__actions-top">
          <el-button size="small" plain @click="openFormulaSheet(selectedModule)">查看公式</el-button>
          <el-button size="small" plain @click="test.resetToIdle(); selectedModule = null">
            返回
          </el-button>
        </div>
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
          <span class="chinese-option__val formula-math" v-html="optionHtml(opt)" />
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
          <span v-html="methodHtml(test.currentQuestion.method)" />
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
        <el-button size="small" plain @click="openFormulaSheet(selectedModule)">查看公式</el-button>
        <el-button
          @click="
            test.resetToIdle();
            selectedModule = null
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
                <span class="formula-math" v-html="optionHtml(opt)" />
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
              <span v-html="methodHtml(detailRow.question.method)" />
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

    <el-dialog
      v-model="formulaSheetVisible"
      :title="
        formulaSheetModule
          ? `公式表 · ${formulaReciteModuleLabel(formulaSheetModule)}`
          : '公式表'
      "
      width="640px"
      align-center
      destroy-on-close
      append-to-body
      class="formula-sheet-dialog"
    >
      <div class="formula-sheet">
        <section v-for="g in formulaGroups" :key="g.group" class="formula-sheet__group">
          <h4 class="formula-sheet__group-title">{{ g.group }}</h4>
          <ul class="formula-sheet__list">
            <li v-for="item in g.items" :key="item.id" class="formula-sheet__item">
              <span class="formula-sheet__name">{{ item.name }}</span>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span
                v-for="(line, li) in formulaDisplayLines(item.formula)"
                :key="`${item.id}-line-${li}`"
                class="formula-sheet__expr"
                v-html="mathHtml(line)"
              />
              <ul v-if="item.params?.length" class="formula-sheet__params">
                <li v-for="(p, pi) in item.params" :key="`${item.id}-p-${pi}`">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span class="formula-sheet__param-sym" v-html="mathHtml(p.symbol)" />
                  <span class="formula-sheet__param-sep">：</span>
                  <span class="formula-sheet__param-mean">{{ p.meaning }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </div>
      <template #footer>
        <el-button type="primary" @click="formulaSheetVisible = false">关闭</el-button>
      </template>
    </el-dialog>
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
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
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

.formula-sheet-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.formula-sheet {
  text-align: left;
  max-height: min(70vh, 560px);
  overflow: auto;
}

.formula-sheet__group {
  margin-bottom: 16px;
}

.formula-sheet__group-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0f766e;
}

.formula-sheet__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.formula-sheet__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--app-border, #d0d5dd) 85%, transparent);
  background: color-mix(in srgb, var(--app-surface-alt, #f8fafc) 80%, transparent);
}

.formula-sheet__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.formula-sheet__expr {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.12em 0.16em;
  font-size: 1.22rem;
  line-height: 1.35;
  font-family: 'Cambria Math', Cambria, 'Times New Roman', 'Songti SC', 'SimSun', serif;
  color: var(--app-text, #111827);
  letter-spacing: 0.01em;
}

.formula-sheet__params {
  margin: 2px 0 0;
  padding: 8px 10px;
  list-style: none;
  border-radius: 6px;
  background: color-mix(in srgb, #0d9488 8%, transparent);
  border: 1px solid color-mix(in srgb, #0d9488 18%, transparent);
}

.formula-sheet__params li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 0;
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text, #1f2937);
}

.formula-sheet__params li:last-child {
  margin-bottom: 0;
}

.formula-sheet__param-sym {
  font-family: 'Cambria Math', Cambria, 'Times New Roman', serif;
  font-weight: 700;
  color: #0f766e;
}

.formula-sheet__param-sep {
  color: var(--app-text-muted);
}

.formula-sheet__param-mean {
  color: var(--app-text-muted);
}

.chinese-quiz__question,
.chinese-option__val,
.chinese-quiz__explain,
.da-result-detail__stem,
.da-result-detail__exp {
  font-family: 'Cambria Math', Cambria, 'Times New Roman', 'Songti SC', 'SimSun', serif;
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

.chinese-quiz__stem {
  text-align: left;
  margin-bottom: 18px;
}

.chinese-quiz__question {
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.75;
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
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 52px;
  text-align: left;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--app-border, #d0d5dd);
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  font-size: 16px;
  line-height: 1.7;
}

.formula-math {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.12em 0.16em;
  line-height: 1.35;
}

.chinese-option__val {
  flex: 1;
  min-width: 0;
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
  align-items: center;
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
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  margin: 0 0.18em;
  line-height: 1.1;
}

:deep(.da-math-frac__num),
:deep(.da-math-frac__den) {
  font-size: 0.92em;
  padding: 0 0.28em;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
  font-family: inherit;
}

:deep(.da-math-frac__rule) {
  display: block;
  align-self: stretch;
  border-top: 1.6px solid currentColor;
  margin: 0.08em 0;
}

:deep(.da-math-var) {
  display: inline;
  white-space: nowrap;
}

:deep(.da-math-ss) {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  vertical-align: middle;
  margin-left: 0.06em;
  line-height: 1;
  font-size: 0.62em;
  font-weight: 600;
}

:deep(.da-math-ss .da-math-sup),
:deep(.da-math-ss .da-math-sub) {
  display: block;
  font-size: 1em;
  line-height: 1.05;
  vertical-align: baseline;
  position: static;
}

:deep(sub.da-math-sub) {
  font-size: 0.72em;
  font-weight: 600;
  line-height: 0;
  vertical-align: sub;
}

:deep(sup.da-math-sup) {
  font-size: 0.72em;
  font-weight: 750;
  line-height: 0;
  vertical-align: super;
}
</style>
