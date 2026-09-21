<!-- 项目管理：仅管理员。目录树 + 查看 / 下载，源码不进 Git。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Document, Download, Folder, FolderOpened } from '@element-plus/icons-vue'
import ProjectCodeBatchDialog from '@/components/ProjectCodeBatchDialog.vue'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import { exportProjectCodeDocx } from '@/utils/project-code/projectCodeDocx'
import {
  collectProjectCodePathsUnder,
  flattenProjectCodeRows,
  loadProjectCodeFiles,
  loadProjectCodeTree,
  type ProjectCodeNode,
} from '@/utils/project-code/projectCodeApi'

const router = useRouter()
const tree = ref<ProjectCodeNode[]>([])
const count = ref(0)
const hint = ref('')
const loading = ref(true)
const error = ref('')
const expanded = ref<Record<string, boolean>>({})
const busy = ref('')
const batchOpen = ref(false)

const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

const rows = computed(() => flattenProjectCodeRows(tree.value, expanded.value))

async function load() {
  if (!isAdmin.value) {
    void router.replace({ name: 'home' })
    return
  }
  loading.value = true
  error.value = ''
  try {
    const pack = await loadProjectCodeTree()
    tree.value = pack.tree
    count.value = pack.count
    hint.value = pack.message || ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '读取目录失败'
  } finally {
    loading.value = false
  }
}

function toggle(id: string, expandable: boolean) {
  if (!expandable) return
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function openFile(filePath: string) {
  void router.push({
    name: 'project-code-file',
    query: { p: filePath },
  })
}

async function exportDocx(title: string, paths: string[]): Promise<boolean> {
  if (!paths.length) {
    ElMessage.warning('没有可下载的源码')
    return false
  }
  busy.value = `正在读取 ${paths.length} 个文件…`
  try {
    const files = await loadProjectCodeFiles(paths)
    if (!files.length) throw new Error('没有可下载的源码')
    busy.value = '正在整理 Word…'
    await exportProjectCodeDocx(title, files, (done, total) => {
      busy.value = `正在整理 Word（${done}/${total}）…`
    })
    return true
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '下载失败')
    return false
  } finally {
    busy.value = ''
  }
}

async function onDownload(path: string, name: string) {
  await exportDocx(name || '源码', collectProjectCodePathsUnder(tree.value, path))
}

async function onBatchConfirm(paths: string[]) {
  const title = paths.length === 1 ? paths[0]!.split('/').pop() || '源码' : '0521源码'
  const ok = await exportDocx(title, paths)
  if (ok) batchOpen.value = false
}

onMounted(load)
</script>

<template>
  <section class="pc-page">
    <header class="pc-page__head">
      <div class="pc-page__title-row">
        <h2 class="pc-page__title">项目管理</h2>
        <el-button
          size="small"
          :icon="Download"
          :disabled="!count || Boolean(busy)"
          @click="batchOpen = true"
        >
          批量下载
        </el-button>
      </div>
      <p class="pc-page__lead">仅管理员可查阅。点文件查看源码；下载会整理成 Word，每个源文件另起一页。正文保存在云端，手机和其他设备登录后即可打开。</p>
      <p v-if="busy" class="pc-page__stats">{{ busy }}</p>
      <p v-else-if="count" class="pc-page__stats">共 {{ count }} 个文件</p>
    </header>

    <div class="pc-card">
      <div class="pc-card__head">
        <span>源码目录</span>
        <span class="pc-card__count">{{ count }}</span>
      </div>
      <p v-if="loading" class="pc-status">正在读取目录…</p>
      <p v-else-if="error" class="pc-status pc-status--err">
        {{ error }}
        <el-button size="small" @click="load">重试</el-button>
      </p>
      <p v-else-if="hint && !count" class="pc-status">{{ hint }}</p>
      <ul v-else class="pc-tree" role="tree">
        <li
          v-for="row in rows"
          :key="`${row.kind}-${row.id}`"
          class="pc-tree__row"
          :class="{ 'is-root': row.kind === 'dir' && row.depth === 0 }"
          :style="{ '--tree-depth': row.depth }"
        >
          <div class="pc-tree__main">
            <button
              v-if="row.kind === 'dir' && row.expandable"
              type="button"
              class="pc-tree__caret"
              :class="{ 'is-open': expanded[row.id] }"
              :aria-label="expanded[row.id] ? '折叠' : '展开'"
              @click.stop="toggle(row.id, true)"
            >
              <el-icon :size="12"><ArrowRight /></el-icon>
            </button>
            <span v-else class="pc-tree__caret is-spacer" aria-hidden="true" />
            <div
              v-if="row.kind === 'dir'"
              class="pc-tree__dir"
              :class="{ 'is-open': expanded[row.id] }"
              @click="toggle(row.id, row.expandable)"
            >
              <el-icon :size="16">
                <FolderOpened v-if="expanded[row.id]" />
                <Folder v-else />
              </el-icon>
              <span class="pc-tree__name">{{ row.name }}</span>
            </div>
            <button v-else type="button" class="pc-tree__file" @click="openFile(row.path)">
              <el-icon :size="16"><Document /></el-icon>
              <span class="pc-tree__name">{{ row.name }}</span>
            </button>
            <button
              type="button"
              class="pc-tree__dl"
              title="下载"
              :disabled="Boolean(busy)"
              @click.stop="onDownload(row.path, row.name)"
            >
              <el-icon :size="14"><Download /></el-icon>
            </button>
          </div>
        </li>
      </ul>
    </div>
    <ProjectCodeBatchDialog v-model="batchOpen" :tree="tree" :busy="Boolean(busy)" @confirm="onBatchConfirm" />
  </section>
</template>

<style scoped>
.pc-page {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 16px 12px;
}

.pc-page__head {
  flex-shrink: 0;
  margin-bottom: 14px;
}

.pc-page__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.pc-page__title {
  margin: 0;
  flex: none;
  font-size: 1.28rem;
  font-weight: 800;
  line-height: 1.35;
}

.pc-page__lead,
.pc-page__stats {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.pc-page__stats {
  margin-top: 6px;
  color: var(--app-text);
}

.pc-card {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgb(15 23 42 / 5%);
}

.pc-card__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 700;
  background: color-mix(in srgb, var(--app-primary-soft) 32%, #fff);
}

.pc-card__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.pc-status {
  margin: 0;
  padding: 16px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.pc-status--err {
  color: var(--app-danger);
}

.pc-tree {
  flex: 1 1 0;
  min-height: 0;
  margin: 0;
  padding: 6px 8px 12px;
  list-style: none;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.pc-tree__main {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  min-height: 2.6em;
  padding: 6px 8px 6px calc(6px + var(--tree-depth, 0) * 18px);
  border-radius: 10px;
}

.pc-tree__row.is-root .pc-tree__main {
  background: color-mix(in srgb, var(--app-primary-soft) 34%, #fff);
}

.pc-tree__caret,
.pc-tree__dl {
  flex: 0 0 1.6em;
  width: 1.6em;
  height: 1.6em;
  margin-top: 0.15em;
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
}

.pc-tree__caret.is-open {
  transform: rotate(90deg);
  color: var(--app-primary);
}

.pc-tree__caret.is-spacer {
  visibility: hidden;
  cursor: default;
}

.pc-tree__dir,
.pc-tree__file {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 6px 4px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.pc-tree__name {
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.35;
}

.pc-tree__file {
  color: #1d4ed8;
}

.pc-tree__dl:hover {
  background: rgb(15 23 42 / 7%);
  color: var(--app-primary);
}

@media (min-width: 901px) {
  .pc-page {
    padding: 24px 40px 24px;
  }

  .pc-page__head,
  .pc-card {
    width: 100%;
    max-width: 80rem;
    margin-inline: auto;
  }
}
</style>
