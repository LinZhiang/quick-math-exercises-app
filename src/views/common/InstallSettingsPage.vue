<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PwaInstallPanel from '@/components/PwaInstallPanel.vue'

const route = useRoute()
const panel = computed(() => (route.name === 'settings' ? 'settings' : 'install'))
</script>

<template>
  <section class="install-settings-page">
    <div class="install-settings-page__scroll">
      <PwaInstallPanel :panel="panel" />
    </div>
  </section>
</template>

<style scoped>
.install-settings-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 12px 12px;
}

.install-settings-page__scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

@media (min-width: 901px) {
  .install-settings-page {
    max-width: 56rem;
    width: 100%;
    margin: 0 auto;
    padding: 24px 40px 24px;
  }
}
</style>
