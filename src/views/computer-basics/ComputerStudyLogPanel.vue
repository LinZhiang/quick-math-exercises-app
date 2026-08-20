<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { localDateKey } from '@/utils/app/practiceSessionLog'
import {
  clearComputerStudyLogs,
  computerQuizResultText,
  computerStudyLogTick,
  filterComputerStudyLogs,
  formatComputerStudyTime,
  groupComputerStudyLogsByDate,
  listComputerStudyLogs,
} from '@/utils/computer/computerStudyLog'

const filterDate = ref(localDateKey())
const todayKey = computed(() => localDateKey())

const allLogs = computed(() => {
  void computerStudyLogTick.value
  return listComputerStudyLogs()
})

const days = computed(() =>
  groupComputerStudyLogsByDate(
    filterComputerStudyLogs({ dateKey: filterDate.value || undefined }),
  ),
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
      `确定清空全部 ${allLogs.value.length} 条学习日志？只清本机记录，不影响讲义。`,
      '清空日志',
      { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  clearComputerStudyLogs()
  showToday()
  ElMessage.success('已清空学习日志')
}
</script>

<template>
  <section class="cb-log">
    <div class="cb-log__filters">
      <label class="cb-log__field">
        <span>日期</span>
        <input v-model="filterDate" type="date" class="cb-log__input" />
      </label>
      <div class="cb-log__actions">
        <button type="button" class="cb-log__btn" :class="{ 'is-on': filterDate === todayKey }" @click="showToday">
          今天
        </button>
        <button type="button" class="cb-log__btn" :class="{ 'is-on': !filterDate }" @click="showAllDates">
          全部日期
        </button>
        <button
          type="button"
          class="cb-log__btn is-danger"
          :disabled="!allLogs.length"
          @click="onClearAll"
        >
          清空
        </button>
      </div>
    </div>

    <p class="cb-log__meta">
      记录保存在这台设备。共 {{ allLogs.length }} 条
      <template v-if="filterDate === todayKey"> · 正在看今天</template>
      <template v-else-if="filterDate"> · {{ filterDate }}</template>
    </p>

    <div v-if="days.length" class="cb-log__days">
      <article v-for="day in days" :key="day.dateKey" class="cb-log__day">
        <h4 class="cb-log__day-title">{{ day.dateKey === todayKey ? '今天' : day.dateKey }}</h4>

        <section class="cb-log__block">
          <h5>阅读章节</h5>
          <ul v-if="day.views.length">
            <li v-for="row in day.views" :key="row.id">
              <span class="cb-log__name">{{ row.itemTitle }}</span>
              <span v-if="row.pathLabel && row.pathLabel !== row.itemTitle" class="cb-log__path">{{
                row.pathLabel
              }}</span>
              <span class="cb-log__time">{{ formatComputerStudyTime(row.at) }}</span>
            </li>
          </ul>
          <p v-else class="cb-log__empty">这天没有打开讲义</p>
        </section>

        <section class="cb-log__block">
          <h5>测验</h5>
          <ul v-if="day.quizzes.length">
            <li v-for="row in day.quizzes" :key="row.id">
              <span class="cb-log__name">{{ row.itemTitle }}</span>
              <span class="cb-log__result">{{ computerQuizResultText(row) }}</span>
              <span class="cb-log__time">{{ formatComputerStudyTime(row.at) }}</span>
            </li>
          </ul>
          <p v-else class="cb-log__empty">这天没有完成测验</p>
        </section>
      </article>
    </div>
    <p v-else class="cb-log__empty cb-log__empty--page">
      <template v-if="filterDate === todayKey">今天还没有阅读或测验记录。</template>
      <template v-else>这段时间没有记录。打开讲义或做完一轮测验后会出现在这里。</template>
    </p>
  </section>
</template>

<style scoped>
.cb-log {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 4px 2px 12px;
  gap: 10px;
}

.cb-log__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px 12px;
}

.cb-log__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-log__input {
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--app-border-soft);
  border-radius: 8px;
  font: inherit;
}

.cb-log__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cb-log__btn {
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

.cb-log__btn.is-on {
  border-color: var(--app-primary);
  background: color-mix(in srgb, var(--app-primary-soft) 70%, #fff);
  color: var(--app-primary);
}

.cb-log__btn.is-danger {
  color: var(--app-danger);
}

.cb-log__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cb-log__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-log__days {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cb-log__day-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 750;
}

.cb-log__block h5 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.cb-log__block ul {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cb-log__block li {
  display: grid;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-primary-soft) 28%, #fff);
}

.cb-log__name {
  font-weight: 650;
  line-height: 1.35;
}

.cb-log__path,
.cb-log__result,
.cb-log__time {
  font-size: 12px;
  color: var(--app-text-muted);
}

.cb-log__empty {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-log__empty--page {
  margin-top: 12px;
}
</style>
