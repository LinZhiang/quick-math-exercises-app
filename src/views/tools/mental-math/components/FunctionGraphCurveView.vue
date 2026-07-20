<script setup lang="ts">
import type { FunctionGraphKind } from '@/utils/functionGraphPractice'
import { FUNCTION_GRAPH_KIND_LABEL } from '@/utils/functionGraphPractice'

const props = defineProps<{
  kind: FunctionGraphKind
  label?: string
  compact?: boolean
}>()

/** 在 viewBox 0..100 x 0..70 内画曲线，y 轴向上需翻转 */
function pathFor(kind: FunctionGraphKind): string {
  const pts = (ys: number[]) => {
    const n = ys.length
    return ys
      .map((y, i) => {
        const x = 8 + (i / (n - 1)) * 84
        const yy = 62 - y * 50
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`
      })
      .join(' ')
  }
  switch (kind) {
    case 'linear-down':
      return pts([0.85, 0.7, 0.55, 0.4, 0.25, 0.1])
    case 'linear-up':
      return pts([0.1, 0.25, 0.4, 0.55, 0.7, 0.85])
    case 'curve-down-steepen':
      // 开始平缓后变陡
      return pts([0.92, 0.88, 0.8, 0.62, 0.35, 0.05])
    case 'curve-down-flatten':
      // 开始陡后变平
      return pts([0.95, 0.55, 0.32, 0.18, 0.1, 0.06])
    case 'curve-up-steepen':
      return pts([0.05, 0.12, 0.25, 0.45, 0.75, 0.95])
    case 'curve-up-flatten':
      return pts([0.05, 0.35, 0.62, 0.8, 0.9, 0.95])
    case 'hyperbola-down':
      // 反比例：开始很陡，随后迅速趋平（与「减速下降抛物线」区分开）
      return pts([0.98, 0.42, 0.22, 0.14, 0.1, 0.08])
    case 'periodic':
      return pts([0.5, 0.85, 0.5, 0.15, 0.5, 0.85, 0.5])
    case 'piecewise-flat-then-down':
      return 'M8,20 L45,20 L52,22 L90,58'
    case 'piecewise-down-then-flat':
      return 'M8,18 L40,50 L48,55 L92,55'
    case 'step-down':
      return 'M8,18 L28,18 L28,30 L48,30 L48,42 L68,42 L68,54 L90,54'
    case 'absolute-v':
      // 先降后升（V）
      return pts([0.9, 0.55, 0.12, 0.55, 0.9])
    default:
      return pts([0.5, 0.5, 0.5])
  }
}
</script>

<template>
  <div class="fg-curve" :class="{ 'fg-curve--compact': compact }">
    <svg class="fg-curve__svg" viewBox="0 0 100 70" role="img" :aria-label="FUNCTION_GRAPH_KIND_LABEL[kind]">
      <!-- axes -->
      <line x1="8" y1="62" x2="94" y2="62" class="fg-curve__axis" />
      <line x1="8" y1="62" x2="8" y2="8" class="fg-curve__axis" />
      <text x="96" y="66" class="fg-curve__axis-label">x</text>
      <text x="2" y="10" class="fg-curve__axis-label">y</text>
      <path :d="pathFor(kind)" class="fg-curve__path" fill="none" />
    </svg>
    <p v-if="label !== ''" class="fg-curve__caption">
      {{ label ?? FUNCTION_GRAPH_KIND_LABEL[kind] }}
    </p>
  </div>
</template>

<style scoped>
.fg-curve {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}
.fg-curve--compact {
  max-width: 160px;
}
.fg-curve__svg {
  display: block;
  width: 100%;
  height: auto;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}
.fg-curve__axis {
  stroke: #94a3b8;
  stroke-width: 1.2;
}
.fg-curve__axis-label {
  font-size: 7px;
  fill: #64748b;
  font-weight: 600;
}
.fg-curve__path {
  stroke: #0f766e;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.fg-curve__caption {
  margin: 0.25rem 0 0;
  text-align: center;
  font-size: 0.75rem;
  color: #475569;
}
</style>
