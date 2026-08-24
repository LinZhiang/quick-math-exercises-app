<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, MoreFilled } from '@element-plus/icons-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import RichTextView from '@/components/RichTextView.vue'
import ImageCropPanel from '@/components/ImageCropPanel.vue'
import PersonalBankQuizPanel from '@/views/personal-bank/PersonalBankQuizPanel.vue'
import {
  extractPersonalBankFieldFromPhoto,
  extractPersonalBankQuestionsFromPhoto,
  PERSONAL_BANK_PHOTO_MAX,
  type PersonalBankPhotoField,
} from '@/utils/personal-bank/personalBankPhotoExtract'
import { generatePersonalBankVariant } from '@/utils/personal-bank/personalBankVariant'
import {
  allPersonalBankExportLeafIds,
  buildPersonalBankExportTree,
  exportPersonalBankToWord,
} from '@/utils/personal-bank/personalBankWordExport'
import {
  aiProviderTick,
  aiRequestProgressText,
  getAiProvider,
  getAiProviderLabel,
  getAiProviderShortName,
  setAiProvider,
  type AiProvider,
} from '@/utils/app/aiProviderStore'
import {
  createPersonalBankCategory,
  createPersonalBankQuestion,
  createPersonalBankSub,
  DEFAULT_PERSONAL_BANK_SCORE,
  deletePersonalBankCategory,
  deletePersonalBankQuestion,
  deletePersonalBankSub,
  filterPersonalBankQuestionsByScope,
  isOpenChoiceQuestion,
  listPersonalBankCategories,
  movePersonalBankQuestion,
  personalBankChoiceModeOf,
  personalBankModeId,
  personalBankQuestionTypeLabel,
  PERSONAL_BANK_CHOICE_MODES,
  PERSONAL_BANK_QUESTION_TYPES,
  renamePersonalBankCategory,
  renamePersonalBankSub,
  updatePersonalBankQuestion,
  type PersonalBankCategory,
  type PersonalBankChoiceMode,
  type PersonalBankQuestion,
  type PersonalBankQuestionType,
  type PersonalBankQuizScope,
} from '@/utils/personal-bank/personalQuestionBank'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'
import { goBackOr } from '@/utils/app/appNavigation'

const route = useRoute()
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
const cropIndex = ref(0)
const photoSlots = ref<Array<{ original: string; cropped: string | null }>>([])
const photoBusy = ref(false)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)
const photoSrc = computed(() => photoSlots.value[cropIndex.value]?.original ?? '')
const currentPhotoCropped = computed(() => !!photoSlots.value[cropIndex.value]?.cropped)
const croppedPhotoCount = computed(() => photoSlots.value.filter((s) => s.cropped).length)
const allPhotosCropped = computed(
  () => photoSlots.value.length > 0 && photoSlots.value.every((s) => s.cropped),
)
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
const moveOpen = ref(false)
const moveQuestion = ref<PersonalBankQuestion | null>(null)
const moveCategoryId = ref('')
const moveSubId = ref('')
const CHOICE_OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const
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
  choiceMode: 'fixed' as PersonalBankChoiceMode,
  score: DEFAULT_PERSONAL_BANK_SCORE,
  stemHtml: '',
  answer: '',
  answerHtml: '',
  explanationHtml: '',
  optionsHtml: ['', '', '', ''] as string[],
  correctIndex: 0,
})

const activeCategory = computed(
  () => categories.value.find((c) => c.id === activeCategoryId.value) ?? null,
)
const activeSub = computed(
  () => activeCategory.value?.subs.find((s) => s.id === activeSubId.value) ?? null,
)

const viewingSub = computed(() => activeCategory.value != null && activeSub.value != null)
const OPEN_CATEGORY_KEY = 'personal-bank-open-category'

function readOpenCategoryId(): string | null {
  try {
    return sessionStorage.getItem(OPEN_CATEGORY_KEY)
  } catch {
    return null
  }
}

const openCategoryId = ref<string | null>(readOpenCategoryId())

function setOpenCategory(id: string | null) {
  openCategoryId.value = id
  try {
    if (id) sessionStorage.setItem(OPEN_CATEGORY_KEY, id)
    else sessionStorage.removeItem(OPEN_CATEGORY_KEY)
  } catch {
    /* ignore */
  }
}

function toggleCategory(cat: PersonalBankCategory) {
  setOpenCategory(openCategoryId.value === cat.id ? null : cat.id)
}

watch(
  categories,
  (list) => {
    if (!list.length) {
      setOpenCategory(null)
      return
    }
    if (openCategoryId.value && list.some((c) => c.id === openCategoryId.value)) return
    setOpenCategory(list[0]!.id)
  },
  { immediate: true },
)

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
  return '题库整理'
})
useAppChromeTitle(pageTitle)

const photoBusyText = computed(() => {
  if (photoIntent.value === 'upload') return '正在插入照片…'
  return photoTarget.value === 'full'
    ? aiRequestProgressText('整理题目', 'doubao')
    : aiRequestProgressText('识别文字', 'doubao')
})

const quizNeedsChoiceAi = computed(() => quizPaper.value.some((q) => isOpenChoiceQuestion(q)))

const moveSubOptions = computed(() => {
  const cat = categories.value.find((c) => c.id === moveCategoryId.value)
  return cat?.subs ?? []
})

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

function fillEditForm(q: PersonalBankQuestion) {
  editingId.value = q.id
  form.title = q.title
  form.type = q.type
  form.choiceMode = personalBankChoiceModeOf(q)
  form.score = q.score
  form.stemHtml = q.stemHtml
  form.answer = q.answer
  form.answerHtml = q.answerHtml
  form.explanationHtml = q.explanationHtml
  form.optionsHtml = padOptions(q.optionsHtml)
  form.correctIndex = q.correctIndex ?? 0
}

function pushBank(opts: {
  categoryId?: string | null
  subId?: string | null
  view?: string
  qid?: string | null
  photoTarget?: string
  photoIntent?: string
  replace?: boolean
}) {
  const cat = opts.categoryId ?? activeCategoryId.value
  const sub = opts.subId ?? activeSubId.value
  if (!cat || !sub) {
    const loc = { name: 'bank' as const }
    const nav = opts.replace ? router.replace(loc) : router.push(loc)
    void nav.catch(() => {})
    return
  }
  const query: Record<string, string> = {}
  if (opts.view) query.view = opts.view
  if (opts.qid) query.qid = opts.qid
  if (opts.view === 'photo') {
    query.photoTarget = opts.photoTarget ?? 'full'
    query.photoIntent = opts.photoIntent ?? 'recognize'
  }
  const loc = {
    name: 'bank-sub' as const,
    params: { categoryId: cat, subId: sub },
    query,
  }
  const nav = opts.replace ? router.replace(loc) : router.push(loc)
  void nav.catch(() => {})
}

function bankFallback() {
  const view = String(route.query.view ?? '')
  const photoTargetQ = String(route.query.photoTarget ?? 'full')
  const photoIntentQ = String(route.query.photoIntent ?? 'recognize')
  if (view === 'photo' && (photoTargetQ !== 'full' || photoIntentQ === 'upload')) {
    const qid = route.query.qid
    return {
      name: 'bank-sub' as const,
      params: route.params,
      query: qid ? { view: 'edit', qid: String(qid) } : { view: 'new' },
    }
  }
  if (view) {
    return { name: 'bank-sub' as const, params: route.params }
  }
  if (route.name === 'bank-sub') return { name: 'bank' as const }
  return { name: 'home' as const }
}

function applyBankRoute() {
  const cat = typeof route.params.categoryId === 'string' ? route.params.categoryId : null
  const sub = typeof route.params.subId === 'string' ? route.params.subId : null
  activeCategoryId.value = cat
  activeSubId.value = sub
  if (cat && !categories.value.some((c) => c.id === cat)) {
    void router.replace({ name: 'bank' })
    return
  }
  if (cat && sub) {
    const found = categories.value.find((c) => c.id === cat)
    if (found && !found.subs.some((s) => s.id === sub)) {
      void router.replace({ name: 'bank' })
      return
    }
  }
  const view = String(route.query.view ?? '')
  const qid = typeof route.query.qid === 'string' ? route.query.qid : null
  const nextPhotoTarget = String(route.query.photoTarget ?? 'full')
  photoTarget.value =
    nextPhotoTarget === 'stem' || nextPhotoTarget === 'answer' || nextPhotoTarget === 'explanation'
      ? nextPhotoTarget
      : 'full'
  photoIntent.value = String(route.query.photoIntent ?? 'recognize') === 'upload' ? 'upload' : 'recognize'
  quizActive.value = view === 'quiz'
  photoOpen.value = view === 'photo'
  formOpen.value = view === 'new' || view === 'edit'
  detailId.value = view === 'detail' ? qid : null
  if (view === 'edit' && qid) {
    const q = questions.value.find((x) => x.id === qid)
    if (q && editingId.value !== q.id) fillEditForm(q)
  } else if (view === 'new') {
    editingId.value = null
  } else if (view !== 'photo') {
    editingId.value = view === 'edit' ? editingId.value : null
  }
  if (view !== 'photo' && photoSlots.value.length) resetPhotoQueue()
}

watch(
  () => route.fullPath,
  () => {
    applyBankRoute()
  },
  { immediate: true },
)

function goBack() {
  if (quizActive.value) reload()
  goBackOr(router, bankFallback())
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
    const row = createPersonalBankCategory(name)
    reload()
    setOpenCategory(row.id)
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
    setOpenCategory(cat.id)
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
  setOpenCategory(cat.id)
  if (
    route.name === 'bank-sub' &&
    route.params.categoryId === cat.id &&
    route.params.subId === subId &&
    !route.query.view
  ) {
    return
  }
  quizActive.value = false
  formOpen.value = false
  photoOpen.value = false
  resetPhotoQueue()
  photoTarget.value = 'full'
  detailId.value = null
  pushBank({ categoryId: cat.id, subId })
}

function categoryQuestionCount(cat: PersonalBankCategory) {
  return cat.subs.reduce((n, s) => n + s.questions.length, 0)
}

function onCategoryCommand(cmd: string | number | object, cat: PersonalBankCategory) {
  const key = String(cmd)
  if (key === 'rename') void onRenameCategory(cat)
  else if (key === 'add-sub') void onCreateSub(cat)
  else if (key === 'delete') void onDeleteCategory(cat)
}

function categoryCommandHandler(cat: PersonalBankCategory) {
  return (cmd: string | number) => onCategoryCommand(cmd, cat)
}

function onSubCommand(
  cmd: string | number | object,
  cat: PersonalBankCategory,
  subId: string,
  subName: string,
) {
  const key = String(cmd)
  if (key === 'rename') void onRenameSub(cat, subId, subName)
  else if (key === 'delete') void onDeleteSub(cat, subId, subName)
}

function subCommandHandler(cat: PersonalBankCategory, subId: string, subName: string) {
  return (cmd: string | number) => onSubCommand(cmd, cat, subId, subName)
}

function padOptions(list?: string[]): string[] {
  const next = [...(list ?? [])]
  while (next.length < 4) next.push('')
  return next.slice(0, 4)
}

function questionPayload() {
  return {
    title: form.title,
    type: form.type,
    score: form.score,
    stemHtml: form.stemHtml,
    answer: form.answer,
    answerHtml: form.answerHtml,
    explanationHtml: form.explanationHtml,
    choiceMode: form.choiceMode,
    optionsHtml: form.optionsHtml,
    correctIndex: form.correctIndex,
  }
}

function applyExtractToForm(extracted: {
  title: string
  type: PersonalBankQuestionType
  score?: number
  stemHtml: string
  answer: string
  answerHtml: string
  explanationHtml: string
  choiceMode?: PersonalBankChoiceMode
  optionsHtml?: string[]
  correctIndex?: number
}) {
  form.title = extracted.title
  form.type = extracted.type
  form.score = extracted.score ?? DEFAULT_PERSONAL_BANK_SCORE
  form.stemHtml = extracted.stemHtml
  form.answer = extracted.answer
  form.answerHtml = extracted.answerHtml
  form.explanationHtml = extracted.explanationHtml
  form.choiceMode = extracted.type === 'choice' ? extracted.choiceMode ?? 'fixed' : 'fixed'
  form.optionsHtml = padOptions(extracted.optionsHtml)
  form.correctIndex = extracted.correctIndex ?? 0
}

function resetForm() {
  editingId.value = null
  form.title = ''
  form.type = 'short-answer'
  form.choiceMode = 'fixed'
  form.score = DEFAULT_PERSONAL_BANK_SCORE
  form.stemHtml = ''
  form.answer = ''
  form.answerHtml = ''
  form.explanationHtml = ''
  form.optionsHtml = ['', '', '', '']
  form.correctIndex = 0
}

function openCreateQuestion() {
  resetForm()
  pushBank({ view: 'new' })
}

function openEditQuestion(q: PersonalBankQuestion) {
  fillEditForm(q)
  pushBank({ view: 'edit', qid: q.id })
}

function openQuestionDetail(q: PersonalBankQuestion) {
  pushBank({ view: 'detail', qid: q.id })
}

function saveQuestion() {
  const cat = activeCategory.value
  const sub = activeSub.value
  if (!cat || !sub) return
  try {
    const payload = questionPayload()
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
    pushBank({ replace: true })
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
    applyExtractToForm(variant)
    pushBank({ view: 'new' })
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
    if (detailId.value === q.id) pushBank({ replace: true })
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
  pushBank({ view: 'quiz' })
}

function onQuizExit() {
  reload()
  goBackOr(router, { name: 'bank-sub', params: route.params })
}

function resetPhotoQueue() {
  photoSlots.value = []
  cropIndex.value = 0
  photoBusy.value = false
}

function openPhotoSort() {
  resetPhotoQueue()
  pushBank({ view: 'photo', photoTarget: 'full', photoIntent: 'recognize' })
}

function openFieldPhoto(field: PersonalBankPhotoField) {
  resetPhotoQueue()
  pushBank({
    view: 'photo',
    photoTarget: field,
    photoIntent: 'recognize',
    qid: editingId.value,
  })
}

function openFieldUpload(field: PersonalBankPhotoField) {
  resetPhotoQueue()
  pushBank({
    view: 'photo',
    photoTarget: field,
    photoIntent: 'upload',
    qid: editingId.value,
  })
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
    const wasEmpty = photoSlots.value.length === 0
    const room = PERSONAL_BANK_PHOTO_MAX - photoSlots.value.length
    const added = urls.slice(0, Math.max(0, room)).map((original) => ({ original, cropped: null }))
    if (!added.length) {
      ElMessage.warning(`最多 ${PERSONAL_BANK_PHOTO_MAX} 张`)
      return
    }
    photoSlots.value = [...photoSlots.value, ...added]
    if (wasEmpty) cropIndex.value = 0
    else if (photoSlots.value[cropIndex.value]?.cropped) {
      const firstNew = photoSlots.value.findIndex((s) => !s.cropped)
      if (firstNew >= 0) cropIndex.value = firstNew
    }
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
      resetPhotoQueue()
      pushBank({
        view: editingId.value ? 'edit' : 'new',
        qid: editingId.value,
        replace: true,
      })
      ElMessage.success('已插入照片，可再编辑')
      return
    }
    if (photoTarget.value === 'full') {
      const extractedList = await extractPersonalBankQuestionsFromPhoto(urls)
      const cat = activeCategory.value
      const sub = activeSub.value
      resetPhotoQueue()
      if (extractedList.length === 1) {
        resetForm()
        applyExtractToForm(extractedList[0]!)
        pushBank({ view: 'new', replace: true })
        ElMessage.success('已填入题目，请核对后保存')
        return
      }
      if (!cat || !sub) throw new Error('请先进入一个小类')
      let saved = 0
      for (const row of extractedList) {
        try {
          createPersonalBankQuestion(cat.id, sub.id, row)
          saved += 1
        } catch {
          /* skip invalid */
        }
      }
      reload()
      if (!saved) throw new Error('识别到多题，但都无法保存，请重试或改拍')
      pushBank({ replace: true })
      ElMessage.success(`已识别并保存 ${saved} 题，请在列表里逐题核对`)
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
    } else {
      if (form.type === 'choice') {
        form.answerHtml = extracted.html
        form.answer = extracted.text
        if (form.choiceMode === 'fixed') {
          form.optionsHtml[form.correctIndex] = extracted.html
        }
      } else {
        form.answer = extracted.text
        form.answerHtml = ''
      }
      if (extracted.explanationHtml) form.explanationHtml = extracted.explanationHtml
    }
    resetPhotoQueue()
    pushBank({
      view: editingId.value ? 'edit' : 'new',
      qid: editingId.value,
      replace: true,
    })
    ElMessage.success(
      field === 'answer' && extracted.explanationHtml ? '已填入答案和解析，请核对' : '已填入识别结果，请核对',
    )
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '识别失败')
  } finally {
    photoBusy.value = false
  }
}

function onCropConfirm(dataUrl: string) {
  const slot = photoSlots.value[cropIndex.value]
  if (!slot) return
  slot.cropped = dataUrl
  const nextUncropped = photoSlots.value.findIndex((s, i) => i > cropIndex.value && !s.cropped)
  if (nextUncropped >= 0) {
    cropIndex.value = nextUncropped
    return
  }
  const earlier = photoSlots.value.findIndex((s) => !s.cropped)
  if (earlier >= 0) {
    cropIndex.value = earlier
    return
  }
  if (photoSlots.value.length === 1) void startPhotoRecognize()
}

function recaptureCurrent() {
  if (!photoSlots.value.length) return
  photoSlots.value = photoSlots.value.filter((_, i) => i !== cropIndex.value)
  if (cropIndex.value >= photoSlots.value.length) cropIndex.value = Math.max(0, photoSlots.value.length - 1)
}

function selectPhotoSlot(index: number) {
  if (index < 0 || index >= photoSlots.value.length) return
  cropIndex.value = index
}

function shiftPhotoSlot(delta: number) {
  const i = cropIndex.value
  const j = i + delta
  if (j < 0 || j >= photoSlots.value.length) return
  const next = [...photoSlots.value]
  const tmp = next[i]!
  next[i] = next[j]!
  next[j] = tmp
  photoSlots.value = next
  cropIndex.value = j
}

async function startPhotoRecognize() {
  const urls = photoSlots.value.map((s) => s.cropped).filter((u): u is string => !!u)
  if (!urls.length) {
    ElMessage.warning('请先裁切照片')
    return
  }
  if (!allPhotosCropped.value) {
    ElMessage.warning('还有未裁切的照片。不需要的请先去掉，再开始识别。')
    return
  }
  await finishCroppedPhotos(urls)
}

function openMoveQuestion(q: PersonalBankQuestion) {
  moveQuestion.value = q
  moveCategoryId.value = activeCategoryId.value ?? ''
  moveSubId.value = activeSubId.value ?? ''
  moveOpen.value = true
}

async function confirmMoveQuestion() {
  const q = moveQuestion.value
  const cat = activeCategory.value
  const sub = activeSub.value
  if (!q || !cat || !sub) return
  if (!moveCategoryId.value || !moveSubId.value) {
    ElMessage.warning('请选择目标大类和小类')
    return
  }
  try {
    movePersonalBankQuestion(cat.id, sub.id, q.id, moveCategoryId.value, moveSubId.value)
    moveOpen.value = false
    moveQuestion.value = null
    reload()
    pushBank({ replace: true })
    ElMessage.success('已调整到新的分类')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '调整失败')
  }
}
</script>

<template>
  <section class="personal-bank-page">
    <div v-if="!viewingSub" class="personal-bank-body">
      <div class="personal-bank-toolbar">
        <el-button type="primary" @click="onCreateCategory">新建大类</el-button>
        <el-button :disabled="!canExport" @click="openExport">导出 Word</el-button>
      </div>
      <p v-if="!categories.length" class="personal-bank-empty">
        还没有大类。先新建大类，再在大类里新建小类；大小类都有之后，才能点进小类放题目。
      </p>
      <nav v-else class="pb-nav" aria-label="题库分类">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="pb-nav-cat"
          :class="{ 'is-open': openCategoryId === cat.id }"
        >
          <div class="pb-nav-cat__row">
            <button type="button" class="pb-nav-cat__btn" @click="toggleCategory(cat)">
              <el-icon class="pb-nav-cat__caret" :size="14"><ArrowRight /></el-icon>
              <span class="pb-nav-cat__name">{{ cat.name }}</span>
              <span class="pb-nav-cat__meta">{{ cat.subs.length }} 个小类 · {{ categoryQuestionCount(cat) }} 题</span>
            </button>
            <el-dropdown trigger="click" @command="categoryCommandHandler(cat)">
              <button type="button" class="pb-nav-more" aria-label="大类操作" @click.stop>
                <el-icon :size="16"><MoreFilled /></el-icon>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">修改名称</el-dropdown-item>
                  <el-dropdown-item command="add-sub">新建小类</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除大类</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <ul v-if="openCategoryId === cat.id" class="pb-nav-subs">
            <li v-if="!cat.subs.length" class="pb-nav-subs__empty">还没有小类，点右侧 ··· 新建。</li>
            <li v-for="sub in cat.subs" :key="sub.id" class="pb-nav-sub">
              <button type="button" class="pb-nav-sub__btn" @click="openSub(cat, sub.id)">
                <span class="pb-nav-sub__name">{{ sub.name }}</span>
                <span class="pb-nav-sub__count">{{ sub.questions.length }}</span>
              </button>
              <el-dropdown trigger="click" @command="subCommandHandler(cat, sub.id, sub.name)">
                <button type="button" class="pb-nav-more pb-nav-more--sub" aria-label="小类操作" @click.stop>
                  <el-icon :size="14"><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="rename">修改</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </li>
          </ul>
        </div>
      </nav>
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
              ? '可一次拍多张或从相册多选。按顺序排好后逐张裁切，再插入富文本。也可在编辑器里直接粘贴图片。'
              : photoTarget === 'full'
                ? '可一次拍多张或从相册多选。多张会按顺序联动：同一题的上下页会拼在一起，一页多题会拆成多道。裁切完再点开始识别。'
                : '可一次拍多张或从相册多选。多张按顺序拼成这一栏；拍答案时若画面里还有解析，会一并填入解析。'
          }}
          <template v-if="photoIntent === 'recognize'">
            只认印刷试题文字，忽略手写批注、圈画和旁边无关文字。题号（如 1.）不会写入题干。
          </template>
        </p>
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button type="primary" @click="cameraInputRef?.click()">拍照</el-button>
          <el-button @click="albumInputRef?.click()">相册（可多选）</el-button>
        </div>
      </template>
      <div v-else class="pb-photo-stage">
        <p class="personal-bank-lead">
          第 {{ cropIndex + 1 }} / {{ photoSlots.length }} 张
          <template v-if="currentPhotoCropped"> · 已裁切</template>
          · 已裁 {{ croppedPhotoCount }}/{{ photoSlots.length }}
        </p>
        <div class="pb-photo-strip" aria-label="照片顺序">
          <button
            v-for="(slot, i) in photoSlots"
            :key="`${i}-${slot.original.slice(-12)}`"
            type="button"
            class="pb-photo-strip__item"
            :class="{
              'is-active': i === cropIndex,
              'is-done': !!slot.cropped,
            }"
            @click="selectPhotoSlot(i)"
          >
            <img :src="slot.cropped || slot.original" alt="">
            <span>{{ i + 1 }}</span>
          </button>
        </div>
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button size="small" :disabled="cropIndex <= 0" @click="selectPhotoSlot(cropIndex - 1)">
            上一张
          </el-button>
          <el-button
            size="small"
            :disabled="cropIndex >= photoSlots.length - 1"
            @click="selectPhotoSlot(cropIndex + 1)"
          >
            下一张
          </el-button>
          <el-button size="small" :disabled="cropIndex <= 0" @click="shiftPhotoSlot(-1)">左移</el-button>
          <el-button
            size="small"
            :disabled="cropIndex >= photoSlots.length - 1"
            @click="shiftPhotoSlot(1)"
          >
            右移
          </el-button>
        </div>
        <ImageCropPanel
          :key="`${cropIndex}-${photoSrc.slice(0, 24)}`"
          :src="photoSrc"
          :confirm-label="currentPhotoCropped ? '重新裁切' : '确认裁切'"
          @confirm="onCropConfirm"
          @recapture="recaptureCurrent"
        />
        <div class="personal-bank-toolbar personal-bank-toolbar--row">
          <el-button
            size="small"
            :disabled="photoSlots.length >= PERSONAL_BANK_PHOTO_MAX"
            @click="cameraInputRef?.click()"
          >
            再拍一张
          </el-button>
          <el-button
            size="small"
            :disabled="photoSlots.length >= PERSONAL_BANK_PHOTO_MAX"
            @click="albumInputRef?.click()"
          >
            再加一张
          </el-button>
          <el-button
            type="primary"
            :disabled="!allPhotosCropped || photoBusy"
            :loading="photoBusy"
            @click="startPhotoRecognize"
          >
            {{ photoIntent === 'upload' ? '插入照片' : '开始识别' }}
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
          form.type === 'choice' && form.choiceMode === 'fixed'
            ? '定项选择题：把卷面 A/B/C/D 选项原样录入，测验时不再改选项。'
            : form.type === 'choice'
              ? '非定项选择题：只写正确项，测验时由 AI 生成另外三个选项。'
              : '简答题提交后对照参考答案，再自行评分。'
        }}
        题目、答案、解析可拍照识别；拍答案时若带解析会一并填入。题目/解析也可拍照上传或直接粘贴图片。
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
            <el-form-item v-if="form.type === 'choice'" label="选项方式" required>
              <el-radio-group v-model="form.choiceMode">
                <el-radio-button
                  v-for="m in PERSONAL_BANK_CHOICE_MODES"
                  :key="m.id"
                  :value="m.id"
                >
                  {{ m.label }}
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
          <template v-if="form.type === 'choice' && form.choiceMode === 'fixed'">
            <p class="pb-q-option-hint">
              勾选正确项。选项按 A–D 原样保存。
              <el-button size="small" type="primary" plain @click.stop.prevent="openFieldPhoto('answer')">
                拍照识别答案
              </el-button>
            </p>
            <el-form-item
              v-for="(letter, idx) in CHOICE_OPTION_LETTERS"
              :key="letter"
              :required="idx < 2"
            >
              <template #label>
                <div class="pb-q-field-head">
                  <label class="pb-q-option-correct">
                    <input v-model.number="form.correctIndex" type="radio" :value="idx">
                    {{ letter }}. 正确项
                  </label>
                </div>
              </template>
              <RichTextEditor
                v-model="form.optionsHtml[idx]"
                min-height="72px"
                :placeholder="`${letter} 选项`"
              />
            </el-form-item>
          </template>
          <el-form-item v-else-if="form.type === 'choice'" required>
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
        {{ personalBankQuestionTypeLabel(detailQuestion.type, personalBankChoiceModeOf(detailQuestion)) }} · {{ detailQuestion.score }} 分 · 已测验
        {{ detailQuestion.quizCount }} 次
      </p>
      <section class="pb-q-block">
        <h3 class="pb-q-detail__label">题目</h3>
        <RichTextView :html="detailQuestion.stemHtml" />
      </section>
      <section class="pb-q-block">
        <h3 class="pb-q-detail__label">答案</h3>
        <template v-if="detailQuestion.type === 'choice' && personalBankChoiceModeOf(detailQuestion) === 'fixed'">
          <ol class="pb-q-detail__options">
            <li
              v-for="(opt, idx) in detailQuestion.optionsHtml"
              :key="idx"
              :class="{ 'is-correct': idx === detailQuestion.correctIndex }"
            >
              <RichTextView :html="opt" />
            </li>
          </ol>
        </template>
        <RichTextView
          v-else-if="detailQuestion.type === 'choice'"
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
        <el-button @click="openMoveQuestion(detailQuestion)">调整分类</el-button>
        <el-button @click="openEditQuestion(detailQuestion)">修改</el-button>
        <el-button type="danger" plain @click="onDeleteQuestion(detailQuestion)">删除</el-button>
      </div>
    </div>

    <div v-else class="personal-bank-body">
      <div class="personal-bank-toolbar personal-bank-toolbar--row">
        <el-button type="primary" @click="openCreateQuestion">新建题目</el-button>
        <el-button type="primary" plain @click="openPhotoSort">拍照整理</el-button>
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
        还没有题目。可建简答题、定项选择题（选项固定）或非定项选择题（测验时再生成干扰项）。拍照整理一次可识别多道题。
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
            <el-button size="small" @click="openMoveQuestion(q)">调整分类</el-button>
            <el-button size="small" @click="openEditQuestion(q)">修改</el-button>
            <el-button size="small" type="danger" plain @click="onDeleteQuestion(q)">删除</el-button>
          </div>
        </li>
      </ul>
    </div>

    <el-dialog
      v-model="exportOpen"
      title="导出 Word"
      width="min(92vw, 480px)"
      :close-on-click-modal="!exportBusy"
      :close-on-press-escape="!exportBusy"
      :show-close="!exportBusy"
    >
      <p class="pb-export__hint">勾选要导出的大类 / 小类，导出为 Word（.docx）。整库 JSON 请用右上角「导出」。定项选择题用原选项；非定项会先用豆包补干扰项。</p>
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

    <el-dialog v-model="moveOpen" title="调整分类" width="min(92vw, 420px)">
      <p class="pb-export__hint">把本题挪到另一个大类 / 小类。</p>
      <el-form label-position="top">
        <el-form-item label="大类">
          <el-select v-model="moveCategoryId" placeholder="选择大类" style="width: 100%" @change="moveSubId = ''">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="小类">
          <el-select v-model="moveSubId" placeholder="选择小类" style="width: 100%">
            <el-option v-for="s in moveSubOptions" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveOpen = false">取消</el-button>
        <el-button type="primary" @click="confirmMoveQuestion">确定</el-button>
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

.pb-nav {
  overflow: hidden;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(15 23 42 / 6%);
}

.pb-nav-cat + .pb-nav-cat {
  border-top: 1px solid #eef2f7;
}

.pb-nav-cat__row {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #f8fafc;
}

.pb-nav-cat.is-open .pb-nav-cat__row {
  background: #eff6ff;
}

.pb-nav-cat__btn {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  margin: 0;
  padding: 8px 8px 8px 12px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.pb-nav-cat__caret {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.15s ease;
}

.pb-nav-cat.is-open .pb-nav-cat__caret {
  transform: rotate(90deg);
  color: #2563eb;
}

.pb-nav-cat__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pb-nav-cat__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: #64748b;
}

.pb-nav-more {
  appearance: none;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  margin: 0 6px 0 0;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pb-nav-more:hover {
  background: #fff;
  color: #0f172a;
}

.pb-nav-more--sub {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
}

.pb-nav-subs {
  margin: 0;
  padding: 4px 0 8px;
  list-style: none;
  background: #fff;
  border-top: 1px solid #e8eef5;
}

.pb-nav-subs__empty {
  padding: 12px 16px 10px 36px;
  font-size: 13px;
  color: #64748b;
}

.pb-nav-sub {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 4px;
}

.pb-nav-sub__btn {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin: 0;
  padding: 6px 8px 6px 36px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.pb-nav-sub__btn:hover {
  background: #f8fafc;
}

.pb-nav-sub__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 15px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pb-nav-sub__count {
  flex-shrink: 0;
  min-width: 1.6rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 750;
  text-align: center;
}

.personal-bank-qs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
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

.pb-photo-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 10px;
  margin-bottom: 6px;
}

.pb-photo-strip__item {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 2px solid var(--app-border, #d0d5dd);
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
  cursor: pointer;
}

.pb-photo-strip__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-photo-strip__item span {
  position: absolute;
  left: 4px;
  bottom: 3px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 70%);
}

.pb-photo-strip__item.is-active {
  border-color: var(--el-color-primary);
}

.pb-photo-strip__item.is-done::after {
  content: '✓';
  position: absolute;
  right: 3px;
  top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #bbf7d0;
}

.pb-q-option-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.pb-q-option-correct {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pb-q-detail__options {
  margin: 0;
  padding-left: 1.2em;
}

.pb-q-detail__options li {
  margin: 0 0 8px;
}

.pb-q-detail__options li.is-correct {
  font-weight: 700;
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
