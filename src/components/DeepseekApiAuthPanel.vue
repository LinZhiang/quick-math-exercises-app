<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  clearDeepSeekApiKey,
  getDeepSeekAuthSnapshot,
  looksLikeDeepSeekApiKey,
  normalizeDeepSeekApiKeyInput,
  saveDeepSeekApiKey,
  verifyDeepSeekApiKey,
  deepseekAuthTick,
} from '@/utils/deepseekApiKeyStore'

const draftKey = ref('')
const saving = ref(false)
const showKey = ref(false)

const snapshot = computed(() => {
  void deepseekAuthTick.value
  return getDeepSeekAuthSnapshot()
})

async function onSave() {
  const raw = normalizeDeepSeekApiKeyInput(draftKey.value)
  if (!looksLikeDeepSeekApiKey(raw)) {
    ElMessage.warning('请输入以 sk- 开头的 DeepSeek API Key')
    return
  }
  saving.value = true
  try {
    const check = await verifyDeepSeekApiKey(raw)
    if (!check.ok) {
      ElMessage.error(check.message)
      return
    }
    const { hint } = await saveDeepSeekApiKey(raw)
    draftKey.value = ''
    showKey.value = false
    ElMessage.success(`已授权并加密保存（${hint}）。语文 AI 功能现已可用。`)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function onClear() {
  try {
    await ElMessageBox.confirm(
      '清除后语文练习将无法调用 DeepSeek，需重新填写 Key。确定清除？',
      '清除授权',
      { type: 'warning', confirmButtonText: '清除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  await clearDeepSeekApiKey()
  draftKey.value = ''
  ElMessage.success('已清除本机 DeepSeek 授权')
}
</script>

<template>
  <section class="mode-section deepseek-auth" id="practice-deepseek-auth" aria-label="DeepSeek API 授权">
    <h3 class="mode-section__title">DeepSeek API 授权</h3>
    <p class="mode-section__hint">
      语文练习的出题与讲解依赖 DeepSeek。面向外部使用时，请自行到
      <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer">DeepSeek 开放平台</a>
      创建 API Key，在此填写并保存后才能使用。密钥仅保存在本机浏览器（AES 加密），界面只显示脱敏信息，不会上传到本站服务器。
    </p>

    <div v-if="snapshot.configured" class="install-card install-card--ok">
      <p class="install-card__title">已授权</p>
      <p class="install-card__text">
        当前 Key：<code>{{ snapshot.hint }}</code>（完整密钥已加密缓存，不在此展示）
      </p>
      <div class="deepseek-auth__actions">
        <el-button type="danger" plain size="small" @click="onClear">清除授权</el-button>
      </div>
    </div>

    <div class="install-card">
      <p class="install-card__title">{{ snapshot.configured ? '更换 API Key' : '填写 API Key' }}</p>
      <div class="deepseek-auth__form">
        <el-input
          v-model="draftKey"
          :type="showKey ? 'text' : 'password'"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="sk-…"
          clearable
          @keydown.enter.prevent="onSave"
        >
          <template #append>
            <el-button @click="showKey = !showKey">{{ showKey ? '隐藏' : '显示' }}</el-button>
          </template>
        </el-input>
        <el-button type="primary" :loading="saving" :disabled="!draftKey.trim()" @click="onSave">
          校验并保存
        </el-button>
      </div>
      <p class="install-card__text deepseek-auth__note">
        保存前会向 DeepSeek 发起一次轻量校验。请勿在公共设备勾选「显示」，用完可点「清除授权」。
      </p>
    </div>
  </section>
</template>

<style scoped>
.deepseek-auth {
  margin-top: 8px;
}

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

.deepseek-auth__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.deepseek-auth__actions {
  margin-top: 10px;
}

.deepseek-auth__note {
  margin-top: 10px;
}

.deepseek-auth a {
  color: var(--el-color-primary);
}
</style>
