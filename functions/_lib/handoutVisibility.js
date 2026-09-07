/** 讲义目录公开/私密。private=true 时仅管理员可见；子树继承父分类的私密。 */

export function isPrivateFlag(value) {
  return value === true
}

export function applyPrivacyFlag(target, body) {
  if (!target || !body || !Object.prototype.hasOwnProperty.call(body, 'private')) return false
  if (body.private) target.private = true
  else delete target.private
  return true
}

export function filterPublicCatalog(nodes) {
  const list = Array.isArray(nodes) ? nodes : []
  const out = []
  for (const node of list) {
    if (isPrivateFlag(node?.private)) continue
    const children = filterPublicCatalog(node.children)
    const entries = Array.isArray(node.entries)
      ? node.entries.filter((entry) => !isPrivateFlag(entry?.private))
      : []
    out.push({ ...node, children, entries })
  }
  return out
}

/** @returns {{ found: boolean, private: boolean }} */
export function catalogIdPrivacy(nodes, id, inherited = false) {
  const list = Array.isArray(nodes) ? nodes : []
  for (const node of list) {
    const locked = inherited || isPrivateFlag(node?.private)
    if (node.id === id) return { found: true, private: locked }
    for (const entry of node.entries || []) {
      if (entry.id === id) return { found: true, private: locked || isPrivateFlag(entry.private) }
    }
    const nested = catalogIdPrivacy(node.children, id, locked)
    if (nested.found) return nested
  }
  return { found: false, private: false }
}

export function guestMayReadCatalogId(tree, id, isAdmin) {
  if (isAdmin) return true
  const vis = catalogIdPrivacy(tree, id)
  return vis.found && !vis.private
}
