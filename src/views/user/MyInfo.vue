<template>
  <div class="myinfo-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>我的个人信息</h1>
        <el-button type="primary" size="small" @click="enableEdit" v-if="!isEditing">
          编辑信息
        </el-button>
        <div v-else>
          <el-button type="success" size="small" @click="saveUserInfo">保存</el-button>
          <el-button size="small" @click="cancelEdit">取消</el-button>
        </div>
      </div>
      
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        
        <el-form :model="userForm" label-width="100px" :disabled="!isEditing">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input v-model="userForm.username" disabled />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="性别">
                <el-radio-group v-model="userForm.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="年龄">
                <el-input-number v-model="userForm.age" :min="1" :max="120" controls-position="right" />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="患病类型">
                <el-select v-model="userForm.diseaseType" placeholder="请选择患病类型">
                  <el-option label="糖尿病" value="diabetes" />
                  <el-option label="高血压" value="hypertension" />
                  <el-option label="心脏病" value="heart_disease" />
                  <el-option label="高血脂" value="hyperlipidemia" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="运动量">
                <el-select v-model="userForm.exerciseLevel" placeholder="请选择运动量">
                  <el-option label="几乎不运动" value="none" />
                  <el-option label="轻度运动（每周1-2次）" value="light" />
                  <el-option label="中度运动（每周3-5次）" value="medium" />
                  <el-option label="高强度运动（每周5次以上）" value="high" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="24">
              <el-form-item label="过敏原">
                <el-select
                  v-model="userForm.allergies"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请输入过敏原（可多选）"
                >
                  <el-option label="花粉" value="pollen" />
                  <el-option label="海鲜" value="seafood" />
                  <el-option label="牛奶" value="milk" />
                  <el-option label="花生" value="peanut" />
                  <el-option label="小麦" value="wheat" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>健康偏好设置</span>
          </div>
        </template>
        
        <el-form :model="userForm.preferences" label-width="100px" :disabled="!isEditing">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="中医体质">
                <el-select v-model="userForm.preferences.tcmType" placeholder="请选择中医体质">
                  <el-option label="平和质" value="balanced" />
                  <el-option label="气虚质" value="qi_deficiency" />
                  <el-option label="阳虚质" value="yang_deficiency" />
                  <el-option label="阴虚质" value="yin_deficiency" />
                  <el-option label="痰湿质" value="phlegm_dampness" />
                  <el-option label="湿热质" value="damp_heat" />
                  <el-option label="血瘀质" value="blood_stasis" />
                  <el-option label="气郁质" value="qi_stagnation" />
                  <el-option label="特禀质" value="special" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="饮食偏好">
                <el-select v-model="userForm.preferences.dietPreference" placeholder="请选择饮食偏好">
                  <el-option label="无特殊偏好" value="none" />
                  <el-option label="低糖饮食" value="low_sugar" />
                  <el-option label="低脂饮食" value="low_fat" />
                  <el-option label="低盐饮食" value="low_salt" />
                  <el-option label="素食" value="vegetarian" />
                  <el-option label="高蛋白" value="high_protein" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="24">
              <el-form-item label="健康目标">
                <el-input 
                  v-model="userForm.preferences.healthGoal" 
                  type="textarea" 
                  :rows="2" 
                  placeholder="请描述您的健康目标，例如：在三个月内降低血糖到正常范围" 
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { updateUserInfo } from '../../services/user'
import NavBar from '../../components/NavBar.vue'

// 用户存储
const userStore = useUserStore()

// 编辑状态
const isEditing = ref(false)

// 用户表单数据
const userForm = reactive({
  username: '',
  gender: 'male',
  age: 30,
  diseaseType: '',
  exerciseLevel: '',
  allergies: [],
  preferences: {
    tcmType: '', // 中医体质
    dietPreference: '', // 饮食偏好
    healthGoal: '' // 健康目标
  }
})

// 原始用户数据（用于取消编辑）
let originalUserData = {}

// 从store获取用户信息
const fetchUserInfo = () => {
  const { userInfo } = userStore
  
  if (userInfo) {
    // 基本信息
    userForm.username = userInfo.username || ''
    userForm.gender = userInfo.gender || 'male'
    userForm.age = userInfo.age || 30
    userForm.diseaseType = userInfo.diseaseType || ''
    userForm.exerciseLevel = userInfo.exerciseLevel || ''
    userForm.allergies = userInfo.allergies || []
    
    // 偏好设置
    userForm.preferences = {
      tcmType: userInfo.preferences?.tcmType || '',
      dietPreference: userInfo.preferences?.dietPreference || '',
      healthGoal: userInfo.preferences?.healthGoal || ''
    }
    
    // 保存原始数据的深拷贝
    originalUserData = JSON.parse(JSON.stringify(userForm))
  }
}

// 启用编辑
const enableEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据
  Object.assign(userForm, JSON.parse(JSON.stringify(originalUserData)))
  isEditing.value = false
}

// 保存用户信息
const saveUserInfo = async () => {
  try {
    const response = await updateUserInfo(userForm)
    
    if (response.data) {
      ElMessage.success('个人信息更新成功')
      
      // 更新store中的用户信息
      userStore.updateUserData(userForm)
      
      // 更新原始数据
      originalUserData = JSON.parse(JSON.stringify(userForm))
      
      // 退出编辑模式
      isEditing.value = false
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 生命周期钩子
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.myinfo-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    margin-bottom: 10px;
  }
}
</style> 