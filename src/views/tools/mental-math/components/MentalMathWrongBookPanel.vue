<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  clearMentalMathWrongSection,
  countMentalMathWrongRecords,
  listMentalMathWrongRecords,
  MENTAL_MATH_WRONG_SECTION_LABELS,
  mentalMathWrongBookTick,
  removeMentalMathWrong,
  type MentalMathWrongRecord,
  type MentalMathWrongSection,
} from '@/utils/mentalMathWrongBook'

const props = defineProps<{
  section: MentalMathWrongSection
}>()

const open = ref(false)
const detail = ref<MentalMathWrongRecord | null>(null)
const detailVisible = ref(false)

const title = computed(() => MENTAL_MATH_WRONG_SECTION_LABELS[props.section])

const rows = computed(() => {
  void mentalMathWrongBookTick.value
  return listMentalMathWrongRecords(props.section)
})

const count = computed(() => {
  void mentalMathWrongBookTick.value
  return countMentalMathWrongRecords(props.section)
})

watch(
  () => props.section,
  () => {
    open.value = false
    detailVisible.value = false
    detail.value = null
  },
)

function toggleOpen() {
  open.value = !open.value
}

function openDetail(row: MentalMathWrongRecord) {
  detail.value = row
  detailVisible.value = true
}

function onDetailClosed() {
  detail.value = null
}

async function onRemove(fp: string) {
  try {
    await ElMessageBox.confirm('确定从错题集中删除这道题？', '删除错题', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  removeMentalMathWrong(fp)
  if (detail.value?.fingerprint === fp) {
    detailVisible.value = false
    detail.value = null
  }
  ElMessage.success('已删除')
}

async function onClearAll() {
  if (!count.value) return
  try {
    await ElMessageBox.confirm(
      `确定清空「${title.value}」全部 ${count.value} 道错题？`,
      '清空错题集',
      { type: 'warning', confirmButtonText: '清空', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  clearMentalMathWrongSection(props.section)
  detailVisible.value = false
  detail.value = null
  ElMessage.success('已清空')
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="mm-wrong">
    <div class="mm-wrong__bar">
      <button type="button" class="mm-wrong__toggle" @click="toggleOpen">
        <span>错题集</span>
        <strong>{{ count }}</strong>
        <span class="mm-wrong__chevron" :class="{ 'is-open': open }">▾</span>
      </button>
      <el-button
        v-if="open && count > 0"
        size="small"
        text
        type="danger"
        @click="onClearAll"
      >
        清空
      </el-button>
    </div>

    <div v-if="open" class="mm-wrong__panel">
      <p v-if="!count" class="mm-wrong__empty">
        暂无错题。练习时答错会自动记入本菜单的错题集，方便回头看。
      </p>
      <ul v-else class="mm-wrong__list">
        <li v-for="row in rows" :key="row.fingerprint" class="mm-wrong__row">
          <button type="button" class="mm-wrong__body" @click="openDetail(row)">
            <p class="mm-wrong__expr">{{ row.expression }}</p>
            <p class="mm-wrong__meta">
              错 {{ row.wrongCount }} 次
              <template v-if="formatTime(row.updatedAt)"> · {{ formatTime(row.updatedAt) }}</template>
              · 点看详情
            </p>
          </button>
          <el-button size="small" text type="danger" @click="onRemove(row.fingerprint)">
            删除
          </el-button>
        </li>
      </ul>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="`${title} · 错题详情`"
      width="560px"
      align-center
      destroy-on-close
      append-to-body
      @closed="onDetailClosed"
    >
      <div v-if="detail" class="mm-wrong-detail">
        <section>
          <h4>题目</h4>
          <p class="mm-wrong-detail__expr">{{ detail.expression }}</p>
        </section>
        <section>
          <h4>你的答案</h4>
          <p class="mm-wrong-detail__bad">{{ detail.chosenAnswer }}</p>
        </section>
        <section>
          <h4>正确答案</h4>
          <p class="mm-wrong-detail__ok">{{ detail.correctAnswer }}</p>
        </section>
        <section v-if="detail.options?.length">
          <h4>当时选项</h4>
          <ul class="mm-wrong-detail__opts">
            <li
              v-for="(opt, idx) in detail.options"
              :key="idx"
              :class="{ 'is-correct': String(opt) === detail.correctAnswer }"
            >
              {{ opt }}
            </li>
          </ul>
        </section>
        <section v-if="detail.explanation">
          <h4>说明</h4>
          <p class="mm-wrong-detail__exp">{{ detail.explanation }}</p>
        </section>
      </div>
      <template #footer>
        <el-button
          v-if="detail"
          type="danger"
          plain
          @click="detail && onRemove(detail.fingerprint)"
        >
          删除本题
        </el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mm-wrong {
  margin-top: 12px;
}

.mm-wrong__bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-wrong__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 999px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.mm-wrong__toggle strong {
  min-width: 1.2em;
  color: var(--el-color-danger);
}

.mm-wrong__chevron {
  display: inline-block;
  transition: transform 0.15s ease;
  opacity: 0.7;
}

.mm-wrong__chevron.is-open {
  transform: rotate(-180deg);
}

.mm-wrong__panel {
  margin-top: 10px;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  overflow: hidden;
  background: var(--app-surface);
}

.mm-wrong__empty {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--app-text-muted);
  line-height: 1.5;
}

.mm-wrong__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
}

.mm-wrong__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border-soft);
}

.mm-wrong__row:last-child {
  border-bottom: none;
}

.mm-wrong__body {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.mm-wrong__expr {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
}

.mm-wrong__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.mm-wrong-detail {
  display: grid;
  gap: 14px;
}

.mm-wrong-detail h4 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.mm-wrong-detail__expr,
.mm-wrong-detail__ok,
.mm-wrong-detail__bad,
.mm-wrong-detail__exp {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-word;
}

.mm-wrong-detail__ok {
  color: var(--el-color-success);
  font-weight: 700;
}

.mm-wrong-detail__bad {
  color: var(--el-color-danger);
}

.mm-wrong-detail__opts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.mm-wrong-detail__opts li {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--app-border-soft);
  font-size: 13px;
}

.mm-wrong-detail__opts li.is-correct {
  border-color: var(--el-color-success);
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 55%, transparent);
}
</style>
