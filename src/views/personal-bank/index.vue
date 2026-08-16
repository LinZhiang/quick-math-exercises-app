<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
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
import { generatePersonalBankVariant } from '@/utils/personalBankVariant'
import {
  allPersonalBankExportLeafIds,
  buildPersonalBankExportTree,
  exportPersonalBankToWord,
} from '@/utils/personalBankWordExport'
import {
  aiProviderTick,
  aiRequestProgressText,
  getAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
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
const photoIntent = ref<'recognize' | 'upload'>('recognize')
const cropList = ref<string[]>([])
const cropIndex = ref(0)
const croppedPhotos = ref<string[]>([])
const photoBusy = ref(false)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)
const photoSrc = computed(() => cropList.value[cropIndex.value] ?? '')
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
const exportOpen = ref(false)
const exportBusy = ref(false)
const exportBusyText = ref('')
const variantBusyId = ref<string | null>(null)
const exportContentMode = ref<'questions' | 'all'>('all')
const exportTreeRef = ref<{ setCheckedKeys: (keys: string[]) => void; getCheckedKeys: (leafOnly?: boolean) => string[] } | null>(null)

const exportTree = computed(() => buildPersonalBankExportTree(categories.value))
const exportDefaultKeys = computed(() => allPersonalBankExportLeafIds(categories.value))
const canExport = computed(() =>
  categories.value.some((c) => c.subs.some((s) => s.questions.length)),
)

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
    const upload = photoIntent.value === 'upload'
    if (photoTarget.value === 'stem') return upload ? '拍照上传题目' : '拍照识别题目'
    if (photoTarget.value === 'answer') return upload ? '拍照上传答案' : '拍照识别答案'
    if (photoTarget.value === 'explanation') return upload ? '拍照上传解析' : '拍照识别解析'
    return '拍照整理'
  }
  if (formOpen.value) return formTitle.value
  if (detailQuestion.value) return detailQuestion.value.title
  if (viewingSub.value && activeCategory.value && activeSub.value) {
    return `${activeCategory.value.name} · ${activeSub.value.name}`
  }
  return '个人题库'
})

const photoBusyText = computed(() => {
  if (photoIntent.value === 'upload') return '正在插入照片…'
  return photoTarget.value === 'full'
    ? aiRequestProgressText('整理题目', 'doubao')
    : aiRequestProgressText('识别文字', 'doubao')
})

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
    resetPhotoQueue()
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
    resetPhotoQueue()
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
    const backToForm = photoTarget.value !== 'full' || photoIntent.value === 'upload'
    photoOpen.value = false
    resetPhotoQueue()
    photoTarget.value = 'full'
    photoIntent.value = 'recognize'
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

async function openExport() {
  if (!canExport.value) {
    ElMessage.warning('请先在小类里添加题目')
    return
  }
  exportContentMode.value = 'all'
  exportOpen.value = true
  exportBusy.value = false
  exportBusyText.value = ''
  await nextTick()
  exportTreeRef.value?.setCheckedKeys(exportDefaultKeys.value)
}

async function confirmExport() {
  const leafIds = (exportTreeRef.value?.getCheckedKeys(true) ?? []).filter((id) => id.startsWith('sub:'))
  if (!leafIds.length) {
    ElMessage.warning('请至少勾选一个小类')
    return
  }
  exportBusy.value = true
  exportBusyText.value = '正在导出…'
  try {
    const { questionCount, filename } = await exportPersonalBankToWord(
      categories.value,
      leafIds,
      { includeAnswers: exportContentMode.value === 'all' },
      (text) => {
        exportBusyText.value = text
      },
    )
    exportOpen.value = false
    ElMessage.success(`已导出 ${questionCount} 题：${filename}`)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '导出失败')
  } finally {
    exportBusy.value = false
    exportBusyText.value = ''
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
  resetPhotoQueue()
  photoTarget.value = 'full'
  photoIntent.value = 'recognize'
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
      ElMessage.success(payload.title.includes('变式') ? '已保存变式题' : '已新建题目')
    }
    formOpen.value = false
    resetForm()
    reload()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function onGenerateVariant(q: PersonalBankQuestion) {
  const cat = activeCategory.value
  const sub = activeSub.value
  if (!cat || !sub || variantBusyId.value) return
  try {
    await ElMessageBox.confirm(
      `将用${getAiProviderShortName()}生成一道考点相同、数字或情境不同的变式。生成后请核对再保存。`,
      '生成变式题',
      { confirmButtonText: '生成', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  variantBusyId.value = q.id
  try {
    const variant = await generatePersonalBankVariant(q)
    editingId.value = null
    detailId.value = null
    form.title = variant.title
    form.type = variant.type
    form.score = variant.score
    form.stemHtml = variant.stemHtml
    form.answer = variant.answer
    form.answerHtml = variant.answerHtml
    form.explanationHtml = variant.explanationHtml
    formOpen.value = true
    ElMessage.success('已生成变式，请核对后保存')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '变式生成失败')
  } finally {
    variantBusyId.value = null
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

function resetPhotoQueue() {
  cropList.value = []
  cropIndex.value = 0
  croppedPhotos.value = []
  photoBusy.value = false
}

function openPhotoSort() {
  photoTarget.value = 'full'
  photoIntent.value = 'recognize'
  resetPhotoQueue()
  photoOpen.value = true
}

function openFieldPhoto(field: PersonalBankPhotoField) {
  photoTarget.value = field
  photoIntent.value = 'recognize'
  resetPhotoQueue()
  photoOpen.value = true
}

function openFieldUpload(field: PersonalBankPhotoField) {
  photoTarget.value = field
  photoIntent.value = 'upload'
  resetPhotoQueue()
  photoOpen.value = true
}

function readImageFiles(files: File[]): Promise<string[]> {
  const images = files.filter((f) => f.type.startsWith('image/'))
  if (!images.length) {
    ElMessage.warning('请选择图片')
    return Promise.resolve([])
  }
  return Promise.all(
    images.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        }),
    ),
  )
}

async function onPickPhoto(ev: Event) {
  const input = ev.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return
  try {
    const urls = (await readImageFiles(files)).filter(Boolean)
    if (!urls.length) return
    const wasEmpty = cropList.value.length === 0
    cropList.value = [...cropList.value, ...urls].slice(0, 8)
    if (wasEmpty) cropIndex.value = 0
  } catch {
    ElMessage.error('读取图片失败')
  }
}

function appendImagesToRichField(field: PersonalBankPhotoField, urls: string[]) {
  const html = urls.map((u) => `<p><img src="${u}" alt=""></p>`).join('')
  if (field === 'stem') form.stemHtml += html
  else if (field === 'explanation') form.explanationHtml += html
  else form.answerHtml += html
}

async function finishCroppedPhotos(urls: string[]) {
  photoBusy.value = true
  try {
    if (photoIntent.value === 'upload') {
      const field = photoTarget.value === 'full' ? 'stem' : photoTarget.value
      appendImagesToRichField(field, urls)
      photoOpen.value = false
      resetPhotoQueue()
      photoTarget.value = 'full'
      photoIntent.value = 'recognize'
      formOpen.value = true
      ElMessage.success('已插入照片，可再编辑')
      return
    }
    if (photoTarget.value === 'full') {
      const extracted = await extractPersonalBankQuestionFromPhoto(urls)
      resetForm()
      form.title = extracted.title
      form.type = extracted.type
      form.stemHtml = extracted.stemHtml
      form.answer = extracted.answer
      form.answerHtml = extracted.answerHtml
      form.explanationHtml = extracted.explanationHtml
      photoOpen.value = false
      resetPhotoQueue()
      photoTarget.value = 'full'
      formOpen.value = true
      ElMessage.success('已填入新建题目，请核对后保存')
      return
    }
    const field = photoTarget.value
    const extracted = await extractPersonalBankFieldFromPhoto(urls, field, {
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
    resetPhotoQueue()
    photoTarget.value = 'full'
    formOpen.value = true
    ElMessage.success('已填入识别结果，请核对')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '识别失败')
  } finally {
    photoBusy.value = false
  }
}

async function onCropConfirm(dataUrl: string) {
  const nextCropped = [...croppedPhotos.value, dataUrl]
  if (cropIndex.value < cropList.value.length - 1) {
    croppedPhotos.value = nextCropped
    cropIndex.value += 1
    return
  }
  await finishCroppedPhotos(nextCropped)
}

function recaptureCurrent() {
  const next = cropList.value.filter((_, i) => i !== cropIndex.value)
  cropList.value = next
  if (cropIndex.value >= next.length) cropIndex.value = Math.max(0, next.length - 1)
}
</script>

<template>
  <section class="personal-bank-page">
    <header class="personal-bank-bar">
      <div class="personal-bank-bar__side personal-bank-bar__side--left">
        <el-button size="small" @click="goBack">返回</el-button>
      </div>
      <h1 class="personal-bank-bar__title">{{ pageTitle }}</h1>
      <div class="personal-bank-bar__side personal-bank-bar__side--right">
        <el-button
          v-if="showPhotoBtn"
          class="personal-bank-bar__photo"
          size="small"
          type="primary"
          @click="openPhotoSort"
        >
          拍照整理
        </el-button>
      </div>
    </header>

    <div v-if="!viewingSub" class="personal-bank-body">
      <div class="personal-bank-toolbar">
        <el-button type="primary" @click="onCreateCategory">新建大类</el-button>
        <el-button :disabled="!canExport" @click="openExport">导出题库</el-button>
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
            photoIntent === 'upload'
              ? '可一次拍多张或从相册多选，按顺序裁切后插入富文本。也可在编辑器里直接粘贴图片。'
              : photoTarget === 'full'
                ? '可一次拍多张或从相册多选，按顺序裁切后由豆包拼成一道题。'
                : '可一次拍多张或从相册多选，按顺序裁切后由豆包填入这一栏。'
          }}
          <template v-if="photoIntent === 'recognize'">
            只认印刷试题文字，忽略手写批注、圈画和旁边无关文字。
          </template>
        </p>
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button type="primary" @click="cameraInputRef?.click()">拍照</el-button>
          <el-button @click="albumInputRef?.click()">相册（可多选）</el-button>
        </div>
      </template>
      <div v-else class="pb-photo-stage">
        <p class="personal-bank-lead">
          第 {{ cropIndex + 1 }} / {{ cropList.length }} 张
          <template v-if="photoIntent === 'recognize'"> · 裁切后按顺序交给豆包</template>
        </p>
        <ImageCropPanel
          :key="`${cropIndex}-${photoSrc.slice(0, 24)}`"
          :src="photoSrc"
          @confirm="onCropConfirm"
          @recapture="recaptureCurrent"
        />
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button size="small" :disabled="cropList.length >= 8" @click="cameraInputRef?.click()">
            再拍一张
          </el-button>
          <el-button size="small" :disabled="cropList.length >= 8" @click="albumInputRef?.click()">
            再加一张
          </el-button>
        </div>
        <div v-if="photoBusy" class="pb-photo-busy">{{ photoBusyText }}</div>
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
        multiple
        @change="onPickPhoto"
      >
    </div>

    <div v-else-if="formOpen" class="personal-bank-body">
      <p class="personal-bank-lead">
        {{
          form.type === 'choice'
            ? '选择题只需写正确项，测验时由 AI 生成另外三个选项。'
            : '简答题提交后对照参考答案，再自行评分。'
        }}
        题目、答案、解析可拍照识别；题目/解析也可拍照上传或直接粘贴图片。只认印刷文字，忽略手写批注。
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
                <div class="pb-q-field-head__actions">
                  <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('stem')">
                    拍照识别
                  </el-button>
                  <el-button size="small" @click.stop.prevent="openFieldUpload('stem')">拍照上传</el-button>
                </div>
              </div>
            </template>
            <RichTextEditor
              v-model="form.stemHtml"
              min-height="148px"
              placeholder="输入题干，可加粗、列表、插图；也可粘贴照片"
            />
          </el-form-item>
        </section>
        <section class="pb-q-block">
          <el-form-item v-if="form.type === 'choice'" required>
            <template #label>
              <div class="pb-q-field-head">
                <span>正确答案</span>
                <div class="pb-q-field-head__actions">
                  <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('answer')">
                    拍照识别
                  </el-button>
                  <el-button size="small" @click.stop.prevent="openFieldUpload('answer')">拍照上传</el-button>
                </div>
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
                <div class="pb-q-field-head__actions">
                  <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('answer')">
                    拍照识别
                  </el-button>
                </div>
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
                <div class="pb-q-field-head__actions">
                  <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('explanation')">
                    拍照识别
                  </el-button>
                  <el-button size="small" @click.stop.prevent="openFieldUpload('explanation')">拍照上传</el-button>
                </div>
              </div>
            </template>
            <RichTextEditor
              v-model="form.explanationHtml"
              min-height="108px"
              placeholder="可选。测验揭晓后显示；也可粘贴照片"
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
        <el-button
          :loading="variantBusyId === detailQuestion.id"
          @click="onGenerateVariant(detailQuestion)"
        >
          生成变式
        </el-button>
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
            <el-button
              size="small"
              :loading="variantBusyId === q.id"
              :disabled="!!variantBusyId && variantBusyId !== q.id"
              @click="onGenerateVariant(q)"
            >
              生成变式
            </el-button>
            <el-button size="small" @click="openEditQuestion(q)">修改</el-button>
            <el-button size="small" type="danger" plain @click="onDeleteQuestion(q)">删除</el-button>
          </div>
        </li>
      </ul>
    </div>

    <el-dialog
      v-model="exportOpen"
      title="导出题库"
      width="min(92vw, 480px)"
      :close-on-click-modal="!exportBusy"
      :close-on-press-escape="!exportBusy"
      :show-close="!exportBusy"
    >
      <p class="pb-export__hint">勾选要导出的大类 / 小类，导出为 .docx。选择题会先用豆包补上三个强干扰项；分数按行内公式写入，选项与答案不额外换行。</p>
      <el-radio-group v-model="exportContentMode" class="pb-export__mode" :disabled="exportBusy">
        <el-radio value="questions">仅题目</el-radio>
        <el-radio value="all">题目 + 答案解析</el-radio>
      </el-radio-group>
      <el-tree
        ref="exportTreeRef"
        class="pb-export__tree"
        :data="exportTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="exportDefaultKeys"
        :check-on-click-node="true"
      />
      <p v-if="exportBusy" class="pb-export__busy">{{ exportBusyText || '正在导出…' }}</p>
      <template #footer>
        <el-button :disabled="exportBusy" @click="exportOpen = false">取消</el-button>
        <el-button type="primary" :loading="exportBusy" @click="confirmExport">导出 Word</el-button>
      </template>
    </el-dialog>
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
  display: grid;
  grid-template-columns: minmax(5.5rem, 1fr) auto minmax(5.5rem, 1fr);
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--app-border-soft, #e5e7eb);
}

.personal-bank-bar__side {
  display: flex;
  align-items: center;
  min-width: 0;
}

.personal-bank-bar__side--left {
  justify-content: flex-start;
}

.personal-bank-bar__side--right {
  justify-content: flex-end;
}

.personal-bank-bar__title {
  margin: 0;
  min-width: 0;
  max-width: min(70vw, 28rem);
  font-size: 1.45rem;
  font-weight: 700;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.personal-bank-bar__photo {
  flex-shrink: 0;
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

.pb-export__hint {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.pb-export__mode {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 0 0 10px;
}

.pb-export__tree {
  max-height: min(52vh, 420px);
  overflow: auto;
  padding: 6px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.pb-export__busy {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--el-color-primary);
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
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 10px;
  padding: 8px 12px;
  border: 1px solid var(--app-border, #d0d5dd);
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
}

.personal-bank-q__main {
  appearance: none;
  -webkit-appearance: none;
  flex: 1 1 auto;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  flex-wrap: nowrap;
  flex-shrink: 0;
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.pb-q-field-head__actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
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
  .personal-bank-q {
    flex-wrap: wrap;
  }
  .personal-bank-q__main {
    flex: 1 1 8rem;
    max-width: 100%;
  }
  .personal-bank-sub__actions,
  .personal-bank-cat__actions {
    margin-left: 0;
    width: 100%;
  }
  .personal-bank-q__actions {
    margin-left: auto;
    width: auto;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
