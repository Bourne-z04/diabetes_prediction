<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 检查用户是否为管理员
if (!authStore.isAdmin) {
  router.push('/')
}

const loading = ref(false)
const error = ref<string | null>(null)

// 系统统计数据
const systemStats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  totalPredictions: 0,
  averageAccuracy: 0,
  newUsersToday: 0,
  systemStatus: 'normal' // normal, warning, critical
})

// 最近活动
const recentActivities = ref([
  { 
    id: 1, 
    type: 'user_registered', 
    username: '张三', 
    time: '2023-11-20 14:32',
    message: '新用户注册成功'
  },
  { 
    id: 2, 
    type: 'prediction_complete', 
    username: '李四', 
    time: '2023-11-20 13:45',
    message: '完成了新的健康预测'
  },
  { 
    id: 3, 
    type: 'plan_created', 
    username: '王五', 
    time: '2023-11-20 12:10',
    message: '创建了新的健康方案'
  },
  { 
    id: 4, 
    type: 'system_alert', 
    username: '系统', 
    time: '2023-11-20 10:05',
    message: '数据库备份完成'
  },
  { 
    id: 5, 
    type: 'user_feedback', 
    username: '赵六', 
    time: '2023-11-20 09:30',
    message: '提交了用户反馈'
  }
])

// 系统健康数据
const systemHealth = reactive({
  cpu: 35,
  memory: 42,
  disk: 68,
  prediction_service: 'online',
  database: 'online',
  auth_service: 'online'
})

// 加载数据
onMounted(async () => {
  loading.value = true
  
  try {
    await loadSystemStats()
    await loadSystemHealth()
  } catch (err: any) {
    error.value = err.message || '加载系统数据失败'
  } finally {
    loading.value = false
  }
})

// 加载系统统计数据的模拟函数
async function loadSystemStats() {
  // 模拟API调用
  return new Promise<void>(resolve => {
    setTimeout(() => {
      // 模拟数据
      systemStats.totalUsers = 150
      systemStats.activeUsers = 78
      systemStats.totalPredictions = 4256
      systemStats.averageAccuracy = 92.7
      systemStats.newUsersToday = 5
      systemStats.systemStatus = 'normal'
      
      resolve()
    }, 800)
  })
}

// 加载系统健康数据的模拟函数
async function loadSystemHealth() {
  // 模拟API调用
  return new Promise<void>(resolve => {
    setTimeout(() => {
      // 数据已在reactive对象中定义
      resolve()
    }, 600)
  })
}

// 重启服务的模拟函数
function restartService(service: string) {
  alert(`模拟重启服务: ${service}`)
}
</script>

<template>
  <div class="admin-dashboard">
    <div class="container py-4">
      <h1 class="mb-4">管理员仪表盘</h1>
      
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
        <!-- 系统概况卡片 -->
        <div class="row mb-4">
          <!-- 用户数量 -->
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      总用户数
                    </div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">{{ systemStats.totalUsers }}</div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-users fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 活跃用户 -->
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                      活跃用户
                    </div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">{{ systemStats.activeUsers }}</div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-user-check fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 总预测数 -->
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                      总预测数
                    </div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">{{ systemStats.totalPredictions }}</div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-chart-line fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 平均准确度 -->
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      预测准确度
                    </div>
                    <div class="row no-gutters align-items-center">
                      <div class="col-auto">
                        <div class="h5 mb-0 mr-3 font-weight-bold text-gray-800">{{ systemStats.averageAccuracy }}%</div>
                      </div>
                      <div class="col">
                        <div class="progress progress-sm mr-2">
                          <div class="progress-bar bg-warning" role="progressbar"
                            :style="`width: ${systemStats.averageAccuracy}%`" aria-valuenow="50" aria-valuemin="0"
                            aria-valuemax="100"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-clipboard-check fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容行 -->
        <div class="row">
          <!-- 系统健康状态 -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow mb-4">
              <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 class="m-0 font-weight-bold text-primary">系统健康状态</h6>
                <div class="dropdown no-arrow">
                  <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                    data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                    aria-labelledby="dropdownMenuLink">
                    <div class="dropdown-header">操作:</div>
                    <a class="dropdown-item" href="#" @click.prevent="restartService('all')">全部重启</a>
                    <a class="dropdown-item" href="#" @click.prevent="loadSystemHealth">刷新状态</a>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h4 class="small font-weight-bold">CPU 使用率 <span class="float-end">{{ systemHealth.cpu }}%</span></h4>
                <div class="progress mb-4">
                  <div class="progress-bar" role="progressbar" :style="`width: ${systemHealth.cpu}%`"
                    :class="{
                      'bg-danger': systemHealth.cpu >= 80,
                      'bg-warning': systemHealth.cpu >= 60 && systemHealth.cpu < 80,
                      'bg-info': systemHealth.cpu < 60
                    }"></div>
                </div>
                <h4 class="small font-weight-bold">内存使用率 <span class="float-end">{{ systemHealth.memory }}%</span></h4>
                <div class="progress mb-4">
                  <div class="progress-bar" role="progressbar" :style="`width: ${systemHealth.memory}%`"
                    :class="{
                      'bg-danger': systemHealth.memory >= 80,
                      'bg-warning': systemHealth.memory >= 60 && systemHealth.memory < 80,
                      'bg-info': systemHealth.memory < 60
                    }"></div>
                </div>
                <h4 class="small font-weight-bold">磁盘使用率 <span class="float-end">{{ systemHealth.disk }}%</span></h4>
                <div class="progress mb-4">
                  <div class="progress-bar" role="progressbar" :style="`width: ${systemHealth.disk}%`"
                    :class="{
                      'bg-danger': systemHealth.disk >= 80,
                      'bg-warning': systemHealth.disk >= 60 && systemHealth.disk < 80,
                      'bg-info': systemHealth.disk < 60
                    }"></div>
                </div>
                
                <div class="mt-4">
                  <h6 class="font-weight-bold">服务状态</h6>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <span>预测服务</span>
                    <span class="badge" :class="{
                      'bg-success': systemHealth.prediction_service === 'online',
                      'bg-danger': systemHealth.prediction_service === 'offline',
                      'bg-warning': systemHealth.prediction_service === 'degraded'
                    }">{{ systemHealth.prediction_service }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span>数据库服务</span>
                    <span class="badge" :class="{
                      'bg-success': systemHealth.database === 'online',
                      'bg-danger': systemHealth.database === 'offline',
                      'bg-warning': systemHealth.database === 'degraded'
                    }">{{ systemHealth.database }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <span>认证服务</span>
                    <span class="badge" :class="{
                      'bg-success': systemHealth.auth_service === 'online',
                      'bg-danger': systemHealth.auth_service === 'offline',
                      'bg-warning': systemHealth.auth_service === 'degraded'
                    }">{{ systemHealth.auth_service }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow mb-4">
              <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">最近活动</h6>
              </div>
              <div class="card-body">
                <div class="timeline-container">
                  <div v-for="activity in recentActivities" :key="activity.id" class="timeline-item">
                    <div class="timeline-marker" :class="{
                      'bg-primary': activity.type === 'user_registered',
                      'bg-success': activity.type === 'prediction_complete',
                      'bg-info': activity.type === 'plan_created',
                      'bg-warning': activity.type === 'system_alert',
                      'bg-secondary': activity.type === 'user_feedback'
                    }"></div>
                    <div class="timeline-content">
                      <h6 class="mb-1">{{ activity.username }}</h6>
                      <p class="mb-0">{{ activity.message }}</p>
                      <small class="text-muted">{{ activity.time }}</small>
                    </div>
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
.admin-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.border-left-danger {
  border-left: 0.25rem solid #e74a3b !important;
}

.timeline-container {
  position: relative;
  padding-left: 1.5rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.timeline-content {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e3e6f0;
}

.timeline-item:last-child .timeline-content {
  border-bottom: none;
  padding-bottom: 0;
}
</style> 