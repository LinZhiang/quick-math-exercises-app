<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/usePwaInstall'
import DeepseekApiAuthPanel from '@/components/DeepseekApiAuthPanel.vue'

const { canInstall, showIosHint, installed, promptInstall } = usePwaInstall()

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') ElMessage.success('已安装，出门有网也能用')
  else if (r === 'dismissed') ElMessage.info('已取消')
  else ElMessage.info('Chrome 菜单 → 安装应用 / 添加到主屏幕')
}
</script>

<template>
  <section class="mode-section install-panel" id="practice-install">
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      手机 Chrome 打开本页（Cloudflare 公网地址或家里局域网地址）→ 安装应用。
      装好后<strong>出门不用开电脑</strong>，有手机网络就能练。
      语文 AI 功能需先在下方「语文 AI 登录」；口算练习无需登录。
    </p>

    <div v-if="installed" class="install-card install-card--ok">
      <p class="install-card__title">已安装</p>
      <p class="install-card__text">从主屏幕打开即可，无需电脑在线。</p>
    </div>

    <template v-else>
      <div class="install-card">
        <el-button type="primary" :disabled="!canInstall" @click="onInstall">
          {{ canInstall ? '安装到主屏幕' : '请用 Chrome 打开本页' }}
        </el-button>
      </div>
      <div v-if="showIosHint" class="install-card">
        <p class="install-card__text">iPhone：Safari → 分享 → 添加到主屏幕</p>
      </div>
    </template>
  </section>

  <DeepseekApiAuthPanel />
</template>

<style scoped>
.install-card {
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: var(--app-surface-alt);
}

.install-card--ok {
  border-color: color-mix(in srgb, var(--el-color-success) 40%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-success-light-9) 45%, transparent);
}

.install-card__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
}

.install-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}
</style>
