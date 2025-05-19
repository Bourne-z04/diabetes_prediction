<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// 检查用户是否已登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

const user = authStore.user

// 用户表单信息
const userForm = reactive({
  username: user?.username || '',
  email: user?.email || '',
  diabetes_type: user?.diabetes_type || '1',
  activity_level: user?.activity_level || 'low',
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 提交表单
function handleSubmit() {
  loading.value = true
  error.value = null
  successMessage.value = null
  
  // 验证表单
  if (!userForm.username || !userForm.email) {
    error.value = '用户名和邮箱是必填项'
    loading.value = false
    return
  }
  
  // 验证密码
  if (userForm.new_password) {
    if (!userForm.old_password) {
      error.value = '请输入旧密码'
      loading.value = false
      return
    }
    
    if (userForm.new_password !== userForm.confirm_password) {
      error.value = '新密码两次输入不一致'
      loading.value = false
      return
    }
  }
  
  // 模拟API请求
  setTimeout(() => {
    // 更新成功
    successMessage.value = '个人资料更新成功'
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="profile-page">
    <div class="container py-4">
      <h1 class="mb-4">个人资料</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">处理中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-if="successMessage" class="alert alert-success my-4">
        {{ successMessage }}
      </div>
      
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">编辑个人资料</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="username" class="form-label">用户名</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="userForm.username" 
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">电子邮箱</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="userForm.email" 
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="diabetes_type" class="form-label">糖尿病类型</label>
                  <select 
                    class="form-select" 
                    id="diabetes_type" 
                    v-model="userForm.diabetes_type"
                  >
                    <option value="1">I型糖尿病</option>
                    <option value="2">II型糖尿病</option>
                    <option value="gestational">妊娠糖尿病</option>
                    <option value="prediabetes">糖尿病前期</option>
                    <option value="none">无糖尿病</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="activity_level" class="form-label">活动水平</label>
                  <select 
                    class="form-select" 
                    id="activity_level" 
                    v-model="userForm.activity_level"
                  >
                    <option value="sedentary">久坐生活方式</option>
                    <option value="low">低度活动</option>
                    <option value="moderate">中度活动</option>
                    <option value="high">高度活动</option>
                    <option value="extreme">极高活动量</option>
                  </select>
                </div>
                
                <hr class="my-4">
                <h5 class="mb-3">修改密码</h5>
                
                <div class="mb-3">
                  <label for="old_password" class="form-label">当前密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="old_password" 
                    v-model="userForm.old_password"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="new_password" class="form-label">新密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="new_password" 
                    v-model="userForm.new_password"
                  >
                </div>
                
                <div class="mb-4">
                  <label for="confirm_password" class="form-label">确认新密码</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirm_password" 
                    v-model="userForm.confirm_password"
                  >
                </div>
                
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    保存更改
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 mt-4 mt-lg-0">
          <div class="card user-profile-card">
            <div class="card-body text-center">
              <div class="profile-avatar">
                <img src="@/assets/images/logo.jpg" alt="User Avatar" class="img-fluid rounded-circle" style="width: 120px; height: 120px; object-fit: cover;">
              </div>
              <h4 class="mt-3">{{ user?.username }}</h4>
              <p class="text-muted">{{ user?.email }}</p>
              
              <div class="profile-info mt-4">
                <div class="profile-info-item">
                  <span class="info-label">糖尿病类型:</span>
                  <span class="info-value">
                    {{ userForm.diabetes_type === '1' ? 'I型糖尿病' : 
                       userForm.diabetes_type === '2' ? 'II型糖尿病' :
                       userForm.diabetes_type === 'gestational' ? '妊娠糖尿病' :
                       userForm.diabetes_type === 'prediabetes' ? '糖尿病前期' : '无糖尿病' }}
                  </span>
                </div>
                <div class="profile-info-item">
                  <span class="info-label">活动水平:</span>
                  <span class="info-value">
                    {{ userForm.activity_level === 'sedentary' ? '久坐生活方式' : 
                       userForm.activity_level === 'low' ? '低度活动' :
                       userForm.activity_level === 'moderate' ? '中度活动' :
                       userForm.activity_level === 'high' ? '高度活动' : '极高活动量' }}
                  </span>
                </div>
              </div>
              
              <div class="mt-4">
                <p class="text-muted mb-0">账号创建于</p>
                <p>{{ user?.created_at ? new Date(user.created_at).toLocaleDateString() : '未知' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background-color: transparent;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.card {
  background-color: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
}

.card-header {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  font-size: 5rem;
  color: #4e73df;
  margin-bottom: 1rem;
}

.profile-info {
  text-align: left;
  margin-top: 1.5rem;
}

.profile-info-item {
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 600;
  margin-right: 0.5rem;
}

.user-profile-card {
  position: sticky;
  top: 2rem;
}

.text-muted {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style> 