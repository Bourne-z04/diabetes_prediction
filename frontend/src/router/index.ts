import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 主页和认证页面
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    // 用户相关路由，使用懒加载提高性能
    {
      path: '/user/dashboard',
      name: 'userDashboard',
      component: () => import('@/views/user/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/profile',
      name: 'userProfile',
      component: () => import('@/views/user/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/history',
      name: 'userHistory',
      component: () => import('@/views/user/HistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/feedback',
      name: 'userFeedback',
      component: () => import('@/views/user/FeedbackView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/health-plan',
      name: 'healthPlan',
      component: () => import('@/views/HealthPlanView.vue'),
      meta: { requiresAuth: true }
    },
    // 管理员相关路由
    {
      path: '/admin/dashboard',
      name: 'adminDashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'adminUsers',
      component: () => import('@/views/admin/UsersView.vue'),
      meta: { requiresAdmin: true }
    },
    // 其他页面
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    // 404页面，必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// 导航守卫，处理认证和权限
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }
  
  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
