<!-- 根壳：顶栏返回/标题；安装、登录与设置按钮只在首页出现。 -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { appChromeTitleOverride } from '@/composables/app/useAppChrome'
import { goBackOr } from '@/utils/app/appNavigation'
import { chromeBackFallback } from '@/utils/app/chromeBackFallback'
import JsonTransferButtons from '@/components/JsonTransferButtons.vue'
import { hydrateUserJsonStore } from '@/utils/app/syncedUserJson'
import { hydrateCsVocabBank } from '@/utils/cs-vocab/csVocabBank'
import { getWenguUser, wenguAuthTick } from '@/utils/computer/wenguAuthStore'

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
const showChromeTools = computed(
  () => !hideBack.value || isHome.value || showDataTransfer.value,
)

watch(
  wenguAuthTick,
  () => {
    void hydrateUserJsonStore()
    void hydrateCsVocabBank()
  },
  { immediate: true },
)

function goChrome(name: 'install' | 'settings' | 'login') {
  if (route.name === name) return
  void router.push({ name })
}

const loginButtonLabel = computed(() => {
  void wenguAuthTick.value
  const user = getWenguUser()
  return user ? user.username : '登录'
})

function onChromeBack() {
  goBackOr(router, chromeBackFallback(route))
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
      <div v-if="showChromeTools" class="app-chrome__tools">
        <div class="app-chrome__side app-chrome__side--left">
          <el-button v-if="!hideBack" size="small" @click="onChromeBack">返回</el-button>
        </div>
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
          <el-button
            v-if="isHome"
            size="small"
            :type="route.name === 'login' ? 'primary' : 'default'"
            @click="goChrome('login')"
          >
            {{ loginButtonLabel }}
          </el-button>
        </div>
      </div>
      <h1 class="app-chrome__title">{{ chromeTitle }}</h1>
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--app-border-soft);
  background: var(--app-surface);
}

.app-chrome__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.app-chrome__side {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.app-chrome__side--left {
  justify-content: flex-start;
}

.app-chrome__side--right {
  margin-left: auto;
  justify-content: flex-end;
}

.app-chrome__title {
  margin: 0;
  flex: none;
  width: 100%;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  overflow: visible;
  white-space: normal;
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

@media (min-width: 901px) {
  .app-chrome {
    padding: 10px 40px;
    gap: 12px;
  }

  .app-chrome__title {
    font-size: 1.2rem;
  }
}
</style>
