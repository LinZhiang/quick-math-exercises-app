/**
 * 讲义目录 / 正文本机缓存。
 * 用 IndexedDB 存完整内容；每次先问服务端一个很小的 revision，
 * 没变就直接用磁盘，别的设备改过再重新拉取。
 */
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'

export type HandoutCacheScope = 'frontend' | 'computer'

export type HandoutRevisionPeek =
  | { status: 'ok'; revision: string }
  | { status: 'offline' }
  | { status: 'missing' }

type TreeRecord<T> = { revision: string; tree: T; savedAt: number }
type ItemRecord<T> = { revision: string; item: T; savedAt: number }

const DB_NAME = 'wengu-handout-cache'
const DB_VERSION = 1
const STORE_TREE = 'tree'
const STORE_ITEMS = 'items'

const REVISION_PATH: Record<HandoutCacheScope, string> = {
  frontend: '/api/frontend-learning/revision',
  computer: '/api/computer-basics/revision',
}

const REVISION_MEMO_MS = 2500

const revisionMemo = new Map<HandoutCacheScope, { revision: string; at: number }>()
const revisionInflight = new Map<HandoutCacheScope, Promise<HandoutRevisionPeek>>()

let dbPromise: Promise<IDBDatabase> | null = null

function canUseIdb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  if (!canUseIdb()) return Promise.reject(new Error('no indexedDB'))
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE_TREE)) db.createObjectStore(STORE_TREE)
        if (!db.objectStoreNames.contains(STORE_ITEMS)) db.createObjectStore(STORE_ITEMS)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => {
        dbPromise = null
        reject(req.error ?? new Error('indexedDB open failed'))
      }
    })
  }
  return dbPromise
}

function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly')
        const req = tx.objectStore(store).get(key)
        req.onsuccess = () => resolve(req.result as T | undefined)
        req.onerror = () => reject(req.error)
      }),
  )
}

function idbPut(store: string, key: string, value: unknown): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        tx.objectStore(store).put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

function itemKey(scope: HandoutCacheScope, id: string): string {
  return `${scope}:${id}`
}

export function rememberHandoutRevision(scope: HandoutCacheScope, revision: string) {
  const stamp = String(revision || '').trim()
  if (!stamp) return
  revisionMemo.set(scope, { revision: stamp, at: Date.now() })
}

export function invalidateHandoutRevisionMemo(scope: HandoutCacheScope) {
  revisionMemo.delete(scope)
  revisionInflight.delete(scope)
}

export async function peekHandoutRevision(scope: HandoutCacheScope): Promise<HandoutRevisionPeek> {
  const memo = revisionMemo.get(scope)
  if (memo && Date.now() - memo.at < REVISION_MEMO_MS) {
    return { status: 'ok', revision: memo.revision }
  }
  const inflight = revisionInflight.get(scope)
  if (inflight) return inflight
  const next = fetchHandoutRevision(scope).finally(() => {
    if (revisionInflight.get(scope) === next) revisionInflight.delete(scope)
  })
  revisionInflight.set(scope, next)
  return next
}

async function fetchHandoutRevision(scope: HandoutCacheScope): Promise<HandoutRevisionPeek> {
  try {
    const res = await wenguApiFetch(REVISION_PATH[scope])
    if (res.status === 404) return { status: 'missing' }
    const data = await readWenguJsonResponse<{ ok?: boolean; revision?: string }>(res)
    const revision = String(data.revision || '').trim()
    if (!res.ok || !data.ok || !revision) return { status: 'missing' }
    rememberHandoutRevision(scope, revision)
    return { status: 'ok', revision }
  } catch {
    return { status: 'offline' }
  }
}

export async function readHandoutCachedTree<T>(scope: HandoutCacheScope): Promise<TreeRecord<T> | null> {
  try {
    const rec = await idbGet<TreeRecord<T>>(STORE_TREE, scope)
    if (!rec || !Array.isArray(rec.tree) || !rec.revision) return null
    return rec
  } catch {
    return null
  }
}

export function writeHandoutCachedTree<T>(scope: HandoutCacheScope, revision: string, tree: T): void {
  const stamp = String(revision || '').trim()
  if (!stamp) return
  rememberHandoutRevision(scope, stamp)
  void idbPut(STORE_TREE, scope, { revision: stamp, tree, savedAt: Date.now() } satisfies TreeRecord<T>).catch(
    () => undefined,
  )
}

export async function readHandoutCachedItem<T>(
  scope: HandoutCacheScope,
  id: string,
): Promise<ItemRecord<T> | null> {
  const key = String(id || '').trim()
  if (!key) return null
  try {
    const rec = await idbGet<ItemRecord<T>>(STORE_ITEMS, itemKey(scope, key))
    if (!rec || !rec.item || !rec.revision) return null
    return rec
  } catch {
    return null
  }
}

export function writeHandoutCachedItem<T>(
  scope: HandoutCacheScope,
  id: string,
  revision: string,
  item: T,
): void {
  const key = String(id || '').trim()
  const stamp = String(revision || '').trim()
  if (!key || !stamp) return
  void idbPut(STORE_ITEMS, itemKey(scope, key), {
    revision: stamp,
    item,
    savedAt: Date.now(),
  } satisfies ItemRecord<T>).catch(() => undefined)
}
