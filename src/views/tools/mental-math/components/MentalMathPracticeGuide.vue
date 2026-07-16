<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID,
  findMentalMathGuideArticle,
  MENTAL_MATH_GUIDE_GROUPS,
  mentalMathGuideGroupForArticle,
  type MentalMathGuideArticle,
} from '@/constants/mental-math-practice-guide'
import type { PracticeHubSectionId } from '@/constants/practice-hub-sections'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'start-practice', modeId: string): void
  (e: 'go-chinese-tab', tabId: string): void
}>()

const activeArticleId = ref(DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID)
const activeGuideGroupId = ref<PracticeHubSectionId>(
  mentalMathGuideGroupForArticle(DEFAULT_MENTAL_MATH_GUIDE_ARTICLE_ID)?.id ??
    MENTAL_MATH_GUIDE_GROUPS[0]?.id ??
    'guide',
)

const activeArticle = computed(() => findMentalMathGuideArticle(activeArticleId.value))

const activeGuideGroup = computed(
  () =>
    MENTAL_MATH_GUIDE_GROUPS.find((g) => g.id === activeGuideGroupId.value) ??
    MENTAL_MATH_GUIDE_GROUPS[0]!,
)

const showGuideLevel2 = computed(() => (activeGuideGroup.value?.articles.length ?? 0) > 1)

const guideNavItems = computed(() =>
  MENTAL_MATH_GUIDE_GROUPS.map((group) => {
    if (group.articles.length === 1) {
      return { kind: 'article' as const, article: group.articles[0]!, groupId: group.id }
    }
    return { kind: 'group' as const, group }
  }),
)

const breadcrumb = computed(() => {
  const article = activeArticle.value
  if (!article) return '练习攻略'
  const group = mentalMathGuideGroupForArticle(article.id)
  if (!group || group.id === 'guide') return article.title
  return `${group.title} · ${article.title}`
})

watch(activeArticleId, (id) => {
  const group = mentalMathGuideGroupForArticle(id)
  if (group) activeGuideGroupId.value = group.id
})

function selectGuideGroup(groupId: PracticeHubSectionId) {
  if (props.disabled) return
  activeGuideGroupId.value = groupId
  const group = MENTAL_MATH_GUIDE_GROUPS.find((g) => g.id === groupId)
  if (!group?.articles.length) return
  if (!group.articles.some((a) => a.id === activeArticleId.value)) {
    activeArticleId.value = group.articles[0]!.id
  }
}

function isGuideLevel1Active(item: (typeof guideNavItems.value)[number]): boolean {
  if (item.kind === 'group') {
    return activeGuideGroupId.value === item.group.id && showGuideLevel2.value
  }
  return activeArticleId.value === item.article.id
}

function selectArticle(article: MentalMathGuideArticle) {
  activeArticleId.value = article.id
  const group = mentalMathGuideGroupForArticle(article.id)
  if (group) activeGuideGroupId.value = group.id
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
      <div class="mm-guide-nav__mobile">
        <div class="mm-guide-nav__mobile-l1" aria-label="一级分类">
          <template
            v-for="item in guideNavItems"
            :key="item.kind === 'group' ? item.group.id : item.article.id"
          >
            <button
              v-if="item.kind === 'group'"
              type="button"
              class="mm-guide-nav__group-chip"
              :class="{ 'is-active': isGuideLevel1Active(item) }"
              :disabled="disabled"
              @click="selectGuideGroup(item.group.id)"
            >
              {{ item.group.title }}
            </button>
            <button
              v-else
              type="button"
              class="mm-guide-nav__group-chip mm-guide-nav__group-chip--leaf"
              :class="{ 'is-active': isGuideLevel1Active(item) }"
              :disabled="disabled"
              @click="selectArticle(item.article)"
            >
              {{ item.article.title }}
            </button>
          </template>
        </div>
        <div
          v-show="showGuideLevel2"
          class="mm-guide-nav__mobile-l2"
          aria-label="二级文章"
        >
          <button
            v-for="article in activeGuideGroup.articles"
            :key="article.id"
            type="button"
            class="mm-guide-nav__item mm-guide-nav__item--chip"
            :class="{ 'mm-guide-nav__item--active': activeArticleId === article.id }"
            :disabled="disabled"
            @click="selectArticle(article)"
          >
            {{ article.title }}
          </button>
        </div>
      </div>

      <div class="mm-guide-nav__desktop">
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

.mm-guide-nav__mobile {
  display: none;
}

.mm-guide-nav__desktop {
  display: block;
}

.mm-guide-nav__group + .mm-guide-nav__group {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border-soft);
}

.mm-guide-nav__group-title {
  margin: 0 0 8px;
  padding: 2px 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--app-text);
  line-height: 1.35;
}

.mm-guide-nav__list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 6px;
  border-left: 2px solid color-mix(in srgb, var(--app-border) 70%, transparent);
  margin-left: 8px;
}

.mm-guide-nav__item {
  display: block;
  width: 100%;
  margin: 0;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--app-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.mm-guide-nav__item:hover:not(:disabled) {
  background: color-mix(in srgb, var(--app-surface) 80%, transparent);
  color: var(--app-text);
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
    border-right: none;
    border-bottom: 1px solid var(--app-border-soft);
    max-height: none;
    overflow: visible;
    padding: 10px 12px;
  }

  .mm-guide-nav__desktop {
    display: none;
  }

  .mm-guide-nav__mobile {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: -10px -12px;
  }

  .mm-guide-nav__mobile-l1,
  .mm-guide-nav__mobile-l2 {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    overflow: visible;
  }

  .mm-guide-nav__mobile-l1 {
    padding: 8px 12px;
    background: color-mix(in srgb, var(--app-border-soft) 35%, var(--app-surface-alt));
    border-bottom: 1px solid var(--app-border);
  }

  .mm-guide-nav__mobile-l2 {
    padding: 8px 12px 10px;
    background: var(--app-surface);
  }

  .mm-guide-nav__group-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--app-text-muted);
    text-align: center;
    white-space: normal;
    word-break: break-all;
    cursor: pointer;
  }

  .mm-guide-nav__group-chip.is-active {
    border-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent);
    background: var(--app-surface);
    color: var(--el-color-primary);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .mm-guide-nav__group-chip:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .mm-guide-nav__item--chip {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    white-space: normal;
    word-break: break-all;
    padding: 7px 4px;
    border-radius: 999px;
    border: 1px solid var(--app-border-soft);
    background: var(--app-surface-alt);
    font-size: 12px;
    line-height: 1.25;
    text-align: center;
  }

  .mm-guide-nav__item--chip.mm-guide-nav__item--active {
    border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    background: color-mix(in srgb, var(--el-color-primary-light-9) 75%, transparent);
    color: var(--el-color-primary);
  }

  .mm-guide-main {
    padding: 14px 12px 18px;
  }

  .mm-guide-main__title {
    font-size: 1.05rem;
  }
}
</style>
