import { createRouter, createWebHistory } from 'vue-router'
import MentalMathView from '@/views/tools/mental-math/index.vue'
import PersonalBankView from '@/views/personal-bank/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MentalMathView,
    },
    {
      path: '/personal-bank',
      name: 'personal-bank',
      component: PersonalBankView,
    },
    {
      path: '/graphic',
      redirect: { path: '/', hash: '#graphic' },
    },
  ],
})

export default router
