<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CHINESE_KEY_QUESTION_SOURCES,
  type ChineseKeyQuestionSource,
} from '@/constants/chinese-practice-tabs'
import type { KeyPracticePayload } from '@/types/chinese-practice'
import type {
  StoredCharLiteracyFavoriteRecord,
  StoredCharLiteracyRecord,
} from '@/utils/chineseCharLiteracyStorage'
import {
  listChineseCharLiteracyFavoriteRecords,
  listChineseCharLiteracyWrongRecords,
  removeChineseCharLiteracyFavorite,
  removeChineseCharLiteracyWrong,
  storedCharLiteracyToQuestion,
} from '@/utils/chineseCharLiteracyStorage'
import type { StoredCommonSenseFavoriteRecord, StoredCommonSenseRecord } from '@/utils/chineseCommonSenseStorage'
import {
  listChineseCommonSenseFavoriteRecords,
  listChineseCommonSenseWrongRecords,
  removeChineseCommonSenseFavorite,
  removeChineseCommonSenseWrong,
  storedCommonSenseToQuestion,
} from '@/utils/chineseCommonSenseStorage'
import type {
  StoredHistoryCommonSenseFavoriteRecord,
  StoredHistoryCommonSenseRecord,
} from '@/utils/chineseHistoryCommonSenseStorage'
import {
  listChineseHistoryCommonSenseFavoriteRecords,
  listChineseHistoryCommonSenseWrongRecords,
  removeChineseHistoryCommonSenseFavorite,
  removeChineseHistoryCommonSenseWrong,
  storedHistoryCommonSenseToQuestion,
} from '@/utils/chineseHistoryCommonSenseStorage'
import {
  chinesePracticeDataTick,
  listChineseFavoriteRecords,
  listChineseWrongRecords,
  removeChineseFavorite,
  removeChineseWrong,
  storedToQuestion,
  type StoredFavoriteRecord,
  type StoredIdiomRecord,
} from '@/utils/chineseIdiomStorage'
import type {
  StoredPartyHistoryFavoriteRecord,
  StoredPartyHistoryRecord,
} from '@/utils/chinesePartyHistoryStorage'
import {
  listChinesePartyHistoryFavoriteRecords,
  listChinesePartyHistoryWrongRecords,
  removeChinesePartyHistoryFavorite,
  removeChinesePartyHistoryWrong,
  storedPartyHistoryToQuestion,
} from '@/utils/chinesePartyHistoryStorage'
import {
  listChinesePoetryFavoriteRecords,
  listChinesePoetryWrongRecords,
  removeChinesePoetryFavorite,
  removeChinesePoetryWrong,
  storedPoetryToQuestion,
  type StoredPoetryFavoriteRecord,
  type StoredPoetryRecord,
} from '@/utils/chinesePoetryStorage'
import { charLiteracyQuestionTypeLabel } from '@/utils/charLiteracyPractice'
import { commonSenseQuestionTypeLabel } from '@/utils/commonSensePractice'
import { historyCommonSenseQuestionTypeLabel } from '@/utils/historyCommonSensePractice'
import { idiomQuestionTypeLabel } from '@/utils/idiomRecognitionPractice'
import { partyHistoryQuestionTypeLabel } from '@/utils/partyHistoryPractice'
import { poetryQuestionTypeLabel } from '@/utils/poetryRecognitionPractice'
import { getKeyQuestionNote, setKeyQuestionNote } from '@/utils/chineseKeyQuestionNotes'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'

type StoredRow =
  | StoredIdiomRecord
  | StoredFavoriteRecord
  | StoredCharLiteracyRecord
  | StoredCharLiteracyFavoriteRecord
  | StoredPoetryRecord
  | StoredPoetryFavoriteRecord
  | StoredCommonSenseRecord
  | StoredCommonSenseFavoriteRecord
  | StoredHistoryCommonSenseRecord
  | StoredHistoryCommonSenseFavoriteRecord
  | StoredPartyHistoryRecord
  | StoredPartyHistoryFavoriteRecord

const props = withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  { active: false },
)

const emit = defineEmits<{
  (e: 'practice', payload: KeyPracticePayload): void
}>()

const source = ref<ChineseKeyQuestionSource>('word-memorization')
const keyTab = ref<'wrong' | 'favorite'>('wrong')
const loading = ref(false)
const wrongRows = ref<StoredRow[]>([])
const favoriteRows = ref<StoredRow[]>([])
const selected = ref<Set<string>>(new Set())
const expandedFingerprint = ref<string | null>(null)
const noteDraft = ref('')
const noteEditing = ref(false)
const noteSaving = ref(false)

const activeRows = computed(() => (keyTab.value === 'wrong' ? wrongRows.value : favoriteRows.value))

function typeLabel(row: StoredRow): string {
  if (source.value === 'word-memorization') {
    return idiomQuestionTypeLabel(row.questionType as 'word-to-meaning' | 'meaning-to-word')
  }
  if (source.value === 'char-literacy') {
    return charLiteracyQuestionTypeLabel(row.questionType as 'pronunciation' | 'typo')
  }
  if (source.value === 'poetry-practice') {
    return poetryQuestionTypeLabel(row.questionType as 'poem-to-author' | 'poem-to-theme')
  }
  if (source.value === 'history-common-sense') {
    return historyCommonSenseQuestionTypeLabel('general')
  }
  if (source.value === 'party-history') {
    return partyHistoryQuestionTypeLabel('general')
  }
  return commonSenseQuestionTypeLabel('general')
}

function storedCorrectLabel(row: StoredRow): string {
  if (source.value === 'word-memorization' && row.questionType === 'meaning-to-word') {
    return row.term
  }
  return row.options[row.correctIndex] ?? '—'
}

function storedMeaningHint(row: StoredRow): string {
  if (source.value === 'word-memorization' && row.questionType === 'meaning-to-word') {
    return row.stem.replace(/[？?]\s*$/, '').trim() || '—'
  }
  return storedCorrectLabel(row)
}

function termDetailLabel(): string {
  if (source.value === 'word-memorization') return '词语'
  if (source.value === 'char-literacy') return '考点'
  if (source.value === 'poetry-practice') return '篇目'
  return '知识点'
}

function hintDetailLabel(): string {
  if (source.value === 'word-memorization') return '释义'
  if (source.value === 'char-literacy') return '答案'
  if (source.value === 'poetry-practice') return '要点'
  return '答案'
}

function loadRows() {
  if (source.value === 'word-memorization') {
    wrongRows.value = listChineseWrongRecords()
    favoriteRows.value = listChineseFavoriteRecords()
  } else if (source.value === 'char-literacy') {
    wrongRows.value = listChineseCharLiteracyWrongRecords()
    favoriteRows.value = listChineseCharLiteracyFavoriteRecords()
  } else if (source.value === 'poetry-practice') {
    wrongRows.value = listChinesePoetryWrongRecords()
    favoriteRows.value = listChinesePoetryFavoriteRecords()
  } else if (source.value === 'history-common-sense') {
    wrongRows.value = listChineseHistoryCommonSenseWrongRecords()
    favoriteRows.value = listChineseHistoryCommonSenseFavoriteRecords()
  } else if (source.value === 'party-history') {
    wrongRows.value = listChinesePartyHistoryWrongRecords()
    favoriteRows.value = listChinesePartyHistoryFavoriteRecords()
  } else {
    wrongRows.value = listChineseCommonSenseWrongRecords()
    favoriteRows.value = listChineseCommonSenseFavoriteRecords()
  }
}

function syncSelectAll() {
  selected.value = new Set(activeRows.value.map((r) => r.fingerprint))
}

function refresh() {
  loading.value = true
  try {
    loadRows()
    syncSelectAll()
  } finally {
    loading.value = false
  }
}

function toggleSelect(fp: string) {
  const next = new Set(selected.value)
  if (next.has(fp)) next.delete(fp)
  else next.add(fp)
  selected.value = next
}

function toggleRowDetail(fp: string) {
  if (expandedFingerprint.value === fp) {
    expandedFingerprint.value = null
    noteDraft.value = ''
    noteEditing.value = false
    return
  }
  expandedFingerprint.value = fp
  noteDraft.value = getKeyQuestionNote(source.value, fp)
  noteEditing.value = false
}

function rowNote(fp: string): string {
  return getKeyQuestionNote(source.value, fp)
}

function noteHtml(fp: string): string {
  const note = rowNote(fp)
  return note ? markdownToDisplaySafeHtml(note) : ''
}

function onEditNote(fp: string) {
  noteDraft.value = getKeyQuestionNote(source.value, fp)
  noteEditing.value = true
}

function onCancelNoteEdit(fp: string) {
  noteDraft.value = getKeyQuestionNote(source.value, fp)
  noteEditing.value = false
}

function onSaveNote(fp: string) {
  noteSaving.value = true
  try {
    setKeyQuestionNote(source.value, fp, noteDraft.value)
    noteEditing.value = false
    ElMessage.success(noteDraft.value.trim() ? '备注已保存' : '已清空备注')
  } finally {
    noteSaving.value = false
  }
}

function selectAll() {
  selected.value = new Set(activeRows.value.map((r) => r.fingerprint))
}

function onPractice() {
  const fps = selected.value
  const rows = activeRows.value.filter((r) => fps.has(r.fingerprint))
  if (!rows.length) {
    ElMessage.warning('请先勾选题目')
    return
  }
  if (source.value === 'word-memorization') {
    emit('practice', {
      source: 'word-memorization',
      questions: rows.map((r, i) => storedToQuestion(r as StoredIdiomRecord | StoredFavoriteRecord, i + 1)),
    })
  } else if (source.value === 'char-literacy') {
    emit('practice', {
      source: 'char-literacy',
      questions: rows.map((r, i) =>
        storedCharLiteracyToQuestion(r as StoredCharLiteracyRecord | StoredCharLiteracyFavoriteRecord, i + 1),
      ),
    })
  } else if (source.value === 'poetry-practice') {
    emit('practice', {
      source: 'poetry-practice',
      questions: rows.map((r, i) =>
        storedPoetryToQuestion(r as StoredPoetryRecord | StoredPoetryFavoriteRecord, i + 1),
      ),
    })
  } else if (source.value === 'history-common-sense') {
    emit('practice', {
      source: 'history-common-sense',
      questions: rows.map((r, i) =>
        storedHistoryCommonSenseToQuestion(
          r as StoredHistoryCommonSenseRecord | StoredHistoryCommonSenseFavoriteRecord,
          i + 1,
        ),
      ),
    })
  } else if (source.value === 'party-history') {
    emit('practice', {
      source: 'party-history',
      questions: rows.map((r, i) =>
        storedPartyHistoryToQuestion(r as StoredPartyHistoryRecord | StoredPartyHistoryFavoriteRecord, i + 1),
      ),
    })
  } else {
    emit('practice', {
      source: 'common-sense',
      questions: rows.map((r, i) =>
        storedCommonSenseToQuestion(r as StoredCommonSenseRecord | StoredCommonSenseFavoriteRecord, i + 1),
      ),
    })
  }
}

function onRemove(fp: string) {
  if (source.value === 'word-memorization') {
    if (keyTab.value === 'wrong') removeChineseWrong(fp)
    else removeChineseFavorite(fp)
  } else if (source.value === 'char-literacy') {
    if (keyTab.value === 'wrong') removeChineseCharLiteracyWrong(fp)
    else removeChineseCharLiteracyFavorite(fp)
  } else if (source.value === 'poetry-practice') {
    if (keyTab.value === 'wrong') removeChinesePoetryWrong(fp)
    else removeChinesePoetryFavorite(fp)
  } else if (source.value === 'history-common-sense') {
    if (keyTab.value === 'wrong') removeChineseHistoryCommonSenseWrong(fp)
    else removeChineseHistoryCommonSenseFavorite(fp)
  } else if (source.value === 'party-history') {
    if (keyTab.value === 'wrong') removeChinesePartyHistoryWrong(fp)
    else removeChinesePartyHistoryFavorite(fp)
  } else if (keyTab.value === 'wrong') {
    removeChineseCommonSenseWrong(fp)
  } else {
    removeChineseCommonSenseFavorite(fp)
  }
  selected.value.delete(fp)
  refresh()
  ElMessage.success('已删除')
}

onMounted(refresh)

watch(chinesePracticeDataTick, () => {
  refresh()
})

watch(source, () => {
  expandedFingerprint.value = null
  noteDraft.value = ''
  noteEditing.value = false
  keyTab.value = 'wrong'
  refresh()
})

watch(keyTab, () => {
  expandedFingerprint.value = null
  noteDraft.value = ''
  noteEditing.value = false
  syncSelectAll()
})

watch(
  () => props.active,
  (v) => {
    if (v) refresh()
  },
)

defineExpose({ refresh })
</script>

<template>
  <div class="chinese-key-panel">
    <p class="mode-section__hint">
      汇总各练习模块的错题与收藏；默认全选，点击词条可展开详情。数据保存在本浏览器本地。
    </p>

    <div class="chinese-key__sources">
      <button
        v-for="item in CHINESE_KEY_QUESTION_SOURCES"
        :key="item.id"
        type="button"
        class="chinese-key__source"
        :class="{ 'is-active': source === item.id }"
        @click="source = item.id"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="chinese-key__tabs">
      <button
        type="button"
        class="chinese-key__tab"
        :class="{ 'is-active': keyTab === 'wrong' }"
        @click="keyTab = 'wrong'"
      >
        错题（{{ wrongRows.length }}）
      </button>
      <button
        type="button"
        class="chinese-key__tab"
        :class="{ 'is-active': keyTab === 'favorite' }"
        @click="keyTab = 'favorite'"
      >
        收藏（{{ favoriteRows.length }}）
      </button>
      <el-button size="small" plain :loading="loading" @click="refresh">刷新</el-button>
    </div>

    <p v-if="!activeRows.length" class="chinese-key__empty">
      暂无{{ keyTab === 'wrong' ? '错题' : '收藏' }}。
    </p>

    <ul v-else class="chinese-key__list">
      <li
        v-for="row in activeRows"
        :key="row.fingerprint"
        class="chinese-key__row"
        :class="{ 'chinese-key__row--expanded': expandedFingerprint === row.fingerprint }"
      >
        <label class="chinese-key__check" @click.stop>
          <input
            type="checkbox"
            :checked="selected.has(row.fingerprint)"
            @change="toggleSelect(row.fingerprint)"
          />
        </label>
        <button
          type="button"
          class="chinese-key__body"
          @click="toggleRowDetail(row.fingerprint)"
        >
          <p class="chinese-key__term">
            <template v-if="source === 'poetry-practice'">《{{ row.term }}》</template>
            <template v-else>{{ row.term }}</template>
          </p>
          <p class="chinese-key__stem">{{ row.stem }}</p>
          <p class="chinese-key__meta">
            {{ typeLabel(row) }}
            <template v-if="keyTab === 'wrong' && 'wrongCount' in row">
              · 错 {{ row.wrongCount }} 次
            </template>
            <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
            <span class="chinese-key__hint"> · 点击查看详情</span>
          </p>
          <div
            v-if="expandedFingerprint === row.fingerprint"
            class="chinese-key__detail"
            @click.stop
          >
            <p class="chinese-key__detail-line">
              <strong>{{ termDetailLabel() }}：</strong>{{ row.term }}
            </p>
            <p class="chinese-key__detail-line">
              <strong>{{ hintDetailLabel() }}：</strong>{{ storedMeaningHint(row) }}
            </p>
            <p
              v-if="source === 'word-memorization' && row.questionType === 'word-to-meaning'"
              class="chinese-key__detail-line"
            >
              <strong>正确选项：</strong>{{ storedCorrectLabel(row) }}
            </p>
            <p v-if="row.explanation" class="chinese-key__detail-line">
              <strong>解析：</strong>{{ row.explanation }}
            </p>
            <p class="chinese-key__detail-line chinese-key__detail-options">
              <strong>全部选项：</strong>
              <span
                v-for="(opt, idx) in row.options"
                :key="idx"
                class="chinese-key__option-tag"
                :class="{ 'is-correct': idx === row.correctIndex }"
              >
                {{ opt }}
              </span>
            </p>
            <div class="chinese-key__note">
              <div class="chinese-key__note-head">
                <strong>备注</strong>
                <el-button
                  v-if="!noteEditing"
                  size="small"
                  text
                  type="primary"
                  @click="onEditNote(row.fingerprint)"
                >
                  {{ rowNote(row.fingerprint) ? '编辑' : '添加备注' }}
                </el-button>
              </div>
              <template v-if="noteEditing">
                <el-input
                  v-model="noteDraft"
                  type="textarea"
                  :rows="3"
                  maxlength="500"
                  show-word-limit
                  placeholder="支持 Markdown，如标题、列表、加粗等"
                />
                <div class="chinese-key__note-actions">
                  <el-button
                    size="small"
                    type="primary"
                    :loading="noteSaving"
                    @click="onSaveNote(row.fingerprint)"
                  >
                    保存
                  </el-button>
                  <el-button size="small" plain @click="onCancelNoteEdit(row.fingerprint)">
                    取消
                  </el-button>
                </div>
              </template>
              <template v-else-if="rowNote(row.fingerprint)">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="chinese-key__note-md deepseek-md" v-html="noteHtml(row.fingerprint)" />
              </template>
              <p v-else class="chinese-key__note-empty">暂无备注</p>
            </div>
          </div>
        </button>
        <el-button size="small" text type="danger" @click.stop="onRemove(row.fingerprint)">
          删除
        </el-button>
      </li>
    </ul>

    <div v-if="activeRows.length" class="chinese-key__actions">
      <el-button type="primary" :disabled="selected.size === 0" @click="onPractice">
        练习所选（{{ selected.size }} 题）
      </el-button>
      <el-button plain @click="selectAll">全选</el-button>
    </div>
  </div>
</template>

<style scoped>
.chinese-key__sources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 10px;
}

.chinese-key__source {
  padding: 6px 12px;
  border: 1px solid var(--app-border-soft);
  border-radius: 8px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.chinese-key__source.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.chinese-key__tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 14px 0;
}

.chinese-key__tab {
  padding: 8px 14px;
  border: 1px solid var(--app-border-soft);
  border-radius: 999px;
  background: var(--app-surface-alt);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.chinese-key__tab.is-active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.chinese-key__empty {
  font-size: 14px;
  color: var(--app-text-muted);
}

.chinese-key__list {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  border: 1px solid var(--app-border-soft);
  border-radius: 10px;
  max-height: 380px;
  overflow-y: auto;
}

.chinese-key__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--app-border-soft);
}

.chinese-key__row:last-child {
  border-bottom: none;
}

.chinese-key__row--expanded {
  background: color-mix(in srgb, var(--el-color-primary-light-9) 35%, transparent);
}

.chinese-key__term {
  margin: 0 0 4px;
  font-weight: 700;
}

.chinese-key__stem {
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-line;
}

.chinese-key__meta {
  margin: 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.chinese-key__body {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.chinese-key__hint {
  opacity: 0.85;
}

.chinese-key__detail {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--app-border-soft);
  background: var(--app-surface);
  font-size: 13px;
  line-height: 1.6;
}

.chinese-key__detail-line {
  margin: 0 0 8px;
}

.chinese-key__detail-line:last-child {
  margin-bottom: 0;
}

.chinese-key__detail-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.chinese-key__note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--app-border-soft);
  display: grid;
  gap: 8px;
}

.chinese-key__note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.chinese-key__note-empty {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-key__note-md {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.chinese-key__note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chinese-key__option-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--app-border-soft);
  font-size: 12px;
}

.chinese-key__option-tag.is-correct {
  border-color: var(--el-color-success);
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 50%, transparent);
}

.chinese-key__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
