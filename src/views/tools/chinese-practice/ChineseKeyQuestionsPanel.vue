<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CHINESE_KEY_QUESTION_SOURCES,
  readingSubModeFromKeySource,
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
import type {
  StoredClassicalChineseFavoriteRecord,
  StoredClassicalChineseRecord,
} from '@/utils/chineseClassicalChineseStorage'
import {
  listChineseClassicalChineseFavoriteRecords,
  listChineseClassicalChineseWrongRecords,
  removeChineseClassicalChineseFavorite,
  removeChineseClassicalChineseWrong,
  storedClassicalChineseToQuestion,
} from '@/utils/chineseClassicalChineseStorage'
import type {
  StoredGeographyCommonSenseFavoriteRecord,
  StoredGeographyCommonSenseRecord,
} from '@/utils/chineseGeographyCommonSenseStorage'
import {
  listChineseGeographyCommonSenseFavoriteRecords,
  listChineseGeographyCommonSenseWrongRecords,
  removeChineseGeographyCommonSenseFavorite,
  removeChineseGeographyCommonSenseWrong,
  storedGeographyCommonSenseToQuestion,
} from '@/utils/chineseGeographyCommonSenseStorage'
import type {
  StoredEconomyCommonSenseFavoriteRecord,
  StoredEconomyCommonSenseRecord,
} from '@/utils/chineseEconomyCommonSenseStorage'
import {
  listChineseEconomyCommonSenseFavoriteRecords,
  listChineseEconomyCommonSenseWrongRecords,
  removeChineseEconomyCommonSenseFavorite,
  removeChineseEconomyCommonSenseWrong,
  storedEconomyCommonSenseToQuestion,
} from '@/utils/chineseEconomyCommonSenseStorage'
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
  StoredLegalCommonSenseFavoriteRecord,
  StoredLegalCommonSenseRecord,
} from '@/utils/chineseLegalCommonSenseStorage'
import {
  listChineseLegalCommonSenseFavoriteRecords,
  listChineseLegalCommonSenseWrongRecords,
  removeChineseLegalCommonSenseFavorite,
  removeChineseLegalCommonSenseWrong,
  storedLegalCommonSenseToQuestion,
} from '@/utils/chineseLegalCommonSenseStorage'
import type {
  StoredLifeCommonSenseFavoriteRecord,
  StoredLifeCommonSenseRecord,
} from '@/utils/chineseLifeCommonSenseStorage'
import {
  listChineseLifeCommonSenseFavoriteRecords,
  listChineseLifeCommonSenseWrongRecords,
  removeChineseLifeCommonSenseFavorite,
  removeChineseLifeCommonSenseWrong,
  storedLifeCommonSenseToQuestion,
} from '@/utils/chineseLifeCommonSenseStorage'
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
import type {
  StoredReadingComprehensionFavoriteRecord,
  StoredReadingComprehensionRecord,
} from '@/utils/chineseReadingComprehensionStorage'
import {
  listChineseReadingComprehensionFavoriteRecords,
  listChineseReadingComprehensionWrongRecords,
  removeChineseReadingComprehensionFavorite,
  removeChineseReadingComprehensionWrong,
  storedReadingComprehensionToQuestion,
} from '@/utils/chineseReadingComprehensionStorage'
import type {
  StoredRhetoricUsageFavoriteRecord,
  StoredRhetoricUsageRecord,
} from '@/utils/chineseRhetoricUsageStorage'
import {
  listChineseRhetoricUsageFavoriteRecords,
  listChineseRhetoricUsageWrongRecords,
  removeChineseRhetoricUsageFavorite,
  removeChineseRhetoricUsageWrong,
  storedRhetoricUsageToQuestion,
} from '@/utils/chineseRhetoricUsageStorage'
import type {
  StoredTheoryPolicyFavoriteRecord,
  StoredTheoryPolicyRecord,
} from '@/utils/chineseTheoryPolicyStorage'
import {
  listChineseTheoryPolicyFavoriteRecords,
  listChineseTheoryPolicyWrongRecords,
  removeChineseTheoryPolicyFavorite,
  removeChineseTheoryPolicyWrong,
  storedTheoryPolicyToQuestion,
} from '@/utils/chineseTheoryPolicyStorage'
import type {
  StoredWordMemorizationFavoriteRecord,
  StoredWordMemorizationRecord,
} from '@/utils/chineseWordMemorizationStorage'
import {
  listChineseWordMemorizationFavoriteRecords,
  listChineseWordMemorizationWrongRecords,
  removeChineseWordMemorizationFavorite,
  removeChineseWordMemorizationWrong,
  storedWordMemorizationToQuestion,
} from '@/utils/chineseWordMemorizationStorage'
import { charLiteracyQuestionTypeLabel } from '@/utils/charLiteracyPractice'
import { classicalChineseQuestionTypeLabel } from '@/utils/classicalChinesePractice'
import { economyCommonSenseQuestionTypeLabel } from '@/utils/economyCommonSensePractice'
import { geographyCommonSenseQuestionTypeLabel } from '@/utils/geographyCommonSensePractice'
import { historyCommonSenseQuestionTypeLabel } from '@/utils/historyCommonSensePractice'
import { idiomQuestionTypeLabel } from '@/utils/idiomRecognitionPractice'
import { legalCommonSenseQuestionTypeLabel } from '@/utils/legalCommonSensePractice'
import { lifeCommonSenseQuestionTypeLabel } from '@/utils/lifeCommonSensePractice'
import { partyHistoryQuestionTypeLabel } from '@/utils/partyHistoryPractice'
import { poetryQuestionTypeLabel } from '@/utils/poetryRecognitionPractice'
import {
  readingComprehensionQuestionTypeLabel,
  type ChineseReadingQuestionType,
} from '@/utils/readingComprehensionPractice'
import { rhetoricUsageQuestionTypeLabel } from '@/utils/rhetoricUsagePractice'
import { theoryPolicyQuestionTypeLabel } from '@/utils/theoryPolicyPractice'
import { wordMemorizationQuestionTypeLabel } from '@/utils/wordMemorizationPractice'
import { buildKeyPracticeQuestionsWithVariants } from '@/utils/chineseKeyQuestionVariants'
import { isAiChatConfigured } from '@/services/deepseek'
import { getKeyQuestionNote, setKeyQuestionNote } from '@/utils/chineseKeyQuestionNotes'
import { markdownToDisplaySafeHtml } from '@/utils/markdownToHtml'
import WrongBookImmersivePreview, {
  type WrongBookPreviewItem,
} from '@/views/tools/mental-math/components/WrongBookImmersivePreview.vue'

type StoredRow =
  | StoredIdiomRecord
  | StoredFavoriteRecord
  | StoredWordMemorizationRecord
  | StoredWordMemorizationFavoriteRecord
  | StoredCharLiteracyRecord
  | StoredCharLiteracyFavoriteRecord
  | StoredPoetryRecord
  | StoredPoetryFavoriteRecord
  | StoredClassicalChineseRecord
  | StoredClassicalChineseFavoriteRecord
  | StoredRhetoricUsageRecord
  | StoredRhetoricUsageFavoriteRecord
  | StoredReadingComprehensionRecord
  | StoredReadingComprehensionFavoriteRecord
  | StoredHistoryCommonSenseRecord
  | StoredHistoryCommonSenseFavoriteRecord
  | StoredPartyHistoryRecord
  | StoredPartyHistoryFavoriteRecord
  | StoredTheoryPolicyRecord
  | StoredTheoryPolicyFavoriteRecord
  | StoredLegalCommonSenseRecord
  | StoredLegalCommonSenseFavoriteRecord
  | StoredEconomyCommonSenseRecord
  | StoredEconomyCommonSenseFavoriteRecord
  | StoredLifeCommonSenseRecord
  | StoredLifeCommonSenseFavoriteRecord
  | StoredGeographyCommonSenseRecord
  | StoredGeographyCommonSenseFavoriteRecord

const props = withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  { active: false },
)

const emit = defineEmits<{
  (e: 'practice', payload: KeyPracticePayload): void
}>()

const source = ref<ChineseKeyQuestionSource>('idiom-memorization')
const keyTab = ref<'wrong' | 'favorite'>('wrong')
const loading = ref(false)
const variantLoading = ref(false)
const variantProgress = ref('')
const wrongRows = ref<StoredRow[]>([])
const favoriteRows = ref<StoredRow[]>([])
const selected = ref<Set<string>>(new Set())
const expandedFingerprint = ref<string | null>(null)
const detailDialogVisible = ref(false)
const noteDraft = ref('')
const noteEditing = ref(false)
const noteSaving = ref(false)
const previewOpen = ref(false)
const previewIndex = ref(0)

const activeRows = computed(() => (keyTab.value === 'wrong' ? wrongRows.value : favoriteRows.value))

const previewTitle = computed(() => {
  const src = CHINESE_KEY_QUESTION_SOURCES.find((s) => s.id === source.value)
  const tab = keyTab.value === 'wrong' ? '错题' : '收藏'
  return `${src?.title ?? '关题'} · ${tab}`
})

const previewItems = computed((): WrongBookPreviewItem[] => {
  void chinesePracticeDataTick.value
  return activeRows.value.map((row) => {
    const passage = rowPassage(row)
    const expression = passage
      ? `${passage}\n\n${row.stem}`
      : row.stem || row.term
    return {
      key: row.fingerprint,
      expression,
      correctAnswer: storedCorrectLabel(row),
      explanation: row.explanation,
      note: getKeyQuestionNote(source.value, row.fingerprint),
      prose: true,
      options: row.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === row.correctIndex,
      })),
    }
  })
})

const detailRow = computed(
  () => activeRows.value.find((r) => r.fingerprint === expandedFingerprint.value) ?? null,
)

function isVocabSource(src: ChineseKeyQuestionSource): boolean {
  return src === 'idiom-memorization' || src === 'word-memorization'
}

function isReadingSource(src: ChineseKeyQuestionSource): boolean {
  return readingSubModeFromKeySource(src) != null
}

function typeLabel(row: StoredRow): string {
  if (source.value === 'idiom-memorization') {
    return idiomQuestionTypeLabel(row.questionType as 'word-to-meaning' | 'meaning-to-word')
  }
  if (source.value === 'word-memorization') {
    return wordMemorizationQuestionTypeLabel(row.questionType as 'word-to-meaning' | 'meaning-to-word')
  }
  if (source.value === 'char-literacy') {
    return charLiteracyQuestionTypeLabel(row.questionType as 'pronunciation' | 'typo')
  }
  if (source.value === 'poetry-practice') {
    return poetryQuestionTypeLabel(row.questionType as 'poem-to-author' | 'poem-to-theme')
  }
  if (source.value === 'classical-chinese') {
    return classicalChineseQuestionTypeLabel('general')
  }
  if (source.value === 'rhetoric-usage') {
    return rhetoricUsageQuestionTypeLabel('general')
  }
  if (isReadingSource(source.value)) {
    return readingComprehensionQuestionTypeLabel(row.questionType as ChineseReadingQuestionType)
  }
  if (source.value === 'history-common-sense') {
    return historyCommonSenseQuestionTypeLabel('general')
  }
  if (source.value === 'party-history') {
    return partyHistoryQuestionTypeLabel('general')
  }
  if (source.value === 'theory-policy') {
    return theoryPolicyQuestionTypeLabel('general')
  }
  if (source.value === 'legal-common-sense') {
    return legalCommonSenseQuestionTypeLabel('general')
  }
  if (source.value === 'economy-common-sense') {
    return economyCommonSenseQuestionTypeLabel('general')
  }
  if (source.value === 'life-common-sense') {
    return lifeCommonSenseQuestionTypeLabel('general')
  }
  if (source.value === 'geography-common-sense') {
    return geographyCommonSenseQuestionTypeLabel('general')
  }
  return '练习'
}

function storedCorrectLabel(row: StoredRow): string {
  if (isVocabSource(source.value) && row.questionType === 'meaning-to-word') {
    return row.term
  }
  return row.options[row.correctIndex] ?? '—'
}

function storedMeaningHint(row: StoredRow): string {
  if (isVocabSource(source.value) && row.questionType === 'meaning-to-word') {
    return row.stem.replace(/[？?]\s*$/, '').trim() || '—'
  }
  return storedCorrectLabel(row)
}

function termDetailLabel(): string {
  if (isVocabSource(source.value)) return '词语'
  if (source.value === 'char-literacy') return '考点'
  if (source.value === 'poetry-practice') return '篇目'
  if (isReadingSource(source.value)) return '材料'
  return '知识点'
}

function hintDetailLabel(): string {
  if (isVocabSource(source.value)) return '释义'
  if (source.value === 'char-literacy') return '答案'
  if (source.value === 'poetry-practice') return '要点'
  if (isReadingSource(source.value)) return '答案'
  return '答案'
}

function rowPassage(row: StoredRow): string {
  return 'passage' in row && typeof row.passage === 'string' ? row.passage.trim() : ''
}

function openPreview(startFp?: string) {
  if (!activeRows.value.length) {
    ElMessage.info(keyTab.value === 'wrong' ? '暂无错题可预览' : '暂无收藏可预览')
    return
  }
  const idx = startFp
    ? activeRows.value.findIndex((r) => r.fingerprint === startFp)
    : 0
  previewIndex.value = idx >= 0 ? idx : 0
  detailDialogVisible.value = false
  previewOpen.value = true
}

function loadRows() {
  const readingMode = readingSubModeFromKeySource(source.value)
  if (source.value === 'idiom-memorization') {
    wrongRows.value = listChineseWrongRecords()
    favoriteRows.value = listChineseFavoriteRecords()
  } else if (source.value === 'word-memorization') {
    wrongRows.value = listChineseWordMemorizationWrongRecords()
    favoriteRows.value = listChineseWordMemorizationFavoriteRecords()
  } else if (source.value === 'char-literacy') {
    wrongRows.value = listChineseCharLiteracyWrongRecords()
    favoriteRows.value = listChineseCharLiteracyFavoriteRecords()
  } else if (source.value === 'poetry-practice') {
    wrongRows.value = listChinesePoetryWrongRecords()
    favoriteRows.value = listChinesePoetryFavoriteRecords()
  } else if (source.value === 'classical-chinese') {
    wrongRows.value = listChineseClassicalChineseWrongRecords()
    favoriteRows.value = listChineseClassicalChineseFavoriteRecords()
  } else if (source.value === 'rhetoric-usage') {
    wrongRows.value = listChineseRhetoricUsageWrongRecords()
    favoriteRows.value = listChineseRhetoricUsageFavoriteRecords()
  } else if (readingMode) {
    wrongRows.value = listChineseReadingComprehensionWrongRecords(readingMode)
    favoriteRows.value = listChineseReadingComprehensionFavoriteRecords(readingMode)
  } else if (source.value === 'history-common-sense') {
    wrongRows.value = listChineseHistoryCommonSenseWrongRecords()
    favoriteRows.value = listChineseHistoryCommonSenseFavoriteRecords()
  } else if (source.value === 'party-history') {
    wrongRows.value = listChinesePartyHistoryWrongRecords()
    favoriteRows.value = listChinesePartyHistoryFavoriteRecords()
  } else if (source.value === 'theory-policy') {
    wrongRows.value = listChineseTheoryPolicyWrongRecords()
    favoriteRows.value = listChineseTheoryPolicyFavoriteRecords()
  } else if (source.value === 'legal-common-sense') {
    wrongRows.value = listChineseLegalCommonSenseWrongRecords()
    favoriteRows.value = listChineseLegalCommonSenseFavoriteRecords()
  } else if (source.value === 'economy-common-sense') {
    wrongRows.value = listChineseEconomyCommonSenseWrongRecords()
    favoriteRows.value = listChineseEconomyCommonSenseFavoriteRecords()
  } else if (source.value === 'life-common-sense') {
    wrongRows.value = listChineseLifeCommonSenseWrongRecords()
    favoriteRows.value = listChineseLifeCommonSenseFavoriteRecords()
  } else if (source.value === 'geography-common-sense') {
    wrongRows.value = listChineseGeographyCommonSenseWrongRecords()
    favoriteRows.value = listChineseGeographyCommonSenseFavoriteRecords()
  } else {
    wrongRows.value = []
    favoriteRows.value = []
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

function closeDetailDialog() {
  detailDialogVisible.value = false
}

function onDetailDialogClosed() {
  expandedFingerprint.value = null
  noteDraft.value = ''
  noteEditing.value = false
}

function toggleRowDetail(fp: string) {
  if (isReadingSource(source.value)) {
    if (detailDialogVisible.value && expandedFingerprint.value === fp) {
      closeDetailDialog()
      return
    }
    expandedFingerprint.value = fp
    noteDraft.value = getKeyQuestionNote(source.value, fp)
    noteEditing.value = false
    detailDialogVisible.value = true
    return
  }
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

function onPreviewSaveNote(fp: string, note: string) {
  setKeyQuestionNote(source.value, fp, note)
  ElMessage.success(note.trim() ? '备注已保存' : '已清空备注')
}

function selectAll() {
  selected.value = new Set(activeRows.value.map((r) => r.fingerprint))
}

function buildOriginalQuestions(rows: StoredRow[]): KeyPracticePayload['questions'] {
  const readingMode = readingSubModeFromKeySource(source.value)
  if (source.value === 'idiom-memorization') {
    return rows.map((r, i) => storedToQuestion(r as StoredIdiomRecord | StoredFavoriteRecord, i + 1))
  }
  if (source.value === 'word-memorization') {
    return rows.map((r, i) =>
      storedWordMemorizationToQuestion(
        r as StoredWordMemorizationRecord | StoredWordMemorizationFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'char-literacy') {
    return rows.map((r, i) =>
      storedCharLiteracyToQuestion(r as StoredCharLiteracyRecord | StoredCharLiteracyFavoriteRecord, i + 1),
    )
  }
  if (source.value === 'poetry-practice') {
    return rows.map((r, i) =>
      storedPoetryToQuestion(r as StoredPoetryRecord | StoredPoetryFavoriteRecord, i + 1),
    )
  }
  if (source.value === 'classical-chinese') {
    return rows.map((r, i) =>
      storedClassicalChineseToQuestion(
        r as StoredClassicalChineseRecord | StoredClassicalChineseFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'rhetoric-usage') {
    return rows.map((r, i) =>
      storedRhetoricUsageToQuestion(
        r as StoredRhetoricUsageRecord | StoredRhetoricUsageFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (readingMode) {
    return rows.map((r, i) =>
      storedReadingComprehensionToQuestion(
        r as StoredReadingComprehensionRecord | StoredReadingComprehensionFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'history-common-sense') {
    return rows.map((r, i) =>
      storedHistoryCommonSenseToQuestion(
        r as StoredHistoryCommonSenseRecord | StoredHistoryCommonSenseFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'party-history') {
    return rows.map((r, i) =>
      storedPartyHistoryToQuestion(r as StoredPartyHistoryRecord | StoredPartyHistoryFavoriteRecord, i + 1),
    )
  }
  if (source.value === 'theory-policy') {
    return rows.map((r, i) =>
      storedTheoryPolicyToQuestion(
        r as StoredTheoryPolicyRecord | StoredTheoryPolicyFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'legal-common-sense') {
    return rows.map((r, i) =>
      storedLegalCommonSenseToQuestion(
        r as StoredLegalCommonSenseRecord | StoredLegalCommonSenseFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'economy-common-sense') {
    return rows.map((r, i) =>
      storedEconomyCommonSenseToQuestion(
        r as StoredEconomyCommonSenseRecord | StoredEconomyCommonSenseFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'life-common-sense') {
    return rows.map((r, i) =>
      storedLifeCommonSenseToQuestion(
        r as StoredLifeCommonSenseRecord | StoredLifeCommonSenseFavoriteRecord,
        i + 1,
      ),
    )
  }
  if (source.value === 'geography-common-sense') {
    return rows.map((r, i) =>
      storedGeographyCommonSenseToQuestion(
        r as StoredGeographyCommonSenseRecord | StoredGeographyCommonSenseFavoriteRecord,
        i + 1,
      ),
    )
  }
  return []
}

async function onPractice() {
  const fps = selected.value
  const rows = activeRows.value.filter((r) => fps.has(r.fingerprint))
  if (!rows.length) {
    ElMessage.warning('请先勾选题目')
    return
  }
  const originals = buildOriginalQuestions(rows)
  const originFingerprints = originals.map((q) => q.fingerprint)
  let questions: KeyPracticePayload['questions'] = originals
  if (isAiChatConfigured()) {
    variantLoading.value = true
    variantProgress.value = '正在准备变式题…'
    try {
      const built = await buildKeyPracticeQuestionsWithVariants(
        source.value,
        originals,
        (msg) => {
          variantProgress.value = msg
        },
      )
      questions = built.questions as KeyPracticePayload['questions']
      const variantCount = questions.filter((q, i) => q.fingerprint !== originals[i]?.fingerprint)
        .length
      if (variantCount > 0) {
        ElMessage.success(`已生成 ${variantCount}/${originals.length} 道变式，失败题已用原题`)
      } else {
        ElMessage.info('变式生成未成功，已使用原题练习')
      }
    } catch {
      questions = originals
      ElMessage.warning('变式生成失败，已切换为原题')
    } finally {
      variantLoading.value = false
      variantProgress.value = ''
    }
  }
  emit('practice', {
    source: source.value,
    questions,
    keyReview: {
      source: source.value,
      bank: keyTab.value,
      originFingerprints,
    },
  } as KeyPracticePayload)
}

async function onRemove(fp: string) {
  try {
    await ElMessageBox.confirm(
      keyTab.value === 'wrong' ? '确定从错题中删除这道题？' : '确定从收藏中删除这道题？',
      '删除题目',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  const wasPreview = previewOpen.value
  const idx = activeRows.value.findIndex((r) => r.fingerprint === fp)
  const readingMode = readingSubModeFromKeySource(source.value)
  if (source.value === 'idiom-memorization') {
    if (keyTab.value === 'wrong') removeChineseWrong(fp)
    else removeChineseFavorite(fp)
  } else if (source.value === 'word-memorization') {
    if (keyTab.value === 'wrong') removeChineseWordMemorizationWrong(fp)
    else removeChineseWordMemorizationFavorite(fp)
  } else if (source.value === 'char-literacy') {
    if (keyTab.value === 'wrong') removeChineseCharLiteracyWrong(fp)
    else removeChineseCharLiteracyFavorite(fp)
  } else if (source.value === 'poetry-practice') {
    if (keyTab.value === 'wrong') removeChinesePoetryWrong(fp)
    else removeChinesePoetryFavorite(fp)
  } else if (source.value === 'classical-chinese') {
    if (keyTab.value === 'wrong') removeChineseClassicalChineseWrong(fp)
    else removeChineseClassicalChineseFavorite(fp)
  } else if (source.value === 'rhetoric-usage') {
    if (keyTab.value === 'wrong') removeChineseRhetoricUsageWrong(fp)
    else removeChineseRhetoricUsageFavorite(fp)
  } else if (readingMode) {
    if (keyTab.value === 'wrong') removeChineseReadingComprehensionWrong(fp)
    else removeChineseReadingComprehensionFavorite(fp)
  } else if (source.value === 'history-common-sense') {
    if (keyTab.value === 'wrong') removeChineseHistoryCommonSenseWrong(fp)
    else removeChineseHistoryCommonSenseFavorite(fp)
  } else if (source.value === 'party-history') {
    if (keyTab.value === 'wrong') removeChinesePartyHistoryWrong(fp)
    else removeChinesePartyHistoryFavorite(fp)
  } else if (source.value === 'theory-policy') {
    if (keyTab.value === 'wrong') removeChineseTheoryPolicyWrong(fp)
    else removeChineseTheoryPolicyFavorite(fp)
  } else if (source.value === 'legal-common-sense') {
    if (keyTab.value === 'wrong') removeChineseLegalCommonSenseWrong(fp)
    else removeChineseLegalCommonSenseFavorite(fp)
  } else if (source.value === 'economy-common-sense') {
    if (keyTab.value === 'wrong') removeChineseEconomyCommonSenseWrong(fp)
    else removeChineseEconomyCommonSenseFavorite(fp)
  } else if (source.value === 'life-common-sense') {
    if (keyTab.value === 'wrong') removeChineseLifeCommonSenseWrong(fp)
    else removeChineseLifeCommonSenseFavorite(fp)
  } else if (source.value === 'geography-common-sense') {
    if (keyTab.value === 'wrong') removeChineseGeographyCommonSenseWrong(fp)
    else removeChineseGeographyCommonSenseFavorite(fp)
  }
  // 清备注（指纹级）
  setKeyQuestionNote(source.value, fp, '')
  selected.value.delete(fp)
  if (expandedFingerprint.value === fp) {
    detailDialogVisible.value = false
    expandedFingerprint.value = null
  }
  refresh()
  if (wasPreview) {
    const left = activeRows.value.length
    if (!left) previewOpen.value = false
    else if (idx >= 0) previewIndex.value = Math.min(idx, left - 1)
  }
  ElMessage.success('已删除')
}

onMounted(refresh)

watch(chinesePracticeDataTick, () => {
  refresh()
})

watch(source, () => {
  detailDialogVisible.value = false
  expandedFingerprint.value = null
  noteDraft.value = ''
  noteEditing.value = false
  previewOpen.value = false
  previewIndex.value = 0
  keyTab.value = 'wrong'
  refresh()
})

watch(keyTab, () => {
  detailDialogVisible.value = false
  expandedFingerprint.value = null
  noteDraft.value = ''
  noteEditing.value = false
  previewOpen.value = false
  previewIndex.value = 0
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
      汇总各练习模块的错题与收藏；默认全选，点击词条可查看详情。阅读理解题目会在大弹窗中展示原文与解析。数据保存在本浏览器本地。
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
      <div class="chinese-key__tabs-actions">
        <el-button
          size="small"
          plain
          type="primary"
          :disabled="!activeRows.length"
          @click="openPreview()"
        >
          预览
        </el-button>
        <el-button size="small" plain :loading="loading" @click="refresh">刷新</el-button>
      </div>
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
          <p
            class="chinese-key__stem"
            :class="{ 'chinese-key__stem--clamp': isReadingSource(source) }"
          >
            {{ row.stem }}
          </p>
          <p class="chinese-key__meta">
            {{ typeLabel(row) }}
            <template v-if="keyTab === 'wrong' && 'wrongCount' in row">
              · 错 {{ row.wrongCount }} 次
            </template>
            <template v-if="rowNote(row.fingerprint)"> · 有备注</template>
            <span class="chinese-key__hint">
              · {{ isReadingSource(source) ? '点击打开详情' : '点击查看详情' }}
            </span>
          </p>
          <div
            v-if="!isReadingSource(source) && expandedFingerprint === row.fingerprint"
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
              v-if="isVocabSource(source) && row.questionType === 'word-to-meaning'"
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

    <el-dialog
      v-model="detailDialogVisible"
      class="chinese-key-detail-dialog"
      :title="detailRow ? `${typeLabel(detailRow)} · ${detailRow.term}` : '题目详情'"
      width="860px"
      top="4vh"
      align-center
      destroy-on-close
      append-to-body
      @closed="onDetailDialogClosed"
    >
      <div v-if="detailRow" class="chinese-key-dialog">
        <section class="chinese-key-dialog__block">
          <h4 class="chinese-key-dialog__label">设问</h4>
          <p class="chinese-key-dialog__text">{{ detailRow.stem }}</p>
        </section>
        <section v-if="rowPassage(detailRow)" class="chinese-key-dialog__block">
          <h4 class="chinese-key-dialog__label">阅读原文</h4>
          <div class="chinese-key-dialog__passage">{{ rowPassage(detailRow) }}</div>
        </section>
        <section class="chinese-key-dialog__block">
          <h4 class="chinese-key-dialog__label">选项</h4>
          <ul class="chinese-key-dialog__options">
            <li
              v-for="(opt, idx) in detailRow.options"
              :key="idx"
              class="chinese-key-dialog__option"
              :class="{ 'is-correct': idx === detailRow.correctIndex }"
            >
              <span class="chinese-key-dialog__opt-key">{{
                String.fromCharCode(65 + idx)
              }}</span>
              <span>{{ opt }}</span>
              <span v-if="idx === detailRow.correctIndex" class="chinese-key-dialog__badge"
                >正确</span
              >
            </li>
          </ul>
        </section>
        <section v-if="detailRow.explanation" class="chinese-key-dialog__block">
          <h4 class="chinese-key-dialog__label">解析</h4>
          <p class="chinese-key-dialog__text">{{ detailRow.explanation }}</p>
        </section>
        <section class="chinese-key-dialog__block chinese-key-dialog__note">
          <div class="chinese-key__note-head">
            <h4 class="chinese-key-dialog__label">备注</h4>
            <el-button
              v-if="!noteEditing"
              size="small"
              text
              type="primary"
              @click="onEditNote(detailRow.fingerprint)"
            >
              {{ rowNote(detailRow.fingerprint) ? '编辑' : '添加备注' }}
            </el-button>
          </div>
          <template v-if="noteEditing">
            <el-input
              v-model="noteDraft"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="支持 Markdown，如标题、列表、加粗等"
            />
            <div class="chinese-key__note-actions">
              <el-button
                size="small"
                type="primary"
                :loading="noteSaving"
                @click="onSaveNote(detailRow.fingerprint)"
              >
                保存
              </el-button>
              <el-button size="small" plain @click="onCancelNoteEdit(detailRow.fingerprint)">
                取消
              </el-button>
            </div>
          </template>
          <template v-else-if="rowNote(detailRow.fingerprint)">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="chinese-key__note-md deepseek-md"
              v-html="noteHtml(detailRow.fingerprint)"
            />
          </template>
          <p v-else class="chinese-key__note-empty">暂无备注</p>
        </section>
      </div>
      <template #footer>
        <el-button
          v-if="detailRow"
          type="primary"
          plain
          @click="detailRow && openPreview(detailRow.fingerprint)"
        >
          预览
        </el-button>
        <el-button
          v-if="detailRow"
          type="danger"
          plain
          @click="detailRow && onRemove(detailRow.fingerprint)"
        >
          删除本题
        </el-button>
        <el-button @click="closeDetailDialog">关闭</el-button>
      </template>
    </el-dialog>

    <WrongBookImmersivePreview
      v-model:open="previewOpen"
      v-model:index="previewIndex"
      :title="previewTitle"
      :items="previewItems"
      @save-note="onPreviewSaveNote"
      @delete="onRemove"
    />

    <div v-if="activeRows.length" class="chinese-key__actions">
      <el-button
        type="primary"
        :disabled="selected.size === 0 || variantLoading"
        :loading="variantLoading"
        @click="onPractice"
      >
        练习所选（{{ selected.size }} 题）
      </el-button>
      <p v-if="variantProgress" class="chinese-key__variant-progress">{{ variantProgress }}</p>
      <p class="chinese-key__variant-hint">
        变式测验：答错不进错题本；答对后可删除对应的错题/收藏原题。
      </p>
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

.chinese-key__tabs-actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

.chinese-key__stem--clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  white-space: normal;
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
  align-items: center;
}

.chinese-key__variant-progress {
  margin: 0;
  width: 100%;
  font-size: 13px;
  color: var(--app-text-muted);
}

.chinese-key__variant-hint {
  margin: 0;
  width: 100%;
  font-size: 12px;
  color: var(--app-text-muted);
}

.chinese-key-dialog {
  display: grid;
  gap: 16px;
  max-height: min(72vh, 760px);
  overflow-y: auto;
  padding-right: 4px;
}

.chinese-key-dialog__block {
  margin: 0;
}

.chinese-key-dialog__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.chinese-key-dialog__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-line;
  word-break: break-word;
}

.chinese-key-dialog__passage {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--app-border-soft);
  background: var(--app-surface-alt);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
  word-break: break-word;
}

.chinese-key-dialog__options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.chinese-key-dialog__option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--app-border-soft);
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}

.chinese-key-dialog__option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 55%, transparent);
}

.chinese-key-dialog__opt-key {
  flex: 0 0 auto;
  width: 1.4em;
  font-weight: 700;
  color: var(--app-text-muted);
}

.chinese-key-dialog__badge {
  margin-left: auto;
  flex: 0 0 auto;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success);
}

.chinese-key-dialog__note {
  padding-top: 4px;
  border-top: 1px dashed var(--app-border-soft);
}

@media (max-width: 640px) {
  .chinese-key__sources,
  .chinese-key__tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 6px;
  }

  .chinese-key__sources::-webkit-scrollbar,
  .chinese-key__tabs::-webkit-scrollbar {
    display: none;
  }

  .chinese-key__source,
  .chinese-key__tab {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .chinese-key__list {
    max-height: min(52vh, 420px);
  }
}
</style>

<style>
/* append-to-body 弹窗，需非 scoped */
.chinese-key-detail-dialog.el-dialog {
  max-width: 96vw;
}

.chinese-key-detail-dialog .el-dialog__body {
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
