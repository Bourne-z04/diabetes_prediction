import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getUserInfo } from '../services/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  
  // 用户名
  const username = computed(() => userInfo.value?.username || '')
  
  // 预设用户列表（模拟用户数据库）
  const predefinedUsers = [
    {
      username: 'admin',
      password: '123456',
      role: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      phone: '13800138000'
    },
    {
      username: 'zhangsan',
      password: '123456',
      role: 'user',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001'
    }
  ]
  
  // 登录操作
  async function loginUser(credentials) {
    try {
      loading.value = true
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟登录验证
      const user = predefinedUsers.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      )
      
      if (user) {
        // 生成模拟token
        const mockToken = `mock-token-${Date.now()}`
        token.value = mockToken
        localStorage.setItem('token', token.value)
        
        // 设置用户信息
        userInfo.value = { ...user }
        
        return { success: true }
      } else {
        return { 
          success: false, 
          message: '用户名或密码错误' 
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败，请稍后重试' 
      }
    } finally {
      loading.value = false
    }
  }

  // 注册操作
  async function registerUser(userData) {
    try {
      loading.value = true
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 检查用户名是否已存在
      if (predefinedUsers.some(u => u.username === userData.username)) {
        return { success: false, message: '用户名已存在' }
      }
      
      // 模拟注册成功
      const mockToken = `mock-token-${Date.now()}`
      token.value = mockToken
      localStorage.setItem('token', token.value)
      
      // 设置用户信息
      userInfo.value = { 
        ...userData,
        role: 'user' // 新注册用户默认为普通用户
      }
      
      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败，请稍后重试' 
      }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return
    
    try {
      loading.value = true
      
      // 实际项目中，这里应该调用API获取用户信息
      // 在模拟环境下，我们已经在登录时设置了用户信息，所以这里不需要额外操作
      
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果Token无效，则登出
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
  }

  // 更新用户信息
  function updateUserData(newData) {
    userInfo.value = { ...userInfo.value, ...newData }
  }

  return { 
    token, 
    userInfo, 
    loading, 
    isLoggedIn, 
    isAdmin, 
    username,
    loginUser, 
    registerUser, 
    fetchUserInfo, 
    logout, 
    updateUserData
  }
}) 