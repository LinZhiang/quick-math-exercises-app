import { onBeforeUnmount, ref } from 'vue'

/** 是否以触摸为主（手机/平板） */
export function useTouchPrimaryDevice() {
  const isTouchPrimary = ref(false)
  const mq = window.matchMedia('(hover: none) and (pointer: coarse)')

  const sync = () => {
    isTouchPrimary.value = mq.matches
  }

  sync()
  mq.addEventListener('change', sync)
  onBeforeUnmount(() => mq.removeEventListener('change', sync))

  return { isTouchPrimary }
}

type TouchDragSession<T> = {
  payload: T
  pointerId: number
}

/**
 * 触摸端指针拖拽：pointerdown 拾取，move 高亮落点，up 提交。
 * 鼠标仍走 HTML5 drag，避免两套逻辑冲突。
 */
export function useTouchPointerDrag<T>(options: {
  canInteract: () => boolean
  pickDropKey: (clientX: number, clientY: number) => string | null
  onDrop: (payload: T, dropKey: string | null) => void
}) {
  const dragging = ref<T | null>(null)
  const dropKey = ref<string | null>(null)
  let session: TouchDragSession<T> | null = null

  const end = () => {
    session = null
    dragging.value = null
    dropKey.value = null
  }

  const onPointerDown = (payload: T, e: PointerEvent) => {
    if (!options.canInteract()) return
    if (e.pointerType === 'mouse') return
    e.preventDefault()
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    session = { payload, pointerId: e.pointerId }
    dragging.value = payload
    dropKey.value = options.pickDropKey(e.clientX, e.clientY)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!session || e.pointerId !== session.pointerId) return
    e.preventDefault()
    dropKey.value = options.pickDropKey(e.clientX, e.clientY)
  }

  const onPointerUp = (e: PointerEvent) => {
    if (!session || e.pointerId !== session.pointerId) return
    e.preventDefault()
    options.onDrop(session.payload, dropKey.value)
    const el = e.currentTarget as HTMLElement
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    end()
  }

  const onPointerCancel = (e: PointerEvent) => {
    if (!session || e.pointerId !== session.pointerId) return
    end()
  }

  return {
    dragging,
    dropKey,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    end,
  }
}

/** 根据坐标查找带 data-drop-key 的最近落点元素 */
export function pickDropKeyFromPoint(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY)
  if (!el) return null
  const target = el.closest('[data-drop-key]') as HTMLElement | null
  return target?.dataset.dropKey ?? null
}
