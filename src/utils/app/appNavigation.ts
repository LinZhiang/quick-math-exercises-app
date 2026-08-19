import type { RouteLocationRaw, Router } from 'vue-router'

export function routerCanGoBack(): boolean {
  return typeof window !== 'undefined' && window.history.state?.back != null
}

export function goBackOr(router: Router, fallback: RouteLocationRaw) {
  if (routerCanGoBack()) router.back()
  else void router.replace(fallback)
}

export function omitQueryKey(
  query: Record<string, unknown>,
  key: string,
): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(query)) {
    if (k === key || v == null) continue
    if (Array.isArray(v)) {
      const first = v[0]
      if (first != null) next[k] = String(first)
    } else {
      next[k] = String(v)
    }
  }
  return next
}
