<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, Delete, Download, EditPen, FullScreen, Lock } from '@element-plus/icons-vue'
import { useAppChromeTitle } from '@/composables/app/useAppChrome'
import { goBackOr, omitQueryKey } from '@/utils/app/appNavigation'
import ImageCropPanel from '@/components/ImageCropPanel.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import RichTextView from '@/components/RichTextView.vue'
import {
  frontendContentToEditorHtml,
  frontendContentToHtml,
  deleteFrontendItem,
  findFrontendEntry,
  listReadyFrontendEntries,
  loadFrontendLearningItem,
  loadFrontendLearningTree,
  setFrontendItemPrivate,
  updateFrontendItem,
  type FrontendHandoutItem,
  type FrontendTreeEntry,
} from '@/utils/frontend/frontendLearning'
import {
  FRONTEND_HANDOUT_PHOTO_MAX,
  extractFrontendHandoutFromPhoto,
} from '@/utils/frontend/frontendHandoutPhotoExtract'
import {
  aiMatchHandoutFormat,
  isHandoutFormatAborted,
} from '@/utils/markdown/aiMatchHandoutFormat'
import { aiRequestProgressText } from '@/utils/app/aiProviderStore'
import { sanitizeRichHtml, handoutHtmlForSave } from '@/utils/markdown/richTextHtml'
import { isWenguAdmin, wenguAuthTick } from '@/utils/computer/wenguAuthStore'
import { logFrontendHandoutView } from '@/utils/frontend/frontendStudyLog'
import FrontendAskPanel from './FrontendAskPanel.vue'
import FrontendBusyHint from './FrontendBusyHint.vue'
import FrontendQuizPanel from './FrontendQuizPanel.vue'
import HandoutExportDialog from '@/components/HandoutExportDialog.vue'

type PhotoSlot = { original: string; cropped: string | null }
type PhotoIntent = 'recognize' | 'upload'

const route = useRoute()
const router = useRouter()
const fullscreen = ref(false)
const quizOpen = ref(false)
const exportOpen = ref(false)
const loading = ref(true)
const error = ref('')
const item = ref<FrontendHandoutItem | null>(null)
const readyList = ref<FrontendTreeEntry[]>([])

const itemId = computed(() => String(route.params.itemId ?? ''))
const navIndex = computed(() => readyList.value.findIndex((e) => e.id === itemId.value))
const isAdmin = computed(() => {
  void wenguAuthTick.value
  return isWenguAdmin()
})
const editing = ref(false)
const draftTitle = ref('')
const draftContent = ref('')
const saving = ref(false)
const privacyBusy = ref(false)
const itemPrivate = ref(true)
const formatBusy = ref(false)
const formatProgressText = ref('')
let formatAbort: AbortController | null = null
let loadAbort: AbortController | null = null
let saveAbort: AbortController | null = null
let photoAbort: AbortController | null = null
const headCollapsed = ref(false)
const editorRef = ref<{ insertNoteTag: () => Promise<void> | void } | null>(null)
const paperRef = ref<HTMLElement | null>(null)

function scrollPaperToTop() {
  paperRef.value?.scrollTo({ top: 0 })
}

const photoIntent = computed<PhotoIntent | ''>(() => {
  if (String(route.query.edit ?? '') !== '1') return ''
  const v = String(route.query.photo ?? '')
  return v === 'upload' || v === 'recognize' ? v : ''
})
const photoOpen = computed(() => Boolean(photoIntent.value) && editing.value)

const photoSlots = ref<PhotoSlot[]>([])
const cropIndex = ref(0)
const photoBusy = ref(false)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)

const photoSrc = computed(() => photoSlots.value[cropIndex.value]?.original ?? '')
const currentPhotoCropped = computed(() => !!photoSlots.value[cropIndex.value]?.cropped)
const croppedPhotoCount = computed(() => photoSlots.value.filter((s) => s.cropped).length)
const allPhotosCropped = computed(
  () => photoSlots.value.length > 0 && photoSlots.value.every((s) => !!s.cropped),
)
const photoBusyText = computed(() =>
  photoIntent.value === 'upload' ? '正在插入照片…' : aiRequestProgressText('识别文字', 'doubao'),
)
const contentBusy = computed(
  () => loading.value || saving.value || formatBusy.value || photoBusy.value,
)
const busyCoverText = computed(() => {
  if (formatBusy.value) return formatProgressText.value || aiRequestProgressText('匹配讲义格式')
  if (photoBusy.value) return photoBusyText.value
  if (saving.value) return '正在保存讲义…'
  return '正在打开讲义…'
})
const busyCoverHint = computed(() => {
  if (formatBusy.value) return '有结构就排样式，没有就按段落处理；可随时中断'
  if (photoBusy.value) {
    return photoIntent.value === 'upload' ? '可随时中断，照片不会插入' : '可随时中断，识别结果不会写入'
  }
  if (saving.value) return '可随时中断，本次不会保存'
  return '可随时中断'
})
const photoCropHint = computed(() =>
  photoIntent.value === 'upload'
    ? '拖动或拉伸选框，只留下要插入讲义的照片。多张会按顺序插入。'
    : '拖动或拉伸选框，只留下要识别的印刷文字。多张会按顺序拼在一起识别。',
)

useAppChromeTitle(
  computed(() => {
    if (photoIntent.value === 'upload') return '拍照上传'
    if (photoIntent.value === 'recognize') return '拍照识别'
    return item.value?.title || '前端学习'
  }),
)

const html = computed(() => (item.value ? frontendContentToHtml(item.value.content) : ''))

function goList() {
  goBackOr(router, { name: 'frontend' })
}

function openExport() {
  if (!item.value) return
  exportOpen.value = true
}

function goNav(dir: -1 | 1) {
  if (contentBusy.value) return
  const next = readyList.value[navIndex.value + dir]
  if (!next) return
  void router.replace({ name: 'frontend-item', params: { itemId: next.id } })
}

async function onTogglePrivate() {
  if (!item.value || !isAdmin.value || contentBusy.value || privacyBusy.value) return
  const next = !itemPrivate.value
  privacyBusy.value = true
  try {
    await setFrontendItemPrivate(item.value.id, next)
    itemPrivate.value = next
    ElMessage.success(next ? '已设为私密，仅管理员可见' : '已对外公开')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '设置失败')
  } finally {
    privacyBusy.value = false
  }
}

function applyEditDraft() {
  if (!item.value || !isAdmin.value) return
  draftTitle.value = item.value.title
  draftContent.value = frontendContentToEditorHtml(item.value.content)
  editing.value = true
}

function startEdit() {
  if (!item.value || !isAdmin.value || contentBusy.value) return
  if (String(route.query.edit ?? '') === '1') {
    applyEditDraft()
    return
  }
  void router.push({
    name: 'frontend-item',
    params: { itemId: itemId.value },
    query: { edit: '1' },
  })
}

function leaveEditQuery() {
  if (String(route.query.edit ?? '') !== '1') {
    editing.value = false
    return
  }
  const back = typeof window !== 'undefined' ? window.history.state?.back : null
  const backUrl = typeof back === 'string' ? back : ''
  const itemPath = `/frontend/item/${itemId.value}`
  const backPath = backUrl.split('?')[0]
  if (backPath.endsWith(itemPath) && !/[?&]edit=/.test(backUrl) && !/[?&]photo=/.test(backUrl)) {
    router.back()
    return
  }
  void router.replace({ name: 'frontend-item', params: { itemId: itemId.value } })
}

function cancelEdit() {
  leaveEditQuery()
}

async function saveEdit() {
  if (!item.value || contentBusy.value) return
  const title = draftTitle.value.trim()
  if (!title) {
    ElMessage.warning('标题不能为空')
    return
  }
  saveAbort?.abort()
  const controller = new AbortController()
  saveAbort = controller
  saving.value = true
  try {
    item.value = await updateFrontendItem(
      item.value.id,
      {
        title,
        content: handoutHtmlForSave(draftContent.value),
      },
      controller.signal,
    )
    ElMessage.success('已保存')
    leaveEditQuery()
  } catch (e) {
    if (isHandoutFormatAborted(e)) {
      ElMessage.info('已中断，本次未保存')
    } else {
      ElMessage.error(e instanceof Error ? e.message : '保存失败')
    }
  } finally {
    saving.value = false
    if (saveAbort === controller) saveAbort = null
  }
}

async function onDeleteCurrent() {
  if (!item.value || !isAdmin.value) return
  try {
    await ElMessageBox.confirm(`确定删除「${item.value.title}」？`, '删除讲义', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteFrontendItem(item.value.id)
    ElMessage.success('已删除')
    goList()
  } catch (e) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

function resetPhotoQueue() {
  photoSlots.value = []
  cropIndex.value = 0
  photoBusy.value = false
}

function openPhoto(intent: PhotoIntent) {
  if (!editing.value || !isAdmin.value) return
  resetPhotoQueue()
  void router.push({
    name: 'frontend-item',
    params: { itemId: itemId.value },
    query: { edit: '1', photo: intent },
  })
}

function abortBusy() {
  loadAbort?.abort()
  saveAbort?.abort()
  photoAbort?.abort()
  formatAbort?.abort()
}

function formatMatchProgressText(p: { current: number; total: number; attempt: number; round: number }) {
  const retry = p.attempt > 1 ? `，第 ${p.attempt} 次` : ''
  const again = p.round > 1 ? `，整篇第 ${p.round} 轮` : ''
  return `${aiRequestProgressText('匹配讲义格式')}（${p.current}/${p.total}${retry}${again}）`
}

async function matchHandoutFormat() {
  if (!editing.value || !isAdmin.value || contentBusy.value) return
  try {
    await ElMessageBox.confirm(
      '将按讲义样式整理标题、列表和代码块，只做排版，不删节。没有标题/列表/代码的段落会按普通正文处理，不反复卡重试。可随时点「中断」停止，原文不动。',
      'AI 自动匹配格式',
      { confirmButtonText: '开始匹配', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  formatAbort?.abort()
  const controller = new AbortController()
  formatAbort = controller
  formatBusy.value = true
  formatProgressText.value = aiRequestProgressText('匹配讲义格式')
  try {
    draftContent.value = await aiMatchHandoutFormat(draftContent.value, {
      signal: controller.signal,
      onProgress: (p) => {
        formatProgressText.value = formatMatchProgressText(p)
      },
    })
    ElMessage.success('已套用讲义格式，可再微调后保存')
  } catch (e) {
    if (isHandoutFormatAborted(e)) {
      ElMessage.info('已中断，原文未改')
    } else {
      ElMessage.error(e instanceof Error ? e.message : '格式匹配失败')
    }
  } finally {
    formatBusy.value = false
    formatProgressText.value = ''
    if (formatAbort === controller) formatAbort = null
  }
}

function leavePhoto() {
  const query = omitQueryKey(route.query, 'photo')
  const back = typeof window !== 'undefined' ? window.history.state?.back : null
  const backUrl = typeof back === 'string' ? back : ''
  const itemPath = `/frontend/item/${itemId.value}`
  const backPath = backUrl.split('?')[0]
  if (backPath.endsWith(itemPath) && /[?&]edit=/.test(backUrl) && !/[?&]photo=/.test(backUrl)) {
    router.back()
    return
  }
  void router.replace({
    name: 'frontend-item',
    params: { itemId: itemId.value },
    query,
  })
}

function appendHtml(chunk: string) {
  const next = sanitizeRichHtml(chunk)
  if (!next) return
  const cur = sanitizeRichHtml(draftContent.value)
  draftContent.value = cur ? `${cur}${next}` : next
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
    const room = FRONTEND_HANDOUT_PHOTO_MAX - photoSlots.value.length
    const added = urls.slice(0, Math.max(0, room)).map((original) => ({ original, cropped: null }))
    if (!added.length) {
      ElMessage.warning(`最多 ${FRONTEND_HANDOUT_PHOTO_MAX} 张`)
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

async function finishCroppedPhotos(urls: string[]) {
  photoAbort?.abort()
  const controller = new AbortController()
  photoAbort = controller
  photoBusy.value = true
  try {
    if (photoIntent.value === 'upload') {
      if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError')
      appendHtml(urls.map((u) => `<p><img src="${u}" alt=""></p>`).join(''))
      ElMessage.success('已插入照片，可再编辑')
      leavePhoto()
      return
    }
    const recognized = await extractFrontendHandoutFromPhoto(urls, { signal: controller.signal })
    appendHtml(recognized)
    ElMessage.success('已填入识别结果，请核对')
    leavePhoto()
  } catch (e) {
    if (isHandoutFormatAborted(e)) {
      ElMessage.info('已中断，未写入编辑器')
    } else {
      ElMessage.error(e instanceof Error ? e.message : '识别失败')
    }
  } finally {
    photoBusy.value = false
    if (photoAbort === controller) photoAbort = null
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

let loadSeq = 0
onUnmounted(() => {
  abortBusy()
})
watch(
  itemId,
  async (id) => {
    abortBusy()
    const controller = new AbortController()
    loadAbort = controller
    const seq = ++loadSeq
    loading.value = true
    error.value = ''
    try {
      const [next, tree] = await Promise.all([
        loadFrontendLearningItem(id, false, controller.signal),
        loadFrontendLearningTree(false, controller.signal),
      ])
      if (seq !== loadSeq) return
      item.value = next
      readyList.value = listReadyFrontendEntries(tree)
      itemPrivate.value = Boolean(findFrontendEntry(tree, id)?.entry.private)
      logFrontendHandoutView({
        itemId: next.id,
        itemTitle: next.title,
        learningPath: next.learningPath,
      })
      await nextTick()
      if (seq !== loadSeq) return
      scrollPaperToTop()
    } catch (e) {
      if (seq !== loadSeq) return
      if (isHandoutFormatAborted(e)) {
        ElMessage.info('已中断')
        if (!item.value) goList()
        else if (item.value.id !== id) {
          void router.replace({ name: 'frontend-item', params: { itemId: item.value.id } })
        }
        return
      }
      item.value = null
      error.value = e instanceof Error ? e.message : '未找到该讲义'
      ElMessage.warning(error.value)
      goList()
    } finally {
      if (seq === loadSeq) loading.value = false
      if (loadAbort === controller) loadAbort = null
    }
  },
  { immediate: true },
)

watch(
  () => [item.value?.id, String(route.query.edit ?? ''), isAdmin.value] as const,
  ([id, edit, admin]) => {
    if (id && admin && edit === '1') {
      if (!editing.value) applyEditDraft()
    } else {
      editing.value = false
    }
  },
)

watch(photoOpen, (open) => {
  if (!open) resetPhotoQueue()
})
</script>

<template>
  <section
    v-if="item"
    class="computer-detail"
    :class="{ 'is-full': fullscreen, 'is-quiz': quizOpen && !editing && !photoOpen }"
  >
    <header v-if="!(quizOpen && !editing && !photoOpen)" class="computer-detail__top">
      <p v-if="!headCollapsed && item.learningPath.length" class="computer-detail__crumb">
        {{ item.learningPath.join(' / ') }}
      </p>
      <div class="computer-detail__title-row">
        <h2 v-if="!headCollapsed" class="computer-detail__title">{{ item.title }}</h2>
        <div class="computer-detail__actions">
          <div class="computer-detail__tools">
            <el-tooltip :content="headCollapsed ? '展开标题' : '收起标题'" placement="bottom">
              <el-button
                size="small"
                circle
                :icon="ArrowUp"
                :disabled="contentBusy"
                :class="{ 'is-collapsed': headCollapsed }"
                @click="headCollapsed = !headCollapsed"
              />
            </el-tooltip>
            <el-tooltip :content="fullscreen ? '退出全屏' : '全屏'" placement="bottom">
              <el-button size="small" circle :icon="FullScreen" :disabled="contentBusy" @click="fullscreen = !fullscreen" />
            </el-tooltip>
            <el-tooltip content="导出文档" placement="bottom">
              <el-button size="small" circle :icon="Download" :disabled="contentBusy" @click="openExport" />
            </el-tooltip>
            <el-tooltip v-if="isAdmin && !editing" content="编辑讲义" placement="bottom">
              <el-button size="small" circle type="primary" :icon="EditPen" :disabled="contentBusy" @click="startEdit" />
            </el-tooltip>
            <el-tooltip v-if="isAdmin && !editing" content="删除讲义" placement="bottom">
              <el-button size="small" circle type="danger" plain :icon="Delete" :disabled="contentBusy" @click="onDeleteCurrent" />
            </el-tooltip>
            <el-button
              v-if="isAdmin && !editing"
              size="small"
              :type="itemPrivate ? 'warning' : 'default'"
              :plain="!itemPrivate"
              :icon="Lock"
              :disabled="contentBusy || privacyBusy"
              :loading="privacyBusy"
              @click="onTogglePrivate"
            >
              {{ itemPrivate ? '设为公开' : '设为私密' }}
            </el-button>
            <el-button
              v-if="!editing"
              size="small"
              type="primary"
              plain
              :disabled="contentBusy"
              @click="quizOpen = true"
            >
              AI 测验
            </el-button>
          </div>
          <div v-if="isAdmin && editing && !photoOpen" class="computer-detail__edit-btns">
            <el-button size="small" :disabled="contentBusy" @click="cancelEdit">取消</el-button>
            <el-button size="small" type="primary" :disabled="contentBusy" :loading="saving" @click="saveEdit">保存</el-button>
          </div>
        </div>
      </div>
    </header>

    <div v-if="!editing && !quizOpen" class="computer-detail__pager">
      <el-button size="small" text :disabled="contentBusy || navIndex <= 0" @click="goNav(-1)">‹ 上一条</el-button>
      <span>第 {{ Math.max(navIndex, 0) + 1 }} / {{ readyList.length || 1 }} 条</span>
      <el-button size="small" text :disabled="contentBusy || navIndex < 0 || navIndex >= readyList.length - 1" @click="goNav(1)">
        下一条 ›
      </el-button>
    </div>

    <div
      v-if="quizOpen && !editing && !photoOpen"
      ref="paperRef"
      class="computer-detail__paper computer-detail__quiz"
    >
      <FrontendQuizPanel :item="item" @close="quizOpen = false" />
    </div>
    <article v-else ref="paperRef" class="computer-detail__paper" :class="{ 'is-editing': editing && !photoOpen }">
      <template v-if="photoOpen">
        <template v-if="!photoSrc">
          <p class="computer-photo__lead">
            {{
              photoIntent === 'upload'
                ? '可一次拍多张或从相册多选。按顺序排好后逐张裁切，再插入讲义。也可在编辑器里直接粘贴图片。'
                : '可一次拍多张或从相册多选。多张会按顺序拼成一段讲义文字。只认印刷体，忽略手写批注和旁边无关文字。'
            }}
          </p>
          <div class="computer-photo__toolbar">
            <el-button type="primary" @click="cameraInputRef?.click()">拍照</el-button>
            <el-button @click="albumInputRef?.click()">相册（可多选）</el-button>
          </div>
        </template>
        <div v-else class="computer-photo__stage">
          <p class="computer-photo__lead">
            第 {{ cropIndex + 1 }} / {{ photoSlots.length }} 张
            <template v-if="currentPhotoCropped"> · 已裁切</template>
            · 已裁 {{ croppedPhotoCount }}/{{ photoSlots.length }}
          </p>
          <div class="computer-photo__strip" aria-label="照片顺序">
            <button
              v-for="(slot, i) in photoSlots"
              :key="`${i}-${slot.original.slice(-12)}`"
              type="button"
              class="computer-photo__thumb"
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
          <div class="computer-photo__toolbar">
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
            :hint="photoCropHint"
            :confirm-label="currentPhotoCropped ? '重新裁切' : '确认裁切'"
            @confirm="onCropConfirm"
            @recapture="recaptureCurrent"
          />
          <div class="computer-photo__toolbar">
            <el-button
              size="small"
              :disabled="photoSlots.length >= FRONTEND_HANDOUT_PHOTO_MAX"
              @click="cameraInputRef?.click()"
            >
              再拍一张
            </el-button>
            <el-button
              size="small"
              :disabled="photoSlots.length >= FRONTEND_HANDOUT_PHOTO_MAX"
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
          <div v-if="photoBusy" class="computer-photo__busy">{{ photoBusyText }}</div>
        </div>
        <input
          ref="cameraInputRef"
          class="computer-photo__file"
          type="file"
          accept="image/*"
          capture="environment"
          @change="onPickPhoto"
        >
        <input
          ref="albumInputRef"
          class="computer-photo__file"
          type="file"
          accept="image/*"
          multiple
          @change="onPickPhoto"
        >
      </template>
      <template v-else-if="editing">
        <el-input v-model="draftTitle" maxlength="80" placeholder="标题" />
        <div class="computer-detail__photo-btns">
          <el-button size="small" type="primary" plain :disabled="contentBusy" @click="openPhoto('recognize')">拍照识别</el-button>
          <el-button size="small" :disabled="contentBusy" @click="openPhoto('upload')">拍照上传</el-button>
          <el-button size="small" type="success" plain :disabled="contentBusy" @click="matchHandoutFormat">AI自动匹配格式</el-button>
          <el-button size="small" :disabled="contentBusy" @click="editorRef?.insertNoteTag()">备注</el-button>
        </div>
        <RichTextEditor
          ref="editorRef"
          v-model="draftContent"
          class="computer-detail__editor"
          fill
          notes
          placeholder="输入讲义正文…"
        />
      </template>
      <RichTextView v-else tone="docs" :html="html" />
    </article>
    <FrontendAskPanel v-if="item && !fullscreen && !photoOpen && !quizOpen && !editing" :item="item" />
    <div v-if="contentBusy" class="computer-busy-cover">
      <div class="computer-busy-cover__box">
        <FrontendBusyHint
          :text="busyCoverText"
          :hint="busyCoverHint"
        />
        <el-button type="danger" plain @click="abortBusy">中断</el-button>
      </div>
    </div>
  </section>
  <section v-else-if="loading" class="computer-detail computer-detail--boot">
    <div class="computer-busy-panel">
      <FrontendBusyHint text="正在打开讲义…" hint="可随时中断" />
      <el-button type="danger" plain @click="abortBusy">中断</el-button>
    </div>
  </section>
  <section v-else class="computer-missing">
    <p>{{ error || '未找到该讲义。' }}</p>
    <el-button @click="goList">返回列表</el-button>
  </section>
  <HandoutExportDialog
    v-if="item"
    v-model="exportOpen"
    :title="item.title"
    :markdown="item.content"
    :html="html"
  />
</template>

<style scoped>
.computer-missing,
.computer-detail {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 14px 12px;
  gap: 10px;
}

.computer-detail.is-full {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: #eef2f7;
  padding-top: calc(12px + var(--app-safe-top, 0px));
}

.computer-detail--boot {
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 14px;
  margin: 4px 0;
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.computer-busy-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.computer-busy-cover {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 82%);
}

.computer-busy-cover__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 20px;
  max-width: min(22rem, calc(100% - 24px));
}

.computer-detail__top {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.computer-detail__title-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.computer-detail__crumb {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.computer-detail__title {
  margin: 0;
  min-width: 0;
  width: 100%;
  font-size: 1.28rem;
  font-weight: 800;
}

.computer-detail__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.computer-detail__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.computer-detail__tools :deep(.is-collapsed) {
  transform: rotate(180deg);
}

.computer-detail__edit-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.computer-detail__edit-btns :deep(.el-button) {
  flex: 1 1 0;
}

.computer-detail__pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.computer-detail__paper {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 18px 20px 80px;
  border: 1px solid var(--app-border-soft);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.computer-detail__paper.is-editing {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 12px;
}

.computer-detail.is-quiz {
  padding-top: 8px;
}

.computer-detail__quiz {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.computer-detail__paper.is-editing > :deep(.el-input) {
  flex-shrink: 0;
}

.computer-detail__editor {
  flex: 1 1 0;
  min-height: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.computer-detail__photo-btns {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.computer-photo__lead {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--app-text-muted);
}

.computer-photo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.computer-photo__stage {
  position: relative;
}

.computer-photo__strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 10px;
  margin-bottom: 6px;
}

.computer-photo__thumb {
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

.computer-photo__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.computer-photo__thumb span {
  position: absolute;
  left: 4px;
  bottom: 3px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 70%);
}

.computer-photo__thumb.is-active {
  border-color: var(--el-color-primary);
}

.computer-photo__thumb.is-done::after {
  content: '✓';
  position: absolute;
  right: 3px;
  top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #bbf7d0;
}

.computer-photo__busy {
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
  color: var(--el-color-primary);
}

.computer-photo__file {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

@media (min-width: 901px) {
  .computer-detail {
    padding: 18px 32px 20px;
    gap: 12px;
  }

  .computer-detail__top,
  .computer-detail__pager {
    width: 100%;
    max-width: 56rem;
    margin-inline: auto;
  }

  .computer-detail__paper {
    width: 100%;
    max-width: 56rem;
    margin-inline: auto;
    padding: 28px 40px 80px;
  }

  .computer-detail__quiz {
    max-width: 64rem;
    padding: 16px 20px 18px;
  }

  .computer-detail__title-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .computer-detail__actions {
    width: auto;
    flex: 1 1 16rem;
    margin-left: auto;
  }

  .computer-detail__edit-btns {
    width: auto;
  }

  .computer-detail__edit-btns :deep(.el-button) {
    flex: 0 0 auto;
  }

  .computer-detail__title {
    min-width: 0;
    width: auto;
    flex: 1 1 auto;
    font-size: 1.42rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .computer-detail.is-full .computer-detail__paper {
    max-width: 64rem;
  }
}
</style>
