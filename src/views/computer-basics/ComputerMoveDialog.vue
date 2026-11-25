<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Folder, FolderOpened } from '@element-plus/icons-vue'
import {
  type ComputerTreeNode,
} from '@/utils/computer/computerBasics'
import { HANDOUT_LIBRARIES, type HandoutLibraryId } from '@/utils/app/transferHandout'

const ROOT_ID = '__root__'

type MoveTreeNode = {
  id: string
  label: string
  disabled?: boolean
  children?: MoveTreeNode[]
}

const props = defineProps<{
  modelValue: boolean
  tree: ComputerTreeNode[]
  trees?: Partial<Record<HandoutLibraryId, ComputerTreeNode[]>>
  currentLibrary?: HandoutLibraryId
  loading?: boolean
  movingId: string
  movingKind: 'branch' | 'entry'
  movingName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { libraryId: HandoutLibraryId; targetId: string }): void
}>()

const selectedId = ref('')
const libraryId = ref<HandoutLibraryId>('computer')
const treeRef = ref<{ setCurrentKey?: (key: string) => void } | null>(null)

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

function descendantIds(nodes: ComputerTreeNode[], id: string, out = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.id === id) {
      const mark = (current: ComputerTreeNode) => {
        out.add(current.id)
        current.children.forEach(mark)
      }
      mark(node)
      return out
    }
    descendantIds(node.children, id, out)
    if (out.size) return out
  }
  return out
}

const activeTree = computed(() => props.trees?.[libraryId.value] || (libraryId.value === props.currentLibrary ? props.tree : []))

const excludeIds = computed(() =>
  props.movingKind === 'branch' && libraryId.value === (props.currentLibrary || 'computer')
    ? descendantIds(activeTree.value, props.movingId)
    : new Set<string>(),
)

function mapFolders(nodes: ComputerTreeNode[]): MoveTreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.name,
    disabled: excludeIds.value.has(node.id),
    children: mapFolders(node.children),
  }))
}

const treeData = computed<MoveTreeNode[]>(() => {
  const folders = mapFolders(activeTree.value)
  if (props.movingKind === 'branch') {
    return [{ id: ROOT_ID, label: '顶层（作为大类）', children: folders }]
  }
  return folders
})

const noFolders = computed(
  () => !props.loading && props.movingKind === 'entry' && activeTree.value.length === 0,
)

const hint = computed(() => {
  if (props.loading) return '正在读取各个菜单的分类…'
  if (noFolders.value) return '这个菜单还没有分类。请先到那边新建一个大类，再把讲义移过去。'
  return props.movingKind === 'branch'
    ? '点选一个分类。可以留在当前菜单，也可以改放到计算机基础、历史整理或前端学习。选「顶层」则变成那边的大类。'
    : '点选一个分类。讲义可以留在当前菜单，也可以连同正文和图片搬到另一个菜单。'
})

watch(
  () => props.modelValue,
  async (on) => {
    if (!on) return
    libraryId.value = props.currentLibrary || 'computer'
    selectedId.value = ''
    await nextTick()
    try {
      treeRef.value?.setCurrentKey?.('')
    } catch {
      /* 空 key 时忽略 */
    }
  },
)

function onLibrary(id: HandoutLibraryId) {
  libraryId.value = id
  selectedId.value = ''
}

function onNodeClick(data: MoveTreeNode) {
  if (data.disabled) return
  selectedId.value = data.id
}

function onCancel() {
  open.value = false
}

function onConfirm() {
  if (!selectedId.value) return
  emit('confirm', { libraryId: libraryId.value, targetId: selectedId.value })
}
</script>

<template>
  <el-dialog
    v-model="open"
    :title="`移动位置：${movingName}`"
    width="min(92vw, 440px)"
    class="computer-move-dialog"
    destroy-on-close
  >
    <p class="computer-move__hint">{{ hint }}</p>
    <div class="computer-move__libs" role="tablist">
      <button
        v-for="lib in HANDOUT_LIBRARIES"
        :key="lib.id"
        type="button"
        class="computer-move__lib"
        :class="{ 'is-on': libraryId === lib.id }"
        @click="onLibrary(lib.id)"
      >
        {{ lib.label }}
      </button>
    </div>
    <el-tree
      v-if="open"
      ref="treeRef"
      class="computer-move__tree"
      :data="treeData"
      node-key="id"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
      :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
      @node-click="onNodeClick"
    >
      <template #default="{ data, node }">
        <span class="computer-move__node" :class="{ 'is-on': data.id === selectedId, 'is-off': data.disabled }">
          <el-icon v-if="data.id !== ROOT_ID" class="computer-move__icon">
            <FolderOpened v-if="node.expanded" />
            <Folder v-else />
          </el-icon>
          {{ data.label }}
        </span>
      </template>
    </el-tree>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" :disabled="!selectedId" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.computer-move__hint {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.computer-move__libs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.computer-move__lib {
  border: 1px solid var(--app-border-soft);
  background: #fff;
  color: var(--app-text);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
}

.computer-move__lib.is-on {
  border-color: var(--app-primary);
  color: var(--app-primary);
  font-weight: 700;
}

.computer-move__tree {
  max-height: min(52vh, 420px);
  overflow: auto;
  padding: 4px 0;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
}

.computer-move__tree :deep(.el-tree-node__content) {
  min-height: 36px;
  height: auto;
  padding: 4px 8px;
}

.computer-move__node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;
}

.computer-move__node.is-on {
  font-weight: 700;
  color: var(--app-primary);
}

.computer-move__node.is-off {
  opacity: 0.4;
}

.computer-move__icon {
  flex-shrink: 0;
  color: #d97706;
}
</style>
