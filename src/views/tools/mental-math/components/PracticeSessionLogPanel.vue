<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  PRACTICE_LOG_CATEGORIES,
  clearPracticeSessionLogs,
  filterPracticeSessionLogs,
  formatLogDuration,
  formatLogTime,
  listPracticeSessionLogs,
  practiceSessionLogTick,
  type PracticeSessionLogEntry,
} from '@/utils/practiceSessionLog'

const filterDate = ref('')
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

function resultText(row: PracticeSessionLogEntry): string {
  const parts: string[] = []
  if (row.totalCount != null && row.correctCount != null) {
    parts.push(`答对 ${row.correctCount}/${row.totalCount}`)
  }
  if (row.score != null && Number.isFinite(row.score)) {
    parts.push(`得分 ${row.score}`)
  }
  const dur = formatLogDuration(row.durationMs)
  if (dur) parts.push(`用时 ${dur}`)
  return parts.join(' · ')
}

function resetFilters() {
  filterDate.value = ''
  filterCategoryId.value = ''
  filterModeId.value = ''
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
    <p class="mode-section__hint">
      每完成一轮完整测验会自动记一条。默认显示全部；可按日期、大类或小类筛选。
    </p>

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

    <p class="practice-log__meta">共 {{ rows.length }} 条记录</p>

    <ul v-if="rows.length" class="practice-log__list">
      <li v-for="row in rows" :key="row.id" class="practice-log__item">
        <div class="practice-log__item-main">
          <span class="practice-log__item-title">{{ row.itemLabel }}</span>
          <span class="practice-log__item-time">{{ formatLogTime(row.finishedAt) }}</span>
        </div>
        <p v-if="resultText(row)" class="practice-log__item-stats">{{ resultText(row) }}</p>
        <p class="practice-log__item-cat">{{ row.categoryLabel }}</p>
      </li>
    </ul>
    <p v-else class="practice-log__empty">暂无符合条件的记录。完成一轮测验后会出现在这里。</p>
  </section>
</template>

<style scoped>
.practice-log__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: flex-end;
  margin: 12px 0 8px;
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
}

.practice-log__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.practice-log__item {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.practice-log__item-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 12px;
}

.practice-log__item-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
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
