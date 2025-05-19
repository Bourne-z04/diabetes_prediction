<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useDataStore } from '@/stores/dataStore'

// 获取数据存储
const dataStore = useDataStore()

// 图表初始化完成标志
const chartsInitialized = ref(false)

// 在组件挂载后初始化图表
onMounted(() => {
  if (typeof window !== 'undefined') {
    import('chart.js/auto').then(ChartModule => {
      const Chart = ChartModule.default
      initCharts(Chart)
      chartsInitialized.value = true
    }).catch(error => {
      console.error('加载Chart.js失败:', error)
    })
  }
})

// 监听数据变化，更新图表
watchEffect(() => {
  if (chartsInitialized.value && dataStore.isDataUploaded) {
    updateCharts()
  }
})

// 初始化所有图表
let userActivityTrendChart: any = null
let diabetesDistributionChart: any = null

function initCharts(Chart: any) {
  // 用户活动趋势图表
  const userActivityCtx = document.getElementById('userActivityTrendChart') as HTMLCanvasElement
  if (userActivityCtx && dataStore.userActivityTrend) {
    userActivityTrendChart = new Chart(userActivityCtx, {
      type: 'line',
      data: dataStore.userActivityTrend,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    })
  }

  // 糖尿病记录分布图表
  const diabetesDistCtx = document.getElementById('diabetesDistributionChart') as HTMLCanvasElement
  if (diabetesDistCtx && dataStore.diabetesDistribution) {
    diabetesDistributionChart = new Chart(diabetesDistCtx, {
      type: 'pie',
      data: dataStore.diabetesDistribution,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context: any) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                  const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                  label += `${context.formattedValue} (${percentage}%)`;
                }
                return label;
              }
            }
          }
        }
      }
    })
  }
}

// 更新图表数据
function updateCharts() {
  if (userActivityTrendChart && dataStore.userActivityTrend) {
    userActivityTrendChart.data = dataStore.userActivityTrend
    userActivityTrendChart.update()
  }

  if (diabetesDistributionChart && dataStore.diabetesDistribution) {
    diabetesDistributionChart.data = dataStore.diabetesDistribution
    diabetesDistributionChart.update()
  }
}
</script>

<template>
  <div v-if="dataStore.isDataUploaded" class="row g-4 mb-4">
    <!-- 用户活动趋势图表 -->
    <div class="col-lg-7 col-xl-8">
      <div class="card bg-dark border-0 shadow h-100">
        <div class="card-header py-3">
          <h6 class="m-0 fw-bold">用户活动趋势 (过去7天)</h6>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height: 320px;">
            <canvas id="userActivityTrendChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 糖尿病记录分布图表 -->
    <div class="col-lg-5 col-xl-4">
      <div class="card bg-dark border-0 shadow h-100">
        <div class="card-header py-3">
          <h6 class="m-0 fw-bold">糖尿病记录分布</h6>
        </div>
        <div class="card-body">
          <div class="chart-container d-flex justify-content-center align-items-center" style="height: 320px;">
            <canvas id="diabetesDistributionChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-5 text-muted">
    <i class="bi bi-bar-chart-line fs-1 mb-3"></i>
    <p>上传数据后将在此处显示图表分析。</p>
  </div>
</template>

<style scoped>
.card {
  background-color: rgba(30, 41, 59, 0.8) !important;
  backdrop-filter: blur(10px);
  border-radius: 5px;
  overflow: hidden;
}

.card-header {
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-container {
  position: relative;
  width: 100%;
}
</style> 