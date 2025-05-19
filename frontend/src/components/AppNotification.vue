<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timestamp: Date
}

const notifications = ref<Notification[]>([])
let counter = 0

// 添加通知
function addNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const id = counter++
  
  notifications.value.push({
    id,
    message,
    type,
    timestamp: new Date()
  })
  
  // 3秒后自动移除
  setTimeout(() => {
    removeNotification(id)
  }, 3000)
}

// 移除通知
function removeNotification(id: number) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// 处理传统app.js中的消息事件
function handleAppMessage(event: CustomEvent) {
  const { message, type } = event.detail
  addNotification(message, type)
}

// 组件挂载和卸载时注册/移除事件监听
onMounted(() => {
  document.addEventListener('app-message', handleAppMessage as EventListener)
})

onUnmounted(() => {
  document.removeEventListener('app-message', handleAppMessage as EventListener)
})

// 向外暴露方法，允许其他Vue组件直接调用
defineExpose({
  addNotification
})
</script>

<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="[`notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <i 
            class="bi" 
            :class="{
              'bi-check-circle-fill': notification.type === 'success',
              'bi-exclamation-triangle-fill': notification.type === 'warning',
              'bi-info-circle-fill': notification.type === 'info',
              'bi-x-circle-fill': notification.type === 'error'
            }"
          ></i>
        </div>
        <div class="notification-content">{{ notification.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 350px;
  max-width: 90vw;
}

.notification {
  display: flex;
  align-items: flex-start;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  border-left: 4px solid #4e73df;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.notification:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #1cc88a;
}

.notification-error {
  border-left-color: #e74a3b;
}

.notification-warning {
  border-left-color: #f6c23e;
}

.notification-info {
  border-left-color: #4e73df;
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 15px;
  font-size: 1.2em;
}

.notification-success .notification-icon {
  color: #1cc88a;
}

.notification-error .notification-icon {
  color: #e74a3b;
}

.notification-warning .notification-icon {
  color: #f6c23e;
}

.notification-info .notification-icon {
  color: #4e73df;
}

.notification-content {
  flex: 1;
  line-height: 1.4;
}

/* 动画效果 */
.notification-enter-active, 
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 