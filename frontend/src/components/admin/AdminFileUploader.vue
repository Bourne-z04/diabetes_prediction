<script setup lang="ts">
import { ref } from 'vue'

// 文件相关状态
const selectedFile = ref<File | null>(null)
const dragActive = ref(false)

// 定义事件
const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

// 处理文件拖拽
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
  
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files)
  }
}

// 处理文件输入
function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFiles(input.files)
  }
}

// 处理文件选择
function handleFiles(fileList: FileList) {
  // 只处理第一个文件
  const file = fileList[0]
  
  // 验证文件类型
  if (!file.name.endsWith('.csv')) {
    alert('请选择 CSV 文件')
    return
  }
  
  selectedFile.value = file
  emit('file-selected', file)
}
</script>

<template>
  <div 
    class="file-uploader"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="{ 'drag-active': dragActive }"
  >
    <div class="upload-icon">
      <i class="bi bi-cloud-arrow-up"></i>
    </div>
    <h5>拖放文件或点击选择</h5>
    <p class="text-muted">支持 CSV 格式文件</p>
    <input 
      type="file" 
      id="fileInput" 
      accept=".csv" 
      class="file-input" 
      @change="handleFileInput"
    >
    <label for="fileInput" class="btn btn-primary">
      <i class="bi bi-file-earmark-arrow-up me-1"></i> 浏览文件
    </label>
  </div>
</template>

<style scoped>
.file-uploader {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  background-color: rgba(0, 0, 0, 0.1);
}

.drag-active {
  border-color: #4e73df;
  background-color: rgba(78, 115, 223, 0.1);
}

.upload-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
}

.drag-active .upload-icon {
  color: #4e73df;
}

.file-uploader h5 {
  margin-bottom: 10px;
  font-weight: 600;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.file-uploader label {
  cursor: pointer;
  margin-top: 20px;
  display: inline-block;
}

.file-uploader:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(0, 0, 0, 0.2);
}
</style> 