<script setup lang="ts">
import { computed } from 'vue'
import type { ProportionPieSpec } from '@/utils/dataAnalysisProportionBasicPractice'

const props = defineProps<{
  pie: ProportionPieSpec
}>()

const COLORS = ['#0d9488', '#c2410c', '#2563eb', '#ca8a04', '#7c3aed', '#64748b', '#db2777']

type ArcSlice = {
  name: string
  value: number
  color: string
  d: string
  midX: number
  midY: number
  label: string
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const arcs = computed((): ArcSlice[] => {
  const slices = props.pie.slices
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1
  const cx = 120
  const cy = 120
  const r = 88
  let angle = 0
  const out: ArcSlice[] = []
  for (let i = 0; i < slices.length; i++) {
    const sl = slices[i]!
    const sweep = (Math.max(0, sl.value) / total) * 360
    const start = angle
    const end = angle + sweep
    const large = sweep > 180 ? 1 : 0
    const p0 = polar(cx, cy, r, start)
    const p1 = polar(cx, cy, r, end)
    const mid = polar(cx, cy, r * 0.62, start + sweep / 2)
    const d =
      sweep >= 359.9
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y} Z`
    out.push({
      name: sl.name,
      value: sl.value,
      color: sl.color || COLORS[i % COLORS.length]!,
      d,
      midX: mid.x,
      midY: mid.y,
      label: `${sl.value}%`,
    })
    angle = end
  }
  return out
})
</script>

<template>
  <figure class="pie-fig">
    <figcaption class="pie-fig__title">{{ pie.title }}</figcaption>
    <div class="pie-fig__row">
      <svg class="pie-fig__svg" viewBox="0 0 240 240" role="img" :aria-label="pie.title">
        <path
          v-for="(a, i) in arcs"
          :key="i"
          :d="a.d"
          :fill="a.color"
          stroke="#fff"
          stroke-width="1.5"
        />
        <text
          v-for="(a, i) in arcs"
          :key="'t' + i"
          :x="a.midX"
          :y="a.midY"
          class="pie-fig__pct"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ a.value >= 3 ? a.label : '' }}
        </text>
      </svg>
      <ul class="pie-fig__legend">
        <li v-for="(a, i) in arcs" :key="i">
          <span class="pie-fig__swatch" :style="{ background: a.color }" />
          <span>{{ a.name }} {{ a.value }}%</span>
        </li>
      </ul>
    </div>
    <p v-if="pie.note" class="pie-fig__note">{{ pie.note }}</p>
  </figure>
</template>

<style scoped>
.pie-fig {
  margin: 0.75rem 0 1rem;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(160deg, #f7f4ef 0%, #eef3f6 55%, #f3ebe3 100%);
  border: 1px solid rgba(13, 148, 136, 0.18);
  border-radius: 8px;
}

.pie-fig__title {
  margin: 0 0 0.45rem;
  font-size: 0.92rem;
  font-weight: 650;
  color: #2a2f36;
  text-align: center;
}

.pie-fig__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.pie-fig__svg {
  width: min(220px, 100%);
  height: auto;
}

.pie-fig__pct {
  font-size: 11px;
  font-weight: 700;
  fill: #fff;
  paint-order: stroke;
  stroke: rgba(0, 0, 0, 0.25);
  stroke-width: 2px;
}

.pie-fig__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: #1e293b;
}

.pie-fig__legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
}

.pie-fig__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.pie-fig__note {
  margin: 0.4rem 0 0;
  font-size: 12px;
  color: #64748b;
  text-align: center;
}
</style>
