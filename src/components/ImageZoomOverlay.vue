<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  src: string
}>()

const emit = defineEmits<{
  close: []
}>()

const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
const dragging = ref(false)

let drag = { x: 0, y: 0, panX: 0, panY: 0 }
const pointers = new Map<number, { x: number; y: number }>()
let pinch = { dist: 0, scale: 1, panX: 0, panY: 0, midX: 0, midY: 0 }

const imgStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
}))

function clampScale(v: number) {
  return Math.min(6, Math.max(0.4, v))
}

function close() {
  emit('close')
}

function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') close()
}

function pointerList() {
  return [...pointers.values()]
}

function distOf(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function onPointerDown(ev: PointerEvent) {
  if (ev.button !== 0 && ev.pointerType === 'mouse') return
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
  const pts = pointerList()
  if (pts.length >= 2) {
    dragging.value = false
    pinch = {
      dist: distOf(pts[0], pts[1]),
      scale: scale.value,
      panX: panX.value,
      panY: panY.value,
      midX: (pts[0].x + pts[1].x) / 2,
      midY: (pts[0].y + pts[1].y) / 2,
    }
    return
  }
  dragging.value = true
  drag = { x: ev.clientX, y: ev.clientY, panX: panX.value, panY: panY.value }
}

function onPointerMove(ev: PointerEvent) {
  if (!pointers.has(ev.pointerId)) return
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY })
  const pts = pointerList()
  if (pts.length >= 2 && pinch.dist > 0) {
    const d = distOf(pts[0], pts[1])
    scale.value = clampScale(pinch.scale * (d / pinch.dist))
    return
  }
  if (!dragging.value) return
  panX.value = drag.panX + (ev.clientX - drag.x)
  panY.value = drag.panY + (ev.clientY - drag.y)
}

function onPointerUp(ev: PointerEvent) {
  pointers.delete(ev.pointerId)
  if (pointers.size < 2) pinch.dist = 0
  if (pointers.size === 0) dragging.value = false
  try {
    ;(ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId)
  } catch {
    /* already released */
  }
}

function onWheel(ev: WheelEvent) {
  ev.preventDefault()
  const prev = scale.value
  const next = clampScale(prev * (ev.deltaY > 0 ? 0.9 : 1.12))
  if (next === prev) return
  const cx = ev.clientX - window.innerWidth / 2
  const cy = ev.clientY - window.innerHeight / 2
  panX.value = cx - ((cx - panX.value) / prev) * next
  panY.value = cy - ((cy - panY.value) / prev) * next
  scale.value = next
}

function resetView() {
  scale.value = 1
  panX.value = 0
  panY.value = 0
}

watch(
  () => props.src,
  () => resetView(),
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="img-zoom"
      role="dialog"
      aria-modal="true"
      aria-label="查看图片"
      @wheel="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <button type="button" class="img-zoom__close" @click="close">关闭</button>
      <p class="img-zoom__hint">双指或滚轮缩放，拖动可移动</p>
      <img class="img-zoom__img" :src="src" alt="" :style="imgStyle" draggable="false" />
    </div>
  </Teleport>
</template>

<style scoped>
.img-zoom {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(8, 12, 20, 0.88);
  touch-action: none;
  user-select: none;
  cursor: grab;
}

.img-zoom__close {
  position: absolute;
  top: calc(10px + var(--app-safe-top, 0px));
  right: 12px;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;
  cursor: pointer;
}

.img-zoom__hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(14px + var(--app-safe-bottom, 0px));
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  pointer-events: none;
}

.img-zoom__img {
  max-width: min(92vw, 1100px);
  max-height: min(84vh, 860px);
  transform-origin: center center;
  pointer-events: none;
}
</style>
