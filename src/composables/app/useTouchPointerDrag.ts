import { onBeforeUnmount, onMounted, ref } from 'vue'

const MOBILE_WIDTH_PX = 900

function detectTouchPrimary(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches
  const narrow = window.innerWidth <= MOBILE_WIDTH_PX
  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  return coarse || noHover || (hasTouch && narrow)
}

function detectCompactLayout(): boolean {
  if (typeof window === 'undefined') return false
  return detectTouchPrimary() || window.innerWidth <= MOBILE_WIDTH_PX
}

/**
 * isTouchPrimary：触摸为主设备；isCompactLayout：使用手机点击布局（含窄屏）
 */
export function useTouchPrimaryDevice() {
  const isTouchPrimary = ref(detectTouchPrimary())
  const isCompactLayout = ref(detectCompactLayout())

  const sync = () => {
    isTouchPrimary.value = detectTouchPrimary()
    isCompactLayout.value = detectCompactLayout()
  }

  let cleanup: (() => void) | null = null

  onMounted(() => {
    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    const coarseMq = window.matchMedia('(pointer: coarse)')
    const hoverMq = window.matchMedia('(hover: none)')
    coarseMq.addEventListener('change', sync)
    hoverMq.addEventListener('change', sync)
    cleanup = () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      coarseMq.removeEventListener('change', sync)
      hoverMq.removeEventListener('change', sync)
    }
  })

  onBeforeUnmount(() => {
    cleanup?.()
  })

  return { isTouchPrimary, isCompactLayout }
}
