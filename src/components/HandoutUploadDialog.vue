<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  folders: { id: string; label: string }[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { parentId: string; files: File[] }): void
}>()

const parentId = ref('')
const files = ref<File[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

watch(
  () => props.modelValue,
  (on) => {
    if (!on) return
    parentId.value = props.folders[0]?.id || ''
    files.value = []
    if (inputRef.value) inputRef.value.value = ''
  },
)

function onPick(ev: Event) {
  const list = (ev.target as HTMLInputElement).files
  files.value = list ? [...list] : []
}

function submit() {
  if (!parentId.value) {
    ElMessage.warning('请先新建一个大类，再把文件放进去')
    return
  }
  if (!files.value.length) {
    ElMessage.warning('请选择 docx 或 md 文件')
    return
  }
  emit('confirm', { parentId: parentId.value, files: files.value })
}
</script>

<template>
  <el-dialog v-model="open" title="上传讲义" width="440px" append-to-body>
    <p class="handout-upload__lead">支持 .docx 和 .md，可多选。会尽量保留标题、加粗、颜色、列表、表格和图片。</p>
    <label class="handout-upload__label">
      放到哪个分类
      <select v-model="parentId" class="handout-upload__select">
        <option v-if="!folders.length" value="" disabled>还没有分类</option>
        <option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.label }}</option>
      </select>
    </label>
    <label class="handout-upload__file">
      <input ref="inputRef" type="file" accept=".docx,.md,.markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown" multiple @change="onPick" />
      <span>{{ files.length ? `已选 ${files.length} 个文件` : '选择文件' }}</span>
    </label>
    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" :loading="busy" @click="submit">上传</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.handout-upload__lead {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}
.handout-upload__label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #334155;
}
.handout-upload__select {
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 8px;
  background: #fff;
}
.handout-upload__file {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
}
</style>
