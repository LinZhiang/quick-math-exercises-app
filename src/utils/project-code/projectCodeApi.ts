import { getWenguAuthToken } from '@/utils/computer/wenguAuthStore'
import { readWenguJsonResponse, wenguApiFetch, WenguApiError } from '@/utils/computer/wenguApiFetch'

export type ProjectCodeNode = {
  id: string
  name: string
  kind: 'dir' | 'file'
  path: string
  children?: ProjectCodeNode[]
}

export type ProjectCodeRow = {
  id: string
  name: string
  kind: 'dir' | 'file'
  path: string
  depth: number
  expandable: boolean
}

export type ProjectCodeFile = {
  path: string
  name: string
  lang: string
  content: string
}

function authInit(): RequestInit {
  const token = getWenguAuthToken()
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}

async function readOk<T extends { ok?: boolean; message?: string; error?: { message?: string } }>(
  res: Response,
): Promise<T> {
  const data = await readWenguJsonResponse<T>(res)
  if (!res.ok || data.ok === false) {
    throw new WenguApiError(
      data.message || data.error?.message || `请求失败（HTTP ${res.status}）`,
      res.status,
    )
  }
  return data
}

export async function loadProjectCodeTree(): Promise<{ tree: ProjectCodeNode[]; count: number; message?: string }> {
  const res = await wenguApiFetch('/api/project-code/tree', { ...authInit(), cacheBust: true })
  const data = await readOk<{ ok: boolean; tree?: ProjectCodeNode[]; count?: number; message?: string }>(res)
  return { tree: data.tree ?? [], count: data.count ?? 0, message: data.message }
}

export async function loadProjectCodeFile(filePath: string): Promise<ProjectCodeFile> {
  const q = encodeURIComponent(filePath)
  const res = await wenguApiFetch(`/api/project-code/file?path=${q}`, { ...authInit(), cacheBust: true })
  const data = await readOk<ProjectCodeFile & { ok: boolean }>(res)
  return { path: data.path, name: data.name, lang: data.lang, content: data.content }
}

const FILES_CHUNK = 80

export async function loadProjectCodeFiles(paths: string[]): Promise<ProjectCodeFile[]> {
  const list = paths.map((p) => String(p || '').trim()).filter(Boolean)
  if (!list.length) return []
  const files: ProjectCodeFile[] = []
  const auth = authInit()
  for (let i = 0; i < list.length; i += FILES_CHUNK) {
    const slice = list.slice(i, i + FILES_CHUNK)
    const res = await wenguApiFetch('/api/project-code/files', {
      ...auth,
      method: 'POST',
      headers: {
        ...(auth.headers ?? {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths: slice }),
    })
    const data = await readOk<{ ok: boolean; files?: ProjectCodeFile[] }>(res)
    files.push(...(data.files ?? []))
  }
  return files
}

export function collectProjectCodePaths(nodes: ProjectCodeNode[]): string[] {
  const out: string[] = []
  for (const node of nodes) {
    if (node.kind === 'file') out.push(node.path)
    else if (node.children?.length) out.push(...collectProjectCodePaths(node.children))
  }
  return out
}

export function findProjectCodeNode(nodes: ProjectCodeNode[], path: string): ProjectCodeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children?.length) {
      const hit = findProjectCodeNode(node.children, path)
      if (hit) return hit
    }
  }
  return null
}

export function collectProjectCodePathsUnder(nodes: ProjectCodeNode[], path: string): string[] {
  const rel = String(path || '').replace(/\\/g, '/').trim()
  if (!rel || rel === '.') return collectProjectCodePaths(nodes)
  const node = findProjectCodeNode(nodes, rel)
  if (!node) return []
  if (node.kind === 'file') return [node.path]
  return collectProjectCodePaths(node.children || [])
}

export function flattenProjectCodeRows(
  nodes: ProjectCodeNode[],
  expanded: Record<string, boolean>,
  depth = 0,
): ProjectCodeRow[] {
  const rows: ProjectCodeRow[] = []
  for (const node of nodes) {
    const expandable = node.kind === 'dir' && Boolean(node.children?.length)
    rows.push({
      id: node.id,
      name: node.name,
      kind: node.kind,
      path: node.path,
      depth,
      expandable,
    })
    if (node.kind === 'dir' && expandable && expanded[node.id] && node.children) {
      rows.push(...flattenProjectCodeRows(node.children, expanded, depth + 1))
    }
  }
  return rows
}
