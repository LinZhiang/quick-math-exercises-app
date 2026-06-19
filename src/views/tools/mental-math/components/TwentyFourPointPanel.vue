<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type OpValue = '+' | '−' | '×' | '÷'
type ParenValue = '(' | ')'

type ExprChip =
  | { id: number; kind: 'num'; slotIndex: number }
  | { id: number; kind: 'op'; value: OpValue }
  | { id: number; kind: 'paren'; value: ParenValue }

type DragPayload =
  | { source: 'pool-num'; slotIndex: number }
  | { source: 'pool-op'; value: OpValue }
  | { source: 'pool-paren'; value: ParenValue }
  | { source: 'expr'; fromIndex: number }

const OP_SYMBOLS: OpValue[] = ['+', '−', '×', '÷']
const PAREN_SYMBOLS: ParenValue[] = ['(', ')']

const props = defineProps<{
  nums: number[]
  feedback: 'correct' | 'wrong' | null
  acceptingInput: boolean
  sampleSolution?: string
}>()

const emit = defineEmits<{
  (e: 'submit', expression: string): void
}>()

let chipIdSeq = 0
const chips = ref<ExprChip[]>([])
const dragPayload = ref<DragPayload | null>(null)
const dropIndex = ref<number | null>(null)

const usedSlots = computed(() => {
  const used = props.nums.map(() => false)
  for (const c of chips.value) {
    if (c.kind === 'num') used[c.slotIndex] = true
  }
  return used
})

const draftExpression = computed(() =>
  chips.value
    .map((c) => {
      if (c.kind === 'num') return String(props.nums[c.slotIndex])
      return c.value
    })
    .join(''),
)

const canSubmit = computed(() => chips.value.length > 0 && props.acceptingInput)

function mkNumChip(slotIndex: number): ExprChip {
  return { id: ++chipIdSeq, kind: 'num', slotIndex }
}

function mkOpChip(value: OpValue): ExprChip {
  return { id: ++chipIdSeq, kind: 'op', value }
}

function mkParenChip(value: ParenValue): ExprChip {
  return { id: ++chipIdSeq, kind: 'paren', value }
}

function chipLabel(chip: ExprChip): string {
  if (chip.kind === 'num') return String(props.nums[chip.slotIndex])
  return chip.value
}

function resetDraft() {
  chips.value = []
  dragPayload.value = null
  dropIndex.value = null
}

watch(
  () => props.nums,
  () => resetDraft(),
  { immediate: true },
)

watch(
  () => props.acceptingInput,
  (ok) => {
    if (ok) resetDraft()
  },
)

function setDragPayload(payload: DragPayload, e: DragEvent) {
  if (!props.acceptingInput) return
  dragPayload.value = payload
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = payload.source === 'expr' ? 'move' : 'copy'
    e.dataTransfer.setData('text/plain', 'tf-chip')
  }
}

function onDragEnd() {
  dragPayload.value = null
  dropIndex.value = null
}

function onDragOverSlot(index: number, e: DragEvent) {
  if (!props.acceptingInput || !dragPayload.value) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = dragPayload.value.source === 'expr' ? 'move' : 'copy'
  dropIndex.value = index
}

function insertChipAt(index: number, chip: ExprChip) {
  const i = Math.max(0, Math.min(index, chips.value.length))
  chips.value.splice(i, 0, chip)
}

function removeChipAt(index: number) {
  chips.value.splice(index, 1)
}

function dropAt(index: number) {
  const drag = dragPayload.value
  if (!props.acceptingInput || !drag) return

  if (drag.source === 'pool-num') {
    if (usedSlots.value[drag.slotIndex]) return
    insertChipAt(index, mkNumChip(drag.slotIndex))
  } else if (drag.source === 'pool-op') {
    insertChipAt(index, mkOpChip(drag.value))
  } else if (drag.source === 'pool-paren') {
    insertChipAt(index, mkParenChip(drag.value))
  } else if (drag.source === 'expr') {
    const from = drag.fromIndex
    if (from < 0 || from >= chips.value.length) return
    const [moved] = chips.value.splice(from, 1)
    let to = index
    if (from < to) to -= 1
    to = Math.max(0, Math.min(to, chips.value.length))
    chips.value.splice(to, 0, moved)
  }

  onDragEnd()
}

function onDropSlot(index: number, e: DragEvent) {
  e.preventDefault()
  dropAt(index)
}

function onDropReturnPool(e: DragEvent) {
  e.preventDefault()
  const drag = dragPayload.value
  if (!props.acceptingInput || !drag || drag.source !== 'expr') return
  const chip = chips.value[drag.fromIndex]
  if (chip?.kind === 'num') removeChipAt(drag.fromIndex)
  onDragEnd()
}

function appendNum(index: number) {
  if (!props.acceptingInput || usedSlots.value[index]) return
  insertChipAt(chips.value.length, mkNumChip(index))
}

function appendOp(op: OpValue) {
  if (!props.acceptingInput) return
  insertChipAt(chips.value.length, mkOpChip(op))
}

function appendParen(p: ParenValue) {
  if (!props.acceptingInput) return
  insertChipAt(chips.value.length, mkParenChip(p))
}

function backspace() {
  if (!props.acceptingInput || chips.value.length === 0) return
  removeChipAt(chips.value.length - 1)
}

function clearDraft() {
  if (!props.acceptingInput) return
  resetDraft()
}

function submitDraft() {
  if (!canSubmit.value) return
  emit('submit', draftExpression.value)
}

function onKeydown(e: KeyboardEvent) {
  if (!props.acceptingInput) return
  if (e.key === 'Enter') {
    e.preventDefault()
    submitDraft()
    return
  }
  if (e.key === 'Backspace') {
    e.preventDefault()
    backspace()
    return
  }
  if (e.key === '(' || e.key === ')') {
    e.preventDefault()
    appendParen(e.key)
    return
  }
  if (e.key === '+' || e.key === '-') {
    e.preventDefault()
    appendOp(e.key === '+' ? '+' : '−')
    return
  }
  if (e.key === '*') {
    e.preventDefault()
    appendOp('×')
    return
  }
  if (e.key === '/') {
    e.preventDefault()
    appendOp('÷')
  }
}

defineExpose({
  appendNum,
  backspace,
  submitDraft,
})
</script>

<template>
  <div class="tf-panel" @keydown="onKeydown">
    <div
      class="question-block tf-question"
      :class="{
        'question-block--ok': feedback === 'correct',
        'question-block--bad': feedback === 'wrong',
      }"
    >
      <p class="question-prompt">用下列四个数凑 24（每数用一次，仅 + − × ÷ 与括号）</p>
      <p v-if="feedback === 'correct'" class="feedback feedback--ok">答对了！</p>
      <p v-else-if="feedback === 'wrong'" class="feedback feedback--bad">
        答错了
        <span v-if="sampleSolution" class="tf-hint">· 参考：{{ sampleSolution }}</span>
      </p>
    </div>

  <section class="tf-zone tf-zone--expr" aria-label="算式区">
      <p class="tf-zone__title">你的算式 <span class="tf-zone__sub">拖拽牌到此处，可拖动调整顺序</span></p>
      <div
        class="tf-lane"
        @dragover.prevent
        @drop="onDropSlot(chips.length, $event)"
      >
        <template v-for="(chip, i) in chips" :key="chip.id">
          <div
            class="tf-slot"
            :class="{ 'tf-slot--active': dropIndex === i }"
            @dragover="onDragOverSlot(i, $event)"
            @drop="onDropSlot(i, $event)"
          />
          <div
            class="tf-chip tf-chip--in-expr"
            draggable="true"
            @dragstart="setDragPayload({ source: 'expr', fromIndex: i }, $event)"
            @dragend="onDragEnd"
          >
            {{ chipLabel(chip) }}
          </div>
        </template>
        <div
          class="tf-slot tf-slot--end"
          :class="{ 'tf-slot--active': dropIndex === chips.length }"
          @dragover="onDragOverSlot(chips.length, $event)"
          @drop="onDropSlot(chips.length, $event)"
        />
        <p v-if="chips.length === 0" class="tf-lane__empty">把下方数字牌、符号牌拖到这里</p>
      </div>
      <p class="tf-expr-preview" aria-live="polite">
        预览：{{ draftExpression || '—' }}
      </p>
    </section>

    <section class="tf-zone" aria-label="数字牌">
      <p class="tf-zone__title">数字牌 <span class="tf-zone__sub">拖入算式区 · 点击可追加到末尾</span></p>
      <div class="tf-palette">
        <div
          v-for="(n, idx) in nums"
          :key="`n-${idx}`"
          class="tf-chip tf-chip--num"
          :class="{ 'tf-chip--used': usedSlots[idx] }"
          :draggable="acceptingInput && !usedSlots[idx]"
          @dragstart="setDragPayload({ source: 'pool-num', slotIndex: idx }, $event)"
          @dragend="onDragEnd"
          @click="appendNum(idx)"
        >
          <span class="tf-chip__badge">{{ idx + 1 }}</span>
          <span>{{ n }}</span>
        </div>
      </div>
    </section>

    <section class="tf-zone" aria-label="符号牌">
      <p class="tf-zone__title">符号牌</p>
      <div class="tf-palette">
        <div
          v-for="op in OP_SYMBOLS"
          :key="op"
          class="tf-chip tf-chip--sym"
          :draggable="acceptingInput"
          @dragstart="setDragPayload({ source: 'pool-op', value: op }, $event)"
          @dragend="onDragEnd"
          @click="appendOp(op)"
        >
          {{ op }}
        </div>
        <div
          v-for="p in PAREN_SYMBOLS"
          :key="p"
          class="tf-chip tf-chip--sym"
          :draggable="acceptingInput"
          @dragstart="setDragPayload({ source: 'pool-paren', value: p }, $event)"
          @dragend="onDragEnd"
          @click="appendParen(p)"
        >
          {{ p }}
        </div>
      </div>
    </section>

    <div
      class="tf-return"
      :class="{ 'tf-return--active': dragPayload?.source === 'expr' }"
      @dragover.prevent
      @drop="onDropReturnPool($event)"
    >
      拖到这里放回数字牌（仅数字可放回）
    </div>

    <div class="tf-actions">
      <button type="button" class="tf-key tf-key--muted" :disabled="!acceptingInput" @click="backspace">
        退格
      </button>
      <button type="button" class="tf-key tf-key--muted" :disabled="!acceptingInput" @click="clearDraft">
        清空
      </button>
      <button type="button" class="tf-key tf-key--submit" :disabled="!canSubmit" @click="submitDraft">
        提交
      </button>
    </div>

    <p class="hint tf-hint-bar">
      拖拽拼算式，或在算式区内拖动调整顺序；<kbd>Enter</kbd> 提交；数字键
      <kbd>1</kbd>～<kbd>4</kbd> 追加对应数字
    </p>
  </div>
</template>

<style scoped>
.tf-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tf-question .question-prompt {
  margin: 0;
  font-size: 0.95rem;
  color: var(--app-text-secondary, #666);
}

.tf-zone__title {
  margin: 0 0 8px;
  font-size: 0.88rem;
  font-weight: 600;
}

.tf-zone__sub {
  font-weight: 400;
  color: var(--app-text-secondary, #888);
  font-size: 0.8rem;
}

.tf-zone--expr {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--app-border-soft, #e0e0e0);
  background: var(--app-surface-muted, rgba(0, 0, 0, 0.03));
}

.tf-lane {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 56px;
  padding: 10px;
  border-radius: 10px;
  border: 2px dashed rgba(46, 125, 90, 0.35);
  background: var(--app-surface, #fff);
}

.tf-lane__empty {
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 0.88rem;
  color: var(--app-text-secondary, #999);
  pointer-events: none;
}

.tf-slot {
  width: 10px;
  min-height: 40px;
  border-radius: 4px;
  transition: background 0.12s, width 0.12s;
}

.tf-slot--active {
  width: 18px;
  background: rgba(46, 125, 90, 0.25);
}

.tf-slot--end {
  flex: 1;
  min-width: 24px;
  min-height: 40px;
}

.tf-expr-preview {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: var(--app-text-secondary, #777);
  font-variant-numeric: tabular-nums;
}

.tf-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tf-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 2px solid var(--app-border-soft, #ddd);
  background: var(--app-surface, #fff);
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: grab;
  user-select: none;
  transition: transform 0.1s, opacity 0.15s, box-shadow 0.12s;
}

.tf-chip:active {
  cursor: grabbing;
}

.tf-chip--in-expr {
  border-color: rgba(46, 125, 90, 0.55);
  background: rgba(46, 125, 90, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.tf-chip--num {
  border-color: rgba(46, 125, 90, 0.45);
  background: rgba(46, 125, 90, 0.08);
  min-width: 64px;
}

.tf-chip--num.tf-chip--used {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.tf-chip--sym {
  min-width: 40px;
  font-size: 1.15rem;
}

.tf-chip__badge {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--app-text-secondary, #888);
}

.tf-return {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px dashed var(--app-border-soft, #ccc);
  font-size: 0.82rem;
  color: var(--app-text-secondary, #888);
  text-align: center;
  transition: border-color 0.12s, background 0.12s;
}

.tf-return--active {
  border-color: rgba(200, 80, 60, 0.5);
  background: rgba(200, 80, 60, 0.06);
  color: #a05040;
}

.tf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tf-key {
  min-width: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #ddd);
  background: var(--app-surface, #fff);
  font-size: 0.95rem;
  cursor: pointer;
}

.tf-key:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tf-key--muted {
  font-size: 0.85rem;
}

.tf-key--submit {
  flex: 1;
  min-width: 88px;
  background: rgba(46, 125, 90, 0.12);
  border-color: rgba(46, 125, 90, 0.45);
  font-weight: 600;
}

.tf-hint {
  font-weight: 400;
  opacity: 0.9;
}

.tf-hint-bar {
  margin: 0;
}
</style>
