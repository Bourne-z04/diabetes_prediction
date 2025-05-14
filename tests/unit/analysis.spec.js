import * as analysisService from '@/services/analysis.js'

describe('健康分析服务', () => {
  // 血糖平均值计算测试
  describe('calculateGlucoseAvg', () => {
    test('应正确计算血糖平均值', () => {
      const records = [
        { glucose: 5.5 },
        { glucose: 6.5 },
        { glucose: 4.5 }
      ]
      expect(analysisService.calculateGlucoseAvg(records)).toBe('5.5')
    })
    
    test('空记录应返回null', () => {
      expect(analysisService.calculateGlucoseAvg([])).toBeNull()
    })
    
    test('无有效血糖记录应返回null', () => {
      const records = [
        { weight: 70 },
        { bloodPressure: '120/80' }
      ]
      expect(analysisService.calculateGlucoseAvg(records)).toBeNull()
    })
  })
  
  // 血糖状态评估测试
  describe('evaluateGlucoseStatus', () => {
    test('正常血糖状态', () => {
      const result = analysisService.evaluateGlucoseStatus('5.5')
      expect(result.status).toBe('normal')
      expect(result.risk).toBe('low')
    })
    
    test('低血糖状态', () => {
      const result = analysisService.evaluateGlucoseStatus('3.5')
      expect(result.status).toBe('low')
      expect(result.risk).toBe('medium')
    })
    
    test('高血糖状态', () => {
      const result = analysisService.evaluateGlucoseStatus('8.0')
      expect(result.status).toBe('high')
      expect(result.risk).toBe('medium')
    })
    
    test('危险血糖状态', () => {
      const result = analysisService.evaluateGlucoseStatus('12.0')
      expect(result.status).toBe('danger')
      expect(result.risk).toBe('high')
    })
  })
  
  // 血压状态评估测试
  describe('evaluateBPStatus', () => {
    test('正常血压状态', () => {
      const result = analysisService.evaluateBPStatus('120/80')
      expect(result.status).toBe('normal')
    })
    
    test('高血压状态', () => {
      const result = analysisService.evaluateBPStatus('150/95')
      expect(result.status).toBe('high')
    })
    
    test('低血压状态', () => {
      const result = analysisService.evaluateBPStatus('85/55')
      expect(result.status).toBe('low')
    })
    
    test('无效血压值处理', () => {
      const result = analysisService.evaluateBPStatus('invalid')
      expect(result.status).toBe('unknown')
    })
  })
  
  // 健康预测测试
  describe('predictTrend', () => {
    test('应根据历史数据预测未来趋势', () => {
      const records = [
        { date: '2023-01-01', glucose: 5.0 },
        { date: '2023-01-02', glucose: 5.5 },
        { date: '2023-01-03', glucose: 6.0 }
      ]
      
      const predictions = analysisService.predictTrend(records, 3)
      expect(predictions).toHaveLength(3)
      expect(predictions[0].value).toBeGreaterThan(6.0)
    })
    
    test('记录不足时应返回空数组', () => {
      const records = [
        { date: '2023-01-01', glucose: 5.0 },
        { date: '2023-01-02', glucose: 5.5 }
      ]
      
      expect(analysisService.predictTrend(records)).toEqual([])
    })
  })
  
  // 健康得分计算测试
  describe('calculateHealthScore', () => {
    test('正常状态应获得高分', () => {
      const score = analysisService.calculateHealthScore('normal', 'normal', 80)
      expect(score).toBeGreaterThanOrEqual(90)
    })
    
    test('危险状态应获得低分', () => {
      const score = analysisService.calculateHealthScore('danger', 'high', 40)
      expect(score).toBeLessThan(70)
    })
  })
}) 