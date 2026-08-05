<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  POET_OVERVIEW_DYNASTIES,
  type PoetOverviewDynastyId,
} from '@/constants/chinese-practice-tabs'
import {
  poetsForDynasty,
  poetsForOtherPeriod,
  poetsForSongPeriod,
  poetsForTangPeriod,
} from '@/data/poetOverview/bank'
import {
  OTHER_CHEAT_SHEET,
  OTHER_GUIDE_GROUPS,
  OTHER_PERIODS,
  otherPeriodOfPoet,
  type OtherPeriodId,
} from '@/data/poetOverview/otherGuide'
import {
  SONG_CHEAT_SHEET,
  SONG_GUIDE_GROUPS,
  SONG_PERIODS,
  SONG_SCHOOL_LINES,
  songPeriodOfPoet,
  type SongPeriodId,
} from '@/data/poetOverview/songGuide'
import {
  TANG_CHEAT_SHEET,
  TANG_GUIDE_GROUPS,
  TANG_PERIODS,
  tangPeriodOfPoet,
  type TangPeriodId,
} from '@/data/poetOverview/tangGuide'
import type { PoetOverviewProfile } from '@/utils/poetOverviewTypes'
import { useChinesePoetDrillTest } from '@/composables/useChinesePoetDrillTest'
import { useDeepseekConversation } from '@/composables/useDeepseekConversation'
import DeepseekChatThread from '@/components/DeepseekChatThread.vue'
import { isAiChatConfigured, requestAssistantMarkdown } from '@/services/deepseek'
import { resolvePoetDrillScope } from '@/utils/poetDrillMaterial'
import {
  poetDrillQuestionTypeLabel,
  shouldShowPoetDrillTermBeforeSubmit,
  type PoetDrillQuestion,
} from '@/utils/poetDrillPractice'
import PracticeCompletionStat from '@/views/tools/mental-math/components/PracticeCompletionStat.vue'
import ChineseCurrentAffairsPanel from '@/views/tools/chinese-practice/ChineseCurrentAffairsPanel.vue'
import MemorizationWrongBookPanel from '@/views/tools/chinese-practice/MemorizationWrongBookPanel.vue'
import type { ChinesePoetDrillResultRow } from '@/composables/useChinesePoetDrillTest'

type PoetViewMode = 'card' | 'compact'
type PoetScreen = 'pick' | 'browse' | 'quiz' | 'current-affairs'

const POET_DRILL_ASSIST_SYSTEM =
  '你是事业编与公务员考试古诗文识记教练，擅长根据应试材料讲解诗句出处、作者背景与分期考点。用简体中文讲解，可结合同类诗人对比与记忆口诀。回答要具体，避免空泛。'

const screen = ref<PoetScreen>('pick')
const activeDynasty = ref<PoetOverviewDynastyId>('tang')
const activeTangPeriod = ref<TangPeriodId>('overview')
const activeSongPeriod = ref<SongPeriodId>('overview')
const activeOtherPeriod = ref<OtherPeriodId>('overview')
const activePoetId = ref<string | null>(null)
const viewMode = ref<PoetViewMode>('card')
const regenerating = ref(false)
const followupInput = ref('')
const detailVisible = ref(false)
const detailRow = ref<ChinesePoetDrillResultRow | null>(null)

const test = useChinesePoetDrillTest()

const assistKey = computed(
  () => `${test.currentIndex}:${test.currentQuestion?.fingerprint ?? 'none'}`,
)

const {
  displayTurns: assistTurns,
  loading: assistLoading,
  error: assistError,
  apiHistory: assistHistory,
  start: startAssist,
  followup: followupAssist,
  reset: resetAssist,
} = useDeepseekConversation({ resetKey: assistKey })

const isRunningOrLoading = computed(
  () => test.phase === 'running' || test.phase === 'loading',
)

defineExpose({ isRunningOrLoading })

const isTang = computed(() => activeDynasty.value === 'tang')
const isSong = computed(() => activeDynasty.value === 'song')
const isOther = computed(() => activeDynasty.value === 'other')

const currentPeriodId = computed(() => {
  if (isTang.value) return activeTangPeriod.value
  if (isSong.value) return activeSongPeriod.value
  return activeOtherPeriod.value
})

const drillScope = computed(() =>
  resolvePoetDrillScope(activeDynasty.value, currentPeriodId.value),
)

const canStartDrill = computed(() => !!drillScope.value)

const showGuideOverview = computed(
  () =>
    (isTang.value && activeTangPeriod.value === 'overview') ||
    (isSong.value && activeSongPeriod.value === 'overview') ||
    (isOther.value && activeOtherPeriod.value === 'overview'),
)

const guideTitle = computed(() => {
  if (isTang.value) return '唐朝诗人应试总览'
  if (isSong.value) return '宋代文人应试总览'
  return '先秦至清文人应试总览'
})

const guideCheatSheet = computed(() => {
  if (isTang.value) return TANG_CHEAT_SHEET
  if (isSong.value) return SONG_CHEAT_SHEET
  return OTHER_CHEAT_SHEET
})

const guideSchoolLines = computed(() => (isSong.value ? SONG_SCHOOL_LINES : null))

const guideGroups = computed(() => {
  if (isTang.value) return TANG_GUIDE_GROUPS
  if (isSong.value) return SONG_GUIDE_GROUPS
  return OTHER_GUIDE_GROUPS
})

const poets = computed(() => {
  if (activeDynasty.value === 'tang') {
    if (activeTangPeriod.value === 'overview') return []
    return poetsForTangPeriod(activeTangPeriod.value)
  }
  if (activeDynasty.value === 'song') {
    if (activeSongPeriod.value === 'overview') return []
    return poetsForSongPeriod(activeSongPeriod.value)
  }
  if (activeDynasty.value === 'other') {
    if (activeOtherPeriod.value === 'overview') return []
    return poetsForOtherPeriod(activeOtherPeriod.value)
  }
  return poetsForDynasty(activeDynasty.value)
})

const activePoet = computed<PoetOverviewProfile | null>(() => {
  const list = poets.value
  if (!list.length) return null
  const hit = list.find((p) => p.id === activePoetId.value)
  return hit ?? list[0] ?? null
})

watch(
  poets,
  (list) => {
    if (!list.length) {
      activePoetId.value = null
      return
    }
    if (!list.some((p) => p.id === activePoetId.value)) {
      activePoetId.value = list[0]!.id
    }
  },
  { immediate: true },
)

function selectDynasty(id: PoetOverviewDynastyId) {
  activeDynasty.value = id
  if (id === 'tang') activeTangPeriod.value = 'overview'
  if (id === 'song') activeSongPeriod.value = 'overview'
  if (id === 'other') activeOtherPeriod.value = 'overview'
}

function selectTangPeriod(id: TangPeriodId) {
  activeTangPeriod.value = id
}

function selectSongPeriod(id: SongPeriodId) {
  activeSongPeriod.value = id
}

function selectOtherPeriod(id: OtherPeriodId) {
  activeOtherPeriod.value = id
}

function selectGuidePeriod(period: string) {
  if (isTang.value) selectTangPeriod(period as TangPeriodId)
  else if (isSong.value) selectSongPeriod(period as SongPeriodId)
  else if (isOther.value) selectOtherPeriod(period as OtherPeriodId)
}

function selectPoet(id: string) {
  activePoetId.value = id
}

function openPoetFromGuide(poetId: string) {
  if (isTang.value) {
    const period = tangPeriodOfPoet(poetId)
    if (!period) return
    activeTangPeriod.value = period
    activePoetId.value = poetId
    return
  }
  if (isSong.value) {
    const period = songPeriodOfPoet(poetId)
    if (!period) return
    activeSongPeriod.value = period
    activePoetId.value = poetId
    return
  }
  if (isOther.value) {
    const period = otherPeriodOfPoet(poetId)
    if (!period) return
    activeOtherPeriod.value = period
    activePoetId.value = poetId
  }
}

function setViewMode(mode: PoetViewMode) {
  viewMode.value = mode
}

function enterPoetryModule() {
  screen.value = 'browse'
}

function enterCurrentAffairsModule() {
  screen.value = 'current-affairs'
}

function backToPick() {
  if (isRunningOrLoading.value) return
  test.resetToIdle()
  screen.value = 'pick'
}

function backToBrowse() {
  detailVisible.value = false
  detailRow.value = null
  test.resetToIdle()
  screen.value = 'browse'
}

function openResultDetail(row: ChinesePoetDrillResultRow) {
  detailRow.value = row
  detailVisible.value = true
}

function closeResultDetail() {
  detailVisible.value = false
  detailRow.value = null
}

async function onStartDrill() {
  if (!drillScope.value) return
  screen.value = 'quiz'
  const ok = await test.startDrillFor(activeDynasty.value, currentPeriodId.value)
  if (!ok && test.phase === 'idle' && !test.questions.length) {
    screen.value = 'browse'
  }
}

async function onRegenerate() {
  detailVisible.value = false
  detailRow.value = null
  regenerating.value = true
  try {
    await test.regenerateAndStart()
  } finally {
    regenerating.value = false
  }
}

function buildAssistPrompt(q: PoetDrillQuestion): string {
  const row = test.results[test.results.length - 1]
  const opts = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n')
  const chosen =
    row?.chosenIndex != null ? String(q.options[row.chosenIndex] ?? '') : '（未选）'
  const correct = q.options[q.correctIndex] ?? ''
  return [
    `考查范围：${test.scopeLabel}`,
    `题型：${poetDrillQuestionTypeLabel(q.questionType)}`,
    `标识：${q.term}`,
    `题干：${q.stem}`,
    `选项：\n${opts}`,
    `学员选择：${chosen}`,
    `正确答案：${correct}`,
    `作答结果：${row?.correct ? '正确' : '错误'}`,
    q.explanation ? `题目解析：${q.explanation}` : '',
    '请结合应试材料讲解本题考点、易混项与记忆要点。',
  ]
    .filter(Boolean)
    .join('\n\n')
}

async function runAssistExplain() {
  const q = test.currentQuestion
  if (!q || !test.submitted || !isAiChatConfigured()) return
  const userMsg = buildAssistPrompt(q)
  try {
    await startAssist({
      initialUser: userMsg,
      displayUser: '请讲解本题识记考点',
      system: POET_DRILL_ASSIST_SYSTEM,
      fetch: () =>
        requestAssistantMarkdown({
          system: POET_DRILL_ASSIST_SYSTEM,
          userMessage: userMsg,
        }),
    })
  } catch {
    /* error in assistError */
  }
}

async function onSendFollowup() {
  const msg = followupInput.value.trim()
  if (!msg) return
  try {
    await followupAssist(msg)
    followupInput.value = ''
  } catch {
    /* error in assistError */
  }
}

watch(
  () => [test.submitted, test.currentIndex] as const,
  () => {
    resetAssist()
    followupInput.value = ''
  },
)

function onKeydown(ev: KeyboardEvent) {
  if (screen.value !== 'quiz' || test.phase !== 'running' || test.submitted) return
  const n = Number(ev.key)
  if (Number.isInteger(n) && n >= 1 && n <= 4) {
    ev.preventDefault()
    test.selectOption(n - 1)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function isOverviewPoemTitle(title: string): boolean {
  return /阶段概述/.test(title)
}

function mnemonicParts(line: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), bold: false })
    parts.push({ text: m[1]!, bold: true })
    last = m.index + m[0].length
  }
  if (last < line.length) parts.push({ text: line.slice(last), bold: false })
  return parts.length ? parts : [{ text: line, bold: false }]
}

function poemMetaBits(poem: {
  place?: string
  time?: string
  weather?: string
}): string[] {
  const bits: string[] = []
  if (poem.place) bits.push(poem.place)
  if (poem.time) bits.push(poem.time)
  if (poem.weather) bits.push(poem.weather)
  return bits
}
</script>

<template>
  <section v-if="screen === 'pick'" class="poet-overview poet-overview--pick" aria-label="识记模块">
    <header class="poet-pick__head">
      <h4 class="poet-pick__title">请选择</h4>
      <p class="poet-pick__lead">先选模块进入背诵材料；分期页可按材料开测。</p>
    </header>
    <div class="poet-pick__grid">
      <button type="button" class="poet-pick__card" @click="enterPoetryModule">
        <span class="poet-pick__card-title">诗词模块</span>
        <span class="poet-pick__card-desc">唐 / 宋 / 其他文人应试速览与分期测试</span>
      </button>
      <button type="button" class="poet-pick__card" @click="enterCurrentAffairsModule">
        <span class="poet-pick__card-title">时政模块</span>
        <span class="poet-pick__card-desc">十月上 · 政治 / 社会材料速览与挖空测试</span>
      </button>
    </div>
    <MemorizationWrongBookPanel module="poet-drill" />
    <MemorizationWrongBookPanel module="current-affairs" />
  </section>

  <ChineseCurrentAffairsPanel
    v-else-if="screen === 'current-affairs'"
    @back="backToPick"
  />

  <section
    v-else-if="screen === 'quiz'"
    class="poet-overview poet-overview--quiz"
    aria-label="分期测试"
  >
    <div class="poet-drill">
      <template v-if="test.phase === 'loading' || (test.phase === 'idle' && !test.questions.length)">
        <p class="poet-drill__hint">
          根据「{{ test.scopeLabel || drillScope?.periodLabel || '当前分期' }}」材料 AI 出
          {{ test.questionCount }} 道细致四选一（诗句 / 诗人 / 背景），强干扰项。
        </p>
        <p class="practice-completion-line">
          <PracticeCompletionStat
            :mode-id="
              test.activeScope
                ? `chinese-poet-drill:${test.activeScope.scopeKey}`
                : drillScope
                  ? `chinese-poet-drill:${drillScope.scopeKey}`
                  : 'chinese-poet-drill'
            "
          />
        </p>
        <p v-if="test.phase === 'loading'" class="poet-drill__loading">{{ test.loadingMessage }}</p>
        <div v-else class="poet-drill__actions">
          <el-button @click="backToBrowse">返回速览</el-button>
        </div>
      </template>

      <template v-else-if="test.phase === 'running'">
        <div class="chinese-quiz__top">
          <span>第 {{ test.currentIndex + 1 }} / {{ test.questionCount }} 题</span>
          <span v-if="test.scopeLabel" class="chinese-quiz__badge chinese-quiz__badge--new">
            {{ test.scopeLabel }}
          </span>
          <span v-if="test.currentQuestion">
            {{ poetDrillQuestionTypeLabel(test.currentQuestion.questionType) }}
          </span>
          <span class="chinese-quiz__timer" :class="{ 'is-paused': test.quizTimerPaused }">
            {{ test.quizRunningElapsedText }}
          </span>
          <div class="chinese-quiz__actions-top">
            <el-button size="small" plain @click="backToBrowse">返回</el-button>
          </div>
        </div>

        <div v-if="test.currentQuestion" class="chinese-quiz__stem">
          <p
            v-if="
              test.submitted || shouldShowPoetDrillTermBeforeSubmit(test.currentQuestion)
            "
            class="chinese-quiz__term"
          >
            {{ test.currentQuestion.term }}
          </p>
          <p class="chinese-quiz__question chinese-quiz__poem">{{ test.currentQuestion.stem }}</p>
        </div>

        <div v-if="test.currentQuestion" class="chinese-quiz__options">
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
            {{
              test.results[test.results.length - 1]?.correct
                ? '回答正确'
                : `回答错误 · 正确答案：${test.currentQuestion.options[test.currentQuestion.correctIndex]}`
            }}
          </p>
          <p v-if="test.currentQuestion.explanation" class="chinese-quiz__explain">
            {{ test.currentQuestion.explanation }}
          </p>
        </div>

        <div v-if="test.submitted && test.currentQuestion" class="chinese-quiz__assist">
          <div class="chinese-quiz__assist-head">
            <h5 class="chinese-quiz__assist-title">AI 本题讲解</h5>
            <el-button
              v-if="isAiChatConfigured()"
              size="small"
              plain
              :loading="assistLoading"
              :disabled="assistLoading"
              @click="runAssistExplain"
            >
              {{ assistTurns.length ? '重新讲解' : '生成讲解' }}
            </el-button>
          </div>
          <p v-if="!isAiChatConfigured()" class="chinese-quiz__assist-muted">
            未登录，无法讲解。请到「导览 → 设置」登录后再试。
          </p>
          <template v-else>
            <p
              v-if="!assistTurns.length && !assistLoading"
              class="chinese-quiz__assist-muted"
            >
              需要时再点「生成讲解」，不会自动调用 AI。
            </p>
            <p v-if="assistLoading && !assistTurns.length" class="chinese-quiz__assist-muted">
              正在生成讲解…
            </p>
            <p v-if="assistError" class="chinese-quiz__assist-error">{{ assistError }}</p>
            <DeepseekChatThread :turns="assistTurns" first-assistant-title="讲解" />
            <div v-if="assistHistory.length" class="chinese-quiz__assist-followup">
              <el-input
                v-model="followupInput"
                type="textarea"
                :rows="2"
                placeholder="继续追问，例如：同分期还有哪些易混诗人？"
                @keydown.enter.exact.prevent="onSendFollowup"
              />
              <el-button
                type="primary"
                plain
                :loading="assistLoading"
                :disabled="assistLoading || !followupInput.trim()"
                @click="onSendFollowup"
              >
                发送追问
              </el-button>
            </div>
          </template>
        </div>

        <div class="chinese-quiz__actions">
          <el-button
            v-if="!test.submitted"
            type="primary"
            :disabled="test.selectedIndex == null"
            @click="test.submitCurrent()"
          >
            提交
          </el-button>
          <el-button v-else type="primary" @click="test.nextQuestion()">
            {{ test.currentIndex >= test.questionCount - 1 ? '查看结果' : '下一题' }}
          </el-button>
        </div>
        <p v-if="!test.submitted" class="hint">键盘按 <kbd>1</kbd>～<kbd>4</kbd> 选择，再点「提交」</p>
      </template>

      <template v-else-if="test.phase === 'summary'">
        <h4 class="chinese-summary__title">本轮完成 · {{ test.scopeLabel }}</h4>
        <p class="chinese-summary__stats">
          正确 {{ test.correctCount }} / {{ test.results.length }} 题 ·
          {{ test.quizDurationSummaryText }}
        </p>
        <p class="poet-drill__hint poet-drill__hint--tight">点击条目可查看题目详情</p>
        <ul class="chinese-summary__list">
          <li
            v-for="row in test.results"
            :key="row.unitIndex"
            class="chinese-summary__item"
            :class="row.correct ? 'log-ok' : 'log-bad'"
          >
            <button
              type="button"
              class="chinese-summary__item-btn"
              @click="openResultDetail(row)"
            >
              <span class="chinese-summary__item-main">
                {{ row.unitIndex }}. {{ row.title }} · {{ row.typeLabel }} ·
                {{ row.correct ? '对' : '错' }}
              </span>
              <span class="chinese-summary__item-more">详情</span>
            </button>
          </li>
        </ul>
        <div class="poet-drill__actions">
          <el-button type="primary" :loading="regenerating" @click="onRegenerate">
            再来一轮
          </el-button>
          <el-button @click="backToBrowse">返回速览</el-button>
        </div>

        <el-dialog
          v-model="detailVisible"
          class="poet-drill-detail-dialog"
          :title="
            detailRow
              ? `第 ${detailRow.unitIndex} 题 · ${detailRow.typeLabel}`
              : '题目详情'
          "
          width="min(520px, 94vw)"
          append-to-body
          @closed="closeResultDetail"
        >
          <div v-if="detailRow" class="poet-drill-detail">
            <p class="poet-drill-detail__term">{{ detailRow.question.term }}</p>
            <p class="poet-drill-detail__stem">{{ detailRow.question.stem }}</p>
            <ul class="poet-drill-detail__options">
              <li
                v-for="(opt, idx) in detailRow.question.options"
                :key="idx"
                class="poet-drill-detail__opt"
                :class="{
                  'is-correct': idx === detailRow.question.correctIndex,
                  'is-chosen':
                    detailRow.chosenIndex === idx &&
                    idx !== detailRow.question.correctIndex,
                }"
              >
                <span class="poet-drill-detail__opt-key">{{ Number(idx) + 1 }}</span>
                <span class="poet-drill-detail__opt-val">{{ opt }}</span>
                <span
                  v-if="idx === detailRow.question.correctIndex"
                  class="poet-drill-detail__tag"
                >正确</span>
                <span
                  v-else-if="detailRow.chosenIndex === idx"
                  class="poet-drill-detail__tag poet-drill-detail__tag--wrong"
                >你的选择</span>
              </li>
            </ul>
            <p class="poet-drill-detail__result" :class="detailRow.correct ? 'log-ok' : 'log-bad'">
              {{ detailRow.correct ? '作答正确' : '作答错误' }}
            </p>
            <p v-if="detailRow.question.explanation" class="poet-drill-detail__explain">
              {{ detailRow.question.explanation }}
            </p>
          </div>
        </el-dialog>
      </template>

      <template v-else-if="test.phase === 'idle' && test.questions.length">
        <p class="poet-drill__hint">
          已备好「{{ test.scopeLabel }}」{{ test.questions.length }} 题。
        </p>
        <div class="poet-drill__actions">
          <el-button type="success" @click="test.startQuiz()">开始练习</el-button>
          <el-button @click="backToBrowse">返回速览</el-button>
        </div>
      </template>
    </div>
  </section>

  <section v-else class="poet-overview" aria-label="诗词模块">
    <header class="poet-overview__chrome">
      <div class="poet-overview__nav-row">
        <button type="button" class="poet-overview__back" @click="backToPick">← 选择模块</button>
        <button
          v-if="canStartDrill"
          type="button"
          class="poet-overview__test-btn"
          :disabled="!isAiChatConfigured()"
          @click="onStartDrill"
        >
          测试
        </button>
      </div>
      <div class="poet-overview__seg" role="tablist" aria-label="朝代">
        <button
          v-for="d in POET_OVERVIEW_DYNASTIES"
          :key="d.id"
          type="button"
          role="tab"
          class="poet-overview__seg-btn"
          :class="{ 'is-active': activeDynasty === d.id }"
          :aria-selected="activeDynasty === d.id"
          @click="selectDynasty(d.id)"
        >
          {{ d.title }}
        </button>
      </div>

      <div
        v-if="isTang"
        class="poet-overview__seg poet-overview__seg--period"
        role="tablist"
        aria-label="唐朝分期"
      >
        <button
          v-for="p in TANG_PERIODS"
          :key="p.id"
          type="button"
          role="tab"
          class="poet-overview__seg-btn"
          :class="{ 'is-active': activeTangPeriod === p.id }"
          :aria-selected="activeTangPeriod === p.id"
          @click="selectTangPeriod(p.id)"
        >
          {{ p.title }}
        </button>
      </div>

      <div
        v-if="isSong"
        class="poet-overview__seg poet-overview__seg--period poet-overview__seg--song"
        role="tablist"
        aria-label="宋朝分期"
      >
        <button
          v-for="p in SONG_PERIODS"
          :key="p.id"
          type="button"
          role="tab"
          class="poet-overview__seg-btn"
          :class="{ 'is-active': activeSongPeriod === p.id }"
          :aria-selected="activeSongPeriod === p.id"
          @click="selectSongPeriod(p.id)"
        >
          {{ p.title }}
        </button>
      </div>

      <div
        v-if="isOther"
        class="poet-overview__seg poet-overview__seg--period poet-overview__seg--other"
        role="tablist"
        aria-label="其他分期"
      >
        <button
          v-for="p in OTHER_PERIODS"
          :key="p.id"
          type="button"
          role="tab"
          class="poet-overview__seg-btn"
          :class="{ 'is-active': activeOtherPeriod === p.id }"
          :aria-selected="activeOtherPeriod === p.id"
          @click="selectOtherPeriod(p.id)"
        >
          {{ p.title }}
        </button>
      </div>

      <div v-if="poets.length" class="poet-overview__toolbar">
        <nav class="poet-overview__poets" aria-label="诗人">
          <button
            v-for="p in poets"
            :key="p.id"
            type="button"
            class="poet-overview__poet"
            :class="{ 'is-active': activePoet?.id === p.id }"
            @click="selectPoet(p.id)"
          >
            {{ p.name }}
          </button>
        </nav>
        <div class="poet-overview__modes" role="group" aria-label="排版">
          <button
            type="button"
            class="poet-overview__mode"
            :class="{ 'is-active': viewMode === 'card' }"
            @click="setViewMode('card')"
          >
            卡片
          </button>
          <button
            type="button"
            class="poet-overview__mode"
            :class="{ 'is-active': viewMode === 'compact' }"
            @click="setViewMode('compact')"
          >
            紧凑
          </button>
        </div>
      </div>
    </header>

    <!-- 唐朝 / 其他 · 总览 -->
    <div
      v-if="showGuideOverview"
      class="poet-overview__scroll poet-overview__scroll--guide"
      tabindex="0"
      :aria-label="guideTitle"
    >
      <article class="poet-overview__guide">
        <header class="poet-overview__guide-head">
          <h4 class="poet-overview__headline">{{ guideTitle }}</h4>
          <p class="poet-overview__guide-lead">
            先看分层速记，再点阵营进入分期背诵；点诗人名可直达详解。
          </p>
        </header>

        <section class="poet-overview__cheat">
          <h5 class="poet-overview__stage-title">应试分层速记</h5>
          <ul class="poet-overview__cheat-list">
            <li v-for="(line, i) in guideCheatSheet" :key="i">{{ line }}</li>
          </ul>
        </section>

        <section v-if="guideSchoolLines" class="poet-overview__cheat">
          <h5 class="poet-overview__stage-title">四大文学流派（做题速对）</h5>
          <ul class="poet-overview__cheat-list">
            <li v-for="(line, i) in guideSchoolLines" :key="i">{{ line }}</li>
          </ul>
        </section>

        <section
          v-for="group in guideGroups"
          :key="group.id"
          class="poet-overview__guide-group"
        >
          <button
            type="button"
            class="poet-overview__guide-group-title"
            @click="selectGuidePeriod(group.period)"
          >
            {{ group.title }}
          </button>
          <p v-if="group.common" class="poet-overview__guide-common">
            {{ group.common }}
          </p>
          <div class="poet-overview__guide-poets">
            <button
              v-for="brief in group.poets"
              :key="brief.poetId"
              type="button"
              class="poet-overview__guide-card"
              @click="openPoetFromGuide(brief.poetId)"
            >
              <div class="poet-overview__guide-card-head">
                <span class="poet-overview__guide-name">{{ brief.name }}</span>
                <span v-if="brief.badge" class="poet-overview__guide-badge">{{
                  brief.badge
                }}</span>
              </div>
              <p v-if="brief.blurb" class="poet-overview__guide-blurb">{{ brief.blurb }}</p>
              <p v-if="brief.life" class="poet-overview__guide-meta">
                <em>脉络</em>{{ brief.life }}
              </p>
              <p v-if="brief.works" class="poet-overview__guide-meta">
                <em>篇目</em>{{ brief.works }}
              </p>
              <p v-if="brief.exam" class="poet-overview__guide-meta">
                <em>考点</em>{{ brief.exam }}
              </p>
            </button>
          </div>
        </section>
      </article>
    </div>

    <div v-else-if="!poets.length" class="poet-overview__empty-box">
      <p class="poet-overview__empty">
        「{{ POET_OVERVIEW_DYNASTIES.find((d) => d.id === activeDynasty)?.title }}」内容待录入。
      </p>
    </div>

    <div
      v-else-if="activePoet"
      class="poet-overview__scroll"
      :class="`poet-overview__scroll--${viewMode}`"
      tabindex="0"
      :aria-label="`${activePoet.name}背诵内容`"
    >
      <article class="poet-overview__profile">
        <h4 class="poet-overview__headline">{{ activePoet.headline }}</h4>

        <section
          v-for="(stage, si) in activePoet.stages"
          :key="`${activePoet.id}-s${si}`"
          class="poet-overview__stage"
        >
          <h5 class="poet-overview__stage-title">{{ stage.title }}</h5>
          <div
            v-for="(poem, pi) in stage.poems"
            :key="`${activePoet.id}-s${si}-p${pi}`"
            class="poet-overview__poem"
            :class="{ 'is-overview': isOverviewPoemTitle(poem.title) }"
          >
            <p
              v-if="!isOverviewPoemTitle(poem.title)"
              class="poet-overview__poem-title"
            >
              {{ poem.title }}
            </p>
            <p
              v-else
              class="poet-overview__poem-title poet-overview__poem-title--soft"
            >
              阶段概述
            </p>
            <p v-for="(line, li) in poem.lines" :key="li" class="poet-overview__line">
              {{ line }}
            </p>
            <p v-if="poemMetaBits(poem).length" class="poet-overview__meta">
              <span
                v-for="(bit, bi) in poemMetaBits(poem)"
                :key="bi"
                class="poet-overview__meta-bit"
              >
                {{ bit }}
              </span>
            </p>
            <p class="poet-overview__note">{{ poem.note }}</p>
          </div>
        </section>

        <section v-if="activePoet.mnemonic" class="poet-overview__mnemonic">
          <h5 class="poet-overview__stage-title">{{ activePoet.mnemonic.title }}</h5>
          <p
            v-for="(line, i) in activePoet.mnemonic.lines"
            :key="i"
            class="poet-overview__mnemonic-line"
          >
            <template v-for="(part, j) in mnemonicParts(line)" :key="j">
              <strong v-if="part.bold">{{ part.text }}</strong>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
        </section>
      </article>
    </div>
  </section>
</template>

<style scoped>
.poet-overview {
  --po-ink: #2f3a32;
  --po-ink-soft: #5a6a5e;
  --po-muted: #7a8a7e;
  --po-paper: #f4f6f2;
  --po-card: #ffffff;
  --po-line: #dce4db;
  --po-accent: #5f7f64;
  --po-accent-soft: #e8f0e9;
  --po-accent-deep: #45634b;

  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-height: min(72vh, 860px);
  min-height: 240px;
  padding: 8px;
  border-radius: 16px;
  background: var(--po-paper);
  border: 1px solid var(--po-line);
}

.poet-overview--pick {
  justify-content: center;
  padding: 20px 16px 28px;
}

.poet-overview--quiz {
  overflow: auto;
  padding: 12px 10px 16px;
}

.poet-pick__head {
  text-align: center;
  margin-bottom: 18px;
}

.poet-pick__title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--po-ink);
}

.poet-pick__lead {
  margin: 0;
  font-size: 0.85rem;
  color: var(--po-muted);
  line-height: 1.45;
}

.poet-pick__grid {
  display: grid;
  gap: 10px;
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.poet-pick__card {
  appearance: none;
  border: 1px solid var(--po-line);
  border-radius: 14px;
  padding: 18px 16px;
  background: var(--po-card);
  text-align: left;
  cursor: pointer;
  font: inherit;
  box-shadow: 0 1px 3px rgba(47, 58, 50, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.poet-pick__card:hover {
  border-color: color-mix(in srgb, var(--po-accent) 55%, var(--po-line));
  box-shadow: 0 2px 8px rgba(47, 58, 50, 0.1);
}

.poet-pick__card-title {
  display: block;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--po-accent-deep);
  margin-bottom: 4px;
}

.poet-pick__card-desc {
  display: block;
  font-size: 0.8rem;
  color: var(--po-ink-soft);
  line-height: 1.4;
}

.poet-overview__nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.poet-overview__back {
  appearance: none;
  border: none;
  margin: 0;
  padding: 4px 2px;
  background: transparent;
  color: var(--po-accent-deep);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 650;
  cursor: pointer;
}

.poet-overview__test-btn {
  appearance: none;
  border: none;
  margin: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--po-accent-deep);
  color: #f7faf7;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.poet-overview__test-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.poet-drill__hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--po-ink-soft);
  line-height: 1.5;
}

.poet-drill__hint--tight {
  margin: -4px 0 8px;
  font-size: 12px;
  color: var(--po-muted);
}

.poet-drill__loading {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--po-muted);
}

.poet-drill__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.chinese-quiz__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--po-ink);
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
  color: var(--po-accent-deep);
  background: var(--po-accent-soft);
  border: 1px solid color-mix(in srgb, var(--po-accent) 35%, transparent);
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
  color: var(--po-accent-deep);
}

.chinese-quiz__question {
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--po-ink);
}

.chinese-quiz__poem {
  white-space: pre-line;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.05rem;
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
  border: 1px solid var(--po-line);
  border-radius: 12px;
  background: var(--po-card);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--po-ink);
}

.chinese-option:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--po-accent) 55%, var(--po-line));
}

.chinese-option.is-selected:not(.is-correct):not(.is-wrong) {
  border-color: var(--po-accent-deep);
}

.chinese-option.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 50%, transparent);
}

.chinese-option.is-wrong {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 45%, transparent);
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
  background: var(--po-paper);
  border: 1px solid var(--po-line);
  font-size: 12px;
  font-weight: 700;
}

.chinese-quiz__feedback {
  margin-bottom: 12px;
}

.chinese-quiz__explain {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--po-muted);
  line-height: 1.55;
}

.chinese-quiz__assist {
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid var(--po-line);
  border-radius: 12px;
  background: var(--po-card);
}

.chinese-quiz__assist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.chinese-quiz__assist-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--po-ink);
}

.chinese-quiz__assist-muted {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--po-muted);
}

.chinese-quiz__assist-error {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-color-danger);
}

.chinese-quiz__assist-followup {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.chinese-quiz__actions {
  display: flex;
  gap: 10px;
}

.chinese-summary__title {
  margin: 0 0 8px;
  color: var(--po-ink);
}

.chinese-summary__stats {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--po-ink-soft);
}

.chinese-summary__list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  border: 1px solid var(--po-line);
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--po-card);
}

.chinese-summary__list li {
  padding: 0;
  font-size: 13px;
  border-bottom: 1px solid var(--po-line);
  color: var(--po-ink);
}

.chinese-summary__list li:last-child {
  border-bottom: none;
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

.chinese-summary__item-btn:hover {
  background: color-mix(in srgb, var(--po-accent-soft) 70%, transparent);
}

.chinese-summary__item-main {
  min-width: 0;
  flex: 1;
}

.chinese-summary__item-more {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 650;
  color: var(--po-accent-deep);
}

.poet-drill-detail__term {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--po-accent-deep);
}

.poet-drill-detail__stem {
  margin: 0 0 14px;
  white-space: pre-line;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 1.02rem;
  line-height: 1.55;
  color: var(--po-ink);
}

.poet-drill-detail__options {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poet-drill-detail__opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--po-line);
  background: var(--po-paper);
  font-size: 13px;
  line-height: 1.45;
  color: var(--po-ink);
}

.poet-drill-detail__opt.is-correct {
  border-color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success-light-9) 50%, transparent);
}

.poet-drill-detail__opt.is-chosen {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 45%, transparent);
}

.poet-drill-detail__opt-key {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--po-line);
  background: var(--po-card);
  font-size: 11px;
  font-weight: 700;
}

.poet-drill-detail__opt-val {
  flex: 1;
  min-width: 0;
}

.poet-drill-detail__tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-success);
}

.poet-drill-detail__tag--wrong {
  color: var(--el-color-danger);
}

.poet-drill-detail__result {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 650;
}

.poet-drill-detail__explain {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--po-muted);
}

.feedback {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
}

.feedback--ok {
  color: var(--el-color-success);
}

.feedback--bad {
  color: var(--el-color-danger);
}

.hint {
  margin: 12px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--po-muted);
}

.hint kbd {
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--po-line);
  background: var(--po-card);
  font-size: 11px;
}

.log-ok {
  color: var(--el-color-success);
}

.log-bad {
  color: var(--el-color-danger);
}

.poet-overview__chrome {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.poet-overview__seg {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--po-line) 55%, white);
}

.poet-overview__seg--period {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.poet-overview__seg--song {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.poet-overview__seg--other {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.poet-overview__seg-btn {
  appearance: none;
  border: none;
  margin: 0;
  padding: 7px 4px;
  border-radius: 10px;
  background: transparent;
  color: var(--po-ink-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  line-height: 1.2;
  cursor: pointer;
}

.poet-overview__seg--period .poet-overview__seg-btn {
  padding: 6px 2px;
  font-size: 0.74rem;
}

.poet-overview__seg-btn.is-active {
  background: var(--po-accent-deep);
  color: #f7faf7;
  box-shadow: 0 1px 3px rgba(47, 58, 50, 0.18);
}

.poet-overview__toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.poet-overview__poets {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 1px 0;
}

.poet-overview__poets::-webkit-scrollbar {
  display: none;
}

.poet-overview__poet {
  appearance: none;
  border: none;
  margin: 0;
  padding: 5px 11px;
  border-radius: 999px;
  background: transparent;
  color: var(--po-ink-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

.poet-overview__poet.is-active {
  background: var(--po-accent-deep);
  color: #f7faf7;
  box-shadow: 0 1px 3px rgba(47, 58, 50, 0.16);
}

.poet-overview__modes {
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--po-line) 50%, white);
}

.poet-overview__mode {
  appearance: none;
  border: none;
  margin: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: transparent;
  color: var(--po-muted);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 650;
  cursor: pointer;
}

.poet-overview__mode.is-active {
  background: var(--po-accent-deep);
  color: #f7faf7;
  box-shadow: 0 1px 2px rgba(47, 58, 50, 0.14);
}

.poet-overview__empty-box {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  border-radius: 14px;
  background: var(--po-card);
  border: 1px dashed var(--po-line);
}

.poet-overview__empty {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--po-ink-soft);
  text-align: center;
}

.poet-overview__scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 2px 4px;
  border-radius: 12px;
  scrollbar-width: none;
}

.poet-overview__scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.poet-overview__guide {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.poet-overview__guide-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 2px;
}

.poet-overview__guide-lead {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--po-muted);
}

.poet-overview__cheat {
  padding: 12px 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--po-accent-soft) 72%, white);
  border: 1px solid color-mix(in srgb, var(--po-accent) 22%, var(--po-line));
}

.poet-overview__cheat-list {
  margin: 8px 0 0;
  padding: 0 0 0 1.1em;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--po-ink);
}

.poet-overview__guide-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poet-overview__guide-group-title {
  appearance: none;
  border: none;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--po-accent-deep);
  cursor: pointer;
}

.poet-overview__guide-common {
  margin: 0;
  padding: 0 2px;
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--po-ink-soft);
}

.poet-overview__guide-poets {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.poet-overview__guide-card {
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--po-line) 85%, transparent);
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--po-card);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.poet-overview__guide-card:active {
  background: var(--po-accent-soft);
}

.poet-overview__guide-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
}

.poet-overview__guide-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--po-ink);
}

.poet-overview__guide-badge {
  font-size: 0.7rem;
  font-weight: 650;
  color: var(--po-accent-deep);
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--po-accent-soft);
}

.poet-overview__guide-blurb,
.poet-overview__guide-meta {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.5;
  color: var(--po-ink-soft);
}

.poet-overview__guide-meta em {
  font-style: normal;
  font-weight: 700;
  color: var(--po-muted);
  margin-right: 6px;
}

.poet-overview__profile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.poet-overview__headline {
  margin: 0;
  padding: 0 2px;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--po-ink);
}

.poet-overview__stage {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.poet-overview__stage-title {
  margin: 0;
  padding: 0 2px;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0.01em;
  color: var(--po-accent-deep);
}

.poet-overview__poem {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--po-card);
  border: 1px solid color-mix(in srgb, var(--po-line) 80%, transparent);
  box-shadow: 0 1px 0 rgba(47, 58, 50, 0.03);
}

.poet-overview__poem.is-overview {
  background: color-mix(in srgb, var(--po-accent-soft) 35%, var(--po-card));
  border-color: color-mix(in srgb, var(--po-accent) 18%, var(--po-line));
}

.poet-overview__scroll--compact .poet-overview__poem {
  padding: 8px 10px;
  gap: 4px;
  border-radius: 10px;
}

.poet-overview__poem-title {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--po-muted);
}

.poet-overview__poem-title--soft {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.poet-overview__line {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.55;
  color: var(--po-ink);
}

.poet-overview__scroll--compact .poet-overview__line {
  font-size: 0.94rem;
  line-height: 1.45;
}

.poet-overview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 2px 0 0;
}

.poet-overview__meta-bit {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--po-accent-soft);
  color: var(--po-accent-deep);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
}

.poet-overview__note {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--po-ink-soft);
}

.poet-overview__scroll--compact .poet-overview__note {
  font-size: 0.74rem;
}

.poet-overview__scroll--compact .poet-overview__meta {
  display: none;
}

.poet-overview__mnemonic {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--po-accent-soft) 70%, white);
  border: 1px solid color-mix(in srgb, var(--po-accent) 22%, var(--po-line));
}

.poet-overview__mnemonic-line {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--po-ink);
}

.poet-overview__mnemonic-line strong {
  color: var(--po-accent-deep);
  font-weight: 700;
}

@media (max-width: 640px) {
  .poet-overview {
    max-height: none;
    height: 100%;
    min-height: 0;
    padding: 6px 6px 4px;
    border-radius: 14px;
    gap: 6px;
    border: none;
    background: #eef2ec;
  }

  .poet-overview__chrome {
    gap: 5px;
  }

  .poet-overview__seg-btn {
    padding: 6px 2px;
    font-size: 0.76rem;
  }

  .poet-overview__seg--period .poet-overview__seg-btn {
    padding: 5px 1px;
    font-size: 0.7rem;
  }

  .poet-overview__poet {
    padding: 4px 10px;
    font-size: 0.78rem;
  }

  .poet-overview__headline {
    font-size: 0.88rem;
  }

  .poet-overview__poem {
    padding: 11px 12px;
  }
}
</style>
