<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { renderMathInRichHtml } from '@/utils/data-analysis/dataAnalysisMathDisplay'
import { wrapHtmlTablesForScroll } from '@/utils/markdown/markdownToHtml'
import { compactTrailingEmptyHtml } from '@/utils/markdown/richTextHtml'
import ImageZoomOverlay from '@/components/ImageZoomOverlay.vue'
import HandoutNoteDialog from '@/components/HandoutNoteDialog.vue'

const props = withDefaults(
  defineProps<{
    html?: string
    /** 将文本中的分式、幂次、根号转成书本式显示 */
    math?: boolean
    /** 点击正文插图放大，支持拖动与双指缩放 */
    zoomImages?: boolean
    /** docs：前端基础讲义（粉标行内代码 + 深色高亮代码块） */
    tone?: 'default' | 'docs'
  }>(),
  { math: true, zoomImages: true, tone: 'default' },
)

const previewSrc = ref('')
const rootRef = ref<HTMLElement | null>(null)
const noteOpen = ref(false)
const noteTitle = ref('')
const noteBodyHtml = ref('')
let overflowObserver: ResizeObserver | null = null

const safeHtml = computed(() => {
  const sanitized = compactTrailingEmptyHtml(props.html ?? '')
  const rendered = props.math ? renderMathInRichHtml(sanitized) : sanitized
  return wrapHtmlTablesForScroll(rendered)
})

function markWideBlocks() {
  const root = rootRef.value
  if (!root) return
  for (const el of root.querySelectorAll<HTMLElement>('p, pre, li, h2, h3, blockquote')) {
    if (el.closest('.md-table-scroll')) {
      el.classList.remove('is-overflow-x')
      continue
    }
    el.classList.toggle('is-overflow-x', el.scrollWidth > el.clientWidth + 2)
  }
}

function onClick(ev: MouseEvent) {
  const t = ev.target
  if (t instanceof Element) {
    const note = t.closest('.cb-handout-note')
    if (note instanceof HTMLElement) {
      const tab = note.querySelector('.cb-handout-note__tab')
      const body = note.querySelector('.cb-handout-note__body')
      noteTitle.value = (tab?.textContent || '备注').trim()
      noteBodyHtml.value = body instanceof HTMLElement ? body.innerHTML : ''
      noteOpen.value = true
      return
    }
  }
  if (!props.zoomImages) return
  if (!(t instanceof HTMLImageElement) || !t.src) return
  previewSrc.value = t.src
}

onMounted(() => {
  void nextTick(markWideBlocks)
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    overflowObserver = new ResizeObserver(() => markWideBlocks())
    overflowObserver.observe(rootRef.value)
  }
})

watch(safeHtml, async () => {
  await nextTick()
  markWideBlocks()
})

onBeforeUnmount(() => overflowObserver?.disconnect())
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    ref="rootRef"
    class="rich-text-view"
    :class="{ 'is-zoomable': zoomImages, 'rich-text-view--docs': tone === 'docs' }"
    v-html="safeHtml"
    @click="onClick"
  />
  <ImageZoomOverlay v-if="previewSrc" :src="previewSrc" @close="previewSrc = ''" />
  <HandoutNoteDialog v-model="noteOpen" :title="noteTitle" :body-html="noteBodyHtml" />
</template>

<style scoped>
.rich-text-view {
  font-size: 15px;
  line-height: 1.85;
  word-break: break-word;
  overflow-wrap: anywhere;
  overflow-x: visible;
  min-width: 0;
  max-width: 100%;
}

.rich-text-view :deep(p) {
  margin: 0 0 0.6em;
}

  .rich-text-view :deep(:not(pre) > code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  padding: 0.08em 0.28em;
  border-radius: 4px;
  background: #1e1e1e;
  color: #e5e7eb;
}

.rich-text-view--docs {
  font-size: 16px;
  line-height: 1.9;
  color: #334155;
}

.rich-text-view--docs :deep(h1) {
  margin: 0 0 0.85em;
  font-size: 1.72em;
  font-weight: 800;
  line-height: 1.3;
  color: #1e2937;
}

.rich-text-view--docs :deep(h2) {
  margin: 1.35em 0 0.7em;
  font-size: 1.42em;
  font-weight: 800;
  color: #1e2937;
}

.rich-text-view--docs :deep(h3) {
  margin: 1.15em 0 0.5em;
  font-size: 1.12em;
  font-weight: 750;
  color: #334155;
}

.rich-text-view--docs :deep(p) {
  margin: 0 0 0.95em;
}

.rich-text-view--docs :deep(ul),
.rich-text-view--docs :deep(ol) {
  margin: 0.35em 0 1em;
  padding-left: 1.55em;
}

.rich-text-view--docs :deep(li) {
  margin: 0.2em 0;
}

.rich-text-view--docs :deep(li::marker) {
  color: #94a3b8;
}

.rich-text-view--docs :deep(:not(pre) > code),
.rich-text-view--docs :deep(code.hl-inline) {
  padding: 0.12em 0.42em;
  border-radius: 5px;
  background: #1e1e1e;
  color: #e5e7eb;
  font-size: 0.9em;
  font-weight: 500;
}

.rich-text-view :deep(pre),
.rich-text-view :deep(pre code),
.rich-text-view :deep(pre *) {
  word-break: normal;
  overflow-wrap: normal;
  word-wrap: normal;
  hyphens: none;
}

.rich-text-view :deep(pre) {
  white-space: pre;
}

.rich-text-view :deep(pre code) {
  white-space: inherit;
  display: block;
  width: max-content;
  min-width: 100%;
}

.rich-text-view--docs :deep(.md-table-scroll:has(> pre)) {
  margin: 0.85em 0 1.25em;
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

.rich-text-view--docs :deep(pre) {
  margin: 0.85em 0 1.25em;
  padding: 16px 18px;
  border-radius: 12px;
  background: #1e1e1e;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  width: max-content;
  min-width: 100%;
  max-width: none;
  box-sizing: border-box;
  overflow-x: visible;
}

.rich-text-view--docs :deep(.md-table-scroll > pre) {
  margin: 0;
}

.rich-text-view--docs :deep(pre code) {
  font: inherit;
  padding: 0;
  background: transparent;
  color: inherit;
}

.rich-text-view :deep(.tok-kw) {
  color: #f472b6;
  font-weight: 650;
}

.rich-text-view :deep(.tok-fn) {
  color: #fbbf24;
}

.rich-text-view :deep(.tok-ty) {
  color: #7dd3fc;
}

.rich-text-view :deep(.tok-str),
.rich-text-view :deep(.tok-tmpl) {
  color: #86efac;
}

.rich-text-view :deep(.tok-cmt) {
  color: #a3e635;
  font-style: italic;
}

.rich-text-view :deep(.tok-num),
.rich-text-view :deep(.tok-lit) {
  color: #c4b5fd;
}

.rich-text-view :deep(.tok-op),
.rich-text-view :deep(.tok-id) {
  color: #e5e7eb;
}

.rich-text-view :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-text-view :deep(ul),
.rich-text-view :deep(ol) {
  margin: 0.4em 0 0.6em;
  padding-left: 1.4em;
}

.rich-text-view :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 8px 0;
  border-radius: 6px;
}

.rich-text-view.is-zoomable :deep(img) {
  cursor: zoom-in;
}

.rich-text-view :deep(table) {
  width: max-content;
  min-width: 100%;
  max-width: none;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.95em;
}

.rich-text-view :deep(.md-table-scroll > table) {
  margin: 0;
}

.rich-text-view :deep(th),
.rich-text-view :deep(td) {
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
  min-width: 5.25em;
  max-width: 18em;
  word-break: normal;
  overflow-wrap: break-word;
}

.rich-text-view :deep(th) {
  background: #f8fafc;
  font-weight: 700;
}

.rich-text-view :deep(.md-table-scroll),
.rich-text-view :deep(.is-overflow-x) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.rich-text-view :deep(.da-math-over) {
  display: inline-block;
  border-top: 1.6px solid currentColor;
  line-height: 1.1;
  padding: 0 1px;
  margin: 0 1px;
}

.rich-text-view :deep(h2),
.rich-text-view :deep(h3),
.rich-text-view :deep(h4) {
  margin: 0.7em 0 0.35em;
  line-height: 1.35;
  font-weight: 800;
}

.rich-text-view :deep(h2) {
  font-size: 1.28em;
}

.rich-text-view :deep(h3) {
  font-size: 1.14em;
}

.rich-text-view :deep(h4) {
  font-size: 1.02em;
  font-weight: 750;
}

.rich-text-view :deep(blockquote) {
  margin: 0.5em 0;
  padding: 4px 10px;
  border-left: 3px solid var(--app-border, #d1d5db);
  color: var(--app-text-muted);
}

.rich-text-view :deep(.cb-handout-note) {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 0.2em;
  cursor: pointer;
  user-select: none;
}

.rich-text-view :deep(.cb-handout-note__tab) {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 2px 10px 2px 8px;
  border-radius: 4px 14px 14px 4px;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 72%, #93c5fd 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
  box-shadow: 1px 1px 0 rgb(30 64 175 / 22%);
}

.rich-text-view :deep(.cb-handout-note__body) {
  display: none !important;
}

.rich-text-view :deep(.da-math-frac) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0.1em 0.2em;
  line-height: 1.2;
}

.rich-text-view :deep(.da-math-frac__num),
.rich-text-view :deep(.da-math-frac__den) {
  font-size: 1em;
  padding: 0 0.25em;
  text-align: center;
  white-space: nowrap;
}

.rich-text-view :deep(.da-math-over) {
  display: inline-block;
  border-top: 1.6px solid currentColor;
  line-height: 1.1;
  padding: 0 1px;
  margin: 0 1px;
}

.rich-text-view :deep(.da-math-frac__rule) {
  display: block;
  align-self: stretch;
  border-top: 1.5px solid currentColor;
  margin: 0.06em 0;
}

.rich-text-view :deep(.da-math-root) {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-family: 'Cambria Math', 'Times New Roman', serif;
}

.rich-text-view :deep(.da-math-root__idx) {
  font-size: 0.72em;
  margin-right: 1px;
  line-height: 1;
}

.rich-text-view :deep(.da-math-root__sym) {
  font-size: 1.05em;
}

.rich-text-view :deep(.da-math-radicand) {
  border-top: 1px solid currentColor;
  padding: 0 1px;
  margin-left: 1px;
  line-height: 1.15;
}

.rich-text-view :deep(.da-math-var) {
  display: inline;
  white-space: nowrap;
}

.rich-text-view :deep(.da-math-ss) {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  vertical-align: middle;
  margin-left: 0.06em;
  line-height: 1;
  font-size: 0.62em;
  font-weight: 600;
}

.rich-text-view :deep(.da-math-ss .da-math-sup),
.rich-text-view :deep(.da-math-ss .da-math-sub) {
  display: block;
  font-size: 1em;
  line-height: 1.05;
  vertical-align: baseline;
  position: static;
}

.rich-text-view :deep(sub.da-math-sub) {
  font-size: 0.72em;
  font-weight: 600;
  line-height: 0;
  vertical-align: sub;
}

.rich-text-view :deep(sup.da-math-sup) {
  font-size: 0.72em;
  font-weight: 750;
  line-height: 0;
  vertical-align: super;
}

@media (min-width: 901px) {
  .rich-text-view--docs {
    font-size: 17px;
    line-height: 1.92;
  }

  .rich-text-view--docs :deep(pre) {
    font-size: 13.5px;
    padding: 18px 22px;
  }
}
</style>
