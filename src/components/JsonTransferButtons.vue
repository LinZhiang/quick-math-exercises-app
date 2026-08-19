<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  applyBackup,
  backupKindLabel,
  countBackupKeys,
  downloadOrShareBackup,
  parseBackupJson,
  readFileAsText,
  type BackupImportMode,
  type WenguBackupKind,
  type WenguModuleBackupKind,
} from '@/utils/app/userDataBackup'

const props = withDefaults(
  defineProps<{
    kind: WenguModuleBackupKind
    /** chrome：仅两个小按钮；settings：带说明与粘贴 */
    variant?: 'chrome' | 'settings'
  }>(),
  { variant: 'chrome' },
)

const exportBusy = ref(false)
const importBusy = ref(false)
const importMode = ref<BackupImportMode>('merge')
const pasteOpen = ref(false)
const pasteText = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const keyCount = computed(() => countBackupKeys(props.kind))
const isChrome = computed(() => props.variant === 'chrome')

async function onExport() {
  if (exportBusy.value) return
  const n = countBackupKeys(props.kind)
  if (!n) {
    ElMessage.info(`暂无「${backupKindLabel(props.kind)}」可导出`)
    return
  }
  exportBusy.value = true
  try {
    const how = await downloadOrShareBackup(props.kind)
    if (how === 'shared') ElMessage.success(`已分享「${backupKindLabel(props.kind)}」JSON`)
    else ElMessage.success(`已下载「${backupKindLabel(props.kind)}」JSON（约 ${n} 项）`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '导出失败'
    if (msg.includes('取消')) ElMessage.info(msg)
    else ElMessage.error(msg)
  } finally {
    exportBusy.value = false
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
    await runImport(await readFileAsText(file))
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

function mismatchHint(kind: WenguBackupKind): string {
  if (kind === props.kind) return ''
  if (kind === 'wrong-favorite' && props.kind === 'train') return ''
  return `\n当前在「${backupKindLabel(props.kind)}」，文件是「${backupKindLabel(kind)}」。将按文件类型写入。`
}

async function runImport(text: string) {
  const backup = parseBackupJson(text)
  const modeLabel = importMode.value === 'merge' ? '合并' : '覆盖本模块对应项'
  try {
    await ElMessageBox.confirm(
      `将导入「${backupKindLabel(backup.kind)}」共 ${Object.keys(backup.entries).length} 项（${modeLabel}）。${mismatchHint(backup.kind)}\n不含登录密钥。导入后页面会刷新。`,
      '确认导入 JSON',
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
  <template v-if="isChrome">
    <el-button size="small" :loading="importBusy" @click="openFilePicker">导入</el-button>
    <el-button size="small" :loading="exportBusy" @click="onExport">导出</el-button>
    <input
      ref="fileInputRef"
      class="json-transfer-file"
      type="file"
      accept="application/json,.json,text/plain"
      @change="onFilePicked"
    />
  </template>
  <div v-else class="json-transfer-settings">
    <p class="json-transfer-settings__count">当前约 {{ keyCount }} 项可导出</p>
    <div class="json-transfer-settings__actions">
      <el-button type="primary" plain :loading="exportBusy" @click="onExport">
        导出 JSON
      </el-button>
      <el-button type="success" plain :loading="importBusy" @click="openFilePicker">
        导入 JSON
      </el-button>
    </div>
    <div class="json-transfer-settings__mode">
      <span>写入方式</span>
      <el-radio-group v-model="importMode" size="small">
        <el-radio-button value="merge">合并</el-radio-button>
        <el-radio-button value="replace">覆盖本模块项</el-radio-button>
      </el-radio-group>
    </div>
    <el-button plain :loading="importBusy" @click="pasteOpen = !pasteOpen">
      {{ pasteOpen ? '收起粘贴' : '粘贴 JSON 导入' }}
    </el-button>
    <input
      ref="fileInputRef"
      class="json-transfer-file"
      type="file"
      accept="application/json,.json,text/plain"
      @change="onFilePicked"
    />
    <div v-if="pasteOpen" class="json-transfer-settings__paste">
      <el-input
        v-model="pasteText"
        type="textarea"
        :rows="5"
        placeholder="粘贴从另一台设备复制的备份 JSON…"
      />
      <el-button type="primary" :loading="importBusy" @click="onPasteImport">确认导入</el-button>
    </div>
  </div>
</template>

<style scoped>
.json-transfer-file {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.json-transfer-settings {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.json-transfer-settings__count {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.json-transfer-settings__actions,
.json-transfer-settings__mode {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.json-transfer-settings__mode {
  font-size: 13px;
}

.json-transfer-settings__paste {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
