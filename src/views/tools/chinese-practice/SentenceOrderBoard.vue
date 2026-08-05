<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { orderSegmentsToReadingText } from '@/utils/currentAffairsDrillPractice'

const props = defineProps<{
  segments: string[]
  /** 当前作答顺序：已点选的段序号（1～5），自上而下为第 1～n 位 */
  modelValue: number[]
  disabled?: boolean
  /** 提交后：正确阅读顺序的段序号 */
  revealCorrectOrder?: number[] | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const dragFromPos = ref<number | null>(null)
const touchFromPos = ref<number | null>(null)
const touchOverPos = ref<number | null>(null)
const answerListEl = ref<HTMLOListElement | null>(null)

const pool = computed(() =>
  props.segments.map((text, i) => ({
    label: i + 1,
    text,
    placed: props.modelValue.includes(i + 1),
  })),
)

const answerItems = computed(() =>
  props.modelValue.map((label, pos) => ({
    pos: pos + 1,
    label,
    text: props.segments[label - 1] ?? '',
  })),
)

const correctReadingText = computed(() => {
  const order = props.revealCorrectOrder
  if (!order || order.length !== 5 || !props.disabled) return ''
  return orderSegmentsToReadingText(props.segments, order.join('、'))
})

watch(
  () => props.segments.join('\u0001'),
  () => {
    dragFromPos.value = null
    touchFromPos.value = null
    touchOverPos.value = null
    if (props.modelValue.length && props.segments.length !== 5) {
      emit('update:modelValue', [])
    }
  },
)

function togglePool(label: number) {
  if (props.disabled) return
  const idx = props.modelValue.indexOf(label)
  if (idx >= 0) {
    const next = [...props.modelValue]
    next.splice(idx, 1)
    emit('update:modelValue', next)
    return
  }
  if (props.modelValue.length >= 5) return
  emit('update:modelValue', [...props.modelValue, label])
}

function removeAt(posIndex: number) {
  if (props.disabled) return
  const next = [...props.modelValue]
  next.splice(posIndex, 1)
  emit('update:modelValue', next)
}

function movePos(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return
  if (fromIndex < 0 || toIndex < 0) return
  if (fromIndex >= props.modelValue.length || toIndex >= props.modelValue.length) return
  const next = [...props.modelValue]
  const [item] = next.splice(fromIndex, 1)
  if (item == null) return
  next.splice(toIndex, 0, item)
  emit('update:modelValue', next)
}

function moveBy(posIndex: number, delta: number) {
  if (props.disabled) return
  movePos(posIndex, posIndex + delta)
}

function onDragStart(e: DragEvent, posIndex: number) {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  dragFromPos.value = posIndex
  e.dataTransfer?.setData('text/plain', String(posIndex))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent, toIndex: number) {
  if (props.disabled) return
  e.preventDefault()
  const raw = e.dataTransfer?.getData('text/plain')
  const from = raw !== '' && raw != null ? Number(raw) : dragFromPos.value
  dragFromPos.value = null
  if (from == null || Number.isNaN(from)) return
  movePos(from, toIndex)
}

function onDragEnd() {
  dragFromPos.value = null
}

function hitAnswerIndex(clientY: number): number | null {
  const root = answerListEl.value
  if (!root) return null
  const items = root.querySelectorAll<HTMLElement>('.sob__answer-item')
  for (let i = 0; i < items.length; i++) {
    const rect = items[i]!.getBoundingClientRect()
    if (clientY >= rect.top && clientY <= rect.bottom) return i
  }
  if (!items.length) return null
  const first = items[0]!.getBoundingClientRect()
  if (clientY < first.top) return 0
  return items.length - 1
}

function onTouchStart(e: TouchEvent, posIndex: number) {
  if (props.disabled) return
  if (e.touches.length !== 1) return
  const target = e.target as HTMLElement | null
  if (target?.closest('button')) return
  touchFromPos.value = posIndex
  touchOverPos.value = posIndex
}

function onTouchMove(e: TouchEvent) {
  if (props.disabled || touchFromPos.value == null) return
  const t = e.touches[0]
  if (!t) return
  e.preventDefault()
  touchOverPos.value = hitAnswerIndex(t.clientY)
}

function onTouchEnd() {
  if (props.disabled) {
    touchFromPos.value = null
    touchOverPos.value = null
    return
  }
  const from = touchFromPos.value
  const to = touchOverPos.value
  touchFromPos.value = null
  touchOverPos.value = null
  if (from == null || to == null) return
  movePos(from, to)
}

function onTouchCancel() {
  touchFromPos.value = null
  touchOverPos.value = null
}

onBeforeUnmount(() => {
  touchFromPos.value = null
  touchOverPos.value = null
})

function isCorrectSlot(posIndex: number, label: number): boolean {
  const correct = props.revealCorrectOrder
  if (!correct || correct.length !== 5) return false
  return correct[posIndex] === label
}
</script>

<template>
  <div class="sob" :class="{ 'is-disabled': disabled }">
    <section class="sob__pool" aria-label="待选片段">
      <p class="sob__label">待选片段（点选填入下方排序；再点可取消）</p>
      <ul class="sob__pool-list">
        <li
          v-for="item in pool"
          :key="item.label"
          class="sob__pool-item"
          :class="{ 'is-placed': item.placed, 'is-disabled': disabled }"
        >
          <button
            type="button"
            class="sob__pool-btn"
            :disabled="disabled"
            @click="togglePool(item.label)"
          >
            <span class="sob__badge">{{ item.label }}</span>
            <span class="sob__text">{{ item.text }}</span>
            <span v-if="item.placed" class="sob__placed-tag">
              第 {{ modelValue.indexOf(item.label) + 1 }} 位
            </span>
          </button>
        </li>
      </ul>
    </section>

    <section class="sob__answer" aria-label="我的排序">
      <p class="sob__label">
        我的排序（{{ answerItems.length }}/5）
        <span v-if="!disabled && answerItems.length" class="sob__hint">
          可拖动或点 ↑↓ 调整
        </span>
      </p>
      <ol v-if="answerItems.length" ref="answerListEl" class="sob__answer-list">
        <li
          v-for="(item, idx) in answerItems"
          :key="`${item.label}-${item.pos}`"
          class="sob__answer-item"
          :class="{
            'is-dragging': dragFromPos === idx || touchFromPos === idx,
            'is-drop-target': touchOverPos === idx && touchFromPos !== idx,
            'is-correct': disabled && isCorrectSlot(Number(idx), item.label),
            'is-wrong':
              disabled &&
              revealCorrectOrder?.length === 5 &&
              !isCorrectSlot(Number(idx), item.label),
          }"
          :draggable="!disabled"
          @dragstart="onDragStart($event, Number(idx))"
          @dragover="onDragOver"
          @drop="onDrop($event, Number(idx))"
          @dragend="onDragEnd"
          @touchstart.passive="onTouchStart($event, Number(idx))"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchCancel"
        >
          <span class="sob__pos">第 {{ item.pos }} 位</span>
          <span class="sob__badge sob__badge--sm">{{ item.label }}</span>
          <span class="sob__text">{{ item.text }}</span>
          <div v-if="!disabled" class="sob__actions">
            <button
              type="button"
              class="sob__move"
              aria-label="上移"
              :disabled="Number(idx) === 0"
              @click.stop="moveBy(Number(idx), -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="sob__move"
              aria-label="下移"
              :disabled="Number(idx) >= answerItems.length - 1"
              @click.stop="moveBy(Number(idx), 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="sob__remove"
              aria-label="移出"
              @click.stop="removeAt(Number(idx))"
            >
              ×
            </button>
          </div>
        </li>
      </ol>
      <p v-else class="sob__empty">点上方片段，按阅读顺序依次填入这里</p>
    </section>

    <section v-if="correctReadingText" class="sob__reveal" aria-label="正确原文">
      <p class="sob__label">正确顺序原文</p>
      <p class="sob__reveal-order">
        序号：{{ revealCorrectOrder?.join(' → ') }}
      </p>
      <p class="sob__reveal-text">{{ correctReadingText }}</p>
    </section>
  </div>
</template>

<style scoped>
.sob {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.sob__label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-secondary, #64748b);
}

.sob__hint {
  font-weight: 500;
  opacity: 0.85;
}

.sob__pool-list,
.sob__answer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sob__pool-btn {
  appearance: none;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color, #e2e8f0);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.sob__pool-item.is-placed .sob__pool-btn {
  border-color: color-mix(in srgb, var(--el-color-primary, #409eff) 45%, transparent);
  background: color-mix(in srgb, var(--el-color-primary, #409eff) 8%, transparent);
}

.sob__pool-btn:disabled {
  cursor: default;
  opacity: 0.85;
}

.sob__badge {
  min-width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--el-color-primary, #409eff);
  background: color-mix(in srgb, var(--el-color-primary, #409eff) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-primary, #409eff) 28%, transparent);
}

.sob__badge--sm {
  min-width: 1.35rem;
  height: 1.35rem;
  font-size: 0.78rem;
}

.sob__text {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--el-text-color-primary, #303133);
}

.sob__placed-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
  white-space: nowrap;
  line-height: 1.5rem;
}

.sob__answer {
  padding: 10px;
  border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--el-color-primary, #409eff) 35%, transparent);
  background: color-mix(in srgb, var(--el-color-primary, #409eff) 5%, transparent);
}

.sob__empty {
  margin: 0;
  padding: 14px 8px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary, #64748b);
}

.sob__answer-item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 8px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color, #e2e8f0);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  cursor: grab;
  user-select: none;
  touch-action: none;
  -webkit-user-select: none;
}

.sob__answer-item:active {
  cursor: grabbing;
}

.sob.is-disabled .sob__answer-item {
  cursor: default;
  touch-action: auto;
}

.sob__answer-item.is-dragging {
  opacity: 0.55;
}

.sob__answer-item.is-drop-target {
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary, #409eff) 35%, transparent);
}

.sob__answer-item.is-correct {
  border-color: var(--el-color-success, #67c23a);
  background: color-mix(in srgb, var(--el-color-success, #67c23a) 8%, transparent);
}

.sob__answer-item.is-wrong {
  border-color: var(--el-color-danger, #f56c6c);
  background: color-mix(in srgb, var(--el-color-danger, #f56c6c) 8%, transparent);
}

.sob__pos {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.5rem;
  color: var(--el-text-color-secondary, #64748b);
  white-space: nowrap;
}

.sob__actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.sob__move,
.sob__remove {
  appearance: none;
  border: none;
  margin: 0;
  padding: 0 6px;
  min-width: 28px;
  min-height: 28px;
  background: transparent;
  color: var(--el-text-color-secondary, #94a3b8);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
  -webkit-tap-highlight-color: transparent;
}

.sob__move:disabled {
  opacity: 0.35;
  cursor: default;
}

.sob__move:not(:disabled):active,
.sob__remove:active {
  background: color-mix(in srgb, var(--el-color-primary, #409eff) 12%, transparent);
}

.sob__reveal {
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--el-color-success, #67c23a) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-success, #67c23a) 28%, transparent);
}

.sob__reveal-order {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-color-success, #67c23a);
}

.sob__reveal-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--el-text-color-primary, #303133);
  text-align: justify;
}
</style>
