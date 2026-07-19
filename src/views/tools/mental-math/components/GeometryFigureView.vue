<script setup lang="ts">
import { computed } from 'vue'
import type { GeometryFigureSpec } from '@/utils/geometryPractice'

const props = defineProps<{
  figure: GeometryFigureSpec
}>()

const title = computed(() => {
  const map: Record<string, string> = {
    triangle: '三角形',
    square: '正方形',
    rectangle: '长方形',
    trapezoid: '梯形',
    circle: '圆形',
    cube: '正方体',
    cuboid: '长方体',
    sphere: '球体',
    cylinder: '圆柱体',
    cone: '圆锥体',
    'cut-fill': '组合图形（割补）',
    'box-change': '长方体示意',
    'right-triangle': '直角三角形',
    'similar-a': 'A 型相似（平行截线）',
    'similar-x': 'X 型相似（沙漏）',
    'similar-measure': '测高（竹竿）',
    'cube-paint-net': '正方体展开染色',
  }
  return map[props.figure.kind] ?? '几何图形'
})

function num(...keys: string[]): number | null {
  for (const k of keys) {
    const v = Number(props.figure.labels[k])
    if (Number.isFinite(v) && v > 0) return v
  }
  return null
}

/** 符号只标字母；数值标 a=8 */
function lab(key: string, value: string | undefined): string {
  if (value == null || value === '') return ''
  const v = value.trim()
  if (v === key || /^[a-zA-Z]$/.test(v)) return v
  return `${key}=${v}`
}

function fitScale(maxW: number, maxH: number, w: number, h: number): number {
  return Math.min(maxW / Math.max(w, 0.01), maxH / Math.max(h, 0.01))
}

/** 底边 a + 两侧 b、c：用余弦定理定位顶点 */
const triangleLayout = computed(() => {
  const a = num('a') ?? 10
  const b = num('b')
  const c = num('c')
  const hOnly = num('h')

  const padX = 36
  const padY = 28
  const maxW = 320 - padX * 2
  const maxH = 220 - padY * 2 - 24

  // 仅底与高（面积题）
  if (hOnly != null && (b == null || c == null)) {
    const scale = fitScale(maxW, maxH, a, hOnly)
    const base = a * scale
    const height = hOnly * scale
    const x0 = (320 - base) / 2
    const yBase = 28 + height + 8
    const apexX = x0 + base / 2
    const apexY = yBase - height
    const footX = apexX
    return {
      points: `${x0},${yBase} ${x0 + base},${yBase} ${apexX},${apexY}`,
      heightLine: { x1: apexX, y1: apexY, x2: footX, y2: yBase },
      labels: {
        a: { x: x0 + base / 2, y: yBase + 22 },
        h: { x: apexX + 14, y: (apexY + yBase) / 2 },
        b: null as { x: number; y: number } | null,
        c: null as { x: number; y: number } | null,
      },
    }
  }

  const bb = b ?? a * 0.9
  const cc = c ?? a * 0.85
  // 余弦定理：角 A 对边 a… 以底 a 放在 x 轴，顶点相对 B、C
  // 顶点到左端距离用边 c，到右端用边 b
  let cosC = (a * a + cc * cc - bb * bb) / (2 * a * cc)
  cosC = Math.max(-1, Math.min(1, cosC))
  const sinC = Math.sqrt(Math.max(0, 1 - cosC * cosC))
  // 左端 (0,0)，右端 (a,0)，顶点 (cc*cosC, cc*sinC) 若从左端沿 c
  // 标准：B 左、C 右、A 上。边 BC=a，AB=c，AC=b
  const Ax = cc * cosC
  const Ay = cc * sinC
  // 若高度为 0（退化），兜底
  const Hx = Ay < 0.01 ? a / 2 : Ax
  const Hy = Ay < 0.01 ? a * 0.6 : Ay

  const scale = fitScale(maxW, maxH, a, Hy)
  const x0 = (320 - a * scale) / 2
  const yBase = 28 + Hy * scale + 8
  const Bx = x0
  const By = yBase
  const Cx = x0 + a * scale
  const Cy = yBase
  const Tx = x0 + Hx * scale
  const Ty = yBase - Hy * scale
  // 高的垂足：从 T 向 BC 作垂线
  const footX = Tx
  const midAB = { x: (Bx + Tx) / 2, y: (By + Ty) / 2 }
  const midAC = { x: (Cx + Tx) / 2, y: (Cy + Ty) / 2 }

  return {
    points: `${Bx},${By} ${Cx},${Cy} ${Tx},${Ty}`,
    heightLine: hOnly != null || props.figure.labels.h
      ? { x1: Tx, y1: Ty, x2: footX, y2: yBase }
      : null,
    labels: {
      a: { x: (Bx + Cx) / 2, y: yBase + 22 },
      h: props.figure.labels.h ? { x: footX + 14, y: (Ty + yBase) / 2 } : null,
      b: props.figure.labels.b ? { x: midAC.x + 10, y: midAC.y } : null,
      c: props.figure.labels.c ? { x: midAB.x - 10, y: midAB.y } : null,
    },
  }
})

const rectLayout = computed(() => {
  const a = num('a') ?? 12
  const b = num('b') ?? 6
  const scale = fitScale(240, 140, a, b)
  const w = a * scale
  const h = b * scale
  const x = (320 - w) / 2
  const y = (200 - h) / 2 + 4
  return { x, y, w, h, labA: { x: x + w / 2, y: y + h + 22 }, labB: { x: x - 18, y: y + h / 2 } }
})

const squareLayout = computed(() => {
  const a = num('a') ?? 8
  const scale = fitScale(160, 160, a, a)
  const s = a * scale
  const x = (320 - s) / 2
  const y = (200 - s) / 2
  return { x, y, s, labA: { x: x + s / 2, y: y + s + 22 } }
})

const trapLayout = computed(() => {
  const top = num('a') ?? 5
  const bot = num('b') ?? 12
  const hh = num('h') ?? 6
  const scale = fitScale(240, 130, Math.max(top, bot), hh)
  const tw = top * scale
  const bw = bot * scale
  const height = hh * scale
  const xBot = (320 - bw) / 2
  const yBot = 36 + height
  const xTop = xBot + (bw - tw) / 2
  const yTop = yBot - height
  const cx = 320 / 2
  return {
    points: `${xTop},${yTop} ${xTop + tw},${yTop} ${xBot + bw},${yBot} ${xBot},${yBot}`,
    heightLine: { x1: cx, y1: yTop, x2: cx, y2: yBot },
    labA: { x: cx, y: yTop - 12 },
    labB: { x: cx, y: yBot + 22 },
    labH: { x: cx + 14, y: (yTop + yBot) / 2 },
    labC: { x: xTop + tw + 18, y: (yTop + yBot) / 2 },
    labD: { x: xTop - 18, y: (yTop + yBot) / 2 },
  }
})

const circleLayout = computed(() => {
  const r = num('r') ?? 5
  const scale = fitScale(140, 140, r * 2, r * 2)
  const rr = r * scale
  const cx = 160
  const cy = 105
  return {
    cx,
    cy,
    r: rr,
    radiusEnd: { x: cx + rr, y: cy },
    labR: { x: cx + rr * 0.45, y: cy - 12 },
    labD: { x: cx, y: cy + rr + 24 },
  }
})

const cylinderLayout = computed(() => {
  const r = num('r') ?? 3
  const h = num('h') ?? 6
  const diam = r * 2
  const scale = fitScale(200, 150, diam, h)
  const rx = r * scale
  const height = h * scale
  const ry = Math.max(8, Math.min(22, rx * 0.32))
  const cx = 160
  const topY = 28 + ry
  const botY = topY + height
  return {
    cx,
    topY,
    botY,
    rx,
    ry,
    left: cx - rx,
    right: cx + rx,
    labR: { x: cx, y: topY - ry - 6 },
    labH: { x: cx + rx + 18, y: (topY + botY) / 2 },
  }
})

const coneLayout = computed(() => {
  const r = num('r') ?? 4
  const h = num('h') ?? 8
  const scale = fitScale(180, 150, r * 2, h)
  const rx = r * scale
  const height = h * scale
  const ry = Math.max(8, Math.min(22, rx * 0.3))
  const cx = 160
  const baseY = 28 + height + ry
  const apexY = baseY - height
  return {
    cx,
    baseY,
    apexY,
    rx,
    ry,
    labH: { x: cx + 14, y: (apexY + baseY) / 2 },
    labR: { x: cx + rx * 0.55, y: baseY + ry + 16 },
  }
})

const rightTriLayout = computed(() => {
  const a = num('a') ?? 3 // 竖直角边
  const b = num('b') ?? 4 // 水平直角边
  const scale = fitScale(200, 140, b, a)
  const w = b * scale
  const h = a * scale
  const x0 = (320 - w) / 2 - 10
  const y0 = 28 + h
  const mark = Math.min(16, w * 0.12, h * 0.12)
  return {
    points: `${x0},${y0} ${x0},${y0 - h} ${x0 + w},${y0}`,
    mark: `M ${x0} ${y0 - mark} L ${x0 + mark} ${y0 - mark} L ${x0 + mark} ${y0}`,
    labA: { x: x0 - 16, y: y0 - h / 2 },
    labB: { x: x0 + w / 2, y: y0 + 22 },
    labC: { x: x0 + w * 0.55, y: y0 - h * 0.55 },
  }
})

/** A 型：大三角形 ABC，DE // BC */
const similarALayout = computed(() => {
  const Ax = 160
  const Ay = 28
  const Bx = 40
  const By = 200
  const Cx = 280
  const Cy = 200
  const t = 0.45
  const Dx = Ax + (Bx - Ax) * t
  const Dy = Ay + (By - Ay) * t
  const Ex = Ax + (Cx - Ax) * t
  const Ey = Ay + (Cy - Ay) * t
  return {
    big: `${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`,
    de: { x1: Dx, y1: Dy, x2: Ex, y2: Ey },
    labA: { x: Ax, y: Ay - 6 },
    labB: { x: Bx - 10, y: By + 18 },
    labC: { x: Cx + 10, y: Cy + 18 },
    labD: { x: Dx - 14, y: Dy + 4 },
    labE: { x: Ex + 14, y: Ey + 4 },
  }
})

/** X 型：AB // CD，对角线 AD、BC 交于 E ⇒ △ABE ∼ △CDE */
const similarXLayout = computed(() => {
  const A = { x: 70, y: 40 }
  const B = { x: 250, y: 40 }
  const C = { x: 90, y: 200 }
  const D = { x: 230, y: 200 }
  const E = { x: 160, y: 120 }
  return {
    ab: { x1: A.x, y1: A.y, x2: B.x, y2: B.y },
    cd: { x1: C.x, y1: C.y, x2: D.x, y2: D.y },
    ad: { x1: A.x, y1: A.y, x2: D.x, y2: D.y },
    bc: { x1: B.x, y1: B.y, x2: C.x, y2: C.y },
    labA: { x: A.x - 8, y: A.y - 4 },
    labB: { x: B.x + 8, y: B.y - 4 },
    labC: { x: C.x - 8, y: C.y + 18 },
    labD: { x: D.x + 8, y: D.y + 18 },
    labE: { x: E.x + 12, y: E.y + 4 },
  }
})

/** 测高：眼 A、竿 BN、树 CM，视线过 B 到 C */
const similarMeasureLayout = computed(() => {
  const eye = { x: 36, y: 168 }
  const N = { x: 100, y: 200 }
  const M = { x: 280, y: 200 }
  const B = { x: 100, y: 120 }
  const C = { x: 280, y: 36 }
  return {
    ground: { x1: 20, y1: 200, x2: 300, y2: 200 },
    pole: { x1: N.x, y1: N.y, x2: B.x, y2: B.y },
    tree: { x1: M.x, y1: M.y, x2: C.x, y2: C.y },
    sight: { x1: eye.x, y1: eye.y, x2: C.x, y2: C.y },
    labA: { x: eye.x - 4, y: eye.y - 8 },
    labB: { x: B.x + 12, y: B.y + 4 },
    labC: { x: C.x + 12, y: C.y + 8 },
    labN: { x: N.x - 2, y: N.y + 18 },
    labM: { x: M.x - 2, y: M.y + 18 },
  }
})

/** 正方体表面展开：十字网，按格子染色类别着色 */
const cubePaintNetLayout = computed(() => {
  const n = Math.min(6, Math.max(3, Math.round(num('n') ?? 4)))
  const cell = Math.min(16, Math.floor(300 / (4 * n + 1)))
  const faceW = n * cell
  const ox = (320 - 4 * faceW) / 2
  const oy = (210 - 3 * faceW) / 2 + 4

  type Cell = { x: number; y: number; s: number; kind: '3' | '2' | '1' }
  const cells: Cell[] = []

  function paintKind(i: number, j: number): '3' | '2' | '1' {
    const onEdge = i === 0 || i === n - 1 || j === 0 || j === n - 1
    if (!onEdge) return '1'
    const corner = (i === 0 || i === n - 1) && (j === 0 || j === n - 1)
    return corner ? '3' : '2'
  }

  function addFace(fx: number, fy: number) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        cells.push({
          x: fx + j * cell,
          y: fy + i * cell,
          s: cell,
          kind: paintKind(i, j),
        })
      }
    }
  }

  // 十字：上 / 左-前-右-后 / 下
  addFace(ox + faceW, oy)
  addFace(ox, oy + faceW)
  addFace(ox + faceW, oy + faceW)
  addFace(ox + 2 * faceW, oy + faceW)
  addFace(ox + 3 * faceW, oy + faceW)
  addFace(ox + faceW, oy + 2 * faceW)

  const fill = { '3': '#dc2626', '2': '#ea580c', '1': '#fbbf24' } as const
  return {
    cells: cells.map((c) => ({ ...c, fill: fill[c.kind] })),
    legend: [
      { fill: fill['3'], label: '三面', x: ox + 4, y: oy + 18 },
      { fill: fill['2'], label: '两面', x: ox + 4, y: oy + 38 },
      { fill: fill['1'], label: '一面', x: ox + 4, y: oy + 58 },
    ],
    nLabel: { x: 160, y: Math.max(12, oy - 4), text: `n=${n} 展开图` },
  }
})

const cuboidLayout = computed(() => {
  const a = num('a') ?? 6 // 长
  const b = num('b') ?? a // 宽（正方体/未给宽时与长相同）
  const c = num('c') ?? num('h') ?? a // 高
  const scale = fitScale(90, 70, Math.max(a, b), c) * 0.9
  const dx = a * scale * 0.85
  const dy = b * scale * 0.45
  const dz = c * scale
  const ox = 100
  const oy = 150
  const p = (x: number, y: number, z: number) => ({
    x: ox + x * 0.9 + y * 0.55,
    y: oy - z - y * 0.35,
  })
  const A = p(0, 0, 0)
  const B = p(dx, 0, 0)
  const C = p(dx, dy, 0)
  const E = p(0, 0, dz)
  const F = p(dx, 0, dz)
  const G = p(dx, dy, dz)
  const H = p(0, dy, dz)
  const poly = (pts: { x: number; y: number }[]) => pts.map((q) => `${q.x},${q.y}`).join(' ')
  return {
    top: poly([H, G, F, E]),
    left: poly([E, F, B, A]),
    right: poly([F, G, C, B]),
    labA: { x: (E.x + F.x) / 2, y: Math.min(E.y, F.y) - 10 },
    labB: { x: (A.x + E.x) / 2 - 16, y: (A.y + E.y) / 2 },
    labC: { x: (B.x + F.x) / 2 + 14, y: (B.y + F.y) / 2 },
    labH: props.figure.labels.h
      ? { x: (B.x + F.x) / 2 + 14, y: (B.y + F.y) / 2 }
      : null,
  }
})

const cutFillLayout = computed(() => {
  const big = num('big') ?? 8
  const small = num('small') ?? 5
  const scale = fitScale(240, 150, big + small, big)
  const bs = big * scale
  const ss = small * scale
  const x0 = (320 - (bs + ss)) / 2
  const y0 = (210 - bs) / 2
  return {
    big: { x: x0, y: y0, s: bs },
    small: { x: x0 + bs, y: y0 + (bs - ss), s: ss },
    shade: `${x0},${y0} ${x0 + bs},${y0 + bs} ${x0 + bs + ss},${y0 + bs} ${x0 + bs},${y0}`,
    labBig: { x: x0 + bs / 2, y: y0 - 10 },
    labSmall: { x: x0 + bs + ss / 2, y: y0 + (bs - ss) - 10 },
  }
})
</script>

<template>
  <div class="geo-fig" role="img" :aria-label="title">
    <p class="geo-fig__caption">{{ title }}<span v-if="figure.note"> · {{ figure.note }}</span></p>
    <svg class="geo-fig__svg" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
      <!-- triangle -->
      <g v-if="figure.kind === 'triangle'">
        <polygon
          :points="triangleLayout.points"
          fill="#ecfdf5"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <line
          v-if="triangleLayout.heightLine"
          :x1="triangleLayout.heightLine.x1"
          :y1="triangleLayout.heightLine.y1"
          :x2="triangleLayout.heightLine.x2"
          :y2="triangleLayout.heightLine.y2"
          stroke="#ea580c"
          stroke-width="1.5"
          stroke-dasharray="4 3"
        />
        <text
          :x="triangleLayout.labels.a.x"
          :y="triangleLayout.labels.a.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('a', figure.labels.a) }}
        </text>
        <text
          v-if="triangleLayout.labels.h"
          :x="triangleLayout.labels.h.x"
          :y="triangleLayout.labels.h.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('h', figure.labels.h) }}
        </text>
        <text
          v-if="triangleLayout.labels.b"
          :x="triangleLayout.labels.b.x"
          :y="triangleLayout.labels.b.y"
          class="geo-fig__lab"
        >
          {{ lab('b', figure.labels.b) }}
        </text>
        <text
          v-if="triangleLayout.labels.c"
          :x="triangleLayout.labels.c.x"
          :y="triangleLayout.labels.c.y"
          class="geo-fig__lab"
        >
          {{ lab('c', figure.labels.c) }}
        </text>
      </g>

      <!-- square -->
      <g v-else-if="figure.kind === 'square'">
        <rect
          :x="squareLayout.x"
          :y="squareLayout.y"
          :width="squareLayout.s"
          :height="squareLayout.s"
          fill="#eff6ff"
          stroke="#1d4ed8"
          stroke-width="2.5"
        />
        <text
          :x="squareLayout.labA.x"
          :y="squareLayout.labA.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('a', figure.labels.a) }}
        </text>
      </g>

      <!-- rectangle -->
      <g v-else-if="figure.kind === 'rectangle'">
        <rect
          :x="rectLayout.x"
          :y="rectLayout.y"
          :width="rectLayout.w"
          :height="rectLayout.h"
          fill="#f0fdfa"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <text
          :x="rectLayout.labA.x"
          :y="rectLayout.labA.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('a', figure.labels.a) }}
        </text>
        <text
          :x="rectLayout.labB.x"
          :y="rectLayout.labB.y"
          text-anchor="middle"
          class="geo-fig__lab"
          :transform="`rotate(-90 ${rectLayout.labB.x} ${rectLayout.labB.y})`"
        >
          {{ lab('b', figure.labels.b) }}
        </text>
      </g>

      <!-- trapezoid -->
      <g v-else-if="figure.kind === 'trapezoid'">
        <polygon
          :points="trapLayout.points"
          fill="#fff7ed"
          stroke="#c2410c"
          stroke-width="2.5"
        />
        <line
          v-if="figure.labels.h"
          :x1="trapLayout.heightLine.x1"
          :y1="trapLayout.heightLine.y1"
          :x2="trapLayout.heightLine.x2"
          :y2="trapLayout.heightLine.y2"
          stroke="#ea580c"
          stroke-dasharray="4 3"
        />
        <text :x="trapLayout.labA.x" :y="trapLayout.labA.y" text-anchor="middle" class="geo-fig__lab">
          {{ lab('a', figure.labels.a) }}
        </text>
        <text :x="trapLayout.labB.x" :y="trapLayout.labB.y" text-anchor="middle" class="geo-fig__lab">
          {{ lab('b', figure.labels.b) }}
        </text>
        <text
          v-if="figure.labels.h"
          :x="trapLayout.labH.x"
          :y="trapLayout.labH.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('h', figure.labels.h) }}
        </text>
        <text v-if="figure.labels.c" :x="trapLayout.labC.x" :y="trapLayout.labC.y" class="geo-fig__lab">
          {{ lab('c', figure.labels.c) }}
        </text>
        <text v-if="figure.labels.d" :x="trapLayout.labD.x" :y="trapLayout.labD.y" class="geo-fig__lab">
          {{ lab('d', figure.labels.d) }}
        </text>
      </g>

      <!-- circle -->
      <g v-else-if="figure.kind === 'circle'">
        <circle
          :cx="circleLayout.cx"
          :cy="circleLayout.cy"
          :r="circleLayout.r"
          fill="#ecfdf5"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <line
          :x1="circleLayout.cx"
          :y1="circleLayout.cy"
          :x2="circleLayout.radiusEnd.x"
          :y2="circleLayout.radiusEnd.y"
          stroke="#ea580c"
          stroke-width="2"
        />
        <circle :cx="circleLayout.cx" :cy="circleLayout.cy" r="3" fill="#ea580c" />
        <text
          :x="circleLayout.labR.x"
          :y="circleLayout.labR.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('r', figure.labels.r) }}
        </text>
        <text
          v-if="figure.labels.d"
          :x="circleLayout.labD.x"
          :y="circleLayout.labD.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('d', figure.labels.d) }}
        </text>
      </g>

      <!-- cube / box-change -->
      <g v-else-if="figure.kind === 'cube' || figure.kind === 'box-change'">
        <polygon :points="cuboidLayout.top" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
        <polygon :points="cuboidLayout.left" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
        <polygon :points="cuboidLayout.right" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2" />
        <text :x="cuboidLayout.labA.x" :y="cuboidLayout.labA.y" text-anchor="middle" class="geo-fig__lab">
          {{ lab('a', figure.labels.a) }}
        </text>
        <text
          v-if="figure.labels.h"
          :x="(cuboidLayout.labH ?? cuboidLayout.labC).x"
          :y="(cuboidLayout.labH ?? cuboidLayout.labC).y"
          class="geo-fig__lab"
        >
          {{ lab('h', figure.labels.h) }}
        </text>
        <text v-if="figure.labels.cut" x="40" y="205" class="geo-fig__lab geo-fig__lab--accent">
          高减 {{ figure.labels.cut }}
        </text>
      </g>

      <!-- cuboid -->
      <g v-else-if="figure.kind === 'cuboid'">
        <polygon :points="cuboidLayout.top" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
        <polygon :points="cuboidLayout.left" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
        <polygon :points="cuboidLayout.right" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2" />
        <text :x="cuboidLayout.labA.x" :y="cuboidLayout.labA.y" text-anchor="middle" class="geo-fig__lab">
          {{ lab('a', figure.labels.a) }}
        </text>
        <text :x="cuboidLayout.labB.x" :y="cuboidLayout.labB.y" class="geo-fig__lab">
          {{ lab('b', figure.labels.b) }}
        </text>
        <text :x="cuboidLayout.labC.x" :y="cuboidLayout.labC.y" class="geo-fig__lab">
          {{ lab('c', figure.labels.c) }}
        </text>
      </g>

      <!-- sphere -->
      <g v-else-if="figure.kind === 'sphere'">
        <ellipse
          :cx="circleLayout.cx"
          :cy="circleLayout.cy"
          :rx="circleLayout.r"
          :ry="circleLayout.r * 0.96"
          fill="#ecfdf5"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <ellipse
          :cx="circleLayout.cx"
          :cy="circleLayout.cy"
          :rx="circleLayout.r"
          :ry="circleLayout.r * 0.38"
          fill="none"
          stroke="#0d9488"
          stroke-width="1.5"
        />
        <line
          :x1="circleLayout.cx"
          :y1="circleLayout.cy"
          :x2="circleLayout.radiusEnd.x"
          :y2="circleLayout.cy - 12"
          stroke="#ea580c"
          stroke-width="2"
        />
        <text
          :x="circleLayout.labR.x"
          :y="circleLayout.labR.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('r', figure.labels.r) }}
        </text>
      </g>

      <!-- cylinder -->
      <g v-else-if="figure.kind === 'cylinder'">
        <ellipse
          :cx="cylinderLayout.cx"
          :cy="cylinderLayout.topY"
          :rx="cylinderLayout.rx"
          :ry="cylinderLayout.ry"
          fill="#dbeafe"
          stroke="#1d4ed8"
          stroke-width="2"
        />
        <path
          :d="`M${cylinderLayout.left},${cylinderLayout.topY} L${cylinderLayout.left},${cylinderLayout.botY} A${cylinderLayout.rx},${cylinderLayout.ry} 0 0 0 ${cylinderLayout.right},${cylinderLayout.botY} L${cylinderLayout.right},${cylinderLayout.topY}`"
          fill="#eff6ff"
          stroke="#1d4ed8"
          stroke-width="2"
        />
        <ellipse
          :cx="cylinderLayout.cx"
          :cy="cylinderLayout.botY"
          :rx="cylinderLayout.rx"
          :ry="cylinderLayout.ry"
          fill="#bfdbfe"
          stroke="#1d4ed8"
          stroke-width="2"
        />
        <text
          :x="cylinderLayout.labH.x"
          :y="cylinderLayout.labH.y"
          class="geo-fig__lab"
        >
          {{ lab('h', figure.labels.h) }}
        </text>
        <text
          :x="cylinderLayout.labR.x"
          :y="cylinderLayout.labR.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('r', figure.labels.r) }}
        </text>
      </g>

      <!-- cone -->
      <g v-else-if="figure.kind === 'cone'">
        <ellipse
          :cx="coneLayout.cx"
          :cy="coneLayout.baseY"
          :rx="coneLayout.rx"
          :ry="coneLayout.ry"
          fill="#bfdbfe"
          stroke="#1d4ed8"
          stroke-width="2"
        />
        <path
          :d="`M${coneLayout.cx - coneLayout.rx},${coneLayout.baseY} L${coneLayout.cx},${coneLayout.apexY} L${coneLayout.cx + coneLayout.rx},${coneLayout.baseY}`"
          fill="#eff6ff"
          stroke="#1d4ed8"
          stroke-width="2"
        />
        <line
          :x1="coneLayout.cx"
          :y1="coneLayout.apexY"
          :x2="coneLayout.cx"
          :y2="coneLayout.baseY"
          stroke="#ea580c"
          stroke-dasharray="4 3"
        />
        <text
          :x="coneLayout.labH.x"
          :y="coneLayout.labH.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('h', figure.labels.h) }}
        </text>
        <text :x="coneLayout.labR.x" :y="coneLayout.labR.y" class="geo-fig__lab">
          {{ lab('r', figure.labels.r) }}
        </text>
      </g>

      <!-- cut-fill -->
      <g v-else-if="figure.kind === 'cut-fill'">
        <rect
          :x="cutFillLayout.big.x"
          :y="cutFillLayout.big.y"
          :width="cutFillLayout.big.s"
          :height="cutFillLayout.big.s"
          fill="#e0f2fe"
          stroke="#0284c7"
          stroke-width="2"
        />
        <rect
          :x="cutFillLayout.small.x"
          :y="cutFillLayout.small.y"
          :width="cutFillLayout.small.s"
          :height="cutFillLayout.small.s"
          fill="#fef3c7"
          stroke="#d97706"
          stroke-width="2"
        />
        <polygon
          :points="cutFillLayout.shade"
          fill="color-mix(in srgb, #0d9488 35%, transparent)"
          stroke="#0f766e"
          stroke-width="2"
        />
        <text
          :x="cutFillLayout.labBig.x"
          :y="cutFillLayout.labBig.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ figure.labels.big }}
        </text>
        <text
          :x="cutFillLayout.labSmall.x"
          :y="cutFillLayout.labSmall.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ figure.labels.small }}
        </text>
      </g>

      <!-- right triangle -->
      <g v-else-if="figure.kind === 'right-triangle'">
        <polygon
          :points="rightTriLayout.points"
          fill="#ecfdf5"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <path :d="rightTriLayout.mark" fill="none" stroke="#ea580c" stroke-width="2" />
        <text
          v-if="figure.labels.a"
          :x="rightTriLayout.labA.x"
          :y="rightTriLayout.labA.y"
          class="geo-fig__lab"
        >
          {{ lab('a', figure.labels.a) }}
        </text>
        <text
          v-if="figure.labels.b"
          :x="rightTriLayout.labB.x"
          :y="rightTriLayout.labB.y"
          text-anchor="middle"
          class="geo-fig__lab"
        >
          {{ lab('b', figure.labels.b) }}
        </text>
        <text
          v-if="figure.labels.c"
          :x="rightTriLayout.labC.x"
          :y="rightTriLayout.labC.y"
          class="geo-fig__lab geo-fig__lab--accent"
        >
          {{ lab('c', figure.labels.c) }}
        </text>
      </g>

      <!-- A-shape similar -->
      <g v-else-if="figure.kind === 'similar-a'">
        <polygon
          :points="similarALayout.big"
          fill="#ecfdf5"
          stroke="#0f766e"
          stroke-width="2.5"
        />
        <line
          :x1="similarALayout.de.x1"
          :y1="similarALayout.de.y1"
          :x2="similarALayout.de.x2"
          :y2="similarALayout.de.y2"
          stroke="#ea580c"
          stroke-width="2.5"
        />
        <text :x="similarALayout.labA.x" :y="similarALayout.labA.y" text-anchor="middle" class="geo-fig__lab">
          {{ figure.labels.A || 'A' }}
        </text>
        <text :x="similarALayout.labB.x" :y="similarALayout.labB.y" class="geo-fig__lab">
          {{ figure.labels.B || 'B' }}
        </text>
        <text :x="similarALayout.labC.x" :y="similarALayout.labC.y" class="geo-fig__lab">
          {{ figure.labels.C || 'C' }}
        </text>
        <text :x="similarALayout.labD.x" :y="similarALayout.labD.y" class="geo-fig__lab geo-fig__lab--accent">
          {{ figure.labels.D || 'D' }}
        </text>
        <text :x="similarALayout.labE.x" :y="similarALayout.labE.y" class="geo-fig__lab geo-fig__lab--accent">
          {{ figure.labels.E || 'E' }}
        </text>
      </g>

      <!-- X-shape similar -->
      <g v-else-if="figure.kind === 'similar-x'">
        <line
          v-for="(seg, i) in [similarXLayout.ab, similarXLayout.cd, similarXLayout.ad, similarXLayout.bc]"
          :key="i"
          :x1="seg.x1"
          :y1="seg.y1"
          :x2="seg.x2"
          :y2="seg.y2"
          :stroke="i < 2 ? '#ea580c' : '#0f766e'"
          :stroke-width="i < 2 ? 2.5 : 2"
        />
        <text :x="similarXLayout.labA.x" :y="similarXLayout.labA.y" class="geo-fig__lab">
          {{ figure.labels.A || 'A' }}
        </text>
        <text :x="similarXLayout.labB.x" :y="similarXLayout.labB.y" class="geo-fig__lab">
          {{ figure.labels.B || 'B' }}
        </text>
        <text :x="similarXLayout.labC.x" :y="similarXLayout.labC.y" class="geo-fig__lab">
          {{ figure.labels.C || 'C' }}
        </text>
        <text :x="similarXLayout.labD.x" :y="similarXLayout.labD.y" class="geo-fig__lab">
          {{ figure.labels.D || 'D' }}
        </text>
        <text :x="similarXLayout.labE.x" :y="similarXLayout.labE.y" class="geo-fig__lab geo-fig__lab--accent">
          {{ figure.labels.E || 'E' }}
        </text>
      </g>

      <!-- measure tree/pole -->
      <g v-else-if="figure.kind === 'similar-measure'">
        <line
          :x1="similarMeasureLayout.ground.x1"
          :y1="similarMeasureLayout.ground.y1"
          :x2="similarMeasureLayout.ground.x2"
          :y2="similarMeasureLayout.ground.y2"
          stroke="#64748b"
          stroke-width="2"
        />
        <line
          :x1="similarMeasureLayout.pole.x1"
          :y1="similarMeasureLayout.pole.y1"
          :x2="similarMeasureLayout.pole.x2"
          :y2="similarMeasureLayout.pole.y2"
          stroke="#0f766e"
          stroke-width="3"
        />
        <line
          :x1="similarMeasureLayout.tree.x1"
          :y1="similarMeasureLayout.tree.y1"
          :x2="similarMeasureLayout.tree.x2"
          :y2="similarMeasureLayout.tree.y2"
          stroke="#0f766e"
          stroke-width="3"
        />
        <line
          :x1="similarMeasureLayout.sight.x1"
          :y1="similarMeasureLayout.sight.y1"
          :x2="similarMeasureLayout.sight.x2"
          :y2="similarMeasureLayout.sight.y2"
          stroke="#ea580c"
          stroke-width="2"
          stroke-dasharray="6 4"
        />
        <circle
          :cx="similarMeasureLayout.labA.x + 4"
          :cy="similarMeasureLayout.labA.y + 8"
          r="4"
          fill="#ea580c"
        />
        <text :x="similarMeasureLayout.labA.x" :y="similarMeasureLayout.labA.y" class="geo-fig__lab">
          {{ figure.labels.A || 'A' }}
        </text>
        <text :x="similarMeasureLayout.labB.x" :y="similarMeasureLayout.labB.y" class="geo-fig__lab">
          {{ figure.labels.B || 'B' }}
        </text>
        <text :x="similarMeasureLayout.labC.x" :y="similarMeasureLayout.labC.y" class="geo-fig__lab">
          {{ figure.labels.C || 'C' }}
        </text>
        <text :x="similarMeasureLayout.labN.x" :y="similarMeasureLayout.labN.y" text-anchor="middle" class="geo-fig__lab">
          {{ figure.labels.N || 'N' }}
        </text>
        <text :x="similarMeasureLayout.labM.x" :y="similarMeasureLayout.labM.y" text-anchor="middle" class="geo-fig__lab">
          {{ figure.labels.M || 'M' }}
        </text>
      </g>

      <!-- cube paint net -->
      <g v-else-if="figure.kind === 'cube-paint-net'">
        <text
          :x="cubePaintNetLayout.nLabel.x"
          :y="cubePaintNetLayout.nLabel.y"
          text-anchor="middle"
          class="geo-fig__lab"
          style="font-size: 14px"
        >
          {{ cubePaintNetLayout.nLabel.text }}
        </text>
        <rect
          v-for="(c, i) in cubePaintNetLayout.cells"
          :key="i"
          :x="c.x"
          :y="c.y"
          :width="c.s - 0.8"
          :height="c.s - 0.8"
          :fill="c.fill"
          stroke="#fff"
          stroke-width="0.6"
        />
        <g v-for="(L, i) in cubePaintNetLayout.legend" :key="'leg' + i">
          <rect :x="L.x" :y="L.y - 10" width="12" height="12" :fill="L.fill" rx="2" />
          <text :x="L.x + 16" :y="L.y" class="geo-fig__lab" style="font-size: 13px; stroke-width: 2px">
            {{ L.label }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.geo-fig {
  margin: 0 0 14px;
  padding: 10px 12px 8px;
  border-radius: 12px;
  background: linear-gradient(160deg, #f8fafc, #f0fdfa 60%, #eff6ff);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
}

.geo-fig__caption {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #0f766e;
  text-align: center;
}

.geo-fig__svg {
  display: block;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  height: auto;
}

.geo-fig__lab {
  font-size: 20px;
  font-weight: 800;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  fill: #0f172a;
  stroke: #ffffff;
  stroke-width: 4px;
  paint-order: stroke fill;
  stroke-linejoin: round;
}

.geo-fig__lab--accent {
  fill: #9a3412;
  stroke: #fff7ed;
  stroke-width: 4px;
}
</style>
