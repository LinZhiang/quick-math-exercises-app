<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useComputerHandoutQuiz } from '@/composables/computer/useComputerHandoutQuiz'
import { isAiChatConfigured, DEEPSEEK_NOT_CONFIGURED_HINT } from '@/services/deepseek'
import {
  aiProviderTick,
  getAiProvider,
  setAiProvider,
  type AiProvider,
} from '@/utils/app/aiProviderStore'
import {
  isComputerQuizFavorite,
  toggleComputerQuizFavorite,
} from '@/utils/computer/computerHandoutQuizStorage'
import type { ComputerHandoutItem } from '@/utils/computer/computerBasics'
import { wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import RichTextView from '@/components/RichTextView.vue'

const props = defineProps<{
  item: ComputerHandoutItem
  scopeLabel?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const test = useComputerHandoutQuiz()
const favorited = ref(false)

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
    favorited.value = fp ? isComputerQuizFavorite(fp) : false
  },
)

function onFavorite() {
  const q = test.currentQuestion
  if (!q) return
  const r = toggleComputerQuizFavorite(q)
  favorited.value = r === 'added'
  ElMessage.success(r === 'added' ? '已加入收藏' : '已取消收藏')
}

function onStart() {
  if (!aiReady.value) {
    ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
    return
  }
  void test.generateAndStart(props.item, quizProvider.value)
}
</script>

<template>
  <section class="cb-quiz">
    <header class="cb-quiz__head">
      <h3>{{ scopeLabel ? `AI 测验 · ${scopeLabel}` : 'AI 测验' }}</h3>
      <el-button size="small" @click="emit('close')">关闭</el-button>
    </header>

    <template v-if="test.phase === 'idle'">
      <p class="cb-quiz__hint">
        {{
          scopeLabel
            ? `按「${scopeLabel}」范围内的讲义出少量重点题：优先考定义、划分标准、最主要特点等，干扰项用讲义里的易混点。`
            : '按当前讲义出少量重点题：优先考定义、划分标准、最主要特点等，干扰项用讲义里的易混点。'
        }}
      </p>
      <div class="cb-quiz__switch">
        <span>模型</span>
        <el-radio-group v-model="quizProvider" size="small">
          <el-radio-button value="deepseek">DeepSeek</el-radio-button>
          <el-radio-button value="doubao">豆包</el-radio-button>
        </el-radio-group>
      </div>
      <div class="cb-quiz__counts">
        <label>选择题 <el-input-number v-model="test.counts.choice" :min="0" :max="8" size="small" /></label>
        <label>判断题 <el-input-number v-model="test.counts.judge" :min="0" :max="6" size="small" /></label>
        <label>简答题 <el-input-number v-model="test.counts.calc" :min="0" :max="4" size="small" /></label>
      </div>
      <p v-if="!aiReady" class="cb-quiz__warn">{{ DEEPSEEK_NOT_CONFIGURED_HINT }}</p>
      <el-button type="primary" :disabled="!aiReady" @click="onStart">开始测验</el-button>
    </template>

    <template v-else-if="test.phase === 'loading'">
      <p class="cb-quiz__hint">{{ test.loadingMessage || '正在出题…' }}</p>
    </template>

    <template v-else-if="test.phase === 'running' && test.currentQuestion">
      <p class="cb-quiz__meta">
        第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题 ·
        {{ test.computerQuizKindLabel(test.currentQuestion.kind) }}
      </p>
      <div class="cb-quiz__stem">
        <RichTextView :html="test.currentQuestion.stem" />
      </div>
      <div v-if="test.currentQuestion.kind === 'calc'" class="cb-quiz__calc">
        <el-input
          v-model="test.calcInput"
          :disabled="test.submitted"
          placeholder="填写简要答案"
          @keydown.enter.prevent="test.submitCurrent()"
        />
      </div>
      <div v-else class="cb-quiz__opts">
        <button
          v-for="(opt, i) in test.currentQuestion.options"
          :key="i"
          type="button"
          class="cb-quiz__opt"
          :class="{
            'is-picked': test.selectedIndex === i,
            'is-right': test.submitted && i === test.currentQuestion.correctIndex,
            'is-wrong': test.submitted && test.selectedIndex === i && i !== test.currentQuestion.correctIndex,
          }"
          :disabled="test.submitted"
          @click="test.selectOption(i)"
        >
          {{ opt }}
        </button>
      </div>
      <div v-if="test.submitted" class="cb-quiz__reveal">
        <p :class="test.results.at(-1)?.correct ? 'is-ok' : 'is-bad'">
          {{ test.results.at(-1)?.correct ? '回答正确' : `正确答案：${test.currentQuestion.correctText}` }}
        </p>
        <RichTextView v-if="test.currentQuestion.explanation" :html="test.currentQuestion.explanation" />
        <div class="cb-quiz__tools">
          <el-button size="small" plain @click="onFavorite">{{ favorited ? '已收藏' : '收藏' }}</el-button>
          <el-button
            v-if="!test.results.at(-1)?.correct && !test.carelessMarked"
            size="small"
            plain
            @click="test.markCarelessWrong()"
          >
            粗心答错
          </el-button>
          <span v-else-if="test.carelessMarked" class="cb-quiz__hint">已标记粗心，不入错题本</span>
        </div>
      </div>
      <div class="cb-quiz__actions">
        <el-button v-if="!test.submitted" type="primary" @click="test.submitCurrent()">提交</el-button>
        <el-button v-else type="primary" @click="test.nextQuestion()">
          {{ test.currentIndex >= test.questionCount - 1 ? '查看结果' : '下一题' }}
        </el-button>
      </div>
    </template>

    <template v-else-if="test.phase === 'summary'">
      <p class="cb-quiz__hint">正确 {{ test.correctCount }} / {{ test.results.length }} 题</p>
      <ul class="cb-quiz__log">
        <li v-for="row in test.results" :key="row.unitIndex" :class="row.correct ? 'is-ok' : 'is-bad'">
          {{ row.unitIndex }}. {{ row.question.term }} · {{ row.correct ? '对' : '错' }}
        </li>
      </ul>
      <div class="cb-quiz__actions">
        <el-button type="primary" @click="onStart">再来一轮</el-button>
        <el-button @click="test.resetToIdle()">返回设置</el-button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.cb-quiz {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 4px 2px 16px;
  gap: 12px;
}

.cb-quiz__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cb-quiz__head h3 {
  margin: 0;
  font-size: 1.05rem;
}

.cb-quiz__hint,
.cb-quiz__meta,
.cb-quiz__warn {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-quiz__warn {
  color: var(--app-danger);
}

.cb-quiz__switch,
.cb-quiz__counts,
.cb-quiz__tools,
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
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--app-surface-alt);
}

.cb-quiz__opts {
  display: grid;
  gap: 8px;
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

.cb-quiz__reveal .is-ok {
  color: #16a34a;
}

.cb-quiz__reveal .is-bad,
.cb-quiz__log .is-bad {
  color: var(--app-danger);
}

.cb-quiz__log {
  margin: 0;
  padding-left: 1.1em;
  font-size: 13px;
}
</style>
