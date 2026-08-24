<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Notebook } from '@element-plus/icons-vue'
import { DSA_CATEGORIES } from '@/utils/dsa/dsaCatalog'
import { dsaStudyTick, summarizeDsaStudy } from '@/utils/dsa/dsaStudyStore'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'

useAppChromeTitle('数据结构与算法')
const router = useRouter()
const openCategoryId = ref(DSA_CATEGORIES[0]?.id ?? '')

const categories = computed(() => DSA_CATEGORIES)
const quizStats = computed(() => {
  void dsaStudyTick.value
  return summarizeDsaStudy()
})

function toggleCategory(id: string) {
  openCategoryId.value = openCategoryId.value === id ? '' : id
}

function openSub(categoryId: string, subId: string) {
  void router.push({ name: 'dsa-sub', params: { categoryId, subId } })
}
</script>

<template>
  <section class="dsa-page">
    <header class="dsa-page__head">
      <el-button size="small" :icon="Notebook" title="刷题日志" @click="router.push({ name: 'dsa-log' })">
        日志
      </el-button>
    </header>
    <p class="dsa-lead">目前只练 TypeScript。先选大类再选小类：迭代练循环，递归练自己调用自己。每题编辑区只留函数签名和目的，方法体请自己写。</p>
    <p v-if="quizStats.lifetimeAttempts" class="dsa-page__stats">
      累计测试 {{ quizStats.lifetimeAttempts }} 次，通过 {{ quizStats.lifetimeCorrects }}。
      <template v-if="quizStats.todayAttempts">
        今天测 {{ quizStats.todayAttempts }} 次，通过 {{ quizStats.todayCorrects }}。
      </template>
      <template v-else>今天还没有测试。</template>
    </p>
    <nav class="pb-nav" aria-label="数据结构与算法分类">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="pb-nav-cat"
        :class="{ 'is-open': openCategoryId === cat.id }"
      >
        <div class="pb-nav-cat__row">
          <button type="button" class="pb-nav-cat__btn" @click="toggleCategory(cat.id)">
            <el-icon class="pb-nav-cat__caret" :size="14"><ArrowRight /></el-icon>
            <span class="pb-nav-cat__name">{{ cat.name }}</span>
            <span class="pb-nav-cat__meta">{{ cat.subs.length }} 个小类 · {{ cat.subs.reduce((n, s) => n + s.problems.length, 0) }} 题</span>
          </button>
        </div>
        <ul v-if="openCategoryId === cat.id" class="pb-nav-subs">
          <li v-for="sub in cat.subs" :key="sub.id" class="pb-nav-sub">
            <button type="button" class="pb-nav-sub__btn" @click="openSub(cat.id, sub.id)">
              <span class="pb-nav-sub__name">{{ sub.name }}</span>
              <span class="pb-nav-sub__count">{{ sub.problems.length }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </section>
</template>

<style scoped>
.dsa-page {
  padding: 14px 12px 24px;
}

.dsa-page__head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.dsa-lead {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.dsa-page__stats {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.pb-nav {
  overflow: hidden;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(15 23 42 / 6%);
}

.pb-nav-cat + .pb-nav-cat {
  border-top: 1px solid #eef2f7;
}

.pb-nav-cat__row {
  display: flex;
  align-items: center;
  background: #f8fafc;
}

.pb-nav-cat.is-open .pb-nav-cat__row {
  background: #eff6ff;
}

.pb-nav-cat__btn {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  margin: 0;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.pb-nav-cat__caret {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.15s ease;
}

.pb-nav-cat.is-open .pb-nav-cat__caret {
  transform: rotate(90deg);
  color: #2563eb;
}

.pb-nav-cat__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pb-nav-cat__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: #64748b;
}

.pb-nav-subs {
  margin: 0;
  padding: 4px 0 8px;
  list-style: none;
  background: #fff;
  border-top: 1px solid #e8eef5;
}

.pb-nav-sub__btn {
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin: 0;
  padding: 6px 12px 6px 36px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.pb-nav-sub__btn:hover {
  background: #f8fafc;
}

.pb-nav-sub__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 650;
}

.pb-nav-sub__count {
  flex-shrink: 0;
  min-width: 1.6rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 750;
  text-align: center;
}
</style>
