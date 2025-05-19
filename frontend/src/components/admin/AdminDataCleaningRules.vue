<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

// 规则配置数据
const rules = ref<any>({
  missing_values: {
    strategy: 'mean',
    custom_values: {}
  },
  outliers: {
    detection: 'zscore',
    threshold: 3,
    strategy: 'cap'
  },
  transformations: {
    normalize: true,
    columns: []
  }
})

// 表单状态
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// 加载当前规则
async function loadRules() {
  loading.value = true
  error.value = null
  
  try {
    const result = await api.admin.getCleaningRules()
    if (result && result.rules) {
      rules.value = result.rules
    }
  } catch (err: any) {
    error.value = err.message || '获取数据清洗规则失败'
    console.error('加载数据清洗规则出错:', err)
  } finally {
    loading.value = false
  }
}

// 保存规则
async function saveRules() {
  saving.value = true
  error.value = null
  success.value = null
  
  try {
    await api.admin.updateCleaningRules(rules.value)
    success.value = '数据清洗规则保存成功'
    
    // 显示成功消息
    const event = new CustomEvent('app-message', { 
      detail: { message: '数据清洗规则更新成功', type: 'success' } 
    })
    document.dispatchEvent(event)
  } catch (err: any) {
    error.value = err.message || '保存数据清洗规则失败'
    console.error('保存数据清洗规则出错:', err)
    
    // 显示错误消息
    const event = new CustomEvent('app-message', { 
      detail: { message: err.message || '保存失败', type: 'error' } 
    })
    document.dispatchEvent(event)
  } finally {
    saving.value = false
    
    // 3秒后清除成功消息
    if (success.value) {
      setTimeout(() => {
        success.value = null
      }, 3000)
    }
  }
}

// 组件挂载时加载规则
onMounted(() => {
  loadRules()
})
</script>

<template>
  <div class="data-cleaning-rules">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-2">加载数据清洗规则...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-else-if="error" class="alert alert-danger my-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="loadRules">
        <i class="bi bi-arrow-clockwise me-1"></i> 重试
      </button>
    </div>
    
    <!-- 规则表单 -->
    <form v-else @submit.prevent="saveRules">
      <!-- 成功消息 -->
      <div v-if="success" class="alert alert-success mb-3 fade-out">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ success }}
      </div>
      
      <!-- 缺失值处理 -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3">缺失值处理</h6>
        <div class="form-group mb-3">
          <label class="form-label">处理策略</label>
          <select v-model="rules.missing_values.strategy" class="form-select bg-dark text-white">
            <option value="mean">均值填充</option>
            <option value="median">中位数填充</option>
            <option value="mode">众数填充</option>
            <option value="constant">常数填充</option>
            <option value="drop">删除行</option>
          </select>
          <div class="form-text">选择如何处理数据中的缺失值</div>
        </div>
        
        <div v-if="rules.missing_values.strategy === 'constant'" class="form-group mb-3">
          <label class="form-label">填充常数值</label>
          <input type="number" v-model.number="rules.missing_values.constant_value" class="form-control bg-dark text-white">
        </div>
      </div>
      
      <!-- 异常值处理 -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3">异常值处理</h6>
        <div class="form-group mb-3">
          <label class="form-label">检测方法</label>
          <select v-model="rules.outliers.detection" class="form-select bg-dark text-white">
            <option value="zscore">Z-Score方法</option>
            <option value="iqr">IQR方法</option>
            <option value="none">不检测</option>
          </select>
        </div>
        
        <div v-if="rules.outliers.detection !== 'none'" class="form-group mb-3">
          <label class="form-label">阈值</label>
          <input type="number" v-model.number="rules.outliers.threshold" min="1" step="0.1" class="form-control bg-dark text-white">
          <div class="form-text">
            {{ rules.outliers.detection === 'zscore' ? 'Z-Score超过此值的数据点被视为异常值' : 'IQR倍数, 默认为1.5' }}
          </div>
        </div>
        
        <div v-if="rules.outliers.detection !== 'none'" class="form-group mb-3">
          <label class="form-label">处理策略</label>
          <select v-model="rules.outliers.strategy" class="form-select bg-dark text-white">
            <option value="cap">限制极值(Capping)</option>
            <option value="drop">删除行</option>
            <option value="none">不处理(仅标记)</option>
          </select>
        </div>
      </div>
      
      <!-- 数据转换 -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3">数据转换</h6>
        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" id="normalizeData" v-model="rules.transformations.normalize">
          <label class="form-check-label" for="normalizeData">对数值列进行归一化</label>
        </div>
        
        <div class="form-text mb-3">
          归一化将数据缩放到[0,1]区间，有助于提高机器学习模型性能。
        </div>
      </div>
      
      <!-- 保存按钮 -->
      <div class="d-grid gap-2">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-save me-1"></i>
          保存规则配置
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-control, .form-select {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  font-size: 0.875rem;
}

.form-check-input {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-check-input:checked {
  background-color: #4e73df;
  border-color: #4e73df;
}

.fade-out {
  animation: fadeOut 3s forwards;
  animation-delay: 2s;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style> 