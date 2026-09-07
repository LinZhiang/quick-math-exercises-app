export type CatalogPrivacyNode<TEntry extends { id: string; private?: boolean } = { id: string; private?: boolean }> = {
  id: string
  private?: boolean
  children: CatalogPrivacyNode<TEntry>[]
  entries: TEntry[]
}

export function isPrivateFlag(value: unknown): boolean {
  return value === true
}

export function filterPublicCatalog<T extends CatalogPrivacyNode>(nodes: T[]): T[] {
  const out: T[] = []
  for (const node of nodes) {
    if (isPrivateFlag(node.private)) continue
    out.push({
      ...node,
      children: filterPublicCatalog(node.children),
      entries: (node.entries || []).filter((entry) => !isPrivateFlag(entry.private)),
    })
  }
  return out
}

export function collectCatalogIds<T extends CatalogPrivacyNode>(nodes: T[], out = new Set<string>()): Set<string> {
  for (const node of nodes) {
    out.add(node.id)
    for (const entry of node.entries || []) out.add(entry.id)
    collectCatalogIds(node.children, out)
  }
  return out
}

export function catalogRowLocked(
  inherited: boolean,
  own?: boolean,
): boolean {
  return inherited || isPrivateFlag(own)
}

export function catalogContainsId<T extends CatalogPrivacyNode>(nodes: T[], id: string): boolean {
  for (const node of nodes) {
    if (node.id === id) return true
    if ((node.entries || []).some((entry) => entry.id === id)) return true
    if (catalogContainsId(node.children, id)) return true
  }
  return false
}
