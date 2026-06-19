import { createRouter, createWebHistory } from 'vue-router'
import MentalMathView from '@/views/tools/mental-math/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MentalMathView,
    },
    {
      path: '/graphic',
      redirect: { path: '/', hash: '#graphic' },
    },
  ],
})

export default router
