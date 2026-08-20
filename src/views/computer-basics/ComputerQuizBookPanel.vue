<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight, Document, Folder, FolderOpened } from '@element-plus/icons-vue'
import {
  computerQuizBookTick,
  listComputerQuizFavoriteRecords,
  listComputerQuizWrongRecords,
  removeComputerQuizFavorite,
  removeComputerQuizWrong,
  type StoredComputerQuizRecord,
} from '@/utils/computer/computerHandoutQuizStorage'
import {
  getComputerQuizNote,
  removeComputerQuizNote,
  setComputerQuizNote,
} from '@/utils/computer/computerHandoutQuizNotes'
import {
  computerQuizKindLabel,
  sanitizeComputerQuizForDisplay,
} from '@/utils/computer/computerHandoutQuiz'
import {
  buildComputerQuizBookTree,
  collectComputerQuizBookRecords,
  computerQuizRecordDateKey,
  defaultExpandedQuizBookIds,
  filterComputerQuizBookRecords,
  findComputerQuizBookNode,
  flattenComputerQuizBookRows,
  type ComputerQuizBookTreeNode,
} from '@/utils/computer/computerQuizBookTree'
import { loadComputerBasicsTree, type ComputerTreeNode } from '@/utils/computer/computerBasics'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import RichTextView from '@/components/RichTextView.vue'

const tab = ref<'wrong' | 'favorite'>('wrong')
const catalog = ref<ComputerTreeNode[]>([])
const expanded = ref<Record<string, boolean>>({})
const selectedId = ref('')
const openFp = ref('')
const filterWrongCount = ref<number | undefined>()
const filterDate = ref<string | undefined>()
const noteDraft = ref('')
const noteEditing = ref(false)
const noteSaving = ref(false)

const wrongs = computed(() => {
  void computerQuizBookTick.value
  return listComputerQuizWrongRecords()
})
const favs = computed(() => {
  void computerQuizBookTick.value
  return listComputerQuizFavoriteRecords()
})
const sourceRows = computed(() => (tab.value === 'wrong' ? wrongs.value : favs.value))

const bookTree = computed(() => buildComputerQuizBookTree(catalog.value, sourceRows.value))

const treeRows = computed(() => flattenComputerQuizBookRows(bookTree.value, expanded.value))

const selectedNode = computed((): ComputerQuizBookTreeNode | null => {
  if (!selectedId.value) return null
  return findComputerQuizBookNode(bookTree.value, selectedId.value)
})

const scopedRows = computed(() => {
  if (selectedNode.value) return collectComputerQuizBookRecords(selectedNode.value)
  return sourceRows.value
})

const dateOptions = computed(() => {
  const set = new Set<string>()
  for (const row of scopedRows.value) {
    const d = computerQuizRecordDateKey(row)
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
  filterComputerQuizBookRecords(scopedRows.value, {
    wrongCount: tab.value === 'wrong' ? filterWrongCount.value : undefined,
    dateKey: filterDate.value,
  }),
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

function toggle(id: string, expandable: boolean) {
  if (!expandable) {
    selectedId.value = id
    openFp.value = ''
    resetNoteEdit()
    return
  }
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function selectNode(id: string) {
  selectedId.value = selectedId.value === id ? '' : id
  openFp.value = ''
  resetNoteEdit()
}

function clearSelected() {
  selectedId.value = ''
  openFp.value = ''
  resetNoteEdit()
}

function toggleOpen(fp: string) {
  openFp.value = openFp.value === fp ? '' : fp
  resetNoteEdit()
  if (openFp.value) noteDraft.value = getComputerQuizNote(fp)
}

function stillKept(fp: string) {
  return (
    listComputerQuizWrongRecords().some((r) => r.fingerprint === fp) ||
    listComputerQuizFavoriteRecords().some((r) => r.fingerprint === fp)
  )
}

function remove(row: StoredComputerQuizRecord) {
  const fp = row.fingerprint
  if (tab.value === 'wrong') removeComputerQuizWrong(fp)
  else removeComputerQuizFavorite(fp)
  if (!stillKept(fp)) removeComputerQuizNote(fp)
  if (openFp.value === fp) {
    openFp.value = ''
    resetNoteEdit()
  }
}

function rowNote(fp: string): string {
  return getComputerQuizNote(fp)
}

function noteHtml(fp: string): string {
  const note = rowNote(fp)
  return note ? markdownToDisplaySafeHtml(note) : ''
}

function onEditNote(fp: string) {
  noteDraft.value = getComputerQuizNote(fp)
  noteEditing.value = true
}

function onCancelNoteEdit(fp: string) {
  noteDraft.value = getComputerQuizNote(fp)
  noteEditing.value = false
}

function onSaveNote(fp: string) {
  noteSaving.value = true
  try {
    setComputerQuizNote(fp, noteDraft.value)
    noteEditing.value = false
    ElMessage.success(noteDraft.value.trim() ? '备注已保存' : '已清空备注')
  } finally {
    noteSaving.value = false
  }
}

function displayOf(row: StoredComputerQuizRecord) {
  return sanitizeComputerQuizForDisplay(row)
}

function rowPath(row: StoredComputerQuizRecord) {
  return [...(row.learningPath ?? []), row.itemTitle].filter(Boolean).join(' / ')
}

watch(tab, () => {
  resetFilters()
  openFp.value = ''
  resetNoteEdit()
})

watch(bookTree, (nodes) => {
  const ids = new Set<string>()
  const walk = (list: ComputerQuizBookTreeNode[]) => {
    for (const n of list) {
      ids.add(n.id)
      walk(n.children)
    }
  }
  walk(nodes)
  if (selectedId.value && !ids.has(selectedId.value)) selectedId.value = ''
  const next = { ...expanded.value }
  for (const id of Object.keys(next)) {
    if (!ids.has(id)) delete next[id]
  }
  expanded.value = { ...defaultExpandedQuizBookIds(nodes), ...next }
})

onMounted(async () => {
  try {
    catalog.value = await loadComputerBasicsTree()
  } catch {
    catalog.value = []
  }
})
</script>

<template>
  <section class="cb-book">
    <div class="cb-book__tabs">
      <el-radio-group v-model="tab" size="small">
        <el-radio-button value="wrong">错题 {{ wrongs.length }}</el-radio-button>
        <el-radio-button value="favorite">收藏 {{ favs.length }}</el-radio-button>
      </el-radio-group>
    </div>

    <p v-if="!sourceRows.length" class="cb-book__empty">
      暂无记录。在目录或讲义里点「AI测验」作答后会出现在这里。
    </p>
    <template v-else>
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
      </form>
      <p class="cb-book__meta">
        {{ selectedNode ? `「${selectedNode.name}」${filteredRows.length}` : `全部 ${filteredRows.length}` }} 题
        <template v-if="filteredRows.length !== scopedRows.length">
          / {{ scopedRows.length }}
        </template>
        <button v-if="selectedId" type="button" class="cb-book__all" @click="clearSelected">全部分类</button>
      </p>

      <ul v-if="treeRows.length" class="cb-book-tree" role="tree">
        <li v-for="row in treeRows" :key="row.id" class="cb-book-tree__row">
          <div
            class="cb-book-tree__main"
            :class="{ 'is-on': selectedId === row.id, 'is-root': row.depth === 0 }"
            :style="{ '--tree-depth': row.depth }"
          >
            <button
              v-if="row.expandable"
              type="button"
              class="cb-book-tree__caret"
              :class="{ 'is-open': expanded[row.id] }"
              :aria-label="expanded[row.id] ? '折叠' : '展开'"
              @click.stop="toggle(row.id, true)"
            >
              <el-icon :size="12"><ArrowRight /></el-icon>
            </button>
            <span v-else class="cb-book-tree__caret is-ghost" aria-hidden="true">
              <el-icon :size="12"><ArrowRight /></el-icon>
            </span>
            <button type="button" class="cb-book-tree__name" @click="selectNode(row.id)">
              <el-icon :size="16">
                <FolderOpened v-if="row.kind === 'branch' && expanded[row.id]" />
                <Folder v-else-if="row.kind === 'branch'" />
                <Document v-else />
              </el-icon>
              <span>{{ row.name }}</span>
              <span class="cb-book-tree__count">{{ row.totalCount }}</span>
            </button>
          </div>
        </li>
      </ul>

      <p v-if="!filteredRows.length" class="cb-book__empty">当前分类或筛选下没有题目</p>
      <ul v-else class="cb-book__list">
        <li v-for="row in filteredRows" :key="row.fingerprint">
          <button type="button" class="cb-book__row" @click="toggleOpen(row.fingerprint)">
            <span class="cb-book__kind">{{ computerQuizKindLabel(row.kind) }}</span>
            <span class="cb-book__main">
              <span class="cb-book__title">{{ displayOf(row).term || displayOf(row).stem }}</span>
              <span class="cb-book__sub">
                {{ rowPath(row) || '未分类' }}
                ·
                <template v-if="tab === 'wrong'">错 {{ row.wrongCount ?? 1 }} 次</template>
                <template v-else>收藏</template>
                · {{ computerQuizRecordDateKey(row) || '—' }}
                <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
              </span>
            </span>
          </button>
          <div v-if="openFp === row.fingerprint" class="cb-book__detail">
            <p class="cb-book__from">{{ rowPath(row) }}</p>
            <RichTextView :html="displayOf(row).stem" />
            <ul v-if="row.options.length" class="cb-book__opts">
              <li
                v-for="(opt, i) in displayOf(row).options"
                :key="i"
                :class="{ 'is-ans': i === row.correctIndex }"
              >
                {{ opt }}
              </li>
            </ul>
            <p>答案：{{ displayOf(row).correctText }}</p>
            <RichTextView v-if="displayOf(row).explanation" :html="displayOf(row).explanation" />
            <div class="cb-book__note">
              <div class="cb-book__note-head">
                <strong>备注</strong>
                <el-button
                  v-if="!noteEditing"
                  size="small"
                  text
                  type="primary"
                  @click="onEditNote(row.fingerprint)"
                >
                  {{ rowNote(row.fingerprint) ? '编辑' : '添加备注' }}
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
                    @click="onSaveNote(row.fingerprint)"
                  >
                    保存
                  </el-button>
                  <el-button size="small" plain @click="onCancelNoteEdit(row.fingerprint)">
                    取消
                  </el-button>
                </div>
              </template>
              <template v-else-if="rowNote(row.fingerprint)">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="cb-book__note-md deepseek-md" v-html="noteHtml(row.fingerprint)" />
              </template>
              <p v-else class="cb-book__note-empty">暂无备注</p>
            </div>
            <el-button size="small" type="danger" plain @click="remove(row)">删除</el-button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.cb-book {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  gap: 10px;
  padding-bottom: 8px;
}

.cb-book__tabs {
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cb-book__all {
  appearance: none;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--app-primary);
  font: inherit;
  cursor: pointer;
}

.cb-book-tree {
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: #fff;
}

.cb-book-tree__main {
  display: flex;
  align-items: center;
  gap: 2px;
  min-height: 36px;
  padding: 2px 8px 2px calc(6px + var(--tree-depth, 0) * 16px);
}

.cb-book-tree__main.is-on,
.cb-book-tree__main.is-root.is-on {
  background: color-mix(in srgb, var(--app-primary-soft) 70%, #fff);
}

.cb-book-tree__main.is-root {
  background: color-mix(in srgb, var(--app-primary-soft) 28%, #fff);
}

.cb-book-tree__caret {
  appearance: none;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cb-book-tree__caret.is-open {
  transform: rotate(90deg);
  color: var(--app-primary);
}

.cb-book-tree__caret.is-ghost {
  opacity: 0.28;
  cursor: default;
}

.cb-book-tree__name {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 4px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
}

.cb-book-tree__count {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--app-primary);
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
}

.cb-book__from {
  margin: 0;
  color: var(--app-text-muted);
}

.cb-book__opts {
  margin: 0;
  padding-left: 1.2em;
}

.cb-book__opts .is-ans {
  font-weight: 700;
  color: #16a34a;
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
</style>
