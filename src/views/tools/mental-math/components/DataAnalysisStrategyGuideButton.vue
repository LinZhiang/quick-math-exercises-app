<script setup lang="ts">
import { computed, ref } from 'vue'
import { getDataAnalysisStrategyGuide } from '@/constants/dataAnalysisStrategyGuides'
import { getMathOpStrategyGuide } from '@/constants/mathOpStrategyGuides'
import { renderDataAnalysisMathHtml } from '@/utils/dataAnalysisMathDisplay'
import GeometryFigureView from '@/views/tools/mental-math/components/GeometryFigureView.vue'
import type { GeometryFigureSpec } from '@/utils/geometryPractice'

const props = defineProps<{
  topicId: string
}>()

const visible = ref(false)

const guide = computed(
  () => getDataAnalysisStrategyGuide(props.topicId) ?? getMathOpStrategyGuide(props.topicId),
)

function mathHtml(text: string): string {
  return renderDataAnalysisMathHtml(text)
}

function open(ev?: Event) {
  ev?.stopPropagation()
  if (!guide.value) return
  visible.value = true
}

function toFigure(item: {
  kind: GeometryFigureSpec['kind']
  labels: Record<string, string>
  note?: string
}): GeometryFigureSpec {
  return {
    kind: item.kind,
    labels: item.labels,
    note: item.note,
  }
}
</script>

<template>
  <span class="da-strategy">
    <el-button
      class="da-strategy__btn"
      size="small"
      type="primary"
      plain
      :disabled="!guide"
      @click="open"
    >
      答题攻略
    </el-button>

    <el-dialog
      v-model="visible"
      :title="guide ? `答题攻略 · ${guide.title}` : '答题攻略'"
      :width="
        topicId === 'geometry' ||
        topicId === 'right-triangle' ||
        topicId === 'similar-triangle' ||
        topicId === 'coloring'
          ? 'min(720px, 96vw)'
          : 'min(640px, 94vw)'
      "
      top="6vh"
      append-to-body
      destroy-on-close
      class="da-strategy-dialog"
      @click.stop
    >
      <div v-if="guide" class="da-strategy__body">
        <template v-for="(block, idx) in guide.blocks" :key="idx">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-if="block.type === 'p'" class="da-strategy__p" v-html="mathHtml(block.text)" />
          <h3 v-else-if="block.type === 'h3'" class="da-strategy__h3">{{ block.text }}</h3>
          <ul v-else-if="block.type === 'ul'" class="da-strategy__ul">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <li v-for="(item, j) in block.items" :key="j" v-html="mathHtml(item)" />
          </ul>
          <div v-else-if="block.type === 'tip'" class="da-strategy__tip">
            <span class="da-strategy__tip-label">提示</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="mathHtml(block.text)" />
          </div>
          <div v-else-if="block.type === 'example'" class="da-strategy__example">
            <p class="da-strategy__example-title">{{ block.title }}</p>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p class="da-strategy__example-text" v-html="mathHtml(block.text)" />
          </div>
          <div v-else-if="block.type === 'geo-gallery'" class="geo-gallery">
            <p v-if="block.title" class="geo-gallery__title">{{ block.title }}</p>
            <div class="geo-gallery__grid">
              <div v-for="(item, j) in block.items" :key="j" class="geo-gallery__card">
                <GeometryFigureView :figure="toFigure(item)" />
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p class="geo-gallery__caption" v-html="mathHtml(item.caption)" />
              </div>
            </div>
          </div>
          <div v-else-if="block.type === 'cross-diagram'" class="cross-diagram">
            <p v-if="block.title" class="cross-diagram__title">{{ block.title }}</p>
            <div class="cross-diagram__board" aria-hidden="true">
              <div class="cross-diagram__cell cross-diagram__cell--a">
                <span v-if="block.aLabel" class="cross-diagram__tag">{{ block.aLabel }}</span>
                <span class="cross-diagram__val">{{ block.a }}</span>
              </div>
              <div class="cross-diagram__cell cross-diagram__cell--c">
                <span v-if="block.cLabel" class="cross-diagram__tag">{{ block.cLabel }}</span>
                <span class="cross-diagram__val cross-diagram__val--c">{{ block.c }}</span>
              </div>
              <div class="cross-diagram__cell cross-diagram__cell--x">
                <span v-if="block.xLabel" class="cross-diagram__tag">{{ block.xLabel }}</span>
                <span class="cross-diagram__val cross-diagram__val--x">{{ block.x }}</span>
              </div>
              <div class="cross-diagram__cell cross-diagram__cell--b">
                <span v-if="block.bLabel" class="cross-diagram__tag">{{ block.bLabel }}</span>
                <span class="cross-diagram__val">{{ block.b }}</span>
              </div>
              <div class="cross-diagram__spacer" />
              <div class="cross-diagram__cell cross-diagram__cell--y">
                <span v-if="block.yLabel" class="cross-diagram__tag">{{ block.yLabel }}</span>
                <span class="cross-diagram__val cross-diagram__val--y">{{ block.y }}</span>
              </div>
              <svg class="cross-diagram__xlines" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="18" y1="22" x2="82" y2="78" />
                <line x1="18" y1="78" x2="82" y2="22" />
              </svg>
            </div>
            <p v-if="block.formula" class="cross-diagram__formula">{{ block.formula }}</p>
            <p v-if="block.caption" class="cross-diagram__caption">{{ block.caption }}</p>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button type="primary" @click="visible = false">知道了</el-button>
      </template>
    </el-dialog>
  </span>
</template>

<style scoped>
.da-strategy {
  display: inline-flex;
  flex-shrink: 0;
}

.da-strategy__btn {
  font-weight: 650;
}

.da-strategy__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: min(68vh, 560px);
  overflow-y: auto;
  padding: 2px 4px 8px 0;
  color: #0f172a;
  line-height: 1.7;
  font-size: 0.94rem;
}

.da-strategy__p {
  margin: 0;
}

.da-strategy__h3 {
  margin: 4px 0 0;
  font-size: 1.02rem;
  font-weight: 750;
  color: #0f766e;
}

.da-strategy__ul {
  margin: 0;
  padding-left: 1.25em;
}

.da-strategy__ul li + li {
  margin-top: 8px;
}

.da-strategy__tip {
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, #0d9488 10%, #f8fafc);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
}

.da-strategy__tip-label {
  display: inline-block;
  margin-right: 6px;
  font-weight: 750;
  color: #0f766e;
}

.da-strategy__example {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.da-strategy__example-title {
  margin: 0 0 6px;
  font-weight: 750;
  color: #334155;
}

.da-strategy__example-text {
  margin: 0;
}

.geo-gallery {
  padding: 10px 12px 12px;
  border-radius: 14px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 55%, #eff6ff 100%);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
}

.geo-gallery__title {
  margin: 0 0 10px;
  font-weight: 750;
  color: #0f766e;
  text-align: center;
}

.geo-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.geo-gallery__card {
  min-width: 0;
}

.geo-gallery__caption {
  margin: 6px 0 0;
  font-size: 0.86rem;
  line-height: 1.75;
  color: #334155;
  text-align: center;
}

.cross-diagram {
  padding: 12px 14px 14px;
  border-radius: 14px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 48%, #eff6ff 100%);
  border: 1px solid color-mix(in srgb, #0d9488 28%, #e2e8f0);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 70%, transparent);
}

.cross-diagram__title {
  margin: 0 0 10px;
  font-weight: 750;
  color: #0f766e;
  text-align: center;
}

.cross-diagram__board {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 0.85fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px 12px;
  min-height: 168px;
  padding: 8px 4px;
}

.cross-diagram__cell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid #cbd5e1;
  box-shadow: 0 2px 8px color-mix(in srgb, #0f172a 6%, transparent);
}

.cross-diagram__cell--a {
  grid-column: 1;
  grid-row: 1;
  border-color: color-mix(in srgb, #0d9488 45%, #cbd5e1);
}

.cross-diagram__cell--b {
  grid-column: 1;
  grid-row: 2;
  border-color: color-mix(in srgb, #2563eb 40%, #cbd5e1);
}

.cross-diagram__cell--c {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  border-color: color-mix(in srgb, #ea580c 50%, #cbd5e1);
  background: color-mix(in srgb, #fff7ed 70%, #fff);
  transform: scale(1.04);
}

.cross-diagram__cell--x {
  grid-column: 3;
  grid-row: 1;
  border-color: color-mix(in srgb, #0d9488 55%, #cbd5e1);
  background: color-mix(in srgb, #ccfbf1 45%, #fff);
}

.cross-diagram__cell--y {
  grid-column: 3;
  grid-row: 2;
  border-color: color-mix(in srgb, #2563eb 50%, #cbd5e1);
  background: color-mix(in srgb, #dbeafe 45%, #fff);
}

.cross-diagram__spacer {
  display: none;
}

.cross-diagram__tag {
  font-size: 11px;
  font-weight: 650;
  color: #64748b;
  letter-spacing: 0.02em;
}

.cross-diagram__val {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: center;
}

.cross-diagram__val--c {
  color: #c2410c;
  font-size: 1.25rem;
}

.cross-diagram__val--x {
  color: #0f766e;
}

.cross-diagram__val--y {
  color: #1d4ed8;
}

.cross-diagram__xlines {
  position: absolute;
  inset: 12% 8%;
  width: auto;
  height: auto;
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}

.cross-diagram__xlines line {
  stroke: #0f766e;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 5 4;
}

.cross-diagram__formula {
  margin: 10px 0 0;
  text-align: center;
  font-weight: 750;
  font-size: 0.98rem;
  color: #0f766e;
  letter-spacing: 0.01em;
}

.cross-diagram__caption {
  margin: 8px 0 0;
  font-size: 0.88rem;
  color: #475569;
  text-align: center;
  line-height: 1.55;
}

:deep(.da-math-frac) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0 0.15em;
  line-height: 1.15;
  font-weight: 700;
}

:deep(.da-math-frac__num),
:deep(.da-math-frac__den) {
  font-size: 0.92em;
  padding: 0 0.2em;
  text-align: center;
  white-space: nowrap;
}

:deep(.da-math-frac__rule) {
  display: block;
  align-self: stretch;
  border-top: 1.5px solid currentColor;
  margin: 0.04em 0;
}

:deep(.da-math-root) {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-family: 'Cambria Math', 'Times New Roman', 'Segoe UI', serif;
  font-weight: 700;
}

:deep(.da-math-root__idx) {
  font-size: 0.72em;
  margin-right: 1px;
  line-height: 1;
}

:deep(.da-math-root__sym) {
  font-size: 1.12em;
  line-height: 1;
}

:deep(.da-math-radicand) {
  border-top: 1.5px solid currentColor;
  padding: 0 2px 0 1px;
  margin-left: 1px;
  line-height: 1.15;
  font-weight: 700;
}

:deep(sup.da-math-sup) {
  font-size: 0.72em;
  font-weight: 750;
  line-height: 0;
  vertical-align: super;
}
</style>
