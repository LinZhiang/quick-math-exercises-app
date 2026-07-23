<script setup lang="ts">
import { computed } from 'vue'
import { getWrongBookReviewStats } from '@/utils/wrongBookReviewStats'

const props = defineProps<{
  scope: string
}>()

const stats = computed(() => getWrongBookReviewStats(props.scope))
</script>

<template>
  <span
    class="wb-review-stat"
    :title="`错题复盘：已练 ${stats.attempted} 题，答对 ${stats.correct} 题，完整复盘 ${stats.completeReviews} 次（中途退出也会计入已练/答对，但不计完整复盘）`"
  >
    <span class="wb-review-stat__item">
      <span class="wb-review-stat__label">已练</span>
      <span class="wb-review-stat__num">{{ stats.attempted }}</span>
      <span class="wb-review-stat__unit">题</span>
    </span>
    <span class="wb-review-stat__item wb-review-stat__item--ok">
      <span class="wb-review-stat__label">答对</span>
      <span class="wb-review-stat__num">{{ stats.correct }}</span>
      <span class="wb-review-stat__unit">题</span>
    </span>
    <span class="wb-review-stat__item wb-review-stat__item--done">
      <span class="wb-review-stat__label">完整复盘</span>
      <span class="wb-review-stat__num">{{ stats.completeReviews }}</span>
      <span class="wb-review-stat__unit">次</span>
    </span>
  </span>
</template>

<style scoped>
.wb-review-stat {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  vertical-align: middle;
}

.wb-review-stat__item {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
  color: #1d4ed8;
  background: color-mix(in srgb, #3b82f6 12%, #f8fafc);
  border: 1px solid color-mix(in srgb, #3b82f6 22%, #e2e8f0);
  white-space: nowrap;
}

.wb-review-stat__item--ok {
  color: #0f766e;
  background: color-mix(in srgb, #0d9488 12%, #f8fafc);
  border-color: color-mix(in srgb, #0d9488 22%, #e2e8f0);
}

.wb-review-stat__item--done {
  color: #a16207;
  background: color-mix(in srgb, #eab308 14%, #fffbeb);
  border-color: color-mix(in srgb, #ca8a04 28%, #fde68a);
}

.wb-review-stat__label {
  font-weight: 600;
  opacity: 0.9;
}

.wb-review-stat__num {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

.wb-review-stat__unit {
  font-weight: 600;
  opacity: 0.85;
}
</style>
