<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import DeepseekChatThread from '@/components/DeepseekChatThread.vue'
import { useDeepseekConversation } from '@/composables/useDeepseekConversation'
import { isAiChatConfigured, DEEPSEEK_NOT_CONFIGURED_HINT, requestAssistantMarkdown } from '@/services/deepseek'
import {
  aiProviderTick,
  getAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
  setAiProvider,
  type AiProvider,
} from '@/utils/aiProviderStore'
import { wenguAuthTick } from '@/utils/wenguAuthStore'
import type { ComputerHandoutItem } from '@/utils/computerBasics'
import { stripHandoutImagesForAi } from '@/utils/computerBasics'

const props = defineProps<{
  item: ComputerHandoutItem
}>()

const keywordInput = ref('')
const panelOpen = ref(false)
const MAX_LEN = 500

const contextKey = computed(() => `computer-handout:${props.item.id}`)
const {
  loading,
  error,
  hasStarted,
  displayTurns,
  start,
  followup,
} = useDeepseekConversation({ resetKey: contextKey })

const aiReady = computed(() => {
  void wenguAuthTick.value
  return isAiChatConfigured()
})

const remain = computed(() => keywordInput.value.length)
const providerName = computed(() => {
  void aiProviderTick.value
  return getAiProviderShortName()
})

const badge = computed(() => displayTurns.value.length)

const aiProvider = computed({
  get() {
    void aiProviderTick.value
    return getAiProvider()
  },
  set(v: AiProvider) {
    setAiProvider(v)
    ElMessage.success(`已切换为 ${getAiProviderLabel(v)}`)
  },
})

const systemPrompt = computed(() => {
  const material = stripHandoutImagesForAi(props.item.content)
  return [
    '你是计算机基础知识助教。学员提问必须紧扣当前讲义，用简体中文、Markdown 作答。',
    '优先点明核心考点、易错点和考试常见问法，不要脱离材料胡编。',
    '',
    `当前讲义：${props.item.title}`,
    '讲义正文（已去掉插图）：',
    material,
  ].join('\n')
})

async function ask() {
  const q = keywordInput.value.trim()
  if (!q) {
    ElMessage.warning('请先输入问题')
    return
  }
  if (!aiReady.value) {
    ElMessage.warning(DEEPSEEK_NOT_CONFIGURED_HINT)
    return
  }
  try {
    if (!hasStarted.value) {
      await start({
        initialUser: q,
        displayUser: q,
        system: systemPrompt.value,
        fetch: () =>
          requestAssistantMarkdown({
            system: systemPrompt.value,
            userMessage: q,
          }),
        displayUserLabel: '你的提问',
        displayAssistantLabel: providerName.value,
      })
    } else {
      await followup(q, { user: '你的追问', assistant: providerName.value })
    }
    keywordInput.value = ''
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '提问失败')
  }
}
</script>

<template>
  <div class="computer-ask-dock">
    <button
      v-if="!panelOpen"
      type="button"
      class="computer-ask-tab"
      :aria-label="`打开 ${providerName} 询问`"
      @click="panelOpen = true"
    >
      <span class="computer-ask-tab__ring" aria-hidden="true" />
      <span class="computer-ask-tab__dot" aria-hidden="true" />
      <span class="computer-ask-tab__text">问 AI</span>
      <span v-if="badge" class="computer-ask-tab__badge">{{ badge > 9 ? '9+' : badge }}</span>
    </button>

    <aside v-else class="computer-ask">
      <button type="button" class="computer-ask__head" @click="panelOpen = false">
        <span>问 AI · {{ providerName }}</span>
        <span class="computer-ask__toggle-act">收起</span>
      </button>
      <div class="computer-ask__body">
        <div class="computer-ask__switch">
          <span>模型</span>
          <el-radio-group v-model="aiProvider" size="small">
            <el-radio-button value="deepseek">DeepSeek</el-radio-button>
            <el-radio-button value="doubao">豆包</el-radio-button>
          </el-radio-group>
        </div>
        <p class="computer-ask__hint">
          请围绕当前讲义提问；对话会保留上下文。需先在右上角「设置」登录。
        </p>
        <DeepseekChatThread :turns="displayTurns" />
        <p v-if="error" class="computer-ask__error">{{ error }}</p>
        <el-input
          v-model="keywordInput"
          type="textarea"
          :rows="4"
          maxlength="500"
          :disabled="loading || !aiReady"
          placeholder="例如：常见易错点、核心概念…"
          @keydown.ctrl.enter="ask"
        />
        <div class="computer-ask__meta">
          <span>{{ remain }}/{{ MAX_LEN }}</span>
          <el-button type="primary" :loading="loading" :disabled="!aiReady" @click="ask">
            向 {{ providerName }} 提问
          </el-button>
        </div>
        <p v-if="!aiReady" class="computer-ask__login">{{ DEEPSEEK_NOT_CONFIGURED_HINT }}</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.computer-ask-dock {
  flex: 0 0 auto;
}

.computer-ask-tab {
  position: absolute;
  right: 0;
  bottom: 96px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 11px 16px 11px 14px;
  border: none;
  border-radius: 999px 0 0 999px;
  color: #fff;
  background: linear-gradient(135deg, #7dd3fc 0%, #3b82f6 48%, #1d4ed8 100%);
  box-shadow: 0 10px 24px rgb(37 99 235 / 42%);
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.computer-ask-tab__ring {
  position: absolute;
  inset: -5px 0 -5px -5px;
  border-radius: inherit;
  border: 2px solid rgb(125 211 252 / 0.85);
  pointer-events: none;
  animation: computer-ask-pulse 1.7s ease-out infinite;
}

.computer-ask-tab__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgb(255 255 255 / 22%);
}

.computer-ask-tab__text {
  position: relative;
}

.computer-ask-tab__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  font-size: 11px;
  line-height: 18px;
}

@keyframes computer-ask-pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.08);
    opacity: 0;
  }
}

.computer-ask {
  overflow: visible;
  border: 1px solid color-mix(in srgb, #2563eb 28%, var(--app-border-soft));
  border-radius: 12px;
  background: var(--app-surface);
  box-shadow: 0 10px 28px rgb(37 99 235 / 12%);
}

.computer-ask__head {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 10px 14px;
  border: none;
  border-radius: 12px 12px 0 0;
  color: #fff;
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 58%, #1d4ed8 100%);
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.computer-ask__toggle-act {
  font-size: 12px;
  font-weight: 600;
  color: #dbeafe;
}

.computer-ask__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 14px;
}

.computer-ask__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.computer-ask__hint,
.computer-ask__login,
.computer-ask__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.computer-ask__error {
  color: var(--app-danger);
}

.computer-ask__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
}
</style>
