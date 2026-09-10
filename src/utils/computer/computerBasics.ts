import {
  handoutCacheFitsViewer,
  invalidateHandoutRevisionMemo,
  peekHandoutRevision,
  readHandoutCachedItem,
  readHandoutCachedTree,
  rememberHandoutRevision,
  writeHandoutCachedItem,
  writeHandoutCachedTree,
} from '@/utils/app/handoutDiskCache'
import { markdownToDisplaySafeHtml } from '@/utils/markdown/markdownToHtml'
import { highlightHandoutCodeHtml } from '@/utils/markdown/highlightHandoutCode'
import { sanitizeRichHtml } from '@/utils/markdown/richTextHtml'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'
import { resolveWenguApiUrl } from '@/utils/computer/wenguApiOrigin'
import { catalogContainsId, catalogRowLocked, filterPublicCatalog } from '@/utils/app/handoutVisibility'
import { catalogNodeHasBody, mergeCatalogLayer, snapshotCatalogNodes } from '@/utils/app/catalogLayer'
import { getWenguAuthToken, isWenguAdmin } from '@/utils/computer/wenguAuthStore'

export type ComputerEntryType = 'handout' | 'mindmap' | 'general' | 'choice' | 'group' | 'material-group'

export type ComputerTreeEntry = {
  id: string
  title: string
  ready: boolean
  type: ComputerEntryType | string
  private?: boolean
}

export type ComputerTreeNode = {
  id: string
  name: string
  children: ComputerTreeNode[]
  entries: ComputerTreeEntry[]
  private?: boolean
  loaded?: boolean
  hasBody?: boolean
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
      locked: boolean
      ownPrivate: boolean
    }
  | {
      kind: 'entry'
      id: string
      depth: number
      entry: ComputerTreeEntry
      locked: boolean
      ownPrivate: boolean
    }

export function nodeHasBody(node: ComputerTreeNode): boolean {
  return catalogNodeHasBody(node)
}

/** 目录默认只展示一层大类，子层由用户点开后再加载。 */
export function defaultExpandedComputerIds(
  _nodes: ComputerTreeNode[],
  _maxDepth = 1,
): Record<string, boolean> {
  return {}
}

export function flattenVisibleComputerRows(
  nodes: ComputerTreeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
  inheritedPrivate = false,
): ComputerTreeRow[] {
  const rows: ComputerTreeRow[] = []
  for (const node of nodes) {
    const expandable = nodeHasBody(node)
    const locked = catalogRowLocked(inheritedPrivate, node.private)
    rows.push({
      kind: 'branch',
      id: node.id,
      name: node.name,
      depth,
      expandable,
      locked,
      ownPrivate: Boolean(node.private),
    })
    if (!expandable || !expanded[node.id]) continue
    rows.push(...flattenVisibleComputerRows(node.children, expanded, depth + 1, locked))
    for (const entry of node.entries) {
      rows.push({
        kind: 'entry',
        id: entry.id,
        depth: depth + 1,
        entry,
        locked: catalogRowLocked(locked, entry.private),
        ownPrivate: Boolean(entry.private),
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

export function collectReadyEntriesUnder(node: ComputerTreeNode): ComputerTreeEntry[] {
  return listReadyComputerEntries([node])
}

export function computerNodePathNames(nodes: ComputerTreeNode[], id: string): string[] {
  const walk = (list: ComputerTreeNode[], acc: string[]): string[] | null => {
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

export function buildComputerRangeQuizItem(input: {
  scopeId: string
  scopeName: string
  learningPath: string[]
  items: ComputerHandoutItem[]
}): ComputerHandoutItem {
  const items = input.items.filter((it) => it?.id && it.content)
  const chunks = items.map((it) => {
    const path = (it.learningPath ?? []).filter(Boolean).join(' / ')
    const head = `【讲义ID:${it.id}｜${path ? `${path} / ` : ''}${it.title}】\n`
    const body = stripHandoutImagesForAi(it.content).trim()
    return `${head}${body}`
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
}

export function isComputerHtmlContent(raw: string): boolean {
  const t = (raw ?? '').trim()
  return /<[a-z][\s\S]*>/i.test(t)
}

export function computerContentToEditorHtml(raw: string): string {
  const t = (raw ?? '').trim()
  if (!t) return ''
  return isComputerHtmlContent(t) ? sanitizeRichHtml(t) : markdownToDisplaySafeHtml(t)
}

export function computerContentToHtml(raw: string): string {
  return highlightHandoutCodeHtml(computerContentToEditorHtml(raw))
}

let treeCache: ComputerTreeNode[] | null = null
let dirTree: ComputerTreeNode[] | null = null
const itemCache = new Map<string, ComputerHandoutItem>()
let sessionRevision = ''
let cacheViewer: 'admin' | 'public' | '' = ''
let dirViewer: 'admin' | 'public' | '' = ''
const layerInflight = new Map<string, Promise<ComputerTreeNode[]>>()

export function clearComputerBasicsCache() {
  treeCache = null
  dirTree = null
  itemCache.clear()
  sessionRevision = ''
  cacheViewer = ''
  dirViewer = ''
  layerInflight.clear()
  invalidateHandoutRevisionMemo('computer')
}

function viewerAuthInit(): RequestInit {
  const token = getWenguAuthToken()
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}

function visibleComputerTree(tree: ComputerTreeNode[] | null): ComputerTreeNode[] {
  const list = tree ?? []
  return isWenguAdmin() ? list : filterPublicCatalog(list)
}

function rememberComputerTree(tree: ComputerTreeNode[], revision?: string, viewer?: 'admin' | 'public') {
  treeCache = tree
  cacheViewer = viewer || (isWenguAdmin() ? 'admin' : 'public')
  if (revision) {
    rememberComputerRevision(revision)
    writeHandoutCachedTree('computer', revision, tree, cacheViewer)
  }
}

function cloneComputerTree(tree: ComputerTreeNode[]): ComputerTreeNode[] {
  return JSON.parse(JSON.stringify(tree)) as ComputerTreeNode[]
}

function removeComputerNodeById(nodes: ComputerTreeNode[], id: string): ComputerTreeNode[] {
  const next = nodes.filter((n) => n.id !== id)
  for (const n of next) n.children = removeComputerNodeById(n.children, id)
  return next
}

function removeComputerEntryById(nodes: ComputerTreeNode[], id: string): boolean {
  for (const n of nodes) {
    const before = n.entries.length
    n.entries = n.entries.filter((e) => e.id !== id)
    if (n.entries.length !== before) return true
    if (removeComputerEntryById(n.children, id)) return true
  }
  return false
}

function commitComputerCatalog(tree: ComputerTreeNode[], revision?: string) {
  const viewer = isWenguAdmin() ? 'admin' : 'public'
  rememberComputerTree(tree, revision, viewer)
  if (dirTree) rememberComputerDir(snapshotCatalogNodes(tree), revision, viewer)
}

function patchComputerCatalog(revision: string | undefined, patch: (tree: ComputerTreeNode[]) => ComputerTreeNode[]) {
  if (!treeCache) return
  commitComputerCatalog(patch(cloneComputerTree(treeCache)), revision)
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

export async function pullComputerBasicsFromCloud() {
  return computerAdminFetch<{ wrote: number; skipped: number; remoteCount: number }>(
    '/api/computer-basics/pull-cloud',
    { method: 'POST', body: '{}' },
  )
}

export async function createComputerNode(input: { name: string; parentId?: string | null }) {
  const data = await computerAdminFetch<{ node: ComputerTreeNode; revision?: string }>(
    '/api/computer-basics/nodes',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  const node: ComputerTreeNode = {
    ...data.node,
    children: data.node.children ?? [],
    entries: data.node.entries ?? [],
  }
  patchComputerCatalog(data.revision, (tree) => {
    const parentId = input.parentId ?? null
    if (!parentId) {
      tree.push(cloneComputerTree([node])[0]!)
      return tree
    }
    const hit = findComputerNode(tree, parentId)
    if (hit) hit.node.children.push(cloneComputerTree([node])[0]!)
    return tree
  })
  return node
}

export async function renameComputerNode(id: string, name: string) {
  const data = await computerAdminFetch<{ revision?: string }>(
    `/api/computer-basics/nodes/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    },
  )
  patchComputerCatalog(data.revision, (tree) => {
    const hit = findComputerNode(tree, id)
    if (hit) hit.node.name = name
    return tree
  })
}

export async function setComputerNodePrivate(id: string, isPrivate: boolean) {
  const data = await computerAdminFetch<{ revision?: string }>(
    `/api/computer-basics/nodes/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ private: isPrivate }),
    },
  )
  patchComputerCatalog(data.revision, (tree) => {
    const hit = findComputerNode(tree, id)
    if (hit) {
      if (isPrivate) hit.node.private = true
      else delete hit.node.private
    }
    return tree
  })
}

export async function setComputerItemPrivate(id: string, isPrivate: boolean) {
  const data = await computerAdminFetch<{ revision?: string }>(
    `/api/computer-basics/items/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ private: isPrivate }),
    },
  )
  patchComputerCatalog(data.revision, (tree) => {
    const hit = findComputerEntry(tree, id)
    if (hit) {
      if (isPrivate) hit.entry.private = true
      else delete hit.entry.private
    }
    return tree
  })
}

export async function deleteComputerNode(id: string) {
  const data = await computerAdminFetch<{ revision?: string }>(
    `/api/computer-basics/nodes/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
  patchComputerCatalog(data.revision, (tree) => removeComputerNodeById(tree, id))
}

export async function createComputerItem(input: {
  parentId: string
  title: string
  content?: string
  type?: string
}) {
  const data = await computerAdminFetch<{ item: ComputerHandoutItem; revision?: string }>(
    '/api/computer-basics/items',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  const item = {
    ...data.item,
    content: rewriteComputerMediaUrls(data.item.content ?? ''),
  }
  if (data.revision) rememberComputerRevision(data.revision)
  itemCache.set(item.id, item)
  if (data.revision) writeHandoutCachedItem('computer', item.id, data.revision, item)
  patchComputerCatalog(data.revision, (tree) => {
    const hit = findComputerNode(tree, input.parentId)
    if (hit) {
      hit.node.entries.push({
        id: item.id,
        title: item.title,
        ready: true,
        type: item.type,
      })
    }
    return tree
  })
  return item
}

export async function updateComputerItem(
  id: string,
  patch: { title?: string; content?: string; private?: boolean },
) {
  const data = await computerAdminFetch<{ item: ComputerHandoutItem; revision?: string }>(
    `/api/computer-basics/items/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
  const item = {
    ...data.item,
    content: rewriteComputerMediaUrls(data.item.content ?? ''),
  }
  if (data.revision) rememberComputerRevision(data.revision)
  itemCache.set(id, item)
  if (data.revision) writeHandoutCachedItem('computer', id, data.revision, item)
  patchComputerCatalog(data.revision, (tree) => {
    const hit = findComputerEntry(tree, id)
    if (hit) {
      hit.entry.title = item.title
      if (patch.private === true) hit.entry.private = true
      if (patch.private === false) delete hit.entry.private
    }
    return tree
  })
  return item
}

export async function deleteComputerItem(id: string) {
  const data = await computerAdminFetch<{ revision?: string }>(
    `/api/computer-basics/items/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
  itemCache.delete(id)
  patchComputerCatalog(data.revision, (tree) => {
    removeComputerEntryById(tree, id)
    return tree
  })
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

function rememberComputerRevision(revision: string) {
  const stamp = String(revision || '').trim()
  if (!stamp) return
  if (sessionRevision && sessionRevision !== stamp) itemCache.clear()
  sessionRevision = stamp
  rememberHandoutRevision('computer', stamp)
}

export async function loadComputerBasicsTree(force = false): Promise<ComputerTreeNode[]> {
  const admin = isWenguAdmin()
  if (!force && treeCache && handoutCacheFitsViewer(admin, cacheViewer)) {
    return visibleComputerTree(treeCache)
  }
  if (!force) {
    const remote = await peekHandoutRevision('computer')
    if (remote.status === 'ok') {
      if (treeCache && sessionRevision === remote.revision && handoutCacheFitsViewer(admin, cacheViewer)) {
        return visibleComputerTree(treeCache)
      }
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer')
      if (disk && disk.revision === remote.revision && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberComputerRevision(remote.revision)
        return visibleComputerTree(treeCache)
      }
    } else if (remote.status === 'offline') {
      if (treeCache && handoutCacheFitsViewer(admin, cacheViewer)) return visibleComputerTree(treeCache)
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberComputerRevision(disk.revision)
        return visibleComputerTree(treeCache)
      }
    }
  }

  const res = await wenguApiFetch('/api/computer-basics/tree', viewerAuthInit())
  const data = await readWenguJsonResponse<{
    ok?: boolean
    tree?: ComputerTreeNode[]
    revision?: string
    message?: string
  }>(res)
  if (!res.ok || !data.ok || !Array.isArray(data.tree)) {
    if (!force) {
      if (treeCache && handoutCacheFitsViewer(admin, cacheViewer)) return visibleComputerTree(treeCache)
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberComputerRevision(disk.revision)
        return visibleComputerTree(treeCache)
      }
    }
    throw new Error(data.message || `读取目录失败（HTTP ${res.status}）`)
  }
  let revision = String(data.revision || '').trim()
  if (!revision) {
    const peek = await peekHandoutRevision('computer')
    if (peek.status === 'ok') revision = peek.revision
  }
  rememberComputerTree(data.tree, revision)
  return visibleComputerTree(treeCache)
}

function rememberComputerDir(tree: ComputerTreeNode[], revision?: string, viewer?: 'admin' | 'public') {
  dirTree = tree
  dirViewer = viewer || (isWenguAdmin() ? 'admin' : 'public')
  if (revision) {
    rememberComputerRevision(revision)
    writeHandoutCachedTree('computer', revision, tree, dirViewer, 'dir')
  }
}

function snapshotComputerDir(): ComputerTreeNode[] {
  return snapshotCatalogNodes(visibleComputerTree(dirTree))
}

async function fetchComputerLayer(parentId: string): Promise<{
  tree: ComputerTreeNode[]
  entries: ComputerTreeEntry[]
  revision: string
}> {
  const q = encodeURIComponent(parentId || '__root__')
  const res = await wenguApiFetch(`/api/computer-basics/tree?parent=${q}`, viewerAuthInit())
  const data = await readWenguJsonResponse<{
    ok?: boolean
    tree?: ComputerTreeNode[]
    entries?: ComputerTreeEntry[]
    revision?: string
    message?: string
  }>(res)
  if (!res.ok || !data.ok || !Array.isArray(data.tree)) {
    throw new Error(data.message || `读取目录失败（HTTP ${res.status}）`)
  }
  return {
    tree: data.tree,
    entries: Array.isArray(data.entries) ? data.entries : [],
    revision: String(data.revision || '').trim(),
  }
}

export async function loadComputerBasicsDir(force = false): Promise<ComputerTreeNode[]> {
  const admin = isWenguAdmin()
  if (!force && dirTree && handoutCacheFitsViewer(admin, dirViewer)) {
    return snapshotComputerDir()
  }
  if (!force) {
    const remote = await peekHandoutRevision('computer')
    if (remote.status === 'ok') {
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer', 'dir')
      if (disk && disk.revision === remote.revision && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberComputerRevision(remote.revision)
        return snapshotComputerDir()
      }
    } else if (remote.status === 'offline') {
      if (dirTree && handoutCacheFitsViewer(admin, dirViewer)) return snapshotComputerDir()
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer', 'dir')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberComputerRevision(disk.revision)
        return snapshotComputerDir()
      }
    }
  }

  try {
    const layer = await fetchComputerLayer('__root__')
    const next = mergeCatalogLayer<ComputerTreeNode>([], '', layer.tree, [])
    let revision = layer.revision
    if (!revision) {
      const peek = await peekHandoutRevision('computer')
      if (peek.status === 'ok') revision = peek.revision
    }
    rememberComputerDir(next, revision)
    return snapshotComputerDir()
  } catch (e) {
    if (!force) {
      if (dirTree && handoutCacheFitsViewer(admin, dirViewer)) return snapshotComputerDir()
      const disk = await readHandoutCachedTree<ComputerTreeNode[]>('computer', 'dir')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberComputerRevision(disk.revision)
        return snapshotComputerDir()
      }
    }
    throw e
  }
}

export async function ensureComputerBasicsNodeLoaded(id: string, force = false): Promise<ComputerTreeNode[]> {
  const key = String(id || '').trim()
  if (!key) return loadComputerBasicsDir(force)
  if (!dirTree) await loadComputerBasicsDir(force)
  const hit = findComputerNode(dirTree || [], key)
  if (!hit) throw new Error('未找到该分类')
  if (!force && hit.node.loaded !== false) return snapshotComputerDir()
  const inflightKey = `${force ? 'f:' : ''}${key}`
  const pending = layerInflight.get(inflightKey)
  if (pending) return pending
  const run = (async () => {
    const layer = await fetchComputerLayer(key)
    dirTree = mergeCatalogLayer(dirTree || [], key, layer.tree, layer.entries)
    const viewer = dirViewer || (isWenguAdmin() ? 'admin' : 'public')
    rememberComputerDir(dirTree, layer.revision || sessionRevision, viewer)
    return snapshotComputerDir()
  })().finally(() => {
    if (layerInflight.get(inflightKey) === run) layerInflight.delete(inflightKey)
  })
  layerInflight.set(inflightKey, run)
  return run
}

export async function reloadComputerBasicsDir(expandedIds: string[]): Promise<ComputerTreeNode[]> {
  let next = await loadComputerBasicsDir(true)
  const pending = new Set(expandedIds.map((id) => String(id || '').trim()).filter(Boolean))
  let guard = 0
  while (pending.size && guard < 40) {
    guard += 1
    let progressed = false
    for (const id of [...pending]) {
      const hit = findComputerNode(dirTree || [], id)
      if (!hit) continue
      next = await ensureComputerBasicsNodeLoaded(id, true)
      pending.delete(id)
      progressed = true
    }
    if (!progressed) break
  }
  return next
}

function guestMayUseComputerItemCache(id: string): boolean {
  if (isWenguAdmin()) return true
  return catalogContainsId(visibleComputerTree(treeCache), id)
}

export async function loadComputerBasicsItem(id: string, force = false): Promise<ComputerHandoutItem> {
  const key = String(id || '').trim()
  if (!key) throw new Error('缺少讲义编号')

  if (!force) {
    const remote = await peekHandoutRevision('computer')
    if (remote.status === 'ok') {
      const cached = itemCache.get(key)
      if (cached && sessionRevision === remote.revision && guestMayUseComputerItemCache(key)) return cached
      const disk = await readHandoutCachedItem<ComputerHandoutItem>('computer', key)
      if (disk && disk.revision === remote.revision && guestMayUseComputerItemCache(key)) {
        rememberComputerRevision(remote.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    } else if (remote.status === 'offline') {
      const cached = itemCache.get(key)
      if (cached && guestMayUseComputerItemCache(key)) return cached
      const disk = await readHandoutCachedItem<ComputerHandoutItem>('computer', key)
      if (disk && guestMayUseComputerItemCache(key)) {
        rememberComputerRevision(disk.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    }
  }

  const res = await wenguApiFetch(`/api/computer-basics/items/${encodeURIComponent(key)}`, viewerAuthInit())
  const data = await readWenguJsonResponse<{ ok?: boolean; item?: ComputerHandoutItem; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !data.item) {
    if (res.status === 404 && !isWenguAdmin()) {
      throw new Error(data.message || '未找到该讲义')
    }
    if (!force) {
      const cached = itemCache.get(key)
      if (cached && guestMayUseComputerItemCache(key)) return cached
      const disk = await readHandoutCachedItem<ComputerHandoutItem>('computer', key)
      if (disk && guestMayUseComputerItemCache(key)) {
        rememberComputerRevision(disk.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    }
    throw new Error(data.message || `读取讲义失败（HTTP ${res.status}）`)
  }
  const item = {
    ...data.item,
    content: rewriteComputerMediaUrls(data.item.content ?? ''),
  }
  itemCache.set(key, item)
  const peek = await peekHandoutRevision('computer')
  const stamp = peek.status === 'ok' ? peek.revision : sessionRevision
  if (stamp) {
    rememberComputerRevision(stamp)
    writeHandoutCachedItem('computer', key, stamp, item)
  }
  return item
}
