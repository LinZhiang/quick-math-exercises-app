<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PwaInstallPanel from '@/components/PwaInstallPanel.vue'

const route = useRoute()
const panel = computed(() => (route.name === 'settings' ? 'settings' : 'install'))
</script>

<template>
  <section class="install-settings-page">
    <PwaInstallPanel :panel="panel" />
  </section>
</template>

<style scoped>
.install-settings-page {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 12px 20px;
}
</style>
