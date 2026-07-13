<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/usePwaInstall'

const {
  canInstall,
  showIosHint,
  installed,
  isAndroid,
  isChromeLike,
  isSecure,
  pageOrigin,
  promptInstall,
} = usePwaInstall()

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
  ElMessage.warning('浏览器尚未给出安装框，请按下方手动步骤操作')
}
</script>

<template>
  <section class="mode-section install-panel" id="practice-install">
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      真正的「安装应用」需要 <strong>HTTPS</strong>。电脑请执行
      <code>npm run certs</code> → <code>npm run build</code> → <code>npm run serve</code>，
      然后手机用 <code>https://电脑WiFiIP:8790</code> 打开（不要用 http）。
    </p>

    <div v-if="!isSecure" class="install-card install-card--warn">
      <p class="install-card__title">当前不是 HTTPS，无法一键安装</p>
      <p class="install-card__text">
        你现在打开的是 <code>{{ pageOrigin }}</code>。Chrome 在局域网 HTTP 下不会弹出「安装应用」。
        自学时间若能「添加」，多半是浏览器菜单里的快捷方式；口算练习要装成独立 App，请改用 HTTPS 地址。
      </p>
      <ol class="install-steps">
        <li>电脑：<code>npm run certs</code></li>
        <li>电脑：<code>npm run build && npm run serve</code></li>
        <li>手机 Chrome 打开终端打印的 <strong>https://192.168.x.x:8790</strong></li>
        <li>证书警告页点「高级」→「继续前往」（家庭自签证书，仅内网用）</li>
        <li>再回到本页点「安装到主屏幕」，或 Chrome 菜单 → 安装应用</li>
      </ol>
    </div>

    <div v-if="installed" class="install-card install-card--ok">
      <p class="install-card__title">已安装</p>
      <p class="install-card__text">当前已在独立窗口（主屏幕应用）中打开。</p>
    </div>

    <template v-else>
      <div class="install-card">
        <p class="install-card__title">一键安装</p>
        <p class="install-card__text">
          用安卓 Chrome / Edge 打开 HTTPS 地址后，浏览器会允许安装为网页应用。
        </p>
        <el-button type="primary" :disabled="!canInstall" @click="onInstall">
          {{ canInstall ? '安装到主屏幕' : isSecure ? '等待浏览器准备安装…' : '需先用 HTTPS 打开' }}
        </el-button>
        <p v-if="isSecure && !canInstall" class="install-card__muted">
          若按钮仍不可用：刷新页面，或点 Chrome 右上角 ⋮ →「安装应用」/「添加到主屏幕」。不要用微信内置浏览器。
        </p>
      </div>

      <div class="install-card">
        <p class="install-card__title">安卓手动安装</p>
        <ol class="install-steps">
          <li>用 <strong>Chrome</strong> 打开本页的 <strong>https</strong> 地址（不要用微信）。</li>
          <li>点右上角 <strong>⋮</strong>。</li>
          <li>选择 <strong>安装应用</strong> 或 <strong>添加到主屏幕</strong>。</li>
          <li>确认后主屏幕会出现「口算练习」图标。</li>
        </ol>
        <p v-if="isAndroid && !isChromeLike" class="install-card__muted">
          检测到当前可能不是 Chrome/Edge，建议复制链接到 Chrome 再装。
        </p>
      </div>

      <div v-if="showIosHint" class="install-card">
        <p class="install-card__title">iPhone / iPad</p>
        <ol class="install-steps">
          <li>使用 <strong>Safari</strong> 打开本页（建议 HTTPS）。</li>
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

.install-card--warn {
  border-color: color-mix(in srgb, var(--el-color-warning) 45%, var(--app-border-soft));
  background: color-mix(in srgb, var(--el-color-warning-light-9) 40%, transparent);
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

code {
  font-size: 0.92em;
}
</style>
