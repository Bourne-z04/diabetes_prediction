<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showChat = ref(false)
const message = ref('')
const loading = ref(false)
const chatHistory = ref<{type: 'user' | 'assistant', content: string, timestamp: Date}[]>([])

// 获取当前用户的问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  let timeGreeting = '你好'
  
  if (hour < 6) {
    timeGreeting = '凌晨好'
  } else if (hour < 9) {
    timeGreeting = '早上好'
  } else if (hour < 12) {
    timeGreeting = '上午好'
  } else if (hour < 14) {
    timeGreeting = '中午好'
  } else if (hour < 17) {
    timeGreeting = '下午好'
  } else if (hour < 22) {
    timeGreeting = '晚上好'
  } else {
    timeGreeting = '夜深了'
  }
  
  return `${timeGreeting}，${authStore.user?.username || '朋友'}！我是您的AI健康助手，有什么可以帮您的吗？`
})

// 打开/关闭聊天窗口
function toggleChat() {
  showChat.value = !showChat.value
  
  // 如果是首次打开，添加AI助手的问候语
  if (showChat.value && chatHistory.value.length === 0) {
    chatHistory.value.push({
      type: 'assistant',
      content: greeting.value,
      timestamp: new Date()
    })
  }
}

// 发送消息
async function sendMessage() {
  if (!message.value.trim()) return
  
  const userMessage = message.value.trim()
  
  // 添加用户消息到聊天历史
  chatHistory.value.push({
    type: 'user',
    content: userMessage,
    timestamp: new Date()
  })
  
  // 清空输入框
  message.value = ''
  
  // 显示加载状态
  loading.value = true
  
  try {
    // 这里将来会调用实际的AI服务API
    // 以下是模拟响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let response: string
    
    if (userMessage.includes('血糖') || userMessage.includes('糖尿病')) {
      response = '对于糖尿病患者，保持稳定的血糖水平非常重要。建议定期监测血糖，遵医嘱用药，保持健康饮食和适量运动。'
    } else if (userMessage.includes('饮食') || userMessage.includes('吃')) {
      response = '糖尿病患者的饮食应该控制总热量，限制精制碳水化合物的摄入，增加高纤维食物，选择低GI食物，合理分配三餐，定时定量。'
    } else if (userMessage.includes('运动') || userMessage.includes('锻炼')) {
      response = '适当的运动对控制血糖有很大帮助。建议每周进行至少150分钟的中等强度有氧运动，如快走、游泳或骑自行车，每周还应安排2-3次的肌肉力量训练。'
    } else if (userMessage.includes('药物') || userMessage.includes('药')) {
      response = '请务必按照医生的处方用药，不要自行调整剂量或停药。如有任何不适，请及时咨询医生。'
    } else {
      response = '感谢您的提问！作为您的健康助手，我可以为您提供糖尿病管理、饮食建议、运动指导等相关信息。请问您有什么具体的健康问题需要了解吗？'
    }
    
    // 添加AI助手响应到聊天历史
    chatHistory.value.push({
      type: 'assistant',
      content: response,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('AI响应错误', error)
    
    // 添加错误消息
    chatHistory.value.push({
      type: 'assistant',
      content: '抱歉，我遇到了一些问题，请稍后再试。',
      timestamp: new Date()
    })
  } finally {
    loading.value = false
    
    // 滚动到最新消息
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }
}

// 打开时滚动到底部
function scrollToBottom() {
  setTimeout(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, 100)
}
</script>

<template>
  <div class="ai-assistant">
    <!-- 悬浮按钮 -->
    <button class="chat-toggle-btn" @click="toggleChat">
      <i :class="showChat ? 'fas fa-times' : 'fas fa-robot'"></i>
      <span class="visually-hidden">AI助手</span>
    </button>
    
    <!-- 聊天窗口 -->
    <div class="chat-window" :class="{ 'chat-window-active': showChat }" @click="scrollToBottom">
      <div class="chat-header">
        <div class="d-flex align-items-center">
          <i class="fas fa-robot me-2"></i>
          <span>AI健康助手</span>
        </div>
        <button class="close-btn" @click.stop="toggleChat">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="chat-messages">
        <div 
          v-for="(chat, index) in chatHistory" 
          :key="index" 
          class="message" 
          :class="chat.type === 'user' ? 'user-message' : 'assistant-message'"
        >
          <div class="message-content">
            {{ chat.content }}
          </div>
          <div class="message-time">
            {{ chat.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
        
        <div v-if="loading" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          type="text" 
          v-model="message" 
          @keyup.enter="sendMessage" 
          placeholder="输入问题，例如：如何控制血糖？" 
          :disabled="loading"
        >
        <button @click="sendMessage" :disabled="loading || !message.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4e73df;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-toggle-btn:hover {
  transform: scale(1.05);
  background-color: #3a5bc7;
}

.chat-window {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 70vh;
  max-height: 700px;
  background-color: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: scale(0);
  opacity: 0;
  transform-origin: bottom right;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-window-active {
  transform: scale(1);
  opacity: 1;
}

.chat-header {
  background-color: #4e73df;
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: rgba(22, 31, 46, 0.5);
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
  clear: both;
}

.user-message {
  float: right;
}

.assistant-message {
  float: left;
}

.message-content {
  padding: 8px 15px;
  border-radius: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.user-message .message-content {
  background-color: #4e73df;
  color: white;
  border-top-right-radius: 4px;
}

.assistant-message .message-content {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 5px;
  text-align: right;
}

.chat-input {
  padding: 10px;
  display: flex;
  background-color: rgba(30, 41, 59, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin-right: 10px;
  outline: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chat-input button {
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-input button:hover {
  background-color: #3a5bc7;
}

.chat-input button:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  padding: 6px 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  width: fit-content;
  margin-bottom: 15px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #b0bec5;
  display: block;
  border-radius: 50%;
  margin: 0 2px;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: pulse 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation: pulse 1s infinite 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation: pulse 1s infinite 0.4s;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
}

@media (max-width: 576px) {
  .chat-window {
    width: calc(100% - 40px);
    height: 60vh;
  }
}
</style> 