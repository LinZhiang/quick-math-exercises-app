<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { usePwaInstall } from '@/composables/app/usePwaInstall'
import JsonTransferButtons from '@/components/JsonTransferButtons.vue'
import { showAppUpdatingMask, hideAppUpdatingMask } from '@/utils/app/appUpdateMask'
import { wipeHandoutDiskCache } from '@/utils/app/handoutDiskCache'
import {
  applyPullToRefreshPreference,
  appUiSettingsTick,
  isPullToRefreshEnabled,
  setPullToRefreshEnabled,
} from '@/utils/app/appUiSettings'
import { HOME_HUB_MODULES, HOME_HUB_PINNED_ID } from '@/constants/home-hub-modules'
import { isHomeHubModuleVisible, setHomeHubModuleVisible } from '@/utils/app/homeHubMenu'
import { userJsonEpoch } from '@/utils/app/syncedUserJson'

const props = withDefaults(
  defineProps<{
    /** install：仅 PWA 安装；settings：界面与备份 */
    panel?: 'install' | 'settings'
  }>(),
  { panel: 'install' },
)

const { canInstall, installed, isIpad, isIosSafari, pageOrigin, promptInstall } = usePwaInstall()
const updatingApp = ref(false)
const ipadGuideOpen = ref(false)

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

const menuRows = computed(() => {
  void userJsonEpoch.value
  return HOME_HUB_MODULES.map((mod) => ({
    id: mod.id,
    title: mod.title,
    desc: mod.desc,
    visible: isHomeHubModuleVisible(mod.id),
    locked: mod.id === HOME_HUB_PINNED_ID,
  }))
})

function onMenuVisibleChange(id: (typeof HOME_HUB_MODULES)[number]['id'], on: string | number | boolean) {
  setHomeHubModuleVisible(id, Boolean(on))
}

onMounted(() => {
  applyPullToRefreshPreference()
})

async function onInstallAndroid() {
  const r = await promptInstall()
  if (r === 'accepted') ElMessage.success('已安装，出门有网也能用')
  else if (r === 'dismissed') ElMessage.info('已取消')
  else ElMessage.info('请用安卓 Chrome 打开本页，再点地址栏或菜单里的「安装应用 / 添加到主屏幕」。微信里请先选「在浏览器打开」。')
}

function onInstallIpad() {
  ipadGuideOpen.value = true
}

async function copyInstallUrl() {
  const url = pageOrigin.value || window.location.origin
  try {
    await navigator.clipboard.writeText(window.location.href || url)
    ElMessage.success('已复制本页地址，到 iPad 的 Safari 粘贴打开')
  } catch {
    ElMessage.info(window.location.href || url)
  }
}

async function updateAppContent() {
  updatingApp.value = true
  showAppUpdatingMask()
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k.startsWith('quick-math')).map((k) => caches.delete(k)))
    }
    await wipeHandoutDiskCache()
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
    <h3 class="mode-section__title">安装到设备</h3>
    <p class="mode-section__hint">
      安卓手机用 Chrome 安装应用；苹果 iPad 必须用 Safari「添加到主屏幕」，系统不提供 Chrome 那种安装提示。
    </p>

    <div v-if="installed" class="install-card install-card--ok">
      <p class="install-card__title">此设备已安装</p>
      <p class="install-card__text">从主屏幕打开即可。若还要装到另一台设备，用下面对应按钮。</p>
    </div>

    <div class="install-card">
      <p class="install-card__title">安卓手机</p>
      <p class="install-card__text">
        用 Chrome 打开本页后点下面按钮。若按钮没弹出安装框，到 Chrome 菜单里选「安装应用」。微信内请先「在浏览器打开」。
      </p>
      <el-button type="primary" @click="onInstallAndroid">
        {{ canInstall ? '安卓手机安装' : '安卓手机安装（需 Chrome）' }}
      </el-button>
    </div>

    <div class="install-card">
      <p class="install-card__title">苹果 iPad</p>
      <p class="install-card__text">
        iPad 不能用安卓那套一键安装。请用 Safari 打开本页，再按分享 → 添加到主屏幕。
      </p>
      <el-button type="primary" plain @click="onInstallIpad">苹果 iPad 安装</el-button>
    </div>

    <el-dialog
      v-model="ipadGuideOpen"
      title="安装到 iPad"
      width="min(92vw, 420px)"
      append-to-body
    >
      <p v-if="isIpad && isIosSafari" class="install-card__text">
        当前就是 iPad Safari。按下面几步即可装到主屏幕。
      </p>
      <p v-else-if="isIpad" class="install-card__text">
        当前不是 Safari。请复制地址，改用 Safari 打开后再添加。Chrome / 微信里加不到主屏幕。
      </p>
      <p v-else class="install-card__text">
        请在 iPad 上用 Safari 打开本页（不要用 Chrome 或微信），再按下面做。
      </p>
      <ol class="install-steps">
        <li>Safari 打开本页。</li>
        <li>点工具栏「分享」（方框加向上箭头）。横屏时多在顶部。</li>
        <li>滑到「添加到主屏幕」→ 添加。</li>
        <li>回主屏幕点「学习App」图标打开。</li>
      </ol>
      <template #footer>
        <el-button @click="copyInstallUrl">复制本页地址</el-button>
        <el-button type="primary" @click="ipadGuideOpen = false">知道了</el-button>
      </template>
    </el-dialog>

    <div class="install-card">
      <p class="install-card__title">更新 App 内容</p>
      <p class="install-card__text">
        只刷新本机页面、脚本和目录缓存，按服务器上的目录重新拉取；不会清空云端讲义。
      </p>
      <el-button :loading="updatingApp" @click="updateAppContent">检查并更新</el-button>
    </div>
  </section>

  <template v-else>
    <section class="mode-section install-panel" id="practice-settings">
      <h3 class="mode-section__title">设置</h3>
      <p class="mode-section__hint">
        界面偏好。练习数据请在「知识训练 / 题库整理」右上角导入导出，也可在下方操作。
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
        <p class="install-card__title">菜单管理</p>
        <p class="install-card__text">
          控制首页显示哪些模块。题库整理始终显示；未登录记在本机，登录后同步到账号。
        </p>
        <div v-for="row in menuRows" :key="row.id" class="settings-row menu-row">
          <div class="settings-row__text">
            <p class="install-card__title">{{ row.title }}</p>
            <p class="install-card__text">{{ row.locked ? '始终显示，不能关闭' : row.desc }}</p>
          </div>
          <el-switch
            :model-value="row.visible"
            :disabled="row.locked"
            @change="onMenuVisibleChange(row.id, $event)"
          />
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

.install-card .el-button {
  margin-top: 10px;
}

.install-steps {
  margin: 12px 0 0;
  padding-left: 1.3em;
  font-size: 14px;
  line-height: 1.7;
}

.install-steps li + li {
  margin-top: 6px;
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

.menu-row {
  margin-top: 10px;
}

.menu-row + .menu-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border-soft);
}

.menu-row .install-card__title {
  margin-bottom: 2px;
  font-size: 14px;
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
