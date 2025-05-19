<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const healthRecords = ref<any[]>([])

// 检查用户是否已登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

// 当前选择的记录ID
const selectedRecordId = ref<number | null>(null)
// 当前查看的记录详情
const currentRecordDetails = ref<any>(null)
const recordLoading = ref(false)

// 选择记录查看详情
async function selectRecord(recordId: number) {
  if (selectedRecordId.value === recordId && currentRecordDetails.value) {
    // 如果已经选择，则取消选择
    selectedRecordId.value = null
    currentRecordDetails.value = null
    return
  }
  
  selectedRecordId.value = recordId
  recordLoading.value = true
  
  try {
    const result = await api.user.getPredictionById(recordId)
    currentRecordDetails.value = result
  } catch (err: any) {
    error.value = err.message || '加载记录详情失败'
  } finally {
    recordLoading.value = false
  }
}

// 导出特定记录
async function exportRecord(recordId: number) {
  try {
    const exportData = await api.user.exportPredictionById(recordId)
    
    // 创建一个下载链接
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `diabetes_prediction_${recordId}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message || '导出记录失败'
  }
}

// 风险等级计算
function getRiskLevel(probability: number) {
  if (probability < 0.3) return { level: '低风险', color: 'success' }
  if (probability < 0.7) return { level: '中等风险', color: 'warning' }
  return { level: '高风险', color: 'danger' }
}

onMounted(async () => {
  loading.value = true
  try {
    // 从API获取历史记录
    healthRecords.value = await api.user.getHealthRecords()
  } catch (err: any) {
    error.value = err.message || '加载历史记录失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="history-page">
    <div class="container py-4">
      <h1 class="mb-4">历史健康记录</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else>
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">健康测量历史记录</h5>
          </div>
          
          <div class="card-body">
            <div v-if="healthRecords.length === 0" class="text-center py-5">
              <i class="bi bi-clipboard-x fs-1 text-muted mb-3"></i>
              <p class="text-muted">暂无历史记录数据</p>
              <router-link to="/user/dashboard" class="btn btn-primary mt-3">
                <i class="bi bi-plus-circle me-2"></i>添加健康数据
              </router-link>
            </div>
            
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>年龄</th>
                      <th>BMI</th>
                      <th>胰岛素</th>
                      <th>皮肤厚度</th>
                      <th>血糖</th>
                      <th>糖尿病风险</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in healthRecords" :key="record.id" 
                        :class="{ 'table-active': selectedRecordId === record.id }">
                      <td>{{ new Date(record.created_at).toLocaleString() }}</td>
                      <td>{{ record.health_info.age }}</td>
                      <td>{{ record.health_info.bmi }}</td>
                      <td>{{ record.health_info.insulin }}</td>
                      <td>{{ record.health_info.skin_thickness }}</td>
                      <td>{{ record.health_info.glucose }}</td>
                      <td>
                        <span :class="`badge bg-${getRiskLevel(record.probability).color}`">
                          {{ (record.probability * 100).toFixed(1) }}%
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" 
                                  @click="selectRecord(record.id)"
                                  :disabled="recordLoading">
                            <i v-if="recordLoading && selectedRecordId === record.id" 
                               class="spinner-border spinner-border-sm"></i>
                            <i v-else class="bi bi-eye"></i>
                          </button>
                          <button class="btn btn-outline-success" 
                                  @click="exportRecord(record.id)">
                            <i class="bi bi-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 当前选中记录的详情 -->
              <div v-if="currentRecordDetails" class="record-details mt-4">
                <h4 class="mb-3">详细分析</h4>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="card mb-3">
                      <div class="card-header">
                        <h5 class="mb-0">健康数据</h5>
                      </div>
                      <div class="card-body">
                        <table class="table table-sm">
                          <tbody>
                            <tr>
                              <th>测量日期:</th>
                              <td>{{ new Date(currentRecordDetails.health_info.created_at).toLocaleString() }}</td>
                            </tr>
                            <tr>
                              <th>年龄:</th>
                              <td>{{ currentRecordDetails.health_info.age }}</td>
                            </tr>
                            <tr>
                              <th>BMI:</th>
                              <td>{{ currentRecordDetails.health_info.bmi }}</td>
                            </tr>
                            <tr>
                              <th>胰岛素 (μU/ml):</th>
                              <td>{{ currentRecordDetails.health_info.insulin }}</td>
                            </tr>
                            <tr>
                              <th>皮肤厚度 (mm):</th>
                              <td>{{ currentRecordDetails.health_info.skin_thickness }}</td>
                            </tr>
                            <tr>
                              <th>血糖 (mg/dL):</th>
                              <td>{{ currentRecordDetails.health_info.glucose }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-header">
                        <h5 class="mb-0">风险评估</h5>
                      </div>
                      <div class="card-body">
                        <div class="text-center mb-4">
                          <div class="risk-meter">
                            <div class="risk-indicator" 
                                 :style="{ transform: `rotate(${currentRecordDetails.probability * 180}deg)` }"></div>
                            <div class="risk-value">{{ (currentRecordDetails.probability * 100).toFixed(1) }}%</div>
                          </div>
                          
                          <h4 class="mt-3">
                            <span :class="`badge bg-${getRiskLevel(currentRecordDetails.probability).color}`">
                              {{ getRiskLevel(currentRecordDetails.probability).level }}
                            </span>
                          </h4>
                        </div>
                        
                        <h6 class="mb-2">模型分析详情:</h6>
                        <div class="table-responsive">
                          <table class="table table-sm">
                            <thead>
                              <tr>
                                <th>模型</th>
                                <th>风险概率</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(result, model) in currentRecordDetails.model_details" :key="model">
                                <td>{{ model }}</td>
                                <td>{{ (result.probability * 100).toFixed(1) }}%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  background-color: transparent;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  background-color: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

/* 风险评估样式 */
.risk-meter {
  position: relative;
  width: 200px;
  height: 100px;
  margin: 0 auto;
  background: conic-gradient(
    from 180deg,
    #28a745 0deg,
    #ffc107 90deg,
    #dc3545 180deg
  );
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  overflow: hidden;
}

.risk-meter::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 0;
  background-color: rgba(30, 41, 59, 0.85);
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
}

.risk-indicator {
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 2px;
  height: 60px;
  background-color: #fff;
  transform-origin: bottom center;
  z-index: 10;
  transition: transform 0.8s ease-out;
}

.risk-value {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 10;
}
</style> 