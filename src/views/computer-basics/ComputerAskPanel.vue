<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DeepseekChatThread from '@/components/DeepseekChatThread.vue'
import { useDeepseekConversation } from '@/composables/useDeepseekConversation'
import { useTouchPrimaryDevice } from '@/composables/useTouchPointerDrag'
import { isAiChatConfigured, DEEPSEEK_NOT_CONFIGURED_HINT, requestAssistantMarkdown } from '@/services/deepseek'
import {
  aiProviderTick,
  getAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
  setAiProvider,
  type AiProvider,
} from '@/utils/aiProviderStore'
import { wenguAuthTick } from '@/utils/wenguAuthStore'
import type { ComputerHandoutItem } from '@/utils/computerBasics'
import { stripHandoutImagesForAi } from '@/utils/computerBasics'

const STORAGE_KEY = 'qmea-computer-ask-layout'
const DRAG_THRESHOLD_PX = 8
const MIN_PANEL_W = 260
const MIN_PANEL_H = 180
const RESIZE_DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const

type ResizeDir = (typeof RESIZE_DIRS)[number]
type DragKind = 'tab' | 'panel' | ResizeDir

type SavedLayout = {
  tabX?: number
  tabY?: number
  panelX?: number
  panelY?: number
  panelW?: number
  panelH?: number
}

const props = defineProps<{
  item: ComputerHandoutItem
}>()

const { isCompactLayout } = useTouchPrimaryDevice()

const keywordInput = ref('')
const panelOpen = ref(false)
const MAX_LEN = 500

const dockRef = ref<HTMLElement | null>(null)
const tabRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const tabPos = reactive({ x: 0, y: 0 })
const panelBox = reactive({ x: 0, y: 0, w: 0, h: 0 })
const tabPlaced = ref(false)
const panelPlaced = ref(false)
const dragging = ref(false)
const tabDockedRight = computed(() => {
  const size = dockSize()
  const tabW = tabRef.value?.offsetWidth ?? 96
  return size.w > 0 && tabPos.x + tabW >= size.w - 6
})

const contextKey = computed(() => `computer-handout:${props.item.id}`)
const {
  loading,
  error,
  hasStarted,
  displayTurns,
  start,
  followup,
} = useDeepseekConversation({ resetKey: contextKey })

const aiReady = computed(() => {
  void wenguAuthTick.value
  return isAiChatConfigured()
})

const remain = computed(() => keywordInput.value.length)
const providerName = computed(() => {
  void aiProviderTick.value
  return getAiProviderShortName()
})

const badge = computed(() => displayTurns.value.length)
const inputRows = computed(() => (isCompactLayout.value ? 2 : 3))

const aiProvider = computed({
  get() {
    void aiProviderTick.value
    return getAiProvider()
  },
  set(v: AiProvider) {
    setAiProvider(v)
    ElMessage.success(`已切换为 ${getAiProviderLabel(v)}`)
  },
})

const tabStyle = computed(() =>
  tabPlaced.value ? { left: `${tabPos.x}px`, top: `${tabPos.y}px` } : undefined,
)

const panelStyle = computed(() =>
  panelPlaced.value
    ? {
        left: `${panelBox.x}px`,
        top: `${panelBox.y}px`,
        width: `${panelBox.w}px`,
        height: `${panelBox.h}px`,
      }
    : undefined,
)

const systemPrompt = computed(() => {
  const material = stripHandoutImagesForAi(props.item.content)
  return [
    '你是计算机基础知识助教。学员提问必须紧扣当前讲义，用简体中文、Markdown 作答。',
    '优先点明核心考点、易错点和考试常见问法，不要脱离材料胡编。',
    '',
    `当前讲义：${props.item.title}`,
    '讲义正文（已去掉插图）：',
    material,
  ].join('\n')
})

let saved: SavedLayout = {}
let drag: {
  kind: DragKind
  pointerId: number
  startX: number
  startY: number
  orig: { x: number; y: number; w: number; h: number }
  moved: boolean
} | null = null
let resizeObserver: ResizeObserver | null = null

function dockSize() {
  const el = dockRef.value
  if (!el) return { w: 0, h: 0 }
  return { w: el.clientWidth, h: el.clientHeight }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function defaultTabPos() {
  const { w, h } = dockSize()
  const tabW = tabRef.value?.offsetWidth ?? 96
  const tabH = tabRef.value?.offsetHeight ?? 44
  return {
    x: Math.max(0, w - tabW),
    y: Math.max(0, h - tabH - 40),
  }
}

function defaultPanelBox() {
  const { w, h } = dockSize()
  const pad = 10
  const compact = isCompactLayout.value
  const width = compact ? Math.max(MIN_PANEL_W, w - pad * 2) : Math.min(440, Math.max(MIN_PANEL_W, w - pad * 2))
  const height = compact
    ? clamp(Math.round(h * 0.32), MIN_PANEL_H, Math.min(250, h - pad * 2))
    : clamp(Math.round(h * 0.42), MIN_PANEL_H, Math.min(400, h - pad * 2))
  return {
    x: Math.max(pad, w - pad - width),
    y: Math.max(pad, h - pad - height),
    w: width,
    h: height,
  }
}

function clampTab() {
  const { w, h } = dockSize()
  const tabW = tabRef.value?.offsetWidth ?? 96
  const tabH = tabRef.value?.offsetHeight ?? 44
  if (w <= 0 || h <= 0) return
  tabPos.x = clamp(tabPos.x, 0, Math.max(0, w - tabW))
  tabPos.y = clamp(tabPos.y, 0, Math.max(0, h - tabH))
}

function clampPanel() {
  const { w, h } = dockSize()
  if (w <= 0 || h <= 0) return
  panelBox.w = clamp(panelBox.w, MIN_PANEL_W, Math.max(MIN_PANEL_W, w))
  panelBox.h = clamp(panelBox.h, MIN_PANEL_H, Math.max(MIN_PANEL_H, h))
  panelBox.x = clamp(panelBox.x, 0, Math.max(0, w - panelBox.w))
  panelBox.y = clamp(panelBox.y, 0, Math.max(0, h - panelBox.h))
}

function persist() {
  saved = {
    tabX: tabPos.x,
    tabY: tabPos.y,
    panelX: panelBox.x,
    panelY: panelBox.y,
    panelW: panelBox.w,
    panelH: panelBox.h,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    /* ignore quota */
  }
}

function placeTab(fromSaved: boolean) {
  if (fromSaved && typeof saved.tabX === 'number' && typeof saved.tabY === 'number') {
    tabPos.x = saved.tabX
    tabPos.y = saved.tabY
  } else {
    Object.assign(tabPos, defaultTabPos())
  }
  clampTab()
  tabPlaced.value = true
}

function placePanel(fromSaved: boolean) {
  if (
    fromSaved &&
    typeof saved.panelX === 'number' &&
    typeof saved.panelY === 'number' &&
    typeof saved.panelW === 'number' &&
    typeof saved.panelH === 'number'
  ) {
    panelBox.x = saved.panelX
    panelBox.y = saved.panelY
    panelBox.w = saved.panelW
    panelBox.h = saved.panelH
  } else {
    Object.assign(panelBox, defaultPanelBox())
  }
  clampPanel()
  panelPlaced.value = true
}

function onPointerMove(ev: PointerEvent) {
  if (!drag || ev.pointerId !== drag.pointerId) return
  const dx = ev.clientX - drag.startX
  const dy = ev.clientY - drag.startY
  if (!drag.moved && dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
    drag.moved = true
    dragging.value = true
  }
  if (!drag.moved) return
  ev.preventDefault()
  const orig = drag.orig
  if (drag.kind === 'tab') {
    tabPos.x = orig.x + dx
    tabPos.y = orig.y + dy
    clampTab()
    return
  }
  if (drag.kind === 'panel') {
    panelBox.x = orig.x + dx
    panelBox.y = orig.y + dy
    clampPanel()
    return
  }
  let { x, y, w, h } = orig
  const dir = drag.kind
  if (dir.includes('e')) w = orig.w + dx
  if (dir.includes('s')) h = orig.h + dy
  if (dir.includes('w')) {
    w = orig.w - dx
    x = orig.x + dx
  }
  if (dir.includes('n')) {
    h = orig.h - dy
    y = orig.y + dy
  }
  const size = dockSize()
  w = clamp(w, MIN_PANEL_W, Math.max(MIN_PANEL_W, size.w))
  h = clamp(h, MIN_PANEL_H, Math.max(MIN_PANEL_H, size.h))
  if (dir.includes('w')) x = orig.x + orig.w - w
  if (dir.includes('n')) y = orig.y + orig.h - h
  panelBox.x = x
  panelBox.y = y
  panelBox.w = w
  panelBox.h = h
  clampPanel()
}

function endDrag(ev: PointerEvent) {
  if (!drag || ev.pointerId !== drag.pointerId) return
  const kind = drag.kind
  const moved = drag.moved
  drag = null
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  persist()
  if (kind === 'tab' && !moved) panelOpen.value = true
}

function beginDrag(kind: DragKind, ev: PointerEvent) {
  if (ev.button !== 0) return
  ev.preventDefault()
  ev.stopPropagation()
  const target = ev.currentTarget
  if (target instanceof HTMLElement) {
    try {
      target.setPointerCapture(ev.pointerId)
    } catch {
      /* already captured */
    }
  }
  drag = {
    kind,
    pointerId: ev.pointerId,
    startX: ev.clientX,
    startY: ev.clientY,
    orig:
      kind === 'tab'
        ? { x: tabPos.x, y: tabPos.y, w: 0, h: 0 }
        : { x: panelBox.x, y: panelBox.y, w: panelBox.w, h: panelBox.h },
    moved: false,
  }
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
}

async function ask() {
  const q = keywordInput.value.trim()
  if (!q) {
    ElMessage.warning('请先输入问题')
    return
  }
  if (!aiReady.value) {
    ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
    return
  }
  try {
    if (!hasStarted.value) {
      await start({
        initialUser: q,
        displayUser: q,
        system: systemPrompt.value,
        fetch: () =>
          requestAssistantMarkdown({
            system: systemPrompt.value,
            userMessage: q,
          }),
        displayUserLabel: '你的提问',
        displayAssistantLabel: providerName.value,
      })
    } else {
      await followup(q, { user: '你的追问', assistant: providerName.value })
    }
    keywordInput.value = ''
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '提问失败')
  }
}

watch(panelOpen, async (open) => {
  if (!open) {
    await nextTick()
    placeTab(true)
    return
  }
  await nextTick()
  placePanel(panelPlaced.value || (typeof saved.panelW === 'number' && saved.panelW > 0))
})

onMounted(async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) saved = JSON.parse(raw) as SavedLayout
  } catch {
    saved = {}
  }
  await nextTick()
  placeTab(typeof saved.tabX === 'number' && typeof saved.tabY === 'number')
  const dock = dockRef.value
  if (dock && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (panelOpen.value) clampPanel()
      else clampTab()
    })
    resizeObserver.observe(dock)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
})
</script>

<template>
  <div ref="dockRef" class="computer-ask-dock" :class="{ 'is-dragging': dragging }">
    <button
      v-if="!panelOpen"
      ref="tabRef"
      type="button"
      class="computer-ask-tab"
      :class="{ 'is-docked-right': tabDockedRight, 'is-placed': tabPlaced }"
      :style="tabStyle"
      :aria-label="`打开 ${providerName} 询问，可拖动`"
      @pointerdown="beginDrag('tab', $event)"
    >
      <span class="computer-ask-tab__ring" aria-hidden="true" />
      <span class="computer-ask-tab__dot" aria-hidden="true" />
      <span class="computer-ask-tab__text">问 AI</span>
      <span v-if="badge" class="computer-ask-tab__badge">{{ badge > 9 ? '9+' : badge }}</span>
    </button>

    <aside
      v-else
      ref="panelRef"
      class="computer-ask"
      :class="{ 'is-placed': panelPlaced }"
      :style="panelStyle"
    >
      <div
        v-for="dir in RESIZE_DIRS"
        :key="dir"
        class="computer-ask__resize"
        :class="`is-${dir}`"
        @pointerdown="beginDrag(dir, $event)"
      />
      <div class="computer-ask__head" @pointerdown="beginDrag('panel', $event)">
        <span class="computer-ask__grip" aria-hidden="true" />
        <span class="computer-ask__title">问 AI · {{ providerName }}</span>
        <button type="button" class="computer-ask__toggle-act" @click.stop="panelOpen = false">
          收起
        </button>
      </div>
      <div class="computer-ask__body">
        <div class="computer-ask__switch">
          <span>模型</span>
          <el-radio-group v-model="aiProvider" size="small">
            <el-radio-button value="deepseek">DeepSeek</el-radio-button>
            <el-radio-button value="doubao">豆包</el-radio-button>
          </el-radio-group>
        </div>
        <p class="computer-ask__hint">
          请围绕当前讲义提问；对话会保留上下文。需先在右上角「设置」登录。
        </p>
        <div class="computer-ask__thread">
          <DeepseekChatThread :turns="displayTurns" />
        </div>
        <p v-if="error" class="computer-ask__error">{{ error }}</p>
        <el-input
          v-model="keywordInput"
          type="textarea"
          :rows="inputRows"
          maxlength="500"
          :disabled="loading || !aiReady"
          placeholder="例如：常见易错点、核心概念…"
          @keydown.ctrl.enter="ask"
        />
        <div class="computer-ask__meta">
          <span>{{ remain }}/{{ MAX_LEN }}</span>
          <el-button type="primary" :loading="loading" :disabled="!aiReady" @click="ask">
            向 {{ providerName }} 提问
          </el-button>
        </div>
        <p v-if="!aiReady" class="computer-ask__login">{{ DEEPSEEK_NOT_CONFIGURED_HINT }}</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.computer-ask-dock {
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
}

.computer-ask-dock.is-dragging {
  cursor: grabbing;
}

.computer-ask-tab,
.computer-ask {
  pointer-events: auto;
}

.computer-ask-tab {
  position: absolute;
  right: 0;
  bottom: 40px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 11px 16px 11px 14px;
  border: none;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #7dd3fc 0%, #3b82f6 48%, #1d4ed8 100%);
  box-shadow: 0 10px 24px rgb(37 99 235 / 42%);
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.computer-ask-tab.is-placed {
  right: auto;
  bottom: auto;
}

.computer-ask-tab.is-docked-right {
  border-radius: 999px 0 0 999px;
}

.computer-ask-tab:active {
  cursor: grabbing;
}

.computer-ask-tab__ring {
  position: absolute;
  inset: -5px 0 -5px -5px;
  border-radius: inherit;
  border: 2px solid rgb(125 211 252 / 0.85);
  pointer-events: none;
  animation: computer-ask-pulse 1.7s ease-out infinite;
}

.computer-ask-tab__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgb(255 255 255 / 22%);
}

.computer-ask-tab__text {
  position: relative;
}

.computer-ask-tab__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  font-size: 11px;
  line-height: 18px;
}

@keyframes computer-ask-pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.08);
    opacity: 0;
  }
}

.computer-ask {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 13;
  display: flex;
  flex-direction: column;
  height: min(32vh, 250px);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, #2563eb 28%, var(--app-border-soft));
  border-radius: 12px;
  background: var(--app-surface);
  box-shadow: 0 10px 28px rgb(37 99 235 / 12%);
}

.computer-ask.is-placed {
  right: auto;
  bottom: auto;
}

.computer-ask__resize {
  position: absolute;
  z-index: 2;
  touch-action: none;
}

.computer-ask__resize.is-n,
.computer-ask__resize.is-s {
  left: 14px;
  right: 14px;
  height: 12px;
  cursor: ns-resize;
}

.computer-ask__resize.is-n {
  top: 0;
}

.computer-ask__resize.is-s {
  bottom: 0;
}

.computer-ask__resize.is-e,
.computer-ask__resize.is-w {
  top: 14px;
  bottom: 14px;
  width: 12px;
  cursor: ew-resize;
}

.computer-ask__resize.is-e {
  right: 0;
}

.computer-ask__resize.is-w {
  left: 0;
}

.computer-ask__resize.is-ne,
.computer-ask__resize.is-nw,
.computer-ask__resize.is-se,
.computer-ask__resize.is-sw {
  width: 18px;
  height: 18px;
}

.computer-ask__resize.is-ne {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}

.computer-ask__resize.is-nw {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.computer-ask__resize.is-se {
  right: 0;
  bottom: 0;
  cursor: nwse-resize;
}

.computer-ask__resize.is-sw {
  left: 0;
  bottom: 0;
  cursor: nesw-resize;
}

.computer-ask__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px 12px 0 0;
  color: #fff;
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 58%, #1d4ed8 100%);
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  text-align: left;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.computer-ask__head:active {
  cursor: grabbing;
}

.computer-ask__grip {
  width: 14px;
  height: 10px;
  flex: 0 0 auto;
  background:
    radial-gradient(circle, #dbeafe 1.2px, transparent 1.3px) 0 0 / 6px 5px,
    radial-gradient(circle, #dbeafe 1.2px, transparent 1.3px) 3px 5px / 6px 5px;
  opacity: 0.9;
}

.computer-ask__title {
  flex: 1 1 auto;
  min-width: 0;
}

.computer-ask__toggle-act {
  appearance: none;
  margin: 0;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  background: rgb(255 255 255 / 14%);
  font-size: 12px;
  font-weight: 600;
  color: #dbeafe;
  cursor: pointer;
}

.computer-ask__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px 14px 14px;
  overflow: hidden;
}

.computer-ask__thread {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.computer-ask__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.computer-ask__hint,
.computer-ask__login,
.computer-ask__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.computer-ask__error {
  color: var(--app-danger);
}

.computer-ask__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
}

@media (min-width: 901px) {
  .computer-ask {
    left: auto;
    width: 440px;
    height: min(42vh, 400px);
  }
}
</style>
