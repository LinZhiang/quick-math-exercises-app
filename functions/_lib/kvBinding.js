/**
 * Pages 上的讲义库：优先用绑定名 WENGU_KV。
 * 控制台若绑成别的名字（含 KV），也能认。
 * 若没绑 namespace、但配了 Account + Token + NamespaceId，走 KV REST，效果一样。
 */
const BINDING_NAMES = ['WENGU_KV', 'KV', 'WENGU_STORE']

function looksLikeKv(value) {
  return Boolean(
    value &&
      typeof value.get === 'function' &&
      typeof value.put === 'function' &&
      typeof value.delete === 'function' &&
      typeof value.list === 'function',
  )
}

function restConfig(env) {
  const accountId = String(env?.CLOUDFLARE_ACCOUNT_ID || env?.CF_ACCOUNT_ID || '').trim()
  const namespaceId = String(env?.WENGU_KV_NAMESPACE_ID || env?.WENGU_KV_ID || '').trim()
  const token = String(env?.CLOUDFLARE_API_TOKEN || env?.CF_API_TOKEN || '').trim()
  if (!accountId || !namespaceId || !token) return null
  return { accountId, namespaceId, token }
}

function createRestKv({ accountId, namespaceId, token }) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`
  const headers = { authorization: `Bearer ${token}` }

  async function cf(path, init = {}) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers || {}) },
    })
    return res
  }

  return {
    async get(key, opts = {}) {
      const res = await cf(`/values/${encodeURIComponent(key)}`)
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`KV 读取失败（HTTP ${res.status}）`)
      if (opts.type === 'json') return res.json()
      if (opts.type === 'arrayBuffer') return res.arrayBuffer()
      return res.text()
    },
    async getWithMetadata(key, opts = {}) {
      const value = await this.get(key, opts)
      if (value == null) return { value: null, metadata: null }
      let metadata = null
      try {
        const metaRes = await cf(`/metadata/${encodeURIComponent(key)}`)
        if (metaRes.ok) {
          const body = await metaRes.json()
          metadata = body?.result ?? body ?? null
        }
      } catch {
        metadata = null
      }
      return { value, metadata }
    },
    async put(key, value, opts = {}) {
      const isBin = value instanceof ArrayBuffer || ArrayBuffer.isView(value)
      const body = isBin ? value : String(value)
      const url = new URL(`${base}/values/${encodeURIComponent(key)}`)
      if (opts.metadata) url.searchParams.set('metadata', JSON.stringify(opts.metadata))
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          'content-type': isBin ? 'application/octet-stream' : 'text/plain;charset=UTF-8',
        },
        body,
      })
      if (!res.ok) throw new Error(`KV 写入失败（HTTP ${res.status}）`)
    },
    async delete(key) {
      const res = await cf(`/values/${encodeURIComponent(key)}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error(`KV 删除失败（HTTP ${res.status}）`)
    },
    async list(opts = {}) {
      const url = new URL(`${base}/keys`)
      if (opts.prefix) url.searchParams.set('prefix', opts.prefix)
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`KV 列举失败（HTTP ${res.status}）`)
      const body = await res.json()
      const keys = (body?.result || []).map((row) => ({ name: row.name, metadata: row.metadata }))
      return { keys }
    },
  }
}

export function getWenguKv(env) {
  if (!env) return null
  for (const name of BINDING_NAMES) {
    if (looksLikeKv(env[name])) return env[name]
  }
  for (const [key, value] of Object.entries(env)) {
    if (/kv/i.test(key) && looksLikeKv(value)) return value
  }
  const rest = restConfig(env)
  return rest ? createRestKv(rest) : null
}

export function kvMissingMessage() {
  return '云端讲义库还没接上（WENGU_KV）。本机执行 npm run setup:cf-storage，再部署并 npm run sync:cf-frontend。配好后手机即可增删改，不必开家里电脑。'
}
