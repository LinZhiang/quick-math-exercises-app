<!--
  计算机基础：左侧树（仅三角折叠）+ 讲义详情。
  管理员增删改：本机写 server/data；pages.dev 写 KV 或边缘缓存。检查并更新不重置目录。
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Collection, Document, Folder, FolderOpened, MoreFilled, Notebook, Plus, Share } from '@element-plus/icons-vue'
import {
  buildComputerRangeQuizItem,
  collectReadyEntriesUnder,
  computerNodePathNames,
  createComputerItem,
  createComputerNode,
  defaultExpandedComputerIds,
  deleteComputerItem,
  deleteComputerNode,
  findComputerEntry,
  findComputerNode,
  flattenVisibleComputerRows,
  loadComputerBasicsItem,
  loadComputerBasicsTree,
  moveComputerItem,
  moveComputerNode,
  renameComputerNode,
  type ComputerHandoutItem,
  type ComputerTreeEntry,
  type ComputerTreeNode,
  type ComputerTreeRow,
} from '@/utils/computer/computerBasics'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import ComputerBusyHint from './ComputerBusyHint.vue'
import ComputerCategoryMapDialog from './ComputerCategoryMapDialog.vue'
import ComputerMoveDialog from './ComputerMoveDialog.vue'
import ComputerQuizPanel from './ComputerQuizPanel.vue'

const router = useRouter()
const tree = ref<ComputerTreeNode[]>([])
const treeEl = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
const expanded = ref<Record<string, boolean>>({})
const mapOpen = ref(false)
const adminOpenId = ref('')
const flashId = ref('')
const busyText = ref('')
const movePickId = ref('')
const moveKind = ref<'branch' | 'entry'>('branch')
const moveName = ref('')
const moveOpen = ref(false)
const quizItem = ref<ComputerHandoutItem | null>(null)
const quizScopeLabel = ref('')
let flashTimer = 0

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

function treeHasId(nodes: ComputerTreeNode[], id: string): boolean {
  for (const node of nodes) {
    if (node.id === id) return true
    if (node.entries.some((entry) => entry.id === id)) return true
    if (treeHasId(node.children, id)) return true
  }
  return false
}

function queryTreeRow(id: string) {
  const safe = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/["\\]/g, '')
  return treeEl.value?.querySelector<HTMLElement>(`[data-tree-id="${safe}"]`) ?? null
}

function afterLayout(fn: () => void) {
  void nextTick(() => {
    requestAnimationFrame(() => requestAnimationFrame(fn))
  })
}

function scrollRowIntoView(id: string, prefer: 'menu' | 'row' = 'row') {
  const scroller = treeEl.value
  const row = queryTreeRow(id)
  if (!scroller || !row) return
  const pad = 10
  const sRect = scroller.getBoundingClientRect()
  const rRect = row.getBoundingClientRect()
  const menu = prefer === 'menu' ? row.querySelector<HTMLElement>('.computer-tree__admin.is-open') : null
  const bottom = menu ? menu.getBoundingClientRect().bottom : rRect.bottom
  const top = rRect.top
  const clippedBottom = bottom > sRect.bottom - pad
  const clippedTop = top < sRect.top + pad
  if (!clippedBottom && !clippedTop) return
  let delta = 0
  if (clippedBottom) delta = bottom - sRect.bottom + pad
  if (top - delta < sRect.top + pad) {
    delta = menu ? bottom - sRect.bottom + pad : top - sRect.top - pad
  }
  if (Math.abs(delta) > 1) {
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' })
  }
}

function revealRow(id: string, prefer: 'menu' | 'row' = 'row') {
  flashId.value = id
  window.clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => {
    if (flashId.value === id) flashId.value = ''
  }, 1600)
  afterLayout(() => {
    const row = queryTreeRow(id)
    if (!row) return
    if (prefer === 'row') {
      row.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      return
    }
    scrollRowIntoView(id, prefer)
  })
}

function toggle(id: string, expandable: boolean) {
  if (!expandable) return
  const willOpen = !expanded.value[id]
  expanded.value = { ...expanded.value, [id]: willOpen }
  if (!willOpen) return
  afterLayout(() => {
    const scroller = treeEl.value
    const row = queryTreeRow(id)
    if (!scroller || !row) return
    const sRect = scroller.getBoundingClientRect()
    const pRect = row.getBoundingClientRect()
    if (pRect.top > sRect.top + sRect.height * 0.4) {
      scroller.scrollTo({ top: scroller.scrollTop + (pRect.top - sRect.top - 8), behavior: 'smooth' })
    }
  })
}

function toggleAdmin(id: string) {
  const opening = adminOpenId.value !== id
  adminOpenId.value = opening ? id : ''
  if (opening) afterLayout(() => scrollRowIntoView(id, 'menu'))
}

function onTreePointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement | null
  if (target?.closest('.computer-tree__more')) return
  if (target?.closest('.computer-tree__line.is-admin-open')) return
  adminOpenId.value = ''
}

function rowHasMore(row: ComputerTreeRow) {
  if (isAdmin.value) return true
  if (row.kind === 'branch') return true
  return row.entry.ready
}

function insertNode(
  nodes: ComputerTreeNode[],
  parentId: string | null,
  node: ComputerTreeNode,
): ComputerTreeNode[] {
  if (treeHasId(nodes, node.id)) return nodes
  if (!parentId) return [...nodes, node]
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, node] }
    return { ...n, children: insertNode(n.children, parentId, node) }
  })
}

function insertEntry(
  nodes: ComputerTreeNode[],
  parentId: string,
  entry: ComputerTreeEntry,
): ComputerTreeNode[] {
  if (treeHasId(nodes, entry.id)) return nodes
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, entries: [...n.entries, entry] }
    return { ...n, children: insertEntry(n.children, parentId, entry) }
  })
}

function closeQuiz() {
  quizItem.value = null
  quizScopeLabel.value = ''
}

async function startFolderQuiz(nodeId: string, name: string) {
  const pos = findComputerNode(tree.value, nodeId)
  if (!pos) return
  const entries = collectReadyEntriesUnder(pos.node)
  if (!entries.length) {
    ElMessage.warning('该范围内还没有可测验的讲义')
    return
  }
  try {
    await withBusy('正在读取范围内讲义…', async () => {
      const items: ComputerHandoutItem[] = []
      for (const entry of entries) {
        try {
          items.push(await loadComputerBasicsItem(entry.id))
        } catch {
          /* 缺篇跳过 */
        }
      }
      if (!items.length) throw new Error('范围内讲义读取失败')
      const learningPath = computerNodePathNames(tree.value, nodeId)
      quizItem.value = buildComputerRangeQuizItem({
        scopeId: nodeId,
        scopeName: name,
        learningPath,
        items,
      })
      quizScopeLabel.value = learningPath.join(' / ') || name
      adminOpenId.value = ''
    })
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '打开测验失败')
  }
}

async function startEntryQuiz(entry: ComputerTreeEntry) {
  if (!entry.ready) {
    ElMessage.info('该小节即将开放')
    return
  }
  try {
    await withBusy('正在打开测验…', async () => {
      const item = await loadComputerBasicsItem(entry.id)
      quizItem.value = item
      quizScopeLabel.value = ''
      adminOpenId.value = ''
    })
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '打开测验失败')
  }
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

async function withBusy<T>(text: string, fn: () => Promise<T>): Promise<T> {
  busyText.value = text
  try {
    return await fn()
  } finally {
    busyText.value = ''
  }
}

async function reloadKeepExpand(opts?: {
  focusId?: string
  parentId?: string | null
  node?: ComputerTreeNode
  entry?: ComputerTreeEntry
}) {
  const keep = { ...expanded.value }
  if (opts?.parentId) keep[opts.parentId] = true
  let next = await loadComputerBasicsTree(true)
  if (opts?.node) next = insertNode(next, opts.parentId ?? null, opts.node)
  if (opts?.entry && opts.parentId) next = insertEntry(next, opts.parentId, opts.entry)
  tree.value = next
  expanded.value = { ...defaultExpandedComputerIds(next), ...keep }
  adminOpenId.value = ''
  if (opts?.focusId) revealRow(opts.focusId, 'row')
}

async function onAddRoot() {
  try {
    const name = await promptName('新增大类')
    await withBusy('正在新增大类…', async () => {
      const node = { children: [], entries: [], ...(await createComputerNode({ name })) }
      await reloadKeepExpand({ focusId: node.id, node, parentId: null })
    })
    ElMessage.success('已新增大类')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onAddChild(parentId: string) {
  try {
    const name = await promptName('新增小类')
    await withBusy('正在新增小类…', async () => {
      const node = { children: [], entries: [], ...(await createComputerNode({ name, parentId })) }
      await reloadKeepExpand({ focusId: node.id, parentId, node })
    })
    ElMessage.success('已新增小类')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onAddItem(parentId: string) {
  try {
    const title = await promptName('新增讲义')
    const item = await withBusy('正在新增讲义…', async () => {
      const created = await createComputerItem({ parentId, title, content: '' })
      const entry: ComputerTreeEntry = { id: created.id, title: created.title, ready: true, type: created.type }
      await reloadKeepExpand({ focusId: created.id, parentId, entry })
      return created
    })
    ElMessage.success('已新增讲义，正在打开…')
    openComputerItem(item.id, true)
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '新增失败')
  }
}

async function onRenameNode(id: string, current: string) {
  try {
    const name = await promptName('编辑分类', current)
    await withBusy('正在保存分类…', async () => {
      await renameComputerNode(id, name)
      await reloadKeepExpand({ focusId: id })
    })
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
    await withBusy('正在删除分类…', async () => {
      await deleteComputerNode(id)
      await reloadKeepExpand()
    })
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
    await withBusy('正在删除讲义…', async () => {
      await deleteComputerItem(entry.id)
      await reloadKeepExpand()
    })
    ElMessage.success('已删除')
  } catch (e) {
    if (isPromptCancel(e)) return
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

function isPromptCancel(e: unknown) {
  return e === 'cancel' || e === 'close' || (typeof e === 'string' && e.toLowerCase().includes('cancel'))
}

function startMove(id: string, kind: 'branch' | 'entry', name: string) {
  movePickId.value = id
  moveKind.value = kind
  moveName.value = name
  adminOpenId.value = ''
  moveOpen.value = true
}

async function onMoveNode(id: string, delta: number) {
  const pos = findComputerNode(tree.value, id)
  if (!pos) return
  const next = pos.index + delta
  if (next < 0 || next >= pos.siblings.length) {
    ElMessage.info(delta < 0 ? '已经在最上面' : '已经在最下面')
    return
  }
  const parentId = pos.parent?.id ?? null
  try {
    await withBusy('正在调整位置…', async () => {
      await moveComputerNode(id, { parentId, index: next })
      if (parentId) expanded.value = { ...expanded.value, [parentId]: true }
      await reloadKeepExpand({ focusId: id, parentId })
    })
    ElMessage.success('已调整顺序')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '移动失败')
  }
}

async function onMoveEntry(id: string, delta: number) {
  const pos = findComputerEntry(tree.value, id)
  if (!pos) return
  const next = pos.index + delta
  if (next < 0 || next >= pos.node.entries.length) {
    ElMessage.info(delta < 0 ? '已经在最上面' : '已经在最下面')
    return
  }
  try {
    await withBusy('正在调整位置…', async () => {
      await moveComputerItem(id, { parentId: pos.node.id, index: next })
      expanded.value = { ...expanded.value, [pos.node.id]: true }
      await reloadKeepExpand({ focusId: id, parentId: pos.node.id })
    })
    ElMessage.success('已调整顺序')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '移动失败')
  }
}

async function confirmMove(target: string) {
  const rowId = movePickId.value
  const kind = moveKind.value
  if (!rowId || !target) {
    ElMessage.warning('请先选择要放到的位置')
    return
  }
  moveOpen.value = false
  try {
    await withBusy('正在移动…', async () => {
      if (kind === 'branch') {
        const parentId = target === '__root__' ? null : target
        const destLen =
          parentId == null
            ? tree.value.length
            : (findComputerNode(tree.value, parentId)?.node.children.length ?? 0)
        await moveComputerNode(rowId, { parentId, index: destLen })
        if (parentId) expanded.value = { ...expanded.value, [parentId]: true }
        await reloadKeepExpand({ focusId: rowId, parentId })
      } else {
        const dest = findComputerNode(tree.value, target)
        await moveComputerItem(rowId, { parentId: target, index: dest?.node.entries.length ?? 0 })
        expanded.value = { ...expanded.value, [target]: true }
        await reloadKeepExpand({ focusId: rowId, parentId: target })
      }
    })
    movePickId.value = ''
    ElMessage.success('已移动到新位置')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '移动失败')
  }
}

async function load() {
  error.value = ''
  if (tree.value.length) busyText.value = '正在刷新目录…'
  else loading.value = true
  try {
    const next = await loadComputerBasicsTree(true)
    tree.value = next
    expanded.value = defaultExpandedComputerIds(next)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '读取目录失败'
  } finally {
    loading.value = false
    busyText.value = ''
  }
}

onMounted(() => {
  void load()
})

onBeforeUnmount(() => {
  window.clearTimeout(flashTimer)
})
</script>

<template>
  <section class="computer-page" :class="{ 'is-quiz': Boolean(quizItem) }">
    <header v-if="!quizItem" class="computer-page__head">
      <div class="computer-page__title-row">
        <el-button-group class="computer-page__nav-btns">
          <el-button size="small" :icon="Share" title="查看知识分布" @click="mapOpen = true">分布</el-button>
          <el-button
            size="small"
            :icon="Collection"
            title="AI 题目整理"
            @click="router.push({ name: 'computer-book' })"
          >
            题目
          </el-button>
          <el-button
            size="small"
            :icon="Notebook"
            title="学习日志"
            @click="router.push({ name: 'computer-log' })"
          >
            日志
          </el-button>
        </el-button-group>
        <el-tooltip v-if="isAdmin" content="新增大类" placement="top">
          <el-button size="small" type="primary" :icon="Plus" @click="onAddRoot">大类</el-button>
        </el-tooltip>
      </div>
      <p class="computer-page__lead">
        分类是树形结构，大类下可叠多层小类。管理员登录后可直接新增、改名；「检查并更新」只刷新应用，不会清空目录。
      </p>
    </header>

    <div v-if="quizItem" class="computer-tree-card computer-tree-card--quiz">
      <div class="computer-book-wrap">
        <ComputerQuizPanel
          :key="quizItem.id"
          :item="quizItem"
          :scope-label="quizScopeLabel || undefined"
          @close="closeQuiz"
        />
      </div>
    </div>
    <div v-else class="computer-tree-card">
      <div class="computer-tree-head">
        <span>讲义目录</span>
        <span v-if="!loading && !error" class="computer-tree-head__count">{{ entryCount }} 篇</span>
      </div>
      <div v-if="loading && !rows.length" class="computer-busy-panel">
        <ComputerBusyHint text="正在读取目录…" />
      </div>
      <p v-else-if="error" class="computer-tree__status computer-tree__status--error">
        {{ error }}
        <el-button size="small" @click="load">重试</el-button>
      </p>
      <ul
        v-else
        ref="treeEl"
        class="computer-tree"
        role="tree"
        @pointerdown="onTreePointerDown"
      >
        <li
          v-for="row in rows"
          :key="`${row.kind}-${row.id}`"
          class="computer-tree__row"
          :class="{
            'is-branch': row.kind === 'branch',
            'is-leaf': row.kind === 'entry',
            'is-root': row.kind === 'branch' && row.depth === 0,
            'is-empty': row.kind === 'branch' && !row.expandable,
            'is-flash': flashId === row.id,
          }"
          :data-tree-id="row.id"
          :style="{ '--tree-depth': row.depth }"
          role="treeitem"
          :aria-expanded="row.kind === 'branch' ? Boolean(expanded[row.id]) : undefined"
        >
          <div
            class="computer-tree__line"
            :class="{
              'is-admin': isAdmin,
              'is-admin-open': adminOpenId === row.id,
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
              <span v-else class="computer-tree__caret-spacer" aria-hidden="true">
                <el-icon v-if="row.kind === 'branch'" class="computer-tree__caret-ghost" :size="12">
                  <ArrowRight />
                </el-icon>
              </span>
              <div
                v-if="row.kind === 'branch'"
                class="computer-tree__toggle"
                :class="{
                  'is-root': row.depth === 0,
                  'is-open': expanded[row.id],
                  'is-clickable': row.expandable,
                }"
                @click="toggle(row.id, row.expandable)"
              >
                <el-icon class="computer-tree__kind" :size="16">
                  <FolderOpened v-if="expanded[row.id]" />
                  <Folder v-else />
                </el-icon>
                <span class="computer-tree__name">{{ row.name }}</span>
                <span v-if="!row.expandable" class="computer-tree__soon">{{
                  isAdmin ? '空' : '即将开放'
                }}</span>
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
                v-if="rowHasMore(row)"
                type="button"
                class="computer-tree__more"
                :class="{ 'is-on': adminOpenId === row.id }"
                aria-label="显示操作"
                :aria-expanded="adminOpenId === row.id"
                @pointerdown.stop
                @click.stop="toggleAdmin(row.id)"
              >
                <el-icon :size="16"><MoreFilled /></el-icon>
              </button>
            </div>
            <div
              v-if="rowHasMore(row)"
              class="computer-tree__admin"
              :class="{ 'is-open': adminOpenId === row.id }"
              @pointerdown.stop
            >
              <template v-if="row.kind === 'branch'">
                <button type="button" class="computer-tree__icon" @click.stop="startFolderQuiz(row.id, row.name)">AI测验</button>
                <template v-if="isAdmin">
                  <button type="button" class="computer-tree__icon" @click.stop="onAddChild(row.id)">小类</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onAddItem(row.id)">新增讲义</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onRenameNode(row.id, row.name)">改名</button>
                  <button type="button" class="computer-tree__icon" @click.stop="startMove(row.id, 'branch', row.name)">移动位置</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onMoveNode(row.id, -1)">上移</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onMoveNode(row.id, 1)">下移</button>
                  <button type="button" class="computer-tree__icon is-danger" @click.stop="onDeleteNode(row.id, row.name)">删除</button>
                </template>
              </template>
              <template v-else>
                <button
                  v-if="row.entry.ready"
                  type="button"
                  class="computer-tree__icon"
                  @click.stop="startEntryQuiz(row.entry)"
                >
                  AI测验
                </button>
                <template v-if="isAdmin">
                  <button type="button" class="computer-tree__icon" @click.stop="openEntry(row.entry, true)">编辑</button>
                  <button type="button" class="computer-tree__icon" @click.stop="startMove(row.id, 'entry', row.entry.title)">移动位置</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onMoveEntry(row.id, -1)">上移</button>
                  <button type="button" class="computer-tree__icon" @click.stop="onMoveEntry(row.id, 1)">下移</button>
                  <button type="button" class="computer-tree__icon is-danger" @click.stop="onDeleteEntry(row.entry)">删除</button>
                </template>
              </template>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="busyText" class="computer-busy-cover">
        <ComputerBusyHint :text="busyText" />
      </div>
    </div>
    <ComputerMoveDialog
      v-model="moveOpen"
      :tree="tree"
      :moving-id="movePickId"
      :moving-kind="moveKind"
      :moving-name="moveName"
      @confirm="confirmMove"
    />
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

.computer-page.is-quiz {
  padding-top: 8px;
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
  margin-bottom: 8px;
}

.computer-page__nav-btns {
  flex: 0 1 auto;
  min-width: 0;
}

.computer-page__nav-btns :deep(.el-button) {
  margin: 0;
}

.computer-page__lead {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.computer-tree-card {
  position: relative;
  flex: 0 1 auto;
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

.computer-tree-card--quiz {
  flex: 1 1 0;
  max-width: none;
}

.computer-busy-panel {
  flex: 0 0 auto;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.computer-busy-cover {
  position: absolute;
  inset: 44px 0 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 82%);
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
  flex: 0 1 auto;
  min-height: 0;
  margin: 0;
  padding: 6px 8px 10px;
  list-style: none;
  overflow-x: hidden;
  overflow-y: auto;
}

.computer-tree__row {
  position: relative;
  scroll-margin: 12px;
}

.computer-tree__row.is-flash .computer-tree__main {
  background: color-mix(in srgb, var(--app-primary-soft) 78%, #fff);
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
  padding: 2px 4px 2px calc(6px + var(--tree-depth, 0) * 18px);
  border-radius: 10px;
  border: none;
  transition: background-color 0.12s ease;
}

.computer-tree__row.is-empty .computer-tree__main {
  min-height: 36px;
  opacity: 0.92;
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
  margin: 8px 0 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: pointer;
}

.computer-tree__caret-btn :deep(.el-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  line-height: 0;
}

.computer-tree__caret-btn :deep(svg) {
  display: block;
}

.computer-tree__caret-btn {
  transition: background-color 0.12s ease, transform 0.15s ease, color 0.12s ease;
}

.computer-tree__caret-btn.is-open {
  transform: rotate(90deg);
  transform-origin: center center;
  color: var(--app-primary);
}

.computer-tree__caret-btn:hover {
  background: rgb(15 23 42 / 7%);
}

.computer-tree__caret-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.28;
}

.computer-tree__toggle,
.computer-tree__leaf {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: flex-start;
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

.computer-tree__toggle.is-clickable {
  cursor: pointer;
}

.computer-tree__leaf {
  cursor: pointer;
}

.computer-tree__more {
  appearance: none;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin: 4px 2px 0 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgb(15 23 42 / 4%);
  color: var(--app-text-muted);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.computer-tree__more.is-on,
.computer-tree__line.is-admin-open .computer-tree__more {
  color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary-soft) 70%, #fff);
}

.computer-tree__admin {
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin: 0 6px 8px calc(28px + var(--tree-depth, 0) * 18px);
  padding: 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-primary-soft) 32%, #fff);
  box-shadow: 0 6px 16px rgb(15 23 42 / 6%);
}

.computer-tree__admin.is-open {
  display: grid;
}

.computer-tree__name {
  min-width: 0;
  flex: 1 1 auto;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  font-weight: 700;
  line-height: 1.35;
}

.computer-tree__row.is-root .computer-tree__name {
  font-size: 0.98em;
}

.computer-tree__kind {
  flex-shrink: 0;
  margin-top: 2px;
  color: #d97706;
}

.computer-tree__kind--doc {
  color: var(--app-primary);
}

.computer-tree__leaf-title {
  min-width: 0;
  flex: 1 1 auto;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
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
  margin-top: 2px;
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
  grid-column: 1 / -1;
  color: var(--app-danger);
}

.computer-tree__icon.is-danger:hover {
  background: #fee2e2;
}
</style>
