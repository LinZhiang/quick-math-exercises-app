<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTouchPrimaryDevice } from '@/composables/useTouchPointerDrag'
import { getUsedSlotsFromExpression } from '@/utils/twentyFourPointPractice'

type OpValue = '+' | '−' | '×' | '÷'
type ParenValue = '(' | ')'

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

const { isCompactLayout } = useTouchPrimaryDevice()

const textDraft = ref('')

const usedSlots = computed(() => getUsedSlotsFromExpression(textDraft.value, props.nums))

const canSubmit = computed(() => textDraft.value.trim().length > 0 && props.acceptingInput)

function resetDraft() {
  textDraft.value = ''
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

function appendToText(fragment: string) {
  if (!props.acceptingInput || !fragment) return
  textDraft.value += fragment
}

function appendNum(index: number) {
  if (!props.acceptingInput || usedSlots.value[index]) return
  appendToText(String(props.nums[index]))
}

function appendOp(op: OpValue) {
  appendToText(op)
}

function appendParen(p: ParenValue) {
  appendToText(p)
}

function backspace() {
  if (!props.acceptingInput || !textDraft.value) return
  textDraft.value = textDraft.value.slice(0, -1)
}

function clearDraft() {
  if (!props.acceptingInput) return
  resetDraft()
}

function submitDraft() {
  if (!canSubmit.value) return
  emit('submit', textDraft.value.trim())
}

function onTextInput(e: Event) {
  if (!props.acceptingInput) return
  textDraft.value = (e.target as HTMLInputElement).value
}

function onTextKeydown(e: KeyboardEvent) {
  if (!props.acceptingInput) return
  if (e.key === 'Enter') {
    e.preventDefault()
    submitDraft()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!props.acceptingInput) return
  if ((e.target as HTMLElement).closest('.tf-expr-input')) return
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
  <div
    class="tf-panel"
    :class="{ 'tf-panel--touch': isCompactLayout }"
    @keydown="onKeydown"
  >
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
      <p class="tf-zone__title">
        你的算式
        <span class="tf-zone__sub">像平时写算式一样输入，或点下方数字/符号追加</span>
      </p>

      <div class="tf-expr-input-wrap">
        <input
          class="tf-expr-input"
          type="text"
          inputmode="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          :disabled="!acceptingInput"
          :value="textDraft"
          placeholder="例如 (5-2)×4"
          aria-label="算式输入"
          @input="onTextInput"
          @keydown="onTextKeydown"
        />
      </div>
    </section>

    <section class="tf-zone" aria-label="数字">
      <p class="tf-zone__title">
        题目数字
        <span class="tf-zone__sub">点击追加到算式末尾；变灰表示已用过</span>
      </p>
      <div class="tf-palette">
        <button
          v-for="(n, idx) in nums"
          :key="`n-${idx}`"
          type="button"
          class="tf-chip tf-chip--num"
          :class="{ 'tf-chip--used': usedSlots[idx] }"
          :disabled="!acceptingInput || usedSlots[idx]"
          @click="appendNum(idx)"
        >
          {{ n }}
        </button>
      </div>
    </section>

    <section class="tf-zone" aria-label="符号">
      <p class="tf-zone__title">运算符</p>
      <div class="tf-palette tf-palette--ops">
        <button
          v-for="op in OP_SYMBOLS"
          :key="op"
          type="button"
          class="tf-chip tf-chip--sym"
          :disabled="!acceptingInput"
          @click="appendOp(op)"
        >
          {{ op }}
        </button>
        <button
          v-for="p in PAREN_SYMBOLS"
          :key="p"
          type="button"
          class="tf-chip tf-chip--sym"
          :disabled="!acceptingInput"
          @click="appendParen(p)"
        >
          {{ p }}
        </button>
      </div>
    </section>

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
      直接输入算式（支持 + − × ÷ 与括号，也可用键盘 * / -）；点数字会追加对应数值；已用过的数字会变灰
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
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft, #e0e0e0);
  background: var(--app-surface-muted, rgba(0, 0, 0, 0.02));
}

.tf-expr-input-wrap {
  margin-bottom: 0;
}

.tf-expr-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--app-border-soft, #d8d8d8);
  border-radius: 6px;
  background: var(--app-surface, #fff);
  font-size: 1.05rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--app-text-primary, #222);
  outline: none;
  transition: border-color 0.12s;
}

.tf-expr-input:focus {
  border-color: rgba(46, 125, 90, 0.55);
}

.tf-expr-input:disabled {
  opacity: 0.55;
  background: var(--app-surface-muted, #f5f5f5);
}

.tf-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tf-palette--ops {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  max-width: 360px;
}

.tf-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--app-border-soft, #ddd);
  background: var(--app-surface, #fff);
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: opacity 0.12s, border-color 0.12s, background 0.12s;
}

.tf-chip--num {
  border-color: rgba(46, 125, 90, 0.35);
  background: rgba(46, 125, 90, 0.05);
  min-width: 48px;
}

.tf-chip--num.tf-chip--used,
.tf-chip:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tf-chip--sym {
  min-width: 36px;
  font-size: 0.95rem;
}

.tf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tf-key {
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
  font-size: 0.82rem;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .tf-panel .tf-expr-input {
    font-size: 16px;
  }

  .tf-panel .tf-chip {
    min-width: 42px;
    min-height: 38px;
    font-size: 0.95rem;
  }

  .tf-panel .tf-key {
    min-height: 40px;
    font-size: 0.9rem;
  }
}
</style>
