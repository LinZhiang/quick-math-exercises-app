import type { FrontendTreeNode } from '@/utils/frontend/frontendLearning'
import type { StoredFrontendQuizRecord } from '@/utils/frontend/frontendHandoutQuizStorage'

export type FrontendQuizBookTreeNode = {
  id: string
  name: string
  kind: 'branch' | 'entry'
  ownRecords: StoredFrontendQuizRecord[]
  totalCount: number
  children: FrontendQuizBookTreeNode[]
}

export type FrontendQuizBookRow = {
  id: string
  name: string
  kind: 'branch' | 'entry'
  depth: number
  expandable: boolean
  totalCount: number
}

function rangeId(id: string) {
  return id.startsWith('range:') ? id.slice(6) : ''
}

function recordMatchesId(row: StoredFrontendQuizRecord, id: string): boolean {
  if (row.itemId === id) return true
  if (rangeId(row.itemId) === id) return true
  return false
}

export function frontendQuizRecordDateKey(row: StoredFrontendQuizRecord): string {
  const iso = row.updatedAt || row.savedAt || ''
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function filterFrontendQuizBookRecords(
  rows: StoredFrontendQuizRecord[],
  opts?: { wrongCount?: number; dateKey?: string },
): StoredFrontendQuizRecord[] {
  return rows.filter((row) => {
    if (opts?.wrongCount != null && Math.max(1, row.wrongCount ?? 1) !== opts.wrongCount) return false
    if (opts?.dateKey && frontendQuizRecordDateKey(row) !== opts.dateKey) return false
    return true
  })
}

export function collectFrontendQuizBookRecords(node: FrontendQuizBookTreeNode): StoredFrontendQuizRecord[] {
  const seen = new Set<string>()
  const out: StoredFrontendQuizRecord[] = []
  const walk = (n: FrontendQuizBookTreeNode) => {
    for (const row of n.ownRecords) {
      if (seen.has(row.fingerprint)) continue
      seen.add(row.fingerprint)
      out.push(row)
    }
    for (const child of n.children) walk(child)
  }
  walk(node)
  return out
}

export function findFrontendQuizBookNode(
  nodes: FrontendQuizBookTreeNode[],
  id: string,
): FrontendQuizBookTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = findFrontendQuizBookNode(node.children, id)
    if (hit) return hit
  }
  return null
}

export function flattenFrontendQuizBookRows(
  nodes: FrontendQuizBookTreeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
): FrontendQuizBookRow[] {
  const rows: FrontendQuizBookRow[] = []
  for (const node of nodes) {
    const expandable = node.children.length > 0
    rows.push({
      id: node.id,
      name: node.name,
      kind: node.kind,
      depth,
      expandable,
      totalCount: node.totalCount,
    })
    if (!expandable || !expanded[node.id]) continue
    rows.push(...flattenFrontendQuizBookRows(node.children, expanded, depth + 1))
  }
  return rows
}

export function defaultExpandedQuizBookIds(nodes: FrontendQuizBookTreeNode[]): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const node of nodes) {
    if (node.children.length) out[node.id] = true
  }
  return out
}

export function buildFrontendQuizBookTree(
  catalog: FrontendTreeNode[],
  records: StoredFrontendQuizRecord[],
): FrontendQuizBookTreeNode[] {
  const used = new Set<string>()

  const take = (id: string): StoredFrontendQuizRecord[] => {
    const hit = records.filter((row) => recordMatchesId(row, id))
    for (const row of hit) used.add(row.fingerprint)
    return hit
  }

  const fromNode = (node: FrontendTreeNode): FrontendQuizBookTreeNode | null => {
    const children: FrontendQuizBookTreeNode[] = []
    for (const child of node.children) {
      const next = fromNode(child)
      if (next) children.push(next)
    }
    for (const entry of node.entries) {
      const recs = take(entry.id)
      if (!recs.length) continue
      children.push({
        id: entry.id,
        name: entry.title,
        kind: 'entry',
        ownRecords: recs,
        totalCount: recs.length,
        children: [],
      })
    }
    const own = take(node.id)
    const total = own.length + children.reduce((n, c) => n + c.totalCount, 0)
    if (total <= 0) return null
    return {
      id: node.id,
      name: node.name,
      kind: 'branch',
      ownRecords: own,
      totalCount: total,
      children,
    }
  }

  const roots = catalog.map(fromNode).filter((n): n is FrontendQuizBookTreeNode => Boolean(n))
  const orphans = records.filter((row) => !used.has(row.fingerprint))
  if (orphans.length) {
    const byTitle = new Map<string, StoredFrontendQuizRecord[]>()
    for (const row of orphans) {
      const key = row.learningPath?.join(' / ') || row.itemTitle || '未分类'
      const list = byTitle.get(key) ?? []
      list.push(row)
      byTitle.set(key, list)
    }
    const otherChildren: FrontendQuizBookTreeNode[] = [...byTitle.entries()].map(([name, recs]) => ({
      id: `orphan:${name}`,
      name,
      kind: 'entry',
      ownRecords: recs,
      totalCount: recs.length,
      children: [],
    }))
    roots.push({
      id: '__other__',
      name: '其他',
      kind: 'branch',
      ownRecords: [],
      totalCount: orphans.length,
      children: otherChildren,
    })
  }
  return roots
}
