<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <el-config-provider :locale="zhCn">
      <router-view />
      
      <!-- 全局加载指示器 -->
      <div class="global-loading" v-if="globalLoading">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, provide, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from './stores/user'

// 路由
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 全局加载状态
const globalLoading = ref(false)
const loadingText = ref('加载中...')

// 暗黑模式状态
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

// 提供全局加载状态到子组件
provide('globalLoading', globalLoading)
provide('setGlobalLoading', (loading, text = '加载中...') => {
  globalLoading.value = loading
  loadingText.value = text
})

// 全局错误处理
const handleGlobalError = (error) => {
  console.error('全局错误:', error)
  
  // 根据错误类型显示不同的错误消息
  let errorMessage = '系统发生错误，请稍后重试'
  
  if (error.response) {
    // HTTP错误
    const status = error.response.status
    
    switch (status) {
      case 400:
        errorMessage = '请求参数有误'
        break
      case 401:
        errorMessage = '用户未授权，请重新登录'
        // 未授权时，重定向到登录页
        userStore.logout()
        router.push('/login')
        break
      case 403:
        errorMessage = '权限不足，无法访问'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 500:
        errorMessage = '服务器内部错误'
        break
      default:
        errorMessage = `服务器响应错误 (${status})`
    }
    
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    }
  } else if (error.request) {
    // 网络错误
    errorMessage = '网络连接失败，请检查您的网络'
  }
  
  ElMessage.error({
    message: errorMessage,
    duration: 5000
  })
  
  // 关闭全局加载状态
  globalLoading.value = false
}

// 监听网络状态变化
const handleNetworkChange = () => {
  if (!navigator.onLine) {
    ElMessage.warning({
      message: '网络连接已断开，请检查您的网络设置',
      duration: 0
    })
  } else {
    ElMessage.success({
      message: '网络已恢复连接',
      duration: 3000
    })
  }
}

// 切换暗黑模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value)
  
  // 设置根元素的数据属性
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

// 提供切换暗黑模式方法到子组件
provide('isDarkMode', isDarkMode)
provide('toggleDarkMode', toggleDarkMode)

// 生命周期钩子
onMounted(() => {
  // 初始化主题
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  
  // 设置全局错误处理
  window.addEventListener('error', handleGlobalError)
  
  // 监听网络状态变化
  window.addEventListener('online', handleNetworkChange)
  window.addEventListener('offline', handleNetworkChange)
  
  // 如果已登录，尝试获取用户信息
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo().catch(handleGlobalError)
  }
  
  // 清理函数
  return () => {
    window.removeEventListener('error', handleGlobalError)
    window.removeEventListener('online', handleNetworkChange)
    window.removeEventListener('offline', handleNetworkChange)
  }
})
</script>

<style>
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  
  --text-color: #303133;
  --text-color-secondary: #606266;
  --text-color-disabled: #C0C4CC;
  
  --border-color: #DCDFE6;
  --border-color-light: #E4E7ED;
  
  --bg-color: #F5F7FA;
  --bg-color-overlay: #FFFFFF;
  --bg-color-secondary: #EBEEF5;
}

/* 暗黑模式变量 */
[data-theme='dark'] {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  
  --text-color: #E5EAF3;
  --text-color-secondary: #A3A6AD;
  --text-color-disabled: #6C6E72;
  
  --border-color: #434343;
  --border-color-light: #363636;
  
  --bg-color: #141414;
  --bg-color-overlay: #1D1E1F;
  --bg-color-secondary: #2A2A2C;
}

#app {
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
  min-height: 100vh;
}

/* 全局加载指示器样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  font-size: 48px;
  color: var(--primary-color);
}

.loading-text {
  margin-top: 16px;
  color: white;
  font-size: 16px;
}

/* 暗黑模式 */
.dark-mode {
  color: var(--text-color);
  background-color: var(--bg-color);
}

/* 基础样式重置 */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

a {
  text-decoration: none;
  color: var(--primary-color);
}

/* 屏幕阅读器专用 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式布局辅助 */
@media (max-width: 576px) {
  .hide-xs {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .hide-sm {
    display: none !important;
  }
}

@media (max-width: 992px) {
  .hide-md {
    display: none !important;
  }
}

@media (max-width: 1200px) {
  .hide-lg {
    display: none !important;
  }
}
</style> 