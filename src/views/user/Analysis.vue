<template>
  <div class="analysis-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>健康分析</h1>
        <div class="header-actions">
          <el-select v-model="selectedPeriod" placeholder="选择时间范围" @change="handlePeriodChange">
            <el-option label="最近一周" value="week"></el-option>
            <el-option label="最近一月" value="month"></el-option>
            <el-option label="最近三月" value="quarter"></el-option>
            <el-option label="最近一年" value="year"></el-option>
          </el-select>
          <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>
      </div>
      
      <!-- 健康状态概览 -->
      <el-row :gutter="20" class="status-cards">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="status-card">
            <div class="status-icon" :class="{'warning': glucoseStatus !== 'normal'}">
              <el-icon><Sugar /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-title">血糖状态</div>
              <div class="status-value">
                <span>{{ glucoseAvg }}</span>
                <span class="unit">mmol/L</span>
              </div>
              <div class="status-description" :class="glucoseStatus">
                {{ glucoseDescription }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="status-card">
            <div class="status-icon" :class="{'warning': weightStatus !== 'normal'}">
              <el-icon><Scale /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-title">体重状态</div>
              <div class="status-value">
                <span>{{ weightAvg }}</span>
                <span class="unit">kg</span>
              </div>
              <div class="status-description" :class="weightStatus">
                {{ weightDescription }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="status-card">
            <div class="status-icon" :class="{'warning': bpStatus !== 'normal'}">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-title">血压状态</div>
              <div class="status-value">
                <span>{{ bpAvg }}</span>
                <span class="unit">mmHg</span>
              </div>
              <div class="status-description" :class="bpStatus">
                {{ bpDescription }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="status-card">
            <div class="status-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="status-content">
              <div class="status-title">记录完整度</div>
              <div class="status-value">
                <span>{{ completeness }}</span>
                <span class="unit">%</span>
              </div>
              <div class="status-description">
                {{ completenessDescription }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 血糖趋势图表 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>血糖趋势分析</span>
            <el-switch
              v-model="showPrediction"
              active-text="显示预测"
              inactive-text="隐藏预测"
              @change="updateGlucoseChart"
            ></el-switch>
          </div>
        </template>
        <div ref="glucoseChartRef" class="chart-container" v-loading="loading.glucose"></div>
      </el-card>
      
      <!-- 健康指标对比 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>健康指标多维分析</span>
            <el-radio-group v-model="comparisonType" size="small" @change="updateComparisonChart">
              <el-radio-button label="radar">雷达图</el-radio-button>
              <el-radio-button label="parallel">平行坐标图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="comparisonChartRef" class="chart-container" v-loading="loading.comparison"></div>
      </el-card>
      
      <!-- 健康预警信息 -->
      <el-card class="alert-card" v-if="healthAlerts.length > 0">
        <template #header>
          <div class="card-header">
            <span>健康预警</span>
          </div>
        </template>
        <div class="alert-list">
          <el-alert
            v-for="(alert, index) in healthAlerts"
            :key="index"
            :title="alert.title"
            :description="alert.description"
            :type="alert.type"
            :closable="false"
            show-icon
          ></el-alert>
        </div>
      </el-card>
      
      <!-- 空状态展示 -->
      <el-empty 
        v-if="showEmptyState" 
        description="暂无足够的健康数据用于分析"
        class="empty-state"
      >
        <el-button type="primary" @click="$router.push('/user/health-records')">去添加记录</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getHealthRecords } from '../../services/user'
import NavBar from '../../components/NavBar.vue'
import { Sugar, Scale, Monitor, DataAnalysis } from '@element-plus/icons-vue'

// 引用
const glucoseChartRef = ref(null)
const comparisonChartRef = ref(null)

// 图表实例
let glucoseChart = null
let comparisonChart = null

// 加载状态
const loading = reactive({
  glucose: false,
  comparison: false,
  data: false
})

// 分析周期
const selectedPeriod = ref('month')

// 显示预测
const showPrediction = ref(true)

// 对比图表类型
const comparisonType = ref('radar')

// 健康数据
const healthData = ref([])

// 显示空状态
const showEmptyState = computed(() => {
  return healthData.value.length < 3
})

// 血糖状态
const glucoseAvg = computed(() => {
  if (healthData.value.length === 0) return '暂无'
  const values = healthData.value.filter(item => item.glucose).map(item => item.glucose)
  if (values.length === 0) return '暂无'
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
})

const glucoseStatus = computed(() => {
  if (glucoseAvg.value === '暂无') return 'normal'
  const avg = parseFloat(glucoseAvg.value)
  if (avg < 3.9) return 'low'
  if (avg > 7.0) return 'high'
  return 'normal'
})

const glucoseDescription = computed(() => {
  if (glucoseAvg.value === '暂无') return '暂无数据'
  switch (glucoseStatus.value) {
    case 'low': return '血糖偏低，注意补充能量'
    case 'high': return '血糖偏高，需控制饮食'
    default: return '血糖在正常范围'
  }
})

// 体重状态
const weightAvg = computed(() => {
  if (healthData.value.length === 0) return '暂无'
  const values = healthData.value.filter(item => item.weight).map(item => item.weight)
  if (values.length === 0) return '暂无'
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
})

const weightStatus = computed(() => {
  // 简化计算，实际应根据BMI等指标评估
  return 'normal'
})

const weightDescription = computed(() => {
  if (weightAvg.value === '暂无') return '暂无数据'
  return '体重在正常范围'
})

// 血压状态
const bpAvg = computed(() => {
  if (healthData.value.length === 0) return '暂无'
  return '120/80' // 示例值，实际应计算平均值
})

const bpStatus = computed(() => {
  return 'normal'
})

const bpDescription = computed(() => {
  if (bpAvg.value === '暂无') return '暂无数据'
  return '血压在正常范围'
})

// 记录完整度
const completeness = computed(() => {
  if (healthData.value.length === 0) return 0
  
  let completeCount = 0
  healthData.value.forEach(record => {
    let itemComplete = 0
    if (record.glucose) itemComplete++
    if (record.weight) itemComplete++
    if (record.bloodPressure) itemComplete++
    
    completeCount += (itemComplete / 3)
  })
  
  return Math.round((completeCount / healthData.value.length) * 100)
})

const completenessDescription = computed(() => {
  if (completeness.value >= 80) return '记录非常完整'
  if (completeness.value >= 50) return '记录较为完整'
  return '记录不够完整'
})

// 健康预警信息
const healthAlerts = computed(() => {
  const alerts = []
  
  // 根据数据生成预警
  if (glucoseStatus.value === 'high') {
    alerts.push({
      title: '血糖偏高预警',
      description: '您的平均血糖值高于正常范围，建议控制碳水摄入并咨询医生。',
      type: 'warning'
    })
  } else if (glucoseStatus.value === 'low') {
    alerts.push({
      title: '血糖偏低预警',
      description: '您的平均血糖值低于正常范围，注意适当补充能量，避免低血糖发作。',
      type: 'warning'
    })
  }
  
  // 检查趋势
  if (healthData.value.length >= 3) {
    const recentData = [...healthData.value].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
    
    // 检查血糖上升趋势
    if (recentData.every(item => item.glucose) && 
        recentData[0].glucose > recentData[1].glucose && 
        recentData[1].glucose > recentData[2].glucose) {
      alerts.push({
        title: '血糖持续上升',
        description: '您最近的血糖呈现持续上升趋势，请注意饮食控制并增加运动。',
        type: 'info'
      })
    }
  }
  
  return alerts
})

// 处理周期变化
const handlePeriodChange = () => {
  fetchHealthData()
}

// 刷新数据
const refreshData = () => {
  fetchHealthData()
}

// 获取健康数据
const fetchHealthData = async () => {
  loading.data = true
  
  try {
    const response = await getHealthRecords({
      dateRange: selectedPeriod.value
    })
    
    if (response.data && response.data.records) {
      healthData.value = response.data.records
    } else if (Array.isArray(response.data)) {
      healthData.value = response.data
    } else {
      healthData.value = []
    }
    
    // 初始化图表
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('获取健康数据失败:', error)
    ElMessage.error('获取健康数据失败，请稍后重试')
    healthData.value = []
  } finally {
    loading.data = false
  }
}

// 初始化所有图表
const initCharts = () => {
  initGlucoseChart()
  initComparisonChart()
}

// 初始化血糖趋势图表
const initGlucoseChart = () => {
  if (!glucoseChartRef.value) return
  
  loading.glucose = true
  
  // 如果图表已经存在，销毁它
  if (glucoseChart) {
    glucoseChart.dispose()
  }
  
  // 创建图表实例
  glucoseChart = echarts.init(glucoseChartRef.value)
  
  // 准备数据
  const chartData = prepareGlucoseChartData()
  
  // 配置选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
          result += marker + param.seriesName + ': ' + param.value + ' mmol/L<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['实际血糖', '预测血糖']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '血糖 (mmol/L)',
      min: 3,
      max: 10,
      axisLine: {
        show: true
      },
      splitLine: {
        show: true
      }
    },
    series: [
      {
        name: '实际血糖',
        type: 'line',
        smooth: true,
        data: chartData.actual,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        markLine: {
          data: [
            { yAxis: 3.9, name: '低血糖', lineStyle: { color: 'orange' } },
            { yAxis: 7.0, name: '高血糖', lineStyle: { color: 'red' } }
          ]
        }
      },
      {
        name: '预测血糖',
        type: 'line',
        smooth: true,
        data: chartData.prediction,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          type: 'dashed'
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }
  
  // 如果不显示预测，则移除预测系列
  if (!showPrediction.value) {
    option.legend.data = ['实际血糖']
    option.series = [option.series[0]]
  }
  
  // 设置配置
  glucoseChart.setOption(option)
  
  // 响应窗口变化
  window.addEventListener('resize', () => {
    glucoseChart.resize()
  })
  
  loading.glucose = false
}

// 准备血糖图表数据
const prepareGlucoseChartData = () => {
  const sortedData = [...healthData.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // 提取日期和实际值
  const dates = sortedData.map(item => item.date)
  const actual = sortedData.map(item => item.glucose)
  
  // 预测数据（这里简单示例，实际应使用算法预测）
  // 使用最近3个值的平均斜率进行预测
  const prediction = [...actual]
  
  if (actual.length >= 3) {
    // 计算最近的平均斜率
    let slope = 0
    let count = 0
    
    for (let i = actual.length - 3; i < actual.length - 1; i++) {
      if (actual[i] && actual[i+1]) {
        slope += (actual[i+1] - actual[i])
        count++
      }
    }
    
    if (count > 0) {
      slope = slope / count
      
      // 添加7天预测
      const lastValue = actual[actual.length - 1]
      const lastDate = new Date(dates[dates.length - 1])
      
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(lastDate)
        nextDate.setDate(lastDate.getDate() + i)
        
        const nextValue = lastValue + (slope * i)
        // 约束在合理范围内
        const boundedValue = Math.min(Math.max(nextValue, 3), 10)
        
        dates.push(nextDate.toISOString().split('T')[0])
        actual.push(null) // 实际值为空
        prediction.push(parseFloat(boundedValue.toFixed(1)))
      }
    }
  }
  
  return { dates, actual, prediction }
}

// 更新血糖图表
const updateGlucoseChart = () => {
  initGlucoseChart()
}

// 初始化健康指标对比图表
const initComparisonChart = () => {
  if (!comparisonChartRef.value) return
  
  loading.comparison = true
  
  // 如果图表已经存在，销毁它
  if (comparisonChart) {
    comparisonChart.dispose()
  }
  
  // 创建图表实例
  comparisonChart = echarts.init(comparisonChartRef.value)
  
  // 根据选择的类型渲染不同图表
  if (comparisonType.value === 'radar') {
    renderRadarChart()
  } else {
    renderParallelChart()
  }
  
  // 响应窗口变化
  window.addEventListener('resize', () => {
    comparisonChart.resize()
  })
  
  loading.comparison = false
}

// 渲染雷达图
const renderRadarChart = () => {
  // 准备雷达图数据
  const radarData = prepareRadarData()
  
  // 配置雷达图选项
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['当前', '目标']
    },
    radar: {
      indicator: [
        { name: '血糖', max: 10 },
        { name: '体重', max: 100 },
        { name: '收缩压', max: 180 },
        { name: '舒张压', max: 120 },
        { name: '记录完整度', max: 100 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: radarData.current,
            name: '当前',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.6)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            }
          },
          {
            value: radarData.target,
            name: '目标',
            lineStyle: {
              type: 'dashed'
            }
          }
        ]
      }
    ]
  }
  
  // 设置配置
  comparisonChart.setOption(option)
}

// 准备雷达图数据
const prepareRadarData = () => {
  // 计算当前值
  const glucoseValue = glucoseAvg.value === '暂无' ? 0 : parseFloat(glucoseAvg.value)
  const weightValue = weightAvg.value === '暂无' ? 0 : parseFloat(weightAvg.value)
  
  // 血压解析（示例）
  let systolic = 120
  let diastolic = 80
  
  if (bpAvg.value !== '暂无') {
    const parts = bpAvg.value.split('/')
    if (parts.length === 2) {
      systolic = parseInt(parts[0])
      diastolic = parseInt(parts[1])
    }
  }
  
  // 当前值
  const current = [
    glucoseValue,
    weightValue,
    systolic,
    diastolic,
    completeness.value
  ]
  
  // 目标值（示例）
  const target = [
    5.5, // 理想血糖
    70,  // 理想体重（示例）
    120, // 理想收缩压
    80,  // 理想舒张压
    100  // 完整度目标
  ]
  
  return { current, target }
}

// 渲染平行坐标图
const renderParallelChart = () => {
  // 准备平行坐标图数据
  const parallelData = prepareParallelData()
  
  // 配置平行坐标图选项
  const option = {
    parallelAxis: [
      { dim: 0, name: '日期', type: 'category', data: parallelData.dates },
      { dim: 1, name: '血糖', min: 3, max: 10 },
      { dim: 2, name: '体重', min: 40, max: 100 },
      { 
        dim: 3, 
        name: '血压',
        min: 0,
        max: 200,
        axisLabel: {
          formatter: (value) => {
            // 将血压值映射回显示格式
            if (value <= 100) {
              return value + '/X' // 舒张压
            } else {
              return 'X/' + (value - 100) // 收缩压
            }
          }
        }
      },
      { dim: 4, name: '测量类型', type: 'category', data: ['空腹', '餐后', '睡前', '随机'] }
    ],
    visualMap: {
      show: true,
      min: 3,
      max: 10,
      dimension: 1, // 维度1是血糖
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      }
    },
    parallel: {
      layout: 'horizontal',
      parallelAxisDefault: {
        nameLocation: 'end'
      }
    },
    series: [
      {
        name: '健康记录',
        type: 'parallel',
        lineStyle: {
          width: 2
        },
        data: parallelData.values
      }
    ]
  }
  
  // 设置配置
  comparisonChart.setOption(option)
}

// 准备平行坐标图数据
const prepareParallelData = () => {
  // 只取最近的10条记录用于平行坐标图
  const recentData = [...healthData.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .reverse()
  
  const measureTypeMap = {
    'fasting': '空腹',
    'postprandial': '餐后',
    'bedtime': '睡前',
    'random': '随机'
  }
  
  // 提取日期和值
  const dates = recentData.map(item => item.date)
  
  const values = recentData.map(item => {
    // 解析血压
    let bpValue = 0
    if (item.bloodPressure) {
      const parts = item.bloodPressure.split('/')
      if (parts.length === 2) {
        // 映射血压值到单一数值，收缩压+100，舒张压保持原值
        const systolic = parseInt(parts[0])
        const diastolic = parseInt(parts[1])
        bpValue = systolic // 只使用收缩压作为示例
      }
    }
    
    return [
      item.date,
      item.glucose || 0,
      item.weight || 0,
      bpValue,
      measureTypeMap[item.measureType] || '随机'
    ]
  })
  
  return { dates, values }
}

// 更新对比图表
const updateComparisonChart = () => {
  initComparisonChart()
}

// 生命周期钩子
onMounted(() => {
  fetchHealthData()
})
</script>

<style scoped>
.analysis-page {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.status-cards {
  margin-bottom: 20px;
}

.status-card {
  display: flex;
  align-items: center;
  height: 100%;
  transition: transform 0.3s;
}

.status-card:hover {
  transform: translateY(-5px);
}

.status-icon {
  font-size: 36px;
  color: var(--primary-color);
  margin-right: 16px;
}

.status-icon.warning {
  color: var(--warning-color);
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 6px;
}

.status-value .unit {
  font-size: 14px;
  font-weight: normal;
  color: var(--text-color-secondary);
  margin-left: 4px;
}

.status-description {
  font-size: 12px;
  color: var(--success-color);
}

.status-description.high,
.status-description.low {
  color: var(--warning-color);
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.alert-card {
  margin-bottom: 20px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  margin-top: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    margin-bottom: 10px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .status-cards {
    margin-bottom: 10px;
  }
  
  .status-card {
    margin-bottom: 10px;
  }
}
</style> 