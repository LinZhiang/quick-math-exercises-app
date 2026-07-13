<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { canInstall, showIosHint, installed, promptInstall } = usePwaInstall()

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') ElMessage.success('已开始安装')
  else if (r === 'dismissed') ElMessage.info('已取消')
  else ElMessage.info('请用 Chrome 菜单 → 安装应用 / 添加到主屏幕')
}
</script>

<template>
  <section class="mode-section install-panel" id="practice-install">
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      电脑先执行 <code>npm start</code>，手机 Chrome 打开终端里打印的 <strong>https://…:8790</strong>，
      首次证书警告点「继续前往」，再点下面按钮或浏览器菜单「安装应用」。
    </p>

    <div v-if="installed" class="install-card install-card--ok">
      <p class="install-card__title">已安装</p>
      <p class="install-card__text">可从主屏幕直接打开。</p>
    </div>

    <template v-else>
      <div class="install-card">
        <el-button type="primary" :disabled="!canInstall" @click="onInstall">
          {{ canInstall ? '安装到主屏幕' : '请先用 https 地址打开本页' }}
        </el-button>
      </div>

      <div v-if="showIosHint" class="install-card">
        <p class="install-card__title">iPhone</p>
        <p class="install-card__text">Safari → 分享 → 添加到主屏幕</p>
      </div>
    </template>
  </section>
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
