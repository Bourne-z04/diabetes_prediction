<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="title">用户注册</h1>
      <el-form 
        ref="registerFormRef"
        :model="registerForm" 
        :rules="registerRules" 
        label-position="top" 
        class="register-form"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码"
          />
        </el-form-item>
        
        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
          />
        </el-form-item>
        
        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 年龄 -->
        <el-form-item label="年龄" prop="age">
          <el-input-number 
            v-model="registerForm.age" 
            :min="1" 
            :max="120" 
            controls-position="right"
          />
        </el-form-item>
        
        <!-- 患病类型 -->
        <el-form-item label="患病类型" prop="diseaseType">
          <el-select v-model="registerForm.diseaseType" placeholder="请选择患病类型">
            <el-option label="糖尿病" value="diabetes" />
            <el-option label="高血压" value="hypertension" />
            <el-option label="心脏病" value="heart_disease" />
            <el-option label="高血脂" value="hyperlipidemia" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <!-- 运动量 -->
        <el-form-item label="运动量" prop="exerciseLevel">
          <el-select v-model="registerForm.exerciseLevel" placeholder="请选择运动量">
            <el-option label="几乎不运动" value="none" />
            <el-option label="轻度运动（每周1-2次）" value="light" />
            <el-option label="中度运动（每周3-5次）" value="medium" />
            <el-option label="高强度运动（每周5次以上）" value="high" />
          </el-select>
        </el-form-item>
        
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="register-button" 
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

// 路由
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 注册表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  gender: 'male',
  age: 30,
  diseaseType: '',
  exerciseLevel: ''
})

// 自定义密码确认验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  diseaseType: [
    { required: true, message: '请选择患病类型', trigger: 'change' }
  ],
  exerciseLevel: [
    { required: true, message: '请选择运动量', trigger: 'change' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 准备提交数据（移除确认密码字段）
        const { confirmPassword, ...userData } = registerForm.value
        
        const result = await userStore.registerUser(userData)
        
        if (result.success) {
          ElMessage.success('注册成功')
          // 根据用户角色重定向到相应页面
          const redirectPath = userStore.isAdmin ? '/admin/dashboard' : '/user/dashboard'
          router.push(redirectPath)
        } else {
          ElMessage.error(result.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 20px 0;
}

.register-box {
  width: 500px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--primary-color);
  font-size: 28px;
}

.register-form {
  margin-top: 20px;
}

.register-button {
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

@media (max-width: 560px) {
  .register-box {
    width: 90%;
    padding: 20px;
  }
}
</style> 