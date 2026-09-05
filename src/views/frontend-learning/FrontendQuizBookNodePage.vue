<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'
import {
  frontendQuizBookTick,
  listFrontendQuizFavoriteRecords,
  listFrontendQuizWrongRecords,
  removeFrontendQuizFavorite,
  removeFrontendQuizWrong,
  type StoredFrontendQuizRecord,
} from '@/utils/frontend/frontendHandoutQuizStorage'
import {
  getFrontendQuizNote,
  removeFrontendQuizNote,
  setFrontendQuizNote,
} from '@/utils/frontend/frontendHandoutQuizNotes'
import {
  frontendQuizKindLabel,
  frontendQuizPlainText,
  sanitizeFrontendQuizForDisplay,
  type FrontendQuizQuestion,
} from '@/utils/frontend/frontendHandoutQuiz'
import {
  buildFrontendQuizBookTree,
  collectFrontendQuizBookRecords,
  frontendQuizRecordDateKey,
  filterFrontendQuizBookRecords,
  findFrontendQuizBookNode,
} from '@/utils/frontend/frontendQuizBookTree'
import { loadFrontendLearningTree, type FrontendHandoutItem, type FrontendTreeNode } from '@/utils/frontend/frontendLearning'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import RichTextView from '@/components/RichTextView.vue'
import FrontendBusyHint from './FrontendBusyHint.vue'
import FrontendQuizPanel from './FrontendQuizPanel.vue'

const route = useRoute()
const router = useRouter()
const catalog = ref<FrontendTreeNode[]>([])
const loading = ref(true)
const detailIndex = ref(-1)
const filterWrongCount = ref<number | undefined>()
const filterDate = ref<string | undefined>()
const noteDraft = ref('')
const noteEditing = ref(false)
const noteSaving = ref(false)
const quizOpen = ref(false)
const answerOpen = ref(false)

const nodeId = computed(() => String(route.query.id ?? ''))
const tab = computed<'wrong' | 'favorite'>(() => (String(route.query.tab ?? '') === 'favorite' ? 'favorite' : 'wrong'))

const wrongs = computed(() => {
  void frontendQuizBookTick.value
  return listFrontendQuizWrongRecords()
})
const favs = computed(() => {
  void frontendQuizBookTick.value
  return listFrontendQuizFavoriteRecords()
})
const sourceRows = computed(() => (tab.value === 'wrong' ? wrongs.value : favs.value))
const bookTree = computed(() => buildFrontendQuizBookTree(catalog.value, sourceRows.value))
const selectedNode = computed(() => findFrontendQuizBookNode(bookTree.value, nodeId.value))

const scopedRows = computed(() => {
  if (selectedNode.value) return collectFrontendQuizBookRecords(selectedNode.value)
  return []
})

const dateOptions = computed(() => {
  const set = new Set<string>()
  for (const row of scopedRows.value) {
    const d = frontendQuizRecordDateKey(row)
    if (d) set.add(d)
  }
  return [...set].sort().reverse()
})

const wrongCountOptions = computed(() => {
  const set = new Set<number>()
  for (const row of scopedRows.value) set.add(Math.max(1, row.wrongCount ?? 1))
  return [...set].sort((a, b) => a - b)
})

const filteredRows = computed(() =>
  filterFrontendQuizBookRecords(scopedRows.value, {
    wrongCount: tab.value === 'wrong' ? filterWrongCount.value : undefined,
    dateKey: filterDate.value,
  }),
)

const preparedQuestions = computed((): FrontendQuizQuestion[] =>
  filteredRows.value.map((row) => ({
    fingerprint: row.fingerprint,
    kind: row.kind,
    term: row.term,
    stem: row.stem,
    options: row.options,
    correctIndex: row.correctIndex,
    correctText: row.correctText,
    explanation: row.explanation,
    itemId: row.itemId,
    itemTitle: row.itemTitle,
    learningPath: row.learningPath,
  })),
)

const quizItem = computed((): FrontendHandoutItem => {
  const first = preparedQuestions.value[0]
  return {
    id: first?.itemId || `book:${nodeId.value}`,
    title: selectedNode.value?.name || '题目整理测验',
    type: 'handout',
    learningPath: first?.learningPath ?? [],
    tags: [],
    content: '',
  }
})

useAppChromeTitle(
  computed(() => (quizOpen.value ? 'AI 测验' : selectedNode.value?.name || '题目整理')),
)

function resetFilters() {
  filterWrongCount.value = undefined
  filterDate.value = undefined
}

function resetNoteEdit() {
  noteDraft.value = ''
  noteEditing.value = false
  noteSaving.value = false
}

const detailRow = computed(() => filteredRows.value[detailIndex.value] ?? null)

function rowListTitle(row: StoredFrontendQuizRecord) {
  const term = frontendQuizPlainText(row.term)
  if (term) return term
  const stem = frontendQuizPlainText(row.stem)
  return stem.length > 42 ? `${stem.slice(0, 42)}…` : stem || '题目'
}

function openDetail(index: number) {
  if (index < 0 || index >= filteredRows.value.length) {
    detailIndex.value = -1
    answerOpen.value = false
    resetNoteEdit()
    return
  }
  detailIndex.value = index
  answerOpen.value = false
  resetNoteEdit()
  noteDraft.value = getFrontendQuizNote(filteredRows.value[index]!.fingerprint)
}

function closeDetail() {
  detailIndex.value = -1
  answerOpen.value = false
  resetNoteEdit()
}

function shiftDetail(dir: -1 | 1) {
  openDetail(detailIndex.value + dir)
}

function stillKept(fp: string) {
  return (
    listFrontendQuizWrongRecords().some((r) => r.fingerprint === fp) ||
    listFrontendQuizFavoriteRecords().some((r) => r.fingerprint === fp)
  )
}

function remove(row: StoredFrontendQuizRecord) {
  const fp = row.fingerprint
  const idx = detailIndex.value
  if (tab.value === 'wrong') removeFrontendQuizWrong(fp)
  else removeFrontendQuizFavorite(fp)
  if (!stillKept(fp)) removeFrontendQuizNote(fp)
  if (detailRow.value?.fingerprint === fp) {
    if (filteredRows.value.length <= 1) closeDetail()
    else openDetail(Math.min(idx, filteredRows.value.length - 1))
  }
}

function rowNote(fp: string): string {
  return getFrontendQuizNote(fp)
}

function noteHtml(fp: string): string {
  const note = rowNote(fp)
  return note ? markdownToDisplaySafeHtml(note) : ''
}

function onEditNote(fp: string) {
  noteDraft.value = getFrontendQuizNote(fp)
  noteEditing.value = true
}

function onCancelNoteEdit(fp: string) {
  noteDraft.value = getFrontendQuizNote(fp)
  noteEditing.value = false
}

function onSaveNote(fp: string) {
  noteSaving.value = true
  try {
    setFrontendQuizNote(fp, noteDraft.value)
    noteEditing.value = false
    ElMessage.success(noteDraft.value.trim() ? '备注已保存' : '已清空备注')
  } finally {
    noteSaving.value = false
  }
}

function displayOf(row: StoredFrontendQuizRecord) {
  return sanitizeFrontendQuizForDisplay(row)
}

function rowPath(row: StoredFrontendQuizRecord) {
  return [...(row.learningPath ?? []), row.itemTitle].filter(Boolean).join(' / ')
}

function startQuiz() {
  if (!filteredRows.value.length) {
    ElMessage.warning('当前没有可测验的题目')
    return
  }
  quizOpen.value = true
}

watch(tab, () => {
  resetFilters()
  closeDetail()
  quizOpen.value = false
})

watch(nodeId, () => {
  resetFilters()
  closeDetail()
  quizOpen.value = false
})

watch(filteredRows, (rows) => {
  if (detailIndex.value < 0) return
  if (!rows.length) {
    closeDetail()
    return
  }
  if (detailIndex.value >= rows.length) openDetail(rows.length - 1)
})

onMounted(async () => {
  try {
    catalog.value = await loadFrontendLearningTree()
  } catch {
    catalog.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="computer-page" :class="{ 'is-quiz': quizOpen, 'is-detail': Boolean(detailRow) && !quizOpen }">
    <header v-if="!quizOpen && !detailRow" class="computer-page__head">
      <h2 class="computer-page__title">{{ selectedNode?.name || '题目整理' }}</h2>
      <p class="computer-page__lead">
        {{ tab === 'wrong' ? '错题' : '收藏' }} · 点「开始测验」默认测原题，可勾选变式。不入错题集，会记录测验次数。
      </p>
    </header>
    <div class="computer-tree-card" :class="{ 'is-quiz': quizOpen, 'is-detail': Boolean(detailRow) && !quizOpen }">
      <div v-if="loading" class="computer-busy-panel">
        <FrontendBusyHint text="正在读取题目…" />
      </div>
      <template v-else-if="quizOpen">
        <FrontendQuizPanel
          :item="quizItem"
          :scope-label="selectedNode?.name"
          :prepared-questions="preparedQuestions"
          skip-wrong-book
          @close="quizOpen = false"
        />
      </template>
      <template v-else-if="!selectedNode">
        <p class="cb-book__empty">没有找到该分类，可能题目已删除。</p>
        <el-button size="small" @click="router.push({ name: 'frontend-book' })">返回目录</el-button>
      </template>
      <template v-else>
        <template v-if="!detailRow">
          <form class="cb-book__filters" @submit.prevent>
            <label class="cb-book__field">
              <span>错题次数</span>
              <el-select
                v-model="filterWrongCount"
                clearable
                placeholder="不限"
                :disabled="tab !== 'wrong'"
                style="width: 7.5rem"
              >
                <el-option v-for="n in wrongCountOptions" :key="n" :label="`${n} 次`" :value="n" />
              </el-select>
            </label>
            <label class="cb-book__field">
              <span>日期</span>
              <el-select v-model="filterDate" clearable placeholder="不限" style="width: 9.5rem">
                <el-option v-for="d in dateOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </label>
            <el-button size="small" plain @click="resetFilters">重置</el-button>
            <el-button size="small" type="primary" :disabled="!filteredRows.length" @click="startQuiz">
              开始测验
            </el-button>
          </form>
          <p class="cb-book__meta">
            「{{ selectedNode.name }}」{{ filteredRows.length }} 题
            <template v-if="filteredRows.length !== scopedRows.length"> / {{ scopedRows.length }}</template>
          </p>
        </template>
        <p v-if="!filteredRows.length" class="cb-book__empty">当前分类或筛选下没有题目</p>
        <template v-else-if="detailRow">
          <div class="cb-book__pager">
            <el-button size="small" @click="closeDetail">返回列表</el-button>
            <el-button size="small" text :disabled="detailIndex <= 0" @click="shiftDetail(-1)">
              ‹ 上一题
            </el-button>
            <span>第 {{ detailIndex + 1 }} / {{ filteredRows.length }} 题</span>
            <el-button
              size="small"
              text
              :disabled="detailIndex >= filteredRows.length - 1"
              @click="shiftDetail(1)"
            >
              下一题 ›
            </el-button>
          </div>
          <div class="cb-book__detail is-page">
            <p class="cb-book__kind">{{ frontendQuizKindLabel(detailRow.kind) }}</p>
            <p class="cb-book__from">{{ rowPath(detailRow) }}</p>
            <RichTextView :html="displayOf(detailRow).stem" tone="docs" :math="false" :zoom-images="false" />
            <ul v-if="detailRow.options.length" class="cb-book__opts">
              <li
                v-for="(opt, i) in displayOf(detailRow).options"
                :key="i"
                :class="{ 'is-ans': answerOpen && i === detailRow.correctIndex }"
              >
                <RichTextView :html="opt" tone="docs" :math="false" :zoom-images="false" />
              </li>
            </ul>
            <el-button size="small" plain @click="answerOpen = !answerOpen">
              {{ answerOpen ? '收起答案' : '查看答案与解析' }}
            </el-button>
            <template v-if="answerOpen">
              <div class="cb-book__answer">
                <span>答案：</span>
                <RichTextView :html="displayOf(detailRow).correctText" tone="docs" :math="false" :zoom-images="false" />
              </div>
              <RichTextView
                v-if="displayOf(detailRow).explanation"
                :html="displayOf(detailRow).explanation"
                tone="docs"
                :math="false"
                :zoom-images="false"
              />
            </template>
            <div class="cb-book__note">
              <div class="cb-book__note-head">
                <strong>备注</strong>
                <el-button
                  v-if="!noteEditing"
                  size="small"
                  text
                  type="primary"
                  @click="onEditNote(detailRow.fingerprint)"
                >
                  {{ rowNote(detailRow.fingerprint) ? '编辑' : '添加备注' }}
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
                <div class="cb-book__note-actions">
                  <el-button
                    size="small"
                    type="primary"
                    :loading="noteSaving"
                    @click="onSaveNote(detailRow.fingerprint)"
                  >
                    保存
                  </el-button>
                  <el-button size="small" plain @click="onCancelNoteEdit(detailRow.fingerprint)">
                    取消
                  </el-button>
                </div>
              </template>
              <template v-else-if="rowNote(detailRow.fingerprint)">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="cb-book__note-md deepseek-md" v-html="noteHtml(detailRow.fingerprint)" />
              </template>
              <p v-else class="cb-book__note-empty">暂无备注</p>
            </div>
            <el-button size="small" type="danger" plain @click="remove(detailRow)">删除</el-button>
          </div>
        </template>
        <ul v-else class="cb-book__list">
          <li v-for="(row, index) in filteredRows" :key="row.fingerprint">
            <button type="button" class="cb-book__row" @click="openDetail(index)">
              <span class="cb-book__kind">{{ frontendQuizKindLabel(row.kind) }}</span>
              <span class="cb-book__main">
                <span class="cb-book__title">{{ rowListTitle(row) }}</span>
                <span class="cb-book__sub">
                  {{ rowPath(row) || '未分类' }}
                  ·
                  <template v-if="tab === 'wrong'">错 {{ row.wrongCount ?? 1 }} 次</template>
                  <template v-else>收藏</template>
                  · 测 {{ row.attemptCount ?? 0 }} 次
                  · {{ frontendQuizRecordDateKey(row) || '—' }}
                  <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
                </span>
              </span>
            </button>
          </li>
        </ul>
      </template>
    </div>
  </section>
</template>

<style scoped>
.computer-page {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 16px 12px;
}

.computer-page.is-quiz {
  padding-top: 8px;
}

.computer-page.is-detail {
  padding-top: 8px;
}

.computer-page__head {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.computer-page__title {
  margin: 0 0 6px;
  font-size: 1.28rem;
  font-weight: 800;
}

.computer-page__lead {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.computer-tree-card {
  flex: 1 1 0;
  min-height: 0;
  max-width: 52rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgb(15 23 42 / 5%);
  gap: 10px;
}

.computer-tree-card.is-quiz {
  max-width: none;
  overflow: hidden;
  padding: 8px 10px;
}

.computer-tree-card.is-detail {
  overflow: hidden;
}

.computer-busy-panel {
  flex: 1 1 0;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb-book__empty {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-book__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px 10px;
}

.cb-book__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-book__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-book__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cb-book__row {
  appearance: none;
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: flex-start;
  padding: 10px 4px;
  border: none;
  border-bottom: 1px solid var(--app-border-soft);
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.cb-book__kind {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 12px;
  color: var(--app-primary);
  font-weight: 700;
}

.cb-book__main {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.cb-book__title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.cb-book__sub {
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-book__detail {
  padding: 8px 4px 12px;
  display: grid;
  gap: 8px;
  font-size: 13px;
  min-width: 0;
  max-width: 100%;
}

.cb-book__detail.is-page {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  padding-top: 4px;
}

.cb-book__pager {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 0 10px;
  margin: 0 -4px;
  border-bottom: 1px solid var(--app-border-soft);
  background: #fff;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-book__from {
  margin: 0;
  color: var(--app-text-muted);
}

.cb-book__opts {
  margin: 0;
  padding-left: 1.2em;
}

.cb-book__opts :deep(p) {
  margin: 0;
}

.cb-book__opts .is-ans {
  font-weight: 700;
  color: #16a34a;
}

.cb-book__answer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 6px;
}

.cb-book__answer :deep(p) {
  margin: 0;
}

.cb-book__note {
  margin-top: 2px;
  padding-top: 10px;
  border-top: 1px dashed var(--app-border-soft);
  display: grid;
  gap: 8px;
}

.cb-book__note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.cb-book__note-empty {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-book__note-md {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.cb-book__note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (min-width: 901px) {
  .computer-page {
    padding: 22px 32px 20px;
  }

  .computer-page__head,
  .computer-tree-card {
    width: 100%;
    max-width: 64rem;
    margin-inline: auto;
  }

  .computer-tree-card.is-quiz {
    max-width: 72rem;
  }
}
</style>
