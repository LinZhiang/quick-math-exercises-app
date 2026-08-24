<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { localDateKey } from '@/utils/app/practiceSessionLog'
import {
  clearDsaStudyLogs,
  dsaRunResultText,
  dsaStudyDaySummary,
  dsaStudyTick,
  filterDsaStudyLogs,
  formatDsaStudyDateTitle,
  formatDsaStudyTime,
  groupDsaStudyLogsByDate,
  listDsaStudyLogs,
  summarizeDsaStudy,
} from '@/utils/dsa/dsaStudyStore'

const filterDate = ref(localDateKey())
const todayKey = computed(() => localDateKey())

const allLogs = computed(() => {
  void dsaStudyTick.value
  return listDsaStudyLogs()
})

const quizStats = computed(() => summarizeDsaStudy())

const days = computed(() =>
  groupDsaStudyLogsByDate(filterDsaStudyLogs({ dateKey: filterDate.value || undefined })),
)

function showToday() {
  filterDate.value = localDateKey()
}

function showAllDates() {
  filterDate.value = ''
}

async function onClearAll() {
  if (!allLogs.value.length) return
  try {
    await ElMessageBox.confirm(
      `确定清空全部 ${allLogs.value.length} 条刷题日志？只清本机记录，不影响题目。刷题次数仍保留。`,
      '清空日志',
      { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  clearDsaStudyLogs()
  showToday()
  ElMessage.success('已清空刷题日志')
}
</script>

<template>
  <section class="dsa-log">
    <div class="dsa-log__filters">
      <label class="dsa-log__field">
        <span>日期</span>
        <input v-model="filterDate" type="date" class="dsa-log__input" />
      </label>
      <div class="dsa-log__actions">
        <button type="button" class="dsa-log__btn" :class="{ 'is-on': filterDate === todayKey }" @click="showToday">
          今天
        </button>
        <button type="button" class="dsa-log__btn" :class="{ 'is-on': !filterDate }" @click="showAllDates">
          全部日期
        </button>
        <button type="button" class="dsa-log__btn is-danger" :disabled="!allLogs.length" @click="onClearAll">
          清空
        </button>
      </div>
    </div>

    <p class="dsa-log__meta">
      记录保存在这台设备。共 {{ allLogs.length }} 条
      <template v-if="filterDate === todayKey"> · 正在看今天</template>
      <template v-else-if="filterDate"> · {{ filterDate }}</template>
    </p>
    <div v-if="quizStats.lifetimeAttempts" class="dsa-log__stats">
      <p>
        累计测试 {{ quizStats.lifetimeAttempts }} 次，通过 {{ quizStats.lifetimeCorrects }}
        （{{
          quizStats.lifetimeAttempts
            ? Math.round((quizStats.lifetimeCorrects / quizStats.lifetimeAttempts) * 100)
            : 0
        }}%）
      </p>
      <p v-if="quizStats.todayAttempts">
        今天测 {{ quizStats.todayAttempts }} 次，通过 {{ quizStats.todayCorrects }}。
      </p>
      <p v-else>今天还没有测试记录。</p>
    </div>

    <div v-if="days.length" class="dsa-log__days">
      <article v-for="day in days" :key="day.dateKey" class="dsa-log__day">
        <h4 class="dsa-log__day-title">{{ formatDsaStudyDateTitle(day.dateKey, todayKey) }}</h4>
        <p class="dsa-log__day-sum">{{ dsaStudyDaySummary(day) }}</p>

        <section class="dsa-log__block">
          <h5>打开题目</h5>
          <ul v-if="day.views.length">
            <li v-for="row in day.views" :key="row.id">
              <span class="dsa-log__name">{{ row.itemTitle }}</span>
              <span v-if="row.pathLabel" class="dsa-log__path">路径 {{ row.pathLabel }}</span>
              <span class="dsa-log__time">最近打开 {{ formatDsaStudyTime(row.at) }}</span>
            </li>
          </ul>
          <p v-else class="dsa-log__empty">这天没有打开题目</p>
        </section>

        <section class="dsa-log__block">
          <h5>测试</h5>
          <ul v-if="day.runs.length">
            <li v-for="row in day.runs" :key="row.id">
              <span class="dsa-log__name">{{ row.itemTitle }}</span>
              <span v-if="row.pathLabel" class="dsa-log__path">路径 {{ row.pathLabel }}</span>
              <span class="dsa-log__result" :class="row.ok ? 'is-ok' : 'is-bad'">{{ dsaRunResultText(row) }}</span>
              <span class="dsa-log__time">完成于 {{ formatDsaStudyTime(row.at) }}</span>
            </li>
          </ul>
          <p v-else class="dsa-log__empty">这天没有测试</p>
        </section>
      </article>
    </div>
    <p v-else class="dsa-log__empty dsa-log__empty--page">
      <template v-if="filterDate === todayKey">今天还没有打开题目或测试记录。</template>
      <template v-else>这段时间没有记录。进题或点测试后会出现在这里。</template>
    </p>
  </section>
</template>

<style scoped>
.dsa-log {
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding: 4px 2px 4px;
  gap: 10px;
}

.dsa-log__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px 12px;
}

.dsa-log__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 16rem;
  min-width: 16rem;
  max-width: 22rem;
  font-size: 12px;
  color: var(--app-text-muted);
}

.dsa-log__input {
  box-sizing: border-box;
  width: 100%;
  min-width: 16rem;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 8px;
  font: inherit;
  font-size: 15px;
}

.dsa-log__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dsa-log__btn {
  appearance: none;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid var(--app-border-soft);
  border-radius: 8px;
  background: #fff;
  color: var(--app-text);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dsa-log__btn.is-on {
  border-color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary-soft) 70%, #fff);
  color: var(--app-primary);
}

.dsa-log__btn.is-danger {
  color: var(--app-danger);
}

.dsa-log__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dsa-log__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.dsa-log__stats {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-primary-soft) 40%, #fff);
  font-size: 13px;
  line-height: 1.5;
}

.dsa-log__stats p {
  margin: 0;
}

.dsa-log__days {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dsa-log__day-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 750;
}

.dsa-log__day-sum {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--app-text-muted);
}

.dsa-log__block h5 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.dsa-log__block ul {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dsa-log__block li {
  display: grid;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-primary-soft) 28%, #fff);
}

.dsa-log__name {
  font-weight: 650;
  line-height: 1.35;
}

.dsa-log__path,
.dsa-log__result,
.dsa-log__time {
  font-size: 12px;
  line-height: 1.45;
  color: var(--app-text-muted);
}

.dsa-log__result {
  color: var(--app-text);
}

.dsa-log__result.is-ok {
  color: #15803d;
}

.dsa-log__result.is-bad {
  color: #b91c1c;
}

.dsa-log__empty {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.dsa-log__empty--page {
  margin-top: 12px;
}
</style>
