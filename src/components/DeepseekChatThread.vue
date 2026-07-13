<script setup lang="ts">
import type { DeepSeekDisplayTurn } from '@/composables/useDeepseekConversation'

defineProps<{
  turns: DeepSeekDisplayTurn[]
  firstAssistantTitle?: string
}>()
</script>

<template>
  <div v-if="turns.length" class="deepseek-thread" aria-label="DeepSeek 对话">
    <article
      v-for="(turn, index) in turns"
      :key="index"
      class="deepseek-thread-item"
      :class="turn.role === 'user' ? 'deepseek-thread-item--user' : 'deepseek-thread-item--assistant'"
    >
      <h4 class="deepseek-thread-label">
        {{
          turn.label ??
          (turn.role === 'assistant' && index === turns.findIndex((t) => t.role === 'assistant')
            ? firstAssistantTitle ?? 'DeepSeek'
            : turn.role === 'user'
              ? '你的追问'
              : 'DeepSeek')
        }}
      </h4>
      <p class="deepseek-thread-body">{{ turn.content }}</p>
    </article>
  </div>
</template>

<style scoped>
.deepseek-thread {
  display: grid;
  gap: 10px;
  font-size: 14px;
  line-height: 1.65;
}

.deepseek-thread-item {
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--app-surface-alt);
}

.deepseek-thread-item--user {
  background: var(--app-surface, #fff);
}

.deepseek-thread-label {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.deepseek-thread-body {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
