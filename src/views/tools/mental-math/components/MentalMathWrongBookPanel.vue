<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  clearMentalMathWrongSection,
  countMentalMathWrongRecords,
  listMentalMathWrongRecords,
  MENTAL_MATH_WRONG_SECTION_LABELS,
  mentalMathWrongBookTick,
  removeMentalMathWrong,
  type MentalMathWrongRecord,
  type MentalMathWrongSection,
} from '@/utils/mentalMathWrongBook'
import {
  clearMentalMathFavoriteSection,
  countMentalMathFavoriteRecords,
  isMentalMathFavorite,
  listMentalMathFavoriteRecords,
  mentalMathFavoriteBookTick,
  removeMentalMathFavorite,
  toggleMentalMathFavoriteFromWrong,
  type MentalMathFavoriteRecord,
} from '@/utils/mentalMathFavoriteBook'
import {
  clearMentalMathWrongNotesForSection,
  getMentalMathWrongNote,
  removeMentalMathWrongNote,
  setMentalMathWrongNote,
} from '@/utils/mentalMathWrongNotes'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import {
  buildWrongBookQuizItems,
  chunkWrongBookQuizItems,
  filterMentalMathWrongRecords,
  isFillAnswerMatch,
  recordDateKey,
  WRONG_BOOK_BATCH_SIZE,
  type WrongBookQuizItem,
} from '@/utils/mentalMathWrongQuiz'
import {
  enterWrongBookWorkspace,
  leaveWrongBookWorkspace,
} from '@/utils/wrongBookWorkspaceGate'
import {
  acquireWrongBookOverlayLock,
  releaseWrongBookOverlayLock,
} from '@/utils/wrongBookOverlayLock'
import {
  mmWrongReviewScope,
  recordWrongBookReviewAttempt,
  recordWrongBookReviewComplete,
} from '@/utils/wrongBookReviewStats'
import {
  handleMentalMathWrongQuizMiss,
  notifyMentalMathWrongQuizMissResult,
} from '@/utils/mentalMathWrongQuizReplace'
import WrongBookReviewStat from './WrongBookReviewStat.vue'
import WrongBookImmersivePreview, {
  type WrongBookPreviewItem,
} from './WrongBookImmersivePreview.vue'

const props = defineProps<{
  section: MentalMathWrongSection
}>()

type BookTab = 'wrong' | 'favorite'
type DisplayRow = MentalMathWrongRecord | MentalMathFavoriteRecord

const open = ref(false)
const workspaceOpen = ref(false)
const bookTab = ref<BookTab>('wrong')
const detail = ref<DisplayRow | null>(null)
const detailVisible = ref(false)
const previewOpen = ref(false)
const previewIndex = ref(0)
const noteDraft = ref('')
const noteEditing = ref(false)
const noteSaving = ref(false)

/** 筛选 */
const filterWrongCount = ref<number | null>(null)
const filterDate = ref('')

/** 测验 */
const quizLoading = ref(false)
const quizProgress = ref('')
const quizPhase = ref<'idle' | 'playing' | 'result'>('idle')
const quizBatchIndex = ref(0)
const quizItems = ref<WrongBookQuizItem[]>([])
const quizCursor = ref(0)
const quizChoice = ref<number | null>(null)
const quizFill = ref('')
const quizRevealed = ref(false)
const quizCorrectCount = ref(0)
const quizAnswered = ref(0)
const quizCompleteRecorded = ref(false)

const title = computed(() => MENTAL_MATH_WRONG_SECTION_LABELS[props.section])
const reviewScope = computed(() => mmWrongReviewScope(props.section, bookTab.value))

const wrongRows = computed(() => {
  void mentalMathWrongBookTick.value
  return listMentalMathWrongRecords(props.section)
})

const favoriteRows = computed(() => {
  void mentalMathFavoriteBookTick.value
  return listMentalMathFavoriteRecords(props.section)
})

const wrongCount = computed(() => {
  void mentalMathWrongBookTick.value
  return countMentalMathWrongRecords(props.section)
})

const favoriteCount = computed(() => {
  void mentalMathFavoriteBookTick.value
  return countMentalMathFavoriteRecords(props.section)
})

const count = computed(() =>
  bookTab.value === 'wrong' ? wrongCount.value : favoriteCount.value,
)

const filteredRows = computed((): DisplayRow[] => {
  if (bookTab.value === 'wrong') {
    return filterMentalMathWrongRecords(wrongRows.value, {
      wrongCount: filterWrongCount.value ?? undefined,
      dateKey: filterDate.value || undefined,
    })
  }
  const rows = favoriteRows.value
  if (!filterDate.value) return rows
  return rows.filter((r) => recordDateKey(r.savedAt) === filterDate.value)
})

const wrongCountFilterOptions = computed(() => {
  const set = new Set<number>()
  for (const row of wrongRows.value) {
    const n = Math.max(1, Math.floor(row.wrongCount ?? 1))
    set.add(n)
  }
  return [...set].sort((a, b) => a - b)
})

const dateFilterOptions = computed(() => {
  const set = new Set<string>()
  if (bookTab.value === 'wrong') {
    for (const row of wrongRows.value) {
      const d = recordDateKey(row.updatedAt)
      if (d) set.add(d)
    }
  } else {
    for (const row of favoriteRows.value) {
      const d = recordDateKey(row.savedAt)
      if (d) set.add(d)
    }
  }
  return [...set].sort((a, b) => b.localeCompare(a))
})

function isWrongRow(row: DisplayRow): row is MentalMathWrongRecord {
  return 'wrongCount' in row && typeof (row as MentalMathWrongRecord).wrongCount === 'number'
}

function toQuizSourceRows(rows: DisplayRow[]): MentalMathWrongRecord[] {
  return rows.map((row) => {
    if (isWrongRow(row)) return row
    return {
      fingerprint: row.fingerprint,
      section: row.section,
      modeId: row.modeId,
      expression: row.expression,
      correctAnswer: row.correctAnswer,
      chosenAnswer: '',
      options: row.options,
      explanation: row.explanation,
      wrongCount: 1,
      updatedAt: row.savedAt,
    }
  })
}

const quizBatches = computed(() => {
  const n = filteredRows.value.length
  if (n <= 0) return [] as { index: number; from: number; to: number; size: number }[]
  const out: { index: number; from: number; to: number; size: number }[] = []
  for (let i = 0; i < n; i += WRONG_BOOK_BATCH_SIZE) {
    const to = Math.min(i + WRONG_BOOK_BATCH_SIZE, n)
    out.push({
      index: out.length,
      from: i + 1,
      to,
      size: to - i,
    })
  }
  return out
})

const currentQuiz = computed(() => quizItems.value[quizCursor.value] ?? null)
const quizTotal = computed(() => quizItems.value.length)

const previewItems = computed((): WrongBookPreviewItem[] => {
  void mentalMathWrongBookTick.value
  void mentalMathFavoriteBookTick.value
  return filteredRows.value.map((row) => ({
    key: row.fingerprint,
    expression: row.expression,
    correctAnswer: row.correctAnswer,
    chosenAnswer: isWrongRow(row) ? row.chosenAnswer : undefined,
    explanation: row.explanation,
    note: getMentalMathWrongNote(props.section, row.fingerprint),
    options: row.options?.map((opt) => {
      const text = String(opt)
      return {
        text,
        isCorrect: text === row.correctAnswer,
        isChosen: isWrongRow(row) ? text === row.chosenAnswer : false,
      }
    }),
  }))
})

watch(
  () => props.section,
  () => {
    open.value = false
    closeWorkspace()
    detailVisible.value = false
    detail.value = null
    previewOpen.value = false
    previewIndex.value = 0
    noteDraft.value = ''
    noteEditing.value = false
    filterWrongCount.value = null
    filterDate.value = ''
    bookTab.value = 'wrong'
  },
)

watch(bookTab, () => {
  detailVisible.value = false
  detail.value = null
  previewOpen.value = false
  previewIndex.value = 0
  filterWrongCount.value = null
  filterDate.value = ''
  resetQuiz()
})

watch(workspaceOpen, (v) => {
  if (v) {
    enterWrongBookWorkspace()
    acquireWrongBookOverlayLock()
  } else {
    leaveWrongBookWorkspace()
    releaseWrongBookOverlayLock()
  }
})

onUnmounted(() => {
  if (workspaceOpen.value) workspaceOpen.value = false
})

function rowNote(fp: string): string {
  void mentalMathWrongBookTick.value
  return getMentalMathWrongNote(props.section, fp)
}

function noteHtml(fp: string): string {
  const note = rowNote(fp)
  return note ? markdownToDisplaySafeHtml(note) : ''
}

function rowFavorited(fp: string): boolean {
  void mentalMathFavoriteBookTick.value
  return isMentalMathFavorite(fp)
}

function toggleOpen() {
  open.value = !open.value
}

function openWorkspace() {
  if (!wrongCount.value && !favoriteCount.value) {
    ElMessage.info('暂无错题或收藏')
    return
  }
  open.value = false
  detailVisible.value = false
  previewOpen.value = false
  resetQuiz()
  workspaceOpen.value = true
}

function closeWorkspace() {
  workspaceOpen.value = false
  resetQuiz()
}

function resetFilters() {
  filterWrongCount.value = null
  filterDate.value = ''
}

function openDetail(row: DisplayRow) {
  detail.value = row
  noteDraft.value = getMentalMathWrongNote(props.section, row.fingerprint)
  noteEditing.value = false
  detailVisible.value = true
}

function onDetailClosed() {
  detail.value = null
  noteDraft.value = ''
  noteEditing.value = false
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

function onEditNote() {
  if (!detail.value) return
  noteDraft.value = getMentalMathWrongNote(props.section, detail.value.fingerprint)
  noteEditing.value = true
}

function onCancelNoteEdit() {
  if (!detail.value) return
  noteDraft.value = getMentalMathWrongNote(props.section, detail.value.fingerprint)
  noteEditing.value = false
}

function onSaveNote(fp: string) {
  noteSaving.value = true
  try {
    setMentalMathWrongNote(props.section, fp, noteDraft.value)
    noteEditing.value = false
    ElMessage.success(noteDraft.value.trim() ? '备注已保存' : '已清空备注')
  } finally {
    noteSaving.value = false
  }
}

function onPreviewSaveNote(fp: string, note: string) {
  setMentalMathWrongNote(props.section, fp, note)
  ElMessage.success(note.trim() ? '备注已保存' : '已清空备注')
}

async function onRemove(fp: string) {
  try {
    await ElMessageBox.confirm(
      bookTab.value === 'wrong' ? '确定从错题集中删除这道题？' : '确定从收藏中删除这道题？',
      bookTab.value === 'wrong' ? '删除错题' : '删除收藏',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }
  const wasPreview = previewOpen.value
  const list = filteredRows.value
  const idx = list.findIndex((r) => r.fingerprint === fp)
  if (bookTab.value === 'wrong') {
    removeMentalMathWrong(fp)
    removeMentalMathWrongNote(props.section, fp)
  } else {
    removeMentalMathFavorite(fp)
  }
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
  ElMessage.success('已删除')
}

function onToggleFavoriteRow(row: DisplayRow) {
  const r = toggleMentalMathFavoriteFromWrong({
    fingerprint: row.fingerprint,
    section: row.section,
    modeId: row.modeId,
    expression: row.expression,
    correctAnswer: row.correctAnswer,
    options: row.options,
    explanation: row.explanation,
  })
  ElMessage.success(r === 'added' ? '已加入收藏' : '已取消收藏')
}

async function onClearAll() {
  if (!count.value) return
  const label = bookTab.value === 'wrong' ? '错题' : '收藏'
  try {
    await ElMessageBox.confirm(
      `确定清空「${title.value}」全部 ${count.value} 道${label}？`,
      `清空${label}`,
      { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  if (bookTab.value === 'wrong') {
    clearMentalMathWrongSection(props.section)
    clearMentalMathWrongNotesForSection(props.section)
  } else {
    clearMentalMathFavoriteSection(props.section)
  }
  detailVisible.value = false
  detail.value = null
  previewOpen.value = false
  closeWorkspace()
  ElMessage.success('已清空')
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function resetQuiz() {
  quizLoading.value = false
  quizProgress.value = ''
  quizPhase.value = 'idle'
  quizBatchIndex.value = 0
  quizItems.value = []
  quizCursor.value = 0
  quizChoice.value = null
  quizFill.value = ''
  quizRevealed.value = false
  quizCorrectCount.value = 0
  quizAnswered.value = 0
  quizCompleteRecorded.value = false
}

async function startBatchQuiz(batchIndex: number) {
  const batch = quizBatches.value[batchIndex]
  if (!batch) return
  const slice = toQuizSourceRows(filteredRows.value.slice(batch.from - 1, batch.to))
  if (!slice.length) {
    ElMessage.info('该批次没有题目')
    return
  }
  quizLoading.value = true
  quizProgress.value = '正在准备变式题…'
  quizPhase.value = 'idle'
  try {
    const items = await buildWrongBookQuizItems(slice, (msg) => {
      quizProgress.value = msg
    })
    if (!items.length) {
      ElMessage.warning('无法生成可测验题目（缺少答案）')
      return
    }
    const variantN = items.filter((i) => i.isVariant).length
    if (variantN > 0) {
      ElMessage.success(`已生成 ${variantN}/${items.length} 道变式`)
    } else {
      ElMessage.info('已用原题组卷（无 AI 或变式失败时）')
    }
    quizBatchIndex.value = batchIndex
    quizItems.value = chunkWrongBookQuizItems(items, WRONG_BOOK_BATCH_SIZE)[0] ?? items
    quizCursor.value = 0
    quizChoice.value = null
    quizFill.value = ''
    quizRevealed.value = false
    quizCorrectCount.value = 0
    quizAnswered.value = 0
    quizCompleteRecorded.value = false
    quizPhase.value = 'playing'
  } finally {
    quizLoading.value = false
    quizProgress.value = ''
  }
}

function submitQuizAnswer() {
  const q = currentQuiz.value
  if (!q || quizRevealed.value) return
  let ok = false
  let chosenAnswer = ''
  if (q.kind === 'mcq') {
    if (quizChoice.value == null) {
      ElMessage.warning('请先选择选项')
      return
    }
    ok = quizChoice.value === q.correctIndex
    chosenAnswer = String(q.options[quizChoice.value] ?? '')
  } else {
    if (!quizFill.value.trim()) {
      ElMessage.warning('请先填写答案')
      return
    }
    chosenAnswer = quizFill.value.trim()
    ok = isFillAnswerMatch(quizFill.value, q.fillAnswer ?? '')
  }
  quizRevealed.value = true
  if (ok) quizCorrectCount.value += 1
  quizAnswered.value += 1
  recordWrongBookReviewAttempt(reviewScope.value, ok)
  if (!ok) {
    const miss = handleMentalMathWrongQuizMiss({
      quiz: q,
      chosenAnswer,
      bank: bookTab.value,
    })
    notifyMentalMathWrongQuizMissResult(miss)
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
  quizFill.value = ''
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

function exitQuiz() {
  // 中途退出：已答题已计入 attempted/correct；未整组完成则不计完整复盘，写一条中途日志便于归类查看
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
  <div class="mm-wrong">
    <div class="mm-wrong__bar">
      <button type="button" class="mm-wrong__toggle" @click="toggleOpen">
        <span>错题本</span>
        <strong>{{ wrongCount }}</strong>
        <span class="mm-wrong__fav-count" title="收藏">★{{ favoriteCount }}</span>
        <span class="mm-wrong__chevron" :class="{ 'is-open': open }">▾</span>
      </button>
      <div class="mm-wrong__bar-actions">
        <el-button
          size="small"
          type="primary"
          :disabled="!wrongCount && !favoriteCount"
          @click="openWorkspace"
        >
          进入
        </el-button>
        <el-button
          size="small"
          plain
          type="primary"
          :disabled="!count"
          @click="openPreview()"
        >
          预览
        </el-button>
        <el-button
          v-if="open && count > 0"
          size="small"
          text
          type="danger"
          @click="onClearAll"
        >
          清空
        </el-button>
      </div>
    </div>

    <div v-if="open" class="mm-wrong__panel">
      <div class="mm-wrong__tabs">
        <button
          type="button"
          class="mm-wrong__tab"
          :class="{ 'is-active': bookTab === 'wrong' }"
          @click="bookTab = 'wrong'"
        >
          错题（{{ wrongCount }}）
        </button>
        <button
          type="button"
          class="mm-wrong__tab"
          :class="{ 'is-active': bookTab === 'favorite' }"
          @click="bookTab = 'favorite'"
        >
          收藏（{{ favoriteCount }}）
        </button>
      </div>
      <p v-if="!count" class="mm-wrong__empty">
        {{
          bookTab === 'wrong'
            ? '暂无错题。练习时答错会自动记入；也可在详情里加入收藏。'
            : '暂无收藏。可在错题详情或练习提交后点「收藏」。'
        }}
      </p>
      <ul v-else class="mm-wrong__list">
        <li v-for="row in filteredRows" :key="row.fingerprint" class="mm-wrong__row">
          <button type="button" class="mm-wrong__body" @click="openDetail(row)">
            <p class="mm-wrong__expr">{{ row.expression }}</p>
            <p class="mm-wrong__meta">
              <template v-if="isWrongRow(row)">
                错 {{ row.wrongCount }} 次
                <template v-if="formatTime(row.updatedAt)"> · {{ formatTime(row.updatedAt) }}</template>
              </template>
              <template v-else>
                收藏
                <template v-if="formatTime(row.savedAt)"> · {{ formatTime(row.savedAt) }}</template>
              </template>
              <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
              · 点看详情
            </p>
          </button>
          <el-button size="small" text type="danger" @click="onRemove(row.fingerprint)">
            删除
          </el-button>
        </li>
      </ul>
    </div>

    <div class="mm-wrong__footer-stat">
      <WrongBookReviewStat :scope="reviewScope" />
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="`${title} · ${bookTab === 'wrong' ? '错题' : '收藏'}详情`"
      width="560px"
      align-center
      destroy-on-close
      append-to-body
      :z-index="workspaceOpen ? 4300 : 2100"
      @closed="onDetailClosed"
    >
      <div v-if="detail" class="mm-wrong-detail">
        <section>
          <h4>题目</h4>
          <p class="mm-wrong-detail__expr">{{ detail.expression }}</p>
        </section>
        <section v-if="isWrongRow(detail)">
          <h4>你的答案</h4>
          <p class="mm-wrong-detail__bad">{{ detail.chosenAnswer }}</p>
        </section>
        <section>
          <h4>正确答案</h4>
          <p class="mm-wrong-detail__ok">{{ detail.correctAnswer }}</p>
        </section>
        <section v-if="detail.options?.length">
          <h4>选项</h4>
          <ul class="mm-wrong-detail__opts">
            <li
              v-for="(opt, idx) in detail.options"
              :key="idx"
              :class="{ 'is-correct': String(opt) === detail.correctAnswer }"
            >
              {{ opt }}
            </li>
          </ul>
        </section>
        <section v-if="detail.explanation">
          <h4>说明</h4>
          <p class="mm-wrong-detail__exp">{{ detail.explanation }}</p>
        </section>
        <section class="mm-wrong-detail__note">
          <div class="mm-wrong-detail__note-head">
            <h4>备注</h4>
            <el-button
              v-if="!noteEditing"
              size="small"
              text
              type="primary"
              @click="onEditNote"
            >
              {{ rowNote(detail.fingerprint) ? '编辑' : '添加备注' }}
            </el-button>
          </div>
          <template v-if="noteEditing">
            <el-input
              v-model="noteDraft"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              placeholder="支持 Markdown，如标题、列表、加粗等"
            />
            <div class="mm-wrong-detail__note-actions">
              <el-button
                size="small"
                type="primary"
                :loading="noteSaving"
                @click="onSaveNote(detail.fingerprint)"
              >
                保存
              </el-button>
              <el-button size="small" plain @click="onCancelNoteEdit">取消</el-button>
            </div>
          </template>
          <template v-else-if="rowNote(detail.fingerprint)">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="mm-wrong-detail__note-md deepseek-md" v-html="noteHtml(detail.fingerprint)" />
          </template>
          <p v-else class="mm-wrong-detail__note-empty">暂无备注</p>
        </section>
      </div>
      <template #footer>
        <el-button
          v-if="detail"
          type="primary"
          plain
          @click="detail && onToggleFavoriteRow(detail)"
        >
          {{ detail && rowFavorited(detail.fingerprint) ? '取消收藏' : '收藏' }}
        </el-button>
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
          @click="detail && onRemove(detail.fingerprint)"
        >
          删除本题
        </el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <WrongBookImmersivePreview
      v-model:open="previewOpen"
      v-model:index="previewIndex"
      :title="title"
      :items="previewItems"
      @save-note="onPreviewSaveNote"
      @delete="onRemove"
    />

    <!-- 沉浸错题本：筛选 + 列表 + 分批测验 -->
    <Teleport to="body">
      <div
        v-if="workspaceOpen"
        class="wb-workspace"
        role="dialog"
        aria-modal="true"
        :aria-label="`${title} · 错题本`"
      >
        <div class="wb-workspace__panel play-panel">
          <div class="play-top">
            <div class="play-meta">
              <div class="play-meta__main">
                <span class="play-mode">{{ title }} · {{ bookTab === 'wrong' ? '错题' : '收藏' }}</span>
                <span class="play-score">
                  共 <strong>{{ filteredRows.length }}</strong> / {{ count }} 题
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

          <!-- 测验中 -->
          <template v-if="quizPhase === 'playing' && currentQuiz">
            <p class="wb-quiz__progress">
              第 {{ quizBatchIndex + 1 }} 组 · 第 {{ quizCursor + 1 }} / {{ quizTotal }} 题
              <span v-if="currentQuiz.isVariant" class="wb-quiz__tag">变式</span>
            </p>
            <div class="question-block">
              <p
                class="question-expression"
                :class="{
                  'question-expression--prose':
                    currentQuiz.expression.length > 48 || currentQuiz.expression.includes('\n'),
                }"
              >
                {{ currentQuiz.expression }}
              </p>
            </div>

            <ul v-if="currentQuiz.kind === 'mcq'" class="option-list">
              <li v-for="(opt, idx) in currentQuiz.options" :key="idx">
                <button
                  type="button"
                  class="option-btn"
                  :class="{
                    'is-selected': quizChoice === idx,
                    'is-correct': quizRevealed && idx === currentQuiz.correctIndex,
                    'is-wrong':
                      quizRevealed && quizChoice === idx && idx !== currentQuiz.correctIndex,
                  }"
                  :disabled="quizRevealed"
                  @click="quizChoice = idx"
                >
                  <span class="option-key">{{ String.fromCharCode(65 + idx) }}</span>
                  <span>{{ opt }}</span>
                </button>
              </li>
            </ul>
            <div v-else class="wb-quiz__fill">
              <el-input
                v-model="quizFill"
                placeholder="输入答案"
                :disabled="quizRevealed"
                @keyup.enter="submitQuizAnswer"
              />
              <p v-if="quizRevealed" class="wb-quiz__fill-ans">
                正确答案：{{ currentQuiz.fillAnswer }}
              </p>
            </div>

            <p v-if="quizRevealed && currentQuiz.explanation" class="wb-quiz__exp">
              {{ currentQuiz.explanation }}
            </p>

            <div class="wb-quiz__actions">
              <el-button v-if="!quizRevealed" type="primary" @click="submitQuizAnswer">
                提交
              </el-button>
              <el-button v-else type="primary" @click="nextQuizQuestion">
                {{ quizCursor + 1 >= quizTotal ? '查看结果' : '下一题' }}
              </el-button>
              <el-button plain @click="exitQuiz">结束测验</el-button>
            </div>
          </template>

          <!-- 测验结果 -->
          <template v-else-if="quizPhase === 'result'">
            <div class="wb-quiz__result">
              <p class="wb-quiz__result-title">本组成绩</p>
              <p class="wb-quiz__result-score">
                {{ quizCorrectCount }} / {{ quizTotal }}
              </p>
              <div class="wb-quiz__actions">
                <el-button type="primary" @click="startBatchQuiz(quizBatchIndex)">
                  再练本组
                </el-button>
                <el-button plain @click="exitQuiz">返回错题本</el-button>
              </div>
            </div>
          </template>

          <!-- 筛选 + 列表 + 分批 -->
          <template v-else>
            <div class="mm-wrong__tabs wb-workspace__tabs">
              <button
                type="button"
                class="mm-wrong__tab"
                :class="{ 'is-active': bookTab === 'wrong' }"
                @click="bookTab = 'wrong'"
              >
                错题（{{ wrongCount }}）
              </button>
              <button
                type="button"
                class="mm-wrong__tab"
                :class="{ 'is-active': bookTab === 'favorite' }"
                @click="bookTab = 'favorite'"
              >
                收藏（{{ favoriteCount }}）
              </button>
            </div>

            <form class="wb-filter" @submit.prevent>
              <label v-if="bookTab === 'wrong'" class="wb-filter__field">
                <span>错题次数</span>
                <el-select
                  v-model="filterWrongCount"
                  clearable
                  placeholder="不限"
                  style="width: 120px"
                >
                  <el-option
                    v-for="n in wrongCountFilterOptions"
                    :key="n"
                    :label="`${n} 次`"
                    :value="n"
                  />
                </el-select>
              </label>
              <label class="wb-filter__field">
                <span>{{ bookTab === 'wrong' ? '错题日期' : '收藏日期' }}</span>
                <el-select
                  v-model="filterDate"
                  clearable
                  placeholder="不限"
                  style="width: 150px"
                >
                  <el-option
                    v-for="d in dateFilterOptions"
                    :key="d"
                    :label="d"
                    :value="d"
                  />
                </el-select>
              </label>
              <el-button size="small" plain @click="resetFilters">重置</el-button>
            </form>

            <section v-if="quizBatches.length" class="wb-batches">
              <p class="wb-batches__label">
                分批测验（每组最多 {{ WRONG_BOOK_BATCH_SIZE }} 题，优先 AI 变式；收藏库答错不记入错题）
              </p>
              <div class="wb-batches__btns">
                <el-button
                  v-for="b in quizBatches"
                  :key="b.index"
                  size="small"
                  type="primary"
                  plain
                  :loading="quizLoading"
                  :disabled="quizLoading"
                  @click="startBatchQuiz(b.index)"
                >
                  第 {{ b.index + 1 }} 组（{{ b.from }}–{{ b.to }}）
                </el-button>
              </div>
              <p v-if="quizProgress" class="wb-batches__progress">{{ quizProgress }}</p>
            </section>

            <p v-if="!filteredRows.length" class="mm-wrong__empty wb-workspace__empty">
              {{ count ? '当前筛选下没有题目' : bookTab === 'wrong' ? '暂无错题' : '暂无收藏' }}
            </p>
            <ul v-else class="mm-wrong__list wb-workspace__list">
              <li
                v-for="row in filteredRows"
                :key="row.fingerprint"
                class="mm-wrong__row"
              >
                <button type="button" class="mm-wrong__body" @click="openDetail(row)">
                  <p class="mm-wrong__expr">{{ row.expression }}</p>
                  <p class="mm-wrong__meta">
                    <template v-if="isWrongRow(row)">
                      错 {{ row.wrongCount }} 次
                      <template v-if="formatTime(row.updatedAt)">
                        · {{ formatTime(row.updatedAt) }}
                      </template>
                    </template>
                    <template v-else>
                      收藏
                      <template v-if="formatTime(row.savedAt)">
                        · {{ formatTime(row.savedAt) }}
                      </template>
                    </template>
                    <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
                  </p>
                </button>
                <el-button size="small" text type="danger" @click="onRemove(row.fingerprint)">
                  删除
                </el-button>
              </li>
            </ul>
            <div class="wb-workspace__footer-stat">
              <WrongBookReviewStat :scope="reviewScope" />
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.mm-wrong {
  margin-top: 12px;
}

.mm-wrong__bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-wrong__bar-actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.mm-wrong__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 999px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.mm-wrong__toggle strong {
  min-width: 1.2em;
  color: var(--el-color-danger);
}

.mm-wrong__fav-count {
  font-size: 12px;
  font-weight: 700;
  color: #a16207;
}

.mm-wrong__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px 0;
}

.wb-workspace__tabs {
  padding: 0 0 10px;
}

.mm-wrong__tab {
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 999px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.mm-wrong__tab.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.mm-wrong__chevron {
  display: inline-block;
  transition: transform 0.15s ease;
  opacity: 0.7;
}

.mm-wrong__chevron.is-open {
  transform: rotate(-180deg);
}

.mm-wrong__panel {
  margin-top: 10px;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  overflow: hidden;
  background: var(--app-surface);
}

.mm-wrong__footer-stat,
.wb-workspace__footer-stat {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px 4px;
}

.wb-workspace__footer-stat {
  margin-top: 12px;
  padding: 12px 0 0;
  border-top: 1px solid var(--app-border-soft);
}

.mm-wrong__empty {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--app-text-muted);
  line-height: 1.5;
}

.mm-wrong__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
}

.mm-wrong__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border-soft);
}

.mm-wrong__row:last-child {
  border-bottom: none;
}

.mm-wrong__body {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.mm-wrong__expr {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
}

.mm-wrong__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.mm-wrong-detail {
  display: grid;
  gap: 14px;
}

.mm-wrong-detail h4 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.mm-wrong-detail__expr,
.mm-wrong-detail__ok,
.mm-wrong-detail__bad,
.mm-wrong-detail__exp {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-word;
}

.mm-wrong-detail__ok {
  color: var(--el-color-success);
  font-weight: 700;
}

.mm-wrong-detail__bad {
  color: var(--el-color-danger);
}

.mm-wrong-detail__opts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.mm-wrong-detail__opts li {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft);
  font-size: 13px;
}

.mm-wrong-detail__opts li.is-correct {
  border-color: var(--el-color-success);
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 55%, transparent);
}

.mm-wrong-detail__note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mm-wrong-detail__note-head h4 {
  margin: 0;
}

.mm-wrong-detail__note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.mm-wrong-detail__note-md {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.mm-wrong-detail__note-empty {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
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
  border: 1px solid var(--app-border-soft);
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
  color: var(--app-text-muted);
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
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
}

.wb-filter__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
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

.wb-batches__progress {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.wb-workspace__list {
  max-height: none;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  overflow: hidden;
}

.wb-workspace__empty {
  border: 1px dashed var(--app-border-soft);
  border-radius: 10px;
}

.question-block {
  margin: 12px 0 18px;
}

.question-expression {
  margin: 0;
  font-size: clamp(1.25rem, 3.2vw, 1.75rem);
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
  white-space: pre-line;
  word-break: break-word;
}

.question-expression--prose {
  font-size: clamp(1.05rem, 2.8vw, 1.35rem);
  font-weight: 650;
  text-align: left;
}

.option-list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: grid;
  gap: 10px;
}

.option-btn {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.option-btn.is-selected {
  border-color: var(--el-color-primary);
}

.option-btn.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 55%, transparent);
}

.option-btn.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 40%, transparent);
}

.option-key {
  flex-shrink: 0;
  width: 1.5em;
  font-weight: 700;
  color: var(--app-text-muted);
}

.wb-quiz__progress {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.wb-quiz__tag {
  margin-left: 8px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
}

.wb-quiz__fill {
  margin-bottom: 14px;
}

.wb-quiz__fill-ans {
  margin: 8px 0 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-color-success);
}

.wb-quiz__exp {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--app-surface-alt);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-line;
}

.wb-quiz__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wb-quiz__result {
  text-align: center;
  padding: 32px 12px;
}

.wb-quiz__result-title {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--app-text-muted);
}

.wb-quiz__result-score {
  margin: 0 0 20px;
  font-size: 2rem;
  font-weight: 800;
  color: var(--el-color-primary);
}

.wb-quiz__result .wb-quiz__actions {
  justify-content: center;
}
</style>
