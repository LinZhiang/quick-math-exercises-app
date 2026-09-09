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

export type FrontendEntryType = 'handout' | 'mindmap' | 'general' | 'choice' | 'group' | 'material-group'

export type FrontendTreeEntry = {
  id: string
  title: string
  ready: boolean
  type: FrontendEntryType | string
  private?: boolean
}

export type FrontendTreeNode = {
  id: string
  name: string
  children: FrontendTreeNode[]
  entries: FrontendTreeEntry[]
  private?: boolean
  loaded?: boolean
  hasBody?: boolean
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
      locked: boolean
      ownPrivate: boolean
    }
  | {
      kind: 'entry'
      id: string
      depth: number
      entry: FrontendTreeEntry
      locked: boolean
      ownPrivate: boolean
    }

export function nodeHasBody(node: FrontendTreeNode): boolean {
  return catalogNodeHasBody(node)
}

/** 目录默认只展示一层大类，子层由用户点开后再加载。 */
export function defaultExpandedFrontendIds(
  _nodes: FrontendTreeNode[],
  _maxDepth = 1,
): Record<string, boolean> {
  return {}
}

export function flattenVisibleFrontendRows(
  nodes: FrontendTreeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
  inheritedPrivate = false,
): FrontendTreeRow[] {
  const rows: FrontendTreeRow[] = []
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
    rows.push(...flattenVisibleFrontendRows(node.children, expanded, depth + 1, locked))
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
}

export function isFrontendHtmlContent(raw: string): boolean {
  const t = (raw ?? '').trim()
  // 富文本编辑器保存的 HTML 以标签开头；Markdown 讲义即使夹杂 <sup> 仍从 # / 正文起笔
  return /^</.test(t)
}

export function frontendContentToEditorHtml(raw: string): string {
  const t = (raw ?? '').trim()
  if (!t) return ''
  return isFrontendHtmlContent(t) ? sanitizeRichHtml(t) : markdownToDisplaySafeHtml(t)
}

export function frontendContentToHtml(raw: string): string {
  return highlightHandoutCodeHtml(frontendContentToEditorHtml(raw))
}

let treeCache: FrontendTreeNode[] | null = null
let dirTree: FrontendTreeNode[] | null = null
const itemCache = new Map<string, FrontendHandoutItem>()
let sessionRevision = ''
let cacheViewer: 'admin' | 'public' | '' = ''
let dirViewer: 'admin' | 'public' | '' = ''
const layerInflight = new Map<string, Promise<FrontendTreeNode[]>>()

export function clearFrontendLearningCache() {
  treeCache = null
  dirTree = null
  itemCache.clear()
  sessionRevision = ''
  cacheViewer = ''
  dirViewer = ''
  layerInflight.clear()
  invalidateHandoutRevisionMemo('frontend')
}

function viewerAuthInit(): RequestInit {
  const token = getWenguAuthToken()
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}

function visibleFrontendTree(tree: FrontendTreeNode[] | null): FrontendTreeNode[] {
  const list = tree ?? []
  return isWenguAdmin() ? list : filterPublicCatalog(list)
}

function rememberFrontendTree(tree: FrontendTreeNode[], revision?: string, viewer?: 'admin' | 'public') {
  treeCache = tree
  cacheViewer = viewer || (isWenguAdmin() ? 'admin' : 'public')
  if (revision) {
    rememberFrontendRevision(revision)
    writeHandoutCachedTree('frontend', revision, tree, cacheViewer)
  }
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

export async function pullFrontendLearningFromCloud() {
  return frontendAdminFetch<{ wrote: number; skipped: number; remoteCount: number }>(
    '/api/frontend-learning/pull-cloud',
    { method: 'POST', body: '{}' },
  )
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

export async function setFrontendNodePrivate(id: string, isPrivate: boolean) {
  await frontendAdminFetch(`/api/frontend-learning/nodes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ private: isPrivate }),
  })
  clearFrontendLearningCache()
}

export async function setFrontendItemPrivate(id: string, isPrivate: boolean) {
  await frontendAdminFetch(`/api/frontend-learning/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ private: isPrivate }),
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

export async function updateFrontendItem(
  id: string,
  patch: { title?: string; content?: string; private?: boolean },
) {
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

function rememberFrontendRevision(revision: string) {
  const stamp = String(revision || '').trim()
  if (!stamp) return
  if (sessionRevision && sessionRevision !== stamp) itemCache.clear()
  sessionRevision = stamp
  rememberHandoutRevision('frontend', stamp)
}

export async function loadFrontendLearningTree(force = false): Promise<FrontendTreeNode[]> {
  const admin = isWenguAdmin()
  if (!force && treeCache && handoutCacheFitsViewer(admin, cacheViewer)) {
    return visibleFrontendTree(treeCache)
  }
  if (!force) {
    const remote = await peekHandoutRevision('frontend')
    if (remote.status === 'ok') {
      if (treeCache && sessionRevision === remote.revision && handoutCacheFitsViewer(admin, cacheViewer)) {
        return visibleFrontendTree(treeCache)
      }
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend')
      if (disk && disk.revision === remote.revision && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberFrontendRevision(remote.revision)
        return visibleFrontendTree(treeCache)
      }
    } else if (remote.status === 'offline') {
      if (treeCache && handoutCacheFitsViewer(admin, cacheViewer)) return visibleFrontendTree(treeCache)
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberFrontendRevision(disk.revision)
        return visibleFrontendTree(treeCache)
      }
    }
  }

  const res = await wenguApiFetch('/api/frontend-learning/tree', viewerAuthInit())
  const data = await readWenguJsonResponse<{
    ok?: boolean
    tree?: FrontendTreeNode[]
    revision?: string
    message?: string
  }>(res)
  if (!res.ok || !data.ok || !Array.isArray(data.tree)) {
    if (!force) {
      if (treeCache && handoutCacheFitsViewer(admin, cacheViewer)) return visibleFrontendTree(treeCache)
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        treeCache = disk.tree
        cacheViewer = disk.viewer || 'public'
        rememberFrontendRevision(disk.revision)
        return visibleFrontendTree(treeCache)
      }
    }
    throw new Error(data.message || `读取目录失败（HTTP ${res.status}）`)
  }
  let revision = String(data.revision || '').trim()
  if (!revision) {
    const peek = await peekHandoutRevision('frontend')
    if (peek.status === 'ok') revision = peek.revision
  }
  rememberFrontendTree(data.tree, revision)
  return visibleFrontendTree(treeCache)
}

function rememberFrontendDir(tree: FrontendTreeNode[], revision?: string, viewer?: 'admin' | 'public') {
  dirTree = tree
  dirViewer = viewer || (isWenguAdmin() ? 'admin' : 'public')
  if (revision) {
    rememberFrontendRevision(revision)
    writeHandoutCachedTree('frontend', revision, tree, dirViewer, 'dir')
  }
}

function snapshotFrontendDir(): FrontendTreeNode[] {
  return snapshotCatalogNodes(visibleFrontendTree(dirTree))
}

async function fetchFrontendLayer(parentId: string): Promise<{
  tree: FrontendTreeNode[]
  entries: FrontendTreeEntry[]
  revision: string
}> {
  const q = encodeURIComponent(parentId || '__root__')
  const res = await wenguApiFetch(`/api/frontend-learning/tree?parent=${q}`, viewerAuthInit())
  const data = await readWenguJsonResponse<{
    ok?: boolean
    tree?: FrontendTreeNode[]
    entries?: FrontendTreeEntry[]
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

export async function loadFrontendLearningDir(force = false): Promise<FrontendTreeNode[]> {
  const admin = isWenguAdmin()
  if (!force && dirTree && handoutCacheFitsViewer(admin, dirViewer)) {
    return snapshotFrontendDir()
  }
  if (!force) {
    const remote = await peekHandoutRevision('frontend')
    if (remote.status === 'ok') {
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend', 'dir')
      if (disk && disk.revision === remote.revision && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberFrontendRevision(remote.revision)
        return snapshotFrontendDir()
      }
    } else if (remote.status === 'offline') {
      if (dirTree && handoutCacheFitsViewer(admin, dirViewer)) return snapshotFrontendDir()
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend', 'dir')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberFrontendRevision(disk.revision)
        return snapshotFrontendDir()
      }
    }
  }

  try {
    const layer = await fetchFrontendLayer('__root__')
    const next = mergeCatalogLayer<FrontendTreeNode>([], '', layer.tree, [])
    let revision = layer.revision
    if (!revision) {
      const peek = await peekHandoutRevision('frontend')
      if (peek.status === 'ok') revision = peek.revision
    }
    rememberFrontendDir(next, revision)
    return snapshotFrontendDir()
  } catch (e) {
    if (!force) {
      if (dirTree && handoutCacheFitsViewer(admin, dirViewer)) return snapshotFrontendDir()
      const disk = await readHandoutCachedTree<FrontendTreeNode[]>('frontend', 'dir')
      if (disk && handoutCacheFitsViewer(admin, disk.viewer)) {
        dirTree = disk.tree
        dirViewer = disk.viewer || 'public'
        rememberFrontendRevision(disk.revision)
        return snapshotFrontendDir()
      }
    }
    throw e
  }
}

export async function ensureFrontendLearningNodeLoaded(
  id: string,
  force = false,
): Promise<FrontendTreeNode[]> {
  const key = String(id || '').trim()
  if (!key) return loadFrontendLearningDir(force)
  if (!dirTree) await loadFrontendLearningDir(force)
  const hit = findFrontendNode(dirTree || [], key)
  if (!hit) throw new Error('未找到该分类')
  if (!force && hit.node.loaded !== false) return snapshotFrontendDir()
  const inflightKey = `${force ? 'f:' : ''}${key}`
  const pending = layerInflight.get(inflightKey)
  if (pending) return pending
  const run = (async () => {
    const layer = await fetchFrontendLayer(key)
    dirTree = mergeCatalogLayer(dirTree || [], key, layer.tree, layer.entries)
    const viewer = dirViewer || (isWenguAdmin() ? 'admin' : 'public')
    rememberFrontendDir(dirTree, layer.revision || sessionRevision, viewer)
    return snapshotFrontendDir()
  })().finally(() => {
    if (layerInflight.get(inflightKey) === run) layerInflight.delete(inflightKey)
  })
  layerInflight.set(inflightKey, run)
  return run
}

export async function reloadFrontendLearningDir(expandedIds: string[]): Promise<FrontendTreeNode[]> {
  let next = await loadFrontendLearningDir(true)
  const pending = new Set(expandedIds.map((id) => String(id || '').trim()).filter(Boolean))
  let guard = 0
  while (pending.size && guard < 40) {
    guard += 1
    let progressed = false
    for (const id of [...pending]) {
      const hit = findFrontendNode(dirTree || [], id)
      if (!hit) continue
      next = await ensureFrontendLearningNodeLoaded(id, true)
      pending.delete(id)
      progressed = true
    }
    if (!progressed) break
  }
  return next
}

function guestMayUseFrontendItemCache(id: string): boolean {
  if (isWenguAdmin()) return true
  return catalogContainsId(visibleFrontendTree(treeCache), id)
}

export async function loadFrontendLearningItem(id: string, force = false): Promise<FrontendHandoutItem> {
  const key = String(id || '').trim()
  if (!key) throw new Error('缺少讲义编号')

  if (!force) {
    const remote = await peekHandoutRevision('frontend')
    if (remote.status === 'ok') {
      const cached = itemCache.get(key)
      if (cached && sessionRevision === remote.revision && guestMayUseFrontendItemCache(key)) return cached
      const disk = await readHandoutCachedItem<FrontendHandoutItem>('frontend', key)
      if (disk && disk.revision === remote.revision && guestMayUseFrontendItemCache(key)) {
        rememberFrontendRevision(remote.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    } else if (remote.status === 'offline') {
      const cached = itemCache.get(key)
      if (cached && guestMayUseFrontendItemCache(key)) return cached
      const disk = await readHandoutCachedItem<FrontendHandoutItem>('frontend', key)
      if (disk && guestMayUseFrontendItemCache(key)) {
        rememberFrontendRevision(disk.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    }
  }

  const res = await wenguApiFetch(`/api/frontend-learning/items/${encodeURIComponent(key)}`, viewerAuthInit())
  const data = await readWenguJsonResponse<{ ok?: boolean; item?: FrontendHandoutItem; message?: string }>(
    res,
  )
  if (!res.ok || !data.ok || !data.item) {
    if (res.status === 404 && !isWenguAdmin()) {
      throw new Error(data.message || '未找到该讲义')
    }
    if (!force) {
      const cached = itemCache.get(key)
      if (cached && guestMayUseFrontendItemCache(key)) return cached
      const disk = await readHandoutCachedItem<FrontendHandoutItem>('frontend', key)
      if (disk && guestMayUseFrontendItemCache(key)) {
        rememberFrontendRevision(disk.revision)
        itemCache.set(key, disk.item)
        return disk.item
      }
    }
    throw new Error(data.message || `读取讲义失败（HTTP ${res.status}）`)
  }
  const item = {
    ...data.item,
    content: rewriteFrontendMediaUrls(data.item.content ?? ''),
  }
  itemCache.set(key, item)
  const peek = await peekHandoutRevision('frontend')
  const stamp = peek.status === 'ok' ? peek.revision : sessionRevision
  if (stamp) {
    rememberFrontendRevision(stamp)
    writeHandoutCachedItem('frontend', key, stamp, item)
  }
  return item
}
