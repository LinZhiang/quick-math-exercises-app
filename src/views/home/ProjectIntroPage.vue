<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { HOME_HUB_MODULES } from '@/constants/home-hub-modules'
import {
  PROJECT_INTRO_BY_MODULE,
  PROJECT_INTRO_OVERVIEW,
  PROJECT_INTRO_STACK,
  type ProjectIntroSection,
} from '@/constants/projectIntro'
import { isHomeHubModuleVisible } from '@/utils/app/homeHubMenu'
import { userJsonEpoch } from '@/utils/app/syncedUserJson'

const openIds = ref<string[]>([PROJECT_INTRO_OVERVIEW.id])
const openLeaf = ref<string>('')

const sections = computed((): ProjectIntroSection[] => {
  void userJsonEpoch.value
  const mods = HOME_HUB_MODULES.filter((mod) => isHomeHubModuleVisible(mod.id)).map(
    (mod) => PROJECT_INTRO_BY_MODULE[mod.id],
  )
  return [PROJECT_INTRO_OVERVIEW, ...mods, PROJECT_INTRO_STACK]
})

function isOpen(id: string) {
  return openIds.value.includes(id)
}

function toggleSection(id: string) {
  if (isOpen(id)) {
    openIds.value = openIds.value.filter((x) => x !== id)
    if (openLeaf.value.startsWith(`${id}:`)) openLeaf.value = ''
    return
  }
  openIds.value = [...openIds.value, id]
}

function leafKey(sectionId: string, index: number) {
  return `${sectionId}:${index}`
}

function toggleLeaf(sectionId: string, index: number) {
  const key = leafKey(sectionId, index)
  openLeaf.value = openLeaf.value === key ? '' : key
}
</script>

<template>
  <section class="intro">
    <header class="intro__head">
      <p class="intro__kicker">功能导览</p>
      <h2 class="intro__title">项目介绍</h2>
      <p class="intro__lead">
        按菜单展开查阅。这里只说明首页当前开放的模块；关掉的模块不会出现。
      </p>
    </header>

    <nav class="intro-menu" aria-label="项目介绍目录">
      <div v-for="sec in sections" :key="sec.id" class="intro-item">
        <button
          type="button"
          class="intro-item__row"
          :class="{ 'is-open': isOpen(sec.id) }"
          :aria-expanded="isOpen(sec.id)"
          @click="toggleSection(sec.id)"
        >
          <el-icon class="intro-item__caret" :size="14"><ArrowRight /></el-icon>
          <span class="intro-item__name">{{ sec.title }}</span>
        </button>
        <p v-if="isOpen(sec.id)" class="intro-item__summary">{{ sec.summary }}</p>
        <ul v-if="isOpen(sec.id)" class="intro-sub">
          <li v-for="(leaf, idx) in sec.leaves" :key="leaf.title" class="intro-sub__li">
            <button
              type="button"
              class="intro-sub__row"
              :class="{ 'is-open': openLeaf === leafKey(sec.id, idx) }"
              :aria-expanded="openLeaf === leafKey(sec.id, idx)"
              @click="toggleLeaf(sec.id, idx)"
            >
              <el-icon class="intro-sub__caret" :size="12"><ArrowRight /></el-icon>
              <span>{{ leaf.title }}</span>
            </button>
            <p v-if="openLeaf === leafKey(sec.id, idx)" class="intro-sub__text">{{ leaf.text }}</p>
          </li>
        </ul>
      </div>
    </nav>
  </section>
</template>

<style scoped>
.intro {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 18px 16px 20px;
}

.intro__head {
  flex-shrink: 0;
  margin-bottom: 14px;
}

.intro__kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--app-text-muted);
}

.intro__title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 780;
  letter-spacing: -0.02em;
  color: var(--app-text);
}

.intro__lead {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--app-text-muted);
}

.intro-menu {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  border: 1px solid var(--app-border-soft);
  border-radius: 14px;
  background: #fff;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 transparent;
}

.intro-menu::-webkit-scrollbar {
  width: 10px;
}

.intro-menu::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 999px;
  border: 2px solid #fff;
}

.intro-item + .intro-item {
  border-top: 1px solid var(--app-border-soft);
}

.intro-item__row,
.intro-sub__row {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.intro-item__row {
  min-height: 3em;
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 700;
  align-items: flex-start;
}

.intro-item__row.is-open {
  background: #f8fafc;
}

.intro-item__caret,
.intro-sub__caret {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.16s ease;
}

.intro-item__row.is-open .intro-item__caret,
.intro-sub__row.is-open .intro-sub__caret {
  transform: rotate(90deg);
  color: var(--app-primary);
}

.intro-item__name {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.intro-item__summary {
  margin: 0;
  padding: 0 14px 10px 36px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--app-text-muted);
  background: #f8fafc;
}

.intro-sub {
  margin: 0;
  padding: 0 8px 10px 10px;
  list-style: none;
  background: #f8fafc;
}

.intro-sub__row {
  min-height: 40px;
  padding: 8px 10px 8px 22px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  border-radius: 8px;
}

.intro-sub__row.is-open {
  color: var(--app-text);
}

.intro-sub__text {
  margin: 0 10px 8px 44px;
  padding-bottom: 6px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #475569;
}

@media (min-width: 901px) {
  .intro {
    max-width: 80rem;
    width: 100%;
    margin: 0 auto;
    padding: 28px 40px 28px;
  }

  .intro__title {
    font-size: 1.5rem;
  }

  .intro-item__row:hover,
  .intro-sub__row:hover {
    background: #f1f5f9;
  }
}

@media (max-width: 520px) {
  .intro {
    padding: 12px 12px 16px;
  }

  .intro-item__row {
    min-height: 46px;
  }

  .intro-sub__text {
    margin-left: 36px;
  }
}
</style>
