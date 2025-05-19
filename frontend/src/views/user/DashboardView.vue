<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 检查用户是否登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

const user = authStore.user
const loading = ref(false)
const error = ref<string | null>(null)

// 用户统计数据
const userStats = reactive({
  totalPlans: 0,
  activePlans: 0,
  completedPlans: 0,
  averageBloodSugar: 0,
  bloodSugarTrend: 'stable', // stable, up, down
  lastUpload: '-'
})

// AI助手相关数据
const aiChat = reactive({
  messages: [] as {sender: string, content: string, time: string}[],
  newMessage: '',
  loading: false
})

// 初始化页面
onMounted(async () => {
  loading.value = true
  try {
    // 获取用户统计数据
    const stats = await getUserStats()
    Object.assign(userStats, stats)
    
    // 加载历史消息
    loadChatHistory()
  } catch (err: any) {
    error.value = err.message || '加载数据时发生错误'
  } finally {
    loading.value = false
  }
})

// 获取用户统计数据的模拟函数
async function getUserStats() {
  // 实际项目中应该从API获取这些数据
  return {
    totalPlans: 12,
    activePlans: 3,
    completedPlans: 9,
    averageBloodSugar: 6.2,
    bloodSugarTrend: 'down',
    lastUpload: '2023-11-15 08:30'
  }
}

// 加载聊天历史
function loadChatHistory() {
  // 模拟一些历史消息
  aiChat.messages = [
    {
      sender: 'ai',
      content: '您好！我是您的AI健康助手，有任何关于糖尿病管理的问题，都可以向我咨询。',
      time: new Date(Date.now() - 3600000).toLocaleTimeString()
    },
    {
      sender: 'user',
      content: '我需要了解II型糖尿病患者的饮食禁忌有哪些？',
      time: new Date(Date.now() - 3000000).toLocaleTimeString()
    },
    {
      sender: 'ai',
      content: 'II型糖尿病患者饮食应注意控制总热量，限制精制碳水化合物摄入，如白米饭、白面包、含糖饮料等。建议增加膳食纤维摄入，选择低GI食物，控制脂肪特别是饱和脂肪的摄入，每餐保持营养均衡。具体来说，应避免：含糖饮料、甜点、精制淀粉类食物、高脂肪食物、过多盐分。建议咨询营养师获取个性化的饮食计划。',
      time: new Date(Date.now() - 2900000).toLocaleTimeString()
    }
  ]
}

// 发送消息给AI助手
async function sendMessage() {
  if (!aiChat.newMessage.trim()) return
  
  const userMessage = aiChat.newMessage.trim()
  aiChat.newMessage = ''
  
  // 添加用户消息
  aiChat.messages.push({
    sender: 'user',
    content: userMessage,
    time: new Date().toLocaleTimeString()
  })
  
  // 设置加载状态
  aiChat.loading = true
  
  try {
    // 调用AI API
    const response = await api.ai.query({ message: userMessage })
    
    // 添加AI回复
    aiChat.messages.push({
      sender: 'ai',
      content: response.reply || '抱歉，我现在无法回答这个问题。',
      time: new Date().toLocaleTimeString()
    })
  } catch (err: any) {
    // 添加错误消息
    aiChat.messages.push({
      sender: 'ai',
      content: '抱歉，处理您的请求时发生错误。请稍后再试。',
      time: new Date().toLocaleTimeString()
    })
  } finally {
    aiChat.loading = false
    
    // 滚动到底部
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }
}

// 清空聊天记录
function clearChat() {
  aiChat.messages = [{
    sender: 'ai',
    content: '聊天记录已清空。有任何问题请随时向我咨询。',
    time: new Date().toLocaleTimeString()
  }]
}
</script>

<template>
  <div class="user-dashboard">
    <!-- 固定背景 -->
    <div class="fixed-background"></div>
    
    <div class="container py-4">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <template v-else>
        <!-- 欢迎区域 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card welcome-card">
              <div class="card-body">
                <h2 class="card-title">欢迎回来，{{ user?.username }}！</h2>
                <p class="card-text">
                  今天是 {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 信息卡片 -->
        <div class="row mb-4">
          <!-- 活跃健康方案 -->
          <div class="col-md-4 mb-4">
            <div class="card stat-card">
              <div class="card-body">
                <div class="stat-icon">
                  <i class="bi bi-clipboard2-check"></i>
                </div>
                <h5 class="card-title">活跃健康方案</h5>
                <p class="stat-value">{{ userStats.activePlans }}</p>
                <p class="card-text">共 {{ userStats.totalPlans }} 个方案</p>
                <router-link to="/health-plan" class="btn btn-sm btn-outline-primary">查看方案</router-link>
              </div>
            </div>
          </div>
          
          <!-- 血糖记录 -->
          <div class="col-md-4 mb-4">
            <div class="card stat-card">
              <div class="card-body">
                <div class="stat-icon">
                  <i class="bi bi-heart-pulse"></i>
                </div>
                <h5 class="card-title">平均血糖水平</h5>
                <p class="stat-value">{{ userStats.averageBloodSugar }} mmol/L</p>
                <p class="card-text">
                  <i :class="[
                    'bi', 
                    {'bi-arrow-down text-success': userStats.bloodSugarTrend === 'down'},
                    {'bi-arrow-up text-danger': userStats.bloodSugarTrend === 'up'},
                    {'bi-dash text-warning': userStats.bloodSugarTrend === 'stable'}
                  ]"></i>
                  {{ userStats.bloodSugarTrend === 'down' ? '下降趋势' : 
                     userStats.bloodSugarTrend === 'up' ? '上升趋势' : '保持稳定' }}
                </p>
                <router-link to="/user/history" class="btn btn-sm btn-outline-primary">查看历史</router-link>
              </div>
            </div>
          </div>
          
          <!-- 最近数据 -->
          <div class="col-md-4 mb-4">
            <div class="card stat-card">
              <div class="card-body">
                <div class="stat-icon">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <h5 class="card-title">最近数据更新</h5>
                <p class="stat-value">{{ userStats.lastUpload }}</p>
                <p class="card-text">已完成 {{ userStats.completedPlans }} 个健康方案</p>
                <button class="btn btn-sm btn-outline-primary">上传数据</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI健康助手 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-robot me-2"></i>AI健康助手
                </h5>
                <button class="btn btn-sm btn-outline-danger" @click="clearChat">
                  <i class="bi bi-trash me-1"></i>清空记录
                </button>
              </div>
              <div class="card-body">
                <div class="chat-container">
                  <div class="chat-messages">
                    <div v-for="(message, index) in aiChat.messages" :key="index" 
                         :class="['chat-message', message.sender === 'user' ? 'user-message' : 'ai-message']">
                      <div class="message-content">
                        <p>{{ message.content }}</p>
                        <small class="message-time">{{ message.time }}</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="chat-input">
                    <form @submit.prevent="sendMessage">
                      <div class="input-group">
                        <input type="text" class="form-control" 
                               placeholder="输入问题..." 
                               v-model="aiChat.newMessage" 
                               :disabled="aiChat.loading">
                        <button class="btn btn-primary" type="submit" :disabled="aiChat.loading">
                          <span v-if="aiChat.loading" class="spinner-border spinner-border-sm" 
                                role="status" aria-hidden="true"></span>
                          <i v-else class="bi bi-send"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快速访问 -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">快速访问</h5>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/health-plan" class="quick-access-item">
                      <i class="bi bi-clipboard2-list"></i>
                      <p>健康方案</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/user/profile" class="quick-access-item">
                      <i class="bi bi-person-gear"></i>
                      <p>个人资料</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/user/history" class="quick-access-item">
                      <i class="bi bi-graph-up"></i>
                      <p>历史数据</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <a href="#" class="quick-access-item" @click.prevent="authStore.logout">
                      <i class="bi bi-box-arrow-right"></i>
                      <p>退出登录</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.user-dashboard {
  position: relative;
  min-height: 100vh;
}

.fixed-background {
  background-image: url('@/assets/images/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

.fixed-background::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: -1;
}

.container {
  position: relative;
  z-index: 1;
}

.welcome-card {
  background-color: rgba(78, 115, 223, 0.8);
  color: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card {
  background-color: rgba(30, 41, 59, 0.75);
  color: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card {
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  background-color: rgba(40, 51, 69, 0.8);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #fff;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.chat-message {
  display: flex;
  margin-bottom: 0.5rem;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  position: relative;
}

.user-message .message-content {
  background-color: rgba(78, 115, 223, 0.8);
  color: white;
  border-bottom-right-radius: 5px;
}

.ai-message .message-content {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-bottom-left-radius: 5px;
}

.message-content p {
  margin-bottom: 0.25rem;
}

.message-time {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  text-align: right;
}

.chat-input {
  padding: 0.5rem 0;
}

.quick-access-item {
  display: block;
  text-decoration: none;
  color: #fff;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5rem;
}

.quick-access-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.quick-access-item i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.btn-outline-primary {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline-primary:hover {
  background-color: rgba(78, 115, 223, 0.5);
  border-color: transparent;
}

.btn-outline-danger {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline-danger:hover {
  background-color: rgba(220, 53, 69, 0.5);
  border-color: transparent;
}

.btn-primary {
  background-color: rgba(78, 115, 223, 0.8);
  border-color: transparent;
}

.btn-primary:hover {
  background-color: rgba(78, 115, 223, 1);
}

.form-control {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-color: rgba(78, 115, 223, 0.5);
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
</style> 