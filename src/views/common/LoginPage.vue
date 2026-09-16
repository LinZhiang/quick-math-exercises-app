<script setup lang="ts">
import DeepseekApiAuthPanel from '@/components/DeepseekApiAuthPanel.vue'
</script>

<template>
  <section class="login-page">
    <DeepseekApiAuthPanel />
  </section>
</template>

<style scoped>
.login-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 12px 20px;
}
</style>
