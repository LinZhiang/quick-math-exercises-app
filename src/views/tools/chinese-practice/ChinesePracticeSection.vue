<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import {
  CHINESE_PRACTICE_TABS,
  DEFAULT_CHINESE_PRACTICE_TAB,
  type ChineseKeyQuestionSource,
  type ChinesePracticeTabId,
} from '@/constants/chinese-practice-tabs'
import type { KeyPracticePayload } from '@/types/chinese-practice'
import ChineseCharLiteracyPanel from '@/views/tools/chinese-practice/ChineseCharLiteracyPanel.vue'
import ChineseCommonSensePanel from '@/views/tools/chinese-practice/ChineseCommonSensePanel.vue'
import ChineseHistoryCommonSensePanel from '@/views/tools/chinese-practice/ChineseHistoryCommonSensePanel.vue'
import ChineseIdiomPanel from '@/views/tools/chinese-practice/ChineseIdiomPanel.vue'
import ChineseKeyQuestionsPanel from '@/views/tools/chinese-practice/ChineseKeyQuestionsPanel.vue'
import ChinesePartyHistoryPanel from '@/views/tools/chinese-practice/ChinesePartyHistoryPanel.vue'
import ChinesePoetryPanel from '@/views/tools/chinese-practice/ChinesePoetryPanel.vue'

export type { KeyPracticePayload } from '@/types/chinese-practice'

const activeTab = ref<ChinesePracticeTabId>(DEFAULT_CHINESE_PRACTICE_TAB)
const idiomRef = ref<InstanceType<typeof ChineseIdiomPanel> | null>(null)
const charLiteracyRef = ref<InstanceType<typeof ChineseCharLiteracyPanel> | null>(null)
const poetryRef = ref<InstanceType<typeof ChinesePoetryPanel> | null>(null)
const commonSenseRef = ref<InstanceType<typeof ChineseCommonSensePanel> | null>(null)
const historyCommonSenseRef = ref<InstanceType<typeof ChineseHistoryCommonSensePanel> | null>(null)
const partyHistoryRef = ref<InstanceType<typeof ChinesePartyHistoryPanel> | null>(null)

const isRunningOrLoading = computed(
  () =>
    idiomRef.value?.isRunningOrLoading ||
    charLiteracyRef.value?.isRunningOrLoading ||
    poetryRef.value?.isRunningOrLoading ||
    commonSenseRef.value?.isRunningOrLoading ||
    historyCommonSenseRef.value?.isRunningOrLoading ||
    partyHistoryRef.value?.isRunningOrLoading ||
    false,
)

function selectTab(id: ChinesePracticeTabId) {
  if (isRunningOrLoading.value) return
  activeTab.value = id
}

function onKeyPractice(payload: KeyPracticePayload) {
  activeTab.value = payload.source
  void nextTick(() => {
    if (payload.source === 'word-memorization') {
      idiomRef.value?.startWith(payload.questions)
    } else if (payload.source === 'char-literacy') {
      charLiteracyRef.value?.startWith(payload.questions)
    } else if (payload.source === 'poetry-practice') {
      poetryRef.value?.startWith(payload.questions)
    } else if (payload.source === 'common-sense') {
      commonSenseRef.value?.startWith(payload.questions)
    } else if (payload.source === 'history-common-sense') {
      historyCommonSenseRef.value?.startWith(payload.questions)
    } else {
      partyHistoryRef.value?.startWith(payload.questions)
    }
  })
}

defineExpose({
  isRunningOrLoading,
  startKeyPractice(source: ChineseKeyQuestionSource, questions: KeyPracticePayload['questions']) {
    onKeyPractice({ source, questions } as KeyPracticePayload)
  },
})
</script>

<template>
  <div class="chinese-practice-section">
    <nav class="chinese-practice-section__tabs" aria-label="语文练习子功能">
      <button
        v-for="tab in CHINESE_PRACTICE_TABS"
        :key="tab.id"
        type="button"
        class="chinese-practice-section__tab"
        :class="{ 'is-active': activeTab === tab.id }"
        :disabled="isRunningOrLoading && activeTab !== tab.id"
        @click="selectTab(tab.id)"
      >
        {{ tab.title }}
      </button>
    </nav>

    <ChineseIdiomPanel
      v-show="activeTab === 'word-memorization'"
      ref="idiomRef"
    />
    <ChineseCharLiteracyPanel
      v-show="activeTab === 'char-literacy'"
      ref="charLiteracyRef"
    />
    <ChinesePoetryPanel
      v-show="activeTab === 'poetry-practice'"
      ref="poetryRef"
    />
    <ChineseCommonSensePanel
      v-show="activeTab === 'common-sense'"
      ref="commonSenseRef"
    />
    <ChineseHistoryCommonSensePanel
      v-show="activeTab === 'history-common-sense'"
      ref="historyCommonSenseRef"
    />
    <ChinesePartyHistoryPanel
      v-show="activeTab === 'party-history'"
      ref="partyHistoryRef"
    />
    <ChineseKeyQuestionsPanel
      v-show="activeTab === 'key-questions'"
      :active="activeTab === 'key-questions'"
      @practice="onKeyPractice"
    />
  </div>
</template>

<style scoped>
.chinese-practice-section__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.chinese-practice-section__tab {
  padding: 8px 16px;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.chinese-practice-section__tab:hover:not(:disabled) {
  border-color: var(--el-color-primary-light-5);
}

.chinese-practice-section__tab.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 55%, transparent);
}

.chinese-practice-section__tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
