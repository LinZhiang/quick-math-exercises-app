<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Folder, FolderOpened } from '@element-plus/icons-vue'
import {
  computerNodeExcludeSet,
  type ComputerTreeNode,
} from '@/utils/computer/computerBasics'

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
  movingId: string
  movingKind: 'branch' | 'entry'
  movingName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', targetId: string): void
}>()

const selectedId = ref('')
const treeRef = ref<{ setCurrentKey?: (key: string) => void } | null>(null)

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const excludeIds = computed(() =>
  props.movingKind === 'branch' ? computerNodeExcludeSet(props.tree, props.movingId) : new Set<string>(),
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
  const folders = mapFolders(props.tree)
  if (props.movingKind === 'branch') {
    return [{ id: ROOT_ID, label: '顶层（作为大类）', children: folders }]
  }
  return folders
})

const hint = computed(() =>
  props.movingKind === 'branch'
    ? '点选一个分类，当前文件夹会放到它下面。选「顶层」则变成大类。'
    : '点选一个分类，当前讲义会放到它下面。',
)

watch(
  () => props.modelValue,
  async (on) => {
    if (!on) return
    selectedId.value = ''
    await nextTick()
    try {
      treeRef.value?.setCurrentKey?.('')
    } catch {
      /* 空 key 时忽略 */
    }
  },
)

function onNodeClick(data: MoveTreeNode) {
  if (data.disabled) return
  selectedId.value = data.id
}

function onCancel() {
  open.value = false
}

function onConfirm() {
  if (!selectedId.value) return
  emit('confirm', selectedId.value)
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
