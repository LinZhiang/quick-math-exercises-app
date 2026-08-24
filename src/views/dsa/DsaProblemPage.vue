<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CircleCheck, CircleClose, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DsaComplexityView from '@/components/DsaComplexityView.vue'
import DsaHighlightedCode from '@/components/DsaHighlightedCode.vue'
import { findDsaProblem } from '@/utils/dsa/dsaCatalog'
import { DSA_BODY_INDENT, starterBodyCursor } from '@/utils/dsa/buildDsaProblem'
import {
  dsaStudyTick,
  getDsaProblemStats,
  logDsaProblemView,
  recordDsaRun,
} from '@/utils/dsa/dsaStudyStore'
import { runJsFunctionTests, type JsRunReport } from '@/utils/dsa/runJsTests'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'

const route = useRoute()
const editorRef = ref<{ textarea: HTMLTextAreaElement | null; fit: () => void } | null>(null)
const hit = computed(() =>
  findDsaProblem(
    String(route.params.categoryId ?? ''),
    String(route.params.subId ?? ''),
    String(route.params.problemId ?? ''),
  ),
)
const problem = computed(() => hit.value?.problem ?? null)
const title = computed(() =>
  problem.value ? `${problem.value.index}. ${problem.value.title}` : '编程题',
)
useAppChromeTitle(title)

const code = ref('')
const running = ref(false)
const report = ref<JsRunReport | null>(null)
const showSolution = ref(false)
const showCases = ref(false)
const progress = computed(() => {
  void dsaStudyTick.value
  const id = problem.value?.id
  if (!id) return null
  const row = getDsaProblemStats(id)
  return row.attempts || row.corrects || row.completedAt ? row : null
})
const pathLabel = computed(() => {
  if (!hit.value || !problem.value) return ''
  return `${hit.value.cat.name} / ${hit.value.sub.name} / ${problem.value.index}. ${problem.value.title}`
})
const startedAt = ref(0)
const elapsedMs = ref(0)
let clockId: ReturnType<typeof setInterval> | null = null

function stopClock() {
  if (clockId == null) return
  clearInterval(clockId)
  clockId = null
}

function startClock() {
  stopClock()
  startedAt.value = Date.now()
  elapsedMs.value = 0
  clockId = setInterval(() => {
    elapsedMs.value = Date.now() - startedAt.value
  }, 200)
}

function editorEl() {
  const raw = editorRef.value?.textarea as unknown
  if (raw instanceof HTMLTextAreaElement) return raw
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const inner = (raw as { value: unknown }).value
    if (inner instanceof HTMLTextAreaElement) return inner
  }
  return null
}

function fitEditor() {
  editorRef.value?.fit()
}

async function setCode(next: string, cursor?: number) {
  code.value = next
  await nextTick()
  editorRef.value?.fit()
  const el = editorEl()
  if (!el || cursor == null) return
  el.focus()
  el.setSelectionRange(cursor, cursor)
}

function applyStarter() {
  let starter = problem.value?.starter ?? ''
  const hit = /\/\/[^\n]*\n/.exec(starter)
  if (hit && hit.index != null) {
    const lineStart = hit.index + hit[0].length
    const indent = starter.slice(lineStart).match(/^[ \t]*/)?.[0] ?? ''
    if (!indent) {
      starter = `${starter.slice(0, lineStart)}${DSA_BODY_INDENT}${starter.slice(lineStart)}`
    }
  }
  void setCode(starter, starterBodyCursor(starter))
}

watch(
  () => problem.value?.id,
  (id) => {
    report.value = null
    showSolution.value = false
    showCases.value = false
    if (!id) {
      code.value = ''
      stopClock()
      return
    }
    logDsaProblemView({
      problemId: id,
      itemTitle: `${problem.value?.index}. ${problem.value?.title ?? ''}`,
      pathLabel: pathLabel.value,
    })
    startClock()
    applyStarter()
  },
  { immediate: true },
)

watch(code, () => {
  void nextTick(fitEditor)
})

onUnmounted(stopClock)

function formatDuration(ms: number) {
  const total = Math.max(0, ms)
  const s = total / 1000
  if (s < 60) return `${s.toFixed(1)} 秒`
  const m = Math.floor(s / 60)
  const rem = Math.floor(s - m * 60)
  return `${m} 分 ${String(rem).padStart(2, '0')} 秒`
}

function formatExec(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return ''
  if (ms < 1) return `${(ms * 1000).toFixed(0)} μs`
  return `${ms.toFixed(2)} ms`
}

function formatCompletedAt(ts: number) {
  try {
    return new Date(ts).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(code.value)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

function resetToStarter() {
  if (!problem.value) return
  report.value = null
  showSolution.value = false
  showCases.value = false
  startClock()
  applyStarter()
}

function toggleSolution() {
  showSolution.value = !showSolution.value
}

async function runTests() {
  if (!problem.value) return
  running.value = true
  report.value = null
  showCases.value = false
  try {
    const next = await runJsFunctionTests({
      code: code.value,
      functionName: problem.value.functionName,
      tests: problem.value.tests,
    })
    report.value = next
    const solveMs = Date.now() - startedAt.value
    if (next.ok) {
      elapsedMs.value = solveMs
      stopClock()
    }
    recordDsaRun({
      problemId: problem.value.id,
      itemTitle: `${problem.value.index}. ${problem.value.title}`,
      pathLabel: pathLabel.value,
      ok: next.ok,
      durationMs: solveMs,
      execMs: next.execMs,
    })
  } finally {
    running.value = false
  }
}

function onEditorKeydown(e: KeyboardEvent) {
  if (e.isComposing) return
  const el = e.target as HTMLTextAreaElement
  const start = el.selectionStart
  const end = el.selectionEnd

  if (e.key === 'Tab') {
    e.preventDefault()
    const insert = '    '
    void setCode(`${code.value.slice(0, start)}${insert}${code.value.slice(end)}`, start + insert.length)
    return
  }

  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return
  e.preventDefault()
  const before = code.value.slice(0, start)
  const after = code.value.slice(end)
  const lineStart = before.lastIndexOf('\n') + 1
  const indent = before.slice(lineStart).match(/^[ \t]*/)?.[0] ?? ''
  const insert = `\n${indent}`
  void setCode(before + insert + after, start + insert.length)
}
</script>

<template>
  <section v-if="problem" class="dsa-lab">
    <h2 class="dsa-lab__title">{{ problem.index }}. {{ problem.title }}</h2>
    <p class="dsa-lab__counts">
      刷题 {{ progress?.attempts ?? 0 }} 次 · 正确 {{ progress?.corrects ?? 0 }} 次
    </p>
    <p v-for="(para, i) in problem.intro" :key="i" class="dsa-lab__intro">{{ para }}</p>

    <div class="dsa-lab__stats">
      <p>
        <span class="dsa-lab__stat-k">解题时长</span>
        从进题起已用 {{ formatDuration(elapsedMs) }}
        <template v-if="progress">
          · 首次做对花了 {{ formatDuration(progress.solveMs) }}
          <template v-if="progress.completedAt">（{{ formatCompletedAt(progress.completedAt) }}）</template>
        </template>
      </p>
      <p v-if="(report?.ok && report.execMs) || (progress && progress.execMs)">
        <span class="dsa-lab__stat-k">运行耗时</span>
        <template v-if="report?.ok && report.execMs">刚才代码跑完 {{ formatExec(report.execMs) }}</template>
        <template v-else>上次代码跑完 {{ formatExec(progress?.execMs ?? 0) }}</template>
        <template v-if="progress?.bestExecMs"> · 历史最快 {{ formatExec(progress.bestExecMs) }}</template>
      </p>
    </div>

    <div class="dsa-lab__langs" aria-label="语言">
      <span class="dsa-lab__lang is-on">TS</span>
    </div>

    <div class="dsa-code">
      <div class="dsa-code__bar">
        <span>{{ problem.fileName }}</span>
        <button type="button" class="dsa-code__copy" aria-label="复制代码" @click="copyCode">
          <el-icon :size="16"><CopyDocument /></el-icon>
        </button>
      </div>
      <DsaHighlightedCode
        ref="editorRef"
        v-model:code="code"
        editable
        @keydown="onEditorKeydown"
      />
    </div>

    <div class="dsa-lab__actions">
      <el-button type="primary" :loading="running" @click="runTests">测试</el-button>
      <el-button @click="toggleSolution">{{ showSolution ? '隐藏答案' : '正确答案' }}</el-button>
      <el-button @click="resetToStarter">重置</el-button>
      <span v-if="report" class="dsa-lab__verdict" :class="report.ok ? 'is-ok' : 'is-bad'">
        <el-icon :size="18">
          <CircleCheck v-if="report.ok" />
          <CircleClose v-else />
        </el-icon>
        {{ report.ok ? '正确' : report.results.length ? '不正确' : report.message }}
      </span>
      <button
        v-if="report?.results.length"
        type="button"
        class="dsa-cases__toggle"
        :class="{ 'is-open': showCases }"
        @click="showCases = !showCases"
      >
        {{ showCases ? '收起用例' : `展开用例（${report.results.length}）` }}
      </button>
    </div>

    <DsaComplexityView v-if="report?.ok" :complexity="problem.complexity" />

    <DsaHighlightedCode v-if="showSolution" class="dsa-answer" :code="problem.solution" />

    <ul v-if="showCases && report?.results.length" class="dsa-cases">
      <li v-for="row in report.results" :key="row.label" :class="row.pass ? 'is-ok' : 'is-bad'">
        <el-icon :size="16">
          <CircleCheck v-if="row.pass" />
          <CircleClose v-else />
        </el-icon>
        <span>{{ row.label }}</span>
        <span v-if="!row.pass && row.error" class="dsa-cases__err">{{ row.error }}</span>
        <span v-else-if="!row.pass" class="dsa-cases__err">
          期望 {{ JSON.stringify(row.expect) }}，实际 {{ JSON.stringify(row.got) }}
        </span>
      </li>
    </ul>
  </section>
  <p v-else class="dsa-lab dsa-lab__intro">没有找到这道题。</p>
</template>

<style scoped>
.dsa-lab {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 18px 16px calc(48px + var(--app-safe-bottom, 0px));
  background: #111827;
  color: #e5e7eb;
}

.dsa-lab__title {
  margin: 0 0 6px;
  font-size: 1.7rem;
  font-weight: 750;
  color: #fff;
}

.dsa-lab__counts {
  margin: 0 0 14px;
  font-size: 13px;
  color: #94a3b8;
}

.dsa-lab__intro {
  margin: 0 0 12px;
  max-width: 46rem;
  font-size: 14px;
  line-height: 1.75;
  color: #cbd5e1;
}

.dsa-lab__stats {
  display: grid;
  gap: 4px;
  margin: 4px 0 8px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.55;
}

.dsa-lab__stats p {
  margin: 0;
}

.dsa-lab__stat-k {
  margin-right: 8px;
  color: #cbd5e1;
  font-weight: 650;
}

.dsa-lab__langs {
  display: flex;
  gap: 18px;
  margin: 22px 0 14px;
  border-bottom: 1px solid #334155;
}

.dsa-lab__lang {
  padding: 8px 0 10px;
  border-bottom: 2px solid #fff;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.dsa-code {
  overflow: hidden;
  border-radius: 12px;
  background: #1e2937;
  box-shadow: 0 12px 32px rgb(0 0 0 / 28%);
}

.dsa-code__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px 0 14px;
  border-bottom: 1px solid #334155;
  color: #94a3b8;
  font-size: 13px;
}

.dsa-code__copy {
  appearance: none;
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.dsa-code__copy:hover {
  background: #334155;
  color: #fff;
}

.dsa-lab__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.dsa-lab__verdict {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
}

.dsa-lab__verdict.is-ok,
.dsa-cases li.is-ok {
  color: #4ade80;
}

.dsa-lab__verdict.is-bad,
.dsa-cases li.is-bad {
  color: #f87171;
}

.dsa-cases__toggle {
  appearance: none;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
}

.dsa-cases__toggle:hover,
.dsa-cases__toggle.is-open {
  color: #e2e8f0;
}

.dsa-answer {
  display: block;
  margin-top: 14px;
}

.dsa-cases {
  margin: 14px 0 0;
  padding: 0 0 12px;
  list-style: none;
  display: grid;
  gap: 8px;
}

.dsa-cases li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dsa-cases__err {
  color: #fca5a5;
  font-weight: 500;
}
</style>
