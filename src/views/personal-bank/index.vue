<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import RichTextView from '@/components/RichTextView.vue'
import ImageCropPanel from '@/components/ImageCropPanel.vue'
import PersonalBankQuizPanel from '@/views/personal-bank/PersonalBankQuizPanel.vue'
import {
  extractPersonalBankFieldFromPhoto,
  extractPersonalBankQuestionFromPhoto,
  type PersonalBankPhotoField,
} from '@/utils/personalBankPhotoExtract'
import {
  aiProviderTick,
  aiRequestProgressText,
  getAiProvider,
  getAiProviderLabel,
  setAiProvider,
  type AiProvider,
} from '@/utils/aiProviderStore'
import {
  createPersonalBankCategory,
  createPersonalBankQuestion,
  createPersonalBankSub,
  DEFAULT_PERSONAL_BANK_SCORE,
  deletePersonalBankCategory,
  deletePersonalBankQuestion,
  deletePersonalBankSub,
  filterPersonalBankQuestionsByScope,
  listPersonalBankCategories,
  personalBankModeId,
  personalBankQuestionTypeLabel,
  PERSONAL_BANK_QUESTION_TYPES,
  renamePersonalBankCategory,
  renamePersonalBankSub,
  updatePersonalBankQuestion,
  type PersonalBankCategory,
  type PersonalBankQuestion,
  type PersonalBankQuestionType,
  type PersonalBankQuizScope,
} from '@/utils/personalQuestionBank'

const router = useRouter()
const categories = ref<PersonalBankCategory[]>(listPersonalBankCategories())
const activeCategoryId = ref<string | null>(null)
const activeSubId = ref<string | null>(null)
const quizActive = ref(false)
const quizScope = ref<PersonalBankQuizScope>('all')
const formOpen = ref(false)
const photoOpen = ref(false)
const photoTarget = ref<'full' | PersonalBankPhotoField>('full')
const photoSrc = ref('')
const photoBusy = ref(false)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)
const aiProvider = computed({
  get() {
    void aiProviderTick.value
    return getAiProvider()
  },
  set(v: AiProvider) {
    setAiProvider(v)
    ElMessage.success(`已切换为 ${getAiProviderLabel(v)}`)
  },
})
const detailId = ref<string | null>(null)
const editingId = ref<string | null>(null)

const form = reactive({
  title: '',
  type: 'short-answer' as PersonalBankQuestionType,
  score: DEFAULT_PERSONAL_BANK_SCORE,
  stemHtml: '',
  answer: '',
  answerHtml: '',
  explanationHtml: '',
})

const activeCategory = computed(
  () => categories.value.find((c) => c.id === activeCategoryId.value) ?? null,
)
const activeSub = computed(
  () => activeCategory.value?.subs.find((s) => s.id === activeSubId.value) ?? null,
)

const viewingSub = computed(() => activeCategory.value != null && activeSub.value != null)
const questions = computed(() => activeSub.value?.questions ?? [])
const hasShortAnswer = computed(() => questions.value.some((q) => q.type === 'short-answer'))
const hasChoice = computed(() => questions.value.some((q) => q.type === 'choice'))
const quizPaper = computed(() => filterPersonalBankQuestionsByScope(questions.value, quizScope.value))
const quizHeading = computed(() =>
  activeCategory.value && activeSub.value
    ? `${activeCategory.value.name} · ${activeSub.value.name}`
    : '个人题库',
)
const quizModeId = computed(() => (activeSub.value ? personalBankModeId(activeSub.value.id) : ''))
const formTitle = computed(() => (editingId.value ? '修改题目' : '新建题目'))
const detailQuestion = computed(
  () => questions.value.find((q) => q.id === detailId.value) ?? null,
)
const pageTitle = computed(() => {
  if (photoOpen.value) {
    if (photoTarget.value === 'stem') return '拍照识别题目'
    if (photoTarget.value === 'answer') return '拍照识别答案'
    if (photoTarget.value === 'explanation') return '拍照识别解析'
    return '拍照整理'
  }
  if (formOpen.value) return formTitle.value
  if (detailQuestion.value) return detailQuestion.value.title
  if (viewingSub.value && activeCategory.value && activeSub.value) {
    return `${activeCategory.value.name} · ${activeSub.value.name}`
  }
  return '个人题库'
})

const photoBusyText = computed(() =>
  photoTarget.value === 'full'
    ? aiRequestProgressText('整理题目', 'doubao')
    : aiRequestProgressText('识别文字', 'doubao'),
)

const quizNeedsChoiceAi = computed(() => quizPaper.value.some((q) => q.type === 'choice'))

const showPhotoBtn = computed(
  () =>
    viewingSub.value &&
    !quizActive.value &&
    !formOpen.value &&
    !detailId.value &&
    !photoOpen.value,
)

function reload() {
  categories.value = listPersonalBankCategories()
  if (activeCategoryId.value && !categories.value.some((c) => c.id === activeCategoryId.value)) {
    activeCategoryId.value = null
    activeSubId.value = null
    quizActive.value = false
    formOpen.value = false
    photoOpen.value = false
    photoSrc.value = ''
    photoTarget.value = 'full'
    detailId.value = null
  } else if (
    activeCategory.value &&
    activeSubId.value &&
    !activeCategory.value.subs.some((s) => s.id === activeSubId.value)
  ) {
    activeSubId.value = null
    quizActive.value = false
    formOpen.value = false
    photoOpen.value = false
    photoSrc.value = ''
    photoTarget.value = 'full'
    detailId.value = null
  } else if (detailId.value && !questions.value.some((q) => q.id === detailId.value)) {
    detailId.value = null
  }
}

function goBack() {
  if (quizActive.value) {
    quizActive.value = false
    reload()
    return
  }
  if (photoOpen.value) {
    const backToForm = photoTarget.value !== 'full'
    photoOpen.value = false
    photoSrc.value = ''
    photoBusy.value = false
    photoTarget.value = 'full'
    if (backToForm) formOpen.value = true
    return
  }
  if (formOpen.value) {
    formOpen.value = false
    resetForm()
    return
  }
  if (detailId.value) {
    detailId.value = null
    return
  }
  if (viewingSub.value) {
    activeSubId.value = null
    return
  }
  void router.push({ name: 'home' })
}

async function promptName(title: string, current = ''): Promise<string | null> {
  try {
    const { value } = await ElMessageBox.prompt('名称', title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: current,
      inputPlaceholder: '请输入名称',
      inputValidator: (v: string) => {
        if (!String(v ?? '').trim()) return '名称不能为空'
        return true
      },
    })
    return String(value ?? '').trim()
  } catch {
    return null
  }
}

async function onCreateCategory() {
  const name = await promptName('新建大类')
  if (!name) return
  try {
    createPersonalBankCategory(name)
    reload()
    ElMessage.success('已新建大类')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '新建失败')
  }
}

async function onRenameCategory(cat: PersonalBankCategory) {
  const name = await promptName('修改大类', cat.name)
  if (!name) return
  try {
    renamePersonalBankCategory(cat.id, name)
    reload()
    ElMessage.success('已修改')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '修改失败')
  }
}

async function onDeleteCategory(cat: PersonalBankCategory) {
  try {
    await ElMessageBox.confirm(
      cat.subs.length
        ? `删除大类「${cat.name}」将同时删除其下 ${cat.subs.length} 个小类，确定吗？`
        : `确定删除大类「${cat.name}」？`,
      '删除大类',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  deletePersonalBankCategory(cat.id)
  reload()
  ElMessage.success('已删除')
}

async function onCreateSub(cat: PersonalBankCategory) {
  const name = await promptName('新建小类')
  if (!name) return
  try {
    createPersonalBankSub(cat.id, name)
    reload()
    ElMessage.success('已新建小类')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '新建失败')
  }
}

async function onRenameSub(cat: PersonalBankCategory, subId: string, current: string) {
  const name = await promptName('修改小类', current)
  if (!name) return
  try {
    renamePersonalBankSub(cat.id, subId, name)
    reload()
    ElMessage.success('已修改')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '修改失败')
  }
}

async function onDeleteSub(cat: PersonalBankCategory, subId: string, subName: string) {
  try {
    await ElMessageBox.confirm(`确定删除小类「${subName}」？`, '删除小类', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  deletePersonalBankSub(cat.id, subId)
  reload()
  ElMessage.success('已删除')
}

function openSub(cat: PersonalBankCategory, subId: string) {
  if (!cat.subs.some((s) => s.id === subId)) {
    ElMessage.warning('请先在该大类下新建小类')
    return
  }
  activeCategoryId.value = cat.id
  activeSubId.value = subId
  quizActive.value = false
  formOpen.value = false
  photoOpen.value = false
  photoSrc.value = ''
  photoTarget.value = 'full'
  detailId.value = null
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.type = 'short-answer'
  form.score = DEFAULT_PERSONAL_BANK_SCORE
  form.stemHtml = ''
  form.answer = ''
  form.answerHtml = ''
  form.explanationHtml = ''
}

function openCreateQuestion() {
  detailId.value = null
  resetForm()
  formOpen.value = true
}

function openEditQuestion(q: PersonalBankQuestion) {
  detailId.value = null
  editingId.value = q.id
  form.title = q.title
  form.type = q.type
  form.score = q.score
  form.stemHtml = q.stemHtml
  form.answer = q.answer
  form.answerHtml = q.answerHtml
  form.explanationHtml = q.explanationHtml
  formOpen.value = true
}

function openQuestionDetail(q: PersonalBankQuestion) {
  formOpen.value = false
  detailId.value = q.id
}

function saveQuestion() {
  const cat = activeCategory.value
  const sub = activeSub.value
  if (!cat || !sub) return
  try {
    const payload = {
      title: form.title,
      type: form.type,
      score: form.score,
      stemHtml: form.stemHtml,
      answer: form.answer,
      answerHtml: form.answerHtml,
      explanationHtml: form.explanationHtml,
    }
    if (editingId.value) {
      updatePersonalBankQuestion(cat.id, sub.id, editingId.value, payload)
      ElMessage.success('已修改题目')
    } else {
      createPersonalBankQuestion(cat.id, sub.id, payload)
      ElMessage.success('已新建题目')
    }
    formOpen.value = false
    resetForm()
    reload()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function onDeleteQuestion(q: PersonalBankQuestion) {
  const cat = activeCategory.value
  const sub = activeSub.value
  if (!cat || !sub) return
  try {
    await ElMessageBox.confirm(`确定删除题目「${q.title}」？`, '删除题目', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    deletePersonalBankQuestion(cat.id, sub.id, q.id)
    reload()
    ElMessage.success('已删除')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

function startQuiz() {
  if (!quizPaper.value.length) {
    ElMessage.warning(
      quizScope.value === 'all' ? '请先在本题库里添加题目' : '当前题型范围内没有题目',
    )
    return
  }
  quizActive.value = true
}

function onQuizExit() {
  quizActive.value = false
  reload()
}

function openPhotoSort() {
  photoTarget.value = 'full'
  photoSrc.value = ''
  photoBusy.value = false
  photoOpen.value = true
}

function openFieldPhoto(field: PersonalBankPhotoField) {
  photoTarget.value = field
  photoSrc.value = ''
  photoBusy.value = false
  photoOpen.value = true
}

function onPickPhoto(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    photoSrc.value = String(reader.result ?? '')
  }
  reader.readAsDataURL(file)
}

async function onCropConfirm(dataUrl: string) {
  photoBusy.value = true
  try {
    if (photoTarget.value === 'full') {
      const extracted = await extractPersonalBankQuestionFromPhoto(dataUrl)
      resetForm()
      form.title = extracted.title
      form.type = extracted.type
      form.stemHtml = extracted.stemHtml
      form.answer = extracted.answer
      form.answerHtml = extracted.answerHtml
      form.explanationHtml = extracted.explanationHtml
      photoOpen.value = false
      photoSrc.value = ''
      photoTarget.value = 'full'
      formOpen.value = true
      ElMessage.success('已填入新建题目，请核对后保存')
      return
    }
    const field = photoTarget.value
    const extracted = await extractPersonalBankFieldFromPhoto(dataUrl, field, {
      questionType: form.type,
    })
    if (field === 'stem') {
      form.stemHtml = extracted.html
      if (!form.title.trim()) form.title = extracted.text.slice(0, 18)
    } else if (field === 'explanation') {
      form.explanationHtml = extracted.html
    } else if (form.type === 'choice') {
      form.answerHtml = extracted.html
      form.answer = extracted.text
    } else {
      form.answer = extracted.text
      form.answerHtml = ''
    }
    photoOpen.value = false
    photoSrc.value = ''
    photoTarget.value = 'full'
    formOpen.value = true
    ElMessage.success('已填入识别结果，请核对')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '识别失败')
  } finally {
    photoBusy.value = false
  }
}
</script>

<template>
  <section class="personal-bank-page">
    <header class="personal-bank-bar">
      <el-button size="small" @click="goBack">返回</el-button>
      <h1 class="personal-bank-bar__title">{{ pageTitle }}</h1>
      <el-button
        v-if="showPhotoBtn"
        class="personal-bank-bar__photo"
        size="small"
        type="primary"
        @click="openPhotoSort"
      >
        拍照整理
      </el-button>
    </header>

    <div v-if="!viewingSub" class="personal-bank-body">
      <div class="personal-bank-toolbar">
        <el-button type="primary" @click="onCreateCategory">新建大类</el-button>
      </div>
      <p v-if="!categories.length" class="personal-bank-empty">
        还没有大类。先新建大类，再在大类里新建小类；大小类都有之后，才能点进小类放题目。
      </p>
      <ul v-else class="personal-bank-cats">
        <li v-for="cat in categories" :key="cat.id" class="personal-bank-cat">
          <div class="personal-bank-cat__head">
            <h2 class="personal-bank-cat__name">{{ cat.name }}</h2>
            <div class="personal-bank-cat__actions">
              <el-button size="small" @click="onRenameCategory(cat)">修改</el-button>
              <el-button size="small" @click="onCreateSub(cat)">新建小类</el-button>
              <el-button size="small" type="danger" plain @click="onDeleteCategory(cat)">
                删除
              </el-button>
            </div>
          </div>
          <p v-if="!cat.subs.length" class="personal-bank-cat__hint">
            请先新建小类，才能把题目放进去。
          </p>
          <ul v-else class="personal-bank-subs">
            <li v-for="sub in cat.subs" :key="sub.id" class="personal-bank-sub">
              <button type="button" class="personal-bank-sub__open" @click="openSub(cat, sub.id)">
                {{ sub.name }}
                <span class="personal-bank-sub__meta">{{ sub.questions.length }} 题</span>
              </button>
              <div class="personal-bank-sub__actions">
                <el-button size="small" @click="onRenameSub(cat, sub.id, sub.name)">修改</el-button>
                <el-button size="small" type="danger" plain @click="onDeleteSub(cat, sub.id, sub.name)">
                  删除
                </el-button>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div v-else-if="quizActive && activeSub" class="personal-bank-body">
      <PersonalBankQuizPanel
        :paper="quizPaper"
        :heading="quizHeading"
        :mode-id="quizModeId"
        :category-id="activeCategory!.id"
        :sub-id="activeSub.id"
        :choice-provider="aiProvider"
        @exit="onQuizExit"
      />
    </div>

    <div v-else-if="photoOpen" class="personal-bank-body">
      <template v-if="!photoSrc">
        <p class="personal-bank-lead">
          {{
            photoTarget === 'full'
              ? '拍下题目或从相册选择，裁切后由豆包整理进新建题目。'
              : '拍下这一栏内容，裁切后由豆包填入对应字段。'
          }}
          只认印刷试题文字，忽略手写批注、圈画和旁边无关文字。
        </p>
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button type="primary" @click="cameraInputRef?.click()">拍照</el-button>
          <el-button @click="albumInputRef?.click()">相册</el-button>
        </div>
        <input
          ref="cameraInputRef"
          class="pb-file"
          type="file"
          accept="image/*"
          capture="environment"
          @change="onPickPhoto"
        >
        <input
          ref="albumInputRef"
          class="pb-file"
          type="file"
          accept="image/*"
          @change="onPickPhoto"
        >
      </template>
      <div v-else class="pb-photo-stage">
        <ImageCropPanel
          :key="photoSrc"
          :src="photoSrc"
          @confirm="onCropConfirm"
          @recapture="photoSrc = ''"
        />
        <div v-if="photoBusy" class="pb-photo-busy">{{ photoBusyText }}</div>
      </div>
    </div>

    <div v-else-if="formOpen" class="personal-bank-body">
      <p class="personal-bank-lead">
        {{
          form.type === 'choice'
            ? '选择题只需写正确项，测验时由 AI 生成另外三个选项。'
            : '简答题提交后对照参考答案，再自行评分。'
        }}
        题目、答案、解析均可拍照，由豆包识别印刷文字；忽略手写批注。
      </p>
      <el-form class="pb-q-form" label-position="top">
        <section class="pb-q-block">
          <el-form-item label="标题" required>
            <el-input v-model="form.title" maxlength="80" show-word-limit placeholder="列表里用来辨认这道题" />
          </el-form-item>
          <div class="pb-q-form__meta">
            <el-form-item label="题型" required>
              <el-radio-group v-model="form.type">
                <el-radio-button
                  v-for="t in PERSONAL_BANK_QUESTION_TYPES"
                  :key="t.id"
                  :value="t.id"
                >
                  {{ t.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="分值" required>
              <el-input-number
                v-model="form.score"
                :min="0.5"
                :max="100"
                :step="0.5"
                :precision="1"
                controls-position="right"
              />
            </el-form-item>
          </div>
        </section>
        <section class="pb-q-block">
          <el-form-item required>
            <template #label>
              <div class="pb-q-field-head">
                <span>题目</span>
                <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('stem')">
                  拍照识别
                </el-button>
              </div>
            </template>
            <RichTextEditor
              v-model="form.stemHtml"
              min-height="148px"
              placeholder="输入题干，可加粗、列表、插图"
            />
          </el-form-item>
        </section>
        <section class="pb-q-block">
          <el-form-item v-if="form.type === 'choice'" required>
            <template #label>
              <div class="pb-q-field-head">
                <span>正确答案</span>
                <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('answer')">
                  拍照识别
                </el-button>
              </div>
            </template>
            <RichTextEditor
              v-model="form.answerHtml"
              min-height="108px"
              placeholder="本题唯一正确选项，不必写其他选项"
            />
          </el-form-item>
          <el-form-item v-else required>
            <template #label>
              <div class="pb-q-field-head">
                <span>答案</span>
                <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('answer')">
                  拍照识别
                </el-button>
              </div>
            </template>
            <el-input
              v-model="form.answer"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              placeholder="参考答案，测验时对照后自行评分"
            />
          </el-form-item>
        </section>
        <section class="pb-q-block pb-q-block--optional">
          <el-form-item>
            <template #label>
              <div class="pb-q-field-head">
                <span>解析</span>
                <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('explanation')">
                  拍照识别
                </el-button>
              </div>
            </template>
            <RichTextEditor
              v-model="form.explanationHtml"
              min-height="108px"
              placeholder="可选。测验揭晓后显示"
            />
          </el-form-item>
        </section>
        <div class="pb-q-form__actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="saveQuestion">保存</el-button>
        </div>
      </el-form>
    </div>

    <div v-else-if="detailQuestion" class="personal-bank-body">
      <p class="personal-bank-q__meta">
        {{ personalBankQuestionTypeLabel(detailQuestion.type) }} · {{ detailQuestion.score }} 分 · 已测验
        {{ detailQuestion.quizCount }} 次
      </p>
      <section class="pb-q-block">
        <h3 class="pb-q-detail__label">题目</h3>
        <RichTextView :html="detailQuestion.stemHtml" />
      </section>
      <section class="pb-q-block">
        <h3 class="pb-q-detail__label">答案</h3>
        <RichTextView
          v-if="detailQuestion.type === 'choice'"
          :html="detailQuestion.answerHtml || detailQuestion.answer"
        />
        <div v-else class="pb-q-detail__plain">
          <RichTextView :html="detailQuestion.answer" />
        </div>
      </section>
      <section v-if="detailQuestion.explanationHtml" class="pb-q-block pb-q-block--optional">
        <h3 class="pb-q-detail__label">解析</h3>
        <RichTextView :html="detailQuestion.explanationHtml" />
      </section>
      <div class="pb-q-form__actions">
        <el-button @click="openEditQuestion(detailQuestion)">修改</el-button>
        <el-button type="danger" plain @click="onDeleteQuestion(detailQuestion)">删除</el-button>
      </div>
    </div>

    <div v-else class="personal-bank-body">
      <div class="personal-bank-toolbar personal-bank-toolbar--row">
        <el-button type="primary" @click="openCreateQuestion">新建题目</el-button>
        <el-radio-group v-model="quizScope" class="personal-bank-toolbar__scope">
          <el-radio-button value="short-answer" :disabled="!hasShortAnswer">简答题</el-radio-button>
          <el-radio-button value="choice" :disabled="!hasChoice">选择题</el-radio-button>
          <el-radio-button value="all" :disabled="!questions.length">都做</el-radio-button>
        </el-radio-group>
        <div v-if="quizNeedsChoiceAi" class="pb-ai-switch pb-ai-switch--inline">
          <span class="pb-ai-switch__label">选择题生成</span>
          <el-radio-group v-model="aiProvider" size="small">
            <el-radio-button value="deepseek">DeepSeek</el-radio-button>
            <el-radio-button value="doubao">豆包</el-radio-button>
          </el-radio-group>
        </div>
        <el-button type="success" :disabled="!quizPaper.length" @click="startQuiz">
          开始测验
        </el-button>
      </div>
      <p v-if="!questions.length" class="personal-bank-empty">
        还没有题目。可建简答题或选择题；选择题只需写正确项（富文本），测验时由 AI 生成另外三个强干扰项。
      </p>
      <ul v-else class="personal-bank-qs">
        <li v-for="q in questions" :key="q.id" class="personal-bank-q">
          <button type="button" class="personal-bank-q__main" @click="openQuestionDetail(q)">
            <span class="personal-bank-q__title">{{ q.title }}</span>
          </button>
          <div class="personal-bank-q__actions">
            <el-button size="small" @click="openEditQuestion(q)">修改</el-button>
            <el-button size="small" type="danger" plain @click="onDeleteQuestion(q)">删除</el-button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.personal-bank-page {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--app-surface, #fff);
}

.personal-bank-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border-soft, #e5e7eb);
}

.personal-bank-bar__title {
  margin: 0;
  min-width: 0;
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.personal-bank-bar__photo {
  flex-shrink: 0;
  margin-left: auto;
}

.personal-bank-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 14px 12px 24px;
}

.personal-bank-lead {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.personal-bank-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  width: 100%;
  min-width: 0;
}

.personal-bank-toolbar--row :deep(.el-button) {
  height: 32px;
  padding: 0 15px;
  flex-shrink: 0;
}

.personal-bank-toolbar__scope {
  flex: 1 1 auto;
  min-width: min(100%, 12rem);
}

.personal-bank-toolbar--row :deep(.el-radio-button__inner) {
  height: 32px;
  padding: 0 14px;
  line-height: 30px;
  box-sizing: border-box;
}

.personal-bank-empty {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.personal-bank-cats,
.personal-bank-subs,
.personal-bank-qs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.personal-bank-cat {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid var(--app-border, #d0d5dd);
  border-radius: 12px;
  background: var(--app-card-bg, #fff);
}

.personal-bank-cat__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.personal-bank-cat__name {
  margin: 0;
  flex: 1 1 8rem;
  min-width: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.personal-bank-cat__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
}

.personal-bank-cat__hint {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.personal-bank-subs {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.personal-bank-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--app-border, #d0d5dd) 85%, transparent);
  background: color-mix(in srgb, var(--app-surface-alt, #f8fafc) 80%, transparent);
}

.personal-bank-sub__open {
  appearance: none;
  -webkit-appearance: none;
  flex: 1 1 10rem;
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  text-align: left;
  padding: 4px 0;
  border: none;
  background: transparent;
  box-shadow: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  color: inherit;
}

.personal-bank-sub__open:hover {
  color: var(--el-color-primary);
}

.personal-bank-sub__meta {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.personal-bank-sub__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
}

.personal-bank-qs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.personal-bank-q {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 12px;
  border: 1px solid var(--app-border, #d0d5dd);
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
}

.personal-bank-q__main {
  appearance: none;
  -webkit-appearance: none;
  flex: 1 1 8rem;
  min-width: 0;
  display: block;
  padding: 6px 0;
  border: none;
  background: transparent;
  box-shadow: none;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.personal-bank-q__title {
  display: block;
  max-width: 100%;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.personal-bank-q__main:hover .personal-bank-q__title {
  color: var(--el-color-primary);
}

.personal-bank-q__meta {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
}

.personal-bank-q__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
}

.pb-q-form {
  width: 100%;
  max-width: 100%;
}

.pb-q-form :deep(.el-form-item) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin-bottom: 0;
  min-width: 0;
}

.pb-q-form :deep(.el-form-item__label) {
  display: flex !important;
  justify-content: flex-start;
  align-items: center;
  float: none;
  width: 100% !important;
  max-width: 100%;
  margin-bottom: 8px !important;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  line-height: 1.3;
}

.pb-q-form :deep(.el-form-item__content) {
  display: block;
  width: 100% !important;
  max-width: 100%;
  margin-left: 0 !important;
  min-width: 0;
}

.pb-q-form :deep(.el-input),
.pb-q-form :deep(.el-textarea),
.pb-q-form :deep(.el-textarea__inner) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.pb-q-form :deep(.rte) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.pb-q-field-head {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.pb-ai-switch {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 0 0 12px;
  min-width: 0;
}

.pb-ai-switch--inline {
  flex: 1 1 12rem;
  margin: 0;
}

.pb-ai-switch__label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  flex-shrink: 0;
}

.pb-q-block {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  background: #fff;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.pb-q-block--optional {
  background: #fcfdff;
}

.pb-q-form__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 20px;
  margin-top: 14px;
}

.pb-q-form__meta :deep(.el-form-item) {
  flex: 1 1 10rem;
  width: auto;
  min-width: 0;
}

.pb-q-form :deep(.el-input-number) {
  width: 132px;
  max-width: 100%;
}

.pb-q-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.pb-q-detail__label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.pb-q-detail__plain {
  margin: 0;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.65;
}

.pb-file {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.pb-photo-stage {
  position: relative;
}

.pb-photo-busy {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgb(255 255 255 / 78%);
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

@media (max-width: 640px) {
  .personal-bank-q__actions,
  .personal-bank-sub__actions,
  .personal-bank-cat__actions {
    margin-left: 0;
    width: 100%;
  }
}
</style>
