import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getHealthRecords } from '../services/user'
import * as analysisService from '../services/analysis'

export const useHealthStore = defineStore('health', () => {
  // 状态
  const healthRecords = ref([])
  const recordsLoaded = ref(false)
  const loading = ref(false)
  const lastFetchTime = ref(null)
  const currentPeriod = ref('month')
  
  // 缓存过期时间（毫秒）
  const CACHE_EXPIRATION = 5 * 60 * 1000 // 5分钟
  
  // 获取健康数据
  const fetchHealthRecords = async (forceRefresh = false) => {
    // 检查是否应该使用缓存
    const now = Date.now()
    const shouldUseCached = 
      !forceRefresh && 
      recordsLoaded.value && 
      lastFetchTime.value && 
      (now - lastFetchTime.value < CACHE_EXPIRATION)
    
    if (shouldUseCached) return healthRecords.value
    
    loading.value = true
    
    try {
      const response = await getHealthRecords({
        dateRange: currentPeriod.value
      })
      
      if (response.data && response.data.records) {
        healthRecords.value = response.data.records
      } else if (Array.isArray(response.data)) {
        healthRecords.value = response.data
      } else {
        healthRecords.value = []
      }
      
      recordsLoaded.value = true
      lastFetchTime.value = now
    } catch (error) {
      console.error('获取健康数据失败:', error)
      healthRecords.value = []
    } finally {
      loading.value = false
    }
    
    return healthRecords.value
  }
  
  // 变更时间周期
  const setPeriod = (period) => {
    if (currentPeriod.value !== period) {
      currentPeriod.value = period
      // 强制刷新数据
      return fetchHealthRecords(true)
    }
    return healthRecords.value
  }
  
  // 计算属性 - 血糖平均值
  const glucoseAvg = computed(() => {
    return analysisService.calculateGlucoseAvg(healthRecords.value)
  })
  
  // 计算属性 - 体重平均值
  const weightAvg = computed(() => {
    return analysisService.calculateWeightAvg(healthRecords.value)
  })
  
  // 计算属性 - 血压平均值
  const bpAvg = computed(() => {
    return analysisService.calculateBPAvg(healthRecords.value)
  })
  
  // 计算属性 - 血糖状态
  const glucoseStatus = computed(() => {
    if (!glucoseAvg.value) return { status: 'unknown', description: '数据不足' }
    return analysisService.evaluateGlucoseStatus(glucoseAvg.value)
  })
  
  // 计算属性 - 血压状态
  const bpStatus = computed(() => {
    if (!bpAvg.value) return { status: 'unknown', description: '数据不足' }
    return analysisService.evaluateBPStatus(bpAvg.value)
  })
  
  // 计算属性 - 记录完整度
  const recordCompleteness = computed(() => {
    if (healthRecords.value.length === 0) return 0
    
    let completeCount = 0
    healthRecords.value.forEach(record => {
      let itemComplete = 0
      if (record.glucose) itemComplete++
      if (record.weight) itemComplete++
      if (record.bloodPressure) itemComplete++
      
      completeCount += (itemComplete / 3)
    })
    
    return Math.round((completeCount / healthRecords.value.length) * 100)
  })
  
  // 计算属性 - 健康建议
  const healthAdvice = computed(() => {
    return analysisService.generateHealthAdvice(
      glucoseStatus.value.status,
      bpStatus.value.status,
      healthRecords.value
    )
  })
  
  // 计算属性 - 健康预测
  const healthPrediction = computed(() => {
    return analysisService.predictTrend(healthRecords.value)
  })
  
  // 计算属性 - 健康得分
  const healthScore = computed(() => {
    return analysisService.calculateHealthScore(
      glucoseStatus.value.status,
      bpStatus.value.status,
      recordCompleteness.value
    )
  })
  
  // 添加健康记录
  const addRecord = (record) => {
    healthRecords.value.unshift(record)
  }
  
  // 更新健康记录
  const updateRecord = (recordId, updatedData) => {
    const index = healthRecords.value.findIndex(r => r.id === recordId)
    if (index !== -1) {
      healthRecords.value[index] = { ...healthRecords.value[index], ...updatedData }
    }
  }
  
  // 删除健康记录
  const deleteRecord = (recordId) => {
    const index = healthRecords.value.findIndex(r => r.id === recordId)
    if (index !== -1) {
      healthRecords.value.splice(index, 1)
    }
  }
  
  // 清除缓存，强制刷新
  const clearCache = () => {
    recordsLoaded.value = false
    lastFetchTime.value = null
  }
  
  return {
    healthRecords,
    loading,
    recordsLoaded,
    currentPeriod,
    glucoseAvg,
    weightAvg,
    bpAvg,
    glucoseStatus,
    bpStatus,
    recordCompleteness,
    healthAdvice,
    healthPrediction,
    healthScore,
    fetchHealthRecords,
    setPeriod,
    addRecord,
    updateRecord,
    deleteRecord,
    clearCache
  }
}) 