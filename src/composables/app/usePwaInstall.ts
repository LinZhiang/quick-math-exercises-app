import { onMounted, ref, type Ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const canInstall: Ref<boolean> = ref(false)
const showIosHint: Ref<boolean> = ref(false)
const installed: Ref<boolean> = ref(false)
const isAndroid: Ref<boolean> = ref(false)
const isIpad: Ref<boolean> = ref(false)
const isIosSafari: Ref<boolean> = ref(false)
const isChromeLike: Ref<boolean> = ref(false)
const isSecure: Ref<boolean> = ref(true)
const pageOrigin: Ref<string> = ref('')

let deferred: BeforeInstallPromptEvent | null = null
let listenersBound = false

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectIpad(): boolean {
  const nav = window.navigator
  const ua = nav.userAgent
  if (/iPad/i.test(ua)) return true
  // iPadOS 13+ 默认桌面 UA，变成 Macintosh，用触控点数区分
  return /Macintosh/i.test(ua) && nav.maxTouchPoints > 1
}

function detectIosSafari(): boolean {
  const ua = window.navigator.userAgent
  const ios = /iPhone|iPad|iPod/i.test(ua) || detectIpad()
  if (!ios) return false
  if (/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua)) return false
  return /Safari/i.test(ua) || (/AppleWebKit/i.test(ua) && !/Chrome|Chromium|Android/i.test(ua))
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
  isIpad.value = detectIpad()
  isIosSafari.value = detectIosSafari()
  isChromeLike.value = detectChromeLike()
  isSecure.value = window.isSecureContext
  pageOrigin.value = window.location.origin
  if (installed.value) return
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
  if (isIosSafari.value) {
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
    isIpad,
    isIosSafari,
    isChromeLike,
    isSecure,
    pageOrigin,
    promptInstall,
  }
}

if (typeof window !== 'undefined') {
  ensureListeners()
}
