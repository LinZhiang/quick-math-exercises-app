<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, computed, ref, watch } from 'vue'
import {
  buildMemorizationWrongQuizItems,
  bumpMemorizationWrongCount,
  chunkMemorizationWrongQuizItems,
  filterMemorizationWrongRecords,
  listMemorizationWrongRecords,
  memorizationWrongBookTick,
  memorizationWrongRecordDateKey,
  removeMemorizationWrong,
  WRONG_BOOK_BATCH_SIZE,
  type MemorizationWrongModule,
  type MemorizationWrongQuizItem,
  type MemorizationWrongRecord,
} from '@/utils/memorizationWrongBook'
import { currentAffairsDrillQuestionTypeLabel } from '@/utils/currentAffairsDrillPractice'
import { poetDrillQuestionTypeLabel } from '@/utils/poetDrillPractice'
import { shouldShowPoetDrillTermBeforeSubmit } from '@/utils/poetDrillPractice'
import type { PoetDrillQuestion } from '@/utils/poetDrillPractice'
import {
  recordWrongBookReviewAttempt,
  recordWrongBookReviewComplete,
  type WrongBookReviewScope,
} from '@/utils/wrongBookReviewStats'
import WrongBookReviewStat from '@/views/tools/mental-math/components/WrongBookReviewStat.vue'
import {
  enterWrongBookWorkspace,
  leaveWrongBookWorkspace,
} from '@/utils/wrongBookWorkspaceGate'

const props = defineProps<{
  module: MemorizationWrongModule
}>()

const open = ref(false)
const filterWrongCount = ref<number | undefined>()
const filterDate = ref<string | undefined>()
const selected = ref<Set<string>>(new Set())

type QuizPhase = 'idle' | 'playing' | 'result'
const quizPhase = ref<QuizPhase>('idle')
const quizItems = ref<MemorizationWrongQuizItem[]>([])
const quizCursor = ref(0)
const quizChoice = ref<number | null>(null)
const quizRevealed = ref(false)
const quizCorrectCount = ref(0)
const quizAnswered = ref(0)
const quizCompleteRecorded = ref(false)
const contextVisible = ref(false)

const reviewScope = computed<WrongBookReviewScope>(() =>
  props.module === 'poet-drill' ? 'mem:poet-drill' : 'mem:current-affairs',
)

const allRows = computed(() => {
  void memorizationWrongBookTick.value
  return listMemorizationWrongRecords(props.module)
})

const wrongCount = computed(() => allRows.value.length)

const dateOptions = computed(() => {
  const set = new Set<string>()
  for (const r of allRows.value) {
    const d = memorizationWrongRecordDateKey(r.updatedAt)
    if (d) set.add(d)
  }
  return [...set].sort().reverse()
})

const wrongCountOptions = computed(() => {
  const set = new Set<number>()
  for (const r of allRows.value) set.add(r.wrongCount || 1)
  return [...set].sort((a, b) => a - b)
})

const filteredRows = computed(() =>
  filterMemorizationWrongRecords(allRows.value, {
    wrongCount: filterWrongCount.value,
    dateKey: filterDate.value,
  }),
)

const poolRows = computed(() => {
  if (selected.value.size === 0) return filteredRows.value
  return filteredRows.value.filter((r) => selected.value.has(r.fingerprint))
})

const batches = computed(() => {
  const n = poolRows.value.length
  const out: { index: number; from: number; to: number; count: number }[] = []
  for (let i = 0; i < n; i += WRONG_BOOK_BATCH_SIZE) {
    const to = Math.min(i + WRONG_BOOK_BATCH_SIZE, n)
    out.push({
      index: out.length,
      from: i + 1,
      to,
      count: to - i,
    })
  }
  return out
})

const currentQuiz = computed(() => quizItems.value[quizCursor.value] ?? null)
const quizTotal = computed(() => quizItems.value.length)

const moduleTitle = computed(() =>
  props.module === 'poet-drill' ? '诗词识记' : '时政识记',
)

watch(open, (v) => {
  if (!v) exitQuiz()
})

watch(
  () => quizPhase.value,
  (p, prev) => {
    const nowBusy = p === 'playing' || p === 'result'
    const wasBusy = prev === 'playing' || prev === 'result'
    if (nowBusy && !wasBusy) enterWrongBookWorkspace()
    if (!nowBusy && wasBusy) leaveWrongBookWorkspace()
  },
)

onBeforeUnmount(() => {
  if (quizPhase.value === 'playing' || quizPhase.value === 'result') {
    leaveWrongBookWorkspace()
  }
})

function toggleOpen() {
  open.value = !open.value
}

function toggleSelect(fp: string) {
  const next = new Set(selected.value)
  if (next.has(fp)) next.delete(fp)
  else next.add(fp)
  selected.value = next
}

function selectAllFiltered() {
  selected.value = new Set(filteredRows.value.map((r) => r.fingerprint))
}

function clearSelected() {
  selected.value = new Set()
}

function typeLabel(row: MemorizationWrongRecord | MemorizationWrongQuizItem) {
  if (props.module === 'poet-drill') {
    return poetDrillQuestionTypeLabel(row.questionType as never)
  }
  return currentAffairsDrillQuestionTypeLabel(row.questionType as never)
}

function showTerm(q: MemorizationWrongQuizItem, revealed: boolean) {
  if (props.module !== 'poet-drill') return false
  if (revealed) return true
  return shouldShowPoetDrillTermBeforeSubmit({
    questionType: q.questionType,
  } as PoetDrillQuestion)
}

function removeRow(fp: string) {
  removeMemorizationWrong(fp)
  const next = new Set(selected.value)
  next.delete(fp)
  selected.value = next
  ElMessage.success('已移出错题本')
}

function startBatchQuiz(batchIndex: number) {
  const slice = poolRows.value.slice(
    batchIndex * WRONG_BOOK_BATCH_SIZE,
    batchIndex * WRONG_BOOK_BATCH_SIZE + WRONG_BOOK_BATCH_SIZE,
  )
  if (!slice.length) {
    ElMessage.warning('没有可测验的错题')
    return
  }
  const items = buildMemorizationWrongQuizItems(slice)
  if (!items.length) {
    ElMessage.warning('错题数据不完整，无法组卷')
    return
  }
  quizItems.value = chunkMemorizationWrongQuizItems(items)[0] ?? items
  quizCursor.value = 0
  quizChoice.value = null
  quizRevealed.value = false
  quizCorrectCount.value = 0
  quizAnswered.value = 0
  quizCompleteRecorded.value = false
  quizPhase.value = 'playing'
  open.value = true
}

function selectQuizOption(idx: number) {
  if (quizRevealed.value) return
  quizChoice.value = idx
}

function submitQuizAnswer() {
  const q = currentQuiz.value
  if (!q || quizRevealed.value) return
  if (quizChoice.value == null) {
    ElMessage.warning('请先选择选项')
    return
  }
  const ok = quizChoice.value === q.correctIndex
  quizRevealed.value = true
  if (ok) quizCorrectCount.value += 1
  quizAnswered.value += 1
  recordWrongBookReviewAttempt(reviewScope.value, ok)
  if (!ok) {
    bumpMemorizationWrongCount(q.originFingerprint)
    ElMessage.info('答错，已累计错题次数（原题复测，未出变式）')
  }
}

function nextQuizQuestion() {
  if (!quizRevealed.value) return
  if (quizCursor.value + 1 >= quizTotal.value) {
    finishBatchQuiz()
    return
  }
  quizCursor.value += 1
  quizChoice.value = null
  quizRevealed.value = false
}

function finishBatchQuiz() {
  quizPhase.value = 'result'
  if (!quizCompleteRecorded.value) {
    quizCompleteRecorded.value = true
    recordWrongBookReviewComplete(reviewScope.value, {
      correctCount: quizCorrectCount.value,
      totalCount: quizTotal.value,
    })
  }
}

function resetQuiz() {
  quizPhase.value = 'idle'
  quizItems.value = []
  quizCursor.value = 0
  quizChoice.value = null
  quizRevealed.value = false
}

function exitQuiz() {
  if (
    quizPhase.value === 'playing' &&
    quizAnswered.value > 0 &&
    !quizCompleteRecorded.value
  ) {
    recordWrongBookReviewComplete(reviewScope.value, {
      correctCount: quizCorrectCount.value,
      totalCount: quizAnswered.value,
      abandoned: true,
    })
  }
  resetQuiz()
}
</script>

<template>
  <div class="mem-wrong">
    <div class="mem-wrong__bar">
      <button type="button" class="mem-wrong__toggle" @click="toggleOpen">
        <span>{{ moduleTitle }}错题本</span>
        <strong>{{ wrongCount }}</strong>
      </button>
      <span class="mem-wrong__hint">复测用原题，不出 AI 变式</span>
    </div>

    <div v-if="open" class="mem-wrong__body">
      <template v-if="quizPhase === 'idle'">
        <p v-if="!allRows.length" class="mem-wrong__empty">暂无错题。测验答错后会自动收入。</p>
        <template v-else>
          <div class="mem-wrong__filters">
            <label>
              错题次数
              <el-select
                v-model="filterWrongCount"
                clearable
                placeholder="不限"
                size="small"
                style="width: 100px"
              >
                <el-option
                  v-for="n in wrongCountOptions"
                  :key="n"
                  :label="`${n} 次`"
                  :value="n"
                />
              </el-select>
            </label>
            <label>
              日期
              <el-select
                v-model="filterDate"
                clearable
                placeholder="不限"
                size="small"
                style="width: 130px"
              >
                <el-option v-for="d in dateOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </label>
            <el-button size="small" plain @click="selectAllFiltered">全选当前</el-button>
            <el-button size="small" text @click="clearSelected">清空勾选</el-button>
          </div>

          <p class="mem-wrong__batch-label">
            分批原题测验（每组最多 {{ WRONG_BOOK_BATCH_SIZE }} 题
            <template v-if="selected.size">；已勾选 {{ selected.size }}</template>
            ）
          </p>
          <div class="mem-wrong__batches">
            <el-button
              v-for="b in batches"
              :key="b.index"
              size="small"
              type="primary"
              plain
              @click="startBatchQuiz(b.index)"
            >
              第 {{ b.index + 1 }} 组（{{ b.from }}–{{ b.to }}）
            </el-button>
          </div>

          <ul class="mem-wrong__list">
            <li v-for="row in filteredRows" :key="row.fingerprint" class="mem-wrong__item">
              <label class="mem-wrong__check">
                <input
                  type="checkbox"
                  :checked="selected.has(row.fingerprint)"
                  @change="toggleSelect(row.fingerprint)"
                />
              </label>
              <div class="mem-wrong__main">
                <p class="mem-wrong__meta">
                  <span>{{ typeLabel(row) }}</span>
                  <span>· {{ row.scopeLabel }}</span>
                  <span>· 错 {{ row.wrongCount }} 次</span>
                </p>
                <p v-if="row.sourceTitle" class="mem-wrong__src">出处：{{ row.sourceTitle }}</p>
                <p class="mem-wrong__stem">{{ row.stem }}</p>
                <p class="mem-wrong__ans">
                  正确：{{ row.options[row.correctIndex] }}
                </p>
              </div>
              <el-button size="small" text type="danger" @click="removeRow(row.fingerprint)">
                移除
              </el-button>
            </li>
          </ul>
          <WrongBookReviewStat :scope="reviewScope" />
        </template>
      </template>

      <template v-else-if="quizPhase === 'playing' && currentQuiz">
        <div class="mem-wrong-quiz__top">
          <span>第 {{ quizCursor + 1 }} / {{ quizTotal }} 题</span>
          <span class="mem-wrong-quiz__badge">原题复测</span>
          <el-button size="small" plain @click="exitQuiz">退出测验</el-button>
        </div>
        <p v-if="currentQuiz.sourceTitle" class="mem-wrong-quiz__src">
          出处：{{ currentQuiz.sourceTitle }}
        </p>
        <p
          v-if="showTerm(currentQuiz, quizRevealed)"
          class="mem-wrong-quiz__term"
        >
          {{ currentQuiz.term }}
        </p>
        <p class="mem-wrong-quiz__stem">{{ currentQuiz.stem }}</p>
        <ol v-if="currentQuiz.segments?.length" class="mem-wrong-quiz__segs">
          <li v-for="(seg, si) in currentQuiz.segments" :key="si">
            <strong>{{ Number(si) + 1 }}.</strong> {{ seg }}
          </li>
        </ol>
        <div v-if="currentQuiz.context" class="mem-wrong-quiz__ctx-btn">
          <el-button size="small" plain @click="contextVisible = true">查看上下文</el-button>
        </div>
        <div class="mem-wrong-quiz__options">
          <button
            v-for="(opt, idx) in currentQuiz.options"
            :key="idx"
            type="button"
            class="mem-wrong-quiz__opt"
            :class="{
              'is-selected': quizChoice === idx && !quizRevealed,
              'is-correct': quizRevealed && idx === currentQuiz.correctIndex,
              'is-wrong':
                quizRevealed && quizChoice === idx && idx !== currentQuiz.correctIndex,
            }"
            :disabled="quizRevealed"
            @click="selectQuizOption(Number(idx))"
          >
            <span>{{ Number(idx) + 1 }}.</span> {{ opt }}
          </button>
        </div>
        <p v-if="quizRevealed && currentQuiz.explanation" class="mem-wrong-quiz__explain">
          {{ currentQuiz.explanation }}
        </p>
        <div class="mem-wrong-quiz__actions">
          <el-button
            v-if="!quizRevealed"
            type="primary"
            :disabled="quizChoice == null"
            @click="submitQuizAnswer"
          >
            提交
          </el-button>
          <el-button v-else type="primary" @click="nextQuizQuestion">
            {{ quizCursor + 1 >= quizTotal ? '查看结果' : '下一题' }}
          </el-button>
        </div>
        <el-dialog v-model="contextVisible" title="上下文" width="min(560px, 94vw)" append-to-body>
          <p v-if="currentQuiz.sourceTitle">出处：{{ currentQuiz.sourceTitle }}</p>
          <div style="white-space: pre-wrap; line-height: 1.6">{{ currentQuiz.context }}</div>
        </el-dialog>
      </template>

      <template v-else-if="quizPhase === 'result'">
        <p class="mem-wrong-quiz__score">
          本组原题复测：{{ quizCorrectCount }} / {{ quizTotal }}
        </p>
        <div class="mem-wrong-quiz__actions">
          <el-button type="primary" @click="exitQuiz">返回错题本</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.mem-wrong {
  margin-top: 14px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  border-radius: 12px;
  background: var(--app-surface, #fff);
  overflow: hidden;
}

.mem-wrong__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--app-surface-alt, #f7f7f8);
}

.mem-wrong__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.mem-wrong__toggle strong {
  min-width: 1.5em;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
  color: var(--el-color-primary);
  font-size: 13px;
}

.mem-wrong__hint {
  font-size: 12px;
  color: var(--app-text-muted, #888);
}

.mem-wrong__body {
  padding: 12px;
  border-top: 1px solid var(--app-border-soft, #eee);
}

.mem-wrong__empty {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted, #888);
}

.mem-wrong__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 10px;
  font-size: 12px;
}

.mem-wrong__filters label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
  color: var(--app-text-muted, #666);
}

.mem-wrong__batch-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.mem-wrong__batches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.mem-wrong__list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(42vh, 360px);
  overflow: auto;
}

.mem-wrong__item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #eee);
  background: var(--app-surface-alt, #fafafa);
}

.mem-wrong__check {
  padding-top: 2px;
}

.mem-wrong__main {
  flex: 1;
  min-width: 0;
}

.mem-wrong__meta {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--app-text-muted, #777);
}

.mem-wrong__src,
.mem-wrong__ans {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--app-text-muted, #666);
}

.mem-wrong__stem {
  margin: 0 0 4px;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 600;
}

.mem-wrong-quiz__top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.mem-wrong-quiz__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}

.mem-wrong-quiz__src,
.mem-wrong-quiz__term {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--app-text-muted, #666);
}

.mem-wrong-quiz__stem {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.55;
  white-space: pre-wrap;
}

.mem-wrong-quiz__segs {
  margin: 0 0 10px;
  padding-left: 1.2em;
  font-size: 14px;
  line-height: 1.5;
}

.mem-wrong-quiz__ctx-btn {
  margin-bottom: 8px;
}

.mem-wrong-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mem-wrong-quiz__opt {
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #ddd);
  background: var(--app-surface, #fff);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
}

.mem-wrong-quiz__opt.is-selected {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.mem-wrong-quiz__opt.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.mem-wrong-quiz__opt.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
}

.mem-wrong-quiz__explain {
  margin: 10px 0 0;
  padding: 10px;
  border-radius: 8px;
  background: var(--app-surface-alt, #f7f7f8);
  font-size: 13px;
  line-height: 1.5;
}

.mem-wrong-quiz__actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.mem-wrong-quiz__score {
  margin: 8px 0 12px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}
</style>
