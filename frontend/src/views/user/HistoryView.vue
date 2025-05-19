<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)

// 检查用户是否已登录
if (!authStore.isAuthenticated) {
  router.push('/login')
}

// 模拟血糖数据(每日更新)
const bloodSugarData = ref([
  { date: '2023-12-01', value: 5.6 },
  { date: '2023-12-02', value: 6.2 },
  { date: '2023-12-03', value: 5.9 },
  { date: '2023-12-04', value: 5.7 },
  { date: '2023-12-05', value: 6.0 },
  { date: '2023-12-06', value: 5.8 },
  { date: '2023-12-07', value: 6.1 },
])

// 模拟体征数据(每周更新)
const bodyMeasurements = ref([
  { date: '2023-11-08', weight: 69.5, waistline: 82, hipline: 95 },
  { date: '2023-11-15', weight: 69.0, waistline: 81, hipline: 94 },
  { date: '2023-11-22', weight: 68.5, waistline: 81, hipline: 94 },
  { date: '2023-11-29', weight: 68.0, waistline: 80, hipline: 93 },
  { date: '2023-12-06', weight: 67.5, waistline: 79, hipline: 93 },
])

// 模拟医嘱和体检报告数据
const medicalRecords = ref([
  { date: '2023-10-15', type: '体检报告', content: '血常规、肝功能、肾功能基本正常，HbA1c: 6.8%，血脂偏高，建议加强饮食控制和运动。' },
  { date: '2023-11-02', type: '医嘱', content: '根据您的血糖监测情况，建议调整口服降糖药剂量，增加阿卡波糖每次50mg，每日三次。请注意监测空腹血糖变化。' },
  { date: '2023-12-01', type: '体检报告', content: 'HbA1c下降至6.5%，血脂有所改善，继续保持目前的治疗方案，三个月后复查。' },
])

const activeTab = ref('bloodSugar')

onMounted(() => {
  // 这里可以加载实际的历史数据
  console.log('HistoryView加载完成')
})
</script>

<template>
  <div class="history-page">
    <div class="container py-4">
      <h1 class="mb-4">历史健康记录</h1>
      
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <div v-else>
        <!-- 导航标签 -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'bloodSugar' }" @click.prevent="activeTab = 'bloodSugar'" href="#">空腹血糖记录</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'bodyMeasurements' }" @click.prevent="activeTab = 'bodyMeasurements'" href="#">体征测量记录</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'medicalRecords' }" @click.prevent="activeTab = 'medicalRecords'" href="#">医嘱与体检报告</a>
          </li>
        </ul>
        
        <!-- 空腹血糖记录 -->
        <div class="card" v-if="activeTab === 'bloodSugar'">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">每日空腹血糖记录</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>空腹血糖 (mmol/L)</th>
                    <th>状态评估</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in bloodSugarData" :key="index">
                    <td>{{ record.date }}</td>
                    <td>{{ record.value }}</td>
                    <td>
                      <span :class="record.value < 6.1 ? 'badge bg-success' : (record.value < 7.0 ? 'badge bg-warning' : 'badge bg-danger')">
                        {{ record.value < 6.1 ? '正常' : (record.value < 7.0 ? '偏高' : '高') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 体征测量记录 -->
        <div class="card" v-if="activeTab === 'bodyMeasurements'">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">每周体征测量记录</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>体重 (kg)</th>
                    <th>腰围 (cm)</th>
                    <th>臀围 (cm)</th>
                    <th>腰臀比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in bodyMeasurements" :key="index">
                    <td>{{ record.date }}</td>
                    <td>{{ record.weight }}</td>
                    <td>{{ record.waistline }}</td>
                    <td>{{ record.hipline }}</td>
                    <td>{{ (record.waistline / record.hipline).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 医嘱与体检报告 -->
        <div class="card" v-if="activeTab === 'medicalRecords'">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">医嘱与体检报告记录</h5>
          </div>
          <div class="card-body">
            <div class="accordion" id="medicalRecordsAccordion">
              <div class="accordion-item" v-for="(record, index) in medicalRecords" :key="index">
                <h2 class="accordion-header">
                  <button class="accordion-button" :class="{ collapsed: index !== 0 }" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" :aria-expanded="index === 0" :aria-controls="'collapse' + index">
                    {{ record.date }} - {{ record.type }}
                  </button>
                </h2>
                <div :id="'collapse' + index" class="accordion-collapse collapse" :class="{ show: index === 0 }" data-bs-parent="#medicalRecordsAccordion">
                  <div class="accordion-body">
                    {{ record.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.nav-link {
  cursor: pointer;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card-header {
  font-weight: 600;
}

.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.accordion-button:not(.collapsed) {
  background-color: rgba(255, 193, 7, 0.1);
  color: #212529;
}
</style> 