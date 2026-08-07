<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onUnmounted, ref, watch } from 'vue'
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
import {
  currentAffairsDrillQuestionTypeLabel,
  normalizeOrderOption,
  orderArrangementToOption,
  orderSegmentsToReadingText,
} from '@/utils/currentAffairsDrillPractice'
import { poetDrillQuestionTypeLabel } from '@/utils/poetDrillPractice'
import { shouldShowPoetDrillTermBeforeSubmit } from '@/utils/poetDrillPractice'
import type { PoetDrillQuestion } from '@/utils/poetDrillPractice'
import {
  recordWrongBookReviewAttempt,
  recordWrongBookReviewComplete,
  type WrongBookReviewScope,
} from '@/utils/wrongBookReviewStats'
import WrongBookReviewStat from '@/views/tools/mental-math/components/WrongBookReviewStat.vue'
import WrongBookImmersivePreview, {
  type WrongBookPreviewItem,
} from '@/views/tools/mental-math/components/WrongBookImmersivePreview.vue'
import SentenceOrderBoard from '@/views/tools/chinese-practice/SentenceOrderBoard.vue'
import {
  enterWrongBookWorkspace,
  leaveWrongBookWorkspace,
} from '@/utils/wrongBookWorkspaceGate'
import {
  acquireWrongBookOverlayLock,
  releaseWrongBookOverlayLock,
} from '@/utils/wrongBookOverlayLock'

const props = defineProps<{
  module: MemorizationWrongModule
}>()

const workspaceOpen = ref(false)
const detailVisible = ref(false)
const detail = ref<MemorizationWrongRecord | null>(null)
const previewOpen = ref(false)
const previewIndex = ref(0)
const filterWrongCount = ref<number | undefined>()
const filterDate = ref<string | undefined>()
const selected = ref<Set<string>>(new Set())

type QuizPhase = 'idle' | 'playing' | 'result'
const quizPhase = ref<QuizPhase>('idle')
const quizItems = ref<MemorizationWrongQuizItem[]>([])
const quizCursor = ref(0)
const quizChoice = ref<number | null>(null)
const quizOrderArrangement = ref<number[]>([])
const quizRevealed = ref(false)
const quizCorrectCount = ref(0)
const quizAnswered = ref(0)
const quizCompleteRecorded = ref(false)

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

const isOrderQuiz = computed(() => currentQuiz.value?.questionType === 'sentence-order')

function parseOrderLabels(raw: string | undefined | null): number[] | null {
  const n = normalizeOrderOption(String(raw ?? ''))
  if (!n) return null
  return n.split('、').map(Number)
}

const quizRevealCorrectOrder = computed(() => {
  if (!quizRevealed.value || !isOrderQuiz.value || !currentQuiz.value) return null
  return parseOrderLabels(currentQuiz.value.options[currentQuiz.value.correctIndex])
})

function resetQuizOrderArrangement() {
  quizOrderArrangement.value = []
}
const quizTotal = computed(() => quizItems.value.length)

const moduleTitle = computed(() =>
  props.module === 'poet-drill' ? '诗词识记' : '时政识记',
)

function rowCorrectLabel(row: MemorizationWrongRecord): string {
  const orderOrOpt = String(row.options[row.correctIndex] ?? '').trim()
  if (row.questionType === 'sentence-order' && row.segments?.length === 5) {
    const text = orderSegmentsToReadingText(row.segments, orderOrOpt)
    return text ? `${orderOrOpt}\n${text}` : orderOrOpt || '—'
  }
  return orderOrOpt || '—'
}

function rowExpression(row: MemorizationWrongRecord): string {
  const parts: string[] = []
  if (row.sourceTitle) parts.push(`出处：${row.sourceTitle}`)
  if (row.term) parts.push(`考点：${row.term}`)
  parts.push(row.stem)
  if (row.questionType === 'sentence-order' && row.segments?.length) {
    parts.push(row.segments.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }
  return parts.join('\n\n')
}

const previewItems = computed((): WrongBookPreviewItem[] => {
  void memorizationWrongBookTick.value
  return filteredRows.value.map((row) => {
    const correct = String(row.options[row.correctIndex] ?? '')
    const chosen = String(row.chosenAnswer ?? '')
    return {
      key: row.fingerprint,
      expression: rowExpression(row),
      correctAnswer: rowCorrectLabel(row),
      chosenAnswer: chosen || undefined,
      explanation: row.explanation,
      prose: true,
      options:
        row.questionType === 'sentence-order'
          ? undefined
          : row.options.map((opt) => {
              const text = String(opt)
              return {
                text,
                isCorrect: text === correct,
                isChosen: Boolean(chosen) && text === chosen,
              }
            }),
    }
  })
})

watch(workspaceOpen, (v) => {
  if (v) {
    enterWrongBookWorkspace()
    acquireWrongBookOverlayLock()
  } else {
    leaveWrongBookWorkspace()
    releaseWrongBookOverlayLock()
    detailVisible.value = false
    detail.value = null
    previewOpen.value = false
    exitQuiz()
  }
})

onUnmounted(() => {
  if (workspaceOpen.value) workspaceOpen.value = false
})

function openWorkspace() {
  if (!wrongCount.value) {
    ElMessage.info('暂无错题')
    return
  }
  filterWrongCount.value = undefined
  filterDate.value = undefined
  selected.value = new Set()
  detailVisible.value = false
  previewOpen.value = false
  resetQuiz()
  workspaceOpen.value = true
}

function closeWorkspace() {
  workspaceOpen.value = false
}

function resetFilters() {
  filterWrongCount.value = undefined
  filterDate.value = undefined
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

function openDetail(row: MemorizationWrongRecord) {
  detail.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detail.value = null
}

function openPreview(startFp?: string) {
  const list = filteredRows.value
  if (!list.length) {
    ElMessage.info('当前筛选下暂无可预览题目')
    return
  }
  const idx = startFp ? list.findIndex((r) => r.fingerprint === startFp) : 0
  previewIndex.value = idx >= 0 ? idx : 0
  detailVisible.value = false
  previewOpen.value = true
}

async function removeRow(fp: string) {
  try {
    await ElMessageBox.confirm('确定从错题本中删除这道题？', '删除错题', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  const wasPreview = previewOpen.value
  const list = filteredRows.value
  const idx = list.findIndex((r) => r.fingerprint === fp)
  removeMemorizationWrong(fp)
  const next = new Set(selected.value)
  next.delete(fp)
  selected.value = next
  if (detail.value?.fingerprint === fp) {
    detailVisible.value = false
    detail.value = null
  }
  if (wasPreview) {
    if (!filteredRows.value.length) {
      previewOpen.value = false
    } else if (idx >= 0) {
      previewIndex.value = Math.min(idx, filteredRows.value.length - 1)
    }
  }
  ElMessage.success('已移出错题本')
  if (!listMemorizationWrongRecords(props.module).length) {
    previewOpen.value = false
    closeWorkspace()
  }
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
    ElMessage.warning('错题数据不完整，无法组卷（排序题须含 5 段原文）')
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
  resetQuizOrderArrangement()
}

function selectQuizOption(idx: number) {
  if (quizRevealed.value) return
  quizChoice.value = idx
}

function submitQuizAnswer() {
  const q = currentQuiz.value
  if (!q || quizRevealed.value) return

  if (q.questionType === 'sentence-order') {
    const userOrder = orderArrangementToOption(quizOrderArrangement.value)
    if (!userOrder) {
      ElMessage.warning('请先完成五段排序')
      return
    }
    const correctAnswer = normalizeOrderOption(String(q.options[q.correctIndex] ?? ''))
    const ok = userOrder === correctAnswer
    quizChoice.value = q.options.findIndex((o) => normalizeOrderOption(o) === userOrder)
    if (quizChoice.value < 0) quizChoice.value = null
    quizRevealed.value = true
    if (ok) quizCorrectCount.value += 1
    quizAnswered.value += 1
    recordWrongBookReviewAttempt(reviewScope.value, ok)
    if (!ok) {
      bumpMemorizationWrongCount(q.originFingerprint)
      ElMessage.info('答错，已累计错题次数（原题复测，未出变式）')
    }
    return
  }

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
  resetQuizOrderArrangement()
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
  quizOrderArrangement.value = []
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
      <button type="button" class="mem-wrong__toggle" @click="openWorkspace">
        <span>{{ moduleTitle }}错题本</span>
        <strong>{{ wrongCount }}</strong>
      </button>
      <div class="mem-wrong__bar-actions">
        <el-button
          size="small"
          type="primary"
          :disabled="!wrongCount"
          @click="openWorkspace"
        >
          进入
        </el-button>
        <el-button
          size="small"
          plain
          type="primary"
          :disabled="!wrongCount"
          @click="openPreview()"
        >
          预览
        </el-button>
      </div>
    </div>
    <p class="mem-wrong__hint">复测用原题，不出 AI 变式 · 点进入打开错题本；可预览题目详情</p>

    <Teleport to="body">
      <div
        v-if="workspaceOpen"
        class="wb-workspace"
        role="dialog"
        aria-modal="true"
        :aria-label="`${moduleTitle}错题本`"
      >
        <div class="wb-workspace__panel play-panel">
          <div class="play-top">
            <div class="play-meta">
              <div class="play-meta__main">
                <span class="play-mode">{{ moduleTitle }} · 错题本</span>
                <span class="play-score">
                  共 <strong>{{ filteredRows.length }}</strong> / {{ wrongCount }} 题
                </span>
              </div>
              <div class="session-actions session-actions--inline">
                <el-button
                  v-if="quizPhase === 'idle'"
                  size="small"
                  plain
                  type="primary"
                  :disabled="!filteredRows.length"
                  @click="openPreview()"
                >
                  预览
                </el-button>
                <el-button size="small" @click="closeWorkspace">退出</el-button>
              </div>
            </div>
          </div>

          <template v-if="quizPhase === 'playing' && currentQuiz">
            <div class="mem-wrong-quiz__top">
              <span>第 {{ quizCursor + 1 }} / {{ quizTotal }} 题</span>
              <span class="mem-wrong-quiz__badge">原题复测</span>
              <el-button size="small" plain @click="exitQuiz">结束测验</el-button>
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
            <SentenceOrderBoard
              v-if="
                currentQuiz.questionType === 'sentence-order' &&
                currentQuiz.segments?.length
              "
              :segments="currentQuiz.segments"
              v-model="quizOrderArrangement"
              :disabled="quizRevealed"
              :reveal-correct-order="quizRevealCorrectOrder"
            />
            <div v-else class="mem-wrong-quiz__options">
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
            <p
              v-if="quizRevealed && currentQuiz.questionType === 'sentence-order'"
              class="mem-wrong-quiz__explain"
            >
              正确序号：{{ currentQuiz.options[currentQuiz.correctIndex] }}
            </p>
            <p
              v-if="
                quizRevealed &&
                currentQuiz.questionType === 'sentence-order' &&
                currentQuiz.segments?.length
              "
              class="mem-wrong-quiz__explain"
            >
              正确原文：{{
                orderSegmentsToReadingText(
                  currentQuiz.segments,
                  currentQuiz.options[currentQuiz.correctIndex] || '',
                )
              }}
            </p>
            <div class="mem-wrong-quiz__actions">
              <el-button
                v-if="!quizRevealed"
                type="primary"
                :disabled="
                  currentQuiz.questionType === 'sentence-order'
                    ? quizOrderArrangement.length !== 5
                    : quizChoice == null
                "
                @click="submitQuizAnswer"
              >
                {{ currentQuiz.questionType === 'sentence-order' ? '确认' : '提交' }}
              </el-button>
              <el-button v-else type="primary" @click="nextQuizQuestion">
                {{ quizCursor + 1 >= quizTotal ? '查看结果' : '下一题' }}
              </el-button>
            </div>
          </template>

          <template v-else-if="quizPhase === 'result'">
            <p class="mem-wrong-quiz__score">
              本组原题复测：{{ quizCorrectCount }} / {{ quizTotal }}
            </p>
            <div class="mem-wrong-quiz__actions">
              <el-button type="primary" @click="exitQuiz">返回错题本</el-button>
            </div>
          </template>

          <template v-else>
            <p v-if="!wrongCount" class="mem-wrong__empty wb-workspace__empty">
              暂无错题。测验答错后会自动收入。
            </p>
            <template v-else>
              <form class="wb-filter" @submit.prevent>
                <label class="wb-filter__field">
                  <span>错题次数</span>
                  <el-select
                    v-model="filterWrongCount"
                    clearable
                    placeholder="不限"
                    style="width: 120px"
                  >
                    <el-option
                      v-for="n in wrongCountOptions"
                      :key="n"
                      :label="`${n} 次`"
                      :value="n"
                    />
                  </el-select>
                </label>
                <label class="wb-filter__field">
                  <span>错题日期</span>
                  <el-select
                    v-model="filterDate"
                    clearable
                    placeholder="不限"
                    style="width: 150px"
                  >
                    <el-option v-for="d in dateOptions" :key="d" :label="d" :value="d" />
                  </el-select>
                </label>
                <el-button size="small" plain @click="resetFilters">重置</el-button>
                <el-button size="small" plain @click="selectAllFiltered">全选当前</el-button>
                <el-button size="small" text @click="clearSelected">清空勾选</el-button>
              </form>

              <section v-if="batches.length" class="wb-batches">
                <p class="wb-batches__label">
                  分批原题测验（每组最多 {{ WRONG_BOOK_BATCH_SIZE }} 题
                  <template v-if="selected.size">；已勾选 {{ selected.size }}</template>
                  ）
                </p>
                <div class="wb-batches__btns">
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
              </section>

              <p v-if="!filteredRows.length" class="mem-wrong__empty wb-workspace__empty">
                当前筛选下没有题目
              </p>
              <ul v-else class="mem-wrong__list wb-workspace__list">
                <li v-for="row in filteredRows" :key="row.fingerprint" class="mem-wrong__item">
                  <label class="mem-wrong__check">
                    <input
                      type="checkbox"
                      :checked="selected.has(row.fingerprint)"
                      @change="toggleSelect(row.fingerprint)"
                    />
                  </label>
                  <button type="button" class="mem-wrong__main" @click="openDetail(row)">
                    <p class="mem-wrong__meta">
                      <span>{{ typeLabel(row) }}</span>
                      <span>· {{ row.scopeLabel }}</span>
                      <span>· 错 {{ row.wrongCount }} 次</span>
                      <span>· 点看详情</span>
                    </p>
                    <p v-if="row.sourceTitle" class="mem-wrong__src">
                      出处：{{ row.sourceTitle }}
                    </p>
                    <p class="mem-wrong__stem">{{ row.stem }}</p>
                    <p class="mem-wrong__ans">
                      正确：{{ row.options[row.correctIndex] }}
                    </p>
                  </button>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="removeRow(row.fingerprint)"
                  >
                    移除
                  </el-button>
                </li>
              </ul>
              <div class="wb-workspace__footer-stat">
                <WrongBookReviewStat :scope="reviewScope" />
              </div>
            </template>
          </template>
        </div>
      </div>
    </Teleport>

    <el-dialog
      v-model="detailVisible"
      :title="`${moduleTitle} · 错题详情`"
      width="560px"
      align-center
      destroy-on-close
      append-to-body
      :z-index="workspaceOpen ? 4300 : 2100"
      @closed="onDetailClosed"
    >
      <div v-if="detail" class="mem-wrong-detail">
        <section>
          <h4>题型 / 范围</h4>
          <p>{{ typeLabel(detail) }} · {{ detail.scopeLabel }} · 错 {{ detail.wrongCount }} 次</p>
        </section>
        <section v-if="detail.sourceTitle">
          <h4>出处</h4>
          <p>{{ detail.sourceTitle }}</p>
        </section>
        <section v-if="detail.term">
          <h4>考点</h4>
          <p>{{ detail.term }}</p>
        </section>
        <section>
          <h4>题目</h4>
          <p class="mem-wrong-detail__stem">{{ detail.stem }}</p>
        </section>
        <section
          v-if="detail.questionType === 'sentence-order' && detail.segments?.length"
        >
          <h4>待排序片段</h4>
          <ol class="mem-wrong-detail__segs">
            <li v-for="(seg, idx) in detail.segments" :key="idx">{{ seg }}</li>
          </ol>
          <p class="mem-wrong-detail__ok">
            正确序号：{{ detail.options[detail.correctIndex] }}
          </p>
          <p class="mem-wrong-detail__ok">
            正确原文：{{
              orderSegmentsToReadingText(
                detail.segments,
                detail.options[detail.correctIndex] || '',
              )
            }}
          </p>
        </section>
        <section v-else-if="detail.options?.length">
          <h4>选项</h4>
          <ul class="mem-wrong-detail__opts">
            <li
              v-for="(opt, idx) in detail.options"
              :key="idx"
              :class="{ 'is-correct': Number(idx) === detail.correctIndex }"
            >
              {{ Number(idx) + 1 }}. {{ opt }}
            </li>
          </ul>
        </section>
        <section v-if="detail.chosenAnswer">
          <h4>你的答案</h4>
          <p class="mem-wrong-detail__bad">{{ detail.chosenAnswer }}</p>
        </section>
        <section v-if="detail.questionType !== 'sentence-order'">
          <h4>正确答案</h4>
          <p class="mem-wrong-detail__ok">{{ detail.options[detail.correctIndex] }}</p>
        </section>
        <section v-if="detail.explanation">
          <h4>解析</h4>
          <p class="mem-wrong-detail__exp">{{ detail.explanation }}</p>
        </section>
      </div>
      <template #footer>
        <el-button
          v-if="detail"
          type="primary"
          plain
          @click="detail && openPreview(detail.fingerprint)"
        >
          预览
        </el-button>
        <el-button
          v-if="detail"
          type="danger"
          plain
          @click="detail && removeRow(detail.fingerprint)"
        >
          删除本题
        </el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <WrongBookImmersivePreview
      v-model:open="previewOpen"
      v-model:index="previewIndex"
      :title="moduleTitle"
      :items="previewItems"
      :enable-note="false"
      @delete="removeRow"
    />
  </div>
</template>

<style scoped>
.mem-wrong {
  margin-top: 12px;
}

.mem-wrong__bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mem-wrong__bar-actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mem-wrong__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  border-radius: 999px;
  background: var(--app-surface-alt, #f7f7f8);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.mem-wrong__toggle strong {
  min-width: 1.2em;
  color: var(--el-color-danger);
}

.mem-wrong__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--app-text-muted, #64748b);
}

.mem-wrong__empty {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--app-text-muted, #64748b);
  line-height: 1.5;
}

.mem-wrong__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mem-wrong__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border-soft, #e8e8ea);
}

.mem-wrong__item:last-child {
  border-bottom: none;
}

.mem-wrong__check {
  flex-shrink: 0;
  padding-top: 2px;
}

.mem-wrong__main {
  flex: 1;
  min-width: 0;
  appearance: none;
  border: none;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.mem-wrong__meta {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--app-text-muted, #64748b);
}

.mem-wrong__src,
.mem-wrong__stem,
.mem-wrong__ans {
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.mem-wrong__stem {
  font-weight: 600;
}

.mem-wrong__ans {
  color: var(--el-color-success);
  font-size: 12px;
}

.mem-wrong-detail {
  display: grid;
  gap: 14px;
}

.mem-wrong-detail h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-muted, #64748b);
}

.mem-wrong-detail p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.mem-wrong-detail__stem {
  font-weight: 650;
}

.mem-wrong-detail__opts,
.mem-wrong-detail__segs {
  margin: 0;
  padding-left: 1.2em;
  display: grid;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.mem-wrong-detail__opts .is-correct {
  color: var(--el-color-success);
  font-weight: 700;
}

.mem-wrong-detail__ok {
  color: var(--el-color-success);
  font-weight: 650;
}

.mem-wrong-detail__bad {
  color: var(--el-color-danger);
}

.mem-wrong-detail__exp {
  color: var(--app-text-muted, #64748b);
}

.mem-wrong-quiz__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
}

.mem-wrong-quiz__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  color: var(--el-color-primary);
  font-size: 12px;
}

.mem-wrong-quiz__src,
.mem-wrong-quiz__term {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--app-text-muted, #64748b);
}

.mem-wrong-quiz__stem {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.55;
}

.mem-wrong-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.mem-wrong-quiz__opt {
  appearance: none;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  border-radius: 10px;
  background: var(--app-surface, #fff);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mem-wrong-quiz__opt.is-selected {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.mem-wrong-quiz__opt.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 8%, transparent);
}

.mem-wrong-quiz__opt.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 8%, transparent);
}

.mem-wrong-quiz__explain {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted, #64748b);
}

.mem-wrong-quiz__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.mem-wrong-quiz__score {
  margin: 24px 0 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
}

.wb-workspace {
  position: fixed;
  inset: 0;
  z-index: 3200;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--app-bg, #f5f7fb) 92%, #0f172a 8%);
}

.wb-workspace__panel {
  width: min(720px, 100%);
  max-height: 100%;
  overflow: auto;
  margin: 0 auto;
  padding: 16px 18px 28px;
  border-radius: 16px;
  background: var(--app-surface, #fff);
  border: 1px solid var(--app-border-soft, #e8e8ea);
  box-shadow: 0 12px 40px rgb(15 23 42 / 12%);
}

.play-top {
  margin-bottom: 14px;
}

.play-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.play-meta__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.play-mode {
  font-size: 15px;
  font-weight: 700;
}

.play-score {
  font-size: 13px;
  color: var(--app-text-muted, #64748b);
}

.play-score strong {
  color: var(--el-color-primary);
}

.session-actions--inline {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wb-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid var(--app-border-soft, #e8e8ea);
  border-radius: 12px;
  background: var(--app-surface-alt, #f7f7f8);
}

.wb-filter__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted, #64748b);
}

.wb-batches {
  margin-bottom: 14px;
}

.wb-batches__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.wb-batches__btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wb-workspace__list {
  border: 1px solid var(--app-border-soft, #e8e8ea);
  border-radius: 10px;
  overflow: hidden;
}

.wb-workspace__empty {
  border: 1px dashed var(--app-border-soft, #e8e8ea);
  border-radius: 10px;
}

.wb-workspace__footer-stat {
  margin-top: 12px;
  padding: 12px 0 0;
  border-top: 1px solid var(--app-border-soft, #e8e8ea);
}
</style>
