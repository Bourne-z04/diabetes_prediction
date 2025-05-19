import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import router from '@/router'

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  diabetes_type?: string;
  activity_level?: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('jwtToken') || '');
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 尝试从localStorage加载用户信息
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('解析用户信息失败:', e);
    localStorage.removeItem('currentUser');
  }

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role_id === 2);

  // 登录
  async function login(credentials: { email?: string; username?: string; password: string }) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.auth.login(credentials);
      
      token.value = response.token;
      user.value = response.user;
      
      // 保存到 localStorage
      localStorage.setItem('jwtToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // 导航到正确的仪表板
      router.push(user.value.role_id === 2 ? '/admin/dashboard' : '/user/dashboard');
      
      return true;
    } catch (err: any) {
      error.value = err.message || '登录失败';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 注册
  async function register(userData: any) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.auth.register(userData);
      return true;
    } catch (err: any) {
      error.value = err.message || '注册失败';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 登出
  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    router.push('/');
  }

  // 检查认证状态
  function checkAuth() {
    if (!token.value) {
      router.push('/login');
      return false;
    }
    return true;
  }

  // 检查管理员权限
  function checkAdminAuth() {
    if (!token.value || !user.value || user.value.role_id !== 2) {
      router.push('/');
      return false;
    }
    return true;
  }

  return { 
    token, 
    user, 
    loading, 
    error, 
    isAuthenticated, 
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    checkAdminAuth
  }
}); 