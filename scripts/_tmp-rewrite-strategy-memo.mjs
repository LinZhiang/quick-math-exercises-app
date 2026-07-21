import fs from 'node:fs'

const path = 'src/views/tools/mental-math/components/DataAnalysisStrategyGuideButton.vue'
const old = fs.readFileSync(path, 'utf8')
const styleStart = old.indexOf('.da-strategy__p {')
const styleEnd = old.lastIndexOf('</style>')
if (styleStart < 0 || styleEnd < 0) throw new Error('style markers not found')
const keptStyles = old.slice(styleStart, styleEnd)

const content = `<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDataAnalysisStrategyGuide } from '@/constants/dataAnalysisStrategyGuides'
import { getMathOpStrategyGuide } from '@/constants/mathOpStrategyGuides'
import { renderDataAnalysisMathHtml } from '@/utils/dataAnalysisMathDisplay'
import {
  getStrategyGuideNote,
  setStrategyGuideNote,
} from '@/utils/strategyGuideNotes'
import GeometryFigureView from '@/views/tools/mental-math/components/GeometryFigureView.vue'
import ProbabilityGeoDiagram from '@/views/tools/mental-math/components/ProbabilityGeoDiagram.vue'
import InclusionExclusionVennDiagram from '@/views/tools/mental-math/components/InclusionExclusionVennDiagram.vue'
import ClockFaceDiagram from '@/views/tools/mental-math/components/ClockFaceDiagram.vue'
import FunctionGraphCurveView from '@/views/tools/mental-math/components/FunctionGraphCurveView.vue'
import type { GeometryFigureSpec } from '@/utils/geometryPractice'
import type { FunctionGraphKind } from '@/utils/functionGraphPractice'

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
            {{ guide ? \`答题攻略 · \${guide.title}\` : '答题攻略' }}
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
      :title="guide ? \`备忘录 · \${guide.title}\` : '备忘录'"
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
  padding-right: 8px;
  min-width: 0;
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

${keptStyles}</style>
`

fs.writeFileSync(path, content)
console.log('rewrote', path, 'bytes', content.length)
