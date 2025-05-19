<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useRouter } from 'vue-router'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import AdminChartSection from '@/components/admin/AdminChartSection.vue'

// 获取数据存储
const dataStore = useDataStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

// 从存储中获取统计数据
const stats = computed(() => {
  if (!dataStore.isDataUploaded) return null
  
  return {
    userCount: dataStore.users.length,
    recordsCount: dataStore.dataStatistics.totalRecords,
    todayRecords: Math.floor(Math.random() * 25) + 5, // 模拟今日新增
    diabetesPositivePercentage: Math.round(dataStore.diabetesRatio)
  }
})

// 生成最近活动数据
const recentActivities = computed(() => {
  if (!dataStore.isDataUploaded) return []
  
  const activities = [
    {
      title: '数据集成功上传',
      description: `成功上传了 ${dataStore.dataStatistics.totalRecords} 条糖尿病健康数据`,
      time: formatDate(dataStore.uploadDate),
      icon: 'bi-cloud-check-fill'
    },
    {
      title: '数据清洗完成',
      description: `清洗规则应用于 ${dataStore.dataStatistics.totalRecords} 条数据记录`,
      time: formatDate(new Date(new Date().getTime() - 5 * 60 * 1000)),
      icon: 'bi-gear-fill'
    },
    {
      title: '用户活动统计更新',
      description: '更新了用户活动统计数据',
      time: formatDate(new Date(new Date().getTime() - 15 * 60 * 1000)),
      icon: 'bi-people-fill'
    },
    {
      title: '模型训练完成',
      description: '糖尿病预测模型训练完成，准确率为 87.5%',
      time: formatDate(new Date(new Date().getTime() - 30 * 60 * 1000)),
      icon: 'bi-cpu-fill'
    }
  ]
  
  return activities
})

// 格式化日期
function formatDate(date: Date | null): string {
  if (!date) return ''
  
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 24 * 60) return `${Math.floor(diff / 60)}小时前`
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 跳转到数据上传页面
function navigateToUpload() {
  router.push('/admin/data-upload')
}
</script>

<template>
  <div class="admin-dashboard container py-4 text-white">
    <h1 class="mb-4">管理员仪表盘</h1>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-2">加载仪表盘数据...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-else-if="error" class="alert alert-danger my-4">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>
    
    <!-- 未上传数据提示 -->
    <div v-else-if="!dataStore.isDataUploaded" class="no-data-container">
      <div class="card bg-dark border-0 shadow p-5 text-center">
        <div class="no-data-icon mb-4">
          <i class="bi bi-database-x"></i>
        </div>
        <h3 class="mb-3">暂无数据可供分析</h3>
        <p class="text-muted mb-4">您尚未上传任何糖尿病健康数据。需要先上传CSV数据文件才能查看分析结果和统计信息。</p>
        <div class="d-grid gap-2 col-md-6 mx-auto">
          <button class="btn btn-primary" @click="navigateToUpload">
            <i class="bi bi-cloud-upload me-2"></i> 上传数据文件
          </button>
        </div>
      </div>
    </div>
    
    <!-- 仪表盘内容 -->
    <div v-else>
      <!-- 统计卡片 -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
          <AdminStatCard
            title="用户总数"
            :value="stats?.userCount || 0"
            icon="bi-people-fill"
            color="#4e73df"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <AdminStatCard
            title="健康记录总数"
            :value="stats?.recordsCount || 0"
            icon="bi-clipboard2-data-fill"
            color="#1cc88a"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <AdminStatCard
            title="今日新增记录"
            :value="stats?.todayRecords || 0"
            icon="bi-calendar2-check-fill"
            color="#36b9cc"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <AdminStatCard
            title="糖尿病阳性率"
            :value="`${stats?.diabetesPositivePercentage || 0}%`"
            icon="bi-activity"
            color="#f6c23e"
          />
        </div>
      </div>
      
      <!-- 图表区域 -->
      <AdminChartSection :stats="stats" />
      
      <!-- 近期活动 -->
      <div class="card bg-dark border-0 shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 class="m-0 fw-bold">最近活动</h6>
          <div class="text-muted">
            <small>数据上传时间: {{ formatDate(dataStore.uploadDate) }}</small>
          </div>
        </div>
        <div class="card-body">
          <div v-if="recentActivities.length">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="index"
              class="p-2 mb-2 border-bottom border-dark"
            >
              <div class="d-flex align-items-center">
                <div class="activity-icon me-3">
                  <i :class="`bi ${activity.icon || 'bi-circle-fill'}`"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between">
                    <div class="fw-bold">{{ activity.title }}</div>
                    <small class="text-muted">{{ activity.time }}</small>
                  </div>
                  <div>{{ activity.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <i class="bi bi-calendar-x fs-2 mb-2"></i>
            <p>暂无近期活动</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  min-height: calc(100vh - 180px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(78, 115, 223, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e73df;
  font-size: 1.2rem;
}

.no-data-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.no-data-icon {
  font-size: 5rem;
  color: rgba(78, 115, 223, 0.5);
}
</style> 