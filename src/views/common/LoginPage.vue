<script setup lang="ts">
import DeepseekApiAuthPanel from '@/components/DeepseekApiAuthPanel.vue'
</script>

<template>
  <section class="login-page">
    <div class="login-page__scroll">
      <DeepseekApiAuthPanel />
    </div>
  </section>
</template>

<style scoped>
.login-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 12px 12px;
}

.login-page__scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

@media (min-width: 901px) {
  .login-page {
    max-width: 56rem;
    width: 100%;
    margin: 0 auto;
    padding: 24px 40px 24px;
  }
}
</style>
