import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'
import { resolveWenguApiUrl } from '@/utils/computer/wenguApiOrigin'
import { getWenguAuthToken, isWenguAdmin } from '@/utils/computer/wenguAuthStore'

export type FrontendEntryType = 'handout' | 'mindmap' | 'general' | 'choice' | 'group' | 'material-group'

export type FrontendTreeEntry = {
  id: string
  title: string
  ready: boolean
  type: FrontendEntryType | string
}

export type FrontendTreeNode = {
  id: string
  name: string
  children: FrontendTreeNode[]
  entries: FrontendTreeEntry[]
}

export type FrontendHandoutItem = {
  id: string
  title: string
  type: 'handout' | string
  learningPath: string[]
  tags: string[]
  content: string
}

export type FrontendTreeRow =
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
      entry: FrontendTreeEntry
    }

export function nodeHasBody(node: FrontendTreeNode): boolean {
  return node.children.length > 0 || node.entries.length > 0
}

/** 默认只展开第一层有内容的大类，细节由用户点三角形展开。 */
export function defaultExpandedFrontendIds(
  nodes: FrontendTreeNode[],
  maxDepth = 1,
): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  const walk = (list: FrontendTreeNode[], depth: number) => {
    for (const node of list) {
      if (depth < maxDepth && nodeHasBody(node)) out[node.id] = true
      walk(node.children, depth + 1)
    }
  }
  walk(nodes, 0)
  return out
}

export function flattenVisibleFrontendRows(
  nodes: FrontendTreeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
): FrontendTreeRow[] {
  const rows: FrontendTreeRow[] = []
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
    rows.push(...flattenVisibleFrontendRows(node.children, expanded, depth + 1))
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

export function listReadyFrontendEntries(nodes: FrontendTreeNode[]): FrontendTreeEntry[] {
  const out: FrontendTreeEntry[] = []
  const walk = (list: FrontendTreeNode[]) => {
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

export function collectReadyEntriesUnder(node: FrontendTreeNode): FrontendTreeEntry[] {
  return listReadyFrontendEntries([node])
}

export function frontendNodePathNames(nodes: FrontendTreeNode[], id: string): string[] {
  const walk = (list: FrontendTreeNode[], acc: string[]): string[] | null => {
    for (const node of list) {
      const next = [...acc, node.name]
      if (node.id === id) return next
      const hit = walk(node.children, next)
      if (hit) return hit
    }
    return null
  }
  return walk(nodes, []) ?? []
}

export function buildFrontendRangeQuizItem(input: {
  scopeId: string
  scopeName: string
  learningPath: string[]
  items: FrontendHandoutItem[]
}): FrontendHandoutItem {
  const items = input.items.filter((it) => it?.id && it.content)
  const max = 8800
  const n = Math.max(1, items.length)
  const each = Math.floor(max / n)
  const chunks = items.map((it) => {
    const path = (it.learningPath ?? []).filter(Boolean).join(' / ')
    const head = `【讲义ID:${it.id}｜${path ? `${path} / ` : ''}${it.title}】\n`
    const body = stripHandoutImagesForAi(it.content).replace(/\s+/g, ' ').trim()
    return `${head}${body.slice(0, Math.max(280, each - head.length))}`
  })
  return {
    id: `range:${input.scopeId}`,
    title: `${input.scopeName}（范围测验）`,
    type: 'handout',
    learningPath: input.learningPath,
    tags: ['范围测验', input.scopeName],
    content: chunks.join('\n\n'),
  }
}

/** 只含大类/小类，不含讲义叶子；默认展开前 maxDepth 层。 */
export function defaultExpandedCategoryIds(
  nodes: FrontendTreeNode[],
  maxDepth = 2,
): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  const walk = (list: FrontendTreeNode[], depth: number) => {
    for (const node of list) {
      if (depth < maxDepth - 1 && node.children.length > 0) out[node.id] = true
      walk(node.children, depth + 1)
    }
  }
  walk(nodes, 0)
  return out
}

export function collectExpandableFrontendIds(nodes: FrontendTreeNode[]): string[] {
  const ids: string[] = []
  const walk = (list: FrontendTreeNode[]) => {
    for (const node of list) {
      if (nodeHasBody(node)) ids.push(node.id)
      walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

export function rewriteFrontendMediaUrls(md: string): string {
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

export function isFrontendHtmlContent(raw: string): boolean {
  const t = (raw ?? '').trim()
  return /<[a-z][\s\S]*>/i.test(t)
}

export function frontendContentToHtml(raw: string): string {
  const t = (raw ?? '').trim()
  if (!t) return ''
  if (isFrontendHtmlContent(t)) return sanitizeRichHtml(t)
  return markdownToDisplaySafeHtml(t)
}

let treeCache: FrontendTreeNode[] | null = null
const itemCache = new Map<string, FrontendHandoutItem>()

export function clearFrontendLearningCache() {
  treeCache = null
  itemCache.clear()
}

async function frontendAdminFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function createFrontendNode(input: { name: string; parentId?: string | null }) {
  const data = await frontendAdminFetch<{ node: FrontendTreeNode }>('/api/frontend-learning/nodes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  clearFrontendLearningCache()
  return data.node
}

export async function renameFrontendNode(id: string, name: string) {
  await frontendAdminFetch(`/api/frontend-learning/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  clearFrontendLearningCache()
}

export async function deleteFrontendNode(id: string) {
  await frontendAdminFetch(`/api/frontend-learning/nodes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  clearFrontendLearningCache()
}

export async function createFrontendItem(input: {
  parentId: string
  title: string
  content?: string
  type?: string
}) {
  const data = await frontendAdminFetch<{ item: FrontendHandoutItem }>('/api/frontend-learning/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  clearFrontendLearningCache()
  return data.item
}

export async function updateFrontendItem(id: string, patch: { title?: string; content?: string }) {
  const data = await frontendAdminFetch<{ item: FrontendHandoutItem }>(
    `/api/frontend-learning/items/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
  clearFrontendLearningCache()
  return {
    ...data.item,
    content: rewriteFrontendMediaUrls(data.item.content ?? ''),
  }
}

export async function deleteFrontendItem(id: string) {
  await frontendAdminFetch(`/api/frontend-learning/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  clearFrontendLearningCache()
}

export type FrontendFolderOption = { id: string; label: string }

function collectDescendantIds(node: FrontendTreeNode, out: Set<string> = new Set()): Set<string> {
  out.add(node.id)
  for (const child of node.children) collectDescendantIds(child, out)
  return out
}

export function listFrontendFolderOptions(
  tree: FrontendTreeNode[],
  excludeIds: Iterable<string> = [],
): FrontendFolderOption[] {
  const skip = new Set(excludeIds)
  const out: FrontendFolderOption[] = []
  const walk = (nodes: FrontendTreeNode[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.name]
      if (!skip.has(node.id)) out.push({ id: node.id, label: path.join(' / ') })
      walk(node.children, path)
    }
  }
  walk(tree, [])
  return out
}

export function frontendNodeExcludeSet(tree: FrontendTreeNode[], id: string): Set<string> {
  const hit = findFrontendNode(tree, id)
  return hit ? collectDescendantIds(hit.node) : new Set([id])
}

export function findFrontendNode(
  nodes: FrontendTreeNode[],
  id: string,
  parent: FrontendTreeNode | null = null,
): { node: FrontendTreeNode; parent: FrontendTreeNode | null; siblings: FrontendTreeNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (node.id === id) return { node, parent, siblings: nodes, index: i }
    const nested = findFrontendNode(node.children, id, node)
    if (nested) return nested
  }
  return null
}

export function findFrontendEntry(
  nodes: FrontendTreeNode[],
  id: string,
): { node: FrontendTreeNode; index: number; entry: FrontendTreeEntry } | null {
  for (const node of nodes) {
    const index = node.entries.findIndex((e) => e.id === id)
    if (index >= 0) return { node, index, entry: node.entries[index]! }
    const nested = findFrontendEntry(node.children, id)
    if (nested) return nested
  }
  return null
}

export async function moveFrontendNode(id: string, input: { parentId: string | null; index: number }) {
  await frontendAdminFetch(`/api/frontend-learning/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  clearFrontendLearningCache()
}

export async function moveFrontendItem(id: string, input: { parentId: string; index: number }) {
  await frontendAdminFetch(`/api/frontend-learning/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  clearFrontendLearningCache()
}

export async function loadFrontendLearningTree(force = false): Promise<FrontendTreeNode[]> {
  if (treeCache && !force) return treeCache
  const res = await wenguApiFetch('/api/frontend-learning/tree')
  const data = await readWenguJsonResponse<{ ok?: boolean; tree?: FrontendTreeNode[]; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !Array.isArray(data.tree)) {
    throw new Error(data.message || `读取目录失败（HTTP ${res.status}）`)
  }
  treeCache = data.tree
  return treeCache
}

export async function loadFrontendLearningItem(id: string, force = false): Promise<FrontendHandoutItem> {
  const key = String(id || '').trim()
  if (!key) throw new Error('缺少讲义编号')
  const cached = itemCache.get(key)
  if (cached && !force) return cached
  const res = await wenguApiFetch(`/api/frontend-learning/items/${encodeURIComponent(key)}`)
  const data = await readWenguJsonResponse<{ ok?: boolean; item?: FrontendHandoutItem; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !data.item) {
    throw new Error(data.message || `读取讲义失败（HTTP ${res.status}）`)
  }
  const item = {
    ...data.item,
    content: rewriteFrontendMediaUrls(data.item.content ?? ''),
  }
  itemCache.set(key, item)
  return item
}
