/** 页面级请求控制：超时、刷新/离开时中止，避免接口一直转圈、刷新后空白。 */

let pageCtrl = new AbortController()
let ambientCtrl: AbortController | null = null

function bindAbort(from: AbortSignal, to: AbortController) {
  if (from.aborted) {
    to.abort(from.reason)
    return
  }
  from.addEventListener('abort', () => to.abort(from.reason), { once: true })
}

export function mergeAbortSignals(signals: Array<AbortSignal | undefined | null>): AbortSignal | undefined {
  const list = signals.filter((s): s is AbortSignal => Boolean(s))
  if (!list.length) return undefined
  if (list.length === 1) return list[0]
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(list)
  const ctrl = new AbortController()
  for (const s of list) bindAbort(s, ctrl)
  return ctrl.signal
}

export function timeoutAbortSignal(ms: number): AbortSignal {
  if (ms <= 0) {
    return new AbortController().signal
  }
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  const ctrl = new AbortController()
  window.setTimeout(() => {
    ctrl.abort(new DOMException('TimeoutError', 'TimeoutError'))
  }, ms)
  return ctrl.signal
}

export function pageAbortSignal(): AbortSignal {
  return pageCtrl.signal
}

export function abortPageRequests() {
  if (!pageCtrl.signal.aborted) pageCtrl.abort()
}

export function revivePageRequests() {
  pageCtrl = new AbortController()
}

export function beginAmbientAbort(): AbortSignal {
  ambientCtrl?.abort()
  ambientCtrl = new AbortController()
  return ambientCtrl.signal
}

export function cancelAmbientAbort() {
  ambientCtrl?.abort()
  ambientCtrl = null
}

export function ambientAbortSignal(): AbortSignal | undefined {
  return ambientCtrl?.signal
}

export async function runWithAmbientAbort<T>(signal: AbortSignal, fn: () => Promise<T>): Promise<T> {
  const prev = ambientCtrl
  const wrap = new AbortController()
  bindAbort(signal, wrap)
  ambientCtrl = wrap
  try {
    return await fn()
  } finally {
    ambientCtrl = prev
  }
}

export function isAbortError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const name = (e as { name?: string }).name
  return name === 'AbortError' || name === 'TimeoutError' || name === 'CancelledError'
}

/** 普通接口默认 25s；保存 60s；AI 另设更长。刷新/离开会立刻中止。 */
export function appFetchSignal(extra?: AbortSignal | null, timeoutMs = 25000): AbortSignal | undefined {
  const timeout = timeoutMs > 0 ? timeoutAbortSignal(timeoutMs) : undefined
  return mergeAbortSignals([pageAbortSignal(), ambientAbortSignal(), extra, timeout])
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', abortPageRequests)
  window.addEventListener('beforeunload', abortPageRequests)
  window.addEventListener('pageshow', (ev) => {
    if (ev.persisted) revivePageRequests()
  })
}
