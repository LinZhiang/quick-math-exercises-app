<script setup lang="ts">
import { computed } from 'vue'
import type { GrowthInterYearChartSpec } from '@/utils/dataAnalysisGrowthInterYearPractice'

const props = defineProps<{
  chart: GrowthInterYearChartSpec
}>()

const W = 720
const H = 400
const PAD = { top: 56, right: 36, bottom: 58, left: 52 }

const COLORS = ['#c45c26', '#1d6a8a', '#5b4b8a']
const VAL_FONT = 13
const LABEL_H = 17
const GAP_Y = 5

function fmtVal(v: number): string {
  if (!Number.isFinite(v)) return ''
  if (Number.isInteger(v)) return String(v)
  return String(Math.round(v * 10) / 10)
}

function estimateTextWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) {
    w += /[0-9.%-]/.test(ch) ? fontSize * 0.62 : fontSize * 0.9
  }
  return Math.max(14, w)
}

type Label = {
  seriesIndex: number
  i: number
  value: string
  cx: number
  cy: number
  lx: number
  ly: number
  anchor: 'start' | 'end' | 'middle'
  bw: number
  bh: number
  color: string
}

function boxL(b: Label) {
  return b.anchor === 'end' ? b.lx - b.bw : b.anchor === 'middle' ? b.lx - b.bw / 2 : b.lx
}
function boxesOverlap(a: Label, b: Label, pad = 3): boolean {
  const ax1 = boxL(a)
  const bx1 = boxL(b)
  const ay1 = a.ly - a.bh + 3
  const by1 = b.ly - b.bh + 3
  return (
    ax1 < bx1 + b.bw + pad &&
    ax1 + a.bw + pad > bx1 &&
    ay1 < by1 + b.bh + pad &&
    ay1 + a.bh + pad > by1
  )
}

const plot = computed(() => {
  const c = props.chart
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = Math.max(1, c.categories.length)
  const gap = innerW / n
  const allVals = c.series.flatMap((s) => s.values)
  const yMax = Math.max(1, ...allVals, 0)
  const yMin = Math.min(0, ...allVals)
  const yAt = (v: number) => {
    const span = yMax - yMin || 1
    return PAD.top + innerH - ((v - yMin) / span) * innerH
  }
  const xAt = (i: number) => PAD.left + gap * i + gap / 2

  const labels: Label[] = []
  const lines = c.series.map((s, si) => {
    const color = COLORS[si % COLORS.length]!
    const points = s.values.map((v, i) => {
      const cx = xAt(i)
      const cy = yAt(v)
      const value = fmtVal(v)
      const bw = estimateTextWidth(value, VAL_FONT) + 8
      const bh = LABEL_H
      // 两年错开：上年偏上偏左，当年偏下偏右
      const up = si % 2 === 0
      let anchor: Label['anchor'] = up ? 'end' : 'start'
      let lx = up ? cx - 8 : cx + 8
      let ly = up ? cy - 12 : cy + 16
      if (i === n - 1 && !up) {
        anchor = 'end'
        lx = cx - 8
      }
      if (ly < PAD.top + LABEL_H) ly = PAD.top + LABEL_H
      if (ly > H - PAD.bottom - 4) ly = H - PAD.bottom - 4
      const lab: Label = {
        seriesIndex: si,
        i,
        value,
        cx,
        cy,
        lx,
        ly,
        anchor,
        bw,
        bh,
        color,
      }
      labels.push(lab)
      return { cx, cy, lab }
    })
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ')
    return {
      d,
      color,
      name: s.name,
      marker: s.marker ?? (si === 0 ? 'triangle' : 'square'),
      points,
    }
  })

  // 同列 / 全局防重叠
  for (let pass = 0; pass < 10; pass++) {
    let moved = false
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!
        const b = labels[j]!
        if (!boxesOverlap(a, b, GAP_Y)) continue
        const lower = a.ly <= b.ly ? b : a
        const upper = a.ly <= b.ly ? a : b
        const next = upper.ly + LABEL_H + GAP_Y
        if (next <= H - PAD.bottom - 4) {
          lower.ly = next
        } else {
          upper.ly = Math.max(PAD.top + LABEL_H, lower.ly - LABEL_H - GAP_Y)
        }
        moved = true
      }
    }
    if (!moved) break
  }

  return {
    lines,
    labels,
    cats: c.categories.map((label, i) => ({ label, x: xAt(i) })),
    ticks: [yMin, (yMin + yMax) / 2, yMax].map((v) => ({
      v: Math.round(v * 10) / 10,
      y: yAt(v),
    })),
    yUnit: c.yUnit || '%',
    legend: c.series.map((s, i) => ({
      name: s.name,
      color: COLORS[i % COLORS.length]!,
      marker: s.marker ?? (i === 0 ? 'triangle' : 'square'),
    })),
  }
})

const dataTable = computed(() => {
  const c = props.chart
  return {
    categories: c.categories,
    series: c.series,
    rows: c.categories.map((cat, i) => ({
      cat,
      vals: c.series.map((s) => fmtVal(s.values[i]!)),
    })),
  }
})

function markerPoints(cx: number, cy: number, kind: string): string {
  if (kind === 'triangle') {
    return `${cx},${cy - 5} ${cx - 5},${cy + 4} ${cx + 5},${cy + 4}`
  }
  return ''
}
</script>

<template>
  <figure class="iy-chart">
    <figcaption class="iy-chart__title">{{ chart.title }}</figcaption>
    <svg class="iy-chart__svg" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="chart.title">
      <text :x="8" :y="PAD.top - 20" class="iy-chart__unit">{{ plot.yUnit }}</text>
      <line
        :x1="PAD.left"
        :y1="PAD.top"
        :x2="PAD.left"
        :y2="H - PAD.bottom"
        class="iy-chart__axis"
      />
      <line
        :x1="PAD.left"
        :y1="H - PAD.bottom"
        :x2="W - PAD.right"
        :y2="H - PAD.bottom"
        class="iy-chart__axis"
      />
      <g v-for="(t, i) in plot.ticks" :key="'t' + i">
        <line
          :x1="PAD.left - 4"
          :y1="t.y"
          :x2="PAD.left"
          :y2="t.y"
          class="iy-chart__tick"
        />
        <text :x="PAD.left - 8" :y="t.y + 4" class="iy-chart__tick-label" text-anchor="end">
          {{ t.v }}
        </text>
      </g>

      <g v-for="(ln, i) in plot.lines" :key="'ln' + i">
        <path
          :d="ln.d"
          fill="none"
          :stroke="ln.color"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <template v-for="(p, j) in ln.points" :key="'m' + j">
          <polygon
            v-if="ln.marker === 'triangle'"
            :points="markerPoints(p.cx, p.cy, 'triangle')"
            :fill="ln.color"
            stroke="#fff"
            stroke-width="1"
          />
          <rect
            v-else-if="ln.marker === 'square'"
            :x="p.cx - 4"
            :y="p.cy - 4"
            width="8"
            height="8"
            :fill="ln.color"
            stroke="#fff"
            stroke-width="1"
          />
          <circle
            v-else
            :cx="p.cx"
            :cy="p.cy"
            r="3.6"
            :fill="ln.color"
            stroke="#fff"
            stroke-width="1.2"
          />
        </template>
      </g>

      <g v-for="(lab, i) in plot.labels" :key="'lab' + i">
        <rect
          :x="lab.anchor === 'end' ? lab.lx - lab.bw : lab.anchor === 'middle' ? lab.lx - lab.bw / 2 : lab.lx"
          :y="lab.ly - lab.bh + 3"
          :width="lab.bw"
          :height="lab.bh"
          class="iy-chart__val-bg"
          rx="3"
        />
        <text
          :x="lab.lx"
          :y="lab.ly"
          class="iy-chart__val"
          :fill="lab.color"
          :text-anchor="lab.anchor"
        >
          {{ lab.value }}
        </text>
      </g>

      <text
        v-for="(cat, i) in plot.cats"
        :key="'c' + i"
        :x="cat.x"
        :y="H - 14"
        class="iy-chart__cat"
        text-anchor="middle"
      >
        {{ cat.label }}
      </text>
    </svg>

    <ul class="iy-chart__legend">
      <li v-for="(g, i) in plot.legend" :key="i" class="iy-chart__legend-item">
        <span class="iy-chart__swatch" :style="{ color: g.color }">
          <svg width="14" height="12" viewBox="0 0 14 12">
            <polygon
              v-if="g.marker === 'triangle'"
              points="7,1 1,11 13,11"
              :fill="g.color"
            />
            <rect v-else-if="g.marker === 'square'" x="3" y="2" width="8" height="8" :fill="g.color" />
            <circle v-else cx="7" cy="6" r="3.5" :fill="g.color" />
          </svg>
        </span>
        {{ g.name }}
      </li>
    </ul>

    <div class="iy-chart__table-wrap">
      <p class="iy-chart__table-hint">读图数据（与上图一致）</p>
      <table class="iy-chart__table">
        <thead>
          <tr>
            <th>时期</th>
            <th v-for="s in dataTable.series" :key="s.name">{{ s.name }}（%）</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in dataTable.rows" :key="row.cat">
            <td>{{ row.cat }}</td>
            <td v-for="(v, idx) in row.vals" :key="idx">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.iy-chart {
  margin: 0.75rem 0 1rem;
  padding: 0.7rem 0.8rem 0.55rem;
  background: linear-gradient(160deg, #f7f4ef 0%, #eef3f6 55%, #f3ebe3 100%);
  border: 1px solid rgba(196, 92, 38, 0.16);
  border-radius: 8px;
}

.iy-chart__title {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 650;
  color: #2a2f36;
}

.iy-chart__svg {
  display: block;
  width: 100%;
  max-width: 720px;
  height: auto;
}

.iy-chart__axis,
.iy-chart__tick {
  stroke: rgba(40, 50, 60, 0.28);
  stroke-width: 1;
}

.iy-chart__tick-label,
.iy-chart__cat,
.iy-chart__unit {
  font-size: 11px;
  fill: #4a5560;
}

.iy-chart__val-bg {
  fill: rgba(255, 255, 255, 0.92);
  stroke: rgba(40, 50, 60, 0.14);
  stroke-width: 0.6;
}

.iy-chart__val {
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
}

.iy-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin: 0.35rem 0 0.45rem;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: #334155;
}

.iy-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.iy-chart__table-wrap {
  overflow-x: auto;
}

.iy-chart__table-hint {
  margin: 0 0 0.25rem;
  font-size: 11px;
  color: #64748b;
}

.iy-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.iy-chart__table th,
.iy-chart__table td {
  border: 1px solid rgba(196, 92, 38, 0.16);
  padding: 4px 8px;
  text-align: center;
}

.iy-chart__table th {
  background: rgba(196, 92, 38, 0.1);
  font-weight: 650;
}
</style>
