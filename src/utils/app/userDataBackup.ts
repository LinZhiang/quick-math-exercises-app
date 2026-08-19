/**
 * 本机练习数据打包 / 导入（手机与电脑互通）
 * - train：知识训练（错题收藏、日志、完成次数、出题去重等）
 * - bank：题库整理（个人题库 + 其测验日志/完成次数）
 * - wrong-favorite / user-data：旧版备份，仍可导入
 */
import { localDateKey } from '@/utils/app/practiceSessionLog'

export const WENGU_BACKUP_FORMAT = 'wengu-backup-v1' as const

export type WenguModuleBackupKind = 'train' | 'bank'
export type WenguLegacyBackupKind = 'wrong-favorite' | 'user-data'
export type WenguBackupKind = WenguModuleBackupKind | WenguLegacyBackupKind

export const MODULE_BACKUP_KINDS: WenguModuleBackupKind[] = ['train', 'bank']

export type WenguBackupFile = {
  format: typeof WENGU_BACKUP_FORMAT
  kind: WenguBackupKind
  exportedAt: string
  app: string
  /** localStorage 原始字符串（已是 JSON 文本） */
  entries: Record<string, string>
}

export type BackupImportMode = 'merge' | 'replace'

export type BackupApplyResult = {
  kind: WenguBackupKind
  keyCount: number
  written: number
  skipped: number
}

/** 绝不导出的密钥 / 会话 */
const SECRET_KEYS = new Set([
  'wengu-session-v1',
  'wengu-admin-session-v1',
  'wengu-member-session-v1',
  'wengu-deepseek-auth-v1',
])

const MIXED_LOG_KEY = 'practice-session-log-v1'
const MIXED_COUNT_KEYS = ['practice-completion-counts-v1', 'practice-perfect-counts-v1'] as const
const MIXED_KEYS: string[] = [MIXED_LOG_KEY, ...MIXED_COUNT_KEYS]
const PERSONAL_BANK_KEY = 'personal-question-bank-v1'

const WRONG_FAVORITE_KEYS: string[] = [
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
]

/** 知识训练额外键（不含密钥、界面设置、个人题库） */
const TRAIN_EXTRA_KEYS: string[] = [
  MIXED_LOG_KEY,
  'practice-completion-counts-v1',
  'practice-perfect-counts-v1',
  'fact-explanation-overrides-v1',
  'fact-deepen-group-stats-v1',
  'mental-math-strategy-guide-notes-v1',
  // 生成去重历史
  'chinese-generated-history-idiom-v1',
  'chinese-generated-history-word-memorization-v1',
  'chinese-generated-history-poetry-v1',
  'chinese-generated-history-char-literacy-v1',
  'chinese-generated-history-classical-chinese-v1',
  'chinese-generated-history-rhetoric-usage-v1',
  'chinese-generated-history-reading-main-idea-v1',
  'chinese-generated-history-reading-detail-v1',
  'chinese-generated-history-reading-word-sentence-v1',
  'chinese-generated-history-reading-infer-next-v1',
  'chinese-generated-history-reading-title-v1',
  'chinese-generated-history-history-common-sense-v1',
  'chinese-generated-history-party-history-v1',
  'chinese-generated-history-theory-policy-v1',
  'chinese-generated-history-legal-common-sense-v1',
  'chinese-generated-history-economy-common-sense-v1',
  'chinese-generated-history-life-common-sense-v1',
  'chinese-generated-history-geography-common-sense-v1',
  'chinese-generated-history-data-analysis-percent-v1',
  'chinese-generated-history-data-analysis-growth-v1',
  'chinese-generated-history-data-analysis-growth-inter-year-v1',
  'chinese-generated-history-data-analysis-growth-avg-annual-v1',
  'chinese-generated-history-data-analysis-growth-mixed-v1',
  'chinese-generated-history-data-analysis-proportion-basic-v1',
  'chinese-generated-history-data-analysis-proportion-base-v1',
  'chinese-generated-history-data-analysis-average-basic-v1',
  'chinese-generated-history-data-analysis-average-base-v1',
  'chinese-generated-history-data-analysis-multiple-basic-v1',
  'chinese-generated-history-data-analysis-multiple-base-v1',
  'chinese-generated-history-data-analysis-index-v1',
  'chinese-generated-history-data-analysis-pull-v1',
  'chinese-generated-history-data-analysis-surplus-v1',
  'chinese-generated-history-op-highfreq-geometry-v1',
  'chinese-generated-history-op-highfreq-probability-v1',
  'chinese-generated-history-op-other-function-graph-v1',
]

const LEGACY_USER_DATA_ONLY_KEYS: string[] = [
  'wengu-app-ui-settings-v1',
  PERSONAL_BANK_KEY,
  'wengu-ai-provider-v1',
  'wengu-api-origin-v1',
]

const USER_DATA_EXTRA_KEYS: string[] = [...TRAIN_EXTRA_KEYS, ...LEGACY_USER_DATA_ONLY_KEYS]
const BANK_KEYS: string[] = [PERSONAL_BANK_KEY, ...MIXED_KEYS]
const TRAIN_KEYS: string[] = [...new Set([...WRONG_FAVORITE_KEYS, ...TRAIN_EXTRA_KEYS])]

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function isBankModeId(id: string): boolean {
  return id.startsWith('personal-bank-')
}

function isBankLogItem(item: unknown): boolean {
  if (!isPlainObject(item)) return false
  const cat = String(item.categoryId ?? '')
  const mode = String(item.modeId ?? '')
  return cat === 'personal-bank' || isBankModeId(mode)
}

function keysForKind(kind: WenguBackupKind): string[] {
  if (kind === 'wrong-favorite') return [...WRONG_FAVORITE_KEYS]
  if (kind === 'train') return [...TRAIN_KEYS]
  if (kind === 'bank') return [...BANK_KEYS]
  return [...new Set([...WRONG_FAVORITE_KEYS, ...USER_DATA_EXTRA_KEYS])]
}

function moduleOfKind(kind: WenguBackupKind): WenguModuleBackupKind | null {
  if (kind === 'train' || kind === 'bank') return kind
  return null
}

function parseJsonUnknown(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function sliceLogRaw(raw: string, module: WenguModuleBackupKind): string {
  const parsed = parseJsonUnknown(raw)
  if (!Array.isArray(parsed)) return raw
  const keepBank = module === 'bank'
  return JSON.stringify(parsed.filter((item) => isBankLogItem(item) === keepBank))
}

function sliceCountsRaw(raw: string, module: WenguModuleBackupKind): string {
  const parsed = parseJsonUnknown(raw)
  if (!isPlainObject(parsed)) return raw
  const keepBank = module === 'bank'
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(parsed)) {
    if (isBankModeId(k) === keepBank) out[k] = v
  }
  return JSON.stringify(out)
}

function sliceMixedValue(key: string, raw: string, module: WenguModuleBackupKind): string {
  if (key === MIXED_LOG_KEY) return sliceLogRaw(raw, module)
  if ((MIXED_COUNT_KEYS as readonly string[]).includes(key)) return sliceCountsRaw(raw, module)
  return raw
}

function isEmptyBackupValue(raw: string): boolean {
  const t = raw.trim()
  return !t || t === '[]' || t === '{}'
}

function collectEntries(keys: string[], module: WenguModuleBackupKind | null = null): Record<string, string> {
  const out: Record<string, string> = {}
  if (typeof localStorage === 'undefined') return out
  for (const key of keys) {
    if (SECRET_KEYS.has(key)) continue
    try {
      let raw = localStorage.getItem(key)
      if (raw == null || raw === '') continue
      if (module && MIXED_KEYS.includes(key)) raw = sliceMixedValue(key, raw, module)
      if (isEmptyBackupValue(raw)) continue
      out[key] = raw
    } catch {
      /* skip */
    }
  }
  return out
}

export function countBackupKeys(kind: WenguBackupKind): number {
  return Object.keys(collectEntries(keysForKind(kind), moduleOfKind(kind))).length
}

export function buildBackupPayload(kind: WenguBackupKind): WenguBackupFile {
  return {
    format: WENGU_BACKUP_FORMAT,
    kind,
    exportedAt: new Date().toISOString(),
    app: 'quick-math-exercises-app',
    entries: collectEntries(keysForKind(kind), moduleOfKind(kind)),
  }
}

export function backupKindLabel(kind: WenguBackupKind): string {
  if (kind === 'train') return '知识训练'
  if (kind === 'bank') return '题库整理'
  if (kind === 'wrong-favorite') return '错题与收藏'
  return '全部练习数据'
}

export function suggestBackupFilename(kind: WenguBackupKind): string {
  const day = localDateKey()
  const tag =
    kind === 'train'
      ? 'train'
      : kind === 'bank'
        ? 'bank'
        : kind === 'wrong-favorite'
          ? 'wrong-favorite'
          : 'user-data'
  return `wengu-${tag}-${day}.json`
}

function mergeArraysByFingerprint(local: unknown[], incoming: unknown[]): unknown[] {
  const map = new Map<string, unknown>()
  const noFp: unknown[] = []
  const take = (arr: unknown[], preferIncoming: boolean) => {
    for (const item of arr) {
      if (!isPlainObject(item) || typeof item.fingerprint !== 'string' || !item.fingerprint) {
        noFp.push(item)
        continue
      }
      const fp = item.fingerprint
      const prev = map.get(fp)
      if (!prev) {
        map.set(fp, item)
        continue
      }
      if (!preferIncoming) continue
      // 错题：保留较大 wrongCount，较新 updatedAt
      const a = prev as Record<string, unknown>
      const b = item as Record<string, unknown>
      const merged = { ...a, ...b }
      const ac = Number(a.wrongCount)
      const bc = Number(b.wrongCount)
      if (Number.isFinite(ac) || Number.isFinite(bc)) {
        merged.wrongCount = Math.max(
          Number.isFinite(ac) ? ac : 0,
          Number.isFinite(bc) ? bc : 0,
        )
      }
      map.set(fp, merged)
    }
  }
  take(local, false)
  take(incoming, true)
  return [...map.values(), ...noFp]
}

function mergeNumberMaps(
  local: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(local)) {
    const n = Number(v)
    if (typeof k === 'string' && k && Number.isFinite(n) && n > 0) out[k] = Math.floor(n)
  }
  for (const [k, v] of Object.entries(incoming)) {
    const n = Number(v)
    if (typeof k !== 'string' || !k || !Number.isFinite(n) || n <= 0) continue
    out[k] = Math.max(out[k] ?? 0, Math.floor(n))
  }
  return out
}

function mergeArraysById(local: unknown[], incoming: unknown[]): unknown[] {
  const map = new Map<string, unknown>()
  const rest: unknown[] = []
  const take = (arr: unknown[], overwrite: boolean) => {
    for (const item of arr) {
      if (!isPlainObject(item) || typeof item.id !== 'string' || !item.id) {
        rest.push(item)
        continue
      }
      if (!overwrite && map.has(item.id)) continue
      map.set(item.id, item)
    }
  }
  take(local, false)
  take(incoming, true)
  return [...map.values(), ...rest]
}

function asCategoryList(v: unknown): Record<string, unknown>[] {
  if (!isPlainObject(v) || !Array.isArray(v.categories)) return []
  return v.categories.filter(isPlainObject)
}

function mergePersonalBankRaw(localRaw: string | null, incomingRaw: string): string {
  if (!localRaw) return incomingRaw
  const localCats = asCategoryList(parseJsonUnknown(localRaw))
  const incomingCats = asCategoryList(parseJsonUnknown(incomingRaw))
  if (!incomingCats.length) return localRaw
  const cats = new Map<string, Record<string, unknown>>()
  for (const c of localCats) {
    const id = String(c.id ?? '')
    if (id) cats.set(id, { ...c, subs: Array.isArray(c.subs) ? [...c.subs] : [] })
  }
  for (const ic of incomingCats) {
    const id = String(ic.id ?? '')
    if (!id) continue
    const existing = cats.get(id)
    if (!existing) {
      cats.set(id, { ...ic, subs: Array.isArray(ic.subs) ? [...ic.subs] : [] })
      continue
    }
    if (typeof ic.name === 'string' && ic.name.trim()) existing.name = ic.name.trim()
    const subs = new Map<string, Record<string, unknown>>()
    const existingSubs = Array.isArray(existing.subs) ? existing.subs.filter(isPlainObject) : []
    for (const s of existingSubs) {
      const sid = String(s.id ?? '')
      if (sid) subs.set(sid, { ...s, questions: Array.isArray(s.questions) ? [...s.questions] : [] })
    }
    const incomingSubs = Array.isArray(ic.subs) ? ic.subs.filter(isPlainObject) : []
    for (const isub of incomingSubs) {
      const sid = String(isub.id ?? '')
      if (!sid) continue
      const es = subs.get(sid)
      if (!es) {
        subs.set(sid, { ...isub, questions: Array.isArray(isub.questions) ? [...isub.questions] : [] })
        continue
      }
      if (typeof isub.name === 'string' && isub.name.trim()) es.name = isub.name.trim()
      const qs = new Map<string, Record<string, unknown>>()
      const existingQs = Array.isArray(es.questions) ? es.questions.filter(isPlainObject) : []
      for (const q of existingQs) {
        const qid = String(q.id ?? '')
        if (qid) qs.set(qid, q)
      }
      const incomingQs = Array.isArray(isub.questions) ? isub.questions.filter(isPlainObject) : []
      for (const iq of incomingQs) {
        const qid = String(iq.id ?? '')
        if (!qid) continue
        const eq = qs.get(qid)
        if (!eq) {
          qs.set(qid, iq)
          continue
        }
        const quizCount = Math.max(Number(eq.quizCount) || 0, Number(iq.quizCount) || 0)
        qs.set(qid, { ...eq, ...iq, quizCount })
      }
      es.questions = [...qs.values()]
      subs.set(sid, es)
    }
    existing.subs = [...subs.values()]
    cats.set(id, existing)
  }
  return JSON.stringify({ categories: [...cats.values()] })
}

function combineMixedValue(
  key: string,
  localRaw: string | null,
  incomingRaw: string,
  mode: BackupImportMode,
  module: WenguModuleBackupKind,
): string {
  const local = localRaw ?? (key === MIXED_LOG_KEY ? '[]' : '{}')
  const otherModule: WenguModuleBackupKind = module === 'train' ? 'bank' : 'train'
  const keepOther = sliceMixedValue(key, local, otherModule)
  const incomingSliced = sliceMixedValue(key, incomingRaw, module)
  if (key === MIXED_LOG_KEY) {
    const other = parseJsonUnknown(keepOther)
    const otherArr = Array.isArray(other) ? other : []
    if (mode === 'replace') {
      const incoming = parseJsonUnknown(incomingSliced)
      return JSON.stringify([...otherArr, ...(Array.isArray(incoming) ? incoming : [])])
    }
    const localSlice = parseJsonUnknown(sliceMixedValue(key, local, module))
    const incoming = parseJsonUnknown(incomingSliced)
    const merged = mergeArraysById(
      Array.isArray(localSlice) ? localSlice : [],
      Array.isArray(incoming) ? incoming : [],
    )
    return JSON.stringify([...otherArr, ...merged])
  }
  const other = parseJsonUnknown(keepOther)
  const otherObj = isPlainObject(other) ? other : {}
  const incoming = parseJsonUnknown(incomingSliced)
  const incomingObj = isPlainObject(incoming) ? incoming : {}
  if (mode === 'replace') return JSON.stringify({ ...otherObj, ...incomingObj })
  const localSlice = parseJsonUnknown(sliceMixedValue(key, local, module))
  const localObj = isPlainObject(localSlice) ? localSlice : {}
  return JSON.stringify({ ...otherObj, ...mergeNumberMaps(localObj, incomingObj) })
}

function mergeStorageValue(key: string, localRaw: string | null, incomingRaw: string): string {
  if (!localRaw) return incomingRaw
  if (key === PERSONAL_BANK_KEY) return mergePersonalBankRaw(localRaw, incomingRaw)
  try {
    const local = JSON.parse(localRaw) as unknown
    const incoming = JSON.parse(incomingRaw) as unknown
    if (Array.isArray(local) && Array.isArray(incoming)) {
      if (key === MIXED_LOG_KEY) return JSON.stringify(mergeArraysById(local, incoming))
      return JSON.stringify(mergeArraysByFingerprint(local, incoming))
    }
    if (isPlainObject(local) && isPlainObject(incoming)) {
      if (
        key.includes('completion-counts') ||
        key.includes('perfect-counts') ||
        key.includes('review-stats')
      ) {
        if (key.includes('review-stats')) {
          const out: Record<string, Record<string, number>> = {}
          for (const src of [local, incoming]) {
            for (const [scope, bucket] of Object.entries(src)) {
              if (!isPlainObject(bucket)) continue
              const prev = out[scope] ?? { attempted: 0, correct: 0, completeReviews: 0 }
              out[scope] = {
                attempted: Math.max(prev.attempted, Math.floor(Number(bucket.attempted) || 0)),
                correct: Math.max(prev.correct, Math.floor(Number(bucket.correct) || 0)),
                completeReviews: Math.max(
                  prev.completeReviews,
                  Math.floor(Number(bucket.completeReviews) || 0),
                ),
              }
            }
          }
          return JSON.stringify(out)
        }
        return JSON.stringify(mergeNumberMaps(local, incoming))
      }
      return JSON.stringify({ ...local, ...incoming })
    }
  } catch {
    /* fallthrough */
  }
  return incomingRaw
}

function isKnownBackupKind(v: unknown): v is WenguBackupKind {
  return v === 'train' || v === 'bank' || v === 'wrong-favorite' || v === 'user-data'
}

function isKeyAllowedForKind(kind: WenguBackupKind, key: string): boolean {
  if (SECRET_KEYS.has(key)) return false
  if (kind === 'train') return TRAIN_KEYS.includes(key)
  if (kind === 'bank') return BANK_KEYS.includes(key)
  if (kind === 'wrong-favorite') return WRONG_FAVORITE_KEYS.includes(key)
  return true
}

export function parseBackupJson(text: string): WenguBackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('不是合法的 JSON 文件')
  }
  if (!isPlainObject(parsed)) throw new Error('备份格式无效')
  if (parsed.format !== WENGU_BACKUP_FORMAT) {
    throw new Error('不支持的备份版本（需要 wengu-backup-v1）')
  }
  if (!isKnownBackupKind(parsed.kind)) throw new Error('未知备份类型')
  if (!isPlainObject(parsed.entries)) throw new Error('备份缺少 entries')
  const entries: Record<string, string> = {}
  for (const [k, v] of Object.entries(parsed.entries)) {
    if (typeof k !== 'string' || !k || SECRET_KEYS.has(k)) continue
    if (typeof v === 'string') entries[k] = v
    else entries[k] = JSON.stringify(v)
  }
  if (!Object.keys(entries).length) throw new Error('备份内容为空')
  return {
    format: WENGU_BACKUP_FORMAT,
    kind: parsed.kind,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
    app: typeof parsed.app === 'string' ? parsed.app : '',
    entries,
  }
}

export function applyBackup(
  backup: WenguBackupFile,
  mode: BackupImportMode = 'merge',
): BackupApplyResult {
  if (typeof localStorage === 'undefined') {
    throw new Error('当前环境无法写入本机数据')
  }
  const module = moduleOfKind(backup.kind)
  let written = 0
  let skipped = 0
  for (const [key, incomingRaw] of Object.entries(backup.entries)) {
    if (!isKeyAllowedForKind(backup.kind, key)) {
      skipped += 1
      continue
    }
    try {
      const localRaw = localStorage.getItem(key)
      let next = incomingRaw
      if (module && MIXED_KEYS.includes(key)) {
        next = combineMixedValue(key, localRaw, incomingRaw, mode, module)
      } else if (mode === 'merge') {
        next = mergeStorageValue(key, localRaw, incomingRaw)
      } else if (key === PERSONAL_BANK_KEY && mode === 'replace') {
        next = incomingRaw
      }
      localStorage.setItem(key, next)
      written += 1
    } catch {
      skipped += 1
    }
  }
  return {
    kind: backup.kind,
    keyCount: Object.keys(backup.entries).length,
    written,
    skipped,
  }
}

/** 触发下载；手机端优先尝试系统分享，失败再落盘 */
export async function downloadOrShareBackup(kind: WenguBackupKind): Promise<'shared' | 'downloaded' | 'copied'> {
  const payload = buildBackupPayload(kind)
  const text = JSON.stringify(payload, null, 2)
  const filename = suggestBackupFilename(kind)
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })

  // 手机：Web Share API（可发到微信/文件）
  try {
    const file = new File([blob], filename, { type: 'application/json' })
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
      share?: (data: ShareData) => Promise<void>
    }
    if (typeof nav.share === 'function') {
      const data: ShareData = { files: [file], title: filename, text: backupKindLabel(kind) }
      if (!nav.canShare || nav.canShare(data)) {
        await nav.share(data)
        return 'shared'
      }
    }
  } catch (e) {
    // 用户取消分享不算失败，继续尝试下载
    if (e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') {
      throw new Error('已取消分享')
    }
  }

  // 电脑 / 不支持分享：a[download]
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  // iOS 有时无法真正下载，再尝试复制剪贴板作兜底提示由 UI 决定
  return 'downloaded'
}

export async function copyBackupToClipboard(kind: WenguBackupKind): Promise<void> {
  const payload = buildBackupPayload(kind)
  const text = JSON.stringify(payload, null, 2)
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前浏览器不支持复制到剪贴板')
  }
  await navigator.clipboard.writeText(text)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file, 'utf-8')
  })
}
