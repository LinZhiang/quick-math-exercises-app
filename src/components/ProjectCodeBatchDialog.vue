<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Document, Folder, FolderOpened } from '@element-plus/icons-vue'
import type { ProjectCodeNode } from '@/utils/project-code/projectCodeApi'

type TreeItem = {
  id: string
  label: string
  kind: 'folder' | 'entry'
  children?: TreeItem[]
}

const props = defineProps<{
  modelValue: boolean
  tree: ProjectCodeNode[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean)
  (e: 'confirm', paths: string[])
}>()

const treeRef = ref<{
  getCheckedKeys: (leafOnly?: boolean) => string[]
  setCheckedKeys: (keys: string[]) => void
} | null>(null)

const checkedCount = ref(0)

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

function mapNodes(nodes: ProjectCodeNode[]): TreeItem[] {
  const out: TreeItem[] = []
  for (const node of nodes) {
    if (node.kind === 'file') {
      out.push({ id: `e:${node.path}`, label: node.name, kind: 'entry' })
      continue
    }
    const children = mapNodes(node.children || [])
    if (!children.length) continue
    out.push({
      id: `n:${node.path}`,
      label: node.name,
      kind: 'folder',
      children,
    })
  }
  return out
}

const treeData = computed(() => mapNodes(props.tree))
const expandedKeys = computed(() => treeData.value.map((n) => n.id))

function leafIds(nodes: TreeItem[] = treeData.value): string[] {
  const out: string[] = []
  for (const node of nodes) {
    if (node.kind === 'entry') out.push(node.id)
    if (node.children?.length) out.push(...leafIds(node.children))
  }
  return out
}

function orderedPaths(nodes: ProjectCodeNode[]): string[] {
  const out: string[] = []
  const walk = (list: ProjectCodeNode[]) => {
    for (const node of list) {
      if (node.kind === 'file') out.push(node.path)
      else if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return out
}

function syncCount() {
  const keys = treeRef.value?.getCheckedKeys(true) ?? []
  checkedCount.value = keys.filter((id) => id.startsWith('e:')).length
}

function selectAll() {
  treeRef.value?.setCheckedKeys(leafIds())
  syncCount()
}

function clearAll() {
  treeRef.value?.setCheckedKeys([])
  syncCount()
}

function onCancel() {
  if (props.busy) return
  open.value = false
}

function onConfirm() {
  if (props.busy) return
  const picked = new Set(
    (treeRef.value?.getCheckedKeys(true) ?? [])
      .filter((id) => id.startsWith('e:'))
      .map((id) => id.slice(2)),
  )
  const paths = orderedPaths(props.tree).filter((p) => picked.has(p))
  if (!paths.length) return
  emit('confirm', paths)
}

watch(
  () => props.modelValue,
  async (on) => {
    if (!on) return
    checkedCount.value = 0
    await nextTick()
    treeRef.value?.setCheckedKeys([])
  },
)
</script>

<template>
  <el-dialog
    v-model="open"
    title="批量下载源码"
    width="min(92vw, 480px)"
    class="pc-batch-dialog"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :show-close="!busy"
  >
    <p class="pc-batch__hint">勾选文件或文件夹，合成一份 Word。每个源文件另起一页，页首写文件名和路径。</p>
    <div class="pc-batch__toolbar">
      <el-button size="small" :disabled="busy || !treeData.length" @click="selectAll">全选</el-button>
      <el-button size="small" :disabled="busy || !checkedCount" @click="clearAll">取消全选</el-button>
      <span class="pc-batch__count">已选 {{ checkedCount }} 个</span>
    </div>
    <el-tree
      v-if="open"
      ref="treeRef"
      class="pc-batch__tree"
      :data="treeData"
      show-checkbox
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :expand-on-click-node="false"
      :check-on-click-node="true"
      :props="{ label: 'label', children: 'children' }"
      @check="syncCount"
    >
      <template #default="{ data, node }">
        <span class="pc-batch__node" :class="`is-${data.kind}`">
          <el-icon class="pc-batch__icon">
            <Document v-if="data.kind === 'entry'" />
            <FolderOpened v-else-if="node.expanded" />
            <Folder v-else />
          </el-icon>
          {{ data.label }}
        </span>
      </template>
    </el-tree>
    <p v-if="!treeData.length" class="pc-batch__empty">当前没有可下载的源码。</p>
    <template #footer>
      <el-button :disabled="busy" @click="onCancel">取消</el-button>
      <el-button type="primary" :loading="busy" :disabled="!checkedCount" @click="onConfirm">
        下载 Word
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.pc-batch__hint {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.pc-batch__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pc-batch__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--app-text-muted);
}

.pc-batch__tree {
  max-height: min(52vh, 420px);
  overflow: auto;
  padding: 4px 0;
  border: 1px solid var(--app-border-soft, #e2e8f0);
  border-radius: 10px;
}

.pc-batch__tree :deep(.el-tree-node__content) {
  min-height: 36px;
  height: auto;
  padding: 4px 8px;
}

.pc-batch__node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;
}

.pc-batch__icon {
  flex-shrink: 0;
  color: #d97706;
}

.pc-batch__node.is-entry .pc-batch__icon {
  color: #64748b;
}

.pc-batch__empty {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}
</style>
