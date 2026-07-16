/** 语文练习 Tab（主导航） */
export type ChinesePracticeTabId =
  | 'idiom-memorization'
  | 'word-memorization'
  | 'char-literacy'
  | 'poetry-practice'
  | 'classical-chinese'
  | 'rhetoric-usage'
  | 'reading-comprehension'
  | 'history-common-sense'
  | 'party-history'
  | 'theory-policy'
  | 'legal-common-sense'
  | 'economy-common-sense'
  | 'life-common-sense'
  | 'geography-common-sense'
  | 'key-questions'

/** 阅读理解子模块（面板内选择；重点题来源也按此区分） */
export type ChineseReadingSubMode =
  | 'main-idea'
  | 'detail'
  | 'word-sentence'
  | 'infer-next'
  | 'title'

export const CHINESE_READING_SUB_MODES: {
  id: ChineseReadingSubMode
  title: string
  shortTitle: string
}[] = [
  { id: 'main-idea', title: '主旨观点', shortTitle: '主旨' },
  { id: 'detail', title: '细节判断', shortTitle: '细节' },
  { id: 'word-sentence', title: '词句理解', shortTitle: '词句' },
  { id: 'infer-next', title: '推断下文', shortTitle: '下文' },
  { id: 'title', title: '标题添加', shortTitle: '标题' },
]

export type ChineseReadingKeySource = `reading-${ChineseReadingSubMode}`

export type ChinesePracticeTab = {
  id: ChinesePracticeTabId
  title: string
}

/** 语文练习内部子功能（侧边栏选「语文练习」后切换） */
export const CHINESE_PRACTICE_TABS: ChinesePracticeTab[] = [
  { id: 'idiom-memorization', title: '成语识记' },
  { id: 'word-memorization', title: '词语识记' },
  { id: 'char-literacy', title: '字音字形' },
  { id: 'poetry-practice', title: '诗词练习' },
  { id: 'classical-chinese', title: '文言知识' },
  { id: 'rhetoric-usage', title: '修辞运用' },
  { id: 'reading-comprehension', title: '阅读理解' },
  { id: 'history-common-sense', title: '历史常识' },
  { id: 'party-history', title: '中共党史' },
  { id: 'theory-policy', title: '理论政策' },
  { id: 'legal-common-sense', title: '法律常识' },
  { id: 'economy-common-sense', title: '经济常识' },
  { id: 'life-common-sense', title: '生活科学' },
  { id: 'geography-common-sense', title: '地理常识' },
  { id: 'key-questions', title: '重点题练习' },
]

/** 手机端二级菜单：一级分类 */
export type ChinesePracticeTabGroupId = 'language' | 'common-sense' | 'review'

export type ChinesePracticeTabGroup = {
  id: ChinesePracticeTabGroupId
  title: string
  tabIds: ChinesePracticeTabId[]
}

export const CHINESE_PRACTICE_TAB_GROUPS: ChinesePracticeTabGroup[] = [
  {
    id: 'language',
    title: '语文基础',
    tabIds: [
      'idiom-memorization',
      'word-memorization',
      'char-literacy',
      'poetry-practice',
      'classical-chinese',
      'rhetoric-usage',
      'reading-comprehension',
    ],
  },
  {
    id: 'common-sense',
    title: '公基常识',
    tabIds: [
      'history-common-sense',
      'party-history',
      'theory-policy',
      'legal-common-sense',
      'economy-common-sense',
      'life-common-sense',
      'geography-common-sense',
    ],
  },
  { id: 'review', title: '专项', tabIds: ['key-questions'] },
]

export function chineseTabGroupIdForTab(tabId: ChinesePracticeTabId): ChinesePracticeTabGroupId {
  for (const g of CHINESE_PRACTICE_TAB_GROUPS) {
    if (g.tabIds.includes(tabId)) return g.id
  }
  return 'language'
}

export function chineseTabsInGroup(groupId: ChinesePracticeTabGroupId): ChinesePracticeTab[] {
  const g = CHINESE_PRACTICE_TAB_GROUPS.find((x) => x.id === groupId)
  if (!g) return []
  return g.tabIds
    .map((id) => CHINESE_PRACTICE_TABS.find((t) => t.id === id))
    .filter((t): t is ChinesePracticeTab => !!t)
}

/** 手机一级导航：多子项保留分组；仅 1 项的合并为直接入口 */
export type ChinesePracticeNavItem =
  | { kind: 'group'; group: ChinesePracticeTabGroup }
  | { kind: 'tab'; tab: ChinesePracticeTab; groupId: ChinesePracticeTabGroupId }

export const CHINESE_PRACTICE_NAV_ITEMS: ChinesePracticeNavItem[] = CHINESE_PRACTICE_TAB_GROUPS.map(
  (group) => {
    if (group.tabIds.length === 1) {
      const tab = CHINESE_PRACTICE_TABS.find((t) => t.id === group.tabIds[0])!
      return { kind: 'tab' as const, tab, groupId: group.id }
    }
    return { kind: 'group' as const, group }
  },
)

export function chineseTabGroupHasMultiple(groupId: ChinesePracticeTabGroupId): boolean {
  const g = CHINESE_PRACTICE_TAB_GROUPS.find((x) => x.id === groupId)
  return (g?.tabIds.length ?? 0) > 1
}

export const DEFAULT_CHINESE_PRACTICE_TAB: ChinesePracticeTabId = 'idiom-memorization'

/**
 * 重点题来源：主 Tab（不含 key-questions / 阅读理解父级）+ 阅读理解五个子模块。
 * 旧版成语来源 id 曾为 word-memorization，备注读取时会兼容迁移。
 */
export type ChineseKeyQuestionSource =
  | Exclude<ChinesePracticeTabId, 'key-questions' | 'reading-comprehension'>
  | ChineseReadingKeySource

export function readingKeySource(mode: ChineseReadingSubMode): ChineseReadingKeySource {
  return `reading-${mode}`
}

export function readingSubModeFromKeySource(
  source: ChineseKeyQuestionSource,
): ChineseReadingSubMode | null {
  if (!source.startsWith('reading-')) return null
  const mode = source.slice('reading-'.length) as ChineseReadingSubMode
  return CHINESE_READING_SUB_MODES.some((m) => m.id === mode) ? mode : null
}

export const CHINESE_KEY_QUESTION_SOURCES: { id: ChineseKeyQuestionSource; title: string }[] = [
  { id: 'idiom-memorization', title: '成语识记' },
  { id: 'word-memorization', title: '词语识记' },
  { id: 'char-literacy', title: '字音字形' },
  { id: 'poetry-practice', title: '诗词练习' },
  { id: 'classical-chinese', title: '文言知识' },
  { id: 'rhetoric-usage', title: '修辞运用' },
  ...CHINESE_READING_SUB_MODES.map((m) => ({
    id: readingKeySource(m.id) as ChineseKeyQuestionSource,
    title: `阅读·${m.title}`,
  })),
  { id: 'history-common-sense', title: '历史常识' },
  { id: 'party-history', title: '中共党史' },
  { id: 'theory-policy', title: '理论政策' },
  { id: 'legal-common-sense', title: '法律常识' },
  { id: 'economy-common-sense', title: '经济常识' },
  { id: 'life-common-sense', title: '生活科学' },
  { id: 'geography-common-sense', title: '地理常识' },
]
