<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FactDeepenMemorizationPanel from '@/views/tools/mental-math/components/shared/FactDeepenMemorizationPanel.vue'
import MentalMathWrongBookPanel from '@/views/tools/mental-math/components/shared/MentalMathWrongBookPanel.vue'
import PracticeCompletionStat from '@/views/tools/mental-math/components/shared/PracticeCompletionStat.vue'
import { CS_VOCAB_BANK, csVocabBankTick, hydrateCsVocabBank } from '@/utils/cs-vocab/csVocabBank'
import { CS_VOCAB_TOPICS } from '@/utils/cs-vocab/csVocabTopics'
import '@/views/tools/mental-math/mental-math-page.css'

const factDeepenRef = ref<InstanceType<typeof FactDeepenMemorizationPanel> | null>(null)
const factDeepenActive = ref(false)
const hydrating = ref(true)
const bankCount = computed(() => {
  void csVocabBankTick.value
  return CS_VOCAB_BANK.length
})
const topicCount = CS_VOCAB_TOPICS.length

onMounted(async () => {
  await hydrateCsVocabBank()
  hydrating.value = false
})

function openDeepen() {
  if (!bankCount.value) return
  factDeepenRef.value?.start('cs-vocab')
}
</script>

<template>
  <div class="cs-vocab-page" :class="{ 'is-deepen': factDeepenActive }">
    <FactDeepenMemorizationPanel ref="factDeepenRef" fill @active="factDeepenActive = $event" />
    <section v-show="!factDeepenActive" class="mode-section">
      <h3 class="mode-section__title">计算机单词和语法</h3>
      <p class="mode-section__hint">
        从计算机基础、前端学习讲义里抽出的核心单词、语法和必记概念（一题一个点）。目录按
        {{ topicCount }} 种考点类型固定切分；点某一项即识记，再限时测（满组 100 秒）。答错记入下方错题集。
      </p>
      <p v-if="hydrating" class="mode-section__hint">正在同步题库…</p>
      <p v-else-if="!bankCount" class="mode-section__hint">
        还没有读到题库文件。请确认本机
        <code>src/utils/cs-vocab/bank.generated.json</code>
        已生成，然后重新构建/打开；部署后手机与电脑共用同一份静态题库。
      </p>
      <div class="mode-grid cs-vocab-grid">
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
            {{ bankCount ? `${bankCount} 题` : hydrating ? '加载中' : '暂无题目' }} · {{ topicCount }} 种类型 · 每组
            20–25 题目录可溯源 · 先识记（解析可编辑）→ 限时测（满组 100 秒）
          </p>
          <span class="mode-card__cta">进入</span>
        </button>
      </div>
      <MentalMathWrongBookPanel section="cs-vocab" />
    </section>
  </div>
</template>

<style scoped>
.cs-vocab-page {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 14px 24px;
}

.cs-vocab-page.is-deepen {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 10px 12px;
}

.cs-vocab-grid {
  grid-template-columns: minmax(0, 1fr) !important;
}
</style>
