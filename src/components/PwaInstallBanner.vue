<script setup lang="ts">
import { ref } from 'vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const dismissed = ref(sessionStorage.getItem('pwa-banner-dismissed') === '1')
const { canInstall, showIosHint, installed, promptInstall } = usePwaInstall()

function dismiss() {
  dismissed.value = true
  sessionStorage.setItem('pwa-banner-dismissed', '1')
}

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') dismiss()
}
</script>

<template>
  <div
    v-if="!dismissed && !installed && (canInstall || showIosHint)"
    class="pwa-banner"
    role="region"
    aria-label="安装到手机"
  >
    <div class="pwa-banner__body">
      <p class="pwa-banner__title">添加到主屏幕，像 App 一样打开</p>
      <p v-if="canInstall" class="pwa-banner__hint">点击下方按钮即可安装网页应用。</p>
      <p v-else-if="showIosHint" class="pwa-banner__hint">
        iPhone/iPad：Safari 底部分享 →「添加到主屏幕」。
      </p>
    </div>
    <div class="pwa-banner__actions">
      <el-button v-if="canInstall" type="primary" size="small" @click="onInstall">安装</el-button>
      <el-button size="small" text @click="dismiss">暂不</el-button>
    </div>
  </div>
</template>

<style scoped>
.pwa-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 35%, var(--app-border-soft));
  border-radius: 12px;
  background: color-mix(in srgb, var(--el-color-primary-light-9) 60%, var(--app-surface));
}

.pwa-banner__title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
}

.pwa-banner__hint {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.5;
}

.pwa-banner__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
