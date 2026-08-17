<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Document, DocumentAdd, Edit, Folder, FolderOpened, Plus } from '@element-plus/icons-vue'
import {
  createComputerItem,
  createComputerNode,
  defaultExpandedComputerIds,
  deleteComputerItem,
  deleteComputerNode,
  flattenVisibleComputerRows,
  loadComputerBasicsTree,
  renameComputerNode,
  type ComputerTreeEntry,
  type ComputerTreeNode,
} from '@/utils/computerBasics'
import { isWenguAdmin, wenguAuthTick } from '@/utils/wenguAuthStore'
import ComputerCategoryMapDialog from './ComputerCategoryMapDialog.vue'

const router = useRouter()
const tree = ref<ComputerTreeNode[]>([])
const loading = ref(true)
const error = ref('')
const expanded = ref<Record<string, boolean>>({})
const mapOpen = ref(false)

const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

const rows = computed(() => flattenVisibleComputerRows(tree.value, expanded.value))

function toggle(id: string, expandable: boolean) {
  if (!expandable) return
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function openEntry(entry: ComputerTreeEntry, edit = false) {
  if (!entry.ready) {
    ElMessage.info('该小节即将开放')
    return
  }
  openComputerItem(entry.id, edit)
}

function openComputerItem(itemId: string, edit = false) {
  const loc = { name: 'computer-item' as const, params: { itemId } }
  void router.push(loc).then(() => {
    if (!edit) return
    void router.push({ ...loc, query: { edit: '1' } })
  })
}

async function promptName(title: string, initial = '') {
  const { value } = await ElMessageBox.prompt('请输入名称', title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: initial,
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空',
  })
  return String(value ?? '').trim()
}

async function reloadKeepExpand() {
  const keep = { ...expanded.value }
  const next = await loadComputerBasicsTree(true)
  tree.value = next
  expanded.value = { ...defaultExpandedComputerIds(next), ...keep }
}

async function onAddRoot() {
  try {
    const name = await promptName('新增大类')
    await createComputerNode({ name })
    await reloadKeepExpand()
    ElMessage.success('已新增大类')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onAddChild(parentId: string) {
  try {
    const name = await promptName('新增小类')
    await createComputerNode({ name, parentId })
    expanded.value = { ...expanded.value, [parentId]: true }
    await reloadKeepExpand()
    ElMessage.success('已新增小类')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onAddItem(parentId: string) {
  try {
    const title = await promptName('新增讲义')
    const item = await createComputerItem({ parentId, title, content: `# ${title}\n` })
    expanded.value = { ...expanded.value, [parentId]: true }
    await reloadKeepExpand()
    ElMessage.success('已新增讲义')
    openComputerItem(item.id, true)
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onRenameNode(id: string, current: string) {
  try {
    const name = await promptName('编辑分类', current)
    await renameComputerNode(id, name)
    await reloadKeepExpand()
    ElMessage.success('已保存')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function onDeleteNode(id: string, name: string) {
  try {
    await ElMessageBox.confirm(`确定删除分类「${name}」及其下属内容？`, '删除分类', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteComputerNode(id)
    await reloadKeepExpand()
    ElMessage.success('已删除')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

async function onDeleteEntry(entry: ComputerTreeEntry) {
  try {
    await ElMessageBox.confirm(`确定删除「${entry.title}」？`, '删除讲义', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteComputerItem(entry.id)
    await reloadKeepExpand()
    ElMessage.success('已删除')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

function isPromptCancel(e: unknown) {
  return e === 'cancel' || e === 'close' || (typeof e === 'string' && e.toLowerCase().includes('cancel'))
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const next = await loadComputerBasicsTree(true)
    tree.value = next
    expanded.value = defaultExpandedComputerIds(next)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '读取目录失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="computer-page">
    <header class="computer-page__head">
      <div class="computer-page__title-row">
        <h2 class="computer-page__title">计算机基础</h2>
        <el-button size="small" @click="mapOpen = true">查看分布</el-button>
        <el-tooltip v-if="isAdmin" content="新增大类" placement="top">
          <el-button size="small" type="primary" circle :icon="Plus" @click="onAddRoot" />
        </el-tooltip>
      </div>
      <p class="computer-page__lead">
        分类是树形结构，大类下可叠多层小类。内容从本机 Node 读取（插图按文件存放）。
      </p>
    </header>

    <div class="computer-tree-card">
      <div class="computer-tree-head">名称</div>
      <p v-if="loading" class="computer-tree__status">正在从 Node 读取目录…</p>
      <p v-else-if="error" class="computer-tree__status computer-tree__status--error">
        {{ error }}
        <el-button size="small" @click="load">重试</el-button>
      </p>
      <ul v-else class="computer-tree" role="tree">
        <li
          v-for="row in rows"
          :key="`${row.kind}-${row.id}`"
          class="computer-tree__row"
          :class="row.kind === 'branch' ? 'computer-tree__row--branch' : 'computer-tree__row--leaf'"
          :style="{ '--tree-depth': row.depth }"
          role="treeitem"
          :aria-expanded="row.kind === 'branch' ? Boolean(expanded[row.id]) : undefined"
        >
          <div class="computer-tree__line" :class="{ 'is-admin': isAdmin }">
            <button
              v-if="row.kind === 'branch'"
              type="button"
              class="computer-tree__toggle"
              :class="{ 'is-root': row.depth === 0, 'is-open': expanded[row.id] }"
              :disabled="!row.expandable"
              @click="toggle(row.id, row.expandable)"
            >
              <span
                class="computer-tree__caret"
                :class="{ 'is-open': expanded[row.id], 'is-empty': !row.expandable }"
              >
                {{ row.expandable ? '▼' : '·' }}
              </span>
              <el-icon class="computer-tree__kind" :size="16">
                <FolderOpened v-if="expanded[row.id]" />
                <Folder v-else />
              </el-icon>
              <span class="computer-tree__name">{{ row.name }}</span>
              <span v-if="!row.expandable && !isAdmin" class="computer-tree__soon">即将开放</span>
            </button>
            <button
              v-else
              type="button"
              class="computer-tree__leaf"
              :class="{ 'is-ready': row.entry.ready }"
              @click="openEntry(row.entry)"
            >
              <el-icon class="computer-tree__kind computer-tree__kind--doc" :size="16">
                <Document />
              </el-icon>
              <span class="computer-tree__leaf-title">{{ row.entry.title }}</span>
              <span v-if="!row.entry.ready && !isAdmin" class="computer-tree__soon">即将开放</span>
            </button>
            <span v-if="isAdmin && row.kind === 'branch'" class="computer-tree__admin">
              <el-tooltip content="新增小类" placement="top">
                <button type="button" class="computer-tree__icon" aria-label="新增小类" @click.stop="onAddChild(row.id)">
                  <el-icon :size="16"><Plus /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="新增讲义" placement="top">
                <button type="button" class="computer-tree__icon" aria-label="新增讲义" @click.stop="onAddItem(row.id)">
                  <el-icon :size="16"><DocumentAdd /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="编辑分类" placement="top">
                <button type="button" class="computer-tree__icon" aria-label="编辑分类" @click.stop="onRenameNode(row.id, row.name)">
                  <el-icon :size="16"><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="删除分类" placement="top">
                <button type="button" class="computer-tree__icon is-danger" aria-label="删除分类" @click.stop="onDeleteNode(row.id, row.name)">
                  <el-icon :size="16"><Delete /></el-icon>
                </button>
              </el-tooltip>
            </span>
            <span v-else-if="isAdmin && row.kind === 'entry'" class="computer-tree__admin">
              <el-tooltip content="编辑讲义" placement="top">
                <button type="button" class="computer-tree__icon" aria-label="编辑讲义" @click.stop="openEntry(row.entry, true)">
                  <el-icon :size="16"><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="删除讲义" placement="top">
                <button type="button" class="computer-tree__icon is-danger" aria-label="删除讲义" @click.stop="onDeleteEntry(row.entry)">
                  <el-icon :size="16"><Delete /></el-icon>
                </button>
              </el-tooltip>
            </span>
          </div>
        </li>
      </ul>
    </div>
    <ComputerCategoryMapDialog v-model="mapOpen" :tree="tree" />
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

.computer-page__head {
  flex-shrink: 0;
  margin-bottom: 14px;
}

.computer-page__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.computer-page__title {
  margin: 0;
  margin-right: auto;
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
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.computer-tree-head {
  flex-shrink: 0;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-muted);
  background: color-mix(in srgb, var(--app-primary-soft) 55%, #fff);
  border-bottom: 1px solid var(--app-border-soft);
}

.computer-tree__status {
  margin: 0;
  padding: 16px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.computer-tree__status--error {
  color: var(--app-danger);
}

.computer-tree {
  flex: 1 1 0;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: hidden;
  overflow-y: auto;
}

.computer-tree__row {
  border-bottom: 1px solid color-mix(in srgb, var(--app-border-soft) 80%, transparent);
}

.computer-tree__line {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.computer-tree__toggle,
.computer-tree__leaf {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 10px 14px 10px calc(14px + var(--tree-depth, 0) * 20px);
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.computer-tree__line.is-admin .computer-tree__toggle,
.computer-tree__line.is-admin .computer-tree__leaf {
  padding-right: 7.5rem;
}

.computer-tree__toggle.is-root {
  background: color-mix(in srgb, var(--app-primary-soft) 70%, #fff);
  font-weight: 700;
}

.computer-tree__toggle.is-open:not(.is-root) {
  background: color-mix(in srgb, var(--app-primary-soft) 28%, #fff);
}

.computer-tree__toggle:disabled {
  cursor: default;
}

.computer-tree__name {
  font-weight: 700;
}

.computer-tree__caret {
  flex-shrink: 0;
  width: 1em;
  font-size: 0.72em;
  color: var(--app-text-muted);
  transform: rotate(-90deg);
  transition: transform 0.15s ease;
}

.computer-tree__caret.is-open,
.computer-tree__caret.is-empty {
  transform: none;
}

.computer-tree__caret.is-empty {
  opacity: 0.55;
  font-size: 1em;
}

.computer-tree__kind {
  flex-shrink: 0;
  color: #d97706;
}

.computer-tree__kind--doc {
  color: var(--app-primary);
}

.computer-tree__leaf-title {
  min-width: 0;
}

.computer-tree__leaf.is-ready .computer-tree__leaf-title {
  color: var(--app-text);
}

.computer-tree__toggle,
.computer-tree__leaf {
  transition: background-color 0.12s ease;
}

.computer-tree__row:hover .computer-tree__toggle,
.computer-tree__row:hover .computer-tree__leaf {
  background: color-mix(in srgb, var(--app-primary-soft) 55%, #fff);
}

.computer-tree__row:hover .computer-tree__toggle.is-root {
  background: color-mix(in srgb, var(--app-primary-soft) 88%, #fff);
}

.computer-tree__soon {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.computer-tree__admin {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-surface) 92%, #fff);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.12s ease;
}

.computer-tree__row:hover .computer-tree__admin {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.computer-tree__icon {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--app-primary);
  cursor: pointer;
}

.computer-tree__icon:hover {
  background: color-mix(in srgb, var(--app-primary-soft) 80%, #fff);
}

.computer-tree__icon.is-danger {
  color: var(--app-danger);
}

.computer-tree__icon.is-danger:hover {
  background: #fee2e2;
}
</style>
