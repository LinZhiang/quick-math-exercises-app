<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  AI_VISION_UNSUPPORTED_HINT,
  getAiProvider,
  getAiProviderLabel,
  providerSupportsVision,
  setAiProvider,
  aiProviderTick,
  type AiProvider,
} from '@/utils/aiProviderStore'

const provider = computed({
  get() {
    void aiProviderTick.value
    return getAiProvider()
  },
  set(v: AiProvider) {
    setAiProvider(v)
    ElMessage.success(`已切换为 ${getAiProviderLabel(v)}（不会自动降级）`)
  },
})

const visionOk = computed(() => {
  void aiProviderTick.value
  return providerSupportsVision()
})

function onVisionProbe() {
  if (!visionOk.value) {
    ElMessage.warning(AI_VISION_UNSUPPORTED_HINT)
  }
}
</script>

<template>
  <div class="ai-provider-switch" role="group" aria-label="AI 模型提供商">
    <span class="ai-provider-switch__label">AI 模型</span>
    <el-radio-group v-model="provider" size="small">
      <el-radio-button value="deepseek">DeepSeek</el-radio-button>
      <el-radio-button value="doubao">豆包</el-radio-button>
    </el-radio-group>
    <span class="ai-provider-switch__hint">
      当前：{{ getAiProviderLabel(provider) }}
      <template v-if="provider === 'deepseek'">
        · 未切到豆包时请求走 DeepSeek，方舟用量会为 0
      </template>
      <template v-else>
        · 方舟用量请筛模型 ID：doubao-seed-2-1-pro-260628（不是 240628）
      </template>
      <template v-if="!visionOk"> · 识图/图形请选手动切到豆包</template>
    </span>
    <el-button
      v-if="!visionOk"
      size="small"
      text
      type="warning"
      @click="onVisionProbe"
    >
      识图能力
    </el-button>
  </div>
</template>

<style scoped>
.ai-provider-switch {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 8px 0 12px;
}
.ai-provider-switch__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ai-provider-switch__hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
