export type PracticeHubSectionId =
  | 'log'
  | 'guide'
  | 'arithmetic'
  | 'power'
  | 'square-cube'
  | 'fraction'
  | 'divisibility'
  | 'number-sequence'
  | 'life-sense'
  | 'what-is-this'
  | 'economy-sense'
  | 'system-mgmt'
  | 'wenyan-shici'
  | 'hanzi-pattern'
  | 'wenyan-xuci'
  | 'wenyan-jushi'
  | 'grammar-judgment'
  | 'twentyfour'
  | 'sudoku'
  | 'graphic'
  | 'logic-reason'
  | 'data-analysis'
  | 'op-skill'
  | 'op-highfreq'
  | 'op-other'
  | 'chinese'
  | 'install'
  | 'settings'

export type PracticeHubSection = {
  id: PracticeHubSectionId
  title: string
}

export const PRACTICE_HUB_SECTIONS: PracticeHubSection[] = [
  { id: 'log', title: '日志' },
  { id: 'guide', title: '练习攻略' },
  { id: 'arithmetic', title: '四则口算' },
  { id: 'power', title: '2 的 n 次幂' },
  { id: 'square-cube', title: '平方与立方' },
  { id: 'fraction', title: '估算分数' },
  { id: 'divisibility', title: '整除及其性质' },
  { id: 'number-sequence', title: '数列' },
  { id: 'life-sense', title: '生活常识' },
  { id: 'what-is-this', title: '这是什么' },
  { id: 'economy-sense', title: '经济学常识' },
  { id: 'system-mgmt', title: '体制管理' },
  { id: 'wenyan-shici', title: '文言实词' },
  { id: 'hanzi-pattern', title: '汉字规律' },
  { id: 'wenyan-xuci', title: '文言虚词' },
  { id: 'wenyan-jushi', title: '文言句式' },
  { id: 'grammar-judgment', title: '语法判断' },
  { id: 'twentyfour', title: '二十四点' },
  { id: 'sudoku', title: '数独' },
  { id: 'graphic', title: '图形推理' },
  { id: 'logic-reason', title: '逻辑推理' },
  { id: 'data-analysis', title: '资料分析' },
  { id: 'op-skill', title: '运算技巧' },
  { id: 'op-highfreq', title: '高频运算' },
  { id: 'op-other', title: '其他运算' },
  { id: 'chinese', title: '语文练习' },
  { id: 'install', title: '安装' },
  { id: 'settings', title: '设置' },
]

/** 手机端二级菜单：一级分类 */
export type PracticeHubGroupId = 'browse' | 'mental' | 'quick' | 'puzzle' | 'chinese'

export type PracticeHubGroup = {
  id: PracticeHubGroupId
  title: string
  sectionIds: PracticeHubSectionId[]
}

export const PRACTICE_HUB_GROUPS: PracticeHubGroup[] = [
  { id: 'browse', title: '导览', sectionIds: ['log', 'guide', 'install', 'settings'] },
  {
    id: 'mental',
    title: '口算',
    sectionIds: ['arithmetic', 'power', 'square-cube', 'fraction', 'divisibility', 'number-sequence'],
  },
  {
    id: 'quick',
    title: '快判',
    sectionIds: [
      'life-sense',
      'what-is-this',
      'economy-sense',
      'system-mgmt',
      'wenyan-shici',
      'hanzi-pattern',
      'wenyan-xuci',
      'wenyan-jushi',
      'grammar-judgment',
    ],
  },
  {
    id: 'puzzle',
    title: '数学推理',
    sectionIds: [
      'twentyfour',
      'sudoku',
      'graphic',
      'logic-reason',
      'data-analysis',
      'op-skill',
      'op-highfreq',
      'op-other',
    ],
  },
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
