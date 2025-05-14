<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">健康管理系统</h1>
      <el-form 
        ref="loginFormRef"
        :model="loginForm" 
        :rules="loginRules" 
        label-position="top" 
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

// 路由
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.loginUser(loginForm.value)
        
        if (result.success) {
          ElMessage.success('登录成功')
          // 根据用户角色重定向到相应页面
          const redirectPath = userStore.isAdmin ? '/admin/dashboard' : '/user/dashboard'
          router.push(redirectPath)
        } else {
          ElMessage.error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 生命周期钩子
onMounted(() => {
  // 如果已登录，直接跳转到主页
  if (userStore.isLoggedIn) {
    const redirectPath = userStore.isAdmin ? '/admin/dashboard' : '/user/dashboard'
    router.push(redirectPath)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--bg-color);
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--primary-color);
  font-size: 28px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  margin-top: 10px;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.form-footer a {
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 5px;
}

@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 20px;
  }
}
</style> 