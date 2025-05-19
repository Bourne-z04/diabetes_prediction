<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 处理登出
function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="header" v-if="authStore.isAuthenticated">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="fas fa-heartbeat me-2"></i>
          <span>糖尿病健康方案系统</span>
        </router-link>
        
        <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="切换导航">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/user/dashboard">
                <i class="fas fa-tachometer-alt me-1"></i> 仪表板
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/health-plan">
                <i class="fas fa-clipboard-list me-1"></i> 健康方案
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/user/history">
                <i class="fas fa-chart-line me-1"></i> 历史数据
              </router-link>
            </li>
          </ul>
          
          <!-- 用户信息 -->
          <div class="navbar-nav ms-auto">
            <div class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" 
                 role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle me-1"></i>
                {{ authStore.user?.username || '用户' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" to="/user/profile">
                    <i class="fas fa-user-cog me-2"></i> 个人资料
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    <i class="fas fa-sign-out-alt me-2"></i> 退出登录
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: 700;
}

.nav-link {
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  transform: translateY(-2px);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}
</style> 