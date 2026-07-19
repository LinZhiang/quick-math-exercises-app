/** 语文练习「生成题」近期去重：连续约 90 道内同一知识点不重复 */

export const CHINESE_GENERATED_HISTORY_LIMIT = 90

export type ChineseGeneratedHistoryKind =
  | 'idiom'
  | 'word-memorization'
  | 'poetry'
  | 'char-literacy'
  | 'classical-chinese'
  | 'rhetoric-usage'
  | 'reading-main-idea'
  | 'reading-detail'
  | 'reading-word-sentence'
  | 'reading-infer-next'
  | 'reading-title'
  | 'history-common-sense'
  | 'party-history'
  | 'theory-policy'
  | 'legal-common-sense'
  | 'economy-common-sense'
  | 'life-common-sense'
  | 'geography-common-sense'
  | 'data-analysis-percent'
  | 'data-analysis-growth'
  | 'data-analysis-growth-inter-year'
  | 'data-analysis-growth-avg-annual'
  | 'data-analysis-growth-mixed'
  | 'data-analysis-proportion-basic'
  | 'data-analysis-proportion-base'
  | 'data-analysis-average-basic'
  | 'data-analysis-average-base'
  | 'data-analysis-multiple-basic'
  | 'data-analysis-multiple-base'
  | 'data-analysis-index'
  | 'data-analysis-pull'
  | 'data-analysis-surplus'
  | 'op-highfreq-geometry'

const STORAGE_KEYS: Record<ChineseGeneratedHistoryKind, string> = {
  idiom: 'chinese-generated-history-idiom-v1',
  'word-memorization': 'chinese-generated-history-word-memorization-v1',
  poetry: 'chinese-generated-history-poetry-v1',
  'char-literacy': 'chinese-generated-history-char-literacy-v1',
  'classical-chinese': 'chinese-generated-history-classical-chinese-v1',
  'rhetoric-usage': 'chinese-generated-history-rhetoric-usage-v1',
  'reading-main-idea': 'chinese-generated-history-reading-main-idea-v1',
  'reading-detail': 'chinese-generated-history-reading-detail-v1',
  'reading-word-sentence': 'chinese-generated-history-reading-word-sentence-v1',
  'reading-infer-next': 'chinese-generated-history-reading-infer-next-v1',
  'reading-title': 'chinese-generated-history-reading-title-v1',
  'history-common-sense': 'chinese-generated-history-history-common-sense-v1',
  'party-history': 'chinese-generated-history-party-history-v1',
  'theory-policy': 'chinese-generated-history-theory-policy-v1',
  'legal-common-sense': 'chinese-generated-history-legal-common-sense-v1',
  'economy-common-sense': 'chinese-generated-history-economy-common-sense-v1',
  'life-common-sense': 'chinese-generated-history-life-common-sense-v1',
  'geography-common-sense': 'chinese-generated-history-geography-common-sense-v1',
  'data-analysis-percent': 'chinese-generated-history-data-analysis-percent-v1',
  'data-analysis-growth': 'chinese-generated-history-data-analysis-growth-v1',
  'data-analysis-growth-inter-year':
    'chinese-generated-history-data-analysis-growth-inter-year-v1',
  'data-analysis-growth-avg-annual':
    'chinese-generated-history-data-analysis-growth-avg-annual-v1',
  'data-analysis-growth-mixed':
    'chinese-generated-history-data-analysis-growth-mixed-v1',
  'data-analysis-proportion-basic':
    'chinese-generated-history-data-analysis-proportion-basic-v1',
  'data-analysis-proportion-base':
    'chinese-generated-history-data-analysis-proportion-base-v1',
  'data-analysis-average-basic':
    'chinese-generated-history-data-analysis-average-basic-v1',
  'data-analysis-average-base':
    'chinese-generated-history-data-analysis-average-base-v1',
  'data-analysis-multiple-basic':
    'chinese-generated-history-data-analysis-multiple-basic-v1',
  'data-analysis-multiple-base':
    'chinese-generated-history-data-analysis-multiple-base-v1',
  'data-analysis-index': 'chinese-generated-history-data-analysis-index-v1',
  'data-analysis-pull': 'chinese-generated-history-data-analysis-pull-v1',
  'data-analysis-surplus': 'chinese-generated-history-data-analysis-surplus-v1',
  'op-highfreq-geometry': 'chinese-generated-history-op-highfreq-geometry-v1',
}

function normalizeTerm(term: string): string {
  return term.trim().replace(/\s+/g, '')
}

function readTerms(kind: ChineseGeneratedHistoryKind): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[kind])
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((t) => (typeof t === 'string' ? normalizeTerm(t) : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

function writeTerms(kind: ChineseGeneratedHistoryKind, terms: string[]) {
  localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(terms.slice(-CHINESE_GENERATED_HISTORY_LIMIT)))
}

/** 近期已出过的知识点（最多 90 个，旧的自动挤出） */
export function listRecentGeneratedTerms(kind: ChineseGeneratedHistoryKind): string[] {
  return readTerms(kind)
}

/** 本轮生成成功后写入；同一知识点再次出现会挪到队尾 */
export function appendGeneratedTerms(kind: ChineseGeneratedHistoryKind, terms: string[]) {
  const incoming = terms.map(normalizeTerm).filter(Boolean)
  if (!incoming.length) return
  const seen = new Set<string>()
  const merged: string[] = []
  for (const t of [...readTerms(kind), ...incoming]) {
    if (seen.has(t)) {
      const idx = merged.indexOf(t)
      if (idx >= 0) merged.splice(idx, 1)
    }
    seen.add(t)
    merged.push(t)
  }
  writeTerms(kind, merged)
}

export function isTermInRecentGenerated(kind: ChineseGeneratedHistoryKind, term: string): boolean {
  const key = normalizeTerm(term)
  if (!key) return false
  return readTerms(kind).includes(key)
}
