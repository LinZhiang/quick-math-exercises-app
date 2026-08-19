/**
 * 重点题 · 成语/词语「关联学习」AI 学习包本地缓存。
 * 按 kind + fingerprint 复用；题干/选项变化（contentKey）则失效；删除词条时减量清理。
 */
import {
  isVocabRelatedMaterialsPack,
  stripVocabRelatedQuiz,
  vocabRelatedContentKey,
  type VocabRelatedKind,
  type VocabRelatedLearningPack,
  type VocabRelatedSourceRow,
} from '@/utils/chinese/vocabRelatedLearning'

const STORAGE_KEY = 'chinese-vocab-related-learning-cache-v2'
const MAX_ENTRIES = 240

export type VocabRelatedCacheEntry = {
  kind: VocabRelatedKind
  fingerprint: string
  term: string
  contentKey: string
  pack: VocabRelatedLearningPack
  savedAt: number
}

type CacheStore = {
  v: 2
  entries: Record<string, VocabRelatedCacheEntry>
}

function cacheKey(kind: VocabRelatedKind, fingerprint: string): string {
  return `${kind}\u001e${fingerprint}`
}

function readStore(): CacheStore {
  try {
    if (typeof localStorage === 'undefined') return { v: 2, entries: {} }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: 2, entries: {} }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { v: 2, entries: {} }
    const entries = (parsed as CacheStore).entries
    if (!entries || typeof entries !== 'object') return { v: 2, entries: {} }
    return { v: 2, entries: entries as Record<string, VocabRelatedCacheEntry> }
  } catch {
    return { v: 2, entries: {} }
  }
}

function writeStore(store: CacheStore) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function evictIfNeeded(entries: Record<string, VocabRelatedCacheEntry>) {
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

export function getVocabRelatedLearningCache(
  kind: VocabRelatedKind,
  row: Pick<VocabRelatedSourceRow, 'fingerprint' | 'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'>,
): VocabRelatedLearningPack | null {
  const fp = String(row.fingerprint ?? '').trim()
  if (!fp) return null
  const store = readStore()
  const entry = store.entries[cacheKey(kind, fp)]
  if (!entry) return null
  if (entry.kind !== kind || entry.fingerprint !== fp) return null
  if (entry.contentKey !== vocabRelatedContentKey(row)) return null
  if (!isVocabRelatedMaterialsPack(entry.pack)) {
    delete store.entries[cacheKey(kind, fp)]
    writeStore(store)
    return null
  }
  // 材料可复用；小测每次作答重新生成
  return stripVocabRelatedQuiz(entry.pack)
}

export function setVocabRelatedLearningCache(
  kind: VocabRelatedKind,
  row: Pick<VocabRelatedSourceRow, 'fingerprint' | 'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'>,
  pack: VocabRelatedLearningPack,
): void {
  const fp = String(row.fingerprint ?? '').trim()
  if (!fp || !isVocabRelatedMaterialsPack(pack)) return
  const store = readStore()
  store.entries[cacheKey(kind, fp)] = {
    kind,
    fingerprint: fp,
    term: row.term.trim() || pack.term,
    contentKey: vocabRelatedContentKey(row),
    // 缓存只落学习材料，小测不复用
    pack: stripVocabRelatedQuiz(pack),
    savedAt: Date.now(),
  }
  evictIfNeeded(store.entries)
  writeStore(store)
}

export function removeVocabRelatedLearningCache(
  kind: VocabRelatedKind,
  fingerprint: string,
): void {
  const fp = String(fingerprint ?? '').trim()
  if (!fp) return
  const store = readStore()
  const key = cacheKey(kind, fp)
  if (!(key in store.entries)) return
  delete store.entries[key]
  writeStore(store)
}

/**
 * 只保留仍存在于错题/收藏中的指纹；其余缓存删除（减量）。
 */
export function pruneVocabRelatedLearningCache(
  kind: VocabRelatedKind,
  keepFingerprints: Iterable<string>,
): number {
  const keep = new Set(
    [...keepFingerprints].map((x) => String(x ?? '').trim()).filter(Boolean),
  )
  const store = readStore()
  let removed = 0
  for (const key of Object.keys(store.entries)) {
    const entry = store.entries[key]
    if (!entry || entry.kind !== kind) continue
    if (keep.has(entry.fingerprint)) continue
    delete store.entries[key]
    removed += 1
  }
  if (removed) writeStore(store)
  return removed
}

export function hasVocabRelatedLearningCache(
  kind: VocabRelatedKind,
  row: Pick<VocabRelatedSourceRow, 'fingerprint' | 'term' | 'stem' | 'options' | 'correctIndex' | 'questionType'>,
): boolean {
  return getVocabRelatedLearningCache(kind, row) != null
}
