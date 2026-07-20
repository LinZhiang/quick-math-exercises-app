<script setup lang="ts">
import { computed } from 'vue'
import {
  getPracticeCompletionCount,
  getPracticePerfectCount,
} from '@/utils/practiceCompletionStats'

const props = withDefaults(
  defineProps<{
    modeId: string
    /** 完成次数标签，默认「已完成」 */
    label?: string
    /**
     * 全对/满分标签：
     * - 默认「全对」（正计时四选一等）
     * - 倒计时/得分制模块传「满分」
     */
    perfectLabel?: string
  }>(),
  {
    label: '已完成',
    perfectLabel: '全对',
  },
)

const count = computed(() => getPracticeCompletionCount(props.modeId))
const perfectCount = computed(() => getPracticePerfectCount(props.modeId))
</script>

<template>
  <span class="practice-completion-stat-group">
    <span
      class="practice-completion-stat"
      :title="`${label} ${count} 次（完整做完一轮计 1 次）`"
    >
      <span class="practice-completion-stat__label">{{ label }}</span>
      <span class="practice-completion-stat__num">{{ count }}</span>
      <span class="practice-completion-stat__unit">次</span>
    </span>
    <span
      class="practice-completion-stat practice-completion-stat--perfect"
      :title="`${perfectLabel} ${perfectCount} 次（本轮全部答对或达到满分计 1 次）`"
    >
      <span class="practice-completion-stat__label">{{ perfectLabel }}</span>
      <span class="practice-completion-stat__num">{{ perfectCount }}</span>
      <span class="practice-completion-stat__unit">次</span>
    </span>
  </span>
</template>

<style scoped>
.practice-completion-stat-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: 8px;
  vertical-align: middle;
}

.practice-completion-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
  color: #0f766e;
  background: color-mix(in srgb, #0d9488 12%, #f8fafc);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
  white-space: nowrap;
}

.practice-completion-stat--perfect {
  color: #a16207;
  background: color-mix(in srgb, #eab308 14%, #fffbeb);
  border-color: color-mix(in srgb, #ca8a04 28%, #fde68a);
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
