<script setup lang="ts">
import { computed, useId } from 'vue'
import type { GrowthChartSpec } from '@/utils/dataAnalysisGrowthPractice'

const props = defineProps<{
  chart: GrowthChartSpec
}>()

const uid = useId()
const gradId = `daBarGrad-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`

const W = 680
const H = 420
const PAD = { top: 72, right: 68, bottom: 52, left: 60 }

/** 柱：青蓝；折线：琥珀橙 */
const BAR_COLOR = '#2a7a9b'
const BAR_COLOR_SOFT = '#3d93b5'
const LINE_COLORS = ['#e67a2e', '#0f766e', '#7c3aed']

const VAL_FONT = 14
const LABEL_H = 18
const COL_GAP = 6

function fmtVal(v: number): string {
  if (!Number.isFinite(v)) return ''
  if (Number.isInteger(v)) return String(v)
  const t = Math.round(v * 10) / 10
  return String(t)
}

function estimateTextWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) {
    w += /[0-9.%?-]/.test(ch) ? fontSize * 0.62 : fontSize * 0.9
  }
  return Math.max(16, w)
}

type LabelBox = {
  kind: 'bar' | 'line'
  seriesIndex: number
  i: number
  col: number
  value: string
  cx: number
  cy: number
  lx: number
  ly: number
  anchor: 'start' | 'end' | 'middle'
  bw: number
  bh: number
}

function boxLeft(b: LabelBox) {
  return b.anchor === 'end' ? b.lx - b.bw : b.anchor === 'middle' ? b.lx - b.bw / 2 : b.lx
}
function boxRight(b: LabelBox) {
  return boxLeft(b) + b.bw
}
function boxTop(b: LabelBox) {
  return b.ly - b.bh + 3
}
function boxBottom(b: LabelBox) {
  return boxTop(b) + b.bh
}

function boxesOverlap(a: LabelBox, b: LabelBox, pad = 3): boolean {
  return (
    boxLeft(a) < boxRight(b) + pad &&
    boxRight(a) + pad > boxLeft(b) &&
    boxTop(a) < boxBottom(b) + pad &&
    boxBottom(a) + pad > boxTop(b)
  )
}

/**
 * 按列布局：柱标固定在柱顶左侧，折线标在点右侧（末列左侧）。
 * 同列纵向强制错开；再扫相邻列，避免贴边重叠。
 */
function layoutLabelsByColumn(
  labels: LabelBox[],
  n: number,
  gap: number,
  plotTop: number,
  plotBottom: number,
) {
  const half = Math.min(22, gap * 0.32)

  for (let col = 0; col < n; col++) {
    const bars = labels.filter((L) => L.col === col && L.kind === 'bar')
    const lines = labels.filter((L) => L.col === col && L.kind === 'line')
    const last = col === n - 1

    for (const bar of bars) {
      bar.anchor = 'middle'
      bar.lx = bar.cx - half
      bar.ly = Math.max(plotTop + LABEL_H, bar.cy - 10)
    }

    for (const line of lines) {
      if (last) {
        line.anchor = 'end'
        line.lx = line.cx - half * 0.35
      } else {
        line.anchor = 'start'
        line.lx = line.cx + half * 0.55
      }
      // 折线点靠近柱顶时：优先把折线标抬到柱标上方；太贴顶则两行叠在顶边空白区
      const bar = bars[0]
      if (bar && Math.abs(line.cy - bar.cy) < LABEL_H * 2.4) {
        const stackTop = plotTop + LABEL_H
        const roomAbove = Math.min(line.cy, bar.cy) - stackTop
        if (roomAbove >= LABEL_H * 2 + COL_GAP) {
          line.ly = Math.min(line.cy, bar.cy) - LABEL_H - COL_GAP
          bar.ly = Math.min(bar.ly, line.ly + LABEL_H + COL_GAP)
          if (boxesOverlap(line, bar, COL_GAP)) {
            line.ly = stackTop
            bar.ly = stackTop + LABEL_H + COL_GAP
          }
        } else {
          // 顶部空间不够：折线占最顶一行，柱标在其下（都在图顶空白）
          line.ly = stackTop
          bar.ly = stackTop + LABEL_H + COL_GAP
        }
      } else if (line.cy > plotBottom - 40) {
        // 底部负增速：标在点右侧偏上，躲开矮柱顶
        line.ly = Math.min(plotBottom - 6, line.cy - 8)
        if (bar && boxesOverlap(line, bar, COL_GAP)) {
          line.ly = Math.min(plotBottom - 6, bar.ly + LABEL_H + COL_GAP)
          if (boxesOverlap(line, bar, COL_GAP)) {
            bar.ly = Math.max(plotTop + LABEL_H, line.ly - LABEL_H - COL_GAP)
          }
        }
      } else {
        line.ly = Math.max(plotTop + LABEL_H, line.cy - 14)
        if (bar && boxesOverlap(line, bar, COL_GAP)) {
          const up = bar.ly - LABEL_H - COL_GAP
          if (up >= plotTop + LABEL_H) line.ly = up
          else line.ly = Math.min(plotBottom - 4, Math.max(line.cy + 16, bar.ly + LABEL_H + 4))
        }
      }
    }

    // 同列多标签最终纵排：从上到下保证间距
    const colLabs = [...bars, ...lines].sort((a, b) => a.ly - b.ly)
    for (let i = 1; i < colLabs.length; i++) {
      const prev = colLabs[i - 1]!
      const cur = colLabs[i]!
      const minLy = prev.ly + LABEL_H + COL_GAP
      if (cur.ly < minLy) {
        // 尽量下推；若贴底则改上推 prev
        if (minLy <= plotBottom - 4) cur.ly = minLy
        else {
          prev.ly = Math.max(plotTop + LABEL_H, cur.ly - LABEL_H - COL_GAP)
          if (cur.ly < prev.ly + LABEL_H + COL_GAP) {
            cur.ly = Math.min(plotBottom - 4, prev.ly + LABEL_H + COL_GAP)
          }
        }
      }
    }
  }

  // 相邻列水平碰撞：把后者再往外挪或纵向错开
  for (let pass = 0; pass < 6; pass++) {
    let moved = false
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]!
        const b = labels[j]!
        if (!boxesOverlap(a, b, 2)) continue
        const later = a.col >= b.col ? a : b
        const earlier = a.col >= b.col ? b : a
        if (later.col !== earlier.col) {
          later.ly = Math.min(plotBottom - 4, Math.max(later.ly, earlier.ly + LABEL_H + COL_GAP))
          if (boxesOverlap(later, earlier, 2)) {
            later.ly = Math.max(plotTop + LABEL_H, earlier.ly - LABEL_H - COL_GAP)
          }
          moved = true
        } else {
          const lower = a.ly <= b.ly ? b : a
          const upper = a.ly <= b.ly ? a : b
          lower.ly = Math.min(plotBottom - 4, upper.ly + LABEL_H + COL_GAP)
          moved = true
        }
      }
    }
    if (!moved) break
  }

  for (const L of labels) {
    L.ly = Math.min(plotBottom - 4, Math.max(plotTop + LABEL_H, L.ly))
  }
}

const plot = computed(() => {
  const c = props.chart
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = Math.max(1, c.categories.length)
  const gap = innerW / n
  const barSeries = c.series.filter((s) => s.type === 'bar')
  const lineSeries = c.series.filter((s) => s.type === 'line')

  const barVals = barSeries.flatMap((s) => s.values)
  const lineVals = lineSeries.flatMap((s) => s.values)
  const barMax = Math.max(1, ...(barVals.length ? barVals : [1]))
  const lineMax = Math.max(1, ...(lineVals.length ? lineVals : [1]))
  const barMin = Math.min(0, ...(barVals.length ? barVals : [0]))
  const lineMin = Math.min(0, ...(lineVals.length ? lineVals : [0]))

  const yBar = (v: number) => {
    const span = barMax - barMin || 1
    return PAD.top + innerH - ((v - barMin) / span) * innerH
  }
  const yLine = (v: number) => {
    const span = lineMax - lineMin || 1
    return PAD.top + innerH - ((v - lineMin) / span) * innerH
  }
  const xAt = (i: number) => PAD.left + gap * i + gap / 2

  const barW = Math.min(34, gap * 0.4)
  type BarItem = {
    x: number
    y: number
    w: number
    h: number
    label: string
    value: string
    tx: number
    ty: number
    bw: number
    bh: number
  }
  const bars: BarItem[] = []
  const labelBoxes: LabelBox[] = []

  for (const s of barSeries) {
    s.values.forEach((v, i) => {
      const y = yBar(v)
      const base = yBar(0)
      const top = Math.min(y, base)
      const h = Math.max(1, Math.abs(base - y))
      const override = c.barDisplay?.[i]
      const value =
        override != null && override !== ''
          ? String(override)
          : fmtVal(v)
      const tx = xAt(i)
      const ty = top - 10
      const bw = estimateTextWidth(value, VAL_FONT) + 10
      const bh = LABEL_H
      const barIndex = bars.length
      bars.push({
        x: xAt(i) - barW / 2,
        y: top,
        w: barW,
        h,
        label: `${s.name} ${v}`,
        value,
        tx,
        ty,
        bw,
        bh,
      })
      labelBoxes.push({
        kind: 'bar',
        seriesIndex: 0,
        i: barIndex,
        col: i,
        value,
        cx: xAt(i),
        cy: top,
        lx: tx,
        ly: ty,
        anchor: 'middle',
        bw,
        bh,
      })
    })
  }

  const lines: {
    d: string
    color: string
    name: string
    dots: Array<{
      cx: number
      cy: number
      value: string
      lx: number
      ly: number
      anchor: 'start' | 'end' | 'middle'
      bw: number
      bh: number
    }>
  }[] = []

  lineSeries.forEach((s, si) => {
    const color = LINE_COLORS[si % LINE_COLORS.length]!
    const dotsMeta = s.values.map((v, i) => {
      const cx = xAt(i)
      const cy = yLine(v)
      const value = fmtVal(v)
      const bw = estimateTextWidth(value, VAL_FONT) + 10
      const bh = LABEL_H
      const box: LabelBox = {
        kind: 'line',
        seriesIndex: si,
        i,
        col: i,
        value,
        cx,
        cy,
        lx: cx + 10,
        ly: cy - 12,
        anchor: 'start',
        bw,
        bh,
      }
      labelBoxes.push(box)
      return { cx, cy, box }
    })
    const d = dotsMeta.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ')
    lines.push({
      d,
      color,
      name: s.name,
      dots: dotsMeta.map((p) => ({
        cx: p.cx,
        cy: p.cy,
        value: p.box.value,
        lx: p.box.lx,
        ly: p.box.ly,
        anchor: p.box.anchor,
        bw: p.box.bw,
        bh: p.box.bh,
      })),
    })
  })

  layoutLabelsByColumn(labelBoxes, n, gap, PAD.top, H - PAD.bottom - 8)

  for (const box of labelBoxes) {
    if (box.kind === 'bar') {
      const b = bars[box.i]
      if (b) {
        b.tx = box.lx
        b.ty = box.ly
        b.bw = box.bw
        b.bh = box.bh
      }
    } else {
      const d = lines[box.seriesIndex]?.dots[box.i]
      if (d) {
        d.lx = box.lx
        d.ly = box.ly
        d.anchor = box.anchor
        d.bw = box.bw
        d.bh = box.bh
      }
    }
  }

  return {
    bars,
    lines,
    cats: c.categories.map((label, i) => ({ label, x: xAt(i) })),
    leftTicks: [barMin, (barMin + barMax) / 2, barMax].map((v) => ({
      v: Math.round(v * 10) / 10,
      y: yBar(v),
    })),
    rightTicks: lineVals.length
      ? [lineMin, (lineMin + lineMax) / 2, lineMax].map((v) => ({
          v: Math.round(v * 10) / 10,
          y: yLine(v),
        }))
      : [],
    leftUnit: c.leftUnit || barSeries[0]?.unit || '',
    rightUnit: c.rightUnit || lineSeries[0]?.unit || '%',
    legend: [
      ...barSeries.map((s) => ({ name: s.name, kind: 'bar' as const, color: BAR_COLOR })),
      ...lineSeries.map((s, i) => ({
        name: s.name,
        kind: 'line' as const,
        color: LINE_COLORS[i % LINE_COLORS.length]!,
      })),
    ],
  }
})

const dataTable = computed(() => {
  const c = props.chart
  const bar = c.series.find((s) => s.type === 'bar')
  const line = c.series.find((s) => s.type === 'line')
  return {
    categories: c.categories,
    barName: bar?.name ?? '柱',
    lineName: line?.name ?? '线',
    barUnit: bar?.unit || c.leftUnit || '',
    lineUnit: line?.unit || c.rightUnit || '%',
    rows: c.categories.map((cat, i) => {
      const override = c.barDisplay?.[i]
      const barText =
        override != null && override !== ''
          ? String(override)
          : bar
            ? fmtVal(bar.values[i]!)
            : '—'
      return {
        cat,
        bar: barText,
        line: line ? fmtVal(line.values[i]!) : '—',
      }
    }),
  }
})
</script>

<template>
  <figure class="da-chart">
    <figcaption class="da-chart__title">{{ chart.title }}</figcaption>
    <svg
      class="da-chart__svg"
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      :aria-label="chart.title"
    >
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="BAR_COLOR_SOFT" />
          <stop offset="100%" :stop-color="BAR_COLOR" />
        </linearGradient>
      </defs>

      <line
        :x1="PAD.left"
        :y1="PAD.top"
        :x2="PAD.left"
        :y2="H - PAD.bottom"
        class="da-chart__axis"
      />
      <line
        :x1="PAD.left"
        :y1="H - PAD.bottom"
        :x2="W - PAD.right"
        :y2="H - PAD.bottom"
        class="da-chart__axis"
      />
      <line
        v-if="plot.rightTicks.length"
        :x1="W - PAD.right"
        :y1="PAD.top"
        :x2="W - PAD.right"
        :y2="H - PAD.bottom"
        class="da-chart__axis"
      />

      <text v-if="plot.leftUnit" :x="8" :y="PAD.top - 22" class="da-chart__unit">
        {{ plot.leftUnit }}
      </text>
      <text
        v-if="plot.rightTicks.length && plot.rightUnit"
        :x="W - PAD.right - 4"
        :y="PAD.top - 22"
        class="da-chart__unit da-chart__unit--right"
      >
        {{ plot.rightUnit }}
      </text>

      <g v-for="(t, i) in plot.leftTicks" :key="'L' + i">
        <line
          :x1="PAD.left - 4"
          :y1="t.y"
          :x2="PAD.left"
          :y2="t.y"
          class="da-chart__tick"
        />
        <text :x="PAD.left - 8" :y="t.y + 4" class="da-chart__tick-label" text-anchor="end">
          {{ t.v }}
        </text>
      </g>
      <g v-for="(t, i) in plot.rightTicks" :key="'R' + i">
        <line
          :x1="W - PAD.right"
          :y1="t.y"
          :x2="W - PAD.right + 4"
          :y2="t.y"
          class="da-chart__tick"
        />
        <text
          :x="W - PAD.right + 8"
          :y="t.y + 4"
          class="da-chart__tick-label"
          text-anchor="start"
        >
          {{ t.v }}
        </text>
      </g>

      <rect
        v-for="(b, i) in plot.bars"
        :key="'b' + i"
        :x="b.x"
        :y="b.y"
        :width="b.w"
        :height="b.h"
        class="da-chart__bar"
        :fill="`url(#${gradId})`"
      >
        <title>{{ b.label }}</title>
      </rect>

      <g v-for="(b, i) in plot.bars" :key="'bv' + i">
        <rect
          :x="b.tx - b.bw / 2"
          :y="b.ty - b.bh + 3"
          :width="b.bw"
          :height="b.bh"
          class="da-chart__val-bg da-chart__val-bg--bar"
          rx="3"
        />
        <text
          :x="b.tx"
          :y="b.ty"
          class="da-chart__val da-chart__val--bar"
          text-anchor="middle"
        >
          {{ b.value }}
        </text>
      </g>

      <g v-for="(ln, i) in plot.lines" :key="'ln' + i">
        <path
          :d="ln.d"
          fill="none"
          :stroke="ln.color"
          stroke-width="2.6"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <circle
          v-for="(d, j) in ln.dots"
          :key="'dot' + j"
          :cx="d.cx"
          :cy="d.cy"
          r="3.8"
          :fill="ln.color"
          stroke="#fff"
          stroke-width="1.3"
        />
        <g v-for="(d, j) in ln.dots" :key="'lv' + j">
          <rect
            :x="d.anchor === 'end' ? d.lx - d.bw : d.anchor === 'middle' ? d.lx - d.bw / 2 : d.lx"
            :y="d.ly - d.bh + 3"
            :width="d.bw"
            :height="d.bh"
            class="da-chart__val-bg da-chart__val-bg--line"
            rx="3"
          />
          <text
            :x="d.lx"
            :y="d.ly"
            class="da-chart__val da-chart__val--line"
            :text-anchor="d.anchor"
            :fill="ln.color"
          >
            {{ d.value }}
          </text>
        </g>
      </g>

      <text
        v-for="(cat, i) in plot.cats"
        :key="'c' + i"
        :x="cat.x"
        :y="H - 14"
        class="da-chart__cat"
        text-anchor="middle"
      >
        {{ cat.label }}
      </text>
    </svg>
    <ul v-if="plot.legend.length" class="da-chart__legend">
      <li v-for="(g, i) in plot.legend" :key="i" class="da-chart__legend-item">
        <span
          class="da-chart__swatch"
          :class="g.kind === 'bar' ? 'is-bar' : 'is-line'"
          :style="{ '--swatch': g.color }"
        />
        {{ g.name }}
      </li>
    </ul>
    <div class="da-chart__table-wrap">
      <p class="da-chart__table-hint">读图数据（与上图一致，便于核对）</p>
      <table class="da-chart__table">
        <thead>
          <tr>
            <th>类目</th>
            <th>
              {{ dataTable.barName
              }}{{ dataTable.barUnit ? `（${dataTable.barUnit}）` : '' }}
            </th>
            <th>
              {{ dataTable.lineName
              }}{{ dataTable.lineUnit ? `（${dataTable.lineUnit}）` : '' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in dataTable.rows" :key="row.cat">
            <td>{{ row.cat }}</td>
            <td>{{ row.bar }}</td>
            <td>{{ row.line }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.da-chart {
  margin: 0.75rem 0 1rem;
  padding: 0.7rem 0.8rem 0.55rem;
  background: linear-gradient(160deg, #f4f7f9 0%, #eef3f6 48%, #f7f1ea 100%);
  border: 1px solid rgba(42, 122, 155, 0.14);
  border-radius: 8px;
}

.da-chart__title {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 650;
  color: #1f3340;
}

.da-chart__svg {
  display: block;
  width: 100%;
  max-width: 680px;
  height: auto;
}

.da-chart__axis {
  stroke: rgba(40, 70, 90, 0.28);
  stroke-width: 1;
}

.da-chart__tick {
  stroke: rgba(40, 70, 90, 0.28);
  stroke-width: 1;
}

.da-chart__tick-label,
.da-chart__cat,
.da-chart__unit {
  font-size: 12px;
  fill: #4a5d6a;
}

.da-chart__unit--right {
  text-anchor: end;
}

.da-chart__bar {
  opacity: 0.92;
}

.da-chart__val-bg--bar {
  fill: rgba(255, 255, 255, 0.92);
  stroke: rgba(42, 122, 155, 0.28);
  stroke-width: 0.7;
}

.da-chart__val-bg--line {
  fill: rgba(255, 248, 240, 0.94);
  stroke: rgba(230, 122, 46, 0.32);
  stroke-width: 0.7;
}

.da-chart__val {
  font-size: 14px;
  font-weight: 700;
  pointer-events: none;
}

.da-chart__val--bar {
  fill: #1a4f66;
}

.da-chart__val--line {
  font-size: 14px;
  font-weight: 700;
}

.da-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin: 0.4rem 0 0.5rem;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: #334155;
}

.da-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.da-chart__swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--swatch, #2a7a9b);
}

.da-chart__swatch.is-line {
  height: 3px;
  border-radius: 1px;
  align-self: center;
}

.da-chart__table-wrap {
  margin-top: 0.35rem;
  overflow-x: auto;
}

.da-chart__table-hint {
  margin: 0 0 0.25rem;
  font-size: 11px;
  color: #64748b;
}

.da-chart__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: #1e293b;
}

.da-chart__table th,
.da-chart__table td {
  border: 1px solid rgba(42, 122, 155, 0.16);
  padding: 4px 8px;
  text-align: center;
}

.da-chart__table th {
  background: rgba(42, 122, 155, 0.1);
  font-weight: 650;
}

.da-chart__table td:nth-child(3) {
  color: #c2410c;
  font-weight: 560;
}
</style>
