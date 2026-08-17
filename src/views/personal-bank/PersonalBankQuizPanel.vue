<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import RichTextView from '@/components/RichTextView.vue'
import { usePersonalBankQuiz, type PersonalBankQuizResultRow } from '@/composables/usePersonalBankQuiz'
import {
  personalBankChoiceModeOf,
  personalBankQuestionTypeLabel,
  type PersonalBankQuestion,
} from '@/utils/personalQuestionBank'
import type { AiProvider } from '@/utils/aiProviderStore'

const props = defineProps<{
  paper: PersonalBankQuestion[]
  heading: string
  modeId: string
  categoryId: string
  subId: string
  choiceProvider: AiProvider
}>()

const emit = defineEmits<{
  exit: []
}>()

const test = reactive(usePersonalBankQuiz())
const detailRow = ref<PersonalBankQuizResultRow | null>(null)
const detailVisible = ref(false)

const idleReady = computed(() => test.phase === 'idle')
const loading = computed(() => test.phase === 'loading')

function startQuiz() {
  void test.start({
    paper: props.paper,
    modeId: props.modeId,
    categoryId: props.categoryId,
    subId: props.subId,
    provider: props.choiceProvider,
  })
}

onMounted(() => {
  if (props.paper.length) startQuiz()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function onExit() {
  test.resetToIdle()
  emit('exit')
}

function openResultDetail(row: PersonalBankQuizResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detailRow.value = null
}

function scoreClass(row: PersonalBankQuizResultRow) {
  if (row.awardedScore >= row.fullScore) return 'log-ok'
  if (row.awardedScore > 0) return 'log-mid'
  return 'log-bad'
}

function resultTag(row: PersonalBankQuizResultRow) {
  if (row.awardedScore >= row.fullScore) return row.question.type === 'choice' ? '正确' : '满分'
  if (row.awardedScore > 0) return '部分分'
  return row.question.type === 'choice' ? '错误' : '0分'
}

function onKeydown(ev: KeyboardEvent) {
  if (test.phase !== 'running' || test.revealed || !test.isChoice) return
  const n = Number(ev.key)
  if (Number.isInteger(n) && n >= 1 && n <= 4) {
    ev.preventDefault()
    test.selectOption(n - 1)
  }
}
</script>

<template>
  <div class="pb-quiz">
    <template v-if="loading">
      <p class="pb-quiz__hint">{{ test.loadingMessage || '正在组卷…' }}</p>
      <div class="pb-quiz__setup">
        <el-button size="small" plain @click="onExit">返回题库</el-button>
      </div>
    </template>

    <template v-else-if="idleReady">
      <p class="pb-quiz__hint">组卷未开始或已失败。可返回后重试。</p>
      <div class="pb-quiz__setup">
        <el-button size="small" plain @click="onExit">返回题库</el-button>
        <el-button type="success" :disabled="!paper.length" @click="startQuiz">开始练习</el-button>
      </div>
    </template>

    <template v-else-if="test.phase === 'running' && test.currentQuestion">
      <div class="pb-quiz__top">
        <span>第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题</span>
        <span>{{ personalBankQuestionTypeLabel(test.currentQuestion.type, personalBankChoiceModeOf(test.currentQuestion)) }} · {{ test.currentQuestion.score }} 分</span>
        <span class="pb-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
          {{ test.quizRunningElapsedText }}
        </span>
        <div class="pb-quiz__top-actions">
          <el-button size="small" plain @click="onExit">返回</el-button>
        </div>
      </div>

      <h3 class="pb-quiz__title">{{ test.currentQuestion.title }}</h3>
      <div class="pb-quiz__stem">
        <RichTextView :html="test.currentQuestion.stemHtml" />
      </div>

      <template v-if="test.isChoice && test.currentItem?.optionsHtml">
        <div class="pb-quiz__options">
          <button
            v-for="(opt, idx) in test.currentItem.optionsHtml"
            :key="idx"
            type="button"
            class="pb-quiz__option"
            :class="{
              'is-selected': test.selectedIndex === idx,
              'is-correct': test.revealed && idx === test.currentItem.correctIndex,
              'is-wrong':
                test.revealed &&
                test.selectedIndex === idx &&
                idx !== test.currentItem.correctIndex,
            }"
            :disabled="test.revealed"
            @click="test.selectOption(Number(idx))"
          >
            <span class="pb-quiz__option-key">{{ Number(idx) + 1 }}</span>
            <span class="pb-quiz__option-val">
              <RichTextView :html="opt" />
            </span>
          </button>
        </div>
      </template>
      <template v-else>
        <label class="pb-quiz__answer-label" for="pb-user-answer">你的作答（选填）</label>
        <el-input
          id="pb-user-answer"
          v-model="test.userAnswer"
          type="textarea"
          :rows="4"
          :disabled="test.revealed"
          placeholder="可先写下答案，再点下一步对照"
        />
      </template>

      <div v-if="test.revealed && test.currentQuestion" class="pb-quiz__reveal">
        <template v-if="test.isChoice">
          <p
            class="pb-quiz__judge"
            :class="test.awardedScore && test.awardedScore >= test.currentQuestion.score ? 'is-ok' : 'is-bad'"
          >
            <template v-if="test.awardedScore && test.awardedScore >= test.currentQuestion.score">
              回答正确
            </template>
            <template v-else>回答错误</template>
            · {{ test.awardedScore ?? 0 }} / {{ test.currentQuestion.score }} 分
          </p>
        </template>
        <template v-else>
          <h4>参考答案</h4>
          <div class="pb-quiz__official">
            <RichTextView :html="test.currentQuestion.answer" />
          </div>
        </template>
        <template v-if="test.currentQuestion.explanationHtml">
          <h4>解析</h4>
          <div class="pb-quiz__explain">
            <RichTextView :html="test.currentQuestion.explanationHtml" />
          </div>
        </template>
        <div v-if="!test.isChoice" class="pb-quiz__score">
          <p class="pb-quiz__score-label">自己评分（满分 {{ test.currentQuestion.score }} 分）</p>
          <div class="pb-quiz__score-row">
            <el-input-number
              v-model="test.scoreDraft"
              :min="0"
              :max="test.currentQuestion.score"
              :step="0.5"
              :precision="1"
              placeholder="分数"
            />
            <el-button @click="test.applySelfScore(0)">0 分</el-button>
            <el-button type="success" plain @click="test.applySelfScore(test.currentQuestion.score)">
              满分
            </el-button>
          </div>
          <p v-if="test.awardedScore != null" class="pb-quiz__score-done">
            已评 {{ test.awardedScore }} / {{ test.currentQuestion.score }} 分
          </p>
        </div>
      </div>

      <div class="pb-quiz__actions">
        <el-button
          type="primary"
          :disabled="test.isChoice && !test.revealed && test.selectedIndex == null"
          @click="test.goNext()"
        >
          {{ test.nextButtonLabel }}
        </el-button>
      </div>
      <p v-if="test.isChoice && !test.revealed" class="pb-quiz__tip">
        键盘按 1～4 选择，再点「提交」。对错由系统判定。
      </p>
      <p v-else-if="!test.isChoice && !test.revealed" class="pb-quiz__tip">
        作答后点「下一步」查看答案，再给自己打分。
      </p>
      <p
        v-else-if="!test.isChoice && test.awardedScore == null && test.scoreDraft == null"
        class="pb-quiz__tip"
      >
        请先评分，再进入下一题。
      </p>
    </template>

    <template v-else-if="test.phase === 'summary'">
      <h4 class="pb-quiz__summary-title">本轮完成</h4>
      <p class="pb-quiz__stats">
        得分 {{ test.totalAwarded }} / {{ test.totalFull }} 分 · 全对
        {{ test.correctCount }} / {{ test.results.length }} 题
        <template v-if="test.quizDurationSummaryText"> · {{ test.quizDurationSummaryText }}</template>
      </p>
      <p class="pb-quiz__tip">点击题目可查看题干、答案与解析</p>
      <ul class="pb-quiz__list">
        <li v-for="row in test.results" :key="row.unitIndex" :class="scoreClass(row)">
          <button type="button" class="pb-quiz__item" @click="openResultDetail(row)">
            {{ row.unitIndex }}. {{ row.question.title }} · {{ resultTag(row) }}
            {{ row.awardedScore }}/{{ row.fullScore }}
            <span class="pb-quiz__item-tip">查看</span>
          </button>
        </li>
      </ul>
      <div class="pb-quiz__setup">
        <el-button type="primary" :disabled="!paper.length" @click="startQuiz">再来一轮</el-button>
        <el-button @click="onExit">返回</el-button>
      </div>

      <el-dialog
        v-model="detailVisible"
        :title="`第 ${detailRow?.unitIndex ?? ''} 题 · ${detailRow?.question.title ?? ''}`"
        width="560px"
        align-center
        destroy-on-close
        append-to-body
        @closed="onDetailClosed"
      >
        <div v-if="detailRow" class="pb-quiz__detail">
          <p>
            {{ personalBankQuestionTypeLabel(detailRow.question.type, personalBankChoiceModeOf(detailRow.question)) }} ·
            <strong>{{ resultTag(detailRow) }} {{ detailRow.awardedScore }}/{{ detailRow.fullScore }}</strong>
          </p>
          <section>
            <h4>题目</h4>
            <RichTextView :html="detailRow.question.stemHtml" />
          </section>
          <section v-if="detailRow.optionsHtml?.length">
            <h4>选项</h4>
            <ul class="pb-quiz__detail-opts">
              <li
                v-for="(opt, idx) in detailRow.optionsHtml"
                :key="idx"
                :class="{
                  'is-correct': idx === detailRow.correctIndex,
                  'is-chosen-wrong':
                    detailRow.selectedIndex === idx && idx !== detailRow.correctIndex,
                }"
              >
                <span class="pb-quiz__option-key">{{ Number(idx) + 1 }}.</span>
                <RichTextView :html="opt" />
              </li>
            </ul>
          </section>
          <section v-else-if="detailRow.userAnswer">
            <h4>你的作答</h4>
            <p class="pb-quiz__official">{{ detailRow.userAnswer }}</p>
          </section>
          <section v-if="detailRow.question.type !== 'choice'">
            <h4>参考答案</h4>
            <div class="pb-quiz__official">
              <RichTextView :html="detailRow.question.answer" />
            </div>
          </section>
          <section v-else>
            <h4>正确答案</h4>
            <RichTextView :html="detailRow.question.answerHtml || detailRow.question.answer" />
          </section>
          <section v-if="detailRow.question.explanationHtml">
            <h4>解析</h4>
            <RichTextView :html="detailRow.question.explanationHtml" />
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
.pb-quiz {
  min-width: 0;
  max-width: 100%;
}

.pb-quiz__hint,
.pb-quiz__tip {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.pb-quiz__setup {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.pb-quiz__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin-bottom: 14px;
  font-size: 14px;
}

.pb-quiz__timer.is-paused {
  color: var(--el-color-warning);
}

.pb-quiz__top-actions {
  margin-left: auto;
}

.pb-quiz__title {
  margin: 0 0 10px;
  font-size: 1.05rem;
}

.pb-quiz__stem {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--app-border-soft, #e5e7eb);
  background: color-mix(in srgb, var(--app-surface-alt, #f8fafc) 80%, transparent);
}

.pb-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.pb-quiz__option {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  text-align: left;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--app-border, #d0d5dd);
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.pb-quiz__option.is-selected:not(.is-correct):not(.is-wrong) {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
}

.pb-quiz__option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 65%, transparent);
}

.pb-quiz__option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 65%, transparent);
}

.pb-quiz__option:disabled {
  cursor: default;
}

.pb-quiz__option-key {
  flex-shrink: 0;
  width: 1.4em;
  font-weight: 700;
  color: var(--app-text-muted);
}

.pb-quiz__option-val {
  flex: 1;
  min-width: 0;
}

.pb-quiz__answer-label {
  display: block;
  margin: 4px 0 6px;
  font-size: 13px;
  font-weight: 600;
}

.pb-quiz__reveal {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
}

.pb-quiz__reveal h4 {
  margin: 12px 0 6px;
  font-size: 14px;
}

.pb-quiz__reveal h4:first-child {
  margin-top: 0;
}

.pb-quiz__judge {
  margin: 0 0 8px;
  font-weight: 700;
}

.pb-quiz__judge.is-ok {
  color: var(--el-color-success);
}

.pb-quiz__judge.is-bad {
  color: var(--el-color-danger);
}

.pb-quiz__official {
  margin: 0 0 10px;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.6;
}

.pb-quiz__score {
  margin-top: 12px;
}

.pb-quiz__score-label {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.pb-quiz__score-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.pb-quiz__score-done {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--el-color-success);
}

.pb-quiz__actions {
  margin-top: 16px;
}

.pb-quiz__summary-title {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.pb-quiz__stats {
  margin: 0;
  font-size: 14px;
}

.pb-quiz__list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.pb-quiz__item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  padding: 8px 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.pb-quiz__item-tip {
  color: var(--el-color-primary);
  font-size: 13px;
}

.log-ok .pb-quiz__item {
  color: var(--el-color-success);
}

.log-mid .pb-quiz__item {
  color: var(--el-color-warning);
}

.log-bad .pb-quiz__item {
  color: var(--el-color-danger);
}

.pb-quiz__detail section {
  margin-top: 12px;
}

.pb-quiz__detail h4 {
  margin: 0 0 6px;
  font-size: 14px;
}

.pb-quiz__detail-opts {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pb-quiz__detail-opts li {
  display: flex;
  gap: 8px;
  padding: 6px 0;
}

.pb-quiz__detail-opts li.is-correct {
  color: var(--el-color-success);
}

.pb-quiz__detail-opts li.is-chosen-wrong {
  color: var(--el-color-danger);
}
</style>
