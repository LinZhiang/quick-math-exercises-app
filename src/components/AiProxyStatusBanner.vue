<script setup lang="ts">
import { computed } from 'vue'
import { useAiProxyHealth } from '@/composables/useAiProxyHealth'

const directMode = computed(() => Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY?.trim()))
const { health, checking, refresh } = useAiProxyHealth()
</script>

<template>
  <div
    v-if="!directMode && health && !health.ok"
    class="ai-status-banner"
    role="status"
  >
    <p class="ai-status-banner__text">{{ health.message }}</p>
    <button type="button" class="ai-status-banner__btn" :disabled="checking" @click="refresh(true)">
      重试
    </button>
  </div>
</template>

<style scoped>
.ai-status-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--el-color-warning) 45%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-warning-light-9) 50%, transparent);
  font-size: 13px;
  line-height: 1.5;
}

.ai-status-banner__text {
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.ai-status-banner__btn {
  padding: 4px 10px;
  border: 1px solid var(--app-border-soft);
  border-radius: 8px;
  background: var(--app-surface);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.ai-status-banner__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
