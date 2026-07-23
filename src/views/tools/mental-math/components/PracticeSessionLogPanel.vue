<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  PRACTICE_LOG_CATEGORIES,
  clearPracticeSessionLogs,
  filterPracticeSessionLogs,
  formatLogDuration,
  formatLogTime,
  isPracticeLogPerfect,
  listPracticeSessionLogs,
  localDateKey,
  practiceSessionLogTick,
  type PracticeSessionLogEntry,
} from '@/utils/practiceSessionLog'

/** 默认查看当天 */
const filterDate = ref(localDateKey())
const filterCategoryId = ref('')
const filterModeId = ref('')

const allLogs = computed(() => {
  void practiceSessionLogTick.value
  return listPracticeSessionLogs()
})

const categoryOptions = computed(() => {
  const used = new Set(allLogs.value.map((r) => r.categoryId))
  return [
    { id: '', label: '全部大类' },
    ...PRACTICE_LOG_CATEGORIES.filter((c) => used.has(c.id) || !allLogs.value.length),
  ]
})

const modeOptions = computed(() => {
  const map = new Map<string, string>()
  for (const row of allLogs.value) {
    if (filterCategoryId.value && row.categoryId !== filterCategoryId.value) continue
    if (!map.has(row.modeId)) map.set(row.modeId, row.itemLabel)
  }
  return [
    { id: '', label: '全部小类' },
    ...[...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'zh-CN')),
  ]
})

watch(filterCategoryId, () => {
  if (filterModeId.value && !modeOptions.value.some((m) => m.id === filterModeId.value)) {
    filterModeId.value = ''
  }
})

const rows = computed(() =>
  filterPracticeSessionLogs({
    dateKey: filterDate.value || undefined,
    categoryId: filterCategoryId.value || undefined,
    modeId: filterModeId.value || undefined,
  }),
)

const todayKey = computed(() => localDateKey())

function resultText(row: PracticeSessionLogEntry): string {
  const parts: string[] = []
  const isWrongReview = row.categoryId === 'wrong-review' || row.modeId.startsWith('wb-review:')
  if (row.totalCount != null && row.correctCount != null) {
    parts.push(
      isWrongReview
        ? `复盘答对 ${row.correctCount}/${row.totalCount}`
        : `答对 ${row.correctCount}/${row.totalCount}`,
    )
  }
  if (row.score != null && Number.isFinite(row.score)) {
    parts.push(`得分 ${row.score}`)
  }
  const dur = formatLogDuration(row.durationMs)
  if (dur) parts.push(`用时 ${dur}`)
  if (isWrongReview) {
    if (row.itemLabel.includes('中途结束')) parts.push('未完整')
    else if (isPracticeLogPerfect(row)) parts.push('全对')
    else parts.push('完整复盘')
  } else if (isPracticeLogPerfect(row)) {
    parts.push('满分')
  }
  return parts.join(' · ')
}

function resetFilters() {
  filterDate.value = localDateKey()
  filterCategoryId.value = ''
  filterModeId.value = ''
}

function showAllDates() {
  filterDate.value = ''
}

function showToday() {
  filterDate.value = localDateKey()
}

async function onClearAll() {
  if (!allLogs.value.length) return
  try {
    await ElMessageBox.confirm(
      `确定清空全部 ${allLogs.value.length} 条测验日志？`,
      '清空日志',
      { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  clearPracticeSessionLogs()
  resetFilters()
  ElMessage.success('已清空日志')
}
</script>

<template>
  <section class="mode-section practice-log" id="practice-log">
    <h3 class="mode-section__title">测验日志</h3>

    <div class="practice-log__filters">
      <label class="practice-log__field">
        <span class="practice-log__label">日期</span>
        <input v-model="filterDate" type="date" class="practice-log__input" />
      </label>
      <label class="practice-log__field">
        <span class="practice-log__label">大类</span>
        <select v-model="filterCategoryId" class="practice-log__input">
          <option v-for="c in categoryOptions" :key="c.id || 'all-cat'" :value="c.id">
            {{ c.label }}
          </option>
        </select>
      </label>
      <label class="practice-log__field">
        <span class="practice-log__label">小类</span>
        <select v-model="filterModeId" class="practice-log__input">
          <option v-for="m in modeOptions" :key="m.id || 'all-mode'" :value="m.id">
            {{ m.label }}
          </option>
        </select>
      </label>
      <div class="practice-log__actions">
        <button
          type="button"
          class="practice-log__btn"
          :class="{ 'is-active': filterDate === todayKey }"
          @click="showToday"
        >
          今天
        </button>
        <button
          type="button"
          class="practice-log__btn"
          :class="{ 'is-active': !filterDate }"
          @click="showAllDates"
        >
          全部日期
        </button>
        <button type="button" class="practice-log__btn" @click="resetFilters">重置筛选</button>
        <button
          type="button"
          class="practice-log__btn practice-log__btn--danger"
          :disabled="!allLogs.length"
          @click="onClearAll"
        >
          清空日志
        </button>
      </div>
    </div>

    <p class="practice-log__meta">
      <template v-if="filterDate === todayKey">今日 </template>
      <template v-else-if="filterDate">{{ filterDate }} </template>
      共 {{ rows.length }} 条记录
    </p>

    <ul v-if="rows.length" class="practice-log__list">
      <li
        v-for="row in rows"
        :key="row.id"
        class="practice-log__item"
        :class="{ 'practice-log__item--perfect': isPracticeLogPerfect(row) }"
      >
        <div class="practice-log__item-main">
          <span class="practice-log__item-title">
            {{ row.itemLabel }}
            <em v-if="isPracticeLogPerfect(row)" class="practice-log__perfect-tag">满分</em>
          </span>
          <span class="practice-log__item-time">{{ formatLogTime(row.finishedAt) }}</span>
        </div>
        <p v-if="resultText(row)" class="practice-log__item-stats">{{ resultText(row) }}</p>
        <p class="practice-log__item-cat">{{ row.categoryLabel }}</p>
      </li>
    </ul>
    <p v-else class="practice-log__empty">
      <template v-if="filterDate === todayKey">今天还没有测验记录。完成一轮后会出现在这里。</template>
      <template v-else>暂无符合条件的记录。完成一轮测验后会出现在这里。</template>
    </p>
  </section>
</template>

<style scoped>
.practice-log__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: flex-end;
  margin: 12px 0 8px;
  flex-shrink: 0;
}

.practice-log__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.practice-log__label {
  font-size: 12px;
  color: #64748b;
}

.practice-log__input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #0f172a;
}

.practice-log__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.practice-log__btn {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
}

.practice-log__btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.practice-log__btn.is-active {
  border-color: color-mix(in srgb, var(--el-color-primary) 55%, #cbd5e1);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 80%, #fff);
  color: var(--el-color-primary);
  font-weight: 600;
}

.practice-log__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.practice-log__btn--danger {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fef2f2;
}

.practice-log__meta {
  margin: 4px 0 10px;
  font-size: 13px;
  color: #64748b;
  flex-shrink: 0;
}

.practice-log__list {
  list-style: none;
  margin: 0;
  padding: 0 4px 4px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}

.practice-log__item {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.practice-log__item--perfect {
  border-color: color-mix(in srgb, var(--el-color-success) 45%, #e2e8f0);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--el-color-success-light-9) 85%, #fff) 0%,
    color-mix(in srgb, #fef9c3 55%, #fff) 100%
  );
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--el-color-success) 18%, transparent);
}

.practice-log__item-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 12px;
}

.practice-log__item-title {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.practice-log__perfect-tag {
  font-style: normal;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-8) 70%, #fff);
  border: 1px solid color-mix(in srgb, var(--el-color-success) 35%, transparent);
}

.practice-log__item-time {
  font-size: 12px;
  color: #64748b;
}

.practice-log__item-stats {
  margin: 4px 0 0;
  font-size: 13px;
  color: #475569;
}

.practice-log__item-cat {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.practice-log__empty {
  margin: 16px 0 0;
  font-size: 13px;
  color: #94a3b8;
}
</style>
