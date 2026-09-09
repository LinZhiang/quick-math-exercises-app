<script setup lang="ts">
import { computed, ref } from 'vue'
import FactDeepenMemorizationPanel from '@/views/tools/mental-math/components/shared/FactDeepenMemorizationPanel.vue'
import MentalMathWrongBookPanel from '@/views/tools/mental-math/components/shared/MentalMathWrongBookPanel.vue'
import PracticeCompletionStat from '@/views/tools/mental-math/components/shared/PracticeCompletionStat.vue'
import { CS_VOCAB_BANK } from '@/utils/cs-vocab/csVocabBank'
import { CS_VOCAB_TOPICS } from '@/utils/cs-vocab/csVocabTopics'
import '@/views/tools/mental-math/mental-math-page.css'

const factDeepenRef = ref<InstanceType<typeof FactDeepenMemorizationPanel> | null>(null)
const factDeepenActive = ref(false)
const bankCount = computed(() => CS_VOCAB_BANK.length)
const topicCount = CS_VOCAB_TOPICS.length

function openDeepen() {
  factDeepenRef.value?.start('cs-vocab')
}
</script>

<template>
  <div class="mental-math-page">
    <div class="practice-main">
      <FactDeepenMemorizationPanel ref="factDeepenRef" @active="factDeepenActive = $event" />
      <section v-show="!factDeepenActive" class="mode-section">
        <h3 class="mode-section__title">计算机单词和语法</h3>
        <p class="mode-section__hint">
          从计算机基础、前端学习讲义里抽出的核心单词、语法和必记概念（一题一个点）。目录按
          {{ topicCount }} 种考点类型固定切分；点某一项即识记，再限时测（满组 100 秒）。答错记入下方错题集。
        </p>
        <p v-if="!bankCount" class="mode-section__hint">
          本机尚未生成题库。请在项目根目录运行
          <code>node scripts/cs-vocab-bank.mjs</code>
          （脚本与生成的 JSON 都不进公开 git）。
        </p>
        <div class="mode-grid">
          <button
            type="button"
            class="mode-card mode-card--cs-vocab mode-card--deepen"
            :disabled="!bankCount"
            @click="openDeepen"
          >
            <h3 class="mode-card__title">
              加深识记
              <PracticeCompletionStat mode-id="cs-vocab-deepen-normal" perfect-label="全对" />
            </h3>
            <p class="mode-card__desc">
              {{ bankCount ? `${bankCount} 题` : '暂无题目' }} · {{ topicCount }} 种类型 · 每组 20–25
              题目录可溯源 · 先识记（解析可编辑）→ 限时测（满组 100 秒）
            </p>
            <span class="mode-card__cta">进入</span>
          </button>
        </div>
        <MentalMathWrongBookPanel section="cs-vocab" />
      </section>
    </div>
  </div>
</template>
