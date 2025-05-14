import api from './auth'

// 更新用户信息
export const updateUserInfo = (data) => {
  return api.post('/user/update', data)
}

// 获取用户健康记录
export const getHealthRecords = (params) => {
  return api.get('/user/health-records', { params })
}

// 添加健康记录
export const addHealthRecord = (data) => {
  return api.post('/user/health-records/add', data)
}

// 删除健康记录
export const deleteHealthRecord = (recordId) => {
  return api.delete(`/user/health-records/${recordId}`)
}

// 更新健康记录
export const updateHealthRecord = (recordId, data) => {
  return api.put(`/user/health-records/${recordId}`, data)
}

// 获取健康指南
export const getHealthGuide = () => {
  return api.get('/user/health-guide')
}

// 提交反馈
export const submitFeedback = (data) => {
  return api.post('/user/feedback', data)
}

// 导出健康数据
export const exportHealthData = (params) => {
  return api.get('/user/health-records/export', { 
    params,
    responseType: 'blob'
  })
} 