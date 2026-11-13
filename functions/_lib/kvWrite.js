/** Cloudflare KV 每天写入次数有限。重复 put、失败后继续 put，都会把额度打光。 */

export const KV_QUOTA_MESSAGE =
  '今天云端写入次数已用完。已有讲义还能看；新增、修改请等到明天（UTC 0 点）再保存。请先别连续点保存或刷新。'

let writesBlocked = false

export function isKvQuotaError(err) {
  const msg = String(err?.message || err || '')
  return /put\(\) limit exceeded|KV put|limit exceeded for the day/i.test(msg)
}

export async function kvPut(store, key, value, opts) {
  if (!store) throw new Error('云端存储不可用')
  if (writesBlocked) {
    const err = new Error(KV_QUOTA_MESSAGE)
    err.code = 'KV_QUOTA'
    throw err
  }
  try {
    await store.put(key, value, opts)
  } catch (e) {
    if (isKvQuotaError(e)) {
      writesBlocked = true
      const err = new Error(KV_QUOTA_MESSAGE)
      err.code = 'KV_QUOTA'
      throw err
    }
    throw e
  }
}

/** 正文没变就不要再 put 一次。 */
export async function kvPutIfChanged(store, key, value, opts) {
  const next = typeof value === 'string' ? value : null
  if (next != null) {
    try {
      const prev = await store.get(key, { type: 'text' })
      if (prev === next) return false
    } catch {
      /* 读失败仍尝试写 */
    }
  }
  await kvPut(store, key, value, opts)
  return true
}
