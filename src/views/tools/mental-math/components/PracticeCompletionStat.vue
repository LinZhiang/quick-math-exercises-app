<script setup lang="ts">
import { computed } from 'vue'
import { getPracticeCompletionCount } from '@/utils/practiceCompletionStats'

const props = withDefaults(
  defineProps<{
    modeId: string
    /** 默认「已完成 N 次」 */
    label?: string
  }>(),
  {
    label: '已完成',
  },
)

const count = computed(() => getPracticeCompletionCount(props.modeId))
</script>

<template>
  <span class="practice-completion-stat" :title="`${label} ${count} 次（完整做完一轮计 1 次）`">
    <span class="practice-completion-stat__label">{{ label }}</span>
    <span class="practice-completion-stat__num">{{ count }}</span>
    <span class="practice-completion-stat__unit">次</span>
  </span>
</template>

<style scoped>
.practice-completion-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
  vertical-align: middle;
  color: #0f766e;
  background: color-mix(in srgb, #0d9488 12%, #f8fafc);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
  white-space: nowrap;
}

.practice-completion-stat__label {
  font-weight: 600;
  opacity: 0.9;
}

.practice-completion-stat__num {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

.practice-completion-stat__unit {
  font-weight: 600;
  opacity: 0.85;
}
</style>
