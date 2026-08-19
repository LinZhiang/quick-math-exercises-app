<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import mindmapUrl from '@/assets/quick-sense/system-management-mindmap.png'

const open = ref(false)
const isAppViewport = ref(false)

let mediaQuery: MediaQueryList | null = null

function syncAppViewport() {
  isAppViewport.value = Boolean(
    mediaQuery?.matches ||
      (typeof window !== 'undefined' &&
        ((window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
          window.matchMedia('(display-mode: standalone)').matches)),
  )
}

function show() {
  open.value = true
}

function hide() {
  open.value = false
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 640px)')
  syncAppViewport()
  mediaQuery.addEventListener('change', syncAppViewport)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncAppViewport)
})

const overlayClass = computed(() => ({
  'sm-mindmap-overlay': true,
  'sm-mindmap-overlay--app': isAppViewport.value,
}))

defineExpose({ show, hide, open })
</script>

<template>
  <button type="button" class="sm-mindmap-btn" @click="show">查看岗位思维导图</button>

  <Teleport to="body">
    <div
      v-if="open"
      :class="overlayClass"
      role="dialog"
      aria-modal="true"
      @click.self="hide"
    >
      <div class="sm-mindmap-dialog" :class="{ 'sm-mindmap-dialog--app': isAppViewport }">
        <div class="sm-mindmap-dialog__head">
          <div v-if="!isAppViewport">
            <p class="sm-mindmap-dialog__title">体制 + 企业通用管理层、内勤全岗位</p>
            <p class="sm-mindmap-dialog__sub">决策层 → 高管层 → 中层 → 文职支线 / 平行职能 → 基层科员</p>
          </div>
          <p v-else class="sm-mindmap-dialog__title sm-mindmap-dialog__title--app">岗位思维导图</p>
          <button type="button" class="sm-mindmap-dialog__close" @click="hide">关闭</button>
        </div>
        <div class="sm-mindmap-dialog__body" :class="{ 'sm-mindmap-dialog__body--app': isAppViewport }">
          <img
            class="sm-mindmap-dialog__img"
            :class="{ 'sm-mindmap-dialog__img--rotated': isAppViewport }"
            :src="mindmapUrl"
            alt="体制管理岗位思维导图"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sm-mindmap-btn {
  display: inline-flex;
  align-items: center;
  margin: 0.35rem 0 0.75rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #6b5b95 35%, var(--app-border-soft));
  background: color-mix(in srgb, #6b5b95 10%, var(--app-surface, #fff));
  color: #4a3f6b;
  font-size: 0.88rem;
  cursor: pointer;
}

.sm-mindmap-btn:hover {
  border-color: color-mix(in srgb, #6b5b95 55%, var(--app-border-soft));
}

.sm-mindmap-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(20, 18, 28, 0.55);
}

.sm-mindmap-overlay--app {
  padding: 0;
  background: #111;
}

.sm-mindmap-dialog {
  width: min(960px, 100%);
  max-height: min(92vh, 900px);
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: var(--app-surface, #fff);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.sm-mindmap-dialog--app {
  width: 100%;
  height: 100%;
  max-height: none;
  border-radius: 0;
  background: #0f0f10;
  box-shadow: none;
}

.sm-mindmap-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--app-border-soft, #e8e4ef);
}

.sm-mindmap-dialog--app .sm-mindmap-dialog__head {
  flex-shrink: 0;
  align-items: center;
  padding: 0.55rem 0.75rem;
  border-bottom-color: rgba(255, 255, 255, 0.12);
  background: #161618;
}

.sm-mindmap-dialog__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
  color: var(--app-text, #222);
}

.sm-mindmap-dialog__title--app {
  font-size: 0.9rem;
  color: #f3f3f3;
}

.sm-mindmap-dialog__sub {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: var(--app-text-muted, #666);
}

.sm-mindmap-dialog__close {
  flex-shrink: 0;
  border: 1px solid var(--app-border-soft, #ddd);
  background: transparent;
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  color: inherit;
}

.sm-mindmap-dialog--app .sm-mindmap-dialog__close {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f3f3f3;
}

.sm-mindmap-dialog__body {
  overflow: auto;
  padding: 0.75rem;
  background: #f4f1ea;
}

.sm-mindmap-dialog__body--app {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  background: #0f0f10;
}

.sm-mindmap-dialog__img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* 手机竖屏：整图旋转 90°，按视口最大边铺满，便于看清宽图 */
.sm-mindmap-dialog__img--rotated {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100dvh;
  height: 100dvw;
  max-width: none;
  border-radius: 0;
  object-fit: contain;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center center;
}
</style>
