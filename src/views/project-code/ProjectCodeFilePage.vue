<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import { loadProjectCodeFile, type ProjectCodeFile } from '@/utils/project-code/projectCodeApi'
import { exportProjectCodeDocx } from '@/utils/project-code/projectCodeDocx'
import { countProjectCodeLines, highlightProjectCode } from '@/utils/project-code/projectCodeHighlight'

const route = useRoute()
const router = useRouter()
const file = ref<ProjectCodeFile | null>(null)
const error = ref('')
const loading = ref(true)
const busy = ref(false)

const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

const filePath = computed(() => String(route.query.p ?? ''))
const title = computed(() => file.value?.name || '源码')
useAppChromeTitle(title)

const highlighted = computed(() => highlightProjectCode(file.value?.content ?? ''))
const lineCount = computed(() => countProjectCodeLines(file.value?.content ?? ''))
const lineNumbers = computed(() => {
  const n = lineCount.value
  const out: number[] = []
  for (let i = 1; i <= n; i += 1) out.push(i)
  return out
})

async function load() {
  if (!isAdmin.value) {
    void router.replace({ name: 'home' })
    return
  }
  loading.value = true
  error.value = ''
  try {
    file.value = await loadProjectCodeFile(filePath.value)
  } catch (e) {
    file.value = null
    error.value = e instanceof Error ? e.message : '读取失败'
  } finally {
    loading.value = false
  }
}

async function onDownload() {
  if (!file.value) return
  busy.value = true
  try {
    await exportProjectCodeDocx(file.value.name, [file.value])
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '下载失败')
  } finally {
    busy.value = false
  }
}

onMounted(load)
watch(filePath, load)
</script>

<template>
  <section class="pc-file">
    <header class="pc-file__bar">
      <p class="pc-file__path">{{ file?.path || filePath }}</p>
      <el-button size="small" :icon="Download" :disabled="!file || busy" @click="onDownload">
        下载
      </el-button>
    </header>
    <p v-if="loading" class="pc-file__status">正在打开…</p>
    <p v-else-if="error" class="pc-file__status is-err">{{ error }}</p>
    <div v-else class="pc-editor" role="region" :aria-label="title">
      <div class="pc-editor__gutter" aria-hidden="true">
        <span v-for="n in lineNumbers" :key="n">{{ n }}</span>
      </div>
      <pre class="pc-editor__code" v-html="highlighted" />
    </div>
  </section>
</template>

<style scoped>
.pc-file {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #181818;
  color: #d4d4d4;
}

.pc-file__bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #2b2b2b;
  background: #1f1f1f;
}

.pc-file__path {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Cascadia Code', 'Segoe UI Mono', Consolas, ui-monospace, monospace;
  font-size: 12.5px;
  color: #9cdcfe;
}

.pc-file__status {
  margin: 0;
  padding: 20px 16px;
  font-size: 13px;
  color: #8b949e;
}

.pc-file__status.is-err {
  color: #f85149;
}

.pc-editor {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #3d3d3d transparent;
  font-family: 'Cascadia Code', 'Segoe UI Mono', Consolas, ui-monospace, monospace;
  font-size: 13px;
  line-height: 20px;
  tab-size: 2;
}

.pc-editor__gutter {
  display: flex;
  flex-direction: column;
  padding: 12px 10px 24px 16px;
  border-right: 1px solid #2b2b2b;
  background: #1b1b1b;
  color: #6e7681;
  text-align: right;
  user-select: none;
}

.pc-editor__code {
  margin: 0;
  padding: 12px 18px 24px 14px;
  background: #181818;
  color: #d4d4d4;
  white-space: pre;
  overflow-wrap: normal;
  word-break: normal;
}

.pc-editor :deep(.tok-kw) {
  color: #c586c0;
}

.pc-editor :deep(.tok-fn) {
  color: #dcdcaa;
}

.pc-editor :deep(.tok-ty) {
  color: #4ec9b0;
}

.pc-editor :deep(.tok-str),
.pc-editor :deep(.tok-tmpl) {
  color: #ce9178;
}

.pc-editor :deep(.tok-cmt) {
  color: #6a9955;
  font-style: italic;
}

.pc-editor :deep(.tok-num),
.pc-editor :deep(.tok-lit) {
  color: #b5cea8;
}

.pc-editor :deep(.tok-op) {
  color: #d4d4d4;
}

.pc-editor :deep(.tok-id) {
  color: #9cdcfe;
}

@media (min-width: 901px) {
  .pc-file__bar {
    padding: 10px 28px;
  }
}
</style>
