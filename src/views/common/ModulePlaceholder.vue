<script setup lang="ts">
const props = defineProps<{
  title: string
  hint?: string
}>()
</script>

<template>
  <section class="module-placeholder">
    <h1 class="module-placeholder__title">{{ props.title }}</h1>
    <p class="module-placeholder__hint">{{ props.hint || '内容即将开放。' }}</p>
  </section>
</template>

<style scoped>
.module-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 28px 16px;
  gap: 8px;
}

.module-placeholder__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.module-placeholder__hint {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
}
</style>
