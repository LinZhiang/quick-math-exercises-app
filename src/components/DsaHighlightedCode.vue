<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { highlightTs } from '@/utils/dsa/highlightTs'

const props = withDefaults(
  defineProps<{
    code: string
    editable?: boolean
  }>(),
  { editable: false },
)

const emit = defineEmits<{
  'update:code': [value: string]
  keydown: [event: KeyboardEvent]
}>()

const wrapRef = ref<HTMLElement | null>(null)
const preRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const highlighted = computed(() => highlightTs(props.code || ''))

function fit() {
  if (!props.editable) return
  const wrap = wrapRef.value
  const ta = textareaRef.value
  if (!wrap || !ta) return
  ta.style.height = 'auto'
  const next = Math.max(220, ta.scrollHeight)
  wrap.style.height = `${next}px`
  ta.style.height = `${next}px`
}

function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement
  emit('update:code', el.value)
}

function onScroll() {
  const ta = textareaRef.value
  const pre = preRef.value
  if (!ta || !pre) return
  pre.scrollTop = ta.scrollTop
  pre.scrollLeft = ta.scrollLeft
}

watch(
  () => props.code,
  () => {
    void nextTick(fit)
  },
  { immediate: true, flush: 'post' },
)

onMounted(() => {
  window.addEventListener('resize', fit)
  void nextTick(fit)
})

onUnmounted(() => {
  window.removeEventListener('resize', fit)
})

defineExpose({
  get textarea() {
    return textareaRef.value
  },
  fit,
})
</script>

<template>
  <div v-if="editable" ref="wrapRef" class="dsa-hl dsa-hl--edit">
    <pre
      ref="preRef"
      class="dsa-hl__pre"
      aria-hidden="true"
      v-html="highlighted"
    />
    <textarea
      ref="textareaRef"
      class="dsa-hl__input"
      :value="code"
      wrap="soft"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      @input="onInput"
      @scroll="onScroll"
      @keydown="emit('keydown', $event)"
    />
  </div>
  <pre v-else class="dsa-hl dsa-hl--view" v-html="highlighted" />
</template>

<style scoped>
.dsa-hl {
  box-sizing: border-box;
  margin: 0;
  background: #1e2937;
  color: #e6edf3;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px;
  line-height: 1.65;
  tab-size: 4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  overflow: hidden;
}

.dsa-hl--edit {
  position: relative;
  min-height: 14rem;
}

.dsa-hl--view {
  padding: 14px 16px;
  border-radius: 12px;
  overflow-x: hidden;
}

.dsa-hl__pre,
.dsa-hl__input {
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 14px 16px 24px;
  border: none;
  font: inherit;
  line-height: inherit;
  tab-size: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  overflow: hidden;
}

.dsa-hl__pre {
  color: #e6edf3;
  pointer-events: none;
}

.dsa-hl__input {
  z-index: 1;
  background: transparent;
  color: transparent;
  caret-color: #fff;
  resize: none;
  outline: none;
  -webkit-text-fill-color: transparent;
}

.dsa-hl :deep(.tok-kw) {
  color: #56d4f5;
  font-weight: 650;
}

.dsa-hl :deep(.tok-fn) {
  color: #e8b07a;
}

.dsa-hl :deep(.tok-ty) {
  color: #7fd4c1;
}

.dsa-hl :deep(.tok-str) {
  color: #7ec8e3;
}

.dsa-hl :deep(.tok-tmpl) {
  color: #e06c75;
}

.dsa-hl :deep(.tok-cmt) {
  color: #7d8590;
  font-style: italic;
}

.dsa-hl :deep(.tok-num),
.dsa-hl :deep(.tok-lit) {
  color: #d4a574;
}

.dsa-hl :deep(.tok-op) {
  color: #e6c07b;
}

.dsa-hl :deep(.tok-id) {
  color: #e6edf3;
}
</style>
