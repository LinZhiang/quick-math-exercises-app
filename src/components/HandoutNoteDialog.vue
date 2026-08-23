<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { compactTrailingEmptyHtml, richHtmlToPlainMultiline } from '@/utils/markdown/richTextHtml'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    bodyHtml: string
    editable?: boolean
  }>(),
  { editable: false },
)

const emit = defineEmits<{
  'update:modelValue': [boolean]
  save: [payload: { title: string; bodyPlain: string }]
  remove: []
}>()

const draftTitle = ref('')
const draftBody = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    draftTitle.value = props.title
    draftBody.value = richHtmlToPlainMultiline(props.bodyHtml)
  },
)

function close() {
  emit('update:modelValue', false)
}

function onSave() {
  const title = draftTitle.value.trim()
  if (!title) {
    ElMessage.warning('请填写备注标签')
    return
  }
  emit('save', { title: title.slice(0, 24), bodyPlain: draftBody.value.slice(0, 1500) })
  close()
}

async function onRemove() {
  emit('remove')
  close()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="editable ? '编辑备注' : title || '备注'"
    width="min(28rem, 92vw)"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="editable">
      <el-input v-model="draftTitle" maxlength="24" show-word-limit placeholder="备注标签" />
      <el-input
        v-model="draftBody"
        class="note-dialog__body"
        type="textarea"
        :rows="10"
        maxlength="1500"
        show-word-limit
        placeholder="备注内容，可稍后填写"
      />
    </template>
    <div v-else class="note-dialog__view">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="compactTrailingEmptyHtml(bodyHtml)" class="note-dialog__html" v-html="compactTrailingEmptyHtml(bodyHtml)" />
      <p v-else class="note-dialog__empty">还没有写备注内容。</p>
    </div>
    <template #footer>
      <template v-if="editable">
        <el-button type="danger" plain @click="onRemove">删除备注</el-button>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
      <el-button v-else type="primary" @click="close">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.note-dialog__body {
  margin-top: 10px;
}

.note-dialog__body :deep(.el-textarea__inner) {
  height: 240px !important;
  resize: none;
}

.note-dialog__view {
  height: 240px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
}

.note-dialog__html :deep(p) {
  margin: 0 0 0.5em;
}

.note-dialog__html :deep(p:last-child) {
  margin-bottom: 0;
}

.note-dialog__empty {
  margin: 0;
  color: var(--app-text-muted, #64748b);
}
</style>
