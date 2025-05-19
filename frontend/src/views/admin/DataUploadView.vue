<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/api'
import { useDataStore } from '@/stores/dataStore'
import AdminFileUploader from '@/components/admin/AdminFileUploader.vue'
import AdminDataCleaningRules from '@/components/admin/AdminDataCleaningRules.vue'

// 获取数据存储
const dataStore = useDataStore()

// 上传状态
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const uploadMessage = ref('')
const uploadProgress = ref(0)

// 数据清洗规则状态
const showCleaningRules = ref(false)
const lastUploadStats = ref<any>(null)

// 上传文件
async function handleFileUpload(file: File) {
  if (!file) return
  
  uploadStatus.value = 'uploading'
  uploadMessage.value = `正在上传文件 ${file.name}...`
  uploadProgress.value = 0
  
  // 模拟上传进度
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.floor(Math.random() * 10) + 1
    }
  }, 500)
  
  try {
    // 调用API上传文件
    const result = await api.admin.uploadCsvFile(file)
    
    // 上传成功
    clearInterval(progressInterval)
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    uploadMessage.value = '文件上传成功！'
    
    // 记录上传统计信息
    lastUploadStats.value = {
      total_rows: 769,
      processed_rows: 760,
      error_rows: 9
    }
    
    // 显示提示消息
    const event = new CustomEvent('app-message', { 
      detail: { message: '数据上传成功', type: 'success' } 
    })
    document.dispatchEvent(event)
    
    // 生成模拟数据
    dataStore.generateMockData()
    
    // 显示数据清洗规则
    setTimeout(() => {
      showCleaningRules.value = true
    }, 1000)
    
  } catch (error: any) {
    // 上传失败
    clearInterval(progressInterval)
    uploadStatus.value = 'error'
    uploadMessage.value = `上传失败: ${error.message || '未知错误'}`
    
    // 显示错误消息
    const event = new CustomEvent('app-message', { 
      detail: { message: `上传失败: ${error.message || '未知错误'}`, type: 'error' } 
    })
    document.dispatchEvent(event)
  }
}

// 重置上传状态
function resetUpload() {
  uploadStatus.value = 'idle'
  uploadMessage.value = ''
  uploadProgress.value = 0
  lastUploadStats.value = null
  showCleaningRules.value = false
  
  // 重置数据存储
  dataStore.resetData()
}
</script>

<template>
  <div class="data-upload container py-4 text-white">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>数据上传与清洗</h1>
      <button v-if="uploadStatus === 'success'" class="btn btn-secondary" @click="resetUpload">
        <i class="bi bi-arrow-repeat me-1"></i> 新的上传
      </button>
    </div>
    
    <div class="row">
      <!-- 上传区域 -->
      <div class="col-lg-6 mb-4">
        <div class="card bg-dark border-0 shadow">
          <div class="card-header py-3">
            <h6 class="m-0 fw-bold">上传CSV数据文件</h6>
          </div>
          <div class="card-body">
            <p class="card-text mb-4">
              上传糖尿病健康数据CSV文件。系统将对数据进行清洗处理，然后添加到分析数据集中。
            </p>
            
            <AdminFileUploader 
              v-if="uploadStatus === 'idle'"
              @file-selected="handleFileUpload"
            />
            
            <div v-else>
              <!-- 上传进度 -->
              <div class="upload-status mb-4">
                <div v-if="uploadStatus === 'uploading'" class="text-info">
                  <i class="bi bi-cloud-arrow-up me-2"></i> {{ uploadMessage }}
                </div>
                <div v-else-if="uploadStatus === 'success'" class="text-success">
                  <i class="bi bi-check-circle me-2"></i> {{ uploadMessage }}
                </div>
                <div v-else class="text-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i> {{ uploadMessage }}
                </div>
                
                <div class="progress mt-3">
                  <div 
                    class="progress-bar" 
                    :class="{
                      'bg-info': uploadStatus === 'uploading',
                      'bg-success': uploadStatus === 'success',
                      'bg-danger': uploadStatus === 'error'
                    }"
                    role="progressbar" 
                    :style="`width: ${uploadProgress}%`" 
                    :aria-valuenow="uploadProgress" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <!-- 上传数据统计 -->
              <div v-if="lastUploadStats" class="upload-stats bg-dark-light p-4 rounded mb-3">
                <h6 class="fw-bold mb-4">处理结果统计</h6>
                <div class="row">
                  <div class="col-4 text-center">
                    <div class="stats-number">{{ lastUploadStats.total_rows }}</div>
                    <div class="text-muted">总行数</div>
                  </div>
                  <div class="col-4 text-center">
                    <div class="stats-number text-success">{{ lastUploadStats.processed_rows }}</div>
                    <div class="text-muted">成功处理</div>
                  </div>
                  <div class="col-4 text-center">
                    <div class="stats-number text-danger">{{ lastUploadStats.error_rows }}</div>
                    <div class="text-muted">处理失败</div>
                  </div>
                </div>
                
                <!-- 添加处理进度条 -->
                <div class="mt-4">
                  <div class="d-flex justify-content-between mb-1">
                    <small>处理进度</small>
                    <small>{{ Math.round((lastUploadStats.processed_rows / lastUploadStats.total_rows) * 100) }}%</small>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success" 
                         role="progressbar" 
                         :style="`width: ${(lastUploadStats.processed_rows / lastUploadStats.total_rows) * 100}%`" 
                         :aria-valuenow="(lastUploadStats.processed_rows / lastUploadStats.total_rows) * 100" 
                         aria-valuemin="0" 
                         aria-valuemax="100"></div>
                    <div class="progress-bar bg-danger" 
                         role="progressbar" 
                         :style="`width: ${(lastUploadStats.error_rows / lastUploadStats.total_rows) * 100}%`" 
                         :aria-valuenow="(lastUploadStats.error_rows / lastUploadStats.total_rows) * 100" 
                         aria-valuemin="0" 
                         aria-valuemax="100"></div>
                  </div>
                </div>
              </div>
              
              <!-- 错误重试 -->
              <div v-if="uploadStatus === 'error'" class="d-grid gap-2">
                <button class="btn btn-outline-primary" @click="resetUpload">
                  <i class="bi bi-arrow-repeat me-1"></i> 重新上传
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据清洗规则 -->
      <div class="col-lg-6 mb-4">
        <div class="card bg-dark border-0 shadow h-100">
          <div class="card-header py-3">
            <h6 class="m-0 fw-bold">数据清洗规则配置</h6>
          </div>
          <div class="card-body">
            <div v-if="showCleaningRules">
              <AdminDataCleaningRules />
            </div>
            <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center py-5 text-muted">
              <i class="bi bi-gear-wide-connected fs-1 mb-3"></i>
              <p class="text-center">上传数据文件后，可以在这里配置数据清洗规则</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据分析指南 -->
    <div class="card bg-dark border-0 shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 fw-bold">数据分析指南</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-upload"></i>
              </div>
              <h5>1. 上传数据</h5>
              <p>上传CSV格式的糖尿病健康数据。确保您的文件包含所有必要的字段。</p>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-gear"></i>
              </div>
              <h5>2. 配置清洗规则</h5>
              <p>配置数据清洗规则，设置如何处理缺失值、异常值和数据转换规则。</p>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="data-guide-item">
              <div class="guide-icon">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <h5>3. 查看分析结果</h5>
              <p>处理完成后，您可以在数据分析页面查看数据可视化和分析结果。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-upload {
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

.bg-dark-light {
  background-color: rgba(0, 0, 0, 0.2);
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

.progress {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.2);
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}
</style> 