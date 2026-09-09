/**
 * 讲义目录/正文写入保护：公开给别人看的材料，禁止用残目录或过短正文覆盖。
 * Node 本地与 Cloudflare KV 共用。
 */
import { findCatalogNode } from './catalogLayer.js'

export function collectCatalogIds(nodes, out = new Set()) {
  for (const n of nodes || []) {
    if (n?.id) out.add(n.id)
    for (const e of n.entries || []) {
      if (e?.id) out.add(e.id)
    }
    collectCatalogIds(n.children, out)
  }
  return out
}

/** GET 懒加载 stub 绝不能当完整目录写回。 */
export function catalogTreeLooksLikeStub(tree) {
  const walk = (nodes) => {
    for (const n of nodes || []) {
      if (n && n.loaded === false) return true
      if (walk(n.children)) return true
    }
    return false
  }
  return walk(tree)
}

export function assertCatalogNotStub(tree) {
  if (catalogTreeLooksLikeStub(tree)) {
    throw new Error('拒绝写入未展开的目录残片，以免覆盖已整理的讲义')
  }
}

export function stripCatalogClientFlags(tree) {
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return []
    return nodes.map((n) => {
      const next = { ...(n && typeof n === 'object' ? n : {}) }
      delete next.loaded
      delete next.hasBody
      next.children = walk(n?.children)
      next.entries = Array.isArray(n?.entries) ? n.entries.map((e) => ({ ...e })) : []
      return next
    })
  }
  return walk(tree)
}

/** 灌库/更新某一支时，保留用户后来加的子分类和讲义。 */
export function preserveUserSubtree(nextNode, oldNode) {
  if (!oldNode || !nextNode) return nextNode
  if (!Array.isArray(nextNode.children)) nextNode.children = []
  if (!Array.isArray(nextNode.entries)) nextNode.entries = []
  const childIds = new Set(nextNode.children.map((c) => c?.id).filter(Boolean))
  for (const child of oldNode.children || []) {
    if (child?.id && !childIds.has(child.id)) {
      nextNode.children.push(child)
      childIds.add(child.id)
    }
  }
  const entryIds = new Set(nextNode.entries.map((e) => e?.id).filter(Boolean))
  for (const entry of oldNode.entries || []) {
    if (entry?.id && !entryIds.has(entry.id)) {
      nextNode.entries.push(entry)
      entryIds.add(entry.id)
    }
  }
  for (const child of nextNode.children) {
    const oldChild = (oldNode.children || []).find((c) => c.id === child.id)
    if (oldChild) preserveUserSubtree(child, oldChild)
  }
  return nextNode
}

/** 整树导入时，把旧目录里多出来的分类/讲义接回去。 */
export function graftUserCatalog(packTree, prevTree) {
  const next = Array.isArray(packTree) ? packTree : []
  if (!Array.isArray(prevTree) || !prevTree.length) return next
  const packIds = collectCatalogIds(next)
  const walk = (nodes, parentId) => {
    for (const n of nodes || []) {
      if (!n?.id) continue
      if (!packIds.has(n.id)) {
        if (!parentId) next.push(n)
        else {
          const p = findCatalogNode(next, parentId)
          if (p) {
            if (!Array.isArray(p.node.children)) p.node.children = []
            p.node.children.push(n)
          } else next.push(n)
        }
        collectCatalogIds([n], packIds)
        continue
      }
      const extraEntries = (n.entries || []).filter((e) => e?.id && !packIds.has(e.id))
      if (extraEntries.length) {
        const p = findCatalogNode(next, n.id)
        if (p) {
          if (!Array.isArray(p.node.entries)) p.node.entries = []
          p.node.entries.push(...extraEntries)
          for (const e of extraEntries) packIds.add(e.id)
        }
      }
      walk(n.children, n.id)
    }
  }
  walk(prevTree, null)
  return next
}

export function handoutTextFingerprint(s) {
  return String(s || '')
    .replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, '')
    .replace(/\s+/g, '')
}

export function assertHandoutNotTruncated(prevContent, nextContent, id) {
  const prev = handoutTextFingerprint(prevContent)
  const next = handoutTextFingerprint(nextContent)
  if (prev.length >= 2000 && next.length < Math.floor(prev.length * 0.5)) {
    throw new Error(
      `拒绝用过短正文覆盖讲义「${id}」（${prev.length} → ${next.length} 字）。公开讲义不允许截断保存。`,
    )
  }
}
