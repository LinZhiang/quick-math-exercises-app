/**
 * 错题本全屏层（工作区 / 预览）共用的 body 滚动锁，避免多层叠加时 overflow 被永久锁死。
 */
let lockCount = 0
let savedOverflow = ''

export function acquireWrongBookOverlayLock() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

export function releaseWrongBookOverlayLock() {
  if (typeof document === 'undefined') return
  if (lockCount <= 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    savedOverflow = ''
  }
}

export function resetWrongBookOverlayLock() {
  if (typeof document === 'undefined') return
  lockCount = 0
  document.body.style.overflow = savedOverflow
  savedOverflow = ''
}
