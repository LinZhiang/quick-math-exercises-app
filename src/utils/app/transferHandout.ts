import { resolveWenguApiUrl } from '@/utils/computer/wenguApiOrigin'
import {
  createComputerItem,
  createComputerNode,
  deleteComputerItem,
  deleteComputerNode,
  ensureComputerBasicsSubtreeLoaded,
  loadComputerBasicsItem,
  loadComputerBasicsTree,
  reloadComputerBasicsDir,
  setComputerItemPrivate,
  setComputerNodePrivate,
  withComputerHandoutScope,
  type ComputerHandoutScope,
  type ComputerTreeNode,
} from '@/utils/computer/computerBasics'
import {
  createFrontendItem,
  createFrontendNode,
  deleteFrontendItem,
  deleteFrontendNode,
  ensureFrontendLearningSubtreeLoaded,
  loadFrontendLearningItem,
  loadFrontendLearningTree,
  reloadFrontendLearningDir,
  setFrontendItemPrivate,
  setFrontendNodePrivate,
  type FrontendTreeNode,
} from '@/utils/frontend/frontendLearning'

export type HandoutLibraryId = 'computer' | 'history' | 'frontend'

export const HANDOUT_LIBRARIES: { id: HandoutLibraryId; label: string }[] = [
  { id: 'computer', label: '计算机基础' },
  { id: 'history', label: '历史整理' },
  { id: 'frontend', label: '前端学习' },
]

export function handoutLibraryLabel(id: string): string {
  return HANDOUT_LIBRARIES.find((lib) => lib.id === id)?.label || '目标菜单'
}

type MovableEntry = { id: string; title: string; private?: boolean }
type MovableNode = {
  id: string
  name: string
  children: MovableNode[]
  entries: MovableEntry[]
  private?: boolean
}

function asNode(node: ComputerTreeNode | FrontendTreeNode): MovableNode {
  return node as unknown as MovableNode
}

async function deepen(
  scope: ComputerHandoutScope,
  load: () => Promise<ComputerTreeNode[]>,
  reload: (ids: string[]) => Promise<ComputerTreeNode[]>,
): Promise<ComputerTreeNode[]> {
  return withComputerHandoutScope(scope, async () => {
    let tree = await load()
    for (let i = 0; i < 8; i++) {
      const ids: string[] = []
      const walk = (nodes: ComputerTreeNode[]) => {
        for (const node of nodes) {
          if (node.loaded === false) ids.push(node.id)
          walk(node.children)
        }
      }
      walk(tree)
      if (!ids.length) break
      tree = await reload(ids)
    }
    return tree
  })
}

export async function loadHandoutLibraryTree(id: HandoutLibraryId): Promise<ComputerTreeNode[]> {
  if (id === 'frontend') {
    let tree = await loadFrontendLearningTree(true)
    for (let i = 0; i < 8; i++) {
      const ids: string[] = []
      const walk = (nodes: FrontendTreeNode[]) => {
        for (const node of nodes) {
          if (node.loaded === false) ids.push(node.id)
          walk(node.children)
        }
      }
      walk(tree)
      if (!ids.length) break
      tree = await reloadFrontendLearningDir(ids)
    }
    return tree as unknown as ComputerTreeNode[]
  }
  return deepen(id, () => loadComputerBasicsTree(true), (ids) => reloadComputerBasicsDir(ids))
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('插图读取失败'))
    reader.readAsDataURL(blob)
  })
}

/** 把讲义里的插图收成 data URL，换菜单后由目标库重新保存。 */
export async function embedHandoutMedia(content: string): Promise<string> {
  const found = content.match(/(?:https?:\/\/[^\s"'()]+)?\/api\/media\/[^\s"'()]+/g) || []
  let out = content
  for (const raw of [...new Set(found)]) {
    const path = raw.replace(/^https?:\/\/[^/]+/i, '')
    const res = await fetch(resolveWenguApiUrl(path))
    if (!res.ok) throw new Error('有图片没读出来，已停止移动，原来的文件还在')
    out = out.split(raw).join(await blobToDataUrl(await res.blob()))
  }
  return out
}

async function readContent(from: HandoutLibraryId, id: string) {
  if (from === 'frontend') {
    const item = await loadFrontendLearningItem(id, true)
    return { title: item.title, content: item.content || '', type: String(item.type || 'handout') }
  }
  return withComputerHandoutScope(from, async () => {
    const item = await loadComputerBasicsItem(id, true)
    return { title: item.title, content: item.content || '', type: String(item.type || 'handout') }
  })
}

async function createEntry(
  to: HandoutLibraryId,
  parentId: string,
  title: string,
  content: string,
  type: string,
  isPrivate: boolean,
) {
  if (to === 'frontend') {
    const item = await createFrontendItem({ parentId, title, content, type })
    if (!isPrivate) await setFrontendItemPrivate(item.id, false)
    return
  }
  await withComputerHandoutScope(to, async () => {
    const item = await createComputerItem({ parentId, title, content, type })
    if (!isPrivate) await setComputerItemPrivate(item.id, false)
  })
}

async function removeEntry(from: HandoutLibraryId, id: string) {
  if (from === 'frontend') {
    await deleteFrontendItem(id)
    return
  }
  await withComputerHandoutScope(from, () => deleteComputerItem(id))
}

async function moveEntry(
  from: HandoutLibraryId,
  to: HandoutLibraryId,
  id: string,
  parentId: string,
  isPrivate: boolean,
) {
  const item = await readContent(from, id)
  const content = await embedHandoutMedia(item.content)
  await createEntry(to, parentId, item.title, content, item.type, isPrivate)
  await removeEntry(from, id)
}

async function createBranch(to: HandoutLibraryId, name: string, parentId: string | null, isPrivate: boolean) {
  if (to === 'frontend') {
    const node = await createFrontendNode({ name, parentId })
    if (isPrivate) await setFrontendNodePrivate(node.id, true)
    return node.id
  }
  return withComputerHandoutScope(to, async () => {
    const node = await createComputerNode({ name, parentId })
    if (isPrivate) await setComputerNodePrivate(node.id, true)
    return node.id
  })
}

async function removeBranch(from: HandoutLibraryId, id: string) {
  if (from === 'frontend') {
    await deleteFrontendNode(id)
    return
  }
  await withComputerHandoutScope(from, () => deleteComputerNode(id))
}

async function copyBranch(node: MovableNode, from: HandoutLibraryId, to: HandoutLibraryId, parentId: string | null) {
  const id = await createBranch(to, node.name, parentId, Boolean(node.private))
  for (const child of node.children || []) await copyBranch(child, from, to, id)
  for (const entry of node.entries || []) {
    await moveEntry(from, to, entry.id, id, entry.private !== false)
  }
}

export async function transferHandout(input: {
  from: HandoutLibraryId
  to: HandoutLibraryId
  kind: 'branch' | 'entry'
  id: string
  parentId: string | null
  isPrivate?: boolean
}) {
  if (input.from === input.to) return
  if (input.kind === 'entry') {
    if (!input.parentId) throw new Error('请先选择要放到的分类')
    await moveEntry(input.from, input.to, input.id, input.parentId, input.isPrivate !== false)
    return
  }
  const node =
    input.from === 'frontend'
      ? asNode(await ensureFrontendLearningSubtreeLoaded(input.id))
      : asNode(await withComputerHandoutScope(input.from, () => ensureComputerBasicsSubtreeLoaded(input.id)))
  await copyBranch(node, input.from, input.to, input.parentId)
  await removeBranch(input.from, input.id)
}
