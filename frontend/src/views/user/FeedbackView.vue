<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

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
  date: today,
  dietRating: 3,
  exerciseRating: 3,
  moodRating: 3,
  stressRating: 3,
  sleepRating: 3,
  comment: ''
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
  success.value = false
  
  try {
    // 这里将来会调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    console.log('提交反馈:', feedbackForm.value)
    success.value = true
    
    // 重置表单
    feedbackForm.value = {
      date: today,
      dietRating: 3,
      exerciseRating: 3,
      moodRating: 3,
      stressRating: 3,
      sleepRating: 3,
      comment: ''
    }
  } catch (err: any) {
    error.value = err.message || '提交反馈失败'
  } finally {
    loading.value = false
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
      
      <div v-else class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">每日健康反馈表</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitFeedback">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="feedbackDate" class="form-label">日期</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="feedbackDate" 
                    v-model="feedbackForm.date"
                    :max="today"
                  >
                </div>
              </div>
            </div>
            
            <!-- 饮食评分 -->
            <div class="rating-section mb-4">
              <label class="form-label">今日饮食评分</label>
              <div class="d-flex align-items-center">
                <div class="rating">
                  <template v-for="i in 5" :key="`diet-${i}`">
                    <input 
                      type="radio" 
                      :id="`diet-${i}`" 
                      name="dietRating" 
                      :value="i" 
                      v-model="feedbackForm.dietRating"
                      class="rating-input"
                    >
                    <label :for="`diet-${i}`" class="rating-star">
                      <i class="fas fa-star"></i>
                    </label>
                  </template>
                </div>
                <span class="ms-3 rating-description">
                  {{ ratingDescriptions.diet[feedbackForm.dietRating - 1] }}
                </span>
              </div>
              <small class="form-text text-muted">评价今天的饮食控制情况</small>
            </div>
            
            <!-- 运动评分 -->
            <div class="rating-section mb-4">
              <label class="form-label">今日运动评分</label>
              <div class="d-flex align-items-center">
                <div class="rating">
                  <template v-for="i in 5" :key="`exercise-${i}`">
                    <input 
                      type="radio" 
                      :id="`exercise-${i}`" 
                      name="exerciseRating" 
                      :value="i" 
                      v-model="feedbackForm.exerciseRating"
                      class="rating-input"
                    >
                    <label :for="`exercise-${i}`" class="rating-star">
                      <i class="fas fa-star"></i>
                    </label>
                  </template>
                </div>
                <span class="ms-3 rating-description">
                  {{ ratingDescriptions.exercise[feedbackForm.exerciseRating - 1] }}
                </span>
              </div>
              <small class="form-text text-muted">评价今天的运动量</small>
            </div>
            
            <!-- 心情评分 -->
            <div class="rating-section mb-4">
              <label class="form-label">今日心情评分</label>
              <div class="d-flex align-items-center">
                <div class="rating">
                  <template v-for="i in 5" :key="`mood-${i}`">
                    <input 
                      type="radio" 
                      :id="`mood-${i}`" 
                      name="moodRating" 
                      :value="i" 
                      v-model="feedbackForm.moodRating"
                      class="rating-input"
                    >
                    <label :for="`mood-${i}`" class="rating-star">
                      <i class="fas fa-star"></i>
                    </label>
                  </template>
                </div>
                <span class="ms-3 rating-description">
                  {{ ratingDescriptions.mood[feedbackForm.moodRating - 1] }}
                </span>
              </div>
              <small class="form-text text-muted">评价今天的整体心情</small>
            </div>
            
            <!-- 压力评分 -->
            <div class="rating-section mb-4">
              <label class="form-label">今日压力评分</label>
              <div class="d-flex align-items-center">
                <div class="rating">
                  <template v-for="i in 5" :key="`stress-${i}`">
                    <input 
                      type="radio" 
                      :id="`stress-${i}`" 
                      name="stressRating" 
                      :value="i" 
                      v-model="feedbackForm.stressRating"
                      class="rating-input"
                    >
                    <label :for="`stress-${i}`" class="rating-star">
                      <i class="fas fa-star"></i>
                    </label>
                  </template>
                </div>
                <span class="ms-3 rating-description">
                  {{ ratingDescriptions.stress[feedbackForm.stressRating - 1] }}
                </span>
              </div>
              <small class="form-text text-muted">评价今天感受到的压力程度</small>
            </div>
            
            <!-- 睡眠评分 -->
            <div class="rating-section mb-4">
              <label class="form-label">昨晚睡眠评分</label>
              <div class="d-flex align-items-center">
                <div class="rating">
                  <template v-for="i in 5" :key="`sleep-${i}`">
                    <input 
                      type="radio" 
                      :id="`sleep-${i}`" 
                      name="sleepRating" 
                      :value="i" 
                      v-model="feedbackForm.sleepRating"
                      class="rating-input"
                    >
                    <label :for="`sleep-${i}`" class="rating-star">
                      <i class="fas fa-star"></i>
                    </label>
                  </template>
                </div>
                <span class="ms-3 rating-description">
                  {{ ratingDescriptions.sleep[feedbackForm.sleepRating - 1] }}
                </span>
              </div>
              <small class="form-text text-muted">评价昨晚的睡眠质量</small>
            </div>
            
            <!-- 其他意见 -->
            <div class="form-group mb-4">
              <label for="comment" class="form-label">其他意见或建议</label>
              <textarea 
                class="form-control" 
                id="comment" 
                rows="3" 
                placeholder="请输入您的其他意见或建议（选填）"
                v-model="feedbackForm.comment"
              ></textarea>
            </div>
            
            <div class="text-center">
              <button type="submit" class="btn btn-primary btn-lg">
                <i class="fas fa-paper-plane me-2"></i>提交反馈
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rating {
  display: flex;
  flex-direction: row-reverse;
  gap: 0.2rem;
}

.rating-input {
  display: none;
}

.rating-star {
  cursor: pointer;
  font-size: 1.5rem;
  color: #ddd;
  transition: color 0.2s;
}

.rating-input:checked ~ .rating-star,
.rating-star:hover,
.rating-star:hover ~ .rating-star {
  color: #ffc107;
}

.rating-description {
  min-width: 60px;
}

.rating-section {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
}
</style> 