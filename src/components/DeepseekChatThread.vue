<script setup lang="ts">
import { computed } from 'vue'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import type { DeepSeekDisplayTurn } from '@/composables/useDeepseekConversation'
import { getAiProviderShortName, aiProviderTick } from '@/utils/aiProviderStore'

const props = defineProps<{
  turns: DeepSeekDisplayTurn[]
  firstAssistantTitle?: string
}>()

const firstAssistantIndex = computed(() =>
  props.turns.findIndex((turn) => turn.role === 'assistant'),
)

const renderedTurns = computed(() => {
  void aiProviderTick.value
  const assistantName = getAiProviderShortName()
  return props.turns.map((turn, index) => {
    const displayLabel =
      turn.label ??
      (turn.role === 'assistant' &&
      index === firstAssistantIndex.value &&
      props.firstAssistantTitle
        ? props.firstAssistantTitle
        : turn.role === 'user'
          ? '你的追问'
          : assistantName)
    return {
      ...turn,
      html: markdownToDisplaySafeHtml(turn.content),
      displayLabel,
    }
  })
})
</script>

<template>
  <div v-if="renderedTurns.length" class="deepseek-thread" aria-label="AI 对话">
    <article
      v-for="(turn, index) in renderedTurns"
      :key="index"
      class="deepseek-thread-item"
      :class="turn.role === 'user' ? 'deepseek-thread-item--user' : 'deepseek-thread-item--assistant'"
    >
      <h4 class="deepseek-thread-label">{{ turn.displayLabel }}</h4>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="deepseek-thread-body deepseek-md" v-html="turn.html" />
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
  word-break: break-word;
  color: var(--app-text, inherit);
}
</style>
