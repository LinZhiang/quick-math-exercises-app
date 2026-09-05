<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useFrontendHandoutQuiz } from '@/composables/frontend/useFrontendHandoutQuiz'
import { isAiChatConfigured, DEEPSEEK_NOT_CONFIGURED_HINT } from '@/services/deepseek'
import {
  aiProviderTick,
  getAiProvider,
  setAiProvider,
  type AiProvider,
} from '@/utils/app/aiProviderStore'
import {
  isFrontendQuizFavorite,
  toggleFrontendQuizFavorite,
} from '@/utils/frontend/frontendHandoutQuizStorage'
import { sanitizeFrontendQuizForDisplay, FRONTEND_QUIZ_KIND_MAX, FRONTEND_QUIZ_CHOICE_MAX, type FrontendQuizQuestion } from '@/utils/frontend/frontendHandoutQuiz'
import type { FrontendHandoutItem } from '@/utils/frontend/frontendLearning'
import { wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import RichTextView from '@/components/RichTextView.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FrontendAskPanel, { type FrontendAskQuestionContext } from './FrontendAskPanel.vue'
import FrontendBusyHint from './FrontendBusyHint.vue'

const props = defineProps<{
  item: FrontendHandoutItem
  scopeLabel?: string
  preparedQuestions?: FrontendQuizQuestion[]
  skipWrongBook?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const test = useFrontendHandoutQuiz()
const favorited = ref(false)
const bodyRef = ref<HTMLElement | null>(null)
const useVariant = ref(false)
const preparedMode = computed(() => (props.preparedQuestions?.length ?? 0) > 0)

const quizProvider = computed({
  get() {
    void aiProviderTick.value
    return getAiProvider()
  },
  set(v: AiProvider) {
    setAiProvider(v)
  },
})

const aiReady = computed(() => {
  void wenguAuthTick.value
  return isAiChatConfigured()
})

watch(
  () => test.currentQuestion?.fingerprint,
  (fp) => {
    favorited.value = fp ? isFrontendQuizFavorite(fp) : false
  },
)

watch(
  () => [test.phase, test.currentIndex] as const,
  () => {
    void nextTick(() => {
      bodyRef.value?.scrollTo({ top: 0 })
    })
  },
)

function onFavorite() {
  const q = test.currentQuestion
  if (!q) return
  const r = toggleFrontendQuizFavorite(q)
  favorited.value = r === 'added'
  ElMessage.success(r === 'added' ? '已加入收藏' : '已取消收藏')
}

function onStart() {
  if (preparedMode.value) {
    if (useVariant.value && !aiReady.value) {
      ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
      return
    }
    void test.startPrepared(props.item, props.preparedQuestions ?? [], {
      skipWrongBook: props.skipWrongBook !== false,
      recordAttempts: true,
      useVariants: useVariant.value,
      provider: quizProvider.value,
    })
    return
  }
  if (!aiReady.value) {
    ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
    return
  }
  void test.generateAndStart(props.item, quizProvider.value)
}

const lastResult = computed(() => {
  if (!test.submitted) return null
  return test.results.find((row) => row.unitIndex === test.currentIndex + 1) ?? null
})

const displayQ = computed(() => {
  const q = test.currentQuestion
  if (!q) return null
  return { ...q, ...sanitizeFrontendQuizForDisplay(q) }
})

const canMarkCareless = computed(() => {
  if (props.skipWrongBook || test.skipWrongBook) return false
  if (!test.submitted || test.carelessMarked || lastResult.value?.correct) return false
  if (test.currentQuestion?.kind === 'short' && !test.selfScore) return false
  return true
})

const quizAskQuestion = computed((): FrontendAskQuestionContext | null => {
  const q = displayQ.value
  if (!q) return null
  return {
    fingerprint: q.fingerprint,
    kindLabel: test.frontendQuizKindLabel(q.kind),
    stem: q.stem,
    options: q.options,
    chosen: lastResult.value?.chosen ?? '',
    correctText: q.correctText,
    explanation: q.explanation,
    correct: Boolean(lastResult.value?.correct),
  }
})
</script>

<template>
  <div class="cb-quiz-shell">
  <section class="cb-quiz" :class="{ 'is-running': test.phase === 'running' }">
    <header class="cb-quiz__head">
      <div class="cb-quiz__head-row">
        <h3>AI 测验</h3>
        <el-button size="small" @click="emit('close')">关闭</el-button>
      </div>
      <p v-if="scopeLabel" class="cb-quiz__scope" :title="scopeLabel">{{ scopeLabel }}</p>
      <p
        v-if="test.phase === 'running' || test.phase === 'summary'"
        class="cb-quiz__timer"
      >
        {{ test.elapsedClockText }}
      </p>
      <p v-if="test.quizTimerPaused" class="cb-quiz__pause">计时暂停</p>
    </header>

    <div v-if="test.phase === 'running' && displayQ" class="cb-quiz__meta-row">
      <p class="cb-quiz__meta">
        第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题 ·
        {{ test.frontendQuizKindLabel(displayQ.kind) }}
      </p>
      <el-button size="small" plain @click="onFavorite">{{ favorited ? '已收藏' : '收藏' }}</el-button>
    </div>

    <div ref="bodyRef" class="cb-quiz__body">
    <template v-if="test.phase === 'idle'">
      <p class="cb-quiz__hint">
        <template v-if="preparedMode">
          默认测原题。勾选「变式题测试」后，会按同一考点改写题干或选项。本题测验不进入错题集，但会记下测验次数。
        </template>
        <template v-else>
          {{
            scopeLabel
              ? `按「${scopeLabel}」范围内的讲义出重点题：专节里的核心概念要定义、易混点和应用都考到，不能只用一道编程题打发；有代码再适当出看代码题。`
              : '按当前讲义出重点题：专节里的核心概念（如闭包）要定义、易混点和应用都考到，不能只用一道编程题打发；讲义若有代码，再适当出看代码写结果、填空题。'
          }}
          计算题系统按结果判分（写出的内容包含标准答案即可）；简答题对照参考答案后自己打分。
        </template>
      </p>
      <label v-if="preparedMode" class="cb-quiz__variant">
        <input v-model="useVariant" type="checkbox">
        变式题测试
      </label>
      <div v-if="useVariant || !preparedMode" class="cb-quiz__switch">
        <span>模型</span>
        <el-radio-group v-model="quizProvider" size="small">
          <el-radio-button value="deepseek">DeepSeek</el-radio-button>
          <el-radio-button value="doubao">豆包</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="!preparedMode" class="cb-quiz__counts">
        <label>选择题 <el-input-number v-model="test.counts.choice" :min="0" :max="FRONTEND_QUIZ_CHOICE_MAX" size="small" /></label>
        <label>判断题 <el-input-number v-model="test.counts.judge" :min="0" :max="FRONTEND_QUIZ_KIND_MAX" size="small" /></label>
        <label>计算题 <el-input-number v-model="test.counts.calc" :min="0" :max="FRONTEND_QUIZ_KIND_MAX" size="small" /></label>
        <label>简答题 <el-input-number v-model="test.counts.short" :min="0" :max="FRONTEND_QUIZ_KIND_MAX" size="small" /></label>
      </div>
      <p v-if="(!preparedMode || useVariant) && !aiReady" class="cb-quiz__warn">{{ DEEPSEEK_NOT_CONFIGURED_HINT }}</p>
      <el-button type="primary" :disabled="(!preparedMode || useVariant) && !aiReady" @click="onStart">开始测验</el-button>
    </template>

    <template v-else-if="test.phase === 'loading'">
      <div class="cb-quiz__busy">
        <FrontendBusyHint :text="test.loadingMessage || '正在出题…'" />
      </div>
    </template>

    <template v-else-if="test.phase === 'running' && displayQ">
      <div class="cb-quiz__stem">
        <RichTextView :html="displayQ.stem" tone="docs" :math="false" :zoom-images="false" />
      </div>
      <div v-if="displayQ.kind === 'calc'" class="cb-quiz__calc">
        <el-input
          v-model="test.calcInput"
          :disabled="test.submitted"
          placeholder="写出计算结果，例如原码、数值；多写说明也可以"
          @keydown.enter.prevent="test.submitCurrent()"
        />
      </div>
      <div
        v-else-if="displayQ.kind === 'short'"
        class="cb-quiz__short"
        :class="{ 'is-locked': test.submitted }"
      >
        <RichTextEditor
          v-model="test.shortInput"
          placeholder="用自己的话作答，可排版、列要点…"
          min-height="120px"
        />
      </div>
      <div v-else class="cb-quiz__opts">
        <button
          v-for="(opt, i) in displayQ.options"
          :key="i"
          type="button"
          class="cb-quiz__opt"
          :class="{
            'is-picked': test.selectedIndex === i,
            'is-right': test.submitted && i === displayQ.correctIndex,
            'is-wrong': test.submitted && test.selectedIndex === i && i !== displayQ.correctIndex,
          }"
          :disabled="test.submitted"
          @click="test.selectOption(i)"
        >
          <RichTextView :html="opt" tone="docs" :math="false" :zoom-images="false" />
        </button>
      </div>
      <div v-if="test.submitted" class="cb-quiz__reveal">
        <template v-if="displayQ.kind === 'short'">
          <p class="cb-quiz__ref-label">参考答案</p>
          <div class="cb-quiz__ref">
            <RichTextView :html="displayQ.correctText" tone="docs" :math="false" :zoom-images="false" />
          </div>
          <RichTextView v-if="displayQ.explanation" :html="displayQ.explanation" tone="docs" :math="false" :zoom-images="false" />
          <div class="cb-quiz__self">
            <p class="cb-quiz__self-label">对照后给自己打分</p>
            <div class="cb-quiz__self-btns">
              <el-button
                :type="test.selfScore === 'full' ? 'success' : 'default'"
                @click="test.applySelfScore('full')"
              >
                全对
              </el-button>
              <el-button
                :type="test.selfScore === 'partial' ? 'warning' : 'default'"
                @click="test.applySelfScore('partial')"
              >
                半对
              </el-button>
              <el-button
                :type="test.selfScore === 'zero' ? 'danger' : 'default'"
                @click="test.applySelfScore('zero')"
              >
                全错
              </el-button>
            </div>
            <p v-if="test.selfScore === 'full'" class="cb-quiz__hint is-ok">已评：全对</p>
            <p v-else-if="test.selfScore === 'partial'" class="cb-quiz__hint">已评：半对</p>
            <p v-else-if="test.selfScore === 'zero'" class="cb-quiz__hint is-bad">已评：全错</p>
          </div>
        </template>
        <template v-else>
          <p v-if="lastResult?.correct" class="is-ok">回答正确</p>
          <div v-else class="cb-quiz__answer is-bad">
            <span>正确答案：</span>
            <RichTextView :html="displayQ.correctText" tone="docs" :math="false" :zoom-images="false" />
          </div>
          <RichTextView v-if="displayQ.explanation" :html="displayQ.explanation" tone="docs" :math="false" :zoom-images="false" />
        </template>
      </div>
      <div class="cb-quiz__actions">
        <el-button v-if="!test.submitted" type="primary" @click="test.submitCurrent()">
          {{ displayQ.kind === 'short' ? '查看参考答案' : '提交' }}
        </el-button>
        <template v-else>
          <el-button type="primary" @click="test.nextQuestion()">
            {{ test.currentIndex >= test.questionCount - 1 ? '查看结果' : '下一题' }}
          </el-button>
          <el-button v-if="canMarkCareless" type="warning" @click="test.markCarelessWrong()">
            粗心答错
          </el-button>
          <span v-else-if="test.carelessMarked" class="cb-quiz__hint">已标记粗心，不入错题本</span>
        </template>
      </div>
    </template>

    <template v-else-if="test.phase === 'summary'">
      <p class="cb-quiz__hint">
        正确 {{ test.correctCount }} / {{ test.results.length }} 题 · {{ test.elapsedText }}
      </p>
      <ul class="cb-quiz__log">
        <li
          v-for="row in test.results"
          :key="row.unitIndex"
          :class="row.correct ? 'is-ok' : row.selfScore === 'partial' ? 'is-mid' : 'is-bad'"
        >
          {{ row.unitIndex }}. {{ row.question.term }} ·
          {{
            row.correct
              ? '对'
              : row.selfScore === 'partial'
                ? '半对'
                : row.careless
                  ? '错（粗心）'
                  : '错'
          }}
        </li>
      </ul>
      <div class="cb-quiz__actions">
        <el-button type="primary" @click="onStart">再来一轮</el-button>
        <el-button @click="test.resetToIdle()">返回设置</el-button>
      </div>
    </template>
    </div>
  </section>
  <FrontendAskPanel
    v-if="test.phase === 'running' && quizAskQuestion"
    :item="item"
    :question="quizAskQuestion"
    :ask-enabled="
      test.currentQuestion?.kind === 'short' ? Boolean(test.selfScore) : test.submitted
    "
  />
  </div>
</template>

<style scoped>
.cb-quiz-shell {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.cb-quiz {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px 2px 8px;
  gap: 12px;
}

.cb-quiz.is-running {
  padding-bottom: 8px;
}

.cb-quiz.is-running .cb-quiz__body {
  padding-bottom: 72px;
}

.cb-quiz__head {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding-bottom: 4px;
}

.cb-quiz__body {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 2px;
}

.cb-quiz__busy {
  flex: 1 1 0;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb-quiz__variant {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
}

.cb-quiz__head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 32px;
}

.cb-quiz__head-row :deep(.el-button) {
  flex-shrink: 0;
}

.cb-quiz__head h3 {
  margin: 0;
  min-width: 0;
  flex: 1 1 auto;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cb-quiz__scope {
  margin: 0;
  min-width: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--app-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cb-quiz__timer {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--app-primary);
}

.cb-quiz__pause {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--el-color-warning);
}

.cb-quiz__hint,
.cb-quiz__meta,
.cb-quiz__warn {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-quiz__meta-row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 2px 8px;
  background: #fff;
  border-bottom: 1px solid var(--app-border-soft);
}

.cb-quiz__meta {
  min-width: 0;
  flex: 1 1 auto;
}

.cb-quiz__warn {
  color: var(--app-danger);
}

.cb-quiz__switch,
.cb-quiz__counts,
.cb-quiz__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.cb-quiz__counts label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.cb-quiz__stem {
  min-width: 0;
  max-width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: #d7e0ea;
  border: 1px solid #c5d0dc;
}

.cb-quiz__short.is-locked {
  pointer-events: none;
  opacity: 0.88;
}

.cb-quiz__ref-label,
.cb-quiz__self-label {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
}

.cb-quiz__ref {
  padding: 10px 12px;
  border-radius: 10px;
  background: #ecfdf5;
}

.cb-quiz__self {
  margin-top: 10px;
}

.cb-quiz__self-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cb-quiz__opts {
  display: grid;
  gap: 8px;
}

.cb-quiz__opt :deep(p) {
  margin: 0;
}

.cb-quiz__opt :deep(code:not(pre code)) {
  font: inherit;
  color: inherit;
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.cb-quiz__answer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 6px;
}

.cb-quiz__answer :deep(p) {
  margin: 0;
}

.cb-quiz__opt {
  appearance: none;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
}

.cb-quiz__opt :deep(.md-table-scroll) {
  margin: 0;
}

.cb-quiz__opt :deep(pre) {
  margin: 0;
}

.cb-quiz__opt.is-picked {
  border-color: var(--app-primary);
}

.cb-quiz__opt.is-right {
  border-color: #16a34a;
  background: #ecfdf5;
}

.cb-quiz__opt.is-wrong {
  border-color: var(--app-danger);
  background: #fef2f2;
}

.cb-quiz__reveal {
  min-width: 0;
  max-width: 100%;
}

.cb-quiz__reveal .is-ok,
.cb-quiz__hint.is-ok {
  color: #16a34a;
}

.cb-quiz__reveal .is-bad,
.cb-quiz__hint.is-bad,
.cb-quiz__log .is-bad {
  color: var(--app-danger);
}

.cb-quiz__log .is-mid {
  color: #d97706;
}

.cb-quiz__log {
  margin: 0;
  padding-left: 1.1em;
  font-size: 13px;
}

@media (min-width: 901px) {
  .cb-quiz {
    max-width: 52rem;
    width: 100%;
    margin: 0 auto;
    padding: 10px 12px 16px;
    gap: 14px;
  }

  .cb-quiz.is-running .cb-quiz__body {
    padding-bottom: 72px;
  }

  .cb-quiz__head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 12px;
  }

  .cb-quiz__head-row {
    grid-column: 1;
    grid-row: 1;
  }

  .cb-quiz__timer {
    grid-column: 2;
    grid-row: 1;
  }

  .cb-quiz__scope,
  .cb-quiz__pause {
    grid-column: 1 / -1;
  }

  .cb-quiz__counts {
    gap: 14px 22px;
  }

  .cb-quiz__stem,
  .cb-quiz__opt,
  .cb-quiz__ref {
    padding: 14px 16px;
  }
}
</style>
