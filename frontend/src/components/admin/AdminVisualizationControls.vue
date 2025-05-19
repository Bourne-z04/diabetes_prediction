<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 接收属性
const props = defineProps<{
  availableColumns: string[]
  selectedColumns: string[]
  compareBy: string
  normalizeData: boolean
  excludeOutliers: boolean
  chartType: 'scatter' | 'bar' | 'box' | 'histogram'
  loading: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update', settings: any): void
}>()

// 本地状态，用于表单
const formState = ref({
  selectedColumns: [...props.selectedColumns],
  compareBy: props.compareBy,
  normalizeData: props.normalizeData,
  excludeOutliers: props.excludeOutliers,
  chartType: props.chartType
})

// 监听属性变化，更新本地状态
watch(() => props, (newProps) => {
  formState.value = {
    selectedColumns: [...newProps.selectedColumns],
    compareBy: newProps.compareBy,
    normalizeData: newProps.normalizeData,
    excludeOutliers: newProps.excludeOutliers,
    chartType: newProps.chartType
  }
}, { deep: true })

// 比较因子选项（去除已选择的列）
const compareByOptions = computed(() => {
  return props.availableColumns.filter(col => !formState.value.selectedColumns.includes(col))
})

// 提交表单
function applySettings() {
  emit('update', { ...formState.value })
}

// 切换选择列
function toggleColumn(column: string) {
  const index = formState.value.selectedColumns.indexOf(column)
  if (index === -1) {
    // 添加列
    formState.value.selectedColumns.push(column)
  } else {
    // 移除列
    formState.value.selectedColumns.splice(index, 1)
  }
  
  // 如果当前比较因子是被移除的列，则清空比较因子
  if (formState.value.compareBy === column && index !== -1) {
    formState.value.compareBy = ''
  }
}

// 判断列是否被选中
function isColumnSelected(column: string) {
  return formState.value.selectedColumns.includes(column)
}
</script>

<template>
  <div class="visualization-controls">
    <form @submit.prevent="applySettings">
      <!-- 选择数据列 -->
      <div class="mb-4">
        <label class="form-label fw-bold">选择数据列</label>
        <div class="column-selector">
          <div 
            v-for="column in availableColumns" 
            :key="column"
            class="column-chip"
            :class="{ 'selected': isColumnSelected(column) }"
            @click="toggleColumn(column)"
          >
            {{ column }}
          </div>
        </div>
        <div class="form-text">选择一个或多个要可视化的数据列</div>
      </div>
      
      <!-- 图表类型 -->
      <div class="mb-4">
        <label class="form-label fw-bold">图表类型</label>
        <div class="chart-type-selector">
          <div class="btn-group w-100">
            <button 
              type="button"
              class="btn btn-outline-primary" 
              :class="{ 'active': formState.chartType === 'scatter' }"
              @click="formState.chartType = 'scatter'"
            >
              <i class="bi bi-scatter-chart me-1"></i> 散点图
            </button>
            <button 
              type="button"
              class="btn btn-outline-primary" 
              :class="{ 'active': formState.chartType === 'bar' }"
              @click="formState.chartType = 'bar'"
            >
              <i class="bi bi-bar-chart me-1"></i> 柱状图
            </button>
          </div>
          <div class="btn-group w-100 mt-2">
            <button 
              type="button"
              class="btn btn-outline-primary" 
              :class="{ 'active': formState.chartType === 'box' }"
              @click="formState.chartType = 'box'"
            >
              <i class="bi bi-box me-1"></i> 箱形图
            </button>
            <button 
              type="button"
              class="btn btn-outline-primary" 
              :class="{ 'active': formState.chartType === 'histogram' }"
              @click="formState.chartType = 'histogram'"
            >
              <i class="bi bi-bar-chart-steps me-1"></i> 直方图
            </button>
          </div>
        </div>
      </div>
      
      <!-- 比较因子 -->
      <div class="mb-4">
        <label for="compareBy" class="form-label fw-bold">比较因子</label>
        <select 
          id="compareBy" 
          class="form-select bg-dark text-white" 
          v-model="formState.compareBy"
        >
          <option value="">不使用比较因子</option>
          <option value="outcome">糖尿病结果</option>
          <option 
            v-for="option in compareByOptions" 
            :key="option" 
            :value="option"
          >
            {{ option }}
          </option>
        </select>
        <div class="form-text">选择一个因子来比较不同组的数据</div>
      </div>
      
      <!-- 数据处理选项 -->
      <div class="mb-4">
        <label class="form-label fw-bold">数据处理选项</label>
        
        <div class="form-check mb-2">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="normalizeData" 
            v-model="formState.normalizeData"
          >
          <label class="form-check-label" for="normalizeData">
            归一化数据
          </label>
        </div>
        
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="excludeOutliers" 
            v-model="formState.excludeOutliers"
          >
          <label class="form-check-label" for="excludeOutliers">
            排除异常值
          </label>
        </div>
      </div>
      
      <!-- 提交按钮 -->
      <div class="d-grid gap-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading || formState.selectedColumns.length === 0"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-graph-up me-1"></i>
          更新可视化
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.column-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.column-chip {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.column-chip:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.column-chip.selected {
  background-color: rgba(78, 115, 223, 0.2);
  border-color: #4e73df;
  color: #fff;
}

.form-control, .form-select {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.form-control:focus, .form-select:focus {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
  color: white;
}

.form-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.form-check-input {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-check-input:checked {
  background-color: #4e73df;
  border-color: #4e73df;
}

.btn-outline-primary {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(78, 115, 223, 0.5);
}

.btn-outline-primary:hover, 
.btn-outline-primary:focus,
.btn-outline-primary.active {
  background-color: rgba(78, 115, 223, 0.9);
  border-color: #4e73df;
  color: white;
}

.chart-type-selector button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 5px;
  font-size: 0.875rem;
}
</style> 