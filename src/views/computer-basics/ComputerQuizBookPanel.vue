<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  computerQuizBookTick,
  listComputerQuizFavoriteRecords,
  listComputerQuizWrongRecords,
  removeComputerQuizFavorite,
  removeComputerQuizWrong,
  type StoredComputerQuizRecord,
} from '@/utils/computer/computerHandoutQuizStorage'
import { computerQuizKindLabel } from '@/utils/computer/computerHandoutQuiz'
import RichTextView from '@/components/RichTextView.vue'

const tab = ref<'wrong' | 'favorite'>('wrong')
const openFp = ref('')

const wrongs = computed(() => {
  void computerQuizBookTick.value
  return listComputerQuizWrongRecords()
})
const favs = computed(() => {
  void computerQuizBookTick.value
  return listComputerQuizFavoriteRecords()
})
const rows = computed(() => (tab.value === 'wrong' ? wrongs.value : favs.value))

function toggleOpen(fp: string) {
  openFp.value = openFp.value === fp ? '' : fp
}

function remove(row: StoredComputerQuizRecord) {
  if (tab.value === 'wrong') removeComputerQuizWrong(row.fingerprint)
  else removeComputerQuizFavorite(row.fingerprint)
}
</script>

<template>
  <section class="cb-book">
    <div class="cb-book__tabs">
      <el-radio-group v-model="tab" size="small">
        <el-radio-button value="wrong">错题 {{ wrongs.length }}</el-radio-button>
        <el-radio-button value="favorite">收藏 {{ favs.length }}</el-radio-button>
      </el-radio-group>
    </div>
    <p v-if="!rows.length" class="cb-book__empty">暂无记录。在目录或讲义里点「AI测验」作答后会出现在这里。</p>
    <ul v-else class="cb-book__list">
      <li v-for="row in rows" :key="row.fingerprint">
        <button type="button" class="cb-book__row" @click="toggleOpen(row.fingerprint)">
          <span class="cb-book__kind">{{ computerQuizKindLabel(row.kind) }}</span>
          <span class="cb-book__title">{{ row.term || row.stem }}</span>
        </button>
        <div v-if="openFp === row.fingerprint" class="cb-book__detail">
          <p class="cb-book__from">{{ row.itemTitle }}</p>
          <RichTextView :html="row.stem" />
          <ul v-if="row.options.length" class="cb-book__opts">
            <li v-for="(opt, i) in row.options" :key="i">{{ opt }}</li>
          </ul>
          <p>答案：{{ row.correctText }}</p>
          <RichTextView v-if="row.explanation" :html="row.explanation" />
          <el-button size="small" type="danger" plain @click="remove(row)">删除</el-button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.cb-book {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cb-book__tabs {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.cb-book__empty {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.cb-book__list {
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
}

.cb-book__row {
  appearance: none;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 4px;
  border: none;
  border-bottom: 1px solid var(--app-border-soft);
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.cb-book__kind {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--app-primary);
  font-weight: 700;
}

.cb-book__title {
  min-width: 0;
}

.cb-book__detail {
  padding: 8px 4px 12px;
  display: grid;
  gap: 8px;
  font-size: 13px;
}

.cb-book__from {
  margin: 0;
  color: var(--app-text-muted);
}

.cb-book__opts {
  margin: 0;
  padding-left: 1.2em;
}
</style>
