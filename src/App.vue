<!-- 根壳：顶栏返回/标题；安装与设置按钮只在首页（chrome=home）出现。 -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { appChromeTitleOverride } from '@/composables/app/useAppChrome'
import { goBackOr, omitQueryKey } from '@/utils/app/appNavigation'
import JsonTransferButtons from '@/components/JsonTransferButtons.vue'

const route = useRoute()
const router = useRouter()

const isHome = computed(() => route.name === 'home')
const chromeTitle = computed(() => {
  const override = appChromeTitleOverride.value
  if (override) return override
  const metaTitle = route.meta.title
  return typeof metaTitle === 'string' ? metaTitle : '学习App'
})

const hideBack = computed(() => isHome.value)
const dataTransferKind = computed(() =>
  route.name === 'bank' || route.name === 'bank-sub' ? 'bank' : 'train',
)
const showDataTransfer = computed(() => {
  const name = String(route.name ?? '')
  return (name === 'train' || name === 'bank' || name === 'bank-sub') && route.query.play !== '1'
})

function chromeFallback(): RouteLocationRaw {
  const name = String(route.name ?? '')
  if (name === 'train' && route.query.play === '1') {
    return {
      name: 'train',
      params: route.params,
      query: omitQueryKey(route.query, 'play'),
    }
  }
  if (name === 'bank-sub') {
    const view = String(route.query.view ?? '')
    const photoTarget = String(route.query.photoTarget ?? 'full')
    const photoIntent = String(route.query.photoIntent ?? 'recognize')
    if (view === 'photo' && (photoTarget !== 'full' || photoIntent === 'upload')) {
      const qid = route.query.qid
      return {
        name: 'bank-sub',
        params: route.params,
        query: qid ? { view: 'edit', qid: String(qid) } : { view: 'new' },
      }
    }
    if (view) {
      return { name: 'bank-sub', params: route.params }
    }
    return { name: 'bank' }
  }
  if (name === 'computer-item') {
    const photo = String(route.query.photo ?? '')
    if (photo === 'recognize' || photo === 'upload') {
      return {
        name: 'computer-item',
        params: route.params,
        query: omitQueryKey(route.query, 'photo'),
      }
    }
    if (route.query.edit === '1') {
      return { name: 'computer-item', params: route.params }
    }
    return { name: 'computer' }
  }
  if (name === 'computer-book-node') {
    return { name: 'computer-book' }
  }
  if (name === 'computer-book' || name === 'computer-log') {
    return { name: 'computer' }
  }
  if (name === 'frontend-item') {
    const photo = String(route.query.photo ?? '')
    if (photo === 'recognize' || photo === 'upload') {
      return {
        name: 'frontend-item',
        params: route.params,
        query: omitQueryKey(route.query, 'photo'),
      }
    }
    if (route.query.edit === '1') {
      return { name: 'frontend-item', params: route.params }
    }
    return { name: 'frontend' }
  }
  if (name === 'frontend-book-node') {
    return { name: 'frontend-book' }
  }
  if (name === 'frontend-book' || name === 'frontend-log') {
    return { name: 'frontend' }
  }
  if (name === 'dsa-problem') {
    return {
      name: 'dsa-sub',
      params: {
        categoryId: String(route.params.categoryId ?? ''),
        subId: String(route.params.subId ?? ''),
      },
    }
  }
  if (name === 'dsa-log') return { name: 'dsa' }
  if (name === 'dsa-sub') return { name: 'dsa' }
  if (name === 'train' || name === 'bank' || name === 'install' || name === 'settings' || name === 'computer' || name === 'frontend' || name === 'dsa') {
    return { name: 'home' }
  }
  return { name: 'home' }
}

function goChrome(name: 'install' | 'settings') {
  if (route.name === name) return
  void router.push({ name })
}

function onChromeBack() {
  goBackOr(router, chromeFallback())
}

watch(
  chromeTitle,
  (title) => {
    document.title = title || '学习App'
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-root">
    <header class="app-chrome">
      <div class="app-chrome__side app-chrome__side--left">
        <el-button v-if="!hideBack" size="small" @click="onChromeBack">返回</el-button>
      </div>
      <h1 class="app-chrome__title">{{ chromeTitle }}</h1>
      <div class="app-chrome__side app-chrome__side--right">
        <JsonTransferButtons
          v-if="showDataTransfer"
          :kind="dataTransferKind"
          variant="chrome"
        />
        <el-button
          v-if="isHome"
          size="small"
          :type="route.name === 'install' ? 'primary' : 'default'"
          @click="goChrome('install')"
        >
          安装
        </el-button>
        <el-button
          v-if="isHome"
          size="small"
          :type="route.name === 'settings' ? 'primary' : 'default'"
          @click="goChrome('settings')"
        >
          设置
        </el-button>
      </div>
    </header>
    <div class="app-body">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-root {
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: var(--app-safe-top, 0px);
  padding-right: var(--app-safe-right, 0px);
  padding-bottom: var(--app-safe-bottom, 0px);
  padding-left: var(--app-safe-left, 0px);
}

.app-chrome {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(4.5rem, auto) minmax(0, 1fr) minmax(0, auto);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--app-border-soft);
  background: var(--app-surface);
}

.app-chrome__side {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.app-chrome__side--left {
  justify-content: flex-start;
}

.app-chrome__side--right {
  position: relative;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.app-chrome__title {
  margin: 0;
  min-width: 0;
  max-width: min(58vw, 22rem);
  font-size: 1.12rem;
  font-weight: 800;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-body {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body > * {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
}
</style>
