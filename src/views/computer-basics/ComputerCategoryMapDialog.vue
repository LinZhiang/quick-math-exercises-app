<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  defaultExpandedCategoryIds,
  type ComputerTreeEntry,
  type ComputerTreeNode,
} from '@/utils/computer/computerBasics'

const props = defineProps<{
  modelValue: boolean
  tree: ComputerTreeNode[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

type MapSource = {
  id: string
  name: string
  expandable: boolean
  children: MapSource[]
}

type Visible = MapSource & {
  y: number
  x0: number
  x1: number
  kids: Visible[]
}

type Rail = {
  id: string
  name: string
  depth: number
  color: string
  leaf: boolean
  expandable: boolean
  opened: boolean
  cx: number
  cy: number
  x0: number
  labelX: number
  labelY: number
}

type Fork = {
  d: string
  color: string
}

const ROOT_ID = '__computer-root__'
const COLORS = ['#3b82f6', '#f97316', '#22c55e'] as const
const CHAR_W = 13
const LINE_PAD = 18
const V_GAP = 58
const PAD = 36
const BRANCH = 26
const CIRCLE_R = 6.5

const expanded = ref<Record<string, boolean>>({})
const viewportRef = ref<HTMLElement | null>(null)
const panX = ref(0)
const panY = ref(0)
const scale = ref(1)
const dragging = ref(false)
const didDrag = ref(false)
const pointers = new Map<number, { x: number; y: number }>()
let pinchStart = { dist: 0, scale: 1, cx: 0, cy: 0 }

let dragStart = { x: 0, y: 0, panX: 0, panY: 0 }
let pendingLock: { id: string; sx: number; sy: number } | null = null

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const layout = computed(() => layoutMindmap(props.tree, expanded.value))

const stageStyle = computed(() => ({
  width: `${layout.value.width}px`,
  height: `${layout.value.height}px`,
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
}))

function colorAt(depth: number) {
  return COLORS[Math.min(Math.max(depth, 0), COLORS.length - 1)]
}

function labelWidth(name: string) {
  return Math.max(84, [...name].length * CHAR_W + LINE_PAD * 2)
}

function entrySource(entry: ComputerTreeEntry): MapSource {
  return {
    id: `entry:${entry.id}`,
    name: entry.title,
    expandable: false,
    children: [],
  }
}

function nodeSource(node: ComputerTreeNode): MapSource {
  return {
    id: node.id,
    name: node.name,
    expandable: node.children.length > 0 || node.entries.length > 0,
    children: [...node.children.map(nodeSource), ...node.entries.map(entrySource)],
  }
}

function visibleKids(node: MapSource, openMap: Record<string, boolean>): MapSource[] {
  if (!node.expandable) return []
  if (openMap[node.id]) return node.children
  return []
}

function toVisible(nodes: MapSource[], openMap: Record<string, boolean>): Visible[] {
  return nodes.map((node) => ({
    ...node,
    kids: toVisible(visibleKids(node, openMap), openMap),
    y: 0,
    x0: 0,
    x1: 0,
  }))
}

function layoutMindmap(tree: ComputerTreeNode[], openMap: Record<string, boolean>) {
  const source: MapSource = {
    id: ROOT_ID,
    name: '计算机基础',
    expandable: tree.length > 0,
    children: tree.map(nodeSource),
  }
  const root: Visible = {
    ...source,
    kids: openMap[ROOT_ID] === false ? [] : toVisible(source.children, openMap),
    y: 0,
    x0: 0,
    x1: 0,
  }

  let leaf = 0
  const placeCross = (node: Visible) => {
    if (!node.kids.length) {
      node.y = PAD + 18 + leaf * V_GAP
      leaf += 1
      return
    }
    node.kids.forEach(placeCross)
    node.y = (node.kids[0].y + node.kids[node.kids.length - 1].y) / 2
  }
  placeCross(root)

  const placeAlong = (node: Visible, start: number) => {
    node.x0 = start
    node.x1 = start + labelWidth(node.name)
    for (const kid of node.kids) {
      const split = node.kids.length > 1 || Math.abs(kid.y - node.y) > 0.5
      placeAlong(kid, split ? node.x1 + BRANCH * 2 : node.x1)
    }
  }
  placeAlong(root, PAD)

  const rails: Rail[] = []
  const forks: Fork[] = []

  const walk = (node: Visible, depth: number, parent?: Visible) => {
    const expandable = node.expandable
    rails.push({
      id: node.id,
      name: node.name,
      depth,
      color: expandable ? colorAt(depth) : COLORS[2],
      leaf: !expandable,
      expandable,
      opened: node.kids.length > 0,
      cx: node.x1,
      cy: node.y,
      x0: node.x0,
      labelX: (node.x0 + node.x1) / 2,
      labelY: node.y - 10,
    })
    if (parent) {
      const split = parent.kids.length > 1 || Math.abs(node.y - parent.y) > 0.5
      const stroke = colorAt(Math.min(depth, 2))
      if (!split) {
        forks.push({ d: `M ${parent.x1} ${parent.y} L ${node.x1} ${node.y}`, color: stroke })
      } else {
        const mx = parent.x1 + BRANCH
        forks.push({
          d: `M ${parent.x1} ${parent.y} C ${mx} ${parent.y}, ${mx} ${node.y}, ${parent.x1 + BRANCH * 2} ${node.y} L ${node.x1} ${node.y}`,
          color: stroke,
        })
      }
    } else {
      forks.push({ d: `M ${node.x0} ${node.y} L ${node.x1} ${node.y}`, color: colorAt(0) })
    }
    node.kids.forEach((kid) => walk(kid, depth + 1, node))
  }
  walk(root, 0)

  return {
    rails,
    forks,
    width: Math.max(320, ...rails.map((r) => r.cx + 48)),
    height: Math.max(220, PAD + Math.max(leaf, 1) * V_GAP + 24),
  }
}

function fitToView() {
  const el = viewportRef.value
  if (!el) return
  const pad = 28
  const vw = Math.max(el.clientWidth - pad, 80)
  const vh = Math.max(el.clientHeight - pad, 80)
  const lw = layout.value.width
  const lh = layout.value.height
  const next = Math.min(vw / lw, vh / lh, 1.35)
  scale.value = Math.max(0.2, next)
  panX.value = (el.clientWidth - lw * scale.value) / 2
  panY.value = (el.clientHeight - lh * scale.value) / 2
}

function lockCamera(id: string) {
  const rail = layout.value.rails.find((r) => r.id === id)
  if (!rail) return
  pendingLock = {
    id,
    sx: panX.value + rail.cx * scale.value,
    sy: panY.value + rail.cy * scale.value,
  }
}

watch(
  layout,
  () => {
    const lock = pendingLock
    if (!lock) return
    pendingLock = null
    const rail = layout.value.rails.find((r) => r.id === lock.id)
    if (!rail) return
    panX.value = lock.sx - rail.cx * scale.value
    panY.value = lock.sy - rail.cy * scale.value
  },
  { flush: 'sync' },
)

function toggleRail(rail: Rail) {
  if (!rail.expandable || didDrag.value) return
  lockCamera(rail.id)
  const cur = rail.id === ROOT_ID ? expanded.value[ROOT_ID] !== false : Boolean(expanded.value[rail.id])
  expanded.value = { ...expanded.value, [rail.id]: !cur }
}

function resetTwoLevels() {
  lockCamera(ROOT_ID)
  expanded.value = { [ROOT_ID]: true, ...defaultExpandedCategoryIds(props.tree, 2) }
}

function collapseAll() {
  lockCamera(ROOT_ID)
  expanded.value = { [ROOT_ID]: true }
}

function onPointerDown(ev: PointerEvent) {
  if (ev.button !== 0 && ev.pointerType === 'mouse') return
  const el = ev.currentTarget as HTMLElement
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  try {
    el.setPointerCapture(ev.pointerId)
  } catch {
    /* ignore */
  }
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinchStart = {
      dist: pointerDist(a!, b!),
      scale: scale.value,
      cx: (a!.x + b!.x) / 2,
      cy: (a!.y + b!.y) / 2,
    }
    dragging.value = false
    return
  }
  dragging.value = true
  didDrag.value = false
  dragStart = { x: ev.clientX, y: ev.clientY, panX: panX.value, panY: panY.value }
}

function onPointerMove(ev: PointerEvent) {
  if (!pointers.has(ev.pointerId)) return
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  if (pointers.size >= 2) {
    const el = viewportRef.value
    if (!el || pinchStart.dist < 8) return
    const [a, b] = [...pointers.values()]
    const dist = pointerDist(a!, b!)
    const rect = el.getBoundingClientRect()
    zoomAt(pinchStart.cx - rect.left, pinchStart.cy - rect.top, pinchStart.scale * (dist / pinchStart.dist))
    didDrag.value = true
    return
  }
  if (!dragging.value) return
  const dx = ev.clientX - dragStart.x
  const dy = ev.clientY - dragStart.y
  if (Math.abs(dx) + Math.abs(dy) > 6) didDrag.value = true
  panX.value = dragStart.panX + dx
  panY.value = dragStart.panY + dy
}

function onPointerUp(ev: PointerEvent) {
  pointers.delete(ev.pointerId)
  dragging.value = pointers.size === 1
  try {
    ;(ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId)
  } catch {
    /* already released */
  }
}

function onWheel(ev: WheelEvent) {
  ev.preventDefault()
  const el = viewportRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, scale.value * (ev.deltaY > 0 ? 0.9 : 1.1))
}

function zoomAt(cx: number, cy: number, next: number) {
  const prev = scale.value
  const clamped = Math.min(2.8, Math.max(0.2, next))
  if (clamped === prev) return
  panX.value = cx - ((cx - panX.value) / prev) * clamped
  panY.value = cy - ((cy - panY.value) / prev) * clamped
  scale.value = clamped
}

function bumpZoom(dir: 1 | -1) {
  const el = viewportRef.value
  if (!el) return
  zoomAt(el.clientWidth / 2, el.clientHeight / 2, scale.value * (dir > 0 ? 1.18 : 0.85))
}

function pointerDist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

watch(
  () => [props.modelValue, props.tree] as const,
  ([isOpen]) => {
    if (!isOpen) return
    expanded.value = { [ROOT_ID]: true, ...defaultExpandedCategoryIds(props.tree, 2) }
  },
)

function onOpened() {
  void nextTick(() => {
    requestAnimationFrame(() => fitToView())
  })
}
</script>

<template>
  <el-dialog
    v-model="open"
    title="分类分布"
    width="min(96vw, 1080px)"
    align-center
    @opened="onOpened"
  >
    <p class="cmap-hint">默认两层。拖动画布查看；点右侧节点折叠/展开。双指或按钮缩放。</p>
    <div class="cmap-toolbar">
      <el-button size="small" @click="resetTwoLevels">展开两层</el-button>
      <el-button size="small" @click="collapseAll">只留一层</el-button>
      <el-button size="small" @click="fitToView">适应窗口</el-button>
      <el-button size="small" @click="bumpZoom(-1)">缩小</el-button>
      <el-button size="small" @click="bumpZoom(1)">放大</el-button>
    </div>
    <div v-if="!tree.length" class="cmap-empty">暂无分类</div>
    <div
      v-else
      ref="viewportRef"
      class="cmap-board"
      :class="{ 'is-dragging': dragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    >
      <svg
        class="cmap-svg"
        :viewBox="`0 0 ${layout.width} ${layout.height}`"
        :width="layout.width"
        :height="layout.height"
        :style="stageStyle"
        role="img"
        aria-label="计算机基础分类思维导图"
      >
        <path
          v-for="(fork, i) in layout.forks"
          :key="`f-${i}`"
          class="cmap-link"
          :d="fork.d"
          :stroke="fork.color"
          fill="none"
        />
        <g
          v-for="rail in layout.rails"
          :key="rail.id"
          class="cmap-node"
        >
          <title>{{ rail.name }}</title>
          <text class="cmap-label" :x="rail.labelX" :y="rail.labelY" text-anchor="middle">
            {{ rail.name }}
          </text>
          <g
            v-if="rail.expandable"
            class="cmap-hit"
            @pointerdown.stop
            @click.stop="toggleRail(rail)"
          >
            <circle
              class="cmap-hit__pad"
              :cx="rail.cx"
              :cy="rail.cy"
              r="14"
              fill="transparent"
            />
            <circle
              class="cmap-circle is-toggle"
              :cx="rail.cx"
              :cy="rail.cy"
              :r="rail.depth === 0 ? 7 : CIRCLE_R"
              :fill="rail.opened ? '#fff' : rail.color"
              :stroke="rail.color"
            />
            <text
              v-if="!rail.opened"
              class="cmap-plus"
              :x="rail.cx"
              :y="rail.cy + 4"
              text-anchor="middle"
            >
              +
            </text>
          </g>
          <circle
            v-else
            class="cmap-circle"
            :cx="rail.cx"
            :cy="rail.cy"
            :r="CIRCLE_R"
            :fill="rail.color"
            :stroke="rail.color"
          />
        </g>
      </svg>
    </div>
  </el-dialog>
</template>

<style scoped>
.cmap-hint {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cmap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.cmap-empty {
  padding: 20px 0;
  color: var(--app-text-muted);
}

.cmap-board {
  position: relative;
  height: min(62vh, 520px);
  min-height: 280px;
  overflow: hidden;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: #fff;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.cmap-board.is-dragging {
  cursor: grabbing;
}

.cmap-svg {
  display: block;
  transform-origin: 0 0;
  pointer-events: auto;
}

.cmap-link {
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}

.cmap-label {
  font-size: 13px;
  font-weight: 650;
  fill: #334155;
}

.cmap-circle {
  stroke-width: 2.3;
  pointer-events: none;
}

.cmap-hit {
  cursor: pointer;
}

.cmap-plus {
  font-size: 11px;
  font-weight: 800;
  fill: #fff;
  pointer-events: none;
}
</style>
