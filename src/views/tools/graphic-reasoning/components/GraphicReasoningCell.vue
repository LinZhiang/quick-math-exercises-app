<script setup lang="ts">
import type { GfxCell, GfxPrimitive } from '@/utils/graphicReasoningPractice'

defineProps<{
  cell: GfxCell
  size?: 'md' | 'sm'
}>()

function trianglePoints(cx: number, cy: number, r: number): string {
  const x1 = cx
  const y1 = cy - r
  const x2 = cx + r * 0.866
  const y2 = cy + r * 0.5
  const x3 = cx - r * 0.866
  const y3 = cy + r * 0.5
  return `${x1},${y1} ${x2},${y2} ${x3},${y3}`
}

function primitiveTransform(p: GfxPrimitive): string | undefined {
  if (p.rotate == null) return undefined
  const cx = p.cx ?? 50
  const cy = p.cy ?? 50
  return `rotate(${p.rotate} ${cx} ${cy})`
}
</script>

<template>
  <svg
    class="gfx-cell"
    :class="size === 'sm' ? 'gfx-cell--sm' : 'gfx-cell--md'"
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <g
      v-for="(p, idx) in cell.primitives"
      :key="idx"
      :transform="primitiveTransform(p)"
    >
      <circle
        v-if="p.type === 'circle' || p.type === 'dot'"
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        :fill="p.filled || p.type === 'dot' ? 'currentColor' : 'none'"
        stroke="currentColor"
        :stroke-width="p.type === 'dot' ? 0 : 2.5"
      />
      <rect
        v-else-if="p.type === 'rect'"
        :x="(p.cx ?? 50) - (p.w ?? 40) / 2"
        :y="(p.cy ?? 50) - (p.h ?? 40) / 2"
        :width="p.w ?? 40"
        :height="p.h ?? 40"
        :fill="p.filled ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2.5"
      />
      <polygon
        v-else-if="p.type === 'triangle'"
        :points="trianglePoints(p.cx ?? 50, p.cy ?? 50, p.r ?? 28)"
        :fill="p.filled ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <line
        v-else-if="p.type === 'line'"
        :x1="p.x1"
        :y1="p.y1"
        :x2="p.x2"
        :y2="p.y2"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
.gfx-cell {
  display: block;
  color: var(--el-text-color-primary);
}

.gfx-cell--md {
  width: 88px;
  height: 88px;
}

.gfx-cell--sm {
  width: 64px;
  height: 64px;
}
</style>
