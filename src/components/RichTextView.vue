<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderMathInRichHtml } from '@/utils/dataAnalysisMathDisplay'
import { wrapHtmlTablesForScroll } from '@/utils/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/richTextHtml'
import ImageZoomOverlay from '@/components/ImageZoomOverlay.vue'

const props = withDefaults(
  defineProps<{
    html?: string
    /** 将文本中的分式、幂次、根号转成书本式显示 */
    math?: boolean
    /** 点击正文插图放大，支持拖动与双指缩放 */
    zoomImages?: boolean
  }>(),
  { math: true, zoomImages: true },
)

const previewSrc = ref('')

const safeHtml = computed(() => {
  const sanitized = sanitizeRichHtml(props.html ?? '')
  const rendered = props.math ? renderMathInRichHtml(sanitized) : sanitized
  return wrapHtmlTablesForScroll(rendered)
})

function onClick(ev: MouseEvent) {
  if (!props.zoomImages) return
  const t = ev.target
  if (!(t instanceof HTMLImageElement) || !t.src) return
  previewSrc.value = t.src
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="rich-text-view" :class="{ 'is-zoomable': zoomImages }" v-html="safeHtml" @click="onClick" />
  <ImageZoomOverlay v-if="previewSrc" :src="previewSrc" @close="previewSrc = ''" />
</template>

<style scoped>
.rich-text-view {
  font-size: 15px;
  line-height: 1.85;
  word-break: break-word;
  overflow-wrap: anywhere;
  overflow-x: visible;
  min-width: 0;
}

.rich-text-view :deep(p) {
  margin: 0 0 0.6em;
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

.rich-text-view :deep(h2),
.rich-text-view :deep(h3) {
  margin: 0.6em 0 0.35em;
  font-size: 1.05em;
}

.rich-text-view :deep(blockquote) {
  margin: 0.5em 0;
  padding: 4px 10px;
  border-left: 3px solid var(--app-border, #d1d5db);
  color: var(--app-text-muted);
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
</style>
