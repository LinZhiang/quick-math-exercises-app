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

/** 分类改公开或私密时，已加载的下级分类和讲义一起改。 */
export type CatalogPrivacyTarget = {
  private?: boolean
  entries?: { private?: boolean }[]
  children?: CatalogPrivacyTarget[]
}

export function writeCatalogPrivacy(target: CatalogPrivacyTarget, isPrivate: boolean) {
  if (isPrivate) target.private = true
  else delete target.private
  for (const entry of target.entries || []) {
    if (isPrivate) entry.private = true
    else delete entry.private
  }
  for (const child of target.children || []) writeCatalogPrivacy(child, isPrivate)
}

export function catalogContainsId<T extends CatalogPrivacyNode>(nodes: T[], id: string): boolean {
  for (const node of nodes) {
    if (node.id === id) return true
    if ((node.entries || []).some((entry) => entry.id === id)) return true
    if (catalogContainsId(node.children, id)) return true
  }
  return false
}
