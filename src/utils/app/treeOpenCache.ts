/** 讲义目录展开状态：离开文档再回来时还停在原来的分类。 */

const PREFIX = 'qmea-tree-open:'

export function readTreeOpenIds(scope: string): string[] {
  try {
    const raw = sessionStorage.getItem(PREFIX + scope)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map((id) => String(id || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

export function readTreeScroll(scope: string): number {
  const n = Number(sessionStorage.getItem(PREFIX + scope + ':scroll') || 0)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function writeTreeOpenState(scope: string, expanded: Record<string, boolean>, scrollTop = 0) {
  const ids = Object.keys(expanded).filter((id) => expanded[id])
  sessionStorage.setItem(PREFIX + scope, JSON.stringify(ids))
  sessionStorage.setItem(PREFIX + scope + ':scroll', String(Math.max(0, Math.round(scrollTop))))
}
