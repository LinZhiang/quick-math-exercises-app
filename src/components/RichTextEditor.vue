<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HandoutNoteDialog from '@/components/HandoutNoteDialog.vue'
import {
  buildHandoutNoteHtml,
  compactTrailingEmptyHtml,
  escapeHtmlText,
  plainTextToRichHtml,
  richHtmlIsEmpty,
} from '@/utils/markdown/richTextHtml'
import { buildJsCodeBlockHtml, jsSourceFromPre } from '@/utils/markdown/highlightHandoutCode'

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
const fontSizeTag = ref('')
const cmdOn = ref<Record<string, boolean>>({})
const noteOpen = ref(false)
const noteEditable = ref(false)
const noteTitle = ref('')
const noteBodyHtml = ref('')
const editingNote = ref<HTMLElement | null>(null)
const jsOpen = ref(false)
const jsDraft = ref('')
const editingPre = ref<HTMLElement | null>(null)

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
  decorateCodeBlocks()
}

function decorateCodeBlocks() {
  const root = editorRef.value
  if (!root) return
  for (const pre of root.querySelectorAll('pre')) {
    if (!(pre instanceof HTMLElement)) continue
    pre.setAttribute('contenteditable', 'false')
    pre.classList.add('rte-js-pre')
  }
}

function closestJsPre(node: Node | null): HTMLElement | null {
  const el = node instanceof Element ? node : node?.parentElement
  const pre = el?.closest?.('pre')
  if (!(pre instanceof HTMLElement) || !editorRef.value?.contains(pre)) return null
  return pre
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
  const block = el?.closest?.('h1,h2,h3,h4,p,div,li,blockquote')
  const tag = block?.tagName.toLowerCase() ?? 'p'
  headingTag.value = tag === 'h2' || tag === 'h3' || tag === 'h4' ? tag : 'p'
  const sized = el?.closest?.('span[style], font')
  const px = sized instanceof HTMLElement ? sized.style.fontSize : ''
  fontSizeTag.value = px || ''
}

function syncToolbar() {
  syncHeadingTag()
  const cmds = [
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'superscript',
    'subscript',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'justifyFull',
    'insertUnorderedList',
    'insertOrderedList',
  ]
  const next: Record<string, boolean> = {}
  for (const c of cmds) {
    try {
      next[c] = document.queryCommandState(c)
    } catch {
      next[c] = false
    }
  }
  cmdOn.value = next
}

function isEmptyBlock(el: Element): boolean {
  if (el.matches('aside, .cb-handout-note')) return false
  if (el.matches('hr, img, table')) return false
  if (el.querySelector('img, table, video, canvas, iframe, aside, .cb-handout-note, hr')) return false
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
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch {
    /* ignore */
  }
  document.execCommand(command, false, value)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
  syncToolbar()
}

function setHeading(tag: string) {
  if (tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'p') headingTag.value = tag
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  const ok = document.execCommand('formatBlock', false, tag)
  if (!ok) document.execCommand('formatBlock', false, `<${tag}>`)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
  syncToolbar()
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
  syncToolbar()
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

function onFontSizeChange(ev: Event) {
  const size = (ev.target as HTMLSelectElement).value
  fontSizeTag.value = size
  if (!size) return
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch {
    /* ignore */
  }
  document.execCommand('fontSize', false, '7')
  const root = editorRef.value
  if (root) {
    for (const span of root.querySelectorAll('span')) {
      if (span.style.fontSize === 'xxx-large' || span.style.fontSize === 'x-large') {
        span.style.fontSize = size
      }
    }
    for (const font of root.querySelectorAll('font[size="7"]')) {
      const span = document.createElement('span')
      span.style.fontSize = size
      span.innerHTML = font.innerHTML
      font.replaceWith(span)
    }
  }
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
}

function onForeColor(ev: Event) {
  run('foreColor', (ev.target as HTMLInputElement).value)
}

function onHiliteColor(ev: Event) {
  const color = (ev.target as HTMLInputElement).value
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch {
    /* ignore */
  }
  restoreSelection()
  pushUndo(editorRef.value?.innerHTML ?? '')
  const ok = document.execCommand('hiliteColor', false, color)
  if (!ok) document.execCommand('backColor', false, color)
  decorateNotes()
  emitHtml()
  pushUndo(editorRef.value?.innerHTML ?? '')
  syncToolbar()
}

async function insertLink() {
  saveSelection()
  let raw = 'https://'
  try {
    const { value } = await ElMessageBox.prompt('网址，留空则去掉所选链接。', '插入链接', {
      inputValue: 'https://',
      inputPlaceholder: 'https://',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    raw = String(value ?? '').trim()
  } catch {
    return
  }
  if (!raw) {
    run('unlink')
    return
  }
  const href = /^https?:\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('#') ? raw : `https://${raw}`
  run('createLink', href)
  editorRef.value?.querySelectorAll('a[href]').forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  })
}

async function insertTable() {
  saveSelection()
  let spec = '3x3'
  try {
    const { value } = await ElMessageBox.prompt('表格大小，例如 3x4', '插入表格', {
      inputValue: '3x3',
      confirmButtonText: '插入',
      cancelButtonText: '取消',
      inputValidator: (v) => {
        const m = String(v ?? '')
          .trim()
          .match(/^(\d+)\s*[xX×,，]\s*(\d+)$/)
        if (!m) return '请填写 行x列，例如 3x3'
        const r = Number(m[1])
        const c = Number(m[2])
        if (r < 1 || c < 1 || r > 20 || c > 10) return '行 1–20，列 1–10'
        return true
      },
    })
    spec = String(value ?? '3x3')
  } catch {
    return
  }
  const m = spec.trim().match(/^(\d+)\s*[xX×,，]\s*(\d+)$/)
  const rows = Math.min(20, Math.max(1, Number(m?.[1] || 3)))
  const cols = Math.min(10, Math.max(1, Number(m?.[2] || 3)))
  const cell = '<td><br></td>'
  const tr = `<tr>${cell.repeat(cols)}</tr>`
  insertHtml(`<table><tbody>${tr.repeat(rows)}</tbody></table><p></p>`)
}

function toggleInlineCode() {
  restoreSelection()
  const sel = document.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return
  const node = sel.anchorNode
  const el = node instanceof Element ? node : node?.parentElement
  const code = el?.closest('code')
  if (code instanceof HTMLElement && editorRef.value.contains(code) && !code.closest('pre')) {
    pushUndo(editorRef.value.innerHTML)
    const parent = code.parentNode
    while (code.firstChild) parent?.insertBefore(code.firstChild, code)
    code.remove()
    decorateNotes()
    emitHtml()
    pushUndo(editorRef.value.innerHTML)
    return
  }
  const text = sel.toString()
  insertHtml(`<code>${escapeHtmlText(text || 'code')}</code>&nbsp;`)
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
    return
  }
  const pre = t.closest('pre')
  if (pre instanceof HTMLElement && editorRef.value?.contains(pre)) {
    ev.preventDefault()
    openJsDialog(pre)
  }
}

function onEditorMouseUp() {
  saveSelection()
  syncToolbar()
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

function openJsDialog(pre: HTMLElement | null) {
  editingPre.value = pre
  jsDraft.value = pre ? jsSourceFromPre(pre) : ''
  jsOpen.value = true
}

function openJsFromToolbar() {
  saveSelection()
  openJsDialog(closestJsPre(caretNode()) ?? closestJsPre(savedRange?.commonAncestorContainer ?? null))
}

function onSaveJs() {
  if (!jsDraft.value.trim()) {
    ElMessage.warning('请输入 JS 代码')
    return
  }
  const html = buildJsCodeBlockHtml(jsDraft.value)
  const root = editorRef.value
  const current = editingPre.value
  if (current && root?.contains(current)) {
    pushUndo(root.innerHTML)
    const wrap = current.closest('.md-table-scroll')
    const target =
      wrap instanceof HTMLElement && wrap.querySelectorAll('pre').length === 1 ? wrap : current
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const next = tmp.firstElementChild
    if (next) target.replaceWith(next)
    decorateNotes()
    emitHtml()
    pushUndo(root.innerHTML)
  } else {
    insertHtml(`${html}<p></p>`)
  }
  jsOpen.value = false
  ElMessage.success(current ? '代码已更新' : '已插入 JS 代码')
}

function onRemoveJs() {
  const root = editorRef.value
  const current = editingPre.value
  if (!current || !root?.contains(current)) {
    jsOpen.value = false
    return
  }
  pushUndo(root.innerHTML)
  const wrap = current.closest('.md-table-scroll')
  const target =
    wrap instanceof HTMLElement && wrap.querySelectorAll('pre').length === 1 ? wrap : current
  target.remove()
  decorateNotes()
  emitHtml()
  pushUndo(root.innerHTML)
  jsOpen.value = false
  ElMessage.success('已删除代码块')
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
        <select
          class="rte__heading rte__size"
          :value="fontSizeTag"
          title="字号"
          aria-label="字号"
          @mousedown="saveSelection"
          @change="onFontSizeChange"
        >
          <option value="">字号</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="22px">22</option>
          <option value="28px">28</option>
        </select>
      </div>
      <div class="rte__group">
        <button type="button" title="粗体" aria-label="粗体" :class="{ 'is-on': cmdOn.bold }" @mousedown.prevent="run('bold')">
          <span class="rte__ico rte__ico--b">B</span>
        </button>
        <button type="button" title="斜体" aria-label="斜体" :class="{ 'is-on': cmdOn.italic }" @mousedown.prevent="run('italic')">
          <span class="rte__ico rte__ico--i">I</span>
        </button>
        <button type="button" title="下划线" aria-label="下划线" :class="{ 'is-on': cmdOn.underline }" @mousedown.prevent="run('underline')">
          <span class="rte__ico rte__ico--u">U</span>
        </button>
        <button type="button" title="删除线" aria-label="删除线" :class="{ 'is-on': cmdOn.strikeThrough }" @mousedown.prevent="run('strikeThrough')">
          <span class="rte__ico rte__ico--s">S</span>
        </button>
        <button type="button" title="上标" aria-label="上标" :class="{ 'is-on': cmdOn.superscript }" @mousedown.prevent="run('superscript')">
          <span class="rte__ico rte__ico--sup">x²</span>
        </button>
        <button type="button" title="下标" aria-label="下标" :class="{ 'is-on': cmdOn.subscript }" @mousedown.prevent="run('subscript')">
          <span class="rte__ico rte__ico--sub">x₂</span>
        </button>
      </div>
      <div class="rte__group">
        <label class="rte__color" title="文字颜色">
          <span class="rte__ico rte__ico--b">A</span>
          <span class="rte__color-bar" style="background:#dc2626" />
          <input type="color" value="#dc2626" aria-label="文字颜色" @mousedown="saveSelection" @input="onForeColor">
        </label>
        <label class="rte__color" title="背景色">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4.2 11.6 9.4 3.4c.4-.6 1.2-.6 1.6 0l1.4 2.1c.4.6.2 1.3-.3 1.7L6.8 13.2c-.4.3-1 .3-1.3 0L3.8 11.8c-.4-.4-.3-1 .4-1.2z" fill="currentColor" />
            <rect x="3" y="13.2" width="7.4" height="1.5" rx="0.5" fill="#facc15" />
          </svg>
          <span class="rte__color-bar" style="background:#facc15" />
          <input type="color" value="#facc15" aria-label="背景色" @mousedown="saveSelection" @input="onHiliteColor">
        </label>
      </div>
      <div class="rte__group">
        <button type="button" title="无序列表" aria-label="无序列表" :class="{ 'is-on': cmdOn.insertUnorderedList }" @mousedown.prevent="run('insertUnorderedList')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="3" cy="4" r="1.2" fill="currentColor" />
            <circle cx="3" cy="8" r="1.2" fill="currentColor" />
            <circle cx="3" cy="12" r="1.2" fill="currentColor" />
            <rect x="6" y="3.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="7.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="11.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="有序列表" aria-label="有序列表" :class="{ 'is-on': cmdOn.insertOrderedList }" @mousedown.prevent="run('insertOrderedList')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <text x="1" y="5.5" font-size="5.5" font-weight="700" fill="currentColor">1</text>
            <text x="1" y="9.6" font-size="5.5" font-weight="700" fill="currentColor">2</text>
            <text x="1" y="13.7" font-size="5.5" font-weight="700" fill="currentColor">3</text>
            <rect x="6" y="3.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="7.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
            <rect x="6" y="11.2" width="8" height="1.6" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="减少缩进" aria-label="减少缩进" @mousedown.prevent="run('outdent')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M7 8H2.8M4.6 5.8 2.6 8l2 2.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="8.2" y="3.2" width="6" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="8.2" y="7.25" width="6" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="8.2" y="11.3" width="6" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="增加缩进" aria-label="增加缩进" @mousedown.prevent="run('indent')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M2.6 8H6.8M5 5.8 7 8l-2 2.2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="8.2" y="3.2" width="6" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="8.2" y="7.25" width="6" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="8.2" y="11.3" width="6" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div class="rte__group">
        <button type="button" title="左对齐" aria-label="左对齐" :class="{ 'is-on': cmdOn.justifyLeft }" @mousedown.prevent="run('justifyLeft')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="3.2" width="12" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="2" y="7.25" width="8" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="2" y="11.3" width="11" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="居中" aria-label="居中" :class="{ 'is-on': cmdOn.justifyCenter }" @mousedown.prevent="run('justifyCenter')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="3.2" width="12" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="4" y="7.25" width="8" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="2.5" y="11.3" width="11" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="右对齐" aria-label="右对齐" :class="{ 'is-on': cmdOn.justifyRight }" @mousedown.prevent="run('justifyRight')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="3.2" width="12" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="6" y="7.25" width="8" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="3" y="11.3" width="11" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="两端对齐" aria-label="两端对齐" :class="{ 'is-on': cmdOn.justifyFull }" @mousedown.prevent="run('justifyFull')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="3.2" width="12" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.6" fill="currentColor" />
            <rect x="2" y="11.3" width="12" height="1.5" rx="0.6" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div class="rte__group">
        <button type="button" title="插入链接" aria-label="插入链接" @mousedown.prevent="insertLink">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M6.2 9.8 9.8 6.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <path d="M7.2 4.4 8.6 3a3 3 0 0 1 4.2 4.2L11.4 8.8M8.8 11.6 7.4 13A3 3 0 1 1 3.2 8.8L4.6 7.4" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" title="取消链接" aria-label="取消链接" @mousedown.prevent="run('unlink')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M6.2 9.8 9.8 6.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <path d="M7.2 4.4 8.6 3a3 3 0 0 1 4.2 4.2L11.4 8.8M8.8 11.6 7.4 13A3 3 0 1 1 3.2 8.8L4.6 7.4" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" />
            <path d="M3 13 13 3" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" title="插入表格" aria-label="插入表格" @mousedown.prevent="insertTable">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="2.5" width="12" height="11" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3" />
            <path d="M2 6.4h12M2 10.1h12M6.2 2.5v11M9.8 2.5v11" fill="none" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </button>
        <button type="button" title="分割线" aria-label="分割线" @mousedown.prevent="run('insertHorizontalRule')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="2" y="7.2" width="12" height="1.6" rx="0.8" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="引用" aria-label="引用" @mousedown.prevent="setHeading('blockquote')">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M3.2 12.2c1.8 0 3.2-1.4 3.2-3.4V4.8H2.8v3.8h1.7c0 1.2-.7 2-1.8 2.4l.5 1.2zm6.4 0c1.8 0 3.2-1.4 3.2-3.4V4.8H9.2v3.8h1.7c0 1.2-.7 2-1.8 2.4l.5 1.2z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" title="行内代码" aria-label="行内代码" @mousedown.prevent="toggleInlineCode">
          <span class="rte__ico rte__ico--js">&lt;/&gt;</span>
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
        <button type="button" title="JS 代码" aria-label="JS 代码" @mousedown.prevent="openJsFromToolbar">
          <span class="rte__ico rte__ico--js">{ }</span>
        </button>
        <button v-if="notes" type="button" title="插入备注" aria-label="插入备注" @mousedown.prevent="insertNoteTag">
          <span class="rte__ico rte__ico--note">注</span>
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
    <el-dialog
      v-model="jsOpen"
      :title="editingPre ? '修改 JS 代码' : '插入 JS 代码'"
      width="min(36rem, 94vw)"
      append-to-body
      destroy-on-close
    >
      <el-input
        v-model="jsDraft"
        type="textarea"
        :rows="12"
        placeholder="function fib(num) {&#10;  if (num === 0) return 0;&#10;}"
        class="rte-js-input"
      />
      <template #footer>
        <el-button v-if="editingPre" type="danger" plain @click="onRemoveJs">删除</el-button>
        <el-button @click="jsOpen = false">取消</el-button>
        <el-button type="primary" @click="onSaveJs">保存</el-button>
      </template>
    </el-dialog>
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
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px solid #eef2f6;
  background: #f8fafc;
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

.rte__bar button.is-on {
  background: #fff;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
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

.rte__size {
  width: 3.6rem;
  min-width: 3.6rem;
}

.rte__heading:hover,
.rte__heading:focus {
  background: #fff;
  outline: none;
}

.rte__color {
  position: relative;
  width: 26px;
  height: 26px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-radius: 6px;
  color: #475569;
  cursor: pointer;
}

.rte__color:hover {
  background: #fff;
  color: #0f172a;
}

.rte__color input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.rte__color-bar {
  display: block;
  width: 14px;
  height: 3px;
  border-radius: 1px;
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

.rte__ico--s {
  font-weight: 700;
  text-decoration: line-through;
}

.rte__ico--sup,
.rte__ico--sub {
  font-size: 11px;
  font-weight: 700;
  font-style: normal;
  font-family: inherit;
}

.rte__ico--note {
  font-size: 11px;
  font-weight: 800;
  font-style: normal;
  font-family: inherit;
}

.rte__ico--js {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 11px;
  font-weight: 800;
  font-style: normal;
  letter-spacing: -0.06em;
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
  overflow-x: auto;
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

.rte__editor :deep(blockquote) {
  margin: 0.45em 0;
  padding: 4px 10px;
  border-left: 3px solid #cbd5e1;
  color: #64748b;
}

.rte__editor :deep(hr) {
  margin: 0.7em 0;
  border: none;
  border-top: 1px solid #cbd5e1;
}

.rte__editor :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.rte__editor :deep(sup),
.rte__editor :deep(sub) {
  font-size: 0.75em;
  line-height: 0;
}

.rte__editor :deep(:not(pre) > code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  padding: 0.08em 0.28em;
  border-radius: 4px;
  background: #f1f5f9;
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

.rte__editor :deep(.md-table-scroll:has(> pre)) {
  margin: 0.7em 0;
  border-radius: 12px;
  background: #1e1e1e;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.rte__editor :deep(pre) {
  margin: 0.7em 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: #1e1e1e;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
  word-wrap: normal;
  hyphens: none;
  width: max-content;
  min-width: 100%;
  max-width: none;
  box-sizing: border-box;
  overflow-x: visible;
  cursor: pointer;
}

.rte__editor :deep(.md-table-scroll > pre) {
  margin: 0;
}

.rte__editor :deep(pre code),
.rte__editor :deep(pre *) {
  font: inherit;
  padding: 0;
  background: transparent;
  color: inherit;
  white-space: inherit;
  word-break: normal;
  overflow-wrap: normal;
  word-wrap: normal;
}

.rte__editor :deep(.tok-kw) {
  color: #f472b6;
  font-weight: 650;
}

.rte__editor :deep(.tok-fn) {
  color: #fbbf24;
}

.rte__editor :deep(.tok-ty) {
  color: #7dd3fc;
}

.rte__editor :deep(.tok-str),
.rte__editor :deep(.tok-tmpl) {
  color: #86efac;
}

.rte__editor :deep(.tok-cmt) {
  color: #a3e635;
  font-style: italic;
}

.rte__editor :deep(.tok-num),
.rte__editor :deep(.tok-lit) {
  color: #c4b5fd;
}

.rte__editor :deep(.tok-op),
.rte__editor :deep(.tok-id) {
  color: #e5e7eb;
}

.rte-js-input :deep(.el-textarea__inner) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
}

.rte__file {
  display: none;
}
</style>
