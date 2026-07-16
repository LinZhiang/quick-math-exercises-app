<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID,
  findMentalMathGuideArticle,
  MENTAL_MATH_GUIDE_GROUPS,
  mentalMathGuideGroupForArticle,
  type MentalMathGuideArticle,
} from '@/constants/mental-math-practice-guide'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'start-practice', modeId: string): void
  (e: 'go-chinese-tab', tabId: string): void
}>()

const activeArticleId = ref(DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID)

const activeArticle = computed(() => findMentalMathGuideArticle(activeArticleId.value))

const breadcrumb = computed(() => {
  const article = activeArticle.value
  if (!article) return '练习攻略'
  const group = mentalMathGuideGroupForArticle(article.id)
  if (!group || group.id === 'guide') return article.title
  return `${group.title} · ${article.title}`
})

function selectArticle(article: MentalMathGuideArticle) {
  activeArticleId.value = article.id
}

function startLinkedPractice() {
  const article = activeArticle.value
  if (!article || props.disabled) return
  if (article.chineseTabId) {
    emit('go-chinese-tab', article.chineseTabId)
    return
  }
  const modeId = article.practiceModeId
  if (!modeId) return
  emit('start-practice', modeId)
}

const hasPracticeLink = computed(
  () => Boolean(activeArticle.value?.practiceModeId || activeArticle.value?.chineseTabId),
)

const practiceLinkLabel = computed(() => {
  const article = activeArticle.value
  if (!article) return '去练习'
  if (article.chineseTabId === 'classical-chinese') return '去练习：文言知识'
  if (article.chineseTabId) return `去练习：${article.title}`
  return `去练习：${article.title}`
})

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) return
  },
)
</script>

<template>
  <div class="mm-guide">
    <nav class="mm-guide-nav" aria-label="攻略目录">
      <div v-for="group in MENTAL_MATH_GUIDE_GROUPS" :key="group.id" class="mm-guide-nav__group">
        <p class="mm-guide-nav__group-title">{{ group.title }}</p>
        <ul class="mm-guide-nav__list">
          <li v-for="article in group.articles" :key="article.id">
            <button
              type="button"
              class="mm-guide-nav__item"
              :class="{ 'mm-guide-nav__item--active': activeArticleId === article.id }"
              :disabled="disabled"
              @click="selectArticle(article)"
            >
              {{ article.title }}
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <article v-if="activeArticle" class="mm-guide-main">
      <header class="mm-guide-main__head">
        <p class="mm-guide-main__crumb">{{ breadcrumb }}</p>
        <h3 class="mm-guide-main__title">{{ activeArticle.title }}</h3>
      </header>

      <div class="mm-guide-main__body">
        <template v-for="(block, idx) in activeArticle.blocks" :key="idx">
          <p v-if="block.type === 'p'" class="mm-block mm-block--p">{{ block.text }}</p>
          <h4 v-else-if="block.type === 'h3'" class="mm-block mm-block--h3">{{ block.text }}</h4>
          <h5 v-else-if="block.type === 'h4'" class="mm-block mm-block--h4">{{ block.text }}</h5>
          <ul v-else-if="block.type === 'ul'" class="mm-block mm-block--ul">
            <li v-for="(line, j) in block.items" :key="j">{{ line }}</li>
          </ul>
          <ol v-else-if="block.type === 'ol'" class="mm-block mm-block--ol">
            <li v-for="(line, j) in block.items" :key="j">{{ line }}</li>
          </ol>
          <p v-else-if="block.type === 'tip'" class="mm-block mm-block--tip">
            <strong>提示：</strong>{{ block.text }}
          </p>
          <blockquote v-else-if="block.type === 'quote'" class="mm-block mm-block--quote">
            {{ block.text }}
          </blockquote>
        </template>
      </div>

      <footer v-if="hasPracticeLink" class="mm-guide-main__foot">
        <el-button type="primary" :disabled="disabled" @click="startLinkedPractice">
          {{ practiceLinkLabel }}
        </el-button>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.mm-guide {
  display: grid;
  grid-template-columns: minmax(140px, 200px) minmax(0, 1fr);
  gap: 0;
  min-height: min(62vh, 520px);
}

.mm-guide-nav {
  padding: 12px 10px;
  border-right: 1px solid var(--app-border-soft);
  background: color-mix(in srgb, var(--app-surface-alt) 65%, transparent);
  overflow-y: auto;
}

.mm-guide-nav__group + .mm-guide-nav__group {
  margin-top: 12px;
}

.mm-guide-nav__group-title {
  margin: 0 0 6px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.mm-guide-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mm-guide-nav__item {
  display: block;
  width: 100%;
  margin: 0;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
  color: var(--app-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.mm-guide-nav__item:hover:not(:disabled) {
  background: color-mix(in srgb, var(--app-surface) 80%, transparent);
}

.mm-guide-nav__item--active {
  background: color-mix(in srgb, var(--el-color-primary-light-9, #eff6ff) 85%, transparent);
  color: var(--el-color-primary);
  font-weight: 600;
}

.mm-guide-nav__item:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mm-guide-main {
  padding: 16px 18px 20px;
  overflow-y: auto;
}

.mm-guide-main__head {
  margin-bottom: 14px;
}

.mm-guide-main__crumb {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.mm-guide-main__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.mm-guide-main__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mm-block--p {
  margin: 0;
  line-height: 1.65;
  font-size: 14px;
}

.mm-block--h3 {
  margin: 8px 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.mm-block--h4 {
  margin: 6px 0 2px;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
}

.mm-block--ul,
.mm-block--ol {
  margin: 0;
  padding-left: 1.35rem;
  font-size: 14px;
  line-height: 1.6;
}

.mm-block--tip {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--el-color-warning-light-9, #fffbeb) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-warning-light-5, #fcd34d) 45%, transparent);
  font-size: 13px;
  line-height: 1.55;
}

.mm-block--quote {
  margin: 4px 0 0;
  padding: 10px 12px 10px 14px;
  border-left: 3px solid var(--el-color-primary);
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--el-color-primary-light-9, #eff6ff) 70%, transparent);
  font-size: 13px;
  line-height: 1.6;
  color: var(--app-text);
}

.mm-guide-main__foot {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border-soft);
}

@media (max-width: 720px) {
  .mm-guide {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .mm-guide-nav {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 10px;
    border-right: none;
    border-bottom: 1px solid var(--app-border-soft);
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 10px 12px;
  }

  .mm-guide-nav::-webkit-scrollbar {
    display: none;
  }

  .mm-guide-nav__group {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
  }

  .mm-guide-nav__group + .mm-guide-nav__group {
    margin-top: 0;
    padding-left: 10px;
    border-left: 1px solid var(--app-border-soft);
  }

  .mm-guide-nav__group-title {
    margin: 0;
    padding: 0;
    font-size: 11px;
    white-space: nowrap;
  }

  .mm-guide-nav__list {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  .mm-guide-nav__item {
    width: auto;
    white-space: nowrap;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid var(--app-border-soft);
    background: var(--app-surface);
    font-size: 12px;
  }

  .mm-guide-nav__item--active {
    border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
  }

  .mm-guide-main {
    padding: 14px 12px 18px;
  }

  .mm-guide-main__title {
    font-size: 1.05rem;
  }
}
</style>
