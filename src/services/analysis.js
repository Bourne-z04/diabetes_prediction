/**
 * 健康数据分析服务
 * 提供健康数据的分析、预测和数据处理功能
 */

// 计算血糖平均值
export const calculateGlucoseAvg = (records) => {
  if (!records || records.length === 0) return null
  
  const validRecords = records.filter(r => r.glucose)
  if (validRecords.length === 0) return null
  
  const sum = validRecords.reduce((total, record) => total + parseFloat(record.glucose), 0)
  return (sum / validRecords.length).toFixed(1)
}

// 计算体重平均值
export const calculateWeightAvg = (records) => {
  if (!records || records.length === 0) return null
  
  const validRecords = records.filter(r => r.weight)
  if (validRecords.length === 0) return null
  
  const sum = validRecords.reduce((total, record) => total + parseFloat(record.weight), 0)
  return (sum / validRecords.length).toFixed(1)
}

// 计算血压平均值
export const calculateBPAvg = (records) => {
  if (!records || records.length === 0) return null
  
  const validRecords = records.filter(r => r.bloodPressure && r.bloodPressure.includes('/'))
  if (validRecords.length === 0) return null
  
  let systolicSum = 0
  let diastolicSum = 0
  let count = 0
  
  validRecords.forEach(record => {
    const parts = record.bloodPressure.split('/')
    if (parts.length === 2) {
      const systolic = parseInt(parts[0])
      const diastolic = parseInt(parts[1])
      
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        systolicSum += systolic
        diastolicSum += diastolic
        count++
      }
    }
  })
  
  if (count === 0) return null
  
  const systolicAvg = Math.round(systolicSum / count)
  const diastolicAvg = Math.round(diastolicSum / count)
  
  return `${systolicAvg}/${diastolicAvg}`
}

// 评估血糖状态
export const evaluateGlucoseStatus = (value) => {
  if (!value) return { status: 'unknown', description: '数据不足' }
  
  const glucose = parseFloat(value)
  
  if (glucose < 3.9) {
    return { 
      status: 'low', 
      description: '血糖偏低，注意补充能量',
      risk: 'medium'
    }
  } else if (glucose >= 3.9 && glucose <= 6.1) {
    return { 
      status: 'normal', 
      description: '血糖在理想范围',
      risk: 'low'
    }
  } else if (glucose > 6.1 && glucose <= 7.0) {
    return { 
      status: 'borderline', 
      description: '血糖偏高，注意控制饮食',
      risk: 'low'
    }
  } else if (glucose > 7.0 && glucose <= 10.0) {
    return { 
      status: 'high', 
      description: '血糖高于正常范围，控制饮食并增加运动',
      risk: 'medium'
    }
  } else {
    return { 
      status: 'danger', 
      description: '血糖明显偏高，建议咨询医生',
      risk: 'high'
    }
  }
}

// 评估血压状态
export const evaluateBPStatus = (value) => {
  if (!value || !value.includes('/')) return { status: 'unknown', description: '数据不足' }
  
  const parts = value.split('/')
  if (parts.length !== 2) return { status: 'unknown', description: '数据格式错误' }
  
  const systolic = parseInt(parts[0])
  const diastolic = parseInt(parts[1])
  
  if (isNaN(systolic) || isNaN(diastolic)) return { status: 'unknown', description: '数据格式错误' }
  
  // 评估血压
  if (systolic < 90 || diastolic < 60) {
    return { 
      status: 'low', 
      description: '血压偏低',
      risk: 'medium'
    }
  } else if (systolic <= 120 && diastolic <= 80) {
    return { 
      status: 'normal', 
      description: '血压在理想范围',
      risk: 'low'
    }
  } else if (systolic <= 140 && diastolic <= 90) {
    return { 
      status: 'borderline', 
      description: '血压偏高',
      risk: 'low'
    }
  } else {
    return { 
      status: 'high', 
      description: '血压高于正常范围，建议咨询医生',
      risk: 'medium'
    }
  }
}

// 预测未来趋势
export const predictTrend = (records, days = 7) => {
  if (!records || records.length < 3) return []
  
  // 按日期排序
  const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // 提取血糖数据
  const glucoseData = sortedRecords
    .filter(r => r.glucose)
    .map(r => ({ date: new Date(r.date), value: parseFloat(r.glucose) }))
  
  if (glucoseData.length < 3) return []
  
  // 简单线性回归计算趋势
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  const n = glucoseData.length
  
  // 使用时间戳差值作为x轴
  const baseTime = glucoseData[0].date.getTime()
  
  for (let i = 0; i < n; i++) {
    const x = (glucoseData[i].date.getTime() - baseTime) / (1000 * 60 * 60 * 24) // 转换为天数
    const y = glucoseData[i].value
    
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  }
  
  // 计算斜率和截距
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // 生成预测数据
  const lastDate = glucoseData[glucoseData.length - 1].date
  const predictions = []
  
  for (let i = 1; i <= days; i++) {
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + i)
    
    const x = (nextDate.getTime() - baseTime) / (1000 * 60 * 60 * 24)
    const predictedValue = slope * x + intercept
    
    // 限制预测值在合理范围内
    const boundedValue = Math.max(3, Math.min(10, predictedValue))
    
    predictions.push({
      date: nextDate.toISOString().split('T')[0],
      value: parseFloat(boundedValue.toFixed(1))
    })
  }
  
  return predictions
}

// 生成健康建议
export const generateHealthAdvice = (glucoseStatus, bpStatus, records) => {
  const advice = []
  
  // 基于血糖状态的建议
  if (glucoseStatus === 'high' || glucoseStatus === 'danger') {
    advice.push('控制碳水化合物摄入，避免高糖食物')
    advice.push('增加每日运动，每天至少30分钟有氧运动')
    advice.push('定时监测血糖，记录数据变化')
  } else if (glucoseStatus === 'low') {
    advice.push('适当补充含糖食物，预防低血糖发作')
    advice.push('保持规律饮食，不要长时间空腹')
    advice.push('随身携带糖果或葡萄糖片，以防低血糖')
  }
  
  // 基于血压状态的建议
  if (bpStatus === 'high') {
    advice.push('减少盐分摄入，每日盐摄入不超过5克')
    advice.push('保持心情舒畅，避免情绪激动')
    advice.push('戒烟限酒，保持健康生活方式')
  } else if (bpStatus === 'low') {
    advice.push('适当增加盐分摄入，避免突然站立')
    advice.push('多喝水，保持水分充足')
  }
  
  // 通用建议
  advice.push('保持规律作息，确保充足睡眠')
  advice.push('均衡饮食，增加蔬果摄入')
  
  // 如果记录不足，添加记录建议
  if (!records || records.length < 5) {
    advice.push('坚持记录健康数据，以获得更精准的健康分析')
  }
  
  return advice
}

// 计算健康得分
export const calculateHealthScore = (glucoseStatus, bpStatus, completeness) => {
  let score = 80 // 基础分
  
  // 根据血糖状态调整
  switch(glucoseStatus) {
    case 'normal': score += 10; break;
    case 'borderline': score += 0; break;
    case 'high': score -= 10; break;
    case 'low': score -= 8; break;
    case 'danger': score -= 15; break;
    default: break;
  }
  
  // 根据血压状态调整
  switch(bpStatus) {
    case 'normal': score += 10; break;
    case 'borderline': score += 0; break;
    case 'high': score -= 10; break;
    case 'low': score -= 5; break;
    default: break;
  }
  
  // 数据完整度调整
  score += (completeness / 10) // 完整度每10%增加1分
  
  // 限制范围在0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

export default {
  calculateGlucoseAvg,
  calculateWeightAvg,
  calculateBPAvg,
  evaluateGlucoseStatus,
  evaluateBPStatus,
  predictTrend,
  generateHealthAdvice,
  calculateHealthScore
} 