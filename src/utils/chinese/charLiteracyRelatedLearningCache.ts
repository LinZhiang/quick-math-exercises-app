/**
 * 重点题 · 字音字形「关联学习」AI 学习包本地缓存。
 */
import {
  charLiteracyRelatedContentKey,
  isCharLiteracyRelatedMaterialsPack,
  stripCharLiteracyRelatedQuiz,
  type CharLiteracyRelatedLearningPack,
  type CharLiteracyRelatedSourceRow,
} from '@/utils/chinese/charLiteracyRelatedLearning'

const STORAGE_KEY = 'chinese-char-literacy-related-learning-cache-v1'
const MAX_ENTRIES = 240

type CacheEntry = {
  fingerprint: string
  term: string
  contentKey: string
  pack: CharLiteracyRelatedLearningPack
  savedAt: number
}

type CacheStore = {
  v: 1
  entries: Record<string, CacheEntry>
}

function readStore(): CacheStore {
  try {
    if (typeof localStorage === 'undefined') return { v: 1, entries: {} }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: 1, entries: {} }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { v: 1, entries: {} }
    const entries = (parsed as CacheStore).entries
    if (!entries || typeof entries !== 'object') return { v: 1, entries: {} }
    return { v: 1, entries: entries as Record<string, CacheEntry> }
  } catch {
    return { v: 1, entries: {} }
  }
}

function writeStore(store: CacheStore) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function evictIfNeeded(entries: Record<string, CacheEntry>) {
  const keys = Object.keys(entries)
  if (keys.length <= MAX_ENTRIES) return
  const sorted = keys
    .map((k) => ({ k, t: entries[k]?.savedAt ?? 0 }))
    .sort((a, b) => a.t - b.t)
  const drop = sorted.length - MAX_ENTRIES
  for (let i = 0; i < drop; i++) {
    const k = sorted[i]?.k
    if (k) delete entries[k]
  }
}

export function getCharLiteracyRelatedLearningCache(
  row: Pick<
    CharLiteracyRelatedSourceRow,
    'fingerprint' | 'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'
  >,
): CharLiteracyRelatedLearningPack | null {
  const fp = String(row.fingerprint ?? '').trim()
  if (!fp) return null
  const store = readStore()
  const entry = store.entries[fp]
  if (!entry || entry.fingerprint !== fp) return null
  if (entry.contentKey !== charLiteracyRelatedContentKey(row)) return null
  if (!isCharLiteracyRelatedMaterialsPack(entry.pack)) {
    delete store.entries[fp]
    writeStore(store)
    return null
  }
  return stripCharLiteracyRelatedQuiz(entry.pack)
}

export function setCharLiteracyRelatedLearningCache(
  row: Pick<
    CharLiteracyRelatedSourceRow,
    'fingerprint' | 'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'
  >,
  pack: CharLiteracyRelatedLearningPack,
): void {
  const fp = String(row.fingerprint ?? '').trim()
  if (!fp || !isCharLiteracyRelatedMaterialsPack(pack)) return
  const store = readStore()
  store.entries[fp] = {
    fingerprint: fp,
    term: row.term.trim() || pack.term,
    contentKey: charLiteracyRelatedContentKey(row),
    pack: stripCharLiteracyRelatedQuiz(pack),
    savedAt: Date.now(),
  }
  evictIfNeeded(store.entries)
  writeStore(store)
}

export function pruneCharLiteracyRelatedLearningCache(
  keepFingerprints: Iterable<string>,
): number {
  const keep = new Set(
    [...keepFingerprints].map((x) => String(x ?? '').trim()).filter(Boolean),
  )
  const store = readStore()
  let removed = 0
  for (const key of Object.keys(store.entries)) {
    if (keep.has(key)) continue
    delete store.entries[key]
    removed += 1
  }
  if (removed) writeStore(store)
  return removed
}
