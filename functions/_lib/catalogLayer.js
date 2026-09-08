/**
 * 目录按层切片：默认只给一层 stub，展开时再取子层。
 * 只用于 GET 响应，不写回 catalog。
 */

export function findCatalogNode(nodes, id, parent = null) {
  const list = Array.isArray(nodes) ? nodes : []
  for (const node of list) {
    if (node?.id === id) return { node, parent, siblings: list }
    const hit = findCatalogNode(node?.children || [], id, node)
    if (hit) return hit
  }
  return null
}

export function catalogNodeHasBody(node) {
  const children = node?.children
  const entries = node?.entries
  return (Array.isArray(children) && children.length > 0) || (Array.isArray(entries) && entries.length > 0)
}

export function toCatalogStub(node) {
  const rest = { ...(node && typeof node === 'object' ? node : {}) }
  delete rest.children
  delete rest.entries
  delete rest.loaded
  delete rest.hasBody
  return {
    ...rest,
    children: [],
    entries: [],
    loaded: false,
    hasBody: catalogNodeHasBody(node),
  }
}

export function sliceCatalogLayer(tree, parentRaw) {
  const parentId =
    parentRaw === '' || parentRaw === '__root__' || parentRaw == null ? '' : String(parentRaw)
  if (!parentId) {
    return {
      parentId: '',
      tree: (Array.isArray(tree) ? tree : []).map(toCatalogStub),
      entries: [],
    }
  }
  const hit = findCatalogNode(tree, parentId)
  if (!hit) return null
  return {
    parentId,
    tree: (hit.node.children || []).map(toCatalogStub),
    entries: Array.isArray(hit.node.entries) ? hit.node.entries : [],
  }
}

export function treeParentFromRequest(request) {
  try {
    return new URL(request.url).searchParams.get('parent')
  } catch {
    return null
  }
}

export function treeParentFromQuery(query) {
  const raw = query?.parent
  if (raw == null) return null
  return Array.isArray(raw) ? String(raw[0] ?? '') : String(raw)
}
