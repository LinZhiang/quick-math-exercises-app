<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { compactTrailingEmptyHtml, richHtmlIsEmpty } from '@/utils/markdown/richTextHtml'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    minHeight?: string
    /** 撑满父级高度，正文在编辑区内滚动 */
    fill?: boolean
  }>(),
  {
    placeholder: '请输入…',
    minHeight: '132px',
    fill: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const showPlaceholder = computed(() => richHtmlIsEmpty(props.modelValue))

function currentHtml(): string {
  return compactTrailingEmptyHtml(editorRef.value?.innerHTML ?? '')
}

function caretNode(): Node | null {
  return typeof document === 'undefined' ? null : document.getSelection()?.focusNode ?? null
}

function isEmptyBlock(el: Element): boolean {
  if (el.querySelector('img, table, video, canvas, iframe')) return false
  return !(el.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function compactTrailingEmptyBlocks() {
  const root = editorRef.value
  if (!root) return
  const caret = caretNode()
  const holdsCaret = (el: Element) => Boolean(caret && (el === caret || el.contains(caret)))
  const dropTail = (node: ChildNode) => {
    if (caret && (node === caret || node.contains?.(caret))) return false
    root.removeChild(node)
    return true
  }
  while (root.lastChild) {
    const last = root.lastChild
    if (last.nodeType === Node.TEXT_NODE && !(last.textContent || '').trim()) {
      if (!dropTail(last)) break
      continue
    }
    if (last.nodeName === 'BR') {
      if (!dropTail(last)) break
      continue
    }
    break
  }
  while (root.children.length >= 2) {
    const last = root.lastElementChild
    const prev = last?.previousElementSibling
    if (!last || !prev || !isEmptyBlock(last) || !isEmptyBlock(prev)) break
    if (holdsCaret(last)) prev.remove()
    else last.remove()
  }
  if (richHtmlIsEmpty(root.innerHTML) && root.innerHTML !== '') {
    root.innerHTML = ''
  }
}

function emitHtml() {
  compactTrailingEmptyBlocks()
  emit('update:modelValue', currentHtml())
}

function applyHtml(html: string) {
  if (!editorRef.value) return
  const next = compactTrailingEmptyHtml(html ?? '')
  if (editorRef.value.innerHTML === next) return
  editorRef.value.innerHTML = next
}

onMounted(() => {
  try {
    document.execCommand('defaultParagraphSeparator', false, 'p')
  } catch {
    /* ignore */
  }
  applyHtml(props.modelValue)
})

watch(
  () => props.modelValue,
  (v) => {
    if (!editorRef.value) return
    if (currentHtml() === compactTrailingEmptyHtml(v ?? '')) return
    applyHtml(v)
  },
)

function run(command: string, value?: string) {
  editorRef.value?.focus()
  document.execCommand(command, false, value)
  emitHtml()
}

function onInput() {
  emitHtml()
}

function onKeyup(ev: KeyboardEvent) {
  if (ev.key === 'Backspace' || ev.key === 'Delete') emitHtml()
}

function onPaste(ev: ClipboardEvent) {
  const items = ev.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      ev.preventDefault()
      const file = item.getAsFile()
      if (file) void insertImageFile(file)
      return
    }
  }
}

async function insertImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片')
    return
  }
  const dataUrl = await compressImageFile(file)
  editorRef.value?.focus()
  document.execCommand('insertImage', false, dataUrl)
  await nextTick()
  emitHtml()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxEdge = 1600
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round((img.naturalWidth || 1) * scale))
      canvas.height = Math.max(1, Math.round((img.naturalHeight || 1) * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        void readFileAsDataUrl(file).then(resolve, reject)
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.86))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      void readFileAsDataUrl(file).then(resolve, reject)
    }
    img.src = url
  })
}

function onPickImage() {
  fileRef.value?.click()
}

async function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await insertImageFile(file)
}
</script>

<template>
  <div class="rte" :class="{ 'is-focused': focused, 'is-fill': fill }">
    <div class="rte__bar" role="toolbar" aria-label="富文本工具栏">
      <div class="rte__group">
        <button type="button" title="粗体" aria-label="粗体" @mousedown.prevent="run('bold')">
          <span class="rte__ico rte__ico--b">B</span>
        </button>
        <button type="button" title="斜体" aria-label="斜体" @mousedown.prevent="run('italic')">
          <span class="rte__ico rte__ico--i">I</span>
        </button>
        <button type="button" title="下划线" aria-label="下划线" @mousedown.prevent="run('underline')">
          <span class="rte__ico rte__ico--u">U</span>
        </button>
      </div>
      <div class="rte__group">
        <button type="button" title="无序列表" aria-label="无序列表" @mousedown.prevent="run('insertUnorderedList')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="3" cy="4" r="1.2" fill="currentColor" />
            <circle cx="3" cy="8" r="1.2" fill="currentColor" />
            <circle cx="3" cy="12" r="1.2" fill="currentColor" />
            <rect x="6" y="3.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="7.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="11.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="有序列表" aria-label="有序列表" @mousedown.prevent="run('insertOrderedList')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <text x="1" y="5.5" font-size="5.5" font-weight="700" fill="currentColor">1</text>
            <text x="1" y="9.6" font-size="5.5" font-weight="700" fill="currentColor">2</text>
            <text x="1" y="13.7" font-size="5.5" font-weight="700" fill="currentColor">3</text>
            <rect x="6" y="3.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="7.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="11.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div class="rte__group">
        <button type="button" title="插入图片" aria-label="插入图片" @mousedown.prevent="onPickImage">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="1.5" y="2.5" width="13" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.3" />
            <circle cx="5.2" cy="6" r="1.2" fill="currentColor" />
            <path d="M2.8 12.2 6.4 8.4l2.2 2.2 2.1-2.6 2.5 4.2H2.8z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="清除格式" aria-label="清除格式" @mousedown.prevent="run('removeFormat')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3 4h10M6.2 4 7.4 13h1.4L10 4M5 13h6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="rte__wrap">
      <div v-if="showPlaceholder" class="rte__placeholder">{{ placeholder }}</div>
      <div
        ref="editorRef"
        class="rte__editor"
        :style="fill ? undefined : { minHeight }"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        @focus="focused = true"
        @blur="
          focused = false;
          emitHtml()
        "
        @input="onInput"
        @keyup="onKeyup"
        @paste="onPaste"
      />
    </div>
    <input ref="fileRef" type="file" accept="image/*" class="rte__file" @change="onFileChange">
  </div>
</template>

<style scoped>
.rte {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.rte.is-fill {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rte.is-focused {
  border-color: color-mix(in srgb, var(--el-color-primary) 55%, #cbd5e1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 16%, transparent);
}

.rte__bar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #eef2f6;
  background: #f8fafc;
}

.rte__group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 8px;
  border-right: 1px solid #e5e7eb;
}

.rte__group:last-child {
  border-right: none;
  padding-right: 0;
}

.rte__bar button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  cursor: pointer;
}

.rte__bar button:hover {
  background: #fff;
  color: #0f172a;
}

.rte__ico {
  font-size: 13px;
  line-height: 1;
  font-family: Georgia, 'Times New Roman', serif;
}

.rte__ico--b {
  font-weight: 800;
}

.rte__ico--i {
  font-style: italic;
  font-weight: 700;
}

.rte__ico--u {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rte__wrap {
  position: relative;
}

.rte.is-fill .rte__wrap {
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
}

.rte__placeholder {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  pointer-events: none;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.55;
}

.rte__editor {
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.7;
  outline: none;
  color: #1e293b;
}

.rte.is-fill .rte__editor {
  min-height: 100%;
  height: auto;
  overflow: visible;
  padding-bottom: 12px;
}

.rte__editor :deep(p) {
  margin: 0 0 0.45em;
}

.rte__editor :deep(p:last-child) {
  margin-bottom: 0;
}

.rte__editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.rte__editor :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.95em;
}

.rte__editor :deep(th),
.rte__editor :deep(td) {
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.rte__editor :deep(th) {
  background: #f8fafc;
  font-weight: 700;
}

.rte__file {
  display: none;
}
</style>
