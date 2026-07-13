<script setup lang="ts">
import { RouterView } from 'vue-router'
import AiProxyStatusBanner from '@/components/AiProxyStatusBanner.vue'
import PwaInstallBanner from '@/components/PwaInstallBanner.vue'
</script>

<template>
  <div class="app-root">
    <PwaInstallBanner />
    <AiProxyStatusBanner />
    <RouterView />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
