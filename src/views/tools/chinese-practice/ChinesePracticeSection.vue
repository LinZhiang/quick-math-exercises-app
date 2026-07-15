<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import {
  CHINESE_PRACTICE_TABS,
  DEFAULT_CHINESE_PRACTICE_TAB,
  readingSubModeFromKeySource,
  type ChineseKeyQuestionSource,
  type ChinesePracticeTabId,
} from '@/constants/chinese-practice-tabs'
import type { KeyPracticePayload } from '@/types/chinese-practice'
import ChineseCharLiteracyPanel from '@/views/tools/chinese-practice/ChineseCharLiteracyPanel.vue'
import ChineseClassicalChinesePanel from '@/views/tools/chinese-practice/ChineseClassicalChinesePanel.vue'
import ChineseEconomyCommonSensePanel from '@/views/tools/chinese-practice/ChineseEconomyCommonSensePanel.vue'
import ChineseGeographyCommonSensePanel from '@/views/tools/chinese-practice/ChineseGeographyCommonSensePanel.vue'
import ChineseHistoryCommonSensePanel from '@/views/tools/chinese-practice/ChineseHistoryCommonSensePanel.vue'
import ChineseIdiomPanel from '@/views/tools/chinese-practice/ChineseIdiomPanel.vue'
import ChineseKeyQuestionsPanel from '@/views/tools/chinese-practice/ChineseKeyQuestionsPanel.vue'
import ChineseLegalCommonSensePanel from '@/views/tools/chinese-practice/ChineseLegalCommonSensePanel.vue'
import ChineseLifeCommonSensePanel from '@/views/tools/chinese-practice/ChineseLifeCommonSensePanel.vue'
import ChinesePartyHistoryPanel from '@/views/tools/chinese-practice/ChinesePartyHistoryPanel.vue'
import ChinesePoetryPanel from '@/views/tools/chinese-practice/ChinesePoetryPanel.vue'
import ChineseReadingComprehensionPanel from '@/views/tools/chinese-practice/ChineseReadingComprehensionPanel.vue'
import ChineseRhetoricUsagePanel from '@/views/tools/chinese-practice/ChineseRhetoricUsagePanel.vue'
import ChineseTheoryPolicyPanel from '@/views/tools/chinese-practice/ChineseTheoryPolicyPanel.vue'
import ChineseWordMemorizationPanel from '@/views/tools/chinese-practice/ChineseWordMemorizationPanel.vue'

export type { KeyPracticePayload } from '@/types/chinese-practice'

const activeTab = ref<ChinesePracticeTabId>(DEFAULT_CHINESE_PRACTICE_TAB)
const idiomRef = ref<InstanceType<typeof ChineseIdiomPanel> | null>(null)
const wordMemorizationRef = ref<InstanceType<typeof ChineseWordMemorizationPanel> | null>(null)
const charLiteracyRef = ref<InstanceType<typeof ChineseCharLiteracyPanel> | null>(null)
const poetryRef = ref<InstanceType<typeof ChinesePoetryPanel> | null>(null)
const classicalChineseRef = ref<InstanceType<typeof ChineseClassicalChinesePanel> | null>(null)
const rhetoricUsageRef = ref<InstanceType<typeof ChineseRhetoricUsagePanel> | null>(null)
const readingComprehensionRef = ref<InstanceType<typeof ChineseReadingComprehensionPanel> | null>(
  null,
)
const historyCommonSenseRef = ref<InstanceType<typeof ChineseHistoryCommonSensePanel> | null>(null)
const partyHistoryRef = ref<InstanceType<typeof ChinesePartyHistoryPanel> | null>(null)
const theoryPolicyRef = ref<InstanceType<typeof ChineseTheoryPolicyPanel> | null>(null)
const legalCommonSenseRef = ref<InstanceType<typeof ChineseLegalCommonSensePanel> | null>(null)
const economyCommonSenseRef = ref<InstanceType<typeof ChineseEconomyCommonSensePanel> | null>(null)
const lifeCommonSenseRef = ref<InstanceType<typeof ChineseLifeCommonSensePanel> | null>(null)
const geographyCommonSenseRef = ref<InstanceType<typeof ChineseGeographyCommonSensePanel> | null>(
  null,
)

const isRunningOrLoading = computed(
  () =>
    idiomRef.value?.isRunningOrLoading ||
    wordMemorizationRef.value?.isRunningOrLoading ||
    charLiteracyRef.value?.isRunningOrLoading ||
    poetryRef.value?.isRunningOrLoading ||
    classicalChineseRef.value?.isRunningOrLoading ||
    rhetoricUsageRef.value?.isRunningOrLoading ||
    readingComprehensionRef.value?.isRunningOrLoading ||
    historyCommonSenseRef.value?.isRunningOrLoading ||
    partyHistoryRef.value?.isRunningOrLoading ||
    theoryPolicyRef.value?.isRunningOrLoading ||
    legalCommonSenseRef.value?.isRunningOrLoading ||
    economyCommonSenseRef.value?.isRunningOrLoading ||
    lifeCommonSenseRef.value?.isRunningOrLoading ||
    geographyCommonSenseRef.value?.isRunningOrLoading ||
    false,
)

function selectTab(id: ChinesePracticeTabId) {
  if (isRunningOrLoading.value) return
  activeTab.value = id
}

function onKeyPractice(payload: KeyPracticePayload) {
  const readingMode = readingSubModeFromKeySource(payload.source)
  const keyReview = payload.keyReview
  if (readingMode && payload.source.startsWith('reading-')) {
    activeTab.value = 'reading-comprehension'
    const questions = payload.questions as import('@/utils/readingComprehensionPractice').ReadingComprehensionQuestion[]
    void nextTick(() => {
      readingComprehensionRef.value?.startWith(questions, readingMode, keyReview)
    })
    return
  }

  activeTab.value = payload.source as ChinesePracticeTabId
  void nextTick(() => {
    if (payload.source === 'idiom-memorization') {
      idiomRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'word-memorization') {
      wordMemorizationRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'char-literacy') {
      charLiteracyRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'poetry-practice') {
      poetryRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'classical-chinese') {
      classicalChineseRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'rhetoric-usage') {
      rhetoricUsageRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'history-common-sense') {
      historyCommonSenseRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'party-history') {
      partyHistoryRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'theory-policy') {
      theoryPolicyRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'legal-common-sense') {
      legalCommonSenseRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'economy-common-sense') {
      economyCommonSenseRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'life-common-sense') {
      lifeCommonSenseRef.value?.startWith(payload.questions, keyReview)
    } else if (payload.source === 'geography-common-sense') {
      geographyCommonSenseRef.value?.startWith(payload.questions, keyReview)
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
      v-show="activeTab === 'idiom-memorization'"
      ref="idiomRef"
    />
    <ChineseWordMemorizationPanel
      v-show="activeTab === 'word-memorization'"
      ref="wordMemorizationRef"
    />
    <ChineseCharLiteracyPanel
      v-show="activeTab === 'char-literacy'"
      ref="charLiteracyRef"
    />
    <ChinesePoetryPanel
      v-show="activeTab === 'poetry-practice'"
      ref="poetryRef"
    />
    <ChineseClassicalChinesePanel
      v-show="activeTab === 'classical-chinese'"
      ref="classicalChineseRef"
    />
    <ChineseRhetoricUsagePanel
      v-show="activeTab === 'rhetoric-usage'"
      ref="rhetoricUsageRef"
    />
    <ChineseReadingComprehensionPanel
      v-show="activeTab === 'reading-comprehension'"
      ref="readingComprehensionRef"
    />
    <ChineseHistoryCommonSensePanel
      v-show="activeTab === 'history-common-sense'"
      ref="historyCommonSenseRef"
    />
    <ChinesePartyHistoryPanel
      v-show="activeTab === 'party-history'"
      ref="partyHistoryRef"
    />
    <ChineseTheoryPolicyPanel
      v-show="activeTab === 'theory-policy'"
      ref="theoryPolicyRef"
    />
    <ChineseLegalCommonSensePanel
      v-show="activeTab === 'legal-common-sense'"
      ref="legalCommonSenseRef"
    />
    <ChineseEconomyCommonSensePanel
      v-show="activeTab === 'economy-common-sense'"
      ref="economyCommonSenseRef"
    />
    <ChineseLifeCommonSensePanel
      v-show="activeTab === 'life-common-sense'"
      ref="lifeCommonSenseRef"
    />
    <ChineseGeographyCommonSensePanel
      v-show="activeTab === 'geography-common-sense'"
      ref="geographyCommonSenseRef"
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
