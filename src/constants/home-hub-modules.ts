/** 首页模块。题库整理始终显示；其余可在设置「菜单管理」里开关。 */
export const HOME_HUB_MODULE_IDS = [
  'train',
  'bank',
  'computer',
  'frontend',
  'cs-vocab',
  'dsa',
] as const

export type HomeHubModuleId = (typeof HOME_HUB_MODULE_IDS)[number]

export const HOME_HUB_PINNED_ID: HomeHubModuleId = 'bank'

/** 默认隐藏知识训练、计算机单词和语法，其余显示 */
export const HOME_HUB_DEFAULT_HIDDEN: HomeHubModuleId[] = ['train', 'cs-vocab']

export type HomeHubModule = {
  id: HomeHubModuleId
  title: string
  desc: string
  ready: boolean
  to: { name: string; params?: Record<string, string> }
}

export const HOME_HUB_MODULES: HomeHubModule[] = [
  {
    id: 'train',
    title: '知识训练',
    desc: '口算、快判、数学推理、语文练习与练习日志',
    ready: true,
    to: { name: 'train', params: { section: 'log' } },
  },
  {
    id: 'bank',
    title: '题库整理',
    desc: '个人题库：分类、拍照录入、测验与导出',
    ready: true,
    to: { name: 'bank' },
  },
  {
    id: 'computer',
    title: '计算机基础',
    desc: '讲义树形分类；已开放「计算机概述」',
    ready: true,
    to: { name: 'computer' },
  },
  {
    id: 'frontend',
    title: '前端学习',
    desc: '讲义树形分类；目录与正文保存在 Node，不写死在前端',
    ready: true,
    to: { name: 'frontend' },
  },
  {
    id: 'cs-vocab',
    title: '计算机单词和语法',
    desc: '从计算机基础、前端学习讲义抽出的核心单词、语法与必记概念；加深识记',
    ready: true,
    to: { name: 'cs-vocab' },
  },
  {
    id: 'dsa',
    title: '数据结构与算法',
    desc: '编程练习：先看题，再补全 JavaScript 并测试执行结果',
    ready: true,
    to: { name: 'dsa' },
  },
]

export function isHomeHubModuleId(id: string): id is HomeHubModuleId {
  return (HOME_HUB_MODULE_IDS as readonly string[]).includes(id)
}
