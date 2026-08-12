<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { SchulteQuestion } from '@/utils/schultePractice'

const props = defineProps<{
  question: SchulteQuestion
  feedback: 'correct' | 'wrong' | null
  acceptingInput: boolean
  reviewing: boolean
  reviewDetail: string
  previewMs: number
}>()

const emit = defineEmits<{
  (e: 'preview-done'): void
  (e: 'complete', payload: { ok: boolean; clicked: string }): void
  (e: 'next'): void
}>()

const phase = ref<'preview' | 'play' | 'review'>('preview')
/** 预览阶段已点亮到第几个目标字（1-based；0 表示尚未点亮） */
const previewLit = ref(0)
const nextOrder = ref(0)
const hitIds = ref<number[]>([])
const wrongId = ref<number | null>(null)
const previewTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const stepTimer = ref<ReturnType<typeof setInterval> | null>(null)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.question.cols}, minmax(0, 1fr))`,
}))

const progressText = computed(() => {
  if (phase.value === 'preview') return '记住高亮顺序'
  if (phase.value === 'review') return props.feedback === 'correct' ? '全部点对' : '点错了'
  return `进度 ${nextOrder.value}/${props.question.chars.length}`
})

function clearPreviewTimers() {
  if (previewTimer.value) {
    clearTimeout(previewTimer.value)
    previewTimer.value = null
  }
  if (stepTimer.value) {
    clearInterval(stepTimer.value)
    stepTimer.value = null
  }
}

function startPreview() {
  clearPreviewTimers()
  phase.value = 'preview'
  previewLit.value = 0
  nextOrder.value = 0
  hitIds.value = []
  wrongId.value = null

  const total = Math.max(1, props.question.chars.length)
  const step = Math.max(80, Math.floor(props.previewMs / (total + 0.35)))

  // 在格子上按序高亮目标字；到点后全部熄灭再开始作答
  stepTimer.value = setInterval(() => {
    if (previewLit.value < total) {
      previewLit.value += 1
    }
  }, step)

  previewTimer.value = setTimeout(() => {
    clearPreviewTimers()
    previewLit.value = 0
    phase.value = 'play'
    emit('preview-done')
  }, props.previewMs)
}

function resetForQuestion() {
  clearPreviewTimers()
  startPreview()
}

watch(
  () => props.question.id,
  () => resetForQuestion(),
  { immediate: true },
)

watch(
  () => props.reviewing,
  (on) => {
    if (on) {
      phase.value = 'review'
      previewLit.value = 0
      clearPreviewTimers()
    }
  },
)

onBeforeUnmount(() => clearPreviewTimers())

function onCellClick(cellId: number) {
  if (phase.value !== 'play' || !props.acceptingInput || props.reviewing) return
  const cell = props.question.cells.find((c) => c.id === cellId)
  if (!cell) return
  if (hitIds.value.includes(cellId)) return

  if (cell.orderIndex === nextOrder.value) {
    hitIds.value = [...hitIds.value, cellId]
    nextOrder.value += 1
    if (nextOrder.value >= props.question.chars.length) {
      phase.value = 'review'
      emit('complete', { ok: true, clicked: props.question.word })
    }
    return
  }

  wrongId.value = cellId
  phase.value = 'review'
  const clicked = hitIds.value
    .map((id) => props.question.cells.find((c) => c.id === id)?.char ?? '')
    .join('')
  emit('complete', {
    ok: false,
    clicked: clicked ? `${clicked} → ${cell.char}（错）` : `${cell.char}（错）`,
  })
}

function cellClass(cellId: number) {
  const cell = props.question.cells.find((c) => c.id === cellId)
  const hit = hitIds.value.includes(cellId)
  const isWrong = wrongId.value === cellId
  const revealTarget =
    props.reviewing && cell?.orderIndex != null && !hit && props.feedback === 'wrong'
  const order = cell?.orderIndex
  const isPreviewLit =
    phase.value === 'preview' && order != null && order < previewLit.value
  const isPreviewCurrent =
    phase.value === 'preview' && order != null && order === previewLit.value - 1
  return {
    'schulte-cell--hit': hit,
    'schulte-cell--wrong': isWrong,
    'schulte-cell--reveal': revealTarget,
    'schulte-cell--preview': isPreviewLit,
    'schulte-cell--preview-current': isPreviewCurrent,
    'schulte-cell--disabled': phase.value !== 'play' || !props.acceptingInput,
  }
}

function previewOrderLabel(cellId: number): string {
  if (phase.value !== 'preview') return ''
  const cell = props.question.cells.find((c) => c.id === cellId)
  if (cell?.orderIndex == null || cell.orderIndex >= previewLit.value) return ''
  return String(cell.orderIndex + 1)
}
</script>

<template>
  <div class="schulte-panel" :class="`schulte-panel--${phase}`">
    <div class="schulte-status" aria-live="polite">
      <p class="schulte-status__kind">
        {{ question.kind === 'idiom' ? '成语' : '词语' }} · {{ progressText }}
      </p>
      <p v-if="phase === 'preview'" class="schulte-status__hint">格子上按序高亮，记住后再点选</p>
      <p v-else-if="phase === 'play'" class="schulte-status__hint">按刚才高亮顺序点击</p>
      <p v-else class="schulte-status__word">{{ question.word }}</p>
    </div>

    <div class="schulte-grid" :style="gridStyle" role="grid">
      <button
        v-for="cell in question.cells"
        :key="`${question.id}-${cell.id}`"
        type="button"
        class="schulte-cell"
        :class="cellClass(cell.id)"
        :disabled="phase !== 'play' || !acceptingInput || hitIds.includes(cell.id)"
        @click="onCellClick(cell.id)"
      >
        <span
          v-if="previewOrderLabel(cell.id)"
          class="schulte-cell__ord"
        >{{ previewOrderLabel(cell.id) }}</span>
        <span class="schulte-cell__ch">{{ cell.char }}</span>
      </button>
    </div>

    <div v-if="reviewing" class="schulte-review">
      <p class="schulte-review__title">
        {{ feedback === 'correct' ? '答对了' : '答错了' }} · 正确答案
      </p>
      <p class="schulte-review__word">{{ question.word }}</p>
      <p class="schulte-review__meaning">{{ question.meaning }}</p>
      <p v-if="reviewDetail" class="schulte-review__detail">{{ reviewDetail }}</p>
      <button type="button" class="schulte-next" @click="emit('next')">下一题</button>
    </div>
  </div>
</template>

<style scoped>
.schulte-panel {
  width: min(100%, 520px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.schulte-status {
  text-align: center;
  min-height: 2.8rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.schulte-status__kind {
  margin: 0;
  font-size: 0.92rem;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.04em;
}

.schulte-status__hint {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 650;
  color: var(--el-text-color-regular);
}

.schulte-status__word {
  margin: 0;
  font-size: clamp(1.55rem, 5vw, 2rem);
  font-weight: 750;
  letter-spacing: 0.1em;
  color: var(--el-color-primary);
}

.schulte-grid {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(160deg, #f4f6f8 0%, #e8ecf1 55%, #dde3ea 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 10px 28px rgba(30, 40, 55, 0.12);
}

.schulte-cell {
  position: relative;
  aspect-ratio: 1;
  border: none;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f3f5f7 55%, #e6eaee 100%);
  box-shadow:
    0 2px 0 #c5ccd4,
    0 6px 12px rgba(40, 50, 65, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  cursor: pointer;
  color: #1f2a37;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease,
    color 0.12s ease;
  padding: 0;
  display: grid;
  place-items: center;
  -webkit-tap-highlight-color: transparent;
}

.schulte-cell:not(:disabled):active {
  transform: translateY(2px);
  box-shadow:
    0 1px 0 #c5ccd4,
    0 2px 6px rgba(40, 50, 65, 0.12);
}

.schulte-cell__ch {
  font-size: clamp(1.05rem, 3.8vw, 1.45rem);
  font-weight: 750;
  line-height: 1;
}

.schulte-cell__ord {
  position: absolute;
  top: 4px;
  right: 6px;
  min-width: 1.05em;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.schulte-cell--preview {
  background: radial-gradient(circle at 35% 30%, #dceeff 0%, #9ec5f5 72%);
  color: #1d4ed8;
  box-shadow:
    0 1px 0 #7aa8e0,
    inset 0 0 0 2px rgba(37, 99, 235, 0.45);
}

.schulte-cell--preview-current {
  transform: scale(1.06);
  background: radial-gradient(circle at 35% 30%, #bfdbfe 0%, #60a5fa 70%);
  color: #1e3a8a;
  box-shadow:
    0 2px 0 #3b82f6,
    0 0 0 3px rgba(59, 130, 246, 0.28),
    inset 0 0 0 2px rgba(29, 78, 216, 0.35);
  animation: schulte-pulse 0.28s ease-out;
}

.schulte-cell--hit {
  background: radial-gradient(circle at 35% 30%, #e8f8ef 0%, #cfeedd 70%);
  color: var(--el-color-success);
  box-shadow:
    0 1px 0 #9fd4b3,
    inset 0 0 0 2px rgba(103, 194, 58, 0.35);
}

.schulte-cell--wrong {
  background: radial-gradient(circle at 35% 30%, #ffecec 0%, #f8d0d0 70%);
  color: var(--el-color-danger);
  box-shadow:
    0 1px 0 #e0a0a0,
    inset 0 0 0 2px rgba(245, 108, 108, 0.45);
}

.schulte-cell--reveal {
  box-shadow:
    0 1px 0 #c5ccd4,
    inset 0 0 0 2px rgba(64, 158, 255, 0.55);
  color: var(--el-color-primary);
}

.schulte-cell--disabled:not(.schulte-cell--hit):not(.schulte-cell--wrong):not(
    .schulte-cell--preview
  ) {
  cursor: default;
}

.schulte-review {
  text-align: center;
  padding: 12px 10px 4px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schulte-review__title {
  margin: 0;
  font-size: 0.95rem;
  color: var(--el-text-color-secondary);
}

.schulte-review__word {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 780;
  letter-spacing: 0.1em;
}

.schulte-review__meaning,
.schulte-review__detail {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.55;
  color: var(--el-text-color-regular);
}

.schulte-next {
  align-self: center;
  margin-top: 6px;
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.6rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: var(--el-color-primary);
  cursor: pointer;
}

.schulte-next:active {
  transform: translateY(1px);
}

@keyframes schulte-pulse {
  from {
    transform: scale(0.92);
  }
  to {
    transform: scale(1.06);
  }
}

@media (max-width: 520px) {
  .schulte-grid {
    gap: 8px;
    padding: 10px;
  }
}
</style>
