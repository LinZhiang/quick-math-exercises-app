<script setup lang="ts">
import type { DsaComplexity } from '@/utils/dsa/dsaTypes'
import { complexityToHtml } from '@/utils/dsa/complexityFormat'

defineProps<{ complexity: DsaComplexity }>()
</script>

<template>
  <section class="dsa-cx">
    <div class="dsa-cx__col">
      <h3 class="dsa-cx__title">时间复杂度</h3>
      <ul class="dsa-cx__steps">
        <li v-for="step in complexity.steps" :key="'t-' + step.label">
          <span class="dsa-cx__label">{{ step.label }}</span>
          <span class="dsa-cx__expr" v-html="complexityToHtml(step.expr)" />
        </li>
      </ul>
      <p class="dsa-cx__sum">
        合计
        <span class="dsa-cx__expr" v-html="complexityToHtml(complexity.total)" />
        ，渐进
        <span class="dsa-cx__expr" v-html="complexityToHtml(complexity.time)" />
      </p>
    </div>
    <div class="dsa-cx__col">
      <h3 class="dsa-cx__title">空间复杂度</h3>
      <ul class="dsa-cx__steps">
        <li v-for="step in complexity.spaceSteps" :key="'s-' + step.label">
          <span class="dsa-cx__label">{{ step.label }}</span>
          <span class="dsa-cx__expr" v-html="complexityToHtml(step.expr)" />
        </li>
      </ul>
      <p class="dsa-cx__sum">
        合计
        <span class="dsa-cx__expr" v-html="complexityToHtml(complexity.spaceTotal)" />
        ，渐进
        <span class="dsa-cx__expr" v-html="complexityToHtml(complexity.space)" />
      </p>
    </div>
    <p v-if="complexity.note" class="dsa-cx__note">{{ complexity.note }}</p>
  </section>
</template>

<style scoped>
.dsa-cx {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #1e2937;
  display: grid;
  gap: 14px;
}

.dsa-cx__title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 750;
  color: #fff;
}

.dsa-cx__steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.dsa-cx__steps li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
  font-size: 13px;
}

.dsa-cx__label {
  color: #94a3b8;
}

.dsa-cx__expr {
  color: #e2e8f0;
  font-family: "Cambria Math", Cambria, "Times New Roman", serif;
  font-size: 1.05em;
  font-weight: 650;
}

.dsa-cx__expr :deep(var) {
  font-style: italic;
  font-weight: 650;
}

.dsa-cx__expr :deep(.dsa-cx-fn) {
  font-family: Cambria, "Times New Roman", serif;
  font-style: normal;
  font-weight: 650;
}

.dsa-cx__expr :deep(.dsa-cx-oh) {
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 700;
}

.dsa-cx__expr :deep(sup),
.dsa-cx__expr :deep(sub) {
  font-size: 0.72em;
  font-style: normal;
  line-height: 0;
}

.dsa-cx__expr :deep(sup) {
  vertical-align: super;
}

.dsa-cx__expr :deep(sub) {
  vertical-align: sub;
}

.dsa-cx__sum {
  margin: 10px 0 0;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
}

.dsa-cx__note {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.55;
}

@media (min-width: 640px) {
  .dsa-cx {
    grid-template-columns: 1fr 1fr;
  }

  .dsa-cx__note {
    grid-column: 1 / -1;
  }
}
</style>
