import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "./assets/main.css"
import App from './App.vue'
import router from './router'
import './services/mockApi' // 引入模拟API

// 创建应用实例
const app = createApp(App)

// 全局异常处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)
}

// 注册Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 注册Element Plus
app.use(ElementPlus, { size: 'default' })

// 注册路由
app.use(router)

// 性能监控
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

// 缓存控制
app.config.unwrapInjectedRef = true

// 全局指令 - 应用平滑滚动
app.directive('smooth-scroll', {
  mounted(el, binding) {
    el.addEventListener('click', () => {
      const target = document.querySelector(binding.value)
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  },
  unmounted(el) {
    el.removeEventListener('click')
  }
})

// 挂载应用
app.mount('#app') 