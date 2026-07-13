export type PracticeHubSectionId =
  | 'all'
  | 'guide'
  | 'arithmetic'
  | 'power'
  | 'square-cube'
  | 'fraction'
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
  { id: 'twentyfour', title: '二十四点' },
  { id: 'sudoku', title: '数独' },
  { id: 'graphic', title: '图形推理' },
  { id: 'chinese', title: '语文练习' },
  { id: 'install', title: '安装' },
]
