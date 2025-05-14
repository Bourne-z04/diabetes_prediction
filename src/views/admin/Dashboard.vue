<template>
  <div class="admin-dashboard">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>管理控制台</h1>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </div>
      
      <!-- 数据概览卡片 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="data-card">
            <div class="data-item">
              <div class="data-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">用户总数</div>
                <div class="data-value">{{ statistics.totalUsers }}</div>
                <div class="data-change" :class="{ 'increase': statistics.userIncrease > 0 }">
                  <el-icon v-if="statistics.userIncrease >= 0"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  {{ Math.abs(statistics.userIncrease) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="data-card">
            <div class="data-item">
              <div class="data-icon active-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">活跃用户</div>
                <div class="data-value">{{ statistics.activeUsers }}</div>
                <div class="data-change" :class="{ 'increase': statistics.activeIncrease > 0 }">
                  <el-icon v-if="statistics.activeIncrease >= 0"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  {{ Math.abs(statistics.activeIncrease) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="data-card">
            <div class="data-item">
              <div class="data-icon records-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">健康记录数</div>
                <div class="data-value">{{ statistics.totalRecords }}</div>
                <div class="data-change" :class="{ 'increase': statistics.recordIncrease > 0 }">
                  <el-icon v-if="statistics.recordIncrease >= 0"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  {{ Math.abs(statistics.recordIncrease) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="data-card">
            <div class="data-item">
              <div class="data-icon feedback-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="data-info">
                <div class="data-title">反馈数量</div>
                <div class="data-value">{{ statistics.totalFeedbacks }}</div>
                <div class="data-change" :class="{ 'increase': statistics.feedbackIncrease > 0 }">
                  <el-icon v-if="statistics.feedbackIncrease >= 0"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                  {{ Math.abs(statistics.feedbackIncrease) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-area">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>用户注册趋势</span>
              </div>
            </template>
            <div ref="userChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>数据记录分布</span>
              </div>
            </template>
            <div ref="recordChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>患者类型分布</span>
              </div>
            </template>
            <div ref="diseaseChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>反馈评分分布</span>
              </div>
            </template>
            <div ref="feedbackChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 待处理事项 -->
      <el-card class="todo-card">
        <template #header>
          <div class="card-header">
            <span>待处理事项</span>
            <el-button type="primary" size="small" @click="refreshTasks">刷新</el-button>
          </div>
        </template>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane label="待回复反馈" name="feedback">
            <el-table :data="pendingFeedbacks" stripe style="width: 100%">
              <el-table-column label="日期" prop="date" width="120" />
              <el-table-column label="用户" prop="username" width="120" />
              <el-table-column label="类型" prop="type" width="120">
                <template #default="scope">
                  <el-tag :type="getFeedbackTagType(scope.row.type)">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="内容" prop="content" show-overflow-tooltip />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleReplyFeedback(scope.row)">
                    回复
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="异常数据" name="data">
            <el-table :data="abnormalData" stripe style="width: 100%">
              <el-table-column label="日期" prop="date" width="120" />
              <el-table-column label="用户" prop="username" width="120" />
              <el-table-column label="类型" prop="dataType" width="120" />
              <el-table-column label="数值" prop="value" width="100" />
              <el-table-column label="状态" prop="status" width="120">
                <template #default="scope">
                  <el-tag type="danger">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleCheckData(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleIgnoreData(scope.row)">
                    忽略
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    
    <!-- 反馈回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复用户反馈"
      width="500px"
      :before-close="handleCloseReplyDialog"
    >
      <div v-if="currentFeedback">
        <div class="feedback-preview">
          <div class="preview-item">
            <span class="preview-label">用户：</span>
            <span>{{ currentFeedback.username }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">日期：</span>
            <span>{{ currentFeedback.date }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">类型：</span>
            <el-tag :type="getFeedbackTagType(currentFeedback.type)" size="small">
              {{ currentFeedback.type }}
            </el-tag>
          </div>
          <div class="preview-item content-preview">
            <span class="preview-label">内容：</span>
            <span>{{ currentFeedback.content }}</span>
          </div>
        </div>
        
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容..."
          maxlength="500"
          show-word-limit
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseReplyDialog">取消</el-button>
          <el-button type="primary" @click="submitReply" :loading="submitting">
            提交回复
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import NavBar from '../../components/NavBar.vue'
import { 
  User, DataLine, Document, ChatDotRound, 
  ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

// 日期选择范围
const dateRange = ref([
  new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 图表引用
const userChartRef = ref(null)
const recordChartRef = ref(null)
const diseaseChartRef = ref(null)
const feedbackChartRef = ref(null)

// 图表实例
let userChart = null
let recordChart = null
let diseaseChart = null
let feedbackChart = null

// 统计数据
const statistics = reactive({
  totalUsers: 256,
  userIncrease: 12.5,
  activeUsers: 128,
  activeIncrease: 8.2,
  totalRecords: 1024,
  recordIncrease: 15.3,
  totalFeedbacks: 64,
  feedbackIncrease: -3.1
})

// 待处理任务
const activeTab = ref('feedback')
const pendingFeedbacks = ref([
  {
    id: 1,
    date: '2023-11-15',
    username: '张三',
    type: '功能建议',
    content: '希望能增加饮食记录功能，方便追踪每日摄入的营养成分。'
  },
  {
    id: 2,
    date: '2023-11-14',
    username: '李四',
    type: '问题反馈',
    content: '在安卓手机上使用时，添加血糖记录页面偶尔会闪退。'
  },
  {
    id: 3,
    date: '2023-11-13',
    username: '王五',
    type: '使用咨询',
    content: '怎样查看历史血糖趋势图？在哪个页面可以找到？'
  }
])

const abnormalData = ref([
  {
    id: 1,
    date: '2023-11-15',
    username: '赵六',
    dataType: '血糖',
    value: '18.2 mmol/L',
    status: '异常偏高'
  },
  {
    id: 2,
    date: '2023-11-14',
    username: '钱七',
    dataType: '血压',
    value: '180/120 mmHg',
    status: '异常偏高'
  },
  {
    id: 3,
    date: '2023-11-12',
    username: '孙八',
    dataType: '血糖',
    value: '2.1 mmol/L',
    status: '异常偏低'
  }
])

// 对话框状态
const replyDialogVisible = ref(false)
const currentFeedback = ref(null)
const replyContent = ref('')
const submitting = ref(false)

// 处理日期变化
const handleDateChange = () => {
  // 实际项目中应根据日期范围重新获取数据
  initCharts()
}

// 刷新待处理任务
const refreshTasks = () => {
  ElMessage.success('任务列表已刷新')
  // 实际项目中应重新获取待处理任务数据
}

// 获取反馈类型标签样式
const getFeedbackTagType = (type) => {
  switch (type) {
    case '功能建议': return 'success'
    case '问题反馈': return 'danger'
    case '使用咨询': return 'info'
    case '界面设计': return 'warning'
    default: return 'info'
  }
}

// 处理回复反馈
const handleReplyFeedback = (feedback) => {
  currentFeedback.value = feedback
  replyContent.value = ''
  replyDialogVisible.value = true
}

// 关闭回复对话框
const handleCloseReplyDialog = () => {
  replyDialogVisible.value = false
  currentFeedback.value = null
  replyContent.value = ''
}

// 提交反馈回复
const submitReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  submitting.value = true
  
  // 模拟API调用
  setTimeout(() => {
    // 实际项目中应调用API提交回复
    
    // 从待处理列表中移除已回复的反馈
    pendingFeedbacks.value = pendingFeedbacks.value.filter(
      item => item.id !== currentFeedback.value.id
    )
    
    ElMessage.success('回复成功')
    handleCloseReplyDialog()
    submitting.value = false
  }, 500)
}

// 处理检查异常数据
const handleCheckData = (data) => {
  ElMessage.info(`查看用户 ${data.username} 的异常记录：${data.value}`)
  // 实际项目中应跳转到详情页或打开详情对话框
}

// 处理忽略异常数据
const handleIgnoreData = (data) => {
  ElMessage.success(`已忽略用户 ${data.username} 的异常记录`)
  
  // 从列表中移除
  abnormalData.value = abnormalData.value.filter(item => item.id !== data.id)
}

// 初始化用户注册趋势图表
const initUserChart = () => {
  if (!userChartRef.value) return
  
  // 销毁旧图表
  if (userChart) {
    userChart.dispose()
  }
  
  // 创建新图表
  userChart = echarts.init(userChartRef.value)
  
  // 模拟数据
  const dates = []
  const userData = []
  
  // 生成过去30天的日期
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    
    // 生成随机数据
    userData.push(Math.floor(Math.random() * 10) + 1)
  }
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 6
      }
    },
    yAxis: {
      type: 'value',
      name: '新增用户数',
      nameLocation: 'end'
    },
    series: [{
      name: '新增用户',
      type: 'bar',
      data: userData,
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
  
  userChart.setOption(option)
}

// 初始化记录分布图表
const initRecordChart = () => {
  if (!recordChartRef.value) return
  
  // 销毁旧图表
  if (recordChart) {
    recordChart.dispose()
  }
  
  // 创建新图表
  recordChart = echarts.init(recordChartRef.value)
  
  // 模拟数据
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['血糖记录', '体重记录', '血压记录', '饮食记录', '运动记录']
    },
    series: [
      {
        name: '记录类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '血糖记录' },
          { value: 735, name: '体重记录' },
          { value: 580, name: '血压记录' },
          { value: 484, name: '饮食记录' },
          { value: 300, name: '运动记录' }
        ]
      }
    ]
  }
  
  recordChart.setOption(option)
}

// 初始化患者类型分布图表
const initDiseaseChart = () => {
  if (!diseaseChartRef.value) return
  
  // 销毁旧图表
  if (diseaseChart) {
    diseaseChart.dispose()
  }
  
  // 创建新图表
  diseaseChart = echarts.init(diseaseChartRef.value)
  
  // 模拟数据
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['糖尿病', '高血压', '心脏病', '高血脂', '其他']
    },
    series: [
      {
        name: '患病类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 135, name: '糖尿病' },
          { value: 85, name: '高血压' },
          { value: 40, name: '心脏病' },
          { value: 75, name: '高血脂' },
          { value: 35, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  diseaseChart.setOption(option)
}

// 初始化反馈评分分布图表
const initFeedbackChart = () => {
  if (!feedbackChartRef.value) return
  
  // 销毁旧图表
  if (feedbackChart) {
    feedbackChart.dispose()
  }
  
  // 创建新图表
  feedbackChart = echarts.init(feedbackChartRef.value)
  
  // 模拟数据
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['1星', '2星', '3星', '4星', '5星'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '反馈数量'
      }
    ],
    series: [
      {
        name: '反馈评分',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 3, itemStyle: { color: '#F56C6C' } },
          { value: 8, itemStyle: { color: '#E6A23C' } },
          { value: 15, itemStyle: { color: '#E6A23C' } },
          { value: 22, itemStyle: { color: '#67C23A' } },
          { value: 16, itemStyle: { color: '#67C23A' } }
        ]
      }
    ]
  }
  
  feedbackChart.setOption(option)
}

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    initUserChart()
    initRecordChart()
    initDiseaseChart()
    initFeedbackChart()
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      userChart && userChart.resize()
      recordChart && recordChart.resize()
      diseaseChart && diseaseChart.resize()
      feedbackChart && feedbackChart.resize()
    })
  })
}

// 生命周期钩子
onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 1200px;
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

/* 数据概览卡片样式 */
.data-overview {
  margin-bottom: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.data-item {
  display: flex;
  align-items: center;
}

.data-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.data-icon .el-icon {
  font-size: 24px;
  color: white;
}

.user-icon {
  background-color: var(--primary-color);
}

.active-icon {
  background-color: var(--success-color);
}

.records-icon {
  background-color: var(--warning-color);
}

.feedback-icon {
  background-color: var(--info-color);
}

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 5px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 5px;
}

.data-change {
  font-size: 12px;
  color: var(--danger-color);
  display: flex;
  align-items: center;
}

.data-change.increase {
  color: var(--success-color);
}

.data-change .el-icon {
  margin-right: 3px;
}

/* 图表区域样式 */
.charts-area {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* 待处理事项样式 */
.todo-card {
  margin-bottom: 20px;
}

/* 反馈回复对话框样式 */
.feedback-preview {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.preview-item {
  margin-bottom: 10px;
}

.preview-label {
  color: var(--text-color-secondary);
  display: inline-block;
  width: 60px;
}

.content-preview {
  display: flex;
}

.content-preview .preview-label {
  width: 60px;
}

.content-preview span:last-child {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    margin-bottom: 15px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style> 