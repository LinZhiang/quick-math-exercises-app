<script setup lang="ts">
import { watch } from 'vue'
import { useFactDeepenMemorization } from '@/composables/useFactDeepenMemorization'
import type { FactDeepenKind } from '@/utils/factDeepenMemorization'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'

const emit = defineEmits<{ (e: 'active', v: boolean): void }>()

const {
  open,
  kindLabel,
  phase,
  modes,
  modeConfig,
  studyIndex,
  currentCard,
  studyProgress,
  allStudyVisited,
  draftExplanation,
  currentQuiz,
  quizProgress,
  selectedOption,
  quizSubmitted,
  feedback,
  records,
  correctCount,
  countdownValue,
  remainingSec,
  start,
  close,
  beginStudy,
  saveCurrentExplanation,
  resetExplanationToBase,
  nextStudy,
  prevStudy,
  startQuizFromStudy,
  selectQuizOption,
  submitQuizAnswer,
  restartPick,
} = useFactDeepenMemorization()

defineExpose({
  start: (kind: FactDeepenKind) => start(kind),
  close,
  open,
})

watch(open, (v) => emit('active', v), { immediate: true })

function optKey(i: number) {
  return String.fromCharCode(65 + i)
}
</script>

<template>
  <div v-if="open" class="fd-panel">
    <div class="fd-panel__top">
      <div>
        <p class="fd-panel__title">加深识记 · {{ kindLabel }}</p>
        <p v-if="modeConfig && phase !== 'pick'" class="fd-panel__sub">
          {{ modeConfig.label }} · 一组 {{ modeConfig.batchSize }} 题
          <template v-if="phase === 'study'"> · 识记 {{ studyProgress }}</template>
          <template v-else-if="phase === 'quiz'"> · 测验 {{ quizProgress }}</template>
        </p>
      </div>
      <el-button size="small" @click="close">退出</el-button>
    </div>

    <template v-if="phase === 'pick'">
      <p class="fd-hint">
        按难度抽取 {{ modes[0]?.batchSize ?? 20 }} 题先看解析（可编辑），看完后限时测同批题目。答错记入错题本，完成后写入导览日志。
      </p>
      <div class="fd-mode-grid">
        <button
          v-for="m in modes"
          :key="m.modeId"
          type="button"
          class="fd-mode-card"
          @click="beginStudy(m.modeId)"
        >
          <h3 class="fd-mode-card__title">
            {{ m.label }}
            <PracticeCompletionStat :mode-id="m.modeId" perfect-label="全对" />
          </h3>
          <p class="fd-mode-card__desc">{{ m.desc }}</p>
          <span class="fd-mode-card__cta">开始识记</span>
        </button>
      </div>
    </template>

    <template v-else-if="phase === 'study' && currentCard">
      <div class="fd-card">
        <p class="fd-stem">{{ currentCard.stem }}</p>
        <p class="fd-answer"><strong>答案：</strong>{{ currentCard.correct }}</p>
        <label class="fd-expl-label" for="fd-expl">解析（可编辑）</label>
        <el-input
          id="fd-expl"
          v-model="draftExplanation"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="写下便于记忆的解析…"
          @blur="saveCurrentExplanation"
        />
        <div class="fd-expl-actions">
          <el-button size="small" plain @click="saveCurrentExplanation">保存解析</el-button>
          <el-button size="small" text @click="resetExplanationToBase">恢复题库原文</el-button>
        </div>
      </div>
      <div class="fd-actions">
        <el-button plain :disabled="studyIndex <= 0" @click="prevStudy">上一题</el-button>
        <el-button
          v-if="modeConfig && studyIndex + 1 < modeConfig.batchSize"
          type="primary"
          @click="nextStudy"
        >
          下一题
        </el-button>
        <el-button
          v-else
          type="primary"
          :disabled="!allStudyVisited"
          @click="startQuizFromStudy"
        >
          开始测验（{{ modeConfig?.durationSec }} 秒）
        </el-button>
        <el-button
          v-if="allStudyVisited && modeConfig && studyIndex + 1 < modeConfig.batchSize"
          type="success"
          plain
          @click="startQuizFromStudy"
        >
          已看完，直接测验
        </el-button>
      </div>
    </template>

    <div v-else-if="phase === 'countdown'" class="fd-countdown">
      <p class="fd-countdown__val">{{ countdownValue }}</p>
      <p class="fd-muted">测验即将开始 · {{ modeConfig?.durationSec }} 秒内完成 {{ modeConfig?.batchSize }} 题</p>
    </div>

    <template v-else-if="phase === 'quiz' && currentQuiz">
      <div class="fd-quiz-head">
        <span class="fd-timer" :class="{ 'is-low': remainingSec <= 8 }">{{ remainingSec }}s</span>
        <span class="fd-muted">{{ quizProgress }}</span>
      </div>
      <p class="fd-stem">{{ currentQuiz.expression }}</p>
      <ul class="fd-options">
        <li
          v-for="(opt, idx) in currentQuiz.options"
          :key="idx"
          class="fd-option"
          :class="{
            'is-selected': selectedOption === idx && !quizSubmitted,
            'is-correct': quizSubmitted && idx === currentQuiz.correctIndex,
            'is-wrong':
              quizSubmitted && selectedOption === idx && idx !== currentQuiz.correctIndex,
            'is-feedback-correct': feedback === 'correct' && idx === currentQuiz.correctIndex,
            'is-feedback-wrong':
              feedback === 'wrong' && selectedOption === idx && idx !== currentQuiz.correctIndex,
          }"
          @click="selectQuizOption(idx)"
        >
          <span class="fd-opt-key">{{ optKey(idx) }}</span>
          <span>{{ opt }}</span>
        </li>
      </ul>
      <div class="fd-actions">
        <el-button
          type="primary"
          :disabled="quizSubmitted || feedback != null"
          @click="submitQuizAnswer"
        >
          确认
        </el-button>
      </div>
    </template>

    <template v-else-if="phase === 'result'">
      <div class="fd-result">
        <p class="fd-result__score">
          本组测验：{{ correctCount }} / {{ records.length }}
          <span v-if="records.length < (modeConfig?.batchSize ?? 20)" class="fd-muted">
            （限时未完成全部）
          </span>
        </p>
        <p v-if="correctCount === records.length && records.length === modeConfig?.batchSize" class="fd-ok">
          全对！
        </p>
        <ul v-if="records.some((r) => !r.correct)" class="fd-wrong-list">
          <li v-for="(r, i) in records.filter((x) => !x.correct)" :key="i">
            <p class="fd-wrong-stem">{{ r.expression }}</p>
            <p class="fd-muted">你的答案：{{ r.chosenAnswer }} · 正确：{{ r.correctAnswer }}</p>
            <p v-if="r.explanation" class="fd-wrong-expl">{{ r.explanation }}</p>
          </li>
        </ul>
      </div>
      <div class="fd-actions">
        <el-button type="primary" @click="close">返回</el-button>
        <el-button plain @click="restartPick">再来一组</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fd-panel {
  margin-top: 12px;
  padding: 14px 16px 20px;
  border-radius: 12px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  background: var(--app-surface, #fff);
}

.fd-panel__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.fd-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.fd-panel__sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--app-text-muted, #666);
}

.fd-hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted, #666);
}

.fd-mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.fd-mode-card {
  text-align: left;
  padding: 14px 14px 12px;
  border-radius: 10px;
  border: 1px solid var(--app-border-soft, #e0e0e4);
  background: var(--app-surface-alt, #f7f7f8);
  cursor: pointer;
}

.fd-mode-card:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.fd-mode-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
}

.fd-mode-card__desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--app-text-muted, #666);
  line-height: 1.45;
}

.fd-mode-card__cta {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.fd-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--app-surface-alt, #f7f7f8);
  border: 1px solid var(--app-border-soft, #e8e8ea);
}

.fd-stem {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.55;
}

.fd-answer {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
}

.fd-expl-label {
  display: block;
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
}

.fd-expl-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fd-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fd-countdown {
  padding: 48px 8px;
  text-align: center;
}

.fd-countdown__val {
  margin: 0;
  font-size: 56px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--el-color-primary);
}

.fd-muted {
  color: var(--app-text-muted, #888);
  font-size: 13px;
}

.fd-quiz-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.fd-timer {
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
}

.fd-timer.is-low {
  color: var(--el-color-danger);
}

.fd-options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fd-option {
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

.fd-option:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.fd-option.is-selected {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.fd-option.is-correct,
.fd-option.is-feedback-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.fd-option.is-wrong,
.fd-option.is-feedback-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
}

.fd-opt-key {
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

.fd-result {
  padding: 12px 4px;
}

.fd-result__score {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.fd-ok {
  text-align: center;
  color: var(--el-color-success);
  margin: 0 0 12px;
}

.fd-wrong-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fd-wrong-list li {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--app-surface-alt, #f7f7f8);
  border: 1px solid var(--app-border-soft, #eee);
}

.fd-wrong-stem {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 14px;
}

.fd-wrong-expl {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.45;
}
</style>
