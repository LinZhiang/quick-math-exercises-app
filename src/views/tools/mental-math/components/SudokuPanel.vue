<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTouchPrimaryDevice } from '@/composables/useTouchPointerDrag'

type DragPayload =
  | { source: 'pool'; value: number }
  | { source: 'cell'; row: number; col: number }

const DRAG_DATA_KEY = 'application/x-sudoku-drag'

const props = defineProps<{
  puzzle: number[][]
  size: 5 | 9
  feedback: 'correct' | 'wrong' | null
  acceptingInput: boolean
  solutionHint?: string
}>()

const emit = defineEmits<{
  (e: 'submit', grid: number[][]): void
}>()

const { isCompactLayout } = useTouchPrimaryDevice()

const draft = ref<number[][]>([])
const selected = ref<{ row: number; col: number } | null>(null)
const dragPayload = ref<DragPayload | null>(null)
const dropTarget = ref<{ row: number; col: number } | null>(null)
const suppressChipClick = ref(false)

const digits = computed(() => Array.from({ length: props.size }, (_, i) => i + 1))

const isGiven = (row: number, col: number) => props.puzzle[row][col] !== 0

const blankCells = computed(() => {
  const cells: { row: number; col: number }[] = []
  for (let row = 0; row < props.size; row++) {
    for (let col = 0; col < props.size; col++) {
      if (!isGiven(row, col)) cells.push({ row, col })
    }
  }
  return cells
})

const canSubmit = computed(() => {
  if (!props.acceptingInput) return false
  return blankCells.value.every(({ row, col }) => draft.value[row][col] > 0)
})

const selectedLabel = computed(() => {
  if (!selected.value) return '未选中（请先点棋盘上的空格）'
  const { row, col } = selected.value
  return `已选：第 ${row + 1} 行 · 第 ${col + 1} 列`
})

const needSelectHint = ref(false)

function resetDraft() {
  draft.value = props.puzzle.map((row) => [...row])
  selected.value = null
  dragPayload.value = null
  dropTarget.value = null
  suppressChipClick.value = false
}

watch(
  () => props.puzzle,
  () => resetDraft(),
  { immediate: true },
)

watch(
  () => props.acceptingInput,
  (ok) => {
    if (ok) resetDraft()
  },
)

function cellValue(row: number, col: number): number {
  return draft.value[row]?.[col] ?? 0
}

function setCell(row: number, col: number, value: number) {
  if (!props.acceptingInput || isGiven(row, col)) return
  draft.value[row][col] = value
}

function clearCell(row: number, col: number) {
  if (!props.acceptingInput || isGiven(row, col)) return
  draft.value[row][col] = 0
}

function applyDrop(row: number, col: number, drag: DragPayload) {
  if (isGiven(row, col)) return
  if (drag.source === 'pool') {
    setCell(row, col, drag.value)
    selected.value = { row, col }
    return
  }
  const fromVal = cellValue(drag.row, drag.col)
  if (fromVal <= 0) return
  setCell(row, col, fromVal)
  if (drag.row !== row || drag.col !== col) clearCell(drag.row, drag.col)
  selected.value = { row, col }
}

function selectCell(row: number, col: number) {
  if (!props.acceptingInput || isGiven(row, col)) return
  needSelectHint.value = false

  if (
    isCompactLayout.value &&
    selected.value &&
    selected.value.row !== row &&
    selected.value.col !== col &&
    cellValue(selected.value.row, selected.value.col) > 0 &&
    cellValue(row, col) === 0
  ) {
    const from = selected.value
    const value = cellValue(from.row, from.col)
    clearCell(from.row, from.col)
    setCell(row, col, value)
    selected.value = { row, col }
    return
  }

  if (
    isCompactLayout.value &&
    selected.value?.row === row &&
    selected.value?.col === col &&
    cellValue(row, col) > 0
  ) {
    clearCell(row, col)
    return
  }

  selected.value = { row, col }
}

function encodePayload(payload: DragPayload): string {
  return JSON.stringify(payload)
}

function decodePayload(e: DragEvent): DragPayload | null {
  const raw = e.dataTransfer?.getData(DRAG_DATA_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as DragPayload
    } catch {
      /* fall through */
    }
  }
  return dragPayload.value
}

function setDragPayload(payload: DragPayload, e: DragEvent) {
  if (!props.acceptingInput || isCompactLayout.value) return
  if (payload.source === 'cell' && isGiven(payload.row, payload.col)) return
  dragPayload.value = payload
  const dt = e.dataTransfer
  if (dt) {
    dt.effectAllowed = payload.source === 'cell' ? 'move' : 'copy'
    dt.setData(DRAG_DATA_KEY, encodePayload(payload))
    dt.setData('text/plain', 'sudoku')
  }
}

function onDragEnd() {
  dragPayload.value = null
  dropTarget.value = null
  window.setTimeout(() => {
    suppressChipClick.value = false
  }, 0)
}

function onChipDragStart(value: number, e: DragEvent) {
  suppressChipClick.value = true
  setDragPayload({ source: 'pool', value }, e)
}

function onCellDragStart(row: number, col: number, e: DragEvent) {
  if (!props.acceptingInput || isGiven(row, col) || cellValue(row, col) <= 0 || isCompactLayout.value) return
  e.stopPropagation()
  setDragPayload({ source: 'cell', row, col }, e)
}

function onDragOverCell(row: number, col: number, e: DragEvent) {
  if (!props.acceptingInput || isGiven(row, col) || !dragPayload.value || isCompactLayout.value) return
  e.preventDefault()
  e.stopPropagation()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = dragPayload.value.source === 'cell' ? 'move' : 'copy'
  }
  dropTarget.value = { row, col }
}

function onDragLeaveCell(row: number, col: number, e: DragEvent) {
  const related = e.relatedTarget as Node | null
  const current = e.currentTarget as HTMLElement
  if (related && current.contains(related)) return
  if (dropTarget.value?.row === row && dropTarget.value?.col === col) {
    dropTarget.value = null
  }
}

function onDropCell(row: number, col: number, e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  const drag = decodePayload(e)
  dropTarget.value = null
  if (!props.acceptingInput || !drag || isGiven(row, col)) {
    onDragEnd()
    return
  }
  applyDrop(row, col, drag)
  onDragEnd()
}

function onDropReturn(e: DragEvent) {
  e.preventDefault()
  const drag = decodePayload(e)
  if (!props.acceptingInput || !drag || drag.source !== 'cell') {
    onDragEnd()
    return
  }
  clearCell(drag.row, drag.col)
  if (selected.value?.row === drag.row && selected.value?.col === drag.col) {
    selected.value = null
  }
  onDragEnd()
}

function isCellDropActive(row: number, col: number) {
  return dropTarget.value?.row === row && dropTarget.value?.col === col
}

function fillSelectedDigit(value: number) {
  if (!props.acceptingInput) return
  if (!selected.value) {
    needSelectHint.value = true
    return
  }
  needSelectHint.value = false
  setCell(selected.value.row, selected.value.col, value)
}

function onChipClick(value: number) {
  if (suppressChipClick.value) return
  fillSelectedDigit(value)
}

function clearSelected() {
  if (!props.acceptingInput || !selected.value) return
  clearCell(selected.value.row, selected.value.col)
}

function backspace() {
  if (!props.acceptingInput) return
  if (selected.value) {
    clearCell(selected.value.row, selected.value.col)
    return
  }
  const filled = [...blankCells.value]
    .reverse()
    .find(({ row, col }) => cellValue(row, col) > 0)
  if (filled) clearCell(filled.row, filled.col)
}

function clearDraft() {
  if (!props.acceptingInput) return
  for (const { row, col } of blankCells.value) clearCell(row, col)
  selected.value = null
}

function submitDraft() {
  if (!canSubmit.value) return
  emit('submit', draft.value.map((row) => [...row]))
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
  const n = Number(e.key)
  if (Number.isFinite(n) && n >= 1 && n <= props.size) {
    e.preventDefault()
    if (selected.value) fillSelectedDigit(n)
  }
}

defineExpose({
  appendDigit: fillSelectedDigit,
  backspace,
  submitDraft,
})
</script>

<template>
  <div
    class="sd-panel"
    :class="{ 'sd-panel--touch': isCompactLayout }"
    @keydown="onKeydown"
  >
    <div
      class="question-block sd-question"
      :class="{
        'question-block--ok': feedback === 'correct',
        'question-block--bad': feedback === 'wrong',
      }"
    >
      <p class="question-prompt">
        {{ size === 5 ? '5×5 数独：每行、每列 1～5 各出现一次' : '9×9 数独：每行、每列及每个 3×3 宫 1～9 各出现一次' }}
      </p>
      <p v-if="feedback === 'correct'" class="feedback feedback--ok">答对了！</p>
      <p v-else-if="feedback === 'wrong'" class="feedback feedback--bad">
        答错了
        <span v-if="solutionHint" class="sd-hint">· 参考：{{ solutionHint }}</span>
      </p>
    </div>

    <section class="sd-zone" aria-label="数独棋盘">
      <p class="sd-zone__title">
        棋盘
        <span class="sd-zone__sub">
          {{
            isCompactLayout
              ? '先点空格填数；点已填格再点空格可移动；再点同一格可清除'
              : '把数字牌拖到任意空格；或点格选中后点数字'
          }}
        </span>
      </p>
      <p
        class="sd-selection-hint"
        :class="{ 'sd-selection-hint--warn': needSelectHint || !selected }"
      >
        {{ selectedLabel }}
      </p>
      <div
        class="sd-grid-wrap"
        :class="`sd-grid-wrap--${size}`"
      >
        <div
          class="sd-grid"
          :class="`sd-grid--${size}`"
          role="grid"
          :aria-rowcount="size"
          :aria-colcount="size"
        >
          <template v-for="r in size" :key="`r-${r}`">
            <div
              v-for="c in size"
              :key="`c-${r}-${c}`"
              class="sd-cell"
              :class="{
                'sd-cell--given': isGiven(r - 1, c - 1),
                'sd-cell--blank': !isGiven(r - 1, c - 1),
                'sd-cell--selected': selected?.row === r - 1 && selected?.col === c - 1,
                'sd-cell--drop': isCellDropActive(r - 1, c - 1),
                'sd-cell--box-edge-r': size === 9 && (c - 1) % 3 === 2 && c < size,
                'sd-cell--box-edge-b': size === 9 && (r - 1) % 3 === 2 && r < size,
              }"
              role="gridcell"
              :aria-selected="selected?.row === r - 1 && selected?.col === c - 1"
              :draggable="
                !isCompactLayout &&
                acceptingInput &&
                !isGiven(r - 1, c - 1) &&
                cellValue(r - 1, c - 1) > 0
              "
              @click="selectCell(r - 1, c - 1)"
              @dragstart="onCellDragStart(r - 1, c - 1, $event)"
              @dragend="onDragEnd"
              @dragover="onDragOverCell(r - 1, c - 1, $event)"
              @dragleave="onDragLeaveCell(r - 1, c - 1, $event)"
              @drop="onDropCell(r - 1, c - 1, $event)"
            >
              <template v-if="isGiven(r - 1, c - 1)">
                <span class="sd-cell__val sd-cell__val--given">{{ cellValue(r - 1, c - 1) }}</span>
              </template>
              <template v-else-if="cellValue(r - 1, c - 1) > 0">
                <span class="sd-cell__val sd-cell__val--user">{{ cellValue(r - 1, c - 1) }}</span>
              </template>
              <span v-else class="sd-cell__placeholder">·</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <section class="sd-zone sd-zone--pad" aria-label="数字牌">
      <p class="sd-zone__title">
        数字牌
        <span class="sd-zone__sub">
          {{ isCompactLayout ? '点格子后再点数字；再点已填格可清除' : '拖到棋盘空格 · 或先点格子再点数字' }}
        </span>
      </p>
      <div class="sd-palette">
        <div
          v-for="n in digits"
          :key="n"
          class="sd-chip"
          :draggable="acceptingInput && !isCompactLayout"
          @dragstart="onChipDragStart(n, $event)"
          @dragend="onDragEnd"
          @click="onChipClick(n)"
        >
          {{ n }}
        </div>
        <button
          v-if="isCompactLayout"
          type="button"
          class="sd-chip sd-chip--erase"
          :disabled="!acceptingInput || !selected"
          @click="clearSelected"
        >
          清除
        </button>
      </div>
    </section>

    <div
      v-if="!isCompactLayout"
      class="sd-return"
      :class="{ 'sd-return--active': dragPayload?.source === 'cell' }"
      data-drop-key="return"
      @dragover.prevent
      @drop="onDropReturn($event)"
    >
      拖到这里清空已填数字
    </div>

    <div class="sd-actions">
      <button type="button" class="sd-key sd-key--muted" :disabled="!acceptingInput" @click="backspace">
        退格
      </button>
      <button type="button" class="sd-key sd-key--muted" :disabled="!acceptingInput" @click="clearDraft">
        清空
      </button>
      <button type="button" class="sd-key sd-key--submit" :disabled="!canSubmit" @click="submitDraft">
        提交
      </button>
    </div>

    <p class="hint sd-hint-bar">
      <template v-if="isCompactLayout">
        手机：① 点空格 ② 点数字填数；点已填格再点另一空格可移动；再点同一格或「清除」可擦掉
      </template>
      <template v-else>
        数字牌可拖到任意空格；选中格后按 <kbd>1</kbd>～<kbd>{{ size }}</kbd> 填数；<kbd>Enter</kbd> 提交
      </template>
    </p>
  </div>
</template>

<style scoped>
.sd-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.sd-question .question-prompt {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--app-text-secondary, #666);
}

.sd-zone__title {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 600;
}

.sd-zone__sub {
  font-weight: 400;
  color: var(--app-text-secondary, #888);
  font-size: 0.75rem;
}

.sd-selection-hint {
  margin: 0 0 8px;
  font-size: 0.82rem;
  color: var(--app-primary, #2563eb);
  font-weight: 600;
}

.sd-selection-hint--warn {
  color: #c2410c;
}

.sd-grid-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
}

.sd-grid {
  display: grid;
  border: 2px solid rgba(72, 108, 160, 0.45);
  border-radius: 8px;
  overflow: hidden;
  background: var(--app-surface, #fff);
}

.sd-grid--5 {
  grid-template-columns: repeat(5, minmax(40px, 12vw));
  grid-auto-rows: minmax(40px, 12vw);
}

.sd-grid--9 {
  grid-template-columns: repeat(9, minmax(32px, 9.5vw));
  grid-auto-rows: minmax(32px, 9.5vw);
}

.sd-panel--touch .sd-grid--5 {
  grid-template-columns: repeat(5, minmax(48px, 14vw));
  grid-auto-rows: minmax(48px, 14vw);
}

.sd-panel--touch .sd-grid--9 {
  grid-template-columns: repeat(9, minmax(36px, 10.5vw));
  grid-auto-rows: minmax(36px, 10.5vw);
}

.sd-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(72, 108, 160, 0.18);
  box-sizing: border-box;
  cursor: pointer;
  transition:
    background 0.12s,
    box-shadow 0.12s;
  touch-action: manipulation;
  min-width: 0;
  min-height: 0;
}

.sd-cell--box-edge-r {
  border-right-width: 2px;
  border-right-color: rgba(72, 108, 160, 0.45);
}

.sd-cell--box-edge-b {
  border-bottom-width: 2px;
  border-bottom-color: rgba(72, 108, 160, 0.45);
}

.sd-cell--given {
  background: rgba(72, 108, 160, 0.08);
  cursor: default;
}

.sd-cell--blank:active {
  background: rgba(72, 108, 160, 0.08);
}

.sd-cell--selected {
  background: rgba(72, 108, 160, 0.16);
  box-shadow: inset 0 0 0 2px rgba(72, 108, 160, 0.45);
}

.sd-cell--drop {
  background: rgba(72, 108, 160, 0.22);
  box-shadow: inset 0 0 0 2px rgba(72, 108, 160, 0.65);
}

.sd-cell[draggable='true'] {
  cursor: grab;
}

.sd-cell__val {
  font-size: clamp(0.85rem, 3.5vw, 1.1rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  pointer-events: none;
}

.sd-cell__val--given {
  color: var(--app-text-primary, #333);
}

.sd-cell__val--user {
  color: rgba(46, 95, 160, 1);
}

.sd-cell__placeholder {
  color: var(--app-text-secondary, #bbb);
  font-size: 0.78rem;
  pointer-events: none;
}

.sd-zone--pad {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 10px 0 4px;
  background: linear-gradient(to bottom, transparent, var(--app-surface, #fff) 24%);
}

.sd-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.sd-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(72, 108, 160, 0.45);
  background: rgba(72, 108, 160, 0.08);
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition:
    transform 0.1s,
    box-shadow 0.12s;
}

.sd-panel--touch .sd-chip {
  min-width: 52px;
  min-height: 52px;
  font-size: 1.15rem;
}

.sd-chip--erase {
  border-color: rgba(200, 80, 60, 0.45);
  background: rgba(200, 80, 60, 0.08);
  color: #a05040;
  font-size: 0.9rem;
}

.sd-return {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px dashed var(--app-border-soft, #ccc);
  font-size: 0.78rem;
  color: var(--app-text-secondary, #888);
  text-align: center;
  transition:
    border-color 0.12s,
    background 0.12s;
}

.sd-return--active {
  border-color: rgba(200, 80, 60, 0.5);
  background: rgba(200, 80, 60, 0.06);
  color: #a05040;
}

.sd-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sd-key {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #ddd);
  background: var(--app-surface, #fff);
  font-size: 0.95rem;
  cursor: pointer;
  touch-action: manipulation;
}

.sd-key:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sd-key--muted {
  font-size: 0.85rem;
}

.sd-key--submit {
  flex: 1;
  min-width: 88px;
  background: rgba(72, 108, 160, 0.12);
  border-color: rgba(72, 108, 160, 0.45);
  font-weight: 600;
}

.sd-hint {
  font-weight: 400;
  opacity: 0.9;
}

.sd-hint-bar {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .sd-panel .sd-grid--5 {
    grid-template-columns: repeat(5, minmax(48px, 14vw));
    grid-auto-rows: minmax(48px, 14vw);
  }

  .sd-panel .sd-grid--9 {
    grid-template-columns: repeat(9, minmax(36px, 10.5vw));
    grid-auto-rows: minmax(36px, 10.5vw);
  }

  .sd-panel .sd-chip {
    min-width: 52px;
    min-height: 52px;
    font-size: 1.15rem;
  }

  .sd-panel .sd-key {
    min-height: 48px;
    font-size: 1rem;
  }
}
</style>
