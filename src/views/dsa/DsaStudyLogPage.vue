<script setup lang="ts">
import DsaStudyLogPanel from './DsaStudyLogPanel.vue'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'

useAppChromeTitle('刷题日志')
</script>

<template>
  <section class="dsa-log-page">
    <header class="dsa-log-page__head">
      <h2 class="dsa-log-page__title">刷题日志</h2>
      <p class="dsa-log-page__lead">记录保存在这台设备。顶栏返回可回到数据结构与算法。</p>
    </header>
    <div class="dsa-log-page__card">
      <DsaStudyLogPanel />
    </div>
  </section>
</template>

<style scoped>
.dsa-log-page {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 16px 12px;
}

.dsa-log-page__head {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.dsa-log-page__title {
  margin: 0 0 6px;
  font-size: 1.28rem;
  font-weight: 800;
}

.dsa-log-page__lead {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.dsa-log-page__card {
  flex: 1 1 0;
  min-height: 0;
  max-width: 52rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgb(15 23 42 / 5%);
}
</style>
