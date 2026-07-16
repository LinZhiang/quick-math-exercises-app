<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-root">
    <RouterView />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-top: var(--app-safe-top, 0px);
  padding-right: var(--app-safe-right, 0px);
  padding-bottom: var(--app-safe-bottom, 0px);
  padding-left: var(--app-safe-left, 0px);
}
</style>
