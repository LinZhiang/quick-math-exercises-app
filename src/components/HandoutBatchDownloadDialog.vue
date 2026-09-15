<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Document, Folder, FolderOpened } from '@element-plus/icons-vue'
import type { CatalogExportNode } from '@/utils/markdown/handoutExport'

type CatalogNode = CatalogExportNode & { id?: string }

type TreeItem = {
  id: string
  label: string
  kind: 'folder' | 'entry'
  disabled?: boolean
  children?: TreeItem[]
}

const props = defineProps<{
  modelValue: boolean
  tree: CatalogNode[]
  admin?: boolean
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', ids: string[]): void
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

function mapNodes(nodes: CatalogNode[], inheritedPrivate: boolean): TreeItem[] {
  const out: TreeItem[] = []
  for (const node of nodes) {
    const locked = inheritedPrivate || Boolean(node.private)
    if (locked && !props.admin) continue
    const children: TreeItem[] = [
      ...mapNodes(node.children || [], locked),
      ...(node.entries || []).flatMap((entry) => {
        if (!props.admin && (locked || Boolean(entry.private) || !entry.ready)) return []
        return [
          {
            id: `e:${entry.id}`,
            label: entry.title,
            kind: 'entry' as const,
            disabled: !props.admin && !entry.ready,
          },
        ]
      }),
    ]
    if (!children.length) continue
    out.push({
      id: `n:${node.id || node.name}`,
      label: node.name,
      kind: 'folder',
      children,
    })
  }
  return out
}

const treeData = computed(() => mapNodes(props.tree, false))
const expandedKeys = computed(() => treeData.value.map((n) => n.id))

function leafIds(nodes: TreeItem[] = treeData.value): string[] {
  const out: string[] = []
  for (const node of nodes) {
    if (node.kind === 'entry' && !node.disabled) out.push(node.id)
    if (node.children?.length) out.push(...leafIds(node.children))
  }
  return out
}

function syncCount() {
  const keys = treeRef.value?.getCheckedKeys(true) ?? []
  checkedCount.value = keys.filter((id) => id.startsWith('e:')).length
}

function onCheck() {
  syncCount()
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
  const ids = (treeRef.value?.getCheckedKeys(true) ?? [])
    .filter((id) => id.startsWith('e:'))
    .map((id) => id.slice(2))
  if (!ids.length) return
  emit('confirm', ids)
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
    title="批量下载讲义"
    width="min(92vw, 480px)"
    class="handout-batch-dialog"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :show-close="!busy"
  >
    <p class="handout-batch__hint">勾选分类或讲义，下载为 Word。勾选文件夹会带上它下面能下载的讲义。</p>
    <div class="handout-batch__toolbar">
      <el-button size="small" :disabled="busy || !treeData.length" @click="selectAll">全选</el-button>
      <el-button size="small" :disabled="busy || !checkedCount" @click="clearAll">取消全选</el-button>
      <span class="handout-batch__count">已选 {{ checkedCount }} 篇</span>
    </div>
    <el-tree
      v-if="open"
      ref="treeRef"
      class="handout-batch__tree"
      :data="treeData"
      show-checkbox
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :expand-on-click-node="false"
      :check-on-click-node="true"
      :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
      @check="onCheck"
    >
      <template #default="{ data, node }">
        <span class="handout-batch__node" :class="`is-${data.kind}`">
          <el-icon class="handout-batch__icon">
            <Document v-if="data.kind === 'entry'" />
            <FolderOpened v-else-if="node.expanded" />
            <Folder v-else />
          </el-icon>
          {{ data.label }}
        </span>
      </template>
    </el-tree>
    <p v-if="!treeData.length" class="handout-batch__empty">当前没有可下载的讲义。</p>
    <template #footer>
      <el-button :disabled="busy" @click="onCancel">取消</el-button>
      <el-button type="primary" :loading="busy" :disabled="!checkedCount" @click="onConfirm">
        下载 Word
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.handout-batch__hint {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.handout-batch__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.handout-batch__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--app-text-muted);
}

.handout-batch__tree {
  max-height: min(52vh, 420px);
  overflow: auto;
  padding: 4px 0;
  border: 1px solid var(--app-border-soft, #e2e8f0);
  border-radius: 10px;
}

.handout-batch__tree :deep(.el-tree-node__content) {
  min-height: 36px;
  height: auto;
  padding: 4px 8px;
}

.handout-batch__node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;
}

.handout-batch__icon {
  flex-shrink: 0;
  color: #d97706;
}

.handout-batch__node.is-entry .handout-batch__icon {
  color: #64748b;
}

.handout-batch__empty {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}
</style>
