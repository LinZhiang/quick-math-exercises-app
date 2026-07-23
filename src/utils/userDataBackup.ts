/**
 * 本机练习数据打包 / 导入（手机与电脑互通）
 * - wrong-favorite：错题 + 收藏 + 相关备注/复盘统计
 * - user-data：练习进度与偏好（不含登录密钥）
 */
import { localDateKey } from '@/utils/practiceSessionLog'

export const WENGU_BACKUP_FORMAT = 'wengu-backup-v1' as const

export type WenguBackupKind = 'wrong-favorite' | 'user-data'

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
  'wengu-deepseek-auth-v1',
])

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
]

/** 全量用户练习数据额外键（不含密钥） */
const USER_DATA_EXTRA_KEYS: string[] = [
  'practice-session-log-v1',
  'practice-completion-counts-v1',
  'practice-perfect-counts-v1',
  'wengu-app-ui-settings-v1',
  'wengu-ai-provider-v1',
  'wengu-api-origin-v1',
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

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function keysForKind(kind: WenguBackupKind): string[] {
  if (kind === 'wrong-favorite') return [...WRONG_FAVORITE_KEYS]
  return [...new Set([...WRONG_FAVORITE_KEYS, ...USER_DATA_EXTRA_KEYS])]
}

function collectEntries(keys: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  if (typeof localStorage === 'undefined') return out
  for (const key of keys) {
    if (SECRET_KEYS.has(key)) continue
    try {
      const raw = localStorage.getItem(key)
      if (raw != null && raw !== '') out[key] = raw
    } catch {
      /* skip */
    }
  }
  return out
}

export function countBackupKeys(kind: WenguBackupKind): number {
  return Object.keys(collectEntries(keysForKind(kind))).length
}

export function buildBackupPayload(kind: WenguBackupKind): WenguBackupFile {
  return {
    format: WENGU_BACKUP_FORMAT,
    kind,
    exportedAt: new Date().toISOString(),
    app: 'quick-math-exercises-app',
    entries: collectEntries(keysForKind(kind)),
  }
}

export function backupKindLabel(kind: WenguBackupKind): string {
  return kind === 'wrong-favorite' ? '错题与收藏' : '全部练习数据'
}

export function suggestBackupFilename(kind: WenguBackupKind): string {
  const day = localDateKey()
  const tag = kind === 'wrong-favorite' ? 'wrong-favorite' : 'user-data'
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

function mergeStorageValue(key: string, localRaw: string | null, incomingRaw: string): string {
  if (!localRaw) return incomingRaw
  try {
    const local = JSON.parse(localRaw) as unknown
    const incoming = JSON.parse(incomingRaw) as unknown
    if (Array.isArray(local) && Array.isArray(incoming)) {
      return JSON.stringify(mergeArraysByFingerprint(local, incoming))
    }
    if (isPlainObject(local) && isPlainObject(incoming)) {
      if (
        key.includes('completion-counts') ||
        key.includes('perfect-counts') ||
        key.includes('review-stats')
      ) {
        // review-stats 是 { scope: { attempted, correct, completeReviews } }
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
      // 备注、设置等：incoming 覆盖同名键，保留本地独有键
      return JSON.stringify({ ...local, ...incoming })
    }
  } catch {
    /* fallthrough */
  }
  return incomingRaw
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
  if (parsed.kind !== 'wrong-favorite' && parsed.kind !== 'user-data') {
    throw new Error('未知备份类型')
  }
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
  let written = 0
  let skipped = 0
  for (const [key, incomingRaw] of Object.entries(backup.entries)) {
    if (SECRET_KEYS.has(key)) {
      skipped += 1
      continue
    }
    try {
      if (mode === 'replace') {
        localStorage.setItem(key, incomingRaw)
        written += 1
        continue
      }
      const localRaw = localStorage.getItem(key)
      const next = mergeStorageValue(key, localRaw, incomingRaw)
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
