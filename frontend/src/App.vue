<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AIAssistant from '@/components/AIAssistant.vue'
import AppNotification from '@/components/AppNotification.vue'

const route = useRoute()
const authStore = useAuthStore()

// 计算当前路径，用于激活正确的导航项
const currentPath = computed(() => route.path)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

// 用户菜单项
const userNavItems = [
  { name: '首页', path: '/', icon: 'bi bi-house-door' },
  { name: '健康方案', path: '/health-plan', icon: 'bi bi-clipboard2-check' },
  { name: '历史数据', path: '/user/history', icon: 'bi bi-graph-up' },
  { name: '个人资料', path: '/user/profile', icon: 'bi bi-person-gear' },
  { name: '用户反馈', path: '/user/feedback', icon: 'bi bi-chat-dots' }
]

// 管理员菜单项
const adminNavItems = [
  { name: '首页', path: '/', icon: 'bi bi-house-door' },
  { name: '仪表盘', path: '/admin/dashboard', icon: 'bi bi-speedometer2' },
  { name: '用户管理', path: '/admin/users', icon: 'bi bi-people' },
  { name: '数据上传', path: '/admin/data-upload', icon: 'bi bi-cloud-upload' },
  { name: '数据可视化', path: '/admin/visualization', icon: 'bi bi-graph-up' }
]

// 根据用户角色显示不同的导航项
const navItems = computed(() => isAdmin.value ? adminNavItems : userNavItems)

// 处理登出
function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div class="app-container">
    <!-- 固定背景 -->
    <div class="fixed-background"></div>
    
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-blur" v-if="isAuthenticated">
      <div class="container">
        <RouterLink class="navbar-brand" to="/">
          <i class="bi bi-heart-pulse-fill me-2"></i>
          <span class="fw-bold">糖尿病健康系统</span>
        </RouterLink>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-for="item in navItems" :key="item.path">
              <RouterLink class="nav-link" :to="item.path" 
                :class="{ active: currentPath === item.path }">
                <i :class="item.icon" class="me-1"></i> {{ item.name }}
              </RouterLink>
            </li>
          </ul>
          
          <div class="d-flex align-items-center">
            <div class="dropdown">
              <a href="#" class="text-white dropdown-toggle text-decoration-none" 
                 id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="@/assets/images/logo.jpg" alt="User Avatar" class="avatar-icon me-1" style="width: 24px; height: 24px; border-radius: 50%;">
                {{ authStore.user?.username || '用户' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end dropdown-blur" aria-labelledby="userDropdown">
                <li>
                  <RouterLink class="dropdown-item" to="/user/profile">
                    <i class="bi bi-person-gear me-1"></i> 个人资料
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-1"></i> 退出登录
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 主内容区域 -->
    <main>
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
      
      <!-- AI助手组件 -->
      <AIAssistant v-if="isAuthenticated" />
      
      <!-- 通知组件 -->
      <AppNotification />
    </main>
    
    <!-- 页脚 -->
    <footer class="footer py-4 mt-auto">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <p class="mb-0">&copy; {{ new Date().getFullYear() }} 糖尿病健康方案定制系统</p>
          </div>
          <div class="col-md-6 text-md-end">
            <a href="#" class="me-3">隐私政策</a>
            <a href="#" class="me-3">使用条款</a>
            <a href="#">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import '@/assets/main.css';
@import 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';

/* 全局样式 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #1e293b; /* 深色背景，防止背景图片加载前出现白色 */
}

/* 固定背景 */
.fixed-background {
  background-image: url('@/assets/images/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.fixed-background::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* 主要内容区域 */
main {
  flex: 1;
  width: 100%;
}

/* 导航栏样式 */
.navbar-blur {
  background-color: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.navbar-brand {
  font-size: 1.25rem;
  color: #fff;
}

.navbar-brand:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-link {
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.85);
}

.nav-link:hover {
  transform: translateY(-2px);
  color: #fff;
}

.nav-link.active {
  color: #fff;
  font-weight: 700;
  position: relative;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background-color: #fff;
  border-radius: 1px;
}

/* 下拉菜单样式 */
.dropdown-blur {
  background-color: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dropdown-item {
  color: #fff;
}

.dropdown-item:hover, .dropdown-item:focus {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 页脚样式 */
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(30, 41, 59, 0.85) !important;
  backdrop-filter: blur(10px);
  color: #fff;
}

.footer a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.footer a:hover {
  color: #fff;
}

/* 模态框样式修复 */
.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

/* 卡片样式 */
.auth-card {
  margin-top: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

/* 加载指示器 */
.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .navbar-collapse {
    background-color: rgba(30, 41, 59, 0.95);
    border-radius: 10px;
    padding: 1rem;
    margin-top: 0.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .navbar-toggler {
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
  
  .navbar-toggler-icon {
    filter: invert(1);
  }
}

/* 夜间模式适配 */
@media (prefers-color-scheme: dark) {
  body:not(.light-mode) .footer {
    background-color: rgba(30, 41, 59, 0.8) !important;
    color: #fff;
  }
  
  body:not(.light-mode) .footer .text-muted {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}
</style>
