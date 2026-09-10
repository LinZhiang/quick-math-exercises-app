/**
 * 错题集等用户数据：Node 为源，IndexedDB 做本机缓存，内存同步读。
 * 未登录时仍可读本地缓存；登录后与服务端对账。
 */
import { ref } from 'vue'
import { getWenguAuthToken } from '@/utils/computer/wenguAuthStore'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'

/** 远端/缓存灌入后递增，让各错题集列表重新读 */
export const userJsonEpoch = ref(0)

export const USER_KV_KEYS = [
  'mental-math-wrong-book-v1',
  'mental-math-favorite-book-v1',
  'mental-math-wrong-notes-v1',
  'wrong-book-review-stats-v1',
  'chinese-key-question-notes-v1',
  'chinese-practice-wrong-v1',
  'chinese-practice-favorite-v1',
  'chinese-word-memorization-wrong-v1',
  'chinese-word-memorization-favorite-v1',
  'chinese-char-literacy-wrong-v1',
  'chinese-char-literacy-favorite-v1',
  'chinese-poetry-wrong-v1',
  'chinese-poetry-favorite-v1',
  'chinese-classical-chinese-wrong-v1',
  'chinese-classical-chinese-favorite-v1',
  'chinese-rhetoric-usage-wrong-v1',
  'chinese-rhetoric-usage-favorite-v1',
  'chinese-reading-comprehension-wrong-v1',
  'chinese-reading-comprehension-favorite-v1',
  'chinese-history-common-sense-wrong-v1',
  'chinese-history-common-sense-favorite-v1',
  'chinese-party-history-wrong-v1',
  'chinese-party-history-favorite-v1',
  'chinese-theory-policy-wrong-v1',
  'chinese-theory-policy-favorite-v1',
  'chinese-legal-common-sense-wrong-v1',
  'chinese-legal-common-sense-favorite-v1',
  'chinese-economy-common-sense-wrong-v1',
  'chinese-economy-common-sense-favorite-v1',
  'chinese-life-common-sense-wrong-v1',
  'chinese-life-common-sense-favorite-v1',
  'chinese-geography-common-sense-wrong-v1',
  'chinese-geography-common-sense-favorite-v1',
  'chinese-memorization-wrong-v1',
  'computer-handout-quiz-wrong-v1',
  'computer-handout-quiz-favorite-v1',
  'computer-handout-quiz-notes-v1',
  'frontend-handout-quiz-wrong-v1',
  'frontend-handout-quiz-favorite-v1',
  'frontend-handout-quiz-notes-v1',
] as const

const ALLOWED = new Set<string>(USER_KV_KEYS)

const DB_NAME = 'wengu-user-kv'
const DB_VERSION = 1
const STORE = 'kv'
const SCHEMA = 1

const memory = new Map<string, string>()
const dirty = new Set<string>()
let dbPromise: Promise<IDBDatabase> | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
let hydratePromise: Promise<void> | null = null

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
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
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

function idbGet(key: string): Promise<string | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(key)
        req.onsuccess = () => {
          const rec = req.result as { schema?: number; text?: string } | string | undefined
          if (typeof rec === 'string') resolve(rec)
          else if (rec && rec.schema === SCHEMA && typeof rec.text === 'string') resolve(rec.text)
          else resolve(undefined)
        }
        req.onerror = () => reject(req.error)
      }),
  )
}

function idbPut(key: string, text: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put({ schema: SCHEMA, text, savedAt: Date.now() }, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

function parseJson<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

function readLocalRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocalRaw(key: string, text: string) {
  try {
    localStorage.setItem(key, text)
  } catch {
    /* quota */
  }
}

export function readUserJson<T>(key: string, fallback: T): T {
  void userJsonEpoch.value
  const mem = memory.get(key)
  if (mem != null) return parseJson(mem, fallback)
  const local = readLocalRaw(key)
  if (local != null) {
    memory.set(key, local)
    return parseJson(local, fallback)
  }
  return fallback
}

export function writeUserJson(key: string, value: unknown) {
  const text = JSON.stringify(value)
  memory.set(key, text)
  writeLocalRaw(key, text)
  if (!ALLOWED.has(key)) return
  void idbPut(key, text).catch(() => undefined)
  dirty.add(key)
  scheduleFlush()
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushDirty()
  }, 280)
}

async function flushDirty() {
  const token = getWenguAuthToken()
  if (!token || !dirty.size) return
  const entries: Record<string, unknown> = {}
  for (const key of [...dirty]) {
    if (!ALLOWED.has(key)) {
      dirty.delete(key)
      continue
    }
    const text = memory.get(key)
    if (text == null) {
      dirty.delete(key)
      continue
    }
    entries[key] = parseJson(text, null)
  }
  const keys = Object.keys(entries)
  if (!keys.length) return
  try {
    const res = await wenguApiFetch('/api/user-kv', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entries }),
    })
    if (!res.ok) return
    for (const key of keys) dirty.delete(key)
  } catch {
    /* 离线时留在 dirty，下次再推 */
  }
}

export async function hydrateUserJsonStore(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    for (const key of USER_KV_KEYS) {
      try {
        const disk = await idbGet(key)
        if (disk != null && !memory.has(key)) memory.set(key, disk)
      } catch {
        /* ignore */
      }
    }
    const token = getWenguAuthToken()
    if (token) {
      try {
        const res = await wenguApiFetch('/api/user-kv', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status !== 401 && res.status !== 404) {
          const data = await readWenguJsonResponse<{ ok?: boolean; entries?: Record<string, unknown> }>(res)
          if (res.ok && data.ok && data.entries) {
            const remote = data.entries
            const toPush: Record<string, unknown> = {}
            for (const key of USER_KV_KEYS) {
              const hasRemote = Object.prototype.hasOwnProperty.call(remote, key)
              if (hasRemote) {
                const text = JSON.stringify(remote[key])
                memory.set(key, text)
                writeLocalRaw(key, text)
                void idbPut(key, text).catch(() => undefined)
              } else {
                const local = memory.get(key) ?? readLocalRaw(key)
                if (local) toPush[key] = parseJson(local, null)
              }
            }
            if (Object.keys(toPush).length) {
              await wenguApiFetch('/api/user-kv', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ entries: toPush }),
              })
            }
          }
        }
      } catch {
        /* 离线用缓存 */
      }
    }
    userJsonEpoch.value += 1
  })().finally(() => {
    hydratePromise = null
  })
  return hydratePromise
}
