/** 运算技巧组卷：近期指纹，降低连续重生成数字撞车 */

const LIMIT = 48
const store = new Map<string, string[]>()

export function listRecentOpFingerprints(topic: string): Set<string> {
  return new Set(store.get(topic) ?? [])
}

export function appendRecentOpFingerprints(topic: string, fingerprints: string[]) {
  const prev = store.get(topic) ?? []
  const next = [...prev]
  for (const fp of fingerprints) {
    const t = fp.trim()
    if (!t) continue
    const i = next.indexOf(t)
    if (i >= 0) next.splice(i, 1)
    next.push(t)
  }
  store.set(topic, next.slice(-LIMIT))
}
