<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 检查用户是否登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

const user = authStore.user
const loading = ref(false)
const error = ref<string | null>(null)

// 健康方案列表
const healthPlans = ref([])

// 当前选中的健康方案
const selectedPlan = ref(null)

// 初始化页面
onMounted(async () => {
  loading.value = true
  try {
    // 获取健康方案列表
    const plansData = await api.healthPlan.getPlans()
    healthPlans.value = plansData
    
    // 如果有健康方案，默认选中第一个
    if (healthPlans.value.length > 0) {
      selectedPlan.value = healthPlans.value[0]
    }
  } catch (err: any) {
    error.value = err.message || '加载健康方案时发生错误'
  } finally {
    loading.value = false
  }
})

// 选择健康方案
function selectPlan(plan) {
  selectedPlan.value = plan
}

// 创建新的健康方案（模拟）
async function createNewPlan() {
  loading.value = true
  try {
    const newPlan = {
      id: Date.now().toString(),
      title: '个性化健康方案 ' + new Date().toLocaleDateString(),
      created_at: new Date().toISOString(),
      status: 'active',
      dietPlan: {
        meals: [
          { name: '早餐', description: '全麦面包两片，煮鸡蛋一个，脱脂牛奶200ml', calories: 300 },
          { name: '上午加餐', description: '苹果一个或低糖酸奶一杯', calories: 100 },
          { name: '午餐', description: '糙米饭半碗，清蒸鱼100g，清炒时蔬200g', calories: 400 },
          { name: '下午加餐', description: '坚果一小把（约15g）', calories: 100 },
          { name: '晚餐', description: '燕麦粥一碗，煮鸡胸肉100g，凉拌蔬菜200g', calories: 350 }
        ],
        recommendations: [
          '控制总热量摄入，每日保持在1200-1500千卡',
          '增加膳食纤维摄入，选择低GI食物',
          '少量多餐，定时定量',
          '限制精制糖和淀粉的摄入',
          '保持足够的蛋白质摄入'
        ]
      },
      exercisePlan: {
        activities: [
          { name: '快走', duration: '30分钟', frequency: '每天', intensity: '中等', calories: 150 },
          { name: '力量训练', duration: '20分钟', frequency: '每周3次', intensity: '中等', calories: 120 },
          { name: '伸展运动', duration: '15分钟', frequency: '每天', intensity: '低', calories: 50 }
        ],
        recommendations: [
          '运动前后测量血糖',
          '适当控制运动强度，避免过度运动',
          '运动前准备好糖果或含糖饮料，预防低血糖',
          '坚持有氧运动和力量训练相结合',
          '选择自己喜欢的运动方式，保持长期坚持'
        ]
      },
      lifestyleTips: [
        '保持规律作息，每晚保证7-8小时睡眠',
        '学习压力管理技巧，如冥想、深呼吸等',
        '定期监测血糖，记录变化',
        '戒烟限酒',
        '保持积极乐观的心态'
      ]
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 添加到列表
    healthPlans.value.unshift(newPlan)
    selectedPlan.value = newPlan
    
    return newPlan
  } catch (err: any) {
    error.value = err.message || '创建健康方案时发生错误'
    throw err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="health-plan-page">
    <div class="container py-4">
      <h1 class="mb-4">健康方案</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <template v-else>
        <div class="row">
          <!-- 左侧健康方案列表 -->
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">我的健康方案</h5>
                <button class="btn btn-sm btn-primary" @click="createNewPlan" :disabled="loading">
                  <i class="fas fa-plus me-1"></i> 新方案
                </button>
              </div>
              <div class="card-body p-0">
                <div v-if="healthPlans.length === 0" class="p-3 text-center text-muted">
                  <p>暂无健康方案</p>
                  <button class="btn btn-primary" @click="createNewPlan">
                    <i class="fas fa-plus me-1"></i> 创建第一个方案
                  </button>
                </div>
                <ul v-else class="list-group list-group-flush plan-list">
                  <li v-for="plan in healthPlans" :key="plan.id" 
                      class="list-group-item list-group-item-action d-flex align-items-center"
                      :class="{ active: selectedPlan && selectedPlan.id === plan.id }"
                      @click="selectPlan(plan)">
                    <div>
                      <h6 class="mb-1">{{ plan.title }}</h6>
                      <small>创建于 {{ new Date(plan.created_at).toLocaleDateString() }}</small>
                      <span class="badge" 
                            :class="plan.status === 'active' ? 'bg-success' : 'bg-secondary'">
                        {{ plan.status === 'active' ? '进行中' : '已完成' }}
                      </span>
                    </div>
                    <i class="fas fa-chevron-right ms-auto"></i>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- 右侧方案详情 -->
          <div class="col-md-8">
            <div v-if="!selectedPlan" class="card">
              <div class="card-body text-center py-5">
                <i class="fas fa-clipboard-list text-muted mb-3" style="font-size: 3rem;"></i>
                <h4>请选择一个健康方案</h4>
                <p class="text-muted">或者创建一个新的健康方案</p>
                <button class="btn btn-primary" @click="createNewPlan">
                  <i class="fas fa-plus me-1"></i> 创建新方案
                </button>
              </div>
            </div>
            
            <div v-else>
              <div class="card mb-4">
                <div class="card-header">
                  <h4 class="mb-0">{{ selectedPlan.title }}</h4>
                </div>
                <div class="card-body">
                  <h5><i class="fas fa-utensils me-2"></i>饮食计划</h5>
                  <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>餐次</th>
                          <th>食物建议</th>
                          <th>热量(大约)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="meal in selectedPlan.dietPlan.meals" :key="meal.name">
                          <td><strong>{{ meal.name }}</strong></td>
                          <td>{{ meal.description }}</td>
                          <td>{{ meal.calories }} 千卡</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h6>饮食建议:</h6>
                  <ul>
                    <li v-for="(rec, index) in selectedPlan.dietPlan.recommendations" :key="index">
                      {{ rec }}
                    </li>
                  </ul>
                  
                  <hr class="my-4">
                  
                  <h5><i class="fas fa-running me-2"></i>运动计划</h5>
                  <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>活动</th>
                          <th>时长</th>
                          <th>频率</th>
                          <th>强度</th>
                          <th>消耗热量(约)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="activity in selectedPlan.exercisePlan.activities" :key="activity.name">
                          <td><strong>{{ activity.name }}</strong></td>
                          <td>{{ activity.duration }}</td>
                          <td>{{ activity.frequency }}</td>
                          <td>{{ activity.intensity }}</td>
                          <td>{{ activity.calories }} 千卡</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h6>运动建议:</h6>
                  <ul>
                    <li v-for="(rec, index) in selectedPlan.exercisePlan.recommendations" :key="index">
                      {{ rec }}
                    </li>
                  </ul>
                  
                  <hr class="my-4">
                  
                  <h5><i class="fas fa-heart me-2"></i>生活方式建议</h5>
                  <ul>
                    <li v-for="(tip, index) in selectedPlan.lifestyleTips" :key="index">
                      {{ tip }}
                    </li>
                  </ul>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-primary">
                      <i class="fas fa-download me-1"></i> 导出PDF
                    </button>
                    <button class="btn btn-outline-secondary">
                      <i class="fas fa-edit me-1"></i> 调整方案
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.health-plan-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.plan-list .list-group-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.plan-list .list-group-item:hover {
  background-color: #f8f9fa;
}

.plan-list .list-group-item.active {
  background-color: rgba(78, 115, 223, 0.1);
  color: #4e73df;
  border-left: 3px solid #4e73df;
}

.table th {
  background-color: #f8f9fa;
}

.badge {
  margin-left: 0.5rem;
}
</style> 