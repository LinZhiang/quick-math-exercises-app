<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HandoutNoteDialog from '@/components/HandoutNoteDialog.vue'
import {
  buildHandoutNoteHtml,
  compactTrailingEmptyHtml,
  plainTextToRichHtml,
  richHtmlIsEmpty,
} from '@/utils/markdown/richTextHtml'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    minHeight?: string
    /** 撑满父级高度，正文在编辑区内滚动 */
    fill?: boolean
    /** 在光标处插入讲义备注标签 */
    notes?: boolean
  }>(),
  {
    placeholder: '请输入…',
    minHeight: '132px',
    fill: false,
    notes: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const showPlaceholder = computed(() => richHtmlIsEmpty(props.modelValue))
const headingTag = ref('p')
const noteOpen = ref(false)
const noteEditable = ref(false)
const noteTitle = ref('')
const noteBodyHtml = ref('')
const editingNote = ref<HTMLElement | null>(null)

const UNDO_MAX = 60
let undoStack: string[] = []
let redoStack: string[] = []
let applyingHistory = false
let snapshotTimer = 0
let savedRange: Range | null = null

function currentHtml(): string {
  return compactTrailingEmptyHtml(editorRef.value?.innerHTML ?? '')
}

function caretNode(): Node | null {
  return typeof document === 'undefined' ? null : document.getSelection()?.focusNode ?? null
}

function decorateNotes() {
  const root = editorRef.value
  if (!root) return
  for (const note of root.querySelectorAll<HTMLElement>('.cb-handout-note')) {
    note.setAttribute('contenteditable', 'false')
    const body = note.querySelector('.cb-handout-note__body')
    if (body instanceof HTMLElement) body.hidden = true
  }
}

function saveSelection() {
  const sel = document.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return
  const range = sel.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return
  savedRange = range.cloneRange()
}

function restoreSelection() {
  if (!savedRange || !editorRef.value) {
    editorRef.value?.focus()
    return
  }
  editorRef.value.focus()
  const sel = document.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(savedRange)
}

function pushUndo(html: string) {
  if (applyingHistory) return
  if (undoStack[undoStack.length - 1] === html) return
  undoStack.push(html)
  if (undoStack.length > UNDO_MAX) undoStack.shift()
  redoStack = []
}

function scheduleSnapshot() {
  if (applyingHistory) return
  window.clearTimeout(snapshotTimer)
  snapshotTimer = window.setTimeout(() => {
    pushUndo(editorRef.value?.innerHTML ?? '')
  }, 280)
}

function applyHistory(html: string) {
  applyingHistory = true
  applyHtml(html)
  emit('update:modelValue', currentHtml())
  applyingHistory = false
}

function undo() {
  window.clearTimeout(snapshotTimer)
  pushUndo(editorRef.value?.innerHTML ?? '')
  if (undoStack.length < 2) return
  const current = undoStack.pop()
  if (current == null) return
  redoStack.push(current)
  applyHistory(undoStack[undoStack.length - 1] ?? '')
}

function redo() {
  window.clearTimeout(snapshotTimer)
  const next = redoStack.pop()
  if (next == null) return
  undoStack.push(next)
  applyHistory(next)
}

function syncHeadingTag() {
  const sel = document.getSelection()
  const node = sel?.anchorNode
  const el = node instanceof Element ? node : node?.parentElement
  const block = el?.closest?.('h1,h2,h3,h4,p,div,li')
  const tag = block?.tagName.toLowerCase() ?? 'p'
  headingTag.value = tag === 'h2' || tag === 'h3' || tag === 'h4' ? tag : 'p'
}

function isEmptyBlock(el: Element): boolean {
  if (el.matches('aside, .cb-handout-note')) return false
  if (el.querySelector('img, table, video, canvas, iframe, aside, .cb-handout-note')) return false
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
  if (editorRef.value.innerHTML === next) {
    decorateNotes()
    return
  }
  editorRef.value.innerHTML = next
  decorateNotes()
}

onMounted(() => {
  try {
    document.execCommand('defaultParagraphSeparator', false, 'p')
  } catch {
    /* ignore */
  }
  applyHtml(props.modelValue)
  undoStack = [editorRef.value?.innerHTML ?? '']
  redoStack = []
})

watch(
  () => props.modelValue,
  (v) => {
    if (applyingHistory || !editorRef.value) return
    if (currentHtml() === compactTrailingEmptyHtml(v ?? '')) return
    applyHtml(v)
    pushUndo(editorRef.value.innerHTML)
  },
)

function run(command: string, value?: string) {
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  document.execCommand(command, false, value)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
}

function setHeading(tag: string) {
  headingTag.value = tag
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  const ok = document.execCommand('formatBlock', false, tag)
  if (!ok) document.execCommand('formatBlock', false, `<${tag}>`)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
}

function onInput() {
  decorateNotes()
  emitHtml()
  scheduleSnapshot()
}

function onKeydown(ev: KeyboardEvent) {
  const mod = ev.ctrlKey || ev.metaKey
  if (mod && ev.key.toLowerCase() === 'z' && !ev.shiftKey) {
    ev.preventDefault()
    undo()
    return
  }
  if (mod && (ev.key.toLowerCase() === 'y' || (ev.key.toLowerCase() === 'z' && ev.shiftKey))) {
    ev.preventDefault()
    redo()
  }
}

function onKeyup(ev: KeyboardEvent) {
  saveSelection()
  syncHeadingTag()
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
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  document.execCommand('insertImage', false, dataUrl)
  await nextTick()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
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
  saveSelection()
  fileRef.value?.click()
}

function onHeadingChange(ev: Event) {
  const tag = (ev.target as HTMLSelectElement).value || 'p'
  setHeading(tag)
}

async function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await insertImageFile(file)
}

function insertHtml(html: string) {
  const chunk = compactTrailingEmptyHtml(html)
  if (!chunk) return
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  document.execCommand('insertHTML', false, chunk)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
}

function noteParts(note: HTMLElement) {
  const tab = note.querySelector('.cb-handout-note__tab')
  const body = note.querySelector('.cb-handout-note__body')
  return {
    title: (tab?.textContent || '备注').trim(),
    bodyHtml: body instanceof HTMLElement ? body.innerHTML : '',
  }
}

function openNote(note: HTMLElement) {
  editingNote.value = note
  const parts = noteParts(note)
  noteTitle.value = parts.title
  noteBodyHtml.value = parts.bodyHtml
  noteEditable.value = true
  noteOpen.value = true
}

function onEditorMouseDown(ev: MouseEvent) {
  const t = ev.target
  if (!(t instanceof Element)) return
  const note = t.closest('.cb-handout-note')
  if (note instanceof HTMLElement && props.notes && editorRef.value?.contains(note)) {
    ev.preventDefault()
    openNote(note)
  }
}

function onEditorMouseUp() {
  saveSelection()
  syncHeadingTag()
}

async function insertNoteTag() {
  saveSelection()
  let name = '备注'
  try {
    const { value } = await ElMessageBox.prompt('只需要一个标签，点进去再写内容。', '插入备注', {
      inputValue: '备注',
      inputPlaceholder: '如：易混点',
      confirmButtonText: '插入',
      cancelButtonText: '取消',
      inputValidator: (v) => (String(v ?? '').trim() ? true : '请填写标签'),
    })
    name = String(value || '备注').trim() || '备注'
  } catch {
    return
  }
  insertHtml(`${buildHandoutNoteHtml(name)}&nbsp;`)
}

function onSaveNote(payload: { title: string; bodyPlain: string }) {
  const note = editingNote.value
  if (!note || !editorRef.value?.contains(note)) return
  pushUndo(editorRef.value.innerHTML)
  const tab = note.querySelector('.cb-handout-note__tab')
  const body = note.querySelector('.cb-handout-note__body')
  if (tab) tab.textContent = payload.title
  if (body instanceof HTMLElement) {
    body.innerHTML = plainTextToRichHtml(payload.bodyPlain)
    body.hidden = true
  }
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value.innerHTML)
  ElMessage.success('备注已保存')
}

function onRemoveNote() {
  const note = editingNote.value
  if (!note || !editorRef.value?.contains(note)) return
  pushUndo(editorRef.value.innerHTML)
  note.remove()
  emitHtml()
  pushUndo(editorRef.value.innerHTML)
  ElMessage.success('已删除备注')
}

onBeforeUnmount(() => {
  window.clearTimeout(snapshotTimer)
})

defineExpose({ insertHtml, insertNoteTag })
</script>

<template>
  <div class="rte" :class="{ 'is-focused': focused, 'is-fill': fill }">
    <div class="rte__bar" role="toolbar" aria-label="富文本工具栏" @mousedown="saveSelection">
      <div class="rte__group">
        <button type="button" title="撤回" aria-label="撤回" @mousedown.prevent="undo">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3.2 7.2H9a3.4 3.4 0 1 1 0 6.8H7.2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
            <path d="M3.2 7.2 5.6 4.8M3.2 7.2 5.6 9.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" title="重做" aria-label="重做" @mousedown.prevent="redo">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M12.8 7.2H7a3.4 3.4 0 1 0 0 6.8h1.8"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
            <path d="M12.8 7.2 10.4 4.8M12.8 7.2 10.4 9.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="rte__group">
        <select
          class="rte__heading"
          :value="headingTag"
          title="标题级别"
          aria-label="标题级别"
          @mousedown="saveSelection"
          @change="onHeadingChange"
        >
          <option value="p">正文</option>
          <option value="h2">一</option>
          <option value="h3">二</option>
          <option value="h4">三</option>
        </select>
      </div>
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
          saveSelection();
          emitHtml()
        "
        @input="onInput"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @mousedown="onEditorMouseDown"
        @mouseup="onEditorMouseUp"
        @paste="onPaste"
      />
    </div>
    <input ref="fileRef" type="file" accept="image/*" class="rte__file" @change="onFileChange">
    <HandoutNoteDialog
      v-if="notes"
      v-model="noteOpen"
      :title="noteTitle"
      :body-html="noteBodyHtml"
      :editable="noteEditable"
      @save="onSaveNote"
      @remove="onRemoveNote"
    />
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
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px solid #eef2f6;
  background: #f8fafc;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.rte__bar::-webkit-scrollbar {
  display: none;
}

.rte__group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 1px;
  padding-right: 5px;
  border-right: 1px solid #e5e7eb;
}

.rte__group:last-child {
  border-right: none;
  padding-right: 0;
}

.rte__bar button {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  cursor: pointer;
}

.rte__bar button:hover {
  background: #fff;
  color: #0f172a;
}

.rte__heading {
  height: 26px;
  width: 3.4rem;
  min-width: 3.4rem;
  padding: 0 2px 0 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.rte__heading:hover,
.rte__heading:focus {
  background: #fff;
  outline: none;
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
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  flex: 1 1 0;
  height: auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
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

.rte__editor :deep(h2),
.rte__editor :deep(h3),
.rte__editor :deep(h4) {
  margin: 0.55em 0 0.35em;
  line-height: 1.35;
  font-weight: 800;
}

.rte__editor :deep(h2) {
  font-size: 1.28em;
}

.rte__editor :deep(h3) {
  font-size: 1.14em;
}

.rte__editor :deep(h4) {
  font-size: 1.02em;
  font-weight: 750;
}

.rte__editor :deep(.cb-handout-note) {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 0.2em;
  cursor: pointer;
}

.rte__editor :deep(.cb-handout-note__tab) {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px 2px 8px;
  border-radius: 4px 14px 14px 4px;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
}

.rte__editor :deep(.cb-handout-note__body) {
  display: none !important;
}

.rte__file {
  display: none;
}
</style>
