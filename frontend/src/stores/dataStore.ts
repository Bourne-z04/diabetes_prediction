import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
  // 数据上传状态
  const isDataUploaded = ref(false)
  
  // 模拟数据
  const diabetesData = ref<any[]>([])
  
  // 上传时间
  const uploadDate = ref<Date | null>(null)
  
  // 统计数据
  const dataStatistics = ref({
    totalRecords: 0,
    diabeticCount: 0,
    nonDiabeticCount: 0,
    averageAge: 0,
    averageBMI: 0,
    averageGlucose: 0
  })
  
  // 用户数据
  const users = ref<any[]>([])
  
  // 用户活动趋势数据
  const userActivityTrend = ref<{
    labels: string[];
    datasets: Array<{ label: string; data: number[]; borderColor: string; tension: number; backgroundColor?: string; fill?: boolean }>
  } | null>(null)
  
  // 糖尿病记录分布数据
  const diabetesDistribution = ref<{
    labels: string[];
    datasets: Array<{ data: number[]; backgroundColor: string[] }>
  } | null>(null)
  
  // 计算属性: 糖尿病比率
  const diabetesRatio = computed(() => {
    if (dataStatistics.value.totalRecords === 0) return 0
    return (dataStatistics.value.diabeticCount / dataStatistics.value.totalRecords) * 100
  })
  
  // 重置数据
  function resetData() {
    isDataUploaded.value = false
    diabetesData.value = []
    uploadDate.value = null
    users.value = []
    dataStatistics.value = {
      totalRecords: 0,
      diabeticCount: 0,
      nonDiabeticCount: 0,
      averageAge: 0,
      averageBMI: 0,
      averageGlucose: 0
    }
  }
  
  // 模拟上传后的数据生成
  function generateMockData() {
    // 设置上传状态
    isDataUploaded.value = true
    uploadDate.value = new Date()
    
    // 生成糖尿病数据 (基于上传的CSV结构)
    diabetesData.value = Array.from({ length: 769 }, (_, index) => {
      // 第一行是标题，跳过
      if (index === 0) return null
      
      const randomOutcome = Math.random() > 0.65 ? 0 : 1
      return {
        id: index,
        pregnancies: Math.floor(Math.random() * 17),
        glucose: Math.floor(Math.random() * 150) + 70,
        bloodPressure: Math.floor(Math.random() * 50) + 50,
        skinThickness: Math.floor(Math.random() * 50),
        insulin: Math.floor(Math.random() * 300),
        bmi: parseFloat((Math.random() * 25 + 20).toFixed(1)),
        diabetesPedigreeFunction: parseFloat((Math.random() * 2).toFixed(3)),
        age: Math.floor(Math.random() * 40) + 20,
        outcome: randomOutcome
      }
    }).filter(Boolean)
    
    // 计算统计数据
    const totalRecords = diabetesData.value.length
    const diabeticCount = diabetesData.value.filter(record => record.outcome === 1).length
    const nonDiabeticCount = totalRecords - diabeticCount
    
    const ageSum = diabetesData.value.reduce((sum, record) => sum + record.age, 0)
    const bmiSum = diabetesData.value.reduce((sum, record) => sum + parseFloat(record.bmi), 0)
    const glucoseSum = diabetesData.value.reduce((sum, record) => sum + record.glucose, 0)
    
    dataStatistics.value = {
      totalRecords,
      diabeticCount,
      nonDiabeticCount,
      averageAge: Math.round(ageSum / totalRecords),
      averageBMI: parseFloat((bmiSum / totalRecords).toFixed(1)),
      averageGlucose: Math.round(glucoseSum / totalRecords)
    }
    
    // 生成模拟用户数据
    generateMockUsers()
    // 生成图表数据
    generateChartData()
  }
  
  // 生成模拟用户数据
  function generateMockUsers() {
    const userNames = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '孙九', '周十',
                      '杨明', '吴芳', '郑浩', '钱伟', '孔亮', '曹颖', '冯强', '朱琳',
                      '韩刚', '秦丽', '胡瑜', '唐杰', '沈琪', '宋涛', '陆健', '蒋元',
                      '黄越', '魏超', '贾诚', '姜风', '范雪', '方刚']
    
    users.value = Array.from({ length: 30 }, (_, index) => {
      const joinDate = new Date()
      joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365))
      
      return {
        id: index + 1,
        name: userNames[index],
        email: `user${index + 1}@example.com`,
        role: Math.random() > 0.8 ? '管理员' : '用户',
        status: Math.random() > 0.2 ? '激活' : '未激活',
        joinDate: joinDate.toISOString().split('T')[0],
        dataCount: Math.floor(Math.random() * 50) + 1,
        lastLogin: Math.random() > 0.3 
          ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] 
          : null
      }
    })
  }
  
  // 生成图表数据
  function generateChartData() {
    // 1. 用户活动趋势 (过去7天)
    const activityLabels: string[] = []
    const newUsersData: number[] = []
    const loginsData: number[] = []
    const submissionsData: number[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      activityLabels.push(`${date.getMonth() + 1}/${date.getDate()}`)
      newUsersData.push(Math.floor(Math.random() * 5) + (i === 0 ? 2 : 0)) // 最近一天多一些
      loginsData.push(Math.floor(Math.random() * 30) + 10 + (i === 0 ? 5 : 0))
      submissionsData.push(Math.floor(Math.random() * 15) + 5 + (i === 0 ? 3 : 0))
    }

    userActivityTrend.value = {
      labels: activityLabels,
      datasets: [
        {
          label: '新用户',
          data: newUsersData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: '登录次数',
          data: loginsData,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: '数据提交',
          data: submissionsData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    }

    // 2. 糖尿病记录分布
    diabetesDistribution.value = {
      labels: ['阳性记录', '阴性记录'],
      datasets: [
        {
          data: [dataStatistics.value.diabeticCount, dataStatistics.value.nonDiabeticCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ]
        }
      ]
    }
  }
  
  return { 
    isDataUploaded, 
    diabetesData, 
    uploadDate, 
    dataStatistics, 
    users,
    diabetesRatio,
    resetData, 
    generateMockData,
    userActivityTrend,
    diabetesDistribution
  }
}) 