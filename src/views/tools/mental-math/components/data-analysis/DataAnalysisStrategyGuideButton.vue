<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDataAnalysisStrategyGuide } from '@/constants/dataAnalysisStrategyGuides'
import { getMathOpStrategyGuide } from '@/constants/mathOpStrategyGuides'
import { renderDataAnalysisMathHtml } from '@/utils/data-analysis/dataAnalysisMathDisplay'
import {
  getStrategyGuideNote,
  setStrategyGuideNote,
} from '@/utils/app/strategyGuideNotes'
import GeometryFigureView from '@/views/tools/mental-math/components/math/GeometryFigureView.vue'
import ProbabilityGeoDiagram from '@/views/tools/mental-math/components/math/ProbabilityGeoDiagram.vue'
import InclusionExclusionVennDiagram from '@/views/tools/mental-math/components/math/InclusionExclusionVennDiagram.vue'
import ClockFaceDiagram from '@/views/tools/mental-math/components/math/ClockFaceDiagram.vue'
import FunctionGraphCurveView from '@/views/tools/mental-math/components/math/FunctionGraphCurveView.vue'
import type { GeometryFigureSpec } from '@/utils/math/geometryPractice'
import type { FunctionGraphKind } from '@/utils/math/functionGraphPractice'

const MEMO_MAX_LEN = 3000

const props = defineProps<{
  topicId: string
}>()

const visible = ref(false)
const memoVisible = ref(false)
const savedNote = ref('')
const noteDraft = ref('')
const noteSaving = ref(false)

const guide = computed(
  () => getDataAnalysisStrategyGuide(props.topicId) ?? getMathOpStrategyGuide(props.topicId),
)

const hasNote = computed(() => Boolean(savedNote.value.trim()))

const dialogWidth = computed(() =>
  props.topicId === 'geometry' ||
  props.topicId === 'right-triangle' ||
  props.topicId === 'similar-triangle' ||
  props.topicId === 'coloring' ||
  props.topicId === 'probability' ||
  props.topicId === 'inclusion-exclusion' ||
  props.topicId === 'function-graph'
    ? 'min(720px, 96vw)'
    : 'min(640px, 94vw)',
)

function mathHtml(text: string): string {
  return renderDataAnalysisMathHtml(text)
}

function loadNote() {
  savedNote.value = getStrategyGuideNote(props.topicId)
}

function open(ev?: Event) {
  ev?.stopPropagation()
  if (!guide.value) return
  loadNote()
  visible.value = true
}

function openMemo(ev?: Event) {
  ev?.stopPropagation()
  loadNote()
  noteDraft.value = savedNote.value
  memoVisible.value = true
}

function onMemoClosed() {
  noteDraft.value = ''
  noteSaving.value = false
}

function onSaveNote() {
  noteSaving.value = true
  try {
    setStrategyGuideNote(props.topicId, noteDraft.value)
    savedNote.value = getStrategyGuideNote(props.topicId)
    noteDraft.value = savedNote.value
    ElMessage.success(savedNote.value ? '备忘录已保存' : '已清空备忘录')
  } finally {
    noteSaving.value = false
  }
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

loadNote()
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
      :width="dialogWidth"
      top="6vh"
      append-to-body
      destroy-on-close
      class="da-strategy-dialog"
      @click.stop
    >
      <template #header="{ titleId, titleClass }">
        <div class="da-strategy__header">
          <h4 :id="titleId" :class="titleClass" class="da-strategy__header-title">
            {{ guide ? `答题攻略 · ${guide.title}` : '答题攻略' }}
          </h4>
          <button
            type="button"
            class="da-strategy__memo-icon-btn"
            :class="{ 'is-filled': hasNote }"
            title="备忘录"
            aria-label="打开备忘录"
            @click="openMemo"
          >
            <svg
              class="da-strategy__memo-svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.5a.5.5 0 0 0 .35-.15l4-4a.5.5 0 0 0 .15-.35V4a2 2 0 0 0-2-2H7Zm0 2h11v11h-3.5a.5.5 0 0 0-.5.5V20H7V4Zm9.5 12H18l-1.5 1.5V16ZM9 7.5h8v1.5H9V7.5Zm0 4h8V13H9v-1.5Zm0 4h5V16H9v-1.5Z"
              />
            </svg>
            <span v-if="hasNote" class="da-strategy__memo-dot" aria-hidden="true" />
          </button>
        </div>
      </template>

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
            <div class="cross-diagram__board">
              <div class="cross-diagram__col cross-diagram__col--left">
                <div class="cross-diagram__cell cross-diagram__cell--a">
                  <span v-if="block.aLabel" class="cross-diagram__tag">{{ block.aLabel }}</span>
                  <span class="cross-diagram__val">{{ block.a }}</span>
                </div>
                <div class="cross-diagram__cell cross-diagram__cell--b">
                  <span v-if="block.bLabel" class="cross-diagram__tag">{{ block.bLabel }}</span>
                  <span class="cross-diagram__val">{{ block.b }}</span>
                </div>
              </div>
              <div class="cross-diagram__col cross-diagram__col--mid">
                <div class="cross-diagram__cell cross-diagram__cell--c">
                  <span v-if="block.cLabel" class="cross-diagram__tag">{{ block.cLabel }}</span>
                  <span class="cross-diagram__val cross-diagram__val--c">{{ block.c }}</span>
                </div>
              </div>
              <div class="cross-diagram__col cross-diagram__col--right">
                <div class="cross-diagram__cell cross-diagram__cell--x">
                  <span v-if="block.xLabel" class="cross-diagram__tag">{{ block.xLabel }}</span>
                  <span class="cross-diagram__val cross-diagram__val--x">{{ block.x }}</span>
                </div>
                <div class="cross-diagram__cell cross-diagram__cell--y">
                  <span v-if="block.yLabel" class="cross-diagram__tag">{{ block.yLabel }}</span>
                  <span class="cross-diagram__val cross-diagram__val--y">{{ block.y }}</span>
                </div>
              </div>
              <svg
                class="cross-diagram__xlines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line x1="22" y1="18" x2="78" y2="82" />
                <line x1="22" y1="82" x2="78" y2="18" />
              </svg>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.formula"
              class="cross-diagram__formula"
              v-html="mathHtml(block.formula)"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.caption"
              class="cross-diagram__caption"
              v-html="mathHtml(block.caption)"
            />
          </div>
          <div v-else-if="block.type === 'geo-prob-diagram'" class="geo-prob-diagram">
            <p v-if="block.title" class="geo-prob-diagram__title">{{ block.title }}</p>
            <ProbabilityGeoDiagram :preset="block.preset" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.formula"
              class="geo-prob-diagram__formula"
              v-html="mathHtml(block.formula)"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.caption"
              class="geo-prob-diagram__caption"
              v-html="mathHtml(block.caption)"
            />
          </div>
          <div v-else-if="block.type === 'venn-diagram'" class="venn-diagram">
            <p v-if="block.title" class="venn-diagram__title">{{ block.title }}</p>
            <InclusionExclusionVennDiagram :preset="block.preset" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.formula"
              class="venn-diagram__formula"
              v-html="mathHtml(block.formula)"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              v-if="block.caption"
              class="venn-diagram__caption"
              v-html="mathHtml(block.caption)"
            />
          </div>
          <div v-else-if="block.type === 'clock-diagram'" class="clock-diagram">
            <p v-if="block.title" class="clock-diagram__title">{{ block.title }}</p>
            <ClockFaceDiagram
              :hour-deg="block.hourDeg"
              :minute-deg="block.minuteDeg"
              :time-label="block.timeLabel"
              :caption="block.caption"
              :show-arc="block.showArc !== false"
            />
          </div>
          <div v-else-if="block.type === 'function-graph-diagram'" class="fg-diagram">
            <p v-if="block.title" class="fg-diagram__title">{{ block.title }}</p>
            <div class="fg-diagram__grid">
              <div v-for="(item, j) in block.items" :key="j" class="fg-diagram__card">
                <FunctionGraphCurveView :kind="item.kind as FunctionGraphKind" :label="''" />
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p
                  v-if="item.formula"
                  class="fg-diagram__formula"
                  v-html="mathHtml(item.formula)"
                />
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p
                  v-if="item.caption"
                  class="fg-diagram__caption"
                  v-html="mathHtml(item.caption)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button type="primary" @click="visible = false">知道了</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="memoVisible"
      :title="guide ? `备忘录 · ${guide.title}` : '备忘录'"
      width="min(640px, 94vw)"
      top="8vh"
      append-to-body
      destroy-on-close
      class="da-strategy-memo-dialog"
      @click.stop
      @closed="onMemoClosed"
    >
      <div class="da-strategy-memo">
        <p class="da-strategy-memo__hint">
          仅保存在本机，按题型独立记录；支持 Markdown，最多 {{ MEMO_MAX_LEN }} 字。
        </p>
        <el-input
          v-model="noteDraft"
          type="textarea"
          :rows="14"
          :maxlength="MEMO_MAX_LEN"
          show-word-limit
          resize="vertical"
          placeholder="记下易错点、口诀、例题思路等…"
        />
      </div>
      <template #footer>
        <el-button plain @click="memoVisible = false">关闭</el-button>
        <el-button type="primary" :loading="noteSaving" @click="onSaveNote">保存</el-button>
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

.da-strategy__header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  /* 给 Element Plus 右上角关闭按钮留位，图标紧挨其左侧 */
  padding-right: 36px;
  min-width: 0;
  box-sizing: border-box;
}

.da-strategy__header-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.da-strategy__memo-icon-btn {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: 0;
  padding: 0;
  border: 1px solid color-mix(in srgb, #0d9488 28%, #e2e8f0);
  border-radius: 10px;
  background: color-mix(in srgb, #0d9488 8%, #fff);
  color: #0f766e;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.da-strategy__memo-icon-btn:hover {
  background: color-mix(in srgb, #0d9488 16%, #fff);
  border-color: #0d9488;
}

.da-strategy__memo-icon-btn.is-filled {
  background: color-mix(in srgb, #f59e0b 14%, #fffbeb);
  border-color: color-mix(in srgb, #f59e0b 45%, #e2e8f0);
  color: #b45309;
}

.da-strategy__memo-svg {
  display: block;
}

.da-strategy__memo-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 2px #fff;
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

.da-strategy-memo__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
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
  padding: 14px 14px 16px;
  border-radius: 14px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 48%, #eff6ff 100%);
  border: 1px solid color-mix(in srgb, #0d9488 28%, #e2e8f0);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 70%, transparent);
}

.cross-diagram__title {
  margin: 0 0 12px;
  font-weight: 750;
  color: #0f766e;
  text-align: center;
  font-size: 0.95rem;
}

.cross-diagram__board {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(72px, 0.9fr) minmax(0, 1fr);
  align-items: stretch;
  gap: 10px 14px;
  min-height: 180px;
  padding: 10px 6px 12px;
}

.cross-diagram__col {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.cross-diagram__col--mid {
  justify-content: center;
}

.cross-diagram__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 10px;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid #94a3b8;
  box-shadow: 0 2px 8px color-mix(in srgb, #0f172a 8%, transparent);
  min-height: 64px;
}

.cross-diagram__cell--a {
  border-color: #14b8a6;
}

.cross-diagram__cell--b {
  border-color: #3b82f6;
}

.cross-diagram__cell--c {
  border-color: #f97316;
  border-width: 2px;
  background: #fff7ed;
  min-height: 88px;
}

.cross-diagram__cell--x {
  border-color: #0d9488;
  background: #ccfbf1;
}

.cross-diagram__cell--y {
  border-color: #2563eb;
  background: #dbeafe;
}

.cross-diagram__tag {
  font-size: 11px;
  font-weight: 650;
  color: #64748b;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.3;
}

.cross-diagram__val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  text-align: center;
  word-break: break-word;
}

.cross-diagram__val--c {
  color: #c2410c;
  font-size: 1.28rem;
}

.cross-diagram__val--x {
  color: #0f766e;
}

.cross-diagram__val--y {
  color: #1d4ed8;
}

.cross-diagram__xlines {
  position: absolute;
  inset: 8% 6%;
  width: auto;
  height: auto;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

.cross-diagram__xlines line {
  stroke: #0f766e;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-dasharray: 6 5;
  opacity: 0.7;
}

.cross-diagram__formula {
  margin: 12px 0 0;
  text-align: center;
  font-weight: 750;
  font-size: 0.98rem;
  color: #0f766e;
  letter-spacing: 0.01em;
  line-height: 1.6;
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

.geo-prob-diagram {
  padding: 12px 12px 14px;
  border-radius: 14px;
  background: linear-gradient(160deg, #f0fdfa 0%, #f8fafc 55%, #fff7ed 100%);
  border: 1px solid color-mix(in srgb, #0d9488 22%, #e2e8f0);
}

.geo-prob-diagram__title {
  margin: 0 0 8px;
  font-weight: 750;
  color: #0f766e;
  text-align: center;
}

.geo-prob-diagram__formula {
  margin: 8px 0 0;
  text-align: center;
  font-weight: 650;
  color: #0f766e;
}

.geo-prob-diagram__caption {
  margin: 6px 0 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: #334155;
  text-align: center;
}

.venn-diagram {
  padding: 12px 12px 14px;
  border-radius: 14px;
  background: linear-gradient(160deg, #eff6ff 0%, #f8fafc 55%, #f0fdf4 100%);
  border: 1px solid color-mix(in srgb, #2563eb 18%, #e2e8f0);
}

.venn-diagram__title {
  margin: 0 0 8px;
  font-weight: 750;
  color: #1d4ed8;
  text-align: center;
}

.venn-diagram__formula {
  margin: 8px 0 0;
  text-align: center;
  font-weight: 650;
  color: #1d4ed8;
}

.venn-diagram__caption {
  margin: 6px 0 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: #334155;
  text-align: center;
}

.clock-diagram {
  margin: 12px 0 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
}

.clock-diagram__title {
  margin: 0 0 6px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f766e;
  text-align: center;
}

.fg-diagram {
  margin: 12px 0 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
}

.fg-diagram__title {
  margin: 0 0 10px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f766e;
  text-align: center;
}

.fg-diagram__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.fg-diagram__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.fg-diagram__formula {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
}

.fg-diagram__caption {
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
  text-align: center;
  line-height: 1.4;
}
</style>
