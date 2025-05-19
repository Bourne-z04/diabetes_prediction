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

// 健康报告生成状态
const isGeneratingReport = ref(false)
const healthReport = ref<string | null>(null)

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

// 生成健康报告
function generateHealthReport() {
  if (isGeneratingReport.value) return
  
  isGeneratingReport.value = true
  healthReport.value = null
  
  // 模拟10秒的生成时间
  setTimeout(() => {
    const data = dataStore.dataStatistics
    
    // 根据当前数据生成健康报告
    healthReport.value = `# 糖尿病数据健康报告

## 总体情况
- 总记录数: ${data.totalRecords}
- 糖尿病阳性病例: ${data.diabeticCount} (${Math.round(dataStore.diabetesRatio)}%)
- 糖尿病阴性病例: ${data.nonDiabeticCount} (${Math.round(100 - dataStore.diabetesRatio)}%)

## 主要健康指标分析
- 平均年龄: ${data.averageAge}岁
- 平均体重指数(BMI): ${data.averageBMI}
- 平均血糖水平: ${data.averageGlucose} mg/dl

## 风险分析
糖尿病风险处于${dataStore.diabetesRatio > 30 ? '较高' : '中等'}水平。主要风险因素包括:
- ${data.averageBMI > 25 ? '体重指数(BMI)偏高' : 'BMI指标正常'}
- ${data.averageGlucose > 110 ? '血糖水平偏高' : '血糖水平正常'}

## 预防建议
1. 保持健康的生活方式，定期进行体育锻炼
2. 控制饮食，减少高糖高脂食物的摄入
3. 定期监测血糖水平
4. 对于高风险人群，建议增加检查频率

## 异常数据分析
数据中存在一些异常值可能需要进一步核实，如极低的血压值和极高的胰岛素水平。

## 建议后续行动
1. 针对高风险人群开展专项健康教育
2. 完善数据采集流程，减少异常值
3. 加强随访管理，提高患者依从性`
    
    isGeneratingReport.value = false
  }, 10000)
}

// 下载健康报告为Markdown文件
function downloadHealthReport() {
  if (!healthReport.value) return
  
  const blob = new Blob([healthReport.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `糖尿病健康报告_${dateStr}.md`
  document.body.appendChild(a)
  a.click()
  
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// Markdown渲染函数
function renderMarkdown(markdown: string): string {
  // 简单的Markdown解析和转换为HTML
  if (!markdown) return '';

  // 替换标题
  let html = markdown.replace(/^# (.*?)$/gm, '<h1 class="markdown-h1">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="markdown-h3">$1</h3>');
  
  // 替换列表
  html = html.replace(/^- (.*?)$/gm, '<li class="markdown-list-item">$1</li>');
  html = html.replace(/(<li class="markdown-list-item">.*?<\/li>)\n(<li class="markdown-list-item">)/g, '$1$2');
  html = html.replace(/(<li class="markdown-list-item">.*?<\/li>)\n(?!<li)/g, '<ul class="markdown-list">$1</ul>');
  html = html.replace(/^(\d+)\. (.*?)$/gm, '<li class="markdown-num-list-item">$2</li>');
  html = html.replace(/(<li class="markdown-num-list-item">.*?<\/li>)\n(<li class="markdown-num-list-item">)/g, '$1$2');
  html = html.replace(/(<li class="markdown-num-list-item">.*?<\/li>)\n(?!<li class="markdown-num-list-item">)/g, '<ol class="markdown-num-list">$1</ol>');

  // 替换粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 替换换行
  html = html.replace(/\n/g, '<br>');
  
  return html;
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
      
      <!-- 健康报告生成器 -->
      <div class="card ai-report-card bg-dark border-0 shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 class="m-0 fw-bold">
            <i class="bi bi-robot me-2"></i>
            健康报告生成
          </h6>
          <div>
            <button 
              v-if="healthReport" 
              class="btn btn-sm btn-outline-light ms-2" 
              @click="downloadHealthReport"
              title="下载Markdown格式的健康报告"
            >
              <i class="bi bi-download me-1"></i>
              下载报告(MD)
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <p class="m-0">根据当前糖尿病数据集使用AI生成综合健康报告和建议</p>
            <button 
              class="btn btn-primary" 
              @click="generateHealthReport" 
              :disabled="isGeneratingReport"
            >
              <i class="bi bi-robot me-2"></i>
              <span v-if="isGeneratingReport">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                正在生成报告...
              </span>
              <span v-else>根据AI生成健康报告</span>
            </button>
          </div>
          
          <!-- AI正在处理中 -->
          <div v-if="isGeneratingReport" class="ai-typing-container text-center my-5">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p class="text-muted mt-2">AI正在分析数据并生成报告，这可能需要几秒钟...</p>
          </div>
          
          <!-- 健康报告显示区域 -->
          <div v-else-if="healthReport" class="health-report mt-4">
            <div class="report-header">
              <i class="bi bi-file-earmark-medical me-2"></i>
              AI生成的健康报告
              <span class="report-time">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="report-content">
              <div class="markdown-preview" v-html="renderMarkdown(healthReport)"></div>
            </div>
          </div>
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

/* 健康报告区域样式 */
.ai-report-card {
  background-color: rgba(30, 41, 59, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4) !important;
}

.health-report {
  height: 600px;
  overflow-y: auto;
  border-radius: 10px;
  background-color: rgba(22, 31, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.report-header {
  padding: 15px;
  background-color: rgba(78, 115, 223, 0.3);
  color: white;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
}

.report-time {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: normal;
  opacity: 0.8;
}

.report-content {
  padding: 20px;
  color: #fff;
}

.markdown-preview {
  line-height: 1.6;
}

/* Markdown样式 */
.markdown-h1, .markdown-h2, .markdown-h3 {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-h1 {
  font-size: 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.3em;
  color: #4e73df;
}

.markdown-h2 {
  font-size: 1.3rem;
  margin-top: 1.5em;
  color: #36b9cc;
}

.markdown-h3 {
  font-size: 1.1rem;
  color: #1cc88a;
}

.markdown-list, .markdown-num-list {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.markdown-list-item, .markdown-num-list-item {
  margin-bottom: 0.5em;
}

/* 打字指示器 */
.ai-typing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.typing-indicator {
  display: flex;
  padding: 12px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: fit-content;
}

.typing-indicator span {
  height: 10px;
  width: 10px;
  background-color: #4e73df;
  display: block;
  border-radius: 50%;
  margin: 0 3px;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: pulse 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation: pulse 1s infinite 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation: pulse 1s infinite 0.4s;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
}
</style> 