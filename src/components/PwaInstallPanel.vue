<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePwaInstall } from '@/composables/usePwaInstall'
import DeepseekApiAuthPanel from '@/components/DeepseekApiAuthPanel.vue'
import {
  applyPullToRefreshPreference,
  appUiSettingsTick,
  isPullToRefreshEnabled,
  setPullToRefreshEnabled,
} from '@/utils/appUiSettings'
import {
  applyBackup,
  backupKindLabel,
  copyBackupToClipboard,
  countBackupKeys,
  downloadOrShareBackup,
  parseBackupJson,
  readFileAsText,
  type BackupImportMode,
  type WenguBackupKind,
} from '@/utils/userDataBackup'

const { canInstall, showIosHint, installed, promptInstall } = usePwaInstall()

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

const exportBusy = ref(false)
const importBusy = ref(false)
const importMode = ref<BackupImportMode>('merge')
const pasteOpen = ref(false)
const pasteText = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const wrongFavKeyCount = computed(() => countBackupKeys('wrong-favorite'))
const userDataKeyCount = computed(() => countBackupKeys('user-data'))

onMounted(() => {
  applyPullToRefreshPreference()
})

async function onInstall() {
  const r = await promptInstall()
  if (r === 'accepted') ElMessage.success('已安装，出门有网也能用')
  else if (r === 'dismissed') ElMessage.info('已取消')
  else ElMessage.info('Chrome 菜单 → 安装应用 / 添加到主屏幕')
}

async function onExport(kind: WenguBackupKind) {
  if (exportBusy.value) return
  const n = countBackupKeys(kind)
  if (!n) {
    ElMessage.info(`暂无「${backupKindLabel(kind)}」可导出`)
    return
  }
  exportBusy.value = true
  try {
    const how = await downloadOrShareBackup(kind)
    if (how === 'shared') ElMessage.success(`已分享「${backupKindLabel(kind)}」备份`)
    else ElMessage.success(`已下载「${backupKindLabel(kind)}」备份（约 ${n} 项）`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '导出失败'
    if (msg.includes('取消')) ElMessage.info(msg)
    else ElMessage.error(msg)
  } finally {
    exportBusy.value = false
  }
}

async function onCopy(kind: WenguBackupKind) {
  try {
    await copyBackupToClipboard(kind)
    ElMessage.success('已复制到剪贴板，可粘贴到备忘录或发到另一台设备')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '复制失败')
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function onFilePicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  importBusy.value = true
  try {
    const text = await readFileAsText(file)
    await runImport(text)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '导入失败')
  } finally {
    importBusy.value = false
  }
}

async function onPasteImport() {
  const text = pasteText.value.trim()
  if (!text) {
    ElMessage.warning('请先粘贴备份 JSON')
    return
  }
  importBusy.value = true
  try {
    await runImport(text)
    pasteText.value = ''
    pasteOpen.value = false
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '导入失败')
  } finally {
    importBusy.value = false
  }
}

async function runImport(text: string) {
  const backup = parseBackupJson(text)
  const modeLabel = importMode.value === 'merge' ? '合并' : '覆盖'
  try {
    await ElMessageBox.confirm(
      `将导入「${backupKindLabel(backup.kind)}」共 ${Object.keys(backup.entries).length} 项（${modeLabel}）。\n` +
        `不含登录密钥。导入后页面会刷新以加载数据。`,
      '确认导入',
      { type: 'warning', confirmButtonText: '导入', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  const result = applyBackup(backup, importMode.value)
  ElMessage.success(`已写入 ${result.written} 项，即将刷新…`)
  window.setTimeout(() => {
    window.location.reload()
  }, 600)
}
</script>

<template>
  <section class="mode-section install-panel" id="practice-install">
    <h3 class="mode-section__title">安装到手机</h3>
    <p class="mode-section__hint">
      手机 Chrome 打开本页（Cloudflare 公网地址）→ 安装应用。
      装好后有手机网络就能练；语文 AI 在下方登录即可（公网站点出门也能用，无需开电脑）。
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

  <section class="mode-section install-panel" id="practice-settings">
    <h3 class="mode-section__title">设置</h3>
    <p class="mode-section__hint">
      界面偏好与练习数据保存在本机。可打包到手机/电脑另一端导入，两边互通。
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
        手机可「分享」到微信/文件；电脑会下载 JSON。导入支持选文件或粘贴。不含登录密钥与 API
        密钥，登录信息需在新设备重新登录。
      </p>

      <div class="backup-block">
        <p class="backup-block__label">导出</p>
        <div class="backup-actions">
          <el-button
            type="primary"
            plain
            :loading="exportBusy"
            @click="onExport('wrong-favorite')"
          >
            打包错题与收藏（{{ wrongFavKeyCount }}）
          </el-button>
          <el-button plain :loading="exportBusy" @click="onCopy('wrong-favorite')">
            复制错题收藏
          </el-button>
        </div>
        <div class="backup-actions">
          <el-button type="primary" plain :loading="exportBusy" @click="onExport('user-data')">
            打包全部练习数据（{{ userDataKeyCount }}）
          </el-button>
          <el-button plain :loading="exportBusy" @click="onCopy('user-data')">
            复制全部数据
          </el-button>
        </div>
        <p class="backup-block__hint">
          「全部练习数据」含错题收藏、测验日志、完成次数、界面设置与出题去重历史等。
        </p>
      </div>

      <div class="backup-block">
        <p class="backup-block__label">导入</p>
        <div class="backup-mode">
          <span class="backup-mode__text">写入方式</span>
          <el-radio-group v-model="importMode" size="small">
            <el-radio-button value="merge">合并</el-radio-button>
            <el-radio-button value="replace">覆盖同名项</el-radio-button>
          </el-radio-group>
        </div>
        <p class="backup-block__hint">
          合并：错题按指纹合并并取较大错次；覆盖：备份里的键直接替换本机对应项。
        </p>
        <div class="backup-actions">
          <el-button type="success" plain :loading="importBusy" @click="openFilePicker">
            从文件导入
          </el-button>
          <el-button plain :loading="importBusy" @click="pasteOpen = !pasteOpen">
            {{ pasteOpen ? '收起粘贴' : '粘贴 JSON 导入' }}
          </el-button>
        </div>
        <input
          ref="fileInputRef"
          class="backup-file-input"
          type="file"
          accept="application/json,.json,text/plain"
          @change="onFilePicked"
        />
        <div v-if="pasteOpen" class="backup-paste">
          <el-input
            v-model="pasteText"
            type="textarea"
            :rows="6"
            placeholder="粘贴从另一台设备复制的备份 JSON…"
          />
          <el-button
            class="backup-paste__btn"
            type="primary"
            :loading="importBusy"
            @click="onPasteImport"
          >
            确认导入
          </el-button>
        </div>
      </div>
    </div>
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
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--app-border-soft);
}

.backup-block__label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
}

.backup-block__hint {
  margin: 8px 0 0;
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
