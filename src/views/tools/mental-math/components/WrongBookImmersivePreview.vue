<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import {
  acquireWrongBookOverlayLock,
  releaseWrongBookOverlayLock,
} from '@/utils/wrongBookOverlayLock'

export type WrongBookPreviewOption = {
  text: string
  isCorrect?: boolean
  isChosen?: boolean
}

export type WrongBookPreviewItem = {
  key: string
  expression: string
  /** 若提供则优先用 HTML 渲染题面（如阅读理解关键句高亮） */
  expressionHtml?: string
  correctAnswer: string
  chosenAnswer?: string
  options?: WrongBookPreviewOption[]
  explanation?: string
  /** 较长阅读/资料分析题干用散文样式 */
  prose?: boolean
  note?: string
}

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    items: WrongBookPreviewItem[]
    index: number
    /** 是否展示备注区 */
    enableNote?: boolean
    /** 是否展示删除本题 */
    enableDelete?: boolean
  }>(),
  {
    enableNote: true,
    enableDelete: true,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:index': [value: number]
  delete: [key: string]
  'save-note': [key: string, note: string]
}>()

const noteEditing = ref(false)
const noteDraft = ref('')
const noteSaving = ref(false)

const current = computed(() => props.items[props.index] ?? null)
const total = computed(() => props.items.length)
const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < total.value - 1)
const expressionProse = computed(() => {
  const item = current.value
  if (!item) return false
  if (item.prose) return true
  return item.expression.length > 48 || item.expression.includes('\n')
})

const noteHtml = computed(() => {
  const note = current.value?.note?.trim()
  return note ? markdownToDisplaySafeHtml(note) : ''
})

function close() {
  noteEditing.value = false
  emit('update:open', false)
}

function syncNoteDraftFromCurrent() {
  noteDraft.value = current.value?.note ?? ''
  noteEditing.value = false
  noteSaving.value = false
}

function goPrev() {
  if (!canPrev.value || noteEditing.value) return
  emit('update:index', props.index - 1)
}

function goNext() {
  if (!canNext.value || noteEditing.value) return
  emit('update:index', props.index + 1)
}

function startEditNote() {
  noteDraft.value = current.value?.note ?? ''
  noteEditing.value = true
}

function cancelEditNote() {
  noteDraft.value = current.value?.note ?? ''
  noteEditing.value = false
}

function saveNote() {
  if (!current.value) return
  noteSaving.value = true
  try {
    emit('save-note', current.value.key, noteDraft.value)
    noteEditing.value = false
  } finally {
    noteSaving.value = false
  }
}

function onDelete() {
  if (!current.value) return
  emit('delete', current.value.key)
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    if (noteEditing.value) {
      cancelEditNote()
      return
    }
    close()
    return
  }
  if (noteEditing.value) return
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goPrev()
    return
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    goNext()
  }
}

let overlayLocked = false

watch(
  () => props.open,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      if (!overlayLocked) {
        acquireWrongBookOverlayLock()
        overlayLocked = true
      }
      syncNoteDraftFromCurrent()
    } else {
      if (overlayLocked) {
        releaseWrongBookOverlayLock()
        overlayLocked = false
      }
      noteEditing.value = false
    }
  },
)

watch(
  () => [props.index, current.value?.key, current.value?.note] as const,
  () => {
    if (!props.open) return
    syncNoteDraftFromCurrent()
  },
)

watch(
  () => props.items.length,
  (len) => {
    if (!props.open) return
    if (len <= 0) {
      close()
      return
    }
    if (props.index >= len) {
      emit('update:index', len - 1)
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (overlayLocked) {
    releaseWrongBookOverlayLock()
    overlayLocked = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && current"
      class="wb-preview"
      role="dialog"
      aria-modal="true"
      :aria-label="`${title} · 错题预览`"
    >
      <div class="wb-preview__panel play-panel">
        <div class="play-top">
          <div class="play-meta">
            <div class="play-meta__main">
              <span class="play-mode">{{ title }} · 错题预览</span>
              <span class="play-score">
                第 <strong>{{ index + 1 }}</strong> / {{ total }} 题
              </span>
            </div>
            <div class="session-actions session-actions--inline">
              <el-button
                v-if="enableDelete"
                size="small"
                type="danger"
                plain
                @click="onDelete"
              >
                删除本题
              </el-button>
              <el-button size="small" @click="close">退出预览</el-button>
            </div>
          </div>
        </div>

        <div class="question-block">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p
            v-if="current.expressionHtml"
            class="question-expression"
            :class="{ 'question-expression--prose': expressionProse }"
            v-html="current.expressionHtml"
          />
          <p
            v-else
            class="question-expression"
            :class="{ 'question-expression--prose': expressionProse }"
          >
            {{ current.expression }}
          </p>
          <p
            v-if="current.expressionHtml?.includes('reading-key-sentence')"
            class="wb-preview__key-hint"
          >
            黄底标记为正确选项依据句
          </p>
        </div>

        <ul v-if="current.options?.length" class="option-list">
          <li v-for="(opt, idx) in current.options" :key="idx">
            <div
              class="option-btn option-btn--static"
              :class="{
                'is-correct': opt.isCorrect,
                'is-chosen': opt.isChosen && !opt.isCorrect,
              }"
            >
              <span class="option-btn__key">{{ idx + 1 }}</span>
              <span class="option-btn__val">{{ opt.text }}</span>
              <span v-if="opt.isCorrect" class="option-btn__tag option-btn__tag--ok">正确</span>
              <span
                v-else-if="opt.isChosen"
                class="option-btn__tag option-btn__tag--bad"
              >你的选择</span>
            </div>
          </li>
        </ul>

        <div class="wb-preview__answers">
          <p v-if="current.chosenAnswer" class="wb-preview__line wb-preview__line--bad">
            你的答案：{{ current.chosenAnswer }}
          </p>
          <p class="wb-preview__line wb-preview__line--ok">
            正确答案：{{ current.correctAnswer }}
          </p>
          <p v-if="current.explanation" class="wb-preview__exp">
            <span class="wb-preview__exp-label">解析</span>
            {{ current.explanation }}
          </p>
        </div>

        <section v-if="enableNote" class="wb-preview__note">
          <div class="wb-preview__note-head">
            <strong>备注</strong>
            <el-button
              v-if="!noteEditing"
              size="small"
              text
              type="primary"
              @click="startEditNote"
            >
              {{ current.note?.trim() ? '编辑' : '添加备注' }}
            </el-button>
          </div>
          <template v-if="noteEditing">
            <el-input
              v-model="noteDraft"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="支持 Markdown，如标题、列表、加粗等"
            />
            <div class="wb-preview__note-actions">
              <el-button size="small" type="primary" :loading="noteSaving" @click="saveNote">
                保存
              </el-button>
              <el-button size="small" plain @click="cancelEditNote">取消</el-button>
            </div>
          </template>
          <template v-else-if="current.note?.trim()">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="wb-preview__note-md deepseek-md" v-html="noteHtml" />
          </template>
          <p v-else class="wb-preview__note-empty">暂无备注</p>
        </section>

        <div class="wb-preview__nav">
          <el-button size="default" :disabled="!canPrev || noteEditing" @click="goPrev">
            上一题
          </el-button>
          <el-button
            size="default"
            type="primary"
            :disabled="!canNext || noteEditing"
            @click="goNext"
          >
            下一题
          </el-button>
        </div>
        <p class="wb-preview__hint">键盘 ← / → 切换，Esc 退出</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wb-preview {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  background: var(--app-bg, #f5f6f8);
  padding: 16px;
  overflow: auto;
}

.wb-preview__panel {
  flex: 1;
  width: min(720px, 100%);
  margin: 0 auto;
  border: 1px solid var(--app-border-soft);
  border-radius: 16px;
  padding: 20px 22px 24px;
  background: var(--app-surface);
  box-sizing: border-box;
}

.play-top {
  margin-bottom: 28px;
}

.play-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 10px;
  font-size: 14px;
}

.play-meta__main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  min-width: 0;
}

.play-mode {
  font-weight: 600;
}

.play-score strong {
  font-size: 1.25em;
  color: var(--el-color-primary);
}

.session-actions--inline {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 0;
}

.question-block {
  text-align: center;
  margin-bottom: 24px;
}

.question-expression {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: pre-line;
  line-height: 1.45;
  word-break: break-word;
}

.question-expression--prose {
  font-size: clamp(1.05rem, 2.8vw, 1.35rem);
  font-weight: 650;
  text-align: left;
  max-width: 36em;
  margin-left: auto;
  margin-right: auto;
}

.question-expression :deep(mark.reading-key-sentence) {
  padding: 0 2px;
  border-radius: 3px;
  background: color-mix(in srgb, #fde68a 88%, #fff);
  color: inherit;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.wb-preview__key-hint {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--app-text-muted);
  text-align: left;
  max-width: 36em;
  margin-left: auto;
  margin-right: auto;
}

.option-list {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: grid;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  text-align: left;
  box-sizing: border-box;
}

.option-btn--static {
  cursor: default;
}

.option-btn.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 70%, transparent);
}

.option-btn.is-chosen {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 55%, transparent);
}

.option-btn__key {
  flex-shrink: 0;
  width: 1.6em;
  height: 1.6em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--app-surface);
  font-size: 0.85em;
  font-weight: 700;
  color: var(--app-text-muted);
}

.option-btn__val {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.option-btn__tag {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
}

.option-btn__tag--ok {
  color: var(--el-color-success);
}

.option-btn__tag--bad {
  color: var(--el-color-danger);
}

.wb-preview__answers {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
  text-align: left;
}

.wb-preview__line {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.5;
  word-break: break-word;
}

.wb-preview__line--ok {
  color: var(--el-color-success);
}

.wb-preview__line--bad {
  color: var(--el-color-danger);
}

.wb-preview__exp {
  margin: 4px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--app-surface-alt);
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-line;
  word-break: break-word;
  color: var(--app-text);
}

.wb-preview__exp-label {
  display: inline-block;
  margin-right: 8px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.wb-preview__note {
  margin-bottom: 28px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--app-border-soft);
  background: var(--app-surface-alt);
  text-align: left;
}

.wb-preview__note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.wb-preview__note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.wb-preview__note-md {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.wb-preview__note-empty {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.wb-preview__nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.wb-preview__hint {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--app-text-muted);
}

@media (max-width: 640px) {
  .wb-preview {
    padding: 10px;
  }

  .wb-preview__panel {
    padding: 16px 14px 20px;
  }

  .option-btn {
    font-size: 1rem;
    padding: 12px 12px;
  }
}
</style>
