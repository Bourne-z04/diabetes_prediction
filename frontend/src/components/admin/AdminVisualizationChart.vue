<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

// 接收属性
const props = defineProps<{
  data: any
  selectedColumns: string[]
  chartType: 'scatter' | 'bar' | 'box' | 'histogram'
  compareBy: string
}>()

// 图表容器引用
const chartContainer = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<any>(null)

// 在组件挂载后初始化图表
onMounted(() => {
  // 确保在浏览器环境中执行
  if (typeof window !== 'undefined') {
    // 动态导入 Chart.js
    import('chart.js').then(async (ChartJS) => {
      // 注册必要的组件
      ChartJS.Chart.register(
        ChartJS.CategoryScale,
        ChartJS.LinearScale,
        ChartJS.PointElement,
        ChartJS.LineElement,
        ChartJS.BarElement,
        ChartJS.Tooltip,
        ChartJS.Legend
      )
      
      // 初始化图表
      renderChart(ChartJS.Chart)
    }).catch(error => {
      console.error('加载Chart.js失败:', error)
    })
  }
})

// 监听数据和图表类型变化，重新渲染图表
watch([() => props.data, () => props.chartType, () => props.compareBy], () => {
  if (props.data) {
    // 在下一个更新周期重新渲染图表
    nextTick(() => {
      // 动态导入 Chart.js
      import('chart.js').then(async (ChartJS) => {
        renderChart(ChartJS.Chart)
      }).catch(error => {
        console.error('加载Chart.js失败:', error)
      })
    })
  }
})

// 渲染图表
function renderChart(Chart: any) {
  if (!chartContainer.value) return
  
  // 如果已存在图表实例，销毁它
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  // 根据图表类型渲染不同的图表
  switch (props.chartType) {
    case 'scatter':
      renderScatterChart(Chart)
      break
    case 'bar':
      renderBarChart(Chart)
      break
    case 'box':
      renderBoxPlot(Chart)
      break
    case 'histogram':
      renderHistogram(Chart)
      break
  }
}

// 渲染散点图
function renderScatterChart(Chart: any) {
  if (!chartContainer.value || props.selectedColumns.length < 2) return
  
  // 获取 Canvas 上下文
  const ctx = chartContainer.value.getContext('2d')
  if (!ctx) return
  
  // 准备数据
  const x = props.selectedColumns[0]
  const y = props.selectedColumns.length > 1 ? props.selectedColumns[1] : x
  
  // 图表数据
  let datasets = []
  
  if (props.compareBy) {
    // 按比较因子分组
    const groupedData = groupDataByFactor(props.data, props.compareBy)
    
    // 为每个组创建数据集
    for (const groupName in groupedData) {
      datasets.push({
        label: `${groupName}`,
        data: groupedData[groupName].map((item: any) => ({
          x: item[x],
          y: item[y]
        })),
        backgroundColor: getColorForGroup(groupName)
      })
    }
  } else {
    // 单一数据集
    datasets = [{
      label: `${y} vs ${x}`,
      data: props.data.map((item: any) => ({
        x: item[x],
        y: item[y]
      })),
      backgroundColor: 'rgba(78, 115, 223, 0.5)'
    }]
  }
  
  // 创建图表
  chartInstance.value = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: x,
            color: 'rgba(255, 255, 255, 0.7)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          title: {
            display: true,
            text: y,
            color: 'rgba(255, 255, 255, 0.7)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      }
    }
  })
}

// 渲染柱状图
function renderBarChart(Chart: any) {
  if (!chartContainer.value || props.selectedColumns.length === 0) return
  
  // 获取 Canvas 上下文
  const ctx = chartContainer.value.getContext('2d')
  if (!ctx) return
  
  // 准备数据
  const selectedColumn = props.selectedColumns[0]
  let labels = []
  let datasets = []
  
  if (props.compareBy) {
    // 按比较因子分组
    const groupedData = groupDataByFactor(props.data, props.compareBy)
    
    // 收集所有组
    const groups = Object.keys(groupedData)
    
    // 为每个组创建数据集
    datasets = props.selectedColumns.map((col, i) => {
      const data = groups.map(group => {
        // 计算组内均值
        const values = groupedData[group].map((item: any) => item[col])
        return calculateMean(values)
      })
      
      return {
        label: col,
        data,
        backgroundColor: getChartColors(i),
        borderWidth: 1
      }
    })
    
    labels = groups
  } else {
    // 单列柱状图
    if (props.selectedColumns.length === 1) {
      // 计算简单统计信息：最小值、平均值、最大值
      const values = props.data.map((item: any) => item[selectedColumn])
      labels = ['最小值', '平均值', '最大值']
      datasets = [{
        label: selectedColumn,
        data: [
          Math.min(...values),
          calculateMean(values),
          Math.max(...values)
        ],
        backgroundColor: [
          'rgba(231, 74, 59, 0.7)',
          'rgba(78, 115, 223, 0.7)',
          'rgba(28, 200, 138, 0.7)'
        ],
        borderWidth: 1
      }]
    } else {
      // 多列柱状图
      labels = props.selectedColumns
      datasets = [{
        label: '平均值',
        data: props.selectedColumns.map(col => {
          const values = props.data.map((item: any) => item[col])
          return calculateMean(values)
        }),
        backgroundColor: props.selectedColumns.map((_, i) => getChartColors(i)),
        borderWidth: 1
      }]
    }
  }
  
  // 创建图表
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff'
        }
      }
    }
  })
}

// 渲染箱线图 (实际上是简单模拟)
function renderBoxPlot(Chart: any) {
  // 简单模拟箱线图
  renderBarChart(Chart)
}

// 渲染直方图 (实际上是简单模拟)
function renderHistogram(Chart: any) {
  // 简单模拟直方图
  renderBarChart(Chart)
}

// 辅助函数 - 按因子分组数据
function groupDataByFactor(data: any[], factor: string) {
  return data.reduce((groups: any, item: any) => {
    const group = item[factor]?.toString() || 'undefined'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {})
}

// 辅助函数 - 根据组名获取颜色
function getColorForGroup(groupName: string) {
  const colors: Record<string, string> = {
    '0': 'rgba(28, 200, 138, 0.7)', // 绿色
    '1': 'rgba(231, 74, 59, 0.7)',  // 红色
    'true': 'rgba(231, 74, 59, 0.7)',
    'false': 'rgba(28, 200, 138, 0.7)',
    'undefined': 'rgba(78, 115, 223, 0.7)' // 蓝色
  }
  
  return colors[groupName] || `hsl(${Math.random() * 360}, 70%, 60%)`
}

// 辅助函数 - 获取图表颜色
function getChartColors(index: number) {
  const colors = [
    'rgba(78, 115, 223, 0.7)',  // 蓝色
    'rgba(28, 200, 138, 0.7)',  // 绿色
    'rgba(246, 194, 62, 0.7)',  // 黄色
    'rgba(231, 74, 59, 0.7)',   // 红色
    'rgba(54, 185, 204, 0.7)',  // 青色
    'rgba(133, 135, 150, 0.7)'  // 灰色
  ]
  
  return colors[index % colors.length]
}

// 辅助函数 - 计算平均值
function calculateMean(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
</script>

<template>
  <div class="chart-wrapper">
    <canvas ref="chartContainer"></canvas>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
}
</style> 