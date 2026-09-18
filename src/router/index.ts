import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { parseIntent, safeRedirect, withIntent } from '../utils/redirect'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'projects',
      component: () => import('../views/ProjectListView.vue'),
    },
    {
      path: '/canvas/:id',
      name: 'canvas',
      component: () => import('../views/CanvasView.vue'),
      props: true,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.name !== 'login') return true
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return true
  return withIntent(safeRedirect(to.query.redirect), parseIntent(to.query.intent))
})

export default router
