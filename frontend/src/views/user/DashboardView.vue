<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { aiService } from '@/services/ai'

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

// 健康数据表单
const healthForm = reactive({
  age: 30,
  bmi: 22.5,
  insulin: 120,
  skin_thickness: 20,
  glucose: 85
})

// 预测结果
const predictionResult = ref<any>(null)
const predictionLoading = ref(false)

// 糖尿病风险等级计算
const riskLevel = computed(() => {
  if (!predictionResult.value) return null;
  
  const probability = predictionResult.value.probability;
  if (probability < 0.3) return { level: '低风险', color: 'success' };
  if (probability < 0.7) return { level: '中等风险', color: 'warning' };
  return { level: '高风险', color: 'danger' };
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
    // 加载历史消息
    loadChatHistory()
    
    // 获取最新健康记录
    await loadLatestHealthRecord()
  } catch (err: any) {
    error.value = err.message || '加载数据时发生错误'
  } finally {
    loading.value = false
  }
})

// 加载最新健康记录
async function loadLatestHealthRecord() {
  try {
    const records = await api.user.getHealthRecords()
    if (records && records.length > 0) {
      const latestRecord = records[0]
      
      // 更新健康表单数据
      if (latestRecord.health_info) {
        healthForm.age = latestRecord.health_info.age
        healthForm.bmi = latestRecord.health_info.bmi
        healthForm.insulin = latestRecord.health_info.insulin
        healthForm.skin_thickness = latestRecord.health_info.skin_thickness
        healthForm.glucose = latestRecord.health_info.glucose
      }
      
      // 设置最后上传时间
      userStats.lastUpload = new Date(latestRecord.created_at).toLocaleString()
      
      // 加载预测结果
      predictionResult.value = {
        probability: latestRecord.probability,
        model_details: latestRecord.model_details,
        health_info: latestRecord.health_info
      }
    }
  } catch (error) {
    console.error('加载最新健康记录失败:', error)
  }
}

// 提交健康数据
async function submitHealthData() {
  predictionLoading.value = true
  try {
    // 保存健康数据
    await api.user.saveHealthInfo(healthForm)
    
    // 获取预测结果
    const result = await api.user.getPrediction()
    predictionResult.value = result
    
    // 更新最后上传时间
    userStats.lastUpload = new Date().toLocaleString()
    
    // 添加AI助手欢迎消息
    if (result.probability >= 0.5) {
      aiChat.messages.push({
        sender: 'ai',
        content: `您的糖尿病风险评估结果为${(result.probability * 100).toFixed(1)}%，属于较高风险。建议您咨询医生并定期检查。有任何问题请随时向我咨询。`,
        time: new Date().toLocaleTimeString()
      })
    }
  } catch (err: any) {
    error.value = err.message || '提交健康数据失败'
  } finally {
    predictionLoading.value = false
  }
}

// 导出预测结果
async function exportPredictionData() {
  if (!predictionResult.value) return;
  
  try {
    const exportData = await api.user.exportPrediction();
    
    // 创建一个下载链接
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `diabetes_prediction_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('导出预测结果失败:', err);
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
    // 构建带有健康数据上下文的提示词
    let contextPrompt = userMessage;
    
    // 如果存在预测结果，添加相关信息作为上下文
    if (predictionResult.value) {
      contextPrompt = `用户健康数据：
- 年龄: ${healthForm.age}岁
- BMI: ${healthForm.bmi}
- 胰岛素水平: ${healthForm.insulin} μU/ml
- 皮肤厚度: ${healthForm.skin_thickness} mm
- 血糖水平: ${healthForm.glucose} mg/dL
- 糖尿病风险评估: ${(predictionResult.value.probability * 100).toFixed(1)}%

用户问题: ${userMessage}`;
    }
    
    // 直接调用前端AI服务
    const response = await aiService.chat(contextPrompt);
    
    // 添加AI回复
    if (response && response.choices && response.choices.length > 0) {
      const aiResponse = response.choices[0].message.content;
      
      // 格式化AI回复，改善显示效果
      const formattedResponse = formatAIResponse(aiResponse);
      
      aiChat.messages.push({
        sender: 'ai',
        content: formattedResponse,
        time: new Date().toLocaleTimeString()
      });
    } else {
      throw new Error('无效的AI响应');
    }
  } catch (err: any) {
    console.error('AI聊天错误:', err);
    // 添加错误消息
    aiChat.messages.push({
      sender: 'ai',
      content: '抱歉，处理您的请求时发生错误。请稍后再试。',
      time: new Date().toLocaleTimeString()
    });
  } finally {
    aiChat.loading = false;
    
    // 滚动到底部
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}

// 格式化AI回复，提高可读性
function formatAIResponse(text: string): string {
  // 替换Markdown风格的列表和标题，使其在聊天界面中更美观
  let formatted = text
    .replace(/\n\s*-\s/g, '\n• ') // 将Markdown列表转换为圆点
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗文本
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体文本
    .replace(/^# (.*?)$/gm, '<h3>$1</h3>') // h1标题
    .replace(/^## (.*?)$/gm, '<h4>$1</h4>') // h2标题
    .replace(/^### (.*?)$/gm, '<h5>$1</h5>'); // h3标题
  
  // 处理换行
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
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
        
        <!-- 糖尿病风险预测区域 -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">健康数据输入</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="submitHealthData">
                  <div class="mb-3">
                    <label for="age" class="form-label">年龄</label>
                    <input type="number" class="form-control" id="age" v-model="healthForm.age" min="1" max="120" required placeholder="例如：35">
                  </div>
                  
                  <div class="mb-3">
                    <label for="bmi" class="form-label">BMI (体重指数)</label>
                    <input type="number" class="form-control" id="bmi" v-model="healthForm.bmi" step="0.1" min="10" max="50" required placeholder="例如：24.5">
                    <small class="form-hint-text">计算方法: 体重(kg) / 身高²(m)</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="insulin" class="form-label">胰岛素水平 (μU/ml)</label>
                    <input type="number" class="form-control" id="insulin" v-model="healthForm.insulin" min="0" max="1000" required placeholder="例如：空腹 2-25, 餐后酌情增加">
                  </div>
                  
                  <div class="mb-3">
                    <label for="skin_thickness" class="form-label">皮肤厚度 (mm)</label>
                    <input type="number" class="form-control" id="skin_thickness" v-model="healthForm.skin_thickness" min="0" max="100" required placeholder="例如：三头肌皮褶厚度">
                  </div>
                  
                  <div class="mb-3">
                    <label for="glucose" class="form-label">血糖水平 (mg/dL)</label>
                    <input type="number" class="form-control" id="glucose" v-model="healthForm.glucose" min="50" max="500" required placeholder="例如：空腹 70-100, 餐后两小时 <140">
                    <small class="form-hint-text">参考范围：空腹 70-100 mg/dL, 餐后两小时 &lt;140 mg/dL</small>
                  </div>
                  
                  <button type="submit" class="btn btn-primary w-100" :disabled="predictionLoading">
                    <span v-if="predictionLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    计算糖尿病风险
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">糖尿病风险评估结果</h5>
              </div>
              <div class="card-body d-flex flex-column">
                <div v-if="!predictionResult" class="text-center my-auto py-5">
                  <i class="bi bi-clipboard-data fs-1 text-muted mb-3"></i>
                  <p class="text-muted">请输入您的健康数据进行风险评估</p>
                </div>
                
                <div v-else class="risk-result">
                  <div class="text-center mb-4">
                    <div class="risk-meter">
                      <div class="risk-indicator" :style="{ transform: `rotate(${predictionResult.probability * 180}deg)` }"></div>
                      <div class="risk-value">{{ (predictionResult.probability * 100).toFixed(1) }}%</div>
                    </div>
                    
                    <h4 class="mt-3">
                      <span :class="`badge bg-${riskLevel?.color}`">{{ riskLevel?.level }}</span>
                    </h4>
                  </div>
                  
                  <div class="models-info">
                    <h6 class="mb-2">模型分析详情:</h6>
                    <div class="table-responsive">
                      <table class="table table-sm table-dark">
                        <thead>
                          <tr>
                            <th>模型</th>
                            <th>风险概率</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(result, model) in predictionResult.model_details" :key="model">
                            <td>{{ model }}</td>
                            <td>{{ (result.probability * 100).toFixed(1) }}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div class="mt-auto">
                    <button class="btn btn-outline-success w-100" @click="exportPredictionData">
                      <i class="bi bi-download me-1"></i> 导出预测结果
                    </button>
                  </div>
                </div>
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
                <button class="btn btn-sm btn-outline-light" @click="clearChat">
                  <i class="bi bi-trash me-1"></i>清空记录
                </button>
              </div>
              <div class="card-body">
                <div class="chat-container">
                  <div class="chat-messages">
                    <div v-for="(message, index) in aiChat.messages" :key="index" 
                         :class="['chat-message', message.sender === 'user' ? 'user-message' : 'ai-message']">
                      <div class="message-content">
                        <p v-if="message.sender === 'user'">{{ message.content }}</p>
                        <p v-else v-html="message.content"></p>
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
                    <router-link to="/user/history" class="quick-access-item">
                      <i class="bi bi-graph-up"></i>
                      <p>历史记录</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/user/profile" class="quick-access-item">
                      <i class="bi bi-person-gear"></i>
                      <p>个人资料</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/user/feedback" class="quick-access-item">
                      <i class="bi bi-chat-dots"></i>
                      <p>反馈意见</p>
                    </router-link>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <router-link to="/health-plan" class="quick-access-item">
                      <i class="bi bi-clipboard2-check"></i>
                      <p>健康方案</p>
                    </router-link>
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
}

.chat-message {
  display: flex;
  max-width: 75%;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.user-message .message-content {
  background-color: #4e73df;
  border-bottom-right-radius: 0.25rem;
}

.ai-message .message-content {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom-left-radius: 0.25rem;
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
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-access-item {
  display: block;
  text-decoration: none;
  color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.05);
  height: 100%;
}

.quick-access-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.quick-access-item i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.quick-access-item p {
  margin-bottom: 0;
  font-weight: 500;
}

/* 风险评估结果样式 */
.risk-result {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.risk-meter {
  position: relative;
  width: 200px;
  height: 100px;
  margin: 0 auto;
  background: conic-gradient(
    from 180deg,
    #28a745 0deg,
    #ffc107 90deg,
    #dc3545 180deg
  );
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  overflow: hidden;
}

.risk-meter::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 0;
  background-color: rgba(30, 41, 59, 0.85);
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
}

.risk-indicator {
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 2px;
  height: 60px;
  background-color: #fff;
  transform-origin: bottom center;
  z-index: 10;
  transition: transform 0.8s ease-out;
}

.risk-value {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 10;
}

.models-info {
  margin-top: 1.5rem;
}

.form-hint-text {
  color: rgba(255, 255, 255, 0.85); /* Brighter hint text for dark cards */
  display: block; /* Ensure it takes its own line if needed */
  margin-top: 0.25rem; /* Add some space above */
}
</style> 