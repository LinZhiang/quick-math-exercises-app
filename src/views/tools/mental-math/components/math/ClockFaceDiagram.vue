<script setup lang="ts">
/**
 * 钟面示意：时针/分针角度以 12 点为 0°，顺时针为正。
 * hourDeg = 30H + 0.5M；minuteDeg = 6M。
 */
const props = withDefaults(
  defineProps<{
    /** 时针角度（度） */
    hourDeg: number
    /** 分针角度（度） */
    minuteDeg: number
    caption?: string
    /** 是否画出两针夹角扇形（取较小夹角） */
    showArc?: boolean
    /** 显示时刻文字，如 4:13 */
    timeLabel?: string
    size?: number
  }>(),
  {
    showArc: true,
    size: 220,
  },
)

const cx = 110
const cy = 110
const r = 92

function norm(d: number): number {
  let x = d % 360
  if (x < 0) x += 360
  return x
}

function smallerArc(a: number, b: number): { start: number; sweep: number } {
  const A = norm(a)
  const B = norm(b)
  let d = (B - A + 360) % 360
  if (d > 180) {
    return { start: B, sweep: 360 - d }
  }
  return { start: A, sweep: d }
}

function polar(deg: number, radius: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

function arcPath(startDeg: number, sweep: number, radius: number): string {
  if (sweep <= 0.01) return ''
  const s = polar(startDeg, radius)
  const e = polar(startDeg + sweep, radius)
  const large = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z`
}

const hour = () => norm(props.hourDeg)
const minute = () => norm(props.minuteDeg)
const arc = () => smallerArc(hour(), minute())
const ticks = Array.from({ length: 12 }, (_, i) => i)
</script>

<template>
  <div class="clock-face" :style="{ maxWidth: `${size}px` }">
    <svg
      class="clock-face__svg"
      viewBox="0 0 220 220"
      role="img"
      :aria-label="timeLabel ? `钟面 ${timeLabel}` : '钟面示意'"
    >
      <circle cx="110" cy="110" :r="r" class="clock-face__disk" />
      <circle cx="110" cy="110" :r="r - 6" class="clock-face__inner" />

      <!-- 刻度 -->
      <g v-for="i in ticks" :key="i">
        <line
          :x1="polar(i * 30, r - 8).x"
          :y1="polar(i * 30, r - 8).y"
          :x2="polar(i * 30, i % 3 === 0 ? r - 22 : r - 16).x"
          :y2="polar(i * 30, i % 3 === 0 ? r - 22 : r - 16).y"
          class="clock-face__tick"
          :class="{ 'clock-face__tick--major': i % 3 === 0 }"
        />
        <text
          v-if="i % 3 === 0"
          :x="polar(i * 30, r - 34).x"
          :y="polar(i * 30, r - 34).y"
          class="clock-face__num"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ i === 0 ? 12 : i }}
        </text>
      </g>

      <!-- 夹角扇形 -->
      <path
        v-if="showArc && arc().sweep > 0.5"
        :d="arcPath(arc().start, arc().sweep, r * 0.55)"
        class="clock-face__arc"
      />

      <!-- 时针 -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="polar(hour(), 48).x"
        :y2="polar(hour(), 48).y"
        class="clock-face__hour"
      />
      <!-- 分针 -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="polar(minute(), 72).x"
        :y2="polar(minute(), 72).y"
        class="clock-face__minute"
      />
      <circle :cx="cx" :cy="cy" r="5" class="clock-face__hub" />

      <text v-if="timeLabel" x="110" y="198" text-anchor="middle" class="clock-face__time">
        {{ timeLabel }}
      </text>
    </svg>
    <p v-if="caption" class="clock-face__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.clock-face {
  margin: 0.65rem auto;
  width: 100%;
}
.clock-face__svg {
  display: block;
  width: 100%;
  height: auto;
}
.clock-face__disk {
  fill: #f8fafc;
  stroke: #0f766e;
  stroke-width: 3;
}
.clock-face__inner {
  fill: none;
  stroke: #99f6e4;
  stroke-width: 1;
}
.clock-face__tick {
  stroke: #64748b;
  stroke-width: 1.5;
  stroke-linecap: round;
}
.clock-face__tick--major {
  stroke: #0f766e;
  stroke-width: 2.5;
}
.clock-face__num {
  font-size: 11px;
  font-weight: 700;
  fill: #334155;
}
.clock-face__arc {
  fill: #5eead4;
  fill-opacity: 0.45;
  stroke: #0d9488;
  stroke-width: 1;
}
.clock-face__hour {
  stroke: #1e293b;
  stroke-width: 5;
  stroke-linecap: round;
}
.clock-face__minute {
  stroke: #0f766e;
  stroke-width: 3.2;
  stroke-linecap: round;
}
.clock-face__hub {
  fill: #0f766e;
}
.clock-face__time {
  font-size: 12px;
  font-weight: 700;
  fill: #0f766e;
}
.clock-face__caption {
  margin: 0.35rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
}
</style>
