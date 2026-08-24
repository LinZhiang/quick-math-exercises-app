<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { findDsaSub } from '@/utils/dsa/dsaCatalog'
import { dsaStudyTick, getDsaProblemStats } from '@/utils/dsa/dsaStudyStore'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'

const route = useRoute()
const router = useRouter()
const hit = computed(() =>
  findDsaSub(String(route.params.categoryId ?? ''), String(route.params.subId ?? '')),
)
const title = computed(() => hit.value?.sub.name ?? '数据结构与算法')
useAppChromeTitle(title)

const problemStats = computed(() => {
  void dsaStudyTick.value
  const rows = hit.value?.sub.problems ?? []
  return Object.fromEntries(rows.map((p) => [p.id, getDsaProblemStats(p.id)]))
})

function openProblem(problemId: string) {
  if (!hit.value) return
  void router.push({
    name: 'dsa-problem',
    params: {
      categoryId: hit.value.cat.id,
      subId: hit.value.sub.id,
      problemId,
    },
  })
}
</script>

<template>
  <section v-if="hit" class="dsa-page">
    <p class="dsa-lead">{{ hit.cat.name }} · {{ hit.sub.lead }}</p>
    <ul class="dsa-list">
      <li v-for="p in hit.sub.problems" :key="p.id">
        <button type="button" class="dsa-list__btn" @click="openProblem(p.id)">
          <span class="dsa-list__main">
            <span class="dsa-list__title">{{ p.index }}. {{ p.title }}</span>
            <span class="dsa-list__stat">
              刷题 {{ problemStats[p.id]?.attempts ?? 0 }} · 正确 {{ problemStats[p.id]?.corrects ?? 0 }}
            </span>
          </span>
          <el-icon :size="14"><ArrowRight /></el-icon>
        </button>
      </li>
    </ul>
  </section>
  <p v-else class="dsa-page dsa-lead">没有找到该分类。</p>
</template>

<style scoped>
.dsa-page {
  padding: 14px 12px 24px;
}

.dsa-lead {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.dsa-list {
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  background: #fff;
}

.dsa-list li + li {
  border-top: 1px solid #eef2f7;
}

.dsa-list__btn {
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 52px;
  margin: 0;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dsa-list__main {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.dsa-list__btn:hover {
  background: #f8fafc;
}

.dsa-list__title {
  font-size: 16px;
  font-weight: 700;
}

.dsa-list__stat {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.dsa-list__btn .el-icon {
  color: #94a3b8;
}
</style>
