import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

// 公共路由
const publicRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

// 用户路由
const userRoutes = [
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import('../views/user/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/myinfo',
    name: 'MyInfo',
    component: () => import('../views/user/MyInfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/health-records',
    name: 'HealthRecords',
    component: () => import('../views/user/HealthRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/health-guide',
    name: 'HealthGuide',
    component: () => import('../views/user/HealthGuide.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/analysis',
    name: 'Analysis',
    component: () => import('../views/user/Analysis.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/feedback',
    name: 'Feedback',
    component: () => import('../views/user/Feedback.vue'),
    meta: { requiresAuth: true }
  }
]

// 管理员路由
const adminRoutes = [
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user-management',
    name: 'UserManagement',
    component: () => import('../views/admin/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes]
})

// 动态添加路由
export function setupDynamicRoutes() {
  const userStore = useUserStore()
  const { isLoggedIn, isAdmin } = userStore

  if (isLoggedIn) {
    // 添加用户路由
    userRoutes.forEach(route => {
      if (!router.hasRoute(route.name)) {
        router.addRoute(route)
      }
    })

    // 如果是管理员，添加管理员路由
    if (isAdmin) {
      adminRoutes.forEach(route => {
        if (!router.hasRoute(route.name)) {
          router.addRoute(route)
        }
      })
    }

    // 添加匹配所有路由的404页面
    router.addRoute({
      path: '/:pathMatch(.*)*',
      redirect: isAdmin ? '/admin/dashboard' : '/user/dashboard'
    })
  }
}

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const { isLoggedIn, isAdmin } = userStore

  // 设置动态路由
  setupDynamicRoutes()

  // 处理需要认证的页面
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } 
  // 处理需要管理员权限的页面
  else if (to.meta.requiresAdmin && !isAdmin) {
    next(isLoggedIn ? '/user/dashboard' : '/login')
  }
  // 已登录用户访问登录/注册页面，重定向到主页
  else if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next(isAdmin ? '/admin/dashboard' : '/user/dashboard')
  }
  else {
    next()
  }
})

export default router 