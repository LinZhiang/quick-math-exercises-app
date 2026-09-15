<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { exportHandoutDocx, exportHandoutMarkdown } from '@/utils/markdown/handoutExport'

const props = defineProps<{
  modelValue: boolean
  title: string
  markdown: string
  html: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const busy = ref<'md' | 'docx' | ''>('')

function close() {
  if (busy.value) return
  emit('update:modelValue', false)
}

async function exportMd() {
  busy.value = 'md'
  try {
    await exportHandoutMarkdown(props.title, props.markdown)
    ElMessage.success('已导出 Markdown')
    emit('update:modelValue', false)
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return
    ElMessage.error(e instanceof Error ? e.message : '导出失败')
  } finally {
    busy.value = ''
  }
}

async function exportDocx() {
  busy.value = 'docx'
  try {
    await exportHandoutDocx(props.title, props.html)
    ElMessage.success('已导出 Word')
    emit('update:modelValue', false)
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return
    ElMessage.error(e instanceof Error ? e.message : '导出失败')
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="导出文档"
    width="min(92vw, 420px)"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :show-close="!busy"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="handout-export__hint">
      将「{{ title || '当前讲义' }}」保存到手机或电脑。Word 按网页预览排版，不另加封面标题。
    </p>
    <div class="handout-export__actions">
      <el-button :loading="busy === 'md'" :disabled="!!busy && busy !== 'md'" @click="exportMd">
        Markdown（.md）
      </el-button>
      <el-button
        type="primary"
        :loading="busy === 'docx'"
        :disabled="!!busy && busy !== 'docx'"
        @click="exportDocx"
      >
        Word（.docx）
      </el-button>
    </div>
    <template #footer>
      <el-button :disabled="!!busy" @click="close">取消</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.handout-export__hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--app-text-muted, #64748b);
}

.handout-export__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
