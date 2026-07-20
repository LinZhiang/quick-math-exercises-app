<script setup lang="ts">
import type { InclusionExclusionDiagramPreset } from '@/utils/inclusionExclusionPractice'

defineProps<{
  preset: InclusionExclusionDiagramPreset
  caption?: string
}>()
</script>

<template>
  <div class="venn">
    <!-- 两集合 -->
    <svg
      v-if="preset === 'venn-2'"
      class="venn__svg"
      viewBox="0 0 280 180"
      role="img"
      aria-label="两集合韦恩图"
    >
      <circle cx="110" cy="90" r="58" fill="#93c5fd" fill-opacity="0.45" stroke="#2563eb" stroke-width="2" />
      <circle cx="170" cy="90" r="58" fill="#86efac" fill-opacity="0.45" stroke="#16a34a" stroke-width="2" />
      <!-- 交叠强调 -->
      <ellipse cx="140" cy="90" rx="28" ry="42" fill="#94a3b8" fill-opacity="0.55" />
      <text x="78" y="95" text-anchor="middle" font-size="16" font-weight="700" fill="#1e40af">A</text>
      <text x="202" y="95" text-anchor="middle" font-size="16" font-weight="700" fill="#166534">B</text>
      <text x="140" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">A∩B</text>
      <text x="140" y="168" text-anchor="middle" font-size="12" fill="#475569">
        A∪B = A + B − A∩B
      </text>
    </svg>

    <!-- 三集合 -->
    <svg
      v-else-if="preset === 'venn-3'"
      class="venn__svg"
      viewBox="0 0 300 220"
      role="img"
      aria-label="三集合韦恩图"
    >
      <circle cx="130" cy="95" r="55" fill="#93c5fd" fill-opacity="0.4" stroke="#2563eb" stroke-width="1.8" />
      <circle cx="170" cy="95" r="55" fill="#86efac" fill-opacity="0.4" stroke="#16a34a" stroke-width="1.8" />
      <circle cx="150" cy="135" r="55" fill="#fcd34d" fill-opacity="0.4" stroke="#d97706" stroke-width="1.8" />
      <!-- 三重交示意 -->
      <circle cx="150" cy="108" r="14" fill="#0f172a" fill-opacity="0.75" />
      <text x="95" y="80" font-size="14" font-weight="700" fill="#1e40af">A</text>
      <text x="195" y="80" font-size="14" font-weight="700" fill="#166534">B</text>
      <text x="145" y="185" font-size="14" font-weight="700" fill="#b45309">C</text>
      <text x="150" y="112" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">三交</text>
      <text x="150" y="210" text-anchor="middle" font-size="11" fill="#475569">
        白=只一项 · 灰感=只两项 · 黑心=三项
      </text>
    </svg>

    <!-- 交最小值示意 -->
    <svg v-else class="venn__svg" viewBox="0 0 300 160" role="img" aria-label="交最小值公式">
      <rect
        x="20"
        y="30"
        width="260"
        height="70"
        rx="10"
        fill="#f0fdfa"
        stroke="#0d9488"
        stroke-width="1.5"
      />
      <text x="150" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="#0f766e">
        min(两交) = a + b − m
      </text>
      <text x="150" y="82" text-anchor="middle" font-size="14" font-weight="700" fill="#0f766e">
        min(三交) = a + b + c − 2m
      </text>
      <text x="150" y="130" text-anchor="middle" font-size="12" fill="#475569">
        规律：n 个集合交最小 = 各项之和 − (n−1)×总量 m
      </text>
    </svg>

    <p v-if="caption" class="venn__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.venn {
  margin: 10px 0 4px;
  padding: 10px 12px 12px;
  border-radius: 12px;
  background: linear-gradient(160deg, #eff6ff 0%, #f8fafc 55%, #f0fdf4 100%);
  border: 1px solid color-mix(in srgb, #2563eb 18%, #e2e8f0);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.venn__svg {
  width: min(100%, 300px);
  height: auto;
  display: block;
}

.venn__caption {
  margin: 8px 0 0;
  max-width: 320px;
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
  text-align: center;
}
</style>
