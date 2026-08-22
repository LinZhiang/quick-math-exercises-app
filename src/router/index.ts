/**
 * 路由：首页四模块 + 知识训练 /train/:section + 题库 + 计算机基础 + 安装/设置。
 * chrome: 'home' 才显示安装/设置按钮（见 App.vue）。
 */
import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteLocationRaw } from 'vue-router'
import { isTrainHubSectionId } from '@/constants/practice-hub-sections'
import HomeHub from '@/views/home/HomeHub.vue'
import MentalMathView from '@/views/tools/mental-math/index.vue'
import PersonalBankView from '@/views/personal-bank/index.vue'
import ComputerBasicsView from '@/views/computer-basics/index.vue'
import ComputerHandoutDetail from '@/views/computer-basics/ComputerHandoutDetail.vue'
import ComputerQuizBookPage from '@/views/computer-basics/ComputerQuizBookPage.vue'
import ComputerQuizBookNodePage from '@/views/computer-basics/ComputerQuizBookNodePage.vue'
import ComputerStudyLogPage from '@/views/computer-basics/ComputerStudyLogPage.vue'
import InstallSettingsPage from '@/views/common/InstallSettingsPage.vue'

function legacyHomeRedirect(to: RouteLocationNormalized): RouteLocationRaw | true {
  const hash = to.hash.replace('#', '')
  const q = to.query.section
  const sec = hash || (typeof q === 'string' ? q : Array.isArray(q) ? String(q[0] ?? '') : '')
  if (sec === 'install' || sec === 'settings') return { name: sec }
  if (sec === 'chinese-idiom' || sec === 'chinese-key') {
    return { name: 'train', params: { section: 'chinese' } }
  }
  if (isTrainHubSectionId(sec)) return { name: 'train', params: { section: sec } }
  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeHub,
      meta: { title: '学习App', chrome: 'home' },
      beforeEnter: (to) => legacyHomeRedirect(to),
    },
    {
      path: '/train',
      redirect: { name: 'train', params: { section: 'log' } },
    },
    {
      path: '/train/:section',
      name: 'train',
      component: MentalMathView,
      meta: { title: '知识训练', chrome: 'app' },
      beforeEnter: (to) => {
        const section = String(to.params.section ?? '')
        if (section === 'install' || section === 'settings') return { name: section }
        if (!isTrainHubSectionId(section)) {
          return { name: 'train', params: { section: 'log' }, query: to.query }
        }
        return true
      },
    },
    {
      path: '/bank',
      name: 'bank',
      component: PersonalBankView,
      meta: { title: '题库整理', chrome: 'app' },
    },
    {
      path: '/bank/:categoryId/:subId',
      name: 'bank-sub',
      component: PersonalBankView,
      meta: { title: '题库整理', chrome: 'app' },
    },
    {
      path: '/install',
      name: 'install',
      component: InstallSettingsPage,
      meta: { title: '安装', chrome: 'app' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: InstallSettingsPage,
      meta: { title: '设置', chrome: 'app' },
    },
    {
      path: '/computer',
      name: 'computer',
      component: ComputerBasicsView,
      meta: { title: '计算机基础', chrome: 'app' },
    },
    {
      path: '/computer/item/:itemId',
      name: 'computer-item',
      component: ComputerHandoutDetail,
      meta: { title: '计算机基础', chrome: 'app' },
      beforeEnter: (to) => {
        const itemId = String(to.params.itemId ?? '').trim()
        if (!itemId) return { name: 'computer', replace: true }
        return true
      },
    },
    {
      path: '/computer/book',
      name: 'computer-book',
      component: ComputerQuizBookPage,
      meta: { title: 'AI题目整理', chrome: 'app' },
    },
    {
      path: '/computer/book/node',
      name: 'computer-book-node',
      component: ComputerQuizBookNodePage,
      meta: { title: 'AI题目整理', chrome: 'app' },
    },
    {
      path: '/computer/log',
      name: 'computer-log',
      component: ComputerStudyLogPage,
      meta: { title: '学习日志', chrome: 'app' },
    },
    { path: '/frontend', redirect: { name: 'home' } },
    { path: '/personal-bank', redirect: { name: 'bank' } },
    { path: '/graphic', redirect: { name: 'train', params: { section: 'graphic' } } },
  ],
})

export default router
