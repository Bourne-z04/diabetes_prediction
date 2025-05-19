<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { aiService } from '@/services/ai'
import MarkdownIt from 'markdown-it'

const router = useRouter()
const authStore = useAuthStore()
const md = new MarkdownIt({ breaks: true })

// 检查用户是否登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

const loading = ref(false)
const error = ref<string | null>(null)
const generatingPlan = ref(false)
const healthPlan = ref<any>(null)

// 用户健康数据
const healthData = reactive({
  age: 30,
  bmi: 22.5,
  insulin: 120,
  skin_thickness: 20,
  glucose: 85,
  diabetesRisk: 0.1
})

// 用户偏好设置
const userPreferences = reactive({
  dietPreference: '',
  exercisePreference: '',
  allergies: '',
  medicalConditions: ''
})

// 当前选中的标签页
const activeTab = ref('dietPlan')

// 格式化的用户偏好
const formattedPreferences = computed(() => {
  const preferences = [];
  
  if (userPreferences.dietPreference) 
    preferences.push(`饮食偏好: ${userPreferences.dietPreference}`);
  
  if (userPreferences.exercisePreference) 
    preferences.push(`运动偏好: ${userPreferences.exercisePreference}`);
  
  if (userPreferences.allergies) 
    preferences.push(`过敏信息: ${userPreferences.allergies}`);
  
  if (userPreferences.medicalConditions) 
    preferences.push(`其他健康状况: ${userPreferences.medicalConditions}`);
  
  return preferences.join('; ');
})

// 加载最新健康数据
async function loadHealthData() {
  loading.value = true;
  try {
    const records = await api.user.getHealthRecords();
    if (records && records.length > 0) {
      const latestRecord = records[0];
      
      // 更新健康数据
      if (latestRecord.health_info) {
        healthData.age = latestRecord.health_info.age;
        healthData.bmi = latestRecord.health_info.bmi;
        healthData.insulin = latestRecord.health_info.insulin;
        healthData.skin_thickness = latestRecord.health_info.skin_thickness;
        healthData.glucose = latestRecord.health_info.glucose;
      }
      
      // 更新风险值
      if (latestRecord.probability !== undefined) {
        healthData.diabetesRisk = latestRecord.probability;
      }
    }
  } catch (err) {
    console.error('加载健康数据失败:', err);
    error.value = '无法加载您的健康数据。请稍后再试或手动输入数据。';
  } finally {
    loading.value = false;
  }
}

// 生成健康方案
async function generateHealthPlan() {
  generatingPlan.value = true;
  error.value = null;
  
  try {
    const response = await aiService.generateHealthPlan({
      ...healthData,
      userPreferences: formattedPreferences.value
    });
    
    if (response && response.choices && response.choices.length > 0) {
      const aiResponse = response.choices[0].message.content;
      
      // 解析AI回复，将其分为多个部分
      const sections = parseResponseIntoSections(aiResponse);
      healthPlan.value = sections;
    } else {
      throw new Error('生成健康方案失败，请稍后再试');
    }
  } catch (err: any) {
    console.error('生成健康方案错误:', err);
    error.value = err.message || '生成健康方案失败，请稍后再试';
  } finally {
    generatingPlan.value = false;
  }
}

// 解析AI回复，将其分为多个部分
function parseResponseIntoSections(response: string) {
  // 这是一个简单的解析方法，可能需要根据实际AI回复格式进行调整
  const sections: Record<string, string> = {
    dietPlan: '',
    exercisePlan: '',
    lifestyleAdjustments: '',
    regularChecks: '',
    riskSignals: '',
    other: ''
  };
  
  // 分割文本为行
  const lines = response.split('\n');
  let currentSection = 'other';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 根据关键词确定当前部分
    if (trimmedLine.match(/^1[\.\s]|饮食|饮食方案|饮食建议|饮食计划/i)) {
      currentSection = 'dietPlan';
      sections[currentSection] += trimmedLine + '\n';
    } else if (trimmedLine.match(/^2[\.\s]|运动|运动计划|运动建议|锻炼/i)) {
      currentSection = 'exercisePlan';
      sections[currentSection] += trimmedLine + '\n';
    } else if (trimmedLine.match(/^3[\.\s]|生活习惯|习惯|生活方式|生活调整/i)) {
      currentSection = 'lifestyleAdjustments';
      sections[currentSection] += trimmedLine + '\n';
    } else if (trimmedLine.match(/^4[\.\s]|检测|检查|监测|定期检测/i)) {
      currentSection = 'regularChecks';
      sections[currentSection] += trimmedLine + '\n';
    } else if (trimmedLine.match(/^5[\.\s]|风险|注意|警示|信号|症状/i)) {
      currentSection = 'riskSignals';
      sections[currentSection] += trimmedLine + '\n';
    } else {
      sections[currentSection] += trimmedLine + '\n';
    }
  }
  
  return sections;
}

// 导出健康方案
function exportHealthPlan() {
  if (!healthPlan.value) return;
  
  // 将所有部分合并为一个字符串
  let content = `# 个性化糖尿病健康管理方案\n\n`;
  content += `## 用户数据\n`;
  content += `- 年龄: ${healthData.age}岁\n`;
  content += `- BMI指数: ${healthData.bmi}\n`;
  content += `- 胰岛素水平: ${healthData.insulin} μU/ml\n`;
  content += `- 皮肤厚度: ${healthData.skin_thickness} mm\n`;
  content += `- 血糖水平: ${healthData.glucose} mg/dL\n`;
  content += `- 糖尿病风险评估: ${(healthData.diabetesRisk * 100).toFixed(1)}%\n\n`;
  
  if (formattedPreferences.value) {
    content += `## 用户偏好\n${formattedPreferences.value}\n\n`;
  }
  
  if (healthPlan.value.dietPlan) {
    content += `## 饮食方案\n${healthPlan.value.dietPlan}\n\n`;
  }
  
  if (healthPlan.value.exercisePlan) {
    content += `## 运动计划\n${healthPlan.value.exercisePlan}\n\n`;
  }
  
  if (healthPlan.value.lifestyleAdjustments) {
    content += `## 生活习惯调整\n${healthPlan.value.lifestyleAdjustments}\n\n`;
  }
  
  if (healthPlan.value.regularChecks) {
    content += `## 定期检测建议\n${healthPlan.value.regularChecks}\n\n`;
  }
  
  if (healthPlan.value.riskSignals) {
    content += `## 需注意的风险信号\n${healthPlan.value.riskSignals}\n\n`;
  }
  
  if (healthPlan.value.other) {
    content += `## 其他建议\n${healthPlan.value.other}\n\n`;
  }
  
  content += `生成日期: ${new Date().toLocaleDateString()}\n`;
  
  // 创建一个下载链接
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `健康管理方案_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 监听预览窗口的创建和解析
const showPreview = ref(false)
const previewContent = ref('')

function togglePreview() {
  showPreview.value = !showPreview.value
  
  if (showPreview.value) {
    let preview = `# 个性化糖尿病健康管理方案\n\n`;
    
    // 添加用户信息
    preview += `## 用户健康数据\n`;
    preview += `- **年龄:** ${healthData.age}岁\n`;
    preview += `- **BMI指数:** ${healthData.bmi}\n`;
    preview += `- **胰岛素水平:** ${healthData.insulin} μU/ml\n`;
    preview += `- **皮肤厚度:** ${healthData.skin_thickness} mm\n`;
    preview += `- **血糖水平:** ${healthData.glucose} mg/dL\n`;
    preview += `- **糖尿病风险评估:** ${(healthData.diabetesRisk * 100).toFixed(1)}%\n\n`;
    
    // 添加用户偏好
    if (formattedPreferences.value) {
      preview += `## 用户偏好\n`;
      preview += formattedPreferences.value.split('; ').map(pref => `- ${pref}`).join('\n');
      preview += `\n\n`;
    }
    
    previewContent.value = preview;
  }
}

// 页面加载时获取健康数据
onMounted(async () => {
  await loadHealthData();
})
</script>

<template>
  <div class="health-plan-page">
    <div class="container py-4">
      <h1 class="mb-4">个性化健康管理方案</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载健康数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else>
        <div class="row g-4 mb-4">
          <!-- 健康数据表单 -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">您的健康数据</h5>
              </div>
              <div class="card-body">
                <p class="mb-3">
                  已从您最近的记录中自动导入数据，您可以根据需要进行调整。
                </p>
                
                <div class="mb-3">
                  <label for="age" class="form-label">年龄</label>
                  <input type="number" id="age" class="form-control" v-model="healthData.age" min="1" max="120" placeholder="例如：35">
                </div>
                
                <div class="mb-3">
                  <label for="bmi" class="form-label">BMI (体重指数)</label>
                  <input type="number" id="bmi" class="form-control" v-model="healthData.bmi" step="0.1" min="10" max="50" placeholder="例如：24.5">
                  <div class="form-text">体重(kg) / 身高²(m)</div>
                </div>
                
                <div class="mb-3">
                  <label for="insulin" class="form-label">胰岛素水平 (μU/ml)</label>
                  <input type="number" id="insulin" class="form-control" v-model="healthData.insulin" min="0" max="1000" placeholder="例如：15 (空腹) 或 50-150 (餐后)">
                </div>
                
                <div class="mb-3">
                  <label for="skin_thickness" class="form-label">皮肤厚度 (mm)</label>
                  <input type="number" id="skin_thickness" class="form-control" v-model="healthData.skin_thickness" min="0" max="100" placeholder="例如：20">
                </div>
                
                <div class="mb-3">
                  <label for="glucose" class="form-label">血糖水平 (mg/dL)</label>
                  <input type="number" id="glucose" class="form-control" v-model="healthData.glucose" min="50" max="500" placeholder="例如：90 (空腹) 或 <140 (餐后2小时)">
                  <div class="form-text">参考范围：空腹 70-100 mg/dL, 餐后两小时 &lt;140 mg/dL</div>
                </div>
                
                <div class="mb-3">
                  <label for="diabetes_risk" class="form-label">糖尿病风险评估</label>
                  <div class="input-group">
                    <input type="number" id="diabetes_risk" class="form-control" v-model="healthData.diabetesRisk" step="0.01" min="0" max="1">
                    <span class="input-group-text">{{ (healthData.diabetesRisk * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="form-text">此数值来自您的预测结果</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 个人偏好表单 -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">个人偏好设置</h5>
                <button class="btn btn-sm btn-outline-primary" @click="togglePreview">
                  <i class="bi" :class="showPreview ? 'bi-eye-slash' : 'bi-eye'"></i>
                  {{ showPreview ? '隐藏预览' : '预览' }}
                </button>
              </div>
              <div class="card-body">
                <div v-if="!showPreview">
                  <p class="mb-3">
                    您的偏好设置将帮助我们生成更加个性化的健康方案。
                  </p>
                  
                  <div class="mb-3">
                    <label for="diet-preference" class="form-label">饮食偏好</label>
                    <select class="form-select" id="diet-preference" v-model="userPreferences.dietPreference">
                      <option value="">请选择...</option>
                      <option value="普通饮食">普通饮食</option>
                      <option value="素食">素食</option>
                      <option value="低碳水饮食">低碳水饮食</option>
                      <option value="地中海饮食">地中海饮食</option>
                      <option value="低脂饮食">低脂饮食</option>
                      <option value="间歇性断食">间歇性断食</option>
                    </select>
                  </div>
                  
                  <div class="mb-3">
                    <label for="exercise-preference" class="form-label">运动偏好</label>
                    <select class="form-select" id="exercise-preference" v-model="userPreferences.exercisePreference">
                      <option value="">请选择...</option>
                      <option value="步行/散步">步行/散步</option>
                      <option value="跑步">跑步</option>
                      <option value="游泳">游泳</option>
                      <option value="骑行">骑行</option>
                      <option value="瑜伽">瑜伽</option>
                      <option value="力量训练">力量训练</option>
                      <option value="团体运动">团体运动</option>
                      <option value="家庭锻炼">家庭锻炼</option>
                      <option value="有行动障碍">有行动障碍</option>
                    </select>
                  </div>
                  
                  <div class="mb-3">
                    <label for="allergies" class="form-label">食物过敏或不耐受</label>
                    <input type="text" id="allergies" class="form-control" v-model="userPreferences.allergies" 
                          placeholder="例如：海鲜、牛奶、小麦等">
                  </div>
                  
                  <div class="mb-3">
                    <label for="medical-conditions" class="form-label">其他健康状况</label>
                    <textarea id="medical-conditions" class="form-control" rows="3" 
                          v-model="userPreferences.medicalConditions"
                          placeholder="例如：高血压、心脏病、肾脏问题等"></textarea>
                  </div>
                </div>
                
                <div v-else class="preview-window">
                  <div class="markdown-preview" v-html="md.render(previewContent)"></div>
                </div>
              </div>
              
              <div class="card-footer">
                <button class="btn btn-primary w-100" @click="generateHealthPlan" :disabled="generatingPlan">
                  <span v-if="generatingPlan" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ generatingPlan ? '正在生成方案...' : '生成个性化健康方案' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 健康方案结果 -->
        <div v-if="healthPlan" class="health-plan-result">
          <div class="card mb-4">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">您的个性化健康管理方案</h5>
                <button class="btn btn-sm btn-success" @click="exportHealthPlan">
                  <i class="bi bi-download me-1"></i> 导出方案
                </button>
              </div>
              
              <ul class="nav nav-tabs card-header-tabs mt-3">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'dietPlan' }" 
                     href="#" @click.prevent="activeTab = 'dietPlan'">
                    <i class="bi bi-cup-hot me-1"></i> 饮食方案
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'exercisePlan' }" 
                     href="#" @click.prevent="activeTab = 'exercisePlan'">
                    <i class="bi bi-activity me-1"></i> 运动计划
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'lifestyleAdjustments' }" 
                     href="#" @click.prevent="activeTab = 'lifestyleAdjustments'">
                    <i class="bi bi-calendar2-check me-1"></i> 生活习惯
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'regularChecks' }" 
                     href="#" @click.prevent="activeTab = 'regularChecks'">
                    <i class="bi bi-clipboard2-pulse me-1"></i> 定期检测
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'riskSignals' }" 
                     href="#" @click.prevent="activeTab = 'riskSignals'">
                    <i class="bi bi-exclamation-triangle me-1"></i> 风险信号
                  </a>
                </li>
              </ul>
            </div>
            
            <div class="card-body">
              <div v-if="activeTab === 'dietPlan'" class="plan-section">
                <div class="markdown-content" v-html="md.render(healthPlan.dietPlan || '暂无饮食建议')"></div>
              </div>
              
              <div v-if="activeTab === 'exercisePlan'" class="plan-section">
                <div class="markdown-content" v-html="md.render(healthPlan.exercisePlan || '暂无运动建议')"></div>
              </div>
              
              <div v-if="activeTab === 'lifestyleAdjustments'" class="plan-section">
                <div class="markdown-content" v-html="md.render(healthPlan.lifestyleAdjustments || '暂无生活习惯调整建议')"></div>
              </div>
              
              <div v-if="activeTab === 'regularChecks'" class="plan-section">
                <div class="markdown-content" v-html="md.render(healthPlan.regularChecks || '暂无定期检测建议')"></div>
              </div>
              
              <div v-if="activeTab === 'riskSignals'" class="plan-section">
                <div class="markdown-content" v-html="md.render(healthPlan.riskSignals || '暂无风险信号提示')"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-plan-page {
  background-color: transparent;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header {
  background-color: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.preview-window {
  background-color: rgba(30, 41, 59, 0.5);
  border-radius: 0.25rem;
  padding: 1rem;
  height: 350px;
  overflow-y: auto;
  color: #fff;
}

.markdown-preview {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #0d6efd;
}

.markdown-content :deep(h2) {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
  color: #0d6efd;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}

.markdown-content :deep(ul) {
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
}

.plan-section {
  padding: 1rem;
}

.nav-tabs .nav-link {
  color: #495057;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  font-weight: 500;
}

.form-select option {
  color: #212529; /* Bootstrap's default dark text color */
  background-color: #fff; /* Ensure background is white */
}

.card-body .form-text {
  color: rgba(255, 255, 255, 0.85); /* Brighter hint text for dark cards */
}
</style> 