<script setup lang="ts">
import { RouterView } from 'vue-router'
import PwaInstallBanner from '@/components/PwaInstallBanner.vue'
</script>

<template>
  <div class="app-root">
    <PwaInstallBanner />
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
