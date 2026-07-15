/**
 * 语文练习答错暂存：点「下一题」才写入错题本；点「粗心答错」则跳过写入。
 */
export function createChineseWrongBookGate<T extends { fingerprint: string }>(
  upsertWrong: (q: T) => void,
) {
  let pendingWrong: T | null = null
  let skipPending = false

  function noteWrongAnswer(q: T) {
    pendingWrong = q
    skipPending = false
  }

  function markCarelessWrong(): boolean {
    if (!pendingWrong) return false
    skipPending = true
    pendingWrong = null
    return true
  }

  function flushWrongIfNeeded() {
    if (pendingWrong && !skipPending) {
      try {
        upsertWrong(pendingWrong)
      } catch {
        throw new Error('错题保存失败')
      }
    }
    pendingWrong = null
    skipPending = false
  }

  function clearWrongGate() {
    pendingWrong = null
    skipPending = false
  }

  function hasPendingWrong(): boolean {
    return pendingWrong != null && !skipPending
  }

  function isCarelessMarked(): boolean {
    return skipPending && pendingWrong == null
  }

  return {
    noteWrongAnswer,
    markCarelessWrong,
    flushWrongIfNeeded,
    clearWrongGate,
    hasPendingWrong,
    isCarelessMarked,
  }
}
