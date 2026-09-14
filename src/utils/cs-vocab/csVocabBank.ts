import { ref } from 'vue'
import type { CsVocabBankItem } from '@/utils/cs-vocab/csVocabBankTypes'
import empty from '@/utils/cs-vocab/bank.empty.json'
import { readWenguJsonResponse, wenguApiFetch } from '@/utils/computer/wenguApiFetch'

type Pack = { items?: CsVocabBankItem[]; revision?: string; ok?: boolean }

const generated = import.meta.glob('./bank.generated.json', { eager: true, import: 'default' }) as Record<
  string,
  Pack | CsVocabBankItem[]
>

export const csVocabBankTick = ref(0)
export const CS_VOCAB_BANK: CsVocabBankItem[] = []

function isItem(row: unknown): row is CsVocabBankItem {
  if (!row || typeof row !== 'object') return false
  const o = row as Record<string, unknown>
  return (
    typeof o.stem === 'string' &&
    typeof o.correct === 'string' &&
    Array.isArray(o.distractors) &&
    typeof o.key === 'string' &&
    typeof o.topic === 'string'
  )
}

function normalizeItems(raw: unknown): CsVocabBankItem[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as Pack).items)
      ? (raw as Pack).items
      : []
  return (list ?? []).filter(isItem)
}

function loadBundled(): CsVocabBankItem[] {
  const raw = generated['./bank.generated.json']
  const fromGlob = normalizeItems(raw)
  if (fromGlob.length) return fromGlob
  return normalizeItems(empty)
}

function setBank(items: CsVocabBankItem[]) {
  if (!items.length) return
  CS_VOCAB_BANK.length = 0
  CS_VOCAB_BANK.push(...items)
  csVocabBankTick.value += 1
}

function takeIfRicher(items: CsVocabBankItem[]) {
  if (items.length > CS_VOCAB_BANK.length) setBank(items)
}

setBank(loadBundled())

const IDB_NAME = 'wengu-cs-vocab'
const IDB_STORE = 'bank'
const IDB_KEY = 'cs-vocab-bank-v1'

type CacheRow = { revision: string; items: CsVocabBankItem[]; savedAt: number }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('idb'))
  })
}

async function readCache(): Promise<CacheRow | null> {
  if (typeof indexedDB === 'undefined') return null
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
      req.onsuccess = () => resolve((req.result as CacheRow) ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function writeCache(row: CacheRow): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(row, IDB_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

async function loadStaticBank(): Promise<CsVocabBankItem[]> {
  try {
    const res = await fetch('/cs-vocab/bank.json', { cache: 'no-store' })
    if (!res.ok) return []
    return normalizeItems(await res.json())
  } catch {
    return []
  }
}

let hydratePromise: Promise<void> | null = null

export function hydrateCsVocabBank(): Promise<void> {
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    const cached = await readCache()
    takeIfRicher(cached?.items ?? [])
    takeIfRicher(await loadStaticBank())
    try {
      const res = await wenguApiFetch('/api/cs-vocab/bank')
      const data = await readWenguJsonResponse<Pack>(res)
      const items = normalizeItems(data)
      if (items.length) {
        takeIfRicher(items)
        await writeCache({
          revision: String(data.revision || ''),
          items: CS_VOCAB_BANK.slice(),
          savedAt: Date.now(),
        })
      }
    } catch {
      /* 离线时用打包稿 / 静态文件 / IndexedDB */
    }
    if (CS_VOCAB_BANK.length) {
      await writeCache({
        revision: String(cached?.revision || CS_VOCAB_BANK.length),
        items: CS_VOCAB_BANK.slice(),
        savedAt: Date.now(),
      })
    }
  })().finally(() => {
    hydratePromise = null
  })
  return hydratePromise
}
