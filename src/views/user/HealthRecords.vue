<template>
  <div class="health-records-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>健康记录</h1>
        <div class="header-actions">
          <el-button type="success" @click="exportData" icon="Download">导出数据</el-button>
          <el-button type="primary" @click="showAddRecordDialog">添加记录</el-button>
        </div>
      </div>
      
      <!-- 图表展示区域 -->
      <el-card class="chart-card" v-loading="loading && !healthRecords.length">
        <template #header>
          <div class="card-header">
            <span>血糖趋势</span>
            <div class="date-range">
              <el-radio-group v-model="dateRange" size="small" @change="handleDateRangeChange">
                <el-radio-button label="week">近一周</el-radio-button>
                <el-radio-button label="month">近一月</el-radio-button>
                <el-radio-button label="year">近一年</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        
        <el-skeleton :rows="6" animated v-if="loading && !healthRecords.length" />
        <div ref="glucoseChartRef" class="chart-container" v-else></div>
      </el-card>
      
      <!-- 数据表格 -->
      <el-card class="record-table-card">
        <template #header>
          <div class="card-header">
            <span>历史记录</span>
            <div class="search-actions">
              <el-input
                v-model="searchText"
                placeholder="搜索..."
                clearable
                style="width: 200px;"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button icon="Refresh" circle @click="fetchHealthRecords" :loading="loading"></el-button>
            </div>
          </div>
        </template>
        
        <el-skeleton :rows="10" animated v-if="loading && !healthRecords.length" />
        
        <template v-else-if="filteredRecords.length > 0">
          <el-table
            :data="filteredRecords"
            stripe
            style="width: 100%"
            v-loading="loading && healthRecords.length > 0"
            height="450"
            :default-sort="{ prop: 'date', order: 'descending' }"
          >
            <el-table-column prop="date" label="日期" sortable width="180">
              <template #default="scope">
                {{ formatDate(scope.row.date) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="time" label="时间" width="100">
              <template #default="scope">
                {{ scope.row.time }}
              </template>
            </el-table-column>
            
            <el-table-column prop="measureType" label="测量类型" width="120">
              <template #default="scope">
                <el-tag :type="getMeasureTypeTag(scope.row.measureType)">
                  {{ getMeasureTypeLabel(scope.row.measureType) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="glucose" label="血糖值 (mmol/L)" sortable width="150">
              <template #default="scope">
                <span :class="getGlucoseClass(scope.row.glucose)">{{ scope.row.glucose }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="weight" label="体重 (kg)" sortable width="120" />
            <el-table-column prop="bloodPressure" label="血压 (mmHg)" width="140" />
            
            <el-table-column prop="note" label="备注" show-overflow-tooltip />
            
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button type="text" size="small" @click="editRecord(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="deleteRecord(scope.row)" style="color: var(--danger-color)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="totalRecords"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </template>
        
        <el-empty v-else description="暂无记录" v-loading="loading">
          <el-button type="primary" @click="showAddRecordDialog">添加记录</el-button>
        </el-empty>
      </el-card>
    </div>
    
    <!-- 添加/编辑记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      :title="isEdit ? '编辑记录' : '添加记录'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="recordForm" label-width="100px" :rules="recordRules" ref="recordFormRef">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="时间" prop="time">
          <el-time-picker
            v-model="recordForm.time"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="测量类型" prop="measureType">
          <el-select v-model="recordForm.measureType" placeholder="选择测量类型" style="width: 100%">
            <el-option label="空腹" value="fasting" />
            <el-option label="餐后" value="postprandial" />
            <el-option label="睡前" value="bedtime" />
            <el-option label="随机" value="random" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="血糖值" prop="glucose">
          <el-input-number
            v-model="recordForm.glucose"
            :precision="1"
            :step="0.1"
            :min="0"
            style="width: 100%"
            placeholder="mmol/L"
          />
        </el-form-item>
        
        <el-form-item label="体重" prop="weight">
          <el-input-number
            v-model="recordForm.weight"
            :precision="1"
            :step="0.1"
            :min="0"
            style="width: 100%"
            placeholder="kg"
          />
        </el-form-item>
        
        <el-form-item label="血压" prop="bloodPressure">
          <el-input
            v-model="recordForm.bloodPressure"
            placeholder="如: 120/80"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="recordForm.note"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecord" :loading="submitting">
            {{ isEdit ? '保存' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getHealthRecords, addHealthRecord, deleteHealthRecord, updateHealthRecord, exportHealthData } from '../../services/user'
import NavBar from '../../components/NavBar.vue'
import { Search } from '@element-plus/icons-vue'

// 引用
const glucoseChartRef = ref(null)
const recordFormRef = ref(null)

// 图表实例
let glucoseChart = null

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 分页状态
const totalRecords = ref(0)
const pageSize = 10
const currentPage = ref(1)

// 搜索状态
const searchText = ref('')

// 日期范围
const dateRange = ref('week')

// 对话框状态
const recordDialogVisible = ref(false)
const isEdit = ref(false)

// 记录列表
const healthRecords = ref([])

// 筛选后的记录
const filteredRecords = computed(() => {
  if (!searchText.value) {
    return healthRecords.value
  }
  
  const search = searchText.value.toLowerCase()
  return healthRecords.value.filter(record => {
    return record.date.toLowerCase().includes(search) ||
           record.note.toLowerCase().includes(search) ||
           (record.glucose && record.glucose.toString().includes(search))
  })
})

// 记录表单
const recordForm = reactive({
  id: null,
  date: null,
  time: null,
  measureType: 'fasting',
  glucose: null,
  weight: null,
  bloodPressure: '',
  note: ''
})

// 表单验证规则
const recordRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择时间', trigger: 'blur' }
  ],
  measureType: [
    { required: true, message: '请选择测量类型', trigger: 'change' }
  ],
  glucose: [
    { required: true, message: '请输入血糖值', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取测量类型标签
const getMeasureTypeLabel = (type) => {
  const types = {
    'fasting': '空腹',
    'postprandial': '餐后',
    'bedtime': '睡前',
    'random': '随机'
  }
  return types[type] || type
}

// 获取测量类型标签样式
const getMeasureTypeTag = (type) => {
  const tags = {
    'fasting': 'primary',
    'postprandial': 'success',
    'bedtime': 'warning',
    'random': 'info'
  }
  return tags[type] || ''
}

// 显示添加记录对话框
const showAddRecordDialog = () => {
  isEdit.value = false
  resetRecordForm()
  recordDialogVisible.value = true
}

// 重置表单
const resetRecordForm = () => {
  recordForm.id = null
  recordForm.date = new Date()
  recordForm.time = new Date()
  recordForm.measureType = 'fasting'
  recordForm.glucose = null
  recordForm.weight = null
  recordForm.bloodPressure = ''
  recordForm.note = ''
  
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
}

// 编辑记录
const editRecord = (record) => {
  isEdit.value = true
  Object.assign(recordForm, record)
  
  // 转换日期和时间
  if (record.date) {
    recordForm.date = new Date(record.date)
  }
  
  if (record.time) {
    const [hours, minutes] = record.time.split(':')
    const timeDate = new Date()
    timeDate.setHours(parseInt(hours, 10))
    timeDate.setMinutes(parseInt(minutes, 10))
    recordForm.time = timeDate
  }
  
  recordDialogVisible.value = true
}

// 删除记录
const deleteRecord = (record) => {
  ElMessageBox.confirm(
    `确定要删除 ${formatDate(record.date)} ${record.time} 的记录吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用API删除记录
      await deleteHealthRecord(record.id);
      
      // 从本地列表中移除
      const index = healthRecords.value.findIndex(r => r.id === record.id);
      if (index !== -1) {
        healthRecords.value.splice(index, 1);
      }
      
      ElMessage.success('记录已删除');
      
      // 刷新图表
      initGlucoseChart();
    } catch (error) {
      console.error('删除记录失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {
    // 用户取消删除，不执行任何操作
  });
}

// 提交记录
const submitRecord = async () => {
  if (!recordFormRef.value) return
  
  await recordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        // 准备提交数据
        const submitData = { ...recordForm }
        
        // 格式化日期和时间
        if (submitData.date) {
          submitData.date = formatDate(submitData.date)
        }
        
        if (submitData.time) {
          const hours = submitData.time.getHours().toString().padStart(2, '0')
          const minutes = submitData.time.getMinutes().toString().padStart(2, '0')
          submitData.time = `${hours}:${minutes}`
        }
        
        if (isEdit.value) {
          // TODO: 实现更新记录的API调用
          // await updateHealthRecord(submitData.id, submitData)
          
          // 模拟更新
          const index = healthRecords.value.findIndex(r => r.id === submitData.id)
          if (index !== -1) {
            healthRecords.value[index] = { ...submitData }
          }
          
          ElMessage.success('记录已更新')
        } else {
          // 添加记录
          submitData.id = `temp-${Date.now()}` // 临时ID，实际应由后端生成
          
          // TODO: 使用实际的API调用
          // const response = await addHealthRecord(submitData)
          // const newRecord = response.data
          
          // 模拟添加
          healthRecords.value.unshift(submitData)
          
          ElMessage.success('记录已添加')
        }
        
        recordDialogVisible.value = false
        
        // 刷新图表
        initGlucoseChart()
      } catch (error) {
        console.error('提交记录失败:', error)
        ElMessage.error(isEdit.value ? '更新失败，请稍后重试' : '添加失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 处理页面变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchHealthRecords()
}

// 处理搜索
const handleSearch = () => {
  // 本地筛选，无需加载
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  fetchHealthRecords()
  initGlucoseChart()
}

// 初始化血糖图表
const initGlucoseChart = () => {
  if (!glucoseChartRef.value) return
  
  // 如果图表已经存在，销毁它
  if (glucoseChart) {
    glucoseChart.dispose()
  }
  
  // 创建图表实例
  glucoseChart = echarts.init(glucoseChartRef.value)
  
  // 准备图表数据
  const glucoseData = prepareChartData()
  
  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br />血糖值: ${data.value} mmol/L`
      }
    },
    xAxis: {
      type: 'category',
      data: glucoseData.dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '血糖值 (mmol/L)',
      min: 3,
      max: 10,
      axisLine: {
        show: true
      },
      splitLine: {
        show: true
      },
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '血糖值',
        type: 'line',
        smooth: true,
        data: glucoseData.values,
        markLine: {
          data: [
            { yAxis: 3.9, name: '低血糖', lineStyle: { color: 'orange' } },
            { yAxis: 7.0, name: '高血糖', lineStyle: { color: 'red' } }
          ]
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ],
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    }
  }
  
  // 设置图表选项
  glucoseChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    glucoseChart.resize()
  })
}

// 准备图表数据
const prepareChartData = () => {
  // 根据日期范围筛选数据
  let filteredData = healthRecords.value
  const now = new Date()
  let startDate = new Date()
  
  switch (dateRange.value) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 7)
  }
  
  // 筛选范围内的数据
  filteredData = filteredData.filter(record => {
    const recordDate = new Date(record.date)
    return recordDate >= startDate && recordDate <= now
  })
  
  // 按日期排序
  filteredData.sort((a, b) => {
    return new Date(a.date) - new Date(b.date)
  })
  
  // 提取日期和值
  const dates = filteredData.map(record => formatDate(record.date))
  const values = filteredData.map(record => record.glucose)
  
  return { dates, values }
}

// 获取健康记录
const fetchHealthRecords = async () => {
  loading.value = true;
  try {
    // 调用API获取健康记录
    const response = await getHealthRecords({
      page: currentPage.value,
      pageSize: pageSize,
      dateRange: dateRange.value
    });
    
    // 处理返回的数据
    if (response.data && response.data.records) {
      healthRecords.value = response.data.records;
      totalRecords.value = response.data.total || response.data.records.length;
    } else {
      // 兼容旧代码，如果没有按预期格式返回数据，则使用空数组
      healthRecords.value = [];
      totalRecords.value = 0;
    }
    
    // 初始化图表
    nextTick(() => {
      initGlucoseChart();
    });
  } catch (error) {
    console.error('获取健康记录失败:', error);
    ElMessage.error('获取健康记录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 导出健康数据
const exportData = async () => {
  try {
    ElMessage.info('正在准备导出数据...');
    
    // 调用API导出数据
    const response = await exportHealthData({
      dateRange: dateRange.value
    });
    
    // 处理返回数据
    if (response.data && response.data.data) {
      // 将数据转换为CSV格式
      const csvContent = convertToCSV(response.data.data);
      
      // 创建下载
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `健康记录_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      ElMessage.success('数据导出成功');
    } else {
      ElMessage.error('导出数据格式错误');
    }
  } catch (error) {
    console.error('导出健康数据失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  }
};

// 将数据转换为CSV格式
const convertToCSV = (data) => {
  if (!data || !data.length) return '';
  
  // 定义CSV头
  const headers = ['日期', '时间', '测量类型', '血糖值(mmol/L)', '体重(kg)', '血压(mmHg)', '备注'];
  
  // 构建CSV内容
  let csvContent = headers.join(',') + '\n';
  
  // 添加数据行
  data.forEach(record => {
    const measureTypeLabel = getMeasureTypeLabel(record.measureType);
    const row = [
      record.date,
      record.time,
      measureTypeLabel,
      record.glucose,
      record.weight,
      record.bloodPressure,
      record.note ? `"${record.note.replace(/"/g, '""')}"` : ''
    ];
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

// 血糖值样式类
const getGlucoseClass = (glucose) => {
  if (!glucose) return ''
  const value = parseFloat(glucose)
  if (value < 3.9) return 'glucose-low'
  if (value > 7.0) return 'glucose-high'
  return 'glucose-normal'
}

// 图表响应式调整
watch(() => window.innerWidth, () => {
  if (glucoseChart) {
    glucoseChart.resize()
  }
})

// 生命周期钩子
onMounted(() => {
  fetchHealthRecords()
})
</script>

<style scoped>
.health-records-page {
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

.chart-card,
.record-table-card {
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

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.glucose-normal {
  color: var(--success-color);
}

.glucose-high {
  color: var(--danger-color);
  font-weight: bold;
}

.glucose-low {
  color: var(--warning-color);
  font-weight: bold;
}

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
  
  .header-actions .el-button {
    flex: 1;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style> 