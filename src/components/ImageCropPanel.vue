<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    confirmLabel?: string
    hint?: string
  }>(),
  {
    hint: '拖动或拉伸选框，只留下本题相关区域。多张照片会按顺序拼在一起识别。',
  },
)

const emit = defineEmits<{
  confirm: [dataUrl: string]
  recapture: []
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const box = reactive({ x: 0.06, y: 0.06, w: 0.88, h: 0.88 })
const display = reactive({ left: 0, top: 0, width: 0, height: 0 })

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
let dragging: { mode: DragMode; startX: number; startY: number; orig: typeof box } | null = null

function clampBox() {
  box.w = Math.min(1, Math.max(0.12, box.w))
  box.h = Math.min(1, Math.max(0.12, box.h))
  box.x = Math.min(1 - box.w, Math.max(0, box.x))
  box.y = Math.min(1 - box.h, Math.max(0, box.y))
}

function measure() {
  const img = imgRef.value
  const stage = stageRef.value
  if (!img || !stage || !img.naturalWidth) return
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const cw = stage.clientWidth
  const ch = stage.clientHeight
  const scale = Math.min(cw / nw, ch / nh)
  const width = nw * scale
  const height = nh * scale
  display.left = (cw - width) / 2
  display.top = (ch - height) / 2
  display.width = width
  display.height = height
}

function onPointerDown(mode: DragMode, ev: PointerEvent) {
  ev.preventDefault()
  ev.stopPropagation()
  dragging = {
    mode,
    startX: ev.clientX,
    startY: ev.clientY,
    orig: { x: box.x, y: box.y, w: box.w, h: box.h },
  }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(ev: PointerEvent) {
  if (!dragging || !display.width) return
  const dx = (ev.clientX - dragging.startX) / display.width
  const dy = (ev.clientY - dragging.startY) / display.height
  const o = dragging.orig
  if (dragging.mode === 'move') {
    box.x = o.x + dx
    box.y = o.y + dy
  } else {
    let x1 = o.x
    let y1 = o.y
    let x2 = o.x + o.w
    let y2 = o.y + o.h
    if (dragging.mode.includes('w')) x1 = o.x + dx
    if (dragging.mode.includes('e')) x2 = o.x + o.w + dx
    if (dragging.mode.includes('n')) y1 = o.y + dy
    if (dragging.mode.includes('s')) y2 = o.y + o.h + dy
    box.x = Math.min(x1, x2)
    box.y = Math.min(y1, y2)
    box.w = Math.abs(x2 - x1)
    box.h = Math.abs(y2 - y1)
  }
  clampBox()
}

function onPointerUp() {
  dragging = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

function exportCrop() {
  const img = imgRef.value
  if (!img?.naturalWidth) return
  const sx = Math.round(box.x * img.naturalWidth)
  const sy = Math.round(box.y * img.naturalHeight)
  const sw = Math.max(1, Math.round(box.w * img.naturalWidth))
  const sh = Math.max(1, Math.round(box.h * img.naturalHeight))
  const maxEdge = 1600
  const scale = Math.min(1, maxEdge / Math.max(sw, sh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sw * scale))
  canvas.height = Math.max(1, Math.round(sh * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  emit('confirm', canvas.toDataURL('image/jpeg', 0.86))
}

onMounted(() => {
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  onPointerUp()
})
</script>

<template>
  <div class="crop">
    <p class="crop__hint">{{ hint }}</p>
    <div ref="stageRef" class="crop__stage">
      <img
        ref="imgRef"
        :src="src"
        alt="待裁切"
        class="crop__img"
        draggable="false"
        @load="measure"
      >
      <div
        class="crop__frame"
        :style="{
          left: `${display.left}px`,
          top: `${display.top}px`,
          width: `${display.width}px`,
          height: `${display.height}px`,
        }"
      >
        <div class="crop__mask" />
        <div
          class="crop__box"
          :style="{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
          }"
          @pointerdown="onPointerDown('move', $event)"
        >
          <button
            v-for="h in ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e']"
            :key="h"
            type="button"
            class="crop__handle"
            :class="`is-${h}`"
            aria-label="调整裁切"
            @pointerdown="onPointerDown(h as DragMode, $event)"
          />
        </div>
      </div>
    </div>
    <div class="crop__actions">
      <el-button @click="emit('recapture')">去掉这张</el-button>
      <el-button type="primary" @click="exportCrop">{{ confirmLabel || '确认裁切' }}</el-button>
    </div>
  </div>
</template>

<style scoped>
.crop__hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.crop__stage {
  position: relative;
  height: min(58vh, 520px);
  overflow: hidden;
  border-radius: 12px;
  background: #0f172a;
  touch-action: none;
  user-select: none;
}

.crop__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.crop__frame {
  position: absolute;
  pointer-events: none;
}

.crop__box {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgb(15 23 42 / 45%);
  cursor: move;
  pointer-events: auto;
}

.crop__handle {
  appearance: none;
  -webkit-appearance: none;
  position: absolute;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 2px;
  background: var(--el-color-primary);
  pointer-events: auto;
}

.crop__handle.is-nw { left: -7px; top: -7px; cursor: nwse-resize; }
.crop__handle.is-ne { right: -7px; top: -7px; cursor: nesw-resize; }
.crop__handle.is-sw { left: -7px; bottom: -7px; cursor: nesw-resize; }
.crop__handle.is-se { right: -7px; bottom: -7px; cursor: nwse-resize; }
.crop__handle.is-n { left: 50%; top: -7px; transform: translateX(-50%); cursor: ns-resize; }
.crop__handle.is-s { left: 50%; bottom: -7px; transform: translateX(-50%); cursor: ns-resize; }
.crop__handle.is-w { left: -7px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
.crop__handle.is-e { right: -7px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }

.crop__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
