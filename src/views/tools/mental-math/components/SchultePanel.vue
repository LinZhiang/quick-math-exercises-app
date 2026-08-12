<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { SchulteQuestion } from '@/utils/schultePractice'

/** 词语出示后，格子渐显再开局的时长 */
const GRID_REVEAL_MS = 720

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

const phase = ref<'word' | 'reveal' | 'play' | 'review'>('word')
const nextOrder = ref(0)
const hitIds = ref<number[]>([])
const wrongId = ref<number | null>(null)
const previewTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const revealTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.question.cols}, minmax(0, 1fr))`,
}))

const showGrid = computed(() => phase.value !== 'word')

const progressText = computed(() => {
  if (phase.value === 'word') return '记住这个词'
  if (phase.value === 'reveal') return '格子出现中…'
  if (phase.value === 'review') return props.feedback === 'correct' ? '全部点对' : '点错了'
  return `进度 ${nextOrder.value}/${props.question.chars.length}`
})

function clearPreviewTimers() {
  if (previewTimer.value) {
    clearTimeout(previewTimer.value)
    previewTimer.value = null
  }
  if (revealTimer.value) {
    clearTimeout(revealTimer.value)
    revealTimer.value = null
  }
}

function startPreview() {
  clearPreviewTimers()
  phase.value = 'word'
  nextOrder.value = 0
  hitIds.value = []
  wrongId.value = null

  // 先只显示词语，再渐显格子，最后开局计时
  previewTimer.value = setTimeout(() => {
    phase.value = 'reveal'
    revealTimer.value = setTimeout(() => {
      phase.value = 'play'
      emit('preview-done')
    }, GRID_REVEAL_MS)
  }, Math.max(800, props.previewMs))
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
  return {
    'schulte-cell--hit': hit,
    'schulte-cell--wrong': isWrong,
    'schulte-cell--reveal': revealTarget,
    'schulte-cell--disabled': phase.value !== 'play' || !props.acceptingInput,
  }
}
</script>

<template>
  <div class="schulte-panel" :class="`schulte-panel--${phase}`">
    <div class="schulte-status" aria-live="polite">
      <p class="schulte-status__kind">
        {{ question.kind === 'idiom' ? '成语' : '词语' }} · {{ progressText }}
      </p>
      <p v-if="phase === 'reveal'" class="schulte-status__hint">按刚才的词序点选</p>
      <p v-else-if="phase === 'play'" class="schulte-status__hint">按词语顺序点击格子</p>
      <p v-else-if="phase === 'review'" class="schulte-status__word">{{ question.word }}</p>
    </div>

    <div
      v-show="showGrid"
      class="schulte-grid"
      :class="{ 'schulte-grid--entering': phase === 'reveal' }"
      :style="gridStyle"
      role="grid"
    >
      <button
        v-for="cell in question.cells"
        :key="`${question.id}-${cell.id}`"
        type="button"
        class="schulte-cell"
        :class="cellClass(cell.id)"
        :disabled="phase !== 'play' || !acceptingInput || hitIds.includes(cell.id)"
        @click="onCellClick(cell.id)"
      >
        <span class="schulte-cell__ch">{{ cell.char }}</span>
      </button>
    </div>

    <div v-if="phase === 'word'" class="schulte-word-stage" aria-hidden="true">
      <p class="schulte-word-stage__label">请记住</p>
      <p class="schulte-word-stage__word">{{ question.word }}</p>
      <p class="schulte-word-stage__hint">随后将出现舒尔特方格</p>
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
  width: min(100%, 420px);
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

.schulte-word-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 220px;
  padding: 28px 16px;
  border-radius: 22px;
  background: linear-gradient(160deg, #f4f6f8 0%, #e8ecf1 55%, #dde3ea 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 10px 28px rgba(30, 40, 55, 0.12);
  animation: schulte-word-in 0.35s ease-out;
}

.schulte-word-stage__label {
  margin: 0;
  font-size: 0.95rem;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.08em;
}

.schulte-word-stage__word {
  margin: 0;
  font-size: clamp(2rem, 8vw, 2.75rem);
  font-weight: 800;
  letter-spacing: 0.18em;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.schulte-word-stage__hint {
  margin: 0;
  font-size: 0.92rem;
  color: var(--el-text-color-secondary);
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
  opacity: 1;
  transform: translateY(0);
}

.schulte-grid--entering {
  animation: schulte-grid-in 0.72s ease-out both;
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

.schulte-cell--disabled:not(.schulte-cell--hit):not(.schulte-cell--wrong) {
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

@keyframes schulte-word-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes schulte-grid-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 520px) {
  .schulte-panel {
    width: min(100%, 360px);
  }

  .schulte-grid {
    gap: 8px;
    padding: 10px;
  }
}
</style>
