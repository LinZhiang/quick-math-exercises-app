<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export type SentenceOrderItem = {
  /** 初始展示序号 1～5（随段固定，不随拖动改变） */
  label: number
  text: string
}

const props = defineProps<{
  segments: string[]
  /** 当前排列：各段的 label 序列（自上而下） */
  modelValue: number[]
  disabled?: boolean
  /** 提交后高亮正确顺序对应的 label 序列 */
  revealCorrectOrder?: number[] | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const selectedLabel = ref<number | null>(null)
const dragFromLabel = ref<number | null>(null)

const items = computed(() => {
  const segs = props.segments
  const order = props.modelValue
  if (!segs.length || order.length !== segs.length) return [] as SentenceOrderItem[]
  return order.map((label) => ({
    label,
    text: segs[label - 1] ?? '',
  }))
})

watch(
  () => props.segments,
  (segs) => {
    selectedLabel.value = null
    dragFromLabel.value = null
    if (segs.length === 5 && props.modelValue.length !== 5) {
      emit(
        'update:modelValue',
        segs.map((_, i) => i + 1),
      )
    }
  },
  { immediate: true },
)

function moveLabelToIndex(fromLabel: number, toIndex: number) {
  const next = [...props.modelValue]
  const fromIndex = next.indexOf(fromLabel)
  if (fromIndex < 0 || toIndex < 0 || toIndex >= next.length) return
  if (fromIndex === toIndex) return
  next.splice(fromIndex, 1)
  next.splice(toIndex, 0, fromLabel)
  emit('update:modelValue', next)
}

function swapLabels(a: number, b: number) {
  if (a === b) return
  const next = [...props.modelValue]
  const i = next.indexOf(a)
  const j = next.indexOf(b)
  if (i < 0 || j < 0) return
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  emit('update:modelValue', next)
}

function onItemClick(label: number) {
  if (props.disabled) return
  if (selectedLabel.value == null) {
    selectedLabel.value = label
    return
  }
  if (selectedLabel.value === label) {
    selectedLabel.value = null
    return
  }
  swapLabels(selectedLabel.value, label)
  selectedLabel.value = null
}

function onDragStart(e: DragEvent, label: number) {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  dragFromLabel.value = label
  selectedLabel.value = null
  e.dataTransfer?.setData('text/plain', String(label))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e: DragEvent) {
  if (props.disabled) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent, targetIndex: number) {
  if (props.disabled) return
  e.preventDefault()
  const raw = e.dataTransfer?.getData('text/plain') || String(dragFromLabel.value ?? '')
  const from = Number(raw)
  dragFromLabel.value = null
  if (!from || from < 1 || from > 5) return
  moveLabelToIndex(from, targetIndex)
}

function onDragEnd() {
  dragFromLabel.value = null
}

function isCorrectPosition(label: number, visualIndex: number): boolean {
  const correct = props.revealCorrectOrder
  if (!correct || correct.length !== 5) return false
  return correct[visualIndex] === label
}
</script>

<template>
  <div class="sentence-order-board" :class="{ 'is-disabled': disabled }">
    <p v-if="!disabled" class="sentence-order-board__hint">
      拖动卡片调整顺序；或先点选一段，再点另一段交换位置
    </p>
    <ul class="sentence-order-board__list">
      <li
        v-for="(item, idx) in items"
        :key="item.label"
        class="sentence-order-board__item"
        :class="{
          'is-selected': selectedLabel === item.label,
          'is-dragging': dragFromLabel === item.label,
          'is-correct-slot': disabled && isCorrectPosition(item.label, idx),
          'is-wrong-slot':
            disabled &&
            revealCorrectOrder?.length === 5 &&
            !isCorrectPosition(item.label, idx),
        }"
        :draggable="!disabled"
        @click="onItemClick(item.label)"
        @dragstart="onDragStart($event, item.label)"
        @dragover="onDragOver"
        @drop="onDrop($event, Number(idx))"
        @dragend="onDragEnd"
      >
        <span class="sentence-order-board__badge" aria-hidden="true">{{ item.label }}</span>
        <span class="sentence-order-board__pos">第 {{ Number(idx) + 1 }} 位</span>
        <span class="sentence-order-board__text">{{ item.text }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sentence-order-board__hint {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--el-text-color-secondary, #64748b);
  text-align: left;
}

.sentence-order-board__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sentence-order-board__item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: start;
  gap: 8px 10px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color, #e2e8f0);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  cursor: grab;
  text-align: left;
  user-select: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.sentence-order-board__item:active {
  cursor: grabbing;
}

.sentence-order-board.is-disabled .sentence-order-board__item {
  cursor: default;
}

.sentence-order-board__item.is-selected {
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary, #409eff) 22%, transparent);
}

.sentence-order-board__item.is-dragging {
  opacity: 0.55;
}

.sentence-order-board__item.is-correct-slot {
  border-color: var(--el-color-success, #67c23a);
  background: color-mix(in srgb, var(--el-color-success, #67c23a) 8%, transparent);
}

.sentence-order-board__item.is-wrong-slot {
  border-color: var(--el-color-danger, #f56c6c);
  background: color-mix(in srgb, var(--el-color-danger, #f56c6c) 8%, transparent);
}

.sentence-order-board__badge {
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

.sentence-order-board__pos {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5rem;
  color: var(--el-text-color-secondary, #64748b);
  white-space: nowrap;
}

.sentence-order-board__text {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--el-text-color-primary, #303133);
}
</style>
