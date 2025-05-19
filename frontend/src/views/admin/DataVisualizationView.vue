<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useRouter } from 'vue-router'
import AdminVisualizationControls from '@/components/admin/AdminVisualizationControls.vue'
import AdminVisualizationChart from '@/components/admin/AdminVisualizationChart.vue'

// 获取数据存储和路由
const dataStore = useDataStore()
const router = useRouter()

// 可视化数据
const visualizationData = ref<any>(null)
const selectedColumns = ref<string[]>([])
const compareBy = ref<string>('')
const normalizeData = ref(true)
const excludeOutliers = ref(true)

// 状态
const loading = ref(false)
const error = ref<string | null>(null)

// 获取全部特征列
const availableColumns = computed(() => {
  if (!dataStore.isDataUploaded || dataStore.diabetesData.length === 0) {
    return []
  }
  
  return [
    'pregnancies', 
    'glucose', 
    'bloodPressure', 
    'skinThickness', 
    'insulin', 
    'bmi', 
    'diabetesPedigreeFunction', 
    'age',
    'outcome'
  ]
})

// 图表类型
const chartType = ref<'scatter' | 'bar' | 'box' | 'histogram'>('scatter')

// 加载可视化数据
function loadVisualizationData() {
  if (!dataStore.isDataUploaded) {
    error.value = '请先上传数据文件'
    return
  }
  
  if (selectedColumns.value.length === 0) {
    error.value = '请至少选择一个数据列'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // 从数据存储中提取所需的列
    const extractedData = dataStore.diabetesData.map(record => {
      const item: Record<string, any> = {}
      
      // 添加所选列
      selectedColumns.value.forEach(col => {
        if (record[col] !== undefined) {
          item[col] = record[col]
        }
      })
      
      // 添加比较字段
      if (compareBy.value && record[compareBy.value] !== undefined) {
        item[compareBy.value] = record[compareBy.value]
      }
      
      return item
    })
    
    // 处理数据
    processData(extractedData)
    
  } catch (err: any) {
    error.value = err.message || '处理可视化数据失败'
    console.error('处理可视化数据出错:', err)
  } finally {
    loading.value = false
  }
}

// 处理数据（归一化、排除异常值等）
function processData(data: any[]) {
  let processedData = [...data]
  
  // 排除异常值
  if (excludeOutliers.value) {
    processedData = removeOutliers(processedData, selectedColumns.value)
  }
  
  // 归一化数据
  if (normalizeData.value) {
    processedData = normalizeDataset(processedData, selectedColumns.value)
  }
  
  visualizationData.value = processedData
}

// 移除异常值（简单实现：移除超过3个标准差的值）
function removeOutliers(data: any[], columns: string[]) {
  return data.filter(item => {
    for (const col of columns) {
      // 跳过比较列
      if (col === compareBy.value) continue
      
      // 跳过非数值列
      if (typeof item[col] !== 'number') continue
      
      const values = data.map(d => d[col])
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const squareDiffs = values.map(val => Math.pow(val - mean, 2))
      const stdDev = Math.sqrt(squareDiffs.reduce((sum, val) => sum + val, 0) / values.length)
      
      // 如果值超过平均值±3倍标准差，视为异常值
      if (Math.abs(item[col] - mean) > 3 * stdDev) {
        return false
      }
    }
    return true
  })
}

// 归一化数据到[0,1]范围
function normalizeDataset(data: any[], columns: string[]) {
  // 计算每列的最大最小值
  const stats: Record<string, { min: number, max: number }> = {}
  
  columns.forEach(col => {
    // 跳过比较列或已经是分类变量
    if (col === compareBy.value || col === 'outcome') return
    
    const values = data.map(item => item[col]).filter(val => typeof val === 'number')
    if (values.length === 0) return
    
    stats[col] = {
      min: Math.min(...values),
      max: Math.max(...values)
    }
  })
  
  // 归一化数据
  return data.map(item => {
    const normalizedItem = { ...item }
    
    Object.keys(stats).forEach(col => {
      const { min, max } = stats[col]
      // 避免除以零
      if (max === min) {
        normalizedItem[col] = 0
      } else {
        normalizedItem[col] = (item[col] - min) / (max - min)
      }
    })
    
    return normalizedItem
  })
}

// 更新可视化设置
function updateVisualization(settings: any) {
  selectedColumns.value = settings.selectedColumns
  compareBy.value = settings.compareBy
  normalizeData.value = settings.normalizeData
  excludeOutliers.value = settings.excludeOutliers
  chartType.value = settings.chartType
  
  loadVisualizationData()
}

// 处理数据导出
function exportVisualizationData() {
  if (!dataStore.isDataUploaded) {
    const event = new CustomEvent('app-message', { 
      detail: { message: '请先上传数据', type: 'error' } 
    })
    document.dispatchEvent(event)
    return
  }
  
  // 这里实现导出功能，可以使用FileSaver.js等库
  alert('数据导出功能将在后续版本实现')
}

// 跳转到数据上传页面
function navigateToUpload() {
  router.push('/admin/data-upload')
}

// 组件挂载时预设一些列
onMounted(() => {
  if (dataStore.isDataUploaded) {
    // 默认选择两列作为初始可视化
    selectedColumns.value = ['age', 'glucose']
    loadVisualizationData()
  }
})
</script>

<template>
  <div class="data-visualization container py-4 text-white">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>数据可视化</h1>
      <button 
        class="btn btn-primary" 
        @click="exportVisualizationData" 
        :disabled="!dataStore.isDataUploaded"
      >
        <i class="bi bi-download me-1"></i> 导出数据
      </button>
    </div>
    
    <!-- 未上传数据提示 -->
    <div v-if="!dataStore.isDataUploaded" class="no-data-container">
      <div class="card bg-dark border-0 shadow p-5 text-center">
        <div class="no-data-icon mb-4">
          <i class="bi bi-graph-up"></i>
        </div>
        <h3 class="mb-3">暂无数据可供可视化</h3>
        <p class="text-muted mb-4">您尚未上传任何糖尿病健康数据。需要先上传CSV数据文件才能进行数据可视化和分析。</p>
        <div class="d-grid gap-2 col-md-6 mx-auto">
          <button class="btn btn-primary" @click="navigateToUpload">
            <i class="bi bi-cloud-upload me-2"></i> 上传数据文件
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="row">
      <!-- 控制面板 -->
      <div class="col-lg-3 mb-4">
        <div class="card bg-dark border-0 shadow">
          <div class="card-header py-3">
            <h6 class="m-0 fw-bold">可视化设置</h6>
          </div>
          <div class="card-body">
            <AdminVisualizationControls
              :availableColumns="availableColumns"
              :selectedColumns="selectedColumns"
              :compareBy="compareBy"
              :normalizeData="normalizeData"
              :excludeOutliers="excludeOutliers"
              :chartType="chartType"
              :loading="loading"
              @update="updateVisualization"
            />
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="col-lg-9 mb-4">
        <div class="card bg-dark border-0 shadow">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 fw-bold">数据可视化结果</h6>
            <div class="chart-info text-muted small">
              <span v-if="selectedColumns.length > 0">
                <span class="fw-bold">选中的特征:</span> 
                {{ selectedColumns.join(', ') }}
                <span v-if="compareBy">
                  | <span class="fw-bold">比较因子:</span> {{ compareBy }}
                </span>
              </span>
            </div>
          </div>
          <div class="card-body">
            <!-- 加载状态 -->
            <div v-if="loading" class="text-center my-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
              <p class="mt-2">加载可视化数据...</p>
            </div>
            
            <!-- 错误信息 -->
            <div v-else-if="error" class="alert alert-danger my-4">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ error }}
            </div>
            
            <!-- 图表显示 -->
            <AdminVisualizationChart
              v-else-if="visualizationData"
              :data="visualizationData"
              :selectedColumns="selectedColumns"
              :chartType="chartType"
              :compareBy="compareBy"
            />
            
            <!-- 未选择数据 -->
            <div v-else class="text-center my-5 text-muted">
              <i class="bi bi-bar-chart fs-1 mb-3"></i>
              <p>请选择要可视化的数据列</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可视化说明 -->
    <div v-if="dataStore.isDataUploaded" class="card bg-dark border-0 shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 fw-bold">可视化使用说明</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-columns-gap"></i>
              </div>
              <h5>选择数据列</h5>
              <p>从左侧控制面板选择一个或多个要可视化的数据列。</p>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-bar-chart"></i>
              </div>
              <h5>选择图表类型</h5>
              <p>选择散点图、柱状图、箱形图或直方图来展示数据。</p>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-sliders"></i>
              </div>
              <h5>调整选项</h5>
              <p>根据需要设置数据归一化、排除异常值等选项。</p>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-download"></i>
              </div>
              <h5>导出结果</h5>
              <p>导出可视化结果和分析数据供进一步研究使用。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-visualization {
  min-height: calc(100vh - 180px);
}

.card {
  background-color: rgba(30, 41, 59, 0.8) !important;
  backdrop-filter: blur(10px);
  border-radius: 5px;
  overflow: hidden;
}

.card-header {
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-guide-item {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.data-guide-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.guide-icon {
  font-size: 2rem;
  color: #4e73df;
  margin-bottom: 15px;
}

.data-guide-item h5 {
  font-weight: 600;
  margin-bottom: 10px;
}

.data-guide-item p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0;
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