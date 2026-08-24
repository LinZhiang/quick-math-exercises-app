<!-- 内部刷新/打开时的明确提示，避免整页空白被当成卡死。 -->
<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    hint?: string
  }>(),
  { hint: '请稍候，马上就完成' },
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
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 24px 16px;
  box-sizing: border-box;
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
  max-width: 22rem;
}

.cb-busy__text {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text);
  text-align: center;
}

.cb-busy__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
  text-align: center;
}

@keyframes cb-busy-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
