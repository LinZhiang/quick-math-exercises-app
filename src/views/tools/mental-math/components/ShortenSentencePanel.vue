<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ShortenSentenceQuestion } from '@/utils/shortenSentencePractice'

type Segment = {
  text: string
  start: number
  end: number
}

const props = defineProps<{
  question: ShortenSentenceQuestion
  feedback: 'correct' | 'wrong' | null
  acceptingInput: boolean
  reviewing: boolean
  reviewDetail: string
  questionIndex: number
  questionCount: number
  isLast: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', answer: string): void
  (e: 'next'): void
}>()

const segments = ref<Segment[]>([])
const draft = ref('')
const submittedAnswer = ref('')
const pendingStart = ref<number | null>(null)
const pendingEnd = ref<number | null>(null)
const dragging = ref(false)
const charsEl = ref<HTMLElement | null>(null)

const chars = computed(() => Array.from(props.question.item.sentence))

const canSubmit = computed(() => draft.value.trim().length > 0 && props.acceptingInput)

const pendingRange = computed(() => {
  if (pendingStart.value == null || pendingEnd.value == null) return null
  const a = Math.min(pendingStart.value, pendingEnd.value)
  const b = Math.max(pendingStart.value, pendingEnd.value)
  return { start: a, end: b + 1 }
})

const pendingText = computed(() => {
  if (!pendingRange.value) return ''
  return chars.value.slice(pendingRange.value.start, pendingRange.value.end).join('')
})

function resetState() {
  segments.value = []
  draft.value = ''
  submittedAnswer.value = ''
  pendingStart.value = null
  pendingEnd.value = null
  dragging.value = false
}

watch(
  () => props.question.id,
  () => resetState(),
  { immediate: true },
)

watch(
  () => props.acceptingInput,
  (ok) => {
    if (ok) resetState()
  },
)

watch(
  () => props.reviewing,
  (on) => {
    if (on) {
      pendingStart.value = null
      pendingEnd.value = null
      dragging.value = false
    }
  },
)

function isInPending(i: number): boolean {
  if (!pendingRange.value) return false
  return i >= pendingRange.value.start && i < pendingRange.value.end
}

function isInSegment(i: number): boolean {
  return segments.value.some((s) => i >= s.start && i < s.end)
}

function indexFromPoint(clientX: number, clientY: number): number | null {
  const hit = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  const node = hit?.closest?.('[data-ss-i]') as HTMLElement | null
  if (!node) return null
  const n = Number(node.dataset.ssI)
  return Number.isFinite(n) ? n : null
}

function onPointerDown(i: number, e: PointerEvent) {
  if (!props.acceptingInput || props.reviewing) return
  e.preventDefault()
  charsEl.value?.setPointerCapture?.(e.pointerId)
  dragging.value = true
  pendingStart.value = i
  pendingEnd.value = i
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !props.acceptingInput) return
  const i = indexFromPoint(e.clientX, e.clientY)
  if (i != null) pendingEnd.value = i
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  const text = pendingText.value
  if (!text.trim() || text === '。' || text === '，' || !/[\u4e00-\u9fffA-Za-z0-9]/.test(text)) {
    pendingStart.value = null
    pendingEnd.value = null
    return
  }
  if (!pendingRange.value) return

  // 重叠区间：去掉旧片段再加入
  const { start, end } = pendingRange.value
  segments.value = segments.value.filter((s) => s.end <= start || s.start >= end)
  segments.value.push({ text, start, end })
  // 按句中位置从左到右拼接
  segments.value.sort((a, b) => a.start - b.start)

  draft.value = segments.value.map((s) => s.text).join('')
  pendingStart.value = null
  pendingEnd.value = null
}

function onPointerCancel() {
  dragging.value = false
}

function removeSegment(idx: number) {
  if (!props.acceptingInput) return
  segments.value.splice(idx, 1)
  draft.value = segments.value.map((s) => s.text).join('')
}

function clearAll() {
  if (!props.acceptingInput) return
  segments.value = []
  draft.value = ''
}

function onDraftInput(e: Event) {
  if (!props.acceptingInput) return
  draft.value = (e.target as HTMLTextAreaElement).value
}

function submit() {
  if (!canSubmit.value) return
  const answer = draft.value.trim()
  submittedAnswer.value = answer
  emit('submit', answer)
}

function goNext() {
  if (!props.reviewing) return
  emit('next')
}
</script>

<template>
  <div class="ss-panel">
    <div
      class="question-block ss-question"
      :class="{
        'question-block--ok': feedback === 'correct',
        'question-block--bad': feedback === 'wrong',
      }"
    >
      <p class="question-prompt">
        第 {{ questionIndex }} / {{ questionCount }} 题 · {{ question.prompt }}
      </p>
      <p v-if="feedback === 'correct'" class="feedback feedback--ok">答对了！计时已暂停</p>
      <p v-else-if="feedback === 'wrong'" class="feedback feedback--bad">答错了 · 计时已暂停</p>
    </div>

    <section class="ss-zone" aria-label="圈选原句">
      <p class="ss-zone__title">
        {{ reviewing ? '本题原句' : '滑动圈选主干' }}
        <span v-if="!reviewing" class="ss-zone__sub">按住拖动选词，松开即拼入缩句</span>
      </p>
      <div
        ref="charsEl"
        class="ss-chars"
        :class="{ 'ss-chars--locked': reviewing }"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <span
          v-for="(ch, i) in chars"
          :key="i"
          class="ss-char"
          :data-ss-i="i"
          :class="{
            'ss-char--pending': isInPending(i),
            'ss-char--picked': isInSegment(i),
          }"
          @pointerdown="onPointerDown(i, $event)"
        >{{ ch }}</span>
      </div>
      <p class="ss-source">来源：{{ question.item.source }}</p>
    </section>

    <section v-if="!reviewing" class="ss-zone" aria-label="已圈选">
      <p class="ss-zone__title">
        已圈选片段
        <button type="button" class="ss-link-btn" :disabled="!acceptingInput || !segments.length" @click="clearAll">
          清空
        </button>
      </p>
      <ul v-if="segments.length" class="ss-seg-list">
        <li v-for="(seg, idx) in segments" :key="`${seg.start}-${seg.end}-${idx}`" class="ss-seg-item">
          <span class="ss-seg-idx">{{ idx + 1 }}</span>
          <span class="ss-seg-text">{{ seg.text }}</span>
          <button type="button" class="ss-link-btn" :disabled="!acceptingInput" @click="removeSegment(idx)">
            删除
          </button>
        </li>
      </ul>
      <p v-else class="ss-empty">尚未圈选，请滑动选词；也可在下方直接输入</p>
    </section>

    <section v-if="!reviewing" class="ss-zone" aria-label="缩句结果">
      <p class="ss-zone__title">
        缩句结果
        <span class="ss-zone__sub">圈选自动拼接，也可手动改</span>
      </p>
      <textarea
        class="ss-input"
        rows="2"
        maxlength="200"
        :value="draft"
        placeholder="圈选后会显示在这里…"
        :disabled="!acceptingInput"
        @input="onDraftInput"
        @keydown.ctrl.enter.prevent="submit"
      />
      <p class="ss-tip">提示：多段按句中从左到右拼接；Ctrl + Enter 提交</p>
    </section>

    <section v-else class="ss-zone ss-zone--review" aria-label="答案对照">
      <p class="ss-zone__title">你的作答</p>
      <p class="ss-answer-box">{{ submittedAnswer || draft.trim() || '（空）' }}</p>
      <p class="ss-zone__title ss-zone__title--answer">推荐主干（标准答案）</p>
      <p class="ss-answer-box ss-answer-box--ok">{{ question.item.shortened }}</p>
      <template v-if="question.item.alternates?.length">
        <p class="ss-zone__title ss-zone__title--alts">也可接受（以下写法同判正确）</p>
        <ul class="ss-alts">
          <li v-for="(a, i) in question.item.alternates" :key="i">{{ a }}</li>
        </ul>
      </template>
      <p v-if="reviewDetail" class="ss-review-detail">{{ reviewDetail }}</p>
    </section>

    <div class="ss-actions">
      <button v-if="!reviewing" type="button" class="ss-submit" :disabled="!canSubmit" @click="submit">
        确认提交
      </button>
      <button v-else type="button" class="ss-submit ss-submit--next" @click="goNext">
        {{ isLast ? '查看结果' : '下一题' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.ss-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
}

.ss-question .question-prompt {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #1e293b;
}

.ss-zone {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.ss-zone__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.ss-zone__title--answer {
  margin-top: 8px;
}

.ss-zone__sub {
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
}

.ss-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 12px 10px;
  border-radius: 12px;
  background: linear-gradient(160deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fdba74;
  user-select: none;
  touch-action: none;
  line-height: 1.2;
}

.ss-chars--locked {
  pointer-events: none;
  opacity: 0.95;
}

.ss-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.55em;
  min-height: 1.9em;
  padding: 0 1px;
  border-radius: 6px;
  font-size: 1.12rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: background 0.12s ease, box-shadow 0.12s ease;
}

.ss-char--pending {
  background: #fde68a !important;
  box-shadow: inset 0 0 0 1px #f59e0b;
}

.ss-char--picked {
  background: #fdba74;
  color: #9a3412;
}

.ss-source {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
}

.ss-seg-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ss-seg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.ss-seg-idx {
  flex-shrink: 0;
  width: 1.4em;
  height: 1.4em;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: #ffedd5;
  color: #c2410c;
}

.ss-seg-text {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: #0f172a;
}

.ss-link-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 2px 4px;
}

.ss-link-btn:hover {
  color: #dc2626;
}

.ss-link-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ss-empty {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.ss-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
}

.ss-input:disabled {
  background: #f1f5f9;
}

.ss-tip {
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
}

.ss-zone--review {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.ss-answer-box {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  line-height: 1.55;
  color: #0f172a;
}

.ss-answer-box--ok {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.ss-zone__title--alts {
  margin-top: 8px;
  font-weight: 600;
  color: #334155;
}

.ss-alts {
  margin: 0;
  padding-left: 1.1em;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
}

.ss-review-detail {
  margin: 6px 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #475569;
}

.ss-actions {
  display: flex;
}

.ss-submit {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #c2410c, #ea580c);
}

.ss-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ss-submit--next {
  background: linear-gradient(135deg, #0f766e, #0d9488);
}

@media (max-width: 560px) {
  .ss-char {
    min-width: 1.7em;
    min-height: 2.1em;
    font-size: 1.18rem;
  }
}
</style>
