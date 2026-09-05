<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DeepseekChatThread from '@/components/DeepseekChatThread.vue'
import { useDeepseekConversation } from '@/composables/app/useDeepseekConversation'
import { useTouchPrimaryDevice } from '@/composables/app/useTouchPointerDrag'
import { isAiChatConfigured, DEEPSEEK_NOT_CONFIGURED_HINT, requestAssistantMarkdown } from '@/services/deepseek'
import {
  aiProviderTick,
  getAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
  setAiProvider,
  type AiProvider,
} from '@/utils/app/aiProviderStore'
import { wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import type { FrontendHandoutItem } from '@/utils/frontend/frontendLearning'
import { stripHandoutImagesForAi } from '@/utils/frontend/frontendLearning'

export type FrontendAskQuestionContext = {
  fingerprint: string
  kindLabel: string
  stem: string
  options: string[]
  chosen: string
  correctText: string
  explanation: string
  correct: boolean
}

const STORAGE_KEY = 'qmea-computer-ask-layout-v5'
const DRAG_THRESHOLD_PX = 8
const MIN_PANEL_W = 260
const MIN_PANEL_H = 280
const WIDE_PANEL_W = 420
const WIDE_PANEL_MIN_W = 320
const WIDE_PANEL_MAX_W = 560
const TAB_EDGE = 10
const COMPACT_RESIZE_DIRS = ['n', 's'] as const
const WIDE_RESIZE_DIRS = ['n', 's', 'e', 'w'] as const

type ResizeDir = (typeof WIDE_RESIZE_DIRS)[number]
type DragKind = 'tab' | 'panel' | ResizeDir

type SavedLayout = {
  tabX?: number
  tabY?: number
  panelX?: number
  panelY?: number
  panelW?: number
  panelH?: number
}

const props = withDefaults(
  defineProps<{
    item: FrontendHandoutItem
    question?: FrontendAskQuestionContext | null
    askEnabled?: boolean
  }>(),
  {
    question: null,
    askEnabled: true,
  },
)

const { isWideLayout } = useTouchPrimaryDevice()

const keywordInput = ref('')
const panelOpen = ref(false)
const panelFullscreen = ref(false)
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
  const tabW = tabRef.value?.offsetWidth ?? 72
  return size.w > 0 && tabPos.x + tabW >= size.w - 6
})

const contextKey = computed(() =>
  props.question
    ? `computer-quiz-q:${props.question.fingerprint}`
    : `computer-handout:${props.item.id}`,
)
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
const inputRows = computed(() => {
  if (panelFullscreen.value) return isWideLayout.value ? 12 : 10
  return isWideLayout.value ? 4 : 3
})

const resizeDirs = computed(() => (isWideLayout.value ? WIDE_RESIZE_DIRS : COMPACT_RESIZE_DIRS))

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

const canAsk = computed(() => props.askEnabled !== false)

function stripAskHtml(s: string) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const systemPrompt = computed(() => {
  const q = props.question
  if (q) {
    const opts = q.options
      .map((opt, i) => `${i + 1}. ${stripAskHtml(opt)}`)
      .filter((line) => line.replace(/^\d+\.\s*/, ''))
      .join('\n')
    return [
      '你是前端学习知识助教。学员已经答完当前这道测验题，提问必须紧扣这道题。',
      '用简体中文、Markdown 作答：解释对错原因、易混概念、和正确答案的对应关系。不要另出新题，不要扯到无关章节。',
      '',
      `来源：${props.item.title}`,
      `题型：${q.kindLabel}`,
      `题干：${stripAskHtml(q.stem)}`,
      opts ? `选项：\n${opts}` : '',
      `学员作答：${stripAskHtml(q.chosen) || '（未记录）'}`,
      `对错：${q.correct ? '正确' : '错误'}`,
      `正确答案：${stripAskHtml(q.correctText)}`,
      q.explanation ? `解析：${stripAskHtml(q.explanation)}` : '',
    ]
      .filter((line) => line !== '')
      .join('\n')
  }
  const material = stripHandoutImagesForAi(props.item.content)
  return [
    '你是前端学习知识助教。学员提问必须紧扣当前讲义，用简体中文、Markdown 作答。',
    '优先点明核心考点、易错点和考试常见问法，不要脱离材料胡编。',
    '',
    `当前讲义：${props.item.title}`,
    '讲义正文（已去掉插图）：',
    material,
  ].join('\n')
})

let saved: SavedLayout = {}
let beforeFullscreen: { x: number; y: number; w: number; h: number } | null = null
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
  const tabW = tabRef.value?.offsetWidth ?? 72
  const tabH = tabRef.value?.offsetHeight ?? 44
  return {
    x: Math.max(0, w - tabW - TAB_EDGE),
    y: Math.max(0, h - tabH - 16),
  }
}

function defaultPanelBox() {
  const { w, h } = dockSize()
  const pad = 8
  const wide = isWideLayout.value
  const maxW = Math.max(MIN_PANEL_W, w - pad * 2)
  const width = wide
    ? clamp(WIDE_PANEL_W, Math.min(WIDE_PANEL_MIN_W, maxW), Math.min(WIDE_PANEL_MAX_W, maxW))
    : maxW
  const maxH = Math.max(MIN_PANEL_H, h - pad * 2)
  const want = wide ? Math.min(560, Math.round(h * 0.62)) : Math.round(h * 0.62)
  const height = clamp(want, Math.min(MIN_PANEL_H, maxH), maxH)
  return {
    x: wide ? Math.max(pad, w - pad - width) : pad,
    y: Math.max(pad, h - pad - height),
    w: width,
    h: height,
  }
}

function clampTab() {
  const { w, h } = dockSize()
  const tabW = tabRef.value?.offsetWidth ?? 72
  const tabH = tabRef.value?.offsetHeight ?? 44
  if (w <= 0 || h <= 0) return
  tabPos.x = clamp(tabPos.x, TAB_EDGE, Math.max(TAB_EDGE, w - tabW - TAB_EDGE))
  tabPos.y = clamp(tabPos.y, TAB_EDGE, Math.max(TAB_EDGE, h - tabH - TAB_EDGE))
}

function clampPanel() {
  const { w, h } = dockSize()
  if (w <= 0 || h <= 0) return
  if (panelFullscreen.value) {
    panelBox.x = 0
    panelBox.y = 0
    panelBox.w = w
    panelBox.h = h
    return
  }
  const pad = 8
  const wide = isWideLayout.value
  const maxH = Math.max(160, h - pad)
  const minH = Math.min(MIN_PANEL_H, maxH)
  const maxW = Math.max(MIN_PANEL_W, w - pad * 2)
  if (wide) {
    const minW = Math.min(WIDE_PANEL_MIN_W, maxW)
    const capW = Math.min(WIDE_PANEL_MAX_W, maxW)
    if (panelBox.w >= maxW - 4) {
      panelBox.w = clamp(WIDE_PANEL_W, minW, capW)
      panelBox.x = Math.max(pad, w - pad - panelBox.w)
    }
    panelBox.w = clamp(panelBox.w, minW, capW)
    panelBox.h = clamp(panelBox.h, minH, maxH)
    panelBox.x = clamp(panelBox.x, pad, Math.max(pad, w - pad - panelBox.w))
    panelBox.y = clamp(panelBox.y, pad, Math.max(pad, h - pad - panelBox.h))
    return
  }
  panelBox.w = maxW
  panelBox.h = clamp(panelBox.h, minH, maxH)
  panelBox.x = pad
  panelBox.y = clamp(panelBox.y, pad, Math.max(pad, h - pad - panelBox.h))
}

function toggleFullscreen() {
  if (!panelFullscreen.value) {
    beforeFullscreen = { x: panelBox.x, y: panelBox.y, w: panelBox.w, h: panelBox.h }
    panelFullscreen.value = true
    clampPanel()
    return
  }
  panelFullscreen.value = false
  if (beforeFullscreen) {
    Object.assign(panelBox, beforeFullscreen)
    beforeFullscreen = null
  }
  clampPanel()
}

function persist() {
  if (panelFullscreen.value) return
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
  const { w } = dockSize()
  const savedLooksLikeSheet =
    typeof saved.panelW === 'number' && (saved.panelW >= w - 24 || saved.panelW > WIDE_PANEL_MAX_W + 24)
  if (
    fromSaved &&
    !(isWideLayout.value && savedLooksLikeSheet) &&
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
    panelBox.y = orig.y + dy
    if (isWideLayout.value) panelBox.x = orig.x + dx
    clampPanel()
    return
  }
  let { x, y, w, h } = orig
  const dir = drag.kind
  if (dir.includes('e')) w = orig.w + dx
  if (dir.includes('w')) w = orig.w - dx
  if (dir.includes('s')) h = orig.h + dy
  if (dir.includes('n')) {
    h = orig.h - dy
    y = orig.y + dy
  }
  const size = dockSize()
  w = clamp(w, MIN_PANEL_W, Math.max(MIN_PANEL_W, size.w))
  h = clamp(h, Math.min(MIN_PANEL_H, Math.max(160, size.h)), Math.max(160, size.h))
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
  if (kind === 'tab' && !moved) {
    if (props.question && !canAsk.value) {
      ElMessage.info('本题答完后才能针对这道题提问')
      return
    }
    panelOpen.value = true
  }
}

function beginDrag(kind: DragKind, ev: PointerEvent) {
  if (panelFullscreen.value && kind !== 'tab') return
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
  if (props.question && !canAsk.value) {
    ElMessage.info('本题答完后才能针对这道题提问')
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

watch(
  () => props.question?.fingerprint,
  () => {
    panelOpen.value = false
    panelFullscreen.value = false
  },
)

watch(canAsk, (ok) => {
  if (!ok) {
    panelOpen.value = false
    panelFullscreen.value = false
  }
})

watch(panelOpen, async (open) => {
  if (!open) {
    panelFullscreen.value = false
    await nextTick()
    placeTab(true)
    return
  }
  await nextTick()
  placePanel(panelPlaced.value || (typeof saved.panelW === 'number' && saved.panelW > 0))
})

watch(isWideLayout, async () => {
  await nextTick()
  if (panelOpen.value) {
    if (!panelFullscreen.value) Object.assign(panelBox, defaultPanelBox())
    clampPanel()
  } else {
    clampTab()
  }
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
  <div ref="dockRef" class="computer-ask-dock" :class="{ 'is-dragging': dragging, 'is-wide': isWideLayout }">
    <button
      v-if="!panelOpen"
      ref="tabRef"
      type="button"
      class="computer-ask-tab"
      :class="{
        'is-placed': tabPlaced,
        'is-docked-right': tabDockedRight,
        'is-locked': Boolean(question) && !canAsk,
      }"
      :style="tabStyle"
      :aria-label="`打开 ${providerName} 询问，可拖动`"
      @pointerdown="beginDrag('tab', $event)"
    >
      <span class="computer-ask-tab__ring" aria-hidden="true" />
      <span class="computer-ask-tab__dot" aria-hidden="true" />
      <span class="computer-ask-tab__text">{{ question ? '问本题' : '问 AI' }}</span>
      <span v-if="badge" class="computer-ask-tab__badge">{{ badge > 9 ? '9+' : badge }}</span>
    </button>

    <aside
      v-else
      ref="panelRef"
      class="computer-ask"
      :class="{
        'is-placed': panelPlaced,
        'is-full': panelFullscreen,
        'has-chat': displayTurns.length,
      }"
      :style="panelStyle"
    >
      <template v-if="!panelFullscreen">
        <div
          v-for="dir in resizeDirs"
          :key="dir"
          class="computer-ask__resize"
          :class="`is-${dir}`"
          @pointerdown="beginDrag(dir, $event)"
        />
      </template>
      <div
        class="computer-ask__head"
        :class="{ 'is-static': panelFullscreen }"
        @pointerdown="beginDrag('panel', $event)"
      >
        <span class="computer-ask__grip" aria-hidden="true" />
        <span class="computer-ask__title">{{
          question ? `问本题 · ${providerName}` : `问 AI · ${providerName}`
        }}</span>
        <button type="button" class="computer-ask__toggle-act" @click.stop="toggleFullscreen">
          {{ panelFullscreen ? '退出全屏' : '全屏' }}
        </button>
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
          {{
            question
              ? '本题答完后可提问：为什么对/错、易混点、和解析怎么对应。只围绕当前这道题。'
              : '请围绕当前讲义提问；对话会保留上下文。需先在首页「设置」登录。'
          }}
        </p>
        <div class="computer-ask__thread">
          <DeepseekChatThread :turns="displayTurns" />
        </div>
        <div class="computer-ask__composer">
          <p v-if="error" class="computer-ask__error">{{ error }}</p>
          <el-input
            v-model="keywordInput"
            class="computer-ask__input"
            type="textarea"
            resize="none"
            :autosize="false"
            :rows="inputRows"
            maxlength="500"
            :disabled="loading || !aiReady || (Boolean(question) && !canAsk)"
            :placeholder="question ? '例如：为什么不选另一项、和××怎么区分…' : '例如：常见易错点、核心概念…'"
            @keydown.ctrl.enter="ask"
          />
          <div class="computer-ask__meta">
            <span>{{ remain }}/{{ MAX_LEN }}</span>
            <el-button
              type="primary"
              :loading="loading"
              :disabled="!aiReady || (Boolean(question) && !canAsk)"
              @click="ask"
            >
              向 {{ providerName }} 提问
            </el-button>
          </div>
          <p v-if="!aiReady" class="computer-ask__login">{{ DEEPSEEK_NOT_CONFIGURED_HINT }}</p>
        </div>
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
  right: 12px;
  bottom: 16px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  padding: 6px 10px 6px 9px;
  border: none;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #7dd3fc 0%, #3b82f6 48%, #1d4ed8 100%);
  box-shadow: 0 6px 14px rgb(37 99 235 / 32%);
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.02em;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.computer-ask-tab.is-placed {
  right: auto;
  bottom: auto;
}

.computer-ask-tab.is-docked-right {
  padding: 8px 7px 8px 9px;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 4px 12px rgb(37 99 235 / 22%);
}

.computer-ask-tab.is-docked-right .computer-ask-tab__ring,
.computer-ask-tab.is-docked-right .computer-ask-tab__dot {
  display: none;
}

.computer-ask-tab:active {
  cursor: grabbing;
}

.computer-ask-tab.is-locked {
  opacity: 0.62;
  filter: grayscale(0.25);
}

.computer-ask-tab__ring {
  position: absolute;
  inset: -3px 0 -3px -3px;
  border-radius: inherit;
  border: 1.5px solid rgb(125 211 252 / 0.7);
  pointer-events: none;
  animation: computer-ask-pulse 1.7s ease-out infinite;
}

.computer-ask-tab__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgb(255 255 255 / 18%);
}

.computer-ask-tab__text {
  position: relative;
}

.computer-ask-tab__badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ef4444;
  font-size: 10px;
  line-height: 16px;
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
  left: 8px;
  right: 8px;
  bottom: 8px;
  z-index: 13;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: min(280px, 100%);
  max-height: min(78vh, 640px);
  overflow: hidden;
  border: none;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(37 99 235 / 12%);
}

.computer-ask.is-placed {
  right: auto;
  bottom: auto;
}

.computer-ask.is-full {
  inset: 0;
  height: 100% !important;
  min-height: 0;
  max-height: none;
  border-radius: 0;
  box-shadow: none;
}

.computer-ask.has-chat:not(.is-full) {
  height: min(62vh, 520px);
  min-height: min(280px, 100%);
}

.computer-ask.is-full .computer-ask__head {
  border-radius: 0;
  cursor: default;
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
  top: 18px;
  bottom: 18px;
  width: 10px;
  cursor: ew-resize;
}

.computer-ask__resize.is-e {
  right: 0;
}

.computer-ask__resize.is-w {
  left: 0;
}

.computer-ask__composer {
  flex: 0 0 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid color-mix(in srgb, var(--app-border-soft) 70%, transparent);
  background: #fff;
}

.computer-ask.is-full .computer-ask__composer {
  flex: 1 1 auto;
  min-height: 160px;
}

.computer-ask.is-full.has-chat .computer-ask__composer {
  flex: 0 1 42%;
  min-height: 160px;
}

.computer-ask.is-full.has-chat .computer-ask__thread {
  flex: 1 1 58%;
}

.computer-ask__input {
  flex: 0 0 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.computer-ask.is-full .computer-ask__input {
  flex: 1 1 auto;
}

.computer-ask__input :deep(.el-textarea) {
  flex: 0 0 auto;
  min-height: 0;
}

.computer-ask.is-full .computer-ask__input :deep(.el-textarea) {
  flex: 1 1 auto;
  height: 100%;
}

.computer-ask__input :deep(.el-textarea__inner) {
  min-height: 72px !important;
  height: auto !important;
  resize: none;
}

.computer-ask.is-full .computer-ask__input :deep(.el-textarea__inner) {
  min-height: 160px !important;
  height: 100% !important;
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

.computer-ask__head.is-static,
.computer-ask__head.is-static:active {
  cursor: default;
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
  background: #fff;
}

.computer-ask__thread {
  display: none;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.computer-ask.has-chat .computer-ask__thread {
  display: block;
}

.computer-ask__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--app-text-muted);
}

.computer-ask__hint,
.computer-ask__login,
.computer-ask__error {
  margin: 0;
  flex: 0 1 auto;
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
  flex-wrap: wrap;
  gap: 8px;
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--app-text-muted);
}

@media (min-width: 901px) {
  .computer-ask:not(.is-full):not(.is-placed) {
    left: auto;
    right: 8px;
    width: min(420px, calc(100% - 16px));
    height: min(62vh, 560px);
    min-height: 320px;
    max-height: min(78vh, 720px);
  }

  .computer-ask.has-chat:not(.is-full):not(.is-placed) {
    height: min(68vh, 620px);
  }

  .computer-ask:not(.is-full) {
    box-shadow: 0 16px 40px rgb(15 23 42 / 16%);
  }

  .computer-ask-tab {
    bottom: 20px;
    padding: 8px 14px 8px 12px;
    font-size: 13px;
  }

  .computer-ask__input :deep(.el-textarea__inner) {
    min-height: 88px !important;
  }

  .computer-ask__meta {
    flex-wrap: nowrap;
  }
}
</style>
