<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('login')

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  loading: false,
})

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  diabetesType: '1', // 默认选项
  activityLevel: 'low', // 默认选项
  loading: false,
  error: '',
})

// 表单验证信息
const formErrors = reactive({
  login: '',
  register: '',
})

// 切换标签页
function setActiveTab(tab: string) {
  activeTab.value = tab
  formErrors.login = ''
  formErrors.register = ''
}

// 登录处理
async function handleLogin() {
  formErrors.login = ''
  
  // 表单验证
  if (!loginForm.email || !loginForm.password) {
    formErrors.login = '请填写邮箱和密码'
    return
  }
  
  loginForm.loading = true
  
  try {
    // 调用store的登录方法
    const result = await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    if (result) {
      // 如果有重定向参数，则跳转到该页面
      const redirectPath = route.query.redirect ? String(route.query.redirect) : 
                         (authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard')
      router.push(redirectPath)
    } else {
      formErrors.login = authStore.error || '登录失败，请检查输入信息'
    }
  } catch (error: any) {
    formErrors.login = error.message || '登录过程中发生错误'
  } finally {
    loginForm.loading = false
  }
}

// 注册处理
async function handleRegister() {
  formErrors.register = ''
  
  // 表单验证
  if (!registerForm.username || !registerForm.email || !registerForm.password) {
    formErrors.register = '请填写所有必填字段'
    return
  }
  
  // 密码确认
  if (registerForm.password !== registerForm.confirm_password) {
    formErrors.register = '两次输入的密码不一致'
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    formErrors.register = '请输入有效的电子邮箱地址'
    return
  }
  
  registerForm.loading = true
  
  try {
    // 构建注册数据
    const userData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      diabetes_type: registerForm.diabetesType,
      activity_level: registerForm.activityLevel
    }
    
    // 调用store的注册方法
    const result = await authStore.register(userData)
    
    if (result) {
      // 注册成功，显示成功信息并切换到登录标签页
      formErrors.register = '注册成功！请使用您的账号登录'
      loginForm.email = registerForm.email // 自动填充邮箱
      
      // 清空注册表单
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirm_password = ''
      
      // 切换到登录标签页
      setTimeout(() => {
        setActiveTab('login')
      }, 1500)
    } else {
      formErrors.register = authStore.error || '注册失败，请稍后再试'
    }
  } catch (error: any) {
    formErrors.register = error.message || '注册过程中发生错误'
  } finally {
    registerForm.loading = false
  }
}

// 如果用户已登录，则重定向到正确的仪表板
if (authStore.isAuthenticated) {
  router.push(authStore.isAdmin ? '/admin/dashboard' : '/user/dashboard')
}
</script>

<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card auth-card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'login' }" 
                     href="#" @click.prevent="setActiveTab('login')">登录</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'register' }" 
                     href="#" @click.prevent="setActiveTab('register')">注册</a>
                </li>
              </ul>
            </div>
            <div class="card-body">
              <!-- 登录表单 -->
              <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
                <h4 class="mb-4 text-center">账号登录</h4>
                
                <div v-if="formErrors.login" class="alert alert-danger">
                  {{ formErrors.login }}
                </div>
                
                <div class="mb-3">
                  <label for="login-email" class="form-label">邮箱或用户名</label>
                  <input type="text" class="form-control" id="login-email" 
                         v-model="loginForm.email" placeholder="请输入邮箱或用户名" required>
                </div>
                
                <div class="mb-4">
                  <label for="login-password" class="form-label">密码</label>
                  <input type="password" class="form-control" id="login-password" 
                         v-model="loginForm.password" placeholder="请输入密码" required>
                </div>
                
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="loginForm.loading">
                    <span v-if="loginForm.loading" class="spinner-border spinner-border-sm" 
                          role="status" aria-hidden="true"></span>
                    {{ loginForm.loading ? '登录中...' : '登录' }}
                  </button>
                </div>
                
                <div class="mt-3 text-center">
                  <a href="#" @click.prevent="setActiveTab('register')">还没有账号？点击注册</a>
                </div>
              </form>
              
              <!-- 注册表单 -->
              <form v-if="activeTab === 'register'" @submit.prevent="handleRegister">
                <h4 class="mb-4 text-center">创建新账号</h4>
                
                <div v-if="formErrors.register" 
                     class="alert" 
                     :class="formErrors.register.includes('成功') ? 'alert-success' : 'alert-danger'">
                  {{ formErrors.register }}
                </div>
                
                <div class="mb-3">
                  <label for="reg-username" class="form-label">用户名</label>
                  <input type="text" class="form-control" id="reg-username" 
                         v-model="registerForm.username" placeholder="请输入用户名" required>
                </div>
                
                <div class="mb-3">
                  <label for="reg-email" class="form-label">电子邮箱</label>
                  <input type="email" class="form-control" id="reg-email" 
                         v-model="registerForm.email" placeholder="请输入电子邮箱" required>
                </div>
                
                <div class="mb-3">
                  <label for="reg-password" class="form-label">密码</label>
                  <input type="password" class="form-control" id="reg-password" 
                         v-model="registerForm.password" placeholder="请输入密码" required>
                </div>
                
                <div class="mb-3">
                  <label for="reg-confirm-password" class="form-label">确认密码</label>
                  <input type="password" class="form-control" id="reg-confirm-password" 
                         v-model="registerForm.confirm_password" placeholder="请再次输入密码" required>
                </div>
                
                <div class="mb-3">
                  <label for="reg-diabetesType" class="form-label">糖尿病类型</label>
                  <select class="form-select" id="reg-diabetesType" v-model="registerForm.diabetesType">
                    <option value="1">I型糖尿病</option>
                    <option value="2">II型糖尿病</option>
                    <option value="gestational">妊娠糖尿病</option>
                    <option value="prediabetes">糖尿病前期</option>
                    <option value="none">无糖尿病</option>
                  </select>
                </div>
                
                <div class="mb-4">
                  <label for="reg-activityLevel" class="form-label">活动水平</label>
                  <select class="form-select" id="reg-activityLevel" v-model="registerForm.activityLevel">
                    <option value="sedentary">久坐生活方式</option>
                    <option value="low">低度活动</option>
                    <option value="moderate">中度活动</option>
                    <option value="high">高度活动</option>
                    <option value="extreme">极高活动量</option>
                  </select>
                </div>
                
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="registerForm.loading">
                    <span v-if="registerForm.loading" class="spinner-border spinner-border-sm" 
                          role="status" aria-hidden="true"></span>
                    {{ registerForm.loading ? '注册中...' : '注册' }}
                  </button>
                </div>
                
                <div class="mt-3 text-center">
                  <a href="#" @click.prevent="setActiveTab('login')">已有账号？点击登录</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 3rem 0;
  position: relative;
}

.auth-card {
  background-color: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-tabs .nav-link {
  color: rgba(255, 255, 255, 0.7);
  border: none;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #fff;
  background-color: transparent;
  border-bottom: 2px solid #4e73df;
}

.form-control, .form-select {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  color: #fff;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus, .form-select:focus {
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.25);
  background-color: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
</style> 