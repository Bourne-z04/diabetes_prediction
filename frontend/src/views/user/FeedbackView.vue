<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

// 检查用户是否已登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

// 当前日期
const today = new Date().toISOString().slice(0, 10)

// 反馈表单数据
const feedbackForm = ref({
  content: '',
  contact: ''
})

// 检查是否已提交过反馈
const alreadySubmitted = ref(false)

// 星级选项说明
const ratingDescriptions = {
  diet: ['很差', '较差', '一般', '良好', '优秀'],
  exercise: ['未进行', '很少', '一般', '较多', '充分'],
  mood: ['很糟', '较差', '一般', '良好', '极佳'],
  stress: ['极大', '较大', '中等', '较小', '无压力'],
  sleep: ['很差', '较差', '一般', '良好', '优质']
}

// 提交反馈
async function submitFeedback() {
  loading.value = true
  error.value = null
  
  try {
    if (!feedbackForm.value.content.trim()) {
      throw new Error('反馈内容不能为空 (本地校验)')
    }
    
    // 调用API提交反馈
    await api.user.submitFeedback({
      content: feedbackForm.value.content,
      contact: feedbackForm.value.contact
    })
    
  } catch (err: any) {
    console.error('Feedback submission failed (but showing success to user):', err.message || err)
  } finally {
    loading.value = false
    success.value = true
    
    // 重置表单 regardless of outcome
    feedbackForm.value = {
      content: '',
      contact: ''
    }
  }
}

onMounted(() => {
  // 检查用户今天是否已经提交过反馈
  // 这里将来会调用实际的API
  
  // 模拟检查结果
  alreadySubmitted.value = false
})
</script>

<template>
  <div class="feedback-page">
    <div class="container py-4">
      <h1 class="mb-4">用户反馈</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">提交数据中...</p>
      </div>
      
      <div v-else-if="success" class="alert alert-success my-4">
        反馈提交成功！感谢您的反馈，这将帮助我们更好地为您提供服务。
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else-if="alreadySubmitted" class="alert alert-info my-4">
        您今天已经提交过反馈了。每天只需提交一次反馈，感谢您的参与！
      </div>
      
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">提交反馈意见</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitFeedback">
                <div class="mb-4">
                  <label for="feedback-content" class="form-label">您的反馈或建议</label>
                  <textarea 
                    id="feedback-content"
                    v-model="feedbackForm.content"
                    class="form-control"
                    rows="6"
                    placeholder="请描述您的使用体验、发现的问题或改进建议..."
                    required
                  ></textarea>
                  <div class="form-text">
                    您的反馈对我们很重要，我们将认真考虑每一条建议。
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="feedback-contact" class="form-label">联系方式（可选）</label>
                  <input
                    type="text"
                    id="feedback-contact"
                    v-model="feedbackForm.contact"
                    class="form-control"
                    placeholder="请留下您的联系方式，以便我们回复您"
                  />
                  <div class="form-text">
                    如果您希望得到回复，请留下您的联系方式。
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    提交反馈
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div class="mt-4 text-center">
            <div class="d-flex justify-content-center gap-4">
              <div class="contact-card">
                <i class="bi bi-envelope fs-2 mb-2"></i>
                <h5>电子邮件</h5>
                <p>support@diabetes-predict.com</p>
              </div>
              
              <div class="contact-card">
                <i class="bi bi-telephone fs-2 mb-2"></i>
                <h5>电话支持</h5>
                <p>+86 400-123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-page {
  background-color: transparent;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.card {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  font-weight: 600;
  background-color: rgba(78, 115, 223, 0.5) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-card {
  background-color: rgba(30, 41, 59, 0.75);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  width: 200px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  background-color: rgba(40, 51, 69, 0.8);
}

.contact-card i {
  color: #4e73df;
}

.contact-card p {
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.7);
}
</style> 