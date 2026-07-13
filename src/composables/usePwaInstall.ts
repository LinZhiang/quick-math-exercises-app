import { onMounted, ref, type Ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const canInstall: Ref<boolean> = ref(false)
const showIosHint: Ref<boolean> = ref(false)
const installed: Ref<boolean> = ref(false)
const isAndroid: Ref<boolean> = ref(false)
const isChromeLike: Ref<boolean> = ref(false)

let deferred: BeforeInstallPromptEvent | null = null
let listenersBound = false

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent
  return /iPhone|iPad|iPod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
}

function detectAndroid(): boolean {
  return /Android/i.test(window.navigator.userAgent)
}

function detectChromeLike(): boolean {
  const ua = window.navigator.userAgent
  return /Chrome|CriOS|Edg|SamsungBrowser/i.test(ua) && !/OPR\//i.test(ua)
}

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
  canInstall.value = true
}

function onAppInstalled() {
  installed.value = true
  canInstall.value = false
  deferred = null
}

function ensureListeners() {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true
  installed.value = isStandaloneDisplay()
  isAndroid.value = detectAndroid()
  isChromeLike.value = detectChromeLike()
  if (installed.value) return
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
  if (isIosSafari()) {
    showIosHint.value = true
  }
}

export function usePwaInstall() {
  onMounted(() => {
    ensureListeners()
  })

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    ensureListeners()
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      canInstall.value = false
      deferred = null
    }
    return choice.outcome
  }

  return {
    canInstall,
    showIosHint,
    installed,
    isAndroid,
    isChromeLike,
    promptInstall,
  }
}

/** 尽早绑定，避免首屏错过 beforeinstallprompt */
if (typeof window !== 'undefined') {
  ensureListeners()
}
