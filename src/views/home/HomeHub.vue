<!-- 首页模块：知识训练、题库整理、计算机基础、前端学习、数据结构与算法。 -->
<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const modules: {
  id: string
  title: string
  desc: string
  ready: boolean
  to?: RouteLocationRaw
}[] = [
  {
    id: 'train',
    title: '知识训练',
    desc: '口算、快判、数学推理、语文练习与练习日志',
    ready: true,
    to: { name: 'train', params: { section: 'log' } },
  },
  {
    id: 'bank',
    title: '题库整理',
    desc: '个人题库：分类、拍照录入、测验与导出',
    ready: true,
    to: { name: 'bank' },
  },
  {
    id: 'computer',
    title: '计算机基础',
    desc: '讲义树形分类；已开放「计算机概述」',
    ready: true,
    to: { name: 'computer' },
  },
  {
    id: 'frontend',
    title: '前端学习',
    desc: '讲义树形分类；目录与正文保存在 Node，不写死在前端',
    ready: true,
    to: { name: 'frontend' },
  },
  {
    id: 'dsa',
    title: '数据结构与算法',
    desc: '编程练习：先看题，再补全 JavaScript 并测试执行结果',
    ready: true,
    to: { name: 'dsa' },
  },
]

function openModule(mod: (typeof modules)[number]) {
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
      <p class="home-hub__lead">选择一个模块开始。安装与登录在右上角。</p>
    </header>
    <div class="home-hub__grid">
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
  overflow: auto;
  padding: 20px 16px 28px;
  gap: 18px;
}

.home-hub__intro {
  max-width: 40rem;
}

.home-hub__lead {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
}

.home-hub__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
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

@media (min-width: 1100px) {
  .home-hub {
    max-width: 76rem;
    width: 100%;
    margin: 0 auto;
    padding: 32px 36px 40px;
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
