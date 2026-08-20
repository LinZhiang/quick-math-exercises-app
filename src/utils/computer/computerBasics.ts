import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'
import { resolveWenguApiUrl } from '@/utils/computer/wenguApiOrigin'
import { getWenguAuthToken, isWenguAdmin } from '@/utils/computer/wenguAuthStore'

export type ComputerEntryType = 'handout' | 'mindmap' | 'general' | 'choice' | 'group' | 'material-group'

export type ComputerTreeEntry = {
  id: string
  title: string
  ready: boolean
  type: ComputerEntryType | string
}

export type ComputerTreeNode = {
  id: string
  name: string
  children: ComputerTreeNode[]
  entries: ComputerTreeEntry[]
}

export type ComputerHandoutItem = {
  id: string
  title: string
  type: 'handout' | string
  learningPath: string[]
  tags: string[]
  content: string
}

export type ComputerTreeRow =
  | {
      kind: 'branch'
      id: string
      name: string
      depth: number
      expandable: boolean
    }
  | {
      kind: 'entry'
      id: string
      depth: number
      entry: ComputerTreeEntry
    }

export function nodeHasBody(node: ComputerTreeNode): boolean {
  return node.children.length > 0 || node.entries.length > 0
}

/** 默认只展开第一层有内容的大类，细节由用户点三角形展开。 */
export function defaultExpandedComputerIds(
  nodes: ComputerTreeNode[],
  maxDepth = 1,
): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  const walk = (list: ComputerTreeNode[], depth: number) => {
    for (const node of list) {
      if (depth < maxDepth && nodeHasBody(node)) out[node.id] = true
      walk(node.children, depth + 1)
    }
  }
  walk(nodes, 0)
  return out
}

export function flattenVisibleComputerRows(
  nodes: ComputerTreeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
): ComputerTreeRow[] {
  const rows: ComputerTreeRow[] = []
  for (const node of nodes) {
    const expandable = nodeHasBody(node)
    rows.push({
      kind: 'branch',
      id: node.id,
      name: node.name,
      depth,
      expandable,
    })
    if (!expandable || !expanded[node.id]) continue
    rows.push(...flattenVisibleComputerRows(node.children, expanded, depth + 1))
    for (const entry of node.entries) {
      rows.push({
        kind: 'entry',
        id: entry.id,
        depth: depth + 1,
        entry,
      })
    }
  }
  return rows
}

export function listReadyComputerEntries(nodes: ComputerTreeNode[]): ComputerTreeEntry[] {
  const out: ComputerTreeEntry[] = []
  const walk = (list: ComputerTreeNode[]) => {
    for (const node of list) {
      for (const e of node.entries) {
        if (e.ready) out.push(e)
      }
      walk(node.children)
    }
  }
  walk(nodes)
  return out
}

/** 只含大类/小类，不含讲义叶子；默认展开前 maxDepth 层。 */
export function defaultExpandedCategoryIds(
  nodes: ComputerTreeNode[],
  maxDepth = 2,
): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  const walk = (list: ComputerTreeNode[], depth: number) => {
    for (const node of list) {
      if (depth < maxDepth - 1 && node.children.length > 0) out[node.id] = true
      walk(node.children, depth + 1)
    }
  }
  walk(nodes, 0)
  return out
}

export function collectExpandableComputerIds(nodes: ComputerTreeNode[]): string[] {
  const ids: string[] = []
  const walk = (list: ComputerTreeNode[]) => {
    for (const node of list) {
      if (nodeHasBody(node)) ids.push(node.id)
      walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

export function rewriteComputerMediaUrls(md: string): string {
  return String(md || '')
    .replace(/\]\((\/api\/media\/[^)]+)\)/g, (_all, p: string) => `](${resolveWenguApiUrl(p)})`)
    .replace(/(src=["'])(\/api\/media\/[^"']+)/g, (_all, pre: string, p: string) => `${pre}${resolveWenguApiUrl(p)}`)
}

export function stripHandoutImagesForAi(md: string): string {
  return md
    .replace(/!\[[^\]]*]\([^)]+\)/g, '（图）')
    .replace(/<img\b[^>]*>/gi, '（图）')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 12000)
}

export function isComputerHtmlContent(raw: string): boolean {
  const t = (raw ?? '').trim()
  return /<[a-z][\s\S]*>/i.test(t)
}

export function computerContentToHtml(raw: string): string {
  const t = (raw ?? '').trim()
  if (!t) return ''
  if (isComputerHtmlContent(t)) return sanitizeRichHtml(t)
  return markdownToDisplaySafeHtml(t)
}

let treeCache: ComputerTreeNode[] | null = null
const itemCache = new Map<string, ComputerHandoutItem>()

export function clearComputerBasicsCache() {
  treeCache = null
  itemCache.clear()
}

async function computerAdminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getWenguAuthToken()
  if (!token) throw new Error('请先用管理员账号登录')
  if (!isWenguAdmin()) throw new Error('需要管理员权限')
  const res = await wenguApiFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const data = await readWenguJsonResponse<{
    ok?: boolean
    message?: string
    error?: { message?: string }
  } & T>(res)
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || data.error?.message || `请求失败（${res.status}）`)
  }
  return data
}

export async function createComputerNode(input: { name: string; parentId?: string | null }) {
  const data = await computerAdminFetch<{ node: ComputerTreeNode }>('/api/computer-basics/nodes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  clearComputerBasicsCache()
  return data.node
}

export async function renameComputerNode(id: string, name: string) {
  await computerAdminFetch(`/api/computer-basics/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  clearComputerBasicsCache()
}

export async function deleteComputerNode(id: string) {
  await computerAdminFetch(`/api/computer-basics/nodes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  clearComputerBasicsCache()
}

export async function createComputerItem(input: {
  parentId: string
  title: string
  content?: string
  type?: string
}) {
  const data = await computerAdminFetch<{ item: ComputerHandoutItem }>('/api/computer-basics/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  clearComputerBasicsCache()
  return data.item
}

export async function updateComputerItem(id: string, patch: { title?: string; content?: string }) {
  const data = await computerAdminFetch<{ item: ComputerHandoutItem }>(
    `/api/computer-basics/items/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
  clearComputerBasicsCache()
  return {
    ...data.item,
    content: rewriteComputerMediaUrls(data.item.content ?? ''),
  }
}

export async function deleteComputerItem(id: string) {
  await computerAdminFetch(`/api/computer-basics/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  clearComputerBasicsCache()
}

export type ComputerFolderOption = { id: string; label: string }

function collectDescendantIds(node: ComputerTreeNode, out: Set<string> = new Set()): Set<string> {
  out.add(node.id)
  for (const child of node.children) collectDescendantIds(child, out)
  return out
}

export function listComputerFolderOptions(
  tree: ComputerTreeNode[],
  excludeIds: Iterable<string> = [],
): ComputerFolderOption[] {
  const skip = new Set(excludeIds)
  const out: ComputerFolderOption[] = []
  const walk = (nodes: ComputerTreeNode[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.name]
      if (!skip.has(node.id)) out.push({ id: node.id, label: path.join(' / ') })
      walk(node.children, path)
    }
  }
  walk(tree, [])
  return out
}

export function computerNodeExcludeSet(tree: ComputerTreeNode[], id: string): Set<string> {
  const hit = findComputerNode(tree, id)
  return hit ? collectDescendantIds(hit.node) : new Set([id])
}

export function findComputerNode(
  nodes: ComputerTreeNode[],
  id: string,
  parent: ComputerTreeNode | null = null,
): { node: ComputerTreeNode; parent: ComputerTreeNode | null; siblings: ComputerTreeNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (node.id === id) return { node, parent, siblings: nodes, index: i }
    const nested = findComputerNode(node.children, id, node)
    if (nested) return nested
  }
  return null
}

export function findComputerEntry(
  nodes: ComputerTreeNode[],
  id: string,
): { node: ComputerTreeNode; index: number; entry: ComputerTreeEntry } | null {
  for (const node of nodes) {
    const index = node.entries.findIndex((e) => e.id === id)
    if (index >= 0) return { node, index, entry: node.entries[index]! }
    const nested = findComputerEntry(node.children, id)
    if (nested) return nested
  }
  return null
}

export async function moveComputerNode(id: string, input: { parentId: string | null; index: number }) {
  await computerAdminFetch(`/api/computer-basics/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  clearComputerBasicsCache()
}

export async function moveComputerItem(id: string, input: { parentId: string; index: number }) {
  await computerAdminFetch(`/api/computer-basics/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  clearComputerBasicsCache()
}

export async function loadComputerBasicsTree(force = false): Promise<ComputerTreeNode[]> {
  if (treeCache && !force) return treeCache
  const res = await wenguApiFetch('/api/computer-basics/tree')
  const data = await readWenguJsonResponse<{ ok?: boolean; tree?: ComputerTreeNode[]; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !Array.isArray(data.tree)) {
    throw new Error(data.message || `读取目录失败（HTTP ${res.status}）`)
  }
  treeCache = data.tree
  return treeCache
}

export async function loadComputerBasicsItem(id: string, force = false): Promise<ComputerHandoutItem> {
  const key = String(id || '').trim()
  if (!key) throw new Error('缺少讲义编号')
  const cached = itemCache.get(key)
  if (cached && !force) return cached
  const res = await wenguApiFetch(`/api/computer-basics/items/${encodeURIComponent(key)}`)
  const data = await readWenguJsonResponse<{ ok?: boolean; item?: ComputerHandoutItem; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !data.item) {
    throw new Error(data.message || `读取讲义失败（HTTP ${res.status}）`)
  }
  const item = {
    ...data.item,
    content: rewriteComputerMediaUrls(data.item.content ?? ''),
  }
  itemCache.set(key, item)
  return item
}
