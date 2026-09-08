export type LayeredCatalogNode<E = { id: string }> = {
  id: string
  name: string
  children: LayeredCatalogNode<E>[]
  entries: E[]
  private?: boolean
  loaded?: boolean
  hasBody?: boolean
}

export function catalogNodeHasBody(node: {
  children?: unknown[]
  entries?: unknown[]
  loaded?: boolean
  hasBody?: boolean
}): boolean {
  if (node.loaded === false) return Boolean(node.hasBody)
  return (node.children?.length ?? 0) > 0 || (node.entries?.length ?? 0) > 0 || Boolean(node.hasBody)
}

export function snapshotCatalogNodes<T extends LayeredCatalogNode>(nodes: T[]): T[] {
  return nodes.map((node) => ({
    ...node,
    entries: [...(node.entries || [])],
    children: snapshotCatalogNodes(node.children as T[]),
  }))
}

export function asCatalogStub<T extends LayeredCatalogNode>(node: T): T {
  return {
    ...node,
    children: [],
    entries: [],
    loaded: false,
    hasBody: Boolean(node.hasBody || catalogNodeHasBody({ ...node, loaded: true })),
  }
}

export function mergeCatalogLayer<T extends LayeredCatalogNode>(
  tree: T[],
  parentId: string,
  children: T[],
  entries: T['entries'],
): T[] {
  const next = snapshotCatalogNodes(tree)
  if (!parentId) return children.map((node) => asCatalogStub(node))
  const hit = findLayeredNode(next, parentId)
  if (!hit) return next
  hit.node.children = children.map((node) => asCatalogStub(node))
  hit.node.entries = [...(entries || [])]
  hit.node.loaded = true
  hit.node.hasBody = hit.node.children.length > 0 || hit.node.entries.length > 0
  return next
}

export function findLayeredNode<T extends LayeredCatalogNode>(
  nodes: T[],
  id: string,
  parent: T | null = null,
): { node: T; parent: T | null } | null {
  for (const node of nodes) {
    if (node.id === id) return { node, parent }
    const nested = findLayeredNode(node.children as T[], id, node)
    if (nested) return nested
  }
  return null
}
