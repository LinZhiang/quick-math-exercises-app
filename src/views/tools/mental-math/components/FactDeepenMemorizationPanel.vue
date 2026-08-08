<script setup lang="ts">
import { computed, watch } from 'vue'
import { useFactDeepenMemorization } from '@/composables/useFactDeepenMemorization'
import type { FactDeepenKind } from '@/utils/factDeepenMemorization'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'

const emit = defineEmits<{ (e: 'active', v: boolean): void }>()

const api = useFactDeepenMemorization()

const {
  open,
  kindLabel,
  phase,
  modes,
  modeConfig,
  catalogRows,
  activeGroup,
  cards,
  studyIndex,
  currentCard,
  studyProgress,
  allStudyVisited,
  draftExplanation,
  currentQuiz,
  quizProgress,
  selectedOption,
  quizLocked,
  feedback,
  records,
  correctCount,
  countdownValue,
  remainingSec,
  quizDurationSec,
  start,
  close,
  openCatalog,
  backToCatalog,
  backToPick,
  beginStudyGroup,
  beginQuizGroup,
  saveCurrentExplanation,
  resetExplanationToBase,
  nextStudy,
  prevStudy,
  startQuizFromStudy,
  answerQuizOption,
  restartPick,
} = api

const cardsRemain = computed(
  () => !!modeConfig.value && studyIndex.value + 1 < cards.value.length,
)

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
        <p v-if="modeConfig && phase === 'catalog'" class="fd-panel__sub">
          {{ modeConfig.label }} · 共 {{ catalogRows.length }} 组（每组最多
          {{ modeConfig.batchSize }} 题）
        </p>
        <p v-else-if="modeConfig && activeGroup && phase !== 'pick'" class="fd-panel__sub">
          {{ modeConfig.label }} · {{ activeGroup.title }}
          <template v-if="phase === 'study'"> · 识记 {{ studyProgress }}</template>
          <template v-else-if="phase === 'quiz'"> · 测验 {{ quizProgress }}</template>
        </p>
      </div>
      <div class="fd-panel__top-actions">
        <el-button v-if="phase === 'catalog'" size="small" plain @click="backToPick">
          返回难度
        </el-button>
        <el-button
          v-else-if="phase === 'study' || phase === 'result'"
          size="small"
          plain
          @click="backToCatalog"
        >
          返回目录
        </el-button>
        <el-button size="small" @click="close">退出</el-button>
      </div>
    </div>

    <template v-if="phase === 'pick'">
      <p class="fd-hint">
        先选难度，再进固定分组目录（像书目一样一组一组点开）。每组先识记再限时测；解析可编辑；答错进错题本。
      </p>
      <div class="fd-mode-grid">
        <button
          v-for="m in modes"
          :key="m.modeId"
          type="button"
          class="fd-mode-card"
          @click="openCatalog(m.modeId)"
        >
          <h3 class="fd-mode-card__title">
            {{ m.label }}
            <PracticeCompletionStat :mode-id="m.modeId" perfect-label="全对" />
          </h3>
          <p class="fd-mode-card__desc">{{ m.desc }}</p>
          <span class="fd-mode-card__cta">打开目录</span>
        </button>
      </div>
    </template>

    <template v-else-if="phase === 'catalog'">
      <p class="fd-hint">
        以下分组按题库固定切分，组号不变。可点「识记」先看解析，或点「直接测验」跳过识记（测验题序乱序）。
      </p>
      <ol class="fd-toc">
        <li v-for="g in catalogRows" :key="g.groupIndex" class="fd-toc__row">
          <div class="fd-toc__main">
            <span class="fd-toc__title">{{ g.title }}</span>
            <span class="fd-toc__preview">{{ g.previewStem }}</span>
            <span v-if="g.stat" class="fd-toc__stat">
              上次 {{ g.stat.correct }}/{{ g.stat.total }}
            </span>
            <span v-else class="fd-toc__stat fd-toc__stat--muted">未测</span>
          </div>
          <div class="fd-toc__actions">
            <el-button size="small" plain @click="beginStudyGroup(g.groupIndex)">识记</el-button>
            <el-button size="small" type="primary" @click="beginQuizGroup(g.groupIndex)">
              直接测验
            </el-button>
          </div>
        </li>
      </ol>
    </template>

    <template v-else-if="phase === 'study' && currentCard">
      <div class="fd-actions fd-actions--top">
        <el-button plain :disabled="studyIndex <= 0" @click="prevStudy">上一题</el-button>
        <el-button v-if="cardsRemain" type="primary" @click="nextStudy">下一题</el-button>
        <el-button
          v-else
          type="primary"
          :disabled="!allStudyVisited"
          @click="startQuizFromStudy"
        >
          开始测验（{{ quizDurationSec || modeConfig?.durationSec || 40 }} 秒）
        </el-button>
        <el-button
          v-if="allStudyVisited && cardsRemain"
          type="success"
          plain
          @click="startQuizFromStudy"
        >
          已看完，直接测验
        </el-button>
      </div>
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
    </template>

    <div v-else-if="phase === 'countdown'" class="fd-countdown">
      <p class="fd-countdown__val">{{ countdownValue }}</p>
      <p class="fd-muted">
        测验即将开始 · {{ quizDurationSec }} 秒内完成
        {{ activeGroup?.count ?? modeConfig?.batchSize }} 题 · 点选项即判定
      </p>
    </div>

    <template v-else-if="phase === 'quiz' && currentQuiz">
      <div class="fd-quiz-head">
        <span class="fd-timer" :class="{ 'is-low': remainingSec <= 8 }">{{ remainingSec }}s</span>
        <span class="fd-muted">{{ quizProgress }} · 点选项即判</span>
      </div>
      <p class="fd-stem">{{ currentQuiz.expression }}</p>
      <ul class="fd-options">
        <li
          v-for="(opt, idx) in currentQuiz.options"
          :key="idx"
          class="fd-option"
          :class="{
            'is-disabled': quizLocked,
            'is-correct': feedback === 'correct' && idx === currentQuiz.correctIndex,
            'is-wrong':
              feedback === 'wrong' && selectedOption === idx && idx !== currentQuiz.correctIndex,
            'is-reveal': feedback === 'wrong' && idx === currentQuiz.correctIndex,
          }"
          @click="answerQuizOption(idx)"
        >
          <span class="fd-opt-key">{{ optKey(idx) }}</span>
          <span>{{ opt }}</span>
        </li>
      </ul>
    </template>

    <template v-else-if="phase === 'result'">
      <div class="fd-result">
        <p class="fd-result__score">
          {{ activeGroup?.title || '本组' }}测验：{{ correctCount }} / {{ records.length }}
          <span
            v-if="records.length < (activeGroup?.count ?? modeConfig?.batchSize ?? 20)"
            class="fd-muted"
          >
            （限时未完成全部）
          </span>
        </p>
        <p
          v-if="correctCount === records.length && records.length === (activeGroup?.count ?? 0)"
          class="fd-ok"
        >
          全对！
        </p>
        <h4 class="fd-result__h">答题结果</h4>
        <ol class="fd-result-list">
          <li
            v-for="(r, i) in records"
            :key="i"
            class="fd-result-item"
            :class="{ 'is-ok': r.correct, 'is-bad': !r.correct }"
          >
            <p class="fd-wrong-stem">
              <span class="fd-result-badge">{{ r.correct ? '对' : '错' }}</span>
              {{ i + 1 }}. {{ r.expression }}
            </p>
            <p class="fd-muted">
              你的答案：{{ r.chosenAnswer }}
              <template v-if="!r.correct"> · 正确：{{ r.correctAnswer }}</template>
            </p>
            <p v-if="!r.correct && r.explanation" class="fd-wrong-expl">{{ r.explanation }}</p>
          </li>
        </ol>
      </div>
      <div class="fd-actions">
        <el-button type="primary" @click="backToCatalog">返回目录</el-button>
        <el-button plain @click="restartPick">换难度</el-button>
        <el-button text @click="close">退出</el-button>
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

.fd-panel__top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
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

.fd-toc {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(62vh, 560px);
  overflow: auto;
}

.fd-toc__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #e4e4e8);
  background: var(--app-surface-alt, #f7f7f8);
}

.fd-toc__main {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 2px 12px;
}

.fd-toc__actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.fd-toc__title {
  grid-column: 1;
  font-size: 14px;
  font-weight: 700;
}

.fd-toc__preview {
  grid-column: 1;
  font-size: 12px;
  color: var(--app-text-muted, #777);
  line-height: 1.4;
}

.fd-toc__stat {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  white-space: nowrap;
}

.fd-toc__stat--muted {
  color: var(--app-text-muted, #999);
  font-weight: 500;
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

.fd-actions--top {
  margin-top: 0;
  margin-bottom: 12px;
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

.fd-option:hover:not(.is-disabled) {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.fd-option.is-disabled {
  pointer-events: none;
}

.fd-option.is-correct,
.fd-option.is-reveal {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.fd-option.is-wrong {
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
  padding: 4px 0 8px;
}

.fd-result__score {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.fd-result__h {
  margin: 12px 0 8px;
  font-size: 14px;
}

.fd-ok {
  text-align: center;
  color: var(--el-color-success);
  margin: 0 0 12px;
}

.fd-result-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(50vh, 420px);
  overflow: auto;
}

.fd-result-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--app-surface-alt, #f7f7f8);
  border: 1px solid var(--app-border-soft, #eee);
}

.fd-result-item.is-ok {
  border-color: color-mix(in srgb, var(--el-color-success) 35%, transparent);
}

.fd-result-item.is-bad {
  border-color: color-mix(in srgb, var(--el-color-danger) 35%, transparent);
}

.fd-result-badge {
  display: inline-block;
  min-width: 1.5em;
  margin-right: 6px;
  padding: 0 5px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.fd-result-item.is-ok .fd-result-badge {
  color: #1a7f4b;
  background: color-mix(in srgb, #1a7f4b 12%, transparent);
}

.fd-result-item.is-bad .fd-result-badge {
  color: #b42318;
  background: color-mix(in srgb, #b42318 12%, transparent);
}

.fd-wrong-stem {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 14px;
}

.fd-wrong-expl {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
