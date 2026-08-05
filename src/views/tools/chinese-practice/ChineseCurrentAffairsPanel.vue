<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  articlesForPeriodCategory,
  CURRENT_AFFAIRS_CATEGORIES,
  CURRENT_AFFAIRS_PERIODS,
} from '@/data/currentAffairs/bank'
import { useChineseCurrentAffairsDrillTest } from '@/composables/useChineseCurrentAffairsDrillTest'
import { isAiChatConfigured } from '@/services/deepseek'
import {
  currentAffairsDrillQuestionTypeLabel,
  normalizeOrderOption,
  type CurrentAffairsDrillMode,
} from '@/utils/currentAffairsDrillPractice'
import {
  currentAffairsStarsText,
  parseCurrentAffairsBoldParts,
  type CurrentAffairsArticle,
  type CurrentAffairsCategoryId,
  type CurrentAffairsPeriodId,
} from '@/utils/currentAffairsTypes'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'
import SentenceOrderBoard from '@/views/tools/chinese-practice/SentenceOrderBoard.vue'
import type { ChineseCurrentAffairsDrillResultRow } from '@/composables/useChineseCurrentAffairsDrillTest'

const emit = defineEmits<{ (e: 'back'): void }>()

type CaScreen = 'browse' | 'quiz'

const screen = ref<CaScreen>('browse')
const activePeriod = ref<CurrentAffairsPeriodId>('oct-early')
const activeCategory = ref<CurrentAffairsCategoryId>('politics')
const activeArticleId = ref<string | null>(null)
const regenerating = ref(false)
const detailVisible = ref(false)
const detailRow = ref<ChineseCurrentAffairsDrillResultRow | null>(null)

const test = useChineseCurrentAffairsDrillTest()

const articles = computed(() =>
  articlesForPeriodCategory(activePeriod.value, activeCategory.value),
)

const activeArticle = computed<CurrentAffairsArticle | null>(() => {
  const list = articles.value
  if (!list.length) return null
  const hit = list.find((a) => a.id === activeArticleId.value)
  return hit ?? list[0]!
})

const canStartDrill = computed(() => articles.value.length > 0)

function selectPeriod(id: CurrentAffairsPeriodId) {
  activePeriod.value = id
  activeArticleId.value = null
}

function selectCategory(id: CurrentAffairsCategoryId) {
  activeCategory.value = id
  activeArticleId.value = null
}

function selectArticle(id: string) {
  activeArticleId.value = id
}

/** 条目胶囊短标题，避免横向导航被长文题挤爆 */
function shortArticleLabel(title: string): string {
  const t = String(title ?? '').trim()
  if (t.length <= 10) return t
  return `${t.slice(0, 9)}…`
}

function backToModulePick() {
  if (test.phase === 'loading' || test.phase === 'running') return
  test.resetToIdle()
  emit('back')
}

function backToBrowse() {
  detailVisible.value = false
  detailRow.value = null
  test.resetToIdle()
  screen.value = 'browse'
}

async function onStartDrill(mode: CurrentAffairsDrillMode = 'cloze') {
  if (!canStartDrill.value) return
  if (!isAiChatConfigured()) return
  screen.value = 'quiz'
  const ok = await test.startDrillFor(activePeriod.value, activeCategory.value, mode)
  if (!ok && test.phase === 'idle' && !test.questions.length) {
    screen.value = 'browse'
  }
}

async function onRegenerate() {
  regenerating.value = true
  try {
    await test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

function openResultDetail(row: ChineseCurrentAffairsDrillResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeResultDetail() {
  detailVisible.value = false
  detailRow.value = null
}

const isOrderQuestion = computed(
  () => test.currentQuestion?.questionType === 'sentence-order',
)

function parseOrderLabels(raw: string | undefined | null): number[] | null {
  const n = normalizeOrderOption(String(raw ?? ''))
  if (!n) return null
  return n.split('、').map(Number)
}

const revealCorrectOrderLabels = computed(() => {
  if (!test.submitted || !isOrderQuestion.value || !test.currentQuestion) return null
  return parseOrderLabels(test.currentQuestion.options[test.currentQuestion.correctIndex])
})

function onKeydown(e: KeyboardEvent) {
  if (screen.value !== 'quiz' || test.phase !== 'running' || test.submitted) return
  if (isOrderQuestion.value) return
  const n = Number(e.key)
  if (n >= 1 && n <= 4) {
    e.preventDefault()
    test.selectOption(n - 1)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section
    v-if="screen === 'quiz'"
    class="ca-panel ca-panel--quiz"
    aria-label="时政测试"
  >
    <div class="ca-drill">
      <template v-if="test.phase === 'loading' || (test.phase === 'idle' && !test.questions.length)">
        <p class="ca-drill__hint">
          <template v-if="test.drillMode === 'sentence-fill'">
            根据「{{ test.scopeLabel }}」材料 AI 出 {{ test.questionCount }} 道语句填充：挖 ≥12
            字半句；干扰项多处改写、官方语感；本批考点不重复。
          </template>
          <template v-else-if="test.drillMode === 'sentence-order'">
            根据「{{ test.scopeLabel }}」材料 AI 出 {{ test.questionCount }} 道语句排序：拆成
            5 段完整句子（须句末标点），拖动或点击交换排序后确认；本批语段不重复。
          </template>
          <template v-else>
            根据「{{ test.scopeLabel || `${CURRENT_AFFAIRS_PERIODS.find((p) => p.id === activePeriod)?.title ?? ''}·${activeCategory === 'politics' ? '政治' : '社会'}` }}」材料
            AI 出 {{ test.questionCount }} 道挖空四选一：加粗重点与通读考点约 4:1；选项等长强干扰；本批考点不重复。
          </template>
        </p>
        <p class="practice-completion-line">
          <PracticeCompletionStat :mode-id="test.completionModeId" />
        </p>
        <p v-if="test.phase === 'loading'" class="ca-drill__loading">{{ test.loadingMessage }}</p>
        <div v-else class="ca-drill__actions">
          <el-button @click="backToBrowse">返回速览</el-button>
        </div>
      </template>

      <template v-else-if="test.phase === 'running'">
        <div class="chinese-quiz__top">
          <span>第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题</span>
          <span v-if="test.scopeLabel" class="chinese-quiz__badge chinese-quiz__badge--new">
            {{ test.scopeLabel }} · {{ test.modeLabel }}
          </span>
          <span v-if="test.currentQuestion">
            {{ currentAffairsDrillQuestionTypeLabel(test.currentQuestion.questionType) }}
          </span>
          <span class="chinese-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
            {{ test.quizRunningElapsedText }}
          </span>
          <div class="chinese-quiz__actions-top">
            <el-button size="small" plain @click="backToBrowse">返回</el-button>
          </div>
        </div>

        <div v-if="test.currentQuestion" class="chinese-quiz__stem">
          <p class="chinese-quiz__term ca-drill__source">
            出处：{{ test.currentQuestion.sourceTitle }}
          </p>
          <p class="chinese-quiz__question">{{ test.currentQuestion.stem }}</p>
          <SentenceOrderBoard
            v-if="
              test.currentQuestion.questionType === 'sentence-order' &&
              test.currentQuestion.segments?.length
            "
            :segments="test.currentQuestion.segments"
            :model-value="test.orderArrangement"
            :disabled="test.submitted"
            :reveal-correct-order="revealCorrectOrderLabels"
            @update:model-value="test.setOrderArrangement($event)"
          />
        </div>

        <div
          v-if="
            test.currentQuestion &&
            test.currentQuestion.questionType !== 'sentence-order'
          "
          class="chinese-quiz__options"
        >
          <button
            v-for="(opt, idx) in test.currentQuestion.options"
            :key="idx"
            type="button"
            class="chinese-option"
            :class="{
              'is-selected': test.selectedIndex === idx,
              'is-correct': test.submitted && idx === test.currentQuestion!.correctIndex,
              'is-wrong':
                test.submitted &&
                test.selectedIndex === idx &&
                idx !== test.currentQuestion!.correctIndex,
            }"
            :disabled="test.submitted"
            @click="test.selectOption(Number(idx))"
          >
            <span class="chinese-option__key">{{ Number(idx) + 1 }}</span>
            <span class="chinese-option__val">{{ opt }}</span>
          </button>
        </div>

        <div v-if="test.submitted && test.currentQuestion" class="chinese-quiz__feedback">
          <p
            :class="
              test.results[test.results.length - 1]?.correct
                ? 'feedback feedback--ok'
                : 'feedback feedback--bad'
            "
          >
            <template v-if="test.results[test.results.length - 1]?.correct">
              回答正确
            </template>
            <template v-else>
              回答错误 · 正确答案：{{
                test.currentQuestion.options[test.currentQuestion.correctIndex]
              }}
            </template>
          </p>
          <p v-if="test.currentQuestion.explanation" class="chinese-quiz__explain">
            {{ test.currentQuestion.explanation }}
          </p>
        </div>

        <div class="chinese-quiz__actions">
          <el-button
            v-if="!test.submitted"
            type="primary"
            :disabled="
              test.currentQuestion?.questionType === 'sentence-order'
                ? test.orderArrangement.length !== 5
                : test.selectedIndex == null
            "
            @click="test.submitCurrent()"
          >
            {{ test.currentQuestion?.questionType === 'sentence-order' ? '确认' : '提交' }}
          </el-button>
          <el-button v-else type="primary" @click="test.nextQuestion()">
            {{ test.currentIndex >= test.questionCount - 1 ? '查看结果' : '下一题' }}
          </el-button>
        </div>
        <p
          v-if="!test.submitted && test.currentQuestion?.questionType === 'sentence-order'"
          class="hint"
        >
          拖动或点选两段交换顺序，满意后点「确认」
        </p>
        <p
          v-else-if="!test.submitted"
          class="hint"
        >
          键盘按 <kbd>1</kbd>～<kbd>4</kbd> 选择，再点「提交」
        </p>
      </template>

      <template v-else-if="test.phase === 'summary'">
        <h4 class="chinese-summary__title">本轮完成 · {{ test.scopeLabel }}</h4>
        <p class="chinese-summary__stats">
          正确 {{ test.correctCount }} / {{ test.results.length }} 题 ·
          {{ test.quizDurationSummaryText }}
        </p>
        <p class="ca-drill__hint ca-drill__hint--tight">点击条目可查看题目详情</p>
        <ul class="chinese-summary__list">
          <li
            v-for="row in test.results"
            :key="row.unitIndex"
            class="chinese-summary__item"
            :class="row.correct ? 'log-ok' : 'log-bad'"
          >
            <button type="button" class="chinese-summary__item-btn" @click="openResultDetail(row)">
              <span class="chinese-summary__item-main">
                {{ row.unitIndex }}. {{ row.title }} · {{ row.typeLabel }} ·
                {{ row.correct ? '对' : '错' }}
              </span>
              <span class="chinese-summary__item-more">详情</span>
            </button>
          </li>
        </ul>
        <div class="ca-drill__actions">
          <el-button type="primary" :loading="regenerating" @click="onRegenerate">
            再来一轮
          </el-button>
          <el-button @click="backToBrowse">返回速览</el-button>
        </div>

        <el-dialog
          v-model="detailVisible"
          :title="
            detailRow
              ? `第 ${detailRow.unitIndex} 题 · ${detailRow.typeLabel}`
              : '题目详情'
          "
          width="min(520px, 94vw)"
          append-to-body
          @closed="closeResultDetail"
        >
          <div v-if="detailRow" class="ca-drill-detail">
            <p class="ca-drill-detail__source">出处：{{ detailRow.question.sourceTitle }}</p>
            <p class="ca-drill-detail__stem">{{ detailRow.question.stem }}</p>
            <ol
              v-if="detailRow.question.segments?.length"
              class="ca-order-segments ca-order-segments--detail"
            >
              <li
                v-for="(seg, si) in detailRow.question.segments"
                :key="si"
                class="ca-order-segments__item"
              >
                <span class="ca-order-segments__num">{{ Number(si) + 1 }}</span>
                <span class="ca-order-segments__text">{{ seg }}</span>
              </li>
            </ol>
            <p
              v-if="detailRow.question.questionType === 'sentence-order'"
              class="ca-drill-detail__explain"
            >
              正确顺序：{{ detailRow.question.options[detailRow.question.correctIndex] }}
              <template v-if="detailRow.chosenOrder || detailRow.chosenIndex != null">
                · 你的作答：{{
                  detailRow.chosenOrder ||
                  detailRow.question.options[detailRow.chosenIndex!] ||
                  '—'
                }}
              </template>
            </p>
            <ul
              v-else
              class="ca-drill-detail__options"
            >
              <li
                v-for="(opt, idx) in detailRow.question.options"
                :key="idx"
                class="ca-drill-detail__opt"
                :class="{
                  'is-correct': idx === detailRow.question.correctIndex,
                  'is-chosen':
                    detailRow.chosenIndex === idx &&
                    idx !== detailRow.question.correctIndex,
                }"
              >
                <span class="ca-drill-detail__opt-key">{{ Number(idx) + 1 }}</span>
                <span>{{ opt }}</span>
              </li>
            </ul>
            <p v-if="detailRow.question.explanation" class="ca-drill-detail__explain">
              {{ detailRow.question.explanation }}
            </p>
          </div>
        </el-dialog>
      </template>
    </div>
  </section>

  <section v-else class="ca-panel" aria-label="时政模块">
    <header class="ca-panel__chrome">
      <div class="ca-panel__nav-row">
        <button type="button" class="ca-panel__back" @click="backToModulePick">← 选择模块</button>
        <div class="ca-panel__test-group">
          <button
            type="button"
            class="ca-panel__test-btn"
            :class="{ 'is-ready': canStartDrill }"
            :disabled="!canStartDrill || !isAiChatConfigured()"
            title="词语/术语挖空"
            @click="onStartDrill('cloze')"
          >
            测试
          </button>
          <button
            type="button"
            class="ca-panel__test-btn ca-panel__test-btn--ghost"
            :class="{ 'is-ready': canStartDrill }"
            :disabled="!canStartDrill || !isAiChatConfigured()"
            title="长句/半句填充"
            @click="onStartDrill('sentence-fill')"
          >
            填充
          </button>
          <button
            type="button"
            class="ca-panel__test-btn ca-panel__test-btn--ghost"
            :class="{ 'is-ready': canStartDrill }"
            :disabled="!canStartDrill || !isAiChatConfigured()"
            title="段落排序"
            @click="onStartDrill('sentence-order')"
          >
            排序
          </button>
        </div>
      </div>

      <div class="ca-panel__seg" role="tablist" aria-label="时段">
        <button
          v-for="p in CURRENT_AFFAIRS_PERIODS"
          :key="p.id"
          type="button"
          role="tab"
          class="ca-panel__seg-btn"
          :class="{ 'is-active': activePeriod === p.id }"
          :aria-selected="activePeriod === p.id"
          @click="selectPeriod(p.id)"
        >
          {{ p.title }}
        </button>
      </div>

      <div class="ca-panel__seg ca-panel__seg--cat" role="tablist" aria-label="栏目">
        <button
          v-for="c in CURRENT_AFFAIRS_CATEGORIES"
          :key="c.id"
          type="button"
          role="tab"
          class="ca-panel__seg-btn"
          :class="{ 'is-active': activeCategory === c.id }"
          :aria-selected="activeCategory === c.id"
          @click="selectCategory(c.id)"
        >
          {{ c.title }}
          <span class="ca-panel__count">{{
            articlesForPeriodCategory(activePeriod, c.id).length
          }}</span>
        </button>
      </div>

      <nav v-if="articles.length" class="ca-panel__toc" aria-label="条目">
        <button
          v-for="(a, idx) in articles"
          :key="a.id"
          type="button"
          class="ca-panel__toc-item"
          :class="{ 'is-active': activeArticle?.id === a.id }"
          :title="a.title"
          @click="selectArticle(a.id)"
        >
          <span class="ca-panel__toc-idx">{{ idx + 1 }}</span>
          <span class="ca-panel__toc-title">{{ shortArticleLabel(a.title) }}</span>
        </button>
      </nav>
    </header>

    <div v-if="!activeArticle" class="ca-panel__empty-box">
      <p class="ca-panel__empty">该栏目暂无材料。</p>
    </div>

    <div
      v-else
      class="ca-panel__scroll"
      tabindex="0"
      :aria-label="activeArticle.title"
    >
      <article class="ca-article">
        <header class="ca-article__head">
          <div class="ca-article__meta">
            <span class="ca-article__stars">{{ currentAffairsStarsText(activeArticle.stars) }}</span>
            <span class="ca-article__tag">【{{ activeArticle.tag }}】</span>
            <span v-if="activeArticle.date" class="ca-article__date">{{ activeArticle.date }}</span>
          </div>
          <h4 class="ca-article__title">{{ activeArticle.title }}</h4>
        </header>

        <div class="ca-article__body">
          <p v-for="(para, i) in activeArticle.paragraphs" :key="i" class="ca-article__p">
            <template v-for="(part, j) in parseCurrentAffairsBoldParts(para)" :key="j">
              <strong v-if="part.bold">{{ part.text }}</strong>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.ca-panel {
  --ca-ink: #2f3a32;
  --ca-ink-soft: #5a6a5e;
  --ca-muted: #7a8a7e;
  --ca-line: #dce4db;
  --ca-card: #ffffff;
  --ca-paper: #f4f6f2;
  --ca-accent: #5f7f64;
  --ca-accent-deep: #45634b;
  --ca-accent-soft: #e8f0e9;

  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 8px;
  border-radius: 16px;
  background: var(--ca-paper);
  border: 1px solid var(--ca-line);
  color: var(--ca-ink);
  box-sizing: border-box;
}

.ca-panel--quiz {
  overflow: auto;
}

.ca-panel__chrome {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.ca-panel__nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ca-panel__test-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  justify-content: flex-end;
}

.ca-panel__back {
  appearance: none;
  border: none;
  margin: 0;
  padding: 4px 2px;
  background: transparent;
  color: var(--ca-accent-deep);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
}

.ca-panel__test-btn {
  appearance: none;
  border: 1px solid var(--ca-line);
  margin: 0;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--ca-card);
  color: var(--ca-muted);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: not-allowed;
  opacity: 0.65;
}

.ca-panel__test-btn.is-ready:not(:disabled) {
  cursor: pointer;
  opacity: 1;
  color: #f7faf7;
  background: var(--ca-accent-deep);
  border-color: var(--ca-accent-deep);
}

.ca-panel__test-btn--ghost.is-ready:not(:disabled) {
  color: var(--ca-accent-deep);
  background: var(--ca-accent-soft);
  border-color: color-mix(in srgb, var(--ca-accent) 35%, transparent);
}

.ca-panel__seg {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ca-line) 55%, white);
}

.ca-panel__seg--cat {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ca-panel__seg-btn {
  appearance: none;
  border: none;
  margin: 0;
  padding: 7px 4px;
  border-radius: 10px;
  background: transparent;
  color: var(--ca-ink-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.2;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.ca-panel__seg-btn.is-active {
  background: var(--ca-accent-deep);
  color: #f7faf7;
  box-shadow: 0 1px 3px rgba(47, 58, 50, 0.18);
}

.ca-panel__count {
  font-size: 0.68rem;
  font-weight: 700;
  opacity: 0.85;
}

.ca-panel__toc {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 1px 0;
}

.ca-panel__toc::-webkit-scrollbar {
  display: none;
}

.ca-panel__toc-item {
  appearance: none;
  border: none;
  margin: 0;
  padding: 5px 11px;
  border-radius: 999px;
  background: transparent;
  color: var(--ca-ink-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ca-panel__toc-item:hover {
  background: color-mix(in srgb, var(--ca-accent-soft) 80%, transparent);
}

.ca-panel__toc-item.is-active {
  background: var(--ca-accent-soft);
  color: var(--ca-accent-deep);
}

.ca-panel__toc-idx {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ca-accent);
}

.ca-panel__toc-title {
  font-size: 0.78rem;
  max-width: 9.5em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ca-panel__empty-box {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  border-radius: 14px;
  background: var(--ca-card);
  border: 1px dashed var(--ca-line);
}

.ca-panel__empty {
  margin: 0;
  color: var(--ca-ink-soft);
  font-size: 0.88rem;
}

.ca-panel__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 2px 8px;
  border-radius: 12px;
  scrollbar-width: thin;
}

.ca-article {
  padding: 14px 14px 18px;
  border-radius: 14px;
  border: 1px solid var(--ca-line);
  background: var(--ca-card);
}

.ca-article__head {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ca-line);
}

.ca-article__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.75rem;
  color: var(--ca-muted);
}

.ca-article__stars {
  color: #b7791f;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.ca-article__tag {
  font-weight: 700;
  color: var(--ca-accent-deep);
}

.ca-article__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.4;
  color: var(--ca-ink);
}

.ca-article__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ca-article__p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--ca-ink-soft);
  text-align: justify;
}

.ca-article__p strong {
  color: var(--ca-accent-deep);
  font-weight: 800;
}

.ca-drill {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px 12px;
}

.ca-drill__hint {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--ca-ink-soft);
}

.ca-drill__hint--tight {
  font-size: 0.8rem;
  color: var(--ca-muted);
}

.ca-drill__loading {
  margin: 12px 0;
  text-align: center;
  color: var(--ca-accent-deep);
  font-weight: 650;
}

.ca-drill__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.ca-drill__source {
  font-size: 0.82rem !important;
  font-weight: 650 !important;
  color: var(--ca-accent-deep) !important;
}

.ca-drill-detail__source {
  margin: 0 0 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ca-accent-deep);
}

.ca-drill-detail__stem {
  margin: 0 0 14px;
  white-space: pre-line;
  font-size: 1.02rem;
  line-height: 1.55;
  color: var(--ca-ink);
}

.ca-drill-detail__options {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ca-drill-detail__opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--ca-line);
  background: var(--ca-paper);
  font-size: 13px;
  line-height: 1.45;
}

.ca-drill-detail__opt.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.ca-drill-detail__opt.is-chosen {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
}

.ca-drill-detail__opt-key {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--ca-card);
}

.ca-drill-detail__explain {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ca-ink-soft);
}

.chinese-quiz__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--ca-ink);
}

.chinese-quiz__timer.is-paused {
  color: var(--el-color-warning);
}

.chinese-quiz__badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.chinese-quiz__badge--new {
  color: var(--ca-accent-deep);
  background: var(--ca-accent-soft);
  border: 1px solid color-mix(in srgb, var(--ca-accent) 35%, transparent);
}

.chinese-quiz__actions-top {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.chinese-quiz__stem {
  text-align: center;
  margin-bottom: 18px;
}

.chinese-quiz__term {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ca-accent-deep);
}

.chinese-quiz__question {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--ca-ink);
  text-align: left;
}

.ca-order-segments {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.ca-order-segments__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--ca-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--ca-card) 88%, var(--ca-accent-soft));
}

.ca-order-segments__num {
  flex: 0 0 auto;
  min-width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--ca-accent-deep);
  background: var(--ca-accent-soft);
  border: 1px solid color-mix(in srgb, var(--ca-accent) 30%, transparent);
}

.ca-order-segments__text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--ca-ink);
}

.ca-order-segments--detail {
  margin: 10px 0 14px;
}

.chinese-quiz__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.chinese-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--ca-line);
  border-radius: 12px;
  background: var(--ca-card);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ca-ink);
}

.chinese-option:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--ca-accent) 55%, var(--ca-line));
}

.chinese-option.is-selected:not(.is-correct):not(.is-wrong) {
  border-color: var(--ca-accent-deep);
}

.chinese-option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 12%, transparent);
}

.chinese-option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 10%, transparent);
}

.chinese-option:disabled {
  cursor: default;
}

.chinese-option__key {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--ca-paper);
  border: 1px solid var(--ca-line);
  font-size: 12px;
  font-weight: 700;
}

.chinese-quiz__feedback {
  margin-bottom: 12px;
}

.chinese-quiz__explain {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--ca-muted);
  line-height: 1.55;
}

.chinese-quiz__actions {
  display: flex;
  gap: 10px;
}

.chinese-summary__title {
  margin: 0 0 8px;
  color: var(--ca-ink);
}

.chinese-summary__stats {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--ca-ink-soft);
}

.chinese-summary__list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  border: 1px solid var(--ca-line);
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--ca-card);
}

.chinese-summary__item {
  border-bottom: 1px solid var(--ca-line);
  color: var(--ca-ink);
}

.chinese-summary__item:last-child {
  border-bottom: none;
}

.chinese-summary__item.log-ok {
  background: color-mix(in srgb, var(--el-color-success) 8%, transparent);
}

.chinese-summary__item.log-bad {
  background: color-mix(in srgb, var(--el-color-danger) 8%, transparent);
}

.chinese-summary__item-btn {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.chinese-summary__item-more {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 650;
  color: var(--ca-accent-deep);
}

.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--ca-muted);
}

.feedback {
  margin: 0;
  font-weight: 700;
}

.feedback--ok {
  color: var(--el-color-success);
}

.feedback--bad {
  color: var(--el-color-danger);
}

.practice-completion-line {
  margin: 0;
}

@media (max-width: 640px), (display-mode: standalone) {
  .ca-panel {
    max-height: none;
    height: 100%;
    min-height: 0;
    padding: 6px 6px 4px;
    border-radius: 14px;
    gap: 6px;
    border: none;
    background: #eef2ec;
  }

  .ca-panel__chrome {
    gap: 5px;
  }

  .ca-panel__seg {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* 时段很多时横向滚动，避免换行占高 */
  .ca-panel__seg:not(.ca-panel__seg--cat) {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 2px;
  }

  .ca-panel__seg:not(.ca-panel__seg--cat)::-webkit-scrollbar {
    display: none;
  }

  .ca-panel__seg:not(.ca-panel__seg--cat) .ca-panel__seg-btn {
    flex: 0 0 auto;
    min-width: 3.6rem;
    padding: 6px 8px;
    font-size: 0.74rem;
  }

  .ca-panel__seg-btn {
    padding: 6px 2px;
    font-size: 0.76rem;
  }

  .ca-panel__test-btn {
    padding: 4px 9px;
    font-size: 0.72rem;
  }

  .ca-panel__toc-item {
    padding: 4px 10px;
    font-size: 0.76rem;
  }

  .ca-article {
    padding: 11px 12px 14px;
  }

  .ca-article__meta {
    display: none;
  }

  .ca-article__title {
    font-size: 0.9rem;
  }

  .ca-article__p {
    font-size: 0.86rem;
    line-height: 1.65;
  }
}
</style>
