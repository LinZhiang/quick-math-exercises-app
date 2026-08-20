<!-- 内部刷新/打开时的明确提示，避免整页空白被当成卡死。 -->
<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    hint?: string
  }>(),
  { hint: '请稍候，不是卡住了' },
)
</script>

<template>
  <div class="cb-busy" role="status" aria-live="polite">
    <span class="cb-busy__spin" aria-hidden="true" />
    <div class="cb-busy__copy">
      <p class="cb-busy__text">{{ text }}</p>
      <p v-if="hint" class="cb-busy__hint">{{ hint }}</p>
    </div>
  </div>
</template>

<style scoped>
.cb-busy {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
}

.cb-busy__spin {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border: 2.5px solid color-mix(in srgb, var(--app-primary) 22%, #e2e8f0);
  border-top-color: var(--app-primary);
  border-radius: 50%;
  animation: cb-busy-spin 0.7s linear infinite;
}

.cb-busy__copy {
  min-width: 0;
}

.cb-busy__text {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text);
}

.cb-busy__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

@keyframes cb-busy-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
