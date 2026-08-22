<script setup lang="ts">
import ComputerQuizBookPanel from './ComputerQuizBookPanel.vue'
</script>

<template>
  <section class="computer-page">
    <header class="computer-page__head">
      <h2 class="computer-page__title">AI 题目整理</h2>
      <p class="computer-page__lead">
        按讲义目录归类，只显示已有错题或收藏的分类。点进分类后查看题目并测验。顶栏返回可回到计算机基础。
      </p>
    </header>
    <div class="computer-tree-card">
      <ComputerQuizBookPanel />
    </div>
  </section>
</template>

<style scoped>
.computer-page {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 16px 12px;
}

.computer-page__head {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.computer-page__title {
  margin: 0 0 6px;
  font-size: 1.28rem;
  font-weight: 800;
}

.computer-page__lead {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.computer-tree-card {
  flex: 1 1 0;
  min-height: 0;
  max-width: 52rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgb(15 23 42 / 5%);
}
</style>
