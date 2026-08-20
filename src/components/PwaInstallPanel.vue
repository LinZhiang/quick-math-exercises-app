<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/app/usePwaInstall'
import DeepseekApiAuthPanel from '@/components/DeepseekApiAuthPanel.vue'
import JsonTransferButtons from '@/components/JsonTransferButtons.vue'
import { clearComputerBasicsCache, loadComputerBasicsTree } from '@/utils/computer/computerBasics'
import { showAppUpdatingMask, hideAppUpdatingMask } from '@/utils/app/appUpdateMask'
import {
  applyPullToRefreshPreference,
  appUiSettingsTick,
  isPullToRefreshEnabled,
  setPullToRefreshEnabled,
} from '@/utils/app/appUiSettings'

const props = withDefaults(
  defineProps<{
    /** install：仅 PWA 安装；settings：登录、界面与备份 */
    panel?: 'install' | 'settings'
  }>(),
  { panel: 'install' },
)

const { canInstall, showIosHint, installed, promptInstall } = usePwaInstall()
const updatingApp = ref(false)

const pullToRefreshOn = computed({
  get() {
    void appUiSettingsTick.value
    return isPullToRefreshEnabled()
  },
  set(v: boolean) {
    setPullToRefreshEnabled(v)
    ElMessage.success(v ? '已开启手势刷新' : '已关闭手势刷新（推荐）')
  },
})

onMounted(() => {
  applyPullToRefreshPreference()
})

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') ElMessage.success('已安装，出门有网也能用')
  else if (r === 'dismissed') ElMessage.info('已取消')
  else ElMessage.info('Chrome 菜单 → 安装应用 / 添加到主屏幕')
}

async function updateAppContent() {
  updatingApp.value = true
  showAppUpdatingMask()
  try {
    clearComputerBasicsCache()
    try {
      await loadComputerBasicsTree(true)
    } catch {
      /* 离线时仍继续清缓存刷新前端 */
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
    const reg = await navigator.serviceWorker?.getRegistration()
    await reg?.update()
    const waiting = reg?.waiting
    waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.setTimeout(() => window.location.reload(), 200)
  } catch (e) {
    hideAppUpdatingMask()
    updatingApp.value = false
    ElMessage.error(e instanceof Error ? e.message : '更新失败')
  }
}
</script>

<template>
  <section
    v-if="panel === 'install'"
    class="mode-section install-panel"
    id="practice-install"
  >
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      手机 Chrome 打开本页（Cloudflare 公网地址）→ 安装应用。装好后有手机网络就能练。
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

    <div class="install-card">
      <p class="install-card__title">更新 App 内容</p>
      <p class="install-card__text">
        拉取最新页面与计算机基础目录。有网时点一次即可；更新时会短暂提示「正在更新」，请稍候，不是卡住了。
      </p>
      <el-button :loading="updatingApp" @click="updateAppContent">检查并更新</el-button>
    </div>
  </section>

  <template v-else>
    <section class="mode-section install-panel" id="practice-settings">
      <h3 class="mode-section__title">设置</h3>
      <p class="mode-section__hint">
        登录账号、界面偏好。练习数据请在「知识训练 / 题库整理」右上角导入导出，也可在下方操作。
      </p>

      <div class="install-card settings-card">
        <div class="settings-row">
          <div class="settings-row__text">
            <p class="install-card__title">允许手势刷新页面</p>
            <p class="install-card__text">
              开启后，可在页面顶部下拉（部分机型称上滑边缘）触发浏览器刷新。
            </p>
          </div>
          <el-switch v-model="pullToRefreshOn" />
        </div>
      </div>

      <div class="install-card settings-card">
        <p class="install-card__title">数据备份与迁移</p>
        <p class="install-card__text">
          按模块导出 JSON，手机可分享到微信/文件，电脑会下载。不含登录密钥。旧版「错题与收藏」「全部练习数据」文件仍可导入。
        </p>

        <div class="backup-block">
          <p class="backup-block__label">知识训练</p>
          <p class="backup-block__hint">错题收藏、测验日志、完成次数、出题去重历史等。</p>
          <JsonTransferButtons kind="train" variant="settings" />
        </div>
        <div class="backup-block">
          <p class="backup-block__label">题库整理</p>
          <p class="backup-block__hint">个人题库题目与分类；其测验日志一并带走。Word 导出仍在题库页内。</p>
          <JsonTransferButtons kind="bank" variant="settings" />
        </div>
      </div>
    </section>

    <DeepseekApiAuthPanel />
  </template>
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

.settings-card {
  margin-top: 12px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.settings-row__text {
  flex: 1;
  min-width: 0;
}

.settings-row__text .install-card__title {
  margin-bottom: 4px;
}

.backup-block {
  position: relative;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--app-border-soft);
}

.backup-block__label {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
}

.backup-block__hint {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.backup-mode {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.backup-mode__text {
  font-size: 12px;
  color: var(--app-text-muted);
}

.backup-file-input {
  display: none;
}

.backup-paste {
  margin-top: 10px;
}

.backup-paste__btn {
  margin-top: 10px;
}
</style>
