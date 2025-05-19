<script setup lang="ts">
import { ref, watch } from 'vue'

interface UserData {
  id?: number
  username: string
  email: string
  password: string
  role_id: number
  diabetes_type?: string
  activity_level?: string
}

// 接收属性
const props = defineProps<{
  user: UserData
  mode: 'add' | 'edit'
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', userData: UserData): void
}>()

// 表单数据
const userData = ref<UserData>({
  id: undefined,
  username: '',
  email: '',
  password: '',
  role_id: 1,
  diabetes_type: '',
  activity_level: ''
})

// 表单验证
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// 当props.user变化时，更新表单数据
watch(() => props.user, (newUser) => {
  if (newUser) {
    userData.value = { ...newUser }
  }
}, { immediate: true })

// 验证表单
function validateForm() {
  const newErrors: Record<string, string> = {}
  
  // 用户名验证
  if (!userData.value.username.trim()) {
    newErrors.username = '用户名不能为空'
  } else if (userData.value.username.length < 3) {
    newErrors.username = '用户名不能少于3个字符'
  }
  
  // 邮箱验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!userData.value.email.trim()) {
    newErrors.email = '邮箱不能为空'
  } else if (!emailRegex.test(userData.value.email)) {
    newErrors.email = '请输入有效的邮箱地址'
  }
  
  // 密码验证（仅添加模式或编辑模式下有填写密码时验证）
  if (props.mode === 'add' || userData.value.password) {
    if (props.mode === 'add' && !userData.value.password) {
      newErrors.password = '密码不能为空'
    } else if (userData.value.password && userData.value.password.length < 6) {
      newErrors.password = '密码不能少于6个字符'
    }
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// 提交表单
function submitForm() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 构建要保存的用户数据
    const userToSave = { ...userData.value }
    
    // 如果是编辑模式且没有修改密码，则不提交密码字段
    if (props.mode === 'edit' && !userToSave.password) {
      delete userToSave.password
    }
    
    emit('save', userToSave)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">{{ mode === 'add' ? '添加新用户' : '编辑用户' }}</h5>
        <button type="button" class="btn-close" @click="emit('close')" aria-label="关闭"></button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <!-- 用户名 -->
          <div class="form-group mb-3">
            <label for="username" class="form-label">用户名</label>
            <input 
              type="text" 
              class="form-control" 
              :class="{ 'is-invalid': errors.username }"
              id="username" 
              v-model="userData.username" 
              placeholder="输入用户名"
            >
            <div class="invalid-feedback">{{ errors.username }}</div>
          </div>
          
          <!-- 邮箱 -->
          <div class="form-group mb-3">
            <label for="email" class="form-label">邮箱</label>
            <input 
              type="email" 
              class="form-control" 
              :class="{ 'is-invalid': errors.email }"
              id="email" 
              v-model="userData.email" 
              placeholder="输入邮箱地址"
            >
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>
          
          <!-- 密码 -->
          <div class="form-group mb-3">
            <label for="password" class="form-label">
              密码
              <span v-if="mode === 'edit'" class="text-muted">(留空表示不修改)</span>
            </label>
            <input 
              type="password" 
              class="form-control" 
              :class="{ 'is-invalid': errors.password }"
              id="password" 
              v-model="userData.password" 
              :placeholder="mode === 'add' ? '输入密码' : '输入新密码或留空'"
            >
            <div class="invalid-feedback">{{ errors.password }}</div>
          </div>
          
          <!-- 角色 -->
          <div class="form-group mb-3">
            <label for="role" class="form-label">角色</label>
            <select class="form-select" id="role" v-model="userData.role_id">
              <option :value="1">普通用户</option>
              <option :value="2">管理员</option>
            </select>
          </div>
          
          <!-- 糖尿病类型 -->
          <div class="form-group mb-3">
            <label for="diabetesType" class="form-label">糖尿病类型</label>
            <select class="form-select" id="diabetesType" v-model="userData.diabetes_type">
              <option value="">未设置</option>
              <option value="1型">1型糖尿病</option>
              <option value="2型">2型糖尿病</option>
              <option value="妊娠期">妊娠期糖尿病</option>
              <option value="无">无糖尿病</option>
            </select>
          </div>
          
          <!-- 活动水平 -->
          <div class="form-group mb-3">
            <label for="activityLevel" class="form-label">活动水平</label>
            <select class="form-select" id="activityLevel" v-model="userData.activity_level">
              <option value="">未设置</option>
              <option value="低">低（久坐不动）</option>
              <option value="中">中（适度活动）</option>
              <option value="高">高（经常运动）</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="submitForm" 
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          {{ mode === 'add' ? '添加' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background-color: rgba(30, 41, 59, 0.95);
  color: white;
  width: 100%;
  max-width: 500px;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-weight: 600;
}

.btn-close {
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 11-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
  opacity: 0.5;
  border: 0;
  padding: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.75;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-control, .form-select {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
}

.form-control:focus, .form-select:focus {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
  color: white;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 