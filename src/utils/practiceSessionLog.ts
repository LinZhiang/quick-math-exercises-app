/**
 * 测验完成日志：每次完整完成一轮练习写入一条，供「导览 → 日志」筛选查看。
 */
import { ref } from 'vue'

const STORAGE_KEY = 'practice-session-log-v1'
const MAX_ENTRIES = 800

export const practiceSessionLogTick = ref(0)

export type PracticeSessionLogEntry = {
  id: string
  /** ISO 完成时间 */
  finishedAt: string
  /** 本地日历日 YYYY-MM-DD，便于按日筛选 */
  dateKey: string
  modeId: string
  /** 大类 id，如 arithmetic / chinese / data-analysis */
  categoryId: string
  categoryLabel: string
  /** 展示用：大类 · 小项，如「四则口算 · 简单模式」 */
  itemLabel: string
  correctCount?: number
  totalCount?: number
  score?: number
  durationMs?: number
}

export type PracticeSessionLogStats = {
  correctCount?: number
  totalCount?: number
  score?: number
  durationMs?: number
}

function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function difficultyLabel(d: string): string {
  if (d === 'easy') return '简单'
  if (d === 'medium') return '中等'
  if (d === 'hard') return '困难'
  if (d === 'normal') return '普通'
  return d
}

function splitDifficulty(rest: string): { mid: string; difficulty: string } {
  const parts = rest.split('-').filter(Boolean)
  const last = parts[parts.length - 1] ?? ''
  if (['easy', 'medium', 'hard', 'normal'].includes(last)) {
    return { mid: parts.slice(0, -1).join('-'), difficulty: last }
  }
  return { mid: rest, difficulty: '' }
}

const ARITHMETIC_LABELS: Record<string, string> = {
  easy: '简单模式',
  'easy-distractor': '简单模式（干扰型）',
  normal: '普通模式',
  hard: '高难模式',
}

const KNOWN_ITEM_LABELS: Record<string, { categoryId: string; categoryLabel: string; itemLabel: string }> =
  {
    easy: { categoryId: 'arithmetic', categoryLabel: '四则口算', itemLabel: '四则口算 · 简单模式' },
    'easy-distractor': {
      categoryId: 'arithmetic',
      categoryLabel: '四则口算',
      itemLabel: '四则口算 · 简单模式（干扰型）',
    },
    normal: { categoryId: 'arithmetic', categoryLabel: '四则口算', itemLabel: '四则口算 · 普通模式' },
    hard: { categoryId: 'arithmetic', categoryLabel: '四则口算', itemLabel: '四则口算 · 高难模式' },
    'power-easy': { categoryId: 'power', categoryLabel: '2 的 n 次幂', itemLabel: '2 的 n 次幂 · 简单题' },
    'power-hard': { categoryId: 'power', categoryLabel: '2 的 n 次幂', itemLabel: '2 的 n 次幂 · 复杂题' },
    'square-cube-easy': {
      categoryId: 'square-cube',
      categoryLabel: '平方与立方',
      itemLabel: '平方与立方 · 简单题',
    },
    'square-cube-hard': {
      categoryId: 'square-cube',
      categoryLabel: '平方与立方',
      itemLabel: '平方与立方 · 复杂题',
    },
    'life-sense-easy': {
      categoryId: 'life-sense',
      categoryLabel: '生活常识',
      itemLabel: '生活常识 · 简单题',
    },
    'life-sense-normal': {
      categoryId: 'life-sense',
      categoryLabel: '生活常识',
      itemLabel: '生活常识 · 普通题',
    },
    'life-sense-hard': {
      categoryId: 'life-sense',
      categoryLabel: '生活常识',
      itemLabel: '生活常识 · 复杂题',
    },
    'chinese-idiom': { categoryId: 'chinese', categoryLabel: '语文练习', itemLabel: '语文 · 成语识记' },
    'chinese-word-memorization': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 词语识记',
    },
    'chinese-char-literacy': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 汉字认读',
    },
    'chinese-poetry': { categoryId: 'chinese', categoryLabel: '语文练习', itemLabel: '语文 · 诗词练习' },
    'chinese-classical-chinese': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 文言文',
    },
    'chinese-rhetoric-usage': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 修辞运用',
    },
    'chinese-reading-comprehension': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 阅读理解',
    },
    'chinese-history-common-sense': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 历史常识',
    },
    'chinese-party-history': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 中共党史',
    },
    'chinese-theory-policy': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 理论政策',
    },
    'chinese-legal-common-sense': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 法律常识',
    },
    'chinese-economy-common-sense': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 经济常识',
    },
    'chinese-life-common-sense': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 生活科学',
    },
    'chinese-geography-common-sense': {
      categoryId: 'chinese',
      categoryLabel: '语文练习',
      itemLabel: '语文 · 地理常识',
    },
  }

const OP_SKILL_NAMES: Record<string, string> = {
  'div-judge': '整除的判定',
  'prime-comp': '质数与合数',
  'gcd-lcm': '公因数与公倍数',
  'ratio-mult': '由比例判定倍数',
  'rem-prop': '余数性质',
  'sub-elim': '代入排除法',
  'eq-method': '方程法',
  'spec-val': '特值法',
  'ratio-method': '比例法',
  'cross-method': '十字交叉法',
}

const DATA_ANALYSIS_NAMES: Record<string, string> = {
  growth: '增长',
  'growth-inter-year': '隔年增长',
  'growth-avg-annual': '年均增长',
  'growth-mixed': '混合增长',
  'proportion-basic': '比重基本',
  'proportion-base': '基期比重',
  'average-basic': '平均数基本',
  'average-base': '基期平均数',
  'multiple-basic': '倍数基本',
  'multiple-base': '基期倍数',
  index: '指数',
  pull: '拉动增长',
  surplus: '顺差与逆差',
}

const HIGHFREQ_TOPIC_NAMES: Record<string, string> = {
  'sum-diff-ratio': '和差倍比',
  geometry: '几何问题',
  'right-triangle': '直角三角形',
  'similar-triangle': '三角形相似',
  coloring: '染色问题',
}

type PrefixRule = {
  prefix: string
  categoryId: string
  categoryLabel: string
  labelFor: (mid: string, difficulty: string) => string
}

const PREFIX_RULES: PrefixRule[] = [
  {
    prefix: 'op-highfreq-',
    categoryId: 'op-highfreq',
    categoryLabel: '高频运算',
    labelFor: (mid, difficulty) => {
      const topic = HIGHFREQ_TOPIC_NAMES[mid] ?? mid
      const d = difficulty ? ` · ${difficultyLabel(difficulty)}` : ''
      return `高频运算 · ${topic}${d}`
    },
  },
  {
    prefix: 'op-skill-',
    categoryId: 'op-skill',
    categoryLabel: '运算技巧',
    labelFor: (mid, difficulty) => {
      const name = OP_SKILL_NAMES[mid] ?? mid
      const d = difficulty ? ` · ${difficultyLabel(difficulty)}` : ''
      return `运算技巧 · ${name}${d}`
    },
  },
  {
    prefix: 'data-analysis-',
    categoryId: 'data-analysis',
    categoryLabel: '资料分析',
    labelFor: (mid, difficulty) => {
      const name = mid ? (DATA_ANALYSIS_NAMES[mid] ?? mid) : '综合'
      const d = difficulty ? ` · ${difficultyLabel(difficulty)}` : ''
      return `资料分析 · ${name}${d}`
    },
  },
  {
    prefix: 'chinese-reading-',
    categoryId: 'chinese',
    categoryLabel: '语文练习',
    labelFor: (mid) => `语文 · 阅读理解${mid && mid !== 'all' ? `（${mid}）` : ''}`,
  },
  {
    prefix: 'chinese-',
    categoryId: 'chinese',
    categoryLabel: '语文练习',
    labelFor: (mid, difficulty) => {
      const d = difficulty ? ` · ${difficultyLabel(difficulty)}` : ''
      return `语文 · ${mid || '练习'}${d}`
    },
  },
  {
    prefix: 'life-sense-',
    categoryId: 'life-sense',
    categoryLabel: '生活常识',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `生活常识 · ${difficultyLabel(d) || d}题`
    },
  },
  {
    prefix: 'grammar-judgment-',
    categoryId: 'grammar-judgment',
    categoryLabel: '语法判断',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `语法判断 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'fraction-',
    categoryId: 'fraction',
    categoryLabel: '估算分数',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `估算分数 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'divisibility-',
    categoryId: 'divisibility',
    categoryLabel: '整除及其性质',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `整除及其性质 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'power-',
    categoryId: 'power',
    categoryLabel: '2 的 n 次幂',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `2 的 n 次幂 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'square-cube-',
    categoryId: 'square-cube',
    categoryLabel: '平方与立方',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `平方与立方 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'twentyfour-',
    categoryId: 'twentyfour',
    categoryLabel: '二十四点',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `二十四点 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'sudoku-',
    categoryId: 'sudoku',
    categoryLabel: '数独',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `数独 · ${difficultyLabel(d) || d}`
    },
  },
  {
    prefix: 'graphic-',
    categoryId: 'graphic',
    categoryLabel: '图形推理',
    labelFor: (mid, difficulty) => {
      const d = difficulty || mid
      return `图形推理 · ${difficultyLabel(d) || d}`
    },
  },
]

export function resolvePracticeLogMeta(modeId: string): {
  categoryId: string
  categoryLabel: string
  itemLabel: string
} {
  const id = modeId.trim()
  if (!id) {
    return { categoryId: 'other', categoryLabel: '其他', itemLabel: '未知项目' }
  }

  const known = KNOWN_ITEM_LABELS[id]
  if (known) return known

  if (ARITHMETIC_LABELS[id]) {
    return {
      categoryId: 'arithmetic',
      categoryLabel: '四则口算',
      itemLabel: `四则口算 · ${ARITHMETIC_LABELS[id]}`,
    }
  }

  for (const rule of PREFIX_RULES) {
    if (!id.startsWith(rule.prefix)) continue
    const rest = id.slice(rule.prefix.length)
    const { mid, difficulty } = splitDifficulty(rest)
    return {
      categoryId: rule.categoryId,
      categoryLabel: rule.categoryLabel,
      itemLabel: rule.labelFor(mid, difficulty),
    }
  }

  return {
    categoryId: 'other',
    categoryLabel: '其他',
    itemLabel: id.replace(/-/g, ' · '),
  }
}

/** 筛选器用的大类列表（固定顺序） */
export const PRACTICE_LOG_CATEGORIES: { id: string; label: string }[] = [
  { id: 'arithmetic', label: '四则口算' },
  { id: 'power', label: '2 的 n 次幂' },
  { id: 'square-cube', label: '平方与立方' },
  { id: 'fraction', label: '估算分数' },
  { id: 'divisibility', label: '整除及其性质' },
  { id: 'life-sense', label: '生活常识' },
  { id: 'grammar-judgment', label: '语法判断' },
  { id: 'twentyfour', label: '二十四点' },
  { id: 'sudoku', label: '数独' },
  { id: 'graphic', label: '图形推理' },
  { id: 'data-analysis', label: '资料分析' },
  { id: 'op-skill', label: '运算技巧' },
  { id: 'op-highfreq', label: '高频运算' },
  { id: 'chinese', label: '语文练习' },
  { id: 'other', label: '其他' },
]

function readLogs(): PracticeSessionLogEntry[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is PracticeSessionLogEntry =>
        !!x &&
        typeof x === 'object' &&
        typeof (x as PracticeSessionLogEntry).id === 'string' &&
        typeof (x as PracticeSessionLogEntry).modeId === 'string',
    )
  } catch {
    return []
  }
}

function writeLogs(rows: PracticeSessionLogEntry[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)))
  practiceSessionLogTick.value += 1
}

export function listPracticeSessionLogs(): PracticeSessionLogEntry[] {
  void practiceSessionLogTick.value
  return readLogs()
}

export function appendPracticeSessionLog(
  modeId: string,
  stats?: PracticeSessionLogStats,
): PracticeSessionLogEntry | null {
  const id = modeId.trim()
  if (!id) return null
  const now = new Date()
  const meta = resolvePracticeLogMeta(id)
  const entry: PracticeSessionLogEntry = {
    id: `psl-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    finishedAt: now.toISOString(),
    dateKey: localDateKey(now),
    modeId: id,
    categoryId: meta.categoryId,
    categoryLabel: meta.categoryLabel,
    itemLabel: meta.itemLabel,
    correctCount: stats?.correctCount,
    totalCount: stats?.totalCount,
    score: stats?.score,
    durationMs: stats?.durationMs,
  }
  const rows = readLogs()
  rows.unshift(entry)
  writeLogs(rows)
  return entry
}

export type PracticeSessionLogFilter = {
  /** 空 = 全部日期 */
  dateKey?: string
  /** 空 = 全部大类 */
  categoryId?: string
  /** 空 = 全部小项；按 modeId 精确匹配 */
  modeId?: string
}

export function filterPracticeSessionLogs(
  filter: PracticeSessionLogFilter = {},
): PracticeSessionLogEntry[] {
  const all = listPracticeSessionLogs()
  return all.filter((row) => {
    if (filter.dateKey && row.dateKey !== filter.dateKey) return false
    if (filter.categoryId && row.categoryId !== filter.categoryId) return false
    if (filter.modeId && row.modeId !== filter.modeId) return false
    return true
  })
}

export function clearPracticeSessionLogs() {
  writeLogs([])
}

export function formatLogTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${localDateKey(d)} ${hh}:${mm}`
  } catch {
    return iso
  }
}

export function formatLogDuration(ms?: number): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return ''
  const sec = Math.round(ms / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m <= 0) return `${s} 秒`
  return `${m} 分 ${s} 秒`
}
