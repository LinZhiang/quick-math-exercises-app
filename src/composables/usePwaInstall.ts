import { onMounted, onBeforeUnmount, ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

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

export function usePwaInstall() {
  const canInstall = ref(false)
  const showIosHint = ref(false)
  const installed = ref(isStandaloneDisplay())
  let deferred: BeforeInstallPromptEvent | null = null

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

  onMounted(() => {
    if (installed.value) return
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    if (isIosSafari() && !installed.value) {
      showIosHint.value = true
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
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
    promptInstall,
  }
}
