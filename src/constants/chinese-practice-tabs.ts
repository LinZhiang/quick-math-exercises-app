export type ChinesePracticeTabId =
  | 'word-memorization'
  | 'char-literacy'
  | 'poetry-practice'
  | 'common-sense'
  | 'key-questions'

export type ChinesePracticeTab = {
  id: ChinesePracticeTabId
  title: string
}

/** 语文练习内部子功能（侧边栏选「语文练习」后切换） */
export const CHINESE_PRACTICE_TABS: ChinesePracticeTab[] = [
  { id: 'word-memorization', title: '词语识记' },
  { id: 'char-literacy', title: '字音字形' },
  { id: 'poetry-practice', title: '诗词练习' },
  { id: 'common-sense', title: '常识练习' },
  { id: 'key-questions', title: '关键题练习' },
]

export const DEFAULT_CHINESE_PRACTICE_TAB: ChinesePracticeTabId = 'word-memorization'

/** 关键题面板中的练习来源（不含 key-questions 本身） */
export type ChineseKeyQuestionSource = Exclude<ChinesePracticeTabId, 'key-questions'>

export const CHINESE_KEY_QUESTION_SOURCES: { id: ChineseKeyQuestionSource; title: string }[] = [
  { id: 'word-memorization', title: '词语识记' },
  { id: 'char-literacy', title: '字音字形' },
  { id: 'poetry-practice', title: '诗词练习' },
  { id: 'common-sense', title: '常识练习' },
]
