<script setup lang="ts">
import { watch } from 'vue'
import { useVocabRelatedLearning } from '@/composables/useVocabRelatedLearning'

const emit = defineEmits<{ (e: 'active', v: boolean): void }>()

const {
  open,
  phase,
  loadingMessage,
  kindLabel,
  queue,
  queueIndex,
  pack,
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
  startQuiz,
  selectQuizOption,
  submitQuizAnswer,
  nextQuizOrResult,
  retryModule,
  advanceToNextModule,
} = useVocabRelatedLearning()

defineExpose({ start, close, open })

watch(open, (v) => emit('active', v), { immediate: true })

function optKey(i: number) {
  return String.fromCharCode(65 + i)
}
</script>

<template>
  <div v-if="open" class="vr-panel">
    <div class="vr-panel__top">
      <div>
        <p class="vr-panel__title">关联学习 · {{ kindLabel }}</p>
        <p v-if="progressText" class="vr-panel__sub">{{ progressText }}</p>
      </div>
      <el-button size="small" @click="close">退出</el-button>
    </div>

    <div v-if="phase === 'loading'" class="vr__loading">
      <p>{{ loadingMessage || '正在一次性生成本组关联学习内容…' }}</p>
      <p class="vr__muted">优先读缓存；缺失词整组一次生成</p>
    </div>

    <template v-else-if="phase === 'study' && pack">
      <div class="vr__term">{{ pack.term }}</div>

      <section class="vr__block">
        <h4 class="vr__h">一、当前词</h4>
        <p class="vr__line"><strong>释义：</strong>{{ pack.meaning }}</p>
        <p v-if="pack.phonologyNotes" class="vr__line">
          <strong>字音字形：</strong>{{ pack.phonologyNotes }}
        </p>
      </section>

      <section class="vr__block">
        <h4 class="vr__h">二、高频易混</h4>
        <ul class="vr__list">
          <li v-for="(c, i) in pack.confusables" :key="i" class="vr__list-item">
            <p class="vr__word">{{ c.word }}</p>
            <p class="vr__line"><strong>释义：</strong>{{ c.meaning }}</p>
            <p class="vr__line"><strong>区分：</strong>{{ c.howToDistinguish }}</p>
          </li>
        </ul>
      </section>

      <section class="vr__block">
        <h4 class="vr__h">三、近反义与其他选项</h4>
        <p class="vr__line">
          <strong>近义词：</strong>
          {{ pack.synonyms.length ? pack.synonyms.join('、') : '暂无' }}
        </p>
        <p class="vr__line">
          <strong>反义词：</strong>
          {{ pack.antonyms.length ? pack.antonyms.join('、') : '暂无' }}
        </p>
        <ul v-if="pack.otherOptions.length" class="vr__list">
          <li v-for="(o, i) in pack.otherOptions" :key="i" class="vr__list-item">
            <p class="vr__word">{{ o.text }}</p>
            <p class="vr__line">{{ o.meaning }}</p>
          </li>
        </ul>
      </section>

      <div class="vr__actions">
        <el-button type="primary" @click="startQuiz">看完了，开始小测</el-button>
      </div>
    </template>

    <template v-else-if="phase === 'quiz' && currentQuiz">
      <div class="vr__quiz-head">
        <span class="vr__badge">{{ vocabRelatedQuizTypeLabel(currentQuiz.questionType) }}</span>
        <span class="vr__muted">小测 {{ quizIndex + 1 }} / {{ quizCount }}</span>
      </div>
      <p class="vr__stem">{{ currentQuiz.stem }}</p>
      <ul class="vr__options">
        <li
          v-for="(opt, idx) in currentQuiz.options"
          :key="idx"
          class="vr__option"
          :class="{
            'is-selected': selectedOption === idx && !quizSubmitted,
            'is-correct': quizSubmitted && idx === currentQuiz.correctIndex,
            'is-wrong':
              quizSubmitted && selectedOption === idx && idx !== currentQuiz.correctIndex,
          }"
          @click="selectQuizOption(idx)"
        >
          <span class="vr__opt-key">{{ optKey(idx) }}</span>
          <span>{{ opt }}</span>
        </li>
      </ul>
      <p v-if="quizSubmitted && currentQuiz.explanation" class="vr__explain">
        {{ currentQuiz.explanation }}
      </p>
      <p class="vr__muted vr__hint">学后小测不计入错题本</p>
      <div class="vr__actions">
        <el-button v-if="!quizSubmitted" type="primary" @click="submitQuizAnswer">确认</el-button>
        <el-button v-else type="primary" @click="nextQuizOrResult">
          {{ quizIndex + 1 < quizCount ? '下一题' : '查看结果' }}
        </el-button>
      </div>
    </template>

    <template v-else-if="phase === 'quiz-result'">
      <div class="vr__result">
        <p class="vr__result-score">本词小测：{{ quizCorrectCount }} / {{ quizCount }}</p>
        <p v-if="quizAllCorrect" class="vr__ok">全部正确，可进入下一个词。</p>
        <p v-else class="vr__fail">未全部正确，请重新学习本词后再测（不计错题本）。</p>
      </div>
      <div class="vr__actions">
        <el-button v-if="quizAllCorrect" type="primary" @click="advanceToNextModule">
          {{ queueIndex + 1 >= queue.length ? '完成' : '下一个词' }}
        </el-button>
        <el-button v-else type="primary" @click="retryModule">重新学习</el-button>
      </div>
    </template>

    <template v-else-if="phase === 'session-done'">
      <div class="vr__result">
        <p class="vr__result-score">本组关联学习已完成</p>
        <p class="vr__ok">
          本组通过 {{ sessionPassedModules }} / {{ queue.length }} 个词；已写入导览日志。
        </p>
        <p v-if="sessionFailedAttempts" class="vr__muted">
          其间有 {{ sessionFailedAttempts }} 次小测未一次过关（已重学）。
        </p>
      </div>
      <div class="vr__actions">
        <el-button type="primary" @click="close">返回列表</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.vr-panel {
  margin-top: 8px;
  padding: 14px 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  background: var(--app-surface, #fff);
}

.vr-panel__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.vr-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.vr-panel__sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--app-text-muted, #666);
}

.vr__loading {
  padding: 36px 8px;
  text-align: center;
}

.vr__muted {
  color: var(--app-text-muted, #888);
  font-size: 13px;
}

.vr__hint {
  margin: 12px 0 0;
}

.vr__term {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0 0 14px;
}

.vr__block {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--app-surface-alt, #f7f7f8);
  border: 1px solid var(--app-border-soft, #e8e8ea);
}

.vr__h {
  margin: 0 0 10px;
  font-size: 15px;
}

.vr__line {
  margin: 0 0 8px;
  line-height: 1.55;
  font-size: 14px;
}

.vr__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vr__list-item {
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--app-surface, #fff);
  border: 1px solid var(--app-border-soft, #eee);
}

.vr__word {
  margin: 0 0 4px;
  font-weight: 700;
  font-size: 15px;
}

.vr__quiz-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.vr__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
  color: var(--el-color-primary);
}

.vr__stem {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.55;
  font-weight: 600;
}

.vr__options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vr__option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #ddd);
  cursor: pointer;
  font-size: 14px;
  line-height: 1.45;
}

.vr__option:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.vr__option.is-selected {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.vr__option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.vr__option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
}

.vr__opt-key {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--app-surface-alt, #f0f0f0);
}

.vr__explain {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--app-surface-alt, #f7f7f8);
  font-size: 13px;
  line-height: 1.5;
}

.vr__result {
  padding: 20px 8px;
  text-align: center;
}

.vr__result-score {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.vr__ok {
  color: var(--el-color-success);
  margin: 0;
}

.vr__fail {
  color: var(--el-color-danger);
  margin: 0;
}

.vr__actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
