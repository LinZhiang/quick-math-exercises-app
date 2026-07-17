<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ALL_GRAMMAR_ROLES,
  GRAMMAR_ROLE_LABELS,
  type CircleGrammarMark,
  type CircleGrammarQuestion,
} from '@/utils/circleGrammarPractice'
import type { GrammarRole } from '@/utils/grammarJudgmentBank'

const props = defineProps<{
  question: CircleGrammarQuestion
  feedback: 'correct' | 'wrong' | null
  acceptingInput: boolean
  reviewing: boolean
  reviewDetail: string
  questionIndex: number
  questionCount: number
  isLast: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', marks: CircleGrammarMark[]): void
  (e: 'next'): void
}>()

const marks = ref<CircleGrammarMark[]>([])
const pendingStart = ref<number | null>(null)
const pendingEnd = ref<number | null>(null)
const dragging = ref(false)
const manualText = ref('')
const manualRole = ref<GrammarRole>('subject')
const rolePickerOpen = ref(false)
const manualError = ref('')

const chars = computed(() => Array.from(props.question.sentence.sentence))

const canSubmit = computed(() => marks.value.length > 0 && props.acceptingInput)

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
  marks.value = []
  pendingStart.value = null
  pendingEnd.value = null
  dragging.value = false
  manualText.value = ''
  manualRole.value = 'subject'
  rolePickerOpen.value = false
  manualError.value = ''
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
      rolePickerOpen.value = false
    }
  },
)

function charCoveredBy(i: number): CircleGrammarMark | null {
  for (const m of marks.value) {
    if (m.start != null && m.end != null && i >= m.start && i < m.end) return m
  }
  return null
}

function isInPending(i: number): boolean {
  if (!pendingRange.value) return false
  return i >= pendingRange.value.start && i < pendingRange.value.end
}

function roleClass(role: GrammarRole): string {
  return `cg-role--${role}`
}

const charsEl = ref<HTMLElement | null>(null)

function indexFromPoint(clientX: number, clientY: number): number | null {
  const hit = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  const node = hit?.closest?.('[data-cg-i]') as HTMLElement | null
  if (!node) return null
  const n = Number(node.dataset.cgI)
  return Number.isFinite(n) ? n : null
}

function onPointerDown(i: number, e: PointerEvent) {
  if (!props.acceptingInput) return
  e.preventDefault()
  charsEl.value?.setPointerCapture?.(e.pointerId)
  dragging.value = true
  pendingStart.value = i
  pendingEnd.value = i
  rolePickerOpen.value = false
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !props.acceptingInput) return
  const i = indexFromPoint(e.clientX, e.clientY)
  if (i != null) pendingEnd.value = i
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  if (!pendingText.value.trim() || pendingText.value === '。' || pendingText.value === '，') {
    pendingStart.value = null
    pendingEnd.value = null
    return
  }
  rolePickerOpen.value = true
}

function onPointerCancel() {
  dragging.value = false
}

function confirmPendingRole(role: GrammarRole) {
  if (!pendingRange.value || !pendingText.value) return
  const text = pendingText.value
  // 去掉纯标点选区
  if (!/[\u4e00-\u9fffA-Za-z0-9]/.test(text)) {
    cancelPending()
    return
  }
  // 同区间覆盖更新
  marks.value = marks.value.filter(
    (m) =>
      !(
        m.start != null &&
        m.end != null &&
        m.start === pendingRange.value!.start &&
        m.end === pendingRange.value!.end
      ),
  )
  marks.value.push({
    text,
    role,
    start: pendingRange.value.start,
    end: pendingRange.value.end,
  })
  cancelPending()
}

function cancelPending() {
  pendingStart.value = null
  pendingEnd.value = null
  rolePickerOpen.value = false
}

function removeMark(idx: number) {
  if (!props.acceptingInput) return
  marks.value.splice(idx, 1)
}

function addManualMark() {
  if (!props.acceptingInput) return
  const text = manualText.value.replace(/\s+/g, '').trim()
  if (!text) return
  const sentence = props.question.sentence.sentence
  if (!sentence.includes(text)) {
    manualError.value = '句中找不到这段文字，请按原句输入'
    return
  }
  manualError.value = ''
  const start = sentence.indexOf(text)
  marks.value.push({
    text,
    role: manualRole.value,
    start,
    end: start + text.length,
  })
  manualText.value = ''
}

function clearMarks() {
  if (!props.acceptingInput) return
  marks.value = []
  cancelPending()
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', [...marks.value])
}

function goNext() {
  if (!props.reviewing) return
  emit('next')
}
</script>

<template>
  <div class="cg-panel">
    <div
      class="question-block cg-question"
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

    <section class="cg-zone" aria-label="圈选区">
      <p class="cg-zone__title">
        {{ reviewing ? '本题句子' : '滑动圈选词语' }}
        <span v-if="!reviewing" class="cg-zone__sub">按住拖动选中文字，再点成分确认</span>
      </p>
      <div
        ref="charsEl"
        class="cg-chars"
        :class="{ 'cg-chars--locked': reviewing }"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <span
          v-for="(ch, i) in chars"
          :key="i"
          class="cg-char"
          :data-cg-i="i"
          :class="[
            charCoveredBy(i) ? roleClass(charCoveredBy(i)!.role) : '',
            { 'cg-char--pending': isInPending(i) },
          ]"
          @pointerdown="onPointerDown(i, $event)"
        >{{ ch }}</span>
      </div>

      <div v-if="rolePickerOpen && pendingText" class="cg-role-picker">
        <p class="cg-role-picker__label">
          将「<strong>{{ pendingText }}</strong>」标为：
        </p>
        <div class="cg-role-chips">
          <button
            v-for="role in ALL_GRAMMAR_ROLES"
            :key="role"
            type="button"
            class="cg-chip"
            :class="roleClass(role)"
            :disabled="!acceptingInput"
            @click="confirmPendingRole(role)"
          >
            {{ GRAMMAR_ROLE_LABELS[role] }}
          </button>
          <button type="button" class="cg-chip cg-chip--cancel" :disabled="!acceptingInput" @click="cancelPending">
            取消
          </button>
        </div>
      </div>
    </section>

    <section v-if="!reviewing" class="cg-zone" aria-label="已圈选">
      <p class="cg-zone__title">
        已圈选
        <button type="button" class="cg-link-btn" :disabled="!acceptingInput || !marks.length" @click="clearMarks">
          清空
        </button>
      </p>
      <ul v-if="marks.length" class="cg-mark-list">
        <li v-for="(m, idx) in marks" :key="`${m.role}-${m.text}-${idx}`" class="cg-mark-item">
          <span class="cg-mark-badge" :class="roleClass(m.role)">{{ GRAMMAR_ROLE_LABELS[m.role] }}</span>
          <span class="cg-mark-text">{{ m.text }}</span>
          <button type="button" class="cg-mark-remove" :disabled="!acceptingInput" @click="removeMark(idx)">
            删除
          </button>
        </li>
      </ul>
      <p v-else class="cg-empty">尚未圈选，请滑动选词或下方手动输入</p>
    </section>

    <section v-if="!reviewing" class="cg-zone" aria-label="手动输入">
      <p class="cg-zone__title">
        手动输入
        <span class="cg-zone__sub">输入句中原词，选择成分后添加</span>
      </p>
      <div class="cg-manual">
        <input
          v-model="manualText"
          class="cg-manual__input"
          type="text"
          inputmode="text"
          autocomplete="off"
          placeholder="例如：聪明的"
          :disabled="!acceptingInput"
          @keydown.enter.prevent="addManualMark"
        />
        <select v-model="manualRole" class="cg-manual__select" :disabled="!acceptingInput">
          <option v-for="role in ALL_GRAMMAR_ROLES" :key="role" :value="role">
            {{ GRAMMAR_ROLE_LABELS[role] }}
          </option>
        </select>
        <button type="button" class="cg-manual__add" :disabled="!acceptingInput || !manualText.trim()" @click="addManualMark">
          添加
        </button>
      </div>
      <p v-if="manualError" class="cg-manual__error">{{ manualError }}</p>
    </section>

    <section v-if="reviewing" class="cg-zone cg-zone--review" aria-label="正确答案">
      <p class="cg-zone__title">你的圈选</p>
      <ul v-if="marks.length" class="cg-mark-list">
        <li v-for="(m, idx) in marks" :key="`y-${m.role}-${m.text}-${idx}`" class="cg-mark-item">
          <span class="cg-mark-badge" :class="roleClass(m.role)">{{ GRAMMAR_ROLE_LABELS[m.role] }}</span>
          <span class="cg-mark-text">{{ m.text }}</span>
        </li>
      </ul>
      <p v-else class="cg-empty">（未圈选）</p>

      <p class="cg-zone__title cg-zone__title--answer">正确答案</p>
      <ul class="cg-mark-list">
        <li
          v-for="(p, idx) in question.expected"
          :key="`a-${p.role}-${p.text}-${idx}`"
          class="cg-mark-item cg-mark-item--answer"
        >
          <span class="cg-mark-badge" :class="roleClass(p.role)">{{ GRAMMAR_ROLE_LABELS[p.role] }}</span>
          <span class="cg-mark-text">{{ p.text }}</span>
        </li>
      </ul>
      <p v-if="reviewDetail" class="cg-review-detail">{{ reviewDetail }}</p>
    </section>

    <div class="cg-actions">
      <button v-if="!reviewing" type="button" class="cg-submit" :disabled="!canSubmit" @click="submit">
        确认提交
      </button>
      <button v-else type="button" class="cg-submit cg-submit--next" @click="goNext">
        {{ isLast ? '查看结果' : '下一题' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cg-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
}

.cg-question .question-prompt {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #1e293b;
}

.cg-zone {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cg-zone__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.cg-zone__title--answer {
  margin-top: 12px;
}

.cg-zone--review {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.cg-mark-item--answer {
  border-color: #86efac;
  background: #f0fdf4;
}

.cg-review-detail {
  margin: 10px 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #475569;
}

.cg-zone__sub {
  font-size: 0.78rem;
  font-weight: 500;
  color: #64748b;
}

.cg-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 12px 10px;
  border-radius: 12px;
  background: linear-gradient(160deg, #f8fafc 0%, #eef6ff 100%);
  border: 1px solid #cbd5e1;
  user-select: none;
  touch-action: none;
  line-height: 1.2;
}

.cg-chars--locked {
  pointer-events: none;
  opacity: 0.95;
}

.cg-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.55em;
  min-height: 1.9em;
  padding: 0 1px;
  border-radius: 6px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, box-shadow 0.12s ease;
}

.cg-char--pending {
  background: #fde68a !important;
  box-shadow: inset 0 0 0 1px #f59e0b;
}

.cg-role--subject {
  background: #dbeafe;
  color: #1d4ed8;
}
.cg-role--predicate {
  background: #dcfce7;
  color: #15803d;
}
.cg-role--object {
  background: #ffedd5;
  color: #c2410c;
}
.cg-role--attributive {
  background: #f3e8ff;
  color: #7e22ce;
}
.cg-role--adverbial {
  background: #cffafe;
  color: #0e7490;
}
.cg-role--complement {
  background: #fce7f3;
  color: #be185d;
}

.cg-role-picker {
  padding: 10px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
}

.cg-role-picker__label {
  margin: 0 0 8px;
  font-size: 0.88rem;
  color: #78350f;
}

.cg-role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cg-chip {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.cg-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cg-chip--cancel {
  background: #e2e8f0;
  color: #475569;
}

.cg-mark-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cg-mark-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.cg-mark-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.cg-mark-text {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: #0f172a;
}

.cg-mark-remove,
.cg-link-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 2px 4px;
}

.cg-mark-remove:hover,
.cg-link-btn:hover {
  color: #dc2626;
}

.cg-mark-remove:disabled,
.cg-link-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cg-empty {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.cg-manual {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
}

.cg-manual__input,
.cg-manual__select {
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.92rem;
  background: #fff;
}

.cg-manual__add,
.cg-submit {
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
}

.cg-manual__add:disabled,
.cg-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cg-manual__error {
  margin: 0;
  font-size: 0.8rem;
  color: #dc2626;
}

.cg-actions {
  display: flex;
  justify-content: stretch;
}

.cg-submit {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
}

.cg-submit--next {
  background: linear-gradient(135deg, #0f766e, #0d9488);
}

@media (max-width: 560px) {
  .cg-char {
    min-width: 1.7em;
    min-height: 2.1em;
    font-size: 1.2rem;
  }

  .cg-manual {
    grid-template-columns: 1fr;
  }
}
</style>
