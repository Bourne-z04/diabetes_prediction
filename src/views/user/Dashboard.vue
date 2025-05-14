<template>
  <div class="dashboard">
    <NavBar />
    
    <div class="container">
      <h1 class="welcome">欢迎回来，{{ username }}</h1>
      
      <div class="dashboard-stats" v-loading="loading">
        <el-row :gutter="20">
          <!-- 健康概览卡片 -->
          <el-col :xs="24" :sm="12" :md="8">
            <div class="stats-card animate-fade-in">
              <h3 class="card-title">健康概览</h3>
              
              <div class="health-status">
                <div class="health-item">
                  <span class="item-label">最新血糖值：</span>
                  <span class="item-value" :class="healthStore.glucoseStatus.status">{{ latestGlucose || '暂无数据' }}</span>
                  <span v-if="latestGlucose" class="item-unit">mmol/L</span>
                </div>
                
                <div class="health-item">
                  <span class="item-label">体重：</span>
                  <span class="item-value">{{ latestWeight || '暂无数据' }}</span>
                  <span v-if="latestWeight" class="item-unit">kg</span>
                </div>
                
                <div class="health-item">
                  <span class="item-label">健康状况：</span>
                  <el-tag :type="healthStatusType">{{ healthStatus }}</el-tag>
                </div>
                
                <div class="health-item">
                  <span class="item-label">健康评分：</span>
                  <el-progress 
                    :percentage="healthScore" 
                    :color="scoreColor"
                    :status="healthScore >= 80 ? 'success' : healthScore >= 60 ? '' : 'exception'"
                  />
                </div>
              </div>
              
              <div class="card-actions">
                <el-button type="primary" @click="goToHealthRecords">查看记录</el-button>
                <el-button type="success" @click="goToAnalysis">健康分析</el-button>
              </div>
            </div>
          </el-col>
          
          <!-- 今日建议卡片 -->
          <el-col :xs="24" :sm="12" :md="8">
            <div class="stats-card animate-fade-in" style="animation-delay: 0.1s">
              <h3 class="card-title">健康建议</h3>
              
              <ul class="recommendations" v-if="healthAdvice.length > 0">
                <li v-for="(item, index) in healthAdvice" :key="index" 
                  class="animate-slide-in"
                  :style="{ animationDelay: `${0.2 + index * 0.1}s` }">
                  <el-icon><Check /></el-icon>
                  <span>{{ item }}</span>
                </li>
              </ul>
              
              <div v-else class="empty-data">
                <el-empty description="暂无健康建议" :image-size="100" />
              </div>
              
              <el-button type="success" @click="goToHealthGuide">查看健康指南</el-button>
            </div>
          </el-col>
          
          <!-- 活动通知卡片 -->
          <el-col :xs="24" :sm="12" :md="8">
            <div class="stats-card animate-fade-in" style="animation-delay: 0.2s">
              <h3 class="card-title">活动通知</h3>
              
              <div class="notifications">
                <div v-if="notifications.length > 0">
                  <div v-for="(notification, index) in notifications" :key="index" 
                       class="notification-item animate-slide-in"
                       :style="{ animationDelay: `${0.3 + index * 0.1}s` }">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-content">{{ notification.content }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                </div>
                <div v-else class="empty-data">
                  <el-empty description="暂无通知" :image-size="100" />
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 快速操作区域 -->
      <div class="quick-actions">
        <h2>快速操作</h2>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="(action, index) in quickActions" :key="action.route">
            <div class="action-card animate-scale-in" 
                 :style="{ animationDelay: `${0.1 * index}s` }"
                 @click="router.push(action.route)">
              <el-icon :size="32"><component :is="action.icon" /></el-icon>
              <div class="action-name">{{ action.name }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { useHealthStore } from '../../stores/health'
import NavBar from '../../components/NavBar.vue'
import { Check, Plus, Edit, DataLine, Setting, Notification } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 健康数据存储
const healthStore = useHealthStore()

// 加载状态
const loading = ref(false)

// 用户名
const username = computed(() => userStore.username)

// 健康状态指标
const healthScore = computed(() => healthStore.healthScore)
const healthAdvice = computed(() => healthStore.healthAdvice.slice(0, 5)) // 取前5条建议

// 血糖与体重
const latestGlucose = computed(() => {
  if (healthStore.healthRecords.length === 0) return null
  const record = healthStore.healthRecords[0]
  return record.glucose
})

const latestWeight = computed(() => {
  if (healthStore.healthRecords.length === 0) return null
  const record = healthStore.healthRecords[0]
  return record.weight
})

// 健康状态
const healthStatus = computed(() => {
  if (healthStore.glucoseStatus.status === 'unknown') return '未知'
  
  switch (healthStore.glucoseStatus.status) {
    case 'normal': return '正常';
    case 'low': return '低血糖';
    case 'high': return '高血糖';
    case 'danger': return '高血糖(严重)';
    case 'borderline': return '血糖偏高';
    default: return '未知';
  }
})

// 健康状态标签类型
const healthStatusType = computed(() => {
  const status = healthStore.glucoseStatus.status
  if (status === 'normal') return 'success'
  if (status === 'borderline') return 'info'
  if (status === 'low' || status === 'high') return 'warning'
  if (status === 'danger') return 'danger'
  return 'info'
})

// 通知（模拟数据，实际应从服务端获取）
const notifications = ref([
  {
    title: '健康讲座',
    content: '本周六上午10点将举办"糖尿病患者的日常饮食管理"讲座',
    time: '2023-11-15'
  },
  {
    title: '系统升级',
    content: '系统将于本周日凌晨2点-4点进行维护升级，请提前保存数据',
    time: '2023-11-14'
  }
])

// 快速操作
const quickActions = [
  { name: '添加记录', icon: 'Plus', route: '/user/health-records' },
  { name: '我的资料', icon: 'Edit', route: '/user/myinfo' },
  { name: '健康分析', icon: 'DataLine', route: '/user/analysis' },
  { name: '健康指南', icon: 'Setting', route: '/user/health-guide' },
  { name: '反馈建议', icon: 'Notification', route: '/user/feedback' }
]

// 跳转到健康记录页面
const goToHealthRecords = () => {
  router.push('/user/health-records')
}

// 跳转到健康指南页面
const goToHealthGuide = () => {
  router.push('/user/health-guide')
}

// 跳转到健康分析页面
const goToAnalysis = () => {
  router.push('/user/analysis')
}

// 获取健康数据
const fetchHealthData = async () => {
  loading.value = true
  
  try {
    await healthStore.fetchHealthRecords()
  } catch (error) {
    console.error('获取健康数据失败:', error)
    ElMessage.error('获取健康数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchHealthData()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome {
  margin: 20px 0;
  font-size: 24px;
  color: var(--text-color);
  animation: fadeIn 0.5s ease-in-out;
}

.dashboard-stats {
  margin-bottom: 30px;
}

.stats-card {
  background-color: var(--bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 18px;
  color: var(--text-color);
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color-light);
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.health-status {
  margin-bottom: 20px;
}

.health-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.item-label {
  color: var(--text-color-secondary);
  margin-right: 8px;
  width: 100px;
}

.item-value {
  font-weight: bold;
  color: var(--text-color);
}

.item-value.normal {
  color: var(--success-color);
}

.item-value.low, .item-value.high, .item-value.borderline {
  color: var(--warning-color);
}

.item-value.danger {
  color: var(--danger-color);
}

.item-unit {
  color: var(--text-color-secondary);
  margin-left: 4px;
  font-size: 0.9em;
}

.recommendations {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.recommendations li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
  background-color: var(--bg-color-secondary);
}

.recommendations li .el-icon {
  color: var(--success-color);
  margin-right: 8px;
  margin-top: 2px;
}

.notifications {
  margin-bottom: 20px;
}

.notification-item {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 6px;
  background-color: var(--bg-color-secondary);
}

.notification-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--text-color);
}

.notification-content {
  color: var(--text-color-secondary);
  margin-bottom: 8px;
  font-size: 0.9em;
}

.notification-time {
  font-size: 0.8em;
  color: var(--text-color-disabled);
  text-align: right;
}

.quick-actions {
  margin-top: 30px;
}

.quick-actions h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: var(--text-color);
}

.action-card {
  background-color: var(--bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-card:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: var(--primary-color);
  color: white;
}

.action-name {
  margin-top: 10px;
  font-size: 14px;
}

.empty-data {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 20px 0;
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

.animate-slide-in {
  animation: slideIn 0.5s ease-in-out forwards;
  opacity: 0;
  transform: translateX(-20px);
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-in-out forwards;
  opacity: 0;
  transform: scale(0.9);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateX(-20px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.9);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .health-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-label {
    width: auto;
    margin-bottom: 4px;
  }
}
</style> 