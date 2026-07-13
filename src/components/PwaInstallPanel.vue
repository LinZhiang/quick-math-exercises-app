<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { canInstall, showIosHint, installed, isAndroid, isChromeLike, promptInstall } =
  usePwaInstall()

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') {
    ElMessage.success('已开始安装')
    return
  }
  if (r === 'dismissed') {
    ElMessage.info('已取消安装')
    return
  }
  ElMessage.warning('当前浏览器暂未弹出安装框，请按下方步骤手动添加')
}
</script>

<template>
  <section class="mode-section install-panel" id="practice-install">
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      把「口算练习」添加到主屏幕后，可像普通 App 一样全屏打开，适合安卓 Chrome / Edge。
      语文练习的 AI 出题需电脑运行 <code>npm run serve</code>，手机访问同一局域网地址（如 http://192.168.x.x:8790）。
    </p>

    <div v-if="installed" class="install-card install-card--ok">
      <p class="install-card__title">已安装</p>
      <p class="install-card__text">当前已在独立窗口（主屏幕应用）中打开。</p>
    </div>

    <template v-else>
      <div class="install-card">
        <p class="install-card__title">一键安装</p>
        <p class="install-card__text">
          使用安卓手机的 Chrome / Edge 打开本站（需 HTTPS），浏览器会允许安装为网页应用。
        </p>
        <el-button type="primary" :disabled="!canInstall" @click="onInstall">
          {{ canInstall ? '安装到主屏幕' : '等待浏览器准备安装…' }}
        </el-button>
        <p v-if="!canInstall" class="install-card__muted">
          若按钮不可用：请用系统浏览器打开本页链接（不要嵌在微信内置浏览器），刷新后再试；或按下方手动步骤添加。
        </p>
      </div>

      <div class="install-card">
        <p class="install-card__title">安卓手动安装</p>
        <ol class="install-steps">
          <li>用 <strong>Chrome</strong> 或 <strong>Edge</strong> 打开本页网址（不要用微信内打开）。</li>
          <li>点右上角 <strong>⋮</strong> 菜单。</li>
          <li>选择 <strong>安装应用</strong> / <strong>添加到主屏幕</strong> / <strong>安装网页应用</strong>。</li>
          <li>确认后，主屏幕会出现「口算练习」图标，点开即全屏使用。</li>
        </ol>
        <p v-if="isAndroid && !isChromeLike" class="install-card__muted">
          检测到当前可能不是 Chrome/Edge，建议复制链接到 Chrome 打开后再安装。
        </p>
      </div>

      <div v-if="showIosHint" class="install-card">
        <p class="install-card__title">iPhone / iPad</p>
        <ol class="install-steps">
          <li>使用 <strong>Safari</strong> 打开本页。</li>
          <li>点底部分享按钮。</li>
          <li>选择 <strong>添加到主屏幕</strong>，再点添加。</li>
        </ol>
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
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.install-card__muted {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.install-steps {
  margin: 0;
  padding-left: 1.2em;
  font-size: 13px;
  line-height: 1.7;
}

.install-steps li + li {
  margin-top: 4px;
}
</style>
