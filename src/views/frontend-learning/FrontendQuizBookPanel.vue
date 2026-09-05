<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Document, Folder, FolderOpened } from '@element-plus/icons-vue'
import {
  frontendQuizBookTick,
  listFrontendQuizFavoriteRecords,
  listFrontendQuizWrongRecords,
} from '@/utils/frontend/frontendHandoutQuizStorage'
import {
  buildFrontendQuizBookTree,
  defaultExpandedQuizBookIds,
  flattenFrontendQuizBookRows,
  type FrontendQuizBookTreeNode,
} from '@/utils/frontend/frontendQuizBookTree'
import { loadFrontendLearningTree, type FrontendTreeNode } from '@/utils/frontend/frontendLearning'
import FrontendBusyHint from './FrontendBusyHint.vue'

const router = useRouter()
const tab = ref<'wrong' | 'favorite'>('wrong')
const catalog = ref<FrontendTreeNode[]>([])
const loading = ref(true)
const expanded = ref<Record<string, boolean>>({})

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

const treeRows = computed(() => flattenFrontendQuizBookRows(bookTree.value, expanded.value))

function toggleExpand(id: string) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function openNode(id: string) {
  void router.push({
    name: 'frontend-book-node',
    query: { id, tab: tab.value },
  })
}

watch(bookTree, (nodes) => {
  const ids = new Set<string>()
  const walk = (list: FrontendQuizBookTreeNode[]) => {
    for (const n of list) {
      ids.add(n.id)
      walk(n.children)
    }
  }
  walk(nodes)
  const next = { ...expanded.value }
  for (const id of Object.keys(next)) {
    if (!ids.has(id)) delete next[id]
  }
  expanded.value = { ...defaultExpandedQuizBookIds(nodes), ...next }
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
  <section class="cb-book">
    <div class="cb-book__tabs">
      <el-radio-group v-model="tab" size="small">
        <el-radio-button value="wrong">错题 {{ wrongs.length }}</el-radio-button>
        <el-radio-button value="favorite">收藏 {{ favs.length }}</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="loading" class="computer-busy-panel">
      <FrontendBusyHint text="正在读取题目分类…" />
    </div>
    <p v-else-if="!sourceRows.length" class="cb-book__empty">
      暂无记录。在目录或讲义里点「AI测验」作答后会出现在这里。
    </p>
    <template v-else>
      <p class="cb-book__meta">点进分类后查看题目，并可进行测验（默认原题）。</p>
      <ul v-if="treeRows.length" class="cb-book-tree" role="tree">
        <li v-for="row in treeRows" :key="row.id" class="cb-book-tree__row">
          <div
            class="cb-book-tree__main"
            :class="{ 'is-root': row.depth === 0 }"
            :style="{ '--tree-depth': row.depth }"
          >
            <button
              v-if="row.expandable"
              type="button"
              class="cb-book-tree__caret"
              :class="{ 'is-open': expanded[row.id] }"
              :aria-label="expanded[row.id] ? '折叠' : '展开'"
              @click.stop="toggleExpand(row.id)"
            >
              <el-icon :size="12"><ArrowRight /></el-icon>
            </button>
            <span v-else class="cb-book-tree__caret is-ghost" aria-hidden="true">
              <el-icon :size="12"><ArrowRight /></el-icon>
            </span>
            <button type="button" class="cb-book-tree__name" @click="openNode(row.id)">
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

.computer-busy-panel {
  flex: 1 1 0;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb-book__empty,
.cb-book__meta {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-book__meta {
  margin: 0;
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
</style>
