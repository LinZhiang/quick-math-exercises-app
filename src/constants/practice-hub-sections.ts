export type PracticeHubSectionId =
  | 'all'
  | 'guide'
  | 'arithmetic'
  | 'power'
  | 'square-cube'
  | 'fraction'
  | 'divisibility'
  | 'life-sense'
  | 'grammar-judgment'
  | 'twentyfour'
  | 'sudoku'
  | 'graphic'
  | 'chinese'
  | 'install'

export type PracticeHubSection = {
  id: PracticeHubSectionId
  title: string
}

export const PRACTICE_HUB_SECTIONS: PracticeHubSection[] = [
  { id: 'all', title: '全部模式' },
  { id: 'guide', title: '练习攻略' },
  { id: 'arithmetic', title: '四则口算' },
  { id: 'power', title: '2 的 n 次幂' },
  { id: 'square-cube', title: '平方与立方' },
  { id: 'fraction', title: '估算分数' },
  { id: 'divisibility', title: '整除及其性质' },
  { id: 'life-sense', title: '生活常识' },
  { id: 'grammar-judgment', title: '语法判断' },
  { id: 'twentyfour', title: '二十四点' },
  { id: 'sudoku', title: '数独' },
  { id: 'graphic', title: '图形推理' },
  { id: 'chinese', title: '语文练习' },
  { id: 'install', title: '安装' },
]

/** 手机端二级菜单：一级分类 */
export type PracticeHubGroupId = 'browse' | 'mental' | 'quick' | 'puzzle' | 'chinese'

export type PracticeHubGroup = {
  id: PracticeHubGroupId
  title: string
  sectionIds: PracticeHubSectionId[]
}

export const PRACTICE_HUB_GROUPS: PracticeHubGroup[] = [
  { id: 'browse', title: '导览', sectionIds: ['all', 'guide', 'install'] },
  {
    id: 'mental',
    title: '口算',
    sectionIds: ['arithmetic', 'power', 'square-cube', 'fraction', 'divisibility'],
  },
  { id: 'quick', title: '快判', sectionIds: ['life-sense', 'grammar-judgment'] },
  { id: 'puzzle', title: '益智', sectionIds: ['twentyfour', 'sudoku', 'graphic'] },
  { id: 'chinese', title: '语文', sectionIds: ['chinese'] },
]

export function practiceHubGroupIdForSection(
  sectionId: PracticeHubSectionId,
): PracticeHubGroupId {
  for (const g of PRACTICE_HUB_GROUPS) {
    if (g.sectionIds.includes(sectionId)) return g.id
  }
  return 'browse'
}

export function practiceHubSectionsInGroup(groupId: PracticeHubGroupId): PracticeHubSection[] {
  const g = PRACTICE_HUB_GROUPS.find((x) => x.id === groupId)
  if (!g) return []
  return g.sectionIds
    .map((id) => PRACTICE_HUB_SECTIONS.find((s) => s.id === id))
    .filter((s): s is PracticeHubSection => !!s)
}

/** 手机一级导航：多子项保留分组；仅 1 项的合并为直接入口 */
export type PracticeHubNavItem =
  | { kind: 'group'; group: PracticeHubGroup }
  | { kind: 'section'; section: PracticeHubSection; groupId: PracticeHubGroupId }

export const PRACTICE_HUB_NAV_ITEMS: PracticeHubNavItem[] = PRACTICE_HUB_GROUPS.map((group) => {
  if (group.sectionIds.length === 1) {
    const section = PRACTICE_HUB_SECTIONS.find((s) => s.id === group.sectionIds[0])!
    return { kind: 'section' as const, section, groupId: group.id }
  }
  return { kind: 'group' as const, group }
})

export function practiceHubGroupHasMultiple(groupId: PracticeHubGroupId): boolean {
  const g = PRACTICE_HUB_GROUPS.find((x) => x.id === groupId)
  return (g?.sectionIds.length ?? 0) > 1
}
