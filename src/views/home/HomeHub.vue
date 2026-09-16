<!-- 首页模块：显示哪些卡片由设置「菜单管理」控制；题库整理始终在。 -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HOME_HUB_MODULES } from '@/constants/home-hub-modules'
import { isHomeHubModuleVisible } from '@/utils/app/homeHubMenu'
import { userJsonEpoch } from '@/utils/app/syncedUserJson'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'

const router = useRouter()

const modules = computed(() => {
  void userJsonEpoch.value
  return HOME_HUB_MODULES.filter((mod) => isHomeHubModuleVisible(mod.id))
})

const showProjectCode = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})

function openModule(mod: (typeof HOME_HUB_MODULES)[number]) {
  if (!mod.ready || !mod.to) {
    ElMessage.info('即将开放')
    return
  }
  void router.push(mod.to)
}
</script>

<template>
  <section class="home-hub">
    <header class="home-hub__intro">
      <p class="home-hub__lead">选择一个模块开始。安装、登录与设置在右上角。首页卡片可在设置「菜单管理」里开关。</p>
    </header>
    <div class="home-hub__grid">
      <button type="button" class="home-hub__card" @click="router.push({ name: 'about' })">
        <h2 class="home-hub__card-title">项目介绍</h2>
        <p class="home-hub__card-desc">功能说明，只覆盖当前首页开放的模块。</p>
        <span class="home-hub__card-cta">查阅</span>
      </button>
      <button
        v-if="showProjectCode"
        type="button"
        class="home-hub__card"
        @click="router.push({ name: 'project-code' })"
      >
        <h2 class="home-hub__card-title">项目管理</h2>
        <p class="home-hub__card-desc">源码目录查阅与下载，仅管理员可见。</p>
        <span class="home-hub__card-cta">进入</span>
      </button>
      <button
        v-for="mod in modules"
        :key="mod.id"
        type="button"
        class="home-hub__card"
        :class="{ 'home-hub__card--soon': !mod.ready }"
        @click="openModule(mod)"
      >
        <h2 class="home-hub__card-title">{{ mod.title }}</h2>
        <p class="home-hub__card-desc">{{ mod.desc }}</p>
        <span class="home-hub__card-cta">{{ mod.ready ? '进入' : '即将开放' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-hub {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px 16px 20px;
  gap: 18px;
}

.home-hub__intro {
  flex-shrink: 0;
}

.home-hub__lead {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
}

.home-hub__grid {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 12px;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.home-hub__card {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-height: 7.25rem;
  padding: 16px 14px 14px;
  border: 1px solid var(--app-border-soft);
  border-radius: 16px;
  background: var(--app-surface);
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
  cursor: pointer;
  color: inherit;
}

.home-hub__card:hover {
  border-color: color-mix(in srgb, var(--app-primary) 35%, var(--app-border-soft));
}

.home-hub__card--soon {
  opacity: 0.78;
}

.home-hub__card-title {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 800;
}

.home-hub__card-desc {
  margin: 0;
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
}

.home-hub__card-cta {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-primary);
}

@media (min-width: 640px) {
  .home-hub__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (min-width: 901px) {
  .home-hub {
    max-width: 92rem;
    width: 100%;
    margin: 0 auto;
    padding: 32px 40px 44px;
    gap: 22px;
  }

  .home-hub__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .home-hub__card {
    min-height: 8.5rem;
    padding: 20px 18px 16px;
  }

  .home-hub__card-title {
    font-size: 1.22rem;
  }
}

@media (max-width: 520px) {
  .home-hub {
    padding: 14px 12px 20px;
  }
  .home-hub__card {
    min-height: 6.6rem;
    padding: 14px 12px 12px;
  }
}
</style>
