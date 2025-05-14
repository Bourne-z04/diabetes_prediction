<template>
  <div class="feedback-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>用户反馈</h1>
      </div>
      
      <el-card class="feedback-card">
        <template #header>
          <div class="card-header">
            <span>提交您的反馈意见</span>
          </div>
        </template>
        
        <el-form 
          ref="feedbackFormRef"
          :model="feedbackForm"
          :rules="feedbackRules"
          label-width="100px"
          :disabled="submitting"
        >
          <!-- 满意度评分 -->
          <el-form-item label="总体评分" prop="rating">
            <el-rate
              v-model="feedbackForm.rating"
              :colors="rateColors"
              show-text
              :texts="rateTexts"
            />
          </el-form-item>
          
          <!-- 体验评价 -->
          <el-form-item label="使用体验" prop="experienceRating">
            <div class="rating-items">
              <div class="rating-item" v-for="(item, index) in experienceItems" :key="index">
                <span class="rating-label">{{ item.label }}：</span>
                <el-rate
                  v-model="feedbackForm.experienceRating[item.key]"
                  :colors="rateColors"
                />
              </div>
            </div>
          </el-form-item>
          
          <!-- 反馈类型 -->
          <el-form-item label="反馈类型" prop="feedbackType">
            <el-select v-model="feedbackForm.feedbackType" placeholder="请选择反馈类型" style="width: 100%">
              <el-option
                v-for="item in feedbackTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 反馈内容 -->
          <el-form-item label="反馈内容" prop="content">
            <el-input
              v-model="feedbackForm.content"
              type="textarea"
              :rows="4"
              placeholder="请详细描述您的问题或建议..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 需求建议 -->
          <el-form-item label="功能需求" prop="featureRequests">
            <el-checkbox-group v-model="feedbackForm.featureRequests">
              <el-checkbox v-for="item in featureOptions" :key="item.value" :label="item.value">
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <!-- 联系方式 -->
          <el-form-item label="联系方式" prop="contact">
            <el-input
              v-model="feedbackForm.contact"
              placeholder="如需回复，请留下您的联系方式（选填）"
            />
          </el-form-item>
          
          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" @click="submitFeedback" :loading="submitting">
              提交反馈
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card class="feedback-history-card" v-if="feedbackHistory.length > 0">
        <template #header>
          <div class="card-header">
            <span>历史反馈</span>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in feedbackHistory"
            :key="index"
            :timestamp="item.date"
            :type="getFeedbackTimelineType(item.rating)"
          >
            <div class="history-feedback-item">
              <div class="feedback-header">
                <h4>{{ getFeedbackTypeLabel(item.feedbackType) }}</h4>
                <el-rate
                  v-model="item.rating"
                  disabled
                  :colors="rateColors"
                />
              </div>
              <p class="feedback-content">{{ item.content }}</p>
              
              <div class="feedback-reply" v-if="item.reply">
                <h4>管理员回复：</h4>
                <p>{{ item.reply }}</p>
                <span class="reply-time">{{ item.replyTime }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
    
    <!-- 提交成功对话框 -->
    <el-dialog
      v-model="successDialogVisible"
      title="反馈提交成功"
      width="400px"
    >
      <div class="success-dialog">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <p>感谢您的反馈！我们会认真考虑您的建议。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="successDialogVisible = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitFeedback as submitFeedbackAPI } from '../../services/user'
import NavBar from '../../components/NavBar.vue'
import { CircleCheck } from '@element-plus/icons-vue'

// 表单引用
const feedbackFormRef = ref(null)

// 加载状态
const submitting = ref(false)
const successDialogVisible = ref(false)

// 评分颜色和文本
const rateColors = ['#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#67C23A']
const rateTexts = ['非常不满意', '不满意', '一般', '满意', '非常满意']

// 体验项目
const experienceItems = [
  { label: '系统易用性', key: 'usability' },
  { label: '功能完整性', key: 'completeness' },
  { label: '界面美观度', key: 'design' },
  { label: '响应速度', key: 'performance' }
]

// 反馈类型
const feedbackTypes = [
  { label: '功能建议', value: 'feature' },
  { label: '问题反馈', value: 'bug' },
  { label: '使用咨询', value: 'question' },
  { label: '界面设计', value: 'design' },
  { label: '其他', value: 'other' }
]

// 功能需求选项
const featureOptions = [
  { label: '健康饮食推荐', value: 'dietRecommendation' },
  { label: '健康数据分析统计', value: 'dataAnalysis' },
  { label: '用药提醒功能', value: 'medicationReminder' },
  { label: '与医生在线咨询', value: 'doctorConsultation' },
  { label: '社区交流功能', value: 'community' },
  { label: '运动记录追踪', value: 'exerciseTracking' }
]

// 反馈表单
const feedbackForm = reactive({
  rating: 3,
  experienceRating: {
    usability: 3,
    completeness: 3,
    design: 3,
    performance: 3
  },
  feedbackType: '',
  content: '',
  featureRequests: [],
  contact: ''
})

// 表单验证规则
const feedbackRules = {
  rating: [
    { required: true, message: '请评分', trigger: 'change' }
  ],
  feedbackType: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
}

// 历史反馈（模拟数据）
const feedbackHistory = ref([
  {
    date: '2023-11-10',
    feedbackType: 'feature',
    rating: 4,
    content: '希望能增加健康食谱推荐功能，方便参考每日的饮食安排。',
    reply: '感谢您的建议，我们正在规划相关功能，预计下个版本会推出。',
    replyTime: '2023-11-11'
  },
  {
    date: '2023-10-25',
    feedbackType: 'bug',
    rating: 2,
    content: '数据同步有问题，有时候输入的血糖记录无法保存。',
    reply: '非常抱歉给您带来不便，我们已修复此问题，请更新到最新版本。',
    replyTime: '2023-10-26'
  }
])

// 获取反馈类型标签
const getFeedbackTypeLabel = (type) => {
  const found = feedbackTypes.find(item => item.value === type)
  return found ? found.label : type
}

// 获取反馈时间线类型
const getFeedbackTimelineType = (rating) => {
  if (rating >= 4) return 'success'
  if (rating >= 3) return 'primary'
  if (rating >= 2) return 'warning'
  return 'danger'
}

// 重置表单
const resetForm = () => {
  if (feedbackFormRef.value) {
    feedbackFormRef.value.resetFields()
  }
}

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return
  
  await feedbackFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        // 准备提交数据
        const submitData = {
          ...feedbackForm,
          feedback_date: new Date().toISOString().split('T')[0]
        }
        
        // 实际API调用
        // await submitFeedback(submitData)
        
        // 模拟成功提交
        setTimeout(() => {
          // 提交成功后重置表单
          resetForm()
          
          // 显示成功对话框
          successDialogVisible.value = true
          
          // 将新提交的反馈添加到历史记录中（实际应从后端获取）
          feedbackHistory.value.unshift({
            date: submitData.feedback_date,
            feedbackType: submitData.feedbackType,
            rating: submitData.rating,
            content: submitData.content
          })
          
          submitting.value = false
        }, 1000)
      } catch (error) {
        console.error('提交反馈失败:', error)
        ElMessage.error('提交失败，请稍后重试')
        submitting.value = false
      }
    }
  })
}

// 获取历史反馈
const fetchFeedbackHistory = async () => {
  try {
    // 实际API调用
    // const response = await getFeedbackHistory()
    // feedbackHistory.value = response.data
    
    // 这里使用模拟数据，实际项目中应从API获取
  } catch (error) {
    console.error('获取反馈历史失败:', error)
    ElMessage.error('获取反馈历史失败，请稍后重试')
  }
}

// 生命周期钩子
onMounted(() => {
  fetchFeedbackHistory()
})
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
}

.feedback-card {
  margin-bottom: 20px;
}

.feedback-history-card {
  margin-top: 30px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

/* 评分项样式 */
.rating-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
}

.rating-label {
  min-width: 80px;
  color: var(--text-color-secondary);
}

/* 历史反馈样式 */
.history-feedback-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-header h4 {
  margin: 0;
  color: var(--text-color);
}

.feedback-content {
  margin: 10px 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.feedback-reply {
  background-color: #f0f9eb;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
}

.feedback-reply h4 {
  margin: 0 0 8px 0;
  color: var(--success-color);
  font-size: 14px;
}

.feedback-reply p {
  margin: 0;
  color: var(--text-color);
  font-size: 14px;
}

.reply-time {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 5px;
}

/* 成功对话框样式 */
.success-dialog {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 60px;
  color: var(--success-color);
  margin-bottom: 20px;
}

.success-dialog p {
  font-size: 16px;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .rating-items {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .feedback-header h4 {
    margin-bottom: 10px;
  }
}
</style> 