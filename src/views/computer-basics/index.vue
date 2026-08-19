<!--
  计算机基础：左侧树（仅三角折叠）+ 讲义详情。
  云端数据见 functions/api/computer-basics；本地缓存 public/cb-data/。
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Collection, Delete, Document, Folder, FolderOpened, MoreFilled, Plus, Share } from '@element-plus/icons-vue'
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
} from '@/utils/computer/computerBasics'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import ComputerCategoryMapDialog from './ComputerCategoryMapDialog.vue'
import ComputerQuizBookPanel from './ComputerQuizBookPanel.vue'

const router = useRouter()
const tree = ref<ComputerTreeNode[]>([])
const loading = ref(true)
const error = ref('')
const expanded = ref<Record<string, boolean>>({})
const mapOpen = ref(false)
const bookOpen = ref(false)
const adminOpenId = ref('')

const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

const rows = computed(() => flattenVisibleComputerRows(tree.value, expanded.value))

const entryCount = computed(() => {
  const walk = (nodes: typeof tree.value): number =>
    nodes.reduce((n, node) => n + node.entries.length + walk(node.children), 0)
  return walk(tree.value)
})

function toggle(id: string, expandable: boolean) {
  if (!expandable) return
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function toggleAdmin(id: string) {
  adminOpenId.value = adminOpenId.value === id ? '' : id
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
        <div class="computer-page__head-actions">
          <el-button-group>
            <el-button size="small" :icon="Share" title="查看知识分布" @click="mapOpen = true">分布</el-button>
            <el-button
              size="small"
              :icon="Collection"
              :type="bookOpen ? 'primary' : 'default'"
              :title="bookOpen ? '返回目录' : 'AI 题目整理'"
              @click="bookOpen = !bookOpen"
            >
              {{ bookOpen ? '目录' : '题目' }}
            </el-button>
          </el-button-group>
          <el-tooltip v-if="isAdmin" content="新增大类" placement="top">
            <el-button size="small" type="primary" :icon="Plus" @click="onAddRoot">大类</el-button>
          </el-tooltip>
        </div>
      </div>
      <p class="computer-page__lead">
        分类是树形结构，大类下可叠多层小类。讲义存在本机 Node，出门用的 pages.dev 需同步到云端。
      </p>
    </header>

    <div v-if="bookOpen" class="computer-tree-card">
      <div class="computer-tree-head">AI 题目整理</div>
      <div class="computer-book-wrap">
        <ComputerQuizBookPanel />
      </div>
    </div>
    <div v-else class="computer-tree-card">
      <div class="computer-tree-head">
        <span>讲义目录</span>
        <span v-if="!loading && !error" class="computer-tree-head__count">{{ entryCount }} 篇</span>
      </div>
      <p v-if="loading" class="computer-tree__status">正在读取目录…</p>
      <p v-else-if="error" class="computer-tree__status computer-tree__status--error">
        {{ error }}
        <el-button size="small" @click="load">重试</el-button>
      </p>
      <ul v-else class="computer-tree" role="tree">
        <li
          v-for="row in rows"
          :key="`${row.kind}-${row.id}`"
          class="computer-tree__row"
          :class="{
            'is-branch': row.kind === 'branch',
            'is-leaf': row.kind === 'entry',
            'is-root': row.kind === 'branch' && row.depth === 0,
            'is-empty': row.kind === 'branch' && !row.expandable,
          }"
          :style="{ '--tree-depth': row.depth }"
          role="treeitem"
          :aria-expanded="row.kind === 'branch' ? Boolean(expanded[row.id]) : undefined"
        >
          <div
            class="computer-tree__line"
            :class="{
              'is-admin': isAdmin,
              'is-admin-open': isAdmin && adminOpenId === row.id,
            }"
          >
            <div class="computer-tree__main">
              <button
                v-if="row.kind === 'branch' && row.expandable"
                type="button"
                class="computer-tree__caret-btn"
                :class="{ 'is-open': expanded[row.id] }"
                :aria-label="expanded[row.id] ? '折叠' : '展开'"
                @click.stop="toggle(row.id, true)"
              >
                <el-icon :size="12"><ArrowRight /></el-icon>
              </button>
              <span v-else class="computer-tree__caret-spacer" />
              <div
                v-if="row.kind === 'branch'"
                class="computer-tree__toggle"
                :class="{ 'is-root': row.depth === 0, 'is-open': expanded[row.id] }"
              >
                <el-icon class="computer-tree__kind" :size="16">
                  <FolderOpened v-if="expanded[row.id]" />
                  <Folder v-else />
                </el-icon>
                <span class="computer-tree__name">{{ row.name }}</span>
                <span v-if="!row.expandable && !isAdmin" class="computer-tree__soon">即将开放</span>
              </div>
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
              <button
                v-if="isAdmin"
                type="button"
                class="computer-tree__more"
                aria-label="显示操作"
                @click.stop="toggleAdmin(row.id)"
              >
                <el-icon :size="16"><MoreFilled /></el-icon>
              </button>
            </div>
            <div v-if="isAdmin" class="computer-tree__admin" :class="{ 'is-open': adminOpenId === row.id }">
              <template v-if="row.kind === 'branch'">
                <button type="button" class="computer-tree__icon" @click.stop="onAddChild(row.id)">小类</button>
                <button type="button" class="computer-tree__icon" @click.stop="onAddItem(row.id)">讲义</button>
                <button type="button" class="computer-tree__icon" @click.stop="onRenameNode(row.id, row.name)">改名</button>
                <button type="button" class="computer-tree__icon is-danger" @click.stop="onDeleteNode(row.id, row.name)">删除</button>
              </template>
              <template v-else>
                <button type="button" class="computer-tree__icon" @click.stop="openEntry(row.entry, true)">编辑</button>
                <button type="button" class="computer-tree__icon is-danger" @click.stop="onDeleteEntry(row.entry)">删除</button>
              </template>
            </div>
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
  justify-content: space-between;
  gap: 10px 12px;
  margin-bottom: 6px;
}

.computer-page__head-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.computer-page__head-actions :deep(.el-button-group) {
  display: inline-flex;
  flex-wrap: nowrap;
}

.computer-page__head-actions :deep(.el-button) {
  margin: 0;
}

.computer-page__title {
  margin: 0;
  min-width: 0;
  font-size: 1.28rem;
  font-weight: 800;
  line-height: 1.25;
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
  border: none;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 28px rgb(15 23 42 / 5%);
}

.computer-tree-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--app-text);
  background: color-mix(in srgb, var(--app-primary-soft) 32%, #fff);
}

.computer-tree-head__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.computer-book-wrap {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
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
  padding: 8px;
  list-style: none;
  overflow-x: hidden;
  overflow-y: auto;
}

.computer-tree__row {
  position: relative;
}

.computer-tree__line {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.computer-tree__main {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 2px;
  min-height: 40px;
  padding: 4px 4px 4px calc(6px + var(--tree-depth, 0) * 18px);
  border-radius: 10px;
  border: none;
  transition: background-color 0.12s ease;
}

.computer-tree__row.is-root .computer-tree__main {
  background: color-mix(in srgb, var(--app-primary-soft) 34%, #fff);
}

.computer-tree__row.is-root + .computer-tree__row.is-root {
  margin-top: 4px;
}

.computer-tree__caret-btn,
.computer-tree__caret-spacer {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  margin: 6px 0 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.computer-tree__caret-btn {
  transition: background-color 0.12s ease, transform 0.15s ease, color 0.12s ease;
}

.computer-tree__caret-btn.is-open {
  transform: rotate(90deg);
  color: var(--app-primary);
}

.computer-tree__caret-btn:hover {
  background: rgb(15 23 42 / 7%);
}

.computer-tree__caret-spacer {
  cursor: default;
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
  padding: 8px 6px 8px 2px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

.computer-tree__leaf {
  cursor: pointer;
}

.computer-tree__more {
  appearance: none;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  margin: 4px 2px 0 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: color-mix(in srgb, var(--app-text-muted) 42%, transparent);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.computer-tree__line.is-admin-open .computer-tree__more,
.computer-tree__line:hover .computer-tree__more {
  color: var(--app-text-muted);
  background: rgb(15 23 42 / 5%);
}

.computer-tree__admin {
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin: 0 6px 8px calc(28px + var(--tree-depth, 0) * 18px);
  padding: 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-primary-soft) 32%, #fff);
}

.computer-tree__admin.is-open {
  display: grid;
}

@media (hover: hover) and (pointer: fine) {
  .computer-tree__more {
    opacity: 0;
  }

  .computer-tree__line:hover .computer-tree__more,
  .computer-tree__line.is-admin-open .computer-tree__more {
    opacity: 1;
  }

  .computer-tree__line.is-admin:hover .computer-tree__admin {
    display: grid;
  }
}

.computer-tree__name {
  font-weight: 700;
  line-height: 1.35;
}

.computer-tree__row.is-root .computer-tree__name {
  font-size: 0.98em;
}

.computer-tree__kind {
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
}

.computer-tree__kind--doc {
  color: var(--app-primary);
}

.computer-tree__leaf-title {
  min-width: 0;
  font-weight: 500;
  line-height: 1.35;
  color: var(--app-text);
}

.computer-tree__leaf:not(.is-ready) .computer-tree__leaf-title {
  color: var(--app-text-muted);
}

.computer-tree__row:hover .computer-tree__main {
  background: color-mix(in srgb, var(--app-primary-soft) 48%, #fff);
}

.computer-tree__row.is-root:hover .computer-tree__main {
  background: color-mix(in srgb, var(--app-primary-soft) 62%, #fff);
}

.computer-tree__soon {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 650;
  color: var(--app-text-muted);
  background: color-mix(in srgb, var(--app-border-soft) 70%, #fff);
  border-radius: 999px;
  padding: 2px 8px;
}

.computer-tree__icon {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  margin: 0;
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-primary-soft) 55%, #fff);
  color: var(--app-primary);
  font: inherit;
  font-size: 13px;
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
